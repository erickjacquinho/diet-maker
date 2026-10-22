'use client';

import { useState } from 'react';
import { Download, FolderOpen, LogOut, MapPin, Plus, Upload } from 'lucide-react';
import { Badge, Button } from '@/components/atoms';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { Card } from '@/components/ui/card';

export interface SaveCatalogItem {
  saveId: string;
  label: string;
  createdAt: string;
}

export type SaveLocationState = 'checking' | 'located' | 'not-located' | 'permission-required' | 'reference-lost' | 'incompatible';

export interface SavesDashboardProps {
  items: SaveCatalogItem[];
  totalRows: number;
  pageIndex: number;
  pageSize: number;
  locations: Record<string, SaveLocationState>;
  loading: boolean;
  error: string | null;
  actionBusy: string | null;
  protectedCopyRequired: boolean;
  backupState?: 'idle' | 'exporting' | 'restoring';
  backupUnavailableReason?: string;
  onPageChange(pageIndex: number): void;
  onCreateRequest(): void;
  onImport(): Promise<void>;
  onSignOut(): Promise<void>;
  onOpen(saveId: string): Promise<void>;
  onLocate(saveId: string): Promise<void>;
  onAdoptLegacy(): Promise<void>;
  onExportBackup?: () => Promise<void>;
  onRestoreBackup?: () => void;
}

const locationCopy: Record<SaveLocationState, { label: string; variant: 'neutral' | 'info' | 'warning' | 'error' }> = {
  checking: { label: 'Verificando arquivo', variant: 'neutral' },
  located: { label: 'Sincronizado', variant: 'info' },
  'not-located': { label: 'Desincronizado — arquivo não localizado', variant: 'warning' },
  'permission-required': { label: 'Desincronizado — permissão necessária', variant: 'warning' },
  'reference-lost': { label: 'Desincronizado — referência perdida', variant: 'error' },
  incompatible: { label: 'Desincronizado — arquivo incompatível', variant: 'error' },
};

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function SavesDashboard({
  items,
  totalRows,
  pageIndex,
  pageSize,
  locations,
  loading,
  error,
  actionBusy,
  protectedCopyRequired,
  backupState = 'idle',
  backupUnavailableReason,
  onPageChange,
  onCreateRequest,
  onImport,
  onSignOut,
  onOpen,
  onLocate,
  onAdoptLegacy,
  onExportBackup,
  onRestoreBackup,
}: SavesDashboardProps) {
  const [localAction, setLocalAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const busy = actionBusy ?? localAction;

  const runAction = async (key: string, action: () => Promise<void>) => {
    setActionError(null);
    setLocalAction(key);
    try {
      await action();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'A operação do save não pôde ser concluída.');
    } finally {
      setLocalAction(null);
    }
  };

  const columns: DataTableColumnDef<SaveCatalogItem>[] = [
    { id: 'label', header: 'Save', cell: (row) => row.label, sortValue: (row) => row.label, sortable: true },
    { id: 'createdAt', header: 'Criado em', cell: (row) => formatCreatedAt(row.createdAt), sortValue: (row) => row.createdAt, sortable: true },
    {
      id: 'location',
      header: 'Arquivo neste navegador',
      cell: (row) => {
        const state = locationCopy[locations[row.saveId] ?? 'checking'];
        return <Badge variant={state.variant}>{state.label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="compact"
            disabled={Boolean(busy) || loading || locations[row.saveId] === 'checking'}
            loading={busy === `open:${row.saveId}`}
            aria-label={`Abrir save ${row.label} (${row.saveId.slice(0, 8)})`}
            onClick={() => void runAction(`open:${row.saveId}`, () => onOpen(row.saveId))}
          >
            Abrir
          </Button>
          <Button
            type="button"
            size="compact"
            variant="quiet"
            disabled={Boolean(busy)}
            loading={busy === `locate:${row.saveId}`}
            aria-label={`Localizar save ${row.label} (${row.saveId.slice(0, 8)})`}
            onClick={() => void runAction(`locate:${row.saveId}`, () => onLocate(row.saveId))}
          >
            <MapPin size={14} aria-hidden="true" />
            Localizar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Gerenciar saves">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-style-section-title font-semibold text-text-primary">Saves da conta</h2>
          <p className="text-style-body-small text-text-secondary">Crie, importe ou abra os arquivos associados à sua conta.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="quiet" disabled={Boolean(busy)} onClick={() => void runAction('sign-out', onSignOut)}>
            <LogOut size={16} aria-hidden="true" />
            Sair
          </Button>
          <Button type="button" variant="secondary" disabled={Boolean(busy)} onClick={() => void runAction('import', onImport)}>
            <FolderOpen size={16} aria-hidden="true" />
            Importar arquivo
          </Button>
          <Button type="button" variant="primary" disabled={Boolean(busy)} onClick={onCreateRequest}>
            <Plus size={16} aria-hidden="true" />
            Criar save
          </Button>
        </div>
      </header>

      <Card className="flex min-w-0 flex-col gap-4 p-4" aria-busy={loading || Boolean(busy) || undefined}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-style-section-title font-semibold text-text-primary">Arquivos locais</h2>
          <p className="text-style-body-small text-text-secondary" aria-live="polite">
            {totalRows} {totalRows === 1 ? 'save' : 'saves'}
          </p>
        </div>
        <p className="text-style-body-small text-text-secondary">Sincronizado indica que o arquivo foi encontrado neste navegador; os dados clínicos continuam no save local.</p>
        {onExportBackup && onRestoreBackup ? (
          <div className="flex flex-wrap items-center gap-3" aria-busy={backupState !== 'idle' || undefined}>
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(busy) || backupState !== 'idle' || loading || Boolean(backupUnavailableReason)}
              loading={backupState === 'exporting'}
              aria-describedby={backupUnavailableReason ? 'dashboard-backup-unavailable' : undefined}
              onClick={() => void onExportBackup()}
            >
              <Download size={16} aria-hidden="true" />
              Exportar backup
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(busy) || backupState !== 'idle' || loading || Boolean(backupUnavailableReason)}
              loading={backupState === 'restoring'}
              aria-describedby={backupUnavailableReason ? 'dashboard-backup-unavailable' : undefined}
              onClick={onRestoreBackup}
            >
              <Upload size={16} aria-hidden="true" />
              Importar backup
            </Button>
            {backupUnavailableReason ? <p id="dashboard-backup-unavailable" role="status" className="text-style-body-small text-text-secondary">{backupUnavailableReason}</p> : null}
          </div>
        ) : null}
        <DataTable
          ariaLabel="Arquivos locais"
          caption="Saves vinculados à sua conta e sua disponibilidade neste navegador."
          data={items}
          columns={columns}
          getRowId={(row) => row.saveId}
          emptyMessage="Nenhum arquivo associado ainda. Crie um save ou importe um arquivo existente."
          loading={loading}
          errorMessage={error}
          pagination={{ pageIndex, pageSize, totalRows, onPageChange }}
        />
        {protectedCopyRequired ? (
          <div className="flex items-center justify-between gap-4 rounded-control border border-warning-border bg-warning-soft p-4">
            <p className="text-style-body-small text-warning">Este arquivo legado ainda não está protegido. O original será preservado.</p>
            <Button type="button" variant="secondary" disabled={Boolean(busy)} onClick={() => void runAction('adopt', onAdoptLegacy)}>
              Proteger cópia importada
            </Button>
          </div>
        ) : null}
        {actionError ? <p role="alert" className="text-style-body-small text-error">{actionError}</p> : null}
      </Card>

    </section>
  );
}
