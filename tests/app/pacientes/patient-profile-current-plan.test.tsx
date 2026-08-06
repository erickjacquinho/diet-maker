import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientDetailPage current plan', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );
  });

  it('shows a compact summary and a details action when a diet is active', async () => {
    localStorage.setItem(
      `nutridiet_diets_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([{
        id: 'diet-current',
        name: 'Plano cutting agosto',
        updatedAt: '2026-08-04',
        simpleTargetKcal: 2020,
        simpleTargetProtein: 150,
        simpleTargetCarbs: 220,
        simpleTargetFats: 60,
      }]),
    );

    render(<PatientDetailPage />);

    expect(await screen.findByText('Plano cutting agosto')).toBeInTheDocument();
    expect(screen.getByText('Plano vigente')).toBeInTheDocument();
    expect(screen.getByText('2020 kcal · 150g P · 220g C · 60g G')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/diet-current',
    );
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('does not promote manual targets when no diet is active', async () => {
    render(<PatientDetailPage />);

    await waitFor(() => expect(screen.getByText('Nenhuma dieta ativa está vinculada a este paciente.')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Criar dieta' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
  });
});
