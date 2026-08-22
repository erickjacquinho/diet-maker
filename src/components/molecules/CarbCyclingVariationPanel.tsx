'use client';

import React, { useState } from 'react';
import { Button, Surface } from '@/components/atoms';
import {
  Repeat,
  Copy,
  Check,
  SlidersHorizontal,
  Plus,
  Calendar,
  GripVertical,
} from 'lucide-react';
import { CarbCyclingVariation, DAYS_OF_WEEK } from '@/lib/dietStore';
import { cn } from '@/lib/utils';

export interface CarbCyclingVariationPanelProps {
  variationsCount?: 2 | 3 | number;
  onVariationsCountChange?: (count: 2 | 3) => void;
  variations: CarbCyclingVariation[];
  activeVariationId: string;
  onSelectVariation: (id: string) => void;
  onCopyMealsBetweenVariations?: () => void;
  onOpenCycleMatrix?: () => void;
  onAddVariation?: () => void;
  onReorderVariations?: (newVariations: CarbCyclingVariation[]) => void;
  className?: string;
}

export const CarbCyclingVariationPanel: React.FC<CarbCyclingVariationPanelProps> = ({
  variations,
  activeVariationId,
  onSelectVariation,
  onCopyMealsBetweenVariations,
  onOpenCycleMatrix,
  onAddVariation,
  onReorderVariations,
  className,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    // Evita flickering ao passar por elementos filhos
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    // Garante que nenhum estado residual de drag fique preso caso o usuário solte fora ou aperte ESC
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIdx = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));

    if (
      Number.isInteger(sourceIdx) &&
      sourceIdx >= 0 &&
      sourceIdx < variations.length &&
      sourceIdx !== targetIndex
    ) {
      const newVariations = [...variations];
      const [draggedItem] = newVariations.splice(sourceIdx, 1);
      newVariations.splice(targetIndex, 0, draggedItem);

      if (onReorderVariations) {
        onReorderVariations(newVariations);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Suporte a reordenação por teclado (Alt + Seta Cima / Baixo)
  const handleKeyDown = (e: React.KeyboardEvent, index: number, variationId: string) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < variations.length && onReorderVariations) {
        const newVariations = [...variations];
        const [movedItem] = newVariations.splice(index, 1);
        newVariations.splice(targetIndex, 0, movedItem);
        onReorderVariations(newVariations);
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectVariation(variationId);
    }
  };

  return (
    <Surface
      variant="default"
      data-testid="carb-cycling-variation-panel"
      aria-label="Variações do ciclo de carboidratos"
      className={cn(
        'p-4 flex flex-col gap-3.5 border-border-subtle shadow-none animate-in fade-in duration-standard',
        className
      )}
    >
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-control bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Repeat size={15} aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-style-body-small font-bold text-text-primary">
              Variações do Ciclo
            </h4>
            <p className="text-style-legal text-text-muted">
              Selecione o dia do ciclo para visualizar e prescrever os alimentos correspondentes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCycleMatrix && (
            <Button
              variant="secondary"
              size="compact"
              onClick={onOpenCycleMatrix}
              className="flex items-center gap-1.5 font-bold text-style-chart-micro bg-surface hover:bg-surface-hover h-8 px-2.5"
            >
              <SlidersHorizontal size={13} className="text-primary" aria-hidden="true" />
              <span>Configurar Ciclo</span>
            </Button>
          )}

          {onCopyMealsBetweenVariations && (
            <Button
              variant="secondary"
              size="compact"
              onClick={onCopyMealsBetweenVariations}
              className="flex items-center gap-1.5 font-bold text-style-chart-micro h-8 px-2.5"
            >
              <Copy size={12} aria-hidden="true" />
              <span>Copiar Refeições</span>
            </Button>
          )}

          {onAddVariation && (
            <Button
              variant="secondary"
              size="compact"
              onClick={onAddVariation}
              className="flex items-center gap-1.5 font-bold text-style-chart-micro h-8 px-2.5"
            >
              <Plus size={13} className="text-primary" aria-hidden="true" />
              <span>Adicionar Dia</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lista Vertical de Variações */}
      <div
        role="tablist"
        aria-label="Variações do ciclo"
        className="flex flex-col gap-2.5"
        onDragOver={(e) => e.preventDefault()}
      >
        {variations.map((v, index) => {
          const isActive = v.id === activeVariationId;
          const isDraggingThis = draggedIndex === index;
          const isDragOverThis = dragOverIndex === index && draggedIndex !== index;
          const assignedDaysLabels = (v.assignedDays || []).map(
            (dayId) => DAYS_OF_WEEK.find((d) => d.id === dayId)?.label || dayId
          );

          return (
            <div
              key={v.id}
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
              tabIndex={0}
              onClick={() => onSelectVariation(v.id)}
              onKeyDown={(e) => handleKeyDown(e, index, v.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={(e) => handleDragLeave(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                'group relative flex flex-col gap-1.5 p-3 rounded-control border text-left transition-all duration-fast cursor-pointer select-none',
                isActive
                  ? 'bg-surface border-primary shadow-xs ring-1 ring-primary'
                  : 'bg-surface-subtle border-border-subtle hover:border-border-hover hover:bg-surface',
                isDraggingThis && 'opacity-40 border-dashed border-primary',
                isDragOverThis && 'border-t-2 border-t-primary ring-2 ring-primary/20 bg-surface'
              )}
            >
              {/* Linha 1: Handle, Indicador, Nome, Prot, Carbo, Gordura, Kcal */}
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                {/* Lado Esquerdo: Grip, Seleção e Nome */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(e, index);
                    }}
                    onDragEnd={handleDragEnd}
                    className="text-text-muted group-hover:text-text-primary cursor-grab active:cursor-grabbing shrink-0 p-1 -m-1 rounded-control hover:bg-surface-subtle"
                    title="Arrastar para reordenar (ou use Alt + Setas no teclado)"
                  >
                    <GripVertical size={15} aria-hidden="true" />
                  </div>

                  {isActive ? (
                    <div className="size-4 rounded-round bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={3} aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="size-2 rounded-round bg-border-hover shrink-0" />
                  )}

                  <span
                    className={cn(
                      'text-style-body-small font-bold truncate',
                      isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'
                    )}
                  >
                    {v.name}
                  </span>
                </div>

                {/* Lado Direito: Macros Coloridos e Kcal Final (Texto limpo) */}
                <div className="flex items-center gap-3 text-style-body-small font-medium shrink-0">
                  <span className="font-bold text-macro-protein" title="Proteína">
                    {v.targetProtein}g P
                  </span>
                  <span className="text-text-muted text-style-chart-micro">•</span>
                  <span className="font-bold text-macro-carbohydrate" title="Carboidratos">
                    {v.targetCarbs}g C
                  </span>
                  <span className="text-text-muted text-style-chart-micro">•</span>
                  <span className="font-bold text-macro-fat" title="Gorduras">
                    {v.targetFats}g G
                  </span>
                  <span className="text-text-muted text-style-chart-micro">•</span>
                  <span className="font-bold text-text-primary">
                    {v.targetKcal} <span className="text-style-legal font-normal text-text-muted">kcal</span>
                  </span>
                </div>
              </div>

              {/* Linha 2: Dias da Semana Selecionados */}
              <div className="flex items-center gap-2 pl-6 pt-1 border-t border-border-subtle/70 text-style-legal text-text-muted">
                <Calendar size={12} className="shrink-0 text-text-muted" aria-hidden="true" />
                <span className="font-medium text-style-chart-micro">
                  {assignedDaysLabels.length > 0
                    ? assignedDaysLabels.join(', ')
                    : 'Nenhum dia da semana vinculado'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
};