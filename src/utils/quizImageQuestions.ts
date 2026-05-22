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
  | 'actor'
  | 'character'
  | 'athlete'
  | 'cultural-person'
  | 'celebrity'
  | 'city'
  | 'country'
  | 'building'
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
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": false
          },
          {
            "prefix": "J A",
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
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
          ]
        },
        "correctPrefix": "A S"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AR SC",
            "isCorrect": true
          },
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
            "prefix": "LA ÅB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AR SC": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
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
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
            "itemId": "arnold-schwarzenegger",
            "displayName": "Arnold Schwarzenegger",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
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
            "isCorrect": false,
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
            "prefix": "A G",
            "isCorrect": false
          },
          {
            "prefix": "C H",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "M J",
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
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A G": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C H": [
            {
              "itemId": "pool:calvin-harris",
              "displayName": "Calvin Harris",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "A": [
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
            },
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AV",
            "isCorrect": true
          },
          {
            "prefix": "AR GR",
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
            "prefix": "BI EI",
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
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "CA HÄ",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AR GR": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
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
          "BI EI": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA HÄ": [
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
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
            "itemId": "carola-haggkvist",
            "displayName": "Carola Häggkvist",
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
            "itemId": "eminem",
            "displayName": "Eminem",
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
            "itemId": "ariana-grande",
            "displayName": "Ariana Grande",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
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
            "itemId": "the-beatles",
            "displayName": "The Beatles",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "madonna",
            "displayName": "Madonna",
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
            "prefix": "B",
            "isCorrect": true
          },
          {
            "prefix": "M C",
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
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "C",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B": [
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
              "itemId": "pool:brussels",
              "displayName": "Brussels",
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
              "itemId": "pool:budapest",
              "displayName": "Budapest",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "M C": [
            {
              "itemId": "pool:mexico-city",
              "displayName": "Mexico City",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "stockholm",
              "displayName": "Stockholm",
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
          "L": [
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
            },
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "C": [
            {
              "itemId": "pool:copenhagen",
              "displayName": "Copenhagen",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:cairo",
              "displayName": "Cairo",
              "isCorrect": false,
              "source": "pool"
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
            }
          ],
          "M": [
            {
              "itemId": "pool:manila",
              "displayName": "Manila",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:mumbai",
              "displayName": "Mumbai",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:madrid",
              "displayName": "Madrid",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "moscow",
              "displayName": "Moscow",
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
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "MU",
            "isCorrect": false
          },
          {
            "prefix": "LO",
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
          "DU": [
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
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
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
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MO": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MU": [
            {
              "itemId": "pool:mumbai",
              "displayName": "Mumbai",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
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
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "dubai",
            "displayName": "Dubai",
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
          },
          {
            "itemId": "london",
            "displayName": "London",
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
            "itemId": "paris",
            "displayName": "Paris",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "moscow",
            "displayName": "Moscow",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pool:sydney",
            "displayName": "Sydney",
            "isCorrect": false,
            "source": "pool"
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
            "prefix": "B B",
            "isCorrect": true
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
            "prefix": "L M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
          ]
        },
        "correctPrefix": "B B"
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
            "prefix": "BJ BO",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
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
            "prefix": "C R",
            "isCorrect": true
          },
          {
            "prefix": "B B",
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
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
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
        "correctPrefix": "C R"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": true
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
          ]
        },
        "correctPrefix": "CR RO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
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
            "prefix": "A G",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": true
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
          "A G": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
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
          "T S": [
            {
              "itemId": "travis-scott",
              "displayName": "Travis Scott",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
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
          "A": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
          "D": [
            {
              "itemId": "pool:diplo",
              "displayName": "Diplo",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "DR",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
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
            "prefix": "CA HÄ",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": true
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
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          ],
          "DR": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
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
          "CA HÄ": [
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
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
            "itemId": "rihanna",
            "displayName": "Rihanna",
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
            "itemId": "taylor-swift",
            "displayName": "Taylor Swift",
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
            "itemId": "ariana-grande",
            "displayName": "Ariana Grande",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "drake",
            "displayName": "Drake",
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
            "itemId": "the-beatles",
            "displayName": "The Beatles",
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
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "I B",
            "isCorrect": true
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
          "L Å": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          ]
        },
        "correctPrefix": "I B"
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
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "IN BE",
            "isCorrect": true
          },
          {
            "prefix": "AR SC",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
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
          "LA ÅB": [
            {
              "itemId": "lasse-aberg",
              "displayName": "Lasse Åberg",
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
          ]
        },
        "correctPrefix": "IN BE"
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
      "millennials"
    ],
    "questionText": "What is the Name of this actor?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": true
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
            "prefix": "M M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          ]
        },
        "correctPrefix": "J A"
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
            "prefix": "LA ÅB",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": true
          },
          {
            "prefix": "IN BE",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
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
          ]
        },
        "correctPrefix": "JE AN"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "lasse-aberg",
            "displayName": "Lasse Åberg",
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
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
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
            "prefix": "A S",
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
            "prefix": "M M",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
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
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          ]
        },
        "correctPrefix": "L Å"
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
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "LA ÅB",
            "isCorrect": true
          },
          {
            "prefix": "MA MO",
            "isCorrect": false
          },
          {
            "prefix": "AR SC",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          ]
        },
        "correctPrefix": "LA ÅB"
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
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
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
            "prefix": "C R",
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
            "prefix": "L M",
            "isCorrect": true
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
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
          ]
        },
        "correctPrefix": "L M"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BJ BO",
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
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
              "isCorrect": true,
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
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
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": true
          },
          {
            "prefix": "O",
            "isCorrect": false
          },
          {
            "prefix": "B",
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
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "R",
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
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "M": [
            {
              "itemId": "pool:mumbai",
              "displayName": "Mumbai",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:madrid",
              "displayName": "Madrid",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:manila",
              "displayName": "Manila",
              "isCorrect": false,
              "source": "pool"
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
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "O": [
            {
              "itemId": "pool:oslo",
              "displayName": "Oslo",
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
              "itemId": "pool:budapest",
              "displayName": "Budapest",
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
          ]
        },
        "correctPrefix": "L"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": true
          },
          {
            "prefix": "IS",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MO": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
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
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "IS": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
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
          "DU": [
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
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
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
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
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
            "itemId": "london",
            "displayName": "London",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "dubai",
            "displayName": "Dubai",
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
            "itemId": "pool:tokyo",
            "displayName": "Tokyo",
            "isCorrect": false,
            "source": "pool"
          },
          {
            "itemId": "paris",
            "displayName": "Paris",
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
            "itemId": "berlin",
            "displayName": "Berlin",
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
            "itemId": "moscow",
            "displayName": "Moscow",
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
            "prefix": "C H",
            "isCorrect": false
          },
          {
            "prefix": "D",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "M J",
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
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "T S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "C H": [
            {
              "itemId": "pool:calvin-harris",
              "displayName": "Calvin Harris",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "D": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:diplo",
              "displayName": "Diplo",
              "isCorrect": false,
              "source": "pool"
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
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          "T S": [
            {
              "itemId": "pool:the-strokes",
              "displayName": "The Strokes",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "travis-scott",
              "displayName": "Travis Scott",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": true
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "DR",
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "TR SC",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "ME",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DR": [
            {
              "itemId": "drake",
              "displayName": "Drake",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TR SC": [
            {
              "itemId": "travis-scott",
              "displayName": "Travis Scott",
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
            "itemId": "the-beatles",
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
            "itemId": "rihanna",
            "displayName": "Rihanna",
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
            "itemId": "madonna",
            "displayName": "Madonna",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "elvis-presley",
            "displayName": "Elvis Presley",
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
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "billie-eilish",
            "displayName": "Billie Eilish",
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
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "A S",
            "isCorrect": false
          },
          {
            "prefix": "L Å",
            "isCorrect": false
          },
          {
            "prefix": "M M",
            "isCorrect": true
          },
          {
            "prefix": "I B",
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
          "A S": [
            {
              "itemId": "arnold-schwarzenegger",
              "displayName": "Arnold Schwarzenegger",
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
          "M M": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          ]
        },
        "correctPrefix": "M M"
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
            "prefix": "MA MO",
            "isCorrect": true
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
            "prefix": "JE AN",
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
          "MA MO": [
            {
              "itemId": "marilyn-monroe",
              "displayName": "Marilyn Monroe",
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
          ]
        },
        "correctPrefix": "MA MO"
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
            "itemId": "marilyn-monroe",
            "displayName": "Marilyn Monroe",
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
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "C H",
            "isCorrect": false
          },
          {
            "prefix": "A G",
            "isCorrect": false
          },
          {
            "prefix": "B E",
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
            "prefix": "M J",
            "isCorrect": true
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T S": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
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
          "A": [
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
          "C H": [
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:calvin-harris",
              "displayName": "Calvin Harris",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "A G": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
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
              "itemId": "eminem",
              "displayName": "Eminem",
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
            "prefix": "TR SC",
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          },
          {
            "prefix": "AR GR",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "CA HÄ",
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
          "TR SC": [
            {
              "itemId": "travis-scott",
              "displayName": "Travis Scott",
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
              "itemId": "the-beatles",
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
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AR GR": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CA HÄ": [
            {
              "itemId": "carola-haggkvist",
              "displayName": "Carola Häggkvist",
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
            "itemId": "billie-eilish",
            "displayName": "Billie Eilish",
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
            "itemId": "kurt-cobain",
            "displayName": "Kurt Cobain",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "drake",
            "displayName": "Drake",
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
            "itemId": "travis-scott",
            "displayName": "Travis Scott",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ariana-grande",
            "displayName": "Ariana Grande",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "T",
            "isCorrect": false
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "V",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": true
          },
          {
            "prefix": "B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "M": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:madrid",
              "displayName": "Madrid",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:mumbai",
              "displayName": "Mumbai",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:manila",
              "displayName": "Manila",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "T": [
            {
              "itemId": "pool:toronto",
              "displayName": "Toronto",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:tehran",
              "displayName": "Tehran",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:tallinn",
              "displayName": "Tallinn",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:tokyo",
              "displayName": "Tokyo",
              "isCorrect": false,
              "source": "pool"
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
            }
          ],
          "V": [
            {
              "itemId": "pool:vilnius",
              "displayName": "Vilnius",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:vienna",
              "displayName": "Vienna",
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
              "isCorrect": true,
              "source": "catalog"
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
              "itemId": "pool:budapest",
              "displayName": "Budapest",
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
              "itemId": "pool:brussels",
              "displayName": "Brussels",
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
          ]
        },
        "correctPrefix": "P"
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
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": true
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "MO",
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
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "OS",
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
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
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
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
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
          "MO": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
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
          "DU": [
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
          "OS": [
            {
              "itemId": "pool:oslo",
              "displayName": "Oslo",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "PA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "berlin",
            "displayName": "Berlin",
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
            "itemId": "moscow",
            "displayName": "Moscow",
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
            "itemId": "dubai",
            "displayName": "Dubai",
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
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
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
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "K",
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
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "H",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
              "itemId": "pool:beijing",
              "displayName": "Beijing",
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
          "K": [
            {
              "itemId": "pool:kyiv",
              "displayName": "Kyiv",
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
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": true,
              "source": "catalog"
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
              "itemId": "pool:sofia",
              "displayName": "Sofia",
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
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "pool:manila",
              "displayName": "Manila",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:madrid",
              "displayName": "Madrid",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:mumbai",
              "displayName": "Mumbai",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "H": [
            {
              "itemId": "pool:hanoi",
              "displayName": "Hanoi",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:helsinki",
              "displayName": "Helsinki",
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
          "L": [
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
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
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
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "HE",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": true
          },
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "HE": [
            {
              "itemId": "pool:helsinki",
              "displayName": "Helsinki",
              "isCorrect": false,
              "source": "pool"
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
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MO": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
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
          "DU": [
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
          "PA": [
            {
              "itemId": "paris",
              "displayName": "Paris",
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
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
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
            "itemId": "seoul",
            "displayName": "Seoul",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "moscow",
            "displayName": "Moscow",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pool:mexico-city",
            "displayName": "Mexico City",
            "isCorrect": false,
            "source": "pool"
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
            "itemId": "dubai",
            "displayName": "Dubai",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": true
          },
          {
            "prefix": "K C",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "B",
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
            "prefix": "A G",
            "isCorrect": false
          },
          {
            "prefix": "B E",
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
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
          "K C": [
            {
              "itemId": "kurt-cobain",
              "displayName": "Kurt Cobain",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
          "A G": [
            {
              "itemId": "ariana-grande",
              "displayName": "Ariana Grande",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
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
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "KU CO",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "KU CO": [
            {
              "itemId": "kurt-cobain",
              "displayName": "Kurt Cobain",
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
            "itemId": "taylor-swift",
            "displayName": "Taylor Swift",
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
            "itemId": "eminem",
            "displayName": "Eminem",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "travis-scott",
            "displayName": "Travis Scott",
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
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "ariana-grande",
            "displayName": "Ariana Grande",
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
            "itemId": "carola-haggkvist",
            "displayName": "Carola Häggkvist",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "madonna",
            "displayName": "Madonna",
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
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": true
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "B B",
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
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": true
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
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
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "bjorn-borg",
            "displayName": "Björn Borg",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
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
