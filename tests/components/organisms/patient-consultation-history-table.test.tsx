import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientConsultationHistoryTable } from '@/components/organisms/PatientConsultationHistoryTable';

describe('PatientConsultationHistoryTable', () => {
  it('keeps the empty state inside the canonical data table', () => {
    render(
      <PatientConsultationHistoryTable
        patientId="patient-1"
        onOpenReadOnlyDiet={vi.fn()}
      />,
    );

    expect(screen.getByRole('table', { name: 'Histórico de consultas por data' })).toBeInTheDocument();
    expect(
      screen.getByText('Nenhum histórico registrado para este paciente até o momento.'),
    ).toBeInTheDocument();
  });
});
