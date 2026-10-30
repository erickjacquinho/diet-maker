-- F3 / catálogo de objetivos do paciente. Só objetivos personalizados da conta ficam no banco; os quatro
-- objetivos padrão são devolvidos pela API (não pertencem a nenhuma conta e não podem ser arquivados).
-- Sem DELETE para app_runtime: arquivar marca `archived_at`, e adicionar o mesmo rótulo restaura a linha.
CREATE TABLE IF NOT EXISTS app.objective_options (
  account_id        uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id                uuid         NOT NULL,
  label             text         NOT NULL CHECK (length(btrim(label)) > 0 AND length(label) <= 100),
  normalized_label  text         NOT NULL CHECK (length(normalized_label) > 0),
  created_at        timestamptz  NOT NULL DEFAULT now(),
  updated_at        timestamptz  NOT NULL DEFAULT now(),
  archived_at       timestamptz,
  PRIMARY KEY (account_id, id),
  UNIQUE (account_id, normalized_label)
);

ALTER TABLE app.objective_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.objective_options FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS objective_options_tenant ON app.objective_options;
CREATE POLICY objective_options_tenant ON app.objective_options
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.objective_options FROM PUBLIC, anon, authenticated, app_runtime;
GRANT SELECT, INSERT, UPDATE ON app.objective_options TO app_runtime;
