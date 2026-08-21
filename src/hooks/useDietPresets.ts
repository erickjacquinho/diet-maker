import { useEffect, useState } from 'react';
import { Patient } from '@/lib/patientsStore';
import {
  createInitialDietPlan,
  FullDietPlan,
  getDietFromStorage,
} from '@/lib/dietStore';

interface UseDietPresetsOptions {
  patientId: string;
  dietaId: string;
  patient: Patient | null;
  setActiveVariationId: (id: string) => void;
}

export function useDietPresets({
  patientId,
  dietaId,
  patient,
  setActiveVariationId,
}: UseDietPresetsOptions) {
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);

  useEffect(() => {
    if (!patient) return;

    if (dietaId !== 'nova') {
      const saved = getDietFromStorage(patientId, dietaId);
      if (saved) {
        setDietPlan(saved);
        setActiveVariationId(saved.carbCyclingVariations[0]?.id ?? 'var-high');
        return;
      }
    }

    setDietPlan(createInitialDietPlan(patientId, {
      weightKg: patient.weightKg,
      targetKcal: patient.targetKcal,
      targetProtein: patient.targetProtein,
      targetCarbs: patient.targetCarbs,
      targetFats: patient.targetFats,
    }));
  }, [dietaId, patient, patientId, setActiveVariationId]);

  return { dietPlan, setDietPlan };
}
