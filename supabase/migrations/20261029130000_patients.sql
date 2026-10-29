-- F3 / pacientes (Decisão 15 §4.3–4.6, §5.1). S1 (identificação) vai cifrado em `sensitive`;
-- S2 (medidas, metas, gênero) fica em claro, ligado apenas ao UUID.
CREATE TABLE IF NOT EXISTS app.patients (
  account_id            uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id                    uuid         NOT NULL,
  display_code          text         NOT NULL CHECK (display_code ~ '^P-[0-9]{4,}$'),
  sensitive             bytea        NOT NULL CHECK (octet_length(sensitive) > 33),
  sensitive_key_version integer      NOT NULL CHECK (sensitive_key_version > 0),
  gender                text         NOT NULL,
  height_cm             numeric      CHECK (height_cm IS NULL OR height_cm > 0),
  weight_kg             numeric      CHECK (weight_kg IS NULL OR weight_kg > 0),
  current_objective     text,
  target_protein        numeric      CHECK (target_protein IS NULL OR target_protein >= 0),
  target_carbs          numeric      CHECK (target_carbs IS NULL OR target_carbs >= 0),
  target_fats           numeric      CHECK (target_fats IS NULL OR target_fats >= 0),
  target_kcal           numeric      CHECK (target_kcal IS NULL OR target_kcal >= 0),
  version               integer      NOT NULL CHECK (version > 0),
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  archived_at           timestamptz,
  PRIMARY KEY (account_id, id),
  UNIQUE (account_id, display_code)
);

ALTER TABLE app.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.patients FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patients_tenant ON app.patients;
CREATE POLICY patients_tenant ON app.patients
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

-- Arquivar em vez de apagar: sem DELETE para o papel da aplicação.
REVOKE ALL ON app.patients FROM PUBLIC, anon, authenticated, app_runtime;
GRANT SELECT, INSERT, UPDATE ON app.patients TO app_runtime;
