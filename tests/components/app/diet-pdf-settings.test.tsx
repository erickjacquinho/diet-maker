import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProfessionalProfileSnapshot } from '@/lib/application/professional-profile-store';
import { parseProfessionalProfile } from '@/lib/domain/professional-profile';
import { clinicLogo } from '../../fixtures/clinic-logo';

const state = vi.hoisted(() => ({
  snapshot: { status: 'loading', profile: null, accountEmail: null, error: null } as ProfessionalProfileSnapshot,
  load: vi.fn(async () => undefined),
  savePdf: vi.fn(async () => undefined),
}));
const store = { getSnapshot: () => state.snapshot, subscribe: () => () => undefined, load: state.load };
vi.mock('@/lib/application/professional-profile-store', () => ({ getBrowserProfessionalProfileStore: () => store }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient', dietaId: 'nova' }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserDietApplication: async () => ({ openEditor: async () => ({ draft: { payload: { mode: 'SIMPLE' } } }) }),
  getBrowserPatientApplication: async () => ({ getPatientProfile: async () => ({ patient: {} }) }),
}));
vi.mock('@/lib/patientViewModel', () => ({ toPatientViewModel: () => ({ name: 'Maria Lima' }) }));
vi.mock('@/lib/application/diets/diet-pdf-view', () => ({
  buildDietPdfViewModel: () => ({ patientName: 'Maria Lima', prescriptionDate: '22/10/2026', prescriptionDateIso: '2026-10-22', meals: [], dayMacros: null }),
  createDietPdfFilename: () => 'dieta.pdf',
}));
vi.mock('html2pdf.js', () => ({ default: () => ({ set() { return this; }, from() { return this; }, save: state.savePdf }) }));

import DietPdfPreviewPage from '@/app/pacientes/[id]/dieta/[dietaId]/pdf/page';

describe('PDF settings integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.snapshot = {
      status: 'ready', accountEmail: 'ana@example.invalid', error: null,
      profile: parseProfessionalProfile({ firstName: 'Ana', lastName: 'Souza', averagePatientsPerMonth: 40, experience: { kind: 'years', value: 5 }, documentLogo: clinicLogo }),
    };
  });

  it('waits for the account profile and image decoding before exporting the clinic logo', async () => {
    const ready = state.snapshot;
    state.snapshot = { ...ready, status: 'loading', profile: null };
    let finishDecode!: () => void;
    const decode = vi.fn(() => new Promise<void>((resolve) => { finishDecode = resolve; }));
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { value: decode, configurable: true });
    const { rerender } = render(<DietPdfPreviewPage />);
    expect(await screen.findByRole('button', { name: 'Baixar PDF' })).toBeDisabled();
    state.snapshot = ready;
    rerender(<DietPdfPreviewPage />);
    expect(screen.getByRole('img', { name: 'Logotipo do consultório' })).toHaveAttribute('src', clinicLogo);
    fireEvent.click(screen.getByRole('button', { name: 'Baixar PDF' }));
    await waitFor(() => expect(decode).toHaveBeenCalledOnce());
    expect(state.savePdf).not.toHaveBeenCalled();
    await act(async () => finishDecode());
    await waitFor(() => expect(state.savePdf).toHaveBeenCalledOnce());
  });

  it('offers profile retry and does not export when the image cannot be decoded', async () => {
    const ready = state.snapshot;
    state.snapshot = { ...ready, status: 'error' };
    const { rerender } = render(<DietPdfPreviewPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(state.load).toHaveBeenCalledWith({ force: true });
    state.snapshot = ready;
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { value: vi.fn(async () => { throw new Error('Invalid PNG'); }), configurable: true });
    rerender(<DietPdfPreviewPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Baixar PDF' }));
    expect(await screen.findByText('Não foi possível gerar o PDF. Tente novamente.')).toBeInTheDocument();
    expect(state.savePdf).not.toHaveBeenCalled();
  });
});
