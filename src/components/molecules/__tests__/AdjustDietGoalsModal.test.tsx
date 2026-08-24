import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdjustDietGoalsModal } from '../AdjustDietGoalsModal';

describe('Component UI Seam: AdjustDietGoalsModal', () => {
  it('renders modal with macro fields, calculated calories, % VET bar and handles save', () => {
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
        onSave={handleSave}
      />
    );

    expect(screen.getByText('Ajustar Metas Nutricionais')).toBeInTheDocument();
    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('Carboidratos')).toBeInTheDocument();
    expect(screen.getByText('Gorduras')).toBeInTheDocument();

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
});
