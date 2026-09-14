import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackupApplicationError } from '@/lib/application/backup-application';
import { SidebarNavigationAdapter } from '@/app/navigation/SidebarNavigationAdapter';

const mocks = vi.hoisted(() => ({
  exportBackup: vi.fn(),
  validateBackup: vi.fn(),
  restoreBackup: vi.fn(),
}));

vi.mock('@/lib/application/browser-composition', () => ({
  getBrowserPatientRuntime: vi.fn(async () => ({
    backupApplication: {
      exportBackup: mocks.exportBackup,
      validateBackup: mocks.validateBackup,
      restoreBackup: mocks.restoreBackup,
    },
  })),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/pacientes',
}));

function createFile(content: string, name = 'backup.nutridiet'): File {
  const file = new File([content], name, { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(content) });
  return file;
}

describe('SidebarNavigationAdapter backup actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports the application result as a downloadable .nutridiet file', async () => {
    mocks.exportBackup.mockResolvedValue({
      fileName: 'nutridiet-backup-2026-09-12.nutridiet',
      content: '{"formatVersion":1}',
      envelope: {},
    });
    const createObjectURL = vi.fn(() => 'blob:backup');
    const revokeObjectURL = vi.fn();
    vi.spyOn(window.URL, 'createObjectURL').mockImplementation(createObjectURL);
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(revokeObjectURL);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<SidebarNavigationAdapter />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Profile ativo' }), { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Exportar backup' }));

    await waitFor(() => expect(mocks.exportBackup).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup');
    expect(screen.getByRole('status')).toHaveTextContent('Backup exportado como nutridiet-backup-2026-09-12.nutridiet.');
  });

  it('validates the selected file before opening the replacement confirmation', async () => {
    mocks.validateBackup.mockResolvedValue({});
    render(<SidebarNavigationAdapter />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Abrir menu de conta de Profile ativo' }), { button: 0 });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Importar backup' }));
    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mocks.validateBackup).toHaveBeenCalledWith('{"valid":true}');
    expect(screen.getByText(/Não haverá mesclagem\./)).toBeInTheDocument();
    expect(screen.getByText('O arquivo não possui senha nem criptografia. Guarde-o em local seguro.')).toBeInTheDocument();
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
    render(<SidebarNavigationAdapter />);

    const accountButton = screen.getByRole('button', { name: 'Abrir menu de conta de Profile ativo' });
    accountButton.focus();
    expect(document.activeElement).toBe(accountButton);
    fireEvent.pointerDown(accountButton, { button: 0 });
    const exportItem = await screen.findByRole('menuitem', { name: 'Exportar backup' });
    fireEvent.click(exportItem);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menu de conta de Profile ativo' })).toBeInTheDocument());
    fireEvent.pointerDown(accountButton, { button: 0 });
    const pendingMenu = await screen.findByRole('menu');
    expect(within(pendingMenu).getByRole('menuitem', { name: 'Exportar backup' })).toHaveAttribute('data-disabled');
    expect(within(pendingMenu).getByRole('menuitem', { name: 'Importar backup' })).toHaveAttribute('data-disabled');
    expect(log).not.toHaveBeenCalled();

    finishExport();
    await waitFor(() => expect(within(pendingMenu).getByRole('menuitem', { name: 'Exportar backup' })).not.toHaveAttribute('data-disabled'));
  });

  it('announces invalid files without opening the confirmation dialog', async () => {
    mocks.validateBackup.mockRejectedValue(new BackupApplicationError(
      'BACKUP_FORMAT_INVALID',
      'invalid',
    ));
    render(<SidebarNavigationAdapter />);

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
    render(<SidebarNavigationAdapter />);

    fireEvent.change(screen.getByLabelText('Selecionar arquivo de backup NutriDiet'), {
      target: { files: [createFile('{"valid":true}')] },
    });
    await screen.findByRole('dialog');

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Importar backup' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Existem rascunhos pendentes.'));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-backup-restore-state', 'pending-edits');
    expect(mocks.restoreBackup).toHaveBeenCalledWith('{"valid":true}', { confirmed: true });
  });
});
