import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('PatientDetailPage WhatsApp action', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([{ ...PATIENT_PROFILE_FIXTURES.patient, whatsapp: '(11) 99999-9999' }]),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the patient WhatsApp conversation with the Brazilian country code', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window);

    render(<PatientDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Editar Cadastro' }));
    expect(await screen.findByRole('textbox', { name: 'WhatsApp' })).toHaveValue('(11) 99999-9999');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    const button = await screen.findByRole('button', { name: 'Abrir conversa no WhatsApp' });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(open).toHaveBeenCalledWith(
      'https://web.whatsapp.com/send?phone=5511999999999',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('disables the action when the patient has no WhatsApp contact', async () => {
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([PATIENT_PROFILE_FIXTURES.patient]),
    );

    render(<PatientDetailPage />);

    expect(await screen.findByRole('button', { name: /WhatsApp/ })).toBeDisabled();
  });
});
