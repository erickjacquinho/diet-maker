import { useState, useCallback } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, DietMeal, CarbCyclingVariation } from '@/lib/legacy-diet-types';
import type { ActiveMealVariationIds } from '@/lib/mealVariations';
import { cloneMealsWithFreshIds } from '@/lib/legacy-diet-copy';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { MealFoodToSubstitute } from '@/components/organisms/foods/SubstituteFoodModal';
import { toast } from 'sonner';
import { buildDietWhatsAppText, type WhatsAppDietExportOptions } from '@/lib/whatsapp';

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
  canMutate,
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
  canMutate?: () => boolean;
  getActiveMealVariationId: (mealId: string, meal?: DietMeal) => string;
}) {
  const [foodSearchMealIndex, setFoodSearchMealIndex] = useState<number | null>(null);
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

  const handleCopyVariation = useCallback(() => {
    if (canMutate && !canMutate()) return;
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
  }, [canMutate, dietPlan, copySourceId, copyTargetId, setDietPlan]);

  const handleSaveAdjustedGoals = useCallback(() => {
    if (canMutate && !canMutate()) return;
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
  }, [canMutate, dietPlan, tempTargetProt, tempTargetCarb, tempTargetFat, tempVariationName, activeVariationId, setDietPlan]);

  const openAdjustGoalsModal = useCallback(() => {
    if (canMutate && !canMutate()) return;
    setTempTargetProt(targetProt);
    setTempTargetCarb(targetCarb);
    setTempTargetFat(targetFat);
    if (dietPlan?.mode === 'carb_cycling') {
      const activeVar = dietPlan.carbCyclingVariations.find((v) => v.id === activeVariationId);
      setTempVariationName(activeVar?.name || '');
    }
    setIsAdjustGoalsModalOpen(true);
  }, [canMutate, targetProt, targetCarb, targetFat, dietPlan, activeVariationId]);

  const handleSaveCycleMatrix = useCallback((updatedVariations: CarbCyclingVariation[]) => {
    if (canMutate && !canMutate()) return;
    setDietPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        carbCyclingVariationsCount: updatedVariations.length,
        carbCyclingVariations: updatedVariations,
      };
    });
  }, [canMutate, setDietPlan]);

  const buildWhatsAppText = useCallback((options: WhatsAppDietExportOptions) => {
    if (!patient || !dietPlan) return '';
    return buildDietWhatsAppText(patient.name, dietPlan, currentMeals, currentTotals, options, activeMealVariationIds);
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
    handleCopyVariation,
    handleSaveAdjustedGoals,
    openAdjustGoalsModal,
    openWhatsAppModal,
  };
}
