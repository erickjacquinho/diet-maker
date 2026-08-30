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
  it('keeps all three select popups on the semantic modal layer', async () => {
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
    expect(comboboxes).toHaveLength(3);

    // 1. Gênero
    fireEvent.click(comboboxes[0]);
    const genderListbox = await screen.findByRole('listbox');
    expect(genderListbox).toHaveClass('z-modal');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    // 2. Estado Civil
    fireEvent.click(comboboxes[1]);
    const maritalStatusListbox = await screen.findByRole('listbox');
    expect(maritalStatusListbox).toHaveClass('z-modal');
    expect(within(maritalStatusListbox).getByRole('option', { name: 'Solteiro(a)' })).toBeInTheDocument();
    expect(within(maritalStatusListbox).getByRole('option', { name: 'Comprometido(a)' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    // 3. Objetivo
    fireEvent.click(comboboxes[2]);
    const objectiveListbox = await screen.findByRole('listbox');
    expect(objectiveListbox).toHaveClass('z-modal');
  });

  it('submits and saves patient when Ctrl+S is pressed', () => {
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

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates marital status and saves correctly on form submission', async () => {
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

    const dialog = screen.getByRole('dialog', { name: 'Editar Dados do Paciente' });
    const comboboxes = within(dialog).getAllByRole('combobox');
    
    // Select Estado Civil -> Comprometido(a)
    fireEvent.click(comboboxes[1]);
    const option = await screen.findByRole('option', { name: 'Comprometido(a)' });
    fireEvent.click(option);

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: PATIENT_PROFILE_FIXTURES.patient.name,
        maritalStatus: 'Comprometido(a)',
      }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
