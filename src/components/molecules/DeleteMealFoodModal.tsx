'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { HoldToDeleteButton } from '@/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface DeleteMealFoodModalProps {
  open: boolean;
  foodName: string;
  mealName?: string;
  quantityGrams?: number;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteMealFoodModal({
  open,
  foodName,
  mealName,
  quantityGrams,
  onOpenChange,
  onConfirmDelete,
}: DeleteMealFoodModalProps) {
  useSaveShortcut({
    onSave: onConfirmDelete,
    enabled: open,
    priority: 10,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface max-w-md">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className={textStyle('dialog-title')}>
            <AlertTriangle size={20} className="text-error shrink-0 inline-block mr-2" aria-hidden="true" />
            <span className="text-error">Confirmar Remoção de Alimento</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Esta ação removerá o alimento da refeição selecionada.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-3">
          <p className={textStyle('body')}>
            Tem certeza que deseja remover o alimento{' '}
            <strong className={textStyle('body-strong')}>{foodName}</strong>
            {quantityGrams ? ` (${quantityGrams}g)` : ''}
            {mealName ? (
              <>
                {' '}da refeição <strong className={textStyle('body-strong')}>{mealName}</strong>
              </>
            ) : ''}
            ?
          </p>
          <p className="text-style-caption text-error bg-error-soft border border-error-border rounded-surface p-3">
            ⚠️ Os macronutrientes e calorias totais da refeição e da dieta serão recalculados após a remoção.
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border-subtle">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="secondary"
            size="compact"
            className="flex-1"
          >
            Cancelar
          </Button>
          <HoldToDeleteButton
            onConfirm={onConfirmDelete}
            size="compact"
            className="flex-1"
            ariaLabel="Sim, Remover Alimento"
          >
            Sim, Remover Alimento
          </HoldToDeleteButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
