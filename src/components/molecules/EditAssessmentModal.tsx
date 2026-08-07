import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Scale } from 'lucide-react';
import { textStyle } from '@/design-system';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BodyAssessment,
  Patient,
  normalizePairedBodyMeasurements,
} from '@/lib/patientsStore';
import {
  calculateBodyComposition,
  normalizeBodyFatSex,
} from '@/lib/bodyFat';
import { Surface } from '@/components/atoms';
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

const TRUNK_FIELDS: AssessmentFieldConfig[] = [
  { field: 'neckCm', label: 'Pescoço', unit: 'cm' },
  { field: 'waistCm', label: 'Cintura', unit: 'cm' },
  { field: 'abdomenCm', label: 'Barriga', unit: 'cm' },
  { field: 'hipCm', label: 'Quadril', unit: 'cm' },
  { field: 'scapulaCm', label: 'Escápula', unit: 'cm' },
  { field: 'bustCm', label: 'Busto', unit: 'cm' },
];

const UPPER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftArmCm', label: 'Braço esquerdo', unit: 'cm' },
  { field: 'rightArmCm', label: 'Braço direito', unit: 'cm' },
];

const LOWER_LIMB_FIELDS: AssessmentFieldConfig[] = [
  { field: 'leftProximalThighCm', label: 'Coxa proximal esq.', unit: 'cm' },
  { field: 'rightProximalThighCm', label: 'Coxa proximal dir.', unit: 'cm' },
  { field: 'leftDistalThighCm', label: 'Coxa distal esq.', unit: 'cm' },
  { field: 'rightDistalThighCm', label: 'Coxa distal dir.', unit: 'cm' },
  { field: 'leftCalfCm', label: 'Panturrilha esq.', unit: 'cm' },
  { field: 'rightCalfCm', label: 'Panturrilha dir.', unit: 'cm' },
];

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

/**
 * Custom Hook for managing assessment form state & calculations.
 * Decouples state logic from visual components (vercel-composition-patterns / state-decouple-implementation).
 */
export function useAssessmentForm({
  assessment,
  patient,
  onSave,
  onOpenChange,
}: {
  assessment: BodyAssessment | null;
  patient: Pick<Patient, 'gender' | 'heightCm'> | null;
  onSave: (assessment: BodyAssessment) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState<BodyAssessment | null>(assessment);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft || !composition.isValid) {
      setSubmitError(
        composition.error ?? 'Preencha as medidas para calcular a composição corporal.',
      );
      return;
    }

    const normalizedDraft = normalizePairedBodyMeasurements(draft);

    onSave({
      ...normalizedDraft,
      bodyFatPercent: composition.bodyFatPercent!,
      fatMassKg: composition.fatMassKg!,
      muscleMassKg: composition.leanMassKg!,
    });
    onOpenChange(false);
  };

  return {
    draft,
    composition,
    submitError,
    updateNumericField,
    handleSubmit,
  };
}

/**
 * Reusable measurement field component.
 * Encapsulates DS Form Field markup and eliminates repetitive HTML.
 */
interface AssessmentMeasurementFieldProps {
  id: string;
  label: string;
  unit: string;
  value: number | undefined;
  onChange: (value: string) => void;
  className?: string;
}

function AssessmentMeasurementField({
  id,
  label,
  unit,
  value,
  onChange,
  className = 'min-w-0',
}: AssessmentMeasurementFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={textStyle('field-label')}>
        {label} ({unit})
      </label>
      <Input
        id={id}
        type="number"
        step="any"
        min="0"
        required
        value={formatInputValue(value)}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * Card wrapper for limb measurement groups.
 * Replaces hardcoded `/30` opacity modifiers with DS Surface components.
 */
interface LimbSectionCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function LimbSectionCard({ title, subtitle, children }: LimbSectionCardProps) {
  return (
    <Surface variant="subtle" className="flex flex-col gap-2.5 p-3 rounded-surface border border-border-subtle">
      <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
        <span className={textStyle('caption-strong')}>{title}</span>
        <span className={textStyle('helper')}>{subtitle}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">{children}</div>
    </Surface>
  );
}

/**
 * Main EditAssessmentModal Component.
 * Refactored using design system tokens and modular composition patterns.
 */
export function EditAssessmentModal({
  open,
  patient,
  assessment,
  mode = 'edit',
  onOpenChange,
  onSave,
}: EditAssessmentModalProps) {
  const { draft, composition, submitError, updateNumericField, handleSubmit } =
    useAssessmentForm({
      assessment,
      patient,
      onSave,
      onOpenChange,
    });

  const modalTitle = mode === 'create' ? 'Nova Avaliação Física' : 'Editar Avaliação Física';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col p-5 overflow-hidden gap-0">
        <DialogHeader className="shrink-0 pb-3 border-b border-border-subtle">
          <DialogTitle className={textStyle('dialog-title')}>
            <Scale className="size-4 text-success shrink-0 inline-block mr-2" aria-hidden="true" />
            <span>{modalTitle}</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Informe as medidas corporais. O BF e a composição corporal serão calculados automaticamente.
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <form
            aria-label="Avaliação física"
            noValidate
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 flex flex-col overflow-hidden pt-3 gap-3"
          >
            <Tabs defaultValue="trunk" className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-2 w-full shrink-0 p-1">
                <TabsTrigger value="trunk" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
                  <Scale className="size-3.5" />
                  <span>Tronco & Composição</span>
                </TabsTrigger>
                <TabsTrigger value="limbs" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
                  <Activity className="size-3.5" />
                  <span>Membros (E / D)</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0 overflow-y-auto p-1.5 flex flex-col gap-3">
                <TabsContent value="trunk" className="m-0 flex flex-col gap-3 p-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <AssessmentMeasurementField
                      id="assessment-weight"
                      label="Peso atual"
                      unit="kg"
                      value={draft.weightKg}
                      onChange={(val) => updateNumericField('weightKg', val)}
                      className="col-span-2"
                    />

                    {TRUNK_FIELDS.map(({ field, label, unit }) => (
                      <AssessmentMeasurementField
                        key={field}
                        id={`assessment-${field}`}
                        label={label}
                        unit={unit}
                        value={draft[field]}
                        onChange={(val) => updateNumericField(field, val)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="limbs" className="m-0 flex flex-col gap-3 p-1">
                  {/* Membros Superiores */}
                  <LimbSectionCard title="Membros Superiores" subtitle="E / D (Auto-espelhado)">
                    {UPPER_LIMB_FIELDS.map(({ field, label, unit }) => (
                      <AssessmentMeasurementField
                        key={field}
                        id={`assessment-${field}`}
                        label={label}
                        unit={unit}
                        value={draft[field]}
                        onChange={(val) => updateNumericField(field, val)}
                      />
                    ))}
                  </LimbSectionCard>

                  {/* Membros Inferiores */}
                  <LimbSectionCard title="Membros Inferiores" subtitle="E / D (Auto-espelhado)">
                    {LOWER_LIMB_FIELDS.map(({ field, label, unit }) => (
                      <AssessmentMeasurementField
                        key={field}
                        id={`assessment-${field}`}
                        label={label}
                        unit={unit}
                        value={draft[field]}
                        onChange={(val) => updateNumericField(field, val)}
                      />
                    ))}
                  </LimbSectionCard>
                </TabsContent>
              </div>
            </Tabs>

            {/* Resumo de Composição Corporal Fixo no Rodapé */}
            <div className="shrink-0 pt-1" aria-label="Composição corporal calculada">
              <Surface variant="subtle" density="compact" className="grid grid-cols-3 gap-2">
                <MetricBox
                  key="bodyFatPercent"
                  label="Body fat"
                  value={composition.bodyFatPercent === null ? '—' : `${composition.bodyFatPercent}%`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone={composition.bodyFatPercent === null ? 'default' : 'success'}
                />
                <MetricBox
                  key="fatMassKg"
                  label="Massa gorda"
                  value={composition.fatMassKg === null ? '—' : `${composition.fatMassKg} kg`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone="default"
                />
                <MetricBox
                  key="leanMassKg"
                  label="Massa magra"
                  value={composition.leanMassKg === null ? '—' : `${composition.leanMassKg} kg`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone="default"
                />
              </Surface>
            </div>

            {submitError && (
              <p role="alert" className={`shrink-0 ${textStyle('validation-error')}`}>
                {submitError}
              </p>
            )}

            <DialogFooter className="shrink-0 pt-3 border-t border-border-subtle mt-1">
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
