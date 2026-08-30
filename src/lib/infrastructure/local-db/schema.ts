import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  real,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const objectiveOptions = pgTable(
  'objective_options',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    normalizedLabel: text('normalized_label').notNull(),
    origin: text('origin').notNull(),
    archivedAt: text('archived_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('objective_options_active_label_idx')
      .on(table.accountId, table.normalizedLabel)
      .where(sql`${table.archivedAt} IS NULL`),
    index('objective_options_account_idx').on(table.accountId),
    check('objective_options_origin_check', sql`${table.origin} in ('SYSTEM', 'CUSTOM')`),
  ],
);

export const patients = pgTable(
  'patients',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    displayCode: text('display_code').notNull(),
    name: text('name').notNull(),
    age: integer('age').notNull(),
    gender: text('gender').notNull(),
    heightCm: real('height_cm').notNull(),
    weightKg: real('weight_kg').notNull(),
    maritalStatus: text('marital_status'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    currentObjective: text('current_objective').notNull(),
    targetProtein: real('target_protein').notNull(),
    targetCarbs: real('target_carbs').notNull(),
    targetFats: real('target_fats').notNull(),
    targetKcal: real('target_kcal').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    version: integer('version').notNull(),
    archivedAt: text('archived_at'),
  },
  (table) => [
    index('patients_account_idx').on(table.accountId),
    uniqueIndex('patients_account_display_code_idx').on(table.accountId, table.displayCode),
    check('patients_age_non_negative', sql`${table.age} >= 0`),
    check('patients_height_positive', sql`${table.heightCm} > 0`),
    check('patients_weight_positive', sql`${table.weightKg} > 0`),
    check('patients_macros_non_negative', sql`${table.targetProtein} >= 0 and ${table.targetCarbs} >= 0 and ${table.targetFats} >= 0 and ${table.targetKcal} >= 0`),
    check('patients_version_positive', sql`${table.version} > 0`),
  ],
);

export const schema = { accounts, objectiveOptions, patients };
export type LocalDbSchema = typeof schema;
