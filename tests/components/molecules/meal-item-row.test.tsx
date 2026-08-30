import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  it('keeps substitute and duplicate actions in the hover action column', () => {
    renderMealRows();

    const substituteButton = screen.getByRole('button', { name: 'Substituir Arroz' });
    const duplicateButton = screen.getByRole('button', { name: 'Duplicar Arroz' });

    expect(substituteButton).toHaveClass('border-border-subtle');
    expect(duplicateButton).toHaveClass('border-border-subtle');
    expect(substituteButton.parentElement).toHaveClass('invisible');
    expect(substituteButton.parentElement).toHaveClass('group-hover/row:visible');
    expect(substituteButton.parentElement).toHaveClass('group-focus-within/row:visible');
  });
});
