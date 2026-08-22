import { useEffect, useState, useCallback } from 'react';
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

  const syncFromStorage = useCallback(() => {
    if (!patient) return;

    const saved = getDietFromStorage(patientId, dietaId);
    if (saved) {
      setDietPlan(saved);
      if (saved.carbCyclingVariations && saved.carbCyclingVariations.length > 0) {
        setActiveVariationId(saved.carbCyclingVariations[0]?.id ?? 'var-high');
      }
      return;
    }

    const initialPlan = createInitialDietPlan(patientId, {
      weightKg: patient.weightKg,
      targetKcal: patient.targetKcal,
      targetProtein: patient.targetProtein,
      targetCarbs: patient.targetCarbs,
      targetFats: patient.targetFats,
    });

    if (dietaId === 'nova') {
      initialPlan.id = 'nova';
    }

    setDietPlan(initialPlan);
  }, [dietaId, patient, patientId, setActiveVariationId]);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    const handleSync = () => {
      syncFromStorage();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('nutridiet-diet-sync', handleSync);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('nutridiet-diet-sync', handleSync);
    };
  }, [syncFromStorage]);

  return { dietPlan, setDietPlan };
}
