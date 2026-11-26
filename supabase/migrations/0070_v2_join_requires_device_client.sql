-- ─────────────────────────────────────────────────────────────────────────
-- 0070_v2_join_requires_device_client — keep pre-v2 clients out of v2 rooms
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD only
-- with Peter's explicit go (Build 41 cutover). Requires 0062 + 0063 + 0067.
--
-- Why: Build 40 (and anything before Multiplayer v2 Step 6) never sends
-- lobby_players.device_mode. Build 41 always sends it for a non-host's own
-- join into a multiplayer_v2 room (upsertOwnLobbyPlayer + device step /
-- resolveJoinDeviceMode default 'own'). A Build 40 player who types the code
-- of a Build 41 v2 room would otherwise land in a lobby whose game flow it
-- cannot follow.
--
-- Rule (BEFORE INSERT / rejoin UPDATE on lobby_players), only when ALL hold:
--   • the room is multiplayer_v2,
--   • the row is the caller's OWN non-host row (user_id = auth.uid()),
--   • it is a join: a fresh INSERT, or a rejoin (has_left true → false),
--   • device_mode is null after the earlier triggers ran
-- → raise 'qv_join_rejected:update_required'.
--
-- Not affected:
--   • legacy rooms (multiplayer_v2 = false) — Build 40 ↔ Build 40/41 as today,
--   • host rows and host bulk writes (is_host, or user_id null / not the caller),
--   • Build 41 carry-over claims (claim_carry_over_row: user_id + has_left on
--     a pre-seeded live row — no has_left transition), followed by the Build 41
--     upsert that carries device_mode,
--   • later own-row writes (HCP/alias/Spotify publish, Leave).
--
-- Build 40 UX: its upsertOwnLobbyPlayer only console.warns on error, so the
-- joiner stays on its own lobby screen without appearing for the host and can
-- Leave. No data is written. Build 40 devices that received the forced-update
-- OTA are blocked earlier by app_config.min_supported_build.
--
-- Trigger name sorts AFTER enforce_lobby_join_eligibility (0064/0067), so it
-- sees the final device_mode. Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.enforce_v2_join_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_host or new.user_id is null or new.user_id is distinct from auth.uid() then
    return new;
  end if;
  if new.device_mode is not null then
    return new;
  end if;
  if tg_op = 'INSERT' then
    -- INSERT … ON CONFLICT also fires BEFORE INSERT for an existing row; the
    -- UPDATE half is judged by the UPDATE branch instead.
    if exists (
      select 1 from public.lobby_players
      where room_code = new.room_code and player_id = new.player_id
    ) then
      return new;
    end if;
  elsif not (old.has_left and not new.has_left) then
    return new;
  end if;
  if exists (
    select 1 from public.rooms
    where code = new.room_code and coalesce(multiplayer_v2, false)
  ) then
    raise exception 'qv_join_rejected:update_required';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_v2_join_client on public.lobby_players;
create trigger enforce_v2_join_client
before insert or update of has_left on public.lobby_players
for each row execute function public.enforce_v2_join_client();

-- ── Rollback (manual, reviewed) ─────────────────────────────────────────
-- drop trigger if exists enforce_v2_join_client on public.lobby_players;
-- drop function if exists public.enforce_v2_join_client();

-- ── Verification (run manually) ─────────────────────────────────────────
-- select tgname from pg_trigger
-- where tgrelid = 'public.lobby_players'::regclass and not tgisinternal
-- order by tgname;   -- enforce_v2_join_client listed after enforce_lobby_join_eligibility
