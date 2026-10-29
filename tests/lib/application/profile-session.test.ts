// @vitest-environment node

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

import { createBackupEnvelope, createEmptyBackupFixture } from '../../fixtures/backup';
import {
  createProfileSession,
  type ProfileSessionRuntime,
  type SaveFile,
  type ProfileSessionDependencies,
} from '@/lib/application/profile-session';
import type { Account } from '@/lib/domain/account';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import type { PendingSaveRegistration, SaveFilePort } from '@/lib/persistence/save-file';
import { encodeBindingProof, parseProtectedSaveEnvelope, type ProtectedSaveGrant } from '@/lib/domain/protected-save';
import { decryptProtectedSave, encryptProtectedSave } from '@/lib/infrastructure/crypto/protected-save';
import { createOnlineSaveSession } from '@/lib/application/online-save-session';
import { createSchema10BackupFixture } from '../../fixtures/backup';

interface FakeRuntime extends ProfileSessionRuntime {
  readonly runtimeId: string;
  readonly checkpointState: { workspaceRevision: number; checkpointRevision: number };
  getCheckpointState(): Promise<{ workspaceRevision: number; checkpointRevision: number }>;
  markWorkspaceDirty(): Promise<void>;
  advanceCheckpoint(revision: number): Promise<void>;
  imported?: BackupEnvelope;
}

interface FakeFile extends SaveFile {
  content: string;
}

function createFilePort(file: FakeFile | null = null): SaveFilePort & {
  existing: FakeFile | null;
  created: FakeFile | null;
} {
  const port: SaveFilePort & { existing: FakeFile | null; created: FakeFile | null } = {
    existing: file,
    created: file,
    chooseExisting: vi.fn(async () => port.existing),
    chooseNew: vi.fn(async () => port.created),
    read: vi.fn(async (selected) => selected.content),
    requestWritePermission: vi.fn(async () => 'granted' as const),
    write: vi.fn(async (selected, content) => { selected.content = content; }),
  };
  return port;
}

function createDependencies(filePort: SaveFilePort): ProfileSessionDependencies<FakeRuntime> & {
  createRuntime: ReturnType<typeof vi.fn>;
  importSnapshot: ReturnType<typeof vi.fn>;
  exportSnapshot: ReturnType<typeof vi.fn>;
  disposeRuntime: ReturnType<typeof vi.fn>;
} {
  let runtimeNumber = 0;
  const dependencies = {
    filePort,
    now: () => '2026-09-12T12:00:00.000Z',
    idFactory: () => `account-${++runtimeNumber}`,
    createRuntime: vi.fn(async (account: Account): Promise<FakeRuntime> => {
      const checkpointState = { workspaceRevision: 0, checkpointRevision: 0 };
      return {
        account,
        runtimeId: `runtime-${++runtimeNumber}`,
        checkpointState,
        getCheckpointState: async () => ({ ...checkpointState }),
        markWorkspaceDirty: async () => { checkpointState.workspaceRevision += 1; },
        advanceCheckpoint: async (revision) => { checkpointState.checkpointRevision = Math.max(checkpointState.checkpointRevision, revision); },
      };
    }),
    importSnapshot: vi.fn(async (runtime: FakeRuntime, envelope: BackupEnvelope) => { runtime.imported = envelope; }),
    exportSnapshot: vi.fn(async (runtime: FakeRuntime) => createBackupEnvelope({
      ...createEmptyBackupFixture(),
      account: [{ ...createBackupEnvelope().account[0], ...runtime.account }],
    })),
    disposeRuntime: vi.fn(async () => undefined),
  } satisfies ProfileSessionDependencies<FakeRuntime>;
  return dependencies as ProfileSessionDependencies<FakeRuntime> & {
    createRuntime: ReturnType<typeof vi.fn>;
    importSnapshot: ReturnType<typeof vi.fn>;
    exportSnapshot: ReturnType<typeof vi.fn>;
    disposeRuntime: ReturnType<typeof vi.fn>;
  };
}

function createSession(filePort: SaveFilePort) {
  const dependencies = createDependencies(filePort);
  return { session: createProfileSession(dependencies), dependencies };
}

describe('profile session', () => {
  it('starts empty, creates a profile and writes the first envelope before becoming active', async () => {
    const file: FakeFile = { name: 'new-profile.nutridiet', content: '' };
    const filePort = createFilePort(file);
    const { session, dependencies } = createSession(filePort);

    expect(session.getSnapshot()).toMatchObject({ status: 'empty', syncState: 'unbound', runtime: null });

    await session.createProfile({ displayName: '  Jacques   Regiani ', phone: ' 11 99999-0000 ' });

    expect(dependencies.createRuntime).toHaveBeenCalledTimes(1);
    expect(filePort.write).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot()).toMatchObject({
      status: 'active',
      syncState: 'synced',
      account: { displayName: 'Jacques Regiani', phone: '11 99999-0000' },
      fileName: 'new-profile.nutridiet',
    });
    expect(JSON.parse(file.content).account[0]).toMatchObject({ displayName: 'Jacques Regiani', phone: '11 99999-0000' });
  });

  it('keeps an empty session when the first file chooser is cancelled or permission is denied', async () => {
    const cancelledPort = createFilePort(null);
    const cancelled = createSession(cancelledPort);
    await cancelled.session.createProfile({ displayName: 'Jacques Regiani' });
    expect(cancelled.session.getSnapshot()).toMatchObject({ status: 'empty', syncState: 'unbound', runtime: null });
    expect(cancelled.dependencies.createRuntime).not.toHaveBeenCalled();

    const deniedFile: FakeFile = { name: 'denied.nutridiet', content: '' };
    const deniedPort = createFilePort(deniedFile);
    vi.mocked(deniedPort.requestWritePermission).mockResolvedValue('denied');
    const denied = createSession(deniedPort);
    await expect(denied.session.createProfile({ displayName: 'Jacques Regiani' })).rejects.toMatchObject({ code: 'SAVE_PERMISSION_DENIED' });
    expect(denied.session.getSnapshot()).toMatchObject({ status: 'empty', syncState: 'unbound', runtime: null });
    expect(deniedPort.write).not.toHaveBeenCalled();
    expect(denied.dependencies.disposeRuntime).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty name without opening the chooser', async () => {
    const filePort = createFilePort({ name: 'unused.nutridiet', content: '' });
    const { session } = createSession(filePort);

    await expect(session.createProfile({ displayName: '   ' })).rejects.toMatchObject({ code: 'PROFILE_NAME_REQUIRED' });
    expect(filePort.chooseNew).not.toHaveBeenCalled();
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', syncState: 'unbound' });
  });

  it('exposes busy and prevents a concurrent command', async () => {
    const file: FakeFile = { name: 'busy.nutridiet', content: '' };
    const filePort = createFilePort(file);
    let release!: (selected: FakeFile) => void;
    vi.mocked(filePort.chooseNew).mockImplementationOnce(() => new Promise((resolve) => { release = resolve; }));
    const { session } = createSession(filePort);

    const first = session.createProfile({ displayName: 'Jacques Regiani' });
    expect(session.getSnapshot().status).toBe('busy');
    await expect(session.createProfile({ displayName: 'Outra Pessoa' })).rejects.toMatchObject({ code: 'SESSION_BUSY' });
    release(file);
    await first;
    expect(session.getSnapshot().status).toBe('active');
  });

  it('loads a valid profile atomically and preserves the previous session on invalid input or cancellation', async () => {
    const currentFile: FakeFile = { name: 'current.nutridiet', content: '' };
    const filePort = createFilePort(currentFile);
    const { session, dependencies } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    const previousRuntime = session.getSnapshot().runtime;

    const invalidFile: FakeFile = { name: 'invalid.nutridiet', content: '{invalid' };
    filePort.existing = invalidFile;
    await expect(session.loadProfile()).rejects.toMatchObject({ code: 'LOAD_INVALID' });
    expect(session.getSnapshot().runtime).toBe(previousRuntime);
    expect(session.getSnapshot().account?.displayName).toBe('Sessão Atual');
    expect(dependencies.createRuntime).toHaveBeenCalledTimes(1);

    filePort.existing = null;
    await session.loadProfile();
    expect(session.getSnapshot().runtime).toBe(previousRuntime);
    expect(session.getSnapshot().status).toBe('active');
  });

  it('keeps a loaded session usable but paused when write permission is unavailable', async () => {
    const envelope = {
      ...createBackupEnvelope({ account: [{ ...createBackupEnvelope().account[0], id: 'loaded-account', displayName: 'Jacques Regiani' }] }),
      ...createEmptyBackupFixture(),
      account: [{ ...createBackupEnvelope().account[0], id: 'loaded-account', displayName: 'Jacques Regiani' }],
    };
    const file: FakeFile = { name: 'loaded.nutridiet', content: JSON.stringify(envelope) };
    const filePort = createFilePort(file);
    vi.mocked(filePort.requestWritePermission).mockResolvedValue('denied');
    const { session, dependencies } = createSession(filePort);

    await session.loadProfile();

    expect(dependencies.importSnapshot).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot()).toMatchObject({ status: 'paused', syncState: 'paused', account: { displayName: 'Jacques Regiani' } });
  });

  it('loads a legacy save and rewrites the current schema on the next sync', async () => {
    const legacy = createBackupEnvelope();
    const file: FakeFile = { name: 'legacy.nutridiet', content: JSON.stringify(legacy) };
    const filePort = createFilePort(file);
    const { session } = createSession(filePort);

    await session.loadProfile();
    expect(JSON.parse(file.content).schemaVersion).toBe('4');

    await session.sync();

    expect(JSON.parse(file.content)).toMatchObject({ schemaVersion: '11', account: [{ phone: null }] });
  });

  it('does not request permission or rewrite a clean checkpoint', async () => {
    const filePort = createFilePort({ name: 'clean.nutridiet', content: '' });
    const { session, dependencies } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    vi.clearAllMocks();

    await session.sync();

    expect(filePort.requestWritePermission).not.toHaveBeenCalled();
    expect(dependencies.exportSnapshot).not.toHaveBeenCalled();
    expect(filePort.write).not.toHaveBeenCalled();
  });

  it('writes a dirty revision and advances the checkpoint only after success', async () => {
    const filePort = createFilePort({ name: 'dirty.nutridiet', content: '' });
    const { session } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    const runtime = session.getSnapshot().runtime!;
    await runtime.markWorkspaceDirty();

    await session.sync();

    expect(runtime.checkpointState).toEqual({ workspaceRevision: 1, checkpointRevision: 1 });
    expect(filePort.write).toHaveBeenCalledTimes(2);
  });

  it('marks an active session paused and preserves it when synchronization write fails', async () => {
    const file: FakeFile = { name: 'write-fails.nutridiet', content: '' };
    const filePort = createFilePort(file);
    const { session } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    const runtime = session.getSnapshot().runtime!;
    await runtime.markWorkspaceDirty();
    vi.mocked(filePort.write).mockRejectedValueOnce(new Error('permission revoked'));

    await expect(session.sync()).rejects.toThrow('permission revoked');
    expect(session.getSnapshot()).toMatchObject({ status: 'paused', syncState: 'paused', account: { displayName: 'Sessão Atual' } });
    expect(runtime.checkpointState).toEqual({ workspaceRevision: 1, checkpointRevision: 0 });
    await session.sync();
    expect(runtime.checkpointState).toEqual({ workspaceRevision: 1, checkpointRevision: 1 });
  });

  it('keeps a mutation made during a checkpoint pending', async () => {
    const filePort = createFilePort({ name: 'racing.nutridiet', content: '' });
    const { session } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    const runtime = session.getSnapshot().runtime!;
    await runtime.markWorkspaceDirty();
    vi.mocked(filePort.write).mockImplementationOnce(async () => { await runtime.markWorkspaceDirty(); });

    await session.sync();

    expect(runtime.checkpointState).toEqual({ workspaceRevision: 2, checkpointRevision: 1 });
    expect(session.getSnapshot()).toMatchObject({ status: 'active', syncState: 'pending' });
  });

  it('shares one in-flight checkpoint across simultaneous triggers', async () => {
    const filePort = createFilePort({ name: 'shared.nutridiet', content: '' });
    const { session, dependencies } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    await session.getSnapshot().runtime!.markWorkspaceDirty();
    vi.clearAllMocks();
    let release!: () => void;
    vi.mocked(filePort.write).mockImplementationOnce(() => new Promise<void>((resolve) => { release = resolve; }));

    const first = session.sync();
    const second = session.sync();
    await vi.waitFor(() => expect(filePort.write).toHaveBeenCalledTimes(1));
    release();
    await Promise.all([first, second]);

    expect(filePort.requestWritePermission).toHaveBeenCalledTimes(1);
    expect(dependencies.exportSnapshot).toHaveBeenCalledTimes(1);
    expect(filePort.write).toHaveBeenCalledTimes(1);
  });

  it('synchronizes the associated handle in commit-export-write order without reopening a chooser', async () => {
    const file: FakeFile = { name: 'ordered.nutridiet', content: '' };
    const filePort = createFilePort(file);
    const { session, dependencies } = createSession(filePort);
    await session.createProfile({ displayName: 'Sessão Atual' });
    await session.getSnapshot().runtime!.markWorkspaceDirty();
    vi.clearAllMocks();

    const order: string[] = [];
    vi.mocked(dependencies.exportSnapshot).mockImplementation(async (runtime) => {
      order.push(`export:${runtime.account.displayName}`);
      return createBackupEnvelope({ ...createEmptyBackupFixture(), account: [{ ...createBackupEnvelope().account[0], ...runtime.account }] });
    });
    vi.mocked(filePort.requestWritePermission).mockImplementation(async () => {
      order.push('permission');
      return 'granted';
    });
    vi.mocked(filePort.write).mockImplementation(async (_selected, content) => {
      order.push('write');
      file.content = content;
    });

    await session.sync();

    expect(filePort.chooseExisting).not.toHaveBeenCalled();
    expect(order).toEqual(['permission', 'export:Sessão Atual', 'write']);
    expect(session.getSnapshot()).toMatchObject({ status: 'active', syncState: 'synced' });
  });
});

describe('online protected profile session', () => {
  it('authorizes before creating PGlite and writes and verifies an encrypted initial copy', async () => {
    const order: string[] = [];
    const file = { name: 'new-protected.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file, order);
    const ownerId = randomUUID();
    const grant = await createOnlineGrant('account-1', { ownerId });
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant, order);
    const runtimeImplementation = dependencies.createRuntime.getMockImplementation() as (account: Account) => Promise<FakeRuntime>;
    dependencies.createRuntime.mockImplementation(async (account) => {
      order.push('runtime');
      return runtimeImplementation(account);
    });
    const session = createProfileSession(dependencies);

    await session.createProfile({ displayName: 'Consultório protegido' });

    expect(order.indexOf('authorize')).toBeLessThan(order.indexOf('runtime'));
    expect(dependencies.createRuntime).toHaveBeenCalledWith(expect.objectContaining({ id: 'account-1' }), {
      ownerId,
      saveId: grant.saveId,
      localAccountId: 'account-1',
      keyId: grant.keyId,
      bindingProof: grant.bindingProof,
    });
    const envelope = parseProtectedSaveEnvelope(JSON.parse(file.content));
    expect(envelope).toMatchObject({ formatVersion: 2, saveId: grant.saveId, bindingProof: grant.bindingProof });
    expect(file.content).not.toContain('Consultório protegido');
    await expect(decryptProtectedSave(file.content, grant)).resolves.toMatchObject({
      schemaVersion: '11',
      account: [{ id: 'account-1', displayName: 'Consultório protegido' }],
    });
    expect(filePort.persistFileAssociation).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId, saveId: grant.saveId, localAccountId: 'account-1' }),
      file,
      expect.objectContaining({ bindingProof: grant.bindingProof }),
    );
    expect(session.getSnapshot().status).toBe('active');
    expect(onlineSave.session.getSnapshot().status).toBe('active');
  });

  it('validates and migrates a schema-10 legacy file before any runtime, then writes a protected copy without changing the source', async () => {
    const sourceEnvelope = createSchema10BackupFixture();
    const source = { name: 'legacy.nutridiet', content: JSON.stringify(sourceEnvelope) };
    const target = { name: 'legacy-protected.nutridiet', content: '' };
    const originalBytes = source.content;
    const originalHash = createHash('sha256').update(originalBytes).digest('hex');
    const filePort = createOnlineFilePort(target);
    filePort.existing = source;
    const ownerId = randomUUID();
    const grant = await createOnlineGrant(sourceEnvelope.account[0].id, { ownerId });
    const { dependencies } = createOnlineDependencies(filePort, grant);
    const session = createProfileSession(dependencies);

    await session.loadProfile();
    expect(session.getSnapshot()).toMatchObject({ protectedCopyRequired: true, status: 'empty', runtime: null });
    expect(dependencies.createRuntime).not.toHaveBeenCalled();
    await session.adoptLegacyProfile();

    expect(source.content).toBe(originalBytes);
    expect(createHash('sha256').update(source.content).digest('hex')).toBe(originalHash);
    expect(JSON.parse(source.content)).toEqual(sourceEnvelope);
    expect(session.getSnapshot()).toMatchObject({ status: 'active', accountId: sourceEnvelope.account[0].id });
    const protectedCopy = parseProtectedSaveEnvelope(JSON.parse(target.content));
    expect(protectedCopy.saveId).toBe(grant.saveId);
    await expect(decryptProtectedSave(target.content, grant)).resolves.toMatchObject({
      schemaVersion: '11',
      account: [{ id: sourceEnvelope.account[0].id }],
    });
    expect(filePort.isSameEntry).toHaveBeenCalledWith(source, target);
  });

  it('retries a failed first write with the same local ID, idempotency key, and DEK', async () => {
    const order: string[] = [];
    const file = { name: 'retry-protected.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file, order);
    const ownerId = randomUUID();
    const grant = await createOnlineGrant('account-1', { ownerId });
    const { dependencies, registeredInputs } = createOnlineDependencies(filePort, grant, order);
    vi.mocked(filePort.write).mockRejectedValueOnce(new Error('destination unavailable'));
    const session = createProfileSession(dependencies);

    await expect(session.createProfile({ displayName: 'Retomar o save' })).rejects.toMatchObject({ code: 'SAVE_WRITE_FAILED' });
    const pending = await filePort.restorePendingRegistration!(ownerId, 'account-1');
    expect(pending).toMatchObject({ localAccountId: 'account-1', idempotencyKey: expect.any(String) });

    await session.resumePendingProfile('account-1', { displayName: 'Retomar o save' });

    expect(registeredInputs).toHaveLength(2);
    expect(registeredInputs[1]).toEqual(registeredInputs[0]);
    expect(parseProtectedSaveEnvelope(JSON.parse(file.content)).saveId).toBe(grant.saveId);
    await expect(decryptProtectedSave(file.content, grant)).resolves.toMatchObject({ account: [{ id: 'account-1' }] });
    expect(session.getSnapshot().status).toBe('active');
  });

  it('does not create a local runtime when online identity resolution fails', async () => {
    const file = { name: 'offline.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-1');
    const { dependencies } = createOnlineDependencies(filePort, grant);
    dependencies.onlineSave!.getCurrentOwnerId = vi.fn(async () => { throw new Error('auth unavailable'); });
    const session = createProfileSession(dependencies);

    await expect(session.createProfile({ displayName: 'Sem rede' })).rejects.toMatchObject({ code: 'SAVE_WRITE_FAILED' });
    expect(dependencies.createRuntime).not.toHaveBeenCalled();
    expect(filePort.write).not.toHaveBeenCalled();
  });

  it('opens only the locally associated save after matching and authorizing its protected envelope', async () => {
    const file = { name: 'exact-save.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const accessOrder: string[] = [];
    vi.mocked(filePort.requestWritePermission).mockImplementation(async () => {
      accessOrder.push('permission');
      return 'granted';
    });
    vi.mocked(filePort.read).mockImplementation(async (selected) => {
      accessOrder.push('read');
      return (selected as FakeFile).content;
    });
    const grant = await createOnlineGrant('account-open');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const backup = createBackupEnvelope({
      ...createEmptyBackupFixture(),
      account: [{ ...createBackupEnvelope().account[0], id: grant.localAccountId, displayName: 'Save encontrado' }],
    });
    file.content = await encryptProtectedSave(backup, grant);
    await filePort.persistFileAssociation!(
      { ownerId: grant.ownerId, saveId: grant.saveId },
      file,
      { localAccountId: grant.localAccountId, bindingProof: grant.bindingProof },
    );
    const association = await filePort.restoreFileAssociation!({ ownerId: grant.ownerId, saveId: grant.saveId });
    vi.mocked(onlineSave.getCurrentOwnerId).mockImplementation(async () => {
      accessOrder.push('owner');
      return grant.ownerId;
    });
    const session = createProfileSession(dependencies);

    await session.openSave(grant.saveId, association ?? undefined);

    expect(accessOrder.slice(0, 3)).toEqual(['permission', 'owner', 'read']);
    expect(onlineSave.authorizeSave).toHaveBeenCalledWith(grant.saveId, grant.bindingProof);
    expect(session.getSnapshot()).toMatchObject({ status: 'paused', syncState: 'paused', accountId: grant.localAccountId, fileName: file.name });
  });

  it('locates a row only with a protected file whose embedded save ID matches the requested row', async () => {
    const file = { name: 'different-save.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-other');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const backup = createBackupEnvelope({
      ...createEmptyBackupFixture(),
      account: [{ ...createBackupEnvelope().account[0], id: grant.localAccountId }],
    });
    file.content = await encryptProtectedSave(backup, grant);
    filePort.existing = file;
    const session = createProfileSession(dependencies);

    await expect(session.locateSave(randomUUID())).rejects.toMatchObject({ code: 'LOAD_INVALID' });
    expect(onlineSave.authorizeSave).not.toHaveBeenCalled();
    expect(filePort.persistFileAssociation).not.toHaveBeenCalled();
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', runtime: null });
  });

  it('refuses to open a catalog row with no local association', async () => {
    const filePort = createOnlineFilePort(null);
    const grant = await createOnlineGrant('account-missing');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const session = createProfileSession(dependencies);

    await expect(session.openSave(grant.saveId)).rejects.toMatchObject({ code: 'SAVE_NOT_LOCATED' });
    expect(onlineSave.authorizeSave).not.toHaveBeenCalled();
    expect(dependencies.createRuntime).not.toHaveBeenCalled();
  });

  it('relinks the selected protected file to its existing catalog save without registering or replacing its key', async () => {
    const file = { name: 'same-name.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-relink');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const backup = createBackupEnvelope({
      ...createEmptyBackupFixture(),
      account: [{ ...createBackupEnvelope().account[0], id: grant.localAccountId }],
    });
    file.content = await encryptProtectedSave(backup, grant);
    filePort.existing = file;
    const session = createProfileSession(dependencies);

    await session.locateSave(grant.saveId);

    expect(onlineSave.registerSave).not.toHaveBeenCalled();
    expect(onlineSave.authorizeSave).toHaveBeenCalledWith(grant.saveId, grant.bindingProof);
    expect(filePort.persistFileAssociation).toHaveBeenCalledWith(
      expect.objectContaining({ saveId: grant.saveId, keyId: grant.keyId, bindingProof: grant.bindingProof }),
      file,
      expect.objectContaining({ localAccountId: grant.localAccountId, bindingProof: grant.bindingProof }),
    );
  });

  it('reports a lost file permission without treating it as a missing save or granting access', async () => {
    const file = { name: 'permission-required.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-permission');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    await filePort.persistFileAssociation!(
      { ownerId: grant.ownerId, saveId: grant.saveId },
      file,
      { localAccountId: grant.localAccountId, bindingProof: grant.bindingProof },
    );
    vi.mocked(filePort.read).mockRejectedValueOnce(new DOMException('Permission required', 'NotAllowedError'));
    const session = createProfileSession(dependencies);

    await expect(session.openSave(grant.saveId)).rejects.toMatchObject({ code: 'SAVE_PERMISSION_DENIED' });
    expect(onlineSave.authorizeSave).not.toHaveBeenCalled();
    expect(dependencies.createRuntime).not.toHaveBeenCalled();
  });

  it('flushes registered local drafts before logout disposes the runtime', async () => {
    const file = { name: 'logout-flush.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-1');
    const { dependencies } = createOnlineDependencies(filePort, grant);
    const session = createProfileSession(dependencies);
    await session.createProfile({ displayName: 'Preservar antes de sair' });
    const flushDraft = vi.fn(async () => undefined);
    session.registerPendingDraftFlush(flushDraft);

    await session.signOut();

    expect(flushDraft).toHaveBeenCalledOnce();
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', runtime: null, account: null });
    expect(dependencies.disposeRuntime).toHaveBeenCalledOnce();
  });

  it('keeps a failed draft flush locked and mounted for retry instead of disposing the runtime', async () => {
    const file = { name: 'logout-retry.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-1');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const session = createProfileSession(dependencies);
    await session.createProfile({ displayName: 'Rascunho preservado' });
    const flushDraft = vi.fn(async () => undefined);
    flushDraft.mockRejectedValueOnce(new Error('IndexedDB indisponível'));
    const unregister = session.registerPendingDraftFlush(flushDraft);

    await expect(session.signOut()).rejects.toMatchObject({ code: 'DRAFT_PRESERVATION_FAILED' });
    unregister();
    expect(session.getSnapshot()).toMatchObject({ status: 'locked', runtime: expect.any(Object) });
    expect(session.isSaveAuthorized()).toBe(false);
    expect(onlineSave.session.getSnapshot().status).toBe('locked');
    expect(dependencies.disposeRuntime).not.toHaveBeenCalled();

    await session.retryLockedSave();

    expect(flushDraft).toHaveBeenCalledTimes(2);
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', runtime: null });
    expect(dependencies.disposeRuntime).toHaveBeenCalledOnce();
  });

  it('locks on an online deadline event, waits for draft preservation, then closes the workspace', async () => {
    const file = { name: 'deadline-flush.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file);
    const grant = await createOnlineGrant('account-1');
    const { dependencies, onlineSave } = createOnlineDependencies(filePort, grant);
    const session = createProfileSession(dependencies);
    await session.createProfile({ displayName: 'Fim da autorização' });
    let beginFlush!: () => void;
    let finishFlush!: () => void;
    const flushStarted = new Promise<void>((resolve) => { beginFlush = resolve; });
    session.registerPendingDraftFlush(() => new Promise<void>((resolve) => { finishFlush = resolve; beginFlush(); }));

    onlineSave.session.lock();

    expect(session.getSnapshot()).toMatchObject({ status: 'locked', runtime: expect.any(Object) });
    expect(session.isSaveAuthorized()).toBe(false);
    expect(dependencies.disposeRuntime).not.toHaveBeenCalled();
    await flushStarted;
    const preservation = session.retryLockedSave();
    finishFlush();
    await preservation;

    expect(session.getSnapshot()).toMatchObject({ status: 'empty', runtime: null });
    expect(dependencies.disposeRuntime).toHaveBeenCalledOnce();
  });
});

describe('profile session details', () => {
  const withAccountUpdates = (filePort: SaveFilePort) => {
    const dependencies = createDependencies(filePort);
    const updateAccount = vi.fn(async (runtime: FakeRuntime, account: Account) => Object.assign(runtime.account, account));
    return { dependencies: { ...dependencies, updateAccount }, updateAccount };
  };

  it('stores the edited name and phone in the open save and writes a new checkpoint', async () => {
    const file: FakeFile = { name: 'details.nutridiet', content: '' };
    const filePort = createFilePort(file);
    const { dependencies, updateAccount } = withAccountUpdates(filePort);
    const session = createProfileSession(dependencies);
    await session.createProfile({ displayName: 'Consultório antigo' });
    vi.mocked(filePort.write).mockClear();

    await session.updateProfileDetails({ displayName: '  Consultório   Centro ', phone: ' (11) 99999-0000 ' });

    expect(updateAccount).toHaveBeenCalledWith(
      session.getSnapshot().runtime,
      expect.objectContaining({ id: 'account-1', displayName: 'Consultório Centro', phone: '(11) 99999-0000' }),
    );
    expect(session.getSnapshot()).toMatchObject({
      status: 'active',
      syncState: 'synced',
      account: { displayName: 'Consultório Centro', phone: '(11) 99999-0000' },
    });
    expect(filePort.write).toHaveBeenCalledTimes(1);
  });

  it('skips unchanged details and rejects an empty name or a missing save', async () => {
    const file: FakeFile = { name: 'details.nutridiet', content: '' };
    const filePort = createFilePort(file);
    const { dependencies, updateAccount } = withAccountUpdates(filePort);
    const session = createProfileSession(dependencies);

    await expect(session.updateProfileDetails({ displayName: 'Sem save' })).rejects.toMatchObject({ code: 'SESSION_UNAVAILABLE' });
    await session.createProfile({ displayName: 'Consultório', phone: '11 90000-0000' });
    await expect(session.updateProfileDetails({ displayName: '   ' })).rejects.toMatchObject({ code: 'PROFILE_NAME_REQUIRED' });
    await session.updateProfileDetails({ displayName: 'Consultório', phone: '11  90000-0000' });

    expect(updateAccount).not.toHaveBeenCalled();
  });

  it('renames the catalog entry of a protected save after the file checkpoint', async () => {
    const order: string[] = [];
    const file = { name: 'renamed.nutridiet', content: '' };
    const filePort = createOnlineFilePort(file, order);
    const grant = await createOnlineGrant('account-1');
    const { dependencies } = createOnlineDependencies(filePort, grant, order);
    const renameSave = vi.fn(async () => { order.push('rename'); });
    dependencies.onlineSave!.renameSave = renameSave;
    const session = createProfileSession({ ...dependencies, updateAccount: async (runtime, account) => Object.assign(runtime.account, account) });
    await session.createProfile({ displayName: 'Consultório protegido' });
    vi.mocked(filePort.write).mockImplementation(async (selected, content) => {
      order.push('write');
      (selected as FakeFile).content = content;
    });

    await session.updateProfileDetails({ displayName: 'Consultório renomeado' });

    expect(renameSave).toHaveBeenCalledWith(grant.saveId, 'Consultório renomeado');
    expect(order.slice(-2)).toEqual(['write', 'rename']);
    await expect(decryptProtectedSave(file.content, grant)).resolves.toMatchObject({
      account: [{ id: 'account-1', displayName: 'Consultório renomeado' }],
    });

    renameSave.mockRejectedValueOnce(new Error('offline'));
    await expect(session.updateProfileDetails({ displayName: 'Outro nome' })).rejects.toMatchObject({ code: 'SAVE_RENAME_FAILED' });
    expect(session.getSnapshot().account).toMatchObject({ displayName: 'Outro nome' });
  });
});

function createOnlineFilePort(file: FakeFile | null, order: string[] = []) {
  const port = createFilePort(file);
  const pending = new Map<string, PendingSaveRegistration>();
  const associations = new Map<string, { ownerId: string; saveId: string; localAccountId: string; bindingProof?: string; file: SaveFile }>();
  port.persistPendingRegistration = vi.fn(async (attempt) => {
    order.push('pending');
    pending.set(`${attempt.ownerId}:${attempt.localAccountId}`, attempt);
  });
  port.restorePendingRegistration = vi.fn(async (ownerId, localAccountId) => pending.get(`${ownerId}:${localAccountId}`) ?? null);
  port.listPendingRegistrations = vi.fn(async (ownerId) => [...pending.values()].filter((attempt) => attempt.ownerId === ownerId));
  port.clearPendingRegistration = vi.fn(async (ownerId, localAccountId) => { pending.delete(`${ownerId}:${localAccountId}`); });
  port.persistFileAssociation = vi.fn(async (identity, selected, retry) => {
    associations.set(`${identity.ownerId}:${identity.saveId}`, { ...identity, ...retry, file: selected });
  });
  port.restoreFileAssociation = vi.fn(async (identity) => associations.get(`${identity.ownerId}:${identity.saveId}`) ?? null);
  port.isSameEntry = vi.fn(async (first, second) => first === second);
  return port;
}

async function createOnlineGrant(localAccountId: string, overrides: Partial<ProtectedSaveGrant> = {}): Promise<ProtectedSaveGrant> {
  const raw = randomBytes(32);
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  raw.fill(0);
  const authorizedAt = Date.now();
  return {
    ownerId: randomUUID(),
    saveId: randomUUID(),
    localAccountId,
    keyId: randomUUID(),
    bindingProof: encodeBindingProof('profile-session-v1', Buffer.alloc(32, 0x52).toString('base64url')),
    authorizedAt,
    expiresAt: authorizedAt + 8 * 60 * 60 * 1000,
    key,
    ...overrides,
  };
}

function createOnlineDependencies(
  filePort: ReturnType<typeof createOnlineFilePort>,
  grant: ProtectedSaveGrant,
  order: string[] = [],
) {
  const dependencies = createDependencies(filePort);
  const registeredInputs: Array<{ localAccountId: string; idempotencyKey: string; label: string }> = [];
  const onlineSession = createOnlineSaveSession({ isOnline: () => true });
  dependencies.onlineSave = {
    session: onlineSession,
    getCurrentOwnerId: vi.fn(async () => { order.push('owner'); return grant.ownerId; }),
    createIdempotencyKey: () => 'e9686c58-087f-4310-8dd1-aa68c54877de',
    registerSave: vi.fn(async (input) => {
      order.push('register');
      registeredInputs.push(input);
      return { saveId: grant.saveId, localAccountId: grant.localAccountId, keyId: grant.keyId, bindingProof: grant.bindingProof };
    }),
    authorizeSave: vi.fn(async () => { order.push('authorize'); return grant; }),
  };
  return { dependencies, onlineSave: dependencies.onlineSave, registeredInputs };
}
