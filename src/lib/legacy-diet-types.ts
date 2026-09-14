import { calculatePresetCalories } from './presetUtils';

export interface DietItem {
  id?: string;
  foodId?: string;
  name: string;
  quantityGrams: number;
  grams?: number;
  protein: number;
  carbs: number;
  fats: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fatsG?: number;
  kcal: number;
}

export interface DietMealVariation {
  id: string;
  items: DietItem[];
}

export interface DietMeal {
  id: string;
  name: string;
  time: string;
  items: DietItem[];
  variations?: DietMealVariation[];
}

export type CarbCyclingDayType = 'high' | 'medium' | 'low' | 'zero' | 'custom';
export type DayOfWeek = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string; shortLabel: string }[] = [
  { id: 'seg', label: 'Segunda-feira', shortLabel: 'Seg' },
  { id: 'ter', label: 'Terça-feira', shortLabel: 'Ter' },
  { id: 'qua', label: 'Quarta-feira', shortLabel: 'Qua' },
  { id: 'qui', label: 'Quinta-feira', shortLabel: 'Qui' },
  { id: 'sex', label: 'Sexta-feira', shortLabel: 'Sex' },
  { id: 'sab', label: 'Sábado', shortLabel: 'Sáb' },
  { id: 'dom', label: 'Domingo', shortLabel: 'Dom' },
];

export interface CarbCyclingVariation {
  id: string;
  name: string;
  type: CarbCyclingDayType;
  customBadge?: string;
  assignedDays?: DayOfWeek[];
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  inputMode?: 'grams' | 'g_per_kg' | 'percentage' | 'delta_base';
  gPerKg?: { protein: number; carbs: number; fats: number };
  meals: DietMeal[];
}

export interface FullDietPlan {
  id: string;
  patientId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: 'simple' | 'carb_cycling';
  simpleTargetKcal: number;
  simpleTargetProtein: number;
  simpleTargetCarbs: number;
  simpleTargetFats: number;
  simpleMeals: DietMeal[];
  carbCyclingVariationsCount?: 2 | 3 | number;
  carbCyclingVariations: CarbCyclingVariation[];
}

export interface StoredDietRecord {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MealTotals {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
}

export function getItemGrams(item: DietItem): number {
  return item.quantityGrams ?? item.grams ?? 100;
}

export function getItemMacros(item: DietItem): { protein: number; carbs: number; fats: number; kcal: number } {
  const protein = item.protein ?? item.proteinG ?? 0;
  const carbs = item.carbs ?? item.carbsG ?? 0;
  const fats = item.fats ?? item.fatsG ?? item.fatG ?? 0;
  const kcal = item.kcal ?? calculatePresetCalories(protein, carbs, fats);
  return { protein, carbs, fats, kcal };
}

export function calculateWeeklyCycleAverage(variations: CarbCyclingVariation[]): {
  avgKcal: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  daysAssignedCount: number;
} {
  let totalKcal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let daysCount = 0;

  for (const variation of variations) {
    const count = variation.assignedDays?.length ?? 0;
    daysCount += count;
    totalKcal += variation.targetKcal * count;
    totalProtein += variation.targetProtein * count;
    totalCarbs += variation.targetCarbs * count;
    totalFats += variation.targetFats * count;
  }

  const divisor = daysCount > 0 ? daysCount : variations.length || 1;
  if (daysCount === 0) {
    totalKcal = variations.reduce((sum, variation) => sum + variation.targetKcal, 0);
    totalProtein = variations.reduce((sum, variation) => sum + variation.targetProtein, 0);
    totalCarbs = variations.reduce((sum, variation) => sum + variation.targetCarbs, 0);
    totalFats = variations.reduce((sum, variation) => sum + variation.targetFats, 0);
  }

  return {
    avgKcal: Math.round(totalKcal / divisor),
    avgProtein: Math.round(totalProtein / divisor),
    avgCarbs: Math.round(totalCarbs / divisor),
    avgFats: Math.round(totalFats / divisor),
    daysAssignedCount: daysCount,
  };
}
