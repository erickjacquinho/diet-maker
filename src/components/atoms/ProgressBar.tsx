import React from 'react';
import { recipes } from '@/design-system';
import { cn } from '@/lib/utils';

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

  return (
    <div
      className={cn(recipes.progress({ tone: tones[colorVariant], size: 'compact' }), className)}
    >
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
