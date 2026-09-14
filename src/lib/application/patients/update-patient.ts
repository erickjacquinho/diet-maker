import { normalizePatientInput, validatePatientInput, type Patient, type PatientInput } from '@/lib/domain/patient';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientRepository } from '@/lib/persistence/patient-repository';
import { PatientApplicationError } from './patient-errors';

export async function updatePatient(
  dependencies: { accountContext: AccountContext; patientRepository: PatientRepository },
  patientId: string,
  expectedVersion: number,
  input: PatientInput,
): Promise<Patient> {
  const normalized = normalizePatientInput(input);
  const validation = validatePatientInput(normalized);
  if (!validation.valid) throw new PatientApplicationError('INVALID_FIELD', 'Revise os campos do paciente.', { fieldErrors: validation.fieldErrors });
  const account = await dependencies.accountContext.requireActive();
  return dependencies.patientRepository.update(account.accountId, patientId, expectedVersion, normalized);
}
