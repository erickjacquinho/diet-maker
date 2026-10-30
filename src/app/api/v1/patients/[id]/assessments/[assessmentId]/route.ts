import { getAssessmentEndpoint, updateAssessmentEndpoint } from '@/lib/server/clinical/clinical-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = getAssessmentEndpoint;
export const PATCH = updateAssessmentEndpoint;
