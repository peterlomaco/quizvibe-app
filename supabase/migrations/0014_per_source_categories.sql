-- Migration 0014: per-source profession-category arrays
--
-- Ersätter youtube_enabled (bool) + images_enabled (bool) + enabled_main_categories (text[])
-- med youtube_enabled_categories (text[]) + images_enabled_categories (text[]).
--
-- Befintliga kolumner bevaras tills TypeScript-koden uppdateras och TS-skrivningar
-- aktiveras. Kan droppas i en framtida migration när övergången är klar.
--
-- Appliceras manuellt via Supabase SQL editor.

ALTER TABLE lobby_settings
  ADD COLUMN IF NOT EXISTS youtube_enabled_categories text[]
    DEFAULT ARRAY['Music','Film','Sport']::text[],
  ADD COLUMN IF NOT EXISTS images_enabled_categories text[]
    DEFAULT ARRAY['Music','Film','Sport']::text[];

-- profiles-tabellen (host-defaults):
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS youtube_enabled_categories text[]
    DEFAULT ARRAY['Music','Film','Sport']::text[],
  ADD COLUMN IF NOT EXISTS images_enabled_categories text[]
    DEFAULT ARRAY['Music','Film','Sport']::text[];

-- Gamla kolumner kan droppas EFTER att TypeScript-koden skriver till nya kolumner
-- och migration-period är avslutad:
-- ALTER TABLE lobby_settings DROP COLUMN IF EXISTS youtube_enabled;
-- ALTER TABLE lobby_settings DROP COLUMN IF EXISTS images_enabled;
-- ALTER TABLE lobby_settings DROP COLUMN IF EXISTS enabled_main_categories;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS enabled_main_categories;
