import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createEndpointFactory as createFactory, type EndpointDependencies } from '../../../src/lib/server/api/define-endpoint';
import { NotFoundError, VersionConflictError } from '../../../src/lib/server/api/api-errors';

const csrf = randomBytes(32).toString('base64url');
const userId = '11111111-1111-4111-8111-111111111111';
const accountId = '22222222-2222-4222-8222-222222222222';

function dependencies(overrides: Partial<EndpointDependencies> = {}): EndpointDependencies {
  return {
    validateRequestSession: vi.fn(async () => ({
      user: { id: userId, email: 'a@example.com' }, cookiesToSet: [], responseHeaders: {},
    })),
    resolveAccount: vi.fn(async () => ({ id: accountId })),
    withAccountTransaction: vi.fn(async (_id, run) => run({} as never)) as never,
    checkRateLimit: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
    getClientIp: () => '203.0.113.7',
    subscriptionGate: vi.fn(async () => undefined),
    ...overrides,
  };
}

const output = { parse: (value: unknown) => {
  const { id } = value as { id: string; secret?: string };
  return { id };
} };
const input = { parse: (value: unknown) => {
  if (!value || typeof value !== 'object' || Object.keys(value).some((key) => key !== 'name')) throw new Error('strict');
  return value as { name: string };
} };

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/v1/things', {
    method: 'POST',
    headers: {
      origin: 'http://localhost:3000',
      'content-type': 'application/json',
      cookie: `dietmaker_csrf=${csrf}`,
      'x-csrf-token': csrf,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/** Next always passes a route context; tests without dynamic segments pass an empty one. */
const createEndpointFactory = (deps: EndpointDependencies) => {
  const define = createFactory(deps);
  return (definition: Parameters<typeof define>[0]) => {
    const endpoint = define(definition);
    return (request: Request) => endpoint(request, { params: Promise.resolve({}) });
  };
};

beforeEach(() => vi.stubEnv('APP_ORIGIN', 'http://localhost:3000'));
afterEach(() => vi.unstubAllEnvs());

describe('defineEndpoint', () => {
  it('runs the handler in an account transaction and applies the output allowlist and headers', async () => {
    const deps = dependencies();
    const handler = vi.fn(async () => ({ id: 'x', secret: 'leak' }));
    const POST = createEndpointFactory(deps)({ input, output, rateLimit: 'mutation', handler, status: 201 });
    const response = await POST(post({ name: 'a' }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 'x' });
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(deps.withAccountTransaction).toHaveBeenCalledWith(accountId, expect.any(Function));
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ account: { id: accountId }, input: { name: 'a' } }));
  });

  it('rejects wrong origin, missing CSRF and unknown body fields before touching the session', async () => {
    const deps = dependencies();
    const POST = createEndpointFactory(deps)({ input, output, rateLimit: 'mutation', handler: async () => ({ id: 'x' }) });
    expect((await POST(post({ name: 'a' }, { origin: 'https://evil.example' }))).status).toBe(403);
    const noCsrf = await POST(post({ name: 'a' }, { 'x-csrf-token': '' }));
    expect(noCsrf.status).toBe(403);
    expect((await noCsrf.json()).error.code).toBe('CSRF_INVALID');
    expect((await POST(post({ name: 'a', accountId }))).status).toBe(400);
    expect(deps.validateRequestSession).not.toHaveBeenCalled();
  });

  it('returns a uniform error envelope with requestId and no internal message', async () => {
    const deps = dependencies({ validateRequestSession: vi.fn(async () => ({ user: null, cookiesToSet: [], responseHeaders: {} })) });
    const POST = createEndpointFactory(deps)({ input, output, rateLimit: 'mutation', handler: async () => ({ id: 'x' }) });
    const response = await POST(post({ name: 'a' }));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: { code: 'AUTH_REQUIRED', requestId: expect.any(String) } });
  });

  it('maps not-found, version conflicts and Postgres errors without leaking details', async () => {
    const make = (handler: () => Promise<{ id: string }>) =>
      createEndpointFactory(dependencies())({ output, rateLimit: 'read', handler });
    const get = () => new Request('http://localhost:3000/api/v1/things/1');

    const notFound = await make(async () => { throw new NotFoundError(); })(get());
    expect(notFound.status).toBe(404);
    expect(await notFound.json()).toEqual({ error: { code: 'NOT_FOUND', requestId: expect.any(String) } });

    const conflict = await make(async () => { throw new VersionConflictError(4); })(get());
    expect(conflict.status).toBe(409);
    expect((await conflict.json()).error).toMatchObject({ code: 'VERSION_CONFLICT', currentVersion: 4 });

    const unique = await make(async () => { throw Object.assign(new Error('duplicate key value violates "patients_pkey"'), { code: '23505' }); })(get());
    expect(unique.status).toBe(409);
    expect(JSON.stringify(await unique.json())).not.toContain('patients_pkey');

    const fk = await make(async () => { throw Object.assign(new Error('x'), { code: '23503' }); })(get());
    expect(fk.status).toBe(422);

    const unknown = await make(async () => { throw new Error('connection to db.supabase.co failed'); })(get());
    expect(unknown.status).toBe(500);
    expect(JSON.stringify(await unknown.json())).not.toContain('supabase');
  });

  it('requires a valid If-Match version when requireVersion is set', async () => {
    const handler = vi.fn(async ({ version }: { version: number | undefined }) => ({ id: String(version) }));
    const PATCH = createEndpointFactory(dependencies())({ input, output, rateLimit: 'mutation', requireVersion: true, handler });
    const patch = (headers: Record<string, string>) => new Request('http://localhost:3000/api/v1/things/1', {
      method: 'PATCH',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: `dietmaker_csrf=${csrf}`, 'x-csrf-token': csrf, ...headers },
      body: JSON.stringify({ name: 'a' }),
    });
    expect((await PATCH(patch({}))).status).toBe(428);
    expect((await PATCH(patch({ 'if-match': 'abc' }))).status).toBe(400);
    const ok = await PATCH(patch({ 'if-match': '"3"' }));
    expect(await ok.json()).toEqual({ id: '3' });
  });

  it('answers 429 with Retry-After and runs the subscription gate after authentication', async () => {
    const limited = dependencies({ checkRateLimit: vi.fn(async () => ({ allowed: false, retryAfterSeconds: 12 })) });
    const POST = createEndpointFactory(limited)({ input, output, rateLimit: 'mutation', handler: async () => ({ id: 'x' }) });
    const response = await POST(post({ name: 'a' }));
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('12');
    expect(limited.validateRequestSession).not.toHaveBeenCalled();

    const gate = dependencies();
    await createEndpointFactory(gate)({ input, output, rateLimit: 'mutation', handler: async () => ({ id: 'x' }) })(post({ name: 'a' }));
    expect(gate.subscriptionGate).toHaveBeenCalledWith({ id: accountId });
  });

  it('skips CSRF for safe methods but still requires a session', async () => {
    const deps = dependencies();
    const GET = createEndpointFactory(deps)({ output, rateLimit: 'read', handler: async () => ({ id: 'x' }) });
    const response = await GET(new Request('http://localhost:3000/api/v1/things'));
    expect(response.status).toBe(200);
  });
});
