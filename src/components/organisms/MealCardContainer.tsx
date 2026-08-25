'use client';

import React, { useState } from 'react';
import { Badge, Button, Surface, EditIconButton, DeleteIconButton, IconButton } from '@/components/atoms';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MealItemRow, MealItemRowProps, MacroProportionBar } from '../molecules';
import { Copy, Percent, Plus, Clock, Check, X } from 'lucide-react';
import { calculatePresetCalories } from '@/lib/presetUtils';

export interface MealCardContainerProps {
  id?: string;
  title: string;
  time: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  items: MealItemRowProps[];
  onTitleChange?: (newTitle: string) => void;
  onTimeChange?: (newTime: string) => void;
  onAddFoodClick?: () => void;
  onDuplicate?: () => void;
  onScale?: () => void;
  onDeleteMeal?: () => void;
  onRemoveItem?: (index: number) => void;
  onQuantityChange?: (index: number, newGrams: number) => void;
  onReorderItems?: (sourceIndex: number, targetIndex: number) => void;
}

export const MealCardContainer: React.FC<MealCardContainerProps> = ({
  title,
  time,
  kcal,
  proteinG,
  carbsG,
  fatsG,
  items,
  onTitleChange,
  onTimeChange,
  onAddFoodClick,
  onDuplicate,
  onScale,
  onDeleteMeal,
  onRemoveItem,
  onQuantityChange,
  onReorderItems,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempTime, setTempTime] = useState(time);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const computedKcal = calculatePresetCalories(proteinG, carbsG, fatsG);
  const displayKcal = computedKcal > 0 ? computedKcal : kcal;

  const handleSaveTitleTime = () => {
    if (onTitleChange && tempTitle.trim()) onTitleChange(tempTitle.trim());
    if (onTimeChange && tempTime.trim()) onTimeChange(tempTime.trim());
    setIsEditingTitle(false);
  };

  const handleCancelEditing = () => {
    setTempTitle(title);
    setTempTime(time);
    setIsEditingTitle(false);
  };

  return (
    <Surface variant="default" density="highlight" className="flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-4 flex-1">
        {/* Meal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle gap-2 flex-wrap">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="text"
                size="compact"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitleTime();
                  if (e.key === 'Escape') handleCancelEditing();
                }}
                className="w-36 text-style-field-value font-bold"
                placeholder="Nome da refeição"
                autoFocus
              />
              <Input
                type="text"
                size="compact"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitleTime();
                  if (e.key === 'Escape') handleCancelEditing();
                }}
                className="w-20 text-style-field-value font-bold text-center"
                placeholder="08:00"
              />
              <IconButton
                size="compact"
                variant="primary"
                onClick={handleSaveTitleTime}
                title="Salvar alterações"
                aria-label="Salvar alterações"
              >
                <Check size={14} />
              </IconButton>
              <IconButton
                size="compact"
                variant="quiet"
                onClick={handleCancelEditing}
                title="Cancelar edição"
                aria-label="Cancelar edição"
              >
                <X size={14} />
              </IconButton>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-style-card-title font-bold text-text-primary truncate">{title}</h3>
              <Badge variant="neutral" className="gap-1 font-mono shrink-0">
                <Clock size={11} className="text-text-muted" />
                <span>{time}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Items List - Table View */}
        <div className="min-h-[48px]">
          {items.length === 0 ? (
            <Surface
              variant="subtle"
              density="compact"
              className="p-4 text-center text-text-muted flex flex-col items-center justify-center gap-1 border-dashed border-border-divider"
            >
              <span className="text-style-legal font-medium">Nenhum alimento nesta refeição.</span>
              <span className="text-style-caption text-text-muted">Clique em "+ Adicionar Alimento" para incluir itens da tabela TACO.</span>
            </Surface>
          ) : (
            <div className="overflow-hidden rounded-control border border-border-divider bg-surface">
              <Table>
                <TableHeader className="bg-surface-subtle">
                  <TableRow className="hover:bg-surface-subtle border-b border-border-divider">
                    <TableHead className="w-10 px-2 text-center h-8" aria-label="Reordenar" />
                    <TableHead className="text-left font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-8">
                      Nome
                    </TableHead>
                    <TableHead className="w-24 text-center font-bold text-style-chart-micro uppercase tracking-wider text-text-secondary h-8">
                      Quantidade
                    </TableHead>
                    <TableHead className="w-20 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-protein h-8">
                      Proteína
                    </TableHead>
                    <TableHead className="w-24 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-carbohydrate h-8">
                      Carboidrato
                    </TableHead>
                    <TableHead className="w-20 text-right font-bold text-style-chart-micro uppercase tracking-wider text-macro-fat h-8">
                      Gorduras
                    </TableHead>
                    <TableHead className="w-24 text-right font-bold text-style-chart-micro uppercase tracking-wider text-text-primary h-8">
                      Calorias
                    </TableHead>
                    <TableHead className="w-12 px-2 text-center h-8" aria-label="Ações" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <MealItemRow
                      key={item.id || idx}
                      index={idx}
                      {...item}
                      isDragging={draggedIndex === idx}
                      isDragOver={dragOverIndex === idx && draggedIndex !== idx}
                      onDragStart={(index) => setDraggedIndex(index)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragOver={(e, index) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDrop={(e, index) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          onReorderItems?.(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onQuantityChange={(newGrams) => onQuantityChange && onQuantityChange(idx, newGrams)}
                      onRemove={() => onRemoveItem && onRemoveItem(idx)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Add Food Button */}
        <Button
          type="button"
          variant="secondary"
          size="standard"
          onClick={onAddFoodClick}
          className="w-full border-dashed border-border-control hover:border-primary/60 hover:bg-surface-hover text-text-primary font-semibold text-style-button-label-compact flex items-center justify-center gap-1.5"
        >
          <Plus size={14} className="text-success" />
          <span>Adicionar Alimento da Base TACO</span>
        </Button>

        {/* Barra de Proporção de Macronutrientes e Calorias da Refeição */}
        <MacroProportionBar
          proteinG={proteinG}
          carbsG={carbsG}
          fatsG={fatsG}
          kcal={displayKcal}
        />
      </div>

      {/* Meal Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-style-legal">
        <div className="flex gap-2">
          <Button onClick={onDuplicate} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
            <Copy size={12} />
            <span>Duplicar</span>
          </Button>
          <Button onClick={onScale} variant="secondary" size="compact" className="flex items-center gap-1 text-style-legal">
            <Percent size={12} />
            <span>Escalar</span>
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <EditIconButton
            size="compact"
            onClick={() => {
              setTempTitle(title);
              setTempTime(time);
              setIsEditingTitle(true);
            }}
            title="Editar nome e horário"
          />
          <DeleteIconButton
            size="compact"
            onClick={onDeleteMeal}
            title="Excluir refeição"
          />
        </div>
      </div>
    </Surface>
  );
};

