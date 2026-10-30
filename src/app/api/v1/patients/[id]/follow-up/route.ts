import {
  clearFollowUpEndpoint,
  getFollowUpEndpoint,
  setFollowUpEndpoint,
} from '@/lib/server/clinical/clinical-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getFollowUpEndpoint;
export const PUT = setFollowUpEndpoint;
export const DELETE = clearFollowUpEndpoint;
