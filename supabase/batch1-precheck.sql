-- Batch 1 (0068_security_guards) pre-checks. READ-ONLY — nothing is changed.
-- Run in Supabase Dashboard → SQL Editor on the project you are about to
-- migrate (STAGING first). Run each block separately and keep the output.

-- 1. Applied migrations: run supabase/check-migrations.sql first.

-- 2. Deployed bodies of every function 0068 replaces. Compare with the repo
--    (0054 claim_carry_over_row, 0024 set_invite_to_user_id,
--    0056 enforce_clip_error_rate_limit). Any difference must be reviewed
--    before 0068 runs.
select p.proname, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('claim_carry_over_row', 'set_invite_to_user_id',
                    'enforce_clip_error_rate_limit')
order by 1;

-- 3. Policies 0068 replaces, as deployed.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and ((tablename = 'profiles' and cmd = 'INSERT')
    or (tablename = 'clip_playback_errors'))
order by 1, 2;

-- 4. Triggers already on the tables 0068 adds triggers to.
select c.relname as table_name, t.tgname, pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and not t.tgisinternal
  and c.relname in ('lobby_players', 'premium_grants', 'remote_match_players',
                    'waiting_invites', 'clip_playback_errors')
order by 1, 2;

-- 5. Names 0068 will create must not exist yet (expect 0 rows on first run).
select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('guard_lobby_player_row', '_lobby_seat_owner',
                    'clip_blocklist', 'reject_anonymous_user_row');

-- 6. auth.users.is_anonymous must exist (0068 relies on it).
select column_name from information_schema.columns
where table_schema = 'auth' and table_name = 'users' and column_name = 'is_anonymous';

-- 7. Data already affected (counts only; 0068 deletes nothing).
select 'anonymous users with a profiles row' as what, count(*)
from public.profiles p join auth.users u on u.id = p.id where u.is_anonymous
union all
select 'premium grants held by anonymous users', count(*)
from public.premium_grants g join auth.users u on u.id = g.user_id where u.is_anonymous
union all
select 'remote match seats held by anonymous users', count(*)
from public.remote_match_players m join auth.users u on u.id = m.user_id where u.is_anonymous
union all
select 'uncleared clip reports with no reporter', count(*)
from public.clip_playback_errors where reporter is null and not cleared;

-- 8. L16 grant audit (from the remediation plan).
select c.relname as table_without_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;

select v.table_name, g.grantee, g.privilege_type
from information_schema.views v
join information_schema.role_table_grants g
  on g.table_schema = v.table_schema and g.table_name = v.table_name
where v.table_schema = 'public' and g.grantee in ('anon', 'authenticated');

select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and has_function_privilege('anon', p.oid, 'execute')
order by 1;
