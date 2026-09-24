import { useState, useCallback } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, DietMeal, CarbCyclingVariation, getItemGrams, getItemMacros } from '@/lib/legacy-diet-types';
import { projectMealGroups, updateMealVariationItems, type ActiveMealVariationIds } from '@/lib/mealVariations';
import { cloneMealsWithFreshIds } from '@/lib/legacy-diet-copy';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { calculateMealTotals } from '@/lib/macroCalculations';
import { MealFoodToSubstitute } from '@/components/organisms/foods/SubstituteFoodModal';
import { toast } from 'sonner';
import type { WhatsAppDietExportOptions } from '@/lib/whatsapp';

export function useDietBuilderModals({
  patient,
  dietPlan,
  currentMeals,
  currentTotals,
  targetProt,
  targetCarb,
  targetFat,
  activeVariationId,
  activeMealVariationIds = {},
  setDietPlan,
  updateActiveMeals,
  getActiveMealVariationId,
}: {
  patient: Patient | null;
  dietPlan: FullDietPlan | null;
  currentMeals: DietMeal[];
  currentTotals: { kcal: number; proteinG: number; carbsG: number; fatsG: number };
  targetProt: number;
  targetCarb: number;
  targetFat: number;
  activeVariationId: string;
  activeMealVariationIds?: ActiveMealVariationIds;
  setDietPlan: React.Dispatch<React.SetStateAction<FullDietPlan | null>>;
  updateActiveMeals: (updater: (prevMeals: DietMeal[]) => DietMeal[]) => void;
  getActiveMealVariationId: (mealId: string, meal?: DietMeal) => string;
}) {
  const [foodSearchMealIndex, setFoodSearchMealIndex] = useState<number | null>(null);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [scalePercentage, setScalePercentage] = useState<number>(10);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState<string>('var-high');
  const [copyTargetId, setCopyTargetId] = useState<string>('var-low');

  const [isCycleMatrixOpen, setIsCycleMatrixOpen] = useState(false);

  const [isAdjustGoalsModalOpen, setIsAdjustGoalsModalOpen] = useState(false);
  const [tempVariationName, setTempVariationName] = useState<string>('');
  const [tempTargetProt, setTempTargetProt] = useState<number>(targetProt || 0);
  const [tempTargetCarb, setTempTargetCarb] = useState<number>(targetCarb || 0);
  const [tempTargetFat, setTempTargetFat] = useState<number>(targetFat || 0);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');
  const [whatsAppOptions, setWhatsAppOptions] = useState<WhatsAppDietExportOptions>({
    includeNutrition: true,
    includeMealTimes: true,
    selectedVariationIds: [],
  });

  const [foodToSubstitute, setFoodToSubstitute] = useState<MealFoodToSubstitute | null>(null);
  const [isImportPreviousDietModalOpen, setIsImportPreviousDietModalOpen] = useState(false);

  const handleApplyScale = useCallback(
    (percent: number) => {
      const factor = 1 + percent / 100;
      updateActiveMeals((prev) =>
        prev.map((meal) => updateMealVariationItems(meal, getActiveMealVariationId(meal.id, meal), (items) => items.map((item) => {
            const currentGrams = item.quantityGrams || item.grams || 100;
            const p = item.protein ?? item.proteinG ?? 0;
            const c = item.carbs ?? item.carbsG ?? 0;
            const f = item.fats ?? item.fatsG ?? item.fatG ?? 0;
            return {
              ...item,
              quantityGrams: Math.round(currentGrams * factor),
              grams: Math.round(currentGrams * factor),
              kcal: Math.round(item.kcal * factor),
              protein: Math.round(p * factor * 10) / 10,
              carbs: Math.round(c * factor * 10) / 10,
              fats: Math.round(f * factor * 10) / 10,
            };
          })))
      );
      toast.success(`Dieta ajustada em ${percent > 0 ? '+' : ''}${percent}%`);
      setIsScaleModalOpen(false);
    },
    [getActiveMealVariationId, updateActiveMeals]
  );

  const handleCopyVariation = useCallback(() => {
    if (!dietPlan || dietPlan.mode !== 'carb_cycling') return;
    const source = dietPlan.carbCyclingVariations.find((v) => v.id === copySourceId);
    if (!source) return;

    setDietPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
          v.id === copyTargetId
            ? { ...v, meals: cloneMealsWithFreshIds(source.meals) }
            : v
        ),
      };
    });
    toast.success('Refeições copiadas com sucesso!');
    setIsCopyModalOpen(false);
  }, [dietPlan, copySourceId, copyTargetId, setDietPlan]);

  const handleSaveAdjustedGoals = useCallback(() => {
    if (!dietPlan) return;
    setDietPlan((prev) => {
      if (!prev) return prev;
      const targetKcal = calculatePresetCalories(tempTargetProt, tempTargetCarb, tempTargetFat);
      if (prev.mode === 'simple') {
        return {
          ...prev,
          simpleTargetKcal: targetKcal,
          simpleTargetProtein: tempTargetProt,
          simpleTargetCarbs: tempTargetCarb,
          simpleTargetFats: tempTargetFat,
        };
      } else {
        return {
          ...prev,
          carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
            v.id === activeVariationId
              ? {
                  ...v,
                  name: tempVariationName.trim() || v.name,
                  targetKcal,
                  targetProtein: tempTargetProt,
                  targetCarbs: tempTargetCarb,
                  targetFats: tempTargetFat,
                }
              : v
          ),
        };
      }
    });
    toast.success('Metas de macronutrientes atualizadas!');
    setIsAdjustGoalsModalOpen(false);
  }, [dietPlan, tempTargetProt, tempTargetCarb, tempTargetFat, tempVariationName, activeVariationId, setDietPlan]);

  const openAdjustGoalsModal = useCallback(() => {
    setTempTargetProt(targetProt);
    setTempTargetCarb(targetCarb);
    setTempTargetFat(targetFat);
    if (dietPlan?.mode === 'carb_cycling') {
      const activeVar = dietPlan.carbCyclingVariations.find((v) => v.id === activeVariationId);
      setTempVariationName(activeVar?.name || '');
    }
    setIsAdjustGoalsModalOpen(true);
  }, [targetProt, targetCarb, targetFat, dietPlan, activeVariationId]);

  const handleSaveCycleMatrix = useCallback((updatedVariations: CarbCyclingVariation[]) => {
    setDietPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        carbCyclingVariationsCount: updatedVariations.length,
        carbCyclingVariations: updatedVariations,
      };
    });
  }, [setDietPlan]);

  const buildWhatsAppText = useCallback((options: WhatsAppDietExportOptions) => {
    if (!patient || !dietPlan) return '';
    let msg = `*Plano Alimentar - ${patient.name}*\n\n`;
    const sections = dietPlan.mode === 'carb_cycling'
      ? dietPlan.carbCyclingVariations
        .filter((variation) => options.selectedVariationIds.includes(variation.id))
        .map((variation) => {
          const meals = projectMealGroups(variation.meals, 'carb_cycling', variation.id, activeMealVariationIds);
          return { name: variation.name, meals, totalKcal: calculateMealTotals(meals.flatMap((meal) => meal.items)).kcal };
        })
      : [{ name: '', meals: currentMeals, totalKcal: currentTotals.kcal }];

    sections.forEach((section) => {
      if (section.name) msg += `*${section.name}*\n`;
      section.meals.forEach((meal) => {
        const mealTotals = options.includeNutrition
          ? meal.items.reduce((totals, item) => {
            const macros = getItemMacros(item);
            return {
              protein: totals.protein + macros.protein,
              carbs: totals.carbs + macros.carbs,
              fats: totals.fats + macros.fats,
              kcal: totals.kcal + macros.kcal,
            };
          }, { protein: 0, carbs: 0, fats: 0, kcal: 0 })
          : null;
        msg += `*${meal.name}${options.includeMealTimes && meal.time ? ` (${meal.time})` : ''}${mealTotals ? ` | Carbo: ${Math.round(mealTotals.carbs)}g` : ''}*\n`;
        meal.items.forEach((item) => {
          msg += `• ${item.name} (${getItemGrams(item)}g)\n`;
        });
        if (mealTotals) {
          msg += `*Totais da refeição:* P: ${Math.round(mealTotals.protein)}g | G: ${Math.round(mealTotals.fats)}g | ${Math.round(mealTotals.kcal)} kcal\n`;
        }
        msg += '\n';
      });
      if (options.includeNutrition) {
        msg += `*Total do dia${section.name ? ` - ${section.name}` : ''}:* ${Math.round(section.totalKcal)} kcal\n\n`;
      }
    });
    return msg;
  }, [patient, dietPlan, currentMeals, currentTotals, activeMealVariationIds]);

  const openWhatsAppModal = useCallback(() => {
    if (!patient || !dietPlan) return;
    const options = {
      ...whatsAppOptions,
      selectedVariationIds: dietPlan.mode === 'carb_cycling'
        ? dietPlan.carbCyclingVariations.map((variation) => variation.id)
        : [],
    };
    setWhatsAppOptions(options);
    setWhatsAppText(buildWhatsAppText(options));
    setIsWhatsAppModalOpen(true);
  }, [patient, dietPlan, buildWhatsAppText, whatsAppOptions]);

  const updateWhatsAppOptions = useCallback((options: WhatsAppDietExportOptions) => {
    setWhatsAppOptions(options);
    setWhatsAppText(buildWhatsAppText(options));
  }, [buildWhatsAppText]);

  return {
    foodSearchMealIndex,
    setFoodSearchMealIndex,
    isScaleModalOpen,
    setIsScaleModalOpen,
    scalePercentage,
    setScalePercentage,
    isCopyModalOpen,
    setIsCopyModalOpen,
    copySourceId,
    setCopySourceId,
    copyTargetId,
    setCopyTargetId,
    isCycleMatrixOpen,
    setIsCycleMatrixOpen,
    handleSaveCycleMatrix,
    isAdjustGoalsModalOpen,
    setIsAdjustGoalsModalOpen,
    tempVariationName,
    setTempVariationName,
    tempTargetProt,
    setTempTargetProt,
    tempTargetCarb,
    setTempTargetCarb,
    tempTargetFat,
    setTempTargetFat,
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    whatsAppText,
    setWhatsAppText,
    whatsAppOptions,
    updateWhatsAppOptions,
    foodToSubstitute,
    setFoodToSubstitute,
    isImportPreviousDietModalOpen,
    setIsImportPreviousDietModalOpen,
    openImportPreviousDietModal: () => setIsImportPreviousDietModalOpen(true),
    handleApplyScale,
    handleCopyVariation,
    handleSaveAdjustedGoals,
    openAdjustGoalsModal,
    openWhatsAppModal,
  };
}
