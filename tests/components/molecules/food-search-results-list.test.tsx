import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FoodSearchResultsList } from '@/components/molecules/food-search/FoodSearchResultsList';
import type { FoodItem } from '@/lib/tacoStore';

const foods: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Arroz integral',
    preparo: 'cozido',
    category: 'Cereais',
    kcal: 123,
    proteinG: 2.6,
    carbsG: 25.8,
    fatsG: 1,
    fiberG: 2.7,
    source: 'TACO',
    isFavorite: false,
  },
];

describe('FoodSearchResultsList', () => {
  it('keeps the name column left-aligned with compact stacked text', async () => {
    render(
      <FoodSearchResultsList
        searchResults={foods}
        selectedFoodIds={new Set()}
        query=""
        onToggleFood={vi.fn()}
      />,
    );

    const table = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    const nameHeader = within(table).getByRole('columnheader', { name: 'Nome (100g base)' });
    const nameCell = screen.getByText('Arroz integral').closest('td');
    const nameStack = nameCell?.querySelector('.grid');
    const nameTrigger = nameStack?.firstElementChild?.firstElementChild;

    expect(nameHeader).toHaveClass('text-left', 'w-80');
    expect(nameCell).toHaveClass('text-left', 'w-80', 'h-table-row-food', 'py-1');
    expect(nameTrigger).toHaveClass('whitespace-nowrap', 'truncate');
    expect(nameTrigger).not.toHaveClass('break-words');
    expect(nameTrigger).not.toHaveAttribute('title');
    expect(screen.getByText('cozido · Cereais')).toBeInTheDocument();
    expect(nameStack).toHaveClass('h-full', 'content-center');
    expect(nameStack?.firstElementChild).toHaveClass('flex', 'items-center', 'gap-0.5', 'whitespace-nowrap');
    expect(nameStack?.firstElementChild).not.toHaveClass('flex-wrap');
    expect(nameTrigger).toHaveAttribute('tabindex', '0');
    expect(nameStack?.firstElementChild?.lastElementChild).toHaveClass('shrink-0', 'whitespace-nowrap');
    expect(nameStack?.firstElementChild?.lastElementChild).not.toHaveClass('absolute');
    expect(screen.getByText('cozido · Cereais')).toHaveClass(
      'text-style-legal',
      'font-medium',
      'text-text-muted',
      '-mt-1',
    );

    fireEvent.pointerMove(nameTrigger as HTMLElement, { pointerType: 'mouse' });
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Arroz integral');
  });

  it('centers nutritional columns and restores their sorting indicators', () => {
    render(
      <FoodSearchResultsList
        searchResults={foods}
        selectedFoodIds={new Set()}
        query=""
        onToggleFood={vi.fn()}
        sort={{ state: null, onChange: vi.fn() }}
      />,
    );

    const table = screen.getByRole('table', { name: 'Lista de resultados de alimentos da base TACO' });
    for (const label of ['Proteína', 'Carboidrato', 'Gorduras', 'Calorias']) {
      const header = within(table).getByRole('columnheader', { name: new RegExp(label) });
      expect(header).toHaveClass('text-center');
      expect(within(header).getByRole('button', { name: `Ordenar por ${label}` }).querySelector('svg')).toBeInTheDocument();
    }

    expect(screen.getByText('2.6g').closest('td')).toHaveClass('text-center', 'tabular-nums');
    expect(screen.getByText('25.8g').closest('td')).toHaveClass('text-center', 'tabular-nums');
    expect(screen.getByText('1g').closest('td')).toHaveClass('text-center', 'tabular-nums');
    expect(screen.getByText('123').closest('td')).toHaveClass('text-center', 'tabular-nums');
    expect(table.querySelector('[class*="min-w-["]')).not.toBeInTheDocument();
  });
});
