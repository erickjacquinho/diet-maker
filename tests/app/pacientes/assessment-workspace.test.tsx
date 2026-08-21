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
  it('auto-selects text on focus and displays inline previous value and delta inside input', () => {
    const onChange = vi.fn();
    render(
      <AssessmentMeasurementField
        id="test-weight"
        label="Peso corporal"
        unit="kg"
        value={82.5}
        previousValue={84.0}
        isRequired
        isAutoFilled
        onChange={onChange}
      />
    );

    expect(screen.getByText('Ant: 84 kg')).toBeInTheDocument();
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();
    expect(screen.getByText('✦ Auto')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();

    const input = screen.getByLabelText(/Peso corporal/i) as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    fireEvent.focus(input);
    expect(selectSpy).toHaveBeenCalled();
  });
});

describe('AssessmentContinuousFields', () => {
  it('renders all measurement fields without tabs in anatomical order and shows previous data and autoFilled tags', () => {
    const draft = makeAssessment({
      weightKg: 82,
      autoFilledFields: ['leftArmCm', 'neckCm'],
    });
    const prev = makeAssessment({ weightKg: 85, waistCm: 88 });
    const updateFn = vi.fn();

    render(
      <AssessmentContinuousFields
        draft={draft}
        previousAssessment={prev}
        updateNumericField={updateFn}
      />
    );

    expect(screen.getByLabelText(/Peso atual/i)).toBeInTheDocument();
    expect(screen.getByText('Ant: 85 kg')).toBeInTheDocument();
    expect(screen.getByText('Ant: 88 cm')).toBeInTheDocument();
    expect(screen.getByText('Equação US Navy')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Peso atual/i), { target: { value: '82.5' } });
    expect(updateFn).toHaveBeenCalledWith('weightKg', '82.5');
  });
});

describe('AssessmentSummaryPanel', () => {
  it('renders real-time performance metrics, FFMI, athletic badges, stacked bar, deltas and handles copy summary', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const onCopySummary = vi.fn();

    render(
      <AssessmentSummaryPanel
        composition={{
          bodyFatPercent: 9.5,
          fatMassKg: 7.6,
          leanMassKg: 72.4,
          isValid: true,
        }}
        ffmi={23.8}
        patientGender="Masculino"
        deltas={{
          weightDiff: -1.5,
          bodyFatDiff: -1.1,
          leanMassDiff: 1.2,
          fatMassDiff: -0.9,
          waistDiff: -1.5,
          hasPrevious: true,
        }}
        onSave={onSave}
        onCancel={onCancel}
        onCopySummary={onCopySummary}
      />
    );

    expect(screen.getByText('9.5 %')).toBeInTheDocument();
    expect(screen.getByText('7.6 kg')).toBeInTheDocument();
    expect(screen.getByText('72.4 kg')).toBeInTheDocument();
    expect(screen.getByText('23.8 kg/m²')).toBeInTheDocument();

    // Athletic & High Performance Badges
    expect(screen.getByText('Shredded')).toBeInTheDocument();
    expect(screen.getByText('Elite Natural')).toBeInTheDocument();

    // Stacked Bar
    expect(screen.getByText('90.5% Massa Magra')).toBeInTheDocument();
    expect(screen.getByText('9.5% Gordura')).toBeInTheDocument();

    // Recomposição Corporal Deltas
    expect(screen.getByText('+1.2 kg')).toBeInTheDocument();
    expect(screen.getByText('-0.9 kg')).toBeInTheDocument();
    expect(screen.getByText('-1.1 %')).toBeInTheDocument();
    expect(screen.getByText('-1.5 cm')).toBeInTheDocument();
    expect(screen.getByText('-1.5 kg')).toBeInTheDocument();

    // Actions
    fireEvent.click(screen.getByRole('button', { name: /Salvar Avaliação/i }));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Copiar Resumo/i }));
    expect(onCopySummary).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
