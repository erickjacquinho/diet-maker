-- F3 / biblioteca, parte 2: receitas e refeições prontas (Decisão 15 §4.3–4.6, §5.1).
-- Ingredientes e itens (com snapshot nutricional imutável) ficam em `jsonb` na própria linha, para que
-- editar não exija apagar filhos: app_runtime não tem DELETE em nenhuma tabela. Conteúdo é S2 (em claro).
CREATE TABLE IF NOT EXISTS app.recipes (
  account_id            uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id                    uuid         NOT NULL,
  name                  text         NOT NULL CHECK (length(btrim(name)) > 0),
  category              text         NOT NULL CHECK (length(btrim(category)) > 0),
  instructions          text         NOT NULL DEFAULT '',
  prep_time_minutes     integer      CHECK (prep_time_minutes IS NULL OR prep_time_minutes >= 0),
  yield_portions        numeric      NOT NULL CHECK (yield_portions > 0),
  yield_unit            text         NOT NULL DEFAULT 'PORTION' CHECK (yield_unit IN ('PORTION', 'g', 'ml', 'unit')),
  prepared_weight_grams numeric      CHECK (prepared_weight_grams IS NULL OR prepared_weight_grams > 0),
  nutrition             jsonb        NOT NULL CHECK (jsonb_typeof(nutrition) = 'object'),
  ingredients           jsonb        NOT NULL CHECK (jsonb_typeof(ingredients) = 'array' AND jsonb_array_length(ingredients) > 0),
  status                text         NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  version               integer      NOT NULL CHECK (version > 0),
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  archived_at           timestamptz,
  PRIMARY KEY (account_id, id)
);

CREATE INDEX IF NOT EXISTS recipes_status_idx ON app.recipes (account_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS app.ready_meals (
  account_id      uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id              uuid         NOT NULL,
  name            text         NOT NULL CHECK (length(btrim(name)) > 0),
  description     text         NOT NULL DEFAULT '',
  suggested_time  text,
  items           jsonb        NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0),
  status          text         NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  version         integer      NOT NULL CHECK (version > 0),
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  archived_at     timestamptz,
  PRIMARY KEY (account_id, id)
);

CREATE INDEX IF NOT EXISTS ready_meals_status_idx ON app.ready_meals (account_id, status, updated_at DESC);

ALTER TABLE app.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.recipes FORCE ROW LEVEL SECURITY;
ALTER TABLE app.ready_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ready_meals FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recipes_tenant ON app.recipes;
CREATE POLICY recipes_tenant ON app.recipes
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

DROP POLICY IF EXISTS ready_meals_tenant ON app.ready_meals;
CREATE POLICY ready_meals_tenant ON app.ready_meals
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.recipes, app.ready_meals FROM PUBLIC, anon, authenticated, app_runtime;
-- Sem DELETE para app_runtime: receitas e refeições prontas são arquivadas.
GRANT SELECT, INSERT, UPDATE ON app.recipes, app.ready_meals TO app_runtime;
