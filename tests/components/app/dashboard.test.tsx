import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '@/app/dashboard/page';
import { getTodayDateKey } from '@/lib/patientListDateUtils';

const testState = vi.hoisted(() => {
  const state: any = {
    runtime: null,
    snapshot: { status: 'empty', runtime: null, accountId: null },
    listeners: new Set<() => void>(),
    applications: [] as Array<{ listActivePatients: () => Promise<unknown[]> }>,
    getApplication: vi.fn(),
  };
  state.subscribe = (listener: () => void) => {
    state.listeners.add(listener);
    return () => state.listeners.delete(listener);
  };
  state.getSnapshot = () => state.snapshot;
  state.session = { subscribe: state.subscribe, getSnapshot: state.getSnapshot };
  return state;
});

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => testState.session,
  getBrowserPatientRuntimeIfActive: () => testState.runtime,
  getBrowserPatientApplication: () => testState.getApplication(),
}));

vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    default: ({ href, children, ...props }: { href: string; children: ReactNode }) =>
      React.createElement('a', { href, ...props }, children),
  };
});

function patientSummary(
  id: string,
  name: string,
  dueDates?: Partial<Record<'DIET_UPDATE' | 'ASSESSMENT_UPDATE', string>>,
) {
  const types = Object.keys(dueDates ?? {}) as Array<'DIET_UPDATE' | 'ASSESSMENT_UPDATE'>;
  const dates = Object.values(dueDates ?? {}).filter((date): date is string => Boolean(date));
  return {
    patient: {
      id,
      accountId: id,
      displayCode: 'T-001',
      name,
      age: 32,
      gender: 'Feminino',
      birthDate: '1994-06-12',
      isPregnant: false,
      pregnancyDueDate: null,
      heightCm: 167,
      weightKg: 71.2,
      maritalStatus: null,
      phone: null,
      whatsapp: null,
      currentObjective: 'OBJETIVO CLÍNICO INTERNO',
      defaultMacroTargets: { proteinG: 111, carbsG: 202, fatsG: 56, kcal: 1800 },
      createdAt: '2026-01-01T12:00:00.000Z',
      updatedAt: '2026-01-01T12:00:00.000Z',
      version: 1,
      archivedAt: null,
    },
    initials: 'PT',
    related: { dietCount: 0, assessmentCount: 0 },
    clinical: dates.length ? {
      nextFollowUp: {
        accountId: id,
        patientId: id,
        dueDate: [...dates].sort()[0],
        dueDates,
        type: types,
        version: 1,
        createdAt: '2026-01-01T12:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
      },
      lastActivity: null,
      latestAssessment: null,
      previousAssessment: null,
      assessmentCount: 0,
      hasDiet: false,
    } : null,
  };
}

function makeRuntime(accountId: string, saveId = 'save-principal') {
  return { account: { id: accountId } };
}

function queueApplication(listActivePatients: () => Promise<unknown[]>) {
  testState.applications.push({ listActivePatients });
}

function setRuntime(runtime: ReturnType<typeof makeRuntime> | null) {
  act(() => {
    testState.runtime = runtime;
    testState.snapshot = {
      ...testState.snapshot,
      status: runtime ? 'active' : 'empty',
      runtime,
      accountId: runtime?.account.id ?? null,
    };
    [...testState.listeners].forEach((listener) => listener());
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  testState.runtime = null;
  testState.snapshot = { status: 'empty', runtime: null, accountId: null };
  testState.listeners.clear();
  testState.applications.length = 0;
  testState.getApplication.mockReset().mockImplementation(async () => {
    const application = testState.applications.shift();
    if (!application) throw new Error('Nenhuma aplicação de teste foi preparada.');
    return application;
  });
});

afterEach(() => vi.useRealTimers());

describe('DashboardPage', () => {
  it('waits for the account data and opens the subscription from the home page', () => {
    const openSubscription = vi.fn();
    window.addEventListener('nutridiet:open-subscription', openSubscription);

    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByText('Carregando sua semana…')).toBeInTheDocument();
    expect(screen.getByText('Assinatura — Em breve')).toBeInTheDocument();
    expect(testState.getApplication).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /saves/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar assinatura' }));
    expect(openSubscription).toHaveBeenCalledOnce();

    window.removeEventListener('nutridiet:open-subscription', openSubscription);
  });


  it('loads one authorized patient collection and shows only the appointment projection', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const listActivePatients = vi.fn().mockResolvedValue([
      patientSummary('test-patient', 'Paciente de teste', { DIET_UPDATE: getTodayDateKey(tomorrow) }),
    ]);
    queueApplication(listActivePatients);
    setRuntime(makeRuntime('test-account'));

    render(<DashboardPage />);

    expect(await screen.findByText('Paciente de teste')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Semana corrente' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Semana corrente' })).getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByRole('list', { name: 'Próximas ações' })).toHaveTextContent('Atualização de dieta');
    expect(screen.getByRole('link', { name: 'Abrir agenda' })).toHaveAttribute('href', '/agenda');
    expect(screen.queryByText('167')).not.toBeInTheDocument();
    expect(screen.queryByText('71.2')).not.toBeInTheDocument();
    expect(screen.queryByText('OBJETIVO CLÍNICO INTERNO')).not.toBeInTheDocument();
    expect(listActivePatients).toHaveBeenCalledOnce();
  });

  it('distinguishes empty, loading, error, and retry without retaining an old runtime result', async () => {
    const emptyRead = deferred<unknown[]>();
    queueApplication(() => emptyRead.promise);
    setRuntime(makeRuntime('same-account'));
    const { rerender } = render(<DashboardPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando sua semana');
    await act(async () => { emptyRead.resolve([]); await emptyRead.promise; });
    expect(await screen.findByText('Nenhum acompanhamento nesta semana.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma próxima ação nesta semana.')).toBeInTheDocument();

    const failedRead = vi.fn().mockRejectedValue(new Error('Falha de leitura controlada.'));
    queueApplication(failedRead);
    setRuntime(makeRuntime('same-account'));
    rerender(<DashboardPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de leitura controlada.');
    expect(screen.queryByText('Nenhuma próxima ação nesta semana.')).not.toBeInTheDocument();
    const recoveredRead = vi.fn().mockResolvedValue([
      patientSummary('recovered', 'Paciente recuperado', { ASSESSMENT_UPDATE: getTodayDateKey() }),
    ]);
    queueApplication(recoveredRead);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Paciente recuperado')).toBeInTheDocument();
    expect(recoveredRead).toHaveBeenCalledOnce();
  });

  it('clears results across runtime changes, ignores a late response, and unmounts when authorization is lost', async () => {
    const oldRead = deferred<unknown[]>();
    const oldList = vi.fn(() => oldRead.promise);
    queueApplication(oldList);
    const firstRuntime = makeRuntime('same-account', 'same-save');
    setRuntime(firstRuntime);
    const view = render(<DashboardPage />);
    await waitFor(() => expect(oldList).toHaveBeenCalledOnce());

    const newRead = deferred<unknown[]>();
    const newList = vi.fn(() => newRead.promise);
    queueApplication(newList);
    setRuntime(makeRuntime('same-account', 'same-save'));
    view.rerender(<DashboardPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando sua semana');
    expect(screen.queryByText('Paciente do runtime anterior')).not.toBeInTheDocument();
    await waitFor(() => expect(newList).toHaveBeenCalledOnce());

    await act(async () => {
      newRead.resolve([patientSummary('new', 'Paciente do runtime atual', { DIET_UPDATE: getTodayDateKey() })]);
      await newRead.promise;
    });
    expect(await screen.findByText('Paciente do runtime atual')).toBeInTheDocument();
    await act(async () => {
      oldRead.resolve([patientSummary('old', 'Paciente do runtime anterior', { ASSESSMENT_UPDATE: getTodayDateKey() })]);
      await oldRead.promise;
    });
    expect(screen.getByText('Paciente do runtime atual')).toBeInTheDocument();
    expect(screen.queryByText('Paciente do runtime anterior')).not.toBeInTheDocument();

    const otherAccountRead = vi.fn().mockResolvedValue([
      patientSummary('other', 'Paciente de outra conta', { DIET_UPDATE: getTodayDateKey() }),
    ]);
    queueApplication(otherAccountRead);
    setRuntime(makeRuntime('other-account', 'other-save'));
    view.rerender(<DashboardPage />);
    expect(await screen.findByText('Paciente de outra conta')).toBeInTheDocument();
    expect(screen.queryByText('Paciente do runtime atual')).not.toBeInTheDocument();

    setRuntime(null);
    view.rerender(<DashboardPage />);
    expect(screen.queryByText('Paciente de outra conta')).not.toBeInTheDocument();
    expect(testState.getApplication).toHaveBeenCalledTimes(3);
  });

  it('recalculates today on focus without reading the patient collection again', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 23, 55));
    const listActivePatients = vi.fn().mockResolvedValue([
      patientSummary('today', 'Paciente de quarta', { DIET_UPDATE: '2026-11-04' }),
      patientSummary('tomorrow', 'Paciente de quinta', { ASSESSMENT_UPDATE: '2026-11-05' }),
    ]);
    queueApplication(listActivePatients);
    setRuntime(makeRuntime('test-account'));
    render(<DashboardPage />);
    await flushPromises();

    expect(screen.getByText('Paciente de quarta')).toBeInTheDocument();
    expect(screen.getByText('Paciente de quinta')).toBeInTheDocument();
    vi.setSystemTime(new Date(2026, 10, 5, 0, 1));
    fireEvent.focus(window);
    await flushPromises();

    expect(screen.queryByText('Paciente de quarta')).not.toBeInTheDocument();
    expect(screen.getByText('Paciente de quinta')).toBeInTheDocument();
    expect(listActivePatients).toHaveBeenCalledOnce();
  });
});
