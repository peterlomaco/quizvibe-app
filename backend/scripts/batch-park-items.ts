// batch-park-items.ts — batch-redigerar YAML-katalogfiler:
//   • REMOVE: tar bort item helt (inkl. webp hanteras separat)
//   • PARK: flyttar item till deferred/-mapp för framtida global-scope
//
// Kör: npx tsx scripts/batch-park-items.ts
//
// Logik: rad-baserad parsing bevarar exakt formatering på kvarvarande items.

import * as path from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const DEFERRED_DIR = path.join(CATALOG_DIR, 'deferred');

// ── Konfiguration ─────────────────────────────────────────────────────────

// Items att ta bort HELT (YAML-posten; webp raderas manuellt efteråt)
const REMOVE_IDS = new Set([
  'anders-f-ronnblom',
  'joan-jett',
  'mikael-wiehe',
  'snoh-aalegra',
  'the-tallest-man-on-earth',
  // Pass 2
  'billy-joel', 'enya', 'maria-mena', 'maxwell',
  // Pass 3
  'bernardo-silva', 'juan-roman-riquelme',
  // athletes-elder pass
  'franco-baresi', 'filippo-inzaghi', 'gunde-svan',
  'lilian-thuram', 'paul-gascoigne', 'romario',
  // bands-classics pass
  'docenterna', 'ghost', 'imperiet', 'cazzette', 'd-a-d', 'def-leppard', 'eldkvarn',
  // swedish actors pass
  'gunnar-bjornstrand', 'jan-malmsjo', 'edvin-adolphson', 'thor-moden',
  'bjorn-gustafson', 'peter-haber',
  // swedish footballers pass
  'ronnie-hellstrom', 'pontus-kamark', 'stefan-schwarz',
  'bo-larsson', 'orvar-bergmark', 'johnny-ekstrom', 'andreas-jakobsson',
  'mikael-nilsson', 'rasmus-elm', 'pontus-wernbloom', 'oscar-hiljemark',
  'hasse-jeppson', 'karl-erik-palmer', 'sven-rydell', 'sigvard-parling',
  'arne-selmosson', 'sven-axbom', 'bengt-gustavsson', 'torbjorn-jonsson',
  'roger-magnusson', 'leif-eriksson', 'thomas-sjoberg', 'ken-sema',
  'niclas-eliasson', 'magnus-hedman',
  'rolling-stones', 'foo-fighters', 'aerosmith', 'europe',
  'wizex', 'ace-of-base', 'dire-straits', 'depeche-mode', 'duran-duran',
  // logo-blur curation pass 1 — bilder med ej hanterbara logotyper
  'dennis-bergkamp', 'el-hadji-diouf', 'erkan-zengin', 'fabio-cannavaro',
  'francesco-totti', 'gary-lineker', 'jean-pierre-papin', 'johan-elmander',
  'jonathan-edwards', 'larry-bird', 'martin-olsson', 'michael-essien',
  'olivier-giroud', 'ruud-van-nistelrooy', 'samuel-etoo', 'sebastian-nanasi',
  'sergio-ramos', 'sol-campbell', 'steffi-graf', 'valentino-rossi',
  'vinicius-junior',
  // logo-blur curation pass 2
  'alex-ovechkin', 'alexander-milosevic', 'anthony-elanga', 'arjen-robben',
  'arrigo-sacchi', 'boris-becker', 'cafu', 'carlos-alcaraz',
  'henrik-rydstrom', 'henrik-sedin', 'hugo-larsson', 'ivan-lendl',
  'jack-nicklaus', 'jesper-karlstrom', 'jimmy-connors', 'jorgen-brink',
  'juan-sebastian-veron', 'kennedy-bakircioglu', 'lakhdar-belloumi',
  'lionel-scaloni', 'luiz-felipe-scolari', 'mario-kempes', 'mario-lemieux',
  'matthijs-de-ligt', 'mattias-jonson', 'max-verstappen', 'megan-rapinoe',
  'michel-platini', 'pavel-nedved', 'per-carlen', 'philipp-lahm',
  'sergey-bubka',
]);

// Items att PARKERA i deferred/ (bevarar webp för ev. återaktivering)
const PARK_IDS = new Set([
  // ── ARTISTER ──────────────────────────────────────────────────────────
  // artists-elder.yaml
  'eartha-kitt', 'hank-williams', 'james-taylor', 'joni-mitchell',
  'lena-horne', 'neil-young',
  // artists-gen-x.yaml
  'bryan-ferry', 'don-henley', 'garth-brooks', 'pat-benatar', 'sade',
  // artists-gen-x.yaml — Pass 2
  'andrea-bocelli', 'bjork',
  // artists-millennials.yaml
  'adna', 'aura-dione',
  // artists-gen-z.yaml
  'anitta', 'halsey', 'hayley-williams', 'j-balvin', 'jack-harlow',
  'lizzo', 'maluma',
  // (aurora-aksnes parkeras om den finns)
  'aurora-aksnes',

  // ── IDROTTARE (athletes-modern.yaml) ─────────────────────────────────
  'adam-peaty', 'allyson-felix', 'asamoah-gyan', 'aurelien-tchouameni',
  'chris-paul', 'clint-dempsey', 'coco-gauff', 'daniil-medvedev',
  'dwyane-wade', 'giannis-antetokounmpo', 'iga-swiatek', 'jannik-sinner',
  'joaquin', 'jules-kounde', 'katie-ledecky', 'katie-taylor',
  'keisuke-honda', 'kevin-durant', 'keylor-navas', 'landon-donovan',
  'lebron-james', 'luka-doncic', 'manny-pacquiao', 'marat-safin',
  'marcelo-brozovic', 'mario-mandzukic', 'naomi-osaka', 'nikola-jokic',
  'park-ji-sung', 'patrick-mahomes', 'radamel-falcao', 'rafa-marquez',
  'sebastian-vettel', 'shinji-kagawa', 'simone-biles', 'son-heung-min',
  'stephen-curry', 'yaya-toure',
  'andrej-kramaric', 'shunsuke-nakamura',
  'bastian-schweinsteiger',

  // ── IDROTTARE (athletes-elder-gen-x.yaml) ────────────────────────────
  'ademir', 'aleksandar-tirnanic', 'ali-daei', 'antonio-cabrini',
  'arthur-ashe', 'bernd-schuster', 'bill-russell', 'bruno-conti',
  'carlos-alberto', 'cesar-luis-menotti', 'carlos-bilardo', 'cha-bum-kun',
  'djalma-santos', 'enzo-bearzot', 'gaetano-scirea', 'giuseppe-meazza',
  'hans-peter-briegel', 'helmut-rahn', 'helmut-schon', 'jackie-stewart',
  'javier-aguirre', 'jean-claude-killy', 'jose-pekerman', 'jupp-derwall',
  'kareem-abdul-jabbar', 'lev-yashin', 'luigi-riva', 'luis-aragones',
  'marcelo-salas', 'marco-materazzi', 'marco-tardelli', 'mario-zagallo',
  'martin-brodeur', 'mladen-ramljak', 'nadia-comaneci', 'niki-lauda',
  'nilton-santos', 'pat-jennings', 'rabah-madjer', 'ricardo-la-volpe',
  'rivellino', 'roberto-martinez', 'rogerio-ceni', 'ruud-krol',
  'sandro-mazzola', 'socrates', 'sugar-ray-leonard', 'teofilo-cubillas',
  'tite', 'tomislav-ivic', 'tostao', 'uwe-seeler',
  'valeriy-lobanovskyi', 'vava', 'vittorio-pozzo', 'wilt-chamberlain',
  'wolfgang-overath', 'yoshikatsu-kawaguchi', 'zbigniew-boniek', 'zico',

  // ── SKÅDESPELARE ─────────────────────────────────────────────────────
  // actors-elder.yaml
  'cary-grant', 'clark-gable', 'errol-flynn', 'gary-cooper',
  'gregory-peck', 'james-cagney', 'lauren-bacall', 'vivien-leigh',
  // actors-gen-x.yaml
  'donald-sutherland', 'helen-mirren', 'helena-bonham-carter',
  'jason-bateman', 'jeff-bridges', 'jim-broadbent', 'john-malkovich',
  'kenneth-branagh', 'kevin-hart', 'kurt-russell', 'ron-howard',
  'terry-crews', 'warren-beatty',
  // actors-gen-z.yaml
  'andrew-garfield', 'anya-taylor-joy', 'jacob-elordi', 'jenna-ortega',
  'sadie-sink', 'saoirse-ronan', 'sydney-sweeney', 'timothee-chalamet',
  // actors-millennials.yaml
  'benedict-cumberbatch', 'brie-larson', 'colin-firth', 'david-dencik',
  'hugh-jackman', 'idris-elba', 'jake-gyllenhaal', 'jason-statham',
  'jude-law', 'marion-cotillard', 'mark-ruffalo', 'milla-jovovich',
  'naomi-watts', 'rachel-weisz', 'ryan-reynolds', 'sverrir-gudnason',
  'tom-holland',
]);

// Källfiler att processa (relativa till CATALOG_DIR)
const SOURCE_FILES = [
  'artists-elder.yaml',
  'artists-gen-x.yaml',
  'artists-millennials.yaml',
  'artists-gen-z.yaml',
  'actors-elder.yaml',
  'actors-gen-x.yaml',
  'actors-millennials.yaml',
  'actors-gen-z.yaml',
  'athletes-modern.yaml',
  'athletes-elder-gen-x.yaml',
  'bands-classics.yaml',
  'actors-sweden-classic.yaml',
  'athletes-sweden-football-classic.yaml',
  'athletes-sweden-football-modern.yaml',
  'athletes-sweden-modern.yaml',
];

// ── Hjälpfunktioner ───────────────────────────────────────────────────────

interface ItemGroup {
  id: string;
  lines: string[];
}

function parseYamlItems(filePath: string): { headerLines: string[]; items: ItemGroup[] } {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  const headerLines: string[] = [];
  const items: ItemGroup[] = [];

  let inItems = false;
  let currentId: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    if (!inItems) {
      headerLines.push(line);
      if (line.trimEnd() === 'items:') inItems = true;
    } else {
      const m = line.match(/^  - id:\s*(\S+)/);
      if (m) {
        if (currentId !== null) items.push({ id: currentId, lines: currentLines });
        currentId = m[1];
        currentLines = [line];
      } else {
        currentLines.push(line);
      }
    }
  }
  if (currentId !== null) items.push({ id: currentId, lines: currentLines });

  return { headerLines, items };
}

function reconstructFile(headerLines: string[], items: ItemGroup[]): string {
  const itemLines = items.flatMap((g) => g.lines);
  // Rensa avslutande tomma rader från sista item, lägg till exakt en newline
  const combined = [...headerLines, ...itemLines].join('\n');
  return combined.endsWith('\n') ? combined : combined + '\n';
}

// ── Huvudprogram ──────────────────────────────────────────────────────────

function main() {
  mkdirSync(DEFERRED_DIR, { recursive: true });

  const parkedArtists: ItemGroup[] = [];
  const parkedActors: ItemGroup[] = [];
  const parkedAthletes: ItemGroup[] = [];

  let totalRemoved = 0;
  let totalParked  = 0;
  let totalKept    = 0;

  for (const fname of SOURCE_FILES) {
    const filePath = path.join(CATALOG_DIR, fname);
    if (!existsSync(filePath)) {
      console.warn(`  ⚠ ${fname} — inte hittad, hoppar över`);
      continue;
    }

    const { headerLines, items } = parseYamlItems(filePath);
    const isActor   = fname.startsWith('actors-');
    const isAthlete = fname.startsWith('athletes-');

    const kept:    ItemGroup[] = [];
    const removed: ItemGroup[] = [];
    const parked:  ItemGroup[] = [];

    for (const item of items) {
      if (REMOVE_IDS.has(item.id)) {
        removed.push(item);
      } else if (PARK_IDS.has(item.id)) {
        parked.push(item);
        if (isActor) parkedActors.push(item);
        else if (isAthlete) parkedAthletes.push(item);
        else parkedArtists.push(item);
      } else {
        kept.push(item);
      }
    }

    if (removed.length > 0 || parked.length > 0) {
      writeFileSync(filePath, reconstructFile(headerLines, kept), 'utf8');
      console.log(`✓ ${fname}`);
      removed.forEach((i) => console.log(`    ✗ REMOVE  ${i.id}`));
      parked.forEach((i)  => console.log(`    ⏸ PARK    ${i.id}`));
      if (kept.length > 0) console.log(`    · ${kept.length} items kvar`);
    } else {
      console.log(`· ${fname} — inga ändringar`);
    }

    totalRemoved += removed.length;
    totalParked  += parked.length;
    totalKept    += kept.length;
  }

  // ── Skriv deferred-filer ───────────────────────────────────────────────

  if (parkedArtists.length > 0) {
    const deferredPath = path.join(DEFERRED_DIR, 'parked-artists-global.yaml');
    const newLines = parkedArtists.flatMap((g) => g.lines).join('\n');
    if (existsSync(deferredPath)) {
      // Append nya items till befintlig fil
      const existing = readFileSync(deferredPath, 'utf8').trimEnd();
      writeFileSync(deferredPath, existing + '\n' + newLines + '\n', 'utf8');
      console.log(`\n✓ Uppdaterade deferred/parked-artists-global.yaml (+${parkedArtists.length} items)`);
    } else {
      const header = [
        '# Parkerade artister — väntar på global-scope (v1.x)',
        '# Återaktivera: flytta item(s) till rätt audience-fil,',
        '# kör export-image-questions + uppdatera quizImages.ts',
        'audience: ["all"]',
        'region: ["global"]',
        'category: artists',
        'contentForm: image',
        'contentSubject: artist',
        'items:',
      ];
      writeFileSync(deferredPath, [...header, newLines].join('\n') + '\n', 'utf8');
      console.log(`\n✓ Skapade deferred/parked-artists-global.yaml (${parkedArtists.length} items)`);
    }
  }

  if (parkedActors.length > 0) {
    const deferredPath = path.join(DEFERRED_DIR, 'parked-actors-global.yaml');
    const header = [
      '# Parkerade skådespelare — väntar på global-scope (v1.x)',
      '# Återaktivera: flytta item(s) till rätt audience-fil,',
      '# kör export-image-questions + uppdatera quizImages.ts',
      'audience: ["all"]',
      'region: ["global"]',
      'category: actors',
      'contentForm: image',
      'contentSubject: actor',
      'items:',
    ];
    const content = [...header, ...parkedActors.flatMap((g) => g.lines)].join('\n') + '\n';
    writeFileSync(deferredPath, content, 'utf8');
    console.log(`✓ Skapade deferred/parked-actors-global.yaml (${parkedActors.length} items)`);
  }

  if (parkedAthletes.length > 0) {
    const deferredPath = path.join(DEFERRED_DIR, 'parked-athletes-global.yaml');
    const newLines = parkedAthletes.flatMap((g) => g.lines).join('\n');
    if (existsSync(deferredPath)) {
      const existing = readFileSync(deferredPath, 'utf8').trimEnd();
      writeFileSync(deferredPath, existing + '\n' + newLines + '\n', 'utf8');
      console.log(`✓ Uppdaterade deferred/parked-athletes-global.yaml (+${parkedAthletes.length} items)`);
    } else {
      const header = [
        '# Parkerade idrottare — väntar på global-scope (v1.x)',
        '# Återaktivera: flytta item(s) till rätt audience-fil,',
        '# kör export-image-questions + uppdatera quizImages.ts',
        'audience: ["all"]',
        'region: ["global"]',
        'category: persons',
        'contentForm: image',
        'contentSubject: athlete',
        'items:',
      ];
      writeFileSync(deferredPath, [...header, newLines].join('\n') + '\n', 'utf8');
      console.log(`✓ Skapade deferred/parked-athletes-global.yaml (${parkedAthletes.length} items)`);
    }
  }

  console.log(`\nSammanfattning: ${totalRemoved} borttagna · ${totalParked} parkerade · ${totalKept} kvar`);

  // Bild-assetsen är raderade 2026-08-17 — det finns ingen webp eller
  // quizImages.ts kvar att städa efter en parkering. Kör bara exporten om.
  console.log('\nKör `npm run export-image-questions` för att uppdatera poolen.');
}

main();
