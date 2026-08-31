import { useMemo } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, type DietMeal as LegacyDietMeal } from '@/lib/legacy-diet-types';
import { calculateMealTotals } from '@/lib/macroCalculations';
import type { DietEditableDocument, DietItem as CanonicalDietItem } from '@/lib/domain/diets/diet-model';
import { calculateDocumentSnapshotTotals } from '@/lib/application/diets/diet-snapshot-consumers';
import { MacroMetricCardProps } from '@/components/molecules';
import {
  calculateKcalFromMacros,
  buildMacroMetricCardProps,
} from '@/lib/nutrition/macroCalculations';
import { projectMealGroups, type ActiveMealVariationIds } from '@/lib/mealVariations';

export function useDietCalculations(
  dietPlan: FullDietPlan | DietEditableDocument | null,
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
    snapshotTotals,
    weightReferenceKg,
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
        snapshotTotals: null,
        weightReferenceKg: patient?.weightKg,
      };
    }

    if ('variations' in dietPlan && !('simpleMeals' in dietPlan)) {
      const activeVariation = dietPlan.variations.find((variation) => variation.id === activeVariationId) ?? dietPlan.variations[0];
      const toLegacyItem = (item: CanonicalDietItem): LegacyDietMeal['items'][number] => ({
        id: item.id,
        name: item.name,
        quantityGrams: Number(item.snapshot.prescribedQuantity),
        protein: Number(item.snapshot.prescribedNutrients.protein),
        carbs: Number(item.snapshot.prescribedNutrients.carbs),
        fats: Number(item.snapshot.prescribedNutrients.fat),
        kcal: Number(item.snapshot.prescribedNutrients.energyKcal ?? 0),
      });
      const meals: LegacyDietMeal[] = (activeVariation?.meals ?? []).map((meal) => ({
        id: meal.id, name: meal.name, time: meal.time ?? '', items: (meal.options[0]?.items ?? []).map(toLegacyItem),
        variations: meal.options.slice(1).map((option) => ({ id: option.id, items: option.items.map(toLegacyItem) })),
      }));
      const totals = calculateDocumentSnapshotTotals(dietPlan, activeVariation?.id);
      return { mealGroups: meals, currentMeals: meals, targetKcal: Number(activeVariation?.targets.energyKcal ?? 0), targetProt: Number(activeVariation?.targets.protein ?? 0), targetCarb: Number(activeVariation?.targets.carbs ?? 0), targetFat: Number(activeVariation?.targets.fat ?? 0), snapshotTotals: totals, weightReferenceKg: dietPlan.weightReferenceKg ? Number(dietPlan.weightReferenceKg) : patient?.weightKg };
    }

    const legacyPlan = dietPlan as FullDietPlan;
    if (legacyPlan.mode === 'simple') {
      const prot = Number(legacyPlan.simpleTargetProtein) || 0;
      const carb = Number(legacyPlan.simpleTargetCarbs) || 0;
      const fat = Number(legacyPlan.simpleTargetFats) || 0;
      const kcal = Number(legacyPlan.simpleTargetKcal) || calculateKcalFromMacros(prot, carb, fat);

      const mealGroups = legacyPlan.simpleMeals || [];
      return {
        mealGroups,
        currentMeals: projectMealGroups(legacyPlan.simpleMeals || [], 'simple', undefined, activeMealVariationIds),
        targetKcal: kcal,
        targetProt: prot,
        targetCarb: carb,
        targetFat: fat,
        snapshotTotals: null,
        weightReferenceKg: patient?.weightKg,
      };
    } else {
      const activeVar =
        legacyPlan.carbCyclingVariations.find((v) => v.id === activeVariationId) ||
        legacyPlan.carbCyclingVariations[0];

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
        snapshotTotals: null,
        weightReferenceKg: patient?.weightKg,
      };
    }
  }, [dietPlan, activeVariationId, patient, activeMealVariationIds]);

  const currentTotals = useMemo(() => snapshotTotals ? {
    proteinG: Number(snapshotTotals.protein), carbsG: Number(snapshotTotals.carbs), fatsG: Number(snapshotTotals.fat), kcal: Number(snapshotTotals.energyKcal),
  } : calculateMealTotals(currentMeals.flatMap((m) => m.items)), [currentMeals, snapshotTotals]);

  const macroMetrics: MacroMetricCardProps[] = useMemo(() => {
    const weightKg = weightReferenceKg;

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
  }, [weightReferenceKg, currentTotals, targetKcal, targetProt, targetCarb, targetFat]);

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
