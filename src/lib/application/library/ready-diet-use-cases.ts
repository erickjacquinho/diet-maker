import type { AccountContext } from '@/lib/persistence/account-context';
import type { ReadyDiet, ReadyDietInput } from '@/lib/domain/library/library-model';
import type { ReadyDietRepository } from '@/lib/persistence/library-repository';
import { createLibraryError, LibraryApplicationError } from './library-errors';

export interface ReadyDietUseCases {
  create(input: ReadyDietInput): Promise<ReadyDiet>;
  list(): Promise<ReadyDiet[]>;
}

export function createReadyDietUseCases(dependencies: {
  accountContext: AccountContext;
  repository: ReadyDietRepository;
}): ReadyDietUseCases {
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
    create: async (input) => {
      const name = input.name.trim();
      const document = input.document;
      if (!name) throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Informe o nome da dieta pronta.', 'name');
      if (!document || !['SIMPLE', 'CARB_CYCLING'].includes(document.mode) || !Array.isArray(document.variations) || document.variations.length === 0) {
        throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'A dieta precisa ter ao menos uma variação.', 'document');
      }
      if (document.variations.some((variation) => !Array.isArray(variation.meals) || variation.meals.some((meal) => !meal.name.trim() || (meal.time !== undefined && meal.time !== '' && !/^\d{2}:\d{2}$/.test(meal.time))))) {
        throw createLibraryError('LIBRARY_VALIDATION_FAILED', 'Confira o nome e o horário de cada refeição.', 'document');
      }
      return dependencies.repository.create(await accountId(), { name, document: { ...structuredClone(document), name } });
    },
    list: async () => dependencies.repository.list(await accountId()),
  };
}
