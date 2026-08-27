-- ─────────────────────────────────────────────────────────────────────
-- 0040_email_exists — Register-form: email uniqueness pre-check
-- Applied via Supabase SQL Editor (manuell körning, samma flöde som
-- övriga migrations).
--
-- Register-formen validerar nu email:en redan vid email-steget:
--   1. Format (klient-regex REG_EMAIL_REGEX).
--   2. "Finns email:en redan?" — via denna boolean-RPC.
-- Speglar player_name_exists (0022) UX-mässigt: en Check-knapp ger
-- ✓ / ✗ innan användaren går vidare i formuläret.
--
-- ⚠ SÄKERHET: detta ÅTERINFÖR en email-enumereringsvektor (motsatt
-- riktning mot 0022, som tog bort email-LÄCKAGE givet PlayerName).
-- Skillnad: 0022 läckte en users email; denna returnerar BARA en boolean
-- (finns/finns inte) givet en email — ingen data läcker, men en bot kan
-- probe:a vilka email:er som har konto. Peters beslut 2026-08-27 att
-- föredra live-Check-UX framför enumererings-skyddet. Rekommenderad
-- efterföljande härdning (ej i denna migration): CAPTCHA / rate-limit på
-- signup + join (redan i säkerhets-backloggen i CLAUDE.md).
--
-- Läcker inget mer än exists/not-exists. Case-insensitiv (auth.users.email
-- lagras normaliserat men vi lower():ar defensivt).
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

grant execute on function public.email_exists(text) to anon, authenticated;
