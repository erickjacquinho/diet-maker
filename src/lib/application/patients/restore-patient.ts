import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientRepository } from '@/lib/persistence/patient-repository';
import type { Patient } from '@/lib/domain/patient';

export async function restorePatient(
  dependencies: { accountContext: AccountContext; patientRepository: PatientRepository },
  patientId: string,
  expectedVersion: number,
): Promise<Patient> {
  const account = await dependencies.accountContext.requireActive();
  return dependencies.patientRepository.restore(account.accountId, patientId, expectedVersion);
}
