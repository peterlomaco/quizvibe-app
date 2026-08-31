-- ─────────────────────────────────────────────────────────────────────
-- 0044a_fk_indexes — pre-launch hardening, TIER 1: ZERO RISK (indexes only)
--
-- Applied via Supabase SQL Editor (manuell körning). Ren prestanda — inga
-- policyer, inga constraints, inget beteende ändras. Kan appliceras direkt
-- i prod. `if not exists` → idempotent.
--
-- E10: två foreign-key-kolumner saknade index.
-- ─────────────────────────────────────────────────────────────────────

-- waiting_invites.room_code är FK mot rooms(code) med ON DELETE CASCADE. Den
-- timvisa pg_cron room-cleanupen (0006) gjorde en seq scan per raderat rum
-- utan detta index.
create index if not exists waiting_invites_room_code_idx
  on public.waiting_invites (room_code);

-- lobby_players.user_id läses av "player can update own row"/claim-policyn
-- (0003, 0020) och av delete-account-cascaden. Oindexerat före detta.
create index if not exists lobby_players_user_id_idx
  on public.lobby_players (user_id);
