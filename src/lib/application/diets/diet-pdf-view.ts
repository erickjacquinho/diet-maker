import type { DecimalString, DietDayCode, DietEditableDocument, DietVariation } from '@/lib/domain/diets/diet-model';
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

export interface DietPdfCycleDietView {
  id: string;
  number: number;
  name: string;
  assignedDays: string[];
  meals: DietPdfMealView[];
  macros: DietPdfMacrosView | null;
}

export interface DietPdfCycleViewModel {
  patientName: string;
  prescriptionDate: string;
  prescriptionDateIso: string;
  diets: DietPdfCycleDietView[];
}

export type DietPdfDocumentViewModel = DietPdfViewModel | DietPdfCycleViewModel;

const SHORT_DAY_LABELS: Record<DietDayCode, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
};
const DAY_ORDER: DietDayCode[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

function buildMeals(variation: DietVariation): DietPdfMealView[] {
  return [...variation.meals]
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
}

function buildVariationMacros(document: DietEditableDocument, variation: DietVariation): DietPdfMacrosView | null {
  const hasPrimaryItems = variation.meals.some((meal) =>
    meal.options.some((option) =>
      option.countsTowardTotals && option.items.some((item) => item.role === 'PRIMARY'),
    ),
  );
  return hasPrimaryItems ? formatMacros(calculateDocumentSnapshotTotals(document, variation.id)) : null;
}

export function buildDietPdfViewModel(
  document: DietEditableDocument,
  patientName: string,
  prescriptionDateIso: string,
): DietPdfViewModel {
  if (document.mode !== 'SIMPLE') throw new Error('O PDF está disponível para dietas simples.');

  const variation = document.variations[0];
  const meals = variation ? buildMeals(variation) : [];

  return {
    patientName,
    prescriptionDate: formatDateOnly(prescriptionDateIso) || 'Data não informada',
    prescriptionDateIso,
    meals,
    dayMacros: variation ? buildVariationMacros(document, variation) : null,
  };
}

export function buildDietCyclePdfViewModel(
  document: DietEditableDocument,
  patientName: string,
  prescriptionDateIso: string,
): DietPdfCycleViewModel {
  if (document.mode !== 'CARB_CYCLING') throw new Error('O PDF do ciclo está disponível para dietas por ciclo de carboidratos.');

  return {
    patientName,
    prescriptionDate: formatDateOnly(prescriptionDateIso) || 'Data não informada',
    prescriptionDateIso,
    diets: [...document.variations]
      .sort((left, right) => left.position - right.position)
      .map((variation, index) => ({
        id: variation.id,
        number: index + 1,
        name: variation.name,
        assignedDays: DAY_ORDER.filter((day) => variation.assignedDays.includes(day)).map((day) => SHORT_DAY_LABELS[day]),
        meals: buildMeals(variation),
        macros: buildVariationMacros(document, variation),
      })),
  };
}

export function createDietPdfFilename(view: DietPdfDocumentViewModel): string {
  const patientSlug = view.patientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'paciente';
  const date = view.prescriptionDateIso || 'sem-data';
  return `prescricao-${patientSlug}-${date}.pdf`;
}
