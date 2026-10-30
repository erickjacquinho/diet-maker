-- F3 / biblioteca, parte 1: alimentos próprios e dietas prontas (Decisão 15 §4.3–4.6, §5.1).
-- Conteúdo nutricional da conta é S2 (em claro). Receitas e refeições prontas entram na parte seguinte.
CREATE TABLE IF NOT EXISTS app.food_catalog_items (
  account_id           uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id                   uuid         NOT NULL,
  name                 text         NOT NULL CHECK (length(btrim(name)) > 0),
  description          text         NOT NULL DEFAULT '',
  brand                text,
  measurement_basis    text         NOT NULL CHECK (measurement_basis IN ('PER_100G', 'PER_100ML', 'PER_UNIT')),
  food_state           text         NOT NULL CHECK (food_state IN ('RAW', 'COOKED', 'PREPARED', 'AS_SOLD')),
  serving_reference    numeric      CHECK (serving_reference IS NULL OR serving_reference > 0),
  serving_unit         text         CHECK (serving_unit IS NULL OR serving_unit IN ('g', 'ml', 'unit')),
  reference_protein    numeric      NOT NULL CHECK (reference_protein >= 0),
  reference_carbs      numeric      NOT NULL CHECK (reference_carbs >= 0),
  reference_fat        numeric      NOT NULL CHECK (reference_fat >= 0),
  reference_fiber      numeric      NOT NULL CHECK (reference_fiber >= 0),
  reference_energy_kcal numeric     CHECK (reference_energy_kcal IS NULL OR reference_energy_kcal >= 0),
  energy_source        text         NOT NULL CHECK (energy_source IN ('REFERENCE', 'CALCULATED_449')),
  calculation_version  text         NOT NULL,
  status               text         NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  version              integer      NOT NULL CHECK (version > 0),
  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now(),
  archived_at          timestamptz,
  PRIMARY KEY (account_id, id),
  CHECK ((serving_reference IS NULL) = (serving_unit IS NULL))
);

CREATE INDEX IF NOT EXISTS food_catalog_items_status_idx ON app.food_catalog_items (account_id, status, name);

CREATE TABLE IF NOT EXISTS app.ready_diets (
  account_id   uuid         NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  id           uuid         NOT NULL,
  name         text         NOT NULL CHECK (length(btrim(name)) > 0),
  document     jsonb        NOT NULL CHECK (jsonb_typeof(document) = 'object'),
  version      integer      NOT NULL CHECK (version > 0),
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, id)
);

ALTER TABLE app.food_catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.food_catalog_items FORCE ROW LEVEL SECURITY;
ALTER TABLE app.ready_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.ready_diets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS food_catalog_items_tenant ON app.food_catalog_items;
CREATE POLICY food_catalog_items_tenant ON app.food_catalog_items
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

DROP POLICY IF EXISTS ready_diets_tenant ON app.ready_diets;
CREATE POLICY ready_diets_tenant ON app.ready_diets
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.food_catalog_items, app.ready_diets FROM PUBLIC, anon, authenticated, app_runtime;
-- Alimento sem uso pode ser excluído; dieta pronta só é criada e listada nesta versão.
GRANT SELECT, INSERT, UPDATE, DELETE ON app.food_catalog_items TO app_runtime;
GRANT SELECT, INSERT, UPDATE ON app.ready_diets TO app_runtime;
