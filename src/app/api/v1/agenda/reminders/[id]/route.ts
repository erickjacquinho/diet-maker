import { putReminderEndpoint, removeReminderEndpoint } from '@/lib/server/agenda/agenda-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = putReminderEndpoint;
export const DELETE = removeReminderEndpoint;
