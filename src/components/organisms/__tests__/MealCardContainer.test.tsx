import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { MealCardContainer } from '../MealCardContainer';

const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

beforeAll(() => {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    top: 100,
    bottom: 140,
    height: 40,
    left: 0,
    right: 500,
    width: 500,
    x: 0,
    y: 100,
    toJSON: () => {},
  });
});

afterAll(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
});

describe('MealCardContainer', () => {
  const mockReorder = vi.fn();
  const mockRemoveItem = vi.fn();

  const sampleItems = [
    { id: 'it-1', name: 'Arroz Integral', kcal: 130, protein: 3, carbs: 28, fats: 1, quantityGrams: 100 },
    { id: 'it-2', name: 'Feijão Preto', kcal: 90, protein: 6, carbs: 14, fats: 0.5, quantityGrams: 100 },
    { id: 'it-3', name: 'Frango Grelhado', kcal: 200, protein: 35, carbs: 0, fats: 4, quantityGrams: 150 },
  ];

  it('renders items with hover-only delete button and handles precise drag-and-drop indicator & reordering', () => {
    render(
      <MealCardContainer
        title="Almoço"
        time="12:00"
        kcal={420}
        proteinG={44}
        carbsG={42}
        fatsG={5.5}
        items={sampleItems}
        onReorderItems={mockReorder}
        onRemoveItem={mockRemoveItem}
      />
    );

    expect(screen.getByText('Arroz Integral')).toBeInTheDocument();
    expect(screen.getByText('Feijão Preto')).toBeInTheDocument();
    expect(screen.getByText('Frango Grelhado')).toBeInTheDocument();

    // Verify delete button is present within a hover-only opacity-0 wrapper
    const deleteButtons = screen.getAllByRole('button', { name: /remover/i });
    expect(deleteButtons).toHaveLength(3);
    expect(deleteButtons[0].parentElement).toHaveClass('opacity-0');
    expect(deleteButtons[0].parentElement).toHaveClass('group-hover/row:opacity-100');

    // Drag handle elements
    const arrozDragHandle = screen.getByLabelText('Reordenar Arroz Integral');
    const feijaoDragHandle = screen.getByLabelText('Reordenar Feijão Preto');
    expect(arrozDragHandle).toBeInTheDocument();
    expect(feijaoDragHandle).toBeInTheDocument();

    const mockDataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue('0'),
      effectAllowed: '',
      dropEffect: '',
    };

    // Drag first item (Arroz, index 0)
    fireEvent.dragStart(arrozDragHandle, { dataTransfer: mockDataTransfer });
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');

    const rows = screen.getAllByRole('row');
    // Row 0 is header, Row 1 is Arroz (0), Row 2 is Feijão (1), Row 3 is Frango (2)
    const feijaoRow = rows[2];

    // 1. Drag over upper half of Feijão (clientY = 110, top half)
    const topDragOver = createEvent.dragOver(feijaoRow);
    Object.defineProperty(topDragOver, 'clientY', { value: 110 });
    Object.defineProperty(topDragOver, 'dataTransfer', { value: mockDataTransfer });
    fireEvent(feijaoRow, topDragOver);

    expect(feijaoRow).toHaveClass('border-t-2');
    expect(feijaoRow).toHaveClass('border-t-primary');

    // 2. Drag over lower half of Feijão (clientY = 135, bottom half)
    const bottomDragOver = createEvent.dragOver(feijaoRow);
    Object.defineProperty(bottomDragOver, 'clientY', { value: 135 });
    Object.defineProperty(bottomDragOver, 'dataTransfer', { value: mockDataTransfer });
    fireEvent(feijaoRow, bottomDragOver);

    expect(feijaoRow).toHaveClass('border-b-2');
    expect(feijaoRow).toHaveClass('border-b-primary');

    // 3. Drop on bottom half of Feijão (inserts after index 1 -> target index becomes 1)
    const dropEvent = createEvent.drop(feijaoRow);
    Object.defineProperty(dropEvent, 'clientY', { value: 135 });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: mockDataTransfer });
    fireEvent(feijaoRow, dropEvent);

    expect(mockReorder).toHaveBeenCalledWith(0, 1);
  });
});
