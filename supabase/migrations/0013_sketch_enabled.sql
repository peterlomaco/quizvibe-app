-- ─────────────────────────────────────────────────────────────────────
-- 0013_sketch_enabled — "Sketch" (doodle) som under-toggle i Game Connections
--
-- "Images"-källan döptes om till "Profiles" i Lobby:n med TVÅ under-toggles:
--   • Images = foto-biblioteket (riktiga bilder + mosaik-reveal)
--   • Sketch = AI-doodlen (text-till-bild, "Guess Who")
-- Host kan ha båda, ena eller ingen aktiverad. Denna kolumn lagrar host:s
-- Sketch-val per lobby så non-host:s vy kan spegla det cross-device.
--
-- Default false: doodlen är ännu inte wirad till quiz-poolen (prototyp), så
-- nya lobbys startar med Sketch AV. Befintliga rader får false.
--
-- EFTER att denna körts: avkommentera `sketch_enabled: s.sketchEnabled` i
-- settingsToRow() i src/utils/mockLobbySettings.ts för att aktivera write-sync.
-- (Tills dess läses kolumnen tolerant `?? false` men skrivs inte, så att en
-- upsert mot en okänd kolumn inte bryter HELA lobby-settings-synken.)
--
-- VIKTIGT: applicera manuellt via Supabase SQL editor (vi använder inte
-- CLI-migrationer idag). Se memory/project_supabase_migrations.md.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists sketch_enabled boolean not null default false;
