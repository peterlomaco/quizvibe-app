import * as fs from 'fs';
import * as path from 'path';

const dir = __dirname;
const matched = JSON.parse(fs.readFileSync(path.join(dir, '_t1matched.json'), 'utf8'));
const cat = JSON.parse(fs.readFileSync(path.join(dir, '_catalog-dump.json'), 'utf8'));
const byId = new Map(cat.map((r: any) => [r.id, r]));

function occFor(file: string, subject: string): string[] {
  if (subject === 'band' || file.startsWith('bands')) return ['band', 'group', 'musical', 'duo', 'rock', 'metal', 'ensemble'];
  if (file.startsWith('artists') || subject === 'artist') return ['singer', 'musician', 'songwriter', 'rapper', 'dj', 'producer', 'guitarist', 'artist', 'composer'];
  if (file.startsWith('athletes') || subject === 'athlete') return ['football', 'soccer', 'hockey', 'tennis', 'athlete', 'player', 'sprinter', 'skier', 'boxer', 'sport', 'goalkeeper', 'striker', 'midfielder', 'defender', 'skater'];
  if (file.startsWith('actors') || subject === 'actor') return ['actor', 'actress', 'comedian', 'director'];
  return [];
}

const rows: any[] = [];
const seen = new Set<string>();
for (const m of matched) {
  for (const id of m.ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const c: any = byId.get(id);
    if (!c) { console.log('NOT IN CATALOG:', id, m.name); continue; }
    rows.push({ id, name: c.name, file: c.file, subject: c.subject, occ: occFor(c.file, c.subject) });
  }
}
fs.writeFileSync(path.join(dir, '_t1-input.json'), JSON.stringify(rows, null, 2));
console.log('Task1 candidate input:', rows.length, 'items');
