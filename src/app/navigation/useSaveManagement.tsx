'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/atoms';
import { ProfileCreateDialog } from '@/components/molecules/profile-create-dialog';
import { SavesDashboard, type SaveCatalogItem, type SaveLocationState } from '@/components/organisms/SavesDashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BackupApplicationError } from '@/lib/application/backup-application';
import { getBrowserPatientRuntime, getBrowserProfileSession } from '@/lib/application/browser-composition';
import { createBrowserSaveFilePort, inspectAssociatedSaveFile } from '@/lib/infrastructure/file-system-access/browser-save-file';
import type { SaveFileAssociation } from '@/lib/persistence/save-file';

const pageSize = 50;
const saveIdPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

interface SaveCatalogPage {
  items: SaveCatalogItem[];
  totalRows: number;
}

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
      case 'BACKUP_AUTH_REQUIRED':
        return 'Autorize novamente este save antes de exportar ou importar um backup.';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCatalogPage(value: unknown): SaveCatalogPage {
  if (!isRecord(value) || !Array.isArray(value.items) || !Number.isSafeInteger(value.totalRows) || (value.totalRows as number) < 0) {
    throw new Error('O catálogo de saves retornou uma resposta inválida.');
  }
  const items = value.items.map((row): SaveCatalogItem => {
    if (
      !isRecord(row)
      || typeof row.saveId !== 'string' || !saveIdPattern.test(row.saveId)
      || typeof row.label !== 'string' || row.label.length < 1 || row.label.length > 80
      || typeof row.createdAt !== 'string' || !Number.isFinite(Date.parse(row.createdAt))
    ) throw new Error('O catálogo de saves retornou uma linha inválida.');
    return { saveId: row.saveId, label: row.label, createdAt: row.createdAt };
  });
  if (items.length > pageSize) throw new Error('O catálogo de saves excedeu o limite da página.');
  return { items, totalRows: value.totalRows as number };
}

function catalogError(response: Response, body: unknown): string {
  const code = isRecord(body) && typeof body.code === 'string' ? body.code : '';
  if (response.status === 401 || code === 'AUTH_REQUIRED') return 'Sua sessão expirou. Entre novamente para ver seus saves.';
  if (response.status === 403 || code === 'PROFILE_REQUIRED') return 'Conclua seu cadastro para acessar os saves.';
  return 'O catálogo de saves está indisponível. Tente novamente.';
}

function locationErrorState(error: unknown): SaveLocationState | null {
  const code = isRecord(error) && typeof error.code === 'string' ? error.code : '';
  if (code === 'SAVE_NOT_LOCATED') return 'not-located';
  if (code === 'SAVE_REFERENCE_LOST') return 'reference-lost';
  if (code === 'SAVE_PERMISSION_DENIED') return 'permission-required';
  if (error instanceof DOMException && error.name === 'NotAllowedError') return 'permission-required';
  if (error instanceof DOMException && error.name === 'NotFoundError') return 'reference-lost';
  return null;
}

export function useSaveManagement(enabled: boolean, onSignOut: () => Promise<void>) {
  const session = getBrowserProfileSession();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState<SaveCatalogItem[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [locations, setLocations] = useState<Record<string, SaveLocationState>>({});
  const [associations, setAssociations] = useState<Record<string, SaveFileAssociation>>({});
  const [loading, setLoading] = useState(true);
  const [catalogErrorMessage, setCatalogErrorMessage] = useState<string | null>(null);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [restoreState, setRestoreState] = useState<RestoreState>('idle');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [discardDraftsForRestore, setDiscardDraftsForRestore] = useState(false);
  const [restoreContent, setRestoreContent] = useState<string>();
  const [restoreFileName, setRestoreFileName] = useState<string>();
  const [feedback, setFeedback] = useState<{ kind: 'status' | 'error'; message: string }>();

  const canBackup = Boolean(snapshot.runtime) && ['active', 'paused', 'busy'].includes(snapshot.status);
  const isExporting = exportState === 'loading';
  const isRestoring = restoreState === 'validating' || restoreState === 'restoring';

  const handleExportBackup = async (): Promise<void> => {
    if (!canBackup) return;
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
    if (!canBackup || isExporting || isRestoring) return;
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

  const handleRestoreFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      setRestoreState('cancelled');
      setFeedback({ kind: 'status', message: 'A importação foi cancelada; a base local não foi alterada.' });
      return;
    }
    if (!canBackup) return;

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
    if (!canBackup || !restoreContent || isRestoring) return;
    setRestoreState('restoring');
    setFeedback(undefined);
    try {
      const runtime = await getBrowserPatientRuntime();
      await runtime.backupApplication.restoreBackup(restoreContent, {
        confirmed: true,
        discardDrafts: options.discardDrafts ?? discardDraftsForRestore,
        ...options,
      });
      await runtime.markWorkspaceDirty();
      try {
        await session.sync();
      } catch {
        // The restored workspace stays local and the session exposes a retry after reload.
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

  const backupState = isExporting ? 'exporting' : isRestoring ? 'restoring' : 'idle';

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setCatalogErrorMessage(null);
    setAssociations({});

    void (async () => {
      try {
        const response = await fetch(`/api/saves?page=${pageIndex}&pageSize=${pageSize}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error(catalogError(response, body));
        const page = parseCatalogPage(body);
        if (cancelled) return;
        setItems(page.items);
        setTotalRows(page.totalRows);
        setLocations(Object.fromEntries(page.items.map(({ saveId }) => [saveId, 'checking'])));

        const authResponse = await fetch('/api/auth/session', { cache: 'no-store', signal: controller.signal });
        const authBody: unknown = await authResponse.json().catch(() => null);
        const ownerId = isRecord(authBody) && isRecord(authBody.user) ? authBody.user.id : null;
        if (!authResponse.ok || typeof ownerId !== 'string') {
          if (!cancelled) setLocations(Object.fromEntries(page.items.map(({ saveId }) => [saveId, 'not-located'])));
          return;
        }

        const filePort = createBrowserSaveFilePort();
        const entries = await Promise.all(page.items.map(async ({ saveId }): Promise<{
          saveId: string;
          state: SaveLocationState;
          association: SaveFileAssociation | null;
        }> => {
          try {
            const association = await filePort.restoreFileAssociation?.({ ownerId, saveId }) ?? null;
            if (!association) return { saveId, state: 'not-located', association: null };
            return { saveId, state: await inspectAssociatedSaveFile(filePort, association), association };
          } catch (error) {
            const state = error instanceof DOMException && error.name === 'NotAllowedError'
              ? 'permission-required'
              : 'reference-lost';
            return { saveId, state, association: null };
          }
        }));
        if (!cancelled) {
          setLocations(Object.fromEntries(entries.map(({ saveId, state }) => [saveId, state])));
          setAssociations(Object.fromEntries(entries.flatMap(({ saveId, association }) => (
            association ? [[saveId, association] as const] : []
          ))));
        }
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        setCatalogErrorMessage(error instanceof Error ? error.message : 'O catálogo de saves está indisponível. Tente novamente.');
        setItems([]);
        setTotalRows(0);
        setLocations({});
        setAssociations({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  // The open save's name changes when it is renamed in Settings; refetch so the catalog label matches.
  }, [enabled, pageIndex, refreshKey, snapshot.accountId, snapshot.account?.displayName]);

  const runSessionAction = async (action: () => Promise<void>, saveId?: string) => {
    try {
      await action();
      setRefreshKey((value) => value + 1);
    } catch (error) {
      if (saveId) {
        const state = locationErrorState(error);
        if (state) setLocations((current) => ({ ...current, [saveId]: state }));
      }
      throw error;
    }
  };

  return {
    overlayOpen: createOpen || restoreDialogOpen,
    busy: snapshot.status === 'busy' || isExporting || isRestoring,
    content: (
      <SavesDashboard
        items={items}
        totalRows={totalRows}
        pageIndex={pageIndex}
        pageSize={pageSize}
        locations={locations}
        loading={loading}
        error={catalogErrorMessage}
        actionBusy={snapshot.status === 'busy' || isExporting || isRestoring ? 'profile-session' : null}
        protectedCopyRequired={snapshot.protectedCopyRequired}
        backupState={backupState}
        backupUnavailableReason={canBackup ? undefined : 'Abra um arquivo autorizado para exportar ou restaurar um backup.'}
        onPageChange={setPageIndex}
        onCreateRequest={() => setCreateOpen(true)}
        onImport={() => runSessionAction(() => session.loadProfile())}
        onSignOut={onSignOut}
        onOpen={(saveId) => runSessionAction(() => session.openSave(saveId, associations[saveId]), saveId)}
        onLocate={(saveId) => runSessionAction(() => session.locateSave(saveId), saveId)}
        onAdoptLegacy={() => runSessionAction(() => session.adoptLegacyProfile())}
        onExportBackup={handleExportBackup}
        onRestoreBackup={handleChooseRestoreFile}
      />
    ),
    dialogs: (
      <>
        <ProfileCreateDialog open={createOpen} onOpenChange={setCreateOpen}
          onSubmit={(input) => runSessionAction(() => session.createProfile(input))} />
        <Input
          ref={fileInputRef}
          type="file"
          accept=".nutridiet,application/json"
          aria-label="Selecionar arquivo de backup NutriDiet"
          // Picker-only control opened programmatically; `hidden` removes the recipe's full-width box from layout.
          className="hidden"
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
              <p>Este arquivo é cifrado para o save autorizado e exige a conta vinculada para ser aberto.</p>
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
    ),
  };
}
