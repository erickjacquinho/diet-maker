import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import { PatientApplicationError } from '@/lib/application/patients/patient-errors';
import { simpleDraftFixture } from '../../fixtures/diets';

const mocks = vi.hoisted(() => ({
  params: { id: 'patient-load', dietaId: 'diet-load' },
  push: vi.fn(),
  patientApplication: { getPatientProfile: vi.fn() },
  dietApplication: {
    openEditor: vi.fn(),
    listPreviousDietSources: vi.fn(),
    flushDraft: vi.fn(),
    saveDietAsActive: vi.fn(),
    reconcileUnknownSave: vi.fn(),
    autosaveDraft: vi.fn(),
    discardDraft: vi.fn(),
    pullTargets: vi.fn(),
    pullCompleteDiet: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mocks.patientApplication),
  getBrowserDietApplication: () => Promise.resolve(mocks.dietApplication),
  getBrowserProfileSession: () => ({
    isSaveAuthorized: () => true,
    registerPendingDraftFlush: () => () => undefined,
  }),
  preserveBrowserDietDraft: (_application: unknown, ...args: unknown[]) => mocks.dietApplication.flushDraft(...args),
}));

const patient = {
  id: 'patient-load',
  accountId: 'account-a',
  displayCode: 'P-0001',
  name: 'Paciente de teste',
  age: 30,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 64,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: 'Manutenção',
  defaultMacroTargets: { proteinG: 120, carbsG: 180, fatsG: 55, kcal: 1655 },
  createdAt: '2026-08-30T00:00:00.000Z',
  updatedAt: '2026-08-30T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

function openEditorResult() {
  return {
    draft: {
      ...structuredClone(simpleDraftFixture),
      draftId: 'draft-load',
      contextKey: 'account-a|patient-load|diet-load',
      patientId: 'patient-load',
      routeDietId: 'diet-load',
    },
    isNew: false,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.params.id = 'patient-load';
  mocks.params.dietaId = 'diet-load';
  mocks.patientApplication.getPatientProfile.mockResolvedValue({ patient, initials: 'PT', availableObjectives: ['Manutenção'] });
  mocks.dietApplication.openEditor.mockResolvedValue(openEditorResult());
  mocks.dietApplication.listPreviousDietSources.mockResolvedValue([]);
});

describe('diet editor load errors', () => {
  it('shows a missing patient and retries the profile load', async () => {
    mocks.patientApplication.getPatientProfile
      .mockRejectedValueOnce(new PatientApplicationError('NOT_FOUND', 'Paciente não encontrado nesta Conta.'))
      .mockResolvedValueOnce({ patient, initials: 'PT', availableObjectives: ['Manutenção'] });
    render(<DietBuilderPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Paciente não encontrado nesta Conta.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await screen.findByRole('main', { name: 'Elaboração de Dieta' });
    expect(mocks.patientApplication.getPatientProfile).toHaveBeenCalledTimes(2);
  });

  it('explains an archived patient from openEditor and offers a safe return', async () => {
    mocks.dietApplication.openEditor.mockRejectedValue(new DietDomainError('ARCHIVED_PATIENT', 'Paciente arquivado não pode abrir a edição.'));
    render(<DietBuilderPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Paciente arquivado não pode abrir a edição.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar à lista de pacientes' }));

    expect(mocks.push).toHaveBeenCalledWith('/pacientes');
  });

  it('explains a missing diet and offers a safe return', async () => {
    mocks.dietApplication.openEditor.mockRejectedValue(new DietDomainError('PATIENT_NOT_FOUND', 'A prescrição não foi encontrada nesta Conta/paciente.'));
    render(<DietBuilderPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('A prescrição não foi encontrada nesta Conta/paciente.');
    const backButton = screen.getByRole('button', { name: 'Voltar à ficha do paciente' });
    expect(backButton).toBeEnabled();
    fireEvent.click(backButton);
    expect(mocks.push).toHaveBeenCalledWith('/pacientes/patient-load');
  });

  it('preserves a persistence error and retries opening the editor', async () => {
    mocks.dietApplication.openEditor
      .mockRejectedValueOnce(new DietDomainError('PERSISTENCE_UNAVAILABLE', 'Armazenamento local indisponível.'))
      .mockResolvedValueOnce(openEditorResult());
    render(<DietBuilderPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Armazenamento local indisponível.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await screen.findByRole('main', { name: 'Elaboração de Dieta' });
    expect(mocks.dietApplication.openEditor).toHaveBeenCalledTimes(2);
  });
});
