'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
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
  if (type === 'high') return 'Alto';
  if (type === 'medium') return 'Médio';
  return 'Baixo';
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
      {/* 1️⃣ Seleção do Modelo de Dieta (Vanilla ToggleGroup) */}
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
          aria-label="Modelo de dieta"
        >
          <ToggleGroupItem
            value="simple"
            onClick={() => onModeChange('simple')}
          >
            <Utensils size={14} aria-hidden="true" className="mr-1.5" />
            <span>Dieta Simples</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="carb_cycling"
            onClick={() => onModeChange('carb_cycling')}
          >
            <Repeat size={14} aria-hidden="true" className="mr-1.5" />
            <span>Ciclo de Carboidratos</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 2️⃣ Seleção de Variações (Vanilla ToggleGroups para Contagem e Variação Ativa) */}
      {mode === 'carb_cycling' && (
        <div className="flex flex-col gap-3 pt-1 w-full">
          {/* Sub-header: Número de variações + Ação de Cópia */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-style-legal font-bold text-text-muted tracking-label">Número de variações</span>
              <ToggleGroup
                type="single"
                value={String(variationsCount)}
                onValueChange={(val) => {
                  if (val) onVariationsCountChange(Number(val) as 2 | 3);
                }}
                aria-label="Número de variações"
              >
                <ToggleGroupItem
                  value="2"
                  onClick={() => onVariationsCountChange(2)}
                  className="px-2.5 py-1"
                >
                  2 Variações (Alto / Baixo)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="3"
                  onClick={() => onVariationsCountChange(3)}
                  className="px-2.5 py-1"
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

          {/* 3️⃣ Seleção da Variação Ativa (Vanilla ToggleGroup Puro) */}
          <ToggleGroup
            type="single"
            value={activeVariationId}
            onValueChange={(val) => {
              if (val) onSelectVariation(val);
            }}
            aria-label="Variação ativa do ciclo"
            className="w-full flex-wrap justify-start"
          >
            {variations.slice(0, variationsCount).map((v) => {
              const typeLabel = getVariationTypeLabel(v.type);
              return (
                <ToggleGroupItem
                  key={v.id}
                  value={v.id}
                  onClick={() => onSelectVariation(v.id)}
                  aria-label={`${v.name} ${typeLabel} Meta: ${v.targetKcal} kcal ${v.targetCarbs}g C`}
                  className="flex-1 min-w-[140px] justify-between text-style-legal py-2 px-3"
                >
                  <span className="font-bold">{v.name} ({typeLabel})</span>
                  <span className="text-text-muted font-medium ml-2">
                    {v.targetKcal} kcal · <strong className="text-warning">{v.targetCarbs}g C</strong>
                  </span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};
