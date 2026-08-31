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

export interface BrowserPatientRuntime {
  application: PatientApplication;
  dietApplication: DietApplication;
  handle: LocalDatabaseHandle;
}

let runtimePromise: Promise<BrowserPatientRuntime> | undefined;

export async function getBrowserPatientRuntime(): Promise<BrowserPatientRuntime> {
  if (!runtimePromise) {
    runtimePromise = openLocalDatabase().then((handle) => {
      const patientRepository = new LocalPatientRepository(handle);
      const objectiveCatalogRepository = new LocalObjectiveCatalogRepository(handle);
      const accountContext = createActiveAccountContext(new LocalAccountContextRepository(handle));
      const patientProfileReader = createPatientProfileReader(patientRepository, objectiveCatalogRepository);
      const dietRepository = new PGliteDietRepository(handle);
      const dietReader = createPatientDietReader(dietRepository);
      return {
        handle,
        application: createPatientApplication({
          accountContext,
          patientRepository,
          objectiveCatalogRepository,
          patientProfileReader,
          transactionRunner: new LocalTransactionRunner(),
          dietDraftStore: new IndexedDbDietDraftStore(),
        }),
        dietApplication: createDietApplication({ accountContext, patientReader: patientRepository, repository: dietRepository, draftStore: new IndexedDbDietDraftStore(), dietReader }),
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

export function resetBrowserPatientRuntimeForTests(): void {
  runtimePromise = undefined;
}
