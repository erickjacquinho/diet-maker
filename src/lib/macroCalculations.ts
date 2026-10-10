import { getItemMacros, type DietItem, type DietMeal, type MealTotals } from './legacy-diet-types';

export function calculateMealTotals(items: DietItem[]): MealTotals {
  const itemMacros = items.map(getItemMacros);
  const proteinG = Math.round(itemMacros.reduce((acc, curr) => acc + curr.protein, 0) * 10) / 10;
  const carbsG = Math.round(itemMacros.reduce((acc, curr) => acc + curr.carbs, 0) * 10) / 10;
  const fatsG = Math.round(itemMacros.reduce((acc, curr) => acc + curr.fats, 0) * 10) / 10;
  const kcal = Math.round(itemMacros.reduce((acc, curr) => acc + curr.kcal, 0));

  return { proteinG, carbsG, fatsG, kcal };
}

export function calculateMealsTotal(meals: DietMeal[]): MealTotals {
  return calculateMealTotals(meals.flatMap((meal) => meal.items));
}
