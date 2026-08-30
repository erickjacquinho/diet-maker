import type React from 'react';

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

export type MacroSummaryComponent = React.FC<MacroSummaryProps>;
