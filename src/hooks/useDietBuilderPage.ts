import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Patient } from '@/lib/patientsStore';
import type {
  DietMeal,
  CarbCyclingVariation,
  FullDietPlan,
} from '@/lib/legacy-diet-types';
import {
  getBaseMealVariationId,
  getMealVariationContextKey,
  getActiveMealVariationId as resolveActiveMealVariationId,
  type ActiveMealVariationIds,
} from '@/lib/mealVariations';
import {
  buildPreviousDietSummaries,
  type PreviousDietSummary,
} from '@/lib/legacy-diet-copy';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { toast } from 'sonner';
import { useDietCalculations } from './useDietCalculations';
import { useDietBuilderModals } from './useDietBuilderModals';
import { useDietMealActions } from './useDietMealActions';
import { useDietPresets } from './useDietPresets';
import { useSaveShortcut } from './useSaveShortcut';
import { getBrowserDietApplication, getBrowserPatientApplication } from '@/lib/application/browser-composition';
import type { DietApplication } from '@/lib/application/diets/diet-ports';
import { fromCanonicalPlan, fromEditableDocument, toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import { toPatientViewModel } from '@/lib/patientViewModel';

function showSaveErrorToast(message: string, retry: () => void | Promise<void>) {
  toast.error(message, {
    duration: Infinity,
    action: {
      label: 'Tentar novamente',
      onClick: () => { void retry(); },
    },
  });
}

export function useDietBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = params?.id as string;
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietApplication, setDietApplication] = useState<DietApplication | null>(null);
  const [activeVariationId, setActiveVariationId] = useState<string>('var-high');
  const [activeMealVariationIds, setActiveMealVariationIds] = useState<ActiveMealVariationIds>({});
  const [previousDiets, setPreviousDiets] = useState<PreviousDietSummary[]>([]);
  const canonicalSourcesRef = useRef<Awaited<ReturnType<DietApplication['listPreviousDietSources']>>>([]);
  const lastPersistedDocumentRef = useRef<string | null>(null);
  const currentRevisionRef = useRef<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'clean' | 'pending' | 'saving' | 'persisted' | 'error' | 'committing' | 'cleanup-pending'>('clean');

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    void getBrowserPatientApplication().then((application) => application.getPatientProfile(patientId)).then((profile) => {
      if (!cancelled) setPatient(toPatientViewModel(profile.patient));
    }).catch(() => {
      if (!cancelled) setPatient(null);
    });
    return () => { cancelled = true; };
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    void getBrowserDietApplication().then((application) => {
      if (!cancelled) setDietApplication(application);
    }).catch(() => {
      if (!cancelled) setDietApplication(null);
    });
    return () => { cancelled = true; };
  }, []);

  const { dietPlan, setDietPlan, draft, setDraft: setLoadedDraft } = useDietPresets({
    patientId,
    dietaId,
    patient,
    dietApplication,
    setActiveVariationId,
    setActiveMealVariationIds,
  });

  useEffect(() => {
    if (!dietApplication || !patientId || !patient) return;
    let cancelled = false;
    void dietApplication.listPreviousDietSources(patientId).then((sources) => {
      if (cancelled) return;
      canonicalSourcesRef.current = sources;
      setPreviousDiets(sources
        .filter((source) => source.plan.id !== dietaId)
        .map((source) => {
          const plan = fromCanonicalPlan(source.plan);
          return buildPreviousDietSummaries([plan], [], dietaId)[0];
        })
        .filter((summary): summary is PreviousDietSummary => Boolean(summary)));
    }).catch(() => {
      if (!cancelled) {
        canonicalSourcesRef.current = [];
        setPreviousDiets([]);
      }
    });
    return () => { cancelled = true; };
  }, [dietApplication, dietaId, patient, patientId]);

  useEffect(() => {
    if (!draft || !dietPlan) return;
    currentRevisionRef.current = draft.draftRevision;
    lastPersistedDocumentRef.current = JSON.stringify(toEditableDocument(dietPlan));
  }, [draft?.draftId]);

  // Calculations hook
  const {
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
    mealGroups,
  } = useDietCalculations(dietPlan, activeVariationId, patient, activeMealVariationIds);

  const getActiveMealVariationId = useCallback(
    (mealId: string, mealOverride?: DietMeal) => {
      const mode = dietPlan?.mode || 'simple';
      const contextKey = getMealVariationContextKey(mode, mealId, activeVariationId);
      const meal = mealOverride || mealGroups.find((candidate) => candidate.id === mealId);
      if (!meal) return activeMealVariationIds[contextKey] || getBaseMealVariationId(mealId);
      return resolveActiveMealVariationId(meal, activeMealVariationIds[contextKey]);
    },
    [activeMealVariationIds, activeVariationId, dietPlan?.mode, mealGroups]
  );

  const handleSelectMealVariation = useCallback(
    (mealId: string, variationId: string) => {
      const mode = dietPlan?.mode || 'simple';
      const contextKey = getMealVariationContextKey(mode, mealId, activeVariationId);
      setActiveMealVariationIds((prev) => ({ ...prev, [contextKey]: variationId }));
    },
    [activeVariationId, dietPlan?.mode]
  );

  const updateActiveMeals = useCallback(
    (updater: (prevMeals: DietMeal[]) => DietMeal[]) => {
      setDietPlan((prev) => {
        if (!prev) return prev;
        if (prev.mode === 'simple') {
          return { ...prev, simpleMeals: updater(prev.simpleMeals || []) };
        } else {
          return {
            ...prev,
            carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
              v.id === activeVariationId ? { ...v, meals: updater(v.meals) } : v
            ),
          };
        }
      });
    },
    [activeVariationId, setDietPlan]
  );

  // Modals hook
  const modals = useDietBuilderModals({
    patient,
    dietPlan,
    currentMeals,
    currentTotals,
    targetProt,
    targetCarb,
    targetFat,
    activeVariationId,
    activeMealVariationIds,
    setDietPlan,
    updateActiveMeals,
    getActiveMealVariationId,
  });

  // Meal Actions hook
  const mealActions = useDietMealActions({
    foodSearchMealIndex: modals.foodSearchMealIndex,
    currentMeals: mealGroups,
    updateActiveMeals,
    getActiveMealVariationId,
    onSelectMealVariation: handleSelectMealVariation,
  });

  const { foodSearchMealIndex, setFoodSearchMealIndex } = modals;

  const syncInsertedLibraryDraft = useCallback((updated: Awaited<ReturnType<DietApplication['openEditor']>>['draft']) => {
    setLoadedDraft(updated);
    setDietPlan(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
    currentRevisionRef.current = updated.draftRevision;
    lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
  }, [dietaId, patientId, setDietPlan, setLoadedDraft]);

  const insertLibraryIntoSelectedMeal = useCallback(async (kind: 'recipe' | 'readyMeal', sourceId: string) => {
    if (!dietApplication || !draft || foodSearchMealIndex === null) return;
    const targetMeal = mealGroups[foodSearchMealIndex];
    const targetVariation = draft.payload.variations.find((variation) =>
      dietPlan?.mode === 'carb_cycling' ? variation.id === activeVariationId : variation.position === 0,
    ) ?? draft.payload.variations[0];
    const targetOptions = targetVariation?.meals.find((meal) => meal.id === targetMeal?.id)?.options;
    const activeMealOptionId = targetMeal && getActiveMealVariationId(targetMeal.id, targetMeal);
    const targetOption = targetOptions?.find((option) => option.id === activeMealOptionId) ?? targetOptions?.[0];
    if (!targetMeal || !targetVariation || !targetOption) throw new Error('A refeição de destino não está disponível.');

    const expectedRevision = currentRevisionRef.current ?? draft.draftRevision;
    const updated = kind === 'recipe'
      ? await dietApplication.insertRecipeIntoDietDraft({ draftId: draft.draftId, expectedRevision, recipeId: sourceId, variationId: targetVariation.id, mealId: targetMeal.id })
      : await dietApplication.insertReadyMealIntoDietDraft({ draftId: draft.draftId, expectedRevision, readyMealId: sourceId, variationId: targetVariation.id, mealId: targetMeal.id, optionId: targetOption.id });

    syncInsertedLibraryDraft(updated);
    setFoodSearchMealIndex(null);
    toast.success(kind === 'recipe' ? 'Receita inserida no rascunho.' : 'Refeição pronta inserida no rascunho.');
  }, [activeVariationId, dietApplication, dietPlan?.mode, draft, foodSearchMealIndex, getActiveMealVariationId, mealGroups, setFoodSearchMealIndex, syncInsertedLibraryDraft]);

  const handleInsertRecipeIntoDietDraft = useCallback(
    (recipeId: string) => insertLibraryIntoSelectedMeal('recipe', recipeId),
    [insertLibraryIntoSelectedMeal],
  );

  const handleInsertReadyMealIntoDietDraft = useCallback(
    (readyMealId: string) => insertLibraryIntoSelectedMeal('readyMeal', readyMealId),
    [insertLibraryIntoSelectedMeal],
  );

  const handleModeChange = useCallback((newMode: 'simple' | 'carb_cycling') => {
    setDietPlan((prev) => {
      if (!prev) return prev;
      if (newMode !== 'carb_cycling' || prev.carbCyclingVariations.length > 0) {
        if (newMode === 'carb_cycling' && prev.mode !== 'carb_cycling') {
          setActiveVariationId(prev.carbCyclingVariations[0]?.id || 'var-high');
        }
        return { ...prev, mode: newMode };
      }
      const weight = patient?.weightKg || 70;
      const protein = prev.simpleTargetProtein || Math.round(weight * 2);
      const carbs = prev.simpleTargetCarbs || Math.round(weight * 2.5);
      const fat = prev.simpleTargetFats || Math.round(weight * 0.8);
      const makeVariation = (id: string, name: string, assignedDays: CarbCyclingVariation['assignedDays'], carbFactor: number): CarbCyclingVariation => {
        const targetCarbs = Math.round(carbs * carbFactor);
        return {
          id, name, type: id === 'var-high' ? 'high' : id === 'var-med' ? 'medium' : 'low', assignedDays,
          targetKcal: calculatePresetCalories(protein, targetCarbs, fat), targetProtein: protein, targetCarbs, targetFats: fat,
          inputMode: 'grams', gPerKg: { protein: Number((protein / weight).toFixed(1)), carbs: Number((targetCarbs / weight).toFixed(1)), fats: Number((fat / weight).toFixed(1)) }, meals: [],
        };
      };
      setActiveVariationId('var-high');
      return {
        ...prev,
        mode: newMode,
        carbCyclingVariationsCount: 3,
        carbCyclingVariations: [
          makeVariation('var-high', 'Dia Alto Carbo', ['seg', 'qua', 'sex'], 1.3),
          makeVariation('var-med', 'Dia Médio Carbo', ['ter', 'qui'], 1),
          makeVariation('var-low', 'Dia Baixo Carbo', ['sab', 'dom'], 0.5),
        ],
      };
    });
  }, [patient?.weightKg, setActiveVariationId, setDietPlan]);

  const handleVariationsCountChange = useCallback((newCount: 2 | 3) => {
    setDietPlan((prev) => (prev ? { ...prev, carbCyclingVariationsCount: newCount } : prev));
    if (newCount === 2 && activeVariationId === 'var-med') {
      setActiveVariationId('var-high');
    }
  }, [activeVariationId, setDietPlan]);

  const handleAddVariation = useCallback(() => {
    setDietPlan((prev) => {
      if (!prev) return prev;
      const weight = patient?.weightKg || 70;
      const nextIdx = prev.carbCyclingVariations.length + 1;
      const defaultProt = Math.round(weight * 2.0);
      const defaultCarb = Math.round(weight * 2.5);
      const defaultFat = Math.round(weight * 0.8);
      const kcal = calculatePresetCalories(defaultProt, defaultCarb, defaultFat);

      const newVar: CarbCyclingVariation = {
        id: `var-custom-${nextIdx}`,
        name: `Variação ${nextIdx}`,
        type: 'custom',
        assignedDays: [],
        targetKcal: kcal,
        targetProtein: defaultProt,
        targetCarbs: defaultCarb,
        targetFats: defaultFat,
        inputMode: 'grams',
        gPerKg: {
          protein: Number((defaultProt / weight).toFixed(1)),
          carbs: Number((defaultCarb / weight).toFixed(1)),
          fats: Number((defaultFat / weight).toFixed(1)),
        },
        meals: [],
      };

      return {
        ...prev,
        carbCyclingVariationsCount: prev.carbCyclingVariations.length + 1,
        carbCyclingVariations: [...prev.carbCyclingVariations, newVar],
      };
    });
    toast.success('Nova variação adicionada ao ciclo!');
  }, [patient, setDietPlan]);

  const handleRemoveVariation = useCallback((varId: string) => {
    setDietPlan((prev) => {
      if (!prev) return prev;
      if (prev.carbCyclingVariations.length <= 1) {
        toast.error('O plano precisa ter pelo menos 1 variação.');
        return prev;
      }
      const filtered = prev.carbCyclingVariations.filter((v) => v.id !== varId);
      if (activeVariationId === varId && filtered[0]) {
        setActiveVariationId(filtered[0].id);
      }
      return {
        ...prev,
        carbCyclingVariationsCount: filtered.length,
        carbCyclingVariations: filtered,
      };
    });
    toast.success('Variação removida.');
  }, [activeVariationId, setDietPlan]);

  const handleReorderVariations = useCallback((newVariations: CarbCyclingVariation[]) => {
    setDietPlan((prev) => (prev ? { ...prev, carbCyclingVariations: newVariations } : prev));
  }, [setDietPlan]);

  const hasPreviousDiets = previousDiets.length > 0;

  const handlePullMacrosOnly = useCallback(
    async (selectedDiet: PreviousDietSummary) => {
      if (!selectedDiet || !dietApplication || !draft) return;
      const source = canonicalSourcesRef.current.find((candidate) => candidate.plan.id === selectedDiet.id);
      const targetVariation = draft.payload.variations.find((variation) => variation.id === activeVariationId) ?? draft.payload.variations[0];
      const sourceVariation = source?.plan.variations[0];
      if (!sourceVariation || !targetVariation) return;
      const updated = await dietApplication.pullTargets(draft.draftId, source.plan.id, sourceVariation.id, targetVariation.id);
      setLoadedDraft(updated);
      setDietPlan(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
      currentRevisionRef.current = updated.draftRevision;
      lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
      toast.success(`Metas importadas da dieta "${selectedDiet.name}".`);
    },
    [activeVariationId, dietaId, dietApplication, draft, patientId, setDietPlan, setLoadedDraft]
  );

  const handlePullAllMeals = useCallback(
    async (selectedDiet: PreviousDietSummary) => {
      if (!selectedDiet || !dietApplication || !draft) return;
      const source = canonicalSourcesRef.current.find((candidate) => candidate.plan.id === selectedDiet.id);
      if (!source) return;
      const updated = await dietApplication.pullCompleteDiet(draft.draftId, source.plan.id);
      setLoadedDraft(updated);
      setDietPlan(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
      setActiveVariationId(updated.payload.variations[0]?.id ?? 'var-high');
      currentRevisionRef.current = updated.draftRevision;
      lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
      const totalMeals = updated.payload.variations[0]?.meals.length ?? 0;
      toast.success(`Dieta "${selectedDiet.name}" duplicada com sucesso (${totalMeals} ${totalMeals === 1 ? 'refeição' : 'refeições'}).`);
    },
    [dietApplication, draft, dietaId, patientId, setDietPlan, setLoadedDraft, setActiveVariationId]
  );

  const handlePullPreviousGoals = useCallback(() => {
    if (!hasPreviousDiets) {
      toast.info('Nenhuma dieta anterior encontrada para este paciente.');
      return;
    }
    modals.openImportPreviousDietModal();
  }, [hasPreviousDiets, modals]);

  const saveInFlightRef = useRef(false);
  const flushCurrentDraft = useCallback(async () => {
    if (!dietApplication || !draft || !dietPlan) return null;
    const result = await dietApplication.flushDraft(draft.draftId, toEditableDocument(dietPlan));
    if (result.status === 'SAVED') {
      currentRevisionRef.current = result.revision;
      setLoadedDraft((current) => current ? { ...current, payload: toEditableDocument(dietPlan), draftRevision: result.revision } : current);
      lastPersistedDocumentRef.current = JSON.stringify(toEditableDocument(dietPlan));
    }
    return result;
  }, [dietApplication, dietPlan, draft, setLoadedDraft]);

  const handleSaveDiet = useCallback(async () => {
    if (!dietApplication || !draft || !dietPlan || saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    setSaveStatus('saving');
    try {
      const flushed = await flushCurrentDraft();
      if (!flushed || flushed.status !== 'SAVED') {
        const message = 'A edição mudou durante o salvamento. Recarregue o draft antes de confirmar.';
        setSaveStatus('error');
        showSaveErrorToast(message, handleSaveDiet);
        return;
      }
      setSaveStatus('committing');
      const outcome = await dietApplication.saveDietAsActive(draft.draftId, flushed.revision);
      if (outcome.status === 'COMMITTED' || outcome.status === 'CLEANUP_PENDING') {
        setSaveStatus(outcome.status === 'CLEANUP_PENDING' ? 'cleanup-pending' : 'persisted');
        toast.success(outcome.message);
        router.push(`/pacientes/${patientId}`);
        return;
      }
      setSaveStatus('error');
      showSaveErrorToast(outcome.message, handleSaveDiet);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível confirmar a prescrição.';
      setSaveStatus('error');
      showSaveErrorToast(message, handleSaveDiet);
    } finally {
      saveInFlightRef.current = false;
    }
  }, [dietApplication, dietPlan, draft, flushCurrentDraft, patientId, router]);

  useEffect(() => {
    if (!dietApplication || !draft || !dietPlan || lastPersistedDocumentRef.current === null) return;
    const document = toEditableDocument(dietPlan);
    const serialized = JSON.stringify(document);
    if (serialized === lastPersistedDocumentRef.current) return;
    setSaveStatus('pending');
    const timer = window.setTimeout(() => {
      const expectedRevision = currentRevisionRef.current ?? draft.draftRevision;
      setSaveStatus('saving');
      void dietApplication.autosaveDraft(draft.draftId, expectedRevision, document).then((result) => {
        if (result.status === 'SAVED') {
          currentRevisionRef.current = result.revision;
          lastPersistedDocumentRef.current = serialized;
          setLoadedDraft((current) => current ? { ...current, payload: document, draftRevision: result.revision } : current);
          setSaveStatus('persisted');
          return;
        }
        if (result.status !== 'SUPERSEDED') {
          setSaveStatus('error');
          showSaveErrorToast('O rascunho local foi invalidado e não pôde ser salvo.', handleSaveDiet);
        }
      }).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Não foi possível persistir a edição local.';
        setSaveStatus('error');
        showSaveErrorToast(message, handleSaveDiet);
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [dietApplication, dietPlan, draft, handleSaveDiet, setLoadedDraft]);

  const handleDiscardDraft = useCallback(async () => {
    if (!dietApplication || !draft) return;
    const revision = currentRevisionRef.current ?? draft.draftRevision;
    await dietApplication.discardDraft(draft.draftId, revision);
    router.push(`/pacientes/${patientId}`);
  }, [dietApplication, draft, patientId, router]);

  const handleBackClick = useCallback(async () => {
    if (saveInFlightRef.current) return;
    try {
      await flushCurrentDraft();
    } finally {
      router.push(`/pacientes/${patientId}`);
    }
  }, [flushCurrentDraft, patientId, router]);

  useSaveShortcut({
    onSave: handleSaveDiet,
    priority: 0,
    busy: saveStatus === 'saving' || saveStatus === 'committing',
  });

  return {
    patientId,
    dietaId,
    patient,
    dietPlan,
    activeVariationId,
    setActiveVariationId,
    activeMealVariationIds,
    getActiveMealVariationId,
    handleSelectMealVariation,
    ...modals,
    ...mealActions,
    handleInsertRecipeIntoDietDraft,
    handleInsertReadyMealIntoDietDraft,
    currentMeals,
    mealGroups,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
    previousDiets,
    hasPreviousDiets,
    handleModeChange,
    handleVariationsCountChange,
    handleAddVariation,
    handleRemoveVariation,
    handleReorderVariations,
    handlePullPreviousGoals,
    handlePullMacrosOnly,
    handlePullAllMeals,
    handleSaveDiet,
    onDiscardDraft: handleDiscardDraft,
    onBackClick: handleBackClick,
    flushDraft: flushCurrentDraft,
    saveStatus,
    router,
  };
}

