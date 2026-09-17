'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Pencil } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { DatePickerField } from './DatePickerField';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { formatWhatsappContact } from '@/lib/whatsapp';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface EditPatientModalProps {
  open: boolean;
  patient: PatientViewModel | null;
  objectives: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (patient: PatientViewModel) => void | Promise<void>;
  onRequestAddObjective: () => void;
  objectiveToApply?: string;
}

export function EditPatientModal({
  open,
  patient,
  objectives,
  onOpenChange,
  onSave,
  onRequestAddObjective,
  objectiveToApply,
}: EditPatientModalProps) {
  const [draft, setDraft] = useState<PatientViewModel | null>(patient);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open && !isDiscardConfirmOpen,
    priority: 10,
  });

  useEffect(() => {
      if (open && patient) {
        setDraft({
        ...patient,
        whatsapp: formatWhatsappContact(patient.whatsapp) || undefined,
        birthDate: patient.birthDate || undefined,
        isPregnant: patient.isPregnant === true,
        pregnancyDueDate: patient.pregnancyDueDate || undefined,
      });
    }
  }, [open, patient]);

  const hasUnsavedChanges = Boolean(draft && patient && (
    draft.name !== patient.name ||
    (draft.gender || 'Masculino') !== (patient.gender || 'Masculino') ||
    (draft.birthDate || '') !== (patient.birthDate || '') ||
    (draft.isPregnant || false) !== (patient.isPregnant || false) ||
    (draft.pregnancyDueDate || '') !== (patient.pregnancyDueDate || '') ||
    formatWhatsappContact(draft.whatsapp) !== formatWhatsappContact(patient.whatsapp) || draft.targetKcal !== patient.targetKcal ||
    draft.targetProtein !== patient.targetProtein || draft.targetCarbs !== patient.targetCarbs || draft.targetFats !== patient.targetFats
  ));

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) { setIsDiscardConfirmOpen(true); return; }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !draft.name.trim()) {
      setFieldErrors({ name: 'Informe o nome completo.' });
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    void Promise.resolve(onSave({
      ...draft,
      name: draft.name.trim(),
      whatsapp: formatWhatsappContact(draft.whatsapp) || undefined,
    })).then(() => {
      onOpenChange(false);
    }).catch((error: unknown) => {
      if (error instanceof PatientApplicationError) setFieldErrors(error.fieldErrors ?? {});
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.');
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  const confirmDiscard = () => {
    setDraft(patient ? { ...patient } : null);
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-screen overflow-y-auto" onPointerDownOutside={(event) => { if (hasUnsavedChanges) { event.preventDefault(); setIsDiscardConfirmOpen(true); } }} onEscapeKeyDown={(event) => { if (hasUnsavedChanges) { event.preventDefault(); setIsDiscardConfirmOpen(true); } }}>
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>
              <Pencil size={18} className="text-success shrink-0 inline-block mr-2" />
              <span>Editar Dados do Paciente</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Altere as informações cadastrais e metas do paciente.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-patient-name" className={textStyle('field-label')}>Nome Completo do Paciente</label>
                  <Input id="edit-patient-name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'edit-patient-name-error' : undefined} />
                  {fieldErrors.name && <p id="edit-patient-name-error" className="text-style-legal text-error mt-1" role="alert">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="edit-patient-whatsapp" className={textStyle('field-label')}>WhatsApp</label>
                  <Input id="edit-patient-whatsapp" type="tel" inputMode="numeric" autoComplete="tel" value={draft.whatsapp ?? ''} onChange={(event) => setDraft({ ...draft, whatsapp: formatWhatsappContact(event.target.value) })} placeholder="(11) 99999-9999" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DatePickerField
                  id="edit-patient-birth-date"
                  label="Data de nascimento"
                  value={draft.birthDate}
                  onValueChange={(value) => setDraft({ ...draft, birthDate: value })}
                  error={fieldErrors.birthDate}
                />
                <SelectField
                  id="edit-patient-gender"
                  label="Gênero"
                  value={draft.gender || ''}
                  onValueChange={(value) => setDraft({
                    ...draft,
                    gender: value,
                    isPregnant: value === 'Feminino' ? draft.isPregnant : false,
                    pregnancyDueDate: value === 'Feminino' ? draft.pregnancyDueDate : undefined,
                  })}
                  placeholder="Selecione o gênero"
                  layer="modal"
                  options={[
                    { value: 'Masculino', label: 'Masculino' },
                    { value: 'Feminino', label: 'Feminino' },
                    ...(draft.gender && !['Masculino', 'Feminino'].includes(draft.gender)
                      ? [{ value: draft.gender, label: draft.gender }]
                      : []),
                  ]}
                />
              </div>

              {draft.gender === 'Feminino' && (
                <div className="grid grid-cols-2 items-start gap-3">
                  <fieldset className="flex flex-col gap-2">
                    <legend className={textStyle('field-label')}>Grávida?</legend>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-style-body-small text-text-primary">
                        <Input
                          type="radio"
                          name="edit-patient-pregnancy"
                          value="no"
                          checked={draft.isPregnant !== true}
                          onChange={() => setDraft({ ...draft, isPregnant: false })}
                          className="size-4 appearance-auto accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        />
                        <span>Não</span>
                      </label>
                      <label className="flex items-center gap-2 text-style-body-small text-text-primary">
                        <Input
                          type="radio"
                          name="edit-patient-pregnancy"
                          value="yes"
                          checked={draft.isPregnant === true}
                          onChange={() => setDraft({ ...draft, isPregnant: true })}
                          className="size-4 appearance-auto accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        />
                        <span>Sim</span>
                      </label>
                    </div>
                  </fieldset>
                  <div
                    className={draft.isPregnant ? undefined : 'invisible'}
                    aria-hidden={draft.isPregnant !== true}
                  >
                    <DatePickerField
                      id="edit-patient-pregnancy-due-date"
                      label="Data prevista do parto"
                      value={draft.pregnancyDueDate}
                      onValueChange={(value) => setDraft({ ...draft, pregnancyDueDate: value })}
                      disabled={draft.isPregnant !== true}
                      error={draft.isPregnant === true ? fieldErrors.pregnancyDueDate : undefined}
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2 pt-2">
                {formError && <p className="text-style-legal text-error flex-1" role="alert">{formError}</p>}
                <Button type="button" variant="secondary" size="compact" onClick={() => requestClose(false)} disabled={isSubmitting} className="flex-1">Cancelar</Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="compact"
                  className="flex-1"
                  disabled={isSubmitting}
                  aria-keyshortcuts="Control+s Meta+s"
                  title="Salvar Alterações (Ctrl+S)"
                >
                  {isSubmitting ? 'Salvando…' : <>Salvar Alterações <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span></>}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>
              <AlertTriangle size={18} className="text-warning shrink-0 inline-block mr-2" />
              <span>Descartar alterações?</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Você possui alterações não salvas nos dados do paciente. Deseja descartar as alterações e sair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" size="compact" onClick={() => setIsDiscardConfirmOpen(false)}>Não</Button>
            <Button type="button" variant="destructive" size="compact" onClick={confirmDiscard}>Sim, descartar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
