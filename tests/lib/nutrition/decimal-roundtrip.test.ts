import { describe, expect, it } from 'vitest';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { scaleNutrition, toDecimal, toPresentation } from '@/lib/domain/diets/nutrition';

describe('decimal nutrition round trips', () => {
  it('keeps reference energy exact through 100 g → 50 g → 100 g', () => {
    const reference = {
      referenceQuantity: createDecimalString('100'),
      protein: createDecimalString('2.5'),
      carbs: createDecimalString('28.1'),
      fat: createDecimalString('0.2'),
      fiber: createDecimalString('1.6'),
      energyKcal: createDecimalString('128'),
    };

    const half = scaleNutrition(reference, createDecimalString('50'));
    const full = scaleNutrition(reference, createDecimalString('100'));
    expect(half.energyKcal).toBe('64');
    expect(full.energyKcal).toBe('128');
    if (full.energyKcal === undefined) throw new Error('energy should be present');
    expect(toDecimal(full.energyKcal)).toBe('128');
  });

  it('formats presentation values with half-up rounding without changing storage', () => {
    expect(toPresentation(createDecimalString('1.25'), 1)).toBe('1.3');
    expect(toPresentation(createDecimalString('1.245'), 2)).toBe('1.25');
  });
});
