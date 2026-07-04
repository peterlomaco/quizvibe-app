-- ─────────────────────────────────────────────────────────────────────
-- 0022_player_name_lookup_hardening — Security review-fix (Nivå 1, punkt 1)
-- Applied via Supabase SQL Editor (manuell körning, samma flöde som
-- övriga migrations).
--
-- Problem: `lookup_email_by_player_name(text)` (0001) är `security definer`
-- och grantad till `anon` + `authenticated`. Den returnerar en registrerad
-- users EMAIL givet deras PlayerName. Eftersom PlayerName visas öppet i
-- lobbies/leaderboards är detta en email-enumereringsvektor — vem som helst
-- kan iterera kända PlayerNames och skörda email:er (spam/phishing/account-
-- takeover-recon).
--
-- Fix (två delar):
--   1. Ny boolean-RPC `player_name_exists(text)` för uniqueness-check
--      (Register-formen + Add Player-modalen behöver bara "finns namnet?",
--      aldrig email:en). Läcker ingen email.
--   2. REVOKE av email-RPC:n från klient-roller. Login-via-PlayerName går
--      nu via Edge Function 'login-by-name' som gör sign-in server-side och
--      returnerar en session — email:en når aldrig klienten.
--
-- APPLICERINGSORDNING (viktigt — annars bryts login):
--   a. Kör DEL 1 nedan (skapar player_name_exists).
--   b. Deploya Edge Function 'login-by-name' + shippa klient-ändringarna
--      (handleLogin → signInWithPlayerName, uniqueness-checks →
--      playerNameExists).
--   c. Kör DEL 2 (REVOKE). Först nu är login-flödet migrerat.
-- ─────────────────────────────────────────────────────────────────────

-- ── DEL 1 ── Boolean uniqueness-RPC (ingen email läcker) ──────────────
-- player_name är citext → jämförelsen är case-insensitiv, samma
-- uniqueness-semantik som `unique`-constrainten på kolumnen.
create or replace function public.player_name_exists(p_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where player_name = p_name
  );
$$;

grant execute on function public.player_name_exists(text) to anon, authenticated;


-- ── DEL 2 ── Revoke email-läckande RPC från klient-roller ─────────────
-- Kör detta EFTER att login-by-name-Edge-Function + klient-ändringarna är
-- live (se appliceringsordning ovan). Efter revoke kan bara service-role
-- (Edge Functions) anropa lookup_email_by_player_name.
revoke execute on function public.lookup_email_by_player_name(text)
  from anon, authenticated;
