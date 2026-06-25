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
  audiences: MusicQuestionAudience[];
  genrePackages?: string[];
  /** Geografisk igenkännings-scope. Item-level overridar fil-header.
   *  'unknown-region' = ej i base-pool; filtreras bort i SEED_QUESTIONS. */
  region: string[];
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
    "audiences": [
      "all"
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
    "id": "cab-calloway-minnie-the-moocher",
    "displayName": "Minnie the Moocher — Cab Calloway",
    "correctYear": 1931,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3zlqUu9yK7fsefGsSAa86e",
    "youtubeClips": []
  },
  {
    "id": "fred-astaire-night-and-day",
    "displayName": "Night and Day — Fred Astaire",
    "correctYear": 1932,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "id": "cole-porter-anything-goes",
    "displayName": "Anything Goes — Cole Porter",
    "correctYear": 1934,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "mickeys-trailer-1938",
    "displayName": "Mickey's Trailer",
    "correctYear": 1938,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "aL7KlP0UcyA",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "JP The Pro",
        "license": "standard",
        "notes": "Kalle Anka på husvagnssemester — Mickey, Donald och Langben i husvagnen (julaftonsklassiker). Hela korta filmen (7:43)."
      }
    ]
  },
  {
    "id": "judy-garland-over-the-rainbow",
    "displayName": "Over the Rainbow — Judy Garland",
    "correctYear": 1939,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "1zzJOF5gOMXzqoUCbOg4JE",
    "youtubeClips": []
  },
  {
    "id": "glenn-miller-in-the-mood",
    "displayName": "In the Mood — Glenn Miller",
    "correctYear": 1940,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "bambi-1942",
    "displayName": "Bambi",
    "correctYear": 1942,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "bing-crosby-swinging-on-a-star",
    "displayName": "Swinging on a Star — Bing Crosby",
    "correctYear": 1944,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "frank-sinatra-almost-like-being-in-love",
    "displayName": "Almost Like Being in Love — Frank Sinatra",
    "correctYear": 1947,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "5dae01pKNjRQtgOeAkFzPY",
    "youtubeClips": []
  },
  {
    "id": "bill-haley-rock-around-the-clock",
    "displayName": "Rock Around the Clock — Bill Haley & His Comets",
    "correctYear": 1954,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lady-and-the-tramp",
    "displayName": "Lady and the Tramp",
    "correctYear": 1955,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "elvis-presley-heartbreak-hotel",
    "displayName": "Heartbreak Hotel — Elvis Presley",
    "correctYear": 1956,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "hamrin-semi-vm-1958",
    "displayName": "Kurt Hamrin Sverige–Västtyskland VM-halvfinal",
    "correctYear": 1958,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "lVZ9PFAfav8",
        "startSec": 30,
        "endSec": 60,
        "channelTitle": "KEITH BARON",
        "license": "standard",
        "notes": "HD documentary om Sverige i VM 1958 — Hamrin-höjdpunkter. Ersatte SD-klipp (2sQQ1FovLAs)."
      }
    ]
  },
  {
    "id": "ritchie-valens-la-bamba",
    "displayName": "La Bamba — Ritchie Valens",
    "correctYear": 1958,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "sweden-1958-world-cup-final",
    "displayName": "Sverige-Brasilien VM-finalen i Solna",
    "correctYear": 1958,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "3vUpZgzj-3I",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "freekick3596",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "ray-charles-whatd-i-say",
    "displayName": "What'd I Say — Ray Charles",
    "correctYear": 1959,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "beach-boys-surfin-safari",
    "displayName": "Surfin' Safari — The Beach Boys",
    "correctYear": 1962,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lill-babs-leva-livet",
    "displayName": "Leva livet — Lill-Babs",
    "correctYear": 1963,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "6P40lE9SODIcT21NpmRd2I",
    "youtubeClips": [
      {
        "videoId": "YT45RF2SGRw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Universal Music Group",
        "license": "standard",
        "notes": "Officiell UMG-uppladdning. Studio 1963. Svensk version av It's My Party."
      }
    ]
  },
  {
    "id": "beatles-a-hard-days-night",
    "displayName": "A Hard Day's Night — The Beatles",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lill-babs-letkis-jenka",
    "displayName": "Letkis-Jenka — Lill-Babs",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "2NV9sp5tl3fKrKZCFtSGBY",
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "the-who-my-generation",
    "displayName": "My Generation — The Who",
    "correctYear": 1965,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "rolling-stones-paint-it-black",
    "displayName": "Paint It Black — The Rolling Stones",
    "correctYear": 1966,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "aretha-franklin-respect",
    "displayName": "Respect — Aretha Franklin",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "Lm9Uy7_EqNc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MusicClub80s",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "jimi-hendrix-purple-haze",
    "displayName": "Purple Haze — Jimi Hendrix",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "id": "neil-diamond-girl-youll-be-a-woman-soon",
    "displayName": "Girl, You'll Be a Woman Soon — Neil Diamond",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "4CJCKU7Vua0i1EHgwRup1q",
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "simon-garfunkel-mrs-robinson",
    "displayName": "Mrs. Robinson — Simon & Garfunkel",
    "correctYear": 1968,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "bowie-space-oddity",
    "displayName": "Space Oddity — David Bowie",
    "correctYear": 1969,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "tRNpjt29n6Y",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "David Bowie - Topic",
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "beatles-let-it-be",
    "displayName": "Let It Be — The Beatles",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "dana-all-kinds-of-everything",
    "displayName": "All Kinds of Everything — Dana",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "unknown-region"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "simon-garfunkel-bridge-over-troubled-water",
    "displayName": "Bridge Over Troubled Water — Simon & Garfunkel",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "don-mclean-american-pie",
    "displayName": "American Pie — Don McLean",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "6N2b14J-5tA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "John Denver - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "john-lennon-imagine",
    "displayName": "Imagine — John Lennon",
    "correctYear": 1971,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "bill-withers-lean-on-me",
    "displayName": "Lean on Me — Bill Withers",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "fOZ-MySzAac",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Bill Withers - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "deep-purple-smoke-on-the-water",
    "displayName": "Smoke on the Water — Deep Purple",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "spitz-1972-munich-olympics",
    "displayName": "Mark Spitz tar 7 OS-guld i München",
    "correctYear": 1972,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "TyXhi5I-TWs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Olympics",
        "license": "standard",
        "notes": "Olympics official channel — Spitz 7 OS-guld München 1972."
      }
    ]
  },
  {
    "id": "stevie-wonder-superstition",
    "displayName": "Superstition — Stevie Wonder",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "all"
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
        "notes": "Paramount Pictures 50th Anniversary trailer — Nino Rota theme + iconic scener."
      }
    ]
  },
  {
    "id": "vicky-leandros-apres-toi",
    "displayName": "Après toi — Vicky Leandros",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "dolly-parton-jolene",
    "displayName": "Jolene — Dolly Parton",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "1oS8V9VCSuF0fgLQGMKXQY",
    "youtubeClips": [
      {
        "videoId": "uhYOEoQyqT4",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Universal Music Sweden",
        "license": "standard",
        "notes": "Officiell UMG Sweden. Melodifestivalen 1973 (7:a plats)."
      }
    ]
  },
  {
    "id": "roberta-flack-killing-me-softly",
    "displayName": "Killing Me Softly with His Song — Roberta Flack",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "DEbi_YjpA-Y",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "RHINO",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (3)."
      }
    ]
  },
  {
    "id": "robin-hood-1973",
    "displayName": "Robin Hood",
    "correctYear": 1973,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "rekU76GG9Sk",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Jim Margle",
        "license": "standard",
        "notes": "Original 1973 teatral trailer (1:00) — Robin Hood + Maid Marian etableras."
      }
    ]
  },
  {
    "id": "rolling-stones-angie",
    "displayName": "Angie — The Rolling Stones",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "dansband"
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
    "id": "abba-waterloo",
    "displayName": "Waterloo — ABBA",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "1TfqLAPs4K3s2rJMoCokcS",
    "youtubeClips": [
      {
        "videoId": "9y-8ZiAJiQo",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "ABBA - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Eurovision-låten."
      }
    ]
  },
  {
    "id": "ali-rumble-jungle-1974",
    "displayName": "Muhammad Ali 'Rumble in the Jungle' mot Foreman",
    "correctYear": 1974,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "M22nWSzyccE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "ElTerribleProduction",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — Ali vs Foreman highlights HD (1974)."
      }
    ]
  },
  {
    "id": "bob-marley-no-woman-no-cry",
    "displayName": "No Woman, No Cry — Bob Marley & The Wailers",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3PQLYVskjUeRmRIfECsL0X",
    "youtubeClips": [
      {
        "videoId": "TfNymCvydHc",
        "startSec": 5,
        "endSec": 50,
        "channelTitle": "Bob Marley",
        "license": "standard"
      }
    ]
  },
  {
    "id": "lynyrd-skynyrd-sweet-home-alabama",
    "displayName": "Sweet Home Alabama — Lynyrd Skynyrd",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "bjorn-skifs-michelangelo",
    "displayName": "Michelangelo — Björn Skifs",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "jaws",
    "displayName": "Jaws",
    "correctYear": 1975,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "lasse-berghagen-en-kvall-i-juni",
    "displayName": "En kväll i juni — Lasse Berghagen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Summer"
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "teach-in-ding-a-dong",
    "displayName": "Ding-a-dong — Teach-In",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "abba-mamma-mia",
    "displayName": "Mamma Mia — ABBA",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "id": "brotherhood-of-man-save-your-kisses",
    "displayName": "Save Your Kisses for Me — Brotherhood of Man",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "dancing-queen",
    "displayName": "Dancing Queen — ABBA",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0GjEhVFGZW8afUYGChu3Rr",
    "youtubeClips": [
      {
        "videoId": "TJLAJWSEd6U",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MASTER RJ",
        "license": "standard",
        "notes": "Official Video Remaster — rörlig MV med dans/scen. Refrängområde."
      }
    ]
  },
  {
    "id": "eagles-hotel-california",
    "displayName": "Hotel California — Eagles",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "4GkOfUKUqDDgoeiov8Uqyi",
    "youtubeClips": []
  },
  {
    "id": "nadia-comaneci-montreal-1976",
    "displayName": "Nadia Comăneci perfekta 10:or i Montreal",
    "correctYear": 1976,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "Yi_5xbd5xdE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Olympics",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "rocky",
    "displayName": "Rocky",
    "correctYear": 1976,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "bee-gees-stayin-alive",
    "displayName": "Stayin' Alive — Bee Gees",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "7tFiyTwD0nx5a1eklYtX2J",
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
    "id": "fleetwood-mac-dreams",
    "displayName": "Dreams — Fleetwood Mac",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "5oWyMakvQew",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "FLEETWOOD MAC - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "fleetwood-mac-go-your-own-way",
    "displayName": "Go Your Own Way — Fleetwood Mac",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "marie-myriam-loiseau-et-lenfant",
    "displayName": "L'Oiseau et l'Enfant — Marie Myriam",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
    "youtubeClips": [
      {
        "videoId": "lxHuY6DgSJQ",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Queen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "queen-we-will-rock-you",
    "displayName": "We Will Rock You — Queen",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
    "youtubeClips": [
      {
        "videoId": "vDRVTnbuGec",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Queen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "star-wars-new-hope",
    "displayName": "Star Wars: A New Hope",
    "correctYear": 1977,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "chic-le-freak",
    "displayName": "Le Freak — Chic",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "7PC-AcrHEKU",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Chic - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "gloria-gaynor-i-will-survive",
    "displayName": "I Will Survive — Gloria Gaynor",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "FHhZPp08s74",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Gloria Gaynor - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "grease-1978",
    "displayName": "Grease",
    "correctYear": 1978,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "village-people-ymca",
    "displayName": "Y.M.C.A. — Village People",
    "correctYear": 1978,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "fvzs2ozG-mc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "PRIVADO 80s",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "acdc-highway-to-hell",
    "displayName": "Highway to Hell — AC/DC",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "milk-and-honey-hallelujah",
    "displayName": "Hallelujah — Milk & Honey",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "ted-gardestad-vilken-harlig-dag",
    "displayName": "Oh, vilken härlig dag — Ted Gärdestad",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "vikingarna-djingis-kan",
    "displayName": "Djingis Kan — Vikingarna",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
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
    "id": "borg-mcenroe-wimbledon-1980",
    "displayName": "Borg-McEnroe Wimbledon-final",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "UnwYdF8a5ws",
        "startSec": 300,
        "endSec": 315,
        "channelTitle": "Wimbledon",
        "license": "standard",
        "notes": "Wimbledon official channel — 1980 tie-break i fjärde set (18-16 till McEnroe). Mid-tiebreak."
      }
    ]
  },
  {
    "id": "johnny-logan-whats-another-year",
    "displayName": "What's Another Year — Johnny Logan",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "miracle-on-ice-1980",
    "displayName": "Miracle on Ice — USA besegrar Sovjet",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "1ylQX7H_W_Q",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "MCB Highlights",
        "license": "standard",
        "notes": "Miracle on Ice 1980 — USA-USSR hockey highlights. Mid-game action."
      }
    ]
  },
  {
    "id": "queen-another-one-bites-the-dust",
    "displayName": "Another One Bites the Dust — Queen",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "57JVGUAt3XNlFSqqEEZ6eP",
    "youtubeClips": [
      {
        "videoId": "Y09uL2qbYCg",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Queen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "raging-bull-1980",
    "displayName": "Raging Bull",
    "correctYear": 1980,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "audiences": [
      "elder",
      "gen-x",
      "millennials"
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
    "id": "stenmark-os-guld-slalom-1980",
    "displayName": "Stenmark OS-guld slalom Lake Placid",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "zFy1OYa7Qm4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Nostalgi",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "stenmark-os-guld-storslalom-1980",
    "displayName": "Stenmark OS-guld storslalom Lake Placid",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "zFy1OYa7Qm4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Nostalgi",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-28 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "tomas-ledin-hon-gor-allt",
    "displayName": "Hon gör allt för att göra mig lycklig — Tomas Ledin",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "7DlTA5LRD6UVYeDwqbbojP",
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
    "id": "tomas-ledin-just-nu",
    "displayName": "Just nu! — Tomas Ledin",
    "correctYear": 1980,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "5O3XbSZu25WqsNpRakQd6T",
    "youtubeClips": [
      {
        "videoId": "khv8TygskVU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1980 vinnare."
      }
    ]
  },
  {
    "id": "wassberg-os-guld-1980",
    "displayName": "Thomas Wassberg OS-guld 15 km (0.01 sekund!) Lake Placid",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "ZtaY0UckhVI",
        "startSec": 30,
        "endSec": 55,
        "channelTitle": "Jari Isometsä",
        "license": "standard",
        "notes": "HD documentary om Wassberg — inkl. OS-guld 1980 med 0.01s marginal. Ersatte SD-klipp (qj-CaxQ6bMM)."
      }
    ]
  },
  {
    "id": "bjorn-skifs-fangad-i-en-drom",
    "displayName": "Fångad i en dröm — Björn Skifs",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "elder",
      "gen-x",
      "millennials"
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
    "id": "gyllene-tider-juni-juli-augusti",
    "displayName": "Juni, juli, augusti — Gyllene Tider",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "hasse-andersson-guld-och-groena-skogar",
    "displayName": "Guld och gröna skogar — Hasse Andersson",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Melodifestivalen"
    ],
    "spotifyTrackId": "6EnNjWkk1YX3fsTXtwO773",
    "youtubeClips": []
  },
  {
    "id": "indiana-jones-raiders",
    "displayName": "Indiana Jones: Raiders of the Lost Ark",
    "correctYear": 1981,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
    "correctNames": [
      "Harrison Ford"
    ],
    "distractorNames": [
      "Tom Selleck",
      "Mel Gibson",
      "Bruce Willis",
      "Kurt Russell"
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "chips-dag-efter-dag",
    "displayName": "Dag efter dag — Chips",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "2GAaOyfMLfA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1982 vinnare. ESC 1982 performance."
      }
    ]
  },
  {
    "id": "e-t-the-extra-terrestrial",
    "displayName": "E.T. the Extra-Terrestrial",
    "correctYear": 1982,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
    "correctNames": [
      "Henry Thomas",
      "Drew Barrymore"
    ],
    "distractorNames": [
      "Macaulay Culkin",
      "River Phoenix",
      "Elijah Wood",
      "Jake Gyllenhaal"
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
    "id": "marvin-gaye-sexual-healing",
    "displayName": "Sexual Healing — Marvin Gaye",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "survivor-eye-of-the-tiger",
    "displayName": "Eye of the Tiger — Survivor",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "toto-africa",
    "displayName": "Africa — Toto",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "bowie-lets-dance",
    "displayName": "Let's Dance — David Bowie",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "ZoC9_udLNeU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "David Bowie - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "corinne-hermes-si-la-vie-est-cadeau",
    "displayName": "Si la vie est cadeau — Corinne Hermès",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "F8y5xc8UodE",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 1983 vinnare — Luxemburg."
      }
    ]
  },
  {
    "id": "cyndi-lauper-girls-just-want-to-have-fun",
    "displayName": "Girls Just Want to Have Fun — Cyndi Lauper",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "jRr5EasAq84",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Cyndi Lauper - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "eurythmics-sweet-dreams",
    "displayName": "Sweet Dreams (Are Made of This) — Eurythmics",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "police-every-breath-you-take",
    "displayName": "Every Breath You Take — The Police",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "6cucosmPj-A",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "The Police - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic guitar-arpeggio-intro."
      }
    ]
  },
  {
    "id": "tomas-ledin-vi-ar-pa-gang",
    "displayName": "Vi är på gång — Tomas Ledin",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "carl-lewis-los-angeles-1984",
    "displayName": "Carl Lewis tar 4 OS-guld Los Angeles",
    "correctYear": 1984,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "xNafT5HK_Ro",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "How To Run Faster - By Performance Lab",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "george-michael-careless-whisper",
    "displayName": "Careless Whisper — George Michael",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "gunde-svan-os-guld-1984",
    "displayName": "Gunde Svan OS-guld 15 km Sarajevo",
    "correctYear": 1984,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "U4FVIDWttIs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "GundeWassberg",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "herreys-diggiloo-diggiley",
    "displayName": "Diggi-Loo Diggi-Ley — Herreys",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "ySOCalwr6Yo",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1984 vinnare, ESC-vinnare 1984."
      }
    ]
  },
  {
    "id": "jonssonligan-far-guldfeber",
    "displayName": "Jönssonligan får guldfeber",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "elder",
      "gen-x",
      "millennials"
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
    "id": "madonna-like-a-virgin",
    "displayName": "Like a Virgin — Madonna",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "prince-purple-rain",
    "displayName": "Purple Rain — Prince",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "iSBVeZrDfGY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Prince - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "springsteen-born-in-the-usa",
    "displayName": "Born in the U.S.A. — Bruce Springsteen",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "stevie-wonder-i-just-called",
    "displayName": "I Just Called to Say I Love You — Stevie Wonder",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "the-terminator-1984",
    "displayName": "The Terminator",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "1avX1lX7gSs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tina Turner - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "wham-last-christmas",
    "displayName": "Last Christmas — Wham!",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "T0T9GyM28tg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Wham! - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "wham-wake-me-up-before-you-go-go",
    "displayName": "Wake Me Up Before You Go-Go — Wham!",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "YfAF92Z3iFw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "LatinHype",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "a-ha-take-on-me",
    "displayName": "Take on Me — a-ha",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "MIgK3zOk0zg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "a-ha - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic synth-hook."
      }
    ]
  },
  {
    "id": "back-to-the-future",
    "displayName": "Back to the Future",
    "correctYear": 1985,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
    "correctNames": [
      "Michael J. Fox"
    ],
    "distractorNames": [
      "Rob Lowe",
      "Tom Hanks",
      "Emilio Estevez",
      "Patrick Swayze"
    ],
    "youtubeClips": [
      {
        "videoId": "T_WSXXPQYeY",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Universal Pictures",
        "license": "standard",
        "notes": "Official Universal Pictures-klipp — Johnny B. Goode-scenen."
      }
    ]
  },
  {
    "id": "bobbysocks-la-det-swinge",
    "displayName": "La det swinge — Bobbysocks!",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "bryan-adams-summer-of-69",
    "displayName": "Summer of '69 — Bryan Adams",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "kikki-danielsson-bra-vibrationer",
    "displayName": "Bra vibrationer — Kikki Danielsson",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
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
    "id": "usa-for-africa-we-are-the-world",
    "displayName": "We Are the World — USA for Africa",
    "correctYear": 1985,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "s3wNuru4U0I",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Oxygene 80",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "bon-jovi-livin-on-a-prayer",
    "displayName": "Livin' on a Prayer — Bon Jovi",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "YBdyc1WDlBQ",
        "startSec": 45,
        "endSec": 60,
        "channelTitle": "Jon Bon Jovi - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. 'Whoaa, we're halfway there'-refräng."
      }
    ]
  },
  {
    "id": "europe-the-final-countdown",
    "displayName": "The Final Countdown — Europe",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "4hj8M8XZpis",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "EUROPE - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "maradona-hand-of-god",
    "displayName": "Maradona Hand of God",
    "correctYear": 1986,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "F-n7lWyM4Vc",
        "startSec": 0,
        "endSec": 20,
        "channelTitle": "Sport Clips 4K",
        "license": "standard",
        "notes": "4K AI-enhanced highlights — Hand of God + Goal of the Century i följd. Ersatte blockerat klipp."
      }
    ]
  },
  {
    "id": "sandra-kim-jaime-la-vie",
    "displayName": "J'aime la vie — Sandra Kim",
    "correctYear": 1986,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "all"
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
    "id": "johnny-logan-hold-me-now",
    "displayName": "Hold Me Now — Johnny Logan",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "lotta-engberg-fyra-bugg",
    "displayName": "Fyra bugg och en Coca Cola — Lotta Engberg",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "3BFTio5296w",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Rick Astley - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic (2022 Remaster). Iconic 'Never gonna give you up'-hook."
      }
    ]
  },
  {
    "id": "tre-kronor-vm-1987-vien",
    "displayName": "Tre Kronor VM-guld Wien",
    "correctYear": 1987,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "dUQg2eu6lf4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "HockeySverige",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "u2-with-or-without-you",
    "displayName": "With or Without You — U2",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "whitney-houston-i-wanna-dance-with-somebody",
    "displayName": "I Wanna Dance with Somebody — Whitney Houston",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "2dzf4T3RbEc",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Whitney Houston - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "bobby-mcferrin-dont-worry-be-happy",
    "displayName": "Don't Worry, Be Happy — Bobby McFerrin",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "roxette-listen-to-your-heart",
    "displayName": "Listen to Your Heart — Roxette",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "tommy-korberg-stad-i-ljus",
    "displayName": "Stad i ljus — Tommy Körberg",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "u4-gEpNI6CI",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 1988 vinnare. ESC 1988 performance."
      }
    ]
  },
  {
    "id": "tracy-chapman-fast-car",
    "displayName": "Fast Car — Tracy Chapman",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "vinnie-jones-gascoigne-grab",
    "displayName": "Vinnie Jones griper Gascoigne — det berömda greppet",
    "correctYear": 1988,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "FyCw5RLDyYw",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Deadball Diaries",
        "license": "standard",
        "notes": "Ikonisk fotbollsmoment — Vinnie Jones (Wimbledon) griper Gascoigne (Newcastle) 1988. Sport-kategori via contentSubject: sport-event."
      }
    ]
  },
  {
    "id": "whitney-one-moment-in-time",
    "displayName": "One Moment in Time — Whitney Houston",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "field-of-dreams-1989",
    "displayName": "Field of Dreams",
    "correctYear": 1989,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "hakan-sodergren-nu-tar-vi-dom",
    "displayName": "Nu tar vi dom — Håkan Södergren & Ishockeylandslaget",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "kaoma-lambada",
    "displayName": "Lambada — Kaoma",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "lili-sussie-oh-mama",
    "displayName": "Oh Mama — Lili & Sussie",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "4orJQkF2exPD4xSFmMY00U",
    "youtubeClips": []
  },
  {
    "id": "madonna-like-a-prayer",
    "displayName": "Like a Prayer — Madonna",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "MMNTbnLrBK8",
        "startSec": 45,
        "endSec": 60,
        "channelTitle": "Enhanced Music Videos",
        "license": "standard",
        "notes": "Remastered Full HD musikvideo. Officiell MV-innehåll, bättre bildkvalitet än Topic-versionen (statisk albumkonst)."
      }
    ]
  },
  {
    "id": "phil-collins-another-day-in-paradise",
    "displayName": "Another Day in Paradise — Phil Collins",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "At9FypGZ44M",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Phil Collins",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (3)."
      }
    ]
  },
  {
    "id": "riva-rock-me",
    "displayName": "Rock Me — Riva",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "unknown-region"
    ],
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
    "id": "roxette-the-look",
    "displayName": "The Look — Roxette",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "acdc-thunderstruck",
    "displayName": "Thunderstruck — AC/DC",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "57bgtoPSgt236HzfBOd8kj",
    "youtubeClips": []
  },
  {
    "id": "home-alone",
    "displayName": "Home Alone",
    "correctYear": 1990,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "madonna-vogue",
    "displayName": "Vogue — Madonna",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "sbP6knug7Js",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MVIDEO4K",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (15)."
      }
    ]
  },
  {
    "id": "new-order-world-in-motion",
    "displayName": "World in Motion — New Order",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "sinead-oconnor-nothing-compares-2-u",
    "displayName": "Nothing Compares 2 U — Sinéad O'Connor",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "Ouf9-bOqJVk",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Sinéad O'Connor - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "toto-cutugno-insieme",
    "displayName": "Insieme: 1992 — Toto Cutugno",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "bryan-adams-everything-i-do",
    "displayName": "(Everything I Do) I Do It for You — Bryan Adams",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "metallica-enter-sandman",
    "displayName": "Enter Sandman — Metallica",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "michael-jackson-black-or-white",
    "displayName": "Black or White — Michael Jackson",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "rem-losing-my-religion",
    "displayName": "Losing My Religion — R.E.M.",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "scorpions-wind-of-change",
    "displayName": "Wind of Change — Scorpions",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "seal-crazy",
    "displayName": "Crazy — Seal",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "smells-like-teen-spirit",
    "displayName": "Smells Like Teen Spirit — Nirvana",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "tre-kronor-vm-1991-turku",
    "displayName": "Tre Kronor VM-guld Turku",
    "correctYear": 1991,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "roFDtX3CNG4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Daniel Risarp",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — 'Mats Sundin avgör när Tre Kronor tar VM guld 1991'."
      }
    ]
  },
  {
    "id": "ace-of-base-all-that-she-wants",
    "displayName": "All That She Wants — Ace of Base",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "XBrfbWtmvWs",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "FT Depot",
        "license": "standard",
        "notes": "Original teatral 1992-trailer — Aladdin + Agrabah + Genie (Robin Williams) etableras."
      }
    ]
  },
  {
    "id": "boyz-ii-men-end-of-the-road",
    "displayName": "End of the Road — Boyz II Men",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "dr-alban-its-my-life",
    "displayName": "It's My Life — Dr. Alban",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "6bjl81yfCztuBXLC9Mqs2N",
    "youtubeClips": [
      {
        "videoId": "aBJZsHDJvf0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Dr. Alban - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "dream-team-1992-barcelona",
    "displayName": "Dream Team — Barcelona OS basket",
    "correctYear": 1992,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "JTNIWbGmzGU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Olympics",
        "license": "standard",
        "notes": "Olympics official channel — Best of Dream Team Barcelona 1992. Jordan/Magic/Bird."
      }
    ]
  },
  {
    "id": "guns-n-roses-november-rain",
    "displayName": "November Rain — Guns N' Roses",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "linda-martin-why-me",
    "displayName": "Why Me? — Linda Martin",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "niklas-stromstedt-oslagbara",
    "displayName": "Oslagbara — Niklas Strömstedt",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "nirvana-come-as-you-are",
    "displayName": "Come as You Are — Nirvana",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "snap-rhythm-is-a-dancer",
    "displayName": "Rhythm Is a Dancer — Snap!",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "svenne-rubins-langa-bollar-pa-bengt",
    "displayName": "Långa Bollar På Bengt — Svenne Rubins",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "id": "sverige-em-1992-semifinal",
    "displayName": "Sverige semifinal hemma-EM mot Tyskland",
    "correctYear": 1992,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "8LkwRue9aK4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "hejatysklanduuups",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "4-non-blondes-whats-up",
    "displayName": "What's Up? — 4 Non Blondes",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "arvingarna-eloise",
    "displayName": "Eloise — Arvingarna",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "cool-runnings-1993",
    "displayName": "Cool Runnings",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "jurassic-park",
    "displayName": "Jurassic Park",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "niamh-kavanagh-in-your-eyes",
    "displayName": "In Your Eyes — Niamh Kavanagh",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "sunes-sommar",
    "displayName": "Sunes sommar",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "elder",
      "gen-x",
      "millennials"
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
    "id": "whitney-houston-i-will-always-love-you",
    "displayName": "I Will Always Love You — Whitney Houston",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "ace-of-base-the-sign",
    "displayName": "The Sign — Ace of Base",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "cranberries-zombie",
    "displayName": "Zombie — The Cranberries",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "forrest-gump",
    "displayName": "Forrest Gump",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "forsberg-foppa-flick-lillehammer-1994",
    "displayName": "Peter Forsbergs straff-flick Lillehammer",
    "correctYear": 1994,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "QISjlZgP4vA",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "stansmith98",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "ges-graver-guld-usa",
    "displayName": "När vi gräver guld i USA — GES",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "paul-harrington-rock-n-roll-kids",
    "displayName": "Rock 'n' Roll Kids — Paul Harrington & Charlie McGettigan",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
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
        "notes": "Official trailer (Movieclips) — iconic surf-rock soundtrack + ensemble-shots."
      }
    ]
  },
  {
    "id": "ravelli-vm-94-rumanien",
    "displayName": "Ravelli stoppar Rumäniens straffar VM-94",
    "correctYear": 1994,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "Yul90ZNSRFM",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Nostalgi",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — Ravellis 1:a straffräddning Sverige-Rumänien VM 1994."
      }
    ]
  },
  {
    "id": "rednex-cotton-eye-joe",
    "displayName": "Cotton Eye Joe — Rednex",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "sven-ingvars-sommar-i-sverige",
    "displayName": "Sommar i Sverige — Sven-Ingvars",
    "correctYear": 1994,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "the-lion-king-1994",
    "displayName": "The Lion King",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "What is the name of the main character in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": true,
    "correctNames": [
      "Simba"
    ],
    "distractorNames": [
      "Mufasa",
      "Scar",
      "Nala",
      "Timon"
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
    "id": "tomas-brolin-vm-1994",
    "displayName": "Tomas Brolins mål VM-94",
    "correctYear": 1994,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "GMpUuXe9uzM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MatigolVidz",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "cantona-kungfu-kick-1995",
    "displayName": "Cantonas kung-fu-spark mot Crystal Palace-fan",
    "correctYear": 1995,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "6eOCxIPkvb8",
        "startSec": 15,
        "endSec": 50,
        "channelTitle": "Classic Footy Videos & Clips",
        "license": "standard",
        "notes": "HD — Cantonas kung-fu-spark Selhurst Park 1995. Ersatte SD-klipp (C7PSY7KYThk)."
      }
    ]
  },
  {
    "id": "coolio-gangstas-paradise",
    "displayName": "Gangsta's Paradise — Coolio",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "nick-borgen-den-glider-in",
    "displayName": "Den glider in — Nick Borgen",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "oasis-wonderwall",
    "displayName": "Wonderwall — Oasis",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "FVdjZYfDuLE",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Oasis - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "secret-garden-nocturne",
    "displayName": "Nocturne — Secret Garden",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "ali-olympic-torch-atlanta-1996",
    "displayName": "Muhammad Ali tänder OS-elden i Atlanta",
    "correctYear": 1996,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "WIj3t6i3Hpo",
        "startSec": 5,
        "endSec": 50,
        "channelTitle": "The Game Day",
        "license": "standard",
        "notes": "HD — Ali tänder OS-elden Atlanta 1996. Ersatte SD Olympics-klipp (80wMMFAcweQ)."
      }
    ]
  },
  {
    "id": "cardigans-lovefool",
    "displayName": "Lovefool — The Cardigans",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
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
    "id": "eimear-quinn-the-voice",
    "displayName": "The Voice — Eimear Quinn",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "kent-music-non-stop",
    "displayName": "Music Non Stop — Kent",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lightning-seeds-three-lions",
    "displayName": "Three Lions — Baddiel, Skinner & The Lightning Seeds",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "Z7EsuR5I8SE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Los Del Río - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "oasis-dont-look-back-in-anger",
    "displayName": "Don't Look Back in Anger — Oasis",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "spice-girls-wannabe",
    "displayName": "Wannabe — Spice Girls",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "tscL_I2v7pU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Spice Girls - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic 'I'll tell you what I want'-intro."
      }
    ]
  },
  {
    "id": "aqua-barbie-girl",
    "displayName": "Barbie Girl — Aqua",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "77zog6Up_Yg",
        "startSec": 0,
        "endSec": 198,
        "channelTitle": "Aqua - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "bellini-samba-de-janeiro",
    "displayName": "Samba de Janeiro — Bellini",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "id": "blur-song-2",
    "displayName": "Song 2 — Blur",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "id": "celine-dion-my-heart-will-go-on",
    "displayName": "My Heart Will Go On — Celine Dion",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "katrina-waves-love-shine-a-light",
    "displayName": "Love Shine a Light — Katrina and the Waves",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "titanic",
    "displayName": "Titanic",
    "correctYear": 1997,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
    "correctNames": [
      "Leonardo DiCaprio",
      "Kate Winslet"
    ],
    "distractorNames": [
      "Brad Pitt",
      "Matt Damon",
      "Julia Roberts",
      "Sandra Bullock"
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
    "id": "baby-one-more-time",
    "displayName": "...Baby One More Time — Britney Spears",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "1dfhNimhwNM",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "thelanoz video Comeback",
        "license": "standard",
        "notes": "Official 4K 60FPS Video — rörlig MV (skoluniform-scen). 'Oh baby baby' + första vers."
      }
    ]
  },
  {
    "id": "cher-believe",
    "displayName": "Believe — Cher",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "id": "jill-johnson-karleken-ar",
    "displayName": "Kärleken är — Jill Johnson",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "jordan-last-shot-1998",
    "displayName": "Michael Jordans 'Last Shot' i NBA-finalen",
    "correctYear": 1998,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "AKgDmNrFDow",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Coach Clank",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — Jordans iconic last shot, 1998 NBA Finals (NBA-officiella var region-blockerade)."
      }
    ]
  },
  {
    "id": "madonna-frozen",
    "displayName": "Frozen — Madonna",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "mulan-1998",
    "displayName": "Mulan",
    "correctYear": 1998,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "petter-vinden-har-vant",
    "displayName": "Vinden har vänt — Petter",
    "correctYear": 1998,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "2XkMVyMLZhrUivl7XuhidO",
    "youtubeClips": []
  },
  {
    "id": "charlotte-nilsson-tusen-och-en-natt",
    "displayName": "Tusen och en natt — Charlotte Nilsson",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "eiffel-65-blue",
    "displayName": "Blue (Da Ba Dee) — Eiffel 65",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lou-bega-mambo-no-5",
    "displayName": "Mambo No. 5 — Lou Bega",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "is6AYSCWwKM",
        "startSec": 0,
        "endSec": 221,
        "channelTitle": "Lou Bega Official",
        "license": "standard"
      }
    ]
  },
  {
    "id": "markoolio-sommar-och-sol",
    "displayName": "Sommar och sol — Markoolio",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
        "videoId": "98ID_halfhs",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "SandraTornblad",
        "license": "standard",
        "notes": "Musikvideo-re-upload av originalet (1999)."
      }
    ]
  },
  {
    "id": "the-matrix",
    "displayName": "The Matrix",
    "correctYear": 1999,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "zombie-nation-kernkraft-400",
    "displayName": "Kernkraft 400 — Zombie Nation",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "id": "barbados-kom-hem",
    "displayName": "Kom hem — Barbados",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "coldplay-yellow",
    "displayName": "Yellow — Coldplay",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "gladiator-2000",
    "displayName": "Gladiator",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "markoolio-mera-mal",
    "displayName": "Mera mål — Markoolio",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
    "youtubeClips": [
      {
        "videoId": "nhEewGN6ePQ",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Markoolio - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "olsen-brothers-fly-on-wings-of-love",
    "displayName": "Fly on the Wings of Love — Olsen Brothers",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "roger-pontare-vindarna-viskar",
    "displayName": "När vindarna viskar mitt namn — Roger Pontare",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "snatch-2000",
    "displayName": "Snatch",
    "correctYear": 2000,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "id": "southside-spinners-luvstruck",
    "displayName": "Luvstruck — Southside Spinners",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "the-hives-hate-to-say",
    "displayName": "Hate to Say I Told You So — The Hives",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3HEqFZGsniU4MlK9b2PLlf",
    "youtubeClips": []
  },
  {
    "id": "alicia-keys-fallin",
    "displayName": "Fallin' — Alicia Keys",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "antique-die-for-you",
    "displayName": "(I Would) Die for You — Antique",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "VVLfuW3KiLY",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Antique",
        "license": "standard",
        "notes": "Official music video. ESC 2001 Greece entry (3rd place)."
      }
    ]
  },
  {
    "id": "harry-potter-philosophers-stone-2001",
    "displayName": "Harry Potter and the Philosopher's Stone",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "lady-marmalade-2001",
    "displayName": "Lady Marmalade — Christina Aguilera, Lil' Kim, Mýa & Pink",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
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
        "videoId": "V75dMMIW2B4",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Movieclips",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell 2001-trailer #1 (Movieclips)."
      }
    ]
  },
  {
    "id": "planet-funk-chase-the-sun",
    "displayName": "Chase the Sun — Planet Funk",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "id": "shrek-2001",
    "displayName": "Shrek",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
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
    "id": "tanel-padar-everybody",
    "displayName": "Everybody — Tanel Padar, Dave Benton & 2XL",
    "correctYear": 2001,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "avril-lavigne-complicated",
    "displayName": "Complicated — Avril Lavigne",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "coldplay-the-scientist",
    "displayName": "The Scientist — Coldplay",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "eminem-without-me",
    "displayName": "Without Me — Eminem",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "marie-n-i-wanna",
    "displayName": "I Wanna — Marie N",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "_M-w89U8TEU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2002 vinnare — Lettland."
      }
    ]
  },
  {
    "id": "50-cent-in-da-club",
    "displayName": "In da Club — 50 Cent",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "finding-nemo",
    "displayName": "Finding Nemo",
    "correctYear": 2003,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
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
    "id": "outkast-hey-ya",
    "displayName": "Hey Ya! — OutKast",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "_pYHJWd_yto",
        "startSec": 30,
        "endSec": 45,
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Melodifestivalen"
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "white-stripes-seven-nation-army",
    "displayName": "Seven Nation Army — The White Stripes",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "eric-prydz-call-on-me",
    "displayName": "Call on Me — Eric Prydz",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "1As4KC3YYpu89aBt7EqL2m",
    "youtubeClips": [
      {
        "videoId": "MnyFWY0tFYc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Eric Prydz - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "lena-philipsson-det-gor-ont",
    "displayName": "Det gör ont — Lena Philipsson",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "na2qDYmm7LM",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2004 vinnare. ESC-version It Hurts."
      }
    ]
  },
  {
    "id": "markoolio-in-med-bollen",
    "displayName": "In med bollen — Markoolio",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "audiences": [
      "all"
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
    "id": "o-zone-dragostea-din-tei",
    "displayName": "Dragostea Din Tei — O-Zone",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-x",
      "millennials",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
    "correctNames": [
      "Michael Nyqvist"
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
        "notes": "Originaltrailer. Oscar-nominerad svensk film. Michael Nyqvist."
      }
    ]
  },
  {
    "id": "stefan-holm-os-guld-2004",
    "displayName": "Stefan Holm OS-guld höjdhopp Aten",
    "correctYear": 2004,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "aBh3nDidTQ0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "MaramaGitz",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "the-killers-mr-brightside",
    "displayName": "Mr. Brightside — The Killers",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "usher-yeah",
    "displayName": "Yeah! — Usher",
    "correctYear": 2004,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "gorillaz-feel-good-inc",
    "displayName": "Feel Good Inc. — Gorillaz",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "EDwb9jOVRtU",
        "startSec": 0,
        "endSec": 334,
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "timbuktu-alla-vill-till-himlen",
    "displayName": "Alla vill till himlen — Timbuktu",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "carola-evighet",
    "displayName": "Evighet — Carola",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "gnarls-barkley-crazy",
    "displayName": "Crazy — Gnarls Barkley",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lordi-hard-rock-hallelujah",
    "displayName": "Hard Rock Hallelujah — Lordi",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "shakira-hips-dont-lie",
    "displayName": "Hips Don't Lie — Shakira",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "fNRXD393cfs",
        "startSec": 0,
        "endSec": 219,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "tre-kronor-os-turin-2006",
    "displayName": "Tre Kronor OS-guld Turin",
    "correctYear": 2006,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "3vdtHuuhtCU",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Radiosporten",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "marija-serifovic-molitva",
    "displayName": "Molitva — Marija Šerifović",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "rihanna-umbrella",
    "displayName": "Umbrella — Rihanna",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "HuQ0ni6AlrU",
        "startSec": 0,
        "endSec": 267,
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0NEw29HKkDkt1yDyBJOgXe",
    "youtubeClips": []
  },
  {
    "id": "the-ark-the-worrying-kind",
    "displayName": "The Worrying Kind — The Ark",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "beyonce-single-ladies",
    "displayName": "Single Ladies (Put a Ring on It) — Beyoncé",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "4z-bOdAdias",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Beyoncé - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "charlotte-perrelli-hero",
    "displayName": "Hero — Charlotte Perrelli",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "x_iSoluR53U",
        "startSec": 5,
        "endSec": 20,
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "dima-bilan-believe",
    "displayName": "Believe — Dima Bilan",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "-72s4WzUcKI",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "ESC 2008 vinnare — Ryssland."
      }
    ]
  },
  {
    "id": "federer-nadal-wimbledon-2008",
    "displayName": "Federer-Nadal Wimbledon-final ('greatest match')",
    "correctYear": 2008,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "U5Af1jGgYqA",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Wimbledon",
        "license": "standard",
        "notes": "Wimbledon official channel — 2008 'greatest match'-finalen Best Rallies."
      }
    ]
  },
  {
    "id": "katy-perry-i-kissed-a-girl",
    "displayName": "I Kissed a Girl — Katy Perry",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lady-gaga-poker-face",
    "displayName": "Poker Face — Lady Gaga",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "oG-4Uvhm4lI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Lady Gaga - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "phelps-beijing-8-guld-2008",
    "displayName": "Michael Phelps 8 OS-guld Peking",
    "correctYear": 2008,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "sftrI-e8nHg",
        "startSec": 15,
        "endSec": 30,
        "channelTitle": "Bao Highlights",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "the-dark-knight-2008",
    "displayName": "The Dark Knight",
    "correctYear": 2008,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "alexander-rybak-fairytale",
    "displayName": "Fairytale — Alexander Rybak",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "all"
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "OIPmhkzN2ug",
        "startSec": 0,
        "endSec": 290,
        "channelTitle": "Black Eyed Peas - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "bolt-100m-world-record-2009",
    "displayName": "Usain Bolt slår 100m-VR (9.58s)",
    "correctYear": 2009,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "DiJKCQSkjOw",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "World Athletics",
        "license": "standard",
        "notes": "World Athletics official channel — Berlin 2009 100m WR 9.58s."
      }
    ]
  },
  {
    "id": "hadise-dum-tek-tek",
    "displayName": "Dum Tek Tek — Hadise",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "lady-gaga-bad-romance",
    "displayName": "Bad Romance — Lady Gaga",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "2sPAJRwxrOgfZah700s2ni",
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
    "id": "adele-rolling-in-the-deep",
    "displayName": "Rolling in the Deep — Adele",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "eminem-rihanna-love-the-way-you-lie",
    "displayName": "Love the Way You Lie — Eminem & Rihanna",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "knaan-wavin-flag",
    "displayName": "Wavin' Flag — K'naan",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "sport",
      "football"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "robyn-dancing-on-my-own",
    "displayName": "Dancing on My Own — Robyn",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-x",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "dansband"
    ],
    "spotifyTrackId": "6kKJbnWfmVUKnhqa8n17xT",
    "youtubeClips": []
  },
  {
    "id": "shakira-waka-waka",
    "displayName": "Waka Waka (This Time for Africa) — Shakira",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
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
    "id": "timoteij-kom",
    "displayName": "Kom — Timoteij",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Melodifestivalen"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "id": "ell-nikki-running-scared",
    "displayName": "Running Scared — Ell & Nikki",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "lmfao-party-rock-anthem",
    "displayName": "Party Rock Anthem — LMFAO",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "moneyball-2011",
    "displayName": "Moneyball",
    "correctYear": 2011,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
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
    "id": "veronica-maggio-jag-kommer",
    "displayName": "Jag kommer — Veronica Maggio",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "5M2y8QdDepGYMsWyxhoxQU",
    "youtubeClips": [
      {
        "videoId": "zNKwziMG5UI",
        "startSec": 30,
        "endSec": 45,
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "47EG91_XHic",
        "startSec": 0,
        "endSec": 210,
        "channelTitle": "Unique Vibes",
        "license": "standard"
      }
    ]
  },
  {
    "id": "first-aid-kit-emmylou",
    "displayName": "Emmylou — First Aid Kit",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3VZQshi4COChhXaz7cLP02",
    "youtubeClips": [
      {
        "videoId": "ayX4RhsLyUo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Icona Pop - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "kapten-rod-nar-solen-gar-ner",
    "displayName": "När solen går ner — Kapten Röd",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "68GdZAAowWDac3SkdNWOwo",
    "youtubeClips": [
      {
        "videoId": "W-BkWPk9Hqo",
        "startSec": 0,
        "endSec": 30,
        "channelTitle": "Kapten Röd",
        "license": "standard",
        "notes": "Officiell video. AKI feat. Kapten Röd (hip-hop/reggae)."
      }
    ]
  },
  {
    "id": "loreen-euphoria",
    "displayName": "Euphoria — Loreen",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "1xN7BpTAWnZkuSLOtRP6Qc",
    "youtubeClips": [
      {
        "videoId": "chK8XTtqEJI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Loreen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "psy-gangnam-style",
    "displayName": "Gangnam Style — PSY",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "1z9kQ14XBSN0r2v6fx4IdG",
    "youtubeClips": [
      {
        "videoId": "LyKYV_7vs6k",
        "startSec": 10,
        "endSec": 55,
        "channelTitle": "PremiunMusicHD",
        "license": "standard"
      }
    ]
  },
  {
    "id": "swedish-house-mafia-dont-you-worry-child",
    "displayName": "Don't You Worry Child — Swedish House Mafia",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3zu2CuVTJwaZn2m4rBzaUO",
    "youtubeClips": [
      {
        "videoId": "3mWbRB3Y4R8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Swedish House Mafia - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "zlatan-bicycle-kick-england-2012",
    "displayName": "Zlatans bicycle kick mot England",
    "correctYear": 2012,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "RM_5tJncHww",
        "startSec": 0,
        "endSec": 25,
        "channelTitle": "GOAL",
        "license": "standard",
        "notes": "GOAL-kanal. Zlatans bicycle kick mot England 14/11-2012. Ersatte blockerat klipp."
      }
    ]
  },
  {
    "id": "avicii-hey-brother",
    "displayName": "Hey Brother — Avicii",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0bhBKOTqLbKbJZbAB5Mdsf",
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
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
    "id": "daft-punk-get-lucky",
    "displayName": "Get Lucky — Daft Punk",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "millennials",
      "gen-z"
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
      "Michael Nyqvist",
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
    "id": "robin-stjernberg-you",
    "displayName": "You — Robin Stjernberg",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "vtjdTPnCcu0",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Eurovision Song Contest",
        "license": "standard",
        "notes": "Melodifestivalen 2013 vinnare. ESC 2013 performance."
      }
    ]
  },
  {
    "id": "tove-lo-habits",
    "displayName": "Habits (Stay High) — Tove Lo",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "conchita-wurst-rise-like-a-phoenix",
    "displayName": "Rise Like a Phoenix — Conchita Wurst",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "kalla-os-guld-stafett-2014",
    "displayName": "Charlotte Kalla OS-guld stafett Sochi",
    "correctYear": 2014,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "kdxbknklbAU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Pheyman",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "mark-ronson-uptown-funk",
    "displayName": "Uptown Funk — Mark Ronson ft. Bruno Mars",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "fmsv4gPe9bg",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Mark Ronson - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "pharrell-williams-happy",
    "displayName": "Happy — Pharrell Williams",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "jv-pYB0Qw9A",
        "startSec": 0,
        "endSec": 238,
        "channelTitle": "AnimeOracle",
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "taylor-swift-shake-it-off",
    "displayName": "Shake It Off — Taylor Swift",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "tre-kronor-os-silver-sochi-2014",
    "displayName": "Tre Kronor OS-silver Sochi (mot Kanada)",
    "correctYear": 2014,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "3e7FyDCxxL4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Expressen",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "adele-hello",
    "displayName": "Hello — Adele",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "en-man-som-heter-ove",
    "displayName": "En man som heter Ove",
    "correctYear": 2015,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "millennials",
      "gen-z"
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
      "Michael Nyqvist",
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
    "id": "mans-zelmerlow-heroes",
    "displayName": "Heroes — Måns Zelmerlöw",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "youtubeClips": [
      {
        "videoId": "-nbq6Ur103Q",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Warner Music Sweden",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (18)."
      }
    ]
  },
  {
    "id": "wiz-khalifa-charlie-puth-see-you-again",
    "displayName": "See You Again — Wiz Khalifa & Charlie Puth",
    "correctYear": 2015,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "RgKAFK5djSk",
        "startSec": 0,
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "8BmMB3i--FM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Zara Larsson - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "angry-birds",
    "displayName": "The Angry Birds Movie",
    "correctYear": 2016,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "chainsmokers-closer",
    "displayName": "Closer — The Chainsmokers",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "drake-one-dance",
    "displayName": "One Dance — Drake",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "nANXQA9JEMY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Frans",
        "license": "standard",
        "notes": "Melodifestivalen 2016 vinnare. Officiell music video."
      }
    ]
  },
  {
    "id": "guetta-this-ones-for-you",
    "displayName": "This One's for You — David Guetta ft. Zara Larsson",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "sport"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "laleh-bara-fa-va-mig-sjalv",
    "displayName": "Bara Få Va Mig Själv — Laleh",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "100% svenska"
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
    "id": "leicester-premier-league-2016",
    "displayName": "Leicester City vinner Premier League",
    "correctYear": 2016,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "7MHy3eS43FE",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Sky Sports Retro",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — ögonblicket Leicester blev mästare 2016 (Sky Sports)."
      }
    ]
  },
  {
    "id": "sia-cheap-thrills",
    "displayName": "Cheap Thrills — Sia",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3S4px9f4lceWdKf0gWciFu",
    "youtubeClips": [
      {
        "videoId": "HbzZPpWr4MI",
        "startSec": 0,
        "endSec": 45,
        "channelTitle": "Sia - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "simone-biles-rio-2016",
    "displayName": "Simone Biles 4 OS-guld i Rio",
    "correctYear": 2016,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "unknown-region"
    ],
    "youtubeClips": [
      {
        "videoId": "aBrmCgCuwno",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "TNT Sports",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "weeknd-starboy",
    "displayName": "Starboy — The Weeknd",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "zootopia-2016",
    "displayName": "Zootopia",
    "correctYear": 2016,
    "contentSubject": "movie",
    "questionText": "Select one of the main actors in this film?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "isAnimated": false,
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
    "audiences": [
      "all"
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
    "id": "ed-sheeran-perfect",
    "displayName": "Perfect — Ed Sheeran",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0tgVpDi06FyKpA1z0VMD4v",
    "youtubeClips": [
      {
        "videoId": "2Vv-BfVoq4g",
        "startSec": 15,
        "endSec": 60,
        "channelTitle": "Ed Sheeran",
        "license": "standard"
      }
    ]
  },
  {
    "id": "federer-australian-open-2017",
    "displayName": "Federers comeback-vinst Australian Open",
    "correctYear": 2017,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "TzA0pe2DQ_s",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Australian Open",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "imagine-dragons-believer",
    "displayName": "Believer — Imagine Dragons",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0pqnGHJpmpxLKifKRmU6WP",
    "youtubeClips": []
  },
  {
    "id": "luis-fonsi-despacito",
    "displayName": "Despacito — Luis Fonsi & Daddy Yankee",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "post-malone-rockstar",
    "displayName": "Rockstar — Post Malone",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "tre-kronor-vm-2017-koln",
    "displayName": "Tre Kronor VM-guld Köln",
    "correctYear": 2017,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "EjxAdkmx3vs",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "IIHF",
        "license": "standard",
        "notes": "IIHF official channel — Canada-Sweden 2017 World Championship final highlights. Curerad 2026-05-27 via refined query."
      }
    ]
  },
  {
    "id": "benjamin-ingrosso-dance-you-off",
    "displayName": "Dance You Off — Benjamin Ingrosso",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0s3P5PImfDZYWIseR3b39D",
    "youtubeClips": []
  },
  {
    "id": "drake-gods-plan",
    "displayName": "God's Plan — Drake",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "m1a_GqJf02M",
        "startSec": 0,
        "endSec": 199,
        "channelTitle": "Drake - Topic",
        "license": "standard"
      }
    ]
  },
  {
    "id": "emil-forsberg-vs-schweiz-vm-2018",
    "displayName": "Emil Forsbergs mål mot Schweiz åttondelsfinal",
    "correctYear": 2018,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "6jvU9naWHV0",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Sports Heroes",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "fuego-eleni-foureira",
    "displayName": "Fuego — Eleni Foureira",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "22ppznuzVF9LKamaaqMMqu",
    "youtubeClips": []
  },
  {
    "id": "lady-gaga-bradley-cooper-shallow",
    "displayName": "Shallow — Lady Gaga & Bradley Cooper",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "aU_bj9SxvdU",
        "startSec": 0,
        "endSec": 216,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "lil-nas-x-old-town-road",
    "displayName": "Old Town Road — Lil Nas X",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "netta-toy",
    "displayName": "Toy — Netta",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "arvingarna-i-do",
    "displayName": "I Do — Arvingarna",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
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
    "id": "dua-lipa-dont-start-now",
    "displayName": "Don't Start Now — Dua Lipa",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "john-lundvik-too-late-for-love",
    "displayName": "Too Late for Love — John Lundvik",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "lewis-capaldi-someone-you-loved",
    "displayName": "Someone You Loved — Lewis Capaldi",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "pRIZohFFOMo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Lewis Capaldi - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "nyper-mig-i-armen",
    "displayName": "Nyper mig i armen — Albin Lee Meldau & Per Gessle",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "spirit-in-the-sky-keiino",
    "displayName": "Spirit in the Sky — KEiiNO",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "0VjIjW4GlUZAMYd2vXMi3b",
    "youtubeClips": [
      {
        "videoId": "4NRXx6U8ABQ",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "TheWeekndVEVO",
        "license": "standard",
        "notes": "Officiell VEVO-musikvideo. Neon retro 80s-känsla."
      }
    ]
  },
  {
    "id": "bts-dynamite",
    "displayName": "Dynamite — BTS",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "4RcEx6TvICENelSh3O7gvu",
    "youtubeClips": []
  },
  {
    "id": "dua-lipa-levitating",
    "displayName": "Levitating — Dua Lipa",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "duplantis-stavhopp-vr-2020",
    "displayName": "Armand Duplantis sätter stavhopps-VR (6.17m)",
    "correctYear": 2020,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "aeKnFJS8orA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "World Athletics",
        "license": "standard",
        "notes": "World Athletics official channel — Duplantis 6.17m world record Toruń 2020. Curerad 2026-05-27 via refined query."
      }
    ]
  },
  {
    "id": "glass-animals-heat-waves",
    "displayName": "Heat Waves — Glass Animals",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "spotifyTrackId": "3USxtqRwSYz57Ewm6wWRMp",
    "youtubeClips": []
  },
  {
    "id": "harry-styles-watermelon-sugar",
    "displayName": "Watermelon Sugar — Harry Styles",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "the-mamas-move",
    "displayName": "Move — The Mamas",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
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
    "id": "el-diablo-elena-tsagkrinou",
    "displayName": "El Diablo — Elena Tsagkrinou",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "kid-laroi-justin-bieber-stay",
    "displayName": "Stay — The Kid LAROI & Justin Bieber",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "tusse-voices",
    "displayName": "Voices — Tusse",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "cornelia-jakobs-hold-me-closer",
    "displayName": "Hold Me Closer — Cornelia Jakobs",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "harry-styles-as-it-was",
    "displayName": "As It Was — Harry Styles",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
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
    "id": "taylor-swift-anti-hero",
    "displayName": "Anti-Hero — Taylor Swift",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "doja-cat-paint-the-town-red",
    "displayName": "Paint the Town Red — Doja Cat",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "frida-karlsson-vm-planica-2023",
    "displayName": "Frida Karlsson VM-medalj Planica",
    "correctYear": 2023,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "A8W64l14zCI",
        "startSec": 0,
        "endSec": 13,
        "channelTitle": "Nordic Skiing And Running Club",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — Frida Karlsson Tour de Ski 2023 first win, 13s clip."
      }
    ]
  },
  {
    "id": "loreen-tattoo",
    "displayName": "Tattoo — Loreen",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "miley-cyrus-flowers",
    "displayName": "Flowers — Miley Cyrus",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "iawgB2CDCrw",
        "startSec": 0,
        "endSec": 198,
        "channelTitle": "7clouds",
        "license": "standard"
      }
    ]
  },
  {
    "id": "billie-eilish-birds-of-a-feather",
    "displayName": "Birds of a Feather — Billie Eilish",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "WKZO-CWeOVA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Billie Eilish - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "europapa-joost-klein",
    "displayName": "Europapa — Joost Klein",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "unknown-region"
    ],
    "genrePackages": [
      "Eurovision"
    ],
    "spotifyTrackId": "0uHrMbMv3c78398pIANDqR",
    "youtubeClips": []
  },
  {
    "id": "lady-gaga-bruno-mars-die-with-a-smile",
    "displayName": "Die With a Smile — Lady Gaga & Bruno Mars",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "moregard-os-brons-paris-2024",
    "displayName": "Truls Möregård OS-brons bordtennis Paris",
    "correctYear": 2024,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "region": [
      "sweden"
    ],
    "youtubeClips": [
      {
        "videoId": "npkVrfT11zQ",
        "startSec": 80,
        "endSec": 110,
        "channelTitle": "Kanal 5 Sverige",
        "license": "standard",
        "notes": "Kanal 5 Sverige — Truls Möregårds OS-brons i bordtennis Paris 2024."
      }
    ]
  },
  {
    "id": "nemo-the-code",
    "displayName": "The Code — Nemo",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
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
    "id": "jj-wasted-love",
    "displayName": "Wasted Love — JJ",
    "correctYear": 2025,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
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
    "id": "dara-bangaranga",
    "displayName": "Bangaranga — DARA",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
    "id": "felicia-my-system",
    "displayName": "My System — Felicia",
    "correctYear": 2026,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
    ],
    "region": [
      "sweden"
    ],
    "genrePackages": [
      "Eurovision"
    ],
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
  }
];
