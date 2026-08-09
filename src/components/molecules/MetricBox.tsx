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
  unit?: React.ReactNode;
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

const iconClasses: Record<MetricBoxSize, string> = {
  compact: 'size-3.5 [&>svg]:size-3.5',
  standard: 'size-4 [&>svg]:size-4',
  large: 'size-5 [&>svg]:size-5',
  hero: 'size-6 [&>svg]:size-6',
};

const labelClasses: Record<MetricBoxSize, string> = {
  compact: 'text-style-legal font-bold tracking-label',
  standard: 'text-style-caption font-bold tracking-label',
  large: 'text-style-body-small font-bold tracking-label',
  hero: 'text-style-field-label font-bold tracking-label',
};

const valueClasses: Record<MetricBoxSize, string> = {
  compact: 'text-style-legal',
  standard: 'text-style-body-small',
  large: 'text-style-body',
  hero: 'text-style-body-large',
};

const unitClasses: Record<MetricBoxSize, string> = {
  compact: 'text-style-legal font-medium',
  standard: 'text-style-legal font-medium',
  large: 'text-style-caption font-medium',
  hero: 'text-style-body-small font-medium',
};

const captionClasses: Record<MetricBoxSize, string> = {
  compact: 'text-style-chart-micro font-semibold',
  standard: 'text-style-legal font-semibold',
  large: 'text-style-caption font-semibold',
  hero: 'text-style-body-small font-semibold',
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
  unit,
  caption,
  icon,
  tone = 'default',
  size = 'compact',
  surface = 'boxed',
  layout = 'split',
  className,
  ...props
}) => {
  const isTinted = surface === 'tinted';
  const isSplit = layout === 'split';

  const layoutClasses = cn(
    'flex gap-1',
    isSplit ? 'items-center justify-between w-full' : 'flex-col items-center justify-center text-center w-full',
  );
  const content = (
    <>
      <div className={cn('flex flex-col gap-1', isSplit ? 'items-start' : 'items-center')}>
        <div className={cn('flex items-center gap-1.5 text-text-muted', labelClasses[size])}>
          {icon && (
            <span className={cn('shrink-0 text-primary flex items-center justify-center', iconClasses[size])}>
              {icon}
            </span>
          )}
          <span>{label}</span>
        </div>
        {isSplit && caption && (
          <span className={cn('text-text-muted', captionClasses[size])}>{caption}</span>
        )}
      </div>
      <div className={cn('font-bold tabular-nums lining-nums shrink-0 flex items-baseline gap-1', valueClasses[size], toneClasses[tone])}>
        <span>{value}</span>
        {unit && <span className={cn('font-normal text-text-muted', unitClasses[size])}>{unit}</span>}
      </div>
      {!isSplit && caption && (
        <span className={cn('text-text-muted block', captionClasses[size])}>{caption}</span>
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
