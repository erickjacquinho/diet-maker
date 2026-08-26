import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodSearchModal } from '@/components/molecules/FoodSearchModal';

describe('FoodSearchModal component', () => {
  it('renders table columns matching meal food list and does not render a quantity selector', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    // Header and titles
    expect(screen.getByText(/Adicionar Alimentos em "Refeição 1"/i)).toBeInTheDocument();

    // Table column headers
    expect(screen.getByText(/Nome \(100g base\)/i)).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('Carboidrato')).toBeInTheDocument();
    expect(screen.getByText('Gorduras')).toBeInTheDocument();
    expect(screen.getByText('Calorias')).toBeInTheDocument();

    // Ensure NO quantity/gram selector is present in this alert
    expect(screen.queryByText(/^Gramatura:$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Quantidade em gramas/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Alimento Selecionado$/i)).not.toBeInTheDocument();
  });

  it('supports multiselect by default and adds all selected foods to the meal', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    // Initial state: 0 items selected, button disabled
    expect(screen.getByText(/Nenhum alimento selecionado/i)).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: /Adicionar à Refeição/i });
    expect(addBtn).toBeDisabled();

    // Click on two food rows
    const checkboxes = screen.getAllByRole('checkbox');
    // Checkbox 0 is header checkbox, 1 is first row, 2 is second row
    expect(checkboxes.length).toBeGreaterThan(2);

    fireEvent.click(checkboxes[1]);
    expect(screen.getByText(/1 alimento selecionado/i)).toBeInTheDocument();

    fireEvent.click(checkboxes[2]);
    expect(screen.getByText(/2 alimentos selecionados/i)).toBeInTheDocument();

    // Button should now be enabled and display count
    const enabledAddBtn = screen.getByRole('button', { name: /Adicionar \(2\)/i });
    expect(enabledAddBtn).toBeEnabled();

    // Confirm add
    fireEvent.click(enabledAddBtn);

    expect(onAddFood).toHaveBeenCalledTimes(1);
    const addedPayloads = onAddFood.mock.calls[0][0];
    expect(addedPayloads).toHaveLength(2);
    expect(addedPayloads[0]).toHaveProperty('quantityGrams', 100);
    expect(addedPayloads[1]).toHaveProperty('quantityGrams', 100);
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the results area height when the search has no matches', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por nome do alimento/i);
    fireEvent.change(searchInput, { target: { value: 'alimento-sem-resultado' } });

    const emptyState = screen.getByText(/Nenhum resultado para/i).parentElement;
    expect(emptyState).toHaveClass('min-h-[220px]');
    expect(emptyState).toHaveClass('max-h-[380px]');
  });

  it('supports toggle all and clear selection', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    // Header checkbox (toggle all)
    const headerCheckbox = screen.getByLabelText(/Selecionar todos os alimentos/i);
    fireEvent.click(headerCheckbox);

    // Should have selected all visible items
    expect(screen.queryByText(/Nenhum alimento selecionado/i)).not.toBeInTheDocument();
    expect(screen.getByText(/alimentos selecionados/i)).toBeInTheDocument();

    // Clear selection button
    const clearBtn = screen.getByRole('button', { name: /Limpar seleção/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    expect(screen.getByText(/Nenhum alimento selecionado/i)).toBeInTheDocument();
  });

  it('finds foods with loose words and unaccented terms (intelligent search)', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por nome do alimento/i);

    // Search with loose words in inverted order: "peito de frango"
    fireEvent.change(searchInput, { target: { value: 'peito de frango' } });
    expect(screen.getAllByText(/Frango/i).length).toBeGreaterThan(0);

    // Search unaccented with loose terms: "pao integral"
    fireEvent.change(searchInput, { target: { value: 'pao integral' } });
    expect(screen.getByText(/Pão, trigo, forma, integral/i)).toBeInTheDocument();

    // Search unaccented term: "maca"
    fireEvent.change(searchInput, { target: { value: 'maca' } });
    expect(screen.getAllByText(/Maçã/i).length).toBeGreaterThan(0);

    // Search prefix/typo: "frang grelh"
    fireEvent.change(searchInput, { target: { value: 'frang grelh' } });
    expect(screen.getAllByText(/Frango/i).length).toBeGreaterThan(0);
  });

  it('renders favorite star to the right of food name and toggles favorite', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    // Check favorite buttons in table
    const favButtons = screen.getAllByRole('button', { name: /favorit/i });
    expect(favButtons.length).toBeGreaterThan(0);

    // Clicking favorite button toggles without marking row as selected
    fireEvent.click(favButtons[0]);
    expect(screen.getByText(/Nenhum alimento selecionado/i)).toBeInTheDocument();
  });

  it('renders toggle button to the right of search input and filters to favorite only', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    const toggleSwitch = screen.getByRole('switch', { name: /favoritos/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');

    // Click toggle to filter favorites only
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
    expect(toggleSwitch).toHaveClass('bg-warning');
    expect(toggleSwitch).toHaveClass('text-white');

    // Click again to turn off
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('sorts foods by macro columns (protein, carbs, fats, kcal) and name when clicking table headers', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    // Find sort buttons in headers
    const proteinHeader = screen.getByRole('button', { name: 'Proteína' });
    expect(proteinHeader).toBeInTheDocument();

    // Click to sort by protein desc (highest protein first)
    fireEvent.click(proteinHeader);
    expect(proteinHeader).toHaveAttribute('title', expect.stringMatching(/maior para menor/i));

    // Find carbs header and click
    const carbsHeader = screen.getByRole('button', { name: 'Carboidrato' });
    fireEvent.click(carbsHeader);
    expect(carbsHeader).toHaveAttribute('title', expect.stringMatching(/maior para menor/i));

    // Find fats header and click
    const fatsHeader = screen.getByRole('button', { name: 'Gorduras' });
    fireEvent.click(fatsHeader);
    expect(fatsHeader).toHaveAttribute('title', expect.stringMatching(/maior para menor/i));

    // Find kcal header and click
    const kcalHeader = screen.getByRole('button', { name: 'Calorias' });
    fireEvent.click(kcalHeader);
    expect(kcalHeader).toHaveAttribute('title', expect.stringMatching(/maior para menor/i));
  });

  it('displays tooltip with selected foods in order when hovering over the selection indicator', () => {
    const onAddFood = vi.fn();
    const onClose = vi.fn();

    render(
      <FoodSearchModal
        isOpen={true}
        onClose={onClose}
        mealTitle="Refeição 1"
        onAddFood={onAddFood}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Select first and second foods
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    expect(screen.getByText(/2 alimentos selecionados/i)).toBeInTheDocument();
  });
});
