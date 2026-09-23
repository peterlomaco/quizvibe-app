-- ─────────────────────────────────────────────────────────────────────
-- 0057 — remote_match_answers.skipped (2026-09-23).
--
-- Remote 1v1: om ett YouTube-klipp inte går att spela mitt i matchen visas
-- popupen "Sorry but this clip has been removed for your region" och frågan
-- HOPPAS ÖVER (sekvensen är server-låst i question_ids, så den kan inte
-- bytas ut som i lokala lägen). Klienten skriver en rad med skipped = true så
-- resume aldrig landar på frågan igen. Raden ska INTE räknas som ett svar:
--   • klient-finalize räknar redan bara allRoundScoresHistory (skippade
--     poster läggs aldrig dit) → finalize_remote_match_player är orörd.
--   • forfeit_remote_match aggregerar svar server-side → uppdateras nedan
--     till att ignorera skippade rader.
-- Appliceras MANUELLT via SQL Editor (staging + prod). Klienten tål att
-- kolumnen saknas (skip-skrivningen failar då med console.warn, och en
-- resume kan i värsta fall visa samma blockerade fråga igen).
-- ─────────────────────────────────────────────────────────────────────

alter table public.remote_match_answers
  add column if not exists skipped boolean not null default false;

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

  select * into m from public.remote_matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found' using errcode = 'P0001';
  end if;
  if m.status <> 'active' then
    return;
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

  select
    coalesce(sum(a.points), 0),
    coalesce(count(*) filter (where a.correct), 0),
    avg(a.time_used_seconds)
  into my_points, my_correct, my_avg
  from public.remote_match_answers a
  where a.match_id = p_match_id and a.user_id = caller and not a.skipped;

  update public.remote_match_players
  set total_points = greatest(0, least(my_points, 100)),
      correct_answers = greatest(0, least(my_correct, 100)),
      avg_response_seconds = my_avg
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
