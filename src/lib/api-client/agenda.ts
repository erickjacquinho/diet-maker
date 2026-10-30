import type { ReminderDto } from '@/lib/contracts/agenda';
import { apiRequest } from './client';

/** Client for agenda reminders and favorite foods. Not yet wired to the screens. */
export const agendaApi = {
  listReminders: () => apiRequest<{ items: ReminderDto[] }>('/api/v1/agenda/reminders'),
  putReminder: (reminder: ReminderDto) =>
    apiRequest<ReminderDto>(`/api/v1/agenda/reminders/${encodeURIComponent(reminder.id)}`, {
      method: 'PUT', body: { date: reminder.date, time: reminder.time, task: reminder.task },
    }),
  removeReminder: (id: string) =>
    apiRequest<{ removed: true }>(`/api/v1/agenda/reminders/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const favoritesApi = {
  list: () => apiRequest<{ foodIds: string[] }>('/api/v1/favorites/foods'),
  set: (foodId: string, favorite: boolean) =>
    apiRequest<{ foodId: string; favorite: boolean }>(`/api/v1/favorites/foods/${encodeURIComponent(foodId)}`, {
      method: 'PUT', body: { favorite },
    }),
};
