import React, { useRef } from 'react';
import { Scale } from 'lucide-react';
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
import { BodyAssessment, Patient } from '@/lib/patientsStore';
import { Surface } from '@/components/atoms';
import { MetricBox } from './MetricBox';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';
import { AssessmentContinuousFields } from './assessment/AssessmentContinuousFields';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

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
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });

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
      <DialogContent className="max-h-[90vh] max-w-lg sm:max-w-xl md:max-w-2xl flex flex-col p-5 overflow-hidden gap-0">
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
            ref={formRef}
            aria-label="Avaliação física"
            noValidate
            onSubmit={handleSubmit}
            className="flex-1 min-h-0 flex flex-col overflow-hidden pt-3 gap-3"
          >
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <AssessmentContinuousFields draft={draft} updateNumericField={updateNumericField} />
            </div>

            <div className="shrink-0 pt-1" aria-label="Composição corporal calculada">
              <Surface variant="subtle" density="compact" className="grid grid-cols-3 gap-2 divide-x divide-border-divider overflow-hidden">
                <MetricBox
                  key="bodyFatPercent"
                  label="Body fat"
                  value={composition.bodyFatPercent === null ? '—' : `${composition.bodyFatPercent} %`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone={composition.bodyFatPercent === null ? 'default' : 'success'}
                  className="px-2"
                />
                <MetricBox
                  key="fatMassKg"
                  label="Massa gorda"
                  value={composition.fatMassKg === null ? '—' : `${composition.fatMassKg} kg`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone="default"
                  className="px-2"
                />
                <MetricBox
                  key="leanMassKg"
                  label="Massa magra"
                  value={composition.leanMassKg === null ? '—' : `${composition.leanMassKg} kg`}
                  size="compact"
                  layout="split"
                  surface="inline"
                  tone="default"
                  className="px-2"
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
              <Button
                type="submit"
                variant="primary"
                size="compact"
                aria-keyshortcuts="Control+s Meta+s"
                title="Salvar avaliação (Ctrl+S)"
              >
                Salvar avaliação <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
