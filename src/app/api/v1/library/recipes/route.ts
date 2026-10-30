import { createRecipeEndpoint, listRecipesEndpoint } from '@/lib/server/library/recipe-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listRecipesEndpoint;
export const POST = createRecipeEndpoint;
