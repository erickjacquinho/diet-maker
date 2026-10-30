import { addObjectiveEndpoint, listObjectivesEndpoint } from '@/lib/server/objectives/objective-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listObjectivesEndpoint;
export const POST = addObjectiveEndpoint;
