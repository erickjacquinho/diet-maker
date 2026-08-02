import React from 'react';
import { Input } from '@/components/ui/input';
import { calculatePresetCalories } from '@/lib/presetUtils';


export interface AutoKcalSectionProps {
  title?: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  onProteinChange?: (val: number) => void;
  onCarbsChange?: (val: number) => void;
  onFatsChange?: (val: number) => void;
  readOnly?: boolean;
  className?: string;
}

export const AutoKcalSection: React.FC<AutoKcalSectionProps> = ({
  title = 'Metas Iniciais & Cálculo Calórico',
  proteinG,
  carbsG,
  fatsG,
  onProteinChange,
  onCarbsChange,
  onFatsChange,
  readOnly = false,
  className = '',
}) => {
  const calculatedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
  const isReadOnly = readOnly || (!onProteinChange && !onCarbsChange && !onFatsChange);

  return (
    <div className={`p-3 bg-surface-subtle border border-border-subtle rounded-control space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-style-legal font-bold text-text-primary uppercase tracking-wider block">
          {title}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-style-legal font-bold text-macro-protein block uppercase mb-1 text-center">Prot (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-control h-8 flex items-center justify-center font-bold text-xs text-macro-protein shadow-floating">
              {proteinG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={proteinG}
              onChange={(e) => onProteinChange?.(Number(e.target.value))}
              className="bg-surface border-border-subtle text-xs font-bold text-center h-8"
            />
          )}
        </div>

        <div>
          <span className="text-style-legal font-bold text-warning block uppercase mb-1 text-center">Carb (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-lg h-8 flex items-center justify-center font-bold text-xs text-warning shadow-floating">
              {carbsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={carbsG}
              onChange={(e) => onCarbsChange?.(Number(e.target.value))}
              className="bg-surface border-border-subtle text-xs font-bold text-center h-8"
            />
          )}
        </div>

        <div>
          <span className="text-style-legal font-bold text-success block uppercase mb-1 text-center">Gord (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-lg h-8 flex items-center justify-center font-bold text-xs text-success shadow-floating">
              {fatsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={fatsG}
              onChange={(e) => onFatsChange?.(Number(e.target.value))}
              className="bg-surface border-border-subtle text-xs font-bold text-center h-8"
            />
          )}
        </div>
      </div>

      <div className="p-2 bg-surface border border-border-subtle rounded-lg flex items-center justify-between text-style-legal">
        <div>
          <span className="font-bold text-text-primary block">Calorias Totais (Calculadas)</span>
          <span className="text-style-chart-micro text-text-muted block font-medium">Auto: (Prot × 4) + (Carb × 4) + (Gord × 9)</span>
        </div>
        <span className="font-bold text-xs text-success">{calculatedKcal} kcal</span>
      </div>
    </div>
  );
};

