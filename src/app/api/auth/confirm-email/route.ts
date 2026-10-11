import { NextResponse } from 'next/server';
import {
  assertCsrf,
  assertSameOrigin,
  getConfiguredAppOrigin,
  getRequestCookie,
  parseJsonBody,
  redactedErrorResponse,
} from '@/lib/server/request-security';
import { parseCsrfInput } from '@/lib/server/auth/registration';
import { createRequestSupabaseClient } from '@/lib/server/auth/supabase';
import { applyAuthResponseState } from '@/lib/server/auth/session';
import { emailConfirmationCookieName, emailConfirmationCookiePath, openAuthLinkToken } from '@/lib/server/auth/link-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    const { csrfToken } = await parseJsonBody(request, 8 * 1024, { parse: parseCsrfInput });
    assertCsrf(request, csrfToken);
    const origin = getConfiguredAppOrigin();
    const token = openAuthLinkToken(getRequestCookie(request, emailConfirmationCookieName) ?? '', 'email');
    if (!token) return confirmationResponse('O link expirou ou não é válido. Solicite uma nova confirmação.', 400, origin);

    const context = createRequestSupabaseClient(request);
    const { error } = await context.supabase.auth.verifyOtp({ token_hash: token.tokenHash, type: 'email' });
    if (error) return confirmationResponse('Não foi possível confirmar o e-mail. Solicite um novo link.', 400, origin);

    const { error: signOutError } = await context.supabase.auth.signOut({ scope: 'local' });
    const response = confirmationResponse(
      signOutError ? 'Não foi possível concluir a confirmação. Solicite um novo link.' : 'E-mail confirmado. Faça login.',
      signOutError ? 503 : 200,
      origin,
    );
    response.cookies.set(emailConfirmationCookieName, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
      path: emailConfirmationCookiePath,
      maxAge: 0,
    });
    return applyAuthResponseState(response, {
      cookiesToSet: context.getCookiesToSet(),
      responseHeaders: context.getResponseHeaders(),
    });
  } catch (error) {
    return redactedErrorResponse(error);
  }
}

function confirmationResponse(message: string, status: number, origin: URL): NextResponse {
  const response = NextResponse.json({ message }, { status });
  response.headers.set('cache-control', 'private, no-store, max-age=0');
  response.headers.set('referrer-policy', 'no-referrer');
  response.headers.set('x-content-type-options', 'nosniff');
  response.cookies.set(emailConfirmationCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
    path: emailConfirmationCookiePath,
    maxAge: 0,
  });
  return response;
}
