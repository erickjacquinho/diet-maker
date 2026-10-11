import 'server-only';

import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getConfiguredAppOrigin } from '../request-security';

export interface AuthCookieUpdate {
  name: string;
  value: string;
  options: CookieOptions;
}

export interface RequestSupabaseClient {
  supabase: SupabaseClient;
  getCookiesToSet(): AuthCookieUpdate[];
  getResponseHeaders(): Record<string, string>;
}

export function createRequestSupabaseClient(request: Request): RequestSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Supabase Auth configuration is required.');
  }

  const supabaseOrigin = new URL(supabaseUrl);
  if (!['http:', 'https:'].includes(supabaseOrigin.protocol) || supabaseOrigin.username || supabaseOrigin.password) {
    throw new Error('SUPABASE_URL must be an HTTP URL.');
  }
  const appOrigin = getConfiguredAppOrigin();
  if (process.env.NODE_ENV === 'production' && appOrigin.protocol !== 'https:') {
    throw new Error('APP_ORIGIN must use HTTPS in production.');
  }

  const cookiesToSet = new Map<string, AuthCookieUpdate>();
  const responseHeaders: Record<string, string> = {};
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
    },
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: appOrigin.protocol === 'https:',
    },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('cookie') ?? '');
      },
      setAll(cookies, headers) {
        for (const cookie of cookies) cookiesToSet.set(cookie.name, cookie);
        Object.assign(responseHeaders, headers);
      },
    },
  });

  return {
    supabase,
    getCookiesToSet: () => [...cookiesToSet.values()],
    getResponseHeaders: () => ({ ...responseHeaders }),
  };
}
