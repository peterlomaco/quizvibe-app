// Engångs-reparation av dubbelkodad text (UTF-8 bytes lästa som CP1252 och
// sedan sparade som UTF-8 igen) i katalogfiler. Kör med --write för att skriva.
//
//   node scripts/_fix-mojibake.js content/catalog/artists-gen-x.yaml [--write]

const fs = require('fs');

// CP1252 mappar 0x80–0x9F till egna tecken; Latin-1 gör inte det. Utan den här
// tabellen blir em-streck och citattecken fel vid åter-kodningen.
const CP1252_REVERSE = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

function decodeAsCp1252(text) {
  const bytes = Buffer.from(
    [...text].map((ch) => {
      const cp = ch.codePointAt(0);
      return CP1252_REVERSE[cp] !== undefined ? CP1252_REVERSE[cp] : cp;
    }),
  );
  return bytes.toString('utf8');
}

const file = process.argv[2];
const write = process.argv.includes('--write');
if (!file) { console.error('ange en fil'); process.exit(1); }

let content = fs.readFileSync(file, 'utf8');
const hadBom = content.charCodeAt(0) === 0xfeff;
if (hadBom) content = content.slice(1);

// Mojibake-sekvenser inleds alltid med Ã/Â/â följt av ett tecken i 0x80–0xBF-
// intervallets mojibake-representation. Byt bara ut dem — resten lämnas orört
// så eventuell korrekt kodad text inte förstörs.
const MOJIBAKE_RE = /[ÂÃâ][-¿ŒœŠšŸŽžƒˆ˜–—‘’‚“”„†‡•…‰‹›€™]{1,2}/g;

const changes = [];
const fixed = content.replace(MOJIBAKE_RE, (seq) => {
  const decoded = decodeAsCp1252(seq);
  // Byt bara om resultatet blev ETT vettigt tecken (inte ersättningstecken).
  if (decoded.includes('�') || decoded.length >= seq.length) return seq;
  changes.push(`${JSON.stringify(seq)} -> ${JSON.stringify(decoded)}`);
  return decoded;
});

const counts = changes.reduce((acc, c) => ((acc[c] = (acc[c] || 0) + 1), acc), {});
for (const [c, n] of Object.entries(counts)) console.log(`  ${c}  ×${n}`);
console.log(`${Object.keys(counts).length} unika sekvenser, ${changes.length} förekomster${hadBom ? ' (+ BOM borttagen)' : ''}`);

if (write) {
  fs.writeFileSync(file, fixed, 'utf8');
  console.log(`Skrev ${file}`);
} else {
  console.log('(dry run — kör med --write)');
}
