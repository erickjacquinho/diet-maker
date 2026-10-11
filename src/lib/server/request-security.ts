import 'server-only';

import { randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { createRateLimitBucketHash } from './save-keys';
import { consumeAuthRateLimit } from './online-db/repository';

type SecurityErrorCode =
  | 'INVALID_ORIGIN'
  | 'CSRF_INVALID'
  | 'INVALID_REQUEST'
  | 'REQUEST_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'AUTH_REQUIRED'
  | 'PROFILE_REQUIRED'
  | 'SAVE_UNAVAILABLE'
  | 'SAVE_CONFLICT';

const errorMessages: Record<SecurityErrorCode | 'INTERNAL_ERROR', string> = {
  INVALID_ORIGIN: 'Request origin is invalid.',
  CSRF_INVALID: 'Request could not be verified.',
  INVALID_REQUEST: 'Request body is invalid.',
  REQUEST_TOO_LARGE: 'Request body is too large.',
  RATE_LIMITED: 'Too many requests. Try again later.',
  AUTH_REQUIRED: 'Authentication is required.',
  PROFILE_REQUIRED: 'Complete your professional profile to continue.',
  SAVE_UNAVAILABLE: 'The save could not be authorized.',
  SAVE_CONFLICT: 'The save registration conflicts with an existing record.',
  INTERNAL_ERROR: 'The request could not be completed.',
};

const identityRateLimits = {
  login: { email: { limit: 10, windowSeconds: 600 }, ip: { limit: 50, windowSeconds: 600 } },
  signup: { email: { limit: 3, windowSeconds: 3600 }, ip: { limit: 10, windowSeconds: 3600 } },
  recovery: { email: { limit: 3, windowSeconds: 3600 }, ip: { limit: 10, windowSeconds: 3600 } },
} as const;

export class RequestSecurityError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 429,
    readonly code: SecurityErrorCode,
    readonly retryAfterSeconds?: number,
  ) {
    super(errorMessages[code]);
  }
}

export interface RequestSchema<T> {
  parse(value: unknown): T;
}

export function getConfiguredAppOrigin(): URL {
  const configured = process.env.APP_ORIGIN;
  if (!configured) throw new Error('APP_ORIGIN is required.');
  let origin: URL;
  try {
    origin = new URL(configured);
  } catch {
    throw new Error('APP_ORIGIN is invalid.');
  }
  if (
    !['http:', 'https:'].includes(origin.protocol)
    || origin.origin === 'null'
    || origin.username
    || origin.password
    || configured !== origin.origin
  ) {
    throw new Error('APP_ORIGIN must be an exact HTTP origin.');
  }
  return origin;
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  let expected: URL;
  try {
    expected = getConfiguredAppOrigin();
  } catch {
    throw new RequestSecurityError(403, 'INVALID_ORIGIN');
  }
  if (!origin || origin !== expected.origin) throw new RequestSecurityError(403, 'INVALID_ORIGIN');
}

export function assertCsrf(request: Request, submittedToken: unknown): void {
  assertSameOrigin(request);
  const cookieToken = getRequestCookie(request, 'dietmaker_csrf');
  if (
    typeof submittedToken !== 'string'
    || !isCsrfToken(submittedToken)
    || !cookieToken
    || !isCsrfToken(cookieToken)
  ) {
    throw new RequestSecurityError(403, 'CSRF_INVALID');
  }
  const submitted = Buffer.from(submittedToken, 'base64url');
  const cookie = Buffer.from(cookieToken, 'base64url');
  if (!timingSafeEqual(submitted, cookie)) throw new RequestSecurityError(403, 'CSRF_INVALID');
}

export function getRequestCookie(request: Request, name: string): string | null {
  return readCookie(request.headers.get('cookie'), name);
}

export async function parseJsonBody<T>(
  request: Request,
  maximumBytes: number,
  schema: RequestSchema<T>,
): Promise<T> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1) throw new RangeError('A positive body limit is required.');
  const mediaType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (mediaType !== 'application/json') throw new RequestSecurityError(400, 'INVALID_REQUEST');

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) throw new RequestSecurityError(400, 'INVALID_REQUEST');
    if (Number(contentLength) > maximumBytes) throw new RequestSecurityError(413, 'REQUEST_TOO_LARGE');
  }
  if (!request.body) throw new RequestSecurityError(400, 'INVALID_REQUEST');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestSecurityError(413, 'REQUEST_TOO_LARGE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    return schema.parse(parsed);
  } catch {
    throw new RequestSecurityError(400, 'INVALID_REQUEST');
  }
}

export function checkRateLimit(
  endpoint: string,
  identityType: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const bucketHash = createRateLimitBucketHash(endpoint, identityType, identifier);
  return consumeAuthRateLimit(bucketHash, limit, windowSeconds);
}

export async function enforceIdentityRateLimits(
  endpoint: keyof typeof identityRateLimits,
  email: string,
  ip: string,
): Promise<void> {
  const policy = identityRateLimits[endpoint];
  const [emailResult, ipResult] = await Promise.all([
    checkRateLimit(endpoint, 'email', email.trim().toLowerCase(), policy.email.limit, policy.email.windowSeconds),
    checkRateLimit(endpoint, 'ip', ip, policy.ip.limit, policy.ip.windowSeconds),
  ]);
  const denied = [emailResult, ipResult].filter((result) => !result.allowed);
  if (denied.length) {
    throw new RequestSecurityError(429, 'RATE_LIMITED', Math.max(...denied.map(({ retryAfterSeconds }) => retryAfterSeconds)));
  }
}

export function getTrustedClientIp(request: Request): string {
  const production = process.env.NODE_ENV === 'production';
  const forwarded = production
    ? request.headers.get('x-vercel-forwarded-for')
    : request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip');
  const candidate = forwarded?.split(',')[0].trim() || (production ? '' : '127.0.0.1');
  if (isIP(candidate) === 0) throw new Error('A trusted client IP is unavailable.');
  return candidate;
}

export function noStoreJsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  const headers = new Headers(extraHeaders);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'private, no-store, max-age=0');
  headers.set('pragma', 'no-cache');
  headers.set('referrer-policy', 'no-referrer');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(JSON.stringify(body), { status, headers });
}

export function redactedErrorResponse(error: unknown, requestId = randomUUID()): Response {
  if (error instanceof RequestSecurityError) {
    const headers = new Headers();
    if (error.retryAfterSeconds) headers.set('retry-after', String(error.retryAfterSeconds));
    return noStoreJsonResponse({ code: error.code, message: error.message, requestId }, error.status, headers);
  }
  return noStoreJsonResponse(
    { code: 'INTERNAL_ERROR', message: errorMessages.INTERNAL_ERROR, requestId },
    503,
  );
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const matches = cookieHeader.split(';').map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  return matches[0].slice(name.length + 1);
}

function isCsrfToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value) && Buffer.from(value, 'base64url').length === 32;
}
