'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { DatePickerField } from './DatePickerField';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { formatWhatsappContact } from '@/lib/whatsapp';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface CreatePatientFormData {
  name: string;
  whatsapp: string;
  birthDate: string;
  gender: string;
  isPregnant: boolean;
  pregnancyDueDate: string;
}

export interface CreatePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreatePatientFormData) => void | Promise<void>;
}

const INITIAL_FORM: CreatePatientFormData = {
  name: '',
  whatsapp: '',
  birthDate: '',
  gender: '',
  isPregnant: false,
  pregnancyDueDate: '',
};

export function CreatePatientModal({ open, onOpenChange, onSave }: CreatePatientModalProps) {
  const [formData, setFormData] = useState<CreatePatientFormData>({ ...INITIAL_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({ formRef, enabled: open, priority: 10 });

  const reset = () => setFormData({ ...INITIAL_FORM });
  const update = <K extends keyof CreatePatientFormData>(key: K, value: CreatePatientFormData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((current) => ({
      ...current,
      gender,
      isPregnant: gender === 'Feminino' ? current.isPregnant : false,
      pregnancyDueDate: gender === 'Feminino' ? current.pregnancyDueDate : '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Informe o nome completo.';
    if (!formData.whatsapp.trim()) errors.whatsapp = 'Informe o telefone/WhatsApp.';
    if (!formData.gender) errors.gender = 'Selecione o gênero.';
    if (!formData.birthDate) errors.birthDate = 'Informe a data de nascimento.';
    if (formData.isPregnant && !formData.pregnancyDueDate) errors.pregnancyDueDate = 'Informe a data prevista do parto.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        whatsapp: formatWhatsappContact(formData.whatsapp),
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof PatientApplicationError) setFieldErrors(error.fieldErrors ?? {});
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFemale = formData.gender === 'Feminino';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div>
            <label htmlFor="new-patient-name" className={`${textStyle('field-label')} block mb-1`}>Nome Completo</label>
            <Input id="new-patient-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Carlos Eduardo Silva" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'new-patient-name-error' : undefined} />
            {fieldErrors.name && <p id="new-patient-name-error" className="text-style-legal text-error mt-1" role="alert">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="new-patient-whatsapp" className={`${textStyle('field-label')} block mb-1`}>WhatsApp</label>
            <Input id="new-patient-whatsapp" type="tel" inputMode="numeric" autoComplete="tel" required value={formData.whatsapp} onChange={(event) => update('whatsapp', formatWhatsappContact(event.target.value))} placeholder="(11) 99999-9999" aria-invalid={Boolean(fieldErrors.whatsapp)} aria-describedby={fieldErrors.whatsapp ? 'new-patient-whatsapp-error' : undefined} />
            {fieldErrors.whatsapp && <p id="new-patient-whatsapp-error" className="text-style-legal text-error mt-1" role="alert">{fieldErrors.whatsapp}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePickerField
              id="new-patient-birth-date"
              label="Data de nascimento"
              value={formData.birthDate}
              onValueChange={(value) => update('birthDate', value)}
              required
              error={fieldErrors.birthDate}
            />
            <SelectField
              id="new-patient-gender"
              label="Gênero"
              value={formData.gender}
              onValueChange={handleGenderChange}
              placeholder="Selecione o gênero"
              layer="modal"
              required
              state={fieldErrors.gender ? 'error' : 'default'}
              errorMessage={fieldErrors.gender}
              options={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Feminino', label: 'Feminino' },
              ]}
            />
          </div>

          {isFemale && (
            <div className="grid grid-cols-2 items-start gap-3">
              <fieldset className="flex flex-col gap-2">
                <legend className={textStyle('field-label')}>Grávida?</legend>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-style-body-small text-text-primary">
                    <Input
                      type="radio"
                      name="new-patient-pregnancy"
                      value="no"
                      checked={!formData.isPregnant}
                      onChange={() => update('isPregnant', false)}
                      className="size-4 appearance-auto accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    />
                    <span>Não</span>
                  </label>
                  <label className="flex items-center gap-2 text-style-body-small text-text-primary">
                    <Input
                      type="radio"
                      name="new-patient-pregnancy"
                      value="yes"
                      checked={formData.isPregnant}
                      onChange={() => update('isPregnant', true)}
                      className="size-4 appearance-auto accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    />
                    <span>Sim</span>
                  </label>
                </div>
              </fieldset>
              <div
                className={formData.isPregnant ? undefined : 'invisible'}
                aria-hidden={!formData.isPregnant}
              >
                <DatePickerField
                  id="new-patient-pregnancy-due-date"
                  label="Data prevista do parto"
                  value={formData.pregnancyDueDate}
                  onValueChange={(value) => update('pregnancyDueDate', value)}
                  required={formData.isPregnant}
                  disabled={!formData.isPregnant}
                  error={formData.isPregnant ? fieldErrors.pregnancyDueDate : undefined}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {formError && <p className="text-style-legal text-error flex-1" role="alert">{formError}</p>}
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="primary" size="compact" className="flex-1" disabled={isSubmitting} aria-keyshortcuts="Control+s Meta+s" title="Salvar Paciente (Ctrl+S)">
              {isSubmitting ? 'Salvando…' : <>Salvar Paciente <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span></>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
