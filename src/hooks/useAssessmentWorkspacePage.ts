import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { toPatientViewModel } from '@/lib/patientViewModel';
import { getBrowserPatientApplication } from '@/lib/application/browser-composition';
import { ClinicalApplicationError, getAssessmentType, type AssessmentType } from '@/lib/domain/clinical';
import { toAssessmentInput, toLegacyAssessment, type BodyAssessment } from '@/lib/application/patients/clinical-ui-adapter';
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
  const [patient, setPatient] = useState<PatientViewModel | null>(null);
  const [draft, setDraft] = useState<BodyAssessment | null>(null);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('complete');
  const [previousAssessment, setPreviousAssessment] = useState<BodyAssessment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLeaveConfirmationOpen, setIsLeaveConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const savingRef = useRef(false);

  const isNew = assessmentId === 'nova';

  useEffect(() => {
    let cancelled = false;
    if (!patientId) return undefined;
    setIsLoading(true);
    setSubmitError(null);
    void getBrowserPatientApplication().then(async (application) => {
      const profile = await application.getPatientProfile(patientId);
      const canonicalAssessments = await application.listAssessments(patientId);
      const assessments = canonicalAssessments.map(toLegacyAssessment);
      const sorted = [...assessments].sort((left, right) => (right.clinicalDate ?? right.date).localeCompare(left.clinicalDate ?? left.date) || left.id.localeCompare(right.id));
      if (cancelled) return;
      const patientView = toPatientViewModel(profile.patient, { initials: profile.initials });
      setPatient(patientView);

      if (isNew) {
        setPreviousAssessment(sorted[0] ?? null);
        setAssessmentType('complete');
        setDraft({
          id: `draft-${patientId}`,
          patientId,
          date: new Date().toLocaleDateString('pt-BR'),
          assessmentType: 'complete',
          heightCm: patientView.heightCm > 0 ? patientView.heightCm : Number.NaN,
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
      } else {
        const existing = assessments.find((item) => item.id === assessmentId) ?? null;
        if (!existing) throw new ClinicalApplicationError('CLINICAL_ASSESSMENT_NOT_FOUND', 'Avaliação não encontrada neste paciente.');
        setAssessmentType(getAssessmentType(existing));
        setDraft({ ...existing });
        setPreviousAssessment(sorted.find((item) => item.id !== existing.id && (item.clinicalDate ?? item.date) <= (existing.clinicalDate ?? existing.date)) ?? null);
      }
      setIsDirty(false);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setPatient(null);
      setDraft(null);
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível carregar a avaliação.');
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [patientId, assessmentId, isNew]);

  const bodyFatSex = useMemo(
    () => (patient ? normalizeBodyFatSex(patient.gender) : null),
    [patient]
  );

  const composition = useMemo(() => {
    if (assessmentType === 'simplified') {
      return {
        bodyFatPercent: null,
        fatMassKg: null,
        leanMassKg: null,
        isValid: false,
        error: 'A composição corporal está disponível na avaliação completa.',
      };
    }

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
      waistCm: draft.waistCm ?? Number.NaN,
      abdomenCm: draft.abdomenCm ?? Number.NaN,
      hipCm: draft.hipCm ?? Number.NaN,
      weightKg: draft.weightKg,
    });
  }, [assessmentType, bodyFatSex, draft, patient, previousAssessment]);

  // Fat-Free Mass Index (FFMI) para ciência esportiva / hipertrofia real
  const ffmi = useMemo(() => {
    const heightCm = assessmentType === 'simplified' ? draft?.heightCm : patient?.heightCm;
    if (!composition.leanMassKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Number((composition.leanMassKg / (heightM * heightM)).toFixed(1));
  }, [assessmentType, composition.leanMassKg, draft?.heightCm, patient?.heightCm]);

  const bmi = useMemo(() => {
    const heightCm = assessmentType === 'simplified' ? draft?.heightCm : patient?.heightCm;
    if (!draft?.weightKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Number((draft.weightKg / (heightM * heightM)).toFixed(1));
  }, [assessmentType, draft?.heightCm, draft?.weightKg, patient?.heightCm]);

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
      currentBF !== null && typeof prevBF === 'number' && Number.isFinite(prevBF)
        ? Number((currentBF - prevBF).toFixed(2))
        : null;

    const currentLean = composition.leanMassKg;
    const prevLean = previousAssessment.muscleMassKg;
    const leanMassDiff =
      currentLean !== null && typeof prevLean === 'number' && Number.isFinite(prevLean)
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
      typeof currentWaist === 'number' && Number.isFinite(currentWaist) && typeof prevWaist === 'number' && Number.isFinite(prevWaist)
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

  const updateAssessmentType = useCallback((type: AssessmentType) => {
    setAssessmentType(type);
    setDraft((current) => (current ? { ...current, assessmentType: type } : current));
    setSubmitError(null);
    setIsDirty(true);
  }, []);

  const updateDateField = useCallback((date: string) => {
    setDraft((current) => (current ? { ...current, date } : current));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!draft || !patient) return;
    if (savingRef.current) return;

    const missingRequired: string[] = [];
    if (assessmentType === 'simplified') {
      if (!Number.isFinite(draft.weightKg) || draft.weightKg <= 0) missingRequired.push('Peso');
      if (typeof draft.heightCm !== 'number' || !Number.isFinite(draft.heightCm) || draft.heightCm <= 0) missingRequired.push('Altura');
    } else {
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
    }

    if (missingRequired.length > 0) {
      const errorMsg = `Preencha os campos obrigatórios: ${missingRequired.join(', ')}.`;
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    setSubmitError(null);
    try {
      const application = await getBrowserPatientApplication();
      const input = toAssessmentInput(draft);
      const saved = isNew
        ? await application.createAssessment(patient.id, input)
        : await application.updateAssessment(patient.id, draft.id, draft.version ?? 0, input);
      setDraft(toLegacyAssessment(saved));
      setIsDirty(false);
      toast.success(isNew ? 'Avaliação física criada com sucesso!' : 'Avaliação física salva com sucesso!');
      router.push(`/pacientes/${patient.id}`);
    } catch (error: unknown) {
      const message = error instanceof ClinicalApplicationError || error instanceof Error
        ? error.message
        : 'Não foi possível salvar a avaliação.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [assessmentType, draft, patient, composition, isNew, router, isSaving]);

  const navigateBack = useCallback(() => {
    if (patient) {
      router.push(`/pacientes/${patient.id}`);
    } else {
      router.push('/pacientes');
    }
  }, [patient, router]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setIsLeaveConfirmationOpen(true);
      return;
    }

    navigateBack();
  }, [isDirty, navigateBack]);

  const handleCancelLeaveConfirmation = useCallback(() => {
    setIsLeaveConfirmationOpen(false);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setIsLeaveConfirmationOpen(false);
    navigateBack();
  }, [navigateBack]);

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
    busy: isSaving,
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
    isLoading,
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
    isLeaveConfirmationOpen,
    submitError,
    assessmentType,
    updateNumericField,
    updateAssessmentType,
    updateDateField,
    handleSave,
    handleCancel,
    handleCancelLeaveConfirmation,
    handleConfirmLeave,
    handleCopySummary,
  };
}
