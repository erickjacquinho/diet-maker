import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import {
  PATIENT_PROFILE_ASSESSMENTS,
  PATIENT_PROFILE_FIXTURES,
} from '../../fixtures/patient-profile';

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

describe('PatientDetailPage history', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );
  });

  it('keeps the empty history state informational', async () => {
    render(<PatientDetailPage />);

    await waitFor(() => expect(screen.getByText('Nenhum histórico registrado para este paciente até o momento.')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: 'Criar Dieta' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
  });

  it('preserves dated diet and assessment details in the expandable table with chevron', async () => {
    localStorage.setItem(
      `nutridiet_assessments_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([PATIENT_PROFILE_ASSESSMENTS[1]]),
    );
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

    const table = await screen.findByRole('table', { name: 'Histórico de consultas por data' });
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
    expect(screen.getAllByRole('columnheader').every((header) => header.getAttribute('scope') === 'col')).toBe(true);
    expect(screen.getByText('Dieta')).toBeInTheDocument();
    expect(screen.getByText('Avaliação Física')).toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: 'Expandir consulta' });
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);

    expect(screen.getAllByText('Plano cutting agosto')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Ver Consulta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver Cardápio' })).toBeInTheDocument();
    expect(screen.getByText('Avaliação Física & Valores')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recolher consulta' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Cardápio' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });


  it('consolidates multiple assessments on the same date into a single row and shows both in expanded panel', async () => {
    localStorage.setItem(
      `nutridiet_assessments_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify([
        {
          id: 'asm-same-date-1',
          date: '04/08/2026',
          weightKg: 80,
          bodyFatPercent: 15,
          muscleMassKg: 35,
          waistCm: 80,
        },
        {
          id: 'asm-same-date-2',
          date: '04/08/2026',
          weightKg: 79,
          bodyFatPercent: 14.5,
          muscleMassKg: 35.5,
          waistCm: 79,
        },
      ]),
    );

    render(<PatientDetailPage />);

    const table = await screen.findByRole('table', { name: 'Histórico de consultas por data' });
    expect(table).toBeInTheDocument();
    expect(screen.getByText('1 consulta')).toBeInTheDocument();
    expect(screen.getByText('2 Avaliações')).toBeInTheDocument();
    expect(screen.getByText('+1 medição')).toBeInTheDocument();
    expect(screen.getByText('80 kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expandir consulta' }));
    expect(screen.getByText('79 kg')).toBeInTheDocument();
  });
});


