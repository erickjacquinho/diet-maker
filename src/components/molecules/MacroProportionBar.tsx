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
  /** Exibir a grade inferior de macros com dividers verticais. Padrão: true */
  showDividers?: boolean;
  /** Exibir o total de calorias. Padrão: true */
  showCalories?: boolean;
  /** Densidade visual / tamanho da barra. Padrão: 'standard' */
  size?: 'compact' | 'standard';
  /** Mensagem customizada para estado vazio (quando macros = 0). Opcional */
  emptyMessage?: string;
  /** Classes CSS adicionais do container */
  className?: string;
}

/**
 * MacroProportionBar — Barra multi-segmentada de proporção e distribuição calórica (% VET)
 * com bloco inferior de macronutrientes separado por divisores verticais.
 * Segue estritamente a ordem canônica normativa: Proteínas -> Carboidratos -> Gorduras -> Calorias.
 */
export const MacroProportionBar: React.FC<MacroProportionBarProps> = ({
  proteinG,
  carbsG,
  fatsG,
  kcal,
  title = 'Distribuição Calórica (% VET)',
  showTotalPct = true,
  showDividers = true,
  showCalories = true,
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
        'flex flex-col gap-2.5 rounded-control border border-border-divider bg-surface p-3.5 transition-colors',
        size === 'compact' ? 'py-2.5 px-3 gap-2' : 'p-3.5 gap-2.5',
        className
      )}
    >
      {/* Header de Título e Percentual Total */}
      {(hasTitle || showTotalPct) && (
        <div className="flex items-center justify-between text-style-chart-micro text-text-muted font-semibold">
          {hasTitle && <div>{title}</div>}
          {showTotalPct && (
            <span className="font-bold text-text-primary ml-auto">
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

      {/* Grade Inferior com Dividers Verticais: Proteínas | Carboidratos | Gorduras | Calorias */}
      {showDividers && (
        <div
          className={cn(
            'grid divide-x divide-border-divider border-t border-border-divider/70 text-center',
            showCalories ? 'grid-cols-4' : 'grid-cols-3',
            size === 'compact' ? 'pt-2 mt-0.5' : 'pt-2.5 mt-0.5'
          )}
        >
          {/* 1. Proteínas */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5" title="Proteínas">
            <div className="flex items-center gap-1.5 text-style-chart-micro font-semibold text-text-muted mb-0.5">
              <span className="size-2 rounded-full bg-macro-protein shrink-0" aria-hidden="true" />
              <span>Proteínas</span>
            </div>
            <div className="text-style-body font-bold text-macro-protein tabular-nums">
              {safeP}<span className="text-style-legal text-text-muted font-medium ml-0.5">g</span>
            </div>
            <div className="text-style-chart-micro text-text-muted tabular-nums">
              {hasMacros ? `${distribution.proteinPct}% (${distribution.proteinKcal} kcal)` : '0%'}
            </div>
          </div>

          {/* 2. Carboidratos */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5" title="Carboidratos">
            <div className="flex items-center gap-1.5 text-style-chart-micro font-semibold text-text-muted mb-0.5">
              <span className="size-2 rounded-full bg-macro-carbohydrate shrink-0" aria-hidden="true" />
              <span>Carboidratos</span>
            </div>
            <div className="text-style-body font-bold text-macro-carbohydrate tabular-nums">
              {safeC}<span className="text-style-legal text-text-muted font-medium ml-0.5">g</span>
            </div>
            <div className="text-style-chart-micro text-text-muted tabular-nums">
              {hasMacros ? `${distribution.carbsPct}% (${distribution.carbsKcal} kcal)` : '0%'}
            </div>
          </div>

          {/* 3. Gorduras */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5" title="Gorduras">
            <div className="flex items-center gap-1.5 text-style-chart-micro font-semibold text-text-muted mb-0.5">
              <span className="size-2 rounded-full bg-macro-fat shrink-0" aria-hidden="true" />
              <span>Gorduras</span>
            </div>
            <div className="text-style-body font-bold text-macro-fat tabular-nums">
              {safeF}<span className="text-style-legal text-text-muted font-medium ml-0.5">g</span>
            </div>
            <div className="text-style-chart-micro text-text-muted tabular-nums">
              {hasMacros ? `${distribution.fatsPct}% (${distribution.fatsKcal} kcal)` : '0%'}
            </div>
          </div>

          {/* 4. Calorias */}
          {showCalories && (
            <div className="flex flex-col items-center justify-center px-2 py-0.5" title="Calorias Totais">
              <div className="flex items-center gap-1 text-style-chart-micro font-semibold text-text-muted mb-0.5">
                <Flame size={12} className="text-warning shrink-0" aria-hidden="true" />
                <span>Calorias</span>
              </div>
              <div className="text-style-body font-bold text-text-primary tabular-nums">
                {displayKcal}<span className="text-style-legal text-text-muted font-medium ml-0.5">kcal</span>
              </div>
              <div className="text-style-chart-micro text-text-muted">
                Total
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
