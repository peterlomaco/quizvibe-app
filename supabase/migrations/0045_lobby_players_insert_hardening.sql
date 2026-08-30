-- ─────────────────────────────────────────────────────────────────────
-- 0045_lobby_players_insert_hardening — E3 (INSERT-delen)
--
-- ⚠⚠ TESTA I STAGING INNAN PROD. Detta rör lobby-JOIN-hotpathen. Applicera
-- i ett staging-projekt, kör igenom: registrerad join via kod, guest-join,
-- host + Add Player (guest), Play Again carry-over-claim, remote 1v1 — och
-- verifiera att inga joins börjar returnera 0 rader, INNAN prod.
--
-- Bakgrund: "authenticated can join lobby" var `with check (true)` → en
-- inloggad user kunde INSERT:a rader i VILKET rum som helst med godtyckligt
-- user_id och is_host=true (identitetsstöld + fejk-host-injektion; matar
-- dessutom den klient-sida isKnownSender-rostern som Realtime-injektionen
-- lutar sig mot).
--
-- Verifierat mot klienten (src/utils/mockLobbyPlayers.ts) INNAN skrivet:
--   • Non-host self-join (upsertOwnLobbyPlayer) sätter ALLTID user_id=auth.uid().
--   • Registrerad host:s egen rad + host-tillagda guests (user_id=NULL) skrivs
--     via host:s setLobbyPlayers och matchas av "host manages lobby players"
--     (FOR ALL, host_user_id-check som dubblar som INSERT-check) — INTE av
--     policyn nedan. De berörs därför inte.
--   • Carry-over-claim går via UPDATE ("player can claim unclaimed…", 0020),
--     inte INSERT.
--
-- Ny regel: en INSERT via join-policyn måste (a) sätta user_id = auth.uid()
-- och (b) bara sätta is_host=true om man faktiskt äger rummet.
-- ─────────────────────────────────────────────────────────────────────

drop policy if exists "authenticated can join lobby" on public.lobby_players;

create policy "authenticated can join lobby"
on public.lobby_players for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    not is_host
    or exists (
      select 1 from public.rooms r
      where r.code = lobby_players.room_code
        and r.host_user_id = auth.uid()
    )
  )
);

-- ── NOT ändrat här (medvetet), dokumenterat för nästa pass ───────────
-- • lobby_players SELECT `using(true)` (roster world-readable, PII) kvarstår:
--   join-flödet läser rostern INNAN egen rad finns (dup/carry-over-detektering),
--   så en membership-scoped SELECT skulle skapa ett chicken-and-egg-problem.
--   Rätt fix är Realtime-authorization (privata kanaler) + membership-scoped
--   SELECT i samma pass — se E2/E3 i pre-launch-planen (Phase 4).
-- • "player can claim unclaimed carry-over row" (0020) saknar fortfarande
--   rum-scoping (E6/M3). Lämnas tills join-modellen omarbetas i samma pass.
