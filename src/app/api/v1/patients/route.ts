import { createPatientEndpoint } from '@/lib/server/patients/patient-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = createPatientEndpoint;
