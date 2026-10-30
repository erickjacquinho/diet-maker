/** Wire contracts for `/api/v1/agenda/reminders` and `/api/v1/favorites/foods`. */

export type ReminderTask = 'diet-update' | 'assessment-update';

export interface ReminderDto {
  id: string;
  date: string;
  time: string;
  task: ReminderTask;
}

const reminderIdPattern = /^[A-Za-z0-9_-]{1,100}$/;
const foodIdPattern = /^[A-Za-z0-9_.:-]{1,100}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object.');
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) if (!allowed.includes(key)) throw new TypeError('Unknown field.');
  return source;
}

export function isReminderId(value: unknown): value is string {
  return typeof value === 'string' && reminderIdPattern.test(value);
}

export function isFavoriteFoodId(value: unknown): value is string {
  return typeof value === 'string' && foodIdPattern.test(value);
}

function validDate(value: unknown): string {
  if (typeof value !== 'string' || !datePattern.test(value)) throw new TypeError('Invalid date.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new TypeError('Invalid date.');
  return value;
}

/** The ID comes from the route; the body carries only the reminder content. */
export function parseReminderBody(value: unknown): Omit<ReminderDto, 'id'> {
  const v = record(value, ['date', 'time', 'task']);
  if (typeof v.time !== 'string' || !timePattern.test(v.time)) throw new TypeError('Invalid time.');
  if (v.task !== 'diet-update' && v.task !== 'assessment-update') throw new TypeError('Invalid task.');
  return { date: validDate(v.date), time: v.time, task: v.task };
}

export function parseReminderDto(value: unknown): ReminderDto {
  const r = record(value, ['id', 'date', 'time', 'task']);
  return { id: String(r.id), ...parseReminderBody({ date: r.date, time: r.time, task: r.task }) };
}

export function parseReminderListDto(value: unknown): { items: ReminderDto[] } {
  const v = record(value, ['items']);
  if (!Array.isArray(v.items)) throw new TypeError('Invalid list.');
  return { items: v.items.map(parseReminderDto) };
}

export function parseFavoriteBody(value: unknown): { favorite: boolean } {
  const v = record(value, ['favorite']);
  if (typeof v.favorite !== 'boolean') throw new TypeError('Invalid flag.');
  return { favorite: v.favorite };
}

export function parseFavoriteListDto(value: unknown): { foodIds: string[] } {
  const v = record(value, ['foodIds']);
  if (!Array.isArray(v.foodIds) || !v.foodIds.every(isFavoriteFoodId)) throw new TypeError('Invalid list.');
  return { foodIds: v.foodIds };
}

export function parseFavoriteStateDto(value: unknown): { foodId: string; favorite: boolean } {
  const v = record(value, ['foodId', 'favorite']);
  if (!isFavoriteFoodId(v.foodId) || typeof v.favorite !== 'boolean') throw new TypeError('Invalid state.');
  return { foodId: v.foodId, favorite: v.favorite };
}

export function parseRemovedDto(): { removed: true } {
  return { removed: true };
}
