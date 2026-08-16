// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Image-frågor (minimal metadata per item). Letter Grid + Final Selection +
// Full-Names-lista byggs RUNTIME via src/utils/imageQuestionBuilder.ts —
// se buildImageVariant(item, assistance, audienceSet, IMAGE_QUIZ_QUESTIONS,
// DISTRACTOR_POOL_NAMES[item.category] ?? []).

export type ImageQuestionAudience =
  | 'elder'
  | 'gen-x'
  | 'millennials'
  | 'gen-z'
  | 'gen-alpha'
  | 'all';

export interface ImagePrefixOption {
  prefix: string;
  isCorrect: boolean;
}

export interface ImageNameOption {
  itemId: string;
  displayName: string;
  isCorrect: boolean;
  source: 'catalog' | 'pool';
}

export interface ImagePrefixVariant {
  mode: 'prefix';
  prefixLength: number;
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  correctPrefix: string;
}

export interface ImageFullNamesVariant {
  mode: 'full-names';
  /** ~10 namn med exakt en isCorrect=true. */
  nameList: ImageNameOption[];
}

export type ImageQuestionVariant = ImagePrefixVariant | ImageFullNamesVariant;

export type ImageVariantKey = 'prefix-1' | 'prefix-2' | 'full-names';

export type ImageContentSubject =
  | 'artist'
  | 'band'
  | 'actor'
  | 'character'
  | 'athlete'
  | 'cultural-person'
  | 'celebrity'
  | 'city'
  | 'country'
  | 'place';

export type ImageCategory =
  | 'persons'
  | 'capitals'
  | 'artists'
  | 'songs'
  | 'actors'
  | 'sport';

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: ImageCategory;
  contentSubject: ImageContentSubject;
  /** Året som "rätt svar". Optional — items utan correctYear OCH peak
   *  (t.ex. capitals) är era-agnostiska. */
  correctYear?: number;
  /** Peak-recognition-fönster. När båda definierade använder era-filtret
   *  interval-overlap mot host:s era-spann. */
  peakFrom?: number;
  peakTo?: number;
  /** Vilka generationer item:t passar för (driver per-spelare-pool på klienten). */
  audiences: ImageQuestionAudience[];
  /** Region-hierarki global ⊃ europe ⊃ nordic ⊃ land — se src/utils/regionScope.ts.
   *  'unknown-region' når ingen spelare. */
  region: string[];
  questionText: string;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = [
  {
    "id": "a-teens",
    "displayName": "A*Teens",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "abba",
    "displayName": "ABBA",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "acdc",
    "displayName": "AC/DC",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "adam-lundgren",
    "displayName": "Adam Lundgren",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "adam-palsson",
    "displayName": "Adam Pålsson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1988,
    "peakFrom": 2011,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "adam-sandler",
    "displayName": "Adam Sandler",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1966,
    "peakFrom": 1989,
    "peakTo": 2019,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "adam-tensta",
    "displayName": "Adam Tensta",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "adele",
    "displayName": "Adele",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "peakFrom": 2008,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "agnes-carlsson",
    "displayName": "Agnes Carlsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "aha",
    "displayName": "a-ha",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "al-pacino",
    "displayName": "Al Pacino",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1940,
    "peakFrom": 1963,
    "peakTo": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "alain-prost",
    "displayName": "Alain Prost",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alan-shearer",
    "displayName": "Alan Shearer",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alanis-morissette",
    "displayName": "Alanis Morissette",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "peakFrom": 1995,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alba-august",
    "displayName": "Alba August",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2017,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "albin-ekdal",
    "displayName": "Albin Ekdal",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "albin-lee-meldau",
    "displayName": "Albin Lee Meldau",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alcazar",
    "displayName": "Alcazar",
    "category": "artists",
    "contentSubject": "band",
    "peakFrom": 1999,
    "peakTo": 2009,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "alessandro-del-piero",
    "displayName": "Alessandro Del Piero",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alessandro-nesta",
    "displayName": "Alessandro Nesta",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alesso",
    "displayName": "Alesso",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alex-morgan",
    "displayName": "Alex Morgan",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alexander-isak",
    "displayName": "Alexander Isak",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alexander-noren",
    "displayName": "Alexander Norén",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "peakFrom": 2016,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alexander-rybak",
    "displayName": "Alexander Rybak",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alexander-skarsgard",
    "displayName": "Alexander Skarsgård",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1976,
    "peakFrom": 1999,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "alexandra-rapaport",
    "displayName": "Alexandra Rapaport",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 2003,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "alexis-sanchez",
    "displayName": "Alexis Sanchez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alf-ramsey",
    "displayName": "Alf Ramsey",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1920,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alicia-keys",
    "displayName": "Alicia Keys",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "peakFrom": 2001,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alicia-vikander",
    "displayName": "Alicia Vikander",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1988,
    "peakFrom": 2011,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "allan-edwall",
    "displayName": "Allan Edwall",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1924,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "amanda-jenssen",
    "displayName": "Amanda Jenssen",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2007,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "amy-adams",
    "displayName": "Amy Adams",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anders-jansson",
    "displayName": "Anders Jansson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1998,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anders-lundin",
    "displayName": "Anders Lundin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
    "peakFrom": 1986,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anders-svensson",
    "displayName": "Anders Svensson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andre-agassi",
    "displayName": "Andre Agassi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andrea-pirlo",
    "displayName": "Andrea Pirlo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-andersson",
    "displayName": "Andreas Andersson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-granqvist",
    "displayName": "Andreas Granqvist",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-isaksson",
    "displayName": "Andreas Isaksson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-palicka",
    "displayName": "Andreas Palicka",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andriy-shevchenko",
    "displayName": "Andriy Shevchenko",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andy-murray",
    "displayName": "Andy Murray",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "angel-di-maria",
    "displayName": "Ángel Di María",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "anita-ekberg",
    "displayName": "Anita Ekberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1931,
    "peakFrom": 1960,
    "peakTo": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anja-parson",
    "displayName": "Anja Pärson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "anna-bergendahl",
    "displayName": "Anna Bergendahl",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2010,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "anna-nordqvist",
    "displayName": "Anna Nordqvist",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "peakFrom": 2009,
    "peakTo": 2021,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "anna-sahlene",
    "displayName": "Anna Sahlene",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "anna-ternheim",
    "displayName": "Anna Ternheim",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "anne-hathaway",
    "displayName": "Anne Hathaway",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1982,
    "peakFrom": 2005,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anne-linnet",
    "displayName": "Anne Linnet",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "annie-lennox",
    "displayName": "Annie Lennox",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1954,
    "peakFrom": 1980,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "annika-sorenstam",
    "displayName": "Annika Sörenstam",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "anthony-hopkins",
    "displayName": "Anthony Hopkins",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1937,
    "peakFrom": 1960,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "antoine-griezmann",
    "displayName": "Antoine Griezmann",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "arctic-monkeys",
    "displayName": "Arctic Monkeys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "aretha-franklin",
    "displayName": "Aretha Franklin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1942,
    "peakFrom": 1961,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ariana-grande",
    "displayName": "Ariana Grande",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "arja-saijonmaa",
    "displayName": "Arja Saijonmaa",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "armand-duplantis",
    "displayName": "Armand Duplantis",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "arnold-schwarzenegger",
    "displayName": "Arnold Schwarzenegger",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1947,
    "peakFrom": 1970,
    "peakTo": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "aronchupa",
    "displayName": "AronChupa",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "europe"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "arturo-vidal",
    "displayName": "Arturo Vidal",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "arvingarna",
    "displayName": "Arvingarna",
    "category": "artists",
    "contentSubject": "band",
    "peakFrom": 1993,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ashley-cole",
    "displayName": "Ashley Cole",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "audrey-hepburn",
    "displayName": "Audrey Hepburn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1929,
    "peakFrom": 1953,
    "peakTo": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "avicii",
    "displayName": "Avicii",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "peakFrom": 2011,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "avril-lavigne",
    "displayName": "Avril Lavigne",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "peakFrom": 2002,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "axwell",
    "displayName": "Axwell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ayrton-senna",
    "displayName": "Ayrton Senna",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "backstreet-boys",
    "displayName": "Backstreet Boys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "bad-bunny",
    "displayName": "Bad Bunny",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "barbra-streisand",
    "displayName": "Barbra Streisand",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1942,
    "peakFrom": 1963,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "barbro-horberg",
    "displayName": "Barbro Hörberg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1932,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "barry-white",
    "displayName": "Barry White",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1944,
    "peakFrom": 1973,
    "peakTo": 2003,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "basshunter",
    "displayName": "Basshunter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "beatles",
    "displayName": "The Beatles",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "bebeto",
    "displayName": "Bebeto",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bee-gees",
    "displayName": "Bee Gees",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "belinda-carlisle",
    "displayName": "Belinda Carlisle",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1978,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ben-affleck",
    "displayName": "Ben Affleck",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ben-stiller",
    "displayName": "Ben Stiller",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1965,
    "peakFrom": 1988,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "benjamin-ingrosso",
    "displayName": "Benjamin Ingrosso",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "berti-vogts",
    "displayName": "Berti Vogts",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bette-davis",
    "displayName": "Bette Davis",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1908,
    "peakFrom": 1938,
    "peakTo": 1962,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "beyonce",
    "displayName": "Beyoncé",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bianca-kronlof",
    "displayName": "Bianca Kronlöf",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1984,
    "peakFrom": 2010,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bibi-andersson",
    "displayName": "Bibi Andersson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1935,
    "peakFrom": 1957,
    "peakTo": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bill-murray",
    "displayName": "Bill Murray",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1950,
    "peakFrom": 1973,
    "peakTo": 2003,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bill-skarsgard",
    "displayName": "Bill Skarsgård",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "peakFrom": 2013,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "billie-eilish",
    "displayName": "Billie Eilish",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 2001,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bjorn-afzelius",
    "displayName": "Björn Afzelius",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bjorn-borg",
    "displayName": "Björn Borg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bjorn-daehlie",
    "displayName": "Bjørn Dæhlie",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bjorn-gustafsson",
    "displayName": "Björn Gustafsson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2009,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bjorn-nordqvist",
    "displayName": "Björn Nordqvist",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bjorn-skifs",
    "displayName": "Björn Skifs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "black-sabbath",
    "displayName": "Black Sabbath",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "bo-kaspers-orkester",
    "displayName": "Bo Kaspers Orkester",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "bob-dylan",
    "displayName": "Bob Dylan",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "peakFrom": 1962,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bobby-charlton",
    "displayName": "Bobby Charlton",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1937,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bobby-moore",
    "displayName": "Bobby Moore",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1941,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bonnie-tyler",
    "displayName": "Bonnie Tyler",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1951,
    "peakFrom": 1976,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "borje-ahlstedt",
    "displayName": "Börje Ahlstedt",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1970,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "borje-salming",
    "displayName": "Börje Salming",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "boy-george",
    "displayName": "Boy George",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1961,
    "peakFrom": 1981,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "brad-pitt",
    "displayName": "Brad Pitt",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
    "peakFrom": 1986,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bradley-cooper",
    "displayName": "Bradley Cooper",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1998,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "brian-bosworth",
    "displayName": "Brian Bosworth",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1965,
    "peakFrom": 1988,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "britney-spears",
    "displayName": "Britney Spears",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "peakFrom": 1998,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "britt-ekland",
    "displayName": "Britt Ekland",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1942,
    "peakFrom": 1965,
    "peakTo": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bruce-springsteen",
    "displayName": "Bruce Springsteen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1975,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bruce-willis",
    "displayName": "Bruce Willis",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bruno-fernandes",
    "displayName": "Bruno Fernandes",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bruno-mars",
    "displayName": "Bruno Mars",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "peakFrom": 2010,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "buddy-holly",
    "displayName": "Buddy Holly",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1936,
    "peakFrom": 1957,
    "peakTo": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bukayo-saka",
    "displayName": "Bukayo Saka",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2001,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "burt-reynolds",
    "displayName": "Burt Reynolds",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1936,
    "peakFrom": 1959,
    "peakTo": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "cafu-falcao",
    "displayName": "Cafu Falcao",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cameron-diaz",
    "displayName": "Cameron Diaz",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "camila-cabello",
    "displayName": "Camila Cabello",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1997,
    "peakFrom": 2014,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "carl-lewis",
    "displayName": "Carl Lewis",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carlos-alberto-parreira",
    "displayName": "Carlos Alberto Parreira",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1943,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carola-haggkvist",
    "displayName": "Carola Häggkvist",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "carole-king",
    "displayName": "Carole King",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1942,
    "peakFrom": 1971,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "carolina-kluft",
    "displayName": "Carolina Klüft",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "caroline-af-ugglas",
    "displayName": "Caroline af Ugglas",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "caroline-seger",
    "displayName": "Caroline Seger",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cate-blanchett",
    "displayName": "Cate Blanchett",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "peakFrom": 1992,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "celine-dion",
    "displayName": "Céline Dion",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1990,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cesare-maldini",
    "displayName": "Cesare Maldini",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1932,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cesc-fabregas",
    "displayName": "Cesc Fabregas",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "channing-tatum",
    "displayName": "Channing Tatum",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
    "peakFrom": 2003,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "charles-barkley",
    "displayName": "Charles Barkley",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "charlie-chaplin",
    "displayName": "Charlie Chaplin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1889,
    "peakFrom": 1918,
    "peakTo": 1940,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "charlize-theron",
    "displayName": "Charlize Theron",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1998,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "charlotte-kalla",
    "displayName": "Charlotte Kalla",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "charlotte-perrelli",
    "displayName": "Charlotte Perrelli",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cher",
    "displayName": "Cher",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1946,
    "peakFrom": 1965,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cherrie",
    "displayName": "Cherrie",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "chris-evans",
    "displayName": "Chris Evans",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1981,
    "peakFrom": 2004,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "christer-sjogren",
    "displayName": "Christer Sjögren",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "christian-bale",
    "displayName": "Christian Bale",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "christian-olsson",
    "displayName": "Christian Olsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "christian-pulisic",
    "displayName": "Christian Pulisic",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "christian-wilhelmsson",
    "displayName": "Christian Wilhelmsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "christina-aguilera",
    "displayName": "Christina Aguilera",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1980,
    "peakFrom": 1999,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "chuck-berry",
    "displayName": "Chuck Berry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1926,
    "peakFrom": 1955,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "claes-malmberg",
    "displayName": "Claes Malmberg",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1990,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "claes-mansson",
    "displayName": "Claes Månsson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1985,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "clarence-seedorf",
    "displayName": "Clarence Seedorf",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "claudio-taffarel",
    "displayName": "Claudio Taffarel",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cleo",
    "displayName": "Cleo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cody-gakpo",
    "displayName": "Cody Gakpo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "coldplay",
    "displayName": "Coldplay",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "conchita-wurst",
    "displayName": "Conchita Wurst",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "peakFrom": 2014,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "connor-mcdavid",
    "displayName": "Connor McDavid",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cornelia-jakobs",
    "displayName": "Cornelia Jakobs",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2022,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cornelis-vreeswijk",
    "displayName": "Cornelis Vreeswijk",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1937,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cristiano-ronaldo",
    "displayName": "Cristiano Ronaldo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cyndi-lauper",
    "displayName": "Cyndi Lauper",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1953,
    "peakFrom": 1983,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "daft-punk",
    "displayName": "Daft Punk",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "dan-hylander",
    "displayName": "Dan Hylander",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1954,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dani-alves",
    "displayName": "Dani Alves",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniel-adams-ray",
    "displayName": "Daniel Adams-Ray",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "daniel-alfredsson",
    "displayName": "Daniel Alfredsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniel-craig",
    "displayName": "Daniel Craig",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "daniel-lindstrom",
    "displayName": "Daniel Lindström",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "daniel-passarella",
    "displayName": "Daniel Passarella",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniel-radcliffe",
    "displayName": "Daniel Radcliffe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1989,
    "peakFrom": 2001,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "daniel-sedin",
    "displayName": "Daniel Sedin",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniel-stahl",
    "displayName": "Daniel Ståhl",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2019,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniele-de-rossi",
    "displayName": "Daniele De Rossi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "danny-saucedo",
    "displayName": "Danny Saucedo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "darin",
    "displayName": "Darin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dave-grohl",
    "displayName": "Dave Grohl",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1991,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "david-beckham",
    "displayName": "David Beckham",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "david-bowie",
    "displayName": "David Bowie",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "peakFrom": 1969,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "david-hellenius",
    "displayName": "David Hellenius",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "david-trezeguet",
    "displayName": "David Trezeguet",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "david-villa",
    "displayName": "David Villa",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dean-martin",
    "displayName": "Dean Martin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1917,
    "peakFrom": 1946,
    "peakTo": 1995,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "declan-rice",
    "displayName": "Declan Rice",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "deco",
    "displayName": "Deco",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dejan-kulusevski",
    "displayName": "Dejan Kulusevski",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "demetrio-albertini",
    "displayName": "Demetrio Albertini",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "demi-lovato",
    "displayName": "Demi Lovato",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1992,
    "peakFrom": 2008,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "demi-moore",
    "displayName": "Demi Moore",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1962,
    "peakFrom": 1985,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "denzel-washington",
    "displayName": "Denzel Washington",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1954,
    "peakFrom": 1977,
    "peakTo": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "diana-ross",
    "displayName": "Diana Ross",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1944,
    "peakFrom": 1965,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "diane-keaton",
    "displayName": "Diane Keaton",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1946,
    "peakFrom": 1969,
    "peakTo": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "didier-deschamps",
    "displayName": "Didier Deschamps",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "didier-drogba",
    "displayName": "Didier Drogba",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-costa",
    "displayName": "Diego Costa",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-forlan",
    "displayName": "Diego Forlan",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-maradona",
    "displayName": "Diego Maradona",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-simeone",
    "displayName": "Diego Simeone",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dino-zoff",
    "displayName": "Dino Zoff",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dirk-kuyt",
    "displayName": "Dirk Kuyt",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "doja-cat",
    "displayName": "Doja Cat",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1995,
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dolly-parton",
    "displayName": "Dolly Parton",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1946,
    "peakFrom": 1967,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dolph-lundgren",
    "displayName": "Dolph Lundgren",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1957,
    "peakFrom": 1980,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "donna-summer",
    "displayName": "Donna Summer",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1974,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "drake",
    "displayName": "Drake",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dua-lipa",
    "displayName": "Dua Lipa",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1995,
    "peakFrom": 2015,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dunga",
    "displayName": "Dunga",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dustin-hoffman",
    "displayName": "Dustin Hoffman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1937,
    "peakFrom": 1960,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "dwayne-johnson",
    "displayName": "Dwayne Johnson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "e-type",
    "displayName": "E-Type",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eagle-eye-cherry",
    "displayName": "Eagle-Eye Cherry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eagles",
    "displayName": "Eagles",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ed-sheeran",
    "displayName": "Ed Sheeran",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "peakFrom": 2011,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eddie-murphy",
    "displayName": "Eddie Murphy",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1961,
    "peakFrom": 1984,
    "peakTo": 2014,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "eden-hazard",
    "displayName": "Eden Hazard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "edgar-davids",
    "displayName": "Edgar Davids",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "edinson-cavani",
    "displayName": "Edinson Cavani",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "edward-norton",
    "displayName": "Edward Norton",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "peakFrom": 1992,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "elizabeth-taylor",
    "displayName": "Elizabeth Taylor",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1932,
    "peakFrom": 1944,
    "peakTo": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ella-fitzgerald",
    "displayName": "Ella Fitzgerald",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1917,
    "peakFrom": 1935,
    "peakTo": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "elton-john",
    "displayName": "Elton John",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "peakFrom": 1970,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "elvis-presley",
    "displayName": "Elvis Presley",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1935,
    "peakFrom": 1956,
    "peakTo": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "emil-forsberg",
    "displayName": "Emil Forsberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "emil-krafth",
    "displayName": "Emil Krafth",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "emilio-butragueno",
    "displayName": "Emilio Butragueno",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eminem",
    "displayName": "Eminem",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "emma-green",
    "displayName": "Emma Green",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2005,
    "peakTo": 2014,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "emma-stone",
    "displayName": "Emma Stone",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1988,
    "peakFrom": 2011,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "emma-watson",
    "displayName": "Emma Watson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "peakFrom": 2001,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "emmanuel-adebayor",
    "displayName": "Emmanuel Adebayor",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "enrique-iglesias",
    "displayName": "Enrique Iglesias",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 1995,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eric-cantona",
    "displayName": "Eric Cantona",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eric-clapton",
    "displayName": "Eric Clapton",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1963,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eric-gadd",
    "displayName": "Eric Gadd",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 1993,
    "peakTo": 2003,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eric-prydz",
    "displayName": "Eric Prydz",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eric-saade",
    "displayName": "Eric Saade",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "erik-karlsson",
    "displayName": "Erik Karlsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "erik-lundin",
    "displayName": "Erik Lundin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "erling-haaland",
    "displayName": "Erling Haaland",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ernst-hugo-jaregard",
    "displayName": "Ernst-Hugo Järegård",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1975,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "esteban-cambiasso",
    "displayName": "Esteban Cambiasso",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eurythmics",
    "displayName": "Eurythmics",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "eusebio",
    "displayName": "Eusébio",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eva-dahlgren",
    "displayName": "Eva Dahlgren",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "eva-melander",
    "displayName": "Eva Melander",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2018,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "eva-mendes",
    "displayName": "Eva Mendes",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "eva-rydberg",
    "displayName": "Eva Rydberg",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1970,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "evert-taube",
    "displayName": "Evert Taube",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1890,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "evin-ahmad",
    "displayName": "Evin Ahmad",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2017,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ewa-froling",
    "displayName": "Ewa Fröling",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1952,
    "peakFrom": 1978,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ewan-mcgregor",
    "displayName": "Ewan McGregor",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1971,
    "peakFrom": 1994,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "familjen",
    "displayName": "Familjen",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "fares-fares",
    "displayName": "Fares Fares",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "faye-dunaway",
    "displayName": "Faye Dunaway",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1941,
    "peakFrom": 1964,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "felix-herngren",
    "displayName": "Felix Herngren",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2005,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "fernando-hierro",
    "displayName": "Fernando Hierro",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "finn-wolfhard",
    "displayName": "Finn Wolfhard",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2002,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "first-aid-kit",
    "displayName": "First Aid Kit",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "fleetwood-mac",
    "displayName": "Fleetwood Mac",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "florence-pugh",
    "displayName": "Florence Pugh",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "peakFrom": 2019,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "floyd-mayweather",
    "displayName": "Floyd Mayweather",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frank-lampard",
    "displayName": "Frank Lampard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frank-ocean",
    "displayName": "Frank Ocean",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "frank-rijkaard",
    "displayName": "Frank Rijkaard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frank-sinatra",
    "displayName": "Frank Sinatra",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1915,
    "peakFrom": 1940,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "franz-beckenbauer",
    "displayName": "Franz Beckenbauer",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "fred",
    "displayName": "Fred",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "freddie-ljungberg",
    "displayName": "Freddie Ljungberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frenkie-de-jong",
    "displayName": "Frenkie De Jong",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frida-karlsson",
    "displayName": "Frida Karlsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "galantis",
    "displayName": "Galantis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gareth-bale",
    "displayName": "Gareth Bale",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gary-oldman",
    "displayName": "Gary Oldman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1958,
    "peakFrom": 1981,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gene-hackman",
    "displayName": "Gene Hackman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1930,
    "peakFrom": 1953,
    "peakTo": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "genesis",
    "displayName": "Genesis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gennaro-gattuso",
    "displayName": "Gennaro Gattuso",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "george-best",
    "displayName": "George Best",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "george-foreman",
    "displayName": "George Foreman",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "george-michael",
    "displayName": "George Michael",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1982,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "gerard-pique",
    "displayName": "Gerard Piqué",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gerd-muller",
    "displayName": "Gerd Müller",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "glenn-hoddle",
    "displayName": "Glenn Hoddle",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "glenn-hysen",
    "displayName": "Glenn Hysén",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "glenn-stromberg",
    "displayName": "Glenn Strömberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gloria-estefan",
    "displayName": "Gloria Estefan",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1957,
    "peakFrom": 1984,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "goldie-hawn",
    "displayName": "Goldie Hawn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1945,
    "peakFrom": 1968,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gonzalo-higuain",
    "displayName": "Gonzalo Higuain",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "goran-ivanisevic",
    "displayName": "Goran Ivanišević",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gosta-ekman-actor",
    "displayName": "Gösta Ekman",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1970,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "grace-kelly",
    "displayName": "Grace Kelly",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1929,
    "peakFrom": 1952,
    "peakTo": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "green-day",
    "displayName": "Green Day",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "greta-garbo",
    "displayName": "Greta Garbo",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1905,
    "peakFrom": 1926,
    "peakTo": 1941,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "guillermo-ochoa",
    "displayName": "Guillermo Ochoa",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gunnar-gren",
    "displayName": "Gunnar Gren",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1920,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gunnar-nordahl",
    "displayName": "Gunnar Nordahl",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1921,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gunnel-lindblom",
    "displayName": "Gunnel Lindblom",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1931,
    "peakFrom": 1957,
    "peakTo": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "guns-n-roses",
    "displayName": "Guns N' Roses",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gustaf-hammarsten",
    "displayName": "Gustaf Hammarsten",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2000,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gustaf-skarsgard",
    "displayName": "Gustaf Skarsgård",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
    "peakFrom": 2003,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gustav-svensson",
    "displayName": "Gustav Svensson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "guus-hiddink",
    "displayName": "Guus Hiddink",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gwen-stefani",
    "displayName": "Gwen Stefani",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1990,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "gwyneth-paltrow",
    "displayName": "Gwyneth Paltrow",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gyllene-tider",
    "displayName": "Gyllene Tider",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "hakan-hellstrom",
    "displayName": "Håkan Hellström",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "hakan-mild",
    "displayName": "Håkan Mild",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "halle-berry",
    "displayName": "Halle Berry",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1966,
    "peakFrom": 1989,
    "peakTo": 2019,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "hans-alfredson",
    "displayName": "Hans Alfredson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1931,
    "peakFrom": 1963,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "happy-jankell",
    "displayName": "Happy Jankell",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2015,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "harriet-andersson",
    "displayName": "Harriet Andersson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1932,
    "peakFrom": 1952,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "harry-belafonte",
    "displayName": "Harry Belafonte",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "peakFrom": 1953,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "harry-kane",
    "displayName": "Harry Kane",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "harry-kewell",
    "displayName": "Harry Kewell",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "harry-styles",
    "displayName": "Harry Styles",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2010,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "hector-cuper",
    "displayName": "Héctor Cúper",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "helen-alfredsson",
    "displayName": "Helen Alfredsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "peakFrom": 1992,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "helen-sjoholm",
    "displayName": "Helen Sjöholm",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "helena-bergstrom",
    "displayName": "Helena Bergström",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1964,
    "peakFrom": 1987,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "henrik-dorsin",
    "displayName": "Henrik Dorsin",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2010,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "henrik-larsson",
    "displayName": "Henrik Larsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-lundqvist",
    "displayName": "Henrik Lundqvist",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-stenson",
    "displayName": "Henrik Stenson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-zetterberg",
    "displayName": "Henrik Zetterberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "hep-stars",
    "displayName": "Hep Stars",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "hidetoshi-nakata",
    "displayName": "Hidetoshi Nakata",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "hugh-grant",
    "displayName": "Hugh Grant",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1960,
    "peakFrom": 1983,
    "peakTo": 2013,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "hugo-lloris",
    "displayName": "Hugo Lloris",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "hugo-sanchez",
    "displayName": "Hugo Sanchez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "humphrey-bogart",
    "displayName": "Humphrey Bogart",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1899,
    "peakFrom": 1941,
    "peakTo": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ian-rush",
    "displayName": "Ian Rush",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "iggy-pop",
    "displayName": "Iggy Pop",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "peakFrom": 1969,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "iker-casillas",
    "displayName": "Iker Casillas",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ing-marie-carlsson",
    "displayName": "Ing-Marie Carlsson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
    "peakFrom": 1988,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ingemar-stenmark",
    "displayName": "Ingemar Stenmark",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ingrid-bergman",
    "displayName": "Ingrid Bergman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1915,
    "peakFrom": 1942,
    "peakTo": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ingrid-thulin",
    "displayName": "Ingrid Thulin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1926,
    "peakFrom": 1957,
    "peakTo": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ingvar-hirdwall",
    "displayName": "Ingvar Hirdwall",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1980,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ivan-rakitic",
    "displayName": "Ivan Rakitic",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jack-nicholson",
    "displayName": "Jack Nicholson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1937,
    "peakFrom": 1960,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jairzinho",
    "displayName": "Jairzinho",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jakob-ingebrigtsen",
    "displayName": "Jakob Ingebrigtsen",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "nordic"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "james-brown",
    "displayName": "James Brown",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1933,
    "peakFrom": 1956,
    "peakTo": 2006,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "james-dean",
    "displayName": "James Dean",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1931,
    "peakFrom": 1955,
    "peakTo": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "james-rodriguez",
    "displayName": "James Rodriguez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "james-stewart",
    "displayName": "James Stewart",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1908,
    "peakFrom": 1939,
    "peakTo": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jamie-carragher",
    "displayName": "Jamie Carragher",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jan-ceulemans",
    "displayName": "Jan Ceulemans",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "europe"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jan-johansen",
    "displayName": "Jan Johansen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jan-ove-waldner",
    "displayName": "Jan-Ove Waldner",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jarl-kulle",
    "displayName": "Jarl Kulle",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1955,
    "peakTo": 1995,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jaromir-jagr",
    "displayName": "Jaromír Jágr",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-hernandez",
    "displayName": "Javier Hernandez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-mascherano",
    "displayName": "Javier Mascherano",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-zanetti",
    "displayName": "Javier Zanetti",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jay-z",
    "displayName": "Jay-Z",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1996,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jeff-goldblum",
    "displayName": "Jeff Goldblum",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1952,
    "peakFrom": 1975,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jennifer-aniston",
    "displayName": "Jennifer Aniston",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "peakFrom": 1992,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jennifer-lawrence",
    "displayName": "Jennifer Lawrence",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "peakFrom": 2013,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jennifer-lopez",
    "displayName": "Jennifer Lopez",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1999,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jenny-rissveds",
    "displayName": "Jenny Rissveds",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2016,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jens-lekman",
    "displayName": "Jens Lekman",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jerry-williams-sv",
    "displayName": "Jerry Williams",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 1963,
    "peakTo": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jesper-parnevik",
    "displayName": "Jesper Parnevik",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jessica-chastain",
    "displayName": "Jessica Chastain",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1977,
    "peakFrom": 2000,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jill-johnson",
    "displayName": "Jill Johnson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jim-carrey",
    "displayName": "Jim Carrey",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1962,
    "peakFrom": 1985,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jimmy-durmaz",
    "displayName": "Jimmy Durmaz",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joachim-bjorklund",
    "displayName": "Joachim Björklund",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joachim-low",
    "displayName": "Joachim Löw",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "europe"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joakim-berg",
    "displayName": "Joakim Berg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "joao-felix",
    "displayName": "João Félix",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joaquin-phoenix",
    "displayName": "Joaquin Phoenix",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jodie-foster",
    "displayName": "Jodie Foster",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1962,
    "peakFrom": 1985,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "joe-frazier",
    "displayName": "Joe Frazier",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joe-pesci",
    "displayName": "Joe Pesci",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1943,
    "peakFrom": 1966,
    "peakTo": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "joel-kinnaman",
    "displayName": "Joel Kinnaman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1979,
    "peakFrom": 2002,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "joey-tempest",
    "displayName": "Joey Tempest",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1979,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "johan-cruyff",
    "displayName": "Johan Cruyff",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "johan-glans",
    "displayName": "Johan Glans",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "johan-mjallby",
    "displayName": "Johan Mjällby",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "johan-rheborg",
    "displayName": "Johan Rheborg",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1995,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "johan-ulveson",
    "displayName": "Johan Ulveson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1990,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "johannes-brost",
    "displayName": "Johannes Brost",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1954,
    "peakFrom": 1980,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "john-cleese",
    "displayName": "John Cleese",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1939,
    "peakFrom": 1962,
    "peakTo": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "john-legend",
    "displayName": "John Legend",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1978,
    "peakFrom": 2004,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "john-mcenroe",
    "displayName": "John McEnroe",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "john-terry",
    "displayName": "John Terry",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "john-travolta",
    "displayName": "John Travolta",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1954,
    "peakFrom": 1977,
    "peakTo": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "john-wayne",
    "displayName": "John Wayne",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1907,
    "peakFrom": 1939,
    "peakTo": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "johnny-depp",
    "displayName": "Johnny Depp",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
    "peakFrom": 1986,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jonas-karlsson-actor",
    "displayName": "Jonas Karlsson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2000,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jonas-thern",
    "displayName": "Jonas Thern",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jordan-larsson",
    "displayName": "Jordan Larsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jorgen-persson",
    "displayName": "Jörgen Persson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "josephine-bornebusch",
    "displayName": "Josephine Bornebusch",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1981,
    "peakFrom": 2006,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "journey",
    "displayName": "Journey",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "juan-mata",
    "displayName": "Juan Mata",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jude-bellingham",
    "displayName": "Jude Bellingham",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2003,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "judi-dench",
    "displayName": "Judi Dench",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1934,
    "peakFrom": 1995,
    "peakTo": 2013,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "julia-roberts",
    "displayName": "Julia Roberts",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "julio-cesar",
    "displayName": "Julio Cesar",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jurgen-klinsmann",
    "displayName": "Jurgen Klinsmann",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "just-fontaine",
    "displayName": "Just Fontaine",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1933,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "justin-bieber",
    "displayName": "Justin Bieber",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2009,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "justin-timberlake",
    "displayName": "Justin Timberlake",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "peakFrom": 2002,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kajsa-bergqvist",
    "displayName": "Kajsa Bergqvist",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2002,
    "peakTo": 2006,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kaka",
    "displayName": "Kaká",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kanye-west",
    "displayName": "Kanye West",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "karl-heinz-rummenigge",
    "displayName": "Karl Heinz Rummenigge",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "karsten-warholm",
    "displayName": "Karsten Warholm",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "nordic"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "katarina-witt",
    "displayName": "Katarina Witt",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kate-bush",
    "displayName": "Kate Bush",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1978,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kate-hudson",
    "displayName": "Kate Hudson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1979,
    "peakFrom": 2002,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kate-winslet",
    "displayName": "Kate Winslet",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1998,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "katharine-hepburn",
    "displayName": "Katharine Hepburn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1907,
    "peakFrom": 1933,
    "peakTo": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "keira-knightley",
    "displayName": "Keira Knightley",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1985,
    "peakFrom": 2008,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kendrick-lamar",
    "displayName": "Kendrick Lamar",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "peakFrom": 2011,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kennet-andersson",
    "displayName": "Kennet Andersson",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 1994,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kenny-dalglish",
    "displayName": "Kenny Dalglish",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kent",
    "displayName": "Kent",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "kevin-bacon",
    "displayName": "Kevin Bacon",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1958,
    "peakFrom": 1981,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kevin-costner",
    "displayName": "Kevin Costner",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kevin-de-bruyne",
    "displayName": "Kevin De Bruyne",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kikki-danielsson",
    "displayName": "Kikki Danielsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kim-andersson",
    "displayName": "Kim Andersson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kim-cesarion",
    "displayName": "Kim Cesarion",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kim-kallstrom",
    "displayName": "Kim Källström",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2005,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kim-larsen",
    "displayName": "Kim Larsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kiss",
    "displayName": "Kiss",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "kjell-bergqvist",
    "displayName": "Kjell Bergqvist",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1985,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kobe-bryant",
    "displayName": "Kobe Bryant",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kosovare-asllani",
    "displayName": "Kosovare Asllani",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kristen-stewart",
    "displayName": "Kristen Stewart",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "peakFrom": 2013,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "krister-henriksson",
    "displayName": "Krister Henriksson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1946,
    "peakFrom": 1995,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kurt-cobain",
    "displayName": "Kurt Cobain",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kurt-hamrin",
    "displayName": "Kurt Hamrin",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 1958,
    "peakTo": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kygo",
    "displayName": "Kygo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kylian-mbappe",
    "displayName": "Kylian Mbappé",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kylie-minogue",
    "displayName": "Kylie Minogue",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1987,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lady-gaga",
    "displayName": "Lady Gaga",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "peakFrom": 2008,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "laleh",
    "displayName": "Laleh",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lars-lagerback",
    "displayName": "Lars Lagerbäck",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lars-winnerback",
    "displayName": "Lars Winnerbäck",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "larz-kristerz",
    "displayName": "Larz-Kristerz",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "lasse-aberg",
    "displayName": "Lasse Åberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1940,
    "peakFrom": 1963,
    "peakTo": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lasse-berghagen",
    "displayName": "Lasse Berghagen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lasse-brandeby",
    "displayName": "Lasse Brandeby",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1945,
    "peakFrom": 1968,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lasse-stefanz",
    "displayName": "Lasse Stefanz",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "lasse-tennander",
    "displayName": "Lasse Tennander",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lauryn-hill",
    "displayName": "Lauryn Hill",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 1993,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "led-zeppelin",
    "displayName": "Led Zeppelin",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "lena-endre",
    "displayName": "Lena Endre",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1990,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lena-olin",
    "displayName": "Lena Olin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lena-philipsson",
    "displayName": "Lena Philipsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lennox-lewis",
    "displayName": "Lennox Lewis",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lenny-kravitz",
    "displayName": "Lenny Kravitz",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1964,
    "peakFrom": 1989,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "leonard-cohen",
    "displayName": "Leonard Cohen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1934,
    "peakFrom": 1967,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "leonardo-dicaprio",
    "displayName": "Leonardo DiCaprio",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lewis-capaldi",
    "displayName": "Lewis Capaldi",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1996,
    "peakFrom": 2017,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lewis-hamilton",
    "displayName": "Lewis Hamilton",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "liam-neeson",
    "displayName": "Liam Neeson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1952,
    "peakFrom": 1975,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lil-nas-x",
    "displayName": "Lil Nas X",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1999,
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lill-babs",
    "displayName": "Lill-Babs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lill-lindfors",
    "displayName": "Lill Lindfors",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1940,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "linda-bengtzing",
    "displayName": "Linda Bengtzing",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2005,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "linda-pira",
    "displayName": "Linda Pira",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "linda-sundblad",
    "displayName": "Linda Sundblad",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "linn-grant",
    "displayName": "Linn Grant",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "peakFrom": 2022,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "linnea-henriksson",
    "displayName": "Linnéa Henriksson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lionel-messi",
    "displayName": "Lionel Messi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lionel-richie",
    "displayName": "Lionel Richie",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1968,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lisa-ekdahl",
    "displayName": "Lisa Ekdahl",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lisa-miskovsky",
    "displayName": "Lisa Miskovsky",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lisa-nilsson",
    "displayName": "Lisa Nilsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "liselotte-neumann",
    "displayName": "Liselotte Neumann",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "peakFrom": 1988,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "little-richard",
    "displayName": "Little Richard",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1932,
    "peakFrom": 1955,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "liv-mjones",
    "displayName": "Liv Mjönes",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "liv-ullmann",
    "displayName": "Liv Ullmann",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1938,
    "peakFrom": 1966,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ljubomir-vranjes",
    "displayName": "Ljubomir Vranjes",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ll-cool-j",
    "displayName": "LL Cool J",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1985,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "loa-falkman",
    "displayName": "Loa Falkman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1947,
    "peakFrom": 1985,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lordi",
    "displayName": "Lordi",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "loreen",
    "displayName": "Loreen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lothar-matthaus",
    "displayName": "Lothar Matthaus",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lotta-engberg",
    "displayName": "Lotta Engberg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lotta-schelin",
    "displayName": "Lotta Schelin",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "louis-armstrong",
    "displayName": "Louis Armstrong",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1901,
    "peakFrom": 1925,
    "peakTo": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "louis-van-gaal",
    "displayName": "Louis van Gaal",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lucas-bergvall",
    "displayName": "Lucas Bergvall",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2006,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ludvig-aberg",
    "displayName": "Ludvig Åberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luis-figo",
    "displayName": "Luis Figo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luis-suarez",
    "displayName": "Luis Suarez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luka-modric",
    "displayName": "Luka Modrić",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lykke-li",
    "displayName": "Lykke Li",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "madonna",
    "displayName": "Madonna",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1984,
    "peakTo": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "magdalena-forsberg",
    "displayName": "Magdalena Forsberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "magic-johnson",
    "displayName": "Magic Johnson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "magnus-harenstam",
    "displayName": "Magnus Härenstam",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1941,
    "peakFrom": 1975,
    "peakTo": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "magnus-uggla",
    "displayName": "Magnus Uggla",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1954,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "magnus-wislander",
    "displayName": "Magnus Wislander",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "malena-ernman",
    "displayName": "Malena Ernman",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2009,
    "peakTo": 2019,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "malin-akerman",
    "displayName": "Malin Åkerman",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2007,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mando-diao",
    "displayName": "Mando Diao",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "maneskin",
    "displayName": "Måneskin",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2016,
    "peakFrom": 2021,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "mans-zelmerlow",
    "displayName": "Måns Zelmerlöw",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "manuel-neuer",
    "displayName": "Manuel Neuer",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marc-anthony",
    "displayName": "Marc Anthony",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marcello-lippi",
    "displayName": "Marcello Lippi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcelo",
    "displayName": "Marcelo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marco-van-basten",
    "displayName": "Marco van Basten",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcus-allback",
    "displayName": "Marcus Allbäck",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcus-berg",
    "displayName": "Marcus Berg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcus-hellner",
    "displayName": "Marcus Hellner",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcus-martinus",
    "displayName": "Marcus & Martinus",
    "category": "artists",
    "contentSubject": "band",
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "margaretha-krook",
    "displayName": "Margaretha Krook",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1925,
    "peakFrom": 1950,
    "peakTo": 2001,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "margot-robbie",
    "displayName": "Margot Robbie",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "peakFrom": 2013,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "maria-lundqvist",
    "displayName": "Maria Lundqvist",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1995,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mariah-carey",
    "displayName": "Mariah Carey",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1990,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marie-bergman",
    "displayName": "Marie Bergman",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marie-fredriksson",
    "displayName": "Marie Fredriksson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marie-serneholt",
    "displayName": "Marie Serneholt",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mariette",
    "displayName": "Mariette",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marilyn-monroe",
    "displayName": "Marilyn Monroe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1926,
    "peakFrom": 1950,
    "peakTo": 1962,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mark-wahlberg",
    "displayName": "Mark Wahlberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1971,
    "peakFrom": 1994,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "markoolio",
    "displayName": "Markoolio",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "markus-krunegard",
    "displayName": "Markus Krunegård",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "markus-naslund",
    "displayName": "Markus Näslund",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marlon-brando",
    "displayName": "Marlon Brando",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1924,
    "peakFrom": 1951,
    "peakTo": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "maroon-5",
    "displayName": "Maroon 5",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "martin-dahlin",
    "displayName": "Martin Dahlin",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "martin-odegaard",
    "displayName": "Martin Ødegaard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "martina-navratilova",
    "displayName": "Martina Navratilova",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marvin-gaye",
    "displayName": "Marvin Gaye",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1939,
    "peakFrom": 1961,
    "peakTo": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mary-j-blige",
    "displayName": "Mary J. Blige",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "peakFrom": 1992,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mats-naslund",
    "displayName": "Mats Näslund",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mats-sundin",
    "displayName": "Mats Sundin",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mats-wilander",
    "displayName": "Mats Wilander",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "matt-damon",
    "displayName": "Matt Damon",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1970,
    "peakFrom": 1993,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mattias-andersson",
    "displayName": "Mattias Andersson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mauro-scocco",
    "displayName": "Mauro Scocco",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 1988,
    "peakTo": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "max-von-sydow",
    "displayName": "Max von Sydow",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1929,
    "peakFrom": 1957,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "megan-thee-stallion",
    "displayName": "Megan Thee Stallion",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1995,
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "melissa-horn",
    "displayName": "Melissa Horn",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "memphis-depay",
    "displayName": "Memphis Depay",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "meryl-streep",
    "displayName": "Meryl Streep",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
    "peakFrom": 1972,
    "peakTo": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "metallica",
    "displayName": "Metallica",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "michael-douglas",
    "displayName": "Michael Douglas",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1944,
    "peakFrom": 1967,
    "peakTo": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "michael-jackson",
    "displayName": "Michael Jackson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1979,
    "peakTo": 2009,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "michael-jordan",
    "displayName": "Michael Jordan",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michael-keaton",
    "displayName": "Michael Keaton",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1951,
    "peakFrom": 1974,
    "peakTo": 2004,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "michael-owen",
    "displayName": "Michael Owen",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michael-schumacher",
    "displayName": "Michael Schumacher",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michel-torneus",
    "displayName": "Michel Tornéus",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2012,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mick-jagger",
    "displayName": "Mick Jagger",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1962,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mikael-lustig",
    "displayName": "Mikael Lustig",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mikael-nyqvist",
    "displayName": "Mikael Nyqvist",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1960,
    "peakFrom": 1983,
    "peakTo": 2013,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mikael-persbrandt",
    "displayName": "Mikael Persbrandt",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
    "peakFrom": 1986,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mikaela-lauren",
    "displayName": "Mikaela Laurén",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2010,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mikaela-shiffrin",
    "displayName": "Mikaela Shiffrin",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1995,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "miley-cyrus",
    "displayName": "Miley Cyrus",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1992,
    "peakFrom": 2006,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "millie-bobby-brown",
    "displayName": "Millie Bobby Brown",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2004,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "miriam-bryant",
    "displayName": "Miriam Bryant",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "miroslav-klose",
    "displayName": "Miroslav Klose",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "miss-li",
    "displayName": "Miss Li",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "moa-gammel",
    "displayName": "Moa Gammel",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mohamed-salah",
    "displayName": "Mohamed Salah",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "molly-sanden",
    "displayName": "Molly Sandén",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "monica-zetterlund",
    "displayName": "Monica Zetterlund",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1937,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "morten-olsen",
    "displayName": "Morten Olsen",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "muhammad-ali",
    "displayName": "Muhammad Ali",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nani",
    "displayName": "Nani",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nat-king-cole",
    "displayName": "Nat King Cole",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1919,
    "peakFrom": 1945,
    "peakTo": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nationalteatern",
    "displayName": "Nationalteatern",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ne-yo",
    "displayName": "Ne-Yo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1979,
    "peakFrom": 2006,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nelly-furtado",
    "displayName": "Nelly Furtado",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1978,
    "peakFrom": 2000,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "neneh-cherry",
    "displayName": "Neneh Cherry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1964,
    "peakFrom": 1988,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "netta-barzilai",
    "displayName": "Netta Barzilai",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
    "peakFrom": 2018,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "neymar",
    "displayName": "Neymar",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ngolo-kante",
    "displayName": "Ngolo Kante",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nicki-minaj",
    "displayName": "Nicki Minaj",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "peakFrom": 2010,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nicklas-lidstrom",
    "displayName": "Nicklas Lidström",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "niclas-alexandersson",
    "displayName": "Niclas Alexandersson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nicolas-cage",
    "displayName": "Nicolas Cage",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1964,
    "peakFrom": 1987,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "nicole-kidman",
    "displayName": "Nicole Kidman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "nightwish",
    "displayName": "Nightwish",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "niklas-stromstedt",
    "displayName": "Niklas Strömstedt",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nils-liedholm",
    "displayName": "Nils Liedholm",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1922,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nils-poppe",
    "displayName": "Nils Poppe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1908,
    "peakFrom": 1930,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "nils-van-der-poel",
    "displayName": "Nils van der Poel",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2021,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "noah-schnapp",
    "displayName": "Noah Schnapp",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2004,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "noomi-rapace",
    "displayName": "Noomi Rapace",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1979,
    "peakFrom": 2002,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "norah-jones",
    "displayName": "Norah Jones",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1979,
    "peakFrom": 2002,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nour-el-refai",
    "displayName": "Nour El Refai",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
    "peakFrom": 2005,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "novak-djokovic",
    "displayName": "Novak Djokovic",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ola-salo",
    "displayName": "Ola Salo",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2000,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ola-toivonen",
    "displayName": "Ola Toivonen",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "olga-korbut",
    "displayName": "Olga Korbut",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "oliver-kahn",
    "displayName": "Oliver Kahn",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "olivia-rodrigo",
    "displayName": "Olivia Rodrigo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 2003,
    "peakFrom": 2021,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "olle-adolphson",
    "displayName": "Olle Adolphson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1934,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "olof-mellberg",
    "displayName": "Olof Mellberg",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2001,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "omar-rudberg",
    "displayName": "Omar Rudberg",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2021,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "orup",
    "displayName": "Orup",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "oscar",
    "displayName": "Oscar",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "oscar-wendt",
    "displayName": "Oscar Wendt",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "oskar-linnros",
    "displayName": "Oskar Linnros",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "otis-redding",
    "displayName": "Otis Redding",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "peakFrom": 1962,
    "peakTo": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "otto-knows",
    "displayName": "Otto Knows",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "otto-rehhagel",
    "displayName": "Otto Rehhagel",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "owen-wilson",
    "displayName": "Owen Wilson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ozzy-osbourne",
    "displayName": "Ozzy Osbourne",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1968,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "paolo-maldini",
    "displayName": "Paolo Maldini",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "paolo-rossi",
    "displayName": "Paolo Rossi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "europe"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrick-kluivert",
    "displayName": "Patrick Kluivert",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrick-swayze",
    "displayName": "Patrick Swayze",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1952,
    "peakFrom": 1975,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "patrick-vieira",
    "displayName": "Patrick Vieira",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrik-andersson",
    "displayName": "Patrik Andersson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrik-isaksson",
    "displayName": "Patrik Isaksson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "patrik-sjoberg",
    "displayName": "Patrik Sjöberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patsy-cline",
    "displayName": "Patsy Cline",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1932,
    "peakFrom": 1957,
    "peakTo": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "patti-smith",
    "displayName": "Patti Smith",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1946,
    "peakFrom": 1975,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "paul-newman",
    "displayName": "Paul Newman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1925,
    "peakFrom": 1948,
    "peakTo": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "paul-pogba",
    "displayName": "Paul Pogba",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "paul-rudd",
    "displayName": "Paul Rudd",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "peakFrom": 1992,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pedro-rodriguez",
    "displayName": "Pedro Rodriguez",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pele",
    "displayName": "Pelé",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1940,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "penelope-cruz",
    "displayName": "Penélope Cruz",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pepe",
    "displayName": "Pepe",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "per-gessle",
    "displayName": "Per Gessle",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pernilla-andersson",
    "displayName": "Pernilla Andersson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pernilla-august",
    "displayName": "Pernilla August",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1958,
    "peakFrom": 1981,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pernilla-wahlgren",
    "displayName": "Pernilla Wahlgren",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pernilla-wiberg",
    "displayName": "Pernilla Wiberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pete-sampras",
    "displayName": "Pete Sampras",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "peter-dalle",
    "displayName": "Peter Dalle",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1965,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "peter-forsberg",
    "displayName": "Peter Forsberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "peter-joback",
    "displayName": "Peter Jöback",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 1995,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "peter-lemarc",
    "displayName": "Peter LeMarc",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "peter-settman",
    "displayName": "Peter Settman",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1998,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "peter-stormare",
    "displayName": "Peter Stormare",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1953,
    "peakFrom": 1976,
    "peakTo": 2006,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "petr-cech",
    "displayName": "Petr Cech",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "petra-marklund",
    "displayName": "Petra Marklund",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "petter",
    "displayName": "Petter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pharrell-williams",
    "displayName": "Pharrell Williams",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1973,
    "peakFrom": 1992,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "phil-collins",
    "displayName": "Phil Collins",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1951,
    "peakFrom": 1981,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "phil-foden",
    "displayName": "Phil Foden",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pierce-brosnan",
    "displayName": "Pierce Brosnan",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1953,
    "peakFrom": 1976,
    "peakTo": 2006,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pink",
    "displayName": "Pink",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1979,
    "peakFrom": 2000,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pink-floyd",
    "displayName": "Pink Floyd",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "plura-jonsson",
    "displayName": "Plura Jonsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "post-malone",
    "displayName": "Post Malone",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1995,
    "peakFrom": 2015,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "prince",
    "displayName": "Prince",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1979,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pugh-rogefeldt",
    "displayName": "Pugh Rogefeldt",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "py-backman",
    "displayName": "Py Bäckman",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "queen",
    "displayName": "Queen",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "rachel-mohlin",
    "displayName": "Rachel Mohlin",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2010,
    "peakTo": 2022,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "rafael-nadal",
    "displayName": "Rafael Nadal",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ralf-edstrom",
    "displayName": "Ralf Edström",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "raphael-varane",
    "displayName": "Raphael Varane",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "raul",
    "displayName": "Raul",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ray-charles",
    "displayName": "Ray Charles",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1930,
    "peakFrom": 1955,
    "peakTo": 2004,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "raymond-domenech",
    "displayName": "Raymond Domenech",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rebecca-ferguson",
    "displayName": "Rebecca Ferguson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1983,
    "peakFrom": 2006,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "reese-witherspoon",
    "displayName": "Reese Witherspoon",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1976,
    "peakFrom": 1999,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "reine-brynolfsson",
    "displayName": "Reine Brynolfsson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1988,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ricardo-quaresma",
    "displayName": "Ricardo Quaresma",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rick-astley",
    "displayName": "Rick Astley",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "peakFrom": 1987,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ricky-martin",
    "displayName": "Ricky Martin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "peakFrom": 1991,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "rihanna",
    "displayName": "Rihanna",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "rikard-wolff",
    "displayName": "Rikard Wolff",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1958,
    "peakFrom": 1985,
    "peakTo": 2007,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "rio-ferdinand",
    "displayName": "Rio Ferdinand",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rivaldo",
    "displayName": "Rivaldo",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robbie-keane",
    "displayName": "Robbie Keane",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robbie-williams",
    "displayName": "Robbie Williams",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "peakFrom": 1995,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "robert-de-niro",
    "displayName": "Robert De Niro",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1943,
    "peakFrom": 1966,
    "peakTo": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-downey-jr",
    "displayName": "Robert Downey Jr.",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1965,
    "peakFrom": 1988,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-duvall",
    "displayName": "Robert Duvall",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1931,
    "peakFrom": 1954,
    "peakTo": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-gustafsson",
    "displayName": "Robert Gustafsson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1995,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-karlsson",
    "displayName": "Robert Karlsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "peakFrom": 2006,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robert-lewandowski",
    "displayName": "Robert Lewandowski",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robert-pattinson",
    "displayName": "Robert Pattinson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1986,
    "peakFrom": 2009,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-redford",
    "displayName": "Robert Redford",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1936,
    "peakFrom": 1959,
    "peakTo": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "roberto-baggio",
    "displayName": "Roberto Baggio",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "roberto-donadoni",
    "displayName": "Roberto Donadoni",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-bengtsson",
    "displayName": "Robin Bengtsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "robin-olsen",
    "displayName": "Robin Olsen",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-soderling",
    "displayName": "Robin Söderling",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2009,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-stjernberg",
    "displayName": "Robin Stjernberg",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2013,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "robin-van-persie",
    "displayName": "Robin Van Persie",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-williams",
    "displayName": "Robin Williams",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1951,
    "peakFrom": 1974,
    "peakTo": 2004,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robyn",
    "displayName": "Robyn",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1979,
    "peakFrom": 1995,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "rod-stewart",
    "displayName": "Rod Stewart",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1969,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "roger-federer",
    "displayName": "Roger Federer",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "roland-nilsson",
    "displayName": "Roland Nilsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rolf-lassgard",
    "displayName": "Rolf Lassgård",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "rolf-skoglund",
    "displayName": "Rolf Skoglund",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
    "peakFrom": 1975,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "romelu-lukaku",
    "displayName": "Romelu Lukaku",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ronaldinho",
    "displayName": "Ronaldinho",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ronaldo-nazario",
    "displayName": "Ronaldo Nazário",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rowan-atkinson",
    "displayName": "Rowan Atkinson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "roxette",
    "displayName": "Roxette",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "roy-orbison",
    "displayName": "Roy Orbison",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1936,
    "peakFrom": 1956,
    "peakTo": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ruud-gullit",
    "displayName": "Ruud Gullit",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ryan-giggs",
    "displayName": "Ryan Giggs",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ryan-gosling",
    "displayName": "Ryan Gosling",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
    "peakFrom": 2003,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sabina-ddumba",
    "displayName": "Sabina Ddumba",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sabrina-carpenter",
    "displayName": "Sabrina Carpenter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1999,
    "peakFrom": 2014,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "salma-hayek",
    "displayName": "Salma Hayek",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1966,
    "peakFrom": 1989,
    "peakTo": 2019,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sam-cooke",
    "displayName": "Sam Cooke",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1931,
    "peakFrom": 1957,
    "peakTo": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sam-smith",
    "displayName": "Sam Smith",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1992,
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sammy-davis-jr",
    "displayName": "Sammy Davis Jr.",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1925,
    "peakFrom": 1949,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "samuel-l-jackson",
    "displayName": "Samuel L. Jackson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1948,
    "peakFrom": 1971,
    "peakTo": 2001,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sandra-bullock",
    "displayName": "Sandra Bullock",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1964,
    "peakFrom": 1987,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sanna-nielsen",
    "displayName": "Sanna Nielsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sanne-salomonsen",
    "displayName": "Sanne Salomonsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sara-sjostrom",
    "displayName": "Sarah Sjöström",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sarah-dawn-finer",
    "displayName": "Sarah Dawn Finer",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "scarlett-johansson",
    "displayName": "Scarlett Johansson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1984,
    "peakFrom": 2007,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "seal",
    "displayName": "Seal",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1990,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sean-connery",
    "displayName": "Sean Connery",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1930,
    "peakFrom": 1962,
    "peakTo": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sebastian-ingrosso",
    "displayName": "Sebastian Ingrosso",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sebastian-larsson",
    "displayName": "Sebastian Larsson",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "seinabo-sey",
    "displayName": "Seinabo Sey",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2014,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "selena-gomez",
    "displayName": "Selena Gomez",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1992,
    "peakFrom": 2009,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sepp-maier",
    "displayName": "Sepp Maier",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "serena-williams",
    "displayName": "Serena Williams",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergio-aguero",
    "displayName": "Sergio Aguero",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergio-busquets",
    "displayName": "Sergio Busquets",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "shakira",
    "displayName": "Shakira",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1977,
    "peakFrom": 1995,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sharon-stone",
    "displayName": "Sharon Stone",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1958,
    "peakFrom": 1981,
    "peakTo": 2011,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "shawn-mendes",
    "displayName": "Shawn Mendes",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1998,
    "peakFrom": 2014,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "shirley-clamp",
    "displayName": "Shirley Clamp",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "shirley-temple",
    "displayName": "Shirley Temple",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1928,
    "peakFrom": 1934,
    "peakTo": 1940,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sia",
    "displayName": "Sia",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 2000,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sidney-crosby",
    "displayName": "Sidney Crosby",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sigourney-weaver",
    "displayName": "Sigourney Weaver",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
    "peakFrom": 1972,
    "peakTo": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sissel-kyrkjebo",
    "displayName": "Sissel Kyrkjebø",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sissela-kyle",
    "displayName": "Sissela Kyle",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1990,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "snoop-dogg",
    "displayName": "Snoop Dogg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "peakFrom": 1992,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sophie-zelmani",
    "displayName": "Sophie Zelmani",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "spencer-tracy",
    "displayName": "Spencer Tracy",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1900,
    "peakFrom": 1937,
    "peakTo": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "spice-girls",
    "displayName": "Spice Girls",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "stefan-edberg",
    "displayName": "Stefan Edberg",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "stefan-holm",
    "displayName": "Stefan Holm",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "stefan-lovgren",
    "displayName": "Stefan Lövgren",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "stellan-skarsgard",
    "displayName": "Stellan Skarsgård",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1951,
    "peakFrom": 1974,
    "peakTo": 2004,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sten-and-stanley",
    "displayName": "Sten & Stanley",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "steve-angello",
    "displayName": "Steve Angello",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "steven-gerrard",
    "displayName": "Steven Gerrard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "steven-tyler",
    "displayName": "Steven Tyler",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1973,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "stevie-wonder",
    "displayName": "Stevie Wonder",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "peakFrom": 1963,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "stina-nilsson",
    "displayName": "Stina Nilsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sting",
    "displayName": "Sting",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1951,
    "peakFrom": 1977,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "susan-sarandon",
    "displayName": "Susan Sarandon",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1946,
    "peakFrom": 1969,
    "peakTo": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "susanna-kallur",
    "displayName": "Susanna Kallur",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2006,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "suzanne-axell",
    "displayName": "Suzanne Axell",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1995,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sven-bertil-taube",
    "displayName": "Sven-Bertil Taube",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1934,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sven-goran-eriksson",
    "displayName": "Sven-Göran Eriksson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sven-wollter",
    "displayName": "Sven Wollter",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1934,
    "peakFrom": 1975,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "swedish-house-mafia",
    "displayName": "Swedish House Mafia",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "sza",
    "displayName": "SZA",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "peakFrom": 2017,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tage-danielsson",
    "displayName": "Tage Danielsson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1928,
    "peakFrom": 1965,
    "peakTo": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tages",
    "displayName": "Tages",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "taylor-swift",
    "displayName": "Taylor Swift",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "peakFrom": 2008,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ted-gardestad",
    "displayName": "Ted Gärdestad",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "teddy-lucic",
    "displayName": "Teddy Lučić",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thastrom",
    "displayName": "Thåström",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "the-ark",
    "displayName": "The Ark",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-doors",
    "displayName": "The Doors",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-hives",
    "displayName": "The Hives",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-police",
    "displayName": "The Police",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-smiths",
    "displayName": "The Smiths",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-soundtrack-of-our-lives",
    "displayName": "The Soundtrack of Our Lives",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1995,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-weeknd",
    "displayName": "The Weeknd",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1990,
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "thiago-silva",
    "displayName": "Thiago Silva",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thierry-henry",
    "displayName": "Thierry Henry",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-johansson-tennis",
    "displayName": "Thomas Johansson",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2002,
    "peakTo": 2005,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-muller",
    "displayName": "Thomas Muller",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-ravelli",
    "displayName": "Thomas Ravelli",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tim-cahill",
    "displayName": "Tim Cahill",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tim-howard",
    "displayName": "Tim Howard",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "timbuktu",
    "displayName": "Timbuktu",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tina-turner",
    "displayName": "Tina Turner",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1939,
    "peakFrom": 1960,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "titiyo",
    "displayName": "Titiyo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tobias-karlsson-handball",
    "displayName": "Tobias Karlsson",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tobias-linderoth",
    "displayName": "Tobias Linderoth",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tom-brady",
    "displayName": "Tom Brady",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tom-cruise",
    "displayName": "Tom Cruise",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1962,
    "peakFrom": 1985,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tom-hanks",
    "displayName": "Tom Hanks",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1956,
    "peakFrom": 1988,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tom-hiddleston",
    "displayName": "Tom Hiddleston",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1981,
    "peakFrom": 2004,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tom-jones",
    "displayName": "Tom Jones",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1940,
    "peakFrom": 1964,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tom-petty",
    "displayName": "Tom Petty",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "peakFrom": 1976,
    "peakTo": 2017,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tom-selleck",
    "displayName": "Tom Selleck",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1945,
    "peakFrom": 1968,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tomas-brolin",
    "displayName": "Tomas Brolin",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tomas-ledin",
    "displayName": "Tomas Ledin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tomas-von-bromssen",
    "displayName": "Tomas von Brömssen",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1943,
    "peakFrom": 1985,
    "peakTo": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tommy-korberg",
    "displayName": "Tommy Körberg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "toni-braxton",
    "displayName": "Toni Braxton",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1967,
    "peakFrom": 1993,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "toni-kroos",
    "displayName": "Toni Kroos",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "torbjorn-nilsson",
    "displayName": "Torbjörn Nilsson",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "torkel-petersson",
    "displayName": "Torkel Petersson",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2000,
    "peakTo": 2015,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tove-lo",
    "displayName": "Tove Lo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tracy-chapman",
    "displayName": "Tracy Chapman",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1964,
    "peakFrom": 1988,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "travis-scott",
    "displayName": "Travis Scott",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "truls-moregardh",
    "displayName": "Truls Möregårdh",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tusse",
    "displayName": "Tusse",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2021,
    "peakTo": 2025,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "u2",
    "displayName": "U2",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ulf-lundell",
    "displayName": "Ulf Lundell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ulla-skoog",
    "displayName": "Ulla Skoog",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 1990,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "uma-thurman",
    "displayName": "Uma Thurman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1970,
    "peakFrom": 1993,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "usain-bolt",
    "displayName": "Usain Bolt",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "usher",
    "displayName": "Usher",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1978,
    "peakFrom": 1994,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "venus-williams",
    "displayName": "Venus Williams",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "veronica-maggio",
    "displayName": "Veronica Maggio",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "vicente-del-bosque",
    "displayName": "Vicente del Bosque",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1950,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "victor-hedman",
    "displayName": "Victor Hedman",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "victor-leksell",
    "displayName": "Victor Leksell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "victor-lindelof",
    "displayName": "Victor Lindelöf",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "vikingarna",
    "displayName": "Vikingarna",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "viktor-gyokeres",
    "displayName": "Viktor Gyökeres",
    "category": "sport",
    "contentSubject": "athlete",
    "peakFrom": 2022,
    "peakTo": 2024,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "europe"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "vince-vaughn",
    "displayName": "Vince Vaughn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1970,
    "peakFrom": 1993,
    "peakTo": 2023,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "vincent-pontare",
    "displayName": "Vincent",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "vinnie-jones",
    "displayName": "Vinnie Jones",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1965,
    "peakFrom": 1988,
    "peakTo": 2018,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "virgil-van-dijk",
    "displayName": "Virgil van Dijk",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wayne-gretzky",
    "displayName": "Wayne Gretzky",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wayne-rooney",
    "displayName": "Wayne Rooney",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wenche-myhre",
    "displayName": "Wenche Myhre",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "wesley-sneijder",
    "displayName": "Wesley Sneijder",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wham",
    "displayName": "Wham!",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "whitney-houston",
    "displayName": "Whitney Houston",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1985,
    "peakTo": 2012,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "whoopi-goldberg",
    "displayName": "Whoopi Goldberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1955,
    "peakFrom": 1978,
    "peakTo": 2008,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "will-ferrell",
    "displayName": "Will Ferrell",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "will-smith",
    "displayName": "Will Smith",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "xabi-alonso",
    "displayName": "Xabi Alonso",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "xavi",
    "displayName": "Xavi",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "yao-ming",
    "displayName": "Yao Ming",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ylvis",
    "displayName": "Ylvis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2000,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "yohio",
    "displayName": "Yohio",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2013,
    "peakTo": 2016,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "zara-larsson",
    "displayName": "Zara Larsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1997,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "zendaya",
    "displayName": "Zendaya",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "unknown-region"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "zinedine-zidane",
    "displayName": "Zinédine Zidane",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "zlatan-ibrahimovic",
    "displayName": "Zlatan Ibrahimović",
    "category": "sport",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this athlete?"
  }
];

/** Distractor-pool per category — fallback-namn när katalog-poolen är för
 *  tunn för att fylla Letter Grid eller Final Selection. */
export const DISTRACTOR_POOL_NAMES: Partial<Record<ImageCategory, string[]>> =
  {
  "persons": [
    "Erik Andersson",
    "Anna Bergström",
    "Maria Lindqvist",
    "Per Johansson",
    "Karin Olsson",
    "Lars Eriksson",
    "Eva Karlsson",
    "Nils Persson",
    "Stina Larsson",
    "Sven Nilsson",
    "Margareta Svensson",
    "Bo Lindberg",
    "Kerstin Holm",
    "Gunnar Lundgren",
    "Hans Bergman",
    "Inger Sundström",
    "Rune Magnusson",
    "Ulrika Forsberg",
    "Olof Hedberg",
    "Birgitta Wallin",
    "John Smith",
    "Maria Garcia",
    "Wei Chen",
    "Akira Tanaka",
    "Fatima Al-Sayed",
    "David Brown",
    "Sarah Johnson",
    "Carlos Rodriguez",
    "Yuki Sato",
    "Anna Schmidt",
    "Pierre Dubois",
    "Elena Petrov",
    "Ahmed Hassan",
    "Olga Ivanova",
    "Hiroshi Yamada",
    "Sophie Martin",
    "Marco Rossi",
    "Karim Mansour",
    "Priya Sharma",
    "Thomas Mueller",
    "Quentin Adams",
    "Xavier Garcia",
    "Zara Ahmed",
    "Yusuf Kaya",
    "Hugo Bernard",
    "Juliette Laurent",
    "Diego Fernandez",
    "Felix Weber",
    "Greta Olsen",
    "Roberto Bianchi"
  ],
  "capitals": [
    "Madrid",
    "Vienna",
    "Helsinki",
    "Oslo",
    "Copenhagen",
    "Lisbon",
    "Athens",
    "Cairo",
    "Sydney",
    "Toronto",
    "Mexico City",
    "Brasília",
    "Buenos Aires",
    "Mumbai",
    "Bangkok",
    "Singapore",
    "Jakarta",
    "Manila",
    "Hanoi",
    "Tokyo",
    "Beijing",
    "Dublin",
    "Brussels",
    "Amsterdam",
    "Warsaw",
    "Prague",
    "Budapest",
    "Bucharest",
    "Sofia",
    "Ankara",
    "Tehran",
    "Riyadh",
    "Nairobi",
    "Lagos",
    "Reykjavik",
    "Tallinn",
    "Vilnius",
    "Kyiv",
    "Istanbul",
    "Edinburgh"
  ],
  "artists": [
    "Coldplay",
    "Arctic Monkeys",
    "The Strokes",
    "Lana Del Rey",
    "Lady Gaga",
    "Bruno Mars",
    "Adele",
    "Pink Floyd",
    "Led Zeppelin",
    "Queen",
    "AC/DC",
    "Aerosmith",
    "David Bowie",
    "Bob Dylan",
    "Frank Sinatra",
    "Whitney Houston",
    "Stevie Wonder",
    "Aretha Franklin",
    "The Weeknd",
    "Bruno Major",
    "Kanye West",
    "Jay-Z",
    "Snoop Dogg",
    "Dr. Dre",
    "Post Malone",
    "Bad Bunny",
    "Justin Bieber",
    "Dua Lipa",
    "Olivia Rodrigo",
    "Harry Styles",
    "Ed Sheeran",
    "Shakira",
    "Britney Spears",
    "Christina Aguilera",
    "Pink",
    "BTS",
    "Twice",
    "IU",
    "Bob Marley",
    "Eric Clapton",
    "Johnny Cash",
    "Dolly Parton",
    "Garth Brooks",
    "Nina Simone",
    "Etta James",
    "Daft Punk",
    "Calvin Harris",
    "Skrillex",
    "Diplo",
    "Marshmello"
  ]
};

/** Filtrera frågor som passar en specifik spelar-generation. */
export function getImageQuestionsForGeneration(
  generation: ImageQuestionAudience,
): ImageQuizQuestion[] {
  return IMAGE_QUIZ_QUESTIONS.filter(
    (q) => q.audiences.includes(generation) || q.audiences.includes('all'),
  );
}
