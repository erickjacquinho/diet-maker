'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, AlertTriangle, Check } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HoldToDeleteButton } from '@/components/atoms';
import { DatePickerField } from './DatePickerField';
import type { PatientNextEvent, PatientNextEventType } from '@/lib/application/patients/clinical-ui-adapter';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

function selectedTypes(type: PatientNextEvent['type']): PatientNextEventType[] {
  return Array.isArray(type) ? type : [type];
}

function sameTypes(left: PatientNextEvent['type'], right: PatientNextEvent['type']): boolean {
  const leftTypes = selectedTypes(left);
  const rightTypes = selectedTypes(right);
  return leftTypes.length === rightTypes.length && leftTypes.every((type) => rightTypes.includes(type));
}

export interface NextEventModalProps {
  open: boolean;
  nextEvent: PatientNextEvent | null;
  onOpenChange: (open: boolean) => void;
  onSave: (event: PatientNextEvent) => void | Promise<void>;
  onClear: () => void | Promise<void>;
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
    type: ['assessment-update'],
    comments: '',
  });
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);

  useSaveShortcut({
    formRef,
    enabled: open && !isRemoveConfirmOpen && !isDiscardConfirmOpen,
    priority: 10,
    busy: isSaving,
  });

  useEffect(() => {
    if (open) {
      setDraft(nextEvent ? { ...nextEvent, type: selectedTypes(nextEvent.type), comments: nextEvent.comments ?? '' } : { date: '', type: ['assessment-update'], comments: '' });
      setIsRemoveConfirmOpen(false);
      setIsDiscardConfirmOpen(false);
      setSubmitError(null);
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [open, nextEvent]);

  const hasUnsavedChanges = Boolean(
    (nextEvent && (draft.date !== nextEvent.date || !sameTypes(draft.type, nextEvent.type) || (draft.comments ?? '') !== (nextEvent.comments ?? ''))) ||
    (!nextEvent && (draft.date !== '' || !sameTypes(draft.type, ['assessment-update']) || Boolean(draft.comments)))
  );

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
      return;
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    if (!draft.date) {
      setSubmitError('Informe a data do acompanhamento.');
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    setSubmitError(null);
    try {
      await onSave(draft);
      onOpenChange(false);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar o acompanhamento.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const confirmDiscard = () => {
    setDraft(nextEvent ? { ...nextEvent, type: selectedTypes(nextEvent.type), comments: nextEvent.comments ?? '' } : { date: '', type: ['assessment-update'], comments: '' });
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const confirmRemove = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSubmitError(null);
    try {
      const result = onClear();
      if (result && typeof result.then === 'function') {
        void result.then(() => {
          setIsRemoveConfirmOpen(false);
          onOpenChange(false);
        }).catch((error: unknown) => {
          setSubmitError(error instanceof Error ? error.message : 'Não foi possível remover o acompanhamento.');
        }).finally(() => {
          savingRef.current = false;
          setIsSaving(false);
        });
      } else {
        setIsRemoveConfirmOpen(false);
        onOpenChange(false);
        savingRef.current = false;
        setIsSaving(false);
      }
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível remover o acompanhamento.');
      savingRef.current = false;
      setIsSaving(false);
    }
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
              <span>Agendar acompanhamento</span>
            </DialogTitle>
            <DialogDescription className={textStyle('body-secondary')}>
              Defina a data, o tipo e os comentários do próximo acompanhamento deste paciente.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <DatePickerField
              id="next-event-date"
              label="Data"
              required
              value={draft.date}
              onValueChange={(value) => setDraft((current) => ({ ...current, date: value }))}
            />

            <div className="flex flex-col gap-2">
              <span id="next-event-type-label" className={textStyle('field-label')}>Tipo de acompanhamento</span>
              <ToggleGroup
                type="multiple"
                value={selectedTypes(draft.type)}
                onValueChange={(value) => {
                  if (value.length > 0) setDraft((current) => ({ ...current, type: value as PatientNextEventType[] }));
                }}
                aria-labelledby="next-event-type-label"
                className="grid w-full grid-cols-2 items-stretch gap-3 rounded-none border-0 bg-transparent p-0"
              >
                {([
                  { value: 'assessment-update', label: 'Atualização de avaliação' },
                  { value: 'diet-update', label: 'Atualização de dieta' },
                ] as const).map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="min-h-14 w-full justify-between whitespace-normal rounded-control border border-border-subtle bg-surface px-3 py-2 text-left text-style-body font-medium data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary"
                  >
                    <span>{option.label}</span>
                    {selectedTypes(draft.type).includes(option.value) && <Check size={16} className="shrink-0" aria-hidden="true" />}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="next-event-comments" className={textStyle('field-label')}>Observações</label>
              <Textarea
                id="next-event-comments"
                rows={5}
                className="resize-none"
                value={draft.comments ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, comments: event.target.value }))}
                placeholder="Adicione detalhes relevantes sobre o acompanhamento."
              />
            </div>

            {submitError && <p role="alert" className={textStyle('validation-error')}>{submitError}</p>}

            <DialogFooter className="items-center gap-2 pt-2 border-t border-border-subtle">
              {nextEvent && (
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="standard"
                  onClick={() => setIsRemoveConfirmOpen(true)}
                  className="mr-auto"
                  disabled={isSaving}
                >
                  Remover data
                </Button>
              )}
              <Button type="button" variant="secondary" size="standard" onClick={() => requestClose(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="standard"
                aria-keyshortcuts="Control+s Meta+s"
                title="Salvar (Ctrl+S)"
                disabled={isSaving}
              >
                Salvar <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span>
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
              ariaLabel="Sim, remover"
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
