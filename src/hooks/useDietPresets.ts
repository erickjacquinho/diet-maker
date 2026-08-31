import { useEffect, useState } from 'react';
import { Patient } from '@/lib/patientsStore';
import type { FullDietPlan } from '@/lib/legacy-diet-types';
import type { DietApplication } from '@/lib/application/diets/diet-ports';
import { fromEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import type { DietDraft } from '@/lib/domain/diets/diet-model';

interface UseDietPresetsOptions {
  patientId: string;
  dietaId: string;
  patient: Patient | null;
  dietApplication: DietApplication | null;
  setActiveVariationId: React.Dispatch<React.SetStateAction<string>>;
  setActiveMealVariationIds?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function useDietPresets({
  patientId,
  dietaId,
  patient,
  setActiveVariationId,
  setActiveMealVariationIds,
  dietApplication,
}: UseDietPresetsOptions) {
  const [dietPlan, setDietPlan] = useState<FullDietPlan | null>(null);
  const [draft, setDraft] = useState<DietDraft | null>(null);

  useEffect(() => {
    if (!patient || !dietApplication || !patientId || !dietaId) return;
    let cancelled = false;
    void dietApplication.openEditor(patientId, dietaId).then(({ draft: loadedDraft }) => {
      if (cancelled) return;
      setDraft(loadedDraft);
      setDietPlan(fromEditableDocument(loadedDraft.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, loadedDraft.createdAt, loadedDraft.updatedAt));
      setActiveMealVariationIds?.({});
      const firstVariation = loadedDraft.payload.variations[0];
      if (firstVariation) setActiveVariationId(firstVariation.id);
    }).catch(() => {
      if (!cancelled) {
        setDraft(null);
        setDietPlan(null);
      }
    });
    return () => { cancelled = true; };
  }, [dietaId, dietApplication, patient, patientId, setActiveMealVariationIds, setActiveVariationId]);

  return { dietPlan, setDietPlan, draft, setDraft };
}
