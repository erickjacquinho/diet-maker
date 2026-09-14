import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import RecipesPage from '@/app/receitas/page';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('recipes page canonical boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state after loading through the library facade', async () => {
    getBrowserLibraryApplication.mockResolvedValue({ listRecipes: vi.fn().mockResolvedValue([]) });
    render(<RecipesPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando receitas');
    await waitFor(() => expect(screen.getByText('Nenhuma receita encontrada')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Criar Primeira Receita' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Arquivados' })).toBeDisabled();
  });

  it('reports a facade failure without falling back to recipesStore', async () => {
    getBrowserLibraryApplication.mockRejectedValue(new Error('Falha ao abrir biblioteca'));
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Falha ao abrir biblioteca'));
  });

  it('toggles the archived view through the library filter', async () => {
    const listRecipes = vi.fn().mockResolvedValue([{
      id: 'recipe-archived',
      name: 'Receita arquivada',
      category: 'Almoço',
      instructions: '',
      yieldPortions: '1',
      ingredients: [],
      status: 'ARCHIVED',
      version: 1,
      createdAt: '2026-09-14T00:00:00.000Z',
    }]);
    getBrowserLibraryApplication.mockResolvedValue({ listRecipes });
    render(<RecipesPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma receita encontrada')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Arquivados' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ver ativas' })).toBeInTheDocument();
      expect(screen.getByText('Receita arquivada')).toBeInTheDocument();
    });
    expect(listRecipes).toHaveBeenLastCalledWith({ includeArchived: true });
  });

  it('returns to the active view after restoring the last archived recipe', async () => {
    let restored = false;
    const archivedRecipe = {
      id: 'recipe-archived',
      name: 'Receita arquivada',
      category: 'Almoço',
      instructions: '',
      yieldPortions: '1',
      ingredients: [],
      status: 'ARCHIVED',
      version: 1,
      createdAt: '2026-09-14T00:00:00.000Z',
    };
    const listRecipes = vi.fn().mockImplementation(({ includeArchived } = {}) =>
      Promise.resolve(includeArchived && !restored ? [archivedRecipe] : [])
    );
    const restoreRecipe = vi.fn().mockImplementation(async () => {
      restored = true;
    });
    getBrowserLibraryApplication.mockResolvedValue({ listRecipes, restoreRecipe });
    render(<RecipesPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma receita encontrada')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Arquivados' }));
    await waitFor(() => expect(screen.getByText('Receita arquivada')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar Receita' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Restaurar Receita' }));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma receita encontrada')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Arquivados' })).toBeInTheDocument();
    });
  });

  it('offers undo after deleting a recipe', async () => {
    let deleted = false;
    const recipe = {
      id: 'recipe-1',
      name: 'Receita de teste',
      category: 'Almoço',
      instructions: 'Misture tudo.',
      yieldPortions: '2',
      ingredients: [],
      status: 'ACTIVE',
      version: 1,
      createdAt: '2026-09-14T00:00:00.000Z',
    };
    const listRecipes = vi.fn().mockImplementation(() => Promise.resolve(deleted ? [] : [recipe]));
    const deleteRecipe = vi.fn().mockImplementation(async () => {
      deleted = true;
    });
    const createRecipe = vi.fn().mockImplementation(async () => {
      deleted = false;
      return recipe;
    });
    getBrowserLibraryApplication.mockResolvedValue({ listRecipes, deleteRecipe, createRecipe });
    render(<RecipesPage />);

    await waitFor(() => expect(screen.getByText('Receita de teste')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Excluir Receita' }));
    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: /Pressione e segure/ });
    vi.useFakeTimers();
    fireEvent.pointerDown(confirmButton, { button: 0 });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    vi.useRealTimers();

    await waitFor(() => expect(deleteRecipe).toHaveBeenCalledWith('recipe-1', 1));
    const deletedToast = vi.mocked(toast.success).mock.calls.find(([message]) => message === 'Receita excluída do catálogo');
    const toastOptions = deletedToast?.[1] as { duration: number; action: { label: string; onClick: () => void } };
    expect(toastOptions.duration).toBe(6000);
    expect(toastOptions.action.label).toBe('Desfazer');

    toastOptions.action.onClick();
    await waitFor(() => expect(createRecipe).toHaveBeenCalled());
    expect(screen.getByText('Receita de teste')).toBeInTheDocument();
  });
});
