import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SavesDashboard, type SavesDashboardProps } from '@/components/organisms/SavesDashboard';

const save = { saveId: 'save-a', label: 'Clínica Ana', createdAt: '2026-10-10T12:00:00.000Z' };

function renderDashboard(overrides: Partial<SavesDashboardProps> = {}) {
  const props: SavesDashboardProps = {
    items: [save],
    totalRows: 1,
    pageIndex: 0,
    pageSize: 50,
    locations: { 'save-a': 'located' },
    loading: false,
    error: null,
    actionBusy: null,
    protectedCopyRequired: false,
    onPageChange: vi.fn(),
    onCreateRequest: vi.fn(),
    onImport: vi.fn(async () => undefined),
    onSignOut: vi.fn(async () => undefined),
    onOpen: vi.fn(async () => undefined),
    onLocate: vi.fn(async () => undefined),
    onAdoptLegacy: vi.fn(async () => undefined),
    ...overrides,
  };
  return { ...render(<SavesDashboard {...props} />), props };
}

describe('SavesDashboard', () => {
  it('shows catalog rows, recognized local synchronization, and targeted open/locate actions', async () => {
    const { props } = renderDashboard();

    expect(screen.getByRole('heading', { name: 'Arquivos locais' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Arquivos locais' })).toBeInTheDocument();
    expect(screen.getByText('Sincronizado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir save Clínica Ana (save-a)' }));
    await waitFor(() => expect(props.onOpen).toHaveBeenCalledWith('save-a'));
    fireEvent.click(screen.getByRole('button', { name: 'Localizar save Clínica Ana (save-a)' }));
    await waitFor(() => expect(props.onLocate).toHaveBeenCalledWith('save-a'));
  });

  it('shows checking, permission, missing and lost-reference reasons as text', () => {
    renderDashboard({
      items: [
        { ...save, saveId: 'checking', label: 'Conferindo' },
        { ...save, saveId: 'permission', label: 'Permissão' },
        { ...save, saveId: 'missing', label: 'Sem arquivo' },
        { ...save, saveId: 'lost', label: 'Registro quebrado' },
      ],
      locations: {
        checking: 'checking',
        permission: 'permission-required',
        missing: 'not-located',
        lost: 'reference-lost',
      },
    });

    expect(screen.getByText('Verificando arquivo')).toBeInTheDocument();
    expect(screen.getByText('Desincronizado — permissão necessária')).toBeInTheDocument();
    expect(screen.getByText('Desincronizado — arquivo não localizado')).toBeInTheDocument();
    expect(screen.getByText('Desincronizado — referência perdida')).toBeInTheDocument();
  });

  it('keeps opening disabled until the persisted local handle has been restored', () => {
    const { props, rerender } = renderDashboard({ locations: { 'save-a': 'checking' } });
    const open = screen.getByRole('button', { name: 'Abrir save Clínica Ana (save-a)' });
    expect(open).toBeDisabled();

    rerender(<SavesDashboard {...props} locations={{ 'save-a': 'located' }} />);

    expect(screen.getByRole('button', { name: 'Abrir save Clínica Ana (save-a)' })).toBeEnabled();
  });

  it('exposes create and import, preserves total-row pagination, and offers legacy adoption', async () => {
    const { props } = renderDashboard({ totalRows: 53, protectedCopyRequired: true });

    expect(screen.getByRole('button', { name: 'Criar save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Importar arquivo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proteger cópia importada' })).toBeInTheDocument();
    expect(screen.getByText(/53 saves/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Criar save' }));
    expect(props.onCreateRequest).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Importar arquivo' }));
    await waitFor(() => expect(props.onImport).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'Proteger cópia importada' }));
    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }));

    await waitFor(() => {
      expect(props.onAdoptLegacy).toHaveBeenCalledOnce();
    });
    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it('lets an account with no local saves sign out from the dashboard', async () => {
    const { props } = renderDashboard({ items: [], totalRows: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => expect(props.onSignOut).toHaveBeenCalledOnce());
  });

  it('announces loading, empty and error states and surfaces action failures', async () => {
    const { rerender, props } = renderDashboard({ loading: true, items: [] });
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados.');

    rerender(<SavesDashboard {...props} loading={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum arquivo associado');

    rerender(<SavesDashboard {...props} loading={false} items={[save]} error="Catálogo indisponível." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Catálogo indisponível.');

    vi.mocked(props.onOpen).mockRejectedValueOnce(new Error('A referência local foi perdida.'));
    rerender(<SavesDashboard {...props} loading={false} items={[save]} error={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir save Clínica Ana (save-a)' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('A referência local foi perdida.'));
  });
});
