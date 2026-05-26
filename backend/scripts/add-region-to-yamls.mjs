// Migration: lägg till `region: ["sweden"]` på fil-header efter audience-raden
// i alla YAML-filer i content/catalog/. Bevarar CRLF/LF-line-endings.

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

const CATALOG_DIR = path.join(process.cwd(), 'content/catalog');
const files = readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.yaml'));

let added = 0;
let skipped = 0;
for (const file of files) {
  const fullPath = path.join(CATALOG_DIR, file);
  const raw = readFileSync(fullPath, 'utf8');
  const usesCRLF = raw.includes('\r\n');
  const eol = usesCRLF ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);

  // Idempotent: skip om region redan finns
  if (lines.some((l) => /^region:\s*\[/.test(l))) {
    skipped++;
    console.log(`  skip ${file} (already has region)`);
    continue;
  }

  // Hitta audience-raden och insertea region direkt efter
  const audienceIdx = lines.findIndex((l) => /^audience:\s*\[/.test(l));
  if (audienceIdx === -1) {
    console.log(`  WARN ${file}: no audience: line found, skipping`);
    skipped++;
    continue;
  }

  const newLines = [
    ...lines.slice(0, audienceIdx + 1),
    'region: ["sweden"]',
    ...lines.slice(audienceIdx + 1),
  ];
  writeFileSync(fullPath, newLines.join(eol), 'utf8');
  added++;
  console.log(`  added region to ${file}`);
}

console.log(`\n${added} files updated, ${skipped} skipped.`);
