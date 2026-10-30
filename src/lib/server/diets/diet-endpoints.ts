import 'server-only';

import {
  parseAutosaveResultDto,
  parseConfirmDietRequest,
  parseConfirmDietResultDto,
  parseDietPlanDto,
  parseDietPlanListDto,
  parseOptionalDietDraftDto,
  parsePutDietDraftRequest,
  routeId,
} from '@/lib/contracts/diets';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { NotFoundError } from '../api/api-errors';
import { createServerDietRepository } from './diet-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const MAX_DIET_BODY_BYTES = 512 * 1024;

const repository = (context: EndpointContext<unknown>) => createServerDietRepository(context.tx, context.account.id);

function uuidParam(context: EndpointContext<unknown>, name: string): string {
  const value = context.params[name];
  if (!value || !uuidPattern.test(value)) throw new NotFoundError();
  return value.toLowerCase();
}

function routeParam(context: EndpointContext<unknown>): string {
  try {
    return routeId(context.params.routeId);
  } catch {
    throw new NotFoundError();
  }
}

export const listDietsEndpoint = defineEndpoint({
  output: { parse: parseDietPlanListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listPlans(uuidParam(context, 'id')) };
  },
});

export const getDietEndpoint = defineEndpoint({
  output: { parse: parseDietPlanDto },
  rateLimit: 'read',
  handler: (context) => repository(context).getPlan(uuidParam(context, 'id'), uuidParam(context, 'dietId')),
});

export const confirmDietEndpoint = defineEndpoint({
  input: { parse: parseConfirmDietRequest },
  output: { parse: parseConfirmDietResultDto },
  maxBodyBytes: MAX_DIET_BODY_BYTES,
  rateLimit: 'mutation',
  handler: (context) => repository(context).confirmActive(uuidParam(context, 'id'), context.input),
});

export const getDietDraftEndpoint = defineEndpoint({
  output: { parse: parseOptionalDietDraftDto },
  rateLimit: 'read',
  async handler(context) {
    return { draft: await repository(context).getDraft(uuidParam(context, 'id'), routeParam(context)) };
  },
});

export const putDietDraftEndpoint = defineEndpoint({
  input: { parse: parsePutDietDraftRequest },
  output: { parse: parseAutosaveResultDto },
  maxBodyBytes: MAX_DIET_BODY_BYTES,
  rateLimit: 'mutation',
  handler: (context) => repository(context).putDraft(uuidParam(context, 'id'), routeParam(context), context.input),
});

export const discardDietDraftEndpoint = defineEndpoint({
  output: { parse: () => ({}) },
  rateLimit: 'mutation',
  async handler(context) {
    await repository(context).discardDraft(uuidParam(context, 'id'), routeParam(context));
    return {};
  },
});
