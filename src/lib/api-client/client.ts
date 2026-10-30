export class ApiClientError extends Error {
  constructor(readonly status: number, readonly code: string, readonly requestId?: string, readonly currentVersion?: number) {
    super(code);
  }
}

let csrfToken: string | undefined;
let csrfPending: Promise<string> | undefined;

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new ApiClientError(response.status, 'CSRF_UNAVAILABLE');
  const body = (await response.json()) as { csrfToken?: unknown };
  if (typeof body.csrfToken !== 'string') throw new ApiClientError(500, 'CSRF_UNAVAILABLE');
  csrfToken = body.csrfToken;
  return csrfToken;
}

// Concurrent first calls share one request: each fetch rotates the token cookie, so a second one would invalidate the first.
function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return Promise.resolve(csrfToken);
  csrfPending ??= fetchCsrfToken().finally(() => { csrfPending = undefined; });
  return csrfPending;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Sends `text` untouched (e.g. a `.nutridiet` file) with these headers instead of a JSON body. */
  rawBody?: { text: string; headers: Record<string, string> };
  /** Sent as `If-Match` for optimistic concurrency. */
  version?: number;
  signal?: AbortSignal;
}

/** Typed same-origin client for `/api/v1/*`. The browser never learns about the database. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, options);
  } catch (error) {
    // A rejected CSRF token is cleared by `send`; one retry fetches a fresh token (safe: the rejected call did nothing).
    if (error instanceof ApiClientError && error.status === 403 && options.method && options.method !== 'GET' && error.code === 'CSRF_INVALID') return send<T>(path, options);
    throw error;
  }
}

async function send<T>(path: string, options: ApiRequestOptions): Promise<T> {
  if (!path.startsWith('/api/v1/')) throw new TypeError('Only /api/v1 paths are allowed.');
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = { accept: 'application/json' };
  if (method !== 'GET') headers['x-csrf-token'] = await ensureCsrfToken();
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.rawBody) Object.assign(headers, options.rawBody.headers);
  if (options.version !== undefined) headers['if-match'] = String(options.version);

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: options.signal,
    body: options.rawBody ? options.rawBody.text : options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    if (response.status === 403) csrfToken = undefined;
    const error = (payload as { error?: { code?: string; requestId?: string; currentVersion?: number } } | undefined)?.error;
    throw new ApiClientError(response.status, error?.code ?? 'INTERNAL_ERROR', error?.requestId, error?.currentVersion);
  }
  return payload as T;
}
