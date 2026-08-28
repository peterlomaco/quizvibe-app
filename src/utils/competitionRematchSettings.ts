// Ren logik för Competition-rematchens settings-reuse (migration 0043).
//
// Bryts ut hit — utan React/RN/Supabase-beroenden — så den kan enhetstestas i
// vitest (samma mönster som hcpEngine.ts / epochAllocation.ts / mediaSource.ts).
// competitionRematch.ts (bygger lobby-settings) och aggregateLeaderboards.ts
// (väljer senaste spelets snapshot) använder BÅDA dessa funktioner så
// beslutslogiken bor på ETT ställe.
//
// `import type` nedan är helt erased vid kompilering → ingen runtime-import av
// de Supabase-kopplade modulerna, så denna fil förblir vitest-importbar.

import type { AggregateGameSettings } from './aggregateLeaderboards';
import { defaultEnabledMainCategories } from './mainCategory';
import type { LobbySettings } from './mockLobbySettings';

const CURRENT_YEAR = new Date().getFullYear();

type MainCat = LobbySettings['youtubeEnabledCategories'][number];

function isMainCat(v: string): v is MainCat {
  return v === 'Music' || v === 'Film' || v === 'Sport';
}

/** Strukturell validering av en snapshot ur DB (jsonb kan vara vad som helst). */
export function isGameSettings(v: unknown): v is AggregateGameSettings {
  if (!v || typeof v !== 'object') return false;
  const s = v as AggregateGameSettings;
  return (
    typeof s.eraFrom === 'number' &&
    typeof s.eraTo === 'number' &&
    typeof s.roundsCount === 'number' &&
    typeof s.answerResponseSeconds === 'number'
  );
}

/**
 * Väljer settings-snapshoten från det SENAST spelade spelet (max `played_at`)
 * som har en giltig snapshot. Rader utan snapshot (äldre spel / gäst-blandat /
 * migration ej körd) hoppas över. Null om ingen giltig finns.
 */
export function pickLatestGameSettings(
  games: { played_at?: string; settings?: AggregateGameSettings | null }[],
): AggregateGameSettings | null {
  let best: { at: number; settings: AggregateGameSettings } | null = null;
  for (const g of games) {
    if (!isGameSettings(g.settings)) continue;
    const at = g.played_at ? new Date(g.played_at).getTime() : 0;
    if (!best || at >= best.at) best = { at, settings: g.settings };
  }
  return best?.settings ?? null;
}

export interface RematchSettingsInput {
  /** Senaste spelets snapshot (0043). Vinner över profil-defaults när den finns. */
  settings?: AggregateGameSettings | null;
  /** Host:ens profil-defaults (fallback när ingen snapshot finns). */
  eraFrom?: number;
  eraTo?: number;
  roundsCount?: number;
  answerResponseSeconds?: 30 | 45 | 60;
  region?: LobbySettings['region'];
}

/**
 * Bygger settings-bloben för re-match-lobbyn. Innehålls-inställningarna (era,
 * rundor, svarstid, käll-kategorier, Host-paket, Spotify) ÅTERANVÄNDS från
 * senaste spelets snapshot (`settings`) när den finns — annars host:ens
 * profil-defaults, annars hårdkodat. STRUKTURELLA fält
 * (gameMode/singlePlayerDefault/maxPlayers) härleds alltid av lobbytypen:
 * multi är per definition Individual Devices (inbjudna spelar remote på egna
 * enheter), och en solo-lobby forceras till single av lobbyType-paramet — så
 * en PtP-snapshot kan aldrig återuppstå felaktigt.
 *
 * ⚠ Parent Control ingår MEDVETET inte via denna blob — fältet persisteras
 *   aldrig i lobby_settings (settingsToRow skriver det inte). Det bärs i
 *   stället som `parentControl`-URL-param av CompetitionRematchActions.
 */
export function buildRematchSettings(
  opts: RematchSettingsInput,
  maxPlayers: 4 | 12,
): LobbySettings {
  const all = defaultEnabledMainCategories();
  const last = opts.settings ?? null;
  const ytCats = last?.youtubeEnabledCategories?.filter(isMainCat);
  const imgCats = last?.imagesEnabledCategories?.filter(isMainCat);
  return {
    // Individual Devices — de inbjudna spelar på egna enheter (remote join).
    gameMode: 'individual-devices',
    singlePlayerDefault: false,
    maxPlayers,
    region: opts.region ?? 'Global',
    answerResponseSeconds:
      last?.answerResponseSeconds === 30 ||
      last?.answerResponseSeconds === 45 ||
      last?.answerResponseSeconds === 60
        ? last.answerResponseSeconds
        : opts.answerResponseSeconds ?? 30,
    eraFrom: last?.eraFrom ?? opts.eraFrom ?? 1970,
    eraTo: last?.eraTo ?? opts.eraTo ?? CURRENT_YEAR,
    roundsCount: last?.roundsCount ?? opts.roundsCount ?? 4,
    selectedExtraPackages: last?.selectedExtraPackages ?? [],
    youtubeEnabledCategories: ytCats && ytCats.length > 0 ? ytCats : [...all],
    imagesEnabledCategories: imgCats && imgCats.length > 0 ? imgCats : [...all],
    sketchEnabled: false,
    spotifyEnabled: last?.spotifyEnabled ?? false,
    spotifyAnswerYear: true,
    spotifyAnswerName: true,
    parentControlEnabled: false,
    remoteAssistance: 'full',
    mutualAssistanceEnabled: false,
  };
}
