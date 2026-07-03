// fix-parish-names.mts
// Ersätter svenska församlings-/kyrkobokföringsnamn i birth_place-hints
// med rena stadsnamn. Kör: npx tsx backend/scripts/fix-parish-names.mts

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const FILE = resolve('src/utils/hintsDataGenerated.ts');

// Manuell mapping: exakt värde → stadsnnamn
const PARISH_TO_CITY: Record<string, string> = {
  'Linköpings S:t Lars församling':         'Linköping',
  'Göteborgs Kristine församling':          'Göteborg',
  'S:t Peters klosters församling':         'Lund',
  'Vällingby församling':                   'Stockholm',
  'Johannebergs församling':                'Göteborg',
  'Katrineholms församling':                'Katrineholm',
  'Västra Skrävlinge församling':           'Malmö',
  'Salems församling':                      'Salem',
  'Järvsö församling':                      'Järvsö',
  'Rätans församling':                      'Rätan',
  'Umeå stadsförsamling':                   'Umeå',
  'Hägerstens församling':                  'Stockholm',
  'S:t Nikolai församling':                 'Halmstad',
  'Revesjö församling':                     'Borås',
  'Spånga-Kista församling':                'Stockholm',
  'Nacka församling':                       'Nacka',
  'Norrtälje församling':                   'Norrtälje',
  'Tärendö församling':                     'Tärendö',
  'Kvistofta församling':                   'Helsingborg',
  'Lerdala församling':                     'Skövde',
  'Norra Nöbbelövs församling':             'Lund',
  'Ovansjö församling':                     'Sandviken',
  'Götalundens församling':                 'Göteborg',
  'Sävedalens kyrkobokföringsdistrikt':     'Partille',
};

let content = readFileSync(FILE, 'utf-8');
let total = 0;

for (const [parish, city] of Object.entries(PARISH_TO_CITY)) {
  const escaped = parish.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'g');
  const matches = (content.match(pattern) ?? []).length;
  if (matches > 0) {
    content = content.replace(pattern, city);
    console.log(`  "${parish}" → "${city}" (${matches})`);
    total += matches;
  }
}

writeFileSync(FILE, content, 'utf-8');
console.log(`\nKlart: ${total} ersättningar.`);
