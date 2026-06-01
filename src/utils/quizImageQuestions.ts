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
  | 'athletes';

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
      "all"
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
      "all"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ace-of-base",
    "displayName": "Ace of Base",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "audiences": [
      "all"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "adam-peaty",
    "displayName": "Adam Peaty",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials",
      "gen-z"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ademir",
    "displayName": "Ademir",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1922,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "adna",
    "displayName": "Adna",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "aerosmith",
    "displayName": "Aerosmith",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1970,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "agnes-carlsson",
    "displayName": "Agnes Carlsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "audiences": [
      "millennials"
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
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "alain-prost",
    "displayName": "Alain Prost",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alan-shearer",
    "displayName": "Alan Shearer",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "albin-lee-meldau",
    "displayName": "Albin Lee Meldau",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "millennials"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "aleksandar-tirnanic",
    "displayName": "Aleksandar Tirnanić",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1910,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alessandro-del-piero",
    "displayName": "Alessandro Del Piero",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alessandro-nesta",
    "displayName": "Alessandro Nesta",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "alex-morgan",
    "displayName": "Alex Morgan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alex-ovechkin",
    "displayName": "Alex Ovechkin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alexander-isak",
    "displayName": "Alexander Isak",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "alexis-sanchez",
    "displayName": "Alexis Sanchez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "alf-ramsey",
    "displayName": "Alf Ramsey",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1920,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ali-daei",
    "displayName": "Ali Daei",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
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
      "millennials",
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "allyson-felix",
    "displayName": "Allyson Felix",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "amanda-jenssen",
    "displayName": "Amanda Jenssen",
    "category": "artists",
    "contentSubject": "artist",
    "peakFrom": 2007,
    "peakTo": 2015,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anders-f-ronnblom",
    "displayName": "Anders F Rönnblom",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "andre-agassi",
    "displayName": "Andre Agassi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andrea-bocelli",
    "displayName": "Andrea Bocelli",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1992,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "andrea-pirlo",
    "displayName": "Andrea Pirlo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-isaksson",
    "displayName": "Andreas Isaksson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andreas-palicka",
    "displayName": "Andreas Palicka",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andrej-kramaric",
    "displayName": "Andrej Kramaric",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andres-iniesta",
    "displayName": "Andrés Iniesta",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andrew-garfield",
    "displayName": "Andrew Garfield",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1983,
    "peakFrom": 2006,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "andriy-shevchenko",
    "displayName": "Andriy Shevchenko",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "andy-murray",
    "displayName": "Andy Murray",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "angel-di-maria",
    "displayName": "Ángel Di María",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "anitta",
    "displayName": "Anitta",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
    "peakFrom": 2013,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "anja-parson",
    "displayName": "Anja Pärson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "anna-sahlene",
    "displayName": "Anna Sahlene",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1976,
    "audiences": [
      "millennials"
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
      "millennials"
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
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "annika-sorenstam",
    "displayName": "Annika Sörenstam",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "antoine-griezmann",
    "displayName": "Antoine Griezmann",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "antonio-cabrini",
    "displayName": "Antonio Cabrini",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "anya-taylor-joy",
    "displayName": "Anya Taylor-Joy",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "arctic-monkeys",
    "displayName": "Arctic Monkeys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2002,
    "audiences": [
      "all"
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
      "elder"
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
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "arjen-robben",
    "displayName": "Arjen Robben",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "armand-duplantis",
    "displayName": "Armand Duplantis",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "arrigo-sacchi",
    "displayName": "Arrigo Sacchi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "arthur-ashe",
    "displayName": "Arthur Ashe",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1943,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "arturo-vidal",
    "displayName": "Arturo Vidal",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "asamoah-gyan",
    "displayName": "Asamoah Gyan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ashley-cole",
    "displayName": "Ashley Cole",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "aura-dione",
    "displayName": "Aura Dione",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "aurelien-tchouameni",
    "displayName": "Aurelien Tchouameni",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "aurora-aksnes",
    "displayName": "Aurora",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1996,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "millennials"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ayrton-senna",
    "displayName": "Ayrton Senna",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
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
      "all"
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
      "gen-z"
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
      "elder"
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
      "elder"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bastian-schweinsteiger",
    "displayName": "Bastian Schweinsteiger",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "beatles",
    "displayName": "The Beatles",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1960,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "bebeto",
    "displayName": "Bebeto",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x"
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
      "all"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "benedict-cumberbatch",
    "displayName": "Benedict Cumberbatch",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1976,
    "peakFrom": 1999,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bernardo-silva",
    "displayName": "Bernardo Silva",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bernd-schuster",
    "displayName": "Bernd Schuster",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "berti-vogts",
    "displayName": "Berti Vogts",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bill-russell",
    "displayName": "Bill Russell",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1934,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials",
      "gen-z"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "billy-joel",
    "displayName": "Billy Joel",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1971,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bjork",
    "displayName": "Björk",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "peakFrom": 1988,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bjorn-borg",
    "displayName": "Björn Borg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bjorn-daehlie",
    "displayName": "Bjørn Dæhlie",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bjorn-skifs",
    "displayName": "Björn Skifs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "audiences": [
      "elder"
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
      "all"
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
      "all"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bobby-charlton",
    "displayName": "Bobby Charlton",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1937,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bobby-moore",
    "displayName": "Bobby Moore",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1941,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "boris-becker",
    "displayName": "Boris Becker",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "borje-salming",
    "displayName": "Börje Salming",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "brie-larson",
    "displayName": "Brie Larson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1989,
    "peakFrom": 2012,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials"
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
      "elder"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "bruno-conti",
    "displayName": "Bruno Conti",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "bruno-fernandes",
    "displayName": "Bruno Fernandes",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bryan-ferry",
    "displayName": "Bryan Ferry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1971,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "bukayo-saka",
    "displayName": "Bukayo Saka",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2001,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "cafu",
    "displayName": "Cafu",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cafu-falcao",
    "displayName": "Cafu Falcao",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "carl-lewis",
    "displayName": "Carl Lewis",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carlos-alberto",
    "displayName": "Carlos Alberto",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carlos-alberto-parreira",
    "displayName": "Carlos Alberto Parreira",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1943,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carlos-alcaraz",
    "displayName": "Carlos Alcaraz",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2003,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "carlos-bilardo",
    "displayName": "Carlos Bilardo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "carolina-kluft",
    "displayName": "Carolina Klüft",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "caroline-seger",
    "displayName": "Caroline Seger",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cary-grant",
    "displayName": "Cary Grant",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1904,
    "peakFrom": 1937,
    "peakTo": 1966,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "cazzette",
    "displayName": "Cazzette",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2010,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cesar-luis-menotti",
    "displayName": "César Luis Menotti",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cesare-maldini",
    "displayName": "Cesare Maldini",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1932,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cesc-fabregas",
    "displayName": "Cesc Fabregas",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cha-bum-kun",
    "displayName": "Cha Bum Kun",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "charles-barkley",
    "displayName": "Charles Barkley",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "charlotte-kalla",
    "displayName": "Charlotte Kalla",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "gen-x"
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
      "millennials"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "chris-paul",
    "displayName": "Chris Paul",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "christer-sjogren",
    "displayName": "Christer Sjögren",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "audiences": [
      "elder"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "christian-olsson",
    "displayName": "Christian Olsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "christian-pulisic",
    "displayName": "Christian Pulisic",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "elder"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "clarence-seedorf",
    "displayName": "Clarence Seedorf",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "clark-gable",
    "displayName": "Clark Gable",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1901,
    "peakFrom": 1934,
    "peakTo": 1960,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "claudio-taffarel",
    "displayName": "Claudio Taffarel",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "clint-dempsey",
    "displayName": "Clint Dempsey",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "coco-gauff",
    "displayName": "Coco Gauff",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2004,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "cody-gakpo",
    "displayName": "Cody Gakpo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "colin-firth",
    "displayName": "Colin Firth",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1960,
    "peakFrom": 1983,
    "peakTo": 2013,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "connor-mcdavid",
    "displayName": "Connor McDavid",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "cristiano-ronaldo",
    "displayName": "Cristiano Ronaldo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "d-a-d",
    "displayName": "D-A-D",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "daft-punk",
    "displayName": "Daft Punk",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "audiences": [
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dani-alves",
    "displayName": "Dani Alves",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "daniel-alfredsson",
    "displayName": "Daniel Alfredsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "daniel-passarella",
    "displayName": "Daniel Passarella",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "daniel-sedin",
    "displayName": "Daniel Sedin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniel-stahl",
    "displayName": "Daniel Ståhl",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2019,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniele-de-rossi",
    "displayName": "Daniele De Rossi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "daniil-medvedev",
    "displayName": "Daniil Medvedev",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1996,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "david-beckham",
    "displayName": "David Beckham",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "david-dencik",
    "displayName": "David Dencik",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "david-hellenius",
    "displayName": "David Hellenius",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2022,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "david-trezeguet",
    "displayName": "David Trezeguet",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "david-villa",
    "displayName": "David Villa",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "declan-rice",
    "displayName": "Declan Rice",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "deco",
    "displayName": "Deco",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "def-leppard",
    "displayName": "Def Leppard",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "dejan-kulusevski",
    "displayName": "Dejan Kulusevski",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "demetrio-albertini",
    "displayName": "Demetrio Albertini",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "dennis-bergkamp",
    "displayName": "Dennis Bergkamp",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "depeche-mode",
    "displayName": "Depeche Mode",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "didier-deschamps",
    "displayName": "Didier Deschamps",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "didier-drogba",
    "displayName": "Didier Drogba",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-costa",
    "displayName": "Diego Costa",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-forlan",
    "displayName": "Diego Forlan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-maradona",
    "displayName": "Diego Maradona",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "diego-simeone",
    "displayName": "Diego Simeone",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "gen-x",
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dino-zoff",
    "displayName": "Dino Zoff",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "dire-straits",
    "displayName": "Dire Straits",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "dirk-kuyt",
    "displayName": "Dirk Kuyt",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "djalma-santos",
    "displayName": "Djalma Santos",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1929,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "docenterna",
    "displayName": "Docenterna",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
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
      "gen-z"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "don-henley",
    "displayName": "Don Henley",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "peakFrom": 1971,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "donald-sutherland",
    "displayName": "Donald Sutherland",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1935,
    "peakFrom": 1958,
    "peakTo": 1988,
    "audiences": [
      "gen-x"
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
      "elder"
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
      "gen-z"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "dunga",
    "displayName": "Dunga",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "duran-duran",
    "displayName": "Duran Duran",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1978,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "dwyane-wade",
    "displayName": "Dwyane Wade",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "e-type",
    "displayName": "E-Type",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "audiences": [
      "gen-x",
      "millennials"
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
      "millennials"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "eartha-kitt",
    "displayName": "Eartha Kitt",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "peakFrom": 1952,
    "peakTo": 2008,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "eden-hazard",
    "displayName": "Eden Hazard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "edgar-davids",
    "displayName": "Edgar Davids",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "edinson-cavani",
    "displayName": "Edinson Cavani",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "el-hadji-diouf",
    "displayName": "El Hadji Diouf",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eldkvarn",
    "displayName": "Eldkvarn",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1971,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
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
      "elder"
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
      "elder"
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
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "emilio-butragueno",
    "displayName": "Emilio Butragueno",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "emma-green",
    "displayName": "Emma Green",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2005,
    "peakTo": 2014,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "emmanuel-adebayor",
    "displayName": "Emmanuel Adebayor",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "enya",
    "displayName": "Enya",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1961,
    "peakFrom": 1987,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "enzo-bearzot",
    "displayName": "Enzo Bearzot",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1927,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "eric-cantona",
    "displayName": "Eric Cantona",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "gen-x"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "erik-karlsson",
    "displayName": "Erik Karlsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "erling-haaland",
    "displayName": "Erling Haaland",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "errol-flynn",
    "displayName": "Errol Flynn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1909,
    "peakFrom": 1935,
    "peakTo": 1952,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "esteban-cambiasso",
    "displayName": "Esteban Cambiasso",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "europe",
    "displayName": "Europe",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1979,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "eurythmics",
    "displayName": "Eurythmics",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "eusebio",
    "displayName": "Eusébio",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "elder"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "fabio-cannavaro",
    "displayName": "Fabio Cannavaro",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "familjen",
    "displayName": "Familjen",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2002,
    "audiences": [
      "all"
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
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "fernando-hierro",
    "displayName": "Fernando Hierro",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "filippo-inzaghi",
    "displayName": "Filippo Inzaghi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
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
      "all"
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
      "all"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "floyd-mayweather",
    "displayName": "Floyd Mayweather",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "foo-fighters",
    "displayName": "Foo Fighters",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "francesco-totti",
    "displayName": "Francesco Totti",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "franco-baresi",
    "displayName": "Franco Baresi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frank-lampard",
    "displayName": "Frank Lampard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "frank-rijkaard",
    "displayName": "Frank Rijkaard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "franz-beckenbauer",
    "displayName": "Franz Beckenbauer",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "fred",
    "displayName": "Fred",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "freddie-ljungberg",
    "displayName": "Freddie Ljungberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frenkie-de-jong",
    "displayName": "Frenkie De Jong",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "frida-hyvonen",
    "displayName": "Frida Hyvönen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1977,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "frida-karlsson",
    "displayName": "Frida Karlsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gaetano-scirea",
    "displayName": "Gaetano Scirea",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gareth-bale",
    "displayName": "Gareth Bale",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "garth-brooks",
    "displayName": "Garth Brooks",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1962,
    "peakFrom": 1989,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "gary-cooper",
    "displayName": "Gary Cooper",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1901,
    "peakFrom": 1929,
    "peakTo": 1959,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gary-lineker",
    "displayName": "Gary Lineker",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "gen-x"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gennaro-gattuso",
    "displayName": "Gennaro Gattuso",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "george-best",
    "displayName": "George Best",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "george-foreman",
    "displayName": "George Foreman",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "gerard-pique",
    "displayName": "Gerard Piqué",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gerd-muller",
    "displayName": "Gerd Müller",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ghost",
    "displayName": "Ghost",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2006,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "giannis-antetokounmpo",
    "displayName": "Giannis Antetokounmpo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "giuseppe-meazza",
    "displayName": "Giuseppe Meazza",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1910,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "glenn-hoddle",
    "displayName": "Glenn Hoddle",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "glenn-hysen",
    "displayName": "Glenn Hysén",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "gonzalo-higuain",
    "displayName": "Gonzalo Higuain",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "goran-ivanisevic",
    "displayName": "Goran Ivanišević",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "elder"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "gregory-peck",
    "displayName": "Gregory Peck",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1916,
    "peakFrom": 1945,
    "peakTo": 1975,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "guillermo-ochoa",
    "displayName": "Guillermo Ochoa",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gunde-svan",
    "displayName": "Gunde Svan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "gunnar-nordahl",
    "displayName": "Gunnar Nordahl",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1921,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "all"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "guus-hiddink",
    "displayName": "Guus Hiddink",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
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
      "millennials",
      "gen-z"
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
      "all"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "halsey",
    "displayName": "Halsey",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2015,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "hank-williams",
    "displayName": "Hank Williams",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1923,
    "peakFrom": 1947,
    "peakTo": 1953,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "hans-peter-briegel",
    "displayName": "Hans Peter Briegel",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "happy-jankell",
    "displayName": "Happy Jankell",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2015,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "harry-kane",
    "displayName": "Harry Kane",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "harry-kewell",
    "displayName": "Harry Kewell",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "hayley-williams",
    "displayName": "Hayley Williams",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "peakFrom": 2004,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "hector-cuper",
    "displayName": "Héctor Cúper",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "helen-mirren",
    "displayName": "Helen Mirren",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1945,
    "peakFrom": 1968,
    "peakTo": 1998,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "helen-sjoholm",
    "displayName": "Helen Sjöholm",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "helena-bonham-carter",
    "displayName": "Helena Bonham Carter",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1966,
    "peakFrom": 1989,
    "peakTo": 2019,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "helmut-rahn",
    "displayName": "Helmut Rahn",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1929,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "helmut-schon",
    "displayName": "Helmut Schön",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1915,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-dorsin",
    "displayName": "Henrik Dorsin",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2010,
    "peakTo": 2022,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "henrik-larsson",
    "displayName": "Henrik Larsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-lundqvist",
    "displayName": "Henrik Lundqvist",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-sedin",
    "displayName": "Henrik Sedin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-stenson",
    "displayName": "Henrik Stenson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "henrik-zetterberg",
    "displayName": "Henrik Zetterberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "hidetoshi-nakata",
    "displayName": "Hidetoshi Nakata",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "hugh-jackman",
    "displayName": "Hugh Jackman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "hugo-lloris",
    "displayName": "Hugo Lloris",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "hugo-sanchez",
    "displayName": "Hugo Sanchez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ian-rush",
    "displayName": "Ian Rush",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "idris-elba",
    "displayName": "Idris Elba",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "iga-swiatek",
    "displayName": "Iga Świątek",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2001,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "iker-casillas",
    "displayName": "Iker Casillas",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "imperiet",
    "displayName": "Imperiet",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "ingemar-stenmark",
    "displayName": "Ingemar Stenmark",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ivan-lendl",
    "displayName": "Ivan Lendl",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ivan-rakitic",
    "displayName": "Ivan Rakitic",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "j-balvin",
    "displayName": "J Balvin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
    "peakFrom": 2009,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jack-harlow",
    "displayName": "Jack Harlow",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1998,
    "peakFrom": 2020,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jack-nicklaus",
    "displayName": "Jack Nicklaus",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1940,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jackie-stewart",
    "displayName": "Jackie Stewart",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1939,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jacob-elordi",
    "displayName": "Jacob Elordi",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1997,
    "peakFrom": 2020,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jairzinho",
    "displayName": "Jairzinho",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jake-gyllenhaal",
    "displayName": "Jake Gyllenhaal",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
    "peakFrom": 2003,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jakob-ingebrigtsen",
    "displayName": "Jakob Ingebrigtsen",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "james-cagney",
    "displayName": "James Cagney",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1899,
    "peakFrom": 1931,
    "peakTo": 1961,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "james-rodriguez",
    "displayName": "James Rodriguez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "james-taylor",
    "displayName": "James Taylor",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1970,
    "peakTo": 2024,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jamie-carragher",
    "displayName": "Jamie Carragher",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jan-ceulemans",
    "displayName": "Jan Ceulemans",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1957,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jan-ove-waldner",
    "displayName": "Jan-Ove Waldner",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jannik-sinner",
    "displayName": "Jannik Sinner",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2001,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jaromir-jagr",
    "displayName": "Jaromír Jágr",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jason-bateman",
    "displayName": "Jason Bateman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "peakFrom": 1992,
    "peakTo": 2022,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jason-statham",
    "displayName": "Jason Statham",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "javier-aguirre",
    "displayName": "Javier Aguirre",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-hernandez",
    "displayName": "Javier Hernandez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-mascherano",
    "displayName": "Javier Mascherano",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "javier-zanetti",
    "displayName": "Javier Zanetti",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jean-claude-killy",
    "displayName": "Jean-Claude Killy",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1943,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jean-pierre-papin",
    "displayName": "Jean-Pierre Papin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jean-tigana",
    "displayName": "Jean Tigana",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jeff-bridges",
    "displayName": "Jeff Bridges",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
    "peakFrom": 1972,
    "peakTo": 2002,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jenna-ortega",
    "displayName": "Jenna Ortega",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2002,
    "peakFrom": 2018,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jenny-rissveds",
    "displayName": "Jenny Rissveds",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2016,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jesper-parnevik",
    "displayName": "Jesper Parnevik",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jim-broadbent",
    "displayName": "Jim Broadbent",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
    "peakFrom": 1972,
    "peakTo": 2002,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jimmy-connors",
    "displayName": "Jimmy Connors",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joachim-low",
    "displayName": "Joachim Löw",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "joan-jett",
    "displayName": "Joan Jett",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1975,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "joao-felix",
    "displayName": "João Félix",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joaquin",
    "displayName": "Joaquin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "joe-frazier",
    "displayName": "Joe Frazier",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "johan-cruyff",
    "displayName": "Johan Cruyff",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "johan-elmander",
    "displayName": "Johan Elmander",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2007,
    "peakTo": 2014,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-x"
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
      "gen-x"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "john-malkovich",
    "displayName": "John Malkovich",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1953,
    "peakFrom": 1976,
    "peakTo": 2006,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "john-mcenroe",
    "displayName": "John McEnroe",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "john-terry",
    "displayName": "John Terry",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "elder"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jonathan-edwards",
    "displayName": "Jonathan Edwards",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "joni-mitchell",
    "displayName": "Joni Mitchell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1968,
    "peakTo": 2024,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "jorgen-brink",
    "displayName": "Jörgen Brink",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2003,
    "peakTo": 2010,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jorgen-persson",
    "displayName": "Jörgen Persson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jose-pekerman",
    "displayName": "José Pekerman",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "journey",
    "displayName": "Journey",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "audiences": [
      "gen-x",
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "juan-mata",
    "displayName": "Juan Mata",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "juan-roman-riquelme",
    "displayName": "Juan Roman Riquelme",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "juan-sebastian-veron",
    "displayName": "Juan Sebastian Veron",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jude-bellingham",
    "displayName": "Jude Bellingham",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2003,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jude-law",
    "displayName": "Jude Law",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "jules-kounde",
    "displayName": "Jules Kounde",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "julio-cesar",
    "displayName": "Julio Cesar",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jupp-derwall",
    "displayName": "Jupp Derwall",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1927,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "jurgen-klinsmann",
    "displayName": "Jurgen Klinsmann",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "just-fontaine",
    "displayName": "Just Fontaine",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1933,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kajsa-bergqvist",
    "displayName": "Kajsa Bergqvist",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2002,
    "peakTo": 2006,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kaka",
    "displayName": "Kaká",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kareem-abdul-jabbar",
    "displayName": "Kareem Abdul-Jabbar",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "karl-heinz-rummenigge",
    "displayName": "Karl Heinz Rummenigge",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "karsten-warholm",
    "displayName": "Karsten Warholm",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1996,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "katarina-witt",
    "displayName": "Katarina Witt",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "katie-ledecky",
    "displayName": "Katie Ledecky",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "katie-taylor",
    "displayName": "Katie Taylor",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "keisuke-honda",
    "displayName": "Keisuke Honda",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kennet-andersson",
    "displayName": "Kennet Andersson",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 1994,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kenneth-branagh",
    "displayName": "Kenneth Branagh",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1960,
    "peakFrom": 1983,
    "peakTo": 2013,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kenny-dalglish",
    "displayName": "Kenny Dalglish",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x"
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
      "all"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kevin-de-bruyne",
    "displayName": "Kevin De Bruyne",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kevin-durant",
    "displayName": "Kevin Durant",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kevin-hart",
    "displayName": "Kevin Hart",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1979,
    "peakFrom": 2002,
    "peakTo": 2026,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "keylor-navas",
    "displayName": "Keylor Navas",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kim-andersson",
    "displayName": "Kim Andersson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kim-kallstrom",
    "displayName": "Kim Källström",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2005,
    "peakTo": 2016,
    "audiences": [
      "millennials",
      "gen-z"
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
      "elder"
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
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kobe-bryant",
    "displayName": "Kobe Bryant",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kosovare-asllani",
    "displayName": "Kosovare Asllani",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2012,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
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
      "gen-z"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kurt-hamrin",
    "displayName": "Kurt Hamrin",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 1958,
    "peakTo": 1967,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "kurt-russell",
    "displayName": "Kurt Russell",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1951,
    "peakFrom": 1974,
    "peakTo": 2004,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "kygo",
    "displayName": "Kygo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "kylian-mbappe",
    "displayName": "Kylian Mbappé",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lakhdar-belloumi",
    "displayName": "Lakhdar Belloumi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "laleh",
    "displayName": "Laleh",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "landon-donovan",
    "displayName": "Landon Donovan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "larry-bird",
    "displayName": "Larry Bird",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lars-lagerback",
    "displayName": "Lars Lagerbäck",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
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
      "all"
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
      "gen-x"
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
      "elder"
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
      "gen-x"
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
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lauren-bacall",
    "displayName": "Lauren Bacall",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1924,
    "peakFrom": 1944,
    "peakTo": 1985,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lebron-james",
    "displayName": "LeBron James",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "led-zeppelin",
    "displayName": "Led Zeppelin",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "audiences": [
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lena-horne",
    "displayName": "Lena Horne",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1917,
    "peakFrom": 1942,
    "peakTo": 2010,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lennox-lewis",
    "displayName": "Lennox Lewis",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lev-yashin",
    "displayName": "Lev Yashin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1929,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lewis-hamilton",
    "displayName": "Lewis Hamilton",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lilian-thuram",
    "displayName": "Lilian Thuram",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lill-babs",
    "displayName": "Lill-Babs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1938,
    "audiences": [
      "elder"
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
      "elder"
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
      "millennials",
      "gen-z"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "linnea-henriksson",
    "displayName": "Linnéa Henriksson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lionel-messi",
    "displayName": "Lionel Messi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lionel-scaloni",
    "displayName": "Lionel Scaloni",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "lisa-ekdahl",
    "displayName": "Lisa Ekdahl",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "audiences": [
      "gen-x"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "elder"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "lizzo",
    "displayName": "Lizzo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "peakFrom": 2013,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "ljubomir-vranjes",
    "displayName": "Ljubomir Vranjes",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "gen-x",
      "millennials"
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
      "millennials"
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
      "elder"
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
      "all"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lothar-matthaus",
    "displayName": "Lothar Matthaus",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "lotta-schelin",
    "displayName": "Lotta Schelin",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2016,
    "audiences": [
      "millennials",
      "gen-z"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "louis-van-gaal",
    "displayName": "Louis van Gaal",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1951,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ludvig-aberg",
    "displayName": "Ludvig Åberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luigi-riva",
    "displayName": "Luigi Riva",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luis-aragones",
    "displayName": "Luis Aragones",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luis-figo",
    "displayName": "Luis Figo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luis-suarez",
    "displayName": "Luis Suarez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luiz-felipe-scolari",
    "displayName": "Luiz Felipe Scolari",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luka-doncic",
    "displayName": "Luka Dončić",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "luka-modric",
    "displayName": "Luka Modrić",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "magdalena-forsberg",
    "displayName": "Magdalena Forsberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "magic-johnson",
    "displayName": "Magic Johnson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "magnus-wislander",
    "displayName": "Magnus Wislander",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "malin-akerman",
    "displayName": "Malin Åkerman",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2007,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "maluma",
    "displayName": "Maluma",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2014,
    "peakTo": 2024,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mando-diao",
    "displayName": "Mando Diao",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1999,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "manny-pacquiao",
    "displayName": "Manny Pacquiao",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mans-zelmerlow",
    "displayName": "Måns Zelmerlöw",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "manuel-neuer",
    "displayName": "Manuel Neuer",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marat-safin",
    "displayName": "Marat Safin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "marcello-lippi",
    "displayName": "Marcello Lippi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcelo",
    "displayName": "Marcelo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcelo-brozovic",
    "displayName": "Marcelo Brozovic",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcelo-salas",
    "displayName": "Marcelo Salas",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marco-materazzi",
    "displayName": "Marco Materazzi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marco-tardelli",
    "displayName": "Marco Tardelli",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1954,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marco-van-basten",
    "displayName": "Marco van Basten",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marcus-hellner",
    "displayName": "Marcus Hellner",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "maria-mena",
    "displayName": "Maria Mena",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "millennials"
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
      "gen-x"
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
      "gen-x"
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
      "millennials"
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
      "millennials"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mario-kempes",
    "displayName": "Mario Kempes",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1954,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mario-lemieux",
    "displayName": "Mario Lemieux",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mario-mandzukic",
    "displayName": "Mario Mandzukic",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mario-zagallo",
    "displayName": "Mário Zagallo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1931,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "marion-cotillard",
    "displayName": "Marion Cotillard",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1998,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "marit-larsen",
    "displayName": "Marit Larsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mark-ruffalo",
    "displayName": "Mark Ruffalo",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1990,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "millennials"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "markus-naslund",
    "displayName": "Markus Näslund",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "martin-brodeur",
    "displayName": "Martin Brodeur",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "martin-dahlin",
    "displayName": "Martin Dahlin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "martin-odegaard",
    "displayName": "Martin Ødegaard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1998,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "martina-navratilova",
    "displayName": "Martina Navratilova",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mats-naslund",
    "displayName": "Mats Näslund",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mats-sundin",
    "displayName": "Mats Sundin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mats-wilander",
    "displayName": "Mats Wilander",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1964,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "matthijs-de-ligt",
    "displayName": "Matthijs De Ligt",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1999,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mattias-andersson",
    "displayName": "Mattias Andersson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "max-verstappen",
    "displayName": "Max Verstappen",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "maxwell",
    "displayName": "Maxwell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1973,
    "peakFrom": 1996,
    "peakTo": 2024,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "megan-rapinoe",
    "displayName": "Megan Rapinoe",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "memphis-depay",
    "displayName": "Memphis Depay",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1994,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "all"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "michael-essien",
    "displayName": "Michael Essien",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "michael-jordan",
    "displayName": "Michael Jordan",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "michael-owen",
    "displayName": "Michael Owen",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michael-schumacher",
    "displayName": "Michael Schumacher",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michel-platini",
    "displayName": "Michel Platini",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "michel-torneus",
    "displayName": "Michel Tornéus",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2012,
    "peakTo": 2016,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mikael-wiehe",
    "displayName": "Mikael Wiehe",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1946,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mikaela-lauren",
    "displayName": "Mikaela Laurén",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2010,
    "peakTo": 2018,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "mikaela-shiffrin",
    "displayName": "Mikaela Shiffrin",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1995,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "milla-jovovich",
    "displayName": "Milla Jovovich",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1998,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "miroslav-klose",
    "displayName": "Miroslav Klose",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "mladen-ramljak",
    "displayName": "Mladen Ramljak",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "moa-gammel",
    "displayName": "Moa Gammel",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2008,
    "peakTo": 2018,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "mohamed-salah",
    "displayName": "Mohamed Salah",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "moonica-mac",
    "displayName": "Moonica Mac",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "morten-olsen",
    "displayName": "Morten Olsen",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "muhammad-ali",
    "displayName": "Muhammad Ali",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nadia-comaneci",
    "displayName": "Nadia Comăneci",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nani",
    "displayName": "Nani",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "naomi-osaka",
    "displayName": "Naomi Osaka",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "naomi-watts",
    "displayName": "Naomi Watts",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "elder"
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
      "all"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "neil-young",
    "displayName": "Neil Young",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1969,
    "peakTo": 2024,
    "audiences": [
      "elder"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "neymar",
    "displayName": "Neymar",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ngolo-kante",
    "displayName": "Ngolo Kante",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nicklas-lidstrom",
    "displayName": "Nicklas Lidström",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "niki-lauda",
    "displayName": "Niki Lauda",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "niklas-stromstedt",
    "displayName": "Niklas Strömstedt",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "nikola-jokic",
    "displayName": "Nikola Jokić",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1995,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nils-liedholm",
    "displayName": "Nils Liedholm",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1922,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nils-van-der-poel",
    "displayName": "Nils van der Poel",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2021,
    "peakTo": 2022,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "nilton-santos",
    "displayName": "Nilton Santos",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1925,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "novak-djokovic",
    "displayName": "Novak Djokovic",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "olga-korbut",
    "displayName": "Olga Korbut",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1955,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "oliver-kahn",
    "displayName": "Oliver Kahn",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "olivier-giroud",
    "displayName": "Olivier Giroud",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "olle-adolphson",
    "displayName": "Olle Adolphson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1934,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "olof-mellberg",
    "displayName": "Olof Mellberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2001,
    "peakTo": 2012,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "oscar",
    "displayName": "Oscar",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "elder"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "otto-rehhagel",
    "displayName": "Otto Rehhagel",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1938,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "paolo-maldini",
    "displayName": "Paolo Maldini",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1968,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "paolo-rossi",
    "displayName": "Paolo Rossi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "park-ji-sung",
    "displayName": "Park Ji Sung",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pat-benatar",
    "displayName": "Pat Benatar",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1953,
    "peakFrom": 1979,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pat-jennings",
    "displayName": "Pat Jennings",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1945,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrick-kluivert",
    "displayName": "Patrick Kluivert",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "patrick-mahomes",
    "displayName": "Patrick Mahomes",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1995,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "patrick-vieira",
    "displayName": "Patrick Vieira",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "patrik-sjoberg",
    "displayName": "Patrik Sjöberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1965,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "paul-gascoigne",
    "displayName": "Paul Gascoigne",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "paul-pogba",
    "displayName": "Paul Pogba",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pavel-nedved",
    "displayName": "Pavel Nedved",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pedro-rodriguez",
    "displayName": "Pedro Rodriguez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pele",
    "displayName": "Pelé",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1940,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "pepe",
    "displayName": "Pepe",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "per-carlen",
    "displayName": "Per Carlén",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1960,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "millennials"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "pernilla-wiberg",
    "displayName": "Pernilla Wiberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "pete-sampras",
    "displayName": "Pete Sampras",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1971,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "peter-forsberg",
    "displayName": "Peter Forsberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "petr-cech",
    "displayName": "Petr Cech",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1982,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "millennials"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "phil-foden",
    "displayName": "Phil Foden",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "philipp-lahm",
    "displayName": "Philipp Lahm",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "millennials"
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
      "all"
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
      "gen-x"
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
      "gen-z"
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
      "gen-x"
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
      "elder"
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
      "gen-x"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "rabah-madjer",
    "displayName": "Rabah Madjer",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1958,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rachel-mohlin",
    "displayName": "Rachel Mohlin",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2010,
    "peakTo": 2022,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "rachel-weisz",
    "displayName": "Rachel Weisz",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1970,
    "peakFrom": 1993,
    "peakTo": 2023,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "radamel-falcao",
    "displayName": "Radamel Falcao",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rafa-marquez",
    "displayName": "Rafael Márquez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rafael-nadal",
    "displayName": "Rafael Nadal",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "raphael-varane",
    "displayName": "Raphael Varane",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "raul",
    "displayName": "Raul",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "raymond-domenech",
    "displayName": "Raymond Domenech",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ricardo-la-volpe",
    "displayName": "Ricardo La Volpe",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1952,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ricardo-quaresma",
    "displayName": "Ricardo Quaresma",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "rio-ferdinand",
    "displayName": "Rio Ferdinand",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rivaldo",
    "displayName": "Rivaldo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rivellino",
    "displayName": "Rivellino",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1946,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robbie-keane",
    "displayName": "Robbie Keane",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robert-lewandowski",
    "displayName": "Robert Lewandowski",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "roberto-baggio",
    "displayName": "Roberto Baggio",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1967,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "roberto-donadoni",
    "displayName": "Roberto Donadoni",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "roberto-martinez",
    "displayName": "Roberto Martínez",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "robin-olsen",
    "displayName": "Robin Olsen",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2018,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-soderling",
    "displayName": "Robin Söderling",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2009,
    "peakTo": 2011,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "robin-van-persie",
    "displayName": "Robin Van Persie",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "robinho",
    "displayName": "Robinho",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "roger-federer",
    "displayName": "Roger Federer",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "rogerio-ceni",
    "displayName": "Rogerio Ceni",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "rolling-stones",
    "displayName": "The Rolling Stones",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1962,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "romario",
    "displayName": "Romário",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "romelu-lukaku",
    "displayName": "Romelu Lukaku",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ron-howard",
    "displayName": "Ron Howard",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1954,
    "peakFrom": 1977,
    "peakTo": 2007,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ronaldinho",
    "displayName": "Ronaldinho",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ronaldo-nazario",
    "displayName": "Ronaldo Nazário",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "all"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "russell-crowe",
    "displayName": "Russell Crowe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1964,
    "peakFrom": 1987,
    "peakTo": 2017,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ruud-gullit",
    "displayName": "Ruud Gullit",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1962,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ruud-krol",
    "displayName": "Ruud Krol",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ruud-van-nistelrooy",
    "displayName": "Ruud Van Nistelrooy",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "ryan-giggs",
    "displayName": "Ryan Giggs",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1973,
    "audiences": [
      "elder",
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "ryan-reynolds",
    "displayName": "Ryan Reynolds",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1976,
    "peakFrom": 1999,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
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
      "millennials"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sade",
    "displayName": "Sade",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1959,
    "peakFrom": 1984,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sadie-sink",
    "displayName": "Sadie Sink",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2002,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-x"
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
      "elder"
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
      "millennials"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "samuel-etoo",
    "displayName": "Samuel Eto'o",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sandro-mazzola",
    "displayName": "Sandro Mazzola",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1942,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sanna-nielsen",
    "displayName": "Sanna Nielsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "audiences": [
      "millennials"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "saoirse-ronan",
    "displayName": "Saoirse Ronan",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1994,
    "peakFrom": 2007,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sara-sjostrom",
    "displayName": "Sarah Sjöström",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
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
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "elder"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sebastian-larsson",
    "displayName": "Sebastian Larsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sebastian-vettel",
    "displayName": "Sebastian Vettel",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials",
      "gen-z"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sepp-maier",
    "displayName": "Sepp Maier",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1944,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "serena-williams",
    "displayName": "Serena Williams",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergey-bubka",
    "displayName": "Sergey Bubka",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1963,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergio-aguero",
    "displayName": "Sergio Aguero",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergio-busquets",
    "displayName": "Sergio Busquets",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sergio-ramos",
    "displayName": "Sergio Ramos",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "shania-twain",
    "displayName": "Shania Twain",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "peakFrom": 1993,
    "peakTo": 2024,
    "audiences": [
      "gen-x"
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
      "gen-x"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "shinji-kagawa",
    "displayName": "Shinji Kagawa",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "shirley-clamp",
    "displayName": "Shirley Clamp",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1973,
    "audiences": [
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "shunsuke-nakamura",
    "displayName": "Shunsuke Nakamura",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1978,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sidney-crosby",
    "displayName": "Sidney Crosby",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1987,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "silvana-imam",
    "displayName": "Silvana Imam",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "simone-biles",
    "displayName": "Simone Biles",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1997,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sissel-kyrkjebo",
    "displayName": "Sissel Kyrkjebø",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "audiences": [
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "snoh-aalegra",
    "displayName": "Snoh Aalegra",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "socrates",
    "displayName": "Sócrates",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1954,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sofia-helin",
    "displayName": "Sofia Helin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1972,
    "peakFrom": 1995,
    "peakTo": 2025,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sol-campbell",
    "displayName": "Sol Campbell",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1974,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "son-heung-min",
    "displayName": "Son Heung-min",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1992,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "sophie-zelmani",
    "displayName": "Sophie Zelmani",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "millennials"
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
      "elder"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "stefan-edberg",
    "displayName": "Stefan Edberg",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1966,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "stefan-holm",
    "displayName": "Stefan Holm",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1976,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "stefan-lovgren",
    "displayName": "Stefan Lövgren",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1970,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "steffi-graf",
    "displayName": "Steffi Graf",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1969,
    "audiences": [
      "elder",
      "gen-x"
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
      "gen-x"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "stephen-curry",
    "displayName": "Stephen Curry",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "steve-angello",
    "displayName": "Steve Angello",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "steven-gerrard",
    "displayName": "Steven Gerrard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "stina-nilsson",
    "displayName": "Stina Nilsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1993,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sugar-ray-leonard",
    "displayName": "Sugar Ray Leonard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "susanna-kallur",
    "displayName": "Susanna Kallur",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2006,
    "peakTo": 2008,
    "audiences": [
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "sven-goran-eriksson",
    "displayName": "Sven-Göran Eriksson",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1948,
    "audiences": [
      "elder",
      "gen-x"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "sverrir-gudnason",
    "displayName": "Sverrir Gudnason",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1978,
    "peakFrom": 2001,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "sydney-sweeney",
    "displayName": "Sydney Sweeney",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1997,
    "peakFrom": 2020,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "gen-z"
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
      "elder"
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
      "all"
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
      "gen-z"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "teofilo-cubillas",
    "displayName": "Teófilo Cubillas",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1949,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "terry-crews",
    "displayName": "Terry Crews",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1968,
    "peakFrom": 1991,
    "peakTo": 2021,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "thastrom",
    "displayName": "Thåström",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1957,
    "audiences": [
      "gen-x"
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
      "all"
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
      "all"
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
      "all"
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
      "all"
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
      "all"
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
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "the-tallest-man-on-earth",
    "displayName": "The Tallest Man on Earth",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "thiago-silva",
    "displayName": "Thiago Silva",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thierry-henry",
    "displayName": "Thierry Henry",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-johansson-tennis",
    "displayName": "Thomas Johansson",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2002,
    "peakTo": 2005,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-muller",
    "displayName": "Thomas Muller",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1989,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "thomas-ravelli",
    "displayName": "Thomas Ravelli",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1959,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tim-cahill",
    "displayName": "Tim Cahill",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tim-howard",
    "displayName": "Tim Howard",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "timothee-chalamet",
    "displayName": "Timothée Chalamet",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1995,
    "peakFrom": 2017,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
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
      "elder"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tite",
    "displayName": "Tite",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "titiyo",
    "displayName": "Titiyo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1967,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "tobias-karlsson-handball",
    "displayName": "Tobias Karlsson",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2008,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tom-brady",
    "displayName": "Tom Brady",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1977,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
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
      "elder"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tom-holland",
    "displayName": "Tom Holland",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "peakFrom": 2016,
    "peakTo": 2026,
    "audiences": [
      "millennials",
      "gen-z"
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
      "elder"
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
      "gen-x"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tomas-ledin",
    "displayName": "Tomas Ledin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "audiences": [
      "elder"
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
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tomislav-ivic",
    "displayName": "Tomislav Ivić",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1933,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tommy-korberg",
    "displayName": "Tommy Körberg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "audiences": [
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "toni-kroos",
    "displayName": "Toni Kroos",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "tostao",
    "displayName": "Tostão",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1947,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tove-lo",
    "displayName": "Tove Lo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "audiences": [
      "millennials"
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
      "millennials"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "truls-moregardh",
    "displayName": "Truls Möregårdh",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2002,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "tuva-novotny",
    "displayName": "Tuva Novotny",
    "category": "actors",
    "contentSubject": "actor",
    "peakFrom": 2004,
    "peakTo": 2020,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "u2",
    "displayName": "U2",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1976,
    "audiences": [
      "all"
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
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "usain-bolt",
    "displayName": "Usain Bolt",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1986,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "uwe-seeler",
    "displayName": "Uwe Seeler",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1936,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "valentino-rossi",
    "displayName": "Valentino Rossi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1979,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "valeriy-lobanovskyi",
    "displayName": "Valeriy Lobanovskyi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1939,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "vava",
    "displayName": "Vavá",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1934,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "venus-williams",
    "displayName": "Venus Williams",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "vicente-del-bosque",
    "displayName": "Vicente del Bosque",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1950,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "victor-hedman",
    "displayName": "Victor Hedman",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1990,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "vikingarna",
    "displayName": "Vikingarna",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1958,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "viktor-gyokeres",
    "displayName": "Viktor Gyökeres",
    "category": "athletes",
    "contentSubject": "athlete",
    "peakFrom": 2022,
    "peakTo": 2024,
    "audiences": [
      "millennials",
      "gen-z"
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
      "gen-x"
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
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "vinicius-junior",
    "displayName": "Vinícius Júnior",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 2000,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "virgil-van-dijk",
    "displayName": "Virgil van Dijk",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1991,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "vittorio-pozzo",
    "displayName": "Vittorio Pozzo",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1886,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "vivien-leigh",
    "displayName": "Vivien Leigh",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1913,
    "peakFrom": 1939,
    "peakTo": 1951,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "warren-beatty",
    "displayName": "Warren Beatty",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1937,
    "peakFrom": 1960,
    "peakTo": 1990,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "wayne-gretzky",
    "displayName": "Wayne Gretzky",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1961,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wayne-rooney",
    "displayName": "Wayne Rooney",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1985,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "gen-x"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "wesley-sneijder",
    "displayName": "Wesley Sneijder",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1984,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "all"
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
      "gen-x"
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
      "gen-x"
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
      "millennials",
      "gen-z"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "wilt-chamberlain",
    "displayName": "Wilt Chamberlain",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1936,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "wizex",
    "displayName": "Wizex",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?"
  },
  {
    "id": "wolfgang-overath",
    "displayName": "Wolfgang Overath",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1943,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "xabi-alonso",
    "displayName": "Xabi Alonso",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "xavi",
    "displayName": "Xavi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "yao-ming",
    "displayName": "Yao Ming",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1980,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "yaya-toure",
    "displayName": "Yaya Touré",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1983,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
      "all"
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
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "yoshikatsu-kawaguchi",
    "displayName": "Yoshikatsu Kawaguchi",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1975,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "zara-larsson",
    "displayName": "Zara Larsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1997,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this Artist?"
  },
  {
    "id": "zbigniew-boniek",
    "displayName": "Zbigniew Boniek",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
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
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?"
  },
  {
    "id": "zico",
    "displayName": "Zico",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1953,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "zinedine-zidane",
    "displayName": "Zinédine Zidane",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?"
  },
  {
    "id": "zlatan-ibrahimovic",
    "displayName": "Zlatan Ibrahimović",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1981,
    "audiences": [
      "millennials",
      "gen-z",
      "gen-alpha"
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
