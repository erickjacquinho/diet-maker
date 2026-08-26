import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SubstituteFoodModal, MealFoodToSubstitute } from '@/components/molecules/SubstituteFoodModal';

const mockFoodToSubstitute: MealFoodToSubstitute = {
  mealId: 'meal-1',
  mealName: 'Almoço',
  itemId: 'item-101',
  foodName: 'Arroz, tipo 1, cozido',
  quantityGrams: 150,
  protein: 3.8,
  carbs: 42.2,
  fats: 0.3,
  kcal: 192,
};

describe('SubstituteFoodModal component', () => {
  it('renders modal with target meal name, current food, and preserved quantity badge', () => {
    const handleClose = vi.fn();
    const handleSubstitute = vi.fn();

    render(
      <SubstituteFoodModal
        isOpen={true}
        onClose={handleClose}
        foodToSubstitute={mockFoodToSubstitute}
        onSubstituteFood={handleSubstitute}
      />
    );

    // Dialog title and header
    expect(screen.getByText(/Substituir Alimento em "Almoço"/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Arroz, tipo 1, cozido/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/150g preservados/i)).toBeInTheDocument();
    expect(screen.getByText(/P:/i)).toBeInTheDocument();
    expect(screen.getByText('192 kcal')).toBeInTheDocument();

  });

  it('searches for candidate foods in the TACO database', () => {
    const handleClose = vi.fn();
    const handleSubstitute = vi.fn();

    render(
      <SubstituteFoodModal
        isOpen={true}
        onClose={handleClose}
        foodToSubstitute={mockFoodToSubstitute}
        onSubstituteFood={handleSubstitute}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar alimento substituto na base TACO/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Batata, doce, cozida' } });
    expect(screen.getAllByText(/Batata, doce/i).length).toBeGreaterThan(0);
  });

  it('keeps the replacement flow aligned with the add-food alert without an extra macro preview', () => {
    const handleClose = vi.fn();
    const handleSubstitute = vi.fn();

    render(
      <SubstituteFoodModal
        isOpen={true}
        onClose={handleClose}
        foodToSubstitute={mockFoodToSubstitute}
        onSubstituteFood={handleSubstitute}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar alimento substituto na base TACO/i);
    fireEvent.change(searchInput, { target: { value: 'Batata, doce, cozida' } });

    const rows = screen.getAllByRole('row');
    // Header is row 0, first result is row 1
    expect(rows.length).toBeGreaterThan(1);

    // Click on the first search result row
    fireEvent.click(rows[1]);

    // Selection only enables the confirmation action; the add-food alert's table remains the only macro table.
    expect(screen.queryByText(/Novo Alimento Selecionado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/150g mantidos/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Alimento substituto selecionado/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Substituir por/i });
    expect(submitBtn).toBeEnabled();
    expect(submitBtn).toHaveTextContent('150g');
  });

  it('calls onSubstituteFood with mealId, itemId, and selected food when confirming substitution', () => {
    const handleClose = vi.fn();
    const handleSubstitute = vi.fn();

    render(
      <SubstituteFoodModal
        isOpen={true}
        onClose={handleClose}
        foodToSubstitute={mockFoodToSubstitute}
        onSubstituteFood={handleSubstitute}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar alimento substituto na base TACO/i);
    fireEvent.change(searchInput, { target: { value: 'Batata, doce, cozida' } });

    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[1]);

    const submitBtn = screen.getByRole('button', { name: /Substituir por/i });
    fireEvent.click(submitBtn);

    expect(handleSubstitute).toHaveBeenCalledTimes(1);
    expect(handleSubstitute).toHaveBeenCalledWith(
      'meal-1',
      'item-101',
      expect.objectContaining({
        id: expect.any(String),
        name: expect.stringMatching(/Batata/i),
      })
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when clicking Cancelar button', () => {
    const handleClose = vi.fn();
    const handleSubstitute = vi.fn();

    render(
      <SubstituteFoodModal
        isOpen={true}
        onClose={handleClose}
        foodToSubstitute={mockFoodToSubstitute}
        onSubstituteFood={handleSubstitute}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleSubstitute).not.toHaveBeenCalled();
  });
});
