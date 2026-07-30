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
    <div className={`p-3 bg-warm-inner border border-warm-border rounded-xl space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-warm-charcoal uppercase tracking-wider block">
          {title}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="text-[10px] font-bold text-blue-600 block uppercase mb-1 text-center">Prot (g)</span>
          {isReadOnly ? (
            <div className="bg-warm-card border border-warm-border rounded-lg h-8 flex items-center justify-center font-black text-xs text-blue-600 shadow-xs">
              {proteinG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={proteinG}
              onChange={(e) => onProteinChange?.(Number(e.target.value))}
              className="bg-warm-card border-warm-border text-xs font-bold text-center h-8"
            />
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-amber-600 block uppercase mb-1 text-center">Carb (g)</span>
          {isReadOnly ? (
            <div className="bg-warm-card border border-warm-border rounded-lg h-8 flex items-center justify-center font-black text-xs text-amber-600 shadow-xs">
              {carbsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={carbsG}
              onChange={(e) => onCarbsChange?.(Number(e.target.value))}
              className="bg-warm-card border-warm-border text-xs font-bold text-center h-8"
            />
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-emerald-600 block uppercase mb-1 text-center">Gord (g)</span>
          {isReadOnly ? (
            <div className="bg-warm-card border border-warm-border rounded-lg h-8 flex items-center justify-center font-black text-xs text-emerald-600 shadow-xs">
              {fatsG}g
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={fatsG}
              onChange={(e) => onFatsChange?.(Number(e.target.value))}
              className="bg-warm-card border-warm-border text-xs font-bold text-center h-8"
            />
          )}
        </div>
      </div>

      <div className="p-2 bg-warm-card border border-warm-border rounded-lg flex items-center justify-between text-[11px]">
        <div>
          <span className="font-bold text-warm-charcoal block">Calorias Totais (Calculadas)</span>
          <span className="text-[9px] text-warm-muted block font-medium">Auto: (Prot × 4) + (Carb × 4) + (Gord × 9)</span>
        </div>
        <span className="font-black text-xs text-warm-emerald">{calculatedKcal} kcal</span>
      </div>
    </div>
  );
};

