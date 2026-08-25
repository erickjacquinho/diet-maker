'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { AutoKcalSection } from './AutoKcalSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import type { FoodItem } from '@/lib/tacoStore';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import {
  UNITS,
  CATEGORIES,
  formFromFood,
  type CustomFoodFormData,
  type CustomFoodPayload,
} from './custom-food/customFoodFormModel';

export type { CustomFoodFormData, CustomFoodPayload };

export interface CustomFoodModalProps {
  open: boolean;
  food: FoodItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (foodId: string | null, payload: CustomFoodPayload) => void;
  onDelete: (foodId: string) => void;
}

export function CustomFoodModal({ open, food, onOpenChange, onSave, onDelete }: CustomFoodModalProps) {
  const [formData, setFormData] = useState<CustomFoodFormData>(() => formFromFood(food));
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });

  useEffect(() => {
    if (open) setFormData(formFromFood(food));
  }, [food, open]);

  const update = <K extends keyof CustomFoodFormData>(key: K, value: CustomFoodFormData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    const portion = formData.portion.trim();
    const payload: CustomFoodPayload = {
      name: `${formData.name.trim()} (${portion ? `${portion}${formData.unit}` : formData.unit})`,
      preparo: formData.preparo.trim() || 'Personalizado',
      category: formData.category,
      kcal: Math.round((Number(formData.proteinG) || 0) * 4 + (Number(formData.carbsG) || 0) * 4 + (Number(formData.fatsG) || 0) * 9),
      proteinG: Number(formData.proteinG) || 0,
      carbsG: Number(formData.carbsG) || 0,
      fatsG: Number(formData.fatsG) || 0,
      fiberG: Number(formData.fiberG) || 0,
      isFavorite: formData.isFavorite,
    };

    onSave(food?.id || null, payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">
            {food ? 'Editar Alimento Customizado' : 'Novo Alimento Customizado'}
          </DialogTitle>
          <p className="text-style-legal text-text-muted font-medium mt-0.5">
            {food ? 'Atualize os dados e composição nutricional do alimento.' : 'Cadastre um produto comercial ou suplemento manipulado na biblioteca.'}
          </p>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <label htmlFor="custom-food-name" className={`${textStyle('field-label')} block mb-1`}>Nome do Alimento / Suplemento</label>
              <Input id="custom-food-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Whey Protein 80% Max" />
            </div>
            <div className="col-span-3">
              <label htmlFor="custom-food-portion" className={`${textStyle('field-label')} block mb-1`}>Qtd. Porção</label>
              <Input id="custom-food-portion" value={formData.portion} onChange={(event) => update('portion', event.target.value)} placeholder="Ex: 100" />
            </div>
            <div className="col-span-3">
              <SelectField
                id="custom-food-unit"
                label="Unidade"
                value={formData.unit}
                onValueChange={(value) => update('unit', value)}
                layer="modal"
                options={UNITS.map((unit) => ({ value: unit, label: unit }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <SelectField
                id="custom-food-category"
                label="Categoria"
                value={formData.category}
                onValueChange={(value) => update('category', value)}
                layer="modal"
                options={CATEGORIES.map((category) => ({ value: category, label: category }))}
              />
            </div>
            <div className="col-span-6">
              <label htmlFor="custom-food-preparo" className={`${textStyle('field-label')} block mb-1`}>Forma de Preparo</label>
              <Input id="custom-food-preparo" value={formData.preparo} onChange={(event) => update('preparo', event.target.value)} placeholder="Ex: Grelhado, Cozido, Cru" />
            </div>
          </div>

          <AutoKcalSection
            title="Macronutrientes da Porção & Calorias Calculadas"
            proteinG={Number(formData.proteinG) || 0}
            carbsG={Number(formData.carbsG) || 0}
            fatsG={Number(formData.fatsG) || 0}
            onProteinChange={(value) => update('proteinG', String(value))}
            onCarbsChange={(value) => update('carbsG', String(value))}
            onFatsChange={(value) => update('fatsG', String(value))}
          />

          <div>
            <label htmlFor="custom-food-fiber" className={`${textStyle('field-label')} block mb-1`}>Fibra Alimentar (opcional)</label>
            <Input id="custom-food-fiber" type="number" min="0" step="any" value={formData.fiberG} onChange={(event) => update('fiberG', event.target.value)} placeholder="Ex: 2" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            {food && <Button type="button" variant="destructive" size="compact" onClick={() => onDelete(food.id)}><Trash2 size={13} />Excluir</Button>}
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Alimento (Ctrl+S)"
            >
              {food ? 'Salvar Alterações' : 'Salvar Alimento'} <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
