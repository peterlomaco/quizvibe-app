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
  /** Item-HCP (§4.1) = katalogens probability (0–100). Klientens HCP-filter
   *  väljer item om itemHcp >= spelarens HCP (relaxas om poolen blir för tunn). */
  itemHcp: number;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = [
  {
    "id": "2-unlimited",
    "displayName": "2 Unlimited",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1991,
    "peakFrom": 1991,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "50-cent",
    "displayName": "50 Cent",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 2003,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "abba",
    "displayName": "ABBA",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1972,
    "peakFrom": 1972,
    "peakTo": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 98
  },
  {
    "id": "acdc",
    "displayName": "AC/DC",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "peakFrom": 1973,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 90
  },
  {
    "id": "ace-of-base",
    "displayName": "Ace of Base",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1992,
    "peakTo": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 94
  },
  {
    "id": "aha",
    "displayName": "a-ha",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "peakFrom": 1985,
    "peakTo": 1994,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
  },
  {
    "id": "alesso",
    "displayName": "Alesso",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
    "peakFrom": 2011,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "anastacia",
    "displayName": "Anastacia",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "andrea-bocelli-artist",
    "displayName": "Andrea Bocelli",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1976,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 74
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "aqua",
    "displayName": "Aqua",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1989,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "arctic-monkeys",
    "displayName": "Arctic Monkeys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2002,
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "ariana-grande",
    "displayName": "Ariana Grande",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
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
      "nordic"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
  },
  {
    "id": "ava-max",
    "displayName": "Ava Max",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1994,
    "peakFrom": 2018,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 97
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "backstreet-boys",
    "displayName": "Backstreet Boys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 88
  },
  {
    "id": "bananarama",
    "displayName": "Bananarama",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1979,
    "peakFrom": 1983,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "basshunter",
    "displayName": "Basshunter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "peakFrom": 2006,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "beatles",
    "displayName": "The Beatles",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1960,
    "peakFrom": 1960,
    "peakTo": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 98
  },
  {
    "id": "bee-gees",
    "displayName": "Bee Gees",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1958,
    "peakFrom": 1967,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 72
  },
  {
    "id": "ben-e-king",
    "displayName": "Ben E. King",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1938,
    "peakFrom": 1960,
    "peakTo": 1963,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bette-midler",
    "displayName": "Bette Midler",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1963,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "beyonce",
    "displayName": "Beyoncé",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "billie-eilish",
    "displayName": "Billie Eilish",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 2001,
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
  },
  {
    "id": "billy-idol",
    "displayName": "Billy Idol",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1955,
    "peakFrom": 1982,
    "peakTo": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bing-crosby",
    "displayName": "Bing Crosby",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1903,
    "peakFrom": 1940,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bjorn-skifs",
    "displayName": "Björn Skifs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1947,
    "peakFrom": 1974,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "black-sabbath",
    "displayName": "Black Sabbath",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "peakFrom": 1970,
    "peakTo": 1975,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
  },
  {
    "id": "blink-182",
    "displayName": "blink-182",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1992,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "blondie",
    "displayName": "Blondie",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1974,
    "peakFrom": 1978,
    "peakTo": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "bobby-mcferrin",
    "displayName": "Bobby McFerrin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "peakFrom": 1988,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bon-jovi",
    "displayName": "Bon Jovi",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1983,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "boney-m",
    "displayName": "Boney M.",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1975,
    "peakFrom": 1976,
    "peakTo": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "boyz-ii-men",
    "displayName": "Boyz II Men",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1988,
    "peakFrom": 1992,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "bryan-adams",
    "displayName": "Bryan Adams",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1959,
    "peakFrom": 1983,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bts",
    "displayName": "BTS",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2013,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "cab-calloway",
    "displayName": "Cab Calloway",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1907,
    "peakFrom": 1931,
    "peakTo": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "carly-rae-jepsen",
    "displayName": "Carly Rae Jepsen",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "carola-haggkvist",
    "displayName": "Carola Häggkvist",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "peakFrom": 1983,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "charlotte-nilsson",
    "displayName": "Charlotte Nilsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "chic",
    "displayName": "Chic",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1976,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "chris-brown",
    "displayName": "Chris Brown",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "coldplay",
    "displayName": "Coldplay",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1996,
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 90
  },
  {
    "id": "cole-porter",
    "displayName": "Cole Porter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1891,
    "peakFrom": 1928,
    "peakTo": 1948,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "coolio",
    "displayName": "Coolio",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1994,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 72
  },
  {
    "id": "cornelis-vreeswijk",
    "displayName": "Cornelis Vreeswijk",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1937,
    "peakFrom": 1964,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "deep-purple",
    "displayName": "Deep Purple",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "peakFrom": 1968,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "def-leppard",
    "displayName": "Def Leppard",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1983,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "destinys-child",
    "displayName": "Destiny's Child",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "dire-straits",
    "displayName": "Dire Straits",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1978,
    "peakTo": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "dj-otzi",
    "displayName": "DJ Ötzi",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dnce",
    "displayName": "DNCE",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2015,
    "peakFrom": 2015,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "doris-day",
    "displayName": "Doris Day",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1922,
    "peakFrom": 1945,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dr-alban",
    "displayName": "Dr. Alban",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1957,
    "peakFrom": 1990,
    "peakTo": 1994,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "drake",
    "displayName": "Drake",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 94
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "duke-ellington",
    "displayName": "Duke Ellington",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1899,
    "peakFrom": 1917,
    "peakTo": 1957,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dusty-springfield",
    "displayName": "Dusty Springfield",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1939,
    "peakFrom": 1963,
    "peakTo": 1969,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "e-type",
    "displayName": "E-Type",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "peakFrom": 1994,
    "peakTo": 2001,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "eagle-eye-cherry",
    "displayName": "Eagle-Eye Cherry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1968,
    "peakFrom": 1997,
    "peakTo": 2000,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "eagles",
    "displayName": "Eagles",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1971,
    "peakFrom": 1972,
    "peakTo": 1980,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 94
  },
  {
    "id": "edith-piaf",
    "displayName": "Édith Piaf",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1915,
    "peakFrom": 1933,
    "peakTo": 1973,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "eiffel-65",
    "displayName": "Eiffel 65",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1997,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "ellie-goulding",
    "displayName": "Ellie Goulding",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "peakFrom": 2010,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 98
  },
  {
    "id": "eminem",
    "displayName": "Eminem",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 94
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "eric-saade",
    "displayName": "Eric Saade",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1990,
    "peakFrom": 2010,
    "peakTo": 2015,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "etta-james",
    "displayName": "Etta James",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1938,
    "peakFrom": 1956,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "europe",
    "displayName": "Europe",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1978,
    "peakFrom": 1979,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "eurythmics",
    "displayName": "Eurythmics",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
    "peakFrom": 1983,
    "peakTo": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
  },
  {
    "id": "eva-dahlgren",
    "displayName": "Eva Dahlgren",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1960,
    "peakFrom": 1991,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "evert-taube",
    "displayName": "Evert Taube",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1890,
    "peakFrom": 1920,
    "peakTo": 1959,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "first-aid-kit",
    "displayName": "First Aid Kit",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2007,
    "peakFrom": 2012,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 84
  },
  {
    "id": "fleetwood-mac",
    "displayName": "Fleetwood Mac",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "peakFrom": 1975,
    "peakTo": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
  },
  {
    "id": "foreigner",
    "displayName": "Foreigner",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1976,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "fred-astaire",
    "displayName": "Fred Astaire",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1899,
    "peakFrom": 1917,
    "peakTo": 1957,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "fugees",
    "displayName": "Fugees",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1996,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "galantis",
    "displayName": "Galantis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2007,
    "peakFrom": 2014,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
  },
  {
    "id": "genesis",
    "displayName": "Genesis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "peakFrom": 1980,
    "peakTo": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
  },
  {
    "id": "george-benson",
    "displayName": "George Benson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1976,
    "peakTo": 1985,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "george-harrison",
    "displayName": "George Harrison",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1961,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "glass-animals",
    "displayName": "Glass Animals",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2012,
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "glenn-miller",
    "displayName": "Glenn Miller",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1904,
    "peakFrom": 1939,
    "peakTo": 1942,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "gloria-gaynor",
    "displayName": "Gloria Gaynor",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1974,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "gnarls-barkley",
    "displayName": "Gnarls Barkley",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2003,
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "goo-goo-dolls",
    "displayName": "Goo Goo Dolls",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "peakFrom": 1995,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "gorillaz",
    "displayName": "Gorillaz",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1998,
    "peakFrom": 2001,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "gotye",
    "displayName": "Gotye",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1980,
    "peakFrom": 2011,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "green-day",
    "displayName": "Green Day",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "peakFrom": 1994,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
  },
  {
    "id": "guns-n-roses",
    "displayName": "Guns N' Roses",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1985,
    "peakFrom": 1987,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "gyllene-tider",
    "displayName": "Gyllene Tider",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 92
  },
  {
    "id": "haddaway",
    "displayName": "Haddaway",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "peakFrom": 1993,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "hakan-hellstrom",
    "displayName": "Håkan Hellström",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
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
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "hasse-andersson",
    "displayName": "Hasse Andersson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1983,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "helen-sjoholm",
    "displayName": "Helen Sjöholm",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "peakFrom": 1996,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "helena-paparizou",
    "displayName": "Helena Paparizou",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "peakFrom": 2005,
    "peakTo": 2008,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "herreys",
    "displayName": "Herreys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1984,
    "peakFrom": 1983,
    "peakTo": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "icona-pop",
    "displayName": "Icona Pop",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2009,
    "peakFrom": 2012,
    "peakTo": 2014,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "imagine-dragons",
    "displayName": "Imagine Dragons",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2008,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "irene-cara",
    "displayName": "Irene Cara",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1959,
    "peakFrom": 1980,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jamala",
    "displayName": "Jamala",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "peakFrom": 2001,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "janet-jackson",
    "displayName": "Janet Jackson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jason-derulo",
    "displayName": "Jason Derulo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1989,
    "peakFrom": 2009,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "jennifer-rush",
    "displayName": "Jennifer Rush",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1960,
    "peakFrom": 1984,
    "peakTo": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jimi-hendrix",
    "displayName": "Jimi Hendrix",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1942,
    "peakFrom": 1960,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jo-stafford",
    "displayName": "Jo Stafford",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1917,
    "peakFrom": 1944,
    "peakTo": 1955,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "john-denver",
    "displayName": "John Denver",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1971,
    "peakTo": 1976,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "john-lennon",
    "displayName": "John Lennon",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1940,
    "peakFrom": 1958,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "john-lundvik",
    "displayName": "John Lundvik",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1983,
    "peakFrom": 2018,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "johnnie-ray",
    "displayName": "Johnnie Ray",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "peakFrom": 1951,
    "peakTo": 1957,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jon-secada",
    "displayName": "Jon Secada",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1961,
    "peakFrom": 1992,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "journey",
    "displayName": "Journey",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "peakFrom": 1978,
    "peakTo": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "kanye-west",
    "displayName": "Kanye West",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1977,
    "peakFrom": 2004,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "katy-perry",
    "displayName": "Katy Perry",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1984,
    "peakFrom": 2008,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "kent",
    "displayName": "Kent",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1990,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 86
  },
  {
    "id": "kesha",
    "displayName": "Kesha",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "kikki-danielsson",
    "displayName": "Kikki Danielsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "peakFrom": 1982,
    "peakTo": 1988,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "kim-carnes",
    "displayName": "Kim Carnes",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1945,
    "peakFrom": 1980,
    "peakTo": 1985,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "kiss",
    "displayName": "Kiss",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1973,
    "peakFrom": 1975,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "la-bouche",
    "displayName": "La Bouche",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 1994,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "laleh",
    "displayName": "Laleh",
    "category": "artists",
    "contentSubject": "artist",
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
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "lars-winnerback",
    "displayName": "Lars Winnerbäck",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "laura-branigan",
    "displayName": "Laura Branigan",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "peakFrom": 1982,
    "peakTo": 1987,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "led-zeppelin",
    "displayName": "Led Zeppelin",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1968,
    "peakFrom": 1969,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "lill-babs",
    "displayName": "Lill-Babs",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1938,
    "peakFrom": 1959,
    "peakTo": 1970,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "lisa-nilsson",
    "displayName": "Lisa Nilsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1970,
    "peakFrom": 1992,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "londonbeat",
    "displayName": "Londonbeat",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1988,
    "peakFrom": 1990,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
      "europe"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "los-del-rio",
    "displayName": "Los del Río",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1962,
    "peakFrom": 1995,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "lou-bega",
    "displayName": "Lou Bega",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 1999,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "lykke-li",
    "displayName": "Lykke Li",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
    "peakFrom": 2008,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "lynyrd-skynyrd",
    "displayName": "Lynyrd Skynyrd",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1964,
    "peakFrom": 1973,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "mabel",
    "displayName": "Mabel",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1996,
    "peakFrom": 2017,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 96
  },
  {
    "id": "magnus-uggla",
    "displayName": "Magnus Uggla",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1954,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 74
  },
  {
    "id": "mando-diao",
    "displayName": "Mando Diao",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1999,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
  },
  {
    "id": "mans-zelmerlow",
    "displayName": "Måns Zelmerlöw",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1986,
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
      "europe"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
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
      "nordic"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "marie-fredriksson",
    "displayName": "Marie Fredriksson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1988,
    "peakTo": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "maroon-5",
    "displayName": "Maroon 5",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 2004,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 74
  },
  {
    "id": "mc-hammer",
    "displayName": "MC Hammer",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1962,
    "peakFrom": 1990,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "meghan-trainor",
    "displayName": "Meghan Trainor",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1993,
    "peakFrom": 2014,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "metallica",
    "displayName": "Metallica",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 98
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "milli-vanilli",
    "displayName": "Milli Vanilli",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1988,
    "peakFrom": 1988,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "miriam-bryant",
    "displayName": "Miriam Bryant",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1991,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "miss-li",
    "displayName": "Miss Li",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1982,
    "peakFrom": 2007,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 76
  },
  {
    "id": "modern-talking",
    "displayName": "Modern Talking",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1983,
    "peakFrom": 1984,
    "peakTo": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "monica-zetterlund",
    "displayName": "Monica Zetterlund",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1937,
    "peakFrom": 1964,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "mr-big",
    "displayName": "Mr. Big",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1988,
    "peakFrom": 1991,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "natalie-imbruglia",
    "displayName": "Natalie Imbruglia",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "neil-diamond",
    "displayName": "Neil Diamond",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "peakFrom": 1969,
    "peakTo": 1982,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "new-order",
    "displayName": "New Order",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
    "peakFrom": 1983,
    "peakTo": 1993,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "nickelback",
    "displayName": "Nickelback",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1995,
    "peakFrom": 2001,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "nicole",
    "displayName": "Nicole",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1964,
    "peakFrom": 1982,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "nirvana",
    "displayName": "Nirvana",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1987,
    "peakFrom": 1987,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "no-doubt",
    "displayName": "No Doubt",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "peakFrom": 1995,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "no-mercy",
    "displayName": "No Mercy",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1996,
    "peakFrom": 1996,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "oasis",
    "displayName": "Oasis",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1991,
    "peakFrom": 1994,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "olle-adolphson",
    "displayName": "Olle Adolphson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1934,
    "peakFrom": 1952,
    "peakTo": 1992,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "one-direction",
    "displayName": "One Direction",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2010,
    "peakFrom": 2011,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "onerepublic",
    "displayName": "OneRepublic",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2009,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "outkast",
    "displayName": "OutKast",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1992,
    "peakFrom": 1998,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "patti-page",
    "displayName": "Patti Page",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "peakFrom": 1950,
    "peakTo": 1957,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "paula-abdul",
    "displayName": "Paula Abdul",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1962,
    "peakFrom": 1988,
    "peakTo": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "per-gessle",
    "displayName": "Per Gessle",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1959,
    "peakFrom": 1988,
    "peakTo": 2002,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "perry-como",
    "displayName": "Perry Como",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1912,
    "peakFrom": 1954,
    "peakTo": 1970,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "pet-shop-boys",
    "displayName": "Pet Shop Boys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "peakFrom": 1985,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "peter-cetera",
    "displayName": "Peter Cetera",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1944,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "peter-gabriel",
    "displayName": "Peter Gabriel",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1950,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "petter",
    "displayName": "Petter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1974,
    "peakFrom": 1997,
    "peakTo": 2008,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "pink-floyd",
    "displayName": "Pink Floyd",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1965,
    "peakFrom": 1973,
    "peakTo": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "queen",
    "displayName": "Queen",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1970,
    "peakFrom": 1970,
    "peakTo": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 96
  },
  {
    "id": "r-e-m",
    "displayName": "R.E.M.",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1980,
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "radiohead",
    "displayName": "Radiohead",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1985,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "ragnbone-man",
    "displayName": "Rag'n'Bone Man",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1985,
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "red-hot-chili-peppers",
    "displayName": "Red Hot Chili Peppers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "peakFrom": 1991,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "rednex",
    "displayName": "Rednex",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 1994,
    "peakTo": 2000,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "rihanna",
    "displayName": "Rihanna",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1988,
    "peakFrom": 2007,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
  },
  {
    "id": "ritchie-valens",
    "displayName": "Ritchie Valens",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "peakFrom": 1959,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "robert-miles",
    "displayName": "Robert Miles",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1969,
    "peakFrom": 1995,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "roberta-flack",
    "displayName": "Roberta Flack",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1937,
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "roxette",
    "displayName": "Roxette",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1986,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "scorpions",
    "displayName": "Scorpions",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1965,
    "peakFrom": 1984,
    "peakTo": 1991,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 70
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "sertab-erener",
    "displayName": "Sertab Erener",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1964,
    "peakFrom": 1982,
    "peakTo": 2022,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "shania-twain",
    "displayName": "Shania Twain",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1965,
    "peakFrom": 1995,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
  },
  {
    "id": "sinead-oconnor",
    "displayName": "Sinéad O'Connor",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1966,
    "peakFrom": 1987,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "sir-mix-a-lot",
    "displayName": "Sir Mix-a-Lot",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1988,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "smash-mouth",
    "displayName": "Smash Mouth",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "snap",
    "displayName": "Snap!",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1989,
    "peakFrom": 1990,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
      "unknown-region"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "snoop-doggy-dogg",
    "displayName": "Snoop Doggy Dogg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1971,
    "peakFrom": 1989,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "spice-girls",
    "displayName": "Spice Girls",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 1996,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 92
  },
  {
    "id": "spin-doctors",
    "displayName": "Spin Doctors",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1991,
    "peakTo": 1994,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "starship",
    "displayName": "Starship",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1985,
    "peakFrom": 1985,
    "peakTo": 1989,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "steppenwolf",
    "displayName": "Steppenwolf",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1967,
    "peakFrom": 1968,
    "peakTo": 1971,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "survivor",
    "displayName": "Survivor",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1978,
    "peakFrom": 1982,
    "peakTo": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "swedish-house-mafia",
    "displayName": "Swedish House Mafia",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2008,
    "peakFrom": 2010,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 86
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "talk-talk",
    "displayName": "Talk Talk",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1981,
    "peakFrom": 1982,
    "peakTo": 1988,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
  },
  {
    "id": "ted-gardestad",
    "displayName": "Ted Gärdestad",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1956,
    "peakFrom": 1972,
    "peakTo": 1979,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 86
  },
  {
    "id": "the-ark",
    "displayName": "The Ark",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2000,
    "peakFrom": 1991,
    "peakTo": 2010,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 74
  },
  {
    "id": "the-b-52s",
    "displayName": "The B-52's",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1976,
    "peakFrom": 1978,
    "peakTo": 1990,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-beach-boys",
    "displayName": "The Beach Boys",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1961,
    "peakFrom": 1961,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-black-eyed-peas",
    "displayName": "The Black Eyed Peas",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1995,
    "peakFrom": 2003,
    "peakTo": 2010,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-cardigans",
    "displayName": "The Cardigans",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1992,
    "peakFrom": 1996,
    "peakTo": 2003,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-chainsmokers",
    "displayName": "The Chainsmokers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2012,
    "peakFrom": 2015,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-cranberries",
    "displayName": "The Cranberries",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1989,
    "peakFrom": 1993,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-doors",
    "displayName": "The Doors",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1965,
    "peakFrom": 1967,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
  },
  {
    "id": "the-everly-brothers",
    "displayName": "The Everly Brothers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1957,
    "peakFrom": 1957,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-hives",
    "displayName": "The Hives",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1993,
    "peakFrom": 1996,
    "peakTo": 2026,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 80
  },
  {
    "id": "the-human-league",
    "displayName": "The Human League",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1981,
    "peakTo": 1986,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-killers",
    "displayName": "The Killers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2001,
    "peakFrom": 2004,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-mamas",
    "displayName": "The Mamas",
    "category": "artists",
    "contentSubject": "band",
    "peakFrom": 2020,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-offspring",
    "displayName": "The Offspring",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1984,
    "peakFrom": 1994,
    "peakTo": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-police",
    "displayName": "The Police",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1978,
    "peakTo": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 85
  },
  {
    "id": "the-rasmus",
    "displayName": "The Rasmus",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1994,
    "peakFrom": 2003,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-rolling-stones",
    "displayName": "The Rolling Stones",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1962,
    "peakFrom": 1965,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-smiths",
    "displayName": "The Smiths",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1982,
    "peakFrom": 1983,
    "peakTo": 1987,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
  },
  {
    "id": "the-verve",
    "displayName": "The Verve",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1990,
    "peakFrom": 1997,
    "peakTo": 1998,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 90
  },
  {
    "id": "the-white-stripes",
    "displayName": "The White Stripes",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1997,
    "peakFrom": 2001,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-who",
    "displayName": "The Who",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1964,
    "peakFrom": 1965,
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "thomas-di-leva",
    "displayName": "Thomas Di Leva",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1963,
    "peakFrom": 1988,
    "peakTo": 1996,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "timbuktu",
    "displayName": "Timbuktu",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1975,
    "peakFrom": 2003,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
  },
  {
    "id": "tlc",
    "displayName": "TLC",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1991,
    "peakFrom": 1994,
    "peakTo": 1999,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "tomas-ledin",
    "displayName": "Tomas Ledin",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1952,
    "peakFrom": 1980,
    "peakTo": 1995,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "tommy-korberg",
    "displayName": "Tommy Körberg",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1948,
    "peakFrom": 1969,
    "peakTo": 1990,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "toto",
    "displayName": "Toto",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1977,
    "peakFrom": 1978,
    "peakTo": 1983,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "toto-cutugno",
    "displayName": "Toto Cutugno",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "peakFrom": 1961,
    "peakTo": 2001,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "tove-lo",
    "displayName": "Tove Lo",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1987,
    "peakFrom": 2014,
    "peakTo": 2026,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "ulf-lundell",
    "displayName": "Ulf Lundell",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1976,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 78
  },
  {
    "id": "veronica-maggio",
    "displayName": "Veronica Maggio",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1981,
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
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
  },
  {
    "id": "vicky-leandros",
    "displayName": "Vicky Leandros",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1949,
    "peakFrom": 1967,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
  },
  {
    "id": "zara-larsson",
    "displayName": "Zara Larsson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1997,
    "peakFrom": 2015,
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
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
