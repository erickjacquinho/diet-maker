import { describe, expect, it, vi } from 'vitest';
import { createCustomFoodUseCases } from '@/lib/application/library/custom-food-use-cases';
import { customFoodInput } from '../../fixtures/library-fixtures';
import type { FoodCatalogRepository } from '@/lib/persistence/library-repository';

describe('custom food use cases', () => {
  it('resolves the active account and exposes actionable repository errors', async () => {
    const repository = {
      create: vi.fn().mockRejectedValue(new Error('db indisponível')),
    } as unknown as FoodCatalogRepository;
    const useCases = createCustomFoodUseCases({
      accountContext: { requireActive: vi.fn().mockRejectedValue(new Error('sem conta')), getActive: vi.fn() },
      repository,
    });
    await expect(useCases.create(customFoodInput)).rejects.toMatchObject({ code: 'LIBRARY_CONTEXT_MISSING' });
  });

  it('does not hide version conflicts or replace a failed save with success', async () => {
    const repository = {
      update: vi.fn().mockRejectedValue({ code: 'LIBRARY_VERSION_CONFLICT', message: 'versão antiga' }),
    } as unknown as FoodCatalogRepository;
    const useCases = createCustomFoodUseCases({
      accountContext: { requireActive: vi.fn().mockResolvedValue({ accountId: 'account-a', account: {} }), getActive: vi.fn() },
      repository,
    });
    await expect(useCases.update('food-a', 1, customFoodInput)).rejects.toMatchObject({ code: 'LIBRARY_VERSION_CONFLICT' });
    expect(repository.update).toHaveBeenCalledWith('account-a', 'food-a', 1, customFoodInput);
  });
});
