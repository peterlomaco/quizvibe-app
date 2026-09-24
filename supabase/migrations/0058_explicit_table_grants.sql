-- 0058_explicit_table_grants.sql
--
-- Explicit Data API grants for every table in the public schema.
--
-- WHY: from 2026-10-30 Supabase stops auto-granting anon/authenticated/
-- service_role access to NEW tables in `public`. Migrations 0001–0057 never
-- granted table access themselves — they relied on the auto-grant. Existing
-- tables in PROD + staging keep their grants, so this migration is a no-op
-- there. It exists so that replaying the migration history on a NEW project,
-- a preview branch or `supabase db reset` after 2026-10-30 still leaves every
-- table reachable through PostgREST/supabase-js.
--
-- These grants mirror exactly what the auto-grant used to give. They do NOT
-- widen row access: every table still enforces its RLS policies (deny by
-- default), which is what actually controls who sees which rows.
--
-- Idempotent — safe to re-run on PROD and staging.
--
-- CONVENTION FROM HERE ON: every migration that creates a table must add
--   grant select, insert, update, delete on public.<table> to authenticated;
--   grant select, insert, update, delete on public.<table> to anon; -- only if anon sessions need it
--   grant all on public.<table> to service_role;
-- (+ `grant usage, select on sequence ...` for serial/identity columns).

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- ⚠ Re-apply deliberate revokes. "all tables" includes VIEWS, so the blanket
-- grant above would re-open the aggregate that 0021 deliberately closed.
do $$
begin
  if to_regclass('public.question_difficulty') is not null then
    revoke select on public.question_difficulty from anon, authenticated;
  end if;
end $$;
