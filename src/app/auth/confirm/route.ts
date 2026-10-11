import { NextResponse } from 'next/server';
import { getConfiguredAppOrigin } from '@/lib/server/request-security';
import { emailConfirmationCookieName, emailConfirmationCookiePath, sealAuthLinkToken } from '@/lib/server/auth/link-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  try {
    const origin = getConfiguredAppOrigin();
    const tokenHash = new URL(request.url).searchParams.get('token_hash');
    const target = new URL('/criar-conta?confirmar=1', origin);
    const response = NextResponse.redirect(target);
    response.headers.set('cache-control', 'private, no-store, max-age=0');
    response.headers.set('referrer-policy', 'no-referrer');
    response.headers.set('x-content-type-options', 'nosniff');
    if (!tokenHash) return response;

    const sealed = sealAuthLinkToken(tokenHash, 'email');
    response.cookies.set(emailConfirmationCookieName, sealed, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
      path: emailConfirmationCookiePath,
      maxAge: 900,
    });
    return response;
  } catch {
    return new Response(null, {
      status: 503,
      headers: {
        'cache-control': 'private, no-store, max-age=0',
        'referrer-policy': 'no-referrer',
      },
    });
  }
}
