'use client';

import tacoData from '@/data/taco_database.json';

export interface FoodItem {
  id: string;
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  source: 'TACO' | 'CUSTOM';
  isFavorite: boolean;
}

const CUSTOM_FOODS_KEY = 'nutridiet_custom_foods';
const FAVORITES_KEY = 'nutridiet_favorite_foods';

export function getFavoritesFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function getCustomFoodsFromStorage(): FoodItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_FOODS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function getAllFoods(): FoodItem[] {
  const favorites = new Set(getFavoritesFromStorage());
  const customFoods = getCustomFoodsFromStorage();

  const tacoFoods: FoodItem[] = tacoData.map((item) => ({
    ...item,
    preparo: item.preparo || 'In Natura',
    source: 'TACO' as const,
    isFavorite: favorites.has(item.id),
  }));

  const updatedCustomFoods: FoodItem[] = customFoods.map((item) => ({
    ...item,
    preparo: item.preparo || 'Personalizado',
    source: 'CUSTOM' as const,
    isFavorite: favorites.has(item.id),
  }));

  return [...tacoFoods, ...updatedCustomFoods];
}

export function toggleFavoriteFood(foodId: string): string[] {
  if (typeof window === 'undefined') return [];
  const favorites = new Set(getFavoritesFromStorage());
  if (favorites.has(foodId)) {
    favorites.delete(foodId);
  } else {
    favorites.add(foodId);
  }
  const result = Array.from(favorites);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(result));
  return result;
}

export function addCustomFood(newFood: Omit<FoodItem, 'id' | 'source'> & { isFavorite?: boolean }): FoodItem {
  const customFoods = getCustomFoodsFromStorage();
  const createdId = `custom-${Date.now()}`;
  const isFav = newFood.isFavorite ?? false;
  const created: FoodItem = {
    ...newFood,
    preparo: newFood.preparo || 'Personalizado',
    id: createdId,
    source: 'CUSTOM',
    isFavorite: isFav,
  };
  const updated = [created, ...customFoods];
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
    if (isFav) {
      const favorites = new Set(getFavoritesFromStorage());
      favorites.add(createdId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    }
  }
  return created;
}
