SET lock_timeout = '4s';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'online_runtime') THEN
    CREATE ROLE online_runtime LOGIN NOINHERIT NOBYPASSRLS;
  END IF;
END
$$;

CREATE SCHEMA IF NOT EXISTS private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO online_runtime;

CREATE TABLE IF NOT EXISTS private.professional_profiles (
  owner_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  profile_cipher bytea NOT NULL CHECK (octet_length(profile_cipher) > 16),
  profile_iv bytea NOT NULL CHECK (octet_length(profile_iv) = 12),
  profile_kek_id text NOT NULL CHECK (length(profile_kek_id) > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS private.saves (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES private.professional_profiles (owner_id),
  local_account_id text NOT NULL CHECK (length(btrim(local_account_id)) > 0),
  key_id uuid NOT NULL UNIQUE,
  wrapped_key bytea NOT NULL CHECK (octet_length(wrapped_key) = 48),
  wrap_iv bytea NOT NULL CHECK (octet_length(wrap_iv) = 12),
  wrap_kek_id text NOT NULL CHECK (length(wrap_kek_id) > 0),
  binding_mac bytea NOT NULL CHECK (octet_length(binding_mac) = 32),
  binding_kek_id text NOT NULL CHECK (length(binding_kek_id) > 0),
  label_cipher bytea,
  label_iv bytea,
  label_kek_id text,
  idempotency_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT saves_local_account_id_unique UNIQUE (local_account_id),
  CONSTRAINT saves_owner_idempotency_key_unique UNIQUE (owner_id, idempotency_key),
  CONSTRAINT saves_label_cipher_fields_consistent CHECK (
    (label_cipher IS NULL AND label_iv IS NULL AND label_kek_id IS NULL)
    OR (
      label_cipher IS NOT NULL AND label_iv IS NOT NULL AND label_kek_id IS NOT NULL
      AND octet_length(label_cipher) > 16 AND octet_length(label_iv) = 12 AND length(label_kek_id) > 0
    )
  )
);

CREATE INDEX IF NOT EXISTS saves_owner_created_id_idx
  ON private.saves (owner_id, created_at DESC, id);

CREATE TABLE IF NOT EXISTS private.auth_rate_limits (
  bucket_hash text NOT NULL CHECK (length(bucket_hash) > 0),
  window_start timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts >= 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (bucket_hash, window_start),
  CHECK (expires_at > window_start)
);

DROP POLICY IF EXISTS professional_profiles_read_owner ON private.professional_profiles;
CREATE POLICY professional_profiles_read_owner ON private.professional_profiles
  FOR SELECT TO online_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

DROP POLICY IF EXISTS professional_profiles_insert_owner ON private.professional_profiles;
CREATE POLICY professional_profiles_insert_owner ON private.professional_profiles
  FOR INSERT TO online_runtime
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

DROP POLICY IF EXISTS saves_read_owner ON private.saves;
CREATE POLICY saves_read_owner ON private.saves
  FOR SELECT TO online_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

DROP POLICY IF EXISTS saves_insert_owner ON private.saves;
CREATE POLICY saves_insert_owner ON private.saves
  FOR INSERT TO online_runtime
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

DROP POLICY IF EXISTS auth_rate_limits_runtime ON private.auth_rate_limits;
CREATE POLICY auth_rate_limits_runtime ON private.auth_rate_limits
  FOR ALL TO online_runtime
  USING (true)
  WITH CHECK (true);

ALTER TABLE private.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.professional_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE private.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.saves FORCE ROW LEVEL SECURITY;
ALTER TABLE private.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.auth_rate_limits FORCE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated, online_runtime;
GRANT SELECT ON private.professional_profiles, private.saves TO online_runtime;
GRANT INSERT (owner_id, profile_cipher, profile_iv, profile_kek_id)
  ON private.professional_profiles TO online_runtime;
GRANT INSERT (
  id, owner_id, local_account_id, key_id, wrapped_key, wrap_iv, wrap_kek_id,
  binding_mac, binding_kek_id, label_cipher, label_iv, label_kek_id, idempotency_key
) ON private.saves TO online_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.auth_rate_limits TO online_runtime;

CREATE OR REPLACE VIEW private.runtime_auth_sessions
  WITH (security_barrier = true)
AS
  SELECT id, user_id FROM auth.sessions;

REVOKE ALL ON private.runtime_auth_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON private.runtime_auth_sessions TO online_runtime;
