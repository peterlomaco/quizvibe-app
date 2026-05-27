-- ─────────────────────────────────────────────────────────────────────
-- 0012_main_categories — Main-kategori-filter per profil + per lobby
--
-- Lägger till `enabled_main_categories text[]` på BÅDA profiles (host-default)
-- och lobby_settings (per-spel). Filtrerar quiz-poolen i klienten via
-- backend-subject → MainCategory-mappning (Music/Film/Sport).
--
-- Defaults = alla 3 ({Music,Film,Sport}) så befintliga rader (skapade innan
-- migrationen) ser inget beteendebyte. UI:t enforce:ar min 1 så listan
-- aldrig blir tom — men en defensiv default på DB-nivå skyddar mot edge
-- cases där en klient skulle skriva [] av misstag.
--
-- VIKTIGT: applicera manuellt via Supabase SQL editor (vi använder inte
-- CLI-migrationer idag). Se memory/project_supabase_migrations.md.
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists enabled_main_categories text[]
    not null default array['Music','Film','Sport']::text[];

alter table public.lobby_settings
  add column if not exists enabled_main_categories text[]
    not null default array['Music','Film','Sport']::text[];
