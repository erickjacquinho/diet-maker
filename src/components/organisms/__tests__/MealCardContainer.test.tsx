import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealCardContainer } from '../MealCardContainer';

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

function rowRect(top: number, height = 40) {
  return { top, height, bottom: top + height, left: 0, width: 500, right: 500, x: 0, y: top } as DOMRect;
}

describe('MealCardContainer', () => {
  const sampleItems = [
    { id: 'it-1', name: 'Arroz Integral', kcal: 130, protein: 3, carbs: 28, fats: 1, quantityGrams: 100 },
    { id: 'it-2', name: 'Feijão Preto', kcal: 90, protein: 6, carbs: 14, fats: 0.5, quantityGrams: 100 },
    { id: 'it-3', name: 'Frango Grelhado', kcal: 200, protein: 35, carbs: 0, fats: 4, quantityGrams: 150 },
  ];

  it('renders item actions and reorders the whole row with SortableList', () => {
    const onReorderItems = vi.fn();
    const onRemoveItem = vi.fn();

    render(
      <MealCardContainer
        title="Almoço"
        time="12:00"
        kcal={420}
        proteinG={44}
        carbsG={42}
        fatsG={5.5}
        items={sampleItems}
        onReorderItems={onReorderItems}
        onRemoveItem={onRemoveItem}
      />
    );

    expect(screen.getByText('Arroz Integral')).toBeInTheDocument();
    expect(screen.getByText('Feijão Preto')).toBeInTheDocument();
    expect(screen.getByText('Frango Grelhado')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remover/i })).toHaveLength(3);

    const firstRow = screen.getByTestId('sortable-item-it-1');
    const secondRow = screen.getByTestId('sortable-item-it-2');
    const thirdRow = screen.getByTestId('sortable-item-it-3');
    vi.spyOn(firstRow, 'getBoundingClientRect').mockReturnValue(rowRect(0));
    vi.spyOn(secondRow, 'getBoundingClientRect').mockReturnValue(rowRect(80));
    vi.spyOn(thirdRow, 'getBoundingClientRect').mockReturnValue(rowRect(160));

    pointerDownAt(firstRow, 1, 24, 24);
    pointerMoveAt(document, 1, 24, 130);
    const preview = screen.getByTestId('sortable-drag-preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveStyle({ width: '500px', height: '40px' });
    expect(screen.getByTestId('sortable-placeholder')).toBeInTheDocument();

    pointerUpAt(document, 1, 24, 130);
    expect(onReorderItems).toHaveBeenCalledWith(0, 1);
  });

  it('supports keyboard reorder on the table row', () => {
    const onReorderItems = vi.fn();

    render(
      <MealCardContainer
        title="Almoço"
        time="12:00"
        kcal={420}
        proteinG={44}
        carbsG={42}
        fatsG={5.5}
        items={sampleItems}
        onReorderItems={onReorderItems}
      />
    );

    fireEvent.keyDown(screen.getByTestId('sortable-item-it-1'), { key: 'ArrowDown' });
    expect(onReorderItems).toHaveBeenCalledWith(0, 1);
  });
});
