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
    preparo: item.preparo || 'inNatura',
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
  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const createdId = `custom-${Date.now()}-${uniqueSuffix}`;
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

export function updateCustomFood(
  foodId: string,
  updatedData: Partial<Omit<FoodItem, 'id' | 'source'>>
): FoodItem | null {
  const customFoods = getCustomFoodsFromStorage();
  const index = customFoods.findIndex((f) => f.id === foodId);
  if (index === -1) return null;

  const existing = customFoods[index];
  const updated: FoodItem = {
    ...existing,
    ...updatedData,
    source: 'CUSTOM',
    preparo: updatedData.preparo || existing.preparo || 'Personalizado',
  };

  customFoods[index] = updated;

  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(customFoods));
    if (updatedData.isFavorite !== undefined) {
      const favorites = new Set(getFavoritesFromStorage());
      if (updatedData.isFavorite) {
        favorites.add(foodId);
      } else {
        favorites.delete(foodId);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    }
  }

  return updated;
}

export function deleteCustomFood(foodId: string): boolean {
  const customFoods = getCustomFoodsFromStorage();
  const index = customFoods.findIndex((f) => f.id === foodId);
  if (index === -1) return false;

  const updated = customFoods.filter((f) => f.id !== foodId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
    const favorites = new Set(getFavoritesFromStorage());
    favorites.delete(foodId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
  }

  return true;
}

export function searchTacoFoods(query: string): FoodItem[] {
  if (!query || !query.trim()) return [];
  const normalized = query.toLowerCase().trim();
  const all = getAllFoods();
  return all.filter(
    (f) =>
      f.name.toLowerCase().includes(normalized) ||
      f.category.toLowerCase().includes(normalized)
  );
}


