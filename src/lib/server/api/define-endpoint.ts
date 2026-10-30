import 'server-only';

import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  checkRateLimit,
  getTrustedClientIp,
  parseJsonBody,
  type RequestSchema,
} from '../request-security';
import { applyAuthResponseState, validateRequestSession, type RequestSessionResult } from '../auth/session';
import { resolveOrCreateAccount, withAccountTransaction, type AccountTransaction } from '../online-db/accounts';
import { ApiError, toApiError } from './api-errors';

export type RateLimitClass = 'read' | 'mutation';

const rateLimits: Record<RateLimitClass, { limit: number; windowSeconds: number }> = {
  read: { limit: 300, windowSeconds: 60 },
  mutation: { limit: 60, windowSeconds: 60 },
};

const DEFAULT_MAX_BODY_BYTES = 64 * 1024;
const SAFE_METHODS = new Set(['GET', 'HEAD']);

export interface EndpointContext<Input> {
  request: Request;
  params: Record<string, string>;
  requestId: string;
  user: { id: string; email: string };
  account: { id: string };
  input: Input;
  /** Version sent in `If-Match`; present when `requireVersion` is set. */
  version: number | undefined;
  tx: AccountTransaction;
}

export interface EndpointDefinition<Input, Output> {
  /** zod-compatible schema (`.strict()` for objects); omit for body-less endpoints. */
  input?: RequestSchema<Input>;
  /** Allowlist applied to every successful response. */
  output: RequestSchema<Output>;
  /** `true` demands `If-Match`; `'optional'` accepts its absence (create-or-update endpoints). */
  requireVersion?: boolean | 'optional';
  rateLimit: RateLimitClass;
  maxBodyBytes?: number;
  status?: 200 | 201;
  /** Anything is accepted here; `output` is the only thing that reaches the client. */
  handler(context: EndpointContext<Input>): Promise<unknown>;
}

export interface EndpointDependencies {
  validateRequestSession: typeof validateRequestSession;
  resolveAccount: (userId: string) => Promise<{ id: string }>;
  withAccountTransaction: typeof withAccountTransaction;
  checkRateLimit: typeof checkRateLimit;
  getClientIp: (request: Request) => string;
  /** Future subscription/plan gate; throws an ApiError to deny. */
  subscriptionGate: (account: { id: string }) => Promise<void>;
}

const defaultDependencies: EndpointDependencies = {
  validateRequestSession,
  resolveAccount: resolveOrCreateAccount,
  withAccountTransaction,
  checkRateLimit,
  getClientIp: getTrustedClientIp,
  subscriptionGate: async () => undefined,
};

type RouteContext = { params: Promise<Record<string, string>> };

export function createEndpointFactory(dependencies: EndpointDependencies) {
  return function defineEndpoint<Input = undefined, Output = unknown>(definition: EndpointDefinition<Input, Output>) {
    return async function endpoint(request: Request, routeContext: RouteContext): Promise<Response> {
      const requestId = randomUUID();
      let session: RequestSessionResult | undefined;
      try {
        // 1. origin → 2. CSRF (state-changing methods only)
        if (!SAFE_METHODS.has(request.method.toUpperCase())) {
          assertSameOrigin(request);
          assertCsrf(request, request.headers.get('x-csrf-token'));
        }
        // 3. content-type, size and schema
        let input = undefined as Input;
        if (definition.input) {
          input = await parseJsonBody(request, definition.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES, definition.input);
        }
        const version = definition.requireVersion
          ? parseIfMatch(request, definition.requireVersion === 'optional')
          : undefined;
        // 4. rate limit by IP before any session work
        const limits = rateLimits[definition.rateLimit];
        await enforce(dependencies.checkRateLimit, 'ip', dependencies.getClientIp(request), limits);
        // 5. session → 6. account → 7. subscription gate
        session = await dependencies.validateRequestSession(request);
        if (!session.user) throw new ApiError(401, 'AUTH_REQUIRED');
        const user = session.user;
        await enforce(dependencies.checkRateLimit, 'user', user.id, limits);
        const account = await dependencies.resolveAccount(user.id);
        await dependencies.subscriptionGate(account);
        // 8. one transaction per use case → 9. handler
        const params = (await routeContext.params) ?? {};
        const result = await dependencies.withAccountTransaction(account.id, (tx) => definition.handler({
          request, params, requestId, user, account, input, version, tx,
        }));
        // 10. output allowlist → 11. headers
        const body = definition.output.parse(result);
        return finalize(NextResponse.json(body, { status: definition.status ?? 200 }), session);
      } catch (error) {
        const apiError = toApiError(error);
        const headers = new Headers();
        if (apiError.retryAfterSeconds) headers.set('retry-after', String(apiError.retryAfterSeconds));
        const response = NextResponse.json(
          { error: { code: apiError.code, requestId, ...apiError.extra } },
          { status: apiError.status, headers },
        );
        return finalize(response, session);
      }
    };
  };
}

export const defineEndpoint = createEndpointFactory(defaultDependencies);

async function enforce(
  check: EndpointDependencies['checkRateLimit'],
  identityType: string,
  identifier: string,
  policy: { limit: number; windowSeconds: number },
): Promise<void> {
  const result = await check('v1', identityType, identifier, policy.limit, policy.windowSeconds);
  if (!result.allowed) throw new ApiError(429, 'RATE_LIMITED', {}, result.retryAfterSeconds);
}

function parseIfMatch(request: Request, optional: boolean): number | undefined {
  const header = request.headers.get('if-match');
  if (header === null && optional) return undefined;
  if (header === null) throw new ApiError(428, 'VERSION_REQUIRED');
  const match = /^"?(\d{1,9})"?$/.exec(header.trim());
  if (!match || Number(match[1]) < 1) throw new ApiError(400, 'INVALID_REQUEST');
  return Number(match[1]);
}

function finalize(response: NextResponse, session?: RequestSessionResult): NextResponse {
  response.headers.set('cache-control', 'private, no-store, max-age=0');
  response.headers.set('pragma', 'no-cache');
  response.headers.set('referrer-policy', 'no-referrer');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('cross-origin-opener-policy', 'same-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  return session ? applyAuthResponseState(response, session) : response;
}
