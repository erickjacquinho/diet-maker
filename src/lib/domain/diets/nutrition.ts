import Decimal from 'decimal.js';
import type { DecimalString, EnergySource, NutritionValues } from './diet-model';
import { createDecimalString } from './diet-model';

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export interface ScalableNutritionReference {
  referenceQuantity: DecimalString;
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  fiber: DecimalString;
  energyKcal?: DecimalString;
}

export interface ScaledNutrition {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  fiber: DecimalString;
  energyKcal?: DecimalString;
}

export interface CalculatedEnergy {
  value: DecimalString;
  source: EnergySource;
}

function decimal(value: string): Decimal {
  return new Decimal(value);
}

function serialize(value: Decimal): DecimalString {
  return createDecimalString(value.toFixed().replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1'));
}

export function toDecimal(value: DecimalString | string): string {
  return decimal(value).toFixed();
}

export function toPresentation(value: DecimalString | string, decimalPlaces: number): string {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) throw new Error('Casas decimais inválidas.');
  return decimal(value).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP).toFixed(decimalPlaces);
}

export function calculateEnergyFromMacros(values: {
  protein: DecimalString | string;
  carbs: DecimalString | string;
  fat: DecimalString | string;
  energyKcal?: DecimalString | string;
}): CalculatedEnergy {
  if (values.energyKcal !== undefined) {
    return { value: serialize(decimal(values.energyKcal)), source: 'REFERENCE' };
  }
  const energy = decimal(values.protein).times(4).plus(decimal(values.carbs).times(4)).plus(decimal(values.fat).times(9));
  return { value: serialize(energy), source: 'CALCULATED_449' };
}

export function scaleNutrition(reference: ScalableNutritionReference, prescribedQuantity: DecimalString): ScaledNutrition {
  const ratio = decimal(prescribedQuantity).div(decimal(reference.referenceQuantity));
  const energy = reference.energyKcal === undefined ? undefined : serialize(decimal(reference.energyKcal).times(ratio));
  return {
    protein: serialize(decimal(reference.protein).times(ratio)),
    carbs: serialize(decimal(reference.carbs).times(ratio)),
    fat: serialize(decimal(reference.fat).times(ratio)),
    fiber: serialize(decimal(reference.fiber).times(ratio)),
    ...(energy === undefined ? {} : { energyKcal: energy }),
  };
}

export function calculateScaledNutrition(reference: NutritionValues, referenceQuantity: DecimalString, prescribedQuantity: DecimalString): NutritionValues {
  const scaled = scaleNutrition({
    referenceQuantity,
    protein: reference.protein,
    carbs: reference.carbs,
    fat: reference.fat,
    fiber: reference.fiber,
    energyKcal: reference.energyKcal,
  }, prescribedQuantity);
  return scaled;
}

export function formatNutrition(value: DecimalString, kind: 'macro' | 'energy' | 'g-per-kg'): string {
  return toPresentation(value, kind === 'macro' ? 1 : kind === 'energy' ? 0 : 2);
}
