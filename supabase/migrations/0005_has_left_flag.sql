-- ─────────────────────────────────────────────────────────────────────
-- 0005_has_left_flag — Fas 3 Slice C-ii
-- Cross-device "LEFT THIS GAME LOBBY"-rendering. Tidigare lagrades
-- left-state lokalt per device i AsyncStorage (src/utils/leftPlayers.ts),
-- vilket innebar att user A:s lämning på device 1 inte nådde user B:s
-- vy på device 2. Nu skriver lämnaren has_left=true på sin egen rad i
-- lobby_players, och Realtime broadcastar UPDATE-eventet till alla
-- klienter i lobbyn.
--
-- Behåller raden (istället för DELETE) så övriga spelare ser kortet
-- renderat i grå "LEFT THIS GAME LOBBY"-styling, inte att spelaren
-- bara försvinner. AsyncStorage-store:n lever vidare som offline-
-- fallback + för test-seed-rum (in-memory) tills den fasas ut.
-- ─────────────────────────────────────────────────────────────────────

alter table public.lobby_players
  add column has_left boolean not null default false;

-- Inget extra index behövs — queries filtrerar på room_code (täcks av
-- befintliga lobby_players_room_idx). has_left läses som del av SELECT *,
-- inte som filter-klausul.

-- Inga RLS-policy-ändringar behövs:
--   • "player can update own row" (user_id = auth.uid()) tillåter
--     lämnaren att sätta has_left=true på sin egen rad. Guests har
--     anon-auth (Slice 3C-ii) så user_id är ifyllt.
--   • "host manages lobby players" tillåter host att UPDATE alla rader
--     i sitt rum (om host ev. behöver bulk-rensa left-rader, ej i scope).
--   • Realtime-publikationen täcker hela tabellen så has_left-UPDATEs
--     broadcastas automatiskt utan ändringar i alter publication.
