import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdjustDietGoalsModal } from '../AdjustDietGoalsModal';

describe('Component UI Seam: AdjustDietGoalsModal', () => {
  it('renders modal in simple diet mode with 4-column layout, Dieta Simples header, % VET bar and handles save', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    const setProt = vi.fn();
    const setCarb = vi.fn();
    const setFat = vi.fn();

    render(
      <AdjustDietGoalsModal
        isOpen={true}
        onClose={handleClose}
        tempTargetProt={150}
        setTempTargetProt={setProt}
        tempTargetCarb={250}
        setTempTargetCarb={setCarb}
        tempTargetFat={50}
        setTempTargetFat={setFat}
        patientWeightKg={70}
        mode="simple"
        onSave={handleSave}
      />
    );

    expect(screen.getByText('Ajustar Metas Nutricionais')).toBeInTheDocument();
    expect(screen.getByText('Dieta Simples')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ex: Dia Alto Carbo/i)).not.toBeInTheDocument();

    // 4 columns labels
    expect(screen.getAllByText(/Proteínas/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Carboidratos/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Gorduras/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Total Calórico/i)).toBeInTheDocument();

    // Verify calculated calories are rendered (150*4 + 250*4 + 50*9 = 2050 kcal)
    expect(screen.getByText('2050')).toBeInTheDocument();
    expect(screen.getByText('Distribuição Calórica (% VET)')).toBeInTheDocument();

    // Verify Zerar Metas button resets
    const resetButton = screen.getByRole('button', { name: /zerar metas/i });
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(setProt).toHaveBeenCalledWith(0);
    expect(setCarb).toHaveBeenCalledWith(0);
    expect(setFat).toHaveBeenCalledWith(0);

    // Verify Salvar Metas triggers callback
    const saveButton = screen.getByRole('button', { name: /salvar metas/i });
    fireEvent.click(saveButton);
    expect(handleSave).toHaveBeenCalled();
  });

  it('renders variation name input when in carb cycling mode', () => {
    const handleNameChange = vi.fn();

    render(
      <AdjustDietGoalsModal
        isOpen={true}
        onClose={vi.fn()}
        tempTargetProt={150}
        setTempTargetProt={vi.fn()}
        tempTargetCarb={250}
        setTempTargetCarb={vi.fn()}
        tempTargetFat={50}
        setTempTargetFat={vi.fn()}
        patientWeightKg={70}
        mode="carb_cycling"
        variationName="Dia Alto Carbo"
        onVariationNameChange={handleNameChange}
        onSave={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('Dia Alto Carbo');
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Dia Médio Carbo' } });
    expect(handleNameChange).toHaveBeenCalledWith('Dia Médio Carbo');
  });
});
