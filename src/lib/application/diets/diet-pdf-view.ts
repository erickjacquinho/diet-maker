import type { DecimalString, DietEditableDocument } from '@/lib/domain/diets/diet-model';
import { formatNutrition } from '@/lib/domain/diets/nutrition';
import { formatDateOnly } from '@/lib/date-only';
import { calculateDocumentSnapshotTotals, calculateMealOptionSnapshotTotals } from './diet-snapshot-consumers';

export interface DietPdfMacrosView {
  protein: string;
  carbs: string;
  fat: string;
  energyKcal: string;
}

export interface DietPdfItemView {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface DietPdfOptionView {
  id: string;
  label: string;
  items: DietPdfItemView[];
  macros: DietPdfMacrosView | null;
}

export interface DietPdfMealView {
  id: string;
  name: string;
  time?: string;
  options: DietPdfOptionView[];
}

export interface DietPdfViewModel {
  patientName: string;
  prescriptionDate: string;
  prescriptionDateIso: string;
  meals: DietPdfMealView[];
  dayMacros: DietPdfMacrosView | null;
}

function formatMacros(values: {
  protein: DecimalString;
  carbs: DecimalString;
  fat: DecimalString;
  energyKcal: DecimalString;
}): DietPdfMacrosView {
  return {
    protein: formatNutrition(values.protein, 'macro'),
    carbs: formatNutrition(values.carbs, 'macro'),
    fat: formatNutrition(values.fat, 'macro'),
    energyKcal: formatNutrition(values.energyKcal, 'energy'),
  };
}

export function buildDietPdfViewModel(
  document: DietEditableDocument,
  patientName: string,
  prescriptionDateIso: string,
): DietPdfViewModel {
  if (document.mode !== 'SIMPLE') throw new Error('O PDF está disponível para dietas simples.');

  const variation = document.variations[0];
  const meals = [...(variation?.meals ?? [])]
    .sort((left, right) => left.position - right.position)
    .map((meal) => ({
      id: meal.id,
      name: meal.name,
      ...(meal.time ? { time: meal.time } : {}),
      options: [...meal.options]
        .sort((left, right) => left.position - right.position)
        .map((option, index) => ({
          id: option.id,
          label: index === 0 ? 'Principal' : `Alternativa ${index}`,
          items: [...option.items]
            .sort((left, right) => left.position - right.position)
            .map((item) => ({
              id: item.id,
              name: item.snapshot.displayName || item.name,
              quantity: item.snapshot.prescribedQuantity,
              unit: item.snapshot.prescribedUnit,
            })),
          macros: option.items.length ? formatMacros(calculateMealOptionSnapshotTotals(option)) : null,
        })),
    }));

  const hasPrimaryItems = variation?.meals.some((meal) =>
    meal.options.some((option) => option.countsTowardTotals && option.items.some((item) => item.role === 'PRIMARY')),
  ) ?? false;
  const dayTotals = hasPrimaryItems ? calculateDocumentSnapshotTotals(document, variation?.id) : null;

  return {
    patientName,
    prescriptionDate: formatDateOnly(prescriptionDateIso) || 'Data não informada',
    prescriptionDateIso,
    meals,
    dayMacros: dayTotals ? formatMacros({
      protein: dayTotals.protein,
      carbs: dayTotals.carbs,
      fat: dayTotals.fat,
      energyKcal: dayTotals.energyKcal,
    }) : null,
  };
}

export function createDietPdfFilename(view: DietPdfViewModel): string {
  const patientSlug = view.patientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'paciente';
  const date = view.prescriptionDateIso || 'sem-data';
  return `prescricao-${patientSlug}-${date}.pdf`;
}
