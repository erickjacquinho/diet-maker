import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  DietMeal,
  saveDietToStorage,
} from '@/lib/dietStore';
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
    [activeVariationId]
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
  }, []);

  const handleVariationsCountChange = useCallback((newCount: 2 | 3) => {
    setDietPlan((prev) => (prev ? { ...prev, carbCyclingVariationsCount: newCount } : prev));
    if (newCount === 2 && activeVariationId === 'var-med') {
      setActiveVariationId('var-high');
    }
  }, [activeVariationId]);

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
    handleSaveDiet,
    router,
  };
}
