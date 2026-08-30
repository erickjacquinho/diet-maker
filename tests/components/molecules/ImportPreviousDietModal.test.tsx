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
    variationsCount: 2,
    daysAssignedCount: 7,
    fullPlan: {
      id: 'diet-2',
      patientId: 'patient-1',
      name: 'Ciclo de Carbos Cut',
      createdAt: '10/05/2026',
      updatedAt: '10/05/2026',
      mode: 'carb_cycling',
      simpleTargetKcal: 2100,
      simpleTargetProtein: 180,
      simpleTargetCarbs: 200,
      simpleTargetFats: 55,
      simpleMeals: [],
      carbCyclingVariationsCount: 2,
      carbCyclingVariations: [
        {
          id: 'var-high',
          name: 'Dia Alto Carbo',
          type: 'high',
          assignedDays: ['seg', 'qua', 'sex'],
          targetKcal: 2300,
          targetProtein: 180,
          targetCarbs: 260,
          targetFats: 55,
          meals: [],
        },
        {
          id: 'var-low',
          name: 'Dia Baixo Carbo',
          type: 'low',
          assignedDays: ['ter', 'qui', 'sab', 'dom'],
          targetKcal: 1950,
          targetProtein: 180,
          targetCarbs: 150,
          targetFats: 55,
          meals: [],
        },
      ],
    },
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

    const table = screen.getByRole('table', { name: 'Histórico de dietas anteriores para importação' });
    expect(within(table).getByRole('columnheader', { name: /Plano Alimentar/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Data/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Macros/ })).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: /Proteína/ })).not.toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: /Carboidrato/ })).not.toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: /Gorduras/ })).not.toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Calorias/ })).toBeInTheDocument();
    expect(within(table).getAllByTestId('macro-summary')).toHaveLength(2);
    expect(within(table).getAllByText('kcal')).toHaveLength(2);

    const dietName = screen.getByText('Dieta Hipertrofia');
    expect(dietName.closest('td')).toHaveClass('w-64');
    expect(dietName).toHaveClass('whitespace-normal', 'break-words');
    expect(dietName).not.toHaveClass('truncate');

    const dateCell = screen.getByText('20/08/2026');
    expect(dateCell.closest('td')).toHaveClass('w-28');
    expect(dateCell).toHaveClass(
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

  it('should expand and collapse the variations of a carb cycling diet without selecting the row', () => {
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

    const expandButton = screen.getByRole('button', { name: 'Ver variações de Ciclo de Carbos Cut' });
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();

    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Variações do ciclo')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText('Dia Baixo Carbo')).toBeInTheDocument();
    expect(screen.getByText('Média semanal ponderada · 7 dias atribuídos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Puxar apenas os macros/i })).toBeDisabled();

    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();
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
    const sortButton = screen.getByRole('button', { name: 'Ordenar por Calorias' });
    fireEvent.click(sortButton);

    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getByText('Ciclo de Carbos Cut')).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Calorias/ })).toHaveAttribute('aria-sort', 'ascending');
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

  it('renders Checkbox components in header and rows, and toggles appropriately on click', () => {
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

    const headerCheckbox = screen.getByRole('checkbox', { name: 'Alternar seleção de dieta' });
    const row1Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Dieta Hipertrofia' });
    const row2Checkbox = screen.getByRole('checkbox', { name: 'Selecionar Ciclo de Carbos Cut' });

    expect(headerCheckbox).toHaveAttribute('aria-checked', 'false');
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'false');
    expect(row2Checkbox).toHaveAttribute('aria-checked', 'false');

    // Click row 1 checkbox directly
    fireEvent.click(row1Checkbox);
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'true');
    expect(headerCheckbox).toHaveAttribute('aria-checked', 'mixed');

    // Click header checkbox to clear selection
    fireEvent.click(headerCheckbox);
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'false');
    expect(headerCheckbox).toHaveAttribute('aria-checked', 'false');

    // Click row 1 checkbox to select, then click again to unselect
    fireEvent.click(row1Checkbox);
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(row1Checkbox);
    expect(row1Checkbox).toHaveAttribute('aria-checked', 'false');
  });
});

