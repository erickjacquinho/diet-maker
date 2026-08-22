import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  DietMeal,
  saveDietToStorage,
  CarbCyclingVariation,
} from '@/lib/dietStore';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { toast } from 'sonner';
import { useDietCalculations } from './useDietCalculations';
import { useDietBuilderModals } from './useDietBuilderModals';
import { useDietMealActions } from './useDietMealActions';
import { useDietPresets } from './useDietPresets';

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

  const handleSaveDiet = useCallback(() => {
    if (!dietPlan) return;
    saveDietToStorage(dietPlan);
    toast.success('Plano alimentar salvo com sucesso!');
    router.push(`/pacientes/${patientId}`);
  }, [dietPlan, patientId, router]);

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
    handleSaveDiet,
    router,
  };
}
