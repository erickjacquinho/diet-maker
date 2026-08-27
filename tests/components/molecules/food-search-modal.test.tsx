import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

    const table = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    expect(table).toHaveAttribute('aria-rowcount', '598');
    expect(within(table).getAllByRole('row').length).toBeLessThan(598);

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
    expect(emptyState).toHaveClass('min-h-table-modal');
    expect(emptyState).toHaveClass('max-h-table-modal');
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
    expect(toggleSwitch).not.toHaveTextContent('Favoritos');
    expect(toggleSwitch).toHaveAttribute('title', 'Filtrar favoritos');
    expect(toggleSwitch).toHaveClass('hover:bg-warning');
    expect(toggleSwitch).toHaveClass('hover:border-transparent');
    expect(toggleSwitch.querySelector('svg')).toHaveClass('group-hover:fill-current', 'group-hover:text-on-warning');

    // Click toggle to filter favorites only
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
    expect(toggleSwitch).toHaveClass('bg-warning-pressed');
    expect(toggleSwitch).toHaveClass('border-transparent');
    expect(toggleSwitch).toHaveClass('text-on-warning');
    expect(toggleSwitch.querySelector('svg')).toHaveClass('fill-current', 'text-on-warning');

    // Click again to turn off
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('shows the Ctrl+F badge and focuses the search field with the shortcut', () => {
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
    expect(screen.getByText('Ctrl+F')).toHaveAttribute('title', 'Atalho Ctrl+F');

    searchInput.blur();
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });

    expect(searchInput).toHaveFocus();
  });

  it('uses the shadcn tooltip to reveal the full food name in the results table', async () => {
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

    const table = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    const firstFoodName = within(table).getByText('Arroz, integral, cozido', { exact: true });

    expect(firstFoodName).not.toHaveAttribute('title');
    fireEvent.pointerMove(firstFoodName, { pointerType: 'mouse' });

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Arroz, integral, cozido');
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
    const proteinHeader = screen.getByRole('button', { name: 'Ordenar por Proteína' });
    expect(proteinHeader).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    const getVisibleFoodNames = () =>
      within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1]?.textContent);
    const defaultOrder = getVisibleFoodNames();

    // The canonical DataTable cycle is ascending -> descending -> cleared.
    fireEvent.click(proteinHeader);
    expect(proteinHeader).toHaveAttribute('aria-pressed', 'true');
    expect(within(table).getByRole('columnheader', { name: /Proteína/ })).toHaveAttribute('aria-sort', 'ascending');

    // Click again to sort by protein descending.
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por Proteína' }));
    expect(screen.getByRole('button', { name: 'Ordenar por Proteína' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(table).getByRole('columnheader', { name: /Proteína/ })).toHaveAttribute('aria-sort', 'descending');

    // A third click restores the original filtered order and neutral state.
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar por Proteína' }));
    expect(screen.getByRole('button', { name: 'Ordenar por Proteína' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(table).getByRole('columnheader', { name: /Proteína/ })).toHaveAttribute('aria-sort', 'none');
    expect(getVisibleFoodNames()).toEqual(defaultOrder);

    // Find carbs header and click
    const carbsHeader = screen.getByRole('button', { name: 'Ordenar por Carboidrato' });
    fireEvent.click(carbsHeader);
    expect(within(table).getByRole('columnheader', { name: /Carboidrato/ })).toHaveAttribute('aria-sort', 'ascending');

    // Find fats header and click
    const fatsHeader = screen.getByRole('button', { name: 'Ordenar por Gorduras' });
    fireEvent.click(fatsHeader);
    expect(within(table).getByRole('columnheader', { name: /Gorduras/ })).toHaveAttribute('aria-sort', 'ascending');

    // Find kcal header and click
    const kcalHeader = screen.getByRole('button', { name: 'Ordenar por Calorias' });
    fireEvent.click(kcalHeader);
    expect(within(table).getByRole('columnheader', { name: /Calorias/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('displays a badge and tooltip with selected foods in order', async () => {
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

    const selectionBadge = screen.getByText(/2 alimentos selecionados/i);
    expect(selectionBadge).toHaveAttribute('tabindex', '0');

    const selectedFoodNames = checkboxes.slice(1, 3).map((checkbox) => {
      const row = checkbox.closest('tr');
      return within(row as HTMLElement).getAllByRole('cell')[1].querySelector('span.text-style-body-small')?.textContent?.trim();
    });

    const firstSelectedRow = checkboxes[1].closest('tr');
    fireEvent.click(within(firstSelectedRow as HTMLElement).getByRole('button', { name: /Favoritar/i }));

    fireEvent.focus(selectionBadge);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Alimentos selecionados');
    expect(tooltip).toHaveTextContent('Macros por 100 g');

    const tooltipHeader = screen.getByText('Alimentos selecionados').parentElement;
    expect(tooltipHeader).toHaveClass('border-b', 'border-border-divider');

    const tooltipItems = within(tooltip).getAllByRole('listitem');
    expect(tooltipItems).toHaveLength(2);
    tooltipItems.forEach((item) => {
      expect(item).toHaveClass('flex', 'items-center', 'justify-between');
      expect(item).not.toHaveClass('border-b');
    });
    expect(tooltipItems[0]).toHaveTextContent('Favorito');
    expect(tooltipItems[0].querySelector('svg')).toHaveClass('fill-warning', 'text-warning');
    expect(tooltipItems[1].querySelector('svg')).toBeNull();

    const favoriteFoodName = tooltipItems[0].querySelector(`span[title="${selectedFoodNames[0]}"]`);
    expect(favoriteFoodName).toBeInTheDocument();
    expect(favoriteFoodName?.nextElementSibling).toBe(tooltipItems[0].querySelector('svg'));

    checkboxes.slice(1, 3).forEach((checkbox, index) => {
      const row = checkbox.closest('tr');
      const cells = within(row as HTMLElement).getAllByRole('cell');
      const item = tooltipItems[index];
      const foodName = selectedFoodNames[index];

      expect(item).toHaveTextContent(foodName ?? '');
      expect(item).toHaveTextContent(`P ${cells[2].textContent?.trim()}`);
      expect(item).toHaveTextContent(`C ${cells[3].textContent?.trim()}`);
      expect(item).toHaveTextContent(`G ${cells[4].textContent?.trim()}`);
      expect(item).toHaveTextContent(cells[5].textContent?.trim() ?? '');
      expect(within(item).getByTestId(/selected-food-macros-/)).toHaveClass('flex-nowrap', 'whitespace-nowrap');
    });
  });
});
