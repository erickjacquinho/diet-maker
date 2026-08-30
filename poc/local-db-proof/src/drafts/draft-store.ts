import { PocError, type DietDraft } from '../contracts';

const DEFAULT_DATABASE_NAME = 'nutridiet-local-db-proof-drafts-v1';
const STORE_NAME = 'diet-drafts';

export interface DraftContext {
  accountId?: string;
  patientId?: string;
}

export interface DraftStore {
  save(draft: DietDraft): Promise<void>;
  get(draftId: string): Promise<DietDraft | undefined>;
  list(context?: DraftContext): Promise<DietDraft[]>;
  remove(draftId: string): Promise<void>;
  clear(): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDraft(value: unknown): value is DietDraft {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.draftId === 'string'
    && value.draftId.length > 0
    && typeof value.accountId === 'string'
    && value.accountId.length > 0
    && typeof value.patientId === 'string'
    && value.patientId.length > 0
    && (value.targetDietId === undefined || (typeof value.targetDietId === 'string' && value.targetDietId.length > 0))
    && (value.expectedVersion === undefined
      || (typeof value.expectedVersion === 'number'
        && Number.isInteger(value.expectedVersion)
        && value.expectedVersion > 0))
    && isRecord(value.payload)
    && typeof value.updatedAt === 'string'
    && value.updatedAt.length > 0;
}

function validateDraft(draft: DietDraft): void {
  if (!isDraft(draft)) {
    throw new PocError('DRAFT_FAILED', 'draft-save', 'Draft inválido: contexto, identificador e payload são obrigatórios.');
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

export class IndexedDbDraftStore implements DraftStore {
  private databasePromise?: Promise<IDBDatabase>;

  constructor(private readonly databaseName = DEFAULT_DATABASE_NAME) {}

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
          reject(new PocError('DRAFT_FAILED', 'draft-open', 'IndexedDB não está disponível para drafts.'));
          return;
        }

        const request = indexedDB.open(this.databaseName, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, { keyPath: 'draftId' });
            store.createIndex('accountId', 'accountId', { unique: false });
            store.createIndex('patientId', 'patientId', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
      });
    }

    return this.databasePromise;
  }

  async save(draft: DietDraft): Promise<void> {
    try {
      validateDraft(draft);
      const database = await this.openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(structuredClone(draft));
      await transactionDone(transaction);
    } catch (cause) {
      if (cause instanceof PocError) {
        throw cause;
      }
      throw new PocError('DRAFT_FAILED', 'draft-save', 'Não foi possível salvar o draft separado.', undefined, { cause });
    }
  }

  async get(draftId: string): Promise<DietDraft | undefined> {
    try {
      const database = await this.openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const result = await requestResult<unknown>(transaction.objectStore(STORE_NAME).get(draftId));
      if (result === undefined) {
        return undefined;
      }
      if (!isDraft(result)) {
        throw new PocError('DRAFT_FAILED', 'draft-get', 'O draft persistido não possui um formato válido.', { draftId });
      }
      return structuredClone(result);
    } catch (cause) {
      throw new PocError('DRAFT_FAILED', 'draft-get', 'Não foi possível ler o draft separado.', { draftId }, { cause });
    }
  }

  async list(context: DraftContext = {}): Promise<DietDraft[]> {
    try {
      const database = await this.openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const results = await requestResult<unknown[]>(transaction.objectStore(STORE_NAME).getAll());
      if (!results.every(isDraft)) {
        throw new PocError('DRAFT_FAILED', 'draft-list', 'O armazenamento contém um draft em formato inválido.');
      }
      return results
        .filter((draft) => !context.accountId || draft.accountId === context.accountId)
        .filter((draft) => !context.patientId || draft.patientId === context.patientId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map((draft) => structuredClone(draft));
    } catch (cause) {
      throw new PocError('DRAFT_FAILED', 'draft-list', 'Não foi possível listar os drafts separados.', undefined, { cause });
    }
  }

  async remove(draftId: string): Promise<void> {
    try {
      const database = await this.openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(draftId);
      await transactionDone(transaction);
    } catch (cause) {
      throw new PocError('DRAFT_FAILED', 'draft-remove', 'Não foi possível remover o draft separado.', { draftId }, { cause });
    }
  }

  async clear(): Promise<void> {
    try {
      const database = await this.openDatabase();
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      await transactionDone(transaction);
    } catch (cause) {
      throw new PocError('DRAFT_FAILED', 'draft-clear', 'Não foi possível limpar os drafts da PoC.', undefined, { cause });
    }
  }
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export function createDraftStore(databaseName = DEFAULT_DATABASE_NAME): IndexedDbDraftStore {
  return new IndexedDbDraftStore(databaseName);
}
