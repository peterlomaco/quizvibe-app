-- 0021_question_answers.sql
-- Samlar in svar per fråga för framtida svårighetsgradsstyrning.
-- En rad per spelare × fråga × spelomgång.
-- Aggregerad vy question_difficulty räknar ut %-korrekt per fråga.
-- Klientkod skriver hit som fire-and-forget — påverkar inte spelflödet.

create table if not exists question_answers (
  id            uuid        primary key default gen_random_uuid(),
  question_id   text        not null,
  is_correct    boolean     not null,
  -- user_id är null för gäster (anon-sessions)
  user_id       uuid        references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Index för aggregering per fråga (den enda query vi kör mot tabellen)
create index if not exists question_answers_question_id_idx
  on question_answers(question_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table question_answers enable row level security;

-- Alla (autentiserade och anon) får skriva in svar
create policy "Anyone can insert question answers"
  on question_answers
  for insert
  with check (true);

-- Ingen klient får läsa rådata — enbart via aggregeringsvyn nedan
-- (service_role kringgår RLS och används för admin/analytics)
create policy "No client reads on raw answers"
  on question_answers
  for select
  using (false);

-- ─── Aggregeringsvy ─────────────────────────────────────────────────────────
-- question_difficulty: andel rätt per fråga, används för framtida
-- svårighetsgradsstyrning. Läses av service_role i backend/analytics.
create or replace view question_difficulty as
select
  question_id,
  count(*)                                                        as total_answers,
  sum(case when is_correct then 1 else 0 end)                    as correct_answers,
  round(
    100.0 * sum(case when is_correct then 1 else 0 end) / count(*),
    1
  )                                                               as correct_pct
from question_answers
group by question_id;

-- Vyer omfattas inte av RLS (körs med ägarens rättigheter) — utan denna
-- revoke kan klienter läsa aggregatet via PostgREST trots select-deny-
-- policyn på rådatan. service_role påverkas inte (kringgår grants).
revoke select on question_difficulty from anon, authenticated;
