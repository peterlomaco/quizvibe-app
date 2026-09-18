-- ─────────────────────────────────────────────────────────────────────
-- 0055_lobby_settings_package_toggles — synka paket-läges aggregat-toggles
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Bakgrund: när ett Host-paket är valt kollapsar Source Mixerboard till TVÅ
-- aggregat-toggles — YouTube + Hints — plus Spotify. Host:s val av dessa två
-- måste speglas till non-host-enheterna i lobbyn. Tidigare skrevs de aldrig
-- (settingsToRow utelämnade dem, ingen kolumn fanns), så rowToSettings
-- fabricerade alltid `true` och non-host visade YouTube som PÅ även när host
-- stängt av den och kört t.ex. enbart Spotify.
--
-- ⚠ Kolumnerna skrivs av en SEPARAT targeted UPDATE i setLobbySettings, INTE
-- i huvud-upserten (settingsToRow). Skälet: en upsert som nämner en kolumn
-- som inte finns failar HELA settings-skrivningen och bryter all lobby-sync
-- — även i lokala lägen. Med separat UPDATE degraderar en icke-körd migration
-- till en console.warn, och klienten defaultar via rowToSettings till `true`.
-- Samma mönster som lobby_settings.remote_assistance (0033) och
-- lobby_players.seen_question_ids (0026).
--
-- Legacy: rader skapade före migrationen får default `true` = produktdefaulten
-- (båda källorna på). Ingen backfill behövs.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists package_youtube_enabled boolean not null default true;

alter table public.lobby_settings
  add column if not exists package_hints_enabled boolean not null default true;

comment on column public.lobby_settings.package_youtube_enabled is
  'Paket-läge: host:s aggregat-toggle för YouTube-källan när ett Host-paket '
  'är valt (default true = paketets YT-material spelas). Skrivs via separat '
  'targeted UPDATE, inte settingsToRow. Ignoreras när inget paket är aktivt.';

comment on column public.lobby_settings.package_hints_enabled is
  'Paket-läge: host:s aggregat-toggle för Hints-källan när ett Host-paket är '
  'valt (default true). Skrivs via separat targeted UPDATE, inte settingsToRow. '
  'Ignoreras när inget paket är aktivt.';
