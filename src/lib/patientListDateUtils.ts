import type {
  PatientLastActivity,
  PatientNextEvent,
  PatientNextEventType,
} from './patientsStore';

export const PATIENT_LIST_GROUP_IDS = ['no-event', 'overdue', 'today', 'upcoming'] as const;
export type PatientListGroupId = (typeof PATIENT_LIST_GROUP_IDS)[number];

const EVENT_TYPE_LABELS: Record<PatientNextEventType, string> = {
  'diet-update': 'Atualização de dieta',
  'assessment-update': 'Atualização de avaliação',
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDateKey(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function normalizeDateKey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/.exec(trimmed);
  if (isoMatch) {
    return createDateKey(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const ptBrMatch = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(trimmed);
  if (ptBrMatch) {
    return createDateKey(Number(ptBrMatch[3]), Number(ptBrMatch[2]), Number(ptBrMatch[1]));
  }

  return null;
}

export function getDateKeyDate(dateKey: string): Date | null {
  const normalized = normalizeDateKey(dateKey);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getDaysUntilEvent(eventDate: string, today = getTodayDateKey()): number | null {
  const event = getDateKeyDate(eventDate);
  const current = getDateKeyDate(today);
  if (!event || !current) return null;
  return Math.round((event.getTime() - current.getTime()) / DAY_IN_MS);
}

export function formatDateKey(dateKey: string | null | undefined): string | null {
  const normalizedDateKey = dateKey ? normalizeDateKey(dateKey) : null;
  if (!normalizedDateKey) return null;
  const [, month, day] = normalizedDateKey.split('-');
  return `${day}/${month}`;
}

export function formatEventStatus(
  event: PatientNextEvent | null | undefined,
  today = getTodayDateKey(),
): string {
  if (!event?.date) return 'Sem próximo evento';

  const daysUntilEvent = getDaysUntilEvent(event.date, today);
  if (daysUntilEvent === null) return 'Sem próximo evento';
  if (daysUntilEvent < 0) {
    const days = Math.abs(daysUntilEvent);
    return `Atrasado há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  if (daysUntilEvent === 0) return 'Hoje';
  return `Em ${daysUntilEvent} ${daysUntilEvent === 1 ? 'dia' : 'dias'}`;
}

export function formatEventType(type: PatientNextEventType | undefined): string | null {
  return type ? EVENT_TYPE_LABELS[type] : null;
}
