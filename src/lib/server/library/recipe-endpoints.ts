import 'server-only';

import {
  parseCreateReadyMealRequest,
  parseCreateRecipeRequest,
  parseLibraryListQuery,
  parseReadyMealDto,
  parseReadyMealListDto,
  parseRecipeDto,
  parseRecipeListDto,
  parseUpdateReadyMealRequest,
  parseUpdateRecipeRequest,
} from '@/lib/contracts/recipes';
import { parseDuplicateRequest } from '@/lib/contracts/library';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { ApiError, NotFoundError } from '../api/api-errors';
import { createServerRecipeRepository } from './recipe-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

const repository = (context: EndpointContext<unknown>) => createServerRecipeRepository(context.tx, context.account.id);

function entityId(context: EndpointContext<unknown>): string {
  const id = context.params.id;
  if (!id || !uuidPattern.test(id)) throw new NotFoundError();
  return id.toLowerCase();
}

function listFilter(context: EndpointContext<unknown>) {
  try {
    return parseLibraryListQuery(new URL(context.request.url).searchParams);
  } catch {
    throw new ApiError(400, 'INVALID_REQUEST');
  }
}

export const listRecipesEndpoint = defineEndpoint({
  output: { parse: parseRecipeListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listRecipes(listFilter(context)) };
  },
});

export const createRecipeEndpoint = defineEndpoint({
  input: { parse: parseCreateRecipeRequest },
  output: { parse: parseRecipeDto },
  rateLimit: 'mutation',
  handler: (context) => repository(context).createRecipe(context.input.id, context.input.recipe),
});

export const getRecipeEndpoint = defineEndpoint({
  output: { parse: parseRecipeDto },
  rateLimit: 'read',
  handler: (context) => repository(context).getRecipe(entityId(context)),
});

export const updateRecipeEndpoint = defineEndpoint({
  input: { parse: parseUpdateRecipeRequest },
  output: { parse: parseRecipeDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).updateRecipe(entityId(context), context.version as number, context.input),
});

export const duplicateRecipeEndpoint = defineEndpoint({
  input: { parse: parseDuplicateRequest },
  output: { parse: parseRecipeDto },
  rateLimit: 'mutation',
  handler: (context) => repository(context).duplicateRecipe(entityId(context), context.input.id),
});

export const archiveRecipeEndpoint = defineEndpoint({
  output: { parse: parseRecipeDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).archiveRecipe(entityId(context), context.version as number),
});

export const restoreRecipeEndpoint = defineEndpoint({
  output: { parse: parseRecipeDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).restoreRecipe(entityId(context), context.version as number),
});

export const listReadyMealsEndpoint = defineEndpoint({
  output: { parse: parseReadyMealListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listReadyMeals(listFilter(context)) };
  },
});

export const createReadyMealEndpoint = defineEndpoint({
  input: { parse: parseCreateReadyMealRequest },
  output: { parse: parseReadyMealDto },
  rateLimit: 'mutation',
  handler: (context) => repository(context).createReadyMeal(context.input.id, context.input.readyMeal),
});

export const getReadyMealEndpoint = defineEndpoint({
  output: { parse: parseReadyMealDto },
  rateLimit: 'read',
  handler: (context) => repository(context).getReadyMeal(entityId(context)),
});

export const updateReadyMealEndpoint = defineEndpoint({
  input: { parse: parseUpdateReadyMealRequest },
  output: { parse: parseReadyMealDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).updateReadyMeal(entityId(context), context.version as number, context.input),
});

export const duplicateReadyMealEndpoint = defineEndpoint({
  input: { parse: parseDuplicateRequest },
  output: { parse: parseReadyMealDto },
  rateLimit: 'mutation',
  handler: (context) => repository(context).duplicateReadyMeal(entityId(context), context.input.id),
});

export const archiveReadyMealEndpoint = defineEndpoint({
  output: { parse: parseReadyMealDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).archiveReadyMeal(entityId(context), context.version as number),
});

export const restoreReadyMealEndpoint = defineEndpoint({
  output: { parse: parseReadyMealDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).restoreReadyMeal(entityId(context), context.version as number),
});
