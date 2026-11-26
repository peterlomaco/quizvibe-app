-- ─────────────────────────────────────────────────────────────────────────
-- ROLLBACK for 0068_security_guards — reviewed 2026-11-26 (Build 41 prep).
--
-- DO NOT RUN unless Peter explicitly decides to roll back 0068 on a given
-- project (STAGING or PROD). Not a migration; never part of a normal deploy.
-- Take a backup / note the PITR timestamp first.
--
-- Each section is independent — run only the section(s) you need, top to
-- bottom within a section. Every body below was checked against the
-- definition 0068 replaced:
--   1A guard trigger   → removed (did not exist before 0068)
--   1A claim RPC       → 0054 body (no seat-owner check)
--   1B clip errors     → 0056 policy (anon + authenticated) + 0056 rate limit
--                        (30/hour per reporter); clip_blocklist removed.
--                        check-clips (new) fails OPEN without clip_blocklist,
--                        so no function redeploy is required.
--   1C invites         → 0024 body (client may pre-set to/from_user_id)
--   1D anon guards     → 0001 profile insert policy; anon triggers removed
-- Kept on purpose: index lobby_players_player_id_idx (pure performance,
-- harmless) and the 0024 invite rate-limit trigger (0068 never changed it).
--
-- After running: supabase/check-migrations.sql shows the reverted 0068 rows
-- as MISSING — expected.
-- ─────────────────────────────────────────────────────────────────────────

begin;

-- ── 1A: lobby_players own-row guard ────────────────────────────────────
drop trigger if exists guard_lobby_player_row on public.lobby_players;
drop function if exists public.guard_lobby_player_row();

-- ── 1A-claim: claim_carry_over_row back to the 0054 body ───────────────
create or replace function public.claim_carry_over_row(p_room_code text, p_player_id text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with updated as (
    update public.lobby_players
    set user_id = auth.uid(),
        has_left = false
    where room_code = upper(p_room_code)
      and player_id = p_player_id
      and user_id is null
      and auth.uid() is not null
    returning 1
  )
  select exists (select 1 from updated);
$$;
revoke all on function public.claim_carry_over_row(text, text) from public;
grant execute on function public.claim_carry_over_row(text, text) to authenticated;
drop function if exists public._lobby_seat_owner(text, text);

-- ── 1B: clip_playback_errors back to 0056 ──────────────────────────────
drop policy if exists clip_playback_errors_insert on public.clip_playback_errors;
create policy clip_playback_errors_insert on public.clip_playback_errors
  for insert to anon, authenticated
  with check (cleared = false);

create or replace function public.enforce_clip_error_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.reporter is not null and (
    select count(*) from public.clip_playback_errors
    where reporter = new.reporter and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'clip error rate limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop function if exists public.clip_blocklist(text[]);

-- ── 1C: invite sender/recipient back to the 0024 body ──────────────────
create or replace function public.set_invite_to_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.to_user_id is null then
    select id into new.to_user_id
    from public.profiles
    where player_name = new.to_player_name::citext;
  end if;
  if new.from_user_id is null then
    new.from_user_id := auth.uid();
  end if;
  return new;
end;
$$;

-- ── 1D: anonymous-session guards ───────────────────────────────────────
drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
drop trigger if exists premium_grants_reject_anonymous on public.premium_grants;
drop trigger if exists remote_match_players_reject_anonymous on public.remote_match_players;
drop function if exists public.reject_anonymous_user_row();

commit;
