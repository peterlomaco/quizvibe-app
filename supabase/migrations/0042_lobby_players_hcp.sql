-- ─────────────────────────────────────────────────────────────────────
-- 0042_lobby_players_hcp — Intjänat Player-HCP på lobby-spelarkortet
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-28): HCP-skölden på spelarkortet i lobbyn ska
-- visa VARJE spelares intjänade HCP redan innan spelet startar — inte bara
-- den egna enhetens spelare. En spelares intjänade HCP lever device-lokalt
-- (profile.hcp, AsyncStorage) på deras egen telefon, så det måste publiceras
-- till lobbyn för att övriga ska se det.
--
-- Varför en kolumn och inte en uppslagning: `profiles.hcp` finns inte ens
-- som DB-kolumn (AsyncStorage-only, se profileStorage.ts), och `profiles`
-- har own-row-only SELECT-RLS. Varje spelare publicerar därför sitt EGET
-- HCP på sin egen lobby_players-rad; RLS på egen rad räcker.
--
-- ⚠ Kolumnen ingår MEDVETET INTE i playerToRow / setLobbyPlayers-payloaden
-- — exakt samma mönster som `account_player_name` (0030), `seen_question_ids`
-- (0026) och `has_left`:
--   • Host:s bulk-UPSERT äger inte kolumnen och får inte clobba den med null
--     för spelare vars HCP host omöjligt kan känna till.
--   • Skrivs enbart via targeted UPDATE (publishOwnHcp), scoped på
--     room_code + player_id + user_id.
--   • En icke-applicerad migration ger då bara ett console.warn i stället
--     för att bryta hela lobby-join:en (skölden faller tillbaka på 99).
--
-- Värdet är det AVRUNDADE display-heltalet (1–99, ceil per §1.2.3), inte
-- det interna flyttalet — det är allt mottagaren behöver och undviker
-- numeric-precisions-strul. Gäster + ännu ej progressade spelare (utan
-- profile.hcp) publicerar inget → kolumnen förblir null → skölden visar 99
-- (korrekt: en ännu ej progressad spelare ÄR 99).
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_players
  add column if not exists hcp smallint;

comment on column public.lobby_players.hcp is
  'Spelarens intjänade display-HCP (1–99, avrundat uppåt). Publiceras av '
  'spelaren själv (targeted UPDATE på egen rad, publishOwnHcp) — ingår ALDRIG '
  'i host:s bulk-UPSERT. NULL = spelaren har inget intjänat HCP ännu (skölden '
  'visar då startvärdet 99) eller saknar konto (gäst).';
