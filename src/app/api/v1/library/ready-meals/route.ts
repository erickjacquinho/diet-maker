import { createReadyMealEndpoint, listReadyMealsEndpoint } from '@/lib/server/library/recipe-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listReadyMealsEndpoint;
export const POST = createReadyMealEndpoint;
