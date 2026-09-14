import type { LibraryListFilter, CustomFoodInput, RecipeInput, ReadyMealInput } from '@/lib/domain/library/library-model';
import type { LibraryApplicationDependencies } from './library-ports';
import { createCustomFoodUseCases } from './custom-food-use-cases';
import { createRecipeUseCases } from './recipe-use-cases';
import { createReadyMealUseCases } from './ready-meal-use-cases';

export function createLibraryApplication(dependencies: LibraryApplicationDependencies) {
  const foods = createCustomFoodUseCases({ accountContext: dependencies.accountContext, repository: dependencies.foodRepository });
  const recipes = createRecipeUseCases({ accountContext: dependencies.accountContext, repository: dependencies.recipeRepository, foodRepository: dependencies.foodRepository });
  const readyMeals = createReadyMealUseCases({ accountContext: dependencies.accountContext, repository: dependencies.readyMealRepository, foodRepository: dependencies.foodRepository, recipeRepository: dependencies.recipeRepository });
  const runConfirmed = <T>(operation: () => Promise<T>): Promise<T> => (
    dependencies.confirmedOperation ? dependencies.confirmedOperation.run(operation) : operation()
  );

  return {
    createCustomFood: (input: CustomFoodInput) => runConfirmed(() => foods.create(input)),
    updateCustomFood: (foodId: string, expectedVersion: number, input: CustomFoodInput) => runConfirmed(() => foods.update(foodId, expectedVersion, input)),
    listCustomFoods: (filter?: LibraryListFilter) => foods.list(filter),
    getCustomFood: (foodId: string) => foods.get(foodId),
    duplicateCustomFood: (foodId: string) => runConfirmed(() => foods.duplicate(foodId)),
    archiveCustomFood: (foodId: string, expectedVersion: number) => runConfirmed(() => foods.archive(foodId, expectedVersion)),
    restoreCustomFood: (foodId: string, expectedVersion: number) => runConfirmed(() => foods.restore(foodId, expectedVersion)),
    deleteCustomFood: (foodId: string, expectedVersion: number) => runConfirmed(() => foods.delete(foodId, expectedVersion)),

    createRecipe: (input: RecipeInput) => runConfirmed(() => recipes.create(input)),
    updateRecipe: (recipeId: string, expectedVersion: number, input: RecipeInput) => runConfirmed(() => recipes.update(recipeId, expectedVersion, input)),
    listRecipes: (filter?: LibraryListFilter) => recipes.list(filter),
    getRecipe: (recipeId: string) => recipes.get(recipeId),
    duplicateRecipe: (recipeId: string) => runConfirmed(() => recipes.duplicate(recipeId)),
    archiveRecipe: (recipeId: string, expectedVersion: number) => runConfirmed(() => recipes.archive(recipeId, expectedVersion)),
    restoreRecipe: (recipeId: string, expectedVersion: number) => runConfirmed(() => recipes.restore(recipeId, expectedVersion)),
    deleteRecipe: (recipeId: string, expectedVersion: number) => runConfirmed(() => recipes.delete(recipeId, expectedVersion)),

    createReadyMeal: (input: ReadyMealInput) => runConfirmed(() => readyMeals.create(input)),
    updateReadyMeal: (readyMealId: string, expectedVersion: number, input: ReadyMealInput) => runConfirmed(() => readyMeals.update(readyMealId, expectedVersion, input)),
    listReadyMeals: (filter?: LibraryListFilter) => readyMeals.list(filter),
    getReadyMeal: (readyMealId: string) => readyMeals.get(readyMealId),
    duplicateReadyMeal: (readyMealId: string) => runConfirmed(() => readyMeals.duplicate(readyMealId)),
    archiveReadyMeal: (readyMealId: string, expectedVersion: number) => runConfirmed(() => readyMeals.archive(readyMealId, expectedVersion)),
    restoreReadyMeal: (readyMealId: string, expectedVersion: number) => runConfirmed(() => readyMeals.restore(readyMealId, expectedVersion)),
    deleteReadyMeal: (readyMealId: string, expectedVersion: number) => runConfirmed(() => readyMeals.delete(readyMealId, expectedVersion)),
  };
}

export type LibraryApplication = ReturnType<typeof createLibraryApplication>;
