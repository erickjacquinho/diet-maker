import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { EditPatientModal } from '@/components/molecules/EditPatientModal';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';

const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

describe('EditPatientModal', () => {
  it('keeps the gender popup on the semantic modal layer and hides derived or unrelated fields', async () => {
    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        onRequestAddObjective={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Editar Dados do Paciente' });
    const comboboxes = within(dialog).getAllByRole('combobox');
    expect(comboboxes).toHaveLength(1);
    expect(within(dialog).queryByText('Estado Civil')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Idade')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Altura (cm)')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Peso (kg)')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Objetivo Clínico / Esportivo')).not.toBeInTheDocument();

    fireEvent.click(comboboxes[0]);
    const genderListbox = await screen.findByRole('listbox');
    expect(genderListbox).toHaveClass('z-modal');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('submits and saves patient when Ctrl+S is pressed', async () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={onOpenChange}
        onSave={onSave}
        onRequestAddObjective={vi.fn()}
      />,
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('preserves existing non-editable profile data while saving editable values', async () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={onOpenChange}
        onSave={onSave}
        onRequestAddObjective={vi.fn()}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: PATIENT_PROFILE_FIXTURES.patient.name,
        age: PATIENT_PROFILE_FIXTURES.patient.age,
        heightCm: PATIENT_PROFILE_FIXTURES.patient.heightCm,
        weightKg: PATIENT_PROFILE_FIXTURES.patient.weightKg,
        objective: PATIENT_PROFILE_FIXTURES.patient.objective,
      }),
    ));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('keeps the dirty draft open when the persistence operation fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Falha recuperável'));
    const onOpenChange = vi.fn();

    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={onOpenChange}
        onSave={onSave}
        onRequestAddObjective={vi.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Nome Completo do Paciente' });
    fireEvent.change(name, { target: { value: 'Nome em conflito' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha recuperável');
    expect(name).toHaveValue('Nome em conflito');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('asks before discarding dirty values through the cancel action', async () => {
    const onOpenChange = vi.fn();

    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        onRequestAddObjective={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome Completo do Paciente' }), { target: { value: 'Rascunho' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('dialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Não' }));
    expect(screen.getByRole('textbox', { name: 'Nome Completo do Paciente' })).toHaveValue('Rascunho');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('connects invalid name feedback with aria-describedby', async () => {
    render(
      <EditPatientModal
        open
        patient={PATIENT_PROFILE_FIXTURES.patient}
        objectives={[]}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        onRequestAddObjective={vi.fn()}
      />,
    );

    const name = screen.getByRole('textbox', { name: 'Nome Completo do Paciente' });
    fireEvent.change(name, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    await waitFor(() => expect(name).toHaveAttribute('aria-describedby', 'edit-patient-name-error'));
    expect(screen.getByText('Informe o nome completo.')).toBeInTheDocument();
  });
});
