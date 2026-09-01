import { describe, expect, it } from 'vitest';
import { LibraryApplicationError, createLibraryError } from '@/lib/application/library/library-errors';

describe('library application errors', () => {
  it('exposes stable and actionable error codes', () => {
    const error = createLibraryError('LIBRARY_SCOPE_VIOLATION', 'Alimento fora da Conta ativa.');
    expect(error).toBeInstanceOf(LibraryApplicationError);
    expect(error.code).toBe('LIBRARY_SCOPE_VIOLATION');
    expect(error.message).toContain('Conta ativa');
  });
});
