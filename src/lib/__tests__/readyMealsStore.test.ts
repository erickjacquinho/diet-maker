import { describe, it, expect, beforeEach } from 'vitest';
import {
  getReadyMealsFromStorage,
  saveReadyMealToStorage,
  deleteReadyMealFromStorage,
} from '../readyMealsStore';

describe('readyMealsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty list by default', () => {
    expect(getReadyMealsFromStorage()).toEqual([]);
  });

  it('saves and calculates calories correctly', () => {
    const meal = saveReadyMealToStorage({
      name: 'Café Hiperproteico',
      suggestedTime: '08:00',
      proteinG: 40,
      carbsG: 50,
      fatsG: 10,
      itemsCount: 3,
      itemsPreview: 'Ovos, aveia, banana',
    });

    expect(meal.id).toBeDefined();
    // 40*4 + 50*4 + 10*9 = 160 + 200 + 90 = 450
    expect(meal.kcal).toBe(450);

    const all = getReadyMealsFromStorage();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(meal.id);
  });

  it('deletes a ready meal by id', () => {
    const meal = saveReadyMealToStorage({
      name: 'Almoço Padrão',
      suggestedTime: '12:00',
      proteinG: 45,
      carbsG: 60,
      fatsG: 15,
      itemsCount: 4,
      itemsPreview: 'Frango, arroz, feijão, salada',
    });

    expect(getReadyMealsFromStorage()).toHaveLength(1);

    deleteReadyMealFromStorage(meal.id);
    expect(getReadyMealsFromStorage()).toHaveLength(0);
  });
});
