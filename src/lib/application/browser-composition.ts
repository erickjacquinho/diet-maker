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
  readonly application: PatientApplication;
  readonly dietApplication: DietApplication;
  readonly libraryApplication: LibraryApplication;
  readonly backupApplication: BackupApplication;
  readonly handle: LocalDatabaseHandle;
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

/** Builds an isolated runtime for one in-memory tab session. */
export async function createBrowserPatientRuntime(account: Account): Promise<BrowserPatientRuntime> {
  const handle = await openLocalDatabase({ mode: 'memory' });
  try {
    let syncAfterConfirmedOperation: (() => Promise<void>) | undefined;
    const confirmedOperation = createConfirmedOperationCoordinator(async () => {
      await syncAfterConfirmedOperation?.();
    });
    const accountRepository = new LocalAccountContextRepository(handle);
    const persistedAccount = await accountRepository.saveAccount(account);
    const accountContext = createExplicitAccountContext(persistedAccount);
    const patientRepository = new LocalPatientRepository(handle);
    const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
    const dietRepository = new PGliteDietRepository(handle);
    const dietReader = createPatientDietReader(dietRepository);
    const clinicalRepository = new PGliteClinicalRepository(handle);
    const draftStore = new InMemoryDietDraftStore();
    const backupRepository = createBrowserBackupRepository(handle);
    const backupApplication = createBackupApplication({ accountContext, repository: backupRepository, draftStore });
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
      handle,
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
