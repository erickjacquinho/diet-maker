import { getPatientEndpoint, updatePatientEndpoint } from '@/lib/server/patients/patient-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getPatientEndpoint;
export const PATCH = updatePatientEndpoint;
