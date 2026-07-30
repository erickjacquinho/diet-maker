import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoKcalSection } from '../AutoKcalSection';

describe('Component UI Seam: AutoKcalSection', () => {
  it('renders title and correctly auto-calculates total calories from macros', () => {
    render(
      <AutoKcalSection
        title="Metas Iniciais & Cálculo Calórico"
        proteinG={150}
        carbsG={200}
        fatsG={50}
        onProteinChange={vi.fn()}
        onCarbsChange={vi.fn()}
        onFatsChange={vi.fn()}
      />
    );

    // 150*4 + 200*4 + 50*9 = 600 + 800 + 450 = 1850 kcal
    expect(screen.getByText('Metas Iniciais & Cálculo Calórico')).toBeInTheDocument();
    expect(screen.getByText('1850 kcal')).toBeInTheDocument();
  });

  it('triggers change handlers when macro values change', () => {
    const onProteinChange = vi.fn();
    const onCarbsChange = vi.fn();
    const onFatsChange = vi.fn();

    render(
      <AutoKcalSection
        proteinG={150}
        carbsG={200}
        fatsG={50}
        onProteinChange={onProteinChange}
        onCarbsChange={onCarbsChange}
        onFatsChange={onFatsChange}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(3);

    fireEvent.change(inputs[0], { target: { value: '160' } });
    expect(onProteinChange).toHaveBeenCalledWith(160);

    fireEvent.change(inputs[1], { target: { value: '210' } });
    expect(onCarbsChange).toHaveBeenCalledWith(210);

    fireEvent.change(inputs[2], { target: { value: '55' } });
    expect(onFatsChange).toHaveBeenCalledWith(55);
  });

  it('correctly calculates 388 kcal for 30g Protein, 40g Carbs, 12g Fats', () => {
    render(
      <AutoKcalSection
        proteinG={30}
        carbsG={40}
        fatsG={12}
        onProteinChange={vi.fn()}
        onCarbsChange={vi.fn()}
        onFatsChange={vi.fn()}
      />
    );

    // 30*4 + 40*4 + 12*9 = 120 + 160 + 108 = 388 kcal
    expect(screen.getByText('388 kcal')).toBeInTheDocument();
  });

});

