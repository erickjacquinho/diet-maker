import { describe, expect, it, vi } from 'vitest';
import { createRecipeUseCases } from '@/lib/application/library/recipe-use-cases';
import type { FoodCatalogRepository, RecipeRepository } from '@/lib/persistence/library-repository';

describe('recipe use cases', () => {
  it('rejects an archived or cross-account source before asking the repository to save', async () => {
    const repository = { create: vi.fn() } as unknown as RecipeRepository;
    const foodRepository = { getById: vi.fn().mockResolvedValue(null) } as unknown as FoodCatalogRepository;
    const useCases = createRecipeUseCases({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      repository,
      foodRepository,
    });
    await expect(useCases.create({
      name: 'Receita', category: 'Teste', yieldPortions: '1',
      ingredients: [{ sourceType: 'ACCOUNT_CUSTOM', sourceId: 'foreign-food', quantity: '100', unit: 'g' }],
    })).rejects.toMatchObject({ code: 'LIBRARY_NOT_FOUND' });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
