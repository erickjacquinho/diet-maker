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
  cloneMealsWithFreshIds,
  type PreviousDietSummary,
} from '@/lib/legacy-diet-copy';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { toast } from 'sonner';
import { useDietCalculations } from './useDietCalculations';
import { useDietBuilderModals } from './useDietBuilderModals';
import { useDietMealActions } from './useDietMealActions';
import { useDietPresets } from './useDietPresets';
import { useSaveShortcut } from './useSaveShortcut';
import { getBrowserDietApplication, getBrowserPatientApplication, getBrowserProfileSession } from '@/lib/application/browser-composition';
import type { DietApplication } from '@/lib/application/diets/diet-ports';
import type { CheckpointPendingSaveOutcome, ConfirmedDietSaveOutcome, SaveReconciliationOutcome } from '@/lib/domain/diets/diet-model';
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

function showCleanupRetryToast(message: string, retry: () => Promise<void>, severity: 'warning' | 'error' = 'warning') {
  const options = {
    duration: severity === 'error' ? Infinity : 7000,
    action: {
      label: 'Tentar limpar rascunho',
      onClick: () => retry(),
    },
  };
  if (severity === 'error') toast.error(message, options);
  else toast.warning(message, options);
}

export type DietEditorLoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; code: string; message: string; returnPath: string };

function loadErrorDetails(error: unknown): { code: string; message: string } {
  const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : 'UNKNOWN';
  const message = error instanceof Error && error.message ? error.message : 'Não foi possível abrir a dieta neste momento.';
  return { code, message };
}

export function useDietBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const profileSession = getBrowserProfileSession();

  const patientId = params?.id as string;
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientLoadStatus, setPatientLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [patientLoadError, setPatientLoadError] = useState<unknown>(null);
  const [patientLoadAttempt, setPatientLoadAttempt] = useState(0);
  const [dietApplication, setDietApplication] = useState<DietApplication | null>(null);
  const [dietApplicationLoadStatus, setDietApplicationLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [dietApplicationLoadError, setDietApplicationLoadError] = useState<unknown>(null);
  const [dietApplicationLoadAttempt, setDietApplicationLoadAttempt] = useState(0);
  const [activeVariationId, setActiveVariationId] = useState<string>('var-high');
  const [activeMealVariationIds, setActiveMealVariationIds] = useState<ActiveMealVariationIds>({});
  const [previousDiets, setPreviousDiets] = useState<PreviousDietSummary[]>([]);
  const canonicalSourcesRef = useRef<Awaited<ReturnType<DietApplication['listPreviousDietSources']>>>([]);
  const lastPersistedDocumentRef = useRef<string | null>(null);
  const currentRevisionRef = useRef<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'clean' | 'pending' | 'saving' | 'persisted' | 'error' | 'committing' | 'cleanup-pending'>('clean');
  const [confirmationBusy, setConfirmationBusy] = useState(false);
  const confirmationBusyRef = useRef(false);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    setPatientLoadStatus('loading');
    setPatientLoadError(null);
    void getBrowserPatientApplication().then((application) => application.getPatientProfile(patientId)).then((profile) => {
      if (!cancelled) {
        setPatient(toPatientViewModel(profile.patient));
        setPatientLoadStatus('ready');
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setPatient(null);
        setPatientLoadError(error);
        setPatientLoadStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [patientId, patientLoadAttempt]);

  useEffect(() => {
    let cancelled = false;
    setDietApplicationLoadStatus('loading');
    setDietApplicationLoadError(null);
    void getBrowserDietApplication().then((application) => {
      if (!cancelled) {
        setDietApplication(application);
        setDietApplicationLoadStatus('ready');
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setDietApplication(null);
        setDietApplicationLoadError(error);
        setDietApplicationLoadStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [dietApplicationLoadAttempt]);

  const { dietPlan, setDietPlan, draft, setDraft: setLoadedDraft, openStatus, openError, retryOpenEditor } = useDietPresets({
    patientId,
    dietaId,
    patient,
    dietApplication,
    setActiveVariationId,
    setActiveMealVariationIds,
  });

  const patientFailure = patientLoadStatus === 'error' ? patientLoadError ?? new Error('Não foi possível abrir o perfil do paciente.') : null;
  const applicationFailure = dietApplicationLoadStatus === 'error' ? dietApplicationLoadError ?? new Error('Não foi possível inicializar o editor local.') : null;
  const editorFailure = openStatus === 'error' ? openError ?? new Error('Não foi possível abrir o rascunho da dieta.') : null;
  const loadError = patientFailure ?? applicationFailure ?? editorFailure;
  const loadState: DietEditorLoadState = loadError !== null
    ? (() => {
      const details = loadErrorDetails(loadError);
      const returnToList = patientLoadError !== null || dietApplicationLoadError !== null || details.code === 'ARCHIVED_PATIENT';
      return { status: 'error', ...details, returnPath: returnToList ? '/pacientes' : `/pacientes/${patientId}` };
    })()
    : patientLoadStatus === 'ready' && dietApplicationLoadStatus === 'ready' && openStatus === 'ready' && patient && dietPlan && draft
      ? { status: 'ready' }
      : { status: 'loading' };

  const retryLoad = useCallback(() => {
    if (patientLoadStatus === 'error') {
      setPatientLoadStatus('loading');
      setPatientLoadError(null);
      setPatientLoadAttempt((attempt) => attempt + 1);
      return;
    }
    if (dietApplicationLoadStatus === 'error') {
      setDietApplicationLoadStatus('loading');
      setDietApplicationLoadError(null);
      setDietApplicationLoadAttempt((attempt) => attempt + 1);
      return;
    }
    retryOpenEditor();
  }, [dietApplicationLoadStatus, patientLoadStatus, retryOpenEditor]);

  const canMutate = useCallback(() => !confirmationBusyRef.current && profileSession.isReady(), [profileSession]);
  const setDietPlanIfEditable = useCallback((update: Parameters<typeof setDietPlan>[0]) => {
    if (!canMutate()) return;
    setDietPlan((current) => {
      if (!canMutate()) return current;
      return typeof update === 'function' ? update(current) : update;
    });
  }, [canMutate, setDietPlan]);

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
      if (!canMutate()) return;
      const mode = dietPlan?.mode || 'simple';
      const contextKey = getMealVariationContextKey(mode, mealId, activeVariationId);
      setActiveMealVariationIds((prev) => ({ ...prev, [contextKey]: variationId }));
    },
    [activeVariationId, canMutate, dietPlan?.mode]
  );

  const updateActiveMeals = useCallback(
    (updater: (prevMeals: DietMeal[]) => DietMeal[]) => {
      if (!canMutate()) return;
      setDietPlanIfEditable((prev) => {
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
    [activeVariationId, canMutate, setDietPlanIfEditable]
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
    setDietPlan: setDietPlanIfEditable,
    updateActiveMeals,
    canMutate,
    getActiveMealVariationId,
  });

  // Meal Actions hook
  const mealActions = useDietMealActions({
    foodSearchMealIndex: modals.foodSearchMealIndex,
    currentMeals: mealGroups,
    updateActiveMeals,
    canMutate,
    getActiveMealVariationId,
    onSelectMealVariation: handleSelectMealVariation,
  });

  const { foodSearchMealIndex, setFoodSearchMealIndex } = modals;

  const syncInsertedLibraryDraft = useCallback((updated: Awaited<ReturnType<DietApplication['openEditor']>>['draft']) => {
    if (!canMutate()) return;
    setLoadedDraft(updated);
    setDietPlanIfEditable(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
    currentRevisionRef.current = updated.draftRevision;
    lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
  }, [canMutate, dietaId, patientId, setDietPlanIfEditable, setLoadedDraft]);

  const insertLibraryIntoSelectedMeal = useCallback(async (kind: 'recipe' | 'readyMeal', sourceId: string) => {
    if (!canMutate()) return;
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
  }, [activeVariationId, canMutate, dietApplication, dietPlan?.mode, draft, foodSearchMealIndex, getActiveMealVariationId, mealGroups, setFoodSearchMealIndex, syncInsertedLibraryDraft]);

  const handleInsertRecipeIntoDietDraft = useCallback(
    (recipeId: string) => insertLibraryIntoSelectedMeal('recipe', recipeId),
    [insertLibraryIntoSelectedMeal],
  );

  const handleInsertReadyMealIntoDietDraft = useCallback(
    (readyMealId: string) => insertLibraryIntoSelectedMeal('readyMeal', readyMealId),
    [insertLibraryIntoSelectedMeal],
  );

  const handleModeChange = useCallback((newMode: 'simple' | 'carb_cycling') => {
    if (!canMutate()) return;
    setDietPlanIfEditable((prev) => {
      if (!prev) return prev;
      if (newMode !== 'carb_cycling' || prev.carbCyclingVariations.length > 0) {
        if (newMode === 'carb_cycling' && prev.mode !== 'carb_cycling') {
          const firstVariation = prev.carbCyclingVariations[0];
          setActiveVariationId(firstVariation?.id || 'var-high');
          if (firstVariation && firstVariation.meals.length === 0 && prev.simpleMeals.length > 0) {
            return {
              ...prev,
              mode: newMode,
              carbCyclingVariations: prev.carbCyclingVariations.map((variation, index) =>
                index === 0 ? { ...variation, meals: cloneMealsWithFreshIds(prev.simpleMeals) } : variation
              ),
            };
          }
        }
        return { ...prev, mode: newMode };
      }
      const weight = patient?.weightKg || 70;
      const protein = prev.simpleTargetProtein || Math.round(weight * 2);
      const carbs = prev.simpleTargetCarbs || Math.round(weight * 2.5);
      const fat = prev.simpleTargetFats || Math.round(weight * 0.8);
      const makeVariation = (id: string, name: string, assignedDays: CarbCyclingVariation['assignedDays'], carbFactor: number, meals: DietMeal[] = []): CarbCyclingVariation => {
        const targetCarbs = Math.round(carbs * carbFactor);
        return {
          id, name, type: id === 'var-high' ? 'high' : id === 'var-med' ? 'medium' : 'low', assignedDays,
          targetKcal: calculatePresetCalories(protein, targetCarbs, fat), targetProtein: protein, targetCarbs, targetFats: fat,
          inputMode: 'grams', gPerKg: { protein: Number((protein / weight).toFixed(1)), carbs: Number((targetCarbs / weight).toFixed(1)), fats: Number((fat / weight).toFixed(1)) }, meals,
        };
      };
      setActiveVariationId('var-high');
      return {
        ...prev,
        mode: newMode,
        carbCyclingVariationsCount: 3,
        carbCyclingVariations: [
          makeVariation('var-high', 'Dia Alto Carbo', ['seg', 'qua', 'sex'], 1.3, cloneMealsWithFreshIds(prev.simpleMeals)),
          makeVariation('var-med', 'Dia Médio Carbo', ['ter', 'qui'], 1),
          makeVariation('var-low', 'Dia Baixo Carbo', ['sab', 'dom'], 0.5),
        ],
      };
    });
  }, [canMutate, patient?.weightKg, setActiveVariationId, setDietPlanIfEditable]);

  const handleVariationsCountChange = useCallback((newCount: 2 | 3) => {
    if (!canMutate()) return;
    setDietPlanIfEditable((prev) => (prev ? { ...prev, carbCyclingVariationsCount: newCount } : prev));
    if (newCount === 2 && activeVariationId === 'var-med') {
      setActiveVariationId('var-high');
    }
  }, [activeVariationId, canMutate, setDietPlanIfEditable]);

  const handleAddVariation = useCallback(() => {
    if (!canMutate()) return;
    setDietPlanIfEditable((prev) => {
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
  }, [canMutate, patient, setDietPlanIfEditable]);

  const handleRemoveVariation = useCallback((varId: string) => {
    if (!canMutate()) return;
    setDietPlanIfEditable((prev) => {
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
  }, [activeVariationId, canMutate, setDietPlanIfEditable]);

  const handleReorderVariations = useCallback((newVariations: CarbCyclingVariation[]) => {
    if (!canMutate()) return;
    setDietPlanIfEditable((prev) => (prev ? { ...prev, carbCyclingVariations: newVariations } : prev));
  }, [canMutate, setDietPlanIfEditable]);

  const hasPreviousDiets = previousDiets.length > 0;

  const handlePullMacrosOnly = useCallback(
    async (selectedDiet: PreviousDietSummary) => {
      if (!canMutate()) return;
      if (!selectedDiet || !dietApplication || !draft) return;
      const source = canonicalSourcesRef.current.find((candidate) => candidate.plan.id === selectedDiet.id);
      const targetVariation = draft.payload.variations.find((variation) => variation.id === activeVariationId) ?? draft.payload.variations[0];
      const sourceVariation = source?.plan.variations[0];
      if (!sourceVariation || !targetVariation) return;
      const updated = await dietApplication.pullTargets(draft.draftId, source.plan.id, sourceVariation.id, targetVariation.id);
      if (!canMutate()) return;
      setLoadedDraft(updated);
      setDietPlanIfEditable(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
      currentRevisionRef.current = updated.draftRevision;
      lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
      toast.success(`Metas importadas da dieta "${selectedDiet.name}".`);
    },
    [activeVariationId, canMutate, dietaId, dietApplication, draft, patientId, setDietPlanIfEditable, setLoadedDraft]
  );

  const handlePullAllMeals = useCallback(
    async (selectedDiet: PreviousDietSummary) => {
      if (!canMutate()) return;
      if (!selectedDiet || !dietApplication || !draft) return;
      const source = canonicalSourcesRef.current.find((candidate) => candidate.plan.id === selectedDiet.id);
      if (!source) return;
      const updated = await dietApplication.pullCompleteDiet(draft.draftId, source.plan.id);
      if (!canMutate()) return;
      setLoadedDraft(updated);
      setDietPlanIfEditable(fromEditableDocument(updated.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, updated.createdAt, updated.updatedAt));
      setActiveVariationId(updated.payload.variations[0]?.id ?? 'var-high');
      currentRevisionRef.current = updated.draftRevision;
      lastPersistedDocumentRef.current = JSON.stringify(updated.payload);
      const totalMeals = updated.payload.variations[0]?.meals.length ?? 0;
      toast.success(`Dieta "${selectedDiet.name}" duplicada com sucesso (${totalMeals} ${totalMeals === 1 ? 'refeição' : 'refeições'}).`);
    },
    [canMutate, dietApplication, draft, dietaId, patientId, setDietPlanIfEditable, setLoadedDraft, setActiveVariationId]
  );

  const handlePullPreviousGoals = useCallback(() => {
    if (!hasPreviousDiets) {
      toast.info('Nenhuma dieta anterior encontrada para este paciente.');
      return;
    }
    modals.openImportPreviousDietModal();
  }, [hasPreviousDiets, modals]);

  const flushCurrentDraft = useCallback(async () => {
    if (!dietApplication || !draft || !dietPlan) return null;
    const document = toEditableDocument(dietPlan);
    const flush = () => dietApplication.flushDraft(draft.draftId, document);
    let result = await flush();
    if (result.status === 'SUPERSEDED') result = await flush();
    if (result.status === 'SAVED') {
      currentRevisionRef.current = result.revision;
      setLoadedDraft((current) => current ? { ...current, payload: document, draftRevision: result.revision } : current);
      lastPersistedDocumentRef.current = JSON.stringify(document);
    }
    return result;
  }, [dietApplication, dietPlan, draft, setLoadedDraft]);
  const handleSaveDiet = useCallback(async () => {
    if (!dietApplication || !draft || !dietPlan || saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    confirmationBusyRef.current = true;
    setConfirmationBusy(true);
    setSaveStatus('saving');
    const retryCleanup = async (confirmedDraftRevision: number): Promise<void> => {
      try {
        const outcome = await dietApplication.reconcileUnknownSave(draft.draftId, confirmedDraftRevision, { cleanupOnly: true });
        if (outcome.status === 'COMMITTED') toast.success('A limpeza do rascunho foi concluída.');
        else if (outcome.status === 'CLEANUP_PENDING') showCleanupRetryToast(outcome.message, () => retryCleanup(confirmedDraftRevision));
        else toast.error(outcome.message);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Não foi possível limpar o rascunho confirmado.');
      }
    };
    const finishConfirmed = (outcome: ConfirmedDietSaveOutcome | CheckpointPendingSaveOutcome) => {
      const localOutcome = outcome.status === 'CHECKPOINT_PENDING' ? outcome.localOutcome : outcome;
      const cleanupPending = localOutcome.status === 'CLEANUP_PENDING';
      if (outcome.status === 'CHECKPOINT_PENDING') {
        if (cleanupPending) {
          showCleanupRetryToast(outcome.message, () => retryCleanup(localOutcome.confirmedDraftRevision), 'error');
        } else {
          toast.error(outcome.message);
        }
      } else if (cleanupPending) {
        showCleanupRetryToast(outcome.message, () => retryCleanup(localOutcome.confirmedDraftRevision));
      } else {
        toast.success(outcome.message);
      }
      setSaveStatus(cleanupPending ? 'cleanup-pending' : 'persisted');
      router.push(`/pacientes/${patientId}`);
    };
    try {
      const flushed = await flushCurrentDraft();
      if (!flushed || flushed.status !== 'SAVED') {
        const message = 'A edição mudou durante o salvamento. Recarregue o draft antes de confirmar.';
        setSaveStatus('error');
        showSaveErrorToast(message, handleSaveDiet);
        return;
      }
      setSaveStatus('committing');
      let outcome = await dietApplication.saveDietAsActive(draft.draftId, flushed.revision);
      if (outcome.status === 'RESULT_UNKNOWN') {
        let reconciled: SaveReconciliationOutcome;
        try {
          reconciled = await dietApplication.reconcileUnknownSave(draft.draftId, flushed.revision);
        } catch (error: unknown) {
          setSaveStatus('error');
          toast.error(error instanceof Error ? error.message : 'O resultado continua incerto; revise a prescrição antes de tentar novamente.');
          return;
        }
        if (reconciled.status === 'COMMITTED' || reconciled.status === 'CLEANUP_PENDING' || reconciled.status === 'CHECKPOINT_PENDING') {
          finishConfirmed(reconciled);
          return;
        }
        setSaveStatus('error');
        if (reconciled.status === 'NOT_COMMITTED') showSaveErrorToast(reconciled.message, handleSaveDiet);
        else toast.error(reconciled.message);
        return;
      }
      if (outcome.status === 'COMMITTED' || outcome.status === 'CLEANUP_PENDING' || outcome.status === 'CHECKPOINT_PENDING') {
        finishConfirmed(outcome);
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
      confirmationBusyRef.current = false;
      setConfirmationBusy(false);
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
    try {
      if (!dietApplication || !draft) throw new Error('O rascunho não está disponível para descarte.');
      if (saveInFlightRef.current) throw new Error('Aguarde o salvamento da prescrição antes de descartar o rascunho.');
      const revision = currentRevisionRef.current ?? draft.draftRevision;
      let result = await dietApplication.discardDraft(draft.draftId, revision);
      if (result === 'SUPERSEDED_REVISION') {
        const latest = await flushCurrentDraft();
        if (!latest || latest.status === 'INVALIDATED') throw new Error('Não foi possível sincronizar o rascunho antes de descartá-lo.');
        const latestRevision = latest.status === 'SAVED' ? latest.revision : latest.currentRevision;
        result = await dietApplication.discardDraft(draft.draftId, latestRevision);
      }
      if (result === 'SUPERSEDED_REVISION') throw new Error('O rascunho mudou durante o descarte. Aguarde a sincronização e tente novamente.');
      router.push(`/pacientes/${patientId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível descartar o rascunho.');
      throw error;
    }
  }, [dietApplication, draft, flushCurrentDraft, patientId, router]);

  const handleBackClick = useCallback(async () => {
    if (saveInFlightRef.current) return;
    try {
      const result = await flushCurrentDraft();
      if (result?.status !== 'SAVED') {
        const message = result?.status === 'SUPERSEDED'
          ? 'A edição mudou durante o salvamento. Tente novamente antes de sair.'
          : result?.status === 'INVALIDATED'
            ? 'O rascunho foi invalidado e não pôde ser salvo. Revise esta edição antes de sair.'
            : 'A edição local não foi salva. Tente novamente antes de sair.';
        showSaveErrorToast(message, () => handleBackClick());
        return;
      }
      router.push(`/pacientes/${patientId}`);
    } catch (error: unknown) {
      showSaveErrorToast(error instanceof Error ? error.message : 'Não foi possível salvar a edição local. Tente novamente antes de sair.', () => handleBackClick());
    }
  }, [flushCurrentDraft, patientId, router]);

  const hasOpenEditDialog = modals.foodSearchMealIndex !== null
    || modals.isCopyModalOpen
    || modals.isCycleMatrixOpen
    || modals.isAdjustGoalsModalOpen
    || modals.foodToSubstitute !== null
    || modals.isImportPreviousDietModalOpen;

  useSaveShortcut({
    onSave: handleSaveDiet,
    priority: 0,
    enabled: !hasOpenEditDialog,
    busy: confirmationBusy,
  });

  return {
    patientId,
    dietaId,
    patient,
    dietPlan,
    loadState,
    retryLoad,
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
    confirmationBusy,
    onDiscardDraft: handleDiscardDraft,
    onBackClick: handleBackClick,
    flushDraft: flushCurrentDraft,
    saveStatus,
    router,
  };
}

