-- ─────────────────────────────────────────────────────────────────────
-- 0067_multiplayer_v2_join_device — Multiplayer v2 Step 6
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD
-- only after the App Store review is approved. Requires 0064 + 0065.
--
-- Step 6 writes the joiner's device choice IN the initial join write
-- (upsertOwnLobbyPlayer), not in a follow-up UPDATE. So the trigger must
-- validate the device on that write:
--
--   INSERT  (fresh join): a host-device joiner forces 1 by 1, so it fits only
--           while the lobby stays within 4 players (decision D-A). When even
--           an own-device join wouldn't fit, room_full wins.
--   UPDATE  rejoin (has_left true → false): the written device IS the new
--           choice — it is no longer nulled (0064 nulled an unchanged value
--           so a follow-up publish could set it). The rejoin also re-runs the
--           capacity + Spotify checks a fresh join gets.
--
-- Unchanged: device change on a live row → device_locked; host bulk writes
-- (user_id null) are skipped, never fail the batch; legacy rooms
-- (multiplayer_v2 = false) are untouched. Replaces the function body only.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────

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
    -- Step 6: host-device self-join → 1 by 1 cap (room_full already handled).
    if new.user_id is not null and new.device_mode = 'host'
       and v_active_count + 1 > 4 then
      raise exception 'qv_join_rejected:own_device_required';
    end if;
    return new;
  end if;

  -- UPDATE ──────────────────────────────────────────────────────────────
  if old.has_left and not new.has_left then
    -- Explicit rejoin: the device carried by the write is the new choice.
    -- (game_started is deliberately not checked here — same as 0064/0065:
    -- a frozen participant's own row may be re-claimed.)
    select count(*) into v_active_count
    from public.lobby_players
    where room_code = new.room_code and not has_left and player_id <> new.player_id;
    if v_active_count + 1 > v_room.max_players then
      raise exception 'qv_join_rejected:room_full';
    end if;
    if v_spotify and not new.is_host and (
      new.type = 'guest'
      or (new.user_id is not null and not public.qv_is_registered_user(new.user_id))
    ) then
      raise exception 'qv_join_rejected:spotify_guest';
    end if;
    if not new.is_host and new.device_mode = 'host' then
      if v_spotify then
        raise exception 'qv_join_rejected:spotify_own_device_required';
      end if;
      if v_active_count + 1 > 4 then
        raise exception 'qv_join_rejected:own_device_required';
      end if;
    end if;
    return new;
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

-- ── Verification (run manually, staging) ──────────────────────────────
-- select prosrc like '%Step 6: host-device self-join%' as has_step6
-- from pg_proc where proname = 'enforce_lobby_join_eligibility';
