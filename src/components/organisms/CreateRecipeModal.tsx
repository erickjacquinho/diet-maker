'use client';

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectField } from '@/components/atoms';
import { DataTable, type DataTableColumnDef } from './DataTable';
import { MealItemRow, type MealItemRowProps } from './MealItemRow';
import { ConfirmationAlertDialog } from './ConfirmationAlertDialog';
import { FoodSearchModal } from '@/components/organisms/foods/FoodSearchModal';
import { SubstituteFoodModal, type MealFoodToSubstitute } from '@/components/organisms/foods/SubstituteFoodModal';
import type { FoodItem, Recipe, RecipeIngredient } from '@/lib/library-ui-adapter';
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

const mealItemTableColumns: DataTableColumnDef<MealItemRowProps>[] = [
  { id: 'reorder', header: <span className="sr-only">Reordenar</span>, headerClassName: 'h-8 w-10 px-2 text-center', cell: () => null },
  { id: 'name', header: 'Nome', headerClassName: 'h-8 text-left', cell: () => null },
  { id: 'food-actions', header: <span className="sr-only">Ações do alimento</span>, headerClassName: 'h-8 w-20 px-2 text-center', cell: () => null },
  { id: 'quantity', header: 'Quantidade', headerClassName: 'h-8 w-24 text-center', cell: () => null },
  { id: 'protein', header: 'Proteína', headerClassName: 'h-8 w-20 text-right text-macro-protein', cell: () => null },
  { id: 'carbs', header: 'Carboidrato', headerClassName: 'h-8 w-24 text-right text-macro-carbohydrate', cell: () => null },
  { id: 'fats', header: 'Gorduras', headerClassName: 'h-8 w-20 text-right text-macro-fat', cell: () => null },
  { id: 'calories', header: 'Calorias', headerClassName: 'h-8 w-24 text-right text-text-primary', cell: () => null },
  { id: 'remove', header: <span className="sr-only">Remover alimento</span>, headerClassName: 'h-8 w-12 px-2 text-center', cell: () => null },
];

type FoodSearchSelection = Parameters<React.ComponentProps<typeof FoodSearchModal>['onAddFood']>[0];
type RecipeSubstitutionTarget = MealFoodToSubstitute & { index: number };

export function CreateRecipeModal({ open, recipe, onOpenChange, onSave }: CreateRecipeModalProps) {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [substitutionTarget, setSubstitutionTarget] = useState<RecipeSubstitutionTarget | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const foodSearchTriggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const initialFormDataRef = useRef({ ...EMPTY_FORM });

  useSaveShortcut({
    formRef,
    enabled: open && !isDiscardConfirmOpen && !isFoodSearchOpen && !substitutionTarget,
    priority: 10,
  });

  useEffect(() => {
    if (!open) {
      setIsFoodSearchOpen(false);
      setSubstitutionTarget(null);
      setIsDiscardConfirmOpen(false);
      return;
    }
    const nextFormData = recipe
      ? { name: recipe.name, category: recipe.category, servings: recipe.servings, instructions: recipe.instructions, ingredients: [...recipe.ingredients] }
      : { ...EMPTY_FORM, ingredients: [] };
    setFormData(nextFormData);
    initialFormDataRef.current = nextFormData;
    setIsDiscardConfirmOpen(false);
  }, [open, recipe]);

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  const confirmDiscard = () => {
    setFormData({ ...initialFormDataRef.current, ingredients: [...initialFormDataRef.current.ingredients] });
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const handleAddFoods = (selection: FoodSearchSelection) => {
    const foods = Array.isArray(selection) ? selection : [selection];
    setFormData((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        ...foods.flatMap((food) => food.foodId ? [{
          foodId: food.foodId,
          name: food.name,
          amountGrams: food.quantityGrams,
          proteinG: food.protein,
          carbsG: food.carbs,
          fatsG: food.fats,
          kcal: food.kcal,
        }] : []),
      ],
    }));
    setIsFoodSearchOpen(false);
  };

  const updateIngredient = (index: number, amount: number) => {
    const safeAmount = Math.max(1, amount || 1);
    setFormData((current) => {
      const ingredients = current.ingredients.map((ingredient, ingredientIndex) => {
        if (ingredientIndex !== index) return ingredient;
        const ratio = safeAmount / Math.max(1, ingredient.amountGrams);
        return { ...ingredient, amountGrams: safeAmount, proteinG: Math.round(ingredient.proteinG * ratio * 10) / 10, carbsG: Math.round(ingredient.carbsG * ratio * 10) / 10, fatsG: Math.round(ingredient.fatsG * ratio * 10) / 10, kcal: Math.round(ingredient.kcal * ratio) };
      });
      return { ...current, ingredients };
    });
  };

  const removeIngredient = (index: number) => {
    setFormData((current) => ({ ...current, ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index) }));
  };

  const duplicateIngredient = (index: number) => {
    setFormData((current) => {
      const source = current.ingredients[index];
      if (!source) return current;
      const ingredients = [...current.ingredients];
      ingredients.splice(index + 1, 0, { ...source });
      return { ...current, ingredients };
    });
  };

  const ingredientRows: MealItemRowProps[] = formData.ingredients.map((ingredient, index) => ({
    id: `${ingredient.foodId}-${index}`,
    name: ingredient.name,
    kcal: ingredient.kcal,
    protein: ingredient.proteinG,
    carbs: ingredient.carbsG,
    fats: ingredient.fatsG,
    quantityGrams: ingredient.amountGrams,
    onQuantityChange: (amount: number) => updateIngredient(index, amount),
    onRemove: () => removeIngredient(index),
  }));

  const openSubstitution = (index: number) => {
    const item = ingredientRows[index];
    if (!item) return;
    setSubstitutionTarget({
      index,
      mealId: recipe?.id ?? 'new-recipe',
      mealName: formData.name || 'Receita',
      itemId: item.id ?? String(index),
      foodName: item.name,
      quantityGrams: item.quantityGrams,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      kcal: item.kcal,
    });
  };

  const ingredientRowsWithActions = ingredientRows.map((item, index) => ({
    ...item,
    onSubstitute: () => openSubstitution(index),
    onDuplicate: () => duplicateIngredient(index),
  }));

  const handleSubstituteFood = (_mealId: string, _itemId: string, selectedFood: FoodItem) => {
    const target = substitutionTarget;
    if (!target) return;
    const quantity = Math.max(1, target.quantityGrams);
    const ratio = quantity / 100;
    setFormData((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, index) => index === target.index ? {
        foodId: selectedFood.id,
        name: selectedFood.name,
        amountGrams: quantity,
        proteinG: Math.round(selectedFood.proteinG * ratio * 10) / 10,
        carbsG: Math.round(selectedFood.carbsG * ratio * 10) / 10,
        fatsG: Math.round(selectedFood.fatsG * ratio * 10) / 10,
        kcal: Math.round(selectedFood.kcal * ratio),
      } : ingredient),
    }));
    setSubstitutionTarget(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('Digite o nome da receita'); return; }
    if (formData.ingredients.length === 0) { toast.error('Adicione pelo menos 1 ingrediente à receita'); return; }
    onSave({ id: recipe?.id, ...formData, name: formData.name.trim(), servings: Math.max(1, Number(formData.servings) || 1), instructions: formData.instructions.trim() });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open && !isFoodSearchOpen && !substitutionTarget}
        onOpenChange={requestClose}
      >
      <DialogContent
        className="max-w-5xl max-h-dialog overflow-y-auto"
        onPointerDownOutside={(event) => {
          if (hasUnsavedChanges) {
            event.preventDefault();
            setIsDiscardConfirmOpen(true);
          }
        }}
        onEscapeKeyDown={(event) => {
          if (hasUnsavedChanges) {
            event.preventDefault();
            setIsDiscardConfirmOpen(true);
          }
        }}
      >
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
          <div className="flex flex-col gap-2">
            <span className="text-style-legal font-bold text-text-primary tracking-overline">Alimentos Adicionados ({formData.ingredients.length})</span>
            <DataTable
              data={ingredientRowsWithActions}
              columns={mealItemTableColumns}
              getRowId={(item, index) => item.id ?? `recipe-item-${index}`}
              caption="Tabela de alimentos adicionados à receita"
              ariaLabel="Tabela de alimentos adicionados à receita"
              emptyMessage={<span className="flex flex-col items-center justify-center gap-1 text-text-muted"><span className="text-style-legal font-medium">Nenhum alimento adicionado.</span><span className="text-style-caption">Clique em &quot;Adicionar Alimento&quot; para incluir itens da tabela TACO.</span></span>}
              maxHeight="table-modal"
              tableClassName="table-fixed w-full"
              className="overflow-hidden rounded-control border border-border-divider bg-surface"
              renderRow={(item, index) => <MealItemRow {...item} index={index} />}
            />
            <Button
              ref={foodSearchTriggerRef}
              type="button"
              variant="secondary"
              size="standard"
              onClick={() => setIsFoodSearchOpen(true)}
              className="w-full border-dashed border-border-control hover:border-primary/60 hover:bg-surface-hover text-text-primary font-semibold text-style-button-label-compact flex items-center justify-center gap-1.5"
            >
              <Plus size={14} className="text-success" aria-hidden="true" />
              <span>Adicionar Alimento</span>
            </Button>
          </div>
          <div><label htmlFor="recipe-instructions" className={`${textStyle('field-label')} block mb-1`}>Modo de Preparo / Orientações</label><Textarea id="recipe-instructions" rows={3} value={formData.instructions} onChange={(event) => setFormData((current) => ({ ...current, instructions: event.target.value }))} placeholder="Descreva o passo a passo do preparo da receita..." className="resize-none" /></div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" size="compact" onClick={() => requestClose(false)} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              className="flex-1"
              aria-keyshortcuts="Control+s Meta+s"
              title="Salvar Receita (Ctrl+S)"
            >
              Salvar Receita <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
      <FoodSearchModal
        isOpen={open && isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        mealTitle={formData.name || 'Receita'}
        onAddFood={handleAddFoods}
        enableLibrarySources
        returnFocusRef={foodSearchTriggerRef}
      />
      <SubstituteFoodModal
        isOpen={open && substitutionTarget !== null}
        onClose={() => setSubstitutionTarget(null)}
        foodToSubstitute={substitutionTarget}
        onSubstituteFood={handleSubstituteFood}
      />
      <ConfirmationAlertDialog
        open={isDiscardConfirmOpen}
        onOpenChange={setIsDiscardConfirmOpen}
        title="Descartar alterações?"
        description="Você possui alterações não salvas nesta receita. Deseja descartá-las e sair?"
        confirmLabel="Sim, descartar"
        cancelLabel="Continuar editando"
        confirmVariant="destructive"
        overlayLayer="modal"
        onConfirm={confirmDiscard}
      />
    </>
  );
}
