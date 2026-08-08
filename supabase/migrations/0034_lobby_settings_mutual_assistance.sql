-- ─────────────────────────────────────────────────────────────────────
-- 0034_lobby_settings_mutual_assistance — på/av-switch för gemensam nivå
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Följer på 0033, som införde `remote_assistance` (vilken nivå båda spelarna
-- kör i en Remote 1vs1-match). Den nivån är nu OPT-IN: host slår på
-- "Mutual assistance level" i 1vs1-lobbyn och väljer först då Full/Standard/
-- Minimal. Är switchen AV kör varje spelare sin egen personliga nivå — samma
-- modell som i lokala spellägen, och det är DEFAULT när lobbyn skapas.
--
-- Separat kolumn i stället för ett fjärde värde ('off') i remote_assistance:
-- "är nivån delad?" och "vilken nivå?" är olika frågor, och med två kolumner
-- behåller UI:t hostens valda nivå när switchen slås av och på igen.
--
-- ⚠ Skrivs av samma SEPARATA targeted UPDATE i setLobbySettings som
-- remote_assistance — INTE i huvud-upserten (settingsToRow). En upsert som
-- nämner en kolumn som inte finns failar HELA settings-skrivningen och bryter
-- all lobby-sync, även i lokala lägen. Med separat UPDATE degraderar en
-- icke-körd migration till en console.warn och klienten defaultar till false.
--
-- Legacy: rader skapade före migrationen får default false = switchen av,
-- vilket är exakt produktdefaulten. Ingen backfill behövs.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists remote_assistance_enabled boolean not null default false;

comment on column public.lobby_settings.remote_assistance_enabled is
  'Remote 1vs1: true när host slagit på "Mutual assistance level" och båda '
  'spelarna därmed låses till lobby_settings.remote_assistance. False '
  '(default) = varje spelare kör sin egen personliga assistance, precis som '
  'i lokala spellägen. Ignoreras utanför remote-1v1-lobbies.';
