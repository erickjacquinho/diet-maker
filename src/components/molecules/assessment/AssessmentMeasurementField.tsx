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
  isRequired?: boolean;
  isAutoFilled?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export function AssessmentMeasurementField({
  id,
  label,
  unit,
  value,
  previousValue,
  isRequired = false,
  isAutoFilled = false,
  onChange,
  className = 'min-w-0',
}: AssessmentMeasurementFieldProps) {
  const hasPrevious = previousValue !== undefined && Number.isFinite(previousValue);
  const delta =
    hasPrevious && value !== undefined && Number.isFinite(value)
      ? Number((value - previousValue).toFixed(1))
      : null;

  const showDelta = delta !== null && Math.abs(delta) >= 0.01;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Header do Campo: Label, Indicador Obrigatório, Tag Auto e Histórico Anterior */}
      <div className="flex items-center justify-between gap-1">
        <label htmlFor={id} className={`${textStyle('field-label')} truncate flex items-center gap-1`}>
          <span>{label}</span>
          {isRequired && (
            <span className="text-error font-bold text-style-legal" title="Campo obrigatório">
              *
            </span>
          )}
          {isAutoFilled && (
            <span
              className="text-style-chart-micro font-bold font-mono text-primary bg-primary-soft px-1 rounded flex items-center cursor-help"
              title="Medida replicada automaticamente da avaliação anterior"
            >
              ✦ Auto
            </span>
          )}
          <span className="text-text-muted font-normal">({unit})</span>
        </label>
        {hasPrevious && (
          <span className="text-style-chart-micro text-text-muted font-mono tabular-nums whitespace-nowrap">
            Ant: {previousValue} {unit}
          </span>
        )}
      </div>

      {/* Input com Indicador de Diferença Integrado Alinhado à Direita (Apenas Texto) */}
      <div className="relative flex items-center">
        <Input
          id={id}
          type="number"
          step="any"
          min="0"
          value={formatInputValue(value)}
          onFocus={(event) => event.target.select()}
          onChange={(event) => onChange(event.target.value)}
          className={`h-9 font-mono tabular-nums text-text-primary focus-visible:ring-primary ${
            showDelta ? 'pr-20' : ''
          }`}
        />

        {showDelta && (
          <div className="absolute right-2.5 pointer-events-none flex items-center">
            <span
              className={`text-style-chart-micro font-semibold font-mono tabular-nums ${
                delta < 0 ? 'text-success' : 'text-text-secondary'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
