import type { HTMLAttributes, Key } from 'react';
import { MetricBox, type MetricBoxProps } from '@/components/molecules/MetricBox';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MetricBoxGroupItem = MetricBoxProps & {
  key?: Key;
};

export type MetricBoxGroupItems =
  | readonly [MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem, MetricBoxGroupItem]
  | readonly [
      MetricBoxGroupItem,
      MetricBoxGroupItem,
      MetricBoxGroupItem,
      MetricBoxGroupItem,
      MetricBoxGroupItem,
    ];

export interface MetricBoxGroupProps extends HTMLAttributes<HTMLDivElement> {
  items: MetricBoxGroupItems;
}

const gridColumns: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function MetricBoxGroup({ items, className, ...props }: MetricBoxGroupProps) {
  const itemCount = items.length;

  if (itemCount < 1 || itemCount > 5) {
    throw new RangeError('MetricBoxGroup requires between 1 and 5 items.');
  }

  return (
    <Card
      className={cn(
        'p-0 grid divide-x divide-border-divider overflow-hidden rounded-control border-border-divider bg-surface',
        gridColumns[itemCount],
        className,
      )}
      {...props}
    >
      {items.map((item, index) => {
        const { key: itemKey, className: itemClassName, ...metricProps } = item;

        return (
          <MetricBox
            key={itemKey ?? `metric-box-${index}`}
            {...metricProps}
            size={item.size ?? 'standard'}
            layout={item.layout ?? 'split'}
            surface={item.surface ?? 'inline'}
            className={cn('min-w-0 px-3 py-3', itemClassName)}
          />
        );
      })}
    </Card>
  );
}

