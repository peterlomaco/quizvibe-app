-- ─────────────────────────────────────────────────────────────────────
-- 0043_aggregate_game_settings — snapshot av spelinställningar per
--                                Competition-spel, så en re-match/replay
--                                från Home → Competitions kan återanvända
--                                EXAKT samma inställningar som senaste spelet.
-- Applied via Supabase SQL Editor (manuell körning).
--
-- ── Bakgrund ─────────────────────────────────────────────────────────
-- aggregate_leaderboard_games (0037) lagrar bara `stats` (per-spelar-poäng).
-- En re-match via Competitions-fliken (startCompetitionRematch) byggde därför
-- lobbyn från host:ens PROFIL-defaults + hårdkodade värden (inga paket, Parent
-- Control av) — den återanvände INTE inställningarna som competitionens
-- senaste spel faktiskt kördes med.
--
-- Vi kan inte läsa det spelets lobby_settings: rummet har 24h TTL och
-- CASCADE-raderar sin lobby_settings-rad, och en competition ska kunna
-- återupptas "en annan kväll" på en annan enhet. Snapshoten måste därför bo
-- i den sparade serien.
--
-- ── Additivt & regressionsfritt ──────────────────────────────────────
-- Bara en nullable kolumn + en NY RPC. Den befintliga
-- record_aggregate_leaderboard_game RÖRS INTE — bokföringen kan aldrig gå
-- sönder om denna migration inte är körd. Klienten skriver settings via en
-- SEPARAT, fire-and-forget-RPC (degraderar till en warn om den saknas) och
-- läser den via `*`-selecten (undefined tills kolumnen finns). Innan
-- migrationen är körd faller re-matchen tillbaka på profil-defaults precis som
-- förr.
-- ─────────────────────────────────────────────────────────────────────

alter table public.aggregate_leaderboard_games
  add column if not exists settings jsonb;

comment on column public.aggregate_leaderboard_games.settings is
  'Snapshot av spelets tunbara inställningar (era, rundor, svarstid, '
  'käll-kategorier, Host-paket, Parent Control, Spotify) som klienten '
  'AggregateGameSettings-blob. Används för att seeda en re-match-lobby med '
  'samma setup som senaste spelet. Nullable — gamla rader + spel skrivna av '
  'äldre klienter saknar den och faller tillbaka på profil-defaults.';


-- ── RPC: skriv settings-snapshot på ett redan bokfört spel ───────────
-- ⚠ Bara UPDATE. Game-raden skapas av record_aggregate_leaderboard_game, som
--   klienten kör FÖRST och väntar in. Finns ingen matchande rad (race) blir
--   det en no-op — settings sätts vid nästa omskrivning av spelet.
--
-- Samma guard-doktrin som record_aggregate_leaderboard_game: "deltagare".
-- Servern vet inte vem som är host just nu; host-only-regeln bor i klienten.
create or replace function public.set_aggregate_leaderboard_game_settings(
  p_leaderboard_id uuid,
  p_room_code text,
  p_settings jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  code   text := upper(btrim(coalesce(p_room_code, '')));
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if not public.is_aggregate_leaderboard_participant(p_leaderboard_id) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;
  if code = '' then
    raise exception 'room code required' using errcode = 'P0001';
  end if;

  update public.aggregate_leaderboard_games
     set settings = p_settings
   where leaderboard_id = p_leaderboard_id and room_code = code;

  update public.aggregate_leaderboards
     set updated_at = now()
   where id = p_leaderboard_id;
end;
$$;

revoke all on function public.set_aggregate_leaderboard_game_settings(uuid, text, jsonb) from public;
grant execute on function public.set_aggregate_leaderboard_game_settings(uuid, text, jsonb) to authenticated;
