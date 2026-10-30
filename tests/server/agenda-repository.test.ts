// @vitest-environment node
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createServerAgendaRepository } from '../../src/lib/server/agenda/agenda-repository';
import { parseFavoriteBody, parseReminderBody, parseReminderDto } from '../../src/lib/contracts/agenda';

const accountA = randomUUID();
const accountB = randomUUID();

let client: PGlite;
let db: ReturnType<typeof drizzle>;

async function asAccount<T>(accountId: string, run: (agenda: ReturnType<typeof createServerAgendaRepository>) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_runtime`);
    await tx.execute(sql`SELECT set_config('app.account_id', ${accountId}, true)`);
    return run(createServerAgendaRepository(tx as never, accountId));
  });
}

beforeAll(async () => {
  client = new PGlite();
  db = drizzle({ client });
  await client.exec(`
    CREATE ROLE app_runtime NOLOGIN; CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth; CREATE SCHEMA app; CREATE SCHEMA private;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE TABLE app.accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id uuid UNIQUE REFERENCES auth.users (id));
    CREATE FUNCTION app.current_account_id() RETURNS uuid LANGUAGE sql STABLE SET search_path = ''
      AS $$ SELECT NULLIF(current_setting('app.account_id', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA app, private TO app_runtime;
    GRANT EXECUTE ON FUNCTION app.current_account_id() TO app_runtime;
    GRANT SELECT ON app.accounts TO app_runtime;
  `);
  for (const id of [accountA, accountB]) {
    const user = randomUUID();
    await client.query('INSERT INTO auth.users VALUES ($1)', [user]);
    await client.query('INSERT INTO app.accounts (id, owner_user_id) VALUES ($1, $2)', [id, user]);
  }
  await client.exec(readFileSync('supabase/migrations/20261030150000_agenda_favorites.sql', 'utf8'));
}, 60_000);

afterAll(async () => client.close());

describe('server agenda repository', () => {
  const reminder = (id: string, date: string, time = '09:00') => ({ id, date, time, task: 'diet-update' as const });

  it('upserts reminders idempotently and lists them by date and time', async () => {
    await asAccount(accountA, (a) => a.putReminder(reminder('b', '2026-11-02', '10:00')));
    await asAccount(accountA, (a) => a.putReminder(reminder('a', '2026-11-01')));
    const moved = await asAccount(accountA, (a) => a.putReminder({ ...reminder('b', '2026-11-03'), task: 'assessment-update' }));
    expect(moved).toEqual({ id: 'b', date: '2026-11-03', time: '09:00', task: 'assessment-update' });
    expect((await asAccount(accountA, (a) => a.listReminders())).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('removes by marking, idempotently, and lets the same ID come back', async () => {
    await asAccount(accountA, (a) => a.removeReminder('a'));
    await asAccount(accountA, (a) => a.removeReminder('a'));
    await asAccount(accountA, (a) => a.removeReminder('inexistente'));
    expect((await asAccount(accountA, (a) => a.listReminders())).map((r) => r.id)).toEqual(['b']);
    const kept = await client.query<{ removed_at: unknown }>("SELECT removed_at FROM app.agenda_reminders WHERE id = 'a'");
    expect(kept.rows[0].removed_at).not.toBeNull();
    await asAccount(accountA, (a) => a.putReminder(reminder('a', '2026-12-01')));
    expect((await asAccount(accountA, (a) => a.listReminders())).map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('isolates reminders and favorites by account', async () => {
    expect(await asAccount(accountB, (a) => a.listReminders())).toEqual([]);
    await asAccount(accountB, (a) => a.removeReminder('b'));
    expect((await asAccount(accountA, (a) => a.listReminders())).map((r) => r.id)).toContain('b');
    await asAccount(accountA, (a) => a.setFavorite('taco-1', true));
    expect(await asAccount(accountB, (a) => a.listFavorites())).toEqual([]);
    await expect(db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL ROLE app_runtime`);
      await tx.execute(sql`SELECT set_config('app.account_id', ${accountB}, true)`);
      await tx.execute(sql`INSERT INTO app.favorite_foods (account_id, food_id, is_favorite) VALUES (${accountA}, 'x', true)`);
    })).rejects.toThrow();
  });

  it('sets favorites with idempotent semantics', async () => {
    await asAccount(accountA, (a) => a.setFavorite('taco-2', true));
    await asAccount(accountA, (a) => a.setFavorite('taco-2', true));
    expect(await asAccount(accountA, (a) => a.listFavorites())).toEqual(['taco-1', 'taco-2']);
    await asAccount(accountA, (a) => a.setFavorite('taco-1', false));
    await asAccount(accountA, (a) => a.setFavorite('taco-1', false));
    expect(await asAccount(accountA, (a) => a.listFavorites())).toEqual(['taco-2']);
  });

  it('grants no DELETE', async () => {
    for (const table of ['agenda_reminders', 'favorite_foods']) {
      await expect(db.transaction(async (tx) => {
        await tx.execute(sql`SET LOCAL ROLE app_runtime`);
        await tx.execute(sql`SELECT set_config('app.account_id', ${accountA}, true)`);
        await tx.execute(sql.raw(`DELETE FROM app.${table}`));
      })).rejects.toThrow();
    }
  });
});

describe('agenda contracts', () => {
  it('rejects invalid dates, times, tasks and unknown fields', () => {
    expect(() => parseReminderBody({ date: '2026-02-30', time: '09:00', task: 'diet-update' })).toThrow('Invalid date');
    expect(() => parseReminderBody({ date: '2026-02-10', time: '24:00', task: 'diet-update' })).toThrow('Invalid time');
    expect(() => parseReminderBody({ date: '2026-02-10', time: '09:00', task: 'other' })).toThrow('Invalid task');
    expect(() => parseReminderBody({ date: '2026-02-10', time: '09:00', task: 'diet-update', id: 'x' })).toThrow('Unknown field');
    expect(() => parseFavoriteBody({ favorite: 'yes' })).toThrow('Invalid flag');
    // Output is strict too: a handler that leaks an extra field fails closed instead of reaching the client.
    expect(() => parseReminderDto({ id: 'a', date: '2026-02-10', time: '09:00', task: 'diet-update', accountId: 's' })).toThrow('Unknown field');
  });
});
