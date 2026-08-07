import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodTableSection } from '@/components/organisms/foods/FoodTableSection';
import type { FoodItem } from '@/lib/tacoStore';

function buildFood(overrides: Partial<FoodItem> = {}): FoodItem {
  return {
    id: 'food-1',
    name: 'Arroz integral cozido',
    preparo: 'Cozido',
    category: 'Cereais',
    kcal: 124,
    proteinG: 2.6,
    carbsG: 25.8,
    fatsG: 1,
    fiberG: 2.7,
    source: 'TACO',
    isFavorite: false,
    ...overrides,
  };
}

function renderFoodTable(data: FoodItem[], overrides: Partial<React.ComponentProps<typeof FoodTableSection>> = {}) {
  return render(
    <FoodTableSection
      data={data}
      onToggleFavorite={vi.fn()}
      onEditCustomFood={vi.fn()}
      {...overrides}
    />,
  );
}

describe('FoodTableSection', () => {
  it('renders filtered food results with accessible columns, units and actions', () => {
    const onToggleFavorite = vi.fn();
    const onEditCustomFood = vi.fn();
    const food = buildFood({ id: 'custom-1', name: 'Panqueca customizada', source: 'CUSTOM', isCustom: true });

    renderFoodTable([food], { onToggleFavorite, onEditCustomFood });

    const table = screen.getByRole('table', { name: 'Tabela de alimentos' });
    expect(within(table).getByText('Panqueca customizada')).toBeInTheDocument();
    expect(within(table).getByText('124 kcal')).toBeInTheDocument();
    expect(within(table).getByText('2.6g')).toBeInTheDocument();
    expect(within(table).getByText('Custom')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Favoritar Panqueca customizada' }));
    expect(onToggleFavorite).toHaveBeenCalledWith('custom-1');
    fireEvent.click(screen.getByRole('button', { name: 'Editar alimento customizado' }));
    expect(onEditCustomFood).toHaveBeenCalledWith(food);
  });

  it('shows the specific empty result state for active filters', () => {
    renderFoodTable([]);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhum alimento encontrado com os filtros atuais.');
    expect(screen.getByRole('table', { name: 'Tabela de alimentos' })).toBeInTheDocument();
  });

  it('sorts supported columns in both directions without changing the supplied result set', () => {
    const data = [
      buildFood({ id: 'food-z', name: 'Zucchini', kcal: 50 }),
      buildFood({ id: 'food-a', name: 'Abacate', kcal: 200 }),
    ];
    renderFoodTable(data);

    const table = screen.getByRole('table', { name: 'Tabela de alimentos' });
    const getFoodNames = () => within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[1].textContent);
    const nameSort = screen.getByRole('button', { name: 'Ordenar por nome do alimento' });

    expect(getFoodNames()).toEqual(['Zucchini', 'Abacate']);
    fireEvent.click(nameSort);
    expect(getFoodNames()).toEqual(['Abacate', 'Zucchini']);
    fireEvent.click(nameSort);
    expect(getFoodNames()).toEqual(['Zucchini', 'Abacate']);
  });

  it('paginates 15 rows and disables controls at each page boundary', () => {
    const data = Array.from({ length: 16 }, (_, index) => buildFood({ id: `food-${index}`, name: `Alimento ${index}` }));
    renderFoodTable(data);

    expect(screen.getByText('Alimento 0')).toBeInTheDocument();
    expect(screen.queryByText('Alimento 15')).not.toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Alimento 15')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });
});
