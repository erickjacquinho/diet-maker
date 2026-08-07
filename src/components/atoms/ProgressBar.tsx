import React from 'react';
import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface ProgressBarProps {
  value: number; // 0 a 100
  colorVariant?: 'emerald' | 'rose' | 'amber' | 'teal' | 'blue';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorVariant = 'emerald',
  className = '',
}) => {
  const tones = { emerald: 'success', rose: 'error', amber: 'warning', teal: 'info', blue: 'protein' } as const;
  const clampedValue = Math.min(100, Math.max(0, value));

  const toneIndicatorMap = {
    emerald: 'bg-success',
    rose: 'bg-error',
    amber: 'bg-warning',
    teal: 'bg-info',
    blue: 'bg-macro-protein',
  } as const;

  return (
    <Progress
      value={clampedValue}
      className={cn(recipes.progress({ tone: tones[colorVariant], size: 'compact' }), className)}
      indicatorClassName={toneIndicatorMap[colorVariant]}
    />
  );
};

