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

export interface CarbCyclingVariation {
  id: string;
  name: string;
  type: 'high' | 'medium' | 'low';
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
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
  carbCyclingVariationsCount: 2 | 3;
  carbCyclingVariations: CarbCyclingVariation[];
}

export interface MealTotals {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
}

const DIETS_KEY_PREFIX = 'nutridiet_diets_';

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

  return updatedDiet;
}

export function createInitialDietPlan(patientId: string, patientTargets?: {
  weightKg?: number;
  targetKcal?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}): FullDietPlan {
  const weight = patientTargets?.weightKg || 70;
  const baseKcal = patientTargets?.targetKcal || 2000;
  const baseProt = patientTargets?.targetProtein || Math.round(weight * 2.0);
  const baseCarb = patientTargets?.targetCarbs || Math.round(weight * 3.0);
  const baseFat = patientTargets?.targetFats || Math.round(weight * 0.8);

  const defaultHighCarb = Math.round(baseCarb * 1.3);
  const defaultMedCarb = baseCarb;
  const defaultLowCarb = Math.round(baseCarb * 0.5);

  const highKcal = calculatePresetCalories(baseProt, defaultHighCarb, baseFat);
  const medKcal = calculatePresetCalories(baseProt, defaultMedCarb, baseFat);
  const lowKcal = calculatePresetCalories(baseProt, defaultLowCarb, baseFat);

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
        targetKcal: highKcal,
        targetProtein: baseProt,
        targetCarbs: defaultHighCarb,
        targetFats: baseFat,
        meals: [],
      },
      {
        id: 'var-med',
        name: 'Dia Médio Carbo',
        type: 'medium',
        targetKcal: medKcal,
        targetProtein: baseProt,
        targetCarbs: defaultMedCarb,
        targetFats: baseFat,
        meals: [],
      },
      {
        id: 'var-low',
        name: 'Dia Baixo Carbo',
        type: 'low',
        targetKcal: lowKcal,
        targetProtein: baseProt,
        targetCarbs: defaultLowCarb,
        targetFats: baseFat,
        meals: [],
      },
    ],
  };
}
