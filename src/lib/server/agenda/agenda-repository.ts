import 'server-only';

import { sql, type SQL } from 'drizzle-orm';
import type { ReminderDto } from '@/lib/contracts/agenda';
import type { SqlExecutor } from '../patients/patient-repository';

type ReminderRow = { id: string; due_date: string; due_time: string; task: ReminderDto['task'] };

const MAX_ROWS = 5000;

export function createServerAgendaRepository(tx: SqlExecutor, accountId: string) {
  const run = async <T>(query: SQL): Promise<{ rows: T[] }> => ({ rows: (await tx.execute(query)).rows as T[] });
  const toReminder = (row: ReminderRow): ReminderDto => ({ id: row.id, date: row.due_date, time: row.due_time, task: row.task });
  const COLUMNS = sql`id, due_date::text AS due_date, due_time, task`;

  async function listReminders(): Promise<ReminderDto[]> {
    const { rows } = await run<ReminderRow>(sql`
      SELECT ${COLUMNS} FROM app.agenda_reminders
      WHERE account_id = ${accountId} AND removed_at IS NULL
      ORDER BY due_date, due_time, id LIMIT ${MAX_ROWS}`);
    return rows.map(toReminder);
  }

  /** Idempotent upsert by the client-supplied ID; a removed reminder with the same ID comes back. */
  async function putReminder(reminder: ReminderDto): Promise<ReminderDto> {
    const { rows } = await run<ReminderRow>(sql`
      INSERT INTO app.agenda_reminders (account_id, id, due_date, due_time, task)
      VALUES (${accountId}, ${reminder.id}, ${reminder.date}, ${reminder.time}, ${reminder.task})
      ON CONFLICT (account_id, id) DO UPDATE
        SET due_date = EXCLUDED.due_date, due_time = EXCLUDED.due_time, task = EXCLUDED.task,
            removed_at = NULL, updated_at = now()
      RETURNING ${COLUMNS}`);
    return toReminder(rows[0]);
  }

  /** Idempotent: removing a reminder that is absent or already removed succeeds. */
  async function removeReminder(id: string): Promise<void> {
    await run(sql`
      UPDATE app.agenda_reminders SET removed_at = now(), updated_at = now()
      WHERE account_id = ${accountId} AND id = ${id} AND removed_at IS NULL`);
  }

  async function listFavorites(): Promise<string[]> {
    const { rows } = await run<{ food_id: string }>(sql`
      SELECT food_id FROM app.favorite_foods WHERE account_id = ${accountId} AND is_favorite
      ORDER BY food_id LIMIT ${MAX_ROWS}`);
    return rows.map((row) => row.food_id);
  }

  /** Idempotent set semantics, so a retried toggle cannot flip the state back. */
  async function setFavorite(foodId: string, favorite: boolean): Promise<{ foodId: string; favorite: boolean }> {
    await run(sql`
      INSERT INTO app.favorite_foods (account_id, food_id, is_favorite) VALUES (${accountId}, ${foodId}, ${favorite})
      ON CONFLICT (account_id, food_id) DO UPDATE SET is_favorite = EXCLUDED.is_favorite, updated_at = now()`);
    return { foodId, favorite };
  }

  return { listReminders, putReminder, removeReminder, listFavorites, setFavorite };
}

export type ServerAgendaRepository = ReturnType<typeof createServerAgendaRepository>;
