import { randomBytes } from 'node:crypto';
import {
  getConfiguredAppOrigin,
  noStoreJsonResponse,
  redactedErrorResponse,
} from '@/lib/server/request-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(): Response {
  try {
    const origin = getConfiguredAppOrigin();
    const csrfToken = randomBytes(32).toString('base64url');
    const secure = process.env.NODE_ENV === 'production' || origin.protocol === 'https:';
    const cookie = [
      `dietmaker_csrf=${csrfToken}`,
      'Path=/api',
      'Max-Age=900',
      'HttpOnly',
      'SameSite=Strict',
      ...(secure ? ['Secure'] : []),
    ].join('; ');
    return noStoreJsonResponse({ csrfToken }, 200, { 'set-cookie': cookie });
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
