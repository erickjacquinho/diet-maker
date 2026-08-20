import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentSummaryPanel } from '@/components/organisms/assessment/AssessmentSummaryPanel';
import { AssessmentContinuousFields } from '@/components/molecules/assessment/AssessmentContinuousFields';
import { AssessmentMeasurementField } from '@/components/molecules/assessment/AssessmentMeasurementField';
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

describe('AssessmentMeasurementField', () => {
  it('auto-selects text on focus and displays inline previous value and delta', () => {
    const onChange = vi.fn();
    render(
      <AssessmentMeasurementField
        id="test-weight"
        label="Peso corporal"
        unit="kg"
        value={82.5}
        previousValue={84.0}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Ant: 84 kg')).toBeInTheDocument();
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();

    const input = screen.getByLabelText('Peso corporal (kg)') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    fireEvent.focus(input);
    expect(selectSpy).toHaveBeenCalled();
  });
});

describe('AssessmentContinuousFields', () => {
  it('renders all measurement fields without tabs in anatomical order and shows previous data', () => {
    const draft = makeAssessment({ weightKg: 82 });
    const prev = makeAssessment({ weightKg: 85, waistCm: 88 });
    const updateFn = vi.fn();

    render(
      <AssessmentContinuousFields
        draft={draft}
        previousAssessment={prev}
        updateNumericField={updateFn}
      />
    );

    expect(screen.getByLabelText('Peso atual (kg)')).toBeInTheDocument();
    expect(screen.getByText('Ant: 85 kg')).toBeInTheDocument();
    expect(screen.getByText('Ant: 88 cm')).toBeInTheDocument();
    expect(screen.getByText('Equação US Navy')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Peso atual (kg)'), { target: { value: '82.5' } });
    expect(updateFn).toHaveBeenCalledWith('weightKg', '82.5');
  });
});

describe('AssessmentSummaryPanel', () => {
  it('renders real-time metrics, clinical badges, stacked bar, deltas and handles copy summary', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const onCopySummary = vi.fn();

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
        patientGender="Masculino"
        deltas={{
          weightDiff: -1.5,
          bodyFatDiff: -0.96,
          leanMassDiff: 0.77,
          waistDiff: -2.0,
          hasPrevious: true,
        }}
        onSave={onSave}
        onCancel={onCancel}
        onCopySummary={onCopySummary}
      />
    );

    expect(screen.getByText('17.5 %')).toBeInTheDocument();
    expect(screen.getByText('14 kg')).toBeInTheDocument();
    expect(screen.getByText('66 kg')).toBeInTheDocument();
    expect(screen.getByText('24.7 kg/m²')).toBeInTheDocument();
    expect(screen.getByText('0.85')).toBeInTheDocument();

    // Clinical Badges
    expect(screen.getByText('Bom / Fitness')).toBeInTheDocument();
    expect(screen.getByText('Eutrofia')).toBeInTheDocument();
    expect(screen.getByText('Baixo Risco')).toBeInTheDocument();

    // Stacked Bar
    expect(screen.getByText('82.5% Massa Magra')).toBeInTheDocument();
    expect(screen.getByText('17.5% Gordura')).toBeInTheDocument();

    // Deltas
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
    expect(screen.getByText('-0.96 %')).toBeInTheDocument();
    expect(screen.getByText('+0.77 kg')).toBeInTheDocument();
    expect(screen.getByText('-2 cm')).toBeInTheDocument();

    // Actions
    fireEvent.click(screen.getByRole('button', { name: /Salvar Avaliação/i }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Copiar Resumo/i }));
    expect(onCopySummary).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
