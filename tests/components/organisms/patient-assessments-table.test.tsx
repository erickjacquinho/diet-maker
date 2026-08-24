import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PatientAssessmentsTable } from '@/components/organisms/patient/PatientAssessmentsTable';
import type { BodyAssessment } from '@/lib/patientsStore';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientAssessmentsTable', () => {
  const mockAssessments: BodyAssessment[] = [
    {
      id: 'asm-1',
      date: '23/08/2026',
      weightKg: 79.5,
      bodyFatPercent: 14.8,
      muscleMassKg: 35.2,
      waistCm: 79,
      abdomenCm: 83.5,
      hipCm: 98,
      bustCm: 102,
      leftArmCm: 37,
      rightArmCm: 37.5,
    },
    {
      id: 'asm-2',
      date: '04/08/2026',
      weightKg: 81.0,
      bodyFatPercent: 15.5,
      muscleMassKg: 34.8,
      waistCm: 81,
    },
  ];

  it('renders empty state when no assessments exist', () => {
    render(<PatientAssessmentsTable patientId="p1" assessments={[]} />);

    expect(
      screen.getByText('Nenhuma avaliação física registrada para este paciente até o momento.'),
    ).toBeInTheDocument();
  });

  it('renders table columns and data rows cleanly', () => {
    render(<PatientAssessmentsTable patientId="p1" assessments={mockAssessments} />);

    expect(screen.getByRole('table', { name: /Histórico de avaliações físicas/ })).toBeInTheDocument();
    expect(screen.getByText('23/08/2026')).toBeInTheDocument();
    expect(screen.getByText('79.5 kg')).toBeInTheDocument();
    expect(screen.getByText('14.8%')).toBeInTheDocument();
    expect(screen.getByText('35.2 kg')).toBeInTheDocument();
    expect(screen.getByText('79 cm')).toBeInTheDocument();

    expect(screen.getByText('04/08/2026')).toBeInTheDocument();
    expect(screen.getByText('81 kg')).toBeInTheDocument();
  });

  it('expands complementary perimeters inline when details button is clicked', () => {
    render(<PatientAssessmentsTable patientId="p1" assessments={mockAssessments} />);

    const detailsButton = screen.getByRole('button', { name: 'Detalhes' });
    expect(detailsButton).toBeInTheDocument();

    fireEvent.click(detailsButton);

    expect(screen.getByText(/Circunferências & Perímetros Corporais/)).toBeInTheDocument();
    expect(screen.getByText('83.5 cm')).toBeInTheDocument(); // Abdômen
    expect(screen.getByText('98 cm')).toBeInTheDocument(); // Quadril
    expect(screen.getByText('102 cm')).toBeInTheDocument(); // Tórax
    expect(screen.getByText('37 / 37.5 cm')).toBeInTheDocument(); // Braço
  });
});
