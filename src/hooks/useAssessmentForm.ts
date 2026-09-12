import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizePairedMeasurements } from '@/lib/domain/clinical';
import type { BodyAssessment, Patient as LegacyPatient } from '@/lib/application/patients/clinical-ui-adapter';
import {
  calculateBodyComposition,
  normalizeBodyFatSex,
} from '@/lib/bodyFat';

export type NumericAssessmentField =
  | 'weightKg'
  | 'neckCm'
  | 'scapulaCm'
  | 'bustCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'waistCm'
  | 'abdomenCm'
  | 'hipCm'
  | 'leftProximalThighCm'
  | 'rightProximalThighCm'
  | 'leftDistalThighCm'
  | 'rightDistalThighCm'
  | 'leftCalfCm'
  | 'rightCalfCm';

export function useAssessmentForm({
  assessment,
  patient,
  onSave,
  onOpenChange,
}: {
  assessment: BodyAssessment | null;
  patient: Pick<LegacyPatient, 'gender' | 'heightCm'> | null;
  onSave: (assessment: BodyAssessment) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<BodyAssessment | null>(assessment);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    setDraft(assessment ? { ...assessment } : null);
    setSubmitError(null);
  }, [assessment]);

  const bodyFatSex = useMemo(
    () => (patient ? normalizeBodyFatSex(patient.gender) : null),
    [patient],
  );

  const composition = useMemo(() => {
    if (!draft || !patient || !bodyFatSex) {
      return {
        bodyFatPercent: null,
        fatMassKg: null,
        leanMassKg: null,
        isValid: false,
        error: bodyFatSex === null
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

  const updateNumericField = (field: NumericAssessmentField, value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value === '' ? Number.NaN : Number(value),
          }
        : current,
    );
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;

    if (!draft || !composition.isValid) {
      setSubmitError(
        composition.error ?? 'Preencha as medidas para calcular a composição corporal.',
      );
      return;
    }

    const normalizedDraft = normalizePairedMeasurements(draft);

    savingRef.current = true;
    setIsSaving(true);
    try {
      await onSave({
        ...normalizedDraft,
        bodyFatPercent: composition.bodyFatPercent!,
        fatMassKg: composition.fatMassKg!,
        muscleMassKg: composition.leanMassKg!,
      });
      onOpenChange(false);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar a avaliação.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return {
    draft,
    composition,
    submitError,
    isSaving,
    updateNumericField,
    handleSubmit,
  };
}
