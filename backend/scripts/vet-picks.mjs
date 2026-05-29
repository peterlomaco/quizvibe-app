// Vettar scripts/batch-picks.json mot R1 studio-only-policyn (2026-05-29) INNAN
// apply. Auto-pickern straffar inte "live"/"cover" → en live-officiell video kan
// hamna överst. Detta script flaggar dem + kräver studio-säker källa.
//
// Regler:
//  - REJECT om titeln innehåller live/cover/remix/acoustic/instrumental/tribute m.m.
//  - ACCEPT om kanalen är "- Topic" / VEVO / "official", ELLER titeln har
//    "official video/audio/lyric" — OCH inte rejectad ovan.
//  - annars REVIEW (osäker uppladdare → skippas i auto-apply, listas för manuell koll).
//
// Output: tabell + en `--skip`-rad (REJECT+REVIEW-ids) att klistra in i apply-batch-picks.
//
// Användning: node scripts/vet-picks.mjs [path-to-picks.json]

import { readFileSync } from 'fs';

const path = process.argv[2] || 'scripts/batch-picks.json';
const picks = JSON.parse(readFileSync(path, 'utf8'));

// Icke-studio-signaler (R1: ingen live/cover/remix/etc).
const NON_STUDIO =
  /\b(live|en vivo|en directo|in concert|concert|tour|acoustic|unplugged|covers?|covered|remix|rmx|reaction|karaoke|instrumental|backing track|sped\s?up|slowed|nightcore|8d|mashup|parody|tribute|demo|rehearsal|bbc|jools holland|top of the pops|glastonbury|sessions?)\b/i;

// Studio-säkra kanal-/titel-signaler.
const STUDIO_TITLE = /\b(official\s+(music\s+)?video|official\s+mv|official\s+audio|lyric(s)?\s+video|\(audio\)|visualizer)\b/i;

// Federations-kanaler embed-blockar trots embeddable=true (FIFA-fällan, Peter
// 2026-05-29) → kan ej auto-detekteras, så undvik dem helt för sport-event.
const FEDERATION = /\b(fifa|uefa|olympics?|ioc|nba|nfl|nhl|mlb|premier league)\b/i;

function channelKind(ch) {
  const c = (ch || '').toLowerCase();
  if (/\s-\s*topic$/.test(c) || /\btopic$/.test(c)) return 'Topic';
  if (/vevo$/.test(c)) return 'VEVO';
  if (/\bofficial\b/.test(c)) return 'official';
  return 'other';
}

const reject = [];
const review = [];
const accept = [];

for (const p of picks) {
  const title = p.topTitle || '';
  const kind = channelKind(p.channelTitle);
  let verdict;
  if (FEDERATION.test(p.channelTitle || '') || FEDERATION.test(title)) verdict = 'REJECT(federation-embed-block)';
  else if (NON_STUDIO.test(title)) verdict = 'REJECT(non-studio)';
  else if (kind === 'Topic' || kind === 'VEVO' || kind === 'official' || STUDIO_TITLE.test(title))
    verdict = 'ACCEPT';
  else verdict = 'REVIEW(uploader?)';

  const row = { id: p.itemId, verdict, kind, title, ch: p.channelTitle, vid: p.topVideoId };
  if (verdict === 'ACCEPT') accept.push(row);
  else if (verdict.startsWith('REJECT')) reject.push(row);
  else review.push(row);
}

const line = (r) => `  [${r.verdict}] ${r.id}  (${r.kind}: ${r.ch})\n      "${r.title}"  ${r.vid}`;
console.log(`\n=== ACCEPT (${accept.length}) — studio-säkra ===`);
accept.forEach((r) => console.log(line(r)));
console.log(`\n=== REVIEW (${review.length}) — osäker uppladdare, skippas i auto-apply ===`);
review.forEach((r) => console.log(line(r)));
console.log(`\n=== REJECT (${reject.length}) — icke-studio (live/cover/etc) ===`);
reject.forEach((r) => console.log(line(r)));

const skip = [...reject, ...review].map((r) => r.id);
console.log(`\nTotal picks: ${picks.length} | accept: ${accept.length} | skip: ${skip.length}`);
console.log(`\n--skip-arg:\n${skip.join(',')}`);
