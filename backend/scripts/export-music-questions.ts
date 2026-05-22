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

interface ExportedMusicQuestion {
  id: string;
  displayName: string;
  correctYear: number;
  /** Subject från katalogens contentSubject — driver frågetext-lookup på klienten. */
  contentSubject: 'song';
  /** Frågetext från FIXED_QUESTION_TEXT[contentSubject]. Inline:as i exporten
   *  så klienten slipper rebakad lookup-tabell. */
  questionText: string;
  /** Generationer som låten är curerad för — kopieras från file-header
   *  audience. Driver klient-side audience-filtret så en låt från 60-talet
   *  prioriteras för elder/gen-x medan en låt från 2020 prioriteras för
   *  gen-z/gen-alpha. 'all'-taggade items är alltid kvalificerade. */
  audiences: Audience[];
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

export interface MusicQuestion {
  id: string;
  displayName: string;
  correctYear: number;
  contentSubject: 'song';
  questionText: string;
  audiences: MusicQuestionAudience[];
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
    if (file.category !== 'songs') continue;
    for (const item of file.items) {
      if (!item.youtubeClips || item.youtubeClips.length === 0) {
        skipped.push(`${item.id} (no youtubeClips)`);
        continue;
      }
      if (item.correctYear === undefined) {
        skipped.push(`${item.id} (no correctYear)`);
        continue;
      }
      songs.push({
        id: item.id,
        displayName: item.displayName,
        correctYear: item.correctYear,
        contentSubject: 'song',
        questionText: FIXED_QUESTION_TEXT.song,
        // Item-level audience-override har företräde över file-header. Edge-
        // case: ny dansband-låt 2026 i songs-gen-alpha (file.audience =
        // ['gen-alpha', 'gen-z']) kan bära item.audience = ['elder', 'gen-x',
        // 'millennials'] för korrekt cross-gen-recognition. Saknas item-tag
        // används file-tag som tidigare.
        audiences: item.audience ?? file.audience,
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
