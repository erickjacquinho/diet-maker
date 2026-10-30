import 'server-only';

import { sql } from 'drizzle-orm';
import { parsePatientSummariesDto, parsePatientSummariesRequest, type PatientSummaryDto } from '@/lib/contracts/clinical';
import { defineEndpoint } from '../api/define-endpoint';
import { accountKeys } from '../crypto/account-keys';
import { createServerClinicalRepository } from '../clinical/clinical-repository';
import { createServerDietRepository } from '../diets/diet-repository';
import type { SqlExecutor } from './patient-repository';

type Activity = NonNullable<PatientSummaryDto['lastActivity']>;

/** The most recent of the latest assessment and the latest diet, by event date and then confirmation time. */
function pickLastActivity(candidates: Activity[]): Activity | null {
  return candidates.sort((a, b) => b.eventDate.localeCompare(a.eventDate) || b.confirmedAt.localeCompare(a.confirmedAt))[0] ?? null;
}

export async function summarizePatients(
  tx: SqlExecutor,
  accountId: string,
  patientIds: readonly string[],
  sealer = accountKeys.createSealer(tx as never, accountId),
): Promise<PatientSummaryDto[]> {
  // Only patients of this account (RLS) are summarized; unknown or foreign IDs are silently left out.
  const existing = (await tx.execute(sql`
    SELECT id FROM app.patients WHERE account_id = ${accountId}
      AND id IN (${sql.join(patientIds.map((id) => sql`${id}::uuid`), sql`, `)})`)).rows as Array<{ id: string }>;
  const ids = existing.map((row) => row.id);
  const clinical = createServerClinicalRepository(tx, sealer, accountId);
  const [assessments, followUps, diets] = await Promise.all([
    clinical.summarizeAssessments(ids),
    clinical.listFollowUps(ids),
    createServerDietRepository(tx, accountId).summarize(ids),
  ]);
  return ids.map((patientId) => {
    const assessment = assessments.get(patientId);
    const diet = diets.get(patientId);
    const candidates: Activity[] = [];
    if (assessment?.latest) {
      candidates.push({ eventDate: assessment.latest.clinicalDate, confirmedAt: assessment.latest.createdAt, type: 'assessment', sourceId: assessment.latest.id });
    }
    if (diet) candidates.push({ eventDate: diet.latest.activatedAt.slice(0, 10), confirmedAt: diet.latest.updatedAt, type: 'diet', sourceId: diet.latest.id });
    return {
      patientId,
      dietCount: diet?.count ?? 0,
      assessmentCount: assessment?.count ?? 0,
      latestAssessment: assessment?.latest ?? null,
      previousAssessment: assessment?.previous ?? null,
      nextFollowUp: followUps.get(patientId) ?? null,
      lastActivity: pickLastActivity(candidates),
    } satisfies Omit<PatientSummaryDto, 'latestAssessment' | 'previousAssessment' | 'nextFollowUp'> & Record<string, unknown>;
  });
}

export const patientSummariesEndpoint = defineEndpoint({
  input: { parse: parsePatientSummariesRequest },
  output: { parse: parsePatientSummariesDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await summarizePatients(context.tx, context.account.id, context.input.patientIds) };
  },
});
