// Media-källa per fråga + helper för att välja rätt källa givet host:s
// lobby-toggles och game-mode.

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

// Diskriminerad union — render-koden i MediaPlayer narrowar via `kind`.
export type MediaSource =
  | { kind: 'youtube'; clip: YoutubeClip }
  | { kind: 'none'; reason: string };

export interface MediaSourceOptions {
  /** Host har YouTube aktiverad i Lobby:ns Game Connections. */
  youtubeEnabled: boolean;
  /** Spel-läge — bibehållet i typen för framtida källor som kan vara mode-beroende. */
  gameMode: 'pass-the-phone' | 'individual-devices' | 'remote-1v1';
}

// Fråge-shape som pickMediaSource konsumerar. Subset av TimelineQuestion —
// vi tar bara media-fälten så helpers kan testas utan hela quiz-state.
export interface MediaSourceCandidate {
  youtubeClips?: YoutubeClip[];
}

/**
 * Välj den aktiva media-källan för en fråga givet lobby-inställningar.
 * Returnerar `{ kind: 'none', reason }` om ingen källa går att använda
 * — call-site renderar då en placeholder istället för att krascha.
 */
export function pickMediaSource(
  question: MediaSourceCandidate,
  options: MediaSourceOptions,
): MediaSource {
  const youtubeAvailable =
    options.youtubeEnabled &&
    !!question.youtubeClips &&
    question.youtubeClips.length > 0;

  if (youtubeAvailable) {
    return { kind: 'youtube', clip: question.youtubeClips![0] };
  }
  if (!options.youtubeEnabled) {
    return { kind: 'none', reason: 'No media sources enabled in lobby.' };
  }
  // Källan är på men frågan saknar matchande clip — typiskt mock/seed-data
  // utan curerade klipp. Ska bli mindre vanligt när katalogen fylls på.
  return { kind: 'none', reason: 'No media available for this question.' };
}
