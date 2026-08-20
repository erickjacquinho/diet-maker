'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutoKcalSection } from './AutoKcalSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { textStyle } from '@/design-system';

export interface ReadyMealFormData {
  name: string;
  suggestedTime: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsCount: number;
  itemsPreview: string;
}

export interface CreateReadyMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ReadyMealFormData) => void;
}

const INITIAL_FORM: ReadyMealFormData = {
  name: '',
  suggestedTime: '08:00',
  proteinG: 30,
  carbsG: 40,
  fatsG: 12,
  itemsCount: 3,
  itemsPreview: '',
};

export function CreateReadyMealModal({ open, onOpenChange, onSave }: CreateReadyMealModalProps) {
  const [formData, setFormData] = useState<ReadyMealFormData>({ ...INITIAL_FORM });
  const update = <K extends keyof ReadyMealFormData>(key: K, value: ReadyMealFormData[K]) => setFormData((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    onSave({ ...formData, name: formData.name.trim(), itemsPreview: formData.itemsPreview.trim() });
    setFormData({ ...INITIAL_FORM });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">Novo Bloco de Refeição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div><label htmlFor="ready-meal-name" className={`${textStyle('field-label')} block mb-1`}>Nome do Bloco de Refeição</label><Input id="ready-meal-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Café da Manhã Proteico Padrão" /></div>
          <div><label htmlFor="ready-meal-time" className={`${textStyle('field-label')} block mb-1`}>Horário Sugerido</label><Input id="ready-meal-time" value={formData.suggestedTime} onChange={(event) => update('suggestedTime', event.target.value)} placeholder="08:00" /></div>
          <AutoKcalSection title="Macronutrientes & Calorias Calculadas" proteinG={formData.proteinG} carbsG={formData.carbsG} fatsG={formData.fatsG} onProteinChange={(value) => update('proteinG', value)} onCarbsChange={(value) => update('carbsG', value)} onFatsChange={(value) => update('fatsG', value)} />
          <div><label htmlFor="ready-meal-items" className={`${textStyle('field-label')} block mb-1`}>Alimentos Incluídos (Resumo)</label><Textarea id="ready-meal-items" rows={2} value={formData.itemsPreview} onChange={(event) => update('itemsPreview', event.target.value)} placeholder="Ex: Ovo cozido (150g), Aveia em flocos (40g), Banana (100g)" className="resize-none" /></div>
          <div className="flex gap-2 pt-2"><Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" size="compact" className="flex-1">Salvar Refeição</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

