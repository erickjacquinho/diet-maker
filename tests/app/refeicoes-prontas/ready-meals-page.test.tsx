import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import ReadyMealsPage from '@/app/refeicoes/page';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('ready meals page canonical boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty ready-meal state after relational loading', async () => {
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals: vi.fn().mockResolvedValue([]) });
    render(<ReadyMealsPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando refeições prontas');
    await waitFor(() => expect(screen.getByText('Nenhuma refeição cadastrada')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Arquivados' })).toBeDisabled();
  });

  it('toggles the archived view through the library filter', async () => {
    const listReadyMeals = vi.fn().mockResolvedValue([{
      id: 'meal-archived',
      name: 'Refeição arquivada',
      description: 'Arroz e frango',
      suggestedTime: '12:00',
      status: 'ARCHIVED',
      version: 1,
      items: [],
    }]);
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals });
    render(<ReadyMealsPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma refeição cadastrada')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Arquivados' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ver ativos' })).toBeInTheDocument();
      expect(screen.getByText('Refeição arquivada')).toBeInTheDocument();
    });
    expect(listReadyMeals).toHaveBeenLastCalledWith({ includeArchived: true });
  });

  it('returns to the active view after restoring the last archived meal', async () => {
    let restored = false;
    const archivedMeal = {
      id: 'meal-archived',
      name: 'Refeição arquivada',
      description: 'Arroz e frango',
      suggestedTime: '12:00',
      status: 'ARCHIVED',
      version: 1,
      items: [],
    };
    const listReadyMeals = vi.fn().mockImplementation(({ includeArchived } = {}) =>
      Promise.resolve(includeArchived && !restored ? [archivedMeal] : [])
    );
    const restoreReadyMeal = vi.fn().mockImplementation(async () => {
      restored = true;
    });
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals, restoreReadyMeal });
    render(<ReadyMealsPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma refeição cadastrada')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Arquivados' }));
    await waitFor(() => expect(screen.getByText('Refeição arquivada')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar Refeição Pronta' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Restaurar' }));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma refeição cadastrada')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Arquivados' })).toBeInTheDocument();
    });
  });

  it('shows the meal items and macros in the item-count tooltip', async () => {
    const listReadyMeals = vi.fn().mockResolvedValue([{
      id: 'meal-tooltip',
      name: 'Almoço',
      description: '',
      suggestedTime: '12:00',
      status: 'ACTIVE',
      version: 1,
      items: [{
        id: 'meal-item-1',
        sourceType: 'FOOD',
        sourceId: 'taco-arroz',
        quantity: '100',
        unit: 'g',
        itemSnapshot: {
          displayName: 'Arroz, tipo 1, cru',
          prescribedNutrients: { protein: '7.2', carbs: '78.8', fat: '0.3', energyKcal: '358' },
        },
      }],
    }]);
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals });
    render(<ReadyMealsPage />);

    await waitFor(() => expect(screen.getByText('Almoço')).toBeInTheDocument());
    fireEvent.focus(screen.getByText('1 item'));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Alimentos da refeição');
    expect(tooltip).toHaveTextContent('Macros da porção');
    expect(tooltip).toHaveTextContent('Arroz, tipo 1, cru');
    expect(tooltip).toHaveTextContent('P 7.2g');
    expect(tooltip).toHaveTextContent('C 78.8g');
    expect(tooltip).toHaveTextContent('G 0.3g');
    expect(tooltip).toHaveTextContent('358 kcal');
  });

  it('offers undo after deleting a meal', async () => {
    let deleted = false;
    const meal = {
      id: 'meal-1',
      name: 'Almoço',
      description: 'Arroz e frango',
      suggestedTime: '12:00',
      status: 'ACTIVE',
      version: 1,
      items: [],
    };
    const listReadyMeals = vi.fn().mockImplementation(() => Promise.resolve(deleted ? [] : [meal]));
    const deleteReadyMeal = vi.fn().mockImplementation(async () => {
      deleted = true;
    });
    const createReadyMeal = vi.fn().mockImplementation(async () => {
      deleted = false;
      return meal;
    });
    getBrowserLibraryApplication.mockResolvedValue({ listReadyMeals, deleteReadyMeal, createReadyMeal });
    render(<ReadyMealsPage />);

    await waitFor(() => expect(screen.getByText('Almoço')).toBeInTheDocument());
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('0 itens')).toHaveClass('text-style-chart-micro');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Refeição Pronta' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(deleteReadyMeal).toHaveBeenCalledWith('meal-1', 1));
    const deletedToast = vi.mocked(toast.success).mock.calls.find(([message]) => message === 'Refeição pronta excluída.');
    const toastOptions = deletedToast?.[1] as { duration: number; action: { label: string; onClick: () => void } };
    expect(toastOptions.duration).toBe(6000);
    expect(toastOptions.action.label).toBe('Desfazer');

    toastOptions.action.onClick();
    await waitFor(() => expect(createReadyMeal).toHaveBeenCalled());
    expect(screen.getByText('Almoço')).toBeInTheDocument();
  });
});
