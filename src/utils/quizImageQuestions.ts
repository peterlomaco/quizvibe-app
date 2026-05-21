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
  category: 'persons' | 'capitals' | 'artists' | 'songs';
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
    "id": "astrid-lindgren",
    "displayName": "Astrid Lindgren",
    "category": "persons",
    "contentSubject": "cultural-person",
    "correctYear": 1907,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this person?",
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
            "prefix": "M Z",
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
            "prefix": "C R",
            "isCorrect": false
          },
          {
            "prefix": "P",
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
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "A L": [
            {
              "itemId": "astrid-lindgren",
              "displayName": "Astrid Lindgren",
              "isCorrect": true,
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
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "A L"
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
            "prefix": "JE AN",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
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
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "AS LI",
            "isCorrect": true
          },
          {
            "prefix": "PE",
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
          "AS LI": [
            {
              "itemId": "astrid-lindgren",
              "displayName": "Astrid Lindgren",
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
          "LI ME": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
              "isCorrect": false,
              "source": "catalog"
            }
          ]
        },
        "correctPrefix": "AS LI"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
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
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "astrid-lindgren",
            "displayName": "Astrid Lindgren",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "prefix": "E",
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
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": true
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "B E",
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
          "A": [
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
            "prefix": "AB",
            "isCorrect": false
          },
          {
            "prefix": "RI",
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
            "isCorrect": false
          },
          {
            "prefix": "TA SW",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": true
          },
          {
            "prefix": "DR",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
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
          "AB": [
            {
              "itemId": "abba",
              "displayName": "ABBA",
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
              "isCorrect": true,
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
            "itemId": "eminem",
            "displayName": "Eminem",
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
          },
          {
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
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
            "itemId": "abba",
            "displayName": "ABBA",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "elvis-presley",
            "displayName": "Elvis Presley",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "barack-obama",
    "displayName": "Barack Obama",
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1961,
    "audiences": [
      "millennials"
    ],
    "questionText": "What is the Name of this person?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
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
            "prefix": "B O",
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
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "P",
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
            "prefix": "J A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          ]
        },
        "correctPrefix": "B O"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BA OB",
            "isCorrect": true
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "PE",
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
            "prefix": "CR RO",
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
        "correctPrefix": "BA OB"
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
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": true
          },
          {
            "prefix": "J",
            "isCorrect": false
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
            "prefix": "R",
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
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "H",
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
          "B": [
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
              "itemId": "seoul",
              "displayName": "Seoul",
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
          ]
        },
        "correctPrefix": "B"
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
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "BE",
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
            "prefix": "JA",
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
            "prefix": "LO",
            "isCorrect": false
          },
          {
            "prefix": "WA DC",
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
          "JA": [
            {
              "itemId": "pool:jakarta",
              "displayName": "Jakarta",
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
          "LO": [
            {
              "itemId": "london",
              "displayName": "London",
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
        "correctPrefix": "BE"
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
            "itemId": "dubai",
            "displayName": "Dubai",
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
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
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
            "itemId": "stockholm",
            "displayName": "Stockholm",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "berlin",
            "displayName": "Berlin",
            "isCorrect": true,
            "source": "catalog"
          },
          {
            "itemId": "london",
            "displayName": "London",
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
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1956,
    "audiences": [
      "elder",
      "gen-x"
    ],
    "questionText": "What is the Name of this person?",
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
            "prefix": "B B",
            "isCorrect": true
          },
          {
            "prefix": "L M",
            "isCorrect": false
          },
          {
            "prefix": "B O",
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
          "B B": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
        "correctPrefix": "B B"
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
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "BJ BO",
            "isCorrect": true
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
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
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
          "BJ BO": [
            {
              "itemId": "bjorn-borg",
              "displayName": "Björn Borg",
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
          ]
        },
        "correctPrefix": "BJ BO"
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
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
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1985,
    "audiences": [
      "gen-alpha",
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the Name of this person?",
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
            "prefix": "Z I",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "S J",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "C R",
            "isCorrect": true
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
            "prefix": "L M",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
              "itemId": "cristiano-ronaldo",
              "displayName": "Cristiano Ronaldo",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:carlos-rodriguez",
              "displayName": "Carlos Rodriguez",
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
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "PE",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
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
            "prefix": "LI ME",
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
            "prefix": "BA OB",
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
          "PE": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
              "isCorrect": true,
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
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
            "itemId": "lionel-messi",
            "displayName": "Lionel Messi",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "beyonce",
            "displayName": "Beyoncé",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "T B",
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
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "E P",
            "isCorrect": true
          },
          {
            "prefix": "B E",
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
          "E P": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
              "isCorrect": true,
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
              "itemId": "avicii",
              "displayName": "Avicii",
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
            "prefix": "RI",
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
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": true
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
            "prefix": "TH BE",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "EL PR": [
            {
              "itemId": "elvis-presley",
              "displayName": "Elvis Presley",
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
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "madonna",
            "displayName": "Madonna",
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
            "itemId": "drake",
            "displayName": "Drake",
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
            "itemId": "the-beatles",
            "displayName": "The Beatles",
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
            "itemId": "avicii",
            "displayName": "Avicii",
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
            "itemId": "billie-eilish",
            "displayName": "Billie Eilish",
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
    "id": "lionel-messi",
    "displayName": "Lionel Messi",
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1987,
    "audiences": [
      "gen-alpha",
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the Name of this person?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "S J",
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
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "L M",
            "isCorrect": true
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "J A",
            "isCorrect": false
          },
          {
            "prefix": "B O",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "L M": [
            {
              "itemId": "lionel-messi",
              "displayName": "Lionel Messi",
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
          "B O": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
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
          },
          {
            "prefix": "JE AN",
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
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "MA ZU",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          ],
          "JE AN": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
          "ST JO": [
            {
              "itemId": "steve-jobs",
              "displayName": "Steve Jobs",
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
        "correctPrefix": "LI ME"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "itemId": "jennifer-aniston",
            "displayName": "Jennifer Aniston",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "prefix": "V",
            "isCorrect": false
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
            "prefix": "M",
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
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": true
          },
          {
            "prefix": "W",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "B": [
            {
              "itemId": "pool:beijing",
              "displayName": "Beijing",
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
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:lagos",
              "displayName": "Lagos",
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
        "correctPrefix": "L"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "WA DC",
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
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "ST",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": true
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
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "MO",
            "isCorrect": false
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
          "MA": [
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
          ]
        },
        "correctPrefix": "LO"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "moscow",
            "displayName": "Moscow",
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
            "itemId": "rome",
            "displayName": "Rome",
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
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
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
            "itemId": "london",
            "displayName": "London",
            "isCorrect": true,
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
    "id": "madonna",
    "displayName": "Madonna",
    "category": "artists",
    "contentSubject": "artist",
    "correctYear": 1958,
    "peakFrom": 1984,
    "peakTo": 2007,
    "audiences": [
      "gen-x",
      "elder"
    ],
    "questionText": "What is the Name of this Artist?",
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
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "M J",
            "isCorrect": false
          },
          {
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "E P",
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
            },
            {
              "itemId": "abba",
              "displayName": "ABBA",
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
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "AB",
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
            "prefix": "TH BE",
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
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "MA",
            "isCorrect": true
          },
          {
            "prefix": "EL PR",
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
          "TH BE": [
            {
              "itemId": "the-beatles",
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
          "TA SW": [
            {
              "itemId": "taylor-swift",
              "displayName": "Taylor Swift",
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
          "RI": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
          ]
        },
        "correctPrefix": "MA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
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
            "itemId": "billie-eilish",
            "displayName": "Billie Eilish",
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
            "itemId": "metallica",
            "displayName": "Metallica",
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
            "isCorrect": true,
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
      "gen-x",
      "elder"
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "B E",
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
            "isCorrect": true
          },
          {
            "prefix": "E P",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": false
          },
          {
            "prefix": "D",
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
          "M J": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
              "isCorrect": true,
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
            "prefix": "BI EI",
            "isCorrect": false
          },
          {
            "prefix": "RI",
            "isCorrect": false
          },
          {
            "prefix": "ME",
            "isCorrect": false
          },
          {
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "DR",
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
            "prefix": "MA",
            "isCorrect": false
          },
          {
            "prefix": "EL PR",
            "isCorrect": false
          },
          {
            "prefix": "MI JA",
            "isCorrect": true
          }
        ],
        "optionsByPrefix": {
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
          "ME": [
            {
              "itemId": "metallica",
              "displayName": "Metallica",
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
          "DR": [
            {
              "itemId": "drake",
              "displayName": "Drake",
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
              "isCorrect": true,
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
            "itemId": "madonna",
            "displayName": "Madonna",
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
            "itemId": "metallica",
            "displayName": "Metallica",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "billie-eilish",
            "displayName": "Billie Eilish",
            "isCorrect": false,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "mrbeast",
    "displayName": "MrBeast",
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1998,
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "questionText": "What is the Name of this person?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "B O",
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
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "M",
            "isCorrect": true
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
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "Z I",
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
          "B": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "M": [
            {
              "itemId": "madonna",
              "displayName": "Madonna",
              "isCorrect": false,
              "source": "catalog"
            },
            {
              "itemId": "mrbeast",
              "displayName": "MrBeast",
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
          "J A": [
            {
              "itemId": "jennifer-aniston",
              "displayName": "Jennifer Aniston",
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
          "Z I": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
            "prefix": "CR RO",
            "isCorrect": false
          },
          {
            "prefix": "PE",
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
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "MR",
            "isCorrect": true
          },
          {
            "prefix": "AV",
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
          "MR": [
            {
              "itemId": "mrbeast",
              "displayName": "MrBeast",
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
        "correctPrefix": "MR"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
          {
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
            "itemId": "mrbeast",
            "displayName": "MrBeast",
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
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "prefix": "W D",
            "isCorrect": false
          },
          {
            "prefix": "W",
            "isCorrect": false
          },
          {
            "prefix": "L",
            "isCorrect": false
          },
          {
            "prefix": "S",
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
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "D",
            "isCorrect": false
          },
          {
            "prefix": "H",
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
          "W D": [
            {
              "itemId": "washington-dc",
              "displayName": "Washington, D.C.",
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
              "itemId": "stockholm",
              "displayName": "Stockholm",
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
          "M": [
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
          "B": [
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
              "itemId": "pool:budapest",
              "displayName": "Budapest",
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
          "H": [
            {
              "itemId": "pool:helsinki",
              "displayName": "Helsinki",
              "isCorrect": false,
              "source": "pool"
            },
            {
              "itemId": "pool:hanoi",
              "displayName": "Hanoi",
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
            "prefix": "WA DC",
            "isCorrect": false
          },
          {
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "RO",
            "isCorrect": false
          },
          {
            "prefix": "PA",
            "isCorrect": true
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
            "prefix": "ST",
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
            "prefix": "BE",
            "isCorrect": false
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
          "SE": [
            {
              "itemId": "seoul",
              "displayName": "Seoul",
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
              "isCorrect": true,
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
          "ST": [
            {
              "itemId": "stockholm",
              "displayName": "Stockholm",
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
          ]
        },
        "correctPrefix": "PA"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
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
            "itemId": "pool:hanoi",
            "displayName": "Hanoi",
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
            "itemId": "washington-dc",
            "displayName": "Washington, D.C.",
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
            "itemId": "rome",
            "displayName": "Rome",
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
            "prefix": "R",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          },
          {
            "prefix": "W D",
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
            "prefix": "T",
            "isCorrect": false
          },
          {
            "prefix": "S",
            "isCorrect": true
          },
          {
            "prefix": "M",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "B",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "A": [
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
            },
            {
              "itemId": "pool:athens",
              "displayName": "Athens",
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
          "T": [
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
              "itemId": "pool:manila",
              "displayName": "Manila",
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
            "prefix": "DU",
            "isCorrect": false
          },
          {
            "prefix": "PA",
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
            "prefix": "SE",
            "isCorrect": false
          },
          {
            "prefix": "LO",
            "isCorrect": false
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
            "prefix": "BU",
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
          "BU": [
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
            }
          ]
        },
        "correctPrefix": "ST"
      },
      "full-names": {
        "mode": "full-names",
        "nameList": [
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
            "itemId": "rome",
            "displayName": "Rome",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "pool:cairo",
            "displayName": "Cairo",
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
            "itemId": "stockholm",
            "displayName": "Stockholm",
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
            "itemId": "seoul",
            "displayName": "Seoul",
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
            "prefix": "B E",
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
            "prefix": "T B",
            "isCorrect": false
          },
          {
            "prefix": "T S",
            "isCorrect": true
          },
          {
            "prefix": "E",
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
            "prefix": "R",
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
            },
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
          "R": [
            {
              "itemId": "rihanna",
              "displayName": "Rihanna",
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
            "prefix": "MI JA",
            "isCorrect": false
          },
          {
            "prefix": "DR",
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
            "prefix": "TA SW",
            "isCorrect": true
          },
          {
            "prefix": "AB",
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
            "prefix": "AV",
            "isCorrect": false
          },
          {
            "prefix": "BI EI",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "MI JA": [
            {
              "itemId": "michael-jackson",
              "displayName": "Michael Jackson",
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
          ]
        },
        "correctPrefix": "TA SW"
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
            "itemId": "madonna",
            "displayName": "Madonna",
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
            "itemId": "michael-jackson",
            "displayName": "Michael Jackson",
            "isCorrect": false,
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
            "itemId": "rihanna",
            "displayName": "Rihanna",
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
    "id": "winston-churchill",
    "displayName": "Winston Churchill",
    "category": "persons",
    "contentSubject": "cultural-person",
    "correctYear": 1874,
    "audiences": [
      "elder"
    ],
    "questionText": "What is the Name of this person?",
    "variants": {
      "prefix-1": {
        "mode": "prefix",
        "prefixLength": 1,
        "letterGrid": [
          {
            "prefix": "M Z",
            "isCorrect": false
          },
          {
            "prefix": "P",
            "isCorrect": false
          },
          {
            "prefix": "W C",
            "isCorrect": true
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
            "prefix": "B O",
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
            "prefix": "B",
            "isCorrect": false
          },
          {
            "prefix": "A",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
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
          "W C": [
            {
              "itemId": "winston-churchill",
              "displayName": "Winston Churchill",
              "isCorrect": true,
              "source": "catalog"
            },
            {
              "itemId": "pool:wei-chen",
              "displayName": "Wei Chen",
              "isCorrect": false,
              "source": "pool"
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
          ]
        },
        "correctPrefix": "W C"
      },
      "prefix-2": {
        "mode": "prefix",
        "prefixLength": 2,
        "letterGrid": [
          {
            "prefix": "BA OB",
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "WI CH",
            "isCorrect": true
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
            "prefix": "ZL IB",
            "isCorrect": false
          },
          {
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "CR RO",
            "isCorrect": false
          }
        ],
        "optionsByPrefix": {
          "BA OB": [
            {
              "itemId": "barack-obama",
              "displayName": "Barack Obama",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          ]
        },
        "correctPrefix": "WI CH"
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
            "itemId": "zlatan-ibrahimovic",
            "displayName": "Zlatan Ibrahimović",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "winston-churchill",
            "displayName": "Winston Churchill",
            "isCorrect": true,
            "source": "catalog"
          }
        ]
      }
    }
  },
  {
    "id": "zlatan-ibrahimovic",
    "displayName": "Zlatan Ibrahimović",
    "category": "persons",
    "contentSubject": "celebrity",
    "correctYear": 1981,
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "questionText": "What is the Name of this person?",
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
          },
          {
            "prefix": "B O",
            "isCorrect": false
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
            "prefix": "J A",
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
          "P": [
            {
              "itemId": "pewdiepie",
              "displayName": "PewDiePie",
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
            "prefix": "BE",
            "isCorrect": false
          },
          {
            "prefix": "BA OB",
            "isCorrect": false
          },
          {
            "prefix": "ZL IB",
            "isCorrect": true
          },
          {
            "prefix": "MA ZU",
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
            "prefix": "ST JO",
            "isCorrect": false
          },
          {
            "prefix": "JE AN",
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
          "BE": [
            {
              "itemId": "beyonce",
              "displayName": "Beyoncé",
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
          "ZL IB": [
            {
              "itemId": "zlatan-ibrahimovic",
              "displayName": "Zlatan Ibrahimović",
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
          ]
        },
        "correctPrefix": "ZL IB"
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
            "itemId": "mark-zuckerberg",
            "displayName": "Mark Zuckerberg",
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
            "itemId": "cristiano-ronaldo",
            "displayName": "Cristiano Ronaldo",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "barack-obama",
            "displayName": "Barack Obama",
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
            "itemId": "avicii",
            "displayName": "Avicii",
            "isCorrect": false,
            "source": "catalog"
          },
          {
            "itemId": "steve-jobs",
            "displayName": "Steve Jobs",
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
            "itemId": "pewdiepie",
            "displayName": "PewDiePie",
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
