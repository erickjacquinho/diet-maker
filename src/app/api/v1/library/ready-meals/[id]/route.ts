import { getReadyMealEndpoint, updateReadyMealEndpoint } from '@/lib/server/library/recipe-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getReadyMealEndpoint;
export const PATCH = updateReadyMealEndpoint;
