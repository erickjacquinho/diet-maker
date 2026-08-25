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
import { useSaveShortcut } from './useSaveShortcut';
import type { NumericAssessmentField } from './useAssessmentForm';

export interface AssessmentDeltas {
  weightDiff: number | null;
  bodyFatDiff: number | null;
  leanMassDiff: number | null;
  fatMassDiff: number | null;
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
            : 'Preencha as medidas para calcular a composição corporal.',
      };
    }

    // Se neckCm não foi medido nesta consulta, herda da anterior ou usa padrão
    const effectiveNeck =
      draft.neckCm && !Number.isNaN(draft.neckCm) && draft.neckCm > 0
        ? draft.neckCm
        : previousAssessment?.neckCm && Number.isFinite(previousAssessment.neckCm) && previousAssessment.neckCm > 0
        ? previousAssessment.neckCm
        : bodyFatSex === 'female'
        ? 34
        : 38;

    return calculateBodyComposition({
      sex: bodyFatSex,
      heightCm: patient.heightCm,
      neckCm: effectiveNeck,
      waistCm: draft.waistCm,
      abdomenCm: draft.abdomenCm ?? Number.NaN,
      hipCm: draft.hipCm ?? Number.NaN,
      weightKg: draft.weightKg,
    });
  }, [bodyFatSex, draft, patient, previousAssessment]);

  // Fat-Free Mass Index (FFMI) para ciência esportiva / hipertrofia real
  const ffmi = useMemo(() => {
    if (!composition.leanMassKg || !patient?.heightCm || patient.heightCm <= 0) return null;
    const heightM = patient.heightCm / 100;
    return Number((composition.leanMassKg / (heightM * heightM)).toFixed(1));
  }, [composition.leanMassKg, patient?.heightCm]);

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
        fatMassDiff: null,
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

    const currentFat = composition.fatMassKg;
    const prevFat = previousAssessment.fatMassKg;
    const fatMassDiff =
      currentFat !== null && prevFat !== undefined && Number.isFinite(prevFat)
        ? Number((currentFat - prevFat).toFixed(1))
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
      fatMassDiff,
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

    // 1. Validação dos 7 Campos Obrigatórios:
    // peso, escapula, torax, cintura, barriga (abdomen), quadril, coxa proximal
    const missingRequired: string[] = [];
    if (!draft.weightKg || Number.isNaN(draft.weightKg) || draft.weightKg <= 0) missingRequired.push('Peso');
    if (!draft.scapulaCm || Number.isNaN(draft.scapulaCm) || draft.scapulaCm <= 0) missingRequired.push('Escápula');
    if (!draft.bustCm || Number.isNaN(draft.bustCm) || draft.bustCm <= 0) missingRequired.push('Tórax');
    if (!draft.waistCm || Number.isNaN(draft.waistCm) || draft.waistCm <= 0) missingRequired.push('Cintura');
    if (!draft.abdomenCm || Number.isNaN(draft.abdomenCm) || draft.abdomenCm <= 0) missingRequired.push('Barriga / Abdômen');
    if (!draft.hipCm || Number.isNaN(draft.hipCm) || draft.hipCm <= 0) missingRequired.push('Quadril');

    const hasThigh =
      (draft.leftProximalThighCm !== undefined && !Number.isNaN(draft.leftProximalThighCm) && draft.leftProximalThighCm > 0) ||
      (draft.rightProximalThighCm !== undefined && !Number.isNaN(draft.rightProximalThighCm) && draft.rightProximalThighCm > 0);

    if (!hasThigh) missingRequired.push('Coxa Proximal');

    if (missingRequired.length > 0) {
      const errorMsg = `Preencha os campos obrigatórios: ${missingRequired.join(', ')}.`;
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // 2. Preenchimento Automático dos Campos Opcionais com base na última avaliação
    const autoFilledFields: string[] = [];
    const completedDraft: BodyAssessment = { ...draft };

    const optionalFields: Array<keyof BodyAssessment> = [
      'neckCm',
      'leftArmCm',
      'rightArmCm',
      'leftDistalThighCm',
      'rightDistalThighCm',
      'leftCalfCm',
      'rightCalfCm',
    ];

    if (previousAssessment) {
      for (const field of optionalFields) {
        const curVal = completedDraft[field];
        const isCurEmpty = curVal === undefined || Number.isNaN(curVal) || curVal === null || curVal === 0;
        const prevVal = previousAssessment[field];
        const hasPrev = prevVal !== undefined && Number.isFinite(prevVal) && Number(prevVal) > 0;

        if (isCurEmpty && hasPrev) {
          (completedDraft[field] as number) = Number(prevVal);
          autoFilledFields.push(field as string);
        }
      }
    }

    if (autoFilledFields.length > 0) {
      completedDraft.autoFilledFields = autoFilledFields;
    }

    // 3. Validação da Composição Corporal final
    const sex = normalizeBodyFatSex(patient.gender);
    const effectiveNeck =
      completedDraft.neckCm && !Number.isNaN(completedDraft.neckCm) && completedDraft.neckCm > 0
        ? completedDraft.neckCm
        : previousAssessment?.neckCm && Number.isFinite(previousAssessment.neckCm) && previousAssessment.neckCm > 0
        ? previousAssessment.neckCm
        : sex === 'female'
        ? 34
        : 38;

    const finalComposition = sex
      ? calculateBodyComposition({
          sex,
          heightCm: patient.heightCm,
          neckCm: effectiveNeck,
          waistCm: completedDraft.waistCm,
          abdomenCm: completedDraft.abdomenCm ?? Number.NaN,
          hipCm: completedDraft.hipCm ?? Number.NaN,
          weightKg: completedDraft.weightKg,
        })
      : composition;

    if (!finalComposition.isValid) {
      const errorMsg =
        finalComposition.error ?? 'As medidas informadas não permitem calcular a composição corporal.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSaving(true);
    const normalizedDraft = normalizePairedBodyMeasurements(completedDraft);

    const savedRecord: BodyAssessment = {
      ...normalizedDraft,
      bodyFatPercent: finalComposition.bodyFatPercent!,
      fatMassKg: finalComposition.fatMassKg!,
      muscleMassKg: finalComposition.leanMassKg!,
    };

    savePatientAssessmentToStorage(patient.id, savedRecord);
    setIsDirty(false);
    toast.success(
      isNew
        ? autoFilledFields.length > 0
          ? `Avaliação física criada! (${autoFilledFields.length} medidas opcionais replicadas da anterior)`
          : 'Avaliação física criada com sucesso!'
        : 'Avaliação física salva com sucesso!'
    );
    router.push(`/pacientes/${patient.id}`);
  }, [draft, patient, composition, previousAssessment, isNew, router]);

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

    const lmDiff = deltas.leanMassDiff ? ` (${deltas.leanMassDiff > 0 ? '+' : ''}${deltas.leanMassDiff} kg)` : '';
    const fmDiff = deltas.fatMassDiff ? ` (${deltas.fatMassDiff > 0 ? '+' : ''}${deltas.fatMassDiff} kg)` : '';
    const bfDiff = deltas.bodyFatDiff ? ` (${deltas.bodyFatDiff > 0 ? '+' : ''}${deltas.bodyFatDiff}%)` : '';
    const wDiff = deltas.weightDiff ? ` (${deltas.weightDiff > 0 ? '+' : ''}${deltas.weightDiff} kg)` : '';

    const summaryText = [
      `⚡ *Composição Corporal & Performance — ${patient.name}* (${draft.date})`,
      `• Body Fat (BF): ${composition.bodyFatPercent}%${bfDiff}`,
      `• Massa Magra (FFM): ${composition.leanMassKg} kg${lmDiff}`,
      `• Massa Gorda (FM): ${composition.fatMassKg} kg${fmDiff}`,
      ffmi ? `• FFMI (Índice Muscular): ${ffmi} kg/m²` : null,
      `• Cintura: ${draft.waistCm} cm`,
      `• Peso Total: ${draft.weightKg} kg${wDiff}`,
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
  }, [draft, patient, composition, deltas, ffmi]);

  // Global Ctrl+S / Cmd+S shortcut
  useSaveShortcut({
    onSave: handleSave,
    priority: 0,
  });

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
    ffmi,
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
