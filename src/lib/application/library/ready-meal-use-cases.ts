import type { AccountContext } from '@/lib/persistence/account-context';
import type { FoodCatalogRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';
import type { LibraryListFilter, ReadyMeal, ReadyMealInput } from '@/lib/domain/library/library-model';
import { createLibraryError, LibraryApplicationError } from './library-errors';
import { listTacoFoods } from '@/lib/application/diets/taco-food-adapter';

export interface ReadyMealUseCaseDependencies {
  accountContext: AccountContext;
  repository: ReadyMealRepository;
  foodRepository: FoodCatalogRepository;
  recipeRepository: RecipeRepository;
}

export interface ReadyMealUseCases {
  create(input: ReadyMealInput): Promise<ReadyMeal>;
  get(readyMealId: string): Promise<ReadyMeal>;
  list(filter?: LibraryListFilter): Promise<ReadyMeal[]>;
  update(readyMealId: string, expectedVersion: number, input: ReadyMealInput): Promise<ReadyMeal>;
  duplicate(readyMealId: string): Promise<ReadyMeal>;
  archive(readyMealId: string, expectedVersion: number): Promise<ReadyMeal>;
  restore(readyMealId: string, expectedVersion: number): Promise<ReadyMeal>;
  delete(readyMealId: string, expectedVersion: number): Promise<boolean>;
}

export function createReadyMealUseCases(dependencies: ReadyMealUseCaseDependencies): ReadyMealUseCases {
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

  const ensureSources = async (account: string, input: ReadyMealInput): Promise<void> => {
    await Promise.all(input.items.map(async (item) => {
      if (item.sourceType === 'FOOD' && !listTacoFoods().some((food) => food.id === item.sourceId)) {
        const food = await dependencies.foodRepository.getById(account, item.sourceId);
        if (!food) throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento customizado não encontrado nesta Conta.');
        if (food.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Alimentos arquivados não podem ser usados em uma nova refeição pronta.', 'items');
      }
      if (item.sourceType === 'RECIPE') {
        const recipe = await dependencies.recipeRepository.getById(account, item.sourceId);
        if (!recipe) throw createLibraryError('LIBRARY_NOT_FOUND', 'Receita não encontrada nesta Conta.');
        if (recipe.status !== 'ACTIVE') throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Receitas arquivadas não podem ser usadas em uma nova refeição pronta.', 'items');
      }
    }));
  };

  return {
    create: async (input) => {
      const account = await accountId();
      await ensureSources(account, input);
      return dependencies.repository.create(account, input);
    },
    get: async (readyMealId) => {
      const result = await dependencies.repository.getById(await accountId(), readyMealId);
      if (!result) throw createLibraryError('LIBRARY_NOT_FOUND', 'Refeição pronta não encontrada nesta Conta.');
      return result;
    },
    list: async (filter) => dependencies.repository.list(await accountId(), filter),
    update: async (readyMealId, expectedVersion, input) => {
      const account = await accountId();
      await ensureSources(account, input);
      return dependencies.repository.update(account, readyMealId, expectedVersion, input);
    },
    duplicate: async (readyMealId) => dependencies.repository.duplicate(await accountId(), readyMealId),
    archive: async (readyMealId, expectedVersion) => dependencies.repository.archive(await accountId(), readyMealId, expectedVersion),
    restore: async (readyMealId, expectedVersion) => dependencies.repository.restore(await accountId(), readyMealId, expectedVersion),
    delete: async (readyMealId, expectedVersion) => dependencies.repository.deleteIfUnreferenced(await accountId(), readyMealId, expectedVersion),
  };
}
