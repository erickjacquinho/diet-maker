import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealCardContainer } from '@/components/organisms/MealCardContainer';

const mealItem = {
  id: 'food-1',
  name: 'Aveia',
  kcal: 150,
  protein: 5,
  carbs: 27,
  fats: 3,
  quantityGrams: 40,
};

const renderMealCard = (
  overrides: Partial<React.ComponentProps<typeof MealCardContainer>> = {},
) =>
  render(
    <MealCardContainer
      title="Café da manhã"
      time="08:00"
      kcal={420}
      proteinG={24}
      carbsG={48}
      fatsG={14}
      items={[mealItem]}
      {...overrides}
    />,
  );

const openMealActions = async () => {
  fireEvent.pointerDown(screen.getByRole('button', { name: 'Mais ações da refeição' }), {
    button: 0,
    ctrlKey: false,
  });
  return screen.findByRole('menu');
};

describe('MealCardContainer actions menu', () => {
  it('opens from the three-dot button and keeps secondary actions in the menu', async () => {
    renderMealCard({ canPasteMeal: true, onAddVariation: vi.fn() });

    expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Colar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Duplicar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Escalar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir refeição' })).toBeInTheDocument();

    const menu = await openMealActions();

    expect(within(menu).getByRole('menuitem', { name: 'Duplicar' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Copiar' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Colar' })).toBeInTheDocument();
    const pasteAndReplaceItem = within(menu).getByRole('menuitem', { name: 'Colar e substituir' });
    expect(pasteAndReplaceItem).toBeInTheDocument();
    expect(menu).toHaveClass('rounded-control', 'border-border-subtle', 'bg-surface', 'shadow-floating');
    expect(pasteAndReplaceItem).toHaveClass('text-style-nav-item', 'text-text-primary', 'transition-colors', 'duration-fast', 'focus:bg-surface-hover');
    expect(within(menu).getByRole('menuitem', { name: 'Escalar' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Nova Variação' })).toBeInTheDocument();
    expect(within(menu).queryByRole('menuitem', { name: 'Excluir da refeição' })).not.toBeInTheDocument();
  });

  it('opens the canonical dropdown below the trigger with semantic spacing', async () => {
    renderMealCard();
    const menu = await openMealActions();
    expect(document.querySelector('[aria-label="Mais ações da refeição"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(menu).toHaveClass('-ml-0.5', 'mt-1');
  });

  it.each([
    ['Duplicar', 'onDuplicate'],
    ['Copiar', 'onCopyMeal'],
    ['Colar', 'onPasteMeal'],
    ['Nova Variação', 'onAddVariation'],
  ] as const)('calls the %s action from the menu', async (label, propName) => {
    const onAction = vi.fn();

    renderMealCard({
      canPasteMeal: true,
      [propName]: onAction,
    });

    const menu = await openMealActions();
    fireEvent.click(within(menu).getByRole('menuitem', { name: label }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('requires an alert confirmation before replacing meal items', async () => {
    const onPasteMealAndReplace = vi.fn();

    renderMealCard({ canPasteMeal: true, onPasteMealAndReplace });

    const menu = await openMealActions();
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Colar e substituir' }));

    const alert = await screen.findByRole('alertdialog');
    expect(within(alert).getByRole('heading', { name: 'Substituir alimentos?' })).toBeInTheDocument();
    expect(within(alert).getByText(/serão removidos e substituídos/i)).toBeInTheDocument();

    fireEvent.click(within(alert).getByRole('button', { name: 'Cancelar' }));
    expect(onPasteMealAndReplace).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Mais ações da refeição' }), {
      button: 0,
      ctrlKey: false,
    });
    const reopenedMenu = await screen.findByRole('menu');
    fireEvent.click(within(reopenedMenu).getByRole('menuitem', { name: 'Colar e substituir' }));
    const reopenedAlert = await screen.findByRole('alertdialog');
    fireEvent.click(within(reopenedAlert).getByRole('button', { name: 'Substituir' }));

    expect(onPasteMealAndReplace).toHaveBeenCalledTimes(1);
  });

  it('disables menu actions using the same state as the visible buttons', async () => {
    renderMealCard({
      items: [],
      canPasteMeal: false,
      scaleDisabled: true,
    });

    expect(screen.getByRole('button', { name: 'Excluir refeição' })).toBeInTheDocument();
    const menu = await openMealActions();

    expect(within(menu).getByRole('menuitem', { name: 'Copiar' })).toHaveAttribute('data-disabled');
    expect(within(menu).getByRole('menuitem', { name: 'Colar' })).toHaveAttribute('data-disabled');
    expect(within(menu).getByRole('menuitem', { name: 'Colar e substituir' })).toHaveAttribute('data-disabled');
    expect(within(menu).getByRole('menuitem', { name: 'Escalar' })).toHaveAttribute('data-disabled');
    expect(within(menu).getByRole('menuitem', { name: 'Duplicar' })).not.toHaveAttribute('data-disabled');
    expect(within(menu).queryByRole('menuitem', { name: 'Excluir da refeição' })).not.toBeInTheDocument();
  });

  it('keeps scaling disabled even when a scale callback is provided', async () => {
    const onScale = vi.fn();
    renderMealCard({ onScale, scaleDisabled: false });

    const menu = await openMealActions();
    const scaleItem = within(menu).getByRole('menuitem', { name: 'Escalar' });

    expect(scaleItem).toHaveAttribute('data-disabled');
    fireEvent.click(scaleItem);
    expect(onScale).not.toHaveBeenCalled();
  });

  it('dismisses through the native dropdown Escape interaction', async () => {
    renderMealCard();
    const menu = await openMealActions();

    fireEvent.keyDown(menu, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});
