import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MacroSummary } from '@/components/molecules/MacroSummary';

describe('MacroSummary component', () => {
  it('renders protein, carbs and fats with proper labels and semantic colors', () => {
    render(<MacroSummary protein={150} carbs={286} fats={60} />);

    const proteinEl = screen.getByText(/P\s*150g/);
    expect(proteinEl).toBeInTheDocument();
    expect(proteinEl).toHaveClass('text-macro-protein');
    expect(proteinEl).toHaveAttribute('title', 'Proteína');

    const carbsEl = screen.getByText(/C\s*286g/);
    expect(carbsEl).toBeInTheDocument();
    expect(carbsEl).toHaveClass('text-macro-carbohydrate');
    expect(carbsEl).toHaveAttribute('title', 'Carboidratos');

    const fatsEl = screen.getByText(/G\s*60g/);
    expect(fatsEl).toBeInTheDocument();
    expect(fatsEl).toHaveClass('text-macro-fat');
    expect(fatsEl).toHaveAttribute('title', 'Gorduras');
  });

  it('renders calories when kcal prop is provided', () => {
    render(<MacroSummary protein={150} carbs={286} fats={60} kcal={2284} />);

    expect(screen.getByText(/2284/)).toBeInTheDocument();
    expect(screen.getByText(/kcal/)).toBeInTheDocument();
  });

  it('does not render calories or extra bullet when kcal prop is omitted', () => {
    render(<MacroSummary protein={150} carbs={286} fats={60} />);

    expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
  });

  it('supports custom kcalSuffix and unit', () => {
    render(
      <MacroSummary
        protein={30}
        carbs={45}
        fats={10}
        kcal={390}
        unit="g"
        kcalSuffix="kcal (por 100g)"
      />
    );

    expect(screen.getByText(/P\s*30g/)).toBeInTheDocument();
    expect(screen.getByText(/kcal \(por 100g\)/)).toBeInTheDocument();
  });

  it('supports hiding labels P, C, G when showLabels is false', () => {
    render(
      <MacroSummary
        protein={150}
        carbs={286}
        fats={60}
        showLabels={false}
      />
    );

    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getByText('286g')).toBeInTheDocument();
    expect(screen.getByText('60g')).toBeInTheDocument();
  });

  it('applies custom className and data-testid', () => {
    render(
      <MacroSummary
        protein={100}
        carbs={200}
        fats={50}
        className="custom-macro-class"
        data-testid="custom-macro-summary"
      />
    );

    const container = screen.getByTestId('custom-macro-summary');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('custom-macro-class');
  });
});
