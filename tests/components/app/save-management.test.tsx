import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveId = 'bf00f2cc-00c4-4c60-a074-46d1965f6089';
const ownerId = 'a4d66df7-9bf7-431f-8686-11c4ae9d6e5d';

const testState = vi.hoisted(() => ({
  snapshot: {
    status: 'empty', authorizationExpiresAt: null, syncState: 'unbound',
    account: { displayName: 'Ana Lima' }, accountId: null, runtime: null,
    fileName: null, hydration: 'ready', resumeFileName: null, error: null,
    protectedCopyRequired: false,
  } as Record<string, unknown>,
  createProfile: vi.fn(async () => undefined),
  loadProfile: vi.fn(async () => undefined),
  openSave: vi.fn(async () => undefined),
  locateSave: vi.fn(async () => undefined),
  adoptLegacyProfile: vi.fn(async () => undefined),
  signOut: vi.fn(async () => undefined),
  signOutBrowserAccount: vi.fn(async () => undefined),
  restoreFileAssociation: vi.fn(),
  inspectAssociatedSaveFile: vi.fn(),
  getBrowserPatientRuntime: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: testState.replace }),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => ({
    getSnapshot: () => testState.snapshot,
    subscribe: () => () => undefined,
    createProfile: testState.createProfile,
    loadProfile: testState.loadProfile,
    openSave: testState.openSave,
    locateSave: testState.locateSave,
    adoptLegacyProfile: testState.adoptLegacyProfile,
    signOut: testState.signOut,
  }),
  signOutBrowserAccount: testState.signOutBrowserAccount,
  getBrowserPatientRuntime: testState.getBrowserPatientRuntime,
}));

vi.mock('@/lib/infrastructure/file-system-access/browser-save-file', () => ({
  createBrowserSaveFilePort: () => ({ restoreFileAssociation: testState.restoreFileAssociation }),
  inspectAssociatedSaveFile: testState.inspectAssociatedSaveFile,
}));

import { useSaveManagement } from '@/app/navigation/useSaveManagement';

function SaveManagementTest() {
  const management = useSaveManagement(true);
  return <>{management.content}{management.dialogs}</>;
}

function stubFetch(items: unknown[] = [], totalRows = items.length) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('/api/saves?')) {
      return Response.json({ items, totalRows, canCreate: totalRows === 0, pageIndex: 0, pageSize: 50 });
    }
    if (url === '/api/auth/session') return Response.json({ user: { id: ownerId } });
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('SaveManagementTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.snapshot = {
      status: 'empty', authorizationExpiresAt: null, syncState: 'unbound',
      account: { displayName: 'Ana Lima' }, accountId: null, runtime: null,
      fileName: null, hydration: 'ready', resumeFileName: null, error: null,
      protectedCopyRequired: false,
    };
    testState.restoreFileAssociation.mockResolvedValue({ ownerId, saveId, handle: {} });
    testState.inspectAssociatedSaveFile.mockResolvedValue('located');
  });

  it('renders without an active file and keeps unavailable backup actions disabled with an explanation', async () => {
    const fetchMock = stubFetch();
    render(<SaveManagementTest />);

    expect(await screen.findByRole('heading', { name: 'Saves da conta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Arquivos locais' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar backup' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Importar backup' })).toBeDisabled();
    expect(await screen.findByText(/Abra um arquivo autorizado/)).toBeInTheDocument();
    expect(screen.getByText(/Nenhum arquivo associado ainda/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/saves?page=0&pageSize=50', expect.objectContaining({ cache: 'no-store' }));
    expect(testState.getBrowserPatientRuntime).not.toHaveBeenCalled();
    expect(testState.replace).not.toHaveBeenCalled();
  });

  it('distinguishes a catalog failure from an empty account', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ code: 'UNAVAILABLE' }, { status: 503 })));
    render(<SaveManagementTest />);

    expect(await screen.findByRole('alert')).toHaveTextContent('O catálogo de saves está indisponível. Tente novamente.');
    expect(screen.queryByText(/Nenhum arquivo associado/)).not.toBeInTheDocument();
  });

  it('creates a save only after the backend enables creation', async () => {
    stubFetch();
    render(<SaveManagementTest />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Criar save' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Criar save' }));
    fireEvent.change(await screen.findByLabelText('Nome'), { target: { value: 'Consultório Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar profile' }));
    await waitFor(() => expect(testState.createProfile).toHaveBeenCalledWith({ displayName: 'Consultório Ana', phone: '' }));
  });

  it('routes import, open, locate and legacy adoption through the existing profile session', async () => {
    testState.snapshot = { ...testState.snapshot, protectedCopyRequired: true };
    stubFetch([{ saveId, label: 'Clínica Ana', createdAt: '2026-10-10T12:00:00.000Z' }]);
    render(<SaveManagementTest />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Criar save' })).toBeDisabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar arquivo' }));
    await waitFor(() => expect(testState.loadProfile).toHaveBeenCalledOnce());

    const open = await screen.findByRole('button', { name: 'Abrir save Clínica Ana (bf00f2cc)' });
    fireEvent.click(open);
    await waitFor(() => expect(testState.openSave).toHaveBeenCalledWith(saveId, expect.objectContaining({ ownerId, saveId })));

    fireEvent.click(screen.getByRole('button', { name: 'Localizar save Clínica Ana (bf00f2cc)' }));
    await waitFor(() => expect(testState.locateSave).toHaveBeenCalledWith(saveId));

    fireEvent.click(screen.getByRole('button', { name: 'Proteger cópia importada' }));
    await waitFor(() => expect(testState.adoptLegacyProfile).toHaveBeenCalledOnce());
    expect(testState.replace).not.toHaveBeenCalled();
  });
});
