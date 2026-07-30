import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllFoods,
  getFavoritesFromStorage,
  getCustomFoodsFromStorage,
  toggleFavoriteFood,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
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

  it('adds a custom food item and retrieves it via getAllFoods()', () => {
    const newCustomFood = addCustomFood({
      name: 'Whey Protein Caseiro',
      preparo: 'Shakado',
      category: 'Suplementos',
      kcal: 120,
      proteinG: 24,
      carbsG: 3,
      fatsG: 1,
      fiberG: 0,
      isFavorite: true,
    });

    expect(newCustomFood.id).toMatch(/^custom-\d+.*$/);
    expect(newCustomFood.source).toBe('CUSTOM');
    expect(newCustomFood.isFavorite).toBe(true);

    const customFoods = getCustomFoodsFromStorage();
    expect(customFoods).toHaveLength(1);
    expect(customFoods[0].name).toBe('Whey Protein Caseiro');

    const allFoods = getAllFoods();
    const foundCustom = allFoods.find((f) => f.id === newCustomFood.id);
    expect(foundCustom).toBeDefined();
    expect(foundCustom?.isFavorite).toBe(true);
  });

  it('updates an existing custom food item', () => {
    const created = addCustomFood({
      name: 'Suplemento X',
      preparo: 'Pó',
      category: 'Suplementos',
      kcal: 100,
      proteinG: 20,
      carbsG: 5,
      fatsG: 0,
      fiberG: 0,
      isFavorite: false,
    });

    const updated = updateCustomFood(created.id, {
      name: 'Suplemento X Editado',
      proteinG: 25,
      isFavorite: true,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Suplemento X Editado');
    expect(updated?.proteinG).toBe(25);
    expect(updated?.isFavorite).toBe(true);

    const customFoods = getCustomFoodsFromStorage();
    expect(customFoods[0].name).toBe('Suplemento X Editado');
  });

  it('deletes a custom food item', () => {
    const created = addCustomFood({
      name: 'Alimento Deletar',
      preparo: 'Cozido',
      category: 'Outros',
      kcal: 50,
      proteinG: 1,
      carbsG: 10,
      fatsG: 0,
      fiberG: 1,
      isFavorite: true,
    });

    const deleteSuccess = deleteCustomFood(created.id);
    expect(deleteSuccess).toBe(true);

    const customFoods = getCustomFoodsFromStorage();
    expect(customFoods).toHaveLength(0);
  });
});

