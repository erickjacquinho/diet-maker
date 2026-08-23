import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PatientDetailPage accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );
  });

  it('exposes current context actions and empty states with accessible names', async () => {
    render(<PatientDetailPage />);

    expect(await screen.findByRole('heading', { name: 'Indicadores atuais' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Próximo acompanhamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir acompanhamento' })).toHaveClass('focus-visible:ring-2');
    expect(screen.getByRole('link', { name: 'Nova Dieta' })).toHaveAttribute(
      'href',
      '/pacientes/patient-profile-1/dieta/nova',
    );
    expect(screen.getByRole('button', { name: 'Editar Cadastro' })).toHaveClass(
      'border-border-control',
      'bg-surface',
      'text-text-primary',
    );
    expect(screen.getByRole('button', { name: 'Excluir Paciente' })).toHaveClass(
      'border-error',
      'bg-surface',
      'text-error',
      'hover:bg-error',
      'hover:text-white',
    );
    expect(screen.getByRole('region', { name: 'Histórico de consultas' })).toBeInTheDocument();
  });



  it('keeps the follow-up dialog fields labelled and keyboard-addressable', async () => {
    render(<PatientDetailPage />);

    const openButton = await screen.findByRole('button', { name: 'Definir acompanhamento' });
    fireEvent.click(openButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('z-modal', 'rounded-surface', 'bg-surface');
    expect(screen.getByRole('heading', { name: /Definir pr/ })).toHaveClass('text-style-dialog-title');
    expect(screen.getByText(/Escolha a data/)).toHaveClass('text-style-body', 'text-text-secondary');
    expect(screen.getByRole('button', { name: 'Data' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'next-event-type');
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    const saveButton = screen.getByRole('button', { name: 'Salvar' });
    expect(cancelButton).toHaveClass('h-control-standard');
    expect(saveButton).toHaveClass('h-control-standard');
    expect(cancelButton.parentElement).toHaveClass('gap-2');
    expect(cancelButton.parentElement).not.toHaveClass('space-x-2');

    await waitFor(() => expect(document.activeElement).toBeTruthy());
  });
});
