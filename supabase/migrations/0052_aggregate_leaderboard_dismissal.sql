-- ─────────────────────────────────────────────────────────────────────
-- 0052_aggregate_leaderboard_dismissal — per-user delete + global lock
-- Applied via Supabase SQL Editor (manuell körning), i staging OCH prod.
--
-- En spelare kan radera en Marathon-tabell FRÅN SIN EGEN historik. Reglerna
-- (Peter 2026-09-11):
--   • Raderingen är PER ANVÄNDARE — tabellen försvinner bara ur den egna
--     listan; övriga deltagare har den kvar i sin historik (read-only).
--   • Men spelet kan ALDRIG spelas igen: så fort NÅGON deltagare raderat är
--     serien permanent olåsbar för re-match. Det "locked"-tillståndet är
--     HÄRLETT klient-side (`participants.some(p => p.dismissed)`) — ingen
--     parent-kolumn behövs.
--   • Host som INTE själv raderat ser tabellen kvar, men "Send Re-match
--     invitation" byts mot grått "All players not available".
--
-- Modell: en `dismissed`-flagga per (leaderboard_id, user_id)-rad. Sätts av
-- den nya RPC:n. Klienten döljer serier där DEN EGNA raden är dismissed och
-- härleder locked ur att NÅGON rad är dismissed (child-raderna är redan
-- läsbara för deltagare via 0037:s SELECT-RLS).
-- ─────────────────────────────────────────────────────────────────────

alter table public.aggregate_leaderboard_players
  add column if not exists dismissed boolean not null default false;

comment on column public.aggregate_leaderboard_players.dismissed is
  'True när DENNA deltagare raderat serien ur sin egen historik. Döljer den '
  'ur deras lista; övriga behåller den. Att någon rad är true gör hela serien '
  'permanent olåsbar för re-match (härlett locked, ingen parent-kolumn).';


-- ── RPC: radera (per-user hide + implicit global lock) ────────────────
-- Sätter ENBART callerns egen rad. Guarden är "deltagare" (servern vet inte
-- vem som är host). Idempotent — upprepad radering är en no-op.
create or replace function public.dismiss_aggregate_leaderboard(
  p_leaderboard_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if not public.is_aggregate_leaderboard_participant(p_leaderboard_id) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;

  update public.aggregate_leaderboard_players
     set dismissed = true
   where leaderboard_id = p_leaderboard_id and user_id = caller;
end;
$$;

revoke all on function public.dismiss_aggregate_leaderboard(uuid) from public;
grant execute on function public.dismiss_aggregate_leaderboard(uuid) to authenticated;


-- ── RPC: "Add to existing" — exkludera raderade (locked) serier ───────
-- En serie som någon deltagare raderat är permanent olåsbar och ska därför
-- inte erbjudas som mål för ett nytt spel. Re-declare av 0037-funktionen med
-- ETT tillägg: `and not exists (… dismissed)`. Resten oförändrat.
create or replace function public.list_aggregate_leaderboards_for_participants(
  p_user_ids uuid[]
) returns table (
  id uuid,
  name text,
  games_count int,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller   uuid := auth.uid();
  uniq_ids uuid[];
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if p_user_ids is null or array_length(p_user_ids, 1) is null then
    return;
  end if;

  select array_agg(distinct x) into uniq_ids from unnest(p_user_ids) x;
  if not (caller = any(uniq_ids)) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;

  return query
    select l.id,
           l.name,
           (select count(*)::int from public.aggregate_leaderboard_games g
             where g.leaderboard_id = l.id) as games_count,
           l.updated_at
      from public.aggregate_leaderboards l
     where l.participants_key = public._aggregate_participants_key(uniq_ids)
       and not exists (
         select 1 from public.aggregate_leaderboard_players p
          where p.leaderboard_id = l.id and p.dismissed
       )
     order by l.updated_at desc;
end;
$$;

revoke all on function public.list_aggregate_leaderboards_for_participants(uuid[]) from public;
grant execute on function public.list_aggregate_leaderboards_for_participants(uuid[]) to authenticated;
