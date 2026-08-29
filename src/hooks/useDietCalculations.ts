import { useMemo } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, calculateMealTotals } from '@/lib/dietStore';
import { MacroMetricCardProps } from '@/components/molecules';
import {
  calculateKcalFromMacros,
  buildMacroMetricCardProps,
} from '@/lib/nutrition/macroCalculations';
import { projectMealGroups, type ActiveMealVariationIds } from '@/lib/mealVariations';

export function useDietCalculations(
  dietPlan: FullDietPlan | null,
  activeVariationId: string,
  patient: Patient | null,
  activeMealVariationIds: ActiveMealVariationIds = {}
) {
  const {
    mealGroups,
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
  } = useMemo(() => {
    if (!dietPlan) {
      const pProt = patient?.targetProtein ?? 0;
      const pCarb = patient?.targetCarbs ?? 0;
      const pFat = patient?.targetFats ?? 0;
      const pKcal = patient?.targetKcal ?? calculateKcalFromMacros(pProt, pCarb, pFat);

      return {
        mealGroups: [],
        currentMeals: [],
        targetKcal: pKcal,
        targetProt: pProt,
        targetCarb: pCarb,
        targetFat: pFat,
      };
    }

    if (dietPlan.mode === 'simple') {
      const prot = Number(dietPlan.simpleTargetProtein) || 0;
      const carb = Number(dietPlan.simpleTargetCarbs) || 0;
      const fat = Number(dietPlan.simpleTargetFats) || 0;
      const kcal = Number(dietPlan.simpleTargetKcal) || calculateKcalFromMacros(prot, carb, fat);

      const mealGroups = dietPlan.simpleMeals || [];
      return {
        mealGroups,
        currentMeals: projectMealGroups(dietPlan.simpleMeals || [], 'simple', undefined, activeMealVariationIds),
        targetKcal: kcal,
        targetProt: prot,
        targetCarb: carb,
        targetFat: fat,
      };
    } else {
      const activeVar =
        dietPlan.carbCyclingVariations.find((v) => v.id === activeVariationId) ||
        dietPlan.carbCyclingVariations[0];

      const prot = activeVar ? Number(activeVar.targetProtein) || 0 : (patient?.targetProtein ?? 0);
      const carb = activeVar ? Number(activeVar.targetCarbs) || 0 : (patient?.targetCarbs ?? 0);
      const fat = activeVar ? Number(activeVar.targetFats) || 0 : (patient?.targetFats ?? 0);
      const kcal = activeVar
        ? (Number(activeVar.targetKcal) || calculateKcalFromMacros(prot, carb, fat))
        : (patient?.targetKcal ?? calculateKcalFromMacros(prot, carb, fat));

      const mealGroups = activeVar ? activeVar.meals : [];
      return {
        mealGroups,
        currentMeals: projectMealGroups(mealGroups, 'carb_cycling', activeVar?.id, activeMealVariationIds),
        targetKcal: kcal,
        targetProt: prot,
        targetCarb: carb,
        targetFat: fat,
      };
    }
  }, [dietPlan, activeVariationId, patient, activeMealVariationIds]);

  const currentTotals = useMemo(
    () => calculateMealTotals(currentMeals.flatMap((m) => m.items)),
    [currentMeals]
  );

  const macroMetrics: MacroMetricCardProps[] = useMemo(() => {
    const weightKg = patient?.weightKg;

    return [
      buildMacroMetricCardProps({
        label: 'Proteínas',
        current: currentTotals.proteinG,
        target: targetProt,
        unit: 'g',
        macroColor: 'protein',
        weightKg,
      }),
      buildMacroMetricCardProps({
        label: 'Carboidratos',
        current: currentTotals.carbsG,
        target: targetCarb,
        unit: 'g',
        macroColor: 'carbohydrate',
        weightKg,
      }),
      buildMacroMetricCardProps({
        label: 'Gorduras',
        current: currentTotals.fatsG,
        target: targetFat,
        unit: 'g',
        macroColor: 'fat',
        weightKg,
        isFat: true,
      }),
      buildMacroMetricCardProps({
        label: 'Calorias',
        current: currentTotals.kcal,
        target: targetKcal,
        unit: 'kcal',
        macroColor: 'blue',
      }),
    ];
  }, [patient?.weightKg, currentTotals, targetKcal, targetProt, targetCarb, targetFat]);

  return {
    mealGroups,
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
  };
}
