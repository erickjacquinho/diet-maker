import { describe, expect, it } from 'vitest';
import { calculateEnergyFromNutrition, normalizeNutrition } from '@/lib/domain/library/library-nutrition';
import { customFoodInput } from '../../fixtures/library-fixtures';

describe('custom food domain', () => {
  it('normalizes decimal nutrients without losing precision and derives energy when absent', () => {
    const nutrients = normalizeNutrition({ ...customFoodInput.referenceNutrients, energyKcal: undefined });
    const energy = calculateEnergyFromNutrition(nutrients);
    expect(nutrients.protein).toBe('10.25');
    expect(energy.source).toBe('CALCULATED_449');
    expect(energy.value).toBe('93.5');
  });

  it('keeps the input immutable and preserves explicit reference energy', () => {
    const input = structuredClone(customFoodInput);
    const nutrients = normalizeNutrition(input.referenceNutrients);
    expect(input).toEqual(customFoodInput);
    expect(calculateEnergyFromNutrition(nutrients)).toMatchObject({ value: '91', source: 'REFERENCE' });
  });
});
