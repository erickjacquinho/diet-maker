import { createConfirmedOperationCoordinator, createPatientApplication, type PatientApplication } from './composition-root';
import { createExplicitAccountContext } from './account/get-active-account';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';
import { createPatientProfileReader } from './patients/patient-profile-reader';
import { createDietApplication } from './diets/diet-application';
import type { DietApplication } from './diets/diet-ports';
import { PGliteDietRepository } from '@/lib/infrastructure/local-db/diets/pglite-diet-repository';
import { createPatientDietReader } from '@/lib/application/diets/patient-diet-reader';
import { InMemoryDietDraftStore } from '@/lib/infrastructure/diet-drafts/in-memory-diet-draft-store';
import { IndexedDbDietDraftStore } from '@/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store';
import { createLibraryApplication, type LibraryApplication } from './library/library-application';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';
import { PGliteReadyMealRepository } from '@/lib/infrastructure/local-db/library/ready-meal-repository';
import { PGliteReadyDietRepository } from '@/lib/infrastructure/local-db/library/ready-diet-repository';
import { PGliteClinicalRepository } from '@/lib/infrastructure/local-db/clinical-repository';
import { PGliteBackupRepository } from '@/lib/infrastructure/local-db/backup-repository';
import { createBackupApplication, type BackupApplication } from './backup-application';
import { createProfileSession, type OnlineSaveScope, type ProfileSession, type ProfileSessionOnlineSaveGateway } from './profile-session';
import { createBrowserSaveFilePort } from '@/lib/infrastructure/file-system-access/browser-save-file';
import type { Account } from '@/lib/domain/account';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import { decodeBase64Url, type ProtectedSaveGrant } from '@/lib/domain/protected-save';
import { createOnlineSaveSession, guardOnlineSaveApplication, type OnlineSaveRevocationMarker, type OnlineSaveSession } from './online-save-session';
import { getFavoritesFromStorage, setActiveFavoritesAccountId, setFavoritesFromStorage } from '@/lib/library-ui-adapter';
import { readAgendaReminders, replaceAgendaReminders } from '@/lib/agenda-reminders';
import { isOnlinePersistence } from './persistence-mode';
import { createOnlineProfileSession } from './online-profile-session';
import { createOnlinePreferences } from './online-preferences';
import { getBrowserProfessionalProfileStore } from './professional-profile-store';
import { HttpPatientRepository } from '@/lib/infrastructure/http/http-patient-repository';
import { HttpObjectiveCatalogRepository } from '@/lib/infrastructure/http/http-objective-catalog-repository';
import { HttpClinicalRepository } from '@/lib/infrastructure/http/http-clinical-repository';
import { HttpDietRepository } from '@/lib/infrastructure/http/http-diet-repository';
import { HttpDietDraftStore } from '@/lib/infrastructure/http/http-diet-draft-store';
import {
  HttpFoodCatalogRepository,
  HttpReadyDietRepository,
  HttpReadyMealRepository,
  HttpRecipeRepository,
} from '@/lib/infrastructure/http/http-library-repositories';

export interface BrowserPatientRuntime {
  readonly account: Account;
  readonly hasExistingWorkspace: boolean;
  readonly onlineScope?: OnlineSaveScope;
  readonly application: PatientApplication;
  readonly dietApplication: DietApplication;
  readonly libraryApplication: LibraryApplication;
  /** Local workspace only: absent when every record lives in the account (online mode). */
  readonly backupApplication?: BackupApplication;
  readonly handle?: LocalDatabaseHandle;
  getCheckpointState(): Promise<{ workspaceRevision: number; checkpointRevision: number }>;
  markWorkspaceDirty(): Promise<void>;
  advanceCheckpoint(revision: number): Promise<void>;
  bindSync(sync: () => Promise<void>): void;
}

let activeRuntime: BrowserPatientRuntime | null = null;
let profileSession: ProfileSession<BrowserPatientRuntime> | undefined;
let onlineSaveSession: OnlineSaveSession | undefined;
let pendingBrowserRevocation: Promise<void> | null = null;
const draftPreservers = new WeakMap<DietApplication, DietApplication['flushDraft']>();

export async function preserveBrowserDietDraft(application: DietApplication, ...args: Parameters<DietApplication['flushDraft']>): ReturnType<DietApplication['flushDraft']> {
  const preserve = draftPreservers.get(application);
  if (!preserve || profileSession?.getSnapshot().runtime?.dietApplication !== application) throw new Error('O rascunho não pertence ao runtime em preservação.');
  return preserve(...args);
}

function createBrowserBackupRepository(handle: LocalDatabaseHandle): PGliteBackupRepository {
  return new PGliteBackupRepository(handle, {
    readFavorites: (accountId) => getFavoritesFromStorage(accountId),
    writeFavorites: (accountId, favorites) => setFavoritesFromStorage(favorites, accountId),
    readAgendaReminders,
    writeAgendaReminders: replaceAgendaReminders,
  });
}

/** Builds a persistent browser workspace and an isolated memory workspace in tests. */
export async function createBrowserPatientRuntime(account: Account, onlineScope?: OnlineSaveScope): Promise<BrowserPatientRuntime> {
  const inBrowser = typeof window !== 'undefined';
  const workspaceKey = onlineScope ? `${onlineScope.ownerId}:${onlineScope.saveId}` : account.id;
  const handle = await openLocalDatabase(inBrowser
    ? { mode: 'persistent', dataDir: `idb://nutridiet-${encodeURIComponent(workspaceKey)}` }
    : { mode: 'memory' });
  try {
    let syncAfterConfirmedOperation: (() => Promise<void>) | undefined;
    const getCheckpointState = async () => {
      const result = await handle.client.query<{ workspace_revision: number; checkpoint_revision: number }>(
        'SELECT workspace_revision, checkpoint_revision FROM profile_checkpoint_state WHERE account_id = $1',
        [account.id],
      );
      const row = result.rows[0];
      return row
        ? { workspaceRevision: row.workspace_revision, checkpointRevision: row.checkpoint_revision }
        : { workspaceRevision: 0, checkpointRevision: 0 };
    };
    const markWorkspaceDirty = async () => {
      await handle.client.query(`
        INSERT INTO profile_checkpoint_state (account_id, workspace_revision, checkpoint_revision)
        VALUES ($1, 1, 0)
        ON CONFLICT (account_id) DO UPDATE
        SET workspace_revision = profile_checkpoint_state.workspace_revision + 1
      `, [account.id]);
    };
    const advanceCheckpoint = async (revision: number) => {
      await handle.client.query(`
        INSERT INTO profile_checkpoint_state (account_id, workspace_revision, checkpoint_revision)
        VALUES ($1, $2, $2)
        ON CONFLICT (account_id) DO UPDATE
        SET checkpoint_revision = GREATEST(profile_checkpoint_state.checkpoint_revision, $2)
      `, [account.id, revision]);
    };
    const confirmedOperation = createConfirmedOperationCoordinator(async () => {
      await markWorkspaceDirty();
      await syncAfterConfirmedOperation?.();
    });
    const checkpointRows = await handle.client.query<{ account_id: string }>(
      'SELECT account_id FROM profile_checkpoint_state WHERE account_id = $1',
      [account.id],
    );
    const hasExistingWorkspace = checkpointRows.rows.length > 0;
    const accountRepository = new LocalAccountContextRepository(handle);
    const existingAccount = await accountRepository.getById(account.id);
    const persistedAccount = hasExistingWorkspace && existingAccount
      ? existingAccount
      : await accountRepository.saveAccount(account);
    const accountContext = createExplicitAccountContext(persistedAccount);
    const patientRepository = new LocalPatientRepository(handle);
    const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
    const dietRepository = new PGliteDietRepository(handle);
    const dietReader = createPatientDietReader(dietRepository);
    const clinicalRepository = new PGliteClinicalRepository(handle);
    const draftStore = inBrowser
      ? new IndexedDbDietDraftStore({ databaseName: onlineScope
        ? `nutridiet-diet-drafts-v1-${encodeURIComponent(workspaceKey)}`
        : 'nutridiet-diet-drafts-v1' })
      : new InMemoryDietDraftStore();
    const backupRepository = createBrowserBackupRepository(handle);
    const backupApplication = createBackupApplication({
      accountContext,
      repository: backupRepository,
      draftStore,
      ...(onlineScope && onlineSaveSession
        ? { protectedSave: { session: onlineSaveSession, identity: onlineScope, authorizeRestore: async () => {
          const gateway = createBrowserOnlineSaveGateway();
          const grant = await gateway.authorizeSave(onlineScope.saveId, onlineScope.bindingProof);
          await gateway.session.authorize(grant);
        } } }
        : {}),
      getCheckpointState,
      savePendingCheckpoint: async () => {
        if (!syncAfterConfirmedOperation) throw new Error('Nenhum arquivo principal está associado à sessão atual.');
        await syncAfterConfirmedOperation();
      },
    });
    const patientProfileReader = createPatientProfileReader(
      patientRepository,
      objectiveCatalogRepository,
      (accountId, patientId) => dietRepository.listPatientSummaries(accountId, [patientId]).then((summaries) => summaries[patientId]),
      { clinicalRepository, listRelatedCounts: (accountId, patientIds) => dietRepository.listPatientSummaries(accountId, patientIds) },
    );
    const foodRepository = new PGliteFoodCatalogRepository(handle);
    const recipeRepository = new PGliteRecipeRepository(handle, { foodRepository });
    const readyMealRepository = new PGliteReadyMealRepository(handle, { foodRepository, recipeRepository });
    const readyDietRepository = new PGliteReadyDietRepository(handle);

    const runtime: BrowserPatientRuntime = {
      account: persistedAccount,
      hasExistingWorkspace,
      ...(onlineScope ? { onlineScope } : {}),
      handle,
      getCheckpointState,
      markWorkspaceDirty,
      advanceCheckpoint,
      bindSync: (sync) => { syncAfterConfirmedOperation = sync; },
      application: createPatientApplication({
        accountContext,
        patientRepository,
        objectiveCatalogRepository,
        patientProfileReader,
        transactionRunner: new LocalTransactionRunner(),
        dietDraftStore: draftStore,
        clinicalRepository,
        patientDietReader: dietReader,
        confirmedOperation,
      }),
      dietApplication: createDietApplication({
        accountContext,
        patientReader: patientRepository,
        repository: dietRepository,
        draftStore,
        dietReader,
        historyViewReader: dietRepository,
        confirmedOperation,
        librarySourceReader: {
          getRecipe: (accountId, recipeId) => recipeRepository.getById(accountId, recipeId),
          getReadyMeal: (accountId, readyMealId) => readyMealRepository.getById(accountId, readyMealId),
        },
      }),
      libraryApplication: createLibraryApplication({ accountContext, foodRepository, recipeRepository, readyMealRepository, readyDietRepository, confirmedOperation }),
      backupApplication,
    };
    if (onlineScope && onlineSaveSession) {
      const preserveDraft = runtime.dietApplication.flushDraft;
      const guarded = {
        ...runtime,
        application: guardOnlineSaveApplication(runtime.application, onlineSaveSession, onlineScope),
        dietApplication: guardOnlineSaveApplication(runtime.dietApplication, onlineSaveSession, onlineScope),
        libraryApplication: guardOnlineSaveApplication(runtime.libraryApplication, onlineSaveSession, onlineScope),
      };
      draftPreservers.set(guarded.dietApplication, preserveDraft);
      return guarded;
    }
    return runtime;
  } catch (error) {
    await handle.close();
    throw error;
  }
}

/** The signed-in account, from the server session and the professional profile (never from a local file). */
async function loadOnlineAccount(): Promise<Account> {
  const response = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'same-origin' });
  const body: unknown = await response.json().catch(() => null);
  const user = (body as { user?: { id?: unknown; email?: unknown } } | null)?.user;
  if (!response.ok || !user || typeof user.id !== 'string') throw new Error('Entre novamente para abrir sua conta.');
  const store = getBrowserProfessionalProfileStore();
  await store.load().catch(() => undefined);
  const { profile, accountEmail } = store.getSnapshot();
  const email = typeof user.email === 'string' ? user.email : accountEmail;
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : (email ?? 'Minha conta');
  const now = new Date().toISOString();
  return { id: user.id, displayName: displayName || 'Minha conta', phone: null, createdAt: now, updatedAt: now };
}

/**
 * Builds the applications over the account API: nothing is stored in the browser, so there is no workspace to open,
 * checkpoint or lock. Favorites and agenda reminders keep their synchronous cache, hydrated here and pushed on change.
 */
export async function createOnlinePatientRuntime(account: Account): Promise<BrowserPatientRuntime> {
  const newId = () => globalThis.crypto.randomUUID();
  const preferences = createOnlinePreferences(account.id);
  await preferences.hydrate();
  const accountContext = createExplicitAccountContext(account);
  const patientRepository = new HttpPatientRepository(newId);
  const objectiveCatalogRepository = new HttpObjectiveCatalogRepository();
  const clinicalRepository = new HttpClinicalRepository(newId);
  const dietRepository = new HttpDietRepository();
  const dietReader = createPatientDietReader(dietRepository);
  const draftStore = new HttpDietDraftStore();
  const foodRepository = new HttpFoodCatalogRepository(newId);
  const recipeRepository = new HttpRecipeRepository(newId);
  const readyMealRepository = new HttpReadyMealRepository(newId);
  const readyDietRepository = new HttpReadyDietRepository(newId);
  // Every confirmed operation is already stored by the server when it returns.
  const confirmedOperation = createConfirmedOperationCoordinator(async () => undefined);
  const patientProfileReader = createPatientProfileReader(
    patientRepository,
    objectiveCatalogRepository,
    (accountId, patientId) => dietRepository.listPatientSummaries(accountId, [patientId]).then((summaries) => summaries[patientId]),
    { clinicalRepository, listRelatedCounts: (accountId, patientIds) => dietRepository.listPatientSummaries(accountId, patientIds) },
  );
  return {
    account,
    hasExistingWorkspace: true,
    getCheckpointState: async () => ({ workspaceRevision: 0, checkpointRevision: 0 }),
    markWorkspaceDirty: () => preferences.push(),
    advanceCheckpoint: async () => undefined,
    bindSync: () => undefined,
    application: createPatientApplication({
      accountContext, patientRepository, objectiveCatalogRepository, patientProfileReader,
      // Atomicity belongs to the server: each API call is already one transaction.
      transactionRunner: { run: (operation) => operation() }, dietDraftStore: draftStore, clinicalRepository,
      patientDietReader: dietReader, confirmedOperation, idFactory: newId,
    }),
    dietApplication: createDietApplication({
      accountContext, patientReader: patientRepository, repository: dietRepository, draftStore, dietReader,
      historyViewReader: dietRepository, confirmedOperation, idFactory: newId,
      librarySourceReader: {
        getRecipe: (accountId, recipeId) => recipeRepository.getById(accountId, recipeId),
        getReadyMeal: (accountId, readyMealId) => readyMealRepository.getById(accountId, readyMealId),
      },
    }),
    libraryApplication: createLibraryApplication({ accountContext, foodRepository, recipeRepository, readyMealRepository, readyDietRepository, confirmedOperation }),
  };
}

export async function importBrowserPatientSnapshot(runtime: BrowserPatientRuntime, envelope: BackupEnvelope): Promise<void> {
  if (runtime.hasExistingWorkspace) return;
  if (!runtime.handle) throw new Error('Não há um workspace local para receber o snapshot.');
  await createBrowserBackupRepository(runtime.handle).replaceAccountSnapshot(envelope.account[0].id, envelope);
}

export async function exportBrowserPatientSnapshot(runtime: BrowserPatientRuntime): Promise<BackupEnvelope> {
  if (!runtime.handle) throw new Error('Não há um workspace local para exportar.');
  return createBrowserBackupRepository(runtime.handle).readAccountSnapshot(runtime.account.id);
}

export async function updateBrowserPatientAccount(runtime: BrowserPatientRuntime, account: Account): Promise<Account> {
  if (account.id !== runtime.account.id) throw new Error('A Conta editada não pertence ao save aberto.');
  const stored = runtime.handle ? await new LocalAccountContextRepository(runtime.handle).saveAccount(account) : account;
  // Runtime copies share this object, so open applications read the new name without rebuilding.
  Object.assign(runtime.account, stored);
  return stored;
}

export function activateBrowserPatientRuntime(runtime: BrowserPatientRuntime): BrowserPatientRuntime {
  activeRuntime = runtime;
  setActiveFavoritesAccountId(runtime.account.id);
  return runtime;
}

export async function disposeBrowserPatientRuntime(runtime: BrowserPatientRuntime | null | undefined): Promise<void> {
  if (!runtime) return;
  if (activeRuntime === runtime) {
    activeRuntime = null;
    setActiveFavoritesAccountId(undefined);
  }
  await runtime.handle?.close();
}

export function getBrowserPatientRuntimeIfActive(): BrowserPatientRuntime | null {
  return profileSession?.isSaveAuthorized() ? activeRuntime : null;
}

export async function persistAgendaReminderChange(accountId: string): Promise<void> {
  if (!activeRuntime || activeRuntime.account.id !== accountId || !profileSession?.isSaveAuthorized()) {
    throw new Error('O arquivo principal não está disponível para salvar o lembrete.');
  }
  await activeRuntime.markWorkspaceDirty();
  await profileSession.sync();
}

export async function getBrowserPatientRuntime(): Promise<BrowserPatientRuntime> {
  if (!activeRuntime || !profileSession?.isSaveAuthorized()) throw new Error('O save está bloqueado ou não autorizado nesta sessão.');
  return activeRuntime;
}

const revocationMarkerKey = 'nutridiet.online-save-revocation-pending';
const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function createBrowserRevocationMarker(): OnlineSaveRevocationMarker {
  return {
    isPending() {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem(revocationMarkerKey) === '1';
    },
    markPending() {
      if (typeof window === 'undefined') throw new Error('Local storage is unavailable.');
      window.localStorage.setItem(revocationMarkerKey, '1');
    },
    clear() {
      if (typeof window === 'undefined') throw new Error('Local storage is unavailable.');
      window.localStorage.removeItem(revocationMarkerKey);
    },
  };
}

async function fetchJson(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    credentials: 'same-origin',
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('O serviço de conta não retornou uma resposta válida.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('O serviço de conta não retornou uma resposta válida.');
  }
  if (!response.ok) {
    const code = (body as Record<string, unknown>).code;
    if (code === 'AUTH_REQUIRED') throw new Error('Entre novamente para abrir ou criar um save.');
    if (code === 'PROFILE_REQUIRED') throw new Error('Conclua seu cadastro para acessar os saves.');
    throw new Error('A operação online do save não pôde ser concluída.');
  }
  return body as Record<string, unknown>;
}

async function getCsrfToken(): Promise<string> {
  const body = await fetchJson('/api/auth/csrf');
  if (typeof body.csrfToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.csrfToken)) {
    throw new Error('Não foi possível preparar uma operação protegida.');
  }
  return body.csrfToken;
}

export async function signOutBrowserAccount(): Promise<void> {
  const csrfToken = await getCsrfToken();
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ csrfToken }),
  });
  if (!response.ok) throw new Error('Não foi possível encerrar a sessão da conta. Tente novamente.');
  if (onlineSaveSession) onlineSaveSession.acknowledgeRemoteRevocation();
  else createBrowserRevocationMarker().clear();
}

export function revokePendingBrowserSession(): Promise<void> {
  if (pendingBrowserRevocation) return pendingBrowserRevocation;
  if (!createBrowserRevocationMarker().isPending()) return Promise.resolve();
  const pending = signOutBrowserAccount().finally(() => {
    if (pendingBrowserRevocation === pending) pendingBrowserRevocation = null;
  });
  pendingBrowserRevocation = pending;
  return pending;
}

function createBrowserOnlineSaveGateway(): ProfileSessionOnlineSaveGateway {
  const session = onlineSaveSession ??= createOnlineSaveSession({
    isOnline: () => typeof navigator === 'undefined' || navigator.onLine !== false,
    revocationMarker: createBrowserRevocationMarker(),
  });
  return {
    session,
    async getCurrentOwnerId() {
      const body = await fetchJson('/api/auth/session');
      const user = body.user;
      if (!user || typeof user !== 'object' || Array.isArray(user)) throw new Error('Entre na sua conta para acessar os saves.');
      const ownerId = (user as Record<string, unknown>).id;
      if (typeof ownerId !== 'string' || !uuidPattern.test(ownerId)) throw new Error('A sessão da conta não pôde ser validada.');
      if (body.profileComplete !== true) throw new Error('Conclua seu cadastro para acessar os saves.');
      return ownerId;
    },
    createIdempotencyKey() {
      return globalThis.crypto.randomUUID();
    },
    async registerSave(input) {
      const csrfToken = await getCsrfToken();
      const body = await fetchJson('/api/saves', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...input, csrfToken }),
      });
      if (
        typeof body.saveId !== 'string' || !uuidPattern.test(body.saveId)
        || typeof body.localAccountId !== 'string'
        || typeof body.keyId !== 'string' || !uuidPattern.test(body.keyId)
        || typeof body.bindingProof !== 'string'
        || body.localAccountId !== input.localAccountId
      ) throw new Error('O registro do save não corresponde à Conta clínica selecionada.');
      return {
        saveId: body.saveId,
        localAccountId: body.localAccountId,
        keyId: body.keyId,
        bindingProof: body.bindingProof,
      };
    },
    async authorizeSave(saveId, bindingProof) {
      const csrfToken = await getCsrfToken();
      const body = await fetchJson(`/api/saves/${encodeURIComponent(saveId)}/authorize`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bindingProof, csrfToken }),
      });
      const rawEncodedKey = body.key;
      if (
        typeof body.ownerId !== 'string' || !uuidPattern.test(body.ownerId)
        || body.saveId !== saveId
        || typeof body.localAccountId !== 'string'
        || typeof body.keyId !== 'string' || !uuidPattern.test(body.keyId)
        || body.bindingProof !== bindingProof
        || typeof body.authorizedAt !== 'number' || !Number.isSafeInteger(body.authorizedAt)
        || typeof body.expiresAt !== 'number' || !Number.isSafeInteger(body.expiresAt)
        || typeof rawEncodedKey !== 'string'
      ) throw new Error('A autorização do save não pôde ser validada.');
      const rawKey = decodeBase64Url(rawEncodedKey);
      if (!rawKey || rawKey.length !== 32) {
        rawKey?.fill(0);
        throw new Error('A chave do save não pôde ser validada.');
      }
      try {
        const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        (body as Record<string, unknown>).key = '';
        return {
          ownerId: body.ownerId,
          saveId,
          localAccountId: body.localAccountId,
          keyId: body.keyId,
          bindingProof,
          authorizedAt: body.authorizedAt,
          expiresAt: body.expiresAt,
          key,
        } satisfies ProtectedSaveGrant;
      } finally {
        rawKey.fill(0);
      }
    },
    async renameSave(saveId, label) {
      const csrfToken = await getCsrfToken();
      const body = await fetchJson(`/api/saves/${encodeURIComponent(saveId)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ label, csrfToken }),
      });
      if (body.saveId !== saveId) throw new Error('A resposta da renomeação não corresponde ao save aberto.');
    },
  };
}

export function getBrowserProfileSession(): ProfileSession<BrowserPatientRuntime> {
  if (!profileSession && isOnlinePersistence()) {
    profileSession = createOnlineProfileSession<BrowserPatientRuntime>({
      loadAccount: loadOnlineAccount,
      createRuntime: createOnlinePatientRuntime,
      activateRuntime: activateBrowserPatientRuntime,
      disposeRuntime: disposeBrowserPatientRuntime,
      sync: () => activeRuntime?.markWorkspaceDirty() ?? Promise.resolve(),
    });
  }
  if (!profileSession) {
    let session: ProfileSession<BrowserPatientRuntime>;
    session = createProfileSession<BrowserPatientRuntime>({
      filePort: createBrowserSaveFilePort(),
      onlineSave: createBrowserOnlineSaveGateway(),
      createRuntime: createBrowserPatientRuntime,
      importSnapshot: importBrowserPatientSnapshot,
      exportSnapshot: exportBrowserPatientSnapshot,
      updateAccount: updateBrowserPatientAccount,
      disposeRuntime: disposeBrowserPatientRuntime,
      activateRuntime: (runtime) => {
        runtime.bindSync(() => session.sync());
        activateBrowserPatientRuntime(runtime);
      },
    });
    profileSession = session;
  }
  return profileSession;
}

export async function getBrowserPatientApplication(): Promise<PatientApplication> {
  return (await getBrowserPatientRuntime()).application;
}

export async function getBrowserDietApplication(): Promise<DietApplication> {
  return (await getBrowserPatientRuntime()).dietApplication;
}

export async function getBrowserLibraryApplication(): Promise<LibraryApplication> {
  return (await getBrowserPatientRuntime()).libraryApplication;
}

export async function resetBrowserPatientRuntimeForTests(): Promise<void> {
  const runtime = activeRuntime;
  activeRuntime = null;
  await runtime?.handle?.close();
  profileSession = undefined;
}
