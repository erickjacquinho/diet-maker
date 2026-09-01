import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFoodSearchPage } from '@/hooks/useFoodSearchPage';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
const deleteCustomFood = vi.hoisted(() => vi.fn());

vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

describe('useFoodSearchPage delete confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBrowserLibraryApplication.mockResolvedValue({
      listCustomFoods: vi.fn().mockResolvedValue([{
        id: 'custom-food-1',
        accountId: 'account-a',
        name: 'Alimento customizado',
        description: '',
        measurementBasis: 'PER_100G',
        foodState: 'AS_SOLD',
        referenceNutrients: { protein: '10', carbs: '10', fat: '10', fiber: '1', energyKcal: '170' },
        energySource: 'REFERENCE',
        calculationVersion: 'test',
        status: 'ACTIVE',
        version: 2,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        archivedAt: null,
      }]),
      deleteCustomFood,
    });
    deleteCustomFood.mockResolvedValue(true);
  });

  it('waits for confirmation before deleting a custom food and supports cancellation', async () => {
    const { result } = renderHook(() => useFoodSearchPage());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.handleDeleteCustomFood('custom-food-1'));

    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(true);
    expect(deleteCustomFood).not.toHaveBeenCalled();

    act(() => result.current.handleCancelDeleteCustomFood());

    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(false);
    expect(deleteCustomFood).not.toHaveBeenCalled();

    act(() => result.current.handleDeleteCustomFood('custom-food-1'));
    await act(async () => { await result.current.handleConfirmDeleteCustomFood(); });

    expect(deleteCustomFood).toHaveBeenCalledWith('custom-food-1', 2);
    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(false);
  });
});
