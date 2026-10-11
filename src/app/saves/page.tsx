'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { SavesDashboard, type SaveCatalogItem, type SaveLocationState } from '@/components/organisms/SavesDashboard';
import { getBrowserProfileSession, signOutBrowserAccount } from '@/lib/application/browser-composition';
import { createBrowserSaveFilePort, inspectAssociatedSaveFile } from '@/lib/infrastructure/file-system-access/browser-save-file';
import type { SaveFileAssociation } from '@/lib/persistence/save-file';

const pageSize = 50;
const saveIdPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

interface SaveCatalogPage {
  items: SaveCatalogItem[];
  totalRows: number;
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

export default function SavesPage() {
  const router = useRouter();
  const session = getBrowserProfileSession();
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState<SaveCatalogItem[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [locations, setLocations] = useState<Record<string, SaveLocationState>>({});
  const [associations, setAssociations] = useState<Record<string, SaveFileAssociation>>({});
  const [loading, setLoading] = useState(true);
  const [catalogErrorMessage, setCatalogErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot.runtime) return;
    router.replace('/pacientes');
  }, [router, snapshot.runtime]);

  useEffect(() => {
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
  }, [pageIndex, refreshKey, snapshot.accountId]);

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

  return (
    <SavesDashboard
      items={items}
      totalRows={totalRows}
      pageIndex={pageIndex}
      pageSize={pageSize}
      locations={locations}
      loading={loading}
      error={catalogErrorMessage}
      actionBusy={snapshot.status === 'busy' ? 'profile-session' : null}
      protectedCopyRequired={snapshot.protectedCopyRequired}
      onPageChange={setPageIndex}
      onCreate={(input) => runSessionAction(() => session.createProfile(input))}
      onImport={() => runSessionAction(() => session.loadProfile())}
      onSignOut={async () => {
        await session.signOut();
        await signOutBrowserAccount();
        router.replace('/login');
      }}
      onOpen={(saveId) => runSessionAction(() => session.openSave(saveId, associations[saveId]), saveId)}
      onLocate={(saveId) => runSessionAction(() => session.locateSave(saveId), saveId)}
      onAdoptLegacy={() => runSessionAction(() => session.adoptLegacyProfile())}
    />
  );
}
