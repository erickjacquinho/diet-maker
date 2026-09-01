'use client';

import { createTacoSnapshot, listTacoFoods } from '@/lib/application/diets/taco-food-adapter';
import { createDecimalString, type EnergySource, type NutritionSnapshot } from './domain/diets/diet-model';
import { scaleNutrition } from './domain/diets/nutrition';
import type { FoodCatalogItem as DomainFoodCatalogItem, ReadyMeal as DomainReadyMeal, Recipe as DomainRecipe, ReadyMealItemInput } from './domain/library/library-model';
import { getStorageItem, setStorageItem } from './storage';

export interface FoodItem {
  id: string;
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fatG?: number;
  fiberG: number;
  source: 'TACO' | 'CUSTOM';
  isFavorite: boolean;
  isCustom?: boolean;
  libraryVersion?: number;
  energySource?: EnergySource;
}

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
  libraryVersion?: number;
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
  libraryVersion?: number;
  items?: ReadyMealItemInput[];
}

const FAVORITES_KEY = 'nutridiet_favorite_foods';

export function getFavoritesFromStorage(): string[] {
  return getStorageItem<string[]>(FAVORITES_KEY, []);
}

export function toggleFavoriteFood(foodId: string): string[] {
  const favorites = new Set(getFavoritesFromStorage());
  if (favorites.has(foodId)) favorites.delete(foodId);
  else favorites.add(foodId);
  const next = [...favorites];
  setStorageItem(FAVORITES_KEY, next);
  return next;
}

export function listTacoFoodItems(): FoodItem[] {
  const favorites = new Set(getFavoritesFromStorage());
  return listTacoFoods().map((food) => ({ id: food.id, name: food.name, preparo: food.preparo || 'inNatura', category: food.category, kcal: food.kcal, proteinG: food.proteinG, carbsG: food.carbsG, fatsG: food.fatsG, fatG: food.fatsG, fiberG: food.fiberG, source: 'TACO' as const, isFavorite: favorites.has(food.id), energySource: 'REFERENCE' as const }));
}

export function toFoodItem(food: DomainFoodCatalogItem): FoodItem {
  return {
    id: food.id, name: food.name, preparo: food.foodState, category: 'Customizados', kcal: Number(food.referenceNutrients.energyKcal ?? 0),
    proteinG: Number(food.referenceNutrients.protein), carbsG: Number(food.referenceNutrients.carbs), fatsG: Number(food.referenceNutrients.fat), fatG: Number(food.referenceNutrients.fat), fiberG: Number(food.referenceNutrients.fiber),
    source: 'CUSTOM', isFavorite: getFavoritesFromStorage().includes(food.id), isCustom: true, libraryVersion: food.version, energySource: food.energySource,
  };
}

export function createLibraryFoodSnapshot(food: FoodItem, prescribedQuantity = '100'): NutritionSnapshot {
  if (food.source === 'TACO') return createTacoSnapshot(food.id, prescribedQuantity);

  const reference = {
    referenceQuantity: createDecimalString('100'),
    protein: createDecimalString(String(food.proteinG)),
    carbs: createDecimalString(String(food.carbsG)),
    fat: createDecimalString(String(food.fatG ?? food.fatsG)),
    fiber: createDecimalString(String(food.fiberG)),
    energyKcal: createDecimalString(String(food.kcal)),
  };
  const referenceNutrients = { ...reference, energyKcal: createDecimalString(String(food.kcal)) };
  return {
    sourceType: 'ACCOUNT_CUSTOM',
    sourceId: food.id,
    sourceVersion: String(food.libraryVersion ?? 1),
    displayName: food.name,
    description: food.name + ' — ' + food.category + '; preparo original: ' + (food.preparo || 'Personalizado'),
    measurementBasis: 'PER_100G',
    foodState: 'AS_SOLD',
    referenceQuantity: reference.referenceQuantity,
    referenceUnit: 'g',
    referenceNutrients,
    prescribedQuantity: createDecimalString(prescribedQuantity),
    prescribedUnit: 'g',
    prescribedNutrients: scaleNutrition(referenceNutrients, createDecimalString(prescribedQuantity)),
    energySource: food.energySource ?? 'REFERENCE',
    calculationVersion: 'library-ui-v1',
    conversionSnapshot: { schemaVersion: 1, conversions: [] },
    compositionSnapshot: { schemaVersion: 1, source: 'ACCOUNT_CUSTOM', sourceVersion: food.libraryVersion ?? 1 },
  };
}

export function toRecipe(recipe: DomainRecipe): Recipe {
  return {
    id: recipe.id, name: recipe.name, category: recipe.category, prepTimeMinutes: recipe.prepTimeMinutes, servings: Number(recipe.yieldPortions), instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((ingredient) => ({ foodId: ingredient.sourceId, name: ingredient.ingredientSnapshot.displayName, amountGrams: Number(ingredient.quantity), proteinG: Number(ingredient.ingredientSnapshot.prescribedNutrients.protein), carbsG: Number(ingredient.ingredientSnapshot.prescribedNutrients.carbs), fatsG: Number(ingredient.ingredientSnapshot.prescribedNutrients.fat), kcal: Number(ingredient.ingredientSnapshot.prescribedNutrients.energyKcal ?? 0) })),
    createdAt: recipe.createdAt, libraryVersion: recipe.version,
  };
}

export function toReadyMeal(meal: DomainReadyMeal): ReadyMeal {
  const proteinG = meal.items.reduce((sum, item) => sum + Number(item.itemSnapshot.prescribedNutrients.protein), 0);
  const carbsG = meal.items.reduce((sum, item) => sum + Number(item.itemSnapshot.prescribedNutrients.carbs), 0);
  const fatsG = meal.items.reduce((sum, item) => sum + Number(item.itemSnapshot.prescribedNutrients.fat), 0);
  const kcal = meal.items.reduce((sum, item) => sum + Number(item.itemSnapshot.prescribedNutrients.energyKcal ?? 0), 0);
  return {
    id: meal.id,
    name: meal.name,
    suggestedTime: meal.suggestedTime ?? '',
    kcal: Math.round(kcal),
    proteinG: Number(proteinG.toFixed(1)),
    carbsG: Number(carbsG.toFixed(1)),
    fatsG: Number(fatsG.toFixed(1)),
    itemsCount: meal.items.length,
    itemsPreview: meal.items.map((item) => item.itemSnapshot.displayName).join(', ') || meal.description,
    libraryVersion: meal.version,
    items: meal.items.map((item): ReadyMealItemInput => ({
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      quantity: item.quantity,
      unit: item.unit,
      recipePortions: item.recipePortions,
    })),
  };
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function scoreFoodItem(food: FoodItem, query: string): number {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return 0;
  const text = normalize(`${food.name} ${food.preparo} ${food.category}`);
  const name = normalize(food.name);
  const matched = terms.filter((term) => text.includes(term));
  if (matched.length !== terms.length) return 0;
  return (name.startsWith(normalize(query)) ? 200 : 100) + matched.length * 10 + (food.isFavorite ? 5 : 0);
}

export function searchTacoFoods(query: string, foodsPool: FoodItem[] = listTacoFoodItems()): FoodItem[] {
  if (!query.trim()) return [];
  return foodsPool.map((food, index) => ({ food, score: scoreFoodItem(food, query), index })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).map((entry) => entry.food);
}

export function calculateRecipeNutrients(ingredients: RecipeIngredient[], servings: number): RecipeNutrientsSummary {
  const divisor = Math.max(1, Number(servings) || 1);
  const totalProteinG = Math.round(ingredients.reduce((sum, item) => sum + (Number(item.proteinG) || 0), 0) * 10) / 10;
  const totalCarbsG = Math.round(ingredients.reduce((sum, item) => sum + (Number(item.carbsG) || 0), 0) * 10) / 10;
  const totalFatsG = Math.round(ingredients.reduce((sum, item) => sum + (Number(item.fatsG) || 0), 0) * 10) / 10;
  const totalKcal = Math.round((totalProteinG * 4 + totalCarbsG * 4 + totalFatsG * 9));
  const portionProteinG = Math.round((totalProteinG / divisor) * 10) / 10;
  const portionCarbsG = Math.round((totalCarbsG / divisor) * 10) / 10;
  const portionFatsG = Math.round((totalFatsG / divisor) * 10) / 10;
  return { totalProteinG, totalCarbsG, totalFatsG, totalKcal, portionProteinG, portionCarbsG, portionFatsG, portionKcal: Math.round(portionProteinG * 4 + portionCarbsG * 4 + portionFatsG * 9) };
}
