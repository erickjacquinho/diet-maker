import { useCallback, useEffect, useState } from 'react';
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
  const [openStatus, setOpenStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [openError, setOpenError] = useState<unknown>(null);
  const [openAttempt, setOpenAttempt] = useState(0);

  const retryOpenEditor = useCallback(() => setOpenAttempt((attempt) => attempt + 1), []);

  useEffect(() => {
    if (!patient || !dietApplication || !patientId || !dietaId) {
      setOpenStatus('idle');
      return;
    }
    let cancelled = false;
    setOpenStatus('loading');
    setOpenError(null);
    void dietApplication.openEditor(patientId, dietaId).then(({ draft: loadedDraft }) => {
      if (cancelled) return;
      setDraft(loadedDraft);
      setDietPlan(fromEditableDocument(loadedDraft.payload, patientId, dietaId === 'nova' ? 'nova' : dietaId, loadedDraft.createdAt, loadedDraft.updatedAt));
      setActiveMealVariationIds?.({});
      const firstVariation = loadedDraft.payload.variations[0];
      if (firstVariation) setActiveVariationId(firstVariation.id);
      setOpenStatus('ready');
    }).catch((error: unknown) => {
      if (!cancelled) {
        setDraft(null);
        setDietPlan(null);
        setOpenError(error);
        setOpenStatus('error');
      }
    });
    return () => { cancelled = true; };
  }, [dietaId, dietApplication, openAttempt, patient, patientId, setActiveMealVariationIds, setActiveVariationId]);

  return { dietPlan, setDietPlan, draft, setDraft, openStatus, openError, retryOpenEditor };
}
