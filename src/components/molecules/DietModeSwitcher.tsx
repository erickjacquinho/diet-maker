'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Repeat, Copy, Settings2 } from 'lucide-react';
import { CarbCyclingVariation } from '@/lib/dietStore';

export interface DietModeSwitcherProps {
  mode: 'simple' | 'carb_cycling';
  onModeChange: (mode: 'simple' | 'carb_cycling') => void;
  variationsCount: 2 | 3;
  onVariationsCountChange: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
}

export const DietModeSwitcher: React.FC<DietModeSwitcherProps> = ({
  mode,
  onModeChange,
  variationsCount,
  onVariationsCountChange,
  variations,
  activeVariationId,
  onSelectVariation,
  onCopyMealsBetweenVariations,
}) => {
  return (
    <div className="bg-warm-card border border-warm-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Primary Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-4">
        <div>
          <h3 className="font-black text-sm text-warm-charcoal uppercase tracking-wider flex items-center space-x-2">
            <Repeat size={16} className="text-warm-emerald" />
            <span>Modelo de Dieta Prescrita</span>
          </h3>
          <p className="text-xs text-warm-muted mt-0.5">
            Alterne entre plano único diário ou ciclo de carboidratos com variações
          </p>
        </div>

        <div className="flex items-center p-1 bg-warm-inner border border-warm-border rounded-xl">
          <button
            type="button"
            onClick={() => onModeChange('simple')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'simple'
                ? 'bg-warm-card text-warm-charcoal shadow-sm border border-warm-border'
                : 'text-warm-muted hover:text-warm-charcoal'
            }`}
          >
            <Utensils size={14} />
            <span>Dieta Simples</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('carb_cycling')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'carb_cycling'
                ? 'bg-warm-card text-warm-emerald shadow-sm border border-warm-border'
                : 'text-warm-muted hover:text-warm-charcoal'
            }`}
          >
            <Repeat size={14} />
            <span>Ciclo de Carboidratos</span>
          </button>
        </div>
      </div>

      {/* Carb Cycling Options & Tabs */}
      {mode === 'carb_cycling' && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-warm-muted uppercase">Número de Variações:</span>
              <div className="flex items-center space-x-1 bg-warm-inner p-0.5 rounded-lg border border-warm-border">
                <button
                  type="button"
                  onClick={() => onVariationsCountChange(2)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    variationsCount === 2
                      ? 'bg-warm-card text-warm-charcoal border border-warm-border shadow-xs'
                      : 'text-warm-muted hover:text-warm-charcoal'
                  }`}
                >
                  2 Variações (Alto / Baixo)
                </button>
                <button
                  type="button"
                  onClick={() => onVariationsCountChange(3)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    variationsCount === 3
                      ? 'bg-warm-card text-warm-charcoal border border-warm-border shadow-xs'
                      : 'text-warm-muted hover:text-warm-charcoal'
                  }`}
                >
                  3 Variações (Alto / Médio / Baixo)
                </button>
              </div>
            </div>

            {onCopyMealsBetweenVariations && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyMealsBetweenVariations}
                className="text-xs font-bold border-warm-border hover:bg-warm-inner flex items-center space-x-1.5"
              >
                <Copy size={13} />
                <span>Copiar Refeições entre Dias</span>
              </Button>
            )}
          </div>

          {/* Tabs for Active Carb Cycling Variation */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {variations.slice(0, variationsCount).map((v) => {
              const isActive = v.id === activeVariationId;
              const badgeColors = {
                high: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                medium: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
                low: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
              };

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariation(v.id)}
                  className={`flex-1 min-w-[160px] p-3 rounded-xl border text-left ${
                    isActive
                      ? 'bg-warm-card border-warm-emerald ring-2 ring-warm-emerald/20 shadow-xs'
                      : 'bg-warm-inner border-warm-border hover:border-warm-borderDark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-warm-charcoal">{v.name}</span>
                    <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 ${badgeColors[v.type]}`}>
                      {v.type === 'high' ? 'Alto Carbo' : v.type === 'medium' ? 'Médio Carbo' : 'Baixo Carbo'}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-warm-muted mt-1 font-medium flex items-center space-x-2">
                    <span>Meta: <strong>{v.targetKcal} kcal</strong></span>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">{v.targetCarbs}g C</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
