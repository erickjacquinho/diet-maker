import { NextResponse } from 'next/server';
import { getConfiguredAppOrigin } from '@/lib/server/request-security';
import {
  recoveryCookieName,
  recoveryCookiePath,
  sealAuthLinkToken,
} from '@/lib/server/auth/link-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  try {
    const origin = getConfiguredAppOrigin();
    const url = new URL(request.url);
    const target = new URL('/redefinir-senha', origin);
    const response = NextResponse.redirect(target);
    response.headers.set('cache-control', 'private, no-store, max-age=0');
    response.headers.set('referrer-policy', 'no-referrer');
    response.headers.set('x-content-type-options', 'nosniff');

    const tokenHash = url.searchParams.get('token_hash');
    if (url.searchParams.get('type') !== 'recovery' || !tokenHash) {
      clearRecoveryCookie(response, origin);
      return response;
    }

    response.cookies.set(recoveryCookieName, sealAuthLinkToken(tokenHash, 'recovery'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
      path: recoveryCookiePath,
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

function clearRecoveryCookie(response: NextResponse, origin: URL): void {
  response.cookies.set(recoveryCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || origin.protocol === 'https:',
    path: recoveryCookiePath,
    maxAge: 0,
  });
}
