import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsDialog, type SettingsDialogProps } from '@/components/organisms/SettingsDialog';
import { parseProfessionalProfile } from '@/lib/domain/professional-profile';
import { clinicLogo } from '../../fixtures/clinic-logo';

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
    onResetPassword: vi.fn(async () => undefined),
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

  it('imports a plaintext .nutridiet only after the user confirms it', async () => {
    const onImportNutridiet = vi.fn(async () => ({ replayed: false, patients: 3, dietPlans: 2, foodCatalogItems: 1, recipes: 0, readyMeals: 4 }));
    const { dialog } = renderDialog({ defaultTab: 'import', onImportNutridiet });

    const file = new File([JSON.stringify({ formatVersion: 1 })], 'consultorio.nutridiet', { type: 'application/json' });
    fireEvent.change(within(dialog).getByLabelText('Arquivo .nutridiet'), { target: { files: [file] } });
    const submit = within(dialog).getByRole('button', { name: 'Importar arquivo' });
    await waitFor(() => expect(within(dialog).getByRole('checkbox', { name: /sem criptografia/ })).toBeInTheDocument());
    expect(submit).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('checkbox', { name: /sem criptografia/ }));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(onImportNutridiet).toHaveBeenCalledWith(expect.stringContaining('formatVersion'), { confirmPlaintext: true }));
    expect(await within(dialog).findByText(/3 paciente\(s\), 2 dieta\(s\)/)).toBeInTheDocument();
  });

  it('imports a protected .nutridiet without asking for confirmation and reports a failure', async () => {
    const onImportNutridiet = vi.fn().mockRejectedValue(new Error('A conta já tem dados.'));
    const { dialog } = renderDialog({ defaultTab: 'import', onImportNutridiet });

    const file = new File([JSON.stringify({ formatVersion: 2 })], 'protegido.nutridiet', { type: 'application/json' });
    fireEvent.change(within(dialog).getByLabelText('Arquivo .nutridiet'), { target: { files: [file] } });
    const submit = within(dialog).getByRole('button', { name: 'Importar arquivo' });
    await waitFor(() => expect(submit).toBeEnabled());
    expect(within(dialog).queryByRole('checkbox', { name: /sem criptografia/ })).not.toBeInTheDocument();

    fireEvent.click(submit);
    expect(await within(dialog).findByText('A conta já tem dados.')).toBeInTheDocument();
    expect(onImportNutridiet).toHaveBeenCalledWith(expect.any(String), { confirmPlaintext: false });
  });

  it('shows subscription as an informational tab without profile controls', () => {
    const { dialog } = renderDialog({ defaultTab: 'subscription' });

    expect(within(dialog).getByRole('tab', { name: 'Assinatura' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByText('A gestão da assinatura estará disponível em breve.')).toBeInTheDocument();
    expect(within(dialog).getByText('Aqui você poderá gerenciar plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('form')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Salvar|Descartar alterações/ })).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/R\$|vencimento|pagamento pendente/i)).not.toBeInTheDocument();
  });

  it('preserves a profile draft while switching to subscription and keeps the discard guard', async () => {
    const { props, dialog } = renderDialog();

    fireEvent.change(within(dialog).getByLabelText(/^Nome/), { target: { value: 'Ana Maria' } });
    fireEvent.mouseDown(await within(dialog).findByRole('tab', { name: 'Assinatura' }), { button: 0 });
    expect(within(dialog).getByText('A gestão da assinatura estará disponível em breve.')).toBeInTheDocument();
    fireEvent.mouseDown(within(dialog).getByRole('tab', { name: 'Perfil profissional' }), { button: 0 });
    expect(within(dialog).getByLabelText(/^Nome/)).toHaveValue('Ana Maria');

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(await screen.findByRole('alertdialog', { name: 'Descartar alterações?' })).toBeInTheDocument();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('keeps subscription informational while a modal operation is busy', () => {
    const { props, dialog } = renderDialog({ busy: true, defaultTab: 'subscription' });

    expect(within(dialog).getByText('A gestão da assinatura estará disponível em breve.')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it('requests password recovery and surfaces a failure for retry', async () => {
    const { props, dialog } = renderDialog();
    vi.mocked(props.onResetPassword).mockRejectedValueOnce(new Error('Muitas tentativas.'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Redefinir senha' }));
    expect(await within(dialog).findByText('Muitas tentativas.')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Redefinir senha' }));
    expect(await within(dialog).findByText('Se o endereço puder receber uma recuperação, as instruções serão enviadas.')).toBeInTheDocument();
    expect(props.onResetPassword).toHaveBeenCalledTimes(2);
  });

  it('saves the reminder preference and removal of the persisted logo', async () => {
    const { props, dialog } = renderDialog({ profile: {
      status: 'ready', profile: { ...profile, documentLogo: clinicLogo }, accountEmail: 'ana@example.invalid', error: null,
    } });
    expect(within(dialog).getByRole('img', { name: 'Prévia do logotipo do consultório' })).toHaveAttribute('src', clinicLogo);
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Exibir lembretes da agenda' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover logotipo' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() => expect(props.onSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ agendaRemindersEnabled: false, documentLogo: null })));
  });

  it('rejects an unsupported logo file while preserving the previous one', async () => {
    const { dialog } = renderDialog({ profile: {
      status: 'ready', profile: { ...profile, documentLogo: clinicLogo }, accountEmail: 'ana@example.invalid', error: null,
    } });
    fireEvent.change(within(dialog).getByLabelText('Logotipo do consultório'), { target: { files: [new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })] } });
    expect(await within(dialog).findByText(/Selecione um PNG válido/)).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Prévia do logotipo do consultório' })).toHaveAttribute('src', clinicLogo);
  });
});
