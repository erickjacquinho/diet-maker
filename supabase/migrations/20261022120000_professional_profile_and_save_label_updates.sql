SET lock_timeout = '4s';

-- Professionals edit their own encrypted profile and rename their own saves.
-- Only the ciphertext columns become updatable; ownership, keys and bindings stay immutable.

DROP POLICY IF EXISTS professional_profiles_update_owner ON private.professional_profiles;
CREATE POLICY professional_profiles_update_owner ON private.professional_profiles
  FOR UPDATE TO online_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

GRANT UPDATE (profile_cipher, profile_iv, profile_kek_id)
  ON private.professional_profiles TO online_runtime;

DROP POLICY IF EXISTS saves_update_owner ON private.saves;
CREATE POLICY saves_update_owner ON private.saves
  FOR UPDATE TO online_runtime
  USING (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.owner_id', true), '')::uuid);

GRANT UPDATE (label_cipher, label_iv, label_kek_id)
  ON private.saves TO online_runtime;
