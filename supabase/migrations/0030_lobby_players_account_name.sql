-- ─────────────────────────────────────────────────────────────────────
-- 0030_lobby_players_account_name — Guest alias på lobby-spelarkortet
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-08): samma "Guest alias"-koppling som
-- 1vs1-historiken fick i 0029 ska synas redan i LOBBYN. En registrerad
-- user som spelar som Guest visas då som:
--
--     GuestA-1234567
--     QuizVibe: Anna-42
--
-- så host (och övriga) ser vilket konto som faktiskt sitter bakom
-- guest-namnet innan spelet startar.
--
-- Varför en kolumn och inte en uppslagning: `profiles` har own-row-only
-- SELECT-RLS (0001) — en klient kan ALDRIG läsa en annan spelares
-- player_name. Varje spelare publicerar därför sitt EGET kontonamn på
-- sin egen lobby_players-rad; RLS på egen rad räcker.
--
-- ⚠ Kolumnen ingår MEDVETET INTE i playerToRow / setLobbyPlayers-
-- payloaden — exakt samma mönster som `seen_question_ids` (0026) och
-- `has_left`:
--   • Host:s bulk-UPSERT äger inte kolumnen och får inte clobba den med
--     null för spelare vars kontonamn host omöjligt kan känna till.
--   • Skrivs enbart via targeted UPDATE (publishOwnAccountName), scoped
--     på room_code + player_id + user_id.
--   • En icke-applicerad migration ger då bara ett console.warn i stället
--     för att bryta hela lobby-join:en.
--
-- Ren guest (anon-session) har inget konto → kolumnen förblir null och
-- inget alias renderas.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_players
  add column if not exists account_player_name text;

comment on column public.lobby_players.account_player_name is
  'QuizVibe-kontots player_name när spelaren deltar under ett Guest alias. '
  'Publiceras av spelaren själv (targeted UPDATE på egen rad) — ingår ALDRIG '
  'i host:s bulk-UPSERT. NULL = spelaren använder sitt kontonamn, eller '
  'saknar konto (anon-session).';
