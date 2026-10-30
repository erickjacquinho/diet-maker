import { listRemindersEndpoint } from '@/lib/server/agenda/agenda-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listRemindersEndpoint;
