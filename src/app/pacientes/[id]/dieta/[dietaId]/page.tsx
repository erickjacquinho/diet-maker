'use client';

import React, { useMemo } from 'react';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import { DietBuilderTemplate } from '@/components/templates';
import { FoodSearchModal } from '@/components/molecules/FoodSearchModal';
import { ScaleDietModal } from '@/components/molecules/ScaleDietModal';
import { CopyVariationModal } from '@/components/molecules/CopyVariationModal';
import { AdjustDietGoalsModal } from '@/components/molecules/AdjustDietGoalsModal';
import { WhatsAppShareModal } from '@/components/molecules/WhatsAppShareModal';
import { SubstituteFoodModal } from '@/components/molecules/SubstituteFoodModal';
import { ImportPreviousDietModal } from '@/components/molecules/ImportPreviousDietModal';
import { Spinner } from '@/components/ui/spinner';

import { MealCardContainerProps } from '@/components/organisms';
import { calculateMealsTotal, saveDietToStorage } from '@/lib/dietStore';
import { getMealVariationOptions } from '@/lib/mealVariations';

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
    foodToSubstitute,
    setFoodToSubstitute,
    handleSubstituteFood,
    currentMeals,
    mealGroups,
    macroMetrics,
    handleModeChange,
    handleVariationsCountChange,
    handleAddVariation,
    handleRemoveVariation,
    handleReorderVariations,
    handleSaveDiet,
    handleAddMeal,
    handleDuplicateMeal,
    handleCopyMeal,
    handlePasteMeal,
    handlePasteMealAndReplace,
    hasCopiedMeal,
    handleDuplicateItem,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleRemoveItem,
    handleReorderItems,
    handleAddMealVariation,
    handleRemoveMealVariation,
    getActiveMealVariationId,
    handleSelectMealVariation,
    handleApplyScale,
    handleCopyVariation,
    handleSaveAdjustedGoals,
    handlePullPreviousGoals,
    handlePullMacrosOnly,
    handlePullAllMeals,
    previousDiets,
    hasPreviousDiets,
    isImportPreviousDietModalOpen,
    setIsImportPreviousDietModalOpen,
    openImportPreviousDietModal,
    openAdjustGoalsModal,
    openWhatsAppModal,
    router,
  } = useDietBuilderPage();

  const isNewDiet = dietaId === 'nova' || dietPlan?.id === 'nova';

  const mealsData: MealCardContainerProps[] = useMemo(() => {
    return currentMeals.map((meal, mealIdx) => {
      const sourceMeal = mealGroups[mealIdx] || meal;
      const variationOptions = getMealVariationOptions(sourceMeal);
      const activeMealVariationId = getActiveMealVariationId(meal.id, sourceMeal);
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
          id: it.id,
          name: it.name,
          kcal: it.kcal,
          protein: it.protein,
          carbs: it.carbs,
          fats: it.fats,
          quantityGrams: it.quantityGrams,
        })),
        variationOptions: variationOptions.length > 1
          ? variationOptions.map(({ id, label }) => ({ id, label }))
          : undefined,
        activeVariationId: activeMealVariationId,
        onVariationChange: (variationId: string) => handleSelectMealVariation(meal.id, variationId),
        onAddVariation: () => handleAddMealVariation(meal.id),
        onRemoveVariation: () => handleRemoveMealVariation(meal.id),
        variationLimitReached: variationOptions.length >= 5,
        onTitleChange: (newTitle: string) => handleUpdateMealHeader(meal.id, { name: newTitle }),
        onTimeChange: (newTime: string) => handleUpdateMealHeader(meal.id, { time: newTime }),
        onAddFoodClick: () => setFoodSearchMealIndex(mealIdx),
        onDuplicate: () => handleDuplicateMeal(meal.id),
        onCopyMeal: () => handleCopyMeal(meal.id),
        onPasteMeal: () => handlePasteMeal(meal.id),
        onPasteMealAndReplace: () => handlePasteMealAndReplace(meal.id),
        canPasteMeal: hasCopiedMeal,
        onScale: () => {
          setFoodSearchMealIndex(mealIdx);
          setIsScaleModalOpen(true);
        },
        scaleDisabled: isNewDiet,
        onDeleteMeal: () => handleRemoveMeal(meal.id),
        onSubstituteItem: (itemIdx: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) {
            setFoodToSubstitute({
              mealId: meal.id,
              mealName: meal.name,
              itemId: item.id,
              foodName: item.name,
              quantityGrams: item.quantityGrams || item.grams || 100,
              protein: item.protein ?? item.proteinG ?? 0,
              carbs: item.carbs ?? item.carbsG ?? 0,
              fats: item.fats ?? item.fatsG ?? item.fatG ?? 0,
              kcal: item.kcal,
            });
          }
        },
        onDuplicateItem: (itemIdx: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) {
            handleDuplicateItem(meal.id, item.id);
          }
        },
        onRemoveItem: (itemIdx: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) {
            handleRemoveItem(meal.id, item.id);
          }
        },
        onQuantityChange: (itemIdx: number, newGrams: number) => {
          const item = meal.items[itemIdx];
          if (item?.id) handleUpdateItemGram(meal.id, item.id, newGrams);
        },
        onReorderItems: (sourceIndex: number, targetIndex: number) => {
          handleReorderItems(meal.id, sourceIndex, targetIndex);
        },
      };
    });
  }, [currentMeals, mealGroups, getActiveMealVariationId, handleSelectMealVariation, handleAddMealVariation, handleRemoveMealVariation, handleUpdateMealHeader, setFoodSearchMealIndex, setIsScaleModalOpen, handleDuplicateMeal, handleCopyMeal, handlePasteMeal, handlePasteMealAndReplace, hasCopiedMeal, handleDuplicateItem, handleRemoveMeal, setFoodToSubstitute, handleUpdateItemGram, handleRemoveItem, handleReorderItems, isNewDiet]);


  if (!dietPlan || !patient) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner className="size-8 text-success" />
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
          mode: dietPlan.mode || 'simple',
          onModeChange: handleModeChange,
          variationsCount: (dietPlan.carbCyclingVariationsCount as 2 | 3) || dietPlan.carbCyclingVariations?.length || 3,
          onVariationsCountChange: handleVariationsCountChange,
          variations: dietPlan.carbCyclingVariations || [],
          activeVariationId: activeVariationId,
          onSelectVariation: setActiveVariationId,
          onCopyMealsBetweenVariations: () => setIsCopyModalOpen(true),
          onOpenCycleMatrix: () => {
            if (dietPlan) {
              saveDietToStorage({
                ...dietPlan,
                id: dietaId,
                patientId,
              });
            }
            router.push(`/pacientes/${patientId}/dieta/${dietaId}/ciclo`);
          },
          onAddVariation: handleAddVariation,
          onReorderVariations: handleReorderVariations,
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
        scaleDisabled={isNewDiet}
        onOpenAdjustGoalsModal={openAdjustGoalsModal}
        onPullPreviousGoals={handlePullPreviousGoals}
        onOpenImportPreviousDietModal={openImportPreviousDietModal}
        hasPreviousDiets={hasPreviousDiets}
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

      {/* Modal de Edição de Metas da Variação Ativa */}
      <AdjustDietGoalsModal
        isOpen={isAdjustGoalsModalOpen}
        onClose={() => setIsAdjustGoalsModalOpen(false)}
        tempTargetProt={tempTargetProt}
        setTempTargetProt={setTempTargetProt}
        tempTargetCarb={tempTargetCarb}
        setTempTargetCarb={setTempTargetCarb}
        tempTargetFat={tempTargetFat}
        setTempTargetFat={setTempTargetFat}
        patientWeightKg={patient.weightKg || 70}
        mode={dietPlan.mode}
        variationName={tempVariationName}
        onVariationNameChange={setTempVariationName}
        onSave={handleSaveAdjustedGoals}
      />

      {/* Modal de Envio via WhatsApp */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        whatsAppText={whatsAppText}
      />

      {/* Modal de Substituição de Alimento na Refeição */}
      <SubstituteFoodModal
        isOpen={foodToSubstitute !== null}
        onClose={() => setFoodToSubstitute(null)}
        foodToSubstitute={foodToSubstitute}
        onSubstituteFood={handleSubstituteFood}
      />

      {/* Modal de Importação / Duplicação de Dietas Anteriores */}
      <ImportPreviousDietModal
        isOpen={isImportPreviousDietModalOpen}
        onClose={() => setIsImportPreviousDietModalOpen(false)}
        patientName={patient.name}
        diets={previousDiets}
        onPullMacrosOnly={handlePullMacrosOnly}
        onPullAllMeals={handlePullAllMeals}
      />
    </>
  );
}
