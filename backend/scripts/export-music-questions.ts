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
  correctYear: number;
  /** Subject från katalogens contentSubject — driver frågetext-lookup på klienten.
   *  'song' för musik (songs-*.yaml), 'movie' för film (movies-*.yaml),
   *  'sport-event' för sporthändelser. Alla 3 är youtube-form. */
  contentSubject: YoutubeContentSubject;
  /** Frågetext från FIXED_QUESTION_TEXT[contentSubject]. Inline:as i exporten
   *  så klienten slipper rebakad lookup-tabell. */
  questionText: string;
  /** Generationer som item:et är curerat för — kopieras från file-header
   *  audience eller item-override. Driver klient-side audience-filtret. */
  audiences: Audience[];
  /** Genre/tema-paket-taggar (t.ex. ["sport"]). Emittas bara när non-empty.
   *  Driver klientens crossover-filter (sport-musik surfar under Music+Sport). */
  genrePackages?: string[];
  youtubeClips: ExportedYoutubeClip[];
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
  correctYear: number;
  contentSubject: YoutubeContentSubject;
  questionText: string;
  audiences: MusicQuestionAudience[];
  genrePackages?: string[];
  youtubeClips: YoutubeClip[];
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
      // inBaseCatalog=false → item är reserverat för ett kommande Host-paket
      // (t.ex. christmas, eurovision) och ska INTE in i base-poolen som spelas
      // nu. Klippet + taggen bevaras i katalogen tills paket-systemet aktiveras.
      if (!item.inBaseCatalog) {
        skipped.push(`${item.id} (inBaseCatalog=false → reserverat för paket)`);
        continue;
      }
      if (!item.youtubeClips || item.youtubeClips.length === 0) {
        skipped.push(`${item.id} (no youtubeClips)`);
        continue;
      }
      if (item.correctYear === undefined) {
        skipped.push(`${item.id} (no correctYear)`);
        continue;
      }
      // contentSubject + questionText från fil-header (file-level i V1).
      // Type-cast pga TS-narrowing — schema garanterar att youtube-form
      // bara har 'song' | 'movie' | 'sport-event'.
      const subject = file.contentSubject as 'song' | 'movie' | 'sport-event';
      songs.push({
        id: item.id,
        displayName: item.displayName,
        correctYear: item.correctYear,
        contentSubject: subject,
        questionText: FIXED_QUESTION_TEXT[subject],
        // Item-level audience-override har företräde över file-header. Edge-
        // case: ny dansband-låt 2026 i songs-gen-alpha (file.audience =
        // ['gen-alpha', 'gen-z']) kan bära item.audience = ['elder', 'gen-x',
        // 'millennials'] för korrekt cross-gen-recognition. Saknas item-tag
        // används file-tag som tidigare.
        audiences: item.audience ?? file.audience,
        // genrePackages (t.ex. ["sport"]) — bara när non-empty (minimal diff).
        // Driver klientens crossover-filter: sport-musik under Music+Sport.
        ...(item.genrePackages.length ? { genrePackages: item.genrePackages } : {}),
        youtubeClips: item.youtubeClips.map((c) => ({
          videoId: c.videoId,
          startSec: c.startSec,
          endSec: c.endSec,
          channelTitle: c.channelTitle,
          license: c.license,
          notes: c.notes,
        })),
      });
    }
  }

  // Stable sortering på correctYear → reproducibel output över git-diff:ar.
  songs.sort((a, b) => a.correctYear - b.correctYear || a.id.localeCompare(b.id));

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
