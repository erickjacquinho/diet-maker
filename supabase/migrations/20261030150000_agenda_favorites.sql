-- F3 / agenda e favoritos (Decisão 15 §4.3–4.6). Preferências da conta, em claro (S2).
-- Sem DELETE para app_runtime: remover um lembrete ou desfavoritar marca a linha em vez de apagá-la.
CREATE TABLE IF NOT EXISTS app.agenda_reminders (
  account_id   uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id           text         NOT NULL CHECK (id ~ '^[A-Za-z0-9_-]{1,100}$'),
  due_date     date         NOT NULL,
  due_time     text         NOT NULL CHECK (due_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  task         text         NOT NULL CHECK (task IN ('diet-update', 'assessment-update')),
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  removed_at   timestamptz,
  PRIMARY KEY (account_id, id)
);

CREATE INDEX IF NOT EXISTS agenda_reminders_due_idx
  ON app.agenda_reminders (account_id, due_date, due_time) WHERE removed_at IS NULL;

CREATE TABLE IF NOT EXISTS app.favorite_foods (
  account_id   uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  food_id      text         NOT NULL CHECK (food_id ~ '^[A-Za-z0-9_.:-]{1,100}$'),
  is_favorite  boolean      NOT NULL,
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, food_id)
);

ALTER TABLE app.agenda_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.agenda_reminders FORCE ROW LEVEL SECURITY;
ALTER TABLE app.favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.favorite_foods FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agenda_reminders_tenant ON app.agenda_reminders;
CREATE POLICY agenda_reminders_tenant ON app.agenda_reminders
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

DROP POLICY IF EXISTS favorite_foods_tenant ON app.favorite_foods;
CREATE POLICY favorite_foods_tenant ON app.favorite_foods
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.agenda_reminders, app.favorite_foods FROM PUBLIC, anon, authenticated, app_runtime;
GRANT SELECT, INSERT, UPDATE ON app.agenda_reminders, app.favorite_foods TO app_runtime;
