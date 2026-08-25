'use client';

import React, { useMemo } from 'react';
import { calculateMacroDistributionPct } from '@/lib/nutrition/macroCalculations';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

export interface MacroProportionBarProps {
  proteinG: number;
  carbsG: number;
  fatsG: number;
  kcal?: number;
  showLegend?: boolean;
  showCalories?: boolean;
  size?: 'compact' | 'standard';
  className?: string;
}

/**
 * MacroProportionBar — Barra multi-segmentada de proporção e distribuição calórica (% VET)
 * dos macronutrientes (Proteínas, Carboidratos e Gorduras) seguindo a ordem canônica normativa.
 */
export const MacroProportionBar: React.FC<MacroProportionBarProps> = ({
  proteinG,
  carbsG,
  fatsG,
  kcal,
  showLegend = true,
  showCalories = true,
  size = 'compact',
  className = '',
}) => {
  const safeP = Math.max(0, Math.round(proteinG * 10) / 10);
  const safeC = Math.max(0, Math.round(carbsG * 10) / 10);
  const safeF = Math.max(0, Math.round(fatsG * 10) / 10);

  const distribution = useMemo(() => {
    return calculateMacroDistributionPct(safeP, safeC, safeF);
  }, [safeP, safeC, safeF]);

  const computedKcal = calculatePresetCalories(safeP, safeC, safeF);
  const displayKcal = kcal !== undefined && kcal > 0 ? Math.round(kcal) : computedKcal;
  const hasMacros = distribution.totalKcal > 0;

  return (
    <div
      data-testid="macro-proportion-bar"
      className={cn(
        'flex flex-col gap-2 rounded-control border border-border-divider bg-surface p-3 transition-colors',
        size === 'compact' ? 'py-2.5 px-3' : 'p-3.5',
        className
      )}
    >
      {/* Barra Multi-Segmentada */}
      {hasMacros ? (
        <div
          role="progressbar"
          aria-label="Proporção calórica dos macronutrientes"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-border-divider flex"
        >
          {distribution.proteinPct > 0 && (
            <div
              style={{ width: `${distribution.proteinPct}%` }}
              className="h-full bg-macro-protein transition-all duration-300"
              title={`Proteínas: ${distribution.proteinPct}% (${safeP}g · ${distribution.proteinKcal} kcal)`}
            />
          )}
          {distribution.carbsPct > 0 && (
            <div
              style={{ width: `${distribution.carbsPct}%` }}
              className="h-full bg-macro-carbohydrate transition-all duration-300"
              title={`Carboidratos: ${distribution.carbsPct}% (${safeC}g · ${distribution.carbsKcal} kcal)`}
            />
          )}
          {distribution.fatsPct > 0 && (
            <div
              style={{ width: `${distribution.fatsPct}%` }}
              className="h-full bg-macro-fat transition-all duration-300"
              title={`Gorduras: ${distribution.fatsPct}% (${safeF}g · ${distribution.fatsKcal} kcal)`}
            />
          )}
        </div>
      ) : (
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-dashed border-border-divider" />
      )}

      {/* Legenda Canônica: 1º Proteínas -> 2º Carboidratos -> 3º Gorduras -> 4º Total Calorias */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-style-chart-micro tabular-nums">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Proteínas */}
            <div className="flex items-center gap-1.5" title="Proteínas">
              <span className="size-2 rounded-full bg-macro-protein shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                P: <strong className="font-bold text-macro-protein">{safeP}g</strong>{' '}
                {hasMacros && <span className="text-text-muted font-normal">({distribution.proteinPct}%)</span>}
              </span>
            </div>

            {/* 2. Carboidratos */}
            <div className="flex items-center gap-1.5" title="Carboidratos">
              <span className="size-2 rounded-full bg-macro-carbohydrate shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                C: <strong className="font-bold text-macro-carbohydrate">{safeC}g</strong>{' '}
                {hasMacros && <span className="text-text-muted font-normal">({distribution.carbsPct}%)</span>}
              </span>
            </div>

            {/* 3. Gorduras */}
            <div className="flex items-center gap-1.5" title="Gorduras">
              <span className="size-2 rounded-full bg-macro-fat shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                G: <strong className="font-bold text-macro-fat">{safeF}g</strong>{' '}
                {hasMacros && <span className="text-text-muted font-normal">({distribution.fatsPct}%)</span>}
              </span>
            </div>
          </div>

          {/* 4. Total Calorias */}
          {showCalories && (
            <div className="flex items-center gap-1 font-bold text-text-primary ml-auto" title="Calorias Totais da Refeição">
              <Flame size={12} className="text-text-muted shrink-0" aria-hidden="true" />
              <span>
                {displayKcal}{' '}
                <span className="text-style-chart-micro font-normal text-text-muted">kcal</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
