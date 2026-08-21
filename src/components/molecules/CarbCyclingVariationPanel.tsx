'use client';

import React from 'react';
import { Badge, Button, Surface, VariationCard } from '@/components/atoms';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Repeat, Copy, Check } from 'lucide-react';
import { CarbCyclingVariation } from '@/lib/dietStore';
import { cn } from '@/lib/utils';

export interface CarbCyclingVariationPanelProps {
  variationsCount: 2 | 3;
  onVariationsCountChange: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
  className?: string;
}

const getVariationBadgeVariant = (type: CarbCyclingVariation['type']) => {
  if (type === 'high') return 'protein';
  if (type === 'medium') return 'carbohydrate';
  return 'kcal';
};

const getVariationTypeLabel = (type: CarbCyclingVariation['type']) => {
  if (type === 'high') return 'Alto Carb';
  if (type === 'medium') return 'Médio Carb';
  return 'Baixo Carb';
};

export const CarbCyclingVariationPanel: React.FC<CarbCyclingVariationPanelProps> = ({
  variationsCount,
  onVariationsCountChange,
  variations,
  activeVariationId,
  onSelectVariation,
  onCopyMealsBetweenVariations,
  className,
}) => {
  const visibleVariations =
    variationsCount === 2
      ? variations.filter((v) => v.type === 'high' || v.type === 'low')
      : variations;

  return (
    <Surface
      variant="default"
      data-testid="carb-cycling-variation-panel"
      aria-label="Variações do ciclo de carboidratos"
      className={cn('p-5 flex flex-col gap-4 border-border-subtle shadow-none animate-in fade-in duration-standard', className)}
    >
      {/* Cabeçalho da Box de Variações */}
      <div className="flex flex-row items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-control bg-success-soft text-success flex items-center justify-center shrink-0">
            <Repeat size={16} aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-style-body font-bold text-text-primary">
              Variações do Ciclo de Carboidratos
            </h4>
            <p className="text-style-legal text-text-muted">
              Selecione o dia do ciclo para visualizar e prescrever os alimentos e metas correspondentes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-style-legal font-bold text-text-muted">Número de variações</span>
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
                role="button"
                aria-selected={variationsCount === 2}
                onClick={() => onVariationsCountChange(2)}
                className="px-2.5 py-1 text-style-legal font-bold"
              >
                2 Variações (Alto / Baixo)
              </ToggleGroupItem>
              <ToggleGroupItem
                value="3"
                role="button"
                aria-selected={variationsCount === 3}
                onClick={() => onVariationsCountChange(3)}
                className="px-2.5 py-1 text-style-legal font-bold"
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
              className="flex items-center gap-1.5 font-bold text-style-legal"
            >
              <Copy size={13} aria-hidden="true" />
              <span>Copiar Refeições entre Dias</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid de Cards das Variações */}
      <div
        role="tablist"
        aria-label="Seleção da variação ativa"
        className={cn(
          'grid gap-3',
          variationsCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
        )}
      >
        {visibleVariations.map((v) => {
          const isActive = activeVariationId === v.id;
          const badgeVariant = getVariationBadgeVariant(v.type);
          const typeLabel = getVariationTypeLabel(v.type);

          return (
            <VariationCard
              key={v.id}
              isActive={isActive}
              tabIndex={0}
              onClick={() => onSelectVariation(v.id)}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-style-body-small font-bold text-text-primary">
                    {v.name}
                  </span>
                  <Badge variant={badgeVariant} className="text-style-chart-micro font-bold">
                    {typeLabel}
                  </Badge>
                </div>
                {isActive && (
                  <div className="size-5 rounded-round bg-success text-on-primary flex items-center justify-center shrink-0">
                    <Check size={12} aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-border-subtle w-full">
                <div>
                  <span className="text-style-body font-bold text-text-primary">
                    {v.targetKcal} <span className="text-style-legal font-normal text-text-muted">kcal</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-style-legal">
                  <span className="font-bold text-macro-carbohydrate">
                    {v.targetCarbs}g C
                  </span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-muted">
                    P: {v.targetProtein}g · G: {v.targetFats}g
                  </span>
                </div>
              </div>
            </VariationCard>
          );
        })}
      </div>
    </Surface>
  );
};