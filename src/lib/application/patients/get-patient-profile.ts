import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientProfile, PatientProfileReader } from '@/lib/persistence/patient-profile-reader';
import { PatientApplicationError } from './patient-errors';

export async function getPatientProfile(
  dependencies: { accountContext: AccountContext; patientProfileReader: PatientProfileReader },
  patientId: string,
): Promise<PatientProfile> {
  const account = await dependencies.accountContext.requireActive();
  const profile = await dependencies.patientProfileReader.getProfile(account.accountId, patientId);
  if (!profile) throw new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.');
  return profile;
}
