import { ApiClientError } from '@/lib/api-client/client';
import { libraryApi } from '@/lib/api-client/library';
import { readyMealsApi, recipesApi } from '@/lib/api-client/recipes';
import type { FoodDto, ReadyDietDto } from '@/lib/contracts/library';
import type { ReadyMealDto, RecipeDto } from '@/lib/contracts/recipes';
import { createLibraryError, type LibraryApplicationError } from '@/lib/application/library/library-errors';
import type { DietEditableDocument } from '@/lib/domain/diets/diet-model';
import type {
  CustomFoodInput,
  FoodCatalogItem,
  LibraryListFilter,
  ReadyDiet,
  ReadyDietInput,
  ReadyMeal,
  ReadyMealInput,
  Recipe,
  RecipeInput,
} from '@/lib/domain/library/library-model';
import type { FoodCatalogRepository, ReadyDietRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';
import { isApiStatus } from './errors';

export function toLibraryError(error: unknown, fallback: string): LibraryApplicationError {
  if (error instanceof ApiClientError) {
    if (error.status === 404) return createLibraryError('LIBRARY_NOT_FOUND', 'Registro não encontrado nesta Conta.', undefined, { cause: error });
    if (error.status === 409) return createLibraryError('LIBRARY_VERSION_CONFLICT', 'O registro foi alterado por outra operação. Recarregue e tente de novo.', undefined, { cause: error });
    if (error.status === 422 || error.status === 400) return createLibraryError('LIBRARY_VALIDATION_FAILED', 'Os dados informados são inválidos.', undefined, { cause: error });
  }
  return createLibraryError('LIBRARY_TRANSACTION_FAILED', fallback, undefined, { cause: error });
}

const toFood = (dto: FoodDto, accountId: string): FoodCatalogItem => ({ ...dto, accountId });
const toReadyDiet = (dto: ReadyDietDto, accountId: string): ReadyDiet => ({ ...dto, accountId });

const toRecipe = (dto: RecipeDto, accountId: string): Recipe => ({
  ...dto,
  accountId,
  ingredients: dto.ingredients.map((ingredient) => ({ ...ingredient, id: `${dto.id}:${ingredient.position}`, recipeId: dto.id, accountId })),
});

const toReadyMeal = (dto: ReadyMealDto, accountId: string): ReadyMeal => ({
  ...dto,
  accountId,
  items: dto.items.map((item) => ({ ...item, id: `${dto.id}:${item.position}`, readyMealId: dto.id, accountId })),
});

/**
 * The server never deletes library records: "delete if unreferenced" archives instead, which hides the record from
 * every list and picker while keeping the snapshots of diets that already used it intact.
 */
export class HttpFoodCatalogRepository implements FoodCatalogRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async getById(accountId: string, foodId: string): Promise<FoodCatalogItem | null> {
    try {
      return toFood(await libraryApi.getFood(foodId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toLibraryError(error, 'O alimento não pôde ser lido.');
    }
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<FoodCatalogItem[]> {
    try {
      return (await libraryApi.listFoods(filter)).items.map((dto) => toFood(dto, accountId));
    } catch (error) {
      throw toLibraryError(error, 'Os alimentos não puderam ser lidos.');
    }
  }

  async create(accountId: string, input: CustomFoodInput): Promise<FoodCatalogItem> {
    try {
      return toFood(await libraryApi.createFood(this.idFactory(), input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'O alimento não pôde ser salvo.');
    }
  }

  async update(accountId: string, foodId: string, expectedVersion: number, input: CustomFoodInput): Promise<FoodCatalogItem> {
    try {
      return toFood(await libraryApi.updateFood(foodId, expectedVersion, input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'O alimento não pôde ser atualizado.');
    }
  }

  async duplicate(accountId: string, foodId: string): Promise<FoodCatalogItem> {
    try {
      return toFood(await libraryApi.duplicateFood(foodId, this.idFactory()), accountId);
    } catch (error) {
      throw toLibraryError(error, 'O alimento não pôde ser duplicado.');
    }
  }

  async archive(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem> {
    try {
      return toFood(await libraryApi.archiveFood(foodId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'O alimento não pôde ser arquivado.');
    }
  }

  async restore(accountId: string, foodId: string, expectedVersion: number): Promise<FoodCatalogItem> {
    try {
      return toFood(await libraryApi.restoreFood(foodId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'O alimento não pôde ser restaurado.');
    }
  }

  async deleteIfUnreferenced(accountId: string, foodId: string, expectedVersion: number): Promise<boolean> {
    await this.archive(accountId, foodId, expectedVersion);
    return true;
  }
}

export class HttpRecipeRepository implements RecipeRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async getById(accountId: string, recipeId: string): Promise<Recipe | null> {
    try {
      return toRecipe(await recipesApi.get(recipeId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toLibraryError(error, 'A receita não pôde ser lida.');
    }
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<Recipe[]> {
    try {
      return (await recipesApi.list(filter)).items.map((dto) => toRecipe(dto, accountId));
    } catch (error) {
      throw toLibraryError(error, 'As receitas não puderam ser lidas.');
    }
  }

  async create(accountId: string, input: RecipeInput): Promise<Recipe> {
    try {
      return toRecipe(await recipesApi.create(this.idFactory(), input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A receita não pôde ser salva.');
    }
  }

  async update(accountId: string, recipeId: string, expectedVersion: number, input: RecipeInput): Promise<Recipe> {
    try {
      return toRecipe(await recipesApi.update(recipeId, expectedVersion, input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A receita não pôde ser atualizada.');
    }
  }

  async duplicate(accountId: string, recipeId: string): Promise<Recipe> {
    try {
      return toRecipe(await recipesApi.duplicate(recipeId, this.idFactory()), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A receita não pôde ser duplicada.');
    }
  }

  async archive(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe> {
    try {
      return toRecipe(await recipesApi.archive(recipeId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A receita não pôde ser arquivada.');
    }
  }

  async restore(accountId: string, recipeId: string, expectedVersion: number): Promise<Recipe> {
    try {
      return toRecipe(await recipesApi.restore(recipeId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A receita não pôde ser restaurada.');
    }
  }

  async deleteIfUnreferenced(accountId: string, recipeId: string, expectedVersion: number): Promise<boolean> {
    await this.archive(accountId, recipeId, expectedVersion);
    return true;
  }
}

export class HttpReadyMealRepository implements ReadyMealRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async getById(accountId: string, readyMealId: string): Promise<ReadyMeal | null> {
    try {
      return toReadyMeal(await readyMealsApi.get(readyMealId), accountId);
    } catch (error) {
      if (isApiStatus(error, 404)) return null;
      throw toLibraryError(error, 'A refeição pronta não pôde ser lida.');
    }
  }

  async list(accountId: string, filter: LibraryListFilter = {}): Promise<ReadyMeal[]> {
    try {
      return (await readyMealsApi.list(filter)).items.map((dto) => toReadyMeal(dto, accountId));
    } catch (error) {
      throw toLibraryError(error, 'As refeições prontas não puderam ser lidas.');
    }
  }

  async create(accountId: string, input: ReadyMealInput): Promise<ReadyMeal> {
    try {
      return toReadyMeal(await readyMealsApi.create(this.idFactory(), input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A refeição pronta não pôde ser salva.');
    }
  }

  async update(accountId: string, readyMealId: string, expectedVersion: number, input: ReadyMealInput): Promise<ReadyMeal> {
    try {
      return toReadyMeal(await readyMealsApi.update(readyMealId, expectedVersion, input), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A refeição pronta não pôde ser atualizada.');
    }
  }

  async duplicate(accountId: string, readyMealId: string): Promise<ReadyMeal> {
    try {
      return toReadyMeal(await readyMealsApi.duplicate(readyMealId, this.idFactory()), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A refeição pronta não pôde ser duplicada.');
    }
  }

  async archive(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal> {
    try {
      return toReadyMeal(await readyMealsApi.archive(readyMealId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A refeição pronta não pôde ser arquivada.');
    }
  }

  async restore(accountId: string, readyMealId: string, expectedVersion: number): Promise<ReadyMeal> {
    try {
      return toReadyMeal(await readyMealsApi.restore(readyMealId, expectedVersion), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A refeição pronta não pôde ser restaurada.');
    }
  }

  async deleteIfUnreferenced(accountId: string, readyMealId: string, expectedVersion: number): Promise<boolean> {
    await this.archive(accountId, readyMealId, expectedVersion);
    return true;
  }
}

export class HttpReadyDietRepository implements ReadyDietRepository {
  constructor(private readonly idFactory: () => string = () => crypto.randomUUID()) {}

  async create(accountId: string, input: ReadyDietInput): Promise<ReadyDiet> {
    try {
      return toReadyDiet(await libraryApi.createReadyDiet(this.idFactory(), input.name, input.document as DietEditableDocument), accountId);
    } catch (error) {
      throw toLibraryError(error, 'A dieta pronta não pôde ser salva.');
    }
  }

  async list(accountId: string): Promise<ReadyDiet[]> {
    try {
      return (await libraryApi.listReadyDiets()).items.map((dto) => toReadyDiet(dto, accountId));
    } catch (error) {
      throw toLibraryError(error, 'As dietas prontas não puderam ser lidas.');
    }
  }
}
