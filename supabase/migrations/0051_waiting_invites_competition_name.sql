-- Marathon-table-namn på en waiting invite.
--
-- När en Competition re-match ("Continue with new Game" från en Marathon-
-- tabell) skickar inbjudningar vill mottagarens invite-kort visa
-- "Marathon table: <namn>" i stället för den härledda lobbytypen
-- (Single Player / Multiplayer / H2H). Room→serie-kopplingen lagras bara på
-- HOST:ens enhet (lokal AsyncStorage-serie), så namnet kan inte härledas
-- cross-device via roomCode — det måste bäras på själva inbjudan.
--
-- Nullable: vanliga (icke-marathon) invites lämnar den null och kortet
-- faller tillbaka på single/multiplayer/H2H-badgen precis som förut.
-- Additivt — ingen RLS-/policy-ändring behövs (INSERT-policyn oförändrad).
--
-- Appliceras MANUELLT via Supabase SQL Editor (samma flöde som övriga).

alter table public.waiting_invites
  add column if not exists competition_name text;
