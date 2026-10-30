import { ApiClientError } from '@/lib/api-client/client';
import { ClinicalApplicationError } from '@/lib/domain/clinical';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';

/** The API reports only a status and a code; these helpers translate them into the application errors the screens already handle. */

export function isApiStatus(error: unknown, status: number): boolean {
  return error instanceof ApiClientError && error.status === status;
}

export type PatientOperation = 'read' | 'create' | 'update' | 'archive' | 'restore';

export function toPatientError(error: unknown, operation: PatientOperation): PatientApplicationError {
  if (error instanceof PatientApplicationError) return error;
  if (error instanceof ApiClientError) {
    if (error.status === 404) return new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.', { cause: error });
    if (error.status === 409 && error.code === 'VERSION_CONFLICT') {
      return new PatientApplicationError('STALE_VERSION', 'O cadastro foi alterado por outra operação. Recarregue antes de salvar.', { cause: error });
    }
    if (error.status === 422) {
      // The server answers 422 for an archived patient being edited and for a no-op archive/restore.
      if (operation === 'archive') return new PatientApplicationError('ALREADY_ARCHIVED', 'O paciente já está arquivado.', { cause: error });
      if (operation === 'restore') return new PatientApplicationError('ALREADY_ACTIVE', 'O paciente já está ativo.', { cause: error });
      return new PatientApplicationError('ARCHIVED_PATIENT', 'Paciente arquivado não pode ser editado.', { cause: error });
    }
    if (error.status === 400) return new PatientApplicationError('INVALID_FIELD', 'Revise os campos do paciente.', { cause: error });
  }
  return new PatientApplicationError('PERSISTENCE_FAILURE', 'A operação do paciente falhou.', { cause: error });
}

export function toClinicalError(error: unknown, fallback = 'A operação clínica falhou.'): ClinicalApplicationError {
  if (error instanceof ClinicalApplicationError) return error;
  if (error instanceof ApiClientError) {
    if (error.status === 404) return new ClinicalApplicationError('CLINICAL_PATIENT_NOT_FOUND', 'Paciente ou registro não encontrado nesta Conta.', { cause: error });
    if (error.status === 409) return new ClinicalApplicationError('CLINICAL_VERSION_CONFLICT', 'O registro foi alterado por outra operação. Recarregue e tente de novo.', { cause: error });
    if (error.status === 422 || error.status === 400) return new ClinicalApplicationError('CLINICAL_VALIDATION_FAILED', 'Os dados informados são inválidos.', { cause: error });
  }
  return new ClinicalApplicationError('CLINICAL_TRANSACTION_FAILED', fallback, { cause: error });
}
