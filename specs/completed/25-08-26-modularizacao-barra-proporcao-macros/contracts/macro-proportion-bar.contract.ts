import React from 'react';

export interface MacroProportionBarContractProps {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal?: number;
  title?: React.ReactNode;
  showTotalPct?: boolean;
  showLegend?: boolean;
  showCalories?: boolean;
  showKcalPerMacro?: boolean;
  showGrams?: boolean;
  showPct?: boolean;
  size?: 'compact' | 'standard';
  emptyMessage?: string;
  className?: string;
}

export type MacroProportionBarComponent = React.FC<MacroProportionBarContractProps>;
