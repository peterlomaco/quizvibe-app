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
  correctYear: number;
  contentSubject: YoutubeContentSubject;
  questionText: string;
  audiences: MusicQuestionAudience[];
  youtubeClips: YoutubeClip[];
}

export const MUSIC_QUESTIONS: MusicQuestion[] = [
  {
    "id": "louis-armstrong-body-and-soul",
    "displayName": "Body and Soul — Louis Armstrong",
    "correctYear": 1930,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "jSmIXHwQWBw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "THE HEHR ARCHIVE",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
    "youtubeClips": [
      {
        "videoId": "250MMq0fTrU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Juanjo de Goya",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
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
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "P1u2G16fq_Y",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Music Video Vault",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "bing-crosby-pennies-from-heaven",
    "displayName": "Pennies from Heaven — Bing Crosby",
    "correctYear": 1936,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "XXpUoL52a1w",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Richard Parker",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "duke-ellington-caravan",
    "displayName": "Caravan — Duke Ellington",
    "correctYear": 1937,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "cAeEhTD1xhU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Alain Corrieras",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "ella-fitzgerald-a-tisket-a-tasket",
    "displayName": "A-Tisket, A-Tasket — Ella Fitzgerald",
    "correctYear": 1938,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "ETbyLdCoJPw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Ella Fitzgerald - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
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
    "youtubeClips": [
      {
        "videoId": "XW5nIlIfR5s",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Judy Garland - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic — statisk album-art. Refrängområde."
      }
    ]
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
    "id": "glenn-miller-chattanooga-choo-choo",
    "displayName": "Chattanooga Choo Choo — Glenn Miller",
    "correctYear": 1941,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "QGZ6jigic_I",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Glenn Miller Orchestra - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "bing-crosby-white-christmas",
    "displayName": "White Christmas — Bing Crosby",
    "correctYear": 1942,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
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
    "id": "dooley-wilson-as-time-goes-by",
    "displayName": "As Time Goes By — Dooley Wilson",
    "correctYear": 1943,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "BumNgaR13o0",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "༺☆𝗧𝗛𝗘𝗙𝗜𝗬𝗢𝗨 𝗠𝗢𝗩𝗜𝗘𝗦☆༻",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
    "youtubeClips": [
      {
        "videoId": "NIDX18Xl16s",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "RPG Collection",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "johnnie-ray-cry",
    "displayName": "Cry — Johnnie Ray",
    "correctYear": 1951,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "8MgIO03OWy8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Classic Mood Experience",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "jo-stafford-you-belong-to-me",
    "displayName": "You Belong to Me — Jo Stafford",
    "correctYear": 1952,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "mJvwzZZkb4M",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Larry Hinze",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "patti-page-doggie-in-the-window",
    "displayName": "(How Much Is) That Doggie in the Window — Patti Page",
    "correctYear": 1953,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "qkCHxeWyeTA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "vintage video clips",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
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
    "audiences": [
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "RMkIK0qZnjw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Chuck Berry - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
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
    "audiences": [
      "elder"
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
    "id": "beatles-a-hard-days-night",
    "displayName": "A Hard Day's Night — The Beatles",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
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
    "id": "roy-orbison-oh-pretty-woman",
    "displayName": "Oh, Pretty Woman — Roy Orbison",
    "correctYear": 1964,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "elder"
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
    "id": "the-doors-light-my-fire",
    "displayName": "Light My Fire — The Doors",
    "correctYear": 1967,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "elton-john-your-song",
    "displayName": "Your Song — Elton John",
    "correctYear": 1970,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "bill-withers-lean-on-me",
    "displayName": "Lean on Me — Bill Withers",
    "correctYear": 1972,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "dolly-parton-jolene",
    "displayName": "Jolene — Dolly Parton",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "roberta-flack-killing-me-softly",
    "displayName": "Killing Me Softly with His Song — Roberta Flack",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "rolling-stones-angie",
    "displayName": "Angie — The Rolling Stones",
    "correctYear": 1973,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "abba-waterloo",
    "displayName": "Waterloo — ABBA",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
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
    "id": "lynyrd-skynyrd-sweet-home-alabama",
    "displayName": "Sweet Home Alabama — Lynyrd Skynyrd",
    "correctYear": 1974,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "bruce-springsteen-born-to-run",
    "displayName": "Born to Run — Bruce Springsteen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "led-zeppelin-kashmir",
    "displayName": "Kashmir — Led Zeppelin",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "id": "queen-bohemian-rhapsody",
    "displayName": "Bohemian Rhapsody — Queen",
    "correctYear": 1975,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "XHrdsx8izBs",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Queen - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
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
    "id": "dancing-queen",
    "displayName": "Dancing Queen — ABBA",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
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
    "id": "nadia-comaneci-montreal-1976",
    "displayName": "Nadia Comăneci perfekta 10:or i Montreal",
    "correctYear": 1976,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "queen-we-are-the-champions",
    "displayName": "We Are the Champions — Queen",
    "correctYear": 1977,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "vZ734NWnAHA",
        "startSec": 0,
        "endSec": 15,
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "aOpnnrS4ags",
        "startSec": 20,
        "endSec": 35,
        "channelTitle": "Frankie Valli and the Four Seasons",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — Grease-titelmelodin (Frankie Valli, TOTP 1978). Officiell artist-kanal."
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
    "id": "pink-floyd-another-brick-in-the-wall",
    "displayName": "Another Brick in the Wall, Part 2 — Pink Floyd",
    "correctYear": 1979,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-x",
      "elder"
    ],
    "youtubeClips": [
      {
        "videoId": "A6iqfDrQ0_o",
        "startSec": 45,
        "endSec": 60,
        "channelTitle": "PINK FLOYD - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. 'We don't need no education'-vers."
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
    "id": "miracle-on-ice-1980",
    "displayName": "Miracle on Ice — USA besegrar Sovjet",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "stenmark-os-guld-slalom-1980",
    "displayName": "Stenmark OS-guld slalom Lake Placid",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "wassberg-os-guld-1980",
    "displayName": "Thomas Wassberg OS-guld 15 km Lake Placid",
    "correctYear": 1980,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "ZQEBtR2pDXY",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Nostalgi",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "chariots-of-fire-1981",
    "displayName": "Chariots of Fire",
    "correctYear": 1981,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "odtqtlhsv4E",
        "startSec": 21,
        "endSec": 36,
        "channelTitle": "Rotten Tomatoes Classic Trailers",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (13)."
      }
    ]
  },
  {
    "id": "indiana-jones-raiders",
    "displayName": "Indiana Jones: Raiders of the Lost Ark",
    "correctYear": 1981,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "0xQSIdSRlAk",
        "startSec": 5,
        "endSec": 20,
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
    "id": "soft-cell-tainted-love",
    "displayName": "Tainted Love — Soft Cell",
    "correctYear": 1981,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "youtubeClips": [
      {
        "videoId": "EWZxFSo-XZY",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Soft Cell - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-29 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "e-t-the-extra-terrestrial",
    "displayName": "E.T. the Extra-Terrestrial",
    "correctYear": 1982,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "survivor-eye-of-the-tiger",
    "displayName": "Eye of the Tiger — Survivor",
    "correctYear": 1982,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "cyndi-lauper-girls-just-want-to-have-fun",
    "displayName": "Girls Just Want to Have Fun — Cyndi Lauper",
    "correctYear": 1983,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "carl-lewis-los-angeles-1984",
    "displayName": "Carl Lewis tar 4 OS-guld Los Angeles",
    "correctYear": 1984,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "madonna-like-a-virgin",
    "displayName": "Like a Virgin — Madonna",
    "correctYear": 1984,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "the-terminator-1984",
    "displayName": "The Terminator",
    "correctYear": 1984,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "T_WSXXPQYeY",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Universal Pictures",
        "license": "standard",
        "notes": "Official Universal Pictures-klipp — Johnny B. Goode-scenen."
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
    "youtubeClips": [
      {
        "videoId": "-ccNkksrfls",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Third-party upload",
        "license": "standard",
        "notes": "Ersatte 2026-05-27 FIFA-officiellt klipp (XegYZ8y3xMY) som blockerats för embed. Tredjepartsuppladdning — re-validera periodiskt mot DMCA-takedown via youtube-validate."
      }
    ]
  },
  {
    "id": "top-gun",
    "displayName": "Top Gun",
    "correctYear": 1986,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "guns-n-roses-sweet-child-o-mine",
    "displayName": "Sweet Child O' Mine — Guns N' Roses",
    "correctYear": 1987,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "youtubeClips": [
      {
        "videoId": "oMfMUfgjiLg",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Guns N' Roses - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Iconic guitar-intro."
      }
    ]
  },
  {
    "id": "patrik-sjoberg-vr-hojdhopp-1987",
    "displayName": "Patrik Sjöberg sätter VR i höjdhopp",
    "correctYear": 1987,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "ASymMBD6ReM",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Carl King Lewis",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — Sjöbergs VR 2.42m på DN Galan Stockholm 1987-06-30."
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
    "id": "roxette-listen-to-your-heart",
    "displayName": "Listen to Your Heart — Roxette",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
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
    "id": "tracy-chapman-fast-car",
    "displayName": "Fast Car — Tracy Chapman",
    "correctYear": 1988,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "field-of-dreams-1989",
    "displayName": "Field of Dreams",
    "correctYear": 1989,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "madonna-like-a-prayer",
    "displayName": "Like a Prayer — Madonna",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "youtubeClips": [
      {
        "videoId": "IaHQYTm14Kc",
        "startSec": 45,
        "endSec": 60,
        "channelTitle": "Madonna - Topic",
        "license": "standard",
        "notes": "Officiell album-audio via YouTube Topic. Refrängområde."
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
    "id": "roxette-the-look",
    "displayName": "The Look — Roxette",
    "correctYear": 1989,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
    "youtubeClips": [
      {
        "videoId": "2-IId2Fx43Y",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Roxette - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "stenmark-86-segrar-1989",
    "displayName": "Stenmarks 86:e (sista) världscupseger",
    "correctYear": 1989,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "LmSPZ-MHD8s",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Jon Ahlsén",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — 'Stenmark: Decade of Dominance' compilation (20 min). Third-party — replace med dedikerat 86:e-seger-klipp om sådant hittas."
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
    "id": "sinead-oconnor-nothing-compares-2-u",
    "displayName": "Nothing Compares 2 U — Sinéad O'Connor",
    "correctYear": 1990,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "bryan-adams-everything-i-do",
    "displayName": "(Everything I Do) I Do It for You — Bryan Adams",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "metallica-enter-sandman",
    "displayName": "Enter Sandman — Metallica",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "youtubeClips": [
      {
        "videoId": "m-y_IxPcx8U",
        "startSec": 30,
        "endSec": 45,
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
    "id": "smells-like-teen-spirit",
    "displayName": "Smells Like Teen Spirit — Nirvana",
    "correctYear": 1991,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
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
    "id": "boyz-ii-men-end-of-the-road",
    "displayName": "End of the Road — Boyz II Men",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "nirvana-come-as-you-are",
    "displayName": "Come as You Are — Nirvana",
    "correctYear": 1992,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "sverige-em-1992-semifinal",
    "displayName": "Sverige semifinal hemma-EM mot Tyskland",
    "correctYear": 1992,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "cool-runnings-1993",
    "displayName": "Cool Runnings",
    "correctYear": 1993,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "whitney-houston-i-will-always-love-you",
    "displayName": "I Will Always Love You — Whitney Houston",
    "correctYear": 1993,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "pulp-fiction",
    "displayName": "Pulp Fiction",
    "correctYear": 1994,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "youtubeClips": [
      {
        "videoId": "fYnJZh5ZHIA",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Rednex - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "sverige-vm-94-brons-bulgarien",
    "displayName": "Sverige VM-brons mot Bulgarien",
    "correctYear": 1994,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "EcE842FxpQk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Football Flashback 6",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "coolio-gangstas-paradise",
    "displayName": "Gangsta's Paradise — Coolio",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "oasis-wonderwall",
    "displayName": "Wonderwall — Oasis",
    "correctYear": 1995,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "cardigans-lovefool",
    "displayName": "Lovefool — The Cardigans",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
    ],
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
    "id": "kent-music-non-stop",
    "displayName": "Music Non Stop — Kent",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "los-del-rio-macarena",
    "displayName": "Macarena — Los del Río",
    "correctYear": 1996,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "millennials",
      "gen-x"
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
    "id": "celine-dion-my-heart-will-go-on",
    "displayName": "My Heart Will Go On — Celine Dion",
    "correctYear": 1997,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
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
    "id": "titanic",
    "displayName": "Titanic",
    "correctYear": 1997,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "jordan-last-shot-1998",
    "displayName": "Michael Jordans 'Last Shot' i NBA-finalen",
    "correctYear": 1998,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "eiffel-65-blue",
    "displayName": "Blue (Da Ba Dee) — Eiffel 65",
    "correctYear": 1999,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "the-matrix",
    "displayName": "The Matrix",
    "correctYear": 1999,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "bon-jovi-its-my-life",
    "displayName": "It's My Life — Bon Jovi",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "gDbltV8z7dQ",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Paramount Movies",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell Paramount-klipp 'My name is Maximus' (2000-filmen, ej Gladiator II)."
      }
    ]
  },
  {
    "id": "hakan-hellstrom-kann-ingen-sorg",
    "displayName": "Känn ingen sorg för mig Göteborg — Håkan Hellström",
    "correctYear": 2000,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "youtubeClips": [
      {
        "videoId": "jm5GHefyJp8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Håkan Hellström - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
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
    "id": "harry-potter-philosophers-stone-2001",
    "displayName": "Harry Potter and the Philosopher's Stone",
    "correctYear": 2001,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "avril-lavigne-complicated",
    "displayName": "Complicated — Avril Lavigne",
    "correctYear": 2002,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "sorenstam-kraft-nabisco-2002",
    "displayName": "Annika Sörenstam vinner Kraft Nabisco",
    "correctYear": 2002,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "vjB0zk5P2SA",
        "startSec": 6600,
        "endSec": 6615,
        "channelTitle": "LPGA",
        "license": "standard",
        "notes": "LPGA official full final round replay (119 min) — start ~110 min in vid playoff mot Liselotte Neumann. Curerad 2026-05-27 via refined query. Replace med dedikerat highlight-klipp om sådant hittas."
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
    "id": "beyonce-crazy-in-love",
    "displayName": "Crazy in Love — Beyoncé",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "youtubeClips": [
      {
        "videoId": "KmJI1JqF-dU",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Beyoncé - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
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
    "id": "white-stripes-seven-nation-army",
    "displayName": "Seven Nation Army — The White Stripes",
    "correctYear": 2003,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "carolina-kluft-os-guld-2004",
    "displayName": "Carolina Klüft OS-guld sjukamp Aten",
    "correctYear": 2004,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "DvbQ1mXFPCo",
        "startSec": 16,
        "endSec": 31,
        "channelTitle": "Expressen",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
      }
    ]
  },
  {
    "id": "christian-olsson-tresteg-2004",
    "displayName": "Christian Olsson OS-guld tresteg Aten",
    "correctYear": 2004,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "6zEKGJenFhY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Biketommy999",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "million-dollar-baby-2004",
    "displayName": "Million Dollar Baby",
    "correctYear": 2004,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "stefan-holm-os-guld-2004",
    "displayName": "Stefan Holm OS-guld höjdhopp Aten",
    "correctYear": 2004,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "madonna-hung-up",
    "displayName": "Hung Up — Madonna",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "timbuktu-alla-vill-till-himlen",
    "displayName": "Alla vill till himlen — Timbuktu",
    "correctYear": 2005,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "anja-parson-os-guld-slalom-2006",
    "displayName": "Anja Pärson OS-guld slalom Torino",
    "correctYear": 2006,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "-JcJcrFEAjw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Biketommy999",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "shakira-hips-dont-lie",
    "displayName": "Hips Don't Lie — Shakira",
    "correctYear": 2006,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "rihanna-umbrella",
    "displayName": "Umbrella — Rihanna",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "timbaland-onerepublic-apologize",
    "displayName": "Apologize — Timbaland & OneRepublic",
    "correctYear": 2007,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "youtubeClips": [
      {
        "videoId": "xTjwTbnX_EA",
        "startSec": 0,
        "endSec": 186,
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
    "id": "coldplay-viva-la-vida",
    "displayName": "Viva la Vida — Coldplay",
    "correctYear": 2008,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "federer-nadal-wimbledon-2008",
    "displayName": "Federer-Nadal Wimbledon-final ('greatest match')",
    "correctYear": 2008,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "avatar",
    "displayName": "Avatar",
    "correctYear": 2009,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "lady-gaga-bad-romance",
    "displayName": "Bad Romance — Lady Gaga",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "mando-diao-dance-with-somebody",
    "displayName": "Dance with Somebody — Mando Diao",
    "correctYear": 2009,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
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
    "id": "bruno-mars-just-the-way-you-are",
    "displayName": "Just the Way You Are — Bruno Mars",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
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
    "id": "katy-perry-firework",
    "displayName": "Firework — Katy Perry",
    "correctYear": 2010,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
    "youtubeClips": [
      {
        "videoId": "lmHSLBnzB0M",
        "startSec": 5,
        "endSec": 20,
        "channelTitle": "Katy Perry - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
  },
  {
    "id": "marcus-hellner-os-guld-2010",
    "displayName": "Marcus Hellner OS-guld jaktstart Vancouver",
    "correctYear": 2010,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "cu9buHVFPfo",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Johann Mühlegg",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "youtubeClips": [
      {
        "videoId": "xvI7C9I_U2U",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Robyn - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
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
    "id": "adele-someone-like-you",
    "displayName": "Someone Like You — Adele",
    "correctYear": 2011,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
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
    "youtubeClips": [
      {
        "videoId": "yMsKK0zNT_4",
        "startSec": 0,
        "endSec": 203,
        "channelTitle": "Kontor.TV",
        "license": "standard"
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
    "youtubeClips": [
      {
        "videoId": "8UVNT4wvIGY",
        "startSec": 30,
        "endSec": 45,
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
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "loreen-euphoria",
    "displayName": "Euphoria — Loreen",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
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
    "id": "swedish-house-mafia-dont-you-worry-child",
    "displayName": "Don't You Worry Child — Swedish House Mafia",
    "correctYear": 2012,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-z",
      "millennials"
    ],
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
    "youtubeClips": [
      {
        "videoId": "RM_5tJncHww",
        "startSec": 19,
        "endSec": 34,
        "channelTitle": "GOAL",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "hakan-hellstrom-aldrig-over",
    "displayName": "Det kommer aldrig va över för mig — Håkan Hellström",
    "correctYear": 2013,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "johan-olsson-vm-50km-2013",
    "displayName": "Johan Olsson VM-guld 50 km Val di Fiemme",
    "correctYear": 2013,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "cX3k5BdCc6k",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "VMValdifiemme2013",
        "license": "standard",
        "notes": "Refined query 2026-05-27 — 'AMAZING Johan Olsson Men's 50 Km Val di Fiemme 2013'."
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
    "youtubeClips": [
      {
        "videoId": "SQ-iwsVHbH8",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Tove Lo - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
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
    "id": "taylor-swift-shake-it-off",
    "displayName": "Shake It Off — Taylor Swift",
    "correctYear": 2014,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "youtubeClips": [
      {
        "videoId": "YQHsXMglC9A",
        "startSec": 0,
        "endSec": 367,
        "channelTitle": "Adele",
        "license": "standard"
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
    "id": "chainsmokers-closer",
    "displayName": "Closer — The Chainsmokers",
    "correctYear": 2016,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "leicester-premier-league-2016",
    "displayName": "Leicester City vinner Premier League",
    "correctYear": 2016,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "id": "sarah-sjostrom-os-guld-rio-2016",
    "displayName": "Sarah Sjöström OS-guld 100m fjäril Rio",
    "correctYear": 2016,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "KIurOF8zYJc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Nyhetsmorgon",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-27 via batch-pick-clips. Top-scored kandidat (10)."
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
    "youtubeClips": [
      {
        "videoId": "HbzZPpWr4MI",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Sia - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic."
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
    "id": "borg-vs-mcenroe-2017",
    "displayName": "Borg vs McEnroe",
    "correctYear": 2017,
    "contentSubject": "movie",
    "questionText": "Which Year was this Movie launched?",
    "audiences": [
      "all"
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
    "id": "federer-australian-open-2017",
    "displayName": "Federers comeback-vinst Australian Open",
    "correctYear": 2017,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
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
    "youtubeClips": [
      {
        "videoId": "3uSfERhxvlg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Imagine Dragons - Topic",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — officiell album-audio via YouTube Topic (ej barnkör-cover)."
      }
    ]
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
    "id": "shape-of-you",
    "displayName": "Shape of You — Ed Sheeran",
    "correctYear": 2017,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
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
    "id": "drake-gods-plan",
    "displayName": "God's Plan — Drake",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "lady-gaga-bradley-cooper-shallow",
    "displayName": "Shallow — Lady Gaga & Bradley Cooper",
    "correctYear": 2018,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "billie-eilish-bad-guy",
    "displayName": "Bad Guy — Billie Eilish",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "lewis-capaldi-someone-you-loved",
    "displayName": "Someone You Loved — Lewis Capaldi",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "tones-and-i-dance-monkey",
    "displayName": "Dance Monkey — Tones and I",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "bts-dynamite",
    "displayName": "Dynamite — BTS",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "dua-lipa-levitating",
    "displayName": "Levitating — Dua Lipa",
    "correctYear": 2020,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "youtubeClips": [
      {
        "videoId": "pzeefqfSMjY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Glass Animals - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-31 via batch-pick-clips. Top-scored kandidat (100)."
      }
    ]
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
    "id": "kid-laroi-justin-bieber-stay",
    "displayName": "Stay — The Kid LAROI & Justin Bieber",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "olivia-rodrigo-drivers-license",
    "displayName": "Drivers License — Olivia Rodrigo",
    "correctYear": 2021,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "harry-styles-as-it-was",
    "displayName": "As It Was — Harry Styles",
    "correctYear": 2022,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "messi-world-cup-2022",
    "displayName": "Messi och Argentina vinner VM i Qatar",
    "correctYear": 2022,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "otlAmUJ5wfw",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "cfcfootball",
        "license": "standard",
        "notes": "Curerad 2026-05-29 — Messis reaktion på VM-vinsten 2022 (FIFA-officiella var blockerade)."
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
    "id": "miley-cyrus-flowers",
    "displayName": "Flowers — Miley Cyrus",
    "correctYear": 2023,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "lady-gaga-bruno-mars-die-with-a-smile",
    "displayName": "Die With a Smile — Lady Gaga & Bruno Mars",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "id": "rose-bruno-mars-apt",
    "displayName": "APT. — ROSÉ & Bruno Mars",
    "correctYear": 2024,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "gen-alpha",
      "gen-z"
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
    "youtubeClips": [
      {
        "videoId": "YnguM4ED3bw",
        "startSec": 0,
        "endSec": 171,
        "channelTitle": "7cloudsnation",
        "license": "standard"
      }
    ]
  }
];
