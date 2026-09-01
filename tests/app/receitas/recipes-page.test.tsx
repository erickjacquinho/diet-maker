import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecipesPage from '@/app/receitas/page';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

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
  });

  it('reports a facade failure without falling back to recipesStore', async () => {
    getBrowserLibraryApplication.mockRejectedValue(new Error('Falha ao abrir biblioteca'));
    render(<RecipesPage />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Falha ao abrir biblioteca'));
  });
});
