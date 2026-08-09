-- ─────────────────────────────────────────────────────────────────────
-- 0035_app_config — generisk remote-config + Free Premium launch promo
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Bakgrund: QuizVibe lanseras med en kampanjperiod där Premium är gratis.
-- Store visar då "Single month — no auto-renewal" med en Free-knapp i
-- stället för 79 kr-kortet. Peter måste kunna AVSLUTA kampanjen när han
-- vill — utan att vänta på App Store-review för en ny build. Därför bor
-- kampanjens av/på-läge här i stället för i en bakad konstant.
--
-- Klienten har fortfarande en bakad OFFER_BACKSTOP_UNTIL (se
-- src/utils/promoPremium.ts) som gäller för enheter som ALDRIG lyckats
-- läsa denna rad. Utan den skulle en enhet som aldrig når Supabase kunna
-- ligga kvar i kampanjläge för alltid.
--
-- Tabellen är medvetet generisk (key/jsonb) — nästa remote-flagga behöver
-- ingen ny migration, bara en ny rad.
--
-- SÄKERHET: bara SELECT är öppet. Ingen insert/update/delete-policy finns,
-- så med RLS på kan varken anon eller authenticated skriva — enbart
-- dashboarden / service_role. Innehållet är icke-känsligt (ett datum och
-- en boolean) så anon-läsning är oproblematisk, och den måste vara öppen
-- eftersom Store nås innan en session hunnit etableras.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.app_config (
  key         text primary key,
  value       jsonb       not null,
  updated_at  timestamptz not null default now()
);

comment on table public.app_config is
  'Generisk remote-config (key → jsonb). Läsbar av alla, skrivbar enbart '
  'via dashboard/service_role. Används av Free Premium-kampanjen för att '
  'kunna stängas utan App Store-release.';

alter table public.app_config enable row level security;

-- Läsbar av alla (inkl. anon — Store kan nås utan session).
drop policy if exists "app_config is readable by everyone" on public.app_config;
create policy "app_config is readable by everyone"
  on public.app_config
  for select
  using (true);

-- MEDVETET inga insert/update/delete-policyer. Skrivning sker enbart från
-- Supabase-dashboarden (service_role kringgår RLS).

-- ── Free Premium launch promo ────────────────────────────────────────
--
-- enabled : false stänger erbjudandet OMEDELBART, oavsett `until`.
-- until   : ISO-tidsstämpel då erbjudandet slutar av sig självt.
--
-- Att stänga kampanjen: sätt enabled=false (eller flytta `until` bakåt i
-- tiden). Slår igenom på varje enhet vid dess nästa app-start.
--
--   update public.app_config
--      set value = '{"enabled": false, "until": "2026-10-01T00:00:00Z"}'::jsonb,
--          updated_at = now()
--    where key = 'free_premium_promo';
--
-- OBS: att stänga erbjudandet återkallar INTE en gratismånad som redan är
-- igång. Klienten "grandfathar" den — Store byter till 79 kr-kortet för
-- alla, men den som har en månad kvar behåller Premium tills den tar slut
-- och kan bara inte förnya. Se src/utils/promoPremium.ts.
--
-- `on conflict do nothing` så en om-körning inte nollställer ett läge Peter
-- redan ändrat i dashboarden.
insert into public.app_config (key, value)
values (
  'free_premium_promo',
  '{"enabled": true, "until": "2026-12-31T22:59:59Z"}'::jsonb
)
on conflict (key) do nothing;
