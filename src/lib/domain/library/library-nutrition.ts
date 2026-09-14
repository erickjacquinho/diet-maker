import Decimal from 'decimal.js';
import { createDecimalString, type DecimalString, type EnergySource, type NutritionValues } from '@/lib/domain/diets/diet-model';
import { validateNonNegativeDecimal, validatePositiveDecimal } from './library-validation';
import type { NutritionValuesInput } from './library-model';

export const LIBRARY_CALCULATION_VERSION = 'library-decimal-v1';

export function normalizeDecimal(value: string | number | Decimal): DecimalString {
  const decimal = new Decimal(value);
  if (!decimal.isFinite()) throw new Error('Valor decimal inválido.');
  const normalized = decimal.toFixed().replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  return createDecimalString(normalized || '0');
}

export function normalizeNutrition(input: NutritionValuesInput): NutritionValues {
  validateNonNegativeDecimal(input.protein, 'referenceNutrients.protein');
  validateNonNegativeDecimal(input.carbs, 'referenceNutrients.carbs');
  validateNonNegativeDecimal(input.fat, 'referenceNutrients.fat');
  validateNonNegativeDecimal(input.fiber, 'referenceNutrients.fiber');
  if (input.energyKcal !== undefined) validateNonNegativeDecimal(input.energyKcal, 'referenceNutrients.energyKcal');
  return {
    protein: normalizeDecimal(input.protein),
    carbs: normalizeDecimal(input.carbs),
    fat: normalizeDecimal(input.fat),
    fiber: normalizeDecimal(input.fiber),
    ...(input.energyKcal === undefined ? {} : { energyKcal: normalizeDecimal(input.energyKcal) }),
  };
}

export function calculateEnergyFromNutrition(values: NutritionValues): { value: DecimalString; source: EnergySource } {
  if (values.energyKcal !== undefined) return { value: values.energyKcal, source: 'REFERENCE' };
  return {
    value: normalizeDecimal(new Decimal(values.protein).times(4).plus(new Decimal(values.carbs).times(4)).plus(new Decimal(values.fat).times(9))),
    source: 'CALCULATED_449',
  };
}

export function scaleNutrition(values: NutritionValues, quantity: string, referenceQuantity: string): NutritionValues {
  validatePositiveDecimal(quantity, 'quantity');
  validatePositiveDecimal(referenceQuantity, 'referenceQuantity');
  const ratio = new Decimal(quantity).div(referenceQuantity);
  return {
    protein: normalizeDecimal(new Decimal(values.protein).times(ratio)),
    carbs: normalizeDecimal(new Decimal(values.carbs).times(ratio)),
    fat: normalizeDecimal(new Decimal(values.fat).times(ratio)),
    fiber: normalizeDecimal(new Decimal(values.fiber).times(ratio)),
    ...(values.energyKcal === undefined ? {} : { energyKcal: normalizeDecimal(new Decimal(values.energyKcal).times(ratio)) }),
  };
}

export function sumNutrition(values: NutritionValues[]): NutritionValues {
  const total = values.reduce((acc, current) => ({
    protein: acc.protein.plus(current.protein),
    carbs: acc.carbs.plus(current.carbs),
    fat: acc.fat.plus(current.fat),
    fiber: acc.fiber.plus(current.fiber),
    energyKcal: acc.energyKcal.plus(current.energyKcal ?? new Decimal(current.protein).times(4).plus(new Decimal(current.carbs).times(4)).plus(new Decimal(current.fat).times(9))),
  }), { protein: new Decimal(0), carbs: new Decimal(0), fat: new Decimal(0), fiber: new Decimal(0), energyKcal: new Decimal(0) });
  return {
    protein: normalizeDecimal(total.protein),
    carbs: normalizeDecimal(total.carbs),
    fat: normalizeDecimal(total.fat),
    fiber: normalizeDecimal(total.fiber),
    energyKcal: normalizeDecimal(total.energyKcal),
  };
}

export function divideNutrition(values: NutritionValues, divisor: string): NutritionValues {
  validatePositiveDecimal(divisor, 'yieldPortions');
  const denominator = new Decimal(divisor);
  return {
    protein: normalizeDecimal(new Decimal(values.protein).div(denominator)),
    carbs: normalizeDecimal(new Decimal(values.carbs).div(denominator)),
    fat: normalizeDecimal(new Decimal(values.fat).div(denominator)),
    fiber: normalizeDecimal(new Decimal(values.fiber).div(denominator)),
    ...(values.energyKcal === undefined ? {} : { energyKcal: normalizeDecimal(new Decimal(values.energyKcal).div(denominator)) }),
  };
}
