-- ─────────────────────────────────────────────────────────────────────
-- 0006_pg_cron_rooms_cleanup — Fas 3 Slice C-ii
-- Automatisk borttagning av expired rooms (24h efter creation). Innan
-- detta byggde isActiveRoom/roomExists på lazy expiry via WHERE-filter
-- `expires_at > now()`, vilket räcker funktionellt men lämnar stale
-- rader kvar i tabellen som växer obegränsat. Den här migrationen
-- aktiverar pg_cron-extension och schemalägger en timme-vis DELETE.
--
-- CASCADE-deletes på rooms tar med sig lobby_players + lobby_settings
-- automatiskt (FK on delete cascade i 0002/0003). Inga separata jobs
-- behövs för dessa.
--
-- Aktivera pg_cron i Supabase Dashboard under Database > Extensions
-- innan migration:n körs — annars failar CREATE EXTENSION. Alternativt
-- körs CREATE EXTENSION direkt här om service-rollen har CREATE EXTENSION-
-- privileger. På Supabase Cloud sker det vanligtvis via dashboard.
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists pg_cron with schema extensions;

-- Idempotent unschedule innan re-schedule så re-körning av migrations:en
-- inte felar med "job already exists". cron.unschedule är no-op om jobbet
-- saknas, kastas via DO-blocket så missing-jobb-fel inte krashar.
do $$
begin
  perform cron.unschedule('cleanup-expired-rooms');
exception when others then
  null;
end
$$;

-- Kör varje timme på minut 0. DELETE filtrerar på expires_at i passerad
-- tid; CASCADE tar bort lobby_players + lobby_settings för samma rum.
-- Inga locks under långa perioder eftersom DELETE:n bara träffar
-- expired rader (typiskt <100/h även vid hög trafik).
select cron.schedule(
  'cleanup-expired-rooms',
  '0 * * * *',
  $$delete from public.rooms where expires_at < now()$$
);
