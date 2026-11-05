-- ─────────────────────────────────────────────────────────────────────
-- 0063_lobby_players_device_mode — Multiplayer v2 Step 2
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD
-- only after the App Store review is approved (Peter 2026-11-05).
--
-- Each participant's device choice, locked at join:
--   'own'  = plays on their own phone
--   'host' = plays on the host's phone
--   null   = legacy row / room without Multiplayer v2
--
-- Write discipline (same as account_player_name 0030 / hcp 0042):
--   • written ONLY by the participant's own targeted UPDATE
--     (publishOwnDeviceMode) — never part of the host's bulk UPSERT, so the
--     host cannot overwrite a locked choice;
--   • host-added guests are never written here: the client derives 'host'
--     from type='guest' + user_id null, and the host is always 'own'.
--
-- Nullable with no default on purpose: old clients never write it and a
-- missing column only produces a console.warn on the client.
-- Server-side locking (rejecting a change on a live row) comes in Step 3.
-- get_lobby_roster (0054) returns `setof lobby_players` via select *, so the
-- new column is included automatically.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_players
  add column if not exists device_mode text;

alter table public.lobby_players
  drop constraint if exists lobby_players_device_mode_check;
alter table public.lobby_players
  add constraint lobby_players_device_mode_check
  check (device_mode is null or device_mode in ('host', 'own'));

comment on column public.lobby_players.device_mode is
  'Multiplayer v2: participant device choice (own | host), locked at join. '
  'Written only by the participant''s own row update.';
