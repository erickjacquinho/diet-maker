import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import type { Patient } from '@/lib/patientsStore';
import PatientsListPage from '@/app/pacientes/page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const patient: Patient = {
  id: 'patient-page-1',
  name: 'Ana Lima',
  age: 32,
  gender: 'Feminino',
  heightCm: 165,
  weightKg: 62,
  targetKcal: 1800,
  targetProtein: 110,
  targetCarbs: 200,
  targetFats: 55,
  objective: 'Manutenção',
  lastConsultation: '03/08/2026',
  initials: 'AL',
  nextEvent: { date: '2026-08-03', type: 'assessment-update' },
  lastActivity: null,
};

describe('PatientsListPage', () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });

  it('keeps search, live count and the new-patient action in the toolbar', async () => {
    localStorage.setItem('nutridiet_patients', JSON.stringify([patient]));

    render(<PatientsListPage />);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar pacientes por nome ou objetivo' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 paciente');
    expect(screen.getByRole('button', { name: 'Novo paciente' })).toBeInTheDocument();
    expect(screen.queryByText('Prioridade do acompanhamento')).not.toBeInTheDocument();
    expect(screen.queryByText('Lista de pacientes', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByTestId('record-indicators').querySelector('[data-indicator="assessment"]')).toHaveClass('text-text-muted');
  });

  it('opens the existing registration dialog from the toolbar', async () => {
    localStorage.setItem('nutridiet_patients', JSON.stringify([patient]));

    render(<PatientsListPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Novo paciente' }));

    expect(screen.getByRole('dialog', { name: 'Cadastrar Novo Paciente' })).toBeInTheDocument();
    const whatsappField = screen.getByRole('textbox', { name: 'WhatsApp' });
    fireEvent.change(whatsappField, { target: { value: '11999999999' } });
    expect(whatsappField).toHaveValue('(11) 99999-9999');
  });

  it('shows a reset action when search returns no patients', async () => {
    localStorage.setItem('nutridiet_patients', JSON.stringify([patient]));

    render(<PatientsListPage />);

    const search = await screen.findByRole('searchbox', { name: 'Buscar pacientes por nome ou objetivo' });
    fireEvent.change(search, { target: { value: 'inexistente' } });

    expect(screen.getByText('Nenhum paciente encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar busca' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  it('keeps the empty-list guidance available when there are no patients', async () => {
    render(<PatientsListPage />);

    expect(await screen.findByText('Nenhum paciente cadastrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar Primeiro Paciente' })).toBeInTheDocument();
  });

  it('uses the latest recorded activity as a fallback for the diet indicator', async () => {
    localStorage.setItem(
      'nutridiet_patients',
      JSON.stringify([{
        ...patient,
        nextEvent: null,
        lastActivity: { at: '2026-08-03T10:00:00.000Z', type: 'diet' },
      }]),
    );

    render(<PatientsListPage />);

    const indicators = await screen.findByTestId('record-indicators');
    expect(indicators.querySelector('[data-indicator="assessment"]')).toHaveClass('opacity-0');
    expect(indicators.querySelector('[data-indicator="diet"]')).toHaveClass('text-text-muted');
  });
});
