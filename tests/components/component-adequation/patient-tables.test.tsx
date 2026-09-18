import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientAssessmentsTable } from '@/components/organisms/patient/PatientAssessmentsTable';
import { PatientDietsTable } from '@/components/organisms/patient/PatientDietsTable';
import { PatientConsultationHistoryTable } from '@/components/organisms/PatientConsultationHistoryTable';
import { PatientListTable } from '@/components/organisms/PatientListTable';
import type { BodyAssessment, HistoricalDiet, Patient } from '@/lib/patientsStore';
import { buildPatientListRows } from '@/lib/patientListView';

const assessment: BodyAssessment = {
  id: 'assessment-1',
  date: '15/01/2026',
  weightKg: 70.5,
  bodyFatPercent: 21.2,
  muscleMassKg: 31,
  waistCm: 82,
  abdomenCm: 84,
  leftArmCm: 34,
  rightArmCm: 34.5,
};

const diet: HistoricalDiet = {
  id: 'diet-1',
  name: 'Plano sintético',
  date: '15/01/2026',
  targetKcal: 2000,
  proteinG: 150,
  carbsG: 220,
  fatsG: 60,
  status: 'Ativa',
};

const patient: Patient = {
  id: 'patient-1',
  name: 'Paciente Sintético',
  age: 30,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 65,
  targetKcal: 2000,
  targetProtein: 150,
  targetCarbs: 220,
  targetFats: 60,
  objective: 'Manutenção',
  lastConsultation: '15/01/2026',
  initials: 'PS',
  nextEvent: null,
  lastActivity: null,
};

describe('component adequation: patient tables and rows', () => {
  it('keeps assessment headers, units and expansion inside the table contract', () => {
    render(<PatientAssessmentsTable patientId="patient-1" assessments={[assessment]} />);
    const table = screen.getByRole('table', { name: /Histórico de avaliações físicas/ });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(7);
    expect(within(table).getByText('70.5 kg')).toBeInTheDocument();
    expect(within(table).getByText('21.2%')).toBeInTheDocument();

    const details = within(table).getByRole('button', { name: 'Detalhes' });
    fireEvent.click(details);
    expect(screen.getByText('Circunferências & Perímetros Corporais')).toBeInTheDocument();
    expect(screen.getByText('34 / 34.5 cm')).toBeInTheDocument();
  });

  it('keeps an empty diet result as a canonical table state', () => {
    render(<PatientDietsTable patientId="patient-1" diets={[]} onOpenReadOnlyDiet={vi.fn()} />);
    expect(screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Nenhuma prescrição dietética registrada/);
  });

  it('preserves diet row actions, expansion and consultation composition without duplicate activation', () => {
    const onOpenReadOnlyDiet = vi.fn();
    render(
      <PatientDietsTable
        patientId="patient-1"
        diets={[{ ...diet, mode: 'carb_cycling', carbCyclingVariations: [] }]}
        onOpenReadOnlyDiet={onOpenReadOnlyDiet}
      />,
    );

    const dietTable = screen.getByRole('table', { name: /Histórico de prescrições dietéticas/ });
    const expand = within(dietTable).getByRole('button', { name: /Ver variações/ });
    fireEvent.click(expand);
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Este ciclo não possui variações configuradas.')).toBeInTheDocument();
    expect(onOpenReadOnlyDiet).not.toHaveBeenCalled();

    const view = within(dietTable).getByRole('button', { name: /Ver cardápio completo/ });
    fireEvent.click(view);
    expect(onOpenReadOnlyDiet).toHaveBeenCalledTimes(1);
  });

  it('keeps history empty and patient navigation accessible without a second activation', () => {
    render(
      <PatientConsultationHistoryTable
        patientId="patient-1"
        onOpenReadOnlyDiet={vi.fn()}
      />,
    );
    expect(screen.getByRole('table', { name: 'Histórico de consultas por data' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Nenhum histórico registrado/);

    const onNavigate = vi.fn();
    render(
      <PatientListTable
        rows={buildPatientListRows([patient], '2026-01-15')}
        onNavigate={onNavigate}
      />,
    );
    const row = screen.getByRole('row', { name: 'Abrir perfil de Paciente Sintético' });
    const profileLink = screen.getByRole('link', { name: 'Ver perfil de Paciente Sintético' });
    expect(profileLink).toHaveAttribute('href', '/pacientes/patient-1');
    fireEvent.click(profileLink);
    expect(onNavigate).not.toHaveBeenCalled();
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('/pacientes/patient-1');
  });
});
