// Auto-generated music questions. Regenerate with:
//   cd backend && npm run export-music-questions
//
// Source: backend/content/catalog/songs-*.yaml

import type { YoutubeClip } from './mediaSource';

export interface MusicQuestion {
  id: string;
  displayName: string;
  correctYear: number;
  youtubeClips: YoutubeClip[];
}

export const MUSIC_QUESTIONS: MusicQuestion[] = [
  {
    "id": "dancing-queen",
    "displayName": "Dancing Queen — ABBA",
    "correctYear": 1976,
    "youtubeClips": [
      {
        "videoId": "YkLLcIKhJ64",
        "startSec": 30,
        "endSec": 45,
        "channelTitle": "ABBA - Topic",
        "license": "standard",
        "notes": "Refräng 'You can dance, you can jive...'"
      }
    ]
  },
  {
    "id": "thriller",
    "displayName": "Thriller — Michael Jackson",
    "correctYear": 1982,
    "youtubeClips": [
      {
        "videoId": "Z85lxckrtzg",
        "startSec": 60,
        "endSec": 75,
        "channelTitle": "Michael Jackson - Topic",
        "license": "standard",
        "notes": "Efter intro/Vincent Price-monolog, första vers"
      }
    ]
  },
  {
    "id": "smells-like-teen-spirit",
    "displayName": "Smells Like Teen Spirit — Nirvana",
    "correctYear": 1991,
    "youtubeClips": [
      {
        "videoId": "7TDeBi34OtE",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Nirvana - Topic",
        "license": "standard",
        "notes": "Ikonisk riff-intro"
      }
    ]
  },
  {
    "id": "baby-one-more-time",
    "displayName": "...Baby One More Time — Britney Spears",
    "correctYear": 1998,
    "youtubeClips": [
      {
        "videoId": "fEfvTTJNeAY",
        "startSec": 0,
        "endSec": 15,
        "channelTitle": "Britney Spears - Topic",
        "license": "standard",
        "notes": "'Oh baby baby' + första vers"
      }
    ]
  },
  {
    "id": "shape-of-you",
    "displayName": "Shape of You — Ed Sheeran",
    "correctYear": 2017,
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
