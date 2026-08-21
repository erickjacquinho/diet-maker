'use client';

import { getStorageItem, setStorageItem } from './storage';
import { calculatePresetCalories } from './presetUtils';

export interface ReadyMeal {
  id: string;
  name: string;
  suggestedTime: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  itemsCount: number;
  itemsPreview: string;
}

const MEALS_KEY = 'nutridiet_ready_meals';

export function getReadyMealsFromStorage(): ReadyMeal[] {
  return getStorageItem<ReadyMeal[]>(MEALS_KEY, []);
}

export function saveReadyMealToStorage(meal: Omit<ReadyMeal, 'id' | 'kcal'> & { id?: string; kcal?: number }): ReadyMeal {
  const current = getReadyMealsFromStorage();
  const calculatedKcal = meal.kcal ?? calculatePresetCalories(
    Number(meal.proteinG),
    Number(meal.carbsG),
    Number(meal.fatsG),
  );

  const id = meal.id || `meal-block-${Date.now()}`;
  const mealToSave: ReadyMeal = {
    ...meal,
    id,
    kcal: calculatedKcal,
    name: meal.name.trim(),
    itemsPreview: meal.itemsPreview.trim() || 'Itens cadastrados no bloco',
  };

  const existingIndex = current.findIndex((m) => m.id === id);
  const updated = existingIndex >= 0
    ? current.map((m) => (m.id === id ? mealToSave : m))
    : [mealToSave, ...current];

  setStorageItem(MEALS_KEY, updated);
  return mealToSave;
}

export function deleteReadyMealFromStorage(id: string): void {
  const current = getReadyMealsFromStorage();
  const updated = current.filter((m) => m.id !== id);
  setStorageItem(MEALS_KEY, updated);
}
