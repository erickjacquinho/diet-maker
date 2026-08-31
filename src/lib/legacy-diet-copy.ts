import type { FullDietPlan, DietMeal, CarbCyclingVariation } from './legacy-diet-types';
import type { HistoricalDiet } from './patientsStore';
import { calculateWeeklyCycleAverage } from './legacy-diet-types';
import { normalizeDateToISO } from './date-only';
import { calculatePresetCalories } from './presetUtils';
import { cloneMealGroupWithFreshIds } from './mealVariations';

export interface PreviousDietSummary {
  id: string;
  name: string;
  date: string;
  mode: 'simple' | 'carb_cycling';
  modeLabel: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  mealsCount: number;
  variationsCount?: number;
  daysAssignedCount?: number;
  fullPlan?: FullDietPlan;
  historicalDiet?: HistoricalDiet;
}

export type ImportActionType = 'macros_only' | 'all_meals';

export function buildPreviousDietSummaries(
  storedDiets: FullDietPlan[] = [],
  historicalDiets: HistoricalDiet[] = [],
  currentDietId?: string,
): PreviousDietSummary[] {
  const summaries: PreviousDietSummary[] = [];
  const seenIds = new Set<string>();

  for (const diet of storedDiets) {
    if (!diet || diet.id === 'nova' || (currentDietId && diet.id === currentDietId)) continue;
    seenIds.add(diet.id);

    const isCycling = diet.mode === 'carb_cycling';
    const variations = isCycling ? diet.carbCyclingVariations || [] : [];
    const firstVariation = variations[0];
    const cycleAverage = variations.length > 0 ? calculateWeeklyCycleAverage(variations) : null;

    let targetKcal = diet.simpleTargetKcal || 0;
    let proteinG = diet.simpleTargetProtein || 0;
    let carbsG = diet.simpleTargetCarbs || 0;
    let fatsG = diet.simpleTargetFats || 0;
    let mealsCount = diet.simpleMeals?.length || 0;

    if (isCycling && cycleAverage) {
      targetKcal = cycleAverage.avgKcal;
      proteinG = cycleAverage.avgProtein;
      carbsG = cycleAverage.avgCarbs;
      fatsG = cycleAverage.avgFats;
      mealsCount = firstVariation?.meals?.length || 0;
    }

    if (!targetKcal && (proteinG || carbsG || fatsG)) {
      targetKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
    }

    summaries.push({
      id: diet.id,
      name: diet.name || 'Prescrição Alimentar',
      date: diet.updatedAt || diet.createdAt || '',
      mode: isCycling ? 'carb_cycling' : 'simple',
      modeLabel: isCycling ? 'Ciclo de Carboidratos' : 'Simples',
      targetKcal,
      proteinG,
      carbsG,
      fatsG,
      mealsCount,
      variationsCount: isCycling ? variations.length : undefined,
      daysAssignedCount: isCycling ? cycleAverage?.daysAssignedCount : undefined,
      fullPlan: diet,
    });
  }

  for (const historicalDiet of historicalDiets) {
    if (!historicalDiet || historicalDiet.id === 'nova' || (currentDietId && historicalDiet.id === currentDietId) || seenIds.has(historicalDiet.id)) continue;
    seenIds.add(historicalDiet.id);
    summaries.push({
      id: historicalDiet.id,
      name: historicalDiet.name || 'Prescrição Alimentar',
      date: historicalDiet.date || '',
      mode: 'simple',
      modeLabel: 'Simples',
      targetKcal: historicalDiet.targetKcal || calculatePresetCalories(historicalDiet.proteinG, historicalDiet.carbsG, historicalDiet.fatsG),
      proteinG: historicalDiet.proteinG || 0,
      carbsG: historicalDiet.carbsG || 0,
      fatsG: historicalDiet.fatsG || 0,
      mealsCount: historicalDiet.meals?.length || 0,
      historicalDiet,
    });
  }

  return summaries.sort((left, right) => (normalizeDateToISO(right.date) || '').localeCompare(normalizeDateToISO(left.date) || ''));
}

export function cloneMealsWithFreshIds(meals: DietMeal[] = []): DietMeal[] {
  return meals.map(cloneMealGroupWithFreshIds);
}

export function cloneDietForNewDraft(
  source: PreviousDietSummary | FullDietPlan,
  patientId: string,
  currentDraftId = 'nova',
): FullDietPlan {
  const fullPlan = 'fullPlan' in source && source.fullPlan ? source.fullPlan : source as FullDietPlan;
  const baseName = source.name || 'Prescrição Alimentar';
  const nameWithCopy = baseName.includes('(Cópia)') ? baseName : `${baseName} (Cópia)`;
  const today = new Date().toLocaleDateString('pt-BR');

  if (fullPlan?.mode) {
    const isCycling = fullPlan.mode === 'carb_cycling';
    return {
      ...fullPlan,
      id: currentDraftId,
      patientId,
      name: nameWithCopy,
      createdAt: today,
      updatedAt: today,
      simpleMeals: cloneMealsWithFreshIds(fullPlan.simpleMeals || []),
      carbCyclingVariationsCount: fullPlan.carbCyclingVariationsCount || 3,
      carbCyclingVariations: isCycling
        ? (fullPlan.carbCyclingVariations || []).map((variation) => ({ ...variation, meals: cloneMealsWithFreshIds(variation.meals || []) }))
        : fullPlan.carbCyclingVariations || [],
    };
  }

  const targetKcal = 'targetKcal' in source ? source.targetKcal : 0;
  const proteinG = 'proteinG' in source ? source.proteinG : 0;
  const carbsG = 'carbsG' in source ? source.carbsG : 0;
  const fatsG = 'fatsG' in source ? source.fatsG : 0;

  return {
    id: currentDraftId,
    patientId,
    name: nameWithCopy,
    createdAt: today,
    updatedAt: today,
    mode: 'simple',
    simpleTargetKcal: targetKcal,
    simpleTargetProtein: proteinG,
    simpleTargetCarbs: carbsG,
    simpleTargetFats: fatsG,
    simpleMeals: [],
    carbCyclingVariationsCount: 3,
    carbCyclingVariations: [],
  };
}

export function extractMacrosFromPreviousDiet(
  source: PreviousDietSummary | FullDietPlan,
): { targetProtein: number; targetCarbs: number; targetFats: number; targetKcal: number } {
  if ('fullPlan' in source && source.fullPlan) {
    const plan = source.fullPlan;
    if (plan.mode === 'carb_cycling' && plan.carbCyclingVariations?.length) {
      const variation = plan.carbCyclingVariations[0];
      return {
        targetProtein: variation.targetProtein || 0,
        targetCarbs: variation.targetCarbs || 0,
        targetFats: variation.targetFats || 0,
        targetKcal: variation.targetKcal || calculatePresetCalories(variation.targetProtein, variation.targetCarbs, variation.targetFats),
      };
    }
    return {
      targetProtein: plan.simpleTargetProtein || 0,
      targetCarbs: plan.simpleTargetCarbs || 0,
      targetFats: plan.simpleTargetFats || 0,
      targetKcal: plan.simpleTargetKcal || calculatePresetCalories(plan.simpleTargetProtein, plan.simpleTargetCarbs, plan.simpleTargetFats),
    };
  }

  if ('proteinG' in source) {
    return {
      targetProtein: source.proteinG || 0,
      targetCarbs: source.carbsG || 0,
      targetFats: source.fatsG || 0,
      targetKcal: source.targetKcal || calculatePresetCalories(source.proteinG, source.carbsG, source.fatsG),
    };
  }

  return {
    targetProtein: source.simpleTargetProtein || 0,
    targetCarbs: source.simpleTargetCarbs || 0,
    targetFats: source.simpleTargetFats || 0,
    targetKcal: source.simpleTargetKcal || calculatePresetCalories(source.simpleTargetProtein, source.simpleTargetCarbs, source.simpleTargetFats),
  };
}
