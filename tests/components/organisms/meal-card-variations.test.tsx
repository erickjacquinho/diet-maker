import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
  it('keeps the single-option card unchanged while exposing the add action in the menu', async () => {
    const onAddVariation = vi.fn();
    renderMealCard({ onAddVariation });

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mais ações da refeição' }), { button: 0 });
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Nova Variação' }));
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

  it('communicates the five-option limit and prevents another addition', async () => {
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

    expect(screen.getAllByRole('tab')).toHaveLength(5);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mais ações da refeição' }), { button: 0 });
    const menu = await screen.findByRole('menu');
    const addButton = within(menu).getByRole('menuitem', { name: 'Nova Variação' });
    expect(addButton).toHaveAttribute('data-disabled');
    expect(addButton).toHaveAttribute('aria-describedby', 'meal-breakfast-variation-limit');
    expect(screen.getByText(/Limite de 5 variações atingido/)).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(onAddVariation).not.toHaveBeenCalled();
  });

  it('places variation actions at the end of the menu using the generated label', async () => {
    const onRemoveVariation = vi.fn();
    renderMealCard({
      variationOptions: [
        { id: 'variation-1', label: 'Variação 1' },
        { id: 'variation-2', label: 'Variação 2' },
      ],
      activeVariationId: 'variation-2',
      onRemoveVariation,
    });

    expect(screen.getByRole('button', { name: 'Excluir refeição' })).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mais ações da refeição' }), { button: 0 });
    const menu = await screen.findByRole('menu');
    const separators = within(menu).getAllByRole('separator');
    const deleteItem = within(menu).getByRole('menuitem', { name: 'Excluir Variação' });

    expect(separators).toHaveLength(1);
    expect(separators[0].compareDocumentPosition(deleteItem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(deleteItem).toHaveClass('text-text-secondary', 'focus:bg-surface-hover', 'focus:text-text-primary');
    fireEvent.click(deleteItem);
    expect(onRemoveVariation).toHaveBeenCalledTimes(1);
  });
});
