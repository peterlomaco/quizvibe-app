/**
 * tag-all-audiences.ts — sätter `audience` till SAMTLIGA generationer på varje
 * item i hela katalogen (och på fil-headern, så header och items är överens).
 *
 * Bakgrund (Peter 2026-08-16): audience-taggningen följde en kaskad som bara
 * gick yngre→äldre (`songs-gen-x.yaml` → ["gen-x","elder"]). En gen-z-spelare
 * hade därför INGEN väg till 1950-talsmusik: av 125 region-synliga items i era
 * 1950-1980 överlevde bara 25 audience-filtret, varav 3 var låtar och exakt
 * EN var spelbar utan Spotify (elvis-presley-heartbreak-hotel). Resultatet var
 * att Elvis serverades i varje spel, oavsett 20-spelars-historiken.
 *
 * Beslutet är att göra audience till en no-op tills vidare — alla items taggas
 * med alla generationer, och exkluderingar cherry-pickas per item i efterhand.
 *
 * Rad-baserad (inte YAML-parse + dump) av samma skäl som batch-park-items.ts:
 * kommentarer, indentering, nyckelordning och CRLF ska bevaras exakt.
 *
 * Kör:
 *   npx tsx scripts/tag-all-audiences.ts --dry    # visa vad som ändras
 *   npx tsx scripts/tag-all-audiences.ts          # skriv
 */

import * as fs from 'fs';
import * as path from 'path';

const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const DRY = process.argv.includes('--dry');

/** Alla generationer i AudienceSchema-ordning (utan 'all' — vi vill ha den
 *  explicita listan så en enskild generation kan strykas per item senare). */
const ALL_GENERATIONS = ['elder', 'gen-x', 'millennials', 'gen-z', 'gen-alpha'];
const AUDIENCE_VALUE = `[${ALL_GENERATIONS.map((g) => `"${g}"`).join(', ')}]`;

const HEADER_LINE = `audience: ${AUDIENCE_VALUE}`;
const ITEM_LINE = `    audience: ${AUDIENCE_VALUE}`;

// Fil-header ligger i kolumn 0; item-nivå på exakt 4 blanksteg. YouTube-klipp
// ligger djupare (6/8 blanksteg) så 4-blanksteg-matchningen är entydig.
const HEADER_RE = /^audience:\s*\[.*\]\s*$/;
const ITEM_AUDIENCE_RE = /^ {4}audience:\s*\[.*\]\s*$/;
const ITEM_START_RE = /^ {2}- id:\s*(\S+)/;

interface FileResult {
  file: string;
  items: number;
  headerBefore: string | null;
  overriddenItems: { id: string; before: string }[];
  changed: boolean;
}

function processFile(filePath: string): FileResult {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Bevara filens radslut — Windows-katalogen är blandad CRLF/LF.
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);

  const out: string[] = [];
  const overriddenItems: { id: string; before: string }[] = [];
  let headerBefore: string | null = null;
  let headerDone = false;
  let itemCount = 0;
  let currentId: string | null = null;

  for (const line of lines) {
    // Fil-header: första `audience:` i kolumn 0.
    if (!headerDone && HEADER_RE.test(line)) {
      headerBefore = line.trim();
      out.push(HEADER_LINE);
      headerDone = true;
      continue;
    }

    // Item-start: skriv raden och lägg den kanoniska audience-raden direkt under.
    const itemMatch = ITEM_START_RE.exec(line);
    if (itemMatch) {
      currentId = itemMatch[1];
      itemCount++;
      out.push(line);
      out.push(ITEM_LINE);
      continue;
    }

    // Befintlig item-nivå-override: droppa den (vi har redan skrivit vår rad).
    if (ITEM_AUDIENCE_RE.test(line)) {
      overriddenItems.push({ id: currentId ?? '(unknown)', before: line.trim() });
      continue;
    }

    out.push(line);
  }

  const next = out.join(eol);
  const changed = next !== raw;
  if (changed && !DRY) fs.writeFileSync(filePath, next, 'utf8');

  return {
    file: path.basename(filePath),
    items: itemCount,
    headerBefore,
    overriddenItems,
    changed,
  };
}

function main() {
  const files = fs
    .readdirSync(CATALOG_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort();

  console.log(
    `${DRY ? '[DRY RUN] ' : ''}Sätter audience: ${AUDIENCE_VALUE}\n` +
      `Katalog: ${CATALOG_DIR}\n` +
      `Filer: ${files.length} (deferred/ hoppas över — parkerade items exporteras aldrig)\n`,
  );

  const results = files.map((f) => processFile(path.join(CATALOG_DIR, f)));

  let totalItems = 0;
  const allOverridden: { file: string; id: string; before: string }[] = [];

  for (const r of results) {
    totalItems += r.items;
    for (const o of r.overriddenItems) {
      allOverridden.push({ file: r.file, ...o });
    }
    const flag = r.changed ? '✓' : '·';
    const header = r.headerBefore ? ` header: ${r.headerBefore}` : ' header: (saknas!)';
    console.log(`${flag} ${r.file.padEnd(38)} ${String(r.items).padStart(4)} items${header}`);
  }

  console.log(`\nTotalt: ${totalItems} items i ${results.length} filer.`);
  console.log(`Ändrade filer: ${results.filter((r) => r.changed).length}`);

  const missingHeader = results.filter((r) => r.headerBefore === null);
  if (missingHeader.length > 0) {
    console.log(
      `\n⚠ ${missingHeader.length} fil(er) saknade en header-audience-rad — ` +
        `kontrollera manuellt: ${missingHeader.map((r) => r.file).join(', ')}`,
    );
  }

  if (allOverridden.length > 0) {
    console.log(
      `\n── ${allOverridden.length} item-nivå-override(s) skrevs över ──\n` +
        `Spara listan: det är de items som var handtrimmade och som Peter\n` +
        `sannolikt vill cherry-picka exkluderingar för först.\n`,
    );
    for (const o of allOverridden) {
      console.log(`  ${o.file.padEnd(38)} ${o.id.padEnd(34)} ${o.before}`);
    }

    // Skriv listan till fil också — efter retaggningen finns den bara i
    // git-historiken, och den behövs vid cherry-pick-passet.
    if (!DRY) {
      const outDir = path.join(__dirname, '..', 'output');
      fs.mkdirSync(outDir, { recursive: true });
      const md = [
        '# Item-nivå audience-overrides före all-generations-retaggningen',
        '',
        `Genererad av \`scripts/tag-all-audiences.ts\`. ${allOverridden.length} items hade`,
        'en handtrimmad `audience` som skrevs över när hela katalogen taggades med',
        'samtliga generationer. Det här är startlistan för cherry-pick-passet.',
        '',
        '| Fil | Item | Tidigare audience |',
        '|---|---|---|',
        ...allOverridden.map((o) => `| \`${o.file}\` | \`${o.id}\` | \`${o.before.replace(/^audience:\s*/, '')}\` |`),
        '',
      ].join('\n');
      const outPath = path.join(outDir, 'audience-overrides-before-retag.md');
      fs.writeFileSync(outPath, md, 'utf8');
      console.log(`\nListan sparad: ${path.relative(process.cwd(), outPath)}`);
    }
  }

  if (DRY) {
    console.log('\n[DRY RUN] Inget skrevs. Kör utan --dry för att applicera.');
  } else {
    console.log(
      '\nKlart. Nästa steg:\n' +
        '  npm run validate\n' +
        '  npm run export-music-questions\n' +
        '  npm run export-image-questions\n' +
        '  npm test',
    );
  }
}

main();
