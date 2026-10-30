import { getBrowserPatientRuntimeIfActive, persistAgendaReminderChange } from '@/lib/application/browser-composition';
import { toggleFavoriteFood } from '@/lib/library-ui-adapter';

/** Toggles a favorite food and persists it in the main save; reverts the toggle if saving fails. */
export async function toggleFavoriteFoodPersisted(foodId: string): Promise<string[]> {
  const next = toggleFavoriteFood(foodId);
  const runtime = getBrowserPatientRuntimeIfActive();
  if (!runtime) return next;
  try {
    await persistAgendaReminderChange(runtime.account.id);
  } catch (error) {
    toggleFavoriteFood(foodId);
    throw error;
  }
  return next;
}
