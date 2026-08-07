import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Ruler, Scale } from 'lucide-react';
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
import { MetricBoxGroup } from '@/components/organisms/MetricBoxGroup';
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

    const normalizedDraft = normalizePairedBodyMeasurements(draft);

    onSave({
      ...normalizedDraft,
      bodyFatPercent: composition.bodyFatPercent!,
      fatMassKg: composition.fatMassKg!,
      muscleMassKg: composition.leanMassKg!,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-5 overflow-hidden gap-0">
        <DialogHeader className="shrink-0 pb-3 border-b border-border-subtle">
          <DialogTitle className={textStyle('dialog-title')}>
            <Scale size={18} className="text-success shrink-0 inline-block mr-2" aria-hidden="true" />
            <span>{mode === 'create' ? 'Nova Avaliação Física' : 'Editar Avaliação Física'}</span>
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
              <TabsList className="grid grid-cols-2 w-full shrink-0 h-9 p-1">
                <TabsTrigger value="trunk" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
                  <Scale size={14} />
                  <span>Tronco & Composição</span>
                </TabsTrigger>
                <TabsTrigger value="limbs" className={`flex items-center justify-center gap-1.5 py-1 ${textStyle('caption')}`}>
                  <Activity size={14} />
                  <span>Membros (E / D)</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0 overflow-y-auto pt-2.5 pr-1 flex flex-col gap-3">
                <TabsContent value="trunk" className="m-0 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="min-w-0 col-span-2">
                      <label htmlFor="assessment-weight" className={textStyle('field-label')}>
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
                        className="mt-1 h-9"
                      />
                    </div>

                    {TRUNK_FIELDS.map(({ field, label, unit }) => (
                      <div key={field} className="min-w-0">
                        <label htmlFor={`assessment-${field}`} className={textStyle('field-label')}>
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
                          className="mt-1 h-9"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="limbs" className="m-0 flex flex-col gap-3">
                  {/* Membros Superiores */}
                  <div className="flex flex-col gap-2 rounded-surface border border-border-subtle p-2.5 bg-surface-subtle/30">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
                      <span className={textStyle('caption-strong')}>Membros Superiores</span>
                      <span className={`text-text-muted ${textStyle('caption')}`}>E / D (Auto-espelhado)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {UPPER_LIMB_FIELDS.map(({ field, label, unit }) => (
                        <div key={field} className="min-w-0">
                          <label htmlFor={`assessment-${field}`} className={textStyle('field-label')}>
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
                            className="mt-1 h-9"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Membros Inferiores */}
                  <div className="flex flex-col gap-2 rounded-surface border border-border-subtle p-2.5 bg-surface-subtle/30">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
                      <span className={textStyle('caption-strong')}>Membros Inferiores</span>
                      <span className={`text-text-muted ${textStyle('caption')}`}>E / D (Auto-espelhado)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {LOWER_LIMB_FIELDS.map(({ field, label, unit }) => (
                        <div key={field} className="min-w-0">
                          <label htmlFor={`assessment-${field}`} className={textStyle('field-label')}>
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
                            className="mt-1 h-9"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* MetricBoxGroup Fixo no Rodapé */}
            <div className="shrink-0 pt-1">
              <MetricBoxGroup
                aria-label="Composição corporal calculada"
                items={[
                  {
                    key: 'bodyFatPercent',
                    label: 'Body fat',
                    value: composition.bodyFatPercent === null ? '—' : `${composition.bodyFatPercent}%`,
                    size: 'compact',
                    layout: 'split',
                    surface: 'inline',
                    tone: composition.bodyFatPercent === null ? 'default' : 'success',
                  },
                  {
                    key: 'fatMassKg',
                    label: 'Massa gorda',
                    value: composition.fatMassKg === null ? '—' : `${composition.fatMassKg} kg`,
                    size: 'compact',
                    layout: 'split',
                    surface: 'inline',
                    tone: 'default',
                  },
                  {
                    key: 'leanMassKg',
                    label: 'Massa magra',
                    value: composition.leanMassKg === null ? '—' : `${composition.leanMassKg} kg`,
                    size: 'compact',
                    layout: 'split',
                    surface: 'inline',
                    tone: 'default',
                  },
                ]}
              />
            </div>

            {submitError && (
              <p role="alert" className={`shrink-0 bg-error-soft border border-error-border rounded-control p-2 ${textStyle('validation-error')}`}>
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
