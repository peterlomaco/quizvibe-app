-- ─────────────────────────────────────────────────────────────────────
-- 0023_player_name_check_constraints — Security review-fix (Nivå 1, punkt 2)
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Problem: `profiles.player_name` (citext) och `lobby_players.name` (text)
-- har ingen CHECK-constraint. All namnvalidering (format + längd) sker
-- klient-side (PLAYER_NAME_FORMAT_RE i src/utils/playerName.ts). En moddad
-- klient eller direkt API-anrop kan skriva godtyckliga strängar — emoji,
-- 10k tecken, RTL-override-tecken, HTML/script-taggar — rakt in i tabellen.
--
-- Fix: spegla klient-regexen som en DB-CHECK. Regexen bundar även längden
-- (max 1+9 letters + '-' + 7 digits = 18 tecken) så ingen separat
-- längd-guard behövs.
--
-- Format (identiskt med PLAYER_NAME_FORMAT_RE):
--   ^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$
--   → 1 versal + 0–9 bokstäver, valfritt '-' + 1–7 siffror.
--   Tillåter internt versaler ("GuestA") så auto-genererade guest-namn
--   (t.ex. "GuestA-1234567") validerar.
--
-- NOT VALID: constrainten enforced på alla nya INSERT/UPDATE men skannar
-- INTE befintliga rader vid skapande — så migrationen kan aldrig faila på
-- gammal data. Kör `alter table ... validate constraint ...` senare om/när
-- du vill retroaktivt verifiera existerande rader (kolla först att inga
-- bryter mönstret).
--
-- OBS citext: (player_name)::text ger det lagrade värdet med bevarad
-- versalisering (citext lagrar originalcase men jämför case-insensitivt).
-- Casten krävs så `~` blir case-sensitiv och "första versal"-regeln gäller.
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles
  add constraint profiles_player_name_format
  check ((player_name)::text ~ '^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$')
  not valid;

alter table public.lobby_players
  add constraint lobby_players_name_format
  check (name ~ '^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$')
  not valid;
