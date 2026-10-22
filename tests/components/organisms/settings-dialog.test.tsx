import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsDialog, type SettingsDialogProps } from '@/components/organisms/SettingsDialog';
import { parseProfessionalProfile } from '@/lib/domain/professional-profile';

const profile = parseProfessionalProfile({
  firstName: 'Ana',
  lastName: 'Souza',
  averagePatientsPerMonth: 40,
  experience: { kind: 'years', value: 5 },
  crn: 'CRN-3 12345',
});

function renderDialog(overrides: Partial<SettingsDialogProps> = {}) {
  const props: SettingsDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    profile: { status: 'ready', profile, accountEmail: 'ana@example.invalid', error: null },
    onRetryProfile: vi.fn(),
    onSaveProfile: vi.fn(async () => undefined),
    save: { details: { displayName: 'Consultório Centro', phone: '11999998888' }, fileName: 'centro.dietmaker', syncState: 'synced', editable: true },
    onSaveSettings: vi.fn(async () => undefined),
    onSyncSave: vi.fn(async () => undefined),
    ...overrides,
  };
  render(<SettingsDialog {...props} />);
  return { props, dialog: screen.getByRole('dialog', { name: 'Configurações' }) };
}

describe('SettingsDialog', () => {
  it('saves the complete professional profile after validating the draft', async () => {
    const { props, dialog } = renderDialog();

    expect(within(dialog).getByLabelText(/E-mail de acesso/)).toHaveValue('ana@example.invalid');
    expect(within(dialog).getByText('Assinatura: Ana Souza · Nutricionista · CRN-3 12345')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText(/E-mail de contato/), { target: { value: 'ana@' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar perfil' }));
    expect(await within(dialog).findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(props.onSaveProfile).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText(/E-mail de contato/), { target: { value: 'Contato@Ana.com' } });
    fireEvent.change(within(dialog).getByLabelText('Instagram'), { target: { value: 'ana.nutri' } });
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Exibir meus dados profissionais nos PDFs de dieta' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar perfil' }));

    await waitFor(() => expect(props.onSaveProfile).toHaveBeenCalledTimes(1));
    expect(props.onSaveProfile).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ana',
      contactEmail: 'contato@ana.com',
      instagram: '@ana.nutri',
      showOnDocuments: false,
    }));
    expect(await within(dialog).findByText('Perfil profissional atualizado.')).toBeInTheDocument();
  });

  it('asks before discarding unsaved changes', async () => {
    const { props, dialog } = renderDialog();

    fireEvent.change(within(dialog).getByLabelText(/^Nome/), { target: { value: 'Ana Maria' } });
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    expect(await screen.findByRole('alertdialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
    expect(props.onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sim, descartar' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('updates the open save name and phone and syncs on demand', async () => {
    const { props, dialog } = renderDialog({ defaultTab: 'save' });

    expect(within(dialog).getByText('centro.dietmaker')).toBeInTheDocument();
    expect(within(dialog).getByText('Tudo salvo no arquivo')).toBeInTheDocument();
    const submit = within(dialog).getByRole('button', { name: 'Salvar configurações do save' });
    expect(submit).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/^Nome do save/), { target: { value: '  Consultório   Norte ' } });
    fireEvent.click(submit);
    await waitFor(() => expect(props.onSaveSettings).toHaveBeenCalledWith({ displayName: 'Consultório Norte', phone: '(11) 99999-8888' }));

    fireEvent.click(within(dialog).getByRole('button', { name: 'Sincronizar agora' }));
    await waitFor(() => expect(props.onSyncSave).toHaveBeenCalledTimes(1));
  });

  it('explains the save tab when no save is open', () => {
    const { dialog } = renderDialog({
      defaultTab: 'save',
      save: { details: null, fileName: null, syncState: 'unbound', editable: false },
    });

    expect(within(dialog).getByText('Nenhum save está aberto nesta sessão.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('form', { name: 'Configurações do save' })).not.toBeInTheDocument();
  });

  it('blocks file operations until pending save settings are saved or discarded', () => {
    const { dialog } = renderDialog({ defaultTab: 'save', savesContent: <button type="button">Abrir arquivo</button> });
    const openFile = within(dialog).getByRole('button', { name: 'Abrir arquivo' });
    expect(openFile).toBeEnabled();
    fireEvent.change(within(dialog).getByLabelText(/^Nome do save/), { target: { value: 'Outro nome' } });
    expect(openFile).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar alterações' }));
    expect(openFile).toBeEnabled();
  });

  it('keeps Settings open while a file operation is busy', () => {
    const { props, dialog } = renderDialog({ busy: true, defaultTab: 'save' });
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(props.onOpenChange).not.toHaveBeenCalled();
    expect(within(dialog).getByLabelText(/^Nome do save/)).toBeDisabled();
  });
});
