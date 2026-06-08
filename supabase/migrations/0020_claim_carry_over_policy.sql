-- ─────────────────────────────────────────────────────────────────────
-- 0020_claim_carry_over_policy — Play Again carry-over + Realtime fixes
--
-- Problem 1: claimCarryOverLobbyPlayer anropar UPDATE utan att ha user_id
-- matchat mot auth.uid(). Carry-over-rader har user_id = NULL (skrivna av
-- host:s goToNewLobby → setLobbyPlayers som strippar user_id ur non-host-
-- payload:en). RLS-policyn "player can update own row" evaluerar
-- `NULL = auth.uid()` → NULL → falsy → UPDATE returnerar 0 rows utan fel.
-- Fix: ny policy som tillåter en autentiserad spelare att claima en rad med
-- user_id IS NULL (= ej kravd av någon ännu). with check begränsar till
-- att man bara kan sätta user_id = auth.uid() — ingen kan ta över en annans
-- rad, och man kan inte sätta user_id till något annat uid.
--
-- Problem 2: rooms-tabellen saknas ur supabase_realtime-publikationen.
-- LobbyScreen prenumererar på postgres_changes för rooms-tabellen för att
-- detektera game_started=true via Realtime istället för enbart 2s-polling.
-- Utan denna rad fyrar Realtime aldrig för rooms-ändringar → non-host
-- detekterar game_started bara via polling (0-2s fönster för race).
-- Fix: lägg till rooms i publikationen så game_started-ändringar broadcastas
-- omedelbart till non-host:s syncFromStore-effekt.
-- ─────────────────────────────────────────────────────────────────────

-- Tillåt en inloggad spelare att claima en pre-seedad carry-over-rad
-- (skriven av host:s goToNewLobby / setLobbyPlayers, user_id=NULL).
-- using: matchar enbart rader utan ägare — kan inte ta över andras rader.
-- with check: garanterar att man bara kan sätta user_id till sin egen uid.
create policy "player can claim unclaimed carry-over row"
on public.lobby_players for update
to authenticated
using (user_id is null)
with check (user_id = auth.uid());

-- Lägg till rooms i Realtime-publikationen så game_started-ändringar
-- (markRoomGameStarted → rooms.game_started=true) broadcastas direkt.
-- Non-host:s subscription (.on 'postgres_changes' table='rooms') kan då
-- trigga syncFromStore omedelbart istället för att vänta på 2s-polling.
alter publication supabase_realtime add table public.rooms;
