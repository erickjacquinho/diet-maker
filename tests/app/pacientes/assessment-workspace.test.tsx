import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentSummaryPanel } from '@/components/organisms/assessment/AssessmentSummaryPanel';
import { AssessmentContinuousFields } from '@/components/molecules/assessment/AssessmentContinuousFields';
import type { BodyAssessment } from '@/lib/patientsStore';

function makeAssessment(overrides: Partial<BodyAssessment> = {}): BodyAssessment {
  return {
    id: 'assessment-1',
    date: '20/08/2026',
    weightKg: 80,
    bodyFatPercent: 18.46,
    muscleMassKg: 65.23,
    waistCm: 85,
    neckCm: 40,
    scapulaCm: 100,
    bustCm: 95,
    leftArmCm: 35,
    rightArmCm: 35,
    abdomenCm: 90,
    hipCm: 95,
    leftProximalThighCm: 55,
    rightProximalThighCm: 55,
    leftDistalThighCm: 42,
    rightDistalThighCm: 42,
    leftCalfCm: 38,
    rightCalfCm: 38,
    fatMassKg: 14.77,
    ...overrides,
  };
}

describe('AssessmentContinuousFields', () => {
  it('renders all measurement fields without tabs in anatomical order', () => {
    const draft = makeAssessment();
    const updateFn = vi.fn();

    render(<AssessmentContinuousFields draft={draft} updateNumericField={updateFn} />);

    expect(screen.getByLabelText('Peso atual (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Pescoço (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Braço esquerdo (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Braço direito (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Cintura (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Barriga (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Quadril (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Coxa proximal esquerda (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Panturrilha direita (cm)')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Peso atual (kg)'), { target: { value: '82.5' } });
    expect(updateFn).toHaveBeenCalledWith('weightKg', '82.5');
  });
});

describe('AssessmentSummaryPanel', () => {
  it('renders real-time metrics, deltas vs previous assessment and action buttons', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <AssessmentSummaryPanel
        composition={{
          bodyFatPercent: 17.5,
          fatMassKg: 14.0,
          leanMassKg: 66.0,
          isValid: true,
        }}
        bmi={24.7}
        waistToHipRatio={0.85}
        deltas={{
          weightDiff: -1.5,
          bodyFatDiff: -0.96,
          leanMassDiff: 0.77,
          waistDiff: -2.0,
          hasPrevious: true,
        }}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('17.5 %')).toBeInTheDocument();
    expect(screen.getByText('14 kg')).toBeInTheDocument();
    expect(screen.getByText('66 kg')).toBeInTheDocument();
    expect(screen.getByText('24.7 kg/m²')).toBeInTheDocument();
    expect(screen.getByText('0.85')).toBeInTheDocument();

    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
    expect(screen.getByText('-0.96 %')).toBeInTheDocument();
    expect(screen.getByText('+0.77 kg')).toBeInTheDocument();
    expect(screen.getByText('-2 cm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Salvar Avaliação/i }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
