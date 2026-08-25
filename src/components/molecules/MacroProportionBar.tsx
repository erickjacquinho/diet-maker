'use client';

import React, { useMemo } from 'react';
import { calculateMacroDistributionPct } from '@/lib/nutrition/macroCalculations';
import { calculatePresetCalories } from '@/lib/presetUtils';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

export interface MacroProportionBarProps {
  /** Gramas de proteína (P) */
  proteinG: number;
  /** Gramas de carboidrato (C) */
  carbsG: number;
  /** Gramas de gorduras (G) */
  fatsG: number;
  /** Calorias totais (kcal). Opcional; se omitido, calcula automaticamente via fatores de Atwater. */
  kcal?: number;
  /** Título opcional exibido no topo da barra (ex: "Distribuição Calórica (% VET)") */
  title?: React.ReactNode;
  /** Exibir percentual total (ex: "100%") à direita do título. Padrão: false */
  showTotalPct?: boolean;
  /** Exibir a legenda com macros. Padrão: true */
  showLegend?: boolean;
  /** Exibir o total de calorias na legenda/barra. Padrão: true */
  showCalories?: boolean;
  /** Exibir calorias individuais calculadas por macro (ex: "(320 kcal)"). Padrão: false */
  showKcalPerMacro?: boolean;
  /** Exibir gramaturas na legenda (ex: "80g"). Padrão: true */
  showGrams?: boolean;
  /** Exibir percentuais individuais na legenda (ex: "40%"). Padrão: true */
  showPct?: boolean;
  /** Densidade visual / tamanho da barra e fontes. Padrão: 'compact' */
  size?: 'compact' | 'standard';
  /** Mensagem customizada para estado vazio (quando macros = 0). Opcional */
  emptyMessage?: string;
  /** Classes CSS adicionais do container */
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
  title,
  showTotalPct = false,
  showLegend = true,
  showCalories = true,
  showKcalPerMacro = false,
  showGrams = true,
  showPct = true,
  size = 'compact',
  emptyMessage,
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

  // Se houver emptyMessage definida e não houver macros, renderiza o estado vazio amigável
  if (!hasMacros && emptyMessage) {
    return (
      <div
        data-testid="macro-proportion-bar"
        className={cn(
          'text-center py-3 px-4 text-style-chart-micro text-text-muted italic bg-surface-subtle/30 rounded-control border border-dashed border-border-divider transition-colors',
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      data-testid="macro-proportion-bar"
      className={cn(
        'flex flex-col gap-2 rounded-control border border-border-divider bg-surface p-3 transition-colors',
        size === 'compact' ? 'py-2.5 px-3' : 'p-3.5',
        className
      )}
    >
      {/* Header Opcional de Título e Percentual Total */}
      {(title || showTotalPct) && (
        <div className="flex items-center justify-between text-style-chart-micro text-text-muted font-semibold">
          <div>{title}</div>
          {showTotalPct && (
            <span className="font-bold text-text-primary">
              {hasMacros ? '100%' : '0%'}
            </span>
          )}
        </div>
      )}

      {/* Barra Multi-Segmentada */}
      {hasMacros ? (
        <div
          role="progressbar"
          aria-label="Proporção calórica dos macronutrientes"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            'w-full overflow-hidden rounded-full bg-surface-subtle border border-border-divider flex',
            size === 'compact' ? 'h-2' : 'h-2.5'
          )}
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
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-surface-subtle border border-dashed border-border-divider',
            size === 'compact' ? 'h-2' : 'h-2.5'
          )}
        />
      )}

      {/* Legenda Canônica: 1º Proteínas -> 2º Carboidratos -> 3º Gorduras -> 4º Total Calorias */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-style-chart-micro tabular-nums">
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Proteínas */}
            <div className="flex items-center gap-1.5" title="Proteínas">
              <span className="size-2 rounded-full bg-macro-protein shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                {showGrams ? (
                  <>
                    P: <strong className="font-bold text-macro-protein">{safeP}g</strong>{' '}
                    {hasMacros && showPct && <span className="text-text-muted font-normal">({distribution.proteinPct}%)</span>}
                  </>
                ) : (
                  <>
                    Proteínas: <strong className="font-bold text-text-primary">{distribution.proteinPct}%</strong>
                  </>
                )}
                {showKcalPerMacro && hasMacros && (
                  <span className="text-text-muted font-normal ml-1">({distribution.proteinKcal} kcal)</span>
                )}
              </span>
            </div>

            {/* 2. Carboidratos */}
            <div className="flex items-center gap-1.5" title="Carboidratos">
              <span className="size-2 rounded-full bg-macro-carbohydrate shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                {showGrams ? (
                  <>
                    C: <strong className="font-bold text-macro-carbohydrate">{safeC}g</strong>{' '}
                    {hasMacros && showPct && <span className="text-text-muted font-normal">({distribution.carbsPct}%)</span>}
                  </>
                ) : (
                  <>
                    Carboidratos: <strong className="font-bold text-text-primary">{distribution.carbsPct}%</strong>
                  </>
                )}
                {showKcalPerMacro && hasMacros && (
                  <span className="text-text-muted font-normal ml-1">({distribution.carbsKcal} kcal)</span>
                )}
              </span>
            </div>

            {/* 3. Gorduras */}
            <div className="flex items-center gap-1.5" title="Gorduras">
              <span className="size-2 rounded-full bg-macro-fat shrink-0" aria-hidden="true" />
              <span className="text-text-muted">
                {showGrams ? (
                  <>
                    G: <strong className="font-bold text-macro-fat">{safeF}g</strong>{' '}
                    {hasMacros && showPct && <span className="text-text-muted font-normal">({distribution.fatsPct}%)</span>}
                  </>
                ) : (
                  <>
                    Gorduras: <strong className="font-bold text-text-primary">{distribution.fatsPct}%</strong>
                  </>
                )}
                {showKcalPerMacro && hasMacros && (
                  <span className="text-text-muted font-normal ml-1">({distribution.fatsKcal} kcal)</span>
                )}
              </span>
            </div>
          </div>

          {/* 4. Total Calorias */}
          {showCalories && (
            <div className="flex items-center gap-1 font-bold text-text-primary ml-auto" title="Calorias Totais">
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
