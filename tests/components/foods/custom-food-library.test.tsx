import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FoodsPage from '@/app/alimentos/page';
import { customFoodInput } from '../../fixtures/library-fixtures';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());

vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

describe('custom food library surface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('announces loading and then renders account-scoped custom food data', async () => {
    getBrowserLibraryApplication.mockResolvedValue({
      listCustomFoods: vi.fn().mockResolvedValue([{
        id: 'custom-ui-food',
        accountId: 'account-a',
        ...customFoodInput,
        status: 'ACTIVE',
        version: 2,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        archivedAt: null,
      }]),
    });

    render(<FoodsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando biblioteca de alimentos');
    await waitFor(() => expect(getBrowserLibraryApplication).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Customizados' }));
    await waitFor(() => expect(screen.getByText('Iogurte proteico')).toBeInTheDocument());
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('exposes an actionable error state when the canonical library is unavailable', async () => {
    getBrowserLibraryApplication.mockRejectedValue(new Error('Banco local indisponível'));

    render(<FoodsPage />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Banco local indisponível'));
  });
});
