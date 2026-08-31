import React from 'react';
import { cn } from '@/lib/utils';

export interface MacroSummaryProps {
  protein: number | string | null | undefined;
  carbs: number | string | null | undefined;
  fats: number | string | null | undefined;
  kcal?: number | string | null;
  showKcal?: boolean;
  unit?: string;
  kcalSuffix?: string;
  showLabels?: boolean;
  className?: string;
  'data-testid'?: string;
}

function formatMacroValue(value: MacroSummaryProps['protein'], unit: string) {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${unit}`;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({
  protein,
  carbs,
  fats,
  kcal,
  showKcal = true,
  unit = 'g',
  kcalSuffix = 'kcal',
  showLabels = true,
  className,
  'data-testid': testId = 'macro-summary',
}) => {
  const isKcalVisible =
    showKcal !== false && kcal !== undefined && kcal !== null && kcal !== '';

  return (
    <div
      data-testid={testId}
      className={cn(
        'inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap text-style-caption font-medium text-left shrink-0',
        className
      )}
    >
      {/* Proteína */}
      <span className="font-bold text-macro-protein" title="Proteína">
        {showLabels && 'P '}
        {formatMacroValue(protein, unit)}
      </span>

      {/* Separador */}
      <span className="text-text-muted text-style-chart-micro" aria-hidden="true">
        •
      </span>

      {/* Carboidratos */}
      <span className="font-bold text-macro-carbohydrate" title="Carboidratos">
        {showLabels && 'C '}
        {formatMacroValue(carbs, unit)}
      </span>

      {/* Separador */}
      <span className="text-text-muted text-style-chart-micro" aria-hidden="true">
        •
      </span>

      {/* Gorduras */}
      <span className="font-bold text-macro-fat" title="Gorduras">
        {showLabels && 'G '}
        {formatMacroValue(fats, unit)}
      </span>

      {/* Calorias (opcional e controlável) */}
      {isKcalVisible && (
        <>
          <span className="text-text-muted text-style-chart-micro" aria-hidden="true">
            •
          </span>
          <span className="font-bold text-text-primary whitespace-nowrap">
            {kcal}{' '}
            <span className="text-style-legal font-normal text-text-muted">
              {kcalSuffix}
            </span>
          </span>
        </>
      )}
    </div>
  );
};

export const MacroNutrientSummary = MacroSummary;
MacroSummary.displayName = 'MacroSummary';
