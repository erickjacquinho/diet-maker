import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateRecipeNutrients,
  getRecipesFromStorage,
  saveRecipeToStorage,
  deleteRecipeFromStorage,
  RecipeIngredient,
} from '../recipesStore';

describe('Recipe Domain Seam: recipesStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when localStorage is empty', () => {
    const recipes = getRecipesFromStorage();
    expect(recipes).toEqual([]);
  });

  it('correctly calculates total and per-portion nutrients for a recipe', () => {
    const ingredients: RecipeIngredient[] = [
      { foodId: '1', name: 'Ovo', amountGrams: 100, proteinG: 13, carbsG: 1, fatsG: 10, kcal: 146 },
      { foodId: '2', name: 'Aveia', amountGrams: 50, proteinG: 7, carbsG: 33, fatsG: 4, kcal: 196 },
    ];

    // Totals: Prot = 20g, Carbs = 34g, Fats = 14g -> Kcal = 20*4 + 34*4 + 14*9 = 80 + 136 + 126 = 342 kcal
    // 2 Servings: Prot = 10g, Carbs = 17g, Fats = 7g -> Kcal = 10*4 + 17*4 + 7*9 = 40 + 68 + 63 = 171 kcal
    const summary = calculateRecipeNutrients(ingredients, 2);

    expect(summary.totalProteinG).toBe(20);
    expect(summary.totalCarbsG).toBe(34);
    expect(summary.totalFatsG).toBe(14);
    expect(summary.totalKcal).toBe(342);

    expect(summary.portionProteinG).toBe(10);
    expect(summary.portionCarbsG).toBe(17);
    expect(summary.portionFatsG).toBe(7);
    expect(summary.portionKcal).toBe(171);
  });

  it('saves, retrieves and deletes recipes from storage', () => {
    const newRecipe = saveRecipeToStorage({
      name: 'Bolo de Caneca Proteico',
      category: 'Lanches',
      prepTimeMinutes: 5,
      servings: 1,
      instructions: 'Misture e coloque no micro-ondas por 1m30s.',
      ingredients: [
        { foodId: '1', name: 'Whey Protein', amountGrams: 30, proteinG: 24, carbsG: 3, fatsG: 2, kcal: 126 },
      ],
    });

    expect(newRecipe.id).toBeDefined();
    const allRecipes = getRecipesFromStorage();
    expect(allRecipes.some((r) => r.name === 'Bolo de Caneca Proteico')).toBe(true);

    deleteRecipeFromStorage(newRecipe.id);
    const afterDelete = getRecipesFromStorage();
    expect(afterDelete.some((r) => r.id === newRecipe.id)).toBe(false);
  });
});
