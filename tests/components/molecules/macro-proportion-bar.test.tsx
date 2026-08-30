import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MacroProportionBar } from '@/components/molecules/MacroProportionBar';

describe('MacroProportionBar', () => {
  it('renders multi-segmented proportion bar and divided vertical columns for all macros and kcal', () => {
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
    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Carboidratos')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Gorduras')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Calorias')).toBeInTheDocument();
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
    expect(screen.getAllByText('0')).toHaveLength(4);
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

  it('renders title, 100% total pct, and individual kcal per macro', () => {
    render(
      <MacroProportionBar
        proteinG={160}
        carbsG={200}
        fatsG={50}
        title="Distribuição Calórica (% VET)"
        showTotalPct
      />
    );

    expect(screen.getByText('Distribuição Calórica (% VET)')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/640 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/800 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/450 kcal/)).toBeInTheDocument();
  });

  it.each([
    [30, 30, 13.3, ['33', '33', '34']],
    [1, 1, 1, ['24', '24', '52']],
  ])('fills the bar to exactly 100% after percentage rounding', (proteinG, carbsG, fatsG, expectedWidths) => {
    render(
      <MacroProportionBar
        proteinG={proteinG}
        carbsG={carbsG}
        fatsG={fatsG}
      />
    );

    const progressbar = screen.getByRole('progressbar', { name: /Proporção calórica/i });
    const segmentWidths = Array.from(progressbar.querySelectorAll('rect')).map((segment) => segment.getAttribute('width'));

    expect(segmentWidths).toEqual(expectedWidths);
    expect(segmentWidths.reduce((total, width) => total + Number(width), 0)).toBe(100);
  });

  it('respects showDividers and showCalories flags', () => {
    render(
      <MacroProportionBar
        proteinG={25}
        carbsG={30}
        fatsG={8}
        showDividers={false}
        showCalories={false}
        title={false}
        showTotalPct={false}
      />
    );

    expect(screen.getByTestId('macro-proportion-bar')).toBeInTheDocument();
    expect(screen.queryByText('Proteínas')).not.toBeInTheDocument();
    expect(screen.queryByText('Calorias')).not.toBeInTheDocument();
  });
});
