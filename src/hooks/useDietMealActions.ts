import { useCallback, useRef, useState } from 'react';
import { DietMeal, DietItem } from '@/lib/dietStore';
import { FoodItem } from '@/lib/tacoStore';
import { toast } from 'sonner';

export function useDietMealActions({
  foodSearchMealIndex,
  currentMeals,
  updateActiveMeals,
}: {
  foodSearchMealIndex: number | null;
  currentMeals: DietMeal[];
  updateActiveMeals: (updater: (prevMeals: DietMeal[]) => DietMeal[]) => void;
}) {
  const [copiedMealItems, setCopiedMealItems] = useState<DietItem[] | null>(null);
  const lastDeletedItemRef = useRef<{
    mealId: string;
    item: DietItem;
    index: number;
    token: string;
  } | null>(null);

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
      updateActiveMeals((prev) => prev.filter((m) => m.id !== mealId));
      toast.info('Refeição removida');
    },
    [updateActiveMeals]
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
        prev.map((meal, idx) => (idx === foodSearchMealIndex ? { ...meal, items: [...meal.items, ...newItems] } : meal))
      );

      if (newItems.length === 1) {
        toast.success(`${newItems[0].name} adicionado à refeição`);
      } else {
        toast.success(`${newItems.length} alimentos adicionados à refeição`);
      }
    },
    [foodSearchMealIndex, updateActiveMeals]
  );

  const handleUpdateItemGram = useCallback(
    (mealId: string, itemId: string, newGrams: number) => {
      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return {
            ...meal,
            items: meal.items.map((item) => {
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
            }),
          };
        })
      );
    },
    [updateActiveMeals]
  );

  const handleSubstituteFood = useCallback(
    (mealId: string, itemId: string, selectedFood: FoodItem) => {
      let substitutedFoodName = '';
      let targetGrams = 100;

      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          return {
            ...meal,
            items: meal.items.map((item) => {
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
            }),
          };
        })
      );

      if (substitutedFoodName) {
        toast.success(`Alimento substituído por "${substitutedFoodName}" mantendo ${targetGrams}g`);
      }
    },
    [updateActiveMeals]
  );

  const handleRemoveItem = useCallback(
    (mealId: string, itemId: string) => {
      const meal = currentMeals.find((currentMeal) => currentMeal.id === mealId);
      const itemIndex = meal?.items.findIndex((item) => item.id === itemId) ?? -1;
      const item = itemIndex >= 0 ? meal?.items[itemIndex] : undefined;

      if (!item || !meal) return;

      const deletionToken = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      lastDeletedItemRef.current = {
        mealId,
        item: { ...item },
        index: itemIndex,
        token: deletionToken,
      };

      updateActiveMeals((prev) =>
        prev.map((meal) => (meal.id === mealId ? { ...meal, items: meal.items.filter((i) => i.id !== itemId) } : meal))
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
                const restoredItems = [...currentMeal.items];
                restoredItems.splice(Math.min(deletedItem.index, restoredItems.length), 0, deletedItem.item);
                return { ...currentMeal, items: restoredItems };
              })
            );
            lastDeletedItemRef.current = null;
          },
        },
      });
    },
    [currentMeals, updateActiveMeals]
  );

  const handleDuplicateMeal = useCallback(
    (mealId: string) => {
      updateActiveMeals((prev) => {
        const mealToDuplicate = prev.find((m) => m.id === mealId);
        if (!mealToDuplicate) return prev;
        const newMealId = `meal-${Date.now()}`;
        const clonedMeal: DietMeal = {
          ...mealToDuplicate,
          id: newMealId,
          name: `${mealToDuplicate.name} (Cópia)`,
          items: mealToDuplicate.items.map((item, idx) => ({
            ...item,
            id: `item-${Date.now()}-${idx}`,
          })),
        };
        const mealIndex = prev.findIndex((m) => m.id === mealId);
        const nextMeals = [...prev];
        nextMeals.splice(mealIndex + 1, 0, clonedMeal);
        return nextMeals;
      });
      toast.success('Refeição duplicada com sucesso!');
    },
    [updateActiveMeals]
  );

  const handleCopyMeal = useCallback(
    (mealId: string) => {
      const sourceMeal = currentMeals.find((meal) => meal.id === mealId);
      if (!sourceMeal || sourceMeal.items.length === 0) return;

      setCopiedMealItems(sourceMeal.items.map((item) => ({ ...item })));
      toast.success(`${sourceMeal.items.length} alimento${sourceMeal.items.length === 1 ? '' : 's'} copiado${sourceMeal.items.length === 1 ? '' : 's'} da refeição`);
    },
    [currentMeals]
  );

  const handlePasteMeal = useCallback(
    (mealId: string) => {
      if (!copiedMealItems || copiedMealItems.length === 0) return;

      const pastedItems = copiedMealItems.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      }));

      updateActiveMeals((prev) =>
        prev.map((meal) => (
          meal.id === mealId
            ? { ...meal, items: [...meal.items, ...pastedItems] }
            : meal
        ))
      );

      toast.success(`${pastedItems.length} alimento${pastedItems.length === 1 ? '' : 's'} colado${pastedItems.length === 1 ? '' : 's'} na refeição`);
    },
    [copiedMealItems, updateActiveMeals]
  );

  const handleDuplicateItem = useCallback(
    (mealId: string, itemId: string) => {
      let duplicatedItemName = '';

      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;

          const sourceIndex = meal.items.findIndex((item) => item.id === itemId);
          const sourceItem = meal.items[sourceIndex];
          if (!sourceItem) return meal;

          duplicatedItemName = sourceItem.name;
          const nextItems = [...meal.items];
          nextItems.splice(sourceIndex + 1, 0, {
            ...sourceItem,
            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          });

          return { ...meal, items: nextItems };
        })
      );

      if (duplicatedItemName) {
        toast.success(`"${duplicatedItemName}" duplicado na refeição`);
      }
    },
    [updateActiveMeals]
  );

  const handleReorderItems = useCallback(
    (mealId: string, sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      updateActiveMeals((prev) =>
        prev.map((meal) => {
          if (meal.id !== mealId) return meal;
          const nextItems = [...meal.items];
          const [moved] = nextItems.splice(sourceIndex, 1);
          if (!moved) return meal;
          nextItems.splice(targetIndex, 0, moved);
          return { ...meal, items: nextItems };
        })
      );
    },
    [updateActiveMeals]
  );

  return {
    handleAddMeal,
    handleDuplicateMeal,
    handleCopyMeal,
    handlePasteMeal,
    hasCopiedMeal: copiedMealItems !== null && copiedMealItems.length > 0,
    handleDuplicateItem,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleSubstituteFood,
    handleRemoveItem,
    handleReorderItems,
  };
}
