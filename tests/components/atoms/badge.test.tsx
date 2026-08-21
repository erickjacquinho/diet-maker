import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/atoms/Badge';

describe('Badge atom macro and semantic variants', () => {
  it('renders protein variant with canonical macro-protein classes', () => {
    render(<Badge variant="protein" data-testid="badge-protein">P: 150g</Badge>);
    const badge = screen.getByTestId('badge-protein');
    expect(badge).toHaveClass('text-macro-protein', 'bg-macro-protein-soft', 'border-macro-protein-border');
    expect(badge).toHaveTextContent('P: 150g');
  });

  it('renders carbohydrate variant with canonical macro-carbohydrate classes', () => {
    render(<Badge variant="carbohydrate" data-testid="badge-carb">C: 220g</Badge>);
    const badge = screen.getByTestId('badge-carb');
    expect(badge).toHaveClass('text-macro-carbohydrate', 'bg-macro-carbohydrate-soft', 'border-macro-carbohydrate-border');
  });

  it('renders fat variant with canonical macro-fat classes', () => {
    render(<Badge variant="fat" data-testid="badge-fat">G: 60g</Badge>);
    const badge = screen.getByTestId('badge-fat');
    expect(badge).toHaveClass('text-macro-fat', 'bg-macro-fat-soft', 'border-macro-fat-border');
  });

  it('renders kcal variant with warning classes', () => {
    render(<Badge variant="kcal" data-testid="badge-kcal">2000 kcal</Badge>);
    const badge = screen.getByTestId('badge-kcal');
    expect(badge).toHaveClass('text-warning', 'bg-warning-soft', 'border-warning-border');
  });
});