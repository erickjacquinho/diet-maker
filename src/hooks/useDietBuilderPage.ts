import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  DietMeal,
  saveDietToStorage,
  getPatientDietsFromStorage,
  CarbCyclingVariation,
} from '@/lib/dietStore';
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
  } = useDietCalculations(dietPlan, activeVariationId, patient);

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
  });

  // Meal Actions hook
  const mealActions = useDietMealActions({
    foodSearchMealIndex: modals.foodSearchMealIndex,
    updateActiveMeals,
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

  const handlePullPreviousGoals = useCallback(() => {
    if (!patient) return;

    // 1. Check patient's stored diets or dietHistory
    const storedDiets = getPatientDietsFromStorage(patientId);
    const previousDiets = storedDiets.filter((d) => d.id !== dietaId && d.id !== 'nova');

    let previousProt = 0;
    let previousCarb = 0;
    let previousFat = 0;
    let previousKcal = 0;

    if (previousDiets.length > 0) {
      const mostRecent = previousDiets[0];
      if (mostRecent.mode === 'simple') {
        previousProt = mostRecent.simpleTargetProtein || 0;
        previousCarb = mostRecent.simpleTargetCarbs || 0;
        previousFat = mostRecent.simpleTargetFats || 0;
        previousKcal = mostRecent.simpleTargetKcal || calculateKcalFromMacros(previousProt, previousCarb, previousFat);
      } else if (mostRecent.carbCyclingVariations && mostRecent.carbCyclingVariations.length > 0) {
        const firstVar = mostRecent.carbCyclingVariations[0];
        previousProt = firstVar.targetProtein || 0;
        previousCarb = firstVar.targetCarbs || 0;
        previousFat = firstVar.targetFats || 0;
        previousKcal = firstVar.targetKcal || calculateKcalFromMacros(previousProt, previousCarb, previousFat);
      }
    }

    if ((!previousProt && !previousCarb && !previousFat) && patient.dietHistory && patient.dietHistory.length > 0) {
      const mostRecentHistorical = patient.dietHistory[0];
      previousProt = mostRecentHistorical.proteinG || 0;
      previousCarb = mostRecentHistorical.carbsG || 0;
      previousFat = mostRecentHistorical.fatsG || 0;
      previousKcal = mostRecentHistorical.targetKcal || calculateKcalFromMacros(previousProt, previousCarb, previousFat);
    }

    if (!previousProt && !previousCarb && !previousFat && (patient.targetProtein || patient.targetCarbs || patient.targetFats)) {
      previousProt = patient.targetProtein || 0;
      previousCarb = patient.targetCarbs || 0;
      previousFat = patient.targetFats || 0;
      previousKcal = patient.targetKcal || calculateKcalFromMacros(previousProt, previousCarb, previousFat);
    }

    if (!previousProt && !previousCarb && !previousFat) {
      toast.info('Nenhuma meta de dieta anterior encontrada para este paciente.');
      return;
    }

    setDietPlan((prev) => {
      if (!prev) return prev;
      if (prev.mode === 'simple') {
        return {
          ...prev,
          simpleTargetProtein: previousProt,
          simpleTargetCarbs: previousCarb,
          simpleTargetFats: previousFat,
          simpleTargetKcal: previousKcal,
        };
      } else {
        return {
          ...prev,
          carbCyclingVariations: prev.carbCyclingVariations.map((v) =>
            v.id === activeVariationId
              ? {
                  ...v,
                  targetProtein: previousProt,
                  targetCarbs: previousCarb,
                  targetFats: previousFat,
                  targetKcal: previousKcal,
                  gPerKg: patient.weightKg && patient.weightKg > 0 ? {
                    protein: Number((previousProt / patient.weightKg).toFixed(1)),
                    carbs: Number((previousCarb / patient.weightKg).toFixed(1)),
                    fats: Number((previousFat / patient.weightKg).toFixed(1)),
                  } : v.gPerKg,
                }
              : v
          ),
        };
      }
    });

    toast.success(`Metas importadas da dieta anterior (${previousProt}g P, ${previousCarb}g C, ${previousFat}g G)!`);
  }, [patient, patientId, dietaId, activeVariationId, setDietPlan]);

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
    ...modals,
    ...mealActions,
    currentMeals,
    targetKcal,
    targetProt,
    targetCarb,
    targetFat,
    currentTotals,
    macroMetrics,
    handleModeChange,
    handleVariationsCountChange,
    handleAddVariation,
    handleRemoveVariation,
    handleReorderVariations,
    handlePullPreviousGoals,
    handleSaveDiet,
    router,
  };
}
