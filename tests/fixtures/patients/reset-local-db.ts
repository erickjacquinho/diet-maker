import { EMPTY_ACCOUNT_PATIENT_FIXTURE, type AccountPatientFixture } from './account-patient-fixtures';

export interface PatientFixtureDatabase {
  reset(fixture: AccountPatientFixture): Promise<void>;
  close?(): Promise<void>;
}

export async function resetLocalPatientDatabase(
  database: PatientFixtureDatabase,
  fixture: AccountPatientFixture = EMPTY_ACCOUNT_PATIENT_FIXTURE,
): Promise<void> {
  await database.reset(structuredClone(fixture));
}
