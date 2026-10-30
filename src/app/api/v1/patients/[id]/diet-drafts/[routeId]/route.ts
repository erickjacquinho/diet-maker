import {
  discardDietDraftEndpoint,
  getDietDraftEndpoint,
  putDietDraftEndpoint,
} from '@/lib/server/diets/diet-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getDietDraftEndpoint;
export const PUT = putDietDraftEndpoint;
export const DELETE = discardDietDraftEndpoint;
