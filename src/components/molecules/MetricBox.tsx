import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type MetricBoxTone = 'default' | 'muted' | 'protein' | 'carbohydrate' | 'fat' | 'success' | 'warning';
export type MetricBoxSize = 'compact' | 'standard' | 'large' | 'hero';
export type MetricBoxSurface = 'boxed' | 'raised' | 'tinted' | 'inline';
export type MetricBoxLayout = 'stack' | 'split';

export interface MetricBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: MetricBoxTone;
  size?: MetricBoxSize;
  surface?: MetricBoxSurface;
  layout?: MetricBoxLayout;
}

const tintedToneClasses: Record<MetricBoxTone, string> = {
  default: 'bg-surface-subtle/60 border-border-subtle',
  muted: 'bg-surface-subtle/60 border-border-subtle',
  protein: 'bg-primary-soft/50 border-primary-border',
  carbohydrate: 'bg-warning-soft/50 border-warning-border',
  fat: 'bg-success-soft/50 border-success-border',
  success: 'bg-success-soft/50 border-success-border',
  warning: 'bg-warning-soft/50 border-warning-border',
};

const valueClasses: Record<MetricBoxSize, string> = {
  compact: 'text-style-legal',
  standard: 'text-style-body-small',
  large: 'text-style-body',
  hero: 'text-style-body-large',
};

const toneClasses: Record<MetricBoxTone, string> = {
  default: 'text-text-primary',
  muted: 'text-text-muted',
  protein: 'text-macro-protein',
  carbohydrate: 'text-macro-carbohydrate',
  fat: 'text-macro-fat',
  success: 'text-success',
  warning: 'text-warning',
};

const paddingBySize: Record<MetricBoxSize, string> = {
  compact: 'p-3',
  standard: 'p-4',
  large: 'p-4',
  hero: 'p-5',
};

export const MetricBox: React.FC<MetricBoxProps> = ({
  label,
  value,
  caption,
  icon,
  tone = 'default',
  size = 'standard',
  surface = 'boxed',
  layout = 'stack',
  className,
  ...props
}) => {
  const isTinted = surface === 'tinted';
  const isSplit = layout === 'split';

  const layoutClasses = cn(
    'flex gap-1',
    isSplit ? 'items-center justify-between w-full' : 'flex-col items-center text-center',
  );
  const content = (
    <>
      <div className={cn('flex flex-col gap-1', isSplit ? 'items-start' : 'items-center')}>
        <div className="flex items-center gap-1 text-style-legal font-bold text-text-muted tracking-label">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{label}</span>
        </div>
        {isSplit && caption && <span className="text-style-chart-micro font-semibold text-text-muted">{caption}</span>}
      </div>
      <div className={cn('font-bold tabular-nums lining-nums shrink-0', valueClasses[size], toneClasses[tone])}>
        {value}
      </div>
      {!isSplit && caption && (
        <span className="text-style-chart-micro font-semibold text-text-muted block">{caption}</span>
      )}
    </>
  );

  if (surface === 'inline') {
    return (
      <div className={cn(layoutClasses, className)} {...props}>
        {content}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        layoutClasses,
        paddingBySize[size],
        surface === 'raised' ? 'bg-surface border-border-subtle shadow-none' : 'bg-surface-subtle border-border-subtle',
        isTinted && tintedToneClasses[tone],
        className,
      )}
      {...props}
    >
      {content}
    </Card>
  );
};
