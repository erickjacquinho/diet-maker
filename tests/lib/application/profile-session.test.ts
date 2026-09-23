// @vitest-environment node

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
import type { SaveFilePort } from '@/lib/persistence/save-file';

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

    expect(JSON.parse(file.content)).toMatchObject({ schemaVersion: '7', account: [{ phone: null }] });
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
