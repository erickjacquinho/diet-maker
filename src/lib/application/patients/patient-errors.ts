export type PatientErrorCode =
  | 'INVALID_FIELD'
  | 'ACCOUNT_CONTEXT_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'SCOPE_VIOLATION'
  | 'STALE_VERSION'
  | 'ARCHIVED_PATIENT'
  | 'ALREADY_ARCHIVED'
  | 'ALREADY_ACTIVE'
  | 'DUPLICATE_OBJECTIVE'
  | 'PERSISTENCE_FAILURE';

export class PatientApplicationError extends Error {
  readonly code: PatientErrorCode;
  readonly fieldErrors?: Record<string, string>;
  readonly cause?: unknown;

  constructor(
    code: PatientErrorCode,
    message: string,
    options?: { fieldErrors?: Record<string, string>; cause?: unknown },
  ) {
    super(message);
    this.name = 'PatientApplicationError';
    this.code = code;
    this.fieldErrors = options?.fieldErrors;
    this.cause = options?.cause;
  }
}

export function asPatientApplicationError(error: unknown, fallback = 'A operação do paciente falhou.'): PatientApplicationError {
  if (error instanceof PatientApplicationError) return error;
  return new PatientApplicationError('PERSISTENCE_FAILURE', fallback, { cause: error });
}
