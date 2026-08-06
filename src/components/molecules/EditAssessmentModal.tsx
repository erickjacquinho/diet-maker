import React, { useEffect, useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BodyAssessment,
  Patient,
} from '@/lib/patientsStore';
import {
  calculateBodyComposition,
  normalizeBodyFatSex,
} from '@/lib/bodyFat';
import { MetricBox } from './MetricBox';

type NumericAssessmentField =
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

interface AssessmentFieldConfig {
  field: NumericAssessmentField;
  label: string;
  unit: 'kg' | 'cm';
}

const MEASUREMENT_FIELDS: AssessmentFieldConfig[] = [
  { field: 'neckCm', label: 'Pescoço', unit: 'cm' },
  { field: 'scapulaCm', label: 'Escápula', unit: 'cm' },
  { field: 'bustCm', label: 'Busto', unit: 'cm' },
  { field: 'leftArmCm', label: 'Braço esquerdo', unit: 'cm' },
  { field: 'rightArmCm', label: 'Braço direito', unit: 'cm' },
  { field: 'waistCm', label: 'Cintura', unit: 'cm' },
  { field: 'abdomenCm', label: 'Barriga', unit: 'cm' },
  { field: 'hipCm', label: 'Quadril', unit: 'cm' },
  { field: 'leftProximalThighCm', label: 'Coxa proximal esquerda', unit: 'cm' },
  { field: 'rightProximalThighCm', label: 'Coxa proximal direita', unit: 'cm' },
  { field: 'leftDistalThighCm', label: 'Coxa distal esquerda', unit: 'cm' },
  { field: 'rightDistalThighCm', label: 'Coxa distal direita', unit: 'cm' },
  { field: 'leftCalfCm', label: 'Panturrilha esquerda', unit: 'cm' },
  { field: 'rightCalfCm', label: 'Panturrilha direita', unit: 'cm' },
];

const DERIVED_FIELDS = [
  { field: 'bodyFatPercent', label: 'Body fat', unit: '%' },
  { field: 'fatMassKg', label: 'Massa gorda', unit: 'kg' },
  { field: 'muscleMassKg', label: 'Massa magra', unit: 'kg' },
] as const;

export interface EditAssessmentModalProps {
  open: boolean;
  patient: Pick<Patient, 'gender' | 'heightCm'> | null;
  assessment: BodyAssessment | null;
  mode?: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSave: (assessment: BodyAssessment) => void;
}

function formatInputValue(value: number | undefined): string | number {
  return value !== undefined && Number.isFinite(value) ? value : '';
}

export function EditAssessmentModal({
  open,
  patient,
  assessment,
  mode = 'edit',
  onOpenChange,
  onSave,
}: EditAssessmentModalProps) {
  const [draft, setDraft] = useState<BodyAssessment | null>(assessment);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(assessment ? { ...assessment } : null);
    setSubmitError(null);
  }, [assessment, open]);

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
    setDraft((current) => current
      ? {
          ...current,
          [field]: value === '' ? Number.NaN : Number(value),
        }
      : current);
    setSubmitError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft || !composition.isValid) {
      setSubmitError(composition.error ?? 'Preencha as medidas para calcular a composição corporal.');
      return;
    }

    onSave({
      ...draft,
      bodyFatPercent: composition.bodyFatPercent!,
      fatMassKg: composition.fatMassKg!,
      muscleMassKg: composition.leanMassKg!,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-3rem)] overflow-hidden">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2">
            <Scale size={18} className="text-success" aria-hidden="true" />
            <span>{mode === 'create' ? 'Nova Avaliação Física' : 'Editar Avaliação Física'}</span>
          </DialogTitle>
          <DialogDescription className="text-style-legal text-text-muted">
            Informe as medidas corporais em centímetros. O BF e a composição corporal serão calculados automaticamente.
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <form
            aria-label="Avaliação física"
            noValidate
            onSubmit={handleSubmit}
            className="min-h-0 flex flex-col"
          >
            <div className="min-h-0 flex flex-col gap-4 overflow-y-auto p-2 -m-2">
              <div className="grid gap-3">
                <div className="min-w-0">
                  <label htmlFor="assessment-weight" className="text-style-legal font-semibold text-text-muted block mb-1">
                    Peso atual (kg)
                  </label>
                  <Input
                    id="assessment-weight"
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={formatInputValue(draft.weightKg)}
                    onChange={(event) => updateNumericField('weightKg', event.target.value)}
                    className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MEASUREMENT_FIELDS.map(({ field, label, unit }) => (
                    <div key={field} className="min-w-0">
                      <label htmlFor={`assessment-${field}`} className="text-style-legal font-semibold text-text-muted block mb-1">
                        {label} ({unit})
                      </label>
                      <Input
                        id={`assessment-${field}`}
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={formatInputValue(draft[field])}
                        onChange={(event) => updateNumericField(field, event.target.value)}
                        className="bg-surface-subtle border-border-subtle text-style-legal font-bold text-text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                aria-label="Composição corporal calculada"
                className="grid grid-cols-3 gap-3"
              >
                {DERIVED_FIELDS.map(({ field, label, unit }) => {
                  const value = field === 'bodyFatPercent'
                    ? composition.bodyFatPercent
                    : field === 'fatMassKg'
                      ? composition.fatMassKg
                      : composition.leanMassKg;

                  return (
                    <MetricBox
                      key={field}
                      label={label}
                      value={value === null ? '—' : `${value} ${unit}`}
                      size="standard"
                      surface="boxed"
                      tone={field === 'bodyFatPercent' ? 'success' : 'default'}
                    />
                  );
                })}
              </div>

              {submitError && (
                <p role="alert" className="text-style-legal text-error bg-error-soft border border-error-border rounded-control p-3">
                  {submitError}
                </p>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="secondary"
                size="compact"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="compact">
                Salvar avaliação
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
