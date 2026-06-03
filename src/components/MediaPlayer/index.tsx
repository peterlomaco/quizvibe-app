// MediaPlayer — dispatcher som väljer rätt provider-impl baserat på
// `source.kind`. Quiz-skärmen importerar bara `MediaPlayer` och `MediaPlayerProps`
// härifrån; provider-detaljerna (YouTube/None) är opaka för call-site.

import React from 'react';
import { NoSourcePlayer } from './NoSourcePlayer';
import type { MediaPlayerProps } from './types';
import { YouTubeMediaPlayer } from './YouTubeMediaPlayer';

export type { MediaPlayerProps } from './types';

export function MediaPlayer(props: MediaPlayerProps) {
  const { source, isPlaying, showVideo, isMuted = false, onReady, onEnded, onError } = props;

  switch (source.kind) {
    case 'youtube':
      return (
        <YouTubeMediaPlayer
          clip={source.clip}
          isPlaying={isPlaying}
          showVideo={showVideo}
          isMuted={isMuted}
          onReady={onReady}
          onEnded={onEnded}
          onError={onError}
        />
      );
    case 'none':
      return <NoSourcePlayer reason={source.reason} />;
  }
}
