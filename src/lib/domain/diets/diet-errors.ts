export type DietErrorCode =
  | 'INVALID_DECIMAL'
  | 'INVALID_DIET'
  | 'INVALID_MINIMUM'
  | 'INVALID_SNAPSHOT'
  | 'CONTEXT_MISSING'
  | 'PATIENT_NOT_FOUND'
  | 'ARCHIVED_PATIENT'
  | 'READ_ONLY_DIET'
  | 'VERSION_CONFLICT'
  | 'PERSISTENCE_UNAVAILABLE'
  | 'RESULT_UNKNOWN'
  | 'CLEANUP_PENDING';

export class DietDomainError extends Error {
  readonly code: DietErrorCode;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: DietErrorCode, message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.name = 'DietDomainError';
    this.code = code;
    this.details = details;
  }
}

export function isDietDomainError(error: unknown): error is DietDomainError {
  return error instanceof DietDomainError;
}
