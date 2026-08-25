import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MacroProportionBar } from '@/components/molecules/MacroProportionBar';

describe('MacroProportionBar', () => {
  it('renders multi-segmented proportion bar and canonical macro values', () => {
    render(
      <MacroProportionBar
        proteinG={30}
        carbsG={40}
        fatsG={10}
        kcal={370}
      />
    );

    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Proporção calórica/i })).toBeInTheDocument();

    // Ordem canônica: Proteínas -> Carboidratos -> Gorduras -> Calorias
    expect(screen.getByText('30g')).toBeInTheDocument();
    expect(screen.getByText('40g')).toBeInTheDocument();
    expect(screen.getByText('10g')).toBeInTheDocument();
    expect(screen.getByText('370')).toBeInTheDocument();
  });

  it('renders empty bar state when all macros are zero', () => {
    render(
      <MacroProportionBar
        proteinG={0}
        carbsG={0}
        fatsG={0}
        kcal={0}
      />
    );

    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getAllByText('0g')).toHaveLength(3);
  });

  it('respects showLegend and showCalories flags', () => {
    render(
      <MacroProportionBar
        proteinG={25}
        carbsG={30}
        fatsG={8}
        showLegend={false}
      />
    );

    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.queryByText(/P:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
  });
});
