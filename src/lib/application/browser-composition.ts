import { createPatientApplication, type PatientApplication } from './composition-root';
import { createActiveAccountContext } from './account/get-active-account';
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
import { IndexedDbDietDraftStore } from '@/lib/infrastructure/diet-drafts/indexed-db-diet-draft-store';
import { createLibraryApplication, type LibraryApplication } from './library/library-application';
import { PGliteFoodCatalogRepository } from '@/lib/infrastructure/local-db/library/pglite-food-catalog-repository';
import { PGliteRecipeRepository } from '@/lib/infrastructure/local-db/library/recipe-repository';
import { PGliteReadyMealRepository } from '@/lib/infrastructure/local-db/library/ready-meal-repository';
import { PGliteClinicalRepository } from '@/lib/infrastructure/local-db/clinical-repository';

export interface BrowserPatientRuntime {
  application: PatientApplication;
  dietApplication: DietApplication;
  libraryApplication: LibraryApplication;
  handle: LocalDatabaseHandle;
}

let runtimePromise: Promise<BrowserPatientRuntime> | undefined;

export async function getBrowserPatientRuntime(): Promise<BrowserPatientRuntime> {
  if (!runtimePromise) {
    runtimePromise = openLocalDatabase().then((handle) => {
      const patientRepository = new LocalPatientRepository(handle);
      const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
      const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
      const dietRepository = new PGliteDietRepository(handle);
      const dietReader = createPatientDietReader(dietRepository);
      const clinicalRepository = new PGliteClinicalRepository(handle);
      const patientProfileReader = createPatientProfileReader(
        patientRepository,
        objectiveCatalogRepository,
        (accountId, patientId) => dietReader.getPatientDietSummary(accountId, patientId).then((summary) => {
          const plans = [summary.current?.plan, ...summary.history.map((row) => row.plan)].filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
          const latest = [...plans].sort((left, right) => right.activatedAt.localeCompare(left.activatedAt) || right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id))[0];
          return {
            dietCount: summary.confirmedCount,
            assessmentCount: 0,
            lastActivity: latest ? { eventDate: latest.activatedAt.slice(0, 10), confirmedAt: latest.updatedAt, type: 'diet' as const, sourceId: latest.id } : null,
          };
        }),
        { clinicalRepository },
      );
      const foodRepository = new PGliteFoodCatalogRepository(handle);
      const recipeRepository = new PGliteRecipeRepository(handle, { foodRepository });
      const readyMealRepository = new PGliteReadyMealRepository(handle, { foodRepository, recipeRepository });
      return {
        handle,
        application: createPatientApplication({
          accountContext,
          patientRepository,
          objectiveCatalogRepository,
          patientProfileReader,
          transactionRunner: new LocalTransactionRunner(),
          dietDraftStore: new IndexedDbDietDraftStore(),
          clinicalRepository,
          patientDietReader: dietReader,
        }),
        dietApplication: createDietApplication({ accountContext, patientReader: patientRepository, repository: dietRepository, draftStore: new IndexedDbDietDraftStore(), dietReader, librarySourceReader: { getRecipe: (accountId, recipeId) => recipeRepository.getById(accountId, recipeId), getReadyMeal: (accountId, readyMealId) => readyMealRepository.getById(accountId, readyMealId) } }),
        libraryApplication: createLibraryApplication({ accountContext, foodRepository, recipeRepository, readyMealRepository }),
      };
    }).catch((error) => {
      runtimePromise = undefined;
      throw error;
    });
  }
  return runtimePromise;
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

export function resetBrowserPatientRuntimeForTests(): void {
  runtimePromise = undefined;
}
