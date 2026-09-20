// Auto-generated music questions. Regenerate with:
//   cd backend && npm run export-music-questions
//
// Source: backend/content/catalog/songs-*.yaml

import type { YoutubeClip } from './mediaSource';

export type MusicQuestionAudience =
  | 'elder'
  | 'gen-x'
  | 'millennials'
  | 'gen-z'
  | 'gen-alpha'
  | 'all';

export type YoutubeContentSubject = 'song' | 'movie' | 'sport-event';

export interface MusicQuestion {
  id: string;
  displayName: string;
  /** Finns för timeline-frågor; saknas för actor-select (film-frågor). */
  correctYear?: number;
  contentSubject: YoutubeContentSubject;
  questionText: string;
  /** Item-HCP (§4.1) = katalogens probability (0–100). Klientens HCP-filter
   *  väljer item om itemHcp >= ett golv som sänks stegvis med spelarens HCP
   *  (HCP ≥ 80 → ≥ 10 … HCP < 20 → ≥ 0; övre kanten alltid 100). */
  itemHcp: number;
  audiences: MusicQuestionAudience[];
  genrePackages?: string[];
  /** false = paket-exklusiv (spelas bara när matchande Host-paket är aktivt).
   *  Utelämnat = default true = med i baspoolen. */
  inBaseCatalog?: boolean;
  /** Geografisk igenkännings-scope. Item-level overridar fil-header.
   *  'unknown-region' = ej i base-pool; filtreras bort i SEED_QUESTIONS. */
  region: string[];
  /** Parent control-tagg. true = klippet filtreras bort ur frågeurvalet när
   *  host har Parent Control påslaget. Sätts i YAML (default false). */
  parentControlled?: boolean;
  youtubeClips: YoutubeClip[];
  /** Spotify track ID — satt manuellt i YAML för Spotify DJ-läge. */
  spotifyTrackId?: string;
  /** actor-select: true = animerad film (frågar karaktärnamn), annars skådespelarnamn. */
  isAnimated?: boolean;
  /** actor-select: godkända svar (räcker att välja ett). */
  correctNames?: string[];
  /** actor-select: felaktiga svarsalternativ. */
  distractorNames?: string[];
}

export const MUSIC_QUESTIONS: MusicQuestion[] = [
  {
    "id": "steamboat-willie-1928",
    "displayName": "Steamboat Willie",
    "correctYear": 1928,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
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
    "youtubeClips": [
      {
        "videoId": "I5pG1wbRKOg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Did You Catch This?",
        "license": "standard",
        "notes": "4K-remaster av Steamboat Willie (public domain sedan jan 2024). Ikononisk öppning med Mickey som visslar på ångbåten."
      }
    ]
  },
  {
    "id": "louis-armstrong-body-and-soul",
    "displayName": "Body and Soul — Louis Armstrong",
    "correctYear": 1930,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "spotifyTrackId": "3k3WlYkt3qYNtLFkT5yGox",
    "youtubeClips": []
  },
  {
    "id": "cab-calloway-minnie-the-moocher",
    "displayName": "Minnie the Moocher — Cab Calloway",
    "correctYear": 1931,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "7GASUbWzEnJKfgg4lz65qY",
    "youtubeClips": [
      {
        "videoId": "WtSLYrTKrEw",
        "startSec": 48,
        "endSec": 63,
        "license": "standard"
      },
      {
        "videoId": "8suquDgg0dw",
        "startSec": 28,
        "endSec": 43,
        "license": "standard"
      }
    ]
  },
  {
    "id": "fred-astaire-night-and-day",
    "displayName": "Night and Day — Fred Astaire",
    "correctYear": 1932,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "3XkZkqXOEZ00Y2RXsCFfDd",
    "youtubeClips": [
      {
        "videoId": "h02OmcR-be4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Music Video Vault",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "ethel-waters-stormy-weather",
    "displayName": "Stormy Weather — Ethel Waters",
    "correctYear": 1933,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "7M7RMJZYmSgmLveGBgakne",
    "youtubeClips": [
      {
        "videoId": "dyo77R5ShTM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "American Musical Theater Archives",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "king-kong-1933",
    "displayName": "King Kong",
    "correctYear": 1933,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "o-7BF7f5lZA",
        "startSec": 90,
        "endSec": 120,
        "channelTitle": "Slim Shady",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titel 'King Kong original trailer' — inget ar. Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "cole-porter-anything-goes",
    "displayName": "Anything Goes — Cole Porter",
    "correctYear": 1934,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "spotifyTrackId": "61Wh4cqsBmhzsEbGLNulQB",
    "youtubeClips": [
      {
        "videoId": "3zFBAEj7kdA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Cole Porter - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (2)."
      }
    ]
  },
  {
    "id": "fred-astaire-cheek-to-cheek",
    "displayName": "Cheek to Cheek — Fred Astaire",
    "correctYear": 1935,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5qWXXF3On2xUfVu1ND1NLN",
    "youtubeClips": []
  },
  {
    "id": "bing-crosby-pennies-from-heaven",
    "displayName": "Pennies from Heaven — Bing Crosby",
    "correctYear": 1936,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "4Du0wJYQDUt2bw1Bq2b4Qb",
    "youtubeClips": []
  },
  {
    "id": "duke-ellington-caravan",
    "displayName": "Caravan — Duke Ellington",
    "correctYear": 1937,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "6hiMQEHbd8z7gfJ64Fg0z5",
    "youtubeClips": []
  },
  {
    "id": "snow-white-1937",
    "displayName": "Snow White and the Seven Dwarfs",
    "correctYear": 1937,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
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
    "youtubeClips": [
      {
        "videoId": "nSgngZ9CpTM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Ika1rutan",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Svensk scen 'The Silly Song (Swedish)'. Ingen ar-spoiler i titeln. Privat kanal — hog takedown-/embed-block-risk, kontrollera nightly-validate."
      }
    ]
  },
  {
    "id": "ella-fitzgerald-a-tisket-a-tasket",
    "displayName": "A-Tisket, A-Tasket — Ella Fitzgerald",
    "correctYear": 1938,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "0nV1rouDdrSBNKCogIE6us",
    "youtubeClips": []
  },
  {
    "id": "glenn-miller-in-the-mood",
    "displayName": "In the Mood — Glenn Miller",
    "correctYear": 1939,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
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
    "spotifyTrackId": "6dZKWYSx5YBIme4SfpIHJ0",
    "youtubeClips": [
      {
        "videoId": "7vMTZBVBkPU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Glenn Miller Orchestra - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic swing-intro."
      }
    ]
  },
  {
    "id": "judy-garland-over-the-rainbow",
    "displayName": "Over the Rainbow — Judy Garland",
    "correctYear": 1939,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
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
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "1zzJOF5gOMXzqoUCbOg4JE",
    "youtubeClips": [
      {
        "videoId": "oW2QZ7KuaxA",
        "startSec": 52,
        "endSec": 67,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-wizard-of-oz-1939",
    "displayName": "The Wizard of Oz",
    "correctYear": 1939,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Judy Garland"
    ],
    "distractorNames": [
      "Shirley Temple",
      "Vivien Leigh",
      "Katharine Hepburn",
      "Ingrid Bergman"
    ],
    "youtubeClips": [
      {
        "videoId": "FfpF8UUVTeM",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Warner On Demand",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiell WB-trailer, titeln avslöjar varken skådespelare eller år."
      }
    ]
  },
  {
    "id": "citizen-kane-1941",
    "displayName": "Citizen Kane",
    "correctYear": 1941,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Orson Welles"
    ],
    "distractorNames": [
      "Humphrey Bogart",
      "James Stewart",
      "Cary Grant",
      "Gary Cooper"
    ],
    "youtubeClips": [
      {
        "videoId": "fXf2LGhW66M",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Mackenzie Parker",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. OBS: fan-gjord 'modern trailer' på privat kanal — ej rättsinnehavare. Takedown-risk, byt till officiellt klipp när sådant hittas."
      }
    ]
  },
  {
    "id": "glenn-miller-chattanooga-choo-choo",
    "displayName": "Chattanooga Choo Choo — Glenn Miller",
    "correctYear": 1941,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "7a5VuzvBrtbqYT7kNlQlFd",
    "youtubeClips": []
  },
  {
    "id": "bambi-1942",
    "displayName": "Bambi",
    "correctYear": 1942,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 86,
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
    "youtubeClips": [
      {
        "videoId": "YgNx5J0SROE",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Disney UK",
        "license": "standard",
        "notes": "Disney UK officiell Diamond Edition-trailer — Bambi i skogen, klassisk Disney-estetik."
      }
    ]
  },
  {
    "id": "bing-crosby-white-christmas",
    "displayName": "White Christmas — Bing Crosby",
    "correctYear": 1942,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
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
    "genrePackages": [
      "Christmas edition"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4so0Wek9Ig1p6CRCHuINwW",
    "youtubeClips": [
      {
        "videoId": "w7mz91nTF40",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bing Crosby - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Refrängområde."
      }
    ]
  },
  {
    "id": "casablanca-1942",
    "displayName": "Casablanca",
    "correctYear": 1942,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Humphrey Bogart",
      "Ingrid Bergman"
    ],
    "distractorNames": [
      "Cary Grant",
      "James Stewart",
      "Katharine Hepburn",
      "Greta Garbo"
    ],
    "youtubeClips": [
      {
        "videoId": "0V1eoBH0Zcw",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "thecoolidge",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Original-trailer i HD, titeln avslöjar varken skådespelare eller år."
      }
    ]
  },
  {
    "id": "dooley-wilson-as-time-goes-by",
    "displayName": "As Time Goes By — Dooley Wilson",
    "correctYear": 1943,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
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
    "spotifyTrackId": "65CTjOeuGBDfXZjsHMEK8d",
    "youtubeClips": []
  },
  {
    "id": "bing-crosby-swinging-on-a-star",
    "displayName": "Swinging on a Star — Bing Crosby",
    "correctYear": 1944,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "450aHY6TKEFag2pe3KSvXW",
    "youtubeClips": [
      {
        "videoId": "BEnBcm3QIfs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Classic Mood Experience",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "doris-day-sentimental-journey",
    "displayName": "Sentimental Journey — Doris Day",
    "correctYear": 1945,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "5BqypiEMn72mnQogW8gIcu",
    "youtubeClips": [
      {
        "videoId": "IpQCROAHoU4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Doris Day - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "nat-king-cole-the-christmas-song",
    "displayName": "The Christmas Song — Nat King Cole",
    "correctYear": 1946,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
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
    "genrePackages": [
      "Christmas edition"
    ],
    "spotifyTrackId": "6NMz3Cjvod2qnJjakiRDA8",
    "youtubeClips": [
      {
        "videoId": "1Jp3XIqTR2w",
        "startSec": 20,
        "endSec": 35,
        "channelTitle": "Nat King Cole - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. 'Chestnuts roasting'-vers."
      }
    ]
  },
  {
    "id": "edith-piaf-la-vie-en-rose",
    "displayName": "La Vie en rose — Édith Piaf",
    "correctYear": 1947,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6RKuyWarJu8SMrflntmyXx",
    "youtubeClips": [
      {
        "videoId": "-0KvBnIvTFs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Edith Piaf Officiel",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters rzeLynj1GYM ar SD OCH live; bytt till officiella studio-audion (HD) fran samma kanal. correctYear 1947 = singel-release (skriven 1945, inspelad 1946) per Wikipedia."
      }
    ]
  },
  {
    "id": "frank-sinatra-almost-like-being-in-love",
    "displayName": "Almost Like Being in Love — Frank Sinatra",
    "correctYear": 1947,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "spotifyTrackId": "5pCVEMMt40ICn9HXZ5q85o",
    "youtubeClips": [
      {
        "videoId": "zMRoByJI43Q",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Micah Gwinn",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "nat-king-cole-nature-boy",
    "displayName": "Nature Boy — Nat King Cole",
    "correctYear": 1948,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "2pkUfD2lCmNOOMnzZoJQUl",
    "youtubeClips": [
      {
        "videoId": "D6NOJZpYp8c",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "시공초월노래 번역자 기뮤",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "perry-como-some-enchanted-evening",
    "displayName": "Some Enchanted Evening — Perry Como",
    "correctYear": 1949,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "0MVjP6RWqGXygcgxRYfP3V",
    "youtubeClips": [
      {
        "videoId": "bltUKtRFdfY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Perry Como - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (2)."
      }
    ]
  },
  {
    "id": "nat-king-cole-mona-lisa",
    "displayName": "Mona Lisa — Nat King Cole",
    "correctYear": 1950,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "spotifyTrackId": "5dae01pKNjRQtgOeAkFzPY",
    "youtubeClips": []
  },
  {
    "id": "johnnie-ray-cry",
    "displayName": "Cry — Johnnie Ray",
    "correctYear": 1951,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "spotifyTrackId": "1rmDNc4M7r3dIYPRlScGAI",
    "youtubeClips": []
  },
  {
    "id": "jo-stafford-you-belong-to-me",
    "displayName": "You Belong to Me — Jo Stafford",
    "correctYear": 1952,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7ad5naTPazXhbyY8SuWzKm",
    "youtubeClips": []
  },
  {
    "id": "singin-in-the-rain-1952",
    "displayName": "Singin' in the Rain",
    "correctYear": 1952,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Gene Kelly",
      "Debbie Reynolds"
    ],
    "distractorNames": [
      "Fred Astaire",
      "Frank Sinatra",
      "Audrey Hepburn",
      "Grace Kelly"
    ],
    "youtubeClips": [
      {
        "videoId": "D-NJHUasYVA",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Park Circus",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiell Park Circus-trailer (rättighetsdistributör), ren titel."
      }
    ]
  },
  {
    "id": "patti-page-doggie-in-the-window",
    "displayName": "(How Much Is) That Doggie in the Window — Patti Page",
    "correctYear": 1953,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "1vqv2mq6XVBnL9tKOsMkFA",
    "youtubeClips": []
  },
  {
    "id": "bill-haley-rock-around-the-clock",
    "displayName": "Rock Around the Clock — Bill Haley & His Comets",
    "correctYear": 1954,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "25mcxIHYdrvtMRMxxo89lA",
    "youtubeClips": [
      {
        "videoId": "VsAlSuEG26A",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "OLD TAPES",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "chuck-berry-maybellene",
    "displayName": "Maybellene — Chuck Berry",
    "correctYear": 1955,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "5XrqcbaA2AE1IohXKko5WH",
    "youtubeClips": []
  },
  {
    "id": "lady-and-the-tramp",
    "displayName": "Lady and the Tramp",
    "correctYear": 1955,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
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
    "youtubeClips": [
      {
        "videoId": "SAoLpLXvGN0",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Disney UK",
        "license": "standard",
        "notes": "Disney UK officiell Blu-ray-trailer — spagetti-scen + hundar etablerade."
      }
    ]
  },
  {
    "id": "little-richard-tutti-frutti",
    "displayName": "Tutti Frutti — Little Richard",
    "correctYear": 1955,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "4eHGNIXeYaWx3V5dsaHg8c",
    "youtubeClips": [
      {
        "videoId": "eQ-U2kGDHSI",
        "startSec": 28,
        "endSec": 43,
        "channelTitle": "OLD TAPES",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "muddy-waters-mannish-boy",
    "displayName": "Mannish Boy — Muddy Waters",
    "correctYear": 1955,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "58PSYdY0GFg0LFb2PxYk4T",
    "youtubeClips": [
      {
        "videoId": "2QoBR-F3tp4",
        "startSec": 30,
        "endSec": 45,
        "license": "standard"
      },
      {
        "videoId": "r2gu3ONNx-8",
        "startSec": 6,
        "endSec": 21,
        "license": "standard"
      }
    ]
  },
  {
    "id": "elvis-presley-heartbreak-hotel",
    "displayName": "Heartbreak Hotel — Elvis Presley",
    "correctYear": 1956,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6xNwKNYZcvgV3XTIwsgNio",
    "youtubeClips": [
      {
        "videoId": "LGwO2BaDJQc",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Elvis Presley - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Refrängområde."
      }
    ]
  },
  {
    "id": "buddy-holly-thatll-be-the-day",
    "displayName": "That'll Be the Day — Buddy Holly",
    "correctYear": 1957,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4UcHTV3TjlThmMlZgOG4Kr",
    "youtubeClips": [
      {
        "videoId": "M4TfFTmITLo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Buddy Holly - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "elvis-presley-jailhouse-rock",
    "displayName": "Jailhouse Rock — Elvis Presley",
    "correctYear": 1957,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4gphxUgq0JSFv2BCLhNDiE",
    "youtubeClips": [
      {
        "videoId": "ppMZxuZ1lLg",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Elvis Presley - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Refrängområde."
      }
    ]
  },
  {
    "id": "chuck-berry-johnny-b-goode",
    "displayName": "Johnny B. Goode — Chuck Berry",
    "correctYear": 1958,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2QfiRTz5Yc8DdShCxG1tB2",
    "youtubeClips": [
      {
        "videoId": "aKCt8ssC7cs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "VisageClub80s",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "ritchie-valens-la-bamba",
    "displayName": "La Bamba — Ritchie Valens",
    "correctYear": 1958,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "2aEeghgUcnu75tzcolFMfs",
    "youtubeClips": [
      {
        "videoId": "BycLmWI97Nc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ritchie Valens - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell single-version via YouTube Topic (1958 original, ej Los Lobos/film)."
      }
    ]
  },
  {
    "id": "ray-charles-whatd-i-say",
    "displayName": "What'd I Say — Ray Charles",
    "correctYear": 1959,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5yQ9iMZXGcr5rlO4hoLsP4",
    "youtubeClips": [
      {
        "videoId": "EPLZL4s_jtI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Classic Mood Experience",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "etta-james-at-last",
    "displayName": "At Last — Etta James",
    "correctYear": 1960,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1KyKo3vuS8syPToJlR2HEh",
    "youtubeClips": [
      {
        "videoId": "cZag0E32is0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Etta James - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "everly-brothers-cathys-clown",
    "displayName": "Cathy's Clown — The Everly Brothers",
    "correctYear": 1960,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "73u7MU2IWvV1zpdcUEIjtw",
    "youtubeClips": [
      {
        "videoId": "K8fcGgmUv_w",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Everly Brothers - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "ray-charles-georgia-on-my-mind",
    "displayName": "Georgia on My Mind — Ray Charles",
    "correctYear": 1960,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "47mA6f44zxLtdATOoY7GjN",
    "youtubeClips": [
      {
        "videoId": "JJoRBtz1fHg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ray Charles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "ben-e-king-stand-by-me",
    "displayName": "Stand by Me — Ben E. King",
    "correctYear": 1961,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3SdTKo2uVsxFblQjpScoHy",
    "youtubeClips": [
      {
        "videoId": "dTd2ylacYNU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "PRIMITIV RECORD",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "west-side-story-1961",
    "displayName": "West Side Story",
    "correctYear": 1961,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "IakulTGwc0U",
        "startSec": 13,
        "endSec": 43,
        "channelTitle": "wormontheweb",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titel 'West Side Story HD Trailer' — inget ar. ANTAGET 1961 (klassikern). Om klippet ar 2021 (Spielberg): andra correctYear till 2021. Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "beach-boys-surfin-safari",
    "displayName": "Surfin' Safari — The Beach Boys",
    "correctYear": 1962,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5N7xVk1pgfPs07bBUl8Bzr",
    "youtubeClips": [
      {
        "videoId": "tMnqV26Njxo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beach Boys - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (2)."
      }
    ]
  },
  {
    "id": "beatles-she-loves-you",
    "displayName": "She Loves You — The Beatles",
    "correctYear": 1963,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5UK5Qm7khwpX3bMW8GiWda",
    "youtubeClips": [
      {
        "videoId": "nGbWU8S3vzs",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic (Remastered 2009). 'Yeah yeah yeah'-hook."
      }
    ]
  },
  {
    "id": "dusty-springfield-i-only-want-to-be-with-you",
    "displayName": "I Only Want to Be with You — Dusty Springfield",
    "correctYear": 1963,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "31A3oqQxDLdG9HRx45z62d",
    "youtubeClips": [
      {
        "videoId": "CL7t22rypew",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "themotownboy1",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "lill-babs-leva-livet",
    "displayName": "Leva livet — Lill-Babs",
    "correctYear": 1963,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6P40lE9SODIcT21NpmRd2I",
    "youtubeClips": [
      {
        "videoId": "BrYFFIESx3c",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1336)."
      }
    ]
  },
  {
    "id": "beatles-a-hard-days-night",
    "displayName": "A Hard Day's Night — The Beatles",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5J2CHimS7dWYMImCHkEFaJ",
    "youtubeClips": [
      {
        "videoId": "zx2TFk0vh1I",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "frank-sinatra-fly-me-to-the-moon",
    "displayName": "Fly Me to the Moon — Frank Sinatra",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7Ft4nK7wJdMEBrk3KChQsk",
    "youtubeClips": [
      {
        "videoId": "ZEcqHA7dbwM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Frank Sinatra - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "goldfinger-1964",
    "displayName": "Goldfinger",
    "correctYear": 1964,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "KdQoSK9wibU",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "acool3k2010",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titel 'Goldfinger Trailer' — inget ar. Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "lill-babs-letkis-jenka",
    "displayName": "Letkis-Jenka — Lill-Babs",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "0ifb42ld8ZGWoVyydt18l7",
    "youtubeClips": [
      {
        "videoId": "eMiA3xHLXVo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Lill-Babs - Topic",
        "license": "standard",
        "notes": "Officiell Topic-kanal. Studio 1964. Ersatte fan-upladdning (79kFl6Fe2fc)."
      }
    ]
  },
  {
    "id": "roy-orbison-oh-pretty-woman",
    "displayName": "Oh, Pretty Woman — Roy Orbison",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "48i055G1OT5KxGGftwFxWy",
    "youtubeClips": [
      {
        "videoId": "3KFvoDDs0XM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Roy Orbison - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "sam-cooke-a-change-is-gonna-come",
    "displayName": "A Change Is Gonna Come — Sam Cooke",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0YfOnJWqmAKaUvEL1QcNop",
    "youtubeClips": [
      {
        "videoId": "Z5zDRtEC0x0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Sam Cooke - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (Sam Cooke-originalet, ej Brian Owens-cover)."
      }
    ]
  },
  {
    "id": "beatles-help",
    "displayName": "Help! — The Beatles",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7DD7eSuYSC5xk2ArU62esN",
    "youtubeClips": [
      {
        "videoId": "MKUex3fci5c",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "beatles-yesterday",
    "displayName": "Yesterday — The Beatles",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3BQHpFgAp4l80e1XslIjNI",
    "youtubeClips": [
      {
        "videoId": "NrgmdOz227I",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "bob-dylan-like-a-rolling-stone",
    "displayName": "Like a Rolling Stone — Bob Dylan",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "35F8TRSHamjv86XEueHZ10",
    "youtubeClips": [
      {
        "videoId": "ZAigkYd0ipE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bob Dylan - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "rolling-stones-satisfaction",
    "displayName": "(I Can't Get No) Satisfaction — The Rolling Stones",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
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
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "13KF3YaPAxbOYmMhFkT9ma",
    "youtubeClips": [
      {
        "videoId": "MSSxnv1_J2g",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "The Rolling Stones - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "simon-garfunkel-sound-of-silence",
    "displayName": "The Sound of Silence — Simon & Garfunkel",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7eQUgarLukHLkZaO1mxtab",
    "youtubeClips": [
      {
        "videoId": "9O9DaZUS_EU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Simon & Garfunkel - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "the-sound-of-music-1965",
    "displayName": "The Sound of Music",
    "correctYear": 1965,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "ygyK0HStjwg",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "Park Circus",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Park Circus (rattighetsdistributor) 4K-restaurering, ingen ar-spoiler."
      }
    ]
  },
  {
    "id": "the-who-my-generation",
    "displayName": "My Generation — The Who",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "4u9f8hqstB7iITDJNzKhQx",
    "youtubeClips": [
      {
        "videoId": "qIYuXJYaZWw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Who - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "beach-boys-good-vibrations",
    "displayName": "Good Vibrations — The Beach Boys",
    "correctYear": 1966,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5t9KYe0Fhd5cW6UYT4qP8f",
    "youtubeClips": [
      {
        "videoId": "mdt0SOqPJcg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "PhilGoodFactor1",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "nancy-sinatra-these-boots-are-made-for-walkin",
    "displayName": "These Boots Are Made for Walkin' — Nancy Sinatra",
    "correctYear": 1966,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2nwCO1PqpvyoFIvq3Vrj8N",
    "youtubeClips": [
      {
        "videoId": "9Qp_SrTgBBs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "NancySinatraVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\". correctYear 1966 enligt MusicBrainz tidigaste release + albumet Boots (mars 1966)."
      }
    ]
  },
  {
    "id": "rolling-stones-paint-it-black",
    "displayName": "Paint It Black — The Rolling Stones",
    "correctYear": 1966,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "63T7DJ1AFDD6Bn8VzG6JE8",
    "youtubeClips": [
      {
        "videoId": "170sceOWWXc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Rolling Stones - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "the-good-the-bad-and-the-ugly-1966",
    "displayName": "The Good, the Bad and the Ugly",
    "correctYear": 1966,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Clint Eastwood"
    ],
    "distractorNames": [
      "Charles Bronson",
      "Steve McQueen",
      "Lee Marvin",
      "Yul Brynner"
    ],
    "youtubeClips": [
      {
        "videoId": "WCN5JJY_wiA",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Videotiteln lyder '... Official Trailer #1 - Clint Eastwood Movie (1966) HD'. Peter bedömde 2026-08-13 att slutet av titelraden inte hinner läsas i spelaren och BEHÖLL klippet medvetet — flagga inte om som spoiler. OBS att det som står där är rätt SKÅDESPELARE (frågan är actor-select, svaret = Clint Eastwood), inte bara årtalet. Vill man ta bort risken utan att byta klipp: sätt correctNames till Eli Wallach / Lee Van Cleef (också huvudroller, står inte i titeln)."
      }
    ]
  },
  {
    "id": "aretha-franklin-respect",
    "displayName": "Respect — Aretha Franklin",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2i59vRli0cjYCaINsv52gI",
    "youtubeClips": [
      {
        "videoId": "9iayJ8u4Qew",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Aretha Franklin - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "beatles-all-you-need-is-love",
    "displayName": "All You Need Is Love — The Beatles",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3oGGipilQmZTol8qFTR6u1",
    "youtubeClips": [
      {
        "videoId": "Mki34tyoCp0",
        "startSec": 8,
        "endSec": 23,
        "license": "standard"
      },
      {
        "videoId": "sHBOM8m4ygM",
        "startSec": 8,
        "endSec": 23,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jimi-hendrix-purple-haze",
    "displayName": "Purple Haze — Jimi Hendrix",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "6Thhmf7eaJ5AVZg9ptZ5Vb",
    "youtubeClips": [
      {
        "videoId": "cbG7HEEPE1o",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Jimi Hendrix - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "lill-lindfors-en-san-karl",
    "displayName": "En sån karl — Lill Lindfors",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "0S1nTYJUNSKpuJkkG4gucV",
    "youtubeClips": [
      {
        "videoId": "cJ1-WZQvBSM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Lennart Ljung Music",
        "license": "standard",
        "notes": "Studio-inspelning 1967. Ersatte dead UMG-klipp (T1FKf-JZ-eM)."
      }
    ]
  },
  {
    "id": "marvin-gaye-tammi-terrell-aint-no-mountain-high-enough",
    "displayName": "Ain't No Mountain High Enough — Marvin Gaye & Tammi Terrell",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7tqhbajSfrz2F7E1Z75ASX",
    "youtubeClips": [
      {
        "videoId": "IC5PL0XImjw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Doc Rudy | Soul Studios",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "neil-diamond-girl-youll-be-a-woman-soon",
    "displayName": "Girl, You'll Be a Woman Soon — Neil Diamond",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1BmVQ5RGqqtF5cnsv6cQYu",
    "youtubeClips": [
      {
        "videoId": "qGvMjgLXBi0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Neil Diamond",
        "license": "standard",
        "notes": "Neil Diamond - Girl You'll Be a Woman Soon (1967)."
      }
    ]
  },
  {
    "id": "sven-ingvars-jag-ringer-pa-fredag",
    "displayName": "Jag ringer på fredag — Sven-Ingvars",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Dansband",
      "100% in swedish"
    ],
    "spotifyTrackId": "19vrvFgXDghcRpCf5zrbFA",
    "youtubeClips": [
      {
        "videoId": "fxG0Gu9stiI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Sven Ingvars - Topic",
        "license": "standard",
        "notes": "Officiell Topic-kanal. Studio 1967. Ersatte fan-uppladdning (z0CDj6vwQ5s)."
      }
    ]
  },
  {
    "id": "the-doors-light-my-fire",
    "displayName": "Light My Fire — The Doors",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7KU0iqhqwdkqVfRIQ0b2Hr",
    "youtubeClips": [
      {
        "videoId": "qoX6AKuYWL8",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "The Doors - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "beatles-hey-jude",
    "displayName": "Hey Jude — The Beatles",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0aym2LBJBk9DAYuHHutrIl",
    "youtubeClips": [
      {
        "videoId": "mQER0A0ej0M",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic (Remastered 2015). Opening 'Hey Jude'-hook."
      }
    ]
  },
  {
    "id": "dusty-springfield-son-of-a-preacher-man",
    "displayName": "Son of a Preacher Man — Dusty Springfield",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7odHgoLFi3GQ90E9PeraI3",
    "youtubeClips": [
      {
        "videoId": "b4pYANUAJAI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "The Ed Sullivan Show",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "jimi-hendrix-all-along-the-watchtower",
    "displayName": "All Along the Watchtower — Jimi Hendrix",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2aoo2jlRnM3A0NyLQqMN2f",
    "youtubeClips": [
      {
        "videoId": "vBjzAdpZzf0",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1298)."
      }
    ]
  },
  {
    "id": "simon-garfunkel-mrs-robinson",
    "displayName": "Mrs. Robinson — Simon & Garfunkel",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3CJ60azPXtva8OdBsxSA7a",
    "youtubeClips": [
      {
        "videoId": "zJ_C0hk_pkE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Simon & Garfunkel - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "steppenwolf-born-to-be-wild",
    "displayName": "Born to Be Wild — Steppenwolf",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0bsoiyh1eNoWTN9qQVFnNz",
    "youtubeClips": [
      {
        "videoId": "igvP806798U",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Steppenwolf - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "archies-sugar-sugar",
    "displayName": "Sugar, Sugar — The Archies",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2k5UXFAAwSPotZUJqtEkCA",
    "youtubeClips": [
      {
        "videoId": "C7T4aQMxTTM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Archies - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "beatles-come-together",
    "displayName": "Come Together — The Beatles",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2EqlS6tkEnglzr7tkKAAYD",
    "youtubeClips": [
      {
        "videoId": "oolpPmuK2I8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "elvis-presley-suspicious-minds",
    "displayName": "Suspicious Minds — Elvis Presley",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1H5IfYyIIAlgDX8zguUzns",
    "youtubeClips": [
      {
        "videoId": "xt8XQLvKBUs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Elvis Presley - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "led-zeppelin-whole-lotta-love",
    "displayName": "Whole Lotta Love — Led Zeppelin",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0hCB0YR03f6AmQaHbwWDe8",
    "youtubeClips": [
      {
        "videoId": "oaSk5vnAVJ8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Led Zeppelin - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "simon-garfunkel-the-boxer",
    "displayName": "The Boxer — Simon & Garfunkel",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7AmpRvsnAAT27Qvdb5a47v",
    "youtubeClips": [
      {
        "videoId": "l3LFML_pxlY",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1349)."
      }
    ]
  },
  {
    "id": "beatles-let-it-be",
    "displayName": "Let It Be — The Beatles",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7iN1s7xHE4ifF5povM6A48",
    "youtubeClips": [
      {
        "videoId": "QDYfEBY9NM4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Beatles - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "creedence-wholl-stop-the-rain",
    "displayName": "Who'll Stop the Rain — Creedence Clearwater Revival",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2ciMJGCDW70hqq18Vgui68",
    "youtubeClips": [
      {
        "videoId": "kmrwAW5-5rU",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      },
      {
        "videoId": "VMJFWiZ-bOc",
        "startSec": 12,
        "endSec": 42,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "curtis-mayfield-move-on-up",
    "displayName": "Move On Up — Curtis Mayfield",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0MHXrqn909p0LRTPsNsGEi",
    "youtubeClips": [
      {
        "videoId": "xGR9bQh-kpk",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1281)."
      }
    ]
  },
  {
    "id": "dana-all-kinds-of-everything",
    "displayName": "All Kinds of Everything — Dana",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 64,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3SRvWfTizSiBwKidBDPBgL",
    "youtubeClips": [
      {
        "videoId": "sZ8W9oOgjM4",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1970 vinnare — Irland."
      }
    ]
  },
  {
    "id": "elton-john-your-song",
    "displayName": "Your Song — Elton John",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "38zsOOcu31XbbYj9BIPUF1",
    "youtubeClips": [
      {
        "videoId": "FT3D1Cu6g10",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Elton John - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "free-all-right-now",
    "displayName": "All Right Now — Free",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "5LhryRI5AIVKpYxLfXq4iP",
    "youtubeClips": [
      {
        "videoId": "5wiF6b4rxno",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1360)."
      }
    ]
  },
  {
    "id": "jackson-5-i-ll-be-there",
    "displayName": "I´ll be there — Jackson 5",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5RdhBLmB4DyFHLglRrfx63",
    "youtubeClips": [
      {
        "videoId": "Xg2vMrDzoXM",
        "startSec": 10,
        "endSec": 25,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jackson-5-ill-be-there",
    "displayName": "I'll Be There — The Jackson 5",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "Xg2vMrDzoXM",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1368)."
      }
    ]
  },
  {
    "id": "mungo-jerry-in-the-summertime",
    "displayName": "In the Summertime — Mungo Jerry",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2uzlv8PjqsVvF1DhEahyhy",
    "youtubeClips": [
      {
        "videoId": "wvUQcnfwUUM",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      },
      {
        "videoId": "s_VPt7228DU",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "simon-garfunkel-bridge-over-troubled-water",
    "displayName": "Bridge Over Troubled Water — Simon & Garfunkel",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6l8EbYRtQMgKOyc1gcDHF9",
    "youtubeClips": [
      {
        "videoId": "nvF5imxSaLI",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Simon & Garfunkel - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Chorus area."
      }
    ]
  },
  {
    "id": "al-green-lets-stay-together",
    "displayName": "Let's Stay Together — Al Green",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "fNWqSez_6VA",
        "startSec": 9,
        "endSec": 39,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1355)."
      }
    ]
  },
  {
    "id": "bill-withers-aint-no-sunshine",
    "displayName": "Ain't No Sunshine — Bill Withers",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1k1Bqnv2R0uJXQN4u6LKYt",
    "youtubeClips": []
  },
  {
    "id": "don-mclean-american-pie",
    "displayName": "American Pie — Don McLean",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1fDsrQ23eTAVFElUMaf38X",
    "youtubeClips": [
      {
        "videoId": "iX_TFkut1PM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Don McLean - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "john-denver-country-roads",
    "displayName": "Take Me Home, Country Roads — John Denver",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1QbOvACeYanja5pbnJbAmk",
    "youtubeClips": [
      {
        "videoId": "uu7j_xljCRY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "john-lennon-imagine",
    "displayName": "Imagine — John Lennon",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0sKVgEEApbh4EmJJyoUmBB",
    "youtubeClips": [
      {
        "videoId": "zHxobd1WLno",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "John Lennon - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic (Ultimate Mix). Mid-song."
      }
    ]
  },
  {
    "id": "led-zeppelin-stairway-to-heaven",
    "displayName": "Stairway to Heaven — Led Zeppelin",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "0RO9W1xJoUEpq5MEelddFb",
    "youtubeClips": [
      {
        "videoId": "X791IzOwt3Q",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Led Zeppelin - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "marvin-gaye-whats-going-on",
    "displayName": "What's Going On — Marvin Gaye",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 83,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4AZJ5WTioqdmLCK1F2IFeV",
    "youtubeClips": [
      {
        "videoId": "ApthDWoPMFQ",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Marvin Gaye - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (2)."
      }
    ]
  },
  {
    "id": "severine-un-banc-un-arbre",
    "displayName": "Un banc, un arbre, une rue — Séverine",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 62,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0OInqhDtfYPcSpEQNtJx3n",
    "youtubeClips": [
      {
        "videoId": "JQUC9TycGWU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1971 vinnare — Monaco."
      }
    ]
  },
  {
    "id": "t-rex-bang-a-gong",
    "displayName": "Bang a Gong (Get It On) — T. Rex",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "Sc-OJ9DeeSc",
        "startSec": 40,
        "endSec": 70,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1371)."
      }
    ]
  },
  {
    "id": "the-who-baba-oriley",
    "displayName": "Baba O'Riley — The Who",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "Gu9HhYv0C7E",
        "startSec": 40,
        "endSec": 70,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1376)."
      }
    ]
  },
  {
    "id": "the-who-behind-blue-eyes",
    "displayName": "Behind Blue Eyes — The Who",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0cKk8BKEi7zXbdrYdyqBP5",
    "youtubeClips": [
      {
        "videoId": "uA2zODu1nJw",
        "startSec": 8,
        "endSec": 23,
        "license": "standard"
      }
    ]
  },
  {
    "id": "bill-withers-lean-on-me",
    "displayName": "Lean on Me — Bill Withers",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3M8FzayQWtkvOhqMn2V4T2",
    "youtubeClips": [
      {
        "videoId": "Nx_D0VTHBag",
        "startSec": 25,
        "endSec": 55,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1359)."
      }
    ]
  },
  {
    "id": "deep-purple-smoke-on-the-water",
    "displayName": "Smoke on the Water — Deep Purple",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 87,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "5SAUIWdZ04OxYfJFDchC7S",
    "youtubeClips": [
      {
        "videoId": "qK7j_EERgT4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Deep Purple - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (2024 remaster av 1972-originalet, ej Rock Aid Armenia-versionen)."
      }
    ]
  },
  {
    "id": "stevie-wonder-superstition",
    "displayName": "Superstition — Stevie Wonder",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1TV9qMgIML1eyznrB1d4eB",
    "youtubeClips": [
      {
        "videoId": "7_tmeHCO1IM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Weedy Weed Smoker",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "the-godfather",
    "displayName": "The Godfather",
    "correctYear": 1972,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 92,
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
    "isAnimated": false,
    "correctNames": [
      "Marlon Brando",
      "Al Pacino"
    ],
    "distractorNames": [
      "Jack Nicholson",
      "Robert Redford",
      "Dustin Hoffman",
      "Steve McQueen"
    ],
    "youtubeClips": [
      {
        "videoId": "UaVTIH8mujA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Paramount Pictures",
        "license": "standard",
        "notes": "Paramount Pictures 50th Anniversary trailer — Nino Rota theme + iconic scener. OBS: parat med 'the-godfather-1972' (Year/global, annat klipp) som lades till 2026-09-11 — detta ar Name/sweden."
      }
    ]
  },
  {
    "id": "the-godfather-1972",
    "displayName": "The Godfather",
    "correctYear": 1972,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "UJU7IoXmZ9s",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Christian J Romero",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Andra Godfather-item: detta ar Year/global, samexisterar med det befintliga 'the-godfather' (Name/sweden). Titel 'The Godfather | Modern Trailer | 4k' — inget ar. OBS: fan-gjord 'Modern Trailer' pa privat kanal (ej rattsinnehavare), takedown-risk — samma klass som citizen-kane-1941. parentControlled=true per Film.xlsx."
      }
    ]
  },
  {
    "id": "vicky-leandros-apres-toi",
    "displayName": "Après toi — Vicky Leandros",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 64,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "13tx9je0ftBgu6BKpsQDo4",
    "youtubeClips": [
      {
        "videoId": "52W1665yI1Y",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1972 vinnare — Luxemburg."
      }
    ]
  },
  {
    "id": "abba-ring-ring",
    "displayName": "Ring Ring — ABBA",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1GUpCVoNqQoriLkftXc3S3",
    "youtubeClips": [
      {
        "videoId": "TL0EoXdpOqg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ABBA",
        "license": "standard",
        "notes": "Officiell music video ℗ 1973 Polar Music International AB."
      }
    ]
  },
  {
    "id": "anne-marie-david-tu-te-reconnaitras",
    "displayName": "Tu te reconnaîtras — Anne-Marie David",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 62,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "35rWDtyBsiUbbwYkxMjSdg",
    "youtubeClips": [
      {
        "videoId": "vfgR0sXxVWA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1973 vinnare — Luxemburg."
      }
    ]
  },
  {
    "id": "billy-joel-piano-man",
    "displayName": "Piano Man — Billy Joel",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "70C4NyhjD5OZUMzvWZ3njJ",
    "youtubeClips": [
      {
        "videoId": "gxEPV4kolz0",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1347)."
      }
    ]
  },
  {
    "id": "dolly-parton-jolene",
    "displayName": "Jolene — Dolly Parton",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0PYNG70wvQ3X3fCcfDWJG6",
    "youtubeClips": [
      {
        "videoId": "SFTEfOIJkPg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Dolly Parton - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "elton-john-crocodile-rock",
    "displayName": "Crocodile Rock — Elton John",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6WCeFNVAXUtNczb7lqLiZU",
    "youtubeClips": [
      {
        "videoId": "75r0nQu-hMs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Elton John - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "lasse-berghagen-ding-dong",
    "displayName": "Ding Dong — Lasse Berghagen",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "1oS8V9VCSuF0fgLQGMKXQY",
    "youtubeClips": [
      {
        "videoId": "nSRoORVsr-Q",
        "startSec": 6,
        "endSec": 36,
        "channelTitle": "Lasse Berghagen - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. startSec 6 angiven av Peter. Ersatte uhYOEoQyqT4 vars titel 'Lasse Berghagen - Ding Dong (1973)' ar 34 tecken med aret vid 29 = spoiler."
      }
    ]
  },
  {
    "id": "roberta-flack-killing-me-softly",
    "displayName": "Killing Me Softly with His Song — Roberta Flack",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6btetw0crEcjUKlQ4RO86f",
    "youtubeClips": [
      {
        "videoId": "3r3R0lmH7OE",
        "startSec": 45,
        "endSec": 75,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1352)."
      }
    ]
  },
  {
    "id": "rolling-stones-angie",
    "displayName": "Angie — The Rolling Stones",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6EtYDiHVO8sldNucNcK8Uk",
    "youtubeClips": [
      {
        "videoId": "t1CvS7aOMa4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Rolling Stones - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "streaplers-vad-har-du-under-blusen-rut",
    "displayName": "Vad har du under blusen Rut — Streaplers",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Dansband",
      "100% in swedish"
    ],
    "spotifyTrackId": "7915ILGV5otD6Oq3rOcKBR",
    "youtubeClips": [
      {
        "videoId": "LdZuxKYJW3I",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "WM Sweden",
        "license": "standard",
        "notes": "Officiell Warner Music Sweden ℗ 1973."
      }
    ]
  },
  {
    "id": "sweet-the-ballroom-blitz",
    "displayName": "The Ballroom Blitz — Sweet",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "3Pu3IChaAoa5EjgUBv5F6x",
    "youtubeClips": [
      {
        "videoId": "co8uyTAJOew",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1356)."
      }
    ]
  },
  {
    "id": "ted-gardestad-jag-ska-fanga-en-angel",
    "displayName": "Jag ska fånga en ängel — Ted Gärdestad",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "3No0idjeViPyWDP4gh1YGo",
    "youtubeClips": []
  },
  {
    "id": "ted-gardestad-vilken-harlig-dag",
    "displayName": "Oh, vilken härlig dag — Ted Gärdestad",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "1Taqw1VEHl8Gy9qAZtRLAq",
    "youtubeClips": [
      {
        "videoId": "NcqSPjcFlXc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Ted Gärdestad - Topic",
        "license": "standard",
        "notes": "Studio-audio från officiell Topic-kanal."
      }
    ]
  },
  {
    "id": "wings-band-on-the-run",
    "displayName": "Band on the Run — Wings",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1H4idkmruFoJBg1DvUv2tY",
    "youtubeClips": [
      {
        "videoId": "__t8wKdMmIw",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1348)."
      }
    ]
  },
  {
    "id": "abba-waterloo",
    "displayName": "Waterloo — ABBA",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "3Dy4REq8O09IlgiwuHQ3sk",
    "youtubeClips": [
      {
        "videoId": "Sj_9CiNkkn4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "AbbaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Officiell musikvideo; ersatte Topic-audion 9y-8ZiAJiQo. Titeln namner inte Eurovision/artal."
      }
    ]
  },
  {
    "id": "bachman-you-aint-seen-nothin-yet",
    "displayName": "You Aint seen nothin yet — Bachman",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0HOrDVS349XFcpCYsO2hAP",
    "youtubeClips": [
      {
        "videoId": "4cia_v4vxfE",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "barry-white-youre-the-first-the-last-my-everything",
    "displayName": "You're the First, the Last, My Everything — Barry White",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "d8jgBVtkcRE",
        "startSec": 43,
        "endSec": 73,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1357)."
      }
    ]
  },
  {
    "id": "bob-marley-no-woman-no-cry",
    "displayName": "No Woman, No Cry — Bob Marley & The Wailers",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3PQLYVskjUeRmRIfECsL0X",
    "youtubeClips": [
      {
        "videoId": "TfNymCvydHc",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1343)."
      }
    ]
  },
  {
    "id": "bto-you-aint-seen-nothing-yet",
    "displayName": "You Ain't Seen Nothing Yet — Bachman-Turner Overdrive",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "4cia_v4vxfE",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1370)."
      }
    ]
  },
  {
    "id": "harry-chapin-cats-in-the-cradle",
    "displayName": "Cat's in the Cradle — Harry Chapin",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "jmhoOp2fUzg",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1353)."
      }
    ]
  },
  {
    "id": "lynyrd-skynyrd-sweet-home-alabama",
    "displayName": "Sweet Home Alabama — Lynyrd Skynyrd",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0IE26jk0uGSGWHWBM3IaUZ",
    "youtubeClips": [
      {
        "videoId": "iL-jC7XyLeo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Lynyrd Skynyrd - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "10cc-im-not-in-love",
    "displayName": "I'm Not in Love — 10cc",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "STugQ0X1NoI",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1375)."
      }
    ]
  },
  {
    "id": "abba-mamma-mia",
    "displayName": "Mamma Mia — ABBA",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2TxCwUlqaOH3TIyJqGgR91",
    "youtubeClips": [
      {
        "videoId": "KMViJKmAV4M",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "ABBA - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (ABBA studio-version, ej film-soundtrack)."
      }
    ]
  },
  {
    "id": "bjorn-skifs-michelangelo",
    "displayName": "Michelangelo — Björn Skifs",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Disco & Pop",
      "100% in swedish"
    ],
    "spotifyTrackId": "3qChO81Z9r3KDyIj4w1m4T",
    "youtubeClips": [
      {
        "videoId": "hxvDmlsjjyU",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Björn Skifs - Topic",
        "license": "standard",
        "notes": "Officiell Topic-kanal. Studio 1975. Ersatte TV-klipp (EOhBIaOt1oU)."
      }
    ]
  },
  {
    "id": "bruce-springsteen-born-to-run",
    "displayName": "Born to Run — Bruce Springsteen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6hTcuIQa0sxrrByu9wTD7s",
    "youtubeClips": [
      {
        "videoId": "Wu4_zVxmufY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bruce Springsteen - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (1975 studio-version)."
      }
    ]
  },
  {
    "id": "four-seasons-december-1963",
    "displayName": "December, 1963 (Oh, What a Night) — The Four Seasons",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "mTUhnIY3oRM",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1369)."
      }
    ]
  },
  {
    "id": "harpo-moviestar",
    "displayName": "Moviestar — Harpo",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2DtVkh5rLpwvoSqzWhTQYb",
    "youtubeClips": [
      {
        "videoId": "n6AGHnLO-VA",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jaws",
    "displayName": "Jaws",
    "correctYear": 1975,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
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
    "isAnimated": false,
    "correctNames": [
      "Roy Scheider",
      "Richard Dreyfuss"
    ],
    "distractorNames": [
      "Robert Redford",
      "Dustin Hoffman",
      "Jack Nicholson",
      "Gene Hackman"
    ],
    "youtubeClips": [
      {
        "videoId": "qCzncv0ISaE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Universal Pictures",
        "license": "standard",
        "notes": "Official Universal Pictures-klipp — 'Bigger Boat'-scenen i 4K HDR."
      }
    ]
  },
  {
    "id": "kc-sunshine-band-thats-the-way-i-like-it",
    "displayName": "That's the Way (I Like It) — KC and the Sunshine Band",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7dNVzdGL3ulYwuUrzxbn13",
    "youtubeClips": [
      {
        "videoId": "2UB8P0UImzw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "KC and the Sunshine Band - Topic",
        "license": "standard",
        "notes": "Ersatte Peters lank O0_H3F84Yjk 2026-08-14: den hade '1975' i videotiteln (= svaret), var SD och embed-blockerad i 2 regioner utan servad region. Detta ar officiell Topic-audio, HD, ren titel utan arsangivelse. OBS statisk albumkonst — byt garna till en officiell video om en oblockerad hittas."
      }
    ]
  },
  {
    "id": "lasse-berghagen-en-kvall-i-juni",
    "displayName": "En kväll i juni — Lasse Berghagen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer",
      "100% in swedish"
    ],
    "spotifyTrackId": "6xYeTISkTw4S9K9hJgr1KJ",
    "youtubeClips": [
      {
        "videoId": "RS1P0GhjmnQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Lasse Berghagen - Topic",
        "license": "standard",
        "notes": "Studio-inspelning. WM Sweden (Warner Music Sweden) officiell upload."
      }
    ]
  },
  {
    "id": "led-zeppelin-kashmir",
    "displayName": "Kashmir — Led Zeppelin",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6Vjk8MNXpQpi0F4BefdTyq",
    "youtubeClips": [
      {
        "videoId": "QGIyFpFhFII",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Led Zeppelin - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "monty-python-holy-grail-1975",
    "displayName": "Monty Python and the Holy Grail",
    "correctYear": 1975,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "67yCrKqAPQk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "HD Retro Trailers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx), bytt actor-select->timeline 2026-09-15 per uppdaterad Film.xlsx + Peters bekraftelse. ⚠ SPOILER-RISK: titeln 'Monty Python and the Holy Grail (1975) Original Trailer' innehaller aret (1975) som nu AR svaret — verifiera i spelaren om '(1975)' syns (kort titel = farlig) och byt annars till ett klipp utan aret i titeln. Fan/aggregator-kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "queen-bohemian-rhapsody",
    "displayName": "Bohemian Rhapsody — Queen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1yslmgUcM2AOkOPS4sl3QV",
    "youtubeClips": []
  },
  {
    "id": "teach-in-ding-a-dong",
    "displayName": "Ding-a-dong — Teach-In",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 65,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3ML1JVicjXbdsyYrPdfr5E",
    "youtubeClips": [
      {
        "videoId": "jqqJvMTNeq4",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1975 vinnare — Nederländerna."
      }
    ]
  },
  {
    "id": "bellamy-brothers-let-your-love-flow",
    "displayName": "Let Your Love Flow — Bellamy Brothers",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "FQQj2rQBFvA",
        "startSec": 13,
        "endSec": 43,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1346)."
      }
    ]
  },
  {
    "id": "brotherhood-of-man-save-your-kisses",
    "displayName": "Save Your Kisses for Me — Brotherhood of Man",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7EPCjGrDFizkZUkCgxZJPt",
    "youtubeClips": [
      {
        "videoId": "5yJUi6ke71I",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1976 vinnare — Storbritannien."
      }
    ]
  },
  {
    "id": "chicago-if-you-leave-me-now",
    "displayName": "If You Leave Me Now — Chicago",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0KMGxYKeUzK9wc5DZCt3HT",
    "youtubeClips": [
      {
        "videoId": "1602T9ZVPjg",
        "startSec": 9,
        "endSec": 39,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1354)."
      }
    ]
  },
  {
    "id": "dancing-queen",
    "displayName": "Dancing Queen — ABBA",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0GjEhVFGZW8afUYGChu3Rr",
    "youtubeClips": [
      {
        "videoId": "xFrGuyw1V8s",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "AbbaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Officiell Vevo-upload, HD, spelbar i SE - ersatter den region-blockerade re-uploaden."
      }
    ]
  },
  {
    "id": "eagles-hotel-california",
    "displayName": "Hotel California — Eagles",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4GkOfUKUqDDgoeiov8Uqyi",
    "youtubeClips": [
      {
        "videoId": "09839DpTctU",
        "startSec": 28,
        "endSec": 43,
        "license": "standard"
      },
      {
        "videoId": "8y7WGPWYsa0",
        "startSec": 51,
        "endSec": 66,
        "license": "standard"
      }
    ]
  },
  {
    "id": "fleetwood-mac-go-your-own-way",
    "displayName": "Go Your Own Way — Fleetwood Mac",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "15rjQH7nTcTomKwfVMd4xl",
    "youtubeClips": [
      {
        "videoId": "oiosqtFLBBA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Fleetwood Mac",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (3)."
      }
    ]
  },
  {
    "id": "rocky",
    "displayName": "Rocky",
    "correctYear": 1976,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 92,
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
    "genrePackages": [
      "sport"
    ],
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Sylvester Stallone"
    ],
    "distractorNames": [
      "Burt Reynolds",
      "Steve McQueen",
      "James Caan",
      "Gene Hackman"
    ],
    "youtubeClips": [
      {
        "videoId": "-Hk-LYcavrw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Amazon MGM Studios",
        "license": "standard",
        "notes": "MGM Official trailer — Bill Conti's Gonna Fly Now-tema + training-montage."
      }
    ]
  },
  {
    "id": "taxi-driver-1976",
    "displayName": "Taxi Driver",
    "correctYear": 1976,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "oTbYR-ETFBQ",
        "startSec": 38,
        "endSec": 68,
        "channelTitle": "Wiziwiz",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titel 'TAXI DRIVER in 4K Trailer - Robert De Niro' — inget ar (namner skadespelare, ok for Year-fraga). Taxi Driver ar en R-vald valdsfilm; overvag parentControlled (ej markt av Peter). Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "the-bellamy-brothers-let-your-love-flow",
    "displayName": "Let Your Love flow — The bellamy brothers",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "064SVQsmWl5EF0zahmzkQk",
    "youtubeClips": [
      {
        "videoId": "FQQj2rQBFvA",
        "startSec": 13,
        "endSec": 28,
        "license": "standard"
      }
    ]
  },
  {
    "id": "wild-cherry-play-that-funky-music",
    "displayName": "Play That Funky Music — Wild Cherry",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5uuJruktM9fMdN9Va0DUMl",
    "youtubeClips": [
      {
        "videoId": "BHcYFxU4fMo",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1350)."
      }
    ]
  },
  {
    "id": "abba-take-a-chance-on-me",
    "displayName": "Take a Chance on Me — ABBA",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6vQN2a9QSgWcm74KEZYfDL",
    "youtubeClips": [
      {
        "videoId": "-crgQGdpZR0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "AbbaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 1977 = albumet ABBA: The Album (12 dec 1977), verifierat mot MusicBrainz. Singeln kom 14 jan 1978 - GRANSFALL, manga spelare gissar 1978."
      }
    ]
  },
  {
    "id": "bee-gees-night-fever",
    "displayName": "Night Fever — Bee Gees",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5KgbyD2lQQlIupAaPjgiXg",
    "youtubeClips": [
      {
        "videoId": "-ihs-vT9T3Q",
        "startSec": 18,
        "endSec": 48,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1366)."
      }
    ]
  },
  {
    "id": "bee-gees-stayin-alive",
    "displayName": "Stayin' Alive — Bee Gees",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4UDmDIqJIbrW0hMBQMFOsM",
    "youtubeClips": [
      {
        "videoId": "I_izvAbhExY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "beegees",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "boney-m-ma-baker",
    "displayName": "Ma Baker — Boney M.",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1BqnZOkYJbvYLOhN0qPJDm",
    "youtubeClips": [
      {
        "videoId": "Czhn1ZuhsMg",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Harry22",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. OBS: privat re-upload av musikvideon — ej rättsinnehavare. Spelbar i SE 2026-08-12; takedown-risk kvarstår."
      }
    ]
  },
  {
    "id": "bonnie-tyler-its-a-heartache",
    "displayName": "It's a Heartache — Bonnie Tyler",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1Y7VG310Lf5IYP7sVOob4X",
    "youtubeClips": [
      {
        "videoId": "bEOl38y8Nj8",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      },
      {
        "videoId": "87PPOZUxEu8",
        "startSec": 8,
        "endSec": 23,
        "license": "standard"
      }
    ]
  },
  {
    "id": "commodores-easy",
    "displayName": "Easy — Commodores",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1DnSZ9M8uvX0UebR3dmBNI",
    "youtubeClips": [
      {
        "videoId": "3woUYuyLsaI",
        "startSec": 14,
        "endSec": 44,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1363)."
      }
    ]
  },
  {
    "id": "david-bowie-heroes",
    "displayName": "Heroes — David Bowie",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0dnL9tw2iu5Aqt7mw6alif",
    "youtubeClips": [
      {
        "videoId": "lXgkuM2NhYI",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1377)."
      }
    ]
  },
  {
    "id": "fleetwood-mac-dont-stop",
    "displayName": "Don't Stop — Fleetwood Mac",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4SXU3lUZ1eb4JWWbkQw43Y",
    "youtubeClips": [
      {
        "videoId": "QV9JJmSCiI8",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1358)."
      }
    ]
  },
  {
    "id": "fleetwood-mac-dreams",
    "displayName": "Dreams — Fleetwood Mac",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "51LY0VVo4mu1Q8HpkAldQZ",
    "youtubeClips": [
      {
        "videoId": "5oWyMakvQew",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "FLEETWOOD MAC - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      },
      {
        "videoId": "Y3ywicffOj4",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1364) - alternativ officiell MV."
      }
    ]
  },
  {
    "id": "marie-myriam-loiseau-et-lenfant",
    "displayName": "L'Oiseau et l'Enfant — Marie Myriam",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 62,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2MZCRZdxceRSENgBDMIhWO",
    "youtubeClips": [
      {
        "videoId": "bybdhTg_g20",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1977 vinnare — Frankrike."
      }
    ]
  },
  {
    "id": "queen-we-are-the-champions",
    "displayName": "We Are the Champions — Queen",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "4kzvAGJirpZ9ethvKZdJtg",
    "youtubeClips": [
      {
        "videoId": "04854XqcfCY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Queen Official",
        "license": "standard",
        "notes": "Bytt 2026-08-10: gamla klippet (lxHuY6DgSJQ, Queen - Topic) hade allow-list utan SE → 'Video unavailable' i Sverige. Officiell remaster från rättsinnehavarens kanal, HD, blockerad enbart i RU."
      }
    ]
  },
  {
    "id": "queen-we-will-rock-you",
    "displayName": "We Will Rock You — Queen",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "0a9sd6MEXZXIPHk0fAxpZ4",
    "youtubeClips": [
      {
        "videoId": "-tJYN-eG1zk",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Queen Official",
        "license": "standard",
        "notes": "Bytt 2026-08-10: gamla klippet (vDRVTnbuGec, Queen - Topic) hade allow-list utan SE → 'Video unavailable' i Sverige. Officiell video. SD valdes MEDVETET framför HD-remastern (ipDEXJHEfTI) vars titel lyder '1978 Edit' — årtal i titelraden spoilar/vilseleder en Year-fråga (rätt svar är 1977)."
      }
    ]
  },
  {
    "id": "star-wars-new-hope",
    "displayName": "Star Wars: A New Hope",
    "correctYear": 1977,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 95,
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
    "isAnimated": false,
    "correctNames": [
      "Mark Hamill",
      "Harrison Ford"
    ],
    "distractorNames": [
      "Donald Sutherland",
      "Jack Nicholson",
      "Robert Redford",
      "Warren Beatty"
    ],
    "youtubeClips": [
      {
        "videoId": "vZ734NWnAHA",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Star Wars",
        "license": "standard",
        "notes": "Official Star Wars channel — A New Hope trailer. John Williams theme."
      }
    ]
  },
  {
    "id": "blondie-heart-of-glass",
    "displayName": "Heart of Glass — Blondie",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1R3jOrEeHThzcuMBWVWxUc",
    "youtubeClips": [
      {
        "videoId": "WGU_4-5RaxU",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 ur hans 80-talsspellista. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "chic-le-freak",
    "displayName": "Le Freak — Chic",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7z3aH1QV2zwMKXxShBNOGe",
    "youtubeClips": [
      {
        "videoId": "aXgSHL7efKg",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "RHINO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella musikvideon (RHINO = rattsinnehavare). startSec 2 angiven av Peter."
      },
      {
        "videoId": "4jEgM53SRbI",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "Justified Melody",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Lyrics. startSec 4 angiven av Peter. Peters egna 3Mdh3IrLV0c gick INTE att badda in (embeddable=false)."
      }
    ]
  },
  {
    "id": "earth-wind-and-fire-september",
    "displayName": "September — Earth, Wind & Fire",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2grjqo0Frpf2okIBiifQKs",
    "youtubeClips": [
      {
        "videoId": "aqZxIL4YE2I",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. 7clouds lyric-video — katalogens standard-lyric-kanal (samma som Toto/Africa och GNR)."
      }
    ]
  },
  {
    "id": "gloria-gaynor-i-will-survive",
    "displayName": "I Will Survive — Gloria Gaynor",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7rIovIsXE6kMn629b7kDig",
    "youtubeClips": [
      {
        "videoId": "TPpfSp40qy0",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1403)."
      }
    ]
  },
  {
    "id": "grease-1978",
    "displayName": "Grease",
    "correctYear": 1978,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 88,
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
    "isAnimated": false,
    "correctNames": [
      "John Travolta",
      "Olivia Newton-John"
    ],
    "distractorNames": [
      "Elvis Presley",
      "Burt Reynolds",
      "Farrah Fawcett",
      "Brooke Shields"
    ],
    "youtubeClips": [
      {
        "videoId": "ZW0DfsCzfq4",
        "startSec": 0,
        "endSec": 20,
        "channelTitle": "Kurt Harmsworth",
        "license": "standard",
        "notes": "Summer Nights-scen med Travolta + Newton-John — ikonisk strandbild."
      }
    ]
  },
  {
    "id": "izhar-cohen-a-ba-ni-bi",
    "displayName": "A-Ba-Ni-Bi — Izhar Cohen & The Alphabeta",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 66,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6iPPMcTdZF4GaCtxOP39p8",
    "youtubeClips": [
      {
        "videoId": "uFd5nk2sXow",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1978 vinnare — Israel."
      }
    ]
  },
  {
    "id": "police-roxanne",
    "displayName": "Roxanne — The Police",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0SYRVn2YF7HBscQEmlkpTI",
    "youtubeClips": [
      {
        "videoId": "Cdu3a2arXdw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Police - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "queen-dont-stop-me-now",
    "displayName": "Don't Stop Me Now — Queen",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "youtubeClips": [
      {
        "videoId": "EIv6_yh7p7w",
        "startSec": 4,
        "endSec": 34,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1374)."
      }
    ]
  },
  {
    "id": "rod-stewart-da-ya-think-im-sexy",
    "displayName": "Da Ya Think I'm Sexy? — Rod Stewart",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3wsPg2KrRYZFi0inIFa41x",
    "youtubeClips": [
      {
        "videoId": "Hphwfq1wLJs",
        "startSec": 1,
        "endSec": 31,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1361) - YouTube-kalla tillagd (var Spotify-only)."
      }
    ]
  },
  {
    "id": "travolta-newton-john-youre-the-one-that-i-want",
    "displayName": "You're the One That I Want — John Travolta & Olivia Newton-John",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "0B9x2BRHqj3Qer7biM3pU3",
    "youtubeClips": [
      {
        "videoId": "vcseNcBgH5I",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Miguel Aching",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 20. Videotitel verifierad: 'You're The One That I Want (From \"Grease\") · John Travolta · Olivia Newton (REAL 4K)' — inget ar i titeln. Filmscenen dar artisterna framfor sin EGEN lat, godkant per R1-policyn for pre-MTV-era."
      }
    ]
  },
  {
    "id": "village-people-ymca",
    "displayName": "Y.M.C.A. — Village People",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "54OR1VDpfkBuOY5zZjhZAY",
    "youtubeClips": [
      {
        "videoId": "CS9OO0S5w2k",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Village People",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-30 (ersatte fvzs2ozG-mc)."
      }
    ]
  },
  {
    "id": "abba-gimme-gimme-gimme",
    "displayName": "Gimme! Gimme! Gimme! (A Man After Midnight) — ABBA",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2PHcsDaj1v2YTVnGatoyxV",
    "youtubeClips": [
      {
        "videoId": "XEjLoHdbVeE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "AbbaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "acdc-highway-to-hell",
    "displayName": "Highway to Hell — AC/DC",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2zYzyRzz6pRmhPzyfMEC8s",
    "youtubeClips": [
      {
        "videoId": "ikFFVfObwss",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "AC/DC - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "bette-midler-the-rose",
    "displayName": "The Rose — Bette Midler",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "23X72rSGy4hhU57QodGk2P",
    "youtubeClips": [
      {
        "videoId": "jxvPjuREDpE",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "chic-good-times",
    "displayName": "Good Times — Chic",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5k99OoVceoXDMbAU8HnPH7",
    "youtubeClips": [
      {
        "videoId": "8lCNzQ6sYxo",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1365)."
      }
    ]
  },
  {
    "id": "milk-and-honey-hallelujah",
    "displayName": "Hallelujah — Milk & Honey",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5zFxBmlSLduUJbdGFVnZvz",
    "youtubeClips": [
      {
        "videoId": "vvmHIhhlzOA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1979 vinnare — Israel."
      }
    ]
  },
  {
    "id": "pink-floyd-another-brick-in-the-wall",
    "displayName": "Another Brick in the Wall (Part 2) — Pink Floyd",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "youtubeClips": [
      {
        "videoId": "HrxX9TBj2zY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1373)."
      }
    ]
  },
  {
    "id": "secret-service-oh-susie",
    "displayName": "Oh Susie — Secret service",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7EFdBb3ao46AI9h9nhzLo1",
    "youtubeClips": []
  },
  {
    "id": "sugarhill-gang-rappers-delight",
    "displayName": "Rapper's Delight — Sugarhill Gang",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "2XbwFs07dfm2MGQuYmRMZT",
    "youtubeClips": [
      {
        "videoId": "H8yUxDOHlh8",
        "startSec": 15,
        "endSec": 30,
        "license": "standard"
      },
      {
        "videoId": "WjE4Vxe5-Ak",
        "startSec": 35,
        "endSec": 50,
        "license": "standard"
      }
    ]
  },
  {
    "id": "supertramp-the-logical-song",
    "displayName": "The Logical Song — Supertramp",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2mJWtE3ViYUs8qalVAMveI",
    "youtubeClips": [
      {
        "videoId": "kln_bIndDJg",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1351)."
      }
    ]
  },
  {
    "id": "vikingarna-djingis-kan",
    "displayName": "Djingis Kan — Vikingarna",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2BVoNm43uY07T5JKI2SjCW",
    "youtubeClips": [
      {
        "videoId": "JPpB1iaDmaw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Vikinger - Topic",
        "license": "standard",
        "notes": "Officiell Topic-kanal. Studio 1979. Ersatte blockerat klipp (HRn0KKd03uk)."
      }
    ]
  },
  {
    "id": "abba-the-winner-takes-it-all",
    "displayName": "The Winner Takes It All — ABBA",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "52ltrLJeVq9W1ARm4Biept",
    "youtubeClips": [
      {
        "videoId": "92cwKCU8Z5c",
        "startSec": 35,
        "endSec": 50,
        "license": "standard"
      }
    ]
  },
  {
    "id": "bob-marley-could-you-be-loved",
    "displayName": "Could You Be Loved — Bob Marley",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5O4erNlJ74PIF6kGol1ZrC",
    "youtubeClips": [
      {
        "videoId": "1ti2YCFgCoI",
        "startSec": 4,
        "endSec": 34,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1344)."
      }
    ]
  },
  {
    "id": "bruce-springsteen-the-river",
    "displayName": "The River — Bruce Springsteen",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7HrzErXq3TsKOY1gmdIShB",
    "youtubeClips": [
      {
        "videoId": "_Jw8P7gHxzI",
        "startSec": 15,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "diana-ross-upside-down",
    "displayName": "Upside Down — Diana Ross",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3pbtBomO4Zt5gGiqsYeiBH",
    "youtubeClips": [
      {
        "videoId": "Po0BbGMSX4g",
        "startSec": 19,
        "endSec": 49,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1402)."
      }
    ]
  },
  {
    "id": "george-benson-give-me-the-night",
    "displayName": "Give Me the Night — George Benson",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "62GYoGszQfROZswLee6W3O",
    "youtubeClips": [
      {
        "videoId": "FIF7wKJb2iU",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 ur hans 80-talsspellista. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "johnny-logan-whats-another-year",
    "displayName": "What's Another Year — Johnny Logan",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "51hipIpHYmj2Qh2tyQ32h6",
    "youtubeClips": [
      {
        "videoId": "R7k1DH71bO8",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1980 vinnare — Irland."
      }
    ]
  },
  {
    "id": "queen-another-one-bites-the-dust",
    "displayName": "Another One Bites the Dust — Queen",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "5HkFTCxSeJ3kGNyQJbT4rJ",
    "youtubeClips": [
      {
        "videoId": "rY0WxgSXdEE",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Queen Official",
        "license": "standard",
        "notes": "Bytt 2026-08-10: gamla klippet (Y09uL2qbYCg, Queen - Topic) hade allow-list utan SE → 'Video unavailable' i Sverige. Officiell remaster från rättsinnehavarens kanal, HD, blockerad enbart i RU."
      }
    ]
  },
  {
    "id": "raging-bull-1980",
    "displayName": "Raging Bull",
    "correctYear": 1980,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 84,
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
    "genrePackages": [
      "sport"
    ],
    "isAnimated": false,
    "correctNames": [
      "Robert De Niro"
    ],
    "distractorNames": [
      "Sylvester Stallone",
      "Jack Nicholson",
      "Burt Reynolds",
      "Jon Voight"
    ],
    "youtubeClips": [
      {
        "videoId": "F2UKuKxCJqc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Amazon MGM Studios",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (13)."
      }
    ]
  },
  {
    "id": "sallskapsresan",
    "displayName": "Sällskapsresan",
    "correctYear": 1980,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 95,
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
    "isAnimated": false,
    "correctNames": [
      "Lasse Åberg"
    ],
    "distractorNames": [
      "Stig Grybe",
      "Magnus Härenstam",
      "Gösta Ekman",
      "Björn Skifs",
      "Per Oscarsson"
    ],
    "youtubeClips": [
      {
        "videoId": "3WD7f7pvoSY",
        "startSec": 10,
        "endSec": 45,
        "channelTitle": "HD Retro Trailers",
        "license": "standard",
        "notes": "HD originaltrailer. Uno Svenningsson + Lasse Åberg ikonisk öppning."
      }
    ]
  },
  {
    "id": "star-wars-empire-strikes-back-1980",
    "displayName": "Star Wars: The Empire Strikes Back",
    "correctYear": 1980,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Mark Hamill",
      "Harrison Ford"
    ],
    "distractorNames": [
      "Kurt Russell",
      "Christopher Reeve",
      "Michael Douglas",
      "Richard Dreyfuss"
    ],
    "youtubeClips": [
      {
        "videoId": "JNwNXF9Y6kY",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Star Wars",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiella Star Wars-kanalen, ren titel utan skådespelar- eller års-spoiler."
      }
    ]
  },
  {
    "id": "tomas-ledin-just-nu",
    "displayName": "Just nu! — Tomas Ledin",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "2Hx61KuedgBKOaJ1GfflJe",
    "youtubeClips": [
      {
        "videoId": "dhR1ZR0r-kw",
        "startSec": 0,
        "endSec": 20,
        "channelTitle": "Tomas Ledin - Topic",
        "license": "standard",
        "notes": "Officiell studio-audio (Topic). Titeln avslöjar inte årtalet."
      },
      {
        "videoId": "BK1FPU797_E",
        "startSec": 0,
        "endSec": 20,
        "channelTitle": "Tomas Ledin - Topic",
        "license": "standard",
        "notes": "Officiell studio-audio (Topic). Titeln avslöjar inte årtalet."
      }
    ]
  },
  {
    "id": "bjorn-skifs-fangad-i-en-drom",
    "displayName": "Fångad i en dröm — Björn Skifs",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "100% in swedish",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "5Vu25xkAIliFJTMpkXHPGh",
    "youtubeClips": [
      {
        "videoId": "LvbW7lWZbVo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "SchlagerArchive",
        "license": "standard",
        "notes": "Melodifestivalen 1981 vinnare."
      }
    ]
  },
  {
    "id": "bucks-fizz-making-your-mind-up",
    "displayName": "Making Your Mind Up — Bucks Fizz",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "spotifyTrackId": "0ykwJ4eZV5BudRtBaM2CUG",
    "youtubeClips": [
      {
        "videoId": "DszqGGSY4oo",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1981 vinnare — Storbritannien."
      }
    ]
  },
  {
    "id": "gota-kanal",
    "displayName": "Göta kanal — eller vem drog ur proppen?",
    "correctYear": 1981,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "isAnimated": false,
    "correctNames": [
      "Janne Carlsson"
    ],
    "distractorNames": [
      "Lasse Åberg",
      "Stig Grybe",
      "Gösta Ekman",
      "Allan Edwall"
    ],
    "youtubeClips": [
      {
        "videoId": "qx7zpGYSm0s",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "NjutafilmsStudioS",
        "license": "standard",
        "notes": "Officiell NjutaFilms-trailer. Karaktärerna + kanalscenerna väl representerade."
      }
    ]
  },
  {
    "id": "human-league-dont-you-want-me",
    "displayName": "Don't You Want Me — The Human League",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "59GNFIvgMlkidU3BuLVrni",
    "youtubeClips": [
      {
        "videoId": "8fKR23rWI6g",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "indiana-jones-raiders",
    "displayName": "Indiana Jones: Raiders of the Lost Ark",
    "correctYear": 1981,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 92,
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
    "youtubeClips": [
      {
        "videoId": "0xQSIdSRlAk",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Paramount Movies",
        "license": "standard",
        "notes": "Official Paramount Movies trailer. Raiders March-theme + boulder-scen."
      }
    ]
  },
  {
    "id": "journey-dont-stop-believin",
    "displayName": "Don't Stop Believin' — Journey",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4bHsxqR3GMrXTxEPLuK5ue",
    "youtubeClips": [
      {
        "videoId": "PIFUWHvSixw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Journey - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (1981 studio)."
      }
    ]
  },
  {
    "id": "kim-carnes-bette-davis-eyes",
    "displayName": "Bette Davis Eyes — Kim Carnes",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0odIT9B9BvOCnXfS0e4lB5",
    "youtubeClips": [
      {
        "videoId": "jIG9whz2oxY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "men-at-work-down-under",
    "displayName": "Down Under — Men at Work",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "46RVKt5Edm1zl0rXhPJZxz",
    "youtubeClips": [
      {
        "videoId": "XfR9iY5y94s",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MenAtWorkVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 1981 = Columbia-inspelningen (albumet Business as Usual). RATTA INTE till 1980: bandet sjalvslappte en ANNAN inspelning 1980 som B-sida (langsammare tempo, annat arr) - klippet ar 1981-versionen, och itemet ar inspelningen."
      }
    ]
  },
  {
    "id": "phil-collins-in-the-air-tonight",
    "displayName": "In the Air Tonight — Phil Collins",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7Dbg5O9nNWu6SWxDjJ9qoq",
    "youtubeClips": [
      {
        "videoId": "YkADj0TPrJA",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14, startSec angiven av Peter. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "ted-gardestad-lat-karleken-sla-rot",
    "displayName": "Låt kärleken slå rot — Ted Gärdestad",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2FuazTK4ewgx5QytkCjotZ",
    "youtubeClips": [
      {
        "videoId": "u4ucz96rbMA",
        "startSec": 55,
        "endSec": 85,
        "channelTitle": "Ted Gärdestad - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). xlsx saknade YT-lank; officiell Topic-audio uppsokt. correctYear 1981 enligt MusicBrainz."
      }
    ]
  },
  {
    "id": "blade-runner-1982",
    "displayName": "Blade Runner",
    "correctYear": 1982,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "kTaewJomjAo",
        "startSec": 60,
        "endSec": 90,
        "channelTitle": "GameSpot Universe Trailers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Klippet ar 'The Final Cut' (2007 restaurering) men correctYear=1982 = originalfilmen per ar-policy. Titeln namner skadespelare men inte aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "chips-dag-efter-dag",
    "displayName": "Dag efter dag — Chips",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "4aJ1AoiwjzsOxWqabRTJd3",
    "youtubeClips": [
      {
        "videoId": "tUE0zbkmv0Q",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Zoinks Scoob",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-29. Ersatte d-ghe23_uwI. Titeln avslöjar inte årtalet."
      }
    ]
  },
  {
    "id": "e-t-the-extra-terrestrial",
    "displayName": "E.T. the Extra-Terrestrial",
    "correctYear": 1982,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 92,
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
    "youtubeClips": [
      {
        "videoId": "2tK7AMgLvv0",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "IMAX",
        "license": "standard",
        "notes": "IMAX official trailer — John Williams theme + iconic bicycle/moon-scen."
      }
    ]
  },
  {
    "id": "friday-i-know-something-going-on",
    "displayName": "I know something going on — Friday",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6CT0MVgHnoAUXrSrnlwfWx",
    "youtubeClips": []
  },
  {
    "id": "marvin-gaye-sexual-healing",
    "displayName": "Sexual Healing — Marvin Gaye",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2KD51eSOPiXykunBhw5FZh",
    "youtubeClips": [
      {
        "videoId": "9LxPoJ4QoSk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Marvin Gaye - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "michael-jackson-beat-it",
    "displayName": "Beat It — Michael Jackson",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "WlTlUseVt7E",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Michael Jackson - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "michael-jackson-billie-jean",
    "displayName": "Billie Jean — Michael Jackson",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7J1uxwnxfQLu4APicE5Rnj",
    "youtubeClips": [
      {
        "videoId": "Kr4EQDVETuA",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Michael Jackson - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "nicole-ein-bisschen-frieden",
    "displayName": "Ein bißchen Frieden — Nicole",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "spotifyTrackId": "50Giaeo3ARSlfuDPpd49uR",
    "youtubeClips": [
      {
        "videoId": "hp_b-095yPc",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1982 vinnare — Tyskland."
      }
    ]
  },
  {
    "id": "prince-1999",
    "displayName": "1999 — Prince",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2cKIcepRj6NOc1bKGjHuSl",
    "youtubeClips": [
      {
        "videoId": "rblt2EtFfC4",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "prince-little-red-corvette",
    "displayName": "Little Red Corvette — Prince",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3315t15Sw3QTL6TDWhSM4F",
    "youtubeClips": [
      {
        "videoId": "v0KpfrJE4zw",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "survivor-eye-of-the-tiger",
    "displayName": "Eye of the Tiger — Survivor",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "2KH16WveTQWT6KOG9Rg6e2",
    "youtubeClips": [
      {
        "videoId": "YKXTSOf5SA0",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Survivor - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic Rocky-tema intro."
      }
    ]
  },
  {
    "id": "thriller",
    "displayName": "Thriller — Michael Jackson",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2LlQb7Uoj1kKyGhlkBf9aC",
    "youtubeClips": [
      {
        "videoId": "fK6tf6opIg0",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "prod. ovr",
        "license": "standard",
        "notes": "Official Shortened 4K Video — rörlig MV (zombiedans). Mid-song."
      }
    ]
  },
  {
    "id": "tomas-ledin-sommaren-ar-kort",
    "displayName": "Sommaren är kort — Tomas Ledin",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "7ky1pctLd0JGWaXjCIbbiN",
    "youtubeClips": [
      {
        "videoId": "wlhY1WEAH8U",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "apelsiiinen12",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. startSec 3 angiven av Peter. correctYear 1982 enligt MusicBrainz."
      }
    ]
  },
  {
    "id": "toto-africa",
    "displayName": "Africa — Toto",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 89,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2374M0fQpWi3dLnB54qaLX",
    "youtubeClips": [
      {
        "videoId": "U1LB_OerHCE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — 7clouds lyric-video (katalogens standard-lyric-kanal); ingen officiell Toto-upload tillgänglig i SE."
      }
    ]
  },
  {
    "id": "bananarama-cruel-summer",
    "displayName": "Cruel Summer — Bananarama",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2EGaDf0cPX789H3LNeB03D",
    "youtubeClips": [
      {
        "videoId": "l9ml3nyww80",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "billy-idol-rebel-yell",
    "displayName": "Rebel Yell — Billy Idol",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4TIJ7zSBNejpoIPaWpWRKc",
    "youtubeClips": [
      {
        "videoId": "zkTqiuNj6xI",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Austech",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Videotiteln innehåller '1983' men först långt in i raden ('Billy Idol - Rebel Yell - Official Video 1983 - 4K Remaster') — Peter bedömde 2026-08-13 att den delen inte hinner läsas i spelaren. Klippet BEHÅLLS medvetet; flagga inte om som spoiler. Privat re-upload (ej rättsinnehavare) — takedown-risk kvarstår."
      }
    ]
  },
  {
    "id": "bob-marley-buffalo-soldier",
    "displayName": "Buffalo Soldier — Bob Marley",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "7BfW1eoDh27W69nxsmRicb",
    "youtubeClips": [
      {
        "videoId": "uMUQMSXLlHM",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1343)."
      }
    ]
  },
  {
    "id": "bonnie-tyler-total-eclipse-of-the-heart",
    "displayName": "Total Eclipse of the Heart — Bonnie Tyler",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "63nyotHMEI8PrEZB2FL4DZ",
    "youtubeClips": [
      {
        "videoId": "lcOxhH8N3Bo",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "bowie-lets-dance",
    "displayName": "Let's Dance — David Bowie",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4cVHMHgmWgudD399ZdhQ3L",
    "youtubeClips": [
      {
        "videoId": "VbD_kBJc_gI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "David Bowie",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'David Bowie - Let's Dance (Official Video) [HD]' pa artistens egen kanal — inget ar i titeln. Ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "cyndi-lauper-girls-just-want-to-have-fun",
    "displayName": "Girls Just Want to Have Fun — Cyndi Lauper",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4y1LsJpmMti1PfRQV9AWWe",
    "youtubeClips": [
      {
        "videoId": "jRr5EasAq84",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Cyndi Lauper - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100). BEHÅLLET 2026-08-12: Peters förslag Q2ahfQoB9EY är en privat re-upload; Topic är rättsinnehavarens kanal."
      }
    ]
  },
  {
    "id": "donna-summer-she-works-hard-for-the-money",
    "displayName": "She Works Hard for the Money — Donna Summer",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3FlOciKDqFlTMPeC7t92Qy",
    "youtubeClips": [
      {
        "videoId": "N8EkGUm9q_A",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1332)."
      }
    ]
  },
  {
    "id": "elton-john-im-still-standing",
    "displayName": "I'm Still Standing — Elton John",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 83,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1jDJFeK9x3OZboIAHsY9k2",
    "youtubeClips": [
      {
        "videoId": "MJ_aPtt4U8M",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Elton John",
        "license": "standard",
        "notes": "Official music video."
      }
    ]
  },
  {
    "id": "eurythmics-sweet-dreams",
    "displayName": "Sweet Dreams (Are Made of This) — Eurythmics",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7Bp898e0U9IReLs2oKC7G4",
    "youtubeClips": [
      {
        "videoId": "6KR52lEWLEM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "irene-cara-flashdance-what-a-feeling",
    "displayName": "Flashdance... What a Feeling — Irene Cara",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "5EkQYd9xvBrNchHDaDSKa5",
    "youtubeClips": [
      {
        "videoId": "ILWSp0m9G2U",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "UnidiscMusic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "lionel-richie-all-night-long",
    "displayName": "All Night Long (All Night) — Lionel Richie",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4czNORk5MjW5WOn98bki32",
    "youtubeClips": [
      {
        "videoId": "nqAvFx3NxUM",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "police-every-breath-you-take",
    "displayName": "Every Breath You Take — The Police",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1JSTJqkT5qHq8MDJnJbRE1",
    "youtubeClips": [
      {
        "videoId": "LPr3N4AMXNQ",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "ThePoliceVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Officiella musikvideon — ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "rod-stewart-baby-jane",
    "displayName": "Baby Jane — Rod Stewart",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5F5SMUnFD058zo1K0DtjUq",
    "youtubeClips": [
      {
        "videoId": "TVWNiw6AoNE",
        "startSec": 16,
        "endSec": 46,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1362)."
      }
    ]
  },
  {
    "id": "rufus-chaka-khan-aint-nobody",
    "displayName": "Ain't Nobody — Rufus and Chaka Khan",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2NVpYQqdraEcQwqT7GhUkh",
    "youtubeClips": [
      {
        "videoId": "BNirQXe8HOA",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "tomas-ledin-vi-ar-pa-gang",
    "displayName": "Vi är på gång — Tomas Ledin",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0VTH9aztFu5fhpCgFY2YhK",
    "youtubeClips": [
      {
        "videoId": "z-tEuBTbobc",
        "startSec": 5,
        "endSec": 50,
        "channelTitle": "uutiiset",
        "license": "standard"
      }
    ]
  },
  {
    "id": "yes-owner-of-a-lonely-heart",
    "displayName": "Owner of a Lonely Heart — Yes",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0GTK6TesV108Jj5D3MHsYb",
    "youtubeClips": [
      {
        "videoId": "SVOuYquXuuc",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "zz-top-gimme-all-your-lovin",
    "displayName": "Gimme All Your Lovin' — ZZ Top",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "29uKzagduhFDTWPCjqaGOg",
    "youtubeClips": [
      {
        "videoId": "Ae829mFAGGE",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "bryan-adams-heaven",
    "displayName": "Heaven — Bryan Adams",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4dhPbGPssNpV6pSEtgTmO7",
    "youtubeClips": [
      {
        "videoId": "3eT464L1YRA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Bryan Adams",
        "license": "standard",
        "notes": "Officiell musikvideo, artistens egen kanal. Peter-kurerad 2026-08-11."
      }
    ]
  },
  {
    "id": "bryan-adams-summer-of-69",
    "displayName": "Summer of '69 — Bryan Adams",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0GONea6G2XdnHWjNZd6zt3",
    "youtubeClips": [
      {
        "videoId": "9f06QZCVUHg",
        "startSec": 10,
        "endSec": 55,
        "channelTitle": "Bryan Adams",
        "license": "standard"
      }
    ]
  },
  {
    "id": "foreigner-i-want-to-know-what-love-is",
    "displayName": "I Want to Know What Love Is — Foreigner",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3Y1F4btGQxxMZhlBYaLR4N",
    "youtubeClips": [
      {
        "videoId": "r3Pr1_v7hsw",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "george-michael-careless-whisper",
    "displayName": "Careless Whisper — George Michael",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4jDmJ51x1o9NZB5Nxxc7gY",
    "youtubeClips": [
      {
        "videoId": "gTwn_LoH7ig",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "George Michael - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "ghostbusters-1984",
    "displayName": "Ghostbusters",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Bill Murray",
      "Dan Aykroyd"
    ],
    "distractorNames": [
      "Eddie Murphy",
      "Chevy Chase",
      "Steve Martin",
      "John Candy"
    ],
    "youtubeClips": [
      {
        "videoId": "710w9M1n2KM",
        "startSec": 25,
        "endSec": 55,
        "channelTitle": "Cine Trailer",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titeln 'Ghostbusters 1984 Trailer 4K' innehaller aret men INTE nagon skadespelare — fr33gan ar Name (svaret = Bill Murray/Dan Aykroyd), sa aret spoilar inte. Aggregator-kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "herreys-diggiloo-diggiley",
    "displayName": "Diggi-Loo Diggi-Ley — Herreys",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "4NzirQ4BrNkVaPEla2ipG4",
    "youtubeClips": [
      {
        "videoId": "ySOCalwr6Yo",
        "startSec": 20,
        "endSec": 40,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1984 vinnare, ESC-vinnare 1984."
      }
    ]
  },
  {
    "id": "jennifer-rush-the-power-of-love",
    "displayName": "The Power of Love — Jennifer Rush",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "18DfMhEx4ddoreHrvZDF6Q",
    "youtubeClips": [
      {
        "videoId": "b_zHQ6kFuQ0",
        "startSec": 39,
        "endSec": 54,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jonssonligan-far-guldfeber",
    "displayName": "Jönssonligan får guldfeber",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 83,
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
    "isAnimated": false,
    "correctNames": [
      "Gösta Ekman"
    ],
    "distractorNames": [
      "Lasse Åberg",
      "Stig Grybe",
      "Magnus Härenstam",
      "Per Oscarsson"
    ],
    "youtubeClips": [
      {
        "videoId": "FD3jK0gWbPc",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "ZorbaMovies",
        "license": "standard",
        "notes": "Trailer. Jönssonligan-gänget tydliga."
      }
    ]
  },
  {
    "id": "laura-branigan-self-control",
    "displayName": "Self Control — Laura Branigan",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "spotifyTrackId": "6JNJERZGJwDVgkmbohBw7u",
    "youtubeClips": [
      {
        "videoId": "RP0_8J7uxhs",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14, startSec angiven av Peter. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "madonna-like-a-virgin",
    "displayName": "Like a Virgin — Madonna",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1ZPlNanZsJSPK5h9YZZFbZ",
    "youtubeClips": [
      {
        "videoId": "4u6UkngBufI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "modern-talking-youre-my-heart-youre-my-soul",
    "displayName": "You're My Heart, You're My Soul — Modern Talking",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0Zn63G0XTiqXwr1KSmARWz",
    "youtubeClips": [
      {
        "videoId": "4kHl4FoK1Ys",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ModernTalkingVEVO",
        "license": "standard",
        "notes": "Ersatte Peters lank 8ikFTY8fbwo 2026-08-14: den var '98-nyinspelningen (Ft. Eric Singleton) med \"'98\" i titeln — fel inspelning for ett 1984-svar. Detta ar originalvideon fran artistens VEVO-kanal, ingen arsangivelse i titeln."
      }
    ]
  },
  {
    "id": "prince-purple-rain",
    "displayName": "Purple Rain — Prince",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3FnP3j1TyiTwbJb5AR2ynT",
    "youtubeClips": [
      {
        "videoId": "TvnYmWpD_T8",
        "startSec": 80,
        "endSec": 110,
        "channelTitle": "Prince",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 70. Videotitel verifierad: 'Prince - Purple Rain (Official Video)' — ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "prince-when-doves-cry",
    "displayName": "When Doves Cry — Prince and the Revolution",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5aEfPt7OoJhpeeEj5MkXQ4",
    "youtubeClips": [
      {
        "videoId": "UG3VcCAlUgE",
        "startSec": 50,
        "endSec": 80,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'Prince and the Revolution - When Doves Cry (Official Music Video)' — Peter angav ingen latttitel i listan, harledd ur klippet."
      }
    ]
  },
  {
    "id": "queen-i-want-to-break-free",
    "displayName": "I Want to Break Free — Queen",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "7iAqvWLgZzXvH38lA06QZg",
    "youtubeClips": [
      {
        "videoId": "f4Mc-NYPHaQ",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "run-dmc-its-like-that",
    "displayName": "Its like that — Run DMC",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2J6QnTjHIWwXErNWyF0RUC",
    "youtubeClips": []
  },
  {
    "id": "springsteen-born-in-the-usa",
    "displayName": "Born in the U.S.A. — Bruce Springsteen",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0dOg1ySSI7NkpAe89Zo0b9",
    "youtubeClips": [
      {
        "videoId": "tRx212PUa4g",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bruce Springsteen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "springsteen-dancing-in-the-dark",
    "displayName": "Dancing in the Dark — Bruce Springsteen",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7FwBtcecmlpc1sLySPXeGE",
    "youtubeClips": [
      {
        "videoId": "nCFTL4IO6t4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bruce Springsteen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "stefan-borsch-det-ar-ju-dej",
    "displayName": "Det är ju dej jag går och väntar på — Stefan Borsch",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Dansband"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "G-YfEn-m-fE",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1415)."
      }
    ]
  },
  {
    "id": "stefan-borsch-det-ar-ju-dig-jag-gar-och-vantar-pa",
    "displayName": "Det är ju dig jag går och väntar på — Stefan Borsch",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "4gW1x4M5WTs4mACvheyKgh",
    "youtubeClips": []
  },
  {
    "id": "stevie-wonder-i-just-called",
    "displayName": "I Just Called to Say I Love You — Stevie Wonder",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2W8J9Gfw5q8tSvsuWSnMBl",
    "youtubeClips": [
      {
        "videoId": "58RgLQ_0Ars",
        "startSec": 10,
        "endSec": 55,
        "channelTitle": "Stevie Wonder - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "talk-talk-its-my-life",
    "displayName": "It's My Life — Talk Talk",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6m7fhJkK6TbuGDFhBNpgyn",
    "youtubeClips": [
      {
        "videoId": "cFH5JgyZK1I",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "the-karate-kid-1984",
    "displayName": "The Karate Kid",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "youtubeClips": [
      {
        "videoId": "bgBy0_y-Ktw",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'The Karate Kid: Crane Kick Final Fight Scene (Ralph Macchio, William Zabka)'."
      }
    ]
  },
  {
    "id": "the-terminator-1984",
    "displayName": "The Terminator",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 88,
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
    "isAnimated": false,
    "correctNames": [
      "Arnold Schwarzenegger",
      "Linda Hamilton"
    ],
    "distractorNames": [
      "Mel Gibson",
      "Tom Cruise",
      "Bruce Willis",
      "Kurt Russell"
    ],
    "youtubeClips": [
      {
        "videoId": "nGrW-OR2uDk",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Amazon MGM Studios",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell 1984-trailer (MGM)."
      }
    ]
  },
  {
    "id": "tina-turner-whats-love",
    "displayName": "What's Love Got to Do with It — Tina Turner",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3ErsOxqe2RmXkR65wkygDz",
    "youtubeClips": [
      {
        "videoId": "oGpFcHTxjZs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tina Turner",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Officiella musikvideon — ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "van-halen-jump",
    "displayName": "Jump — Van Halen",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6Fba9RZtC6vTY814JToDtP",
    "youtubeClips": [
      {
        "videoId": "SwYN7mTi6HM",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Van Halen",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiella musikvideon på bandets egen kanal."
      }
    ]
  },
  {
    "id": "wham-last-christmas",
    "displayName": "Last Christmas — Wham!",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Christmas edition"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2FRnf9qhLbvw8fu4IBXx78",
    "youtubeClips": [
      {
        "videoId": "E8gmARGvPlI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Wham!",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-30 (ersatte T0T9GyM28tg)."
      },
      {
        "videoId": "KhqNTjbQ71A",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Wham!",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-30 (ersatte T0T9GyM28tg)."
      }
    ]
  },
  {
    "id": "wham-wake-me-up-before-you-go-go",
    "displayName": "Wake Me Up Before You Go-Go — Wham!",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0ikz6tENMONtK6qGkOrU3c",
    "youtubeClips": [
      {
        "videoId": "Uj2K3rerzT4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Bad Boy Edd",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'Wham! - Wake Me Up Before You Go-Go [Official Music Video]' — inget ar i titeln. Ersatte LatinHype-uppladdningen (score 10)."
      }
    ]
  },
  {
    "id": "a-ha-take-on-me",
    "displayName": "Take on Me — a-ha",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2WfaOiMkCvy7F5fcp2zZ8L",
    "youtubeClips": [
      {
        "videoId": "djV11Xbc914",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "a-ha",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Officiella rotoscope-musikvideon på bandets egen kanal — ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "back-to-the-future",
    "displayName": "Back to the Future",
    "correctYear": 1985,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "T_WSXXPQYeY",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Universal Pictures",
        "license": "standard",
        "notes": "Official Universal Pictures-klipp — Johnny B. Goode-scenen. BEHÅLLET 2026-08-12: Peters förslag 2LnShmQ_hLc är en privat re-upload av teaser-trailern; rättsinnehavarens klipp är stabilare."
      }
    ]
  },
  {
    "id": "bobbysocks-la-det-swinge",
    "displayName": "La det swinge — Bobbysocks!",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision",
      "100% in swedish"
    ],
    "spotifyTrackId": "3IgpWvgCqZjqhsiKwzw1Q7",
    "youtubeClips": [
      {
        "videoId": "U94_AErNBZU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1985 vinnare — Norge."
      }
    ]
  },
  {
    "id": "bowie-jagger-dancing-in-the-street",
    "displayName": "Dancing in the Street — David Bowie & Mick Jagger",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6FnuMo55jNECTDdS1nD5H0",
    "youtubeClips": [
      {
        "videoId": "opRRax4ph3E",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "david-lee-roth-california-girls",
    "displayName": "California Girls — David Lee Roth",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4H3vuLX59XPqdtTpIesGyS",
    "youtubeClips": [
      {
        "videoId": "53LZ0-m-8Vg",
        "startSec": 100,
        "endSec": 130,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14, startSec angiven av Peter. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "dire-straits-walk-of-life",
    "displayName": "Walk of Life — Dire Straits",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "423o3ZHIaBtGXyhF1uH41a",
    "youtubeClips": [
      {
        "videoId": "ekXJtcxsT20",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "eddie-murphy-party-all-the-time",
    "displayName": "Party All the Time — Eddie Murphy",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6N5DRCQUSXT1qQqmqsO92B",
    "youtubeClips": [
      {
        "videoId": "loFlGLLWdp8",
        "startSec": 45,
        "endSec": 75,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14, startSec angiven av Peter. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "kate-bush-running-up-that-hill",
    "displayName": "Running Up That Hill — Kate Bush",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1PtQJZVZIdWIYdARpZRDFO",
    "youtubeClips": [
      {
        "videoId": "wp43OdtAAkM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "kikki-danielsson-bra-vibrationer",
    "displayName": "Bra vibrationer — Kikki Danielsson",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "0FSlaiuv4eBrrjz05jpxz6",
    "youtubeClips": [
      {
        "videoId": "OfVcmnxKfqc",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1985 vinnare. ESC 1985 performance."
      }
    ]
  },
  {
    "id": "madonna-into-the-groove",
    "displayName": "Into the Groove — Madonna",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2m0M7YqCy4lXfedh18qd8N",
    "youtubeClips": [
      {
        "videoId": "52iW3lcpK5M",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "pet-shop-boys-west-end-girls",
    "displayName": "West End Girls — Pet Shop Boys",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5Dqik1P9toCJTLj5rEm78s",
    "youtubeClips": [
      {
        "videoId": "p3j2NYZ8FKs",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "tina-turner-we-dont-need-another-hero",
    "displayName": "We Don't Need Another Hero (Thunderdome) — Tina Turner",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "50XXRUFNjs85P0MjCZ1c9X",
    "youtubeClips": [
      {
        "videoId": "HLBXAs2LO8k",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "#NVU Music",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "usa-for-africa-we-are-the-world",
    "displayName": "We Are the World — USA for Africa",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3Z2tPWiNiIpg8UMMoowHIk",
    "youtubeClips": [
      {
        "videoId": "_cDNhqNv2HY",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "CaptainCarlossi",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "whitney-houston-how-will-i-know",
    "displayName": "How Will I Know — Whitney Houston",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5tdKaKLnC4SgtDZ6RlWeal",
    "youtubeClips": [
      {
        "videoId": "TO-Tk84ATjw",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Accelerate",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Lyric-video på privat kanal — ej rättsinnehavare. Spelbar i SE 2026-08-12; takedown-risk kvarstår."
      }
    ]
  },
  {
    "id": "anna-book-abc",
    "displayName": "ABC — Anna Book",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2YCWUpoVclk9PFo5cDfUPU",
    "youtubeClips": [
      {
        "videoId": "VpCWux9Cjis",
        "startSec": 12,
        "endSec": 42,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1432)."
      }
    ]
  },
  {
    "id": "bon-jovi-livin-on-a-prayer",
    "displayName": "Livin' on a Prayer — Bon Jovi",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "37ZJ0p5Jm13JPevGcx4SkF",
    "youtubeClips": [
      {
        "videoId": "lDK9QqIzhwk",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "BonJoviVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12 — ersatte Topic-audion (YBdyc1WDlBQ) med officiella musikvideon på BonJoviVEVO."
      }
    ]
  },
  {
    "id": "cyndi-lauper-true-colors",
    "displayName": "True Colors — Cyndi Lauper",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2A6yzRGMgSQCUapR2ptm6A",
    "youtubeClips": [
      {
        "videoId": "LPn0KFlbqX8",
        "startSec": 10,
        "endSec": 25,
        "license": "standard"
      }
    ]
  },
  {
    "id": "europe-the-final-countdown",
    "displayName": "The Final Countdown — Europe",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "3MrRksHupTVEQ7YbA0FsZK",
    "youtubeClips": [
      {
        "videoId": "9jK-NcRmVcw",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1101)."
      }
    ]
  },
  {
    "id": "jan-hammer-crocketts-theme",
    "displayName": "Crockett's Theme — Jan Hammer",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "3TnJ7M6in8Pb5EyGBUK02Y",
    "youtubeClips": [
      {
        "videoId": "Lfgf9HatIHI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Miami Vice",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "lena-philipsson-karleken-ar-evig",
    "displayName": "Kärleken är evig — Lena Philipsson",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "6O0DtbGGeDMBSGBDhFCxrG",
    "youtubeClips": [
      {
        "videoId": "AAVd_ku3SO0",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1384)."
      }
    ]
  },
  {
    "id": "madonna-la-isla-bonita",
    "displayName": "La Isla Bonita — Madonna",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7Hh4CiqD2Qaj45Mxwm895H",
    "youtubeClips": [
      {
        "videoId": "zpzdgmqIHOQ",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "peter-cetera-glory-of-love",
    "displayName": "Glory of Love — Peter Cetera",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition",
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1eyq8cjUQ2daFthW2PC2GM",
    "youtubeClips": [
      {
        "videoId": "wktJg27TXx4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Truett Turk",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte yQHhqDRn4_c. VERIFIERA I SPELAREN: titeln ar 78 tecken med 1986 vid tecken 57 - bor kapas bort, men aret ar svaret."
      }
    ]
  },
  {
    "id": "peter-gabriel-sledgehammer",
    "displayName": "Sledgehammer — Peter Gabriel",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0PMtPzsBWS5JNxUtYH13Ol",
    "youtubeClips": [
      {
        "videoId": "OJWJE0x7T4Q",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "peter-lundblad-ta-mig-till-havet",
    "displayName": "Ta mig till havet — Peter Lundblad",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer",
      "100% in swedish"
    ],
    "spotifyTrackId": "01LWBjJwFdRSCeovqipb3D",
    "youtubeClips": [
      {
        "videoId": "gM3N67a-x1U",
        "startSec": 12,
        "endSec": 27,
        "license": "standard"
      },
      {
        "videoId": "-R4rbXlrOdI",
        "startSec": 8,
        "endSec": 23,
        "license": "standard"
      }
    ]
  },
  {
    "id": "prince-kiss",
    "displayName": "Kiss — Prince and the Revolution",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "62LJFaYihsdVrrkgUOJC05",
    "youtubeClips": [
      {
        "videoId": "H9tEvfIsDyo",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "sandra-kim-jaime-la-vie",
    "displayName": "J'aime la vie — Sandra Kim",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5opXus6JIe9UD94Qk24RYB",
    "youtubeClips": [
      {
        "videoId": "AT3c41gi3B4",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1986 vinnare — Belgien."
      }
    ]
  },
  {
    "id": "top-gun",
    "displayName": "Top Gun",
    "correctYear": 1986,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
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
    "isAnimated": false,
    "correctNames": [
      "Tom Cruise",
      "Val Kilmer"
    ],
    "distractorNames": [
      "Kevin Bacon",
      "Mel Gibson",
      "Patrick Swayze",
      "Matthew Modine"
    ],
    "youtubeClips": [
      {
        "videoId": "xa_z57UatDY",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Official 1986-trailer — Danger Zone-tema + jet-action."
      }
    ]
  },
  {
    "id": "cornelis-vreeswijk-sommarkort",
    "displayName": "Sommarkort (En stund på jorden) — Cornelis Vreeswijk",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5lRvBRQJFVWZGRqDm7YkL4",
    "youtubeClips": [
      {
        "videoId": "BqgcUydlJvg",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "def-leppard-pour-some-sugar-on-me",
    "displayName": "Pour Some Sugar on Me — Def Leppard",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1bcklQyAGzDxQiNMczMLt6",
    "youtubeClips": [
      {
        "videoId": "0UIB9Y4OFPs",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "DEF LEPPARD",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiella musikvideon på bandets egen kanal."
      }
    ]
  },
  {
    "id": "fleetwood-mac-everywhere",
    "displayName": "Everywhere — Fleetwood Mac",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "254bXAqt3zP6P50BdQvEsq",
    "youtubeClips": [
      {
        "videoId": "YF1R0hc5Q2I",
        "startSec": 17,
        "endSec": 47,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "fleetwood-mac-seven-wonders",
    "displayName": "Seven Wonders — Fleetwood Mac",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3k2ImghAf2wffEKTMVvIkc",
    "youtubeClips": [
      {
        "videoId": "9b4F_ppjnKU",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "george-harrison-got-my-mind-set-on-you",
    "displayName": "Got My Mind Set on You — George Harrison",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4wswaG5vmNINMZcVBsAyBP",
    "youtubeClips": [
      {
        "videoId": "OnggBmaY4D4",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: '\"Got My Mind Set On You\" Version 2 (From the album \"Cloud 9\")' — Peter angav ingen lattitel, harledd ur klippet. Titeln rojer albumnamnet men inte aret."
      }
    ]
  },
  {
    "id": "george-michael-faith",
    "displayName": "Faith — George Michael",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1eKhntRLUPDV7h6tATtzsv",
    "youtubeClips": [
      {
        "videoId": "i2hLL_UNUSo",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14, startSec angiven av Peter. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "guns-n-roses-paradise-city",
    "displayName": "Paradise City — Guns N' Roses",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "6eN1f9KNmiWEhpE2RhQqB5",
    "youtubeClips": [
      {
        "videoId": "inoqFF-2t8I",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1321)."
      }
    ]
  },
  {
    "id": "guns-n-roses-sweet-child-o-mine",
    "displayName": "Sweet Child o' Mine — Guns N' Roses",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7snQQk1zcKl8gZ92AnueZW",
    "youtubeClips": [
      {
        "videoId": "qoflJn7zkFM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "7clouds Rock",
        "license": "standard",
        "notes": "Lyric-video, katalogens standard-lyric-kanal. Peter-kurerad 2026-08-11."
      }
    ]
  },
  {
    "id": "inner-circle-bad-boys",
    "displayName": "Bad Boys — Inner Circle",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1NojrDCqDLh4dWRZ7F589Q",
    "youtubeClips": [
      {
        "videoId": "yVBB2upbVys",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Inner Circle",
        "license": "standard",
        "notes": "Peter-tillagd 2026-08-29. correctYear 1987 = Inner Circles originalrelease på albumet One Way (INTE 1993 års COPS-tema-hit). startSec ej finjusterad — verifiera i spelaren."
      }
    ]
  },
  {
    "id": "johnny-logan-hold-me-now",
    "displayName": "Hold Me Now — Johnny Logan",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2eK478aJN3hUiJodJYCmbv",
    "youtubeClips": [
      {
        "videoId": "gl2yKH5zbyo",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1987 vinnare — Irland."
      }
    ]
  },
  {
    "id": "lena-philipsson-dansa-i-neon",
    "displayName": "Dansa i neon — Lena Philipsson",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "4N0NK4lCncys6hwWhtXRit",
    "youtubeClips": [
      {
        "videoId": "273doG7GYiA",
        "startSec": 25,
        "endSec": 55,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "lili-sussie-oh-mama",
    "displayName": "Oh Mama — Lili & Sussie",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4orJQkF2exPD4xSFmMY00U",
    "youtubeClips": [
      {
        "videoId": "fFwqvkav4ys",
        "startSec": 5,
        "endSec": 20,
        "license": "standard"
      }
    ]
  },
  {
    "id": "lotta-engberg-fyra-bugg",
    "displayName": "Fyra bugg och en Coca Cola — Lotta Engberg",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "4UuKT9xgMQQUPD3VWRGLJb",
    "youtubeClips": [
      {
        "videoId": "U7hLR82zSE0",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1987 vinnare."
      }
    ]
  },
  {
    "id": "lotta-engberg-successchottis",
    "displayName": "Succéschottis — Lotta Engberg",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6AbOYPLZy8epirlVNAOVDK",
    "youtubeClips": [
      {
        "videoId": "cPsj6_U0dkc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Fan upload",
        "license": "standard",
        "notes": "Fan-uppladdning av studio-inspelning 1987. Inget officiellt Topic-klipp."
      }
    ]
  },
  {
    "id": "rick-astley-never-gonna-give-you-up",
    "displayName": "Never Gonna Give You Up — Rick Astley",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4PTG3Z6ehGkBFwjybzWkR8",
    "youtubeClips": [
      {
        "videoId": "dQw4w9WgXcQ",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Rick Astley",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12 — ersatte Topic-audion (3BFTio5296w) med officiella musikvideon (4K Remaster) på artistens egen kanal."
      }
    ]
  },
  {
    "id": "starship-nothings-gonna-stop-us-now",
    "displayName": "Nothing's Gonna Stop Us Now — Starship",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3X7uFMzJrEE0sxn62qd8Ch",
    "youtubeClips": [
      {
        "videoId": "3wxyN3z9PL4",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "u2-with-or-without-you",
    "displayName": "With or Without You — U2",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6ADSaE87h8Y3lccZlBJdXH",
    "youtubeClips": [
      {
        "videoId": "oNvWDP_GkiY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "U2 - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "white-lion-when-the-children-cry",
    "displayName": "When the Children Cry — White Lion",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "youtubeClips": [
      {
        "videoId": "6tatKFXlYiY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1331)."
      }
    ]
  },
  {
    "id": "white-liuon-when-the-children-cry",
    "displayName": "when the children cry — White liuon",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "4ZCLM74MYhUy80TPiaAuee",
    "youtubeClips": [
      {
        "videoId": "6tatKFXlYiY",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "whitesnake-here-i-go-again",
    "displayName": "Here I Go Again — Whitesnake",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock",
      "Soft & Love"
    ],
    "spotifyTrackId": "1Ll8UuomlZEhuZYLxUz09J",
    "youtubeClips": [
      {
        "videoId": "WyF8RHM1OCg",
        "startSec": 10,
        "endSec": 25,
        "license": "standard"
      }
    ]
  },
  {
    "id": "whitney-houston-i-wanna-dance-with-somebody",
    "displayName": "I Wanna Dance with Somebody — Whitney Houston",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 87,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5ifX6jfT33QWKP9DE0YRG8",
    "youtubeClips": [
      {
        "videoId": "2dzf4T3RbEc",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Whitney Houston - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100). BEHÅLLET 2026-08-12: Peters förslag QzZ-mtE1EHc är en privat re-upload; Topic är rättsinnehavarens kanal."
      }
    ]
  },
  {
    "id": "bobby-mcferrin-dont-worry-be-happy",
    "displayName": "Don't Worry, Be Happy — Bobby McFerrin",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4hObp5bmIJ3PP3cKA9K9GY",
    "youtubeClips": [
      {
        "videoId": "qTuntvl6oLQ",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Bobby McFerrin - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "celine-dion-ne-partez-pas",
    "displayName": "Ne partez pas sans moi — Céline Dion",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "70Qp58JxQ2AoQlPStVBPcy",
    "youtubeClips": [
      {
        "videoId": "VXLWfXmlXPc",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1988 vinnare — Schweiz."
      }
    ]
  },
  {
    "id": "fine-young-cannibals-she-drives-me-crazy",
    "displayName": "She Drives Me Crazy — Fine Young Cannibals",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2BPfKiV9U0CR1dpUgeUwuH",
    "youtubeClips": [
      {
        "videoId": "UtvmTu4zAMg",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1327)."
      }
    ]
  },
  {
    "id": "kylie-minogue-the-loco-motion",
    "displayName": "The Loco-Motion — Kylie Minogue",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2hBR3npBmnfr1VWB3O64Jt",
    "youtubeClips": [
      {
        "videoId": "POWsFzSFLCE",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'Kylie Minogue - The Loco-motion - Official Video' — den internationella 1988-versionen."
      }
    ]
  },
  {
    "id": "milli-vanilli-girl-you-know-its-true",
    "displayName": "Girl You Know It's True — Milli Vanilli",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0C7dYeCLF6ukChtW64UNge",
    "youtubeClips": [
      {
        "videoId": "0ZV9FyngchQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "musicvideorestorations",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "neneh-cherry-buffalo-stance",
    "displayName": "Buffalo Stance — Neneh Cherry",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "JWsRz3TJDEY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1307)."
      }
    ]
  },
  {
    "id": "neneh-cherry-buffalo-stands",
    "displayName": "Buffalo Stands — Neneh Cherry",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3XWgwgbWDI56mf1Wl3cLzb",
    "youtubeClips": [
      {
        "videoId": "JWsRz3TJDEY",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "paula-abdul-straight-up",
    "displayName": "Straight Up — Paula Abdul",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6ECzWlULj7xJLm3XATrrJj",
    "youtubeClips": [
      {
        "videoId": "8yFwvifjuf4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MVIDEO4K",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "roxette-dangerous",
    "displayName": "Dangerous — Roxette",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7LwsqxyIqOCF9vbdHmdIvT",
    "youtubeClips": [
      {
        "videoId": "VFNRh26TPmM",
        "startSec": 26,
        "endSec": 41,
        "license": "standard"
      }
    ]
  },
  {
    "id": "roxette-listen-to-your-heart",
    "displayName": "Listen to Your Heart — Roxette",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2sDaqQj5VptFuLztuKxMSU",
    "youtubeClips": [
      {
        "videoId": "jhTFCxvHVYY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Roxette - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "roxette-the-look",
    "displayName": "The Look — Roxette",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "79LdvxXi5JYUjhnO7v9Fi3",
    "youtubeClips": [
      {
        "videoId": "--8mvZzZIcU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Remastered Full HD musikvideo. Officiell MV-innehåll, ersätter Topic-versionen (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "the-naked-gun-1988",
    "displayName": "The Naked Gun",
    "correctYear": 1988,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "ocxp2kns6jw",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "TrailerHome",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx), bytt actor-select->timeline 2026-09-15 per uppdaterad Film.xlsx + Peters bekraftelse. ⚠ SPOILER-RISK: aret 1988 star i titeln och AR nu svaret — verifiera i spelaren om '1988' syns och byt annars till ett klipp utan aret i titeln. TrailerHome, takedown-risk."
      }
    ]
  },
  {
    "id": "thomas-di-leva-vi-har-bara-varandra",
    "displayName": "Vi har bara varandra — Thomas Di Leva",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "spotifyTrackId": "0umzToghfA6IPbRLY17ref",
    "youtubeClips": [
      {
        "videoId": "KH_kDfdwf8A",
        "startSec": 6,
        "endSec": 30,
        "channelTitle": "Thomas Di Leva",
        "license": "standard",
        "notes": "Official video. startSec 0->6 (Peter 2026-08-29)."
      }
    ]
  },
  {
    "id": "tommy-korberg-stad-i-ljus",
    "displayName": "Stad i ljus — Tommy Körberg",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "7bVwUOySQGO2afJ0LArAMi",
    "youtubeClips": [
      {
        "videoId": "GO9VUhn1TXk",
        "startSec": 1,
        "endSec": 31,
        "channelTitle": "Tommy Körberg - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. startSec 1 angiven av Peter. Peters egna G9iUTMXF0tw SPOILAR (1988 vid tecken 46 av 51); officiell Topic-audio anvand istallet."
      },
      {
        "videoId": "DxLlgLY2xEo",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "Py Bäckman",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Lyric video. startSec 2 angiven av Peter."
      }
    ]
  },
  {
    "id": "tracy-chapman-fast-car",
    "displayName": "Fast Car — Tracy Chapman",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2M9ro2krNb7nr7HSprkEgo",
    "youtubeClips": [
      {
        "videoId": "AIOAlaACuv4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tracy Chapman",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "whitney-one-moment-in-time",
    "displayName": "One Moment in Time — Whitney Houston",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3S3dZXxNGghLtOqehzHtii",
    "youtubeClips": [
      {
        "videoId": "4Yp2eZ-TMuI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Whitney Houston - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "alice-cooper-poison",
    "displayName": "Poison — Alice Cooper",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "youtubeClips": [
      {
        "videoId": "Qq4j1LtCdww",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1323)."
      }
    ]
  },
  {
    "id": "alice-cooper-posion",
    "displayName": "Posion — Alice Cooper",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "5XcZRgJv3zMhTqCyESjQrF",
    "youtubeClips": [
      {
        "videoId": "Qq4j1LtCdww",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "b52s-love-shack",
    "displayName": "Love Shack — The B-52's",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5HHVGPYZQe8eKT2OgV5EBf",
    "youtubeClips": [
      {
        "videoId": "9SOryJvTAGs",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "back-box-ride-on-time",
    "displayName": "Ride on time — Back box",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "3pgainA2dH9c7e8JVYGRCN",
    "youtubeClips": [
      {
        "videoId": "M0quXl_od3g",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "belinda-carlisle-leave-a-light-on",
    "displayName": "Leave a Light On — Belinda Carlisle",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7vJz53OhSGMIxLlwhfwqzu",
    "youtubeClips": [
      {
        "videoId": "pmZYE8j2ZNs",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1317)."
      }
    ]
  },
  {
    "id": "black-box-ride-on-time",
    "displayName": "Ride on Time — Black Box",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "M0quXl_od3g",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1325)."
      }
    ]
  },
  {
    "id": "cher-if-i-could-turn-back-time",
    "displayName": "If I Could Turn Back Time — Cher",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6mYrhCAGWzTdF8QnKuchXM",
    "youtubeClips": [
      {
        "videoId": "9n3A_-HRFfc",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1315)."
      }
    ]
  },
  {
    "id": "christer-sandelin-det-hon-vill-ha",
    "displayName": "Det hon vill ha — Christer Sandelin",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "5gyPbAixchH4iPhqKWthfB",
    "youtubeClips": []
  },
  {
    "id": "depeche-mode-personal-jesus",
    "displayName": "Personal Jesus — Depeche Mode",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2wUlYDGGXlSvm2NkGj0Qio",
    "youtubeClips": [
      {
        "videoId": "u1xrNaTO1bI",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1322)."
      }
    ]
  },
  {
    "id": "ebba-gron-800-grader",
    "displayName": "800 grader — Ebba Grön",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "3zgJHNEorjbLLThp6TiMhz",
    "youtubeClips": []
  },
  {
    "id": "field-of-dreams-1989",
    "displayName": "Field of Dreams",
    "correctYear": 1989,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "isAnimated": false,
    "correctNames": [
      "Kevin Costner"
    ],
    "distractorNames": [
      "Tom Hanks",
      "Patrick Swayze",
      "Tom Cruise",
      "Mel Gibson"
    ],
    "youtubeClips": [
      {
        "videoId": "Ut06d4dptWo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Movieclips",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (13)."
      }
    ]
  },
  {
    "id": "fine-young-cannibals-good-thing",
    "displayName": "Good Thing — Fine Young Cannibals",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6lRkdG1HurVS72F9GoBeWJ",
    "youtubeClips": [
      {
        "videoId": "We_9MthGzwk",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1313)."
      }
    ]
  },
  {
    "id": "gladys-knight-licence-to-kill",
    "displayName": "Licence to Kill — Gladys Knight",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "youtubeClips": [
      {
        "videoId": "v6Mzz9mLcsg",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1318)."
      }
    ]
  },
  {
    "id": "gladys-knight-license-to-kill",
    "displayName": "License to Kill — Gladys Knight",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6H4KXG6ydKKcBfZhZ2bDUg",
    "youtubeClips": []
  },
  {
    "id": "gloria-estefan-dont-wanna-lose-you",
    "displayName": "Don't Wanna Lose You — Gloria Estefan",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "J1x1WGtePSE",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1309)."
      }
    ]
  },
  {
    "id": "hakan-sodergren-nu-tar-vi-dom",
    "displayName": "Nu tar vi dom — Håkan Södergren & Ishockeylandslaget",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4mkdS0Ff5EFJPn692PNuAt",
    "youtubeClips": [
      {
        "videoId": "eToFpwpVJ1k",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Håkan Södergren - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "imply-red-if-iyou-dont-know-me-by-now",
    "displayName": "If Iyou dont know me by now — imply red",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "zTcu7MCtuTs",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jerry-williams-did-i-tell-you",
    "displayName": "Did I Tell You — Jerry Williams",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "6OjTQyRybsRv9GUmKKbAvp",
    "youtubeClips": []
  },
  {
    "id": "kaoma-lambada",
    "displayName": "Lambada — Kaoma",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "6xepovPqjvrkEw9Y5AMmTm",
    "youtubeClips": [
      {
        "videoId": "iyLdoQGBchQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Club Music 80",
        "license": "standard",
        "notes": "Officiell musikvideo-re-upload — stabil sedan 2014."
      }
    ]
  },
  {
    "id": "madonna-cherish",
    "displayName": "Cherish — Madonna",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5OKScc0MSa9Wl8g2zrulLn",
    "youtubeClips": [
      {
        "videoId": "8q2WS6ahCnY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1308)."
      }
    ]
  },
  {
    "id": "madonna-express-yourself",
    "displayName": "Express Yourself — Madonna",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6ioBgySxoeQKALvAeLEmId",
    "youtubeClips": [
      {
        "videoId": "GsVcUzP_O_8",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "madonna-like-a-prayer",
    "displayName": "Like a Prayer — Madonna",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0ECZ5rta27stj0q4SNuM0D",
    "youtubeClips": [
      {
        "videoId": "79fzeNUqQbQ",
        "startSec": 12,
        "endSec": 42,
        "channelTitle": "Madonna",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 12 — ersatte den privata re-uploaden 'Enhanced Music Videos'. AVVÄGNING: detta officiella klipp är SD och region-blockat i 2 länder (dock EJ Sverige), vilket var skälet att det valdes bort 2026-08-11. Peter begärde det igen 2026-08-14; rättsinnehavarens kanal väger tyngre än takedown-risken i en privat re-upload."
      }
    ]
  },
  {
    "id": "magnus-uggla-jag-mar-illa",
    "displayName": "Jag mår illa — Magnus Uggla",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "7C8NhwOrNbsqi9YcF2rstE",
    "youtubeClips": [
      {
        "videoId": "m-VigThmLWg",
        "startSec": 9,
        "endSec": 39,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1404)."
      }
    ]
  },
  {
    "id": "marc-almond-something-gotten-hold-of-my-heart",
    "displayName": "Something Gotten Hold of my heart — Marc Almond",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "68O1r5xQADu0JjvBibg9zN",
    "youtubeClips": [
      {
        "videoId": "LZ8Yn9QJi_o",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "marc-almond-somethings-gotten-hold-of-my-heart",
    "displayName": "Something's Gotten Hold of My Heart — Marc Almond & Gene Pitney",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "LZ8Yn9QJi_o",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1328)."
      }
    ]
  },
  {
    "id": "natalie-cole-miss-you-like-crazy",
    "displayName": "Miss You Like Crazy — Natalie Cole",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6d1IYeSfyqOTW61rPgocGD",
    "youtubeClips": [
      {
        "videoId": "OD1jb7Hgwk8",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "NatalieColeMusic",
        "license": "standard",
        "notes": "Ersatte dött klipp (deleted/private) 2026-09-12 — official audio."
      }
    ]
  },
  {
    "id": "neneh-cherry-manchild",
    "displayName": "Manchild — Neneh Cherry",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0eFhD5O7tXDr7rww77xYUj",
    "youtubeClips": [
      {
        "videoId": "OJ9VBMBS3qE",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1319)."
      }
    ]
  },
  {
    "id": "orup-da-star-pojkarna-pa-rad",
    "displayName": "Då står pojkarna på rad — Orup",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0fN96hLpE08LmXFfS5VmdE",
    "youtubeClips": []
  },
  {
    "id": "phil-collins-another-day-in-paradise",
    "displayName": "Another Day in Paradise — Phil Collins",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2BFLtstcRXPnk4uoO3Wi6U",
    "youtubeClips": [
      {
        "videoId": "Qt2mbGP6vFI",
        "startSec": 12,
        "endSec": 42,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1305)."
      }
    ]
  },
  {
    "id": "queen-i-want-it-all",
    "displayName": "I Want It All — Queen",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "1MX6kqZ8FOht5UnQuPl6Jj",
    "youtubeClips": [
      {
        "videoId": "hFDcoX7s6rE",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1314)."
      }
    ]
  },
  {
    "id": "richard-marx-right-here-waiting",
    "displayName": "Right Here Waiting — Richard Marx",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4LFwNJWoj74Yd71fIr1W8x",
    "youtubeClips": [
      {
        "videoId": "S_E2EHVxNAE",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1326)."
      }
    ]
  },
  {
    "id": "riva-rock-me",
    "displayName": "Rock Me — Riva",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6t8m9JpxoBHrETKYjtrCY3",
    "youtubeClips": [
      {
        "videoId": "ZWwmCT7P3VE",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1989 vinnare — Jugoslavien."
      }
    ]
  },
  {
    "id": "ronny-ragge-de-e-sommar",
    "displayName": "De e sommar — Ronny & Ragge",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Summer",
      "100% in swedish"
    ],
    "spotifyTrackId": "0EWaUpAQtTWET3E14ye6ZV",
    "youtubeClips": [
      {
        "videoId": "K9KiSm1fyMk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Ronny & Ragge",
        "license": "standard",
        "notes": "Official video."
      }
    ]
  },
  {
    "id": "roy-orbison-you-got-it",
    "displayName": "You Got It — Roy Orbison",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0pRBGmicizlLmCnjWXbaqU",
    "youtubeClips": [
      {
        "videoId": "uWGCMUcJNfw",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1332)."
      }
    ]
  },
  {
    "id": "simply-red-if-you-dont-know-me-by-now",
    "displayName": "If You Don't Know Me by Now — Simply Red",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "zTcu7MCtuTs",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1316)."
      }
    ]
  },
  {
    "id": "soul-ii-soul-back-to-life",
    "displayName": "Back to Life — Soul II Soul",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "7vvRkLPIvfjjmCIqNxBuEZ",
    "youtubeClips": [
      {
        "videoId": "LC3Zu4puC1w",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Soul II Soul - Topic",
        "license": "standard",
        "notes": "Ersatte dött klipp (deleted/private) 2026-09-12 — official Topic audio."
      }
    ]
  },
  {
    "id": "tears-for-fears-sowing-the-seeds-of-love",
    "displayName": "Sowing the Seeds of Love — Tears for Fears",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2jzrHeWQYd8nPUqRFlEEnw",
    "youtubeClips": [
      {
        "videoId": "VAtGOESO7W8",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1329)."
      }
    ]
  },
  {
    "id": "technotronic-pump-up-the-jam",
    "displayName": "Pump Up the Jam — Technotronic",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "21qnJAMtzC6S5SESuqQLEK",
    "youtubeClips": [
      {
        "videoId": "9EcjWd-O4jI",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1324)."
      }
    ]
  },
  {
    "id": "the-bangles-eternal-flame",
    "displayName": "Eternal Flame — The Bangles",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "PSoOFn3wQV4",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1311)."
      }
    ]
  },
  {
    "id": "tina-turner-the-best",
    "displayName": "The Best — Tina Turner",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "6pPWRBubXOBAHnjl5ZIujB",
    "youtubeClips": [
      {
        "videoId": "GC5E8ie2pdM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "tom-petty-free-fallin",
    "displayName": "Free Fallin' — Tom Petty",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5tVA6TkbaAH9QMITTQRrNv",
    "youtubeClips": [
      {
        "videoId": "1lWJXDG2i0A",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1312)."
      }
    ]
  },
  {
    "id": "tommy-nilsson-en-dag",
    "displayName": "En dag — Tommy Nilsson",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "4y81ov9ojdBPu5eLhDKxS9",
    "youtubeClips": [
      {
        "videoId": "BqplQcbdWtI",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "when-harry-met-sally-1989",
    "displayName": "When Harry Met Sally…",
    "correctYear": 1989,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "LO0Oe-sdG4g",
        "startSec": 7,
        "endSec": 37,
        "channelTitle": "Billy Barnell",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). VARNING: titeln 'When Harry Met Sally... | New Trailer 2020' visar '2020' (aterutgivningsar) men RATT SVAR ar 1989 — en spelare som laser titeln kan svara fel. VERIFIERA i spelaren; byt klipp om '2020' syns. parentControlled borttaget 2026-09-15 (ej langre flaggad i uppdaterad Film.xlsx). Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "acdc-thunderstruck",
    "displayName": "Thunderstruck — AC/DC",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "57bgtoPSgt236HzfBOd8kj",
    "youtubeClips": [
      {
        "videoId": "v2AC41dglnM",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "bjorn-skifs-and-blablus-hooked-on-a-feeling",
    "displayName": "Hooked on a Feeling — Björn Skifs & Blåblus",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "l6DepmNwbn8",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "dr-alban-no-coke",
    "displayName": "No Coke — Dr. Alban",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "245oQnuxE6oX9B8B0t3SmU",
    "youtubeClips": [
      {
        "videoId": "4uPDfuC3Jck",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Dr. Alban",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'Dr. Alban - No Coke (Official 4K Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "home-alone",
    "displayName": "Home Alone",
    "correctYear": 1990,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 93,
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
    "isAnimated": false,
    "correctNames": [
      "Macaulay Culkin"
    ],
    "distractorNames": [
      "Jake Lloyd",
      "Haley Joel Osment",
      "Elijah Wood",
      "Freddie Highmore"
    ],
    "youtubeClips": [
      {
        "videoId": "NOIgZYlYvyk",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "NOW PLAYING",
        "license": "standard",
        "notes": "Home Alone (1990) officiell trailer — Kevin McCallister + booby traps etableras."
      }
    ]
  },
  {
    "id": "londonbeat-ive-been-thinking-about-you",
    "displayName": "I've Been Thinking About You — Londonbeat",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "50PeqUz1BjMw9ayNTk5O4d",
    "youtubeClips": [
      {
        "videoId": "06k-lO4vuic",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "macken-1990",
    "displayName": "Macken",
    "correctYear": 1990,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
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
    "youtubeClips": [
      {
        "videoId": "6E75oxJJSiw",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "madonna-vogue",
    "displayName": "Vogue — Madonna",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7j5TIXPi0cCbSSqItmbyZy",
    "youtubeClips": [
      {
        "videoId": "GuJQSAiODqI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Madonna",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Officiella musikvideon på artistens egen kanal — ersatte den privata re-uploaden 'MVIDEO4K' (takedown-risk)."
      }
    ]
  },
  {
    "id": "mc-hammer-u-cant-touch-this",
    "displayName": "U Can't Touch This — MC Hammer",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "1B75hgRqe7A4fwee3g3Wmu",
    "youtubeClips": [
      {
        "videoId": "q8WSdypJ4WA",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Petter Oliveira",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Privat re-upload av musikvideon — ej rättsinnehavare. Spelbar i SE 2026-08-12; takedown-risk kvarstår."
      }
    ]
  },
  {
    "id": "new-order-world-in-motion",
    "displayName": "World in Motion — New Order",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "08po8QZK3tihnLBZWATAki",
    "youtubeClips": [
      {
        "videoId": "T8T1a45HX4o",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "New Order - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "pretty-woman-1990",
    "displayName": "Pretty Woman",
    "correctYear": 1990,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "jvd3TjJaf3c",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). parentControlled=true per Film.xlsx. VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "roxette-it-must-have-been-love",
    "displayName": "It Must Have Been Love — Roxette",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2julHzta3pq6E1ugxyvsbj",
    "youtubeClips": [
      {
        "videoId": "k2C5TjS2sh4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Roxette",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "scorpions-wind-of-change",
    "displayName": "Wind of Change — Scorpions",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 83,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3ovjw5HZZv43SxTwApooCM",
    "youtubeClips": [
      {
        "videoId": "F_-ZuVy76yg",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Scorpions - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "sinead-oconnor-nothing-compares-2-u",
    "displayName": "Nothing Compares 2 U — Sinéad O'Connor",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3nvuPQTw2zuFAVuLsC9IYQ",
    "youtubeClips": [
      {
        "videoId": "Ouf9-bOqJVk",
        "startSec": 8,
        "endSec": 15,
        "channelTitle": "Sinéad O'Connor - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "snap-the-power",
    "displayName": "The Power — SNAP!",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0nQLxiNGbbUoSGrxksETLm",
    "youtubeClips": [
      {
        "videoId": "nm6DO_7px1I",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "SNAP!",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 10. Videotitel verifierad: 'SNAP! - The Power (Official 4K Music Video)' pa gruppens egen kanal — inget ar i titeln."
      }
    ]
  },
  {
    "id": "sven-ingvars-sommar-och-sol",
    "displayName": "Sommar och sol — Sven‐Ingvars",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "21Xskbq9DzT26y2oxvBumL",
    "youtubeClips": [
      {
        "videoId": "mIQNpPzCPTg",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "tomas-ledin-hon-gor-allt",
    "displayName": "Hon gör allt för att göra mig lycklig — Tomas Ledin",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2eG2VJ3CiHs43XYBRIRQ45",
    "youtubeClips": [
      {
        "videoId": "epuLWrb6AUA",
        "startSec": 5,
        "endSec": 50,
        "channelTitle": "Tomas Ledin - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "toto-cutugno-insieme",
    "displayName": "Insieme: 1992 — Toto Cutugno",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "44noNMO0iv87Tds7dwcpQU",
    "youtubeClips": [
      {
        "videoId": "JiRppGSF-tI",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1990 vinnare — Italien."
      }
    ]
  },
  {
    "id": "army-of-lovers-crucified",
    "displayName": "Crucified — Army of lovers",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "6fXzdWgyZhDeLmlzC7Mvco",
    "youtubeClips": []
  },
  {
    "id": "army-of-lovers-obsession",
    "displayName": "Obsession — Army of Lovers",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7kDOMFX3JNYIKvrQqftOwY",
    "youtubeClips": [
      {
        "videoId": "zNmO233OztQ",
        "startSec": 12,
        "endSec": 27,
        "license": "standard"
      }
    ]
  },
  {
    "id": "beauty-and-the-beast-1991",
    "displayName": "Skönheten och odjuret",
    "correctYear": 1991,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
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
    "youtubeClips": [
      {
        "videoId": "gz4iE2kzgyg",
        "startSec": 21,
        "endSec": 51,
        "channelTitle": "Bella Y Bestia Son",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). VARNING: titeln 'Skönheten och odjuret: Trailer (2010)' visar '2010' (svensk aterutgivning) men RATT SVAR ar 1991 (originalfilmen, animerad) per ar-policy — en spelare som laser titeln kan svara fel. VERIFIERA i spelaren; byt klipp om '2010' syns."
      }
    ]
  },
  {
    "id": "bryan-adams-everything-i-do",
    "displayName": "(Everything I Do) I Do It for You — Bryan Adams",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1Eb90nmqTrxylKFhcUzW8P",
    "youtubeClips": [
      {
        "videoId": "Y0pdQU87dc8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bryan Adams",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "carola-fangad-av-en-stormvind",
    "displayName": "Fångad av en stormvind — Carola",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "06xX9E1BTTwyOwyaBuszSK",
    "youtubeClips": [
      {
        "videoId": "4Ml6pJqc_bw",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1991 vinnare, ESC-vinnare 1991."
      }
    ]
  },
  {
    "id": "crowded-house-weather-with-you",
    "displayName": "Weather with you — Crowded House",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6tXnRSvuNgOq4QcxpIN54r",
    "youtubeClips": []
  },
  {
    "id": "eva-dahlgren-vem-tander-stjarnorna",
    "displayName": "Vem tänder stjärnorna — Eva Dahlgren",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "-02uHyU-rjs",
        "startSec": 25,
        "endSec": 55,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1410)."
      }
    ]
  },
  {
    "id": "ewa-dahlgren-vem-tander-stjarnorna",
    "displayName": "Vem tänder stjärnorna — Ewa Dahlgren",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0ppqeIPZIcqu5uImAK425B",
    "youtubeClips": [
      {
        "videoId": "-02uHyU-rjs",
        "startSec": 25,
        "endSec": 40,
        "license": "standard"
      }
    ]
  },
  {
    "id": "fresh-prince-summertime",
    "displayName": "Summertime — DJ Jazzy Jeff & The Fresh Prince",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer",
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "20XdEFyaUR9C7aDIdq2OAd",
    "youtubeClips": [
      {
        "videoId": "Kr0tTbTbmVA",
        "startSec": 5,
        "endSec": 20,
        "license": "standard"
      },
      {
        "videoId": "bBs60R9qahI",
        "startSec": 4,
        "endSec": 19,
        "license": "standard"
      }
    ]
  },
  {
    "id": "genesis-i-cant-dance",
    "displayName": "I Cant dance — Genesis",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5VwQYHpyQPhiToPKWJaHiO",
    "youtubeClips": []
  },
  {
    "id": "genesis-jesus-he-knows-me",
    "displayName": "Jesus He Knows Me — Genesis",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "43MwtiKUQj1GhQm2hC9Kn9",
    "youtubeClips": []
  },
  {
    "id": "guns-n-roses-knockin-on-heavens-door",
    "displayName": "Knockin on Heavens Door — Guns n Roses",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2C4aYxNpoPkmoZ3ZdPeuOB",
    "youtubeClips": []
  },
  {
    "id": "metallica-enter-sandman",
    "displayName": "Enter Sandman — Metallica",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "5BIMPccDwShpXq784RJlJp",
    "youtubeClips": [
      {
        "videoId": "XZuM4zFg-60",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Metallica - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "metallica-nothing-else-matters",
    "displayName": "Nothing Else Matters — Metallica",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3ZFwuJwUpIl0GeXsvF1ELf",
    "youtubeClips": []
  },
  {
    "id": "michael-jackson-black-or-white",
    "displayName": "Black or White — Michael Jackson",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5gu6nQpz5ELQpxt0QkvhUr",
    "youtubeClips": [
      {
        "videoId": "m-y_IxPcx8U",
        "startSec": 58,
        "endSec": 73,
        "channelTitle": "Michael Jackson - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic guitar-riff."
      }
    ]
  },
  {
    "id": "michael-jackson-heal-the-world",
    "displayName": "Heal the world — Michael Jackson",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7woW97CfcWaKtuC6W5BP2K",
    "youtubeClips": []
  },
  {
    "id": "michael-jackson-remember-the-time",
    "displayName": "Remember the Time — Michael Jackson",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4jnFqNWeJCeCRHc4HCdxfd",
    "youtubeClips": [
      {
        "videoId": "LeiFF0gvqcc",
        "startSec": 210,
        "endSec": 240,
        "channelTitle": "michaeljacksonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "mr-big-to-be-with-you",
    "displayName": "To Be with You — Mr. Big",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3bP47tw8MOgtrwdO1iahVl",
    "youtubeClips": [
      {
        "videoId": "3ksOBNd0SWo",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "2MinusTVHD",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "nirvana-come-as-you-are",
    "displayName": "Come as You Are — Nirvana",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "27LuGw8pE0WSELYYuptRjK",
    "youtubeClips": [
      {
        "videoId": "f1IdyrhOrGs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Nirvana - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "pearl-jam-alive",
    "displayName": "Alive — Pearl Jam",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "1L94M3KIu7QluZe63g64rv",
    "youtubeClips": [
      {
        "videoId": "qM0zINtulhM",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1277)."
      }
    ]
  },
  {
    "id": "pearl-jam-jeremy",
    "displayName": "Jeremy — Pearl Jam",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "62nQ8UZVqR2RMvkJHkcO2o",
    "youtubeClips": []
  },
  {
    "id": "prince-diamonds-and-pearls",
    "displayName": "Diamonds and Pearls — Prince",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4mfyehYgUP2V8jsjW9UzYj",
    "youtubeClips": []
  },
  {
    "id": "queen-the-show-must-go-on",
    "displayName": "The Show Must Go On — Queen",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "3hU637WcAGM5ubSqeaTme5",
    "youtubeClips": [
      {
        "videoId": "t99KH0TR-J4",
        "startSec": 6,
        "endSec": 36,
        "channelTitle": "Queen Official",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "red-hot-chili-peppers-under-the-bridge",
    "displayName": "Under the Bridge — Red Hot Chili Peppers",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "4839xk58bxT0w7K0yiXYF8",
    "youtubeClips": [
      {
        "videoId": "GLvohMXgcBo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Red Hot Chili Peppers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "rem-losing-my-religion",
    "displayName": "Losing My Religion — R.E.M.",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 81,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6bCPryuQjsts5cEybA3Nb5",
    "youtubeClips": [
      {
        "videoId": "xwtdhWltSIg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "remhq",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (15)."
      }
    ]
  },
  {
    "id": "rem-shiny-happy-people",
    "displayName": "Shiny Happy People — R.E.M.",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6YN6A8ppveObxb2usM3AQF",
    "youtubeClips": [
      {
        "videoId": "YYOKMUTTDdA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "remhq",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "roxette-fading-like-a-flower-everytime-you-leave",
    "displayName": "Fading Like a Flower (Everytime You Leave) — Roxette",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "8fGLiIvKKys",
        "startSec": 17,
        "endSec": 32,
        "license": "standard"
      }
    ]
  },
  {
    "id": "seal-crazy",
    "displayName": "Crazy — Seal",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4mFkf4tw0HzBRxY1bgdyZa",
    "youtubeClips": [
      {
        "videoId": "4Fc67yQsPqQ",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Warner Records Vault",
        "license": "standard",
        "notes": "Officiellt musikvideo via Warner Records Vault. HD. Tillagd 2026-06-04."
      }
    ]
  },
  {
    "id": "shanice-i-love-your-smile",
    "displayName": "I Love your smile — Shanice",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5BE3DOk0C26VCMxxT84bec",
    "youtubeClips": []
  },
  {
    "id": "smells-like-teen-spirit",
    "displayName": "Smells Like Teen Spirit — Nirvana",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "4CeeEOM32jQcH3eN9Q2dGj",
    "youtubeClips": [
      {
        "videoId": "V7f03mfxN4I",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "SLAYERO MUSIC",
        "license": "standard",
        "notes": "4K Remastered 60FPS — rörlig MV (cheerleaders/gymnastiksal). Ikonisk riff-intro."
      }
    ]
  },
  {
    "id": "spin-doctors-two-princes",
    "displayName": "Two Princes — Spin Doctors",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4ePP9So5xRzspjLFVVbj90",
    "youtubeClips": [
      {
        "videoId": "wsdy_rct6uo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "SpinDoctorsVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "ten-sharp-you",
    "displayName": "You — Ten sharp",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6lbme14HiDWYmGiw1I2Dv6",
    "youtubeClips": []
  },
  {
    "id": "the-klf-justified-and-ancient",
    "displayName": "Justified and Ancient — The KLF",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3hDtJQCP6ROvhWYTR4qdCD",
    "youtubeClips": []
  },
  {
    "id": "the-naked-gun-2-5-1991",
    "displayName": "The Naked Gun 2½: The Smell of Fear",
    "correctYear": 1991,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "EW66cjw-3xI",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "Trailer World",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx), bytt actor-select->timeline 2026-09-15 per uppdaterad Film.xlsx + Peters bekraftelse. ⚠ SPOILER-RISK: aret 1991 star i titeln och AR nu svaret — verifiera i spelaren om '1991' syns och byt annars till ett klipp utan aret i titeln. Trailer World, takedown-risk."
      }
    ]
  },
  {
    "id": "u2-one",
    "displayName": "One — U2",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3G69vJMWsX6ZohTykad2AU",
    "youtubeClips": []
  },
  {
    "id": "zucchero-paul-young-senza-una-donna",
    "displayName": "Senza una donna — Zucchero & Paul Young",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1wzggqX4y7amR0xdJIekwE",
    "youtubeClips": [
      {
        "videoId": "V69vs8JmXYM",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Zucchero",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "2-unlimited-twilight-zone",
    "displayName": "Twilight zone — 2 unlimited",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "78ePMYOtObETLaxVEVizXl",
    "youtubeClips": []
  },
  {
    "id": "4-non-blondes-whats-up",
    "displayName": "What's Up? — 4 Non Blondes",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0jWgAnTrNZmOGmqgvHhZEm",
    "youtubeClips": [
      {
        "videoId": "B6GdsRIbTSk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "4 Non Blondes - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "ace-of-base-all-that-she-wants",
    "displayName": "All That She Wants — Ace of Base",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6kWJvPfC4DgUpRsXKNa9z9",
    "youtubeClips": [
      {
        "videoId": "8JqCWX-MXuk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ace of Base - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "aladdin-1992",
    "displayName": "Aladdin",
    "correctYear": 1992,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 88,
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
    "youtubeClips": [
      {
        "videoId": "GacgWYqL-Bc",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Marcus R",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte XBrfbWtmvWs vars titel hade 1992 vid tecken 9 av 53 = spoiler. Svenskt tal."
      }
    ]
  },
  {
    "id": "billy-ray-cyrus-achy-breaky-heart",
    "displayName": "Achy Breaky Heart — Billy Ray Cyrus",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2EoIt9vdgFRNW03u5IvFsQ",
    "youtubeClips": []
  },
  {
    "id": "bob-marley-iron-lion-zion",
    "displayName": "Iron Lion Zion — Bob Marley",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4lMfYLOskpi3GxEXM0X92m",
    "youtubeClips": []
  },
  {
    "id": "bon-jovi-bed-of-roses",
    "displayName": "Bed of Roses — Bon Jovi",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0PDW69Vli91TKQwotAg3Wd",
    "youtubeClips": [
      {
        "videoId": "NvR60Wg9R7Q",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BonJoviVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "bon-jovi-keep-the-faith",
    "displayName": "Keep the Faith — Bon Jovi",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5EWtBjCLy21d1hY9zdaEe8",
    "youtubeClips": []
  },
  {
    "id": "boyz-ii-men-end-of-the-road",
    "displayName": "End of the Road — Boyz II Men",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "RnB"
    ],
    "spotifyTrackId": "3XcDCh0hHP9Q659pjjyK3Q",
    "youtubeClips": [
      {
        "videoId": "CmeriHkAF5c",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Boyz II Men - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "bruce-springsteen-human-touch",
    "displayName": "Human Touch — Bruce Springsteen",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1o53HbxmOy5TzThJdBaDZb",
    "youtubeClips": []
  },
  {
    "id": "charles-and-eddie-would-i-lie-to-you",
    "displayName": "Would I Lie to You — Charles & Eddie",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1A3iXoekVzV95cq89XiiuX",
    "youtubeClips": []
  },
  {
    "id": "dr-alban-its-my-life",
    "displayName": "It's My Life — Dr. Alban",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6bjl81yfCztuBXLC9Mqs2N",
    "youtubeClips": [
      {
        "videoId": "oW0VovnyjPY",
        "startSec": 50,
        "endSec": 80,
        "channelTitle": "Dr. Alban",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 50. Videotitel verifierad: 'Dr.Alban - It's My Life (Official 4K Video)' pa artistens egen kanal — inget ar i titeln. Ersatte Topic-audion (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "dr-alban-sing-hallelujah",
    "displayName": "Sing Hallelujah! — Dr. Alban",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "1ohbjkuczl6hEoYEo931PH",
    "youtubeClips": [
      {
        "videoId": "pKxJca7LLNM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Dr. Alban",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'Dr. Alban - Sing Hallelujah (Official 4K Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "east-17-house-of-love",
    "displayName": "House of love — East 17",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0HgDGw5QDBIfDCTIrdV1Tx",
    "youtubeClips": []
  },
  {
    "id": "elton-john-the-one",
    "displayName": "The One — Elton John",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2bytByr4orvDCKkyLsJYKw",
    "youtubeClips": []
  },
  {
    "id": "en-vogue-free-your-mind",
    "displayName": "Free Your Mind — En Vogue",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2vG1yrWSMiL6egg6w4e9ma",
    "youtubeClips": []
  },
  {
    "id": "eric-clapton-tears-in-heaven",
    "displayName": "Tears in Heaven — Eric Clapton",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7utRJ4BeYx85khzP3lKoBX",
    "youtubeClips": []
  },
  {
    "id": "felix-dont-you-want-me",
    "displayName": "Dont You Want Me — Felix",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4xlHRxENDR0zODpmwmz6CL",
    "youtubeClips": []
  },
  {
    "id": "guns-n-roses-november-rain",
    "displayName": "November Rain — Guns N' Roses",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock",
      "Soft & Love"
    ],
    "spotifyTrackId": "3YRCqOhFifThpSRFJ1VWFM",
    "youtubeClips": [
      {
        "videoId": "y6lfK3bH4z8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Guns N' Roses - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "inner-circle-sweat",
    "displayName": "Sweat (A La La La Long) — Inner Circle",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "24Si0Kw3pu2RxX1jrbBg5A",
    "youtubeClips": []
  },
  {
    "id": "jimmy-nail-aint-no-doubt",
    "displayName": "Aint No Doubt — Jimmy Nail",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5qbrpQ5ac44s48PU1ouUVC",
    "youtubeClips": []
  },
  {
    "id": "jon-secada-just-another-day",
    "displayName": "Just Another Day — Jon Secada",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1TCVVSdQs4i5s38zK43B4f",
    "youtubeClips": [
      {
        "videoId": "G0pDyyooUJE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "moonfloated",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "linda-martin-why-me",
    "displayName": "Why Me? — Linda Martin",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5aVbngGqymHbbYgfKzBdTD",
    "youtubeClips": [
      {
        "videoId": "DKd50924Qxs",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1992 vinnare — Irland."
      }
    ]
  },
  {
    "id": "lionel-richie-my-destiny",
    "displayName": "My Destiny — Lionel Richie",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2c2QM7x721KtNva4g77PIT",
    "youtubeClips": []
  },
  {
    "id": "lisa-nilsson-himlen-runt-hornet",
    "displayName": "Himlen runt hörnet — Lisa Nilsson",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love",
      "100% in swedish"
    ],
    "spotifyTrackId": "3uhF5EBcuqqXELlszBhIOy",
    "youtubeClips": []
  },
  {
    "id": "magnus-uggla-kung-for-en-dag",
    "displayName": "Kung för en dag — Magnus Uggla",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "1teO1SPOqr2lRb49ayjy4e",
    "youtubeClips": [
      {
        "videoId": "7aOc2fL2pRM",
        "startSec": 13,
        "endSec": 43,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1405)."
      }
    ]
  },
  {
    "id": "niklas-stromstedt-oslagbara",
    "displayName": "Oslagbara — Niklas Strömstedt",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6Y4TjH3wA2r76NML5BGASz",
    "youtubeClips": [
      {
        "videoId": "0XCZUg-4iiA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "WM Sweden",
        "license": "standard",
        "notes": "Officiell WM Sweden. Album Halvvägs till framtiden (1992)."
      }
    ]
  },
  {
    "id": "orup-magaluf",
    "displayName": "Magaluf — Orup",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Summer",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "39ADGrzCrbWwTFlhDcsf9P",
    "youtubeClips": []
  },
  {
    "id": "radiohead-creep",
    "displayName": "Creep — Radiohead",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "70LcF31zb1H0PyJoS1Sx1r",
    "youtubeClips": [
      {
        "videoId": "XFkzRNyygfk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Radiohead",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1992 = singeln (21 sep 1992); albumet Pablo Honey kom 1993."
      }
    ]
  },
  {
    "id": "richard-marx-hazard",
    "displayName": "Hazard — Richard Marx",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5FcGHLnw8ZPeM1LigWhj3k",
    "youtubeClips": []
  },
  {
    "id": "right-said-fred-dont-talk-just-kiss",
    "displayName": "Dont Talk Just Kiss — Right said fred",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4mrbbOwCgfgxiYy8kaVyAO",
    "youtubeClips": []
  },
  {
    "id": "roxette-queen-of-rain",
    "displayName": "Queen of Rain — Roxette",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5lnz9DbNfzJWiiUudfG6IW",
    "youtubeClips": [
      {
        "videoId": "27eClHQxXls",
        "startSec": 5,
        "endSec": 20,
        "license": "standard"
      },
      {
        "videoId": "cBwX6I0ShhM",
        "startSec": 6,
        "endSec": 21,
        "license": "standard"
      }
    ]
  },
  {
    "id": "shabba-ranks-mr-loverman",
    "displayName": "Mr Loverman — Shabba Ranks",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0OGmrTL8ILUFWNQZkgzgcJ",
    "youtubeClips": []
  },
  {
    "id": "shakespears-sister-stay",
    "displayName": "Stay — Shakespears Sister",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6Mcoqi1iK28djC2EClVwDj",
    "youtubeClips": [
      {
        "videoId": "YCYaALgW80c",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "London Records",
        "license": "standard",
        "notes": "Officiell musikvideo, label-kanal. Peter-kurerad 2026-08-11."
      }
    ]
  },
  {
    "id": "sir-mix-a-lot-baby-got-back",
    "displayName": "Baby Got Back — Sir Mix-a-Lot",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "-TsEFYY95mE",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "Sir Mix-A-Lot - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). Peters rad hade RHCP-klippet inklistrat av misstag; officiell Topic-audio uppsokt."
      }
    ]
  },
  {
    "id": "snap-rhythm-is-a-dancer",
    "displayName": "Rhythm Is a Dancer — Snap!",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5ljnDFmEKNfkkwUKEg2hxp",
    "youtubeClips": [
      {
        "videoId": "JYIaWeVL1JM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "SNAP!",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "snow-informer",
    "displayName": "Informer — Snow",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "2uafQBQfX8f539k50pHDSF",
    "youtubeClips": [
      {
        "videoId": "TSffz_bl6zo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RHINO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "sophie-b-hawkins-damn-i-wish-i-was-your-lover",
    "displayName": "Damn I wish i was your lover — Sophie B Hawkins",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7kmfQ2QHwGqRCxVHDv5mzo",
    "youtubeClips": []
  },
  {
    "id": "svenne-rubins-langa-bollar-pa-bengt",
    "displayName": "Långa Bollar På Bengt — Svenne Rubins",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6gAPl8snSQiUoAOpLUDIqA",
    "youtubeClips": [
      {
        "videoId": "l7jul-JdOJE",
        "startSec": 10,
        "endSec": 50,
        "channelTitle": "Svenne Rubins - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "tasmin-archer-sleeping-satellite",
    "displayName": "Sleeping Satellite — Tasmin Archer",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3WSyYBhLZRLbQo2tJgFvSR",
    "youtubeClips": []
  },
  {
    "id": "the-bodyguard-1992",
    "displayName": "The Bodyguard",
    "correctYear": 1992,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "v4qauDAr_hA",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: 'The Bodyguard - Theatrical Trailer' — avslojar varken skadespelare eller ar."
      }
    ]
  },
  {
    "id": "the-cure-friday-im-in-love",
    "displayName": "Friday Im in love — The cure",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4QlzkaRHtU8gAdwqjWmO8n",
    "youtubeClips": []
  },
  {
    "id": "the-prodigy-out-of-space",
    "displayName": "Out of Space — The Prodigy",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "37m2khXl5lnBzicq1mGoZG",
    "youtubeClips": []
  },
  {
    "id": "the-shamen-ebeneezer-goode",
    "displayName": "Ebeneezer Goode — The Shamen",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3iGUZpRS1UGX39XBdNvSmU",
    "youtubeClips": []
  },
  {
    "id": "tom-cochrane-life-is-a-highway",
    "displayName": "Life is a highway — Tom Cochrane",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0hKF8N8aflF1uDzEEnPr2j",
    "youtubeClips": []
  },
  {
    "id": "u96-das-boot",
    "displayName": "Das Boot — U96",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5A3IdgGphzKS2etiGFB73S",
    "youtubeClips": []
  },
  {
    "id": "undercover-baker-street",
    "displayName": "Baker street — Undercover",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2DTQUOfYJAjdo7utgjnU4u",
    "youtubeClips": []
  },
  {
    "id": "vanessa-paradis-be-my-baby",
    "displayName": "Be my baby — Vanessa Paradis",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5UkoitnvaDUSsq7cVsOdOh",
    "youtubeClips": []
  },
  {
    "id": "wet-wet-wet-goodnight-girl",
    "displayName": "Goodnight girl — Wet wet wet",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2TYcO8ZBV8oYGGjwRT9oBH",
    "youtubeClips": []
  },
  {
    "id": "whitney-houston-i-have-nothing",
    "displayName": "I Have Nothing — Whitney Houston",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "Film edition"
    ],
    "spotifyTrackId": "31er9IGsfFbwqy1pH4aiTP",
    "youtubeClips": [
      {
        "videoId": "FxYw0XPEoKE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "whitneyhoustonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "whitney-houston-i-will-always-love-you",
    "displayName": "I Will Always Love You — Whitney Houston",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4eHbdreAnSOrDDsFfc4Fpm",
    "youtubeClips": [
      {
        "videoId": "tP0zj220CbQ",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Whitney Houston - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "2-unlimited-no-limit",
    "displayName": "No Limit — 2 Unlimited",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5ylVTOQvjMyLTrvFpepXfP",
    "youtubeClips": [
      {
        "videoId": "7kmEEkECFQw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "2 Unlimited Official",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "ace-of-base-the-sign",
    "displayName": "The Sign — Ace of Base",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0hrBpAOgrt8RXigk83LLNE",
    "youtubeClips": [
      {
        "videoId": "iqu132vTl5Y",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ace of Base",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "arvingarna-eloise",
    "displayName": "Eloise — Arvingarna",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Dansband",
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "4QZ6hp2CKRaZG5RI9zXQqg",
    "youtubeClips": [
      {
        "videoId": "a6MCRuE6tx8",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1993 vinnare. ESC 1993 performance."
      }
    ]
  },
  {
    "id": "bryan-adams-please-forgive-me",
    "displayName": "Please Forgive Me — Bryan Adams",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3QuSg0pA9TDfJYUTHyjPgZ",
    "youtubeClips": [
      {
        "videoId": "Qy4zFJmE-1E",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "Bryan Adams - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). Peters lank (Bryan Adams egen kanal) gick inte att badda in; officiell Topic-audio anvand."
      }
    ]
  },
  {
    "id": "celine-dion-the-power-of-love",
    "displayName": "The Power of Love — Céline Dion",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7wW5aYk098ICCaLqme13Vh",
    "youtubeClips": [
      {
        "videoId": "Y8HOfcYWZoo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "CelineDionVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "cool-runnings-1993",
    "displayName": "Cool Runnings",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 85,
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
    "genrePackages": [
      "sport"
    ],
    "isAnimated": false,
    "correctNames": [
      "John Candy"
    ],
    "distractorNames": [
      "Robin Williams",
      "Bill Murray",
      "Eddie Murphy",
      "Chris Farley"
    ],
    "youtubeClips": [
      {
        "videoId": "3mS-l1F5Xvs",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "DVDizzydotcom",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — original 1993-trailer (1080p HD-upscale)."
      }
    ]
  },
  {
    "id": "cypress-hill-insane-in-the-brain",
    "displayName": "Insane in the Brain — Cypress Hill",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "4dTMU4O2DdyIlRlss7v9UP",
    "youtubeClips": [
      {
        "videoId": "RijB8wnJCN0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "CypressHillVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "dromkaken-1993",
    "displayName": "Drömkåken",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "isAnimated": false,
    "correctNames": [
      "Björn Skifs"
    ],
    "distractorNames": [
      "Robert Gustafsson",
      "Mikael Nyqvist",
      "Mikael Persbrandt",
      "Rolf Lassgård"
    ],
    "youtubeClips": [
      {
        "videoId": "Xtrx3k9IceE",
        "startSec": 3,
        "endSec": 33,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). Name/actor-select (svar = Björn Skifs, bekraftat av Peter 2026-09-16). VERIFIERA i spelaren att titeln inte visar skadespelarnamnet."
      }
    ]
  },
  {
    "id": "haddaway-what-is-love",
    "displayName": "What Is Love — Haddaway",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "33iAwBBb962LFQei4J0b0b",
    "youtubeClips": [
      {
        "videoId": "HEXWRTEbj1I",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "DECADR",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\" med explicit startSec 3. Videotitel verifierad: 'Haddaway - What Is Love (Official 4K Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "janet-jackson-thats-the-way-love-goes",
    "displayName": "That’s the Way Love Goes — Janet Jackson",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2iJMMzXN6YQsuoEjls4nni",
    "youtubeClips": [
      {
        "videoId": "2b_KfAGiglc",
        "startSec": 120,
        "endSec": 150,
        "channelTitle": "JanetJacksonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "jurassic-park",
    "displayName": "Jurassic Park",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 95,
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
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Sam Neill",
      "Jeff Goldblum"
    ],
    "distractorNames": [
      "Kevin Costner",
      "Mel Gibson",
      "Kurt Russell",
      "Bruce Willis"
    ],
    "youtubeClips": [
      {
        "videoId": "VzZN9AVBS1I",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Universal Pictures At Home",
        "license": "standard",
        "notes": "Official Universal Pictures-klipp 4K — iconic theme + dinosaur-reveal."
      }
    ]
  },
  {
    "id": "lenny-kravitz-are-you-gonna-go-my-way",
    "displayName": "Are You Gonna Go My Way — Lenny Kravitz",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "45Ia1U4KtIjAPPU7Wv1Sea",
    "youtubeClips": [
      {
        "videoId": "i5PZQMwL7iE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Lenny Kravitz",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "magnus-uggla-4-sekunder",
    "displayName": "4 sekunder — Magnus Uggla",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "0AUiKbEc5DZKa9362LLyYj",
    "youtubeClips": [
      {
        "videoId": "K4BVY6KAEQc",
        "startSec": 18,
        "endSec": 48,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1408)."
      }
    ]
  },
  {
    "id": "mariah-carey-hero",
    "displayName": "Hero — Mariah Carey",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5mgCMlxQW7fmHbrdJuowbB",
    "youtubeClips": [
      {
        "videoId": "0IA3ZvCkRkQ",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "MariahCareyVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). OBS: detta ar Vevo-kanalens LIVE-version, inte studioinspelningen."
      }
    ]
  },
  {
    "id": "niamh-kavanagh-in-your-eyes",
    "displayName": "In Your Eyes — Niamh Kavanagh",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 68,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7LBBL20GLOtjBJwxgVmzPK",
    "youtubeClips": [
      {
        "videoId": "pysQioMtrAU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1993 vinnare — Irland."
      }
    ]
  },
  {
    "id": "ronny-ragge-rara-sota-anna",
    "displayName": "Rara söta Anna — Ronny & Ragge",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "09o8YE3Ta7YRXh5NI9HPZQ",
    "youtubeClips": [
      {
        "videoId": "L8EKDeSbLXk",
        "startSec": 18,
        "endSec": 48,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1414)."
      }
    ]
  },
  {
    "id": "snoop-dogg-whats-my-name",
    "displayName": "Who Am I (What's My Name)? — Snoop Doggy Dogg",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "0eO8MW9YSTK3CjdaTYKlhF",
    "youtubeClips": [
      {
        "videoId": "2soGJXQAQec",
        "startSec": 50,
        "endSec": 80,
        "channelTitle": "SnoopDoggVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "stakka-bo-here-we-go-again",
    "displayName": "Here we go again — Stakka Bo",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3gXRUe5Rgb7zPFY59i42OY",
    "youtubeClips": []
  },
  {
    "id": "sunes-sommar",
    "displayName": "Sunes sommar",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "isAnimated": false,
    "correctNames": [
      "Peter Haber"
    ],
    "distractorNames": [
      "Mikael Persbrandt",
      "Lasse Åberg",
      "Gösta Ekman",
      "Johan Ulveson"
    ],
    "youtubeClips": [
      {
        "videoId": "88B9JxorPcI",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "ZorbaMovies",
        "license": "standard",
        "notes": "Trailer. Familjefilm, stark igenkänning hos millennials som barn."
      }
    ]
  },
  {
    "id": "the-connels-74-75",
    "displayName": "74-75 — The connels",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2MAVcVr2oylw2OZ3hojWYj",
    "youtubeClips": []
  },
  {
    "id": "the-piano-1993",
    "displayName": "The Piano",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "IeHHVJGrfpk",
        "startSec": 43,
        "endSec": 73,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). Bekraftat 'The Piano' (1993) av Peter. VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "all-4-one-i-swear",
    "displayName": "I Swear — All-4-One",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "RnB"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3V0PeMg2mhbYRtk9bioAwF",
    "youtubeClips": [
      {
        "videoId": "cVpvlaKfLQc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RHINO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "bon-jovi-always",
    "displayName": "Always — Bon Jovi",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2RChe0r2cMoyOvuKobZy44",
    "youtubeClips": [
      {
        "videoId": "9BMwcO6_hyA",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "BonJoviVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "cajsa-stina-akerstrom-fraga-stjarnorna",
    "displayName": "Fråga stjärnorna — Cajsa Stina Åkerström",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "spotifyTrackId": "1QJcdzMUidsBaMTHoZZRGn",
    "youtubeClips": [
      {
        "videoId": "MDNeDz-I9mE",
        "startSec": 7,
        "endSec": 22,
        "license": "standard"
      }
    ]
  },
  {
    "id": "carola-sanna-vanner",
    "displayName": "Sanna vänner — Carola",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "5AGXO3iao804D7WuOm0Lyl",
    "youtubeClips": []
  },
  {
    "id": "corona-the-rhythm-of-the-night",
    "displayName": "The Rhythm of the Night — Corona",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5IPJsGFKtxKDPCkT8lhEjN",
    "youtubeClips": [
      {
        "videoId": "OnT58cIJSpw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RHINO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "cranberries-zombie",
    "displayName": "Zombie — The Cranberries",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2IZZqH4K02UIYg5EohpNHF",
    "youtubeClips": [
      {
        "videoId": "lRrC_d6dRZw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "RockHype",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "dr-alban-let-the-beat-go-on",
    "displayName": "Let the Beat Go On — Dr. Alban",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0r2joAcaJghNmtRIBBIzu1",
    "youtubeClips": [
      {
        "videoId": "oKs25yuV3_A",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Dr. Alban",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 20. Videotitel verifierad: 'Dr Alban - Let The Beat Go On (Official HD Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "dr-alban-look-whos-talking",
    "displayName": "Look Who's Talking! — Dr. Alban",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "1BFJG9xkO8QCwGHL9pH9wt",
    "youtubeClips": [
      {
        "videoId": "n1dk78L0XzI",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Dr. Alban",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14 med explicit startSec 5. Videotitel verifierad: 'Dr. Alban - Look Who's Talking (Official 4K Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "dr-alban-look-whos-talking-now",
    "displayName": "Look whos talking now — Dr Alban",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1BFJG9xkO8QCwGHL9pH9wt",
    "youtubeClips": []
  },
  {
    "id": "e-type-set-the-world-on-fire",
    "displayName": "Set the World on Fire — E-Type",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "67rBycpa8FTFJkQwP5FzP1",
    "youtubeClips": [
      {
        "videoId": "K9Tw8baMPpM",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "ETypeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\" med explicit startSec 10. Videotitel verifierad: 'E-Type - Set The World On Fire' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "e-type-this-is-the-way",
    "displayName": "This Is the Way — E-Type",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "1BBIW3lDfwK9PXOFOedZmo",
    "youtubeClips": [
      {
        "videoId": "7w1HeDqYCU4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ETypeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Videotitel verifierad: 'E-Type - This Is The Way' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "everything-but-the-girl-missing",
    "displayName": "Missing — Everything but the Girl",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0mCRhbedh0rFSl6Hbvsjs1",
    "youtubeClips": [
      {
        "videoId": "U56Ns66Qrb8",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "EBTGVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "forrest-gump",
    "displayName": "Forrest Gump",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 93,
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
    "isAnimated": false,
    "correctNames": [
      "Tom Hanks"
    ],
    "distractorNames": [
      "Kevin Costner",
      "Robin Williams",
      "Mel Gibson",
      "Jim Carrey"
    ],
    "youtubeClips": [
      {
        "videoId": "bSMxl1V8FSg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Movieclips",
        "license": "standard",
        "notes": "Movieclips 'Run, Forrest, Run!'-scenen — iconic moment + theme."
      }
    ]
  },
  {
    "id": "ges-graver-guld-usa",
    "displayName": "När vi gräver guld i USA — GES",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3iAJRvvn8pywXZtvBNNP71",
    "youtubeClips": [
      {
        "videoId": "7YOzs-dD8qU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Glenmark Eriksson Strömstedt - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "green-day-basket-case",
    "displayName": "Basket Case — Green Day",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "youtubeClips": [
      {
        "videoId": "NUTGr5t3MoY",
        "startSec": 16,
        "endSec": 46,
        "channelTitle": "Green Day",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "house-of-pain-jump-around",
    "displayName": "Jump Around — House of Pain",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3TZwjdclvWt7iPJUnMpgcs",
    "youtubeClips": []
  },
  {
    "id": "la-bouche-be-my-lover",
    "displayName": "Be My Lover — La Bouche",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "youtubeClips": [
      {
        "videoId": "ViP87WipSm0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "LaBoucheVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "livin-joy-dreamer",
    "displayName": "Dreamer — Livin Joy",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0r1veUx7ezhSwTZESVYEIt",
    "youtubeClips": []
  },
  {
    "id": "paul-harrington-rock-n-roll-kids",
    "displayName": "Rock 'n' Roll Kids — Paul Harrington & Charlie McGettigan",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 66,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2wQoHnaJ1C4rPQPd72fNn3",
    "youtubeClips": [
      {
        "videoId": "ohBO8OxQbv8",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1994 vinnare — Irland."
      }
    ]
  },
  {
    "id": "pulp-fiction",
    "displayName": "Pulp Fiction",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "John Travolta",
      "Samuel L. Jackson"
    ],
    "distractorNames": [
      "Kevin Costner",
      "Tom Hanks",
      "Nicolas Cage",
      "Denzel Washington"
    ],
    "youtubeClips": [
      {
        "videoId": "s7EdQ4FqbhY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Movieclips",
        "license": "standard",
        "notes": "Official trailer (Movieclips) — iconic surf-rock soundtrack + ensemble-shots. BEHÅLLET 2026-08-12: Peters förslag tGpTpVyI_OQ (Miramax) har titeln 'John Travolta, Uma Thurman, Samuel L. Jackson' = direkt spoiler för actor-select."
      }
    ]
  },
  {
    "id": "rednex-cotton-eye-joe",
    "displayName": "Cotton Eye Joe — Rednex",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0Jg602cHeMCnPez9baacIe",
    "youtubeClips": [
      {
        "videoId": "mOYZaiDZ7BM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rednex Videos",
        "license": "standard",
        "notes": "Officiell musikvideo, Rednex Videos-kanalen. HD. Ersätter Topic-versionen."
      }
    ]
  },
  {
    "id": "roxette-run-to-you",
    "displayName": "Run to You — Roxette",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1zeqAF6Hf1lPJoNkkmNA9j",
    "youtubeClips": []
  },
  {
    "id": "scatman-john-scatman",
    "displayName": "Scatman (Ski-Ba-Bop-Ba-Dop-Bop) — Scatman John",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "623rRTKwGmgjH6sjE9uWLh",
    "youtubeClips": [
      {
        "videoId": "Hy8kmNEo1i8",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Scatman John",
        "license": "standard",
        "notes": "Official music video."
      }
    ]
  },
  {
    "id": "seal-kiss-from-a-rose",
    "displayName": "Kiss from a Rose — Seal",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "Film edition"
    ],
    "spotifyTrackId": "3YKptz29AsOlm7WAVnztBh",
    "youtubeClips": [
      {
        "videoId": "hDd2G_V1rzc",
        "startSec": 6,
        "endSec": 36,
        "channelTitle": "Seal",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "sven-ingvars-sommar-i-sverige",
    "displayName": "Sommar i Sverige — Sven-Ingvars",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7s8EmGKCWKHsKXhhEZBdaM",
    "youtubeClips": [
      {
        "videoId": "PQuDXSXGkAg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Parlophone Sweden",
        "license": "standard",
        "notes": "Officiell Parlophone/WM Group. Album Byns enda blondin (1994)."
      }
    ]
  },
  {
    "id": "svenne-rubins-en-gammal-amazon",
    "displayName": "En gammal Amazon — Svenne Rubins",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4fSyd0K4fzY0ExNu0SlY11",
    "youtubeClips": [
      {
        "videoId": "aTrzCqltygk",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1431)."
      }
    ]
  },
  {
    "id": "the-lion-king-1994",
    "displayName": "The Lion King",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "What is the name of the main character in this film?",
    "itemHcp": 93,
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
    "isAnimated": true,
    "correctNames": [
      "Simba"
    ],
    "distractorNames": [
      "Nemo",
      "Shrek",
      "Mulan",
      "Aladdin"
    ],
    "youtubeClips": [
      {
        "videoId": "lfiprM5l_cE",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Aarush Boi",
        "license": "standard",
        "notes": "Circle of Life-öppningsscenen (HD, 1994). Alla officiella Disney-trailers är made-for-kids-blockerade. Ersätt vid inbäddningsfel."
      }
    ]
  },
  {
    "id": "the-outhere-brothers-boom-boom-boom",
    "displayName": "Boom boom boom — The Outhere Brothers",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "25KdyGYYNeMJ0oPwVYPKZQ",
    "youtubeClips": []
  },
  {
    "id": "tlc-waterfalls",
    "displayName": "Waterfalls — TLC",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6qspW4YKycviDFjHBOaqUY",
    "youtubeClips": [
      {
        "videoId": "8WEtxJ4-sh4",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "TLCVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "2pac-california-love",
    "displayName": "California Love — 2Pac feat. Dr. Dre",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3ia3dJETSOllPsv3LJkE35",
    "youtubeClips": [
      {
        "videoId": "99zZ4fGZlgk",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1280)."
      }
    ]
  },
  {
    "id": "2pac-dear-mama",
    "displayName": "Dear Mama — 2Pac",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6tDxrq4FxEL2q15y37tXT9",
    "youtubeClips": []
  },
  {
    "id": "alanis-morissette-ironic",
    "displayName": "Ironic — Alanis Morissette",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4oGTdOClZUxcM2H3UmXlwL",
    "youtubeClips": [
      {
        "videoId": "Jne9t8sHpUc",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Alanis Morissette",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1995 = albumet Jagged Little Pill; singeln kom feb 1996."
      }
    ]
  },
  {
    "id": "alex-party-dont-give-me-your-life",
    "displayName": "Dont Give me Your life — Alex Party",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "6jdhk6q8N0uODYwpv96gd1",
    "youtubeClips": []
  },
  {
    "id": "andrea-bocelli-con-te-partiro",
    "displayName": "Con te partirò — Andrea Bocelli",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7zrpoAJte9o12TzawqgdD0",
    "youtubeClips": [
      {
        "videoId": "nVUHHW1tJYA",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "coolio-gangstas-paradise",
    "displayName": "Gangsta's Paradise — Coolio",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "1DIXPcTDzTj8ZMHt3PDt8p",
    "youtubeClips": [
      {
        "videoId": "7DXlY8LhWnI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Coolio - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "deep-blue-something-breakfast-at-tiffanys",
    "displayName": "Breakfast at tiffanys — Deep Blue Something",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1uzWOoJdADfstQuFtQFTUn",
    "youtubeClips": []
  },
  {
    "id": "drangarna-vill-du-bli-min-fru",
    "displayName": "Vill du bli min fru — Drängarna",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4ZJNkwzMJJLB7RpLzPcQtn",
    "youtubeClips": [
      {
        "videoId": "OTZxtUxdoSc",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1426)."
      }
    ]
  },
  {
    "id": "faithless-insomnia",
    "displayName": "Insomnia — Faithless",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5cadBZgqus7zm7WxLBerOb",
    "youtubeClips": []
  },
  {
    "id": "jan-johansen-se-pa-mig",
    "displayName": "Se på mig — Jan Johansen",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5E0DPn2m1oAigfof05lKmJ",
    "youtubeClips": [
      {
        "videoId": "yiaPi7rvwQE",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1389)."
      }
    ]
  },
  {
    "id": "mariah-carey-fantasy",
    "displayName": "Fantasy — Mariah Carey",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6xkryXuiZU360Lngd4sx13",
    "youtubeClips": []
  },
  {
    "id": "michael-jackson-you-are-not-alone",
    "displayName": "You Are Not Alone — Michael Jackson",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3AoeaZs8dFemFJr3JdzOL0",
    "youtubeClips": [
      {
        "videoId": "pAyKJAtDNCw",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "michaeljacksonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "nick-borgen-den-glider-in",
    "displayName": "Den glider in — Nick Borgen",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1vbaVUGd4mAwJRYZZC5IPS",
    "youtubeClips": [
      {
        "videoId": "QgppLdY0QjU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tre Kronor - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "no-doubt-dont-speak",
    "displayName": "Don't Speak — No Doubt",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6urCAbunOQI4bLhmGpX7iS",
    "youtubeClips": [
      {
        "videoId": "TR3Vdo5etCQ",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "NoDoubtVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 30 angiven av Peter. correctYear 1995 = albumet Tragic Kingdom (okt 1995). GRANSFALL: singeln kom april 1996 och laten minns oftast som 1996."
      }
    ]
  },
  {
    "id": "no-mercy-missing",
    "displayName": "Missing — No Mercy",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "04cwtOV3fK6jqv5SZ4z06C",
    "youtubeClips": [
      {
        "videoId": "73NY_bSbgqE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "NoMercyVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "oasis-wonderwall",
    "displayName": "Wonderwall — Oasis",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1qPbGZqppFwLwcBC1JQ6Vr",
    "youtubeClips": [
      {
        "videoId": "bx1Bh8ZvH84",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "OasisVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). startSec 15 angiven av Peter. Officiella musikvideon; ersatte Topic-audion FVdjZYfDuLE. SD ar bara en note i youtube-validate."
      }
    ]
  },
  {
    "id": "robert-miles-children",
    "displayName": "Children — Robert Miles",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "4wtR6HB3XekEengMX17cpc",
    "youtubeClips": [
      {
        "videoId": "DvyCbevQbtI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RobertMilesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella Vevo-videon (SD, bara en note). Ersatte RIGOq8MEyH0 ur xlsx som var en 14 min lang 90-tals-topplista. correctYear 1995 = EP:n Soundtracks (jan 1995, Italien); slog igenom internationellt 1996."
      }
    ]
  },
  {
    "id": "robyn-show-me-love",
    "displayName": "Show Me Love — Robyn",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4cwKBnmJ1ziA23x3ySNNrQ",
    "youtubeClips": [
      {
        "videoId": "bhWEI6-_w9E",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RobynVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "secret-garden-nocturne",
    "displayName": "Nocturne — Secret Garden",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3pXPZ7dloJxTdBQmClNHiU",
    "youtubeClips": [
      {
        "videoId": "u-gA0aU-d88",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1995 vinnare — Norge."
      }
    ]
  },
  {
    "id": "shaggy-boombastic",
    "displayName": "Boombastic — Shaggy",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4fxF8ljwryMZX5c9EKrLFE",
    "youtubeClips": []
  },
  {
    "id": "take-that-back-for-good",
    "displayName": "Back for good — Take that",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "48e4AJwKOQCTK4Erzt31G1",
    "youtubeClips": []
  },
  {
    "id": "the-smashing-pumpkins-bullet-with-butterfly-wings",
    "displayName": "Bullet with butterfly wings — The smashing pumpkins",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1EzeXGaZdqsA4Nst1AIAL2",
    "youtubeClips": []
  },
  {
    "id": "toy-story-1995",
    "displayName": "Toy Story",
    "correctYear": 1995,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "CxwTLktovTU",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Disney Plus",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Officiell Disney+ 'Toy Story | Original Trailer' — ingen ar-spoiler."
      }
    ]
  },
  {
    "id": "b-real-hit-em-high",
    "displayName": "Hit 'Em High — B-Real, Busta Rhymes, Coolio",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop",
      "Film edition"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "12MIoieKIYC1jDgpKGy12F",
    "youtubeClips": [
      {
        "videoId": "gdhcbkdQvXE",
        "startSec": 26,
        "endSec": 56,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1301)."
      }
    ]
  },
  {
    "id": "backstreet-boys-all-i-have-to-give",
    "displayName": "All I have to give — Backstreet Boys",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3hlhefxgyp4MDnN6C2dQ5H",
    "youtubeClips": [
      {
        "videoId": "pj6FCKm8dhM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "blackstreet-no-diggity",
    "displayName": "No Diggity — Blackstreet feat. Dr. Dre",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "6MdqqkQ8sSC0WB4i8PyRuQ",
    "youtubeClips": [
      {
        "videoId": "3KL9mRus19o",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BlackstreetVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1996 = albumet Another Level (MusicBrainz gav 1997)."
      }
    ]
  },
  {
    "id": "cardigans-lovefool",
    "displayName": "Lovefool — The Cardigans",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7aQjPecQdIuNd1sz3KCDhD",
    "youtubeClips": [
      {
        "videoId": "c0fHs7THj4k",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Cardigans - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "dromhus-vill-ha-dig",
    "displayName": "Vill ha dig — Drömhus",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "100% in swedish",
      "Disco & Pop"
    ],
    "spotifyTrackId": "1zpr5MMuS4xrOllFKVe1Hs",
    "youtubeClips": [
      {
        "videoId": "S1GitKiAHNs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Drömhus",
        "license": "standard",
        "notes": "Officiell musikvideo. Peter-kurerad 2026-08-29. Titeln avslöjar inte årtalet."
      }
    ]
  },
  {
    "id": "eimear-quinn-the-voice",
    "displayName": "The Voice — Eimear Quinn",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 66,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6SA7BxY6zh5SaxUBp3tCtb",
    "youtubeClips": [
      {
        "videoId": "0KiE1byYXtA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1996 vinnare — Irland."
      }
    ]
  },
  {
    "id": "eros-ramazzotti-la-cosa-mas-bella",
    "displayName": "La Cosa Más Bella (Più bella cosa) — Eros Ramazzotti",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1EZypwk0xcj64ZLAglhLs2",
    "youtubeClips": [
      {
        "videoId": "UojBaKX5Vz4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ErosRamazzottiVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "fargo-1996",
    "displayName": "Fargo",
    "correctYear": 1996,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "h2tY82z3xXU",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx), bytt actor-select->timeline 2026-09-15 per uppdaterad Film.xlsx + Peters bekraftelse. ⚠ SPOILER-RISK: aret 1996 star i titeln och AR nu svaret — verifiera i spelaren om '1996' syns och byt annars till ett klipp utan aret i titeln. Fargo ar en R-vald valdsfilm; overvag parentControlled (ej markt av Peter)."
      }
    ]
  },
  {
    "id": "fugees-killing-me-softly",
    "displayName": "Killing Me Softly — Fugees",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1MAqR81Tz28IIqMJ2KUDAO",
    "youtubeClips": [
      {
        "videoId": "oKOtzIo-uYw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "TheFugeesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Egen inspelning - separat item fran roberta-flack-killing-me-softly (1973) per ar-policyn: itemet ar artistens inspelning, inte kompositionen."
      }
    ]
  },
  {
    "id": "fugees-ready-or-not",
    "displayName": "Ready or Not — Fugees",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB",
      "Soft & Love"
    ],
    "spotifyTrackId": "4LOoPg7TavHtNmCTOfd9XQ",
    "youtubeClips": [
      {
        "videoId": "aIXyKmElvv8",
        "startSec": 36,
        "endSec": 66,
        "channelTitle": "TheFugeesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "gyllene-tider-juni-juli-augusti",
    "displayName": "Juni, juli, augusti — Gyllene Tider",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "2AXTRWWGTwgp0Ud8cPzT5S",
    "youtubeClips": [
      {
        "videoId": "LksWsiCKqSQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Gyllene Tider - Topic",
        "license": "standard",
        "notes": "Studio-audio från officiell Topic-kanal."
      }
    ]
  },
  {
    "id": "happy-gilmore-1996",
    "displayName": "Happy Gilmore",
    "correctYear": 1996,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "youtubeClips": [
      {
        "videoId": "y1emDAYCfVQ",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). genrePackages:sport (golf-komedi) → surfar under Sport-filtret. VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "lightning-seeds-three-lions",
    "displayName": "Three Lions — Baddiel, Skinner & The Lightning Seeds",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2RxT8ynnf4CI6jvGh8jeo3",
    "youtubeClips": [
      {
        "videoId": "xm7et8ecVjM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Baddiel - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "los-del-rio-macarena",
    "displayName": "Macarena — Los del Río",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "07DcH2UllHvVRKjD2HEJuC",
    "youtubeClips": [
      {
        "videoId": "Z7EsuR5I8SE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Los Del Río - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100). BEHÅLLET 2026-08-12: Peters förslag gwWRjvwlLKg är en privat re-upload; Topic är rättsinnehavarens kanal."
      }
    ]
  },
  {
    "id": "marie-fredriksson-tro",
    "displayName": "Tro — Marie Fredriksson",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5pkO17U6riaIaaTvT7GwCn",
    "youtubeClips": [
      {
        "videoId": "ARvSDkcm0k8",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1411)."
      }
    ]
  },
  {
    "id": "mark-morrison-return-of-the-mack",
    "displayName": "Return of the Mack — Mark Morrison",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3jDdpx9PMlfMBS5tOBHFm9",
    "youtubeClips": [
      {
        "videoId": "uB1D9wWxd2w",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Mark Morrison",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "mr-president-coco-jamboo",
    "displayName": "Coco Jamboo — Mr. President",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "5fRvePkRGdpn2nKacG7I6d",
    "youtubeClips": [
      {
        "videoId": "EScLmWJs82I",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MELOMAN DANCE",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "nas-if-i-ruled-the-world",
    "displayName": "If I Ruled the World — Nas ft. Lauryn Hill",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop",
      "RnB"
    ],
    "parentControlled": true,
    "spotifyTrackId": "5PQmSHzWnlgG4EBuIqjac2",
    "youtubeClips": [
      {
        "videoId": "o2gwGy1ZIMg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Nas",
        "license": "standard"
      }
    ]
  },
  {
    "id": "no-mercy-where-do-you-go",
    "displayName": "Where Do You Go — No Mercy",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "37tzoWY1ubBQKGXiWdO5Qv",
    "youtubeClips": [
      {
        "videoId": "ElAFJopotgw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Greatest Hits",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "oasis-dont-look-back-in-anger",
    "displayName": "Don't Look Back in Anger — Oasis",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7ppPZa3TRUSGKaks9wH7VT",
    "youtubeClips": [
      {
        "videoId": "oplra1FJxWI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Oasis - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "orup-flickan-ovanpa",
    "displayName": "Flickan ovanpå — Orup",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6WhseDHUvM0lOk5oavjztk",
    "youtubeClips": [
      {
        "videoId": "DTraekuMxd4",
        "startSec": 28,
        "endSec": 43,
        "license": "standard"
      }
    ]
  },
  {
    "id": "rob-n-raz-take-a-ride",
    "displayName": "Take a ride — Rob n raz",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "2SlGqfqrW8yfRldGtS4flf",
    "youtubeClips": []
  },
  {
    "id": "spice-girls-wannabe",
    "displayName": "Wannabe — Spice Girls",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1Je1IMUlBXcx1Fz0WE7oPT",
    "youtubeClips": [
      {
        "videoId": "Orz_bA80Ut0",
        "startSec": 48,
        "endSec": 78,
        "channelTitle": "Spice Girls Mania",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "tommy-nilsson-dina-farger-var-bla",
    "displayName": "Dina färger var blå — Tommy Nilsson",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish",
      "Summer"
    ],
    "spotifyTrackId": "2eIe720mhOM77Gfa6I4Url",
    "youtubeClips": [
      {
        "videoId": "2DWUpLh9AbQ",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "toni-braxton-un-break-my-heart",
    "displayName": "Un-Break My Heart — Toni Braxton",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5Ihd9HrPvOADyVoonH9ZjB",
    "youtubeClips": [
      {
        "videoId": "p2Rch6WvPJE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ToniBraxtonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "alexia-uh-la-la-la",
    "displayName": "Uh La La La — Alexia",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "39UwRe2NJbWtMxw5q3EIUI",
    "youtubeClips": [
      {
        "videoId": "alFj9cBDWH0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "SuperGhostkiller",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "ameno-era",
    "displayName": "Era — Ameno",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "04RUPmi7ow2BS7OuxAC02K",
    "youtubeClips": [
      {
        "videoId": "onjPLuZp6hY",
        "startSec": 40,
        "endSec": 70,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "aqua-barbie-girl",
    "displayName": "Barbie Girl — Aqua",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "twW5slEK8wY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MusicVideoHero",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "aqua-doctor-jones",
    "displayName": "Doctor Jones — Aqua",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7pwBWXciUDqOyIvtj82Wcn",
    "youtubeClips": [
      {
        "videoId": "-1jPUB7gRyg",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "backstreet-boys-everybody",
    "displayName": "Everybody (Backstreet's Back) — Backstreet Boys",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3FMSEeODpywjD8BMY6Umj6",
    "youtubeClips": [
      {
        "videoId": "iUfaW-Utn8Y",
        "startSec": 46,
        "endSec": 76,
        "channelTitle": "MASTER RJ",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. ⚠ MASTER RJ är SAMMA re-upload-kanal vars klipp (TJLAJWSEd6U, Thriller) blev region-blockerat i 249 länder inkl. SE 2026-08-10. Spelbar i SE 2026-08-12, men kanalen har redan fallerat en gång — prioritera officiellt ersättningsklipp."
      }
    ]
  },
  {
    "id": "bellini-samba-de-janeiro",
    "displayName": "Samba de Janeiro — Bellini",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "5aIfLbdgkbH7NbQryd1poB",
    "youtubeClips": [
      {
        "videoId": "oKx1NuRqpeM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Bellini_Music_Official",
        "license": "standard",
        "notes": "Officiell artist-kanal Bellini_Music_Official."
      }
    ]
  },
  {
    "id": "billie-myers-kiss-the-rain",
    "displayName": "Kiss the Rain — Billie Myers",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4wtHbIS26FOtpjMkaQQ8Zk",
    "youtubeClips": []
  },
  {
    "id": "blur-song-2",
    "displayName": "Song 2 — Blur",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3GfOAdcoc3X5GPiiXmpBjK",
    "youtubeClips": [
      {
        "videoId": "SSbBvKaM6sk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Blur",
        "license": "standard",
        "notes": "Official music video."
      }
    ]
  },
  {
    "id": "busta-rhymes-turn-it-up",
    "displayName": "Turn It Up — Busta Rhymes",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1ibPpge87Im23po76yNGRO",
    "youtubeClips": []
  },
  {
    "id": "celine-dion-my-heart-will-go-on",
    "displayName": "My Heart Will Go On — Celine Dion",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "368tuOJxckGRWXcYXfJSxX",
    "youtubeClips": [
      {
        "videoId": "CUmOFqQRkco",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "CelineDionOfficialTV",
        "license": "standard",
        "notes": "Official Music Video — Titanic-soundtrack. Chorus area."
      }
    ]
  },
  {
    "id": "cornershop-brimful-of-asha",
    "displayName": "Brimful of Asha — Cornershop",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1t6tQ0ETeOIDl5cscjEC55",
    "youtubeClips": [
      {
        "videoId": "5LBnMRWeV-E",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "daft-punk-around-the-world",
    "displayName": "Around the World — Daft Punk",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop"
    ],
    "spotifyTrackId": "6XKvPNWlmnN0gJejCKm1k7",
    "youtubeClips": [
      {
        "videoId": "K0HSD_i2DvA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Daft Punk",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Remastrad officiell musikvideo."
      }
    ]
  },
  {
    "id": "eagle-eye-cherry-save-tonight",
    "displayName": "Save Tonight — Eagle-Eye Cherry",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1t2Hq2WIBcZINOEnK6mdJG",
    "youtubeClips": [
      {
        "videoId": "Nntd2fgMUYw",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "EagleEyeCherryVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). xlsx hade artist och lat i omvand ordning."
      }
    ]
  },
  {
    "id": "foo-fighters-everlong",
    "displayName": "Everlong — Foo Fighters",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5UWwZ5lm5PKu6eKsHAGxOk",
    "youtubeClips": [
      {
        "videoId": "eBG7P-K-r1Y",
        "startSec": 3,
        "endSec": 33,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1278)."
      }
    ]
  },
  {
    "id": "gala-freed-from-desire",
    "displayName": "Freed from Desire — Gala",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3Ucr6hQQuY8cZ0UqXV8uO2",
    "youtubeClips": []
  },
  {
    "id": "green-day-good-riddance",
    "displayName": "Good Riddance — Green Day",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6ORqU0bHbVCRjXm9AjyHyZ",
    "youtubeClips": []
  },
  {
    "id": "hanson-mmmbop",
    "displayName": "MMMBop — Hanson",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0lnxrQAd9ZxbhBBe7d8FO8",
    "youtubeClips": [
      {
        "videoId": "NHozn0YXAeE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "HansonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1997 = Mercury-singeln/Middle of Nowhere. RATTA INTE till 1996: bandet sjalvslappte en ANNAN inspelning pa indie-albumet MMMBop 1996 - itemet ar 1997-inspelningen."
      }
    ]
  },
  {
    "id": "janet-jackson-together-again",
    "displayName": "Together Again — Janet Jackson",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7EaJPOC3TRnZSciTK7X9HI",
    "youtubeClips": []
  },
  {
    "id": "k-ci-and-jojo-all-my-life",
    "displayName": "All My Life — K-Ci & JoJo",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "RnB"
    ],
    "spotifyTrackId": "5AbXJ33KZWOP8EAglwDaJ6",
    "youtubeClips": [
      {
        "videoId": "DXvMT_mVbqw",
        "startSec": 7,
        "endSec": 37,
        "channelTitle": "KCiAndJoJoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "katrina-waves-love-shine-a-light",
    "displayName": "Love Shine a Light — Katrina and the Waves",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7jxGRU3EH0QveYx4bD32i7",
    "youtubeClips": [
      {
        "videoId": "KwLBCKA5-ls",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1997 vinnare — Storbritannien."
      }
    ]
  },
  {
    "id": "kent-om-du-var-har",
    "displayName": "Om du var här — Kent",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "3rwd5wW9Ew5H6YlyZk9wtH",
    "youtubeClips": [
      {
        "videoId": "gicVQ52huT0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "kentchannel",
        "license": "standard",
        "notes": "Bandets egen kanal. Peter-kurerad 2026-08-11."
      }
    ]
  },
  {
    "id": "kent-utan-dina-andetag",
    "displayName": "Utan dina andetag — Kent",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love",
      "100% in swedish"
    ],
    "spotifyTrackId": "5eJ314ozT4CTPlyjdsGq78",
    "youtubeClips": [
      {
        "videoId": "Q-qnIk9Oxlg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "7clouds Sweden",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "lighthouse-family-high",
    "displayName": "High — Lighthouse Family",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1KP6ieHBqTmEjqLy75gAEn",
    "youtubeClips": [
      {
        "videoId": "taOL5HJdx1A",
        "startSec": 40,
        "endSec": 55,
        "license": "standard"
      }
    ]
  },
  {
    "id": "mariah-carey-honey",
    "displayName": "Honey — Mariah Carey",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5NaOWLOmVjcA3M5spRATN9",
    "youtubeClips": [
      {
        "videoId": "Oy2bwwIsS40",
        "startSec": 22,
        "endSec": 37,
        "license": "standard"
      }
    ]
  },
  {
    "id": "mase-feel-so-good",
    "displayName": "Feel so good — Mase",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "00ovV8FIZewk6NmLd8kZhi",
    "youtubeClips": []
  },
  {
    "id": "natalie-imbruglia-torn",
    "displayName": "Torn — Natalie Imbruglia",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0KDaN0HL3TcJVTbXlQCEsS",
    "youtubeClips": [
      {
        "videoId": "VV1XWJN3nJo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "natalieimbrugliaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 1997 = Imbruglias egen release. Ednaswap/Lis Sorensen spelade in laten 1993 men annan artists inspelning raknas INTE per ar-policyn."
      }
    ]
  },
  {
    "id": "nsync-i-want-you-back",
    "displayName": "I Want You back — Nsync",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "221LRlPHPuevgE1tuUlof9",
    "youtubeClips": []
  },
  {
    "id": "robbie-williams-let-me-entertain-you",
    "displayName": "Let Me entertain You — Robbie Williams",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0SLtqCrXBRrnkxSOMA3X4W",
    "youtubeClips": []
  },
  {
    "id": "savage-garden-truly-madly-deeply",
    "displayName": "Truly Madly Deeply — Savage Garden",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "013AWvizllIUEC2FOBzOnh",
    "youtubeClips": [
      {
        "videoId": "WQnAxOQxQIU",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "SavageGardenVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "shania-twain-man-i-feel-like-a-woman",
    "displayName": "Man! I Feel Like a Woman! — Shania Twain",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6sxptembJVty4sNtcPMAVz",
    "youtubeClips": [
      {
        "videoId": "ZJL4UGSbeFg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ShaniaTwainVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 1997 = albumet Come On Over (nov 1997). GRANSFALL: singeln kom forst mars 1999, sa manga spelare gissar 1999."
      }
    ]
  },
  {
    "id": "shania-twain-youre-still-the-one",
    "displayName": "You’re Still the One — Shania Twain",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1wb4P4F0sxAQ2KXrRvsx6n",
    "youtubeClips": [
      {
        "videoId": "KNZH-emehxA",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "ShaniaTwainVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1997 = albumet Come On Over (nov 1997); singeln kom 1998."
      }
    ]
  },
  {
    "id": "spice-girls-stop",
    "displayName": "Stop — Spice Girls",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3FteycP8CaXS1MhjcXekVT",
    "youtubeClips": []
  },
  {
    "id": "spice-girls-viva-forever",
    "displayName": "Viva Forever — Spice Girls",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6BPDPcnbDMDf58srVzbfX9",
    "youtubeClips": []
  },
  {
    "id": "steps-5-6-7-8",
    "displayName": "5, 6, 7, 8 — Steps",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3GAaCGHwFWY1IIYAbkPcCv",
    "youtubeClips": [
      {
        "videoId": "4NO-h9PFum4",
        "startSec": 4,
        "endSec": 19,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-verve-bitter-sweet-symphony",
    "displayName": "Bitter Sweet Symphony — The Verve",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1ZAhmC1We4HpL2VWK01qpC",
    "youtubeClips": [
      {
        "videoId": "F2fGReDlQa0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Frank Rovers",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-11. OBS: re-upload, inte officiell VEVO-kanal - hogre takedown-risk, nightly autofix-cron plockar upp om den forsvinner."
      }
    ]
  },
  {
    "id": "titanic",
    "displayName": "Titanic",
    "correctYear": 1997,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 95,
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
    "youtubeClips": [
      {
        "videoId": "I7c1etV7D7g",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "20th Century Studios",
        "license": "standard",
        "notes": "Official 25th Anniversary trailer — Celine Dion theme + iconic scenes."
      }
    ]
  },
  {
    "id": "will-smith-gettin-jiggy-with-it",
    "displayName": "Gettin Jiggy With it — Will Smith",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0weAUscowxeqDtpCgtbpgp",
    "youtubeClips": [
      {
        "videoId": "3JcmQONgXJM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      },
      {
        "videoId": "nSqAL95qhRM",
        "startSec": 18,
        "endSec": 48,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "will-smith-men-in-black",
    "displayName": "Men in black — Will Smith",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3Dq2FHZ73hBUG815MoapQu",
    "youtubeClips": []
  },
  {
    "id": "will-smith-miami",
    "displayName": "Miami — Will Smith",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5n276uEKrEFohrt42pP8Tf",
    "youtubeClips": []
  },
  {
    "id": "2pac-changes",
    "displayName": "Changes — 2Pac",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "eXvBjCO19QY",
        "startSec": 13,
        "endSec": 43,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1299)."
      },
      {
        "videoId": "gfF8jMN-2CM",
        "startSec": 13,
        "endSec": 43,
        "license": "standard"
      }
    ]
  },
  {
    "id": "ace-of-base-cruel-summer",
    "displayName": "Cruel Summer — Ace of Base",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4AxVXHgv0clBuS4dl4S7Gw",
    "youtubeClips": [
      {
        "videoId": "sUt0ut92vek",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "aerosmith-i-dont-want-to-miss-a-thing",
    "displayName": "I Dont Want to Miss a Thing — Aerosmith",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "225xvV8r1yKMHErSWivnow",
    "youtubeClips": []
  },
  {
    "id": "alice-deejay-better-of-alone",
    "displayName": "Better of alone — Alice Deejay",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6Dn5iKJnMEEIxdJkTIc9uB",
    "youtubeClips": []
  },
  {
    "id": "baby-one-more-time",
    "displayName": "...Baby One More Time — Britney Spears",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3MjUtNVVq3C8Fn0MP3zhXa",
    "youtubeClips": [
      {
        "videoId": "1dfhNimhwNM",
        "startSec": 16,
        "endSec": 31,
        "channelTitle": "thelanoz video Comeback",
        "license": "standard",
        "notes": "Official 4K 60FPS Video — rörlig MV (skoluniform-scen). 'Oh baby baby' + första vers."
      }
    ]
  },
  {
    "id": "brandy-monica-the-boy-is-mine",
    "displayName": "The Boy Is Mine — Brandy & Monica",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6sHsXIJoEN5JpdkGMQDJxt",
    "youtubeClips": [
      {
        "videoId": "qSIOp_K5GMw",
        "startSec": 19,
        "endSec": 49,
        "channelTitle": "Brandy Videos",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "bryan-adams-when-youre-gone",
    "displayName": "When You're Gone — Bryan Adams & Melanie C",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7p9dd71JR2ucoAuO1Sy0VZ",
    "youtubeClips": [
      {
        "videoId": "_W2jONIjrM0",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "bwitched-c-est-la-vie",
    "displayName": "C'est la Vie — Bwitched",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0SHmApKzT0EWhbFKBjsOex",
    "youtubeClips": [
      {
        "videoId": "UvjLgjtJKsc",
        "startSec": 16,
        "endSec": 46,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "cher-believe",
    "displayName": "Believe — Cher",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2goLsvvODILDzeeiT4dAoR",
    "youtubeClips": [
      {
        "videoId": "nZXRV4MezEw",
        "startSec": 0,
        "endSec": 237,
        "channelTitle": "Cher",
        "license": "standard"
      }
    ]
  },
  {
    "id": "dana-international-diva",
    "displayName": "Diva — Dana International",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1rqPSD8vhtf6jvw3uFTAsz",
    "youtubeClips": [
      {
        "videoId": "4No1oClTp_E",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1998 vinnare — Israel."
      }
    ]
  },
  {
    "id": "dario-g-carnaval-de-paris",
    "displayName": "Carnaval de Paris — Dario G",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "59mdyQniSaNFeXaKMGu9RB",
    "youtubeClips": [
      {
        "videoId": "dLB56lFYlBI",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Dario G",
        "license": "standard",
        "notes": "Official music video. FIFA World Cup France 1998 anthem."
      }
    ]
  },
  {
    "id": "david-gray-babylon",
    "displayName": "Babylon — David Gray",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1sEDn0QkcjWGVoti0Da4kA",
    "youtubeClips": []
  },
  {
    "id": "desree-life",
    "displayName": "Life — Desree",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5ygz3AQbEpt94QeaoCYpPI",
    "youtubeClips": []
  },
  {
    "id": "destinys-child-no-no-no",
    "displayName": "No, no, no — Destinys Child",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5kHgrRO3hMDPehtH9VhYQc",
    "youtubeClips": []
  },
  {
    "id": "dru-hill-how-deep-is-your-love",
    "displayName": "How Deep is your love — Dru Hill",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "60NvAO9lx0KmBNAVHIlWN6",
    "youtubeClips": []
  },
  {
    "id": "faith-hill-this-kiss",
    "displayName": "This Kiss — Faith Hill",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5EYWGM3Ns3iYew8ws0FatB",
    "youtubeClips": []
  },
  {
    "id": "five-everybody-get-up",
    "displayName": "Everybody Get Up — Five",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2lhkUpzW04NeYEicwePekH",
    "youtubeClips": [
      {
        "videoId": "qZUn-KtTNmA",
        "startSec": 50,
        "endSec": 80,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "goo-goo-dolls-iris",
    "displayName": "Iris — Goo Goo Dolls",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6vrUTGn5p8IrfTZ0J6sIVM",
    "youtubeClips": [
      {
        "videoId": "NdYWuo9OFAw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Goo Goo Dolls",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "goo-goo-dolls-slide",
    "displayName": "Slide — Goo Goo Dolls",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0nnwn7LWHCAu09jfuH1xTA",
    "youtubeClips": []
  },
  {
    "id": "jay-z-hard-knock-life",
    "displayName": "Hard Knock Life — Jay Z",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5Tl0HJvynZtKdSUMKbFVVX",
    "youtubeClips": []
  },
  {
    "id": "jennifer-paige-crush",
    "displayName": "Crush — Jennifer Paige",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6YXWauQKn5nQVhcC4KVplQ",
    "youtubeClips": [
      {
        "videoId": "EIhSnaqou0I",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "jessica-folcker-how-will-i-know-who-you-are",
    "displayName": "How Will I Know (Who You Are) — Jessica Folcker",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "na9U2GBu-KU",
        "startSec": 9,
        "endSec": 24,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jill-johnson-karleken-ar",
    "displayName": "Kärleken är — Jill Johnson",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "69o3qL8watZsJZJPS6cuuR",
    "youtubeClips": [
      {
        "videoId": "nMrluZPFMZs",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1998 vinnare."
      }
    ]
  },
  {
    "id": "lauryn-hill-doo-wop",
    "displayName": "Doo Wop — Lauryn Hill",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0uEp9E98JB5awlA084uaIg",
    "youtubeClips": [
      {
        "videoId": "T6QKqFPRZSA",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "lenny-kravitz-fly-away",
    "displayName": "Fly Away — Lenny Kravitz",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "1dRWTMslNWdfL8SiToJiB5",
    "youtubeClips": [
      {
        "videoId": "EvuL5jyCHOw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "LennyKravitzVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "lutricia-mcneal-stranded",
    "displayName": "Stranded — Lutricia McNeal",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0OHnH83nuRxZzGWtWROOdy",
    "youtubeClips": []
  },
  {
    "id": "madonna-frozen",
    "displayName": "Frozen — Madonna",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2II03llydk4YnkBBvoYB3B",
    "youtubeClips": [
      {
        "videoId": "XS088Opj9o0",
        "startSec": 0,
        "endSec": 329,
        "channelTitle": "Madonna",
        "license": "standard"
      }
    ]
  },
  {
    "id": "madonna-the-power-of-goodbye",
    "displayName": "The Power of Goodbye — Madonna",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "01VFDkHBNJcCNUjzD3flWg",
    "youtubeClips": []
  },
  {
    "id": "markoolio-sommar-och-sol",
    "displayName": "Sommar och sol — Markoolio",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "4bpqcGVSveDZ5E3rgr9v2y",
    "youtubeClips": [
      {
        "videoId": "7mEEiPJXIAA",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-30 (ersatte 98ID_halfhs)."
      }
    ]
  },
  {
    "id": "mulan-1998",
    "displayName": "Mulan",
    "correctYear": 1998,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
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
    "youtubeClips": [
      {
        "videoId": "sRtZaSkBp58",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Allen Theatres Inc",
        "license": "standard",
        "notes": "Original 1998 teatral trailer — Mulan som krigare + Make a Man Out of You-känsla."
      }
    ]
  },
  {
    "id": "offspring-pretty-fly",
    "displayName": "Pretty Fly (For a White Guy) — The Offspring",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "1DabbsNEatanGxAHYaHgJn",
    "youtubeClips": [
      {
        "videoId": "QtTR-_Klcq8",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "OffspringVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "petter-vinden-har-vant",
    "displayName": "Vinden har vänt — Petter",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "2XkMVyMLZhrUivl7XuhidO",
    "youtubeClips": [
      {
        "videoId": "gITjhYfdjvs",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "pras-ghetto-superstar",
    "displayName": "Ghetto Superstar — Pras",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "31bf9SEOppLU6lQ85d8om6",
    "youtubeClips": [
      {
        "videoId": "Ro6q1SeYHTg",
        "startSec": 16,
        "endSec": 46,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "sash-mysterious-times",
    "displayName": "Mysterious Times — Sash",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3w6BcLgFqVSOK8RnV4k7Cd",
    "youtubeClips": []
  },
  {
    "id": "sasha-if-you-believe",
    "displayName": "If You Believe — Sasha",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3Nr7RPHiDQ01tAXVcufeUW",
    "youtubeClips": []
  },
  {
    "id": "scooter-how-much-is-the-fish",
    "displayName": "How Much Is the Fish? — Scooter",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "sport",
      "Dance Music"
    ],
    "spotifyTrackId": "31JhTEAWmmhZIZTm40pQZr",
    "youtubeClips": [
      {
        "videoId": "0IDOUiQj5hY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Scooter - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters cbB3iGRHtqA (Scooters egen upload) ar SD; bytt till Topic-kanalens HD-audio."
      }
    ]
  },
  {
    "id": "semisonic-closing-time",
    "displayName": "Closing time — Semisonic",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "087OBLtoeS3Q6j0k6tMNAI",
    "youtubeClips": [
      {
        "videoId": "xGytDsqkQY8",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "southside-spinners-luvstruck",
    "displayName": "Luvstruck — Southside Spinners",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5kW0BW8B5hjrbpe0OuFUr9",
    "youtubeClips": [
      {
        "videoId": "FOfXUmOiUDg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Southside Spinners",
        "license": "standard",
        "notes": "Official video 2000."
      }
    ]
  },
  {
    "id": "stardust-music-sounds-better-with-you",
    "displayName": "Music Sounds better with you — Stardust",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "303ccTay2FiDTZ9fZ2AdBt",
    "youtubeClips": []
  },
  {
    "id": "the-cardigans-my-favourite-game",
    "displayName": "My Favourite Game — The Cardigans",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "u9WgtlgGAgs",
        "startSec": 30,
        "endSec": 45,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-corrs-what-can-i-do",
    "displayName": "What Can i Do — The Corrs",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5SnIsMOvADksUAcM8XReYs",
    "youtubeClips": []
  },
  {
    "id": "tq-westside",
    "displayName": "Westside — TQ",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6I3LsZncKrJG9mwv12FCEg",
    "youtubeClips": []
  },
  {
    "id": "u2-sweetest-thing",
    "displayName": "Sweetest thing — U2",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "43HrhMlI1t3PTlgRipISqq",
    "youtubeClips": []
  },
  {
    "id": "vengaboys-boom-boom-boom-boom",
    "displayName": "Boom, Boom, Boom, Boom!! — Vengaboys",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2Ld2LehpgQNREMxl9LlIzm",
    "youtubeClips": [
      {
        "videoId": "llyiQ4I-mcQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Vengaboys",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "whitney-houston-when-you-believe",
    "displayName": "When You Believe — Whitney Houston & Mariah Carey",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4lIC8vFaNZ6UiLJZ7944LP",
    "youtubeClips": [
      {
        "videoId": "LKaXY4IdZ40",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "whitneyhoustonVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "antique-dinata-dinata",
    "displayName": "Dinata Dinata — Antique",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "28nEArUuaUk4tYkdQfQ4Ov",
    "youtubeClips": [
      {
        "videoId": "474UjAuu0mc",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "antique-opa-opa",
    "displayName": "Opa Opa — Antique",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7IOlbck6GABZ4LKKt33qgp",
    "youtubeClips": [
      {
        "videoId": "HiWQC4Ynu2k",
        "startSec": 23,
        "endSec": 38,
        "license": "standard"
      }
    ]
  },
  {
    "id": "backstreet-boys-i-want-it-that-way",
    "displayName": "I Want It That Way — Backstreet Boys",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "47BBI51FKFwOMlIiX6m8ya",
    "youtubeClips": [
      {
        "videoId": "4fndeDfaWCg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BackstreetBoysVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "backstreet-boys-show-me-the-meaning-of-being-lonely",
    "displayName": "Show me the meaning of being lonely — Backstreet Boys",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3BsaRV5QIulYz2lV9WWa8T",
    "youtubeClips": []
  },
  {
    "id": "blink-182-all-the-small-things",
    "displayName": "All the Small Things — blink-182",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "2m1hi0nfMR9vdGC8UcrnwU",
    "youtubeClips": [
      {
        "videoId": "9Ht5RZpzPqw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "blink182VEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "bloodhound-gang-the-bad-touch",
    "displayName": "The Bad Touch — Bloodhound Gang",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5tXeQjDShUMNSelZirUOEu",
    "youtubeClips": [
      {
        "videoId": "-6U_QctZg94",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "bomfunk-mcs-freestyler",
    "displayName": "Freestyler — Bomfunk MCs",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2vlgOAH3M8Fmo19wOjeRyw",
    "youtubeClips": []
  },
  {
    "id": "britney-spears-born-to-make-you-happy",
    "displayName": "Born To Make you happy — Britney Spears",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4l1MNtoCiTxBwf6yxD7kFd",
    "youtubeClips": []
  },
  {
    "id": "charlotte-nilsson-tusen-och-en-natt",
    "displayName": "Tusen och en natt — Charlotte Nilsson",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6JIwvW8ioos5KFp0Q0mS3Y",
    "youtubeClips": [
      {
        "videoId": "a0cERXG3m90",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1999 vinnare, ESC-vinnare 1999. ESC-version på engelska (Take Me To Your Heaven)."
      }
    ]
  },
  {
    "id": "christina-aguilera-genie-in-a-bottle",
    "displayName": "Genie in a bottle — Christina Aguilera",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "11mwFrKvLXCbcVGNxffGyP",
    "youtubeClips": []
  },
  {
    "id": "christina-aguilera-i-turn-to-you",
    "displayName": "I turn to you — Christina Aguilera",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4Do68W4FWO2hRAJCzG1lus",
    "youtubeClips": []
  },
  {
    "id": "creed-higher",
    "displayName": "Higher — Creed",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2xUhsJBiN3uLr8jH5hc0zW",
    "youtubeClips": []
  },
  {
    "id": "destinys-child-jumpin-jumpin",
    "displayName": "Jumpin jumpin — Destinys Child",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4pmc2AxSEq6g7hPVlJCPyP",
    "youtubeClips": []
  },
  {
    "id": "destinys-child-say-my-name",
    "displayName": "Say My Name — Destiny’s Child",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "7H6ev70Weq6DdpZyyTmUXk",
    "youtubeClips": [
      {
        "videoId": "sQgd6MccwZc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "DestinysChildVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1999 = albumet The Writing's on the Wall (MusicBrainz gav felaktigt 1998)."
      }
    ]
  },
  {
    "id": "dmx-party-up",
    "displayName": "Party Up — DMX",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "3Y4BqG5FGXgGFQaJzX1MQC",
    "youtubeClips": [
      {
        "videoId": "cNYUnKMCa7Y",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1296)."
      }
    ]
  },
  {
    "id": "dr-dre-still-dre",
    "displayName": "Still D.R.E. — Dr. Dre feat. Snoop Dogg",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "503OTo2dSqe7qk76rgsbep",
    "youtubeClips": [
      {
        "videoId": "_CL6n0FJZpk",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1279)."
      }
    ]
  },
  {
    "id": "dr-dre-the-next-episode",
    "displayName": "The Next Episode — Dr. Dre ft. Snoop Dogg",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "4LwU4Vp6od3Sb08CsP99GC",
    "youtubeClips": [
      {
        "videoId": "f0dkQGfha3A",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Dr. Dre",
        "license": "standard"
      }
    ]
  },
  {
    "id": "eiffel-65-blue",
    "displayName": "Blue (Da Ba Dee) — Eiffel 65",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "2aPbkXxYRTQ1cQrscHswuM",
    "youtubeClips": [
      {
        "videoId": "kyzIQKuSqBs",
        "startSec": 0,
        "endSec": 220,
        "channelTitle": "Eiffel 65 - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "eminem-my-name-is",
    "displayName": "My Name Is — Eminem",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "75IN3CtuZwTHTnZvYM4qnJ",
    "youtubeClips": [
      {
        "videoId": "sNPnbI1arSE",
        "startSec": 10,
        "endSec": 25,
        "license": "standard"
      }
    ]
  },
  {
    "id": "enrique-iglesias-bailamos",
    "displayName": "Bailamos — Enrique Iglesias",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "youtubeClips": [
      {
        "videoId": "bJE308E1gTk",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Enrique Iglesias",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "enrique-iglesias-be-with-you",
    "displayName": "Be with you — Enrique Iglesias",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1lZ4j5WBURBwZ0M5TT46wP",
    "youtubeClips": []
  },
  {
    "id": "enrique-iglesias-could-i-have-this-kiss-forever",
    "displayName": "Could I Have This Kiss Forever — Enrique Iglesias & Whitney Houston",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3XkLdXXnh4sviCzhO0bu23",
    "youtubeClips": [
      {
        "videoId": "zsfj9j0kjoU",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1303)."
      }
    ]
  },
  {
    "id": "jennifer-lopez-if-you-had-my-love",
    "displayName": "If You Had My Love — Jennifer Lopez",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3x4yV0hW5Ve3TKhFkXSqFn",
    "youtubeClips": [
      {
        "videoId": "lYfkl-HXfuU",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "JenniferLopezVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "kent-music-non-stop",
    "displayName": "Music Non Stop — Kent",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "4BNQYX6evCh4gmTWZyVm4l",
    "youtubeClips": [
      {
        "videoId": "HJXsv1UIDmQ",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Kent - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "lene-marlin-sitting-down-here",
    "displayName": "Sitting Down Here — Lene Marlin",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2NwXOuYLEbyhlQzDtoANul",
    "youtubeClips": []
  },
  {
    "id": "lou-bega-mambo-no-5",
    "displayName": "Mambo No. 5 — Lou Bega",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6x4tKaOzfNJpEJHySoiJcs",
    "youtubeClips": [
      {
        "videoId": "bZlwFBnog7Q",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MVIDEO4K",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Videotitel verifierad: '[4K] Lou Bega - Mambo No. 5 (A Little Bit Of...) (Music Video)' — inget ar i titeln."
      }
    ]
  },
  {
    "id": "marc-anthony-you-sang-to-me",
    "displayName": "You sang to me — Marc Anthony",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2dwhMQsFeHr2S787WxqAqW",
    "youtubeClips": []
  },
  {
    "id": "martin-du-ar-sa-yeah-yeah-wow-wow",
    "displayName": "Du är så yeah yeah wow wow — Martin",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "6CEi2df5s6IsPVYxAFXjOs",
    "youtubeClips": [
      {
        "videoId": "InHUeiPNBDk",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1401)."
      }
    ]
  },
  {
    "id": "mel-c-never-be-the-same-again",
    "displayName": "Never be the same again — Mel C",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "79EAVfOpzgfHx3IE2BVFQv",
    "youtubeClips": []
  },
  {
    "id": "melanie-c-i-turn-to-you",
    "displayName": "I turn to you — Melanie C",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1Le4SDanBrX8OtmnnyTNrh",
    "youtubeClips": []
  },
  {
    "id": "red-hot-chili-peppers-californication",
    "displayName": "Californication — Red Hot chili peppers",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "48UPSzbZjgc449aqz8bxox",
    "youtubeClips": []
  },
  {
    "id": "red-hot-chili-peppers-otherside",
    "displayName": "Otherside — Red Hot chili peppers",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3CeYdUfGPCjKMDYyI1PpCh",
    "youtubeClips": []
  },
  {
    "id": "ricky-martin-livin-la-vida-loca",
    "displayName": "Livin' la Vida Loca — Ricky Martin",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0Ph6L4l8dYUuXFmb71Ajnd",
    "youtubeClips": [
      {
        "videoId": "ikDPvDInr00",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MVIDEO4K",
        "license": "standard",
        "notes": "Ersatte Peters lank UxQ7PAerVdE 2026-08-14: samma officiella video men SD (HD-gaten flaggade den). Detta ar 4K-uppladdningen, titel '[4K] Ricky Martin - Livin' La Vida Loca (Music Video)' — inget ar i titeln. Samma kanal som lou-bega-mambo-no-5."
      }
    ]
  },
  {
    "id": "santana-maria-maria",
    "displayName": "Maria Maria — Santana",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "567UAkWoLBqZ709s3Qcbze",
    "youtubeClips": []
  },
  {
    "id": "savage-garden-crash-and-burn",
    "displayName": "Crash and Burn — Savage Garden",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "60g4sp8i3gXSb1EkphMl1g",
    "youtubeClips": []
  },
  {
    "id": "sisqo-thong-song",
    "displayName": "Thong song — Sisqo",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4GgBpJYckh7S5Hr0OEmupd",
    "youtubeClips": []
  },
  {
    "id": "smash-mouth-all-star",
    "displayName": "All Star — Smash Mouth",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3cfOd4CMv2snFaKAnMdnvK",
    "youtubeClips": [
      {
        "videoId": "L_jWHffIx5E",
        "startSec": 37,
        "endSec": 67,
        "channelTitle": "SmashMouthVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 1999 = albumet Astro Lounge (MusicBrainz gav felaktigt 1997)."
      }
    ]
  },
  {
    "id": "the-matrix",
    "displayName": "The Matrix",
    "correctYear": 1999,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 93,
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
    "isAnimated": false,
    "correctNames": [
      "Keanu Reeves",
      "Laurence Fishburne"
    ],
    "distractorNames": [
      "Brad Pitt",
      "Nicolas Cage",
      "Hugh Jackman",
      "Will Smith"
    ],
    "youtubeClips": [
      {
        "videoId": "vKQi3bBA1y8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Official 1999-trailer — bullet-time + Neo/Trinity-scener."
      }
    ]
  },
  {
    "id": "vengaboys-up-and-down",
    "displayName": "Up and Down — Vengaboys",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3uyJrbOnK7fMunoFjRfsew",
    "youtubeClips": []
  },
  {
    "id": "vengaboys-we-like-to-party",
    "displayName": "We like to Party — Vengaboys",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "73ljrkSg4A0q3ByU0Cu7mw",
    "youtubeClips": []
  },
  {
    "id": "zombie-nation-kernkraft-400",
    "displayName": "Kernkraft 400 — Zombie Nation",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6PUzxtIHkv346yP89NzP9X",
    "youtubeClips": [
      {
        "videoId": "SxhwbXYe1XE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Zombie Nation",
        "license": "standard",
        "notes": "Official video 1999."
      }
    ]
  },
  {
    "id": "3-doors-down-kryptonite",
    "displayName": "Kryptonite — 3 Doors down",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6ZOBP3NvffbU4SZcrnt1k6",
    "youtubeClips": []
  },
  {
    "id": "98-degrees-give-me-just-one-night",
    "displayName": "Give me just one night — 98 Degrees",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1OvjOVieEsYqGiK1T3mUv9",
    "youtubeClips": []
  },
  {
    "id": "aaliyah-try-again",
    "displayName": "Try Again — Aaliyah",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1sajFP2jfMC8itMG29Fivg",
    "youtubeClips": []
  },
  {
    "id": "alcazar-crying-at-the-discoteque",
    "displayName": "Crying at the Discoteque — Alcazar",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "1ahgFXU3pVMgREuWEG5V4A",
    "youtubeClips": [
      {
        "videoId": "7CiOWcUVGJM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1275)."
      }
    ]
  },
  {
    "id": "alizee-moi-lolita",
    "displayName": "Moi Lolita — Alizee",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6e0LjNPkRqxIAlmmdjWSV8",
    "youtubeClips": []
  },
  {
    "id": "all-saints-pure-shores",
    "displayName": "Pure Shores — All Saints",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "6ZLGthToczpvnL5Eoy6yrY",
    "youtubeClips": [
      {
        "videoId": "dVNdTXEJv1A",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "anastacia-im-outta-love",
    "displayName": "Im Outta Love — Anastacia",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "77vCn7iUHH8KAOqdOe1XjY",
    "youtubeClips": []
  },
  {
    "id": "atc-around-the-world",
    "displayName": "Around the world — ATC",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7CvOnbFdnIoXMQ4eFCo5lB",
    "youtubeClips": []
  },
  {
    "id": "baha-men-who-let-the-dogs-out",
    "displayName": "Who let the dogs out — Baha Men",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1H5tvpoApNDxvxDexoaAUo",
    "youtubeClips": []
  },
  {
    "id": "barbados-kom-hem",
    "displayName": "Kom hem — Barbados",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "71IcKgzWI4wyjBmar9hzy5",
    "youtubeClips": [
      {
        "videoId": "Bc-qN5hO8OM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Barbados - Topic",
        "license": "standard",
        "notes": "Officiell Topic-kanal. Studio 2000. Ersatte fan-uppladdning (7ZYGyCPVwo4)."
      }
    ]
  },
  {
    "id": "bon-jovi-its-my-life",
    "displayName": "It's My Life — Bon Jovi",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "4LNp19tNuv3UuhYyxnJ0TY",
    "youtubeClips": [
      {
        "videoId": "bY3vXr7fm8k",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Jon Bon Jovi - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "britney-spears-oops-i-did-it-again",
    "displayName": "Oops!... I Did It Again — Britney Spears",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6naxalmIoLFWR0siv8dnQQ",
    "youtubeClips": [
      {
        "videoId": "gmWlNI4Zl2s",
        "startSec": 0,
        "endSec": 211,
        "channelTitle": "Unique Sound",
        "license": "standard"
      }
    ]
  },
  {
    "id": "britney-spears-stronger",
    "displayName": "Stronger — Britney Spears",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7iYcgFwBk2nm7xopJGs56E",
    "youtubeClips": []
  },
  {
    "id": "coldplay-trouble",
    "displayName": "Trouble — Coldplay",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4mxOn4jDMNQT0ufoG9ykEF",
    "youtubeClips": []
  },
  {
    "id": "coldplay-yellow",
    "displayName": "Yellow — Coldplay",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1aUTJpaxVd8LpUfbb19wZH",
    "youtubeClips": [
      {
        "videoId": "yKNxeF4KMsY",
        "startSec": 0,
        "endSec": 273,
        "channelTitle": "Coldplay",
        "license": "standard"
      }
    ]
  },
  {
    "id": "craig-david-7-days",
    "displayName": "7 Days — Craig David",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0gPQTLaqHDgdupKEok7J2x",
    "youtubeClips": []
  },
  {
    "id": "crouching-tiger-hidden-dragon-2000",
    "displayName": "Crouching Tiger, Hidden Dragon",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "q-HrIQLdaNE",
        "startSec": 46,
        "endSec": 76,
        "channelTitle": "Sony Pictures Classics",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Officiell Sony Pictures Classics-trailer, ingen ar-spoiler i titeln."
      }
    ]
  },
  {
    "id": "daft-punk-one-more-time",
    "displayName": "One more time — Daft Punk",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0DiWol3AO6WpXZgp0goxAV",
    "youtubeClips": []
  },
  {
    "id": "dude-wheres-my-car-2000",
    "displayName": "Dude, Where's My Car?",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "jH_nkW3QtFg",
        "startSec": 1,
        "endSec": 31,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "eminem-stan",
    "displayName": "Stan — Eminem",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3UmaczJpikHgJFyBTAJVoz",
    "youtubeClips": []
  },
  {
    "id": "eminem-the-real-slim-shady",
    "displayName": "The real slim shady — Eminem",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3yfqSUWxFvZELEM4PmlwIR",
    "youtubeClips": []
  },
  {
    "id": "gigi-dagostino-la-passion",
    "displayName": "La Passion — Gigi Dágostino",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0XlRv74jaOmgID3p5X5wUD",
    "youtubeClips": []
  },
  {
    "id": "gladiator-2000",
    "displayName": "Gladiator",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
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
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Russell Crowe"
    ],
    "distractorNames": [
      "Mel Gibson",
      "Tom Cruise",
      "Kevin Costner",
      "Brad Pitt"
    ],
    "youtubeClips": [
      {
        "videoId": "gDbltV8z7dQ",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Paramount Movies",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell Paramount-klipp 'My name is Maximus' (2000-filmen, ej Gladiator II)."
      }
    ]
  },
  {
    "id": "jennifer-lopez-love-dont-cost-a-thing",
    "displayName": "Love Don’t Cost a Thing — Jennifer Lopez",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1fgvJXlcZ7uIddMpqsqw0L",
    "youtubeClips": [
      {
        "videoId": "4kGvlESGvbs",
        "startSec": 35,
        "endSec": 65,
        "channelTitle": "JenniferLopezVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "kylie-minogue-spinning-around",
    "displayName": "Spinning Around — Kylie Minogue",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2G9ys1ZXI98XAn7SMzPt9q",
    "youtubeClips": [
      {
        "videoId": "t1DWBKk5xHQ",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "leann-rimes-cant-fight-the-moonlight",
    "displayName": "Cant Fight the moonlight — LeAnn Rimes",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "10FP9hm2aFfAIKEopqaG9D",
    "youtubeClips": []
  },
  {
    "id": "lenny-kravitz-again",
    "displayName": "Again — Lenny Kravitz",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "16gvJsVyauI16RqmOrwJJk",
    "youtubeClips": []
  },
  {
    "id": "limp-bizkit-take-a-look-around",
    "displayName": "Take a look around — Limp Bizkit",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2avKuMN2QXkaG9vvHa2JLt",
    "youtubeClips": []
  },
  {
    "id": "madonna-dont-tell-me",
    "displayName": "Dont tell me — Madonna",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "23EhTCPRTlLVM6VQUyh8bH",
    "youtubeClips": []
  },
  {
    "id": "madonna-music",
    "displayName": "Music — Madonna",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2fzykVsO2Di5jnofUNX3YE",
    "youtubeClips": []
  },
  {
    "id": "markoolio-mera-mal",
    "displayName": "Mera mål — Markoolio",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "08oSaHoJ7jrFv1kd74ZRT2",
    "youtubeClips": [
      {
        "videoId": "iqMDJSZMDQY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Markoolio",
        "license": "standard"
      }
    ]
  },
  {
    "id": "matchbox-twenty-if-youre-gone",
    "displayName": "If Youre Gone — Matchbox Twenty",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2f5N826udWfjT9iomeaBJt",
    "youtubeClips": []
  },
  {
    "id": "modjo-lady",
    "displayName": "Lady — Modjo",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "49X0LAl6faAusYq02PRAY6",
    "youtubeClips": []
  },
  {
    "id": "nsync-bye-bye-bye",
    "displayName": "Bye bye bye — Nsync",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "62bOmKYxYg7dhrC6gH9vFn",
    "youtubeClips": []
  },
  {
    "id": "olsen-brothers-fly-on-wings-of-love",
    "displayName": "Fly on the Wings of Love — Olsen Brothers",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "0wyLws467FJpIthouxPCNh",
    "youtubeClips": [
      {
        "videoId": "JF8fkHK0AWs",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2000 vinnare — Danmark."
      }
    ]
  },
  {
    "id": "outkast-ms-jackson",
    "displayName": "Ms. Jackson — OutKast",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "6NaAJpVP9tj0xwELbASFyk",
    "youtubeClips": [
      {
        "videoId": "EUVo8epKwv0",
        "startSec": 10,
        "endSec": 30,
        "channelTitle": "OutKast",
        "license": "standard",
        "notes": "Official music video."
      }
    ]
  },
  {
    "id": "papa-roach-last-resort",
    "displayName": "Last Resort — Papa Roach",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5eek2X5459T1HoYJk2CKXv",
    "youtubeClips": []
  },
  {
    "id": "rednex-spirit-of-the-hawk",
    "displayName": "Spirit of the hawk — Rednex",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7xXSaVgEvUrV1GCc3oO8HC",
    "youtubeClips": []
  },
  {
    "id": "ricky-martin-she-bangs",
    "displayName": "She Bangs — Ricky Martin",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1uPrIHgYztXSkkcts9jet8",
    "youtubeClips": []
  },
  {
    "id": "robbie-williams-rock-dj",
    "displayName": "Rock DJ — Robbie Williams",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7oQSevUCbYs4QawXTHQVV1",
    "youtubeClips": []
  },
  {
    "id": "robbie-williams-supreme",
    "displayName": "Supreme — Robbie Williams",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4dZ3V71vsqSn9MJ18y8YaJ",
    "youtubeClips": []
  },
  {
    "id": "roger-pontare-vindarna-viskar",
    "displayName": "När vindarna viskar mitt namn — Roger Pontare",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "1nSyBcZr8IS9wZcFyvqqE7",
    "youtubeClips": [
      {
        "videoId": "ZgPzU2Nlonw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Melodifestivalen",
        "license": "standard",
        "notes": "Melodifestivalen 2000 vinnare."
      }
    ]
  },
  {
    "id": "ronan-keating-life-is-a-rollercoaster",
    "displayName": "Life is a rollercoaster — Ronan Keating",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1vlTMKVV0FxG6CxGTmSY3t",
    "youtubeClips": []
  },
  {
    "id": "samantha-mumba-gotta-tell-you",
    "displayName": "Gotta tell you — Samantha Mumba",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1rj0XawWJNisX7SGYexowJ",
    "youtubeClips": []
  },
  {
    "id": "snatch-2000",
    "displayName": "Snatch",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "genrePackages": [
      "sport"
    ],
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Brad Pitt",
      "Jason Statham"
    ],
    "distractorNames": [
      "Vin Diesel",
      "Dwayne Johnson",
      "Gerard Butler",
      "Mark Wahlberg"
    ],
    "youtubeClips": [
      {
        "videoId": "9Jar2XkBboo",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Movieclips Classic Trailers",
        "license": "standard",
        "notes": "Snatch (2000) — officiell trailer. Vinnie Jones (f.d. Wimbledon FC) som Bullet Tooth Tony. genrePackages:sport → surfar under Athletes/Sport-filtret trots Film-nativ-kategori."
      }
    ]
  },
  {
    "id": "sonique-it-feels-so-good",
    "displayName": "It feels so good — Sonique",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4Y8q64VnhD0vFYy9g2WFpi",
    "youtubeClips": []
  },
  {
    "id": "sonique-sky",
    "displayName": "Sky — Sonique",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5Dw2ZtZJRDDJpFgDkgNBUi",
    "youtubeClips": []
  },
  {
    "id": "spiller-groovejet",
    "displayName": "Groovejet — Spiller",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1o2QXBJvkXTgDDM6EvjU9I",
    "youtubeClips": []
  },
  {
    "id": "the-beach-2000",
    "displayName": "The Beach",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "t99_nC_tYVM",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "the-corrs-breathless",
    "displayName": "Breathless — The Corrs",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5OQGeJ1ceykovrykZsGhqL",
    "youtubeClips": []
  },
  {
    "id": "the-hives-hate-to-say",
    "displayName": "Hate to Say I Told You So — The Hives",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "spotifyTrackId": "6xxXrNJnnsQNLdgNk8S4y8",
    "youtubeClips": []
  },
  {
    "id": "thomas-rusiak-hiphopper",
    "displayName": "Hiphopper — Thomas Rusiak",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0x33TsFwcpAZBxePZmokvu",
    "youtubeClips": [
      {
        "videoId": "Jvf7I7ypTIc",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1283)."
      }
    ]
  },
  {
    "id": "tom-jones-sex-bomb",
    "displayName": "Sex Bomb — Tom Jones",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6ZpN2cfccVIHR4dWp9xq3t",
    "youtubeClips": []
  },
  {
    "id": "toni-braxton-he-wasnt-man-enough",
    "displayName": "He Wasn't Man Enough — Toni Braxton",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7f1Dmr246cJ9uQYdbplTbh",
    "youtubeClips": [
      {
        "videoId": "9_hKXk2qSuw",
        "startSec": 25,
        "endSec": 55,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1306)."
      }
    ]
  },
  {
    "id": "toploader-dancing-in-the-moonlight",
    "displayName": "Dancing in the moonlight — Toploader",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3Fzlg5r1IjhLk2qRw667od",
    "youtubeClips": []
  },
  {
    "id": "u2-beautiful-day",
    "displayName": "Beautiful day — U2",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3neaDAFxNDKOsXPKVXkftP",
    "youtubeClips": []
  },
  {
    "id": "vanessa-amorosi-absolutely-everybody",
    "displayName": "Absolutely Everybody — Vanessa Amorosi",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0DaOFUhUEc416QdUaW9paE",
    "youtubeClips": []
  },
  {
    "id": "wu-tang-clan-gravel-pit",
    "displayName": "Gravel Pit — Wu-tang clan",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3p7xsZoUYnissvpBpCVZXm",
    "youtubeClips": []
  },
  {
    "id": "alicia-keys-fallin",
    "displayName": "Fallin' — Alicia Keys",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "3unsLiH5FXmaDWtT5Imolu",
    "youtubeClips": [
      {
        "videoId": "abcZMQASXF8",
        "startSec": 0,
        "endSec": 211,
        "channelTitle": "Bussin",
        "license": "standard"
      }
    ]
  },
  {
    "id": "american-pie-2-2001",
    "displayName": "American Pie 2",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "FLWu4KewJlU",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "antique-die-for-you",
    "displayName": "(I Would) Die for You — Antique",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2byZAXWOqDx3w8suK3btui",
    "youtubeClips": [
      {
        "videoId": "VVLfuW3KiLY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Antique",
        "license": "standard",
        "notes": "Official music video. ESC 2001 Greece entry (3rd place)."
      },
      {
        "videoId": "VVLfuW3KiLY",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "ateens-upside-down",
    "displayName": "Upside down — Ateens",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3lfLAToNl2Ibcuo9U6UTSd",
    "youtubeClips": []
  },
  {
    "id": "darude-sandstorm",
    "displayName": "Sandstorm — Darude",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6Sy9BUbgFse0n0LPA5lwy5",
    "youtubeClips": []
  },
  {
    "id": "destinys-child-bootylicious",
    "displayName": "Bootylicious — Destiny’s Child",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "41nT1Sp6ChR65FbsdLlFHW",
    "youtubeClips": [
      {
        "videoId": "IyYnnUcgeMc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "DestinysChildVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "destinys-child-independent-women",
    "displayName": "Independent Women — Destinys child",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "69XUpOpjzDKcfdxqZebGiI",
    "youtubeClips": []
  },
  {
    "id": "destinys-child-survivor",
    "displayName": "Survivor — Destiny's Child",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "2Mpj1Ul5OFPyyP4wB62Rvi",
    "youtubeClips": [
      {
        "videoId": "Wmc8bQoL-J0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "DestinysChildVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "friends-lyssna-till-ditt-hjarta",
    "displayName": "Lyssna till ditt hjärta — Friends",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "4BhEDrbVxPgu13SQFwoDCV",
    "youtubeClips": []
  },
  {
    "id": "harry-potter-philosophers-stone-2001",
    "displayName": "Harry Potter and the Philosopher's Stone",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 91,
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
    "isAnimated": false,
    "correctNames": [
      "Daniel Radcliffe",
      "Emma Watson"
    ],
    "distractorNames": [
      "Tobey Maguire",
      "Elijah Wood",
      "Macaulay Culkin",
      "Jake Lloyd"
    ],
    "youtubeClips": [
      {
        "videoId": "iSItf2y7hgs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "ClipZone: Heroes & Villains",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — scen ur 2001-filmen (ej 2026 HBO-reboot-teaser)."
      }
    ]
  },
  {
    "id": "kylie-minogue-cant-get-you-out-of-my-head",
    "displayName": "Can't Get You Out of My Head — Kylie Minogue",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2HpWHLtZldOcDn5qzX8kb2",
    "youtubeClips": [
      {
        "videoId": "c18441Eh_WE",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-14. Kanal ej verifierad."
      }
    ]
  },
  {
    "id": "lady-marmalade-2001",
    "displayName": "Lady Marmalade — Christina Aguilera, Lil' Kim, Mýa & Pink",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "7GbqE3MlkKosIaCvf50JRK",
    "youtubeClips": [
      {
        "videoId": "YMv3EGB9Uaw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MUSIC EVOLUTION",
        "license": "standard",
        "notes": "Official Video 4K 60fps remaster — HD-fix av tidigare SD-klipp 2026-05-22. Refrängområde."
      }
    ]
  },
  {
    "id": "lotr-fellowship-2001",
    "displayName": "The Lord of the Rings: The Fellowship of the Ring",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 89,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Elijah Wood",
      "Ian McKellen"
    ],
    "distractorNames": [
      "Tobey Maguire",
      "Daniel Radcliffe",
      "Brendan Fraser",
      "Ewan McGregor"
    ],
    "youtubeClips": [
      {
        "videoId": "_nZdmwHrcnw",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Warner Bros. Entertainment",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12 — ersatte Movieclips-trailern (V75dMMIW2B4) med rättsinnehavarens 4K Ultra HD-klipp."
      }
    ]
  },
  {
    "id": "ludacris-area-codes",
    "displayName": "Area Codes — Ludacris feat. Nate Dogg",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "DwGKDF9Y1r4",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1297)."
      }
    ]
  },
  {
    "id": "manu-chao-me-gustas-tu",
    "displayName": "Me Gustas Tu — Manu Chao",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6b37xrsNCWYIUphFBazqD6",
    "youtubeClips": [
      {
        "videoId": "b22wgo919FM",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1284)."
      }
    ]
  },
  {
    "id": "mary-j-blige-family-affair",
    "displayName": "Family Affair — Mary J. Blige",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "2rMh4be4SAJ2Q4eKnPtmGt",
    "youtubeClips": [
      {
        "videoId": "znlFu_lemsU",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MaryJBligeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "nickelback-how-you-remind-me",
    "displayName": "How You Remind Me — Nickelback",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "0gmbgwZ8iqyMPmXefof8Yf",
    "youtubeClips": [
      {
        "videoId": "1cQh1ccqu8M",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Nickelback",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". OBS: Peters lank pekade pa Sophie Ellis-Bextor - Murder On The Dancefloor (fel rad i radiospellistan); officiella Nickelback-klippet uppsokt istallet."
      }
    ]
  },
  {
    "id": "planet-funk-chase-the-sun",
    "displayName": "Chase the Sun — Planet Funk",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5uD0zfqIAd4ZUqa2l90rxi",
    "youtubeClips": [
      {
        "videoId": "2ZlJLzKzRGA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Planet Funk",
        "license": "standard",
        "notes": "Official video 2001."
      }
    ]
  },
  {
    "id": "safri-duo-played-a-live",
    "displayName": "Played A live — Safri Duo",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7uuo02BIR76qZ6ZXQhz7Ys",
    "youtubeClips": []
  },
  {
    "id": "shrek-2001",
    "displayName": "Shrek",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "What is the name of the main character in this film?",
    "itemHcp": 90,
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
    "isAnimated": true,
    "correctNames": [
      "Princess Fiona"
    ],
    "distractorNames": [
      "Simba",
      "Nemo",
      "Mulan",
      "Elsa"
    ],
    "youtubeClips": [
      {
        "videoId": "s9nVUOP3Oik",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Dreamworks",
        "license": "standard",
        "notes": "DreamWorks officiell trailer (1:48) — Shrek + Åsnon i träsket. Allsvars DreamWorks-kanal."
      }
    ]
  },
  {
    "id": "spooks-things-ive-seen",
    "displayName": "Things Ive seen — Spooks",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "673OnqT7JuOTkxyfa0BT0t",
    "youtubeClips": []
  },
  {
    "id": "tanel-padar-everybody",
    "displayName": "Everybody — Tanel Padar, Dave Benton & 2XL",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "92TSUlqzFi8",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2001 vinnare — Estland."
      }
    ]
  },
  {
    "id": "titiyo-come-along",
    "displayName": "Come along — Titiyo",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "7GmHOAdriOnI9s5S79GAUr",
    "youtubeClips": []
  },
  {
    "id": "zoolander-2001",
    "displayName": "Zoolander",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "YtQq0T3ExLs",
        "startSec": 21,
        "endSec": 51,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "antique-follow-me",
    "displayName": "Follow Me — Antique",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6KN2Yb9kxJBoJ1qiMgusYy",
    "youtubeClips": [
      {
        "videoId": "ywH2os9XB88",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "avril-lavigne-complicated",
    "displayName": "Complicated — Avril Lavigne",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5xEM5hIgJ1jjgcEBfpkt2F",
    "youtubeClips": [
      {
        "videoId": "5eGbnVlRcRg",
        "startSec": 0,
        "endSec": 244,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "benny-benassi-satisfaction",
    "displayName": "Satisfaction — Benny Benassi",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "7rEzGBZtkLMWEV91aKt4v1",
    "youtubeClips": [
      {
        "videoId": "y4gm5MdWg3M",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ollmake",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "coldplay-the-scientist",
    "displayName": "The Scientist — Coldplay",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "75JFxkI2RXiU7L9VXzMkle",
    "youtubeClips": [
      {
        "videoId": "RB-RcX5DS5A",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Coldplay",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (13)."
      }
    ]
  },
  {
    "id": "eminem-lose-yourself",
    "displayName": "Lose Yourself — Eminem",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "5Z01UMMf7V1o0MzF86s6WJ",
    "youtubeClips": [
      {
        "videoId": "7YuAzR2XVAM",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1290)."
      },
      {
        "videoId": "tR1ECf4sEpw",
        "startSec": 30,
        "endSec": 60,
        "license": "standard"
      }
    ]
  },
  {
    "id": "eminem-without-me",
    "displayName": "Without Me — Eminem",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "2w3ZAK00v15FMnJpyFN4GY",
    "youtubeClips": [
      {
        "videoId": "N9KSvSBfFYA",
        "startSec": 0,
        "endSec": 291,
        "channelTitle": "Solitude Songs",
        "license": "standard"
      }
    ]
  },
  {
    "id": "justin-timberlake-like-i-love-you",
    "displayName": "Like I Love You — Justin Timberlake",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6W2Ef5Ph6ILTUAedoQ3QIv",
    "youtubeClips": [
      {
        "videoId": "HMqgVXSvwGo",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1291)."
      }
    ]
  },
  {
    "id": "justin-timberlake-rock-your-body",
    "displayName": "Rock Your Body — Justin Timberlake",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1AWQoqb9bSvzTjaLralEkT",
    "youtubeClips": [
      {
        "videoId": "TSVHoHyErBQ",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1295)."
      },
      {
        "videoId": "uQSLKlLjvKY",
        "startSec": 0,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "kate-ryan-desenchantee",
    "displayName": "Désenchantée — Kate Ryan",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0eAvGqc9t4Wuc6gDcSi5Aa",
    "youtubeClips": [
      {
        "videoId": "f_vyYpNDXkI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Tuga93",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "magnus-uggla-vi-ska-till-vm",
    "displayName": "Vi ska till VM — Magnus Uggla",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7wEJdDvxX4ERwahaQg7Xx0",
    "youtubeClips": [
      {
        "videoId": "f3oyfdoNPWw",
        "startSec": 51,
        "endSec": 81,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1406)."
      }
    ]
  },
  {
    "id": "marie-n-i-wanna",
    "displayName": "I Wanna — Marie N",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5lBvaNJBnbTrol62SlHbdE",
    "youtubeClips": []
  },
  {
    "id": "my-big-fat-greek-wedding-2002",
    "displayName": "My Big Fat Greek Wedding",
    "correctYear": 2002,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "dZmrMJmAfF0",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "nelly-dilemma",
    "displayName": "Dilemma — Nelly feat. Kelly Rowland",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "RnB"
    ],
    "spotifyTrackId": "0ARK753YaiJbpLUk7z5yIM",
    "youtubeClips": [
      {
        "videoId": "8WYHDfJDPDc",
        "startSec": 23,
        "endSec": 53,
        "channelTitle": "NellyVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "spider-man-2002",
    "displayName": "Spider-Man",
    "correctYear": 2002,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Tobey Maguire"
    ],
    "distractorNames": [
      "Andrew Garfield",
      "Tom Holland",
      "Elijah Wood",
      "Heath Ledger"
    ],
    "youtubeClips": [
      {
        "videoId": "t06RUxPbp_c",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Sony Pictures Entertainment",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Officiell Sony-trailer 'SPIDER-MAN [2002] Official Trailer' — titeln avslojar ar men INTE skadespelare (svaret = Tobey Maguire). Distraktorerna Garfield/Holland ar andra Spider-Man-skadespelare = klurigt."
      }
    ]
  },
  {
    "id": "50-cent-in-da-club",
    "displayName": "In da Club — 50 Cent",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "7iL6o9tox1zgHpKUfh9vuC",
    "youtubeClips": [
      {
        "videoId": "_VXUiAJi5KY",
        "startSec": 0,
        "endSec": 194,
        "channelTitle": "50 Cent - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "ateens-floorfiller",
    "displayName": "Floorfiller — Ateens",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2MT14ol7fzsnlyYQ7g1NMG",
    "youtubeClips": []
  },
  {
    "id": "beyonce-crazy-in-love",
    "displayName": "Crazy in Love — Beyoncé feat. Jay-Z",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "RnB"
    ],
    "spotifyTrackId": "3y4KY2HvTEkFLrkHfIPWAl",
    "youtubeClips": [
      {
        "videoId": "ViwtNLUqkMY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BeyoncéVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "britney-spears-me-against-the-music",
    "displayName": "Me Against the Music — Britney Spears feat. Madonna",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6Kosrr9sgOLQphRYGL5lfU",
    "youtubeClips": [
      {
        "videoId": "clwLKJ294u4",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "BritneySpearsVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "finding-nemo",
    "displayName": "Finding Nemo",
    "correctYear": 2003,
    "contentSubject": "movie",
    "questionText": "What is the name of the main character in this film?",
    "itemHcp": 90,
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
    "isAnimated": true,
    "correctNames": [
      "Dory"
    ],
    "distractorNames": [
      "Simba",
      "Shrek",
      "Mulan",
      "Elsa"
    ],
    "youtubeClips": [
      {
        "videoId": "6fHR58bSwpg",
        "startSec": 20,
        "endSec": 35,
        "channelTitle": "Saskia Rice",
        "license": "standard",
        "notes": "Teatral 2003-trailer — Nemo + Marlin + undervattensvärlden etableras."
      }
    ]
  },
  {
    "id": "lost-in-translation-2003",
    "displayName": "Lost in Translation",
    "correctYear": 2003,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "g_maEh38ZTw",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "Ondreia Pedraza",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Titel 'Lost In Translation - Official Trailer HD' — inget ar. Privat kanal, takedown-risk."
      }
    ]
  },
  {
    "id": "love-actually-2003",
    "displayName": "Love Actually",
    "correctYear": 2003,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Christmas edition"
    ],
    "isAnimated": false,
    "correctNames": [
      "Hugh Grant",
      "Emma Thompson",
      "Colin Firth",
      "Liam Neeson",
      "Keira Knightley",
      "Bill Nighy",
      "Alan Rickman"
    ],
    "distractorNames": [
      "Tom Hanks",
      "Brad Pitt",
      "Leonardo DiCaprio",
      "Russell Crowe"
    ],
    "youtubeClips": [
      {
        "videoId": "H9Z3_ifFheQ",
        "startSec": 26,
        "endSec": 56,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). genrePackages:['Christmas edition'] — ny paket-tagg (paketet saljs inte an; forbereder framtida Christmas Edition). Name-fraga (actor-select) sedan 2026-09-17 — ar/titel i klippet spoilar inte langre svaret."
      }
    ]
  },
  {
    "id": "outkast-hey-ya",
    "displayName": "Hey Ya! — OutKast",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "2PpruBYCo4H7WOBJ7Q2EwM",
    "youtubeClips": [
      {
        "videoId": "_pYHJWd_yto",
        "startSec": 68,
        "endSec": 83,
        "channelTitle": "MASTER RJ",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "sarek-genom-eld-och-vatten",
    "displayName": "Genom eld och vatten — Sarek",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "20NfHnLzpw6qoAKOX8BFaQ",
    "youtubeClips": [
      {
        "videoId": "ky3bbNq818w",
        "startSec": 12,
        "endSec": 27,
        "channelTitle": "Melodifestivalen Arkiv",
        "license": "standard",
        "notes": "Finalen Melodifestivalen 2003. Inget officiellt MV finns. Tillagd 2026-06-04."
      }
    ]
  },
  {
    "id": "sertab-erener-everyway-that-i-can",
    "displayName": "Everyway That I Can — Sertab Erener",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7B2eFoaBjo2kCEh6V81xdx",
    "youtubeClips": [
      {
        "videoId": "j0_QrKnqd5E",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2003 vinnare — Turkiet."
      }
    ]
  },
  {
    "id": "the-killers-mr-brightside",
    "displayName": "Mr. Brightside — The Killers",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0eGsygTp906u18L0Oimnem",
    "youtubeClips": [
      {
        "videoId": "yVLRhZiZ5Wc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rock Preservation Society",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "the-latin-kings-cashen-dom-tas",
    "displayName": "Cashen dom tas — The Latin Kings",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish",
      "Hip Hop"
    ],
    "youtubeClips": [
      {
        "videoId": "JbfaWv9rHZk",
        "startSec": 20,
        "endSec": 35,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-rasmus-in-the-shadows",
    "displayName": "In the Shadows — The Rasmus",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "1fr92Vupmcs2vgLMFVQ7rd",
    "youtubeClips": [
      {
        "videoId": "7gwO8-oqwFw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "The Rasmus",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 2003 = albumet Dead Letters (mars 2003)."
      }
    ]
  },
  {
    "id": "white-stripes-seven-nation-army",
    "displayName": "Seven Nation Army — The White Stripes",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "3m6KkYKdnbffMpGd9Pm9FP",
    "youtubeClips": [
      {
        "videoId": "0J2QdDbelmY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The White Stripes",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "alcazar-this-is-the-world-we-live-in",
    "displayName": "This Is the World We Live In — Alcazar",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "344jzKdBGLJYZdhKjj4884",
    "youtubeClips": [
      {
        "videoId": "t65NQg6iXDw",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1276)."
      }
    ]
  },
  {
    "id": "anastacia-left-outside-alone",
    "displayName": "Left Outside Alone — Anastacia",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6IjndxnqW3Zb1hMu9kGrXD",
    "youtubeClips": [
      {
        "videoId": "C-M_ufrvbro",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Anastacia - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters uzR5jM9UeJA (AnastaciaVEVO) ar SD; ingen officiell HD-video finns. Topic-radioversionen anvand. OBS: undvik Symphonic Revolution-klippet - det ar en 2023 nyinspelning, fel version for en arsfraga."
      }
    ]
  },
  {
    "id": "eric-prydz-call-on-me",
    "displayName": "Call on Me — Eric Prydz",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "1As4KC3YYpu89aBt7EqL2m",
    "youtubeClips": [
      {
        "videoId": "qetW6R9Jxs4",
        "startSec": 6,
        "endSec": 45,
        "channelTitle": "Eric Prydz",
        "license": "standard",
        "notes": "Peter-bytt 2026-08-28 (officiella musikvideon). parentControlled pga aerobics-motivet."
      }
    ]
  },
  {
    "id": "eternal-sunshine-of-the-spotless-mind-2004",
    "displayName": "Eternal Sunshine of the Spotless Mind",
    "correctYear": 2004,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Jim Carrey",
      "Kate Winslet"
    ],
    "distractorNames": [
      "Adam Sandler",
      "Ben Stiller",
      "Cameron Diaz",
      "Julia Roberts"
    ],
    "youtubeClips": [
      {
        "videoId": "86NjzbHhZOE",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Max Caulfield",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. OBS: privat kanal-uppladdning av trailern — ej rättsinnehavare. Takedown-risk, byt till officiellt klipp när sådant hittas."
      }
    ]
  },
  {
    "id": "gunther-ding-dong-song",
    "displayName": "Ding Dong Song — Günther",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "parentControlled": true,
    "spotifyTrackId": "2LELFaNglE9B5xlcmd4qtQ",
    "youtubeClips": [
      {
        "videoId": "SZNVTkT1DNs",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "gwen-stefani-hollaback-girl",
    "displayName": "Hollaback Girl — Gwen Stefani",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0eqH0ALoDQevq59YcQ53KE",
    "youtubeClips": [
      {
        "videoId": "Kgjkth6BRRY",
        "startSec": 9,
        "endSec": 39,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1335)."
      }
    ]
  },
  {
    "id": "gwen-stefani-rich-girl",
    "displayName": "Rich Girl — Gwen Stefani",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "RnB"
    ],
    "spotifyTrackId": "2oxtQ84p1j5GmyzmD50Lq0",
    "youtubeClips": [
      {
        "videoId": "9rlNpWYQunY",
        "startSec": 11,
        "endSec": 41,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1336)."
      }
    ]
  },
  {
    "id": "lena-philipsson-det-gor-ont",
    "displayName": "Det gör ont — Lena Philipsson",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "250KZYNeR2FYDjab74Uib1",
    "youtubeClips": [
      {
        "videoId": "5JDFnN-WYGA",
        "startSec": 3,
        "endSec": 33,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1395)."
      }
    ]
  },
  {
    "id": "mario-let-me-love-you",
    "displayName": "Let Me Love You — Mario",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "7GaFYUqP2WdR4KTPk7cXoP",
    "youtubeClips": [
      {
        "videoId": "H64QG4UsrGI",
        "startSec": 30,
        "endSec": 45,
        "license": "standard"
      }
    ]
  },
  {
    "id": "markoolio-in-med-bollen",
    "displayName": "In med bollen — Markoolio",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "08e3oeRV88CYNxDhwvH1lJ",
    "youtubeClips": [
      {
        "videoId": "miPLp_U0sMU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Markoolio - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "million-dollar-baby-2004",
    "displayName": "Million Dollar Baby",
    "correctYear": 2004,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "genrePackages": [
      "sport"
    ],
    "isAnimated": false,
    "correctNames": [
      "Hilary Swank",
      "Clint Eastwood"
    ],
    "distractorNames": [
      "Sandra Bullock",
      "Charlize Theron",
      "Tom Hanks",
      "Denzel Washington"
    ],
    "youtubeClips": [
      {
        "videoId": "5_RsHRmIRBY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell 2004-trailer (Swank/Eastwood). Ej Ava Max-låten."
      }
    ]
  },
  {
    "id": "nelly-feat-tim-mcgraw-over-and-over",
    "displayName": "Over and Over — Nelly feat. Tim McGraw",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "n3htOCjafTc",
        "startSec": 20,
        "endSec": 35,
        "license": "standard"
      }
    ]
  },
  {
    "id": "o-zone-dragostea-din-tei",
    "displayName": "Dragostea Din Tei — O-Zone",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
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
    "genrePackages": [
      "Dance Music"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4nnHlGaBwJHb1rBetqj0Yl",
    "youtubeClips": [
      {
        "videoId": "3xx0s147Xj4",
        "startSec": 0,
        "endSec": 224,
        "channelTitle": "Lyrixa",
        "license": "standard"
      }
    ]
  },
  {
    "id": "ruslana-wild-dances",
    "displayName": "Wild Dances — Ruslana",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "75kRVsZFSh8csiX9t1lzAR",
    "youtubeClips": [
      {
        "videoId": "MTLmoV0E_6c",
        "startSec": 50,
        "endSec": 65,
        "channelTitle": "Ruslana",
        "license": "standard",
        "notes": "ESC 2004 vinnare — Ukraina. Officiell remastered MV."
      }
    ]
  },
  {
    "id": "sa-som-i-himmelen",
    "displayName": "Så som i himmelen",
    "correctYear": 2004,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
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
    "isAnimated": false,
    "correctNames": [
      "Mikael Nyqvist"
    ],
    "distractorNames": [
      "Rolf Lassgård",
      "Björn Skifs",
      "Mikael Persbrandt",
      "Peter Haber"
    ],
    "youtubeClips": [
      {
        "videoId": "FT5A0rYUSVE",
        "startSec": 10,
        "endSec": 45,
        "channelTitle": "NuovoCinemaGiornico",
        "license": "standard",
        "notes": "Originaltrailer. Oscar-nominerad svensk film. Mikael Nyqvist."
      }
    ]
  },
  {
    "id": "snoop-dogg-signs",
    "displayName": "Signs — Snoop Dogg",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4HSAJpNocVNJbwbQvtCMdO",
    "youtubeClips": []
  },
  {
    "id": "the-chemical-brothers-galvanize",
    "displayName": "Galvanize — The Chemical Brothers",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "youtubeClips": [
      {
        "videoId": "Xu3FTEmN-eg",
        "startSec": 19,
        "endSec": 34,
        "license": "standard"
      }
    ]
  },
  {
    "id": "usher-yeah",
    "displayName": "Yeah! — Usher",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "5rb9QrpfcKFHM1EUbSIurX",
    "youtubeClips": [
      {
        "videoId": "iCL04cxeMOE",
        "startSec": 0,
        "endSec": 251,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "50-cent-candy-shop",
    "displayName": "Candy Shop — 50 Cent",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "5D2mYZuzcgjpchVY1pmTPh",
    "youtubeClips": [
      {
        "videoId": "SRcnnId15BA",
        "startSec": 29,
        "endSec": 44,
        "license": "standard"
      }
    ]
  },
  {
    "id": "agnes-right-here-right-now-my-heart-belongs-to-you",
    "displayName": "Right Here, Right Now (My Heart Belongs to You) — Agnes",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "youtubeClips": [
      {
        "videoId": "rkmD-ZGdnWs",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "axel-f-crazy-frog",
    "displayName": "Axel F — Crazy Frog",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0Bo5fjMtTfCD8vHGebivqc",
    "youtubeClips": [
      {
        "videoId": "k85mRPqvMbE",
        "startSec": 5,
        "endSec": 20,
        "license": "standard"
      }
    ]
  },
  {
    "id": "black-eyed-peas-pump-it",
    "displayName": "Pump It — Black Eyed Peas",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2ygMBIctKIAfbEBcT9065L",
    "youtubeClips": [
      {
        "videoId": "ZaI2IlHwmgQ",
        "startSec": 17,
        "endSec": 47,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1337)."
      }
    ]
  },
  {
    "id": "coldplay-speed-of-sound",
    "displayName": "Speed of Sound — Coldplay",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7clUVcSOtkNWa58Gw5RfD4",
    "youtubeClips": [
      {
        "videoId": "0k_1kvDh2UA",
        "startSec": 15,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "gorillaz-feel-good-inc",
    "displayName": "Feel Good Inc. — Gorillaz",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0d28khcov6AiegSCpG5TuT",
    "youtubeClips": [
      {
        "videoId": "HyHNuVaZJ-k",
        "startSec": 15,
        "endSec": 255,
        "channelTitle": "Gorillaz",
        "license": "standard"
      }
    ]
  },
  {
    "id": "helena-paparizou-my-number-one",
    "displayName": "My Number One — Helena Paparizou",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6LkCvCc9oFoLDv4DLhzTox",
    "youtubeClips": [
      {
        "videoId": "rcOwvZ26KFQ",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2005 vinnare — Grekland."
      }
    ]
  },
  {
    "id": "madonna-hung-up",
    "displayName": "Hung Up — Madonna",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "03UAID5OeTwjDIKCM7M3rg",
    "youtubeClips": [
      {
        "videoId": "EDwb9jOVRtU",
        "startSec": 63,
        "endSec": 93,
        "channelTitle": "Madonna",
        "license": "standard"
      }
    ]
  },
  {
    "id": "martin-stenmarck-las-vegas",
    "displayName": "Las Vegas — Martin Stenmarck",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "0o4xWaEA9oS1wUM5UVODdR",
    "youtubeClips": [
      {
        "videoId": "YbZjSdSNCiw",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2005 vinnare. ESC 2005 performance."
      }
    ]
  },
  {
    "id": "pussycat-dolls-buttons",
    "displayName": "Buttons — The Pussycat Dolls feat. Snoop Dogg",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "0bwNTjZGhlD0mhePV6om1j",
    "youtubeClips": [
      {
        "videoId": "VCLxJd1d84s",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ThePussycatDollsVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 2005 = debutalbumet PCD (sep 2005), verifierat via Wikipedia. GRANSFALL: singeln kom mars 2006."
      }
    ]
  },
  {
    "id": "pussycat-dolls-dont-cha",
    "displayName": "Don’t Cha — The Pussycat Dolls feat. Busta Rhymes",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "1gZ7i4qxXkHZb1r6eioaAP",
    "youtubeClips": [
      {
        "videoId": "YNSxNsr4wmA",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "ThePussycatDollsVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "sean-paul-give-it-up-to-me",
    "displayName": "Give It Up to Me — Sean Paul",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6YB6CK4Tsb0BgtxCEL9KlI",
    "youtubeClips": [
      {
        "videoId": "bMoNV9oWs2E",
        "startSec": 13,
        "endSec": 43,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1346)."
      }
    ]
  },
  {
    "id": "sugababes-push-the-button",
    "displayName": "Push the Button — Sugababes",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2nCmCt4B5vkabS0zeOuc1Z",
    "youtubeClips": [
      {
        "videoId": "oJDGcxAf9D8",
        "startSec": 16,
        "endSec": 31,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-game-hate-it-or-love-it",
    "displayName": "Hate It or Love It — The Game feat. 50 Cent",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6gQaf0ANLks2uWl2AHhU26",
    "youtubeClips": [
      {
        "videoId": "BuMBmK5uksg",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1282)."
      }
    ]
  },
  {
    "id": "three-6-mafia-stay-fly",
    "displayName": "Stay Fly — Three 6 Mafia",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "5MYFw4T2gy52pOGBN4EYHS",
    "youtubeClips": [
      {
        "videoId": "vBjzAdpZzf0",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1298)."
      },
      {
        "videoId": "a6kIx2AN61A",
        "startSec": 0,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "timbuktu-alla-vill-till-himlen",
    "displayName": "Alla vill till himlen — Timbuktu",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "youtubeClips": [
      {
        "videoId": "6cdxVmMFN-E",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Timbuktu - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "timbuktu-alla-vill-till-himmelen",
    "displayName": "Alla vill till himmelen men ingen vill dö — Timbuktu",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6I1kZgg3bGrPKxhZOltbRW",
    "youtubeClips": [
      {
        "videoId": "NDHlDb9AOsU",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "Timbuktu",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. startSec 4 angiven av Peter. NYTT item - katalogen hade bara artist-itemet timbuktu (hints), ingen lat. correctYear 2005 = albumet med samma namn (23 feb 2005)."
      }
    ]
  },
  {
    "id": "alex-gaudino-destination-calabria",
    "displayName": "Destination Calabria — Alex Gaudino feat. Crystal Waters",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5bBfXSYmvPCc9VC8zWm1CQ",
    "youtubeClips": [
      {
        "videoId": "Kq4OtRsdXls",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Time Records",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "borat-2006",
    "displayName": "Borat",
    "correctYear": 2006,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Sacha Baron Cohen"
    ],
    "distractorNames": [
      "Ben Stiller",
      "Adam Sandler",
      "Will Ferrell",
      "Steve Carell"
    ],
    "youtubeClips": [
      {
        "videoId": "vlnUa_dNsRQ",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). Name/actor-select (svar = Sacha Baron Cohen). VERIFIERA i spelaren att titeln inte visar skadespelarnamnet."
      }
    ]
  },
  {
    "id": "carola-evighet",
    "displayName": "Evighet — Carola",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "6XGIQNU8VmOBRIdL5OBYKp",
    "youtubeClips": [
      {
        "videoId": "m9ghEC3wiIc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Melodifestivalen",
        "license": "standard",
        "notes": "Melodifestivalen 2006 vinnare."
      }
    ]
  },
  {
    "id": "david-tavare-summerlove",
    "displayName": "Summerlove — David Tavaré",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Summer"
    ],
    "spotifyTrackId": "1hakIwXUPCiP41Rbpl1JDh",
    "youtubeClips": [
      {
        "videoId": "hs2M85CqZVQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "rdsmusiclabel",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "gnarls-barkley-crazy",
    "displayName": "Crazy — Gnarls Barkley",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2N5zMZX7YeL1tico8oQxa9",
    "youtubeClips": [
      {
        "videoId": "-N4jf6rtyuw",
        "startSec": 0,
        "endSec": 181,
        "channelTitle": "Gnarls Barkley Official",
        "license": "standard"
      }
    ]
  },
  {
    "id": "gwen-stefani-the-sweet-escape",
    "displayName": "The Sweet Escape — Gwen Stefani",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "66ZcOcouenzZEnzTJvoFmH",
    "youtubeClips": [
      {
        "videoId": "O0lf_fE3HwA",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1339)."
      }
    ]
  },
  {
    "id": "lordi-hard-rock-hallelujah",
    "displayName": "Hard Rock Hallelujah — Lordi",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "6hBd7OkzsWWJ7zgoaMwv7k",
    "youtubeClips": [
      {
        "videoId": "gAh9NRGNhUU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2006 vinnare — Finland."
      }
    ]
  },
  {
    "id": "nelly-furtado-maneater",
    "displayName": "Maneater — Nelly Furtado",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2kjaf793qQ1kvKMix4FmEj",
    "youtubeClips": [
      {
        "videoId": "PLolag3YSYU",
        "startSec": 87,
        "endSec": 117,
        "channelTitle": "NellyFurtadoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "nelly-furtado-promiscuous",
    "displayName": "Promiscuous — Nelly Furtado feat. Timbaland",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "47aQT2aV12TyilaoYi1NiD",
    "youtubeClips": [
      {
        "videoId": "0J3vgcE5i2o",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "NellyFurtadoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "nelly-furtado-say-it-right",
    "displayName": "Say It Right — Nelly Furtado",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5AtFypwxB2ShXSxNj12dEd",
    "youtubeClips": [
      {
        "videoId": "6JnGBs88sL0",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "NellyFurtadoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 10 angiven av Peter. correctYear 2006 = albumet Loose (juni 2006); singeln kom nov 2006."
      }
    ]
  },
  {
    "id": "shakira-hips-dont-lie",
    "displayName": "Hips Don't Lie — Shakira",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3d0WouFnFmr0K3kjeza3fF",
    "youtubeClips": [
      {
        "videoId": "X8k1FVqtojU",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Mix Sabrosura",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "basshunter-now-youre-gone",
    "displayName": "Now Youre Gone — Basshunter",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6uJaUDRi5W6qwAbUEFRArK",
    "youtubeClips": []
  },
  {
    "id": "britney-spears-piece-of-me",
    "displayName": "Piece of Me — Britney Spears",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6jaHYV4no6PAbyo89bybrx",
    "youtubeClips": [
      {
        "videoId": "u4FF6MpcsRw",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1342)."
      }
    ]
  },
  {
    "id": "chris-brown-with-you",
    "displayName": "With You — Chris Brown",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5Lgcn7u07bHuqbOtXkN62u",
    "youtubeClips": [
      {
        "videoId": "nmjdaBaZe8Y",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ChrisBrownVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "danny-saucedo-if-only-you",
    "displayName": "If Only You — Danny Saucedo",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "63d9sGwdauATWYpmcuZLqg",
    "youtubeClips": [
      {
        "videoId": "PNgqgpzeV8A",
        "startSec": 17,
        "endSec": 47,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1421)."
      }
    ]
  },
  {
    "id": "enrique-iglesias-tired-of-being-sorry",
    "displayName": "Tired of Being Sorry — Enrique Iglesias",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1u0aKJj9kr930YeAa6KXcy",
    "youtubeClips": [
      {
        "videoId": "X86S5oZzzh4",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1304)."
      }
    ]
  },
  {
    "id": "eric-prydz-pjanoo",
    "displayName": "Pjanoo — Eric Prydz",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "06T2VQf8n5kTtyDo8klTvX",
    "youtubeClips": [
      {
        "videoId": "Gz3yCrMJXpk",
        "startSec": 26,
        "endSec": 41,
        "license": "standard"
      }
    ]
  },
  {
    "id": "kate-ryan-voyage-voyage",
    "displayName": "Voyage, voyage — Kate Ryan",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4HsvdyB7HDERx46V8Q8dV8",
    "youtubeClips": [
      {
        "videoId": "XT9IDo-vF5k",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Kate Ryan",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "marija-serifovic-molitva",
    "displayName": "Molitva — Marija Šerifović",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6N0Buwr7Si1FNePHgP2pCV",
    "youtubeClips": [
      {
        "videoId": "Kbi08wfT7mA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Marija Šerifović",
        "license": "standard",
        "notes": "ESC 2007 vinnare — Serbien. Officiell music video."
      }
    ]
  },
  {
    "id": "markoolio-ingen-sommar-utan-reggae",
    "displayName": "Ingen sommar utan reggae — Markoolio",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5YuLlTsWYK9uslUdGM83dJ",
    "youtubeClips": [
      {
        "videoId": "TznMe5Ev8Dg",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1420)."
      }
    ]
  },
  {
    "id": "ne-yo-because-of-you",
    "displayName": "Because of You — Ne-Yo",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6CFPFnS9EcLs2I0nWqtWci",
    "youtubeClips": [
      {
        "videoId": "atz_aZA3rf0",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "NeYoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "oh-laura-release-me",
    "displayName": "Release Me — Oh Laura",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "66Bzmhj4cOinK5bxjx5DAK",
    "youtubeClips": []
  },
  {
    "id": "rihanna-dont-stop-the-music",
    "displayName": "Don’t Stop the Music — Rihanna",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0ByMNEPAPpOR5H69DVrTNy",
    "youtubeClips": [
      {
        "videoId": "yd8jh9QYfEs",
        "startSec": 11,
        "endSec": 41,
        "channelTitle": "RihannaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "rihanna-hate-that-i-love-you",
    "displayName": "Hate That I Love You — Rihanna feat. Ne-Yo",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "669Zz4glMcFwFl1BRltkXP",
    "youtubeClips": [
      {
        "videoId": "KMOOr7GEkj8",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "RihannaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "rihanna-umbrella",
    "displayName": "Umbrella — Rihanna",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "Hip Hop",
      "RnB"
    ],
    "spotifyTrackId": "2yPoXCs7BSIUrucMdK5PzV",
    "youtubeClips": [
      {
        "videoId": "HuQ0ni6AlrU",
        "startSec": 6,
        "endSec": 265,
        "channelTitle": "Pillow",
        "license": "standard"
      }
    ]
  },
  {
    "id": "robyn-with-every-heartbeat",
    "displayName": "With Every Heartbeat — Robyn",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Dance Music",
      "Disco & Pop"
    ],
    "spotifyTrackId": "0NEw29HKkDkt1yDyBJOgXe",
    "youtubeClips": [
      {
        "videoId": "-ojHWQrm4UM",
        "startSec": 30,
        "endSec": 45,
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-ark-the-worrying-kind",
    "displayName": "The Worrying Kind — The Ark",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "45DP2cidC1BdeIU0WmjIYY",
    "youtubeClips": [
      {
        "videoId": "r02Lg8JIco0",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2007 vinnare. ESC 2007 performance."
      }
    ]
  },
  {
    "id": "timbaland-onerepublic-apologize",
    "displayName": "Apologize — Timbaland & OneRepublic",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "68U7CGrUcsJQ9PcBxk7oxB",
    "youtubeClips": [
      {
        "videoId": "xTjwTbnX_EA",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Lost Panda",
        "license": "standard"
      }
    ]
  },
  {
    "id": "timbaland-scream",
    "displayName": "Scream — Timbaland",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop",
      "RnB"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5sp1KDCNEm1Eoeqxsep01L",
    "youtubeClips": [
      {
        "videoId": "nXskfsgBihE",
        "startSec": 3,
        "endSec": 33,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1292)."
      }
    ]
  },
  {
    "id": "timbaland-the-way-i-are",
    "displayName": "The Way I Are — Timbaland feat. Keri Hilson",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "2bLqfJjuC5syrsgDsZfGmn",
    "youtubeClips": [
      {
        "videoId": "U5rLz5AZBIA",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "TimbalandVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "yves-larock-rise-up",
    "displayName": "Rise Up — Yves Larock feat. Jaba",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "09m1TcymsKszj3ito4Hmp7",
    "youtubeClips": [
      {
        "videoId": "zwcmZ0mGQno",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Energy TV",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "agnes-release-me",
    "displayName": "Release Me — Agnes",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4LiJE6pqgsTX3FtukW6bNh",
    "youtubeClips": [
      {
        "videoId": "keYXzDh5JEQ",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "beyonce-single-ladies",
    "displayName": "Single Ladies (Put a Ring on It) — Beyoncé",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "70HKaNaUpcUqEqnKoKy6gl",
    "youtubeClips": [
      {
        "videoId": "4m1EFMoRFvY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BeyoncéVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella videon. Ingen startSec angiven av Peter."
      },
      {
        "videoId": "9WBCFGJM6no",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "GlyphoricVibes",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Lyrics. startSec 5 angiven av Peter."
      }
    ]
  },
  {
    "id": "charlotte-perrelli-hero",
    "displayName": "Hero — Charlotte Perrelli",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "3KoKv5fIoawjvDdGHOhSmE",
    "youtubeClips": [
      {
        "videoId": "x_iSoluR53U",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2008 vinnare. ESC 2008 performance."
      }
    ]
  },
  {
    "id": "coldplay-viva-la-vida",
    "displayName": "Viva la Vida — Coldplay",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1mea3bSkSGXuIRvnydlB5b",
    "youtubeClips": [
      {
        "videoId": "dvgZkm1xWPE",
        "startSec": 0,
        "endSec": 243,
        "channelTitle": "Coldplay",
        "license": "standard"
      }
    ]
  },
  {
    "id": "kate-ryan-ella-elle-la",
    "displayName": "Ella, elle l'a — Kate Ryan",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0HKgFrp02ixksDh9t0UB8Q",
    "youtubeClips": [
      {
        "videoId": "hdJN0ss7jA0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Kate Ryan",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "katy-perry-hot-n-cold",
    "displayName": "Hot n Cold — Katy Perry",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0s6QhfgSyyT7E9aavGKwzu",
    "youtubeClips": [
      {
        "videoId": "kTHNpusq654",
        "startSec": 35,
        "endSec": 65,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1340)."
      }
    ]
  },
  {
    "id": "katy-perry-i-kissed-a-girl",
    "displayName": "I Kissed a Girl — Katy Perry",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "25ZttbpeUKDOm3aghD2oBJ",
    "youtubeClips": [
      {
        "videoId": "usvTbqTHwyw",
        "startSec": 0,
        "endSec": 180,
        "channelTitle": "Katy Perry - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "lady-gaga-just-dance",
    "displayName": "Just Dance — Lady Gaga",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5vQXxfGn1bjv5WESrYVVpw",
    "youtubeClips": [
      {
        "videoId": "2Abk1jAONjw",
        "startSec": 4,
        "endSec": 19,
        "license": "standard"
      },
      {
        "videoId": "zVH638r_X_I",
        "startSec": 6,
        "endSec": 21,
        "license": "standard"
      }
    ]
  },
  {
    "id": "lady-gaga-paparazzi",
    "displayName": "Paparazzi — Lady Gaga",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5BTpeKg0dwxGmyELhIpkj8",
    "youtubeClips": [
      {
        "videoId": "d2smz_1L2_0",
        "startSec": 157,
        "endSec": 187,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1341)."
      }
    ]
  },
  {
    "id": "lady-gaga-poker-face",
    "displayName": "Poker Face — Lady Gaga",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1QV6tiMFM6fSOKOGLMHYYg",
    "youtubeClips": [
      {
        "videoId": "bESGLojNYSo",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "LadyGagaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Ersatte Topic-audion oG-4Uvhm4lI med officiella musikvideon."
      }
    ]
  },
  {
    "id": "mamma-mia-2008",
    "displayName": "Mamma Mia!",
    "correctYear": 2008,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "lkN-A00WLYE",
        "startSec": 5,
        "endSec": 35,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "pink-so-what",
    "displayName": "So What — Pink",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "19qn6oU2t0E72ENA0aWNsX",
    "youtubeClips": []
  },
  {
    "id": "rio-shine-on",
    "displayName": "Shine On — R.I.O.",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7yIGRf80h3Kwi4GfwJUiQl",
    "youtubeClips": [
      {
        "videoId": "OhLOOdI23bE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Kontor.TV",
        "license": "standard",
        "notes": "Officiell label-kanal. Peter-kurerad 2026-08-11."
      }
    ]
  },
  {
    "id": "sex-and-the-city-2008",
    "displayName": "Sex and the City",
    "correctYear": 2008,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "b58gZlXm2yI",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "the-dark-knight-2008",
    "displayName": "The Dark Knight",
    "correctYear": 2008,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
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
    "parentControlled": true,
    "isAnimated": false,
    "correctNames": [
      "Christian Bale",
      "Heath Ledger"
    ],
    "distractorNames": [
      "Ben Affleck",
      "Robert Downey Jr.",
      "Hugh Jackman",
      "Ryan Reynolds"
    ],
    "youtubeClips": [
      {
        "videoId": "EXeTwQWrcwY",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell 2008-trailer #1 (Nolan)."
      }
    ]
  },
  {
    "id": "alcazar-stay-the-night",
    "displayName": "Stay the Night — Alcazar",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 62,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "59scqF8FynVEV5kJtoj4yj",
    "youtubeClips": [
      {
        "videoId": "22HjHuPxe8A",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1388)."
      }
    ]
  },
  {
    "id": "alexander-rybak-fairytale",
    "displayName": "Fairytale — Alexander Rybak",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "6NgYIETQ8U72CVfkzYhK30",
    "youtubeClips": [
      {
        "videoId": "WXwgZL4zx9o",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2009 vinnare — Norge."
      }
    ]
  },
  {
    "id": "avatar",
    "displayName": "Avatar",
    "correctYear": 2009,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 93,
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
    "isAnimated": false,
    "correctNames": [
      "Sam Worthington",
      "Zoe Saldana"
    ],
    "distractorNames": [
      "Matt Damon",
      "Chris Pratt",
      "Mila Kunis",
      "Scarlett Johansson"
    ],
    "youtubeClips": [
      {
        "videoId": "5PSNL1qE6VY",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "20th Century Studios",
        "license": "standard",
        "notes": "20th Century Studios official 2009-trailer — Pandora-värld, Na'vi-action."
      }
    ]
  },
  {
    "id": "black-eyed-peas-i-gotta-feeling",
    "displayName": "I Gotta Feeling — The Black Eyed Peas",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2H1047e0oMSj10dgp7p2VG",
    "youtubeClips": [
      {
        "videoId": "uSD4vsh1zDA",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "BlackEyedPeasVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-klippet OIPmhkzN2ug. Officiella musikvideon. startSec 30 angiven av Peter."
      },
      {
        "videoId": "ipii7KbbJLY",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Popular Music",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-klippet OIPmhkzN2ug. Lyrics-version. startSec 15 angiven av Peter."
      }
    ]
  },
  {
    "id": "david-guetta-when-love-takes-over",
    "displayName": "When Love Takes Over — David Guetta feat. Kelly Rowland",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop"
    ],
    "spotifyTrackId": "0GWGZA5mxo9nHuSyrj70uo",
    "youtubeClips": [
      {
        "videoId": "w74lkrIWebs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "virginrecords",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters ID zudbz4hOcbc (Guettas egen 2009-upload) ar SD; bytt till skivbolagets HD-upload."
      }
    ]
  },
  {
    "id": "hadise-dum-tek-tek",
    "displayName": "Dum Tek Tek — Hadise",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3Gp3YziRNAbiCDzGV5E6Xm",
    "youtubeClips": [
      {
        "videoId": "TzKgojZqO5Y",
        "startSec": 50,
        "endSec": 65,
        "channelTitle": "Hadise",
        "license": "standard",
        "notes": "Official music video. ESC 2009 Turkey entry."
      }
    ]
  },
  {
    "id": "jay-z-empire-state-of-mind",
    "displayName": "Empire State of Mind — Jay-Z ft. Alicia Keys",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "2igwFfvr1OAGX9SKDCPBwO",
    "youtubeClips": [
      {
        "videoId": "cUmX8n_4W-Y",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Jay-Z",
        "license": "standard",
        "notes": "Official music video."
      }
    ]
  },
  {
    "id": "kesha-tik-tok",
    "displayName": "TiK ToK — Kesha",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6nYoTBmGFNgfTyRC8x1Fvp",
    "youtubeClips": [
      {
        "videoId": "iP6XpLQM2Cs",
        "startSec": 9,
        "endSec": 39,
        "channelTitle": "keshaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "lady-gaga-bad-romance",
    "displayName": "Bad Romance — Lady Gaga",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "TTOPBQhrvtQ",
        "startSec": 0,
        "endSec": 293,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "malena-ernman-la-voix",
    "displayName": "La Voix — Malena Ernman",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "59ijvxrVTUaqebX7DDvjJt",
    "youtubeClips": [
      {
        "videoId": "xE9Pl3mqRbo",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2009 vinnare. ESC 2009 performance."
      }
    ]
  },
  {
    "id": "mando-diao-dance-with-somebody",
    "displayName": "Dance with Somebody — Mando Diao",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "28qkNp9shSV8AQrBwxZf48",
    "youtubeClips": [
      {
        "videoId": "B3SSPURxGJ0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Mando Diao - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "the-hangover-2009",
    "displayName": "The Hangover",
    "correctYear": 2009,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "TZc39afdeXU",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "timbaland-morning-after-dark",
    "displayName": "Morning After Dark — Timbaland",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop",
      "RnB"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1pjKiLKbdaqXfurRhOyy7f",
    "youtubeClips": [
      {
        "videoId": "25LBTSUEU0A",
        "startSec": 40,
        "endSec": 70,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1294)."
      },
      {
        "videoId": "6akixw3v7WE",
        "startSec": 8,
        "endSec": 38,
        "license": "standard"
      }
    ]
  },
  {
    "id": "adele-rolling-in-the-deep",
    "displayName": "Rolling in the Deep — Adele",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 89,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1c8gk2PeTE04A1pIDH9YMk",
    "youtubeClips": [
      {
        "videoId": "rYEDA3JcQqw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Adele",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "anna-bergendahl-this-is-my-life",
    "displayName": "This Is My Life — Anna Bergendahl",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1EXL0oarsvlR2fFfVGPWdd",
    "youtubeClips": [
      {
        "videoId": "OTRcAg6VxU4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Anakina_Skywalker",
        "license": "standard",
        "notes": "Melodifestivalen 2010 vinnare."
      }
    ]
  },
  {
    "id": "bruno-mars-just-the-way-you-are",
    "displayName": "Just the Way You Are — Bruno Mars",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7BqBn9nzAq8spo5e7cZ0dJ",
    "youtubeClips": [
      {
        "videoId": "LjhCEhWiKXk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bruno Mars",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "bruno-mars-the-lazy-song",
    "displayName": "The Lazy Song — Bruno Mars",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "386RUes7n1uM1yfzgeUuwp",
    "youtubeClips": [
      {
        "videoId": "fLexgOxsZu0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Bruno Mars",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear = albumet Doo-Wops & Hooligans (okt 2010), inte singeln feb 2011."
      }
    ]
  },
  {
    "id": "david-guetta-gettin-over-you",
    "displayName": "Gettin' Over You — David Guetta & Chris Willis feat. Fergie & LMFAO",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6FbGlkHKGkYqpSCuBgurn3",
    "youtubeClips": [
      {
        "videoId": "hWjrMTWXH28",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "David Guetta",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "despicable-me-2010",
    "displayName": "Dumma mig",
    "correctYear": 2010,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "M2DaSWoK_Ig",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). Svensk titel 'Dumma mig' (Despicable Me). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "eminem-rihanna-love-the-way-you-lie",
    "displayName": "Love the Way You Lie — Eminem & Rihanna",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "RnB"
    ],
    "spotifyTrackId": "15JINEqzVMv3SvJTAXAKED",
    "youtubeClips": [
      {
        "videoId": "RnkShwdXfyc",
        "startSec": 0,
        "endSec": 264,
        "channelTitle": "Eminem - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "kalle-moraeus-underbart",
    "displayName": "Underbart — Kalle Moraeus & Orsa Spelmän",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "XD54TYtS2Bs",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1385)."
      }
    ]
  },
  {
    "id": "katy-perry-california-gurls",
    "displayName": "California Gurls — Katy Perry feat. Snoop Dogg",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6KOEK6SeCEZOQkLj5M1PxH",
    "youtubeClips": [
      {
        "videoId": "F57P9C4SAW4",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "KatyPerryVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "katy-perry-firework",
    "displayName": "Firework — Katy Perry",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1Rpn7ZrCH9YzPjwImoMdu0",
    "youtubeClips": [
      {
        "videoId": "QGJuMBdaqIw",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "KatyPerryVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 10 angiven av Peter."
      }
    ]
  },
  {
    "id": "knaan-wavin-flag",
    "displayName": "Wavin' Flag — K'naan",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0zREtnLmVnt8KUJZZbSdla",
    "youtubeClips": [
      {
        "videoId": "NENQMda7Mbs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "K'NAAN - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "lena-satellite",
    "displayName": "Satellite — Lena",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1vDiBtbtYcEL0mrGhaRQnK",
    "youtubeClips": [
      {
        "videoId": "8QSgNM9yNjo",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2010 vinnare — Tyskland. Officiell music video."
      }
    ]
  },
  {
    "id": "mohombi-bumpy-ride",
    "displayName": "Bumpy Ride — Mohombi",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Summer"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "71R6zJsrF3ffc3TBFHfivX",
    "youtubeClips": [
      {
        "videoId": "G2RCCDSBEGk",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1347)."
      }
    ]
  },
  {
    "id": "rihanna-only-girl",
    "displayName": "Only Girl (In the World) — Rihanna",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5hfxbge0aIPgTxAPIN0YcB",
    "youtubeClips": [
      {
        "videoId": "pa14VNsdSYM",
        "startSec": 16,
        "endSec": 46,
        "channelTitle": "RihannaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "robyn-dancing-on-my-own",
    "displayName": "Dancing on My Own — Robyn",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6aqNCrRA7vs7v6QvRpI50t",
    "youtubeClips": [
      {
        "videoId": "J294A-R1Cjk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Embassy One",
        "license": "standard",
        "notes": "Officiell MV via Embassy One (Robyns label). Ersätter Topic-versionen (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "rolandz-jajamen",
    "displayName": "Jajamen — Rolandz",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dansband",
      "100% in swedish"
    ],
    "spotifyTrackId": "6kKJbnWfmVUKnhqa8n17xT",
    "youtubeClips": [
      {
        "videoId": "rU-ngQ5hSF8",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "sean-banan-gott-nytt-jul",
    "displayName": "Gott nytt jul — Sean Banan",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Christmas edition"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "63pw3bp6Nf4uxXrcGZT9c9",
    "youtubeClips": [
      {
        "videoId": "nMcEuS2-CuY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1429)."
      }
    ]
  },
  {
    "id": "shakira-waka-waka",
    "displayName": "Waka Waka (This Time for Africa) — Shakira",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2D0fFvKKxLfXDfdAuwsnWn",
    "youtubeClips": [
      {
        "videoId": "Ntn1-SocNiY",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "shakiraVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella Vevo-videon, startSec 5 angiven av Peter. Ligger FORST for att pickMediaSource alltid valjer youtubeClips[0]; lyrics-klippet czWcyZRAMtk behalls som andra post pa Peters begaran men spelas inte."
      },
      {
        "videoId": "czWcyZRAMtk",
        "startSec": 0,
        "endSec": 202,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "snoop-dogg-sweat",
    "displayName": "Sweat — Snoop Dogg",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0R7YVi7w41Dr9jU5vblAok",
    "youtubeClips": [
      {
        "videoId": "KnEXrbAQyIo",
        "startSec": 6,
        "endSec": 21,
        "license": "standard"
      }
    ]
  },
  {
    "id": "swedish-house-mafia-one",
    "displayName": "One (Your Name) — Swedish House Mafia",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "1qZMPmpD1jDcOA7gZ6TCde",
    "youtubeClips": [
      {
        "videoId": "RVnsoTsG1Rg",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "MrWeiird",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "the-social-network-2010",
    "displayName": "The Social Network",
    "correctYear": 2010,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "isAnimated": false,
    "correctNames": [
      "Jesse Eisenberg",
      "Andrew Garfield"
    ],
    "distractorNames": [
      "Michael Cera",
      "Joseph Gordon-Levitt",
      "Shia LaBeouf",
      "Anton Yelchin"
    ],
    "youtubeClips": [
      {
        "videoId": "rBCNU0XT9GY",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Sony Pictures Releasing UK",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-12. Officiell Sony-trailer. Titeln innehåller '15 October 2010' men frågan är actor-select, så året är inte svaret — får INTE bytas till timeline utan nytt klipp."
      }
    ]
  },
  {
    "id": "timoteij-kom",
    "displayName": "Kom — Timoteij",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "0LPRlUS1zVjMC4z5X7L5sG",
    "youtubeClips": [
      {
        "videoId": "wy2NXJHCFao",
        "startSec": 8,
        "endSec": 23,
        "channelTitle": "Uaum",
        "license": "standard",
        "notes": "Musikvideo. Inget officiellt MV finns. Tillagd 2026-06-04."
      }
    ]
  },
  {
    "id": "adele-someone-like-you",
    "displayName": "Someone Like You — Adele",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1zwMYTA5nlNjZxYrvBB2pV",
    "youtubeClips": [
      {
        "videoId": "hLQl3WQQoQ0",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Adele",
        "license": "standard",
        "notes": "Official Music Video — signature ballad. Chorus area."
      }
    ]
  },
  {
    "id": "avicii-levels",
    "displayName": "Levels — Avicii",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5UqCQaDshqbIk3pkhy4Pjg",
    "youtubeClips": [
      {
        "videoId": "yMsKK0zNT_4",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Kontor.TV",
        "license": "standard"
      }
    ]
  },
  {
    "id": "beyonce-love-on-top",
    "displayName": "Love On Top — Beyoncé",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1z6WtY7X4HQJvzxC4UgkSf",
    "youtubeClips": [
      {
        "videoId": "Ob7vObnFUJc",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "BeyoncéVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "danny-saucedo-in-da-club",
    "displayName": "In da club — Danny Saucedo",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "3GbgOBpbw71zpy7lCnU6N6",
    "youtubeClips": []
  },
  {
    "id": "danny-saucedo-in-the-club",
    "displayName": "In the Club — Danny Saucedo",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "d_iz6e3ETPg",
        "startSec": 42,
        "endSec": 72,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1423)."
      }
    ]
  },
  {
    "id": "den-svenska-bjornstammen-vart-jag-mig",
    "displayName": "Vart jag mig i världen vänder — Den Svenska Björnstammen",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "jI2EcRXR7RU",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1413)."
      }
    ]
  },
  {
    "id": "ell-nikki-running-scared",
    "displayName": "Running Scared — Ell & Nikki",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4VbrrypzzSDiNu2DAlJp9A",
    "youtubeClips": [
      {
        "videoId": "3Vk4HYUatv8",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2011 vinnare — Azerbajdzjan. Officiell music video."
      }
    ]
  },
  {
    "id": "eric-saade-popular",
    "displayName": "Popular — Eric Saade",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6qOZqzzmFBu8nyAA7qOVWZ",
    "youtubeClips": [
      {
        "videoId": "g_67DS2j9hs",
        "startSec": 35,
        "endSec": 50,
        "channelTitle": "Eric Saade",
        "license": "standard",
        "notes": "Melodifestivalen 2011 vinnare. Officiell music video (Director's Cut)."
      }
    ]
  },
  {
    "id": "gotye-somebody-that-i-used-to-know",
    "displayName": "Somebody That I Used to Know — Gotye",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1qDrWA6lyx8cLECdZE7TV7",
    "youtubeClips": [
      {
        "videoId": "8UVNT4wvIGY",
        "startSec": 90,
        "endSec": 105,
        "channelTitle": "Gotye",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "jennifer-lopez-on-the-floor",
    "displayName": "On the Floor — Jennifer Lopez feat. Pitbull",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3C0nOe05EIt1390bVABLyN",
    "youtubeClips": [
      {
        "videoId": "t4H_Zoh7G5A",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "JenniferLopezVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 5 angiven av Peter."
      }
    ]
  },
  {
    "id": "jessie-j-domino",
    "displayName": "Domino — Jessie J",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2fQxE0jVrjNMT9oJAXtSJR",
    "youtubeClips": [
      {
        "videoId": "UJtB55MaoD0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "JessieJVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "jessie-j-price-tag",
    "displayName": "Price Tag — Jessie J feat. B.o.B",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5DQ2WTk3hMTsLoLKrDTV7X",
    "youtubeClips": [
      {
        "videoId": "qMxX-QOV9tI",
        "startSec": 17,
        "endSec": 47,
        "channelTitle": "JessieJVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "lmfao-party-rock-anthem",
    "displayName": "Party Rock Anthem — LMFAO",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1ve0SgTZkv3wdggJLqtBYU",
    "youtubeClips": [
      {
        "videoId": "XD96scj1kd8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Musikmix Germany",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "lykke-li-i-follow-rivers",
    "displayName": "I Follow Rivers — Lykke Li",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3WlVUkLgGYByiGj8gF4erq",
    "youtubeClips": [
      {
        "videoId": "9dzub7uXWl4",
        "startSec": 7,
        "endSec": 22,
        "license": "standard"
      }
    ]
  },
  {
    "id": "maroon-5-moves-like-jagger",
    "displayName": "Moves Like Jagger — Maroon 5 feat. Christina Aguilera",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7jEUxosffRXOZ7rNSajygF",
    "youtubeClips": [
      {
        "videoId": "iEPTlhBmwRg",
        "startSec": 60,
        "endSec": 90,
        "channelTitle": "Maroon5VEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 60 angiven av Peter - videon ar 4:39 mot latens 3:21 och oppnar med intervjuklipp."
      }
    ]
  },
  {
    "id": "moneyball-2011",
    "displayName": "Moneyball",
    "correctYear": 2011,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 80,
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
    "genrePackages": [
      "sport"
    ],
    "isAnimated": false,
    "correctNames": [
      "Brad Pitt"
    ],
    "distractorNames": [
      "Matt Damon",
      "George Clooney",
      "Ryan Gosling",
      "Christian Bale"
    ],
    "youtubeClips": [
      {
        "videoId": "-4QPVo0UIzc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rotten Tomatoes Trailers",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "rihanna-we-found-love",
    "displayName": "We Found Love — Rihanna feat. Calvin Harris",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "Dance Music"
    ],
    "spotifyTrackId": "6qn9YLKt13AGvpq9jfO8py",
    "youtubeClips": [
      {
        "videoId": "tg00YEETFzg",
        "startSec": 52,
        "endSec": 82,
        "channelTitle": "RihannaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "selena-gomez-love-you-like-a-love-song",
    "displayName": "Love You Like a Love Song — Selena Gomez & the Scene",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "0laYHRpNTS6i8FXdupHkJ4",
    "youtubeClips": [
      {
        "videoId": "EgT_us6AsDg",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "SelenaGomezVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "svenska-bjornstammen-vart-jag-mig-an-i-varlden-vander",
    "displayName": "Vart jag mig än i världen vänder — Svenska björnstammen",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Hip Hop",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7tp6kUwoTCmWzkH21hXulO",
    "youtubeClips": [
      {
        "videoId": "jI2EcRXR7RU",
        "startSec": 15,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "swedish-house-mafia-save-the-world",
    "displayName": "Save the World — Swedish House Mafia",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0R42XHlMMu4hBgOvdICIsU",
    "youtubeClips": [
      {
        "videoId": "-ea-R_90WQI",
        "startSec": 6,
        "endSec": 36,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1289)."
      },
      {
        "videoId": "DTjTPceTdwo",
        "startSec": 6,
        "endSec": 36,
        "license": "standard"
      }
    ]
  },
  {
    "id": "swingfly-me-and-my-drum",
    "displayName": "Me and My Drum — Swingfly",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5BiDVAxPIFmu4Qp0S3HZxc",
    "youtubeClips": [
      {
        "videoId": "UonzieycUp4",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1398)."
      }
    ]
  },
  {
    "id": "veronica-maggio-jag-kommer",
    "displayName": "Jag kommer — Veronica Maggio",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "5M2y8QdDepGYMsWyxhoxQU",
    "youtubeClips": [
      {
        "videoId": "VjZwz3yxS9I",
        "startSec": 40,
        "endSec": 55,
        "channelTitle": "Veronica Maggio - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "carly-rae-jepsen-call-me-maybe",
    "displayName": "Call Me Maybe — Carly Rae Jepsen",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "20I6sIOMTCkB6w7ryavxtO",
    "youtubeClips": [
      {
        "videoId": "fWNaR-rxAic",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "CarlyRaeJepsenVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Ersatte reuploaden 47EG91_XHic (Unique Vibes) med officiella Vevo-klippet."
      }
    ]
  },
  {
    "id": "david-lindgren-shout-it-out",
    "displayName": "Shout It Out — David Lindgren",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "25qYWpPZeaHvx41GLi0vpV",
    "youtubeClips": [
      {
        "videoId": "GkRXTG_d37s",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1387)."
      }
    ]
  },
  {
    "id": "first-aid-kit-emmylou",
    "displayName": "Emmylou — First Aid Kit",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2bU3gg0M8GGBs7ItBKsJX9",
    "youtubeClips": [
      {
        "videoId": "nPWrX9PJAOs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "First Aid Kit",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "icona-pop-i-love-it",
    "displayName": "I Love It — Icona Pop",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3VZQshi4COChhXaz7cLP02",
    "youtubeClips": [
      {
        "videoId": "UxxajLWwzqY",
        "startSec": 19,
        "endSec": 49,
        "channelTitle": "Icona Pop",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella videon. startSec 19 angiven av Peter."
      },
      {
        "videoId": "RGlo-GuCKFg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "GIRLS FOR MUSIC",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Lyrics. startSec 0 angiven av Peter. Ersatte JKko13wVxE8 (min ersattning for Peters MZm-vC9CBe4 som inte gick att badda in)."
      }
    ]
  },
  {
    "id": "justin-bieber-beauty-and-a-beat",
    "displayName": "Beauty and a Beat — Justin Bieber feat. Nicki Minaj",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6QFCMUUq1T2Vf5sFUXcuQ7",
    "youtubeClips": [
      {
        "videoId": "l8hIx9AceOw",
        "startSec": 40,
        "endSec": 70,
        "channelTitle": "TopMusicVidsWeekly",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "kapten-rod-nar-solen-gar-ner",
    "displayName": "När solen går ner — Kapten Röd",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "68GdZAAowWDac3SkdNWOwo",
    "youtubeClips": []
  },
  {
    "id": "loreen-euphoria",
    "displayName": "Euphoria — Loreen",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "1xN7BpTAWnZkuSLOtRP6Qc",
    "youtubeClips": [
      {
        "videoId": "Pfo-8z86x80",
        "startSec": 7,
        "endSec": 37,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-klippet chK8XTtqEJI. ESC-finalen. startSec 7 angiven av Peter. Titeln har '2012' vid tecken 76 av 80 - bor kapas bort i spelaren, men VERIFIERA."
      },
      {
        "videoId": "bGVldEkd06o",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "Lovemusic187",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-klippet chK8XTtqEJI. Lyrics-version. startSec 2 angiven av Peter. Peters egna _v9iT4SZPT8 SPOILAR: titeln ar 49 tecken med '2012' vid tecken 45 = fullt synligt. Detta klipp har ren titel."
      }
    ]
  },
  {
    "id": "magnus-uggla-jag-och-min-far",
    "displayName": "Jag och min far — Magnus Uggla",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "youtubeClips": [
      {
        "videoId": "fRY6jg2ESbI",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1407)."
      }
    ]
  },
  {
    "id": "medina-dar-palmerna-bor",
    "displayName": "Där palmerna bor — Medina",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "3YMcYxdrQwFA8gv6kiLKOo",
    "youtubeClips": [
      {
        "videoId": "TLD74qRkhs8",
        "startSec": 55,
        "endSec": 70,
        "license": "standard"
      }
    ]
  },
  {
    "id": "norlie-kkv-dar-jag-hanger-min-hatt",
    "displayName": "Där jag hänger min hatt — Norlie & KKV",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2Sl83ewoJgUBQCb3dvSTma",
    "youtubeClips": []
  },
  {
    "id": "norlie-kkv-trojan-du-hatar",
    "displayName": "Tröjan du hatar — Norlie & KKV",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "17qZsun9q3L8ceIa3kPz4A",
    "youtubeClips": []
  },
  {
    "id": "petra-marklund-handerna-mot-himlen",
    "displayName": "Händerna mot himlen — Petra Marklund",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "youtubeClips": [
      {
        "videoId": "f4fB9EXpMTI",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1412)."
      }
    ]
  },
  {
    "id": "pink-just-give-me-a-reason",
    "displayName": "Just give me a reason — Pink",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "1qHaLcG3LOeh6ZB8vii5ZZ",
    "youtubeClips": []
  },
  {
    "id": "psy-gangnam-style",
    "displayName": "Gangnam Style — PSY",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "5LFI2thMPBo2viCRVVqFFa",
    "youtubeClips": [
      {
        "videoId": "9bZkp7q19f0",
        "startSec": 0,
        "endSec": 253,
        "channelTitle": "officialpsy",
        "license": "standard"
      }
    ]
  },
  {
    "id": "rihanna-diamonds",
    "displayName": "Diamonds — Rihanna",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "1z9kQ14XBSN0r2v6fx4IdG",
    "youtubeClips": [
      {
        "videoId": "LyKYV_7vs6k",
        "startSec": 48,
        "endSec": 68,
        "channelTitle": "PremiunMusicHD",
        "license": "standard"
      }
    ]
  },
  {
    "id": "sean-banan-sean-den-forste-banan",
    "displayName": "Sean den förste banan — Sean Banan",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5J2UfqBylH8jDQZJnxby81",
    "youtubeClips": [
      {
        "videoId": "a5fceiuy6Po",
        "startSec": 9,
        "endSec": 39,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1428)."
      },
      {
        "videoId": "Rz6OPt1rl58",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1428)."
      }
    ]
  },
  {
    "id": "swedish-house-mafia-dont-you-worry-child",
    "displayName": "Don't You Worry Child — Swedish House Mafia",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "3zu2CuVTJwaZn2m4rBzaUO",
    "youtubeClips": [
      {
        "videoId": "02Qa5PH0tZY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Aernoron",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      }
    ]
  },
  {
    "id": "the-avengers-2012",
    "displayName": "The Avengers",
    "correctYear": 2012,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "eOrNdBpGMv8",
        "startSec": 7,
        "endSec": 37,
        "channelTitle": "Marvel Entertainment",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx). Officiell Marvel-trailer, ingen ar-spoiler. parentControlled=true per Film.xlsx."
      }
    ]
  },
  {
    "id": "avicii-hey-brother",
    "displayName": "Hey Brother — Avicii",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "4lhqb6JvbHId48OUJGwymk",
    "youtubeClips": [
      {
        "videoId": "OjpX8ILe2N4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Avicii - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "avicii-wake-me-up",
    "displayName": "Wake Me Up — Avicii",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "0nrRP2bk19rLc0orkWPQk2",
    "youtubeClips": [
      {
        "videoId": "2NiyrtYegso",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Avicii - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "behrang-miri-jalla-dansa-sawa",
    "displayName": "Jalla Dansa Sawa — Behrang Miri",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6mn9gln5HdtYE11FOjQdxN",
    "youtubeClips": [
      {
        "videoId": "n4a1gJMy7wo",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1397)."
      }
    ]
  },
  {
    "id": "daft-punk-get-lucky",
    "displayName": "Get Lucky — Daft Punk",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "2Foc5Q5nqNiosCNqttzHof",
    "youtubeClips": [
      {
        "videoId": "5glDAaCaazc",
        "startSec": 0,
        "endSec": 246,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "emmelie-de-forest-only-teardrops",
    "displayName": "Only Teardrops — Emmelie de Forest",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "269y1Vw3O0C9uI3drXpfo9",
    "youtubeClips": [
      {
        "videoId": "k59E7T0H-Us",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2013 vinnare — Danmark. Officiell music video."
      }
    ]
  },
  {
    "id": "hakan-hellstrom-aldrig-over",
    "displayName": "Det kommer aldrig va över för mig — Håkan Hellström",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "3SjXx3rbNGk8nCho8YEoz5",
    "youtubeClips": [
      {
        "videoId": "z0hiC9rCG1c",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Håkan Hellström - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "hundraringen-klev-ut",
    "displayName": "Hundraåringen som klev ut genom fönstret och försvann",
    "correctYear": 2013,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 88,
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
    "isAnimated": false,
    "correctNames": [
      "Robert Gustafsson"
    ],
    "distractorNames": [
      "Rolf Lassgård",
      "Mikael Nyqvist",
      "Peter Haber",
      "Mikael Persbrandt"
    ],
    "youtubeClips": [
      {
        "videoId": "pjiJ1cL3Uss",
        "startSec": 10,
        "endSec": 45,
        "channelTitle": "Buena Vista Sverige",
        "license": "standard",
        "notes": "Officiell svensk trailer. Buena Vista Sverige. Robert Gustafsson."
      }
    ]
  },
  {
    "id": "john-newman-love-me-again",
    "displayName": "Love Me Again — John Newman",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "5TbzAWWc5eJaANpA9kfGCd",
    "youtubeClips": []
  },
  {
    "id": "katy-perry-this-is-how-we-do",
    "displayName": "This Is How We Do — Katy Perry",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4ZxY5A1Bv27yu7RiT4RTOj",
    "youtubeClips": [
      {
        "videoId": "7RMQksXpQSk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "KatyPerryVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "lassemajas-detektivbyra-2013",
    "displayName": "LasseMajas Detektivbyrå – Det första mysteriet",
    "correctYear": 2013,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
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
    "youtubeClips": [
      {
        "videoId": "2C1qbrYfdy8",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "one-direction-story-of-my-life",
    "displayName": "Story of My Life — One Direction",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5kg9mgrVoxTCm4PK37xP1a",
    "youtubeClips": [
      {
        "videoId": "W-TE_Ys4iwM",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "OneDirectionVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters ID Fe39sYmOxzk var SD-reupload; bytt till officiella Vevo-klippet (HD)."
      }
    ]
  },
  {
    "id": "pharrell-williams-happy",
    "displayName": "Happy — Pharrell Williams",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "6NPVjNh8Jhru9xOmyQigds",
    "youtubeClips": [
      {
        "videoId": "ZbZSe6N_BXs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "PharrellWilliamsVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "pitbull-timber",
    "displayName": "Timber — Pitbull feat. Kesha",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3cHyrEgdyYRjgJKSOiOtcS",
    "youtubeClips": [
      {
        "videoId": "hHUbLv4ThOo",
        "startSec": 1,
        "endSec": 31,
        "channelTitle": "PitbullVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "poodles-en-for-alla-for-en",
    "displayName": "En för alla, för en — Tre Kronor & The Poodles",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "sport"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1gkzmB8NwKDFgKvZDSG6qU",
    "youtubeClips": [
      {
        "videoId": "MxUhHQKZRGs",
        "startSec": 14,
        "endSec": 29,
        "license": "standard"
      }
    ]
  },
  {
    "id": "robin-stjernberg-you",
    "displayName": "You — Robin Stjernberg",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "4mm2fuo5UJNscczsxtAZvb",
    "youtubeClips": [
      {
        "videoId": "vtjdTPnCcu0",
        "startSec": 13,
        "endSec": 38,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2013 vinnare. ESC 2013 performance."
      }
    ]
  },
  {
    "id": "sean-banan-copacabanana",
    "displayName": "Copacabanana — Sean Banan",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5cgISlMMIShxqkGhK9bTFY",
    "youtubeClips": []
  },
  {
    "id": "the-wolf-of-wall-street-2013",
    "displayName": "The Wolf of Wall Street",
    "correctYear": 2013,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "parentControlled": true,
    "youtubeClips": [
      {
        "videoId": "iszwuX1AK6A",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-15 (Film.xlsx). parentControlled=true per Film.xlsx. VERIFIERA i spelaren att titeln inte visar aret (Year-fraga)."
      }
    ]
  },
  {
    "id": "tove-lo-habits",
    "displayName": "Habits (Stay High) — Tove Lo",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "45bjfDupYDRGIAmZxPG5RL",
    "youtubeClips": [
      {
        "videoId": "fG-EIvEiSHs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tove Lo",
        "license": "standard",
        "notes": "Officiell OG Independent Video från Tove Lo:s egen kanal. Ersätter Topic-versionen."
      }
    ]
  },
  {
    "id": "veronica-maggio-and-hakan-hellstrom-hela-huset",
    "displayName": "Hela huset — Veronica Maggio & Håkan Hellström",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "youtubeClips": [
      {
        "videoId": "nPUtRUoW_Qc",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "ylvis-the-fox",
    "displayName": "The Fox (What Does the Fox Say?) — Ylvis",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5HOpkTTVcmZHnthgyxrIL8",
    "youtubeClips": [
      {
        "videoId": "jofNR_WkoCE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Ylvis",
        "license": "standard",
        "notes": "Official music video. Viral hit 2013."
      }
    ]
  },
  {
    "id": "alcazar-blame-it-on-the-disco",
    "displayName": "Blame It on the Disco — Alcazar",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4IZy2nI5mAxLtlLPbcErqc",
    "youtubeClips": [
      {
        "videoId": "AoB8UyLpBLo",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1378)."
      }
    ]
  },
  {
    "id": "alesso-feat-tove-lo-heroes-we-could-be",
    "displayName": "Heroes (We Could Be) — Alesso feat. Tove Lo",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "youtubeClips": [
      {
        "videoId": "a7SouU3ECpU",
        "startSec": 70,
        "endSec": 85,
        "license": "standard"
      }
    ]
  },
  {
    "id": "alesso-under-control",
    "displayName": "Under control — Alesso",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "4J7CKHCF3mdL4diUsmW8lq",
    "youtubeClips": []
  },
  {
    "id": "ariana-grande-break-free",
    "displayName": "Break Free — Ariana Grande feat. Zedd",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "RnB"
    ],
    "spotifyTrackId": "2lOgTEwxmRPBtjp60opyRN",
    "youtubeClips": [
      {
        "videoId": "pcRKNslSS5g",
        "startSec": 28,
        "endSec": 58,
        "channelTitle": "Ariana Grande Official",
        "license": "standard",
        "notes": "Ersatte dött klipp (deleted/private) 2026-09-12 — official audio."
      }
    ]
  },
  {
    "id": "ariana-grande-love-me-harder",
    "displayName": "Love Me Harder — Ariana Grande & The Weeknd",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7HE1FnMtSsRotzIAQPXpr5",
    "youtubeClips": [
      {
        "videoId": "g5qU7p7yOY8",
        "startSec": 12,
        "endSec": 30,
        "channelTitle": "ArianaGrandeVevo",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 0->12 (Peter 2026-08-29)."
      }
    ]
  },
  {
    "id": "ariana-grande-one-last-time",
    "displayName": "One Last Time — Ariana Grande",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "RnB"
    ],
    "spotifyTrackId": "1CAksvEO6oRHd9bBKWAfuY",
    "youtubeClips": [
      {
        "videoId": "BPgEgaPk62M",
        "startSec": 46,
        "endSec": 76,
        "channelTitle": "ArianaGrandeVevo",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "calvin-harris-summer",
    "displayName": "Summer — Calvin Harris",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6YUTL4dYpB9xZO5qExPf05",
    "youtubeClips": []
  },
  {
    "id": "conchita-wurst-rise-like-a-phoenix",
    "displayName": "Rise Like a Phoenix — Conchita Wurst",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2KqrsypJqXIKDentWkQu0J",
    "youtubeClips": [
      {
        "videoId": "ToqNa0rqUtY",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2014 vinnare — Österrike. Officiell music video."
      }
    ]
  },
  {
    "id": "ed-sheeran-thinking-out-loud",
    "displayName": "Thinking Out Loud — Ed Sheeran",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "34gCuhDGsG4bRPIf9bb02f",
    "youtubeClips": [
      {
        "videoId": "lp-EO5I60KA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ed Sheeran",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "hoffmaestro-highway-man",
    "displayName": "Highway Man — Hoffmaestro",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "spotifyTrackId": "6jPggfBgf9SFe1Ae4HTBxA",
    "youtubeClips": [
      {
        "videoId": "pHo97vRiS5w",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-03 ur Music.xlsx (rad 1272)."
      }
    ]
  },
  {
    "id": "j-cole-no-role-modelz",
    "displayName": "No Role Modelz — J. Cole",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "62vpWI1CHwFy7tMIcSStl8",
    "youtubeClips": [
      {
        "videoId": "JatWTfTCxJ8",
        "startSec": 10,
        "endSec": 40,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1286)."
      },
      {
        "videoId": "nSERqaFagJc",
        "startSec": 0,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "khaliffa-det-stralar-sa-om-dig",
    "displayName": "det strålar så om dig — Khaliffa",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "5oyoSYc1CKzx9Bz5SHQhdo",
    "youtubeClips": []
  },
  {
    "id": "linus-svenning-broder",
    "displayName": "Bröder — Linus Svenning",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1TZtXdQwnbk1jOXnfyShRb",
    "youtubeClips": [
      {
        "videoId": "iBExcsRFNOA",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1381)."
      }
    ]
  },
  {
    "id": "mark-ronson-uptown-funk",
    "displayName": "Uptown Funk — Mark Ronson ft. Bruno Mars",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 89,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "32OlwWuMpZ6b0aN2RZOeMS",
    "youtubeClips": [
      {
        "videoId": "fmsv4gPe9bg",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Mark Ronson - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100). Behallet medvetet 2026-08-25: officiell Topic-upload slar reupload-alternativet ZUOuiPBWNLM."
      }
    ]
  },
  {
    "id": "meghan-trainor-all-about-that-bass",
    "displayName": "All About That Bass — Meghan Trainor",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5jE48hhRu8E6zBDPRSkEq7",
    "youtubeClips": [
      {
        "videoId": "7PCkvCPvDXk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "MeghanTrainorVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "panetoz-efter-solsken",
    "displayName": "Efter solsken — Panetoz",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2dh07zmyCMoY64rQdJrXLe",
    "youtubeClips": [
      {
        "videoId": "UarrvvhOYek",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1393)."
      }
    ]
  },
  {
    "id": "pitbull-fireball",
    "displayName": "Fireball — Pitbull",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop",
      "Dance Music"
    ],
    "spotifyTrackId": "4Y7XAxTANhu3lmnLAzhWJW",
    "youtubeClips": [
      {
        "videoId": "HMqgVXSvwGo",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-08 ur Music.xlsx (rad 1291)."
      },
      {
        "videoId": "WJT5SGS6qkY",
        "startSec": 0,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "sanna-nielsen-undo",
    "displayName": "Undo — Sanna Nielsen",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "4VMa2QVWFDgJyh6rVA3reO",
    "youtubeClips": [
      {
        "videoId": "N_hmzLU1_cc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Sanna Nielsen",
        "license": "standard",
        "notes": "Melodifestivalen 2014 vinnare. Officiell music video."
      }
    ]
  },
  {
    "id": "taylor-swift-blank-space",
    "displayName": "Blank Space — Taylor Swift",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1p80LdxRV74UKvL8gnD7ky",
    "youtubeClips": [
      {
        "videoId": "e-ORhEE9VVg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Taylor Swift",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "taylor-swift-shake-it-off",
    "displayName": "Shake It Off — Taylor Swift",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5xTtaWoae3wi06K5WfVUUH",
    "youtubeClips": [
      {
        "videoId": "nfWlot6h_JM",
        "startSec": 0,
        "endSec": 242,
        "channelTitle": "Taylor Swift",
        "license": "standard"
      }
    ]
  },
  {
    "id": "the-grand-budapest-hotel-2014",
    "displayName": "The Grand Budapest Hotel",
    "correctYear": 2014,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "zru-1DbbcsA",
        "startSec": 6,
        "endSec": 36,
        "channelTitle": "FilmIsNow Movies",
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 (Film.xlsx), bytt actor-select->timeline 2026-09-15 per uppdaterad Film.xlsx + Peters bekraftelse. ⚠ SPOILER-RISK: aret 2014 star i titeln och AR nu svaret — verifiera i spelaren om '2014' syns och byt annars till ett klipp utan aret i titeln. OBS: RED BAND-trailer (moget innehall) — Peter markerade INTE parentControlled i Film.xlsx, men overvag det."
      }
    ]
  },
  {
    "id": "adele-hello",
    "displayName": "Hello — Adele",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "1Yk0cQdMLx5RzzFTYwmuld",
    "youtubeClips": [
      {
        "videoId": "YQHsXMglC9A",
        "startSec": 70,
        "endSec": 85,
        "channelTitle": "Adele",
        "license": "standard"
      }
    ]
  },
  {
    "id": "coldplay-hymn-for-the-weekend",
    "displayName": "Hymn for the Weekend — Coldplay",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "3RiPr603aXAoi4GHyXx0uy",
    "youtubeClips": [
      {
        "videoId": "YykjpeuMNEk",
        "startSec": 34,
        "endSec": 64,
        "channelTitle": "Coldplay",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 34 angiven av Peter. correctYear = albumet A Head Full of Dreams (dec 2015), inte singeln jan 2016."
      }
    ]
  },
  {
    "id": "danny-saucedo-brinner-i-brostet",
    "displayName": "Brinner i bröstet — Danny Saucedo",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "t6GekWxcZvo",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1424)."
      }
    ]
  },
  {
    "id": "danny-saucedo-sa-som-i-himlen",
    "displayName": "Så som i himlen — Danny Saucedo",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "66J13KTyLKy0nNygx1CKU4",
    "youtubeClips": []
  },
  {
    "id": "dnce-cake-by-the-ocean",
    "displayName": "Cake by the Ocean — DNCE",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7L5jgZtAyfiU7elB8DIqCx",
    "youtubeClips": [
      {
        "videoId": "vWaRiD5ym74",
        "startSec": 37,
        "endSec": 67,
        "channelTitle": "DNCEVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "ellie-goulding-love-me-like-you-do",
    "displayName": "Love Me Like You Do — Ellie Goulding",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7y2YUIyCuVhBidENVT0068",
    "youtubeClips": [
      {
        "videoId": "AJtDXIazrMo",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "EllieGouldingVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 20 angiven av Peter."
      }
    ]
  },
  {
    "id": "en-man-som-heter-ove",
    "displayName": "En man som heter Ove",
    "correctYear": 2015,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 90,
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
    "isAnimated": false,
    "correctNames": [
      "Rolf Lassgård"
    ],
    "distractorNames": [
      "Robert Gustafsson",
      "Mikael Nyqvist",
      "Mikael Persbrandt",
      "Peter Haber"
    ],
    "youtubeClips": [
      {
        "videoId": "q84plEEyGZY",
        "startSec": 12,
        "endSec": 47,
        "channelTitle": "MovieZine",
        "license": "standard",
        "notes": "Officiell svensk trailer. Rolf Lassgård. SF Studios-produktion."
      }
    ]
  },
  {
    "id": "eric-saade-sting",
    "displayName": "Sting — Eric Saade",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 62,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1bCrjqABEklwllefPAzWbZ",
    "youtubeClips": []
  },
  {
    "id": "hasse-andersson-guld-och-groena-skogar",
    "displayName": "Guld och gröna skogar — Hasse Andersson",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "spotifyTrackId": "6EnNjWkk1YX3fsTXtwO773",
    "youtubeClips": [
      {
        "videoId": "fDQRShw-Vdc",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      },
      {
        "videoId": "1SudSj4156A",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "major-lazer-lean-on",
    "displayName": "Lean On — Major Lazer & DJ Snake feat. MØ",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4vS8VaBwJJV5Ry7UFIQuoo",
    "youtubeClips": [
      {
        "videoId": "YqeW9_5kURI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Major Lazer Official",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "mans-zelmerlow-heroes",
    "displayName": "Heroes — Måns Zelmerlöw",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "21BYhl07wWqGRQaj7sUxdV",
    "youtubeClips": [
      {
        "videoId": "oAQKr5aJJjQ",
        "startSec": 2,
        "endSec": 32,
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27, ersatte tidigare klipp -nbq6Ur103Q."
      }
    ]
  },
  {
    "id": "marcus-martinus-elektrisk",
    "displayName": "Elektrisk — Marcus & Martinus",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "youtubeClips": [
      {
        "videoId": "ri5_fzndMBg",
        "startSec": 13,
        "endSec": 43,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1404)."
      }
    ]
  },
  {
    "id": "markus-och-martinus-elektrisk",
    "displayName": "Elektrisk — Markus och Martinus",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1jU7I17rDKUbnIAJJkNVAy",
    "youtubeClips": [
      {
        "videoId": "ri5_fzndMBg",
        "startSec": 13,
        "endSec": 28,
        "license": "standard"
      }
    ]
  },
  {
    "id": "norlie-kkv-ingen-annan-ror-mig-som-du",
    "displayName": "Ingen annan rör mig som du — Norlie & KKV",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "25V8NDi9if73rYvHwDKKw5",
    "youtubeClips": [
      {
        "videoId": "URbjo_9ABfs",
        "startSec": 26,
        "endSec": 56,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "shawn-mendes-i-know-what-you-did-last-summer",
    "displayName": "I Know What You Did Last Summer — Shawn Mendes & Camila Cabello",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2GyA33q5rti5IxkMQemRDH",
    "youtubeClips": [
      {
        "videoId": "kalsoK9K3mI",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "krsxel",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "shawn-mendes-stitches",
    "displayName": "Stitches — Shawn Mendes",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5jsw9uXEGuKyJzs0boZ1bT",
    "youtubeClips": [
      {
        "videoId": "Lguev0C0F-g",
        "startSec": 25,
        "endSec": 55,
        "channelTitle": "Shawn Mendes Official",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "sia-cheap-thrills",
    "displayName": "Cheap Thrills — Sia",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 83,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3S4px9f4lceWdKf0gWciFu",
    "youtubeClips": [
      {
        "videoId": "nYh-n7EOtMA",
        "startSec": 21,
        "endSec": 51,
        "channelTitle": "SiaVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 21 angiven av Peter. Ersatte Topic-klippet HbzZPpWr4MI (solo-versionen); detta ar officiella lyric-videon ft. Sean Paul."
      },
      {
        "videoId": "mY9fNwGE7YA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-29. Lyrics-klipp (7clouds) ft. Sean Paul. Titeln avslöjar inte årtalet."
      }
    ]
  },
  {
    "id": "wiz-khalifa-charlie-puth-see-you-again",
    "displayName": "See You Again — Wiz Khalifa & Charlie Puth",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "66CFbqJScx6zRieGllITcs",
    "youtubeClips": [
      {
        "videoId": "RgKAFK5djSk",
        "startSec": 7,
        "endSec": 238,
        "channelTitle": "Wiz Khalifa Music",
        "license": "standard"
      }
    ]
  },
  {
    "id": "zara-larsson-lush-life",
    "displayName": "Lush Life — Zara Larsson",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1rIKgCH4H52lrvDcz50hS8",
    "youtubeClips": [
      {
        "videoId": "tD4HCZe-tew",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "ZaraLarssonMusicVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Ersatte Topic-klippet 8BmMB3i--FM med officiella musikvideon (samma langd 3:22, sa startSec 30 traffar samma parti)."
      }
    ]
  },
  {
    "id": "angry-birds",
    "displayName": "The Angry Birds Movie",
    "correctYear": 2016,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "itemHcp": 82,
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
    "youtubeClips": [
      {
        "videoId": "e4sdQBmqnuA",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Sony Pictures Releasing UK",
        "license": "standard",
        "notes": "Sony Pictures UK — officiell 2016-trailer. Red + Bomb + Chuck i fokus. Ej embed-blockerad."
      }
    ]
  },
  {
    "id": "ariana-grande-side-to-side",
    "displayName": "Side to Side — Ariana Grande feat. Nicki Minaj",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4pLwZjInHj3SimIyN9SnOz",
    "youtubeClips": [
      {
        "videoId": "SXiSVQZLje8",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ArianaGrandeVevo",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Peters ID gN3heDvl_OQ var dott; officiella Vevo-klippet anvant istallet."
      }
    ]
  },
  {
    "id": "calvin-harris-this-is-what-you-came-for",
    "displayName": "This Is What You Came For — Calvin Harris & Rihanna",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Disco & Pop"
    ],
    "spotifyTrackId": "0azC730Exh71aQlOt9Zj3y",
    "youtubeClips": [
      {
        "videoId": "kOkQ4T5WO9E",
        "startSec": 16,
        "endSec": 46,
        "channelTitle": "CalvinHarrisVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 16 angiven av Peter."
      }
    ]
  },
  {
    "id": "chainsmokers-closer",
    "displayName": "Closer — The Chainsmokers",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7BKLCZ1jbUBVqRi2FVlTVw",
    "youtubeClips": [
      {
        "videoId": "OGP499ko5EQ",
        "startSec": 0,
        "endSec": 244,
        "channelTitle": "7clouds Rock",
        "license": "standard"
      }
    ]
  },
  {
    "id": "clean-bandit-rockabye",
    "displayName": "Rockabye — Clean Bandit feat. Sean Paul & Anne-Marie",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2hrUO4drrO63i7FYbCLBl2",
    "youtubeClips": [
      {
        "videoId": "papuvlVeZg8",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Clean Bandit",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "dj-snake-let-me-love-you",
    "displayName": "Let Me Love You — DJ Snake feat. Justin Bieber",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "0lYBSQXN6rCTvUZvg9S0lU",
    "youtubeClips": [
      {
        "videoId": "euCqAq6BRa4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "DJSnakeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "dolly-style-rollercoaster",
    "displayName": "Rollercoaster — Dolly Style",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3JwXW8EXbX9mZy4B2CWDc9",
    "youtubeClips": [
      {
        "videoId": "XlFypQLuWic",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1380)."
      }
    ]
  },
  {
    "id": "drake-one-dance",
    "displayName": "One Dance — Drake",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "1zi7xx7UVEFkmKfv06H8x0",
    "youtubeClips": [
      {
        "videoId": "ki0Ocze98U8",
        "startSec": 0,
        "endSec": 175,
        "channelTitle": "Billion Stars",
        "license": "standard"
      }
    ]
  },
  {
    "id": "frans-if-i-were-sorry",
    "displayName": "If I Were Sorry — Frans",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "6oDkCmfVcSd9NXAKk1b4Ll",
    "youtubeClips": [
      {
        "videoId": "jLkHNqQS1fw",
        "startSec": 5,
        "endSec": 35,
        "channelTitle": "Frans - Topic",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26. startSec 5 satt av Peter. Bytt fran nANXQA9JEMY: den lag pa reupload-kanalen Bad Boy Edd trots att noten pastod officiell video. Detta ar Frans egen Topic-kanal (officiell studio-audio)."
      }
    ]
  },
  {
    "id": "galantis-no-money",
    "displayName": "No Money — Galantis",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6M6Tk58pQvABy6ru66dY3d",
    "youtubeClips": [
      {
        "videoId": "xUVz4nRmxn4",
        "startSec": 20,
        "endSec": 35,
        "license": "standard"
      }
    ]
  },
  {
    "id": "guetta-this-ones-for-you",
    "displayName": "This One's for You — David Guetta ft. Zara Larsson",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "46NBoIAHrmR7qcUGCIFEjR",
    "youtubeClips": [
      {
        "videoId": "MoHnffhBwqs",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "David Guetta",
        "license": "standard",
        "notes": "Officiell MV från David Guettas kanal. UEFA EURO 2016 Official Song. Ersätter Topic-versionen."
      }
    ]
  },
  {
    "id": "jamala-1944",
    "displayName": "1944 — Jamala",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6KCAlbeqrJ3pOn6Z3OdHWY",
    "youtubeClips": [
      {
        "videoId": "wNECV2h-y58",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Jamala",
        "license": "standard",
        "notes": "ESC 2016 vinnare — Ukraina. Officiell music video."
      }
    ]
  },
  {
    "id": "justin-timberlake-cant-stop-the-feeling",
    "displayName": "Can't Stop the Feeling! — Justin Timberlake",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5r14fWQezWLWqE1Pqg1Hd1",
    "youtubeClips": [
      {
        "videoId": "ru0K8uYEZWw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "justintimberlakeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 0 verifierad av Peter 2026-08-26: videons extratid (4:46 mot latens 3:56) ligger i SLUTET, inte som intro."
      }
    ]
  },
  {
    "id": "laleh-bara-fa-va-mig-sjalv",
    "displayName": "Bara Få Va Mig Själv — Laleh",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2FnUyLhe7sjXgnZlK9sc0z",
    "youtubeClips": [
      {
        "videoId": "tzln6GO4yHY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Laleh",
        "license": "standard",
        "notes": "Official music video. 85M+ streams."
      }
    ]
  },
  {
    "id": "major-lazer-cold-water",
    "displayName": "Cold Water — Major Lazer feat. Justin Bieber & MØ",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6DNtNfH8hXkqOX1sjqmI7p",
    "youtubeClips": [
      {
        "videoId": "nBtDsQ4fhXY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Major Lazer Official",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". Official Dance Video."
      }
    ]
  },
  {
    "id": "pinkfong-baby-shark",
    "displayName": "Baby Shark — Pinkfong",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "youtubeClips": [
      {
        "videoId": "XqZsoesa55w",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Baby Shark - Pinkfong Kids' Songs & Stories",
        "license": "standard",
        "notes": "Baby Shark Dance - Pinkfongs officiella klipp."
      }
    ]
  },
  {
    "id": "ragnbone-man-human",
    "displayName": "Human — Rag'n'Bone Man",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "58zsLZPvfflaiIbNWoA22O",
    "youtubeClips": [
      {
        "videoId": "L3wKzyIN1yk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "RagnBoneManVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 2016 = singel + Human-EP:n (juli 2016); albumet kom feb 2017."
      }
    ]
  },
  {
    "id": "robin-bengtsson-constellation-prize",
    "displayName": "Constellation Prize — Robin Bengtsson",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "U2HPDlVdSyk",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1392)."
      }
    ]
  },
  {
    "id": "robin-bengtsson-constellaztion-prize",
    "displayName": "Constellaztion Prize — Robin Bengtsson",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1iDf4IMFtfMQOYNtiRzoJu",
    "youtubeClips": [
      {
        "videoId": "U2HPDlVdSyk",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "sean-paul-no-lie",
    "displayName": "No Lie — Sean Paul feat. Dua Lipa",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2BY0p8sKIMmRuVjUTasf9G",
    "youtubeClips": [
      {
        "videoId": "GzU8KqOY8YA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "SeanPaulVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "veronica-maggio-vi-mot-varlden",
    "displayName": "Vi mot världen — Veronica Maggio",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6d5ynrHbFcS92R24BytGx7",
    "youtubeClips": [
      {
        "videoId": "pGUbe0bhOys",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1416)."
      }
    ]
  },
  {
    "id": "weeknd-starboy",
    "displayName": "Starboy — The Weeknd",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7MXVkk9YMctZqd1Srtv4MB",
    "youtubeClips": [
      {
        "videoId": "3_g2un5M350",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Weeknd - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "zara-larsson-aint-my-fault",
    "displayName": "Ain’t My Fault — Zara Larsson",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0ADG9OgdVTL7fgREP75BrZ",
    "youtubeClips": [
      {
        "videoId": "eC-F_VZ2T1c",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "ZaraLarssonMusicVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "zayn-pillowtalk",
    "displayName": "Pillowtalk — ZAYN",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0RrMsZA9v8SuZk4npjTORp",
    "youtubeClips": [
      {
        "videoId": "C_3d6GntKbk",
        "startSec": 14,
        "endSec": 30,
        "channelTitle": "ZaynVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "zootopia-2016",
    "displayName": "Zootopia",
    "correctYear": 2016,
    "contentSubject": "movie",
    "questionText": "What is the name of the main character in this film?",
    "itemHcp": 86,
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
    "isAnimated": true,
    "correctNames": [
      "Judy Hopps"
    ],
    "distractorNames": [
      "Simba",
      "Nemo",
      "Shrek",
      "Mulan"
    ],
    "youtubeClips": [
      {
        "videoId": "CzvH6_e2a-U",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Zero Media",
        "license": "standard",
        "notes": "Scen: Judy Hopps anländer till Zootopia — Try Everything (Shakira) i bakgrunden. HD trailer."
      }
    ]
  },
  {
    "id": "borg-vs-mcenroe-2017",
    "displayName": "Borg vs McEnroe",
    "correctYear": 2017,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "itemHcp": 78,
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
    "genrePackages": [
      "sport"
    ],
    "isAnimated": false,
    "correctNames": [
      "Sverrir Gudnason",
      "Shia LaBeouf"
    ],
    "distractorNames": [
      "Tom Hanks",
      "Benedict Cumberbatch",
      "Michael Fassbender",
      "Joel Edgerton"
    ],
    "youtubeClips": [
      {
        "videoId": "yQgWMs0TBKU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "SF Studios",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (13)."
      }
    ]
  },
  {
    "id": "clean-bandit-symphony",
    "displayName": "Symphony — Clean Bandit feat. Zara Larsson",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "72gv4zhNvRVdQA0eOenCal",
    "youtubeClips": [
      {
        "videoId": "aatr_2MstrI",
        "startSec": 32,
        "endSec": 62,
        "channelTitle": "Clean Bandit",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "de-vet-du-road-trip",
    "displayName": "Road Trip — De Vet Du",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "53HCk0K40gzfdHnz0yMNE0",
    "youtubeClips": [
      {
        "videoId": "gO8hkdxG11s",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1382)."
      }
    ]
  },
  {
    "id": "dua-lipa-idgaf",
    "displayName": "IDGAF — Dua Lipa",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "76cy1WJvNGJTj78UqeA5zr",
    "youtubeClips": [
      {
        "videoId": "Mgfe5tIwOj0",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear = albumet Dua Lipa (juni 2017), inte singeln jan 2018."
      }
    ]
  },
  {
    "id": "dua-lipa-new-rules",
    "displayName": "New Rules — Dua Lipa",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2ekn2ttSfGqwhhate0LSR0",
    "youtubeClips": [
      {
        "videoId": "k2qgadSvNyU",
        "startSec": 8,
        "endSec": 30,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear = albumet Dua Lipa (juni 2017), inte singeln juli 2017. startSec 0→8 (2026-08-31, Peter — senarelagd start på inofficiella videon)."
      }
    ]
  },
  {
    "id": "ed-sheeran-perfect",
    "displayName": "Perfect — Ed Sheeran",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Christmas edition"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0tgVpDi06FyKpA1z0VMD4v",
    "youtubeClips": [
      {
        "videoId": "2Vv-BfVoq4g",
        "startSec": 5,
        "endSec": 60,
        "channelTitle": "Ed Sheeran",
        "license": "standard",
        "notes": "Officiell musikvideo (Ed Sheeran-kanalen)."
      }
    ]
  },
  {
    "id": "foo-gotta-thing-about-you",
    "displayName": "Gotta Thing About You — FO&O",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "126xXTTkEemrCAPt8Imzur",
    "youtubeClips": [
      {
        "videoId": "5vZdiFnGHHA",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1383)."
      }
    ]
  },
  {
    "id": "imagine-dragons-believer",
    "displayName": "Believer — Imagine Dragons",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "0pqnGHJpmpxLKifKRmU6WP",
    "youtubeClips": [
      {
        "videoId": "7wtfhZwyrcc",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "khaliffa-helt-seriost",
    "displayName": "Helt seriöst — Khaliffa",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "7shcnBgfWJ6AT7jmvAw4xO",
    "youtubeClips": []
  },
  {
    "id": "kygo-for-life",
    "displayName": "For Life — Kygo, Zak Abel & Nile Rodgers",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "6YutTqJz3jGfLMfzIHpSTf",
    "youtubeClips": [
      {
        "videoId": "L_BU-xUPnXU",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "bemu",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "luis-fonsi-despacito",
    "displayName": "Despacito — Luis Fonsi & Daddy Yankee",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6habFhsOp2NvshLv26DqMb",
    "youtubeClips": [
      {
        "videoId": "TfkP5ubz1z4",
        "startSec": 0,
        "endSec": 231,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "molly-sanden-utan-dig",
    "displayName": "Utan dig — Molly Sandén",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish",
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3fiKmyDr615KZDrL51VZDu",
    "youtubeClips": [
      {
        "videoId": "FyO_4OOY8cA",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1425)."
      }
    ]
  },
  {
    "id": "post-malone-rockstar",
    "displayName": "Rockstar — Post Malone",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Rock"
    ],
    "spotifyTrackId": "19bX4zmC2zDben2ldhoRB3",
    "youtubeClips": [
      {
        "videoId": "4GFAZBKZVJY",
        "startSec": 0,
        "endSec": 218,
        "channelTitle": "Republic Records",
        "license": "standard"
      }
    ]
  },
  {
    "id": "robin-bengtsson-i-cant-go-on",
    "displayName": "I Can't Go On — Robin Bengtsson",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "57Y51hxqMn2j3dosW75R6n",
    "youtubeClips": [
      {
        "videoId": "1jSrBdN4b5c",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2017 vinnare. ESC 2017 official music video."
      }
    ]
  },
  {
    "id": "shape-of-you",
    "displayName": "Shape of You — Ed Sheeran",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7qiZfU4dY1lWllzX7mPBI3",
    "youtubeClips": [
      {
        "videoId": "JGwWNGJdvx8",
        "startSec": 25,
        "endSec": 40,
        "channelTitle": "Ed Sheeran",
        "license": "standard",
        "notes": "Dropp vid refräng"
      }
    ]
  },
  {
    "id": "shawn-mendes-theres-nothing-holdin-me-back",
    "displayName": "There's Nothing Holdin' Me Back — Shawn Mendes",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7JJmb5XwzOO8jgpou264Ml",
    "youtubeClips": [
      {
        "videoId": "dT2owtxkU8k",
        "startSec": 27,
        "endSec": 57,
        "channelTitle": "ShawnMendesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 27 angiven av Peter - hoppar over videons intro."
      }
    ]
  },
  {
    "id": "zayn-dusk-till-dawn",
    "displayName": "Dusk Till Dawn — ZAYN feat. Sia",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2gVOhnMkK8XngKgf0YdlXQ",
    "youtubeClips": [
      {
        "videoId": "tt2k8PGm-TI",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "ZaynVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 20 satt av Peter 2026-08-26 (ersatte min gissning 100 - videons extratid mot latens 3:59 ligger inte som lang intro)."
      }
    ]
  },
  {
    "id": "backstreet-boys-chances",
    "displayName": "Chances — Backstreet Boys",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "5J783SDlyitqvLFAzTm0jU",
    "youtubeClips": [
      {
        "videoId": "W5kM5wAwRug",
        "startSec": 18,
        "endSec": 48,
        "channelTitle": "BackstreetBoysVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 2018 = singeln (9 nov 2018); albumet DNA kom jan 2019."
      }
    ]
  },
  {
    "id": "benjamin-ingrosso-dance-you-off",
    "displayName": "Dance You Off — Benjamin Ingrosso",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "0s3P5PImfDZYWIseR3b39D",
    "youtubeClips": [
      {
        "videoId": "U2UmYBkszOA",
        "startSec": 5,
        "endSec": 20,
        "license": "standard"
      }
    ]
  },
  {
    "id": "clean-bandit-solo",
    "displayName": "Solo — Clean Bandit feat. Demi Lovato",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3NuK5xMlSlB6K2Qp16zf3h",
    "youtubeClips": [
      {
        "videoId": "8JnfIa84TnU",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Clean Bandit",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "drake-gods-plan",
    "displayName": "God's Plan — Drake",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "6DCZcSspjsKoFjzjrWoCdn",
    "youtubeClips": [
      {
        "videoId": "xpVfcZ0ZcFM",
        "startSec": 48,
        "endSec": 78,
        "channelTitle": "DrakeVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Officiella musikvideon. startSec 48 angiven av Peter."
      },
      {
        "videoId": "bChS476h-T8",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "BEST ARTIST ALIVE OVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Lyric video. startSec 3 angiven av Peter."
      }
    ]
  },
  {
    "id": "fuego-eleni-foureira",
    "displayName": "Fuego — Eleni Foureira",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "22ppznuzVF9LKamaaqMMqu",
    "youtubeClips": []
  },
  {
    "id": "lady-gaga-bradley-cooper-shallow",
    "displayName": "Shallow — Lady Gaga & Bradley Cooper",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2VxeLyX666F8uXCJ0dZF8B",
    "youtubeClips": [
      {
        "videoId": "7hiVIixor_Q",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "A Star Is Born 2018",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur Peters YT- och Spotify-lista."
      },
      {
        "videoId": "aU_bj9SxvdU",
        "startSec": 4,
        "endSec": 34,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Lyric video over officiell inspelning, tillagd 2026-08-27."
      }
    ]
  },
  {
    "id": "lewis-capaldi-someone-you-loved",
    "displayName": "Someone You Loved — Lewis Capaldi",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7qEHsqek33rTcFNT9PFqLf",
    "youtubeClips": [
      {
        "videoId": "zABLecsR5UE",
        "startSec": 2,
        "endSec": 32,
        "channelTitle": "LewisCapaldiVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-stillbilden pRIZohFFOMo. Officiella musikvideon. startSec 2 angiven av Peter."
      },
      {
        "videoId": "JotQ4LtmkuU",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "7clouds",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-27. Ersatte Topic-stillbilden pRIZohFFOMo. Lyrics-version. startSec 3 angiven av Peter."
      }
    ]
  },
  {
    "id": "lil-nas-x-old-town-road",
    "displayName": "Old Town Road — Lil Nas X",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "spotifyTrackId": "0F7FA14euOIX8KcbEturGH",
    "youtubeClips": [
      {
        "videoId": "7UGOIMoJtB4",
        "startSec": 0,
        "endSec": 155,
        "channelTitle": "Golden Network",
        "license": "standard"
      }
    ]
  },
  {
    "id": "miss-li-varan-sang",
    "displayName": "Våran sång — Miss Li",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1p0RjMued7Tmm0o7CjzoHY",
    "youtubeClips": [
      {
        "videoId": "vBoOpjGx-Qc",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "netta-toy",
    "displayName": "Toy — Netta",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6n2eIfLj0wOOUkUfNmYzlh",
    "youtubeClips": [
      {
        "videoId": "CziHrYYSyPc",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2018 vinnare — Israel. Officiell music video."
      }
    ]
  },
  {
    "id": "anna-bergendahl-ashes-to-ashes",
    "displayName": "Ashes to Ashes — Anna Bergendahl",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1iqxk51n6yyc6OIXu7dX8o",
    "youtubeClips": [
      {
        "videoId": "uXg7HDjedlY",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1390)."
      }
    ]
  },
  {
    "id": "arvingarna-i-do",
    "displayName": "I Do — Arvingarna",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "100% in swedish",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "0pGX4KgirIW7JAHh93rzPU",
    "youtubeClips": [
      {
        "videoId": "XcXNVsNgdwg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Arvingarna",
        "license": "standard",
        "notes": "Officiell video från Arvingarna-kanalen 2019."
      }
    ]
  },
  {
    "id": "billie-eilish-bad-guy",
    "displayName": "Bad Guy — Billie Eilish",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "youtubeClips": [
      {
        "videoId": "4-TbQnONe_w",
        "startSec": 0,
        "endSec": 195,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "dj-otzi-sweet-caroline",
    "displayName": "Sweet Caroline — DJ Ötzi",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3HTgmcqR7nYtD7EmJ4hOLi",
    "youtubeClips": [
      {
        "videoId": "LVrlbGIIgbw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "DJ Ötzi",
        "license": "standard"
      }
    ]
  },
  {
    "id": "dua-lipa-dont-start-now",
    "displayName": "Don't Start Now — Dua Lipa",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3PfIrDoz19wz7qK7tYeu62",
    "youtubeClips": [
      {
        "videoId": "oygrmJFKYZY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "duncan-laurence-arcade",
    "displayName": "Arcade — Duncan Laurence",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1Xi84slp6FryDSCbzq4UCD",
    "youtubeClips": [
      {
        "videoId": "Eztx7Wr8PtE",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2019 vinnare — Nederländerna. Officiell music video."
      }
    ]
  },
  {
    "id": "harry-styles-watermelon-sugar",
    "displayName": "Watermelon Sugar — Harry Styles",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6UelLqGlWMcVH1E5c4H7lY",
    "youtubeClips": [
      {
        "videoId": "dZwffaluIgg",
        "startSec": 0,
        "endSec": 178,
        "channelTitle": "Dan Music",
        "license": "standard"
      }
    ]
  },
  {
    "id": "john-lundvik-too-late-for-love",
    "displayName": "Too Late for Love — John Lundvik",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6kIdjk3D8XxA2UafE0THGK",
    "youtubeClips": [
      {
        "videoId": "iEEuG5XML-A",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2019 vinnare. ESC 2019 official video."
      }
    ]
  },
  {
    "id": "jon-henrik-fjallgren-norrsken",
    "displayName": "Norrsken — Jon Henrik Fjällgren",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 60,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7v10xmPWDwFiQDJuAZClBs",
    "youtubeClips": [
      {
        "videoId": "XLHuwcfO4fU",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1379)."
      }
    ]
  },
  {
    "id": "mabel-dont-call-me-up",
    "displayName": "Don’t Call Me Up — Mabel",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "3BxKECJorB19BEQSPC9n7D",
    "youtubeClips": [
      {
        "videoId": "9TQKyDD9Yig",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "MabelVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "miss-li-lev-nu-dor-sen",
    "displayName": "Lev nu dö sen — Miss Li",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "6HJasLoTKvxglAMQH8nPcD",
    "youtubeClips": []
  },
  {
    "id": "nyper-mig-i-armen",
    "displayName": "Nyper mig i armen — Albin Lee Meldau & Per Gessle",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2ZyaNqLNxfJcCacEb9jVoT",
    "youtubeClips": [
      {
        "videoId": "vKRY_npZdNg",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "WM Sweden",
        "license": "standard",
        "notes": "Officiell WM Sweden. Per Gessle & Albin Lee Meldau."
      }
    ]
  },
  {
    "id": "shawn-mendes-camila-cabello-senorita",
    "displayName": "Señorita — Shawn Mendes & Camila Cabello",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love",
      "Disco & Pop"
    ],
    "spotifyTrackId": "0TK2YIli7K1leLovkQiNik",
    "youtubeClips": [
      {
        "videoId": "Pkh8UtuejGw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ShawnMendesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "shawn-mendes-if-i-cant-have-you",
    "displayName": "If I Can’t Have You — Shawn Mendes",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6LsAAHotRLMOHfCsSfYCsz",
    "youtubeClips": [
      {
        "videoId": "oTJ-oqwxdZY",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "ShawnMendesVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). correctYear 2019 verifierat mot Wikipedia (MusicBrainz gav 2006 = annan artist)."
      }
    ]
  },
  {
    "id": "spirit-in-the-sky-keiino",
    "displayName": "Spirit in the Sky — KEiiNO",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7B7O5jgFpWfc9orZw6FN4K",
    "youtubeClips": [
      {
        "videoId": "Ovt7YGHAj8I",
        "startSec": 40,
        "endSec": 55,
        "channelTitle": "KEiiNO",
        "license": "standard",
        "notes": "Official music video. ESC 2019 Norway entry."
      }
    ]
  },
  {
    "id": "tones-and-i-dance-monkey",
    "displayName": "Dance Monkey — Tones and I",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2XU0oxnq2qxCpomAAuJY8K",
    "youtubeClips": [
      {
        "videoId": "q0hyYWKXF0Q",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tones And I",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "weeknd-blinding-lights",
    "displayName": "Blinding Lights — The Weeknd",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 95,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0VjIjW4GlUZAMYd2vXMi3b",
    "youtubeClips": [
      {
        "videoId": "4NRXx6U8ABQ",
        "startSec": 48,
        "endSec": 63,
        "channelTitle": "TheWeekndVEVO",
        "license": "standard",
        "notes": "Officiell VEVO-musikvideo. Neon retro 80s-känsla."
      }
    ]
  },
  {
    "id": "ava-max-kings-and-queens",
    "displayName": "Kings & Queens — Ava Max",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7a53HqqArd4b9NF4XAmlbI",
    "youtubeClips": [
      {
        "videoId": "jH1RNk8954Q",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Ava Max",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "bts-dynamite",
    "displayName": "Dynamite — BTS",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1hIuSG6xV4RDgD8bDVKP7N",
    "youtubeClips": [
      {
        "videoId": "kK29Q_LpVUw",
        "startSec": 0,
        "endSec": 206,
        "channelTitle": "7clouds K-pop",
        "license": "standard"
      }
    ]
  },
  {
    "id": "dotter-bulletproof",
    "displayName": "Bulletproof — Dotter",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "4RcEx6TvICENelSh3O7gvu",
    "youtubeClips": [
      {
        "videoId": "faIF5Ej_VHI",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "drangarna-piga-och-drang",
    "displayName": "Piga & dräng — Drängarna",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "youtubeClips": [
      {
        "videoId": "FVjoNGIc1K8",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1386)."
      }
    ]
  },
  {
    "id": "dua-lipa-break-my-heart",
    "displayName": "Break My Heart — Dua Lipa",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5YDD6DuZ04mKQtm0avJTJd",
    "youtubeClips": [
      {
        "videoId": "Nj2U6rhnucI",
        "startSec": 10,
        "endSec": 40,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "dua-lipa-levitating",
    "displayName": "Levitating — Dua Lipa",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "39LLxExYz6ewLAcYrzQQyP",
    "youtubeClips": [
      {
        "videoId": "TUVcZfQe-Kw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "dua-lipa-love-again",
    "displayName": "Love Again — Dua Lipa",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "4rPkN1FMzQyFNP9cLUGIIB",
    "youtubeClips": [
      {
        "videoId": "BC19kwABFwc",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "glass-animals-heat-waves",
    "displayName": "Heat Waves — Glass Animals",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "3USxtqRwSYz57Ewm6wWRMp",
    "youtubeClips": [
      {
        "videoId": "mRD0-GxqHVo",
        "startSec": 29,
        "endSec": 44,
        "license": "standard"
      },
      {
        "videoId": "rfTgO9rpqck",
        "startSec": 41,
        "endSec": 56,
        "license": "standard"
      }
    ]
  },
  {
    "id": "jason-derulo-take-you-dancing",
    "displayName": "Take You Dancing — Jason Derulo",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "RnB"
    ],
    "spotifyTrackId": "3at4D3FZnJnYR0Mfcn6JSN",
    "youtubeClips": [
      {
        "videoId": "vC8qJfVYxZY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Jason Derulo",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "the-mamas-move",
    "displayName": "Move — The Mamas",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "19LiotxKSVs7FeVMEdHz63",
    "youtubeClips": [
      {
        "videoId": "7EpSBDPlZn4",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2020 vinnare. ESC 2020 official video."
      }
    ]
  },
  {
    "id": "anis-don-demina-flaggan-i-topp",
    "displayName": "Flaggan i topp — Anis Don Demina",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "7w2sCUWVAop5sTmikAdhCD",
    "youtubeClips": [
      {
        "videoId": "ajZxDhowQ8g",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Anis Don Demina",
        "license": "standard"
      }
    ]
  },
  {
    "id": "bono-we-are-the-people",
    "displayName": "We Are the People — Martin Garrix ft. Bono & The Edge",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2iL0W5qi0ivZ9WRXbZ74cS",
    "youtubeClips": [
      {
        "videoId": "kGT73GcwhCU",
        "startSec": 15,
        "endSec": 30,
        "license": "standard"
      }
    ]
  },
  {
    "id": "el-diablo-elena-tsagkrinou",
    "displayName": "El Diablo — Elena Tsagkrinou",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4TAttqXwjj56xZQVKvlX0K",
    "youtubeClips": [
      {
        "videoId": "ZHeydRCBPNs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Elena Tsagkrinou",
        "license": "standard",
        "notes": "Official music video. ESC 2021 Cyprus entry."
      }
    ]
  },
  {
    "id": "hov1-bla",
    "displayName": "Blå — Hov1",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "0hel3UahHwK9SfUF85M1WK",
    "youtubeClips": []
  },
  {
    "id": "kid-laroi-justin-bieber-stay",
    "displayName": "Stay — The Kid LAROI & Justin Bieber",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "5HCyWlXZPP0y6Gqq8TgA20",
    "youtubeClips": [
      {
        "videoId": "yWHrYNP6j4k",
        "startSec": 0,
        "endSec": 140,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "maneskin-zitti-e-buoni",
    "displayName": "Zitti e buoni — Måneskin",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "776AftMmFFAWUIEAb3lHhw",
    "youtubeClips": [
      {
        "videoId": "RVH5dn1cxAQ",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2021 vinnare — Italien."
      }
    ]
  },
  {
    "id": "olivia-rodrigo-drivers-license",
    "displayName": "Drivers License — Olivia Rodrigo",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "7lPN2DXiMsVn7XUKtOW1CS",
    "youtubeClips": [
      {
        "videoId": "ttRz03c208g",
        "startSec": 0,
        "endSec": 248,
        "channelTitle": "Rap Samurai",
        "license": "standard"
      }
    ]
  },
  {
    "id": "olivia-rodrigo-good-4-u",
    "displayName": "Good 4 U — Olivia Rodrigo",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "6P4d1NWBCNIYZjzF9k1mVN",
    "youtubeClips": [
      {
        "videoId": "Bc9ijogGmtU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Olivia Rodrigo - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "swedish-house-mafia-moth-to-flame",
    "displayName": "Moth to Flame — Swedish House Mafia",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "spotifyTrackId": "2gpWyfu7eZ01zzncHpxOtA",
    "youtubeClips": []
  },
  {
    "id": "the-weeknd-take-my-breath",
    "displayName": "Take My Breath — The Weeknd",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1Xg9k7OAyJryBXVx3KUklz",
    "youtubeClips": [
      {
        "videoId": "rhTl_OyehF8",
        "startSec": 29,
        "endSec": 59,
        "channelTitle": "TheWeekndVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "tusse-voices",
    "displayName": "Voices — Tusse",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5zxZ7M4RgWZUHlMEwac8vt",
    "youtubeClips": [
      {
        "videoId": "5P1ueI9j6gk",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2021 vinnare. ESC 2021 official video."
      }
    ]
  },
  {
    "id": "alesso-words",
    "displayName": "Words — Alesso feat. Zara Larsson",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1bgKMxPQU7JIZEhNsM1vFs",
    "youtubeClips": [
      {
        "videoId": "zIJEOEZdLzE",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Alesso",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". correctYear 2022 verifierad mot MusicBrainz (tidigaste release 2022-04-22)."
      }
    ]
  },
  {
    "id": "cornelia-jakobs-hold-me-closer",
    "displayName": "Hold Me Closer — Cornelia Jakobs",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "697bFWgzBRm6bmnYWd8GyD",
    "youtubeClips": [
      {
        "videoId": "wWDThAfryW4",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2022 vinnare. ESC 2022 official music video."
      }
    ]
  },
  {
    "id": "david-guetta-im-good-blue",
    "displayName": "I’m Good (Blue) — David Guetta & Bebe Rexha",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music"
    ],
    "spotifyTrackId": "4uUG5RXrOk84mYEfFvj3cK",
    "youtubeClips": [
      {
        "videoId": "kXhBKjDKF84",
        "startSec": 14,
        "endSec": 44,
        "channelTitle": "David Guetta",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx). MEDVETET UNDANTAG fran studio-only-policyn: detta ar Live Performance-versionen. Peter valde den 2026-08-26 for kvalitet + stamningshojare. BYT INTE till musikvideon 90RLzVUuXe4."
      }
    ]
  },
  {
    "id": "harry-styles-as-it-was",
    "displayName": "As It Was — Harry Styles",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4Dvkj6JhhA12EX05fT7y2e",
    "youtubeClips": [
      {
        "videoId": "EsY5kRIBM8Y",
        "startSec": 0,
        "endSec": 165,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "kalush-orchestra-stefania",
    "displayName": "Stefania — Kalush Orchestra",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2vHzOWRKYPLu8umRPIFuOq",
    "youtubeClips": [
      {
        "videoId": "UiEGVYOruLk",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2022 vinnare — Ukraina. Officiell music video."
      }
    ]
  },
  {
    "id": "lucianoz-det-ar-ju-dej",
    "displayName": "Det är ju dej jag går och väntar på — Lucianoz",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 70,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "2sbjPQE3sS9H6i8BOmtZbr",
    "youtubeClips": [
      {
        "videoId": "hGaWJ5IMf0k",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Sony Music Sweden",
        "license": "standard",
        "notes": "Officiell Sony Music Sweden 2022."
      }
    ]
  },
  {
    "id": "onerepublic-i-aint-worried",
    "displayName": "I Ain’t Worried — OneRepublic",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Film edition"
    ],
    "spotifyTrackId": "4h9wh7iOZ0GGn8QVp4RAOB",
    "youtubeClips": [
      {
        "videoId": "mNEUkkoUoIA",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "OneRepublicVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "taylor-swift-anti-hero",
    "displayName": "Anti-Hero — Taylor Swift",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0V3wPSX9ygBnCm8psDIegu",
    "youtubeClips": [
      {
        "videoId": "pXpbKU24cMo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Taylor Swift - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "theoz-som-du-vill",
    "displayName": "Som du vill — Theoz",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "78ayFK0aLwG6e0jxvQW3r6",
    "youtubeClips": [
      {
        "videoId": "WAk--GrYtwg",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1396)."
      }
    ]
  },
  {
    "id": "bolaget-ikvall-igen",
    "displayName": "Ikväll igen — Bolaget",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "100% in swedish"
    ],
    "spotifyTrackId": "4o5Ob60pz8QHcFKcr4MWyf",
    "youtubeClips": [
      {
        "videoId": "ASzgTmKlTRA",
        "startSec": 15,
        "endSec": 45,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-11 ur Music.xlsx (rad 1405)."
      }
    ]
  },
  {
    "id": "doja-cat-paint-the-town-red",
    "displayName": "Paint the Town Red — Doja Cat",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 85,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2IGMVunIBsBLtEQyoI1Mu7",
    "youtubeClips": [
      {
        "videoId": "EiAMmYbr3vA",
        "startSec": 0,
        "endSec": 232,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "dua-lipa-houdini",
    "displayName": "Houdini — Dua Lipa",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4OMJGnvZfDvsePyCwRGO7X",
    "youtubeClips": [
      {
        "videoId": "suAR1PYFNYA",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "loreen-tattoo",
    "displayName": "Tattoo — Loreen",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1DmW5Ep6ywYwxc2HMT5BG6",
    "youtubeClips": [
      {
        "videoId": "b3vJfR81xO0",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2023 vinnare, ESC-vinnare 2023. ESC 2023 official music video."
      }
    ]
  },
  {
    "id": "lov1-kan-inte-sitta-still",
    "displayName": "Kan inte sitta still — Lov1",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "64z4huyo5fZHG7gD2g7GJA",
    "youtubeClips": []
  },
  {
    "id": "miley-cyrus-flowers",
    "displayName": "Flowers — Miley Cyrus",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 92,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7DSAEUvxU8FajXtRloy8M0",
    "youtubeClips": [
      {
        "videoId": "iawgB2CDCrw",
        "startSec": 7,
        "endSec": 198,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "benjamin-ingrosso-kite",
    "displayName": "Kite — Benjamin Ingrosso",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "0irVirJrUjHFk3ywECVsGT",
    "youtubeClips": [
      {
        "videoId": "Fq1zL29jg9U",
        "startSec": 16,
        "endSec": 46,
        "channelTitle": "BenjaminIngrossoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "benjamin-ingrosso-look-whos-laughing-now",
    "displayName": "Look Who’s Laughing Now — Benjamin Ingrosso",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "2qEQy3x9MQH7eTJU6LmEJx",
    "youtubeClips": [
      {
        "videoId": "I35BbuZgDb0",
        "startSec": 16,
        "endSec": 46,
        "channelTitle": "BenjaminIngrossoVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "billie-eilish-birds-of-a-feather",
    "displayName": "Birds of a Feather — Billie Eilish",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6dOtVTDdiauQNBQEDOtlAB",
    "youtubeClips": [
      {
        "videoId": "cz_lZAPlEAE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Vibe Music",
        "license": "standard",
        "notes": "Lyric video over officiell inspelning, Peter-kurerad 2026-08-27. Ersatte tidigare klipp WKZO-CWeOVA (blockerat i SE/EU)."
      }
    ]
  },
  {
    "id": "danny-saucedo-happy-that-you-found-me",
    "displayName": "Happy That You Found Me — Danny Saucedo",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2kwqblYAbloVXhyBVcxEw5",
    "youtubeClips": [
      {
        "videoId": "e0NdpEYpcJY",
        "startSec": 14,
        "endSec": 44,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1422)."
      }
    ]
  },
  {
    "id": "dua-lipa-illusion",
    "displayName": "Illusion — Dua Lipa",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "59xD5osEFsaNt5PXfIKUnX",
    "youtubeClips": [
      {
        "videoId": "a9cyG_yfh1k",
        "startSec": 3,
        "endSec": 33,
        "channelTitle": "Dua Lipa",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "europapa-joost-klein",
    "displayName": "Europapa — Joost Klein",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "0uHrMbMv3c78398pIANDqR",
    "youtubeClips": []
  },
  {
    "id": "froken-snusk-unga-och-fria",
    "displayName": "Unga & fria — Fröken Snusk",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen",
      "100% in swedish"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2ArX0SzCSHXytmAg36BIev",
    "youtubeClips": [
      {
        "videoId": "0P6FA6qUqr8",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1399)."
      }
    ]
  },
  {
    "id": "kendrick-lamar-not-like-us",
    "displayName": "Not Like Us — Kendrick Lamar",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Hip Hop"
    ],
    "inBaseCatalog": false,
    "parentControlled": true,
    "spotifyTrackId": "6ZWalyzfVcNCc1XwKnnyyn",
    "youtubeClips": [
      {
        "videoId": "H58vbez_m4E",
        "startSec": 43,
        "endSec": 73,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-13 (ersatte nSERqaFagJc)."
      }
    ]
  },
  {
    "id": "lady-gaga-bruno-mars-die-with-a-smile",
    "displayName": "Die With a Smile — Lady Gaga & Bruno Mars",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "7nEHTOQJqKCx7Dvgng3l8t",
    "youtubeClips": [
      {
        "videoId": "sQtWPcAyL6g",
        "startSec": 0,
        "endSec": 248,
        "channelTitle": "7cloudsnation",
        "license": "standard"
      }
    ]
  },
  {
    "id": "marcus-martinus-unforgettable",
    "displayName": "Unforgettable — Marcus & Martinus",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 86,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "5L8C1PZGCpZf8STcN79H5j",
    "youtubeClips": [
      {
        "videoId": "yekc8t0rJqA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2024 vinnare. ESC 2024 official music video."
      }
    ]
  },
  {
    "id": "nemo-the-code",
    "displayName": "The Code — Nemo",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 82,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "1EjIXKhNHI00ZLMRpS8iz8",
    "youtubeClips": [
      {
        "videoId": "kiGDvM14Kwg",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2024 vinnare — Schweiz. Officiell music video."
      }
    ]
  },
  {
    "id": "rose-bruno-mars-apt",
    "displayName": "APT. — ROSÉ & Bruno Mars",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 88,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "4wJ5Qq0jBN4ajy7ouZIV1c",
    "youtubeClips": [
      {
        "videoId": "ekr2nIex040",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "ROSÉ",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (-82)."
      }
    ]
  },
  {
    "id": "sabrina-carpenter-espresso",
    "displayName": "Espresso — Sabrina Carpenter",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 90,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "2qSkIjg1o9h3YT9RAgYN75",
    "youtubeClips": [
      {
        "videoId": "YnguM4ED3bw",
        "startSec": 0,
        "endSec": 171,
        "channelTitle": "7cloudsnation",
        "license": "standard"
      }
    ]
  },
  {
    "id": "alex-warren-eternity",
    "displayName": "Eternity — Alex Warren",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6wHpLMmp98aHcV8L1JFrj8",
    "youtubeClips": [
      {
        "videoId": "jXqf3uqLkkU",
        "startSec": 15,
        "endSec": 45,
        "channelTitle": "Alex Warren",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "alex-warren-ordinary",
    "displayName": "Ordinary — Alex Warren",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Soft & Love"
    ],
    "spotifyTrackId": "6qqrTXSdwiJaq8SO0X2lSe",
    "youtubeClips": [
      {
        "videoId": "u2ah9tWTkmk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Alex Warren",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "dolly-style-yihaa",
    "displayName": "Yihaa — Dolly Style",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 56,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "2CMLgiwaTlemYqc7llxO6i",
    "youtubeClips": [
      {
        "videoId": "mgIc0iHQTHA",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-09 ur Music.xlsx (rad 1400)."
      }
    ]
  },
  {
    "id": "jj-wasted-love",
    "displayName": "Wasted Love — JJ",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "321yySUTzRXUbzkRTeTzDB",
    "youtubeClips": [
      {
        "videoId": "-ieSTNpxvio",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2025 vinnare — Österrike. Officiell music video."
      }
    ]
  },
  {
    "id": "kaj-bara-bada-bastu",
    "displayName": "Bara bada bastu — KAJ",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 84,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "youtubeClips": [
      {
        "videoId": "WK3HOMhAeQY",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2025 vinnare. ESC 2025 official music video."
      }
    ]
  },
  {
    "id": "klara-hammarstrom-on-and-on-and-on",
    "displayName": "On and On and On — Klara Hammarström",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 58,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4jolrif0mBrRSqxWRsEWoP",
    "youtubeClips": [
      {
        "videoId": "9dySigA-CqM",
        "startSec": 20,
        "endSec": 50,
        "channelTitle": "Klara Hammarström - Topic",
        "license": "standard",
        "notes": "Ersatte dött klipp (deleted/private) 2026-09-12 — official Topic audio."
      }
    ]
  },
  {
    "id": "sombr-12-to-12",
    "displayName": "12 to 12 — sombr",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "6MrLkXsMmHaYt680fhJUAq",
    "youtubeClips": [
      {
        "videoId": "cZgUiR31m-Y",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "sombr",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "taylor-swift-the-fate-of-ophelia",
    "displayName": "The Fate of Ophelia — Taylor Swift",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "53iuhJlwXhSER5J2IYYv1W",
    "youtubeClips": [
      {
        "videoId": "ko70cExuzZM",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "Taylor Swift",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  },
  {
    "id": "tjuvjakt-bara-vi-bara-jag-bara-du",
    "displayName": "Bara vi, bara jag, bara du — Tjuvjakt",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "1fncAFDynLDnSIPg7h2mp3",
    "youtubeClips": []
  },
  {
    "id": "tjuvjakt-tusen-spann",
    "displayName": "Tusen spänn — Tjuvjakt",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "spotifyTrackId": "01RdEXps15f3VmQMV6OuTM",
    "youtubeClips": []
  },
  {
    "id": "zara-larsson-midnight-sun",
    "displayName": "Midnight Sun — Zara Larsson",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "1qRV1dKLOfH1s00b9J2LUQ",
    "youtubeClips": [
      {
        "videoId": "uvY8fdgezLQ",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "ZaraLarssonMusicVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\"."
      }
    ]
  },
  {
    "id": "bolaget-det-ligger-nat-i-luften",
    "displayName": "Det ligger nåt i luften — Bolaget",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "4okV0gcEkY1BlqQNDvaQCw",
    "youtubeClips": [
      {
        "videoId": "81EOq-abbOw",
        "startSec": 8,
        "endSec": 30,
        "channelTitle": "Bolaget",
        "license": "standard"
      }
    ]
  },
  {
    "id": "brandsta-all-in-for-sverige",
    "displayName": "All in för Sverige — Brandsta",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "3AGFGLUAhu0Cwv1Mkea3d4",
    "youtubeClips": [
      {
        "videoId": "c37GL5IZG-o",
        "startSec": 0,
        "endSec": 15,
        "license": "standard"
      }
    ]
  },
  {
    "id": "dara-bangaranga",
    "displayName": "Bangaranga — DARA",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 78,
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
    "genrePackages": [
      "Eurovision"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "6SvlfrQYzUsW5UQUpUpy26",
    "youtubeClips": [
      {
        "videoId": "J3oGYo_mekw",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2026 vinnare — Bulgarien. Officiell music video."
      }
    ]
  },
  {
    "id": "edivibz-gul-och-bla",
    "displayName": "Gul och blå — Edivibz",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 76,
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
    "genrePackages": [
      "sport",
      "football"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "5AGNs0W1DKuYWzGa9ilP1K",
    "youtubeClips": [
      {
        "videoId": "qbSOPAk3KCw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Edivibz",
        "license": "standard"
      }
    ]
  },
  {
    "id": "felicia-my-system",
    "displayName": "My System — Felicia",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
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
    "genrePackages": [
      "Eurovision",
      "Melodifestivalen"
    ],
    "spotifyTrackId": "3AfX2EhXub2DqgqJABSIXL",
    "youtubeClips": [
      {
        "videoId": "ibbfS8iG450",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2026 vinnare. ESC 2026 official music video."
      }
    ]
  },
  {
    "id": "hugel-movin-to-the-sun",
    "displayName": "Movin' to the Sun — HUGEL",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 72,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Dance Music",
      "Party & Dunk"
    ],
    "youtubeClips": [
      {
        "videoId": "bJ7yyX4Qic4",
        "startSec": 0,
        "endSec": 30,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      },
      {
        "videoId": "jQWTeXopjeA",
        "startSec": 30,
        "endSec": 60,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      },
      {
        "videoId": "rR2gfIj9CG4",
        "startSec": 20,
        "endSec": 50,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-20 ur YT-lista (xlsx)."
      }
    ]
  },
  {
    "id": "lilla-al-fadji-delulu",
    "displayName": "Delulu — Lilla Al-Fadji",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 75,
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
    "genrePackages": [
      "Melodifestivalen"
    ],
    "inBaseCatalog": false,
    "spotifyTrackId": "30xAneAHxuzOE7MPZ1mssU",
    "youtubeClips": [
      {
        "videoId": "DRiL2wizEEk",
        "startSec": 8,
        "endSec": 38,
        "license": "standard",
        "notes": "Peter-kurerad 2026-09-14 ur Music.xlsx (rad 1409)."
      }
    ]
  },
  {
    "id": "pinkpantheress-stateside",
    "displayName": "Stateside — PinkPantheress & Zara Larsson",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 74,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "Disco & Pop"
    ],
    "spotifyTrackId": "7tM3yPeSBxnIIQlkz22vId",
    "youtubeClips": [
      {
        "videoId": "lIxQe1R5hs0",
        "startSec": 8,
        "endSec": 38,
        "channelTitle": "Pinkpantheress",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-25 ur \"YT och Spotify lista\". startSec 8 angiven av Peter. Slappt jan 2026 - fars igenkanning ar annu oprovad."
      }
    ]
  },
  {
    "id": "shakira-dai-dai",
    "displayName": "Dai Dai — Shakira & Burna Boy",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "itemHcp": 80,
    "audiences": [
      "elder",
      "gen-x",
      "millennials",
      "gen-z",
      "gen-alpha"
    ],
    "region": [
      "global"
    ],
    "genrePackages": [
      "sport"
    ],
    "spotifyTrackId": "0kosUz0jePvjiz4ctmR6wL",
    "youtubeClips": [
      {
        "videoId": "fcnDmrtj6Sk",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "shakiraVEVO",
        "license": "standard",
        "notes": "Peter-kurerad 2026-08-26 ur \"YT och Spotify lista\" (xlsx)."
      }
    ]
  }
];
