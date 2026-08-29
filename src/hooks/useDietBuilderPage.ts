import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  DietMeal,
  saveDietToStorage,
  getPatientDietsFromStorage,
  CarbCyclingVariation,
  FullDietPlan,
} from '@/lib/dietStore';
import {
  getBaseMealVariationId,
  getMealVariationContextKey,
  getActiveMealVariationId as resolveActiveMealVariationId,
  type ActiveMealVariationIds,
} from '@/lib/mealVariations';
import {
  PreviousDietSummary,
  buildPreviousDietSummaries,
  cloneDietForNewDraft,
  extractMacrosFromPreviousDiet,
} from '@/lib/dietDuplication';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { calculateKcalFromMacros } from '@/lib/nutrition/macroCalculations';
import { toast } from 'sonner';
import { useDietCalculations } from './useDietCalculations';
import { useDietBuilderModals } from './useDietBuilderModals';
import { useDietMealActions } from './useDietMealActions';
import { useDietPresets } from './useDietPresets';
import { useSaveShortcut } from './useSaveShortcut';

export function useDietBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = (params?.id as string) || 'pat-1';
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeVariationId, setActiveVariationId] = useState<string>('var-high');
  const [activeMealVariationIds, setActiveMealVariationIds] = useState<ActiveMealVariationIds>({});

  // Load Patient & Diet Plan
  useEffect(() => {
    const p = getPatientById(patientId);
    setPatient(p);
  }, [patientId]);

  const { dietPlan, setDietPlan } = useDietPresets({
    patientId,
    dietaId,
    patient,
    setActiveVariationId,
    setActiveMealVariationIds,
  });

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

  const handleModeChange = useCallback((newMode: 'simple' | 'carb_cycling') => {
    setDietPlan((prev) => (prev ? { ...prev, mode: newMode } : prev));
  }, [setDietPlan]);

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
        id: `var-custom-${Date.now()}`,
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

  const previousDiets = useMemo(() => {
    const stored = getPatientDietsFromStorage(patientId);
    return buildPreviousDietSummaries(stored, patient?.dietHistory || [], dietaId);
  }, [patientId, patient?.dietHistory, dietaId]);

  const hasPreviousDiets = previousDiets.length > 0;

  const handlePullMacrosOnly = useCallback(
    (selectedDiet: PreviousDietSummary) => {
      if (!selectedDiet) return;
      const { targetProtein, targetCarbs, targetFats, targetKcal } = extractMacrosFromPreviousDiet(selectedDiet);

      setDietPlan((prev) => {
        if (!prev) return prev;
        if (prev.mode === 'simple') {
          return {
            ...prev,
            simpleTargetProtein: targetProtein,
            simpleTargetCarbs: targetCarbs,
            simpleTargetFats: targetFats,
            simpleTargetKcal: targetKcal,
          };
        } else {
          return {
            ...prev,
            carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
              v.id === activeVariationId
                ? {
                    ...v,
                    targetProtein,
                    targetCarbs,
                    targetFats,
                    targetKcal,
                    gPerKg:
                      patient?.weightKg && patient.weightKg > 0
                        ? {
                            protein: Number((targetProtein / patient.weightKg).toFixed(1)),
                            carbs: Number((targetCarbs / patient.weightKg).toFixed(1)),
                            fats: Number((targetFats / patient.weightKg).toFixed(1)),
                          }
                        : v.gPerKg,
                  }
                : v
            ),
          };
        }
      });

      toast.success(
        `Metas importadas da dieta "${selectedDiet.name}" (${targetProtein}g P, ${targetCarbs}g C, ${targetFats}g G)!`
      );
    },
    [activeVariationId, patient?.weightKg, setDietPlan]
  );

  const handlePullAllMeals = useCallback(
    (selectedDiet: PreviousDietSummary) => {
      if (!selectedDiet) return;
      const cloned = cloneDietForNewDraft(selectedDiet, patientId, dietaId);

      setDietPlan(cloned);
      if (cloned.carbCyclingVariations && cloned.carbCyclingVariations.length > 0) {
        setActiveVariationId(cloned.carbCyclingVariations[0].id);
      }

      const totalMeals =
        cloned.mode === 'simple'
          ? (cloned.simpleMeals || []).length
          : (cloned.carbCyclingVariations?.[0]?.meals || []).length;

      toast.success(
        `Dieta "${selectedDiet.name}" duplicada com sucesso (${totalMeals} ${
          totalMeals === 1 ? 'refeição' : 'refeições'
        })!`
      );
    },
    [patientId, dietaId, setDietPlan, setActiveVariationId]
  );

  const handlePullPreviousGoals = useCallback(() => {
    if (!hasPreviousDiets) {
      toast.info('Nenhuma dieta anterior encontrada para este paciente.');
      return;
    }
    modals.openImportPreviousDietModal();
  }, [hasPreviousDiets, modals]);

  const handleSaveDiet = useCallback(() => {
    if (!dietPlan) return;
    const isNew = dietaId === 'nova' || dietPlan.id === 'nova';
    const finalId = isNew
      ? `diet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      : dietPlan.id;

    const planToSave = {
      ...dietPlan,
      id: finalId,
      patientId,
    };
    saveDietToStorage(planToSave);

    if (isNew) {
      const stored = getPatientDietsFromStorage(patientId);
      const withoutNova = stored.filter((d) => d.id !== 'nova');
      if (withoutNova.length !== stored.length) {
        saveDietToStorage(planToSave);
      }
    }

    toast.success('Plano alimentar salvo com sucesso!');
    router.push(`/pacientes/${patientId}`);
  }, [dietPlan, patientId, dietaId, router]);

  useSaveShortcut({
    onSave: handleSaveDiet,
    priority: 0,
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
    router,
  };
}

