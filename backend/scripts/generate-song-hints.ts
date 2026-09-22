// Genererar src/utils/hintsSongsGenerated.ts — återanvänder tracks ur
// musik-poolen (songs-*.yaml) som EXTRA `song`-hints för artister/band vars
// hints-bibliotek är för tunt (< MIN_RAW_HINTS). Kör offline, snabbt, utan nät.
//
// Join: musik-items har ingen artist-id — enda kopplingen är artist-delen av
// song-displayName ("Title — Artist", spaced em-dash " — ", U+2014) som matchar
// artist/band-displayName exakt. Vi bygger name→id ur artists-*.yaml + bands-*.yaml
// och grupperar songs per id.
//
// Output är KANDIDATER per id — src/utils/hintsData.ts avgör vid merge vilka som
// faktiskt appendas (bara tunna entries, deduplicerat mot befintliga hints).
//
// Kör: cd backend && npm run generate-song-hints

import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import type { HintItem } from '../../src/utils/hintsData';

const OUTPUT_FILE = path.join(__dirname, '../../src/utils/hintsSongsGenerated.ts');

// Max kandidater per artist/band (mergen appendar ändå bara upp till sitt mål).
const MAX_CANDIDATES_PER_ID = 12;

const SEP = ' — '; // U+2014, spaced em-dash

/** trim + lowercase + collapse whitespace — matchning är exakt i praktiken. */
function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

interface SongCandidate {
  title: string; // original casing, för hint-värdet
  normTitle: string; // för dedup
  year: number;
  probability: number;
}

function main(): void {
  const catalog = loadCatalog();

  // 1. name(normaliserat displayName) → id, för artist/band-items (image-form).
  const nameToId = new Map<string, string>();
  for (const file of catalog.files.values()) {
    if (file.contentForm !== 'image') continue;
    if (file.contentSubject !== 'artist' && file.contentSubject !== 'band') continue;
    for (const item of file.items) {
      const key = normalizeName(item.displayName);
      // Första träffen vinner (samma namn i flera gen-filer = samma person).
      if (!nameToId.has(key)) nameToId.set(key, item.id);
    }
  }

  // 2. Samla songs per artist/band-id via displayName-artist-delen.
  const byId = new Map<string, SongCandidate[]>();
  for (const file of catalog.files.values()) {
    if (file.contentSubject !== 'song') continue; // hoppa movie/sport-event
    for (const item of file.items) {
      if (item.correctYear === undefined) continue; // krävs för "(Year)"-hinten
      const sepIdx = item.displayName.lastIndexOf(SEP);
      if (sepIdx === -1) continue; // ingen artist-del
      const title = item.displayName.slice(0, sepIdx).trim();
      const artist = item.displayName.slice(sepIdx + SEP.length);
      if (!title) continue;
      const id = nameToId.get(normalizeName(artist));
      if (!id) continue; // ingen matchande artist/band i katalogen
      const list = byId.get(id) ?? [];
      list.push({
        title,
        normTitle: normalizeName(title),
        year: item.correctYear,
        probability: item.probability,
      });
      byId.set(id, list);
    }
  }

  // 3. Per id: dedup på titel (behåll högst probability), sortera famous-first,
  //    kapa, och forma till HintItem[].
  const out: Record<string, HintItem[]> = {};
  const ids = [...byId.keys()].sort();
  let totalHints = 0;
  for (const id of ids) {
    const bestByTitle = new Map<string, SongCandidate>();
    for (const c of byId.get(id)!) {
      const prev = bestByTitle.get(c.normTitle);
      if (!prev || c.probability > prev.probability) bestByTitle.set(c.normTitle, c);
    }
    const sorted = [...bestByTitle.values()].sort(
      (a, b) => b.probability - a.probability || a.year - b.year || a.title.localeCompare(b.title),
    );
    const hints: HintItem[] = sorted.slice(0, MAX_CANDIDATES_PER_ID).map((c, i) => ({
      id: `song${i}`,
      type: 'song',
      label: 'Hit song',
      value: `"${c.title}" (${c.year})`,
      priority: 3,
    }));
    if (hints.length > 0) {
      out[id] = hints;
      totalHints += hints.length;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, renderModule(out), 'utf8');
  console.log(
    `Wrote ${path.relative(process.cwd(), OUTPUT_FILE)} — ${Object.keys(out).length} artists/bands, ${totalHints} song candidates.`,
  );
}

function renderModule(data: Record<string, HintItem[]>): string {
  const entries = Object.entries(data)
    .map(([id, hints]) => {
      const lines = hints
        .map(
          (h) =>
            `    { id: ${JSON.stringify(h.id)}, type: 'song', label: 'Hit song', value: ${JSON.stringify(
              h.value,
            )}, priority: 3 },`,
        )
        .join('\n');
      return `  ${JSON.stringify(id)}: [\n${lines}\n  ],`;
    })
    .join('\n');

  return `// Auto-generated. DO NOT EDIT BY HAND. Regenerate with:
//   cd backend && npm run generate-song-hints
//
// Reused tracks from backend/content/catalog/songs-*.yaml as candidate 'song'
// hints, keyed by artist/band id. src/utils/hintsData.ts appends these to THIN
// hint libraries (< MIN_RAW_HINTS) only, deduped against existing hints.

import type { HintItem } from './hintsData';

export const HINTS_SONG_CANDIDATES: Record<string, HintItem[]> = {
${entries}
};
`;
}

main();
