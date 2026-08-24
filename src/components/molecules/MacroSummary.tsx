import React from 'react';
import { cn } from '@/lib/utils';

export interface MacroSummaryProps {
  protein: number | string;
  carbs: number | string;
  fats: number | string;
  kcal?: number | string;
  unit?: string;
  kcalSuffix?: string;
  showLabels?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({
  protein,
  carbs,
  fats,
  kcal,
  unit = 'g',
  kcalSuffix = 'kcal',
  showLabels = true,
  className,
  'data-testid': testId = 'macro-summary',
}) => {
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-style-caption font-medium text-left',
        className
      )}
    >
      {/* Proteína */}
      <span className="font-bold text-macro-protein" title="Proteína">
        {showLabels && 'P '}
        {protein}
        {unit}
      </span>

      {/* Separador */}
      <span className="text-text-muted text-style-chart-micro" aria-hidden="true">
        •
      </span>

      {/* Carboidratos */}
      <span className="font-bold text-macro-carbohydrate" title="Carboidratos">
        {showLabels && 'C '}
        {carbs}
        {unit}
      </span>

      {/* Separador */}
      <span className="text-text-muted text-style-chart-micro" aria-hidden="true">
        •
      </span>

      {/* Gorduras */}
      <span className="font-bold text-macro-fat" title="Gorduras">
        {showLabels && 'G '}
        {fats}
        {unit}
      </span>

      {/* Calorias (opcional) */}
      {kcal !== undefined && kcal !== null && (
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
