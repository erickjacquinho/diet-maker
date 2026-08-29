import { useCallback, useRef, useState } from 'react';
import { DietMeal, DietItem } from '@/lib/dietStore';
import { FoodItem } from '@/lib/tacoStore';
import {
  appendMealVariation,
  cloneMealGroupWithFreshIds,
  getActiveMealVariation,
  getActiveMealVariationId as resolveActiveMealVariationId,
  getBaseMealVariationId,
  removeMealVariation,
  updateMealVariationItems,
} from '@/lib/mealVariations';
import { toast } from 'sonner';

const createPastedMealItems = (items: DietItem[]) => items.map((item, index) => ({
  ...item,
  id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
}));

export function useDietMealActions({
  foodSearchMealIndex,
  currentMeals,
  updateActiveMeals,
  getActiveMealVariationId,
  onSelectMealVariation,
}: {
  foodSearchMealIndex: number | null;
  currentMeals: DietMeal[];
  updateActiveMeals: (updater: (prevMeals: DietMeal[]) => DietMeal[]) => void;
  getActiveMealVariationId?: (mealId: string, meal?: DietMeal) => string;
  onSelectMealVariation?: (mealId: string, variationId: string) => void;
}) {
  const [copiedMealItems, setCopiedMealItems] = useState<DietItem[] | null>(null);
  const lastDeletedItemRef = useRef<{
    mealId: string;
    item: DietItem;
    index: number;
    variationId: string;
    token: string;
  } | null>(null);
  const lastDeletedMealRef = useRef<{
    meal: DietMeal;
    index: number;
    token: string;
  } | null>(null);

  const resolveActiveId = useCallback(
    (meal: DietMeal) => getActiveMealVariationId?.(meal.id, meal) || resolveActiveMealVariationId(meal),
    [getActiveMealVariationId]
  );

  const handleAddMeal = useCallback(() => {
    updateActiveMeals((prev) => [
      ...prev,
      {
        id: `meal-${Date.now()}`,
        name: `Refeição ${prev.length + 1}`,
        time: '12:00',
        items: [],
      },
    ]);
    toast.success('Nova refeição adicionada');
  }, [updateActiveMeals]);

  const handleRemoveMeal = useCallback(
    (mealId: string) => {
      const mealIndex = currentMeals.findIndex((meal) => meal.id === mealId);
      const meal = mealIndex >= 0 ? currentMeals[mealIndex] : undefined;
      if (!meal) return;

      const deletedMeal: DietMeal = {
        ...meal,
        items: meal.items.map((item) => ({ ...item })),
        variations: meal.variations?.map((variation) => ({
          ...variation,
          items: variation.items.map((item) => ({ ...item })),
        })),
      };
      const deletionToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      lastDeletedMealRef.current = {
        meal: deletedMeal,
        index: mealIndex,
        token: deletionToken,
      };

      updateActiveMeals((prev) => prev.filter((currentMeal) => currentMeal.id !== mealId));
      toast.success(`Refeição "${meal.name}" removida.`, {
        duration: 6000,
        action: {
          label: 'Desfazer',
          onClick: () => {
            const deleted = lastDeletedMealRef.current;
            if (!deleted || deleted.token !== deletionToken) return;

            updateActiveMeals((prev) => {
              if (prev.some((currentMeal) => currentMeal.id === deleted.meal.id)) return prev;

              const restoredMeals = [...prev];
              restoredMeals.splice(Math.min(deleted.index, restoredMeals.length), 0, deleted.meal);
              return restoredMeals;
            });
            lastDeletedMealRef.current = null;
          },
        },
      });
    },
    [currentMeals, updateActiveMeals]
  );

  const handleUpdateMealHeader = useCallback(
    (mealId: string, updates: { name?: string; time?: string }) => {
      updateActiveMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, ...updates } : m)));
    },
    [updateActiveMeals]
  );

  const handleAddFoodToMeal = useCallback(
    (itemOrItems: Omit<DietItem, 'id'> | Array<Omit<DietItem, 'id'>>) => {
      if (foodSearchMealIndex === null) return;
      const itemsList = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      if (itemsList.length === 0) return;

      const newItems: DietItem[] = itemsList.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        quantityGrams: item.quantityGrams || item.grams || 100,
        protein: item.protein ?? item.proteinG ?? 0,
        carbs: item.carbs ?? item.carbsG ?? 0,
        fats: item.fats ?? item.fatsG ?? item.fatG ?? 0,
      }));

      updateActiveMeals((prev) =>
        prev.map((meal, idx) => (
          idx === foodSearchMealIndex
            ? updateMealVariationItems(meal, resolveActiveId(meal), (items) => [...items, ...newItems])
            : meal
        ))
      );

      if (newItems.length === 1) {
        toast.success(`${newItems[0].name} adicionado à refeição`);
      } else {
        toast.success(`${newItems.length} alimentos adicionados à refeição`);
      }
    },
    [foodSearchMealIndex, resolveActiveId, updateActiveMeals]
  );

  const handleUpdateItemGram = useCallback(
    (mealId: string, itemId: string, newGrams: number) => {
      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return updateMealVariationItems(meal, resolveActiveId(meal), (items) => items.map((item) => {
            if (item.id !== itemId) return item;
            const currentGrams = item.quantityGrams || item.grams || 100;
            const ratio = newGrams > 0 ? newGrams / currentGrams : 1;
            const p = item.protein ?? item.proteinG ?? 0;
            const c = item.carbs ?? item.carbsG ?? 0;
            const f = item.fats ?? item.fatsG ?? item.fatG ?? 0;
            return {
              ...item,
              quantityGrams: newGrams,
              grams: newGrams,
              kcal: Math.round(item.kcal * ratio),
              protein: Math.round(p * ratio * 10) / 10,
              carbs: Math.round(c * ratio * 10) / 10,
              fats: Math.round(f * ratio * 10) / 10,
            };
          }));
        })
      );
    },
    [resolveActiveId, updateActiveMeals]
  );

  const handleSubstituteFood = useCallback(
    (mealId: string, itemId: string, selectedFood: FoodItem) => {
      let substitutedFoodName = '';
      let targetGrams = 100;

      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return updateMealVariationItems(meal, resolveActiveId(meal), (items) => items.map((item) => {
            if (item.id !== itemId) return item;
            targetGrams = item.quantityGrams || item.grams || 100;
            const ratio = targetGrams / 100;
            const formattedName =
              selectedFood.preparo && selectedFood.preparo !== 'inNatura'
                ? `${selectedFood.name} (${selectedFood.preparo})`
                : selectedFood.name;

            substitutedFoodName = formattedName;
            const rawFat = selectedFood.fatG ?? selectedFood.fatsG ?? 0;

            return {
              ...item,
              foodId: selectedFood.id,
              name: formattedName,
              quantityGrams: targetGrams,
              grams: targetGrams,
              kcal: Math.round(selectedFood.kcal * ratio),
              protein: Math.round(selectedFood.proteinG * ratio * 10) / 10,
              carbs: Math.round(selectedFood.carbsG * ratio * 10) / 10,
              fats: Math.round(rawFat * ratio * 10) / 10,
            };
          }));
        })
      );

      if (substitutedFoodName) {
        toast.success(`Alimento substituído por "${substitutedFoodName}" mantendo ${targetGrams}g`);
      }
    },
    [resolveActiveId, updateActiveMeals]
  );

  const handleRemoveItem = useCallback(
    (mealId: string, itemId: string) => {
      const meal = currentMeals.find((currentMeal) => currentMeal.id === mealId);
      const activeVariationId = meal ? resolveActiveId(meal) : '';
      const activeItems = meal ? getActiveMealVariation(meal, activeVariationId).items : [];
      const itemIndex = activeItems.findIndex((item) => item.id === itemId);
      const item = itemIndex >= 0 ? activeItems[itemIndex] : undefined;

      if (!item || !meal) return;

      const deletionToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      lastDeletedItemRef.current = {
        mealId,
        item: { ...item },
        index: itemIndex,
        variationId: activeVariationId,
        token: deletionToken,
      };

      updateActiveMeals((prev) =>
        prev.map((currentMeal) => (
          currentMeal.id === mealId
            ? updateMealVariationItems(currentMeal, activeVariationId, (items) => items.filter((i) => i.id !== itemId))
            : currentMeal
        ))
      );

      toast.success(`${item.name} removido da refeição.`, {
        duration: 6000,
        action: {
          label: 'Desfazer',
          onClick: () => {
            const deletedItem = lastDeletedItemRef.current;
            if (!deletedItem || deletedItem.token !== deletionToken) return;

            updateActiveMeals((prev) =>
              prev.map((currentMeal) => {
                if (currentMeal.id !== deletedItem.mealId) return currentMeal;
                return updateMealVariationItems(currentMeal, deletedItem.variationId, (items) => {
                  const restoredItems = [...items];
                  restoredItems.splice(Math.min(deletedItem.index, restoredItems.length), 0, deletedItem.item);
                  return restoredItems;
                });
              })
            );
            lastDeletedItemRef.current = null;
          },
        },
      });
    },
    [currentMeals, resolveActiveId, updateActiveMeals]
  );

  const handleDuplicateMeal = useCallback(
    (mealId: string) => {
      const sourceMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!sourceMeal) return;

      const clonedMeal = {
        ...cloneMealGroupWithFreshIds(sourceMeal),
        name: `${sourceMeal.name} (Cópia)`,
      };
      updateActiveMeals((prev) => {
        const mealIndex = prev.findIndex((meal) => meal.id === mealId);
        if (mealIndex < 0) return prev;
        const nextMeals = [...prev];
        nextMeals.splice(mealIndex + 1, 0, clonedMeal);
        return nextMeals;
      });
      onSelectMealVariation?.(clonedMeal.id, getBaseMealVariationId(clonedMeal.id));
      toast.success('Refeição duplicada com sucesso!');
    },
    [currentMeals, onSelectMealVariation, updateActiveMeals]
  );

  const handleCopyMeal = useCallback(
    (mealId: string) => {
      const sourceMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!sourceMeal) return;
      const activeItems = getActiveMealVariation(sourceMeal, resolveActiveId(sourceMeal)).items;
      if (activeItems.length === 0) return;

      setCopiedMealItems(activeItems.map((item) => ({ ...item })));
      toast.success(`${activeItems.length} alimento${activeItems.length === 1 ? '' : 's'} copiado${activeItems.length === 1 ? '' : 's'} da refeição`);
    },
    [currentMeals, resolveActiveId]
  );

  const handlePasteMeal = useCallback(
    (mealId: string) => {
      if (!copiedMealItems || copiedMealItems.length === 0) return;

      const pastedItems = createPastedMealItems(copiedMealItems);

      updateActiveMeals((prev) =>
        prev.map((meal) => (
          meal.id === mealId
            ? updateMealVariationItems(meal, resolveActiveId(meal), (items) => [...items, ...pastedItems])
            : meal
        ))
      );

      toast.success(`${pastedItems.length} alimento${pastedItems.length === 1 ? '' : 's'} colado${pastedItems.length === 1 ? '' : 's'} na refeição`);
    },
    [copiedMealItems, resolveActiveId, updateActiveMeals]
  );

  const handlePasteMealAndReplace = useCallback(
    (mealId: string) => {
      if (!copiedMealItems || copiedMealItems.length === 0) return;

      const targetMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!targetMeal) return;

      const activeVariationId = resolveActiveId(targetMeal);

      const pastedItems = createPastedMealItems(copiedMealItems);
      updateActiveMeals((prev) =>
        prev.map((meal) => (
          meal.id === mealId
            ? updateMealVariationItems(meal, activeVariationId, () => pastedItems)
            : meal
        ))
      );

      toast.success(`${pastedItems.length} alimento${pastedItems.length === 1 ? '' : 's'} colado${pastedItems.length === 1 ? '' : 's'} e substituído${pastedItems.length === 1 ? '' : 's'} na refeição`);
    },
    [copiedMealItems, currentMeals, resolveActiveId, updateActiveMeals]
  );

  const handleDuplicateItem = useCallback(
    (mealId: string, itemId: string) => {
      let duplicatedItemName = '';

      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;

          return updateMealVariationItems(meal, resolveActiveId(meal), (items) => {
            const sourceIndex = items.findIndex((item) => item.id === itemId);
            const sourceItem = items[sourceIndex];
            if (!sourceItem) return items;

            duplicatedItemName = sourceItem.name;
            const nextItems = [...items];
            nextItems.splice(sourceIndex + 1, 0, {
              ...sourceItem,
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            });
            return nextItems;
          });
        })
      );

      if (duplicatedItemName) {
        toast.success(`"${duplicatedItemName}" duplicado na refeição`);
      }
    },
    [resolveActiveId, updateActiveMeals]
  );

  const handleReorderItems = useCallback(
    (mealId: string, sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return updateMealVariationItems(meal, resolveActiveId(meal), (items) => {
            const nextItems = [...items];
            const [moved] = nextItems.splice(sourceIndex, 1);
            if (!moved) return items;
            nextItems.splice(targetIndex, 0, moved);
            return nextItems;
          });
        })
      );
    },
    [resolveActiveId, updateActiveMeals]
  );

  const handleAddMealVariation = useCallback(
    (mealId: string) => {
      const sourceMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!sourceMeal) return;

      const result = appendMealVariation(sourceMeal, resolveActiveId(sourceMeal));
      if (!result.changed) {
        toast.error('Esta refeição já possui o limite de 5 variações.');
        return;
      }

      updateActiveMeals((prev) => prev.map((meal) => (meal.id === mealId ? result.meal : meal)));
      onSelectMealVariation?.(mealId, result.variationId);
      toast.success('Nova variação adicionada à refeição');
    },
    [currentMeals, onSelectMealVariation, resolveActiveId, updateActiveMeals]
  );

  const handleRemoveMealVariation = useCallback(
    (mealId: string) => {
      const sourceMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!sourceMeal) return;

      const result = removeMealVariation(sourceMeal, resolveActiveId(sourceMeal));
      if (!result.removed) return;

      updateActiveMeals((prev) => prev.map((meal) => (meal.id === mealId ? result.meal : meal)));
      onSelectMealVariation?.(mealId, result.activeVariationId);
      toast.success('Variação removida da refeição');
    },
    [currentMeals, onSelectMealVariation, resolveActiveId, updateActiveMeals]
  );

  return {
    handleAddMeal,
    handleDuplicateMeal,
    handleCopyMeal,
    handlePasteMeal,
    handlePasteMealAndReplace,
    hasCopiedMeal: copiedMealItems !== null && copiedMealItems.length > 0,
    handleDuplicateItem,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleSubstituteFood,
    handleRemoveItem,
    handleReorderItems,
    handleAddMealVariation,
    handleRemoveMealVariation,
  };
}
