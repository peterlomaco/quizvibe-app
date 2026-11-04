-- 0061: Hints AV som default för nyregistrerade QuizVibe-users (Peter 2026-11-03).
--
-- Nya profiles-rader skapas av handle_new_user (0048/0060) som INTE sätter
-- images_enabled_categories → kolumnens default (0014: Music+Film+Sport)
-- gällde, så Quiz Mixer startade med Hints PÅ. En tom array är redan ett
-- giltigt "Hints av"-val i klienten (profileStorage/Profile/Lobby-seed
-- respekterar [] och coercar det inte tillbaka). Spelaren kan själv slå på
-- Hints i Profile → Quiz Mixer eller i lobbyn.
--
-- Påverkar ENBART nya rader — befintliga profiler behåller sitt val.
-- lobby_settings-defaulten lämnas orörd (lobbyn seedar alltid explicit
-- från host-profilen).

alter table public.profiles
  alter column images_enabled_categories set default '{}'::text[];
