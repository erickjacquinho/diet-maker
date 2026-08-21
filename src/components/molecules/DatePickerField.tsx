"use client"

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { ptBR } from 'date-fns/locale/pt-BR';

import { textStyle } from '@/design-system';
import { FieldTrigger } from '@/components/atoms';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDateOnly, parseDateOnly, serializeDateOnly } from '@/lib/date-only';

export interface DatePickerFieldProps {
  id: string;
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

function DatePickerField({
  id,
  label,
  value,
  onValueChange,
  placeholder = 'Selecione uma data',
  description,
  error,
  required = false,
  disabled = false,
  name,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateOnly(value);
  const displayedValue = formatDateOnly(value);
  const descriptionIds = [
    description ? `${id}-description` : undefined,
    error ? `${id}-error` : undefined,
  ].filter(Boolean).join(' ') || undefined;

  const handleSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    onValueChange(serializeDateOnly(date));
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label id={`${id}-label`} htmlFor={id} className={textStyle('field-label')}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FieldTrigger
            id={id}
            size="standard"
            state={error ? 'error' : 'default'}
            disabled={disabled}
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-required={required ? 'true' : undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={descriptionIds}
            className={cn(
              'w-full justify-start pl-9 pr-3 text-left font-normal select-none relative',
              !displayedValue && 'text-text-muted',
            )}
          >
            <CalendarDays
              aria-hidden="true"
              className="absolute left-3 size-4 text-text-muted pointer-events-none shrink-0"
            />
            <span>{displayedValue || placeholder}</span>
          </FieldTrigger>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          layer="modal"
          className="w-auto overflow-hidden rounded-surface border-border-subtle bg-surface p-0 shadow-floating"
        >
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Input type="hidden" name={name ?? id} value={value ?? ''} aria-hidden="true" />

      {description ? (
        <p id={`${id}-description`} className={textStyle('helper')}>
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className={cn(textStyle('validation-error'))}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { DatePickerField };
