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
  onChange: (value: string) => void;
  className?: string;
}

export function AssessmentMeasurementField({
  id,
  label,
  unit,
  value,
  onChange,
  className = 'min-w-0',
}: AssessmentMeasurementFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className={textStyle('field-label')}>
        {label} ({unit})
      </label>
      <Input
        id={id}
        type="number"
        step="any"
        min="0"
        required
        value={formatInputValue(value)}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
