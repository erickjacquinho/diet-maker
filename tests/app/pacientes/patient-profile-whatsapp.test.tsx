import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PatientDetailPage from '@/app/pacientes/[id]/page';
import { PATIENT_PROFILE_FIXTURES } from '../../fixtures/patient-profile';
import { usePatientProfilePage } from '@/hooks/usePatientProfilePage';
import { makePatientProfileState } from './profileState';

const push = vi.fn();
const router = { push, replace: vi.fn() };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: PATIENT_PROFILE_FIXTURES.patient.id }),
  useRouter: () => router,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/hooks/usePatientProfilePage', () => ({
  usePatientProfilePage: vi.fn(),
}));

const mockUsePatientProfilePage = vi.mocked(usePatientProfilePage);

describe('PatientDetailPage WhatsApp action', () => {
  beforeEach(() => {
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState({
      patient: {
        ...makePatientProfileState().patient,
        whatsapp: '(11) 99999-9999',
      },
      whatsappUrl: 'https://web.whatsapp.com/send?phone=5511999999999',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the patient WhatsApp conversation with the Brazilian country code', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window);

    render(<PatientDetailPage />);

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
    mockUsePatientProfilePage.mockReturnValue(makePatientProfileState());

    render(<PatientDetailPage />);

    expect(await screen.findByRole('button', { name: /WhatsApp/ })).toBeDisabled();
  });
});
