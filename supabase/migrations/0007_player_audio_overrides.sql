-- ─────────────────────────────────────────────────────────────────────
-- 0007_player_audio_overrides — Fas 3 Slice D-iv
-- Host-styrt per-spelare audio i Individual Devices: host bestämmer
-- vilka spelares enheter som spelar ljud under quiz-rundan, default
-- ON för host själv och OFF för alla andra. Skrivs cross-device via
-- lobby_settings + Realtime broadcast (player_audio_state_changed-
-- event) så non-host:s MediaPlayer mute:as synkat.
--
-- Schema: jsonb-map { [player_id]: boolean }, default tom map.
-- Saknad key tolkas client-side enligt default-policyn (host=on,
-- övriga=off) så vi slipper seed:a vid game start. Host:s första
-- toggle-ändring upsert:ar map:en med relevanta keys.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists player_audio_overrides jsonb not null default '{}'::jsonb;
