-- ─────────────────────────────────────────────────────────────────────
-- 0019_lobby_settings_max_players — lägg till max_players i lobby_settings
--
-- maxPlayers (4 | 12) lagrades tidigare bara i mockActiveRooms (in-memory),
-- vilket innebar att non-host på en annan enhet aldrig fick rätt värde.
-- Genom att lägga det i lobby_settings synkas det via Supabase precis som
-- gameMode, roundsCount m.fl.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_settings
  add column if not exists max_players int not null default 4
    check (max_players in (4, 12));
