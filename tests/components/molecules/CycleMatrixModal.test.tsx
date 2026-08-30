import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CycleMatrixModal } from '@/components/molecules/CycleMatrixModal';
import { CarbCyclingVariation, calculateWeeklyCycleAverage } from '@/lib/dietStore';

const mockVariations: CarbCyclingVariation[] = [
  {
    id: 'var-high',
    name: 'Dia Alto Carbo',
    type: 'high',
    assignedDays: ['seg', 'qua', 'sex'],
    targetKcal: 2400,
    targetProtein: 140,
    targetCarbs: 300,
    targetFats: 50,
    meals: [],
  },
  {
    id: 'var-low',
    name: 'Dia Baixo Carbo',
    type: 'low',
    assignedDays: ['ter', 'qui', 'sab', 'dom'],
    targetKcal: 1600,
    targetProtein: 140,
    targetCarbs: 100,
    targetFats: 50,
    meals: [],
  },
];

describe('CycleMatrixModal molecule & weekly calculations', () => {
  it('calculates weighted weekly cycle averages correctly', () => {
    const avg = calculateWeeklyCycleAverage(mockVariations);
    // var-high: 3 days * 2400 = 7200
    // var-low: 4 days * 1600 = 6400
    // total = 13600 / 7 = 1943 kcal
    expect(avg.avgKcal).toBe(1943);
    expect(avg.daysAssignedCount).toBe(7);
  });

  it('renders modal with all variations and allows adding a new variation', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <CycleMatrixModal
        isOpen={true}
        onClose={onClose}
        variations={mockVariations}
        patientWeightKg={70}
        onSave={onSave}
      />
    );

    expect(screen.getByText('Configuração do Ciclo de Carboidratos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Alto Carbo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dia Baixo Carbo')).toBeInTheDocument();

    // Click add new variation
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar Variação/i })[0]);
    expect(screen.getByDisplayValue('Variação 3')).toBeInTheDocument();

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const savedData = onSave.mock.calls[0][0];
    expect(savedData.length).toBe(3);
  });

  it('renders unit mode select and displays macros correctly', () => {
    render(
      <CycleMatrixModal
        isOpen={true}
        onClose={vi.fn()}
        variations={mockVariations}
        patientWeightKg={70}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText(/gramas/i)).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('140')[0]).toBeInTheDocument();
  });

  it('selects all 7 days when clicking the Todos button next to Sunday', () => {
    const onSave = vi.fn();
    render(
      <CycleMatrixModal
        isOpen={true}
        onClose={vi.fn()}
        variations={mockVariations}
        patientWeightKg={70}
        onSave={onSave}
      />
    );

    const selectAllButtons = screen.getAllByRole('button', { name: /Todos/i });
    expect(selectAllButtons.length).toBeGreaterThan(0);

    // Click "Todos" on the first variation
    fireEvent.click(selectAllButtons[0]);

    // Save and verify that variation 1 now has all 7 days
    fireEvent.click(screen.getByRole('button', { name: /Salvar Configurações/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const savedData = onSave.mock.calls[0][0];
    expect(savedData[0].assignedDays).toEqual(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']);
  });
});
