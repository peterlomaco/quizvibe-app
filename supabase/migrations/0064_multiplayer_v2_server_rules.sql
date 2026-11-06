-- ─────────────────────────────────────────────────────────────────────
-- 0064_multiplayer_v2_server_rules — Multiplayer v2 Step 3
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD
-- only after the App Store review is approved (Peter 2026-11-05).
-- Requires 0062 (rooms.multiplayer_v2) and 0063 (lobby_players.device_mode).
--
-- EVERYTHING here is a no-op for rooms with multiplayer_v2 = false, so
-- legacy rooms (all PROD rooms, old clients) behave exactly as before.
--
-- 1. rooms.game_config — frozen snapshot written by start_lobby_game.
--    Contains NO user ids (rooms is readable by everyone).
--
-- 2. Trigger enforce_lobby_join_eligibility (lobby_players):
--      • a NEW row after Start is rejected (rejoining an existing row is OK)
--      • self-join beyond rooms.max_players is rejected
--      • with Spotify on, a guest cannot join, and nobody can choose the
--        host's device
--      • choosing the host's device is rejected when the room already
--        holds more than 4 players (1 by 1 cap, decision D-A)
--      • a device choice is locked once set on a live row; leaving and
--        rejoining clears it so a new choice can be made
--    Errors: message 'qv_join_rejected:<reason>' (client maps to Alerts).
--
-- 3. set_lobby_spotify(code, enabled) — host only, atomic. Enabling removes
--    guests and host-device participants in the same transaction and
--    returns their ids. Remaining registered own-device participants must
--    be Spotify-attested (decision D-B) or nothing changes.
--
-- 4. start_lobby_game(...) — host only, atomic. Re-validates the roster and
--    flow under the room lock, sets game_started + game_config, returns the
--    snapshot. Joins/leaves/Spotify racing Start serialize on the room row.
-- ─────────────────────────────────────────────────────────────────────

alter table public.rooms
  add column if not exists game_config jsonb;

comment on column public.rooms.game_config is
  'Multiplayer v2: frozen game configuration written by start_lobby_game.';

-- ── Helpers ───────────────────────────────────────────────────────────

-- A participant is "registered" when its auth user has a profiles row
-- (anon guest sessions never write one). user_id null = host-added guest.
create or replace function public.qv_is_registered_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null
     and exists (select 1 from public.profiles where id = p_user_id);
$$;

-- Effective device of a lobby_players row (mirror of deviceModeFromRow in
-- src/utils/gameFlow.ts): host → own; stored value; host-added guest → host;
-- otherwise own (legacy rows count as own, like the client resolver).
create or replace function public.qv_effective_device(
  p_is_host boolean, p_device_mode text, p_type text, p_user_id uuid
)
returns text
language sql
immutable
as $$
  select case
    when p_is_host then 'own'
    when p_device_mode in ('host', 'own') then p_device_mode
    when p_type = 'guest' and p_user_id is null then 'host'
    else 'own'
  end;
$$;

-- ── 2. Join / device trigger ──────────────────────────────────────────

create or replace function public.enforce_lobby_join_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms%rowtype;
  v_spotify boolean;
  v_active_count int;
begin
  -- INSERT … ON CONFLICT also fires BEFORE INSERT for rows that already
  -- exist; those are updates in practice and must pass untouched.
  if tg_op = 'INSERT' and exists (
    select 1 from public.lobby_players
    where room_code = new.room_code and player_id = new.player_id
  ) then
    return new;
  end if;

  -- Legacy rooms: leave immediately, without taking any lock.
  if not exists (
    select 1 from public.rooms
    where code = new.room_code and coalesce(multiplayer_v2, false)
  ) then
    return new;
  end if;
  -- Shared lock: serializes against start_lobby_game / set_lobby_spotify,
  -- which take FOR UPDATE on the same row.
  select * into v_room from public.rooms where code = new.room_code for share;
  if not found then
    return new;
  end if;

  select coalesce(spotify_enabled, false) into v_spotify
  from public.lobby_settings where room_code = new.room_code;
  v_spotify := coalesce(v_spotify, false);

  if tg_op = 'INSERT' then
    if new.is_host then
      return new;
    end if;
    if v_room.game_started then
      raise exception 'qv_join_rejected:game_started';
    end if;
    -- Capacity applies to self-joins only (host-inserted rows — manual
    -- guests, re-match pre-seeds — are governed by the host's own checks).
    if new.user_id is not null then
      select count(*) into v_active_count
      from public.lobby_players
      where room_code = new.room_code and not has_left;
      if v_active_count + 1 > v_room.max_players then
        raise exception 'qv_join_rejected:room_full';
      end if;
    end if;
    if v_spotify and (
      new.type = 'guest'
      or (new.user_id is not null and not public.qv_is_registered_user(new.user_id))
    ) then
      raise exception 'qv_join_rejected:spotify_guest';
    end if;
    if v_spotify and new.device_mode = 'host' then
      raise exception 'qv_join_rejected:spotify_own_device_required';
    end if;
    return new;
  end if;

  -- UPDATE
  -- Rejoin (left → back): clear the old device choice so a new one can be
  -- made, unless this same statement sets one explicitly.
  if old.has_left and not new.has_left
     and new.device_mode is not distinct from old.device_mode then
    new.device_mode := null;
  end if;

  if new.device_mode is distinct from old.device_mode and new.device_mode is not null then
    if old.device_mode is not null and not old.has_left then
      raise exception 'qv_join_rejected:device_locked';
    end if;
    if v_room.game_started and old.device_mode is not null then
      raise exception 'qv_join_rejected:device_locked';
    end if;
    if new.device_mode = 'host' and not new.is_host then
      if v_spotify then
        raise exception 'qv_join_rejected:spotify_own_device_required';
      end if;
      select count(*) into v_active_count
      from public.lobby_players
      where room_code = new.room_code and not has_left;
      if v_active_count > 4 then
        raise exception 'qv_join_rejected:own_device_required';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_lobby_join_eligibility on public.lobby_players;
create trigger enforce_lobby_join_eligibility
  before insert or update of device_mode, has_left on public.lobby_players
  for each row execute function public.enforce_lobby_join_eligibility();

-- ── 3. set_lobby_spotify ──────────────────────────────────────────────

create or replace function public.set_lobby_spotify(p_room_code text, p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(p_room_code);
  v_room public.rooms%rowtype;
  v_removed jsonb := '[]'::jsonb;
  v_unattested jsonb;
begin
  select * into v_room from public.rooms where code = v_code for update;
  if not found then
    raise exception 'qv_spotify_rejected:room_not_found';
  end if;
  if v_room.host_user_id is distinct from auth.uid() then
    raise exception 'qv_spotify_rejected:not_host';
  end if;
  if not coalesce(v_room.multiplayer_v2, false) then
    raise exception 'qv_spotify_rejected:not_v2';
  end if;
  if v_room.game_started then
    raise exception 'qv_spotify_rejected:game_started';
  end if;

  if p_enabled then
    if not public.qv_is_registered_user(v_room.host_user_id) then
      raise exception 'qv_spotify_rejected:host_ineligible';
    end if;
    -- D-B: only participants who will REMAIN must be attested.
    select coalesce(jsonb_agg(player_id), '[]'::jsonb) into v_unattested
    from public.lobby_players
    where room_code = v_code and not is_host and not has_left
      and public.qv_is_registered_user(user_id)
      and public.qv_effective_device(is_host, device_mode, type, user_id) = 'own'
      and not coalesce(spotify_verified, false);
    if jsonb_array_length(v_unattested) > 0 then
      raise exception 'qv_spotify_rejected:unattested'
        using detail = v_unattested::text;
    end if;

    with removed as (
      delete from public.lobby_players
      where room_code = v_code and not is_host and not has_left
        and (
          not public.qv_is_registered_user(user_id)
          or public.qv_effective_device(is_host, device_mode, type, user_id) = 'host'
        )
      returning player_id
    )
    select coalesce(jsonb_agg(player_id), '[]'::jsonb) into v_removed from removed;
  end if;

  update public.lobby_settings set spotify_enabled = p_enabled where room_code = v_code;
  if not found then
    raise exception 'qv_spotify_rejected:no_settings';
  end if;

  return jsonb_build_object('spotifyEnabled', p_enabled, 'removed', v_removed);
end;
$$;

-- ── 4. start_lobby_game ───────────────────────────────────────────────

create or replace function public.start_lobby_game(
  p_room_code text,
  p_game_mode text,
  p_participant_ids text[],
  p_spotify_enabled boolean,
  p_all_at_once_allowed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(p_room_code);
  v_room public.rooms%rowtype;
  v_found int;
  v_host_device boolean;
  v_all_registered_own boolean;
  v_gate text;
  v_allowed boolean;
  v_participants jsonb;
  v_config jsonb;
begin
  select * into v_room from public.rooms where code = v_code for update;
  if not found then
    raise exception 'qv_start_rejected:room_not_found';
  end if;
  if v_room.host_user_id is distinct from auth.uid() then
    raise exception 'qv_start_rejected:not_host';
  end if;
  if not coalesce(v_room.multiplayer_v2, false) then
    raise exception 'qv_start_rejected:not_v2';
  end if;
  -- Idempotent: a retried Start returns the snapshot already frozen.
  if v_room.game_started and v_room.game_config is not null then
    return v_room.game_config;
  end if;
  if p_game_mode not in ('pass-the-phone', 'individual-devices') then
    raise exception 'qv_start_rejected:bad_mode';
  end if;
  if coalesce(cardinality(p_participant_ids), 0) = 0 then
    raise exception 'qv_start_rejected:roster_changed';
  end if;

  -- Every requested participant must still be present and approved.
  select count(*) into v_found
  from public.lobby_players
  where room_code = v_code
    and player_id = any(p_participant_ids)
    and not has_left
    and (approved or is_host);
  if v_found <> cardinality(p_participant_ids) then
    raise exception 'qv_start_rejected:roster_changed';
  end if;

  select
    bool_or(not is_host and public.qv_effective_device(is_host, device_mode, type, user_id) = 'host'),
    bool_and(public.qv_is_registered_user(user_id)
             and public.qv_effective_device(is_host, device_mode, type, user_id) = 'own')
  into v_host_device, v_all_registered_own
  from public.lobby_players
  where room_code = v_code and player_id = any(p_participant_ids);

  if p_game_mode = 'individual-devices' and v_host_device then
    raise exception 'qv_start_rejected:host_device_requires_one_by_one';
  end if;
  if p_game_mode = 'pass-the-phone' and cardinality(p_participant_ids) > 4 then
    raise exception 'qv_start_rejected:too_many_for_one_by_one';
  end if;

  select value->>'allAtOnce' into v_gate from public.app_config where key = 'feature_gates';
  v_allowed := coalesce(v_gate, 'everyone') = 'everyone' or coalesce(p_all_at_once_allowed, false);
  if p_game_mode = 'individual-devices' and not v_allowed then
    raise exception 'qv_start_rejected:all_at_once_not_entitled';
  end if;

  if p_spotify_enabled and (p_game_mode <> 'individual-devices' or not v_all_registered_own) then
    raise exception 'qv_start_rejected:spotify_conflict';
  end if;

  select jsonb_agg(
           jsonb_build_object(
             'playerId', lp.player_id,
             'isHost', lp.is_host,
             'deviceMode', public.qv_effective_device(lp.is_host, lp.device_mode, lp.type, lp.user_id),
             'registered', public.qv_is_registered_user(lp.user_id)
           )
           order by ord.n
         )
  into v_participants
  from unnest(p_participant_ids) with ordinality as ord(pid, n)
  join public.lobby_players lp on lp.room_code = v_code and lp.player_id = ord.pid;

  v_config := jsonb_build_object(
    'version', 1,
    'gameMode', p_game_mode,
    'override', p_game_mode = 'pass-the-phone' and not coalesce(v_host_device, false),
    'spotifyEnabled', p_spotify_enabled,
    'allAtOnceAllowed', v_allowed,
    'participants', v_participants,
    'startedAt', now()
  );

  update public.rooms
     set game_started = true, game_config = v_config
   where code = v_code;

  return v_config;
end;
$$;

-- Callable only by signed-in sessions (anon guest-host sessions use the
-- `authenticated` role too). Internal helpers stay off the public API.
revoke execute on function public.set_lobby_spotify(text, boolean) from public, anon;
revoke execute on function public.start_lobby_game(text, text, text[], boolean, boolean) from public, anon;
grant execute on function public.set_lobby_spotify(text, boolean) to authenticated;
grant execute on function public.start_lobby_game(text, text, text[], boolean, boolean) to authenticated;
revoke execute on function public.qv_is_registered_user(uuid) from public, anon, authenticated;
revoke execute on function public.enforce_lobby_join_eligibility() from public, anon, authenticated;
