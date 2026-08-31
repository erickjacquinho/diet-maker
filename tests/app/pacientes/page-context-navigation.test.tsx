import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import DedicatedConsultationPage from '@/app/pacientes/[id]/consulta/[date]/page';
import type { Patient } from '@/lib/patientsStore';
import { createInitialDietPlan } from '@/lib/dietStore';
import { toEditableDocument } from '@/lib/application/diets/legacy-diet-adapter';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makePatientProfileState } from './profileState';

const routeParams: Record<string, string> = {};
const router = { push: vi.fn(), replace: vi.fn() };

vi.mock('next/navigation', () => ({
  useParams: () => routeParams,
  useRouter: () => router,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

const patient: Patient = {
  id: 'patient-context-1',
  name: 'Ana Lima',
  age: 32,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 62,
  targetKcal: 1800,
  targetProtein: 110,
  targetCarbs: 200,
  targetFats: 55,
  objective: 'Manutenção',
  lastConsultation: '03/08/2026',
  initials: 'AL',
  nextEvent: null,
  lastActivity: null,
};

const canonicalPatient = {
  id: patient.id,
  accountId: 'account-context',
  displayCode: 'P-0001',
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  heightCm: patient.heightCm,
  weightKg: patient.weightKg,
  maritalStatus: null,
  phone: null,
  whatsapp: null,
  currentObjective: patient.objective,
  defaultMacroTargets: {
    proteinG: patient.targetProtein,
    carbsG: patient.targetCarbs,
    fatsG: patient.targetFats,
    kcal: patient.targetKcal,
  },
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  version: 1,
  archivedAt: null,
};

const initialDietPlan = createInitialDietPlan(patient.id, {
  weightKg: patient.weightKg,
  targetKcal: patient.targetKcal,
  targetProtein: patient.targetProtein,
  targetCarbs: patient.targetCarbs,
  targetFats: patient.targetFats,
});

const mockPatientApplication = {
  getPatientProfile: vi.fn().mockResolvedValue({
    patient: canonicalPatient,
    initials: patient.initials,
    availableObjectives: [patient.objective],
  }),
};

const mockDietApplication = {
  openEditor: vi.fn().mockResolvedValue({
    draft: {
      draftId: 'draft-context',
      contextKey: `account-context|${patient.id}|nova`,
      accountId: 'account-context',
      patientId: patient.id,
      routeDietId: 'nova',
      payloadSchemaVersion: 1,
      draftRevision: 1,
      state: 'EDITABLE' as const,
      payload: toEditableDocument(initialDietPlan),
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    },
    isNew: true,
  }),
  listPreviousDietSources: vi.fn().mockResolvedValue([]),
  autosaveDraft: vi.fn().mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: '2026-08-30T00:00:00.000Z' }),
  flushDraft: vi.fn().mockResolvedValue({ status: 'SAVED', revision: 2, updatedAt: '2026-08-30T00:00:00.000Z' }),
  saveDietAsActive: vi.fn(),
  discardDraft: vi.fn(),
};

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientApplication: () => Promise.resolve(mockPatientApplication),
  getBrowserDietApplication: () => Promise.resolve(mockDietApplication),
}));

describe('contextual header navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('nutridiet_patients', JSON.stringify([patient]));
    vi.clearAllMocks();
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      patient: {
        ...makePatientProfileState().patient,
        id: patient.id,
        name: patient.name,
        objective: patient.objective,
        phone: patient.phone,
        whatsapp: patient.whatsapp,
      },
      patientId: patient.id,
    }));
    Object.keys(routeParams).forEach((key) => delete routeParams[key]);
  });

  it('uses the patient name and /pacientes as the profile parent', async () => {
    Object.assign(routeParams, { id: patient.id });

    render(<PatientDetailPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Perfil do paciente' });
    const header = heading.closest('header');
    expect(header).not.toBeNull();
    expect(within(header as HTMLElement).getByRole('link', { name: 'Voltar para Pacientes' })).toHaveAttribute(
      'href',
      '/pacientes',
    );
    expect(within(header as HTMLElement).getByRole('link', { name: 'Pacientes' })).toHaveAttribute(
      'href',
      '/pacientes',
    );
    expect(within(header as HTMLElement).getByText('Ana Lima')).toHaveAttribute('aria-current', 'page');
  });

  it('uses Dieta as the current label for a new diet without exposing nova', async () => {
    Object.assign(routeParams, { id: patient.id, dietaId: 'nova' });

    render(<DietBuilderPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Elaboração de Dieta' });
    const header = heading.closest('header');
    expect(header).not.toBeNull();
    expect(within(header as HTMLElement).getByRole('button', { name: 'Voltar para a ficha de Ana Lima' })).toBeEnabled();
    expect(within(header as HTMLElement).getByText('Dieta')).toHaveAttribute('aria-current', 'page');
    expect(within(header as HTMLElement).queryByText('nova', { exact: true })).not.toBeInTheDocument();
    expect(within(header as HTMLElement).getByRole('button', { name: 'Salvar Prescrição' })).toBeEnabled();
  });

  it('keeps consultation navigation working without a linked diet', async () => {
    Object.assign(routeParams, { id: patient.id, date: '2026-08-04' });

    render(<DedicatedConsultationPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Registro de Consulta — 2026/08/04' });
    const header = heading.closest('header');
    expect(header).not.toBeNull();
    expect(within(header as HTMLElement).getByRole('link', { name: 'Voltar para a ficha de Ana Lima' })).toHaveAttribute(
      'href',
      `/pacientes/${patient.id}`,
    );
    expect(within(header as HTMLElement).getByText('Consulta')).toHaveAttribute('aria-current', 'page');
    expect(within(header as HTMLElement).queryByRole('link', { name: /Dieta/i })).not.toBeInTheDocument();
  });

  it('keeps consultation actions available without reintroducing legacy diet actions', async () => {
    localStorage.setItem(
      `nutridiet_diets_${patient.id}`,
      JSON.stringify([{ id: 'diet-linked', name: 'Plano atual', createdAt: '2026/08/04', simpleMeals: [] }]),
    );
    Object.assign(routeParams, { id: patient.id, date: '2026-08-04' });

    render(<DedicatedConsultationPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Registro de Consulta — 2026/08/04' });
    const header = heading.closest('header') as HTMLElement;
    const printButton = within(header).getByRole('button', { name: 'Imprimir Prontuário' });

    expect(printButton).toBeEnabled();
    expect(within(header).queryByRole('link', { name: 'Abrir no Construtor de Dietas' })).not.toBeInTheDocument();
    fireEvent.click(printButton);
  });

  it('keeps the missing-patient state with a deterministic /pacientes return', async () => {
    localStorage.clear();
    Object.assign(routeParams, { id: 'missing-patient' });

    render(<PatientDetailPage />);

    expect(await screen.findByRole('link', { name: 'Voltar para Pacientes' })).toHaveAttribute(
      'href',
      '/pacientes',
    );
  });

  it('does not create a route-level header for the food search modal', async () => {
    Object.assign(routeParams, { id: patient.id, dietaId: 'nova' });

    render(<DietBuilderPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Elaboração de Dieta' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(heading.closest('header')).toBe(screen.getByRole('banner'));
  });
});
