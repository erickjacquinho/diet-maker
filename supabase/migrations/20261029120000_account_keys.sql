-- F2 (Decisão 15 §5.3): one wrapped DEK per account and key version.
-- The KEK never reaches the database; only the wrapped DEK is stored.
CREATE TABLE IF NOT EXISTS private.account_keys (
  account_id  uuid        NOT NULL REFERENCES app.accounts (id) ON DELETE RESTRICT,
  key_version integer     NOT NULL CHECK (key_version > 0),
  wrapped_dek bytea       NOT NULL CHECK (octet_length(wrapped_dek) = 48),
  iv          bytea       NOT NULL CHECK (octet_length(iv) = 12),
  kek_id      text        NOT NULL CHECK (length(kek_id) > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  retired_at  timestamptz,
  PRIMARY KEY (account_id, key_version)
);

CREATE UNIQUE INDEX IF NOT EXISTS account_keys_one_active
  ON private.account_keys (account_id) WHERE retired_at IS NULL;

ALTER TABLE private.account_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.account_keys FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_keys_tenant ON private.account_keys;
CREATE POLICY account_keys_tenant ON private.account_keys
  FOR ALL TO app_runtime
  USING (account_id = (SELECT app.current_account_id()))
  WITH CHECK (account_id = (SELECT app.current_account_id()));

GRANT USAGE ON SCHEMA private TO app_runtime;
REVOKE ALL ON private.account_keys FROM PUBLIC, anon, authenticated, app_runtime;
GRANT SELECT ON private.account_keys TO app_runtime;
GRANT INSERT (account_id, key_version, wrapped_dek, iv, kek_id) ON private.account_keys TO app_runtime;
-- KEK rotation re-wraps the same DEK; retiring a version is the only other mutation.
GRANT UPDATE (wrapped_dek, iv, kek_id, retired_at) ON private.account_keys TO app_runtime;
