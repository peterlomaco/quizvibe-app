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
    "audiences": [
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
    "id": "4-non-blondes",
    "displayName": "4 Non Blondes",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "50-cent",
    "displayName": "50 Cent",
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
    "audiences": [
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
    "audiences": [
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 74
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "alex-warren",
    "displayName": "Alex Warren",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 64
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 86
  },
  {
    "id": "alexia",
    "displayName": "Alexia",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "all-4-one",
    "displayName": "All-4-One",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "anastacia",
    "displayName": "Anastacia",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
  },
  {
    "id": "andrea-bocelli-artist",
    "displayName": "Andrea Bocelli",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "anis-don-demina",
    "displayName": "Anis Don Demina",
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
      "sweden"
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 66
  },
  {
    "id": "anne-marie-david",
    "displayName": "Anne-Marie David",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
  },
  {
    "id": "antique",
    "displayName": "Antique",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
  },
  {
    "id": "aqua",
    "displayName": "Aqua",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 89
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 90
  },
  {
    "id": "ava-max",
    "displayName": "Ava Max",
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
  },
  {
    "id": "bananarama",
    "displayName": "Bananarama",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "barbados",
    "displayName": "Barbados",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 98
  },
  {
    "id": "ben-e-king",
    "displayName": "Ben E. King",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "benny-benassi",
    "displayName": "Benny Benassi",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "bette-midler",
    "displayName": "Bette Midler",
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
    "audiences": [
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
    "id": "bill-withers",
    "displayName": "Bill Withers",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 95
  },
  {
    "id": "billy-idol",
    "displayName": "Billy Idol",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 97
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "blink-182",
    "displayName": "blink-182",
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
    "audiences": [
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
    "id": "bloodhound-gang",
    "displayName": "Bloodhound Gang",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "blur",
    "displayName": "Blur",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "bobby-mcferrin",
    "displayName": "Bobby McFerrin",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "bobbysocks",
    "displayName": "Bobbysocks!",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "bolaget",
    "displayName": "Bolaget",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2019,
    "audiences": [
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
    "id": "bon-jovi",
    "displayName": "Bon Jovi",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "boney-m",
    "displayName": "Boney M.",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "boyz-ii-men",
    "displayName": "Boyz II Men",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "brandsta",
    "displayName": "Brandsta",
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
    "id": "brotherhood-of-man",
    "displayName": "Brotherhood of Man",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "bryan-adams",
    "displayName": "Bryan Adams",
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
    "audiences": [
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
    "id": "bucks-fizz",
    "displayName": "Bucks Fizz",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 80
  },
  {
    "id": "cab-calloway",
    "displayName": "Cab Calloway",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1907,
    "audiences": [
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
    "id": "cajsa-stina-akerstrom",
    "displayName": "Cajsa Stina Åkerström",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
  },
  {
    "id": "carly-rae-jepsen",
    "displayName": "Carly Rae Jepsen",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 90
  },
  {
    "id": "charlotte-nilsson",
    "displayName": "Charlotte Nilsson",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "chic",
    "displayName": "Chic",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "chips",
    "displayName": "Chips",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "chris-brown",
    "displayName": "Chris Brown",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "clint-eastwood",
    "displayName": "Clint Eastwood",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1930,
    "peakFrom": 1964,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "cole-porter",
    "displayName": "Cole Porter",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1891,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
  },
  {
    "id": "coolio",
    "displayName": "Coolio",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "corinne-hermes",
    "displayName": "Corinne Hermès",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 97
  },
  {
    "id": "cypress-hill",
    "displayName": "Cypress Hill",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "dana",
    "displayName": "Dana",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dana-international",
    "displayName": "Dana International",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "dara",
    "displayName": "DARA",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dario-g",
    "displayName": "Dario G",
    "category": "artists",
    "contentSubject": "band",
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 96
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
    "id": "david-lee-roth",
    "displayName": "David Lee Roth",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "david-tavare",
    "displayName": "David Tavaré",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "debbie-reynolds",
    "displayName": "Debbie Reynolds",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1932,
    "peakFrom": 1950,
    "peakTo": 1964,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "deep-purple",
    "displayName": "Deep Purple",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 90
  },
  {
    "id": "destinys-child",
    "displayName": "Destiny's Child",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 96
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "dire-straits",
    "displayName": "Dire Straits",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "dj-otzi",
    "displayName": "DJ Ötzi",
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
    "audiences": [
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
    "id": "don-mclean",
    "displayName": "Don McLean",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dooley-wilson",
    "displayName": "Dooley Wilson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1886,
    "audiences": [
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
    "id": "doris-day",
    "displayName": "Doris Day",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1922,
    "audiences": [
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
    "id": "dotter",
    "displayName": "Dotter",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "dr-alban",
    "displayName": "Dr. Alban",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "drew-barrymore",
    "displayName": "Drew Barrymore",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1975,
    "peakFrom": 1996,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 80
  },
  {
    "id": "duke-ellington",
    "displayName": "Duke Ellington",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1899,
    "audiences": [
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
    "id": "duncan-laurence",
    "displayName": "Duncan Laurence",
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
      "global"
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
    "audiences": [
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "edith-piaf",
    "displayName": "Édith Piaf",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1915,
    "audiences": [
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
    "audiences": [
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
    "id": "eimear-quinn",
    "displayName": "Eimear Quinn",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "elena-tsagkrinou",
    "displayName": "Elena Tsagkrinou",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "eleni-foureira",
    "displayName": "Eleni Foureira",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "elijah-wood",
    "displayName": "Elijah Wood",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1981,
    "peakFrom": 2001,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 80
  },
  {
    "id": "ellie-goulding",
    "displayName": "Ellie Goulding",
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 83
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 73
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 94
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "emmelie-de-forest",
    "displayName": "Emmelie de Forest",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
  },
  {
    "id": "eros-ramazzotti",
    "displayName": "Eros Ramazzotti",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "ethel-waters",
    "displayName": "Ethel Waters",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1896,
    "audiences": [
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
    "id": "etta-james",
    "displayName": "Etta James",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "everything-but-the-girl",
    "displayName": "Everything but the Girl",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
  },
  {
    "id": "foreigner",
    "displayName": "Foreigner",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "id": "frans",
    "displayName": "Frans",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "fred-astaire",
    "displayName": "Fred Astaire",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1899,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "fugees",
    "displayName": "Fugees",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "gene-kelly",
    "displayName": "Gene Kelly",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1912,
    "peakFrom": 1943,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "george-benson",
    "displayName": "George Benson",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
  },
  {
    "id": "george-harrison",
    "displayName": "George Harrison",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "ges",
    "displayName": "GES",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "glass-animals",
    "displayName": "Glass Animals",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2012,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
  },
  {
    "id": "glenn-miller",
    "displayName": "Glenn Miller",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1904,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
  },
  {
    "id": "gloria-gaynor",
    "displayName": "Gloria Gaynor",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "goo-goo-dolls",
    "displayName": "Goo Goo Dolls",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "gorillaz",
    "displayName": "Gorillaz",
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
    "audiences": [
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
  },
  {
    "id": "gunther",
    "displayName": "Günther",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 92
  },
  {
    "id": "haddaway",
    "displayName": "Haddaway",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "hadise",
    "displayName": "Hadise",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
  },
  {
    "id": "hanson",
    "displayName": "Hanson",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "harrison-ford",
    "displayName": "Harrison Ford",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1942,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "hasse-andersson",
    "displayName": "Hasse Andersson",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "heath-ledger",
    "displayName": "Heath Ledger",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1979,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 60
  },
  {
    "id": "helena-paparizou",
    "displayName": "Helena Paparizou",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "henry-thomas",
    "displayName": "Henry Thomas",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1971,
    "peakFrom": 1982,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 68
  },
  {
    "id": "herreys",
    "displayName": "Herreys",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "hilary-swank",
    "displayName": "Hilary Swank",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "ian-mckellen",
    "displayName": "Ian McKellen",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1939,
    "peakFrom": 2000,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
  },
  {
    "id": "icona-pop",
    "displayName": "Icona Pop",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2009,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "imagine-dragons",
    "displayName": "Imagine Dragons",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 95
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 85
  },
  {
    "id": "inner-circle",
    "displayName": "Inner Circle",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
  },
  {
    "id": "jamala",
    "displayName": "Jamala",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "jan-hammer",
    "displayName": "Jan Hammer",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "janet-jackson",
    "displayName": "Janet Jackson",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "janne-carlsson",
    "displayName": "Janne Carlsson",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1937,
    "peakFrom": 1965,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 66
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "jason-derulo",
    "displayName": "Jason Derulo",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jason-statham",
    "displayName": "Jason Statham",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "peakFrom": 1998,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
  },
  {
    "id": "jennifer-rush",
    "displayName": "Jennifer Rush",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
  },
  {
    "id": "jesse-eisenberg",
    "displayName": "Jesse Eisenberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1983,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "jessie-j",
    "displayName": "Jessie J",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jimi-hendrix",
    "displayName": "Jimi Hendrix",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
  },
  {
    "id": "jj",
    "displayName": "JJ",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "jo-stafford",
    "displayName": "Jo Stafford",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1917,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
  },
  {
    "id": "john-candy",
    "displayName": "John Candy",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1950,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "john-denver",
    "displayName": "John Denver",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1943,
    "audiences": [
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
    "id": "john-lennon",
    "displayName": "John Lennon",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "john-newman",
    "displayName": "John Newman",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "johnnie-ray",
    "displayName": "Johnnie Ray",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "audiences": [
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
    "id": "johnny-logan",
    "displayName": "Johnny Logan",
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
      "global"
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 80
  },
  {
    "id": "joost-klein",
    "displayName": "Joost Klein",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "judy-garland",
    "displayName": "Judy Garland",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1922,
    "peakFrom": 1939,
    "peakTo": 1954,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "kaj",
    "displayName": "KAJ",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2009,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "kalush-orchestra",
    "displayName": "Kalush Orchestra",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2021,
    "audiences": [
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
    "id": "kaoma",
    "displayName": "Kaoma",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "kapten-rod",
    "displayName": "Kapten Röd",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "id": "kate-ryan",
    "displayName": "Kate Ryan",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "katy-perry",
    "displayName": "Katy Perry",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "keiino",
    "displayName": "KEiiNO",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2018,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 70
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 86
  },
  {
    "id": "kesha",
    "displayName": "Kesha",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "kim-carnes",
    "displayName": "Kim Carnes",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 72
  },
  {
    "id": "knaan",
    "displayName": "K'naan",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 74
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
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
    "audiences": [
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
  },
  {
    "id": "laura-branigan",
    "displayName": "Laura Branigan",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "laurence-fishburne",
    "displayName": "Laurence Fishburne",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1961,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "lena",
    "displayName": "Lena",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 96
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
  },
  {
    "id": "linda-hamilton",
    "displayName": "Linda Hamilton",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1956,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "linda-martin",
    "displayName": "Linda Martin",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 58
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 97
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 62
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
    "id": "lmfao",
    "displayName": "LMFAO",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2006,
    "audiences": [
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
    "id": "londonbeat",
    "displayName": "Londonbeat",
    "category": "artists",
    "contentSubject": "band",
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
      "global"
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 72
  },
  {
    "id": "lou-bega",
    "displayName": "Lou Bega",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
  },
  {
    "id": "lucianoz",
    "displayName": "Lucianoz",
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
      "sweden"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
  },
  {
    "id": "lynyrd-skynyrd",
    "displayName": "Lynyrd Skynyrd",
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
    "audiences": [
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
    "id": "macaulay-culkin",
    "displayName": "Macaulay Culkin",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1980,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 74
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "marie-myriam",
    "displayName": "Marie Myriam",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "marie-n",
    "displayName": "Marie N",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "marija-serifovic",
    "displayName": "Marija Šerifović",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
  },
  {
    "id": "mark-hamill",
    "displayName": "Mark Hamill",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1951,
    "peakFrom": 1977,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
  },
  {
    "id": "mark-morrison",
    "displayName": "Mark Morrison",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "martin-stenmarck",
    "displayName": "Martin Stenmarck",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
  },
  {
    "id": "mc-hammer",
    "displayName": "MC Hammer",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "meghan-trainor",
    "displayName": "Meghan Trainor",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "men-at-work",
    "displayName": "Men at Work",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
  },
  {
    "id": "michael-j-fox",
    "displayName": "Michael J. Fox",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1961,
    "peakFrom": 1985,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 99
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 95
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
    "audiences": [
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "modern-talking",
    "displayName": "Modern Talking",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 75
  },
  {
    "id": "mr-big",
    "displayName": "Mr. Big",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "mr-president",
    "displayName": "Mr. President",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "muddy-waters",
    "displayName": "Muddy Waters",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1913,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 98
  },
  {
    "id": "mungo-jerry",
    "displayName": "Mungo Jerry",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "nancy-sinatra",
    "displayName": "Nancy Sinatra",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "natalie-imbruglia",
    "displayName": "Natalie Imbruglia",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "neil-diamond",
    "displayName": "Neil Diamond",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "audiences": [
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
    "id": "nemo",
    "displayName": "Nemo",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "new-order",
    "displayName": "New Order",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "niamh-kavanagh",
    "displayName": "Niamh Kavanagh",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "nick-borgen",
    "displayName": "Nick Borgen",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "nickelback",
    "displayName": "Nickelback",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 85
  },
  {
    "id": "nicole",
    "displayName": "Nicole",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "nirvana",
    "displayName": "Nirvana",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "no-doubt",
    "displayName": "No Doubt",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "no-mercy",
    "displayName": "No Mercy",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "o-zone",
    "displayName": "O-Zone",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 75
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "olivia-newton-john",
    "displayName": "Olivia Newton-John",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1948,
    "peakFrom": 1971,
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
    "questionText": "What is the Name of this actor?",
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 70
  },
  {
    "id": "olsen-brothers",
    "displayName": "Olsen Brothers",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "one-direction",
    "displayName": "One Direction",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2010,
    "audiences": [
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
    "audiences": [
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
    "id": "orson-welles",
    "displayName": "Orson Welles",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1915,
    "peakFrom": 1941,
    "peakTo": 1958,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 74
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "outkast",
    "displayName": "OutKast",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "patti-page",
    "displayName": "Patti Page",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1927,
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "paula-abdul",
    "displayName": "Paula Abdul",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 98
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 84
  },
  {
    "id": "perry-como",
    "displayName": "Perry Como",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1912,
    "audiences": [
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
    "id": "pet-shop-boys",
    "displayName": "Pet Shop Boys",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
  },
  {
    "id": "peter-gabriel",
    "displayName": "Peter Gabriel",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "peter-haber",
    "displayName": "Peter Haber",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1952,
    "peakFrom": 1993,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 76
  },
  {
    "id": "peter-lundblad",
    "displayName": "Peter Lundblad",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "planet-funk",
    "displayName": "Planet Funk",
    "category": "artists",
    "contentSubject": "band",
    "audiences": [
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
    "id": "psy",
    "displayName": "PSY",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 96
  },
  {
    "id": "r-e-m",
    "displayName": "R.E.M.",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "r-i-o",
    "displayName": "R.I.O.",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 94
  },
  {
    "id": "ragnbone-man",
    "displayName": "Rag'n'Bone Man",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 72
  },
  {
    "id": "red-hot-chili-peppers",
    "displayName": "Red Hot Chili Peppers",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "richard-dreyfuss",
    "displayName": "Richard Dreyfuss",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1947,
    "peakFrom": 1975,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "ritchie-valens",
    "displayName": "Ritchie Valens",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1941,
    "audiences": [
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
    "id": "riva",
    "displayName": "Riva",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 58
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "robert-miles",
    "displayName": "Robert Miles",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 68
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 96
  },
  {
    "id": "roger-pontare",
    "displayName": "Roger Pontare",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "rolandz",
    "displayName": "Rolandz",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 96
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 90
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
    "id": "roy-scheider",
    "displayName": "Roy Scheider",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1932,
    "peakFrom": 1971,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 74
  },
  {
    "id": "ruslana",
    "displayName": "Ruslana",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "russell-crowe",
    "displayName": "Russell Crowe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1964,
    "peakFrom": 1997,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "sam-neill",
    "displayName": "Sam Neill",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1947,
    "peakFrom": 1993,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "sam-worthington",
    "displayName": "Sam Worthington",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1976,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 76
  },
  {
    "id": "sandra-kim",
    "displayName": "Sandra Kim",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
  },
  {
    "id": "sarek",
    "displayName": "Sarek",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "savage-garden",
    "displayName": "Savage Garden",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "scatman-john",
    "displayName": "Scatman John",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "scooter",
    "displayName": "Scooter",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "scorpions",
    "displayName": "Scorpions",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 70
  },
  {
    "id": "secret-garden",
    "displayName": "Secret Garden",
    "category": "artists",
    "contentSubject": "band",
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 96
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "sertab-erener",
    "displayName": "Sertab Erener",
    "category": "artists",
    "contentSubject": "artist",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "severine",
    "displayName": "Séverine",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "shakespears-sister",
    "displayName": "Shakespears Sister",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "shania-twain",
    "displayName": "Shania Twain",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "shia-labeouf",
    "displayName": "Shia LaBeouf",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1986,
    "peakFrom": 2007,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
  },
  {
    "id": "sinead-oconnor",
    "displayName": "Sinéad O'Connor",
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
    "audiences": [
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
    "audiences": [
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
    "audiences": [
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
    "id": "snoop-doggy-dogg",
    "displayName": "Snoop Doggy Dogg",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "snow",
    "displayName": "Snow",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
  },
  {
    "id": "sombr",
    "displayName": "sombr",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 2005,
    "audiences": [
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
    "id": "spin-doctors",
    "displayName": "Spin Doctors",
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
    "audiences": [
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
  },
  {
    "id": "steppenwolf",
    "displayName": "Steppenwolf",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 76
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
    "id": "streaplers",
    "displayName": "Streaplers",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "sugarhill-gang",
    "displayName": "Sugarhill Gang",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "survivor",
    "displayName": "Survivor",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
  },
  {
    "id": "sven-ingvars",
    "displayName": "Sven-Ingvars",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "sweden"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 76
  },
  {
    "id": "sylvester-stallone",
    "displayName": "Sylvester Stallone",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1946,
    "peakFrom": 1976,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 88
  },
  {
    "id": "talk-talk",
    "displayName": "Talk Talk",
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
      "global"
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
    "id": "teach-in",
    "displayName": "Teach-In",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-archies",
    "displayName": "The Archies",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 74
  },
  {
    "id": "the-b-52s",
    "displayName": "The B-52's",
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
      "global"
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
    "audiences": [
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
    "audiences": [
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
    "audiences": [
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
    "id": "the-chainsmokers",
    "displayName": "The Chainsmokers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 2012,
    "audiences": [
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
    "audiences": [
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
    "id": "the-everly-brothers",
    "displayName": "The Everly Brothers",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1957,
    "audiences": [
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
    "audiences": [
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
    "itemHcp": 80
  },
  {
    "id": "the-human-league",
    "displayName": "The Human League",
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
    "audiences": [
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
    "audiences": [
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
    "audiences": [
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
    "id": "the-rasmus",
    "displayName": "The Rasmus",
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
    "audiences": [
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
    "id": "the-verve",
    "displayName": "The Verve",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-white-stripes",
    "displayName": "The White Stripes",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "the-who",
    "displayName": "The Who",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 90
  },
  {
    "id": "thomas-di-leva",
    "displayName": "Thomas Di Leva",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "timoteij",
    "displayName": "Timoteij",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "tlc",
    "displayName": "TLC",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 95
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 85
  },
  {
    "id": "tommy-nilsson",
    "displayName": "Tommy Nilsson",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "toto",
    "displayName": "Toto",
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
    "audiences": [
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
    "id": "usa-for-africa",
    "displayName": "USA for Africa",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 97
  },
  {
    "id": "val-kilmer",
    "displayName": "Val Kilmer",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1959,
    "peakFrom": 1986,
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 78
  },
  {
    "id": "van-halen",
    "displayName": "Van Halen",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "vengaboys",
    "displayName": "Vengaboys",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 80
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 82
  },
  {
    "id": "vicky-leandros",
    "displayName": "Vicky Leandros",
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
      "global"
    ],
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 84
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "village-people",
    "displayName": "Village People",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 86
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 88
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "whitesnake",
    "displayName": "Whitesnake",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 85
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
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 78
  },
  {
    "id": "yes",
    "displayName": "Yes",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 82
  },
  {
    "id": "zayn",
    "displayName": "ZAYN",
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
    "questionText": "What is the Name of this Artist?",
    "itemHcp": 65
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 92
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
    "questionText": "What is the Name of this athlete?",
    "itemHcp": 98
  },
  {
    "id": "zoe-saldana",
    "displayName": "Zoe Saldana",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1978,
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
      "global"
    ],
    "questionText": "What is the Name of this actor?",
    "itemHcp": 82
  },
  {
    "id": "zombie-nation",
    "displayName": "Zombie Nation",
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
      "global"
    ],
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
  },
  {
    "id": "zz-top",
    "displayName": "ZZ Top",
    "category": "artists",
    "contentSubject": "band",
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
    "questionText": "What is the Name of this band?",
    "itemHcp": 65
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
