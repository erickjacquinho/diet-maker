ALTER TABLE "diet_plans" ADD COLUMN IF NOT EXISTS "fixture_metadata" text DEFAULT '{}' NOT NULL;
