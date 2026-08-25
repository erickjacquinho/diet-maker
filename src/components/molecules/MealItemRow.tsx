'use client';

import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { DeleteIconButton } from '@/components/atoms';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  onRemove?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
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
  onRemove,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
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

  return (
    <TableRow
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      className={cn(
        'group/row border-b border-border-divider transition-all duration-fast select-none hover:bg-surface-hover',
        isDragging && 'opacity-40 border-dashed border-primary bg-primary-soft/20',
        isDragOver && 'border-t-2 border-t-primary ring-1 ring-primary/20 bg-surface'
      )}
    >
      {/* 1. Drag handle */}
      <TableCell className="w-10 px-2 text-center py-2">
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart?.(index);
          }}
          onDragEnd={onDragEnd}
          className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing p-1 -m-1 rounded-control hover:bg-surface-hover transition-colors inline-flex items-center justify-center"
          title="Arrastar para reordenar"
          aria-label={`Reordenar ${name}`}
        >
          <GripVertical size={14} className="shrink-0" />
        </div>
      </TableCell>

      {/* 2. Nome do Alimento */}
      <TableCell className="text-left font-bold text-style-legal text-text-primary py-2 min-w-0">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="truncate block cursor-default outline-none"
              >
                {name}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="text-style-legal font-medium max-w-xs shadow-floating">
              {name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      {/* 3. Quantidade (Input permanente e idêntico) */}
      <TableCell className="w-24 text-center py-2 px-1">
        <div className="relative flex items-center justify-center mx-auto max-w-[84px]">
          <Input
            type="number"
            min={1}
            max={5000}
            size="compact"
            value={tempGrams}
            onChange={(e) => {
              const val = e.target.value === '' ? ('' as unknown as number) : Number(e.target.value);
              setTempGrams(val);
            }}
            onBlur={handleSaveGrams}
            onKeyDown={(e) => {
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

      {/* 4. Proteína */}
      <TableCell className="w-20 text-right font-bold text-macro-protein tabular-nums py-2 text-style-legal">
        {protein}g
      </TableCell>

      {/* 5. Carboidrato */}
      <TableCell className="w-24 text-right font-bold text-macro-carbohydrate tabular-nums py-2 text-style-legal">
        {carbs}g
      </TableCell>

      {/* 6. Gorduras */}
      <TableCell className="w-20 text-right font-bold text-macro-fat tabular-nums py-2 text-style-legal">
        {fats}g
      </TableCell>

      {/* 7. Calorias */}
      <TableCell className="w-24 text-right font-bold text-text-primary tabular-nums py-2 text-style-legal">
        {kcal} <span className="text-style-chart-micro text-text-muted font-normal">kcal</span>
      </TableCell>

      {/* 8. Excluir */}
      <TableCell className="w-12 px-2 text-center py-2">
        <DeleteIconButton
          size="compact"
          onClick={onRemove}
          title={`Remover ${name}`}
        />
      </TableCell>
    </TableRow>
  );
};

