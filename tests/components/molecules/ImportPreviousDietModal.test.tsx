import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ImportPreviousDietModal } from '@/components/molecules/ImportPreviousDietModal';
import type { PreviousDietSummary } from '@/lib/dietDuplication';

const mockDiets: PreviousDietSummary[] = [
  {
    id: 'diet-1',
    name: 'Dieta Hipertrofia',
    date: '20/08/2026',
    mode: 'simple',
    modeLabel: 'Simples',
    targetKcal: 2600,
    proteinG: 190,
    carbsG: 320,
    fatsG: 60,
    mealsCount: 4,
  },
  {
    id: 'diet-2',
    name: 'Ciclo de Carbos Cut',
    date: '10/05/2026',
    mode: 'carb_cycling',
    modeLabel: 'Ciclo de Carboidratos',
    targetKcal: 2100,
    proteinG: 180,
    carbsG: 200,
    fatsG: 55,
    mealsCount: 3,
  },
];

describe('ImportPreviousDietModal', () => {
  it('should render dialog with title, table of diets, and disabled action buttons initially', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    expect(screen.getByText('Importar Dieta Anterior')).toBeInTheDocument();
    expect(screen.getByText('Dieta Hipertrofia')).toBeInTheDocument();
    expect(screen.getByText('Ciclo de Carbos Cut')).toBeInTheDocument();
    expect(screen.getByText('2600')).toBeInTheDocument();
    expect(screen.getByText('2100')).toBeInTheDocument();
    expect(screen.getAllByText('kcal')).toHaveLength(2);

    const dietName = screen.getByText('Dieta Hipertrofia');
    expect(dietName.closest('td')).toHaveClass('py-2');
    expect(dietName.closest('td')).toHaveClass('w-48');
    expect(dietName.parentElement).toHaveClass('relative', 'items-center');
    expect(dietName.parentElement?.parentElement).toHaveClass('gap-0.5');
    expect(dietName).toHaveClass('whitespace-normal', 'break-words');
    expect(dietName).not.toHaveClass('truncate');
    expect(screen.getByText('20/08/2026')).toHaveClass(
      'text-style-legal',
      'font-medium',
      'text-text-muted',
    );

    const macrosBtn = screen.getByRole('button', { name: /Puxar apenas os macros/i });
    const mealsBtn = screen.getByRole('button', { name: /Puxar todas as refeições/i });

    expect(macrosBtn).toBeDisabled();
    expect(mealsBtn).toBeDisabled();
  });

  it('should enable action buttons when a diet row is clicked and selected', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    const row = screen.getByText('Dieta Hipertrofia').closest('tr');
    expect(row).toBeInTheDocument();
    if (row) fireEvent.click(row);

    const macrosBtn = screen.getByRole('button', { name: /Puxar apenas os macros/i });
    const mealsBtn = screen.getByRole('button', { name: /Puxar todas as refeições/i });

    expect(macrosBtn).toBeEnabled();
    expect(mealsBtn).toBeEnabled();
  });

  it('should call onPullMacrosOnly with the selected diet when clicking Puxar apenas os macros', () => {
    const handlePullMacros = vi.fn();
    const handlePullMeals = vi.fn();

    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={handlePullMacros}
        onPullAllMeals={handlePullMeals}
      />
    );

    const row = screen.getByText('Dieta Hipertrofia').closest('tr');
    if (row) fireEvent.click(row);

    const macrosBtn = screen.getByRole('button', { name: /Puxar apenas os macros/i });
    fireEvent.click(macrosBtn);

    expect(handlePullMacros).toHaveBeenCalledTimes(1);
    expect(handlePullMacros).toHaveBeenCalledWith(mockDiets[0]);
    expect(handlePullMeals).not.toHaveBeenCalled();
  });

  it('should call onPullAllMeals with the selected diet when clicking Puxar todas as refeições', () => {
    const handlePullMacros = vi.fn();
    const handlePullMeals = vi.fn();

    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={handlePullMacros}
        onPullAllMeals={handlePullMeals}
      />
    );

    const row = screen.getByText('Ciclo de Carbos Cut').closest('tr');
    if (row) fireEvent.click(row);

    const mealsBtn = screen.getByRole('button', { name: /Puxar todas as refeições/i });
    fireEvent.click(mealsBtn);

    expect(handlePullMeals).toHaveBeenCalledTimes(1);
    expect(handlePullMeals).toHaveBeenCalledWith(mockDiets[1]);
    expect(handlePullMacros).not.toHaveBeenCalled();
  });

  it('should display empty state message when diets list is empty', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={[]}
        patientName="Novo Paciente"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    expect(screen.getByText(/Nenhuma dieta anterior encontrada/i)).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Histórico de dietas anteriores para importação' })).toBeInTheDocument();
  });

  it('should filter diets by name and clear the search without leaving the table', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    const search = screen.getByRole('searchbox', { name: 'Buscar por nome ou data da dieta' });
    fireEvent.change(search, { target: { value: 'Ciclo' } });

    expect(screen.getByText('Ciclo de Carbos Cut')).toBeInTheDocument();
    expect(screen.queryByText('Dieta Hipertrofia')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Histórico de dietas anteriores para importação' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(screen.getByText('Dieta Hipertrofia')).toBeInTheDocument();
    expect(screen.getByText('Ciclo de Carbos Cut')).toBeInTheDocument();
  });

  it('should sort numeric columns through the DataTable contract', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    const table = screen.getByRole('table', { name: 'Histórico de dietas anteriores para importação' });
    const sortButton = screen.getByRole('button', { name: 'Ordenar por Proteína' });
    fireEvent.click(sortButton);

    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getByText('Ciclo de Carbos Cut')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Proteína/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should select a diet from the row with Enter and Space', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    const row = screen.getByText('Dieta Hipertrofia').closest('tr');
    expect(row).toHaveAttribute('tabindex', '0');
    if (!row) return;

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /Puxar apenas os macros/i })).toBeEnabled();

    fireEvent.keyDown(row, { key: ' ' });
    expect(row).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('button', { name: /Puxar apenas os macros/i })).toBeDisabled();
  });

  it('renders Checkbox components instead of text header Sel. and toggles on click', () => {
    render(
      <ImportPreviousDietModal
        isOpen={true}
        onClose={vi.fn()}
        diets={mockDiets}
        patientName="João Silva"
        onPullMacrosOnly={vi.fn()}
        onPullAllMeals={vi.fn()}
      />
    );

    expect(screen.queryByText('Sel.')).not.toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');

    // Click checkbox directly
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');

    // Click again to unselect
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
  });
});

