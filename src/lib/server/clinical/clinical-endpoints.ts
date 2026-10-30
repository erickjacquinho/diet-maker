import 'server-only';

import {
  parseAssessmentDto,
  parseAssessmentListDto,
  parseCreateAssessmentRequest,
  parseEmptyDto,
  parseFollowUpDto,
  parseFollowUpInput,
  parseOptionalFollowUpDto,
  parseUpdateAssessmentRequest,
} from '@/lib/contracts/clinical';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { NotFoundError } from '../api/api-errors';
import { accountKeys } from '../crypto/account-keys';
import { createServerClinicalRepository } from './clinical-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function repository(context: EndpointContext<unknown>) {
  return createServerClinicalRepository(context.tx, accountKeys.createSealer(context.tx, context.account.id), context.account.id);
}

function param(context: EndpointContext<unknown>, name: string): string {
  const value = context.params[name];
  if (!value || !uuidPattern.test(value)) throw new NotFoundError();
  return value.toLowerCase();
}

export const listAssessmentsEndpoint = defineEndpoint({
  output: { parse: parseAssessmentListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listAssessments(param(context, 'id')) };
  },
});

export const createAssessmentEndpoint = defineEndpoint({
  input: { parse: parseCreateAssessmentRequest },
  output: { parse: parseAssessmentDto },
  rateLimit: 'mutation',
  async handler(context) {
    const { assessment } = await repository(context).createAssessment(param(context, 'id'), context.input.id, context.input.assessment);
    return assessment;
  },
});

export const getAssessmentEndpoint = defineEndpoint({
  output: { parse: parseAssessmentDto },
  rateLimit: 'read',
  handler: (context) => repository(context).getAssessment(param(context, 'id'), param(context, 'assessmentId')),
});

export const updateAssessmentEndpoint = defineEndpoint({
  input: { parse: parseUpdateAssessmentRequest },
  output: { parse: parseAssessmentDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).updateAssessment(
    param(context, 'id'), param(context, 'assessmentId'), context.version as number, context.input,
  ),
});

export const getFollowUpEndpoint = defineEndpoint({
  output: { parse: parseOptionalFollowUpDto },
  rateLimit: 'read',
  async handler(context) {
    return { followUp: await repository(context).getFollowUp(param(context, 'id')) };
  },
});

/** No `If-Match` creates the follow-up; with it, the confirmed follow-up is replaced. */
export const setFollowUpEndpoint = defineEndpoint({
  input: { parse: parseFollowUpInput },
  output: { parse: parseFollowUpDto },
  requireVersion: 'optional',
  rateLimit: 'mutation',
  handler: (context) => repository(context).setFollowUp(param(context, 'id'), context.version, context.input),
});

export const clearFollowUpEndpoint = defineEndpoint({
  output: { parse: parseEmptyDto },
  requireVersion: true,
  rateLimit: 'mutation',
  async handler(context) {
    await repository(context).clearFollowUp(param(context, 'id'), context.version as number);
    return {};
  },
});
