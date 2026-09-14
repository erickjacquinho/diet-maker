import { describe, expect, it } from 'vitest';
import { createDecimalString } from '@/lib/domain/diets/diet-model';
import { calculateEnergyFromMacros, scaleNutrition } from '@/lib/domain/diets/nutrition';

describe('nutrition calculation contract', () => {
  it('uses supplied reference energy, including zero, instead of 4–4–9', () => {
    expect(calculateEnergyFromMacros({ protein: '10', carbs: '20', fat: '5', energyKcal: '0' })).toEqual({ value: '0', source: 'REFERENCE' });
    expect(calculateEnergyFromMacros({ protein: '10', carbs: '20', fat: '5' })).toEqual({ value: '165', source: 'CALCULATED_449' });
  });

  it('scales precise nutrients without converting through binary numbers', () => {
    const result = scaleNutrition({
      referenceQuantity: createDecimalString('128'),
      protein: createDecimalString('1.7'),
      carbs: createDecimalString('2.3'),
      fat: createDecimalString('0.1'),
      fiber: createDecimalString('0'),
      energyKcal: createDecimalString('128'),
    }, createDecimalString('64'));
    expect(result.protein).toBe('0.85');
    expect(result.carbs).toBe('1.15');
    expect(result.energyKcal).toBe('64');
  });
});
