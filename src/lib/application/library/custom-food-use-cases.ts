import type { AccountContext } from '@/lib/persistence/account-context';
import type { FoodCatalogRepository } from '@/lib/persistence/library-repository';
import type { CustomFoodInput, FoodCatalogItem, LibraryListFilter } from '@/lib/domain/library/library-model';
import { createLibraryError, LibraryApplicationError } from './library-errors';

export interface CustomFoodUseCaseDependencies {
  accountContext: AccountContext;
  repository: FoodCatalogRepository;
}
export interface CustomFoodUseCases {
  create(input: CustomFoodInput): Promise<FoodCatalogItem>;
  get(foodId: string): Promise<FoodCatalogItem>;
  list(filter?: LibraryListFilter): Promise<FoodCatalogItem[]>;
  update(foodId: string, expectedVersion: number, input: CustomFoodInput): Promise<FoodCatalogItem>;
  duplicate(foodId: string): Promise<FoodCatalogItem>;
  archive(foodId: string, expectedVersion: number): Promise<FoodCatalogItem>;
  restore(foodId: string, expectedVersion: number): Promise<FoodCatalogItem>;
  delete(foodId: string, expectedVersion: number): Promise<boolean>;
}

export function createCustomFoodUseCases(dependencies: CustomFoodUseCaseDependencies): CustomFoodUseCases {
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

  return {
    create: async (input) => dependencies.repository.create(await accountId(), input),
    get: async (foodId) => {
      const result = await dependencies.repository.getById(await accountId(), foodId);
      if (!result) throw createLibraryError('LIBRARY_NOT_FOUND', 'Alimento não encontrado nesta Conta.');
      return result;
    },
    list: async (filter) => dependencies.repository.list(await accountId(), filter),
    update: async (foodId, expectedVersion, input) => dependencies.repository.update(await accountId(), foodId, expectedVersion, input),
    duplicate: async (foodId) => dependencies.repository.duplicate(await accountId(), foodId),
    archive: async (foodId, expectedVersion) => dependencies.repository.archive(await accountId(), foodId, expectedVersion),
    restore: async (foodId, expectedVersion) => dependencies.repository.restore(await accountId(), foodId, expectedVersion),
    delete: async (foodId, expectedVersion) => dependencies.repository.deleteIfUnreferenced(await accountId(), foodId, expectedVersion),
  };
}
