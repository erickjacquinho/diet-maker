import { useState, useCallback } from 'react';
import { Patient } from '@/lib/patientsStore';
import { FullDietPlan, DietMeal, CarbCyclingVariation } from '@/lib/dietStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { toast } from 'sonner';

export interface MealFoodToDelete {
  mealId: string;
  mealName: string;
  itemId: string;
  foodName: string;
  quantityGrams?: number;
}

export function useDietBuilderModals({
  patient,
  dietPlan,
  currentMeals,
  currentTotals,
  targetProt,
  targetCarb,
  targetFat,
  activeVariationId,
  setDietPlan,
  updateActiveMeals,
}: {
  patient: Patient | null;
  dietPlan: FullDietPlan | null;
  currentMeals: DietMeal[];
  currentTotals: { kcal: number; proteinG: number; carbsG: number; fatsG: number };
  targetProt: number;
  targetCarb: number;
  targetFat: number;
  activeVariationId: string;
  setDietPlan: React.Dispatch<React.SetStateAction<FullDietPlan | null>>;
  updateActiveMeals: (updater: (prevMeals: DietMeal[]) => DietMeal[]) => void;
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

  const [foodToDelete, setFoodToDelete] = useState<MealFoodToDelete | null>(null);

  const handleConfirmDeleteFood = useCallback(() => {
    if (!foodToDelete) return;
    updateActiveMeals((prev) =>
      prev.map((meal) =>
        meal.id === foodToDelete.mealId
          ? { ...meal, items: meal.items.filter((item) => item.id !== foodToDelete.itemId) }
          : meal
      )
    );
    toast.success(`${foodToDelete.foodName} removido da refeição.`);
    setFoodToDelete(null);
  }, [foodToDelete, updateActiveMeals]);

  const handleApplyScale = useCallback(
    (percent: number) => {
      const factor = 1 + percent / 100;
      updateActiveMeals((prev) =>
        prev.map((meal) => ({
          ...meal,
          items: meal.items.map((item) => {
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
          }),
        }))
      );
      toast.success(`Dieta ajustada em ${percent > 0 ? '+' : ''}${percent}%`);
      setIsScaleModalOpen(false);
    },
    [updateActiveMeals]
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
            ? { ...v, meals: JSON.parse(JSON.stringify(source.meals)) }
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

  const openWhatsAppModal = useCallback(() => {
    if (!patient || !dietPlan) return;
    let msg = `*Plano Alimentar - ${patient.name}*\n\n`;
    currentMeals.forEach((m) => {
      msg += `*${m.name} (${m.time})*\n`;
      m.items.forEach((i) => {
        const g = i.quantityGrams || i.grams || 100;
        msg += `• ${i.name} (${g}g) - ${i.kcal} kcal\n`;
      });
      msg += '\n';
    });
    msg += `*Total:* ${currentTotals.kcal} kcal | P: ${Math.round(currentTotals.proteinG)}g | C: ${Math.round(currentTotals.carbsG)}g | G: ${Math.round(currentTotals.fatsG)}g\n`;
    setWhatsAppText(msg);
    setIsWhatsAppModalOpen(true);
  }, [patient, dietPlan, currentMeals, currentTotals]);

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
    foodToDelete,
    setFoodToDelete,
    handleConfirmDeleteFood,
    handleApplyScale,
    handleCopyVariation,
    handleSaveAdjustedGoals,
    openAdjustGoalsModal,
    openWhatsAppModal,
  };
}
