-- ─────────────────────────────────────────────────────────────────────
-- 0062_multiplayer_v2_gates — Multiplayer v2 Step 1
-- Applied via Supabase SQL Editor (manuell körning) on BOTH projects.
--
-- 1. rooms.multiplayer_v2 — captured ATOMICALLY at room creation
--    (registerActiveRoom), same reasoning as is_remote_1v1 (0031): gates
--    must not depend on the host's 300 ms-debounced lobby_settings write.
--    A room created while the flag was off keeps the old model for its
--    whole life, so flipping the flag never changes a live lobby.
--    Default false + NOT NULL: existing rows and old clients = old model.
--
-- 2. app_config.feature_gates — remote-config row read by
--    src/utils/featureGates.ts (same table/pattern as free_premium_promo,
--    0035). Inserted with PROD-safe values; `on conflict do nothing` so a
--    re-run never overwrites a value changed in the dashboard.
--
--      multiplayerV2 : false in PROD until the hybrid 1 by 1 flow ships.
--      allAtOnce     : 'everyone' at launch (Guest Hosts included).
--                      Later 'premium' — SQL only, no client change.
--
-- The client tolerates this migration NOT being applied: registerActiveRoom
-- retries without the column, and featureGates falls back to defaults.
-- ─────────────────────────────────────────────────────────────────────

alter table public.rooms
  add column if not exists multiplayer_v2 boolean not null default false;

comment on column public.rooms.multiplayer_v2 is
  'Multiplayer v2 (1 by 1 / All at Once) active for this room. Captured at '
  'creation from app_config.feature_gates.multiplayerV2.';

insert into public.app_config (key, value)
values ('feature_gates', '{"multiplayerV2": false, "allAtOnce": "everyone"}'::jsonb)
on conflict (key) do nothing;

-- ── STAGING ONLY (quizvibe-staging / tottbiuikbdarsjlpxwn) ───────────
-- Run separately, after the statements above, to enable the model for
-- internal testing. NEVER run on PROD (pyndqehlebtxochwpwex) before Step 8.
--
--   update public.app_config
--      set value = jsonb_set(value, '{multiplayerV2}', 'true'::jsonb),
--          updated_at = now()
--    where key = 'feature_gates';
--
-- ── Later: make All at Once Premium-only (no app release needed) ─────
--
--   update public.app_config
--      set value = jsonb_set(value, '{allAtOnce}', '"premium"'::jsonb),
--          updated_at = now()
--    where key = 'feature_gates';
