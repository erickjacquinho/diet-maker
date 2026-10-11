import {
  assertCsrf,
  assertSameOrigin,
  enforceIdentityRateLimits,
  getTrustedClientIp,
  noStoreJsonResponse,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { parseRecoveryRequestInput, requestPasswordRecovery } from '@/lib/server/auth/recovery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 8 * 1024, { parse: parseRecoveryRequestInput });
    assertCsrf(request, input.csrfToken);
    await enforceIdentityRateLimits('recovery', input.email, getTrustedClientIp(request));
    await requestPasswordRecovery(request, input);
    return noStoreJsonResponse({
      message: 'Se o endereço puder receber uma recuperação, as instruções serão enviadas.',
    }, 202);
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
