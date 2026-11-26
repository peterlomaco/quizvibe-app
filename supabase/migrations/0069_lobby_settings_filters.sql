-- ─────────────────────────────────────────────────────────────────────
-- 0069_lobby_settings_filters — synka lobbyns Filter-switchar till non-hosts
-- Applied via Supabase SQL Editor (manuell körning). STAGING först; PROD
-- först efter Apple-godkännandet (production freeze).
--
-- Bakgrund (Peter 2026-11-26): Parent Control flyttades in i en "Filter"-grupp
-- ("Include mature content" + "Include theme-specific questions"). Tidigare
-- fanns ingen kolumn för Parent Control — rowToSettings fabricerade ett
-- default, så non-host-enheter visade aldrig host:ens faktiska val.
--
-- parent_control_enabled  = true → mature content EXKLUDERAS (UI-switchen
--                           "Include mature content" visar det inverterade värdet).
-- include_theme_questions = true → tema-specifika frågor (inBaseCatalog: false)
--                           ingår även i Generic-spel.
--
-- ⚠ Skrivs av en SEPARAT targeted UPDATE i setLobbySettings, INTE i
-- huvud-upserten (settingsToRow) — samma mönster som 0055. En icke-körd
-- migration degraderar då till en console.warn i stället för att bryta all
-- lobby-sync. Nullable utan default: null = "okänt" → klientens fallback
-- (mature ingår, tema-frågor exkluderas). Befintliga RLS/grants täcker nya
-- kolumner; ingen backfill behövs.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists parent_control_enabled boolean;

alter table public.lobby_settings
  add column if not exists include_theme_questions boolean;

comment on column public.lobby_settings.parent_control_enabled is
  'Filter: true = mature content excluded (UI "Include mature content" OFF). '
  'Written via separate targeted UPDATE, not settingsToRow.';

comment on column public.lobby_settings.include_theme_questions is
  'Filter: true = theme-only items (inBaseCatalog false) also join Generic '
  'games. Written via separate targeted UPDATE, not settingsToRow.';
