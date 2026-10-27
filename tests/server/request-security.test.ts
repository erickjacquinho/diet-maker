import { randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  assertCsrf,
  assertSameOrigin,
  checkRateLimit,
  getTrustedClientIp,
  parseJsonBody,
  RequestSecurityError,
  redactedErrorResponse,
} from '../../src/lib/server/request-security';
import { createRateLimitBucketHash } from '../../src/lib/server/save-keys';
import { GET as getCsrfToken } from '../../src/app/api/auth/csrf/route';

const localAdminUrl = process.env.LOCAL_SUPABASE_DB_URL;
const localRuntimeUrl = process.env.ONLINE_DATABASE_URL;
const hasLocalRateLimitDatabase = Boolean(localAdminUrl && localRuntimeUrl && process.env.SERVER_MASTER_KEY);
const describeLocalDatabase = hasLocalRateLimitDatabase ? describe : describe.skip;

afterEach(() => vi.unstubAllEnvs());

describe('request security', () => {
  beforeEach(() => {
    vi.stubEnv('APP_ORIGIN', 'http://localhost:3000');
  });

  it('requires the configured exact Origin for mutating requests', () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    });
    expect(() => assertSameOrigin(request)).not.toThrow();
    expect(() => assertSameOrigin(new Request(request.url, { method: 'POST' }))).toThrow(RequestSecurityError);
    expect(() => assertSameOrigin(new Request(request.url, {
      method: 'POST',
      headers: { origin: 'https://attacker.example' },
    }))).toThrow(RequestSecurityError);
  });

  it('requires a matching HttpOnly context cookie and body token', () => {
    const token = randomBytes(32).toString('base64url');
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        cookie: `dietmaker_csrf=${token}`,
      },
    });
    expect(() => assertCsrf(request, token)).not.toThrow();
    expect(() => assertCsrf(request, randomBytes(32).toString('base64url'))).toThrow(RequestSecurityError);
  });

  it('issues a short-lived no-store CSRF token in the response and HttpOnly cookie', async () => {
    const response = getCsrfToken();
    const body = await response.json() as { csrfToken: string };
    const cookie = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body.csrfToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(cookie).toContain(`dietmaker_csrf=${body.csrfToken}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(cookie).toContain('Max-Age=900');
  });

  it('redacts unexpected failures and keeps error responses private', async () => {
    const response = redactedErrorResponse(new Error('secret password and token'));
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('password');
    expect(body).not.toContain('token');
    expect(body).toContain('requestId');
  });

  it('bounds streamed JSON and delegates strict field validation to its schema', async () => {
    const validSchema = {
      parse(value: unknown) {
        if (
          !value
          || typeof value !== 'object'
          || !('csrfToken' in value)
          || Object.keys(value).length !== 1
        ) throw new Error('invalid');
        return value as { csrfToken: string };
      },
    };
    const parsed = await parseJsonBody(
      new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ csrfToken: 'abc' }),
      }),
      128,
      validSchema,
    );
    expect(parsed).toEqual({ csrfToken: 'abc' });

    await expect(parseJsonBody(
      new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ csrfToken: 'x'.repeat(256) }),
      }),
      128,
      validSchema,
    )).rejects.toMatchObject({ status: 413 });
    await expect(parseJsonBody(
      new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'secret',
      }),
      128,
      validSchema,
    )).rejects.toMatchObject({ status: 400 });
    await expect(parseJsonBody(
      new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ csrfToken: 'abc', patients: ['private'] }),
      }),
      128,
      validSchema,
    )).rejects.toMatchObject({ status: 400, code: 'INVALID_REQUEST' });
    await expect(parseJsonBody(
      new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
      128,
      validSchema,
    )).rejects.toMatchObject({ status: 400 });
  });

  it('hashes rate-limit identity without retaining the email or address', () => {
    vi.stubEnv('SERVER_MASTER_KEY', Buffer.alloc(32, 0x51).toString('base64'));
    vi.stubEnv('SERVER_MASTER_KEY_ID', 'test-v1');
    const email = 'professional@example.invalid';
    const address = '203.0.113.4';
    const emailHash = createRateLimitBucketHash('login', 'email', email);
    const ipHash = createRateLimitBucketHash('login', 'ip', address);

    expect(emailHash).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(ipHash).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(emailHash).not.toContain(email);
    expect(ipHash).not.toContain(address);
    expect(createRateLimitBucketHash('login', 'email', email)).toBe(emailHash);
    expect(createRateLimitBucketHash('signup', 'email', email)).not.toBe(emailHash);
  });

  it('uses Vercel-provided client IP in production instead of a spoofable forwarded header', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const request = new Request('https://app.example/api/auth/login', {
      headers: {
        'x-vercel-forwarded-for': '198.51.100.27',
        'x-forwarded-for': '203.0.113.254',
      },
    });
    expect(getTrustedClientIp(request)).toBe('198.51.100.27');
    expect(() => getTrustedClientIp(new Request(request.url, {
      headers: { 'x-forwarded-for': '203.0.113.254' },
    }))).toThrow();
  });
});

describeLocalDatabase('durable request rate limits', () => {
  let admin: Pool;
  const endpoint = 'integration-test';
  const identity = randomUUID();

  beforeAll(async () => {
    const adminConnection = new URL(localAdminUrl!);
    const runtimeConnection = new URL(localRuntimeUrl!);
    if (
      !['127.0.0.1', 'localhost', '::1'].includes(adminConnection.hostname)
      || adminConnection.port !== '54322'
      || !['127.0.0.1', 'localhost', '::1'].includes(runtimeConnection.hostname)
      || runtimeConnection.port !== '54322'
      || runtimeConnection.username !== 'app_runtime'
    ) {
      throw new Error('Rate-limit integration tests must use the local restricted runtime role.');
    }
    admin = new Pool({ connectionString: localAdminUrl!, max: 1 });
  });

  afterAll(async () => {
    if (admin) {
      const hash = createRateLimitBucketHash(endpoint, 'ip', identity);
      await admin.query('DELETE FROM private.auth_rate_limits WHERE bucket_hash = $1', [hash]);
      await admin.end();
    }
    const { closeOnlineDatabase } = await import('../../src/lib/server/online-db/client');
    await closeOnlineDatabase();
  });

  it('counts concurrent requests atomically across the configured limit and persists the bucket', async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, () => checkRateLimit(endpoint, 'ip', identity, 5, 60)),
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    expect(results.filter((result) => !result.allowed)).toHaveLength(7);
    expect(results.filter((result) => !result.allowed).every((result) => result.retryAfterSeconds > 0)).toBe(true);

    const hash = createRateLimitBucketHash(endpoint, 'ip', identity);
    const persisted = await admin.query<{ attempts: number }>(
      'SELECT attempts FROM private.auth_rate_limits WHERE bucket_hash = $1',
      [hash],
    );
    expect(persisted.rows).toHaveLength(1);
    expect(Number(persisted.rows[0].attempts)).toBe(6);
  });
});
