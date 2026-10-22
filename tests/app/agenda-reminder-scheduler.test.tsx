import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listAgendaReminders: vi.fn(),
  removeAgendaReminder: vi.fn(),
  persistAgendaReminderChange: vi.fn(),
}));

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
  beforeEach(() => vi.clearAllMocks());

  it('does not read or change reminders without an active local account', () => {
    render(<AgendaReminderScheduler accountId={null} />);

    expect(mocks.listAgendaReminders).not.toHaveBeenCalled();
    expect(mocks.removeAgendaReminder).not.toHaveBeenCalled();
    expect(mocks.persistAgendaReminderChange).not.toHaveBeenCalled();
  });
});
