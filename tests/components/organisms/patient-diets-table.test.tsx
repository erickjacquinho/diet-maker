import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PatientDietsTable } from '@/components/organisms/patient/PatientDietsTable';
import type { HistoricalDiet } from '@/lib/patientsStore';
import { PATIENT_PROFILE_CARB_CYCLING_VARIATIONS } from '../../fixtures/patient-profile';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientDietsTable', () => {
  const mockDiets: HistoricalDiet[] = [
    {
      id: 'diet-1',
      name: 'Plano cutting agosto',
      date: '23/08/2026',
      targetKcal: 2020,
      proteinG: 150,
      carbsG: 220,
      fatsG: 60,
      status: 'Ativa',
    },
    {
      id: 'diet-2',
      name: 'Dieta Manutenção Julho',
      date: '10/07/2026',
      targetKcal: 2400,
      proteinG: 160,
      carbsG: 280,
      fatsG: 70,
      status: 'Histórica',
    },
  ];

  const cycleDiet: HistoricalDiet = {
    id: 'diet-cycle',
    name: 'Plano ciclo agosto',
    date: '24/08/2026',
    targetKcal: 2100,
    proteinG: 180,
    carbsG: 197,
    fatsG: 55,
    status: 'Ativa',
    mode: 'carb_cycling',
    carbCyclingVariations: [
      {
        id: 'high',
        name: 'Dia Alto Carbo',
        type: 'high',
        assignedDays: ['seg', 'qua', 'sex'],
        targetKcal: 2300,
        proteinG: 180,
        carbsG: 260,
        fatsG: 55,
        mealsCount: 4,
      },
      {
        id: 'low',
        name: 'Dia Baixo Carbo',
        type: 'low',
        assignedDays: ['ter', 'qui', 'sab', 'dom'],
        targetKcal: 1950,
        proteinG: 180,
        carbsG: 150,
        fatsG: 55,
        mealsCount: 3,
      },
    ],
  };

  it('renders empty state when no diets exist', () => {
    render(<PatientDietsTable patientId="p1" diets={[]} onOpenReadOnlyDiet={vi.fn()} />);

    expect(
      screen.getByText('Nenhuma prescrição dietética registrada para este paciente até o momento.'),
    ).toBeInTheDocument();
  });

  it('renders table columns, status badges and macros correctly', () => {
    render(<PatientDietsTable patientId="p1" diets={mockDiets} onOpenReadOnlyDiet={vi.fn()} />);

    const table = screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getByText('Simples')).toBeInTheDocument();
    expect(rows[1]).not.toHaveTextContent('Plano cutting agosto');
    expect(within(rows[1]).getByText('Ativo')).toBeInTheDocument();
    expect(rows[1]).toHaveClass('hover:bg-primary-soft/30');
    expect(screen.getByText('2020 kcal')).toBeInTheDocument();
    expect(screen.getByText(/P\s*150g/)).toBeInTheDocument();
    expect(screen.getByText(/C\s*220g/)).toBeInTheDocument();
    expect(screen.getByText(/G\s*60g/)).toBeInTheDocument();

    expect(within(rows[2]).getByText('Simples')).toBeInTheDocument();
    expect(rows[2]).not.toHaveTextContent('Dieta Manutenção Julho');
    expect(within(rows[2]).getByText('Histórico')).toBeInTheDocument();
    expect(rows[2]).toHaveClass('hover:bg-transparent');
    expect(screen.getByText('2400 kcal')).toBeInTheDocument();
  });

  it('renders the weighted cycle summary and mode label', () => {
    render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={vi.fn()} />);

    const parentRow = screen.getAllByRole('row')[1];
    expect(within(parentRow).getByText('Ciclo de carboidratos')).toBeInTheDocument();
    expect(parentRow).not.toHaveTextContent('Plano ciclo agosto');
    expect(screen.getByText('2100 kcal')).toBeInTheDocument();
    expect(screen.getByText(/P\s*180g/)).toBeInTheDocument();
    expect(screen.getByText(/C\s*197g/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('keeps the main cycle row at the standard table height', () => {
    render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={vi.fn()} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Ciclo de carboidratos');
    expect(rows[1]).not.toHaveTextContent('Plano ciclo agosto');
    expect(rows[1]).toHaveClass('h-table-row');
  });

  it('keeps prescription actions as compact named icons', () => {
    const handleOpen = vi.fn();
    render(
      <PatientDietsTable
        patientId="p1"
        diets={mockDiets}
        onOpenReadOnlyDiet={handleOpen}
        onDeleteDiet={vi.fn()}
      />,
    );

    const simpleRow = screen.getAllByRole('row')[1];
    const viewButton = within(simpleRow).getByRole('button', {
      name: 'Ver cardápio completo da dieta Plano cutting agosto',
    });
    expect(viewButton.parentElement).toHaveClass('invisible');
    expect(viewButton.parentElement).toHaveClass('group-hover:visible');
    expect(viewButton.parentElement).toHaveClass('group-focus-within:visible');
    expect(viewButton).toHaveAttribute('title', 'Ver cardápio completo da dieta Plano cutting agosto');
    expect(viewButton).not.toHaveTextContent('Ver Cardápio');
    expect(within(simpleRow).getByRole('link', { name: 'Editar Plano cutting agosto no Construtor de Dietas' })).toBeInTheDocument();
    expect(within(simpleRow).getByRole('button', { name: 'Excluir prescrição Plano cutting agosto' })).toBeInTheDocument();

    fireEvent.click(viewButton);
    expect(handleOpen).toHaveBeenCalledWith(mockDiets[0]);
  });

  it('preserves the parent summary and standard height before, during and after expansion', () => {
    render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={vi.fn()} />);

    const parentRow = screen.getAllByRole('row')[1];
    const summaryBefore = parentRow.textContent;
    expect(parentRow).toHaveClass('h-table-row');
    expect(parentRow).toHaveTextContent('2100 kcal');
    expect(parentRow).toHaveTextContent(/P\s*180g/);
    expect(parentRow).toHaveTextContent(/C\s*197g/);

    const expandButton = screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' });
    fireEvent.click(expandButton);
    expect(parentRow).toHaveClass('h-table-row');
    expect(parentRow.textContent).toBe(summaryBefore);

    fireEvent.click(expandButton);
    expect(parentRow).toHaveClass('h-table-row');
    expect(parentRow.textContent).toBe(summaryBefore);
  });

  it('expands and collapses cycle variations without triggering the diet action', () => {
    const handleOpen = vi.fn();
    render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={handleOpen} />);

    const expandButton = screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' });
    expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();

    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('row')[1]).toHaveClass('h-table-row');
    expect(screen.getByText('Variações do ciclo')).toBeInTheDocument();
    expect(screen.getByText('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByText(/Tipo\s+Alto/)).toBeInTheDocument();
    expect(screen.getByText('Seg, Qua, Sex')).toBeInTheDocument();
    expect(screen.getByText('2300 kcal')).toBeInTheDocument();
    expect(screen.getByText('4 refeições')).toBeInTheDocument();
    expect(handleOpen).not.toHaveBeenCalled();

    fireEvent.click(expandButton);
    expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();
  });

  it.each([
    ['one', PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.one],
    ['three', PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four.slice(0, 3)],
    ['four', PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four],
    ['eight', PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.eight],
  ] as const)('renders %s cycle variations as ordered standard-height rows', (_label, variations) => {
    const diet: HistoricalDiet = {
      ...cycleDiet,
      carbCyclingVariations: variations,
    };

    render(<PatientDietsTable patientId="p1" diets={[diet]} onOpenReadOnlyDiet={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }));

    const variationTable = screen.getByRole('table', {
      name: 'Variações do ciclo de Plano ciclo agosto',
    });
    const variationRows = within(variationTable).getAllByRole('row');
    expect(variationRows).toHaveLength(variations.length + 1);
    expect(variationRows.slice(1).map((row) => row.textContent)).toEqual(
      variations.map((variation) => expect.stringContaining(variation.name)),
    );
    expect(within(variationTable).queryByTestId('diet-cycle-variation-cards')).not.toBeInTheDocument();
  });

  it('keeps assigned days in one canonical comma-separated column and exposes explicit empty states', () => {
    const diet: HistoricalDiet = {
      ...cycleDiet,
      carbCyclingVariations: [
        {
          ...PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four[1],
          assignedDays: ['qui', 'ter'],
        },
        PATIENT_PROFILE_CARB_CYCLING_VARIATIONS.four[3],
      ],
    };

    render(<PatientDietsTable patientId="p1" diets={[diet]} onOpenReadOnlyDiet={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }));

    const variationTable = screen.getByRole('table', {
      name: 'Variações do ciclo de Plano ciclo agosto',
    });
    expect(within(variationTable).getByText('Ter, Qui')).toBeInTheDocument();
    expect(within(variationTable).getByText('Nenhum dia atribuído')).toBeInTheDocument();
    expect(within(variationTable).getByText('Nenhuma refeição')).toBeInTheDocument();
  });

  it('truncates only a long variation name while keeping its type visible', () => {
    const longName = 'Dia com uma descrição histórica muito longa para a coluna';
    const diet: HistoricalDiet = {
      ...cycleDiet,
      carbCyclingVariations: [{
        ...cycleDiet.carbCyclingVariations![0],
        name: longName,
      }],
    };

    render(<PatientDietsTable patientId="p1" diets={[diet]} onOpenReadOnlyDiet={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }));

    const variationTable = screen.getByRole('table', {
      name: 'Variações do ciclo de Plano ciclo agosto',
    });
    const variationRow = within(variationTable).getAllByRole('row')[1];
    expect(variationRow).toHaveClass('h-table-row');
    expect(within(variationRow).getByTitle(longName)).toHaveClass('truncate');
    expect(within(variationRow).getByText(/Tipo\s+Alto/)).toBeInTheDocument();
  });

  it('shows a contextual empty state for a cycle without historical variations', () => {
    const diet: HistoricalDiet = {
      ...cycleDiet,
      carbCyclingVariations: [],
    };

    render(<PatientDietsTable patientId="p1" diets={[diet]} onOpenReadOnlyDiet={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }));

    expect(screen.getByText('Este ciclo não possui variações configuradas.')).toBeInTheDocument();
  });

  it('exposes the expansion relationship, semantic headers, units and keyboard-ready focus', () => {
    render(<PatientDietsTable patientId="p1" diets={[cycleDiet]} onOpenReadOnlyDiet={vi.fn()} />);

    const expandButton = screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' });
    const detailsId = expandButton.getAttribute('aria-controls');
    expect(detailsId).toBeTruthy();
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    expandButton.focus();
    expect(expandButton).toHaveFocus();
    fireEvent.keyDown(expandButton, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(expandButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    expect(expandButton).toHaveFocus();
    expect(document.getElementById(detailsId as string)).toBeInTheDocument();

    const variationTable = screen.getByRole('table', {
      name: 'Variações do ciclo de Plano ciclo agosto',
    });
    expect(screen.getByTestId('diet-cycle-details').closest('tr')).toHaveClass(
      'hover:bg-surface-subtle/40',
    );
    expect(within(variationTable).getAllByRole('row')[1]).toHaveClass('hover:bg-surface');
    expect(within(variationTable).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Variação',
      'Dias',
      'Macronutrientes',
      'Calorias',
      'Refeições',
    ]);
    expect(variationTable.parentElement).toHaveClass('rounded-surface', 'border', 'overflow-hidden');
    expect(within(variationTable).getAllByRole('columnheader')[3]).toHaveClass('text-center');
    const macroSummaries = within(variationTable).getAllByTestId('macro-summary');
    expect(macroSummaries).toHaveLength(2);
    expect(macroSummaries[0]).toHaveTextContent(/P\s*180g/);
    expect(macroSummaries[0]).toHaveTextContent(/C\s*260g/);
    expect(macroSummaries[0]).toHaveTextContent(/G\s*55g/);
    expect(within(variationTable).getByText('2300 kcal')).toBeInTheDocument();
    expect(within(variationTable).getByText('2300 kcal').closest('td')).toHaveClass('text-center');
    expect(within(variationTable).getByText('4 refeições')).toBeInTheDocument();
  });

  it('isolates expansion from prescription actions and keeps simple diets without cycle details', () => {
    const handleOpen = vi.fn();
    const handleDelete = vi.fn();
    const { unmount } = render(
      <PatientDietsTable
        patientId="p1"
        diets={[cycleDiet]}
        onOpenReadOnlyDiet={handleOpen}
        onDeleteDiet={handleDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver variações de Plano ciclo agosto' }));
    expect(handleOpen).not.toHaveBeenCalled();
    expect(handleDelete).not.toHaveBeenCalled();

    unmount();
    render(<PatientDietsTable patientId="p1" diets={mockDiets} onOpenReadOnlyDiet={handleOpen} />);
    expect(screen.queryByRole('button', { name: /Ver variações/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Variações do ciclo')).not.toBeInTheDocument();
  });

  it('triggers onOpenReadOnlyDiet when "Ver Cardápio" button is clicked', () => {
    const handleOpen = vi.fn();
    render(<PatientDietsTable patientId="p1" diets={mockDiets} onOpenReadOnlyDiet={handleOpen} />);

    const buttons = screen.getAllByRole('button', { name: /Ver cardápio completo da dieta/ });
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    expect(handleOpen).toHaveBeenCalledTimes(1);
    expect(handleOpen).toHaveBeenCalledWith(mockDiets[0]);
  });

  it('triggers onDeleteDiet when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <PatientDietsTable
        patientId="p1"
        diets={mockDiets}
        onOpenReadOnlyDiet={vi.fn()}
        onDeleteDiet={handleDelete}
      />,
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Excluir prescrição/ });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(mockDiets[0]);
  });
});
