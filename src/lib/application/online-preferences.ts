import { agendaApi, favoritesApi } from '@/lib/api-client/agenda';
import type { ReminderDto } from '@/lib/contracts/agenda';
import { readAgendaReminders, replaceAgendaReminders } from '@/lib/agenda-reminders';
import { getFavoritesFromStorage, setFavoritesFromStorage } from '@/lib/library-ui-adapter';

/**
 * Favorite foods and agenda reminders are read synchronously by the screens, so they live in the in-memory/browser
 * cache the UI already uses. This keeps that cache and the account in step: `hydrate` loads the server state into the
 * cache when the session opens, and `push` sends whatever changed since the last known server state.
 */
export interface OnlinePreferences {
  hydrate(): Promise<void>;
  push(): Promise<void>;
}

const sameReminder = (a: ReminderDto, b: ReminderDto) => a.date === b.date && a.time === b.time && a.task === b.task;

export function createOnlinePreferences(accountId: string): OnlinePreferences {
  let serverFavorites = new Set<string>();
  let serverReminders = new Map<string, ReminderDto>();
  let queue: Promise<void> = Promise.resolve();

  async function hydrate(): Promise<void> {
    const [favorites, reminders] = await Promise.all([favoritesApi.list(), agendaApi.listReminders()]);
    serverFavorites = new Set(favorites.foodIds);
    serverReminders = new Map(reminders.items.map((reminder) => [reminder.id, reminder]));
    setFavoritesFromStorage([...serverFavorites], accountId);
    replaceAgendaReminders(accountId, reminders.items);
  }

  async function pushNow(): Promise<void> {
    const favorites = new Set(getFavoritesFromStorage(accountId));
    const reminders = new Map(readAgendaReminders(accountId).map((reminder) => [reminder.id, reminder] as const));
    const requests: Array<Promise<unknown>> = [];
    const nextFavorites = new Set(serverFavorites);
    const nextReminders = new Map(serverReminders);

    for (const foodId of favorites) {
      if (!serverFavorites.has(foodId)) requests.push(favoritesApi.set(foodId, true).then(() => { nextFavorites.add(foodId); }));
    }
    for (const foodId of serverFavorites) {
      if (!favorites.has(foodId)) requests.push(favoritesApi.set(foodId, false).then(() => { nextFavorites.delete(foodId); }));
    }
    for (const [id, reminder] of reminders) {
      const known = serverReminders.get(id);
      if (!known || !sameReminder(known, reminder)) requests.push(agendaApi.putReminder(reminder).then(() => { nextReminders.set(id, reminder); }));
    }
    for (const id of serverReminders.keys()) {
      if (!reminders.has(id)) requests.push(agendaApi.removeReminder(id).then(() => { nextReminders.delete(id); }));
    }

    const results = await Promise.allSettled(requests);
    // Whatever the server accepted is remembered, so a retry only resends what failed.
    serverFavorites = nextFavorites;
    serverReminders = nextReminders;
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failure) throw failure.reason;
  }

  return {
    hydrate,
    // Pushes run one after another so two quick changes cannot interleave their diffs.
    push() {
      const run = queue.then(pushNow, pushNow);
      queue = run.catch(() => undefined);
      return run;
    },
  };
}
