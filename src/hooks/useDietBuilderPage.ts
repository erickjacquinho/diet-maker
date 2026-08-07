import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPatientById, Patient } from '@/lib/patientsStore';
import {
  FullDietPlan,
  DietMeal,
  getDietFromStorage,
  saveDietToStorage,
  createInitialDietPlan,
} from '@/lib/dietStore';
import { toast } from 'sonner';
import { useDietCalculations } from './useDietCalculations';
import { useDietBuilderModals } from './useDietBuilderModals';
import { useDietMealActions } from './useDietMealActions';

export function useDietBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const patientId = (params?.id as string) || 'pat-1';
  const dietaId = (params?.dietaId as string) || 'nova';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);
  const [activeVariationId, setActiveVariationId] = useState<string>('var-high');

  // Load Patient & Diet Plan
  useEffect(() => {
    let p = getPatientById(patientId);
    if (!p) {
      p = {
        id: patientId,
        name: 'Paciente Sem Nome',
        age: 30,
        gender: 'Não Informado',
        heightCm: 170,
        weightKg: 70,
        initials: 'P',
        objective: 'Acompanhamento Nutricional',
        targetKcal: 2000,
        targetProtein: 140,
        targetCarbs: 220,
        targetFats: 60,
        lastConsultation: new Date().toLocaleDateString('pt-BR'),
      };
    }
    setPatient(p);

    if (dietaId !== 'nova') {
      const saved = getDietFromStorage(patientId, dietaId);
      if (saved) {
        setDietPlan(saved);
        if (saved.carbCyclingVariations && saved.carbCyclingVariations.length > 0) {
          setActiveVariationId(saved.carbCyclingVariations[0].id);
        }
        return;
      }
    }

    const initial = createInitialDietPlan(patientId, {
      weightKg: p.weightKg,
      targetKcal: p.targetKcal,
      targetProtein: p.targetProtein,
      targetCarbs: p.targetCarbs,
      targetFats: p.targetFats,
    });
    setDietPlan(initial);
  }, [patientId, dietaId]);

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
    handleSaveDiet,
    router,
  };
}
