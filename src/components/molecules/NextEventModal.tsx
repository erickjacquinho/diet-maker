'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
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
import { SelectField } from '@/components/atoms';
import { DatePickerField } from './DatePickerField';
import type { PatientNextEvent, PatientNextEventType } from '@/lib/patientsStore';

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

  useEffect(() => {
    if (open) {
      setDraft(nextEvent ? { ...nextEvent } : { date: '', type: 'assessment-update' });
    }
  }, [open, nextEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.date) return;
    onSave(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="border-b border-border-divider pb-4">
          <DialogTitle className={textStyle('dialog-title')}>
            <Calendar strokeWidth={1.75} className="size-4 text-primary shrink-0 inline-block mr-2" aria-hidden="true" />
            <span>{nextEvent ? 'Reagendar acompanhamento' : 'Definir próximo acompanhamento'}</span>
          </DialogTitle>
          <DialogDescription className={textStyle('body-secondary')}>
            Escolha a data e o tipo da próxima atualização deste paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
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

          <DialogFooter className="items-center">
            {nextEvent && (
              <Button type="button" variant="quiet" size="standard" onClick={onClear} className="mr-auto">
                Remover data
              </Button>
            )}
            <Button type="button" variant="secondary" size="standard" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="standard">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
