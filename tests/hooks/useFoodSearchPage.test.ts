import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFoodSearchPage } from '@/hooks/useFoodSearchPage';

const { getAllFoods, deleteCustomFood } = vi.hoisted(() => ({
  getAllFoods: vi.fn(() => []),
  deleteCustomFood: vi.fn(),
}));

vi.mock('@/lib/tacoStore', () => ({
  getAllFoods,
  toggleFavoriteFood: vi.fn(),
  addCustomFood: vi.fn(),
  updateCustomFood: vi.fn(),
  deleteCustomFood,
  scoreFoodItem: vi.fn(() => 0),
}));

describe('useFoodSearchPage delete confirmation', () => {
  beforeEach(() => {
    getAllFoods.mockClear();
    deleteCustomFood.mockClear();
  });

  it('waits for confirmation before deleting a custom food and supports cancellation', () => {
    const { result } = renderHook(() => useFoodSearchPage());

    act(() => result.current.handleDeleteCustomFood('custom-food-1'));

    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(true);
    expect(deleteCustomFood).not.toHaveBeenCalled();

    act(() => result.current.handleCancelDeleteCustomFood());

    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(false);
    expect(deleteCustomFood).not.toHaveBeenCalled();

    act(() => result.current.handleDeleteCustomFood('custom-food-1'));
    act(() => result.current.handleConfirmDeleteCustomFood());

    expect(deleteCustomFood).toHaveBeenCalledWith('custom-food-1');
    expect(result.current.isDeleteCustomFoodConfirmationOpen).toBe(false);
  });
});
