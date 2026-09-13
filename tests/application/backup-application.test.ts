import { describe, expect, it, vi } from 'vitest';
import { BackupApplicationError, createBackupApplication } from '@/lib/application/backup-application';
import { BackupRepositoryError, type BackupEnvelope, type BackupRepository } from '@/lib/persistence/backup-repository';
import { createBackupEnvelope, createEmptyBackupFixture } from '../fixtures/backup';

function createDependencies(envelope: BackupEnvelope) {
  const repository: BackupRepository = {
    readAccountSnapshot: vi.fn(async () => structuredClone(envelope)),
    replaceAccountSnapshot: vi.fn(async () => undefined),
  };
  const draftStore = { listRecoverableByAccount: vi.fn(async () => []) };
  const accountContext = {
    getActive: vi.fn(),
    requireActive: vi.fn(async () => ({ accountId: 'local-account', account: envelope.account[0] })),
  };
  return { repository, draftStore, accountContext, application: createBackupApplication({ accountContext, repository, draftStore }) };
}

describe('backup application export', () => {
  it('serializes the consistent confirmed snapshot as UTF-8 JSON with a .nutridiet filename', async () => {
    const envelope = createBackupEnvelope();
    const { application, repository, draftStore } = createDependencies(envelope);

    const result = await application.exportBackup();

    expect(result.fileName).toMatch(/\.nutridiet$/);
    expect(result.envelope).toEqual(envelope);
    expect(JSON.parse(result.content)).toEqual(envelope);
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
  it('validates before writing and rejects a malformed or foreign-account file', async () => {
    const dependencies = createDependencies(createBackupEnvelope());

    await expect(dependencies.application.restoreBackup('{broken', { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_FORMAT_INVALID' });
    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope({ account: [{ ...createBackupEnvelope().account[0], id: 'other-account' }] })), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_APP_MISMATCH' });
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

  it('classifies a transactional repository failure without reporting success', async () => {
    const dependencies = createDependencies(createBackupEnvelope());
    vi.mocked(dependencies.repository.replaceAccountSnapshot).mockRejectedValue(new BackupRepositoryError('BACKUP_RESTORE_FAILED', 'Falha transacional'));

    await expect(dependencies.application.restoreBackup(JSON.stringify(createBackupEnvelope()), { confirmed: true })).rejects.toMatchObject({ code: 'BACKUP_RESTORE_FAILED' });
  });
});
