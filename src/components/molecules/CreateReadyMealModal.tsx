'use client';

import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/atoms';
import { AutoKcalSection } from './AutoKcalSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import type { ReadyMealItemInput } from '@/lib/domain/library/library-model';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { listTacoFoodItems, searchTacoFoods, toFoodItem, toRecipe, type FoodItem, type ReadyMeal, type Recipe } from '@/lib/library-ui-adapter';

export interface ReadyMealFormData {
  id?: string;
  name: string;
  suggestedTime: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsCount: number;
  itemsPreview: string;
  items?: ReadyMealItemInput[];
}

export interface CreateReadyMealModalProps {
  open: boolean;
  meal?: ReadyMeal | null;
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

export function CreateReadyMealModal({ open, meal, onOpenChange, onSave }: CreateReadyMealModalProps) {
  const [formData, setFormData] = useState<ReadyMealFormData>({ ...INITIAL_FORM });
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [foodPool, setFoodPool] = useState<FoodItem[]>(() => listTacoFoodItems());
  const [recipePool, setRecipePool] = useState<Recipe[]>([]);
  const [itemSourceType, setItemSourceType] = useState<'FOOD' | 'RECIPE'>('FOOD');
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setFormData(meal ? {
      ...INITIAL_FORM,
      name: meal.name,
      suggestedTime: meal.suggestedTime,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatsG: meal.fatsG,
      itemsCount: meal.itemsCount,
      itemsPreview: meal.itemsPreview,
      items: meal.items ? [...meal.items] : [],
    } : { ...INITIAL_FORM, items: [] });
    setFoodQuery('');
    setFoodResults([]);
    setItemSourceType('FOOD');
    setFormError(null);
    let cancelled = false;
    void getBrowserLibraryApplication().then(async (application) => {
      const [customFoods, recipes] = await Promise.all([application.listCustomFoods(), application.listRecipes()]);
      if (cancelled) return;
      setFoodPool([...listTacoFoodItems(), ...customFoods.map(toFoodItem)]);
      setRecipePool(recipes.map(toRecipe));
    }).catch(() => {
      if (!cancelled) {
        setFoodPool(listTacoFoodItems());
        setRecipePool([]);
      }
    });
    return () => { cancelled = true; };
  }, [meal, open]);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });
  const update = <K extends keyof ReadyMealFormData>(key: K, value: ReadyMealFormData[K]) => setFormData((current) => ({ ...current, [key]: value }));

  const searchFoods = (value: string) => {
    setFoodQuery(value);
    setFoodResults(value.trim().length < 2 || itemSourceType !== 'FOOD' ? [] : searchTacoFoods(value, foodPool).slice(0, 6));
  };

  const addFood = (food: FoodItem) => {
    const items = formData.items ?? [];
    if (items.some((item) => item.sourceId === food.id)) return;
    update('items', [...items, { sourceType: 'FOOD', sourceId: food.id, quantity: '100', unit: 'g' }]);
    update('itemsCount', items.length + 1);
    setFoodQuery('');
    setFoodResults([]);
    setFormError(null);
  };

  const recipeResults = foodQuery.trim().length < 2 || itemSourceType !== 'RECIPE'
    ? []
    : recipePool.filter((recipe) => `${recipe.name} ${recipe.category}`.toLocaleLowerCase('pt-BR').includes(foodQuery.trim().toLocaleLowerCase('pt-BR'))).slice(0, 6);

  const addRecipe = (recipe: Recipe) => {
    const items = formData.items ?? [];
    if (items.some((item) => item.sourceId === recipe.id)) return;
    update('items', [...items, { sourceType: 'RECIPE', sourceId: recipe.id, recipePortions: '1' }]);
    update('itemsCount', items.length + 1);
    setFoodQuery('');
    setFoodResults([]);
    setFormError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.items?.length) {
      setFormError('Adicione pelo menos um alimento ao bloco.');
      return;
    }
    onSave({ ...formData, id: meal?.id, name: formData.name.trim(), itemsPreview: formData.itemsPreview.trim(), items: formData.items });
    setFormData({ ...INITIAL_FORM });
    setFormError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">{meal ? 'Editar Bloco de Refeição' : 'Novo Bloco de Refeição'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div><label htmlFor="ready-meal-name" className={`${textStyle('field-label')} block mb-1`}>Nome do Bloco de Refeição</label><Input id="ready-meal-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Café da Manhã Proteico Padrão" /></div>
          <div><label htmlFor="ready-meal-time" className={`${textStyle('field-label')} block mb-1`}>Horário Sugerido</label><Input id="ready-meal-time" value={formData.suggestedTime} onChange={(event) => update('suggestedTime', event.target.value)} placeholder="08:00" /></div>
          <div className="flex flex-col gap-2">
            <SelectField
              id="ready-meal-item-source"
              label="Tipo de item"
              value={itemSourceType}
              onValueChange={(value) => { setItemSourceType(value as 'FOOD' | 'RECIPE'); setFoodQuery(''); setFoodResults([]); }}
              layer="modal"
              options={[{ value: 'FOOD', label: 'Alimento TACO ou customizado' }, { value: 'RECIPE', label: 'Receita culinária' }]}
            />
            <Input id="ready-meal-food-search" value={foodQuery} onChange={(event) => searchFoods(event.target.value)} placeholder={itemSourceType === 'FOOD' ? 'Buscar alimento para adicionar…' : 'Buscar receita para adicionar…'} />
            {foodResults.length > 0 && <div className="rounded-control border border-border-subtle bg-surface p-1 flex flex-col gap-1" role="listbox" aria-label="Resultados de alimentos da biblioteca">{foodResults.map((food) => <Button key={food.id} type="button" variant="quiet" size="compact" className="justify-between" onClick={() => addFood(food)}><span>{food.name}</span><span className="text-style-chart-micro text-text-muted">{food.kcal} kcal</span></Button>)}</div>}
            {recipeResults.length > 0 && <div className="rounded-control border border-border-subtle bg-surface p-1 flex flex-col gap-1" role="listbox" aria-label="Resultados de receitas da biblioteca">{recipeResults.map((recipe) => <Button key={recipe.id} type="button" variant="quiet" size="compact" className="justify-between" onClick={() => addRecipe(recipe)}><span>{recipe.name}</span><span className="text-style-chart-micro text-text-muted">{recipe.servings} porções</span></Button>)}</div>}
            {(formData.items?.length ?? 0) > 0 && <div className="flex flex-wrap gap-1.5">{formData.items?.map((item) => { const itemName = getLibraryItemName(item.sourceId, item.sourceType, foodPool, recipePool); return <Badge key={item.sourceId} variant="secondary" className="gap-1">{itemName}<Button type="button" variant="quiet" size="compact" iconOnly className="ml-1 size-5" aria-label={`Remover ${itemName}`} onClick={() => { update('items', formData.items?.filter((candidate) => candidate.sourceId !== item.sourceId)); update('itemsCount', Math.max(0, (formData.items?.length ?? 1) - 1)); }}><X size={12} aria-hidden="true" /></Button></Badge>; })}</div>}
            {formError && <p role="alert" className="text-style-legal text-error">{formError}</p>}
          </div>
          <AutoKcalSection title="Macronutrientes & Calorias Calculadas" proteinG={formData.proteinG} carbsG={formData.carbsG} fatsG={formData.fatsG} onProteinChange={(value) => update('proteinG', value)} onCarbsChange={(value) => update('carbsG', value)} onFatsChange={(value) => update('fatsG', value)} />
          <div><label htmlFor="ready-meal-items" className={`${textStyle('field-label')} block mb-1`}>Alimentos Incluídos (Resumo)</label><Textarea id="ready-meal-items" rows={2} value={formData.itemsPreview} onChange={(event) => update('itemsPreview', event.target.value)} placeholder="Ex: Ovo cozido (150g), Aveia em flocos (40g), Banana (100g)" className="resize-none" /></div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Refeição (Ctrl+S)"
            >
              Salvar Refeição <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getLibraryItemName(itemId: string, sourceType: 'FOOD' | 'RECIPE', foods: FoodItem[], recipes: Recipe[]): string {
  if (sourceType === 'RECIPE') return recipes.find((recipe) => recipe.id === itemId)?.name ?? itemId;
  return foods.find((food) => food.id === itemId)?.name ?? itemId;
}

