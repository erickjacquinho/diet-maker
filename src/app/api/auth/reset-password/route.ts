import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  getConfiguredAppOrigin,
  getRequestCookie,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import {
  InvalidRecoveryLinkError,
  parseResetPasswordInput,
  resetProfessionalPassword,
} from '@/lib/server/auth/recovery';
import {
  openAuthLinkToken,
  recoveryCookieName,
  recoveryCookiePath,
} from '@/lib/server/auth/link-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  let input;
  try {
    assertSameOrigin(request);
    input = await parseJsonBody(request, 8 * 1024, { parse: parseResetPasswordInput });
    assertCsrf(request, input.csrfToken);
  } catch (error) {
    return redactedErrorResponse(error);
  }

  let origin: URL;
  try {
    origin = getConfiguredAppOrigin();
  } catch (error) {
    return redactedErrorResponse(error);
  }

  const token = openAuthLinkToken(getRequestCookie(request, recoveryCookieName) ?? '', 'recovery');
  if (!token) return recoveryError('O link expirou ou não é válido. Solicite um novo link.', 400, origin);

  try {
    const cookiesToSet = await resetProfessionalPassword(request, input, token.tokenHash);
    const response = NextResponse.json({ message: 'Senha alterada. Faça login com a nova senha.' }, {
      headers: {
        'cache-control': 'private, no-store, max-age=0',
        pragma: 'no-cache',
        'referrer-policy': 'no-referrer',
        'x-content-type-options': 'nosniff',
      },
    });
    for (const cookie of cookiesToSet) response.cookies.set(cookie.name, cookie.value, cookie.options);
    clearRecoveryCookie(response, origin);
    return response;
  } catch (error) {
    if (error instanceof InvalidRecoveryLinkError) {
      return recoveryError('O link não pode mais ser usado. Solicite um novo link.', 400, origin);
    }
    return recoveryError(
      'Não foi possível confirmar a conclusão. Use a nova senha para entrar; se não funcionar, solicite outro link.',
      503,
      origin,
    );
  }
}

function recoveryError(message: string, status: number, origin: URL): NextResponse {
  const response = NextResponse.json({ code: status === 400 ? 'RECOVERY_LINK_INVALID' : 'RECOVERY_UNAVAILABLE', message }, {
    status,
    headers: {
      'cache-control': 'private, no-store, max-age=0',
      pragma: 'no-cache',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    },
  });
  clearRecoveryCookie(response, origin);
  return response;
}

function clearRecoveryCookie(response: NextResponse, origin: URL): void {
  response.cookies.set(recoveryCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
    path: recoveryCookiePath,
    maxAge: 0,
  });
}
