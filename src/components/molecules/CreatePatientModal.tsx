'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { DEFAULT_OBJECTIVES } from '@/lib/patientsStore';
import { formatWhatsappContact } from '@/lib/whatsapp';
import { textStyle } from '@/design-system';

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
  onSave: (data: CreatePatientFormData) => void;
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

  const reset = () => setFormData({ ...INITIAL_FORM });
  const update = <K extends keyof CreatePatientFormData>(key: K, value: CreatePatientFormData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    onSave({ ...formData, name: formData.name.trim(), whatsapp: formatWhatsappContact(formData.whatsapp) });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div>
            <label htmlFor="new-patient-name" className={`${textStyle('field-label')} block mb-1`}>Nome Completo</label>
            <Input id="new-patient-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Carlos Eduardo Silva" />
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
              options={DEFAULT_OBJECTIVES.map((objective) => ({ value: objective, label: objective }))}
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
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="primary" size="compact" className="flex-1">Salvar Paciente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
