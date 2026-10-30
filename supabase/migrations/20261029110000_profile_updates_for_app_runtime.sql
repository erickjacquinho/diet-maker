SET lock_timeout = '4s';

-- Same effect as 20261022120000 for databases where the runtime role is already named app_runtime
-- (the remote project applied 20261026220111 without 20261022120000, and that file names the old role).
-- On a replay from scratch the policies already exist for the renamed role, so this is a no-op repeat.

DROP POLICY IF EXISTS professional_profiles_update_owner ON private.professional_profiles;
CREATE POLICY professional_profiles_update_owner ON private.professional_profiles
  FOR UPDATE TO app_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

GRANT UPDATE (profile_cipher, profile_iv, profile_kek_id)
  ON private.professional_profiles TO app_runtime;

DROP POLICY IF EXISTS saves_update_owner ON private.saves;
CREATE POLICY saves_update_owner ON private.saves
  FOR UPDATE TO app_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

GRANT UPDATE (label_cipher, label_iv, label_kek_id)
  ON private.saves TO app_runtime;
