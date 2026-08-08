-- ─────────────────────────────────────────────────────────────────────
-- 0031_rooms_is_remote_1v1 — lobbytypen känd redan vid rums-skapandet
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Problem: guest-join-gaten mot Remote 1vs1 (rev 3, 2026-08-08) läste
-- `lobby_settings.game_mode` för att avgöra om koden tillhör en 1v1-lobby.
-- Den kolumnen skrivs av hostens LobbyScreen genom en 300 ms DEBOUNCE, så
-- under ~1s efter att lobbyn skapats finns ingen rad att läsa → gaten var
-- FAIL-OPEN och en guest som knappade in koden snabbt kom in i lobbyn och
-- fick i stället ejectas av backstoppen (sämre UX, och beroende av att
-- backstoppen fungerar).
--
-- Lösning: flytta signalen till `rooms`-raden, som `registerActiveRoom`
-- skriver ATOMISKT vid skapandet — innan någon join ens är möjlig (koden
-- existerar inte för andra förrän raden finns). Gaten blir då en enda
-- pålitlig läsning utan race och utan fail-open-väg.
--
-- Varför inte `game_mode` i klartext: `rooms` är anon-läsbart (vem som
-- helst med en kod kan läsa raden) och lobbytypen är den ENDA egenskapen
-- join-gaten behöver. En boolean exponerar minimalt och kan inte hamna ur
-- sync med `lobby_settings.game_mode` på ett sätt som spelar roll —
-- LobbyScreen-seeden forcerar `remote-1v1` från samma `lobbyType`-param
-- som sätter denna kolumn.
--
-- Legacy: rum skapade FÖRE denna migration får default false. De kan
-- felklassas av gaten under sin återstående livstid (max 24h, sedan
-- expires_at), men lobby-backstoppen fångar dem — samma skyddsnät som
-- tidigare. Självläkande, ingen backfill behövs.
-- ─────────────────────────────────────────────────────────────────────

alter table public.rooms
  add column if not exists is_remote_1v1 boolean not null default false;

comment on column public.rooms.is_remote_1v1 is
  'True när lobbyn skapades som Remote 1vs1 (lobbyType=1v1). Sätts av '
  'registerActiveRoom vid skapandet så join-gates kan avgöra lobbytypen '
  'utan att vänta på den debounce:ade lobby_settings-skrivningen. '
  'Remote 1vs1 spelas enbart mellan QuizVibe-users — guest-join blockeras '
  'på denna kolumn.';
