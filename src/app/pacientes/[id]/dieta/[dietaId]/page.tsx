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
import { calculateMealTotals } from '@/lib/dietStore';

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
    return currentMeals.map((meal, index) => {
      const totals = calculateMealTotals(meal.items);
      return {
        title: meal.name,
        time: meal.time,
        kcal: totals.kcal,
        proteinG: totals.proteinG,
        carbsG: totals.carbsG,
        fatsG: totals.fatsG,
        items: meal.items.map((item) => ({
          name: item.name,
          quantityGrams: item.quantityGrams || item.grams || 100,
          kcal: item.kcal,
          protein: item.protein ?? item.proteinG ?? 0,
          carbs: item.carbs ?? item.carbsG ?? 0,
          fats: item.fats ?? item.fatsG ?? item.fatG ?? 0,
        })),
        onAddFood: () => setFoodSearchMealIndex(index),
      };
    });
  }, [currentMeals, setFoodSearchMealIndex]);

  if (!dietPlan || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
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
          variationsCount: dietPlan.carbCyclingVariationsCount || 2,
          onVariationsCountChange: () => {},
          variations: dietPlan.carbCyclingVariations,
          activeVariationId: activeVariationId,
          onSelectVariation: setActiveVariationId,
        }}
        macroTrackerData={{
          patientInitials: patient.initials,
          patientName: patient.name,
          patientWeightKg: patient.weightKg,
          patientGoalDescription: patient.objective,
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
        onAddFood={(item) => handleAddFoodToMeal(item)}
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
