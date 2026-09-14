import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProfileOnboarding } from '@/components/organisms/profile-onboarding';
import type { CreateProfileInput } from '@/lib/application/profile-session';

const emptySnapshot = { status: 'empty' as const, syncState: 'unbound' as const, error: null };

describe('ProfileOnboarding', () => {
  it('offers only create and load entry actions, then opens the two-field dialog', () => {
    const onCreateProfile = vi.fn(async (_input: CreateProfileInput) => undefined);
    const onLoadProfile = vi.fn(async () => undefined);

    render(<ProfileOnboarding snapshot={emptySnapshot} onCreateProfile={onCreateProfile} onLoadProfile={onLoadProfile} />);

    expect(screen.getByRole('button', { name: 'Criar perfil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir arquivo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar perfil' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Nome')).toBeInTheDocument();
    const phone = within(dialog).getByLabelText('Telefone');
    expect(phone).toHaveAttribute('type', 'tel');
    fireEvent.change(phone, { target: { value: '11999999999' } });
    expect(phone).toHaveValue('(11) 99999-9999');
    expect(within(dialog).getAllByRole('textbox')).toHaveLength(2);
    expect(within(dialog).getByRole('button', { name: 'Salvar profile' })).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(within(dialog).getByLabelText('Nome')).toHaveFocus();
  });

  it('keeps the dialog open and reports the required-name error without opening the file chooser', () => {
    const onCreateProfile = vi.fn(async (_input: CreateProfileInput) => undefined);
    render(<ProfileOnboarding snapshot={emptySnapshot} onCreateProfile={onCreateProfile} onLoadProfile={vi.fn(async () => undefined)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Criar perfil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar profile' }));

    const name = screen.getByLabelText('Nome');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome do profile.');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAttribute('aria-describedby');
    expect(name).toHaveFocus();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onCreateProfile).not.toHaveBeenCalled();
  });

  it('disables entry actions and exposes loading while create or load is pending', async () => {
    let resolveCreate!: () => void;
    const onCreateProfile = vi.fn(() => new Promise<void>((resolve) => { resolveCreate = resolve; }));
    const onLoadProfile = vi.fn(async () => undefined);
    render(<ProfileOnboarding snapshot={emptySnapshot} onCreateProfile={onCreateProfile} onLoadProfile={onLoadProfile} />);

    fireEvent.click(screen.getByRole('button', { name: 'Criar perfil' }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Jacques Regiani' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar profile' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar profile' })).toHaveAttribute('aria-busy', 'true'));
    expect(screen.getByRole('button', { name: 'Salvar profile' })).toBeDisabled();
    await act(async () => {
      resolveCreate();
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Abrir arquivo' }));
    expect(onLoadProfile).toHaveBeenCalledTimes(1);
  });

  it('announces a paused save status without hiding the usable onboarding shell', () => {
    render(
      <ProfileOnboarding
        snapshot={{ status: 'paused', syncState: 'paused', error: 'O arquivo está indisponível.' }}
        onCreateProfile={vi.fn(async () => undefined)}
        onLoadProfile={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('sincronização pausada');
    expect(screen.getByText('O arquivo está indisponível.')).toBeInTheDocument();
  });
});
