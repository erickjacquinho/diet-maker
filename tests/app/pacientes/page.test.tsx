import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { buildPatientListRows } from '@/lib/patientListView';
import PatientsListPage from '@/app/pacientes/page';
import { usePatientsPage } from '@/hooks/usePatientsPage';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/hooks/usePatientsPage', () => ({
  usePatientsPage: vi.fn(),
}));

const patient: PatientViewModel = {
  id: 'patient-page-1',
  accountId: 'account-page',
  version: 1,
  archivedAt: null,
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
  nextEvent: { date: '2026-08-03', type: 'assessment-update' },
  lastActivity: null,
};

const mockUsePatientsPage = vi.mocked(usePatientsPage);

function state(overrides: Partial<ReturnType<typeof usePatientsPage>> = {}) {
  const patients = overrides.patients ?? [patient];
  const filteredPatients = overrides.filteredPatients ?? patients;
  return {
    patients,
    filteredPatients,
    rows: overrides.rows ?? buildPatientListRows(filteredPatients, '2026-08-01'),
    patientHistoryById: {},
    searchTerm: '',
    setSearchTerm: vi.fn(),
    isLoading: false,
    error: null,
    retry: vi.fn(),
    createPatient: vi.fn(),
    ...overrides,
  };
}

describe('PatientsListPage', () => {
  beforeEach(() => {
    push.mockClear();
    mockUsePatientsPage.mockReturnValue(state());
  });

  it('keeps search, live count and the new-patient action in the toolbar', async () => {
    render(<PatientsListPage />);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar pacientes por nome ou objetivo' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 paciente');
    expect(screen.getByRole('button', { name: 'Novo paciente' })).toBeInTheDocument();
    expect(screen.queryByText('Prioridade do acompanhamento')).not.toBeInTheDocument();
    expect(screen.queryByText('Lista de pacientes', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByTestId('record-indicators').querySelector('[data-indicator="assessment"]')).toHaveClass('text-text-muted');
  });

  it('opens the existing registration dialog from the toolbar', async () => {
    render(<PatientsListPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Novo paciente' }));

    expect(screen.getByRole('dialog', { name: 'Cadastrar Novo Paciente' })).toBeInTheDocument();
    const whatsappField = screen.getByRole('textbox', { name: 'WhatsApp' });
    fireEvent.change(whatsappField, { target: { value: '11999999999' } });
    expect(whatsappField).toHaveValue('(11) 99999-9999');
  });

  it('shows a reset action when search returns no patients', async () => {
    const setSearchTerm = vi.fn();
    mockUsePatientsPage.mockReturnValue(state({ filteredPatients: [], setSearchTerm }));
    render(<PatientsListPage />);

    const search = await screen.findByRole('searchbox', { name: 'Buscar pacientes por nome ou objetivo' });
    fireEvent.change(search, { target: { value: 'inexistente' } });

    expect(screen.getByText('Nenhum paciente encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar busca' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(setSearchTerm).toHaveBeenCalledWith('');
  });

  it('keeps the empty-list guidance available when there are no patients', async () => {
    mockUsePatientsPage.mockReturnValue(state({ patients: [], filteredPatients: [], rows: [] }));
    render(<PatientsListPage />);

    expect(await screen.findByText('Nenhum paciente cadastrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar Primeiro Paciente' })).toBeInTheDocument();
  });

  it('does not infer clinical history from the patient activity projection', async () => {
    const row = buildPatientListRows([{
      ...patient,
      nextEvent: null,
      lastActivity: { at: '2026-08-03T10:00:00.000Z', type: 'diet' },
    }], '2026-08-04')[0];
    mockUsePatientsPage.mockReturnValue(state({
      patients: [{ ...patient, nextEvent: null, lastActivity: { at: '2026-08-03T10:00:00.000Z', type: 'diet' } }],
      rows: [row],
    }));
    render(<PatientsListPage />);

    const indicators = await screen.findByTestId('record-indicators');
    expect(indicators.querySelector('[data-indicator="assessment"]')).toHaveClass('invisible', 'pointer-events-none');
    expect(indicators.querySelector('[data-indicator="diet"]')).toHaveClass('invisible', 'pointer-events-none');
  });

  it('announces loading and read failures instead of rendering an empty list', () => {
    mockUsePatientsPage.mockReturnValue(state({ isLoading: true }));
    const { rerender } = render(<PatientsListPage />);
    expect(screen.getByText('Carregando pacientes...')).toBeInTheDocument();

    const retry = vi.fn();
    mockUsePatientsPage.mockReturnValue(state({ error: 'Falha de leitura local.', retry }));
    rerender(<PatientsListPage />);
    expect(screen.getByText('Falha de leitura local.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
