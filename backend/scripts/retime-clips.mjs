// Engångs-retiming: sätt startSec=0 (+ endSec=15) för låtar vars IKONISKA del är
// introt — den heuristiska 30s-starten missade hooken (We Will Rock You-stamp,
// Billie Jean-bas, Final Countdown-synth osv). Spelaren ignorerar endSec runtime;
// bara startSec styr. Text-walk bevarar kommentarer + CRLF/LF.
//
// Användning: node scripts/retime-clips.mjs

import { readFileSync, writeFileSync, readdirSync } from 'fs';

// Låtar vars öppning/intro är den starkaste igenkänningssignalen → starta på 0.
const START_ZERO = new Set([
  'rolling-stones-satisfaction',
  'queen-we-will-rock-you',
  'queen-another-one-bites-the-dust',
  'michael-jackson-billie-jean',
  'europe-the-final-countdown',
  'the-doors-light-my-fire',
  'soft-cell-tainted-love',
  'chic-le-freak',
  'mark-ronson-uptown-funk',
  'scorpions-wind-of-change',
  'bobby-mcferrin-dont-worry-be-happy',
  'oasis-wonderwall',
  'queen-bohemian-rhapsody',
  'cyndi-lauper-girls-just-want-to-have-fun',
  'sinead-oconnor-nothing-compares-2-u',
  'avicii-wake-me-up',
  'whitney-houston-i-will-always-love-you',
  'whitney-houston-i-wanna-dance-with-somebody',
]);
const WINDOW = 15;

function retimeFile(path) {
  const yaml = readFileSync(path, 'utf8');
  const eol = yaml.includes('\r\n') ? '\r\n' : '\n';
  const lines = yaml.split(/\r?\n/);
  const changed = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^  - id:\s*(\S+)/);
    if (!m || !START_ZERO.has(m[1])) continue;
    const id = m[1];
    // Inom detta item (tills nästa "  - id:"), hitta startSec/endSec och nolla.
    for (let j = i + 1; j < lines.length && !lines[j].startsWith('  - id:'); j++) {
      const sm = lines[j].match(/^(\s+startSec:\s*)\d+\s*$/);
      const em = lines[j].match(/^(\s+endSec:\s*)\d+\s*$/);
      if (sm) lines[j] = `${sm[1]}0`;
      else if (em) {
        lines[j] = `${em[1]}${WINDOW}`;
        changed.push(id);
        break; // endSec kommer efter startSec → klart för detta item
      }
    }
  }
  if (changed.length) writeFileSync(path, lines.join(eol));
  return changed;
}

const dir = 'content/catalog';
let total = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.yaml'))) {
  const changed = retimeFile(`${dir}/${file}`);
  if (changed.length) {
    console.log(`${file}: ${changed.length} retimade → start 0`);
    changed.forEach((id) => console.log(`  • ${id}`));
    total += changed.length;
  }
}
console.log(`\nTotalt retimade: ${total} / ${START_ZERO.size}`);
