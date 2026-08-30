import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteMealFoodModal } from '@/components/molecules/DeleteMealFoodModal';

describe('DeleteMealFoodModal', () => {
  it('renders confirmation dialog with food details, quantity and meal name', () => {
    render(
      <DeleteMealFoodModal
        open
        foodName="Arroz Integral Cozido"
        mealName="Almoço"
        quantityGrams={150}
        onOpenChange={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: /Confirmar Remoção de Alimento/ })).toBeInTheDocument();
    expect(screen.getByText('Arroz Integral Cozido')).toBeInTheDocument();
    expect(screen.getByText(/\(150g\)/)).toBeInTheDocument();
    expect(screen.getByText('Almoço')).toBeInTheDocument();
    expect(
      screen.getByText(/Os macronutrientes e calorias totais da refeição e da dieta serão recalculados/i)
    ).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when clicking Cancelar button', () => {
    const handleOpenChange = vi.fn();
    render(
      <DeleteMealFoodModal
        open
        foodName="Arroz Integral Cozido"
        onOpenChange={handleOpenChange}
        onConfirmDelete={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('triggers onConfirmDelete via keyboard shortcut Ctrl+S', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteMealFoodModal
        open
        foodName="Arroz Integral Cozido"
        onOpenChange={vi.fn()}
        onConfirmDelete={handleConfirm}
      />
    );

    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders hold-to-delete confirmation button with accessible attributes', () => {
    render(
      <DeleteMealFoodModal
        open
        foodName="Frango Grelhado"
        mealName="Jantar"
        onOpenChange={vi.fn()}
        onConfirmDelete={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Sim, Remover Alimento/i });
    expect(confirmButton).toBeInTheDocument();
  });
});
