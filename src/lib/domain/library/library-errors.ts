export class LibraryValidationError extends Error {
  readonly code = 'LIBRARY_VALIDATION_FAILED';

  constructor(
    readonly field: string,
    message: string,
  ) {
    super(field + ': ' + message);
    this.name = 'LibraryValidationError';
  }
}

export function libraryValidationError(field: string, message: string): never {
  throw new LibraryValidationError(field, message);
}
