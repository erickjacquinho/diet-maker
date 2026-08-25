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
  /** Título exibido no topo da barra. Padrão: "Distribuição Calórica (% VET)" (passar false para ocultar) */
  title?: React.ReactNode | false;
  /** Exibir percentual total (ex: "100%") à direita do título. Padrão: true */
  showTotalPct?: boolean;
  /** Exibir a legenda com macros. Padrão: true */
  showLegend?: boolean;
  /** Exibir o total de calorias na legenda/barra. Padrão: true */
  showCalories?: boolean;
  /** Exibir calorias individuais calculadas por macro (ex: "(320 kcal)"). Padrão: true */
  showKcalPerMacro?: boolean;
  /** Exibir gramaturas na legenda (ex: "80g"). Padrão: true */
  showGrams?: boolean;
  /** Exibir percentuais individuais na legenda (ex: "40%"). Padrão: true */
  showPct?: boolean;
  /** Formato dos rótulos dos macros: 'full' ("Proteínas") ou 'short' ("P:"). Padrão: 'full' */
  labelFormat?: 'full' | 'short';
  /** Densidade visual / tamanho da barra e fontes. Padrão: 'standard' */
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
  title = 'Distribuição Calórica (% VET)',
  showTotalPct = true,
  showLegend = true,
  showCalories = true,
  showKcalPerMacro = true,
  showGrams = true,
  showPct = true,
  labelFormat = 'full',
  size = 'standard',
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

  const hasTitle = title !== false && title !== null && title !== undefined;

  return (
    <div
      data-testid="macro-proportion-bar"
      className={cn(
        'flex flex-col gap-2 rounded-control border border-border-divider bg-surface-subtle/40 p-3.5 transition-colors',
        size === 'compact' ? 'py-2.5 px-3' : 'p-3.5',
        className
      )}
    >
      {/* Header de Título e Percentual Total / Calorias */}
      {(hasTitle || showTotalPct || showCalories) && (
        <div className="flex items-center justify-between text-style-chart-micro text-text-muted font-semibold">
          {hasTitle && <div>{title}</div>}
          <div className="flex items-center gap-2 ml-auto">
            {showTotalPct && (
              <span className="font-bold text-text-primary">
                {hasMacros ? '100%' : '0%'}
              </span>
            )}
            {showCalories && (
              <span className="flex items-center gap-1 font-bold text-text-primary pl-1.5 border-l border-border-divider" title="Calorias Totais">
                <Flame size={12} className="text-warning shrink-0" aria-hidden="true" />
                <span>
                  {displayKcal} <span className="font-normal text-text-muted">kcal</span>
                </span>
              </span>
            )}
          </div>
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

      {/* Legenda Canônica Completa: 1º Proteínas -> 2º Carboidratos -> 3º Gorduras */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-style-chart-micro pt-0.5 tabular-nums text-text-muted">
          {/* 1. Proteínas */}
          <span className="flex items-center gap-1.5" title="Proteínas">
            <span className="size-2 rounded-full bg-macro-protein inline-block shrink-0" aria-hidden="true" />
            <span>
              {labelFormat === 'full' ? 'Proteínas: ' : 'P: '}
              {showGrams && <strong className="text-text-primary font-bold">{safeP}g</strong>}
              {showGrams && showPct && hasMacros && <span className="mx-0.5">·</span>}
              {showPct && (
                <strong className="text-macro-protein font-bold">
                  {hasMacros ? `${distribution.proteinPct}%` : '0%'}
                </strong>
              )}
              {showKcalPerMacro && hasMacros && (
                <span className="text-text-muted font-normal ml-1">({distribution.proteinKcal} kcal)</span>
              )}
            </span>
          </span>

          {/* 2. Carboidratos */}
          <span className="flex items-center gap-1.5" title="Carboidratos">
            <span className="size-2 rounded-full bg-macro-carbohydrate inline-block shrink-0" aria-hidden="true" />
            <span>
              {labelFormat === 'full' ? 'Carboidratos: ' : 'C: '}
              {showGrams && <strong className="text-text-primary font-bold">{safeC}g</strong>}
              {showGrams && showPct && hasMacros && <span className="mx-0.5">·</span>}
              {showPct && (
                <strong className="text-macro-carbohydrate font-bold">
                  {hasMacros ? `${distribution.carbsPct}%` : '0%'}
                </strong>
              )}
              {showKcalPerMacro && hasMacros && (
                <span className="text-text-muted font-normal ml-1">({distribution.carbsKcal} kcal)</span>
              )}
            </span>
          </span>

          {/* 3. Gorduras */}
          <span className="flex items-center gap-1.5" title="Gorduras">
            <span className="size-2 rounded-full bg-macro-fat inline-block shrink-0" aria-hidden="true" />
            <span>
              {labelFormat === 'full' ? 'Gorduras: ' : 'G: '}
              {showGrams && <strong className="text-text-primary font-bold">{safeF}g</strong>}
              {showGrams && showPct && hasMacros && <span className="mx-0.5">·</span>}
              {showPct && (
                <strong className="text-macro-fat font-bold">
                  {hasMacros ? `${distribution.fatsPct}%` : '0%'}
                </strong>
              )}
              {showKcalPerMacro && hasMacros && (
                <span className="text-text-muted font-normal ml-1">({distribution.fatsKcal} kcal)</span>
              )}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
