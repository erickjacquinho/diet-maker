import React from 'react';
import { textStyle } from '@/design-system';
import { Input } from '@/components/ui/input';

function formatInputValue(value: number | undefined): string | number {
  return value !== undefined && Number.isFinite(value) ? value : '';
}

export interface AssessmentMeasurementFieldProps {
  id: string;
  label: string;
  unit: string;
  value: number | undefined;
  previousValue?: number | undefined;
  onChange: (value: string) => void;
  className?: string;
}

export function AssessmentMeasurementField({
  id,
  label,
  unit,
  value,
  previousValue,
  onChange,
  className = 'min-w-0',
}: AssessmentMeasurementFieldProps) {
  const hasPrevious = previousValue !== undefined && Number.isFinite(previousValue);
  const delta =
    hasPrevious && value !== undefined && Number.isFinite(value)
      ? Number((value - previousValue).toFixed(1))
      : null;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-1">
        <label htmlFor={id} className={textStyle('field-label')}>
          {label} ({unit})
        </label>
        {hasPrevious && (
          <span className="text-[11px] text-text-muted">
            Ant: {previousValue} {unit}
          </span>
        )}
      </div>

      <Input
        id={id}
        type="number"
        step="any"
        min="0"
        required
        value={formatInputValue(value)}
        onFocus={(event) => event.target.select()}
        onChange={(event) => onChange(event.target.value)}
      />

      {delta !== null && Math.abs(delta) >= 0.01 && (
        <span className={`text-[11px] font-medium self-end -mt-0.5 ${delta < 0 ? 'text-success' : 'text-text-secondary'}`}>
          {delta > 0 ? `+${delta}` : delta} {unit}
        </span>
      )}
    </div>
  );
}
