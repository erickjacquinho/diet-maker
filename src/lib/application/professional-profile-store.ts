import { parseProfessionalProfile, type ProfessionalProfile } from '@/lib/domain/professional-profile';

export type ProfessionalProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ProfessionalProfileSnapshot {
  readonly status: ProfessionalProfileStatus;
  readonly profile: ProfessionalProfile | null;
  readonly accountEmail: string | null;
  readonly error: string | null;
}

export interface ProfessionalProfileStore {
  getSnapshot(): ProfessionalProfileSnapshot;
  subscribe(listener: () => void): () => void;
  /** Loads once; concurrent and later calls reuse the result unless `force` is set. */
  load(options?: { force?: boolean }): Promise<void>;
  save(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  reset(): void;
}

export class ProfessionalProfileError extends Error {
  constructor(readonly code: 'AUTH_REQUIRED' | 'PROFILE_REQUIRED' | 'INVALID_REQUEST' | 'UNAVAILABLE', message: string) {
    super(message);
    this.name = 'ProfessionalProfileError';
  }
}

const IDLE: ProfessionalProfileSnapshot = { status: 'idle', profile: null, accountEmail: null, error: null };

export function createProfessionalProfileStore(fetcher: typeof fetch = (...args) => fetch(...args)): ProfessionalProfileStore {
  let snapshot = IDLE;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const update = (next: ProfessionalProfileSnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };

  const request = async (init?: RequestInit): Promise<{ profile: ProfessionalProfile; accountEmail: string | null }> => {
    let response: Response;
    try {
      response = await fetcher('/api/profile', { ...init, cache: 'no-store', credentials: 'same-origin' });
    } catch {
      throw new ProfessionalProfileError('UNAVAILABLE', 'Não foi possível acessar seu perfil. Verifique a conexão.');
    }
    const body = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!response.ok) {
      const code = body?.code;
      if (code === 'AUTH_REQUIRED') throw new ProfessionalProfileError('AUTH_REQUIRED', 'Sua sessão expirou. Entre novamente.');
      if (code === 'PROFILE_REQUIRED') throw new ProfessionalProfileError('PROFILE_REQUIRED', 'Conclua seu cadastro profissional.');
      if (code === 'INVALID_REQUEST') throw new ProfessionalProfileError('INVALID_REQUEST', 'Revise os campos do perfil.');
      throw new ProfessionalProfileError('UNAVAILABLE', 'Não foi possível concluir agora. Tente novamente.');
    }
    try {
      return {
        profile: parseProfessionalProfile(body?.profile),
        accountEmail: typeof body?.accountEmail === 'string' ? body.accountEmail : null,
      };
    } catch {
      throw new ProfessionalProfileError('UNAVAILABLE', 'O perfil recebido não é válido.');
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load(options) {
      if (pending) return pending;
      if (!options?.force && snapshot.status === 'ready') return Promise.resolve();
      update({ ...snapshot, status: 'loading', error: null });
      const current = request()
        .then(({ profile, accountEmail }) => update({ status: 'ready', profile, accountEmail, error: null }))
        .catch((error: unknown) => update({
          ...snapshot,
          status: 'error',
          error: error instanceof Error ? error.message : 'Não foi possível carregar seu perfil.',
        }))
        .finally(() => { if (pending === current) pending = null; });
      pending = current;
      return current;
    },
    async save(profile) {
      const csrfToken = await getCsrfToken(fetcher);
      const result = await request({
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...profile, csrfToken }),
      });
      update({ status: 'ready', profile: result.profile, accountEmail: result.accountEmail ?? snapshot.accountEmail, error: null });
      return result.profile;
    },
    reset() {
      pending = null;
      update(IDLE);
    },
  };
}

async function getCsrfToken(fetcher: typeof fetch): Promise<string> {
  try {
    const response = await fetcher('/api/auth/csrf', { cache: 'no-store', credentials: 'same-origin' });
    const body = await response.json() as { csrfToken?: unknown };
    if (response.ok && typeof body.csrfToken === 'string' && /^[A-Za-z0-9_-]{43}$/.test(body.csrfToken)) return body.csrfToken;
  } catch {
    // Reported below with the same message as a malformed response.
  }
  throw new ProfessionalProfileError('UNAVAILABLE', 'Não foi possível preparar uma operação protegida.');
}

let browserStore: ProfessionalProfileStore | undefined;

export function getBrowserProfessionalProfileStore(): ProfessionalProfileStore {
  browserStore ??= createProfessionalProfileStore();
  return browserStore;
}
