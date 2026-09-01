export const LIBRARY_ERROR_CODES = [
  'LIBRARY_CONTEXT_MISSING',
  'LIBRARY_NOT_FOUND',
  'LIBRARY_SCOPE_VIOLATION',
  'LIBRARY_VALIDATION_FAILED',
  'LIBRARY_VERSION_CONFLICT',
  'LIBRARY_DEPENDENCY_EXISTS',
  'LIBRARY_COMPOSITION_CYCLE',
  'LIBRARY_TRANSACTION_FAILED',
] as const;

export type LibraryErrorCode = (typeof LIBRARY_ERROR_CODES)[number];

export class LibraryApplicationError extends Error {
  readonly name = 'LibraryApplicationError';

  constructor(
    readonly code: LibraryErrorCode,
    message: string,
    readonly field?: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export function createLibraryError(
  code: LibraryErrorCode,
  message: string,
  field?: string,
  options?: { cause?: unknown },
): LibraryApplicationError {
  return new LibraryApplicationError(code, message, field, options);
}
