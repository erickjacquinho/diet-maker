import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackupApplicationError } from '@/lib/application/backup-application';
import DashboardPage from '@/app/dashboard/page';

const mocks = vi.hoisted(() => ({
  exportBackup: vi.fn(),
  validateBackup: vi.fn(),
  restoreBackup: vi.fn(),
  getBrowserPatientRuntime: vi.fn(),
  snapshot: {
    status: 'active', authorizationExpiresAt: null, syncState: 'synced',
    account: { displayName: 'Ana Lima' }, accountId: 'local-account',
    runtime: {}, fileName: 'profile.nutridiet', hydration: 'ready',
    resumeFileName: null, error: null, protectedCopyRequired: false,
  } as Record<string, unknown>,
  signOut: vi.fn(async () => undefined),
  replace: vi.fn(),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserProfileSession: () => ({
    getSnapshot: () => mocks.snapshot,
    subscribe: () => () => undefined,
    signOut: mocks.signOut,
  }),
  getBrowserPatientRuntime: mocks.getBrowserPatientRuntime,
  signOutBrowserAccount: vi.fn(async () => undefined),
}));

vi.mock('@/lib/infrastructure/file-system-access/browser-save-file', () => ({
  createBrowserSaveFilePort: () => ({ restoreFileAssociation: vi.fn(async () => null) }),
  inspectAssociatedSaveFile: vi.fn(async () => 'not-located'),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

function createFile(content: string, name = 'backup.nutridiet'): File {
  const file = new File([content], name, { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(content) });
  return file;
}

describe('Dashboard backup actions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.snapshot = {
      status: 'active', authorizationExpiresAt: null, syncState: 'synced',
      account: { displayName: 'Ana Lima' }, accountId: 'local-account',
      runtime: {}, fileName: 'profile.nutridiet', hydration: 'ready',
      resumeFileName: null, error: null, protectedCopyRequired: false,
    };
    mocks.getBrowserPatientRuntime.mockResolvedValue({
      backupApplication: {
        exportBackup: mocks.exportBackup,
        validateBackup: mocks.validateBackup,
        restoreBackup: mocks.restoreBackup,
      },
      markWorkspaceDirty: vi.fn(async () => undefined),
    });
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('/api/saves?')) return Response.json({ items: [], totalRows: 0 });
      if (url === '/api/auth/session') return Response.json({ user: { id: 'owner-1' } });
      throw new Error(`Unexpected request: ${url}`);
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports the application result as a downloadable .nutridiet file', async () => {
    const encryptedContent = JSON.stringify({
      appId: 'nutridiet-local-pro',
      formatVersion: 2,
      saveId: 'bf00f2cc-00c4-4c60-a074-46d1965f6089',
      algorithm: 'AES-256-GCM',
      bindingProof: 'v1:test-key:' + 'A'.repeat(43),
      iv: 'AAAAAAAAAAAAAAAA',
      ciphertext: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    });
    mocks.exportBackup.mockResolvedValue({
      fileName: 'nutridiet-backup-2026-09-12.nutridiet',
      content: encryptedContent,
      envelope: {},
    });
    const blobs: Blob[] = [];
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockImplementation((blob) => {
      blobs.push(blob as Blob);
      return 'blob:backup';
    });
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(revokeObjectURL);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Exportar backup' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Exportar backup' }));

    await waitFor(() => expect(mocks.exportBackup).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    await expect(blobs[0].text()).resolves.toBe(encryptedContent);
    expect(encryptedContent).not.toContain('Paciente');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup');
    await waitFor(() => expect(document.querySelector('[data-backup-feedback="status"]')).toHaveTextContent('Backup exportado como nutridiet-backup-2026-09-12.nutridiet.'));
  });

  it('validates the selected file before opening the replacement confirmation', async () => {
    mocks.validateBackup.mockResolvedValue({});
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mocks.validateBackup).toHaveBeenCalledWith('{"valid":true}');
    expect(screen.getByText(/Não haverá mesclagem\./)).toBeInTheDocument();
    expect(screen.getByText('Este arquivo é cifrado para o save autorizado e exige a conta vinculada para ser aberto.')).toBeInTheDocument();
  });

  it('cancels restoration without applying the selected backup', async () => {
    mocks.validateBackup.mockResolvedValue({});
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });
    const dialog = await screen.findByRole('dialog', { name: 'Importar backup' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(document.querySelector('[data-backup-feedback="status"]')).toHaveTextContent('A importação foi cancelada; a base local não foi alterada.'));
    expect(mocks.restoreBackup).not.toHaveBeenCalled();
  });

  it('exposes loading, disabled and keyboard-operable states without logging clinical content', async () => {
    const result = {
      fileName: 'nutridiet-backup-2026-09-12.nutridiet',
      content: '{"formatVersion":1}',
      envelope: {},
    };
    let finishExport!: () => void;
    mocks.exportBackup.mockImplementation(() => new Promise((resolve) => {
      finishExport = () => resolve(result);
    }));
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    render(<DashboardPage />);

    const exportButton = screen.getByRole('button', { name: 'Exportar backup' });
    await waitFor(() => expect(exportButton).toBeEnabled());
    exportButton.focus();
    expect(document.activeElement).toBe(exportButton);
    fireEvent.click(exportButton);

    await waitFor(() => expect(exportButton).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Importar backup' })).toBeDisabled();
    expect(log).not.toHaveBeenCalled();

    finishExport();
    await waitFor(() => expect(exportButton).toBeEnabled());
  });

  it('announces invalid files without opening the confirmation dialog', async () => {
    mocks.validateBackup.mockRejectedValue(new BackupApplicationError(
      'BACKUP_FORMAT_INVALID',
      'invalid',
    ));
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('not-json')] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('O arquivo não é um backup NutriDiet válido.'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open when pending drafts block the confirmed restore', async () => {
    mocks.validateBackup.mockResolvedValue({});
    mocks.restoreBackup.mockRejectedValue(new BackupApplicationError(
      'BACKUP_PENDING_EDITS',
      'pending',
    ));
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });
    await screen.findByRole('dialog');

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Importar backup' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Existem rascunhos não confirmados.'));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-backup-restore-state', 'pending-edits');
    expect(mocks.restoreBackup).toHaveBeenCalledWith('{"valid":true}', { confirmed: true, discardDrafts: false });
    expect(screen.getByRole('button', { name: 'Descartar rascunhos e restaurar' })).toBeInTheDocument();
  });

  it('requires a save-or-discard choice when the workspace has a pending checkpoint', async () => {
    mocks.validateBackup.mockResolvedValue({});
    mocks.restoreBackup.mockRejectedValueOnce(new BackupApplicationError('BACKUP_PENDING_CHECKPOINT', 'pending'));
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled());

    fireEvent.click(screen.getByRole('button', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });
    await screen.findByRole('dialog');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Importar backup' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Escolha salvá-las ou descartá-las');
    expect(screen.getByRole('button', { name: 'Salvar pendências e restaurar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar e restaurar' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-backup-restore-state', 'pending-checkpoint');
  });

  it('does not request a runtime or enable backup without an authorized file', async () => {
    mocks.snapshot = { ...mocks.snapshot, status: 'empty', runtime: null, fileName: null };
    render(<DashboardPage />);

    expect(await screen.findByRole('heading', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar backup' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Importar backup' })).toBeDisabled();
    expect(screen.getByText(/Abra um arquivo autorizado/)).toBeInTheDocument();
    expect(mocks.getBrowserPatientRuntime).not.toHaveBeenCalled();
  });
});
