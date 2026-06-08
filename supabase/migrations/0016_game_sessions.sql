-- ─────────────────────────────────────────────────────────────────────
-- 0016_game_sessions — Spelresultat + spelarhistorik i Supabase
--
-- Ersätter den nuvarande AsyncStorage-only `gameResults.ts`-lagringen
-- med persistent DB-lagring så Player History synkas cross-device och
-- admin kan bygga globala leaderboards / analytics post-launch.
--
-- Tre tabeller med tydlig ansvarsfördelning:
--
--   game_sessions          — ett spel (rummet + host + inställningar)
--   game_player_results    — varje spelares sammanfattning per spel
--   game_round_results     — varje fråga per spelare (granulär analytics)
--
-- Skalnings-design för 1 000-tals samtida användare:
--   • game_player_results indexerat på user_id — primär läs-path för
--     Player History (SELECT WHERE user_id = auth.uid() ORDER BY played_at DESC).
--   • game_sessions SET NULL på room_code + host_user_id vid DELETE
--     så spelhistorik bevaras även när rum expirerar (24h) eller spel-
--     aren raderar sitt konto.
--   • game_round_results CASCADE på game_session_id — granulär data
--     raderas när sessionen städas bort av pg_cron, inte tvärtom.
--   • Partitionering av game_sessions per månad rekommenderas när
--     tabellen passerar ~5M rader (kräver pg_partman extension i Supabase).
--     Schema är designat partition-ready (played_at ingår i alla index).
--   • Supabase PgBouncer (inbyggd connection pool) hanterar burst-trafik
--     utan schema-ändringar.
--
-- Appliceras manuellt via Supabase SQL Editor (som övriga migrations).
-- ─────────────────────────────────────────────────────────────────────


-- ── game_sessions ────────────────────────────────────────────────────
-- Ett spel = en game_session. Skapas av host när spelet är avslutat
-- (Final Leaderboard renderas) via `appendGameHistoryEntry`-flödet.
--
-- room_code SET NULL: rummet expirerar efter 24h och tas bort av
-- pg_cron (migration 0006). Sessionen ska dock leva kvar i all tid
-- så spelaren kan se historiken. NULL = "rummet är borta men spelet
-- spelades".
--
-- host_user_id SET NULL: om host raderar sitt konto (Edge Function
-- delete-account) bevaras historiken för övriga deltagare. host_
-- player_name (snapshot) ger fortfarande läsbar identitet.

create table public.game_sessions (
  id                        uuid primary key default gen_random_uuid(),

  -- Rumreferens — SET NULL när rum expirerar/raderas
  room_code                 text references public.rooms(code)
                              on delete set null,

  -- Host — SET NULL om konto raderas; snapshot bevaras i kolumnen nedan
  host_user_id              uuid references auth.users(id)
                              on delete set null,
  host_player_name          text not null,   -- snapshot vid speltillfället

  -- Spelinställningar (snapshot vid speltillfället — lobby_settings kan
  -- ändras eller raderas; vi vill visa exakta villkor för varje spel)
  game_mode                 text not null
                              check (game_mode in ('pass-the-phone','individual-devices','single-player')),
  rounds_played             int  not null default 0,   -- faktiska rundor (kan < rounds_count om quit)
  answer_response_seconds   int  not null default 30
                              check (answer_response_seconds in (15,30,45,60)),
  era_from                  int  not null,
  era_to                    int  not null,
  region                    text not null default 'global'
                              check (region in ('sweden','nordics','europe','global')),
  youtube_enabled_categories text[] not null default array['Music','Film','Sport']::text[],
  images_enabled_categories  text[] not null default array['Music','Film','Sport']::text[],
  selected_extra_packages    text[] not null default array[]::text[],
  spotify_enabled           boolean not null default false,

  -- Tidpunkter
  started_at                timestamptz not null default now(),
  ended_at                  timestamptz,            -- null = spelet avbruten (Quit)
  created_at                timestamptz not null default now()
);

-- Index: host söker sin historik på Profile-skärmen
create index game_sessions_host_idx
  on public.game_sessions (host_user_id, started_at desc);

-- Index: globala leaderboard-queries per tidsperiod (post-launch)
create index game_sessions_started_at_idx
  on public.game_sessions (started_at desc);

-- Index: eventuell lookup "alla spel för detta rum" (admin / debug)
create index game_sessions_room_idx
  on public.game_sessions (room_code)
  where room_code is not null;

-- ── RLS: game_sessions ────────────────────────────────────────────────
alter table public.game_sessions enable row level security;

-- Alla deltagare ska kunna läsa sessioner de var med i.
-- Enklaste approach för V1: SELECT öppet för authenticated.
-- Post-launch: byt till EXISTS (SELECT 1 FROM game_player_results WHERE
-- game_session_id = id AND user_id = auth.uid()) för striktare isolering.
create policy "authenticated can read game sessions"
  on public.game_sessions for select
  to authenticated
  using (true);

-- Host skapar sessionen (INSERT sker på host:s enhet vid game end)
create policy "host can insert game session"
  on public.game_sessions for insert
  to authenticated
  with check (auth.uid() = host_user_id);

-- Host kan uppdatera sessionen (t.ex. sätta ended_at)
create policy "host can update own game session"
  on public.game_sessions for update
  to authenticated
  using (auth.uid() = host_user_id);


-- ── game_player_results ──────────────────────────────────────────────
-- En rad per spelare per spel. Driver Player History-sektionen på
-- Profile-skärmen. Speglar HistoryEntry-interfacet i gameResults.ts
-- men med user_id + normalisering för cross-device sync.
--
-- user_id SET NULL: om spelare raderar konto försvinner koppling men
-- historiken bevaras som anonymous rad (player_name snapshot lever kvar).
-- Relevant för host som vill se "vem som vann" historiskt även om en
-- spelare later raderar sitt konto.
--
-- Guests (type='guest') har user_id = null från start.

create table public.game_player_results (
  id                    uuid primary key default gen_random_uuid(),

  game_session_id       uuid not null references public.game_sessions(id)
                          on delete cascade,

  -- Spelar-identitet (snapshot vid speltillfället)
  user_id               uuid references auth.users(id)
                          on delete set null,
  player_name           text not null,
  player_type           text not null default 'registered'
                          check (player_type in ('registered','guest','manual')),
  player_age            int,                      -- beräknad ålder vid speltillfället
  assistance            text
                          check (assistance in ('minimal','standard','full')),

  -- Spelresultat
  rank                  int,                      -- slutlig plats (1-baserat), null = quit
  correct_answers       int  not null default 0,
  total_questions       int  not null default 0,
  total_points          int  not null default 0,
  avg_response_seconds  numeric(6,3),             -- 3 decimaler räcker (< 60.000s)
  last_response_seconds numeric(6,3),             -- sista frågans svarstid

  -- Tidpunkt — denormaliserat från game_sessions för snabbare History-queries
  -- (undviker JOIN game_sessions vid varje "ladda min historik"-anrop)
  played_at             timestamptz not null default now(),

  created_at            timestamptz not null default now()
);

-- ── Primär index: Player History ──────────────────────────────────────
-- Allra viktigaste indexet — används VARJE gång en user öppnar Profile.
-- Täcker både SELECT och ORDER BY i en enda index-scan.
create index game_player_results_user_history_idx
  on public.game_player_results (user_id, played_at desc)
  where user_id is not null;

-- Index: hämta alla deltagare för ett specifikt spel (leaderboard-vy)
create index game_player_results_session_idx
  on public.game_player_results (game_session_id);

-- Index: admin analytics — rank-distribution, assistance-distribution etc.
create index game_player_results_rank_idx
  on public.game_player_results (rank)
  where rank is not null;

-- ── RLS: game_player_results ──────────────────────────────────────────
alter table public.game_player_results enable row level security;

-- Spelare läser bara sin egen historik (primary use case: Player History)
create policy "user reads own player results"
  on public.game_player_results for select
  to authenticated
  using (user_id = auth.uid());

-- Authenticated kan INSERT — host skriver alla spelares rader vid game end
-- (IndDev: varje device skriver sin egen rad; PtP: host skriver alla)
create policy "authenticated can insert player results"
  on public.game_player_results for insert
  to authenticated
  with check (true);


-- ── game_round_results ───────────────────────────────────────────────
-- Granulär data: en rad per (spel × spelare × fråga).
-- Valfritt för V1-launch — aktiveras när analytics-behov uppstår.
-- Primärt värde: "vilka frågor är svårast?" / "vilka items behöver
-- bytas?" / "hur varierar svarstid per kategori?".
--
-- Cascade: raderas automatiskt när game_session raderas av pg_cron
-- (migration 0006 städar rum; ett liknande jobb bör städa game_sessions
-- äldre än 365 dagar — se pg_cron-block nedan).
--
-- Storlek-estimat: 1 000 samtida spel × 10 spelare × 10 rundor =
-- 100 000 rader per spelomgång. Med 2-timmars sessioner × 12 per dag =
-- 1.2M rader/dag → ~440M/år. Partitionera game_sessions + cascade
-- ger hanterbar tillväxt.

create table public.game_round_results (
  id                  uuid primary key default gen_random_uuid(),

  game_session_id     uuid not null references public.game_sessions(id)
                        on delete cascade,

  -- Koppling till player (denormaliserat för snabb lookup utan JOIN)
  user_id             uuid references auth.users(id) on delete set null,
  player_name         text not null,

  -- Fråge-metadata (snapshot)
  question_index      int  not null,              -- 0-baserat i spelets ordning
  question_type       text not null
                        check (question_type in ('timeline','image')),
  content_item_id     text,                       -- item.id från katalog (t.ex. 'abba')
  content_subject     text,                       -- 'song','artist','athlete' etc.
  main_category       text
                        check (main_category in ('Music','Film','Sport')),

  -- Svar
  correct             boolean not null,
  points              int  not null default 0,
  time_used_seconds   numeric(6,3) not null,      -- exakt elapsed (Date.now-diff)

  -- För timeline-frågor (null för image-frågor)
  correct_year        int,
  selected_year       int,

  created_at          timestamptz not null default now()
);

-- Täcker den vanligaste analytics-frågan: "hur svårt är varje content-item?"
create index game_round_results_item_idx
  on public.game_round_results (content_item_id, correct)
  where content_item_id is not null;

-- Täcker "alla rundor för ett spel" (admin-vy / debug)
create index game_round_results_session_idx
  on public.game_round_results (game_session_id);

-- Täcker "alla rundor för en specifik user" (framtida per-user analytics)
create index game_round_results_user_idx
  on public.game_round_results (user_id, created_at desc)
  where user_id is not null;

-- ── RLS: game_round_results ───────────────────────────────────────────
alter table public.game_round_results enable row level security;

create policy "user reads own round results"
  on public.game_round_results for select
  to authenticated
  using (user_id = auth.uid());

create policy "authenticated can insert round results"
  on public.game_round_results for insert
  to authenticated
  with check (true);


-- ── pg_cron: städa gamla game_sessions ───────────────────────────────
-- Bör aktiveras när spel-volymen växer. Kräver att pg_cron-extension
-- är enabled i Supabase (Dashboard → Database → Extensions).
-- Cascade raderar automatiskt game_player_results + game_round_results.
--
-- Kommenterat tills Peter aktiverar pg_cron via Dashboard:
--
-- select cron.schedule(
--   'cleanup-old-game-sessions',
--   '0 3 * * *',    -- kör 03:00 UTC varje natt
--   $$
--     delete from public.game_sessions
--     where started_at < now() - interval '365 days'
--       and ended_at is not null;  -- behåll avbrutna spel lite längre
--   $$
-- );
