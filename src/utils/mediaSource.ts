// Media-källa per fråga + helper för att välja rätt källa givet host:s
// lobby-toggles och game-mode. Avsiktligt provider-agnostisk så Spotify
// kan plugga in som "kind: 'spotify'" senare utan att röra MediaPlayer-
// komponenten eller call-sites i quiz.tsx.

// Klient-side YoutubeClip-shape. MÅSTE hållas synkad med
// backend/content/schema.ts:YoutubeClipSchema. Fälten matchar pre-curerad
// data som genereras via `npm run youtube-search` i backend.
export interface YoutubeClip {
  videoId: string;
  startSec: number;
  endSec: number;
  channelTitle?: string;
  license?: 'standard' | 'creative-commons';
  notes?: string;
}

// Framtida Spotify-clip-shape. Kvar som planerat fält så pickMediaSource
// kan dispatcha till rätt impl när Spotify-integrationen kommer in.
export interface SpotifyTrack {
  trackUri: string; // 'spotify:track:<id>'
  startMs: number;
  endMs: number;
}

// Diskriminerad union — render-koden i MediaPlayer narrowar via `kind`.
export type MediaSource =
  | { kind: 'youtube'; clip: YoutubeClip }
  | { kind: 'spotify'; track: SpotifyTrack }
  | { kind: 'none'; reason: string };

export interface MediaSourceOptions {
  /** Host har YouTube aktiverad i Lobby:ns Game Connections. */
  youtubeEnabled: boolean;
  /** Host har Spotify aktiverad (auto && hostToggle). */
  spotifyEnabled: boolean;
  /** Spel-läge — Spotify är inkompatibel med Pass-the-Phone (stjäl fokus). */
  gameMode: 'pass-the-phone' | 'individual-devices';
}

// Fråge-shape som pickMediaSource konsumerar. Subset av TimelineQuestion —
// vi tar bara media-fälten så helpers kan testas utan hela quiz-state.
export interface MediaSourceCandidate {
  youtubeClips?: YoutubeClip[];
  spotifyTracks?: SpotifyTrack[];
}

/**
 * Välj den aktiva media-källan för en fråga givet lobby-inställningar.
 * Returnerar `{ kind: 'none', reason }` om ingen källa går att använda
 * — call-site renderar då en placeholder istället för att krascha.
 *
 * Prioritetsordning: YouTube först (fungerar i alla game modes och har
 * bredare content-pool), Spotify som fallback. Rationalen kan ändras till
 * per-fråga eller A/B-test framöver utan att röra call-sites.
 */
export function pickMediaSource(
  question: MediaSourceCandidate,
  options: MediaSourceOptions,
): MediaSource {
  const spotifyCompatibleMode = options.gameMode === 'individual-devices';
  const spotifyAvailable =
    options.spotifyEnabled &&
    spotifyCompatibleMode &&
    !!question.spotifyTracks &&
    question.spotifyTracks.length > 0;

  const youtubeAvailable =
    options.youtubeEnabled &&
    !!question.youtubeClips &&
    question.youtubeClips.length > 0;

  if (youtubeAvailable) {
    return { kind: 'youtube', clip: question.youtubeClips![0] };
  }
  if (spotifyAvailable) {
    return { kind: 'spotify', track: question.spotifyTracks![0] };
  }
  if (!options.youtubeEnabled && !options.spotifyEnabled) {
    return { kind: 'none', reason: 'No media sources enabled in lobby.' };
  }
  // Källor är på men frågan saknar matchande clip — typiskt mock/seed-data
  // utan curerade klipp. Ska bli mindre vanligt när katalogen fylls på.
  return { kind: 'none', reason: 'No media available for this question.' };
}
