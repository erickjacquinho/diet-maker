'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectField, HoldToDeleteButton } from '@/components/atoms';
import { DatePickerField } from './DatePickerField';
import type { PatientNextEvent, PatientNextEventType } from '@/lib/patientsStore';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

export interface NextEventModalProps {
  open: boolean;
  nextEvent: PatientNextEvent | null;
  onOpenChange: (open: boolean) => void;
  onSave: (event: PatientNextEvent) => void;
  onClear: () => void;
}

export function NextEventModal({
  open,
  nextEvent,
  onOpenChange,
  onSave,
  onClear,
}: NextEventModalProps) {
  const [draft, setDraft] = useState<PatientNextEvent>({
    date: '',
    type: 'assessment-update',
  });
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useSaveShortcut({
    formRef,
    enabled: open && !isRemoveConfirmOpen && !isDiscardConfirmOpen,
    priority: 10,
  });

  useEffect(() => {
    if (open) {
      setDraft(nextEvent ? { ...nextEvent } : { date: '', type: 'assessment-update' });
      setIsRemoveConfirmOpen(false);
      setIsDiscardConfirmOpen(false);
    }
  }, [open, nextEvent]);

  const hasUnsavedChanges = Boolean(
    (nextEvent && (draft.date !== nextEvent.date || draft.type !== nextEvent.type)) ||
    (!nextEvent && (draft.date !== '' || draft.type !== 'assessment-update'))
  );

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.date) return;
    onSave(draft);
    onOpenChange(false);
  };

  const confirmDiscard = () => {
    setDraft(nextEvent ? { ...nextEvent } : { date: '', type: 'assessment-update' });
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const confirmRemove = () => {
    setIsRemoveConfirmOpen(false);
    onClear();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent
          className="max-h-screen overflow-y-auto"
          onPointerDownOutside={(event) => {
            if (hasUnsavedChanges) {
              event.preventDefault();
              setIsDiscardConfirmOpen(true);
            }
          }}
          onEscapeKeyDown={(event) => {
            if (hasUnsavedChanges) {
              event.preventDefault();
              setIsDiscardConfirmOpen(true);
            }
          }}
        >
          <DialogHeader className="border-b border-border-subtle pb-3">
            <DialogTitle className={textStyle('dialog-title')}>
              <Calendar size={18} className="text-success shrink-0 inline-block mr-2" aria-hidden="true" />
              <span>{nextEvent ? 'Reagendar acompanhamento' : 'Definir próximo acompanhamento'}</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Escolha a data e o tipo da próxima atualização deste paciente.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DatePickerField
                id="next-event-date"
                label="Data"
                required
                value={draft.date}
                onValueChange={(value) => setDraft((current) => ({ ...current, date: value }))}
              />

              <SelectField
                id="next-event-type"
                label="Tipo"
                value={draft.type}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, type: value as PatientNextEventType }))
                }
                layer="modal"
                options={[
                  { value: 'assessment-update', label: 'Atualização de avaliação' },
                  { value: 'diet-update', label: 'Atualização de dieta' },
                ]}
              />
            </div>

            <DialogFooter className="items-center gap-2 pt-2 border-t border-border-subtle">
              {nextEvent && (
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="standard"
                  onClick={() => setIsRemoveConfirmOpen(true)}
                  className="mr-auto"
                >
                  Remover data
                </Button>
              )}
              <Button type="button" variant="secondary" size="standard" onClick={() => requestClose(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="standard"
                aria-keyshortcuts="Control+s Meta+s"
                title="Salvar (Ctrl+S)"
              >
                Salvar <span className="opacity-70 text-[11px] font-mono">(Ctrl+S)</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de confirmação para remoção de acompanhamento */}
      <Dialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>
              <AlertTriangle size={18} className="text-warning shrink-0 inline-block mr-2" aria-hidden="true" />
              <span>Remover acompanhamento?</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Tem certeza de que deseja remover a data do próximo acompanhamento agendado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={() => setIsRemoveConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <HoldToDeleteButton
              onConfirm={confirmRemove}
              size="compact"
            >
              Sim, remover
            </HoldToDeleteButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta de confirmação para descarte de alterações não salvas */}
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={textStyle('dialog-title')}>
              <AlertTriangle size={18} className="text-warning shrink-0 inline-block mr-2" aria-hidden="true" />
              <span>Descartar alterações?</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Você possui alterações não salvas no acompanhamento. Deseja descartar e sair?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="compact"
              onClick={() => setIsDiscardConfirmOpen(false)}
            >
              Não
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="compact"
              onClick={confirmDiscard}
            >
              Sim, descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
