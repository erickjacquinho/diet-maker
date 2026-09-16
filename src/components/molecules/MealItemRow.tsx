'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, CopyPlus, GripVertical } from 'lucide-react';
import { DeleteIconButton, IconButton } from '@/components/atoms';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SortableItemProps } from './SortableList';

export interface MealItemRowProps {
  id?: string;
  index?: number;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  quantityGrams: number;
  quantityUnit?: string;
  onQuantityChange?: (newGrams: number) => void;
  onSubstitute?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  sortableProps?: SortableItemProps;
}

export const MealItemRow: React.FC<MealItemRowProps> = ({
  name,
  kcal,
  protein,
  carbs,
  fats,
  quantityGrams,
  quantityUnit = 'g',
  onQuantityChange,
  onSubstitute,
  onDuplicate,
  onRemove,
  sortableProps,
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

  const handleQuantityInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;

    if (rawValue === '') {
      setTempGrams('');
      return;
    }

    const nextGrams = Number(rawValue);
    if (!Number.isFinite(nextGrams)) return;

    setTempGrams(nextGrams);
    if (nextGrams >= 1 && nextGrams !== quantityGrams) {
      onQuantityChange?.(nextGrams);
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

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, action?: () => void) => {
    if (event.detail > 0) event.currentTarget.blur();
    action?.();
  };

  return (
    <TableRow
      ref={sortableProps?.ref as React.Ref<HTMLTableRowElement> | undefined}
      onPointerDown={sortableProps?.onPointerDown as React.PointerEventHandler<HTMLTableRowElement> | undefined}
      onKeyDown={sortableProps?.onKeyDown as React.KeyboardEventHandler<HTMLTableRowElement> | undefined}
      tabIndex={sortableProps?.tabIndex}
      data-testid={sortableProps?.['data-testid']}
      data-sortable-id={sortableProps?.['data-sortable-id']}
      aria-label={sortableProps?.['aria-label']}
      aria-posinset={sortableProps?.['aria-posinset']}
      aria-setsize={sortableProps?.['aria-setsize']}
      aria-keyshortcuts={sortableProps?.['aria-keyshortcuts']}
      className={cn(
        'group/row border-b border-border-divider transition-colors duration-fast select-none hover:bg-surface-hover',
        sortableProps?.className
      )}
    >
      {/* 1. Drag handle */}
      <TableCell className="w-10 px-2 text-center py-2">
        <div
          className={cn(
            'p-1 -m-1 rounded-control transition-colors duration-fast inline-flex items-center justify-center text-text-muted',
            'group-hover/row:text-text-primary group-focus-within/row:text-primary'
          )}
          aria-hidden="true"
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
        <div className="flex items-center justify-center gap-1 invisible pointer-events-none group-hover/row:visible group-hover/row:pointer-events-auto group-focus-within/row:visible group-focus-within/row:pointer-events-auto">
          <IconButton
            size="compact"
            variant="secondary"
            onClick={(event) => handleActionClick(event, onSubstitute)}
            title={`Substituir ${name}`}
            aria-label={`Substituir ${name}`}
            icon={<ArrowLeftRight size={14} className="shrink-0" aria-hidden="true" />}
          />
          <IconButton
            size="compact"
            variant="secondary"
            onClick={(event) => handleActionClick(event, onDuplicate)}
            title={`Duplicar ${name}`}
            aria-label={`Duplicar ${name}`}
            icon={<CopyPlus size={14} className="shrink-0" aria-hidden="true" />}
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
            onChange={handleQuantityInputChange}
            onBlur={handleSaveGrams}
            onKeyDown={(e) => {
              handleQuantityKeyDown(e);
              if (e.key === 'Enter') handleSaveGrams();
              if (e.key === 'Escape') setTempGrams(quantityGrams);
            }}
            className="w-full h-7 pl-2 pr-5 text-center text-style-field-value font-bold bg-surface border-border-subtle hover:border-border-hover focus:border-primary"
            aria-label={`Quantidade em ${quantityUnit} para ${name}`}
          />
          <span className="absolute right-2 text-style-chart-micro font-bold text-text-muted pointer-events-none select-none">
            {quantityUnit}
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
        <div className="flex items-center justify-center invisible pointer-events-none group-hover/row:visible group-hover/row:pointer-events-auto group-focus-within/row:visible group-focus-within/row:pointer-events-auto">
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
