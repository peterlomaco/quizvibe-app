-- ─────────────────────────────────────────────────────────────────────
-- 0024_waiting_invites_rate_limit — Security review-fix (Nivå 2, punkt 5)
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Problem: `waiting_invites` INSERT-policyn är `with check (true)` — vilken
-- authenticated user som helst kan skicka invites till valfri spelare, utan
-- tak. UI:t gate:ar till vänlistan men ett direkt API-anrop kringgår det →
-- invite-spam / inbox-flooding.
--
-- Fix: rate-limit på DB-nivå (BEFORE INSERT-trigger) — kan inte kringgås
-- från klienten. Två delar:
--   1. Ny kolumn `from_user_id` = TRUSTED avsändar-identitet, satt server-
--      side från auth.uid() (klient-satt `from_player_name` är kosmetiskt
--      och spoofbart). Ger också ON DELETE CASCADE så en users skickade
--      invites städas när kontot raderas (matchar delete-account-intentet).
--   2. Rate-limit-trigger: max N invites per avsändare inom ett rullande
--      1h-fönster. Räknar avsändarens rader (via from_user_id) — accepterade
--      invites raderas (removeInvite) och faller därför ur räkningen, så en
--      legitim host vars vänner faktiskt joinar ackumulerar knappt något;
--      det är oaccepterade invites (= spam-signalen) som räknas mot taket.
--
-- Klient-påverkan: ingen. `addInvite` (src/utils/waitingInvites.ts) gör en
-- plain INSERT och loggar bara icke-23505-fel som warning (try/catch +
-- AsyncStorage-fallback kvarstår). En rate-limit-rejektion blir alltså en
-- tyst no-op för cross-device-delivery — spam:arens överskotts-invites
-- propagerar inte. Vill man senare visa ett UI-meddelande kan klienten
-- matcha errcode 'P0001'.
--
-- Kvarstående (följdfixar, ej i denna migration):
--   - Per-(avsändare, mottagare)-tak mot riktad harassment (idag kapar
--     unique-constrainten 1 invite/rum, men en avsändare kan skapa många
--     rum). Rum-skapande saknar också egen rate-limit.
-- ─────────────────────────────────────────────────────────────────────

-- ── DEL 1 ── Trusted avsändar-kolumn ──────────────────────────────────
alter table public.waiting_invites
  add column if not exists from_user_id uuid
    references auth.users(id) on delete cascade;

create index if not exists waiting_invites_from_user_idx
  on public.waiting_invites (from_user_id);

-- Backfilla from_user_id i den befintliga BEFORE INSERT-triggern
-- (set_invite_to_user_id) parallellt med to_user_id-uppslaget. auth.uid()
-- returnerar rätt caller även i security definer (JWT-context, inte roll).
create or replace function public.set_invite_to_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.to_user_id is null then
    select id into new.to_user_id
    from public.profiles
    where player_name = new.to_player_name::citext;
  end if;
  -- Trusted avsändar-identitet, alltid från auth.uid() (aldrig klient-satt).
  if new.from_user_id is null then
    new.from_user_id := auth.uid();
  end if;
  return new;
end;
$$;

-- ── DEL 2 ── Rate-limit-trigger ───────────────────────────────────────
-- security definer krävs: SELECT-RLS på waiting_invites tillåter bara
-- recipient (to_user_id = auth.uid()) att läsa, så en avsändare kan inte
-- räkna sina egna SKICKADE rader under invoker-rights. Owner-rights (definer)
-- kringgår RLS så count(*) ser hela avsändarens fönster.
create or replace function public.enforce_invite_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender uuid := auth.uid();
  recent_count int;
  -- Tunbart tak. 50/h ger legitima hosts gott om marginal (t.ex. 11 vänner
  -- × 4 spel/h = 44) medan bots stoppas långt före hundratals.
  max_per_window constant int := 50;
  window_start timestamptz := now() - interval '1 hour';
begin
  -- Ingen auth-session → INSERT-policyn (to authenticated) borde redan ha
  -- blockerat. Defensivt: neka.
  if sender is null then
    raise exception 'invite blocked: no authenticated sender'
      using errcode = 'P0001';
  end if;

  select count(*) into recent_count
  from public.waiting_invites
  where from_user_id = sender
    and sent_at > window_start;

  if recent_count >= max_per_window then
    raise exception 'invite rate limit exceeded (max % per hour)', max_per_window
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger waiting_invites_rate_limit
before insert on public.waiting_invites
for each row execute function public.enforce_invite_rate_limit();
