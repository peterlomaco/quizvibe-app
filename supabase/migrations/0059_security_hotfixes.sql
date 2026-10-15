-- ─────────────────────────────────────────────────────────────────────
-- 0059_security_hotfixes — security audit 2026-10-15.
-- REDAN APPLICERAD manuellt på PROD + staging 2026-10-15 (SQL Editor).
-- Idempotent: kan köras om utan effekt. Ren DB-ändring, ingen klient-ändring.
--
-- Rotorsak till båda fixarna: Supabase ger nya funktioner EXECUTE DIREKT till
-- anon + authenticated via default privileges. `revoke … from public` tar
-- därför INTE bort klient-åtkomst — det krävs `revoke … from anon,
-- authenticated` (eller drop). Verifierat live med has_function_privilege.
-- ─────────────────────────────────────────────────────────────────────

-- 1. Email-enumerering: 0022 revokade bara anon/authenticated men funktionen
--    var fortfarande anropbar (has_function_privilege('anon', …) = true på
--    båda projekten). Oanvänd sedan login-by-name slår upp email själv med
--    service-role → droppas helt.
drop function if exists public.lookup_email_by_player_name(text);

-- 2. Interna helpers får aldrig vara klient-anropbara.
--    _compute_remote_match_winner har ingen caller-check: en deltagare kunde
--    finalisera sin egen rad och sedan anropa helpern direkt → matchen avgjord
--    med dem som vinnare innan motståndaren spelat. Anropas legitimt bara från
--    finalize_remote_match_player + sweep (båda SECURITY DEFINER, ägda av
--    postgres) och pg_cron — påverkas inte av dessa revokes.
revoke execute on function public._compute_remote_match_winner(uuid) from anon, authenticated;
revoke execute on function public.sweep_remote_match_deadlines() from anon, authenticated;
