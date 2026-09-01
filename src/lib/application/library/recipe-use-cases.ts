import type { AccountContext } from '@/lib/persistence/account-context';
import type { FoodCatalogRepository, RecipeRepository } from '@/lib/persistence/library-repository';
import type { LibraryListFilter, Recipe, RecipeInput } from '@/lib/domain/library/library-model';
import { createLibraryError, LibraryApplicationError } from './library-errors';

export interface RecipeUseCaseDependencies {
  accountContext: AccountContext;
  repository: RecipeRepository;
  foodRepository: FoodCatalogRepository;
}
export interface RecipeUseCases {
  create(input: RecipeInput): Promise<Recipe>;
  get(recipeId: string): Promise<Recipe>;
  list(filter?: LibraryListFilter): Promise<Recipe[]>;
  update(recipeId: string, expectedVersion: number, input: RecipeInput): Promise<Recipe>;
  duplicate(recipeId: string): Promise<Recipe>;
  archive(recipeId: string, expectedVersion: number): Promise<Recipe>;
  restore(recipeId: string, expectedVersion: number): Promise<Recipe>;
  delete(recipeId: string, expectedVersion: number): Promise<boolean>;
}

export function createRecipeUseCases(dependencies: RecipeUseCaseDependencies): RecipeUseCases {
  const accountId = async (): Promise<string> => {
    try {
      const active = await dependencies.accountContext.requireActive();
      if (!active.accountId) throw new Error('Conta ativa sem identidade.');
      return active.accountId;
    } catch (cause) {
      if (cause instanceof LibraryApplicationError) throw cause;
      throw createLibraryError('LIBRARY_CONTEXT_MISSING', 'A Conta ativa não pôde ser carregada.', undefined, { cause });
    }
  };

  const ensureSources = async (account: string, input: RecipeInput): Promise<void> => {
    await Promise.all(input.ingredients.filter((ingredient) => ingredient.sourceType === 'ACCOUNT_CUSTOM').map(async (ingredient) => {
      const food = await dependencies.foodRepository.getById(account, ingredient.sourceId);
      if (!food) throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento customizado não encontrado nesta Conta.');
      if (food.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Alimentos arquivados não podem ser usados em uma nova receita.', 'ingredients');
    }));
  };

  return {
    create: async (input) => {
      const account = await accountId();
      await ensureSources(account, input);
      return dependencies.repository.create(account, input);
    },
    get: async (recipeId) => {
      const result = await dependencies.repository.getById(await accountId(), recipeId);
      if (!result) throw createLibraryError('LIBRARY_NOT_FOUND', 'Receita não encontrada nesta Conta.');
      return result;
    },
    list: async (filter) => dependencies.repository.list(await accountId(), filter),
    update: async (recipeId, expectedVersion, input) => {
      const account = await accountId();
      await ensureSources(account, input);
      return dependencies.repository.update(account, recipeId, expectedVersion, input);
    },
    duplicate: async (recipeId) => dependencies.repository.duplicate(await accountId(), recipeId),
    archive: async (recipeId, expectedVersion) => dependencies.repository.archive(await accountId(), recipeId, expectedVersion),
    restore: async (recipeId, expectedVersion) => dependencies.repository.restore(await accountId(), recipeId, expectedVersion),
    delete: async (recipeId, expectedVersion) => dependencies.repository.deleteIfUnreferenced(await accountId(), recipeId, expectedVersion),
  };
}
