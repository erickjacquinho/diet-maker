import React from 'react';
import { cn } from '@/lib/utils';

export interface MacroSummaryProps {
  protein: number | string;
  carbs: number | string;
  fats: number | string;
  kcal?: number | string;
  showKcal?: boolean;
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
