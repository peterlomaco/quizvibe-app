-- ─────────────────────────────────────────────────────────────────────
-- 0028_remote_match_cancel — Host:s Quit Game avbryter 1vs1-matchen
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-07, rev 2): när HOST väljer Quit Game i en
-- pågående Remote 1v1-match ska matchen INTE raderas — den behålls med ny
-- status 'cancelled' och visas för BÅDA spelarna (My 1v1 Matches på Home
-- + Profile/Player history) med texten "Lobby deleted by Host". Ingen
-- vinnare, inget W/L/D — bara ett synligt kvitto på att matchen skapades
-- men avbröts av host.
--
-- Klienten kan inte UPDATE:a remote_matches direkt (inga skriv-policyer —
-- allt går via SECURITY DEFINER-RPC:er, se 0027). Denna RPC:
--   • kräver att callern är MATCHENS HOST (is_host = true i players-raden)
--   • rör bara AKTIVA matcher — ett avgjort resultat (finished/walkover/
--     void) kan aldrig skrivas över i efterhand
--   • sätter finished_at = now() så guest-retention-cron:en (0027) städar
--     guest-only-matcher 24h efter avbrottet precis som övriga avslut
--   • Idempotent — ingen träff (redan avbruten/fel caller/avgjord) = no-op
--
-- Deadline-sweepen + finalize-RPC:n är redan säkra: båda opererar enbart
-- på status='active' → en cancelled match kan varken bli walkover eller
-- "återuppstå" om motståndaren spelar klart efter avbrottet.
-- ─────────────────────────────────────────────────────────────────────

-- Ny terminal-status i CHECK-constrainten (0027 satte 4 värden).
alter table public.remote_matches drop constraint if exists remote_matches_status_check;
alter table public.remote_matches add constraint remote_matches_status_check
  check (status in ('active','finished','expired_walkover','void','cancelled'));

create or replace function public.cancel_remote_match(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'no authenticated caller' using errcode = 'P0001';
  end if;

  update public.remote_matches m
  set status = 'cancelled', finished_at = now()
  where m.id = p_match_id
    and m.status = 'active'
    and exists (
      select 1 from public.remote_match_players p
      where p.match_id = m.id and p.user_id = caller and p.is_host
    );
end;
$$;

revoke all on function public.cancel_remote_match(uuid) from public;
grant execute on function public.cancel_remote_match(uuid) to authenticated;
