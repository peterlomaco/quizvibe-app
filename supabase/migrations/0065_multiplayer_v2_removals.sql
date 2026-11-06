-- ─────────────────────────────────────────────────────────────────────
-- 0065_multiplayer_v2_removals — Multiplayer v2 Step 3 corrections
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD
-- only after the App Store review is approved. Requires 0064.
--
-- C2: players removed when Spotify is enabled are remembered per room
--     (lobby_removed_players), so the same player_id cannot reappear via the
--     host's bulk write or the removed device's own writes. An eligible user
--     can still rejoin explicitly: the normal join flow mints a NEW
--     player_id, which goes through every eligibility check.
-- C3: a row the host writes on someone else's behalf (user_id null — manual
--     guest, re-match pre-seed, bulk sync) never fails the whole bulk write;
--     an ineligible row is skipped (BEFORE trigger returns NULL) instead.
--
-- Replaces the 0064 function bodies only (create or replace); the trigger
-- itself keeps pointing at enforce_lobby_join_eligibility. Legacy rooms
-- (multiplayer_v2 = false) remain untouched. Idempotent.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.lobby_removed_players (
  room_code  text not null references public.rooms(code) on delete cascade,
  player_id  text not null,
  removed_at timestamptz not null default now(),
  primary key (room_code, player_id)
);
alter table public.lobby_removed_players enable row level security;
revoke all on public.lobby_removed_players from anon, authenticated;

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
  v_host_write boolean;
begin
  if tg_op = 'INSERT' and exists (
    select 1 from public.lobby_players
    where room_code = new.room_code and player_id = new.player_id
  ) then
    return new;
  end if;

  if not exists (
    select 1 from public.rooms
    where code = new.room_code and coalesce(multiplayer_v2, false)
  ) then
    return new;
  end if;
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
    -- Row written by the host on someone else's behalf (manual guest,
    -- re-match pre-seed, bulk sync). If ineligible: skip just this row.
    v_host_write := auth.uid() is not distinct from v_room.host_user_id
                    and new.user_id is null;

    if exists (
      select 1 from public.lobby_removed_players
      where room_code = new.room_code and player_id = new.player_id
    ) then
      if v_host_write then return null; end if;
      raise exception 'qv_join_rejected:removed';
    end if;
    if v_room.game_started then
      if v_host_write then return null; end if;
      raise exception 'qv_join_rejected:game_started';
    end if;
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
      if v_host_write then return null; end if;
      raise exception 'qv_join_rejected:spotify_guest';
    end if;
    if v_spotify and new.device_mode = 'host' then
      if v_host_write then return null; end if;
      raise exception 'qv_join_rejected:spotify_own_device_required';
    end if;
    return new;
  end if;

  -- UPDATE (unchanged from 0064)
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
      returning room_code, player_id
    ), tombstoned as (
      insert into public.lobby_removed_players (room_code, player_id)
      select room_code, player_id from removed
      on conflict do nothing
      returning 1
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

revoke execute on function public.set_lobby_spotify(text, boolean) from public, anon;
grant execute on function public.set_lobby_spotify(text, boolean) to authenticated;
revoke execute on function public.enforce_lobby_join_eligibility() from public, anon, authenticated;
