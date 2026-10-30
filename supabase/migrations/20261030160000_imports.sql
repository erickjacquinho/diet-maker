-- F4 / transferência do `.nutridiet` (Decisão 15 §7). Uma linha por importação concluída: a chave de
-- idempotência é o SHA-256 do arquivo, então repetir o envio devolve o mesmo resumo sem regravar nada.
CREATE TABLE IF NOT EXISTS app.import_runs (
  account_id       uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  idempotency_key  text         NOT NULL CHECK (idempotency_key ~ '^[0-9a-f]{64}$'),
  source_format    text         NOT NULL CHECK (source_format IN ('nutridiet-v1-plaintext', 'nutridiet-v2-protected')),
  summary          jsonb        NOT NULL CHECK (jsonb_typeof(summary) = 'object'),
  created_at       timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, idempotency_key)
);

ALTER TABLE app.import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.import_runs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS import_runs_tenant ON app.import_runs;
CREATE POLICY import_runs_tenant ON app.import_runs
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.import_runs FROM PUBLIC, anon, authenticated, app_runtime;
-- Registro de auditoria: só inserção e leitura.
GRANT SELECT, INSERT ON app.import_runs TO app_runtime;
