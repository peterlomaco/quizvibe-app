// MediaPlayer — dispatcher som väljer rätt provider-impl baserat på
// `source.kind`. Quiz-skärmen importerar bara `MediaPlayer` och `MediaPlayerProps`
// härifrån; provider-detaljerna (YouTube/Spotify/None) är opaka för call-site.

import React from 'react';
import { NoSourcePlayer } from './NoSourcePlayer';
import { SpotifyMediaPlayer } from './SpotifyMediaPlayer';
import type { MediaPlayerProps } from './types';
import { YouTubeMediaPlayer } from './YouTubeMediaPlayer';

export type { MediaPlayerProps } from './types';

export function MediaPlayer(props: MediaPlayerProps) {
  const { source, isPlaying, showVideo, isMuted = false } = props;

  switch (source.kind) {
    case 'youtube':
      return (
        <YouTubeMediaPlayer
          clip={source.clip}
          isPlaying={isPlaying}
          showVideo={showVideo}
          isMuted={isMuted}
        />
      );
    case 'spotify':
      return (
        <SpotifyMediaPlayer
          track={source.track}
          isPlaying={isPlaying}
          isMuted={isMuted}
        />
      );
    case 'none':
      return <NoSourcePlayer reason={source.reason} />;
  }
}
