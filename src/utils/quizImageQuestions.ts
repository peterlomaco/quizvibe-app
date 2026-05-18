// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Pre-baked image-frågor för quiz-flow. Varje item har tre varianter pre-bakade
// för olika assistance-nivåer: prefix-1 (minimal) / prefix-2 (standard) /
// prefix-3 (full). Klienten väljer variant runtime via
// pickImageQuestionVariant(question, assistance).

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

export interface ImageQuestionVariant {
  prefixLength: number;
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  correctPrefix: string;
}

export type ImageVariantKey = 'prefix-1' | 'prefix-2' | 'prefix-3';

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: 'persons' | 'capitals' | 'artists' | 'songs';
  /** Året som "rätt svar" — driver fallback-era-filtrering när peak
   *  saknas och visas i timeline-frågors reveal. För artister = födelseår;
   *  band = formation-år; musik-spår = utgivningsår. */
  correctYear: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När
   *  båda definierade använder era-filtret interval-overlap mot host:s
   *  era-spann. Saknas → correctYear-fallback. */
  peakFrom?: number;
  peakTo?: number;
  audiences: ImageQuestionAudience[];
  questionText: string;
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = [
  {
    "id": "avicii",
    "displayName": "Avicii",
    "category": "artists",
    "correctYear": 1989,
    "peakFrom": 2011,
    "peakTo": 2018,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
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
            "isCorrect": true
          },
          {
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
            "prefix": "T S",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
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
            }
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": true
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
          },
          {
            "prefix": "MA",
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "MA": [
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
          ]
        },
        "correctPrefix": "AV"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "TAY SWI",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": true
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "THE BEA",
            "isCorrect": false
          },
          {
            "prefix": "ELV PRE",
            "isCorrect": false
          },
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "ABB",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TAY SWI": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "THE BEA": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ELV PRE": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MET": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ABB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AVI"
      }
    }
  },
  {
    "id": "elvis-presley",
    "displayName": "Elvis Presley",
    "category": "artists",
    "correctYear": 1935,
    "peakFrom": 1956,
    "peakTo": 1977,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M",
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
            "prefix": "E P",
            "isCorrect": true
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
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "T B": [
            {
              "itemId": "the-beatles",
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": true,
              "source": "catalog"
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
          "T S": [
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
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "E P"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "DR",
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "DR": [
            {
              "itemId": "drake",
              "displayName": "Drake",
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
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
          "BI EI": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "EL PR"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "ELV PRE",
            "isCorrect": true
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          },
          {
            "prefix": "TAY SWI",
            "isCorrect": false
          },
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "DRA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ELV PRE": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAD": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TAY SWI": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MET": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DRA": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ELV PRE"
      }
    }
  },
  {
    "id": "madonna",
    "displayName": "Madonna",
    "category": "artists",
    "correctYear": 1958,
    "peakFrom": 1984,
    "peakTo": 2007,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B E",
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
            "isCorrect": true
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
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
          "E": [
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "M"
      },
      "prefix-2": {
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
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "DR",
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
          ],
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          "DR": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MA"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "ABB",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "TAY SWI",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": true
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          },
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "THE BEA",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ABB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TAY SWI": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAD": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MET": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "THE BEA": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MAD"
      }
    }
  },
  {
    "id": "michael-jackson",
    "displayName": "Michael Jackson",
    "category": "artists",
    "correctYear": 1958,
    "peakFrom": 1979,
    "peakTo": 2009,
    "audiences": [
      "gen-x"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "E P",
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
            "prefix": "D",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "E",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "A": [
            {
              "itemId": "pool:aerosmith",
              "displayName": "Aerosmith",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
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
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ME",
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
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          },
          {
            "prefix": "EL PR",
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
          "BI EI": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "MA": [
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
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
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
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          ]
        },
        "correctPrefix": "MI JA"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "DRA",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": true
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "THE BEA",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "ELV PRE",
            "isCorrect": false
          },
          {
            "prefix": "TAY SWI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "DRA": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MAD": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "THE BEA": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ELV PRE": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TAY SWI": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MIC JAC"
      }
    }
  },
  {
    "id": "taylor-swift",
    "displayName": "Taylor Swift",
    "category": "artists",
    "correctYear": 1989,
    "peakFrom": 2008,
    "peakTo": 2026,
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "E P",
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
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": true
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
          }
        ],
        "optionsByPrefix": {
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
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
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          "T B": [
            {
              "itemId": "the-beatles",
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
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:ac-dc",
              "displayName": "AC/DC",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "T S"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA",
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
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": true
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
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "TH BE": [
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
          ],
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          ]
        },
        "correctPrefix": "TA SW"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "DRA",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "TAY SWI",
            "isCorrect": true
          },
          {
            "prefix": "ELV PRE",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MET": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DRA": [
            {
              "itemId": "drake",
              "displayName": "Drake",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "TAY SWI": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ELV PRE": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAD": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TAY SWI"
      }
    }
  }
];

/** Mappa spelarens assistance till rätt pre-baked variant. */
export function pickImageQuestionVariant(
  question: ImageQuizQuestion,
  assistance: 'minimal' | 'standard' | 'full',
): ImageQuestionVariant {
  const key: ImageVariantKey =
    assistance === 'full'
      ? 'prefix-3'
      : assistance === 'minimal'
        ? 'prefix-1'
        : 'prefix-2';
  return question.variants[key];
}

/** Filtrera frågor som passar en specifik spelar-generation. */
export function getImageQuestionsForGeneration(
  generation: ImageQuestionAudience,
): ImageQuizQuestion[] {
  return IMAGE_QUIZ_QUESTIONS.filter(
    (q) => q.audiences.includes(generation) || q.audiences.includes('all'),
  );
}
