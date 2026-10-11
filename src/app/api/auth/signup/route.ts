import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  enforceIdentityRateLimits,
  getTrustedClientIp,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { createProfessionalAccount, parseSignupInput } from '@/lib/server/auth/registration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 16 * 1024, { parse: parseSignupInput });
    assertCsrf(request, input.csrfToken);
    await enforceIdentityRateLimits('signup', input.email, getTrustedClientIp(request));
    await createProfessionalAccount(request, input);
    return NextResponse.json(
      { message: 'Se for possível usar este e-mail, você receberá as instruções.' },
      { status: 202, headers: { 'cache-control': 'private, no-store, max-age=0', 'referrer-policy': 'no-referrer' } },
    );
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
