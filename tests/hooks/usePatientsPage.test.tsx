import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientsPage } from '@/hooks/usePatientsPage';

const testState = vi.hoisted(() => ({
  listAll: vi.fn(),
  createPatient: vi.fn(async () => undefined),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: async () => ({
    listActivePatients: testState.listAll,
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
    testState.listAll.mockReset().mockResolvedValue([summary]);
    testState.createPatient.mockReset();
  });

  it('loads the complete list once and filters it locally', async () => {
    const summaries = Array.from({ length: 30 }, (_, index) => ({
      ...summary,
      patient: {
        ...summary.patient,
        id: `patient-${index}`,
        name: index === 0 ? 'Ana Lima' : `Paciente ${index}`,
      },
    }));
    testState.listAll.mockResolvedValueOnce(summaries);
    const { result } = renderHook(() => usePatientsPage());
    await waitFor(() => expect(result.current.rows).toHaveLength(30));

    act(() => result.current.setSearchTerm('Ana'));

    expect(testState.listAll).toHaveBeenCalledTimes(1);
    expect(result.current.total).toBe(1);
    expect(result.current.filteredPatients.map((patient) => patient.id)).toEqual(['patient-0']);
  });

  it('keeps empty and read-error results distinct', async () => {
    testState.listAll.mockResolvedValueOnce([]);
    const empty = renderHook(() => usePatientsPage());
    await waitFor(() => expect(empty.result.current.isLoading).toBe(false));
    expect(empty.result.current).toMatchObject({ patients: [], total: 0, error: null });
    empty.unmount();

    testState.listAll.mockRejectedValueOnce(new Error('Falha local'));
    const failed = renderHook(() => usePatientsPage());
    await waitFor(() => expect(failed.result.current.error).toBe('Falha local'));
    expect(failed.result.current.patients).toEqual([]);
    expect(failed.result.current.isLoading).toBe(false);
  });
});
