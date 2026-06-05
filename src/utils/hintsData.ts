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
// 'sweden'  = visas enbart för svenska spelare (V1-default)
// 'all'     = visas för alla spelare — globalt kända + stark svensk igenkänning
//             (= catalog region: ["sweden","global"])
// 'global'  = visas EJ för V1-svenska spelare (ren global-pool)
//
// Används:
//   • Som referens vid catalog-YAML-taggning (region-fältet per item)
//   • Av fetch-hints-data.ts för att prioritera vilka items som auto-genereras
//   • Av getHintRegionScope(id) helper

// 'nordic' = visas för svenska + nordiska spelare (catalog-YAML: ["sweden","nordic"])
//            Svenska spelare ser nordic-items automatiskt — "sweden" ingår alltid i nordic-items region-array.
export type HintRegionScope = 'sweden' | 'all' | 'nordic' | 'unknown-region';

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
  'ariana-grande': 'all',    'travis-scott': 'all',     'ed-sheeran': 'all',
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
  'gary-oldman': 'all',      'demi-moore': 'all',       'halle-berry': 'all',
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
  'dwayne-johnson': 'all',   'chris-evans': 'all',      'scarlett-johansson': 'all',
  'jennifer-lawrence': 'all', 'cameron-diaz': 'all',    'gwyneth-paltrow': 'all',
  'uma-thurman': 'all',      'ewan-mcgregor': 'unknown-region',    'bradley-cooper': 'all',
  'tom-hiddleston': 'unknown-region',   'keira-knightley': 'unknown-region',  'anne-hathaway': 'unknown-region',

  // ── Skådespelare / gen-z ───────────────────────────────────────────────
  'millie-bobby-brown': 'unknown-region', 'zendaya': 'unknown-region',        'daniel-radcliffe': 'unknown-region',
  'emma-watson': 'unknown-region',      'robert-pattinson': 'unknown-region', 'kristen-stewart': 'unknown-region',

  // ── Idrottare / elder+gen-x ────────────────────────────────────────────
  'muhammad-ali': 'all',     'pele': 'all',             'diego-maradona': 'all',
  'magic-johnson': 'all',    'michael-jordan': 'all',   'carl-lewis': 'all',
  'wayne-gretzky': 'all',    'martina-navratilova': 'all', 'john-mcenroe': 'all',
  'johan-cruyff': 'all',     'franz-beckenbauer': 'all', 'george-best': 'all',
  'paolo-maldini': 'all',    'roberto-baggio': 'all',   'marco-van-basten': 'all',
  'katarina-witt': 'all',    'bjorn-daehlie': 'all',    'ayrton-senna': 'all',
  'alain-prost': 'all',      'michael-schumacher': 'all', 'zinedine-zidane': 'all',
  'andre-agassi': 'all',     'pete-sampras': 'all',     'david-beckham': 'all',
  'ronaldinho': 'all',       'goran-ivanisevic': 'all', 'george-foreman': 'all',
  'eric-cantona': 'all',     'ruud-gullit': 'all',      'lothar-matthaus': 'all',
  'rivaldo': 'all',          'alan-shearer': 'all',     'oliver-kahn': 'all',
  'frank-rijkaard': 'all',   'edgar-davids': 'all',     'alessandro-del-piero': 'all',
  'ryan-giggs': 'all',       'luis-figo': 'all',        'jurgen-klinsmann': 'all',
  'hristo-stoichkov': 'all', 'didier-deschamps': 'all', 'bebeto': 'unknown-region',
  'paolo-rossi': 'all',      'gerd-muller': 'all',      'olga-korbut': 'unknown-region',
  'jaromir-jagr': 'all',     'ole-einar-bjorndalen': 'all', 'marit-bjorgen': 'all',
  'jean-pierre-papin': 'all', 'brian-laudrup': 'all',

  // ── Idrottare / modern ─────────────────────────────────────────────────
  'cristiano-ronaldo': 'all', 'lionel-messi': 'all',    'serena-williams': 'all',
  'usain-bolt': 'all',        'roger-federer': 'all',   'zlatan-ibrahimovic': 'all',
  'tom-brady': 'all',         'lewis-hamilton': 'all',  'rafael-nadal': 'all',
  'novak-djokovic': 'all',    'kylian-mbappe': 'all',   'kobe-bryant': 'all',
  'erling-haaland': 'all',    'harry-kane': 'all',      'robert-lewandowski': 'all',
  'luka-modric': 'all',       'andy-murray': 'all',     'mikaela-shiffrin': 'all',
  'alex-morgan': 'all',       'karsten-warholm': 'nordic', 'jakob-ingebrigtsen': 'nordic',
  'xavi': 'unknown-region',              'yao-ming': 'unknown-region',        'venus-williams': 'all',
  'sidney-crosby': 'all',     'connor-mcdavid': 'all',  'neymar': 'all',
  'iker-casillas': 'all',     'toni-kroos': 'unknown-region',      'manuel-neuer': 'all',
  'floyd-mayweather': 'all',  'wayne-rooney': 'all',    'kaka': 'all',
  'andrea-pirlo': 'all',      'thierry-henry': 'all',   'david-villa': 'unknown-region',
  'didier-drogba': 'all',     'gerard-pique': 'unknown-region',    'kevin-de-bruyne': 'all',
  'antoine-griezmann': 'all', 'virgil-van-dijk': 'all', 'gareth-bale': 'all',
  'martin-odegaard': 'all',   'ronaldo-nazario': 'all', 'miroslav-klose': 'all',
  'thomas-muller': 'all',     'steven-gerrard': 'all',  'frank-lampard': 'all',
  'xabi-alonso': 'all',       'raul': 'all',            'luis-suarez': 'all',
  'eden-hazard': 'all',       'patrick-vieira': 'all',  'andriy-shevchenko': 'all',
  'petr-cech': 'all',         'wesley-sneijder': 'unknown-region', 'robin-van-persie': 'all',
  'clarence-seedorf': 'all',  'patrick-kluivert': 'all', 'john-terry': 'all',
  'rio-ferdinand': 'all',     'michael-owen': 'all',    'cesc-fabregas': 'all',
  'ngolo-kante': 'all',       'paul-pogba': 'all',      'sergio-aguero': 'all',
  'jude-bellingham': 'all',   'phil-foden': 'all',      'bukayo-saka': 'all',
  'declan-rice': 'all',       'bruno-fernandes': 'all', 'mohamed-salah': 'all',
  'hidetoshi-nakata': 'unknown-region',  'james-rodriguez': 'unknown-region', 'alexis-sanchez': 'unknown-region',
  'diego-simeone': 'unknown-region',

  'lindsey-vonn': 'all',

  // ── Svenska idrottare med global räckvidd ('all') ─────────────────────
  'bjorn-borg': 'all',        'stefan-edberg': 'all',   'mats-wilander': 'all',
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
  'll-cool-j': 'unknown-region',       'lauryn-hill': 'all',
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
  'joachim-low': 'unknown-region',     'marcello-lippi': 'unknown-region',
  'dino-zoff': 'unknown-region',       'guus-hiddink': 'unknown-region',
  'jan-ceulemans': 'unknown-region',   'hugo-sanchez': 'unknown-region',
  'karl-heinz-rummenigge': 'unknown-region', 'sepp-maier': 'unknown-region',
  'javier-zanetti': 'unknown-region',  'dunga': 'unknown-region',
  'bobby-moore': 'unknown-region',     'jairzinho': 'unknown-region',
  'daniel-passarella': 'unknown-region', 'alf-ramsey': 'unknown-region',
  'just-fontaine': 'unknown-region',   'otto-rehhagel': 'unknown-region',
  'louis-van-gaal': 'unknown-region',  'tim-cahill': 'unknown-region',
  'harry-kewell': 'unknown-region',    'arturo-vidal': 'unknown-region',
  'ivan-rakitic': 'unknown-region',    'dirk-kuyt': 'unknown-region',
  'gennaro-gattuso': 'unknown-region', 'alessandro-nesta': 'unknown-region',
  'ashley-cole': 'unknown-region',     'robbie-keane': 'unknown-region',
  'david-trezeguet': 'unknown-region', 'ricardo-quaresma': 'unknown-region',
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
};

export function countryToFlagEmoji(nationality: string): string {
  return FLAG_MAP[nationality.toLowerCase()] ?? '🏳️';
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
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
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
      h('fact1', 'characteristic', 'Early career',  'Born in Stockholm, Sweden',                               1),
      h('bd',    'birth_date',     'Date of birth', 'December 16, 1997',                                      2),
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '2015 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Ain\'t My Fault" (2017)',                                3),
      h('s2',    'song',           'Hit song',      '"Love Me Land" (2020)',                                   3),
      h('s3',    'song',           'Hit song',      '"WOW" (2019)',                                            3),
      h('alb1',  'album',          'Iconic album',  '"Poster Girl" album (2021)',                              3),
      h('fact2', 'characteristic', 'Fact',          'Represented Sweden at Eurovision 2017 in Kyiv',           3),
      h('fact3', 'characteristic', 'Fact',          'Known for empowering pop anthems',                        3),
      h('debut', 'debut',          'Debut album',   '"So Good" international debut (2017)',                    3),
      h('s4',    'song',           'Hit song',      '"Symphony" feat. Clean Bandit (2017)',                    4),
      h('s5',    'song',           'Hit song',      '"Never Forget You" (2015)',                               4),
      h('merit', 'merit',          'Achievement',   'Won Swedish talent show Talang Sverige at age 10',        4),
      h('s6',    'song',           'Hit song',      '"Lush Life" (2015)',                                      5),
      h('sig',   'characteristic', 'Signature',     'First Swedish artist to have 2 top-10 UK hits simultaneously',5),
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
      h('sig',   'characteristic', 'Signature',     '"I Will Always Love You" held #14 on Billboard for 14 weeks',5),
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
      h('bp',    'birth_place',    'Place of birth','Ixelles, Brussels, Belgium',                              2),
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
      h('bp',    'birth_place',    'Place of birth','Thal, Styria, Austria',                                   2),
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
      h('fact1', 'characteristic', 'Fun fact',      'Performs almost all his own death-defying stunts',       1),
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
      h('fact2', 'characteristic', 'Famous game',   'Played through illness to score 38 points — "The Flu Game" (1997)',3),
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
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Real name',     'Born Edson Arantes do Nascimento',                       1),
      h('bd',    'birth_date',     'Date of birth', 'October 23, 1940',                                       2),
      h('bp',    'birth_place',    'Place of birth','Três Corações, Minas Gerais, Brazil',                    2),
      h('pk',    'peak_year',      'Career peak',   '1958 – 1970',                                            2),
      h('club2', 'club',           'Club',          'New York Cosmos (1975–1977)',                             3),
      h('ht',    'height',         'Height',        '173 cm (5\'8")',                                          3),
      h('nat',   'merit',          'National team', 'Brazil: 92 caps, 77 goals',                              3),
      h('fact2', 'characteristic', 'Historic',      'Youngest player to win the World Cup — aged 17 (1958)',  3),
      h('fact3', 'characteristic', 'Record',        'Scored 1,000+ goals in professional career',             3),
      h('jn',    'jersey_number',  'Jersey number', '#10 (Brazil national team)',                              4),
      h('club1', 'club',           'Club',          'Santos FC (1956–1974)',                                   4),
      h('kn',    'characteristic', 'Known as',      '"O Rei" — The King',                                     4),
      h('merit1','merit',          'Merit',         '3× FIFA World Cup winner (1958, 1962, 1970)',             5),
      h('merit2','merit',          'Merit',         'Named FIFA Player of the Century (alongside Maradona)',   5),
      h('sig',   'characteristic', 'Signature',     'Only player to win three FIFA World Cups',               5),
    ],
  },

  'diego-maradona': {
    categoryLabel: 'Athlete',
    nationality: 'argentina',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Fun fact',      'Became a national hero in Argentina',                    1),
      h('bd',    'birth_date',     'Date of birth', 'October 30, 1960',                                       2),
      h('bp',    'birth_place',    'Place of birth','Lanús, Buenos Aires Province, Argentina',                 2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1991',                                            2),
      h('club3', 'club',           'Club',          'Boca Juniors (1981–1982, 1995–1997)',                    3),
      h('ht',    'height',         'Height',        '165 cm (5\'5") — unusually short for a football legend', 3),
      h('nat',   'merit',          'National team', 'Argentina: 91 caps, 34 goals',                           3),
      h('merit2','merit',          'Merit',         'Led Napoli to 2 Serie A titles (1987, 1990)',             3),
      h('fact2', 'characteristic', 'Famous goal',   '"Goal of the Century" vs England, 1986 World Cup',       3),
      h('jn',    'jersey_number',  'Jersey number', '#10 (Argentina national team)',                           4),
      h('club1', 'club',           'Club',          'Napoli (1984–1991)',                                      4),
      h('club2', 'club',           'Club',          'FC Barcelona (1982–1984)',                                4),
      h('merit1','merit',          'Merit',         '1986 FIFA World Cup winner with Argentina',               5),
      h('kn',    'characteristic', 'Infamous goal', '"Hand of God" goal vs England, World Cup quarter-final 1986',5),
      h('sig',   'characteristic', 'Signature',     'Named FIFA Player of the Century (alongside Pelé)',      5),
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
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Personality',   'Famous for arrogant, charismatic confidence',            1),
      h('bd',    'birth_date',     'Date of birth', 'October 3, 1981',                                        2),
      h('bp',    'birth_place',    'Place of birth','Malmö, Sweden',                                           2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2016',                                            2),
      h('club3', 'club',           'Club',          'Ajax (2001–2004)',                                        3),
      h('club4', 'club',           'Club',          'Juventus (2004–2006)',                                    3),
      h('club5', 'club',           'Club',          'Inter Milan (2006–2009)',                                 3),
      h('club6', 'club',           'Club',          'Manchester United (2016–2018)',                           3),
      h('ht',    'height',         'Height',        '195 cm (6\'5") — unusually tall for a forward',          3),
      h('merit2','merit',          'Goal',          'Bicycle kick goal vs England (2012) — voted Puskas Award',3),
      h('jn',    'jersey_number',  'Jersey number', '#10 and #9 (various clubs)',                              4),
      h('club1', 'club',           'Club',          'Paris Saint-Germain (2012–2016)',                         4),
      h('club2', 'club',           'Club',          'FC Barcelona (2009–2010)',                                4),
      h('nat',   'merit',          'National team', 'Sweden: 116 caps, 62 goals — all-time top scorer',       5),
      h('sig',   'characteristic', 'Signature',     'Spectacular overhead and bicycle kick goals',            5),
      h('kn',    'characteristic', 'Self-description','"I am Zlatan Ibrahimovic" — no explanation needed',    5),
    ],
  },

  'cristiano-ronaldo': {
    categoryLabel: 'Athlete',
    nationality: 'portugal',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Fun fact',      'Has an airport and museum named after him in Madeira',   1),
      h('bd',    'birth_date',     'Date of birth', 'February 5, 1985',                                       2),
      h('bp',    'birth_place',    'Place of birth','Funchal, Madeira, Portugal',                              2),
      h('pk',    'peak_year',      'Career peak',   '2011 – 2018',                                            2),
      h('club3', 'club',           'Club',          'Sporting CP (2002–2003)',                                 3),
      h('club4', 'club',           'Club',          'Juventus (2018–2021)',                                    3),
      h('ht',    'height',         'Height',        '187 cm (6\'2")',                                          3),
      h('merit2','merit',          'Merit',         '5× UEFA Champions League winner',                        3),
      h('merit3','merit',          'Merit',         'UEFA Euro 2016 winner with Portugal',                    3),
      h('nat',   'merit',          'National team', 'Portugal: 205 caps, 130+ goals — all-time international top scorer',3),
      h('jn',    'jersey_number',  'Jersey number', '#7 (most clubs)',                                         4),
      h('club1', 'club',           'Club',          'Real Madrid (2009–2018)',                                 4),
      h('club2', 'club',           'Club',          'Manchester United (2003–2009, 2021–2022)',                4),
      h('merit1','merit',          'Merit',         '5× Ballon d\'Or winner',                                  5),
      h('sig',   'characteristic', 'Signature',     '"Siuuu!" goal celebration',                              5),
      h('sig2',  'characteristic', 'Record',        'All-time international goals record (130+)',              5),
    ],
  },

  'lionel-messi': {
    categoryLabel: 'Athlete',
    nationality: 'argentina',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Fun fact',      'Moved to Barcelona aged 13 for medical treatment',       1),
      h('bd',    'birth_date',     'Date of birth', 'June 24, 1987',                                          2),
      h('bp',    'birth_place',    'Place of birth','Rosario, Santa Fe, Argentina',                            2),
      h('pk',    'peak_year',      'Career peak',   '2009 – present',                                         2),
      h('club3', 'club',           'Club',          'Paris Saint-Germain (2021–2023)',                         3),
      h('ht',    'height',         'Height',        '170 cm (5\'7") — exceptional for a world #1 player',     3),
      h('merit2','merit',          'Merit',         '4× UEFA Champions League winner',                        3),
      h('merit3','merit',          'Merit',         'All-time top scorer in La Liga (474 goals)',              3),
      h('nat',   'merit',          'National team', 'Argentina: 180+ caps, 108+ goals',                       3),
      h('fact2', 'characteristic', 'Record',        'First player to win 8 Ballon d\'Or awards',              3),
      h('jn',    'jersey_number',  'Jersey number', '#10 (most clubs)',                                        4),
      h('club1', 'club',           'Club',          'FC Barcelona (2004–2021)',                                4),
      h('club2', 'club',           'Club',          'Inter Miami CF (2023–present)',                           4),
      h('merit1','merit',          'Merit',         '8× Ballon d\'Or winner — most in history',               5),
      h('merit4','merit',          'Merit',         'FIFA World Cup winner 2022 (Qatar)',                      5),
      h('sig',   'characteristic', 'Signature',     'Low centre-of-gravity dribbling that makes him look glued to the ball',5),
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
      h('merit4','merit',          'Merit',         'Won Australian Open while 2 months pregnant (2017)',     4),
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
      h('bp',    'birth_place',    'Place of birth','Sherwood Content, Trelawny, Jamaica',                    2),
      h('pk',    'peak_year',      'Career peak',   '2008 – 2016',                                            2),
      h('ht',    'height',         'Height',        '195 cm (6\'5") — much taller than typical sprinters',    3),
      h('merit2','merit',          'Record',        '200m World Record: 19.19 seconds (2009, Berlin)',        3),
      h('merit3','merit',          'Merit',         '11× World Championship gold medals',                     3),
      h('fact2', 'characteristic', 'Early career',  'Represented Jamaica in sprinting from age 15',           3),
      h('fact3', 'characteristic', 'Fact',          'Still training as football player after athletics retirement',3),
      h('merit4','merit',          'Merit',         '8× Olympic gold medals across 3 consecutive Olympics',   4),
      h('kn',    'characteristic', 'Known as',      '"Lightning Bolt" — fastest man in history',              4),
      h('merit1','merit',          'Record',        '100m World Record: 9.58 seconds (2009, Berlin)',         5),
      h('sig',   'characteristic', 'Signature',     '"Lightning Bolt" victory pose — index fingers pointing to sky',5),
      h('sig2',  'characteristic', 'Legacy',        'First athlete to win 100m AND 200m gold at same Olympics 3× in a row',5),
    ],
  },

  'roger-federer': {
    categoryLabel: 'Athlete',
    nationality: 'switzerland',
    hints: [
      h('prof',  'profession',     'Profession',    'Tennis player',                                          1),
      h('fact1', 'characteristic', 'Legacy',        'Co-founded the Laver Cup team tennis competition',       1),
      h('bd',    'birth_date',     'Date of birth', 'August 8, 1981',                                         2),
      h('bp',    'birth_place',    'Place of birth','Basel, Switzerland',                                      2),
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
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Fun fact',      'Symbol of Swedish football\'s golden 1990s era',         1),
      h('bd',    'birth_date',     'Date of birth', 'March 29, 1969',                                         2),
      h('bp',    'birth_place',    'Place of birth','Hudiksvall, Sweden',                                      2),
      h('pk',    'peak_year',      'Career peak',   '1992 – 1996',                                            2),
      h('club1', 'club',           'Club',          'IFK Norrköping (1988–1992)',                              3),
      h('club2', 'club',           'Club',          'Leeds United (1995–1997)',                               3),
      h('nat',   'merit',          'National team', 'Sweden: 47 caps, 26 goals',                              3),
      h('merit2','merit',          'Merit',         'Scored decisive goal at Euro 1992 vs Denmark',            3),
      h('ht',    'height',         'Height',        '177 cm (5\'10")',                                         3),
      h('club3', 'club',           'Club',          'Crystal Palace / Parma AC (1992–1996)',                  4),
      h('jn',    'jersey_number',  'Jersey number', '#10 (Parma)',                                            4),
      h('merit1','merit',          'Merit',         'Sweden 3rd place 1994 FIFA World Cup',                   4),
      h('sig',   'characteristic', 'Signature',     'Famous 360-degree spin/snurr move to escape defenders',  5),
      h('sig2',  'characteristic', 'Legacy',        'Became pizza restaurant owner after football career',    5),
    ],
  },

  'kennet-andersson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player — striker',                               1),
      h('fact1', 'characteristic', 'Physique',      'Imposing aerial target man at 192 cm',                   1),
      h('bd',    'birth_date',     'Date of birth', 'October 6, 1967',                                        2),
      h('bp',    'birth_place',    'Place of birth','Härnösand, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1991 – 1998',                                            2),
      h('club3', 'club',           'Club',          'Valencia CF (1995–1996)',                                 3),
      h('club4', 'club',           'Club',          'Bayer Leverkusen (1993–1995)',                            3),
      h('club5', 'club',           'Club',          'Fenerbahçe (1996–1998)',                                  3),
      h('ht',    'height',         'Height',        '192 cm (6\'4") — headed for Sweden time and again',       3),
      h('club1', 'club',           'Club',          'Malmö FF (1986–1991)',                                    4),
      h('club2', 'club',           'Club',          'Bologna FC (1991–1993)',                                  4),
      h('nat',   'merit',          'National team', 'Sweden: 83 caps, 31 goals',                              4),
      h('merit1','merit',          'Merit',         'Sweden 3rd place 1994 FIFA World Cup',                   5),
      h('sig',   'characteristic', 'Signature',     'Towering headers and strength in the box',               5),
    ],
  },

  'petter': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Rapper',                                                 1),
      h('fact1', 'characteristic', 'Legacy',        'Pioneer of Swedish hip-hop in the 1990s',                1),
      h('bd',    'birth_date',     'Date of birth', 'October 26, 1974',                                       2),
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1997 – 2008',                                            2),
      h('alb1',  'album',          'Album',         '"Hiphopskallar" (2002)',                                  3),
      h('alb2',  'album',          'Album',         '"Kontradansen" (1999)',                                   3),
      h('fact2', 'characteristic', 'Real name',     'Peter Eriksson',                                         3),
      h('fact3', 'characteristic', 'Style',         'Swedish-language rap with socially conscious lyrics',    3),
      h('alb3',  'album',          'Debut album',   '"Mitt sjätte sinne" (1997)',                              4),
      h('sig',   'characteristic', 'Signature',     'Helped establish Swedish as a credible hip-hop language', 5),
    ],
  },

  'veronica-maggio': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Fun fact',      'Multiple Grammis (Swedish Grammy) award winner',         1),
      h('bd',    'birth_date',     'Date of birth', 'November 10, 1981',                                      2),
      h('bp',    'birth_place',    'Place of birth','Uppsala, Sweden',                                         2),
      h('pk',    'peak_year',      'Career peak',   '2007 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Måndagsbarn" (2007)',                                    3),
      h('s2',    'song',           'Hit song',      '"Hela huset" (2011)',                                     3),
      h('s3',    'song',           'Hit song',      '"Tillfälligheternas spel" (2019)',                        3),
      h('s4',    'song',           'Hit song',      '"Jag kommer" (2010)',                                     3),
      h('alb1',  'album',          'Album',         '"Satan i gatan" (2009)',                                  4),
      h('s5',    'song',           'Hit song',      '"Sergels torg" (2013)',                                   4),
      h('s6',    'song',           'Hit song',      '"Välkommen in" (2007)',                                   5),
      h('sig',   'characteristic', 'Signature',     'Indie-pop queen of Swedish 2010s',                       5),
    ],
  },

  'bjorn-skifs': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist & actor',                                   1),
      h('fact1', 'characteristic', 'Fun fact',      'Also a popular Swedish actor and TV host',               1),
      h('bd',    'birth_date',     'Date of birth', 'April 26, 1947',                                         2),
      h('bp',    'birth_place',    'Place of birth','Avesta, Sweden',                                          2),
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
      h('fact1', 'characteristic', 'Legacy',        'Sweden\'s greatest jazz vocalist',                       1),
      h('bd',    'birth_date',     'Date of birth', 'September 20, 1937',                                     2),
      h('bp',    'birth_place',    'Place of birth','Hagfors, Värmland, Sweden',                               2),
      h('pk',    'peak_year',      'Career peak',   '1964 – 1985',                                            2),
      h('s1',    'song',           'Classic song',  '"Sakta vi gå genom stan"',                               3),
      h('fact2', 'characteristic', 'Acting',        'Also appeared in numerous Swedish films and TV',         3),
      h('s2',    'song',           'Classic song',  '"Monica Z" (2013 film about her life)',                  3),
      h('alb1',  'album',          'Iconic album',  '"Waltz for Debby" (1964) — recorded with Bill Evans Trio',5),
      h('sig',   'characteristic', 'Signature',     'Her "Waltz for Debby" is considered one of the greatest jazz recordings',5),
    ],
  },

  'hristo-stoichkov': {
    categoryLabel: 'Athlete',
    nationality: 'bulgaria',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Reputation',    'Known for explosive play and volatile temper',           1),
      h('bd',    'birth_date',     'Date of birth', 'February 8, 1966',                                       2),
      h('bp',    'birth_place',    'Place of birth','Plovdiv, Bulgaria',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1990 – 1996',                                            2),
      h('club2', 'club',           'Club',          'CSKA Sofia (1984–1990, 1998)',                            3),
      h('club3', 'club',           'Club',          'Parma AC (1994–1995)',                                    3),
      h('jn',    'jersey_number',  'Jersey number', '#8 (FC Barcelona)',                                       3),
      h('merit2','merit',          'Merit',         '1994 World Cup top scorer (6 goals, shared)',            4),
      h('club1', 'club',           'Club',          'FC Barcelona (1990–1995, 1996–1998)',                    4),
      h('merit3','merit',          'Merit',         'Led Bulgaria to 4th place at 1994 World Cup',            4),
      h('merit1','merit',          'Merit',         'Ballon d\'Or 1994 — greatest Bulgarian footballer',       5),
      h('sig',   'characteristic', 'Signature',     'Deadly left foot and fearless aggression',               5),
    ],
  },

  'jurgen-klinsmann': {
    categoryLabel: 'Athlete',
    nationality: 'germany',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Reputation',    'Criticized for theatrical diving/falling',               1),
      h('bd',    'birth_date',     'Date of birth', 'July 30, 1964',                                          2),
      h('bp',    'birth_place',    'Place of birth','Göppingen, Baden-Württemberg, Germany',                   2),
      h('pk',    'peak_year',      'Career peak',   '1989 – 1997',                                            2),
      h('club3', 'club',           'Club',          'Monaco (1992–1994)',                                      3),
      h('club4', 'club',           'Club',          'Tottenham Hotspur (1994–1995)',                           3),
      h('club5', 'club',           'Club',          'Bayern Munich (1995–1997)',                               3),
      h('nat',   'merit',          'National team', 'Germany: 108 caps, 47 goals',                            3),
      h('club1', 'club',           'Club',          'Inter Milan (1989–1992)',                                 4),
      h('merit2','merit',          'Merit',         'UEFA Euro 1996 winner with Germany',                     4),
      h('merit1','merit',          'Merit',         'FIFA World Cup 1990 winner with West Germany',           5),
      h('sig',   'characteristic', 'Signature',     'Later coached Germany (2004–2006) and USA national team', 5),
    ],
  },

  'jean-pierre-papin': {
    categoryLabel: 'Athlete',
    nationality: 'france',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Known as',      '"JPP" — France\'s greatest striker of his era',          1),
      h('bd',    'birth_date',     'Date of birth', 'November 5, 1963',                                       2),
      h('bp',    'birth_place',    'Place of birth','Boulogne-sur-Mer, France',                                2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 1994',                                            2),
      h('club2', 'club',           'Club',          'AC Milan (1992–1994)',                                    3),
      h('club3', 'club',           'Club',          'Bayern Munich (1994–1996)',                               3),
      h('nat',   'merit',          'National team', 'France: 54 caps, 30 goals',                              3),
      h('merit2','merit',          'Merit',         'French league top scorer 5 consecutive seasons (1988–92)',4),
      h('club1', 'club',           'Club',          'Olympique de Marseille (1986–1992)',                     4),
      h('merit3','merit',          'Merit',         'Scored in 3 consecutive European Cup finals (1991–93)',  4),
      h('merit1','merit',          'Merit',         'Ballon d\'Or 1991',                                      5),
      h('sig',   'characteristic', 'Signature',     '"Papinades" — trademark acrobatic volleys/bicycle kicks', 5),
    ],
  },

  'brian-laudrup': {
    categoryLabel: 'Athlete',
    nationality: 'denmark',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Family',        'Younger brother of football legend Michael Laudrup',     1),
      h('bd',    'birth_date',     'Date of birth', 'February 22, 1969',                                      2),
      h('bp',    'birth_place',    'Place of birth','Vienna, Austria (Danish nationality)',                    2),
      h('pk',    'peak_year',      'Career peak',   '1992 – 1998',                                            2),
      h('club2', 'club',           'Club',          'AC Milan (1992–1993)',                                    3),
      h('club3', 'club',           'Club',          'Fiorentina (1993–1994)',                                  3),
      h('club4', 'club',           'Club',          'Chelsea FC (1998)',                                       3),
      h('merit2','merit',          'Achievement',   '5× Danish Player of the Year',                           4),
      h('club1', 'club',           'Club',          'Glasgow Rangers (1994–1998) — 4 consecutive league titles',4),
      h('merit1','merit',          'Merit',         'Won UEFA Euro 1992 with Denmark — "The Miracle of Gothenburg"',5),
      h('sig',   'characteristic', 'Signature',     'Explosive right winger with electric pace and skill',   5),
    ],
  },

  'ole-einar-bjorndalen': {
    categoryLabel: 'Athlete',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('fact1', 'characteristic', 'Record',        'Competed in 8 consecutive Winter Olympics (1994–2018)',  1),
      h('bd',    'birth_date',     'Date of birth', 'January 27, 1974',                                       2),
      h('bp',    'birth_place',    'Place of birth','Simostranda, Numedal, Norway',                            2),
      h('pk',    'peak_year',      'Career peak',   '1998 – 2016',                                            2),
      h('merit2','merit',          'Merit',         '20 World Championship gold medals',                      3),
      h('fact2', 'characteristic', 'Country',       'Norwegian national biathlon team captain',               3),
      h('merit3','merit',          'Merit',         'Married Norwegian biathlete Darya Domracheva (2016)',     3),
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
      h('fact1', 'characteristic', 'Legacy',        'Described as most complete Swedish hockey player of his era',1),
      h('bd',    'birth_date',     'Date of birth', 'September 3, 1960',                                      2),
      h('bp',    'birth_place',    'Place of birth','Västerås, Sweden',                                        2),
      h('pk',    'peak_year',      'Career peak',   '1983 – 1996',                                            2),
      h('club2', 'club',           'Club',          'Färjestad BK (1980–1983, 1989–1996)',                    3),
      h('ht',    'height',         'Height',        '175 cm',                                                 3),
      h('merit2','merit',          'Merit',         'World Championship gold medal with Sweden',              3),
      h('kn',    'characteristic', 'Nickname',      'Known as "the Snake" by Calgary Flames fans',            4),
      h('merit3','merit',          'Record',        'First Swedish player to score 50 goals in NHL season (1987–88)',4),
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
      h('bp',    'birth_place',    'Place of birth','Rognes, Møre og Romsdal, Norway',                        2),
      h('pk',    'peak_year',      'Career peak',   '2002 – 2018',                                            2),
      h('merit2','merit',          'Merit',         '18 World Championship gold medals',                      3),
      h('fact2', 'characteristic', 'Feat',          'Won Olympic gold in 2018 PyeongChang at age 37',         3),
      h('nat',   'merit',          'Team',          'Norwegian national cross-country skiing team',            3),
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
      h('fact1', 'characteristic', 'Fun fact',      'New generation of Norwegian cross-country dominance',    1),
      h('bd',    'birth_date',     'Date of birth', 'October 22, 1996',                                       2),
      h('bp',    'birth_place',    'Place of birth','Trondheim, Norway',                                       2),
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
      h('bp',    'birth_place',    'Place of birth','Dalsbygda, Dalsbygda, Norway',                            2),
      h('pk',    'peak_year',      'Career peak',   '2010 – 2022',                                            2),
      h('merit2','merit',          'Merit',         '14 World Championship gold medals',                      3),
      h('merit3','merit',          'Merit',         'Norwegian national record holder in multiple distances',  3),
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
      h('bp',    'birth_place',    'Place of birth','Södertälje, Sweden',                                      2),
      h('pk',    'peak_year',      'Career peak',   '1974 – 1981',                                            2),
      h('kn',    'characteristic', 'Nickname',      '"Ice Borg" — famous for ice-cold composure under pressure',3),
      h('merit2','merit',          'Merit',         '6× French Open champion (1974–75, 1978–81)',             3),
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
      h('bp',    'birth_place',    'Place of birth','Västervik, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 1993',                                            2),
      h('kn',    'characteristic', 'Known for',     'Exceptional sportsmanship and serve-and-volley style',   3),
      h('merit2','merit',          'Merit',         '2× Wimbledon champion (1988, 1990)',                     3),
      h('merit3','merit',          'Merit',         '2× Australian Open champion (1985, 1987)',               3),
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
      h('bp',    'birth_place',    'Place of birth','Växjö, Sweden',                                           2),
      h('pk',    'peak_year',      'Career peak',   '1982 – 1988',                                            2),
      h('merit2','merit',          'Merit',         '3× French Open champion (1982, 1985, 1988)',             3),
      h('merit3','merit',          'Merit',         '2× Australian Open champion (1983, 1984)',               3),
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
      h('bp',    'birth_place',    'Place of birth','Tärnaby, Sweden',                                         2),
      h('pk',    'peak_year',      'Career peak',   '1974 – 1989',                                            2),
      h('merit2','merit',          'Merit',         '2× Olympic gold medals (1980 Lake Placid — slalom + GS)',3),
      h('fact2', 'characteristic', 'Record',        'Held world record of 86 World Cup victories for decades', 4),
      h('merit1','merit',          'Merit',         '3× overall World Cup champion (1976, 1977, 1978)',       5),
      h('sig',   'characteristic', 'Signature',     'Technical slalom genius from tiny northern Swedish village',5),
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
      h('bp',    'birth_place',    'Place of birth','Örnsköldsvik, Sweden',                                    2),
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
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('bd',    'birth_date',     'Date of birth', 'September 20, 1971',                                     2),
      h('bp',    'birth_place',    'Place of birth','Helsingborg, Sweden',                                     2),
      h('pk',    'peak_year',      'Career peak',   '1997 – 2006',                                            2),
      h('club2', 'club',           'Club',          'FC Barcelona (2004–2006)',                               3),
      h('club3', 'club',           'Club',          'Manchester United (loan, 2007)',                         3),
      h('nat',   'merit',          'National team', 'Sweden: 106 caps, 37 goals',                             3),
      h('merit2','merit',          'Merit',         'Scored 242 goals for Celtic FC in 7 seasons',            4),
      h('club1', 'club',           'Club',          'Celtic FC (1997–2004) — fan favourite "King of Kings"',  5),
      h('sig',   'characteristic', 'Signature',     'Dreads hairstyle + iconic goal-scoring celebrations at Celtic',5),
    ],
  },

  'mats-sundin': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('bd',    'birth_date',     'Date of birth', 'February 13, 1971',                                      2),
      h('bp',    'birth_place',    'Place of birth','Bromma, Stockholm, Sweden',                               2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2009',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold with Sweden',                     3),
      h('merit3','merit',          'Merit',         'Olympic gold with Sweden (2006)',                         3),
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
      h('bp',    'birth_place',    'Place of birth','Västerås, Sweden',                                        2),
      h('pk',    'peak_year',      'Career peak',   '1993 – 2012',                                            2),
      h('merit2','merit',          'Merit',         '7× Norris Trophy (best NHL defenseman)',                 3),
      h('merit3','merit',          'Merit',         'Olympic gold with Sweden (2006)',                         3),
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
      h('bp',    'birth_place',    'Place of birth','Lafayette, Louisiana, USA (Swedish/American)',            2),
      h('pk',    'peak_year',      'Career peak',   '2020 – present',                                         2),
      h('fact2', 'characteristic', 'Family',        'Father Greg Duplantis is an American former pole vaulter',3),
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
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
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
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1983 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"The Wheel of Life" (1991)',                              3),
      h('fact2', 'characteristic', 'Religion',      'Known as a Christian artist and spokesperson',           3),
      h('merit2','merit',          'Merit',         '2× Melodifestivalen winner',                             4),
      h('s2',    'song',           'Eurovision hit','"Fångad av en stormvind" — won Eurovision 1991 for Sweden',5),
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
      h('bp',    'birth_place',    'Place of birth','Halmstad, Sweden',                                        2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 2002',                                            2),
      h('band',  'lead_singer',    'Also known as', 'Co-founder of Roxette (with Marie Fredriksson)',         3),
      h('s1',    'song',           'Roxette hit',   '"The Look" (1988)',                                      4),
      h('s2',    'song',           'Roxette hit',   '"Joyride" (1991)',                                       4),
      h('sig',   'characteristic', 'Signature',     'Wrote most of Roxette\'s multi-million selling worldwide hits',5),
      h('s3',    'song',           'Roxette hit',    '"It Must Have Been Love" (1990) — his composition for Pretty Woman OST', 3),
      h('fact2', 'characteristic', 'Solo career',    'Also led Gyllene Tider — Sweden\'s biggest rock band of the 1980s',    3),
    ],
  },

  'marie-fredriksson': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Legacy',        'One of Sweden\'s most beloved voices',                   1),
      h('bd',    'birth_date',     'Date of birth', 'May 30, 1958',                                           2),
      h('bp',    'birth_place',    'Place of birth','Össjö, Kristianstad, Sweden',                             2),
      h('pk',    'peak_year',      'Career peak',   '1988 – 2002',                                            2),
      h('band',  'lead_singer',    'Also known as', 'Lead vocalist of Roxette (with Per Gessle)',             3),
      h('fact2', 'characteristic', 'Health',        'Diagnosed with brain tumour in 2002 — continued working',3),
      h('s1',    'song',           'Roxette hit',   '"Listen to Your Heart" (1989)',                          4),
      h('s2',    'song',           'Roxette hit',   '"It Must Have Been Love" (1990)',                        5),
      h('sig',   'characteristic', 'Signature',     'Voice of Roxette — died December 2019, mourned by Sweden',5),
    ],
  },

  'robyn': {
    categoryLabel: 'Musikartist',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                           1),
      h('fact1', 'characteristic', 'Legacy',        'Pioneer of Swedish electropop and feminist pop',         1),
      h('bd',    'birth_date',     'Date of birth', 'June 12, 1979',                                          2),
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
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
      h('bp',    'birth_place',    'Place of birth','Gothenburg, Sweden',                                      2),
      h('pk',    'peak_year',      'Career peak',   '2000 – present',                                         2),
      h('s1',    'song',           'Hit song',      '"Du är det vackraste jag vet" (2000)',                    3),
      h('s2',    'song',           'Hit song',      '"Känn ingen sorg för mig Göteborg" (2003)',              3),
      h('s3',    'song',           'Hit song',      '"Kom igen Lena!" (2008)',                                 4),
      h('sig',   'characteristic', 'Signature',     'Voice of Gothenburg — Sweden\'s most adored rock troubadour',5),
      h('alb1',  'album',          'Album',          '"Vinter och vår" (2002)',                                               3),
      h('fact2', 'characteristic', 'Live legend',    'Sold out Ullevi (50 000 seats) in Gothenburg multiple times',           4),
    ],
  },

  'freddie-ljungberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('bd',    'birth_date',     'Date of birth', 'April 16, 1977',                                         2),
      h('bp',    'birth_place',    'Place of birth','Vittsjö, Sweden',                                         2),
      h('pk',    'peak_year',      'Career peak',   '1998 – 2006',                                            2),
      h('club1', 'club',           'Club',          'Arsenal FC (1998–2007)',                                 3),
      h('merit2','merit',          'Merit',         'Part of Arsenal\'s Invincibles 2003–04 (unbeaten season)',4),
      h('sig2',  'characteristic', 'Known for',     'Bright red Mohawk hairstyle + Calvin Klein underwear model',4),
      h('nat',   'merit',          'National team', 'Sweden: 75 caps, 16 goals',                              4),
      h('sig',   'characteristic', 'Signature',     'Red Mohawk — most recognizable haircut in Premier League history',5),
      h('fact2', 'characteristic', 'Fame',           'Calvin Klein underwear model — one of football\'s biggest style icons',   3),
    ],
  },

  'martin-dahlin': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('bd',    'birth_date',     'Date of birth', 'April 16, 1968',                                         2),
      h('bp',    'birth_place',    'Place of birth','Liatorp, Alvesta, Sweden',                                2),
      h('pk',    'peak_year',      'Career peak',   '1991 – 1998',                                            2),
      h('club1', 'club',           'Club',          'Borussia Mönchengladbach (1991–1996)',                   3),
      h('club2', 'club',           'Club',          'Roma / Blackburn Rovers (1996–1998)',                    3),
      h('nat',   'merit',          'National team', 'Sweden: 60 caps, 29 goals',                              4),
      h('merit1','merit',          'Merit',         'Sweden 3rd place — top scorer at 1994 World Cup (4 goals)',5),
      h('sig',   'characteristic', 'Signature',     'Swedish hero of 1994 World Cup alongside Brolin and Andersson',5),
      h('merit2','merit',          'Merit',          'Scored 4 World Cup goals in 1994 — crucial strikes in knockout rounds',  3),
    ],
  },

  // ── INTERNATIONELLA LEGENDER ───────────────────────────────────────────────

  'david-beckham': {
    categoryLabel: 'Athlete',
    nationality: 'england',
    hints: [
      h('prof',  'profession',     'Profession',    'Football player',                                        1),
      h('fact1', 'characteristic', 'Celebrity',     'Married Victoria Adams (Posh Spice from Spice Girls)',   1),
      h('bd',    'birth_date',     'Date of birth', 'May 2, 1975',                                            2),
      h('bp',    'birth_place',    'Place of birth','Leytonstone, London, England',                            2),
      h('pk',    'peak_year',      'Career peak',   '1997 – 2007',                                            2),
      h('club3', 'club',           'Club',          'LA Galaxy (2007–2012)',                                  3),
      h('club4', 'club',           'Club',          'AC Milan (loan, 2009)',                                  3),
      h('nat',   'merit',          'National team', 'England: 115 caps, 17 goals — former captain',           3),
      h('club2', 'club',           'Club',          'Real Madrid (2003–2007)',                                4),
      h('merit2','merit',          'Achievement',   'Champions League winner with Manchester United (1999)',   4),
      h('club1', 'club',           'Club',          'Manchester United (1993–2003)',                          4),
      h('jn',    'jersey_number',  'Jersey number', '#7 (Manchester United, England)',                        4),
      h('sig',   'characteristic', 'Signature',     'Famous free kicks + being fashion/celebrity icon',       5),
    ],
  },

  'wayne-gretzky': {
    categoryLabel: 'Athlete',
    nationality: 'canada',
    hints: [
      h('prof',  'profession',     'Profession',    'Ice hockey player',                                      1),
      h('bd',    'birth_date',     'Date of birth', 'January 26, 1961',                                       2),
      h('bp',    'birth_place',    'Place of birth','Brantford, Ontario, Canada',                              2),
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
      h('bp',    'birth_place',    'Place of birth','Pinner, Middlesex, England',                              2),
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
      h('bp',    'birth_place',    'Place of birth','Brixton, London, England',                                2),
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
      h('fact1', 'characteristic', 'Tragedy',       'Died in helicopter crash in Calabasas, January 26, 2020',1),
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
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1942 – 1956',                                            2),
      h('mv1',   'movie',          'Film',          '"Autumn Sonata" (1978) — directed by Ingmar Bergman',    3),
      h('mv2',   'movie',          'Film',          '"For Whom the Bell Tolls" (1943)',                        3),
      h('mv3',   'movie',          'Film',          '"Notorious" (1946) — directed by Hitchcock',             4),
      h('mv4',   'movie',          'Film',          '"Casablanca" (1942) — "Here\'s looking at you, kid"',    5),
      h('merit', 'merit',          'Achievement',   '3× Academy Award winner',                                5),
      h('sig',   'characteristic', 'Signature',     'Swedish immigrant who became a Hollywood legend',        5),
    ],
  },

  // ── BAND ──────────────────────────────────────────────────────────────────

  'abba': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Pop/pop music group',                                    1),
      h('fact1', 'member_count',   'Members',       '4 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Stockholm, Sweden',                                       2),
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
      h('sig',   'characteristic', 'Signature',     'Swedish ABBA stands for first letters of members\' names',5),
    ],
  },

  'roxette': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Pop duo',                                                1),
      h('fact1', 'member_count',   'Members',       '2 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Halmstad, Sweden',                                        2),
      h('pk',    'peak_year',      'Active years',  '1986 – 2019',                                            2),
      h('m1',    'lead_singer',    'Lead singer',   'Marie Fredriksson (died December 9, 2019)',               3),
      h('m2',    'band_member',    'Member',        'Per Gessle (guitar/vocals)',                              3),
      h('s1',    'song',           'Hit song',      '"Joyride" (1991)',                                        3),
      h('s2',    'song',           'Hit song',      '"Listen to Your Heart" (1989)',                           3),
      h('s3',    'song',           'Film hit',      '"It Must Have Been Love" (1990) — from "Pretty Woman"',  5),
      h('s4',    'song',           'Iconic hit',    '"The Look" (1989)',                                       5),
      h('sig',   'characteristic', 'Signature',     '"The Look" reached #1 in USA — first Swedish duo to do so',5),
    ],
  },

  'beatles': {
    categoryLabel: 'Band',
    nationality: 'uk',
    hints: [
      h('prof',  'profession',     'Category',      'Rock group',                                             1),
      h('fact1', 'member_count',   'Members',       '4 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Liverpool, England',                                      2),
      h('pk',    'peak_year',      'Active years',  '1960 – 1970',                                            2),
      h('m1',    'band_member',    'Member',        'John Lennon (vocals/guitar) — shot and killed 1980',     3),
      h('m2',    'band_member',    'Member',        'Paul McCartney (vocals/bass)',                            3),
      h('m3',    'band_member',    'Member',        'George Harrison (guitar) — died 2001',                   3),
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
      h('bp',    'birth_place',    'Origin',        'London, England',                                         2),
      h('pk',    'peak_year',      'Active years',  '1970 – 1991 (ongoing without Freddie)',                   2),
      h('m2',    'band_member',    'Member',        'Brian May (guitar)',                                      3),
      h('m3',    'band_member',    'Member',        'Roger Taylor (drums)',                                    3),
      h('m4',    'band_member',    'Member',        'John Deacon (bass)',                                      3),
      h('s1',    'song',           'Hit song',      '"We Are the Champions" (1977)',                           3),
      h('s2',    'song',           'Hit song',      '"Don\'t Stop Me Now" (1979)',                             3),
      h('s3',    'song',           'Hit song',      '"Somebody to Love" (1976)',                               3),
      h('m1',    'lead_singer',    'Lead singer',   'Freddie Mercury — died November 24, 1991',               4),
      h('merit', 'merit',          'Achievement',   'Live Aid performance 1985 — voted greatest live performance in history',4),
      h('s4',    'song',           'Iconic hit',    '"We Will Rock You" (1977)',                               5),
      h('s5',    'song',           'Signature song','"Bohemian Rhapsody" (1975) — no intro, no chorus, unlike any pop song',5),
      h('sig',   'characteristic', 'Signature',     'Freddie Mercury\'s flamboyant stage presence',           5),
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
      h('m1',    'lead_singer',    'Lead singer',   'Kurt Cobain — died April 5, 1994',                       4),
      h('alb1',  'album',          'Iconic album',  '"Nevermind" (1991) — baby swimming for dollar bill cover',4),
      h('s4',    'song',           'Iconic hit',    '"Smells Like Teen Spirit" (1991)',                        5),
      h('sig',   'characteristic', 'Signature',     '"Teen Spirit" defined a generation and killed hair metal overnight',5),
    ],
  },

  // ── LÄNGDSKIDÅKARE (SVERIGE) ──────────────────────────────────────────────

  'assar-ronnlund': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'August 26, 1937',                                        2),
      h('bp',    'birth_place',    'Place of birth','Nacka, Sweden',                                           2),
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
      h('bp',    'birth_place',    'Place of birth','Lima, Dalarna, Sweden',                                   2),
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
      h('bp',    'birth_place',    'Place of birth','Umeå, Sweden',                                            2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1994',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medals',                         3),
      h('merit1','merit',          'Merit',         'Olympic gold — 50 km classical (1988 Calgary)',          5),
      h('sig',   'characteristic', 'Signature',     'Dominated long-distance cross-country in the late 1980s',5),
      h('merit3','merit',          'Merit',          'Multiple World Cup stage victories in the 1980s and 1990s',               3),
      h('fact2', 'characteristic', 'Distance',       'Specialised in the 50 km — the toughest cross-country race',             3),
      h('fact3', 'characteristic', 'Background',     'From Umeå — in the heart of northern Swedish sports culture',           2),
    ],
  },

  'per-olofsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'October 7, 1973',                                        2),
      h('bp',    'birth_place',    'Place of birth','Sweden',                                                  2),
      h('pk',    'peak_year',      'Career peak',   '2000 – 2010',                                            2),
      h('merit1','merit',          'Merit',         'Swedish national cross-country team member 2000s',       4),
      h('sig',   'characteristic', 'Signature',     'Consistent World Cup performer for Sweden',              5),
    ],
  },

  'ebba-andersson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'July 10, 1997',                                          2),
      h('bp',    'birth_place',    'Place of birth','Sweden',                                                  2),
      h('pk',    'peak_year',      'Career peak',   '2020 – present',                                         2),
      h('merit2','merit',          'Merit',         'World Championship medals',                              3),
      h('merit1','merit',          'Merit',         'Rising star of Swedish cross-country skiing',            4),
      h('sig',   'characteristic', 'Signature',     'Part of new generation carrying Swedish cross-country tradition',5),
      h('fact2', 'characteristic', 'Generation',     'Carries on Sweden\'s great cross-country tradition into the 2020s',      2),
      h('fact3', 'characteristic', 'Versatility',    'Strong across sprint and distance disciplines',                          2),
      h('merit3','merit',          'Merit',          'World Championship relay medal representing Sweden',                     3),
    ],
  },

  'anders-sodergren': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'September 8, 1977',                                      2),
      h('bp',    'birth_place',    'Place of birth','Sweden',                                                  2),
      h('pk',    'peak_year',      'Career peak',   '2002 – 2014',                                            2),
      h('merit2','merit',          'Merit',         'World Championship and World Cup medals',                3),
      h('merit1','merit',          'Merit',         'World Cup stage victories for Sweden',                   4),
      h('sig',   'characteristic', 'Signature',     'Reliable long-distance cross-country performer',         5),
      h('fact2', 'characteristic', 'Style',          'Known for reliable long-distance technique and race consistency',          2),
      h('merit3','merit',          'Merit',          'World Cup stage victories for Sweden in the 2000s',                     3),
      h('fact3', 'characteristic', 'Team',           'Competed alongside Charlotte Kalla in Sweden\'s national team era',    2),
    ],
  },

  'gunde-svan': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Cross-country skier',                                    1),
      h('bd',    'birth_date',     'Date of birth', 'January 12, 1962',                                       2),
      h('bp',    'birth_place',    'Place of birth','Tynäset, Dalarna, Sweden',                                2),
      h('pk',    'peak_year',      'Career peak',   '1984 – 1991',                                            2),
      h('merit2','merit',          'Merit',         'World Championship gold medals',                         3),
      h('merit3','merit',          'Merit',         'Olympic relay gold (1984, 1988)',                        3),
      h('merit1','merit',          'Merit',         '2× Olympic individual gold medals (1984 Sarajevo)',      5),
      h('sig',   'characteristic', 'Signature',     'One of Sweden\'s greatest cross-country skiers — dominated 1984',5),
      h('fact2', 'characteristic', 'Distances',      'Dominated the 15 km and 50 km events throughout the 1980s',              2),
      h('fact3', 'characteristic', 'Background',     'From Tynäset, Dalarna — heartland of Swedish cross-country skiing',     2),
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
      h('bp',    'birth_place',    'Place of birth','Östersund, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '2018 – present',                                         2),
      h('merit2','merit',          'Merit',         'Multiple World Championship gold medals',                3),
      h('merit3','merit',          'Merit',         'Swedish national biathlon team',                         3),
      h('merit1','merit',          'Merit',         'Olympic gold — individual (2018 PyeongChang)',           5),
      h('sig',   'characteristic', 'Signature',     'Dominated individual biathlon with precision shooting',  5),
      h('fact2', 'characteristic', 'Home',           'Trains in Östersund — Sweden\'s biathlon capital',                       3),
    ],
  },

  'elvira-oberg': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('fact1', 'characteristic', 'Family',        'Younger sister of Olympic champion Hanna Öberg',        1),
      h('bd',    'birth_date',     'Date of birth', 'September 19, 1999',                                     2),
      h('bp',    'birth_place',    'Place of birth','Östersund, Sweden',                                       2),
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
      h('bp',    'birth_place',    'Place of birth','Sweden',                                                  2),
      h('merit1','merit',          'Merit',         'Swedish national biathlon team — World Cup competitor',  4),
      h('sig',   'characteristic', 'Signature',     'Swedish biathlete on the World Cup circuit',             5),
    ],
  },

  'sebastian-samuelsson': {
    categoryLabel: 'Athlete',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Biathlete',                                              1),
      h('bd',    'birth_date',     'Date of birth', 'February 21, 1997',                                      2),
      h('bp',    'birth_place',    'Place of birth','Gothenburg, Sweden',                                      2),
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
      h('bp',    'birth_place',    'Place of birth','Jokkmokk, Sweden (Sami heritage)',                        2),
      h('pk',    'peak_year',      'Career peak',   '2006 – 2014',                                            2),
      h('merit2','merit',          'Merit',         'World Championship medals for Sweden',                   3),
      h('merit1','merit',          'Merit',         'Olympic gold — pursuit (2010 Vancouver)',                5),
      h('sig',   'characteristic', 'Signature',     'From northernmost Sweden — Jokkmokk, a place of biathlon tradition',5),
      h('fact2', 'characteristic', 'Heritage',       'Of Sami heritage from Jokkmokk — Sweden\'s indigenous far north',        2),
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
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '1926 – 1941',                                            2),
      h('mv1',   'movie',          'Film',          '"Anna Karenina" (1935)',                                  3),
      h('mv2',   'movie',          'Film',          '"Queen Christina" (1933)',                               3),
      h('mv3',   'movie',          'Film',          '"Ninotchka" (1939) — comedy film',                       4),
      h('mv4',   'movie',          'Film',          '"Grand Hotel" (1932) — Academy Award winner',            4),
      h('kn',    'characteristic', 'Known as',      '"The Divine" — Hollywood\'s ultimate enigma',            4),
      h('sig2',  'characteristic', 'Famous quote',  '"I want to be alone"',                                   5),
      h('sig',   'characteristic', 'Signature',     'First Swedish star to conquer Hollywood — retired at only 36',5),
    ],
  },

  'max-von-sydow': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Career span',   'Career spanning over 70 years across Swedish and Hollywood cinema',1),
      h('bd',    'birth_date',     'Date of birth', 'April 10, 1929',                                         2),
      h('bp',    'birth_place',    'Place of birth','Lund, Sweden',                                            2),
      h('pk',    'peak_year',      'Career peak',   '1957 – 2020',                                            2),
      h('mv1',   'movie',          'Film',          '"Flash Gordon" — Ming the Merciless (1980)',              3),
      h('mv2',   'movie',          'Film',          '"Star Wars: The Force Awakens" — Lor San Tekka (2015)',  3),
      h('mv3',   'movie',          'Film',          '"The Exorcist" — Father Merrin (1973)',                  4),
      h('mv4',   'movie',          'Film',          '"The Seventh Seal" (1957) — played chess with Death',   5),
      h('sig',   'characteristic', 'Signature',     'Iconic chess game with Death in Bergman\'s "The Seventh Seal"',5),
    ],
  },

  'joel-kinnaman': {
    categoryLabel: 'Actor',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Profession',    'Actor',                                                  1),
      h('fact1', 'characteristic', 'Background',    'Son of American screenwriter Tim Kinnaman',              1),
      h('bd',    'birth_date',     'Date of birth', 'November 25, 1979',                                      2),
      h('bp',    'birth_place',    'Place of birth','Stockholm, Sweden',                                       2),
      h('pk',    'peak_year',      'Career peak',   '2010 – present',                                         2),
      h('tv1',   'tv_show',        'TV series',     '"The Killing" — US crime drama (2011–2014)',              3),
      h('tv2',   'tv_show',        'TV series',     '"Altered Carbon" — Netflix sci-fi (2018)',               3),
      h('mv1',   'movie',          'Film',          '"RoboCop" (2014 remake)',                                 4),
      h('mv2',   'movie',          'Film',          '"Suicide Squad" — Rick Flag (2016)',                     4),
      h('sig',   'characteristic', 'Signature',     'Swedish actor who broke through in American TV and blockbusters',5),
    ],
  },

  // ── ANIMERADE KARAKTÄRER ──────────────────────────────────────────────────

  'bamse': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Animated bear — Swedish comic character',               1),
      h('cr',    'creation_year',  'Created',        '1966',                                                  2),
      h('prod',  'producer',       'Creator',        'Rune Andréasson',                                       2),
      h('t1',    'characteristic', 'Appearance',     'Blue overalls, round friendly face',                    3),
      h('t2',    'characteristic', 'Friends',        'Best friends: Lille Skutt (hare) and Skalman (turtle)', 3),
      h('t3',    'characteristic', 'Values',         'Always kind, never uses strength to bully',             3),
      h('t4',    'characteristic', 'Published in',   'Comic magazine "Bamse — Världens starkaste björn" since 1966',4),
      h('sig',   'characteristic', 'Signature',      'Becomes world\'s strongest when eating "dunder honey"', 5),
      h('power', 'characteristic', 'Superpower',     'Dunder honey makes him as strong as many bears combined',                3),
      h('merit', 'merit',          'Achievement',    'Sweden\'s best-selling comic magazine for over 50 consecutive years',   4),
    ],
  },

  'mumin': {
    categoryLabel: 'Character',
    nationality: 'finland',
    hints: [
      h('cat',   'characteristic', 'Type',          'Book/animated character — Finnish-Swedish creation',    1),
      h('cr',    'creation_year',  'Created',        '1945',                                                  2),
      h('prod',  'producer',       'Creator',        'Tove Jansson (Finnish-Swedish author)',                 2),
      h('t1',    'characteristic', 'Appearance',     'Round white hippo-like creature',                      3),
      h('t2',    'characteristic', 'Home',           'Lives in Moominvalley with Moominmamma and Moominpappa',3),
      h('t3',    'characteristic', 'Friends',        'Snorkmaiden, Little My (fierce tiny character), Sniff', 3),
      h('t4',    'characteristic', 'Adaptations',    'Multiple animated TV series including the 1990 anime', 4),
      h('sig',   'characteristic', 'Signature',      '"Mumintrollet" — Finnish-Swedish cultural icon beloved across Scandinavia',5),
      h('fact5', 'characteristic', 'Creator',        'Tove Jansson was Finnish-Swedish — making Moomin uniquely Nordic',        3),
      h('merit', 'merit',          'Global reach',   'One of the most recognized characters in Japan, Europe and Scandinavia', 4),
    ],
  },

  'alfons-aberg': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish children\'s book character',                    1),
      h('cr',    'creation_year',  'Created',        '1972',                                                  2),
      h('prod',  'producer',       'Creator',        'Gunilla Bergström',                                     2),
      h('t1',    'characteristic', 'Character',      'Young Swedish boy with a loving but often absent father',3),
      h('t2',    'characteristic', 'Published by',   'Rabén & Sjögren — Swedish picture book series',        3),
      h('t3',    'characteristic', 'International',  'Known as "Alfie Atkins" in English translation',       4),
      h('sig',   'characteristic', 'Signature',      'Everyday childhood adventures recognized by generations of Swedish children',5),
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
      h('t4',    'characteristic', 'In Sweden',      'Swedish Christmas tradition — the Donald Duck special airs every Christmas Eve',4),
      h('sig',   'characteristic', 'Signature',      '"Donald Duck" Christmas show — watched by millions of Swedes every Dec 24th',5),
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
      h('t2',    'characteristic', 'Swedish name',   '"Jan Långben" means "Long Legs Jan" in Swedish',       3),
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
      h('cat',   'characteristic', 'Type',          'Swedish children\'s book character',                    1),
      h('cr',    'creation_year',  'Created',        '1955',                                                  2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Lillebror och Karlsson på taket"',  2),
      h('t1',    'characteristic', 'Appearance',     'Plump little man with a propeller on his back',        3),
      h('t2',    'characteristic', 'Lives',          'In a small house on the rooftop of a Stockholm apartment',3),
      h('t3',    'characteristic', 'Best friend',    'A young boy called "Lillebror" (Little Brother)',      3),
      h('t4',    'characteristic', 'Personality',    'Vain, self-important but lovable — "world\'s best Karlsson"',4),
      h('sig',   'characteristic', 'Signature',      '"Lugna ner dig!" (Calm down!) — his catchphrase when things go wrong',5),
      h('quote', 'characteristic', 'Famous quote',   '"Jag är en lagom fet man i sin bästa ålder" — his self-description',   3),
      h('film',  'characteristic', 'Adaptations',    'Swedish animated films and TV series made him an enduring classic',     3),
    ],
  },

  'nalle-puh': {
    categoryLabel: 'Character',
    nationality: 'uk',
    hints: [
      h('cat',   'characteristic', 'Type',          'British children\'s book / Disney animated character', 1),
      h('cr',    'creation_year',  'Created',        '1926 (book)',                                          2),
      h('prod',  'producer',       'Creator',        'A.A. Milne — "Winnie-the-Pooh" (1926)',               2),
      h('t1',    'characteristic', 'Home',           'Lives in the Hundred Acre Wood',                      3),
      h('t2',    'characteristic', 'Obsession',      'Loves honey above everything else',                   3),
      h('t3',    'characteristic', 'Friends',        'Piglet, Tigger, Eeyore, Rabbit, Owl, Kanga & Roo',   3),
      h('t4',    'characteristic', 'Disney',         'Disney adaptations from 1966 make him globally iconic',4),
      h('sig',   'characteristic', 'Signature',      'Red short shirt and honey jar — simplest design, most beloved character',5),
      h('fact5', 'characteristic', 'Origin',         'Based on a real bear named Winnie — mascot of a Canadian WWI regiment',  3),
      h('fact6', 'characteristic', 'Inspiration',    'Christopher Robin\'s stuffed bear — inspired by A.A. Milne\'s son\'s toy', 3),
    ],
  },

  // ── KARAKTÄRSROLLER ───────────────────────────────────────────────────────

  'pippi-langstrump': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character — book/film/TV',            1),
      h('cr',    'creation_year',  'Created',        '1945',                                                  2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Pippi Långstrump" (1945)',          2),
      h('t1',    'characteristic', 'Appearance',     'Red braids sticking straight out, freckles, mismatched stockings',3),
      h('t2',    'characteristic', 'Home',           'Lives alone in "Villa Villekulla" with her horse and monkey "Hr. Nilsson"',3),
      h('t3',    'characteristic', 'Strength',       'Claims to be "the world\'s strongest girl"',           3),
      h('t4',    'characteristic', 'Family',         'Father is King of a South Sea island',                 4),
      h('tv',    'tv_show',        'TV series',      'Iconic 1969 Swedish TV series with Inger Nilsson as Pippi',4),
      h('sig',   'characteristic', 'Signature',      'Free spirit who lives by her own rules — no parents, no bedtime',5),
      h('t5',    'characteristic', 'Global reach',   'Translated into over 70 languages — among the most read children\'s books', 3),
    ],
  },

  'ronja-rovardotter': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character — novel/film/anime',        1),
      h('cr',    'creation_year',  'Created',        '1981 (novel)',                                         2),
      h('prod',  'producer',       'Creator',        'Astrid Lindgren — "Ronja Rövardotter" (1981)',        2),
      h('t1',    'characteristic', 'Setting',        'Lives in Mattisborgen castle in the forest',           3),
      h('t2',    'characteristic', 'Family',         'Father is robber chief Mattis',                       3),
      h('t3',    'characteristic', 'Friendship',     'Befriends Birk from the rival Borka robber clan',     4),
      h('mv',    'movie',          'Film',           'Film adaptation (1984) directed by Tage Danielsson',   4),
      h('sig',   'characteristic', 'Signature',      'Wild child of the forest — Lindgren\'s most adventurous heroine',5),
      h('fact2', 'characteristic', 'Adaptation',    'Studio Ghibli created a Japanese anime series adaptation (2014)',         3),
      h('fact3', 'characteristic', 'Depth',          'One of Lindgren\'s most mature and adventurous stories for children',   3),
    ],
  },

  'stig-helmer': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character — film series',             1),
      h('prod',  'producer',       'Created in',     '"Sällskapsresan" (1980) and spin-off films',           2),
      h('t1',    'characteristic', 'Played by',      'Lasse Åberg — who also wrote and directed the films', 3),
      h('t2',    'characteristic', 'Character',      'Quintessential Swedish everyman on package holiday',   3),
      h('t3',    'characteristic', 'Adventure',      'Goes on charter trip to Gran Canaria in the first film',3),
      h('mv',    'movie',          'Film',           '"Sällskapsresan" (1980) — Sweden\'s most-watched film ever',5),
      h('sig',   'characteristic', 'Signature',      'Swedish "lagom" identity — humble, cautious, unexpectedly brave',5),
      h('fact2', 'characteristic', 'Box office',     'Sällskapsresan became the highest-grossing Swedish film ever on release', 3),
      h('char2', 'characteristic', 'Identity',       'Represents the classic shy, awkward but kind-hearted Swedish everyman', 3),
      h('sequel','characteristic', 'Sequels',        'Character returned in "Sällskapsresan II — Snowroller" (1985)',          3),
    ],
  },

  'ole': {
    categoryLabel: 'Character',
    nationality: 'norway',
    hints: [
      h('cat',   'characteristic', 'Type',          'Norwegian fictional character — Swedish film',          1),
      h('prod',  'producer',       'Created in',     '"Sällskapsresan" (1980)',                              2),
      h('actor', 'characteristic', 'Played by',      'Norwegian comedian and actor Jon Skolmen',             2),
      h('t1',    'characteristic', 'Nationality',    'Norwegian tourist befriended by Stig-Helmer on holiday',3),
      h('t2',    'characteristic', 'Chemistry',      'Swedish–Norwegian comedy of contrasts with Stig-Helmer',3),
      h('t3',    'characteristic', 'Personality',    'Cheerful, outgoing and quick to celebrate — a perfect foil to shy Stig-Helmer',3),
      h('sequel','movie',          'Sequel',         'Also appears in "Sällskapsresan II — Snowroller" (1985)',4),
      h('dest',  'characteristic', 'Destination',    'Met Stig-Helmer on a charter holiday to Gran Canaria', 3),
      h('mv',    'movie',          'Film',           '"Sällskapsresan" (1980) — charter trip to Gran Canaria',5),
      h('sig',   'characteristic', 'Signature',      'Classic Swedish film duo: Stig-Helmer (Sweden) and Ole (Norway)',5),
    ],
  },

  'martin-beck': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish detective character — crime novels/TV',         1),
      h('cr',    'creation_year',  'Created',        '1965',                                                  2),
      h('prod',  'producer',       'Creator',        'Maj Sjöwall and Per Wahlöö — "Roman om ett brott" (10 novels)',2),
      h('t1',    'characteristic', 'Occupation',     'Stockholm homicide detective — National Murder Commission',3),
      h('t2',    'characteristic', 'Style',          'Social-realist police procedural — critique of Swedish society',3),
      h('tv',    'tv_show',        'TV series',      '"Beck" (1997–2018) TV series with Peter Haber',        4),
      h('sig',   'characteristic', 'Signature',      'The first major Swedish crime detective — inspired all Swedish crime fiction after',5),
      h('fact2', 'characteristic', 'Series',        'The original 10 novels span 1965–1975',                                   2),
      h('merit2','merit',          'Legacy',         'Inspired Henning Mankell\'s Wallander — essentially created Nordic crime', 4),
      h('char2', 'characteristic', 'Character',      'Quiet, divorced, pipe-smoking detective — the anti-hero of Swedish crime', 3),
    ],
  },

  'carl-hamilton': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish spy character — thriller novel series',         1),
      h('cr',    'creation_year',  'Created',        '1986',                                                  2),
      h('prod',  'producer',       'Creator',        'Jan Guillou — "Coq Rouge" novel series',              2),
      h('t1',    'characteristic', 'Occupation',     'Swedish military intelligence officer',                 3),
      h('t2',    'characteristic', 'Codename',       '"Coq Rouge" — works for Swedish intelligence service MUST',3),
      h('tv',    'tv_show',        'TV series',      'TV films with Mikael Persbrandt as Carl Hamilton',     4),
      h('sig',   'characteristic', 'Signature',      'Sweden\'s answer to James Bond — elite naval officer turned spy',5),
      h('fact2', 'characteristic', 'Series',        'Jan Guillou wrote 10 Coq Rouge novels (1986–2012)',                        2),
      h('char2', 'characteristic', 'Training',       'Former Swedish naval officer — Sweden\'s equivalent of a Navy SEAL',   3),
      h('fact3', 'characteristic', 'Controversy',    'The novels sparked debate about Sweden\'s secret intelligence services', 3),
    ],
  },

  'rudolf-andersson': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character',                           1),
      h('prod',  'producer',       'Created in',     'Sune book series by Anders Jacobsson and Sören Olsson',2),
      h('cr',    'creation_year',  'Books began',    '1984 — "Sune" book series first published',            2),
      h('t1',    'characteristic', 'Role',           'Sune\'s father — an ordinary Swedish family man',     3),
      h('t2',    'characteristic', 'Family',         'Married to Karin Andersson — Sune\'s longsuffering mother',3),
      h('t3',    'characteristic', 'Suburb life',    'Epitomises Swedish suburban family life — lovable and slightly hapless',3),
      h('film',  'movie',          'First film',     'Depicted in "Sunes sommar" (1993) — first Sune film adaptation',4),
      h('films', 'characteristic', 'Film series',    'Appeared across multiple Sune film adaptations from 1993 onwards',3),
      h('modern','characteristic', 'Modern revival', 'New Sune film (2021) continued the family\'s story for a new generation',3),
      h('sig',   'characteristic', 'Signature',      'The quintessential Swedish movie dad — every Swedish child grew up knowing Rudolf',5),
    ],
  },

  'sune': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character — book/film series',        1),
      h('cr',    'creation_year',  'Created',        '1984 (first book)',                                    2),
      h('prod',  'producer',       'Creator',        'Anders Jacobsson and Sören Olsson',                   2),
      h('t1',    'characteristic', 'Full name',      'Sune Andersson — young Swedish boy',                  3),
      h('t2',    'characteristic', 'Stories',        'Everyday misadventures in Swedish family and school life',3),
      h('mv',    'movie',          'Films',          '"Sunes Sommar" (1993), "Sunes Jul" (1995) — classic Swedish Christmas film',4),
      h('sig',   'characteristic', 'Signature',      'Relatable everyday Swedish boy — every Swedish child sees themselves in Sune',5),
      h('debut', 'debut',          'First book',    '"Sunes sommar" by Jacobsson & Olsson — first published 1984',             2),
      h('family','characteristic', 'Family',         'Family: sister Anna, mother Karin, and father Rudolf Andersson',         2),
      h('reboot','characteristic', 'Modern revival','New film "Sune" (2021) introduced the character to a new generation',   3),
    ],
  },

  'sickan': {
    categoryLabel: 'Character',
    nationality: 'sweden',
    hints: [
      h('cat',   'characteristic', 'Type',          'Swedish fictional character — comedy crime film series', 1),
      h('prod',  'producer',       'Created in',     '"Jönssonligan" (1981) — Swedish comedy film series',  2),
      h('t1',    'characteristic', 'Full name',      'Charles-Ingvar "Sickan" Jönsson',                     3),
      h('t2',    'characteristic', 'Role',           'Mastermind criminal/con artist — the brains of the gang',3),
      h('t3',    'characteristic', 'Played by',      'Gösta Ekman (senior) in original films',              3),
      h('t4',    'characteristic', 'Inspiration',    'Loosely based on Norwegian "Olsen-banden" characters',4),
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
      h('cat',   'characteristic', 'Type',          'Swedish fictional character',                           1),
      h('t1',    'characteristic', 'Character',      'Swedish fictional character from film or TV series',   3),
      h('sig',   'characteristic', 'Signature',      'Swedish character known to Swedish audiences',         5),
    ],
  },

  // ── MELODIFESTIVALEN-ARTISTER ─────────────────────────────────────────────

  'herreys': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish schlager pop trio',                             1),
      h('fact1', 'member_count',   'Members',       '3 brothers: Per, Louis and Richard Herrey',            1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('pk',    'peak_year',      'Active years',  '1983 – 1990s',                                          2),
      h('s1',    'song',           'Hit song',      '"Diggiloo Diggiley" (1984)',                             4),
      h('merit', 'merit',          'Achievement',   'Won Eurovision Song Contest 1984 in Luxembourg',        5),
      h('sig',   'characteristic', 'Signature',     'Golden shoes at Eurovision — iconic 1984 Swedish music moment',5),
      h('fact2', 'characteristic', 'Score',         'Won Eurovision 1984 with 145 points in Luxembourg',                       3),
      h('fact3', 'characteristic', 'Shoes',          'Famous for their distinctive golden metallic shoes on stage',            4),
      h('fact4', 'characteristic', 'Background',     'Three brothers — sons of an American preacher who settled in Sweden',   3),
    ],
  },

  'arvingarna': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish dansband',                                      1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('pk',    'peak_year',      'Active years',  '1985 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Claes Malmberg — the voice and face of the group',      3),
      h('t1',    'characteristic', 'Style',         'Dansband music — the quintessential Swedish dance band style',3),
      h('t2',    'characteristic', 'Melodifestivalen','Multiple Melodifestivalen appearances',               3),
      h('name',  'characteristic', 'Name meaning',  '"Arvingarna" means "The Heirs" — heirs to the Swedish dansband tradition',2),
      h('venue', 'characteristic', 'Live scene',    'Beloved at Swedish summer festivals and outdoor dansbanor (dance halls)',3),
      h('hit',   'merit',          'Success',       'One of Sweden\'s most commercially successful dansband acts over 40 years',4),
      h('sig',   'characteristic', 'Signature',     'Claes Malmberg\'s warm voice — the sound of Swedish summer nights',5),
    ],
  },

  'alcazar': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish pop group',                                     1),
      h('fact1', 'member_count',   'Members',       '4 members: Anniela, Linn, Magnus and Andreas',          1),
      h('bp',    'birth_place',    'Origin',        'Stockholm, Sweden',                                      2),
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
      h('prof',  'profession',     'Category',      'Swedish folk-pop duo',                                  1),
      h('fact1', 'member_count',   'Members',       '2 members: Rickard Olsson and Mats "MP" Persson',      1),
      h('bp',    'birth_place',    'Origin',        'Norrbotten, northern Sweden',                            2),
      h('pk',    'peak_year',      'Active years',  '1995 – 2003, reunited later',                           2),
      h('s1',    'song',           'Hit song',      '"Trollmors vaggsång" (2001)',                            4),
      h('merit', 'merit',          'Achievement',   'Multiple Melodifestivalen appearances',                 3),
      h('sig',   'characteristic', 'Signature',     'Folk-tinged Swedish pop from the far north',            5),
      h('s2',    'song',           'Hit song',      '"Vindarnas viskning" (1997)',                                              3),
      h('alb1',  'album',          'Debut album',   '"Nordman" debut album (1995)',                                           3),
      h('fact2', 'characteristic', 'Connection',    'Folk-influenced sound resonates especially with people from northern Sweden', 3),
    ],
  },

  'friends': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish pop group',                                     1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('pk',    'peak_year',      'Active years',  '2000s',                                                  2),
      h('style', 'characteristic', 'Style',         'Upbeat Swedish pop with catchy hooks and a youthful image',2),
      h('melo',  'merit',          'Achievement',   'Melodifestivalen participant',                          3),
      h('esc',   'characteristic', 'Melodifestivalen','Competed to represent Sweden at Eurovision Song Contest',3),
      h('sound', 'characteristic', 'Sound',         'Fresh and energetic pop sound aimed at younger audiences',3),
      h('known', 'characteristic', 'Recognition',   'Known to Swedish pop fans from the Melodifestivalen stage',4),
      h('collab','characteristic', 'Scene',         'Part of the Swedish schlager and pop tradition exported globally',3),
      h('sig',   'characteristic', 'Signature',     'Swedish pop act associated with Melodifestivalen',      5),
    ],
  },

  'afro-dite': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish R&B/pop group',                                 1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('cr',    'creation_year',  'Formed',        'Late 1990s',                                             2),
      h('name',  'characteristic', 'Name origin',   'Name blends "Africa" and "Aphrodite" — reflecting the group\'s multicultural identity',2),
      h('host',  'characteristic', 'Eurovision host','Eurovision 2001 took place in Copenhagen, Denmark',     3),
      h('s1',    'song',           'Hit song',      '"Never Let It Go" (Melodifestivalen 2001)',              4),
      h('s1b',   'merit',          'Chart success', '"Never Let It Go" became a pan-European hit after Eurovision',3),
      h('merit', 'merit',          'Achievement',   'Represented Sweden at Eurovision Song Contest 2001',    5),
      h('divers','characteristic', 'Identity',      'First group with predominantly African-Swedish heritage to represent Sweden at Eurovision',4),
      h('sig',   'characteristic', 'Signature',     'Blended African-Swedish identity into pop-R&B sound',   5),
    ],
  },

  'medina': {
    categoryLabel: 'Musikartist',
    nationality: 'denmark',
    hints: [
      h('prof',  'profession',     'Profession',    'Music artist',                                          1),
      h('bd',    'birth_date',     'Date of birth', 'February 18, 1987',                                     2),
      h('bp',    'birth_place',    'Place of birth','Aarhus, Denmark',                                        2),
      h('pk',    'peak_year',      'Career peak',   '2009 – 2015',                                           2),
      h('s1',    'song',           'Hit song',      '"Kun for mig" (2009)',                                   3),
      h('s2',    'song',           'Hit song',      '"Lose Control" (2009)',                                  4),
      h('s3',    'song',           'Hit song',      '"You & I" (2009)',                                       5),
      h('sig',   'characteristic', 'Signature',     'Danish-Moroccan pop sensation hugely popular in all of Scandinavia',5),
      h('fact2', 'characteristic', 'Heritage',       'Of Moroccan-Danish heritage — breakthrough artist across all Scandinavia', 3),
      h('fact3', 'characteristic', 'Style',          'Known for powerful R&B-infused Danish pop with emotional depth',         3),
    ],
  },

  'samir-viktor': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish pop duo',                                       1),
      h('fact1', 'member_count',   'Members',       '2: Samir Badran and Viktor Frisk',                      1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('pk',    'peak_year',      'Active years',  '2014 – present',                                        2),
      h('s1',    'song',           'Hit song',      '"Groupie" (2015)',                                       4),
      h('s2',    'song',           'Hit song',      '"Shuffla" (2016)',                                       4),
      h('merit', 'merit',          'Achievement',   'Multiple Melodifestivalen appearances',                 4),
      h('sig',   'characteristic', 'Signature',     'High-energy pop duo beloved by younger Swedish audiences',5),
      h('fact2', 'characteristic', 'Background',     'Samir of Palestinian heritage — part of Sweden\'s diverse pop scene',   3),
      h('s3',    'song',           'Hit song',       '"Groupie" (2015) reached the Swedish chart top 5',                    3),
    ],
  },

  'the-mamas': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish vocal group',                                   1),
      h('fact1', 'member_count',   'Members',       '3 members: Ashley Haynes, Dinah Yohannes and Noa (Matthew Bhaso)',1),
      h('bp',    'birth_place',    'Origin',        'Sweden',                                                 2),
      h('pk',    'peak_year',      'Active years',  '2020 – present',                                        2),
      h('debut', 'debut',          'First fame',    'Gained recognition as backing vocalists for John Lundvik at Eurovision 2019 in Tel Aviv',2),
      h('s1',    'song',           'Hit song',      '"Move" (Melodifestivalen 2020)',                         4),
      h('covid', 'characteristic', 'Eurovision 2020','Eurovision 2020 was cancelled due to COVID-19 — they never got to perform in Rotterdam',3),
      h('style', 'characteristic', 'Sound',         'Gospel, soul and R&B — powerful three-part harmonies',  3),
      h('merit', 'merit',          'Achievement',   'Won Melodifestivalen 2020 — Sweden\'s Eurovision entry for the cancelled 2020 contest',5),
      h('sig',   'characteristic', 'Signature',     'Gospel-inspired harmonies — Sweden\'s choice for Eurovision 2020',5),
    ],
  },

  'brandsta-city-slackers': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish comedy/novelty act',                            1),
      h('bp',    'birth_place',    'Origin',        'Brandsta, a small locality in Sweden',                   2),
      h('pk',    'peak_year',      'Active years',  '2000s',                                                  2),
      h('style', 'characteristic', 'Style',         'Comedy and parody songs — deliberately over-the-top and self-deprecating',2),
      h('melo',  'merit',          'Achievement',   'Competed in Melodifestivalen with humorous songs',      3),
      h('irony', 'characteristic', 'Concept',       'Name plays on "Brandsta" (small village) vs "City Slackers" — rural vs urban comedy',3),
      h('crowd', 'characteristic', 'Audience',      'Beloved by audiences who appreciate Swedish self-deprecating humour',3),
      h('trad',  'characteristic', 'Tradition',     'Part of a long tradition of Swedish comedy acts in Melodifestivalen',3),
      h('vibe',  'characteristic', 'Performance',   'Known for bringing laughs and lightness to the Melodifestivalen stage',4),
      h('sig',   'characteristic', 'Signature',     'Comedy act that took Swedish Melodifestivalen audiences by surprise',5),
    ],
  },

  'marcus-martinus': {
    categoryLabel: 'Band',
    nationality: 'norway',
    hints: [
      h('prof',  'profession',     'Category',      'Norwegian twin pop duo',                                1),
      h('fact1', 'member_count',   'Members',       '2: Marcus and Martinus Gunnarsen (born February 21, 2002)',1),
      h('bp',    'birth_place',    'Origin',        'Trofors, Vefsn, Norway',                                 2),
      h('pk',    'peak_year',      'Active years',  '2012 – present',                                        2),
      h('s1',    'song',           'Hit song',      '"Elektrisk" (2015)',                                     3),
      h('s2',    'song',           'Hit song',      '"Unforgettable" (2016)',                                  3),
      h('s3',    'song',           'Hit song',      '"Light It Up" (2022)',                                    4),
      h('sig',   'characteristic', 'Signature',     'Identical twin brothers — biggest Scandinavian youth pop sensation',5),
      h('fact2', 'characteristic', 'Child stars',    'Started performing at age 10 — famous before finishing primary school',   2),
      h('fact3', 'characteristic', 'Awards',         'Won multiple Norwegian and Scandinavian music awards as teenagers',       3),
    ],
  },

  // ── SVENSKA ROCKBAND (region: sweden) ────────────────────────────────────

  'europe': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish rock group',                                    1),
      h('fact1', 'member_count',   'Members',       '5 members',                                              1),
      h('bp',    'birth_place',    'Origin',        'Upplands Väsby, Sweden',                                  2),
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
      h('prof',  'profession',     'Category',      'Swedish indie/alternative rock group',                  1),
      h('bp',    'birth_place',    'Origin',        'Eskilstuna, Sweden (formed 1990)',                       2),
      h('pk',    'peak_year',      'Active years',  '1990 – 2016',                                           2),
      h('m1',    'lead_singer',    'Lead singer',   'Joakim Berg',                                           3),
      h('s1',    'song',           'Hit song',      '"Dom andra" (2005)',                                     3),
      h('s2',    'song',           'Hit song',      '"Ingenting" (2002)',                                     3),
      h('alb1',  'album',          'Iconic album',  '"Isola" (1997)',                                         4),
      h('alb2',  'album',          'Iconic album',  '"Hagnesta Hill" (1999)',                                 4),
      h('s3',    'song',           'Hit song',      '"Om du var här" (1997)',                                  5),
      h('sig',   'characteristic', 'Signature',     'The defining Swedish indie rock band — disbanded 2016 after 26 years',5),
    ],
  },

  'the-ark': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish glam rock group',                               1),
      h('bp',    'birth_place',    'Origin',        'Gothenburg, Sweden (formed 1991)',                       2),
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
      h('prof',  'profession',     'Category',      'Swedish pop/rock group',                                1),
      h('bp',    'birth_place',    'Origin',        'Halmstad, Sweden (formed 1977)',                         2),
      h('pk',    'peak_year',      'Active years',  '1977 – 1985, multiple reunions',                        2),
      h('m1',    'lead_singer',    'Key member',    'Per Gessle (guitar/vocals) — later formed Roxette',     3),
      h('s1',    'song',           'Hit song',      '"Kung av sand" (1982)',                                  3),
      h('s2',    'song',           'Hit song',      '"Sommartider" (1981)',                                    4),
      h('s3',    'song',           'Hit song',      '"Flickan i en Cole Porter sång" (1980)',                 5),
      h('sig',   'characteristic', 'Signature',     'Classic Swedish 1980s rock — reunion tours still fill arenas in Sweden',5),
      h('fact2', 'characteristic', 'Legacy',         'Per Gessle later formed Roxette — bringing the Halmstad sound worldwide', 3),
      h('alb2',  'album',          'Album',          '"Screams & Whispers" album (1994)',                                      3),
    ],
  },

  'mando-diao': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish indie/garage rock group',                       1),
      h('bp',    'birth_place',    'Origin',        'Borlänge, Sweden (formed 1999)',                         2),
      h('pk',    'peak_year',      'Active years',  '2002 – present',                                        2),
      h('m1',    'lead_singer',    'Vocalists',     'Björn Dixgård and Gustaf Dixgård (brothers)',            3),
      h('s1',    'song',           'Hit song',      '"Paralyzed" (2004)',                                     3),
      h('alb1',  'album',          'Debut album',   '"Bring \'Em In" (2002)',                                 3),
      h('s2',    'song',           'Hit song',      '"Monica Zetterlund" (2009)',                             4),
      h('s3',    'song',           'Hit song',      '"Black Saturday" (2012)',                                5),
      h('sig',   'characteristic', 'Signature',     'Borlänge boys who became Sweden\'s biggest garage rock export',5),
      h('alb2',  'album',          'Album',          '"Give Me Fire" album (2009)',                                            3),
    ],
  },

  'the-hives': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish garage rock group',                              1),
      h('fact1', 'characteristic', 'Look',          'Always perform in matching black and white outfits',    1),
      h('bp',    'birth_place',    'Origin',        'Fagersta, Sweden (formed 1993)',                         2),
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
      h('prof',  'profession',     'Category',      'Swedish hard rock group',                               1),
      h('bp',    'birth_place',    'Origin',        'Malmö, Sweden (formed 1980)',                            2),
      h('pk',    'peak_year',      'Active years',  '1980 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Stig Bergqvist',                                        3),
      h('t1',    'characteristic', 'Style',         'Working class Swedish hard rock — raw and uncompromising',3),
      h('lang',  'characteristic', 'Language',      'Sing exclusively in Swedish — a point of pride and identity',3),
      h('city',  'characteristic', 'Malmö identity','Deeply rooted in Malmö working-class culture and pride', 3),
      h('life',  'merit',          'Longevity',     'Over 40 years of continuous activity — a testament to their fanbase loyalty',4),
      h('cult',  'characteristic', 'Fan culture',   'Legendary cult following among Swedish rock fans across generations',4),
      h('sig',   'characteristic', 'Signature',     'Cult status in Swedish rock — "Sweden\'s best working class rock band"',5),
    ],
  },

  'eldkvarn': {
    categoryLabel: 'Band',
    nationality: 'sweden',
    hints: [
      h('prof',  'profession',     'Category',      'Swedish rock group',                                    1),
      h('bp',    'birth_place',    'Origin',        'Stockholm, Sweden (formed 1970s)',                       2),
      h('pk',    'peak_year',      'Active years',  '1975 – present',                                        2),
      h('voice', 'lead_singer',    'Lead singer',   '"Plura" Jonsson — instantly recognisable gravelly voice',3),
      h('t1',    'characteristic', 'Style',         'Swedish-language rock — progg-influenced social commentary',3),
      h('t2',    'characteristic', 'Name',          '"Eldkvarn" means "fire mill" in Swedish',               3),
      h('progg', 'characteristic', 'Movement',      'Central to the Swedish "progg" (progressive rock/protest music) scene of the 1970s',2),
      h('polit', 'characteristic', 'Themes',        'Songs tackle social justice, working conditions and everyday Swedish life',3),
      h('merit', 'merit',          'Legacy',        'Regarded as one of the most important Swedish rock bands — still active after 50 years',4),
      h('sig',   'characteristic', 'Signature',     'Pioneer of Swedish-language rock — Plura\'s raw voice and protest lyrics',5),
    ],
  },

  // ── HÅRDROCKBAND — REGION SCOPE: ALL ─────────────────────────────────────

  'acdc': {
    categoryLabel: 'Band',
    nationality: 'australia',
    hints: [
      h('prof',  'profession',     'Category',      'Australian hard rock group',                            1),
      h('bp',    'birth_place',    'Origin',        'Sydney, Australia (formed 1973)',                        2),
      h('pk',    'peak_year',      'Active years',  '1973 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Brian Johnson (since 1980) — original: Bon Scott (died 1980)',3),
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
      h('prof',  'profession',     'Category',      'British heavy metal group',                             1),
      h('bp',    'birth_place',    'Origin',        'London, England (formed 1975)',                          2),
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
      h('prof',  'profession',     'Category',      'British hard rock group',                               1),
      h('bp',    'birth_place',    'Origin',        'London, England (formed 1968)',                          2),
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
      h('prof',  'profession',     'Category',      'British heavy metal group',                             1),
      h('bp',    'birth_place',    'Origin',        'Birmingham, England (formed 1969)',                      2),
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
      h('prof',  'profession',     'Category',      'British rock/metal group',                              1),
      h('fact1', 'characteristic', 'Legend',        'Founded and led by the iconic Lemmy Kilmister (1945–2015)',1),
      h('bp',    'birth_place',    'Origin',        'London, England (formed 1975)',                          2),
      h('pk',    'peak_year',      'Active years',  '1975 – 2015',                                           2),
      h('m1',    'lead_singer',    'Lead singer',   'Lemmy Kilmister (vocals/bass) — died December 28, 2015',3),
      h('s1',    'song',           'Hit song',      '"Overkill" (1979)',                                      3),
      h('s2',    'song',           'Hit song',      '"Killed by Death" (1984)',                               3),
      h('s3',    'song',           'Iconic hit',    '"Ace of Spades" (1980)',                                  5),
      h('sig',   'characteristic', 'Signature',     '"Everything louder than everything else" — Lemmy\'s life motto',5),
      h('fact2', 'characteristic', 'Volume',         'Concerts so loud they reportedly broke recording equipment',             3),
    ],
  },

  'rammstein': {
    categoryLabel: 'Band',
    nationality: 'germany',
    hints: [
      h('prof',  'profession',     'Category',      'German industrial metal group',                         1),
      h('bp',    'birth_place',    'Origin',        'Berlin, Germany (formed 1994)',                          2),
      h('pk',    'peak_year',      'Active years',  '1994 – present',                                        2),
      h('m1',    'lead_singer',    'Lead singer',   'Till Lindemann',                                        3),
      h('t1',    'characteristic', 'Language',      'All lyrics in German — became globally popular anyway',  3),
      h('t2',    'characteristic', 'Concerts',      'Spectacular pyrotechnic shows with fire, flames and explosions on stage',3),
      h('s1',    'song',           'Hit song',      '"Engel" (1997)',                                         3),
      h('s2',    'song',           'Hit song',      '"Sonne" (2001)',                                         4),
      h('alb1',  'album',          'Iconic album',  '"Sehnsucht" (1997)',                                     4),
      h('s3',    'song',           'Iconic hit',    '"Du Hast" (1997)',                                       5),
      h('sig',   'characteristic', 'Signature',     'Fire and pyrotechnics + German language = uniquely Rammstein',5),
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
      h('sig',   'characteristic', 'Signature',     'Most decorated American alpine skier in history',        5),
    ],
  },

}; // end HINTS_LIBRARY_MANUAL

// HINTS_LIBRARY: auto-genererade hints + manuellt kuraterade (manuella åsidosätter).
export const HINTS_LIBRARY: Record<string, HintLibrary> = {
  ...HINTS_LIBRARY_GENERATED,
  ...HINTS_LIBRARY_MANUAL,
};
