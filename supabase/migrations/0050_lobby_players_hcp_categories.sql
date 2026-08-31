-- ─────────────────────────────────────────────────────────────────────
-- 0050_lobby_players_hcp_categories — Per-kategori Player-HCP på lobbykortet
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-31): en spelare har numera FYRA HCP — Total
-- (= snittet av de tre) samt Music, Film, Sport (§1.3). Total ligger redan
-- i lobby_players.hcp (migration 0042). Denna migration lägger till de tre
-- kategori-kolumnerna så spelarkortets + leaderboardens "+"-utfällning kan
-- visa VARJE spelares per-kategori-HCP, inte bara den egna enhetens.
--
-- ⚠ Kolumnerna ingår MEDVETET INTE i playerToRow / setLobbyPlayers-payloaden
-- — exakt samma mönster som `hcp` (0042), `account_player_name` (0030),
-- `seen_question_ids` (0026) och `has_left`:
--   • Host:s bulk-UPSERT äger inte kolumnerna och får inte clobba dem med
--     null för spelare vars HCP host omöjligt kan känna till.
--   • Skrivs enbart via targeted UPDATE (publishOwnHcp), scoped på
--     room_code + player_id + user_id.
--   • En icke-applicerad migration ger bara ett console.warn (publishOwnHcp
--     retryar då med enbart `hcp`) i stället för att bryta lobby-join:en —
--     kategori-sköldarna faller tillbaka på 99.
--
-- Värdena är AVRUNDADE display-heltal (1–99, ceil per §1.2.3), som `hcp`.
-- NULL = spelaren har inget intjänat kategori-HCP ännu (skölden visar 99)
-- eller saknar konto (gäst).
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_players
  add column if not exists hcp_music smallint,
  add column if not exists hcp_film  smallint,
  add column if not exists hcp_sport smallint;

comment on column public.lobby_players.hcp_music is
  'Spelarens intjänade Music-HCP (1–99, display-heltal). Publiceras av '
  'spelaren själv (targeted UPDATE, publishOwnHcp) — ingår ALDRIG i host:s '
  'bulk-UPSERT. NULL = ännu ej progressad (skölden visar 99) / gäst.';
comment on column public.lobby_players.hcp_film is
  'Spelarens intjänade Film-HCP (1–99, display-heltal). Se hcp_music.';
comment on column public.lobby_players.hcp_sport is
  'Spelarens intjänade Sport-HCP (1–99, display-heltal). Se hcp_music.';
