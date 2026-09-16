import React from 'react';
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DietMealsSection } from '@/components/organisms/diet/DietMealsSection';
import type { MealCardContainerProps } from '@/components/organisms/MealCardContainer';

const meals: MealCardContainerProps[] = [
  {
    id: 'meal-1',
    title: 'Café da manhã',
    time: '08:00',
    kcal: 420,
    proteinG: 24,
    carbsG: 48,
    fatsG: 14,
    items: [{ id: 'food-1', name: 'Ovos', quantityGrams: 100, protein: 12, carbs: 1, fats: 10, kcal: 140 }],
  },
  {
    id: 'meal-2',
    title: 'Almoço',
    time: '12:00',
    kcal: 680,
    proteinG: 42,
    carbsG: 70,
    fatsG: 18,
    items: [],
  },
  {
    id: 'meal-3',
    title: 'Jantar',
    time: '20:00',
    kcal: 530,
    proteinG: 30,
    carbsG: 55,
    fatsG: 16,
    items: [],
  },
];

function pointerDownAt(element: HTMLElement, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerDown(element);
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(element, event);
}

function pointerMoveAt(target: Document, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerMove(target);
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
}

function pointerUpAt(target: Document, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerUp(target);
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
}

function cardRect(top: number, height = 72, left = 0, width = 420) {
  return { top, height, bottom: top + height, left, width, right: left + width, x: left, y: top } as DOMRect;
}

describe('DietMealsSection reorder flow', () => {
  it('hides reorder when there is no useful order to change', () => {
    render(<DietMealsSection mealsData={meals.slice(0, 1)} />);

    expect(screen.queryByRole('button', { name: 'Reordenar' })).not.toBeInTheDocument();
  });

  it('reorders cards locally and applies the order only after confirmation', () => {
    const onReorderMeals = vi.fn();
    render(<DietMealsSection mealsData={meals} onReorderMeals={onReorderMeals} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reordenar' }));
    const firstCard = screen.getByTestId('sortable-item-meal-1');
    const secondCard = screen.getByTestId('sortable-item-meal-2');
    const thirdCard = screen.getByTestId('sortable-item-meal-3');
    vi.spyOn(firstCard, 'getBoundingClientRect').mockReturnValue(cardRect(0));
    vi.spyOn(secondCard, 'getBoundingClientRect').mockReturnValue(cardRect(80));
    vi.spyOn(thirdCard, 'getBoundingClientRect').mockReturnValue(cardRect(160));

    pointerDownAt(firstCard, 1, 24, 24);
    pointerMoveAt(document, 1, 24, 130);
    pointerUpAt(document, 1, 24, 130);

    const reorderList = screen.getByRole('list', { name: 'Refeições para reordenar' });
    expect(within(reorderList).getAllByRole('listitem').map((item) => item.getAttribute('data-sortable-id')))
      .toEqual(['meal-2', 'meal-1', 'meal-3']);
    expect(onReorderMeals).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onReorderMeals).toHaveBeenCalledWith(['meal-2', 'meal-1', 'meal-3']);
  });

  it('opens a measured path and shifts neighboring cards during dragover', () => {
    render(<DietMealsSection mealsData={meals} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reordenar' }));
    const firstCard = screen.getByTestId('sortable-item-meal-1');
    const secondCard = screen.getByTestId('sortable-item-meal-2');
    const thirdCard = screen.getByTestId('sortable-item-meal-3');
    vi.spyOn(firstCard, 'getBoundingClientRect').mockReturnValue(cardRect(0));
    vi.spyOn(secondCard, 'getBoundingClientRect').mockReturnValue(cardRect(80));
    vi.spyOn(thirdCard, 'getBoundingClientRect').mockReturnValue(cardRect(160));

    pointerDownAt(firstCard, 1, 24, 24);
    pointerMoveAt(document, 1, 24, 130);

    const reorderList = screen.getByRole('list', { name: 'Refeições para reordenar' });
    expect(Array.from(reorderList.children).map((child) => child.getAttribute('data-sortable-id') || child.getAttribute('data-testid')))
      .toEqual(['meal-2', 'sortable-placeholder', 'meal-3']);
    expect(screen.getByTestId('sortable-placeholder')).toHaveStyle({ height: '72px' });
    expect(screen.getByTestId('sortable-drag-preview')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-item-meal-2')).toHaveClass('transition-transform');

    pointerUpAt(document, 1, 24, 130);
  });

  it('supports keyboard movement and asks before discarding a dirty modal', async () => {
    const onReorderMeals = vi.fn();
    render(<DietMealsSection mealsData={meals} onReorderMeals={onReorderMeals} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reordenar' }));
    fireEvent.keyDown(screen.getByTestId('sortable-item-meal-1'), { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Descartar alterações de ordem?');
    expect(onReorderMeals).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Descartar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the food summary in the item badge tooltip', async () => {
    render(<DietMealsSection mealsData={meals} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reordenar' }));
    const itemsBadge = screen.getByRole('status', { name: /1 item.*ver alimentos/i });
    fireEvent.focus(itemsBadge);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Ovos');
    expect(screen.getByRole('tooltip')).toHaveTextContent('100g');
    expect(screen.getByRole('tooltip')).toHaveTextContent('P 12g');
  });

});
