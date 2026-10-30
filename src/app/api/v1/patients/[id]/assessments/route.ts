import { createAssessmentEndpoint, listAssessmentsEndpoint } from '@/lib/server/clinical/clinical-endpoints';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = listAssessmentsEndpoint;
export const POST = createAssessmentEndpoint;
