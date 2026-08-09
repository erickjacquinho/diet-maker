'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Utensils, Repeat, Copy } from 'lucide-react';
import { CarbCyclingVariation } from '@/lib/dietStore';
import { cn } from '@/lib/utils';

export interface DietModeSwitcherProps {
  mode: 'simple' | 'carb_cycling';
  onModeChange: (mode: 'simple' | 'carb_cycling') => void;
  variationsCount: 2 | 3;
  onVariationsCountChange: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
  embedded?: boolean;
}

const getVariationTypeLabel = (type: CarbCyclingVariation['type']) => {
  if (type === 'high') return 'Alto Carbo';
  if (type === 'medium') return 'Médio Carbo';
  return 'Baixo Carbo';
};

export const DietModeSwitcher: React.FC<DietModeSwitcherProps> = ({
  mode,
  onModeChange,
  variationsCount,
  onVariationsCountChange,
  variations,
  activeVariationId,
  onSelectVariation,
  onCopyMealsBetweenVariations,
  embedded = false,
}) => {
  return (
    <div
      role="group"
      aria-label="Modelo de dieta"
      className={embedded
        ? 'flex flex-col gap-3 items-end'
        : 'bg-surface border border-border-subtle rounded-surface p-4 flex flex-col gap-3 shadow-floating'}
    >
      {/* 1️⃣ Modo de Dieta: Switcher em Button Group / Segmented Control */}
      <div className={cn('flex flex-col gap-2', embedded ? 'items-end text-right' : 'items-start')}>
        <div>
          <h3 className="font-bold text-style-body-small text-text-primary tracking-overline flex items-center gap-2">
            <Repeat size={16} className="text-success" aria-hidden="true" />
            <span>{embedded ? 'Modelo de dieta' : 'Modelo de Dieta Prescrita'}</span>
          </h3>
          {!embedded && (
            <p className="text-style-legal text-text-muted mt-0.5">
              Escolha entre um plano diário único ou um ciclo de carboidratos.
            </p>
          )}
        </div>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(val) => {
            if (val) onModeChange(val as 'simple' | 'carb_cycling');
          }}
          aria-label="Seleção de modelo de dieta"
        >
          <ToggleGroupItem
            value="simple"
            onClick={() => onModeChange('simple')}
            className="flex items-center gap-1.5 px-3 py-1.5"
          >
            <Utensils size={14} aria-hidden="true" />
            <span>Dieta Simples</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="carb_cycling"
            onClick={() => onModeChange('carb_cycling')}
            className="flex items-center gap-1.5 px-3 py-1.5"
          >
            <Repeat size={14} aria-hidden="true" />
            <span>Ciclo de Carboidratos</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 2️⃣ Ciclo de Carboidratos: Controles de Variações e Seleção do Dia Ativo */}
      {mode === 'carb_cycling' && (
        <div className="flex flex-col gap-3 pt-1 w-full">
          {/* Sub-header: Número de Variações (Button Group) + Ação de Cópia */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-style-legal font-bold text-text-muted tracking-label">Número de variações</span>
              <ToggleGroup
                type="single"
                value={variationsCount}
                onValueChange={(val) => {
                  if (val) onVariationsCountChange(val as 2 | 3);
                }}
                aria-label="Quantidade de variações do ciclo"
              >
                <ToggleGroupItem
                  value={2}
                  onClick={() => onVariationsCountChange(2)}
                  className="px-2.5 py-1 text-style-legal"
                >
                  2 Variações (Alto / Baixo)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={3}
                  onClick={() => onVariationsCountChange(3)}
                  className="px-2.5 py-1 text-style-legal"
                >
                  3 Variações (Alto / Médio / Baixo)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {onCopyMealsBetweenVariations && (
              <Button
                variant="secondary"
                size="compact"
                onClick={onCopyMealsBetweenVariations}
                className="text-style-legal font-bold border-border-subtle hover:bg-surface-hover flex items-center gap-1.5"
              >
                <Copy size={13} aria-hidden="true" />
                <span>Copiar Refeições entre Dias</span>
              </Button>
            )}
          </div>

          {/* 3️⃣ Button Group Segmentado de Variações do Ciclo (Dia A, Dia B, Dia C) */}
          <div
            role="radiogroup"
            aria-label="Variações ativas do ciclo de carboidratos"
            className="flex flex-wrap w-full gap-2 p-1 bg-surface-subtle border border-border-subtle rounded-control"
          >
            {variations.slice(0, variationsCount).map((variation) => {
              const isActive = variation.id === activeVariationId;
              const typeLabel = getVariationTypeLabel(variation.type);
              const badgeVariant = variation.type === 'high'
                ? 'amber'
                : variation.type === 'medium'
                  ? 'teal'
                  : 'blue';

              return (
                <button
                  key={variation.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-pressed={isActive}
                  data-state={isActive ? 'on' : 'off'}
                  aria-label={`${variation.name} ${typeLabel} Meta: ${variation.targetKcal} kcal ${variation.targetCarbs}g C`}
                  onClick={() => onSelectVariation(variation.id)}
                  className={cn(
                    'flex-1 min-w-[140px] flex flex-col gap-1.5 p-2.5 rounded-control text-left transition-all duration-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus',
                    isActive
                      ? 'bg-surface border border-success ring-1 ring-success/20 shadow-subtle text-text-primary'
                      : 'bg-transparent border border-transparent text-text-muted hover:bg-surface-hover/60 hover:text-text-primary'
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-style-legal text-text-primary truncate">
                      {variation.name}
                    </span>
                    <Badge variant={badgeVariant} className="shrink-0 text-[10px] px-1.5 py-0.5">
                      {typeLabel}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-style-legal font-medium text-text-muted">
                    <span className="whitespace-nowrap">Meta: <strong>{variation.targetKcal} kcal</strong></span>
                    <span aria-hidden="true">•</span>
                    <span className="whitespace-nowrap text-warning font-bold">{variation.targetCarbs}g C</span>
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
