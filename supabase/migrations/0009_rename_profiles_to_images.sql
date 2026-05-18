-- Rename profiles_enabled → images_enabled.
--
-- Reason: kolumnen heter `profiles_enabled` av historiska skäl (källan
-- hette "Profiles & Places" / "Profiles & Locations" i tidig UI-design).
-- User-facing label har sedan länge bytts till "Images" eftersom källan
-- är bilder-baserade frågor (Letter Grid + image questions). Det här
-- aligns DB-namnet med både UI:t och de TS-fält som speglar raden
-- (`imagesEnabled` post-rename i mockLobbySettings.ts).
--
-- Forward-only: ingen down-migration eftersom Supabase managed migrations
-- körs uppåt. Om rollback behövs: motsvarande RENAME tillbaka.

alter table public.lobby_settings
  rename column profiles_enabled to images_enabled;
