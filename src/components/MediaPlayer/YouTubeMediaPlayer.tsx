// YouTube-provider — riktig WebView-baserad uppspelning via
// react-native-youtube-iframe. Kräver development build (native module via
// react-native-webview).
//
// iOS-autoplay: iOS WebView blockar play()-postMessage från cross-origin
// YouTube-iframe utanför user-gesture-context. Vi gör två försök:
//
//   1. Optimistisk autoplay vid mount (autoplay=1 i iframe-URL via
//      patched node_modules/react-native-youtube-iframe/src/PlayerScripts.js).
//      Funkar om iOS WebView är permissivt, t.ex. när användaren nyss
//      interagerade med appen och gesture-context fortfarande lever.
//
//   2. Fallback: om uppspelning inte startat inom AUTOPLAY_TIMEOUT_MS
//      visas en tappable overlay "Tap to start music". Tap togglar
//      `play`-prop:n via internal state vilket dispatchar ny play()-
//      postMessage INOM gesture-context → iOS accepterar.
//
// Layout: iframe renderas alltid i full storlek så uppspelning inte avbryts.
// När `showVideo === false` täcks frame:n av en svart audio-overlay.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import type { YoutubeClip } from '@/src/utils/mediaSource';

interface Props {
  clip: YoutubeClip;
  isPlaying: boolean;
  showVideo: boolean;
  /** D-iv: mute ljudet utan att pausa. Drivs av host:s per-spelare audio-
   *  overrides i Individual Devices. Default false. */
  isMuted?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

const PLAYER_HEIGHT = 200;
// Hur länge vi väntar på att autoplay ska starta innan vi visar tap-prompt.
// För kort = prompt blinkar onödigt på iOS-versioner som tillåter autoplay.
// För långt = användare som behöver tappa väntar för länge.
const AUTOPLAY_TIMEOUT_MS = 1500;

export function YouTubeMediaPlayer({
  clip,
  isPlaying,
  showVideo,
  isMuted = false,
  onReady,
  onEnded,
  onError,
}: Props) {
  // Spårar om uppspelning kommit igång (state === 'playing'). När true
  // släpper vi tap-prompt-fallback:en eftersom autoplay lyckades.
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  // Driver tap-prompt-rendering. Sätts true av timeout om autoplay inte
  // hunnit starta inom AUTOPLAY_TIMEOUT_MS efter mount.
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  // D-iv: gatekeeper för mute+volume-postMessages. react-native-youtube-
  // iframe:s useEffect skickar player.mute()/setVolume() omedelbart vid
  // prop-ändring — om det sker INNAN onReady fyrat så finns ingen
  // YT-player-instans i WebView:n och kommandot tyst-fail:ar. Vi håller
  // därför mute=false + volume=100 (= "no-op") tills onReady, sedan
  // flippar till önskat värde så useEffect fires med player redo att
  // ta emot. Reset:as per clip-byte så ny iframe-mount börjar gated.
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset vid clip-byte (nya videon → ny autoplay-attempt)
  useEffect(() => {
    setHasStartedPlayback(false);
    setShowTapPrompt(false);
    setIsPlayerReady(false);
  }, [clip.videoId]);

  // Schemalägg tap-prompt om autoplay inte startat
  useEffect(() => {
    if (!isPlaying || hasStartedPlayback) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    timeoutRef.current = setTimeout(() => {
      if (!hasStartedPlayback) {
        setShowTapPrompt(true);
      }
    }, AUTOPLAY_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, hasStartedPlayback, clip.videoId]);

  const handleStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') {
        setHasStartedPlayback(true);
        setShowTapPrompt(false);
      }
      if (state === 'ended') {
        onEnded?.();
      }
    },
    [onEnded],
  );

  const handleReady = useCallback(() => {
    // D-iv: flagga player som redo så mute/volume-prop:arna släpps från
    // false/100-låsningen till deras "riktiga" värden. Lib:ns useEffect
    // för mute+volume firear då med player.mute()/setVolume()-postMessage
    // som faktiskt landar i en initialiserad iframe.
    setIsPlayerReady(true);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback(
    (err: string) => {
      onError?.(new Error(`YouTube embed error: ${err}`));
    },
    [onError],
  );

  return (
    <View style={styles.card}>
      <YoutubePlayer
        // key tvingar full remount vid ny clip så `initialPlayerParams.start/end`
        // appliceras igen — annars håller iframe:n kvar förra frågans start-tid.
        key={clip.videoId}
        height={PLAYER_HEIGHT}
        play={isPlaying}
        // D-iv: dubbel tystnad gated på isPlayerReady så postMessage:en
        // inte tappas innan YT.Player-instansen existerar i WebView:n.
        // Före onReady: mute=false, volume=100 (no-op). Efter onReady:
        // flip till riktigt värde → lib:ns useEffect ser ändring → skickar
        // player.mute()/setVolume() i ETT initialiserat fönster. Reaktiv
        // efter den initiala gaten så host:s toggle mid-question fortfarande
        // propagerar direkt.
        mute={isPlayerReady ? isMuted : false}
        volume={isPlayerReady ? (isMuted ? 0 : 100) : 100}
        videoId={clip.videoId}
        onChangeState={handleStateChange}
        onReady={handleReady}
        onError={handleError}
        forceAndroidAutoplay
        initialPlayerParams={{
          controls: false,
          rel: false,
          start: clip.startSec,
          end: clip.endSec,
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
      />
      {/* Music-playing-overlay visas BARA efter att uppspelning faktiskt
          startat. Före dess är iframen synlig så användaren kan tappa
          YouTube-play-knappen direkt om autoplay misslyckats. */}
      {!showVideo && hasStartedPlayback && (
        <View style={styles.audioOverlay} pointerEvents="none">
          <Text style={styles.audioIcon}>🎵</Text>
          <Text style={styles.audioLabel}>Music playing...</Text>
          <Text style={styles.clipMeta}>
            {clip.startSec}s – {clip.endSec}s clip
          </Text>
        </View>
      )}
      {/* Tap-hint visas om autoplay inte hunnit starta. Använder
          pointerEvents="none" så tap GENOM overlay:n når iframen direkt
          — iOS WebView kräver att user-gesture registreras på själva
          iframe-elementet (cross-origin gesture-policy). */}
      {showTapPrompt && !hasStartedPlayback && (
        <View style={styles.tapPromptOverlay} pointerEvents="none">
          <Text style={styles.tapPromptHint}>👆 Tap the play button</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: PLAYER_HEIGHT,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  audioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  audioIcon: {
    fontSize: 40,
  },
  audioLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  clipMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  // Bara visuell hint — pointerEvents="none" så taps når iframen under.
  // Lägg ej position absolute som täcker hela frame:n för att inte skymma
  // YouTube-play-knappen som användaren ska tappa.
  tapPromptOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapPromptHint: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
});
