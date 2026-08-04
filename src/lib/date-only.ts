import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function parseDateOnly(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    return undefined;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);

  if (!isValidDate(date)) {
    return undefined;
  }

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

export function serializeDateOnly(date?: Date): string {
  if (!date || !isValidDate(date)) {
    return '';
  }

  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value?: string): string {
  const date = parseDateOnly(value);

  return date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : '';
}
