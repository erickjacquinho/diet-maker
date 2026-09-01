import type {
  CustomFoodInput,
  FoodCatalogItem,
  LibraryListFilter,
  ReadyMeal,
  ReadyMealInput,
  Recipe,
  RecipeInput,
} from '@/lib/domain/library/library-model';

export interface FoodCatalogRepository {
  getById(accountId: string, foodId: string): Promise<FoodCatalogItem | null>;
  list(accountId: string, filter?: LibraryListFilter): Promise<FoodCatalogItem[]>;
  create(accountId: string, input: CustomFoodInput): Promise<FoodCatalogItem>;
  update(accountId: string, foodId: string, expectedVersion: number, input: CustomFoodInput): Promise<FoodCatalogItem>;
  duplicate(accountId: string, foodId: string): Promise<FoodCatalogItem>;
  archive(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem>;
  restore(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem>;
  deleteIfUnreferenced(accountId: string, foodId: string, expectedVersion: number): Promise<boolean>;
}

export interface RecipeRepository {
  getById(accountId: string, recipeId: string): Promise<Recipe | null>;
  list(accountId: string, filter?: LibraryListFilter): Promise<Recipe[]>;
  create(accountId: string, input: RecipeInput): Promise<Recipe>;
  update(accountId: string, recipeId: string, expectedVersion: number, input: RecipeInput): Promise<Recipe>;
  duplicate(accountId: string, recipeId: string): Promise<Recipe>;
  archive(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe>;
  restore(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe>;
  deleteIfUnreferenced(accountId: string, recipeId: string, expectedVersion: number): Promise<boolean>;
}

export interface ReadyMealRepository {
  getById(accountId: string, readyMealId: string): Promise<ReadyMeal | null>;
  list(accountId: string, filter?: LibraryListFilter): Promise<ReadyMeal[]>;
  create(accountId: string, input: ReadyMealInput): Promise<ReadyMeal>;
  update(accountId: string, readyMealId: string, expectedVersion: number, input: ReadyMealInput): Promise<ReadyMeal>;
  duplicate(accountId: string, readyMealId: string): Promise<ReadyMeal>;
  archive(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal>;
  restore(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal>;
  deleteIfUnreferenced(accountId: string, readyMealId: string, expectedVersion: number): Promise<boolean>;
}
