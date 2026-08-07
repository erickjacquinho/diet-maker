import React from 'react';
import { Activity, Scale } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BodyAssessment, Patient } from '@/lib/patientsStore';
import { Surface } from '@/components/atoms';
import { MetricBox } from './MetricBox';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';
import { AssessmentMeasurementField } from './assessment/AssessmentMeasurementField';
import { LimbSectionCard } from './assessment/LimbSectionCard';
import {
  TRUNK_FIELDS,
  UPPER_LIMB_FIELDS,
  LOWER_LIMB_FIELDS,
} from './assessment/assessmentFieldsConfig';

export { useAssessmentForm };

export interface EditAssessmentModalProps {
  open: boolean;
  patient: Pick<Patient, 'gender' | 'heightCm'> | null;
  assessment: BodyAssessment | null;
  mode?: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSave: (assessment: BodyAssessment) => void;
}

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
