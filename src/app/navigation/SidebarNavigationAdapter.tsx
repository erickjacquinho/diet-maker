'use client';

import React, { useRef, useState, useSyncExternalStore } from 'react';
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
import * as browserComposition from '@/lib/application/browser-composition';
import { SIDEBAR_NAVIGATION_ITEMS } from './sidebar-navigation-config';

export type SidebarNavigationAdapterProps = Omit<SidebarNavProps, 'pathname' | 'navigationItems'>;

const EMPTY_PROFILE_SNAPSHOT = { status: 'empty' as const, syncState: 'unbound' as const, account: null, accountId: null, runtime: null, fileName: null, hydration: 'ready' as const, resumeFileName: null, error: null };
const EMPTY_PROFILE_SESSION = {
  getSnapshot: () => EMPTY_PROFILE_SNAPSHOT,
  subscribe: (_listener: () => void) => () => undefined,
  sync: async () => undefined,
};

type ExportState = 'idle' | 'loading' | 'error';
type RestoreState = 'idle' | 'choosing-file' | 'validating' | 'confirmation' | 'pending-edits' | 'pending-checkpoint' | 'restoring' | 'success' | 'error' | 'cancelled';

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
        return 'Salve ou descarte os rascunhos pendentes antes de importar.';
      case 'BACKUP_PENDING_CHECKPOINT':
        return 'Salve ou descarte as alterações locais pendentes antes de importar.';
      case 'BACKUP_CANCELLED':
        return 'A importação foi cancelada; a base local não foi alterada.';
      case 'BACKUP_EXPORT_FAILED':
        return 'O backup não pôde ser exportado. A base local permanece utilizável.';
      case 'BACKUP_RESTORE_FAILED':
        return 'A importação falhou; a base anterior foi preservada.';
    }
  }
  return 'Não foi possível concluir a operação de backup. A base local permanece preservada.';
}

export const SidebarNavigationAdapter: React.FC<SidebarNavigationAdapterProps> = (props) => {
  const pathname = usePathname() ?? '';
  let getProfileSession: typeof browserComposition.getBrowserProfileSession | undefined;
  try {
    getProfileSession = browserComposition.getBrowserProfileSession;
  } catch {
    // Older test adapters may only provide the backup application seam.
  }
  const hasProfileSession = typeof getProfileSession === 'function';
  const profileSession = getProfileSession?.() ?? EMPTY_PROFILE_SESSION;
  const profileSnapshot = useSyncExternalStore(profileSession.subscribe, profileSession.getSnapshot, profileSession.getSnapshot);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [restoreState, setRestoreState] = useState<RestoreState>('idle');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isRetryingProfileSync, setIsRetryingProfileSync] = useState(false);
  const [discardDraftsForRestore, setDiscardDraftsForRestore] = useState(false);
  const [restoreContent, setRestoreContent] = useState<string>();
  const [restoreFileName, setRestoreFileName] = useState<string>();
  const [feedback, setFeedback] = useState<{ kind: 'status' | 'error'; message: string }>();

  const isExporting = exportState === 'loading';
  const isRestoring = restoreState === 'validating' || restoreState === 'restoring';

  const handleRetryProfileSync = async (): Promise<void> => {
    if (isRetryingProfileSync) return;
    setIsRetryingProfileSync(true);
    setFeedback(undefined);
    try {
      await profileSession.sync();
      setFeedback({ kind: 'status', message: 'Profile sincronizado no arquivo.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'A sincronização continua pausada.';
      setFeedback({ kind: 'error', message });
      toast.error(message);
    } finally {
      setIsRetryingProfileSync(false);
    }
  };

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
    setDiscardDraftsForRestore(false);
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
      setFeedback({ kind: 'status', message: 'A importação foi cancelada; a base local não foi alterada.' });
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
    setDiscardDraftsForRestore(false);
    setRestoreState('cancelled');
    setFeedback({ kind: 'status', message: 'A importação foi cancelada; a base local não foi alterada.' });
  };

  const confirmRestore = async (options: { pendingChanges?: 'save' | 'discard'; discardDrafts?: boolean } = {}): Promise<void> => {
    if (!restoreContent || isRestoring) return;
    setRestoreState('restoring');
    setFeedback(undefined);
    try {
      const runtime = await getBrowserPatientRuntime();
      await runtime.backupApplication.restoreBackup(restoreContent, {
        confirmed: true,
        discardDrafts: options.discardDrafts ?? discardDraftsForRestore,
        ...options,
      });
      if (hasProfileSession) {
        await runtime.markWorkspaceDirty();
        try {
          await profileSession.sync();
        } catch {
          // The restored workspace stays local and the session exposes a retry after reload.
        }
      }
      setRestoreState('success');
      setRestoreDialogOpen(false);
      setDiscardDraftsForRestore(false);
      const message = 'Backup importado para o save principal. A aplicação será recarregada.';
      setFeedback({ kind: 'status', message });
      toast.success(message);
      window.location.reload();
    } catch (error) {
      if (error instanceof BackupApplicationError && error.code === 'BACKUP_PENDING_EDITS') {
        setRestoreState('pending-edits');
        toast.error('Salve ou descarte os rascunhos pendentes antes de importar.');
        return;
      }
      if (error instanceof BackupApplicationError && error.code === 'BACKUP_PENDING_CHECKPOINT') {
        setRestoreState('pending-checkpoint');
        return;
      }
      setRestoreState('error');
      const message = error instanceof Error ? error.message : getBackupErrorMessage(error);
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
        doctorName={profileSnapshot.account?.displayName ?? 'Profile ativo'}
        profileSyncState={hasProfileSession ? profileSnapshot.syncState : undefined}
        onRetryProfileSync={hasProfileSession ? handleRetryProfileSync : undefined}
        isRetryingProfileSync={hasProfileSession ? isRetryingProfileSync : undefined}
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
            <DialogTitle>Importar backup</DialogTitle>
            <DialogDescription>
              Confirme a importação do arquivo selecionado. A base local atual será substituída.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 text-style-body text-text-primary">
            <p className="break-words">Arquivo: {restoreFileName ?? 'backup selecionado'}</p>
            <p>Todos os dados atuais da Conta local serão substituídos. Não haverá mesclagem.</p>
            <p>Rascunhos ou edições pendentes precisam ser salvos ou descartados antes da importação.</p>
            <p>O arquivo não possui senha nem criptografia. Guarde-o em local seguro.</p>
            {restoreState === 'pending-edits' ? (
              <p role="alert" className="rounded-control border border-error-border bg-error-soft p-3 text-style-body text-error">
                Existem rascunhos não confirmados. Salve-os no perfil ou descarte-os explicitamente antes da restauração.
              </p>
            ) : null}
            {restoreState === 'pending-checkpoint' ? (
              <p role="alert" className="rounded-control border border-warning-border bg-warning-soft p-3 text-style-body text-warning">
                Existem alterações confirmadas ainda não gravadas no arquivo principal. Escolha salvá-las ou descartá-las antes da restauração.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="quiet" onClick={cancelRestore} disabled={isRestoring}>
              Cancelar
            </Button>
            {restoreState === 'pending-edits' ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setDiscardDraftsForRestore(true);
                  void confirmRestore({ discardDrafts: true });
                }}
              >
                Descartar rascunhos e restaurar
              </Button>
            ) : restoreState === 'pending-checkpoint' ? (
              <>
                <Button type="button" variant="secondary" onClick={() => void confirmRestore({ pendingChanges: 'save', discardDrafts: discardDraftsForRestore })}>
                  Salvar pendências e restaurar
                </Button>
                <Button type="button" variant="destructive" onClick={() => void confirmRestore({ pendingChanges: 'discard', discardDrafts: discardDraftsForRestore })}>
                  Descartar e restaurar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="destructive"
                loading={restoreState === 'restoring'}
                onClick={() => void confirmRestore()}
              >
                Importar backup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
