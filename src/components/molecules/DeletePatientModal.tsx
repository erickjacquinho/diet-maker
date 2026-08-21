'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface DeletePatientModalProps {
  open: boolean;
  patientName: string;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeletePatientModal({
  open,
  patientName,
  onOpenChange,
  onConfirmDelete,
}: DeletePatientModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className={textStyle('dialog-title')}>
            <AlertTriangle size={20} className="text-error shrink-0 inline-block mr-2" aria-hidden="true" />
            <span className="text-error">Confirmar Exclusão de Paciente</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Esta ação é permanente e desfaz o cadastro deste paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-3">
          <p className={textStyle('body')}>
            Tem certeza que deseja excluir o paciente <strong className={textStyle('body-strong')}>{patientName}</strong>?
          </p>
          <p className="text-style-caption text-error bg-error-soft border border-error-border rounded-surface p-3">
            ⚠️ Todos os dados cadastrais, prescrições de dietas e histórico de avaliações físicas associadas a este paciente serão removidos.
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
          <Button
            type="button"
            onClick={onConfirmDelete}
            variant="destructive"
            size="compact"
            className="flex-1"
          >
            Sim, Excluir Paciente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
