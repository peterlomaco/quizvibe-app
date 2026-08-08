-- ─────────────────────────────────────────────────────────────────────
-- 0029_remote_match_guest_alias — Guest alias + server-härledd player_type
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Produktkrav (Peter 2026-08-08): två sorters "Guest" ska behandlas olika
-- i Remote 1v1:
--
--   1. REN GUEST (inget QuizVibe-konto, anon-session) — får inte spela
--      Remote alls. Matchen lever i 48h och ska ligga kvar i historiken;
--      det kräver ett konto att lagra den på. Blockeras klient-side
--      (Home:s HostTypeOptions + guest-join-gate + LobbyScreen-backstop).
--
--   2. REGISTRERAD USER SOM SPELAR SOM GUEST — fullt tillåten. Deras
--      guest-namn blir ett "Guest alias" kopplat till kontot, så
--      motståndaren ser VEM de faktiskt mötte i 1vs1-historiken:
--      "GuestA-1234567 (Anna-42)".
--
-- Två buggar som denna migration fixar i samma andetag:
--
--   • player_type sattes av KLIENTEN från lobby-flaggan isGuestHost
--     (LobbyScreen handleStartGame). En registrerad user som hostade som
--     Guest skrevs därför som 'guest' → guest-retention-cron:en (0027)
--     raderade deras avgjorda match efter 24h trots att båda hade konton.
--   • player_type var därmed också spoofbart av en moddad klient.
--
-- Lösning: RPC:n (SECURITY DEFINER → ser förbi RLS) slår själv upp
-- profiles-raden per user_id. Anon-sessioner skriver ALDRIG någon
-- profiles-rad (profileStorage.getCurrentUser vägrar för is_anonymous),
-- så "profiles-rad finns" ÄR det pålitliga registrerad-testet.
-- Klientens player_type ignoreras helt.
--
-- Signaturen är OFÖRÄNDRAD → inga ändringar krävs i createRemoteMatch-
-- anropet. Den befintliga guest-cleanup-cron:en är också oförändrad; den
-- börjar bara plötsligt bete sig rätt eftersom player_type nu stämmer.
-- ─────────────────────────────────────────────────────────────────────

-- Kontonamnet bakom ett guest-alias. NULL = spelaren använde sitt eget
-- kontonamn (eller har inget konto) → inget alias att visa.
alter table public.remote_match_players
  add column if not exists account_player_name text;

comment on column public.remote_match_players.account_player_name is
  'QuizVibe-kontots player_name när spelaren spelade under ett Guest alias. '
  'NULL när display-namnet redan ÄR kontonamnet, eller när spelaren saknar konto.';

create or replace function public.create_remote_match(
  p_room_code text,
  p_settings jsonb,
  p_players jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  new_id uuid;
  pl jsonb;
  host_count int := 0;
  v_user_id uuid;
  v_display_name text;
  v_account_name text;
  v_type text;
begin
  if caller is null then
    raise exception 'remote match: no authenticated caller' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_players) <> 2 then
    raise exception 'remote match requires exactly 2 players' using errcode = 'P0001';
  end if;
  -- Caller måste vara host-raden i players-payloaden (motståndare kan
  -- inte skapa matchen åt host).
  if not exists (
    select 1 from jsonb_array_elements(p_players) e
    where (e->>'user_id')::uuid = caller and (e->>'is_host')::boolean = true
  ) then
    raise exception 'caller must be the match host' using errcode = 'P0001';
  end if;

  insert into public.remote_matches (
    room_code, rounds_count, answer_response_seconds, era_from, era_to,
    youtube_enabled_categories, images_enabled_categories, selected_extra_packages
  ) values (
    p_room_code,
    coalesce((p_settings->>'rounds_count')::int, 4),
    coalesce((p_settings->>'answer_response_seconds')::int, 30),
    (p_settings->>'era_from')::int,
    (p_settings->>'era_to')::int,
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'youtube_enabled_categories') x),
             array['Music','Film','Sport']::text[]),
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'images_enabled_categories') x),
             array['Music','Film','Sport']::text[]),
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'selected_extra_packages') x),
             array[]::text[])
  ) returning id into new_id;

  for pl in select * from jsonb_array_elements(p_players) loop
    if (pl->>'user_id') is null then
      raise exception 'remote match player missing user_id' using errcode = 'P0001';
    end if;
    if (pl->>'is_host')::boolean then
      host_count := host_count + 1;
    end if;

    v_user_id := (pl->>'user_id')::uuid;
    v_display_name := coalesce(pl->>'player_name', 'Player');

    -- Server-härledd identitet. Klientens 'player_type' ignoreras.
    select p.player_name::text into v_account_name
      from public.profiles p
     where p.id = v_user_id;

    v_type := case when v_account_name is not null then 'registered' else 'guest' end;

    insert into public.remote_match_players (
      match_id, user_id, player_name, is_host, player_type,
      account_player_name, assistance, age
    ) values (
      new_id,
      v_user_id,
      v_display_name,
      coalesce((pl->>'is_host')::boolean, false),
      v_type,
      -- Alias bara när display-namnet skiljer sig från kontonamnet.
      -- citext-kolumnen är case-insensitive; jämförelsen sker på text så
      -- ren skiftlägesskillnad räknas som alias (harmlöst, syns bara).
      case when v_account_name is distinct from v_display_name
           then v_account_name else null end,
      pl->>'assistance',
      (pl->>'age')::int
    );
  end loop;

  if host_count <> 1 then
    raise exception 'remote match requires exactly 1 host' using errcode = 'P0001';
  end if;

  return new_id;
end;
$$;

revoke all on function public.create_remote_match(text, jsonb, jsonb) from public;
grant execute on function public.create_remote_match(text, jsonb, jsonb) to authenticated;
