import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import DietBuilderPage from '@/app/pacientes/[id]/dieta/[dietaId]/page';
import DedicatedConsultationPage from '@/app/pacientes/[id]/consulta/[date]/page';
import type { Patient } from '@/lib/patientsStore';

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

describe('contextual header navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('nutridiet_patients', JSON.stringify([patient]));
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
    expect(within(header as HTMLElement).getByRole('link', { name: 'Voltar para a ficha de Ana Lima' })).toHaveAttribute(
      'href',
      `/pacientes/${patient.id}`,
    );
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

  it('keeps consultation actions available when a diet is linked', async () => {
    localStorage.setItem(
      `nutridiet_diets_${patient.id}`,
      JSON.stringify([{ id: 'diet-linked', name: 'Plano atual', createdAt: '2026/08/04', simpleMeals: [] }]),
    );
    Object.assign(routeParams, { id: patient.id, date: '2026-08-04' });

    render(<DedicatedConsultationPage />);

    const heading = await screen.findByRole('heading', { level: 1, name: 'Registro de Consulta — 2026/08/04' });
    const header = heading.closest('header') as HTMLElement;
    const printButton = within(header).getByRole('button', { name: 'Imprimir Prontuário' });
    const dietLink = within(header).getByRole('link', { name: 'Abrir no Construtor de Dietas' });

    expect(printButton).toBeEnabled();
    expect(dietLink).toHaveAttribute('href', `/pacientes/${patient.id}/dieta/diet-linked`);
    fireEvent.click(printButton);
    fireEvent.click(dietLink);
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
