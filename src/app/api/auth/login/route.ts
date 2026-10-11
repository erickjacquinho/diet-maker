import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  enforceIdentityRateLimits,
  getTrustedClientIp,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { loginProfessionalAccount, parseLoginInput } from '@/lib/server/auth/registration';
import { applyAuthResponseState } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, 16 * 1024, { parse: parseLoginInput });
    assertCsrf(request, input.csrfToken);
    await enforceIdentityRateLimits('login', input.email, getTrustedClientIp(request));
    const result = await loginProfessionalAccount(request, input);
    if (!result.user) {
      return applyAuthResponseState(
        NextResponse.json({ code: 'AUTH_REQUIRED', message: 'E-mail ou senha inválidos.' }, { status: 401 }),
        result,
      );
    }
    return applyAuthResponseState(
      NextResponse.json({
        user: result.user,
        destination: result.profileComplete ? '/saves' : '/criar-conta?completar=1',
      }),
      result,
    );
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
