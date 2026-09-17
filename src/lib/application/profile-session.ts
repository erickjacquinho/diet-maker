import { nanoid } from 'nanoid';
import type { Account } from '@/lib/domain/account';
import { normalizeAccountDisplayName } from '@/lib/domain/account';
import { BackupApplicationError, parseBackupEnvelope, validateBackupEnvelope } from './backup-application';
import { BACKUP_SCHEMA_VERSION, type BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import type { SaveFile, SaveFilePermission, SaveFilePort } from '@/lib/persistence/save-file';

export type ProfileSessionStatus = 'empty' | 'busy' | 'active' | 'paused';
export type ProfileSessionSyncState = 'unbound' | 'syncing' | 'synced' | 'paused';
export type ProfileSessionHydrationState = 'pending' | 'ready';

export interface ProfileSessionRuntime {
  readonly account: Account;
}

export interface ProfileSessionSnapshot<TRuntime extends ProfileSessionRuntime> {
  readonly status: ProfileSessionStatus;
  readonly syncState: ProfileSessionSyncState;
  readonly account: Account | null;
  readonly accountId: string | null;
  readonly runtime: TRuntime | null;
  readonly fileName: string | null;
  readonly hydration: ProfileSessionHydrationState;
  readonly resumeFileName: string | null;
  readonly error: string | null;
}

export interface CreateProfileInput {
  displayName: string;
  phone?: string | null;
}

export type ProfileSessionErrorCode =
  | 'PROFILE_NAME_REQUIRED'
  | 'SESSION_BUSY'
  | 'SAVE_CANCELLED'
  | 'SAVE_PERMISSION_DENIED'
  | 'SAVE_WRITE_FAILED'
  | 'LOAD_CANCELLED'
  | 'LOAD_INVALID'
  | 'LOAD_FAILED'
  | 'SESSION_UNAVAILABLE';

export class ProfileSessionError extends Error {
  readonly code: ProfileSessionErrorCode;
  readonly cause?: unknown;

  constructor(code: ProfileSessionErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ProfileSessionError';
    this.code = code;
    this.cause = options?.cause;
  }
}

export interface ProfileSessionDependencies<TRuntime extends ProfileSessionRuntime> {
  filePort: SaveFilePort;
  now?: () => string;
  idFactory?: () => string;
  createRuntime(account: Account): Promise<TRuntime>;
  importSnapshot(runtime: TRuntime, envelope: BackupEnvelope): Promise<void>;
  exportSnapshot(runtime: TRuntime): Promise<BackupEnvelope>;
  disposeRuntime?(runtime: TRuntime): Promise<void>;
  activateRuntime?(runtime: TRuntime): void | Promise<void>;
  deactivateRuntime?(runtime: TRuntime): void | Promise<void>;
}

export interface ProfileSession<TRuntime extends ProfileSessionRuntime> {
  getSnapshot(): ProfileSessionSnapshot<TRuntime>;
  subscribe(listener: (snapshot: ProfileSessionSnapshot<TRuntime>) => void): () => void;
  createProfile(input: CreateProfileInput): Promise<void>;
  loadProfile(): Promise<void>;
  restoreActiveProfile(): Promise<void>;
  resumeProfile(): Promise<void>;
  signOut(): Promise<void>;
  sync(): Promise<void>;
}

function normalizePhone(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized || null;
}

function cloneAccount(account: Account): Account {
  return { ...account, phone: account.phone ?? null };
}

function profileError(code: ProfileSessionErrorCode, message: string, cause?: unknown): ProfileSessionError {
  return new ProfileSessionError(code, message, { cause });
}

function isPermissionDenied(permission: SaveFilePermission): boolean {
  return permission !== 'granted';
}

function loadValidationMessage(error: unknown): string {
  if (error instanceof BackupApplicationError) {
    switch (error.code) {
      case 'BACKUP_APP_MISMATCH': return 'O arquivo pertence a outra aplicação ou não identifica um profile.';
      case 'BACKUP_VERSION_UNSUPPORTED': return 'A versão do arquivo não é compatível com este NutriDiet.';
      case 'BACKUP_RELATION_INVALID': return 'O arquivo contém relações de dados inválidas e não foi carregado.';
      case 'BACKUP_FORMAT_INVALID': return 'O arquivo selecionado não é um save NutriDiet válido.';
      default: return error.message;
    }
  }
  return 'O arquivo selecionado não é um save NutriDiet válido.';
}

function isMissingFileError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'NotFoundError') return true;
  return error instanceof ProfileSessionError && isMissingFileError(error.cause);
}

export function createProfileSession<TRuntime extends ProfileSessionRuntime>(
  dependencies: ProfileSessionDependencies<TRuntime>,
): ProfileSession<TRuntime> {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const idFactory = dependencies.idFactory ?? (() => nanoid(16));
  const listeners = new Set<(snapshot: ProfileSessionSnapshot<TRuntime>) => void>();
  let snapshot: ProfileSessionSnapshot<TRuntime> = {
    status: 'empty',
    syncState: 'unbound',
    account: null,
    accountId: null,
    runtime: null,
    fileName: null,
    hydration: 'pending',
    resumeFileName: null,
    error: null,
  };
  let associatedFile: SaveFile | null = null;
  let rememberedFile: SaveFile | null | undefined;
  let restorePromise: Promise<void> | null = null;

  const notify = () => {
    for (const listener of listeners) listener(snapshot);
  };

  const update = (next: Partial<ProfileSessionSnapshot<TRuntime>>) => {
    snapshot = { ...snapshot, ...next };
    notify();
  };

  const dispose = async (runtime: TRuntime | null): Promise<void> => {
    if (runtime && dependencies.disposeRuntime) await dependencies.disposeRuntime(runtime);
  };

  const begin = (): ProfileSessionSnapshot<TRuntime> => {
    if (snapshot.status === 'busy') throw profileError('SESSION_BUSY', 'Aguarde a operação de profile terminar.');
    const previous = snapshot;
    update({ status: 'busy', error: null });
    return previous;
  };

  const activate = async (runtime: TRuntime) => {
    await dependencies.activateRuntime?.(runtime);
  };

  const deactivate = async (runtime: TRuntime | null) => {
    if (runtime) await dependencies.deactivateRuntime?.(runtime);
  };

  const readRememberedFile = async (): Promise<SaveFile | null> => {
    if (rememberedFile !== undefined) return rememberedFile;
    if (!dependencies.filePort.restoreActiveFile) {
      rememberedFile = null;
      return rememberedFile;
    }

    try {
      rememberedFile = await dependencies.filePort.restoreActiveFile();
    } catch {
      rememberedFile = null;
    }
    return rememberedFile;
  };

  const rememberActiveFile = async (file: SaveFile): Promise<void> => {
    rememberedFile = file;
    try {
      await dependencies.filePort.persistActiveFile?.(file);
    } catch {
      // The active tab remains usable even when optional browser storage fails.
    }
  };

  const commitRuntime = async (runtime: TRuntime, file: SaveFile, syncState: ProfileSessionSyncState) => {
    const previousRuntime = snapshot.runtime;
    await activate(runtime);
    await rememberActiveFile(file);
    associatedFile = file;
    update({
      status: syncState === 'paused' ? 'paused' : 'active',
      syncState,
      account: cloneAccount(runtime.account),
      accountId: runtime.account.id,
      runtime,
      fileName: file.name,
      hydration: 'ready',
      resumeFileName: null,
      error: syncState === 'paused' ? 'O arquivo está associado, mas a sincronização está pausada.' : null,
    });
    if (previousRuntime && previousRuntime !== runtime) {
      await deactivate(previousRuntime);
      await dispose(previousRuntime);
    }
  };

  const writeSnapshot = async (runtime: TRuntime, file: SaveFile): Promise<void> => {
    const exported = await dependencies.exportSnapshot(runtime);
    const snapshot = exported.schemaVersion === BACKUP_SCHEMA_VERSION ? exported : validateBackupEnvelope(exported);
    await dependencies.filePort.write(file, JSON.stringify(snapshot));
  };

  const requestPermission = async (file: SaveFile): Promise<SaveFilePermission> => {
    try {
      return await dependencies.filePort.requestWritePermission(file);
    } catch (cause) {
      throw profileError('SAVE_PERMISSION_DENIED', 'O arquivo não autorizou a escrita nesta sessão.', cause);
    }
  };

  const loadSelectedFile = async (
    file: SaveFile,
    options: { permission?: SaveFilePermission; requestPermissionFirst?: boolean } = {},
    previousSnapshot?: ProfileSessionSnapshot<TRuntime>,
  ): Promise<void> => {
    const previous = previousSnapshot ?? begin();
    let runtime: TRuntime | null = null;
    let permission: SaveFilePermission | undefined = options.permission;
    try {
      if (options.requestPermissionFirst) permission = await requestPermission(file);

      let envelope: BackupEnvelope;
      try {
        envelope = parseBackupEnvelope(await dependencies.filePort.read(file));
      } catch (cause) {
        throw cause instanceof ProfileSessionError ? cause : profileError('LOAD_INVALID', loadValidationMessage(cause), cause);
      }
      const accountRow = envelope.account[0];
      if (!accountRow) throw profileError('LOAD_INVALID', 'O arquivo não contém um profile.');
      const account: Account = cloneAccount(accountRow);
      runtime = await dependencies.createRuntime(account);
      await dependencies.importSnapshot(runtime, envelope);
      permission ??= await requestPermission(file);
      if (isPermissionDenied(permission)) {
        await commitRuntime(runtime, file, 'paused');
        runtime = null;
        return;
      }
      await commitRuntime(runtime, file, 'synced');
      runtime = null;
    } catch (cause) {
      await dispose(runtime);
      update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'O arquivo não pôde ser carregado.' });
      if (cause instanceof ProfileSessionError) throw cause;
      throw profileError('LOAD_FAILED', 'O profile não pôde ser carregado.', cause);
    }
  };

  const restoreActiveProfile = async (): Promise<void> => {
    if (restorePromise) return restorePromise;

    restorePromise = (async () => {
      try {
        if (snapshot.runtime) return;

        const file = await readRememberedFile();
        if (!file) return;

        update({ resumeFileName: file.name, error: null });
        if (dependencies.filePort.queryPermission) {
          const readPermission = await dependencies.filePort.queryPermission(file, 'read');
          if (readPermission !== 'granted') return;

          let writePermission: SaveFilePermission = 'prompt';
          try {
            writePermission = await dependencies.filePort.queryPermission(file, 'readwrite');
          } catch {
            // A write permission prompt cannot be opened during automatic hydration.
          }
          try {
            await loadSelectedFile(file, { permission: writePermission });
          } catch (cause) {
            update({ resumeFileName: null });
            throw cause;
          }
          return;
        }

        try {
          await loadSelectedFile(file);
        } catch (cause) {
          update({ resumeFileName: null });
          throw cause;
        }
      } catch (cause) {
        const fileIsMissing = isMissingFileError(cause);
        if (fileIsMissing) {
          rememberedFile = null;
          try {
            await dependencies.filePort.clearActiveFile?.();
          } catch {
            // A stale optional association must not prevent onboarding recovery.
          }
        }
        update({
          status: snapshot.runtime ? snapshot.status : 'empty',
          hydration: 'ready',
          resumeFileName: fileIsMissing ? null : snapshot.resumeFileName,
          error: fileIsMissing ? 'O último save não foi encontrado. Selecione o arquivo novamente.' : cause instanceof Error ? cause.message : 'O último save não pôde ser carregado.',
        });
      } finally {
        update({ hydration: 'ready' });
      }
    })();

    return restorePromise;
  };

  const resumeProfile = async (): Promise<void> => {
    await restoreActiveProfile();
    if (snapshot.runtime) return;

    const file = await readRememberedFile();
    if (!file) throw profileError('SESSION_UNAVAILABLE', 'Nenhum save anterior foi encontrado neste navegador.');
    await loadSelectedFile(file, { requestPermissionFirst: true });
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async createProfile(input) {
      const displayName = normalizeAccountDisplayName(input.displayName);
      if (!displayName) throw profileError('PROFILE_NAME_REQUIRED', 'Informe o nome do profile.');
      const previous = begin();
      let runtime: TRuntime | null = null;
      try {
        const file = await dependencies.filePort.chooseNew();
        if (!file) {
          update({ ...previous, hydration: 'ready' });
          return;
        }
        const timestamp = now();
        const account: Account = {
          id: idFactory(),
          displayName,
          phone: normalizePhone(input.phone),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        runtime = await dependencies.createRuntime(account);
        const permission = await requestPermission(file);
        if (isPermissionDenied(permission)) throw profileError('SAVE_PERMISSION_DENIED', 'Conceda permissão de escrita para criar o arquivo do profile.');
        await writeSnapshot(runtime, file);
        await commitRuntime(runtime, file, 'synced');
        runtime = null;
      } catch (cause) {
        await dispose(runtime);
        update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'O profile não pôde ser criado.' });
        if (cause instanceof ProfileSessionError) throw cause;
        throw profileError('SAVE_WRITE_FAILED', 'O primeiro save não pôde ser escrito.', cause);
      }
    },
    async loadProfile() {
      const previous = begin();
      let file: SaveFile | null;
      try {
        file = await dependencies.filePort.chooseExisting();
      } catch (cause) {
        update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'O arquivo não pôde ser carregado.' });
        if (cause instanceof ProfileSessionError) throw cause;
        throw profileError('LOAD_FAILED', 'O profile não pôde ser carregado.', cause);
      }
      if (!file) {
        update({ ...previous, hydration: 'ready' });
        return;
      }
      await loadSelectedFile(file, {}, previous);
    },
    restoreActiveProfile,
    resumeProfile,
    async signOut() {
      if (snapshot.status === 'busy') throw profileError('SESSION_BUSY', 'Aguarde a operação de profile terminar.');

      const runtime = snapshot.runtime;
      update({ status: 'busy', error: null });
      try {
        await deactivate(runtime);
        await dispose(runtime);
      } finally {
        associatedFile = null;
        rememberedFile = null;
        restorePromise = null;
        try {
          await dependencies.filePort.clearActiveFile?.();
        } catch {
          // Logout must not delete or block on the durable save file.
        }
        update({
          status: 'empty',
          syncState: 'unbound',
          account: null,
          accountId: null,
          runtime: null,
          fileName: null,
          hydration: 'ready',
          resumeFileName: null,
          error: null,
        });
      }
    },
    async sync() {
      const previous = begin();
      const runtime = previous.runtime;
      if (!runtime || !previous.account || !previous.fileName) {
        update(previous);
        throw profileError('SESSION_UNAVAILABLE', 'Nenhum save está associado à sessão atual.');
      }
      update({ status: 'busy', syncState: 'syncing', error: null });
      try {
        if (!associatedFile) throw profileError('SAVE_WRITE_FAILED', 'O arquivo associado não está disponível para sincronização.');
        const permission = await requestPermission(associatedFile);
        if (isPermissionDenied(permission)) throw profileError('SAVE_PERMISSION_DENIED', 'A permissão de escrita do save foi revogada.');
        await writeSnapshot(runtime, associatedFile);
        update({ status: 'active', syncState: 'synced', error: null });
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'A sincronização foi pausada.';
        update({ ...previous, status: 'paused', syncState: 'paused', error: message });
        throw cause instanceof ProfileSessionError ? cause : profileError('SAVE_WRITE_FAILED', message, cause);
      }
    },
  };
}

export type { SaveFile, SaveFilePort } from '@/lib/persistence/save-file';
