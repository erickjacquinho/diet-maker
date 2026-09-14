import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { CreateRecipeModal } from '@/components/molecules/CreateRecipeModal';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('CreateRecipeModal layer consumers', () => {
  const recipeWithIngredient = {
    id: 'recipe-1',
    name: 'Receita teste',
    category: 'Café da Manhã',
    servings: 2,
    instructions: 'Misture e sirva.',
    ingredients: [{
      foodId: 'food-1',
      name: 'Arroz',
      amountGrams: 100,
      proteinG: 3,
      carbsG: 28,
      fatsG: 1,
      kcal: 130,
    }],
    createdAt: '2026-08-05T00:00:00.000Z',
  };

  it('opens the shared food picker for ingredients', async () => {
    render(
      <CreateRecipeModal
        open
        recipe={null}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Alimento' }));

    expect(screen.getByText(/Adicionar à Refeição "Receita"/i)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Adicionar Ingredientes' })).not.toBeInTheDocument();
  });

  it('keeps select content above the modal when a category is opened', async () => {
    render(
      <CreateRecipeModal
        open
        recipe={null}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const category = screen.getByRole('combobox');
    fireEvent.click(category);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toHaveClass('z-modal');
    });
  });

  it('connects ingredient substitution and duplication actions', async () => {
    const { unmount } = render(
      <CreateRecipeModal
        open
        recipe={recipeWithIngredient}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Substituir Arroz' }));
    expect(await screen.findByText(/Substituir Alimento em "Receita teste"/i)).toBeInTheDocument();

    unmount();
    render(
      <CreateRecipeModal
        open
        recipe={recipeWithIngredient}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Duplicar Arroz' }));
    expect(screen.getAllByRole('button', { name: 'Duplicar Arroz' })).toHaveLength(2);
  });

  it('confirms before discarding dirty changes from a backdrop click', async () => {
    const onOpenChange = vi.fn();

    render(
      <CreateRecipeModal
        open
        recipe={recipeWithIngredient}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Nome da Receita' });
    fireEvent.change(name, { target: { value: 'Receita alterada' } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const overlay = document.querySelector('[data-state="open"].z-overlay');
    expect(overlay).toBeInTheDocument();
    fireEvent.pointerDown(overlay!, { button: 0, pointerType: 'mouse' });
    fireEvent.click(overlay!, { button: 0 });

    expect(await screen.findByRole('heading', { name: 'Descartar alterações?' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));
    expect(name).toHaveValue('Receita alterada');
  });
});
