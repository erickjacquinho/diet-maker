import { createConfirmedOperationCoordinator, createPatientApplication, type PatientApplication } from './composition-root';
import { createExplicitAccountContext } from './account/get-active-account';
import { createPatientProfileReader } from './patients/patient-profile-reader';
import { createDietApplication } from './diets/diet-application';
import type { DietApplication } from './diets/diet-ports';
import { createPatientDietReader } from '@/lib/application/diets/patient-diet-reader';
import { createLibraryApplication, type LibraryApplication } from './library/library-application';
import type { Account } from '@/lib/domain/account';
import { setActiveFavoritesAccountId } from '@/lib/library-ui-adapter';
import { createOnlineProfileSession } from './online-profile-session';
import type { ProfileSession } from './profile-session';
import { createOnlinePreferences } from './online-preferences';
import { getBrowserProfessionalProfileStore } from './professional-profile-store';
import { HttpPatientRepository } from '@/lib/infrastructure/http/http-patient-repository';
import { HttpObjectiveCatalogRepository } from '@/lib/infrastructure/http/http-objective-catalog-repository';
import { HttpClinicalRepository } from '@/lib/infrastructure/http/http-clinical-repository';
import { HttpDietRepository } from '@/lib/infrastructure/http/http-diet-repository';
import { HttpDietDraftStore } from '@/lib/infrastructure/http/http-diet-draft-store';
import {
  HttpFoodCatalogRepository,
  HttpReadyDietRepository,
  HttpReadyMealRepository,
  HttpRecipeRepository,
} from '@/lib/infrastructure/http/http-library-repositories';

export interface BrowserPatientRuntime {
  readonly account: Account;
  readonly application: PatientApplication;
  readonly dietApplication: DietApplication;
  readonly libraryApplication: LibraryApplication;
  /** Sends the favorites and agenda reminders that changed since the last push. */
  pushPreferences(): Promise<void>;
}

let activeRuntime: BrowserPatientRuntime | null = null;
let profileSession: ProfileSession<BrowserPatientRuntime> | undefined;

/** The signed-in account, from the server session and the professional profile (never from a local file). */
async function loadOnlineAccount(): Promise<Account> {
  const response = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'same-origin' });
  const body: unknown = await response.json().catch(() => null);
  const user = (body as { user?: { id?: unknown; email?: unknown } } | null)?.user;
  if (!response.ok || !user || typeof user.id !== 'string') throw new Error('Entre novamente para abrir sua conta.');
  const store = getBrowserProfessionalProfileStore();
  await store.load().catch(() => undefined);
  const { profile, accountEmail } = store.getSnapshot();
  const email = typeof user.email === 'string' ? user.email : accountEmail;
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : (email ?? 'Minha conta');
  const now = new Date().toISOString();
  return { id: user.id, displayName: displayName || 'Minha conta', phone: null, createdAt: now, updatedAt: now };
}

/**
 * Builds the applications over the account API: nothing is stored in the browser, so there is no workspace to open,
 * checkpoint or lock. Favorites and agenda reminders keep their synchronous cache, hydrated here and pushed on change.
 */
export async function createOnlinePatientRuntime(account: Account): Promise<BrowserPatientRuntime> {
  const newId = () => globalThis.crypto.randomUUID();
  const preferences = createOnlinePreferences(account.id);
  await preferences.hydrate();
  const accountContext = createExplicitAccountContext(account);
  const patientRepository = new HttpPatientRepository(newId);
  const objectiveCatalogRepository = new HttpObjectiveCatalogRepository();
  const clinicalRepository = new HttpClinicalRepository(newId);
  const dietRepository = new HttpDietRepository();
  const dietReader = createPatientDietReader(dietRepository);
  const draftStore = new HttpDietDraftStore();
  const foodRepository = new HttpFoodCatalogRepository(newId);
  const recipeRepository = new HttpRecipeRepository(newId);
  const readyMealRepository = new HttpReadyMealRepository(newId);
  const readyDietRepository = new HttpReadyDietRepository(newId);
  // Every confirmed operation is already stored by the server when it returns.
  const confirmedOperation = createConfirmedOperationCoordinator(async () => undefined);
  const patientProfileReader = createPatientProfileReader(
    patientRepository,
    objectiveCatalogRepository,
    (accountId, patientId) => dietRepository.listPatientSummaries(accountId, [patientId]).then((summaries) => summaries[patientId]),
    { clinicalRepository, listRelatedCounts: (accountId, patientIds) => dietRepository.listPatientSummaries(accountId, patientIds) },
  );
  return {
    account,
    pushPreferences: () => preferences.push(),
    application: createPatientApplication({
      accountContext, patientRepository, objectiveCatalogRepository, patientProfileReader,
      // Atomicity belongs to the server: each API call is already one transaction.
      transactionRunner: { run: (operation) => operation() }, dietDraftStore: draftStore, clinicalRepository,
      patientDietReader: dietReader, confirmedOperation, idFactory: newId,
    }),
    dietApplication: createDietApplication({
      accountContext, patientReader: patientRepository, repository: dietRepository, draftStore, dietReader,
      historyViewReader: dietRepository, confirmedOperation, idFactory: newId,
      librarySourceReader: {
        getRecipe: (accountId, recipeId) => recipeRepository.getById(accountId, recipeId),
        getReadyMeal: (accountId, readyMealId) => readyMealRepository.getById(accountId, readyMealId),
      },
    }),
    libraryApplication: createLibraryApplication({ accountContext, foodRepository, recipeRepository, readyMealRepository, readyDietRepository, confirmedOperation }),
  };
}

export function activateBrowserPatientRuntime(runtime: BrowserPatientRuntime): BrowserPatientRuntime {
  activeRuntime = runtime;
  setActiveFavoritesAccountId(runtime.account.id);
  return runtime;
}

export async function disposeBrowserPatientRuntime(runtime: BrowserPatientRuntime | null | undefined): Promise<void> {
  if (!runtime) return;
  if (activeRuntime === runtime) {
    activeRuntime = null;
    setActiveFavoritesAccountId(undefined);
  }
}

export function getBrowserPatientRuntimeIfActive(): BrowserPatientRuntime | null {
  return profileSession?.isReady() ? activeRuntime : null;
}

export async function persistAgendaReminderChange(accountId: string): Promise<void> {
  if (!activeRuntime || activeRuntime.account.id !== accountId || !profileSession?.isReady()) {
    throw new Error('Sua conta ainda não está aberta para salvar o lembrete.');
  }
  await activeRuntime.pushPreferences();
}

export async function getBrowserPatientRuntime(): Promise<BrowserPatientRuntime> {
  if (!activeRuntime || !profileSession?.isReady()) throw new Error('Sua conta ainda não está aberta.');
  return activeRuntime;
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || !body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('O serviço de conta não retornou uma resposta válida.');
  }
  return body as Record<string, unknown>;
}

export async function signOutBrowserAccount(): Promise<void> {
  const body = await fetchJson('/api/auth/csrf');
  if (typeof body.csrfToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.csrfToken)) {
    throw new Error('Não foi possível preparar uma operação protegida.');
  }
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ csrfToken: body.csrfToken }),
  });
  if (!response.ok) throw new Error('Não foi possível encerrar a sessão da conta. Tente novamente.');
}

export function getBrowserProfileSession(): ProfileSession<BrowserPatientRuntime> {
  profileSession ??= createOnlineProfileSession<BrowserPatientRuntime>({
    loadAccount: loadOnlineAccount,
    createRuntime: createOnlinePatientRuntime,
    activateRuntime: activateBrowserPatientRuntime,
    disposeRuntime: disposeBrowserPatientRuntime,
    sync: () => activeRuntime?.pushPreferences() ?? Promise.resolve(),
  });
  return profileSession;
}

export async function getBrowserPatientApplication(): Promise<PatientApplication> {
  return (await getBrowserPatientRuntime()).application;
}

export async function getBrowserDietApplication(): Promise<DietApplication> {
  return (await getBrowserPatientRuntime()).dietApplication;
}

export async function getBrowserLibraryApplication(): Promise<LibraryApplication> {
  return (await getBrowserPatientRuntime()).libraryApplication;
}

export async function resetBrowserPatientRuntimeForTests(): Promise<void> {
  activeRuntime = null;
  profileSession = undefined;
}
