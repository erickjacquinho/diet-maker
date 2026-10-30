import { beforeEach, describe, expect, it, vi } from 'vitest';

const agendaApi = vi.hoisted(() => ({ listReminders: vi.fn(), putReminder: vi.fn(), removeReminder: vi.fn() }));
const favoritesApi = vi.hoisted(() => ({ list: vi.fn(), set: vi.fn() }));
const patientsApi = vi.hoisted(() => ({ create: vi.fn(), get: vi.fn(), search: vi.fn(), update: vi.fn(), archive: vi.fn(), restore: vi.fn(), summaries: vi.fn() }));
const objectivesApi = vi.hoisted(() => ({ list: vi.fn(), add: vi.fn(), archive: vi.fn() }));
vi.mock('@/lib/api-client/agenda', () => ({ agendaApi, favoritesApi }));
vi.mock('@/lib/api-client/patients', () => ({ patientsApi }));
vi.mock('@/lib/api-client/objectives', () => ({ objectivesApi }));

import { createOnlinePreferences } from '@/lib/application/online-preferences';
import { createOnlineProfileSession } from '@/lib/application/online-profile-session';
import { createOnlinePatientRuntime } from '@/lib/application/browser-composition';
import { getFavoritesFromStorage, setFavoritesFromStorage } from '@/lib/library-ui-adapter';
import { readAgendaReminders, replaceAgendaReminders } from '@/lib/agenda-reminders';
import type { Account } from '@/lib/domain/account';

const ACCOUNT_ID = 'user-1';
const account: Account = { id: ACCOUNT_ID, displayName: 'Dra. Ana', phone: null, createdAt: 'a', updatedAt: 'a' };
const reminder = (id: string, date = '2026-04-01') => ({ id, date, time: '09:00', task: 'diet-update' as const });

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  setFavoritesFromStorage([], ACCOUNT_ID);
  favoritesApi.list.mockResolvedValue({ foodIds: [] });
  agendaApi.listReminders.mockResolvedValue({ items: [] });
  favoritesApi.set.mockResolvedValue({});
  agendaApi.putReminder.mockResolvedValue({});
  agendaApi.removeReminder.mockResolvedValue({});
});

describe('createOnlinePreferences', () => {
  it('hydrates the synchronous caches from the account', async () => {
    favoritesApi.list.mockResolvedValue({ foodIds: ['taco-1', 'taco-2'] });
    agendaApi.listReminders.mockResolvedValue({ items: [reminder('r1')] });
    await createOnlinePreferences(ACCOUNT_ID).hydrate();
    expect(getFavoritesFromStorage(ACCOUNT_ID).sort()).toEqual(['taco-1', 'taco-2']);
    expect(readAgendaReminders(ACCOUNT_ID)).toEqual([reminder('r1')]);
  });

  it('pushes only what changed since the last known server state', async () => {
    favoritesApi.list.mockResolvedValue({ foodIds: ['taco-1'] });
    agendaApi.listReminders.mockResolvedValue({ items: [reminder('keep'), reminder('move'), reminder('drop')] });
    const preferences = createOnlinePreferences(ACCOUNT_ID);
    await preferences.hydrate();

    setFavoritesFromStorage(['taco-2'], ACCOUNT_ID); // taco-1 removed, taco-2 added
    replaceAgendaReminders(ACCOUNT_ID, [reminder('keep'), reminder('move', '2026-05-01'), reminder('new')]);
    await preferences.push();

    expect(favoritesApi.set.mock.calls.map((call) => call.join(':')).sort()).toEqual(['taco-1:false', 'taco-2:true']);
    expect(agendaApi.putReminder.mock.calls.map((call) => call[0].id).sort()).toEqual(['move', 'new']);
    expect(agendaApi.removeReminder).toHaveBeenCalledOnce();
    expect(agendaApi.removeReminder).toHaveBeenCalledWith('drop');

    favoritesApi.set.mockClear();
    agendaApi.putReminder.mockClear();
    agendaApi.removeReminder.mockClear();
    await preferences.push(); // nothing left to send
    expect(favoritesApi.set).not.toHaveBeenCalled();
    expect(agendaApi.putReminder).not.toHaveBeenCalled();
    expect(agendaApi.removeReminder).not.toHaveBeenCalled();
  });

  it('remembers what the server accepted, so a retry resends only what failed', async () => {
    const preferences = createOnlinePreferences(ACCOUNT_ID);
    await preferences.hydrate();
    setFavoritesFromStorage(['taco-1', 'taco-2'], ACCOUNT_ID);
    favoritesApi.set.mockImplementation(async (foodId: string) => {
      if (foodId === 'taco-2') throw new Error('offline');
      return {};
    });
    await expect(preferences.push()).rejects.toThrow('offline');
    favoritesApi.set.mockClear();
    favoritesApi.set.mockResolvedValue({});
    await preferences.push();
    expect(favoritesApi.set.mock.calls).toEqual([['taco-2', true]]);
  });

  it('serializes overlapping pushes', async () => {
    const preferences = createOnlinePreferences(ACCOUNT_ID);
    await preferences.hydrate();
    const order: string[] = [];
    favoritesApi.set.mockImplementation(async (foodId: string) => {
      order.push(`start:${foodId}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(`end:${foodId}`);
      return {};
    });
    setFavoritesFromStorage(['taco-1'], ACCOUNT_ID);
    const first = preferences.push();
    await new Promise((resolve) => setTimeout(resolve, 0)); // the first push is now in flight
    setFavoritesFromStorage(['taco-1', 'taco-2'], ACCOUNT_ID);
    const second = preferences.push();
    await Promise.all([first, second]);
    expect(order).toEqual(['start:taco-1', 'end:taco-1', 'start:taco-2', 'end:taco-2']);
  });
});

describe('createOnlineProfileSession', () => {
  function build(overrides: Partial<Parameters<typeof createOnlineProfileSession>[0]> = {}) {
    const runtime = { account };
    const dependencies = {
      loadAccount: vi.fn(async () => account),
      createRuntime: vi.fn(async () => runtime),
      activateRuntime: vi.fn(),
      disposeRuntime: vi.fn(async () => undefined),
      ...overrides,
    } as never;
    return { session: createOnlineProfileSession<never>(dependencies), runtime, dependencies: dependencies as Record<string, ReturnType<typeof vi.fn>> };
  }

  it('opens the account by itself, once, and exposes the runtime', async () => {
    const { session, runtime, dependencies } = build();
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', hydration: 'pending', runtime: null });
    expect(session.isReady()).toBe(false);
    const seen: string[] = [];
    session.subscribe((snapshot) => seen.push(snapshot.status));
    await Promise.all([session.loadProfile(), session.loadProfile()]);
    expect(dependencies.createRuntime).toHaveBeenCalledOnce();
    expect(dependencies.activateRuntime).toHaveBeenCalledWith(runtime);
    expect(session.getSnapshot()).toMatchObject({ status: 'active', accountId: ACCOUNT_ID, hydration: 'ready' });
    expect(session.isReady()).toBe(true);
    expect(seen).toEqual(['busy', 'active']);
    await session.loadProfile(); // already open: no new work
    expect(dependencies.createRuntime).toHaveBeenCalledOnce();
  });

  it('reports a failed open and lets the user try again', async () => {
    const loadAccount = vi.fn().mockRejectedValueOnce(new Error('sessão expirada')).mockResolvedValue(account);
    const { session } = build({ loadAccount });
    await expect(session.loadProfile()).rejects.toThrow('sessão expirada');
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', hydration: 'ready', error: 'sessão expirada', runtime: null });
    await session.loadProfile();
    expect(session.getSnapshot()).toMatchObject({ status: 'active', error: null });
  });

  it('closes the runtime on sign out', async () => {
    const { session, runtime, dependencies } = build();
    await session.loadProfile();
    await session.signOut();
    expect(dependencies.disposeRuntime).toHaveBeenCalledWith(runtime);
    expect(session.getSnapshot()).toMatchObject({ status: 'empty', runtime: null });
    expect(session.isReady()).toBe(false);
  });

  it('syncs preferences through the injected hook', async () => {
    const sync = vi.fn(async () => undefined);
    const { session } = build({ sync });
    await session.sync();
    expect(sync).toHaveBeenCalledOnce();
  });
});

describe('createOnlinePatientRuntime', () => {
  const patientDto = (id: string) => ({
    id, displayCode: 'P-0001', name: 'Maria Souza', age: 35, gender: 'Feminino', birthDate: '1990-05-10', isPregnant: false, pregnancyDueDate: null,
    heightCm: 165, weightKg: 62, maritalStatus: null, phone: '11987654321', whatsapp: null, currentObjective: 'Cutting',
    defaultMacroTargets: { proteinG: null, carbsG: null, fatsG: null, kcal: null }, createdAt: 'a', updatedAt: 'b', version: 1, archivedAt: null,
  });

  it('wires the applications to the API with client-generated UUIDs', async () => {
    const runtime = await createOnlinePatientRuntime(account);
    expect(favoritesApi.list).toHaveBeenCalledOnce();

    patientsApi.create.mockImplementation(async (id: string) => patientDto(id));
    const created = await runtime.application.createPatient({
      name: 'Maria Souza', gender: 'Feminino', birthDate: '1990-05-10', heightCm: 165, weightKg: 62, phone: '11987654321', whatsapp: '11987654321', currentObjective: 'Cutting',
    } as never);
    const [id, input] = patientsApi.create.mock.calls[0];
    expect(id).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i);
    expect(input).toMatchObject({ name: 'Maria Souza' });
    expect(created).toMatchObject({ id, accountId: ACCOUNT_ID, name: 'Maria Souza' });
  });

  it('builds the patient list from one search plus batched summaries', async () => {
    const runtime = await createOnlinePatientRuntime(account);
    patientsApi.search.mockResolvedValue({ items: [patientDto('p1')], total: 1, pageIndex: 0, pageSize: 25 });
    patientsApi.summaries.mockResolvedValue({ items: [{
      patientId: 'p1', dietCount: 2, assessmentCount: 3, latestAssessment: null, previousAssessment: null, nextFollowUp: null,
      lastActivity: { eventDate: '2026-03-01', confirmedAt: 'c', type: 'diet', sourceId: 'd1' },
    }] });
    const page = await runtime.application.listActivePatientsPage({ query: '', pageIndex: 0, pageSize: 25 } as never);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({ related: { dietCount: 2 }, clinical: { dietCount: 2, hasDiet: true } });
    expect(patientsApi.search).toHaveBeenCalledOnce();
    expect(patientsApi.summaries.mock.calls.every((call) => call[0].length <= 25)).toBe(true);
  });

  it('pushes preference changes to the account', async () => {
    const runtime = await createOnlinePatientRuntime(account);
    setFavoritesFromStorage(['taco-7'], ACCOUNT_ID);
    await runtime.pushPreferences();
    expect(favoritesApi.set).toHaveBeenCalledWith('taco-7', true);
  });
});
