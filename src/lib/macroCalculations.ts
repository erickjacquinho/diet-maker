import { calculatePresetCalories } from './presetUtils';
import type { DietItem, DietMeal, MealTotals } from './dietStore';

export function calculateMealTotals(items: DietItem[]): MealTotals {
  const proteinG = Math.round(items.reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0) * 10) / 10;
  const carbsG = Math.round(items.reduce((acc, curr) => acc + (Number(curr.carbs) || 0), 0) * 10) / 10;
  const fatsG = Math.round(items.reduce((acc, curr) => acc + (Number(curr.fats) || 0), 0) * 10) / 10;
  const kcal = calculatePresetCalories(proteinG, carbsG, fatsG);

  return { proteinG, carbsG, fatsG, kcal };
}

export function calculateMealsTotal(meals: DietMeal[]): MealTotals {
  let proteinG = 0;
  let carbsG = 0;
  let fatsG = 0;

  meals.forEach((meal) => {
    const mealTotals = calculateMealTotals(meal.items);
    proteinG += mealTotals.proteinG;
    carbsG += mealTotals.carbsG;
    fatsG += mealTotals.fatsG;
  });

  proteinG = Math.round(proteinG * 10) / 10;
  carbsG = Math.round(carbsG * 10) / 10;
  fatsG = Math.round(fatsG * 10) / 10;
  const kcal = calculatePresetCalories(proteinG, carbsG, fatsG);

  return { proteinG, carbsG, fatsG, kcal };
}
