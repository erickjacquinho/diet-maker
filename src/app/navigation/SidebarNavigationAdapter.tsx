'use client';

import React, { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { Button, Input } from '@/components/atoms';
import { SidebarNav, type SidebarNavProps } from '@/components/organisms/SidebarNav';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BackupApplicationError } from '@/lib/application/backup-application';
import { getBrowserPatientRuntime } from '@/lib/application/browser-composition';
import { SIDEBAR_NAVIGATION_ITEMS } from './sidebar-navigation-config';

export type SidebarNavigationAdapterProps = Omit<SidebarNavProps, 'pathname' | 'navigationItems'>;

type ExportState = 'idle' | 'loading' | 'error';
type RestoreState = 'idle' | 'choosing-file' | 'validating' | 'confirmation' | 'pending-edits' | 'restoring' | 'success' | 'error' | 'cancelled';

function getBackupErrorMessage(error: unknown): string {
  if (error instanceof BackupApplicationError) {
    switch (error.code) {
      case 'BACKUP_FORMAT_INVALID':
        return 'O arquivo não é um backup NutriDiet válido.';
      case 'BACKUP_APP_MISMATCH':
        return 'Este backup pertence a outra Conta local ou aplicação.';
      case 'BACKUP_VERSION_UNSUPPORTED':
        return 'A versão deste backup não é compatível com a aplicação atual.';
      case 'BACKUP_RELATION_INVALID':
        return 'O backup contém relações de dados inválidas e não foi aplicado.';
      case 'BACKUP_PENDING_EDITS':
        return 'Salve ou descarte os rascunhos pendentes antes de restaurar.';
      case 'BACKUP_CANCELLED':
        return 'A restauração foi cancelada; a base local não foi alterada.';
      case 'BACKUP_EXPORT_FAILED':
        return 'O backup não pôde ser exportado. A base local permanece utilizável.';
      case 'BACKUP_RESTORE_FAILED':
        return 'A restauração falhou; a base anterior foi preservada.';
    }
  }
  return 'Não foi possível concluir a operação de backup. A base local permanece preservada.';
}

export const SidebarNavigationAdapter: React.FC<SidebarNavigationAdapterProps> = (props) => {
  const pathname = usePathname() ?? '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [restoreState, setRestoreState] = useState<RestoreState>('idle');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreContent, setRestoreContent] = useState<string>();
  const [restoreFileName, setRestoreFileName] = useState<string>();
  const [feedback, setFeedback] = useState<{ kind: 'status' | 'error'; message: string }>();

  const isExporting = exportState === 'loading';
  const isRestoring = restoreState === 'validating' || restoreState === 'restoring';

  const handleExportBackup = async (): Promise<void> => {
    setExportState('loading');
    setFeedback(undefined);
    try {
      const runtime = await getBrowserPatientRuntime();
      const result = await runtime.backupApplication.exportBackup();
      const blob = new Blob([result.content], { type: 'application/json;charset=utf-8' });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = result.fileName;
      link.click();
      window.URL.revokeObjectURL(objectUrl);
      setExportState('idle');
      const message = `Backup exportado como ${result.fileName}.`;
      setFeedback({ kind: 'status', message });
      toast.success(message);
    } catch (error) {
      setExportState('error');
      const message = getBackupErrorMessage(error);
      setFeedback({ kind: 'error', message });
      toast.error(message);
    }
  };

  const handleChooseRestoreFile = (): void => {
    if (isExporting || isRestoring) return;
    setFeedback(undefined);
    setRestoreContent(undefined);
    setRestoreFileName(undefined);
    setRestoreState('choosing-file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRestoreFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      setRestoreState('cancelled');
      setFeedback({ kind: 'status', message: 'A restauração foi cancelada; a base local não foi alterada.' });
      return;
    }

    setRestoreState('validating');
    setFeedback(undefined);
    try {
      const content = await file.text();
      const runtime = await getBrowserPatientRuntime();
      await runtime.backupApplication.validateBackup(content);
      setRestoreContent(content);
      setRestoreFileName(file.name);
      setRestoreState('confirmation');
      setRestoreDialogOpen(true);
    } catch (error) {
      setRestoreState('error');
      const message = getBackupErrorMessage(error);
      setFeedback({ kind: 'error', message });
      toast.error(message);
    }
  };

  const cancelRestore = (): void => {
    if (restoreState === 'restoring') return;
    setRestoreDialogOpen(false);
    setRestoreContent(undefined);
    setRestoreFileName(undefined);
    setRestoreState('cancelled');
    setFeedback({ kind: 'status', message: 'A restauração foi cancelada; a base local não foi alterada.' });
  };

  const confirmRestore = async (): Promise<void> => {
    if (!restoreContent || isRestoring) return;
    setRestoreState('restoring');
    setFeedback(undefined);
    try {
      const runtime = await getBrowserPatientRuntime();
      await runtime.backupApplication.restoreBackup(restoreContent, { confirmed: true });
      setRestoreState('success');
      setRestoreDialogOpen(false);
      const message = 'Backup restaurado. A aplicação será recarregada.';
      setFeedback({ kind: 'status', message });
      toast.success(message);
      window.location.reload();
    } catch (error) {
      if (error instanceof BackupApplicationError && error.code === 'BACKUP_PENDING_EDITS') {
        setRestoreState('pending-edits');
        toast.error('Salve ou descarte os rascunhos pendentes antes de restaurar.');
        return;
      }
      setRestoreState('error');
      const message = getBackupErrorMessage(error);
      setFeedback({ kind: 'error', message });
      toast.error(message);
    }
  };

  return (
    <>
      <SidebarNav
        {...props}
        pathname={pathname}
        navigationItems={SIDEBAR_NAVIGATION_ITEMS}
        onExportBackup={handleExportBackup}
        onRestoreBackup={handleChooseRestoreFile}
        isExporting={isExporting}
        isRestoring={isRestoring}
      />

      <Input
        ref={fileInputRef}
        type="file"
        accept=".nutridiet,application/json"
        aria-label="Selecionar arquivo de backup NutriDiet"
        className="sr-only"
        onChange={handleRestoreFile}
        tabIndex={-1}
      />

      <div
        aria-live="polite"
        className="sr-only"
        data-backup-feedback={feedback?.kind ?? 'none'}
        role={feedback?.kind === 'error' ? 'alert' : 'status'}
      >
        {feedback?.message ?? ''}
      </div>

      <Dialog
        open={restoreDialogOpen}
        onOpenChange={(open) => {
          if (!open) cancelRestore();
        }}
      >
        <DialogContent data-backup-restore-state={restoreState}>
          <DialogHeader>
            <DialogTitle>Restaurar backup</DialogTitle>
            <DialogDescription>
              Confirme a substituição da base local pelo arquivo selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 text-style-body text-text-primary">
            <p className="break-words">Arquivo: {restoreFileName ?? 'backup selecionado'}</p>
            <p>Todos os dados atuais da Conta local serão substituídos. Não haverá mesclagem.</p>
            <p>Rascunhos ou edições pendentes precisam ser salvos ou descartados antes da restauração.</p>
            <p>O arquivo não possui senha nem criptografia. Guarde-o em local seguro.</p>
            {restoreState === 'pending-edits' ? (
              <p role="alert" className="rounded-control border border-error-border bg-error-soft p-3 text-style-body text-error">
                Existem rascunhos pendentes. Resolva-os e confirme novamente; nenhum dado foi alterado.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="quiet" onClick={cancelRestore} disabled={isRestoring}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={restoreState === 'restoring'}
              onClick={confirmRestore}
            >
              Restaurar backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
