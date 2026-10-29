import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listAgendaReminders: vi.fn(),
  removeAgendaReminder: vi.fn(),
  persistAgendaReminderChange: vi.fn(),
  toast: vi.fn(),
  load: vi.fn(async () => undefined),
  preference: { status: 'ready', profile: { agendaRemindersEnabled: true } },
}));

vi.mock('@/lib/application/professional-profile-store', () => ({
  getBrowserProfessionalProfileStore: () => ({ getSnapshot: () => mocks.preference, subscribe: () => () => undefined, load: mocks.load }),
}));
vi.mock('sonner', () => ({ toast: { info: mocks.toast, error: vi.fn() } }));

vi.mock('@/lib/agenda-reminders', () => ({
  AGENDA_REMINDERS_CHANGED: 'agenda-reminders-changed',
  listAgendaReminders: mocks.listAgendaReminders,
  removeAgendaReminder: mocks.removeAgendaReminder,
}));

vi.mock('@/lib/application/browser-composition', () => ({
  persistAgendaReminderChange: mocks.persistAgendaReminderChange,
}));

import { AgendaReminderScheduler } from '@/app/AgendaReminderScheduler';

describe('AgendaReminderScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.preference = { status: 'ready', profile: { agendaRemindersEnabled: true } };
    mocks.listAgendaReminders.mockReturnValue([]);
  });
  afterEach(() => vi.useRealTimers());

  it('does not read or change reminders without an active local account', () => {
    render(<AgendaReminderScheduler accountId={null} />);

    expect(mocks.listAgendaReminders).not.toHaveBeenCalled();
    expect(mocks.removeAgendaReminder).not.toHaveBeenCalled();
    expect(mocks.persistAgendaReminderChange).not.toHaveBeenCalled();
  });

  it('preserves muted reminders and delivers them when the preference is re-enabled', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T12:00:00'));
    mocks.preference = { status: 'ready', profile: { agendaRemindersEnabled: false } };
    mocks.listAgendaReminders.mockReturnValue([{ id: 'reminder', date: '2026-10-22', time: '12:00', task: 'diet-update' }]);
    mocks.removeAgendaReminder.mockReturnValue(true);
    mocks.persistAgendaReminderChange.mockResolvedValue(undefined);
    const { rerender } = render(<AgendaReminderScheduler accountId="local-account" />);
    act(() => vi.advanceTimersByTime(60_000));
    expect(mocks.removeAgendaReminder).not.toHaveBeenCalled();
    expect(mocks.toast).not.toHaveBeenCalled();

    mocks.preference = { status: 'ready', profile: { agendaRemindersEnabled: true } };
    rerender(<AgendaReminderScheduler accountId="local-account" />);
    act(() => vi.runOnlyPendingTimers());
    expect(mocks.toast).toHaveBeenCalledWith('Lembrete: atualização de dieta', expect.objectContaining({ duration: Infinity, closeButton: true }));
    expect(mocks.removeAgendaReminder).toHaveBeenCalledWith('local-account', 'reminder');
    expect(mocks.persistAgendaReminderChange).toHaveBeenCalledWith('local-account');
  });

  it('waits for the stored preference before delivering reminders', () => {
    mocks.preference = { status: 'loading', profile: { agendaRemindersEnabled: true } };
    render(<AgendaReminderScheduler accountId="local-account" />);
    expect(mocks.listAgendaReminders).not.toHaveBeenCalled();
  });
});
