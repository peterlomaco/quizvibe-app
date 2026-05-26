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
    "contentSubject": "band",
    "correctYear": 1972,
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
            "prefix": "T W",
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
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
            "prefix": "G N R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
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
              "itemId": "adele",
              "displayName": "Adele",
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
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
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
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
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
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
            "prefix": "AB",
            "isCorrect": true
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": true,
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "P F",
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
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "E",
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
            "prefix": "C",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
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
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
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
              "itemId": "adele",
              "displayName": "Adele",
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
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
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
            "prefix": "AC",
            "isCorrect": true
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
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
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
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "AC"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "u2",
            "displayName": "U2",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
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
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "acdc",
            "displayName": "AC/DC",
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
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "L G",
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
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            "prefix": "EM",
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
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": true
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
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AD"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "abba",
            "displayName": "ABBA",
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
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "prefix": "T B",
            "isCorrect": false
          },
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
            "isCorrect": true
          },
          {
            "prefix": "L J",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": true
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ]
        },
        "correctPrefix": "AR DU"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "prefix": "K H",
            "isCorrect": false
          },
          {
            "prefix": "T C",
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
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": true
          },
          {
            "prefix": "B P",
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
            "prefix": "E S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T C": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
            "prefix": "AR SC",
            "isCorrect": true
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": true,
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
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
            "itemId": "meryl-streep",
            "displayName": "Meryl Streep",
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
            "itemId": "emma-stone",
            "displayName": "Emma Stone",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": true
          },
          {
            "prefix": "B P",
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
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
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
          "A H": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
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
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "ZE",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": true
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          ],
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          ]
        },
        "correctPrefix": "AU HE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
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
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
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
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "J T",
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
            }
          ],
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "A": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": true
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
            "itemId": "metallica",
            "displayName": "Metallica",
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
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": true
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B B": [
            {
              "itemId": "bad-bunny",
              "displayName": "Bad Bunny",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
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
          ]
        },
        "correctPrefix": "B B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "BA BU",
            "isCorrect": true
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "BA BU": [
            {
              "itemId": "bad-bunny",
              "displayName": "Bad Bunny",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
        "correctPrefix": "BA BU"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
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
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "bad-bunny",
            "displayName": "Bad Bunny",
            "isCorrect": true,
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
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": true
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
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
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
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
        "correctPrefix": "T B"
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
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": true
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
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
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "BE",
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
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
        "correctPrefix": "TH BE"
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
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "u2",
            "displayName": "U2",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": true
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
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
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
        "correctPrefix": "B B"
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
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
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
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": true
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
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
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
    "id": "black-sabbath",
    "displayName": "Black Sabbath",
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
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
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
          "A": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "B S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "ME",
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
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": true
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BL SA"
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "B D",
            "isCorrect": true
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
          "B D": [
            {
              "itemId": "bob-dylan",
              "displayName": "Bob Dylan",
              "isCorrect": true,
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
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "B D"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "BO DY",
            "isCorrect": true
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "BO DY": [
            {
              "itemId": "bob-dylan",
              "displayName": "Bob Dylan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
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
        "correctPrefix": "BO DY"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "adele",
            "displayName": "Adele",
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
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bob-dylan",
            "displayName": "Bob Dylan",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
    "id": "brad-pitt",
    "displayName": "Brad Pitt",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1963,
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
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "T C",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": true
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
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M S": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T C": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": true,
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
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
          ]
        },
        "correctPrefix": "B P"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
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
            "prefix": "KA HE",
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
            "prefix": "BR PI",
            "isCorrect": true
          },
          {
            "prefix": "CA GR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
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
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
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
          "KA HE": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "CA GR": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BR PI"
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
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
            "itemId": "katharine-hepburn",
            "displayName": "Katharine Hepburn",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": true
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "T B": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
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
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "B S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BR SP",
            "isCorrect": true
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BR SP": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BR SP"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruce-springsteen",
            "displayName": "Bruce Springsteen",
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
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "J T",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "B S",
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
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "A": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "B M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AD",
            "isCorrect": false
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
            "prefix": "LA GA",
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
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "BR MA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
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
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "C L",
            "isCorrect": true
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "C L": [
            {
              "itemId": "carl-lewis",
              "displayName": "Carl Lewis",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ]
        },
        "correctPrefix": "C L"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "CA LE",
            "isCorrect": true
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "LI ME",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
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
        "correctPrefix": "CA LE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "carl-lewis",
            "displayName": "Carl Lewis",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "cary-grant",
    "displayName": "Cary Grant",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1904,
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
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "L D",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "C G",
            "isCorrect": true
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
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "C G": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
              "isCorrect": true,
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
        "correctPrefix": "C G"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA RO",
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
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "ZE",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "CA GR",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
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
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
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
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          "CA GR": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "CA GR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
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
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": true
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
            "prefix": "R",
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
            "prefix": "L G",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
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
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "C"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": true
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": true,
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          ]
        },
        "correctPrefix": "CO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "eagles",
            "displayName": "Eagles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "prefix": "T B",
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
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "C R",
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
            "prefix": "L J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
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
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
              "isCorrect": true,
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "D B",
            "isCorrect": true
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "J T",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D B": [
            {
              "itemId": "david-bowie",
              "displayName": "David Bowie",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "D B"
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
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "DA BO",
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
            "prefix": "QU",
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
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DA BO": [
            {
              "itemId": "david-bowie",
              "displayName": "David Bowie",
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
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "DA BO"
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
            "itemId": "david-bowie",
            "displayName": "David Bowie",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "D M",
            "isCorrect": true
          },
          {
            "prefix": "S B",
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
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
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
            "prefix": "R F",
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
          "D M": [
            {
              "itemId": "diego-maradona",
              "displayName": "Diego Maradona",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "U B": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ]
        },
        "correctPrefix": "D M"
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
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "DI MA",
            "isCorrect": true
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ],
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "diego-maradona",
            "displayName": "Diego Maradona",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
            "prefix": "E",
            "isCorrect": true
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
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
            }
          ],
          "A": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
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
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "E"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": true
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "EA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
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
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "E S",
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
            "prefix": "P F",
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
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E S": [
            {
              "itemId": "ed-sheeran",
              "displayName": "Ed Sheeran",
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
          "A": [
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
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "ED SH",
            "isCorrect": true
          },
          {
            "prefix": "PI FL",
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
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
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "ED SH": [
            {
              "itemId": "ed-sheeran",
              "displayName": "Ed Sheeran",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ED SH"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "metallica",
            "displayName": "Metallica",
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "ed-sheeran",
            "displayName": "Ed Sheeran",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "beyonce",
            "displayName": "Beyoncé",
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
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "E",
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
            "prefix": "L Z",
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
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
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
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "ME",
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
            "prefix": "EA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
              "itemId": "beatles",
              "displayName": "The Beatles",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
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
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
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
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
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
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "T C",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": true
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "Z",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "T C": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "Z": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
            "prefix": "AU HE",
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
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
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
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "ZE",
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
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
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
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
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
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "F M",
            "isCorrect": true
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "T W",
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
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
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
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
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
              "itemId": "adele",
              "displayName": "Adele",
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
        },
        "correctPrefix": "F M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": true
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
            "prefix": "TH RO ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LE ZE": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": true,
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
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "FL MA"
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
            "itemId": "avicii",
            "displayName": "Avicii",
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
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "Z",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "L D",
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
            "prefix": "F P",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
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
          "Z": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": true,
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
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": true
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
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
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
            "prefix": "BR PI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
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
              "isCorrect": true,
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
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
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
            "itemId": "millie-bobby-brown",
            "displayName": "Millie Bobby Brown",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
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
            "prefix": "F S",
            "isCorrect": true
          },
          {
            "prefix": "G N R",
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
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F S": [
            {
              "itemId": "frank-sinatra",
              "displayName": "Frank Sinatra",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "F S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "FR SI",
            "isCorrect": true
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "FR SI": [
            {
              "itemId": "frank-sinatra",
              "displayName": "Frank Sinatra",
              "isCorrect": true,
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
          ],
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "FR SI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "frank-sinatra",
            "displayName": "Frank Sinatra",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": true
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B M": [
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
              "itemId": "adele",
              "displayName": "Adele",
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
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "G N R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": true
          },
          {
            "prefix": "BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": true,
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
        "correctPrefix": "GU N RO"
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
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
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
            "prefix": "I B",
            "isCorrect": true
          },
          {
            "prefix": "E S",
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
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "M M",
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
            "prefix": "M S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "I B": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
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
          "M R": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "M S": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
            "prefix": "ZE",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": true
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
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          "TO HA": [
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
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
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
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
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": true
          },
          {
            "prefix": "F P",
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
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
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
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
            "prefix": "FL PU",
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
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": true
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
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
            "prefix": "BR PI",
            "isCorrect": false
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
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
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
            "itemId": "jenna-ortega",
            "displayName": "Jenna Ortega",
            "isCorrect": true,
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
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "katharine-hepburn",
            "displayName": "Katharine Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "F P",
            "isCorrect": false
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
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": true
          },
          {
            "prefix": "K H",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
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
            "prefix": "JE AN",
            "isCorrect": true
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
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
            "prefix": "TO CR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
              "isCorrect": true,
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
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
          "TO CR": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "audrey-hepburn",
            "displayName": "Audrey Hepburn",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
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
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "prefix": "E S",
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
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "J R",
            "isCorrect": true
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": false
          },
          {
            "prefix": "K H",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
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
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
            "prefix": "TO HO",
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
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "JU RO",
            "isCorrect": true
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
              "isCorrect": true,
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
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
        "correctPrefix": "JU RO"
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
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
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J T",
            "isCorrect": true
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "F M",
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
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "A": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          ]
        },
        "correctPrefix": "J T"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME",
            "isCorrect": false
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
            "prefix": "BL SA",
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
            "prefix": "JU TI",
            "isCorrect": true
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "JU TI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "itemId": "abba",
            "displayName": "ABBA",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
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
    "id": "katharine-hepburn",
    "displayName": "Katharine Hepburn",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1907,
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
            "prefix": "K H",
            "isCorrect": true
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
            "prefix": "J A",
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
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "T H",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          ]
        },
        "correctPrefix": "K H"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "CA GR",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "KA HE",
            "isCorrect": true
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
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "AU HE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "CA GR": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "KA HE": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
          "AU HE": [
            {
              "itemId": "audrey-hepburn",
              "displayName": "Audrey Hepburn",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "KA HE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "katharine-hepburn",
            "displayName": "Katharine Hepburn",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "M",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": true
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "U",
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
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
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
          "T B": [
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
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L G"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": true
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "CO",
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
            "prefix": "EM",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
        "correctPrefix": "LA GA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "coldplay",
            "displayName": "Coldplay",
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
    "id": "larry-bird",
    "displayName": "Larry Bird",
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
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
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
            "prefix": "L B",
            "isCorrect": true
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L B": [
            {
              "itemId": "larry-bird",
              "displayName": "Larry Bird",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L B"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "LA BI",
            "isCorrect": true
          },
          {
            "prefix": "US BO",
            "isCorrect": false
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
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "LA BI": [
            {
              "itemId": "larry-bird",
              "displayName": "Larry Bird",
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
          "CR RO": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LA BI"
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "larry-bird",
            "displayName": "Larry Bird",
            "isCorrect": true,
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
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
            "prefix": "L Å",
            "isCorrect": true
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "B P",
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
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
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
            "prefix": "J R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": true,
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "J R": [
            {
              "itemId": "julia-roberts",
              "displayName": "Julia Roberts",
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
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": true
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "KA HE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
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
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "KA HE": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "itemId": "katharine-hepburn",
            "displayName": "Katharine Hepburn",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this athlete?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S B",
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
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": true
          },
          {
            "prefix": "U B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "L J"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": true
          },
          {
            "prefix": "TO BR",
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
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ]
        },
        "correctPrefix": "LE JA"
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
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "L G",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "L Z": [
            {
              "itemId": "led-zeppelin",
              "displayName": "Led Zeppelin",
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
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
          ]
        },
        "correctPrefix": "LE ZE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "queen",
            "displayName": "Queen",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
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
            "itemId": "metallica",
            "displayName": "Metallica",
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
            "prefix": "L D",
            "isCorrect": true
          },
          {
            "prefix": "J A",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "K H",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "C G",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
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
          "L D": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": true,
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "C G": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
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
        "correctPrefix": "L D"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "CA GR",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
            "isCorrect": true
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
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "CA GR": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "TO HO": [
            {
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": false,
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
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": true
          },
          {
            "prefix": "C R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "L M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LI ME",
            "isCorrect": true
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
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
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "L A",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
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
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          "L A": [
            {
              "itemId": "louis-armstrong",
              "displayName": "Louis Armstrong",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "A": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
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
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "L A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LO AR",
            "isCorrect": true
          },
          {
            "prefix": "ME",
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "EA",
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
            "prefix": "BR MA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LO AR": [
            {
              "itemId": "louis-armstrong",
              "displayName": "Louis Armstrong",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LO AR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "louis-armstrong",
            "displayName": "Louis Armstrong",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
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
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
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
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
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
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": true
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "MA": [
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
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "MA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
            "itemId": "abba",
            "displayName": "ABBA",
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
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "madonna",
            "displayName": "Madonna",
            "isCorrect": true,
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
            "prefix": "Z I",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "S B",
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
          "M J": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
            "prefix": "SI BI",
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
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "MA JO",
            "isCorrect": true
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA JO": [
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
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
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "prefix": "I B",
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
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": true
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "M B B",
            "isCorrect": false
          },
          {
            "prefix": "K H",
            "isCorrect": false
          },
          {
            "prefix": "T H",
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
        "correctPrefix": "M R"
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
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "TO CR",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": true
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO CR": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          "JE OR": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
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
          ]
        },
        "correctPrefix": "MA RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
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
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
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
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": true
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
            "prefix": "C G",
            "isCorrect": false
          },
          {
            "prefix": "F P",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "M R",
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
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          "C G": [
            {
              "itemId": "cary-grant",
              "displayName": "Cary Grant",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
        "correctPrefix": "M M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA MO",
            "isCorrect": true
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "ZE",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
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
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
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
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
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
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "S B",
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
            "prefix": "L J",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": true
          },
          {
            "prefix": "Z I",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
        "correctPrefix": "M S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
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
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
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
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "MA SP",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
              "isCorrect": true,
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
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
    "id": "martina-navratilova",
    "displayName": "Martina Navratilova",
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
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "M N",
            "isCorrect": true
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
            "prefix": "L J",
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
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
          "M N": [
            {
              "itemId": "martina-navratilova",
              "displayName": "Martina Navratilova",
              "isCorrect": true,
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M N"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TO BR",
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
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "MA NA",
            "isCorrect": true
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA NA": [
            {
              "itemId": "martina-navratilova",
              "displayName": "Martina Navratilova",
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
          ]
        },
        "correctPrefix": "MA NA"
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
            "itemId": "martina-navratilova",
            "displayName": "Martina Navratilova",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "meryl-streep",
    "displayName": "Meryl Streep",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1949,
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
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "M S",
            "isCorrect": true
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
            "prefix": "J A",
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
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M S": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": true,
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
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          ]
        },
        "correctPrefix": "M S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME ST",
            "isCorrect": true
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
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
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ME ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
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
            "itemId": "meryl-streep",
            "displayName": "Meryl Streep",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this band?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "adele",
              "displayName": "Adele",
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
        "correctPrefix": "M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME",
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
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ME"
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
            "itemId": "queen",
            "displayName": "Queen",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "coldplay",
            "displayName": "Coldplay",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "B S",
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
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "RI",
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
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
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
          "QU": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "rihanna",
            "displayName": "Rihanna",
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
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "A D",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
          "M J": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "magic-johnson",
              "displayName": "Magic Johnson",
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
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "MI JO",
            "isCorrect": true
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
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
          "MI JO": [
            {
              "itemId": "michael-jordan",
              "displayName": "Michael Jordan",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "MI JO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "michael-jordan",
            "displayName": "Michael Jordan",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "prefix": "J O",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "B P",
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
            "prefix": "M B B",
            "isCorrect": true
          },
          {
            "prefix": "K H",
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
            "prefix": "A S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "M B B": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
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
            "prefix": "TO CR",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
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
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "MI BO BR",
            "isCorrect": true
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TO CR": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "MI BO BR": [
            {
              "itemId": "millie-bobby-brown",
              "displayName": "Millie Bobby Brown",
              "isCorrect": true,
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
        "correctPrefix": "MI BO BR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
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
            "itemId": "leonardo-dicaprio",
            "displayName": "Leonardo DiCaprio",
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
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
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
            "prefix": "A D",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "M A",
            "isCorrect": true
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "MU AL",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "US BO",
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
          "MU AL": [
            {
              "itemId": "muhammad-ali",
              "displayName": "Muhammad Ali",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "N K C",
            "isCorrect": true
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "adele",
              "displayName": "Adele",
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
              "itemId": "avicii",
              "displayName": "Avicii",
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
          ],
          "N K C": [
            {
              "itemId": "nat-king-cole",
              "displayName": "Nat King Cole",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
        "correctPrefix": "N K C"
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
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "NA KI CO",
            "isCorrect": true
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
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "NA KI CO": [
            {
              "itemId": "nat-king-cole",
              "displayName": "Nat King Cole",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "NA KI CO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "nat-king-cole",
            "displayName": "Nat King Cole",
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
            "itemId": "led-zeppelin",
            "displayName": "Led Zeppelin",
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
            "itemId": "pink-floyd",
            "displayName": "Pink Floyd",
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
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "N",
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
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
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
          "A": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
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
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
            "prefix": "GU N RO",
            "isCorrect": false
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": true
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          ],
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
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
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "acdc",
            "displayName": "AC/DC",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
      }
    }
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "J T",
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
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "O R",
            "isCorrect": true
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
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "O R": [
            {
              "itemId": "olivia-rodrigo",
              "displayName": "Olivia Rodrigo",
              "isCorrect": true,
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
        "correctPrefix": "O R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "RI",
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
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "OL RO",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "OL RO": [
            {
              "itemId": "olivia-rodrigo",
              "displayName": "Olivia Rodrigo",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "OL RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "rihanna",
            "displayName": "Rihanna",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
            "itemId": "olivia-rodrigo",
            "displayName": "Olivia Rodrigo",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "prefix": "L J",
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
          },
          {
            "prefix": "T B",
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
            "prefix": "C R",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
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
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "R F",
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
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
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
          "A D": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
            "prefix": "CR RO",
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
            "prefix": "ZL IB",
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
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "PE FO",
            "isCorrect": true
          },
          {
            "prefix": "AR DU",
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE FO": [
            {
              "itemId": "peter-forsberg",
              "displayName": "Peter Forsberg",
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
          ]
        },
        "correctPrefix": "PE FO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
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
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
            "prefix": "P F",
            "isCorrect": true
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
              "isCorrect": false,
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
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": true
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "BE",
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
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
        "correctPrefix": "PI FL"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
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
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": true
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A": [
            {
              "itemId": "adele",
              "displayName": "Adele",
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
              "itemId": "acdc",
              "displayName": "AC/DC",
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
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pool:pink",
              "displayName": "Pink",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "prince",
              "displayName": "Prince",
              "isCorrect": true,
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
          "B S": [
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            "prefix": "CO",
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
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "PR",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PR": [
            {
              "itemId": "prince",
              "displayName": "Prince",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
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
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "prince",
            "displayName": "Prince",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
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
            "itemId": "abba",
            "displayName": "ABBA",
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
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": true
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
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
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "AC",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": true
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
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
          "AC": [
            {
              "itemId": "acdc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
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
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
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
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
      }
    }
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "R C",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "B",
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
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "R C": [
            {
              "itemId": "ray-charles",
              "displayName": "Ray Charles",
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
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
          ]
        },
        "correctPrefix": "R C"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "RA CH",
            "isCorrect": true
          },
          {
            "prefix": "LE ZE",
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
            "prefix": "QU",
            "isCorrect": false
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
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "RA CH": [
            {
              "itemId": "ray-charles",
              "displayName": "Ray Charles",
              "isCorrect": true,
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "RA CH"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "bruno-mars",
            "displayName": "Bruno Mars",
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
            "itemId": "black-sabbath",
            "displayName": "Black Sabbath",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ray-charles",
            "displayName": "Ray Charles",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
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
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": true
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "U B",
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
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
        "correctPrefix": "R F"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "roger-federer",
            "displayName": "Roger Federer",
            "isCorrect": true,
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "P F",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
            "isCorrect": false
          },
          {
            "prefix": "Q",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": true,
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
              "itemId": "adele",
              "displayName": "Adele",
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
          "P F": [
            {
              "itemId": "pink-floyd",
              "displayName": "Pink Floyd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          "Q": [
            {
              "itemId": "queen",
              "displayName": "Queen",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": true
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
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
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "QU",
            "isCorrect": false
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
          "TH BE": [
            {
              "itemId": "beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          ]
        },
        "correctPrefix": "TH RO ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "rolling-stones",
            "displayName": "The Rolling Stones",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
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
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": true
          },
          {
            "prefix": "S B",
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
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
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
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ],
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
        "correctPrefix": "SE WI"
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "R F",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
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
            "prefix": "S B",
            "isCorrect": true
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
          ],
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "S B"
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
            "prefix": "TO BR",
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
            "prefix": "AR DU",
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
            "prefix": "SI BI",
            "isCorrect": true
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "SI BI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
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
          },
          {
            "itemId": "usain-bolt",
            "displayName": "Usain Bolt",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "S G",
            "isCorrect": true
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          ],
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "S G"
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
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ST GR",
            "isCorrect": true
          },
          {
            "prefix": "SE WI",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
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
          "AR DU": [
            {
              "itemId": "armand-duplantis",
              "displayName": "Armand Duplantis",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "RO FE": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
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
          "SE WI": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
            "itemId": "armand-duplantis",
            "displayName": "Armand Duplantis",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steffi-graf",
            "displayName": "Steffi Graf",
            "isCorrect": true,
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
            "prefix": "T S",
            "isCorrect": true
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "B M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B S",
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
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T S": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": true,
              "source": "catalog"
            },
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
            }
          ],
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B M": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bob-marley",
              "displayName": "Bob Marley",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "adele",
              "displayName": "Adele",
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
          "B S": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
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
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": true
          },
          {
            "prefix": "AD",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "QU",
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AD": [
            {
              "itemId": "adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          ]
        },
        "correctPrefix": "TA SW"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "T R S",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "G N R",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": true
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "L Z",
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
          "T R S": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
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
          "G N R": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "E": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
              "itemId": "adele",
              "displayName": "Adele",
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
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
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
        "correctPrefix": "T W"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH WE",
            "isCorrect": true
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH WE": [
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
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
          "TH RO ST": [
            {
              "itemId": "rolling-stones",
              "displayName": "The Rolling Stones",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
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
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TH WE"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "the-weeknd",
            "displayName": "The Weeknd",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
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
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "lady-gaga",
            "displayName": "Lady Gaga",
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
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "the-who",
    "displayName": "The Who",
    "category": "artists",
    "contentSubject": "band",
    "correctYear": 1964,
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
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": true
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "L G",
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
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:marshmello",
              "displayName": "Marshmello",
              "isCorrect": false,
              "source": "pool"
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
        "correctPrefix": "T W"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH WH",
            "isCorrect": true
          },
          {
            "prefix": "QU",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "TH RO ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": true,
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
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR MA": [
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          ]
        },
        "correctPrefix": "TH WH"
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
            "itemId": "eagles",
            "displayName": "Eagles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
            "itemId": "adele",
            "displayName": "Adele",
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
            "itemId": "justin-timberlake",
            "displayName": "Justin Timberlake",
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "L J",
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
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": true
          },
          {
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          ]
        },
        "correctPrefix": "T B"
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
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
            "isCorrect": false
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
            "prefix": "SI BI",
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
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TO BR"
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": true,
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
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
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
    "id": "tom-cruise",
    "displayName": "Tom Cruise",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1962,
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
            "prefix": "T H",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "K H",
            "isCorrect": false
          },
          {
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "Z",
            "isCorrect": false
          },
          {
            "prefix": "M R",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "T C",
            "isCorrect": true
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "Z": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T C": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
              "isCorrect": true,
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
          "F P": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "T C"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "FL PU",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "KA HE",
            "isCorrect": false
          },
          {
            "prefix": "JE OR",
            "isCorrect": false
          },
          {
            "prefix": "TO CR",
            "isCorrect": true
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "IN BE": [
            {
              "itemId": "ingrid-bergman",
              "displayName": "Ingrid Bergman",
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
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "KA HE": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          "TO CR": [
            {
              "itemId": "tom-cruise",
              "displayName": "Tom Cruise",
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
          "MA RO": [
            {
              "itemId": "margot-robbie",
              "displayName": "Margot Robbie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TO CR"
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
            "itemId": "cary-grant",
            "displayName": "Cary Grant",
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
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "L D",
            "isCorrect": false
          },
          {
            "prefix": "Z",
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
            "isCorrect": false
          },
          {
            "prefix": "J R",
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
          }
        ],
        "optionsByPrefix": {
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "Z": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
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
              "itemId": "tom-holland",
              "displayName": "Tom Holland",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "tom-hanks",
              "displayName": "Tom Hanks",
              "isCorrect": true,
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
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "LE DI",
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
            "prefix": "JE AN",
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
            "prefix": "BR PI",
            "isCorrect": false
          },
          {
            "prefix": "TO HA",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
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
          ],
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
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
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "zendaya",
            "displayName": "Zendaya",
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
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "florence-pugh",
            "displayName": "Florence Pugh",
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
            "prefix": "E S",
            "isCorrect": false
          },
          {
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "K H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "M M",
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
            "prefix": "T H",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "E S": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "K H": [
            {
              "itemId": "katharine-hepburn",
              "displayName": "Katharine Hepburn",
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
          ]
        },
        "correctPrefix": "T H"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LE DI",
            "isCorrect": false
          },
          {
            "prefix": "ME ST",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
            "prefix": "MA RO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "EM ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LE DI": [
            {
              "itemId": "leonardo-dicaprio",
              "displayName": "Leonardo DiCaprio",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ME ST": [
            {
              "itemId": "meryl-streep",
              "displayName": "Meryl Streep",
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
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          "EM ST": [
            {
              "itemId": "emma-stone",
              "displayName": "Emma Stone",
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
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
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
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
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
            "itemId": "ingrid-bergman",
            "displayName": "Ingrid Bergman",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
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
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "T W",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "N",
            "isCorrect": false
          },
          {
            "prefix": "T R S",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T W": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "the-weeknd",
              "displayName": "The Weeknd",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
              "itemId": "adele",
              "displayName": "Adele",
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
            }
          ],
          "C": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
          ]
        },
        "correctPrefix": "U"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "LA GA",
            "isCorrect": false
          },
          {
            "prefix": "U",
            "isCorrect": true
          },
          {
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "PI FL",
            "isCorrect": false
          },
          {
            "prefix": "TH WH",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "BR MA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LA GA": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "U": [
            {
              "itemId": "u2",
              "displayName": "U2",
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
          ],
          "TH WH": [
            {
              "itemId": "the-who",
              "displayName": "The Who",
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
          "BR MA": [
            {
              "itemId": "pool:bruno-major",
              "displayName": "Bruno Major",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "bruno-mars",
              "displayName": "Bruno Mars",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "U"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "adele",
            "displayName": "Adele",
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
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "fleetwood-mac",
            "displayName": "Fleetwood Mac",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "coldplay",
            "displayName": "Coldplay",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "eagles",
            "displayName": "Eagles",
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
            "itemId": "u2",
            "displayName": "U2",
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
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          },
          {
            "prefix": "U B",
            "isCorrect": true
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
          "R F": [
            {
              "itemId": "roger-federer",
              "displayName": "Roger Federer",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "U B"
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
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "TO BR",
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
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": true
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
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
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
            "itemId": "serena-williams",
            "displayName": "Serena Williams",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
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
    "id": "wayne-gretzky",
    "displayName": "Wayne Gretzky",
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
            "prefix": "W G",
            "isCorrect": true
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "R F",
            "isCorrect": false
          },
          {
            "prefix": "C R",
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
            "prefix": "S W",
            "isCorrect": false
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "A D",
            "isCorrect": false
          },
          {
            "prefix": "L J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "W G": [
            {
              "itemId": "wayne-gretzky",
              "displayName": "Wayne Gretzky",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
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
          "S W": [
            {
              "itemId": "serena-williams",
              "displayName": "Serena Williams",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "W G"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LE JA",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "WA GR",
            "isCorrect": true
          },
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
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
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "RO FE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          "WA GR": [
            {
              "itemId": "wayne-gretzky",
              "displayName": "Wayne Gretzky",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "WA GR"
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
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "wayne-gretzky",
            "displayName": "Wayne Gretzky",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
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
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "F M",
            "isCorrect": false
          },
          {
            "prefix": "W H",
            "isCorrect": true
          },
          {
            "prefix": "L G",
            "isCorrect": false
          },
          {
            "prefix": "J T",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "B S",
            "isCorrect": false
          },
          {
            "prefix": "A",
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
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "F M": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "W H": [
            {
              "itemId": "whitney-houston",
              "displayName": "Whitney Houston",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "L G": [
            {
              "itemId": "lady-gaga",
              "displayName": "Lady Gaga",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "J T": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
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
            },
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B S": [
            {
              "itemId": "bruce-springsteen",
              "displayName": "Bruce Springsteen",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:britney-spears",
              "displayName": "Britney Spears",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "adele",
              "displayName": "Adele",
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
          ]
        },
        "correctPrefix": "W H"
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
            "prefix": "NI",
            "isCorrect": false
          },
          {
            "prefix": "GU N RO",
            "isCorrect": false
          },
          {
            "prefix": "BL SA",
            "isCorrect": false
          },
          {
            "prefix": "FL MA",
            "isCorrect": false
          },
          {
            "prefix": "CO",
            "isCorrect": false
          },
          {
            "prefix": "WH HO",
            "isCorrect": true
          },
          {
            "prefix": "LE ZE",
            "isCorrect": false
          },
          {
            "prefix": "EA",
            "isCorrect": false
          },
          {
            "prefix": "JU TI",
            "isCorrect": false
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
          "NI": [
            {
              "itemId": "nirvana",
              "displayName": "Nirvana",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "GU N RO": [
            {
              "itemId": "guns-n-roses",
              "displayName": "Guns N' Roses",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BL SA": [
            {
              "itemId": "black-sabbath",
              "displayName": "Black Sabbath",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "FL MA": [
            {
              "itemId": "fleetwood-mac",
              "displayName": "Fleetwood Mac",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CO": [
            {
              "itemId": "coldplay",
              "displayName": "Coldplay",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WH HO": [
            {
              "itemId": "whitney-houston",
              "displayName": "Whitney Houston",
              "isCorrect": true,
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
          "EA": [
            {
              "itemId": "eagles",
              "displayName": "Eagles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JU TI": [
            {
              "itemId": "justin-timberlake",
              "displayName": "Justin Timberlake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "WH HO"
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
            "itemId": "guns-n-roses",
            "displayName": "Guns N' Roses",
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
            "itemId": "whitney-houston",
            "displayName": "Whitney Houston",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "nirvana",
            "displayName": "Nirvana",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "the-who",
            "displayName": "The Who",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "adele",
            "displayName": "Adele",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "u2",
            "displayName": "U2",
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
          }
        ]
      }
    }
  },
  {
    "id": "zendaya",
    "displayName": "Zendaya",
    "category": "actors",
    "contentSubject": "actor",
    "correctYear": 1996,
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
            "prefix": "J O",
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
            "prefix": "B P",
            "isCorrect": false
          },
          {
            "prefix": "E S",
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
            "prefix": "A H",
            "isCorrect": false
          },
          {
            "prefix": "F P",
            "isCorrect": false
          },
          {
            "prefix": "Z",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "J O": [
            {
              "itemId": "jenna-ortega",
              "displayName": "Jenna Ortega",
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
          "B P": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          ],
          "Z": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "Z"
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
            "prefix": "EM ST",
            "isCorrect": false
          },
          {
            "prefix": "TO HO",
            "isCorrect": false
          },
          {
            "prefix": "BR PI",
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
            "prefix": "IN BE",
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
            "prefix": "ZE",
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
          "BR PI": [
            {
              "itemId": "brad-pitt",
              "displayName": "Brad Pitt",
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
          ],
          "FL PU": [
            {
              "itemId": "florence-pugh",
              "displayName": "Florence Pugh",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZE": [
            {
              "itemId": "zendaya",
              "displayName": "Zendaya",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ZE"
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
            "itemId": "zendaya",
            "displayName": "Zendaya",
            "isCorrect": true,
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
            "itemId": "margot-robbie",
            "displayName": "Margot Robbie",
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
            "itemId": "tom-holland",
            "displayName": "Tom Holland",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "tom-cruise",
            "displayName": "Tom Cruise",
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
            "itemId": "brad-pitt",
            "displayName": "Brad Pitt",
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
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": true
          },
          {
            "prefix": "S B",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
            "prefix": "L J",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S B": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "T B": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "L J": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
          ]
        },
        "correctPrefix": "Z I"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TO BR",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "US BO",
            "isCorrect": false
          },
          {
            "prefix": "SI BI",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "LE JA",
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
            "prefix": "AR DU",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "TO BR": [
            {
              "itemId": "tom-brady",
              "displayName": "Tom Brady",
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
          "US BO": [
            {
              "itemId": "usain-bolt",
              "displayName": "Usain Bolt",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SI BI": [
            {
              "itemId": "simone-biles",
              "displayName": "Simone Biles",
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
          "LE JA": [
            {
              "itemId": "lebron-james",
              "displayName": "LeBron James",
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
              "isCorrect": true,
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
            "itemId": "simone-biles",
            "displayName": "Simone Biles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "lebron-james",
            "displayName": "LeBron James",
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
            "itemId": "tom-brady",
            "displayName": "Tom Brady",
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
            "isCorrect": true,
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
