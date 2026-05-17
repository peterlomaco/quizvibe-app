// Spotify-provider — placeholder. Full impl väntar på Spotify-integrationen
// (separat initiative efter Phase 4). Renderas bara om pickMediaSource
// returnerar `kind: 'spotify'` — i nuvarande build sker det aldrig eftersom
// inga frågor har spotifyTracks-data och Spotify-toggeln är off i mock-state.
//
// Behålls i dispatcher-koden så strukturen är bevisat extensible och
// Spotify-källan inte kräver MediaPlayer-refaktor när impl:n kommer in.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import type { SpotifyTrack } from '@/src/utils/mediaSource';

interface Props {
  track: SpotifyTrack;
  isPlaying: boolean;
  /** D-iv: mute-flagga. Placeholdern ignorerar den; SDK-impl:n kommer
   *  använda den när D-viii landar. */
  isMuted?: boolean;
}

export function SpotifyMediaPlayer({ track, isPlaying, isMuted: _isMuted = false }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>🎧</Text>
      <Text style={styles.label}>Spotify provider</Text>
      <Text style={styles.uri} numberOfLines={1} ellipsizeMode="tail">
        {track.trackUri}
      </Text>
      <Text style={styles.devNote}>
        {isPlaying ? '▶' : '⏸'} Spotify integration coming
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  icon: { fontSize: 48 },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  uri: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: 'monospace' as never,
  },
  devNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
