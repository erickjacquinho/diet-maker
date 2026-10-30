-- F3 / dietas e rascunhos (Decisão 15 §4.3–4.6, §5.1). A prescrição é S2 (claro, ligada só ao UUID do paciente).
-- O documento (variações → refeições → opções → itens com snapshot nutricional) é imutável por versão e
-- guardado como jsonb; o cabeçalho fica em colunas para listagem, versão e a regra de uma dieta vigente.
CREATE TABLE IF NOT EXISTS app.diet_plans (
  account_id           uuid         NOT NULL,
  id                   uuid         NOT NULL,
  patient_id           uuid         NOT NULL,
  name                 text         NOT NULL CHECK (length(btrim(name)) > 0),
  mode                 text         NOT NULL CHECK (mode IN ('SIMPLE', 'CARB_CYCLING')),
  status               text         NOT NULL CHECK (status IN ('ACTIVE', 'SNAPSHOT')),
  weight_reference_kg  numeric      CHECK (weight_reference_kg IS NULL OR weight_reference_kg > 0),
  variations           jsonb        NOT NULL CHECK (jsonb_typeof(variations) = 'array'),
  version              integer      NOT NULL CHECK (version > 0),
  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  activated_at         timestamptz  NOT NULL DEFAULT now(),
  superseded_at        timestamptz,
  PRIMARY KEY (account_id, id),
  FOREIGN KEY (account_id, patient_id) REFERENCES app.patients (account_id, id) ON DELETE RESTRICT
);

-- No máximo uma dieta vigente por paciente.
CREATE UNIQUE INDEX IF NOT EXISTS diet_plans_one_active_idx
  ON app.diet_plans (account_id, patient_id) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS diet_plans_patient_activated_idx
  ON app.diet_plans (account_id, patient_id, activated_at DESC, id);

CREATE TABLE IF NOT EXISTS app.diet_drafts (
  account_id              uuid         NOT NULL,
  patient_id              uuid         NOT NULL,
  route_diet_id           text         NOT NULL CHECK (route_diet_id = 'nova' OR route_diet_id ~ '^[0-9a-f-]{36}$'),
  draft_id                text         NOT NULL,
  payload_schema_version  integer      NOT NULL CHECK (payload_schema_version > 0),
  draft_revision          integer      NOT NULL CHECK (draft_revision > 0),
  state                   text         NOT NULL DEFAULT 'EDITABLE' CHECK (state IN ('EDITABLE', 'INVALIDATED_BY_PATIENT_ARCHIVE')),
  base_diet_id            uuid,
  base_diet_version       integer,
  target_diet_id          uuid,
  payload                 jsonb        NOT NULL,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  updated_at              timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, patient_id, route_diet_id),
  FOREIGN KEY (account_id, patient_id) REFERENCES app.patients (account_id, id) ON DELETE RESTRICT,
  CHECK ((base_diet_id IS NULL) = (base_diet_version IS NULL))
);

ALTER TABLE app.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.diet_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE app.diet_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.diet_drafts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diet_plans_tenant ON app.diet_plans;
CREATE POLICY diet_plans_tenant ON app.diet_plans
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

DROP POLICY IF EXISTS diet_drafts_tenant ON app.diet_drafts;
CREATE POLICY diet_drafts_tenant ON app.diet_drafts
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.diet_plans, app.diet_drafts FROM PUBLIC, anon, authenticated, app_runtime;
-- Prescrições são histórico clínico: sem DELETE. Rascunhos são descartáveis.
GRANT SELECT, INSERT, UPDATE ON app.diet_plans TO app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.diet_drafts TO app_runtime;
