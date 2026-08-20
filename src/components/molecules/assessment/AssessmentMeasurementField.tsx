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
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Header do Campo: Label e Histórico Anterior */}
      <div className="flex items-center justify-between gap-1 h-4">
        <label htmlFor={id} className={`${textStyle('field-label')} truncate`}>
          {label} <span className="text-text-muted font-normal">({unit})</span>
        </label>
        {hasPrevious && (
          <span className="text-[11px] text-text-muted font-mono tabular-nums whitespace-nowrap">
            Ant: {previousValue} {unit}
          </span>
        )}
      </div>

      {/* Input com Seleção Automática ao Focar */}
      <Input
        id={id}
        type="number"
        step="any"
        min="0"
        required
        value={formatInputValue(value)}
        onFocus={(event) => event.target.select()}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 font-mono tabular-nums text-text-primary focus-visible:ring-primary"
      />

      {/* Slot de Variação (Delta) com Altura Reservada para Alinhamento Perfeito */}
      <div className="min-h-[16px] flex items-center justify-end px-0.5">
        {delta !== null && Math.abs(delta) >= 0.01 ? (
          <span
            className={`text-[11px] font-semibold font-mono tabular-nums ${
              delta < 0 ? 'text-success' : 'text-text-secondary'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta} {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
