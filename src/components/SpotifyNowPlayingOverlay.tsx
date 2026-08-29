// ── FUTURE VERSION 2 — Automated API Flow (archived component) ──────────────────
// SpotifyNowPlayingOverlay visade albumomslag + play/pause-kontroller när DJ:n
// återvände från Spotify-appen. I V1-flödet öppnar DJ:n Spotify manuellt och
// gissarna aktiverar timern själva — denna overlay behövs ej. Behållen för V2
// när Web API play/pause-kontroll återaktiveras.
// ────────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import Svg, { Line, Polygon, Rect } from 'react-native-svg';
import { Colors, FontSize, Radius, Spacing } from '@/src/theme';
import { SpotifyBrandIcon } from '@/src/components/SpotifyBrandIcon';

const SPOTIFY_GREEN = '#1DB954';
const DISMISS_DELAY = 5;

interface Props {
  visible: boolean;
  trackName: string;
  artistName: string;
  albumArtUrl: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  /** Visa "Activate Timer"-knappen — bara true för den aktiva DJ:n. */
  canActivate?: boolean;
  onActivate: () => void;
  onDismiss: () => void;
  /** Tillåt att stänga overlayen — false tills svarstiden gått ut. */
  canDismiss?: boolean;
  /** Öppnar Spotify-appen direkt — fallback om Web API-kontroll inte fungerar. */
  onOpenSpotify?: () => void;
}

export function SpotifyNowPlayingOverlay({
  visible,
  trackName,
  artistName,
  albumArtUrl,
  isPlaying,
  onPlayPause,
  canActivate = false,
  onActivate,
  onDismiss,
  canDismiss = true,
  onOpenSpotify,
}: Props) {
  const slideAnim = useRef(new Animated.Value(240)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dismissPulse = useRef(new Animated.Value(1)).current;

  // null = countdown not started, 5→1 = counting, 0 = countdown done (X visible)
  const [dismissCountdown, setDismissCountdown] = useState<number | null>(null);

  const showDismiss = canDismiss && !isPlaying;
  const showDismissX = dismissCountdown === 0;
  const isCountingDown = dismissCountdown !== null && dismissCountdown > 0;

  // Start countdown when conditions first become true; reset when conditions break.
  useEffect(() => {
    if (showDismiss) {
      setDismissCountdown(DISMISS_DELAY);
    } else {
      setDismissCountdown(null);
    }
  }, [showDismiss]);

  // Tick countdown down by 1 each second until 0.
  useEffect(() => {
    if (dismissCountdown === null || dismissCountdown === 0) return;
    const t = setTimeout(
      () => setDismissCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev)),
      1000,
    );
    return () => clearTimeout(t);
  }, [dismissCountdown]);

  // Pulse only when X is actually shown.
  useEffect(() => {
    if (showDismissX) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dismissPulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(dismissPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      dismissPulse.setValue(1);
    }
  }, [showDismissX, dismissPulse]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 240, duration: 220, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
    >
      <View style={styles.card}>
        <View style={styles.artWrap}>
          {albumArtUrl ? (
            <Image source={{ uri: albumArtUrl }} style={styles.art} />
          ) : (
            <View style={[styles.art, styles.artFallback]}>
              <SpotifyBrandIcon size={24} variant="white" />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.trackName} numberOfLines={1}>{trackName}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{artistName}</Text>
        </View>
        {/* Play / Pause-knapp — döljs permanent när dismiss-X väl visats */}
        {!showDismissX && (
          <Pressable onPress={onPlayPause} style={styles.playPauseBtn} hitSlop={8}>
            {isPlaying ? (
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Rect x="5" y="4" width="7" height="20" rx="2" fill={Colors.textSecondary} />
                <Rect x="16" y="4" width="7" height="20" rx="2" fill={Colors.textSecondary} />
              </Svg>
            ) : (
              <Svg width={28} height={28} viewBox="0 0 28 28">
                <Polygon points="6,3 24,14 6,25" fill={Colors.textSecondary} />
              </Svg>
            )}
          </Pressable>
        )}
        {/* Dismiss-slot: visar nedräkning 5→1 innan X visas.
            hitSlop=0 — padding: Spacing.lg ger redan >56px tappyta.
            Utan hitSlop undviks överlapp med playPauseBtn:s hitSlop=8. */}
        <Pressable onPress={showDismissX ? onDismiss : undefined} style={styles.dismiss}>
          {isCountingDown ? (
            <Text style={styles.dismissCountdownText}>{dismissCountdown}</Text>
          ) : (
            <Animated.View
              style={[!showDismissX && styles.dismissGlyphHidden, { transform: [{ scale: dismissPulse }] }]}
            >
              <Svg width={36} height={36} viewBox="0 0 36 36">
                <Line x1="6" y1="6" x2="30" y2="30" stroke="#FF3B30" strokeWidth={5} strokeLinecap="round" />
                <Line x1="30" y1="6" x2="6" y2="30" stroke="#FF3B30" strokeWidth={5} strokeLinecap="round" />
              </Svg>
            </Animated.View>
          )}
        </Pressable>
      </View>
      {canActivate && (
        <Pressable style={styles.activateBtn} onPress={onActivate}>
          <Text style={styles.activateBtnText}>Activate Timer</Text>
        </Pressable>
      )}
      {showDismissX && onOpenSpotify && (
        <Pressable style={styles.openSpotify} onPress={onOpenSpotify} hitSlop={8}>
          <SpotifyBrandIcon size={13} variant="white" />
          <Text style={styles.openSpotifyText}> Open in Spotify to control music</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
    elevation: 90,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    backgroundColor: 'rgba(12, 20, 36, 0.97)',
    borderTopWidth: 1.5,
    borderTopColor: SPOTIFY_GREEN,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  artWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  art: {
    width: 56,
    height: 56,
  },
  artFallback: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  trackName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  artistName: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
  playPauseBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36 + Spacing.lg * 2,
  },
  dismissGlyphHidden: {
    opacity: 0,
  },
  dismissCountdownText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    width: 36,
    height: 36,
    textAlign: 'center',
    lineHeight: 36,
  },
  activateBtn: {
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activateBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  openSpotify: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  openSpotifyText: {
    color: SPOTIFY_GREEN,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
