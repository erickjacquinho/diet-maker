import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllFoods,
  getFavoritesFromStorage,
  toggleFavoriteFood,
} from '../tacoStore';

describe('TACO / Food Domain Seam: tacoStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads TACO foods with default properties when no custom/favorite foods exist', () => {
    const foods = getAllFoods();
    expect(foods.length).toBeGreaterThan(0);

    const firstItem = foods[0];
    expect(firstItem.source).toBe('TACO');
    expect(firstItem.isFavorite).toBe(false);
    expect(firstItem.preparo).toBeDefined();
  });

  it('toggles favorite status of a food item and syncs with localStorage', () => {
    const initialFavorites = getFavoritesFromStorage();
    expect(initialFavorites).toEqual([]);

    const foodId = 'taco-1';
    const afterToggle = toggleFavoriteFood(foodId);
    expect(afterToggle).toContain(foodId);

    const currentFavorites = getFavoritesFromStorage();
    expect(currentFavorites).toContain(foodId);

    // Toggle off
    const afterToggleOff = toggleFavoriteFood(foodId);
    expect(afterToggleOff).not.toContain(foodId);
  });

});
