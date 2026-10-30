import { getRecipeEndpoint, updateRecipeEndpoint } from '@/lib/server/library/recipe-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getRecipeEndpoint;
export const PATCH = updateRecipeEndpoint;
