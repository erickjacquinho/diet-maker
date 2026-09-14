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

export interface DeletePatientModalProps {
  open: boolean;
  patientName: string;
  onOpenChange: (open: boolean) => void;
  onConfirmArchive: () => void | Promise<void>;
}

export function DeletePatientModal({
  open,
  patientName,
  onOpenChange,
  onConfirmArchive,
}: DeletePatientModalProps) {
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [archiveError, setArchiveError] = React.useState<string | null>(null);

  const handleArchive = React.useCallback(() => {
    setIsArchiving(true);
    setArchiveError(null);
    return Promise.resolve(onConfirmArchive())
      .then(() => onOpenChange(false))
      .catch((error: unknown) => {
        setArchiveError(error instanceof Error ? error.message : 'Não foi possível arquivar o paciente.');
        throw error;
      })
      .finally(() => setIsArchiving(false));
  }, [onConfirmArchive, onOpenChange]);

  const handleArchiveError = React.useCallback((error: unknown) => {
    setIsArchiving(false);
    setArchiveError(error instanceof Error ? error.message : 'Não foi possível arquivar o paciente.');
  }, []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border-subtle p-6 rounded-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className={textStyle('dialog-title')}>
            <AlertTriangle size={20} className="text-error shrink-0 inline-block mr-2" aria-hidden="true" />
            <span className="text-error">Confirmar arquivamento do paciente</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            O paciente ficará fora da lista ativa, mas seu histórico será preservado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 flex flex-col gap-3">
          <p className={textStyle('body')}>
            Deseja arquivar o paciente <strong className={textStyle('body-strong')}>{patientName}</strong>?
          </p>
          <p className="text-style-caption text-error bg-error-soft border border-error-border rounded-surface p-3">
            Dietas, avaliações e demais registros históricos permanecerão preservados para consulta.
          </p>
          {archiveError && (
            <p id="archive-patient-error" role="alert" className="text-style-caption text-error">
              {archiveError}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-border-subtle">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="secondary"
            size="compact"
            className="flex-1"
            disabled={isArchiving}
          >
            Cancelar
          </Button>
          <HoldToDeleteButton
            onConfirm={handleArchive}
            onError={handleArchiveError}
            size="compact"
            className="flex-1"
            disabled={isArchiving}
            ariaLabel="Pressione e segure por 1,5 segundos para arquivar o paciente"
            title="Pressione e segure por 1,5 segundos para arquivar"
          >
            Sim, Arquivar Paciente
          </HoldToDeleteButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
