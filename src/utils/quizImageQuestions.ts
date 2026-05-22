// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Pre-baked image-frågor för quiz-flow. Tre varianter per item:
//   prefix-1   → Minimal assistance (1-bokstavs prefix-läge)
//   prefix-2   → Standard assistance (2-bokstavs prefix-läge)
//   full-names → Full assistance (ingen prefix; visa hela namnet direkt)
// Klienten väljer variant runtime via pickImageQuestionVariant(question, assistance).

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
  /** ~10 namn med exakt en isCorrect=true; ordning slumpad vid export. */
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

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: 'persons' | 'capitals' | 'artists' | 'songs' | 'actors' | 'athletes';
  contentSubject: ImageContentSubject;
  /** Året som "rätt svar" — driver fallback-era-filtrering när peak
   *  saknas. För artister = födelseår; band = formation-år; musik-spår =
   *  utgivningsår. **Optional** — items utan både correctYear OCH peak
   *  (t.ex. capitals/städer) är era-agnostiska och inkluderas i alla eras. */
  correctYear?: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När
   *  båda definierade använder era-filtret interval-overlap mot host:s
   *  era-spann. Saknas → correctYear-fallback (eller era-agnostiskt om
   *  båda saknas). */
  peakFrom?: number;
  peakTo?: number;
  audiences: ImageQuestionAudience[];
  questionText: string;
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = [
  {
    "id": "abba",
    "displayName": "ABBA",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1972,
    "audiences": [
      "elder",
      "all"
    ],
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": true
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AB"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": true
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AC"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "M A",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": true
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M A": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A D"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "MI JO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AR DU"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "michael-jordan",
            "displayName": "Michael Jordan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "muhammad-ali",
            "displayName": "Muhammad Ali",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "arnold-schwarzenegger",
    "displayName": "Arnold Schwarzenegger",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1947,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A S",
            "isCorrect": true
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": true
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AR SC"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "audrey-hepburn",
    "displayName": "Audrey Hepburn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1929,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": true
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A H"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AU HE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": true
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AV"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": true
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TH BE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "berlin",
    "displayName": "Berlin",
    "category": "capitals",
    "contentSubject": "city",
    "audiences": [
      "all"
    ],
    "questionText": "Which city is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "I": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "R": [
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BE",
            "isCorrect": true
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BE": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": true
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "B B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MI JO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BJ BO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "C L",
            "isCorrect": true
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C L": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "C L"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "CA LE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "carl-lewis",
            "displayName": "Carl Lewis",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": true
          },
          {
            "prefix": "D M",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "C R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "MU AL",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MU AL": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "CR RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "denmark",
    "displayName": "Denmark",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": true
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "D"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": true
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "DE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "M A",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M A": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "D M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "MA JO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "DI MA",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA JO": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DI MA": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "DI MA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "diego-maradona",
            "displayName": "Diego Maradona",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": true
          },
          {
            "prefix": "E",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "E P"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": true
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "EL PR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "elvis-presley",
            "displayName": "Elvis Presley",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "emma-stone",
    "displayName": "Emma Stone",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1988,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": true
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "E S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": true
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "EM ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "florence-pugh",
    "displayName": "Florence Pugh",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": true
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "F P"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": true
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "FL PU"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "france",
    "displayName": "France",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": true
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "D": [
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "P": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "S": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "F"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "FR",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "JA",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JA": [
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "FR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "germany",
    "displayName": "Germany",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": true
          },
          {
            "prefix": "J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "R": [
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "J": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "G"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "JA",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": true
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "JA": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "GE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "ingrid-bergman",
    "displayName": "Ingrid Bergman",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1915,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": true
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "I B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "IN BE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "italy",
    "displayName": "Italy",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": true
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "S": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "I"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": true
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "IT"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "japan",
    "displayName": "Japan",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J",
            "isCorrect": true
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "J": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "J"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "JA",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JA": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "JA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "jenna-ortega",
    "displayName": "Jenna Ortega",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2002,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": true
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "J O"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": true
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "JE OR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "jennifer-aniston",
    "displayName": "Jennifer Aniston",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1969,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": true
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "J A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": true
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "JE AN"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "julia-roberts",
    "displayName": "Julia Roberts",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1967,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": true
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "J R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": true
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "JU RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "lasse-aberg",
    "displayName": "Lasse Åberg",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1940,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": true
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L Å"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": true
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LA ÅB"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": true
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L Z"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": true
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LE ZE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "leonardo-dicaprio",
    "displayName": "Leonardo DiCaprio",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1974,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L D"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LE DI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": true
          },
          {
            "prefix": "S G",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S G": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MI JO",
            "isCorrect": false
          },
          {
            "prefix": "MA JO",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": true
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA JO": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LI ME"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "muhammad-ali",
            "displayName": "Muhammad Ali",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "london",
    "displayName": "London",
    "category": "capitals",
    "contentSubject": "city",
    "audiences": [
      "all"
    ],
    "questionText": "Which city is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L",
            "isCorrect": true
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "J",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L": [
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": true
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "madonna",
            "displayName": "Madonna",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M J"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA JO",
            "isCorrect": true
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "MU AL",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MA JO": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MU AL": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA JO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "margot-robbie",
    "displayName": "Margot Robbie",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1990,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": true
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": true
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "marilyn-monroe",
    "displayName": "Marilyn Monroe",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1926,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": true
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": true
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA MO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "mark-spitz",
    "displayName": "Mark Spitz",
    "category": "athletes",
    "contentSubject": "athlete",
    "correctYear": 1950,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": true
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA SP"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "diego-maradona",
            "displayName": "Diego Maradona",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M J"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MI JA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M J"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "MI JO",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MI JO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "michael-jordan",
            "displayName": "Michael Jordan",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "muhammad-ali",
            "displayName": "Muhammad Ali",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "millie-bobby-brown",
    "displayName": "Millie Bobby Brown",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 2004,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": true
          },
          {
            "prefix": "L D",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M B B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": true
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MI BO BR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S G",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "M A",
            "isCorrect": true
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S G": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M A": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "MI JO",
            "isCorrect": false
          },
          {
            "prefix": "MU AL",
            "isCorrect": true
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MU AL": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MU AL"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "muhammad-ali",
            "displayName": "Muhammad Ali",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "nirvana",
    "displayName": "Nirvana",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1987,
    "audiences": [
      "all"
    ],
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": true
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "N"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "NI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "norway",
    "displayName": "Norway",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "I": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "D": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "N"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "NO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "paris",
    "displayName": "Paris",
    "category": "capitals",
    "contentSubject": "city",
    "audiences": [
      "all"
    ],
    "questionText": "Which city is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "P",
            "isCorrect": true
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "P"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": true
          },
          {
            "prefix": "JA",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "JA": [
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": true
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "M A",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "C L",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M A": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C L": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "P"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": true
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "diego-maradona",
            "displayName": "Diego Maradona",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "S G",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": true
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S G": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "P F"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PE FO",
            "isCorrect": true
          },
          {
            "prefix": "ST GR",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PE FO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "P F"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": true
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PI FL"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": true
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "Q"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "QU"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": true
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "R F"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "RO FE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "carl-lewis",
            "displayName": "Carl Lewis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": true
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T R S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH RO ST",
            "isCorrect": true
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TH RO ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": true
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "S W"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": true
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          },
          {
            "prefix": "MI JO",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "SE WI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "michael-jordan",
            "displayName": "Michael Jordan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": false
          },
          {
            "prefix": "S G",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S G": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "S G"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": true
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "MU AL",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MU AL": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ST GR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "peter-forsberg",
            "displayName": "Peter Forsberg",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "stockholm",
    "displayName": "Stockholm",
    "category": "capitals",
    "contentSubject": "city",
    "audiences": [
      "all"
    ],
    "questionText": "Which city is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": true
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "J",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "R": [
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "J": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "IT",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IT": [
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "sweden",
    "displayName": "Sweden",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": false
          },
          {
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": true
          },
          {
            "prefix": "J",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "italy",
              "displayName": "Italy",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:brussels",
              "displayName": "Brussels",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bangkok",
              "displayName": "Bangkok",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "S": [
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J": [
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "D": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": true
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "JA",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BE": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JA": [
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "SW"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "norway",
            "displayName": "Norway",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "france",
            "displayName": "France",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": true
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B": [
            {
              "itemId": "pool:bts",
              "displayName": "BTS",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "N": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T S": [
            {
              "itemId": "travis-scott",
              "displayName": "Travis Scott",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:the-strokes",
              "displayName": "The Strokes",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": true
          },
          {
            "prefix": "EM",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PI FL": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TA SW"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "taylor-swift",
            "displayName": "Taylor Swift",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "tom-hanks",
    "displayName": "Tom Hanks",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1956,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": true
          },
          {
            "prefix": "M R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T H"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU RO": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TO HA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "tom-holland",
    "displayName": "Tom Holland",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
    "audiences": [
      "millennials",
      "gen-z"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": true
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T H": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T H"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AU HE",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": true
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TO HO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-hanks",
            "displayName": "Tom Hanks",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "julia-roberts",
            "displayName": "Julia Roberts",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "united-states",
    "displayName": "United States",
    "category": "capitals",
    "contentSubject": "country",
    "audiences": [
      "all"
    ],
    "questionText": "Which country is this?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "F",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "U S",
            "isCorrect": true
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "G",
            "isCorrect": false
          },
          {
            "prefix": "J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S": [
            {
              "itemId": "pool:singapore",
              "displayName": "Singapore",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "N": [
            {
              "itemId": "pool:nairobi",
              "displayName": "Nairobi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U S": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "pool:dublin",
              "displayName": "Dublin",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "dubai",
              "displayName": "Dubai",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R": [
            {
              "itemId": "pool:reykjavik",
              "displayName": "Reykjavik",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:riyadh",
              "displayName": "Riyadh",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "U S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "SW",
            "isCorrect": false
          },
          {
            "prefix": "JA",
            "isCorrect": false
          },
          {
            "prefix": "GE",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "NO",
            "isCorrect": false
          },
          {
            "prefix": "DE",
            "isCorrect": false
          },
          {
            "prefix": "FR",
            "isCorrect": false
          },
          {
            "prefix": "UN ST",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SW": [
            {
              "itemId": "sweden",
              "displayName": "Sweden",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JA": [
            {
              "itemId": "japan",
              "displayName": "Japan",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "GE": [
            {
              "itemId": "germany",
              "displayName": "Germany",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BE": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "NO": [
            {
              "itemId": "norway",
              "displayName": "Norway",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DE": [
            {
              "itemId": "denmark",
              "displayName": "Denmark",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FR": [
            {
              "itemId": "france",
              "displayName": "France",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "UN ST": [
            {
              "itemId": "united-states",
              "displayName": "United States",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "UN ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "denmark",
            "displayName": "Denmark",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "italy",
            "displayName": "Italy",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "japan",
            "displayName": "Japan",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "germany",
            "displayName": "Germany",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "sweden",
            "displayName": "Sweden",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "united-states",
            "displayName": "United States",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": true
          },
          {
            "prefix": "C L",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pele",
              "displayName": "Pelé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "C L": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "U B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": true
          },
          {
            "prefix": "MI JO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA LE": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "US BO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "magic-johnson",
            "displayName": "Magic Johnson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": false
          },
          {
            "prefix": "C L",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P F": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C L": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "Z I"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA SP",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MA SP": [
            {
              "itemId": "mark-spitz",
              "displayName": "Mark Spitz",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST GR": [
            {
              "itemId": "steffi-graf",
              "displayName": "Steffi Graf",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ZL IB"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "mark-spitz",
            "displayName": "Mark Spitz",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "diego-maradona",
            "displayName": "Diego Maradona",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pele",
            "displayName": "Pelé",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  }
];

/** Mappa spelarens assistance till rätt pre-baked variant.
 *  Full → full-names (mest hjälp = se hela namnet, ingen prefix-pussel).
 *  Standard → prefix-2 (2-bokstavs prefix-läge).
 *  Minimal → prefix-1 (1-bokstavs prefix-läge).
 *
 *  Tar bara `question.variants` (Record) som arg så call-sites kan passera
 *  egna domän-typer (quiz.tsx:s lokala `ImageQuestion`-shape) utan att
 *  strukturellt matcha hela ImageQuizQuestion.
 */
export function pickImageQuestionVariant(
  variants: Record<ImageVariantKey, ImageQuestionVariant>,
  assistance: 'minimal' | 'standard' | 'full',
): ImageQuestionVariant {
  const key: ImageVariantKey =
    assistance === 'full'
      ? 'full-names'
      : assistance === 'minimal'
        ? 'prefix-1'
        : 'prefix-2';
  return variants[key];
}

/** Filtrera frågor som passar en specifik spelar-generation. */
export function getImageQuestionsForGeneration(
  generation: ImageQuestionAudience,
): ImageQuizQuestion[] {
  return IMAGE_QUIZ_QUESTIONS.filter(
    (q) => q.audiences.includes(generation) || q.audiences.includes('all'),
  );
}
