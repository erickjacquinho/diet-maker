'use client';

import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable, type DataTableColumnDef } from './DataTable';
import { MealItemRow, type MealItemRowProps } from './MealItemRow';
import { MacroProportionBar } from './MacroProportionBar';
import { ConfirmationAlertDialog } from './ConfirmationAlertDialog';
import { FoodSearchModal } from '@/components/organisms/foods/FoodSearchModal';
import { SubstituteFoodModal, type MealFoodToSubstitute } from '@/components/organisms/foods/SubstituteFoodModal';
import { textStyle } from '@/design-system';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import type { ReadyMealItemInput } from '@/lib/domain/library/library-model';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { calculateRecipeNutrients, listTacoFoodItems, toFoodItem, toRecipe, type FoodItem, type ReadyMeal, type Recipe } from '@/lib/library-ui-adapter';

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
type ReadyMealSubstitutionTarget = MealFoodToSubstitute & { index: number };

export function CreateReadyMealModal({ open, meal, onOpenChange, onSave }: CreateReadyMealModalProps) {
  const [formData, setFormData] = useState<ReadyMealFormData>({ ...INITIAL_FORM });
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const foodSearchTriggerRef = useRef<HTMLButtonElement>(null);
  const [foodPool, setFoodPool] = useState<FoodItem[]>(() => listTacoFoodItems());
  const [recipePool, setRecipePool] = useState<Recipe[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [substitutionTarget, setSubstitutionTarget] = useState<ReadyMealSubstitutionTarget | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initialFormDataRef = useRef<ReadyMealFormData>({ ...INITIAL_FORM });

  React.useEffect(() => {
    if (!open) {
      setIsFoodSearchOpen(false);
      setSubstitutionTarget(null);
      setIsDiscardConfirmOpen(false);
      return;
    }
    const nextFormData = meal ? {
      ...INITIAL_FORM,
      name: meal.name,
      suggestedTime: meal.suggestedTime,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatsG: meal.fatsG,
      itemsCount: meal.itemsCount,
      itemsPreview: meal.itemsPreview,
      items: meal.items ? [...meal.items] : [],
    } : { ...INITIAL_FORM, items: [] };
    setFormData(nextFormData);
    initialFormDataRef.current = nextFormData;
    setIsDiscardConfirmOpen(false);
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
    enabled: open && !isDiscardConfirmOpen && !isFoodSearchOpen && !substitutionTarget,
    priority: 10,
  });
  const update = <K extends keyof ReadyMealFormData>(key: K, value: ReadyMealFormData[K]) => setFormData((current) => ({ ...current, [key]: value }));
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  const confirmDiscard = () => {
    setFormData({ ...initialFormDataRef.current, items: initialFormDataRef.current.items?.map((item) => ({ ...item })) });
    setFormError(null);
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const handleAddFoods = (selection: FoodSearchSelection) => {
    const foods = Array.isArray(selection) ? selection : [selection];
    setFormData((current) => {
      const items = current.items ?? [];
      const additions = foods.flatMap((food) => {
        if (!food.foodId || items.some((item) => item.sourceType === 'FOOD' && item.sourceId === food.foodId)) return [];
        return [{ sourceType: 'FOOD' as const, sourceId: food.foodId, quantity: String(food.quantityGrams || 100), unit: 'g' as const }];
      });
      const nextItems = [...items, ...additions];
      return { ...current, items: nextItems, itemsCount: nextItems.length };
    });
    setFormError(null);
    setIsFoodSearchOpen(false);
  };

  const updateFoodQuantity = (index: number, amount: number) => {
    const safeAmount = Math.max(1, amount || 1);
    setFormData((current) => ({
      ...current,
      items: (current.items ?? []).map((item, itemIndex) => itemIndex === index && item.sourceType === 'FOOD'
        ? { ...item, quantity: String(safeAmount), unit: 'g' }
        : item),
    }));
  };

  const updateRecipePortions = (index: number, portions: number) => {
    const safePortions = Math.max(0.1, portions || 1);
    setFormData((current) => ({
      ...current,
      items: (current.items ?? []).map((item, itemIndex) => itemIndex === index && item.sourceType === 'RECIPE'
        ? { ...item, recipePortions: String(safePortions) }
        : item),
    }));
  };

  const removeItem = (index: number) => {
    setFormData((current) => {
      const items = (current.items ?? []).filter((_, itemIndex) => itemIndex !== index);
      return { ...current, items, itemsCount: items.length };
    });
  };

  const duplicateItem = (index: number) => {
    setFormData((current) => {
      const items = current.items ?? [];
      const source = items[index];
      if (!source) return current;
      const nextItems = [...items];
      nextItems.splice(index + 1, 0, { ...source });
      return { ...current, items: nextItems, itemsCount: nextItems.length };
    });
  };

  const tableItems: MealItemRowProps[] = (formData.items ?? []).map((item, index) => {
    if (item.sourceType === 'RECIPE') {
      const recipe = recipePool.find((candidate) => candidate.id === item.sourceId);
      const nutrients = recipe ? calculateRecipeNutrients(recipe.ingredients, recipe.servings) : null;
      const portions = Math.max(0.1, Number(item.recipePortions) || 1);
      return {
        id: `${item.sourceType}-${item.sourceId}-${index}`,
        name: recipe?.name ?? item.sourceId,
        kcal: Math.round((nutrients?.portionKcal ?? 0) * portions),
        protein: Math.round((nutrients?.portionProteinG ?? 0) * portions * 10) / 10,
        carbs: Math.round((nutrients?.portionCarbsG ?? 0) * portions * 10) / 10,
        fats: Math.round((nutrients?.portionFatsG ?? 0) * portions * 10) / 10,
        quantityGrams: portions,
        quantityUnit: 'porções',
        onQuantityChange: (value) => updateRecipePortions(index, value),
        onRemove: () => removeItem(index),
      };
    }

    const food = foodPool.find((candidate) => candidate.id === item.sourceId);
    const quantity = Math.max(1, Number(item.quantity) || 100);
    const ratio = quantity / 100;
    return {
      id: `${item.sourceType}-${item.sourceId}-${index}`,
      name: food?.name ?? item.sourceId,
      kcal: Math.round((food?.kcal ?? 0) * ratio),
      protein: Math.round((food?.proteinG ?? 0) * ratio * 10) / 10,
      carbs: Math.round((food?.carbsG ?? 0) * ratio * 10) / 10,
      fats: Math.round((food?.fatsG ?? 0) * ratio * 10) / 10,
      quantityGrams: quantity,
      onQuantityChange: (value) => updateFoodQuantity(index, value),
      onRemove: () => removeItem(index),
    };
  });

  const openSubstitution = (index: number) => {
    const item = tableItems[index];
    if (!item) return;
    setSubstitutionTarget({
      index,
      mealId: formData.id ?? 'new-ready-meal',
      mealName: formData.name || 'Refeição',
      itemId: item.id ?? String(index),
      foodName: item.name,
      quantityGrams: item.quantityGrams,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      kcal: item.kcal,
    });
  };

  const tableItemsWithActions = tableItems.map((item, index) => ({
    ...item,
    onSubstitute: () => openSubstitution(index),
    onDuplicate: () => duplicateItem(index),
  }));

  const handleSubstituteFood = (_mealId: string, _itemId: string, selectedFood: FoodItem) => {
    const target = substitutionTarget;
    if (!target) return;
    setFormData((current) => ({
      ...current,
      items: (current.items ?? []).map((item, index) => index === target.index
        ? { sourceType: 'FOOD' as const, sourceId: selectedFood.id, quantity: String(target.quantityGrams), unit: 'g' as const }
        : item),
    }));
    setSubstitutionTarget(null);
  };

  const mealTotals = tableItems.reduce((totals, item) => {
    totals.proteinG += item.protein;
    totals.carbsG += item.carbs;
    totals.fatsG += item.fats;
    totals.kcal += item.kcal;
    return totals;
  }, { proteinG: 0, carbsG: 0, fatsG: 0, kcal: 0 });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.items?.length) {
      setFormError('Adicione pelo menos um alimento ao bloco.');
      return;
    }
    onSave({ ...formData, id: meal?.id, name: formData.name.trim(), proteinG: mealTotals.proteinG, carbsG: mealTotals.carbsG, fatsG: mealTotals.fatsG, itemsPreview: tableItems.map((item) => item.name).join(', '), items: formData.items });
    setFormData({ ...INITIAL_FORM });
    setFormError(null);
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
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="font-bold text-style-body text-text-primary">{meal ? 'Editar Bloco de Refeição' : 'Nova Refeição'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><label htmlFor="ready-meal-name" className={`${textStyle('field-label')} block mb-1`}>Nome da Refeição</label><Input id="ready-meal-name" required value={formData.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Café da Manhã Proteico Padrão" /></div>
            <div><label htmlFor="ready-meal-time" className={`${textStyle('field-label')} block mb-1`}>Horário</label><Input id="ready-meal-time" type="time" value={formData.suggestedTime} onChange={(event) => update('suggestedTime', event.target.value)} /></div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-style-legal font-bold text-text-primary tracking-overline">Alimentos Adicionados ({tableItems.length})</span>
            <DataTable
              data={tableItemsWithActions}
              columns={mealItemTableColumns}
              getRowId={(item, index) => item.id ?? `ready-meal-item-${index}`}
              caption="Tabela de alimentos adicionados à refeição"
              ariaLabel="Tabela de alimentos adicionados à refeição"
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
            <MacroProportionBar
              proteinG={mealTotals.proteinG}
              carbsG={mealTotals.carbsG}
              fatsG={mealTotals.fatsG}
              kcal={mealTotals.kcal}
              title="Total da Refeição"
              emptyMessage="Adicione alimentos para calcular os macros da refeição."
            />
            {formError && <p role="alert" className="text-style-legal text-error">{formError}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" size="compact" onClick={() => requestClose(false)} className="flex-1">Cancelar</Button>
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
      <FoodSearchModal
        isOpen={open && isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        mealTitle={formData.name || 'Refeição'}
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
        description="Você possui alterações não salvas nesta refeição. Deseja descartá-las e sair?"
        confirmLabel="Sim, descartar"
        cancelLabel="Continuar editando"
        confirmVariant="destructive"
        overlayLayer="modal"
        onConfirm={confirmDiscard}
      />
    </>
  );
}

