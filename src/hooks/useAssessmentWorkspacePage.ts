import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getPatientById,
  getPatientAssessmentsFromStorage,
  savePatientAssessmentToStorage,
  normalizePairedBodyMeasurements,
  Patient,
  BodyAssessment,
} from '@/lib/patientsStore';
import { calculateBodyComposition, normalizeBodyFatSex } from '@/lib/bodyFat';
import type { NumericAssessmentField } from './useAssessmentForm';

export interface AssessmentDeltas {
  weightDiff: number | null;
  bodyFatDiff: number | null;
  leanMassDiff: number | null;
  waistDiff: number | null;
  hasPrevious: boolean;
}

export function useAssessmentWorkspacePage(patientId: string, assessmentId: string) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [draft, setDraft] = useState<BodyAssessment | null>(null);
  const [previousAssessment, setPreviousAssessment] = useState<BodyAssessment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isNew = assessmentId === 'nova';

  useEffect(() => {
    if (!patientId) return;

    const foundPatient = getPatientById(patientId);
    setPatient(foundPatient);

    const assessments = getPatientAssessmentsFromStorage(patientId);
    const sorted = [...assessments].sort((a, b) => b.date.localeCompare(a.date));

    if (isNew) {
      const latest = sorted[0] ?? null;
      setPreviousAssessment(latest);

      const todayStr = new Date().toLocaleDateString('pt-BR');
      setDraft({
        id: `asm-${Date.now()}`,
        date: todayStr,
        weightKg: Number.NaN,
        bodyFatPercent: Number.NaN,
        muscleMassKg: Number.NaN,
        fatMassKg: Number.NaN,
        waistCm: Number.NaN,
        neckCm: Number.NaN,
        scapulaCm: Number.NaN,
        bustCm: Number.NaN,
        leftArmCm: Number.NaN,
        rightArmCm: Number.NaN,
        abdomenCm: Number.NaN,
        hipCm: Number.NaN,
        leftProximalThighCm: Number.NaN,
        rightProximalThighCm: Number.NaN,
        leftDistalThighCm: Number.NaN,
        rightDistalThighCm: Number.NaN,
        leftCalfCm: Number.NaN,
        rightCalfCm: Number.NaN,
      });
      setIsDirty(false);
    } else {
      const existing = assessments.find((item) => item.id === assessmentId) ?? null;
      setDraft(existing ? { ...existing } : null);
      setIsDirty(false);

      if (existing) {
        const olderAssessments = sorted.filter(
          (item) => item.id !== existing.id && item.date <= existing.date
        );
        setPreviousAssessment(olderAssessments[0] ?? null);
      }
    }
  }, [patientId, assessmentId, isNew]);

  const bodyFatSex = useMemo(
    () => (patient ? normalizeBodyFatSex(patient.gender) : null),
    [patient]
  );

  const composition = useMemo(() => {
    if (!draft || !patient || !bodyFatSex) {
      return {
        bodyFatPercent: null,
        fatMassKg: null,
        leanMassKg: null,
        isValid: false,
        error:
          bodyFatSex === null
            ? 'O gênero do paciente deve ser Masculino ou Feminino.'
            : 'As medidas informadas não permitem calcular o percentual de gordura.',
      };
    }

    return calculateBodyComposition({
      sex: bodyFatSex,
      heightCm: patient.heightCm,
      neckCm: draft.neckCm ?? Number.NaN,
      waistCm: draft.waistCm,
      abdomenCm: draft.abdomenCm ?? Number.NaN,
      hipCm: draft.hipCm ?? Number.NaN,
      weightKg: draft.weightKg,
    });
  }, [bodyFatSex, draft, patient]);

  const bmi = useMemo(() => {
    if (!draft?.weightKg || !patient?.heightCm || patient.heightCm <= 0) return null;
    const heightM = patient.heightCm / 100;
    return Number((draft.weightKg / (heightM * heightM)).toFixed(1));
  }, [draft?.weightKg, patient?.heightCm]);

  const waistToHipRatio = useMemo(() => {
    if (!draft?.waistCm || !draft?.hipCm || draft.hipCm <= 0) return null;
    return Number((draft.waistCm / draft.hipCm).toFixed(2));
  }, [draft?.waistCm, draft?.hipCm]);

  const deltas: AssessmentDeltas = useMemo(() => {
    if (!draft || !previousAssessment) {
      return {
        weightDiff: null,
        bodyFatDiff: null,
        leanMassDiff: null,
        waistDiff: null,
        hasPrevious: false,
      };
    }

    const currentWeight = draft.weightKg;
    const prevWeight = previousAssessment.weightKg;
    const weightDiff =
      Number.isFinite(currentWeight) && Number.isFinite(prevWeight)
        ? Number((currentWeight - prevWeight).toFixed(1))
        : null;

    const currentBF = composition.bodyFatPercent;
    const prevBF = previousAssessment.bodyFatPercent;
    const bodyFatDiff =
      currentBF !== null && Number.isFinite(prevBF)
        ? Number((currentBF - prevBF).toFixed(2))
        : null;

    const currentLean = composition.leanMassKg;
    const prevLean = previousAssessment.muscleMassKg;
    const leanMassDiff =
      currentLean !== null && Number.isFinite(prevLean)
        ? Number((currentLean - prevLean).toFixed(1))
        : null;

    const currentWaist = draft.waistCm;
    const prevWaist = previousAssessment.waistCm;
    const waistDiff =
      Number.isFinite(currentWaist) && Number.isFinite(prevWaist)
        ? Number((currentWaist - prevWaist).toFixed(1))
        : null;

    return {
      weightDiff,
      bodyFatDiff,
      leanMassDiff,
      waistDiff,
      hasPrevious: true,
    };
  }, [draft, previousAssessment, composition]);

  const updateNumericField = useCallback((field: NumericAssessmentField, value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value === '' ? Number.NaN : Number(value),
          }
        : current
    );
    setSubmitError(null);
    setIsDirty(true);
  }, []);

  const updateDateField = useCallback((date: string) => {
    setDraft((current) => (current ? { ...current, date } : current));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!draft || !patient) return;

    if (!composition.isValid) {
      const errorMsg =
        composition.error ?? 'Preencha as medidas necessárias para calcular a composição corporal.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSaving(true);
    const normalizedDraft = normalizePairedBodyMeasurements(draft);

    const savedRecord: BodyAssessment = {
      ...normalizedDraft,
      bodyFatPercent: composition.bodyFatPercent!,
      fatMassKg: composition.fatMassKg!,
      muscleMassKg: composition.leanMassKg!,
    };

    savePatientAssessmentToStorage(patient.id, savedRecord);
    setIsDirty(false);
    toast.success(isNew ? 'Avaliação física criada com sucesso!' : 'Avaliação física salva com sucesso!');
    router.push(`/pacientes/${patient.id}`);
  }, [draft, patient, composition, isNew, router]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Você possui alterações não salvas na avaliação. Deseja sair mesmo assim?'
      );
      if (!confirmLeave) return;
    }

    if (patient) {
      router.push(`/pacientes/${patient.id}`);
    } else {
      router.push('/pacientes');
    }
  }, [isDirty, patient, router]);

  const handleCopySummary = useCallback(() => {
    if (!draft || !patient || !composition.isValid) return;

    const wDiff = deltas.weightDiff ? ` (${deltas.weightDiff > 0 ? '+' : ''}${deltas.weightDiff} kg)` : '';
    const bfDiff = deltas.bodyFatDiff ? ` (${deltas.bodyFatDiff > 0 ? '+' : ''}${deltas.bodyFatDiff}%)` : '';

    const summaryText = [
      `📊 *Avaliação Física — ${patient.name}* (${draft.date})`,
      `• Peso: ${draft.weightKg} kg${wDiff}`,
      `• Gordura Corporal (BF): ${composition.bodyFatPercent}%${bfDiff}`,
      `• Massa Magra: ${composition.leanMassKg} kg`,
      `• Massa Gorda: ${composition.fatMassKg} kg`,
      `• Cintura: ${draft.waistCm} cm`,
      bmi ? `• IMC: ${bmi} kg/m²` : null,
      waistToHipRatio ? `• RCQ: ${waistToHipRatio}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(summaryText).then(() => {
        setIsCopied(true);
        toast.success('Resumo copiado para a área de transferência!');
        setTimeout(() => setIsCopied(false), 2500);
      });
    }
  }, [draft, patient, composition, deltas, bmi, waistToHipRatio]);

  // Global Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // BeforeUnload guard for browser tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    patient,
    draft,
    previousAssessment,
    composition,
    bmi,
    waistToHipRatio,
    deltas,
    isNew,
    isSaving,
    isDirty,
    isCopied,
    submitError,
    updateNumericField,
    updateDateField,
    handleSave,
    handleCancel,
    handleCopySummary,
  };
}
