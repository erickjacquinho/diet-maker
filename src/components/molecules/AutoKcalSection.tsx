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
    <div className={`p-3 bg-surface-subtle border border-border-subtle rounded-control flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-style-legal font-bold text-text-primary tracking-overline block">
          {title}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-style-legal font-bold text-macro-protein block tracking-label mb-1 text-center">Prot (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-control h-control-compact flex items-center justify-center font-bold text-style-field-value text-macro-protein shadow-none">
              {proteinG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              size="compact"
              value={proteinG}
              onChange={(e) => onProteinChange?.(Number(e.target.value))}
              className="text-style-field-value font-bold text-center h-control-compact"
            />
          )}
        </div>

        <div>
          <span className="text-style-legal font-bold text-macro-carbohydrate block tracking-label mb-1 text-center">Carb (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-control h-control-compact flex items-center justify-center font-bold text-style-field-value text-macro-carbohydrate shadow-none">
              {carbsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              size="compact"
              value={carbsG}
              onChange={(e) => onCarbsChange?.(Number(e.target.value))}
              className="text-style-field-value font-bold text-center h-control-compact"
            />
          )}
        </div>

        <div>
          <span className="text-style-legal font-bold text-macro-fat block tracking-label mb-1 text-center">Gord (g)</span>
          {isReadOnly ? (
            <div className="bg-surface border border-border-subtle rounded-control h-control-compact flex items-center justify-center font-bold text-style-field-value text-macro-fat shadow-none">
              {fatsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              size="compact"
              value={fatsG}
              onChange={(e) => onFatsChange?.(Number(e.target.value))}
              className="text-style-field-value font-bold text-center h-control-compact"
            />
          )}
        </div>
      </div>

      <div className="p-2 bg-surface border border-border-subtle rounded-control flex items-center justify-between text-style-legal">
        <div>
          <span className="font-bold text-text-primary block">Calorias Totais (Calculadas)</span>
          <span className="text-style-chart-micro text-text-muted block font-medium">Auto: (Prot × 4) + (Carb × 4) + (Gord × 9)</span>
        </div>
        <span className="font-bold text-style-legal text-macro-kcal">{calculatedKcal} kcal</span>
      </div>
    </div>
  );
};


