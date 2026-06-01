import * as fs from 'fs';
import * as path from 'path';

interface Row {
  id: string;
  name: string;
  file: string;
  hints: string[];
  peakFrom: number;
  peakTo: number;
  prob: number;
}

const rows: Row[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_new-swedes.json'), 'utf8'),
);

const CATALOG = path.join(__dirname, '..', 'content', 'catalog');

interface FileCfg {
  audience: string;
  category: string;
  subject: string;
  header: string;
}

const CFG: Record<string, FileCfg> = {
  'bands-sweden': {
    audience: '["all"]',
    category: 'artists',
    subject: 'band',
    header:
      '# Svenska band — cross-gen-igenkända i Sverige (V1 svensk-fokus).\n' +
      '# Tillagda 2026-06-01 (kända-svenskar-utbyggnad). peak = aktiv/recognition-fönster.',
  },
  'artists-sweden-classic': {
    audience: '["elder", "gen-x"]',
    category: 'artists',
    subject: 'artist',
    header:
      '# Svenska solo-artister kända för elder + Gen X. Tillagda 2026-06-01.\n' +
      '# peak = aktiv/recognition-fönster (ingen correctYear → era-gating via peak).',
  },
  'artists-sweden-modern': {
    audience: '["millennials", "gen-z"]',
    category: 'artists',
    subject: 'artist',
    header:
      '# Svenska solo-artister kända för Millennials + Gen Z. Tillagda 2026-06-01.',
  },
  'actors-sweden-classic': {
    audience: '["elder", "gen-x"]',
    category: 'actors',
    subject: 'actor',
    header:
      '# Svenska skådespelare/komiker kända för elder + Gen X. Tillagda 2026-06-01.',
  },
  'actors-sweden-modern': {
    audience: '["millennials", "gen-z"]',
    category: 'actors',
    subject: 'actor',
    header:
      '# Svenska skådespelare/komiker kända för Millennials + Gen Z. Tillagda 2026-06-01.',
  },
  'athletes-sweden-classic': {
    audience: '["elder", "gen-x"]',
    category: 'athletes',
    subject: 'athlete',
    header:
      '# Svenska idrottare kända för elder + Gen X. Tillagda 2026-06-01.',
  },
  'athletes-sweden-modern': {
    audience: '["millennials", "gen-z"]',
    category: 'athletes',
    subject: 'athlete',
    header:
      '# Svenska idrottare kända för Millennials + Gen Z. Tillagda 2026-06-01.',
  },
};

const byFile = new Map<string, Row[]>();
for (const r of rows) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file)!.push(r);
}

function q(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`;
}

for (const [file, items] of byFile) {
  const cfg = CFG[file];
  if (!cfg) throw new Error(`No config for file ${file}`);
  let out = cfg.header + '\n';
  out += `audience: ${cfg.audience}\n`;
  out += `region: ["sweden"]\n`;
  out += `category: ${cfg.category}\n`;
  out += `contentForm: image\n`;
  out += `contentSubject: ${cfg.subject}\n`;
  out += `items:\n`;
  for (const it of items) {
    out += `  - id: ${it.id}\n`;
    out += `    displayName: ${q(it.name)}\n`;
    out += `    probability: ${it.prob}\n`;
    out += `    peakFrom: ${it.peakFrom}\n`;
    out += `    peakTo: ${it.peakTo}\n`;
    const hints = it.hints.map((h) => q(h)).join(', ');
    out += `    wikimediaSearchHints: [${hints}]\n`;
    out += `    answerMethods: ["name-letters"]\n`;
  }
  const target = path.join(CATALOG, `${file}.yaml`);
  fs.writeFileSync(target, out, 'utf8');
  console.log(`Wrote ${file}.yaml (${items.length} items)`);
}
