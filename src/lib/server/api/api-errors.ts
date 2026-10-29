import 'server-only';

import { RequestSecurityError } from '../request-security';

export type ApiErrorCode =
  | 'INVALID_ORIGIN'
  | 'CSRF_INVALID'
  | 'INVALID_REQUEST'
  | 'REQUEST_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'AUTH_REQUIRED'
  | 'PROFILE_REQUIRED'
  | 'NOT_FOUND'
  | 'VERSION_REQUIRED'
  | 'VERSION_CONFLICT'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 413 | 422 | 428 | 429 | 500,
    readonly code: ApiErrorCode,
    readonly extra: Record<string, number | string> = {},
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
  }
}

/** Same response for a missing resource and for a resource that belongs to another account. */
export class NotFoundError extends ApiError {
  constructor() {
    super(404, 'NOT_FOUND');
  }
}

export class VersionConflictError extends ApiError {
  constructor(currentVersion: number) {
    super(409, 'VERSION_CONFLICT', { currentVersion });
  }
}

const securityStatus: Record<string, ApiError['status']> = {
  INVALID_ORIGIN: 403,
  CSRF_INVALID: 403,
  INVALID_REQUEST: 400,
  REQUEST_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  AUTH_REQUIRED: 401,
  PROFILE_REQUIRED: 403,
};

/** Maps any thrown value to an ApiError without leaking messages, constraints or stacks. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof RequestSecurityError && error.code in securityStatus) {
    return new ApiError(securityStatus[error.code], error.code as ApiErrorCode, {}, error.retryAfterSeconds);
  }
  const pgCode = findPostgresCode(error);
  if (pgCode === '23505') return new ApiError(409, 'CONFLICT');
  if (pgCode === '23503' || pgCode === 'P0001' || pgCode === '23514') return new ApiError(422, 'UNPROCESSABLE');
  return new ApiError(500, 'INTERNAL_ERROR');
}

function findPostgresCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
