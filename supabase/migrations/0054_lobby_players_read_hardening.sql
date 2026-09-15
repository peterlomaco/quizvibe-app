-- ─────────────────────────────────────────────────────────────────────
-- 0054_lobby_players_read_hardening — E2/E3 (SELECT-delen) + M3 (claim)
--
-- ⚠⚠ TESTA I STAGING INNAN PROD. Detta rör lobby-JOIN + Realtime-hotpathen.
-- Kör igenom i ett staging-projekt och verifiera ALLT nedan INNAN prod:
--   • Registrerad join via kod (dup-detection läser rostern FÖRE egen rad).
--   • Guest-join (guest-letter-derivation läser rostern FÖRE egen rad).
--   • Host + Add Player (guest), Play Again carry-over-claim, remote 1v1.
--   • ⭐ Realtime: non-host ser host:s/andras rader UPPDATERAS live (approve,
--     has_left, hcp) — INTE bara vid polling.
--   • ⭐ Eject cross-device: host trashar en non-host → non-host:s enhet får
--     DELETE-eventet och visar "User have been removed"-popup.
--   • MyMatches: sparad lobby visar motpartens namn (läsare ej alltid member).
-- ⚠ PROD MÅSTE först nå schema-paritet (migrationer 0026/0030/0042/0050) —
--   get_lobby_roster returnerar `setof lobby_players`, så dess kolumn-set
--   speglar tabellen; klientens rowToPlayer tål saknade kolumner (?? fallback).
--
-- ── Bakgrund (säkerhetsgranskning 2026-09-14) ───────────────────────────
-- FINDING 1 (HIGH): `lobby_players` SELECT `using(true)` (0003, medvetet
--   lämnad öppen i 0045) lät VEM SOM HELST med anon-nyckeln köra
--   `GET /rest/v1/lobby_players?select=*` UTAN filter → hela tabellen över
--   ALLA rum: name, age (15+-app → minderårigas ålder), user_id (konto-
--   länkning) och account_player_name (av-anonymiserar Guest alias → riktigt
--   kontonamn). Massuttag av aktiva användares PII utan session.
--
-- FINDING 2 (MEDIUM): "player can claim unclaimed carry-over row" (0020)
--   `using (user_id is null)` saknar rum-scoping OCH kolumn-lås. `with check`
--   begränsar bara user_id — inte is_host/approved/name. En autentiserad
--   angripare kunde PATCH:a en godtycklig obevakad carry-over-rad i VILKET
--   rum som helst och sätta `is_host=true, approved=true` = fejk-host/identitets-
--   kapning av en återvändande spelares reserverade slot.
--
-- ── Fix-strategi ────────────────────────────────────────────────────────
-- FINDING 1: byt `using(true)` mot en MEMBERSHIP-scoped SELECT-policy (via
--   SECURITY DEFINER-helpern is_lobby_member för att undvika RLS-rekursion,
--   samma mönster som is_remote_match_participant/0027). Policyn tillåter EGEN
--   rad (`user_id = auth.uid()` — täcker även DELETE-eventet av egen rad vid
--   eject) ELLER alla rader i ett rum man är medlem i. Host täcks redan av
--   "host manages lobby players" (FOR ALL). Massdumpen är därmed omöjlig:
--   en icke-medlem läser inget, en medlem läser bara sitt/sina rum.
--   Join-flödets PRE-medlemskaps-läsningar (dup-detection, guest-letters,
--   sparade lobbies) går via get_lobby_roster(code) — en DEFINER-RPC som
--   KRÄVER ett room_code-argument, så enumerering av hela tabellen är stängd.
--   Restexponering: rostern för ETT rum till den som känner till dess 6-
--   teckens-kod = samma betrodda modell som `rooms` (kod-obskuritet), och det
--   är data rum-medlemmar per design ska se.
--
-- FINDING 2: ersätt den lösa UPDATE-policyn med claim_carry_over_row(code,
--   player_id) — en DEFINER-RPC som SERVER-SIDE bara sätter
--   `user_id = auth.uid(), has_left = false` på en rad med `user_id IS NULL`.
--   Klienten kan inte längre välja SET-listan → is_host/approved/name kan inte
--   manipuleras. Policyn droppas helt.
-- ─────────────────────────────────────────────────────────────────────

-- ── SECURITY DEFINER-helper: "har caller en rad i detta rum?" ───────────
-- Bryter RLS-rekursion: en SELECT-policy på lobby_players som själv SELECT:ar
-- lobby_players ger infinite recursion. DEFINER-funktionen (ägd av postgres,
-- BYPASSRLS) kringgår RLS internt och bryter cykeln. Samma idiom som
-- is_remote_match_participant (0027) och is_aggregate_leaderboard_participant (0037).
create or replace function public.is_lobby_member(p_room_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.lobby_players
    where room_code = p_room_code
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_lobby_member(text) from public;
grant execute on function public.is_lobby_member(text) to anon, authenticated;

-- ── FINDING 1: membership-scoped SELECT ─────────────────────────────────
drop policy if exists "anyone can read lobby players" on public.lobby_players;

create policy "members read lobby players"
on public.lobby_players for select
to anon, authenticated
using (
  -- Egen rad: täcker egna läsningar OCH Realtime-DELETE av egen rad vid eject
  -- (OLD-radens user_id = jag → jag får DELETE-eventet även efter att raden
  -- försvunnit och is_lobby_member därmed blivit false).
  user_id = auth.uid()
  -- Alla rader i ett rum jag är medlem i (host:s + medspelares rader, live).
  or public.is_lobby_member(room_code)
);
-- Host täcks fortsatt av "host manages lobby players" (FOR ALL, 0003) — den
-- ger host SELECT/Realtime på alla rader i rum host_user_id = auth.uid() även
-- innan host:s egen lobby_players-rad hunnit skrivas.

-- ── DEFINER-RPC för PRE-medlemskaps-läsningar (join-flödet) ──────────────
-- Ersätter det tidigare öppna `select *`-läget för klientens getLobbyPlayers.
-- Kräver room_code som argument → ingen otbegränsad tabell-dump möjlig.
-- Returnerar `setof lobby_players` (alla tabellkolumner, ORDER BY turn_order)
-- så klientens rowToPlayer får oförändrad row-shape. DEFINER → kringgår RLS
-- internt (join-läsaren har ingen egen rad än), men bara för det rum vars
-- 6-teckens-kod anroparen redan känner till (samma modell som `rooms`).
create or replace function public.get_lobby_roster(p_room_code text)
returns setof public.lobby_players
language sql
security definer
set search_path = public
stable
as $$
  select *
  from public.lobby_players
  where room_code = upper(p_room_code)
  order by turn_order asc;
$$;

revoke all on function public.get_lobby_roster(text) from public;
grant execute on function public.get_lobby_roster(text) to anon, authenticated;

-- ── FINDING 2: server-styrd carry-over-claim ────────────────────────────
-- Sätter ENBART user_id + has_left på en obevakad rad. is_host/approved/name
-- kan inte längre sättas av klienten (SET-listan är server-side). auth.uid()
-- IS NOT NULL-guarden hindrar att en session-lös anropare "claimar" genom att
-- sätta user_id = null (no-op-loop). Idempotent: en redan claimad rad
-- (user_id not null) matchar inte → returnerar false.
create or replace function public.claim_carry_over_row(
  p_room_code text,
  p_player_id text
)
returns boolean
language sql
security definer
set search_path = public
as $$
  with updated as (
    update public.lobby_players
    set user_id = auth.uid(),
        has_left = false
    where room_code = upper(p_room_code)
      and player_id = p_player_id
      and user_id is null
      and auth.uid() is not null
    returning 1
  )
  select exists (select 1 from updated);
$$;

revoke all on function public.claim_carry_over_row(text, text) from public;
grant execute on function public.claim_carry_over_row(text, text) to authenticated;

-- Droppa den lösa UPDATE-policyn — claim går nu enbart via RPC:n ovan.
-- "player can update own row" (0003) täcker fortsatt alla own-row-UPDATE:s
-- (markOwnPlayerLeft, publishOwnHcp, publishOwnAccountName, seen-ids).
drop policy if exists "player can claim unclaimed carry-over row" on public.lobby_players;
