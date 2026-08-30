import {
  cloneAccountPatientFixture,
  type AccountPatientFixture,
} from '../../fixtures/patients/account-patient-fixtures';
import type { PatientFixtureDatabase } from '../../fixtures/patients/reset-local-db';

export interface PatientTestAdapter extends PatientFixtureDatabase {
  open(): Promise<void>;
}

export interface PatientTestContext {
  database: PatientTestAdapter;
  fixture: AccountPatientFixture;
  reset(): Promise<void>;
  reopen(): Promise<void>;
  close(): Promise<void>;
}

export function createPatientTestContext(
  database: PatientTestAdapter,
  fixture: AccountPatientFixture = cloneAccountPatientFixture(),
): PatientTestContext {
  return {
    database,
    fixture,
    reset: async () => database.reset(cloneAccountPatientFixture()),
    reopen: async () => {
      await database.close?.();
      await database.open();
    },
    close: async () => database.close?.(),
  };
}
