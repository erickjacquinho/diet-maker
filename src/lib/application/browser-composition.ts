import { createPatientApplication, type PatientApplication } from './composition-root';
import { createActiveAccountContext } from './account/get-active-account';
import { openLocalDatabase, type LocalDatabaseHandle } from '@/lib/infrastructure/local-db/client';
import { LocalAccountContextRepository } from '@/lib/infrastructure/local-db/account-context';
import { LocalObjectiveCatalogRepository } from '@/lib/infrastructure/local-db/objective-catalog-repository';
import { LocalPatientRepository } from '@/lib/infrastructure/local-db/patient-repository';
import { LocalTransactionRunner } from '@/lib/infrastructure/local-db/transaction-runner';
import { createPatientProfileReader } from './patients/patient-profile-reader';

export interface BrowserPatientRuntime {
  application: PatientApplication;
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
      return {
        handle,
        application: createPatientApplication({
          accountContext,
          patientRepository,
          objectiveCatalogRepository,
          patientProfileReader,
          transactionRunner: new LocalTransactionRunner(),
        }),
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

export function resetBrowserPatientRuntimeForTests(): void {
  runtimePromise = undefined;
}
