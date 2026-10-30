import 'server-only';

import { parseAddObjectiveRequest, parseObjectiveDto, parseObjectiveListDto } from '@/lib/contracts/objectives';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { NotFoundError } from '../api/api-errors';
import { createServerObjectiveRepository } from './objective-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

const repository = (context: EndpointContext<unknown>) => createServerObjectiveRepository(context.tx, context.account.id);

export const listObjectivesEndpoint = defineEndpoint({
  output: { parse: parseObjectiveListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).list() };
  },
});

export const addObjectiveEndpoint = defineEndpoint({
  input: { parse: parseAddObjectiveRequest },
  output: { parse: parseObjectiveDto },
  rateLimit: 'mutation',
  handler: (context) => repository(context).addCustom(context.input.label),
});

export const archiveObjectiveEndpoint = defineEndpoint({
  output: { parse: () => ({}) },
  rateLimit: 'mutation',
  async handler(context) {
    const id = context.params.id;
    // Built-in IDs reach the repository so they get a clear 422; anything else must be a UUID.
    if (!id || (!id.startsWith('system-') && !uuidPattern.test(id))) throw new NotFoundError();
    await repository(context).archiveCustom(id.startsWith('system-') ? id : id.toLowerCase());
    return {};
  },
});
