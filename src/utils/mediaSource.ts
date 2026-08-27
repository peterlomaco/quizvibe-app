import { createSeededRng } from './seededRandom';

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
  /**
   * Seed som styr VILKET klipp som väljs när ett item har flera (t.ex. officiell
   * video + lyrics-version). Se `pickMediaSource` för varför den MÅSTE vara delad
   * mellan enheterna. Utelämnad → `Math.random` (enhets-lokal variation, korrekt
   * bara när ingen annan enhet renderar samma fråga).
   */
  clipSeed?: string;
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
 *
 * ETT item kan bära FLERA klipp (t.ex. officiell musikvideo + lyrics-version).
 * Två skäl: omväxling mellan spel, och redundans — går ett klipp sönder kan
 * itemet leva vidare på det andra.
 *
 * ⚠ Valet MÅSTE vara deterministiskt per spel. I Individual Devices renderar
 * varje enhet sin egen media utifrån host:s broadcastade `question_id`, och i
 * remote 1v1 finns ingen sync-kanal alls — utan gemensam seed skulle spelarna
 * se OLIKA videor (och olika startSec) för samma fråga. Skicka därför en
 * `clipSeed` som alla enheter i samma spel delar men som varierar mellan spel;
 * `${matchId ?? roomCode}:${questionId}` uppfyller båda. Seeda ALDRIG på
 * enhets- eller spelarspecifika värden.
 *
 * Klipp-valet påverkar INTE frågehistoriken: `hostQuestionHistory` nycklar på
 * question-id, så ett item som spelats med sitt ena klipp är fortsatt utestängt
 * i 20 spel oavsett vilket klipp som visades.
 */
export function pickMediaSource(
  question: MediaSourceCandidate,
  options: MediaSourceOptions,
): MediaSource {
  const clips = question.youtubeClips;
  const youtubeAvailable = options.youtubeEnabled && !!clips && clips.length > 0;

  if (youtubeAvailable) {
    const pool = clips!;
    if (pool.length === 1) return { kind: 'youtube', clip: pool[0] };
    const rand = options.clipSeed ? createSeededRng(options.clipSeed)() : Math.random();
    // Math.min skyddar mot rand === 1 (kan inte hända med våra RNG:er, men
    // indexet får aldrig hamna utanför listan).
    const idx = Math.min(pool.length - 1, Math.floor(rand * pool.length));
    return { kind: 'youtube', clip: pool[idx] };
  }
  if (!options.youtubeEnabled) {
    return { kind: 'none', reason: 'No media sources enabled in lobby.' };
  }
  // Källan är på men frågan saknar matchande clip — typiskt mock/seed-data
  // utan curerade klipp. Ska bli mindre vanligt när katalogen fylls på.
  return { kind: 'none', reason: 'No media available for this question.' };
}

// ── Spelade källor (Player history + prisutdelningens källkort) ──────────

/**
 * Källor som faktiskt kan SPELAS — till skillnad från `QuestionMediaType`
 * (GetReadyIntro), vars extra `'none'` betyder "ingen media för den frågan".
 */
export type PlayedMediaSource = 'spotify' | 'youtube' | 'image';

/**
 * Kanonisk VISNINGSORDNING: Spotify → YouTube → Hints. Samma ordning som
 * källkorten i prisutdelnings-sekvensen (matchHighlights.ts SOURCE_CARDS).
 * Ändra inte utan nytt beslut.
 */
export const PLAYED_MEDIA_SOURCE_ORDER: PlayedMediaSource[] = ['spotify', 'youtube', 'image'];

/**
 * 'image' heter **Hints** i appen — personbilderna är juridiskt parkerade och
 * det som faktiskt spelas är flagga + progressiva ledtrådar.
 */
export const PLAYED_MEDIA_SOURCE_LABEL: Record<PlayedMediaSource, string> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  image: 'Hints',
};

/**
 * Distinkta källor som faktiskt serverades, i kanonisk ordning.
 * `'none'` och index utanför sekvensen ignoreras.
 */
export function collectPlayedSources(
  sequence: readonly (PlayedMediaSource | 'none')[],
  playedIndices: readonly number[],
): PlayedMediaSource[] {
  const seen = new Set<string>();
  for (const i of playedIndices) {
    const src = sequence[i];
    if (src && src !== 'none') seen.add(src);
  }
  return PLAYED_MEDIA_SOURCE_ORDER.filter((s) => seen.has(s));
}
