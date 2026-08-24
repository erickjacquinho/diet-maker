'use client';

import { calculatePresetCalories } from './presetUtils';
import { recordPatientActivity } from './patientsStore';
import { calculateMealTotals, calculateMealsTotal } from './macroCalculations';
import { getStorageItem, setStorageItem } from './storage';

export { calculateMealTotals, calculateMealsTotal };

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

export interface DietMeal {
  id: string;
  name: string;
  time: string;
  items: DietItem[];
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

export interface MealTotals {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
}

export function calculateWeeklyCycleAverage(variations: CarbCyclingVariation[]): {
  avgKcal: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  daysAssignedCount: number;
} {
  let totalKcal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let daysCount = 0;

  variations.forEach((v) => {
    const days = v.assignedDays || [];
    const count = days.length;
    daysCount += count;
    totalKcal += v.targetKcal * count;
    totalProt += v.targetProtein * count;
    totalCarb += v.targetCarbs * count;
    totalFat += v.targetFats * count;
  });

  const divisor = daysCount > 0 ? daysCount : variations.length || 1;

  if (daysCount === 0) {
    // If no days are assigned, calculate simple average across variations
    const sumKcal = variations.reduce((acc, v) => acc + v.targetKcal, 0);
    const sumProt = variations.reduce((acc, v) => acc + v.targetProtein, 0);
    const sumCarb = variations.reduce((acc, v) => acc + v.targetCarbs, 0);
    const sumFat = variations.reduce((acc, v) => acc + v.targetFats, 0);
    return {
      avgKcal: Math.round(sumKcal / divisor),
      avgProtein: Math.round(sumProt / divisor),
      avgCarbs: Math.round(sumCarb / divisor),
      avgFats: Math.round(sumFat / divisor),
      daysAssignedCount: 0,
    };
  }

  return {
    avgKcal: Math.round(totalKcal / divisor),
    avgProtein: Math.round(totalProt / divisor),
    avgCarbs: Math.round(totalCarb / divisor),
    avgFats: Math.round(totalFat / divisor),
    daysAssignedCount: daysCount,
  };
}

export const DIETS_KEY_PREFIX = 'nutridiet_diets_';

export function getPatientDietsFromStorage(patientId: string): FullDietPlan[] {
  const saved = getStorageItem<FullDietPlan[]>(`${DIETS_KEY_PREFIX}${patientId}`, []);
  return Array.isArray(saved) ? saved : [];
}

export function getDietFromStorage(patientId: string, dietId: string): FullDietPlan | null {
  const diets = getPatientDietsFromStorage(patientId);
  return diets.find((d) => d.id === dietId) || null;
}

export function saveDietToStorage(diet: FullDietPlan): FullDietPlan {
  const current = getPatientDietsFromStorage(diet.patientId);
  const existingIndex = current.findIndex((d) => d.id === diet.id);

  const updatedDiet = {
    ...diet,
    updatedAt: new Date().toLocaleDateString('pt-BR'),
  };

  const updatedList = existingIndex >= 0
    ? current.map((d) => (d.id === diet.id ? updatedDiet : d))
    : [updatedDiet, ...current];

  setStorageItem(`${DIETS_KEY_PREFIX}${diet.patientId}`, updatedList);
  recordPatientActivity(diet.patientId, 'diet');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nutridiet-diet-sync', { detail: { patientId: diet.patientId, dietId: diet.id } }));
  }

  return updatedDiet;
}

export function createInitialDietPlan(patientId: string, patientTargets?: {
  weightKg?: number;
  targetKcal?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}): FullDietPlan {
  const weight = patientTargets?.weightKg;
  const hasExplicitTargets =
    (patientTargets?.targetProtein !== undefined && patientTargets.targetProtein > 0) ||
    (patientTargets?.targetCarbs !== undefined && patientTargets.targetCarbs > 0) ||
    (patientTargets?.targetFats !== undefined && patientTargets.targetFats > 0) ||
    (patientTargets?.targetKcal !== undefined && patientTargets.targetKcal > 0);

  const baseProt = hasExplicitTargets ? (patientTargets?.targetProtein || 0) : 0;
  const baseCarb = hasExplicitTargets ? (patientTargets?.targetCarbs || 0) : 0;
  const baseFat = hasExplicitTargets ? (patientTargets?.targetFats || 0) : 0;
  const baseKcal = hasExplicitTargets
    ? (patientTargets?.targetKcal || calculatePresetCalories(baseProt, baseCarb, baseFat))
    : 0;

  const defaultHighCarb = hasExplicitTargets ? Math.round(baseCarb * 1.3) : 0;
  const defaultMedCarb = baseCarb;
  const defaultLowCarb = hasExplicitTargets ? Math.round(baseCarb * 0.5) : 0;

  const highKcal = hasExplicitTargets ? calculatePresetCalories(baseProt, defaultHighCarb, baseFat) : 0;
  const medKcal = hasExplicitTargets ? calculatePresetCalories(baseProt, defaultMedCarb, baseFat) : 0;
  const lowKcal = hasExplicitTargets ? calculatePresetCalories(baseProt, defaultLowCarb, baseFat) : 0;

  const calculateGPerKgSafe = (grams: number) => {
    if (!weight || weight <= 0 || grams <= 0) return 0;
    return Number((grams / weight).toFixed(1));
  };

  return {
    id: `diet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    patientId,
    name: 'Prescrição Alimentar',
    createdAt: new Date().toLocaleDateString('pt-BR'),
    updatedAt: new Date().toLocaleDateString('pt-BR'),
    mode: 'simple',
    simpleTargetKcal: baseKcal,
    simpleTargetProtein: baseProt,
    simpleTargetCarbs: baseCarb,
    simpleTargetFats: baseFat,
    simpleMeals: [],
    carbCyclingVariationsCount: 3,
    carbCyclingVariations: [
      {
        id: 'var-high',
        name: 'Dia Alto Carbo',
        type: 'high',
        assignedDays: ['seg', 'qua', 'sex'],
        targetKcal: highKcal,
        targetProtein: baseProt,
        targetCarbs: defaultHighCarb,
        targetFats: baseFat,
        inputMode: 'grams',
        gPerKg: {
          protein: calculateGPerKgSafe(baseProt),
          carbs: calculateGPerKgSafe(defaultHighCarb),
          fats: calculateGPerKgSafe(baseFat),
        },
        meals: [],
      },
      {
        id: 'var-med',
        name: 'Dia Médio Carbo',
        type: 'medium',
        assignedDays: ['ter', 'qui'],
        targetKcal: medKcal,
        targetProtein: baseProt,
        targetCarbs: defaultMedCarb,
        targetFats: baseFat,
        inputMode: 'grams',
        gPerKg: {
          protein: calculateGPerKgSafe(baseProt),
          carbs: calculateGPerKgSafe(defaultMedCarb),
          fats: calculateGPerKgSafe(baseFat),
        },
        meals: [],
      },
      {
        id: 'var-low',
        name: 'Dia Baixo Carbo',
        type: 'low',
        assignedDays: ['sab', 'dom'],
        targetKcal: lowKcal,
        targetProtein: baseProt,
        targetCarbs: defaultLowCarb,
        targetFats: baseFat,
        inputMode: 'grams',
        gPerKg: {
          protein: calculateGPerKgSafe(baseProt),
          carbs: calculateGPerKgSafe(defaultLowCarb),
          fats: calculateGPerKgSafe(baseFat),
        },
        meals: [],
      },
    ],
  };
}
