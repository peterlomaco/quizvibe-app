-- ─────────────────────────────────────────────────────────────────────
-- 0032_remote_match_forfeit — "Quit match" = walkover för motståndaren
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-08): under en pågående Remote 1v1-match ska
-- BÅDA spelarna (host OCH motståndare) ha TVÅ utvägar från quiz-vyn:
--   1. "Quit match"     → man ger upp; motståndaren vinner på WALKOVER.
--   2. "Save & Exit"    → svaren sparas, matchen kan återupptas inom 48h.
-- Tidigare hade bara non-host väg 2, och host:s Quit AVBRÖT matchen för
-- båda (cancel_remote_match, 0028). Cancel-RPC:n behålls (den används inte
-- längre av quiz-vyn men är en giltig admin-/framtidsväg och äldre klienter
-- kan fortfarande anropa den).
--
-- Ny terminal-status 'forfeited' — skild från 'expired_walkover' så UI kan
-- skilja "motståndaren lämnade" från "motståndaren hann inte i tid". Båda
-- bär result = 'walkover'.
--
-- Klienten kan inte UPDATE:a remote_matches direkt (inga skriv-policyer —
-- allt går via SECURITY DEFINER-RPC:er, se 0027). Denna RPC:
--   • kräver att callern är DELTAGARE i matchen (host eller motståndare)
--   • rör bara AKTIVA matcher — ett avgjort resultat kan aldrig skrivas
--     över i efterhand. Idempotent: ingen träff = no-op.
--   • aggregerar callerns hittills sparade svar in i deras spelarrad så
--     resultatvyn kan visa en ärlig delpoäng ("You 2 — 4 Opponent").
--     finished_at lämnas MEDVETET null — de spelade aldrig klart.
--   • sätter winner_user_id = MOTSTÅNDAREN, result = 'walkover',
--     finished_at = now() (så guest-retention-cron:en i 0027 städar
--     guest-only-matcher 24h efter avbrottet precis som övriga avslut).
--
-- Deadline-sweepen + finalize-RPC:n opererar enbart på status='active' →
-- en forfeited match kan varken bli walkover igen eller "återuppstå" om
-- motståndaren spelar klart efter avbrottet (deras finalize no-op:ar och
-- resultatpanelen visar walkover-vinsten).
-- ─────────────────────────────────────────────────────────────────────

-- Ny terminal-status i CHECK-constrainten (0028 satte 5 värden).
alter table public.remote_matches drop constraint if exists remote_matches_status_check;
alter table public.remote_matches add constraint remote_matches_status_check
  check (status in ('active','finished','expired_walkover','void','cancelled','forfeited'));

create or replace function public.forfeit_remote_match(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  m record;
  opponent_id uuid;
  my_points int;
  my_correct int;
  my_avg numeric;
begin
  if caller is null then
    raise exception 'no authenticated caller' using errcode = 'P0001';
  end if;

  -- Radlås serialiserar mot en samtidig finalize/forfeit på samma match.
  select * into m from public.remote_matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found' using errcode = 'P0001';
  end if;
  if m.status <> 'active' then
    return;   -- redan avgjord/avbruten — no-op (idempotent)
  end if;

  if not exists (
    select 1 from public.remote_match_players p
    where p.match_id = p_match_id and p.user_id = caller
  ) then
    raise exception 'not a participant of this match' using errcode = 'P0001';
  end if;

  select p.user_id into opponent_id
  from public.remote_match_players p
  where p.match_id = p_match_id and p.user_id <> caller
  limit 1;

  -- Delpoäng ur redan sparade svar (upsert per fråga sedan 0027) så
  -- resultatvyn kan visa hur långt den som gav upp hann.
  select
    coalesce(sum(a.points), 0),
    coalesce(count(*) filter (where a.correct), 0),
    avg(a.time_used_seconds)
  into my_points, my_correct, my_avg
  from public.remote_match_answers a
  where a.match_id = p_match_id and a.user_id = caller;

  update public.remote_match_players
  set total_points = greatest(0, least(my_points, 100)),
      correct_answers = greatest(0, least(my_correct, 100)),
      avg_response_seconds = my_avg
      -- finished_at lämnas null: spelaren avslutade aldrig matchen.
  where match_id = p_match_id and user_id = caller;

  update public.remote_matches
  set status = 'forfeited',
      result = 'walkover',
      winner_user_id = opponent_id,
      finished_at = now()
  where id = p_match_id;
end;
$$;

revoke all on function public.forfeit_remote_match(uuid) from public;
grant execute on function public.forfeit_remote_match(uuid) to authenticated;
