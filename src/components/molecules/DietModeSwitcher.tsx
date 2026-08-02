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
    <div className="bg-surface border border-border-subtle rounded-surface p-4 p-5 space-y-4 shadow-floating">
      {/* Primary Mode Toggle */}
      <div className="flex flex-col flex-row items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center space-x-2">
            <Repeat size={16} className="text-success" />
            <span>Modelo de Dieta Prescrita</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Alterne entre plano único diário ou ciclo de carboidratos com variações
          </p>
        </div>

        <div className="flex items-center p-1 bg-surface-subtle border border-border-subtle rounded-control">
          <Button
            type="button"
            onClick={() => onModeChange('simple')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'simple'
                ? 'bg-surface text-text-primary shadow-floating border border-border-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Utensils size={14} />
            <span>Dieta Simples</span>
          </Button>

          <Button
            type="button"
            onClick={() => onModeChange('carb_cycling')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'carb_cycling'
                ? 'bg-surface text-success shadow-floating border border-border-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Repeat size={14} />
            <span>Ciclo de Carboidratos</span>
          </Button>
        </div>
      </div>

      {/* Carb Cycling Options & Tabs */}
      {mode === 'carb_cycling' && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-text-muted uppercase">Número de Variações:</span>
              <div className="flex items-center space-x-1 bg-surface-subtle p-0.5 rounded-lg border border-border-subtle">
                <Button
                  type="button"
                  onClick={() => onVariationsCountChange(2)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    variationsCount === 2
                      ? 'bg-surface text-text-primary border border-border-subtle shadow-floating'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  2 Variações (Alto / Baixo)
                </Button>
                <Button
                  type="button"
                  onClick={() => onVariationsCountChange(3)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    variationsCount === 3
                      ? 'bg-surface text-text-primary border border-border-subtle shadow-floating'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  3 Variações (Alto / Médio / Baixo)
                </Button>
              </div>
            </div>

            {onCopyMealsBetweenVariations && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyMealsBetweenVariations}
                className="text-xs font-bold border-border-subtle hover:bg-surface-subtle flex items-center space-x-1.5"
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
                high: 'bg-warning-soft0/10 text-warning border-warning-soft0/20',
                medium: 'bg-info-soft0/10 text-info border-info-soft0/20',
                low: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
              };

              return (
                <Button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariation(v.id)}
                  className={`flex-1 min-w-[160px] p-3 rounded-control border text-left ${
                    isActive
                      ? 'bg-surface border-success ring-2 ring-success/20 shadow-floating'
                      : 'bg-surface-subtle border-border-subtle hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text-primary">{v.name}</span>
                    <Badge variant="outline" className={`text-style-legal font-bold px-1.5 py-0 ${badgeColors[v.type]}`}>
                      {v.type === 'high' ? 'Alto Carbo' : v.type === 'medium' ? 'Médio Carbo' : 'Baixo Carbo'}
                    </Badge>
                  </div>

                  <div className="text-style-legal text-text-muted mt-1 font-medium flex items-center space-x-2">
                    <span>Meta: <strong>{v.targetKcal} kcal</strong></span>
                    <span>•</span>
                    <span className="text-warning font-bold">{v.targetCarbs}g C</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
