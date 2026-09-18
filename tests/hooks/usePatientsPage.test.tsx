import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientsPage } from '@/hooks/usePatientsPage';

const testState = vi.hoisted(() => ({
  listPage: vi.fn(async (_request: { pageIndex?: number; pageSize?: number; query?: string }) => ({ items: [] as unknown[], total: 0, pageIndex: 0, pageSize: 25 })),
  createPatient: vi.fn(async () => undefined),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: async () => ({
    listActivePatientsPage: testState.listPage,
    createPatient: testState.createPatient,
  }),
}));

const summary = {
  patient: {
    id: 'patient-page', accountId: 'account-page', displayCode: 'P-0001', name: 'Ana Lima', age: 32, gender: 'Feminino',
    birthDate: '1994-06-12', isPregnant: false, pregnancyDueDate: null, heightCm: 165, weightKg: 62,
    maritalStatus: null, phone: null, whatsapp: null, currentObjective: 'Manutenção',
    defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
    createdAt: '2026-09-17T10:00:00.000Z', updatedAt: '2026-09-17T10:00:00.000Z', version: 1, archivedAt: null,
  },
  initials: 'AL',
  related: { dietCount: 0, assessmentCount: 0 },
};

describe('usePatientsPage', () => {
  beforeEach(() => {
    testState.listPage.mockReset().mockImplementation(async (request) => ({
      items: [summary],
      total: 75,
      pageIndex: request.pageIndex ?? 0,
      pageSize: 25,
    }));
    testState.createPatient.mockReset();
  });

  it('loads bounded remote pages and resets to page zero when the search changes', async () => {
    const { result } = renderHook(() => usePatientsPage());
    await waitFor(() => expect(testState.listPage).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 25, query: '' }));

    act(() => result.current.setPageIndex(2));
    await waitFor(() => expect(testState.listPage).toHaveBeenLastCalledWith({ pageIndex: 2, pageSize: 25, query: '' }));
    act(() => result.current.setSearchTerm('Ana'));
    await waitFor(() => expect(testState.listPage).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 25, query: 'Ana' }));

    expect(result.current.pageIndex).toBe(0);
    expect(result.current.total).toBe(75);
    expect(result.current.patients.map((patient) => patient.id)).toEqual(['patient-page']);
  });

  it('keeps empty and read-error results distinct', async () => {
    testState.listPage.mockResolvedValueOnce({ items: [], total: 0, pageIndex: 0, pageSize: 25 });
    const empty = renderHook(() => usePatientsPage());
    await waitFor(() => expect(empty.result.current.isLoading).toBe(false));
    expect(empty.result.current).toMatchObject({ patients: [], total: 0, error: null });
    empty.unmount();

    testState.listPage.mockRejectedValueOnce(new Error('Falha local'));
    const failed = renderHook(() => usePatientsPage());
    await waitFor(() => expect(failed.result.current.error).toBe('Falha local'));
    expect(failed.result.current.patients).toEqual([]);
    expect(failed.result.current.isLoading).toBe(false);
  });
});
