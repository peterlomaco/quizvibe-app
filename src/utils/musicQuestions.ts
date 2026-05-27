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
        "videoId": "AeQlHNDB9no",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Culture Vaults",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "hae8bYKARr4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "3 Roads Communications",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "M3y0KbLvWLY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Buzz Stephens",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "pele-1958-world-cup",
    "displayName": "Pelé 17-årig vinner sin första VM",
    "correctYear": 1958,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "TYNsrKtV6Mc",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "FIFA",
        "license": "standard",
        "notes": "FIFA official channel — Pelé:s mål i Brasilien-Sverige-finalen 1958."
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
        "videoId": "MhOTUZbS2Fw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Magda0815007",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "g5W4k6vD2WY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Rolling Stones",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (13)."
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
        "videoId": "vbvyNnw8Qjg",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Live Aid",
        "license": "standard",
        "notes": "Live Aid 1985 — iconic Freddie Mercury-performance. Mid-song."
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
    "id": "eagles-hotel-california",
    "displayName": "Hotel California — Eagles",
    "correctYear": 1976,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "PNEv3koIeaE",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Mark Tandle",
        "license": "standard",
        "notes": "1994 Hell Freezes Over Acoustic Live — iconic 12-string intro."
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
        "videoId": "kb0S0oypx_o",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "BBC Music",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "x3SlTBOfMww",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Queen Official",
        "license": "standard",
        "notes": "Live at Montreal Forum 1981 (Remastered) — official Queen-kanal. Iconic bassline."
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
        "videoId": "QyI975M9FK4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "BBC Music",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "CauNjt2j-BM",
        "startSec": 40,
        "endSec": 55,
        "channelTitle": "New Michael Jackson",
        "license": "standard",
        "notes": "Motown 25 1983 performance — iconic moonwalk + era-defining."
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
        "videoId": "HyWajWueH2w",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "earMUSIC",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "XegYZ8y3xMY",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "FIFA",
        "license": "standard",
        "notes": "FIFA official channel — Maradona Top 5 Goals (Hand of God + Goal of the Century 1986)."
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
        "videoId": "UkpSWy67ClY",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "chambers of hourrors",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "p-YFR5uIrKk",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Phil Collins - Topic",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (100)."
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
        "videoId": "5KuGUP-C9Ko",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Late Late Show",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "GXRABWGZyJc",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Kingscup20",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
        "videoId": "mK4hweZRU0k",
        "startSec": 100,
        "endSec": 115,
        "channelTitle": "roelofjan1986",
        "license": "standard",
        "notes": "World Music Awards 1994 — iconic high-note chorus."
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
        "videoId": "Ve1EbKsNCdw",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "Oasis",
        "license": "standard",
        "notes": "Auto-curerad 2026-05-26 via batch-pick-clips. Top-scored kandidat (10)."
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
    "id": "iniesta-world-cup-final-goal-2010",
    "displayName": "Iniesta gör VM-finalmålet",
    "correctYear": 2010,
    "contentSubject": "sport-event",
    "questionText": "Which Year did this happen?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "3pCPQDxZzfY",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "FIFA",
        "license": "standard",
        "notes": "FIFA official channel — Iniesta's målgörande Spanien-Holland 2010 från alla vinklar."
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
        "videoId": "Orp4k_YkE5w",
        "startSec": 10,
        "endSec": 25,
        "channelTitle": "Avicii",
        "license": "standard",
        "notes": "Avicii Tribute Concert 2019 — Aloe Blacc-vokal. Intro/vers."
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
    "id": "weeknd-blinding-lights",
    "displayName": "Blinding Lights — The Weeknd",
    "correctYear": 2019,
    "contentSubject": "song",
    "questionText": "Which Year was this song released?",
    "audiences": [
      "all"
    ],
    "youtubeClips": [
      {
        "videoId": "sveiX_mA9A4",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "The Late Show with Stephen Colbert",
        "license": "standard",
        "notes": "Late Show 2019 TV-performance — synthwave-hook."
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
