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

  it('renders custom empty message when provided and macros are zero', () => {
    render(
      <MacroProportionBar
        proteinG={0}
        carbsG={0}
        fatsG={0}
        emptyMessage="Nenhuma meta inserida. Digite os valores para visualizar a distribuição."
      />
    );

    expect(screen.getByText(/Nenhuma meta inserida/i)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders title, 100% total pct, and individual kcal per macro when configured', () => {
    render(
      <MacroProportionBar
        proteinG={160}
        carbsG={200}
        fatsG={50}
        title="Distribuição Calórica (% VET)"
        showTotalPct
        showKcalPerMacro
        showGrams={false}
        showCalories={false}
      />
    );

    expect(screen.getByText('Distribuição Calórica (% VET)')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/640 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/800 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/450 kcal/)).toBeInTheDocument();
  });

  it('respects showLegend and showCalories flags', () => {
    render(
      <MacroProportionBar
        proteinG={25}
        carbsG={30}
        fatsG={8}
        showLegend={false}
        showCalories={false}
        title={false}
        showTotalPct={false}
      />
    );

    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.queryByText(/Proteínas:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
  });
});
