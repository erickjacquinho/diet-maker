'use client';

import React, { useMemo } from 'react';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import { DietBuilderTemplate } from '@/components/templates';
import { FoodSearchModal } from '@/components/molecules/FoodSearchModal';
import { ScaleDietModal } from '@/components/molecules/ScaleDietModal';
import { CopyVariationModal } from '@/components/molecules/CopyVariationModal';
import { AdjustDietGoalsModal } from '@/components/molecules/AdjustDietGoalsModal';
import { WhatsAppShareModal } from '@/components/molecules/WhatsAppShareModal';
import { MealCardContainerProps } from '@/components/organisms';
import { calculateMealsTotal } from '@/lib/dietStore';

export default function DietBuilderPage() {
  const {
    patientId,
    dietaId,
    patient,
    dietPlan,
    activeVariationId,
    setActiveVariationId,
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
    isAdjustGoalsModalOpen,
    setIsAdjustGoalsModalOpen,
    tempTargetProt,
    setTempTargetProt,
    tempTargetCarb,
    setTempTargetCarb,
    tempTargetFat,
    setTempTargetFat,
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    whatsAppText,
    currentMeals,
    macroMetrics,
    handleModeChange,
    handleSaveDiet,
    handleAddMeal,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleRemoveItem,
    handleApplyScale,
    handleCopyVariation,
    handleSaveAdjustedGoals,
    openAdjustGoalsModal,
    openWhatsAppModal,
  } = useDietBuilderPage();

  const mealsData: MealCardContainerProps[] = useMemo(() => {
    return currentMeals.map((meal, mealIdx) => {
      const totals = calculateMealsTotal([meal]);
      return {
        id: meal.id,
        title: meal.name,
        time: meal.time,
        kcal: totals.kcal,
        proteinG: totals.proteinG,
        carbsG: totals.carbsG,
        fatsG: totals.fatsG,
        items: meal.items.map((it) => ({
          name: it.name,
          kcal: it.kcal,
          protein: it.protein,
          carbs: it.carbs,
          fats: it.fats,
          quantityGrams: it.quantityGrams,
        })),
        onTitleChange: (newTitle: string) => handleUpdateMealHeader(meal.id, { name: newTitle }),
        onTimeChange: (newTime: string) => handleUpdateMealHeader(meal.id, { time: newTime }),
        onAddFoodClick: () => setFoodSearchMealIndex(mealIdx),
        onDuplicate: () => {},
        onScale: () => {
          setFoodSearchMealIndex(mealIdx);
          setIsScaleModalOpen(true);
        },
        onDeleteMeal: () => handleRemoveMeal(meal.id),
        onRemoveItem: (itemIdx: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) handleRemoveItem(meal.id, item.id);
        },
        onQuantityChange: (itemIdx: number, newGrams: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) handleUpdateItemGram(meal.id, item.id, newGrams);
        },
      };
    });
  }, [currentMeals, handleUpdateMealHeader, setFoodSearchMealIndex, setIsScaleModalOpen, handleRemoveMeal, handleRemoveItem, handleUpdateItemGram]);

  if (!dietPlan || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-control h-8 w-8 border-2 border-border-subtle border-b-success"></div>
      </div>
    );
  }

  return (
    <>
      <DietBuilderTemplate
        patientId={patientId}
        patientName={patient.name}
        dietaId={dietaId}
        patient={{
          id: patient.id,
          name: patient.name,
          initials: patient.initials,
          age: patient.age,
          heightCm: patient.heightCm,
          weightKg: patient.weightKg,
          gender: patient.gender,
          objective: patient.objective,
        }}
        dietModeProps={{
          mode: dietPlan.mode,
          onModeChange: handleModeChange,
          variationsCount: (dietPlan.carbCyclingVariationsCount as 2 | 3) || 2,
          onVariationsCountChange: () => {},
          variations: dietPlan.carbCyclingVariations || [],
          activeVariationId: activeVariationId,
          onSelectVariation: setActiveVariationId,
        }}
        macroTrackerData={{
          patientInitials: patient.initials,
          patientName: patient.name,
          patientWeightKg: patient.weightKg,
          patientGoalDescription: patient.objective || 'Prescrição Alimentar',
          metrics: macroMetrics,
        }}
        mealsData={mealsData}
        onAddMeal={handleAddMeal}
        onScaleDiet={() => setIsScaleModalOpen(true)}
        onWhatsAppShare={openWhatsAppModal}
        onSaveDiet={handleSaveDiet}
      />

      {/* Modal de Busca de Alimentos */}
      <FoodSearchModal
        isOpen={foodSearchMealIndex !== null}
        onClose={() => setFoodSearchMealIndex(null)}
        mealTitle={foodSearchMealIndex !== null && currentMeals[foodSearchMealIndex] ? currentMeals[foodSearchMealIndex].name : 'Refeição'}
        onAddFood={handleAddFoodToMeal}
      />

      {/* Modal de Ajuste Proporcional / Escala */}
      <ScaleDietModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        scalePercentage={scalePercentage}
        setScalePercentage={setScalePercentage}
        onApplyScale={handleApplyScale}
      />

      {/* Modal de Cópia de Variação de Carboidratos */}
      <CopyVariationModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        variations={dietPlan.carbCyclingVariations || []}
        copySourceId={copySourceId}
        setCopySourceId={setCopySourceId}
        copyTargetId={copyTargetId}
        setCopyTargetId={setCopyTargetId}
        onCopy={handleCopyVariation}
      />

      {/* Modal de Edição de Metas */}
      <AdjustDietGoalsModal
        isOpen={isAdjustGoalsModalOpen}
        onClose={() => setIsAdjustGoalsModalOpen(false)}
        tempTargetProt={tempTargetProt}
        setTempTargetProt={setTempTargetProt}
        tempTargetCarb={tempTargetCarb}
        setTempTargetCarb={setTempTargetCarb}
        tempTargetFat={tempTargetFat}
        setTempTargetFat={setTempTargetFat}
        onSave={handleSaveAdjustedGoals}
      />

      {/* Modal de Envio via WhatsApp */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        whatsAppText={whatsAppText}
      />
    </>
  );
}
