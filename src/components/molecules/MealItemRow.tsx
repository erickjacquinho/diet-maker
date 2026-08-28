'use client';

import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { DeleteIconButton, DuplicateIconButton, SubstituteIconButton } from '@/components/atoms';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type DropPosition = 'top' | 'bottom' | null;

export interface MealItemRowProps {
  id?: string;
  index?: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  quantityGrams: number;
  onQuantityChange?: (newGrams: number) => void;
  onSubstitute?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  dragOverPosition?: DropPosition;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  onDragLeave?: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  onDrop?: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
  isReorderingActive?: boolean;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  index = 0,
  name,
  kcal,
  protein,
  carbs,
  fats,
  quantityGrams,
  onQuantityChange,
  onSubstitute,
  onDuplicate,
  onRemove,
  isDragging = false,
  isDragOver = false,
  dragOverPosition = null,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {

  const [tempGrams, setTempGrams] = useState<number | string>(quantityGrams);

  useEffect(() => {
    setTempGrams(quantityGrams);
  }, [quantityGrams]);

  const handleSaveGrams = () => {
    const val = Math.max(1, Number(tempGrams) || 100);
    setTempGrams(val);
    if (onQuantityChange && val !== quantityGrams) {
      onQuantityChange(val);
    }
  };

  const handleQuantityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Tab') return;

    const quantityInputs = Array.from(
      event.currentTarget.closest('tbody')?.querySelectorAll<HTMLInputElement>(
        'input[data-meal-quantity-input]'
      ) ?? []
    );
    const currentIndex = quantityInputs.indexOf(event.currentTarget);
    const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
    const nextInput = quantityInputs[nextIndex];

    if (!nextInput) return;

    event.preventDefault();
    nextInput.focus();
  };

  return (
    <TableRow
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, index);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
      }}
      onDragLeave={(e) => {
        onDragLeave?.(e, index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, index);
      }}
      className={cn(
        'group/row border-b border-border-divider transition-all duration-fast select-none hover:bg-surface-hover',
        isDragging && 'opacity-30 bg-surface-subtle border-dashed border-border-divider',
        isDragOver && dragOverPosition === 'top' && 'border-t-2 border-t-primary bg-primary-soft/15 ring-1 ring-primary/20',
        isDragOver && dragOverPosition === 'bottom' && 'border-b-2 border-b-primary bg-primary-soft/15 ring-1 ring-primary/20'
      )}
    >
      {/* 1. Drag handle */}
      <TableCell className="w-10 px-2 text-center py-2">
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            if (e.dataTransfer) {
              e.dataTransfer.setData('text/plain', String(index));
              e.dataTransfer.effectAllowed = 'move';
            }
            onDragStart?.(index);
          }}
          onDragEnd={onDragEnd}
          className={cn(
            'p-1 -m-1 rounded-control transition-colors inline-flex items-center justify-center cursor-grab active:cursor-grabbing',
            isDragOver ? 'text-primary bg-primary-soft' : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
          )}
          title="Arrastar para reordenar"
          aria-label={`Reordenar ${name}`}
        >
          <GripVertical size={14} className="shrink-0" />
        </div>
      </TableCell>

      {/* 2. Nome do Alimento */}
      <TableCell className="text-left font-bold text-style-legal text-text-primary py-2 min-w-[140px]">
        <div className="flex items-center min-w-[140px] max-w-sm">
          <span
            className="truncate block font-bold text-text-primary"
            title={name}
          >
            {name}
          </span>
        </div>
      </TableCell>

      {/* 3. Ações do alimento */}
      <TableCell className="w-20 px-2 text-center py-2">
        <div className="flex items-center justify-center gap-1 opacity-0 pointer-events-none transition-opacity duration-fast group-hover/row:pointer-events-auto group-hover/row:opacity-100 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100">
          <SubstituteIconButton
            size="compact"
            onClick={onSubstitute}
            title={`Substituir ${name}`}
            aria-label={`Substituir ${name}`}
          />
          <DuplicateIconButton
            size="compact"
            onClick={onDuplicate}
            title={`Duplicar ${name}`}
            aria-label={`Duplicar ${name}`}
          />
        </div>
      </TableCell>

      {/* 4. Quantidade (Input permanente e idêntico) */}
      <TableCell className="w-24 text-center py-2 px-1">
        <div className="relative flex items-center justify-center mx-auto max-w-[84px]">
          <Input
            type="number"
            min={1}
            max={5000}
            size="compact"
            data-meal-quantity-input="true"
            value={tempGrams}
            onChange={(e) => {
              const val = e.target.value === '' ? ('' as unknown as number) : Number(e.target.value);
              setTempGrams(val);
            }}
            onBlur={handleSaveGrams}
            onKeyDown={(e) => {
              handleQuantityKeyDown(e);
              if (e.key === 'Enter') handleSaveGrams();
              if (e.key === 'Escape') setTempGrams(quantityGrams);
            }}
            className="w-full h-7 pl-2 pr-5 text-center text-style-field-value font-bold bg-surface border-border-subtle hover:border-border-hover focus:border-primary"
            aria-label={`Quantidade em gramas para ${name}`}
          />
          <span className="absolute right-2 text-style-chart-micro font-bold text-text-muted pointer-events-none select-none">
            g
          </span>
        </div>
      </TableCell>

      {/* 5. Proteína */}
      <TableCell className="w-20 text-right font-bold text-macro-protein tabular-nums py-2 text-style-legal">
        {protein}g
      </TableCell>

      {/* 6. Carboidrato */}
      <TableCell className="w-24 text-right font-bold text-macro-carbohydrate tabular-nums py-2 text-style-legal">
        {carbs}g
      </TableCell>

      {/* 7. Gorduras */}
      <TableCell className="w-20 text-right font-bold text-macro-fat tabular-nums py-2 text-style-legal">
        {fats}g
      </TableCell>

      {/* 8. Calorias */}
      <TableCell className="w-24 text-right font-bold text-text-primary tabular-nums py-2 text-style-legal">
        {kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
      </TableCell>

      {/* 9. Remover alimento (visível apenas em hover / focus-within) */}
      <TableCell className="w-12 px-2 text-center py-2">
        <div className="flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-fast group-hover/row:pointer-events-auto group-hover/row:opacity-100 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100">
          <DeleteIconButton
            size="compact"
            onClick={onRemove}
            title={`Remover ${name}`}
            aria-label={`Remover ${name}`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
