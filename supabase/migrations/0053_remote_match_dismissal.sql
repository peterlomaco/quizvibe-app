-- 0053_remote_match_dismissal — per-user "delete all H2H games vs opponent"
-- Applied via Supabase SQL Editor (manuell korning), i staging OCH prod.
--
-- En spelare kan radera HELA sin H2H-historik mot EN specifik motstandare
-- (H2H History-skarmen -> "Game against: X" -> "Delete all"). Reglerna:
--   * Raderingen ar PER ANVANDARE — matcherna forsvinner bara ur den egna
--     historiken; motstandaren har dem kvar i sin (read-only).
--   * Bara TERMINALA matcher (status <> 'active') dismissas — en pagaende
--     duell mot samma motstandare ligger kvar under Not started/Ongoing.
--
-- Modell (samma som 0052 for Marathon-tabeller): en dismissed-flagga per
-- (match_id, user_id)-rad. Satts av den nya RPC:n. Klienten doljer matcher
-- dar DEN EGNA raden ar dismissed (getMyMatches filtrerar pa me.dismissed).

alter table public.remote_match_players
  add column if not exists dismissed boolean not null default false;

comment on column public.remote_match_players.dismissed is
  'True nar denna deltagare raderat matchen ur sin egen H2H-historik. Doljer den ur deras lista; motstandaren behaller den. Satts bara pa terminala matcher via dismiss_remote_matches_with_opponent.';


-- RPC: radera all H2H-historik mot en motstandare (per-user hide).
-- Satter ENBART callerns egna deltagarrader, och bara for matcher dar
-- p_opponent_user_id ocksa ar deltagare OCH matchen ar terminal. Idempotent.
create or replace function public.dismiss_remote_matches_with_opponent(
  p_opponent_user_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'remote match: no authenticated caller' using errcode = 'P0001';
  end if;

  update public.remote_match_players mp
     set dismissed = true
   where mp.user_id = caller
     and exists (
       select 1 from public.remote_match_players opp
        where opp.match_id = mp.match_id
          and opp.user_id = p_opponent_user_id
     )
     and exists (
       select 1 from public.remote_matches m
        where m.id = mp.match_id
          and m.status <> 'active'
     );
end;
$$;

revoke all on function public.dismiss_remote_matches_with_opponent(uuid) from public;
grant execute on function public.dismiss_remote_matches_with_opponent(uuid) to authenticated;
