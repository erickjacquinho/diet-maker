import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroMetricCard } from '../MacroMetricCard';

describe('Component UI Seam: MacroMetricCard', () => {
  it('renders label, current value, target value and progress bar', () => {
    render(
      <MacroMetricCard
        label="Proteínas"
        currentValue="150g"
        targetValue="160g"
        percentage={93}
        macroColor="emerald"
      />
    );

    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getByText('/ 160g')).toBeInTheDocument();
  });

  it('renders status badge and g/kg ratio when provided', () => {
    render(
      <MacroMetricCard
        label="Carboidratos"
        currentValue="250g"
        targetValue="250g"
        statusBadgeText="100%"
        statusBadgeVariant="emerald"
        percentage={100}
        gPerKgRatio="3.12 g/kg"
        gPerKgMeta="3.0"
        macroColor="amber"
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('3.12 g/kg')).toBeInTheDocument();
    expect(screen.getByText('(meta: 3.0)')).toBeInTheDocument();
  });
});
