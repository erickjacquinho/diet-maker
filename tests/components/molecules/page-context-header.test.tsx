import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageContextHeader } from '@/components/molecules/PageContextHeader';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PageContextHeader contract', () => {
  it('renders the explicit return link, dynamic ancestors and a non-navigable current item', () => {
    render(
      <PageContextHeader
        title="Elaboração de Dieta"
        backHref="/pacientes/patient-1"
        backLabel="Voltar para a ficha de Ana Lima"
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: 'Ana Lima', href: '/pacientes/patient-1' },
          { label: 'Dieta' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Elaboração de Dieta' })).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: 'Voltar para a ficha de Ana Lima' });
    expect(backLink).toHaveAttribute('href', '/pacientes/patient-1');

    const breadcrumb = screen.getByRole('navigation', { name: 'Navegação contextual' });
    expect(within(breadcrumb).getByRole('link', { name: 'Pacientes' })).toHaveAttribute('href', '/pacientes');
    expect(within(breadcrumb).getByRole('link', { name: 'Ana Lima' })).toHaveAttribute(
      'href',
      '/pacientes/patient-1',
    );

    const currentItem = within(breadcrumb).getByText('Dieta');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem.closest('a')).toBeNull();
  });

  it('keeps actions optional and preserves the full dynamic patient label', () => {
    render(
      <PageContextHeader
        title="Perfil do paciente"
        backHref="/pacientes"
        backLabel="Voltar para Pacientes"
        breadcrumbs={[{ label: 'Pacientes', href: '/pacientes' }, { label: 'Paciente com nome longo' }]}
      />,
    );

    expect(screen.getByText('Paciente com nome longo')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Ações da página' })).not.toBeInTheDocument();
  });

  it('renders supplied actions in a named region without changing the reading order', () => {
    const onPrint = vi.fn();

    render(
      <PageContextHeader
        title="Consulta"
        backHref="/pacientes/patient-1"
        backLabel="Voltar para a ficha do paciente"
        breadcrumbs={[
          { label: 'Pacientes', href: '/pacientes' },
          { label: 'Ana Lima', href: '/pacientes/patient-1' },
          { label: 'Consulta' },
        ]}
        actions={<button type="button" onClick={onPrint}>Imprimir</button>}
      />,
    );

    const header = screen.getByRole('banner');
    const backLink = within(header).getByRole('link', { name: 'Voltar para a ficha do paciente' });
    const breadcrumb = within(header).getByRole('navigation', { name: 'Navegação contextual' });
    const heading = within(header).getByRole('heading', { level: 1, name: 'Consulta' });
    const actions = within(header).getByRole('group', { name: 'Ações da página' });

    expect(within(actions).getByRole('button', { name: 'Imprimir' })).toBeInTheDocument();
    fireEvent.focus(backLink);
    expect(backLink).toHaveClass('focus-visible:ring-2');
    fireEvent.keyDown(within(actions).getByRole('button', { name: 'Imprimir' }), { key: 'Enter' });
    fireEvent.click(within(actions).getByRole('button', { name: 'Imprimir' }));
    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(backLink.compareDocumentPosition(breadcrumb) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(breadcrumb.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
