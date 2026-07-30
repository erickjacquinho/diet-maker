---
name: database-migrations-pro
description: Database migrations, zero-downtime schema evolution, expand-contract pattern, safe indexing, and RLS policies for Postgres and Supabase.
license: MIT
---

# Database Migrations & Schema Evolution

Fail-safe, production-grade schema evolution for PostgreSQL and Supabase databases.

## Fundamental Principles

1. **Zero-Downtime Rule**: Schema changes must never break running application code. Database migrations and code deployments must be decoupled using the **Expand and Contract** pattern.
2. **Reversibility**: Every migration must be atomic and reversibly planned. Never drop a column or table in the same release cycle that stops using it.
3. **Non-Blocking Execution**: Never execute exclusive table locks on production tables with active traffic without explicit lock timeouts.
4. **Idempotency**: All DDL scripts must be idempotent (`IF NOT EXISTS`, `OR REPLACE`).

---

## The Expand and Contract Pattern

When renaming or changing column types:

### Phase 1: Expand (Migration N)
Add the new column without removing the old column. Allow both columns to exist.

```sql
-- Migration 20260721000001_add_user_full_name.sql
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS full_name text;

-- Dual-write trigger or handle in application layer
CREATE OR REPLACE FUNCTION sync_user_full_name()
RETURNS trigger AS $$
BEGIN
  NEW.full_name := COALESCE(NEW.full_name, NEW.first_name || ' ' || NEW.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_full_name
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION sync_user_full_name();
```

### Phase 2: Backfill & Code Update (Deployment)
Backfill existing rows in batches and update application code to write/read from `full_name`.

```sql
-- Batch backfill to avoid long table locks
UPDATE public.users 
SET full_name = first_name || ' ' || last_name 
WHERE full_name IS NULL 
  AND id IN (SELECT id FROM public.users WHERE full_name IS NULL LIMIT 1000);
```

### Phase 3: Contract (Migration N+1)
Remove triggers and drop the legacy columns after all application servers are deployed with the new code.

```sql
-- Migration 20260721000002_drop_legacy_name_columns.sql
DROP TRIGGER IF EXISTS trg_sync_user_full_name ON public.users;
DROP FUNCTION IF EXISTS sync_user_full_name();
ALTER TABLE public.users DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.users DROP COLUMN IF EXISTS last_name;
```

---

## Safe Index Creation & Lock Prevention

### 1. Concurrent Index Creation
Never run `CREATE INDEX` on live production tables as it holds an exclusive write lock. Always use `CONCURRENTLY`.

```sql
-- Safe: Allows concurrent reads and writes during index build
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON public.orders (user_id, created_at DESC);
```

### 2. Lock Timeouts
Set explicit lock timeouts for table alterations so migrations abort quickly if blocked by long-running transactions.

```sql
SET lock_timeout = '4s';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
```

---

## Supabase Migration Workflow

1. **Declarative Schema Syncing**: Always create migrations via `supabase migration new <name>`.
2. **Local Validation**: Test migrations against local Postgres instance using `supabase db reset` before pushing to staging/production.
3. **RLS Migration Safety**: When adding Row Level Security to existing tables, always define policies *before* enabling RLS to prevent temporary access blockades:

```sql
-- 1. Create security policies first
CREATE POLICY "Users can read own data" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

## Migration Checklist Before Applying

- [ ] Is the migration idempotent (`IF NOT EXISTS`)?
- [ ] Are index creations marked `CONCURRENTLY`?
- [ ] Are breaking column/table drops deferred to Phase 3 (Contract)?
- [ ] Has `lock_timeout` been set for DDL changes?
- [ ] Are RLS policies updated to match new tables/columns?
- [ ] Has the migration been tested on local shadow DB (`supabase db reset`)?
