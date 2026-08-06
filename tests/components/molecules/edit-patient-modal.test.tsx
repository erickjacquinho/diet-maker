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
  it('keeps both select popups on the semantic modal layer', async () => {
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

    fireEvent.click(comboboxes[0]);
    const genderListbox = await screen.findByRole('listbox');
    expect(genderListbox).toHaveClass('z-modal');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    fireEvent.click(comboboxes[1]);
    const objectiveListbox = await screen.findByRole('listbox');
    expect(objectiveListbox).toHaveClass('z-modal');
  });
});
