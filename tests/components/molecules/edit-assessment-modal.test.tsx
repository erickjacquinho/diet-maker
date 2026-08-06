import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditAssessmentModal } from '@/components/molecules/EditAssessmentModal';
import type { BodyAssessment, Patient } from '@/lib/patientsStore';

const patient = {
  gender: 'Masculino',
  heightCm: 180,
} as Patient;

function makeAssessment(overrides: Partial<BodyAssessment> = {}): BodyAssessment {
  return {
    id: 'assessment-1',
    date: '2026-08-05',
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

describe('EditAssessmentModal', () => {
  it('renders the requested fields in order and keeps derived values readonly', () => {
    render(
      <EditAssessmentModal
        open
        patient={patient}
        assessment={makeAssessment()}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const labels = screen.getAllByText(/^(Peso atual|Body fat|Massa gorda|Massa magra|Pescoço|Escápula|Busto|Braço esquerdo|Braço direito|Cintura|Barriga|Quadril|Coxa proximal esquerda|Coxa proximal direita|Coxa distal esquerda|Coxa distal direita|Panturrilha esquerda|Panturrilha direita)/);
    expect(labels.map((label) => label.textContent?.split(' (')[0])).toEqual([
      'Peso atual',
      'Pescoço',
      'Escápula',
      'Busto',
      'Braço esquerdo',
      'Braço direito',
      'Cintura',
      'Barriga',
      'Quadril',
      'Coxa proximal esquerda',
      'Coxa proximal direita',
      'Coxa distal esquerda',
      'Coxa distal direita',
      'Panturrilha esquerda',
      'Panturrilha direita',
      'Body fat',
      'Massa gorda',
      'Massa magra',
    ]);

    const composition = screen.getByLabelText('Composição corporal calculada');
    expect(composition).toHaveTextContent('Body fat');
    expect(composition).toHaveTextContent('Massa gorda');
    expect(composition).toHaveTextContent('Massa magra');
    expect(screen.queryByLabelText('Body fat (%)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Massa gorda (kg)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Massa magra (kg)')).not.toBeInTheDocument();
  });

  it('recalculates derived values when a Navy input changes', () => {
    render(
      <EditAssessmentModal
        open
        patient={patient}
        assessment={makeAssessment()}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const composition = screen.getByLabelText('Composição corporal calculada');
    expect(composition).toHaveTextContent('18.46 %');
    fireEvent.change(screen.getByLabelText('Barriga (cm)'), { target: { value: '100' } });

    expect(composition).toHaveTextContent('25.27 %');
    expect(composition).toHaveTextContent('20.22 kg');
    expect(composition).toHaveTextContent('59.78 kg');
  });

  it('blocks saving and exposes an inline error for incomplete assessments', () => {
    const onSave = vi.fn();
    render(
      <EditAssessmentModal
        open
        patient={patient}
        assessment={makeAssessment({ abdomenCm: undefined })}
        onOpenChange={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('As medidas informadas não permitem calcular');
  });

  it('sends calculated values to the save callback', () => {
    const onSave = vi.fn();
    render(
      <EditAssessmentModal
        open
        patient={patient}
        assessment={makeAssessment()}
        onOpenChange={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      bodyFatPercent: 18.46,
      fatMassKg: 14.77,
      muscleMassKg: 65.23,
      abdomenCm: 90,
    }));
  });
});
