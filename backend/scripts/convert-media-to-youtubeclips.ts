// Konverterar `media: {kind: youtube, ...}` (single-object) →
// `youtubeClips: [{...}]` (array) på item-nivå i songs-*.yaml-filer.
//
// Bakgrund: songs-gen-z.yaml + songs-gen-alpha.yaml curades med `media:`-
// format men export-music-questions.ts läser bara `youtubeClips:`. Resultat:
// 51 items är curerade-men-osynliga i music-poolen. Detta script gör en
// one-shot transformation som låser upp dem.
//
// Strategi: text-baserad rad-walk istället för js-yaml round-trip (preserves
// kommentarer + ordning + indentation). Varje media-block matchar mönstret:
//
//     media:
//       kind: youtube
//       videoId: "..."
//       startSec: <num>
//       endSec: <num>
//       channelTitle: "..."
//
// Konverteras till:
//
//     youtubeClips:
//       - videoId: "..."
//         startSec: <num>
//         endSec: <num>
//         channelTitle: "..."
//
// Items med `kind: ai-image` (om sådana finns) lämnas orörda.
//
// Kör: cd backend && tsx scripts/convert-media-to-youtubeclips.ts

import * as fs from 'fs';
import * as path from 'path';

const TARGET_FILES = [
  'songs-gen-z.yaml',
  'songs-gen-alpha.yaml',
];

const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');

interface ConversionStats {
  filename: string;
  converted: number;
  skipped: number;
}

/**
 * Konvertera en YAML-fil-text. Returnerar [ny text, statistik].
 *
 * Pattern: vi letar efter rader som matchar `^(\s+)media:$` (item-nivå
 * media-deklaration). När hittad, kollar vi följande rad — om den matchar
 * `kind: youtube` startar vi transform; annars (ai-image t.ex.) hoppar vi
 * blocket.
 *
 * I transform-läge: skriv `youtubeClips:` på media-rad, skippa kind-rad,
 * sedan ta varje följande rad med `${prefix}  ${field}` och konvertera till
 *   • första field-rad: `${prefix}  - ${field}` (lägg till `- ` + behåll indent)
 *   • övriga field-rader: `${prefix}    ${field}` (lägg till 2 spaces extra)
 *
 * Block slutar när vi ser en rad med indent ≤ `prefix.length + 2` (dvs när
 * vi lämnar media-blockets sub-fält).
 */
function convertFile(text: string): { result: string; stats: { converted: number; skipped: number } } {
  const lines = text.split('\n');
  const out: string[] = [];
  let converted = 0;
  let skipped = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const mediaMatch = line.match(/^(\s+)media:\s*$/);

    if (!mediaMatch) {
      out.push(line);
      i++;
      continue;
    }

    const prefix = mediaMatch[1]; // indent before "media:"
    const nextLine = lines[i + 1] ?? '';
    const kindMatch = nextLine.match(/^\s+kind:\s*(\w+)\s*$/);

    if (!kindMatch || kindMatch[1] !== 'youtube') {
      // Inte youtube (eller saknar kind) — lämna orörd
      out.push(line);
      i++;
      skipped++;
      continue;
    }

    // Transform start. Skriv `youtubeClips:` på samma indent som media:.
    out.push(`${prefix}youtubeClips:`);

    // Hoppa över media: och kind:-raderna
    i += 2;

    // Samla efterföljande field-rader (videoId, startSec, endSec, channelTitle).
    // Field-raderna har 2 spaces mer indent än `prefix` (= prefix + "  ").
    // Block slutar när vi ser en rad med ≤ prefix.length + 2 indent (= ej
    // sub-fält längre), eller en tom rad utan följande indent-rad.
    const fieldIndent = prefix + '  '; // t.ex. 4 spaces → 6 spaces
    let firstField = true;
    while (i < lines.length) {
      const fl = lines[i];
      // Tom rad mellan items är OK att inkludera i media-block? Nej —
      // tom rad bryter block (items separeras med blanks ofta).
      if (fl === '') break;
      // Field-rad? Måste börja med exakt fieldIndent + non-space.
      if (!fl.startsWith(fieldIndent + ' ') && fl.startsWith(fieldIndent)) {
        // exakt fieldIndent + content (utan ledande space)
        const fieldContent = fl.slice(fieldIndent.length);
        if (firstField) {
          // Lägg till "- " prefix
          out.push(`${fieldIndent}- ${fieldContent}`);
          firstField = false;
        } else {
          // Lägg till 2 spaces extra indent för fortsatta fields i samma object
          out.push(`${fieldIndent}  ${fieldContent}`);
        }
        i++;
      } else {
        // Rad har annan indent — vi lämnar media-blockets sub-fält
        break;
      }
    }
    converted++;
  }

  return {
    result: out.join('\n'),
    stats: { converted, skipped },
  };
}

function main(): void {
  const results: ConversionStats[] = [];
  for (const filename of TARGET_FILES) {
    const filePath = path.join(CATALOG_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath} — skipping`);
      continue;
    }
    const original = fs.readFileSync(filePath, 'utf-8');
    const { result, stats } = convertFile(original);

    if (result === original) {
      console.log(`${filename}: no changes (no media:youtube items found)`);
      results.push({ filename, converted: 0, skipped: stats.skipped });
      continue;
    }

    fs.writeFileSync(filePath, result);
    console.log(`${filename}: converted ${stats.converted} item(s), skipped ${stats.skipped}`);
    results.push({ filename, converted: stats.converted, skipped: stats.skipped });
  }

  const totalConverted = results.reduce((sum, r) => sum + r.converted, 0);
  console.log(`\nTotal: ${totalConverted} items converted.`);
}

main();
