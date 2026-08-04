import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricBox } from '../MetricBox';

describe('Component UI Seam: MetricBox', () => {
  it('renders label, value and optional caption', () => {
    render(<MetricBox label="Proteínas" value="150g" caption="2.1 g/kg" />);

    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getByText('2.1 g/kg')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <MetricBox
        label="Meta Kcal"
        value="2200 kcal"
        icon={<span aria-hidden="true">🔥</span>}
      />
    );

    expect(screen.getByText('2200 kcal')).toBeInTheDocument();
  });

  it('applies tone class to value', () => {
    render(<MetricBox label="Proteínas" value="150g" tone="protein" />);

    expect(screen.getByText('150g')).toHaveClass('text-macro-protein');
  });

  it('does not render surface classes for inline variant', () => {
    const { container } = render(
      <MetricBox label="Peso" value="82kg" surface="inline" />
    );

    expect(container.firstChild).not.toHaveClass('bg-surface-subtle');
  });
});
