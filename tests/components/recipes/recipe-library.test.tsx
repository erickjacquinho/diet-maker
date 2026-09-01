import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeCard } from '@/components/molecules/RecipeCard';

describe('recipe library surface', () => {
  it('renders per-portion nutrition and exposes keyboard-operable actions', () => {
    const onInsert = vi.fn();
    render(
      <RecipeCard
        recipe={{
          id: 'recipe-ui',
          name: 'Panqueca proteica',
          category: 'Café da Manhã',
          servings: 2,
          instructions: 'Misture e asse.',
          ingredients: [{ foodId: 'taco-1', name: 'Ovo', amountGrams: 100, proteinG: 13, carbsG: 1, fatsG: 10, kcal: 146 }],
          createdAt: '2026-09-01',
          libraryVersion: 3,
        }}
        onInsert={onInsert}
      />,
    );

    expect(screen.getByText('Valores por 1 porção (1 ingredientes)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prescrever' })).toBeVisible();
    screen.getByRole('button', { name: 'Prescrever' }).focus();
    expect(screen.getByRole('button', { name: 'Prescrever' })).toHaveFocus();
  });
});
