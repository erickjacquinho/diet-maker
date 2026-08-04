"use client"

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { ptBR } from 'date-fns/locale/pt-BR';

import { textStyle } from '@/design-system';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
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
      <label htmlFor={id} className={textStyle('field-label')}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="secondary"
            size="standard"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionIds}
            className="w-full justify-start text-left font-regular"
          >
            <CalendarDays aria-hidden="true" data-icon className="size-4 shrink-0" />
            <span className={displayedValue ? textStyle('field-value') : textStyle('field-placeholder')}>
              {displayedValue || placeholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
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
