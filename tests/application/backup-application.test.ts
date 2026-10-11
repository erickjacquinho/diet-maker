import { describe, expect, it, vi } from 'vitest';
import { randomBytes, randomUUID } from 'node:crypto';
import { BackupApplicationError, createBackupApplication, validateBackupEnvelope } from '@/lib/application/backup-application';
import { BackupRepositoryError, type BackupEnvelope, type BackupRepository } from '@/lib/persistence/backup-repository';
import { createBackupEnvelope, createEmptyBackupFixture, createSchema10BackupFixture } from '../fixtures/backup';
import { encodeBindingProof, type ProtectedSaveGrant } from '@/lib/domain/protected-save';
import { createOnlineSaveSession } from '@/lib/application/online-save-session';
import { decryptProtectedSave, encryptProtectedSave } from '@/lib/infrastructure/crypto/protected-save';

function createDependencies(envelope: BackupEnvelope, protectedSave?: {
  session: ReturnType<typeof createOnlineSaveSession>;
  identity: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'>;
  authorizeRestore(): Promise<void>;
}) {
  const repository: BackupRepository = {
    readAccountSnapshot: vi.fn(async () => structuredClone(envelope)),
    replaceAccountSnapshot: vi.fn(async () => undefined),
  };
  const draftStore = {
    listRecoverableByAccount: vi.fn(async () => []),
    removeIfRevision: vi.fn(async () => true),
  };
  const checkpointState = { workspaceRevision: 0, checkpointRevision: 0 };
  const savePendingCheckpoint = vi.fn(async () => {
    checkpointState.checkpointRevision = checkpointState.workspaceRevision;
  });
  const accountContext = {
    getActive: vi.fn(),
    requireActive: vi.fn(async () => ({ accountId: 'local-account', account: envelope.account[0] })),
  };
  return {
    repository,
    draftStore,
    accountContext,
    checkpointState,
    savePendingCheckpoint,
    application: createBackupApplication({
      accountContext,
      repository,
      draftStore,
      getCheckpointState: async () => ({ ...checkpointState }),
      savePendingCheckpoint,
      ...(protectedSave ? { protectedSave } : {}),
    }),
  };
}

describe('backup application export', () => {
  it('serializes the consistent confirmed snapshot as UTF-8 JSON with a .nutridiet filename', async () => {
    const envelope = createBackupEnvelope();
    const { application, repository, draftStore } = createDependencies(envelope);

    const result = await application.exportBackup();

    expect(result.fileName).toMatch(/\.nutridiet$/);
    const migrated = validateBackupEnvelope(envelope, { accountId: 'local-account' });
    expect(result.envelope).toEqual(migrated);
    expect(JSON.parse(result.content)).toEqual(migrated);
    expect(result.content).toContain('Consultório de Teste');
    expect(repository.readAccountSnapshot).toHaveBeenCalledWith('local-account');
    expect(draftStore.listRecoverableByAccount).not.toHaveBeenCalled();
  });

  it('serializes empty confirmed collections without adding defaults or draft content', async () => {
    const envelope = createBackupEnvelope(createEmptyBackupFixture());
    const { application } = createDependencies(envelope);

    const result = await application.exportBackup();

    expect(JSON.parse(result.content)).toMatchObject({ patients: [], dietPlans: [], recipes: [], readyMeals: [] });
    expect(result.content).not.toContain('draft');
  });

  it('reports export failure without presenting a completed backup', async () => {
    const envelope = createBackupEnvelope();
    const dependencies = createDependencies(envelope);
    vi.mocked(dependencies.repository.readAccountSnapshot).mockRejectedValue(new BackupRepositoryError('BACKUP_EXPORT_FAILED', 'Falha de captura'));

    await expect(dependencies.application.exportBackup()).rejects.toMatchObject({ code: 'BACKUP_EXPORT_FAILED' });
  });
});

describe('backup application restore', () => {
  it('migrates and restores schema 10 recipes as portion yields without changing the input save', async () => {
    const previous = createSchema10BackupFixture();
    const serialized = JSON.stringify(previous);
    const dependencies = createDependencies(createBackupEnvelope());

    await dependencies.application.restoreBackup(serialized, { confirmed: true });

    const restored = vi.mocked(dependencies.repository.replaceAccountSnapshot).mock.calls[0]?.[1];
    expect(restored).toMatchObject({
      schemaVersion: '11',
      recipes: [{ yieldPortions: '2', yieldUnit: 'PORTION', preparedWeightGrams: '300' }],
    });
    expect(JSON.parse(serialized).recipes[0]).not.toHaveProperty('yieldUnit');
  });

  it('validates before writing and rejects a malformed or foreign-account file', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    const incompatible = { ...createBackupEnvelope(), schemaVersion: '99' };

    await expect(dependencies.application.restoreBackup('{broken', { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_FORMAT_INVALID' });
    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope({ account: [{ ...createBackupEnvelope().account[0], id: 'other-account' }] })), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_APP_MISMATCH' });
    await expect(dependencies.application.restoreBackup(JSON.stringify(incompatible), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_VERSION_UNSUPPORTED' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
  });

  it('rejects duplicate IDs, orphan relations and duplicate active diets before writing', async () => {
    const base = createBackupEnvelope();
    const duplicatePatients = createBackupEnvelope({
      patients: [base.patients[0], base.patients[0]],
    });
    const orphanPlan = createBackupEnvelope({
      dietPlans: [{ ...base.dietPlans[0], patientId: 'patient-missing' }],
    });
    const duplicateActiveDiet = createBackupEnvelope({
      dietPlans: [...base.dietPlans, { ...base.dietPlans[0], id: 'diet-active-duplicate' }],
    });

    for (const candidate of [duplicatePatients, orphanPlan, duplicateActiveDiet]) {
      const dependencies = createDependencies(candidate);
      await expect(dependencies.application.restoreBackup(JSON.stringify(candidate), { confirmed: true })).rejects.toMatchObject({
        code: 'BACKUP_RELATION_INVALID',
      });
      expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
    }
  });

  it('keeps the base unchanged when the user cancels after validation', async () => {
    const dependencies = createDependencies(createBackupEnvelope());

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: false })).rejects.toMatchObject({ code: 'BACKUP_CANCELLED' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
  });

  it('blocks restore when an editable draft exists and writes only after explicit confirmation', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    vi.mocked(dependencies.draftStore.listRecoverableByAccount).mockResolvedValue([{ draftId: 'draft-pending' } as never]);

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_PENDING_EDITS' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();

    vi.mocked(dependencies.draftStore.listRecoverableByAccount).mockResolvedValue([]);
    await dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true });
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledWith('local-account', expect.objectContaining({ appId: 'nutridiet-local-pro' }));
  });

  it('discards editable drafts only after an explicit, revision-safe choice', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    const draft = { draftId: 'draft-pending', draftRevision: 4 } as never;
    vi.mocked(dependencies.draftStore.listRecoverableByAccount).mockResolvedValueOnce([draft]);

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_PENDING_EDITS' });
    expect(dependencies.draftStore.removeIfRevision).not.toHaveBeenCalled();

    vi.mocked(dependencies.draftStore.listRecoverableByAccount).mockResolvedValueOnce([draft]).mockResolvedValueOnce([]);
    await dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true, discardDrafts: true });
    expect(dependencies.draftStore.removeIfRevision).toHaveBeenCalledWith('draft-pending', 4);
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledTimes(1);
  });

  it('requires an explicit save or discard choice for a pending checkpoint', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    dependencies.checkpointState.workspaceRevision = 3;
    dependencies.checkpointState.checkpointRevision = 1;

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_PENDING_CHECKPOINT' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();

    await dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true, pendingChanges: 'save' });
    expect(dependencies.savePendingCheckpoint).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledTimes(1);
  });

  it('lets the user discard a pending checkpoint without saving it first', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    dependencies.checkpointState.workspaceRevision = 2;
    dependencies.checkpointState.checkpointRevision = 0;

    await dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true, pendingChanges: 'discard' });

    expect(dependencies.savePendingCheckpoint).not.toHaveBeenCalled();
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledTimes(1);
  });

  it('classifies a transactional repository failure without reporting success', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    vi.mocked(dependencies.repository.replaceAccountSnapshot).mockRejectedValue(new BackupRepositoryError('BACKUP_RESTORE_FAILED', 'Falha transacional'));

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_RESTORE_FAILED' });
  });
});

describe('protected backup application', () => {
  it('requires fresh online authorization before restore and preserves the base on refusal', async () => {
    const grant = await createBackupGrant();
    const access = await createProtectedBackupAccess(grant, true);
    const dependencies = createDependencies(createBackupEnvelope(), access);
    const serialized = await encryptProtectedSave(createBackupEnvelope(), grant);
    access.authorizeRestore.mockRejectedValueOnce(new Error('offline'));
    await expect(dependencies.application.restoreBackup(serialized, { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_AUTH_REQUIRED' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
    await dependencies.application.restoreBackup(serialized, { confirmed: true });
    expect(access.authorizeRestore).toHaveBeenCalledTimes(2);
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledOnce();
  });
  it('exports encrypted content with the current save identity and key', async () => {
    const envelope = createBackupEnvelope({ patients: [{ ...createBackupEnvelope().patients[0], name: 'Paciente privado' }] });
    const grant = await createBackupGrant();
    const access = await createProtectedBackupAccess(grant, true);
    const { application } = createDependencies(envelope, access);

    const result = await application.exportBackup();

    expect(result.content).not.toContain('Paciente privado');
    await expect(decryptProtectedSave(result.content, grant)).resolves.toEqual(validateBackupEnvelope(envelope, { accountId: 'local-account' }));
  });

  it('refuses direct export, validation, and restore calls while the save grant is locked', async () => {
    const envelope = createBackupEnvelope();
    const grant = await createBackupGrant();
    const serialized = await encryptProtectedSave(envelope, grant);
    const access = await createProtectedBackupAccess(grant, false);
    const dependencies = createDependencies(createBackupEnvelope(), access);

    await expect(dependencies.application.exportBackup()).rejects.toMatchObject({ code: 'BACKUP_AUTH_REQUIRED' });
    await expect(dependencies.application.validateBackup(serialized)).rejects.toMatchObject({ code: 'BACKUP_AUTH_REQUIRED' });
    await expect(dependencies.application.restoreBackup(serialized, { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_AUTH_REQUIRED' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
  });

  it('rejects plaintext and another save identity before repository mutation', async () => {
    const grant = await createBackupGrant();
    const access = await createProtectedBackupAccess(grant, true);
    const dependencies = createDependencies(createBackupEnvelope(), access);

    await expect(dependencies.application.validateBackup(JSON.stringify(createBackupEnvelope())))
      .rejects.toMatchObject({ code: 'BACKUP_FORMAT_INVALID' });
    const otherGrant = await createBackupGrant();
    const foreign = await encryptProtectedSave(createBackupEnvelope(), otherGrant);
    await expect(dependencies.application.restoreBackup(foreign, { confirmed: true }))
      .rejects.toMatchObject({ code: 'BACKUP_APP_MISMATCH' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
  });

  it('requires explicit confirmation and restores only authenticated ciphertext for the same save', async () => {
    const envelope = createBackupEnvelope({ favorites: ['saved-favorite'] });
    const grant = await createBackupGrant();
    const serialized = await encryptProtectedSave(envelope, grant);
    const access = await createProtectedBackupAccess(grant, true);
    const dependencies = createDependencies(createBackupEnvelope(), access);

    await expect(dependencies.application.restoreBackup(serialized, { confirmed: false }))
      .rejects.toMatchObject({ code: 'BACKUP_CANCELLED' });
    expect(dependencies.repository.replaceAccountSnapshot).not.toHaveBeenCalled();
    await dependencies.application.restoreBackup(serialized, { confirmed: true });
    expect(dependencies.repository.replaceAccountSnapshot).toHaveBeenCalledWith('local-account', expect.objectContaining({ favorites: ['saved-favorite'] }));
  });
});

async function createBackupGrant(): Promise<ProtectedSaveGrant> {
  const raw = randomBytes(32);
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  raw.fill(0);
  const authorizedAt = Date.now();
  return {
    ownerId: randomUUID(),
    saveId: randomUUID(),
    localAccountId: 'local-account',
    keyId: randomUUID(),
    bindingProof: encodeBindingProof('backup-test-v1', Buffer.alloc(32, 0x6a).toString('base64url')),
    authorizedAt,
    expiresAt: authorizedAt + 8 * 60 * 60 * 1000,
    key,
  };
}

async function createProtectedBackupAccess(grant: ProtectedSaveGrant, active: boolean) {
  const session = createOnlineSaveSession({ isOnline: () => true });
  if (active) await session.authorize(grant);
  return {
    session,
    authorizeRestore: vi.fn(async () => undefined),
    identity: {
      ownerId: grant.ownerId,
      saveId: grant.saveId,
      localAccountId: grant.localAccountId,
      keyId: grant.keyId,
      bindingProof: grant.bindingProof,
    },
  };
}
