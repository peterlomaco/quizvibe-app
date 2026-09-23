-- ─────────────────────────────────────────────────────────────────────
-- 0056 — clip_playback_errors: YouTube-klipp som inte gick att spela på en
-- RIKTIG spelares enhet (2026-09-23).
--
-- Bakgrund: drake-one-dance gav "Video unavailable" i TestFlight (SE) trots
-- att Data API, oEmbed och CI:s headless embed-audit alla sa "spelbart".
-- Claim-baserade embed-block per land syns BARA vid riktig uppspelning från
-- landet. Varje enhet rapporterar därför sina embed-fel hit, och
-- Edge Function `check-clips` läser tabellen som en BLOCKLISTA i pre-game-
-- kollen → bara den första spelaren någonsin möter ett sådant klipp; alla
-- senare spel byter ut det INNAN Play.
--
-- Skrivs av klienten (insert-only). Läses ENBART server-side (service role i
-- check-clips + nightly-rapporten) — ingen klient-SELECT.
--
-- Blocklistan (se check-clips) räknar bara error_code 'video_not_found' /
-- 'embed_not_allowed'. 'HTML5_error' / 'invalid_parameter' är oftast nät- eller
-- WebView-hickar och loggas bara för felsökning.
--
-- Rensa en rad när klippet ersatts i katalogen: `update ... set cleared = true`
-- (eller låt 30-dagarsfönstret i check-clips ta den).
-- Appliceras MANUELLT via SQL Editor (staging + prod).
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.clip_playback_errors (
  id bigserial primary key,
  video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  item_id text check (item_id is null or length(item_id) <= 120),
  error_code text not null check (length(error_code) <= 40),
  platform text check (platform is null or length(platform) <= 20),
  game_mode text check (game_mode is null or length(game_mode) <= 30),
  reporter uuid default auth.uid(),
  cleared boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists clip_playback_errors_video_idx
  on public.clip_playback_errors (video_id, created_at desc);

alter table public.clip_playback_errors enable row level security;

drop policy if exists clip_playback_errors_insert on public.clip_playback_errors;
create policy clip_playback_errors_insert on public.clip_playback_errors
  for insert to anon, authenticated
  with check (cleared = false);

-- Enkel spam-broms: max 30 rapporter per avsändare och timme.
create or replace function public.enforce_clip_error_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.reporter is not null and (
    select count(*) from public.clip_playback_errors
    where reporter = new.reporter and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'clip error rate limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists clip_playback_errors_rate_limit on public.clip_playback_errors;
create trigger clip_playback_errors_rate_limit
  before insert on public.clip_playback_errors
  for each row execute function public.enforce_clip_error_rate_limit();
