'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { toast } from 'sonner';

import {
  AGENDA_REMINDERS_CHANGED,
  listAgendaReminders,
  removeAgendaReminder,
} from '@/lib/agenda-reminders';
import { persistAgendaReminderChange } from '@/lib/application/browser-composition';
import { getBrowserProfessionalProfileStore } from '@/lib/application/professional-profile-store';

const MAX_TIMEOUT = 2_147_483_647;

export function AgendaReminderScheduler({ accountId }: { accountId: string | null }) {
  const profileStore = getBrowserProfessionalProfileStore();
  const profile = useSyncExternalStore(profileStore.subscribe, profileStore.getSnapshot, profileStore.getSnapshot);
  const enabled = profile.status === 'ready' && profile.profile?.agendaRemindersEnabled === true;
  useEffect(() => {
    if (accountId) void profileStore.load();
  }, [accountId, profileStore]);
  useEffect(() => {
    // Muting pauses delivery; pending reminders stay intact until the preference is enabled again.
    if (!accountId || !enabled) return undefined;

    let disposed = false;
    const timers = new Map<string, number>();
    const fired = new Set<string>();

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };

    const notify = (reminder: ReturnType<typeof listAgendaReminders>[number]) => {
      if (disposed || fired.has(reminder.id)) return;
      const stillScheduled = listAgendaReminders(accountId).some((item) => item.id === reminder.id);
      if (!stillScheduled) return;
      fired.add(reminder.id);
      if (removeAgendaReminder(accountId, reminder.id)) {
        void persistAgendaReminderChange(accountId).catch(() => {
          toast.error('O lembrete foi exibido, mas a remoção não foi salva no arquivo principal. Tente salvar as alterações novamente.');
        });
      }

      const taskLabel = reminder.task === 'diet-update' ? 'atualização de dieta' : 'avaliação física';
      const dueAt = new Date(`${reminder.date}T${reminder.time}:00`);
      toast.info(`Lembrete: ${taskLabel}`, {
        description: format(dueAt, "d 'de' MMMM 'às' HH:mm", { locale: ptBR }),
        duration: Infinity,
        closeButton: true,
      });
    };

    const schedule = (reminder: ReturnType<typeof listAgendaReminders>[number]) => {
      if (fired.has(reminder.id)) return;
      const dueAt = new Date(`${reminder.date}T${reminder.time}:00`).getTime();
      if (!Number.isFinite(dueAt)) return;

      const checkDue = () => {
        if (disposed) return;
        const remaining = dueAt - Date.now();
        if (remaining <= 0) {
          timers.delete(reminder.id);
          notify(reminder);
          return;
        }
        timers.set(reminder.id, window.setTimeout(checkDue, Math.min(remaining, MAX_TIMEOUT)));
      };

      timers.set(reminder.id, window.setTimeout(checkDue, Math.min(Math.max(0, dueAt - Date.now()), MAX_TIMEOUT)));
    };

    const refresh = () => {
      clearTimers();
      listAgendaReminders(accountId).forEach(schedule);
    };

    refresh();
    window.addEventListener(AGENDA_REMINDERS_CHANGED, refresh);
    return () => {
      disposed = true;
      clearTimers();
      window.removeEventListener(AGENDA_REMINDERS_CHANGED, refresh);
    };
  }, [accountId, enabled]);

  return null;
}
