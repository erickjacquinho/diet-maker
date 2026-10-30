import 'server-only';

import {
  isFavoriteFoodId,
  isReminderId,
  parseFavoriteBody,
  parseFavoriteListDto,
  parseFavoriteStateDto,
  parseRemovedDto,
  parseReminderBody,
  parseReminderDto,
  parseReminderListDto,
} from '@/lib/contracts/agenda';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { NotFoundError } from '../api/api-errors';
import { createServerAgendaRepository } from './agenda-repository';

const repository = (context: EndpointContext<unknown>) => createServerAgendaRepository(context.tx, context.account.id);

export const listRemindersEndpoint = defineEndpoint({
  output: { parse: parseReminderListDto },
  rateLimit: 'read',
  async handler(context) {
    return { items: await repository(context).listReminders() };
  },
});

export const putReminderEndpoint = defineEndpoint({
  input: { parse: parseReminderBody },
  output: { parse: parseReminderDto },
  rateLimit: 'mutation',
  async handler(context) {
    const id = context.params.id;
    if (!isReminderId(id)) throw new NotFoundError();
    return repository(context).putReminder({ id, ...context.input });
  },
});

export const removeReminderEndpoint = defineEndpoint({
  output: { parse: parseRemovedDto },
  rateLimit: 'mutation',
  async handler(context) {
    const id = context.params.id;
    if (!isReminderId(id)) throw new NotFoundError();
    await repository(context).removeReminder(id);
    return { removed: true };
  },
});

export const listFavoritesEndpoint = defineEndpoint({
  output: { parse: parseFavoriteListDto },
  rateLimit: 'read',
  async handler(context) {
    return { foodIds: await repository(context).listFavorites() };
  },
});

export const setFavoriteEndpoint = defineEndpoint({
  input: { parse: parseFavoriteBody },
  output: { parse: parseFavoriteStateDto },
  rateLimit: 'mutation',
  async handler(context) {
    const foodId = context.params.foodId;
    if (!isFavoriteFoodId(foodId)) throw new NotFoundError();
    return repository(context).setFavorite(foodId, context.input.favorite);
  },
});
