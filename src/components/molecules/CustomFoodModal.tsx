'use client';

import React, { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FoodItem } from '@/lib/tacoStore';

export interface CustomFoodFormData {
  name: string;
  portion: string;
  unit: string;
  preparo: string;
  category: string;
  proteinG: string;
  carbsG: string;
  fatsG: string;
  fiberG: string;
  isFavorite: boolean;
}

export interface CustomFoodPayload {
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  isFavorite: boolean;
}

export interface CustomFoodModalProps {
  open: boolean;
  food: FoodItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (foodId: string | null, payload: CustomFoodPayload) => void;
  onDelete: (foodId: string) => void;
}

const UNITS = ['g', 'ml', 'un', 'scoop', 'fatia', 'colher (sopa)', 'colher (chá)', 'xícara', 'porção'];
const CATEGORIES = [
  'Carnes, Pescados & Ovos',
  'Verduras & Legumes',
  'Frutas',
  'Cereais & Tubérculos',
  'Leguminosas',
  'Leite & Derivados',
  'Gorduras, Nozes & Sementes',
  'Doces, Bebidas & Processados',
  'Suplementos',
  'Manipulados & Produtos',
];

const EMPTY_FORM: CustomFoodFormData = {
  name: '',
  portion: '',
  unit: 'g',
  preparo: 'inNatura',
  category: 'Suplementos',
  proteinG: '',
  carbsG: '',
  fatsG: '',
  fiberG: '',
  isFavorite: false,
};

function formFromFood(food: FoodItem | null): CustomFoodFormData {
  if (!food) return { ...EMPTY_FORM };

  const match = food.name.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  const cleanName = match?.[1]?.trim() || food.name;
  const portionMatch = match?.[2]?.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  const parsedUnit = portionMatch?.[2] || match?.[2] || 'g';

  return {
    name: cleanName,
    portion: portionMatch?.[1] || '',
    unit: UNITS.includes(parsedUnit) ? parsedUnit : 'g',
    preparo: food.preparo || 'Personalizado',
    category: CATEGORIES.includes(food.category) ? food.category : 'Suplementos',
    proteinG: String(food.proteinG ?? ''),
    carbsG: String(food.carbsG ?? ''),
    fatsG: String(food.fatsG ?? ''),
    fiberG: String(food.fiberG ?? ''),
    isFavorite: food.isFavorite || false,
  };
}

export function CustomFoodModal({ open, food, onOpenChange, onSave, onDelete }: CustomFoodModalProps) {
  const [formData, setFormData] = useState<CustomFoodFormData>(() => formFromFood(food));

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <label htmlFor="custom-food-name" className="text-style-legal font-bold text-text-primary block mb-1">Nome do Alimento / Suplemento</label>
              <Input id="custom-food-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Whey Protein 80% Max" />
            </div>
            <div className="col-span-3">
              <label htmlFor="custom-food-portion" className="text-style-legal font-bold text-text-primary block mb-1">Qtd. Porção</label>
              <Input id="custom-food-portion" value={formData.portion} onChange={(event) => update('portion', event.target.value)} placeholder="Ex: 100" />
            </div>
            <div className="col-span-3">
              <label htmlFor="custom-food-unit" className="text-style-legal font-bold text-text-primary block mb-1">Unidade</label>
              <Select value={formData.unit} onValueChange={(value) => update('unit', value)}>
                <SelectTrigger id="custom-food-unit"><SelectValue /></SelectTrigger>
                <SelectContent layer="modal">{UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <label htmlFor="custom-food-category" className="text-style-legal font-bold text-text-primary block mb-1">Categoria</label>
              <Select value={formData.category} onValueChange={(value) => update('category', value)}>
                <SelectTrigger id="custom-food-category"><SelectValue /></SelectTrigger>
                <SelectContent layer="modal">{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-6">
              <label htmlFor="custom-food-preparo" className="text-style-legal font-bold text-text-primary block mb-1">Forma de Preparo</label>
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
            <label htmlFor="custom-food-fiber" className="text-style-legal font-semibold text-text-muted block mb-1">Fibra Alimentar (opcional)</label>
            <Input id="custom-food-fiber" type="number" min="0" step="any" value={formData.fiberG} onChange={(event) => update('fiberG', event.target.value)} placeholder="Ex: 2" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            {food && <Button type="button" variant="destructive" size="compact" onClick={() => onDelete(food.id)}><Trash2 size={13} />Excluir</Button>}
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" variant="primary" size="compact" className="flex-1">{food ? 'Salvar Alterações' : 'Salvar Alimento'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
