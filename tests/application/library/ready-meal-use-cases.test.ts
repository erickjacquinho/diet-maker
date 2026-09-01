import { describe, expect, it, vi } from 'vitest';
import { createReadyMealUseCases } from '@/lib/application/library/ready-meal-use-cases';
import type { FoodCatalogRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';

describe('ready meal use cases', () => {
  it('rejects a missing recipe and never persists a partial template', async () => {
    const repository = { create: vi.fn() } as unknown as ReadyMealRepository;
    const useCases = createReadyMealUseCases({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      repository,
      foodRepository: { getById: vi.fn() } as unknown as FoodCatalogRepository,
      recipeRepository: { getById: vi.fn().mockResolvedValue(null) } as unknown as RecipeRepository,
    });
    await expect(useCases.create({ name: 'Refeição', items: [{ sourceType: 'RECIPE', sourceId: 'missing', recipePortions: '1' }] })).rejects.toMatchObject({ code: 'LIBRARY_NOT_FOUND' });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
