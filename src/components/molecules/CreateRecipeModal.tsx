'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AutoKcalSection } from './AutoKcalSection';
import { RecipeIngredientRow } from './RecipeIngredientRow';
import { TacoSearchInput } from './TacoSearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { calculateRecipeNutrients, type Recipe, type RecipeIngredient } from '@/lib/recipesStore';
import { searchTacoFoods, type FoodItem } from '@/lib/tacoStore';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface CreateRecipeModalProps {
  open: boolean;
  recipe: Recipe | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { id?: string; name: string; category: string; servings: number; instructions: string; ingredients: RecipeIngredient[] }) => void;
}

const CATEGORIES = ['Café da Manhã', 'Almoço & Jantar', 'Lanches & Snacks', 'Sobremesas Fit', 'Bebidas & Shakes'];
const EMPTY_FORM = { name: '', category: CATEGORIES[0], servings: 2, instructions: '', ingredients: [] as RecipeIngredient[] };

export function CreateRecipeModal({ open, recipe, onOpenChange, onSave }: CreateRecipeModalProps) {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [foodQuery, setFoodQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open,
    priority: 10,
  });

  useEffect(() => {
    if (!open) return;
    setFormData(recipe ? { name: recipe.name, category: recipe.category, servings: recipe.servings, instructions: recipe.instructions, ingredients: [...recipe.ingredients] } : { ...EMPTY_FORM, ingredients: [] });
    setFoodQuery('');
    setSearchResults([]);
  }, [open, recipe]);

  const summary = useMemo(() => calculateRecipeNutrients(formData.ingredients, formData.servings), [formData.ingredients, formData.servings]);

  const handleSearch = (query: string) => {
    setFoodQuery(query);
    setSearchResults(query.trim().length >= 2 ? searchTacoFoods(query).slice(0, 5) : []);
  };

  const addIngredient = (food: FoodItem) => {
    setFormData((current) => ({ ...current, ingredients: [...current.ingredients, { foodId: food.id, name: food.name, amountGrams: 100, proteinG: food.proteinG, carbsG: food.carbsG, fatsG: food.fatsG, kcal: food.kcal }] }));
    setFoodQuery('');
    setSearchResults([]);
  };

  const updateIngredient = (index: number, amount: number) => {
    const safeAmount = Math.max(1, amount || 1);
    setFormData((current) => {
      const ingredients = current.ingredients.map((ingredient, ingredientIndex) => {
        if (ingredientIndex !== index) return ingredient;
        const reference = searchTacoFoods(ingredient.name)[0];
        const ratio = safeAmount / (reference ? 100 : ingredient.amountGrams || 100);
        return { ...ingredient, amountGrams: safeAmount, proteinG: Math.round((reference?.proteinG ?? ingredient.proteinG) * ratio * 10) / 10, carbsG: Math.round((reference?.carbsG ?? ingredient.carbsG) * ratio * 10) / 10, fatsG: Math.round((reference?.fatsG ?? ingredient.fatsG) * ratio * 10) / 10, kcal: Math.round((reference?.kcal ?? ingredient.kcal) * ratio) };
      });
      return { ...current, ingredients };
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('Digite o nome da receita'); return; }
    if (formData.ingredients.length === 0) { toast.error('Adicione pelo menos 1 ingrediente à receita'); return; }
    onSave({ id: recipe?.id, ...formData, name: formData.name.trim(), servings: Math.max(1, Number(formData.servings) || 1), instructions: formData.instructions.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-screen overflow-y-auto">
        <DialogHeader className="border-b border-border-subtle pb-3"><DialogTitle className="font-bold text-style-body text-text-primary">{recipe ? 'Editar Receita Culinária' : 'Nova Receita Culinária'}</DialogTitle></DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div><label htmlFor="recipe-name" className={`${textStyle('field-label')} block mb-1`}>Nome da Receita</label><Input id="recipe-name" required value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Ex: Bolo de Banana com Aveia e Whey" /></div>
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              id="recipe-category"
              label="Categoria"
              value={formData.category}
              onValueChange={(value) => setFormData((current) => ({ ...current, category: value }))}
              layer="modal"
              options={CATEGORIES.map((category) => ({ value: category, label: category }))}
            />
            <div><label htmlFor="recipe-servings" className={`${textStyle('field-label')} block mb-1`}>Rendimento (Porções)</label><Input id="recipe-servings" type="number" min={1} value={formData.servings} onChange={(event) => setFormData((current) => ({ ...current, servings: Number(event.target.value) }))} /></div>
          </div>
          <div className="flex flex-col gap-2"><label htmlFor="recipe-ingredient-search" className={`${textStyle('field-label')} block`}>Adicionar Ingredientes</label><div className="relative"><TacoSearchInput id="recipe-ingredient-search" value={foodQuery} onChange={(event) => handleSearch(event.target.value)} placeholder="Buscar ingrediente (ex: ovo, frango, aveia)..." />{searchResults.length > 0 && <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border-subtle rounded-control z-dropdown max-h-48 overflow-y-auto p-1 flex flex-col gap-1">{searchResults.map((food) => <Button key={food.id} type="button" variant="quiet" size="standard" onClick={() => addIngredient(food)} className="w-full text-left justify-between p-2"><span className="font-bold text-text-primary truncate">{food.name}</span><span className="text-style-legal text-macro-kcal font-bold shrink-0">{food.kcal} kcal/100g</span></Button>)}</div>}</div></div>
          {formData.ingredients.length > 0 && <div className="flex flex-col gap-2"><span className="text-style-legal font-bold text-text-primary tracking-overline">Ingredientes Adicionados ({formData.ingredients.length})</span><div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">{formData.ingredients.map((ingredient, index) => <RecipeIngredientRow key={`${ingredient.foodId}-${index}`} ingredient={ingredient} onAmountChange={(amount) => updateIngredient(index, amount)} onRemove={() => setFormData((current) => ({ ...current, ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index) }))} />)}</div></div>}
          <AutoKcalSection title={`Macros Calculados por Porção (1 de ${formData.servings})`} proteinG={summary.portionProteinG} carbsG={summary.portionCarbsG} fatsG={summary.portionFatsG} readOnly />
          <div><label htmlFor="recipe-instructions" className={`${textStyle('field-label')} block mb-1`}>Modo de Preparo / Orientações</label><Textarea id="recipe-instructions" rows={3} value={formData.instructions} onChange={(event) => setFormData((current) => ({ ...current, instructions: event.target.value }))} placeholder="Descreva o passo a passo do preparo da receita..." className="resize-none" /></div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" size="compact" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Receita (Ctrl+S)"
            >
              Salvar Receita <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
