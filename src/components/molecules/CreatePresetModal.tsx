'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { calculateMacroGrams, calculatePresetCalories, type MacroMode } from '@/lib/presetUtils';
import { textStyle } from '@/design-system';

export interface CreatePresetData {
  title: string;
  category: string;
  proteinMode: MacroMode;
  proteinValue: number;
  carbsMode: MacroMode;
  carbsValue: number;
  fatsMode: MacroMode;
  fatsValue: number;
  referenceWeight: number;
  mealsCount: number;
  description: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  targetKcal: number;
}

export interface CreatePresetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreatePresetData) => void;
}

interface PresetFormData {
  title: string;
  category: string;
  proteinMode: MacroMode;
  proteinValue: number;
  carbsMode: MacroMode;
  carbsValue: number;
  fatsMode: MacroMode;
  fatsValue: number;
  referenceWeight: number;
  mealsCount: number;
  description: string;
}

const INITIAL_FORM: PresetFormData = {
  title: '', category: 'Emagrecimento', proteinMode: 'absoluto', proteinValue: 160,
  carbsMode: 'absoluto', carbsValue: 200, fatsMode: 'absoluto', fatsValue: 60,
  referenceWeight: 70, mealsCount: 5, description: '',
};

export function CreatePresetModal({ open, onOpenChange, onSave }: CreatePresetModalProps) {
  const [formData, setFormData] = useState<PresetFormData>({ ...INITIAL_FORM });
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const proteinG = calculateMacroGrams({ mode: formData.proteinMode, value: formData.proteinValue }, formData.referenceWeight);
  const carbsG = calculateMacroGrams({ mode: formData.carbsMode, value: formData.carbsValue }, formData.referenceWeight);
  const fatsG = calculateMacroGrams({ mode: formData.fatsMode, value: formData.fatsValue }, formData.referenceWeight);
  const calculatedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
  const hasMultiplicative = [formData.proteinMode, formData.carbsMode, formData.fatsMode].includes('multiplicativo');
  const hasContent = Boolean(formData.title.trim() || formData.description.trim());

  const update = <K extends keyof PresetFormData>(key: K, value: PresetFormData[K]) => setFormData((current) => ({ ...current, [key]: value }));
  const reset = () => setFormData({ ...INITIAL_FORM });

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasContent) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim()) return;
    onSave({ ...formData, title: formData.title.trim(), description: formData.description.trim(), proteinG, carbsG, fatsG, targetKcal: calculatedKcal });
    reset();
    onOpenChange(false);
  };

  const confirmDiscard = () => {
    reset();
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const MacroEditor = ({ label, modeKey, valueKey, color }: { label: string; modeKey: 'proteinMode' | 'carbsMode' | 'fatsMode'; valueKey: 'proteinValue' | 'carbsValue' | 'fatsValue'; color: string }) => (
    <div className="p-3 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-2">
      <div className="flex items-center justify-between"><span className={`text-style-legal font-bold ${color}`}>{label}</span><span className="text-style-legal font-semibold text-text-muted">Modo de cálculo</span></div>
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          value={formData[modeKey]}
          onValueChange={(value) => update(modeKey, value as MacroMode)}
          layer="modal"
          options={[
            { value: 'absoluto', label: 'Absoluto (g)' },
            { value: 'multiplicativo', label: 'Multiplicativo (g/kg)' },
          ]}
        />
        <Input type="number" min={0} step={formData[modeKey] === 'multiplicativo' ? 0.1 : 1} value={formData[valueKey]} onChange={(event) => update(valueKey, Number(event.target.value))} className="font-bold text-center" />
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-w-md max-h-screen overflow-y-auto" onInteractOutside={(event) => { if (hasContent) { event.preventDefault(); setIsDiscardConfirmOpen(true); } }}>
          <DialogHeader className="border-b border-border-subtle pb-3"><DialogTitle className="font-bold text-style-body text-text-primary">Novo Preset de Dieta</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div><label htmlFor="preset-title" className={`${textStyle('field-label')} block mb-1`}>Título do Protocolo</label><Input id="preset-title" required value={formData.title} onChange={(event) => update('title', event.target.value)} placeholder="Ex: Protocolo Cutting Low Carb 1800kcal" /></div>
            <div>
              <SelectField
                id="preset-category"
                label="Categoria"
                value={formData.category}
                onValueChange={(value) => update('category', value)}
                layer="modal"
                options={[
                  { value: 'Emagrecimento', label: 'Emagrecimento / Cutting' },
                  { value: 'Hipertrofia', label: 'Hipertrofia / Bulking' },
                  { value: 'Manutenção', label: 'Manutenção / Saúde' },
                  { value: 'Jejum Intermitente', label: 'Jejum Intermitente' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2"><span className={`${textStyle('field-label')} block`}>Macronutrientes</span><MacroEditor label="Proteínas" modeKey="proteinMode" valueKey="proteinValue" color="text-macro-protein" /><MacroEditor label="Carboidratos" modeKey="carbsMode" valueKey="carbsValue" color="text-macro-carbohydrate" /><MacroEditor label="Gorduras" modeKey="fatsMode" valueKey="fatsValue" color="text-macro-fat" /></div>
            {hasMultiplicative && <div className="p-3 bg-warning-soft border border-warning-border rounded-control flex items-center justify-between gap-2"><div><label htmlFor="preset-reference-weight" className={`${textStyle('field-label')} block`}>Peso de Referência (kg)</label><span className="text-style-legal text-text-muted block">Estimativa para cálculo total (g/kg × kg)</span></div><Input id="preset-reference-weight" type="number" min={1} value={formData.referenceWeight} onChange={(event) => update('referenceWeight', Number(event.target.value))} className="font-bold text-center w-20 shrink-0" /></div>}
            <div className="p-3 bg-macro-kcal-soft border border-macro-kcal-border rounded-control flex items-center justify-between"><div><span className={`${textStyle('field-label')} block`}>Calorias Totais (Calculadas)</span><span className="text-style-legal text-text-muted block">Auto: (Prot × 4) + (Carb × 4) + (Gord × 9)</span></div><Badge variant="secondary" className="font-bold text-style-body-small text-macro-kcal bg-macro-kcal-soft border-none px-3 py-1">{calculatedKcal} kcal</Badge></div>
            <div><label htmlFor="preset-description" className={`${textStyle('field-label')} block mb-1`}>Descrição Breve</label><Textarea id="preset-description" rows={2} value={formData.description} onChange={(event) => update('description', event.target.value)} placeholder="Orientações e indicações deste preset..." className="resize-none" /></div>
            <div className="flex gap-2 pt-2"><Button type="button" variant="secondary" size="compact" onClick={() => requestClose(false)} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" size="compact" className="flex-1">Salvar Preset</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="font-bold text-style-body text-text-primary">Descartar alterações?</DialogTitle><DialogDescription>Você possui dados preenchidos no formulário de preset. Se fechar agora, todas as informações não salvas serão perdidas.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="secondary" size="compact" onClick={() => setIsDiscardConfirmOpen(false)}>Continuar Editando</Button><Button type="button" variant="destructive" size="compact" onClick={confirmDiscard}>Descartar</Button></DialogFooter></DialogContent>
      </Dialog>
    </>
  );
}
