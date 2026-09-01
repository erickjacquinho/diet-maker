import { describe, expect, it } from 'vitest';
import { calculateEnergyFromNutrition, divideNutrition, scaleNutrition, sumNutrition } from '@/lib/domain/library/library-nutrition';
import { createTacoSnapshot } from '@/lib/application/diets/taco-food-adapter';

describe('recipe domain nutrition', () => {
  it('keeps ingredient snapshots ordered and calculates total and per-portion values in decimal arithmetic', () => {
    const first = createTacoSnapshot('taco-1', '100');
    const second = createTacoSnapshot('taco-2', '50');
    const total = sumNutrition([first.prescribedNutrients, second.prescribedNutrients]);
    const perPortion = divideNutrition(total, '2');
    expect(total.energyKcal).toBeDefined();
    expect(perPortion.protein).toBe('3.125');
    expect(calculateEnergyFromNutrition(first.referenceNutrients).source).toBe('REFERENCE');
    expect(scaleNutrition(first.referenceNutrients, '50', '100').energyKcal).toBe('62');
  });
});
