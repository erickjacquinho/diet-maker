import { nanoid } from 'nanoid';
import { normalizePatientInput, validatePatientInput, type Patient, type PatientInput } from '@/lib/domain/patient';
import { PatientApplicationError } from './patient-errors';
import type { AccountContext } from '@/lib/persistence/account-context';
import type { PatientRepository } from '@/lib/persistence/patient-repository';

export async function createPatient(
  dependencies: { accountContext: AccountContext; patientRepository: PatientRepository },
  input: PatientInput,
): Promise<Patient> {
  const normalized = normalizePatientInput(input);
  const validation = validatePatientInput(normalized);
  if (!validation.valid) throw new PatientApplicationError('INVALID_FIELD', 'Revise os campos do paciente.', { fieldErrors: validation.fieldErrors });
  const account = await dependencies.accountContext.requireActive();
  return dependencies.patientRepository.create(account.accountId, normalized);
}

export function createPatientId(): string {
  return nanoid(16);
}
