import { useCallback } from 'react';
import { DietMeal, DietItem } from '@/lib/dietStore';
import { toast } from 'sonner';

export function useDietMealActions({
  foodSearchMealIndex,
  updateActiveMeals,
}: {
  foodSearchMealIndex: number | null;
  updateActiveMeals: (updater: (prevMeals: DietMeal[]) => DietMeal[]) => void;
}) {
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
    (item: Omit<DietItem, 'id'>) => {
      if (foodSearchMealIndex === null) return;
      const newItem: DietItem = {
        ...item,
        id: `item-${Date.now()}`,
        quantityGrams: item.quantityGrams || item.grams || 100,
        protein: item.protein ?? item.proteinG ?? 0,
        carbs: item.carbs ?? item.carbsG ?? 0,
        fats: item.fats ?? item.fatsG ?? item.fatG ?? 0,
      };
      updateActiveMeals((prev) =>
        prev.map((meal, idx) => (idx === foodSearchMealIndex ? { ...meal, items: [...meal.items, newItem] } : meal))
      );
      toast.success(`${item.name} adicionado à refeição`);
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

  const handleRemoveItem = useCallback(
    (mealId: string, itemId: string) => {
      updateActiveMeals((prev) =>
        prev.map((meal) => (meal.id === mealId ? { ...meal, items: meal.items.filter((i) => i.id !== itemId) } : meal))
      );
    },
    [updateActiveMeals]
  );

  return {
    handleAddMeal,
    handleRemoveMeal,
    handleUpdateMealHeader,
    handleAddFoodToMeal,
    handleUpdateItemGram,
    handleRemoveItem,
  };
}
