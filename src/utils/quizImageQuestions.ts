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
