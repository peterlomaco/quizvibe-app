-- ─────────────────────────────────────────────────────────────────────
-- 0041_competition_rematch_requests — två-fas re-match för sparade
--                                     Competition Leaderboards (från Home)
-- Applied via Supabase SQL Editor (manuell körning).
--
-- ── Bakgrund ─────────────────────────────────────────────────────────
-- En sparad Competition Leaderboard (0037) kan återupptas från Home →
-- /competitions. Till skillnad från Final Leaderboards re-match är de andra
-- deltagarna INTE anslutna. Flödet speglar därför Final Leaderboard men
-- cross-device och i TVÅ faser:
--
--   1. ACCEPT-fas: BARA competitionens host (aggregate_leaderboards.created_by)
--      kan initiera. En "request" skapas; övriga deltagare ser "Accept
--      re-match" tändas i sin egen competition-vy och accepterar. Host ser
--      "Waiting for X of Y players to accept". Ingen lobby finns än.
--   2. START-fas: när ALLA accepterat tänds host:s knapp "Yes – start
--      re-match". Host trycker → lobbyn skapas (startCompetitionRematch i
--      klienten), request:en markeras `started` med rums-koden, och
--      accepterande deltagare som är inne i appen auto-navigeras in
--      (fallback: en waiting_invite på Home).
--
-- Request:en LEVER I 5 MINUTER (expires_at). Hinner inte alla acceptera
-- filtreras den bort vid läsning (expires_at > now) och host kan initiera
-- på nytt.
--
-- Skrivningar går ENBART via SECURITY DEFINER-RPC:er (deny-by-default),
-- samma doktrin som remote_matches (0027) och aggregate_leaderboards (0037).
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.competition_rematch_requests (
  id                uuid primary key default gen_random_uuid(),
  leaderboard_id    uuid not null references public.aggregate_leaderboards(id) on delete cascade,
  host_user_id      uuid not null references auth.users(id) on delete cascade,
  -- active   → väntar på accepts
  -- started  → host tryckte "Yes – start re-match", room_code satt
  -- cancelled→ host avbröt / ersattes av en nyare request
  -- expired  → 5-min-fönstret passerade (sätts lazily; läsning filtrerar ändå)
  status            text not null default 'active'
                      check (status in ('active','started','cancelled','expired')),
  room_code         text,
  accepted_user_ids uuid[] not null default array[]::uuid[],
  created_at        timestamptz not null default now(),
  expires_at        timestamptz not null
);

create index if not exists competition_rematch_requests_leaderboard_idx
  on public.competition_rematch_requests (leaderboard_id);

-- Max EN aktiv request per competition åt gången — en ny initiering ersätter
-- (create-RPC:n cancel:ar den gamla först). Partiellt unikt så started/
-- cancelled/expired-rader inte blockerar.
create unique index if not exists competition_rematch_one_active
  on public.competition_rematch_requests (leaderboard_id)
  where status = 'active';


-- ── RLS ──────────────────────────────────────────────────────────────
-- Bara SELECT för deltagare (återanvänder participant-helpern från 0037).
-- All skrivning via RPC:erna nedan.
alter table public.competition_rematch_requests enable row level security;

drop policy if exists "participants read rematch requests" on public.competition_rematch_requests;
create policy "participants read rematch requests"
  on public.competition_rematch_requests for select
  to authenticated
  using (public.is_aggregate_leaderboard_participant(leaderboard_id));


-- ── RPC: host initierar en re-match ──────────────────────────────────
-- Caller MÅSTE vara competitionens host (created_by). En befintlig aktiv
-- request för samma competition cancel:as först (partiellt unik-index).
create or replace function public.create_competition_rematch_request(
  p_leaderboard_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  owner  uuid;
  new_id uuid;
begin
  if caller is null then
    raise exception 'rematch request: no authenticated caller' using errcode = 'P0001';
  end if;
  select created_by into owner from public.aggregate_leaderboards where id = p_leaderboard_id;
  if owner is null then
    raise exception 'competition leaderboard not found' using errcode = 'P0001';
  end if;
  if owner <> caller then
    raise exception 'only the competition host can start a re-match' using errcode = 'P0001';
  end if;

  -- Ersätt ev. tidigare aktiv request.
  update public.competition_rematch_requests
     set status = 'cancelled'
   where leaderboard_id = p_leaderboard_id and status = 'active';

  insert into public.competition_rematch_requests
    (leaderboard_id, host_user_id, status, expires_at)
  values
    (p_leaderboard_id, caller, 'active', now() + interval '5 minutes')
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.create_competition_rematch_request(uuid) from public;
grant execute on function public.create_competition_rematch_request(uuid) to authenticated;


-- ── RPC: en deltagare accepterar ─────────────────────────────────────
-- Caller måste vara deltagare i competitionen (RLS-helpern) men INTE host.
-- Idempotent — upprepad accept är en no-op. Avvisar om request:en inte är
-- aktiv eller har löpt ut.
create or replace function public.accept_competition_rematch_request(
  p_request_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  req    public.competition_rematch_requests%rowtype;
begin
  if caller is null then
    raise exception 'rematch request: no authenticated caller' using errcode = 'P0001';
  end if;
  select * into req from public.competition_rematch_requests where id = p_request_id;
  if req.id is null then
    raise exception 'rematch request not found' using errcode = 'P0001';
  end if;
  if not public.is_aggregate_leaderboard_participant(req.leaderboard_id) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;
  if req.host_user_id = caller then
    raise exception 'the host does not accept' using errcode = 'P0001';
  end if;
  if req.status <> 'active' or req.expires_at <= now() then
    raise exception 'rematch request is no longer active' using errcode = 'P0001';
  end if;

  if not (caller = any(req.accepted_user_ids)) then
    update public.competition_rematch_requests
       set accepted_user_ids = array_append(accepted_user_ids, caller)
     where id = p_request_id;
  end if;
end;
$$;

revoke all on function public.accept_competition_rematch_request(uuid) from public;
grant execute on function public.accept_competition_rematch_request(uuid) to authenticated;


-- ── RPC: host startar (efter att alla accepterat) ────────────────────
-- Klienten kollar "alla accepterade" innan den anropar; servern verifierar
-- bara host-ägarskap + att request:en är aktiv. Sätter room_code + started
-- så accepterande deltagare kan auto-navigeras in via Realtime.
create or replace function public.start_competition_rematch_request(
  p_request_id uuid,
  p_room_code text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  req    public.competition_rematch_requests%rowtype;
  code   text := upper(btrim(coalesce(p_room_code, '')));
begin
  if caller is null then
    raise exception 'rematch request: no authenticated caller' using errcode = 'P0001';
  end if;
  if code = '' then
    raise exception 'room code required' using errcode = 'P0001';
  end if;
  select * into req from public.competition_rematch_requests where id = p_request_id;
  if req.id is null then
    raise exception 'rematch request not found' using errcode = 'P0001';
  end if;
  if req.host_user_id <> caller then
    raise exception 'only the host can start the re-match' using errcode = 'P0001';
  end if;
  if req.status <> 'active' then
    raise exception 'rematch request is no longer active' using errcode = 'P0001';
  end if;

  update public.competition_rematch_requests
     set status = 'started', room_code = code
   where id = p_request_id;
end;
$$;

revoke all on function public.start_competition_rematch_request(uuid, text) from public;
grant execute on function public.start_competition_rematch_request(uuid, text) to authenticated;


-- ── RPC: host avbryter ───────────────────────────────────────────────
create or replace function public.cancel_competition_rematch_request(
  p_request_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  req    public.competition_rematch_requests%rowtype;
begin
  if caller is null then
    raise exception 'rematch request: no authenticated caller' using errcode = 'P0001';
  end if;
  select * into req from public.competition_rematch_requests where id = p_request_id;
  if req.id is null then return; end if;
  if req.host_user_id <> caller then
    raise exception 'only the host can cancel the re-match' using errcode = 'P0001';
  end if;
  update public.competition_rematch_requests
     set status = 'cancelled'
   where id = p_request_id and status = 'active';
end;
$$;

revoke all on function public.cancel_competition_rematch_request(uuid) from public;
grant execute on function public.cancel_competition_rematch_request(uuid) to authenticated;


-- ── Realtime ─────────────────────────────────────────────────────────
-- replica identity full så UPDATE/DELETE-events bär hela raden (klienten
-- filtrerar på leaderboard_id + läser accepted_user_ids/status/room_code).
alter table public.competition_rematch_requests replica identity full;
alter publication supabase_realtime add table public.competition_rematch_requests;
