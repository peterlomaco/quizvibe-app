// Hints-data för Hints-frågor — v2.
//
// HintLibrary: bibliotek av alla möjliga ledtrådar per catalog-item.
// selectHints() (i hintsGenerator.ts) väljer slumpmässigt upp till 15 per runda.
//
// Prioritets-system (displayordning lägst→sist):
//   P1 = warm-up / generell profession  (visas FIRST)
//   P2 = biografiska fakta (datum, plats, peak)
//   P3 = verk/karriär-fakta (låtar, filmer, klubbar) — HÄR KOMMER SLUMPEN
//   P4 = starka identifierare (mest kända verk, ikonisk klubb/merit)
//   P5 = allra mest ikoniskt, alltid med, visas LAST (signatur-trait, #1-hit)
//
// Flagga: nationality → emoji via countryToFlagEmoji().

export type HintType =
  | 'profession'
  | 'birth_date'
  | 'birth_place'
  | 'peak_year'
  | 'debut'
  | 'song'
  | 'album'
  | 'movie'
  | 'tv_show'
  | 'lead_singer'
  | 'band_member'
  | 'member_count'
  | 'creation_year'
  | 'producer'
  | 'characteristic'
  | 'height'
  | 'jersey_number'
  | 'club'
  | 'merit';

export interface HintItem {
  id: string;
  type: HintType;
  label: string;
  value: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

export type HintCategoryLabel =
  | 'Musikartist'
  | 'Band'
  | 'Actor'
  | 'Athlete'
  | 'Coach'
  | 'Character';

export interface HintLibrary {
  categoryLabel: HintCategoryLabel;
  nationality: string;
  hints: HintItem[];
}

// ── Region scope ─────────────────────────────────────────────────────────
//
// ⚠ @deprecated SEDAN 2026-08-11 — RÖR INTE FÖR ATT ÄNDRA REGION.
//
// Region för bild-items bor numera i katalogens `region:`-fält, precis som
// för musik-items, och exporteras till quizImageQuestions.ts. Det finns
// alltså EN källa igen. Vill du ändra en regionstagg: redigera
// backend/content/catalog/*.yaml och kör `npm run export-image-questions`.
//
// Den här map:en behölls vid migrationen som historiskt underlag — dess 506
// beslut kopierades in i katalogen (0 items bytte synlighet). Ingen kod läser
// den längre; `getHintRegionScope` finns kvar som oanvänd accessor och kan
// raderas när migrationen suttit ett par releaser.
//
// Vokabuläret nedan föregår hierarkin global ⊃ europe ⊃ nordic ⊃ sweden;
// 'all' var alias för 'global'.
export type HintRegionScope =
  | 'global'
  | 'europe'
  | 'nordic'
  | 'sweden'
  | 'all'
  | 'unknown-region';

// Lookup-tabell: item-id → region scope.
// Items som INTE finns här defaultar till 'sweden'.
//
// REGLER:
//   'sweden'         = stark igenkänning bland svenska spelare (default)
//   'all'            = icke-svenska men hög igenkänning bland svenskar
//                      → catalog region: ["sweden","global"]
//   'unknown-region' = för svag igenkänning för V1 → hoppas över i hints-gen
//                      och inkluderas EJ i quizet
export const HINTS_REGION_MAP: Record<string, HintRegionScope> = {

  // ── Region-review 2026-08-11 (Peters genomgång): items som saknade
  //    entry här men var taggade 'global' i katalogen under den gamla
  //    innebörden. Nivåerna följer hierarkin global ⊃ europe ⊃ nordic ⊃ sweden.
  'james-stewart': 'unknown-region', // James Stewart
  'brian-bosworth': 'unknown-region', // Brian Bosworth
  'rebecca-ferguson': 'unknown-region', // Rebecca Ferguson
  'evin-ahmad': 'unknown-region', // Evin Ahmad
  'moa-gammel': 'unknown-region', // Moa Gammel
  'cleo': 'unknown-region', // Cleo
  'aronchupa': 'europe', // AronChupa
  'viktor-gyokeres': 'europe', // Viktor Gyökeres


  // ════════════════════════════════════════════════════════════════════════
  // 'all' — ICKE-SVENSKA men stark igenkänning bland svenska spelare
  // ════════════════════════════════════════════════════════════════════════

  // ── Artister / elder ────────────────────────────────────────────────────
  'elvis-presley': 'all',   'frank-sinatra': 'all',   'nat-king-cole': 'all',
  'louis-armstrong': 'all', 'ray-charles': 'all',     'bob-dylan': 'all',
  'james-brown': 'all',     'stevie-wonder': 'all',   'tina-turner': 'all',
  'diana-ross': 'all',      'marvin-gaye': 'all',     'dolly-parton': 'all',
  'leonard-cohen': 'all',   'roy-orbison': 'all',     'aretha-franklin': 'all',
  'dean-martin': 'all',     'tom-jones': 'all',       'chuck-berry': 'unknown-region',
  'ella-fitzgerald': 'all', 'donna-summer': 'all',    'lionel-richie': 'all',
  'barbra-streisand': 'all', 'mick-jagger': 'all',    'steven-tyler': 'all',

  // ── Artister / gen-x ───────────────────────────────────────────────────
  'michael-jackson': 'all', 'madonna': 'all',          'kurt-cobain': 'all',
  'bruce-springsteen': 'all', 'whitney-houston': 'all', 'prince': 'all',
  'david-bowie': 'all',     'cher': 'all',              'rod-stewart': 'all',
  'eric-clapton': 'all',    'phil-collins': 'all',      'elton-john': 'all',
  'cyndi-lauper': 'all',    'annie-lennox': 'all',      'george-michael': 'all',
  'kate-bush': 'all',       'sting': 'all',             'boy-george': 'unknown-region',
  'lenny-kravitz': 'all',   'ozzy-osbourne': 'all',     'alanis-morissette': 'all',
  'tom-petty': 'all',       'barry-white': 'all',       'rick-astley': 'all',
  'ricky-martin': 'all',    'gloria-estefan': 'all',    'seal': 'all',
  'bonnie-tyler': 'all',    'kylie-minogue': 'all',     'dave-grohl': 'all',

  // ── Artister / millennials ─────────────────────────────────────────────
  'rihanna': 'all',          'eminem': 'all',           'beyonce': 'all',
  'bruno-mars': 'all',       'adele': 'all',            'lady-gaga': 'all',
  'justin-timberlake': 'all', 'pink': 'all',            'mariah-carey': 'all',
  'celine-dion': 'all',      'christina-aguilera': 'all', 'britney-spears': 'all',
  'shakira': 'all',          'alicia-keys': 'all',      'norah-jones': 'all',
  'robbie-williams': 'all',  'jay-z': 'all',            'nelly-furtado': 'all',
  'jennifer-lopez': 'all',   'john-legend': 'all',      'sam-smith': 'all',
  'sia': 'all',              'avril-lavigne': 'all',    'pharrell-williams': 'all',
  'usher': 'all',            'snoop-dogg': 'all',       'enrique-iglesias': 'all',
  'gwen-stefani': 'all',     'tracy-chapman': 'all',    'kanye-west': 'all',
  'conchita-wurst': 'all',   'mary-j-blige': 'all',     'zara-larsson': 'all',

  // ── Artister / gen-z ───────────────────────────────────────────────────
  'billie-eilish': 'all',    'taylor-swift': 'all',     'drake': 'all',
  'ariana-grande': 'all',    'travis-scott': 'unknown-region',     'ed-sheeran': 'all',
  'the-weeknd': 'all',       'olivia-rodrigo': 'all',   'bad-bunny': 'all',
  'dua-lipa': 'all',         'harry-styles': 'all',     'post-malone': 'all',
  'justin-bieber': 'all',    'selena-gomez': 'all',     'miley-cyrus': 'all',
  'demi-lovato': 'all',      'kendrick-lamar': 'all',   'doja-cat': 'all',
  'nicki-minaj': 'all',      'shawn-mendes': 'all',     'camila-cabello': 'all',
  'sabrina-carpenter': 'all', 'lewis-capaldi': 'all',  'lil-nas-x': 'all',
  'netta-barzilai': 'unknown-region',   'loreen': 'all',

  // ── Svenska artister med global räckvidd ('all') ──────────────────────
  'abba': 'all',    'roxette': 'all',  'avicii': 'all',
  'robyn': 'all',   'europe': 'all',

  // ── Skådespelare / elder ───────────────────────────────────────────────
  'marilyn-monroe': 'all',   'tom-hanks': 'all',        'audrey-hepburn': 'unknown-region',
  'katharine-hepburn': 'all', 'sean-connery': 'all',    'humphrey-bogart': 'all',
  'james-dean': 'all',       'charlie-chaplin': 'all',  'marlon-brando': 'all',
  'grace-kelly': 'all',      'elizabeth-taylor': 'all', 'john-wayne': 'all',
  'greta-garbo': 'all',      'ingrid-bergman': 'all',   'max-von-sydow': 'all',

  // ── Skådespelare / gen-x ───────────────────────────────────────────────
  'arnold-schwarzenegger': 'all', 'julia-roberts': 'all',  'leonardo-dicaprio': 'all',
  'tom-cruise': 'all',       'meryl-streep': 'all',     'robin-williams': 'all',
  'robert-de-niro': 'all',   'jim-carrey': 'all',       'bruce-willis': 'all',
  'sigourney-weaver': 'all', 'jack-nicholson': 'all',   'al-pacino': 'all',
  'anthony-hopkins': 'all',  'dustin-hoffman': 'all',   'liam-neeson': 'unknown-region',
  'whoopi-goldberg': 'all',  'eddie-murphy': 'all',     'denzel-washington': 'unknown-region',
  'samuel-l-jackson': 'all', 'kevin-costner': 'all',   'john-travolta': 'all',
  'patrick-swayze': 'all',   'pierce-brosnan': 'all',   'rowan-atkinson': 'all',
  'hugh-grant': 'all',       'daniel-craig': 'all',     'jeff-goldblum': 'unknown-region',
  'joe-pesci': 'all',        'bill-murray': 'all',      'michael-douglas': 'all',
  'gary-oldman': 'unknown-region',      'demi-moore': 'all',       'halle-berry': 'all',
  'john-cleese': 'all',      'jodie-foster': 'all',     'ben-stiller': 'all',
  'paul-rudd': 'unknown-region',

  // ── Skådespelare / millennials ─────────────────────────────────────────
  'jennifer-aniston': 'all', 'margot-robbie': 'unknown-region',    'emma-stone': 'all',
  'florence-pugh': 'unknown-region',    'brad-pitt': 'all',        'will-smith': 'all',
  'johnny-depp': 'all',      'robert-downey-jr': 'unknown-region', 'sandra-bullock': 'all',
  'reese-witherspoon': 'all', 'christian-bale': 'all',  'matt-damon': 'all',
  'ben-affleck': 'all',      'ryan-gosling': 'all',     'cate-blanchett': 'all',
  'kate-winslet': 'all',     'nicole-kidman': 'all',    'charlize-theron': 'all',
  'penelope-cruz': 'all',    'adam-sandler': 'all',     'will-ferrell': 'all',
  'mark-wahlberg': 'all',    'joaquin-phoenix': 'all',  'edward-norton': 'all',
  'dwayne-johnson': 'all',   'chris-evans': 'unknown-region',      'scarlett-johansson': 'all',
  'jennifer-lawrence': 'all', 'cameron-diaz': 'all',    'gwyneth-paltrow': 'all',
  'uma-thurman': 'all',      'ewan-mcgregor': 'unknown-region',    'bradley-cooper': 'all',
  'tom-hiddleston': 'unknown-region',   'keira-knightley': 'unknown-region',  'anne-hathaway': 'unknown-region',

  // ── Skådespelare / gen-z ───────────────────────────────────────────────
  'millie-bobby-brown': 'unknown-region', 'zendaya': 'unknown-region',        'daniel-radcliffe': 'unknown-region',
  'emma-watson': 'unknown-region',      'robert-pattinson': 'unknown-region', 'kristen-stewart': 'unknown-region',

  // ── Idrottare / elder+gen-x ────────────────────────────────────────────
  'muhammad-ali': 'global',     'pele': 'global',             'diego-maradona': 'global',
  'magic-johnson': 'global',    'michael-jordan': 'global',   'carl-lewis': 'all',
  'wayne-gretzky': 'global',    'martina-navratilova': 'all', 'john-mcenroe': 'global',
  'johan-cruyff': 'all',     'franz-beckenbauer': 'all', 'george-best': 'all',
  'paolo-maldini': 'global',    'roberto-baggio': 'global',   'marco-van-basten': 'global',
  'katarina-witt': 'unknown-region',    'bjorn-daehlie': 'all',    'ayrton-senna': 'all',
  'alain-prost': 'all',      'michael-schumacher': 'global', 'zinedine-zidane': 'global',
  'andre-agassi': 'all',     'pete-sampras': 'all',     'david-beckham': 'all',
  'ronaldinho': 'global',       'goran-ivanisevic': 'all', 'george-foreman': 'all',
  'eric-cantona': 'global',     'ruud-gullit': 'global',      'lothar-matthaus': 'global',
  'rivaldo': 'all',          'alan-shearer': 'all',     'oliver-kahn': 'all',
  'frank-rijkaard': 'all',   'edgar-davids': 'all',     'alessandro-del-piero': 'all',
  'ryan-giggs': 'global',       'luis-figo': 'global',        'jurgen-klinsmann': 'global',
  'hristo-stoichkov': 'all', 'didier-deschamps': 'all', 'bebeto': 'unknown-region',
  'paolo-rossi': 'europe',      'gerd-muller': 'all',      'olga-korbut': 'unknown-region',
  'jaromir-jagr': 'global',     'ole-einar-bjorndalen': 'all', 'marit-bjorgen': 'all',
  'jean-pierre-papin': 'all', 'brian-laudrup': 'all',

  // ── Idrottare / modern ─────────────────────────────────────────────────
  'cristiano-ronaldo': 'global', 'lionel-messi': 'global',    'serena-williams': 'all',
  'usain-bolt': 'global',        'roger-federer': 'all',   'zlatan-ibrahimovic': 'global',
  'tom-brady': 'all',         'lewis-hamilton': 'global',  'rafael-nadal': 'global',
  'novak-djokovic': 'all',    'kylian-mbappe': 'all',   'kobe-bryant': 'global',
  'erling-haaland': 'all',    'harry-kane': 'global',      'robert-lewandowski': 'global',
  'luka-modric': 'global',       'andy-murray': 'all',     'mikaela-shiffrin': 'all',
  'alex-morgan': 'all',       'karsten-warholm': 'nordic', 'jakob-ingebrigtsen': 'nordic',
  'xavi': 'unknown-region',              'yao-ming': 'unknown-region',        'venus-williams': 'global',
  'sidney-crosby': 'global',     'connor-mcdavid': 'all',  'neymar': 'all',
  'iker-casillas': 'all',     'toni-kroos': 'unknown-region',      'manuel-neuer': 'all',
  'floyd-mayweather': 'all',  'wayne-rooney': 'global',    'kaka': 'all',
  'andrea-pirlo': 'all',      'thierry-henry': 'all',   'david-villa': 'unknown-region',
  'didier-drogba': 'all',     'gerard-pique': 'unknown-region',    'kevin-de-bruyne': 'global',
  'antoine-griezmann': 'all', 'virgil-van-dijk': 'global', 'gareth-bale': 'all',
  'martin-odegaard': 'all',   'ronaldo-nazario': 'global', 'miroslav-klose': 'all',
  'thomas-muller': 'all',     'steven-gerrard': 'all',  'frank-lampard': 'all',
  'xabi-alonso': 'all',       'raul': 'all',            'luis-suarez': 'all',
  'eden-hazard': 'all',       'patrick-vieira': 'all',  'andriy-shevchenko': 'all',
  'petr-cech': 'global',         'wesley-sneijder': 'unknown-region', 'robin-van-persie': 'all',
  'clarence-seedorf': 'all',  'patrick-kluivert': 'global', 'john-terry': 'all',
  'rio-ferdinand': 'all',     'michael-owen': 'all',    'cesc-fabregas': 'all',
  'ngolo-kante': 'all',       'paul-pogba': 'global',      'sergio-aguero': 'all',
  'jude-bellingham': 'all',   'phil-foden': 'all',      'bukayo-saka': 'all',
  'declan-rice': 'all',       'bruno-fernandes': 'all', 'mohamed-salah': 'global',
  'hidetoshi-nakata': 'global',  'james-rodriguez': 'unknown-region', 'alexis-sanchez': 'unknown-region',
  'diego-simeone': 'unknown-region',

  'lindsey-vonn': 'all',

  // ── Svenska idrottare med global räckvidd ('all') ─────────────────────
  'bjorn-borg': 'global',        'stefan-edberg': 'all',   'mats-wilander': 'all',
  'ingemar-stenmark': 'all',  'peter-forsberg': 'all',  'mats-sundin': 'all',
  'nicklas-lidstrom': 'all',  'annika-sorenstam': 'all', 'armand-duplantis': 'all',
  'freddie-ljungberg': 'all', 'henrik-larsson': 'all',

  // ── Band / globalt kända ('all') ──────────────────────────────────────
  'beatles': 'all',   'queen': 'all',      'nirvana': 'all',
  'acdc': 'all',      'iron-maiden': 'all', 'deep-purple': 'all',
  'judas-priest': 'all', 'motorhead': 'all', 'rammstein': 'all',

  // ── Karaktärer / globalt kända ('all') ───────────────────────────────
  'musse-pigg': 'all', 'kalle-anka': 'all', 'jan-langben': 'all',
  'nalle-puh': 'all',  'mumin': 'all',      'pippi-langstrump': 'all',

  // ════════════════════════════════════════════════════════════════════════
  // 'unknown-region' — för svag igenkänning för V1 → UTESLUTS
  // ════════════════════════════════════════════════════════════════════════

  // ── Artister / svag igenkänning bland svenska ─────────────────────────
  'otis-redding': 'unknown-region',    'carole-king': 'unknown-region',
  'little-richard': 'unknown-region',  'sammy-davis-jr': 'unknown-region',
  'patsy-cline': 'unknown-region',     'buddy-holly': 'unknown-region',
  'sam-cooke': 'unknown-region',       'harry-belafonte': 'unknown-region',
  'lasse-tennander': 'unknown-region', 'iggy-pop': 'unknown-region',
  'patti-smith': 'unknown-region',     'belinda-carlisle': 'unknown-region',
  'toni-braxton': 'unknown-region',    'ne-yo': 'unknown-region',
  'll-cool-j': 'global',       'lauryn-hill': 'all',
  'marc-anthony': 'unknown-region',    'hurula': 'unknown-region',
  'john-dahlback': 'unknown-region',   'erik-lundin': 'unknown-region',
  'sza': 'unknown-region',             'frank-ocean': 'unknown-region',
  'megan-thee-stallion': 'unknown-region',

  // ── Skådespelare / svag igenkänning bland svenska ─────────────────────
  'bette-davis': 'unknown-region',     'spencer-tracy': 'unknown-region',
  'shirley-temple': 'unknown-region',  'judi-dench': 'unknown-region',
  'robert-redford': 'unknown-region',  'paul-newman': 'unknown-region',
  'gene-hackman': 'unknown-region',    'diane-keaton': 'unknown-region',
  'susan-sarandon': 'unknown-region',  'goldie-hawn': 'unknown-region',
  'tom-selleck': 'unknown-region',     'michael-keaton': 'unknown-region',
  'burt-reynolds': 'unknown-region',   'salma-hayek': 'unknown-region',
  'owen-wilson': 'unknown-region',     'vince-vaughn': 'unknown-region',
  'robert-duvall': 'unknown-region',   'faye-dunaway': 'unknown-region',
  'kevin-bacon': 'unknown-region',     'nicolas-cage': 'unknown-region',
  'sharon-stone': 'all',    'eva-remaeus': 'unknown-region',
  'channing-tatum': 'unknown-region',  'eva-mendes': 'unknown-region',
  'kate-hudson': 'unknown-region',     'jessica-chastain': 'unknown-region',
  'amy-adams': 'unknown-region',       'finn-wolfhard': 'unknown-region',
  'noah-schnapp': 'unknown-region',

  // ── Idrottare / svag igenkänning bland svenska ────────────────────────
  'joe-frazier': 'unknown-region',     'bobby-charlton': 'unknown-region',
  'eusebio': 'unknown-region',         'charles-barkley': 'unknown-region',
  'lennox-lewis': 'unknown-region',    'kenny-dalglish': 'unknown-region',
  'ian-rush': 'unknown-region',        'raymond-domenech': 'unknown-region',
  'morten-olsen': 'unknown-region',    'berti-vogts': 'unknown-region',
  'cesare-maldini': 'unknown-region',  'hector-cuper': 'unknown-region',
  'carlos-alberto-parreira': 'unknown-region', 'vicente-del-bosque': 'unknown-region',
  'joachim-low': 'europe',     'marcello-lippi': 'unknown-region',
  'dino-zoff': 'unknown-region',       'guus-hiddink': 'unknown-region',
  'jan-ceulemans': 'europe',   'hugo-sanchez': 'unknown-region',
  'karl-heinz-rummenigge': 'unknown-region', 'sepp-maier': 'unknown-region',
  'javier-zanetti': 'unknown-region',  'dunga': 'unknown-region',
  'bobby-moore': 'unknown-region',     'jairzinho': 'global',
  'daniel-passarella': 'unknown-region', 'alf-ramsey': 'unknown-region',
  'just-fontaine': 'unknown-region',   'otto-rehhagel': 'unknown-region',
  'louis-van-gaal': 'unknown-region',  'tim-cahill': 'unknown-region',
  'harry-kewell': 'unknown-region',    'arturo-vidal': 'unknown-region',
  'ivan-rakitic': 'unknown-region',    'dirk-kuyt': 'unknown-region',
  'gennaro-gattuso': 'unknown-region', 'alessandro-nesta': 'unknown-region',
  'ashley-cole': 'unknown-region',     'robbie-keane': 'unknown-region',
  'david-trezeguet': 'unknown-region', 'ricardo-quaresma': 'global',
  'pepe': 'unknown-region',            'deco': 'unknown-region',
  'daniele-de-rossi': 'unknown-region', 'pedro-rodriguez': 'unknown-region',
  'juan-mata': 'unknown-region',       'diego-costa': 'unknown-region',
  'memphis-depay': 'unknown-region',   'cody-gakpo': 'unknown-region',
  'hugo-lloris': 'unknown-region',     'raphael-varane': 'unknown-region',
  'esteban-cambiasso': 'unknown-region', 'gonzalo-higuain': 'unknown-region',
  'javier-mascherano': 'unknown-region', 'jamie-carragher': 'unknown-region',
  'nani': 'unknown-region',             'julio-cesar': 'unknown-region',
  'emmanuel-adebayor': 'unknown-region', 'guillermo-ochoa': 'unknown-region',
  'javier-hernandez': 'unknown-region', 'tim-howard': 'unknown-region',
  'fred': 'unknown-region',             'oscar': 'unknown-region',
  'dani-alves': 'unknown-region',        'cafu-falcao': 'unknown-region',
  'claudio-taffarel': 'unknown-region',  'marcelo': 'unknown-region',
  'christian-pulisic': 'unknown-region', 'angel-di-maria': 'unknown-region',
  'thiago-silva': 'unknown-region',      'joao-felix': 'unknown-region',
  'sergio-busquets': 'unknown-region',   'edinson-cavani': 'unknown-region',
  'diego-forlan': 'unknown-region',      'romelu-lukaku': 'unknown-region',
  'roberto-donadoni': 'unknown-region',  'demetrio-albertini': 'unknown-region',
  'emilio-butragueno': 'unknown-region', 'fernando-hierro': 'unknown-region',
  'glenn-hoddle': 'unknown-region',

  // ════════════════════════════════════════════════════════════════════════
  // Allt ej listat ovan defaultar till 'sweden'
  // (svenska artister, band, idrottare, karaktärer etc.)
  // ════════════════════════════════════════════════════════════════════════
};

/** Returnerar region scope för ett catalog-item (default: 'sweden'). */
export function getHintRegionScope(id: string): HintRegionScope {
  return HINTS_REGION_MAP[id] ?? 'sweden';
}

// ── Emoji-flaggor ─────────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  sweden: '🇸🇪',
  norway: '🇳🇴',
  denmark: '🇩🇰',
  finland: '🇫🇮',
  iceland: '🇮🇸',
  usa: '🇺🇸',
  'united-states': '🇺🇸',
  uk: '🇬🇧',
  'united-kingdom': '🇬🇧',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  france: '🇫🇷',
  germany: '🇩🇪',
  spain: '🇪🇸',
  italy: '🇮🇹',
  brazil: '🇧🇷',
  argentina: '🇦🇷',
  portugal: '🇵🇹',
  croatia: '🇭🇷',
  netherlands: '🇳🇱',
  belgium: '🇧🇪',
  austria: '🇦🇹',
  switzerland: '🇨🇭',
  barbados: '🇧🇧',
  russia: '🇷🇺',
  ukraine: '🇺🇦',
  poland: '🇵🇱',
  czechia: '🇨🇿',
  greece: '🇬🇷',
  turkey: '🇹🇷',
  canada: '🇨🇦',
  australia: '🇦🇺',
  bulgaria: '🇧🇬',
  'new-zealand': '🇳🇿',
  japan: '🇯🇵',
  china: '🇨🇳',
  'south-korea': '🇰🇷',
  mexico: '🇲🇽',
  colombia: '🇨🇴',
  nigeria: '🇳🇬',
  senegal: '🇸🇳',
  'ivory-coast': '🇨🇮',
  cameroon: '🇨🇲',
  ghana: '🇬🇭',
  jamaica: '🇯🇲',
  chile: '🇨🇱',
  uruguay: '🇺🇾',
  ireland: '🇮🇪',
  serbia: '🇷🇸',
  'south-africa': '🇿🇦',
  israel: '🇮🇱',
  togo: '🇹🇬',
  venezuela: '🇻🇪',
  ecuador: '🇪🇨',
  peru: '🇵🇪',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  romania: '🇷🇴',
  hungary: '🇭🇺',
  slovakia: '🇸🇰',
  'north-macedonia': '🇲🇰',
  albania: '🇦🇱',
  morocco: '🇲🇦',
  algeria: '🇩🇿',
};

export function countryToFlagEmoji(nationality: string): string {
  return FLAG_MAP[nationality.toLowerCase()] ?? '🏳️';
}

/**
 * Har nationaliteten en RIKTIG landsflagga i FLAG_MAP? `false` = countryToFlagEmoji
 * skulle falla tillbaka på den grå/vita `🏳️`-platshållaren (t.ex. nationality
 * 'unknown' eller ett land vi inte mappar). Driver spelbarhets-gaten
 * (meetsHintsThreshold i hintsText.ts) — en Hints-fråga vars enda visuella
 * ledtråd är en grå flagga får inte visas (Peter 2026-09-03).
 * OBS: anropas med den slut-överridade nationaliteten (NATIONALITY_OVERRIDES
 * appliceras när HINTS_LIBRARY byggs), så items med korrigerbar nationalitet
 * behåller sin flagga i stället för att gallras bort.
 */
export function hasCountryFlag(nationality: string | undefined): boolean {
  return !!nationality && FLAG_MAP[nationality.toLowerCase()] !== undefined;
}

/**
 * Härleder kön från pronomen i hints-texterna.
 * Räknar förekomster av he/his/him (manlig) vs she/her/hers (kvinnlig).
 * Returnerar null om otydligt eller inga pronomen hittats.
 */
export function inferGender(library: HintLibrary): 'male' | 'female' | null {
  const text = library.hints.map((h) => h.value.toLowerCase()).join(' ');
  const male = (text.match(/\b(he|his|him)\b/g) ?? []).length;
  const female = (text.match(/\b(she|her|hers)\b/g) ?? []).length;
  if (male > female && male > 0) return 'male';
  if (female > male && female > 0) return 'female';
  return null;
}

/** Returnerar nationaliteten direkt från library (normaliserad sträng). */
export function inferNationality(library: HintLibrary): string | null {
  return library.nationality ?? null;
}

// Sport-nyckelord → kanonisk sport-identifierare. Profession-värden
// i hints matchar dessa prefix/substrings case-insensitivt.
const SPORT_KEYWORD_MAP: Array<[string, string]> = [
  ['football player', 'football'],
  ['basketball player', 'basketball'],
  ['tennis player', 'tennis'],
  ['ice hockey', 'ice-hockey'],
  ['cross-country skier', 'skiing'],
  ['alpine skier', 'skiing'],
  ['biathlete', 'biathlon'],
  ['sprinter', 'athletics'],
  ['pole vault', 'athletics'],
  ['professional golfer', 'golf'],
  ['boxer', 'boxing'],
];

/**
 * Härleder sport-typ från profession-hinten i library.
 * Söker igenom profession-hints (type='profession') och matchar mot
 * SPORT_KEYWORD_MAP. Returnerar null om ingen match.
 */
export function inferSport(library: HintLibrary): string | null {
  const profHint = library.hints.find((h) => h.type === 'profession');
  if (!profHint) return null;
  const val = profHint.value.toLowerCase();
  for (const [keyword, sport] of SPORT_KEYWORD_MAP) {
    if (val.includes(keyword)) return sport;
  }
  return null;
}

// ── Kompakt hjälp-funktion ────────────────────────────────────────────────

const h = (
  id: string,
  type: HintType,
  label: string,
  value: string,
  priority: 1 | 2 | 3 | 4 | 5,
): HintItem => ({ id, type, label, value, priority });

// ── Hints-bibliotek: 10 Musikartister + 10 Skådespelare + 10 Idrottare ───

import { HINTS_LIBRARY_GENERATED } from './hintsDataGenerated';

// Manuellt kuraterade hints — åsidosätter auto-genererade vid merge.
const HINTS_LIBRARY_MANUAL: Record<string, HintLibrary> = {

  // ── MUSIKARTISTER ─────────────────────────────────────────────────────────

  'michael-jackson': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Best-selling music artist of all time',                  1),
      h('bd',    'birth_date',     'Date of birth', 'August 29, 1958',                                        2),
      h('bp',    'birth_place',    'Place of birth','Gary, Indiana, USA',                                     2),
      h('pk',    'peak_year',      'Career peak',   '1979 – 1995',                                            2),
      h('s1',    'song',           'Hit song',      '"Off the Wall" (1979)',                                   3),
      h('s2',    'song',           'Hit song',      '"Human Nature" (1982)',                                   3),
      h('s3',    'song',           'Hit song',      '"Earth Song" (1995)',                                     3),
      h('s4',    'song',           'Hit song',      '"Bad" (1987)',                                            3),
      h('s5',    'song',           'Hit song',      '"Man in the Mirror" (1988)',                              3),
      h('s6',    'song',           'Hit song',      '"Beat It" (1982)',                                        3),
      h('fact2', 'characteristic', 'Early career',  'Started career with The Jackson 5',                      3),
      h('fact3', 'characteristic', 'Fact',          'Won 8 Grammy Awards in a single night (1984)',            3),
      h('s7',    'song',           'Hit song',      '"Billie Jean" (1983)',                                    4),
      h('alb1',  'album',          'Iconic album',  '"Bad" album (1987)',                                      4),
      h('kn',    'characteristic', 'Known as',      '"King of Pop"',                                          4),
      h('s8',    'song',           'Hit song',      '"Thriller" (1982)',                                       5),
      h('alb2',  'album',          'Iconic album',  '"Thriller" (1982) — best-selling album of all time',      5),
      h('sig',   'characteristic', 'Signature',     'Invented the moonwalk dance',                            5),
    ],
  },

  'madonna': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Sold over 300 million records worldwide',                1),
      h('bd',    'birth_date',     'Date of birth', 'August 16, 1958',                                        2),
      h('bp',    'birth_place',    'Place of birth','Bay City, Michigan, USA',                                 2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1998',                                            2),
      h('s1',    'song',           'Hit song',      '"Papa Don\'t Preach" (1986)',                             3),
      h('s2',    'song',           'Hit song',      '"Like a Prayer" (1989)',                                  3),
      h('s3',    'song',           'Hit song',      '"Ray of Light" (1998)',                                   3),
      h('s4',    'song',           'Hit song',      '"Hung Up" (2005)',                                        3),
      h('alb1',  'album',          'Iconic album',  '"True Blue" album (1986)',                                3),
      h('alb2',  'album',          'Iconic album',  '"Like a Prayer" album (1989)',                            3),
      h('fact2', 'characteristic', 'Fact',          'Born name: Madonna Louise Ciccone',                      3),
      h('s5',    'song',           'Hit song',      '"Material Girl" (1984)',                                  4),
      h('alb3',  'album',          'Iconic album',  '"Like a Virgin" album (1984)',                            4),
      h('kn',    'characteristic', 'Known as',      '"Queen of Pop"',                                         4),
      h('s6',    'song',           'Hit song',      '"Vogue" (1990)',                                          5),
      h('s7',    'song',           'Hit song',      '"Like a Virgin" (1984)',                                  5),
      h('sig',   'characteristic', 'Signature',     'Iconic cone bra outfit from Blonde Ambition Tour (1990)',5),
    ],
  },

  'elvis-presley': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Grew up in Memphis, Tennessee',                          1),
      h('bd',    'birth_date',     'Date of birth', 'January 8, 1935',                                        2),
      h('bp',    'birth_place',    'Place of birth','Tupelo, Mississippi, USA',                                2),
      h('pk',    'peak_year',      'Career peak',   '1956 – 1969',                                            2),
      h('s1',    'song',           'Hit song',      '"Love Me Tender" (1956)',                                 3),
      h('s2',    'song',           'Hit song',      '"Are You Lonesome Tonight" (1960)',                       3),
      h('s3',    'song',           'Hit song',      '"Burning Love" (1972)',                                   3),
      h('s4',    'song',           'Hit song',      '"Blue Suede Shoes" (1956)',                               3),
      h('s5',    'song',           'Hit song',      '"Heartbreak Hotel" (1956)',                               3),
      h('fact2', 'characteristic', 'Fact',          'Starred in over 30 Hollywood films (1956–69)',            3),
      h('fact3', 'characteristic', 'Fact',          'Lived at Graceland estate in Memphis',                   3),
      h('s6',    'song',           'Hit song',      '"Jailhouse Rock" (1957)',                                 4),
      h('s7',    'song',           'Hit song',      '"Suspicious Minds" (1969)',                               4),
      h('sig2',  'characteristic', 'Known for',     'Famous hip-shaking dance style',                         4),
      h('kn',    'characteristic', 'Known as',      '"King of Rock and Roll"',                                 5),
      h('s8',    'song',           'Hit song',      '"Hound Dog" (1956)',                                      5),
      h('sig',   'characteristic', 'Signature',     'Iconic quiff hairstyle and rhinestone jumpsuit',          5),
    ],
  },

  'beyonce': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Most Grammy-nominated woman of all time',                 1),
      h('bd',    'birth_date',     'Date of birth', 'September 4, 1981',                                      2),
      h('bp',    'birth_place',    'Place of birth','Houston, Texas, USA',                                     2),
      h('pk',    'peak_year',      'Career peak',   '2003 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Irreplaceable" (2006)',                                  3),
      h('s2',    'song',           'Hit song',      '"Formation" (2016)',                                      3),
      h('s3',    'song',           'Hit song',      '"Drunk in Love" (2013)',                                  3),
      h('s4',    'song',           'Hit song',      '"Lemonade" title track (2016)',                           3),
      h('alb1',  'album',          'Iconic album',  '"Lemonade" album (2016)',                                 3),
      h('alb2',  'album',          'Iconic album',  '"Renaissance" album (2022)',                              3),
      h('fact2', 'characteristic', 'Early career',  'Former lead singer of Destiny\'s Child',                 3),
      h('fact3', 'characteristic', 'Fact',          'Married to rapper Jay-Z',                                3),
      h('s5',    'song',           'Hit song',      '"Single Ladies (Put a Ring on It)" (2008)',               4),
      h('alb3',  'album',          'Iconic album',  '"Dangerously in Love" debut solo (2003)',                 4),
      h('kn',    'characteristic', 'Known as',      '"Queen Bey"',                                            4),
      h('s6',    'song',           'Hit song',      '"Halo" (2008)',                                           5),
      h('s7',    'song',           'Hit song',      '"Crazy in Love" (2003)',                                  5),
      h('sig',   'characteristic', 'Signature',     'Jaw-dropping Coachella headline performance (2018)',      5),
    ],
  },

  'avicii': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'DJ & music producer',                                    1),
      h('fact1', 'characteristic', 'Fact',          'Pioneered mainstream EDM (Electronic Dance Music)',      1),
      h('bd',    'birth_date',     'Date of birth', 'September 8, 1989',                                      2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                                2),
      h('pk',    'peak_year',      'Career peak',   '2011 – 2018',                                            2),
      h('s1',    'song',           'Hit song',      '"Hey Brother" (2013)',                                    3),
      h('s2',    'song',           'Hit song',      '"Silhouettes" (2012)',                                    3),
      h('s3',    'song',           'Hit song',      '"Addicted to You" (2013)',                                3),
      h('alb1',  'album',          'Iconic album',  '"Stories" album (2015)',                                  3),
      h('fact2', 'characteristic', 'Real name',     'Tim Bergling',                                           3),
      h('fact3', 'characteristic', 'Fact',          'Performed at Coachella at age 21 (2011)',                 3),
      h('s4',    'song',           'Hit song',      '"The Nights" (2014)',                                     4),
      h('alb2',  'album',          'Iconic album',  '"True" debut album (2013)',                               4),
      h('s5',    'song',           'Hit song',      '"Wake Me Up" (2013)',                                     5),
      h('s6',    'song',           'Hit song',      '"Levels" (2011)',                                         5),
      h('sig',   'characteristic', 'Signature',     'Breakthrough "Levels" sample from Etta James',           5),
    ],
  },

  'adele': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fact',          'Full name: Adele Laurie Blue Adkins',                   1),
      h('bd',    'birth_date',     'Date of birth', 'May 5, 1988',                                            2),
      h('bp',    'birth_place',    'Place of birth','Tottenham, London, UK',                                   2),
      h('pk',    'peak_year',      'Career peak',   '2010 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Set Fire to the Rain" (2010)',                           3),
      h('s2',    'song',           'Hit song',      '"Skyfall" (2012) — James Bond theme',                    3),
      h('s3',    'song',           'Hit song',      '"Water Under the Bridge" (2015)',                         3),
      h('alb1',  'album',          'Iconic album',  '"25" album (2015)',                                       3),
      h('alb2',  'album',          'Iconic album',  '"30" album (2021)',                                       3),
      h('fact2', 'characteristic', 'Fact',          'Albums named after her age at time of recording',        3),
      h('debut', 'debut',          'Debut album',   '"19" album (2008)',                                       3),
      h('s4',    'song',           'Hit song',      '"Someone Like You" (2011)',                               4),
      h('alb3',  'album',          'Iconic album',  '"21" album (2011)',                                       4),
      h('kn',    'characteristic', 'Known for',     'Powerful emotional ballads',                              4),
      h('s5',    'song',           'Hit song',      '"Hello" (2015)',                                          5),
      h('s6',    'song',           'Hit song',      '"Rolling in the Deep" (2010)',                            5),
      h('sig',   'characteristic', 'Signature',     'Record-breaking 25 album: 3.38 million copies in 1 week',5),
    ],
  },

  'rihanna': {
    categoryLabel: 'Musikartist',
    nationality: 'barbados',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Born on the Caribbean island of Barbados',               1),
      h('bd',    'birth_date',     'Date of birth', 'February 20, 1988',                                      2),
      h('bp',    'birth_place',    'Place of birth','Saint Michael, Barbados',                                 2),
      h('pk',    'peak_year',      'Career peak',   '2007 – 2016',                                            2),
      h('s1',    'song',           'Hit song',      '"Only Girl (In the World)" (2010)',                       3),
      h('s2',    'song',           'Hit song',      '"Stay" (2012)',                                           3),
      h('s3',    'song',           'Hit song',      '"Diamonds" (2012)',                                       3),
      h('s4',    'song',           'Hit song',      '"Work" (2016)',                                           3),
      h('alb1',  'album',          'Iconic album',  '"Anti" album (2016)',                                     3),
      h('fact2', 'characteristic', 'Business',      'Founder of Fenty Beauty cosmetics brand',                3),
      h('fact3', 'characteristic', 'Fact',          'Full name: Robyn Rihanna Fenty',                         3),
      h('s5',    'song',           'Hit song',      '"We Found Love" (2011)',                                  4),
      h('alb2',  'album',          'Iconic album',  '"Good Girl Gone Bad" album (2007)',                       4),
      h('merit', 'merit',          'Achievement',   'Super Bowl LVII halftime show (2023)',                    4),
      h('s6',    'song',           'Hit song',      '"Umbrella" (2007)',                                       5),
      h('sig',   'characteristic', 'Signature',     'Hit song that refused to leave #1 for 10 weeks',         5),
    ],
  },

  'zara-larsson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Early career',  'Born in Stockholm',                                       1),
      h('bd',    'birth_date',     'Date of birth', 'December 16, 1997',                                      2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '2015 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Ain\'t My Fault" (2017)',                                3),
      h('s2',    'song',           'Hit song',      '"Love Me Land" (2020)',                                   3),
      h('s3',    'song',           'Hit song',      '"WOW" (2019)',                                            3),
      h('alb1',  'album',          'Iconic album',  '"Poster Girl" album (2021)',                              3),
      h('fact2', 'characteristic', 'Fact',          'Represented her country at Eurovision 2017 in Kyiv',      3),
      h('fact3', 'characteristic', 'Fact',          'Known for empowering pop anthems',                        3),
      h('debut', 'debut',          'Debut album',   '"So Good" international debut (2017)',                    3),
      h('s4',    'song',           'Hit song',      '"Symphony" feat. Clean Bandit (2017)',                    4),
      h('s5',    'song',           'Hit song',      '"Never Forget You" (2015)',                               4),
      h('merit', 'merit',          'Achievement',   'Won talent show Talang Sverige at age 10',                4),
      h('s6',    'song',           'Hit song',      '"Lush Life" (2015)',                                      5),
      h('sig',   'characteristic', 'Signature',     'First Nordic artist to have 2 top-10 UK hits simultaneously',5),
    ],
  },

  'whitney-houston': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Sold over 200 million records worldwide',                 1),
      h('bd',    'birth_date',     'Date of birth', 'August 9, 1963',                                         2),
      h('bp',    'birth_place',    'Place of birth','Newark, New Jersey, USA',                                 2),
      h('pk',    'peak_year',      'Career peak',   '1985 – 2000',                                            2),
      h('s1',    'song',           'Hit song',      '"Saving All My Love for You" (1985)',                     3),
      h('s2',    'song',           'Hit song',      '"Greatest Love of All" (1986)',                           3),
      h('s3',    'song',           'Hit song',      '"Exhale (Shoop Shoop)" (1995)',                           3),
      h('s4',    'song',           'Hit song',      '"One Moment in Time" (1988)',                             3),
      h('mv',    'movie',          'Major film',    '"The Bodyguard" (1992)',                                  3),
      h('fact2', 'characteristic', 'Family',        'Cousin of singer Dionne Warwick',                        3),
      h('alb1',  'album',          'Debut album',   '"Whitney Houston" debut album (1985)',                    3),
      h('s5',    'song',           'Hit song',      '"I Wanna Dance with Somebody" (1987)',                    4),
      h('kn',    'characteristic', 'Known as',      '"The Voice" — for extraordinary vocal range',             4),
      h('merit', 'merit',          'Achievement',   '6 Grammy Awards, 30 Billboard Music Awards',             4),
      h('s6',    'song',           'Hit song',      '"I Will Always Love You" (1992)',                         5),
      h('sig',   'characteristic', 'Signature',     'Record 14 weeks at #1',                                   5),
    ],
  },

  'eminem': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Rap artist',                                             1),
      h('fact1', 'characteristic', 'Fun fact',      'Best-selling rap artist of all time',                    1),
      h('bd',    'birth_date',     'Date of birth', 'October 17, 1972',                                       2),
      h('bp',    'birth_place',    'Place of birth','St. Joseph, Missouri, USA',                               2),
      h('pk',    'peak_year',      'Career peak',   '1999 – 2013',                                            2),
      h('s1',    'song',           'Hit song',      '"Without Me" (2002)',                                     3),
      h('s2',    'song',           'Hit song',      '"Slim Shady" (1999)',                                     3),
      h('s3',    'song',           'Hit song',      '"Rap God" (2013)',                                        3),
      h('s4',    'song',           'Hit song',      '"Not Afraid" (2010)',                                     3),
      h('alb1',  'album',          'Iconic album',  '"The Marshall Mathers LP" (2000)',                        3),
      h('alb2',  'album',          'Iconic album',  '"Slim Shady LP" (1999)',                                  3),
      h('fact2', 'characteristic', 'Fact',          'Real name: Marshall Bruce Mathers III',                  3),
      h('fact3', 'characteristic', 'Mentor',        'Discovered and mentored by Dr. Dre',                     3),
      h('s5',    'song',           'Hit song',      '"The Real Slim Shady" (2000)',                            4),
      h('alb3',  'album',          'Iconic album',  '"The Eminem Show" (2002)',                                4),
      h('s6',    'song',           'Hit song',      '"Lose Yourself" (2002) — Oscar-winning song',             5),
      h('sig',   'characteristic', 'Signature',     'Rapid-fire rhyming delivery in alter ego "Slim Shady"',  5),
    ],
  },

  // ── SKÅDESPELARE ──────────────────────────────────────────────────────────

  'marilyn-monroe': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & model',                                          1),
      h('fact1', 'characteristic', 'Real name',     'Born Norma Jeane Mortenson',                             1),
      h('bd',    'birth_date',     'Date of birth', 'June 1, 1926',                                           2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California, USA',                            2),
      h('pk',    'peak_year',      'Career peak',   '1953 – 1962',                                            2),
      h('mv1',   'movie',          'Film',          '"Bus Stop" (1956)',                                       3),
      h('mv2',   'movie',          'Film',          '"The Misfits" (1961)',                                    3),
      h('mv3',   'movie',          'Film',          '"How to Marry a Millionaire" (1953)',                     3),
      h('mv4',   'movie',          'Film',          '"Niagara" (1953)',                                        3),
      h('fact2', 'characteristic', 'Cultural icon', 'Posed for the first Playboy magazine cover (1953)',       3),
      h('fact3', 'characteristic', 'Historical',    'Famous for singing "Happy Birthday, Mr. President" to JFK (1962)',3),
      h('mv5',   'movie',          'Film',          '"The Seven Year Itch" (1955)',                            4),
      h('mv6',   'movie',          'Film',          '"Gentlemen Prefer Blondes" (1953)',                       4),
      h('sig2',  'characteristic', 'Iconic scene',  'White dress over subway grate in "The Seven Year Itch"', 4),
      h('mv7',   'movie',          'Film',          '"Some Like It Hot" (1959)',                               5),
      h('sig',   'characteristic', 'Signature',     'Platinum blonde hair, beauty spot, and red lips',        5),
    ],
  },

  'tom-hanks': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Fun fact',      'Also directs films and writes screenplays',              1),
      h('bd',    'birth_date',     'Date of birth', 'July 9, 1956',                                           2),
      h('bp',    'birth_place',    'Place of birth','Concord, California, USA',                                2),
      h('pk',    'peak_year',      'Career peak',   '1993 – present',                                         2),
      h('mv1',   'movie',          'Film',          '"Big" (1988)',                                            3),
      h('mv2',   'movie',          'Film',          '"The Green Mile" (1999)',                                 3),
      h('mv3',   'movie',          'Film',          '"Captain Phillips" (2013)',                               3),
      h('mv4',   'movie',          'Film',          '"The Terminal" (2004)',                                   3),
      h('mv5',   'movie',          'Film',          '"Toy Story" — voice of Woody (1995–)',                   3),
      h('fact2', 'characteristic', 'Famous line',   '"Life is like a box of chocolates"',                     3),
      h('mv6',   'movie',          'Film',          '"Saving Private Ryan" (1998)',                            4),
      h('mv7',   'movie',          'Film',          '"Philadelphia" (1993)',                                   4),
      h('merit', 'merit',          'Achievement',   'Two consecutive Academy Awards for Best Actor',          4),
      h('mv8',   'movie',          'Film',          '"Cast Away" (2000)',                                      5),
      h('mv9',   'movie',          'Film',          '"Forrest Gump" (1994)',                                   5),
      h('sig',   'characteristic', 'Signature',     '"Run, Forrest, run!" — most quoted film of the 1990s',   5),
    ],
  },

  'audrey-hepburn': {
    categoryLabel: 'Actor',
    nationality: 'belgium',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Humanitarian',  'UNICEF Goodwill Ambassador for 15 years',                1),
      h('bd',    'birth_date',     'Date of birth', 'May 4, 1929',                                            2),
      h('bp',    'birth_place',    'Place of birth','Ixelles, Brussels',                                        2),
      h('pk',    'peak_year',      'Career peak',   '1953 – 1967',                                            2),
      h('mv1',   'movie',          'Film',          '"Sabrina" (1954)',                                        3),
      h('mv2',   'movie',          'Film',          '"War and Peace" (1956)',                                  3),
      h('mv3',   'movie',          'Film',          '"Two for the Road" (1967)',                               3),
      h('mv4',   'movie',          'Film',          '"Wait Until Dark" (1967)',                                3),
      h('fact2', 'characteristic', 'Achievement',   'Won an Oscar, Emmy, Grammy, and Tony (EGOT)',             3),
      h('fact3', 'characteristic', 'Style icon',    'Named the greatest style icon of the 20th century',      3),
      h('mv5',   'movie',          'Film',          '"My Fair Lady" (1964)',                                   4),
      h('mv6',   'movie',          'Film',          '"Roman Holiday" (1953)',                                  4),
      h('sig2',  'characteristic', 'Iconic look',   'Little black Givenchy dress in "Breakfast at Tiffany\'s"',4),
      h('mv7',   'movie',          'Film',          '"Breakfast at Tiffany\'s" (1961)',                        5),
      h('sig',   'characteristic', 'Signature',     'Portrayed Holly Golightly in iconic pearl necklace scene',5),
    ],
  },

  'marlon-brando': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Legacy',        'Pioneer of the "Method acting" technique',               1),
      h('bd',    'birth_date',     'Date of birth', 'April 3, 1924',                                          2),
      h('bp',    'birth_place',    'Place of birth','Omaha, Nebraska, USA',                                    2),
      h('pk',    'peak_year',      'Career peak',   '1951 – 1979',                                            2),
      h('mv1',   'movie',          'Film',          '"Last Tango in Paris" (1972)',                            3),
      h('mv2',   'movie',          'Film',          '"Superman" — played Jor-El (1978)',                       3),
      h('mv3',   'movie',          'Film',          '"Reflections in a Golden Eye" (1967)',                    3),
      h('fact2', 'characteristic', 'Controversy',   'Refused Academy Award for "The Godfather" (1973)',        3),
      h('fact3', 'characteristic', 'Stage career',  'Broadway debut in "I Remember Mama" (1944)',              3),
      h('mv4',   'movie',          'Film',          '"Apocalypse Now" (1979)',                                 4),
      h('mv5',   'movie',          'Film',          '"On the Waterfront" (1954)',                              4),
      h('mv6',   'movie',          'Film',          '"A Streetcar Named Desire" (1951)',                       4),
      h('sig2',  'characteristic', 'Iconic role',   '"I\'m gonna make him an offer he can\'t refuse" — Don Vito Corleone',4),
      h('mv7',   'movie',          'Film',          '"The Godfather" (1972)',                                  5),
      h('sig',   'characteristic', 'Signature',     'Cotton-stuffed cheeks as Don Vito Corleone',             5),
    ],
  },

  'charlie-chaplin': {
    categoryLabel: 'Actor',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & film director',                                  1),
      h('fact1', 'characteristic', 'Legacy',        'Co-founded United Artists studio (1919)',                 1),
      h('bd',    'birth_date',     'Date of birth', 'April 16, 1889',                                         2),
      h('bp',    'birth_place',    'Place of birth','Walworth, London, UK',                                    2),
      h('pk',    'peak_year',      'Career peak',   '1915 – 1940',                                            2),
      h('mv1',   'movie',          'Film',          '"The Kid" (1921)',                                        3),
      h('mv2',   'movie',          'Film',          '"The Gold Rush" (1925)',                                  3),
      h('mv3',   'movie',          'Film',          '"The Circus" (1928)',                                     3),
      h('mv4',   'movie',          'Film',          '"Limelight" (1952)',                                      3),
      h('fact2', 'characteristic', 'Innovation',    'Master of silent comedy — used only music and actions',  3),
      h('fact3', 'characteristic', 'Character',     'Trademark cane, bowler hat, and moustache',              3),
      h('mv5',   'movie',          'Film',          '"The Great Dictator" (1940) — political satire of Hitler',4),
      h('mv6',   'movie',          'Film',          '"City Lights" (1931)',                                    4),
      h('char',  'characteristic', 'Character',     'Played "The Little Tramp" — lovable underdog',           4),
      h('mv7',   'movie',          'Film',          '"Modern Times" (1936)',                                   5),
      h('sig',   'characteristic', 'Signature',     'Waddling walk of "The Little Tramp" — most iconic silent film character',5),
    ],
  },

  'arnold-schwarzenegger': {
    categoryLabel: 'Actor',
    nationality: 'austria',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & politician',                                     1),
      h('fact1', 'characteristic', 'Politics',      'Governor of California 2003–2011',                       1),
      h('bd',    'birth_date',     'Date of birth', 'July 30, 1947',                                          2),
      h('bp',    'birth_place',    'Place of birth','Thal, Styria',                                            2),
      h('pk',    'peak_year',      'Career peak',   '1977 – 1994',                                            2),
      h('mv1',   'movie',          'Film',          '"Commando" (1985)',                                       3),
      h('mv2',   'movie',          'Film',          '"True Lies" (1994)',                                      3),
      h('mv3',   'movie',          'Film',          '"Kindergarten Cop" (1990)',                               3),
      h('mv4',   'movie',          'Film',          '"Total Recall" (1990)',                                   3),
      h('merit', 'merit',          'Sport career',  '7× Mr. Olympia bodybuilding champion',                   3),
      h('fact2', 'characteristic', 'Legacy',        'Starred in "Terminator" franchise (1984–)',               3),
      h('mv5',   'movie',          'Film',          '"Predator" (1987)',                                       4),
      h('mv6',   'movie',          'Film',          '"Terminator 2: Judgment Day" (1991)',                     4),
      h('sig2',  'characteristic', 'Famous line',   '"Hasta la vista, baby"',                                  4),
      h('mv7',   'movie',          'Film',          '"The Terminator" (1984)',                                 5),
      h('sig',   'characteristic', 'Signature',     '"I\'ll be back" — most quoted sci-fi line ever',          5),
    ],
  },

  'julia-roberts': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Fun fact',      'Sister of actor Eric Roberts',                           1),
      h('bd',    'birth_date',     'Date of birth', 'October 28, 1967',                                       2),
      h('bp',    'birth_place',    'Place of birth','Smyrna, Georgia, USA',                                    2),
      h('pk',    'peak_year',      'Career peak',   '1990 – 2002',                                            2),
      h('mv1',   'movie',          'Film',          '"Steel Magnolias" (1989)',                                3),
      h('mv2',   'movie',          'Film',          '"My Best Friend\'s Wedding" (1997)',                      3),
      h('mv3',   'movie',          'Film',          '"Notting Hill" (1999)',                                   3),
      h('mv4',   'movie',          'Film',          '"Runaway Bride" (1999)',                                  3),
      h('mv5',   'movie',          'Film',          '"Ocean\'s Eleven" (2001)',                                3),
      h('fact2', 'characteristic', 'Achievement',   'First actress to earn $20 million for a film',           3),
      h('mv6',   'movie',          'Film',          '"Erin Brockovich" (2000) — Academy Award winner',        4),
      h('mv7',   'movie',          'Film',          '"Pretty Woman" (1990)',                                   5),
      h('kn',    'characteristic', 'Known for',     'Infectious laugh and wide smile',                        5),
      h('sig',   'characteristic', 'Signature',     '"Pretty Woman" transformed her into a global superstar', 5),
    ],
  },

  'leonardo-dicaprio': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Activism',      'Prominent environmental activist and philanthropist',    1),
      h('bd',    'birth_date',     'Date of birth', 'November 11, 1974',                                      2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California, USA',                            2),
      h('pk',    'peak_year',      'Career peak',   '1997 – present',                                         2),
      h('mv1',   'movie',          'Film',          '"What\'s Eating Gilbert Grape" (1993)',                  3),
      h('mv2',   'movie',          'Film',          '"The Aviator" (2004)',                                    3),
      h('mv3',   'movie',          'Film',          '"Django Unchained" (2012)',                               3),
      h('mv4',   'movie',          'Film',          '"The Wolf of Wall Street" (2013)',                        3),
      h('fact2', 'characteristic', 'Collaboration', 'Frequent collaborator with director Martin Scorsese',    3),
      h('mv5',   'movie',          'Film',          '"Inception" (2010)',                                      4),
      h('mv6',   'movie',          'Film',          '"The Revenant" (2015) — Academy Award for Best Actor',   4),
      h('sig2',  'characteristic', 'Famous line',   '"I\'m the king of the world!"',                          4),
      h('mv7',   'movie',          'Film',          '"Titanic" (1997)',                                        5),
      h('sig',   'characteristic', 'Signature',     '"Titanic" broke every box-office record of its era',      5),
    ],
  },

  'tom-cruise': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Fun fact',      'Does almost all his own stunts — no stunt double',        1),
      h('bd',    'birth_date',     'Date of birth', 'July 3, 1962',                                           2),
      h('bp',    'birth_place',    'Place of birth','Syracuse, New York, USA',                                 2),
      h('pk',    'peak_year',      'Career peak',   '1986 – present',                                         2),
      h('mv1',   'movie',          'Film',          '"Rain Man" (1988)',                                       3),
      h('mv2',   'movie',          'Film',          '"A Few Good Men" (1992)',                                 3),
      h('mv3',   'movie',          'Film',          '"Eyes Wide Shut" (1999)',                                 3),
      h('mv4',   'movie',          'Film',          '"Top Gun: Maverick" (2022)',                              3),
      h('fact2', 'characteristic', 'Famous line',   '"Show me the money!"',                                   3),
      h('mv5',   'movie',          'Film',          '"Jerry Maguire" (1996)',                                  4),
      h('mv6',   'movie',          'Film',          '"Mission: Impossible" series (1996–present)',             4),
      h('sig2',  'characteristic', 'Iconic stunt',  'Hanging from side of plane in "Rogue Nation" (2015)',    4),
      h('mv7',   'movie',          'Film',          '"Top Gun" (1986)',                                        5),
      h('sig',   'characteristic', 'Signature',     '"Maverick" nickname — one of Hollywood\'s biggest-ever blockbusters',5),
    ],
  },

  'meryl-streep': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Achievement',   'Received 21 Academy Award nominations',                  1),
      h('bd',    'birth_date',     'Date of birth', 'June 22, 1949',                                          2),
      h('bp',    'birth_place',    'Place of birth','Summit, New Jersey, USA',                                 2),
      h('pk',    'peak_year',      'Career peak',   '1979 – present',                                         2),
      h('mv1',   'movie',          'Film',          '"Silkwood" (1983)',                                       3),
      h('mv2',   'movie',          'Film',          '"Mamma Mia!" (2008)',                                     3),
      h('mv3',   'movie',          'Film',          '"Doubt" (2008)',                                          3),
      h('mv4',   'movie',          'Film',          '"Julie & Julia" (2009)',                                  3),
      h('fact2', 'characteristic', 'Reputation',    'Often called "the greatest actress of her generation"',  3),
      h('mv5',   'movie',          'Film',          '"The Iron Lady" (2011) — played Margaret Thatcher',      4),
      h('mv6',   'movie',          'Film',          '"Sophie\'s Choice" (1982)',                               4),
      h('mv7',   'movie',          'Film',          '"Kramer vs. Kramer" (1979)',                              4),
      h('mv8',   'movie',          'Film',          '"The Devil Wears Prada" (2006)',                          5),
      h('merit', 'merit',          'Achievement',   '3 Academy Awards for Best Actress — more than any other actor',5),
      h('sig',   'characteristic', 'Signature',     '"I\'m Miranda Priestly" — fashion-world villain role',   5),
    ],
  },

  'jennifer-lawrence': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',    'Category',      'Film actress',                                          1),
      h('bd',    'birth_date',    'Born',           'August 15, 1990',                                       2),
      h('bp',    'birth_place',   'Origin',         'Louisville, Kentucky',                                   2),
      h('m1',    'movie',         'Breakthrough',   '"Winter\'s Bone" (2010)',                               3),
      h('m2',    'movie',         'Franchise',      '"The Hunger Games" series (2012–2015)',                  3),
      h('m3',    'movie',         'Award film',     '"Silver Linings Playbook" (2012)',                       3),
      h('m4',    'movie',         'Film',           '"Joy" (2015)',                                           4),
      h('aw1',   'merit',         'Award',          'Oscar — Best Actress, Silver Linings Playbook',          4),
      h('role',  'movie',         'Signature role', '"The Hunger Games" — Katniss Everdeen',                 5),
      h('sig',   'characteristic','Record',         'Youngest Best Actress Oscar winner at age 22',           5),
    ],
  },

  // ── IDROTTARE ─────────────────────────────────────────────────────────────

  'michael-jordan': {
    categoryLabel: 'Athlete',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Basketball player',                                      1),
      h('fact1', 'characteristic', 'Business',      'Founder of Air Jordan / Jordan Brand',                   1),
      h('bd',    'birth_date',     'Date of birth', 'February 17, 1963',                                      2),
      h('bp',    'birth_place',    'Place of birth','Brooklyn, New York, USA',                                 2),
      h('pk',    'peak_year',      'Career peak',   '1987 – 1998',                                            2),
      h('club2', 'club',           'Club',          'Washington Wizards (2001–2003)',                          3),
      h('ht',    'height',         'Height',        '198 cm (6\'6")',                                          3),
      h('merit1','merit',          'Merit',         '5× NBA Most Valuable Player Award',                      3),
      h('merit2','merit',          'Merit',         '2× Olympic gold medals (1984 & 1992)',                   3),
      h('fact2', 'characteristic', 'Famous game',   'Played through severe fever to score 38 points — "The Flu Game" (1997)',3),
      h('jn',    'jersey_number',  'Jersey number', '#23 (Chicago Bulls) and #45 (comeback)',                 4),
      h('club1', 'club',           'Club',          'Chicago Bulls (1984–1993, 1995–1998)',                   4),
      h('merit3','merit',          'Merit',         '6× NBA Finals MVP',                                      4),
      h('merit4','merit',          'Merit',         '6× NBA Champion (1991–1993, 1996–1998)',                 5),
      h('kn',    'characteristic', 'Known as',      '"His Airness" — for acrobatic slam dunks',               5),
      h('sig',   'characteristic', 'Signature',     'Free-throw line slam-dunk from the 1988 Dunk Contest',   5),
    ],
  },

  'pele': {
    categoryLabel: 'Athlete',
    nationality: 'brazil',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Três Corações',                                       1),
      h('ht',     'height',     'Height',            '173 cm',                                              2),
      h('club1',  'club',       'Club History',      'Santos FC (1956–1974)',                               3),
      h('club2',  'club',       'Club History',      'New York Cosmos (1975–1977)',                         3),
      h('ctrop1', 'merit',      'Club Trophy',       'Copa Libertadores 1962, 1963 (Santos FC)',            4),
      h('ctrop2', 'merit',      'Club Trophy',       'Intercontinental Cup 1962, 1963 (Santos FC)',         4),
      h('ntrop',  'merit',      'National Trophy',   'FIFA World Cup 1958, 1962, 1970 (Brazil)',            5),
      h('itrop',  'merit',      'Individual Trophy', 'FIFA Player of the Century (2000)',                   5),
    ],
  },

  'diego-maradona': {
    categoryLabel: 'Athlete',
    nationality: 'argentina',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Lanús, Buenos Aires',                                 1),
      h('ht',     'height',     'Height',            '165 cm',                                              2),
      h('club1',  'club',       'Club History',      'Argentinos Juniors (1976–1981)',                      3),
      h('club2',  'club',       'Club History',      'Boca Juniors (1981–1982)',                            3),
      h('club3',  'club',       'Club History',      'FC Barcelona (1982–1984)',                            3),
      h('club4',  'club',       'Club History',      'Napoli (1984–1991)',                                  4),
      h('ctrop1', 'merit',      'Club Trophy',       'Serie A 1987, 1990 (Napoli)',                         4),
      h('ctrop2', 'merit',      'Club Trophy',       'UEFA Cup 1989 (Napoli)',                              4),
      h('ntrop',  'merit',      'National Trophy',   'FIFA World Cup 1986 (Argentina)',                     5),
      h('itrop',  'merit',      'Individual Trophy', 'FIFA Player of the Century 2000 (alongside Pelé)',    5),
    ],
  },

  'muhammad-ali': {
    categoryLabel: 'Athlete',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Boxer',                                                  1),
      h('fact1', 'characteristic', 'Original name', 'Born Cassius Marcellus Clay Jr.',                        1),
      h('bd',    'birth_date',     'Date of birth', 'January 17, 1942',                                       2),
      h('bp',    'birth_place',    'Place of birth','Louisville, Kentucky, USA',                               2),
      h('pk',    'peak_year',      'Career peak',   '1964 – 1978',                                            2),
      h('ht',    'height',         'Height',        '191 cm (6\'3")',                                          3),
      h('merit2','merit',          'Match',         '"Rumble in the Jungle" — beat Foreman in Zaire (1974)',  3),
      h('merit3','merit',          'Match',         '"Thrilla in Manila" — beat Frazier in Philippines (1975)',3),
      h('fact2', 'characteristic', 'Controversy',   'Refused military draft in 1967 — stripped of title',    3),
      h('fact3', 'characteristic', 'Rhymer',        'Famous for taunting opponents with poems and rhymes',    3),
      h('record','merit',          'Record',        'Professional boxing record: 56 wins (37 KO), 5 losses',  3),
      h('merit4','merit',          'Olympic',       'Olympic gold medal in boxing (1960, Rome)',               4),
      h('kn',    'characteristic', 'Known as',      '"The Greatest"',                                         4),
      h('merit1','merit',          'Merit',         '3× World Heavyweight Champion (1964, 1974, 1978)',       5),
      h('sig',   'characteristic', 'Signature',     '"Float like a butterfly, sting like a bee"',             5),
      h('sig2',  'characteristic', 'Legacy',        'Considered the greatest heavyweight boxer of all time',  5),
    ],
  },

  'zlatan-ibrahimovic': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Malmö',                                               1),
      h('ht',     'height',     'Height',            '195 cm',                                              2),
      h('club1',  'club',       'Club History',      'Malmö FF (1999–2001)',                                3),
      h('club2',  'club',       'Club History',      'Ajax (2001–2004)',                                    3),
      h('club3',  'club',       'Club History',      'Juventus (2004–2006)',                                3),
      h('club4',  'club',       'Club History',      'Inter Milan (2006–2009)',                             3),
      h('club5',  'club',       'Club History',      'FC Barcelona (2009–2010)',                            4),
      h('club6',  'club',       'Club History',      'AC Milan (2010–2012)',                                4),
      h('club7',  'club',       'Club History',      'Paris Saint-Germain (2012–2016)',                     4),
      h('ctrop1', 'merit',      'Club Trophy',       'Serie A × 3 (Juventus 2005, Inter 2007, 2008, 2009)', 4),
      h('ctrop2', 'merit',      'Club Trophy',       'Ligue 1 × 4 (PSG 2013–2016)',                        4),
      h('itrop',  'merit',      'Individual Trophy', 'Guldbollen × 11 — Player of the Year award, record 11 times', 5),
    ],
  },

  'cristiano-ronaldo': {
    categoryLabel: 'Athlete',
    nationality: 'portugal',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Funchal, Madeira',                                    1),
      h('ht',     'height',     'Height',            '187 cm',                                              2),
      h('club1',  'club',       'Club History',      'Sporting CP (2002–2003)',                             3),
      h('club2',  'club',       'Club History',      'Manchester United (2003–2009)',                       3),
      h('club3',  'club',       'Club History',      'Real Madrid (2009–2018)',                             4),
      h('club4',  'club',       'Club History',      'Juventus (2018–2021)',                                4),
      h('ctrop1', 'merit',      'Club Trophy',       'Premier League × 3 (Manchester United)',              4),
      h('ctrop2', 'merit',      'Club Trophy',       'UEFA Champions League × 5',                           4),
      h('ctrop3', 'merit',      'Club Trophy',       'La Liga × 2 (Real Madrid)',                           4),
      h('ntrop',  'merit',      'National Trophy',   'UEFA Euro 2016 (Portugal)',                           5),
      h('itrop',  'merit',      'Individual Trophy', 'Ballon d\'Or × 5 (2008, 2013, 2014, 2016, 2017)',    5),
    ],
  },

  'lionel-messi': {
    categoryLabel: 'Athlete',
    nationality: 'argentina',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Rosario',                                             1),
      h('ht',     'height',     'Height',            '170 cm',                                              2),
      h('club1',  'club',       'Club History',      'FC Barcelona (2004–2021)',                            3),
      h('club2',  'club',       'Club History',      'Paris Saint-Germain (2021–2023)',                     4),
      h('club3',  'club',       'Club History',      'Inter Miami CF (2023–present)',                       4),
      h('ctrop1', 'merit',      'Club Trophy',       'La Liga × 10 (FC Barcelona)',                         4),
      h('ctrop2', 'merit',      'Club Trophy',       'UEFA Champions League × 4 (FC Barcelona)',            4),
      h('ntrop',  'merit',      'National Trophy',   'FIFA World Cup 2022 (Argentina)',                     5),
      h('itrop',  'merit',      'Individual Trophy', 'Ballon d\'Or × 8 — all-time record',                  5),
    ],
  },

  'serena-williams': {
    categoryLabel: 'Athlete',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('fact1', 'characteristic', 'Business',      'Fashion designer and founder of Serena Ventures',        1),
      h('bd',    'birth_date',     'Date of birth', 'September 26, 1981',                                     2),
      h('bp',    'birth_place',    'Place of birth','Saginaw, Michigan, USA',                                  2),
      h('pk',    'peak_year',      'Career peak',   '1999 – 2017',                                            2),
      h('ht',    'height',         'Height',        '175 cm (5\'9")',                                          3),
      h('family','characteristic', 'Family',        'Sister of tennis player Venus Williams',                  3),
      h('merit2','merit',          'Merit',         '4× Olympic gold medals',                                  3),
      h('merit3','merit',          'Merit',         'World No. 1 for 319 weeks total',                        3),
      h('fact2', 'characteristic', 'Training',      'Father Richard Williams trained both Serena and Venus',  3),
      h('debut', 'debut',          'Career start',  'First Grand Slam title: US Open 1999',                   3),
      h('merit4','merit',          'Merit',         'Won Grand Slam title while 2 months pregnant (2017)',    4),
      h('merit5','merit',          'Merit',         'Won all 4 Grand Slams at least 3 times each',            4),
      h('kn',    'characteristic', 'Known for',     'Explosive serve and powerful baseline game',              4),
      h('merit1','merit',          'Merit',         '23 Grand Slam singles titles — Open Era record',         5),
      h('sig',   'characteristic', 'Signature',     'Powerful serve — recorded at 207 km/h',                 5),
    ],
  },

  'usain-bolt': {
    categoryLabel: 'Athlete',
    nationality: 'jamaica',
    hints: [
      h('prof',  'profession',     'Profession',    'Sprinter',                                               1),
      h('fact1', 'characteristic', 'Fun fact',      'Unusually tall for a sprinter at 195 cm',                1),
      h('bd',    'birth_date',     'Date of birth', 'August 21, 1986',                                        2),
      h('bp',    'birth_place',    'Place of birth','Sherwood Content, Trelawny',                             2),
      h('pk',    'peak_year',      'Career peak',   '2008 – 2016',                                            2),
      h('ht',    'height',         'Height',        '195 cm (6\'5") — much taller than typical sprinters',    3),
      h('merit2','merit',          'Record',        '200m World Record: 19.19 seconds (2009, Berlin)',        3),
      h('merit3','merit',          'Merit',         '11× World Championship gold medals',                     3),
      h('fact2', 'characteristic', 'Early career',  'Competed internationally in sprinting from age 15',      3),
      h('fact3', 'characteristic', 'Fact',          'Still training as football player after athletics retirement',3),
      h('merit4','merit',          'Merit',         '8× Olympic gold medals across 3 consecutive Olympics',   4),
      h('kn',    'characteristic', 'Known as',      'Nicknamed "Lightning" for his explosive sprint speed',    4),
      h('merit1','merit',          'Record',        '100m World Record: 9.58 seconds (2009, Berlin)',         5),
      h('sig',   'characteristic', 'Signature',     'Iconic victory pose: arms spread wide, index finger pointing up',5),
      h('sig2',  'characteristic', 'Legacy',        'Won 100m + 200m gold at 3 consecutive Olympic Games',   5),
    ],
  },

  'roger-federer': {
    categoryLabel: 'Athlete',
    nationality: 'switzerland',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('fact1', 'characteristic', 'Legacy',        'Co-founded the Laver Cup team tennis competition',       1),
      h('bd',    'birth_date',     'Date of birth', 'August 8, 1981',                                         2),
      h('bp',    'birth_place',    'Place of birth','Basel',                                                   2),
      h('pk',    'peak_year',      'Career peak',   '2003 – 2012',                                            2),
      h('ht',    'height',         'Height',        '185 cm (6\'1")',                                          3),
      h('merit2','merit',          'Merit',         '6× ATP Finals champion',                                  3),
      h('merit3','merit',          'Merit',         '5× US Open champion',                                    3),
      h('fact2', 'characteristic', 'Style',         'Known for exceptional sportsmanship and attacking elegance',3),
      h('debut', 'debut',          'Career start',  'Turned professional in 1998, aged 16',                   3),
      h('merit4','merit',          'Merit',         'World No. 1 for 310 weeks total — all-time record',      4),
      h('merit5','merit',          'Merit',         '8× Wimbledon champion',                                   4),
      h('kn',    'characteristic', 'Known for',     'Elegant one-handed backhand — rarest shot in modern tennis',4),
      h('merit1','merit',          'Merit',         '20 Grand Slam singles titles',                            5),
      h('sig',   'characteristic', 'Signature',     'Gliding court movement that makes tennis look effortless',5),
      h('sig2',  'characteristic', 'Record',        'First man to reach 20 Grand Slam titles',               5),
    ],
  },

  // ── NYA ITEMS ─────────────────────────────────────────────────────────────

  'tomas-brolin': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Hudiksvall',                                          1),
      h('ht',     'height',     'Height',            '177 cm',                                              2),
      h('club1',  'club',       'Club History',      'IFK Norrköping (1988–1992)',                          3),
      h('club2',  'club',       'Club History',      'Parma AC (1992–1996)',                                3),
      h('club3',  'club',       'Club History',      'Leeds United (1995–1997)',                            3),
      h('ctrop1', 'merit',      'Club Trophy',       'Coppa Italia 1992 (Parma)',                           4),
      h('ctrop2', 'merit',      'Club Trophy',       'UEFA Cup 1993 (Parma)',                               4),
      h('ntrop',  'merit',      'National Trophy',   '1994 FIFA World Cup — national team finished 3rd',    5),
      h('itrop',  'merit',      'Individual Trophy', 'Guldbollen 1992, 1994 — Player of the Year',          5),
    ],
  },

  'kennet-andersson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Eskilstuna',                                          1),
      h('ht',     'height',     'Height',            '192 cm',                                              2),
      h('club1',  'club',       'Club History',      'Malmö FF (1986–1991)',                                3),
      h('club2',  'club',       'Club History',      'Bologna FC (1991–1993)',                              3),
      h('club3',  'club',       'Club History',      'Bayer Leverkusen (1993–1995)',                        3),
      h('club4',  'club',       'Club History',      'Valencia CF (1995–1996)',                             4),
      h('club5',  'club',       'Club History',      'Fenerbahçe (1996–1998)',                              4),
      h('ntrop',  'merit',      'National Trophy',   '1994 FIFA World Cup — national team finished 3rd',    5),
      h('itrop',  'merit',      'Individual Trophy', 'Guldbollen 1993, 1994 — Player of the Year',          5),
    ],
  },

  'petter': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Rapper',                                                 1),
      h('fact1', 'characteristic', 'Legacy',        'Pioneer of hip-hop in the 1990s',                        1),
      h('bd',    'birth_date',     'Date of birth', 'October 26, 1974',                                       2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1997 – 2008',                                            2),
      h('alb1',  'album',          'Album',         '"Hiphopskallar" (2002)',                                  3),
      h('alb2',  'album',          'Album',         '"Kontradansen" (1999)',                                   3),
      h('fact2', 'characteristic', 'Real name',     'Peter Eriksson',                                         3),
      h('fact3', 'characteristic', 'Style',         'Socially conscious rap with political themes',           3),
      h('alb3',  'album',          'Debut album',   '"Mitt sjätte sinne" (1997)',                              4),
      h('sig',   'characteristic', 'Signature',     'Helped establish rap in native tongue as artistically credible', 5),
    ],
  },

  'veronica-maggio': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Multiple Grammis award winner',                           1),
      h('bd',    'birth_date',     'Date of birth', 'November 10, 1981',                                      2),
      h('bp',    'birth_place',    'Place of birth','Uppsala',                                                 2),
      h('pk',    'peak_year',      'Career peak',   '2007 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Måndagsbarn" (2007)',                                    3),
      h('s2',    'song',           'Hit song',      '"Hela huset" (2011)',                                     3),
      h('s3',    'song',           'Hit song',      '"Tillfälligheternas spel" (2019)',                        3),
      h('s4',    'song',           'Hit song',      '"Jag kommer" (2010)',                                     3),
      h('alb1',  'album',          'Album',         '"Satan i gatan" (2009)',                                  4),
      h('s5',    'song',           'Hit song',      '"Sergels torg" (2013)',                                   4),
      h('s6',    'song',           'Hit song',      '"Välkommen in" (2007)',                                   5),
      h('sig',   'characteristic', 'Signature',     'Indie-pop queen of the 2010s',                           5),
    ],
  },

  'bjorn-skifs': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist & actor',                                   1),
      h('fact1', 'characteristic', 'Fun fact',      'Also a popular actor and TV host',                       1),
      h('bd',    'birth_date',     'Date of birth', 'April 26, 1947',                                         2),
      h('bp',    'birth_place',    'Place of birth','Avesta',                                                  2),
      h('pk',    'peak_year',      'Career peak',   '1974 – 1985',                                            2),
      h('s1',    'song',           'Hit song',      '"Michelangelo" (1975)',                                   3),
      h('s2',    'song',           'Hit song',      '"Håll mitt hjärta" (1985)',                               3),
      h('fact2', 'characteristic', 'Band',          'Lead singer of Blue Swede (1973–1974)',                  3),
      h('s3',    'song',           'International hit','"Hooked on a Feeling" (1974) reached #1 in USA',      5),
      h('sig',   'characteristic', 'Signature',     '"Hooked on a Feeling" opening "ooga-chaka" chant became iconic worldwide',5),
    ],
  },

  'monica-zetterlund': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Jazz singer & actress',                                  1),
      h('fact1', 'characteristic', 'Legacy',        'One of the greatest jazz vocalists of all time',         1),
      h('bd',    'birth_date',     'Date of birth', 'September 20, 1937',                                     2),
      h('bp',    'birth_place',    'Place of birth','Hagfors, Värmland',                                      2),
      h('pk',    'peak_year',      'Career peak',   '1964 – 1985',                                            2),
      h('s1',    'song',           'Classic song',  '"Sakta vi gå genom stan"',                               3),
      h('fact2', 'characteristic', 'Acting',        'Also appeared in numerous films and TV series',          3),
      h('s2',    'song',           'Classic song',  '"Monica Z" (2013 film about her life)',                  3),
      h('alb1',  'album',          'Iconic album',  '"Waltz for Debby" (1964) — recorded with Bill Evans Trio',5),
      h('sig',   'characteristic', 'Signature',     'Her "Waltz for Debby" is considered one of the greatest jazz recordings',5),
    ],
  },

  'hristo-stoichkov': {
    categoryLabel: 'Athlete',
    nationality: 'bulgaria',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Plovdiv',                                             1),
      h('ht',     'height',     'Height',            '178 cm',                                              2),
      h('club1',  'club',       'Club History',      'CSKA Sofia (1984–1990)',                              3),
      h('club2',  'club',       'Club History',      'FC Barcelona (1990–1995)',                            3),
      h('club3',  'club',       'Club History',      'Parma AC (1995–1996)',                                4),
      h('club4',  'club',       'Club History',      'FC Barcelona (1996–1998)',                            4),
      h('ctrop1', 'merit',      'Club Trophy',       'La Liga × 4 (Barcelona 1991–1994)',                   4),
      h('ctrop2', 'merit',      'Club Trophy',       'UEFA Champions League 1992 (Barcelona)',              4),
      h('ntrop',  'merit',      'National Trophy',   'Bulgaria 4th place — 1994 FIFA World Cup',           5),
      h('itrop',  'merit',      'Individual Trophy', 'Ballon d\'Or 1994',                                   5),
    ],
  },

  'jurgen-klinsmann': {
    categoryLabel: 'Athlete',
    nationality: 'germany',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Göppingen',                                           1),
      h('ht',     'height',     'Height',            '182 cm',                                              2),
      h('club1',  'club',       'Club History',      'VfB Stuttgart (1984–1989)',                           3),
      h('club2',  'club',       'Club History',      'Inter Milan (1989–1992)',                             3),
      h('club3',  'club',       'Club History',      'Monaco (1992–1994)',                                  3),
      h('club4',  'club',       'Club History',      'Tottenham Hotspur (1994–1995)',                       4),
      h('club5',  'club',       'Club History',      'Bayern Munich (1995–1997)',                           4),
      h('ctrop',  'merit',      'Club Trophy',       'UEFA Cup 1991 (Inter Milan)',                         4),
      h('ntrop1', 'merit',      'National Trophy',   'FIFA World Cup winner 1990',                          5),
      h('ntrop2', 'merit',      'National Trophy',   'UEFA European Championship winner 1996',              5),
    ],
  },

  'jean-pierre-papin': {
    categoryLabel: 'Athlete',
    nationality: 'france',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Boulogne-sur-Mer',                                    1),
      h('ht',     'height',     'Height',            '175 cm',                                              2),
      h('club1',  'club',       'Club History',      'Olympique de Marseille (1986–1992)',                  3),
      h('club2',  'club',       'Club History',      'AC Milan (1992–1994)',                                4),
      h('club3',  'club',       'Club History',      'Bayern Munich (1994–1996)',                           4),
      h('ctrop1', 'merit',      'Club Trophy',       'Division 1 × 4 (Marseille 1989–1992)',               4),
      h('ctrop2', 'merit',      'Club Trophy',       'Serie A 1993, 1994 (AC Milan)',                      4),
      h('itrop',  'merit',      'Individual Trophy', 'Ballon d\'Or 1991',                                   5),
    ],
  },

  'brian-laudrup': {
    categoryLabel: 'Athlete',
    nationality: 'denmark',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Vienna',                                              1),
      h('ht',     'height',     'Height',            '182 cm',                                              2),
      h('club1',  'club',       'Club History',      'Brøndby IF (1987–1989)',                              3),
      h('club2',  'club',       'Club History',      'AC Milan (1992–1993)',                                3),
      h('club3',  'club',       'Club History',      'Fiorentina (1993–1994)',                              3),
      h('club4',  'club',       'Club History',      'Glasgow Rangers (1994–1998)',                         4),
      h('club5',  'club',       'Club History',      'Chelsea FC (1998)',                                   4),
      h('ctrop',  'merit',      'Club Trophy',       'Scottish Premier League × 4 (Rangers 1995–1998)',     4),
      h('ntrop',  'merit',      'National Trophy',   'UEFA European Championship winner 1992',              5),
      h('itrop',  'merit',      'Individual Trophy', 'Player of the Year award × 5',                       5),
    ],
  },

  'ole-einar-bjorndalen': {
    categoryLabel: 'Athlete',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('fact1', 'characteristic', 'Record',        'Competed in 8 consecutive Winter Olympics (1994–2018)',  1),
      h('bd',    'birth_date',     'Date of birth', 'January 27, 1974',                                       2),
      h('bp',    'birth_place',    'Place of birth','Simostranda, Numedal',                                   2),
      h('pk',    'peak_year',      'Career peak',   '1998 – 2016',                                            2),
      h('merit2','merit',          'Merit',         '20 World Championship gold medals',                      3),
      h('fact2', 'characteristic', 'Country',       'National biathlon team captain',                         3),
      h('merit3','merit',          'Merit',         'Married biathlete Darya Domracheva (2016)',               3),
      h('kn',    'characteristic', 'Known as',      '"The King of Biathlon"',                                 4),
      h('merit1','merit',          'Merit',         '8 Olympic gold medals — most decorated Winter Olympics athlete ever',5),
      h('sig',   'characteristic', 'Signature',     'Still winning at 44 — career spanned 5 Olympic cycles', 5),
    ],
  },

  'hakan-loob': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('fact1', 'characteristic', 'Legacy',        'Often described as the most complete hockey player of his era',1),
      h('bd',    'birth_date',     'Date of birth', 'September 3, 1960',                                      2),
      h('bp',    'birth_place',    'Place of birth','Västerås',                                                2),
      h('pk',    'peak_year',      'Career peak',   '1983 – 1996',                                            2),
      h('club2', 'club',           'Club',          'Färjestad BK (1980–1983, 1989–1996)',                    3),
      h('ht',    'height',         'Height',        '175 cm',                                                 3),
      h('merit2','merit',          'Merit',         'World Championship gold medal',                          3),
      h('kn',    'characteristic', 'Nickname',      'Known as "the Snake" by Calgary Flames fans',            4),
      h('merit3','merit',          'Record',        'First European player to score 50 goals in an NHL season (1987–88)',4),
      h('club1', 'club',           'Club',          'Calgary Flames, NHL (1983–1989)',                        4),
      h('merit1','merit',          'Merit',         'Stanley Cup winner with Calgary Flames (1989)',           5),
      h('sig',   'characteristic', 'Signature',     'Complete two-way player in an era dominated by pure scorers',5),
    ],
  },

  'marit-bjorgen': {
    categoryLabel: 'Athlete',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('fact1', 'characteristic', 'Record',        'Most decorated female Winter Olympics athlete ever',     1),
      h('bd',    'birth_date',     'Date of birth', 'March 21, 1980',                                         2),
      h('bp',    'birth_place',    'Place of birth','Rognes, Møre og Romsdal',                                2),
      h('pk',    'peak_year',      'Career peak',   '2002 – 2018',                                            2),
      h('merit2','merit',          'Merit',         '18 World Championship gold medals',                      3),
      h('fact2', 'characteristic', 'Feat',          'Won Olympic gold in 2018 PyeongChang at age 37',         3),
      h('nat',   'merit',          'Team',          'National cross-country skiing team',                     3),
      h('merit3','merit',          'Merit',         '8 Olympic gold medals across 5 Olympic Games',           4),
      h('merit1','merit',          'Merit',         '15 Olympic medals total — all-time Winter Olympics record',5),
      h('sig',   'characteristic', 'Signature',     'Dominated women\'s cross-country for over 15 years',    5),
    ],
  },

  'johannes-klabo': {
    categoryLabel: 'Athlete',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier — sprint specialist',                 1),
      h('fact1', 'characteristic', 'Fun fact',      'New generation of Nordic cross-country dominance',      1),
      h('bd',    'birth_date',     'Date of birth', 'October 22, 1996',                                       2),
      h('bp',    'birth_place',    'Place of birth','Trondheim',                                               2),
      h('pk',    'peak_year',      'Career peak',   '2018 – present',                                         2),
      h('merit2','merit',          'Merit',         'World Cup overall title (2020–21)',                       3),
      h('merit3','merit',          'Merit',         'Multiple World Championship gold medals',                 3),
      h('merit4','merit',          'Merit',         '2 Olympic gold medals at 2018 PyeongChang',              4),
      h('merit1','merit',          'Merit',         '3 Olympic gold medals at 2022 Beijing',                  5),
      h('sig',   'characteristic', 'Signature',     'Explosive sprint-to-distance versatility',               5),
    ],
  },

  'therese-johaug': {
    categoryLabel: 'Athlete',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('fact1', 'characteristic', 'Fun fact',      'Served a 18-month doping ban (2016–18) for inadvertent lip cream use',1),
      h('bd',    'birth_date',     'Date of birth', 'June 25, 1988',                                          2),
      h('bp',    'birth_place',    'Place of birth','Dalsbygda, Dalsbygda',                                   2),
      h('pk',    'peak_year',      'Career peak',   '2010 – 2022',                                            2),
      h('merit2','merit',          'Merit',         '14 World Championship gold medals',                      3),
      h('merit3','merit',          'Merit',         'National record holder in multiple distances',            3),
      h('merit4','merit',          'Merit',         '4 Olympic gold medals total',                             4),
      h('merit1','merit',          'Merit',         '3 gold medals at 2022 Beijing Olympics alone',            5),
      h('sig',   'characteristic', 'Signature',     'Undisputed queen of long-distance cross-country skiing', 5),
    ],
  },

  // ── SVENSKA LEGENDER ──────────────────────────────────────────────────────

  'bjorn-borg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('bd',    'birth_date',     'Date of birth', 'June 6, 1956',                                           2),
      h('bp',    'birth_place',    'Place of birth','Södertälje',                                              2),
      h('pk',    'peak_year',      'Career peak',   '1974 – 1981',                                            2),
      h('kn',    'characteristic', 'Nickname',      '"Ice Borg" — famous for ice-cold composure under pressure',3),
      h('merit2','merit',          'Merit',         '6× Roland Garros champion (1974–75, 1978–81)',          3),
      h('merit3','merit',          'Merit',         'Retired at age 26 — walked away at the top',             3),
      h('merit1','merit',          'Merit',         '5 consecutive Wimbledon titles (1976–1980)',              5),
      h('sig',   'characteristic', 'Signature',     'Headband, long hair, and wooden Donnay racket',          5),
      h('rival', 'characteristic', 'Rivalry',       'Legendary rivalry with John McEnroe — "Ice vs Fire" on centre court',  3),
    ],
  },

  'stefan-edberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('bd',    'birth_date',     'Date of birth', 'January 19, 1966',                                       2),
      h('bp',    'birth_place',    'Place of birth','Västervik',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 1993',                                            2),
      h('kn',    'characteristic', 'Known for',     'Exceptional sportsmanship and serve-and-volley style',   3),
      h('merit2','merit',          'Merit',         '2× Wimbledon champion (1988, 1990)',                     3),
      h('merit3','merit',          'Merit',         'Won Melbourne Grand Slam twice (1985, 1987)',             3),
      h('merit4','merit',          'Merit',         'World No. 1 ranking in 1990 and 1991',                   4),
      h('merit1','merit',          'Merit',         '6 Grand Slam singles titles',                             5),
      h('sig',   'characteristic', 'Signature',     'Model of fair play — ATP Sportsmanship Award named after him',5),
    ],
  },

  'mats-wilander': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('bd',    'birth_date',     'Date of birth', 'August 22, 1964',                                        2),
      h('bp',    'birth_place',    'Place of birth','Växjö',                                                   2),
      h('pk',    'peak_year',      'Career peak',   '1982 – 1988',                                            2),
      h('merit2','merit',          'Merit',         '3× Roland Garros champion (1982, 1985, 1988)',          3),
      h('merit3','merit',          'Merit',         'Won Melbourne Grand Slam twice (1983, 1984)',             3),
      h('merit4','merit',          'Merit',         '1× US Open champion (1988)',                             4),
      h('merit5','merit',          'Merit',         'World No. 1 (1988)',                                     4),
      h('merit1','merit',          'Merit',         '7 Grand Slam singles titles — won 3 different Slams in 1988',5),
      h('sig',   'characteristic', 'Signature',     'Baseline grinder who won on every surface except grass', 5),
    ],
  },

  'ingemar-stenmark': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Alpine skier',                                           1),
      h('bd',    'birth_date',     'Date of birth', 'March 18, 1956',                                         2),
      h('bp',    'birth_place',    'Place of birth','Tärnaby',                                                 2),
      h('pk',    'peak_year',      'Career peak',   '1974 – 1989',                                            2),
      h('merit2','merit',          'Merit',         '2× Olympic gold medals (1980 Lake Placid — slalom + GS)',3),
      h('fact2', 'characteristic', 'Record',        'Held world record of 86 World Cup victories for decades', 4),
      h('merit1','merit',          'Merit',         '3× overall World Cup champion (1976, 1977, 1978)',       5),
      h('sig',   'characteristic', 'Signature',     'Technical slalom genius from a tiny Arctic village (Tärnaby)',5),
      h('fact3', 'characteristic', 'Background',     'Grew up in tiny Tärnaby — just 100 km from the Arctic Circle',           2),
      h('merit3','merit',          'Merit',          '58 slalom victories alone — a World Cup record that still stands today', 3),
    ],
  },

  'peter-forsberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('bd',    'birth_date',     'Date of birth', 'July 20, 1973',                                          2),
      h('bp',    'birth_place',    'Place of birth','Örnsköldsvik',                                            2),
      h('pk',    'peak_year',      'Career peak',   '1995 – 2004',                                            2),
      h('club1', 'club',           'Club',          'Quebec Nordiques / Colorado Avalanche (1994–2004)',      3),
      h('merit2','merit',          'Merit',         '2× Olympic gold medals (1994, 2006)',                   3),
      h('merit3','merit',          'Merit',         '2× Hart Trophy (NHL MVP)',                               4),
      h('merit1','merit',          'Merit',         '2× Stanley Cup champion (1996, 2001)',                   5),
      h('sig',   'characteristic', 'Signature',     'Widely considered one of the greatest ice hockey players of all time',5),
      h('ht',    'height',         'Height',         '180 cm — low centre of gravity, almost impossible to knock off the puck', 3),
    ],
  },

  'henrik-larsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Helsingborg',                                         1),
      h('ht',     'height',     'Height',            '177 cm',                                              2),
      h('club1',  'club',       'Club History',      'Helsingborgs IF (1992–1993)',                         3),
      h('club2',  'club',       'Club History',      'Feyenoord (1993–1997)',                               3),
      h('club3',  'club',       'Club History',      'Celtic FC (1997–2004)',                               4),
      h('club4',  'club',       'Club History',      'FC Barcelona (2004–2006)',                            4),
      h('ctrop1', 'merit',      'Club Trophy',       'Scottish Premier League × 4 (Celtic)',               4),
      h('ctrop2', 'merit',      'Club Trophy',       'Scottish Cup × 2 (Celtic)',                          4),
      h('itrop',  'merit',      'Individual Trophy', 'Guldbollen 1996, 1998 — Player of the Year',         5),
    ],
  },

  'mats-sundin': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('bd',    'birth_date',     'Date of birth', 'February 13, 1971',                                      2),
      h('bp',    'birth_place',    'Place of birth','Bromma, Stockholm',                                      2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2009',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medal',                           3),
      h('merit3','merit',          'Merit',         'Olympic gold (2006)',                                     3),
      h('merit4','merit',          'Merit',         '564 career NHL goals',                                   4),
      h('club1', 'club',           'Club',          'Toronto Maple Leafs — captain 1997–2008',               5),
      h('sig',   'characteristic', 'Signature',     'First European-born player taken 1st overall in NHL Draft (1989)',5),
      h('jn',    'jersey_number',  'Jersey number',  '#13 — Toronto Maple Leafs captain for 11 consecutive seasons',            3),
    ],
  },

  'nicklas-lidstrom': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey defenseman',                                  1),
      h('bd',    'birth_date',     'Date of birth', 'April 28, 1970',                                         2),
      h('bp',    'birth_place',    'Place of birth','Västerås',                                                2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2012',                                            2),
      h('merit2','merit',          'Merit',         '7× Norris Trophy (best NHL defenseman)',                 3),
      h('merit3','merit',          'Merit',         'Olympic gold (2006)',                                     3),
      h('merit4','merit',          'Merit',         '4× Stanley Cup champion (1997, 1998, 2002, 2008)',       4),
      h('club1', 'club',           'Club',          'Detroit Red Wings (1991–2012) — captain',               5),
      h('sig',   'characteristic', 'Signature',     'Considered the greatest defenseman in hockey history',   5),
      h('ht',    'height',         'Height',         '187 cm (6\"2\") — textbook defenseman physique and skating stride',       3),
    ],
  },

  'armand-duplantis': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Pole vault athlete',                                     1),
      h('bd',    'birth_date',     'Date of birth', 'November 10, 2000',                                      2),
      h('bp',    'birth_place',    'Place of birth','Lafayette, Louisiana, USA',                             2),
      h('pk',    'peak_year',      'Career peak',   '2020 – present',                                         2),
      h('fact2', 'characteristic', 'Family',        'Father Greg Duplantis is a former pole vaulter from Louisiana',3),
      h('merit2','merit',          'Merit',         'Multiple world record breaks — each with the audience watching',3),
      h('merit3','merit',          'Merit',         'Olympic gold medal Tokyo 2020',                          4),
      h('merit1','merit',          'Merit',         'World record: 6.26 m (2024) — "Mondo"',                  5),
      h('sig',   'characteristic', 'Signature',     'Nicknamed "Mondo" — smashes his own world record repeatedly',5),
      h('nm',    'characteristic', 'Nickname',       '"Mondo" — a childhood nickname he has always used',                     3),
    ],
  },

  'annika-sorenstam': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'October 9, 1970',                                        2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1995 – 2008',                                            2),
      h('merit2','merit',          'Merit',         '89 LPGA Tour victories — 3rd most in history',           3),
      h('merit3','merit',          'Merit',         '18 major championships',                                 4),
      h('merit1','merit',          'Merit',         'World Golf Hall of Fame inductee',                       5),
      h('sig',   'characteristic', 'Signature',     'Dominated women\'s golf for over a decade — the "Tiger Woods" of women\'s golf',5),
      h('fact2', 'characteristic', 'History',        'First woman in 58 years to compete on the PGA Tour (2003)',              3),
      h('merit4','merit',          'Merit',          'Completed the LPGA Career Grand Slam twice',                            4),
    ],
  },

  'carola-haggkvist': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('bd',    'birth_date',     'Date of birth', 'April 11, 1967',                                         2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1983 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"The Wheel of Life" (1991)',                              3),
      h('fact2', 'characteristic', 'Religion',      'Known as a Christian artist and spokesperson',           3),
      h('merit2','merit',          'Merit',         '2× Melodifestivalen winner',                             4),
      h('s2',    'song',           'Eurovision hit','"Fångad av en stormvind" — won Eurovision 1991',         5),
      h('sig',   'characteristic', 'Signature',     'Won Eurovision Song Contest 1991 in Rome',              5),
      h('s3',    'song',           'Hit song',       '"Det händer mig igen" (1991)',                                           3),
    ],
  },

  'per-gessle': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist & songwriter',                              1),
      h('bd',    'birth_date',     'Date of birth', 'January 12, 1959',                                       2),
      h('bp',    'birth_place',    'Place of birth','Halmstad',                                                2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 2002',                                            2),
      h('band',  'lead_singer',    'Also known as', 'Co-founder of Roxette (with Marie Fredriksson)',         3),
      h('s1',    'song',           'Roxette hit',   '"The Look" (1988)',                                      4),
      h('s2',    'song',           'Roxette hit',   '"Joyride" (1991)',                                       4),
      h('sig',   'characteristic', 'Signature',     'Wrote most of Roxette\'s multi-million selling worldwide hits',5),
      h('s3',    'song',           'Roxette hit',    '"It Must Have Been Love" (1990) — his composition for Pretty Woman OST', 3),
      h('fact2', 'characteristic', 'Solo career',    'Also led Gyllene Tider — one of the biggest rock bands of the 1980s', 3),
    ],
  },

  'marie-fredriksson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Legacy',        'One of the most beloved voices in pop music',            1),
      h('bd',    'birth_date',     'Date of birth', 'May 30, 1958',                                           2),
      h('bp',    'birth_place',    'Place of birth','Össjö, Kristianstad',                                    2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 2002',                                            2),
      h('band',  'lead_singer',    'Also known as', 'Lead vocalist of Roxette (with Per Gessle)',             3),
      h('fact2', 'characteristic', 'Health',        'Battled serious health challenges from 2002 and continued her musical career',3),
      h('s1',    'song',           'Roxette hit',   '"Listen to Your Heart" (1989)',                          4),
      h('s2',    'song',           'Roxette hit',   '"It Must Have Been Love" (1990)',                        5),
      h('sig',   'characteristic', 'Signature',     'The voice of Roxette — her loss in December 2019 was felt worldwide',5),
    ],
  },

  'robyn': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Legacy',        'Pioneer of electropop and feminist pop',                  1),
      h('bd',    'birth_date',     'Date of birth', 'June 12, 1979',                                          2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1997 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"With Every Heartbeat" (2007)',                           3),
      h('s2',    'song',           'Hit song',      '"Be Mine!" (2005)',                                       3),
      h('s3',    'song',           'Hit song',      '"Call Your Girlfriend" (2011)',                           4),
      h('s4',    'song',           'Hit song',      '"Show Me Love" (1997)',                                   4),
      h('s5',    'song',           'Iconic hit',    '"Dancing On My Own" (2010)',                              5),
      h('sig',   'characteristic', 'Signature',     '"Dancing On My Own" became one of the greatest breakup songs ever',5),
    ],
  },

  'hakan-hellstrom': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('bd',    'birth_date',     'Date of birth', 'April 7, 1974',                                          2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg',                                              2),
      h('pk',    'peak_year',      'Career peak',   '2000 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Du är det vackraste jag vet" (2000)',                    3),
      h('s2',    'song',           'Hit song',      '"Känn ingen sorg för mig Göteborg" (2003)',              3),
      h('s3',    'song',           'Hit song',      '"Kom igen Lena!" (2008)',                                 4),
      h('sig',   'characteristic', 'Signature',     'Voice of Gothenburg — most adored rock troubadour',      5),
      h('alb1',  'album',          'Album',          '"Vinter och vår" (2002)',                                               3),
      h('fact2', 'characteristic', 'Live legend',    'Sold out Ullevi (50 000 seats) in Gothenburg multiple times',           4),
    ],
  },

  'freddie-ljungberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Vittsjö',                                             1),
      h('ht',     'height',     'Height',            '178 cm',                                              2),
      h('club1',  'club',       'Club History',      'Halmstads BK (1994–1998)',                            3),
      h('club2',  'club',       'Club History',      'Arsenal FC (1998–2007)',                              4),
      h('ctrop1', 'merit',      'Club Trophy',       'Premier League 2001–02 (Arsenal)',                    4),
      h('ctrop2', 'merit',      'Club Trophy',       'FA Cup × 3 (Arsenal 2002, 2003, 2005)',               4),
      h('ctrop3', 'merit',      'Club Trophy',       'Arsenal Invincibles 2003–04 — unbeaten league season', 5),
    ],
  },

  'martin-dahlin': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Liatorp',                                             1),
      h('ht',     'height',     'Height',            '178 cm',                                              2),
      h('club1',  'club',       'Club History',      'Malmö FF (1988–1991)',                                3),
      h('club2',  'club',       'Club History',      'Borussia Mönchengladbach (1991–1996)',                3),
      h('club3',  'club',       'Club History',      'AS Roma (1996–1997)',                                 4),
      h('club4',  'club',       'Club History',      'Blackburn Rovers (1997–1998)',                        4),
      h('ntrop',  'merit',      'National Trophy',   '1994 FIFA World Cup — national team finished 3rd',    5),
      h('itrop',  'merit',      'Individual Trophy', 'Guldbollen 1991 — Player of the Year',                5),
    ],
  },

  // ── INTERNATIONELLA LEGENDER ───────────────────────────────────────────────

  'david-beckham': {
    categoryLabel: 'Athlete',
    nationality: 'england',
    hints: [
      h('prof',   'profession', 'Profession',       'Football player',                                     1),
      h('bp',     'birth_place','Born',              'Leytonstone, London',                                 1),
      h('ht',     'height',     'Height',            '183 cm',                                              2),
      h('club1',  'club',       'Club History',      'Manchester United (1993–2003)',                       3),
      h('club2',  'club',       'Club History',      'Real Madrid (2003–2007)',                             4),
      h('club3',  'club',       'Club History',      'LA Galaxy (2007–2012)',                               4),
      h('ctrop1', 'merit',      'Club Trophy',       'Premier League × 6 (Manchester United)',              4),
      h('ctrop2', 'merit',      'Club Trophy',       'La Liga 2006–07 (Real Madrid)',                       4),
      h('ctrop3', 'merit',      'Club Trophy',       'UEFA Champions League 1999 (Manchester United)',      5),
    ],
  },

  'wayne-gretzky': {
    categoryLabel: 'Athlete',
    nationality: 'canada',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('bd',    'birth_date',     'Date of birth', 'January 26, 1961',                                       2),
      h('bp',    'birth_place',    'Place of birth','Brantford, Ontario',                                      2),
      h('pk',    'peak_year',      'Career peak',   '1979 – 1994',                                            2),
      h('merit2','merit',          'Record',        'Holds over 60 NHL records — single-season and career',   3),
      h('club2', 'club',           'Club',          'Los Angeles Kings (1988–1996)',                          3),
      h('merit3','merit',          'Merit',         '4× Stanley Cup champion with Edmonton Oilers',           4),
      h('kn',    'characteristic', 'Known as',      '"The Great One"',                                        4),
      h('merit1','merit',          'Merit',         '894 career NHL goals — no other player has scored 900',  5),
      h('sig',   'characteristic', 'Signature',     '"The Great One" — his career assists alone exceed any player\'s total points',5),
    ],
  },

  'frank-sinatra': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist & actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'December 12, 1915',                                      2),
      h('bp',    'birth_place',    'Place of birth','Hoboken, New Jersey, USA',                                2),
      h('pk',    'peak_year',      'Career peak',   '1943 – 1980',                                            2),
      h('s1',    'song',           'Classic song',  '"New York, New York" (1980)',                             3),
      h('s2',    'song',           'Classic song',  '"Fly Me to the Moon" (1964)',                             3),
      h('s3',    'song',           'Classic song',  '"Summer Wind" (1966)',                                    3),
      h('fact2', 'characteristic', 'Rat Pack',      'Leader of the "Rat Pack" (Dean Martin, Sammy Davis Jr.)',3),
      h('kn',    'characteristic', 'Known as',      '"Ol\' Blue Eyes"',                                       4),
      h('s4',    'song',           'Signature song','"My Way" (1969)',                                         5),
      h('sig',   'characteristic', 'Signature',     'Fedora hat and tuxedo — the original "crooner"',         5),
    ],
  },

  'elton-john': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist & pianist',                                 1),
      h('fact1', 'characteristic', 'Honours',       'Knighted "Sir Elton John" in 1998',                     1),
      h('bd',    'birth_date',     'Date of birth', 'March 25, 1947',                                         2),
      h('bp',    'birth_place',    'Place of birth','Pinner, Middlesex',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1970 – 1983',                                            2),
      h('s1',    'song',           'Hit song',      '"Crocodile Rock" (1972)',                                 3),
      h('s2',    'song',           'Hit song',      '"Tiny Dancer" (1971)',                                    3),
      h('s3',    'song',           'Hit song',      '"I\'m Still Standing" (1983)',                            3),
      h('s4',    'song',           'Hit song',      '"Rocket Man" (1972)',                                     4),
      h('s5',    'song',           'Hit song',      '"Your Song" (1970)',                                      4),
      h('fact2', 'characteristic', 'Known for',     'Extravagant and outrageous stage outfits and glasses',   4),
      h('s6',    'song',           'Iconic song',   '"Candle in the Wind" (1973, re-recorded 1997 for Princess Diana)',5),
      h('sig',   'characteristic', 'Signature',     'Huge elton-john-style glasses and sequined suits',       5),
    ],
  },

  'david-bowie': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Personas',      'Created many alter egos — Ziggy Stardust, Aladdin Sane, The Thin White Duke',1),
      h('bd',    'birth_date',     'Date of birth', 'January 8, 1947',                                        2),
      h('bp',    'birth_place',    'Place of birth','Brixton, London',                                         2),
      h('pk',    'peak_year',      'Career peak',   '1972 – 1984',                                            2),
      h('s1',    'song',           'Hit song',      '"Let\'s Dance" (1983)',                                   3),
      h('s2',    'song',           'Hit song',      '"Life on Mars?" (1971)',                                  3),
      h('s3',    'song',           'Hit song',      '"Heroes" (1977)',                                         4),
      h('s4',    'song',           'Hit song',      '"Starman" (1972)',                                        4),
      h('s5',    'song',           'Hit song',      '"Space Oddity" (1969)',                                   5),
      h('sig',   'characteristic', 'Signature',     'Lightning bolt face-paint + mismatched eyes (Anisocoria)',5),
    ],
  },

  'prince': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Genius',        'Multi-instrumentalist — played over 27 instruments',    1),
      h('bd',    'birth_date',     'Date of birth', 'June 7, 1958',                                           2),
      h('bp',    'birth_place',    'Place of birth','Minneapolis, Minnesota, USA',                             2),
      h('pk',    'peak_year',      'Career peak',   '1982 – 1995',                                            2),
      h('s1',    'song',           'Hit song',      '"Kiss" (1986)',                                           3),
      h('s2',    'song',           'Hit song',      '"Sign "☮" the Times" (1987)',                             3),
      h('s3',    'song',           'Hit song',      '"Raspberry Beret" (1985)',                                3),
      h('fact2', 'characteristic', 'Name change',   'Changed his name to unpronounceable symbol ♒ (1993–2000)',3),
      h('s4',    'song',           'Hit song',      '"When Doves Cry" (1984)',                                 4),
      h('s5',    'song',           'Hit song',      '"Purple Rain" (1984)',                                    5),
      h('sig',   'characteristic', 'Signature',     'Ruffled shirts, high-heeled boots, purple everything',   5),
    ],
  },

  'taylor-swift': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Record',        'Most Grammy wins by any female artist',                  1),
      h('bd',    'birth_date',     'Date of birth', 'December 13, 1989',                                      2),
      h('bp',    'birth_place',    'Place of birth','West Reading, Pennsylvania, USA',                         2),
      h('pk',    'peak_year',      'Career peak',   '2008 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Blank Space" (2014)',                                    3),
      h('s2',    'song',           'Hit song',      '"Anti-Hero" (2022)',                                      3),
      h('s3',    'song',           'Hit song',      '"Shake It Off" (2014)',                                   3),
      h('s4',    'song',           'Hit song',      '"Love Story" (2008)',                                     4),
      h('merit', 'merit',          'Achievement',   '"Eras Tour" (2023) — highest-grossing concert tour ever',4),
      h('s5',    'song',           'Hit song',      '"Bad Blood" (2015)',                                      4),
      h('s6',    'song',           'Iconic hit',    '"Shake It Off" (2014)',                                   5),
      h('sig',   'characteristic', 'Signature',     '"Swifties" fanbase + re-recording all old albums as "Taylor\'s Version"',5),
    ],
  },

  'billie-eilish': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Record',        'Youngest person to win all 4 major Grammy categories',  1),
      h('bd',    'birth_date',     'Date of birth', 'December 18, 2001',                                      2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California, USA',                            2),
      h('pk',    'peak_year',      'Career peak',   '2019 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Ocean Eyes" (2016)',                                     3),
      h('s2',    'song',           'Hit song',      '"Lovely" (2018)',                                         3),
      h('s3',    'song',           'Hit song',      '"Happier Than Ever" (2021)',                              3),
      h('s4',    'song',           'James Bond theme','"No Time to Die" (2020 — James Bond theme)',           4),
      h('sig2',  'characteristic', 'Known for',     'Oversized streetwear + green roots hair in early career',4),
      h('s5',    'song',           'Breakthrough hit','"Bad Guy" (2019)',                                      5),
      h('sig',   'characteristic', 'Signature',     'Made history as youngest-ever James Bond theme artist', 5),
    ],
  },

  'kobe-bryant': {
    categoryLabel: 'Athlete',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Basketball player',                                      1),
      h('fact1', 'characteristic', 'Legacy',        '20-year NBA career, all with the Los Angeles Lakers',    1),
      h('bd',    'birth_date',     'Date of birth', 'August 23, 1978',                                        2),
      h('bp',    'birth_place',    'Place of birth','Philadelphia, Pennsylvania, USA',                         2),
      h('pk',    'peak_year',      'Career peak',   '2000 – 2013',                                            2),
      h('jn',    'jersey_number',  'Jersey number', '#8 and #24 (both retired by LA Lakers)',                 3),
      h('merit2','merit',          'Merit',         '4× NBA Finals MVP',                                      3),
      h('merit3','merit',          'Merit',         '2× Olympic gold medals (2008, 2012)',                    3),
      h('club1', 'club',           'Club',          'Los Angeles Lakers (1996–2016)',                         4),
      h('kn',    'characteristic', 'Known as',      '"Black Mamba"',                                          4),
      h('merit1','merit',          'Merit',         '5× NBA Champion (2000, 2001, 2002, 2009, 2010)',         5),
      h('sig',   'characteristic', 'Signature',     '"Mamba Mentality" — obsessive work ethic and competitive drive',5),
    ],
  },

  'ingrid-bergman': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Legacy',        'Considered one of the greatest actresses in Hollywood history',1),
      h('bd',    'birth_date',     'Date of birth', 'August 29, 1915',                                        2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1942 – 1956',                                            2),
      h('mv1',   'movie',          'Film',          '"Autumn Sonata" (1978) — directed by Ingmar Bergman',    3),
      h('mv2',   'movie',          'Film',          '"For Whom the Bell Tolls" (1943)',                        3),
      h('mv3',   'movie',          'Film',          '"Notorious" (1946) — directed by Hitchcock',             4),
      h('mv4',   'movie',          'Film',          '"Casablanca" (1942) — "Here\'s looking at you, kid"',    5),
      h('merit', 'merit',          'Achievement',   '3× Academy Award winner',                                5),
      h('sig',   'characteristic', 'Signature',     'Scandinavian actress who became a Hollywood legend',     5),
    ],
  },

  // ── BAND ──────────────────────────────────────────────────────────────────

  'abba': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Pop/pop music group',                                    1),
      h('fact1', 'member_count',   'Members',       '4 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Stockholm',                                               2),
      h('pk',    'peak_year',      'Active years',  '1972 – 1982 (reunited 2021)',                             2),
      h('m1',    'band_member',    'Member',        'Agnetha Fältskog (vocals)',                               3),
      h('m2',    'band_member',    'Member',        'Björn Ulvaeus (guitar/vocals)',                           3),
      h('m3',    'band_member',    'Member',        'Benny Andersson (keyboard/vocals)',                       3),
      h('m4',    'band_member',    'Member',        'Anni-Frid "Frida" Lyngstad (vocals)',                    3),
      h('s1',    'song',           'Hit song',      '"Fernando" (1976)',                                       3),
      h('s2',    'song',           'Hit song',      '"The Winner Takes It All" (1980)',                        3),
      h('s3',    'song',           'Hit song',      '"Voulez-Vous" (1979)',                                    3),
      h('merit', 'merit',          'Achievement',   'Mamma Mia! musical based on their songs ran 14+ years in West End',3),
      h('alb1',  'album',          'Iconic album',  '"Arrival" (1976)',                                        4),
      h('s4',    'song',           'Eurovision hit','"Waterloo" — won Eurovision Song Contest 1974',           5),
      h('s5',    'song',           'Iconic hit',    '"Dancing Queen" (1976)',                                  5),
      h('sig',   'characteristic', 'Signature',     'ABBA stands for the first letters of members\' names: Agnetha, Björn, Benny, Anni-Frid',5),
    ],
  },

  'roxette': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Pop duo',                                                1),
      h('fact1', 'member_count',   'Members',       '2 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Halmstad',                                                2),
      h('pk',    'peak_year',      'Active years',  '1986 – 2019',                                            2),
      h('m1',    'lead_singer',    'Lead singer',   'Marie Fredriksson (1958–2019, vocals)',                   3),
      h('m2',    'band_member',    'Member',        'Per Gessle (guitar/vocals)',                              3),
      h('s1',    'song',           'Hit song',      '"Joyride" (1991)',                                        3),
      h('s2',    'song',           'Hit song',      '"Listen to Your Heart" (1989)',                           3),
      h('s3',    'song',           'Film hit',      '"It Must Have Been Love" (1990) — from "Pretty Woman"',  5),
      h('s4',    'song',           'Iconic hit',    '"The Look" (1989)',                                       5),
      h('sig',   'characteristic', 'Signature',     '"The Look" reached #1 in USA — first Scandinavian duo to do so',5),
    ],
  },

  'beatles': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Rock group',                                             1),
      h('fact1', 'member_count',   'Members',       '4 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Liverpool',                                               2),
      h('pk',    'peak_year',      'Active years',  '1960 – 1970',                                            2),
      h('m1',    'band_member',    'Member',        'John Lennon (vocals/guitar) — songwriting genius',       3),
      h('m2',    'band_member',    'Member',        'Paul McCartney (vocals/bass)',                            3),
      h('m3',    'band_member',    'Member',        'George Harrison (guitar) — lead guitarist',              3),
      h('m4',    'band_member',    'Member',        'Ringo Starr (drums)',                                     3),
      h('s1',    'song',           'Hit song',      '"Yesterday" (1965)',                                      3),
      h('s2',    'song',           'Hit song',      '"Come Together" (1969)',                                  3),
      h('alb1',  'album',          'Iconic album',  '"Abbey Road" (1969) — famous zebra crossing cover',      4),
      h('alb2',  'album',          'Iconic album',  '"Sgt. Pepper\'s Lonely Hearts Club Band" (1967)',        4),
      h('s3',    'song',           'Iconic hit',    '"Hey Jude" (1968)',                                       5),
      h('s4',    'song',           'Iconic hit',    '"Let It Be" (1970)',                                      5),
      h('sig',   'characteristic', 'Signature',     'Mop-top haircuts + suited appearance — the original boyband',5),
    ],
  },

  'queen': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Rock group',                                             1),
      h('fact1', 'member_count',   'Members',       '4 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'London',                                                  2),
      h('pk',    'peak_year',      'Active years',  '1970 – 1991 (ongoing without Freddie)',                   2),
      h('m2',    'band_member',    'Member',        'Brian May (guitar)',                                      3),
      h('m3',    'band_member',    'Member',        'Roger Taylor (drums)',                                    3),
      h('m4',    'band_member',    'Member',        'John Deacon (bass)',                                      3),
      h('s1',    'song',           'Hit song',      '"We Are the Champions" (1977)',                           3),
      h('s2',    'song',           'Hit song',      '"Don\'t Stop Me Now" (1979)',                             3),
      h('s3',    'song',           'Hit song',      '"Somebody to Love" (1976)',                               3),
      h('m1',    'lead_singer',    'Lead singer',   'Freddie Mercury (lead vocals, piano)',                    4),
      h('merit', 'merit',          'Achievement',   'Live Aid 1985 — considered one of the greatest live performances ever',4),
      h('s4',    'song',           'Iconic hit',    '"We Will Rock You" (1977)',                               5),
      h('s5',    'song',           'Signature song','"Bohemian Rhapsody" (1975) — 6-minute operatic rock epic',5),
      h('sig',   'characteristic', 'Legacy',        'Over 300 million records sold worldwide',                5),
    ],
  },

  'nirvana': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Category',      'Grunge/rock group',                                      1),
      h('fact1', 'member_count',   'Members',       '3 members (in final lineup)',                             1),
      h('bp',    'birth_place',    'Origin',        'Aberdeen, Washington, USA',                               2),
      h('pk',    'peak_year',      'Active years',  '1987 – 1994',                                            2),
      h('m2',    'band_member',    'Member',        'Krist Novoselic (bass)',                                  3),
      h('m3',    'band_member',    'Member',        'Dave Grohl (drums) — later founded Foo Fighters',         3),
      h('s1',    'song',           'Hit song',      '"Come as You Are" (1991)',                               3),
      h('s2',    'song',           'Hit song',      '"Lithium" (1992)',                                        3),
      h('s3',    'song',           'Hit song',      '"Heart-Shaped Box" (1993)',                               3),
      h('m1',    'lead_singer',    'Lead singer',   'Kurt Cobain (guitar, vocals) — creative force behind Nirvana',4),
      h('alb1',  'album',          'Iconic album',  '"Nevermind" (1991) — baby swimming for dollar bill cover',4),
      h('s4',    'song',           'Iconic hit',    '"Smells Like Teen Spirit" (1991)',                        5),
      h('sig',   'characteristic', 'Signature',     '"Teen Spirit" defined a generation and ended the hair metal era',5),
    ],
  },

  // ── LÄNGDSKIDÅKARE (SVERIGE) ──────────────────────────────────────────────

  'assar-ronnlund': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'August 26, 1937',                                        2),
      h('bp',    'birth_place',    'Place of birth','Nacka',                                                   2),
      h('pk',    'peak_year',      'Career peak',   '1958 – 1968',                                            2),
      h('merit1','merit',          'Merit',         'Olympic gold medal — relay 4×10 km (1964 Innsbruck)',    5),
      h('merit2','merit',          'Merit',         'World Championship gold medals',                         4),
      h('sig',   'characteristic', 'Signature',     'Part of Sweden\'s dominant cross-country skiing era of the 1960s',5),
      h('fact2', 'characteristic', 'Era',            'Competed before modern carbon-fibre skis — relied on pure technique',     2),
      h('fact3', 'characteristic', 'Team',           'Part of Sweden\'s legendary 1960s cross-country Olympic squad',          2),
      h('merit3','merit',          'Merit',          'Relay gold at 1964 Innsbruck — one of Sweden\'s proudest Winter Olympics', 3),
    ],
  },

  'sixten-jernberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'February 6, 1929',                                       2),
      h('bp',    'birth_place',    'Place of birth','Lima, Dalarna',                                           2),
      h('pk',    'peak_year',      'Career peak',   '1952 – 1964',                                            2),
      h('merit2','merit',          'Merit',         'Competed at 4 consecutive Winter Olympics (1952–1964)',  3),
      h('merit3','merit',          'Merit',         '3 Olympic silver and 2 bronze medals',                  3),
      h('merit1','merit',          'Merit',         '4 Olympic gold medals across 4 Olympics',               5),
      h('sig',   'characteristic', 'Signature',     'Considered one of the greatest cross-country skiers of all time',5),
      h('fact3', 'characteristic', 'Endurance',      'Competed until age 35 — extraordinary longevity at elite level',         2),
      h('fact4', 'characteristic', 'Background',     'From Lima, a village in Dalarna that produced multiple champions',       2),
    ],
  },

  'torgny-mogren': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'August 25, 1961',                                        2),
      h('bp',    'birth_place',    'Place of birth','Umeå',                                                    2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1994',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medals',                         3),
      h('merit1','merit',          'Merit',         'Olympic gold — 50 km classical (1988 Calgary)',          5),
      h('sig',   'characteristic', 'Signature',     'Dominated long-distance cross-country in the late 1980s',5),
      h('merit3','merit',          'Merit',          'Multiple World Cup stage victories in the 1980s and 1990s',               3),
      h('fact2', 'characteristic', 'Distance',       'Specialised in the 50 km — the toughest cross-country race',             3),
      h('fact3', 'characteristic', 'Background',     'From Umeå — in the heart of northern Nordic sports culture',           2),
    ],
  },

  'per-olofsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'October 7, 1973',                                        2),
      h('bp',    'birth_place',    'Place of birth','Norrland',                                                2),
      h('pk',    'peak_year',      'Career peak',   '2000 – 2010',                                            2),
      h('merit1','merit',          'Merit',         'National cross-country team member 2000s',               4),
      h('sig',   'characteristic', 'Signature',     'Consistent World Cup performer in cross-country skiing',5),
    ],
  },

  'ebba-andersson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'July 10, 1997',                                          2),
      h('bp',    'birth_place',    'Place of birth','Norrland',                                                2),
      h('pk',    'peak_year',      'Career peak',   '2020 – present',                                         2),
      h('merit2','merit',          'Merit',         'World Championship medals',                              3),
      h('merit1','merit',          'Merit',         'Rising star of Nordic cross-country skiing',             4),
      h('sig',   'characteristic', 'Signature',     'Part of new generation carrying the Nordic cross-country tradition',5),
      h('fact2', 'characteristic', 'Generation',     'Carries on the great cross-country tradition into the 2020s',           2),
      h('fact3', 'characteristic', 'Versatility',    'Strong across sprint and distance disciplines',                          2),
      h('merit3','merit',          'Merit',          'World Championship relay medal in cross-country skiing',                 3),
    ],
  },

  'anders-sodergren': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'September 8, 1977',                                      2),
      h('bp',    'birth_place',    'Place of birth','Norrland',                                                2),
      h('pk',    'peak_year',      'Career peak',   '2002 – 2014',                                            2),
      h('merit2','merit',          'Merit',         'World Championship and World Cup medals',                3),
      h('merit1','merit',          'Merit',         'World Cup stage victories in cross-country skiing',      4),
      h('sig',   'characteristic', 'Signature',     'Reliable long-distance cross-country performer',         5),
      h('fact2', 'characteristic', 'Style',          'Known for reliable long-distance technique and race consistency',          2),
      h('merit3','merit',          'Merit',          'World Cup stage victories in cross-country skiing in the 2000s',          3),
      h('fact3', 'characteristic', 'Team',           'Competed alongside Charlotte Kalla in the national team era',            2),
    ],
  },

  'gunde-svan': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'January 12, 1962',                                       2),
      h('bp',    'birth_place',    'Place of birth','Tynäset, Dalarna',                                        2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1991',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medals',                         3),
      h('merit3','merit',          'Merit',         'Olympic relay gold (1984, 1988)',                        3),
      h('merit1','merit',          'Merit',         '2× Olympic individual gold medals (1984 Sarajevo)',      5),
      h('sig',   'characteristic', 'Signature',     'One of the greatest cross-country skiers of the 1980s — dominated 1984',5),
      h('fact2', 'characteristic', 'Distances',      'Dominated the 15 km and 50 km events throughout the 1980s',              2),
      h('fact3', 'characteristic', 'Background',     'From Tynäset, Dalarna — heartland of Nordic cross-country skiing',      2),
    ],
  },

  // ── SKIDSKYTTAR (SVERIGE) ─────────────────────────────────────────────────

  'hanna-oberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('fact1', 'characteristic', 'Family',        'Older sister of biathlete Elvira Öberg',                 1),
      h('bd',    'birth_date',     'Date of birth', 'March 22, 1995',                                         2),
      h('bp',    'birth_place',    'Place of birth','Östersund',                                               2),
      h('pk',    'peak_year',      'Career peak',   '2018 – present',                                         2),
      h('merit2','merit',          'Merit',         'Multiple World Championship gold medals',                3),
      h('merit3','merit',          'Merit',         'National biathlon team — multiple World Cup titles',     3),
      h('merit1','merit',          'Merit',         'Olympic gold — individual (2018 PyeongChang)',           5),
      h('sig',   'characteristic', 'Signature',     'Dominated individual biathlon with precision shooting',  5),
      h('fact2', 'characteristic', 'Home',           'Trains in Östersund — Nordic biathlon capital',                          3),
    ],
  },

  'elvira-oberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('fact1', 'characteristic', 'Family',        'Younger sister of Olympic champion Hanna Öberg',        1),
      h('bd',    'birth_date',     'Date of birth', 'September 19, 1999',                                     2),
      h('bp',    'birth_place',    'Place of birth','Östersund',                                               2),
      h('pk',    'peak_year',      'Career peak',   '2021 – present',                                         2),
      h('merit2','merit',          'Merit',         'World Cup victories and podium finishes',                3),
      h('merit1','merit',          'Merit',         'Olympic silver — mass start (2022 Beijing)',             5),
      h('sig',   'characteristic', 'Signature',     'Both Öberg sisters competing at elite level simultaneously',5),
      h('fact2', 'characteristic', 'Progress',       'Shooting accuracy improved dramatically each World Cup season',           2),
      h('fact3', 'characteristic', 'Circuit',        'Among the most consistent young biathletes on the World Cup circuit',   3),
    ],
  },

  'martin-ponsilouma': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('bp',    'birth_place',    'Place of birth','Scandinavia',                                             2),
      h('merit1','merit',          'Merit',         'Nordic national biathlon team — World Cup competitor',   4),
      h('sig',   'characteristic', 'Signature',     'Nordic biathlete on the World Cup circuit',              5),
    ],
  },

  'sebastian-samuelsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('bd',    'birth_date',     'Date of birth', 'February 21, 1997',                                      2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg',                                              2),
      h('pk',    'peak_year',      'Career peak',   '2018 – present',                                         2),
      h('merit2','merit',          'Merit',         'World Championship medals',                              3),
      h('merit1','merit',          'Merit',         'Olympic silver — mass start (2018 PyeongChang)',         5),
      h('sig',   'characteristic', 'Signature',     'Fast shooting and consistent pursuit performances',      5),
      h('fact2', 'characteristic', 'Speed',       'One of the fastest skiers on the biathlon World Cup circuit',             2),
      h('merit3','merit',          'Merit',          'World Championship medals in individual and pursuit events',             3),
      h('fact3', 'characteristic', 'Style',          'Strong nerve under pressure — excels in mass-start shooting stages',    3),
    ],
  },

  'bjorn-ferry': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('bd',    'birth_date',     'Date of birth', 'January 19, 1979',                                       2),
      h('bp',    'birth_place',    'Place of birth','Jokkmokk (Sami heritage)',                                2),
      h('pk',    'peak_year',      'Career peak',   '2006 – 2014',                                            2),
      h('merit2','merit',          'Merit',         'World Championship medals in biathlon',                  3),
      h('merit1','merit',          'Merit',         'Olympic gold — pursuit (2010 Vancouver)',                5),
      h('sig',   'characteristic', 'Signature',     'From Jokkmokk in the far north — a place of biathlon tradition',5),
      h('fact2', 'characteristic', 'Heritage',       'Of Sami heritage from Jokkmokk — the indigenous far north',              2),
      h('merit3','merit',          'Merit',          'World Championship medals across multiple biathlon disciplines',          3),
      h('fact3', 'characteristic', 'Combination',    'Rare blend of exceptional skiing speed and calm shooting technique',    3),
    ],
  },

  // ── SVENSKA SKÅDESPELARE ──────────────────────────────────────────────────

  'greta-garbo': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Mystery',       'Became a famous recluse after retiring from acting',    1),
      h('bd',    'birth_date',     'Date of birth', 'September 18, 1905',                                     2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '1926 – 1941',                                            2),
      h('mv1',   'movie',          'Film',          '"Anna Karenina" (1935)',                                  3),
      h('mv2',   'movie',          'Film',          '"Queen Christina" (1933)',                               3),
      h('mv3',   'movie',          'Film',          '"Ninotchka" (1939) — comedy film',                       4),
      h('mv4',   'movie',          'Film',          '"Grand Hotel" (1932) — Academy Award winner',            4),
      h('kn',    'characteristic', 'Known as',      '"The Divine" — Hollywood\'s ultimate enigma',            4),
      h('sig2',  'characteristic', 'Famous quote',  '"I want to be alone"',                                   5),
      h('sig',   'characteristic', 'Signature',     'First Scandinavian star to conquer Hollywood — retired at only 36',5),
    ],
  },

  'max-von-sydow': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Career span',   'Career spanning over 70 years across Nordic and Hollywood cinema',1),
      h('bd',    'birth_date',     'Date of birth', 'April 10, 1929',                                         2),
      h('bp',    'birth_place',    'Place of birth','Lund',                                                    2),
      h('pk',    'peak_year',      'Career peak',   '1957 – 2020',                                            2),
      h('mv1',   'movie',          'Film',          '"Flash Gordon" — Ming the Merciless (1980)',              3),
      h('mv2',   'movie',          'Film',          '"Star Wars: The Force Awakens" — Lor San Tekka (2015)',  3),
      h('mv3',   'movie',          'Film',          '"The Exorcist" — Father Merrin (1973)',                  4),
      h('mv4',   'movie',          'Film',          '"The Seventh Seal" (1957) — played chess with the Grim Reaper',5),
      h('sig',   'characteristic', 'Signature',     'Iconic chess game with the Grim Reaper in Bergman\'s "The Seventh Seal"',5),
    ],
  },

  'joel-kinnaman': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Background',    'Grew up between Stockholm and Hollywood — bilingual from childhood',1),
      h('bd',    'birth_date',     'Date of birth', 'November 25, 1979',                                      2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                               2),
      h('pk',    'peak_year',      'Career peak',   '2010 – present',                                         2),
      h('tv1',   'tv_show',        'TV series',     '"The Killing" — US crime drama (2011–2014)',              3),
      h('tv2',   'tv_show',        'TV series',     '"Altered Carbon" — Netflix sci-fi (2018)',               3),
      h('mv1',   'movie',          'Film',          '"RoboCop" (2014 remake)',                                 4),
      h('mv2',   'movie',          'Film',          'Superhero ensemble blockbuster — Rick Flag role (2016)', 4),
      h('sig',   'characteristic', 'Signature',     'Broke through in hard-edged roles in crime drama, sci-fi, and action blockbusters',5),
    ],
  },

  // ── ANIMERADE KARAKTÄRER ──────────────────────────────────────────────────

  'bamse': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Animated bear — Nordic comic character',                1),
      h('cr',    'creation_year',  'Created',        '1966',                                                  2),
      h('prod',  'producer',       'Creator',        'Rune Andréasson',                                       2),
      h('t1',    'characteristic', 'Appearance',     'Blue overalls, round friendly face',                    3),
      h('t2',    'characteristic', 'Friends',        'Best friends: Lille Skutt (hare) and Skalman (turtle)', 3),
      h('t3',    'characteristic', 'Values',         'Always kind, never uses strength to bully',             3),
      h('t4',    'characteristic', 'Published in',   'Comic magazine "Bamse — Världens starkaste björn" since 1966',4),
      h('sig',   'characteristic', 'Signature',      'Becomes world\'s strongest when eating "dunder honey"', 5),
      h('power', 'characteristic', 'Superpower',     'Dunder honey makes him as strong as many bears combined',                3),
      h('merit', 'merit',          'Achievement',    'Best-selling Nordic comic magazine for over 50 consecutive years',      4),
    ],
  },

  'mumin': {
    categoryLabel: 'Character',
    nationality: 'finland',
    hints: [
      h('cat',   'characteristic', 'Type',          'Book/animated character — Nordic creation',            1),
      h('cr',    'creation_year',  'Created',        '1945',                                                  2),
      h('prod',  'producer',       'Creator',        'Tove Jansson (Nordic author)',                          2),
      h('t1',    'characteristic', 'Appearance',     'Round white hippo-like creature',                      3),
      h('t2',    'characteristic', 'Home',           'Lives in Moominvalley with Moominmamma and Moominpappa',3),
      h('t3',    'characteristic', 'Friends',        'Snorkmaiden, Little My (fierce tiny character), Sniff', 3),
      h('t4',    'characteristic', 'Adaptations',    'Multiple animated TV series including the 1990 anime', 4),
      h('sig',   'characteristic', 'Signature',      '"Mumintrollet" — beloved Nordic cultural icon across Scandinavia',       5),
      h('fact5', 'characteristic', 'Creator',        'Tove Jansson bridged two Nordic cultures — making Moomin uniquely Nordic', 3),
      h('merit', 'merit',          'Global reach',   'One of the most recognized characters in Japan, Europe and Scandinavia', 4),
    ],
  },

  'alfons-aberg': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic children\'s book character',                    1),
      h('cr',    'creation_year',  'Created',        '1972',                                                  2),
      h('prod',  'producer',       'Creator',        'Gunilla Bergström',                                     2),
      h('t1',    'characteristic', 'Character',      'Young boy with a loving but often absent father',       3),
      h('t2',    'characteristic', 'Published by',   'Rabén & Sjögren — beloved picture book series',        3),
      h('t3',    'characteristic', 'International',  'Known as "Alfie Atkins" in international translations',4),
      h('sig',   'characteristic', 'Signature',      'Everyday childhood adventures recognized by generations of Nordic children',5),
      h('debut', 'debut',          'First book',     '"God natt, Alfons Åberg" (1972) — first in the series',                  2),
      h('t4',    'characteristic', 'Daily life',     'Father works shifts — books explore everyday childhood with honesty',   2),
      h('merit', 'merit',          'Global reach',   'Over 15 million copies sold — translated into 40+ languages',           4),
    ],
  },

  'musse-pigg': {
    categoryLabel: 'Character',
    nationality: 'usa',
    hints: [
      h('cat',   'characteristic', 'Type',          'Disney animated character',                             1),
      h('cr',    'creation_year',  'Created',        '1928',                                                  2),
      h('prod',  'producer',       'Creator',        'Walt Disney and Ub Iwerks',                            2),
      h('t1',    'characteristic', 'First appeared', '"Steamboat Willie" (1928) — first sound-synchronized cartoon',3),
      h('t2',    'characteristic', 'Appearance',     'Red shorts, white gloves, large circular ears',        3),
      h('t3',    'characteristic', 'Partner',        'Minnie Mouse — his longtime companion',                3),
      h('t4',    'characteristic', 'Voice',          'Originally voiced by Walt Disney himself',             4),
      h('sig',   'characteristic', 'Signature',      'Disney\'s company mascot — most recognized cartoon character in history',5),
      h('fact5', 'characteristic', 'Record',         'Has appeared in over 130 films — more than any other fictional character', 3),
      h('fact6', 'characteristic', 'Symbol',         'Mickey Mouse ears are among the most recognized symbols in the world',   4),
    ],
  },

  'kalle-anka': {
    categoryLabel: 'Character',
    nationality: 'usa',
    hints: [
      h('cat',   'characteristic', 'Type',          'Disney animated character',                             1),
      h('cr',    'creation_year',  'Created',        '1934',                                                  2),
      h('prod',  'producer',       'Creator',        'Walt Disney studio',                                   2),
      h('t1',    'characteristic', 'Full name',      'Donald Fauntleroy Duck',                               3),
      h('t2',    'characteristic', 'Appearance',     'White feathers, blue sailor suit and cap, no pants',   3),
      h('t3',    'characteristic', 'Known for',      'Explosive temper tantrums and incomprehensible sputtering',3),
      h('t4',    'characteristic', 'Tradition',      'Nordic Christmas tradition — the Donald Duck special airs every Christmas Eve',4),
      h('sig',   'characteristic', 'Signature',      '"Donald Duck" Christmas show — watched by millions of families every Dec 24th',5),
      h('fact5', 'characteristic', 'Nephews',        'Nephews Huey, Dewey and Louie regularly outsmart their uncle Donald',     3),
      h('fact6', 'characteristic', 'Scandinavia',    'More popular in Scandinavia than anywhere else in the world',            3),
    ],
  },

  'jan-langben': {
    categoryLabel: 'Character',
    nationality: 'usa',
    hints: [
      h('cat',   'characteristic', 'Type',          'Disney animated character',                             1),
      h('cr',    'creation_year',  'Created',        '1932 (as "Dippy Dawg")',                               2),
      h('prod',  'producer',       'Creator',        'Walt Disney studio',                                   2),
      h('t1',    'characteristic', 'Type',           'Anthropomorphic dog — tall and clumsy',                3),
      h('t2',    'characteristic', 'Local name',    '"Jan Långben" means "Long Legs Jan" in the Nordic languages',3),
      h('t3',    'characteristic', 'Known for',      'Good-hearted clumsiness and cheerful personality',    4),
      h('sig',   'characteristic', 'Signature',      'Distinctive "Gawrsh!" expression and tumbling slapstick',5),
      h('t4',    'characteristic', 'Look',           'Always wears: green hat, orange turtleneck sweater and jeans',            2),
      h('fact2', 'characteristic', 'Son',            'Son Max Goof appears in many animated TV series',                        2),
      h('fact3', 'characteristic', 'Origin',         'Originally called "Dippy Dawg" in 1932 — redesigned as Goofy in 1934', 3),
    ],
  },

  'karlsson-pa-taket': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic children\'s book character',                    1),
      h('cr',    'creation_year',  'Created',        '1955',                                                  2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Lillebror och Karlsson på taket"',  2),
      h('t1',    'characteristic', 'Appearance',     'Plump little man with a propeller on his back',        3),
      h('t2',    'characteristic', 'Lives',          'In a small house on the rooftop of a Stockholm apartment',3),
      h('t3',    'characteristic', 'Best friend',    'A young boy called "Lillebror" (Little Brother)',      3),
      h('t4',    'characteristic', 'Personality',    'Vain, self-important but lovable — "world\'s best Karlsson"',4),
      h('sig',   'characteristic', 'Signature',      '"Lugna ner dig!" (Calm down!) — his catchphrase when things go wrong',5),
      h('quote', 'characteristic', 'Famous quote',   '"Jag är en lagom fet man i sin bästa ålder" — his self-description',   3),
      h('film',  'characteristic', 'Adaptations',    'Nordic animated films and TV series made him an enduring classic',      3),
    ],
  },

  'nalle-puh': {
    categoryLabel: 'Character',
    nationality: 'uk',
    hints: [
      h('cat',   'characteristic', 'Type',          'Classic children\'s book / Disney animated character', 1),
      h('cr',    'creation_year',  'Created',        '1926 (book)',                                          2),
      h('prod',  'producer',       'Creator',        'A.A. Milne — "Winnie-the-Pooh" (1926)',               2),
      h('t1',    'characteristic', 'Home',           'Lives in the Hundred Acre Wood',                      3),
      h('t2',    'characteristic', 'Obsession',      'Loves honey above everything else',                   3),
      h('t3',    'characteristic', 'Friends',        'Piglet, Tigger, Eeyore, Rabbit, Owl, Kanga & Roo',   3),
      h('t4',    'characteristic', 'Disney',         'Disney adaptations from 1966 make him globally iconic',4),
      h('sig',   'characteristic', 'Signature',      'Red short shirt and honey jar — simplest design, most beloved character',5),
      h('fact5', 'characteristic', 'Origin',         'Based on a real bear named Winnie — mascot of a WWI regiment',          3),
      h('fact6', 'characteristic', 'Inspiration',    'Christopher Robin\'s stuffed bear — inspired by A.A. Milne\'s son\'s toy', 3),
    ],
  },

  // ── KARAKTÄRSROLLER ───────────────────────────────────────────────────────

  'pippi-langstrump': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — book/film/TV',             1),
      h('cr',    'creation_year',  'Created',        '1945',                                                  2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Pippi Långstrump" (1945)',          2),
      h('t1',    'characteristic', 'Appearance',     'Red braids sticking straight out, freckles, mismatched stockings',3),
      h('t2',    'characteristic', 'Home',           'Lives alone in "Villa Villekulla" with her horse and monkey "Hr. Nilsson"',3),
      h('t3',    'characteristic', 'Strength',       'Claims to be "the world\'s strongest girl"',           3),
      h('t4',    'characteristic', 'Family',         'Father is King of a South Sea island',                 4),
      h('tv',    'tv_show',        'TV series',      'Iconic 1969 Nordic TV series with Inger Nilsson as Pippi',  4),
      h('sig',   'characteristic', 'Signature',      'Free spirit who lives by her own rules — no parents, no bedtime',5),
      h('t5',    'characteristic', 'Global reach',   'Translated into over 70 languages — among the most read children\'s books', 3),
    ],
  },

  'ronja-rovardotter': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — novel/film/anime',         1),
      h('cr',    'creation_year',  'Created',        '1981 (novel)',                                         2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Ronja Rövardotter" (1981)',        2),
      h('t1',    'characteristic', 'Setting',        'Lives in Mattisborgen castle in the forest',           3),
      h('t2',    'characteristic', 'Family',         'Father is robber chief Mattis',                       3),
      h('t3',    'characteristic', 'Friendship',     'Befriends Birk from the rival Borka robber clan',     4),
      h('mv',    'movie',          'Film',           'Film adaptation (1984) directed by Tage Danielsson',   4),
      h('sig',   'characteristic', 'Signature',      'Wild child of the forest — Lindgren\'s most adventurous heroine',5),
      h('fact2', 'characteristic', 'Adaptation',    'Studio Ghibli created an anime series adaptation (2014)',               3),
      h('fact3', 'characteristic', 'Depth',          'One of Lindgren\'s most mature and adventurous stories for children',   3),
    ],
  },

  'stig-helmer': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — film series',              1),
      h('prod',  'producer',       'Created in',     '"Sällskapsresan" (1980) and spin-off films',           2),
      h('t1',    'characteristic', 'Played by',      'Lasse Åberg — who also wrote and directed the films', 3),
      h('t2',    'characteristic', 'Character',      'Quintessential Nordic everyman on package holiday',    3),
      h('t3',    'characteristic', 'Adventure',      'Goes on charter trip to Gran Canaria in the first film',3),
      h('mv',    'movie',          'Film',           '"Sällskapsresan" (1980) — most-watched Nordic film ever',5),
      h('sig',   'characteristic', 'Signature',      'Nordic "lagom" identity — humble, cautious, unexpectedly brave',5),
      h('fact2', 'characteristic', 'Box office',     'Sällskapsresan became the highest-grossing Nordic film ever on release',3),
      h('char2', 'characteristic', 'Identity',       'Represents the classic shy, awkward but kind-hearted Nordic everyman',3),
      h('sequel','characteristic', 'Sequels',        'Character returned in "Sällskapsresan II — Snowroller" (1985)',          3),
    ],
  },

  'ole': {
    categoryLabel: 'Character',
    nationality: 'norway',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — classic film',             1),
      h('prod',  'producer',       'Created in',     '"Sällskapsresan" (1980)',                              2),
      h('actor', 'characteristic', 'Played by',      'Jon Skolmen — comedian and actor',                    2),
      h('t1',    'characteristic', 'Origin',         'Tourist from Oslo befriended by Stig-Helmer on holiday',3),
      h('t2',    'characteristic', 'Chemistry',      'Nordic comedy of contrasts with Stig-Helmer',         3),
      h('t3',    'characteristic', 'Personality',    'Cheerful, outgoing and quick to celebrate — a perfect foil to shy Stig-Helmer',3),
      h('sequel','movie',          'Sequel',         'Also appears in "Sällskapsresan II — Snowroller" (1985)',4),
      h('dest',  'characteristic', 'Destination',    'Met Stig-Helmer on a charter holiday to Gran Canaria', 3),
      h('mv',    'movie',          'Film',           '"Sällskapsresan" (1980) — charter trip to Gran Canaria',5),
      h('sig',   'characteristic', 'Signature',      'Classic Nordic film duo: Stig-Helmer and Ole — different nations, great friends',5),
    ],
  },

  'martin-beck': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic detective character — crime novels/TV',          1),
      h('cr',    'creation_year',  'Created',        '1965',                                                  2),
      h('prod',  'producer',       'Creator',        'Maj Sjöwall and Per Wahlöö — "Roman om ett brott" (10 novels)',2),
      h('t1',    'characteristic', 'Occupation',     'Stockholm homicide detective — National Homicide Commission',3),
      h('t2',    'characteristic', 'Style',          'Social-realist police procedural — critique of Nordic society',3),
      h('tv',    'tv_show',        'TV series',      '"Beck" (1997–2018) TV series with Peter Haber',        4),
      h('sig',   'characteristic', 'Signature',      'The first major Nordic crime detective — inspired all Nordic crime fiction after',5),
      h('fact2', 'characteristic', 'Series',        'The original 10 novels span 1965–1975',                                   2),
      h('merit2','merit',          'Legacy',         'Inspired Henning Mankell\'s Wallander — essentially created Nordic crime', 4),
      h('char2', 'characteristic', 'Character',      'Quiet, divorced, pipe-smoking detective — the anti-hero of Nordic crime',  3),
    ],
  },

  'carl-hamilton': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic spy character — thriller novel series',          1),
      h('cr',    'creation_year',  'Created',        '1986',                                                  2),
      h('prod',  'producer',       'Creator',        'Jan Guillou — "Coq Rouge" novel series',              2),
      h('t1',    'characteristic', 'Occupation',     'Military intelligence officer — elite special forces',  3),
      h('t2',    'characteristic', 'Codename',       '"Coq Rouge" — works for the secret intelligence service MUST',3),
      h('tv',    'tv_show',        'TV series',      'TV films with Mikael Persbrandt as Carl Hamilton',     4),
      h('sig',   'characteristic', 'Signature',      'The Nordic answer to James Bond — elite naval officer turned spy',       5),
      h('fact2', 'characteristic', 'Series',        'Jan Guillou wrote 10 Coq Rouge novels (1986–2012)',                        2),
      h('char2', 'characteristic', 'Training',       'Former naval officer — equivalent of a Navy SEAL',                       3),
      h('fact3', 'characteristic', 'Controversy',    'The novels sparked national debate about secret intelligence services',   3),
    ],
  },

  'rudolf-andersson': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character',                            1),
      h('prod',  'producer',       'Created in',     'Sune book series by Anders Jacobsson and Sören Olsson',2),
      h('cr',    'creation_year',  'Books began',    '1984 — "Sune" book series first published',            2),
      h('t1',    'characteristic', 'Role',           'Sune\'s father — an ordinary Nordic family man',      3),
      h('t2',    'characteristic', 'Family',         'Married to Karin Andersson — Sune\'s longsuffering mother',3),
      h('t3',    'characteristic', 'Suburb life',    'Epitomises Nordic suburban family life — lovable and slightly hapless',3),
      h('film',  'movie',          'First film',     'Depicted in "Sunes sommar" (1993) — first Sune film adaptation',4),
      h('films', 'characteristic', 'Film series',    'Appeared across multiple Sune film adaptations from 1993 onwards',3),
      h('modern','characteristic', 'Modern revival', 'New Sune film (2021) continued the family\'s story for a new generation',3),
      h('sig',   'characteristic', 'Signature',      'The quintessential Nordic movie dad — every Nordic child grew up knowing Rudolf',5),
    ],
  },

  'sune': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — book/film series',         1),
      h('cr',    'creation_year',  'Created',        '1984 (first book)',                                    2),
      h('prod',  'producer',       'Creator',        'Anders Jacobsson and Sören Olsson',                   2),
      h('t1',    'characteristic', 'Full name',      'Sune Andersson — young boy with a big heart and even bigger problems',3),
      h('t2',    'characteristic', 'Stories',        'Everyday misadventures in family and school life',      3),
      h('mv',    'movie',          'Films',          '"Sunes Sommar" (1993), "Sunes Jul" (1995) — classic Nordic Christmas film',4),
      h('sig',   'characteristic', 'Signature',      'Relatable everyday boy — every Nordic child sees themselves in Sune',5),
      h('debut', 'debut',          'First book',    '"Sunes sommar" by Jacobsson & Olsson — first published 1984',             2),
      h('family','characteristic', 'Family',         'Family: sister Anna, mother Karin, and father Rudolf Andersson',         2),
      h('reboot','characteristic', 'Modern revival','New film "Sune" (2021) introduced the character to a new generation',   3),
    ],
  },

  'sickan': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character — comedy crime film series',  1),
      h('prod',  'producer',       'Created in',     '"Jönssonligan" (1981) — Nordic comedy film series',   2),
      h('t1',    'characteristic', 'Full name',      'Charles-Ingvar "Sickan" Jönsson',                     3),
      h('t2',    'characteristic', 'Role',           'Mastermind criminal/con artist — the brains of the gang',3),
      h('t3',    'characteristic', 'Played by',      'Gösta Ekman (senior) in original films',              3),
      h('t4',    'characteristic', 'Inspiration',    'Loosely based on the Olsen-banden characters',        4),
      h('sig',   'characteristic', 'Signature',      '"Jag har en plan!" (I have a plan!) — his signature line before each heist',5),
      h('fact2', 'characteristic', 'Series',        'Jönssonligan: 9 films made between 1981 and 2009',                         2),
      h('char2', 'characteristic', 'Plans',          'Always has an elaborate heist plan that goes wrong in hilarious ways',  3),
      h('gang',  'characteristic', 'The Gang',       'Also includes Dynamit-Harry and Ragnar Vanheden as key accomplices',    3),
    ],
  },

  'allan-svensson': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Nordic fictional character',                            1),
      h('t1',    'characteristic', 'Character',      'Nordic fictional character from film or TV series',    3),
      h('sig',   'characteristic', 'Signature',      'Nordic character beloved by Scandinavian audiences',   5),
    ],
  },

  // ── MELODIFESTIVALEN-ARTISTER ─────────────────────────────────────────────

  'herreys': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic schlager pop trio',                              1),
      h('fact1', 'member_count',   'Members',       '3 brothers: Per, Louis and Richard Herrey',            1),
      h('bp',    'birth_place',    'Origin',        'Gothenburg',                                             2),
      h('pk',    'peak_year',      'Active years',  '1983 – 1990s',                                          2),
      h('s1',    'song',           'Hit song',      '"Diggiloo Diggiley" (1984)',                             4),
      h('merit', 'merit',          'Achievement',   'Won Eurovision Song Contest 1984 in Luxembourg',        5),
      h('sig',   'characteristic', 'Signature',     'Golden shoes at Eurovision — iconic 1984 Melodifestivalen moment',5),
      h('fact2', 'characteristic', 'Score',         'Won Eurovision 1984 with 145 points in Luxembourg',                       3),
      h('fact3', 'characteristic', 'Shoes',          'Famous for their distinctive golden metallic shoes on stage',            4),
      h('fact4', 'characteristic', 'Background',     'Three brothers — sons of a preacher who settled in Gothenburg',          3),
    ],
  },

  'arvingarna': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic dansband',                                       1),
      h('bp',    'birth_place',    'Origin',        'Norrland',                                               2),
      h('pk',    'peak_year',      'Active years',  '1985 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Claes Malmberg — the voice and face of the group',      3),
      h('t1',    'characteristic', 'Style',         'Dansband music — the quintessential Nordic dance band style',3),
      h('t2',    'characteristic', 'Melodifestivalen','Multiple Melodifestivalen appearances',               3),
      h('name',  'characteristic', 'Name meaning',  '"Arvingarna" means "The Heirs" — heirs to the Nordic dansband tradition',2),
      h('venue', 'characteristic', 'Live scene',    'Beloved at Nordic summer festivals and outdoor dansbanor (dance halls)',3),
      h('hit',   'merit',          'Success',       'One of the most commercially successful Nordic dansband acts over 40 years',4),
      h('sig',   'characteristic', 'Signature',     'Claes Malmberg\'s warm voice — the sound of Nordic summer nights',5),
    ],
  },

  'alcazar': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic pop group',                                      1),
      h('fact1', 'member_count',   'Members',       '4 members: Anniela, Linn, Magnus and Andreas',          1),
      h('bp',    'birth_place',    'Origin',        'Stockholm',                                              2),
      h('cr',    'creation_year',  'Formed',        '1998',                                                   2),
      h('pk',    'peak_year',      'Active years',  '1999 – present (with breaks)',                          2),
      h('s1',    'song',           'Hit song',      '"Crying at the Discoteque" (2001)',                      4),
      h('s2',    'song',           'Hit song',      '"Sexual Guarantee" (2004)',                              3),
      h('merit', 'merit',          'Achievement',   'Multiple Melodifestivalen appearances',                 3),
      h('look',  'characteristic', 'Style',         'Known for glittery costumes and high-energy camp performances',3),
      h('sig',   'characteristic', 'Signature',     'Euro dance group with Latin-pop flair',                 5),
    ],
  },

  'nordman': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic folk-pop duo',                                   1),
      h('fact1', 'member_count',   'Members',       '2 members: Rickard Olsson and Mats "MP" Persson',      1),
      h('bp',    'birth_place',    'Origin',        'Norrbotten',                                             2),
      h('pk',    'peak_year',      'Active years',  '1995 – 2003, reunited later',                           2),
      h('s1',    'song',           'Hit song',      '"Trollmors vaggsång" (2001)',                            4),
      h('merit', 'merit',          'Achievement',   'Multiple Melodifestivalen appearances',                 3),
      h('sig',   'characteristic', 'Signature',     'Folk-tinged Nordic pop from the far north',             5),
      h('s2',    'song',           'Hit song',      '"Vindarnas viskning" (1997)',                                              3),
      h('alb1',  'album',          'Debut album',   '"Nordman" debut album (1995)',                                           3),
      h('fact2', 'characteristic', 'Connection',    'Folk-influenced sound resonates especially with people from the far north',   3),
    ],
  },

  'friends': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic pop group',                                      1),
      h('bp',    'birth_place',    'Origin',        'Scandinavia',                                            2),
      h('pk',    'peak_year',      'Active years',  '2000s',                                                  2),
      h('style', 'characteristic', 'Style',         'Upbeat pop with catchy hooks and a youthful image',     2),
      h('melo',  'merit',          'Achievement',   'Melodifestivalen participant',                          3),
      h('esc',   'characteristic', 'Melodifestivalen','Competed to represent the Nordic region at Eurovision Song Contest',3),
      h('sound', 'characteristic', 'Sound',         'Fresh and energetic pop sound aimed at younger audiences',3),
      h('known', 'characteristic', 'Recognition',   'Known to Nordic pop fans from the Melodifestivalen stage',4),
      h('collab','characteristic', 'Scene',         'Part of the Nordic schlager and pop tradition exported globally',3),
      h('sig',   'characteristic', 'Signature',     'Nordic pop act associated with Melodifestivalen',       5),
    ],
  },

  'afro-dite': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic R&B/pop group',                                  1),
      h('bp',    'birth_place',    'Origin',        'Gothenburg',                                             2),
      h('cr',    'creation_year',  'Formed',        'Late 1990s',                                             2),
      h('name',  'characteristic', 'Name origin',   'Name blends "Africa" and "Aphrodite" — reflecting the group\'s multicultural identity',2),
      h('host',  'characteristic', 'Eurovision host','Eurovision 2001 took place in Copenhagen, Denmark',     3),
      h('s1',    'song',           'Hit song',      '"Never Let It Go" (Melodifestivalen 2001)',              4),
      h('s1b',   'merit',          'Chart success', '"Never Let It Go" became a pan-European hit after Eurovision',3),
      h('merit', 'merit',          'Achievement',   'Represented Sweden at Eurovision Song Contest 2001',    5),
      h('divers','characteristic', 'Identity',      'First group with predominantly African heritage to represent the Nordic region at Eurovision',4),
      h('sig',   'characteristic', 'Signature',     'Blended African and Nordic identity into a bold pop-R&B sound',5),
    ],
  },

  'medina': {
    categoryLabel: 'Musikartist',
    nationality: 'denmark',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                          1),
      h('bd',    'birth_date',     'Date of birth', 'February 18, 1987',                                     2),
      h('bp',    'birth_place',    'Place of birth','Aarhus',                                                 2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2015',                                           2),
      h('s1',    'song',           'Hit song',      '"Kun for mig" (2009)',                                   3),
      h('s2',    'song',           'Hit song',      '"Lose Control" (2009)',                                  4),
      h('s3',    'song',           'Hit song',      '"You & I" (2009)',                                       5),
      h('sig',   'characteristic', 'Signature',     'Moroccan-Nordic pop sensation hugely popular in all of Scandinavia',    5),
      h('fact2', 'characteristic', 'Heritage',       'Of Moroccan and Nordic heritage — breakthrough artist across all Scandinavia',3),
      h('fact3', 'characteristic', 'Style',          'Known for powerful R&B-infused pop with emotional depth',                3),
    ],
  },

  'samir-viktor': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic pop duo',                                        1),
      h('fact1', 'member_count',   'Members',       '2: Samir Badran and Viktor Frisk',                      1),
      h('bp',    'birth_place',    'Origin',        'Scandinavia',                                            2),
      h('pk',    'peak_year',      'Active years',  '2014 – present',                                        2),
      h('s1',    'song',           'Hit song',      '"Groupie" (2015)',                                       4),
      h('s2',    'song',           'Hit song',      '"Shuffla" (2016)',                                       4),
      h('merit', 'merit',          'Achievement',   'Multiple Melodifestivalen appearances',                 4),
      h('sig',   'characteristic', 'Signature',     'High-energy pop duo beloved by younger Nordic audiences',  5),
      h('fact2', 'characteristic', 'Background',     'Samir of Palestinian heritage — part of the vibrant Nordic pop scene',  3),
      h('s3',    'song',           'Hit song',       '"Groupie" (2015) reached the top 5 on the Scandinavian charts',        3),
    ],
  },

  'the-mamas': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic vocal group',                                    1),
      h('fact1', 'member_count',   'Members',       '3 members: Ashley Haynes, Dinah Yohannes and Noa (Matthew Bhaso)',1),
      h('bp',    'birth_place',    'Origin',        'Scandinavia',                                            2),
      h('pk',    'peak_year',      'Active years',  '2020 – present',                                        2),
      h('debut', 'debut',          'First fame',    'Gained recognition as backing vocalists for John Lundvik at Eurovision 2019 in Tel Aviv',2),
      h('s1',    'song',           'Hit song',      '"Move" (Melodifestivalen 2020)',                         4),
      h('covid', 'characteristic', 'Eurovision 2020','Eurovision 2020 was cancelled due to COVID-19 — they never got to perform in Rotterdam',3),
      h('style', 'characteristic', 'Sound',         'Gospel, soul and R&B — powerful three-part harmonies',  3),
      h('merit', 'merit',          'Achievement',   'Won Melodifestivalen 2020 — selected Eurovision entry for the cancelled 2020 contest',5),
      h('sig',   'characteristic', 'Signature',     'Gospel-inspired harmonies — the Eurovision 2020 entrant',5),
    ],
  },

  'brandsta-city-slackers': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic comedy/novelty act',                             1),
      h('bp',    'birth_place',    'Origin',        'Brandsta, a small locality in Dalarna',                  2),
      h('pk',    'peak_year',      'Active years',  '2000s',                                                  2),
      h('style', 'characteristic', 'Style',         'Comedy and parody songs — deliberately over-the-top and self-deprecating',2),
      h('melo',  'merit',          'Achievement',   'Competed in Melodifestivalen with humorous songs',      3),
      h('irony', 'characteristic', 'Concept',       'Name plays on "Brandsta" (small village) vs "City Slackers" — rural vs urban comedy',3),
      h('crowd', 'characteristic', 'Audience',      'Beloved by audiences who appreciate Nordic self-deprecating humour',3),
      h('trad',  'characteristic', 'Tradition',     'Part of a long tradition of comedy acts in Melodifestivalen',     3),
      h('vibe',  'characteristic', 'Performance',   'Known for bringing laughs and lightness to the Melodifestivalen stage',4),
      h('sig',   'characteristic', 'Signature',     'Comedy act that took Melodifestivalen audiences by surprise',      5),
    ],
  },

  'marcus-martinus': {
    categoryLabel: 'Band',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic twin pop duo',                                   1),
      h('fact1', 'member_count',   'Members',       '2: Marcus and Martinus Gunnarsen (born February 21, 2002)',1),
      h('bp',    'birth_place',    'Origin',        'Trofors, Vefsn',                                         2),
      h('pk',    'peak_year',      'Active years',  '2012 – present',                                        2),
      h('s1',    'song',           'Hit song',      '"Elektrisk" (2015)',                                     3),
      h('s2',    'song',           'Hit song',      '"Light It Up" (2016)',                                    3),
      h('s3',    'song',           'Hit song',      '"Unforgettable" (2024)',                                  4),
      h('sig',   'characteristic', 'Signature',     'Identical twin brothers — biggest Scandinavian youth pop sensation',5),
      h('fact2', 'characteristic', 'Child stars',    'Started performing at age 10 — famous before finishing primary school',   2),
      h('fact3', 'characteristic', 'Awards',         'Won multiple Nordic and Scandinavian music awards as teenagers',          3),
    ],
  },

  // ── SVENSKA ROCKBAND (region: sweden) ────────────────────────────────────

  'europe': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Classic rock group',                                    1),
      h('fact1', 'member_count',   'Members',       '5 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Upplands Väsby',                                         2),
      h('pk',    'peak_year',      'Active years',  '1979 – 1992, reunited 2003',                             2),
      h('m1',    'lead_singer',    'Lead singer',   'Joey Tempest (born 1963)',                               3),
      h('m2',    'band_member',    'Guitarist',     'John Norum',                                             3),
      h('s1',    'song',           'Hit song',      '"Rock the Night" (1987)',                                 3),
      h('s2',    'song',           'Hit song',      '"Carrie" (1987)',                                         4),
      h('s3',    'song',           'Iconic hit',    '"The Final Countdown" (1986)',                            5),
      h('sig',   'characteristic', 'Signature',     'Keyboard riff of "The Final Countdown" — one of most recognized rock intros ever',5),
    ],
  },

  'kent': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic indie/alternative rock group',                   1),
      h('bp',    'birth_place',    'Origin',        'Eskilstuna (formed 1990)',                               2),
      h('pk',    'peak_year',      'Active years',  '1990 – 2016',                                           2),
      h('m1',    'lead_singer',    'Lead singer',   'Joakim Berg',                                           3),
      h('s1',    'song',           'Hit song',      '"Dom andra" (2005)',                                     3),
      h('s2',    'song',           'Hit song',      '"Ingenting" (2002)',                                     3),
      h('alb1',  'album',          'Iconic album',  '"Isola" (1997)',                                         4),
      h('alb2',  'album',          'Iconic album',  '"Hagnesta Hill" (1999)',                                 4),
      h('s3',    'song',           'Hit song',      '"Om du var här" (1997)',                                  5),
      h('sig',   'characteristic', 'Signature',     'The defining Nordic indie rock band — disbanded 2016 after 26 years', 5),
    ],
  },

  'the-ark': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic glam rock group',                                1),
      h('bp',    'birth_place',    'Origin',        'Gothenburg (formed 1991)',                               2),
      h('pk',    'peak_year',      'Active years',  '1991 – 2010',                                           2),
      h('m1',    'lead_singer',    'Lead singer',   'Ola Salo — known for flamboyant stage personality',     3),
      h('s1',    'song',           'Hit song',      '"It Takes a Fool to Remain Sane" (2000)',               3),
      h('merit', 'merit',          'Achievement',   'Won Melodifestivalen 2007 with "The Worrying Kind"',    4),
      h('s2',    'song',           'Hit song',      '"The Greatest" (2007)',                                  5),
      h('sig',   'characteristic', 'Signature',     'Theatrical glam rock with Ola Salo\'s unforgettable stage presence',5),
      h('look',  'characteristic', 'Stage look',     'Known for outrageous glam rock: feather boas, platform boots, sequins',   3),
      h('alb2',  'album',          'Album',          '"State of the Art" album (2007)',                                        3),
    ],
  },

  'gyllene-tider': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic pop/rock group',                                 1),
      h('bp',    'birth_place',    'Origin',        'Halmstad (formed 1977)',                                 2),
      h('pk',    'peak_year',      'Active years',  '1977 – 1985, multiple reunions',                        2),
      h('m1',    'lead_singer',    'Key member',    'Per Gessle (guitar, vocals) — main songwriter',         3),
      h('s1',    'song',           'Hit song',      '"Kung av sand" (1982)',                                  3),
      h('s2',    'song',           'Hit song',      '"Sommartider" (1981)',                                    4),
      h('s3',    'song',           'Hit song',      '"Flickan i en Cole Porter sång" (1980)',                 5),
      h('sig',   'characteristic', 'Signature',     'Reunion tours still fill arenas decades after their 1985 hiatus',5),
      h('fact2', 'characteristic', 'Legacy',         'Per Gessle later formed Roxette — bringing the Halmstad sound worldwide', 3),
      h('alb2',  'album',          'Album',          '"Screams & Whispers" album (1994)',                                      3),
    ],
  },

  'mando-diao': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic indie/garage rock group',                        1),
      h('bp',    'birth_place',    'Origin',        'Borlänge (formed 1999)',                                 2),
      h('pk',    'peak_year',      'Active years',  '2002 – present',                                        2),
      h('m1',    'lead_singer',    'Vocalists',     'Björn Dixgård and Gustaf Dixgård (brothers)',            3),
      h('s1',    'song',           'Hit song',      '"Paralyzed" (2004)',                                     3),
      h('alb1',  'album',          'Debut album',   '"Bring \'Em In" (2002)',                                 3),
      h('s2',    'song',           'Hit song',      '"Monica Zetterlund" (2009)',                             4),
      h('s3',    'song',           'Hit song',      '"Black Saturday" (2012)',                                5),
      h('sig',   'characteristic', 'Signature',     'Borlänge boys who became Scandinavia\'s biggest garage rock export',5),
      h('alb2',  'album',          'Album',          '"Give Me Fire" album (2009)',                                            3),
    ],
  },

  'the-hives': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Garage rock group',                                      1),
      h('fact1', 'characteristic', 'Look',          'Always perform in matching black and white outfits',    1),
      h('bp',    'birth_place',    'Origin',        'Fagersta (formed 1993)',                                  2),
      h('pk',    'peak_year',      'Active years',  '1996 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Howlin\' Pelle Almqvist',                               3),
      h('s1',    'song',           'Hit song',      '"Walk Idiot Walk" (2004)',                               3),
      h('alb1',  'album',          'Iconic album',  '"Veni Vidi Vicious" (2000)',                             4),
      h('s2',    'song',           'Hit song',      '"Tick Tick Boom" (2007)',                                4),
      h('s3',    'song',           'Breakthrough hit','"Hate to Say I Told You So" (2000)',                   5),
      h('sig',   'characteristic', 'Signature',     'Explosive live energy + matching suits — garage rock revivalists from Fagersta',5),
    ],
  },

  'wilmer-x': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic hard rock group',                                1),
      h('bp',    'birth_place',    'Origin',        'Malmö (formed 1980)',                                    2),
      h('pk',    'peak_year',      'Active years',  '1980 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Stig Bergqvist',                                        3),
      h('t1',    'characteristic', 'Style',         'Working class hard rock — raw and uncompromising',       3),
      h('lang',  'characteristic', 'Language',      'Sing exclusively in the Nordic language — a point of pride and identity',3),
      h('city',  'characteristic', 'Malmö identity','Deeply rooted in Malmö working-class culture and pride', 3),
      h('life',  'merit',          'Longevity',     'Over 40 years of continuous activity — a testament to their fanbase loyalty',4),
      h('cult',  'characteristic', 'Fan culture',   'Legendary cult following among Nordic rock fans across generations',4),
      h('sig',   'characteristic', 'Signature',     'Cult status in Nordic rock — the voice of the working class',5),
    ],
  },

  'eldkvarn': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Nordic rock group',                                     1),
      h('bp',    'birth_place',    'Origin',        'Stockholm (formed 1970s)',                               2),
      h('pk',    'peak_year',      'Active years',  '1975 – present',                                        2),
      h('voice', 'lead_singer',    'Lead singer',   '"Plura" Jonsson — instantly recognisable gravelly voice',3),
      h('t1',    'characteristic', 'Style',         'Nordic-language rock — progg-influenced social commentary',3),
      h('t2',    'characteristic', 'Name',          '"Eldkvarn" means "fire mill" in the Nordic languages',  3),
      h('progg', 'characteristic', 'Movement',      'Central to the Nordic "progg" (progressive rock/protest music) scene of the 1970s',2),
      h('polit', 'characteristic', 'Themes',        'Songs tackle social justice, working conditions and everyday life',3),
      h('merit', 'merit',          'Legacy',        'Regarded as one of the most important Nordic rock bands — still active after 50 years',4),
      h('sig',   'characteristic', 'Signature',     'Pioneer of Nordic-language rock — Plura\'s raw voice and protest lyrics',5),
    ],
  },

  // ── HÅRDROCKBAND — REGION SCOPE: ALL ─────────────────────────────────────

  'acdc': {
    categoryLabel: 'Band',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Category',      'Hard rock group',                                       1),
      h('bp',    'birth_place',    'Origin',        'Sydney (formed 1973)',                                   2),
      h('pk',    'peak_year',      'Active years',  '1973 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Brian Johnson (since 1980); original frontman: Bon Scott',3),
      h('m2',    'band_member',    'Guitarist',     'Angus Young — famous for schoolboy uniform',            3),
      h('s1',    'song',           'Hit song',      '"Highway to Hell" (1979)',                               3),
      h('s2',    'song',           'Hit song',      '"Hells Bells" (1980)',                                   3),
      h('alb1',  'album',          'Iconic album',  '"Back in Black" (1980) — 2nd best-selling album ever',  4),
      h('s3',    'song',           'Hit song',      '"Thunderstruck" (1990)',                                 5),
      h('sig',   'characteristic', 'Signature',     'Angus Young\'s non-stop schoolboy uniform + windmill guitar — 50 years of hard rock',5),
    ],
  },

  'iron-maiden': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Heavy metal group',                                     1),
      h('bp',    'birth_place',    'Origin',        'London (formed 1975)',                                   2),
      h('pk',    'peak_year',      'Active years',  '1975 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Bruce Dickinson (since 1982) — "The Air Raid Siren"',   3),
      h('m2',    'band_member',    'Founder',       'Steve Harris (bass) — founder of the band',             3),
      h('s1',    'song',           'Hit song',      '"The Trooper" (1983)',                                   3),
      h('s2',    'song',           'Hit song',      '"Fear of the Dark" (1992)',                              3),
      h('mascot','characteristic', 'Mascot',        '"Eddie" — the skeletal Iron Maiden mascot on every album',4),
      h('s3',    'song',           'Iconic hit',    '"Run to the Hills" (1982)',                              4),
      h('alb1',  'album',          'Iconic album',  '"The Number of the Beast" (1982)',                       5),
      h('sig',   'characteristic', 'Signature',     'Eddie mascot on stage + Bruce Dickinson\'s operatic wail = heavy metal royalty',5),
    ],
  },

  'deep-purple': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Hard rock group',                                       1),
      h('bp',    'birth_place',    'Origin',        'London (formed 1968)',                                   2),
      h('pk',    'peak_year',      'Active years',  '1968 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Ian Gillan (classic Mark II lineup)',                   3),
      h('m2',    'band_member',    'Guitarist',     'Ritchie Blackmore — wrote the iconic guitar riff',      3),
      h('s1',    'song',           'Hit song',      '"Highway Star" (1972)',                                  3),
      h('s2',    'song',           'Hit song',      '"Black Night" (1970)',                                   3),
      h('alb1',  'album',          'Iconic album',  '"Machine Head" (1972)',                                  4),
      h('s3',    'song',           'Iconic hit',    '"Smoke on the Water" (1972)',                            5),
      h('sig',   'characteristic', 'Signature',     '"Smoke on the Water" guitar riff — first thing every beginner guitarist learns',5),
    ],
  },

  'judas-priest': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Heavy metal group',                                     1),
      h('bp',    'birth_place',    'Origin',        'Birmingham (formed 1969)',                               2),
      h('pk',    'peak_year',      'Active years',  '1969 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Rob Halford — legendary metal vocalist',                3),
      h('t1',    'characteristic', 'Look',          'Defined heavy metal aesthetic: leather, studs, zippers',3),
      h('s1',    'song',           'Hit song',      '"Living After Midnight" (1980)',                         3),
      h('s2',    'song',           'Hit song',      '"You\'ve Got Another Thing Comin\'" (1982)',             4),
      h('s3',    'song',           'Iconic hit',    '"Breaking the Law" (1980)',                              5),
      h('sig',   'characteristic', 'Signature',     'Halford riding a Harley Davidson onto stage — heavy metal theater at its finest',5),
      h('fact2', 'characteristic', 'Legacy',         'Inducted into the Rock and Roll Hall of Fame (2022)',                    3),
    ],
  },

  'motorhead': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Rock/metal group',                                      1),
      h('fact1', 'characteristic', 'Legend',        'Founded and led by the iconic Lemmy Kilmister (1945–2015)',1),
      h('bp',    'birth_place',    'Origin',        'London (formed 1975)',                                   2),
      h('pk',    'peak_year',      'Active years',  '1975 – 2015',                                           2),
      h('m1',    'lead_singer',    'Lead singer',   'Lemmy Kilmister (vocals/bass) — active until December 2015',3),
      h('s1',    'song',           'Hit song',      '"Overkill" (1979)',                                      3),
      h('s2',    'song',           'Hit song',      'Classic hard rock anthem from 1984 album — a live staple',3),
      h('s3',    'song',           'Iconic hit',    '"Ace of Spades" (1980)',                                  5),
      h('sig',   'characteristic', 'Signature',     '"Everything louder than everything else" — Lemmy\'s life motto',5),
      h('fact2', 'characteristic', 'Volume',         'Concerts so loud they reportedly broke recording equipment',             3),
    ],
  },

  'rammstein': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof',  'profession',     'Category',      'Industrial metal group',                                1),
      h('bp',    'birth_place',    'Origin',        'Berlin (formed 1994)',                                   2),
      h('pk',    'peak_year',      'Active years',  '1994 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Till Lindemann',                                        3),
      h('t1',    'characteristic', 'Language',      'All lyrics in their native tongue — became globally popular anyway',3),
      h('t2',    'characteristic', 'Concerts',      'Spectacular pyrotechnic shows with fire, flames and explosions on stage',3),
      h('s1',    'song',           'Hit song',      '"Engel" (1997)',                                         3),
      h('s2',    'song',           'Hit song',      '"Sonne" (2001)',                                         4),
      h('alb1',  'album',          'Iconic album',  '"Sehnsucht" (1997)',                                     4),
      h('s3',    'song',           'Iconic hit',    '"Du Hast" (1997)',                                       5),
      h('sig',   'characteristic', 'Signature',     'Fire and pyrotechnics + native-tongue lyrics = uniquely Rammstein',5),
    ],
  },

  'lindsey-vonn': {
    categoryLabel: 'Athlete',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Alpine skier',                                           1),
      h('fact1', 'characteristic', 'Specialty',     'Downhill and Super-G — the fastest disciplines in skiing',1),
      h('bd',    'birth_date',     'Date of birth', 'October 18, 1984',                                       2),
      h('bp',    'birth_place',    'Place of birth','Saint Paul, Minnesota, USA',                              2),
      h('pk',    'peak_year',      'Career peak',   '2008 – 2016',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medals in downhill',              3),
      h('fact2', 'characteristic', 'Resilience',    'Fought back from multiple serious knee injuries to race again',3),
      h('fact3', 'characteristic', 'Record',        'Held all-time record for most World Cup wins by a woman (82)',3),
      h('merit3','merit',          'Merit',         '4× World Cup overall champion (2008, 2009, 2010, 2012)', 4),
      h('merit1','merit',          'Merit',         'Olympic gold medal — downhill (2010 Vancouver)',          5),
      h('sig',   'characteristic', 'Signature',     'Most decorated alpine skier of her generation',          5),
    ],
  },

  // ── SVENSKA PROFFSGOLFARE (Peters lista 2026-08-12) ───────────────────────
  //
  // Alla nio är kurerade efter Hints-kriterierna:
  //   • Inga nationalitetsord i värdena — flaggan visar redan landet. Därför
  //     "The Open" (inte "British Open") och "Women's Open title" (inte
  //     "Women's British Open"); 'british' hade filtrerat bort hela raden.
  //   • Värdena hålls under HINT_MAX_CHARS (25) så de ryms på en rad utan
  //     ellips.
  //   • Svarets namn förekommer aldrig i ett värde (censorForAnswer skulle
  //     kapa raden) — därför t.ex. "Son of a famous comedian" om Parnevik.
  //   • Prioritet: P1 uppvärmning → P5 mest ikoniskt (visas sist).
  // Ingen 'club'-typ används — golf har ingen klubbkarriär att lista.

  'anna-nordqvist': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the LPGA Tour',   1),
      h('bd',    'birth_date',     'Date of birth', 'June 10, 1987',            2),
      h('bp',    'birth_place',    'Place of birth','Eskilstuna',               2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2021',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 2008',       2),
      h('ht',    'height',         'Height',        '180 cm',                   3),
      h('col',   'merit',          'College',       'NCAA champion 2008',       3),
      h('wins',  'merit',          'Tour wins',     'Nine LPGA Tour wins',      3),
      h('sol',   'characteristic', 'Team golf',     'Solheim Cup since 2009',   3),
      h('maj1',  'merit',          'Major',         'LPGA Championship 2009',   4),
      h('maj2',  'merit',          'Major',         'Evian Championship 2017',  4),
      h('maj3',  'merit',          'Major',         "AIG Women's Open 2021",    5),
      h('sig',   'characteristic', 'Signature',     'Three major titles',       5),
    ],
  },

  'liselotte-neumann': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the LPGA Tour',   1),
      h('bd',    'birth_date',     'Date of birth', 'May 20, 1966',             2),
      h('bp',    'birth_place',    'Place of birth','Finspång',                 2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 1998',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 1985',       2),
      h('roy',   'merit',          'Award',         'Rookie of the Year 1988',  3),
      h('wins',  'merit',          'Tour wins',     '13 LPGA Tour wins',        3),
      h('sol',   'characteristic', 'Team golf',     'First Solheim Cup, 1990',  3),
      h('maj2',  'merit',          'Major',         "Women's Open title 1994",  4),
      h('maj1',  'merit',          'Major',         "U.S. Women's Open 1988",   5),
      h('sig',   'characteristic', 'Signature',     'Won a major as a rookie',  5),
    ],
  },

  'helen-alfredsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the LPGA Tour',   1),
      h('bd',    'birth_date',     'Date of birth', 'April 9, 1965',            2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg',               2),
      h('pk',    'peak_year',      'Career peak',   '1992 – 2008',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 1989',       2),
      h('roy',   'merit',          'Award',         'Rookie of the Year 1992',  3),
      h('wins',  'merit',          'Tour wins',     'Seven LPGA Tour wins',     3),
      h('sol',   'characteristic', 'Team golf',     'Solheim Cup since 1990',   3),
      h('temp',  'characteristic', 'Reputation',    'Known for fiery temper',   4),
      h('maj1',  'merit',          'Major',         'Dinah Shore title 1993',   4),
      h('kn',    'characteristic', 'Nickname',      'Nickname: Alfie',          5),
      h('sig',   'characteristic', 'Signature',     'Major champion in 1993',   5),
    ],
  },

  'linn-grant': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',       1),
      h('tour',  'characteristic', 'Tour',          'Plays on the LPGA Tour',    1),
      h('bd',    'birth_date',     'Date of birth', 'July 15, 1999',             2),
      h('bp',    'birth_place',    'Place of birth','Helsingborg',               2),
      h('pk',    'peak_year',      'Career peak',   '2022 – present',            2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 2021',        2),
      h('col',   'characteristic', 'College',       'Played at Arizona State',   3),
      h('om',    'merit',          'Award',         'Order of Merit 2022',       3),
      h('sol',   'merit',          'Team golf',     'Solheim Cup 2023, 2024',    3),
      h('lpga',  'merit',          'Tour win',      'Dana Open winner 2024',     4),
      h('mix',   'characteristic', 'Milestone',     'Won a mixed-field event',   4),
      h('maj1',  'merit',          'Breakthrough',  'Scandinavian Mixed 2022',   5),
      h('sig',   'characteristic', 'Signature',     'First female tour winner',  5),
    ],
  },

  'jesper-parnevik': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the PGA Tour',    1),
      h('bd',    'birth_date',     'Date of birth', 'March 7, 1965',            2),
      h('bp',    'birth_place',    'Place of birth','Danderyd',                 2),
      h('pk',    'peak_year',      'Career peak',   '1994 – 2002',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 1986',       2),
      h('wins',  'merit',          'Tour wins',     'Five PGA Tour wins',       3),
      h('ryd',   'merit',          'Team golf',     'Ryder Cup 1997, 1999',     3),
      h('trs',   'characteristic', 'Style',         'Wore bright trousers',     3),
      h('sand',  'characteristic', 'Quirk',         'Ate volcanic sand',        4),
      h('open',  'merit',          'Major',         'Runner-up at The Open',    4),
      h('cap',   'characteristic', 'Signature',     'Upturned cap brim',        5),
      h('fam',   'characteristic', 'Family',        'Son of a famous comedian', 5),
    ],
  },

  'ludvig-aberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the PGA Tour',    1),
      h('bd',    'birth_date',     'Date of birth', 'November 16, 1999',        2),
      h('bp',    'birth_place',    'Place of birth','Eslöv',                    2),
      h('pk',    'peak_year',      'Career peak',   '2023 – present',           2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 2023',       2),
      h('col',   'characteristic', 'College',       'Played for Texas Tech',    3),
      h('win1',  'merit',          'Tour win',      'European Masters 2023',    3),
      h('win2',  'merit',          'Tour win',      'RSM Classic 2023',         3),
      h('ryd',   'merit',          'Team golf',     'Ryder Cup debut in 2023',  4),
      h('fast',  'characteristic', 'Milestone',     'Ryder Cup before a major', 4),
      h('mas',   'merit',          'Major',         'Masters runner-up 2024',   5),
      h('sig',   'characteristic', 'Signature',     'Rose to the world top 10', 5),
    ],
  },

  'henrik-stenson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the PGA Tour',    1),
      h('bd',    'birth_date',     'Date of birth', 'April 5, 1976',            2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg',               2),
      h('pk',    'peak_year',      'Career peak',   '2013 – 2016',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 1998',       2),
      h('ht',    'height',         'Height',        '188 cm',                   3),
      h('fed',   'merit',          'Award',         'FedEx Cup winner 2013',    3),
      h('dub',   'merit',          'Award',         'Race to Dubai 2013',       3),
      h('wood',  'characteristic', 'Trademark',     'Famous for his 3-wood',    3),
      h('oly',   'merit',          'Olympics',      'Olympic silver in 2016',   4),
      h('kn',    'characteristic', 'Nickname',      'Nickname: The Iceman',     4),
      h('maj1',  'merit',          'Major',         'The Open champion 2016',   5),
      h('sig',   'characteristic', 'Signature',     'Closed a major with 63',   5),
    ],
  },

  'alexander-noren': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Plays on the PGA Tour',    1),
      h('bd',    'birth_date',     'Date of birth', 'July 15, 1982',            2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                2),
      h('pk',    'peak_year',      'Career peak',   '2016 – 2018',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 2005',       2),
      h('col',   'characteristic', 'College',       'Played at Oklahoma St',    3),
      h('wins',  'merit',          'Tour wins',     '10 European Tour wins',    3),
      h('work',  'characteristic', 'Reputation',    'Known for long practice',  3),
      h('ryd',   'merit',          'Team golf',     'Ryder Cup team in 2018',   4),
      h('bmw',   'merit',          'Tour win',      'BMW PGA winner 2017',      4),
      h('four',  'merit',          'Season',        'Four wins in one season',  5),
      h('rank',  'characteristic', 'Signature',     'Reached world No. 8',      5),
    ],
  },

  'robert-karlsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Professional golfer',      1),
      h('tour',  'characteristic', 'Tour',          'Played the European Tour', 1),
      h('bd',    'birth_date',     'Date of birth', 'September 3, 1969',        2),
      h('bp',    'birth_place',    'Place of birth','Sundbyberg',               2),
      h('pk',    'peak_year',      'Career peak',   '2006 – 2010',              2),
      h('deb',   'debut',          'Turned pro',    'Turned pro in 1989',       2),
      h('ht',    'height',         'Height',        '196 cm',                   3),
      h('wins',  'merit',          'Tour wins',     '11 European Tour wins',    3),
      h('tall',  'characteristic', 'Physique',      'One of the tallest pros',  3),
      h('vice',  'characteristic', 'Later career',  'Became a vice-captain',    4),
      h('ryd',   'merit',          'Team golf',     'Ryder Cup 2006, 2008',     4),
      h('om',    'merit',          'Award',         'Order of Merit 2008',      5),
    ],
  },

  // === Batch 2026-08-27 — kompletterar film-gapet (correctNames i movies-
  // katalogen saknade en egen Hints-person-entry; alla under 10 auto-
  // genererade hints, manuellt kompletterade till spelbara). ===

  'clint-eastwood': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & director',                          1),
      h('bd',    'birth_date',     'Date of birth', 'May 31, 1930',                               2),
      h('bp',    'birth_place',    'Place of birth','San Francisco, California',                  2),
      h('pk',    'peak_year',      'Career peak',   '1964 – 2004',                                2),
      h('mv1',   'movie',          'Film',          '"A Fistful of Dollars" (1964)',              3),
      h('mv2',   'movie',          'Film',          '"Dirty Harry" (1971)',                       3),
      h('mv3',   'movie',          'Film',          '"Unforgiven" (1992)',                        3),
      h('mv4',   'movie',          'Film',          '"Million Dollar Baby" (2004)',               3),
      h('fact1', 'characteristic', 'Fact',          'Also a two-time Best Director Oscar winner', 4),
      h('fact2', 'characteristic', 'Fact',          'Served as Mayor of Carmel-by-the-Sea',       4),
      h('mv5',   'movie',          'Film',          '"Gran Torino" (2008)',                       5),
    ],
  },

  'gene-kelly': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor, dancer & choreographer',            1),
      h('bd',    'birth_date',     'Date of birth', 'August 23, 1912',                           2),
      h('bp',    'birth_place',    'Place of birth','Pittsburgh, Pennsylvania',                  2),
      h('pk',    'peak_year',      'Career peak',   '1943 – 1957',                               2),
      h('mv1',   'movie',          'Film',          '"Brigadoon" (1954)',                        3),
      h('mv2',   'movie',          'Film',          '"On the Town" (1949)',                      3),
      h('fact1', 'characteristic', 'Signature',     'Famous lamp-post dance in the rain',        3),
      h('mv3',   'movie',          'Film',          '"Anchors Aweigh" (1945)',                   4),
      h('merit', 'merit',          'Achievement',   'National Medal of Arts',                    4),
      h('mv4',   'movie',          'Film',          '"Singin\' in the Rain" (1952)',             5),
    ],
  },

  'judy-garland': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & singer',                     1),
      h('bd',    'birth_date',     'Date of birth', 'June 10, 1922',                      2),
      h('bp',    'birth_place',    'Place of birth','Grand Rapids, Minnesota',            2),
      h('pk',    'peak_year',      'Career peak',   '1939 – 1954',                        2),
      h('mv1',   'movie',          'Film',          '"A Star Is Born" (1954)',            3),
      h('mv2',   'movie',          'Film',          '"Meet Me in St. Louis" (1944)',      3),
      h('s1',    'song',           'Signature song','"Over the Rainbow"',                3),
      h('merit', 'merit',          'Achievement',   'Academy Juvenile Award',             4),
      h('fact1', 'characteristic', 'Fact',          'Started performing as a child in vaudeville', 4),
      h('mv3',   'movie',          'Film',          '"The Wizard of Oz" (1939)',          5),
    ],
  },

  'orson-welles': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor, director & writer',                 1),
      h('bd',    'birth_date',     'Date of birth', 'May 6, 1915',                              2),
      h('bp',    'birth_place',    'Place of birth','Kenosha, Wisconsin',                       2),
      h('pk',    'peak_year',      'Career peak',   '1941 – 1958',                              2),
      h('mv1',   'movie',          'Film',          '"The Third Man" (1949)',                   3),
      h('mv2',   'movie',          'Film',          '"Touch of Evil" (1958)',                   3),
      h('fact1', 'characteristic', 'Fact',          'Radio drama "The War of the Worlds" (1938) caused nationwide panic', 3),
      h('merit', 'merit',          'Achievement',   'Academy Honorary Award',                   4),
      h('fact2', 'characteristic', 'Fact',          'Wrote, directed and starred in his debut film', 4),
      h('mv3',   'movie',          'Film',          '"Citizen Kane" (1941)',                    5),
    ],
  },

  'debbie-reynolds': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & singer',                          1),
      h('bd',    'birth_date',     'Date of birth', 'April 1, 1932',                           2),
      h('bp',    'birth_place',    'Place of birth','El Paso, Texas',                          2),
      h('pk',    'peak_year',      'Career peak',   '1950 – 1964',                             2),
      h('mv1',   'movie',          'Film',          '"The Unsinkable Molly Brown" (1964)',     3),
      h('mv2',   'movie',          'Film',          '"How the West Was Won" (1962)',           3),
      h('fact1', 'characteristic', 'Fact',          'Was only 19 when she filmed her most famous role', 3),
      h('merit', 'merit',          'Achievement',   'Screen Actors Guild Life Achievement Award', 4),
      h('fact2', 'characteristic', 'Family',        'Mother of actress and writer Carrie Fisher', 4),
      h('mv3',   'movie',          'Film',          '"Singin\' in the Rain" (1952)',           5),
    ],
  },

  'harrison-ford': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'July 13, 1942',                            2),
      h('bp',    'birth_place',    'Place of birth','Chicago, Illinois',                        2),
      h('pk',    'peak_year',      'Career peak',   '1977 – 2008',                              2),
      h('mv1',   'movie',          'Film',          '"Raiders of the Lost Ark" (1981)',         3),
      h('mv2',   'movie',          'Film',          '"Blade Runner" (1982)',                    3),
      h('mv3',   'movie',          'Film',          '"The Fugitive" (1993)',                    3),
      h('fact1', 'characteristic', 'Fact',          'Worked as a carpenter before his big break', 4),
      h('fact2', 'characteristic', 'Fun fact',      'Licensed pilot who has flown his own rescue missions', 4),
      h('mv4',   'movie',          'Film',          '"Star Wars" — as Han Solo (1977)',         5),
    ],
  },

  'mark-hamill': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & voice actor',                     1),
      h('bd',    'birth_date',     'Date of birth', 'September 25, 1951',                      2),
      h('bp',    'birth_place',    'Place of birth','Oakland, California',                     2),
      h('pk',    'peak_year',      'Career peak',   '1977 – 2019',                             2),
      h('fact1', 'characteristic', 'Fact',          'Long-time voice of the Joker in animation', 3),
      h('tv1',   'tv_show',        'TV role',       '"Batman: The Animated Series" — the Joker', 3),
      h('merit', 'merit',          'Achievement',   'Inkpot Award',                            4),
      h('fact2', 'characteristic', 'Later career',  'Returned to the role decades later in new sequels', 4),
      h('fact3', 'characteristic', 'Fact',          'Extensive voice-acting career in animation and video games', 4),
      h('tv2',   'tv_show',        'Guest role',    '"The Flash" — as the Trickster',          3),
      h('mv1',   'movie',          'Film',          '"Star Wars" — as Luke Skywalker (1977)',  5),
    ],
  },

  'sylvester-stallone': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & director',                        1),
      h('bd',    'birth_date',     'Date of birth', 'July 6, 1946',                            2),
      h('bp',    'birth_place',    'Place of birth','New York City',                           2),
      h('pk',    'peak_year',      'Career peak',   '1976 – 2010',                             2),
      h('mv1',   'movie',          'Film',          '"Rambo: First Blood" (1982)',             3),
      h('mv2',   'movie',          'Film',          '"The Expendables" (2010)',                3),
      h('fact1', 'characteristic', 'Fact',          'Wrote the screenplay for his breakout role himself', 3),
      h('merit', 'merit',          'Achievement',   'Golden Globe Award winner',               4),
      h('mv3',   'movie',          'Film',          '"Creed" (2015)',                          4),
      h('mv4',   'movie',          'Film',          '"Rocky" — as Rocky Balboa (1976)',        5),
    ],
  },

  'val-kilmer': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'December 31, 1959',                       2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California',                 2),
      h('pk',    'peak_year',      'Career peak',   '1986 – 2005',                             2),
      h('mv1',   'movie',          'Film',          '"Batman Forever" (1995)',                 3),
      h('mv2',   'movie',          'Film',          '"Tombstone" (1993)',                      3),
      h('mv3',   'movie',          'Film',          '"The Doors" — as Jim Morrison (1991)',    3),
      h('fact1', 'characteristic', 'Fact',          'Trained at Juilliard\'s drama division',  4),
      h('mv5',   'movie',          'Film',          '"Heat" (1995)',                           4),
      h('fact2', 'characteristic', 'Fact',          'One of the youngest students admitted to his drama school', 3),
      h('mv4',   'movie',          'Film',          '"Top Gun" — as Iceman (1986)',            5),
    ],
  },

  'john-candy': {
    categoryLabel: 'Actor',
    nationality: 'canada',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & comedian',                        1),
      h('bd',    'birth_date',     'Date of birth', 'October 31, 1950',                        2),
      h('bp',    'birth_place',    'Place of birth','Toronto, Ontario',                        2),
      h('pk',    'peak_year',      'Career peak',   '1983 – 1993',                             2),
      h('tv1',   'tv_show',        'Sketch show',   '"SCTV"',                                  3),
      h('mv1',   'movie',          'Film',          '"Uncle Buck" (1989)',                     3),
      h('mv2',   'movie',          'Film',          '"Planes, Trains and Automobiles" (1987)', 3),
      h('merit', 'merit',          'Achievement',   'Canada\'s Walk of Fame',                  4),
      h('mv4',   'movie',          'Film',          '"Splash" (1984)',                         3),
      h('fact1', 'characteristic', 'Fact',          'Known for his warm, larger-than-life comedic roles', 4),
      h('mv3',   'movie',          'Film',          '"Cool Runnings" — as the coach (1993)',   5),
    ],
  },

  'richard-dreyfuss': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'October 29, 1947',                        2),
      h('bp',    'birth_place',    'Place of birth','Brooklyn, New York',                      2),
      h('pk',    'peak_year',      'Career peak',   '1975 – 1985',                             2),
      h('mv1',   'movie',          'Film',          '"Close Encounters of the Third Kind" (1977)', 3),
      h('mv2',   'movie',          'Film',          '"Mr. Holland\'s Opus" (1995)',            3),
      h('merit', 'merit',          'Achievement',   'Academy Award for Best Actor',            4),
      h('fact1', 'characteristic', 'Fact',          'One of the youngest Best Actor winners of his era', 4),
      h('mv4',   'movie',          'Film',          '"Down and Out in Beverly Hills" (1986)',  3),
      h('fact2', 'characteristic', 'Fact',          'Also active as an advocate for civics education', 4),
      h('mv3',   'movie',          'Film',          '"Jaws" — as Matt Hooper (1975)',          5),
    ],
  },

  'roy-scheider': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'November 10, 1932',                       2),
      h('bp',    'birth_place',    'Place of birth','Orange, New Jersey',                      2),
      h('pk',    'peak_year',      'Career peak',   '1971 – 1979',                             2),
      h('mv1',   'movie',          'Film',          '"Blue Thunder" (1983)',                   3),
      h('mv2',   'movie',          'Film',          '"All That Jazz" (1979)',                  3),
      h('fact1', 'characteristic', 'Famous line',   '"We\'re gonna need a bigger boat"',       4),
      h('mv4',   'movie',          'Film',          '"Sorcerer" (1977)',                       3),
      h('fact2', 'characteristic', 'Fact',          'Trained as an amateur boxer in his youth', 3),
      h('merit', 'merit',          'Achievement',   'Two Academy Award nominations',           4),
      h('mv3',   'movie',          'Film',          '"Jaws" — as Chief Brody (1975)',          5),
    ],
  },

  'sam-neill': {
    categoryLabel: 'Actor',
    nationality: 'new-zealand',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & winegrower',                     1),
      h('bd',    'birth_date',     'Date of birth', 'September 14, 1947',                     2),
      h('bp',    'birth_place',    'Place of birth','Northern Ireland',                       2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2005',                            2),
      h('mv1',   'movie',          'Film',          '"My Brilliant Career" (1979)',           3),
      h('tv1',   'tv_show',        'TV role',       '"Peaky Blinders"',                       3),
      h('fact1', 'characteristic', 'Fun fact',      'Runs his own vineyard',                  4),
      h('mv3',   'movie',          'Film',          '"The Piano" (1993)',                     3),
      h('merit', 'merit',          'Achievement',   'Distinguished New Zealand Order of Merit', 4),
      h('mv2',   'movie',          'Film',          '"Jurassic Park" — as Dr. Alan Grant (1993)', 5),
    ],
  },

  'linda-hamilton': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'September 26, 1956',                      2),
      h('bp',    'birth_place',    'Place of birth','Salisbury, Maryland',                     2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 2019',                             2),
      h('tv1',   'tv_show',        'TV role',       '"Beauty and the Beast" (1987–90)',        3),
      h('fact1', 'characteristic', 'Fact',          'Trained extensively to play a soldier-like role', 3),
      h('mv2',   'movie',          'Film',          '"King Kong Lives" (1986)',                3),
      h('fact2', 'characteristic', 'Fact',          'Underwent intense physical training for her most iconic role', 4),
      h('merit', 'merit',          'Achievement',   'Saturn Award winner',                     4),
      h('mv1',   'movie',          'Film',          '"Terminator 2: Judgment Day" — as Sarah Connor (1991)', 5),
    ],
  },

  'michael-j-fox': {
    categoryLabel: 'Actor',
    nationality: 'canada',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'June 9, 1961',                            2),
      h('bp',    'birth_place',    'Place of birth','Edmonton, Alberta',                       2),
      h('pk',    'peak_year',      'Career peak',   '1985 – 1991',                             2),
      h('tv1',   'tv_show',        'TV role',       '"Family Ties"',                           3),
      h('tv2',   'tv_show',        'TV role',       '"Spin City"',                             3),
      h('merit', 'merit',          'Achievement',   'Officer of the Order of Canada',          4),
      h('mv2',   'movie',          'Film',          '"Teen Wolf" (1985)',                      3),
      h('fact1', 'characteristic', 'Fact',          'Also the author of several memoirs',      4),
      h('mv1',   'movie',          'Film',          '"Back to the Future" — as Marty McFly (1985)', 5),
    ],
  },

  'olivia-newton-john': {
    categoryLabel: 'Actor',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Profession',    'Singer & actor',                         1),
      h('bd',    'birth_date',     'Date of birth', 'September 26, 1948',                     2),
      h('bp',    'birth_place',    'Place of birth','Cambridge, England',                     2),
      h('pk',    'peak_year',      'Career peak',   '1971 – 1994',                            2),
      h('s1',    'song',           'Hit song',      '"Physical" (1981)',                      3),
      h('mv1',   'movie',          'Film',          '"Xanadu" (1980)',                        3),
      h('merit', 'merit',          'Achievement',   'Grammy Award winner',                    4),
      h('fact1', 'characteristic', 'Fact',          'Moved to Australia as a child',          4),
      h('fact2', 'characteristic', 'Fact',          'Had multiple Billboard number-one hit songs', 4),
      h('mv2',   'movie',          'Film',          '"Grease" — as Sandy (1978)',              5),
    ],
  },

  'henry-thomas': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'September 9, 1971',                       2),
      h('bp',    'birth_place',    'Place of birth','San Antonio, Texas',                      2),
      h('pk',    'peak_year',      'Career peak',   '1982 – 2002',                             2),
      h('mv1',   'movie',          'Film',          '"Legends of the Fall" (1994)',            3),
      h('mv2',   'movie',          'Film',          '"Gangs of New York" (2002)',              3),
      h('fact1', 'characteristic', 'Fact',          'Was 10 years old when cast in his most famous role', 4),
      h('mv4',   'movie',          'Film',          '"All the Pretty Horses" (2000)',          4),
      h('fact2', 'characteristic', 'Fact',          'Also composes and performs music',        4),
      h('mv3',   'movie',          'Film',          '"E.T. the Extra-Terrestrial" — as Elliott (1982)', 5),
    ],
  },

  'jason-statham': {
    categoryLabel: 'Actor',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'July 26, 1967',                           2),
      h('bp',    'birth_place',    'Place of birth','Shirebrook, England',                     2),
      h('pk',    'peak_year',      'Career peak',   '1998 – 2020',                             2),
      h('mv1',   'movie',          'Film',          '"Lock, Stock and Two Smoking Barrels" (1998)', 3),
      h('fact1', 'characteristic', 'Fun fact',      'Was a member of a national diving team before acting', 3),
      h('mv2',   'movie',          'Film',          '"The Transporter" (2002)',                4),
      h('mv3',   'movie',          'Film',          '"Fast & Furious" franchise',              4),
      h('mv5',   'movie',          'Film',          '"The Expendables" (2010)',                4),
      h('mv4',   'movie',          'Film',          '"Snatch" (2000)',                         5),
    ],
  },

  'laurence-fishburne': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'July 30, 1961',                           2),
      h('bp',    'birth_place',    'Place of birth','Augusta, Georgia',                        2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2003',                             2),
      h('mv1',   'movie',          'Film',          '"Boyz n the Hood" (1991)',                3),
      h('mv2',   'movie',          'Film',          '"Apocalypse Now" (1979)',                 3),
      h('merit', 'merit',          'Achievement',   'Tony Award winner',                       4),
      h('fact1', 'characteristic', 'Fact',          'Cast as Apocalypse Now\'s youngest crew member at 14', 4),
      h('tv1',   'tv_show',        'TV role',       '"CSI: Crime Scene Investigation"',        3),
      h('mv3',   'movie',          'Film',          '"The Matrix" — as Morpheus (1999)',       5),
    ],
  },

  'heath-ledger': {
    categoryLabel: 'Actor',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'April 4, 1979',                           2),
      h('bp',    'birth_place',    'Place of birth','Perth, Western Australia',                2),
      h('pk',    'peak_year',      'Career peak',   '1999 – 2008',                             2),
      h('mv1',   'movie',          'Film',          '"10 Things I Hate About You" (1999)',     3),
      h('mv2',   'movie',          'Film',          '"Brokeback Mountain" (2005)',              3),
      h('mv3',   'movie',          'Film',          '"A Knight\'s Tale" (2001)',               3),
      h('merit', 'merit',          'Achievement',   'Academy Award for Best Supporting Actor', 4),
      h('mv5',   'movie',          'Film',          '"The Patriot" (2000)',                    4),
      h('mv4',   'movie',          'Film',          '"The Dark Knight" — as the Joker (2008)', 5),
    ],
  },

  'andrew-garfield': {
    categoryLabel: 'Actor',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'August 20, 1983',                         2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California',                 2),
      h('pk',    'peak_year',      'Career peak',   '2006 – 2026',                             2),
      h('mv1',   'movie',          'Film',          '"Hacksaw Ridge" (2016)',                  3),
      h('mv2',   'movie',          'Film',          '"tick, tick... BOOM!" (2021)',            3),
      h('mv3',   'movie',          'Film',          '"The Amazing Spider-Man" (2012)',         4),
      h('merit', 'merit',          'Achievement',   'Golden Globe Award winner',               4),
      h('mv5',   'movie',          'Film',          '"Silence" (2016)',                        4),
      h('mv4',   'movie',          'Film',          '"The Social Network" (2010)',             5),
    ],
  },

  'jesse-eisenberg': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & playwright',                      1),
      h('bd',    'birth_date',     'Date of birth', 'October 5, 1983',                         2),
      h('bp',    'birth_place',    'Place of birth','Queens, New York',                        2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2026',                             2),
      h('mv1',   'movie',          'Film',          '"Zombieland" (2009)',                     3),
      h('mv2',   'movie',          'Film',          '"Now You See Me" (2013)',                 3),
      h('fact1', 'characteristic', 'Fact',          'Also writes plays for the stage',         4),
      h('mv4',   'movie',          'Film',          '"Rio" — voice role (2011)',               4),
      h('merit', 'merit',          'Achievement',   'Academy Award nominee',                   4),
      h('mv3',   'movie',          'Film',          '"The Social Network" — as Mark Zuckerberg (2010)', 5),
    ],
  },

  'elijah-wood': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'January 28, 1981',                        2),
      h('bp',    'birth_place',    'Place of birth','Cedar Rapids, Iowa',                       2),
      h('pk',    'peak_year',      'Career peak',   '2001 – 2005',                             2),
      h('mv1',   'movie',          'Film',          '"Eternal Sunshine of the Spotless Mind" (2004)', 3),
      h('mv2',   'movie',          'Film',          '"Happy Feet" — voice role (2006)',        3),
      h('fact1', 'characteristic', 'Fact',          'Started acting as a child in the late 1980s', 4),
      h('mv4',   'movie',          'Film',          '"Deep Impact" (1998)',                    3),
      h('fact2', 'characteristic', 'Fact',          'Also runs an independent record label',   4),
      h('mv3',   'movie',          'Film',          '"The Lord of the Rings" — as Frodo (2001)', 5),
    ],
  },

  'ian-mckellen': {
    categoryLabel: 'Actor',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'May 25, 1939',                            2),
      h('bp',    'birth_place',    'Place of birth','Burnley, England',                        2),
      h('pk',    'peak_year',      'Career peak',   '2000 – 2014',                             2),
      h('fact1', 'characteristic', 'Fact',          'Decades-long career as a Shakespearean stage actor', 3),
      h('mv1',   'movie',          'Film',          '"X-Men" — as Magneto (2000)',             3),
      h('merit', 'merit',          'Achievement',   'Laurence Olivier Award winner',           4),
      h('mv3',   'movie',          'Film',          '"Gods and Monsters" (1998)',              3),
      h('fact2', 'characteristic', 'Fact',          'One of the most celebrated stage actors of his generation', 4),
      h('mv2',   'movie',          'Film',          '"The Lord of the Rings" — as Gandalf (2001)', 5),
    ],
  },

  'hilary-swank': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'July 30, 1974',                           2),
      h('bp',    'birth_place',    'Place of birth','Lincoln, Nebraska',                       2),
      h('pk',    'peak_year',      'Career peak',   '1999 – 2010',                             2),
      h('mv1',   'movie',          'Film',          '"Boys Don\'t Cry" (1999)',                3),
      h('mv2',   'movie',          'Film',          '"P.S. I Love You" (2007)',                3),
      h('fact1', 'characteristic', 'Fact',          'Won Best Actress twice in six years',      4),
      h('mv4',   'movie',          'Film',          '"Freedom Writers" (2007)',                4),
      h('fact2', 'characteristic', 'Fact',          'Grew up in a trailer park before her breakthrough', 3),
      h('mv3',   'movie',          'Film',          '"Million Dollar Baby" (2004)',            5),
    ],
  },

  'macaulay-culkin': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'August 26, 1980',                         2),
      h('bp',    'birth_place',    'Place of birth','New York City',                           2),
      h('pk',    'peak_year',      'Career peak',   '1990 – 1994',                             2),
      h('mv1',   'movie',          'Film',          '"My Girl" (1991)',                        3),
      h('mv2',   'movie',          'Film',          '"Richie Rich" (1994)',                    3),
      h('fact1', 'characteristic', 'Fact',          'One of the highest-paid child actors of the 1990s', 4),
      h('mv4',   'movie',          'Film',          '"Uncle Buck" (1989)',                     3),
      h('fact2', 'characteristic', 'Fact',          'Returned to acting as an adult in the 2000s', 4),
      h('mv3',   'movie',          'Film',          '"Home Alone" — as Kevin McCallister (1990)', 5),
    ],
  },

  'drew-barrymore': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & talk show host',                  1),
      h('bd',    'birth_date',     'Date of birth', 'February 22, 1975',                       2),
      h('bp',    'birth_place',    'Place of birth','Culver City, California',                 2),
      h('pk',    'peak_year',      'Career peak',   '1996 – 2006',                             2),
      h('mv1',   'movie',          'Film',          '"Never Been Kissed" (1999)',              3),
      h('mv2',   'movie',          'Film',          '"50 First Dates" (2004)',                 3),
      h('mv3',   'movie',          'Film',          '"Charlie\'s Angels" (2000)',              4),
      h('fact1', 'characteristic', 'Fact',          'Started acting as a young child',         4),
      h('fact2', 'characteristic', 'Fact',          'Also a film producer and businesswoman',  4),
      h('mv4',   'movie',          'Film',          '"E.T. the Extra-Terrestrial" (1982)',     5),
    ],
  },

  'russell-crowe': {
    categoryLabel: 'Actor',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'April 7, 1964',                           2),
      h('bp',    'birth_place',    'Place of birth','Wellington',                              2),
      h('pk',    'peak_year',      'Career peak',   '1997 – 2007',                             2),
      h('mv1',   'movie',          'Film',          '"L.A. Confidential" (1997)',              3),
      h('mv2',   'movie',          'Film',          '"A Beautiful Mind" (2001)',               3),
      h('mv3',   'movie',          'Film',          '"Robin Hood" (2010)',                     3),
      h('fact1', 'characteristic', 'Fun fact',      'Also fronts his own rock band',           4),
      h('mv5',   'movie',          'Film',          '"Cinderella Man" (2005)',                 4),
      h('mv4',   'movie',          'Film',          '"Gladiator" — as Maximus (2000)',         5),
    ],
  },

  'sam-worthington': {
    categoryLabel: 'Actor',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'August 2, 1976',                          2),
      h('bp',    'birth_place',    'Place of birth','Godalming, England',                      2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2019',                             2),
      h('mv1',   'movie',          'Film',          '"Clash of the Titans" (2010)',            3),
      h('mv2',   'movie',          'Film',          '"Terminator Salvation" (2009)',           3),
      h('fact1', 'characteristic', 'Fact',          'Worked as a bricklayer before acting',    4),
      h('mv4',   'movie',          'Film',          '"Man on a Ledge" (2012)',                 4),
      h('fact2', 'characteristic', 'Fact',          'Was largely unknown before his breakout role', 3),
      h('mv3',   'movie',          'Film',          '"Avatar" — as Jake Sully (2009)',         5),
    ],
  },

  'zoe-saldana': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'June 19, 1978',                           2),
      h('bp',    'birth_place',    'Place of birth','Passaic, New Jersey',                     2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2026',                             2),
      h('mv1',   'movie',          'Film',          '"Guardians of the Galaxy" — as Gamora (2014)', 3),
      h('mv2',   'movie',          'Film',          '"Star Trek" — as Uhura (2009)',           3),
      h('fact1', 'characteristic', 'Fact',          'Appeared in three of the highest-grossing franchises ever', 4),
      h('mv4',   'movie',          'Film',          '"Center Stage" (2000)',                   4),
      h('fact2', 'characteristic', 'Fact',          'Trained as a dancer before acting',        3),
      h('mv3',   'movie',          'Film',          '"Avatar" — as Neytiri (2009)',            5),
    ],
  },

  'shia-labeouf': {
    categoryLabel: 'Actor',
    nationality: 'usa',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor & writer',                          1),
      h('bd',    'birth_date',     'Date of birth', 'June 11, 1986',                           2),
      h('bp',    'birth_place',    'Place of birth','Los Angeles, California',                 2),
      h('pk',    'peak_year',      'Career peak',   '2007 – 2014',                             2),
      h('tv1',   'tv_show',        'Childhood role','"Even Stevens" (Disney Channel)',         3),
      h('mv1',   'movie',          'Film',          '"Indiana Jones and the Crystal Skull" (2008)', 3),
      h('fact1', 'characteristic', 'Fact',          'Wrote the screenplay for a later autobiographical film', 4),
      h('mv3',   'movie',          'Film',          '"Fury" (2014)',                           4),
      h('fact2', 'characteristic', 'Fact',          'Started performing stand-up comedy as a teenager', 3),
      h('mv2',   'movie',          'Film',          '"Transformers" — as Sam Witwicky (2007)', 5),
    ],
  },

  'janne-carlsson': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Drummer & actor',                          1),
      h('bd',    'birth_date',     'Date of birth', 'March 12, 1937',                          2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                2),
      h('pk',    'peak_year',      'Career peak',   '1965 – 1990',                             2),
      h('fact1', 'characteristic', 'Fact',          'Leading drummer in the 1950s–60s Swedish jazz scene', 3),
      h('fact2', 'characteristic', 'Venue',         'Regularly performed at Nalen in Stockholm', 3),
      h('tv1',   'tv_show',        'TV role',       '"Svenska Bilder"',                        4),
      h('fact3', 'characteristic', 'Fact',          'Also worked as a TV presenter and visual artist', 4),
      h('fact4', 'characteristic', 'Fact',          'Later became a well-loved comedic screen presence', 4),
      h('mv1',   'movie',          'Film',          '"Göta kanal eller Vem drog ur proppen?" (1981)', 5),
    ],
  },

  'peter-haber': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'December 12, 1952',                       2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2013',                             2),
      h('tv1',   'tv_show',        'TV role',       '"Martin Beck" detective series',          3),
      h('fact1', 'characteristic', 'Fact',          'Also does voice acting',                  4),
      h('fact2', 'characteristic', 'Fact',          'One of Sweden\'s most recognized television actors', 4),
      h('fact3', 'characteristic', 'Fact',          'Known for both comedic and dramatic roles', 4),
      h('fact4', 'characteristic', 'Fact',          'Has had a decades-long career in film and TV', 3),
      h('mv1',   'movie',          'Film',          '"Sunes sommar" (1993)',                    5),
    ],
  },

  'sverrir-gudnason': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                   1),
      h('bd',    'birth_date',     'Date of birth', 'September 12, 1978',                      2),
      h('bp',    'birth_place',    'Place of birth','Lund',                                     2),
      h('pk',    'peak_year',      'Career peak',   '2001 – 2026',                             2),
      h('mv1',   'movie',          'Film',          '"House of Cards" (2018)',                 3),
      h('mv2',   'movie',          'Film',          '"The Girl in the Spider\'s Web" (2018)',  3),
      h('merit', 'merit',          'Achievement',   'Guldbagge Award winner',                  4),
      h('fact1', 'characteristic', 'Fact',          'Also an accomplished stage actor',        4),
      h('fact2', 'characteristic', 'Fact',          'Has starred in both Swedish and international productions', 4),
      h('mv3',   'movie',          'Film',          '"Borg vs McEnroe" — as Björn Borg (2017)', 5),
    ],
  },

  // ── SCENNAMN — kort/tvetydigt namn klarade inte auto-sök (2026-08-27) ──────
  // Wikidatas sökfunktion hittar rätt entitet långt ner i träfflistan för
  // dessa enordsnamn (Snow, Lena, Frans, ZAYN m.fl.) — auto-gen-scriptet gav
  // upp. QID:n verifierade manuellt (wbgetentities direkt på känt-korrekt id).

  'psy': {
    categoryLabel: 'Musikartist',
    nationality: 'south-korea',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'December 31, 1977',                       2),
      h('bp',    'birth_place',    'Place of birth','Gangnam District, Seoul',                  2),
      h('fact1', 'characteristic', 'Real name',     'Park Jae-sang',                            2),
      h('s1',    'song',           'Hit song',      '"Gangnam Style" (2012)',                   4),
      h('s2',    'song',           'Hit song',      '"Gentleman" (2013)',                       4),
      h('fact2', 'characteristic', 'Fact',          'First video to reach 1 billion YouTube views', 5),
    ],
  },

  'ruslana': {
    categoryLabel: 'Musikartist',
    nationality: 'ukraine',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 24, 1973',                             2),
      h('bp',    'birth_place',    'Place of birth','Lviv',                                      2),
      h('genre', 'characteristic', 'Genre',         'Ethno-dance / folk-rock',                   2),
      h('fact1', 'characteristic', 'Fact',          'Also works as a composer and conductor',    3),
      h('s1',    'song',           'Hit song',      '"Wild Dances" (2004)',                      3),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (2004)',     5),
    ],
  },

  'snow': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'October 30, 1969',                         2),
      h('bp',    'birth_place',    'Place of birth','North York',                                2),
      h('fact1', 'characteristic', 'Genre',         'Dancehall reggae',                          3),
      h('fact2', 'characteristic', 'Real name',     'Darrin O\'Brien',                           2),
      h('s1',    'song',           'Hit song',      '"Informer" (1992)',                         5),
      h('fact3', 'characteristic', 'Fact',          '"Informer" topped the US Billboard Hot 100', 4),
    ],
  },

  'nemo': {
    categoryLabel: 'Musikartist',
    nationality: 'switzerland',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'August 3, 1999',                           2),
      h('bp',    'birth_place',    'Place of birth','Biel/Bienne',                                2),
      h('genre', 'characteristic', 'Genre',         'Pop / rap / opera fusion',                  2),
      h('s1',    'song',           'Hit song',      '"The Code" (2024)',                          3),
      h('fact1', 'characteristic', 'Fact',          'First non-binary Eurovision winner',        4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (2024)',      5),
    ],
  },

  'lena': {
    categoryLabel: 'Musikartist',
    nationality: 'germany',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 23, 1991',                             2),
      h('bp',    'birth_place',    'Place of birth','Hanover',                                    2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('s1',    'song',           'Hit song',      '"Satellite" (2010)',                         3),
      h('s2',    'song',           'Hit song',      '"Taken by a Stranger" (2011)',                3),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (2010)',      5),
    ],
  },

  'zayn': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'January 12, 1993',                         2),
      h('bp',    'birth_place',    'Place of birth','Bradford, England',                          2),
      h('fact1', 'characteristic', 'Real name',     'Zain Javadd Malik',                         2),
      h('genre', 'characteristic', 'Genre',         'R&B / Pop',                                 2),
      h('fact2', 'characteristic', 'Early career',  'Former member of One Direction',            3),
      h('s1',    'song',           'Hit song',      '"Pillowtalk" (2016)',                        4),
    ],
  },

  'frans': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'December 19, 1998',                        2),
      h('bp',    'birth_place',    'Place of birth','Ystad',                                      2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('s1',    'song',           'Hit song',      '"If I Were Sorry" (2016)',                   3),
      h('s2',    'song',           'Hit song',      '"Perfect Life" (2017)',                      3),
      h('merit', 'merit',          'Merit/Award',   'Melodifestivalen winner (2016)',             5),
    ],
  },

  'bobbysocks': {
    categoryLabel: 'Band',
    nationality: 'norway',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1983',                                      2),
      h('genre', 'characteristic', 'Genre',         'Pop / schlager',                            2),
      h('member','band_member',   'Members',       'Hanne Krogh & Elisabeth Andreassen',         3),
      h('s1',    'song',           'Hit song',      '"La det swinge" (1985)',                     4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (1985)',      5),
    ],
  },

  'sugarhill-gang': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1973',                                      2),
      h('reclabel', 'characteristic', 'Record label', 'Sugar Hill Records',                      2),
      h('member','band_member',   'Members',       'Wonder Mike, Big Bank Hank, Master Gee',     3),
      h('fact2', 'characteristic', 'Fact',          'One of the first hip hop acts to gain mainstream popularity', 3),
      h('s1',    'song',           'Hit song',      '"Rapper\'s Delight" (1979)',                 5),
    ],
  },

  // ── Auto-sök gav FEL entitet (2026-08-27) — Wikidata-sökningen matchade
  // en helt annan, orelaterad entitet (en akademiker, en filippinsk provins,
  // en TV-kanal, ett förnamn, en Wikimedia-diskografisida) trots limit=20 +
  // scoring. Manuellt kuraterat i stället för att fortsätta jaga söktermer.

  'antique': {
    categoryLabel: 'Band',
    nationality: 'greece',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1999',                                      2),
      h('member','band_member',   'Members',       'Helena Paparizou & Nicholas Arvanitis',      3),
      h('genre', 'characteristic', 'Genre',         'Pop / dance-pop',                           2),
      h('s1',    'song',           'Hit song',      '"(I Would) Die for You" (2001)',             4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest, 3rd place (2001)',  4),
    ],
  },

  'riva': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1988',                                      2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('fact2', 'characteristic', 'Fact',          'Formed specifically to compete at Eurovision', 3),
      h('s1',    'song',           'Hit song',      '"Rock Me" (1989)',                           4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (1989)',      5),
    ],
  },

  'the-black-eyed-peas': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1995',                                      2),
      h('member','band_member',   'Members',       'will.i.am, apl.de.ap, Taboo, Fergie',        3),
      h('genre', 'characteristic', 'Genre',         'Hip hop / pop',                             2),
      h('s1',    'song',           'Hit song',      '"I Gotta Feeling" (2009)',                   4),
      h('merit', 'merit',          'Merit/Award',   'Multiple Grammy Awards',                     4),
    ],
  },

  'tlc': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '1990',                                      2),
      h('member','band_member',   'Members',       'T-Boz, Left Eye, Chilli',                    3),
      h('genre', 'characteristic', 'Genre',         'R&B / hip hop',                             2),
      h('s1',    'song',           'Hit song',      '"Waterfalls" (1995)',                        4),
      h('s2',    'song',           'Hit song',      '"No Scrubs" (1999)',                         4),
    ],
  },

  // ── Auto-genererat men för tunt för tröskeln (2026-08-27) — behåller
  // Wikidata-hämtade fakta (genre/medlemmar/bildningsår/etikett) och lägger
  // till 1-3 verifierade extra-fakta så varje item når minst 5 render-entries.
  // Nationalitetsord är MEDVETET utelämnade i alla värden (flaggan bär redan
  // den infon) — se "About"-fälten i katalogen för de ord som annars
  // filtrerades bort av isNationalityHint.

  'benny-benassi': {
    categoryLabel: 'Musikartist',
    nationality: 'italy',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'July 13, 1967',                            2),
      h('bp',    'birth_place',    'Place of birth','Reggio Emilia',                              2),
      h('genre', 'characteristic', 'Genre',         'Electro house',                             2),
      h('desc',  'characteristic', 'About',         'DJ, record producer and remixer',            1),
      h('s1',    'song',           'Hit song',      '"Satisfaction" (2002)',                      4),
      h('fact1', 'characteristic', 'Fact',          'The music video features dancing robots',    3),
    ],
  },

  'dooley-wilson': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'April 3, 1886',                            2),
      h('bp',    'birth_place',    'Place of birth','Tyler',                                      2),
      h('genre', 'characteristic', 'Genre',         'Popular music',                             2),
      h('fact1', 'characteristic', 'Fact',          'Played Sam, the piano player, in Casablanca (1942)', 3),
      h('s1',    'song',           'Hit song',      '"As Time Goes By" (performed in Casablanca)', 4),
      h('instr', 'characteristic', 'Instrument',    'Drum kit',                                   2),
    ],
  },

  'haddaway': {
    categoryLabel: 'Musikartist',
    nationality: 'germany',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'January 9, 1965',                          2),
      h('bp',    'birth_place',    'Place of birth','Port of Spain',                              2),
      h('genre', 'characteristic', 'Genre',         'Eurodance / electronic dance music',        2),
      h('merit', 'merit',          'Merit/Award',   'Echo Pop Award for the Hit of the Year',    5),
      h('s1',    'song',           'Hit song',      '"What Is Love" (1993)',                      5),
      h('fact1', 'characteristic', 'Fact',          'The song became a well-known internet meme decades later', 2),
    ],
  },

  'hadise': {
    categoryLabel: 'Musikartist',
    nationality: 'belgium',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'October 22, 1985',                        2),
      h('bp',    'birth_place',    'Place of birth','Mol',                                        2),
      h('genre', 'characteristic', 'Genre',         'Rhythm and blues',                          2),
      h('s1',    'song',           'Hit song',      '"Düm Tek Tek" (2009)',                       3),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest, 4th place (2009)', 4),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'knaan': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 30, 1978',                            2),
      h('bp',    'birth_place',    'Place of birth','Mogadishu',                                 2),
      h('genre', 'characteristic', 'Genre',         'Alternative hip-hop',                       2),
      h('fact1', 'characteristic', 'Fact',          'Official anthem of the 2010 FIFA World Cup', 4),
      h('s1',    'song',           'Hit song',      '"Wavin\' Flag" (2009)',                      5),
      h('instr', 'characteristic', 'Instrument',    'Guitar',                                    2),
    ],
  },

  'londonbeat': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre', 'characteristic', 'Genre',         'Rhythm and blues',                          2),
      h('member','band_member',   'Members',       'Jimmy Helms, Jimmy Chambers, George Chandler, William Henshall', 3),
      h('formed','creation_year',  'Formed',        '1988',                                      2),
      h('s1',    'song',           'Hit song',      '"I\'ve Been Thinking About You" (1990)',     4),
      h('fact1', 'characteristic', 'Fact',          'Part of the late-1980s dance-pop scene',      3),
    ],
  },

  'mabel': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'February 19, 1996',                       2),
      h('bp',    'birth_place',    'Place of birth','Alhaurín el Grande',                        2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('fact1', 'characteristic', 'Fact',          'Daughter of singer Neneh Cherry',            3),
      h('s1',    'song',           'Hit song',      '"Don\'t Call Me Up" (2019)',                 4),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'marie-myriam': {
    categoryLabel: 'Musikartist',
    nationality: 'france',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 8, 1957',                              2),
      h('bp',    'birth_place',    'Place of birth','Kananga',                                    2),
      h('s1',    'song',           'Hit song',      '"L\'oiseau et l\'enfant" (1977)',            4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (1977)',      5),
      h('fact1', 'characteristic', 'Fact',          'Was just 19 years old when she won',         2),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'mark-morrison': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 3, 1972',                              2),
      h('bp',    'birth_place',    'Place of birth','Hanover',                                    2),
      h('genre', 'characteristic', 'Genre',         'Contemporary R&B',                          2),
      h('s1',    'song',           'Hit song',      '"Return of the Mack" (1996)',                5),
      h('fact1', 'characteristic', 'Fact',          'The song topped the singles chart',          3),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'kaoma': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',    'characteristic', 'Genre',         'Lambada',                                 2),
      h('reclabel', 'characteristic', 'Record label',  'Epic Records',                            2),
      h('member',   'band_member',    'Lead singer',   'Loalwa Braz',                             3),
      h('fact1',    'characteristic', 'Fact',          'Sparked a global lambada dance craze',     3),
      h('s1',       'song',           'Hit song',      '"Lambada" (1989)',                        5),
    ],
  },

  'planet-funk': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',    'characteristic', 'Genre',         'Electronica',                             2),
      h('member',   'band_member',    'Members',       'Alex Neri, Marco Baroni, Alessandro Sommella, Alex Uhlmann', 3),
      h('reclabel', 'characteristic', 'Record label',  'Virgin Records',                          2),
      h('s1',       'song',           'Hit song',      '"Chase the Sun" (2001)',                   4),
      h('fact1',    'characteristic', 'Fact',          'A staple track on chillout compilation albums', 2),
    ],
  },

  'secret-garden': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',    'characteristic', 'Genre',         'New age music',                           2),
      h('member',   'band_member',    'Members',       'Fionnuala Sherry, Rolf Løvland',          3),
      h('reclabel', 'characteristic', 'Record label',  'Universal Records',                       2),
      h('s1',       'song',           'Hit song',      '"Nocturne" (1995)',                       4),
      h('merit',    'merit',          'Merit/Award',   'Eurovision Song Contest winner (1995)',   5),
    ],
  },

  'the-archies': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('fact1',    'creation_year',  'Formed',        '1968',                                    2),
      h('genre',    'characteristic', 'Genre',         'Bubblegum music',                         2),
      h('member',   'band_member',    'Members',       'Archie Andrews, Jughead Jones, Reggie Mantle, Veronica Lodge', 3),
      h('s1',       'song',           'Hit song',      '"Sugar, Sugar" (1969)',                    5),
      h('reclabel', 'characteristic', 'Record label',  'RCA',                                     2),
    ],
  },

  'roger-pontare': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'October 17, 1951',                        2),
      h('bp',    'birth_place',    'Place of birth','Örnsköldsvik',                              2),
      h('genre', 'characteristic', 'Genre',         'Folk rock',                                 2),
      h('s1',    'song',           'Hit song',      '"Sommarnatt" (1994)',                       3),
      h('merit', 'merit',          'Merit/Award',   'Melodifestivalen winner (1994)',            5),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'martin-stenmarck': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'October 3, 1972',                         2),
      h('bp',    'birth_place',    'Place of birth','Stockholm',                                 2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('s1',    'song',           'Hit song',      '"Las Vegas" (2005)',                        4),
      h('merit', 'merit',          'Merit/Award',   'Melodifestivalen winner (2005)',            5),
      h('instr', 'characteristic', 'Instrument',    'Guitar',                                    2),
    ],
  },

  'elena-tsagkrinou': {
    categoryLabel: 'Musikartist',
    nationality: 'greece',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'November 16, 1994',                       2),
      h('bp',    'birth_place',    'Place of birth','Athens',                                    2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('s1',    'song',           'Hit song',      '"El Diablo" (2021)',                        4),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest entrant (2021)',    4),
    ],
  },

  'charlotte-nilsson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'January 25, 1974',                        2),
      h('bp',    'birth_place',    'Place of birth','Skövde',                                    2),
      h('fact1', 'characteristic', 'Fact',          'Later known professionally as Charlotte Perrelli', 3),
      h('s1',    'song',           'Hit song',      '"Take Me to Your Heaven" (1999)',           4),
      h('s2',    'song',           'Hit song',      '"The Girl" (2008)',                          3),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest winner (1999)',     5),
    ],
  },

  'ges': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('member',  'band_member',    'Members',       'Anders Glenmark, Orup, Niklas Strömstedt', 3),
      h('formed',  'creation_year',  'Formed',        '1994',                                    2),
      h('genre',   'characteristic', 'Genre',         'Popular music',                           2),
      h('fact1',   'characteristic', 'Fact',          'Each member also had an established solo career', 3),
      h('fact2',   'characteristic', 'Fact',          'Band name is an acronym of the members\' surnames', 3),
    ],
  },

  'barbados': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',  'characteristic', 'Genre',         'Dansbandspop',                            2),
      h('member', 'band_member',    'Members',       'Magnus Carlsson',                          3),
      h('formed', 'creation_year',  'Formed',        '1992',                                    2),
      h('fact1',  'characteristic', 'Fact',          'Frontman later became a solo Melodifestivalen artist', 3),
      h('fact2',  'characteristic', 'Fact',          'Regular performers on the dance-hall festival circuit', 2),
    ],
  },

  'sarek': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('member',   'band_member',    'Members',       'Kristofer Pettersson, Zara Kronwall, Stina Engelbrecht, Göran Månsson', 3),
      h('formed',   'creation_year',  'Formed',        '2002',                                  2),
      h('genre',    'characteristic', 'Genre',         'Dansband',                              2),
      h('reclabel', 'characteristic', 'Record label',  'Start Klart Records',                   2),
      h('fact1',    'characteristic', 'Fact',          'A regular act on the dansband touring circuit', 2),
    ],
  },

  'dario-g': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',  'characteristic', 'Genre',         'Dance music',                             2),
      h('member', 'band_member',    'Members',       'Paul Spencer',                             3),
      h('s1',     'song',           'Hit song',      '"Sunchyme" (1997)',                        4),
      h('s2',     'song',           'Hit song',      '"Carnaval de Paris" (1998)',                4),
      h('fact1',  'characteristic', 'Fact',          'Known for football/World Cup-themed dance anthems', 2),
    ],
  },

  'brandsta': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('fact1', 'characteristic', 'Full name',     'Ends in "City Släckers"',                    2),
      h('genre', 'characteristic', 'Genre',         'Comedy rap',                                2),
      h('formed','creation_year',  'Formed',        '1994',                                      2),
      h('fact2', 'characteristic', 'Fact',          'Known for humorous, satirical lyrics',      3),
      h('fact3', 'characteristic', 'Fact',          'Blends regional dialect humor with hip hop', 3),
    ],
  },

  'nick-borgen': {
    categoryLabel: 'Musikartist',
    nationality: 'norway',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'January 5, 1952',                         2),
      h('bp',    'birth_place',    'Place of birth','Andenes',                                   2),
      h('genre', 'characteristic', 'Genre',         'Dansband',                                 2),
      h('instr', 'characteristic', 'Instrument',    'Acoustic guitar',                          2),
      h('fact1', 'characteristic', 'Fact',          'Career spanning several decades in the dansband scene', 2),
      h('fact2', 'characteristic', 'Fact',          'Also active as a songwriter for other artists', 2),
    ],
  },

  'kaj': {
    categoryLabel: 'Band',
    nationality: 'finland',
    hints: [
      h('fact1', 'creation_year',  'Formed',        '2009',                                      2),
      h('fact2', 'characteristic', 'Fact',          'Performs comedy and music in a rural dialect', 3),
      h('genre', 'characteristic', 'Genre',         'Comedy / schlager',                         2),
      h('s1',    'song',           'Hit song',      '"Bara Bada Bastu" (2025)',                   4),
      h('merit', 'merit',          'Merit/Award',   'Eurovision Song Contest entrant (2025)',     4),
    ],
  },

  'anis-don-demina': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'April 25, 1993',                          2),
      h('bp',    'birth_place',    'Place of birth','Sundsvall',                                 2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('fact1', 'characteristic', 'Fact',          'Also works as a music producer for other artists', 3),
      h('fact2', 'characteristic', 'Fact',          'Known for blending pop with hip hop influences', 3),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'bolaget': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre',    'characteristic', 'Genre',         'Pop',                                     2),
      h('formed',   'creation_year',  'Formed',        '2019',                                    2),
      h('reclabel', 'characteristic', 'Record label',  'Metronome Records A/B',                   2),
      h('fact1',    'characteristic', 'Fact',          'Members were already established in the pop scene', 3),
      h('fact2',    'characteristic', 'Fact',          'Signed to a long-established Nordic record label', 2),
    ],
  },

  'rolandz': {
    categoryLabel: 'Band',
    nationality: 'unknown',
    hints: [
      h('genre', 'characteristic', 'Genre',         'Dansband',                                  2),
      h('formed','creation_year',  'Formed',        '2008',                                      2),
      h('formloc','characteristic','Formed in',     'Värmland',                                  2),
      h('fact1', 'characteristic', 'Fact',          'Known for lively, crowd-pleasing live shows', 2),
      h('fact2', 'characteristic', 'Fact',          'A staple on the dance-hall circuit',         2),
    ],
  },

  'kapten-rod': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'July 7, 1983',                            2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg',                                2),
      h('genre', 'characteristic', 'Genre',         'Reggae',                                    2),
      h('fact1', 'characteristic', 'Fact',          'Part of Gothenburg\'s reggae and dancehall scene', 3),
      h('fact2', 'characteristic', 'Fact',          'Also active as a record producer',          2),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  'lucianoz': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('bd',    'birth_date',     'Date of birth', 'May 13, 1993',                            2),
      h('bp',    'birth_place',    'Place of birth','Solna',                                     2),
      h('genre', 'characteristic', 'Genre',         'Pop',                                       2),
      h('merit', 'merit',          'Merit/Award',   'Guldklaven',                                5),
      h('fact1', 'characteristic', 'Fact',          'Part of the modern Nordic pop scene',       2),
      h('instr', 'characteristic', 'Instrument',    'Voice',                                     2),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 1 (international majors, 2026-09-02)
  // Framework: no duplicate hint text, songs ascending-year within each tier,
  // no nationality words / sensitive terms in values.
  // ══════════════════════════════════════════════════════════════════════════

  'coldplay': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'One of the best-selling bands ever', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1996',          2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Chris Martin',         2),
      h('pk',   'peak_year',      'Career peak',  '2000 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Yellow" (2000)',                 3),
      h('s2',   'song',           'Hit song',     '"The Scientist" (2002)',          3),
      h('s3',   'song',           'Hit song',     '"Speed of Sound" (2005)',         3),
      h('s4',   'song',           'Hit song',     '"Paradise" (2011)',               3),
      h('alb1', 'album',          'Album',        '"Parachutes" (2000)',             3),
      h('alb2', 'album',          'Album',        '"X&Y" (2005)',                    3),
      h('s5',   'song',           'Hit song',     '"Clocks" (2002)',                 4),
      h('s6',   'song',           'Hit song',     '"Fix You" (2005)',                4),
      h('s7',   'song',           'Hit song',     '"A Sky Full of Stars" (2014)',    4),
      h('sig',  'song',           'Signature',    '"Viva la Vida" (2008)',           5),
    ],
  },

  'bee-gees': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop group',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Trio of the Gibb brothers',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1958',                  2),
      h('mem',  'band_member',    'Members',      'Barry, Robin & Maurice Gibb',     2),
      h('pk',   'peak_year',      'Career peak',  '1967 – 1979',                     2),
      h('s1',   'song',           'Hit song',     '"Massachusetts" (1967)',          3),
      h('s2',   'song',           'Hit song',     '"You Should Be Dancing" (1976)',  3),
      h('s3',   'song',           'Hit song',     '"Night Fever" (1977)',            3),
      h('s4',   'song',           'Hit song',     '"Tragedy" (1979)',                3),
      h('f2',   'characteristic', 'Known for',    'Falsetto three-part harmonies',   3),
      h('sf',   'characteristic', 'Iconic work',  'Saturday Night Fever soundtrack (1977)', 4),
      h('s5',   'song',           'Hit song',     '"How Deep Is Your Love" (1977)',  4),
      h('sig',  'song',           'Signature',    '"Stayin\' Alive" (1977)',         5),
    ],
  },

  'fleetwood-mac': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Famous line-up turmoil & romance', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1967',          2),
      h('mem',  'band_member',    'Members',      'Stevie Nicks & Lindsey Buckingham', 2),
      h('pk',   'peak_year',      'Career peak',  '1975 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"Albatross" (1968)',              3),
      h('s2',   'song',           'Hit song',     '"Go Your Own Way" (1976)',        3),
      h('s3',   'song',           'Hit song',     '"Dreams" (1977)',                 3),
      h('s4',   'song',           'Hit song',     '"Everywhere" (1987)',             3),
      h('s5',   'song',           'Hit song',     '"The Chain" (1977)',              4),
      h('s6',   'song',           'Hit song',     '"Little Lies" (1987)',            4),
      h('alb',  'album',          'Iconic album', '"Rumours" (1977)',                5),
      h('sig',  'song',           'Signature',    '"Don\'t Stop" (1977)',            5),
    ],
  },

  'the-police': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'New-wave / reggae-rock trio',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1977',          2),
      h('mem',  'band_member',    'Members',      'Sting, Summers & Copeland',       2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Roxanne" (1978)',                3),
      h('s2',   'song',           'Hit song',     '"Message in a Bottle" (1979)',    3),
      h('s3',   'song',           'Hit song',     '"Walking on the Moon" (1979)',    3),
      h('s4',   'song',           'Hit song',     '"Don\'t Stand So Close to Me" (1980)', 3),
      h('alb',  'album',          'Iconic album', '"Synchronicity" (1983)',          4),
      h('sig',  'song',           'Signature',    '"Every Breath You Take" (1983)',  5),
    ],
  },

  'arctic-monkeys': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Broke through via early internet buzz', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Sheffield, 2002',       2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Alex Turner',          2),
      h('pk',   'peak_year',      'Career peak',  '2005 – present',                  2),
      h('s1',   'song',           'Hit song',     '"I Bet You Look Good on the Dancefloor" (2005)', 3),
      h('s2',   'song',           'Hit song',     '"When the Sun Goes Down" (2006)', 3),
      h('s3',   'song',           'Hit song',     '"Fluorescent Adolescent" (2007)', 3),
      h('s4',   'song',           'Hit song',     '"R U Mine?" (2012)',              3),
      h('alb1', 'album',          'Debut album',  '"Whatever People Say I Am..." (2006)', 4),
      h('s5',   'song',           'Hit song',     '"Why\'d You Only Call Me When You\'re High?" (2013)', 4),
      h('alb2', 'album',          'Iconic album', '"AM" (2013)',                     5),
      h('sig',  'song',           'Signature',    '"Do I Wanna Know?" (2013)',       5),
    ],
  },

  'aha': {
    categoryLabel: 'Band',
    nationality: 'norway',
    hints: [
      h('prof', 'profession',     'Profession',   'Synth-pop group',                 1),
      h('f1',   'characteristic', 'Fun fact',     'Iconic pencil-sketch music video', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Oslo, 1982',            2),
      h('mem',  'band_member',    'Members',      'Harket, Furuholmen & Waaktaar',   2),
      h('pk',   'peak_year',      'Career peak',  '1985 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"The Sun Always Shines on TV" (1985)', 3),
      h('s2',   'song',           'Hit song',     '"Hunting High and Low" (1986)',   3),
      h('s3',   'song',           'Hit song',     '"Cry Wolf" (1986)',               3),
      h('s4',   'song',           'Hit song',     '"Stay on These Roads" (1988)',    3),
      h('bond', 'song',           'Bond theme',   '"The Living Daylights" (1987)',   4),
      h('alb',  'album',          'Debut album',  '"Hunting High and Low" (1985)',   4),
      h('sig',  'song',           'Signature',    '"Take On Me" (1985)',             5),
    ],
  },

  'bon-jovi': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Arena-rock anthems of the 80s',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in New Jersey, 1983',      2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Jon Bon Jovi',         2),
      h('pk',   'peak_year',      'Career peak',  '1986 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Runaway" (1984)',                3),
      h('s2',   'song',           'Hit song',     '"You Give Love a Bad Name" (1986)', 3),
      h('s3',   'song',           'Hit song',     '"Never Say Goodbye" (1987)',   3),
      h('s4',   'song',           'Hit song',     '"Bad Medicine" (1988)',           3),
      h('s5',   'song',           'Hit song',     '"Always" (1994)',                 4),
      h('s6',   'song',           'Hit song',     '"It\'s My Life" (2000)',          4),
      h('alb',  'album',          'Iconic album', '"Slippery When Wet" (1986)',      5),
      h('sig',  'song',           'Signature',    '"Livin\' on a Prayer" (1986)',    5),
    ],
  },

  'bryan-adams': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer',                     1),
      h('f1',   'characteristic', 'Fun fact',     'Also a renowned photographer',    1),
      h('bd',   'birth_date',     'Date of birth','November 5, 1959',                2),
      h('bp',   'birth_place',    'Place of birth','Kingston, Ontario',              2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1996',                     2),
      h('s1',   'song',           'Hit song',     '"Cuts Like a Knife" (1983)',      3),
      h('s2',   'song',           'Hit song',     '"Run to You" (1984)',             3),
      h('s3',   'song',           'Hit song',     '"Heaven" (1984)',                 3),
      h('s4',   'song',           'Hit song',     '"Please Forgive Me" (1993)',      3),
      h('alb',  'album',          'Iconic album', '"Reckless" (1984)',               4),
      h('s5',   'song',           'Hit song',     '"Summer of \'69" (1984)',         4),
      h('sig',  'song',           'Signature',    '"(Everything I Do) I Do It for You" (1991)', 5),
    ],
  },

  'metallica': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Heavy metal band',                1),
      h('f1',   'characteristic', 'Fun fact',     'Best-selling metal band ever',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1981',     2),
      h('mem',  'band_member',    'Members',      'Hetfield, Ulrich & Hammett',      2),
      h('pk',   'peak_year',      'Career peak',  '1986 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Master of Puppets" (1986)',      3),
      h('s2',   'song',           'Hit song',     '"One" (1989)',                    3),
      h('s3',   'song',           'Hit song',     '"The Unforgiven" (1991)',         3),
      h('s4',   'song',           'Hit song',     '"Sad but True" (1991)',           3),
      h('alb',  'album',          'Iconic album', 'Self-titled "Black Album" (1991)', 4),
      h('s5',   'song',           'Hit song',     '"Nothing Else Matters" (1992)',   4),
      h('sig',  'song',           'Signature',    '"Enter Sandman" (1991)',          5),
    ],
  },

  'guns-n-roses': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Hard rock band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Known for a top-hat guitarist',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1985',     2),
      h('mem',  'band_member',    'Members',      'Axl Rose & Slash',                2),
      h('pk',   'peak_year',      'Career peak',  '1987 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"Welcome to the Jungle" (1987)',  3),
      h('s2',   'song',           'Hit song',     '"Paradise City" (1987)',          3),
      h('s3',   'song',           'Hit song',     '"Patience" (1989)',               3),
      h('s4',   'song',           'Hit song',     '"November Rain" (1991)',          3),
      h('alb',  'album',          'Debut album',  '"Appetite for Destruction" (1987)', 4),
      h('s5',   'song',           'Hit song',     '"Don\'t Cry" (1991)',             4),
      h('sig',  'song',           'Signature',    '"Sweet Child o\' Mine" (1987)',   5),
    ],
  },

  'led-zeppelin': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Pioneers of hard rock',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1968',          2),
      h('mem',  'band_member',    'Members',      'Robert Plant & Jimmy Page',       2),
      h('pk',   'peak_year',      'Career peak',  '1969 – 1979',                     2),
      h('s1',   'song',           'Hit song',     '"Whole Lotta Love" (1969)',       3),
      h('s2',   'song',           'Hit song',     '"Immigrant Song" (1970)',         3),
      h('s3',   'song',           'Hit song',     '"Rock and Roll" (1971)',          3),
      h('s4',   'song',           'Hit song',     '"Kashmir" (1975)',                3),
      h('alb',  'album',          'Iconic album', '"Physical Graffiti" (1975)',        4),
      h('sig',  'song',           'Signature',    '"Stairway to Heaven" (1971)',     5),
    ],
  },

  'pink-floyd': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Prism cover art is iconic',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1965',          2),
      h('mem',  'band_member',    'Members',      'Roger Waters & David Gilmour',    2),
      h('pk',   'peak_year',      'Career peak',  '1973 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Money" (1973)',                  3),
      h('s2',   'song',           'Hit song',     '"Time" (1973)',                   3),
      h('s3',   'song',           'Hit song',     '"Wish You Were Here" (1975)',     3),
      h('s4',   'song',           'Hit song',     '"Comfortably Numb" (1979)',       3),
      h('alb1', 'album',          'Iconic album', '"The Dark Side of the Moon" (1973)', 4),
      h('alb2', 'album',          'Iconic album', '"The Wall" (1979)',               4),
      h('sig',  'song',           'Signature',    '"Another Brick in the Wall" (1979)', 5),
    ],
  },

  'eagles': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Country-rock harmony sound',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1971',     2),
      h('mem',  'band_member',    'Members',      'Don Henley & Glenn Frey',         2),
      h('pk',   'peak_year',      'Career peak',  '1972 – 1980',                     2),
      h('s1',   'song',           'Hit song',     '"Take It Easy" (1972)',           3),
      h('s2',   'song',           'Hit song',     '"Desperado" (1973)',              3),
      h('s3',   'song',           'Hit song',     '"One of These Nights" (1975)',    3),
      h('s4',   'song',           'Hit song',     '"New Kid in Town" (1976)',        3),
      h('s5',   'song',           'Hit song',     '"Life in the Fast Lane" (1977)',  4),
      h('alb',  'album',          'Iconic album', '"Hotel California" album (1976)', 4),
      h('sig',  'song',           'Signature',    '"Hotel California" (1976)',       5),
    ],
  },

  'green-day': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Punk rock band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Led the 90s pop-punk revival',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in California, 1987',      2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Billie Joe Armstrong', 2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 2009',                     2),
      h('s1',   'song',           'Hit song',     '"Basket Case" (1994)',            3),
      h('s2',   'song',           'Hit song',     '"When I Come Around" (1994)',     3),
      h('s3',   'song',           'Hit song',     '"Good Riddance (Time of Your Life)" (1997)', 3),
      h('s4',   'song',           'Hit song',     '"Wake Me Up When September Ends" (2005)', 3),
      h('alb1', 'album',          'Debut hit',    '"Dookie" album (1994)',           4),
      h('s5',   'song',           'Hit song',     '"21 Guns" (2009)',                4),
      h('sig',  'song',           'Signature',    '"Boulevard of Broken Dreams" (2004)', 5),
    ],
  },

  'oasis': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Britpop icons with feuding brothers', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Manchester, 1991',      2),
      h('mem',  'band_member',    'Members',      'Liam & Noel Gallagher',           2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Supersonic" (1994)',             3),
      h('s2',   'song',           'Hit song',     '"Live Forever" (1994)',           3),
      h('s3',   'song',           'Hit song',     '"Some Might Say" (1995)',         3),
      h('s4',   'song',           'Hit song',     '"Champagne Supernova" (1996)',    3),
      h('alb',  'album',          'Iconic album', '"(What\'s the Story) Morning Glory?" (1995)', 4),
      h('s5',   'song',           'Hit song',     '"Don\'t Look Back in Anger" (1995)', 4),
      h('sig',  'song',           'Signature',    '"Wonderwall" (1995)',             5),
    ],
  },

  'radiohead': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Experimental, genre-shifting sound', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Oxfordshire, 1985',     2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Thom Yorke',           2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2011',                     2),
      h('s1',   'song',           'Hit song',     '"Fake Plastic Trees" (1995)',     3),
      h('s2',   'song',           'Hit song',     '"Paranoid Android" (1997)',       3),
      h('s3',   'song',           'Hit song',     '"No Surprises" (1997)',           3),
      h('s4',   'song',           'Hit song',     '"Nude" (2007)',                   3),
      h('alb1', 'album',          'Iconic album', '"OK Computer" (1997)',            4),
      h('alb2', 'album',          'Iconic album', '"Kid A" (2000)',                  4),
      h('sig',  'song',           'Signature',    '"Karma Police" (1997)',           5),
      h('s5',   'song',           'Breakthrough', '"Creep" (1992)',                  5),
    ],
  },

  'the-rolling-stones': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Tongue-and-lips logo',            1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1962',          2),
      h('mem',  'band_member',    'Members',      'Mick Jagger & Keith Richards',    2),
      h('pk',   'peak_year',      'Career peak',  '1965 – 1981',                     2),
      h('s1',   'song',           'Hit song',     '"Paint It Black" (1966)',         3),
      h('s2',   'song',           'Hit song',     '"Jumpin\' Jack Flash" (1968)',    3),
      h('s3',   'song',           'Hit song',     '"Gimme Shelter" (1969)',          3),
      h('s4',   'song',           'Hit song',     '"Angie" (1973)',                  3),
      h('s5',   'song',           'Hit song',     '"Start Me Up" (1981)',            4),
      h('s6',   'song',           'Hit song',     '"Brown Sugar" (1971)',            4),
      h('sig',  'song',           'Signature',    '"(I Can\'t Get No) Satisfaction" (1965)', 5),
    ],
  },

  'the-smiths': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Alternative rock band',           1),
      h('f1',   'characteristic', 'Fun fact',     'Defining 80s indie sound',        1),
      h('cy',   'creation_year',  'Formed',       'Formed in Manchester, 1982',      2),
      h('mem',  'band_member',    'Members',      'Morrissey & Johnny Marr',         2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"This Charming Man" (1983)',      3),
      h('s2',   'song',           'Hit song',     '"How Soon Is Now?" (1984)',       3),
      h('s3',   'song',           'Hit song',     '"Panic" (1986)',                  3),
      h('s4',   'song',           'Hit song',     '"Bigmouth Strikes Again" (1986)', 3),
      h('alb',  'album',          'Iconic album', '"Strangeways, Here We Come" (1987)',      4),
      h('sig',  'song',           'Signature',    '"There Is a Light That Never Goes Out" (1986)', 5),
    ],
  },

  'dire-straits': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Clean fingerstyle guitar sound',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1977',          2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Mark Knopfler',        2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1991',                     2),
      h('s1',   'song',           'Hit song',     '"Sultans of Swing" (1978)',       3),
      h('s2',   'song',           'Hit song',     '"Romeo and Juliet" (1980)',       3),
      h('s3',   'song',           'Hit song',     '"Private Investigations" (1982)', 3),
      h('s4',   'song',           'Hit song',     '"Walk of Life" (1985)',           3),
      h('alb',  'album',          'Iconic album', '"Brothers in Arms" (1985)',       4),
      h('sig',  'song',           'Signature',    '"Money for Nothing" (1985)',      5),
    ],
  },

  'def-leppard': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Polished arena-rock production',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in Sheffield, 1977',       2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Joe Elliott',          2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1992',                     2),
      h('s1',   'song',           'Hit song',     '"Photograph" (1983)',             3),
      h('s2',   'song',           'Hit song',     '"Rock of Ages" (1983)',           3),
      h('s3',   'song',           'Hit song',     '"Animal" (1987)',                 3),
      h('s4',   'song',           'Hit song',     '"Love Bites" (1987)',             3),
      h('alb1', 'album',          'Iconic album', '"Pyromania" (1983)',              4),
      h('alb2', 'album',          'Iconic album', '"Hysteria" (1987)',               4),
      h('sig',  'song',           'Signature',    '"Pour Some Sugar on Me" (1987)',  5),
    ],
  },

  'bruce-springsteen': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer-songwriter',          1),
      h('f1',   'characteristic', 'Known as',     'Nicknamed "The Boss"',            1),
      h('bd',   'birth_date',     'Date of birth','September 23, 1949',              2),
      h('bp',   'birth_place',    'Place of birth','Long Branch, New Jersey',        2),
      h('pk',   'peak_year',      'Career peak',  '1975 – 1994',                     2),
      h('band', 'characteristic', 'Backing band', 'Plays with the E Street Band',    3),
      h('s1',   'song',           'Hit song',     '"Born to Run" (1975)',            3),
      h('s2',   'song',           'Hit song',     '"Hungry Heart" (1980)',           3),
      h('s3',   'song',           'Hit song',     '"Dancing in the Dark" (1984)',    3),
      h('s4',   'song',           'Hit song',     '"Glory Days" (1985)',             3),
      h('alb',  'album',          'Iconic album', '"Born in the U.S.A." album (1984)', 4),
      h('s5',   'song',           'Hit song',     '"Streets of Philadelphia" (1994)', 4),
      h('sig',  'song',           'Signature',    '"Born in the U.S.A." (1984)',     5),
    ],
  },

  'sting': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer-songwriter & bassist',     1),
      h('f1',   'characteristic', 'Real name',    'Born Gordon Sumner',              1),
      h('bd',   'birth_date',     'Date of birth','October 2, 1951',                 2),
      h('bp',   'birth_place',    'Place of birth','Wallsend, Tyne and Wear',        2),
      h('pk',   'peak_year',      'Career peak',  '1985 – 2000',                     2),
      h('band', 'characteristic', 'Former band',  'Fronted a famous rock trio',      3),
      h('s1',   'song',           'Hit song',     '"If You Love Somebody Set Them Free" (1985)', 3),
      h('s2',   'song',           'Hit song',     '"Fragile" (1987)',                3),
      h('s3',   'song',           'Hit song',     '"Shape of My Heart" (1993)',      3),
      h('s4',   'song',           'Hit song',     '"Desert Rose" (1999)',            3),
      h('alb',  'album',          'Iconic album', '"...Nothing Like the Sun" (1987)', 4),
      h('sig',  'song',           'Signature',    '"Fields of Gold" (1993)',         5),
    ],
  },

  'rod-stewart': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & pop singer',               1),
      h('f1',   'characteristic', 'Known for',    'Distinctive raspy voice',         1),
      h('bd',   'birth_date',     'Date of birth','January 10, 1945',                2),
      h('bp',   'birth_place',    'Place of birth','Highgate, London',               2),
      h('pk',   'peak_year',      'Career peak',  '1971 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"Maggie May" (1971)',             3),
      h('s2',   'song',           'Hit song',     '"Sailing" (1975)',                3),
      h('s3',   'song',           'Hit song',     '"I Don\'t Want to Talk About It" (1977)', 3),
      h('s4',   'song',           'Hit song',     '"Baby Jane" (1983)',              3),
      h('s5',   'song',           'Hit song',     '"Rhythm of My Heart" (1991)',     4),
      h('s6',   'song',           'Hit song',     '"Have I Told You Lately" (1993)', 4),
      h('sig',  'song',           'Signature',    '"Da Ya Think I\'m Sexy?" (1978)', 5),
    ],
  },

  'eric-clapton': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & blues guitarist',          1),
      h('f1',   'characteristic', 'Known as',     'Nicknamed "Slowhand"',            1),
      h('bd',   'birth_date',     'Date of birth','March 30, 1945',                  2),
      h('bp',   'birth_place',    'Place of birth','Ripley, Surrey',                 2),
      h('pk',   'peak_year',      'Career peak',  '1970 – 1996',                     2),
      h('band', 'characteristic', 'Former bands', 'Played in Cream & The Yardbirds', 3),
      h('s1',   'song',           'Hit song',     '"Layla" (1970)',                  3),
      h('s2',   'song',           'Hit song',     '"I Shot the Sheriff" (1974)',     3),
      h('s3',   'song',           'Hit song',     '"Cocaine" (1977)',                3),
      h('s4',   'song',           'Hit song',     '"Change the World" (1996)',       3),
      h('sig',  'song',           'Signature',    '"Wonderful Tonight" (1977)',      5),
    ],
  },

  'tina-turner': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & soul singer',              1),
      h('f1',   'characteristic', 'Known as',     '"Queen of Rock and Roll"',        1),
      h('bd',   'birth_date',     'Date of birth','November 26, 1939',               2),
      h('bp',   'birth_place',    'Place of birth','Nutbush, Tennessee',             2),
      h('pk',   'peak_year',      'Career peak',  '1984 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"Nutbush City Limits" (1973)',    3),
      h('s2',   'song',           'Hit song',     '"Let\'s Stay Together" (1983)',   3),
      h('s3',   'song',           'Hit song',     '"Private Dancer" (1984)',         3),
      h('s4',   'song',           'Hit song',     '"We Don\'t Need Another Hero" (1985)', 3),
      h('alb',  'album',          'Iconic album', '"Private Dancer" (1984)',         4),
      h('s5',   'song',           'Hit song',     '"The Best" (1989)',               4),
      h('sig',  'song',           'Signature',    '"What\'s Love Got to Do with It" (1984)', 5),
    ],
  },

  'lionel-richie': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & pop singer',               1),
      h('f1',   'characteristic', 'Early career', 'Rose to fame with the Commodores', 1),
      h('bd',   'birth_date',     'Date of birth','June 20, 1949',                   2),
      h('bp',   'birth_place',    'Place of birth','Tuskegee, Alabama',              2),
      h('pk',   'peak_year',      'Career peak',  '1981 – 1986',                     2),
      h('s1',   'song',           'Hit song',     '"Endless Love" (1981)',           3),
      h('s2',   'song',           'Hit song',     '"Truly" (1982)',                  3),
      h('s3',   'song',           'Hit song',     '"Hello" (1984)',                  3),
      h('s4',   'song',           'Hit song',     '"Say You, Say Me" (1985)',        3),
      h('s5',   'song',           'Hit song',     '"Dancing on the Ceiling" (1986)', 4),
      h('wa',   'characteristic', 'Songwriting',  'Co-wrote "We Are the World" (1985)', 4),
      h('sig',  'song',           'Signature',    '"All Night Long (All Night)" (1983)', 5),
    ],
  },

  'ed-sheeran': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Fun fact',     'Albums named with math symbols',  1),
      h('bd',   'birth_date',     'Date of birth','February 17, 1991',               2),
      h('bp',   'birth_place',    'Place of birth','Halifax, West Yorkshire',        2),
      h('pk',   'peak_year',      'Career peak',  '2011 – present',                  2),
      h('s1',   'song',           'Hit song',     '"The A Team" (2011)',             3),
      h('s2',   'song',           'Hit song',     '"Thinking Out Loud" (2014)',      3),
      h('s3',   'song',           'Hit song',     '"Photograph" (2014)',             3),
      h('s4',   'song',           'Hit song',     '"Castle on the Hill" (2017)',     3),
      h('s5',   'song',           'Hit song',     '"Perfect" (2017)',                4),
      h('s6',   'song',           'Hit song',     '"Bad Habits" (2021)',             4),
      h('sig',  'song',           'Signature',    '"Shape of You" (2017)',           5),
    ],
  },

  'dua-lipa': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Disco-pop revival sound',         1),
      h('bd',   'birth_date',     'Date of birth','August 22, 1995',                 2),
      h('bp',   'birth_place',    'Place of birth','London',                         2),
      h('pk',   'peak_year',      'Career peak',  '2017 – present',                  2),
      h('s1',   'song',           'Hit song',     '"New Rules" (2017)',              3),
      h('s2',   'song',           'Hit song',     '"IDGAF" (2018)',                  3),
      h('s3',   'song',           'Hit song',     '"One Kiss" (2018)',               3),
      h('s4',   'song',           'Hit song',     '"Physical" (2020)',               3),
      h('s5',   'song',           'Hit song',     '"Levitating" (2020)',             4),
      h('alb',  'album',          'Iconic album', '"Future Nostalgia" (2020)',       4),
      h('sig',  'song',           'Signature',    '"Don\'t Start Now" (2019)',       5),
    ],
  },

  'bruno-mars': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & funk singer',               1),
      h('f1',   'characteristic', 'Real name',    'Born Peter Gene Hernandez',       1),
      h('bd',   'birth_date',     'Date of birth','October 8, 1985',                 2),
      h('bp',   'birth_place',    'Place of birth','Honolulu, Hawaii',               2),
      h('pk',   'peak_year',      'Career peak',  '2010 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Just the Way You Are" (2010)',   3),
      h('s2',   'song',           'Hit song',     '"Grenade" (2010)',                3),
      h('s3',   'song',           'Hit song',     '"Locked Out of Heaven" (2012)',   3),
      h('s4',   'song',           'Hit song',     '"When I Was Your Man" (2012)',    3),
      h('s5',   'song',           'Hit song',     '"That\'s What I Like" (2016)',    4),
      h('s6',   'song',           'Hit song',     '"24K Magic" (2016)',              4),
      h('sig',  'song',           'Signature',    '"Uptown Funk" (2014)',            5),
    ],
  },

  'katy-perry': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Real name',    'Born Katheryn Hudson',            1),
      h('bd',   'birth_date',     'Date of birth','October 25, 1984',                2),
      h('bp',   'birth_place',    'Place of birth','Santa Barbara, California',      2),
      h('pk',   'peak_year',      'Career peak',  '2008 – 2017',                     2),
      h('s1',   'song',           'Hit song',     '"I Kissed a Girl" (2008)',        3),
      h('s2',   'song',           'Hit song',     '"Hot n Cold" (2008)',             3),
      h('s3',   'song',           'Hit song',     '"California Gurls" (2010)',       3),
      h('s4',   'song',           'Hit song',     '"Firework" (2010)',               3),
      h('s5',   'song',           'Hit song',     '"Roar" (2013)',                   4),
      h('s6',   'song',           'Hit song',     '"Dark Horse" (2013)',             4),
      h('alb',  'album',          'Iconic album', '"Teenage Dream" album (2010)',    4),
      h('sig',  'song',           'Signature',    '"Teenage Dream" (2010)',          5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 2 (soul/Motown + classic rock, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'stevie-wonder': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer & multi-instrumentalist', 1),
      h('f1',   'characteristic', 'Fun fact',     'Motown child prodigy',            1),
      h('bd',   'birth_date',     'Date of birth','May 13, 1950',                    2),
      h('bp',   'birth_place',    'Place of birth','Saginaw, Michigan',              2),
      h('pk',   'peak_year',      'Career peak',  '1972 – 1984',                     2),
      h('inst', 'characteristic', 'Instrument',   'Famous for his harmonica',        3),
      h('s1',   'song',           'Hit song',     '"Superstition" (1972)',           3),
      h('s2',   'song',           'Hit song',     '"Living for the City" (1973)',    3),
      h('s3',   'song',           'Hit song',     '"Sir Duke" (1976)',               3),
      h('s4',   'song',           'Hit song',     '"I Just Called to Say I Love You" (1984)', 3),
      h('alb',  'album',          'Iconic album', '"Songs in the Key of Life" (1976)', 4),
      h('sig',  'song',           'Signature',    '"Isn\'t She Lovely" (1976)',      5),
    ],
  },

  'diana-ross': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & pop singer',               1),
      h('f1',   'characteristic', 'Early career', 'Former lead of The Supremes',     1),
      h('bd',   'birth_date',     'Date of birth','March 26, 1944',                  2),
      h('bp',   'birth_place',    'Place of birth','Detroit, Michigan',              2),
      h('pk',   'peak_year',      'Career peak',  '1970 – 1981',                     2),
      h('s1',   'song',           'Hit song',     '"Ain\'t No Mountain High Enough" (1970)', 3),
      h('s2',   'song',           'Hit song',     '"Touch Me in the Morning" (1973)', 3),
      h('s3',   'song',           'Hit song',     '"Love Hangover" (1976)',          3),
      h('s4',   'song',           'Hit song',     '"Upside Down" (1980)',            3),
      h('s5',   'song',           'Hit song',     '"Endless Love" (1981)',           4),
      h('sig',  'song',           'Signature',    '"I\'m Coming Out" (1980)',        5),
    ],
  },

  'marvin-gaye': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Known as',     '"Prince of Soul"',                1),
      h('bd',   'birth_date',     'Date of birth','April 2, 1939',                   2),
      h('bp',   'birth_place',    'Place of birth','Washington, D.C.',               2),
      h('pk',   'peak_year',      'Career peak',  '1968 – 1982',                     2),
      h('s1',   'song',           'Hit song',     '"I Heard It Through the Grapevine" (1968)', 3),
      h('s2',   'song',           'Hit song',     '"Let\'s Get It On" (1973)',       3),
      h('s3',   'song',           'Hit song',     '"Got to Give It Up" (1977)',      3),
      h('s4',   'song',           'Hit song',     '"Sexual Healing" (1982)',         3),
      h('alb',  'album',          'Iconic album', '"What\'s Going On" album (1971)', 4),
      h('sig',  'song',           'Signature',    '"What\'s Going On" (1971)',       5),
    ],
  },

  'aretha-franklin': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Known as',     '"Queen of Soul"',                 1),
      h('bd',   'birth_date',     'Date of birth','March 25, 1942',                  2),
      h('bp',   'birth_place',    'Place of birth','Memphis, Tennessee',             2),
      h('pk',   'peak_year',      'Career peak',  '1967 – 1985',                     2),
      h('s1',   'song',           'Hit song',     '"(You Make Me Feel Like) A Natural Woman" (1967)', 3),
      h('s2',   'song',           'Hit song',     '"Chain of Fools" (1967)',         3),
      h('s3',   'song',           'Hit song',     '"Think" (1968)',                  3),
      h('s4',   'song',           'Hit song',     '"I Say a Little Prayer" (1968)',  3),
      h('s5',   'song',           'Hit song',     '"Freeway of Love" (1985)',        4),
      h('sig',  'song',           'Signature',    '"Respect" (1967)',                5),
    ],
  },

  'ray-charles': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & R&B pianist',              1),
      h('f1',   'characteristic', 'Known as',     '"The Genius of Soul"',            1),
      h('bd',   'birth_date',     'Date of birth','September 23, 1930',              2),
      h('bp',   'birth_place',    'Place of birth','Albany, Georgia',                2),
      h('pk',   'peak_year',      'Career peak',  '1954 – 1966',                     2),
      h('s1',   'song',           'Hit song',     '"I Got a Woman" (1954)',          3),
      h('s2',   'song',           'Hit song',     '"What\'d I Say" (1959)',          3),
      h('s3',   'song',           'Hit song',     '"Hit the Road Jack" (1961)',      3),
      h('s4',   'song',           'Hit song',     '"I Can\'t Stop Loving You" (1962)', 3),
      h('inst', 'characteristic', 'Instrument',   'Blind since childhood; played piano', 4),
      h('sig',  'song',           'Signature',    '"Georgia on My Mind" (1960)',     5),
    ],
  },

  'james-brown': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Funk & soul singer',              1),
      h('f1',   'characteristic', 'Known as',     '"Godfather of Soul"',             1),
      h('bd',   'birth_date',     'Date of birth','May 3, 1933',                     2),
      h('bp',   'birth_place',    'Place of birth','Barnwell, South Carolina',       2),
      h('pk',   'peak_year',      'Career peak',  '1965 – 1974',                     2),
      h('s1',   'song',           'Hit song',     '"Papa\'s Got a Brand New Bag" (1965)', 3),
      h('s2',   'song',           'Hit song',     '"It\'s a Man\'s Man\'s Man\'s World" (1966)', 3),
      h('s3',   'song',           'Hit song',     '"Say It Loud" (1968)',            3),
      h('s4',   'song',           'Hit song',     '"Get Up (Sex Machine)" (1970)',   3),
      h('s5',   'song',           'Hit song',     '"Living in America" (1985)',      4),
      h('sig',  'song',           'Signature',    '"I Got You (I Feel Good)" (1965)', 5),
    ],
  },

  'otis-redding': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Fun fact',     'Star of the Stax soul label',     1),
      h('bd',   'birth_date',     'Date of birth','September 9, 1941',               2),
      h('bp',   'birth_place',    'Place of birth','Dawson, Georgia',                2),
      h('pk',   'peak_year',      'Career peak',  '1962 – 1968',                     2),
      h('s1',   'song',           'Hit song',     '"These Arms of Mine" (1962)',     3),
      h('s2',   'song',           'Hit song',     '"I\'ve Been Loving You Too Long" (1965)', 3),
      h('s3',   'song',           'Hit song',     '"Respect" (1965)',                3),
      h('s4',   'song',           'Hit song',     '"Try a Little Tenderness" (1966)', 3),
      h('sig',  'song',           'Signature',    '"(Sittin\' On) The Dock of the Bay" (1968)', 5),
    ],
  },

  'sam-cooke': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Known as',     '"King of Soul"',                  1),
      h('bd',   'birth_date',     'Date of birth','January 22, 1931',                2),
      h('bp',   'birth_place',    'Place of birth','Clarksdale, Mississippi',        2),
      h('pk',   'peak_year',      'Career peak',  '1957 – 1964',                     2),
      h('s1',   'song',           'Hit song',     '"You Send Me" (1957)',            3),
      h('s2',   'song',           'Hit song',     '"Wonderful World" (1960)',        3),
      h('s3',   'song',           'Hit song',     '"Chain Gang" (1960)',             3),
      h('s4',   'song',           'Hit song',     '"Cupid" (1961)',                  3),
      h('s5',   'song',           'Hit song',     '"Twistin\' the Night Away" (1962)', 4),
      h('sig',  'song',           'Signature',    '"A Change Is Gonna Come" (1964)', 5),
    ],
  },

  'cher': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer & actress',            1),
      h('f1',   'characteristic', 'Known as',     '"Goddess of Pop"',                1),
      h('bd',   'birth_date',     'Date of birth','May 20, 1946',                    2),
      h('bp',   'birth_place',    'Place of birth','El Centro, California',          2),
      h('pk',   'peak_year',      'Career peak',  '1965 – 1999',                     2),
      h('s1',   'song',           'Hit song',     '"Bang Bang" (1966)',              3),
      h('s2',   'song',           'Hit song',     '"Gypsys, Tramps & Thieves" (1971)', 3),
      h('s3',   'song',           'Hit song',     '"Half-Breed" (1973)',             3),
      h('s4',   'song',           'Hit song',     '"If I Could Turn Back Time" (1989)', 3),
      h('film', 'movie',          'Oscar film',   'Won an Oscar for "Moonstruck" (1987)', 4),
      h('duo',  'song',           'Early duo hit','"I Got You Babe" (1965)',         4),
      h('sig',  'song',           'Signature',    '"Believe" (1998)',                5),
    ],
  },

  'cyndi-lauper': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Flamboyant colourful 80s style',  1),
      h('bd',   'birth_date',     'Date of birth','June 22, 1953',                   2),
      h('bp',   'birth_place',    'Place of birth','Brooklyn, New York',             2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1989',                     2),
      h('s1',   'song',           'Hit song',     '"Time After Time" (1984)',        3),
      h('s2',   'song',           'Hit song',     '"She Bop" (1984)',                3),
      h('s3',   'song',           'Hit song',     '"All Through the Night" (1984)',  3),
      h('s4',   'song',           'Hit song',     '"True Colors" (1986)',            3),
      h('alb',  'album',          'Debut album',  '"She\'s So Unusual" (1983)',      4),
      h('sig',  'song',           'Signature',    '"Girls Just Want to Have Fun" (1983)', 5),
    ],
  },

  'mariah-carey': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Known for',    'Five-octave whistle register',    1),
      h('bd',   'birth_date',     'Date of birth','March 27, 1969',                  2),
      h('bp',   'birth_place',    'Place of birth','Huntington, New York',           2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 2005',                     2),
      h('s1',   'song',           'Hit song',     '"Vision of Love" (1990)',         3),
      h('s2',   'song',           'Hit song',     '"Hero" (1993)',                   3),
      h('s3',   'song',           'Hit song',     '"Fantasy" (1995)',                3),
      h('s4',   'song',           'Hit song',     '"Always Be My Baby" (1996)',      3),
      h('s5',   'song',           'Hit song',     '"We Belong Together" (2005)',     4),
      h('sig',  'song',           'Signature',    '"All I Want for Christmas Is You" (1994)', 5),
    ],
  },

  'celine-dion': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Powerhouse ballad vocals',        1),
      h('bd',   'birth_date',     'Date of birth','March 30, 1968',                  2),
      h('bp',   'birth_place',    'Place of birth','Charlemagne, Quebec',            2),
      h('pk',   'peak_year',      'Career peak',  '1993 – 2002',                     2),
      h('s1',   'song',           'Hit song',     '"The Power of Love" (1993)',      3),
      h('s2',   'song',           'Hit song',     '"Think Twice" (1994)',            3),
      h('s3',   'song',           'Hit song',     '"Because You Loved Me" (1996)',   3),
      h('s4',   'song',           'Hit song',     '"That\'s the Way It Is" (1999)',  3),
      h('film', 'characteristic', 'Film theme',   'Sang the "Titanic" theme (1997)', 4),
      h('sig',  'song',           'Signature',    '"My Heart Will Go On" (1997)',    5),
    ],
  },

  'shania-twain': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Country-pop singer',              1),
      h('f1',   'characteristic', 'Known as',     '"Queen of Country Pop"',          1),
      h('bd',   'birth_date',     'Date of birth','August 28, 1965',                 2),
      h('bp',   'birth_place',    'Place of birth','Windsor, Ontario',               2),
      h('pk',   'peak_year',      'Career peak',  '1995 – 2002',                     2),
      h('s1',   'song',           'Hit song',     '"Any Man of Mine" (1995)',        3),
      h('s2',   'song',           'Hit song',     '"You\'re Still the One" (1998)',  3),
      h('s3',   'song',           'Hit song',     '"That Don\'t Impress Me Much" (1998)', 3),
      h('alb',  'album',          'Iconic album', '"Come On Over" (1997)',           4),
      h('sig',  'song',           'Signature',    '"Man! I Feel Like a Woman!" (1999)', 5),
    ],
  },

  'christina-aguilera': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Known for',    'Powerful four-octave voice',      1),
      h('bd',   'birth_date',     'Date of birth','December 18, 1980',               2),
      h('bp',   'birth_place',    'Place of birth','Staten Island, New York',        2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2006',                     2),
      h('s1',   'song',           'Hit song',     '"Genie in a Bottle" (1999)',      3),
      h('s2',   'song',           'Hit song',     '"What a Girl Wants" (1999)',      3),
      h('s3',   'song',           'Hit song',     '"Lady Marmalade" (2001)',         3),
      h('s4',   'song',           'Hit song',     '"Ain\'t No Other Man" (2006)',    3),
      h('alb',  'album',          'Iconic album', '"Stripped" (2002)',               4),
      h('sig',  'song',           'Signature',    '"Beautiful" (2002)',              5),
    ],
  },

  'pink': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & rock singer',               1),
      h('f1',   'characteristic', 'Known for',    'Aerial acrobatic live shows',     1),
      h('bd',   'birth_date',     'Date of birth','September 8, 1979',               2),
      h('bp',   'birth_place',    'Place of birth','Doylestown, Pennsylvania',       2),
      h('pk',   'peak_year',      'Career peak',  '2001 – 2013',                     2),
      h('s1',   'song',           'Hit song',     '"Get the Party Started" (2001)',  3),
      h('s2',   'song',           'Hit song',     '"Just Like a Pill" (2002)',       3),
      h('s3',   'song',           'Hit song',     '"Family Portrait" (2002)',        3),
      h('s4',   'song',           'Hit song',     '"Raise Your Glass" (2010)',       3),
      h('s5',   'song',           'Hit song',     '"Just Give Me a Reason" (2013)',  4),
      h('sig',  'song',           'Signature',    '"So What" (2008)',                5),
    ],
  },

  'kylie-minogue': {
    categoryLabel: 'Musikartist',
    nationality: 'australia',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Rose to fame on soap "Neighbours"', 1),
      h('bd',   'birth_date',     'Date of birth','May 28, 1968',                    2),
      h('bp',   'birth_place',    'Place of birth','Melbourne, Victoria',            2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 2003',                     2),
      h('s1',   'song',           'Hit song',     '"I Should Be So Lucky" (1988)',   3),
      h('s2',   'song',           'Hit song',     '"The Loco-Motion" (1988)',        3),
      h('s3',   'song',           'Hit song',     '"Spinning Around" (2000)',        3),
      h('s4',   'song',           'Hit song',     '"Love at First Sight" (2002)',    3),
      h('kn',   'characteristic', 'Known as',     '"Princess of Pop"',               4),
      h('sig',  'song',           'Signature',    '"Can\'t Get You Out of My Head" (2001)', 5),
    ],
  },

  'blondie': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'New-wave band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Punk-era CBGB scene pioneers',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 1974',        2),
      h('mem',  'lead_singer',    'Frontwoman',   'Fronted by Debbie Harry',         2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1982',                     2),
      h('s1',   'song',           'Hit song',     '"Heart of Glass" (1979)',         3),
      h('s2',   'song',           'Hit song',     '"One Way or Another" (1979)',     3),
      h('s3',   'song',           'Hit song',     '"Atomic" (1980)',                 3),
      h('s4',   'song',           'Hit song',     '"The Tide Is High" (1980)',       3),
      h('s5',   'song',           'Hit song',     '"Rapture" (1981)',                4),
      h('sig',  'song',           'Signature',    '"Call Me" (1980)',                5),
    ],
  },

  'eurythmics': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Synth-pop duo',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Cropped-hair, androgynous look',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1980',          2),
      h('mem',  'band_member',    'Members',      'Annie Lennox & Dave Stewart',     2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1989',                     2),
      h('s1',   'song',           'Hit song',     '"Who\'s That Girl?" (1983)',      3),
      h('s2',   'song',           'Hit song',     '"Here Comes the Rain Again" (1984)', 3),
      h('s3',   'song',           'Hit song',     '"There Must Be an Angel" (1985)', 3),
      h('s4',   'song',           'Hit song',     '"Would I Lie to You?" (1985)',    3),
      h('sig',  'song',           'Signature',    '"Sweet Dreams (Are Made of This)" (1983)', 5),
    ],
  },

  'pet-shop-boys': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Synth-pop duo',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Understated electronic pop'   ,    1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1981',          2),
      h('mem',  'band_member',    'Members',      'Neil Tennant & Chris Lowe',       2),
      h('pk',   'peak_year',      'Career peak',  '1985 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"It\'s a Sin" (1987)',            3),
      h('s2',   'song',           'Hit song',     '"Always on My Mind" (1987)',      3),
      h('s3',   'song',           'Hit song',     '"Heart" (1988)',                  3),
      h('s4',   'song',           'Hit song',     '"Being Boring" (1990)',           3),
      h('s5',   'song',           'Hit song',     '"It\'s Alright" (1989)',          4),
      h('s6',   'song',           'Hit song',     '"Go West" (1993)',                4),
      h('sig',  'song',           'Signature',    '"West End Girls" (1985)',         5),
    ],
  },

  'red-hot-chili-peppers': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Funk-rock band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'High-energy funk-punk fusion',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1983',     2),
      h('mem',  'band_member',    'Members',      'Anthony Kiedis & Flea',           2),
      h('pk',   'peak_year',      'Career peak',  '1991 – 2006',                     2),
      h('s1',   'song',           'Hit song',     '"Give It Away" (1991)',           3),
      h('s2',   'song',           'Hit song',     '"Scar Tissue" (1999)',            3),
      h('s3',   'song',           'Hit song',     '"Otherside" (1999)',              3),
      h('s4',   'song',           'Hit song',     '"By the Way" (2002)',             3),
      h('s5',   'song',           'Hit song',     '"Dani California" (2006)',        4),
      h('alb',  'album',          'Iconic album', '"Californication" (1999)',        4),
      h('sig',  'song',           'Signature',    '"Under the Bridge" (1991)',       5),
    ],
  },

  'the-doors': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Poetic, psychedelic 60s rock',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1965',     2),
      h('mem',  'band_member',    'Members',      'Jim Morrison & Ray Manzarek',     2),
      h('pk',   'peak_year',      'Career peak',  '1967 – 1971',                     2),
      h('s1',   'song',           'Hit song',     '"Break On Through" (1967)',       3),
      h('s2',   'song',           'Hit song',     '"People Are Strange" (1967)',     3),
      h('s3',   'song',           'Hit song',     '"Hello, I Love You" (1968)',      3),
      h('s4',   'song',           'Hit song',     '"Riders on the Storm" (1971)',    3),
      h('s5',   'song',           'Hit song',     '"L.A. Woman" (1971)',             4),
      h('sig',  'song',           'Signature',    '"Light My Fire" (1967)',          5),
    ],
  },

  'the-killers': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Anthemic indie-rock sound',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in Las Vegas, 2001',       2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Brandon Flowers',      2),
      h('pk',   'peak_year',      'Career peak',  '2004 – 2012',                     2),
      h('s1',   'song',           'Hit song',     '"Somebody Told Me" (2004)',       3),
      h('s2',   'song',           'Hit song',     '"When You Were Young" (2006)',    3),
      h('s3',   'song',           'Hit song',     '"Human" (2008)',                  3),
      h('s4',   'song',           'Hit song',     '"The Man" (2017)',                3),
      h('alb',  'album',          'Debut album',  '"Hot Fuss" (2004)',               4),
      h('sig',  'song',           'Signature',    '"Mr. Brightside" (2004)',         5),
    ],
  },

  'the-cranberries': {
    categoryLabel: 'Band',
    nationality: 'ireland',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Known for',    'Distinctive lilting lead vocals', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Limerick, 1989',        2),
      h('mem',  'lead_singer',    'Frontwoman',   'Fronted by Dolores O\'Riordan',   2),
      h('pk',   'peak_year',      'Career peak',  '1993 – 1996',                     2),
      h('s1',   'song',           'Hit song',     '"Linger" (1993)',                 3),
      h('s2',   'song',           'Hit song',     '"Dreams" (1993)',                 3),
      h('s3',   'song',           'Hit song',     '"Ode to My Family" (1994)',       3),
      h('alb',  'album',          'Iconic album', '"No Need to Argue" (1994)',       4),
      h('sig',  'song',           'Signature',    '"Zombie" (1994)',                 5),
    ],
  },

  'scorpions': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Known for',    'Whistled intro on a huge ballad', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Hanover, 1965',         2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Klaus Meine',          2),
      h('pk',   'peak_year',      'Career peak',  '1984 – 1991',                     2),
      h('s1',   'song',           'Hit song',     '"Rock You Like a Hurricane" (1984)', 3),
      h('s2',   'song',           'Hit song',     '"Still Loving You" (1984)',       3),
      h('s3',   'song',           'Hit song',     '"Send Me an Angel" (1990)',       3),
      h('alb',  'album',          'Iconic album', '"Crazy World" (1990)',            4),
      h('sig',  'song',           'Signature',    '"Wind of Change" (1990)',         5),
    ],
  },

  'black-sabbath': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Heavy metal band',                1),
      h('f1',   'characteristic', 'Fun fact',     'Pioneers of heavy metal',         1),
      h('cy',   'creation_year',  'Formed',       'Formed in Birmingham, 1968',      2),
      h('mem',  'band_member',    'Members',      'Ozzy Osbourne & Tony Iommi',      2),
      h('pk',   'peak_year',      'Career peak',  '1970 – 1975',                     2),
      h('s1',   'song',           'Hit song',     '"Iron Man" (1970)',               3),
      h('s2',   'song',           'Hit song',     '"War Pigs" (1970)',               3),
      h('s3',   'song',           'Hit song',     '"Children of the Grave" (1971)',  3),
      h('s4',   'song',           'Hit song',     '"Sweet Leaf" (1971)',             3),
      h('alb',  'album',          'Iconic album', '"Paranoid" album (1970)',         4),
      h('sig',  'song',           'Signature',    '"Paranoid" (1970)',               5),
    ],
  },

  'kiss': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Known for',    'Black-and-white face paint',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 1973',        2),
      h('mem',  'band_member',    'Members',      'Gene Simmons & Paul Stanley',     2),
      h('pk',   'peak_year',      'Career peak',  '1975 – 1979',                     2),
      h('show', 'characteristic', 'Live shows',   'Fire-breathing, pyro-heavy shows', 3),
      h('s1',   'song',           'Hit song',     '"Rock and Roll All Nite" (1975)', 3),
      h('s2',   'song',           'Hit song',     '"Detroit Rock City" (1976)',      3),
      h('s3',   'song',           'Hit song',     '"Beth" (1976)',                   3),
      h('sig',  'song',           'Signature',    '"I Was Made for Lovin\' You" (1979)', 5),
    ],
  },

  'journey': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Soaring melodic arena rock',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in San Francisco, 1973',   2),
      h('mem',  'lead_singer',    'Frontman',     'Famed for Steve Perry\'s vocals', 2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Wheel in the Sky" (1978)',       3),
      h('s2',   'song',           'Hit song',     '"Open Arms" (1981)',              3),
      h('s3',   'song',           'Hit song',     '"Separate Ways" (1983)',          3),
      h('s4',   'song',           'Hit song',     '"Faithfully" (1983)',             3),
      h('alb',  'album',          'Iconic album', '"Escape" (1981)',                 4),
      h('sig',  'song',           'Signature',    '"Don\'t Stop Believin\'" (1981)', 5),
    ],
  },

  'foreigner': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Transatlantic arena-rock group',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 1976',        2),
      h('mem',  'band_member',    'Members',      'Mick Jones & Lou Gramm',          2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1984',                     2),
      h('s1',   'song',           'Hit song',     '"Feels Like the First Time" (1977)', 3),
      h('s2',   'song',           'Hit song',     '"Cold as Ice" (1977)',            3),
      h('s3',   'song',           'Hit song',     '"Hot Blooded" (1978)',            3),
      h('s4',   'song',           'Hit song',     '"Double Vision" (1978)',          3),
      h('s5',   'song',           'Hit song',     '"Urgent" (1981)',                 4),
      h('s6',   'song',           'Hit song',     '"Waiting for a Girl Like You" (1981)', 4),
      h('sig',  'song',           'Signature',    '"I Want to Know What Love Is" (1984)', 5),
    ],
  },

  'toto': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Slick soft-rock studio sound',    1),
      h('mem',  'band_member',    'Members',      'David Paich & Steve Lukather',    2),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1977',     2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Hold the Line" (1978)',          3),
      h('s2',   'song',           'Hit song',     '"Georgy Porgy" (1978)',           3),
      h('s3',   'song',           'Hit song',     '"Rosanna" (1982)',                3),
      h('s4',   'song',           'Hit song',     '"I Won\'t Hold You Back" (1982)', 3),
      h('mer',  'merit',          'Achievement',  'Won Album of the Year Grammy (1983)', 4),
      h('sig',  'song',           'Signature',    '"Africa" (1982)',                 5),
    ],
  },

  'survivor': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Known for Rocky-movie anthems',   1),
      h('mem',  'band_member',    'Members',      'Frankie Sullivan & Jim Peterik',  2),
      h('cy',   'creation_year',  'Formed',       'Formed in Chicago, 1978',         2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1986',                     2),
      h('s1',   'song',           'Hit song',     '"I Can\'t Hold Back" (1984)',     3),
      h('s2',   'song',           'Hit song',     '"High on You" (1984)',            3),
      h('s3',   'song',           'Hit song',     '"Burning Heart" (1985)',          3),
      h('s4',   'song',           'Hit song',     '"The Search Is Over" (1985)',     3),
      h('s5',   'song',           'Hit song',     '"Is This Love" (1986)',           3),
      h('film', 'characteristic', 'Film link',    'Anthem for "Rocky III" (1982)',   4),
      h('sig',  'song',           'Signature',    '"Eye of the Tiger" (1982)',       5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 3 (rock/pop/hip-hop + Nordic pop, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'billy-idol': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer',                     1),
      h('f1',   'characteristic', 'Known for',    'Spiky blond hair and a sneer',    1),
      h('bd',   'birth_date',     'Date of birth','November 30, 1955',               2),
      h('bp',   'birth_place',    'Place of birth','Stanmore, London',               2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"White Wedding" (1982)',          3),
      h('s2',   'song',           'Hit song',     '"Eyes Without a Face" (1984)',    3),
      h('s3',   'song',           'Hit song',     '"Flesh for Fantasy" (1984)',      3),
      h('s4',   'song',           'Hit song',     '"Mony Mony" (1987)',              3),
      h('sig',  'song',           'Signature',    '"Rebel Yell" (1983)',             5),
    ],
  },

  'iggy-pop': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Punk rock singer',                1),
      h('f1',   'characteristic', 'Known as',     '"The Godfather of Punk"',         1),
      h('bd',   'birth_date',     'Date of birth','April 21, 1947',                  2),
      h('bp',   'birth_place',    'Place of birth','Muskegon, Michigan',             2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1990',                     2),
      h('band', 'characteristic', 'Former band',  'Front of proto-punk The Stooges', 3),
      h('s1',   'song',           'Hit song',     '"The Passenger" (1977)',          3),
      h('s2',   'song',           'Hit song',     '"Real Wild Child" (1986)',        3),
      h('s3',   'song',           'Hit song',     '"Candy" (1990)',                  3),
      h('show', 'characteristic', 'Known for',    'Wild, shirtless stage-diving',    4),
      h('sig',  'song',           'Signature',    '"Lust for Life" (1977)',          5),
    ],
  },

  'kate-bush': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Art-pop singer-songwriter',       1),
      h('f1',   'characteristic', 'Known for',    'Theatrical voice and dance',      1),
      h('bd',   'birth_date',     'Date of birth','July 30, 1958',                   2),
      h('bp',   'birth_place',    'Place of birth','Bexleyheath, London',            2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1985',                     2),
      h('s1',   'song',           'Hit song',     '"The Man with the Child in His Eyes" (1978)', 3),
      h('s2',   'song',           'Hit song',     '"Babooshka" (1980)',              3),
      h('s3',   'song',           'Hit song',     '"Running Up That Hill" (1985)',   3),
      h('alb',  'album',          'Iconic album', '"Hounds of Love" album (1985)',   4),
      h('sig',  'song',           'Signature',    '"Wuthering Heights" (1978)',      5),
    ],
  },

  'seal': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & pop singer',               1),
      h('f1',   'characteristic', 'Fun fact',     'Smooth, soulful vocals',          1),
      h('bd',   'birth_date',     'Date of birth','February 19, 1963',               2),
      h('bp',   'birth_place',    'Place of birth','Paddington, London',             2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 1998',                     2),
      h('s1',   'song',           'Hit song',     '"Killer" (1990)',                 3),
      h('s2',   'song',           'Hit song',     '"Crazy" (1990)',                  3),
      h('s3',   'song',           'Hit song',     '"Prayer for the Dying" (1994)',   3),
      h('film', 'characteristic', 'Film link',    'Featured in "Batman Forever" (1995)', 4),
      h('sig',  'song',           'Signature',    '"Kiss from a Rose" (1994)',       5),
    ],
  },

  'sinead-oconnor': {
    categoryLabel: 'Musikartist',
    nationality: 'ireland',
    hints: [
      h('prof', 'profession',     'Profession',   'Alternative singer-songwriter',   1),
      h('f1',   'characteristic', 'Known for',    'Her shaved head and raw voice',   1),
      h('bd',   'birth_date',     'Date of birth','December 8, 1966',                2),
      h('bp',   'birth_place',    'Place of birth','Dublin',                         2),
      h('pk',   'peak_year',      'Career peak',  '1987 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Troy" (1987)',                   3),
      h('s2',   'song',           'Hit song',     '"Mandinka" (1987)',               3),
      h('s3',   'song',           'Hit song',     '"The Emperor\'s New Clothes" (1990)', 3),
      h('alb1', 'album',          'Debut album',  '"The Lion and the Cobra" (1987)', 4),
      h('alb2', 'album',          'Iconic album', '"I Do Not Want What I Haven\'t Got" (1990)', 4),
      h('sig',  'song',           'Signature',    '"Nothing Compares 2 U" (1990)',   5),
    ],
  },

  'lenny-kravitz': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & funk singer',              1),
      h('f1',   'characteristic', 'Fun fact',     'Retro rock multi-instrumentalist', 1),
      h('bd',   'birth_date',     'Date of birth','May 26, 1964',                    2),
      h('bp',   'birth_place',    'Place of birth','New York',                       2),
      h('pk',   'peak_year',      'Career peak',  '1993 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Let Love Rule" (1989)',          3),
      h('s2',   'song',           'Hit song',     '"It Ain\'t Over \'til It\'s Over" (1991)', 3),
      h('s3',   'song',           'Hit song',     '"Believe" (1993)',                3),
      h('s4',   'song',           'Hit song',     '"Fly Away" (1998)',               3),
      h('s5',   'song',           'Hit song',     '"Again" (2000)',                  3),
      h('sig',  'song',           'Signature',    '"Are You Gonna Go My Way" (1993)', 5),
    ],
  },

  'no-doubt': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Ska-rock band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Blend of ska, punk and pop',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Anaheim, 1986',         2),
      h('mem',  'lead_singer',    'Frontwoman',   'Fronted by Gwen Stefani',         2),
      h('pk',   'peak_year',      'Career peak',  '1995 – 2004',                     2),
      h('s1',   'song',           'Hit song',     '"Just a Girl" (1995)',            3),
      h('s2',   'song',           'Hit song',     '"Spiderwebs" (1995)',             3),
      h('s3',   'song',           'Hit song',     '"Hey Baby" (2001)',               3),
      h('s4',   'song',           'Hit song',     '"It\'s My Life" (2003)',          3),
      h('alb',  'album',          'Iconic album', '"Tragic Kingdom" (1995)',         4),
      h('sig',  'song',           'Signature',    '"Don\'t Speak" (1996)',           5),
    ],
  },

  'gloria-gaynor': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Disco singer',                    1),
      h('f1',   'characteristic', 'Fun fact',     'Voice of a disco-era anthem',     1),
      h('bd',   'birth_date',     'Date of birth','September 7, 1949',               2),
      h('bp',   'birth_place',    'Place of birth','Newark, New Jersey',             2),
      h('pk',   'peak_year',      'Career peak',  '1974 – 1979',                     2),
      h('s1',   'song',           'Hit song',     '"Never Can Say Goodbye" (1974)',  3),
      h('s2',   'song',           'Hit song',     '"Reach Out, I\'ll Be There" (1975)', 3),
      h('s3',   'song',           'Hit song',     '"Let Me Know (I Have a Right)" (1979)', 3),
      h('kn',   'characteristic', 'Known as',     'A "Queen of Disco"',              4),
      h('mer',  'merit',          'Achievement',  'Won the first Best Disco Grammy (1980)', 4),
      h('sig',  'song',           'Signature',    '"I Will Survive" (1978)',         5),
    ],
  },

  'donna-summer': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Disco singer',                    1),
      h('f1',   'characteristic', 'Known as',     '"Queen of Disco"',                1),
      h('bd',   'birth_date',     'Date of birth','December 31, 1948',               2),
      h('bp',   'birth_place',    'Place of birth','Boston, Massachusetts',          2),
      h('pk',   'peak_year',      'Career peak',  '1975 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Love to Love You Baby" (1975)',  3),
      h('s2',   'song',           'Hit song',     '"I Feel Love" (1977)',            3),
      h('s3',   'song',           'Hit song',     '"Last Dance" (1978)',             3),
      h('s4',   'song',           'Hit song',     '"Bad Girls" (1979)',              3),
      h('sig',  'song',           'Signature',    '"Hot Stuff" (1979)',              5),
    ],
  },

  'boney-m': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Euro-disco group',                1),
      h('f1',   'characteristic', 'Fun fact',     'Created by producer Frank Farian', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1976',                  2),
      h('pk',   'peak_year',      'Career peak',  '1976 – 1980',                     2),
      h('s1',   'song',           'Hit song',     '"Daddy Cool" (1976)',             3),
      h('s2',   'song',           'Hit song',     '"Sunny" (1976)',                  3),
      h('s3',   'song',           'Hit song',     '"Ma Baker" (1977)',               3),
      h('s4',   'song',           'Hit song',     '"Rivers of Babylon" (1978)',      3),
      h('s5',   'song',           'Hit song',     '"Mary\'s Boy Child" (1978)',      3),
      h('sig',  'song',           'Signature',    '"Rasputin" (1978)',               5),
    ],
  },

  'ace-of-base': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop group',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Reggae-tinged 90s Euro-pop',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Gothenburg, 1990',      2),
      h('mem',  'band_member',    'Members',      'The Berggren siblings & Ekberg',  2),
      h('pk',   'peak_year',      'Career peak',  '1992 – 1996',                     2),
      h('s1',   'song',           'Hit song',     '"All That She Wants" (1992)',     3),
      h('s2',   'song',           'Hit song',     '"Wheel of Fortune" (1992)',       3),
      h('s3',   'song',           'Hit song',     '"Don\'t Turn Around" (1994)',     3),
      h('s4',   'song',           'Hit song',     '"Beautiful Life" (1995)',         3),
      h('sig',  'song',           'Signature',    '"The Sign" (1993)',               5),
    ],
  },

  'aqua': {
    categoryLabel: 'Band',
    nationality: 'denmark',
    hints: [
      h('prof', 'profession',     'Profession',   'Bubblegum pop group',             1),
      h('f1',   'characteristic', 'Fun fact',     'Playful cartoonish Euro-pop',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in Copenhagen, 1989',      2),
      h('mem',  'band_member',    'Members',      'Lene Nystrøm & René Dif',         2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Doctor Jones" (1997)',           3),
      h('s2',   'song',           'Hit song',     '"Turn Back Time" (1998)',         3),
      h('s3',   'song',           'Hit song',     '"My Oh My" (1998)',               3),
      h('s4',   'song',           'Hit song',     '"Cartoon Heroes" (2000)',         3),
      h('sig',  'song',           'Signature',    '"Barbie Girl" (1997)',            5),
    ],
  },

  'spice-girls': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop girl group',                  1),
      h('f1',   'characteristic', 'Slogan',       'Popularised "Girl Power"',        1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1994',          2),
      h('mem',  'member_count',   'Members',      'A five-member girl group',        2),
      h('pk',   'peak_year',      'Career peak',  '1996 – 1998',                     2),
      h('s1',   'song',           'Hit song',     '"Say You\'ll Be There" (1996)',   3),
      h('s2',   'song',           'Hit song',     '"2 Become 1" (1996)',             3),
      h('s3',   'song',           'Hit song',     '"Mama" (1997)',                   3),
      h('s4',   'song',           'Hit song',     '"Viva Forever" (1998)',           3),
      h('s5',   'song',           'Hit song',     '"Goodbye" (1998)',                4),
      h('sig',  'song',           'Signature',    '"Wannabe" (1996)',                5),
    ],
  },

  'backstreet-boys': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop boy band',                    1),
      h('f1',   'characteristic', 'Fun fact',     'Defining 90s boy band',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in Orlando, 1993',         2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2001',                     2),
      h('s1',   'song',           'Hit song',     '"Quit Playing Games" (1996)',     3),
      h('s2',   'song',           'Hit song',     '"As Long as You Love Me" (1997)', 3),
      h('s3',   'song',           'Hit song',     '"Larger than Life" (1999)',       3),
      h('s4',   'song',           'Hit song',     '"Shape of My Heart" (2000)',      3),
      h('alb',  'album',          'Iconic album', '"Millennium" (1999)',             4),
      h('sig',  'song',           'Signature',    '"I Want It That Way" (1999)',     5),
    ],
  },

  'boyz-ii-men': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B vocal group',                 1),
      h('f1',   'characteristic', 'Known for',    'Smooth a cappella harmonies',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in Philadelphia, 1988',    2),
      h('pk',   'peak_year',      'Career peak',  '1992 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Motownphilly" (1991)',           3),
      h('s2',   'song',           'Hit song',     '"End of the Road" (1992)',        3),
      h('s3',   'song',           'Hit song',     '"On Bended Knee" (1994)',         3),
      h('s4',   'song',           'Hit song',     '"Water Runs Dry" (1995)',         3),
      h('s5',   'song',           'Hit song',     '"One Sweet Day" (1995)',          3),
      h('sig',  'song',           'Signature',    '"I\'ll Make Love to You" (1994)', 5),
    ],
  },

  'destinys-child': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B girl group',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Launched Beyoncé to stardom',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in Houston, 1997',         2),
      h('mem',  'band_member',    'Members',      'Beyoncé, Kelly Rowland, Michelle Williams', 2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2004',                     2),
      h('s1',   'song',           'Hit song',     '"Bills, Bills, Bills" (1999)',    3),
      h('s2',   'song',           'Hit song',     '"Jumpin\' Jumpin\'" (2000)',      3),
      h('s3',   'song',           'Hit song',     '"Independent Women" (2000)',      3),
      h('s4',   'song',           'Hit song',     '"Bootylicious" (2001)',           3),
      h('alb',  'album',          'Iconic album', '"Survivor" album (2001)',         4),
      h('sig',  'song',           'Signature',    '"Say My Name" (1999)',            5),
    ],
  },

  'tlc': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B girl group',                  1),
      h('f1',   'characteristic', 'Members',      'T-Boz, Left Eye & Chilli',        1),
      h('cy',   'creation_year',  'Formed',       'Formed in Atlanta, 1990',         2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 1999',                     2),
      h('s1',   'song',           'Hit song',     '"Baby-Baby-Baby" (1992)',         3),
      h('s2',   'song',           'Hit song',     '"Creep" (1994)',                  3),
      h('s3',   'song',           'Hit song',     '"Waterfalls" (1995)',             3),
      h('s4',   'song',           'Hit song',     '"Unpretty" (1999)',               3),
      h('alb',  'album',          'Iconic album', '"CrazySexyCool" (1994)',          4),
      h('sig',  'song',           'Signature',    '"No Scrubs" (1999)',              5),
    ],
  },

  'one-direction': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop boy band',                    1),
      h('f1',   'characteristic', 'Fun fact',     'Formed on "The X Factor"',        1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 2010',          2),
      h('mem',  'band_member',    'Members',      'Includes Harry Styles',           2),
      h('pk',   'peak_year',      'Career peak',  '2011 – 2015',                     2),
      h('s1',   'song',           'Hit song',     '"One Thing" (2012)',              3),
      h('s2',   'song',           'Hit song',     '"Live While We\'re Young" (2012)', 3),
      h('s3',   'song',           'Hit song',     '"Story of My Life" (2013)',       3),
      h('s4',   'song',           'Hit song',     '"Drag Me Down" (2015)',           3),
      h('sig',  'song',           'Signature',    '"What Makes You Beautiful" (2011)', 5),
    ],
  },

  'the-black-eyed-peas': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Hip-hop & pop group',             1),
      h('f1',   'characteristic', 'Members',      'Led by will.i.am',                1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1995',     2),
      h('pk',   'peak_year',      'Career peak',  '2003 – 2010',                     2),
      h('s1',   'song',           'Hit song',     '"Where Is the Love?" (2003)',     3),
      h('s2',   'song',           'Hit song',     '"Let\'s Get It Started" (2004)',  3),
      h('s3',   'song',           'Hit song',     '"My Humps" (2005)',               3),
      h('s4',   'song',           'Hit song',     '"Boom Boom Pow" (2009)',          3),
      h('alb',  'album',          'Iconic album', '"The E.N.D." (2009)',             4),
      h('sig',  'song',           'Signature',    '"I Gotta Feeling" (2009)',        5),
    ],
  },

  'maroon-5': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-rock band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Frontman is a "The Voice" coach', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 2001',     2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Adam Levine',          2),
      h('pk',   'peak_year',      'Career peak',  '2004 – 2018',                     2),
      h('s1',   'song',           'Hit song',     '"This Love" (2004)',              3),
      h('s2',   'song',           'Hit song',     '"She Will Be Loved" (2004)',      3),
      h('s3',   'song',           'Hit song',     '"Payphone" (2012)',               3),
      h('s4',   'song',           'Hit song',     '"Girls Like You" (2018)',         3),
      h('alb',  'album',          'Debut album',  '"Songs About Jane" (2002)',       4),
      h('sig',  'song',           'Signature',    '"Moves Like Jagger" (2011)',      5),
    ],
  },

  'blink-182': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-punk band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Juvenile humour and fast hooks',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in San Diego, 1992',       2),
      h('mem',  'band_member',    'Members',      'Mark Hoppus & Tom DeLonge',       2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2004',                     2),
      h('s1',   'song',           'Hit song',     '"What\'s My Age Again?" (1999)',  3),
      h('s2',   'song',           'Hit song',     '"Adam\'s Song" (2000)',           3),
      h('s3',   'song',           'Hit song',     '"First Date" (2001)',             3),
      h('s4',   'song',           'Hit song',     '"I Miss You" (2003)',             3),
      h('alb',  'album',          'Iconic album', '"Enema of the State" (1999)',     4),
      h('sig',  'song',           'Signature',    '"All the Small Things" (1999)',   5),
    ],
  },

  'the-offspring': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Punk rock band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Melodic 90s skate-punk',          1),
      h('cy',   'creation_year',  'Formed',       'Formed in California, 1984',      2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 1999',                     2),
      h('s1',   'song',           'Hit song',     '"Come Out and Play" (1994)',      3),
      h('s2',   'song',           'Hit song',     '"Self Esteem" (1994)',            3),
      h('s3',   'song',           'Hit song',     '"Gone Away" (1997)',              3),
      h('s4',   'song',           'Hit song',     '"The Kids Aren\'t Alright" (1998)', 3),
      h('s5',   'song',           'Hit song',     '"Why Don\'t You Get a Job?" (1999)', 3),
      h('alb',  'album',          'Iconic album', '"Smash" (1994)',                  4),
      h('sig',  'song',           'Signature',    '"Pretty Fly (for a White Guy)" (1998)', 5),
    ],
  },

  'lynyrd-skynyrd': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Southern rock band',              1),
      h('f1',   'characteristic', 'Fun fact',     'Triple-guitar Southern rock',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in Jacksonville, 1964',    2),
      h('mem',  'lead_singer',    'Frontman',     'Original singer Ronnie Van Zant', 2),
      h('pk',   'peak_year',      'Career peak',  '1973 – 1977',                     2),
      h('s1',   'song',           'Hit song',     '"Gimme Three Steps" (1973)',      3),
      h('s2',   'song',           'Hit song',     '"Simple Man" (1973)',             3),
      h('s3',   'song',           'Hit song',     '"Sweet Home Alabama" (1974)',     3),
      h('s4',   'song',           'Hit song',     '"What\'s Your Name" (1977)',      3),
      h('sig',  'song',           'Signature',    '"Free Bird" (1973)',              5),
    ],
  },

  'snoop-dogg': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Fun fact',     'Laid-back West Coast G-funk flow', 1),
      h('bd',   'birth_date',     'Date of birth','October 20, 1971',                2),
      h('bp',   'birth_place',    'Place of birth','Long Beach, California',         2),
      h('pk',   'peak_year',      'Career peak',  '1993 – 2005',                     2),
      h('rn',   'characteristic', 'Real name',    'Born Calvin Broadus',             3),
      h('s1',   'song',           'Hit song',     '"Who Am I (What\'s My Name)?" (1993)', 3),
      h('s2',   'song',           'Hit song',     '"Gin and Juice" (1994)',          3),
      h('s3',   'song',           'Hit song',     '"Beautiful" (2003)',              3),
      h('s4',   'song',           'Hit song',     '"Young, Wild & Free" (2011)',     3),
      h('sig',  'song',           'Signature',    '"Drop It Like It\'s Hot" (2004)', 5),
    ],
  },

  '50-cent': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Real name',    'Born Curtis Jackson',             1),
      h('bd',   'birth_date',     'Date of birth','July 6, 1975',                    2),
      h('bp',   'birth_place',    'Place of birth','Queens, New York',               2),
      h('pk',   'peak_year',      'Career peak',  '2003 – 2007',                     2),
      h('crew', 'characteristic', 'Group',        'Founder of the G-Unit crew',      3),
      h('s1',   'song',           'Hit song',     '"21 Questions" (2003)',           3),
      h('s2',   'song',           'Hit song',     '"P.I.M.P." (2003)',               3),
      h('s3',   'song',           'Hit song',     '"Candy Shop" (2005)',             3),
      h('alb',  'album',          'Debut album',  '"Get Rich or Die Tryin\'" (2003)', 4),
      h('sig',  'song',           'Signature',    '"In da Club" (2003)',             5),
    ],
  },

  'jay-z': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & mogul',                  1),
      h('f1',   'characteristic', 'Real name',    'Born Shawn Carter',               1),
      h('bd',   'birth_date',     'Date of birth','December 4, 1969',                2),
      h('bp',   'birth_place',    'Place of birth','Brooklyn, New York',             2),
      h('pk',   'peak_year',      'Career peak',  '1998 – 2009',                     2),
      h('s1',   'song',           'Hit song',     '"Hard Knock Life" (1998)',        3),
      h('s2',   'song',           'Hit song',     '"Big Pimpin\'" (1999)',           3),
      h('s3',   'song',           'Hit song',     '"03 Bonnie & Clyde" (2002)',      3),
      h('s4',   'song',           'Hit song',     '"Run This Town" (2009)',          3),
      h('alb',  'album',          'Iconic album', '"The Blueprint" (2001)',          4),
      h('sig',  'song',           'Signature',    '"Empire State of Mind" (2009)',   5),
    ],
  },

  'kanye-west': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & producer',               1),
      h('f1',   'characteristic', 'Fun fact',     'Genre-shifting hip-hop producer', 1),
      h('bd',   'birth_date',     'Date of birth','June 8, 1977',                    2),
      h('bp',   'birth_place',    'Place of birth','Atlanta, Georgia',               2),
      h('pk',   'peak_year',      'Career peak',  '2004 – 2013',                     2),
      h('s1',   'song',           'Hit song',     '"Jesus Walks" (2004)',            3),
      h('s2',   'song',           'Hit song',     '"Gold Digger" (2005)',            3),
      h('s3',   'song',           'Hit song',     '"Stronger" (2007)',               3),
      h('s4',   'song',           'Hit song',     '"Heartless" (2008)',              3),
      h('alb',  'album',          'Debut album',  '"The College Dropout" (2004)',    4),
      h('sig',  'album',          'Iconic album', '"My Beautiful Dark Twisted Fantasy" (2010)', 5),
    ],
  },

  'justin-timberlake': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Early career', 'Former member of NSYNC',          1),
      h('bd',   'birth_date',     'Date of birth','January 31, 1981',                2),
      h('bp',   'birth_place',    'Place of birth','Memphis, Tennessee',             2),
      h('pk',   'peak_year',      'Career peak',  '2002 – 2016',                     2),
      h('s1',   'song',           'Hit song',     '"Cry Me a River" (2002)',         3),
      h('s2',   'song',           'Hit song',     '"My Love" (2006)',                3),
      h('s3',   'song',           'Hit song',     '"Mirrors" (2013)',                3),
      h('s4',   'song',           'Hit song',     '"Can\'t Stop the Feeling!" (2016)', 3),
      h('alb',  'album',          'Iconic album', '"FutureSex/LoveSounds" (2006)',   4),
      h('sig',  'song',           'Signature',    '"SexyBack" (2006)',               5),
    ],
  },

  'justin-bieber': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Discovered on YouTube as a teen', 1),
      h('bd',   'birth_date',     'Date of birth','March 1, 1994',                   2),
      h('bp',   'birth_place',    'Place of birth','London, Ontario',                2),
      h('pk',   'peak_year',      'Career peak',  '2010 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Baby" (2010)',                   3),
      h('s2',   'song',           'Hit song',     '"Boyfriend" (2012)',              3),
      h('s3',   'song',           'Hit song',     '"What Do You Mean?" (2015)',      3),
      h('s4',   'song',           'Hit song',     '"Love Yourself" (2015)',          3),
      h('alb',  'album',          'Iconic album', '"Purpose" (2015)',                4),
      h('sig',  'song',           'Signature',    '"Sorry" (2015)',                  5),
    ],
  },

  'the-weeknd': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B & pop singer',                1),
      h('f1',   'characteristic', 'Real name',    'Born Abel Tesfaye',               1),
      h('bd',   'birth_date',     'Date of birth','February 16, 1990',               2),
      h('bp',   'birth_place',    'Place of birth','Toronto, Ontario',               2),
      h('pk',   'peak_year',      'Career peak',  '2015 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Can\'t Feel My Face" (2015)',    3),
      h('s2',   'song',           'Hit song',     '"The Hills" (2015)',              3),
      h('s3',   'song',           'Hit song',     '"Starboy" (2016)',                3),
      h('s4',   'song',           'Hit song',     '"Save Your Tears" (2020)',        3),
      h('alb',  'album',          'Iconic album', '"After Hours" (2020)',            4),
      h('sig',  'song',           'Signature',    '"Blinding Lights" (2019)',        5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 4 (legends + modern pop, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'dolly-parton': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Country singer-songwriter',       1),
      h('f1',   'characteristic', 'Fun fact',     'Founded the Dollywood theme park', 1),
      h('bd',   'birth_date',     'Date of birth','January 19, 1946',                2),
      h('bp',   'birth_place',    'Place of birth','Pittman Center, Tennessee',      2),
      h('pk',   'peak_year',      'Career peak',  '1974 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Coat of Many Colors" (1971)',    3),
      h('s2',   'song',           'Hit song',     '"9 to 5" (1980)',                 3),
      h('s3',   'song',           'Hit song',     '"Islands in the Stream" (1983)',  3),
      h('s4',   'song',           'Hit song',     '"I Will Always Love You" (1974)', 4),
      h('sig',  'song',           'Signature',    '"Jolene" (1973)',                 5),
    ],
  },

  'neil-diamond': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & rock singer-songwriter',    1),
      h('f1',   'characteristic', 'Fun fact',     'Baseball crowds sing his hit',    1),
      h('bd',   'birth_date',     'Date of birth','January 24, 1941',                2),
      h('bp',   'birth_place',    'Place of birth','Brooklyn, New York',             2),
      h('pk',   'peak_year',      'Career peak',  '1969 – 1982',                     2),
      h('s1',   'song',           'Hit song',     '"Cracklin\' Rosie" (1970)',       3),
      h('s2',   'song',           'Hit song',     '"Song Sung Blue" (1972)',         3),
      h('s3',   'song',           'Hit song',     '"Forever in Blue Jeans" (1979)',  3),
      h('s4',   'song',           'Hit song',     '"America" (1980)',                3),
      h('sig',  'song',           'Signature',    '"Sweet Caroline" (1969)',         5),
    ],
  },

  'john-denver': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Folk & country singer',           1),
      h('f1',   'characteristic', 'Fun fact',     'Sang about mountains and nature', 1),
      h('bd',   'birth_date',     'Date of birth','December 31, 1943',               2),
      h('bp',   'birth_place',    'Place of birth','Roswell, N.M.',                  2),
      h('pk',   'peak_year',      'Career peak',  '1971 – 1976',                     2),
      h('s1',   'song',           'Hit song',     '"Leaving on a Jet Plane" (1969)', 3),
      h('s2',   'song',           'Hit song',     '"Rocky Mountain High" (1972)',    3),
      h('s3',   'song',           'Hit song',     '"Annie\'s Song" (1974)',          3),
      h('s4',   'song',           'Hit song',     '"Thank God I\'m a Country Boy" (1974)', 3),
      h('sig',  'song',           'Signature',    '"Take Me Home, Country Roads" (1971)', 5),
    ],
  },

  'nat-king-cole': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Jazz & pop singer, pianist',      1),
      h('f1',   'characteristic', 'Known for',    'Smooth velvet baritone voice',    1),
      h('bd',   'birth_date',     'Date of birth','March 17, 1919',                  2),
      h('bp',   'birth_place',    'Place of birth','Montgomery, Alabama',            2),
      h('pk',   'peak_year',      'Career peak',  '1950 – 1962',                     2),
      h('s1',   'song',           'Hit song',     '"Mona Lisa" (1950)',              3),
      h('s2',   'song',           'Hit song',     '"Smile" (1954)',                  3),
      h('s3',   'song',           'Hit song',     '"When I Fall in Love" (1957)',    3),
      h('s4',   'song',           'Hit song',     '"L-O-V-E" (1964)',                3),
      h('sig',  'song',           'Signature',    '"Unforgettable" (1951)',          5),
    ],
  },

  'harry-belafonte': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Calypso & folk singer',           1),
      h('f1',   'characteristic', 'Known as',     '"King of Calypso"',               1),
      h('bd',   'birth_date',     'Date of birth','March 1, 1927',                   2),
      h('bp',   'birth_place',    'Place of birth','Harlem, New York',               2),
      h('pk',   'peak_year',      'Career peak',  '1956 – 1962',                     2),
      h('s1',   'song',           'Hit song',     '"Matilda" (1953)',                3),
      h('s2',   'song',           'Hit song',     '"Island in the Sun" (1957)',      3),
      h('s3',   'song',           'Hit song',     '"Mary\'s Boy Child" (1956)',      3),
      h('wa',   'characteristic', 'Fact',         'Helped organise "We Are the World"', 4),
      h('sig',  'song',           'Signature',    '"The Banana Boat Song (Day-O)" (1956)', 5),
    ],
  },

  'buddy-holly': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock and roll singer',            1),
      h('f1',   'characteristic', 'Known for',    'Signature black horn-rim glasses', 1),
      h('bd',   'birth_date',     'Date of birth','September 7, 1936',               2),
      h('bp',   'birth_place',    'Place of birth','Lubbock, Texas',                 2),
      h('pk',   'peak_year',      'Career peak',  '1957 – 1958',                     2),
      h('s1',   'song',           'Hit song',     '"That\'ll Be the Day" (1957)',    3),
      h('s2',   'song',           'Hit song',     '"Oh Boy!" (1957)',                3),
      h('s3',   'song',           'Hit song',     '"Everyday" (1957)',               3),
      h('s4',   'song',           'Hit song',     '"Rave On" (1958)',                3),
      h('sig',  'song',           'Signature',    '"Peggy Sue" (1957)',              5),
    ],
  },

  'roy-orbison': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock and roll singer',            1),
      h('f1',   'characteristic', 'Known for',    'Dark shades and soaring voice',   1),
      h('bd',   'birth_date',     'Date of birth','April 23, 1936',                  2),
      h('bp',   'birth_place',    'Place of birth','Vernon, Texas',                  2),
      h('pk',   'peak_year',      'Career peak',  '1960 – 1964',                     2),
      h('s1',   'song',           'Hit song',     '"Only the Lonely" (1960)',        3),
      h('s2',   'song',           'Hit song',     '"Crying" (1961)',                 3),
      h('s3',   'song',           'Hit song',     '"In Dreams" (1963)',              3),
      h('s4',   'song',           'Hit song',     '"You Got It" (1989)',             3),
      h('sig',  'song',           'Signature',    '"Oh, Pretty Woman" (1964)',       5),
    ],
  },

  'little-richard': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock and roll singer, pianist',   1),
      h('f1',   'characteristic', 'Known as',     '"The Architect of Rock and Roll"', 1),
      h('bd',   'birth_date',     'Date of birth','December 5, 1932',                2),
      h('bp',   'birth_place',    'Place of birth','Macon, Georgia',                 2),
      h('pk',   'peak_year',      'Career peak',  '1955 – 1958',                     2),
      h('s1',   'song',           'Hit song',     '"Rip It Up" (1956)',              3),
      h('s2',   'song',           'Hit song',     '"Long Tall Sally" (1956)',        3),
      h('s3',   'song',           'Hit song',     '"Lucille" (1957)',                3),
      h('s4',   'song',           'Hit song',     '"Good Golly, Miss Molly" (1958)', 3),
      h('sig',  'song',           'Signature',    '"Tutti Frutti" (1955)',           5),
    ],
  },

  'bill-withers': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer-songwriter',          1),
      h('f1',   'characteristic', 'Fun fact',     'Warm, everyman soul songs',       1),
      h('bd',   'birth_date',     'Date of birth','July 4, 1938',                    2),
      h('bp',   'birth_place',    'Place of birth','Slab Fork, West Virginia',       2),
      h('pk',   'peak_year',      'Career peak',  '1971 – 1981',                     2),
      h('s1',   'song',           'Hit song',     '"Ain\'t No Sunshine" (1971)',     3),
      h('s2',   'song',           'Hit song',     '"Use Me" (1972)',                 3),
      h('s3',   'song',           'Hit song',     '"Lovely Day" (1977)',             3),
      h('s4',   'song',           'Hit song',     '"Just the Two of Us" (1981)',     3),
      h('sig',  'song',           'Signature',    '"Lean on Me" (1972)',             5),
    ],
  },

  'barry-white': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Known for',    'Deep bass-baritone voice',        1),
      h('bd',   'birth_date',     'Date of birth','September 12, 1944',              2),
      h('bp',   'birth_place',    'Place of birth','Galveston, Texas',               2),
      h('pk',   'peak_year',      'Career peak',  '1973 – 1978',                     2),
      h('s1',   'song',           'Hit song',     '"Never, Never Gonna Give Ya Up" (1973)', 3),
      h('s2',   'song',           'Hit song',     '"Can\'t Get Enough of Your Love, Babe" (1974)', 3),
      h('s3',   'song',           'Hit song',     '"What Am I Gonna Do with You" (1975)', 3),
      h('s4',   'song',           'Hit song',     '"Let the Music Play" (1975)',     3),
      h('sig',  'song',           'Signature',    '"You\'re the First, the Last, My Everything" (1974)', 5),
    ],
  },

  'dusty-springfield': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & soul singer',               1),
      h('f1',   'characteristic', 'Known for',    'Beehive hair and panda eyeliner', 1),
      h('bd',   'birth_date',     'Date of birth','April 16, 1939',                  2),
      h('bp',   'birth_place',    'Place of birth','Hampstead, London',              2),
      h('pk',   'peak_year',      'Career peak',  '1963 – 1969',                     2),
      h('s1',   'song',           'Hit song',     '"I Only Want to Be with You" (1963)', 3),
      h('s2',   'song',           'Hit song',     '"You Don\'t Have to Say You Love Me" (1966)', 3),
      h('s3',   'song',           'Hit song',     '"The Look of Love" (1967)',       3),
      h('s4',   'song',           'Hit song',     '"I Close My Eyes and Count to Ten" (1968)', 4),
      h('sig',  'song',           'Signature',    '"Son of a Preacher Man" (1968)',  5),
    ],
  },

  'tom-petty': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer-songwriter',          1),
      h('f1',   'characteristic', 'Backing band', 'Led the Heartbreakers',           1),
      h('bd',   'birth_date',     'Date of birth','October 20, 1950',                2),
      h('bp',   'birth_place',    'Place of birth','Gainesville, Florida',           2),
      h('pk',   'peak_year',      'Career peak',  '1979 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Refugee" (1979)',                3),
      h('s2',   'song',           'Hit song',     '"I Won\'t Back Down" (1989)',     3),
      h('s3',   'song',           'Hit song',     '"Learning to Fly" (1991)',        3),
      h('s4',   'song',           'Hit song',     '"Mary Jane\'s Last Dance" (1993)', 3),
      h('sig',  'song',           'Signature',    '"Free Fallin\'" (1989)',          5),
    ],
  },

  'patti-smith': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Punk singer & poet',              1),
      h('f1',   'characteristic', 'Known as',     '"Godmother of Punk"',             1),
      h('bd',   'birth_date',     'Date of birth','December 30, 1946',               2),
      h('bp',   'birth_place',    'Place of birth','Chicago, Illinois',              2),
      h('pk',   'peak_year',      'Career peak',  '1975 – 1988',                     2),
      h('s1',   'song',           'Hit song',     '"Gloria" (1975)',                 3),
      h('s2',   'song',           'Hit song',     '"Dancing Barefoot" (1979)',       3),
      h('s3',   'song',           'Hit song',     '"People Have the Power" (1988)',  3),
      h('alb',  'album',          'Debut album',  '"Horses" (1975)',                 4),
      h('sig',  'song',           'Signature',    '"Because the Night" (1978)',      5),
    ],
  },

  'gwen-stefani': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Former frontwoman of No Doubt',   1),
      h('bd',   'birth_date',     'Date of birth','October 3, 1969',                 2),
      h('bp',   'birth_place',    'Place of birth','Fullerton, California',          2),
      h('pk',   'peak_year',      'Career peak',  '2004 – 2007',                     2),
      h('s1',   'song',           'Hit song',     '"What You Waiting For?" (2004)',  3),
      h('s2',   'song',           'Hit song',     '"Rich Girl" (2004)',              3),
      h('s3',   'song',           'Hit song',     '"Cool" (2005)',                   3),
      h('s4',   'song',           'Hit song',     '"The Sweet Escape" (2006)',       3),
      h('sig',  'song',           'Signature',    '"Hollaback Girl" (2005)',         5),
    ],
  },

  'gorillaz': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Virtual band',                    1),
      h('f1',   'characteristic', 'Fun fact',     'Animated cartoon band members',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1998',          2),
      h('mem',  'characteristic', 'Creators',     'Created by Damon Albarn & Jamie Hewlett', 2),
      h('pk',   'peak_year',      'Career peak',  '2001 – 2010',                     2),
      h('s1',   'song',           'Hit song',     '"Clint Eastwood" (2001)',         3),
      h('s2',   'song',           'Hit song',     '"19-2000" (2001)',                3),
      h('s3',   'song',           'Hit song',     '"Dare" (2005)',                   3),
      h('s4',   'song',           'Hit song',     '"On Melancholy Hill" (2010)',     3),
      h('sig',  'song',           'Signature',    '"Feel Good Inc." (2005)',         5),
    ],
  },

  'the-white-stripes': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock duo',                        1),
      h('f1',   'characteristic', 'Fun fact',     'Red-white-black colour theme',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in Detroit, 1997',         2),
      h('mem',  'band_member',    'Members',      'Jack White & Meg White',          2),
      h('pk',   'peak_year',      'Career peak',  '2001 – 2007',                     2),
      h('s1',   'song',           'Hit song',     '"Fell in Love with a Girl" (2001)', 3),
      h('s2',   'song',           'Hit song',     '"The Hardest Button to Button" (2003)', 3),
      h('s3',   'song',           'Hit song',     '"Icky Thump" (2007)',             3),
      h('alb',  'album',          'Iconic album', '"Elephant" (2003)',               4),
      h('sig',  'song',           'Signature',    '"Seven Nation Army" (2003)',      5),
    ],
  },

  'natalie-imbruglia': {
    categoryLabel: 'Musikartist',
    nationality: 'australia',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Started on soap "Neighbours"',    1),
      h('bd',   'birth_date',     'Date of birth','February 4, 1975',                2),
      h('bp',   'birth_place',    'Place of birth','Sydney',                         2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2005',                     2),
      h('s1',   'song',           'Hit song',     '"Big Mistake" (1998)',            3),
      h('s2',   'song',           'Hit song',     '"Wishing I Was There" (1998)',    3),
      h('s3',   'song',           'Hit song',     '"Shiver" (2005)',                 3),
      h('alb',  'album',          'Debut album',  '"Left of the Middle" (1997)',     4),
      h('sig',  'song',           'Signature',    '"Torn" (1997)',                   5),
    ],
  },

  'the-verve': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Lush Britpop-era rock',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in Wigan, 1990',           2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Richard Ashcroft',     2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 1998',                     2),
      h('s1',   'song',           'Hit song',     '"The Drugs Don\'t Work" (1997)',  3),
      h('s2',   'song',           'Hit song',     '"Lucky Man" (1997)',              3),
      h('s3',   'song',           'Hit song',     '"Sonnet" (1998)',                 3),
      h('alb',  'album',          'Iconic album', '"Urban Hymns" (1997)',            4),
      h('sig',  'song',           'Signature',    '"Bitter Sweet Symphony" (1997)',  5),
    ],
  },

  'new-order': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Electronic rock band',            1),
      h('f1',   'characteristic', 'Fun fact',     'Rose from the band Joy Division', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Manchester, 1980',      2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Bernard Sumner',       2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"Bizarre Love Triangle" (1986)',  3),
      h('s2',   'song',           'Hit song',     '"True Faith" (1987)',             3),
      h('s3',   'song',           'Hit song',     '"Regret" (1993)',                 3),
      h('alb',  'album',          'Iconic album', '"Power, Corruption & Lies" (1983)', 4),
      h('sig',  'song',           'Signature',    '"Blue Monday" (1983)',            5),
    ],
  },

  'the-human-league': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Synth-pop band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Pioneers of electronic pop',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Sheffield, 1977',       2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Philip Oakey',         2),
      h('pk',   'peak_year',      'Career peak',  '1981 – 1986',                     2),
      h('s1',   'song',           'Hit song',     '"Love Action" (1981)',            3),
      h('s2',   'song',           'Hit song',     '"Mirror Man" (1982)',             3),
      h('s3',   'song',           'Hit song',     '"(Keep Feeling) Fascination" (1983)', 3),
      h('alb',  'album',          'Iconic album', '"Dare" (1981)',                   4),
      h('sig',  'song',           'Signature',    '"Don\'t You Want Me" (1981)',     5),
    ],
  },

  'smash-mouth': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-rock band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Their hit features in "Shrek"',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in San Jose, 1994',        2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Steve Harwell',        2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2001',                     2),
      h('s1',   'song',           'Hit song',     '"Walkin\' on the Sun" (1997)',    3),
      h('s2',   'song',           'Hit song',     '"Then the Morning Comes" (1999)', 3),
      h('s3',   'song',           'Hit song',     '"I\'m a Believer" (2001)',        3),
      h('alb',  'album',          'Iconic album', '"Astro Lounge" (1999)',           4),
      h('sig',  'song',           'Signature',    '"All Star" (1999)',               5),
    ],
  },

  'goo-goo-dolls': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Melodic 90s alt-rock',            1),
      h('cy',   'creation_year',  'Formed',       'Formed in Buffalo, 1986',         2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by John Rzeznik',         2),
      h('pk',   'peak_year',      'Career peak',  '1995 – 2002',                     2),
      h('s1',   'song',           'Hit song',     '"Name" (1995)',                   3),
      h('s2',   'song',           'Hit song',     '"Slide" (1998)',                  3),
      h('s3',   'song',           'Hit song',     '"Black Balloon" (1999)',          3),
      h('alb',  'album',          'Iconic album', '"Dizzy Up the Girl" (1998)',      4),
      h('sig',  'song',           'Signature',    '"Iris" (1998)',                   5),
    ],
  },

  'sam-smith': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & soul singer',               1),
      h('f1',   'characteristic', 'Known for',    'Emotional soulful ballads',       1),
      h('bd',   'birth_date',     'Date of birth','May 19, 1992',                    2),
      h('bp',   'birth_place',    'Place of birth','London',                         2),
      h('pk',   'peak_year',      'Career peak',  '2014 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Lay Me Down" (2014)',            3),
      h('s2',   'song',           'Hit song',     '"I\'m Not the Only One" (2014)',  3),
      h('s3',   'song',           'Hit song',     '"Too Good at Goodbyes" (2017)',   3),
      h('s4',   'song',           'Hit song',     '"Unholy" (2022)',                 3),
      h('sig',  'song',           'Signature',    '"Stay with Me" (2014)',           5),
    ],
  },

  'lewis-capaldi': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Known for',    'Raw, husky emotional ballads',    1),
      h('bd',   'birth_date',     'Date of birth','October 7, 1996',                 2),
      h('bp',   'birth_place',    'Place of birth','Glasgow',                        2),
      h('pk',   'peak_year',      'Career peak',  '2019 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Bruises" (2017)',                3),
      h('s2',   'song',           'Hit song',     '"Hold Me While You Wait" (2019)', 3),
      h('s3',   'song',           'Hit song',     '"Before You Go" (2019)',          3),
      h('alb',  'album',          'Debut album',  '"Divinely Uninspired to a Hellish Extent" (2019)', 4),
      h('sig',  'song',           'Signature',    '"Someone You Loved" (2018)',      5),
    ],
  },

  'demi-lovato': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Disney Channel star turned pop',  1),
      h('bd',   'birth_date',     'Date of birth','August 20, 1992',                 2),
      h('bp',   'birth_place',    'Place of birth','Albuquerque, N.M.',              2),
      h('pk',   'peak_year',      'Career peak',  '2011 – 2017',                     2),
      h('s1',   'song',           'Hit song',     '"Skyscraper" (2011)',             3),
      h('s2',   'song',           'Hit song',     '"Give Your Heart a Break" (2012)', 3),
      h('s3',   'song',           'Hit song',     '"Cool for the Summer" (2015)',    3),
      h('s4',   'song',           'Hit song',     '"Sorry Not Sorry" (2017)',        3),
      h('sig',  'song',           'Signature',    '"Heart Attack" (2013)',           5),
    ],
  },

  'miley-cyrus': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Played TV\'s "Hannah Montana"',   1),
      h('bd',   'birth_date',     'Date of birth','November 23, 1992',               2),
      h('bp',   'birth_place',    'Place of birth','Franklin, Tennessee',            2),
      h('pk',   'peak_year',      'Career peak',  '2013 – present',                  2),
      h('s1',   'song',           'Hit song',     '"The Climb" (2009)',              3),
      h('s2',   'song',           'Hit song',     '"We Can\'t Stop" (2013)',         3),
      h('s3',   'song',           'Hit song',     '"Malibu" (2017)',                 3),
      h('s4',   'song',           'Hit song',     '"Flowers" (2023)',                3),
      h('sig',  'song',           'Signature',    '"Wrecking Ball" (2013)',          5),
    ],
  },

  'ellie-goulding': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Known for',    'Breathy, fluttering vocals',      1),
      h('bd',   'birth_date',     'Date of birth','December 30, 1986',               2),
      h('bp',   'birth_place',    'Place of birth','Hereford',                       2),
      h('pk',   'peak_year',      'Career peak',  '2010 – 2016',                     2),
      h('s1',   'song',           'Hit song',     '"Starry Eyed" (2010)',            3),
      h('s2',   'song',           'Hit song',     '"Lights" (2011)',                 3),
      h('s3',   'song',           'Hit song',     '"Burn" (2013)',                   3),
      h('s4',   'song',           'Hit song',     '"On My Mind" (2015)',             3),
      h('sig',  'song',           'Signature',    '"Love Me Like You Do" (2015)',    5),
    ],
  },

  'meghan-trainor': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Retro doo-wop pop sound',         1),
      h('bd',   'birth_date',     'Date of birth','December 22, 1993',               2),
      h('bp',   'birth_place',    'Place of birth','Nantucket, Massachusetts',       2),
      h('pk',   'peak_year',      'Career peak',  '2014 – 2016',                     2),
      h('s1',   'song',           'Hit song',     '"Lips Are Movin" (2014)',         3),
      h('s2',   'song',           'Hit song',     '"Like I\'m Gonna Lose You" (2015)', 3),
      h('s3',   'song',           'Hit song',     '"No" (2016)',                     3),
      h('s4',   'song',           'Hit song',     '"Made You Look" (2022)',          3),
      h('sig',  'song',           'Signature',    '"All About That Bass" (2014)',    5),
    ],
  },

  'nelly-furtado': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Shifted from folk-pop to dance',  1),
      h('bd',   'birth_date',     'Date of birth','December 2, 1978',                2),
      h('bp',   'birth_place',    'Place of birth','Victoria, B.C.',                 2),
      h('pk',   'peak_year',      'Career peak',  '2000 – 2007',                     2),
      h('s1',   'song',           'Hit song',     '"I\'m Like a Bird" (2000)',       3),
      h('s2',   'song',           'Hit song',     '"Promiscuous" (2006)',            3),
      h('s3',   'song',           'Hit song',     '"Maneater" (2006)',               3),
      h('s4',   'song',           'Hit song',     '"All Good Things (Come to an End)" (2006)', 3),
      h('sig',  'song',           'Signature',    '"Say It Right" (2006)',           5),
    ],
  },

  'onerepublic': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-rock band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Frontman is a hit songwriter',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in Colorado, 2002',        2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Ryan Tedder',          2),
      h('pk',   'peak_year',      'Career peak',  '2007 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Apologize" (2007)',              3),
      h('s2',   'song',           'Hit song',     '"Good Life" (2010)',              3),
      h('s3',   'song',           'Hit song',     '"Secrets" (2009)',                3),
      h('s4',   'song',           'Hit song',     '"Love Runs Out" (2014)',          3),
      h('sig',  'song',           'Signature',    '"Counting Stars" (2013)',         5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 5 (famous Swedish acts, 2026-09-02)
  // ⚠ Never write "Swedish" in a value (filtered word). Year-less titles used
  //    for visor legends where exact release years are uncertain.
  // ══════════════════════════════════════════════════════════════════════════

  'magnus-uggla': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & pop singer',               1),
      h('f1',   'characteristic', 'Known for',    'Theatrical glam-rock showman',    1),
      h('bd',   'birth_date',     'Date of birth','June 16, 1954',                   2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1990',                     2),
      h('s1',   'song',           'Hit song',     '"Johnny the Rucker" (1976)',      3),
      h('s2',   'song',           'Hit song',     '"IQ" (1978)',                     3),
      h('s3',   'song',           'Hit song',     '"Vittring" (1985)',               3),
      h('s4',   'song',           'Hit song',     '"Kung för en dag" (1986)',        3),
      h('sig',  'song',           'Signature',    '"Varning på stan" (1977)',        5),
    ],
  },

  'tomas-ledin': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & rock singer',               1),
      h('f1',   'characteristic', 'Fun fact',     'Toured as an ABBA backing singer', 1),
      h('bd',   'birth_date',     'Date of birth','February 25, 1952',               2),
      h('bp',   'birth_place',    'Place of birth','Sandviken',                      2),
      h('pk',   'peak_year',      'Career peak',  '1980 – 1995',                     2),
      h('s1',   'song',           'Hit song',     '"Just nu!" (1980)',               3),
      h('s2',   'song',           'Hit song',     '"Hon gör allt för att göra mig lycklig" (1980)', 3),
      h('s3',   'song',           'Hit song',     '"Vi är på gång" (1983)',          3),
      h('s4',   'song',           'Hit song',     '"En del av mitt hjärta" (1985)',  3),
      h('sig',  'song',           'Signature',    '"Sommaren är kort" (1982)',       5),
    ],
  },

  'ted-gardestad': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Fun fact',     'Wrote songs with brother Kenneth', 1),
      h('bd',   'birth_date',     'Date of birth','February 18, 1956',               2),
      h('bp',   'birth_place',    'Place of birth','Sollentuna',                     2),
      h('pk',   'peak_year',      'Career peak',  '1972 – 1979',                     2),
      h('s1',   'song',           'Hit song',     '"Jag vill ha en egen måne" (1972)', 3),
      h('s2',   'song',           'Hit song',     '"Come Give Me Love" (1974)',      3),
      h('s3',   'song',           'Hit song',     '"Franska kort" (1976)',           3),
      h('s4',   'song',           'Hit song',     '"Satellit" (1979)',               3),
      h('sig',  'song',           'Signature',    '"Sol, vind och vatten" (1973)',   5),
    ],
  },

  'first-aid-kit': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Folk duo',                        1),
      h('f1',   'characteristic', 'Members',      'The Söderberg sisters',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in Stockholm, 2007',       2),
      h('mem',  'band_member',    'Members',      'Klara & Johanna Söderberg',       2),
      h('pk',   'peak_year',      'Career peak',  '2012 – 2018',                     2),
      h('s1',   'song',           'Hit song',     '"The Lion\'s Roar" (2012)',       3),
      h('s2',   'song',           'Hit song',     '"My Silver Lining" (2014)',       3),
      h('s3',   'song',           'Hit song',     '"It\'s a Shame" (2018)',          3),
      h('alb',  'album',          'Iconic album', '"The Lion\'s Roar" album (2012)', 4),
      h('sig',  'song',           'Signature',    '"Emmylou" (2012)',                5),
    ],
  },

  'swedish-house-mafia': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'EDM supergroup',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Trio of star house DJs',          1),
      h('cy',   'creation_year',  'Formed',       'Formed in 2008',                  2),
      h('mem',  'band_member',    'Members',      'Axwell, Ingrosso & Angello',      2),
      h('pk',   'peak_year',      'Career peak',  '2010 – 2013',                     2),
      h('s1',   'song',           'Hit song',     '"One" (2010)',                    3),
      h('s2',   'song',           'Hit song',     '"Save the World" (2011)',         3),
      h('s3',   'song',           'Hit song',     '"Antidote" (2011)',               3),
      h('s4',   'song',           'Hit song',     '"Greyhound" (2012)',              3),
      h('s5',   'song',           'Hit song',     '"Reload" (2013)',                 3),
      h('sig',  'song',           'Signature',    '"Don\'t You Worry Child" (2012)', 5),
    ],
  },

  'loreen': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Two-time Eurovision winner',      1),
      h('bd',   'birth_date',     'Date of birth','October 16, 1983',                2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2012 – present',                  2),
      h('s1',   'song',           'Hit song',     '"My Heart Is Refusing Me" (2011)', 3),
      h('s2',   'song',           'Hit song',     '"We Got the Power" (2012)',       3),
      h('s3',   'song',           'Hit song',     '"Statements" (2017)',             3),
      h('s4',   'song',           'Hit song',     '"Tattoo" (2023)',                 3),
      h('sig',  'song',           'Signature',    '"Euphoria" (2012)',               5),
    ],
  },

  'the-cardigans': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-rock band',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Bittersweet pop with cool vocals', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Jönköping, 1992',       2),
      h('mem',  'lead_singer',    'Frontwoman',   'Fronted by Nina Persson',         2),
      h('pk',   'peak_year',      'Career peak',  '1996 – 2003',                     2),
      h('s1',   'song',           'Hit song',     '"Carnival" (1995)',               3),
      h('s2',   'song',           'Hit song',     '"My Favourite Game" (1998)',      3),
      h('s3',   'song',           'Hit song',     '"Erase/Rewind" (1998)',           3),
      h('s4',   'song',           'Hit song',     '"For What It\'s Worth" (2003)',   3),
      h('alb',  'album',          'Iconic album', '"First Band on the Moon" (1996)', 4),
      h('sig',  'song',           'Signature',    '"Lovefool" (1996)',               5),
    ],
  },

  'icona-pop': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop duo',                         1),
      h('f1',   'characteristic', 'Fun fact',     'High-energy electro-pop',         1),
      h('cy',   'creation_year',  'Formed',       'Formed in Stockholm, 2009',       2),
      h('mem',  'band_member',    'Members',      'Caroline Hjelt & Aino Jawo',      2),
      h('pk',   'peak_year',      'Career peak',  '2012 – 2014',                     2),
      h('s1',   'song',           'Hit song',     '"Manners" (2011)',                3),
      h('s2',   'song',           'Hit song',     '"First Time" (2013)',             3),
      h('s3',   'song',           'Hit song',     '"Girlfriend" (2013)',             3),
      h('s4',   'song',           'Hit song',     '"All Night" (2013)',              3),
      h('s5',   'song',           'Hit song',     '"Emergency" (2015)',              3),
      h('sig',  'song',           'Signature',    '"I Love It" (2012)',              5),
    ],
  },

  'laleh': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Fun fact',     'Also produces her own music',     1),
      h('bd',   'birth_date',     'Date of birth','June 9, 1982',                    2),
      h('bp',   'birth_place',    'Place of birth','Based in Gothenburg',            2),
      h('pk',   'peak_year',      'Career peak',  '2005 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Live Tomorrow" (2005)',          3),
      h('s2',   'song',           'Hit song',     '"Bara få va mig själv" (2012)',   3),
      h('s3',   'song',           'Hit song',     '"Vårens första dag" (2012)',      3),
      h('s4',   'song',           'Hit song',     '"En stund på jorden" (2016)',     3),
      h('s5',   'song',           'Hit song',     '"Goliat" (2017)',                 3),
      h('sig',  'song',           'Signature',    '"Some Die Young" (2012)',         5),
    ],
  },

  'eva-dahlgren': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Fun fact',     'Poetic, introspective pop',       1),
      h('bd',   'birth_date',     'Date of birth','1960',                            2),
      h('bp',   'birth_place',    'Place of birth','Skara',                          2),
      h('pk',   'peak_year',      'Career peak',  '1991 – 1995',                     2),
      h('s1',   'song',           'Hit song',     '"Vem tänder stjärnorna" (1991)',  3),
      h('s2',   'song',           'Hit song',     '"Ung och stolt" (1991)',          3),
      h('s3',   'song',           'Hit song',     '"Kom och håll om mig"',           3),
      h('s4',   'song',           'Hit song',     '"Jag vill se min älskade komma"', 3),
      h('alb',  'album',          'Iconic album', '"En blekt blondins hjärta" (1991)', 4),
      h('sig',  'song',           'Signature',    '"Ängeln i rummet" (1991)',        5),
    ],
  },

  'ulf-lundell': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer-songwriter & author', 1),
      h('f1',   'characteristic', 'Fun fact',     'Also wrote the novel "Jack"',     1),
      h('bd',   'birth_date',     'Date of birth','1949',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1976 – 1990',                     2),
      h('alb',  'album',          'Debut album',  '"Vargmåne" (1975)',               3),
      h('s1',   'song',           'Hit song',     '"Snön faller och vi med den"',    3),
      h('s2',   'song',           'Hit song',     '"Sextio dagar"',                  3),
      h('c1',   'characteristic', 'Fun fact',     'Also a painter and poet',         4),
      h('c2',   'characteristic', 'Fun fact',     'A towering Nordic rock songwriter', 4),
      h('sig',  'song',           'Signature',    '"Öppna landskap" (1982)',         5),
    ],
  },

  'thomas-di-leva': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Fun fact',     'New-age spiritual pop persona',   1),
      h('bd',   'birth_date',     'Date of birth','1963',                            2),
      h('bp',   'birth_place',    'Place of birth','Sundsvall',                      2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1996',                     2),
      h('s1',   'song',           'Hit song',     '"Din tid kommer"',                3),
      h('s2',   'song',           'Hit song',     '"Ge mig ett folk"',               3),
      h('s3',   'song',           'Hit song',     '"Kärlekens tunga"',               3),
      h('s4',   'song',           'Hit song',     '"Universum"',                     3),
      h('c1',   'characteristic', 'Known for',    'Barefoot, colourful stage shows', 4),
      h('sig',  'song',           'Signature',    '"Vem ska jag tro på"',            5),
    ],
  },

  'tove-lo': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Known for',    'Raw, candid dark-pop lyrics',     1),
      h('bd',   'birth_date',     'Date of birth','October 29, 1987',                2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2014 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Talking Body" (2014)',           3),
      h('s2',   'song',           'Hit song',     '"Cool Girl" (2016)',              3),
      h('s3',   'song',           'Hit song',     '"Disco Tits" (2017)',             3),
      h('alb',  'album',          'Debut album',  '"Queen of the Clouds" (2014)',    4),
      h('sig',  'song',           'Signature',    '"Habits (Stay High)" (2014)',     5),
    ],
  },

  'lykke-li': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Indie-pop singer-songwriter',     1),
      h('f1',   'characteristic', 'Known for',    'Dreamy, melancholic indie-pop',   1),
      h('bd',   'birth_date',     'Date of birth','March 18, 1986',                  2),
      h('bp',   'birth_place',    'Place of birth','Ystad',                          2),
      h('pk',   'peak_year',      'Career peak',  '2008 – 2014',                     2),
      h('s1',   'song',           'Hit song',     '"Little Bit" (2008)',             3),
      h('s2',   'song',           'Hit song',     '"Sadness Is a Blessing" (2011)',  3),
      h('s3',   'song',           'Hit song',     '"No Rest for the Wicked" (2014)', 3),
      h('alb',  'album',          'Iconic album', '"Wounded Rhymes" (2011)',         4),
      h('sig',  'song',           'Signature',    '"I Follow Rivers" (2011)',        5),
    ],
  },

  'e-type': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance artist',                1),
      h('f1',   'characteristic', 'Fun fact',     'Epic 90s Eurodance anthems',      1),
      h('bd',   'birth_date',     'Date of birth','1965',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 2001',                     2),
      h('s1',   'song',           'Hit song',     '"This Is the Way" (1994)',        3),
      h('s2',   'song',           'Hit song',     '"Set the World on Fire" (1994)',  3),
      h('s3',   'song',           'Hit song',     '"Angels Crying" (1996)',          3),
      h('s4',   'song',           'Hit song',     '"Life" (1998)',                   3),
      h('sig',  'song',           'Signature',    '"Campione 2000" (2000)',          5),
    ],
  },

  'dr-alban': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance artist',                1),
      h('f1',   'characteristic', 'Fun fact',     'Trained as a dentist first',      1),
      h('bd',   'birth_date',     'Date of birth','1957',                            2),
      h('bp',   'birth_place',    'Place of birth','Based in Stockholm',             2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Hello Afrika" (1990)',           3),
      h('s2',   'song',           'Hit song',     '"Sing Hallelujah!" (1993)',       3),
      h('s3',   'song',           'Hit song',     '"Look Who\'s Talking" (1994)',    3),
      h('s4',   'song',           'Hit song',     '"Away from Home" (1994)',         3),
      h('s5',   'song',           'Hit song',     '"Let the Beat Go On" (1994)',     3),
      h('sig',  'song',           'Signature',    '"It\'s My Life" (1992)',          5),
    ],
  },

  'basshunter': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'DJ & dance producer',             1),
      h('f1',   'characteristic', 'Fun fact',     'Rose to fame via online gaming',  1),
      h('bd',   'birth_date',     'Date of birth','1984',                            2),
      h('bp',   'birth_place',    'Place of birth','Halmstad',                       2),
      h('pk',   'peak_year',      'Career peak',  '2006 – 2009',                     2),
      h('s1',   'song',           'Hit song',     '"DotA" (2006)',                   3),
      h('s2',   'song',           'Hit song',     '"Now You\'re Gone" (2007)',       3),
      h('s3',   'song',           'Hit song',     '"All I Ever Wanted" (2008)',      3),
      h('s4',   'song',           'Hit song',     '"Angel in the Night" (2008)',     3),
      h('s5',   'song',           'Hit song',     '"I Miss You" (2008)',             3),
      h('sig',  'song',           'Signature',    '"Boten Anna" (2006)',             5),
    ],
  },

  'galantis': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'EDM duo',                         1),
      h('f1',   'characteristic', 'Fun fact',     'Chipmunk-style vocal hooks',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in 2012',                  2),
      h('mem',  'band_member',    'Members',      'Christian Karlsson & Linus Eklöw', 2),
      h('pk',   'peak_year',      'Career peak',  '2014 – 2017',                     2),
      h('s1',   'song',           'Hit song',     '"Gold Dust" (2015)',              3),
      h('s2',   'song',           'Hit song',     '"Peanut Butter Jelly" (2015)',    3),
      h('s3',   'song',           'Hit song',     '"No Money" (2016)',               3),
      h('s4',   'song',           'Hit song',     '"Hunter" (2017)',                 3),
      h('s5',   'song',           'Hit song',     '"Rich Boy" (2018)',               3),
      h('sig',  'song',           'Signature',    '"Runaway (U & I)" (2014)',        5),
    ],
  },

  'alesso': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'DJ & house producer',             1),
      h('f1',   'characteristic', 'Fun fact',     'Protégé of Sebastian Ingrosso',   1),
      h('bd',   'birth_date',     'Date of birth','1991',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2011 – 2016',                     2),
      h('s1',   'song',           'Hit song',     '"Calling (Lose My Mind)" (2011)', 3),
      h('s2',   'song',           'Hit song',     '"Years" (2012)',                  3),
      h('s3',   'song',           'Hit song',     '"Under Control" (2013)',          3),
      h('s4',   'song',           'Hit song',     '"Cool" (2015)',                   3),
      h('s5',   'song',           'Hit song',     '"Let Me Go" (2017)',              3),
      h('sig',  'song',           'Signature',    '"Heroes (We Could Be)" (2014)',   5),
    ],
  },

  'mans-zelmerlow': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer & TV host',            1),
      h('f1',   'characteristic', 'Fun fact',     'Eurovision winner with stick-man visuals', 1),
      h('bd',   'birth_date',     'Date of birth','June 13, 1986',                   2),
      h('bp',   'birth_place',    'Place of birth','Lund',                           2),
      h('pk',   'peak_year',      'Career peak',  '2007 – 2015',                     2),
      h('s1',   'song',           'Hit song',     '"Cara Mia" (2007)',               3),
      h('s2',   'song',           'Hit song',     '"Hope & Glory" (2008)',           3),
      h('s3',   'song',           'Hit song',     '"Should\'ve Gone Home" (2015)',   3),
      h('s4',   'song',           'Hit song',     '"Fire and Ice" (2016)',           3),
      h('host', 'characteristic', 'Fun fact',     'Co-hosted the 2016 Eurovision',   4),
      h('sig',  'song',           'Signature',    '"Heroes" (2015)',                 5),
    ],
  },

  'eric-saade': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Started in boy band What\'s Up!', 1),
      h('bd',   'birth_date',     'Date of birth','October 29, 1990',                2),
      h('bp',   'birth_place',    'Place of birth','Kattarp',                        2),
      h('pk',   'peak_year',      'Career peak',  '2010 – 2015',                     2),
      h('s1',   'song',           'Hit song',     '"Manboy" (2010)',                 3),
      h('s2',   'song',           'Hit song',     '"Hotter than Fire" (2011)',       3),
      h('s3',   'song',           'Hit song',     '"Hearts in the Air" (2011)',      3),
      h('s4',   'song',           'Hit song',     '"Coming Home" (2015)',            3),
      h('euv',  'characteristic', 'Fun fact',     'Competed at Eurovision twice',    4),
      h('sig',  'song',           'Signature',    '"Popular" (2011)',                5),
    ],
  },

  'cornelis-vreeswijk': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Troubadour & singer-songwriter',  1),
      h('f1',   'characteristic', 'Fun fact',     'Beloved ballad and visa singer',  1),
      h('bd',   'birth_date',     'Date of birth','August 8, 1937',                  2),
      h('bp',   'birth_place',    'Place of birth','Born in IJmuiden',               2),
      h('pk',   'peak_year',      'Career peak',  '1964 – 1975',                     2),
      h('s1',   'song',           'Hit song',     '"Ballad på en soptunna"',         3),
      h('s2',   'song',           'Hit song',     '"Somliga går med trasiga skor"',  3),
      h('s3',   'song',           'Hit song',     '"Brev från kolonien"',            3),
      h('s4',   'song',           'Hit song',     '"Deirdres samba"',                3),
      h('sig',  'song',           'Signature',    '"Cecilia Lind"',                  5),
    ],
  },

  'evert-taube': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Troubadour, poet & composer',     1),
      h('f1',   'characteristic', 'Fun fact',     'A sailor-poet and national icon', 1),
      h('bd',   'birth_date',     'Date of birth','March 12, 1890',                  2),
      h('bp',   'birth_place',    'Place of birth','Gothenburg',                     2),
      h('pk',   'peak_year',      'Career peak',  '1920s – 1950s',                   2),
      h('s1',   'song',           'Hit song',     '"Calle Schewens vals"',           3),
      h('s2',   'song',           'Hit song',     '"Sjösala vals"',                  3),
      h('s3',   'song',           'Hit song',     '"Fritiof Andersson"',             3),
      h('s4',   'song',           'Hit song',     '"Änglamark"',                     3),
      h('sig',  'song',           'Signature',    '"Så länge skutan kan gå"',        5),
    ],
  },

  'lars-winnerback': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer-songwriter',          1),
      h('f1',   'characteristic', 'Fun fact',     'Storytelling roots-rock lyrics',  1),
      h('bd',   'birth_date',     'Date of birth','1975',                            2),
      h('bp',   'birth_place',    'Place of birth','Linköping',                      2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2010',                     2),
      h('s1',   'song',           'Hit song',     '"Elegi"',                         3),
      h('s2',   'song',           'Hit song',     '"Solregn"',                       3),
      h('s3',   'song',           'Hit song',     '"Hugga sten"',                    3),
      h('s4',   'song',           'Hit song',     '"Kom änglar"',                    3),
      h('c1',   'characteristic', 'Backing band', 'Plays with the band Hovet',       4),
      h('sig',  'song',           'Signature',    '"Om du lämnade mig nu" (2007)',   5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 6 (more Swedish acts, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'lisa-nilsson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & jazz singer',               1),
      h('f1',   'characteristic', 'Fun fact',     'Later moved into jazz',           1),
      h('bd',   'birth_date',     'Date of birth','October 13, 1970',                2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1992 – 1998',                     2),
      h('s1',   'song',           'Hit song',     '"Varje gång jag ser dig" (1992)', 3),
      h('s2',   'song',           'Hit song',     '"Öppna upp ditt fönster"',        3),
      h('s3',   'song',           'Hit song',     '"La nuit"',                       3),
      h('c1',   'characteristic', 'Fun fact',     'A leading voice of 90s pop',      4),
      h('sig',  'song',           'Signature',    '"Himlen runt hörnet" (1992)',     5),
    ],
  },

  'timbuktu': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Real name',    'Born Jason Diakité',              1),
      h('bd',   'birth_date',     'Date of birth','1975',                            2),
      h('bp',   'birth_place',    'Place of birth','Lund',                           2),
      h('pk',   'peak_year',      'Career peak',  '2003 – 2010',                     2),
      h('s1',   'song',           'Hit song',     '"Det löser sig" (2003)',          3),
      h('s2',   'song',           'Hit song',     '"Resten av ditt liv"',            3),
      h('s3',   'song',           'Hit song',     '"Flickan och kråkan"',            3),
      h('c1',   'characteristic', 'Fun fact',     'Blends reggae, soul and hip-hop', 4),
      h('sig',  'song',           'Signature',    '"Alla vill till himmelen men ingen vill dö" (2005)', 5),
    ],
  },

  'miss-li': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Real name',    'Born Linda Carlsson',             1),
      h('bd',   'birth_date',     'Date of birth','1982',                            2),
      h('bp',   'birth_place',    'Place of birth','Borlänge',                       2),
      h('pk',   'peak_year',      'Career peak',  '2007 – 2019',                     2),
      h('s1',   'song',           'Hit song',     '"Bourgeois Shangri-La"',          3),
      h('s2',   'song',           'Hit song',     '"Oh Boy"',                        3),
      h('s3',   'song',           'Hit song',     '"Ba Ba Ba"',                      3),
      h('c1',   'characteristic', 'Fun fact',     'Cabaret-tinged, theatrical pop',  4),
      h('sig',  'song',           'Signature',    '"Complicated"',                   5),
    ],
  },

  'seinabo-sey': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & pop singer',               1),
      h('f1',   'characteristic', 'Known for',    'Rich, soulful contralto voice',   1),
      h('bd',   'birth_date',     'Date of birth','1990',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2013 – 2018',                     2),
      h('s1',   'song',           'Hit song',     '"Pistols at Dawn" (2013)',        3),
      h('s2',   'song',           'Hit song',     '"Hard Time" (2015)',              3),
      h('s3',   'song',           'Hit song',     '"I Owe You Nothing" (2018)',      3),
      h('alb',  'album',          'Debut album',  '"Pretend" (2015)',                4),
      h('sig',  'song',           'Signature',    '"Younger" (2013)',                5),
    ],
  },

  'miriam-bryant': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Known for',    'Powerful, emotive vocals',        1),
      h('bd',   'birth_date',     'Date of birth','1991',                            2),
      h('bp',   'birth_place',    'Place of birth','Gothenburg',                     2),
      h('pk',   'peak_year',      'Career peak',  '2013 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Push Play" (2013)',              3),
      h('s2',   'song',           'Hit song',     '"Black Car" (2019)',              3),
      h('s3',   'song',           'Hit song',     '"Rooftop"',                       3),
      h('c1',   'characteristic', 'Fun fact',     'Co-wrote hits for other artists', 4),
      h('sig',  'song',           'Signature',    '"Finders Keepers" (2013)',        5),
    ],
  },

  'mabel': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Fun fact',     'Daughter of singer Neneh Cherry', 1),
      h('bd',   'birth_date',     'Date of birth','February 20, 1996',               2),
      h('bp',   'birth_place',    'Place of birth','Málaga',                         2),
      h('pk',   'peak_year',      'Career peak',  '2017 – 2020',                     2),
      h('s1',   'song',           'Hit song',     '"Finders Keepers" (2017)',        3),
      h('s2',   'song',           'Hit song',     '"Mad Love" (2019)',               3),
      h('s3',   'song',           'Hit song',     '"Boyfriend" (2020)',              3),
      h('alb',  'album',          'Debut album',  '"High Expectations" (2019)',      4),
      h('sig',  'song',           'Signature',    '"Don\'t Call Me Up" (2019)',      5),
    ],
  },

  'ola-salo': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer',                     1),
      h('f1',   'characteristic', 'Known for',    'Flamboyant glam-rock frontman',   1),
      h('bd',   'birth_date',     'Date of birth','June 21, 1977',                   2),
      h('bp',   'birth_place',    'Place of birth','Trelleborg',                     2),
      h('pk',   'peak_year',      'Career peak',  '2000 – 2010',                     2),
      h('band', 'characteristic', 'Band',         'Frontman of The Ark',             3),
      h('s1',   'song',           'Hit song',     '"Calleth You, Cometh I" (2001)',  3),
      h('s2',   'song',           'Hit song',     '"Father of a Son"',               3),
      h('s3',   'song',           'Hit song',     '"The Worrying Kind" (2007)',      3),
      h('c1',   'characteristic', 'Fun fact',     'The Ark won Melodifestivalen (2007)', 4),
      h('sig',  'song',           'Signature',    '"It Takes a Fool to Remain Sane" (2000)', 5),
    ],
  },

  'helen-sjoholm': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Musical & pop singer',            1),
      h('f1',   'characteristic', 'Fun fact',     'Star of stage musicals',          1),
      h('bd',   'birth_date',     'Date of birth','1970',                            2),
      h('bp',   'birth_place',    'Place of birth','Sundsvall',                      2),
      h('pk',   'peak_year',      'Career peak',  '1996 – 2010',                     2),
      h('s1',   'song',           'Hit song',     '"Gabriellas sång" (2004)',        3),
      h('s2',   'song',           'Hit song',     '"En sång om längtan"',            3),
      h('c1',   'characteristic', 'Fun fact',     'Starred in "Kristina från Duvemåla"', 4),
      h('c2',   'characteristic', 'Fun fact',     'Sang in the film "Så som i himmelen"', 4),
      h('sig',  'song',           'Signature',    '"Du måste finnas" (1996)',        5),
    ],
  },

  'tommy-korberg': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer & actor',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Starred in the musical "Chess"',  1),
      h('bd',   'birth_date',     'Date of birth','July 4, 1948',                    2),
      h('bp',   'birth_place',    'Place of birth','Norsjö',                         2),
      h('pk',   'peak_year',      'Career peak',  '1969 – 1990',                     2),
      h('s1',   'song',           'Hit song',     '"Judy, min vän" (1969)',          3),
      h('s2',   'song',           'Hit song',     '"Anthem"',                        3),
      h('s3',   'song',           'Hit song',     '"Ljus och värme"',                3),
      h('c1',   'characteristic', 'Fun fact',     'Competed at Eurovision (1988)'     , 4),
      h('sig',  'song',           'Signature',    '"Stad i ljus" (1988)',            5),
    ],
  },

  'lill-babs': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & schlager singer',           1),
      h('f1',   'characteristic', 'Real name',    'Born Barbro Svensson',            1),
      h('bd',   'birth_date',     'Date of birth','March 9, 1938',                   2),
      h('bp',   'birth_place',    'Place of birth','Järvsö',                         2),
      h('pk',   'peak_year',      'Career peak',  '1959 – 1970',                     2),
      h('s1',   'song',           'Hit song',     '"April, april" (1961)',           3),
      h('s2',   'song',           'Hit song',     '"Leva livet" (1966)',             3),
      h('s3',   'song',           'Hit song',     '"En tuff brud i lyxförpackning"', 3),
      h('c1',   'characteristic', 'Fun fact',     'A beloved TV entertainer for decades', 4),
      h('sig',  'song',           'Signature',    '"Är du kär i mej ännu Klas-Göran" (1959)', 5),
    ],
  },

  'kikki-danielsson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Schlager & dansband singer',      1),
      h('f1',   'characteristic', 'Fun fact',     'Sang in dansband Wizex',          1),
      h('bd',   'birth_date',     'Date of birth','May 10, 1952',                    2),
      h('bp',   'birth_place',    'Place of birth','Osby',                           2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1988',                     2),
      h('s1',   'song',           'Hit song',     '"Papaya Coconut" (1986)',         3),
      h('s2',   'song',           'Hit song',     '"Segla på ett moln"',             3),
      h('s3',   'song',           'Hit song',     '"Efter plåten"',                  3),
      h('c1',   'characteristic', 'Fun fact',     'Competed at Eurovision (1985)'     , 4),
      h('sig',  'song',           'Signature',    '"Bra vibrationer" (1985)',        5),
    ],
  },

  'helena-paparizou': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'First rose to fame in duo Antique', 1),
      h('bd',   'birth_date',     'Date of birth','January 31, 1982',                2),
      h('bp',   'birth_place',    'Place of birth','Borås',                          2),
      h('pk',   'peak_year',      'Career peak',  '2005 – 2008',                     2),
      h('s1',   'song',           'Hit song',     '"Mambo!" (2006)',                 3),
      h('s2',   'song',           'Hit song',     '"Gigolo" (2007)',                 3),
      h('s3',   'song',           'Hit song',     '"Poison"',                        3),
      h('c1',   'characteristic', 'Fun fact',     'Won the 2005 Eurovision'           , 4),
      h('sig',  'song',           'Signature',    '"My Number One" (2005)',          5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 7 (more Swedish acts, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'rednex': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance group',                 1),
      h('f1',   'characteristic', 'Fun fact',     'Country-meets-rave hoedown sound', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1994',                  2),
      h('mem',  'characteristic', 'Personas',     'Hillbilly stage characters',      2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Old Pop in an Oak" (1994)',      3),
      h('s2',   'song',           'Hit song',     '"Wish You Were Here" (1994)',     3),
      h('s3',   'song',           'Hit song',     '"Hold Me for a While" (2000)',    3),
      h('s4',   'song',           'Hit song',     '"The Spirit of the Hawk" (2000)', 3),
      h('sig',  'song',           'Signature',    '"Cotton Eye Joe" (1994)',         5),
    ],
  },

  'charlotte-nilsson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & schlager singer',           1),
      h('f1',   'characteristic', 'Fun fact',     'Later known as Charlotte Perrelli', 1),
      h('bd',   'birth_date',     'Date of birth','1974',                            2),
      h('bp',   'birth_place',    'Place of birth','Hjärtlanda',                     2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2008',                     2),
      h('s1',   'song',           'Hit song',     '"Tusen och en natt" (1999)',      3),
      h('s2',   'song',           'Hit song',     '"Gör mig lycklig nu"',            3),
      h('s3',   'song',           'Hit song',     '"Hero" (2008)',                   3),
      h('c1',   'characteristic', 'Fun fact',     'Won the 1999 Eurovision',         4),
      h('sig',  'song',           'Signature',    '"Take Me to Your Heaven" (1999)', 5),
    ],
  },

  'mauro-scocco': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Early career', 'Formerly of the duo Ratata',      1),
      h('bd',   'birth_date',     'Date of birth','1962',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1995',                     2),
      h('s1',   'song',           'Hit song',     '"Är det konstigt att man längtar bort"', 3),
      h('s2',   'song',           'Hit song',     '"Ett bud"',                       3),
      h('s3',   'song',           'Hit song',     '"Håll mitt hjärta hårt"',         3),
      h('c1',   'characteristic', 'Fun fact',     'A polished pop craftsman',        4),
      h('sig',  'song',           'Signature',    '"Sarah" (1988)',                  5),
    ],
  },

  'hasse-andersson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Country & dansband singer',       1),
      h('f1',   'characteristic', 'Fun fact',     'Warm Scanian country-pop',        1),
      h('bd',   'birth_date',     'Date of birth','1948',                            2),
      h('bp',   'birth_place',    'Place of birth','Skåne',                          2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1995',                     2),
      h('s1',   'song',           'Hit song',     '"Lilla vackra Anna"',             3),
      h('s2',   'song',           'Hit song',     '"Guld och gröna skogar"',         3),
      h('s3',   'song',           'Hit song',     '"En vanlig dag"',                 3),
      h('c1',   'characteristic', 'Fun fact',     'Fronted Kvinnaböske Band',        4),
      h('sig',  'song',           'Signature',    '"Änglahund" (1983)',              5),
    ],
  },

  'malena-ernman': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Opera mezzo-soprano',             1),
      h('f1',   'characteristic', 'Known for',    'Crossover of opera and pop',      1),
      h('bd',   'birth_date',     'Date of birth','1970',                            2),
      h('bp',   'birth_place',    'Place of birth','Uppsala',                        2),
      h('pk',   'peak_year',      'Career peak',  '2000 – 2010',                     2),
      h('c1',   'characteristic', 'Fun fact',     'Sings on major opera stages',     3),
      h('c2',   'characteristic', 'Fun fact',     'Competed at Eurovision (2009)',   3),
      h('c3',   'characteristic', 'Voice type',   'A classical mezzo-soprano',       3),
      h('c4',   'characteristic', 'Fun fact',     'Also records pop and jazz',       4),
      h('sig',  'song',           'Signature',    '"La Voix" (2009)',                5),
    ],
  },

  'john-lundvik': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & soul singer, songwriter',   1),
      h('f1',   'characteristic', 'Fun fact',     'A former competitive sprinter',   1),
      h('bd',   'birth_date',     'Date of birth','1983',                            2),
      h('bp',   'birth_place',    'Place of birth','London',                         2),
      h('pk',   'peak_year',      'Career peak',  '2018 – present',                  2),
      h('s1',   'song',           'Hit song',     '"My Turn" (2018)',                3),
      h('c1',   'characteristic', 'Fun fact',     'Co-wrote a UK Eurovision entry',  3),
      h('c2',   'characteristic', 'Fun fact',     'Competed at Eurovision (2019)',   3),
      h('c3',   'characteristic', 'Known for',    'Big gospel-soul choir sound',     4),
      h('sig',  'song',           'Signature',    '"Too Late for Love" (2019)',      5),
    ],
  },

  'anna-bergendahl': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & country singer',            1),
      h('f1',   'characteristic', 'Early career', 'Rose via TV talent show Idol',    1),
      h('bd',   'birth_date',     'Date of birth','1991',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2010 – 2019',                     2),
      h('s1',   'song',           'Hit song',     '"Yes We Can"',                    3),
      h('s2',   'song',           'Hit song',     '"Kingdom Come" (2019)',           3),
      h('c1',   'characteristic', 'Fun fact',     'Competed at Eurovision (2010)',   3),
      h('c2',   'characteristic', 'Known for',    'Folk-tinged country-pop',         4),
      h('sig',  'song',           'Signature',    '"This Is My Life" (2010)',        5),
    ],
  },

  'cornelia-jakobs': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Known for',    'Raspy, emotional pop vocals',     1),
      h('bd',   'birth_date',     'Date of birth','1992',                            2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '2022 – present',                  2),
      h('c1',   'characteristic', 'Fun fact',     'Competed at Eurovision (2022)',   3),
      h('c2',   'characteristic', 'Fun fact',     'Won Melodifestivalen (2022)',     3),
      h('c3',   'characteristic', 'Fun fact',     'Placed in the Eurovision top five', 3),
      h('c4',   'characteristic', 'Known for',    'Heartfelt piano ballads',         4),
      h('sig',  'song',           'Signature',    '"Hold Me Closer" (2022)',         5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 8 (hip-hop, modern R&B, Euro-dance, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'kendrick-lamar': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Fun fact',     'Won a Pulitzer Prize for music',  1),
      h('bd',   'birth_date',     'Date of birth','June 17, 1987',                   2),
      h('bp',   'birth_place',    'Place of birth','Compton, California',            2),
      h('pk',   'peak_year',      'Career peak',  '2012 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Swimming Pools (Drank)" (2012)', 3),
      h('s2',   'song',           'Hit song',     '"i" (2014)',                      3),
      h('s3',   'song',           'Hit song',     '"Alright" (2015)',                3),
      h('s4',   'song',           'Hit song',     '"DNA." (2017)',                   3),
      h('alb',  'album',          'Iconic album', '"good kid, m.A.A.d city" (2012)', 4),
      h('sig',  'song',           'Signature',    '"HUMBLE." (2017)',                5),
    ],
  },

  'nicki-minaj': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Known for',    'Colourful wigs and alter egos',   1),
      h('bd',   'birth_date',     'Date of birth','December 8, 1982',                2),
      h('bp',   'birth_place',    'Place of birth','Born in Trinidad',              2),
      h('pk',   'peak_year',      'Career peak',  '2010 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Your Love" (2010)',              3),
      h('s2',   'song',           'Hit song',     '"Starships" (2012)',              3),
      h('s3',   'song',           'Hit song',     '"Anaconda" (2014)',               3),
      h('alb',  'album',          'Debut album',  '"Pink Friday" (2010)',            4),
      h('sig',  'song',           'Signature',    '"Super Bass" (2011)',             5),
    ],
  },

  'mc-hammer': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & dancer',                 1),
      h('f1',   'characteristic', 'Known for',    'Baggy "Hammer pants"',            1),
      h('bd',   'birth_date',     'Date of birth','March 30, 1962',                  2),
      h('bp',   'birth_place',    'Place of birth','Oakland, California',            2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 1992',                     2),
      h('s1',   'song',           'Hit song',     '"Have You Seen Her" (1990)',      3),
      h('s2',   'song',           'Hit song',     '"Pray" (1990)',                   3),
      h('s3',   'song',           'Hit song',     '"2 Legit 2 Quit" (1991)',         3),
      h('s4',   'song',           'Hit song',     '"Addams Groove" (1991)',          3),
      h('sig',  'song',           'Signature',    '"U Can\'t Touch This" (1990)',    5),
    ],
  },

  'll-cool-j': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & actor',                  1),
      h('f1',   'characteristic', 'Real name',    'Born James Todd Smith',           1),
      h('bd',   'birth_date',     'Date of birth','January 14, 1968',                2),
      h('bp',   'birth_place',    'Place of birth','Queens, New York',               2),
      h('pk',   'peak_year',      'Career peak',  '1987 – 1996',                     2),
      h('s1',   'song',           'Hit song',     '"I Need Love" (1987)',            3),
      h('s2',   'song',           'Hit song',     '"Going Back to Cali" (1988)',     3),
      h('s3',   'song',           'Hit song',     '"Around the Way Girl" (1990)',    3),
      h('s4',   'song',           'Hit song',     '"Doin\' It" (1996)',              3),
      h('sig',  'song',           'Signature',    '"Mama Said Knock You Out" (1990)', 5),
    ],
  },

  'outkast': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Hip-hop duo',                     1),
      h('f1',   'characteristic', 'Fun fact',     'Inventive Southern hip-hop',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Atlanta, 1992',         2),
      h('mem',  'band_member',    'Members',      'André 3000 & Big Boi',            2),
      h('pk',   'peak_year',      'Career peak',  '1998 – 2004',                     2),
      h('s1',   'song',           'Hit song',     '"Rosa Parks" (1998)',             3),
      h('s2',   'song',           'Hit song',     '"Ms. Jackson" (2000)',            3),
      h('s3',   'song',           'Hit song',     '"The Way You Move" (2003)',       3),
      h('s4',   'song',           'Hit song',     '"Roses" (2004)',                  3),
      h('alb',  'album',          'Iconic album', '"Stankonia" (2000)',              4),
      h('sig',  'song',           'Signature',    '"Hey Ya!" (2003)',                5),
    ],
  },

  'fugees': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Hip-hop group',                   1),
      h('f1',   'characteristic', 'Fun fact',     'Launched Lauryn Hill\'s career',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in New Jersey, 1992',      2),
      h('mem',  'band_member',    'Members',      'Lauryn Hill, Wyclef & Pras',      2),
      h('pk',   'peak_year',      'Career peak',  '1996 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Fu-Gee-La" (1996)',              3),
      h('s2',   'song',           'Hit song',     '"Ready or Not" (1996)',           3),
      h('s3',   'song',           'Hit song',     '"No Woman, No Cry" (1996)',       3),
      h('alb',  'album',          'Iconic album', '"The Score" (1996)',              4),
      h('sig',  'song',           'Signature',    '"Killing Me Softly" (1996)',      5),
    ],
  },

  'lauryn-hill': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & soul singer',            1),
      h('f1',   'characteristic', 'Early career', 'Rose to fame with the Fugees',    1),
      h('bd',   'birth_date',     'Date of birth','May 26, 1975',                    2),
      h('bp',   'birth_place',    'Place of birth','South Orange, New Jersey',       2),
      h('pk',   'peak_year',      'Career peak',  '1998 – 1999',                     2),
      h('s1',   'song',           'Hit song',     '"Ex-Factor" (1998)',              3),
      h('s2',   'song',           'Hit song',     '"Everything Is Everything" (1998)', 3),
      h('s3',   'song',           'Hit song',     '"To Zion" (1998)',                3),
      h('alb',  'album',          'Iconic album', '"The Miseducation of Lauryn Hill" (1998)', 4),
      h('sig',  'song',           'Signature',    '"Doo Wop (That Thing)" (1998)',   5),
    ],
  },

  'coolio': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Known for',    'Distinctive braided hairstyle',   1),
      h('bd',   'birth_date',     'Date of birth','August 1, 1963',                  2),
      h('bp',   'birth_place',    'Place of birth','Compton, California',            2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Fantastic Voyage" (1994)',       3),
      h('s2',   'song',           'Hit song',     '"1, 2, 3, 4 (Sumpin\' New)" (1996)', 3),
      h('s3',   'song',           'Hit song',     '"C U When U Get There" (1997)',   3),
      h('film', 'characteristic', 'Film link',    'His hit featured in "Dangerous Minds"', 4),
      h('sig',  'song',           'Signature',    '"Gangsta\'s Paradise" (1995)',    5),
    ],
  },

  'sir-mix-a-lot': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper',                          1),
      h('f1',   'characteristic', 'Fun fact',     'Known for one giant novelty hit', 1),
      h('bd',   'birth_date',     'Date of birth','August 12, 1963',                 2),
      h('bp',   'birth_place',    'Place of birth','Seattle, Washington',            2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1992',                     2),
      h('s1',   'song',           'Hit song',     '"Posse on Broadway" (1988)',      3),
      h('s2',   'song',           'Hit song',     '"Beepers" (1989)',                3),
      h('c1',   'characteristic', 'Fun fact',     'Won a Grammy for his big hit',    3),
      h('c2',   'characteristic', 'Known for',    'Bouncy, comedic hip-hop',         4),
      h('sig',  'song',           'Signature',    '"Baby Got Back" (1992)',          5),
    ],
  },

  'mary-j-blige': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B & soul singer',               1),
      h('f1',   'characteristic', 'Known as',     '"Queen of Hip-Hop Soul"',         1),
      h('bd',   'birth_date',     'Date of birth','January 11, 1971',                2),
      h('bp',   'birth_place',    'Place of birth','The Bronx, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '1992 – 2007',                     2),
      h('s1',   'song',           'Hit song',     '"Real Love" (1992)',              3),
      h('s2',   'song',           'Hit song',     '"Not Gon\' Cry" (1996)',          3),
      h('s3',   'song',           'Hit song',     '"Be Without You" (2005)',         3),
      h('alb',  'album',          'Iconic album', '"My Life" (1994)',                4),
      h('sig',  'song',           'Signature',    '"Family Affair" (2001)',          5),
    ],
  },

  'post-malone': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & singer',                 1),
      h('f1',   'characteristic', 'Known for',    'Face and hand tattoos',           1),
      h('bd',   'birth_date',     'Date of birth','July 4, 1995',                    2),
      h('bp',   'birth_place',    'Place of birth','Syracuse, New York',             2),
      h('pk',   'peak_year',      'Career peak',  '2016 – present',                  2),
      h('s1',   'song',           'Hit song',     '"White Iverson" (2015)',          3),
      h('s2',   'song',           'Hit song',     '"Congratulations" (2016)',        3),
      h('s3',   'song',           'Hit song',     '"Psycho" (2018)',                 3),
      h('s4',   'song',           'Hit song',     '"Sunflower" (2018)',              3),
      h('s5',   'song',           'Hit song',     '"Circles" (2019)',                4),
      h('sig',  'song',           'Signature',    '"Rockstar" (2017)',               5),
    ],
  },

  'doja-cat': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & pop singer',             1),
      h('f1',   'characteristic', 'Early career', 'Went viral with a silly song',    1),
      h('bd',   'birth_date',     'Date of birth','October 21, 1995',                2),
      h('bp',   'birth_place',    'Place of birth','Los Angeles',                    2),
      h('pk',   'peak_year',      'Career peak',  '2019 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Juicy" (2019)',                  3),
      h('s2',   'song',           'Hit song',     '"Kiss Me More" (2021)',           3),
      h('s3',   'song',           'Hit song',     '"Woman" (2021)',                  3),
      h('s4',   'song',           'Hit song',     '"Paint the Town Red" (2023)',     3),
      h('sig',  'song',           'Signature',    '"Say So" (2019)',                 5),
    ],
  },

  'sza': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B singer-songwriter',           1),
      h('f1',   'characteristic', 'Real name',    'Born Solána Rowe',                1),
      h('bd',   'birth_date',     'Date of birth','November 8, 1989',                2),
      h('bp',   'birth_place',    'Place of birth','St. Louis, Missouri',            2),
      h('pk',   'peak_year',      'Career peak',  '2017 – present',                  2),
      h('s1',   'song',           'Hit song',     '"The Weekend" (2017)',            3),
      h('s2',   'song',           'Hit song',     '"Broken Clocks" (2017)',          3),
      h('s3',   'song',           'Hit song',     '"Good Days" (2020)',              3),
      h('s4',   'song',           'Hit song',     '"Snooze" (2022)',                 3),
      h('alb',  'album',          'Iconic album', '"SOS" (2022)',                    4),
      h('sig',  'song',           'Signature',    '"Kill Bill" (2022)',              5),
    ],
  },

  'drake': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & singer',                 1),
      h('f1',   'characteristic', 'Early career', 'Started as a teen TV actor',      1),
      h('bd',   'birth_date',     'Date of birth','October 24, 1986',                2),
      h('bp',   'birth_place',    'Place of birth','Toronto',                        2),
      h('pk',   'peak_year',      'Career peak',  '2011 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Best I Ever Had" (2009)',        3),
      h('s2',   'song',           'Hit song',     '"Hotline Bling" (2015)',          3),
      h('s3',   'song',           'Hit song',     '"One Dance" (2016)',              3),
      h('s4',   'song',           'Hit song',     '"In My Feelings" (2018)',         3),
      h('alb',  'album',          'Iconic album', '"Take Care" (2011)',              4),
      h('sig',  'song',           'Signature',    '"God\'s Plan" (2018)',            5),
    ],
  },

  'john-legend': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & R&B singer, pianist',      1),
      h('f1',   'characteristic', 'Fun fact',     'An EGOT award winner',            1),
      h('bd',   'birth_date',     'Date of birth','December 28, 1978',               2),
      h('bp',   'birth_place',    'Place of birth','Springfield, Ohio',              2),
      h('pk',   'peak_year',      'Career peak',  '2004 – 2016',                     2),
      h('s1',   'song',           'Hit song',     '"Ordinary People" (2004)',        3),
      h('s2',   'song',           'Hit song',     '"Green Light" (2008)',            3),
      h('s3',   'song',           'Hit song',     '"Love Me Now" (2016)',            3),
      h('alb',  'album',          'Debut album',  '"Get Lifted" (2004)',             4),
      h('sig',  'song',           'Signature',    '"All of Me" (2013)',              5),
    ],
  },

  'ne-yo': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B singer & songwriter',         1),
      h('f1',   'characteristic', 'Fun fact',     'Wrote hits for many other stars', 1),
      h('bd',   'birth_date',     'Date of birth','October 18, 1979',                2),
      h('bp',   'birth_place',    'Place of birth','Camden, Arkansas',               2),
      h('pk',   'peak_year',      'Career peak',  '2006 – 2012',                     2),
      h('s1',   'song',           'Hit song',     '"Sexy Love" (2006)',              3),
      h('s2',   'song',           'Hit song',     '"Because of You" (2007)',         3),
      h('s3',   'song',           'Hit song',     '"Closer" (2008)',                 3),
      h('s4',   'song',           'Hit song',     '"Miss Independent" (2008)',       3),
      h('sig',  'song',           'Signature',    '"So Sick" (2006)',                5),
    ],
  },

  'jason-derulo': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Fun fact',     'Often sings his own name',        1),
      h('bd',   'birth_date',     'Date of birth','September 21, 1989',              2),
      h('bp',   'birth_place',    'Place of birth','Miami, Florida',                 2),
      h('pk',   'peak_year',      'Career peak',  '2009 – 2015',                     2),
      h('s1',   'song',           'Hit song',     '"Whatcha Say" (2009)',            3),
      h('s2',   'song',           'Hit song',     '"In My Head" (2010)',             3),
      h('s3',   'song',           'Hit song',     '"Wiggle" (2014)',                 3),
      h('s4',   'song',           'Hit song',     '"Want to Want Me" (2015)',        3),
      h('sig',  'song',           'Signature',    '"Talk Dirty" (2013)',             5),
    ],
  },

  'alicia-keys': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'R&B singer & pianist',            1),
      h('f1',   'characteristic', 'Known for',    'Soulful piano-driven songs',      1),
      h('bd',   'birth_date',     'Date of birth','January 25, 1981',                2),
      h('bp',   'birth_place',    'Place of birth','Manhattan, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '2001 – 2012',                     2),
      h('s1',   'song',           'Hit song',     '"Fallin\'" (2001)',               3),
      h('s2',   'song',           'Hit song',     '"If I Ain\'t Got You" (2003)',    3),
      h('s3',   'song',           'Hit song',     '"Empire State of Mind" (2009)',   3),
      h('s4',   'song',           'Hit song',     '"Girl on Fire" (2012)',           3),
      h('alb',  'album',          'Debut album',  '"Songs in A Minor" (2001)',       4),
      h('sig',  'song',           'Signature',    '"No One" (2007)',                 5),
    ],
  },

  'camila-cabello': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Former member of Fifth Harmony',  1),
      h('bd',   'birth_date',     'Date of birth','March 3, 1997',                   2),
      h('bp',   'birth_place',    'Place of birth','Havana',                         2),
      h('pk',   'peak_year',      'Career peak',  '2017 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Never Be the Same" (2018)',      3),
      h('s2',   'song',           'Hit song',     '"Señorita" (2019)',               3),
      h('s3',   'song',           'Hit song',     '"My Oh My" (2019)',               3),
      h('s4',   'song',           'Hit song',     '"Don\'t Go Yet" (2021)',          3),
      h('s5',   'song',           'Hit song',     '"Bam Bam" (2022)',                3),
      h('sig',  'song',           'Signature',    '"Havana" (2017)',                 5),
    ],
  },

  'shawn-mendes': {
    categoryLabel: 'Musikartist',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Early career', 'Discovered via Vine videos',      1),
      h('bd',   'birth_date',     'Date of birth','August 8, 1998',                  2),
      h('bp',   'birth_place',    'Place of birth','Toronto',                        2),
      h('pk',   'peak_year',      'Career peak',  '2015 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Treat You Better" (2016)',       3),
      h('s2',   'song',           'Hit song',     '"Mercy" (2016)',                  3),
      h('s3',   'song',           'Hit song',     '"There\'s Nothing Holdin\' Me Back" (2017)', 3),
      h('s4',   'song',           'Hit song',     '"Señorita" (2019)',               3),
      h('sig',  'song',           'Signature',    '"Stitches" (2015)',               5),
    ],
  },

  'harry-styles': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer & actor',              1),
      h('f1',   'characteristic', 'Early career', 'Former member of One Direction',  1),
      h('bd',   'birth_date',     'Date of birth','February 1, 1994',                2),
      h('bp',   'birth_place',    'Place of birth','Redditch',                       2),
      h('pk',   'peak_year',      'Career peak',  '2017 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Sign of the Times" (2017)',      3),
      h('s2',   'song',           'Hit song',     '"Adore You" (2019)',              3),
      h('s3',   'song',           'Hit song',     '"Watermelon Sugar" (2020)',       3),
      h('alb',  'album',          'Iconic album', '"Fine Line" (2019)',              4),
      h('sig',  'song',           'Signature',    '"As It Was" (2022)',              5),
    ],
  },

  'lil-nas-x': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rapper & pop singer',             1),
      h('f1',   'characteristic', 'Early career', 'Broke through with a viral meme', 1),
      h('bd',   'birth_date',     'Date of birth','April 9, 1999',                   2),
      h('bp',   'birth_place',    'Place of birth','Atlanta, Georgia',               2),
      h('pk',   'peak_year',      'Career peak',  '2019 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Panini" (2019)',                 3),
      h('s2',   'song',           'Hit song',     '"Rodeo" (2020)',                  3),
      h('s3',   'song',           'Hit song',     '"Montero (Call Me by Your Name)" (2021)', 3),
      h('s4',   'song',           'Hit song',     '"Industry Baby" (2021)',          3),
      h('sig',  'song',           'Signature',    '"Old Town Road" (2019)',          5),
    ],
  },

  'janet-jackson': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Fun fact',     'Youngest of the Jackson family',  1),
      h('bd',   'birth_date',     'Date of birth','May 16, 1966',                    2),
      h('bp',   'birth_place',    'Place of birth','Gary, Indiana',                  2),
      h('pk',   'peak_year',      'Career peak',  '1986 – 2001',                     2),
      h('s1',   'song',           'Hit song',     '"Nasty" (1986)',                  3),
      h('s2',   'song',           'Hit song',     '"Miss You Much" (1989)',          3),
      h('s3',   'song',           'Hit song',     '"That\'s the Way Love Goes" (1993)', 3),
      h('s4',   'song',           'Hit song',     '"All for You" (2001)',            3),
      h('alb',  'album',          'Iconic album', '"Control" (1986)',                4),
      h('sig',  'song',           'Signature',    '"Rhythm Nation" (1989)',          5),
    ],
  },

  'paula-abdul': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer & choreographer',      1),
      h('f1',   'characteristic', 'Fun fact',     'Later a talent-show judge',       1),
      h('bd',   'birth_date',     'Date of birth','June 19, 1962',                   2),
      h('bp',   'birth_place',    'Place of birth','San Fernando, California',       2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1991',                     2),
      h('s1',   'song',           'Hit song',     '"Forever Your Girl" (1989)',      3),
      h('s2',   'song',           'Hit song',     '"Cold Hearted" (1989)',           3),
      h('s3',   'song',           'Hit song',     '"Opposites Attract" (1989)',      3),
      h('s4',   'song',           'Hit song',     '"Rush Rush" (1991)',              3),
      h('sig',  'song',           'Signature',    '"Straight Up" (1988)',            5),
    ],
  },

  'gloria-estefan': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & Latin singer',              1),
      h('f1',   'characteristic', 'Early career', 'Fronted Miami Sound Machine',     1),
      h('bd',   'birth_date',     'Date of birth','September 1, 1957',               2),
      h('bp',   'birth_place',    'Place of birth','Havana',                         2),
      h('pk',   'peak_year',      'Career peak',  '1985 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Rhythm Is Gonna Get You" (1987)', 3),
      h('s2',   'song',           'Hit song',     '"Anything for You" (1988)',       3),
      h('s3',   'song',           'Hit song',     '"Don\'t Wanna Lose You" (1989)',  3),
      h('s4',   'song',           'Hit song',     '"Coming Out of the Dark" (1991)', 3),
      h('sig',  'song',           'Signature',    '"Conga" (1985)',                  5),
    ],
  },

  'belinda-carlisle': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Former singer of the Go-Go\'s',   1),
      h('bd',   'birth_date',     'Date of birth','August 17, 1958',                 2),
      h('bp',   'birth_place',    'Place of birth','Hollywood, California',          2),
      h('pk',   'peak_year',      'Career peak',  '1986 – 1990',                     2),
      h('s1',   'song',           'Hit song',     '"Mad About You" (1986)',          3),
      h('s2',   'song',           'Hit song',     '"I Get Weak" (1988)',             3),
      h('s3',   'song',           'Hit song',     '"Circle in the Sand" (1988)',     3),
      h('s4',   'song',           'Hit song',     '"Leave a Light On" (1989)',       3),
      h('sig',  'song',           'Signature',    '"Heaven Is a Place on Earth" (1987)', 5),
    ],
  },

  'modern-talking': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Euro-disco duo',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Falsetto-heavy 80s Euro-pop',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1984',                  2),
      h('mem',  'band_member',    'Members',      'Dieter Bohlen & Thomas Anders',   2),
      h('pk',   'peak_year',      'Career peak',  '1984 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"You Can Win If You Want" (1985)', 3),
      h('s2',   'song',           'Hit song',     '"Cheri, Cheri Lady" (1985)',      3),
      h('s3',   'song',           'Hit song',     '"Brother Louie" (1986)',          3),
      h('s4',   'song',           'Hit song',     '"Atlantis Is Calling" (1986)',    3),
      h('sig',  'song',           'Signature',    '"You\'re My Heart, You\'re My Soul" (1984)', 5),
    ],
  },

  'milli-vanilli': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop duo',                         1),
      h('f1',   'characteristic', 'Fun fact',     'Famous lip-sync controversy',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1988',                  2),
      h('mem',  'band_member',    'Members',      'Rob Pilatus & Fab Morvan',        2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1990',                     2),
      h('s1',   'song',           'Hit song',     '"Baby Don\'t Forget My Number" (1989)', 3),
      h('s2',   'song',           'Hit song',     '"Blame It on the Rain" (1989)',   3),
      h('s3',   'song',           'Hit song',     '"Girl I\'m Gonna Miss You" (1989)', 3),
      h('s4',   'song',           'Hit song',     '"All or Nothing" (1990)',         3),
      h('c1',   'characteristic', 'Fun fact',     'Grammy revoked over the lip-sync', 4),
      h('sig',  'song',           'Signature',    '"Girl You Know It\'s True" (1988)', 5),
    ],
  },

  'snap': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance group',                 1),
      h('f1',   'characteristic', 'Fun fact',     'Rap-and-diva dance-pop sound',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1989',                  2),
      h('mem',  'characteristic', 'Members',      'Featured rapper Turbo B',         2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 1992',                     2),
      h('s1',   'song',           'Hit song',     '"The Power" (1990)',              3),
      h('s2',   'song',           'Hit song',     '"Ooops Up" (1990)',               3),
      h('s3',   'song',           'Hit song',     '"Mary Had a Little Boy" (1990)',  3),
      h('s4',   'song',           'Hit song',     '"Exterminate" (1993)',            3),
      h('s5',   'song',           'Hit song',     '"Do You See the Light" (1993)',   3),
      h('sig',  'song',           'Signature',    '"Rhythm Is a Dancer" (1992)',     5),
    ],
  },

  'haddaway': {
    categoryLabel: 'Musikartist',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance artist',                1),
      h('f1',   'characteristic', 'Fun fact',     'One of the 90s biggest dance hits', 1),
      h('bd',   'birth_date',     'Date of birth','January 9, 1965',                 2),
      h('bp',   'birth_place',    'Place of birth','Based in Cologne',               2),
      h('pk',   'peak_year',      'Career peak',  '1993 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Life" (1993)',                   3),
      h('s2',   'song',           'Hit song',     '"I Miss You" (1993)',             3),
      h('s3',   'song',           'Hit song',     '"Rock My Heart" (1994)',          3),
      h('s4',   'song',           'Hit song',     '"Fly Away" (1995)',               3),
      h('s5',   'song',           'Hit song',     '"Catch a Fire" (1995)',           3),
      h('sig',  'song',           'Signature',    '"What Is Love" (1993)',           5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 9 (classic rock, 90s dance, legends, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'the-who': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Known for',    'Smashing instruments on stage',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1964',          2),
      h('mem',  'band_member',    'Members',      'Roger Daltrey & Pete Townshend',  2),
      h('pk',   'peak_year',      'Career peak',  '1965 – 1978',                     2),
      h('s1',   'song',           'Hit song',     '"My Generation" (1965)',          3),
      h('s2',   'song',           'Hit song',     '"Pinball Wizard" (1969)',         3),
      h('s3',   'song',           'Hit song',     '"Won\'t Get Fooled Again" (1971)', 3),
      h('s4',   'song',           'Hit song',     '"Who Are You" (1978)',            3),
      h('alb',  'album',          'Iconic album', '"Who\'s Next" (1971)',            4),
      h('sig',  'song',           'Signature',    '"Baba O\'Riley" (1971)',          5),
    ],
  },

  'the-b-52s': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'New-wave party band',             1),
      h('f1',   'characteristic', 'Known for',    'Retro beehive hairdos',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in Athens, 1976',          2),
      h('pk',   'peak_year',      'Career peak',  '1978 – 1990',                     2),
      h('s1',   'song',           'Hit song',     '"Rock Lobster" (1978)',           3),
      h('s2',   'song',           'Hit song',     '"Planet Claire" (1978)',          3),
      h('s3',   'song',           'Hit song',     '"Private Idaho" (1980)',          3),
      h('s4',   'song',           'Hit song',     '"Roam" (1989)',                   3),
      h('c1',   'characteristic', 'Fun fact',     'Quirky, campy dance-rock',        4),
      h('sig',  'song',           'Signature',    '"Love Shack" (1989)',             5),
    ],
  },

  'talk-talk': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Synth-pop band',                  1),
      h('f1',   'characteristic', 'Fun fact',     'Later pioneered post-rock',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1981',          2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Mark Hollis',          2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1988',                     2),
      h('s1',   'song',           'Hit song',     '"Such a Shame" (1984)',           3),
      h('s2',   'song',           'Hit song',     '"Life\'s What You Make It" (1986)', 3),
      h('s3',   'song',           'Hit song',     '"Living in Another World" (1986)', 3),
      h('c1',   'characteristic', 'Known for',    'Moody, atmospheric sound',        4),
      h('sig',  'song',           'Signature',    '"It\'s My Life" (1984)',          5),
    ],
  },

  'starship': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Grew out of Jefferson Starship',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in San Francisco, 1984',   2),
      h('mem',  'lead_singer',    'Members',      'Included Grace Slick',            2),
      h('pk',   'peak_year',      'Career peak',  '1985 – 1989',                     2),
      h('s1',   'song',           'Hit song',     '"We Built This City" (1985)',     3),
      h('s2',   'song',           'Hit song',     '"Sara" (1986)',                   3),
      h('s3',   'song',           'Hit song',     '"It\'s Not Over" (1987)',         3),
      h('film', 'characteristic', 'Film link',    'Hit theme from "Mannequin" (1987)', 4),
      h('sig',  'song',           'Signature',    '"Nothing\'s Gonna Stop Us Now" (1987)', 5),
    ],
  },

  'spin-doctors': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Jam-band funk-rock groove',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 1988',        2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Chris Barron',         2),
      h('pk',   'peak_year',      'Career peak',  '1991 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Little Miss Can\'t Be Wrong" (1991)', 3),
      h('s2',   'song',           'Hit song',     '"Jimmy Olsen\'s Blues" (1992)',   3),
      h('s3',   'song',           'Hit song',     '"Cleopatra\'s Cat" (1994)',       3),
      h('alb',  'album',          'Iconic album', '"Pocket Full of Kryptonite" (1991)', 4),
      h('sig',  'song',           'Signature',    '"Two Princes" (1992)',            5),
    ],
  },

  'gnarls-barkley': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & hip-hop duo',              1),
      h('f1',   'characteristic', 'Members',      'CeeLo Green & Danger Mouse',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in 2003',                  2),
      h('pk',   'peak_year',      'Career peak',  '2006 – 2008',                     2),
      h('s1',   'song',           'Hit song',     '"Smiley Faces" (2006)',           3),
      h('s2',   'song',           'Hit song',     '"Who\'s Gonna Save My Soul" (2008)', 3),
      h('s3',   'song',           'Hit song',     '"Run" (2008)',                    3),
      h('alb',  'album',          'Debut album',  '"St. Elsewhere" (2006)',          4),
      h('c1',   'characteristic', 'Fun fact',     'Known for theatrical costumes',   4),
      h('sig',  'song',           'Signature',    '"Crazy" (2006)',                  5),
    ],
  },

  'steppenwolf': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Coined the term "heavy metal thunder"', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1967',     2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by John Kay',             2),
      h('pk',   'peak_year',      'Career peak',  '1968 – 1971',                     2),
      h('s1',   'song',           'Hit song',     '"Magic Carpet Ride" (1968)',      3),
      h('s2',   'song',           'Hit song',     '"The Pusher" (1968)',             3),
      h('s3',   'song',           'Hit song',     '"Rock Me" (1969)',                3),
      h('film', 'characteristic', 'Film link',    'Anthem of the film "Easy Rider"', 4),
      h('sig',  'song',           'Signature',    '"Born to Be Wild" (1968)',        5),
    ],
  },

  'mr-big': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Virtuoso hard-rock playing',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in Los Angeles, 1988',     2),
      h('mem',  'band_member',    'Members',      'Eric Martin & Paul Gilbert',      2),
      h('pk',   'peak_year',      'Career peak',  '1991 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"Green-Tinted Sixties Mind" (1991)', 3),
      h('s2',   'song',           'Hit song',     '"Just Take My Heart" (1992)',     3),
      h('s3',   'song',           'Hit song',     '"Wild World" (1993)',             3),
      h('c1',   'characteristic', 'Known for',    'Blistering guitar-and-bass solos', 4),
      h('sig',  'song',           'Signature',    '"To Be with You" (1991)',         5),
    ],
  },

  'glass-animals': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Indie-pop band',                  1),
      h('f1',   'characteristic', 'Known for',    'Woozy psychedelic pop',           1),
      h('cy',   'creation_year',  'Formed',       'Formed in Oxford, 2010',          2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Dave Bayley',          2),
      h('pk',   'peak_year',      'Career peak',  '2016 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Gooey" (2014)',                  3),
      h('s2',   'song',           'Hit song',     '"Youth" (2016)',                  3),
      h('s3',   'song',           'Hit song',     '"Life Itself" (2016)',            3),
      h('alb',  'album',          'Iconic album', '"Dreamland" (2020)',              4),
      h('sig',  'song',           'Signature',    '"Heat Waves" (2020)',             5),
    ],
  },

  'the-chainsmokers': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'EDM-pop duo',                     1),
      h('f1',   'characteristic', 'Members',      'Andrew Taggart & Alex Pall',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 2012',        2),
      h('pk',   'peak_year',      'Career peak',  '2015 – 2018',                     2),
      h('s1',   'song',           'Hit song',     '"#Selfie" (2014)',                3),
      h('s2',   'song',           'Hit song',     '"Roses" (2015)',                  3),
      h('s3',   'song',           'Hit song',     '"Don\'t Let Me Down" (2016)',     3),
      h('s4',   'song',           'Hit song',     '"Something Just Like This" (2017)', 3),
      h('s5',   'song',           'Hit song',     '"Paris" (2017)',                  3),
      h('sig',  'song',           'Signature',    '"Closer" (2016)',                 5),
    ],
  },

  'gotye': {
    categoryLabel: 'Musikartist',
    nationality: 'australia',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer-songwriter',           1),
      h('f1',   'characteristic', 'Real name',    'Born Wouter De Backer',           1),
      h('bd',   'birth_date',     'Date of birth','May 21, 1980',                    2),
      h('bp',   'birth_place',    'Place of birth','Born in Bruges',                 2),
      h('pk',   'peak_year',      'Career peak',  '2011 – 2012',                     2),
      h('s1',   'song',           'Hit song',     '"Hearts a Mess" (2006)',          3),
      h('s2',   'song',           'Hit song',     '"Eyes Wide Open" (2011)',         3),
      h('alb',  'album',          'Iconic album', '"Making Mirrors" (2011)',         4),
      h('c1',   'characteristic', 'Fun fact',     'Built songs from quirky samples', 4),
      h('sig',  'song',           'Signature',    '"Somebody That I Used to Know" (2011)', 5),
    ],
  },

  'ava-max': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Known for',    'Bold, belted dance-pop',          1),
      h('bd',   'birth_date',     'Date of birth','February 16, 1994',               2),
      h('bp',   'birth_place',    'Place of birth','Milwaukee, Wisconsin',           2),
      h('pk',   'peak_year',      'Career peak',  '2018 – present',                  2),
      h('s1',   'song',           'Hit song',     '"So Am I" (2019)',                3),
      h('s2',   'song',           'Hit song',     '"Kings & Queens" (2020)',         3),
      h('s3',   'song',           'Hit song',     '"My Head & My Heart" (2020)',     3),
      h('c1',   'characteristic', 'Known for',    'A signature asymmetric haircut',  4),
      h('sig',  'song',           'Signature',    '"Sweet but Psycho" (2018)',       5),
    ],
  },

  'sabrina-carpenter': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'A former Disney Channel star',    1),
      h('bd',   'birth_date',     'Date of birth','May 11, 1999',                    2),
      h('bp',   'birth_place',    'Place of birth','Lehigh Valley, Pennsylvania',    2),
      h('pk',   'peak_year',      'Career peak',  '2022 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Nonsense" (2022)',               3),
      h('s2',   'song',           'Hit song',     '"Feather" (2023)',                3),
      h('s3',   'song',           'Hit song',     '"Please Please Please" (2024)',   3),
      h('s4',   'song',           'Hit song',     '"Taste" (2024)',                  3),
      h('sig',  'song',           'Signature',    '"Espresso" (2024)',               5),
    ],
  },

  'lou-bega': {
    categoryLabel: 'Musikartist',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Fun fact',     'Sparked a 90s mambo revival',     1),
      h('bd',   'birth_date',     'Date of birth','April 13, 1975',                  2),
      h('bp',   'birth_place',    'Place of birth','Munich',                         2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"I Got a Girl" (1999)',           3),
      h('c1',   'characteristic', 'Fun fact',     'Sampled a 1950s Pérez Prado mambo', 3),
      h('c2',   'characteristic', 'Fun fact',     'A one-hit-wonder of 1999',        3),
      h('c3',   'characteristic', 'Known for',    'Retro suits and trumpets',        4),
      h('sig',  'song',           'Signature',    '"Mambo No. 5 (A Little Bit Of...)" (1999)', 5),
    ],
  },

  'dj-otzi': {
    categoryLabel: 'Musikartist',
    nationality: 'austria',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & party singer',              1),
      h('f1',   'characteristic', 'Known for',    'Après-ski party anthems',         1),
      h('bd',   'birth_date',     'Date of birth','January 7, 1971',                 2),
      h('bp',   'birth_place',    'Place of birth','St. Johann in Tirol',            2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2001',                     2),
      h('s1',   'song',           'Hit song',     '"Anton aus Tirol" (1999)',        3),
      h('s2',   'song',           'Hit song',     '"Burger Dance" (2001)',           3),
      h('c1',   'characteristic', 'Known for',    'Bald head and goatee look',       3),
      h('c2',   'characteristic', 'Fun fact',     'A yodel-tinged party performer',  4),
      h('sig',  'song',           'Signature',    '"Hey Baby (Uhh, Ahh)" (2000)',    5),
    ],
  },

  'eiffel-65': {
    categoryLabel: 'Band',
    nationality: 'italy',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance group',                 1),
      h('f1',   'characteristic', 'Known for',    'Robotic auto-tuned vocals',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in Turin, 1998',           2),
      h('mem',  'band_member',    'Members',      'Included producer Gabry Ponte',   2),
      h('pk',   'peak_year',      'Career peak',  '1999 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Move Your Body" (1999)',         3),
      h('s2',   'song',           'Hit song',     '"Too Much of Heaven" (2000)',     3),
      h('c1',   'characteristic', 'Fun fact',     'Bouncy late-90s Europop',         3),
      h('c2',   'characteristic', 'Fun fact',     'Formed by Bliss Corporation',     4),
      h('sig',  'song',           'Signature',    '"Blue (Da Ba Dee)" (1999)',       5),
    ],
  },

  'la-bouche': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance duo',                   1),
      h('f1',   'characteristic', 'Members',      'Voiced by Melanie Thornton',      1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1994',                  2),
      h('pk',   'peak_year',      'Career peak',  '1994 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Sweet Dreams" (1994)',           3),
      h('s2',   'song',           'Hit song',     '"Fallin\' in Love" (1995)',       3),
      h('s3',   'song',           'Hit song',     '"You Won\'t Forget Me" (1997)',   3),
      h('c1',   'characteristic', 'Known for',    'Rap-and-soul dance-pop',          4),
      h('c2',   'characteristic', 'Fun fact',     'Huge across Europe and the US',   4),
      h('sig',  'song',           'Signature',    '"Be My Lover" (1995)',            5),
    ],
  },

  'no-mercy': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof', 'profession',     'Profession',   'Latin-pop trio',                  1),
      h('f1',   'characteristic', 'Known for',    'Smooth Latin-flavoured dance-pop', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1996',                  2),
      h('pk',   'peak_year',      'Career peak',  '1996 – 1998',                     2),
      h('s1',   'song',           'Hit song',     '"When I Die" (1996)',             3),
      h('s2',   'song',           'Hit song',     '"Where Do You Go" (1996)',        3),
      h('s3',   'song',           'Hit song',     '"Kiss You All Over" (1997)',      3),
      h('c1',   'characteristic', 'Fun fact',     'Created by producer Frank Farian', 4),
      h('c2',   'characteristic', 'Known for',    'Latin-flavoured boy band',        4),
      h('sig',  'song',           'Signature',    '"Please Don\'t Go" (1996)',       5),
    ],
  },

  'robert-miles': {
    categoryLabel: 'Musikartist',
    nationality: 'italy',
    hints: [
      h('prof', 'profession',     'Profession',   'DJ & producer',                   1),
      h('f1',   'characteristic', 'Known for',    'Pioneered the "dream trance" sound', 1),
      h('bd',   'birth_date',     'Date of birth','November 3, 1969',                2),
      h('bp',   'birth_place',    'Place of birth','Fleuriers',                      2),
      h('pk',   'peak_year',      'Career peak',  '1995 – 1997',                     2),
      h('s1',   'song',           'Hit song',     '"Fable" (1996)',                  3),
      h('s2',   'song',           'Hit song',     '"One and One" (1996)',            3),
      h('alb',  'album',          'Debut album',  '"Dreamland" (1996)',              4),
      h('c1',   'characteristic', 'Known for',    'Soothing piano-led dance tracks', 4),
      h('sig',  'song',           'Signature',    '"Children" (1995)',               5),
    ],
  },

  '2-unlimited': {
    categoryLabel: 'Band',
    nationality: 'netherlands',
    hints: [
      h('prof', 'profession',     'Profession',   'Eurodance duo',                   1),
      h('f1',   'characteristic', 'Members',      'Ray Slijngaard & Anita Doth',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1991',                  2),
      h('pk',   'peak_year',      'Career peak',  '1991 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Get Ready for This" (1991)',     3),
      h('s2',   'song',           'Hit song',     '"Twilight Zone" (1992)',          3),
      h('s3',   'song',           'Hit song',     '"Tribal Dance" (1993)',           3),
      h('s4',   'song',           'Hit song',     '"Let the Beat Control Your Body" (1994)', 3),
      h('c1',   'characteristic', 'Known for',    'Rave anthems with rap verses',    4),
      h('sig',  'song',           'Signature',    '"No Limit" (1993)',               5),
    ],
  },

  'londonbeat': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & dance group',               1),
      h('f1',   'characteristic', 'Known for',    'Soulful early-90s dance-pop',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1988',          2),
      h('pk',   'peak_year',      'Career peak',  '1990 – 1993',                     2),
      h('s1',   'song',           'Hit song',     '"A Better Love" (1990)',          3),
      h('s2',   'song',           'Hit song',     '"You Bring On the Sun" (1992)',   3),
      h('c1',   'characteristic', 'Fun fact',     'Multinational vocal harmony group', 3),
      h('c2',   'characteristic', 'Fun fact',     'Best known for one worldwide hit', 4),
      h('c3',   'characteristic', 'Known for',    'Soulful vocal harmonies',         4),
      h('sig',  'song',           'Signature',    '"I\'ve Been Thinking About You" (1990)', 5),
    ],
  },

  'dnce': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-funk band',                   1),
      h('f1',   'characteristic', 'Members',      'Fronted by Joe Jonas',            1),
      h('cy',   'creation_year',  'Formed',       'Formed in 2015',                  2),
      h('pk',   'peak_year',      'Career peak',  '2015 – 2017',                     2),
      h('s1',   'song',           'Hit song',     '"Toothbrush" (2016)',             3),
      h('s2',   'song',           'Hit song',     '"Body Moves" (2016)',             3),
      h('s3',   'song',           'Hit song',     '"Kissing Strangers" (2017)',      3),
      h('c1',   'characteristic', 'Known for',    'Playful, funky party-pop',        4),
      h('c2',   'characteristic', 'Fun fact',     'A disco-funk revival act',        4),
      h('sig',  'song',           'Signature',    '"Cake by the Ocean" (2015)',      5),
    ],
  },

  'louis-armstrong': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Jazz trumpeter & singer',         1),
      h('f1',   'characteristic', 'Nickname',     'Nicknamed "Satchmo"',             1),
      h('bd',   'birth_date',     'Date of birth','August 4, 1901',                  2),
      h('bp',   'birth_place',    'Place of birth','New Orleans, Louisiana',         2),
      h('pk',   'peak_year',      'Career peak',  '1926 – 1968',                     2),
      h('s1',   'song',           'Hit song',     '"La Vie en Rose" (1950)',         3),
      h('s2',   'song',           'Hit song',     '"Mack the Knife" (1956)',         3),
      h('s3',   'song',           'Hit song',     '"Hello, Dolly!" (1964)',          3),
      h('inst', 'characteristic', 'Instrument',   'Gravelly voice and trumpet',      4),
      h('sig',  'song',           'Signature',    '"What a Wonderful World" (1967)', 5),
    ],
  },

  'carole-king': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer-songwriter & pianist',     1),
      h('f1',   'characteristic', 'Fun fact',     'Wrote hits for many 60s stars',   1),
      h('bd',   'birth_date',     'Date of birth','February 9, 1942',                2),
      h('bp',   'birth_place',    'Place of birth','Manhattan, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '1971 – 1975',                     2),
      h('s1',   'song',           'Hit song',     '"I Feel the Earth Move" (1971)',  3),
      h('s2',   'song',           'Hit song',     '"So Far Away" (1971)',            3),
      h('s3',   'song',           'Hit song',     '"You\'ve Got a Friend" (1971)',   3),
      h('alb',  'album',          'Iconic album', '"Tapestry" (1971)',               4),
      h('sig',  'song',           'Signature',    '"It\'s Too Late" (1971)',         5),
    ],
  },

  'patsy-cline': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Country singer',                  1),
      h('f1',   'characteristic', 'Known for',    'Rich, emotive country voice',     1),
      h('bd',   'birth_date',     'Date of birth','September 8, 1932',               2),
      h('bp',   'birth_place',    'Place of birth','Winchester, Virginia',           2),
      h('pk',   'peak_year',      'Career peak',  '1957 – 1963',                     2),
      h('s1',   'song',           'Hit song',     '"Walkin\' After Midnight" (1957)', 3),
      h('s2',   'song',           'Hit song',     '"I Fall to Pieces" (1961)',       3),
      h('s3',   'song',           'Hit song',     '"She\'s Got You" (1962)',         3),
      h('c1',   'characteristic', 'Fun fact',     'A pioneer for women in country',  4),
      h('sig',  'song',           'Signature',    '"Crazy" (1961)',                  5),
    ],
  },

  'bing-crosby': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer & actor',                  1),
      h('f1',   'characteristic', 'Known for',    'Smooth, warm crooning voice',     1),
      h('bd',   'birth_date',     'Date of birth','May 3, 1903',                     2),
      h('bp',   'birth_place',    'Place of birth','Tacoma, Washington',             2),
      h('pk',   'peak_year',      'Career peak',  '1940 – 1956',                     2),
      h('s1',   'song',           'Hit song',     '"Swinging on a Star" (1944)',     3),
      h('s2',   'song',           'Hit song',     '"True Love" (1956)',              3),
      h('s3',   'song',           'Hit song',     '"Now You Has Jazz" (1956)',       3),
      h('c1',   'characteristic', 'Fun fact',     'A hugely popular film star too',  4),
      h('sig',  'song',           'Signature',    '"White Christmas" (1942)',        5),
    ],
  },

  'doris-day': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer & actress',                1),
      h('f1',   'characteristic', 'Known for',    'Wholesome girl-next-door image',  1),
      h('bd',   'birth_date',     'Date of birth','April 3, 1922',                   2),
      h('bp',   'birth_place',    'Place of birth','Cincinnati, Ohio',               2),
      h('pk',   'peak_year',      'Career peak',  '1945 – 1962',                     2),
      h('s1',   'song',           'Hit song',     '"Sentimental Journey" (1945)',    3),
      h('s2',   'song',           'Hit song',     '"Secret Love" (1953)',            3),
      h('s3',   'song',           'Hit song',     '"Everybody Loves a Lover" (1958)', 3),
      h('c1',   'characteristic', 'Fun fact',     'A top box-office film star',      4),
      h('sig',  'song',           'Signature',    '"Que Sera, Sera" (1956)',         5),
    ],
  },

  'george-benson': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Jazz guitarist & singer',         1),
      h('f1',   'characteristic', 'Known for',    'Smooth jazz-soul crossover',      1),
      h('bd',   'birth_date',     'Date of birth','March 22, 1943',                  2),
      h('bp',   'birth_place',    'Place of birth','Pittsburgh, Pennsylvania',       2),
      h('pk',   'peak_year',      'Career peak',  '1976 – 1985',                     2),
      h('s1',   'song',           'Hit song',     '"This Masquerade" (1976)',        3),
      h('s2',   'song',           'Hit song',     '"Turn Your Love Around" (1981)',  3),
      h('s3',   'song',           'Hit song',     '"Nothing\'s Gonna Change My Love for You" (1985)', 3),
      h('inst', 'characteristic', 'Instrument',   'Scats in unison with his guitar', 4),
      h('sig',  'song',           'Signature',    '"Give Me the Night" (1980)',      5),
    ],
  },

  'boy-george': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Early career', 'Frontman of Culture Club',        1),
      h('bd',   'birth_date',     'Date of birth','June 14, 1961',                   2),
      h('bp',   'birth_place',    'Place of birth','Bexley, London',                 2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"Do You Really Want to Hurt Me" (1982)', 3),
      h('s2',   'song',           'Hit song',     '"Church of the Poison Mind" (1983)', 3),
      h('s3',   'song',           'Hit song',     '"The Crying Game" (1992)',        3),
      h('c1',   'characteristic', 'Known for',    'Androgynous style and makeup',    4),
      h('sig',  'song',           'Signature',    '"Karma Chameleon" (1983)',        5),
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HINTS CONTENT BUILD-OUT — Batch 10 (80s/90s pop, swing legends, rock, 2026-09-02)
  // ══════════════════════════════════════════════════════════════════════════

  'bonnie-tyler': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & pop singer',               1),
      h('f1',   'characteristic', 'Known for',    'Husky, raspy voice',              1),
      h('bd',   'birth_date',     'Date of birth','June 8, 1951',                    2),
      h('bp',   'birth_place',    'Place of birth','Skewen, Neath',                  2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1984',                     2),
      h('s1',   'song',           'Hit song',     '"It\'s a Heartache" (1977)',      3),
      h('s2',   'song',           'Hit song',     '"Here She Comes" (1984)',         3),
      h('s3',   'song',           'Hit song',     '"If You Were a Woman (and I Was a Man)" (1986)', 3),
      h('s4',   'song',           'Hit song',     '"Holding Out for a Hero" (1984)', 3),
      h('c1',   'characteristic', 'Fun fact',     'Sang Jim Steinman-penned epics',  4),
      h('sig',  'song',           'Signature',    '"Total Eclipse of the Heart" (1983)', 5),
    ],
  },

  'laura-branigan': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Known for',    'Powerful four-octave voice',      1),
      h('bd',   'birth_date',     'Date of birth','July 3, 1952',                    2),
      h('bp',   'birth_place',    'Place of birth','Brewster, New York',             2),
      h('pk',   'peak_year',      'Career peak',  '1982 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"Solitaire" (1983)',              3),
      h('s2',   'song',           'Hit song',     '"Self Control" (1984)',           3),
      h('s3',   'song',           'Hit song',     '"Ti Amo" (1984)',                 3),
      h('s4',   'song',           'Hit song',     '"The Power of Love" (1987)',      3),
      h('c1',   'characteristic', 'Fun fact',     'A staple of 80s dance-pop radio', 4),
      h('sig',  'song',           'Signature',    '"Gloria" (1982)',                 5),
    ],
  },

  'kim-carnes': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & rock singer',               1),
      h('f1',   'characteristic', 'Known for',    'A gravelly, smoky voice',         1),
      h('bd',   'birth_date',     'Date of birth','July 20, 1945',                   2),
      h('bp',   'birth_place',    'Place of birth','Los Angeles',                    2),
      h('pk',   'peak_year',      'Career peak',  '1980 – 1985',                     2),
      h('s1',   'song',           'Hit song',     '"More Love" (1980)',              3),
      h('s2',   'song',           'Hit song',     '"Draw of the Cards" (1981)',      3),
      h('s3',   'song',           'Hit song',     '"Voyeur" (1982)',                 3),
      h('c1',   'characteristic', 'Fun fact',     'Won a Grammy Record of the Year', 4),
      h('sig',  'song',           'Signature',    '"Bette Davis Eyes" (1981)',       5),
    ],
  },

  'jennifer-rush': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Known for',    'Soaring power ballads',           1),
      h('bd',   'birth_date',     'Date of birth','September 28, 1960',              2),
      h('bp',   'birth_place',    'Place of birth','Queens, New York',               2),
      h('pk',   'peak_year',      'Career peak',  '1984 – 1987',                     2),
      h('s1',   'song',           'Hit song',     '"Ring of Ice" (1985)',            3),
      h('s2',   'song',           'Hit song',     '"Destiny" (1985)',                3),
      h('s3',   'song',           'Hit song',     '"Flames of Paradise" (1987)',     3),
      h('c1',   'characteristic', 'Fun fact',     'Her ballad was later a huge cover', 4),
      h('sig',  'song',           'Signature',    '"The Power of Love" (1984)',      5),
    ],
  },

  'jon-secada': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & Latin singer',              1),
      h('f1',   'characteristic', 'Fun fact',     'A bilingual Latin-pop star',      1),
      h('bd',   'birth_date',     'Date of birth','October 4, 1961',                 2),
      h('bp',   'birth_place',    'Place of birth','Havana',                         2),
      h('pk',   'peak_year',      'Career peak',  '1992 – 1995',                     2),
      h('s1',   'song',           'Hit song',     '"Do You Believe in Us" (1992)',   3),
      h('s2',   'song',           'Hit song',     '"Angel" (1992)',                  3),
      h('s3',   'song',           'Hit song',     '"If You Go" (1994)',              3),
      h('c1',   'characteristic', 'Fun fact',     'Wrote songs with Gloria Estefan', 4),
      h('sig',  'song',           'Signature',    '"Just Another Day" (1992)',       5),
    ],
  },

  'peter-cetera': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock & pop singer',               1),
      h('f1',   'characteristic', 'Early career', 'Former frontman of Chicago',      1),
      h('bd',   'birth_date',     'Date of birth','September 13, 1944',              2),
      h('bp',   'birth_place',    'Place of birth','Chicago, Illinois',              2),
      h('pk',   'peak_year',      'Career peak',  '1986 – 1989',                     2),
      h('s1',   'song',           'Hit song',     '"The Next Time I Fall" (1986)',   3),
      h('s2',   'song',           'Hit song',     '"After All" (1989)',              3),
      h('s3',   'song',           'Hit song',     '"Restless Heart" (1992)',         3),
      h('film', 'characteristic', 'Film link',    'His hit featured in "The Karate Kid Part II"', 4),
      h('sig',  'song',           'Signature',    '"Glory of Love" (1986)',          5),
    ],
  },

  'peter-gabriel': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock singer-songwriter',          1),
      h('f1',   'characteristic', 'Early career', 'Original frontman of Genesis',    1),
      h('bd',   'birth_date',     'Date of birth','February 13, 1950',               2),
      h('bp',   'birth_place',    'Place of birth','Chobham, Surrey',                2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1992',                     2),
      h('s1',   'song',           'Hit song',     '"Solsbury Hill" (1977)',          3),
      h('s2',   'song',           'Hit song',     '"Games Without Frontiers" (1980)', 3),
      h('s3',   'song',           'Hit song',     '"Shock the Monkey" (1982)',       3),
      h('s4',   'song',           'Hit song',     '"In Your Eyes" (1986)',           3),
      h('alb',  'album',          'Iconic album', '"So" (1986)',                     4),
      h('sig',  'song',           'Signature',    '"Sledgehammer" (1986)',           5),
    ],
  },

  'genesis': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'From prog-rock to 80s pop',       1),
      h('cy',   'creation_year',  'Formed',       'Formed in Surrey, 1967',          2),
      h('mem',  'band_member',    'Members',      'Phil Collins & Mike Rutherford',  2),
      h('pk',   'peak_year',      'Career peak',  '1980 – 1991',                     2),
      h('s1',   'song',           'Hit song',     '"Follow You Follow Me" (1978)',   3),
      h('s2',   'song',           'Hit song',     '"Mama" (1983)',                   3),
      h('s3',   'song',           'Hit song',     '"That\'s All" (1983)',            3),
      h('s4',   'song',           'Hit song',     '"Land of Confusion" (1986)',      3),
      h('alb',  'album',          'Iconic album', '"Invisible Touch" (1986)',        4),
      h('sig',  'song',           'Signature',    '"Invisible Touch" (1986)',        5),
    ],
  },

  'nickelback': {
    categoryLabel: 'Band',
    nationality: 'canada',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Fun fact',     'Radio-friendly post-grunge rock', 1),
      h('cy',   'creation_year',  'Formed',       'Formed in Alberta, 1995',         2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Chad Kroeger',         2),
      h('pk',   'peak_year',      'Career peak',  '2001 – 2008',                     2),
      h('s1',   'song',           'Hit song',     '"Someday" (2003)',                3),
      h('s2',   'song',           'Hit song',     '"Photograph" (2005)',             3),
      h('s3',   'song',           'Hit song',     '"Rockstar" (2005)',               3),
      h('s4',   'song',           'Hit song',     '"Far Away" (2006)',               3),
      h('sig',  'song',           'Signature',    '"How You Remind Me" (2001)',      5),
    ],
  },

  'the-rasmus': {
    categoryLabel: 'Band',
    nationality: 'finland',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock band',                       1),
      h('f1',   'characteristic', 'Known for',    'Gothic-tinged alt-rock',          1),
      h('cy',   'creation_year',  'Formed',       'Formed in Helsinki, 1994',        2),
      h('mem',  'lead_singer',    'Frontman',     'Fronted by Lauri Ylönen',         2),
      h('pk',   'peak_year',      'Career peak',  '2003 – 2005',                     2),
      h('s1',   'song',           'Hit song',     '"First Day of My Life" (2004)',   3),
      h('s2',   'song',           'Hit song',     '"Guilty" (2004)',                 3),
      h('s3',   'song',           'Hit song',     '"No Fear" (2005)',                3),
      h('alb',  'album',          'Iconic album', '"Hide from the Sun" (2005)',      4),
      h('sig',  'song',           'Signature',    '"In the Shadows" (2003)',         5),
    ],
  },

  'chic': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Disco & funk band',               1),
      h('f1',   'characteristic', 'Members',      'Led by guitarist Nile Rodgers',   1),
      h('cy',   'creation_year',  'Formed',       'Formed in New York, 1976',        2),
      h('mem',  'band_member',    'Members',      'Nile Rodgers & Bernard Edwards',  2),
      h('pk',   'peak_year',      'Career peak',  '1977 – 1979',                     2),
      h('s1',   'song',           'Hit song',     '"Dance, Dance, Dance" (1977)',    3),
      h('s2',   'song',           'Hit song',     '"Everybody Dance" (1977)',        3),
      h('s3',   'song',           'Hit song',     '"I Want Your Love" (1978)',       3),
      h('s4',   'song',           'Hit song',     '"Good Times" (1979)',             3),
      h('sig',  'song',           'Signature',    '"Le Freak" (1978)',               5),
    ],
  },

  'ben-e-king': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul singer',                     1),
      h('f1',   'characteristic', 'Early career', 'Former lead of The Drifters',     1),
      h('bd',   'birth_date',     'Date of birth','September 28, 1938',              2),
      h('bp',   'birth_place',    'Place of birth','Henderson, North Carolina',      2),
      h('pk',   'peak_year',      'Career peak',  '1960 – 1963',                     2),
      h('s1',   'song',           'Hit song',     '"Save the Last Dance for Me" (1960)', 3),
      h('s2',   'song',           'Hit song',     '"I (Who Have Nothing)" (1963)',   3),
      h('s3',   'song',           'Hit song',     '"Supernatural Thing" (1975)',     3),
      h('c1',   'characteristic', 'Fun fact',     'His hit returned to the charts in the 80s', 4),
      h('sig',  'song',           'Signature',    '"Stand by Me" (1961)',            5),
    ],
  },

  'sammy-davis-jr': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer, dancer & actor',          1),
      h('f1',   'characteristic', 'Early career', 'A member of the Rat Pack',        1),
      h('bd',   'birth_date',     'Date of birth','December 8, 1925',                2),
      h('bp',   'birth_place',    'Place of birth','Harlem, New York',               2),
      h('pk',   'peak_year',      'Career peak',  '1955 – 1972',                     2),
      h('s1',   'song',           'Hit song',     '"What Kind of Fool Am I" (1962)', 3),
      h('s2',   'song',           'Hit song',     '"I\'ve Gotta Be Me" (1968)',      3),
      h('s3',   'song',           'Hit song',     '"Mr. Bojangles" (1972)',          3),
      h('c1',   'characteristic', 'Fun fact',     'A dazzling all-round entertainer', 4),
      h('sig',  'song',           'Signature',    '"The Candy Man" (1972)',          5),
    ],
  },

  'glenn-miller': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Big-band leader & trombonist',    1),
      h('f1',   'characteristic', 'Known for',    'The definitive swing-era sound',  1),
      h('bd',   'birth_date',     'Date of birth','March 1, 1904',                   2),
      h('bp',   'birth_place',    'Place of birth','Clarinda, Iowa',                 2),
      h('pk',   'peak_year',      'Career peak',  '1939 – 1942',                     2),
      h('s1',   'song',           'Hit song',     '"Moonlight Serenade" (1939)',     3),
      h('s2',   'song',           'Hit song',     '"Pennsylvania 6-5000" (1940)',    3),
      h('s3',   'song',           'Hit song',     '"Chattanooga Choo Choo" (1941)',  3),
      h('s4',   'song',           'Hit song',     '"A String of Pearls" (1941)',     3),
      h('sig',  'song',           'Signature',    '"In the Mood" (1939)',            5),
    ],
  },

  'cab-calloway': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Jazz singer & bandleader',        1),
      h('f1',   'characteristic', 'Known for',    'Scat "hi-de-ho" call-and-response', 1),
      h('bd',   'birth_date',     'Date of birth','December 25, 1907',               2),
      h('bp',   'birth_place',    'Place of birth','Rochester, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '1931 – 1948',                     2),
      h('s1',   'song',           'Hit song',     '"St. James Infirmary" (1930)',    3),
      h('s2',   'song',           'Hit song',     '"The Jumpin\' Jive" (1939)',      3),
      h('c1',   'characteristic', 'Known for',    'Flashy white zoot suits',         3),
      h('c2',   'characteristic', 'Fun fact',     'Later appeared in "The Blues Brothers"', 4),
      h('sig',  'song',           'Signature',    '"Minnie the Moocher" (1931)',     5),
    ],
  },

  'perry-como': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Crooner & TV host',               1),
      h('f1',   'characteristic', 'Known for',    'Relaxed cardigan-sweater image',  1),
      h('bd',   'birth_date',     'Date of birth','May 18, 1912',                    2),
      h('bp',   'birth_place',    'Place of birth','Canonsburg, Pennsylvania',       2),
      h('pk',   'peak_year',      'Career peak',  '1954 – 1970',                     2),
      h('s1',   'song',           'Hit song',     '"Papa Loves Mambo" (1954)',       3),
      h('s2',   'song',           'Hit song',     '"Catch a Falling Star" (1957)',   3),
      h('s3',   'song',           'Hit song',     '"It\'s Impossible" (1970)',       3),
      h('s4',   'song',           'Hit song',     '"And I Love You So" (1973)',      3),
      h('sig',  'song',           'Signature',    '"Magic Moments" (1958)',          5),
    ],
  },

  'jo-stafford': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Traditional pop singer',          1),
      h('f1',   'characteristic', 'Fun fact',     'A top vocalist of the 1940s-50s', 1),
      h('bd',   'birth_date',     'Date of birth','November 12, 1917',               2),
      h('bp',   'birth_place',    'Place of birth','Coalinga, California',           2),
      h('pk',   'peak_year',      'Career peak',  '1944 – 1955',                     2),
      h('s1',   'song',           'Hit song',     '"Shrimp Boats" (1951)',           3),
      h('s2',   'song',           'Hit song',     '"Make Love to Me!" (1954)',       3),
      h('c1',   'characteristic', 'Early career', 'Sang with Tommy Dorsey\'s band',  3),
      h('c2',   'characteristic', 'Fun fact',     'A hugely popular wartime singer', 4),
      h('sig',  'song',           'Signature',    '"You Belong to Me" (1952)',       5),
    ],
  },

  'patti-page': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Traditional pop singer',          1),
      h('f1',   'characteristic', 'Fun fact',     'Best-selling female singer of the 50s', 1),
      h('bd',   'birth_date',     'Date of birth','November 8, 1927',                2),
      h('bp',   'birth_place',    'Place of birth','Claremore, Oklahoma',            2),
      h('pk',   'peak_year',      'Career peak',  '1950 – 1957',                     2),
      h('s1',   'song',           'Hit song',     '"(How Much Is) That Doggie in the Window" (1953)', 3),
      h('s2',   'song',           'Hit song',     '"Allegheny Moon" (1956)',         3),
      h('s3',   'song',           'Hit song',     '"Old Cape Cod" (1957)',           3),
      h('c1',   'characteristic', 'Fun fact',     'Pioneered multi-tracked vocals',  4),
      h('sig',  'song',           'Signature',    '"Tennessee Waltz" (1950)',        5),
    ],
  },

  'johnnie-ray': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & R&B singer',                1),
      h('f1',   'characteristic', 'Known for',    'Emotional, sob-in-the-voice style', 1),
      h('bd',   'birth_date',     'Date of birth','January 10, 1927',                2),
      h('bp',   'birth_place',    'Place of birth','Dallas, Oregon',                 2),
      h('pk',   'peak_year',      'Career peak',  '1951 – 1957',                     2),
      h('s1',   'song',           'Hit song',     '"The Little White Cloud That Cried" (1951)', 3),
      h('s2',   'song',           'Hit song',     '"Please Mr. Sun" (1952)',         3),
      h('s3',   'song',           'Hit song',     '"Just Walkin\' in the Rain" (1956)', 3),
      h('c1',   'characteristic', 'Fun fact',     'An early rock-and-roll forerunner', 4),
      h('sig',  'song',           'Signature',    '"Cry" (1951)',                    5),
    ],
  },

  'cole-porter': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Composer & songwriter',           1),
      h('f1',   'characteristic', 'Known for',    'Witty, sophisticated lyrics',     1),
      h('bd',   'birth_date',     'Date of birth','June 9, 1891',                    2),
      h('bp',   'birth_place',    'Place of birth','Born in Indiana',               2),
      h('pk',   'peak_year',      'Career peak',  '1928 – 1948',                     2),
      h('s1',   'song',           'Song',         '"Let\'s Do It (Let\'s Fall in Love)" (1928)', 3),
      h('s2',   'song',           'Song',         '"Anything Goes" (1934)',          3),
      h('s3',   'song',           'Song',         '"Begin the Beguine" (1935)',      3),
      h('s4',   'song',           'Song',         '"I\'ve Got You Under My Skin" (1936)', 3),
      h('c1',   'characteristic', 'Fun fact',     'A leading Broadway songwriter',   4),
      h('sig',  'song',           'Signature',    '"Night and Day" (1932)',          5),
    ],
  },

  'bobby-mcferrin': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Vocal artist & conductor',        1),
      h('f1',   'characteristic', 'Known for',    'Uses only his voice and body',    1),
      h('bd',   'birth_date',     'Date of birth','March 11, 1950',                  2),
      h('bp',   'birth_place',    'Place of birth','Manhattan, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1990',                     2),
      h('c1',   'characteristic', 'Fun fact',     'A one-take a cappella recording', 3),
      h('c2',   'characteristic', 'Fun fact',     'Won ten Grammy Awards',           3),
      h('c3',   'characteristic', 'Fun fact',     'Also works as an orchestra conductor', 3),
      h('s1',   'song',           'Hit song',     '"Thinkin\' About Your Body" (1988)', 4),
      h('sig',  'song',           'Signature',    '"Don\'t Worry, Be Happy" (1988)', 5),
    ],
  },

  'rick-astley': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop singer',                      1),
      h('f1',   'characteristic', 'Known for',    'A deep voice and the "Rickroll" meme', 1),
      h('bd',   'birth_date',     'Date of birth','February 6, 1966',                2),
      h('bp',   'birth_place',    'Place of birth','Newton-le-Willows',              2),
      h('pk',   'peak_year',      'Career peak',  '1987 – 1991',                     2),
      h('s1',   'song',           'Hit song',     '"Whenever You Need Somebody" (1987)', 3),
      h('s2',   'song',           'Hit song',     '"Together Forever" (1988)',       3),
      h('s3',   'song',           'Hit song',     '"Cry for Help" (1991)',           3),
      h('c1',   'characteristic', 'Fun fact',     'Produced by Stock Aitken Waterman', 4),
      h('sig',  'song',           'Signature',    '"Never Gonna Give You Up" (1987)', 5),
    ],
  },

  'neneh-cherry': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & hip-hop singer',            1),
      h('f1',   'characteristic', 'Fun fact',     'Mother of the singer Mabel',      1),
      h('bd',   'birth_date',     'Date of birth','March 10, 1964',                  2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1988 – 1994',                     2),
      h('s1',   'song',           'Hit song',     '"Manchild" (1989)',               3),
      h('s2',   'song',           'Hit song',     '"Kisses on the Wind" (1989)',     3),
      h('s3',   'song',           'Hit song',     '"7 Seconds" (1994)',              3),
      h('c1',   'characteristic', 'Fun fact',     'Half-sister of Eagle-Eye Cherry', 4),
      h('sig',  'song',           'Signature',    '"Buffalo Stance" (1988)',         5),
    ],
  },

  'irene-cara': {
    categoryLabel: 'Musikartist',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Singer & actress',                1),
      h('f1',   'characteristic', 'Known for',    'Iconic 80s movie theme songs',    1),
      h('bd',   'birth_date',     'Date of birth','March 18, 1959',                  2),
      h('bp',   'birth_place',    'Place of birth','The Bronx, New York',            2),
      h('pk',   'peak_year',      'Career peak',  '1980 – 1983',                     2),
      h('s1',   'song',           'Hit song',     '"Fame" (1980)',                   3),
      h('s2',   'song',           'Hit song',     '"Why Me?" (1983)',                3),
      h('c1',   'characteristic', 'Fun fact',     'Starred in the film "Fame" (1980)', 3),
      h('c2',   'characteristic', 'Fun fact',     'Won an Oscar for her signature song', 4),
      h('sig',  'song',           'Signature',    '"Flashdance... What a Feeling" (1983)', 5),
    ],
  },

  'bananarama': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop girl group',                  1),
      h('f1',   'characteristic', 'Fun fact',     'A record-charting female group',  1),
      h('cy',   'creation_year',  'Formed',       'Formed in London, 1981',          2),
      h('mem',  'band_member',    'Members',      'Sara, Keren and Siobhan',         2),
      h('pk',   'peak_year',      'Career peak',  '1983 – 1988',                     2),
      h('s1',   'song',           'Hit song',     '"Really Saying Something" (1982)', 3),
      h('s2',   'song',           'Hit song',     '"Cruel Summer" (1983)',           3),
      h('s3',   'song',           'Hit song',     '"Robert De Niro\'s Waiting" (1984)', 3),
      h('s4',   'song',           'Hit song',     '"I Heard a Rumour" (1987)',       3),
      h('sig',  'song',           'Signature',    '"Venus" (1986)',                  5),
    ],
  },

  'ragnbone-man': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Soul & blues singer',             1),
      h('f1',   'characteristic', 'Known for',    'A deep, gravelly soulful voice',  1),
      h('bd',   'birth_date',     'Date of birth','January 29, 1985',                2),
      h('bp',   'birth_place',    'Place of birth','Uckfield',                       2),
      h('pk',   'peak_year',      'Career peak',  '2016 – present',                  2),
      h('s1',   'song',           'Hit song',     '"Skin" (2017)',                   3),
      h('s2',   'song',           'Hit song',     '"Giant" (2019)',                  3),
      h('s3',   'song',           'Hit song',     '"All You Ever Wanted" (2021)',    3),
      h('alb',  'album',          'Debut album',  '"Human" album (2017)',            4),
      h('sig',  'song',           'Signature',    '"Human" (2016)',                  5),
    ],
  },

  'eagle-eye-cherry': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop-rock singer-songwriter',      1),
      h('f1',   'characteristic', 'Fun fact',     'Half-brother of Neneh Cherry',    1),
      h('bd',   'birth_date',     'Date of birth','May 7, 1968',                     2),
      h('bp',   'birth_place',    'Place of birth','Stockholm',                      2),
      h('pk',   'peak_year',      'Career peak',  '1997 – 2000',                     2),
      h('s1',   'song',           'Hit song',     '"Falling in Love Again" (1998)',  3),
      h('s2',   'song',           'Hit song',     '"Are You Still Having Fun?" (2000)', 3),
      h('c1',   'characteristic', 'Fun fact',     'Best known for a late-90s smash', 3),
      h('c2',   'characteristic', 'Known for',    'Warm acoustic pop-rock',          4),
      h('sig',  'song',           'Signature',    '"Save Tonight" (1997)',           5),
    ],
  },

  'los-del-rio': {
    categoryLabel: 'Band',
    nationality: 'spain',
    hints: [
      h('prof', 'profession',     'Profession',   'Flamenco-pop duo',                1),
      h('f1',   'characteristic', 'Members',      'Antonio Romero & Rafael Ruiz',    1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1962',                  2),
      h('pk',   'peak_year',      'Career peak',  '1995 – 1996',                     2),
      h('c1',   'characteristic', 'Fun fact',     'Sparked a worldwide dance craze', 3),
      h('c2',   'characteristic', 'Known for',    'Andalusian flamenco roots',       3),
      h('c3',   'characteristic', 'Fun fact',     'Best known for one line-dance smash', 3),
      h('c4',   'characteristic', 'Fun fact',     'A remix topped charts everywhere', 4),
      h('c5',   'characteristic', 'Fun fact',     'Veteran duo of decades before their hit', 4),
      h('sig',  'song',           'Signature',    '"Macarena" (1995)',               5),
    ],
  },

  'tom-jones': {
    categoryLabel: 'Musikartist',
    nationality: 'uk',
    hints: [
      h('prof', 'profession',     'Profession',   'Pop & soul singer',               1),
      h('f1',   'characteristic', 'Known for',    'Booming, powerful voice',         1),
      h('bd',   'birth_date',     'Date of birth','June 7, 1940',                    2),
      h('bp',   'birth_place',    'Place of birth','Pontypridd',                     2),
      h('pk',   'peak_year',      'Career peak',  '1965 – 1971',                     2),
      h('s1',   'song',           'Hit song',     '"What\'s New Pussycat?" (1965)',  3),
      h('s2',   'song',           'Hit song',     '"Delilah" (1968)',                3),
      h('s3',   'song',           'Hit song',     '"She\'s a Lady" (1971)',          3),
      h('s4',   'song',           'Hit song',     '"Sex Bomb" (1999)',               3),
      h('sig',  'song',           'Signature',    '"It\'s Not Unusual" (1965)',      5),
    ],
  },

  'the-everly-brothers': {
    categoryLabel: 'Band',
    nationality: 'usa',
    hints: [
      h('prof', 'profession',     'Profession',   'Rock and roll duo',               1),
      h('f1',   'characteristic', 'Known for',    'Tight close-harmony singing',     1),
      h('cy',   'creation_year',  'Formed',       'Formed in 1957',                  2),
      h('mem',  'band_member',    'Members',      'Don & Phil Everly',               2),
      h('pk',   'peak_year',      'Career peak',  '1957 – 1962',                     2),
      h('s1',   'song',           'Hit song',     '"Bye Bye Love" (1957)',           3),
      h('s2',   'song',           'Hit song',     '"Wake Up Little Susie" (1957)',   3),
      h('s3',   'song',           'Hit song',     '"Bird Dog" (1958)',               3),
      h('s4',   'song',           'Hit song',     '"Cathy\'s Clown" (1960)',         3),
      h('sig',  'song',           'Signature',    '"All I Have to Do Is Dream" (1958)', 5),
    ],
  },

}; // end HINTS_LIBRARY_MANUAL

// Nationality-override för items där auto-gen (Wikidata P27) returnerade 'unknown'.
// Appliceras EFTER merge av generated + manual så manuellt kuraterade behöver inte upprepa detta.
const NATIONALITY_OVERRIDES: Record<string, string> = {
  // Svenska artister/band
  'a-teens': 'sweden',        'alesso': 'sweden',         'bo-kaspers-orkester': 'sweden',
  'cornelis-vreeswijk': 'sweden', 'daniel-andersson': 'sweden', 'daniel-stahl': 'sweden',
  'darin': 'sweden',          'familjen': 'sweden',       'first-aid-kit': 'sweden',
  'freestyle': 'sweden',      'galantis': 'sweden',       'hep-stars': 'sweden',
  'hurula': 'sweden',         'jordan-larsson': 'sweden', 'larz-kristerz': 'sweden',
  'lasse-stefanz': 'sweden',  'lisa-nilsson': 'sweden',   'lolita-pop': 'sweden',
  'ludmila-engquist': 'sweden', 'mariette': 'sweden',     'mauro-scocco': 'sweden',
  'nationalteatern': 'sweden', 'orup': 'sweden',          'patrik-sjoberg': 'sweden',
  'ratata': 'sweden',         'stefan-holm': 'sweden',    'sten-and-stanley': 'sweden',
  'swedish-house-mafia': 'sweden', 'tages': 'sweden',     'the-soundtrack-of-our-lives': 'sweden',
  'thomas-johansson-tennis': 'sweden', 'timbuktu': 'sweden', 'titiyo': 'sweden',
  'tjuvjakt': 'sweden',       'tobias-karlsson-handball': 'sweden', 'vikingarna': 'sweden',
  'vilhelm-blomgren': 'sweden', 'vincent-pontare': 'sweden',
  // Norska
  'aha': 'norway',            'wenche-myhre': 'norway',   'ylvis': 'norway',
  // Danska
  'anne-linnet': 'denmark',   'morten-olsen': 'denmark',  'sanne-salomonsen': 'denmark',
  // Finska
  'lordi': 'finland',         'nightwish': 'finland',
  // Nederländska
  'clarence-seedorf': 'netherlands', 'cody-gakpo': 'netherlands', 'dirk-kuyt': 'netherlands',
  'edgar-davids': 'netherlands', 'frank-rijkaard': 'netherlands', 'frenkie-de-jong': 'netherlands',
  'guus-hiddink': 'netherlands', 'johan-cruyff': 'netherlands', 'louis-van-gaal': 'netherlands',
  'marco-van-basten': 'netherlands', 'memphis-depay': 'netherlands', 'patrick-kluivert': 'netherlands',
  'robin-van-persie': 'netherlands', 'ruud-gullit': 'netherlands', 'virgil-van-dijk': 'netherlands',
  'wesley-sneijder': 'netherlands',
  // Brittiska
  'annie-lennox': 'uk',       'arctic-monkeys': 'uk',     'bee-gees': 'uk',
  'black-sabbath': 'uk',      'coldplay': 'uk',           'dua-lipa': 'uk',
  'eurythmics': 'uk',         'fleetwood-mac': 'uk',      'genesis': 'uk',
  'led-zeppelin': 'uk',       'pink-floyd': 'uk',         'spice-girls': 'uk',
  'the-police': 'uk',         'the-smiths': 'uk',         'wham': 'uk',
  // Amerikanska
  'backstreet-boys': 'usa',   'eagles': 'usa',            'edward-norton': 'usa',
  'green-day': 'usa',         'guns-n-roses': 'usa',      'journey': 'usa',
  'kiss': 'usa',              'maroon-5': 'usa',          'metallica': 'usa',
  'nicki-minaj': 'usa',       'the-doors': 'usa',         'imagine-dragons': 'usa',
  'r-e-m': 'usa',             'the-beach-boys': 'usa',
  // Brasilianska
  'bebeto': 'brazil',         'fred': 'brazil',           'marcelo': 'brazil',
  'oscar': 'brazil',          'ronaldinho': 'brazil',
  // Spanska
  'pedro-rodriguez': 'spain', 'raul': 'spain',            'xavi': 'spain',
  // Tyska
  'franz-beckenbauer': 'germany',
  // Chilenska
  'alexis-sanchez': 'chile',  'arturo-vidal': 'chile',
  // Uruguayanska
  'diego-forlan': 'uruguay',  'edinson-cavani': 'uruguay', 'luis-suarez': 'uruguay',
  // Övriga latinamerikanska
  'james-rodriguez': 'colombia', 'guillermo-ochoa': 'mexico', 'salma-hayek': 'mexico',
  // Europeiska
  'maneskin': 'italy',        'jaromir-jagr': 'czechia',  'novak-djokovic': 'serbia',
  'pepe': 'portugal',         'u2': 'ireland',            'daft-punk': 'france',
  // Afrika / Mellanöstern / Asien
  'didier-drogba': 'ivory-coast', 'emmanuel-adebayor': 'togo',
  'charlize-theron': 'south-africa', 'netta-barzilai': 'israel',
  'yao-ming': 'china',        'bts': 'south-korea',
};

// HINTS_LIBRARY: auto-genererade hints + manuellt kuraterade (manuella åsidosätter).
// Nationality-overrides appliceras sist för att täcka 'unknown'-fall i generated-filen.
export const HINTS_LIBRARY: Record<string, HintLibrary> = Object.fromEntries(
  Object.entries({
    ...HINTS_LIBRARY_GENERATED,
    ...HINTS_LIBRARY_MANUAL,
  }).map(([id, lib]) => {
    const override = NATIONALITY_OVERRIDES[id];
    return [id, override && lib.nationality === 'unknown' ? { ...lib, nationality: override } : lib];
  }),
);
