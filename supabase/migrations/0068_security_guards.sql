-- ─────────────────────────────────────────────────────────────────────
-- 0068_security_guards — Security Remediation Batch 1 (audit 2026-11-13,
-- plan rev 3). Applied via Supabase SQL Editor (manual).
--
-- ⚠ STAGING FIRST. PROD is frozen until Peter lifts the freeze after the
--   App Store review. Same file for both projects.
--
-- Depends only on objects present on PROD (0001–0059) AND staging:
--   lobby_players (0003), rooms.rematch_locked/rematch_player_ids (0037),
--   profiles (0001), waiting_invites + from_user_id (0010/0024),
--   clip_playback_errors (0056), claim_carry_over_row (0054),
--   premium_grants (0047), remote_match_players (0027).
-- Never references device_mode / multiplayer_v2 / game_config, and nothing
-- in 0060–0067 redefines an object changed here, so PROD can run this
-- before 0060–0067 without either overwriting the other.
--
-- Idempotent. No data is deleted or rewritten.
--
--   1A        guard_lobby_player_row trigger (lobby_players INSERT/UPDATE)
--   1A-claim  claim_carry_over_row only binds a seat to its real owner
--   1B        clip_playback_errors: reporter = auth.uid(), 10/24h, and the
--             clip_blocklist() helper used by the check-clips Edge Function
--   1C        waiting_invites: sender/recipient always set server-side
--   1D        anonymous sessions: no profiles row, no premium grant, no
--             remote match participation
--
-- Rollback: see the commented block at the end of this file.
-- ─────────────────────────────────────────────────────────────────────


-- ══ 1A / 1A-claim ═════════════════════════════════════════════════════

-- Lookups below search lobby_players by player_id across rooms.
create index if not exists lobby_players_player_id_idx
  on public.lobby_players (player_id);

-- Owner of a reserved re-match seat, or NULL when it can't be determined
-- unambiguously. A seat exists only in a rematch-locked room whose
-- rematch_player_ids (written by the host at room creation) contains the
-- player_id.
--   • 'comp-<uuid>' (Marathon re-match): the uuid, if it is a profile.
--   • any other id (Final Leaderboard re-match): the user_id that held the
--     same player_id in ANOTHER room of the SAME host. If those rooms
--     disagree on the user (more than one distinct user), return NULL —
--     fail closed rather than guess.
create or replace function public._lobby_seat_owner(p_room_code text, p_player_id text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code  text := upper(p_room_code);
  v_room  public.rooms%rowtype;
  v_owner uuid;
  v_count int;
begin
  select * into v_room from public.rooms where code = v_code;
  if not found
     or not coalesce(v_room.rematch_locked, false)
     or not (p_player_id = any(coalesce(v_room.rematch_player_ids, array[]::text[]))) then
    return null;
  end if;

  if p_player_id ~ '^comp-[0-9a-fA-F-]{36}$' then
    select p.id into v_owner
    from public.profiles p
    where p.id = substr(p_player_id, 6)::uuid;
    return v_owner;
  end if;

  select count(distinct lp.user_id), min(lp.user_id::text)::uuid
    into v_count, v_owner
  from public.lobby_players lp
  join public.rooms r on r.code = lp.room_code
  where lp.player_id = p_player_id
    and lp.room_code <> v_code
    and r.host_user_id = v_room.host_user_id
    and lp.user_id is not null
    and not lp.is_host;

  if v_count = 1 then
    return v_owner;
  end if;
  return null;
end;
$$;

revoke execute on function public._lobby_seat_owner(text, text) from public, anon, authenticated;

-- The guard. SECURITY DEFINER only so its lookups work for every role that
-- writes lobby_players (incl. the auth-admin role running the account-
-- deletion cascade). Rules key on auth.uid() from the request claims, never
-- on current_user, so definer RPCs get no blanket exemption.
create or replace function public.guard_lobby_player_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_room_host boolean;
  v_owner     uuid;
begin
  -- Backend writes with no end-user identity (SQL Editor, service role,
  -- the auth-admin account-deletion cascade) are not client requests.
  -- Every PostgREST/RPC request from the app carries role anon or
  -- authenticated in its JWT claims — including calls into SECURITY
  -- DEFINER RPCs — so clients can never reach this exemption.
  if v_uid is null
     and coalesce(auth.jwt() ->> 'role', '') not in ('anon', 'authenticated') then
    return new;
  end if;

  select exists (
    select 1 from public.rooms r
    where r.code = new.room_code and r.host_user_id = v_uid
  ) into v_room_host;

  if tg_op = 'INSERT' then
    -- INSERT … ON CONFLICT also fires BEFORE INSERT for a row that already
    -- exists, and EXCLUDED carries whatever this branch writes into NEW.
    -- Forcing approved=false here would then un-approve an approved player
    -- on every rejoin upsert. Leave such rows to the UPDATE branch below,
    -- which applies the same rules against the stored row.
    if exists (
      select 1 from public.lobby_players
      where room_code = new.room_code and player_id = new.player_id
    ) then
      return new;
    end if;

    if not v_room_host then
      if new.is_host then
        raise exception 'qv_lobby_guard:not_room_host' using errcode = '42501';
      end if;
      new.approved := false;
    elsif new.user_id is null and not coalesce(new.is_host, false) then
      -- Host reserving a re-match seat: bind it to its owner now, so no one
      -- else can claim it later. NULL when the owner can't be determined.
      new.user_id := public._lobby_seat_owner(new.room_code, new.player_id);
    end if;
    return new;
  end if;

  -- UPDATE
  if new.room_code is distinct from old.room_code
     or new.player_id is distinct from old.player_id then
    raise exception 'qv_lobby_guard:immutable_column' using errcode = '42501';
  end if;

  -- is_host never changes after insert; silently keep the stored value so a
  -- full-row upsert from a legitimate client never fails on it.
  new.is_host := old.is_host;

  if new.user_id is distinct from old.user_id then
    if new.user_id is null then
      null;  -- detach: account-deletion cascade (ON DELETE SET NULL) or host
    elsif old.user_id is null and new.user_id = v_uid then
      v_owner := public._lobby_seat_owner(new.room_code, new.player_id);
      if v_owner is distinct from v_uid then
        raise exception 'qv_lobby_guard:not_seat_owner' using errcode = '42501';
      end if;
    else
      raise exception 'qv_lobby_guard:user_id_change' using errcode = '42501';
    end if;
  end if;

  -- Only the room host approves. Keep the stored value instead of raising so
  -- a joiner's full-row upsert (which repeats approved) still succeeds.
  if new.approved and not old.approved and not v_room_host then
    new.approved := old.approved;
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_lobby_player_row() from public, anon, authenticated;

drop trigger if exists guard_lobby_player_row on public.lobby_players;
create trigger guard_lobby_player_row
  before insert or update on public.lobby_players
  for each row execute function public.guard_lobby_player_row();

-- Same signature/return as 0054. Only binds the caller to a seat that is
-- theirs; anyone else gets false and the row is untouched.
create or replace function public.claim_carry_over_row(
  p_room_code text,
  p_player_id text
)
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
      and public._lobby_seat_owner(p_room_code, p_player_id) = auth.uid()
    returning 1
  )
  select exists (select 1 from updated);
$$;

revoke all on function public.claim_carry_over_row(text, text) from public, anon;
grant execute on function public.claim_carry_over_row(text, text) to authenticated;


-- ══ 1B ════════════════════════════════════════════════════════════════

drop policy if exists clip_playback_errors_insert on public.clip_playback_errors;
create policy clip_playback_errors_insert on public.clip_playback_errors
  for insert to authenticated
  with check (cleared = false and reporter = auth.uid());

create or replace function public.enforce_clip_error_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    -- Backend insert (SQL Editor / service role): not a client report.
    if coalesce(auth.jwt() ->> 'role', '') not in ('anon', 'authenticated') then
      return new;
    end if;
    raise exception 'clip error report requires a session' using errcode = 'P0001';
  end if;
  if (
    select count(*) from public.clip_playback_errors
    where reporter = v_uid and created_at > now() - interval '24 hours'
  ) >= 10 then
    raise exception 'clip error rate limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Blocklist used by the check-clips Edge Function (service role only).
-- A clip is blocked when ≥ 2 distinct non-anonymous reporters reported
-- video_not_found / embed_not_allowed within 7 days (uncleared rows).
-- Circuit breaker: if more than 25 distinct clips reached that bar within
-- the last 24 hours, the list is treated as poisoned and nothing is
-- returned (breaker_tripped = true) — the Edge Function then fails open.
create or replace function public.clip_blocklist(p_video_ids text[])
returns table (video_id text, breaker_tripped boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_recent int;
begin
  with qualified as (
    select e.video_id, max(e.created_at) as last_at
    from public.clip_playback_errors e
    join auth.users u on u.id = e.reporter
    where not e.cleared
      and e.error_code in ('video_not_found', 'embed_not_allowed')
      and e.created_at > now() - interval '7 days'
      and not coalesce(u.is_anonymous, false)
    group by e.video_id
    having count(distinct e.reporter) >= 2
  )
  select count(*) into v_recent
  from qualified q
  where q.last_at > now() - interval '24 hours';

  if v_recent > 25 then
    return query select null::text, true;
    return;
  end if;

  return query
  select e.video_id, false
  from public.clip_playback_errors e
  join auth.users u on u.id = e.reporter
  where e.video_id = any(p_video_ids)
    and not e.cleared
    and e.error_code in ('video_not_found', 'embed_not_allowed')
    and e.created_at > now() - interval '7 days'
    and not coalesce(u.is_anonymous, false)
  group by e.video_id
  having count(distinct e.reporter) >= 2;
end;
$$;

revoke execute on function public.clip_blocklist(text[]) from public, anon, authenticated;
grant execute on function public.clip_blocklist(text[]) to service_role;


-- ══ 1C ════════════════════════════════════════════════════════════════
-- Sender and recipient are always decided here; client values are ignored.
-- (The 0024 rate limit already counts by auth.uid(); with from_user_id now
-- always auth.uid(), a spoofed sender can no longer escape that count.)
create or replace function public.set_invite_to_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.to_user_id := (
    select id from public.profiles
    where player_name = new.to_player_name::citext
  );
  new.from_user_id := auth.uid();
  return new;
end;
$$;


-- ══ 1D ════════════════════════════════════════════════════════════════
-- Anonymous (guest) sessions are role `authenticated` with a uid. They must
-- never get a profiles row (= "registered" everywhere), a premium grant or
-- a remote-match seat.

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert
with check (
  auth.uid() = id
  and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
);

create or replace function public.reject_anonymous_user_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from auth.users u
    where u.id = new.user_id and coalesce(u.is_anonymous, false)
  ) then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.reject_anonymous_user_row() from public, anon, authenticated;

-- claim_free_month / redeem_voucher insert here; both now refuse anonymous
-- users with the same 'not_registered' token the client already maps.
drop trigger if exists premium_grants_reject_anonymous on public.premium_grants;
create trigger premium_grants_reject_anonymous
  before insert on public.premium_grants
  for each row execute function public.reject_anonymous_user_row();

-- create_remote_match inserts both participants here.
drop trigger if exists remote_match_players_reject_anonymous on public.remote_match_players;
create trigger remote_match_players_reject_anonymous
  before insert on public.remote_match_players
  for each row execute function public.reject_anonymous_user_row();


-- ═════════════════════════════════════════════════════════════════════
-- ROLLBACK (run only the parts you need; each is independent)
-- ═════════════════════════════════════════════════════════════════════
-- -- 1A
-- drop trigger if exists guard_lobby_player_row on public.lobby_players;
-- drop function if exists public.guard_lobby_player_row();
-- -- 1A-claim (0054 body)
-- create or replace function public.claim_carry_over_row(p_room_code text, p_player_id text)
-- returns boolean language sql security definer set search_path = public as $$
--   with updated as (
--     update public.lobby_players set user_id = auth.uid(), has_left = false
--     where room_code = upper(p_room_code) and player_id = p_player_id
--       and user_id is null and auth.uid() is not null
--     returning 1)
--   select exists (select 1 from updated);
-- $$;
-- revoke all on function public.claim_carry_over_row(text, text) from public;
-- grant execute on function public.claim_carry_over_row(text, text) to authenticated;
-- drop function if exists public._lobby_seat_owner(text, text);
-- drop index if exists public.lobby_players_player_id_idx;
-- -- 1B (0056 policy + rate limit); redeploy the previous check-clips too
-- drop policy if exists clip_playback_errors_insert on public.clip_playback_errors;
-- create policy clip_playback_errors_insert on public.clip_playback_errors
--   for insert to anon, authenticated with check (cleared = false);
-- create or replace function public.enforce_clip_error_rate_limit()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   if new.reporter is not null and (
--     select count(*) from public.clip_playback_errors
--     where reporter = new.reporter and created_at > now() - interval '1 hour'
--   ) >= 30 then
--     raise exception 'clip error rate limit' using errcode = 'P0001';
--   end if;
--   return new;
-- end; $$;
-- drop function if exists public.clip_blocklist(text[]);
-- -- 1C (0024 body)
-- create or replace function public.set_invite_to_user_id()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   if new.to_user_id is null then
--     select id into new.to_user_id from public.profiles
--     where player_name = new.to_player_name::citext;
--   end if;
--   if new.from_user_id is null then
--     new.from_user_id := auth.uid();
--   end if;
--   return new;
-- end; $$;
-- -- 1D (0001 policy)
-- drop policy if exists "users can insert own profile" on public.profiles;
-- create policy "users can insert own profile"
-- on public.profiles for insert with check (auth.uid() = id);
-- drop trigger if exists premium_grants_reject_anonymous on public.premium_grants;
-- drop trigger if exists remote_match_players_reject_anonymous on public.remote_match_players;
-- drop function if exists public.reject_anonymous_user_row();
