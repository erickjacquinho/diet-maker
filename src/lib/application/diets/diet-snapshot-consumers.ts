import Decimal from 'decimal.js';
import type { DietEditableDocument, DecimalString } from '@/lib/domain/diets/diet-model';
import { createDecimalString } from '@/lib/domain/diets/diet-model';

export interface DietSnapshotTotals {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  fiber: DecimalString;
  energyKcal: DecimalString;
  weightReferenceKg?: DecimalString;
}

export function calculateDocumentSnapshotTotals(document: DietEditableDocument, variationId?: string): DietSnapshotTotals {
  const variation = document.variations.find((candidate) => candidate.id === variationId) ?? document.variations[0];
  const totals = { protein: new Decimal(0), carbs: new Decimal(0), fat: new Decimal(0), fiber: new Decimal(0), energyKcal: new Decimal(0) };
  for (const meal of variation?.meals ?? []) {
    for (const option of meal.options.filter((candidate) => candidate.countsTowardTotals)) {
      for (const item of option.items.filter((candidate) => candidate.role === 'PRIMARY')) {
        const values = item.snapshot.prescribedNutrients;
        totals.protein = totals.protein.plus(values.protein);
        totals.carbs = totals.carbs.plus(values.carbs);
        totals.fat = totals.fat.plus(values.fat);
        totals.fiber = totals.fiber.plus(values.fiber);
        totals.energyKcal = totals.energyKcal.plus(values.energyKcal ?? new Decimal(values.protein).times(4).plus(new Decimal(values.carbs).times(4)).plus(new Decimal(values.fat).times(9)));
      }
    }
  }
  const serialize = (value: Decimal) => createDecimalString(value.toFixed().replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1'));
  return { protein: serialize(totals.protein), carbs: serialize(totals.carbs), fat: serialize(totals.fat), fiber: serialize(totals.fiber), energyKcal: serialize(totals.energyKcal), ...(document.weightReferenceKg ? { weightReferenceKg: document.weightReferenceKg } : {}) };
}
