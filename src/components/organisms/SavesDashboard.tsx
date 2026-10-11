'use client';

import { useState } from 'react';
import { FolderOpen, LogOut, MapPin, Plus } from 'lucide-react';
import { Badge, Button } from '@/components/atoms';
import { DataTable, type DataTableColumnDef } from '@/components/molecules/DataTable';
import { ProfileCreateDialog } from '@/components/molecules/profile-create-dialog';
import { Card } from '@/components/ui/card';
import type { CreateProfileInput } from '@/lib/application/profile-session';

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
  onPageChange(pageIndex: number): void;
  onCreate(input: CreateProfileInput): Promise<void>;
  onImport(): Promise<void>;
  onSignOut(): Promise<void>;
  onOpen(saveId: string): Promise<void>;
  onLocate(saveId: string): Promise<void>;
  onAdoptLegacy(): Promise<void>;
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
  onPageChange,
  onCreate,
  onImport,
  onSignOut,
  onOpen,
  onLocate,
  onAdoptLegacy,
}: SavesDashboardProps) {
  const [createOpen, setCreateOpen] = useState(false);
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
    <main className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 p-8" data-route="saves-dashboard">
      <header className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-style-overline font-semibold text-primary">NutriDiet Local Pro</p>
          <h1 className="text-style-page-title font-bold text-text-primary">Seus saves</h1>
          <p className="text-style-body-large text-text-secondary">Escolha um arquivo local para abrir ou associe novamente um save da sua conta.</p>
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
          <Button type="button" variant="primary" disabled={Boolean(busy)} onClick={() => setCreateOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            Criar save
          </Button>
        </div>
      </header>

      <Card className="flex flex-col gap-4 p-6" aria-busy={loading || Boolean(busy) || undefined}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-style-section-title font-semibold text-text-primary">Catálogo da conta</h2>
          <p className="text-style-body-small text-text-secondary" aria-live="polite">
            {totalRows} {totalRows === 1 ? 'save' : 'saves'}
          </p>
        </div>
        <p className="text-style-body-small text-text-secondary">Sincronizado indica que o arquivo local foi encontrado e reconhecido; não há cópia dos dados clínicos na nuvem.</p>
        <DataTable
          ariaLabel="Seus saves"
          caption="Saves vinculados à sua conta e sua disponibilidade neste navegador."
          data={items}
          columns={columns}
          getRowId={(row) => row.saveId}
          emptyMessage="Nenhum save online ainda. Crie um save ou importe um arquivo existente."
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

      <ProfileCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={onCreate} />
    </main>
  );
}
