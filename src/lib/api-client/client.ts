export class ApiClientError extends Error {
  constructor(readonly status: number, readonly code: string, readonly requestId?: string, readonly currentVersion?: number) {
    super(code);
  }
}

let csrfToken: string | undefined;

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new ApiClientError(response.status, 'CSRF_UNAVAILABLE');
  const body = (await response.json()) as { csrfToken?: unknown };
  if (typeof body.csrfToken !== 'string') throw new ApiClientError(500, 'CSRF_UNAVAILABLE');
  csrfToken = body.csrfToken;
  return csrfToken;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sent as `If-Match` for optimistic concurrency. */
  version?: number;
  signal?: AbortSignal;
}

/** Typed same-origin client for `/api/v1/*`. The browser never learns about the database. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!path.startsWith('/api/v1/')) throw new TypeError('Only /api/v1 paths are allowed.');
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { accept: 'application/json' };
  if (method !== 'GET') headers['x-csrf-token'] = await ensureCsrfToken();
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.version !== undefined) headers['if-match'] = String(options.version);

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: options.signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    if (response.status === 403) csrfToken = undefined;
    const error = (payload as { error?: { code?: string; requestId?: string; currentVersion?: number } } | undefined)?.error;
    throw new ApiClientError(response.status, error?.code ?? 'INTERNAL_ERROR', error?.requestId, error?.currentVersion);
  }
  return payload as T;
}
