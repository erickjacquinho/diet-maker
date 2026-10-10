'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { textStyle } from '@/design-system';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { toClinicalConsultationDate, type PatientNextEvent, type PatientNextEventType } from '@/lib/application/patients/clinical-ui-adapter';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import { normalizeDateToISO } from '@/lib/date-only';

const FOLLOW_UP_TYPES: Array<{ type: PatientNextEventType; label: string }> = [
  { type: 'assessment-update', label: 'Atualização de avaliação' },
  { type: 'diet-update', label: 'Atualização de dieta' },
];

function eventDates(event: PatientNextEvent | null): Partial<Record<PatientNextEventType, string>> {
  if (!event) return {};
  if (event.dates) {
    return Object.fromEntries(Object.entries(event.dates).map(([type, date]) => [type, toClinicalConsultationDate(date)]));
  }
  const types = Array.isArray(event.type) ? event.type : [event.type];
  return Object.fromEntries(types.map((type) => [type, toClinicalConsultationDate(event.date)]));
}

function sameDates(left: Partial<Record<PatientNextEventType, string>>, right: Partial<Record<PatientNextEventType, string>>): boolean {
  return FOLLOW_UP_TYPES.every(({ type }) => toClinicalConsultationDate(left[type] ?? '') === toClinicalConsultationDate(right[type] ?? ''));
}

function eventDraft(event: PatientNextEvent | null): PatientNextEvent {
  const dates = eventDates(event);
  const types = FOLLOW_UP_TYPES.filter(({ type }) => dates[type]).map(({ type }) => type);
  return {
    date: event?.date ?? '',
    type: types,
    dates,
    comments: event?.comments ?? '',
    ...(event?.version === undefined ? {} : { version: event.version }),
  };
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
  const [draft, setDraft] = useState<PatientNextEvent>(() => eventDraft(null));
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);
  const nextEventDate = normalizeDateToISO(nextEvent?.date) ?? '';

  useSaveShortcut({
    formRef,
    enabled: open && !isRemoveConfirmOpen && !isDiscardConfirmOpen,
    priority: 10,
    busy: isSaving,
  });

  useEffect(() => {
    if (open) {
      setDraft(eventDraft(nextEvent));
      setIsRemoveConfirmOpen(false);
      setIsDiscardConfirmOpen(false);
      setSubmitError(null);
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [open, nextEvent, nextEventDate]);

  const hasUnsavedChanges = Boolean(
    (nextEvent && (!sameDates(draft.dates ?? {}, eventDates(nextEvent)) || (draft.comments ?? '') !== (nextEvent.comments ?? ''))) ||
    (!nextEvent && (Object.values(draft.dates ?? {}).some(Boolean) || Boolean(draft.comments)))
  );
  const hasSelectedType = Object.values(draft.dates ?? {}).some(Boolean);

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
    if (!hasSelectedType) {
      setSubmitError('Informe a data de pelo menos um tipo de acompanhamento.');
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
    setDraft(eventDraft(nextEvent));
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
              Defina uma data para cada tipo de acompanhamento. Você pode agendar somente um deles.
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-4">
              {FOLLOW_UP_TYPES.map(({ type, label }) => (
                <DatePickerField
                  key={type}
                  id={`next-event-date-${type}`}
                  label={label}
                  value={draft.dates?.[type] ?? ''}
                  onValueChange={(value) => setDraft((current) => {
                    const dates = { ...(current.dates ?? {}) };
                    if (value) dates[type] = value;
                    else delete dates[type];
                    const types = FOLLOW_UP_TYPES.filter(({ type: candidate }) => dates[candidate]).map(({ type: candidate }) => candidate);
                    return { ...current, date: value || current.date, type: types, dates };
                  })}
                />
              ))}
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
                disabled={isSaving || !hasSelectedType}
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
              Tem certeza de que deseja remover as datas dos próximos acompanhamentos agendados?
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
