'use client';

import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Utensils, Repeat } from 'lucide-react';
import { CarbCyclingVariation } from '@/lib/dietStore';
import { CarbCyclingVariationPanel } from './CarbCyclingVariationPanel';
import { cn } from '@/lib/utils';

export interface DietModeSwitcherProps {
  mode: 'simple' | 'carb_cycling';
  onModeChange: (mode: 'simple' | 'carb_cycling') => void;
  variationsCount?: 2 | 3 | number;
  onVariationsCountChange?: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
  onOpenCycleMatrix?: () => void;
  onAddVariation?: () => void;
  onReorderVariations?: (newVariations: CarbCyclingVariation[]) => void;
  embedded?: boolean;
  modeOnly?: boolean;
}

export const DietModeSwitcher: React.FC<DietModeSwitcherProps> = ({
  mode = 'simple',
  onModeChange,
  variationsCount,
  onVariationsCountChange,
  variations,
  activeVariationId,
  onSelectVariation,
  onCopyMealsBetweenVariations,
  onOpenCycleMatrix,
  onAddVariation,
  onReorderVariations,
  embedded = false,
  modeOnly = false,
}) => {
  const currentMode = mode || 'simple';

  return (
    <div
      role="group"
      aria-label="Modelo de dieta"
      className={embedded
        ? 'flex flex-col gap-2 items-end'
        : 'bg-surface border border-border-subtle rounded-surface p-4 flex flex-col gap-3 shadow-none'}
    >
      {/* Seleção do Modelo de Dieta */}
      <div className={cn('flex flex-col gap-2', embedded ? 'items-end text-right' : 'items-start')}>
        <div>
          <h3 className="font-bold text-style-body-small text-text-primary tracking-overline flex items-center gap-2">
            <Repeat size={16} className="text-primary" aria-hidden="true" />
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
          role="tablist"
          value={currentMode}
          onValueChange={(val) => {
            if (val) onModeChange(val as 'simple' | 'carb_cycling');
          }}
          aria-label="Modelo de dieta"
        >
          <ToggleGroupItem
            value="simple"
            role="tab"
            data-state={currentMode === 'simple' ? 'active' : 'inactive'}
            aria-selected={currentMode === 'simple'}
          >
            <Utensils size={14} aria-hidden="true" className="mr-1.5" />
            <span>Dieta Simples</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="carb_cycling"
            role="tab"
            data-state={currentMode === 'carb_cycling' ? 'active' : 'inactive'}
            aria-selected={currentMode === 'carb_cycling'}
          >
            <Repeat size={14} aria-hidden="true" className="mr-1.5" />
            <span>Ciclo de Carboidratos</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Quando não for modeOnly e o modo for carb_cycling, renderiza a box adicional */}
      {!modeOnly && mode === 'carb_cycling' && (
        <CarbCyclingVariationPanel
          variationsCount={variationsCount}
          onVariationsCountChange={onVariationsCountChange}
          variations={variations}
          activeVariationId={activeVariationId}
          onSelectVariation={onSelectVariation}
          onCopyMealsBetweenVariations={onCopyMealsBetweenVariations}
          onOpenCycleMatrix={onOpenCycleMatrix}
          onAddVariation={onAddVariation}
          onReorderVariations={onReorderVariations}
        />
      )}
    </div>
  );
};

