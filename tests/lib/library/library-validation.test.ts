import { describe, expect, it } from 'vitest';
import { validateCustomFoodInput, validatePositiveDecimal, validateLibraryName } from '@/lib/domain/library/library-validation';
import { customFoodInput, invalidCustomFoodInput } from '../../fixtures/library-fixtures';

describe('library domain validation', () => {
  it('accepts valid custom food input', () => {
    expect(() => validateCustomFoodInput(customFoodInput)).not.toThrow();
  });

  it('reports invalid fields without coercing them to fallback values', () => {
    expect(() => validateCustomFoodInput(invalidCustomFoodInput)).toThrowError(/name|protein/i);
    expect(() => validatePositiveDecimal('NaN', 'yieldPortions')).toThrowError(/yieldPortions/i);
    expect(() => validateLibraryName('   ')).toThrowError(/name/i);
  });
});
