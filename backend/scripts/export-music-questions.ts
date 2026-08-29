// Genererar src/utils/musicQuestions.ts med alla items i songs-katalogen
// som har minst ett youtubeClip. Driver musik-frågorna i app/quiz.tsx —
// klienten importerar MUSIC_QUESTIONS direkt och slipper köra mot backend
// runtime.
//
// Kör: cd backend && npm run export-music-questions

import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import { Audience, FIXED_QUESTION_TEXT } from '../content/schema';

interface ExportedYoutubeClip {
  videoId: string;
  startSec: number;
  endSec: number;
  channelTitle?: string;
  license?: 'standard' | 'creative-commons';
  notes?: string;
}

type YoutubeContentSubject = 'song' | 'movie' | 'sport-event';

interface ExportedMusicQuestion {
  id: string;
  displayName: string;
  /** Obligatorisk för timeline-frågor; utelämnas för actor-select. */
  correctYear?: number;
  /** Subject från katalogens contentSubject — driver frågetext-lookup på klienten.
   *  'song' för musik (songs-*.yaml), 'movie' för film (movies-*.yaml),
   *  'sport-event' för sporthändelser. Alla 3 är youtube-form. */
  contentSubject: YoutubeContentSubject;
  /** Frågetext från FIXED_QUESTION_TEXT[contentSubject] eller override för
   *  actor-select. Inline:as i exporten så klienten slipper rebakad lookup-tabell. */
  questionText: string;
  /** Item-HCP (§4.1) = katalogens probability (0–100). Driver klientens
   *  HCP-frågefilter: item valbart om itemHcp >= spelarens HCP. */
  itemHcp: number;
  /** Generationer som item:et är curerat för — kopieras från file-header
   *  audience eller item-override. Driver klient-side audience-filtret. */
  audiences: Audience[];
  /** Genre/tema-paket-taggar (t.ex. ["sport"]). Emittas bara när non-empty.
   *  Driver klientens crossover-filter (sport-musik surfar under Music+Sport). */
  genrePackages?: string[];
  /** false = paket-exklusiv (spelas bara när ett matchande Host-paket är aktivt).
   *  Emittas bara när false — utelämnat = default true = med i baspoolen. */
  inBaseCatalog?: boolean;
  /** Geografisk igenkännings-scope. Item-level overridar fil-header.
   *  'unknown-region' = ej i base-pool (reserverat för host-paket). */
  region: string[];
  /** Parent control-tagg. true = filtreras bort när host har Parent Control på.
   *  Emittas bara när true (default false = alltid med). */
  parentControlled?: boolean;
  youtubeClips: ExportedYoutubeClip[];
  /** actor-select: true = animerad film (karaktärnamn), false/utelämnat = live-action (skådespelarnamn). */
  isAnimated?: boolean;
  /** actor-select: godkända svar (1–2 namn; spela räcker att välja ett). */
  correctNames?: string[];
  /** actor-select: felaktiga svarsalternativ som visas i namnlistan. */
  distractorNames?: string[];
}

function renderTsModule(questions: ExportedMusicQuestion[]): string {
  return `// Auto-generated music questions. Regenerate with:
//   cd backend && npm run export-music-questions
//
// Source: backend/content/catalog/songs-*.yaml

import type { YoutubeClip } from './mediaSource';

export type MusicQuestionAudience =
  | 'elder'
  | 'gen-x'
  | 'millennials'
  | 'gen-z'
  | 'gen-alpha'
  | 'all';

export type YoutubeContentSubject = 'song' | 'movie' | 'sport-event';

export interface MusicQuestion {
  id: string;
  displayName: string;
  /** Finns för timeline-frågor; saknas för actor-select (film-frågor). */
  correctYear?: number;
  contentSubject: YoutubeContentSubject;
  questionText: string;
  /** Item-HCP (§4.1) = katalogens probability (0–100). Klientens HCP-filter
   *  väljer item om itemHcp >= spelarens HCP (relaxas om poolen blir för tunn). */
  itemHcp: number;
  audiences: MusicQuestionAudience[];
  genrePackages?: string[];
  /** false = paket-exklusiv (spelas bara när matchande Host-paket är aktivt).
   *  Utelämnat = default true = med i baspoolen. */
  inBaseCatalog?: boolean;
  /** Geografisk igenkännings-scope. Item-level overridar fil-header.
   *  'unknown-region' = ej i base-pool; filtreras bort i SEED_QUESTIONS. */
  region: string[];
  /** Parent control-tagg. true = klippet filtreras bort ur frågeurvalet när
   *  host har Parent Control påslaget. Sätts i YAML (default false). */
  parentControlled?: boolean;
  youtubeClips: YoutubeClip[];
  /** Spotify track ID — satt manuellt i YAML för Spotify DJ-läge. */
  spotifyTrackId?: string;
  /** actor-select: true = animerad film (frågar karaktärnamn), annars skådespelarnamn. */
  isAnimated?: boolean;
  /** actor-select: godkända svar (räcker att välja ett). */
  correctNames?: string[];
  /** actor-select: felaktiga svarsalternativ. */
  distractorNames?: string[];
}

export const MUSIC_QUESTIONS: MusicQuestion[] = ${JSON.stringify(questions, null, 2)};
`;
}

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const songs: ExportedMusicQuestion[] = [];
  const skipped: string[] = [];

  for (const file of catalog.files.values()) {
    // YouTube-pool: alla youtube-form items oavsett kategori. file.category
    // är 'songs' även för movies-classics.yaml (approximation eftersom
    // CategorySchema saknar 'movies'). Filtrera istället på contentForm.
    if (file.contentForm !== 'youtube') continue;
    for (const item of file.items) {
      // inBaseCatalog=false → item är paket-exklusivt (spelas bara när ett
      // matchande Host-paket är aktivt). Vi EMITTERAR det numera (med flaggan
      // nedan) så klienten kan inkludera det när paketet är valt; klientens
      // baspool-filter exkluderar det när inget paket är aktivt.
      // Inkludera item om det har youtubeClips ELLER spotifyTrackId.
      // Spotify-only items (utan YouTube-klipp) är renodlade DJ-rundor.
      const hasYoutube = !!(item.youtubeClips && item.youtubeClips.length > 0);
      const hasSpotify = !!item.spotifyTrackId;
      if (!hasYoutube && !hasSpotify) {
        skipped.push(`${item.id} (no youtubeClips and no spotifyTrackId)`);
        continue;
      }
      // actor-select items (filmer) behöver inget correctYear — svaret är
      // ett skådespelar-/karaktärnamn, inte ett år.
      const isActorSelect = item.answerMethods.includes('actor-select');
      if (!isActorSelect && item.correctYear === undefined) {
        skipped.push(`${item.id} (no correctYear)`);
        continue;
      }
      // contentSubject + questionText från fil-header (file-level i V1).
      // Type-cast pga TS-narrowing — schema garanterar att youtube-form
      // bara har 'song' | 'movie' | 'sport-event'.
      const subject = file.contentSubject as 'song' | 'movie' | 'sport-event';
      // actor-select: frågetext beror på om filmen är animerad.
      const questionText = isActorSelect
        ? (item.isAnimated
            ? 'What is the name of the main character in this film?'
            : 'Select one of the main actors in this film?')
        : FIXED_QUESTION_TEXT[subject];
      songs.push({
        id: item.id,
        displayName: item.displayName,
        // correctYear behövs bara för timeline-frågor (scoring + display).
        ...(item.correctYear !== undefined ? { correctYear: item.correctYear } : {}),
        contentSubject: subject,
        questionText,
        // Item-HCP (§4.1) = curator-satt probability (0–100).
        itemHcp: item.probability,
        // Item-level audience-override har företräde över file-header.
        audiences: item.audience ?? file.audience,
        // Item-level region-override har företräde över fil-header.
        // 'unknown-region' → filtreras bort i SEED_QUESTIONS på klienten.
        region: item.region ?? file.region,
        // genrePackages (t.ex. ["sport"]) — bara när non-empty.
        ...(item.genrePackages.length ? { genrePackages: item.genrePackages } : {}),
        // inBaseCatalog — bara när false (paket-exklusiv). Default true utelämnas.
        ...(item.inBaseCatalog === false ? { inBaseCatalog: false } : {}),
        // Parent control — bara när true (default false = alltid med).
        ...(item.parentControlled ? { parentControlled: true } : {}),
        // Spotify track ID — bara om satt.
        ...(item.spotifyTrackId ? { spotifyTrackId: item.spotifyTrackId } : {}),
        // actor-select-specifika fält — bara för filmfrågor.
        ...(isActorSelect ? {
          isAnimated: item.isAnimated ?? false,
          correctNames: item.correctNames ?? [],
          distractorNames: item.distractorNames ?? [],
        } : {}),
        // Tom array för Spotify-only items — quiz.tsx renderar Spotify DJ-vyn
        // när youtubeClips är tom och spotifyTrackId finns.
        youtubeClips: hasYoutube ? item.youtubeClips!.map((c) => ({
          videoId: c.videoId,
          startSec: c.startSec,
          endSec: c.endSec,
          channelTitle: c.channelTitle,
          license: c.license,
          notes: c.notes,
        })) : [],
      });
    }
  }

  // Stable sortering på correctYear → reproducibel output över git-diff:ar.
  // Actor-select items saknar correctYear; sorteras sist via Infinity-fallback.
  songs.sort((a, b) =>
    (a.correctYear ?? Infinity) - (b.correctYear ?? Infinity) || a.id.localeCompare(b.id),
  );

  const outputPath = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'utils',
    'musicQuestions.ts',
  );
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, renderTsModule(songs));

  console.log(`\nWrote ${songs.length} music questions to ${outputPath}`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} item(s):`);
    for (const s of skipped) console.log(`  - ${s}`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
