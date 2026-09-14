/**
 * Compatibility entry point for the former UI model.
 *
 * Clinical persistence is implemented by the canonical diet application;
 * this module only re-exports pure display helpers for code that has not yet
 * migrated its view-model types.
 */
export * from './legacy-diet-types';
export { calculateMealTotals, calculateMealsTotal } from './macroCalculations';

import { calculatePresetCalories } from './presetUtils';
import type { FullDietPlan } from './legacy-diet-types';

export function createInitialDietPlan(
  patientId: string,
  patientTargets: {
    weightKg?: number;
    targetKcal?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
  } = {},
): FullDietPlan {
  const weight = patientTargets.weightKg;
  const hasExplicitTargets = [
    patientTargets.targetProtein,
    patientTargets.targetCarbs,
    patientTargets.targetFats,
    patientTargets.targetKcal,
  ].some((value) => value !== undefined && value > 0);

  const protein = hasExplicitTargets ? patientTargets.targetProtein || 0 : 0;
  const carbs = hasExplicitTargets ? patientTargets.targetCarbs || 0 : 0;
  const fats = hasExplicitTargets ? patientTargets.targetFats || 0 : 0;
  const kcal = hasExplicitTargets ? patientTargets.targetKcal || calculatePresetCalories(protein, carbs, fats) : 0;
  const highCarbs = hasExplicitTargets ? Math.round(carbs * 1.3) : 0;
  const mediumCarbs = carbs;
  const lowCarbs = hasExplicitTargets ? Math.round(carbs * 0.5) : 0;
  const gPerKg = (grams: number) => !weight || weight <= 0 || grams <= 0 ? 0 : Number((grams / weight).toFixed(1));
  const variation = (id: string, name: string, type: 'high' | 'medium' | 'low', assignedDays: FullDietPlan['carbCyclingVariations'][number]['assignedDays'], targetCarbs: number) => ({
    id,
    name,
    type,
    assignedDays,
    targetKcal: hasExplicitTargets ? calculatePresetCalories(protein, targetCarbs, fats) : 0,
    targetProtein: protein,
    targetCarbs,
    targetFats: fats,
    inputMode: 'grams' as const,
    gPerKg: { protein: gPerKg(protein), carbs: gPerKg(targetCarbs), fats: gPerKg(fats) },
    meals: [],
  });

  return {
    id: `diet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    name: 'Prescrição Alimentar',
    createdAt: new Date().toLocaleDateString('pt-BR'),
    updatedAt: new Date().toLocaleDateString('pt-BR'),
    mode: 'simple',
    simpleTargetKcal: kcal,
    simpleTargetProtein: protein,
    simpleTargetCarbs: carbs,
    simpleTargetFats: fats,
    simpleMeals: [],
    carbCyclingVariationsCount: 3,
    carbCyclingVariations: [
      variation('var-high', 'Dia Alto Carbo', 'high', ['seg', 'qua', 'sex'], highCarbs),
      variation('var-med', 'Dia Médio Carbo', 'medium', ['ter', 'qui'], mediumCarbs),
      variation('var-low', 'Dia Baixo Carbo', 'low', ['sab', 'dom'], lowCarbs),
    ],
  };
}
