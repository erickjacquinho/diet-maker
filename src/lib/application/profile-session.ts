import { nanoid } from 'nanoid';
import type { Account } from '@/lib/domain/account';
import { normalizeAccountDisplayName } from '@/lib/domain/account';
import { BackupApplicationError, validateBackupEnvelope } from './backup-application';
import { BACKUP_SCHEMA_VERSION, type BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import {
  decodeBase64Url,
  parseProtectedSaveEnvelope,
  type ProtectedSaveGrant,
} from '@/lib/domain/protected-save';
import { decryptProtectedSave, encryptProtectedSave } from '@/lib/infrastructure/crypto/protected-save';
import type { OnlineSaveSession } from './online-save-session';
import type {
  PendingSaveRegistration,
  SaveFileAssociation,
  SaveFile,
  SaveFilePermission,
  SaveFilePort,
  SaveFileRetryMetadata,
} from '@/lib/persistence/save-file';

export type ProfileSessionStatus = 'empty' | 'busy' | 'active' | 'paused' | 'locked';
export type ProfileSessionSyncState = 'unbound' | 'syncing' | 'pending' | 'synced' | 'paused';
export type ProfileSessionHydrationState = 'pending' | 'ready';

export interface ProfileSessionRuntime {
  readonly account: Account;
  getCheckpointState(): Promise<{ workspaceRevision: number; checkpointRevision: number }>;
  markWorkspaceDirty(): Promise<void>;
  advanceCheckpoint(revision: number): Promise<void>;
}

export interface ProfileSessionSnapshot<TRuntime extends ProfileSessionRuntime> {
  readonly status: ProfileSessionStatus;
  readonly authorizationExpiresAt: number | null;
  readonly syncState: ProfileSessionSyncState;
  readonly account: Account | null;
  readonly accountId: string | null;
  readonly runtime: TRuntime | null;
  readonly fileName: string | null;
  readonly hydration: ProfileSessionHydrationState;
  readonly resumeFileName: string | null;
  readonly error: string | null;
  readonly protectedCopyRequired: boolean;
}

export interface OnlineSaveScope extends Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'> {}

export interface OnlineSaveRegistration {
  readonly saveId: string;
  readonly localAccountId: string;
  readonly keyId: string;
  readonly bindingProof: string;
}

export interface ProfileSessionOnlineSaveGateway {
  readonly session: OnlineSaveSession;
  getCurrentOwnerId(): Promise<string>;
  createIdempotencyKey(): string;
  registerSave(input: { localAccountId: string; idempotencyKey: string; label: string }): Promise<OnlineSaveRegistration>;
  authorizeSave(saveId: string, bindingProof: string): Promise<ProtectedSaveGrant>;
  /** Updates the save label shown in the account catalog. */
  renameSave?(saveId: string, label: string): Promise<void>;
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
  | 'SAVE_NOT_LOCATED'
  | 'SAVE_REFERENCE_LOST'
  | 'DRAFT_PRESERVATION_FAILED'
  | 'SAVE_RENAME_FAILED'
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
  onlineSave?: ProfileSessionOnlineSaveGateway;
  now?: () => string;
  idFactory?: () => string;
  createRuntime(account: Account, scope?: OnlineSaveScope): Promise<TRuntime>;
  importSnapshot(runtime: TRuntime, envelope: BackupEnvelope): Promise<void>;
  exportSnapshot(runtime: TRuntime): Promise<BackupEnvelope>;
  /** Persists the edited account row inside the runtime workspace and returns the stored account. */
  updateAccount?(runtime: TRuntime, account: Account): Promise<Account>;
  disposeRuntime?(runtime: TRuntime): Promise<void>;
  activateRuntime?(runtime: TRuntime): void | Promise<void>;
  deactivateRuntime?(runtime: TRuntime): void | Promise<void>;
}

export interface ProfileSession<TRuntime extends ProfileSessionRuntime> {
  getSnapshot(): ProfileSessionSnapshot<TRuntime>;
  subscribe(listener: (snapshot: ProfileSessionSnapshot<TRuntime>) => void): () => void;
  isSaveAuthorized(): boolean;
  onResume(): void;
  registerPendingDraftFlush(flush: () => Promise<void>): () => void;
  retryLockedSave(): Promise<void>;
  createProfile(input: CreateProfileInput): Promise<void>;
  updateProfileDetails(input: CreateProfileInput): Promise<void>;
  adoptLegacyProfile(): Promise<void>;
  listPendingRegistrations(): Promise<Array<{ localAccountId: string; fileName: string; hasSourceFile: boolean }>>;
  resumePendingProfile(localAccountId: string, input: CreateProfileInput): Promise<void>;
  loadProfile(): Promise<void>;
  openSave(saveId: string, association?: SaveFileAssociation): Promise<void>;
  locateSave(saveId: string): Promise<void>;
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

function isPermissionError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'NotAllowedError') return true;
  return error instanceof ProfileSessionError && isPermissionError(error.cause);
}

export function createProfileSession<TRuntime extends ProfileSessionRuntime>(
  dependencies: ProfileSessionDependencies<TRuntime>,
): ProfileSession<TRuntime> {
  const now = dependencies.now ?? (() => new Date().toISOString());
  const idFactory = dependencies.idFactory ?? (() => nanoid(16));
  const listeners = new Set<(snapshot: ProfileSessionSnapshot<TRuntime>) => void>();
  let snapshot: ProfileSessionSnapshot<TRuntime> = {
    status: 'empty',
    authorizationExpiresAt: null,
    syncState: 'unbound',
    account: null,
    accountId: null,
    runtime: null,
    fileName: null,
    hydration: 'pending',
    resumeFileName: null,
    error: null,
    protectedCopyRequired: false,
  };
  let associatedFile: SaveFile | null = null;
  let onlineIdentity: Pick<ProtectedSaveGrant, 'ownerId' | 'saveId' | 'localAccountId' | 'keyId' | 'bindingProof'> | null = null;
  /** Label already written to the file but not yet to the account catalog, so resubmitting it retries the rename. */
  let pendingCatalogLabel: { saveId: string; label: string } | null = null;
  let pendingLegacy: { file: SaveFile; envelope: BackupEnvelope; sourceSchemaVersion: unknown } | null = null;
  let rememberedFile: SaveFile | null | undefined;
  let restorePromise: Promise<void> | null = null;
  let checkpointPromise: Promise<void> | null = null;
  let lockTransition: Promise<void> | null = null;
  let lockedDraftFlushers: Array<() => Promise<void>> | null = null;
  let lockReason: 'expired' | 'sign-out' = 'expired';
  const pendingDraftFlushers = new Set<() => Promise<void>>();

  const notify = () => {
    for (const listener of listeners) listener(snapshot);
  };

  const update = (next: Partial<ProfileSessionSnapshot<TRuntime>>) => {
    snapshot = {
      ...snapshot,
      ...next,
      authorizationExpiresAt: dependencies.onlineSave?.session.getSnapshot().expiresAt ?? null,
    };
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

  const startLockTransition = (reason: 'expired' | 'sign-out', markRevocation: boolean): Promise<void> => {
    if (lockTransition) {
      if (reason === 'sign-out') lockReason = reason;
      if (markRevocation) dependencies.onlineSave?.session.lock({ revocationPending: true });
      return lockTransition;
    }
    const runtime = snapshot.runtime;
    lockReason = reason;
    if (!runtime) {
      if (markRevocation) dependencies.onlineSave?.session.lock({ revocationPending: true });
      onlineIdentity = null;
      if (reason === 'sign-out') {
        associatedFile = null;
        rememberedFile = null;
        restorePromise = null;
        update({
          status: 'empty', syncState: 'unbound', account: null, accountId: null,
          runtime: null, fileName: null, hydration: 'ready', resumeFileName: null,
          error: null, protectedCopyRequired: false,
        });
      }
      return Promise.resolve();
    }

    const flushers = lockedDraftFlushers ?? [...pendingDraftFlushers];
    lockedDraftFlushers = flushers;
    const checkpoint = checkpointPromise;
    update({ status: 'locked', syncState: 'paused', error: null });
    const transition = Promise.resolve().then(async () => {
      await dependencies.onlineSave?.session.waitForIdle();
      await checkpoint?.catch(() => undefined);
      for (const flush of flushers) await flush();
      lockedDraftFlushers = null;
      await deactivate(runtime);
      await dispose(runtime);
      associatedFile = null;
      rememberedFile = null;
      restorePromise = null;
      onlineIdentity = null;
      update({
        status: 'empty', syncState: 'unbound', account: null, accountId: null,
        runtime: null, fileName: null, hydration: 'ready', resumeFileName: null,
        error: null, protectedCopyRequired: false,
      });
    }).catch((cause: unknown) => {
      update({
        status: 'locked', syncState: 'paused', account: snapshot.account,
        accountId: snapshot.accountId, runtime, fileName: snapshot.fileName,
        hydration: 'ready', error: cause instanceof Error ? cause.message : 'O rascunho local não foi preservado.',
      });
      throw profileError('DRAFT_PRESERVATION_FAILED', 'O rascunho não foi preservado. Tente novamente antes de sair.', cause);
    }).finally(() => {
      if (lockTransition === transition) lockTransition = null;
    });
    lockTransition = transition;
    if (markRevocation) dependencies.onlineSave?.session.lock({ revocationPending: true });
    return transition;
  };

  dependencies.onlineSave?.session.subscribe((onlineSnapshot) => {
    if (snapshot.authorizationExpiresAt !== onlineSnapshot.expiresAt) {
      update({ authorizationExpiresAt: onlineSnapshot.expiresAt });
    }
    if (onlineSnapshot.status === 'locked' && snapshot.runtime && snapshot.status !== 'locked' && !lockTransition) {
      void startLockTransition('expired', false).catch(() => undefined);
    }
  });

  const readRememberedFile = async (): Promise<SaveFile | null> => {
    if (dependencies.onlineSave) return null;
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
    if (dependencies.onlineSave) return;
    try {
      await dependencies.filePort.persistActiveFile?.(file);
    } catch {
      // The active tab remains usable even when optional browser storage fails.
    }
  };

  const commitRuntime = async (runtime: TRuntime, file: SaveFile, syncState: ProfileSessionSyncState) => {
    if (dependencies.onlineSave && (!onlineIdentity || !dependencies.onlineSave.session.isAuthorizedFor(onlineIdentity))) {
      throw profileError('SESSION_UNAVAILABLE', 'A autorização do save expirou antes de abrir o arquivo.');
    }
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
      protectedCopyRequired: false,
    });
    if (previousRuntime && previousRuntime !== runtime) {
      await deactivate(previousRuntime);
      await dispose(previousRuntime);
    }
  };

  const writeSnapshot = async (runtime: TRuntime, file: SaveFile): Promise<void> => {
    if (dependencies.onlineSave) {
      if (!onlineIdentity) throw profileError('SESSION_UNAVAILABLE', 'O save precisa ser autorizado antes da gravação.');
      await dependencies.onlineSave.session.withOperation(onlineIdentity, async (grant) => {
        const exported = await dependencies.exportSnapshot(runtime);
        const snapshot = validateBackupEnvelope(exported, { accountId: runtime.account.id });
        const serialized = await encryptProtectedSave(snapshot, grant);
        await dependencies.filePort.write(file, serialized);
      });
      return;
    }
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
      let sourceSchemaVersion: unknown;
      try {
        const rawInput: unknown = JSON.parse(await dependencies.filePort.read(file));
        sourceSchemaVersion = typeof rawInput === 'object' && rawInput !== null && !Array.isArray(rawInput)
          ? (rawInput as Record<string, unknown>).schemaVersion
          : undefined;
        envelope = validateBackupEnvelope(rawInput);
      } catch (cause) {
        throw cause instanceof ProfileSessionError ? cause : profileError('LOAD_INVALID', loadValidationMessage(cause), cause);
      }
      const accountRow = envelope.account[0];
      if (!accountRow) throw profileError('LOAD_INVALID', 'O arquivo não contém um profile.');
      const account: Account = cloneAccount(accountRow);
      runtime = await dependencies.createRuntime(account);
      await dependencies.importSnapshot(runtime, envelope);
      if (sourceSchemaVersion !== BACKUP_SCHEMA_VERSION) await runtime.markWorkspaceDirty();
      permission ??= await requestPermission(file);
      const checkpoint = await runtime.getCheckpointState();
      const pendingState: ProfileSessionSyncState = checkpoint.workspaceRevision > checkpoint.checkpointRevision ? 'pending' : 'synced';
      if (isPermissionDenied(permission)) {
        await commitRuntime(runtime, file, 'paused');
        runtime = null;
        return;
      }
      await commitRuntime(runtime, file, pendingState);
      runtime = null;
    } catch (cause) {
      await dispose(runtime);
      update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'O arquivo não pôde ser carregado.' });
      if (cause instanceof ProfileSessionError) throw cause;
      throw profileError('LOAD_FAILED', 'O profile não pôde ser carregado.', cause);
    }
  };

  const activateRegisteredSave = async (options: {
    ownerId: string;
    file: SaveFile;
    account: Account;
    idempotencyKey: string;
    sourceFile?: SaveFile;
    sourceEnvelope?: BackupEnvelope;
    sourceSchemaVersion?: unknown;
    previous: ProfileSessionSnapshot<TRuntime>;
  }): Promise<void> => {
    const onlineSave = dependencies.onlineSave;
    if (!onlineSave) throw profileError('SESSION_UNAVAILABLE', 'A integração online do save não está disponível.');
    let runtime: TRuntime | null = null;
    onlineIdentity = null;
    try {
      const permission = await requestPermission(options.file);
      if (isPermissionDenied(permission)) {
        throw profileError('SAVE_PERMISSION_DENIED', 'Conceda permissão de escrita para criar a cópia protegida.');
      }
      const retry = {
        localAccountId: options.account.id,
        idempotencyKey: options.idempotencyKey,
      };
      if (!dependencies.filePort.persistPendingRegistration) {
        throw profileError('SESSION_UNAVAILABLE', 'Não foi possível preservar a identidade da tentativa local.');
      }
      await dependencies.filePort.persistPendingRegistration({
        ownerId: options.ownerId,
        ...retry,
        file: options.file,
        ...(options.sourceFile ? { sourceFile: options.sourceFile } : {}),
      });

      const registration = await onlineSave.registerSave({
        localAccountId: options.account.id,
        idempotencyKey: options.idempotencyKey,
        label: options.account.displayName,
      });
      if (registration.localAccountId !== options.account.id) {
        throw profileError('SESSION_UNAVAILABLE', 'O registro do save não corresponde à Conta clínica selecionada.');
      }
      const grant = await onlineSave.authorizeSave(registration.saveId, registration.bindingProof);
      if (
        grant.ownerId !== options.ownerId
        || grant.saveId !== registration.saveId
        || grant.localAccountId !== options.account.id
        || grant.keyId !== registration.keyId
        || grant.bindingProof !== registration.bindingProof
      ) throw profileError('SESSION_UNAVAILABLE', 'A autorização retornou uma identidade incompatível.');
      await onlineSave.session.authorize(grant);
      onlineIdentity = {
        ownerId: grant.ownerId,
        saveId: grant.saveId,
        localAccountId: grant.localAccountId,
        keyId: grant.keyId,
        bindingProof: grant.bindingProof,
      };

      runtime = await dependencies.createRuntime(options.account, {
        ownerId: grant.ownerId,
        saveId: grant.saveId,
        localAccountId: grant.localAccountId,
        keyId: grant.keyId,
        bindingProof: grant.bindingProof,
      });
      const existingWorkspace = (runtime as TRuntime & { hasExistingWorkspace?: boolean }).hasExistingWorkspace === true;
      if (options.sourceEnvelope && !existingWorkspace) {
        await dependencies.importSnapshot(runtime, validateBackupEnvelope(options.sourceEnvelope, { accountId: grant.localAccountId }));
        if (options.sourceSchemaVersion !== BACKUP_SCHEMA_VERSION) await runtime.markWorkspaceDirty();
      }

      await writeSnapshot(runtime, options.file);
      const written = await onlineSave.session.withOperation(onlineIdentity, async (activeGrant) => {
        const serialized = await dependencies.filePort.read(options.file);
        return decryptProtectedSave(serialized, activeGrant);
      });
      if (written.schemaVersion !== BACKUP_SCHEMA_VERSION || written.account[0]?.id !== grant.localAccountId) {
        throw profileError('SAVE_WRITE_FAILED', 'A cópia protegida não passou pela validação após a gravação.');
      }

      const checkpoint = await runtime.getCheckpointState();
      await runtime.advanceCheckpoint(checkpoint.workspaceRevision);
      if (!dependencies.filePort.persistFileAssociation || !dependencies.filePort.clearPendingRegistration) {
        throw profileError('SESSION_UNAVAILABLE', 'Não foi possível salvar a referência local do save.');
      }
      await dependencies.filePort.persistFileAssociation(
        onlineIdentity,
        options.file,
        { ...retry, bindingProof: grant.bindingProof },
      );
      await dependencies.filePort.clearPendingRegistration(grant.ownerId, grant.localAccountId);
      const current = await runtime.getCheckpointState();
      await commitRuntime(runtime, options.file, current.workspaceRevision > current.checkpointRevision ? 'pending' : 'synced');
      runtime = null;
      pendingLegacy = null;
    } catch (cause) {
      await dispose(runtime);
      onlineSave.session.lock();
      onlineIdentity = null;
      update({
        ...options.previous,
        hydration: 'ready',
        protectedCopyRequired: pendingLegacy !== null,
        error: cause instanceof Error ? cause.message : 'O save protegido não pôde ser preparado.',
      });
      if (cause instanceof ProfileSessionError) throw cause;
      throw profileError('SAVE_WRITE_FAILED', 'O save protegido não pôde ser preparado.', cause);
    }
  };

  const loadProtectedSave = async (
    file: SaveFile,
    envelopeValue: unknown,
    previous: ProfileSessionSnapshot<TRuntime>,
  ): Promise<void> => {
    const onlineSave = dependencies.onlineSave;
    if (!onlineSave) throw profileError('LOAD_INVALID', 'Este save exige uma sessão online.');
    if (previous.runtime) throw profileError('SESSION_BUSY', 'Feche o save atual antes de abrir outro.');
    let runtime: TRuntime | null = null;
    onlineIdentity = null;
    try {
      const envelope = parseProtectedSaveEnvelope(envelopeValue);
      const ownerId = await onlineSave.getCurrentOwnerId();
      const grant = await onlineSave.authorizeSave(envelope.saveId, envelope.bindingProof);
      if (grant.ownerId !== ownerId || grant.saveId !== envelope.saveId || grant.bindingProof !== envelope.bindingProof) {
        throw profileError('LOAD_INVALID', 'A autorização não corresponde à identidade deste arquivo.');
      }
      await onlineSave.session.authorize(grant);
      onlineIdentity = {
        ownerId: grant.ownerId,
        saveId: grant.saveId,
        localAccountId: grant.localAccountId,
        keyId: grant.keyId,
        bindingProof: grant.bindingProof,
      };
      const backup = await onlineSave.session.withOperation(onlineIdentity, (activeGrant) =>
        decryptProtectedSave(JSON.stringify(envelope), activeGrant));
      const accountRow = backup.account[0];
      if (!accountRow) throw profileError('LOAD_INVALID', 'O save não contém uma Conta clínica válida.');
      const account = cloneAccount(accountRow);
      runtime = await dependencies.createRuntime(account, {
        ownerId: grant.ownerId,
        saveId: grant.saveId,
        localAccountId: grant.localAccountId,
        keyId: grant.keyId,
        bindingProof: grant.bindingProof,
      });
      const existingWorkspace = (runtime as TRuntime & { hasExistingWorkspace?: boolean }).hasExistingWorkspace === true;
      if (!existingWorkspace) await dependencies.importSnapshot(runtime, backup);
      const permission = dependencies.filePort.queryPermission
        ? await dependencies.filePort.queryPermission(file, 'readwrite')
        : 'prompt';
      if (!dependencies.filePort.persistFileAssociation) {
        throw profileError('SESSION_UNAVAILABLE', 'Não foi possível salvar a referência local do save.');
      }
      await dependencies.filePort.persistFileAssociation(onlineIdentity, file, {
        localAccountId: grant.localAccountId,
        bindingProof: grant.bindingProof,
      });
      const checkpoint = await runtime.getCheckpointState();
      const syncState = permission !== 'granted'
        ? 'paused'
        : checkpoint.workspaceRevision > checkpoint.checkpointRevision ? 'pending' : 'synced';
      await commitRuntime(runtime, file, syncState);
      runtime = null;
      pendingLegacy = null;
    } catch (cause) {
      await dispose(runtime);
      onlineSave.session.lock();
      onlineIdentity = null;
      update({ ...previous, hydration: 'ready', protectedCopyRequired: false, error: cause instanceof Error ? cause.message : 'O save protegido não pôde ser aberto.' });
      if (cause instanceof ProfileSessionError) throw cause;
      throw profileError('LOAD_FAILED', 'O save protegido não pôde ser aberto.', cause);
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
    if (dependencies.onlineSave) throw profileError('SESSION_UNAVAILABLE', 'Escolha um save no catálogo online para autorizar sua abertura.');
    await restoreActiveProfile();
    if (snapshot.runtime) return;

    const file = await readRememberedFile();
    if (!file) throw profileError('SESSION_UNAVAILABLE', 'Nenhum save anterior foi encontrado neste navegador.');
    await loadSelectedFile(file, { requestPermissionFirst: true });
  };

  const performSync = async (): Promise<void> => {
    const previous = begin();
    const runtime = previous.runtime;
    if (!runtime || !previous.account || !previous.fileName) {
      update(previous);
      throw profileError('SESSION_UNAVAILABLE', 'Nenhum save está associado à sessão atual.');
    }

    try {
      if (dependencies.onlineSave && onlineIdentity && !dependencies.onlineSave.session.isAuthorizedFor(onlineIdentity)) {
        throw profileError('SESSION_UNAVAILABLE', 'A autorização do save expirou ou foi bloqueada.');
      }
      const captured = await runtime.getCheckpointState();
      if (captured.workspaceRevision <= captured.checkpointRevision) {
        update({ ...previous, status: 'active', syncState: 'synced', error: null });
        return;
      }

      update({ status: 'busy', syncState: 'syncing', error: null });
      if (!associatedFile) throw profileError('SAVE_WRITE_FAILED', 'O arquivo associado não está disponível para sincronização.');
      const permission = await requestPermission(associatedFile);
      if (isPermissionDenied(permission)) throw profileError('SAVE_PERMISSION_DENIED', 'A permissão de escrita do save foi revogada.');
      await writeSnapshot(runtime, associatedFile);
      await runtime.advanceCheckpoint(captured.workspaceRevision);
      if (snapshot.status === 'locked') throw profileError('SESSION_UNAVAILABLE', 'A sessão do save foi bloqueada durante o checkpoint.');
      const current = await runtime.getCheckpointState();
      const hasPendingChanges = current.workspaceRevision > current.checkpointRevision;
      update({ status: 'active', syncState: hasPendingChanges ? 'pending' : 'synced', error: null });
    } catch (cause) {
      if (snapshot.status === 'locked') throw cause instanceof ProfileSessionError ? cause : profileError('SESSION_UNAVAILABLE', 'A sessão do save foi bloqueada durante o checkpoint.', cause);
      const message = cause instanceof Error ? cause.message : 'A sincronização foi pausada.';
      update({ ...previous, status: 'paused', syncState: 'paused', error: message });
      throw cause instanceof ProfileSessionError ? cause : profileError('SAVE_WRITE_FAILED', message, cause);
    }
  };

  const sync = (): Promise<void> => {
    if (checkpointPromise) return checkpointPromise;
    const shared = Promise.resolve().then(performSync).finally(() => {
      if (checkpointPromise === shared) checkpointPromise = null;
    });
    checkpointPromise = shared;
    return shared;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isSaveAuthorized() {
      if (dependencies.onlineSave) return Boolean(onlineIdentity && dependencies.onlineSave.session.isAuthorizedFor(onlineIdentity));
      return Boolean(snapshot.runtime) && (snapshot.status === 'active' || snapshot.status === 'paused');
    },
    onResume() {
      dependencies.onlineSave?.session.onResume();
    },
    registerPendingDraftFlush(flush) {
      pendingDraftFlushers.add(flush);
      return () => pendingDraftFlushers.delete(flush);
    },
    async retryLockedSave() {
      if (lockTransition) return lockTransition;
      if (snapshot.status !== 'locked' || !snapshot.runtime) return;
      await startLockTransition(lockReason, false);
    },
    async createProfile(input) {
      const displayName = normalizeAccountDisplayName(input.displayName);
      if (!displayName) throw profileError('PROFILE_NAME_REQUIRED', 'Informe o nome do profile.');
      if (dependencies.onlineSave && snapshot.runtime) {
        throw profileError('SESSION_BUSY', 'Feche o save atual antes de criar outro.');
      }
      const previous = begin();
      if (dependencies.onlineSave) {
        try {
          const file = await dependencies.filePort.chooseNew();
          if (!file) {
            update({ ...previous, hydration: 'ready' });
            return;
          }
          const ownerId = await dependencies.onlineSave.getCurrentOwnerId();
          const timestamp = now();
          const account: Account = {
            id: idFactory(),
            displayName,
            phone: normalizePhone(input.phone),
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          await activateRegisteredSave({
            ownerId,
            file,
            account,
            idempotencyKey: dependencies.onlineSave.createIdempotencyKey(),
            previous,
          });
          return;
        } catch (cause) {
          if (snapshot.status === 'busy') update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'O save não pôde ser criado.' });
          if (cause instanceof ProfileSessionError) throw cause;
          throw profileError('SAVE_WRITE_FAILED', 'O save protegido não pôde ser criado.', cause);
        }
      }
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
        const checkpoint = await runtime.getCheckpointState();
        await runtime.advanceCheckpoint(checkpoint.workspaceRevision);
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
      if (dependencies.onlineSave && previous.runtime) {
        update(previous);
        throw profileError('SESSION_BUSY', 'Feche o save atual antes de abrir outro.');
      }
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
      if (dependencies.onlineSave) {
        try {
          const parsed: unknown = JSON.parse(await dependencies.filePort.read(file));
          if (parsed && typeof parsed === 'object' && (parsed as Record<string, unknown>).formatVersion === 2) {
            await loadProtectedSave(file, parsed, previous);
            return;
          }
          const sourceSchemaVersion = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>).schemaVersion
            : undefined;
          const envelope = validateBackupEnvelope(parsed);
          if (!envelope.account[0]) throw profileError('LOAD_INVALID', 'O save não contém uma Conta clínica válida.');
          pendingLegacy = { file, envelope, sourceSchemaVersion };
          update({ ...previous, hydration: 'ready', protectedCopyRequired: true, error: null });
        } catch (cause) {
          update({ ...previous, hydration: 'ready', protectedCopyRequired: false, error: cause instanceof Error ? cause.message : 'O arquivo não pôde ser validado.' });
          if (cause instanceof ProfileSessionError) throw cause;
          throw profileError('LOAD_INVALID', loadValidationMessage(cause), cause);
        }
        return;
      }
      await loadSelectedFile(file, {}, previous);
    },
    async openSave(saveId, restoredAssociation) {
      if (!dependencies.onlineSave || !dependencies.filePort.restoreFileAssociation) {
        throw profileError('SESSION_UNAVAILABLE', 'A abertura pelo catálogo não está disponível neste navegador.');
      }
      if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(saveId)) {
        throw profileError('LOAD_INVALID', 'O identificador do save é inválido.');
      }
      if (snapshot.runtime) throw profileError('SESSION_BUSY', 'Feche o save atual antes de abrir outro.');
      const previous = begin();
      try {
        let association = restoredAssociation;
        if (association && association.saveId !== saveId) {
          throw profileError('SAVE_NOT_LOCATED', 'A referência local deste save não corresponde ao catálogo.');
        }
        if (association) {
          const permission = await requestPermission(association.file);
          if (isPermissionDenied(permission)) {
            throw profileError('SAVE_PERMISSION_DENIED', 'Autorize o acesso ao arquivo para abrir este save.');
          }
        }
        const ownerId = await dependencies.onlineSave.getCurrentOwnerId();
        association ??= await dependencies.filePort.restoreFileAssociation({ ownerId, saveId }) ?? undefined;
        if (!association) throw profileError('SAVE_NOT_LOCATED', 'Este save não tem arquivo associado neste navegador. Use Localizar para vinculá-lo.');
        if (association.ownerId !== ownerId || association.saveId !== saveId) {
          throw profileError('SAVE_NOT_LOCATED', 'A referência local deste save não corresponde à conta atual.');
        }
        if (!restoredAssociation) {
          const permission = await requestPermission(association.file);
          if (isPermissionDenied(permission)) {
            throw profileError('SAVE_PERMISSION_DENIED', 'Autorize o acesso ao arquivo para abrir este save.');
          }
        }
        const raw: unknown = JSON.parse(await dependencies.filePort.read(association.file));
        const envelope = parseProtectedSaveEnvelope(raw);
        if (envelope.saveId !== saveId) {
          throw profileError('LOAD_INVALID', 'O arquivo associado pertence a outro save; a referência local precisa ser corrigida.');
        }
        await loadProtectedSave(association.file, envelope, previous);
      } catch (cause) {
        if (snapshot.status !== 'busy') throw cause;
        const error = isMissingFileError(cause)
          ? profileError('SAVE_REFERENCE_LOST', 'O arquivo associado não foi encontrado. Localize o arquivo novamente.', cause)
          : isPermissionError(cause)
            ? profileError('SAVE_PERMISSION_DENIED', 'Conceda permissão para abrir o arquivo deste save.', cause)
            : cause;
        update({ ...previous, hydration: 'ready', error: error instanceof Error ? error.message : 'O save não pôde ser aberto.' });
        if (error instanceof ProfileSessionError) throw error;
        throw profileError('LOAD_FAILED', 'O save não pôde ser aberto.', error);
      }
    },
    async locateSave(saveId) {
      if (!dependencies.onlineSave) throw profileError('SESSION_UNAVAILABLE', 'A localização de saves online não está disponível.');
      if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(saveId)) {
        throw profileError('LOAD_INVALID', 'O identificador do save é inválido.');
      }
      if (snapshot.runtime) throw profileError('SESSION_BUSY', 'Feche o save atual antes de localizar outro.');
      const previous = begin();
      try {
        const file = await dependencies.filePort.chooseExisting();
        if (!file) {
          update({ ...previous, hydration: 'ready' });
          return;
        }
        const raw: unknown = JSON.parse(await dependencies.filePort.read(file));
        const envelope = parseProtectedSaveEnvelope(raw);
        if (envelope.saveId !== saveId) {
          throw profileError('LOAD_INVALID', 'O arquivo selecionado pertence a outro save. Escolha o arquivo correspondente a esta linha.');
        }
        await loadProtectedSave(file, envelope, previous);
      } catch (cause) {
        if (snapshot.status !== 'busy') throw cause;
        const error = isMissingFileError(cause)
          ? profileError('SAVE_REFERENCE_LOST', 'O arquivo selecionado não está mais disponível.', cause)
          : isPermissionError(cause)
            ? profileError('SAVE_PERMISSION_DENIED', 'Conceda permissão para ler o arquivo selecionado.', cause)
            : cause;
        update({ ...previous, hydration: 'ready', error: error instanceof Error ? error.message : 'O arquivo não pôde ser associado a este save.' });
        if (error instanceof ProfileSessionError) throw error;
        throw profileError('LOAD_INVALID', loadValidationMessage(error), error);
      }
    },
    async updateProfileDetails(input) {
      const displayName = normalizeAccountDisplayName(input.displayName);
      if (!displayName) throw profileError('PROFILE_NAME_REQUIRED', 'Informe o nome do profile.');
      const runtime = snapshot.runtime;
      const current = snapshot.account;
      if (!runtime || !current || (snapshot.status !== 'active' && snapshot.status !== 'paused') || !dependencies.updateAccount) {
        throw profileError('SESSION_UNAVAILABLE', 'Abra um save para editar as configurações dele.');
      }
      if (dependencies.onlineSave && (!onlineIdentity || !dependencies.onlineSave.session.isAuthorizedFor(onlineIdentity))) {
        throw profileError('SESSION_UNAVAILABLE', 'A autorização do save expirou ou foi bloqueada.');
      }
      const phone = normalizePhone(input.phone);
      const renamed = current.displayName !== displayName;
      const changed = renamed || (current.phone ?? null) !== phone;
      const saveId = onlineIdentity?.saveId ?? null;
      const retryCatalog = pendingCatalogLabel !== null
        && pendingCatalogLabel.saveId === saveId
        && pendingCatalogLabel.label === displayName;
      if (!changed && !retryCatalog) return;

      let stored = current;
      try {
        if (changed) {
          stored = await dependencies.updateAccount(runtime, { ...current, displayName, phone, updatedAt: now() });
          await runtime.markWorkspaceDirty();
          await sync();
        }

        const onlineSave = dependencies.onlineSave;
        if ((renamed || retryCatalog) && onlineSave?.renameSave && saveId) {
          try {
            await onlineSave.renameSave(saveId, displayName);
            pendingCatalogLabel = null;
          } catch (cause) {
            pendingCatalogLabel = { saveId, label: displayName };
            throw profileError('SAVE_RENAME_FAILED', 'O nome foi salvo no arquivo, mas a lista de saves da conta não foi atualizada. Salve novamente para tentar outra vez.', cause);
          }
        }
      } finally {
        // Published after the catalog rename so consumers that refetch the catalog on a name change see the new label.
        if (stored !== current) update({ account: cloneAccount(stored) });
      }
    },
    async adoptLegacyProfile() {
      if (!dependencies.onlineSave || !pendingLegacy) {
        throw profileError('SESSION_UNAVAILABLE', 'Selecione e valide um arquivo legado antes de criar a cópia protegida.');
      }
      if (snapshot.runtime) throw profileError('SESSION_BUSY', 'Feche o save atual antes de importar outro.');
      const candidate = pendingLegacy;
      const previous = begin();
      try {
        const file = await dependencies.filePort.chooseNew();
        if (!file) {
          update({ ...previous, hydration: 'ready', protectedCopyRequired: true });
          return;
        }
        if (dependencies.filePort.isSameEntry && await dependencies.filePort.isSameEntry(candidate.file, file)) {
          throw profileError('SAVE_WRITE_FAILED', 'Escolha um destino diferente para preservar o arquivo original.');
        }
        const account = cloneAccount(candidate.envelope.account[0]);
        await activateRegisteredSave({
          ownerId: await dependencies.onlineSave.getCurrentOwnerId(),
          file,
          account,
          idempotencyKey: dependencies.onlineSave.createIdempotencyKey(),
          sourceFile: candidate.file,
          sourceEnvelope: candidate.envelope,
          sourceSchemaVersion: candidate.sourceSchemaVersion,
          previous,
        });
      } catch (cause) {
        if (snapshot.status === 'busy') {
          update({ ...previous, hydration: 'ready', protectedCopyRequired: pendingLegacy !== null, error: cause instanceof Error ? cause.message : 'A cópia protegida não pôde ser criada.' });
        }
        if (cause instanceof ProfileSessionError) throw cause;
        throw profileError('SAVE_WRITE_FAILED', 'A cópia protegida não pôde ser criada.', cause);
      }
    },
    async listPendingRegistrations() {
      if (!dependencies.onlineSave || !dependencies.filePort.listPendingRegistrations) return [];
      const ownerId = await dependencies.onlineSave.getCurrentOwnerId();
      const pending = await dependencies.filePort.listPendingRegistrations(ownerId);
      return pending.map((attempt) => ({
        localAccountId: attempt.localAccountId,
        fileName: attempt.file.name,
        hasSourceFile: Boolean(attempt.sourceFile),
      }));
    },
    async resumePendingProfile(localAccountId, input) {
      if (!dependencies.onlineSave || !dependencies.filePort.restorePendingRegistration) {
        throw profileError('SESSION_UNAVAILABLE', 'Não há uma tentativa de save recuperável neste navegador.');
      }
      if (snapshot.runtime) throw profileError('SESSION_BUSY', 'Feche o save atual antes de retomar outro.');
      const previous = begin();
      try {
        const ownerId = await dependencies.onlineSave.getCurrentOwnerId();
        const pending = await dependencies.filePort.restorePendingRegistration(ownerId, localAccountId);
        if (!pending) throw profileError('SESSION_UNAVAILABLE', 'A tentativa de save não foi encontrada neste navegador.');
        let sourceEnvelope: BackupEnvelope | undefined;
        let sourceSchemaVersion: unknown;
        let account: Account;
        if (pending.sourceFile) {
          const raw: unknown = JSON.parse(await dependencies.filePort.read(pending.sourceFile));
          sourceSchemaVersion = raw && typeof raw === 'object' && !Array.isArray(raw)
            ? (raw as Record<string, unknown>).schemaVersion
            : undefined;
          sourceEnvelope = validateBackupEnvelope(raw, { accountId: localAccountId });
          account = cloneAccount(sourceEnvelope.account[0]);
        } else {
          const displayName = normalizeAccountDisplayName(input.displayName);
          if (!displayName) throw profileError('PROFILE_NAME_REQUIRED', 'Informe o nome do profile para retomar o save.');
          const timestamp = now();
          account = {
            id: localAccountId,
            displayName,
            phone: normalizePhone(input.phone),
            createdAt: timestamp,
            updatedAt: timestamp,
          };
        }
        await activateRegisteredSave({
          ownerId,
          file: pending.file,
          account,
          idempotencyKey: pending.idempotencyKey,
          ...(pending.sourceFile ? { sourceFile: pending.sourceFile } : {}),
          ...(sourceEnvelope ? { sourceEnvelope, sourceSchemaVersion } : {}),
          previous,
        });
      } catch (cause) {
        if (snapshot.status === 'busy') update({ ...previous, hydration: 'ready', error: cause instanceof Error ? cause.message : 'A tentativa não pôde ser retomada.' });
        if (cause instanceof ProfileSessionError) throw cause;
        throw profileError('SAVE_WRITE_FAILED', 'A tentativa de save não pôde ser retomada.', cause);
      }
    },
    restoreActiveProfile,
    resumeProfile,
    async signOut() {
      if (snapshot.status === 'busy') throw profileError('SESSION_BUSY', 'Aguarde a operação de profile terminar.');

      if (dependencies.onlineSave) {
        await startLockTransition('sign-out', true);
        return;
      }

      const runtime = snapshot.runtime;
      update({ status: 'busy', error: null });
      try {
        await deactivate(runtime);
        await dispose(runtime);
      } finally {
        associatedFile = null;
        rememberedFile = null;
        restorePromise = null;
        if (!dependencies.onlineSave) {
          try {
            await dependencies.filePort.clearActiveFile?.();
          } catch {
            // Logout must not delete or block on the durable save file.
          }
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
          protectedCopyRequired: false,
        });
      }
    },
    sync,
  };
}

export type { SaveFile, SaveFilePort } from '@/lib/persistence/save-file';
