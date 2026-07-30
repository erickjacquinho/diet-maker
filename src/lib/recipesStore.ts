'use client';

import { calculatePresetCalories } from './presetUtils';

export interface RecipeIngredient {
  foodId: string;
  name: string;
  amountGrams: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  prepTimeMinutes?: number;
  servings: number;
  instructions: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
}


export interface RecipeNutrientsSummary {
  totalProteinG: number;
  totalCarbsG: number;
  totalFatsG: number;
  totalKcal: number;
  portionProteinG: number;
  portionCarbsG: number;
  portionFatsG: number;
  portionKcal: number;
}

const RECIPES_KEY = 'nutridiet_recipes';

export function calculateRecipeNutrients(ingredients: RecipeIngredient[], servings: number): RecipeNutrientsSummary {
  const safeServings = Math.max(1, Number(servings) || 1);

  const totalProteinG = Math.round(ingredients.reduce((acc, curr) => acc + (Number(curr.proteinG) || 0), 0) * 10) / 10;
  const totalCarbsG = Math.round(ingredients.reduce((acc, curr) => acc + (Number(curr.carbsG) || 0), 0) * 10) / 10;
  const totalFatsG = Math.round(ingredients.reduce((acc, curr) => acc + (Number(curr.fatsG) || 0), 0) * 10) / 10;
  const totalKcal = calculatePresetCalories(totalProteinG, totalCarbsG, totalFatsG);

  const portionProteinG = Math.round((totalProteinG / safeServings) * 10) / 10;
  const portionCarbsG = Math.round((totalCarbsG / safeServings) * 10) / 10;
  const portionFatsG = Math.round((totalFatsG / safeServings) * 10) / 10;
  const portionKcal = calculatePresetCalories(portionProteinG, portionCarbsG, portionFatsG);

  return {
    totalProteinG,
    totalCarbsG,
    totalFatsG,
    totalKcal,
    portionProteinG,
    portionCarbsG,
    portionFatsG,
    portionKcal,
  };
}

export function getRecipesFromStorage(): Recipe[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(RECIPES_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }

  return [];
}

export function saveRecipeToStorage(recipe: Omit<Recipe, 'id' | 'createdAt'> & { id?: string }): Recipe {
  const current = getRecipesFromStorage();
  const id = recipe.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const createdAt = new Date().toLocaleDateString('pt-BR');

  const recipeToSave: Recipe = {
    ...recipe,
    id,
    createdAt,
  };

  const existingIndex = current.findIndex((r) => r.id === id);
  let updatedList: Recipe[];
  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = recipeToSave;
  } else {
    updatedList = [recipeToSave, ...current];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedList));
  }
  return recipeToSave;
}

export function deleteRecipeFromStorage(id: string): void {
  const current = getRecipesFromStorage();
  const updatedList = current.filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedList));
  }
}
