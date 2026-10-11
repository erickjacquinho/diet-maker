'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import { DietBuilderTemplate } from '@/components/templates';
import { FoodSearchModal } from '@/components/organisms/foods/FoodSearchModal';
import { CopyVariationModal } from '@/components/molecules/CopyVariationModal';
import { AdjustDietGoalsModal } from '@/components/molecules/AdjustDietGoalsModal';
import { WhatsAppShareModal } from '@/components/molecules/WhatsAppShareModal';
import { SubstituteFoodModal } from '@/components/organisms/foods/SubstituteFoodModal';
import { ImportPreviousDietModal } from '@/components/organisms/diets/ImportPreviousDietModal';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { textStyle } from '@/design-system';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

import { CreateReadyMealsFromDietModal, type ReadyMealBatchEntry } from '@/components/organisms/CreateReadyMealsFromDietModal';
import { SaveReadyDietModal, type ReadyDietSaveData } from '@/components/organisms/SaveReadyDietModal';
import { MealCardContainerProps } from '@/components/organisms';
import { calculateMealsTotal } from '@/lib/macroCalculations';
import { getMealVariationOptions } from '@/lib/mealVariations';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import type { DietItem, DietMeal } from '@/lib/legacy-diet-types';
import type { NutritionSnapshot } from '@/lib/domain/diets/diet-model';
import { recipeYieldUnitFromSnapshot, type ReadyMealItemInput } from '@/lib/domain/library/library-model';
import { toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';

function toReadyMealItemInput(item: DietItem): ReadyMealItemInput {
  const snapshot = (item as DietItem & { snapshot?: NutritionSnapshot }).snapshot;
  if (!snapshot) throw new Error(`O alimento "${item.name}" não possui origem para a biblioteca.`);

  if (snapshot.sourceType === 'RECIPE') {
    return { sourceType: 'RECIPE', sourceId: snapshot.sourceId, recipePortions: snapshot.prescribedQuantity, recipeUnit: recipeYieldUnitFromSnapshot(snapshot.compositionSnapshot) };
  }
  if (snapshot.sourceType === 'SYSTEM_TACO' || snapshot.sourceType === 'ACCOUNT_CUSTOM') {
    return { sourceType: 'FOOD', sourceId: snapshot.sourceId, quantity: snapshot.prescribedQuantity, unit: snapshot.prescribedUnit };
  }
  throw new Error(`O alimento "${item.name}" tem uma origem que não pode ser salva como refeição pronta.`);
}

export default function DietBuilderPage() {
  const [pageOptions, setPageOptions] = useState(() => {
    const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
    return { checklist: params.get('checklist') !== '0', mealMacros: params.get('mealMacros') !== '0', dayMacros: params.get('dayMacros') !== '0' };
  });
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isPagePreparing, setIsPagePreparing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [readyMealSource, setReadyMealSource] = useState<{ meal: DietMeal; activeVariationId: string } | null>(null);
  const [isSavingReadyMeals, setIsSavingReadyMeals] = useState(false);
  const [isReadyDietModalOpen, setIsReadyDietModalOpen] = useState(false);
  const [isSavingReadyDiet, setIsSavingReadyDiet] = useState(false);
  const foodSearchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pendingMealScrollIdRef = useRef<string | null>(null);
  const {
    patientId,
    dietaId,
    patient,
    dietPlan,
    activeVariationId,
    setActiveVariationId,
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
    whatsAppOptions,
    updateWhatsAppOptions,
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
    saveStatus,
    confirmationBusy,
    loadState,
    retryLoad,
    onDiscardDraft,
    onBackClick,
    flushDraft,
    handleAddMeal,
    handleReorderMeals,
    handleDuplicateMeal,
    handleCopyMeal,
    handlePasteMeal,
    handlePasteMealAndReplace,
    hasCopiedMeal,
    handleDuplicateItem,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleInsertRecipeIntoDietDraft,
    handleInsertReadyMealIntoDietDraft,
    handleUpdateItemGram,
    handleRemoveItem,
    handleReorderItems,
    handleAddMealVariation,
    handleRemoveMealVariation,
    getActiveMealVariationId,
    handleSelectMealVariation,
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

  useEffect(() => {
    const pendingMealId = pendingMealScrollIdRef.current;
    if (!pendingMealId || !currentMeals.some((meal) => meal.id === pendingMealId)) return;

    const frameId = window.requestAnimationFrame(() => {
      pendingMealScrollIdRef.current = null;
      document.getElementById(`meal-card-${pendingMealId}`)?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentMeals]);

  const handleAddMealAndScroll = () => {
    const newMealId = handleAddMeal();
    if (!newMealId) return;

    pendingMealScrollIdRef.current = newMealId;
  };

  const handleOpenCycleMatrix = async () => {
    try {
      const result = await flushDraft?.();
      if (result?.status !== 'SAVED') {
        toast.error('Não foi possível salvar a edição local para abrir a matriz de ciclo. Tente novamente.');
        return;
      }
      router.push(`/pacientes/${patientId}/dieta/${dietaId}/ciclo`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a edição local para abrir a matriz de ciclo.');
    }
  };

  const handleOpenPdfPreview = async () => {
    try {
      const result = await flushDraft?.();
      if (result?.status !== 'SAVED') {
        toast.error('Não foi possível preparar o rascunho para a prévia do PDF.');
        return;
      }
      router.push(`/pacientes/${patientId}/dieta/${dietaId}/pdf`);
    } catch {
      toast.error('Não foi possível salvar as alterações locais para a prévia do PDF.');
    }
  };

  const handleOpenPagePreview = async () => {
    if (isPagePreparing) return;
    setIsPagePreparing(true);
    setPageError(null);
    try {
      const result = await flushDraft?.();
      if (result?.status !== 'SAVED') throw new Error('Não foi possível preparar o rascunho. Tente novamente.');
      const options = new URLSearchParams(Object.entries(pageOptions).map(([key, enabled]) => [key, enabled ? '1' : '0']));
      router.push(`/pacientes/${patientId}/dieta/${dietaId}/pagina?${options}`);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Não foi possível abrir a prévia.');
    } finally { setIsPagePreparing(false); }
  };

  const handleCreateReadyMeals = async (entries: ReadyMealBatchEntry[]) => {
    setIsSavingReadyMeals(true);
    let savedCount = 0;
    try {
      const application = await getBrowserLibraryApplication();
      // ponytail: each selected variation commits independently; add a bulk transaction if all-or-nothing is required.
      for (const entry of entries) {
        await application.createReadyMeal({
          name: entry.name,
          suggestedTime: entry.time || undefined,
          items: entry.items.map(toReadyMealItemInput),
        });
        savedCount += 1;
      }
      toast.success(savedCount === 1 ? 'Refeição pronta criada na biblioteca.' : `${savedCount} refeições prontas criadas na biblioteca.`);
      setReadyMealSource(null);
    } catch (error) {
      if (savedCount > 0) {
        toast.error(`${savedCount} de ${entries.length} refeições prontas foram salvas; as demais falharam.`);
        setReadyMealSource(null);
        return;
      }
      throw error;
    } finally {
      setIsSavingReadyMeals(false);
    }
  };

  const readyDietDocument = useMemo(() => dietPlan ? toEditableDocument(dietPlan) : null, [dietPlan]);
  const readyDietMealEntries = useMemo(() => readyDietDocument?.variations.flatMap((variation) => variation.meals.map((meal) => ({
    id: `${variation.id}::${meal.id}`,
    variationId: variation.id,
    mealId: meal.id,
    label: readyDietDocument.mode === 'CARB_CYCLING' ? `${variation.name} · ${meal.name}` : `Refeição ${meal.position + 1}`,
    name: meal.name,
    time: meal.time ?? '',
  }))) ?? [], [readyDietDocument]);

  const handleSaveReadyDiet = async ({ name, meals }: ReadyDietSaveData) => {
    if (!readyDietDocument) throw new Error('A dieta ainda não está disponível para salvar.');
    setIsSavingReadyDiet(true);
    try {
      const document = {
        ...readyDietDocument,
        name: name.trim(),
        variations: readyDietDocument.variations.map((variation) => ({
          ...variation,
          meals: variation.meals.map((meal) => {
            const basics = meals.find((entry) => entry.variationId === variation.id && entry.mealId === meal.id);
            if (!basics) return meal;
            const updatedMeal = { ...meal, name: basics.name.trim() };
            if (basics.time) updatedMeal.time = basics.time;
            else delete updatedMeal.time;
            return updatedMeal;
          }),
        })),
      };
      const application = await getBrowserLibraryApplication();
      await application.createReadyDiet({ name: name.trim(), document });
      toast.success('Dieta pronta salva na biblioteca.');
      setIsReadyDietModalOpen(false);
    } finally {
      setIsSavingReadyDiet(false);
    }
  };


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
        onCreateReadyMeal: () => setReadyMealSource({ meal: sourceMeal, activeVariationId: activeMealVariationId }),
        canCreateReadyMeal: variationOptions.some(({ items }) => items.length > 0),
        onAddVariation: () => handleAddMealVariation(meal.id),
        onRemoveVariation: () => handleRemoveMealVariation(meal.id),
        variationLimitReached: variationOptions.length >= 5,
        onTitleChange: (newTitle: string) => handleUpdateMealHeader(meal.id, { name: newTitle }),
        onTimeChange: (newTime: string) => handleUpdateMealHeader(meal.id, { time: newTime }),
        onAddFoodClick: (trigger) => {
          foodSearchTriggerRef.current = trigger ?? null;
          setFoodSearchMealIndex(mealIdx);
        },
        onDuplicate: () => handleDuplicateMeal(meal.id),
        onCopyMeal: () => handleCopyMeal(meal.id),
        onPasteMeal: () => handlePasteMeal(meal.id),
        onPasteMealAndReplace: () => handlePasteMealAndReplace(meal.id),
        canPasteMeal: hasCopiedMeal,
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
  }, [currentMeals, mealGroups, getActiveMealVariationId, handleSelectMealVariation, handleAddMealVariation, handleRemoveMealVariation, handleUpdateMealHeader, setFoodSearchMealIndex, handleDuplicateMeal, handleCopyMeal, handlePasteMeal, handlePasteMealAndReplace, hasCopiedMeal, handleDuplicateItem, handleRemoveMeal, setFoodToSubstitute, handleUpdateItemGram, handleRemoveItem, handleReorderItems]);


  if (loadState.status === 'error') {
    const returnLabel = loadState.returnPath === '/pacientes' ? 'Voltar à lista de pacientes' : 'Voltar à ficha do paciente';
    return (
      <main aria-label="Erro ao abrir a dieta" className="flex w-full max-w-container-workflow flex-1 flex-col gap-6 px-8 py-6 lg:mx-auto">
        <section role="alert" aria-live="assertive" className="flex flex-col gap-3">
          <h1 className={textStyle('section-title')}>Não foi possível abrir a dieta</h1>
          <p className={textStyle('body')}>{loadState.message}</p>
        </section>
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={retryLoad}>Tentar novamente</Button>
          <Button variant="secondary" onClick={() => router.push(loadState.returnPath)}>{returnLabel}</Button>
        </div>
      </main>
    );
  }

  if (loadState.status !== 'ready' || !dietPlan || !patient) {
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
          onOpenCycleMatrix: handleOpenCycleMatrix,
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
        onAddMeal={handleAddMealAndScroll}
        onReorderMeals={handleReorderMeals}
        onOpenAdjustGoalsModal={openAdjustGoalsModal}
        onPullPreviousGoals={handlePullPreviousGoals}
        onOpenImportPreviousDietModal={openImportPreviousDietModal}
        hasPreviousDiets={hasPreviousDiets}
        onWhatsAppShare={openWhatsAppModal}
        onExportPDF={handleOpenPdfPreview}
        onExportPage={dietPlan.mode === 'simple' ? () => { setPageError(null); setIsPageModalOpen(true); } : undefined}
        onSaveDiet={handleSaveDiet}
        onOpenSaveReadyDiet={() => setIsReadyDietModalOpen(true)}
        saveStatus={saveStatus}
        onDiscardDraft={onDiscardDraft}
        onBackClick={onBackClick}
        confirmationBusy={confirmationBusy}
      />

      <CreateReadyMealsFromDietModal
        open={readyMealSource !== null}
        meal={readyMealSource?.meal ?? null}
        activeVariationId={readyMealSource?.activeVariationId}
        isSaving={isSavingReadyMeals}
        confirmOutsideDismiss={dietaId === 'nova'}
        onOpenChange={(open) => { if (!open) setReadyMealSource(null); }}
        onConfirm={handleCreateReadyMeals}
      />

      <SaveReadyDietModal
        open={isReadyDietModalOpen}
        initialName={dietPlan?.name ?? 'Dieta pronta'}
        meals={readyDietMealEntries}
        isSaving={isSavingReadyDiet}
        confirmOutsideDismiss={dietaId === 'nova'}
        onOpenChange={setIsReadyDietModalOpen}
        onConfirm={handleSaveReadyDiet}
      />

      <Dialog open={isPageModalOpen} onOpenChange={value => { if (!isPagePreparing) setIsPageModalOpen(value); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar página inteligente</DialogTitle>
            <DialogDescription>{patient.name} · Dieta simples. Confira a apresentação antes de compartilhar com o paciente.</DialogDescription>
          </DialogHeader>
          <section className="flex flex-col gap-4" aria-labelledby="page-options-title">
            <h2 id="page-options-title" className={textStyle('subsection-title')}>Conteúdo da página</h2>
            {([
              ['checklist', 'Checklist de alimentos', 'Permite ao paciente marcar os alimentos da refeição.'],
              ['mealMacros', 'Macros das refeições', 'Mostra o resumo nutricional de cada refeição.'],
              ['dayMacros', 'Macros do dia', 'Mostra o total nutricional diário.'],
            ] as const).map(([key, label, description]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p id={`page-option-${key}`} className={textStyle('field-label')}>{label}</p>
                  <p id={`page-option-help-${key}`} className={textStyle('helper')}>{description}</p>
                </div>
                <ToggleGroup type="single" value={pageOptions[key] ? 'yes' : 'no'} aria-labelledby={`page-option-${key}`} aria-describedby={`page-option-help-${key}`} onValueChange={(value: string) => {
                  const next = { ...pageOptions, [key]: value === 'yes' };
                  setPageOptions(next);
                  const params = new URLSearchParams(window.location.search);
                  Object.entries(next).forEach(([option, enabled]) => params.set(option, enabled ? '1' : '0'));
                  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
                }}>
                  <ToggleGroupItem value="yes" disabled={isPagePreparing}>Sim</ToggleGroupItem>
                  <ToggleGroupItem value="no" disabled={isPagePreparing}>Não</ToggleGroupItem>
                </ToggleGroup>
              </div>
            ))}
          </section>
          <p role="status" className={textStyle('body-secondary')}>Publicação online ainda não configurada. Você pode abrir a prévia local com os dados atuais da dieta.</p>
          {pageError && <p role="alert" className={textStyle('body')}>{pageError}</p>}
          <DialogFooter>
            <Button variant="secondary" disabled={isPagePreparing} onClick={() => setIsPageModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" disabled={isPagePreparing} onClick={handleOpenPagePreview}>{isPagePreparing ? 'Preparando…' : 'Abrir prévia local'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Busca de Alimentos */}
      <FoodSearchModal
        isOpen={foodSearchMealIndex !== null}
        onClose={() => setFoodSearchMealIndex(null)}
        mealTitle={foodSearchMealIndex !== null && currentMeals[foodSearchMealIndex] ? currentMeals[foodSearchMealIndex].name : 'Refeição'}
        onAddFood={handleAddFoodToMeal}
        enableLibrarySources
        onAddRecipe={handleInsertRecipeIntoDietDraft}
        onAddReadyMeal={handleInsertReadyMealIntoDietDraft}
        returnFocusRef={foodSearchTriggerRef}
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
        whatsAppOptions={whatsAppOptions}
        onOptionsChange={updateWhatsAppOptions}
        variations={dietPlan.mode === 'carb_cycling' ? dietPlan.carbCyclingVariations : []}
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
