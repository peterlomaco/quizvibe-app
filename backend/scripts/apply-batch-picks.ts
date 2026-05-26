// Apply picks från scripts/batch-picks.json till songs-*.yaml.
// Insert:ar youtubeClips-block efter answerMethods-raden för varje item.
// Text-baserad rad-walk så kommentarer + indentation bevaras (samma mönster
// som convert-media-to-youtubeclips.ts).
//
// Skip-flagga: --skip <itemId,itemId,...> för items som inte ska commit:as.
//
// Användning:
//   tsx scripts/apply-batch-picks.ts
//   tsx scripts/apply-batch-picks.ts --skip beatles-a-hard-days-night

import { readFileSync, writeFileSync } from 'fs';

interface Pick {
  itemId: string;
  displayName: string;
  year: number;
  file: string;
  topVideoId: string;
  topTitle: string;
  channelTitle: string;
  durationSec: number;
  definition: string;
  score: number;
  suggestedStartSec: number;
  suggestedEndSec: number;
  notes: string;
}

function escapeYamlString(s: string): string {
  // YAML double-quoted strings: escape " and \
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildClipBlock(pick: Pick): string {
  // 6-space-indent (samma som befintliga youtubeClips-block i songs-*.yaml).
  const channel = escapeYamlString(pick.channelTitle);
  const today = new Date().toISOString().slice(0, 10);
  return [
    `    youtubeClips:`,
    `      - videoId: "${pick.topVideoId}"`,
    `        startSec: ${pick.suggestedStartSec}`,
    `        endSec: ${pick.suggestedEndSec}`,
    `        channelTitle: "${channel}"`,
    `        notes: "Auto-curerad ${today} via batch-pick-clips. Top-scored kandidat (${pick.score})."`,
  ].join('\n');
}

function insertClipForItem(yaml: string, pick: Pick): { yaml: string; ok: boolean } {
  // Detect line endings: behåll original-CRLF/LF så vi inte normaliserar
  // hela filen vid skrivning (skulle skapa enorm diff).
  const usesCRLF = yaml.includes('\r\n');
  const eol = usesCRLF ? '\r\n' : '\n';
  // Strip \r när vi jämför så CRLF-filer matchas korrekt.
  const lines = yaml.split(/\r?\n/);
  const idLine = `  - id: ${pick.itemId}`;
  let itemStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === idLine) {
      itemStart = i;
      break;
    }
  }
  if (itemStart === -1) return { yaml, ok: false };

  // Hitta answerMethods-raden inom detta item (innan nästa "  - id:")
  let answerMethodsLine = -1;
  for (let i = itemStart + 1; i < lines.length; i++) {
    if (lines[i].startsWith('  - id:')) break; // nästa item
    if (lines[i].match(/^\s+answerMethods:/)) {
      answerMethodsLine = i;
      break;
    }
  }
  if (answerMethodsLine === -1) return { yaml, ok: false };

  // Kolla att vi inte redan har youtubeClips för itemet (defensive — bör inte hända)
  for (let i = itemStart + 1; i < lines.length; i++) {
    if (lines[i].startsWith('  - id:')) break;
    if (lines[i].match(/^\s+youtubeClips:/)) return { yaml, ok: false };
  }

  const block = buildClipBlock(pick);
  const newLines = [
    ...lines.slice(0, answerMethodsLine + 1),
    block,
    ...lines.slice(answerMethodsLine + 1),
  ];
  return { yaml: newLines.join(eol), ok: true };
}

function main() {
  const args = process.argv.slice(2);
  const skipIdx = args.indexOf('--skip');
  const skipIds = skipIdx !== -1 ? (args[skipIdx + 1] ?? '').split(',') : [];

  const picks = JSON.parse(readFileSync('scripts/batch-picks.json', 'utf8')) as Pick[];
  const toApply = picks.filter((p) => !skipIds.includes(p.itemId));

  // Gruppera per file
  const byFile = new Map<string, Pick[]>();
  for (const p of toApply) {
    if (!byFile.has(p.file)) byFile.set(p.file, []);
    byFile.get(p.file)!.push(p);
  }

  const summary: { file: string; applied: string[]; failed: string[] }[] = [];
  for (const [file, filePicks] of byFile.entries()) {
    const path = `content/catalog/${file}.yaml`;
    let yaml = readFileSync(path, 'utf8');
    const applied: string[] = [];
    const failed: string[] = [];
    for (const pick of filePicks) {
      const res = insertClipForItem(yaml, pick);
      if (res.ok) {
        yaml = res.yaml;
        applied.push(pick.itemId);
      } else {
        failed.push(pick.itemId);
      }
    }
    writeFileSync(path, yaml);
    summary.push({ file, applied, failed });
  }

  for (const s of summary) {
    console.log(`${s.file}: ${s.applied.length} applied, ${s.failed.length} failed`);
    if (s.applied.length > 0) console.log(`  ✓ ${s.applied.join(', ')}`);
    if (s.failed.length > 0) console.log(`  ✗ ${s.failed.join(', ')}`);
  }
  if (skipIds.length > 0) console.log(`\nSkipped: ${skipIds.join(', ')}`);
}

main();
