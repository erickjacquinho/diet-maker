import 'server-only';

import {
  parseCreateFoodRequest,
  parseCreateReadyDietRequest,
  parseDuplicateRequest,
  parseFoodDto,
  parseFoodListDto,
  parseFoodListRequest,
  parseReadyDietDto,
  parseReadyDietListDto,
  parseUpdateFoodRequest,
} from '@/lib/contracts/library';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { ApiError, NotFoundError } from '../api/api-errors';
import { createServerLibraryRepository } from './library-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const MAX_READY_DIET_BYTES = 512 * 1024;

const repository = (context: EndpointContext<unknown>) => createServerLibraryRepository(context.tx, context.account.id);

function foodId(context: EndpointContext<unknown>): string {
  const id = context.params.id;
  if (!id || !uuidPattern.test(id)) throw new NotFoundError();
  return id.toLowerCase();
}

export const listFoodsEndpoint = defineEndpoint({
  output: { parse: parseFoodListDto },
  rateLimit: 'read',
  async handler(context) {
    let filter;
    try {
      filter = parseFoodListRequest(new URL(context.request.url).searchParams);
    } catch {
      throw new ApiError(400, 'INVALID_REQUEST');
    }
    return { items: await repository(context).listFoods(filter) };
  },
});

export const createFoodEndpoint = defineEndpoint({
  input: { parse: parseCreateFoodRequest },
  output: { parse: parseFoodDto },
  rateLimit: 'mutation',
  async handler(context) {
    return (await repository(context).createFood(context.input.id, context.input.food)).food;
  },
});

export const getFoodEndpoint = defineEndpoint({
  output: { parse: parseFoodDto },
  rateLimit: 'read',
  handler: (context) => repository(context).getFood(foodId(context)),
});

export const updateFoodEndpoint = defineEndpoint({
  input: { parse: parseUpdateFoodRequest },
  output: { parse: parseFoodDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).updateFood(foodId(context), context.version as number, context.input),
});

export const duplicateFoodEndpoint = defineEndpoint({
  input: { parse: parseDuplicateRequest },
  output: { parse: parseFoodDto },
  rateLimit: 'mutation',
  async handler(context) {
    return (await repository(context).duplicateFood(foodId(context), context.input.id)).food;
  },
});

export const archiveFoodEndpoint = defineEndpoint({
  output: { parse: parseFoodDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).archiveFood(foodId(context), context.version as number),
});

export const restoreFoodEndpoint = defineEndpoint({
  output: { parse: parseFoodDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).restoreFood(foodId(context), context.version as number),
});

export const listReadyDietsEndpoint = defineEndpoint({
  output: { parse: parseReadyDietListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listReadyDiets() };
  },
});

export const createReadyDietEndpoint = defineEndpoint({
  input: { parse: parseCreateReadyDietRequest },
  output: { parse: parseReadyDietDto },
  maxBodyBytes: MAX_READY_DIET_BYTES,
  rateLimit: 'mutation',
  handler: (context) => repository(context).createReadyDiet(context.input.id, context.input.name, context.input.document),
});
