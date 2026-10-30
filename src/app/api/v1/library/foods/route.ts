import { createFoodEndpoint, listFoodsEndpoint } from '@/lib/server/library/library-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listFoodsEndpoint;
export const POST = createFoodEndpoint;
