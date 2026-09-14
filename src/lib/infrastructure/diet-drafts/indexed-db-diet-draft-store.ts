import { DietDomainError } from '@/lib/domain/diets/diet-errors';
import type { AutosaveResult, DietDraft } from '@/lib/domain/diets/diet-model';
import type { DietDraftStore, DraftContext } from '@/lib/application/diets/diet-ports';

const DRAFT_STORE = 'diet-drafts';
const CONTEXT_INDEX = 'contextKey';
const PATIENT_INDEX = 'patientScope';

export interface IndexedDbDietDraftStoreOptions {
  databaseName?: string;
  indexedDB?: IDBFactory;
  now?: () => string;
}

function contextKey(context: DraftContext): string {
  return `${context.accountId}|${context.patientId}|${context.routeDietId}`;
}

function cloneDraft(draft: DietDraft): DietDraft {
  return structuredClone(draft);
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function persistenceError(cause: unknown): DietDomainError {
  if (cause instanceof DietDomainError) return cause;
  return new DietDomainError('PERSISTENCE_UNAVAILABLE', 'O rascunho não pôde ser persistido no armazenamento local.', { cause });
}

export class IndexedDbDietDraftStore implements DietDraftStore {
  private readonly databaseName: string;
  private readonly factory: IDBFactory;
  private readonly now: () => string;
  private databasePromise: Promise<IDBDatabase> | undefined;

  constructor(options: IndexedDbDietDraftStoreOptions = {}) {
    this.databaseName = options.databaseName ?? 'nutridiet-diet-drafts-v1';
    this.factory = options.indexedDB ?? globalThis.indexedDB;
    this.now = options.now ?? (() => new Date().toISOString());
    if (!this.factory) throw new DietDomainError('PERSISTENCE_UNAVAILABLE', 'IndexedDB não está disponível para rascunhos.');
  }

  private open(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    const openingPromise = new Promise<IDBDatabase>((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = this.factory.open(this.databaseName, 1);
      } catch (cause) {
        reject(persistenceError(cause));
        return;
      }
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DRAFT_STORE)) {
          const store = database.createObjectStore(DRAFT_STORE, { keyPath: 'draftId' });
          store.createIndex(CONTEXT_INDEX, 'contextKey', { unique: true });
          store.createIndex(PATIENT_INDEX, ['accountId', 'patientId'], { unique: false });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => reject(persistenceError(request.error));
      request.onblocked = () => reject(new DietDomainError('PERSISTENCE_UNAVAILABLE', 'O armazenamento de rascunhos está bloqueado por outra conexão.'));
    });
    const databasePromise = openingPromise.catch((cause: unknown): never => {
      this.databasePromise = undefined;
      throw persistenceError(cause);
    });
    this.databasePromise = databasePromise;
    return databasePromise;
  }

  private async transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => Promise<T>): Promise<T> {
    try {
      const database = await this.open();
      return await new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(DRAFT_STORE, mode);
        const store = transaction.objectStore(DRAFT_STORE);
        let result: T;
        let operationSettled = false;
        operation(store).then((value) => {
          result = value;
          operationSettled = true;
        }).catch((cause: unknown) => {
          try { transaction.abort(); } catch { /* the original error is more useful */ }
          reject(cause);
        });
        transaction.oncomplete = () => {
          if (operationSettled) resolve(result);
        };
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
      });
    } catch (cause) {
      throw persistenceError(cause);
    }
  }

  async create(document: DietDraft, context: DraftContext): Promise<DietDraft> {
    const draft = cloneDraft({ ...document, accountId: context.accountId, patientId: context.patientId, routeDietId: context.routeDietId, contextKey: contextKey(context), state: 'EDITABLE', updatedAt: document.updatedAt || this.now() });
    return this.transaction('readwrite', async (store) => {
      const existing = await requestValue(store.index(CONTEXT_INDEX).getKey(draft.contextKey));
      if (existing !== undefined) throw new DietDomainError('VERSION_CONFLICT', 'Já existe um rascunho para este contexto.');
      await requestValue(store.add(draft));
      return cloneDraft(draft);
    });
  }

  async getByContext(accountId: string, patientId: string, routeDietId: string): Promise<DietDraft | null> {
    return this.transaction('readonly', async (store) => {
      const value = await requestValue(store.index(CONTEXT_INDEX).get(`${accountId}|${patientId}|${routeDietId}`));
      return value ? cloneDraft(value as DietDraft) : null;
    });
  }

  async get(draftId: string): Promise<DietDraft | null> {
    return this.transaction('readonly', async (store) => {
      const value = await requestValue(store.get(draftId));
      return value ? cloneDraft(value as DietDraft) : null;
    });
  }

  async putIfNewer(draft: DietDraft, expectedPreviousRevision: number): Promise<AutosaveResult> {
    return this.transaction('readwrite', async (store) => {
      const currentValue = await requestValue(store.get(draft.draftId));
      const current = currentValue as DietDraft | undefined;
      if (!current) return { status: 'SUPERSEDED', currentRevision: 0 };
      if (current.state !== 'EDITABLE') return { status: 'INVALIDATED' };
      if (current.draftRevision !== expectedPreviousRevision || draft.draftRevision <= current.draftRevision) return { status: 'SUPERSEDED', currentRevision: current.draftRevision };
      const next = cloneDraft({ ...draft, contextKey: draft.contextKey, draftRevision: current.draftRevision + 1, updatedAt: draft.updatedAt || this.now() });
      await requestValue(store.put(next));
      return { status: 'SAVED', revision: next.draftRevision, updatedAt: next.updatedAt };
    });
  }

  async reserveTargetId(draftId: string, expectedRevision: number, targetDietId: string): Promise<DietDraft | null> {
    return this.transaction('readwrite', async (store) => {
      const value = await requestValue(store.get(draftId));
      const current = value as DietDraft | undefined;
      if (!current) return null;
      if (current.state !== 'EDITABLE') throw new DietDomainError('ARCHIVED_PATIENT', 'O rascunho foi invalidado pelo arquivamento do paciente.');
      if (current.draftRevision !== expectedRevision) throw new DietDomainError('VERSION_CONFLICT', 'O rascunho foi alterado antes da reserva da identidade.');
      if (current.targetDietId && current.targetDietId !== targetDietId) throw new DietDomainError('VERSION_CONFLICT', 'A identidade da dieta já foi reservada para este rascunho.');
      const next = cloneDraft({ ...current, targetDietId });
      await requestValue(store.put(next));
      return next;
    });
  }

  async removeIfRevision(draftId: string, expectedRevision: number): Promise<boolean> {
    return this.transaction('readwrite', async (store) => {
      const value = await requestValue(store.get(draftId));
      const current = value as DietDraft | undefined;
      if (!current || current.draftRevision !== expectedRevision) return false;
      await requestValue(store.delete(draftId));
      return true;
    });
  }

  async invalidateByPatient(accountId: string, patientId: string): Promise<number> {
    return this.transaction('readwrite', async (store) => {
      const values = await requestValue(store.getAll());
      let count = 0;
      for (const value of values as DietDraft[]) {
        if (value.accountId === accountId && value.patientId === patientId && value.state === 'EDITABLE') {
          await requestValue(store.put(cloneDraft({ ...value, state: 'INVALIDATED_BY_PATIENT_ARCHIVE' })));
          count += 1;
        }
      }
      return count;
    });
  }

  async listRecoverableByPatient(accountId: string, patientId: string): Promise<DietDraft[]> {
    return this.transaction('readonly', async (store) => {
      const values = await requestValue(store.index(PATIENT_INDEX).getAll([accountId, patientId]));
      return (values as DietDraft[]).filter((draft) => draft.state === 'EDITABLE').map(cloneDraft);
    });
  }

  async listRecoverableByAccount(accountId: string): Promise<DietDraft[]> {
    return this.transaction('readonly', async (store) => {
      const values = await requestValue(store.getAll());
      return (values as DietDraft[])
        .filter((draft) => draft.accountId === accountId && draft.state === 'EDITABLE')
        .map(cloneDraft);
    });
  }
}

export { contextKey as createDraftContextKey };
