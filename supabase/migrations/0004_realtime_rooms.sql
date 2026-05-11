-- ─────────────────────────────────────────────────────────────────────
-- 0004_realtime_rooms — Fas 3 Slice C-i
-- Aktivera Realtime-broadcasts på rooms-tabellen så non-host:s
-- LobbyScreen-subscription kan detektera när host sätter game_started=true
-- och navigera approved spelare till /quiz (Individual Devices) eller
-- visa Pass-the-Phone-popup.
-- ─────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.rooms;
