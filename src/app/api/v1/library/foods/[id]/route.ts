import { deleteFoodEndpoint, getFoodEndpoint, updateFoodEndpoint } from '@/lib/server/library/library-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getFoodEndpoint;
export const PATCH = updateFoodEndpoint;
export const DELETE = deleteFoodEndpoint;
