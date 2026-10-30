import { createReadyDietEndpoint, listReadyDietsEndpoint } from '@/lib/server/library/library-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listReadyDietsEndpoint;
export const POST = createReadyDietEndpoint;
