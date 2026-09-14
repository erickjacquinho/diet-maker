import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoodSearchModal } from '@/components/organisms/foods/FoodSearchModal';

const getBrowserLibraryApplication = vi.hoisted(() => vi.fn());
vi.mock('@/lib/application/browser-composition', () => ({ getBrowserLibraryApplication }));

const recipe = {
  id: 'recipe-picker',
  accountId: 'account-a',
  name: 'Receita do picker',
  category: 'Café da Manhã',
  instructions: 'Misturar.',
  prepTimeMinutes: 5,
  yieldPortions: '2',
  nutrition: { total: {}, perPortion: {} },
  status: 'ACTIVE',
  version: 3,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  archivedAt: null,
  ingredients: [],
};

const readyMeal = {
  id: 'ready-meal-picker',
  accountId: 'account-a',
  name: 'Bloco do picker',
  description: 'Ovo e aveia',
  suggestedTime: '08:00',
  status: 'ACTIVE',
  version: 2,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  archivedAt: null,
  items: [],
};

describe('library picker in the diet editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBrowserLibraryApplication.mockResolvedValue({
      listCustomFoods: vi.fn().mockResolvedValue([]),
      listRecipes: vi.fn().mockResolvedValue([recipe]),
      listReadyMeals: vi.fn().mockResolvedValue([readyMeal]),
    });
  });

  it('loads reusable sources and inserts a selected recipe without using the legacy picker path', async () => {
    const onAddRecipe = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen
        onClose={onClose}
        onAddFood={vi.fn()}
        enableLibrarySources
        onAddRecipe={onAddRecipe}
        onAddReadyMeal={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /Receitas/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Receitas/ }));
    const table = await screen.findByRole('table', { name: 'Lista de receitas culinárias calculadas por porção' });
    fireEvent.click(within(table).getByRole('row', { name: /Receita do picker/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Inserir na Dieta' }));

    await waitFor(() => expect(onAddRecipe).toHaveBeenCalledWith('recipe-picker'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('refreshes the favorite state for foods loaded into the diet picker', async () => {
    render(
      <FoodSearchModal
        isOpen
        onClose={vi.fn()}
        onAddFood={vi.fn()}
        enableLibrarySources
        onAddRecipe={vi.fn()}
        onAddReadyMeal={vi.fn()}
      />,
    );

    const table = await screen.findByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    const favoriteButton = within(table).getAllByRole('button', { name: /^Favoritar / })[0];

    fireEvent.click(favoriteButton);

    expect(within(table).getByRole('button', { name: /^Remover .* dos favoritos$/ })).toBeInTheDocument();
  });
});
