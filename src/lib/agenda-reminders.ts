import { parseDateOnly } from '@/lib/date-only';

export type AgendaReminderTask = 'diet-update' | 'assessment-update';

export interface AgendaReminder {
  id: string;
  date: string;
  time: string;
  task: AgendaReminderTask;
}

export const AGENDA_REMINDERS_CHANGED = 'nutridiet:agenda-reminders-changed';

export function agendaRemindersStorageKey(accountId: string): string {
  return `nutridiet:agenda-reminders:${encodeURIComponent(accountId)}`;
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && parseDateOnly(value) !== undefined;
}

export function isAgendaReminder(value: unknown): value is AgendaReminder {
  if (typeof value !== 'object' || value === null) return false;
  const reminder = value as Record<string, unknown>;
  return typeof reminder.id === 'string'
    && reminder.id.length > 0
    && isDateKey(reminder.date)
    && typeof reminder.time === 'string'
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time)
    && (reminder.task === 'diet-update' || reminder.task === 'assessment-update');
}

export function readAgendaReminders(accountId: string): AgendaReminder[] {
  const serialized = window.localStorage.getItem(agendaRemindersStorageKey(accountId));
  if (serialized === null) return [];
  let values: unknown;
  try {
    values = JSON.parse(serialized) as unknown;
  } catch {
    return [];
  }
  if (!Array.isArray(values)) return [];
  return [...new Map(values.filter(isAgendaReminder).map((reminder) => [reminder.id, reminder] as const)).values()];
}

export function listAgendaReminders(accountId: string): AgendaReminder[] {
  try {
    return readAgendaReminders(accountId);
  } catch {
    return [];
  }
}

function writeAgendaReminders(accountId: string, reminders: AgendaReminder[]): boolean {
  try {
    window.localStorage.setItem(agendaRemindersStorageKey(accountId), JSON.stringify(reminders));
  } catch {
    return false;
  }
  try {
    window.dispatchEvent(new Event(AGENDA_REMINDERS_CHANGED));
  } catch {
    // Storage succeeded; a failed refresh event must not report a failed save.
  }
  return true;
}

export function replaceAgendaReminders(accountId: string, reminders: AgendaReminder[]): boolean {
  const ids = new Set<string>();
  if (reminders.some((reminder) => {
    if (!isAgendaReminder(reminder) || ids.has(reminder.id)) return true;
    ids.add(reminder.id);
    return false;
  })) return false;
  return writeAgendaReminders(accountId, reminders);
}

export function addAgendaReminder(accountId: string, reminder: AgendaReminder): boolean {
  if (!isAgendaReminder(reminder)) return false;
  let current: AgendaReminder[];
  try {
    current = readAgendaReminders(accountId);
  } catch {
    return false;
  }
  if (current.some((item) => item.id === reminder.id)) return false;
  return writeAgendaReminders(accountId, [...current, reminder]);
}

export function removeAgendaReminder(accountId: string, reminderId: string): boolean {
  let current: AgendaReminder[];
  try {
    current = readAgendaReminders(accountId);
  } catch {
    return false;
  }
  if (!current.some((reminder) => reminder.id === reminderId)) return false;
  return writeAgendaReminders(accountId, current.filter((reminder) => reminder.id !== reminderId));
}
