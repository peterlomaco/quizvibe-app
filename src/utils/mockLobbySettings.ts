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

export type LobbyGameMode = 'pass-the-phone' | 'individual-devices';
// UI använder capitalized strings; DB lagrar lowercase enligt CHECK-
// constraint. Adapter-funktionerna nedan översätter mellan.
export type LobbyRegion = 'Sweden' | 'Nordics' | 'Europe' | 'Global';
type DbRegion = 'sweden' | 'nordics' | 'europe' | 'global';
export type LobbyAnswerResponse = 15 | 30 | 45 | 60;

export interface LobbySettings {
  gameMode: LobbyGameMode;
  singlePlayerDefault: boolean;
  region: LobbyRegion;
  answerResponseSeconds: LobbyAnswerResponse;
  eraFrom: number;
  eraTo: number;
  roundsCount: number;
  selectedExtraPackages: string[];
  youtubeEnabled: boolean;
  spotifyHostToggle: boolean;
  profilesEnabled: boolean;
}

interface LobbySettingsRow {
  room_code: string;
  game_mode: LobbyGameMode;
  single_player_default: boolean;
  region: DbRegion;
  answer_response_seconds: LobbyAnswerResponse;
  era_from: number;
  era_to: number;
  rounds_count: number;
  selected_extra_packages: string[];
  youtube_enabled: boolean;
  spotify_host_toggle: boolean;
  profiles_enabled: boolean;
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
  return {
    gameMode: row.game_mode,
    singlePlayerDefault: row.single_player_default,
    region: DB_TO_UI_REGION[row.region],
    answerResponseSeconds: row.answer_response_seconds,
    eraFrom: row.era_from,
    eraTo: row.era_to,
    roundsCount: row.rounds_count,
    selectedExtraPackages: row.selected_extra_packages,
    youtubeEnabled: row.youtube_enabled,
    spotifyHostToggle: row.spotify_host_toggle,
    profilesEnabled: row.profiles_enabled,
  };
}

function settingsToRow(code: string, s: LobbySettings): LobbySettingsRow {
  return {
    room_code: code,
    game_mode: s.gameMode,
    single_player_default: s.singlePlayerDefault,
    region: UI_TO_DB_REGION[s.region],
    answer_response_seconds: s.answerResponseSeconds,
    era_from: s.eraFrom,
    era_to: s.eraTo,
    rounds_count: s.roundsCount,
    selected_extra_packages: [...s.selectedExtraPackages],
    youtube_enabled: s.youtubeEnabled,
    spotify_host_toggle: s.spotifyHostToggle,
    profiles_enabled: s.profilesEnabled,
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
