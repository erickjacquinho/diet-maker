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
import { createPatientDietReader } from '@/lib/infrastructure/local-db/diets/pglite-patient-diet-reader';
import { InMemoryDietDraftStore } from '@/lib/infrastructure/diet-drafts/in-memory-diet-draft-store';
import { IndexedDbDietDraftStore } from '@/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store';
import { createLibraryApplication, type LibraryApplication } from './library/library-application';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';
import { PGliteReadyMealRepository } from '@/lib/infrastructure/local-db/library/ready-meal-repository';
import { PGliteClinicalRepository } from '@/lib/infrastructure/local-db/clinical-repository';
import { PGliteBackupRepository } from '@/lib/infrastructure/local-db/backup-repository';
import { createBackupApplication, type BackupApplication } from './backup-application';
import { createProfileSession, type ProfileSession } from './profile-session';
import { createBrowserSaveFilePort } from '@/lib/infrastructure/file-system-access/browser-save-file';
import type { Account } from '@/lib/domain/account';
import type { BackupEnvelope } from '@/lib/infrastructure/local-db/logical-export-schema';
import { getFavoritesFromStorage, setFavoritesFromStorage } from '@/lib/library-ui-adapter';

export interface BrowserPatientRuntime {
  readonly account: Account;
  readonly hasExistingWorkspace: boolean;
  readonly application: PatientApplication;
  readonly dietApplication: DietApplication;
  readonly libraryApplication: LibraryApplication;
  readonly backupApplication: BackupApplication;
  readonly handle: LocalDatabaseHandle;
  getCheckpointState(): Promise<{ workspaceRevision: number; checkpointRevision: number }>;
  markWorkspaceDirty(): Promise<void>;
  advanceCheckpoint(revision: number): Promise<void>;
  bindSync(sync: () => Promise<void>): void;
}

let activeRuntime: BrowserPatientRuntime | null = null;
let profileSession: ProfileSession<BrowserPatientRuntime> | undefined;

function createBrowserBackupRepository(handle: LocalDatabaseHandle): PGliteBackupRepository {
  return new PGliteBackupRepository(handle, {
    readFavorites: getFavoritesFromStorage,
    writeFavorites: setFavoritesFromStorage,
  });
}

/** Builds a persistent browser workspace and an isolated memory workspace in tests. */
export async function createBrowserPatientRuntime(account: Account): Promise<BrowserPatientRuntime> {
  const inBrowser = typeof window !== 'undefined';
  const handle = await openLocalDatabase(inBrowser
    ? { mode: 'persistent', dataDir: `idb://nutridiet-${encodeURIComponent(account.id)}` }
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
    const draftStore = inBrowser ? new IndexedDbDietDraftStore() : new InMemoryDietDraftStore();
    const backupRepository = createBrowserBackupRepository(handle);
    const backupApplication = createBackupApplication({
      accountContext,
      repository: backupRepository,
      draftStore,
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

    return {
      account: persistedAccount,
      hasExistingWorkspace,
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
      libraryApplication: createLibraryApplication({ accountContext, foodRepository, recipeRepository, readyMealRepository, confirmedOperation }),
      backupApplication,
    };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

export async function importBrowserPatientSnapshot(runtime: BrowserPatientRuntime, envelope: BackupEnvelope): Promise<void> {
  if (runtime.hasExistingWorkspace) return;
  await createBrowserBackupRepository(runtime.handle).replaceAccountSnapshot(envelope.account[0].id, envelope);
}

export async function exportBrowserPatientSnapshot(runtime: BrowserPatientRuntime): Promise<BackupEnvelope> {
  return createBrowserBackupRepository(runtime.handle).readAccountSnapshot(runtime.account.id);
}

export function activateBrowserPatientRuntime(runtime: BrowserPatientRuntime): BrowserPatientRuntime {
  activeRuntime = runtime;
  return runtime;
}

export async function disposeBrowserPatientRuntime(runtime: BrowserPatientRuntime | null | undefined): Promise<void> {
  if (!runtime) return;
  if (activeRuntime === runtime) activeRuntime = null;
  await runtime.handle.close();
}

export function getBrowserPatientRuntimeIfActive(): BrowserPatientRuntime | null {
  return activeRuntime;
}

export async function getBrowserPatientRuntime(): Promise<BrowserPatientRuntime> {
  if (!activeRuntime) throw new Error('Nenhum profile está ativo nesta sessão.');
  return activeRuntime;
}

export function getBrowserProfileSession(): ProfileSession<BrowserPatientRuntime> {
  if (!profileSession) {
    let session: ProfileSession<BrowserPatientRuntime>;
    session = createProfileSession<BrowserPatientRuntime>({
      filePort: createBrowserSaveFilePort(),
      createRuntime: createBrowserPatientRuntime,
      importSnapshot: importBrowserPatientSnapshot,
      exportSnapshot: exportBrowserPatientSnapshot,
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
  await runtime?.handle.close();
  profileSession = undefined;
}
