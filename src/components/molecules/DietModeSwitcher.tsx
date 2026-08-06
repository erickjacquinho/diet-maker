'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const simpleModeRef = React.useRef<HTMLButtonElement>(null);
  const carbCyclingModeRef = React.useRef<HTMLButtonElement>(null);

  const handleModeKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentMode: DietModeSwitcherProps['mode']) => {
    const isForward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const isBackward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';

    if (!isForward && !isBackward) return;

    event.preventDefault();
    const nextMode = currentMode === 'simple' ? 'carb_cycling' : 'simple';
    onModeChange(nextMode);

    const nextModeRef = nextMode === 'simple' ? simpleModeRef : carbCyclingModeRef;
    nextModeRef.current?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Modelo de dieta"
      className={embedded
        ? 'flex flex-col gap-3'
        : 'bg-surface border border-border-subtle rounded-surface p-4 flex flex-col gap-3 shadow-floating'}
    >
      <div className={embedded
        ? 'flex flex-col gap-3 border-b border-border-subtle pb-4'
        : 'flex flex-row items-center justify-between gap-3 border-b border-border-subtle pb-3'}>
        <div>
          <h3 className="font-bold text-style-body-small text-text-primary tracking-overline flex items-center gap-2">
            <Repeat size={16} className="text-success" aria-hidden="true" />
            <span>Modelo de Dieta Prescrita</span>
          </h3>
          <p className="text-style-legal text-text-muted mt-0.5">
            Escolha entre um plano diário único ou um ciclo de carboidratos.
          </p>
        </div>

        <div className={embedded
          ? 'flex items-center self-end p-1 bg-surface-subtle border border-border-subtle rounded-control'
          : 'flex items-center self-auto p-1 bg-surface-subtle border border-border-subtle rounded-control'}>
          <Button
            type="button"
            role="radio"
            aria-checked={mode === 'simple'}
            tabIndex={mode === 'simple' ? 0 : -1}
            ref={simpleModeRef}
            onKeyDown={(event) => handleModeKeyDown(event, 'simple')}
            onClick={() => onModeChange('simple')}
            variant={mode === 'simple' ? 'secondary' : 'quiet'}
            size="compact"
            className="flex items-center gap-1.5"
          >
            <Utensils size={14} aria-hidden="true" />
            <span>Dieta Simples</span>
          </Button>

          <Button
            type="button"
            role="radio"
            aria-checked={mode === 'carb_cycling'}
            tabIndex={mode === 'carb_cycling' ? 0 : -1}
            ref={carbCyclingModeRef}
            onKeyDown={(event) => handleModeKeyDown(event, 'carb_cycling')}
            onClick={() => onModeChange('carb_cycling')}
            variant={mode === 'carb_cycling' ? 'secondary' : 'quiet'}
            size="compact"
            className={cn('flex items-center gap-1.5', mode === 'carb_cycling' && 'text-success')}
          >
            <Repeat size={14} aria-hidden="true" />
            <span>Ciclo de Carboidratos</span>
          </Button>
        </div>
      </div>

      {mode === 'carb_cycling' && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-style-legal font-bold text-text-muted tracking-label">Número de variações</span>
              <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-surface border border-border-subtle">
                <Button
                  type="button"
                  aria-pressed={variationsCount === 2}
                  onClick={() => onVariationsCountChange(2)}
                  variant={variationsCount === 2 ? 'secondary' : 'quiet'}
                  size="compact"
                >
                  2 Variações (Alto / Baixo)
                </Button>
                <Button
                  type="button"
                  aria-pressed={variationsCount === 3}
                  onClick={() => onVariationsCountChange(3)}
                  variant={variationsCount === 3 ? 'secondary' : 'quiet'}
                  size="compact"
                >
                  3 Variações (Alto / Médio / Baixo)
                </Button>
              </div>
            </div>

            {onCopyMealsBetweenVariations && (
              <Button
                variant="secondary"
                size="compact"
                onClick={onCopyMealsBetweenVariations}
                className="text-style-legal font-bold border-border-subtle hover:bg-surface-hover flex items-center gap-1.5 self-auto"
              >
                <Copy size={13} aria-hidden="true" />
                <span>Copiar Refeições entre Dias</span>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {variations.slice(0, variationsCount).map((variation) => {
              const isActive = variation.id === activeVariationId;
              const typeLabel = getVariationTypeLabel(variation.type);
              const badgeVariant = variation.type === 'high'
                ? 'amber'
                : variation.type === 'medium'
                  ? 'teal'
                  : 'blue';

              return (
                <Button
                  key={variation.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${variation.name} ${typeLabel} Meta: ${variation.targetKcal} kcal ${variation.targetCarbs}g C`}
                  onClick={() => onSelectVariation(variation.id)}
                  className={`flex-1 min-w-[160px] p-3 rounded-control border text-left ${
                    isActive
                      ? 'bg-surface border-success ring-2 ring-success/20 shadow-floating'
                      : 'bg-surface-subtle border-border-subtle hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-style-legal text-text-primary">{variation.name}</span>
                    <Badge variant={badgeVariant}>
                      {typeLabel}
                    </Badge>
                  </div>

                  <div className="text-style-legal text-text-muted mt-1 font-medium flex items-center gap-2">
                    <span>Meta: <strong>{variation.targetKcal} kcal</strong></span>
                    <span aria-hidden="true">•</span>
                    <span className="text-warning font-bold">{variation.targetCarbs}g C</span>
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
