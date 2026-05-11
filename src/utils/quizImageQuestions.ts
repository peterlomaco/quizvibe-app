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
  audiences: ImageQuestionAudience[];
  questionText: string;
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = [
  {
    "id": "astrid-lindgren",
    "displayName": "Astrid Lindgren",
    "category": "persons",
    "audiences": [
      "elder"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "A L",
            "isCorrect": true
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S J": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
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
            }
          ],
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "A L": [
            {
              "itemId": "astrid-lindgren",
              "displayName": "Astrid Lindgren",
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
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            },
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
          ]
        },
        "correctPrefix": "A L"
      },
      "prefix-2": {
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
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "AS LI",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
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
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "AS LI": [
            {
              "itemId": "astrid-lindgren",
              "displayName": "Astrid Lindgren",
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
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
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
        "correctPrefix": "AS LI"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "AST LIN",
            "isCorrect": true
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "AST LIN": [
            {
              "itemId": "astrid-lindgren",
              "displayName": "Astrid Lindgren",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AST LIN"
      }
    }
  },
  {
    "id": "avicii",
    "displayName": "Avicii",
    "category": "artists",
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "D",
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
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B E",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "M",
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
              "itemId": "pool:the-strokes",
              "displayName": "The Strokes",
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
          "E": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
              "itemId": "pool:adele",
              "displayName": "Adele",
              "isCorrect": false,
              "source": "pool"
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
          ]
        },
        "correctPrefix": "A"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": true
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
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          "BI EI": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AV"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "ABB",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": true
          },
          {
            "prefix": "THE BEA",
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
            "prefix": "DRA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "MAD": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
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
          "THE BEA": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
          "DRA": [
            {
              "itemId": "drake",
              "displayName": "Drake",
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
    "id": "barack-obama",
    "displayName": "Barack Obama",
    "category": "persons",
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": true
          },
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S J": [
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
            },
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "B O"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
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
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "BA OB"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": true
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          ]
        },
        "correctPrefix": "BAR OBA"
      }
    }
  },
  {
    "id": "berlin",
    "displayName": "Berlin",
    "category": "capitals",
    "audiences": [
      "all"
    ],
    "questionText": "What is the name of this place?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": true
          },
          {
            "prefix": "W D",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "T",
            "isCorrect": false
          },
          {
            "prefix": "W",
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
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
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
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:brasilia",
              "displayName": "Brasília",
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
          "M": [
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
            },
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
            }
          ],
          "T": [
            {
              "itemId": "pool:tokyo",
              "displayName": "Tokyo",
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
              "itemId": "pool:tehran",
              "displayName": "Tehran",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:toronto",
              "displayName": "Toronto",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "W": [
            {
              "itemId": "pool:warsaw",
              "displayName": "Warsaw",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "B"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "AT",
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
            "prefix": "SE",
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
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "PA",
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
          "AT": [
            {
              "itemId": "pool:athens",
              "displayName": "Athens",
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
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
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
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": true,
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
          ]
        },
        "correctPrefix": "BE"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "PAR",
            "isCorrect": false
          },
          {
            "prefix": "BER",
            "isCorrect": true
          },
          {
            "prefix": "MOS",
            "isCorrect": false
          },
          {
            "prefix": "SEO",
            "isCorrect": false
          },
          {
            "prefix": "LON",
            "isCorrect": false
          },
          {
            "prefix": "DUB",
            "isCorrect": false
          },
          {
            "prefix": "STO",
            "isCorrect": false
          },
          {
            "prefix": "WAS DC",
            "isCorrect": false
          },
          {
            "prefix": "ROM",
            "isCorrect": false
          },
          {
            "prefix": "KYI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PAR": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BER": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "MOS": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SEO": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LON": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DUB": [
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
          "STO": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WAS DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ROM": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "KYI": [
            {
              "itemId": "pool:kyiv",
              "displayName": "Kyiv",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "BER"
      }
    }
  },
  {
    "id": "bjorn-borg",
    "displayName": "Björn Borg",
    "category": "persons",
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B B",
            "isCorrect": true
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
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "S J": [
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "A": [
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
            },
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "B B"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
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
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": true
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
        "correctPrefix": "BJ BO"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "BJÖ BOR",
            "isCorrect": true
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BJÖ BOR": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          ]
        },
        "correctPrefix": "BJÖ BOR"
      }
    }
  },
  {
    "id": "cristiano-ronaldo",
    "displayName": "Cristiano Ronaldo",
    "category": "persons",
    "audiences": [
      "gen-alpha",
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": true
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "P",
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
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S J": [
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "C R": [
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
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
            }
          ],
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "C R"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ST JO",
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
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": true
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
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
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "CR RO"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          },
          {
            "prefix": "CRI RON",
            "isCorrect": true
          },
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "CRI RON"
      }
    }
  },
  {
    "id": "elvis-presley",
    "displayName": "Elvis Presley",
    "category": "artists",
    "audiences": [
      "elder"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T S",
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
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "E P",
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
          }
        ],
        "optionsByPrefix": {
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
          "A": [
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          ]
        },
        "correctPrefix": "E P"
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
          },
          {
            "prefix": "EM",
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
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
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
          ],
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
          "TH BE": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
        "correctPrefix": "EL PR"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "TAY SWI",
            "isCorrect": false
          },
          {
            "prefix": "ABB",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "THE BEA",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "ELV PRE",
            "isCorrect": true
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          },
          {
            "prefix": "DRA",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
    "id": "lionel-messi",
    "displayName": "Lionel Messi",
    "category": "persons",
    "audiences": [
      "gen-alpha",
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "J A",
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
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "L M",
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
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "A",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "S J": [
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
            }
          ]
        },
        "correctPrefix": "L M"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": true
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
              "isCorrect": true,
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
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
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
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
        "correctPrefix": "LI ME"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "LIO MES",
            "isCorrect": true
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LIO MES"
      }
    }
  },
  {
    "id": "london",
    "displayName": "London",
    "category": "capitals",
    "audiences": [
      "all"
    ],
    "questionText": "What is the name of this place?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "R",
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
            "prefix": "I",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": true
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
            "prefix": "V",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            },
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
            }
          ],
          "I": [
            {
              "itemId": "pool:istanbul",
              "displayName": "Istanbul",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "L": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": true,
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
              "itemId": "pool:sydney",
              "displayName": "Sydney",
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
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
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
          "V": [
            {
              "itemId": "pool:vienna",
              "displayName": "Vienna",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:vilnius",
              "displayName": "Vilnius",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "L"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "AN",
            "isCorrect": false
          },
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": true
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
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "AN": [
            {
              "itemId": "pool:ankara",
              "displayName": "Ankara",
              "isCorrect": false,
              "source": "pool"
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
              "isCorrect": true,
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
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
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
          "WA DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "LO"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "SEO",
            "isCorrect": false
          },
          {
            "prefix": "STO",
            "isCorrect": false
          },
          {
            "prefix": "BER",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "LON",
            "isCorrect": true
          },
          {
            "prefix": "WAS DC",
            "isCorrect": false
          },
          {
            "prefix": "MOS",
            "isCorrect": false
          },
          {
            "prefix": "PAR",
            "isCorrect": false
          },
          {
            "prefix": "ROM",
            "isCorrect": false
          },
          {
            "prefix": "DUB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "SEO": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STO": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BER": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAD": [
            {
              "itemId": "pool:madrid",
              "displayName": "Madrid",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "LON": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WAS DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MOS": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PAR": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ROM": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DUB": [
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
          ]
        },
        "correctPrefix": "LON"
      }
    }
  },
  {
    "id": "madonna",
    "displayName": "Madonna",
    "category": "artists",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "R",
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
            "prefix": "M J",
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
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "A",
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
          "B E": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
              "itemId": "abba",
              "displayName": "ABBA",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "EM",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
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
            "prefix": "MA",
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
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
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
          ]
        },
        "correctPrefix": "MA"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "MET",
            "isCorrect": false
          },
          {
            "prefix": "DRA",
            "isCorrect": false
          },
          {
            "prefix": "ABB",
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
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "AVI": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
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
          ],
          "ABB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
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
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
    "audiences": [
      "gen-x",
      "elder"
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
            "prefix": "B E",
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
            "prefix": "T S",
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
            "prefix": "E",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
              "itemId": "abba",
              "displayName": "ABBA",
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
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          },
          {
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "AB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          "BI EI": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          ]
        },
        "correctPrefix": "MI JA"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "MIC JAC",
            "isCorrect": true
          },
          {
            "prefix": "DRA",
            "isCorrect": false
          },
          {
            "prefix": "RIH",
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
            "prefix": "ELV PRE",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "BIL EIL",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
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
          "MIC JAC": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
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
          "RIH": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          "ELV PRE": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          "BIL EIL": [
            {
              "itemId": "billie-eilish",
              "displayName": "Billie Eilish",
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
          ]
        },
        "correctPrefix": "MIC JAC"
      }
    }
  },
  {
    "id": "mrbeast",
    "displayName": "MrBeast",
    "category": "persons",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "B",
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
            "prefix": "L M",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "S J": [
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M": [
            {
              "itemId": "mrbeast",
              "displayName": "MrBeast",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
            }
          ],
          "C R": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
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
        "correctPrefix": "M"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "LI ME",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "MR",
            "isCorrect": true
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MR": [
            {
              "itemId": "mrbeast",
              "displayName": "MrBeast",
              "isCorrect": true,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MR"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "MRB",
            "isCorrect": true
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MRB": [
            {
              "itemId": "mrbeast",
              "displayName": "MrBeast",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "MRB"
      }
    }
  },
  {
    "id": "paris",
    "displayName": "Paris",
    "category": "capitals",
    "audiences": [
      "all"
    ],
    "questionText": "What is the name of this place?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "M",
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
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "T",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
          "A": [
            {
              "itemId": "pool:athens",
              "displayName": "Athens",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:amsterdam",
              "displayName": "Amsterdam",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:ankara",
              "displayName": "Ankara",
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
          "M": [
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
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:manila",
              "displayName": "Manila",
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
              "itemId": "pool:beijing",
              "displayName": "Beijing",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "T": [
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
            },
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
            }
          ],
          "S": [
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
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:prague",
              "displayName": "Prague",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "P"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "LI",
            "isCorrect": false
          },
          {
            "prefix": "MO",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
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
          "LI": [
            {
              "itemId": "pool:lisbon",
              "displayName": "Lisbon",
              "isCorrect": false,
              "source": "pool"
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
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
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
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
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
          ]
        },
        "correctPrefix": "PA"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "ROM",
            "isCorrect": false
          },
          {
            "prefix": "BER",
            "isCorrect": false
          },
          {
            "prefix": "COP",
            "isCorrect": false
          },
          {
            "prefix": "WAS DC",
            "isCorrect": false
          },
          {
            "prefix": "DUB",
            "isCorrect": false
          },
          {
            "prefix": "MOS",
            "isCorrect": false
          },
          {
            "prefix": "PAR",
            "isCorrect": true
          },
          {
            "prefix": "SEO",
            "isCorrect": false
          },
          {
            "prefix": "LON",
            "isCorrect": false
          },
          {
            "prefix": "STO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ROM": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BER": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "COP": [
            {
              "itemId": "pool:copenhagen",
              "displayName": "Copenhagen",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "WAS DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DUB": [
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
          "MOS": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PAR": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "SEO": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LON": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STO": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "PAR"
      }
    }
  },
  {
    "id": "stockholm",
    "displayName": "Stockholm",
    "category": "capitals",
    "audiences": [
      "all"
    ],
    "questionText": "What is the name of this place?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "R",
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
            "prefix": "L",
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
            "prefix": "W",
            "isCorrect": false
          },
          {
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "P",
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
              "itemId": "pool:dublin",
              "displayName": "Dublin",
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
            },
            {
              "itemId": "pool:sydney",
              "displayName": "Sydney",
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
              "itemId": "pool:bucharest",
              "displayName": "Bucharest",
              "isCorrect": false,
              "source": "pool"
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
          "W": [
            {
              "itemId": "pool:warsaw",
              "displayName": "Warsaw",
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
          ]
        },
        "correctPrefix": "S"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "PA",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": true
          },
          {
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "OS",
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
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "MO",
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
          ],
          "RO": [
            {
              "itemId": "rome",
              "displayName": "Rome",
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
          ]
        },
        "correctPrefix": "ST"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "BER",
            "isCorrect": false
          },
          {
            "prefix": "DUB",
            "isCorrect": false
          },
          {
            "prefix": "ROM",
            "isCorrect": false
          },
          {
            "prefix": "LON",
            "isCorrect": false
          },
          {
            "prefix": "STO",
            "isCorrect": true
          },
          {
            "prefix": "WAS DC",
            "isCorrect": false
          },
          {
            "prefix": "SEO",
            "isCorrect": false
          },
          {
            "prefix": "SOF",
            "isCorrect": false
          },
          {
            "prefix": "MOS",
            "isCorrect": false
          },
          {
            "prefix": "PAR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BER": [
            {
              "itemId": "berlin",
              "displayName": "Berlin",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "DUB": [
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
          "ROM": [
            {
              "itemId": "rome",
              "displayName": "Rome",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "LON": [
            {
              "itemId": "london",
              "displayName": "London",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STO": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "WAS DC": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SEO": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "SOF": [
            {
              "itemId": "pool:sofia",
              "displayName": "Sofia",
              "isCorrect": false,
              "source": "pool"
            }
          ],
          "MOS": [
            {
              "itemId": "moscow",
              "displayName": "Moscow",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PAR": [
            {
              "itemId": "paris",
              "displayName": "Paris",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "STO"
      }
    }
  },
  {
    "id": "taylor-swift",
    "displayName": "Taylor Swift",
    "category": "artists",
    "audiences": [
      "gen-z"
    ],
    "questionText": "What is the name of this artist?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "T B",
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
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "E",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "T B": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
          ]
        },
        "correctPrefix": "T S"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "TA SW",
            "isCorrect": true
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
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
            "prefix": "BI EI",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
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
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          "EM": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
            "prefix": "THE BEA",
            "isCorrect": false
          },
          {
            "prefix": "MAD",
            "isCorrect": false
          },
          {
            "prefix": "EMI",
            "isCorrect": false
          },
          {
            "prefix": "MET",
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
            "prefix": "DRA",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "ABB",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "THE BEA": [
            {
              "itemId": "the-beatles",
              "displayName": "The Beatles",
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
          "EMI": [
            {
              "itemId": "eminem",
              "displayName": "Eminem",
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
          "DRA": [
            {
              "itemId": "drake",
              "displayName": "Drake",
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
          "ABB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "TAY SWI"
      }
    }
  },
  {
    "id": "winston-churchill",
    "displayName": "Winston Churchill",
    "category": "persons",
    "audiences": [
      "elder"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "C R",
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
            "prefix": "W C",
            "isCorrect": true
          },
          {
            "prefix": "S J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
            },
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
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
            }
          ],
          "W C": [
            {
              "itemId": "pool:wei-chen",
              "displayName": "Wei Chen",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "winston-churchill",
              "displayName": "Winston Churchill",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "S J": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "W C"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "ST JO",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "WI CH",
            "isCorrect": true
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "AV": [
            {
              "itemId": "avicii",
              "displayName": "Avicii",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WI CH": [
            {
              "itemId": "winston-churchill",
              "displayName": "Winston Churchill",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "WI CH"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "PEW",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": false
          },
          {
            "prefix": "WIN CHU",
            "isCorrect": true
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "WIN CHU": [
            {
              "itemId": "winston-churchill",
              "displayName": "Winston Churchill",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
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
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "WIN CHU"
      }
    }
  },
  {
    "id": "zlatan-ibrahimovic",
    "displayName": "Zlatan Ibrahimović",
    "category": "persons",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the name of this person?",
    "variants": {
      "prefix-1": {
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B O",
            "isCorrect": false
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
            "isCorrect": true
          },
          {
            "prefix": "S J",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "M Z": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "C R": [
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
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
              "itemId": "avicii",
              "displayName": "Avicii",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "S J": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "pool:sarah-johnson",
              "displayName": "Sarah Johnson",
              "isCorrect": false,
              "source": "pool"
            }
          ]
        },
        "correctPrefix": "Z I"
      },
      "prefix-2": {
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": true
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "LI ME",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
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
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
          "MA ZU": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ZL IB"
      },
      "prefix-3": {
        "prefixLength": 3,
        "letterGrid": [
          {
            "prefix": "LIO MES",
            "isCorrect": false
          },
          {
            "prefix": "STE JOB",
            "isCorrect": false
          },
          {
            "prefix": "PEW",
            "isCorrect": false
          },
          {
            "prefix": "AVI",
            "isCorrect": false
          },
          {
            "prefix": "ZLA IBR",
            "isCorrect": true
          },
          {
            "prefix": "CRI RON",
            "isCorrect": false
          },
          {
            "prefix": "MAR ZUC",
            "isCorrect": false
          },
          {
            "prefix": "BAR OBA",
            "isCorrect": false
          },
          {
            "prefix": "JEN ANI",
            "isCorrect": false
          },
          {
            "prefix": "BEY",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "LIO MES": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "STE JOB": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "PEW": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "ZLA IBR": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
              "isCorrect": true,
              "source": "catalog"
            }
          ],
          "CRI RON": [
            {
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "MAR ZUC": [
            {
              "itemId": "mark-zuckerberg",
              "displayName": "Mark Zuckerberg",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BAR OBA": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "JEN ANI": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ],
          "BEY": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "ZLA IBR"
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
