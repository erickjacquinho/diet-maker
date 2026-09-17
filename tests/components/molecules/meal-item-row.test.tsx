import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MealItemRow } from '@/components/molecules/MealItemRow';

const renderMealRows = () =>
  render(
    <table>
      <tbody>
        <MealItemRow
          name="Arroz"
          kcal={130}
          protein={2.5}
          carbs={28}
          fats={0.2}
          quantityGrams={100}
        />
        <MealItemRow
          name="Feijão"
          kcal={76}
          protein={4.8}
          carbs={13.6}
          fats={0.5}
          quantityGrams={120}
        />
      </tbody>
    </table>
  );

describe('MealItemRow quantity keyboard navigation', () => {
  it('moves Tab to the next quantity input in the same meal', () => {
    renderMealRows();

    const firstInput = screen.getByRole('spinbutton', { name: /Arroz/i });
    const secondInput = screen.getByRole('spinbutton', { name: /Feijão/i });

    firstInput.focus();
    fireEvent.keyDown(firstInput, { key: 'Tab' });

    expect(document.activeElement).toBe(secondInput);
  });

  it('moves Shift+Tab back to the previous quantity input', () => {
    renderMealRows();

    const firstInput = screen.getByRole('spinbutton', { name: /Arroz/i });
    const secondInput = screen.getByRole('spinbutton', { name: /Feijão/i });

    secondInput.focus();
    fireEvent.keyDown(secondInput, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(firstInput);
  });

  it('propagates a valid quantity change immediately without losing focus', () => {
    const onQuantityChange = vi.fn();

    render(
      <table>
        <tbody>
          <MealItemRow
            name="Arroz"
            kcal={130}
            protein={2.5}
            carbs={28}
            fats={0.2}
            quantityGrams={100}
            onQuantityChange={onQuantityChange}
          />
        </tbody>
      </table>,
    );

    const input = screen.getByRole('spinbutton', { name: /Arroz/i });
    input.focus();
    fireEvent.change(input, { target: { value: '150' } });

    expect(onQuantityChange).toHaveBeenCalledWith(150);
    expect(document.activeElement).toBe(input);
  });

  it('keeps substitute and duplicate actions in the hover action column', () => {
    renderMealRows();

    const substituteButton = screen.getByRole('button', { name: 'Substituir Arroz' });
    const duplicateButton = screen.getByRole('button', { name: 'Duplicar Arroz' });

    expect(substituteButton).toHaveClass('border-border-control');
    expect(duplicateButton).toHaveClass('border-border-control');
    expect(substituteButton.parentElement).toHaveClass('invisible');
    expect(substituteButton.parentElement).toHaveClass('group-hover/row:visible');
    expect(substituteButton.parentElement).toHaveClass('group-focus-within/row:visible');
  });

  it('clears pointer focus after an action so the row returns to hover-only visibility', () => {
    const onSubstitute = vi.fn();

    render(
      <table>
        <tbody>
          <MealItemRow
            name="Arroz"
            kcal={130}
            protein={2.5}
            carbs={28}
            fats={0.2}
            quantityGrams={100}
            onSubstitute={onSubstitute}
          />
        </tbody>
      </table>,
    );

    const substituteButton = screen.getByRole('button', { name: 'Substituir Arroz' });
    substituteButton.focus();
    fireEvent.click(substituteButton, { detail: 1 });

    expect(onSubstitute).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(substituteButton);
  });
});
