import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PatientListTable } from '@/components/organisms/PatientListTable';
import { buildPatientListRows } from '@/lib/patientListView';
import type { Patient } from '@/lib/patientsStore';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const patient: Patient = {
  id: 'patient-1',
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
  lastActivity: { at: '2026-08-01T10:00:00.000Z', type: 'assessment' },
};

describe('PatientListTable', () => {
  it('renders the approved semantic table content and history indicators', () => {
    render(
      <PatientListTable
        rows={buildPatientListRows([patient], '2026-08-03', {
          [patient.id]: {
            hasDiet: true,
            assessments: [
              {
                id: 'assessment-current',
                date: '2026-08-03',
                bodyFatPercent: 24.7,
                weightKg: 62,
                muscleMassKg: 28,
                waistCm: 80,
              },
              {
                id: 'assessment-previous',
                date: '2026-07-14',
                bodyFatPercent: 25.1,
                weightKg: 63,
                muscleMassKg: 27.8,
                waistCm: 81,
              },
            ],
          },
        })}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Paciente' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Objetivo' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Evolução de gordura' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Próximo acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver perfil de Ana Lima' })).toHaveAttribute(
      'href',
      '/pacientes/patient-1',
    );
    expect(screen.getByText('24,7% BF')).toBeInTheDocument();
    expect(screen.getByText('−0,4% 20d')).toBeInTheDocument();
    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByText(/Atualização de avaliação/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avaliação física e dieta registradas' })).toBeInTheDocument();
    const patientName = screen.getByText('Ana Lima');
    const recordIndicators = screen.getByTestId('record-indicators');
    expect(recordIndicators).toHaveClass('w-2');
    expect(recordIndicators.compareDocumentPosition(patientName) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(recordIndicators.querySelector('[data-indicator="assessment"]')).toHaveClass('bg-text-muted');
    expect(recordIndicators.querySelector('[data-indicator="diet"]')).toHaveClass('bg-info');
    expect(recordIndicators.querySelectorAll('[data-indicator]')).toHaveLength(2);
    expect(screen.getByTestId('patient-gender-icon')).toHaveAttribute('data-gender', 'venus');
    expect(screen.getByTestId('patient-row-chevron')).toBeInTheDocument();
    expect(screen.queryByText(/kg/)).not.toBeInTheDocument();
  });

  it('supports keyboard navigation on the row without competing actions', () => {
    const onNavigate = vi.fn();
    render(
      <PatientListTable
        rows={buildPatientListRows([patient], '2026-08-03')}
        onNavigate={onNavigate}
      />,
    );

    const row = screen.getByRole('link', { name: 'Abrir perfil de Ana Lima' });
    expect(row).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('/pacientes/patient-1');
    fireEvent.keyDown(row, { key: ' ' });
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });
});
