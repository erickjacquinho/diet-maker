import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 a 100
  colorVariant?: 'emerald' | 'rose' | 'amber' | 'teal';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorVariant = 'emerald',
  className = '',
}) => {
  const colors = {
    emerald: 'bg-warm-emerald',
    rose: 'bg-warm-rose',
    amber: 'bg-warm-amber',
    teal: 'bg-warm-teal',
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full bg-warm-border h-2 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${colors[colorVariant]} h-full transition-all duration-300`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
