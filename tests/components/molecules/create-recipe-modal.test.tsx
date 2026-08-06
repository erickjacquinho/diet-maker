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
  it('keeps ingredient search results on the local dropdown layer', async () => {
    render(
      <CreateRecipeModal
        open
        recipe={null}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const search = screen.getByRole('textbox', { name: 'Adicionar Ingredientes' });
    fireEvent.change(search, { target: { value: 'ovo' } });

    const results = await waitFor(() => {
      const element = document.querySelector('.z-dropdown');
      if (!element) throw new Error('Ingredient results were not rendered');
      return element;
    });

    expect(results).toBeInTheDocument();
    expect(results).toHaveTextContent(/kcal/i);
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
});
