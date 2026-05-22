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

export interface MusicQuestion {
  id: string;
  displayName: string;
  correctYear: number;
  contentSubject: 'song';
  questionText: string;
  audiences: MusicQuestionAudience[];
  youtubeClips: YoutubeClip[];
}

export const MUSIC_QUESTIONS: MusicQuestion[] = [
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
  }
];
