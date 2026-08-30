import { render, screen } from '@testing-library/react';
import { Weight } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import {
  MetricBoxGroup,
  type MetricBoxGroupItem,
  type MetricBoxGroupItems,
} from '@/components/organisms/MetricBoxGroup';

function asItems(items: MetricBoxGroupItem[]): MetricBoxGroupItems {
  return items as unknown as MetricBoxGroupItems;
}

function createItems(count: number): MetricBoxGroupItems {
  return asItems(
    Array.from({ length: count }, (_, index) => ({
      label: `Indicador ${index + 1}`,
      value: `${index + 1}`,
    })),
  );
}

describe('MetricBoxGroup', () => {
  it('renders one indicator without internal dividers and keeps the current defaults', () => {
    render(
      <MetricBoxGroup
        data-testid="metric-box-group"
        items={[
          {
            label: 'Peso atual',
            value: '80 kg',
          },
        ]}
      />,
    );

    const group = screen.getByTestId('metric-box-group');
    expect(group).toHaveClass('grid-cols-1', 'divide-x', 'bg-surface');
    expect(group.children).toHaveLength(1);
    expect(group.firstElementChild).toHaveClass('min-w-0', 'px-3', 'py-3');
    expect(screen.getByText('Peso atual')).toBeInTheDocument();
    expect(screen.getByText('80 kg')).toBeInTheDocument();
  });

  it('renders four configurable indicators with the same four-column structure', () => {
    render(
      <MetricBoxGroup
        data-testid="metric-box-group"
        items={[
          {
            label: 'Peso atual',
            value: '80 kg',
            icon: <Weight data-testid="weight-icon" size={12} strokeWidth={1.75} />,
          },
          { label: '% de gordura', value: '22%' },
          { label: 'Massa magra', value: '62 kg' },
          { label: 'Cintura', value: '82 cm' },
        ]}
      />,
    );

    const group = screen.getByTestId('metric-box-group');
    expect(group).toHaveClass('grid-cols-4', 'divide-border-divider', 'rounded-control');
    expect(group.children).toHaveLength(4);
    expect(screen.getByTestId('weight-icon')).toHaveAttribute('width', '12');
    expect(screen.getByTestId('weight-icon')).toHaveAttribute('height', '12');
    expect(screen.getByText('Massa magra')).toBeInTheDocument();
  });

  it('supports five indicators and item-specific MetricBox parameters', () => {
    render(
      <MetricBoxGroup
        data-testid="metric-box-group"
        items={[
          { label: 'Um', value: '1' },
          { label: 'Dois', value: '2' },
          {
            label: 'Três',
            value: '3',
            caption: 'Detalhe',
            size: 'large',
            tone: 'protein',
            surface: 'boxed',
            layout: 'stack',
          },
          { label: 'Quatro', value: '4' },
          { label: 'Cinco', value: '5' },
        ]}
      />,
    );

    const group = screen.getByTestId('metric-box-group');
    expect(group).toHaveClass('grid-cols-5');
    expect(group.children).toHaveLength(5);
    expect(screen.getByText('Detalhe')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('text-macro-protein', 'text-style-body');
  });

  it('rejects an invalid runtime item count', () => {
    expect(() => render(<MetricBoxGroup items={createItems(0)} />)).toThrow(
      'MetricBoxGroup requires between 1 and 8 items.',
    );
    expect(() => render(<MetricBoxGroup items={createItems(9)} />)).toThrow(
      'MetricBoxGroup requires between 1 and 8 items.',
    );
  });
});
