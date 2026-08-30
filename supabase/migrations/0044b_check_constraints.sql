-- ─────────────────────────────────────────────────────────────────────
-- 0044b_check_constraints — pre-launch hardening, TIER 2: NEW-WRITES ONLY
--
-- Applied via Supabase SQL Editor (manuell körning). CHECK-constraints som
-- NOT VALID → validerar ENBART framtida INSERT/UPDATE, scannar ALDRIG
-- befintlig data och avvisar aldrig en existerande rad. Enda teoretiska
-- risken: en framtida legitim write som bryter mot mönstret nedan blockeras.
-- Klienten skriver bara riktiga emails + rimliga födelseår, så det ska inte
-- ske — men eftersom det påverkar writes, kör gärna i staging först.
--
-- E8: birth_year + email saknade helt validering.
--
-- (Vill du senare validera även BEFINTLIGA rader, kör efteråt:
--    alter table public.profiles validate constraint profiles_birth_year_range;
--    alter table public.profiles validate constraint profiles_email_format;
--  Det scannar tabellen och rapporterar ev. gamla rader som bryter mönstret.)
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles
  add constraint profiles_birth_year_range
  check (birth_year is null or birth_year between 1900 and 2100)
  not valid;

-- Konservativ POSIX-ERE: @ + punkt-domän, inga blanksteg, 3–254 tecken.
alter table public.profiles
  add constraint profiles_email_format
  check (
    char_length(email) between 3 and 254
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
  not valid;
