import { NextResponse } from 'next/server';
import { getProfessionalProfile } from '@/lib/server/online-db/repository';
import { redactedErrorResponse } from '@/lib/server/request-security';
import { applyAuthResponseState, validateRequestSession } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const session = await validateRequestSession(request);
    if (!session.user) {
      return applyAuthResponseState(
        NextResponse.json({ code: 'AUTH_REQUIRED', message: 'Entre na sua conta.' }, { status: 401 }),
        session,
      );
    }

    const profileComplete = Boolean(await getProfessionalProfile(session.user.id));
    return applyAuthResponseState(
      NextResponse.json({
        user: session.user,
        profileComplete,
        destination: profileComplete ? '/dashboard' : '/criar-conta?completar=1',
      }),
      session,
    );
  } catch (error) {
    return redactedErrorResponse(error);
  }
}
