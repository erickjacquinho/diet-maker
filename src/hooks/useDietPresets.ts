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
  setActiveVariationId: React.Dispatch<React.SetStateAction<string>>;
}

export function useDietPresets({
  patientId,
  dietaId,
  patient,
  setActiveVariationId,
}: UseDietPresetsOptions) {
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);

  // Initial load
  useEffect(() => {
    if (!patient) return;

    const fromCycleConfig = typeof window !== 'undefined' && window.sessionStorage?.getItem('nutridiet_cycle_configured') === 'true';
    if (fromCycleConfig && typeof window !== 'undefined') {
      window.sessionStorage.removeItem('nutridiet_cycle_configured');
    }

    const saved = getDietFromStorage(patientId, dietaId);
    if (saved && (dietaId !== 'nova' || fromCycleConfig)) {
      const normalizedSaved = {
        ...saved,
        mode: saved.mode || 'simple',
      };
      setDietPlan(normalizedSaved);
      if (saved.carbCyclingVariations && saved.carbCyclingVariations.length > 0) {
        setActiveVariationId((prev) => {
          const exists = saved.carbCyclingVariations.some((v) => v.id === prev);
          return exists ? prev : (saved.carbCyclingVariations[0]?.id ?? 'var-high');
        });
      }
      return;
    }

    // Para criação de nova dieta (/dieta/nova), cria SEMPRE plano novo limpo com alvos ZERADOS e modo 'simple'
    const initialPlan = createInitialDietPlan(patientId, {
      weightKg: patient.weightKg,
      targetKcal: 0,
      targetProtein: 0,
      targetCarbs: 0,
      targetFats: 0,
    });

    initialPlan.id = 'nova';
    initialPlan.mode = 'simple';

    setDietPlan(initialPlan);
  }, [dietaId, patient, patientId, setActiveVariationId]);

  // Sync only on explicit storage/sync events from other sources/modals when data exists
  useEffect(() => {
    const handleSync = (event?: Event) => {
      if (event && 'detail' in event) {
        const detail = (event as CustomEvent).detail;
        if (detail && (detail.patientId !== patientId || detail.dietId !== dietaId)) {
          return;
        }
      }

      const saved = getDietFromStorage(patientId, dietaId);
      if (saved) {
        setDietPlan(saved);
        if (saved.carbCyclingVariations && saved.carbCyclingVariations.length > 0) {
          setActiveVariationId((prev) => {
            const exists = saved.carbCyclingVariations.some((v) => v.id === prev);
            return exists ? prev : (saved.carbCyclingVariations[0]?.id ?? 'var-high');
          });
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('nutridiet-diet-sync', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('nutridiet-diet-sync', handleSync);
    };
  }, [dietaId, patientId, setActiveVariationId]);

  return { dietPlan, setDietPlan };
}
