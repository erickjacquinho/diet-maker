import type { FullDietPlan, DietMeal, CarbCyclingVariation } from './dietStore';
import type { HistoricalDiet } from './patientsStore';
import { normalizeDateToISO } from './date-only';
import { calculatePresetCalories } from './presetUtils';

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
  fullPlan?: FullDietPlan;
  historicalDiet?: HistoricalDiet;
}

export type ImportActionType = 'macros_only' | 'all_meals';

export function buildPreviousDietSummaries(
  storedDiets: FullDietPlan[] = [],
  historicalDiets: HistoricalDiet[] = [],
  currentDietId?: string
): PreviousDietSummary[] {
  const summaries: PreviousDietSummary[] = [];
  const seenIds = new Set<string>();

  // 1. Process stored FullDietPlan items
  for (const diet of storedDiets) {
    if (!diet || diet.id === 'nova' || (currentDietId && diet.id === currentDietId)) {
      continue;
    }
    seenIds.add(diet.id);

    const isCycling = diet.mode === 'carb_cycling';
    const firstVariation = isCycling && diet.carbCyclingVariations?.length ? diet.carbCyclingVariations[0] : null;

    let targetKcal = diet.simpleTargetKcal || 0;
    let proteinG = diet.simpleTargetProtein || 0;
    let carbsG = diet.simpleTargetCarbs || 0;
    let fatsG = diet.simpleTargetFats || 0;
    let mealsCount = (diet.simpleMeals || []).length;

    if (isCycling && firstVariation) {
      targetKcal = firstVariation.targetKcal || calculatePresetCalories(firstVariation.targetProtein, firstVariation.targetCarbs, firstVariation.targetFats);
      proteinG = firstVariation.targetProtein || 0;
      carbsG = firstVariation.targetCarbs || 0;
      fatsG = firstVariation.targetFats || 0;
      mealsCount = (firstVariation.meals || []).length;
    }

    if (!targetKcal && (proteinG || carbsG || fatsG)) {
      targetKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
    }

    const rawDate = diet.updatedAt || diet.createdAt || '';

    summaries.push({
      id: diet.id,
      name: diet.name || 'Prescrição Alimentar',
      date: rawDate,
      mode: isCycling ? 'carb_cycling' : 'simple',
      modeLabel: isCycling ? 'Ciclo de Carboidratos' : 'Simples',
      targetKcal,
      proteinG,
      carbsG,
      fatsG,
      mealsCount,
      fullPlan: diet,
    });
  }

  // 2. Process HistoricalDiet items not already mapped
  for (const hist of historicalDiets) {
    if (!hist || hist.id === 'nova' || (currentDietId && hist.id === currentDietId) || seenIds.has(hist.id)) {
      continue;
    }
    seenIds.add(hist.id);

    const targetKcal = hist.targetKcal || calculatePresetCalories(hist.proteinG, hist.carbsG, hist.fatsG);

    summaries.push({
      id: hist.id,
      name: hist.name || 'Prescrição Alimentar',
      date: hist.date || '',
      mode: 'simple',
      modeLabel: 'Simples',
      targetKcal,
      proteinG: hist.proteinG || 0,
      carbsG: hist.carbsG || 0,
      fatsG: hist.fatsG || 0,
      mealsCount: (hist.meals || []).length,
      historicalDiet: hist,
    });
  }

  // Sort descending by date
  return summaries.sort((a, b) => {
    const keyA = normalizeDateToISO(a.date) || '';
    const keyB = normalizeDateToISO(b.date) || '';
    return keyB.localeCompare(keyA);
  });
}

export function cloneMealsWithFreshIds(meals: DietMeal[] = []): DietMeal[] {
  return meals.map((meal) => ({
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    items: (meal.items || []).map((item) => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    })),
  }));
}

export function cloneDietForNewDraft(
  source: PreviousDietSummary | FullDietPlan,
  patientId: string,
  currentDraftId: string = 'nova'
): FullDietPlan {
  const fullPlan = 'fullPlan' in source && source.fullPlan ? source.fullPlan : (source as FullDietPlan);

  const baseName = source.name || 'Prescrição Alimentar';
  const nameWithCopy = baseName.includes('(Cópia)') ? baseName : `${baseName} (Cópia)`;
  const todayStr = new Date().toLocaleDateString('pt-BR');

  if (fullPlan && 'mode' in fullPlan && fullPlan.mode) {
    const isCycling = fullPlan.mode === 'carb_cycling';
    return {
      ...fullPlan,
      id: currentDraftId,
      patientId,
      name: nameWithCopy,
      createdAt: todayStr,
      updatedAt: todayStr,
      mode: fullPlan.mode,
      simpleTargetKcal: fullPlan.simpleTargetKcal,
      simpleTargetProtein: fullPlan.simpleTargetProtein,
      simpleTargetCarbs: fullPlan.simpleTargetCarbs,
      simpleTargetFats: fullPlan.simpleTargetFats,
      simpleMeals: cloneMealsWithFreshIds(fullPlan.simpleMeals || []),
      carbCyclingVariationsCount: fullPlan.carbCyclingVariationsCount || 3,
      carbCyclingVariations: isCycling
        ? (fullPlan.carbCyclingVariations || []).map((v) => ({
            ...v,
            meals: cloneMealsWithFreshIds(v.meals || []),
          }))
        : fullPlan.carbCyclingVariations || [],
    };
  }

  // Fallback for HistoricalDiet summary without full plan
  const targetKcal = 'targetKcal' in source ? source.targetKcal : 0;
  const proteinG = 'proteinG' in source ? source.proteinG : 0;
  const carbsG = 'carbsG' in source ? source.carbsG : 0;
  const fatsG = 'fatsG' in source ? source.fatsG : 0;

  return {
    id: currentDraftId,
    patientId,
    name: nameWithCopy,
    createdAt: todayStr,
    updatedAt: todayStr,
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
  source: PreviousDietSummary | FullDietPlan
): { targetProtein: number; targetCarbs: number; targetFats: number; targetKcal: number } {
  if ('fullPlan' in source && source.fullPlan) {
    const fp = source.fullPlan;
    if (fp.mode === 'carb_cycling' && fp.carbCyclingVariations?.length) {
      const v = fp.carbCyclingVariations[0];
      return {
        targetProtein: v.targetProtein || 0,
        targetCarbs: v.targetCarbs || 0,
        targetFats: v.targetFats || 0,
        targetKcal: v.targetKcal || calculatePresetCalories(v.targetProtein, v.targetCarbs, v.targetFats),
      };
    }
    return {
      targetProtein: fp.simpleTargetProtein || 0,
      targetCarbs: fp.simpleTargetCarbs || 0,
      targetFats: fp.simpleTargetFats || 0,
      targetKcal: fp.simpleTargetKcal || calculatePresetCalories(fp.simpleTargetProtein, fp.simpleTargetCarbs, fp.simpleTargetFats),
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

  const fp = source as FullDietPlan;
  return {
    targetProtein: fp.simpleTargetProtein || 0,
    targetCarbs: fp.simpleTargetCarbs || 0,
    targetFats: fp.simpleTargetFats || 0,
    targetKcal: fp.simpleTargetKcal || calculatePresetCalories(fp.simpleTargetProtein, fp.simpleTargetCarbs, fp.simpleTargetFats),
  };
}
