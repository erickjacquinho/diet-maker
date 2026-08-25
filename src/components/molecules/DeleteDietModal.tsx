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

export interface DeleteDietModalProps {
  open: boolean;
  dietName: string;
  dietDate?: string;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteDietModal({
  open,
  dietName,
  dietDate,
  onOpenChange,
  onConfirmDelete,
}: DeleteDietModalProps) {
  useSaveShortcut({
    onSave: onConfirmDelete,
    enabled: open,
    priority: 10,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className={textStyle('dialog-title')}>
            <AlertTriangle size={20} className="text-error shrink-0 inline-block mr-2" aria-hidden="true" />
            <span className="text-error">Confirmar Exclusão de Prescrição</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Esta ação é permanente e remove esta prescrição dietética do histórico do paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-3">
          <p className={textStyle('body')}>
            Tem certeza que deseja excluir a prescrição dietética{' '}
            <strong className={textStyle('body-strong')}>{dietName}</strong>
            {dietDate ? ` (${dietDate})` : ''}?
          </p>
          <p className="text-style-caption text-error bg-error-soft border border-error-border rounded-surface p-3">
            ⚠️ Todos os cálculos de calorias, distribuição de macronutrientes e cardápios associados a este plano serão removidos.
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
            ariaLabel="Sim, Excluir Prescrição"
          >
            Sim, Excluir Prescrição
          </HoldToDeleteButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
