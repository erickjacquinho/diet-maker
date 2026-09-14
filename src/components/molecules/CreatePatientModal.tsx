'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { DEFAULT_OBJECTIVE_LABELS } from '@/lib/domain/objective-option';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { formatWhatsappContact } from '@/lib/whatsapp';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface CreatePatientFormData {
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  whatsapp: string;
  objective: string;
}

export interface CreatePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreatePatientFormData) => void | Promise<void>;
}

const INITIAL_FORM: CreatePatientFormData = {
  name: '',
  age: 30,
  gender: 'Masculino',
  heightCm: 175,
  weightKg: 75,
  targetProtein: 150,
  targetCarbs: 220,
  targetFats: 60,
  whatsapp: '',
  objective: 'Recomposição Corporal',
};

export function CreatePatientModal({ open, onOpenChange, onSave }: CreatePatientModalProps) {
  const [formData, setFormData] = useState<CreatePatientFormData>({ ...INITIAL_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });

  const reset = () => setFormData({ ...INITIAL_FORM });
  const update = <K extends keyof CreatePatientFormData>(key: K, value: CreatePatientFormData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      setFieldErrors({ name: 'Informe o nome completo.' });
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await onSave({ ...formData, name: formData.name.trim(), whatsapp: formatWhatsappContact(formData.whatsapp) });
      reset();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof PatientApplicationError) setFieldErrors(error.fieldErrors ?? {});
      setFormError(error instanceof Error ? error.message : 'Não foi possível salvar o paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Input id="new-patient-whatsapp" type="tel" inputMode="numeric" autoComplete="tel" value={formData.whatsapp} onChange={(event) => update('whatsapp', formatWhatsappContact(event.target.value))} placeholder="(11) 99999-9999" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div><label className={`${textStyle('field-label')} block mb-1`}>Idade</label><Input type="number" value={formData.age} onChange={(event) => update('age', Number(event.target.value))} /></div>
            <div><label className={`${textStyle('field-label')} block mb-1`}>Altura (cm)</label><Input type="number" value={formData.heightCm} onChange={(event) => update('heightCm', Number(event.target.value))} /></div>
            <div><label className={`${textStyle('field-label')} block mb-1`}>Peso (kg)</label><Input type="number" step="any" value={formData.weightKg} onChange={(event) => update('weightKg', Number(event.target.value))} /></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <SelectField
              id="new-patient-objective"
              label="Objetivo Clínico / Esportivo"
              value={formData.objective}
              onValueChange={(value) => update('objective', value)}
              placeholder="Selecione o objetivo"
              layer="modal"
              options={DEFAULT_OBJECTIVE_LABELS.map((objective) => ({ value: objective, label: objective }))}
            />

            <SelectField
              id="new-patient-gender"
              label="Gênero"
              value={formData.gender}
              onValueChange={(value) => update('gender', value)}
              placeholder="Selecione o gênero"
              layer="modal"
              options={[
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Feminino', label: 'Feminino' },
              ]}
            />
          </div>

          <div className="flex gap-2 pt-2">
            {formError && <p className="text-style-legal text-error flex-1" role="alert">{formError}</p>}
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              disabled={isSubmitting}
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Paciente (Ctrl+S)"
            >
              {isSubmitting ? 'Salvando…' : <>Salvar Paciente <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span></>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
