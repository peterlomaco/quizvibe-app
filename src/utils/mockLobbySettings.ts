// Lobby-settings-registry — Fas 3 Slice B.
//
// Tidigare en sessionsbunden Map (mock); från Slice 3B backas detta av
// Supabase `lobby_settings`-tabellen så host:s val syncas cross-device via
// Realtime-broadcasts. Filnamnet behålls tills hela bunten är portad.
//
// Skriv-mönster: bara host (RLS "host manages lobby settings" enforce:as
// server-side via JOIN mot rooms.host_user_id = auth.uid()).
// Läs-mönster: anyone — non-host:s LobbyScreen prenumererar via Realtime
// + initial-load via getLobbySettings.

import { supabase } from './supabase';
import { MainCategory, defaultEnabledMainCategories, isMainCategory, IMAGES_MANDATORY_CATEGORIES } from './mainCategory';

export type LobbyGameMode = 'pass-the-phone' | 'individual-devices' | 'remote-1v1';
// UI använder capitalized strings; DB lagrar lowercase enligt CHECK-
// constraint. Adapter-funktionerna nedan översätter mellan.
export type LobbyRegion = 'Sweden' | 'Nordics' | 'Europe' | 'Global';
type DbRegion = 'sweden' | 'nordics' | 'europe' | 'global';
export type LobbyAnswerResponse = 30 | 45 | 60;

export interface LobbySettings {
  gameMode: LobbyGameMode;
  singlePlayerDefault: boolean;
  // 2 = Remote 1v1 (låst), 4 = Basic, 12 = Premium IndDev.
  maxPlayers: 2 | 4 | 12;
  region: LobbyRegion;
  answerResponseSeconds: LobbyAnswerResponse;
  eraFrom: number;
  eraTo: number;
  roundsCount: number;
  selectedExtraPackages: string[];
  // Per-source profession-category-filter.
  // YouTube: alla tre är valbara, min 1 krävs (guard i handleToggleYoutubeCategory).
  // Guess Where? (platsfrågor): proxy via imagesEnabledCategories:
  //   length > 0 = Where? aktiv (städer/länder inkluderas i quiz-pool)
  //   length === 0 = Where? inaktiv
  //   Personbilder ("Guess Who?") är juridiskt parkerade och aldrig i poolen.
  youtubeEnabledCategories: MainCategory[];
  imagesEnabledCategories: MainCategory[];
  // "Profiles"-källan har två under-toggles i Lobby:n: Images (foto, 1+2) och
  // Sketch (doodle, 4). sketchEnabled är förberedd men doodlen är INTE wirad
  // till quiz-poolen ännu (prototyp) → toggeln är strukturell. Default false.
  sketchEnabled: boolean;
  // Spotify DJ-läge: host aktiverar → DJ-rotation körs i quiz.tsx.
  // Kräver att alla spelare har spotify_verified = true i lobby_players.
  // DB-kolumn: lobby_settings.spotify_enabled (migration 0015 måste vara applicerad).
  spotifyEnabled: boolean;
  // Spotify-svarstyper (tolerant fallback via ?? true — ingen DB-migration krävs för V1).
  spotifyAnswerYear: boolean;
  spotifyAnswerName: boolean;
}

interface LobbySettingsRow {
  room_code: string;
  game_mode: LobbyGameMode;
  single_player_default: boolean;
  // Optional tills migration 0019_lobby_settings_max_players.sql körts.
  max_players?: number;
  region: DbRegion;
  answer_response_seconds: LobbyAnswerResponse;
  era_from: number;
  era_to: number;
  rounds_count: number;
  selected_extra_packages: string[];
  // Gamla source-kolumner bevaras för bakåt-kompatibilitet (skrivs av settingsToRow
  // tills migration 0014 körts och kommentarerna nedan aktiveras).
  youtube_enabled: boolean;
  images_enabled: boolean;
  enabled_main_categories: string[];
  // Migration 0014: nya per-source category-kolumner — läses med tolerant fallback
  // (undefined om kolumnen ännu ej finns = migration ej applicerad).
  youtube_enabled_categories?: string[];
  images_enabled_categories?: string[];
  // Optional tills migration 0013_sketch_enabled.sql körts (tolerant read).
  sketch_enabled?: boolean;
  // Optional tills migration 0015_spotify_connections.sql körts (tolerant read).
  spotify_enabled?: boolean;
  // Spotify-svarstyper. Optional tills kolumnerna lagts till (tolerant read via ?? true).
  spotify_answer_year?: boolean;
  spotify_answer_name?: boolean;
}

const UI_TO_DB_REGION: Record<LobbyRegion, DbRegion> = {
  Sweden: 'sweden',
  Nordics: 'nordics',
  Europe: 'europe',
  Global: 'global',
};
const DB_TO_UI_REGION: Record<DbRegion, LobbyRegion> = {
  sweden: 'Sweden',
  nordics: 'Nordics',
  europe: 'Europe',
  global: 'Global',
};

function rowToSettings(row: LobbySettingsRow): LobbySettings {
  // Tolerant read: nya category-kolumner tas om de finns (migration 0014),
  // annars fall-back mot gamla bool-kolumner + defaultvärden.
  const ytCatsRaw = row.youtube_enabled_categories;
  const imgCatsRaw = row.images_enabled_categories;
  // null = kolumnen saknas (pre-migration 0014) → använd legacy-fallback.
  // [] = kolumnen finns men host har explicit stängt av allt → respektera [].
  const ytCats = ytCatsRaw != null ? ytCatsRaw.filter(isMainCategory) as MainCategory[] : null;
  const imgCats = imgCatsRaw != null ? imgCatsRaw.filter(isMainCategory) as MainCategory[] : null;
  return {
    gameMode: row.game_mode,
    singlePlayerDefault: row.single_player_default,
    maxPlayers: row.max_players === 12 ? 12 : row.max_players === 2 ? 2 : 4,
    region: DB_TO_UI_REGION[row.region],
    answerResponseSeconds: row.answer_response_seconds,
    eraFrom: row.era_from,
    eraTo: row.era_to,
    roundsCount: row.rounds_count,
    selectedExtraPackages: row.selected_extra_packages,
    // Kolumn finns (migration 0014) → använd direkt, inkl. [] (explicit av).
    // Saknas (null, pre-migration) → fall-back mot legacy bool-kolumn.
    youtubeEnabledCategories: ytCats !== null
      ? ytCats
      : (row.youtube_enabled !== false ? defaultEnabledMainCategories() : []),
    imagesEnabledCategories: imgCats !== null
      ? imgCats
      : [...new Set([...IMAGES_MANDATORY_CATEGORIES,
          ...(row.images_enabled !== false ? (['Music'] as MainCategory[]) : []),
        ]) as unknown as MainCategory[]],
    // Tolerant: kolumnen kanske inte finns ännu (pre-migration) → default false.
    sketchEnabled: row.sketch_enabled ?? false,
    spotifyEnabled: row.spotify_enabled ?? false,
    // Tolerant: kolumner kanske inte finns ännu → default true (båda aktiva).
    spotifyAnswerYear: row.spotify_answer_year ?? true,
    spotifyAnswerName: row.spotify_answer_name ?? true,
  };
}

function settingsToRow(code: string, s: LobbySettings): LobbySettingsRow {
  return {
    room_code: code,
    game_mode: s.gameMode,
    single_player_default: s.singlePlayerDefault,
    max_players: s.maxPlayers,
    region: UI_TO_DB_REGION[s.region],
    answer_response_seconds: s.answerResponseSeconds,
    era_from: s.eraFrom,
    era_to: s.eraTo,
    rounds_count: s.roundsCount,
    selected_extra_packages: [...s.selectedExtraPackages],
    // Gamla source-kolumner skrivs fortsatt för bakåt-kompatibilitet tills
    // migration 0014 körts. Härleds från nya category-arrays.
    youtube_enabled: s.youtubeEnabledCategories.length > 0,
    images_enabled: true, // Images alltid aktiv (Film+Sport mandatory)
    enabled_main_categories: defaultEnabledMainCategories(), // legacy — ej längre använt av klienten
    // OBS: sketch_enabled skrivs INTE ännu — kolumnen finns inte förrän
    // migration 0013_sketch_enabled.sql körts, och en upsert mot en okänd
    // kolumn skulle faila HELA settings-skrivningen → bryta all lobby-sync.
    // sketch_enabled: s.sketchEnabled,
    //
    // Migration 0014 aktiverat — per-source category-kolumner skrivs nu.
    youtube_enabled_categories: [...s.youtubeEnabledCategories],
    images_enabled_categories: [...s.imagesEnabledCategories],
    // Migration 0015: spotify_enabled-kolumn. Kräver att migration körs
    // i Supabase manuellt — se supabase/migrations/0015_spotify_connections.sql.
    spotify_enabled: s.spotifyEnabled,
    // Spotify answer-type-kolumner. Kolumnerna saknas i DB tills migration körs.
    // Kommenterat ut (samma mönster som sketch_enabled) — en upsert mot okänd
    // kolumn failor HELA settings-skrivningen → bryter all lobby-sync.
    // rowToSettings läser via ?? true så default-beteendet (båda aktiva) gäller.
    // spotify_answer_year: s.spotifyAnswerYear,
    // spotify_answer_name: s.spotifyAnswerName,
  };
}

function normalizeCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Host: UPSERT host-settings till lobby_settings (1:1 mot rooms via PK).
 * Anropas av useEffect på alla settings-state-deps, gated på hostMode.
 *
 * RLS-policy "host manages lobby settings" enforce:as server-side så bara
 * host:s session får skriva — UI:t måste oavsett gate:a anropet på
 * hostMode för att undvika onödiga rejected writes.
 */
export async function setLobbySettings(code: string, settings: LobbySettings): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  const row = settingsToRow(normalized, settings);
  const { error } = await supabase
    .from('lobby_settings')
    .upsert(row, { onConflict: 'room_code' });
  if (error) {
    console.warn('[lobbySettings] setLobbySettings upsert failed:', error.message);
  }
}

/**
 * Returnerar host:s aktuella settings-blob för rummet. undefined om host
 * ännu inte har skrivit (typiskt: non-host joinar via test-seed-kod eller
 * fresh kod där host inte hunnit första-write:a settings).
 */
export async function getLobbySettings(code: string): Promise<LobbySettings | undefined> {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  const { data, error } = await supabase
    .from('lobby_settings')
    .select('*')
    .eq('room_code', normalized)
    .maybeSingle();
  if (error) {
    console.warn('[lobbySettings] getLobbySettings query failed:', error.message);
    return undefined;
  }
  return data ? rowToSettings(data as LobbySettingsRow) : undefined;
}

/**
 * Rensar storen för en rumkod. Anropas av host:s "Delete this Game Lobby"
 * + handleCreateGame / Play Again-flödena. CASCADE från rooms tar bort
 * rader automatiskt, men explicit DELETE som belt-and-suspenders.
 *
 * Idempotent — clear på okänd kod är no-op.
 */
export async function clearLobbySettings(code: string): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  const { error } = await supabase.from('lobby_settings').delete().eq('room_code', normalized);
  if (error) {
    console.warn('[lobbySettings] clearLobbySettings failed:', error.message);
  }
}

// ── D-iv: host-styrt per-spelare audio i Individual Devices ──────────
//
// Storas som en jsonb-map på lobby_settings.player_audio_overrides
// (column tillagd i migration 0007). Egen helper-yta separat från
// setLobbySettings så LobbyScreen:s debounced settings-save inte rör
// kolumnen — den modifieras bara av quiz.tsx:s audio-toggle-callback.
// Schema: { [lobby_players.player_id]: boolean }, where true = audio på.

export type PlayerAudioOverrides = Record<string, boolean>;

/**
 * Läser nuvarande audio-overrides-map för rummet. Tom map om kolumnen
 * är default-värdet eller om rummet saknas i lobby_settings.
 */
export async function getPlayerAudioOverrides(code: string): Promise<PlayerAudioOverrides> {
  if (!code) return {};
  const normalized = normalizeCode(code);
  const { data, error } = await supabase
    .from('lobby_settings')
    .select('player_audio_overrides')
    .eq('room_code', normalized)
    .maybeSingle();
  if (error) {
    console.warn('[lobbySettings] getPlayerAudioOverrides failed:', error.message);
    return {};
  }
  return (data?.player_audio_overrides as PlayerAudioOverrides | null) ?? {};
}

/**
 * Sätter audio-state för EN spelare i rummet. Atomisk read-modify-write
 * via direct UPDATE på jsonb-kolumnen — bara denna kolumn rörs så
 * LobbyScreen:s konkurrerande setLobbySettings-upsert inte kan
 * krocka. RLS "host manages lobby settings" gör att bara host:s
 * session får skriva (call-sites ska oavsett gate:a på hostMode).
 *
 * Inkrementell broadcast (player_audio_state_changed) sker SEPARAT
 * från denna helper — call-site i quiz.tsx anropar både db-skrivning
 * och syncChannel.broadcastPlayerAudioStateChanged efter varandra.
 */
export async function setPlayerAudioOverride(
  code: string,
  playerId: string,
  audioOn: boolean,
): Promise<void> {
  if (!code || !playerId) return;
  const normalized = normalizeCode(code);
  const current = await getPlayerAudioOverrides(normalized);
  const next: PlayerAudioOverrides = { ...current, [playerId]: audioOn };
  const { error } = await supabase
    .from('lobby_settings')
    .update({ player_audio_overrides: next })
    .eq('room_code', normalized);
  if (error) {
    console.warn('[lobbySettings] setPlayerAudioOverride failed:', error.message);
  }
}
