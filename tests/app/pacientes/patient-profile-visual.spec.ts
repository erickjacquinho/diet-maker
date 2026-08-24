import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
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
    React.createElement('a', { href, ...props }, children)
  ),
}));

describe('PatientDetailPage desktop visual contracts', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    localStorage.clear();
    push.mockClear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );
  });

  it('scenario A keeps the current context primary and the plan empty state honest', async () => {
    render(React.createElement(PatientDetailPage));

    expect(await screen.findByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plano alimentar atual' })).toBeInTheDocument();
    expect(screen.getByText('Nenhuma dieta ativa está vinculada a este paciente.')).toBeInTheDocument();
    expect(screen.queryByText('2020 kcal')).not.toBeInTheDocument();
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('scenario B shows only the compact active plan summary', async () => {
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

    render(React.createElement(PatientDetailPage));

    expect(await screen.findByText('Plano ativo')).toBeInTheDocument();
    expect(screen.getByText(/P\s*150g/)).toBeInTheDocument();
    expect(screen.getByText(/C\s*220g/)).toBeInTheDocument();
    expect(screen.getByText(/G\s*60g/)).toBeInTheDocument();
    expect(screen.getByText(/2020/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/diet-current',
    );
    expect(screen.queryByText('Metas nutricionais atuais')).not.toBeInTheDocument();
  });

  it('scenario C keeps the longitudinal history below the current context', async () => {
    localStorage.setItem(
      `nutridiet_assessments_${PATIENT_PROFILE_FIXTURES.patient.id}`,
      JSON.stringify(PATIENT_PROFILE_ASSESSMENTS),
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

    render(React.createElement(PatientDetailPage));

    const assessmentsTable = await screen.findByRole('table', { name: /Histórico de avaliações físicas/ });
    expect(assessmentsTable).toBeInTheDocument();
    const dietsTable = screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ });
    expect(dietsTable).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
  });
});
