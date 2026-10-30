import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { useDietBuilderPage } from '@/hooks/useDietBuilderPage';
import { simpleDraftFixture } from '../fixtures/diets';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  patientApplication: { getPatientProfile: vi.fn() },
  dietApplication: {
    openEditor: vi.fn(),
    listPreviousDietSources: vi.fn(),
    autosaveDraft: vi.fn(),
    flushDraft: vi.fn(),
    saveDietAsActive: vi.fn(),
    reconcileUnknownSave: vi.fn(),
    discardDraft: vi.fn(),
    pullTargets: vi.fn(),
    pullCompleteDiet: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-save', dietaId: 'diet-save' }),
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mocks.patientApplication),
  getBrowserDietApplication: () => Promise.resolve(mocks.dietApplication),
  getBrowserProfileSession: () => ({
    isReady: () => true,
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const patient = {
  id: 'patient-save',
  accountId: 'account-a',
  displayCode: 'P-0001',
  name: 'Paciente Teste',
  age: 30,
  gender: 'Feminino',
  heightCm: 170,
  weightKg: 70,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 140, carbsG: 220, fatsG: 60, kcal: 2000 },
  createdAt: '2026-08-28T00:00:00.000Z',
  updatedAt: '2026-08-28T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.patientApplication.getPatientProfile.mockResolvedValue({ patient, initials: 'PT', availableObjectives: ['Manutenção'] });
  mocks.dietApplication.openEditor.mockResolvedValue({
    draft: {
      ...structuredClone(simpleDraftFixture),
      draftId: 'draft-save',
      contextKey: 'account-a|patient-save|diet-save',
      patientId: 'patient-save',
      routeDietId: 'diet-save',
    },
    isNew: false,
  });
  mocks.dietApplication.listPreviousDietSources.mockResolvedValue([]);
  mocks.dietApplication.flushDraft.mockResolvedValue({ status: 'SAVED', revision: 3, updatedAt: '2026-08-30T12:00:00.000Z' });
});

async function loadPageHook() {
  const hook = renderHook(() => useDietBuilderPage());
  await waitFor(() => expect(hook.result.current.dietPlan?.id).toBe('diet-save'));
  return hook;
}

describe('useDietBuilderPage save outcome recovery', () => {
  it('reconciles RESULT_UNKNOWN before returning a confirmed commit without resubmitting', async () => {
    mocks.dietApplication.saveDietAsActive.mockResolvedValue({ status: 'RESULT_UNKNOWN', draftId: 'draft-save', message: 'Resultado incerto.' });
    mocks.dietApplication.reconcileUnknownSave.mockResolvedValue({ status: 'COMMITTED', draftId: 'draft-save', planId: 'diet-stable', version: 1, confirmedDraftRevision: 3 });
    const { result } = await loadPageHook();

    await act(async () => { await result.current.handleSaveDiet(); });

    expect(mocks.dietApplication.reconcileUnknownSave).toHaveBeenCalledWith('draft-save', 3);
    expect(mocks.dietApplication.saveDietAsActive).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/pacientes/patient-save');
  });

  it('returns to the profile on CHECKPOINT_PENDING without resubmitting the diet', async () => {
    mocks.dietApplication.saveDietAsActive.mockResolvedValue({
      status: 'CHECKPOINT_PENDING', draftId: 'draft-save', message: 'Prescrição confirmada; checkpoint pendente.',
      localOutcome: { status: 'COMMITTED', draftId: 'draft-save', planId: 'diet-stable', version: 1, confirmedDraftRevision: 3, message: 'Prescrição confirmada.' },
    });
    const { result } = await loadPageHook();

    await act(async () => { await result.current.handleSaveDiet(); });

    expect(mocks.push).toHaveBeenCalledWith('/pacientes/patient-save');
    expect(mocks.dietApplication.saveDietAsActive).toHaveBeenCalledTimes(1);
    expect(mocks.dietApplication.reconcileUnknownSave).not.toHaveBeenCalled();
  });

  it('offers cleanup-only retry for CLEANUP_PENDING without resubmitting the diet', async () => {
    mocks.dietApplication.saveDietAsActive.mockResolvedValue({
      status: 'CLEANUP_PENDING', draftId: 'draft-save', planId: 'diet-stable', version: 1,
      confirmedDraftRevision: 3, message: 'Prescrição confirmada; limpeza pendente.',
    });
    mocks.dietApplication.reconcileUnknownSave.mockResolvedValue({ status: 'COMMITTED', draftId: 'draft-save', planId: 'diet-stable', version: 1, confirmedDraftRevision: 3 });
    const { result } = await loadPageHook();

    await act(async () => { await result.current.handleSaveDiet(); });

    const warningCall = vi.mocked(toast.warning).mock.calls.find(([message]) => message === 'Prescrição confirmada; limpeza pendente.');
    expect(warningCall?.[1]).toMatchObject({ action: { label: 'Tentar limpar rascunho' } });
    const action = warningCall?.[1]?.action;
    if (typeof action !== 'object' || action === null || !('onClick' in action) || typeof action.onClick !== 'function') {
      throw new Error('A ação de cleanup não foi apresentada.');
    }
    await act(async () => { action.onClick({} as never); });
    await waitFor(() => expect(mocks.dietApplication.reconcileUnknownSave).toHaveBeenCalledWith('draft-save', 3, { cleanupOnly: true }));

    expect(mocks.dietApplication.saveDietAsActive).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/pacientes/patient-save');
  });

  it('keeps cleanup-only recovery available when checkpoint and cleanup are both pending', async () => {
    mocks.dietApplication.saveDietAsActive.mockResolvedValue({
      status: 'CHECKPOINT_PENDING', draftId: 'draft-save', message: 'Checkpoint e limpeza pendentes.',
      localOutcome: { status: 'CLEANUP_PENDING', draftId: 'draft-save', planId: 'diet-stable', version: 1, confirmedDraftRevision: 3, message: 'Limpeza pendente.' },
    });
    mocks.dietApplication.reconcileUnknownSave.mockResolvedValue({ status: 'COMMITTED', draftId: 'draft-save', planId: 'diet-stable', version: 1, confirmedDraftRevision: 3 });
    const { result } = await loadPageHook();

    await act(async () => { await result.current.handleSaveDiet(); });

    const errorCall = vi.mocked(toast.error).mock.calls.find(([message]) => message === 'Checkpoint e limpeza pendentes.');
    expect(errorCall?.[1]).toMatchObject({ action: { label: 'Tentar limpar rascunho' } });
    const action = errorCall?.[1]?.action;
    if (typeof action !== 'object' || action === null || !('onClick' in action) || typeof action.onClick !== 'function') {
      throw new Error('A ação de cleanup não foi apresentada.');
    }
    await act(async () => { action.onClick({} as never); });
    await waitFor(() => expect(mocks.dietApplication.reconcileUnknownSave).toHaveBeenCalledWith('draft-save', 3, { cleanupOnly: true }));

    expect(mocks.dietApplication.saveDietAsActive).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/pacientes/patient-save');
  });
});
