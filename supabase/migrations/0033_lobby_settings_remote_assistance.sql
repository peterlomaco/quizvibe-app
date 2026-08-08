-- ─────────────────────────────────────────────────────────────────────
-- 0033_lobby_settings_remote_assistance — gemensam hjälpnivå i Remote 1vs1
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Bakgrund: i Remote 1vs1 svarar båda deltagarna på SAMMA frågesekvens var
-- för sig, på egna enheter. Assistance är annars en personlig inställning
-- (full = namn-lista, standard/minimal = prefix-grid + smalare årsintervall),
-- vilket gör en duell där spelarna kör olika nivåer ojämförbar. Host väljer
-- därför EN gemensam nivå i 1vs1-lobbyn; den skrivs till BÅDA
-- `remote_match_players.assistance`-raderna när matchen skapas.
--
-- Denna kolumn är enbart lobby-sidan: den låter non-host se hostens val
-- innan matchen startat. Sanningen under spel är alltid match-snapshotten
-- (remote_match_players), som överlever rummets 24h-expiry.
--
-- ⚠ Kolumnen skrivs av en SEPARAT targeted UPDATE i setLobbySettings, INTE
-- i huvud-upserten (settingsToRow). Skälet: en upsert som nämner en kolumn
-- som inte finns failar HELA settings-skrivningen och bryter all lobby-sync
-- — även i lokala lägen. Med separat UPDATE degraderar en icke-körd
-- migration till en console.warn, och klienten defaultar till 'full'.
-- Samma mönster som lobby_players.seen_question_ids (0026) och
-- lobby_players.account_player_name (0030).
--
-- Legacy: rader skapade före migrationen får default 'full', vilket är
-- exakt produktdefaulten. Ingen backfill behövs.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists remote_assistance text not null default 'full';

alter table public.lobby_settings
  drop constraint if exists lobby_settings_remote_assistance_check;

alter table public.lobby_settings
  add constraint lobby_settings_remote_assistance_check
  check (remote_assistance in ('full', 'standard', 'minimal'));

comment on column public.lobby_settings.remote_assistance is
  'Remote 1vs1: gemensam hjälpnivå som gäller BÅDA spelarna (full|standard|'
  'minimal, default full). Host väljer i 1vs1-lobbyn; värdet kopieras till '
  'båda remote_match_players.assistance vid Start Game. Ignoreras i lokala '
  'spellägen, där assistance är per spelare.';
