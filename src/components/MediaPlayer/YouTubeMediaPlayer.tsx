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
// Video-frame:n är alltid synlig under uppspelning så användaren ser
// rörligt bildmaterial (showVideo-prop:n bevarad i API:t men no-op idag).
//
// Slutet av klippet: iframe:n körs UTAN `end`-cap → YouTube spelar
// videon i sin helhet (kan vara musik, filmscen, sporthändelse, etc).
// När YT firar state='ended' (eller manuellt finish från användaren)
// ersätter vi iframe:n med en QuizVibe-logga så ingen YouTube-branding
// visas på en idle player. YouTube-ToS: branding måste vara synlig
// UNDER uppspelning (iframe visar logo + bottom-bar); EFTER playback-end
// får appen ta över UI:t — vilket är vad vi gör.

import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { QuizVibeLogo } from '@/src/components/QuizVibeLogo';
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

// 220 (var 200) — YouTube-iframe:s bottenrow (share-knapp, YouTube-logo,
// "related video"-thumbnail som dyker upp vid pause) klipptes av kortets
// overflow:hidden vid 200. 220 ger bottenchrome:n breathing room utan att
// rubba 16:9-känslan för själva video-frame:n. Justera om bottom-rowen
// fortfarande ser kramad ut på enheter med annan DPR.
const PLAYER_HEIGHT = 220;
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
  // True när YouTube firar state='ended' (klippet är slut). Triggar
  // QuizVibe-logo-overlay som ersätter iframe:n så ingen YouTube-
  // branding visas på en idle player. Reset:as per clip-byte.
  const [hasEnded, setHasEnded] = useState(false);
  // D-iv: gatekeeper för mute+volume-postMessages. react-native-youtube-
  // iframe:s useEffect skickar player.mute()/setVolume() omedelbart vid
  // prop-ändring — om det sker INNAN onReady fyrat så finns ingen
  // YT-player-instans i WebView:n och kommandot tyst-fail:ar. Vi håller
  // därför mute=false + volume=100 (= "no-op") tills onReady, sedan
  // flippar till önskat värde så useEffect fires med player redo att
  // ta emot. Reset:as per clip-byte så ny iframe-mount börjar gated.
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Nunito_700Bold-fonten — matchar startskärmens appName-styling så
  // "QuizVibe"-texten under end-of-clip-loggan ser identisk ut med
  // brand-marken på Home. Fallback till systemfont under load (kort
  // flicker första gången fonten cachas).
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brandFont = fontsLoaded ? 'Nunito_700Bold' : undefined;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset vid clip-byte (nya videon → ny autoplay-attempt)
  useEffect(() => {
    setHasStartedPlayback(false);
    setShowTapPrompt(false);
    setIsPlayerReady(false);
    setHasEnded(false);
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
        setHasEnded(true);
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
          // `end` medvetet utelämnat — klippet (musik / filmscen /
          // sportklipp / etc) ska spela klart utan att klippas vid
          // svarstidens slut. Curerade endSec ignoreras i runtime;
          // behållen i datan för framtida flexibilitet.
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
      />
      {/* End-of-clip overlay — täcker iframe:n helt så ingen YouTube-
          branding (logo / pause-skärm / "more videos") visas på en idle
          player. Renderas EFTER playback ended (YouTube ToS: branding
          måste vara synlig UNDER playback; efter end får appen ta över).
          QuizVibe-loggan här matchar startskärmens brand-mark exakt. */}
      {hasEnded && (
        <View style={styles.endedOverlay} pointerEvents="none">
          <QuizVibeLogo size={140} />
          <Text style={[styles.endedBrandName, { fontFamily: brandFont }]}>
            QuizVibe
          </Text>
        </View>
      )}
      {/* Tap-hint visas om autoplay inte hunnit starta. Använder
          pointerEvents="none" så tap GENOM overlay:n når iframen direkt
          — iOS WebView kräver att user-gesture registreras på själva
          iframe-elementet (cross-origin gesture-policy). */}
      {showTapPrompt && !hasStartedPlayback && !hasEnded && (
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
  // Heltäckande end-of-clip overlay som ersätter iframe-frame:n när
  // playback ended. Bakgrunds-färg matchar mediakortets card-färg så
  // ingen YouTube-pixel "läcker" igenom. Centrerar QuizVibe-loggan +
  // "QuizVibe"-texten under den.
  endedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Identisk styling med startskärmens `appName` (app/index.tsx) så
  // brand-marken läses likadant överallt. Nunito_700Bold via brandFont-
  // prop:en på Text-elementet. marginTop är NEGATIV här (vs +8 på Home)
  // — QuizVibeLogo:s SVG har naturlig tom-yta i botten av viewBox:n som
  // vid size=140 motsvarar ~28 px, så +8 hade gett ~36 px synligt gap.
  // -16 drar texten tillbaka över viewBox-bottnen så visuell distans
  // till logga blir ~12 px. Tweaka empiriskt om annan storlek på loggan.
  endedBrandName: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: -Spacing.lg,
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
