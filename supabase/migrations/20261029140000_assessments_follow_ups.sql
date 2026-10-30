-- F3 / avaliações e acompanhamento (Decisão 15 §4.3–4.6, §5.1). Medidas são S2 (claro, ligadas só ao UUID);
-- comentários do acompanhamento são texto livre (S1) e vão cifrados. FK composta garante a mesma conta.
CREATE TABLE IF NOT EXISTS app.body_assessments (
  account_id               uuid         NOT NULL,
  id                       uuid         NOT NULL,
  patient_id               uuid         NOT NULL,
  clinical_date            date         NOT NULL,
  assessment_type          text         NOT NULL CHECK (assessment_type IN ('complete', 'simplified')),
  weight_kg                numeric      NOT NULL CHECK (weight_kg > 0),
  body_fat_percent         numeric      CHECK (body_fat_percent IS NULL OR (body_fat_percent >= 0 AND body_fat_percent <= 100)),
  fat_mass_kg              numeric      CHECK (fat_mass_kg IS NULL OR fat_mass_kg >= 0),
  lean_mass_kg             numeric      CHECK (lean_mass_kg IS NULL OR lean_mass_kg >= 0),
  waist_cm                 numeric      CHECK (waist_cm IS NULL OR waist_cm > 0),
  scapula_cm               numeric      CHECK (scapula_cm IS NULL OR scapula_cm > 0),
  bust_cm                  numeric      CHECK (bust_cm IS NULL OR bust_cm > 0),
  abdomen_cm               numeric      CHECK (abdomen_cm IS NULL OR abdomen_cm > 0),
  hip_cm                   numeric      CHECK (hip_cm IS NULL OR hip_cm > 0),
  left_proximal_thigh_cm   numeric      CHECK (left_proximal_thigh_cm IS NULL OR left_proximal_thigh_cm > 0),
  right_proximal_thigh_cm  numeric      CHECK (right_proximal_thigh_cm IS NULL OR right_proximal_thigh_cm > 0),
  neck_cm                  numeric      CHECK (neck_cm IS NULL OR neck_cm > 0),
  left_arm_cm              numeric      CHECK (left_arm_cm IS NULL OR left_arm_cm > 0),
  right_arm_cm             numeric      CHECK (right_arm_cm IS NULL OR right_arm_cm > 0),
  left_distal_thigh_cm     numeric      CHECK (left_distal_thigh_cm IS NULL OR left_distal_thigh_cm > 0),
  right_distal_thigh_cm    numeric      CHECK (right_distal_thigh_cm IS NULL OR right_distal_thigh_cm > 0),
  left_calf_cm             numeric      CHECK (left_calf_cm IS NULL OR left_calf_cm > 0),
  right_calf_cm            numeric      CHECK (right_calf_cm IS NULL OR right_calf_cm > 0),
  auto_filled_fields       jsonb        NOT NULL DEFAULT '[]'::jsonb,
  calculation_method       text         NOT NULL CHECK (calculation_method IN ('US_NAVY', 'NONE')),
  calculation_version      text         NOT NULL,
  calculation_input        jsonb        NOT NULL,
  version                  integer      NOT NULL CHECK (version > 0),
  created_at               timestamptz  NOT NULL DEFAULT now(),
  updated_at               timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, id),
  FOREIGN KEY (account_id, patient_id) REFERENCES app.patients (account_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS body_assessments_patient_date_idx
  ON app.body_assessments (account_id, patient_id, clinical_date DESC, created_at DESC, id);

CREATE TABLE IF NOT EXISTS app.next_follow_ups (
  account_id             uuid         NOT NULL,
  patient_id             uuid         NOT NULL,
  assessment_due_date    date,
  diet_due_date          date,
  comments               bytea        NOT NULL CHECK (octet_length(comments) > 33),
  comments_key_version   integer      NOT NULL CHECK (comments_key_version > 0),
  version                integer      NOT NULL CHECK (version > 0),
  created_at             timestamptz  NOT NULL DEFAULT now(),
  updated_at             timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, patient_id),
  FOREIGN KEY (account_id, patient_id) REFERENCES app.patients (account_id, id) ON DELETE RESTRICT,
  CHECK (assessment_due_date IS NOT NULL OR diet_due_date IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS next_follow_ups_due_idx
  ON app.next_follow_ups (account_id, (LEAST(assessment_due_date, diet_due_date)), patient_id);

ALTER TABLE app.body_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.body_assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE app.next_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.next_follow_ups FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS body_assessments_tenant ON app.body_assessments;
CREATE POLICY body_assessments_tenant ON app.body_assessments
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

DROP POLICY IF EXISTS next_follow_ups_tenant ON app.next_follow_ups;
CREATE POLICY next_follow_ups_tenant ON app.next_follow_ups
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

REVOKE ALL ON app.body_assessments, app.next_follow_ups FROM PUBLIC, anon, authenticated, app_runtime;
-- Avaliações são histórico clínico: sem DELETE. O acompanhamento é removido ao ser cancelado.
GRANT SELECT, INSERT, UPDATE ON app.body_assessments TO app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.next_follow_ups TO app_runtime;
