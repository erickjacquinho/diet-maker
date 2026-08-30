import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealCardContainer } from '@/components/organisms/MealCardContainer';

const renderMealCard = (overrides: Partial<React.ComponentProps<typeof MealCardContainer>> = {}) =>
  render(
    <MealCardContainer
      id="meal-breakfast"
      title="Café da manhã"
      time="08:00"
      kcal={420}
      proteinG={24}
      carbsG={48}
      fatsG={14}
      items={[]}
      {...overrides}
    />,
  );

describe('MealCardContainer meal variations', () => {
  it('keeps the single-option card unchanged while exposing the add action', () => {
    const onAddVariation = vi.fn();
    renderMealCard({ onAddVariation });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar variação' }));
    expect(onAddVariation).toHaveBeenCalledTimes(1);
  });

  it('renders controlled variation tabs and reports the selected option', () => {
    const onVariationChange = vi.fn();
    renderMealCard({
      variationOptions: [
        { id: 'meal-breakfast::variation-1', label: 'Variação 1' },
        { id: 'variation-2', label: 'Variação 2' },
      ],
      activeVariationId: 'variation-2',
      onVariationChange,
    });

    expect(screen.getByRole('tablist', { name: 'Variações da refeição' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Variação 1' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Variação 2' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Variação 1' }));
    expect(onVariationChange).toHaveBeenCalledWith('meal-breakfast::variation-1');
  });

  it('communicates the five-option limit and prevents another addition', () => {
    const onAddVariation = vi.fn();
    renderMealCard({
      variationOptions: Array.from({ length: 5 }, (_, index) => ({
        id: `variation-${index + 1}`,
        label: `Variação ${index + 1}`,
      })),
      activeVariationId: 'variation-5',
      onAddVariation,
      variationLimitReached: true,
    });

    const addButton = screen.getByRole('button', { name: 'Adicionar variação' });
    expect(addButton).toBeDisabled();
    expect(addButton).toHaveAttribute('aria-describedby', 'meal-breakfast-variation-limit');
    expect(screen.getByText(/Limite de 5 variações atingido/)).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(5);

    fireEvent.click(addButton);
    expect(onAddVariation).not.toHaveBeenCalled();
  });

  it('deletes the active option using its generated label', () => {
    const onRemoveVariation = vi.fn();
    renderMealCard({
      variationOptions: [
        { id: 'variation-1', label: 'Variação 1' },
        { id: 'variation-2', label: 'Variação 2' },
      ],
      activeVariationId: 'variation-2',
      onRemoveVariation,
    });

    const deleteButton = screen.getByRole('button', { name: 'Excluir Variação 2' });
    expect(deleteButton).toHaveAttribute('title', 'Excluir Variação 2');
    fireEvent.click(deleteButton);
    expect(onRemoveVariation).toHaveBeenCalledTimes(1);
  });
});
