import { ConnectionUnstableOverlay } from '@/src/components/ConnectionUnstableOverlay';
import { CountdownIntro } from '@/src/components/CountdownIntro';
import { GetReadyIntro, type QuestionMediaType } from '@/src/components/GetReadyIntro';
import { ActorSelectBlock } from '@/src/components/ActorSelectBlock';
import { ImageAnswerBlock } from '@/src/components/ImageAnswerBlock';
import { InactivityCountdownBanner } from '@/src/components/InactivityCountdownBanner';
import { MediaPlayer } from '@/src/components/MediaPlayer';
import {
  generateOpponentRoundScore,
  generateOpponentTimeUsed,
  MOCK_OPPONENT_HCP_BEFORE,
  MOCK_OPPONENTS,
  RoundLeaderboard,
  type HcpChange,
  type LeaderboardPlayer,
  type RoundScore,
} from '@/src/components/RoundLeaderboard';
import { SequentialDots } from '@/src/components/SequentialDots';
import FinalCelebration from '@/src/components/FinalCelebration';
import { RemoteMatchResultPanel } from '@/src/components/RemoteMatchResultPanel';
import { StopwatchIcon } from '@/src/components/StopwatchIcon';
import { useConnectionStatus } from '@/src/lib/network/connectionMonitor';
import { subscribeSyncChannel, type SyncChannel, type PlayerScoreRecordedPayload, type QuestionAdvancePayload } from '@/src/lib/realtime/syncChannel';
import type { LobbyPlayer } from '@/src/screens/LobbyScreen';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { track } from '@/src/utils/analytics';
import { getAvatarEmojiById } from '@/src/utils/avatars';
import { clearEjected } from '@/src/utils/ejectedPlayers';
import { appendGameHistoryEntry, saveLatestResult, type GameResult, type HistoryEntry, type RoundResult } from '@/src/utils/gameResults';
import {
  finalizePlayer,
  forfeitRemoteMatch,
  formatPlayerLabel,
  getMatch,
  getMyAnswers,
  getOwnUserId,
  subscribeToMatch,
  type RemoteMatchPlayer,
  persistQuestionSequence,
  upsertAnswer,
} from '@/src/utils/remoteMatches';
import { clearLeftPlayers } from '@/src/utils/leftPlayers';
import { pickMediaSource, type YoutubeClip } from '@/src/utils/mediaSource';
import {
  QUIZ_IMAGE_CARD_H,
  QUIZ_MEDIA_H,
  qf,
  qh,
} from '@/src/utils/quizLayout';
import { deactivateRoom, registerActiveRoom } from '@/src/utils/mockActiveRooms';
import { clearLobbyPlayers, setLobbyPlayers } from '@/src/utils/mockLobbyPlayers';
import {
  clearLobbySettings,
  getLobbySettings,
  getPlayerAudioOverrides,
  setLobbySettings,
  setPlayerAudioOverride,
  type PlayerAudioOverrides,
} from '@/src/utils/mockLobbySettings';
import { buildAudienceSet, filterByAudience } from '@/src/utils/audienceFilter';
import { isMainCategory, subjectToMainCategory, itemMatchesEnabledCategories, type MainCategory } from '@/src/utils/mainCategory';
import { buildMatchHighlights } from '@/src/utils/matchHighlights';
import { clearGameStarted } from '@/src/utils/mockStartedGames';
import { MUSIC_QUESTIONS } from '@/src/utils/musicQuestions';
import {
  computeDJRotationPlan,
  getDJForQuestionIndex,
  openSpotifyTrack,
  openSpotifyApp,
  type DJRotationPlan,
  type SpotifyDJPlayer,
} from '@/src/utils/spotifyDJ';
import { QuizVibeLogo } from '@/src/components/QuizVibeLogo';
import { SpotifyBrandIcon } from '@/src/components/SpotifyBrandIcon';
import { getSpotifyArtistMeta, type SpotifyArtistMeta } from '@/src/utils/spotifyArtistMeta';
import { SPOTIFY_ALBUM_CONTEXT } from '@/src/utils/spotifyAlbumContext';
import { savePendingLobbyPlayers } from '@/src/utils/pendingLobby';
import { generatePlayerName } from '@/src/utils/playerName';
import { loadProfile, type ProfileData } from '@/src/utils/profileStorage';
import { recordQuestionAnswer } from '@/src/utils/questionStats';
import {
  IMAGE_QUIZ_QUESTIONS,
  DISTRACTOR_POOL_NAMES,
  type ImageQuestionAudience,
  type ImageNameOption,
  type ImageQuestionVariant,
  type ImageQuizQuestion,
} from '@/src/utils/quizImageQuestions';
import { buildImageVariant } from '@/src/utils/imageQuestionBuilder';
import { createSeededRng } from '@/src/utils/seededRandom';
import { HINTS_LIBRARY, inferGender, inferNationality, inferSport, type HintLibrary } from '@/src/utils/hintsData';
import { buildHintsDistractorPool } from '@/src/utils/hintsDistractorPool';
import { isItemInRegionScope, PLAYER_COUNTRY } from '@/src/utils/regionScope';
import { HintsQuizCard } from '@/src/components/HintsQuizCard';
import { HeartbeatSound } from '@/src/components/HeartbeatSound';
import { MorseAmbientSound } from '@/src/components/MorseAmbientSound';
// Person-bilderna är juridiskt parkerade sedan 2026-06-04 — en "image"-fråga
// renderar bara flagga + ledtrådar via HintsQuizCard. assets/quiz-images/,
// quizImages.ts och hela sketch-pipelinen raderades 2026-08-17.
import { generateRoomCode } from '@/src/utils/roomCode';
import { addSeenQuestionIds, addSessionRecord, addSessionRecordForNames, loadSeenQuestionIds, loadLastSessionIds } from '@/src/utils/hostQuestionHistory';
import { consumePendingPeerSeenIds } from '@/src/utils/pendingSeenQuestions';
import { allocateCategoryBlocks, buildEpochPhase, emptyEpochDebt, getActiveEpochs, pickTiered, planEpochSequence, sequenceToQuotas, type CategoryCapacity, type EpochDebt, type EpochId, type EpochPlayer, type EpochQuestion } from '@/src/utils/epochAllocation';
import { loadEpochLedger, saveEpochLedger } from '@/src/utils/epochLedger';
import { getGenerationKeyFromBirthYear } from '@/src/utils/mockPurchasedPackages';
import { hasPremiumSubscription } from '@/src/utils/subscriptionStorage';
import { supabase } from '@/src/utils/supabase';
// ── FUTURE VERSION 2 — Automated API Flow (archived imports) ─────────────────────
// import { fetchSpotifyTrackInfo, getLastKnownSpotifyProgressMs, pauseSpotifyPlayback, resumeSpotifyPlayback, type SpotifyTrackInfo } from '@/src/lib/spotify';
// import { SpotifyNowPlayingOverlay } from '@/src/components/SpotifyNowPlayingOverlay';
// ─────────────────────────────────────────────────────────────────────────────────
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Circle, G, Path } from 'react-native-svg';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

interface TimelineQuestion {
  type: 'timeline';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  /** V1-huvudkategori härledd från backend:s contentSubject — driver
   *  GetReadyIntro:s badge på första kö-rutan. null om subjectet inte
   *  mappar (t.ex. capital). */
  mainCategory: MainCategory | null;
  question: string;
  correctYear: number;
  hint: string;
  /** Genre/tema-paket-taggar (t.ex. ["sport"]) från backend-katalogen. Driver
   *  crossover-filter: sport-musik (subject=song → mainCategory='Music') surfar
   *  ÄVEN under Sport-toggeln. Se itemMatchesEnabledCategories. */
  genrePackages?: readonly string[];
  // Pre-curerade YouTube-klipp för frågan. Optional — items utan klipp
  // renderar `NoSourcePlayer`-placeholder via pickMediaSource.
  youtubeClips?: YoutubeClip[];
  /** Spotify track ID — satt när frågan är en Spotify DJ-kandidat.
   *  Driver isSpotifyQuestion + djRotationPlan i quiz-screen:en. */
  spotifyTrackId?: string;
}

interface ImageQuestion {
  type: 'image';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  /** V1-huvudkategori härledd från backend:s contentSubject — driver
   *  GetReadyIntro:s badge på första kö-rutan. null om subjectet inte
   *  mappar (t.ex. capital). */
  mainCategory: MainCategory | null;
  question: string;
  /** Rätt svar — visas i reveal-feedback. */
  displayName: string;
  /** "Rätt svar"-året (för artister = födelseår; band = formation-år).
   *  Används som FALLBACK i era-filtret när peak saknas. **Optional** —
   *  items utan correctYear OCH utan peak (t.ex. capitals) är era-
   *  agnostiska och inkluderas i alla eras. */
  correctYear?: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När båda
   *  definierade använder era-filtret interval-overlap mot host:s era-
   *  spann (semantiskt rättare än correctYear för artister). */
  peakFrom?: number;
  peakTo?: number;
  /** Backreference till källan från IMAGE_QUIZ_QUESTIONS — driver runtime-
   *  generation av variants via buildImageVariant() istället för pre-bakad
   *  data (sparade ~8.3 MB av JS-bundlen, refactor 2026-05-27). */
  source: ImageQuizQuestion;
  /** Hints-data om tillgänglig — aktiverar HintsQuizCard-rendering (flagga + ledtrådar)
   *  istället för legacy foto-rendering (juridiskt parkerad). */
  hints?: HintLibrary;
  /** Profession-etikett härledd från contentSubject ('Actor' | 'Artist' | 'Athlete' | 'Band'). */
  profession?: string;
}

interface ActorSelectQuestion {
  type: 'actor-select';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  mainCategory: MainCategory | null;
  question: string;
  /** Filmtitel — visas i reveal-feedback. */
  displayName: string;
  /** True = animerad film (frågar karaktärnamn), false = live-action (skådespelarnamn). */
  isAnimated: boolean;
  /** Godkända svar (1–2 namn). Räcker att välja ett. */
  correctNames: string[];
  /** Felaktiga svarsalternativ som visas i namnlistan. */
  distractorNames: string[];
  /** Filmens releasår — används för era-filtrering (inte för scoring). */
  correctYear?: number;
  genrePackages?: readonly string[];
  youtubeClips?: YoutubeClip[];
}

type QuizQuestion = TimelineQuestion | ImageQuestion | ActorSelectQuestion;

// Frågorna kommer från backend-curerad katalog (backend/content/catalog/songs-*.yaml).
// Regenerera src/utils/musicQuestions.ts efter katalog-ändringar med:
//   cd backend && npm run export-music-questions
// Items med spotifyTrackId men tomma youtubeClips är Spotify-only — de filtreras
// bort ur pureYoutubePool när Spotify är av (se pureYoutubePool-definitionen nedan).
// `questionText` bakas in i exporten via backend-schemats FIXED_QUESTION_TEXT-
// map (matrisens "Fixed Question text"-kolumn) så frågetexten är härledd ur
// `contentSubject`, inte hårdkodad här. `hint` används bara internt
// i reveal-vyn ("Disco era") så den behålls för smak.
//
// Region-filter via hierarkin global ⊃ europe ⊃ nordic ⊃ <land> (se
// src/utils/regionScope.ts). Itemet visas om spelarens land ligger inom
// itemets region-nivå; 'unknown-region' når ingen och faller därför bort.
const SEED_QUESTIONS: (TimelineQuestion | ActorSelectQuestion)[] = MUSIC_QUESTIONS
  .filter((q) => isItemInRegionScope(q.region, PLAYER_COUNTRY))
  .map((q, i, arr) => {
  if (q.correctNames && q.correctNames.length > 0) {
    // Film-fråga: actor-select-mekanik (skådespelar-/karaktärnamn istället för år)
    const actorQ: ActorSelectQuestion = {
      type: 'actor-select',
      id: q.id,
      questionNumber: i + 1,
      totalQuestions: arr.length,
      category: 'Film',
      mainCategory: subjectToMainCategory(q.contentSubject),
      question: q.questionText,
      displayName: q.displayName,
      isAnimated: q.isAnimated ?? false,
      correctNames: q.correctNames,
      distractorNames: q.distractorNames ?? [],
      correctYear: q.correctYear,
      genrePackages: q.genrePackages,
      youtubeClips: q.youtubeClips,
    };
    return actorQ;
  }
  const tq: TimelineQuestion = {
    type: 'timeline',
    id: q.id,
    questionNumber: i + 1,
    totalQuestions: arr.length,
    category: 'Music',
    mainCategory: subjectToMainCategory(q.contentSubject),
    question: q.questionText,
    correctYear: q.correctYear!,
    hint: q.displayName,
    genrePackages: q.genrePackages,
    youtubeClips: q.youtubeClips,
    spotifyTrackId: q.spotifyTrackId,
  };
  return tq;
});

function professionFromSubject(subject: string | undefined): string {
  if (subject === 'artist') return 'Artist';
  if (subject === 'band') return 'Band';
  if (subject === 'actor') return 'Actor';
  if (subject === 'athlete') return 'Athlete';
  if (subject === 'city' || subject === 'country' || subject === 'place') return 'Place';
  if (subject) return subject.charAt(0).toUpperCase() + subject.slice(1);
  return 'Person';
}

// Bild-frågor (Letter Grid → Final Selection-svar). category='Image' triggar
// per-typ-rendering i question-card / mediaCard / answer-block / reveal-block.
// Items med hints-data i HINTS_LIBRARY får library attachad vid konvertering.
// Region-filter via EXAKT samma regel och samma datakälla som SEED_QUESTIONS:
// katalogens `region`, numera exporterad även för bild-items (migration
// 2026-08-11). Items med färre än 10 hints visas ej — de saknar tillräckliga
// ledtrådar för en meningsfull fråga.
const MIN_HINTS_REQUIRED = 10;
const IMAGE_SEED_QUESTIONS: ImageQuestion[] = IMAGE_QUIZ_QUESTIONS
  .filter((q) =>
    isItemInRegionScope(q.region, PLAYER_COUNTRY) &&
    (HINTS_LIBRARY[q.id]?.hints.length ?? 0) >= MIN_HINTS_REQUIRED,
  )
  .map((q, i, arr) => ({
    type: 'image',
    id: q.id,
    questionNumber: i + 1,
    totalQuestions: arr.length,
    category: 'Image',
    mainCategory: subjectToMainCategory(q.contentSubject),
    question: q.questionText,
    displayName: q.displayName,
    correctYear: q.correctYear,
    peakFrom: q.peakFrom,
    peakTo: q.peakTo,
    source: q,
    hints: HINTS_LIBRARY[q.id],
    profession: professionFromSubject(q.contentSubject),
  }),
);

/** Lookup-map per question ID för IndDev-frågesynkronisering.
 *  Non-host söker upp exakt den fråga host skickade via play_command.question_id,
 *  oavsett lokal shuffle-ordning (seenQuestionIds skiljer sig per enhet). */
const ALL_QUESTIONS_MAP = new Map<string, QuizQuestion>(
  ([...SEED_QUESTIONS, ...IMAGE_SEED_QUESTIONS] as QuizQuestion[]).map((q) => [q.id, q]),
);

/** Distraktor-kandidater för Spotify/Name-frågor: alla artister ur musik-
 *  katalogen med spotifyTrackId som har kuraterad meta (typ/kön/land) i
 *  SPOTIFY_ARTIST_META. Kompletterar bild-poolens artist/band-items så
 *  relevans-filtreringen har tillräckligt med t.ex. svenska kvinnliga
 *  soloartister eller amerikanska band att välja bland. Dedup på lowercase-
 *  namn; canonical casing tas från katalogens displayName ("Title — Artist"). */
const SPOTIFY_ARTIST_CANDIDATES: { name: string; meta: SpotifyArtistMeta }[] = (() => {
  const seen = new Set<string>();
  const out: { name: string; meta: SpotifyArtistMeta }[] = [];
  for (const q of MUSIC_QUESTIONS) {
    if (!q.spotifyTrackId) continue;
    const artist = q.displayName?.split(' — ').pop()?.trim();
    if (!artist) continue;
    // Meta slås upp på FULLA strängen (tabellen nycklar collabs på full form),
    // men kandidat-NAMNET strippas på featured-delen — "Jay-Z ft. Alicia Keys"
    // blir distraktorn "Jay-Z" (ett ft.-namn som svarsalternativ läser konstigt).
    const meta = getSpotifyArtistMeta(artist);
    if (!meta) continue;
    const candName = artist.split(/\s+(?:ft\.?|feat\.?)\s+/i)[0]?.trim() || artist;
    const key = candName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: candName, meta });
  }
  return out;
})();

// Fisher-Yates-shuffle — slumpar ordningen i en ny kopia utan att muttera originalet.
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Slumpar ordningen på BLOCK, inte enskilda frågor. buildEpochPhase levererar
// frågor i kronologisk epok-ordning (E1→E5), vilket gör att varje spel spelas
// som en vandring genom tiden — och med epochLedger:s skuld-ordning skulle
// varje spel dessutom öppna på samma epok. Den här shufflen bryter båda.
//
// Blockgranulariteten är kritisk i Pass-the-Phone: där är questionsPerBlock =
// antalet spelare, och buildPtPSequence gör varje block till exakt ett varv i
// turordningen [P1, P2, ..., Pn]. Att blanda hela block behåller alltså både
// turordningen och kategori-aligneringen (ett block = en kategori). I Single
// Player och IndDev är questionsPerBlock = 1 → vanlig frågeshuffle.
//
// Ett avslutande ofullständigt block lämnas kvar sist: kategori-splittens
// enkategori-gren trimmar inte till blockmultipel, så ett halvt block kan
// förekomma och får inte hamna mitt i sekvensen och klyva ett turvarv.
function shuffleBlocks<T>(seq: T[], questionsPerBlock: number): T[] {
  if (questionsPerBlock <= 1) return shuffleArray(seq);
  const blocks: T[][] = [];
  let i = 0;
  for (; i + questionsPerBlock <= seq.length; i += questionsPerBlock) {
    blocks.push(seq.slice(i, i + questionsPerBlock));
  }
  const tail = seq.slice(i);
  return [...shuffleArray(blocks).flat(), ...tail];
}

function getIntervalForAssistance(assistance: AssistanceLevel): number {
  if (assistance === 'minimal') return 0;
  if (assistance === 'standard') return 3;
  return 5; // full
}

/**
 * Beräknar svarsruta-fönstret runt selectedYear så att FULL bredd alltid
 * preserveras — även när selected ligger nära era-min eller era-max.
 * Vid edge shiftas fönstret in i intervallet istället för att klippas
 * (annars skulle full=5 år kollapsa till 3 år vid kanterna).
 */
function getAnswerRange(
  selectedYear: number,
  interval: number,
  min: number,
  max: number,
): { start: number; end: number } {
  if (interval === 0) {
    return { start: selectedYear, end: selectedYear };
  }
  const half = Math.floor(interval / 2);
  let start = selectedYear - half;
  let end = selectedYear + half;
  if (start < min) {
    end += min - start;
    start = min;
  }
  if (end > max) {
    start -= end - max;
    end = max;
  }
  // Final clamp om hela era-spannet är smalare än interval (mycket smal era)
  start = Math.max(min, start);
  end = Math.min(max, end);
  return { start, end };
}

function isCorrect(
  selectedYear: number,
  correctYear: number,
  interval: number,
  eraMin: number,
  eraMax: number,
): boolean {
  const range = getAnswerRange(selectedYear, interval, eraMin, eraMax);
  return correctYear >= range.start && correctYear <= range.end;
}

// Poäng-modell: rätt svar = 1 poäng, fel = 0. Tie-break på leaderboarden
// hanteras av sorteringen (poäng desc → avgResponseSeconds asc) — så två
// spelare med samma antal rätt rankas efter lägst genomsnittlig svarstid.
function calculatePoints(
  correct: boolean,
  assistance?: AssistanceLevel,
  questionKind?: 'year' | 'name',
): number {
  if (!correct) return 0;
  return 1;
}

// Quiz-lokal klarröd som ersätter den globala Colors.error i tre intentional
// quiz-kontexter (timer-bar/ring/integer vid <5s, Wrong Answer-badge bg,
// Wrong-feedback-kortets border). Den globala Colors.error är medvetet
// mjukare/rosa-tonad så Lobby:s toggle-off-state, papperskorgs-pressed osv.
// inte skriker. Quiz-vyn vill däremot ha en distinkt urgency-röd.
const QUIZ_ERROR_RED = '#FF3B30';

// ─── Spotify-instruktionsguide (DJ / timer-aktiverare / gissare) ──────────────
// V1-flöde: DJ stannar i Spotify hela rundan. Host (eller reserv) aktiverar
// timern. Vanliga gissare lyssnar och svarar.
const SPOTIFY_DJ_STEPS = [
  'Open Spotify and track via button, if it does not start automatically, find the specific track in the playlist and press play in Spotify',
  'Timer is activated by the other players (non-DJs)',
  'Stay in Spotify during the song is played and timer is running',
  'Players inform when timer ends — stop the track in Spotify and confirm the track has been stopped',
  'Press End DJ - handover to Host / Next button below',
] as const;

// Visas för ALLA icke-DJ-spelare (timer-aktiverare + vanliga gissare delar
// exakt samma steg-lista — timer-aktiverare får dessutom "Activate Timer"-knapp).
const SPOTIFY_NON_DJ_STEPS = [
  'DJ start track in Spotify',
  'One of the non-DJs start the timer',
  'Timer counting down and all players confirm their guess',
  'Timer ends — inform the DJ who will stop the track in Spotify',
  'DJ handover next step to Host',
] as const;

/** Track-kort för DJ:n — grön ram med "Track"-rubrik centrerad överst,
 *  därunder artist och titel på varsin rad. `hint`-formatet från katalogen
 *  är "Titel — Artist" (em-dash-separerad); saknas separatorn visas hela
 *  strängen som titel utan artist-rad. Renderas bara på DJ:ns enhet
 *  (ingen spoiler-risk — DJ:n svarar aldrig och ser ändå låten i Spotify). */
function DJTrackCard({
  hint,
  trackId,
  children,
}: {
  hint?: string | null;
  trackId?: string | null;
  children?: React.ReactNode;
}) {
  const parts = hint ? hint.split(' — ') : [];
  const artist = parts.length > 1 ? parts[parts.length - 1] : null;
  const title = parts.length > 1 ? parts.slice(0, -1).join(' — ') : hint ?? null;
  // Album-kontext (auto-genererad av backend:s spotify-album-audit): var i
  // tracklistan deep-linken landar — "Track 5 of 30" hjälper DJ:n hitta rätt
  // rad när autoplay uteblir och Spotify visar hela albumet/samlingen.
  const albumCtx = trackId ? SPOTIFY_ALBUM_CONTEXT[trackId] : undefined;
  return (
    <View style={styles.spotifyTrackCard}>
      {children}
      {title ? (
        <>
          {artist ? (
            <>
              <Text style={[styles.spotifyTrackCardFieldLabel, styles.spotifyTrackCardFirstLabel]}>
                Artist
              </Text>
              <Text style={styles.spotifyTrackCardArtist}>{artist}</Text>
            </>
          ) : null}
          <Text
            style={[
              styles.spotifyTrackCardFieldLabel,
              !artist && styles.spotifyTrackCardFirstLabel,
            ]}
          >
            Title
          </Text>
          <Text style={styles.spotifyTrackCardTitle}>{title}</Text>
          {albumCtx ? (
            <Text style={styles.spotifyTrackCardPosition}>
              Track position in Spotify: {albumCtx.position} of {albumCtx.total}
            </Text>
          ) : null}
          <View style={styles.spotifyTrackCardWarnRow}>
            <Text style={styles.spotifyTrackCardWarnIcon}>⚠️</Text>
            <Text style={styles.spotifyTrackCardWarnText}>
              Please make sure you play exactly this Track as DJ
            </Text>
            <Text style={styles.spotifyTrackCardWarnIcon}>⚠️</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

/**
 * Bygger en frågesekvens där varje block av `questionsPerBlock` frågor
 * tillhör exakt samma mainCategory (source+kategori-konsistens per block).
 * Används i Pass-the-Phone så alla spelare i samma runda får t.ex.
 * YouTube/Music — inte YouTube/Music, YouTube/Film, Hints/Sport i blandning.
 *
 * Gäller alla lägen (PtP och IndDev): vid enstaka kategori delegeras direkt.
 */
function buildCategoryAlignedPhase<T extends QuizQuestion>(opts: {
  pool: T[];
  totalBlocks: number;
  questionsPerBlock: number;
  activeEpochs: ReturnType<typeof getActiveEpochs>;
  recentIds: Set<string>;
  lastSessionIds?: Set<string>;
  isPtP: boolean;
  players: EpochPlayer[];
  turnOrderIds: string[];
  getEpochYear: (q: EpochQuestion) => number | null;
  /** Planerad epok per frågeslot för HELA fasen (från epochLedger), i samma
   *  längd som totalBlocks × questionsPerBlock. Skivas per kategori nedan så
   *  alla kategori-anrop delar en enda plan istället för att var och en räkna
   *  om LRM från noll — det är just den omräkningen som gjorde att låga
   *  rundantal alltid landade i samma epok. */
  epochSequence?: EpochId[];
}): T[] {
  const {
    pool, totalBlocks, questionsPerBlock, activeEpochs,
    recentIds, lastSessionIds, isPtP, players, turnOrderIds, getEpochYear, epochSequence,
  } = opts;
  const totalQuestions = totalBlocks * questionsPerBlock;
  if (totalQuestions === 0 || pool.length === 0) return [];

  // Gruppera frågor per mainCategory (null-frågor hamnar i '_other').
  const catMap = new Map<string, T[]>();
  for (const q of pool) {
    const key = q.mainCategory ?? '_other';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(q);
  }

  // Shufflas — annars är kategori-ordningen deterministisk (Map insertion
  // order = pool-ordning): Music-blocken hamnade alltid först OCH remainder-
  // blocken gick alltid till första kategorin (stable sort på lika decimaler
  // i LRM:en nedan). Shuffle randomiserar både vilken kategori som får extra
  // block och i vilken ordning kategori-blocken spelas.
  const cats = shuffleArray([...catMap.keys()]);

  // Enstaka kategori eller inget att fördela — delegera direkt utan overhead.
  if (cats.length <= 1) {
    return buildEpochPhase<T>({
      pool, totalQuestions, activeEpochs, recentIds, lastSessionIds, isPtP, players, turnOrderIds, getEpochYear,
      quotas: epochSequence ? sequenceToQuotas(epochSequence.slice(0, totalQuestions)) : undefined,
    });
  }

  // Lika vikt per kategori — men aldrig fler block än kategorin kan fylla.
  // Viktigt: INTE pool-storleks-proportionell — annars vinner alltid den
  // större kategorin vid lågt antal rundor (t.ex. 2 rundor YT/Music + YT/Sport
  // → Music-poolen är 10× större → båda frågorna blir Music). Lika vikt
  // säkerställer att varje vald kategori representeras oavsett pool-storlek.
  //
  // Kapacitets-taket ovanpå: en kategori med EN enda fråga fick tidigare samma
  // andel av spelet som en med hundra, och då MÅSTE den frågan återkomma varje
  // spel. allocateCategoryBlocks kapar först mot antalet block som går att
  // fylla med OSEDDA frågor och flyttar överskottet till kategorier som har
  // färskt innehåll kvar. Summan är fortfarande exakt totalBlocks.
  const isFresh = (q: T) => !recentIds.has(q.id) && !(lastSessionIds?.has(q.id) ?? false);
  const capacity: Record<string, CategoryCapacity> = {};
  for (const c of cats) {
    const catPool = catMap.get(c)!;
    capacity[c] = {
      fresh: Math.floor(catPool.filter(isFresh).length / questionsPerBlock),
      total: Math.floor(catPool.length / questionsPerBlock),
    };
  }
  const blocksByCat = allocateCategoryBlocks(totalBlocks, cats, capacity);

  // Bygg sekvens per kategori och konkatenera.
  // Trim till närmaste multipel av questionsPerBlock: om buildEpochPhase returnerar
  // färre frågor än begärt (pool-exhaustion) skulle ett partiellt block annars
  // blanda kategorier vid nästa kategoris start.
  const result: T[] = [];
  let seqCursor = 0; // löpande position i den delade epok-planen
  for (let i = 0; i < cats.length; i++) {
    const catBlocks = blocksByCat[cats[i]];
    if (catBlocks === 0) continue;
    const catPool = catMap.get(cats[i])!;
    const catQuestions = catBlocks * questionsPerBlock;
    const catSlice = epochSequence?.slice(seqCursor, seqCursor + catQuestions);
    seqCursor += catQuestions;
    const catSeq = buildEpochPhase<T>({
      pool: catPool,
      totalQuestions: catQuestions,
      activeEpochs,
      recentIds,
      lastSessionIds,
      isPtP,
      players,
      turnOrderIds,
      getEpochYear,
      quotas: catSlice && catSlice.length > 0 ? sequenceToQuotas(catSlice) : undefined,
    });
    const aligned = catSeq.slice(0, Math.floor(catSeq.length / questionsPerBlock) * questionsPerBlock);
    result.push(...aligned);
  }
  return result;
}

/** Parsar [r]...[/r]-markeringar i step-strängar och renderar dem i rött. */
function renderStepText(text: string): React.ReactNode {
  if (!text.includes('[r]')) return text;
  const parts = text.split(/(\[r\].*?\[\/r\])/);
  return parts.map((part, i) => {
    const match = part.match(/^\[r\](.*?)\[\/r\]$/);
    if (match) {
      return (
        <Text key={i} style={{ color: '#FF3B30', fontWeight: '700' }}>
          {match[1]}
        </Text>
      );
    }
    return part;
  });
}

// ─── Mått ─────────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
// Responsiva mått bor i src/utils/quizLayout.ts så MediaPlayer-providern
// räknar med exakt samma mediamått som kortet runt den. `qh()` skalar
// höjder/padding och `qf()` typsnitt mot hur mycket höjd som faktiskt är kvar
// efter safe area — kontinuerligt, inte i diskreta skärmhinkar. Skriv därför
// `qh(56)`, inte `SCREEN_H < 700 ? 46 : 56`.

// ITEM_WIDTH (avstånd mellan ticks) sätts dynamiskt per assistance-nivå inuti komponenten:
// Full: tät (≥10 år synliga), Standard: medium (≥8), Minimal: gles (4–5 syns)

// Tidslinjen – alla mått relativa till container-toppen.
// Hela layouten skiftad UPP 12 px från tidigare värden (CONTAINER_HEIGHT
// 108→96, TICK_TOP 24→12, etc.) — frigör vertikal yta så reveal-feedback-
// rutan inte längre överlappar Next-knappen i nedre högra hörnet.
const CONTAINER_HEIGHT = 96;
const TRACK_Y = 43;           // horisontell linje (mitten av svarsrutan)
const TICK_TOP = 12;          // ticks börjar ovanför svarsrutan
const TICK_BOTTOM = 74;       // ticks slutar under svarsrutan
const TICK_TOTAL = TICK_BOTTOM - TICK_TOP; // = 62px total tick-höjd
const YEAR_TEXT_Y = 78;       // årstext direkt under tickarna

// Svarsruta – kortare ram som tickarna tydligt skär genom
const SELECTOR_TOP = 22;      // 10px under tick-toppen
const SELECTOR_BOTTOM = 64;   // 10px över tick-botten
const SELECTOR_H = SELECTOR_BOTTOM - SELECTOR_TOP; // = 42px

// Energisk färg för svarsrutan (används oavsett assistance-nivå)
const BOX_COLOR = '#F5A623';       // gyllene
const BOX_BG = 'rgba(26,48,80,0.92)'; // mörkare navy – tydligt distinkt mot bakgrund #0B1220

// ─── Timeline Selector ────────────────────────────────────────────────────────

function TimelineSelector({
  assistance, onYearChange, disabled, eraFrom, eraTo,
}: {
  assistance: AssistanceLevel;
  // Notifierar parent om vald-år-ändring vid varje scroll-tick. Confirm-knappen
  // lyfts ut till quiz.tsx så samma knapp-yta kan byta label/handler beroende
  // på fas (Confirm under question / Next Round under reveal).
  onYearChange: (year: number) => void; disabled: boolean;
  // Game Era från Lobby — låser tidslinjens span exakt till det årsspann
  // host valde. Spelaren kan inte scrolla till år utanför era-perioden.
  eraFrom: number; eraTo: number;
}) {
  // Dynamisk celltätlhet per assistance-nivå (smalare celler = fler år syns på skärmen)
  const ITEM_WIDTH =
    assistance === 'minimal' ? 75 :
    assistance === 'standard' ? 40 :
    32; // full

  // Padding runt scroll-innehållet så min/max-ticks kan scrollas till tidslinjens mitt.
  // Tidslinjen är inuti wrapper-containern som har Spacing.lg padding på varje sida,
  // så vi räknar på dess faktiska bredd – inte hela skärmbredden.
  const TIMELINE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
  const SCROLL_PADDING = Math.max(40, TIMELINE_WIDTH / 2 - ITEM_WIDTH / 2);

  const interval = getIntervalForAssistance(assistance);
  // Tidslinjens span = host:s valda Game Era. Spelarens scroll-räckvidd
  // capas mot eraFrom/eraTo så även selector-rutan (year-interval) håller
  // sig inom perioden via existerande Math.max/min-clamps nedan.
  const min = eraFrom;
  const max = eraTo;
  const middleYear = Math.round((min + max) / 2);
  const [selectedYear, setSelectedYear] = useState(middleYear);

  // Notifiera parent vid varje vald-år-ändring (inkl. mount via middleYear) så
  // quiz.tsx:s Confirm-knapp har det aktuella året när användaren trycker.
  useEffect(() => {
    onYearChange(selectedYear);
  }, [selectedYear, onYearChange]);

  // Pulserande swipe-affordance: två gold-pilar utanför selector-rutans
  // vänster/höger-kant. Loop:as i opacity + scale så de "dunkar" tills
  // användaren scrollar (timeline:n disablar arrows när phase=reveal).
  const arrowPulse = useRef(new Animated.Value(0.35)).current;
  const arrowScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (disabled) {
      arrowPulse.stopAnimation();
      arrowPulse.setValue(0);
      arrowScale.stopAnimation();
      arrowScale.setValue(1);
      return;
    }
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowPulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowScale, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    opacityLoop.start();
    scaleLoop.start();
    return () => {
      opacityLoop.stop();
      scaleLoop.stop();
    };
  }, [disabled, arrowPulse, arrowScale]);

  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const half = Math.floor(interval / 2);
  // Använd getAnswerRange-helper:n så fönstret behåller FULL bredd även vid
  // era-kanterna (shiftar inåt istället för att klippa). Annars skulle t.ex.
  // full=5 kollapsa till 3 år vid edge.
  const { start: rangeStart, end: rangeEnd } = getAnswerRange(
    selectedYear,
    interval,
    min,
    max,
  );

  const assistanceColor = {
    full: Colors.success,
    standard: Colors.primary,
    minimal: '#F5A623',
  }[assistance];

  // Svarsrutan täcker HELA cellen för varje år i intervallet – så att både ticks OCH
  // årtalsetiketten under tidslinjen ligger inom rutan.
  // (2*half + 1) = antal år i intervallet, gånger ITEM_WIDTH = bredden av alla celler
  const selectorWidth = (2 * half + 1) * ITEM_WIDTH;

  // Adaptiv textstorlek – skalar ner när rutan är smal (korta intervall + smala celler)
  const textFontSize =
    interval === 0 ? 20 :
    selectorWidth >= 180 ? 22 :
    selectorWidth >= 130 ? 18 :
    14;

  // Scrollens startposition: mittenåret ska synas i mitten av skärmen vid uppstart
  const initialScrollOffset = (middleYear - min) * ITEM_WIDTH;

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
    const year = Math.min(max, Math.max(min, min + index));
    setSelectedYear(year);
  };

  return (
    <View style={[tl.wrapper, disabled && { opacity: 0.35 }]}>

      {/* Assist label */}
      <View style={tl.assistRow}>
        <View style={[tl.assistLine, { backgroundColor: assistanceColor + '50' }]} />
        <View style={[tl.assistBadge, { backgroundColor: assistanceColor + '20', borderColor: assistanceColor + '50' }]}>
          <Text style={[tl.assistText, { color: assistanceColor }]}>
            {assistance.toUpperCase()} ASSIST
          </Text>
        </View>
        <Text style={[tl.assistDesc, { color: assistanceColor + 'bb' }]}>
          {interval === 0 ? 'Pick the exact year' : `Select a ${interval}-year interval`}
        </Text>
        <View style={[tl.assistLine, { backgroundColor: assistanceColor + '50' }]} />
      </View>

      {/* Timeline container */}
      <View style={{ height: CONTAINER_HEIGHT, position: 'relative' }}>

        {/* ScrollView med tidslinjen */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SCROLL_PADDING }}
          contentOffset={{ x: initialScrollOffset, y: 0 }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
            const year = Math.min(max, Math.max(min, min + index));
            setSelectedYear(year);
          }}
          scrollEventThrottle={16}
          scrollEnabled={!disabled}
          style={StyleSheet.absoluteFill}
        >
          {/* Horisontell linje – sträcker sig genom hela det scrollbara området */}
          <View style={{
            position: 'absolute',
            top: TRACK_Y,
            left: -SCROLL_PADDING,
            width: years.length * ITEM_WIDTH + SCROLL_PADDING * 2,
            height: 1.5,
            backgroundColor: Colors.borderStrong,
          }} />

          {years.map((year) => {
            const isInRange = interval > 0 && year >= rangeStart && year <= rangeEnd;
            const isSelected = year === selectedYear;
            const tickColor = isInRange || isSelected
              ? assistanceColor
              : Colors.primary + '44';

            return (
              <View
                key={year}
                style={{
                  width: ITEM_WIDTH,
                  height: CONTAINER_HEIGHT,
                  alignItems: 'center',
                }}
              >
                {/* Lodrätt streck – skär den horisontella linjen */}
                <View style={{
                  position: 'absolute',
                  top: TICK_TOP,
                  width: 1,
                  height: TICK_TOTAL,
                  backgroundColor: tickColor,
                  borderRadius: 1,
                }} />

                {/* Årstext – alla på samma Y */}
                <Text style={{
                  position: 'absolute',
                  top: YEAR_TEXT_Y,
                  fontSize: 10,
                  color: isInRange || isSelected
                    ? assistanceColor
                    : Colors.textSecondary + '88',
                  fontWeight: isInRange || isSelected ? '600' : '400',
                  textAlign: 'center',
                  width: ITEM_WIDTH,
                }}>
                  {year}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Selector-ram – energisk gul, tickarna skär rutan, årtalet inuti */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <View style={{
            position: 'absolute',
            left: '50%',
            top: SELECTOR_TOP,
            width: selectorWidth,
            height: SELECTOR_H,
            marginLeft: -(selectorWidth / 2),
            borderWidth: 3,
            borderRadius: 10,
            borderColor: BOX_COLOR,
            backgroundColor: BOX_BG,
            shadowColor: BOX_COLOR,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.85,
            shadowRadius: 18,
            elevation: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: textFontSize,
              fontWeight: '700',
              color: BOX_COLOR,
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.5,
            }}>
              {interval === 0 ? `${selectedYear}` : `${rangeStart} – ${rangeEnd}`}
            </Text>
          </View>

          {/* Vänster swipe-pil — pulserande gold-glyph utanför rutans
              vänsterkant. right: '50%' anchorar på timeline-mitten,
              marginRight skiftar till vänster om rutan. */}
          <Animated.View style={{
            position: 'absolute',
            top: SELECTOR_TOP + (SELECTOR_H - 36) / 2,
            right: '50%',
            marginRight: selectorWidth / 2 + 6,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: arrowPulse,
            transform: [{ scale: arrowScale }],
          }}>
            <Text style={tl.swipeArrow}>‹</Text>
          </Animated.View>

          {/* Höger swipe-pil — speglar vänster, left: '50%' + marginLeft */}
          <Animated.View style={{
            position: 'absolute',
            top: SELECTOR_TOP + (SELECTOR_H - 36) / 2,
            left: '50%',
            marginLeft: selectorWidth / 2 + 6,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: arrowPulse,
            transform: [{ scale: arrowScale }],
          }}>
            <Text style={tl.swipeArrow}>›</Text>
          </Animated.View>
        </View>
      </View>

      {!disabled && (
        <Text style={[tl.hint, { color: Colors.textSecondary }]}>
          Swipe to move
        </Text>
      )}
    </View>
  );
}

const tl = StyleSheet.create({
  // gap tidigare Spacing.md (16 px) — minskat till 0 så assist-headern
  // sitter precis ovanför timeline-containern. Tillsammans med
  // CONTAINER_HEIGHT-kompressionen (108→96) sparar detta 28 px vertikalt
  // så reveal-feedbackrutan inte överlappar Next-knappen.
  wrapper: { gap: 0, paddingHorizontal: Spacing.lg },
  assistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  assistLine: { flex: 1, height: 1 },
  assistBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  assistText: { fontSize: 10, fontWeight: FontWeight.semibold, letterSpacing: 0.5 },
  assistDesc: { fontSize: 11, fontWeight: FontWeight.medium },

  hint: { textAlign: 'center', fontSize: 10, fontStyle: 'italic' },
  // Pulserande gold-pilar utanför selector-rutan. textShadow ger en mjuk
  // glow som matchar rutans gold-shadow så elementen hör visuellt ihop.
  swipeArrow: {
    fontSize: 38,
    fontWeight: '900',
    color: BOX_COLOR,
    lineHeight: 38,
    textShadowColor: BOX_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

// ─── Main Quiz Screen ─────────────────────────────────────────────────────────

type TurnOrderPlayer = {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
  // Per-player assistance — driver TimelineSelector:s svarsruta-intervall
  // (full=5 år, standard=3 år, minimal=1 år) när det är spelarens tur.
  assistance?: AssistanceLevel;
  age?: number;
  spotifyConnected?: boolean;
  // guest/registered från lobby_players — behövs av goToNewLobby:s
  // carry-over så raderna återskapas med korrekt type. Host-radens 'guest'
  // är non-host-enheternas detekteringssignal för guest-hostade spel.
  type?: 'registered' | 'guest';
};

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    assistance?: string;
    age?: string;
    gameMode?: 'pass-the-phone' | 'individual-devices' | 'remote-1v1';
    isHost?: string;
    // Remote 1v1: server-side match-id (remote_matches.id) — sätts av
    // Lobby:s handleStartGame (host) resp. Play now-prompten / My 1v1
    // Matches (motståndare). Driver sekvens-auktoritet + answer-persistens.
    remoteMatchId?: string;
    selfPlayerId?: string;
    players?: string;
    roundsCount?: string;
    roomCode?: string;
    eraFrom?: string;
    eraTo?: string;
    answerResponseSeconds?: string;
    /** JSON-stringifierad array av MainCategory-strings aktiva för YouTube-källan. Min 1. */
    youtubeEnabledCategories?: string;
    /** JSON-stringifierad array av MainCategory-strings aktiva för Images-källan.
     *  Actors/Athletes Images följer sin YouTube-toggle (Auto-beteende i Lobby). */
    imagesEnabledCategories?: string;
    /** JSON-stringifierad array av theme package-IDs aktiva vid spelstart.
     *  Tom array = Generic. Used för att frysa in i HistoryEntry. */
    selectedExtraPackages?: string;
    /** 'true' om Spotify DJ-läge är aktiverat i Lobby + host:ns konto kopplat. */
    spotifyEnabled?: string;
    /** Host:s Spotify-svarstyper ('true'/'false', default 'true'). Båda true
     *  = alternerar Year/Name per Spotify-fråga. Minst en är alltid true
     *  (enforced av Lobby/Profile-validering). */
    spotifyAnswerYear?: string;
    spotifyAnswerName?: string;
    /** 'true' om spelets host är en guest (lobbyn skapad via "Start Game as
     *  Guest"). Sätts på ALLA enheter (host-path + non-host-path) — döljer
     *  Play Again på final leaderboard och skippar Player history-skrivning. */
    guestHost?: string;
    /** Guest-identitet (bara host-enheten i guest-hostade spel) — behövs av
     *  goToNewLobby för att återskapa guest-lobbyn vid Play Again. */
    guestName?: string;
    guestBirthYear?: string;
    /** Antal replays guest-hosten redan förbrukat ('0' default). Max 1 —
     *  vid '1' visar Final Leaderboard bara Home. */
    guestReplays?: string;
  }>();
  // Default assistance från URL-param — fallback om turnOrder-spelaren
  // saknar egen assistance-flagga. Per-player-värdet från turnOrder:n
  // har företräde när det är satt (= bygg-tid sätts av Lobby).
  const fallbackAssistance = (params.assistance ?? 'standard') as AssistanceLevel;
  const age = parseInt(params.age ?? '30');
  const gameMode = params.gameMode ?? 'pass-the-phone';
  // True om enheten kör host:s vy. Sätts av Lobby:s handleStartGame ('true')
  // resp. non-host:s Realtime-driven navigation ('false'). Defaultas till
  // 'true' så direkt-nav (utan Lobby) behåller host-beteende (Quit Game-
  // knapp etc.) — speglar tidigare implicit-host-antagande.
  const isHost = (params.isHost ?? 'true') === 'true';
  // True när spelets HOST är en guest (oavsett vilken enhet detta är —
  // på non-host-enheter betyder flaggan "spelets host är guest", inte
  // "jag är host"). Guest-hostade spel skriver ingen Player history och
  // har max 1 Play Again-replay (räknas via guestReplaysUsed nedan).
  const isGuestHostGame = params.guestHost === 'true';
  // Förbrukade replays (0 = första spelet → Play Again visas; >=1 = detta
  // ÄR replayn → Final Leaderboard visar bara Home). Bara satt på host-
  // enheten; non-host styrs istället av hostInitiatedPlayAgain-broadcasten.
  const guestReplaysUsed = parseInt(params.guestReplays ?? '0', 10) || 0;
  // Remote 1v1: server-side match-id (remote_matches). Solo-session —
  // frågesekvensen är auktoritativ i DB (question_ids), varje svar skrivs
  // till remote_match_answers och slutresultatet finaliseras via RPC.
  const remoteMatchId = params.remoteMatchId ?? null;
  const isRemote = gameMode === 'remote-1v1' && !!remoteMatchId;
  // Remote 1v1: BÅDA deltagarnas åldrar (ur match-snapshotten). Behövs eftersom
  // `turnOrder` i remote bara innehåller spelaren själv — utan detta bygger de
  // två enheterna olika audience-set (= olika distraktor-pool) och därmed olika
  // svarsalternativ på samma fråga. Se audienceSetForVariants nedan.
  const [remoteMatchAges, setRemoteMatchAges] = useState<number[] | null>(null);
  /**
   * Deterministisk seed för allt slumpat innehåll i en remote-fråga (hint-urval,
   * svarsalternativ, deras ordning). Båda enheterna kör samma kod med samma
   * seed → identiskt underlag, trots att det inte finns någon sync-kanal under
   * spelet. Returnerar undefined i lokala lägen (alla ser samma skärm där, och
   * variation per runda är önskvärd).
   */
  const seedForRemoteQuestion = useCallback(
    (questionId: string): string | undefined =>
      isRemote && remoteMatchId ? `${remoteMatchId}:${questionId}` : undefined,
    [isRemote, remoteMatchId],
  );
  // Det egna player_id:t (= lobby_players.player_id) som Lobby skickade.
  // Används av non-host:s Leave-flöde för att broadcasta `player_left` så
  // host:s skärm kan visa popup + markera spelaren som hasLeft i leader-
  // boarden. Faller tillbaka till tom sträng vid direkt-nav (utan Lobby).
  const selfPlayerId = params.selfPlayerId ?? '';
  // Initial answerResponseSeconds från Lobby-param. Spelaren kan justera
  // mellan ronder via GetReadyIntro:s settings-block, så vi håller värdet
  // som state istället för konst. Endast 30/45/60 är giltiga (= host:s
  // val i Lobby), default 30 om paramet saknas vid direkt-nav.
  const initialResponseSeconds = (() => {
    const parsed = parseInt(String(params.answerResponseSeconds ?? '30'), 10);
    return [30, 45, 60].includes(parsed) ? (parsed as 30 | 45 | 60) : 30;
  })();
  const [responseSeconds, setResponseSeconds] = useState<30 | 45 | 60>(
    initialResponseSeconds,
  );
  // Spotify DJ-läge — kräver Individual Devices (DJ lämnar appen → Spotify-appen).
  // PtP och Single Player stöds inte: en delad enhet kan inte "lämna" appen
  // och komma tillbaka för övriga spelares skull.
  const spotifyEnabled =
    (params.spotifyEnabled ?? 'false') === 'true' &&
    gameMode === 'individual-devices';
  const spotifyAnswerYear = (params.spotifyAnswerYear ?? 'true') === 'true';
  const spotifyAnswerName = (params.spotifyAnswerName ?? 'true') === 'true';

  // Deterministisk svarstyp per Spotify-fråga baserat på Spotify-frågens ordinalposition.
  // Båda aktiva → alternerande per "Spotify-runda" = turnOrder.length Spotify-frågor.
  // Alla spelare möter samma svarstyp tills alla spelat lika många Spotify-låtar.
  // Spotify-ordinalposition räknas direkt från gameQuestions (djRotationPlan deklareras
  // efter detta useMemo och kan inte refereras här).
  function resolveSpotifyAnswerType(questionIdx: number): 'year' | 'name' {
    if (spotifyAnswerYear && spotifyAnswerName) {
      let spotifyOrdinal = 0;
      for (let i = 0; i < questionIdx && i < gameQuestions.length; i++) {
        const q = gameQuestions[i];
        if (q.type === 'timeline' && (q as { spotifyTrackId?: string }).spotifyTrackId) {
          spotifyOrdinal++;
        }
      }
      const numPlayers = Math.max(1, turnOrder.length);
      const spotifyRound = Math.floor(spotifyOrdinal / numPlayers);
      return spotifyRound % 2 === 0 ? 'year' : 'name';
    }
    return spotifyAnswerName ? 'name' : 'year';
  }

  // D-iv: host-styrt per-spelare audio (IndDev). Saknad key i mappen
  // tolkas client-side: host=on, övriga=off. Initial-fetch sker vid
  // mount (se separat useEffect nedan); incremental updates kommer via
  // player_audio_state_changed-broadcast. Deklareras tidigt så
  // isAudioMutedForSelf-compute:n längre ner kan läsa state utan TDZ.
  const [playerAudioOverrides, setPlayerAudioOverridesState] =
    useState<PlayerAudioOverrides>({});
  // Har spelaren själv rört sitt ljud på DENNA enhet (IndDev non-host)?
  // Mount-fetchen nedan ersätter hela overrides-mappen, så utan den här
  // flaggan kan en sen resolve nolla ett val användaren just gjort.
  const selfAudioTouchedRef = useRef(false);
  // Remote 1v1: varje spelare kör en egen solo-session på sin egen enhet, så
  // IndDev:s host-styrda overrides-map gäller inte här — ljudet ägs lokalt och
  // är PÅ som default på BÅDA enheterna. Spelaren kan stänga av det själv via
  // Audio-raden i GetReadyIntro:s Game settings (session-lokalt, inte sparat).
  const [remoteAudioOn, setRemoteAudioOn] = useState(true);
  // D-v: host-inactivity-watchdog. lastHostActivityRef speglar (a) host:s
  // egna tap-tid när isHost=true eller (b) senast mottagna host_active_ping
  // när isHost=false. Båda håller fönstret på "9 min utan host-aktivitet
  // = countdown startar; 10 min = shutdown". Init till mount-tid så timern
  // börjar tickande från quiz-entry istället för 1970-epoch.
  const lastHostActivityRef = useRef<number>(Date.now());
  // Throttle-skydd för host:s ping-broadcast (max 1 per 5s).
  const lastPingEmittedRef = useRef<number>(0);
  // Sätts true av shutdown-handler:n så den bara fyrar en gång även om
  // interval-tick:en gör flera överskridanden innan navigation-replace
  // hinner unmounta /quiz.
  const inactivityShutdownTriggeredRef = useRef(false);
  // Visar countdown-banner när non-null (60→0). null = host aktiv inom
  // 9 min, ingen banner.
  const [inactivityCountdownSec, setInactivityCountdownSec] =
    useState<number | null>(null);
  // D-vi: host-disconnect grace. När non-host:s peer-tracker markerar host
  // som disconnected i reveal-fas → 10-sek grace innan auto-route till
  // GetReady. graceActive driver tick:en, graceCountdownSec är null första
  // 7 sek (frozen reveal-UI) sen 3/2/1 sista 3 sek (visas som big-number-
  // overlay). graceStartRef håller starttiden lokalt så Date.now-diff är
  // drift-fri jämfört med en räknande state-variabel.
  const [hostDisconnectGraceActive, setHostDisconnectGraceActive] = useState(false);
  const [hostDisconnectGraceCountdownSec, setHostDisconnectGraceCountdownSec] =
    useState<number | null>(null);
  const hostDisconnectGraceStartRef = useRef<number | null>(null);
  // D-iii: bad-connection-detection. Övervakas via connectionMonitor som får
  // signaler från syncChannel:s state-events. Gating på
  // gameMode='individual-devices' sker per call-site (overlay + disabled-
  // props) — hooken är säker att anropa i båda lägen, monitor:n bara
  // rapporterar något i IndDev där syncChannel:n är aktiv.
  const connection = useConnectionStatus();
  const isConnectionUnstable =
    gameMode === 'individual-devices' && connection.status === 'unstable';
  // Sticky-latch: när unstable fyrar förblir overlay:n + input-låsningen
  // kvar tills spelaren explicit tappar Retry. ENDAST för non-host —
  // host:s monitor-recovery clearar overlay:n direkt eftersom host driver
  // broadcast-flödet och kan inte bail:a mid-game (det skulle frysa alla
  // andra devices i reveal). Host:s blip är därför rent live-state-driven.
  // OBS: latch-effekten + shouldLockForUnstable-deriveringen ligger längre
  // ner (efter Spotify DJ-state) — de behöver isDJAwayInSpotify-undantaget
  // som kräver isCurrentPlayerDJ/spotifyDJOpenedApp.
  const [stickyUnstableForQuestion, setStickyUnstableForQuestion] = useState(false);
  // YouTube-felhantering: sätts true när spelaren rapporterar embed-fel
  // (borttagen video, region-block, etc.). Triggar ett "Video unavailable"-kort
  // istället för MediaPlayer och auto-advancerar till reveal efter 2.5 s.
  // Resetas per fråga via useEffect nedan.
  const [youtubeError, setYoutubeError] = useState(false);
  // Antal rundor sätts av host i Lobby (slider 3–20, default 10). Fallback 5
  // om param saknas — t.ex. direkt-nav till /quiz utan att gå via Lobby.
  // SEED_QUESTIONS har 5 frågor i mock; för totalRounds > 5 cyklas listan via
  // modulo nedan tills riktig fråge-bank finns på plats.
  const totalRounds = Math.max(1, parseInt(String(params.roundsCount ?? '5'), 10));
  // Game era — host:s valda år-spann i Lobby (post-clamp mot youngest player).
  // Frågor filtreras på correctYear ∈ [eraFrom, eraTo] så bara perioderna
  // host valt visas i spelet. Defaults till maximalt range om params saknas
  // (t.ex. direkt-nav till /quiz utan Lobby).
  const eraFrom = parseInt(String(params.eraFrom ?? '1900'), 10);
  const eraTo = parseInt(String(params.eraTo ?? new Date().getFullYear()), 10);
  // Per-source profession-category-filter. YouTube: min 1, alla tre valbara.
  // Images: Actors/Athletes är mandatory (alltid inkluderade), Music valbar.
  const youtubeEnabledCategories = useMemo<MainCategory[]>(() => {
    if (!params.youtubeEnabledCategories) return ['Music', 'Film', 'Sport'];
    try {
      const parsed = JSON.parse(params.youtubeEnabledCategories);
      // Tom array [] är ett giltigt explicit val (= YouTube helt av).
      // Fallback till default BARA om parse misslyckas eller inte är array.
      if (!Array.isArray(parsed)) return ['Music', 'Film', 'Sport'];
      return parsed.filter(isMainCategory);
    } catch {
      return ['Music', 'Film', 'Sport'];
    }
  }, [params.youtubeEnabledCategories]);
  const imagesEnabledCategories = useMemo<MainCategory[]>(() => {
    if (!params.imagesEnabledCategories) return ['Music', 'Film', 'Sport'];
    try {
      const parsed = JSON.parse(params.imagesEnabledCategories);
      // Tom array [] är ett giltigt explicit val (= Images helt av).
      if (!Array.isArray(parsed)) return ['Music', 'Film', 'Sport'];
      return parsed.filter(isMainCategory);
    } catch {
      return ['Music', 'Film', 'Sport'];
    }
  }, [params.imagesEnabledCategories]);
  // Deriverade source-flags: YouTube aktiv om min 1 kategori vald, Images alltid aktiv.
  const youtubeEnabled = youtubeEnabledCategories.length > 0;
  const imagesEnabled = true;
  // Theme packages aktiva vid spelstart (host:s lobby-val, JSON-stringifierad
  // array av paket-IDs). Tom array = Generic. Default tom vid direkt-nav
  // utan Lobby. Behövs i HistoryEntry vid game-completion så Player history
  // visar vilket paket spelet kördes med.
  const selectedExtraPackages = useMemo<string[]>(() => {
    if (!params.selectedExtraPackages) return [];
    try {
      const parsed = JSON.parse(params.selectedExtraPackages);
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }, [params.selectedExtraPackages]);
  // Turordningen levereras som JSON-sträng från Lobby:s handleStartGame.
  // try/catch:en gör att en korrupt payload graceful degradar till tom lista
  // → 'intro'-fasen hoppas över istället för att skärmen fastnar tom.
  const turnOrder = useMemo<TurnOrderPlayer[]>(() => {
    if (!params.players) return [];
    try {
      const parsed = JSON.parse(params.players);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params.players]);

  // ── Remote 1v1: auktoritativ frågesekvens från remote_matches ────────
  // null tills init-effekten (efter gameQuestionsRef) hämtat/persisterat
  // question_ids. När satt override:ar den HELA gameQuestions-bygget så
  // båda spelare (och host-resume efter app-kill) renderar exakt samma
  // sekvens — lokal Math.random-shuffle används bara för host:s FÖRSTA
  // persist. remoteSessionReady sätts när även resume-seeden är klar;
  // render-gaten blockerar spelstart tills dess.
  const [remoteQuestionIds, setRemoteQuestionIds] = useState<string[] | null>(null);
  const [remoteSessionReady, setRemoteSessionReady] = useState(false);
  const remoteInitRanRef = useRef(false);

  // En "runda" = ett varv där alla spelare svarar en gång.
  //   Pass-the-Phone: spelarna turas om på samma enhet → 1 fråga per spelare
  //     per runda → totalQuestions = rundor × spelare. 4×4 = 16 frågor.
  //   Individual Devices: alla spelare svarar på SAMMA fråga samtidigt på
  //     egna enheter → 1 fråga per runda totalt → totalQuestions = rundor.
  //   Remote 1v1: solo-session (turnOrder = [self]) → rundor × 1 = rundor;
  //     clampas mot sekvens-längden om ids saknas i klientens katalog
  //     (app-version-skew mellan host och motståndare).
  // Math.max(1, ...) skyddar fallback-fallet då turnOrder är tom (direkt-nav
  // till /quiz utan Lobby).
  //
  // OBS: detta är det BEGÄRDA antalet. Det faktiska (`totalQuestions`) clampas
  // mot gameQuestions.length nedanför memon — se kommentaren där.
  const requestedQuestions =
    gameMode === 'remote-1v1' && remoteQuestionIds
      ? Math.max(1, Math.min(totalRounds, remoteQuestionIds.length))
      : gameMode === 'individual-devices'
        ? totalRounds
        : totalRounds * Math.max(1, turnOrder.length);

  // Pool av frågor för spelet, organiserad i ROUND-BLOCKS:
  //
  //   Pass-the-Phone-regel: alla spelare i samma rond ska få samma fråge-TYP
  //   (alla får YouTube-content, eller alla får image) men olika ITEMS.
  //   Mellan ronder växlar typen.
  //
  //   Pool-struktur (med 4 spelare per rond, alternerande typ):
  //     Round 0 (block 0, type=youtube): yt[0], yt[1], yt[2], yt[3]
  //     Round 1 (block 1, type=image):   img[0], img[1], img[2], img[3]
  //     Round 2 (block 2, type=youtube): yt[4], yt[5], yt[0], yt[1] (cykling)
  //     Round 3 (block 3, type=image):   img[4], img[5], img[6], img[7]
  //
  //   YouTube-poolen idag = enbart musik-items via SEED_QUESTIONS (= items
  //   med youtubeClips). Designad så att framtida non-music YouTube-content
  //   (sport, tal, comedy) kan addas till samma pool utan kod-ändring —
  //   gating + filter är källagnostiskt.
  //
  //   Individual Devices (parallel play): alla spelare svarar samma fråga
  //   samtidigt — round-block-strukturen är inte semantiskt nödvändig där men
  //   bryter ingenting heller. Kommer behöva omdesignas separat när Individual
  //   Devices flödet kopplas in (parkerad per Peter 2026-05-11).
  //
  // MÅSTE deklareras EFTER `turnOrder` — annars TDZ-error eftersom deps
  // läser turnOrder.length innan const är initialiserad.
  // Audience-set lyfts ut som top-level useMemo så det kan återanvändas
  // av image-variant-builderns runtime-generation (gameQuestions räknar
  // ut samma värde internt — pekar tillsammans mot samma sak).
  // Remote 1v1: bygg set:et ur BÅDA deltagarnas åldrar (ur match-snapshotten)
  // istället för turnOrder, som där bara innehåller spelaren själv. Annars får
  // en 1985-född och en 2001-född olika audience-set → olika distraktor-pool →
  // olika svarsalternativ på exakt samma fråga. Innan snapshotten hämtats
  // (remoteMatchAges === null) faller vi tillbaka på turnOrder; render-gaten
  // ("Preparing 1vs1 match") håller kvar spel-UI:t tills init-effekten är klar,
  // så ingen variant hinner byggas på det provisoriska set:et.
  const audienceSetForVariants = useMemo(() => {
    if (isRemote && remoteMatchAges) {
      return buildAudienceSet(remoteMatchAges.map((age) => ({ age }))) as Set<ImageQuestionAudience>;
    }
    return buildAudienceSet(turnOrder) as Set<ImageQuestionAudience>;
  }, [turnOrder, isRemote, remoteMatchAges]);

  // Fråge-IDs som hosten sett i tidigare omgångar — laddas från AsyncStorage
  // vid mount. Används av gameQuestions-useMemo för att ordna osedda frågor
  // först. Startar tom; uppdateras asynkront inom ~50 ms (innan spelaren
  // hinner trycka Play i GetReadyIntro).
  // MÅSTE deklareras FÖRE gameQuestions-useMemo (TDZ-fel annars).
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(new Set());
  const [lastSessionIds, setLastSessionIds] = useState<Set<string>>(new Set());
  // Host:ens epok-skuldbok. Laddas asynkront tillsammans med seen-historiken;
  // tom skuld ger exakt samma fördelning som förut tills den hunnit in.
  const [epochDebt, setEpochDebt] = useState<EpochDebt>(() => emptyEpochDebt());
  // Skuldboken EFTER att aktuellt spel planerats — skrivs av gameQuestions och
  // persisteras först när spelet faktiskt räknas som spelat.
  const plannedEpochDebtRef = useRef<EpochDebt | null>(null);
  // Bokför epok-skulden. Anropas på samma ställen som seen-historiken skrivs
  // (leaderboard / Quit / Leave) så ett avbrutet spel inte bokför skuld för
  // frågor spelaren aldrig såg. Nollar ref:en så samma spel bara bokförs en gång.
  const persistEpochLedger = useCallback(() => {
    const debt = plannedEpochDebtRef.current;
    if (!debt) return;
    plannedEpochDebtRef.current = null;
    saveEpochLedger(debt).catch(() => {});
  }, []);
  const savedSeenRef = useRef(false);

  // Cross-player-historik: frågor som NÅGON deltagare sett i sina senaste
  // 20 spel unioneras in här och exkluderas ur host:s pool-bygge — samma
  // låt ska inte återkomma bara för att en annan spelare hostar nästa spel.
  // Två tillförselvägar:
  //   (a) lobby_players.seen_question_ids (migration 0026) — joiners
  //       publicerar sin historik vid lobby-join; host unionerar vid Start
  //       Game och lämnar över via pendingSeenQuestions-storen (konsumeras
  //       i mount-effekten nedan). Enda vägen i Pass-the-Phone.
  //   (b) `player_seen_questions`-broadcast (IndDev fast-path) — non-hosts
  //       broadcastar vid quiz-mount; broadcasts som ankommer efter
  //       spelstart ignoreras (se handler) så poolen aldrig byggs om mitt
  //       i ett pågående spel.
  const [peerSeenIds, setPeerSeenIds] = useState<Set<string>>(new Set());
  const [peerLastIds, setPeerLastIds] = useState<Set<string>>(new Set());
  const combinedSeenIds = useMemo(
    () => (peerSeenIds.size === 0 ? seenQuestionIds : new Set([...seenQuestionIds, ...peerSeenIds])),
    [seenQuestionIds, peerSeenIds],
  );
  const combinedLastIds = useMemo(
    () => (peerLastIds.size === 0 ? lastSessionIds : new Set([...lastSessionIds, ...peerLastIds])),
    [lastSessionIds, peerLastIds],
  );

  const gameQuestions = useMemo<QuizQuestion[]>(() => {
    // Remote 1v1 med känd sekvens: DB:n är source of truth. Ids som saknas
    // i klientens katalog (app-version-skew) filtreras — bättre färre
    // frågor än crash; totalQuestions clampas mot längden nedan.
    if (gameMode === 'remote-1v1' && remoteQuestionIds) {
      return remoteQuestionIds
        .map((id) => ALL_QUESTIONS_MAP.get(id))
        .filter((q): q is QuizQuestion => q !== undefined);
    }
    // Filter-hierarki (i ordning, från hård → mjuk):
    //   1. Source-toggle (youtubeEnabled / imagesEnabled) — HÅRD. Host:s val.
    //   2. Era (correctYear ∈ [eraFrom, eraTo]) — HÅRD. Host:s val.
    //   3. Audience (union av spelares generationer) — PREFERENS. Relaxbar
    //      när era+audience är tom; era stannar alltid.
    //
    // ⚠ Audience är en NO-OP sedan 2026-08-16: alla katalog-items bär alla fem
    // generationer (backend/scripts/tag-all-audiences.ts), så steg 3 släpper
    // igenom allt. Mekaniken står kvar och återaktiveras så fort exkluderingar
    // cherry-pickas in. Notera då att relaxen nedan bara fyrar på en EXAKT TOM
    // pool, och att beslutet tas FÖRE kategori-filtret och FÖRE Spotify-
    // splitten — det var precis den kombinationen som gjorde att era 1950-1980
    // för en gen-z-spelare landade på ETT spelbart Music-item (Elvis) i varje
    // spel, trots 25 items kvar totalt. Se "Ingen repris inom 20 spel" i
    // CLAUDE.md.
    //
    // Rationale: era är en explicit host-väljning ("spel om 80-talet"). En
    // 80-talsspel ska ALDRIG visa låtar/items från 2020 även om alla spelare
    // är gen-z — det skulle bryta host:s era-intent. Däremot OK att visa
    // 80-talslåt med audiences=['elder'] till en gen-z-spelare när det är
    // enda alternativet inom 80-talsfönstret.
    //
    // Audience-set byggs en gång och delas mellan båda pools.
    const audienceSet = buildAudienceSet(turnOrder);

    // ── Music-pool ────────────────────────────────────────────────────
    // Era HÅRD: filtrera SEED_QUESTIONS på correctYear ∈ [eraFrom, eraTo].
    // Bygg music-pool när YT är aktivt ELLER Spotify är aktivt — Spotify DJ
    // är en separat toggle och ska fungera även när youtubeEnabledCategories=[].
    const inEraMusic = (youtubeEnabled || spotifyEnabled)
      ? SEED_QUESTIONS.filter(
          (q) => q.correctYear !== undefined
            ? q.correctYear >= eraFrom && q.correctYear <= eraTo
            : true,
        )
      : [];
    // Audience MJUK: filtrera era-träffarna ytterligare. MUSIC_QUESTIONS har
    // `audiences`-prop; SEED_QUESTIONS-mappen droppar fältet, så vi filtrerar
    // mot id-set:en från MUSIC_QUESTIONS.
    const audienceAllowedMusicIds = new Set(
      filterByAudience(MUSIC_QUESTIONS, audienceSet).map((q) => q.id),
    );
    const inEraAudienceMusic = inEraMusic.filter((q) =>
      audienceAllowedMusicIds.has(q.id),
    );
    // Fallback: era + audience → era-only (audience relaxas, era HÅRD).
    // Tom era-only-array → pool tom (youtubeEnabled=false eller era-fönster
    // utan items). Inga fallbacks som strippar era — host:s era-intent
    // respekteras alltid.
    const youtubePoolPreCategory: QuizQuestion[] =
      inEraAudienceMusic.length > 0 ? inEraAudienceMusic : inEraMusic;
    // ── Image-pool ────────────────────────────────────────────────────
    // Era HÅRD för icke-person-items: peak-recognition-fönster när det finns,
    // annars correctYear för eventbaserade items (t.ex. sport-events, platser).
    //
    // Person-items (artist/band/actor/athlete): correctYear = födelseår, INTE
    // eventår. Utan explicit peakFrom/peakTo är person-items ERA-AGNOSTISKA —
    // födelseåret ska aldrig era-filtrera bort t.ex. Michael Jackson (f.1958)
    // från ett spel med era 1980-nu. Peak används om tillgängligt.
    const PERSON_SUBJECTS = new Set([
      'artist', 'band', 'actor', 'character', 'athlete', 'celebrity', 'cultural-person',
    ]);
    const inEraImages = imagesEnabled
      ? IMAGE_SEED_QUESTIONS.filter((q) => {
          if (q.peakFrom !== undefined && q.peakTo !== undefined) {
            // Interval-overlap: [eraFrom, eraTo] ∩ [peakFrom, peakTo] ≠ ∅
            return eraFrom <= q.peakTo && eraTo >= q.peakFrom;
          }
          // Person utan peak: era-agnostisk (födelseår är inte ett eventår).
          if (PERSON_SUBJECTS.has(q.source.contentSubject)) {
            return true;
          }
          if (q.correctYear !== undefined) {
            return q.correctYear >= eraFrom && q.correctYear <= eraTo;
          }
          // Era-agnostisk — alltid inkluderad.
          return true;
        })
      : [];
    // Audience MJUK: filtrera era-träffarna ytterligare. Samma pattern som
    // music — IMAGE_SEED_QUESTIONS droppar `audiences`, filtrera mot id-set.
    const audienceAllowedImageIds = new Set(
      filterByAudience(IMAGE_QUIZ_QUESTIONS, audienceSet).map((q) => q.id),
    );
    const inEraAudienceImages = inEraImages.filter((q) =>
      audienceAllowedImageIds.has(q.id),
    );
    // Fallback: era + audience → era-only. Era HÅRD.
    const imagePoolPreCategory: QuizQuestion[] =
      inEraAudienceImages.length > 0 ? inEraAudienceImages : inEraImages;

    // ── Per-source category-filter ───────────────────────────────────
    // YouTube: filtreras mot youtubeEnabledCategories (Music/Film/Sport).
    // Guess Where?: bara platsfrågor med null mainCategory (städer/länder).
    //   Personbilder (artist/band/actor/athlete — non-null mainCategory) är
    //   juridiskt parkerade och aldrig inkluderade oavsett toggles.
    const isAllYoutubeCats =
      youtubeEnabledCategories.length === 3 &&
      youtubeEnabledCategories.includes('Music') &&
      youtubeEnabledCategories.includes('Film') &&
      youtubeEnabledCategories.includes('Sport');
    const youtubePool = isAllYoutubeCats
      ? youtubePoolPreCategory
      : youtubePoolPreCategory.filter((q) =>
          itemMatchesEnabledCategories(
            q.mainCategory,
            youtubeEnabledCategories,
            q.type === 'timeline' ? q.genrePackages : undefined,
          ),
        );
    // Hints-pool: alla image-items renderas via HintsQuizCard (flagga + progressiva
    // ledtrådar). Items med data i HINTS_LIBRARY får faktiska hints; övriga visar
    // placeholders tills backend-script populerar HINTS_LIBRARY med Wikidata-data.
    const isAllImageCats =
      imagesEnabledCategories.length === 3 &&
      imagesEnabledCategories.includes('Music') &&
      imagesEnabledCategories.includes('Film') &&
      imagesEnabledCategories.includes('Sport');
    const imagePool: QuizQuestion[] = isAllImageCats
      ? imagePoolPreCategory
      : imagePoolPreCategory.filter((q) => {
          const mc = q.mainCategory;
          return isAllImageCats ? true : mc !== null && imagesEnabledCategories.includes(mc);
        });

    // ── Spotify-pool (separat tredje pool) ──────────────────────────────
    // Byggs från pre-category-poolen (youtubePoolPreCategory) för att vara
    // oberoende av youtubeEnabledCategories — Spotify DJ ska fungera även
    // när YT Music är avstängt (youtubeEnabledCategories=[] eller Music saknas).
    const spotifyPool: QuizQuestion[] = spotifyEnabled
      ? youtubePoolPreCategory.filter((q) => q.type === 'timeline' && q.spotifyTrackId)
      : [];
    // Ren YouTube-pool: category-filtrad pool minus Spotify-items.
    // När Spotify är AV: filtrera bort Spotify-only items (har spotifyTrackId men
    // tomma youtubeClips) — de kan inte spelas utan Spotify-appen.
    const pureYoutubePool: QuizQuestion[] = spotifyEnabled
      ? youtubePool.filter((q) => !(q.type === 'timeline' && q.spotifyTrackId))
      : youtubePool.filter(
          (q) =>
            !(
              q.type === 'timeline' &&
              q.spotifyTrackId &&
              (!q.youtubeClips || q.youtubeClips.length === 0)
            ),
        );

    const playerCount = Math.max(1, turnOrder.length);
    const hasSpotify = spotifyPool.length > 0;
    const hasPureYoutube = pureYoutubePool.length > 0;
    const hasImage = imagePool.length > 0;

    // Edge case: alla pooler tomma → sista-utvägs-fallback.
    // Använd bara YouTube SEED_QUESTIONS om YouTube faktiskt är aktiverat;
    // annars returnera bildpool ignorerandes era (era-filter kan ha tömt poolen).
    if (!hasSpotify && !hasPureYoutube && !hasImage) {
      // Shufflas — även nödfallback ska vara slumpad, inte katalog-ordning.
      if (youtubeEnabled) return shuffleArray(SEED_QUESTIONS);
      // YouTube av, Hints tom pga era-filter eller saknad data → visa alla
      // person-items utan era-filter som nödlösning.
      const fallbackImages = IMAGE_SEED_QUESTIONS.filter(
        (q) => PERSON_SUBJECTS.has(q.source.contentSubject),
      );
      return fallbackImages.length > 0 ? shuffleArray(fallbackImages) : shuffleArray(SEED_QUESTIONS);
    }

    // ── Guest-hostat spel: slumpad käll-mix (Peters trial-design 2026-07-04) ──
    // Ersätter fas/epok-allokeringen nedan. Mixerboarden är guest-låst
    // (alla kategorier ON) så poolerna är ofiltrerade; källvariationen
    // skapas istället här. IndDev-korrekthet krävs bara på HOST-enheten —
    // non-host renderar exakt hostens frågor via broadcast question_ids.
    if (isGuestHostGame) {
      // Spotify i guest-spel (50/50-slant, kräver IndDev — spotifyEnabled
      // är redan hårt gated på gameMode==='individual-devices'):
      //   • rounds == players (2-2 eller 4-4) → HELA spelet blir Spotify.
      //   • 2 spelare + 4 rundor → PARTIELLT: exakt 2 Spotify-frågor
      //     (insprängda på slumpade positioner bland viktade dragningar).
      // I båda fallen ger DJ-round-robin (djRotationPlan) varje spelare
      // exakt en DJ-tur. Slanten (50 %) avgör per spel om Spotify alls
      // spelas — övriga spel kör ren viktad käll-slump.
      const fullSpotifyEligible =
        spotifyEnabled &&
        totalRounds === turnOrder.length &&
        spotifyPool.length >= totalRounds;
      const partialSpotifyEligible =
        spotifyEnabled &&
        turnOrder.length === 2 &&
        totalRounds === 4 &&
        spotifyPool.length >= 2;
      let guestSpotifyCount = 0;
      if ((fullSpotifyEligible || partialSpotifyEligible) && Math.random() < 0.5) {
        guestSpotifyCount = fullSpotifyEligible ? totalRounds : 2;
      }
      // Färskhets-ordnad Spotify-pool (osedda → sedda → senaste sessionen),
      // samma 3-nivå-mönster som den ordinarie Spotify-fasen nedan. Utan den
      // drog guest-spelen rakt ur en shufflad pool och kunde upprepa exakt
      // samma låtar två spel i rad.
      const spotifyByFreshness = [
        ...shuffleArray(spotifyPool.filter((q) => !combinedSeenIds.has(q.id) && !combinedLastIds.has(q.id))),
        ...shuffleArray(spotifyPool.filter((q) => combinedSeenIds.has(q.id) && !combinedLastIds.has(q.id))),
        ...shuffleArray(spotifyPool.filter((q) => combinedLastIds.has(q.id))),
      ];
      if (fullSpotifyEligible && guestSpotifyCount === totalRounds) {
        return spotifyByFreshness.slice(0, totalRounds);
      }
      // Viktad OBEROENDE dragning per fråga över 6 källa×kategori-celler.
      // Hints-tungt (75 %) med YouTube-inslag (25 %) — maximerar upplevd
      // variation i korta 2-4-frågors trial-spel. Vid partiellt Spotify-
      // spel dras (guestTotal − 2) frågor här och Spotify-frågorna sprängs
      // in efteråt.
      const byCat = (pool: QuizQuestion[], cat: MainCategory) =>
        pool.filter((q) => q.mainCategory === cat);
      const cells = [
        { pool: byCat(pureYoutubePool, 'Music'), weight: 0.15 },
        { pool: byCat(pureYoutubePool, 'Film'), weight: 0.05 },
        { pool: byCat(pureYoutubePool, 'Sport'), weight: 0.05 },
        { pool: byCat(imagePool, 'Music'), weight: 0.25 },
        { pool: byCat(imagePool, 'Film'), weight: 0.2 },
        { pool: byCat(imagePool, 'Sport'), weight: 0.3 },
      ];
      // Totalt antal frågor = rundor × block-storlek (PtP: en fråga per
      // spelare och runda; IndDev/Single: en per runda) — speglar
      // questionsPerBlock-formeln i ordinarie flödet nedan.
      const guestQpb =
        gameMode === 'individual-devices' || playerCount <= 1 ? 1 : playerCount;
      const guestTotal = totalRounds * guestQpb;
      // Partiellt Spotify-spel: reservera slots för Spotify-frågorna —
      // viktade dragningen fyller bara resten.
      const weightedTotal = guestTotal - guestSpotifyCount;
      const picked = new Set<string>();
      const drawn: QuizQuestion[] = [];
      for (let i = 0; i < weightedTotal; i++) {
        // Dedupe + renormalisering: celler vars pool är uttömd utesluts och
        // vikterna omfördelas proportionellt över resterande.
        const avail = cells
          .map((c) => ({ weight: c.weight, pool: c.pool.filter((q) => !picked.has(q.id)) }))
          .filter((c) => c.pool.length > 0);
        let pickPool: QuizQuestion[];
        if (avail.length === 0) {
          // Alla celler uttömda (mycket små pooler) → dra ur samlade
          // poolen utan dedupe hellre än att korta spelet.
          pickPool = [...pureYoutubePool, ...imagePool];
          if (pickPool.length === 0) break;
        } else {
          const totalW = avail.reduce((sum, c) => sum + c.weight, 0);
          let r = Math.random() * totalW;
          let chosen = avail[avail.length - 1];
          for (const c of avail) {
            r -= c.weight;
            if (r <= 0) {
              chosen = c;
              break;
            }
          }
          pickPool = chosen.pool;
        }
        // Färskhets-prioriterat val inom cellen (osedd → sedd → senaste
        // sessionen). Tidigare drogs det helt uniformt, så guest-hostade spel
        // ignorerade 20-spelars-historiken helt — `picked` deduperade bara
        // INOM samma spel, aldrig mellan två spel i rad.
        const q = pickTiered(pickPool, combinedSeenIds, combinedLastIds, (x) => x.id);
        if (!q) break;
        picked.add(q.id);
        drawn.push(q);
      }
      // Partiellt Spotify-spel: spräng in Spotify-frågorna på slumpade
      // positioner i den viktade sekvensen. DJ-round-robin scannar
      // gameQuestions i ordning och tilldelar DJ per Spotify-fråga —
      // positionerna spelar ingen roll för att båda spelarna ska få
      // varsin DJ-tur.
      if (guestSpotifyCount > 0) {
        const spotifyPicks = spotifyByFreshness.slice(0, guestSpotifyCount);
        for (const sq of spotifyPicks) {
          const pos = Math.floor(Math.random() * (drawn.length + 1));
          drawn.splice(pos, 0, sq);
        }
      }
      if (drawn.length > 0) return drawn;
      // Defensivt: inget kunde dras (borde inte hända — all-tomt-fallbacken
      // ovan har redan hanterat helt tomma pooler) → fall igenom till
      // ordinarie allokering.
    }

    // ── Epok-viktad frågeurval (ersätter prioritiseUnseen + kategori-gruppering) ──
    //
    // PtP (questionsPerBlock > 1): frågor tilldelas spelare via födelseårs-affinitet
    // och ordnas om till turordnings-slots.
    // IndDev / Single Player (questionsPerBlock = 1): epok-ordning utan spelar-
    // tilldelning — alla spelare ser identiska frågor simultant.

    const questionsPerBlock = (gameMode === 'individual-devices' || playerCount <= 1) ? 1 : playerCount;
    const isPtP = questionsPerBlock > 1;
    const activeEpochs = getActiveEpochs(eraFrom, eraTo);

    const currentYear = new Date().getFullYear();
    const epochPlayers: EpochPlayer[] = turnOrder.map((p) => {
      const birthYear = currentYear - (p.age ?? 35);
      return {
        id: p.id,
        birthYear,
        generation: getGenerationKeyFromBirthYear(birthYear) ?? 'millennials',
      };
    });
    const turnOrderIds = turnOrder.map((p) => p.id);

    // Epoch year för YouTube-frågor: correctYear är utgivningsåret → direkt lookup.
    const youtubeEpochYear = (q: EpochQuestion): number | null =>
      q.correctYear !== undefined ? q.correctYear : null;

    // Epoch year för Image/Hints-frågor: peakFrom/peakTo midpoint om satt,
    // annars birthYear (correctYear) + 25 som proxy för karriärspeak.
    const imageEpochYear = (q: EpochQuestion): number | null => {
      if (q.peakFrom !== undefined && q.peakTo !== undefined) {
        return Math.round((q.peakFrom + q.peakTo) / 2);
      }
      if (q.correctYear !== undefined) {
        return q.correctYear + 25;
      }
      return null;
    };

    // ── Fas-storlekar (Spotify / YouTube / Image) ──
    // Ratio med Spotify (IndDev):  37,5% Spotify / 37,5% YouTube / 25% Hints.
    // Ratio utan Spotify (PtP/SP): 75% YouTube / 25% Hints.
    //
    // Hints finns för att spelet inte ska stå och falla med Spotify och
    // YouTube — det är utfyllnad, inte en dragare. Därför storleksbestäms
    // Hints FÖRST och golvas till en fjärdedel; resten går till de källor
    // spelarna faktiskt engageras av. (Tidigare tog Hints halva spelet OCH
    // absorberade all avrundningsrest, vilket kunde ge 67%.)
    //
    // Följden av golvningen: vid 2-3 rundor får Hints noll, och resten hamnar
    // strax UNDER 25% istället för över. Bådadera avsiktligt.
    let imageBlockCount = hasImage ? Math.floor(totalRounds / 4) : 0;
    let restBlocks = totalRounds - imageBlockCount;

    // ── Spotify: antalet MÅSTE vara ett helt antal DJ-varv ────────────────
    // DJ:n tilldelas round-robin över Spotify-frågorna (djRotationPlan:
    // `spotifyQuestionIndices.length % djPlayers.length`), så om antalet inte
    // är jämnt delbart med spelarantalet blir någon DJ oftare än andra. Med
    // 2 rundor + 2 spelare gav den råa 37,5%-kvoten 1 Spotify-fråga → bara
    // spelare 1 fick DJ:a. Golvas därför till helt antal varv, men aldrig
    // under ETT varv: en påslagen Spotify-toggle ska synas i spelet.
    //
    // Spotify är hårt gated till IndDev där questionsPerBlock = 1, så block
    // = frågor här och varv-matematiken går rakt på blocken.
    const canRotateDJ = hasSpotify && playerCount > 0 && totalRounds >= playerCount;
    let spotifyBlockCount = 0;
    if (canRotateDJ) {
      // Cap mot spotifyPool.length: ingen låt ska kunna dyka upp hos två olika DJs.
      const rawSpotify = Math.min(Math.floor(restBlocks / 2), spotifyPool.length);
      const rotations = Math.max(1, Math.floor(rawSpotify / playerCount));
      const capped = Math.min(rotations * playerCount, spotifyPool.length, totalRounds);
      // Re-golva efter cappningen — pool- eller rundtaket kan ha kapat mitt i ett varv.
      spotifyBlockCount = Math.floor(capped / playerCount) * playerCount;
      // Ett påtvingat varv kan vara större än resten efter Hints — ta då från Hints.
      if (spotifyBlockCount > restBlocks) {
        imageBlockCount = totalRounds - spotifyBlockCount;
        restBlocks = spotifyBlockCount;
      }
    }
    // Färre rundor än spelare → inget helt varv ryms. Spotify utgår hellre än
    // att bara en delmängd av spelarna får DJ:a (Peter 2026-08-14). Undantaget
    // är Spotify-only nedan, där noll skulle lämna spelet helt utan frågor.

    let ytBlockCount = hasPureYoutube ? restBlocks - spotifyBlockCount : 0;

    // Degenererade lägen: en otillgänglig källas block går till de andra så
    // spelet aldrig blir kortare än begärt antal rundor. Hints går FÖRE Spotify
    // i turordningen — annars skulle utfyllnaden lägga till lösa Spotify-frågor
    // och bryta DJ-varvet. Spotify tar resten bara när ingen annan källa finns,
    // och då är ojämna DJ-turer det enda alternativet till ett tomt spel.
    const unallocated = totalRounds - spotifyBlockCount - ytBlockCount - imageBlockCount;
    if (unallocated > 0) {
      if (hasPureYoutube) ytBlockCount += unallocated;
      else if (hasImage) imageBlockCount += unallocated;
      else if (hasSpotify) spotifyBlockCount = Math.min(spotifyBlockCount + unallocated, spotifyPool.length);
    }

    // Fas 1: Spotify — hård uteslutning av senaste 20 sessionernas låtar,
    // för ALLA deltagare (combinedSeenIds = egen + peers historik).
    // Fallback till hela poolen (slumpad) om för få osedda finns.
    const spotifyTotal = spotifyBlockCount * questionsPerBlock;
    const spotifySeq: QuizQuestion[] = (() => {
      if (!hasSpotify || spotifyTotal === 0) return [];
      const fresh = shuffleArray(
        spotifyPool.filter((q) => !combinedSeenIds.has(q.id) && !combinedLastIds.has(q.id)),
      );
      // Tillräckligt med osedda? Använd bara dem.
      if (fresh.length >= spotifyTotal) return fresh.slice(0, spotifyTotal);
      // För få osedda → använd ALLA osedda först och fyll upp med slumpade
      // sedda (senaste sessionens låtar allra sist). Tidigare reshufflades
      // HELA poolen här, vilket kunde välja enbart sedda låtar trots att
      // osedda fanns kvar — det bröt 20-spels-logiken i exakt det läge den
      // behövdes som mest (liten era-filtrerad pool).
      const seenNotLast = shuffleArray(
        spotifyPool.filter((q) => combinedSeenIds.has(q.id) && !combinedLastIds.has(q.id)),
      );
      const lastSession = shuffleArray(
        spotifyPool.filter((q) => combinedLastIds.has(q.id)),
      );
      return [...fresh, ...seenNotLast, ...lastSession].slice(0, spotifyTotal);
    })();

    // ── Epok-plan för hela spelet ur Host:ens skuldbok ────────────────────
    // Planeras EN gång och skivas mellan YouTube- och Hints-faserna (Spotify-
    // fasen är epok-lös). Utan detta räknade varje kategori-anrop om LRM från
    // noll, och med kategori-splittens N=1 vid låga rundantal gav det alltid
    // samma epok — E1:s 11% avrundades bort i vartenda spel.
    const ytTotal = ytBlockCount * questionsPerBlock;
    const imgTotal = imageBlockCount * questionsPerBlock;
    const { sequence: plannedEpochs, nextDebt } = planEpochSequence(
      ytTotal + imgTotal,
      activeEpochs,
      epochDebt,
    );
    // Sidoeffekt i useMemo: skuldboken skrivs inte till disk här, bara
    // parkeras. Den persisteras vid samma punkter som seen-historiken
    // (leaderboard / Quit / Leave) så ett avbrutet spel inte bokför skuld
    // för frågor spelaren aldrig såg.
    plannedEpochDebtRef.current = nextDebt;

    // Fas 2: YouTube — kategori-alignerade block (PtP: alla spelare i ett
    // block får samma mainCategory, t.ex. alla YouTube/Music i samma runda).
    // shuffleBlocks bryter den kronologiska epok-ordningen från
    // buildEpochPhase; per fas så källordningen nedan bevaras.
    const ytSeq: QuizQuestion[] =
      hasPureYoutube && ytBlockCount > 0
        ? shuffleBlocks(
            buildCategoryAlignedPhase<QuizQuestion>({
              pool: pureYoutubePool,
              totalBlocks: ytBlockCount,
              questionsPerBlock,
              activeEpochs,
              recentIds: combinedSeenIds,
              lastSessionIds: combinedLastIds,
              isPtP,
              players: epochPlayers,
              turnOrderIds,
              getEpochYear: youtubeEpochYear,
              epochSequence: plannedEpochs.slice(0, ytTotal),
            }),
            questionsPerBlock,
          )
        : [];

    // Fas 3: Image/Hints — kategori-alignerade block.
    const imgSeq: QuizQuestion[] =
      hasImage && imageBlockCount > 0
        ? shuffleBlocks(
            buildCategoryAlignedPhase<QuizQuestion>({
              pool: imagePool,
              totalBlocks: imageBlockCount,
              questionsPerBlock,
              activeEpochs,
              recentIds: combinedSeenIds,
              lastSessionIds: combinedLastIds,
              isPtP,
              players: epochPlayers,
              turnOrderIds,
              getEpochYear: imageEpochYear,
              epochSequence: plannedEpochs.slice(ytTotal),
            }),
            questionsPerBlock,
          )
        : [];

    const mixed: QuizQuestion[] = [...spotifySeq, ...ytSeq, ...imgSeq];

    // Nödfallback: alla pools tomma (t.ex. source-toggle av + era utan träffar).
    // Shufflas — även nödfallback ska vara slumpad, inte katalog-ordning.
    if (mixed.length === 0) {
      if (!youtubeEnabled) {
        const personFallback = IMAGE_SEED_QUESTIONS.filter(
          (q) => PERSON_SUBJECTS.has(q.source.contentSubject),
        );
        return shuffleArray<QuizQuestion>(
          personFallback.length > 0 ? personFallback : IMAGE_SEED_QUESTIONS.length > 0 ? IMAGE_SEED_QUESTIONS : SEED_QUESTIONS,
        );
      }
      return shuffleArray(SEED_QUESTIONS);
    }
    return mixed;
  }, [eraFrom, eraTo, turnOrder, totalRounds, youtubeEnabled, imagesEnabled, gameMode, youtubeEnabledCategories, imagesEnabledCategories, combinedSeenIds, combinedLastIds, spotifyEnabled, isGuestHostGame, remoteQuestionIds, epochDebt]);

  // Det FAKTISKA antalet frågor: aldrig fler än poolen faktiskt levererade.
  //
  // Tidigare var totalQuestions enbart rundor-härlett medan frågan hämtades som
  // `gameQuestions[questionIndex % gameQuestions.length]` — en tunn pool wrappade
  // alltså runt och visade samma fråga två gånger i SAMMA spel. Ett något kortare
  // spel är ärligare än en repris. Remote 1v1 clampade redan mot sin sekvens;
  // det här ger övriga lägen samma skydd.
  const totalQuestions = Math.max(1, Math.min(requestedQuestions, gameQuestions.length));

  // Synkron ref som alltid pekar på aktuell gameQuestions — används av
  // game_sequence_init-broadcasten utan att göra subscription-effekten
  // beroende av gameQuestions (vilket skulle orsaka re-subscribe).
  const gameQuestionsRef = useRef<typeof gameQuestions>(gameQuestions);
  useEffect(() => { gameQuestionsRef.current = gameQuestions; }, [gameQuestions]);

  // ── Remote 1v1 init: sekvens-auktoritet + resume ─────────────────────
  // Körs EN gång vid mount (efter gameQuestionsRef-syncen ovan):
  //   1. Hämta matchen. question_ids null + host → persistera den lokalt
  //      genererade sekvensen EN gång (RPC-guard: question_ids IS NULL —
  //      en host-resume kan aldrig skriva över med ny shuffle).
  //   2. Polla tills sekvensen finns (motståndare kan ha navigerat in
  //      sekunder före host:s persist-write).
  //   3. Resume: seeda rounds/allRoundScoresHistory/questionIndex från
  //      egna remote_match_answers så en app-kill mitt i matchen återupptas
  //      vid första obesvarade frågan. Allt besvarat → direkt leaderboard.
  useEffect(() => {
    if (!isRemote || !remoteMatchId) return;
    if (remoteInitRanRef.current) return;
    remoteInitRanRef.current = true;
    let cancelled = false;
    (async () => {
      let match = await getMatch(remoteMatchId);
      if (cancelled) return;
      if (match && !match.questionIds && isHost) {
        const localIds = gameQuestionsRef.current
          .slice(0, totalRounds)
          .map((q) => q.id);
        if (localIds.length > 0) {
          await persistQuestionSequence(remoteMatchId, localIds);
        }
        match = await getMatch(remoteMatchId);
      }
      // Matchen kan ha avslutats mellan navigationen och denna fetch —
      // motståndaren tryckte "Quit match" (status 'forfeited') eller host
      // avbröt via den äldre cancel-vägen ('cancelled'). Visa kvittot och
      // skicka hem istället för att fastna i "Preparing"-spinnern.
      const bailIfEnded = async (m: typeof match): Promise<boolean> => {
        if (!m || m.status === 'active') return false;
        let title = 'Match ended';
        let body = 'This 1vs1 match is no longer active.';
        if (m.status === 'cancelled') {
          title = 'Lobby deleted by Host';
          body = 'The Host has cancelled this 1vs1 match.';
        } else if (m.status === 'forfeited') {
          const myId = await getOwnUserId();
          const iWon = !!myId && m.winnerUserId === myId;
          title = iWon ? 'You won — walkover!' : 'Match ended';
          body = iWon
            ? 'Your opponent quit the match, so you win by walkover.'
            : 'You quit this 1vs1 match — it cannot be resumed.';
        } else if (m.questionIds && m.questionIds.length > 0) {
          // finished/void/expired_walkover MED sekvens: låt resume-seeden
          // ta över (allt besvarat → direkt leaderboard + resultatpanel).
          return false;
        }
        // ...utan sekvens finns inget att spela — bail istället för att
        // fastna i poll-loopen nedan (som väntar på question_ids).
        Alert.alert(title, body, [{ text: 'OK', onPress: () => router.replace('/') }], {
          cancelable: false,
        });
        return true;
      };
      if (await bailIfEnded(match)) return;
      // Vänta in sekvensen (host-persist in-flight eller motståndare-race).
      while (!cancelled && (!match || !match.questionIds || match.questionIds.length === 0)) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (cancelled) return;
        match = await getMatch(remoteMatchId);
        if (await bailIfEnded(match)) return;
      }
      if (cancelled || !match?.questionIds) return;
      // Båda deltagarnas åldrar → gemensamt audience-set för variant-bygget
      // (se audienceSetForVariants). Sätts FÖRE remoteSessionReady så första
      // frågans alternativ byggs på det match-breda set:et direkt.
      const ages = match.players
        .map((p) => p.age)
        .filter((a): a is number => typeof a === 'number');
      setRemoteMatchAges(ages);
      const ids = match.questionIds.filter((id) => ALL_QUESTIONS_MAP.has(id));
      if (ids.length === 0) {
        // Katalog-skew: inga av matchens frågor finns i denna app-version.
        Alert.alert(
          'Update required',
          'This match uses questions from a newer app version. Update QuizVibe to play it.',
          [{ text: 'OK', onPress: () => router.replace('/') }],
          { cancelable: false },
        );
        return;
      }
      setRemoteQuestionIds(ids);
      // Resume-seed från egna svar (idempotent upsert per question_index).
      const answers = await getMyAnswers(remoteMatchId);
      if (cancelled) return;
      const byIndex = new Map(answers.map((a) => [a.questionIndex, a]));
      let firstUnanswered = 0;
      while (byIndex.has(firstUnanswered)) firstUnanswered++;
      if (firstUnanswered > 0) {
        const seedScores: RoundScore[][] = [];
        const seedRounds: RoundResult[] = [];
        for (let i = 0; i < firstUnanswered; i++) {
          const a = byIndex.get(i)!;
          const q = ALL_QUESTIONS_MAP.get(a.questionId);
          seedScores.push([{
            playerId: selfPlayerId || 'you',
            points: a.points,
            correct: a.correct,
            timeUsed: a.timeUsedSeconds,
          }]);
          seedRounds.push({
            questionNumber: i + 1,
            category: q?.category ?? 'songs',
            question: q?.question ?? '',
            correctYear: q?.type === 'timeline' ? q.correctYear : 0,
            selectedYear: 0,
            correct: a.correct,
            points: a.points,
            timeUsed: a.timeUsedSeconds,
          });
        }
        setAllRoundScoresHistory(seedScores);
        setRounds(seedRounds);
        const total = Math.max(1, Math.min(totalRounds, ids.length));
        if (firstUnanswered >= total) {
          // Alla frågor redan besvarade — hoppa direkt till slutskärmen.
          // Leaderboard-effekten kör finalize (idempotent server-side).
          setQuestionIndex(total - 1);
          setPhase('leaderboard');
        } else {
          setQuestionIndex(firstUnanswered);
        }
      }
      setRemoteSessionReady(true);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemote, remoteMatchId, isHost]);

  // Media-källa per fråga (driver GetReadyIntro:s IndDev media-kö).
  // Image-frågor → 'image'; timeline-frågor (YouTube-content idag, men
  // pickMediaSource är källagnostisk så future YouTube-non-music kommer
  // hit oförändrat) → kör pickMediaSource för att se om YouTube är aktiv
  // för just den frågan givet host:s toggles.
  // Memoiseras parallellt med gameQuestions så ingen tomt-laddning sker i
  // render-loop.
  const mediaSourceByQuestion = useMemo<QuestionMediaType[]>(() => {
    return gameQuestions.map((q) => {
      if (q.type === 'image') return 'image';
      // Spotify-frågor från den separata Spotify-poolen identifieras via
      // spotifyTrackId + spotifyEnabled. Dessa hanteras av DJ-flödet, inte
      // YouTube-spelaren — returnera 'spotify' för korrekt kö-ikon i GetReadyIntro.
      if (spotifyEnabled && q.type === 'timeline' && q.spotifyTrackId) return 'spotify';
      const picked = pickMediaSource(
        { youtubeClips: q.youtubeClips },
        { youtubeEnabled, gameMode },
      );
      if (picked.kind === 'youtube') return 'youtube';
      return 'none';
    });
  }, [gameQuestions, youtubeEnabled, gameMode, spotifyEnabled]);

  // Host:s fråge-sekvens (alla fråge-IDs i host:s spel-ordning) — mottaget via
  // play_command.all_question_ids. Non-host använder detta för att beräkna
  // korrekta media-source-ikoner i GetReady-kön (mediaSourceByQuestion är annars
  // baserad på lokal shuffle-ordning som skiljer sig från host:s).
  // Deklareras här (innan effectiveMediaSourceByQuestion-memo:t som refererar det).
  const [broadcastAllQuestionIds, setBroadcastAllQuestionIds] = useState<string[] | null>(null);
  // Host:s spotifyAnswerYear/Name-inställningar, broadcastade till non-host via
  // game_sequence_init / play_command / question_advance så GetReady-kön kan visa
  // rätt Year/Name-badge för kommande Spotify-frågor utan att använda non-hostens
  // egna profil-inställningar.
  const [broadcastHostSpotifyAnswerYear, setBroadcastHostSpotifyAnswerYear] = useState<boolean | null>(null);
  const [broadcastHostSpotifyAnswerName, setBroadcastHostSpotifyAnswerName] = useState<boolean | null>(null);

  // Non-host override: bygg mediaSourceByQuestion från host:s auktoritativa fråge-sekvens
  // (broadcastAllQuestionIds) via ALL_QUESTIONS_MAP. Utan detta visar non-host felaktiga
  // ikoner i GetReady-kön (lokal shuffle ≠ host:s ordning).
  const effectiveMediaSourceByQuestion = useMemo<QuestionMediaType[]>(() => {
    // isRemote: `gameQuestions` ÄR matchens auktoritativa sekvens för BÅDA
    // roller (remote-override:n mappar remote_matches.question_ids), och
    // render-gaten släpper inte fram GetReadyIntro innan den laddats. Utan
    // detta undantag hamnar remote-motståndaren i broadcast-grenen nedan —
    // men remote har ingen sync-channel, så broadcastAllQuestionIds förblir
    // null och kön fastnade på ❓/"Unknown".
    if (isHost || isRemote) return mediaSourceByQuestion;
    // Innan host:s fråge-sekvens ankommit (broadcastAllQuestionIds null):
    // returnera tom array så inga ikoner visas hellre än att visa fel ikoner
    // baserade på lokal shuffle-ordning (som skiljer sig från host:s).
    if (!broadcastAllQuestionIds) return [];
    return broadcastAllQuestionIds.map((id) => {
      const q = ALL_QUESTIONS_MAP.get(id);
      if (!q) return 'none';
      if (q.type === 'image') return 'image';
      if (spotifyEnabled && q.type === 'timeline' && q.spotifyTrackId) return 'spotify';
      const picked = pickMediaSource({ youtubeClips: q.youtubeClips }, { youtubeEnabled, gameMode });
      return picked.kind === 'youtube' ? 'youtube' : ('none' as QuestionMediaType);
    });
  }, [isHost, isRemote, broadcastAllQuestionIds, mediaSourceByQuestion, spotifyEnabled, youtubeEnabled, gameMode]);

  // Härledd spotifyQuestionIndices för GetReadyIntro — baserad på effectiveMediaSourceByQuestion
  // så non-host ser korrekta Spotify-chip-ikoner i kön.
  const effectiveSpotifyQuestionIndices = useMemo<number[] | undefined>(() => {
    if (!spotifyEnabled) return undefined;
    const indices = effectiveMediaSourceByQuestion
      .map((src, i) => (src === 'spotify' ? i : -1))
      .filter((i) => i !== -1);
    return indices.length > 0 ? indices : undefined;
  }, [effectiveMediaSourceByQuestion, spotifyEnabled]);

  // V1-huvudkategori per fråga (Music/Film/Sport). Driver GetReadyIntro:s
  // kant-skärande badge på första kö-rutan så spelaren ser i förväg vilken
  // typ av fråga som kommer härnäst. Härleds från backend:s contentSubject
  // (lagras på QuizQuestion.mainCategory vid SEED-konvertering); null om
  // subject inte mappar till någon V1-kategori (t.ex. capital).
  //
  // OBS: badgen visar den FAKTISKA fråge-typen (sport-temad musik = "Music",
  // inte "Sport"). Sport är ett LOBBY-FILTER, inte en badge: väljer host Sport
  // får hen sport-relaterade frågor ur både musik- och sport-poolen (via
  // genrePackages: ["sport"] + itemMatchesEnabledCategories), men frågan i sig
  // är fortfarande en musikfråga och visas så. Samma mönster planeras för Film
  // (idrottare som varit med i film / sport-tema-filmer).
  const categoryByQuestion = useMemo<(MainCategory | null)[]>(() => {
    return gameQuestions.map((q) => q.mainCategory);
  }, [gameQuestions]);

  // Svarstyp per fråga ('Year' | 'Name') — driver GetReadyIntro:s blå badge.
  // Härleds från faktisk question-typ, INTE från mainCategory: en Film-fråga
  // är 'Name' bara om den blev en `actor-select` (= katalog-item med
  // `correctNames`). Film-items UTAN correctNames blir vanliga timeline-frågor
  // med årsväljare — t.ex. "The Angry Birds Movie" ("Which Year was this Movie
  // launched?"). Den gamla `mainCategory === 'Film' → 'Name'`-regeln gav dem
  // fel badge (Name) medan nedräkningen sa "When" och svaret var ett år.
  const answerTypeByQuestion = useMemo<('Year' | 'Name')[]>(() => {
    return gameQuestions.map((q, qIdx) => {
      if (q.type === 'actor-select') return 'Name';
      if (q.type === 'image') return 'Name';
      // Spotify Name-frågor → 'Name' badge i GetReadyIntro-kön
      if (q.type === 'timeline' && (q as { spotifyTrackId?: string }).spotifyTrackId) {
        return resolveSpotifyAnswerType(qIdx) === 'name' ? 'Name' : 'Year';
      }
      return 'Year';
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameQuestions, spotifyAnswerYear, spotifyAnswerName, gameMode, turnOrder.length]);

  // Non-host override: bygg category + answerType från host:s auktoritativa fråge-sekvens
  // (broadcastAllQuestionIds) via ALL_QUESTIONS_MAP. Utan detta visar non-host felaktiga
  // kategori-/svarstyp-badges i GetReady (lokal shuffle ≠ host:s ordning).
  const effectiveCategoryByQuestion = useMemo<(MainCategory | null)[]>(() => {
    // isRemote-undantaget: se effectiveMediaSourceByQuestion ovan.
    if (isHost || isRemote) return categoryByQuestion;
    // Innan host:s fråge-sekvens ankommit: returnera tom array → inga badges
    // visas hellre än fel badge från lokal shuffle.
    if (!broadcastAllQuestionIds) return [];
    return broadcastAllQuestionIds.map((id) => ALL_QUESTIONS_MAP.get(id)?.mainCategory ?? null);
  }, [isHost, isRemote, broadcastAllQuestionIds, categoryByQuestion]);

  const effectiveAnswerTypeByQuestion = useMemo<('Year' | 'Name')[]>(() => {
    // isRemote-undantaget: se effectiveMediaSourceByQuestion ovan.
    if (isHost || isRemote) return answerTypeByQuestion;
    // Innan host:s fråge-sekvens ankommit: returnera tom array → inga badges
    // visas hellre än fel svarstyp från lokal shuffle.
    if (!broadcastAllQuestionIds) return [];
    // Använd host:s broadcastade inställningar om tillgängliga, annars egna värden
    // (egna värden stämmer för PtP där broadcast aldrig sker).
    const effectiveAnswerYear = broadcastHostSpotifyAnswerYear ?? spotifyAnswerYear;
    const effectiveAnswerName = broadcastHostSpotifyAnswerName ?? spotifyAnswerName;
    return broadcastAllQuestionIds.map((id, qIdx) => {
      const q = ALL_QUESTIONS_MAP.get(id);
      if (!q) return 'Year';
      // Se answerTypeByQuestion ovan: ingen mainCategory-baserad Film-regel —
      // Film-timeline-frågor (utan correctNames) svaras med år.
      if (q.type === 'actor-select' || q.type === 'image') return 'Name';
      if (q.type === 'timeline' && (q as { spotifyTrackId?: string }).spotifyTrackId) {
        if (effectiveAnswerYear && effectiveAnswerName) {
          // Räkna bara Spotify-frågor FÖRE denna position — exakt samma logik som
          // host:s resolveSpotifyAnswerType (spotifyOrdinal / numPlayers).
          // Att använda qIdx / qPerBlock ger fel svar eftersom qIdx räknar
          // ALLA frågor, inte bara Spotify-frågorna.
          let spotifyOrdinal = 0;
          for (let i = 0; i < qIdx; i++) {
            const qi = ALL_QUESTIONS_MAP.get(broadcastAllQuestionIds[i]);
            if (qi?.type === 'timeline' && (qi as { spotifyTrackId?: string }).spotifyTrackId) {
              spotifyOrdinal++;
            }
          }
          const numPlayers = Math.max(1, turnOrder.length);
          const spotifyRound = Math.floor(spotifyOrdinal / numPlayers);
          return spotifyRound % 2 === 0 ? 'Year' : 'Name';
        }
        return effectiveAnswerName ? 'Name' : 'Year';
      }
      return 'Year';
    });
  }, [isHost, isRemote, broadcastAllQuestionIds, answerTypeByQuestion, broadcastHostSpotifyAnswerYear, broadcastHostSpotifyAnswerName, spotifyAnswerYear, spotifyAnswerName, gameMode, turnOrder.length]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // IndDev-frågefixering: satt av play_command-handler på non-host sidan.
  // Garanterar att non-host visar exakt samma fråga som host oavsett
  // lokal shuffle-ordning (seenQuestionIds är device-specifikt).
  const [broadcastQuestionId, setBroadcastQuestionId] = useState<string | null>(null);
  // Host:s auktoritativa DJ-tilldelning för Spotify-frågan — mottaget via
  // spotify_question_ready-broadcast. Non-host använder detta istället för
  // lokal djRotationPlan (som är baserad på fel shuffle-ordning på non-host).
  const [broadcastDJPlayerId, setBroadcastDJPlayerId] = useState<string | null>(null);

  // ── Spotify DJ-state ─────────────────────────────────────────────────
  // djOpenedApp: DJ:n har tryckt "Start track in Spotify" → Spotify-appen öppnad,
  //   men låten är inte bekräftad spelande än. Väntar på "Activate timer"-tryck.
  const [spotifyDJOpenedApp, setSpotifyDJOpenedApp] = useState(false);
  // djOpenedAppBroadcast: mottas av non-DJ-enheter via spotify_dj_opened_app-broadcasten.
  // Stegar guesser-kortets step-guide 0→1 (innan timer aktiveras).
  const [spotifyDJOpenedAppBroadcast, setSpotifyDJOpenedAppBroadcast] = useState(false);
  // djStarted: DJ:n har tryckt "Activate timer" → broadcast skickas, timer startar.
  const [spotifyDJStarted, setSpotifyDJStarted] = useState(false);
  // DJ har tryckt "End DJ – handover to Host" i reveal-fasen → låser upp host:s Next-knapp.
  const [djHandedOver, setDjHandedOver] = useState(false);
  // DJ har tryckt × på overlay → aktiverar steg 5 i guiden (utan att låsa upp host:s Next ännu).
  const [djDismissedOverlay, setDjDismissedOverlay] = useState(false);
  // ── FUTURE VERSION 2 — Automated API Flow (archived states) ─────────────────────
  // const [showNowPlayingOverlay, setShowNowPlayingOverlay] = useState(false);
  // const [nowPlayingTrackInfo, setNowPlayingTrackInfo] = useState<SpotifyTrackInfo | null>(null);
  // const [spotifyIsPlaying, setSpotifyIsPlaying] = useState(true);
  // ─────────────────────────────────────────────────────────────────────────────────
  // Speglar för AppState-listener (undviker stale closures).
  const spotifyDJOpenedAppRef = useRef(false);
  const spotifyDJStartedRef = useRef(false);
  // currentSpotifyTrackId-spegel.
  const currentSpotifyTrackIdRef = useRef<string | null>(null);
  // Sätts synkront av onSpotifyDJTrackStarted (payload.timer_start_at).
  // Skiljs från hostTimerStartAtRef som även sätts av play_command —
  // detta är ENBART Spotify-timerns start-timestamp, aldrig play_command-tid.
  const spotifyTimerStartAtRef = useRef<number>(0);
  // ── FUTURE VERSION 2 — Automated API Flow (archived refs) ────────────────────────
  // const wentToBackgroundRef = useRef(false);
  // const spotifyKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const spotifyWentToFallbackRef = useRef(false);
  // const spotifyIsPlayingRef = useRef(true);
  // const spotifyPausePositionMsRef = useRef(0);
  // ─────────────────────────────────────────────────────────────────────────────────
  // Timeout-fas för Spotify-frågor:
  //   null     = ej Spotify-fråga eller timeout ej aktuell
  //   waiting  = Fas 1: väntar på DJ (0–240 s, ingen synlig nedräkning)
  //   countdown= Fas 2: synlig 60 s nedräkning till alla spelare (total = 300 s)
  //   skipped  = låten hoppades över; "Track skipped" visas 2,5 s
  const [spotifyWaitPhase, setSpotifyWaitPhase] = useState<'waiting' | 'countdown' | 'skipped' | null>(null);
  const [spotifyTimeoutSeconds, setSpotifyTimeoutSeconds] = useState(60);
  // ── FUTURE VERSION 2 — Automated API Flow (archived) ─────────────────────────────
  // const [spotifyPausePositionMs, setSpotifyPausePositionMs] = useState(0);
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * DJ-rotationsplan — track-baserad, inte positions-baserad.
   *
   * Varje fråga i gameQuestions som har `spotifyTrackId` ÄR per definition
   * en Spotify-runda. DJs roterar bland spelarna i ordning.
   *
   * Tidigare använde vi computeDJRotationPlan (positions-baserad) som
   * tilldelade fasta index (t.ex. 5, 10, 15) utan att garantera att frågan
   * på det indexet faktiskt hade spotifyTrackId → inga Spotify-rundor.
   */
  const djRotationPlan = useMemo<DJRotationPlan | null>(() => {
    if (!spotifyEnabled || turnOrder.length === 0) return null;

    const djPlayers: SpotifyDJPlayer[] = turnOrder.map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
    }));

    const spotifyQuestionIndices: number[] = [];
    const djAssignments = new Map<number, SpotifyDJPlayer>();

    // Gå igenom ALLA gameQuestions — varje fråga med spotifyTrackId blir
    // automatiskt en Spotify-runda med en roterande DJ-tilldelning.
    gameQuestions.forEach((q, i) => {
      if (q.type === 'timeline' && q.spotifyTrackId) {
        const djIndex = spotifyQuestionIndices.length % djPlayers.length;
        spotifyQuestionIndices.push(i);
        djAssignments.set(i, djPlayers[djIndex]);
      }
    });

    if (spotifyQuestionIndices.length === 0) return null;
    return { spotifyQuestionIndices, djAssignments };
  }, [spotifyEnabled, turnOrder, gameQuestions]);

  // IndDev-frågefixering: non-host ersätter lokal gameQuestions[idx]-fråga
  // med den exakta frågan host broadcastade i play_command.question_id.
  // allQuestionsMap är module-level och innerhåller alla möjliga frågor.
  const _broadcastOverride: QuizQuestion | null =
    !isHost && broadcastQuestionId
      ? (ALL_QUESTIONS_MAP.get(broadcastQuestionId) ?? null)
      : null;

  // Är nuvarande fråga en Spotify-fråga?
  // Använder currentQ.spotifyTrackId DIREKT — inte djRotationPlan.spotifyQuestionIndices
  // (som är baserat på lokal shuffle och därmed fel på non-host).
  // currentQ är redan korrekt på non-host via _broadcastOverride (host:s question_id).
  const currentQ = _broadcastOverride ?? gameQuestions[questionIndex];
  const isSpotifyQuestion =
    spotifyEnabled &&
    currentQ?.type === 'timeline' &&
    !!currentQ?.spotifyTrackId;

  // Track ID för nuvarande Spotify-fråga (null om ej Spotify-fråga).
  const currentSpotifyTrackId: string | null =
    isSpotifyQuestion && currentQ?.type === 'timeline'
      ? (currentQ.spotifyTrackId ?? null)
      : null;

  // Vilken spelare är DJ för nuvarande fråga?
  const currentDJPlayer: SpotifyDJPlayer | null =
    djRotationPlan && isSpotifyQuestion
      ? getDJForQuestionIndex(djRotationPlan, questionIndex)
      : null;
  // Synkron ref-spegel (fix 2026-07-27): subscribe-callbacken (registrerad
  // EN gång på mount) läser DJ-id:t via denna ref istället för closure-värdet.
  // Utan ref:en bar host:s rejoin-re-broadcast av play_command MOUNT-tidens
  // dj_player_id (= fråga 0:s DJ = host) — när en senare frågas non-host-DJ
  // återvände från Spotify (flap → player_rejoined → 500ms-re-broadcast)
  // demoterades den till gissare mitt i sin egen DJ-runda och fick svars-UI.
  const currentDJPlayerRef = useRef<SpotifyDJPlayer | null>(null);
  currentDJPlayerRef.current = currentDJPlayer;

  // Är JAGET DJ denna runda?
  //   Host: använder lokalt beräknat currentDJPlayer (djRotationPlan är korrekt på host).
  //   Non-host: använder broadcastDJPlayerId från host:s spotify_question_ready-broadcast
  //     (lokalt djRotationPlan är fel pga annan shuffle-ordning).
  const effectiveDJId: string | null =
    !isHost && broadcastDJPlayerId !== null
      ? broadcastDJPlayerId
      : (currentDJPlayer?.id ?? null);
  const isCurrentPlayerDJ: boolean = effectiveDJId !== null && (
    gameMode === 'pass-the-phone'
      ? turnOrder[currentPlayerIndex]?.id === effectiveDJId
      : selfPlayerId === effectiveDJId
  );

  // Vem aktiverar timern i V1-flödet?
  //   Normalt: Host (om Host INTE är DJ) — Host hör musiken och trycker.
  //   Reserv: om Host är DJ → den högst rangordnade icke-DJ-spelaren i turnOrder.
  //   Alla andra: vanlig gissare, tittar och svarar.
  const hostIsTheDJ: boolean = effectiveDJId !== null && turnOrder[0]?.id === effectiveDJId;
  const reserveTimerActivatorId: string | undefined = hostIsTheDJ
    ? turnOrder.find((p) => p.id !== effectiveDJId)?.id
    : undefined;
  const isTimerActivator: boolean =
    isSpotifyQuestion &&
    gameMode === 'individual-devices' &&
    !isCurrentPlayerDJ &&
    (hostIsTheDJ ? selfPlayerId === reserveTimerActivatorId : isHost);

  // DJ:n är AVSIKTLIGT utanför QuizVibe — de tappade "Start track in Spotify"
  // och är i Spotify-appen för att spela låten. Backgroundingen får connection-
  // monitorn att rapportera unstable när appen vaknar (frusna heartbeats /
  // Realtime-socket-död i bakgrunden), men det är INTE ett nätverksfel. Utan
  // undantaget latchade sticky-unstable på non-host-DJ:n vid återkomsten →
  // "Reconnecting…"-overlay → OK-tap → phase 'intro' → host:s play_command-
  // rebroadcast → NY countdown mitt i frågan, osynkat med host som väntar i
  // question-vyn på att aktivera timern. Host-DJ drabbades aldrig (latchen är
  // !isHost-gated). Speglar D-vi-undantaget för host-disconnect-grace
  // (spotifyDJStarted). Nollställs per fråga via questionIndex-effektens
  // setSpotifyDJOpenedApp(false) — genuina nätverksfel latchar igen då.
  const isDJAwayInSpotify =
    isSpotifyQuestion && isCurrentPlayerDJ && spotifyDJOpenedApp;
  useEffect(() => {
    if (isConnectionUnstable && !isHost && !isDJAwayInSpotify) {
      setStickyUnstableForQuestion(true);
    }
  }, [isConnectionUnstable, isHost, isDJAwayInSpotify]);
  // Derived: drivs av OR mellan live-state och sticky-latch. Allt UI-disable
  // + overlay-mount använder denna istället för raw `isConnectionUnstable`.
  // DJ-away-undantaget suppressar även live-overlay-flashen (2s hysteresis)
  // när DJ:n återvänder från Spotify.
  const shouldLockForUnstable =
    (isConnectionUnstable || stickyUnstableForQuestion) && !isDJAwayInSpotify;
  // Ref-mirror av shouldLockForUnstable så timeout-useEffect (deps [timeLeft])
  // kan läsa aktuellt värde utan stale-closure-problem.
  const shouldLockForUnstableRef = useRef(false);
  shouldLockForUnstableRef.current = shouldLockForUnstable;

  // Aktuell spelares assistance — driver svarsruta-intervallet (full=5 år,
  // standard=3 år, minimal=1 år) per rond. Faller tillbaka till fallback-
  // Assistance om turnOrder-payload saknar fältet (legacy-data).
  // IndDev: currentPlayerIndex är alltid 0 (host) — vi slår upp via
  // selfPlayerId istället så varje enhet får sin egna spelares assistance.
  const currentAssistance: AssistanceLevel = (
    gameMode === 'individual-devices' && selfPlayerId
      ? turnOrder.find((p) => p.id === selfPlayerId)
      : turnOrder[currentPlayerIndex]
  )?.assistance ?? fallbackAssistance;
  // Initial fas är 'intro' när vi har en turordning (gäller båda lägena vid
  // spelstart). Faller tillbaka till 'question' om payload saknas/parse-failar.
  // 'countdown' fas:as in efter intro:n när användaren tappar play-knappen —
  // visar 3-2-1-nedräkning i en stor Q-logga innan question-vyn dyker upp.
  // 'awaiting' fas:as in efter Confirm — TimelineSelector låses men reveal-
  // feedbacken döljs tills timer:n går till 0. Det ger alla spelare samma
  // tidsbudget oavsett om de svarar tidigt eller sent.
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'question' | 'awaiting' | 'reveal' | 'leaderboard'>(
    turnOrder.length > 0 ? 'intro' : 'question',
  );
  // Synkron mirror av phase-state. Uppdateras vid varje render (ingen delay).
  // Används av confirm-handlers för att undvika stale-closure-race mot
  // useEffect([timeLeft]) — om setPhase('awaiting') anropats men React inte
  // hunnit re-rendera ser closure-baserad phase-check fortfarande 'question'.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const questionIndexRef = useRef(questionIndex);
  questionIndexRef.current = questionIndex;
  // Skyddar mot double-scoring per fråga oavsett React-batching/scheduling.
  // Sätts true av första anropet till recordRoundScore; resetas i
  // handleAdvanceToNextRound när nästa fråga börjar.
  const hasRecordedScoreForCurrentQuestionRef = useRef(false);
  // Wall-clock-stämpel (ms) för när host:s timer förväntas starta — sätts av
  // play_command:s timer_start_at. Non-host använder den för att beräkna
  // återstående tid om appen vaknade upp under countdown/question-fasen.
  // Resetas till 0 vid questionIndex-byte så stale värde aldrig läcker.
  const hostTimerStartAtRef = useRef<number>(0);
  // Smooth bar-progress 1 → 0 över exakt 30 s, animerad via Animated.timing
  // med RAF (requestAnimationFrame). Körs OBEROENDE av setInterval-baserade
  // sekund-räknaren så bar:en aldrig "fryser" eller stepar — kritiskt för
  // upplevelsen att tiden flyter på även medan handleConfirm batchar
  // setStates och React re-renderar action-knappen. Krävs för Individual-
  // Devices-flödet där flera spelare confirmar vid olika tidpunkter.
  const timerProgressAnim = useRef(new Animated.Value(1)).current;
  // Timern + flaggans mosaik aktiveras 2 s efter quiz-vyn visas.
  const [timerActive, setTimerActive] = useState(false);
  useEffect(() => {
    if (phase !== 'question') {
      // Spotify-frågor: om non-host redan confirmat (phase='awaiting') och DJ:n
      // ännu inte aktiverat timern, låt timerActive vara oförändrad (false) —
      // onSpotifyDJTrackStarted-handleren sätter setTimerActive(true) när DJ
      // aktiverar. Om vi kallar setTimerActive(false) här avbryter vi det.
      if (!(isSpotifyQuestion && phase === 'awaiting')) setTimerActive(false);
      return;
    }
    // Non-host i IndDev: om host:s timer redan har startat när question-fasen
    // sätts (t.ex. appen vaknade upp från bakgrunden under nedräkning och
    // AppState-lyssnaren satte setPhase('question') direkt) — visa korrekt
    // återstående tid OMEDELBART istället för full responseSeconds.
    if (!isHost && hostTimerStartAtRef.current > 0) {
      const now = Date.now();
      const timerStartAt = hostTimerStartAtRef.current;
      if (now >= timerStartAt) {
        const elapsed = Math.floor((now - timerStartAt) / 1000);
        const adjustedLeft = Math.max(0, responseSeconds - elapsed);
        setTimeLeft(adjustedLeft);
        timerProgressAnim.stopAnimation();
        timerProgressAnim.setValue(adjustedLeft / responseSeconds);
        // Spotify: starta bara timer om DJ redan har aktiverat — annars vänta på
        // spotify_dj_track_started-broadcaset. Edge case: DJ aktiverade INNAN
        // non-host:s countdown var klar → onSpotifyDJTrackStarted satte
        // spotifyDJStarted=true men hoppade setTimeout (phaseRef='countdown') →
        // nu är vi i question-fasen och timern har aldrig startats.
        if (isSpotifyQuestion) {
          if (spotifyDJStarted) setTimeout(() => setTimerActive(true), 2000);
          return;
        }
        const id = setTimeout(() => setTimerActive(true), 2000);
        return () => { clearTimeout(id); };
      }
    }
    // Normal path: återställ display till full tid under buffer-perioden.
    setTimeLeft(responseSeconds);
    timerProgressAnim.stopAnimation();
    timerProgressAnim.setValue(1);
    // Spotify-frågor: timern startas INTE automatiskt — den aktiveras först
    // när DJ broadcastar spotify_dj_track_started + 2 s delay.
    // Edge case: om DJ redan har aktiverat (spotifyDJStarted=true) och non-host
    // precis lämnat countdown-fasen, starta timern direkt.
    if (isSpotifyQuestion) {
      if (spotifyDJStarted) setTimeout(() => setTimerActive(true), 2000);
      return;
    }
    const id = setTimeout(() => setTimerActive(true), 2000);
    return () => { clearTimeout(id); };
  }, [phase, questionIndex, responseSeconds, timerProgressAnim, isSpotifyQuestion, isHost, spotifyDJStarted]);
  // Hints visas direkt när quiz-vyn öppnas (ingen delay).
  // Flaggans mosaik har kvar sin 2 s delay via timerActive/mosaicActive.
  const hintsReady = phase === 'question' || phase === 'awaiting' || phase === 'reveal';
  // Sticky-unstable-latchen rensas ENDAST av handleRetryFromUnstable
  // (= explicit Retry-tap). Tidigare auto-reset på phase=intro/countdown
  // togs bort (D-iii follow-up): per design är retry ända vägen tillbaka
  // för att aktivera spelaren igen + flippa A:s leaderboard från
  // "Connection unstable" till connected. question_advance fortsätter
  // bumpa questionIndex i bakgrunden (B håller sig synkad), men
  // play_command ignoreras tills sticky är rensad.
  // Spelare som kommer efter current i turordningen — cyklar genom hela
  // turnOrder så queue.length matchar antalet återstående frågor (inte
  // bara nästa rond). För 2 spelare × 4 rondor vid Q1: queue blir 7
  // element (P2, P1, P2, P1, P2, P1, P2 → Q2..Q8). Drivs av GetReady:s
  // chip-rad så plats 3+ visas även när turnOrder är kort.
  const queue = useMemo<TurnOrderPlayer[]>(() => {
    if (turnOrder.length <= 1) return [];
    const remaining = Math.max(0, totalQuestions - questionIndex - 1);
    const result: TurnOrderPlayer[] = [];
    for (let i = 0; i < remaining; i++) {
      const playerIdx = (currentPlayerIndex + 1 + i) % turnOrder.length;
      result.push(turnOrder[playerIdx]);
    }
    return result;
  }, [turnOrder, currentPlayerIndex, totalQuestions, questionIndex]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // Låst korrekthetsbedömning från handleConfirm — används i reveal-kortet
  // istället för att räkna om från selectedYear (som kan bli null om ett
  // play_command anländer efter confirm men innan reveal renderas).
  const [confirmedCorrect, setConfirmedCorrect] = useState<boolean | null>(null);
  // Senaste valda år från TimelineSelector (uppdateras vid varje scroll-tick).
  // Quiz-skärmens egna Confirm-knapp läser detta när användaren trycker submit.
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  // Bekräftad svarstid i sekunder med 2-decimals-precision. Sätts via
  // Date.now()-diff i handleConfirm — setInterval ger bara sekund-precision
  // så vi behöver tidsstämpla separat. Driver:
  //   • avatar-markören på timer-bar:en (placerad vid elapsed/30 av bredden)
  //   • "Answer time: X.YYs"-raden i feedback-kortet vid rätt svar
  const [confirmedTimeUsed, setConfirmedTimeUsed] = useState<number | null>(null);

  // ── Bild-fråge-state ───────────────────────────────────────────────────
  // Förlik state med timeline-flödet:
  //   • pendingNameOption = motsvarighet till pendingYear (preliminärt val
  //     i Final Selection, kan ändras tills Confirm tryckts).
  //   • confirmedNameOption = motsvarighet till selectedYear post-Confirm
  //     (låst, driver reveal-feedbacken). Null vid time-out → reveal visar
  //     ✗ + "Correct: X" utan "You chose"-rad.
  const [pendingNameOption, setPendingNameOption] = useState<ImageNameOption | null>(null);
  const [confirmedNameOption, setConfirmedNameOption] = useState<ImageNameOption | null>(null);

  // ── Actor-select-state (film-frågor) ───────────────────────────────────
  const [pendingActorName, setPendingActorName] = useState<string | null>(null);
  const [confirmedActorName, setConfirmedActorName] = useState<string | null>(null);

  // ── Spotify Name-answer state ─────────────────────────────────────────
  // answer_type broadcastas av host i spotify_question_ready; non-host sparar här.
  // spotifyNameVariant byggs runtime via useEffect (buildImageVariant på artistnamnet).
  const [broadcastSpotifyAnswerType, setBroadcastSpotifyAnswerType] =
    useState<'year' | 'name' | null>(null);
  const [spotifyNameVariant, setSpotifyNameVariant] =
    useState<ImageQuestionVariant | null>(null);

  // ── Multiplayer state ──────────────────────────────────────────────────
  // Per-runda-poäng (= scores för senaste avslutade fråga). Aggregerade
  // per-spelare-totals härleds från allRoundScoresHistory via gameTotals.
  const [currentRoundScores, setCurrentRoundScores] = useState<RoundScore[]>([]);
  const [allRoundScoresHistory, setAllRoundScoresHistory] = useState<RoundScore[][]>([]);
  const [playerHcpChanges, setPlayerHcpChanges] = useState<Record<string, HcpChange>>({});
  // Set över player_id:n som lämnat spelet via Leave Game (non-host).
  // Driver "Has left the game"-rendering i leaderboard:erna (både live i
  // GetReadyIntro och final i RoundLeaderboard). Alla approved klienter
  // (inkl. host) håller samma state — sync via `player_left`-broadcast.
  const [leftPlayerIds, setLeftPlayerIds] = useState<Set<string>>(new Set());
  // Per-spelare confirm-time för PÅGÅENDE fråga. Nyckel = lobby_players.player_id,
  // värde = sekunder från fråge-start till confirm. Driver avatar-markörer på
  // timer-bar:en i Individual Devices — confirmade spelares avatar fryses vid
  // sin position, ej-confirmade rör sig med timern. Reset:as vid frågebyte.
  const [playerConfirms, setPlayerConfirms] = useState<Record<string, number>>({});

  // Spel-start: trackas en gång när QuizScreen mountas (router pushar
  // hit från Lobby:s "Start Game"-flöde). Region/land sätts av
  // analytics-vendor:n på dashboard-sidan, behöver inte skickas här.
  useEffect(() => {
    track('game_started', { assistance: fallbackAssistance });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ladda egna tidigare sedda fråge-IDs från AsyncStorage. Sker asynkront
  // men klart innan spelaren hinner trycka Play i GetReadyIntro (~50 ms).
  // Uppdaterar seenQuestionIds vilket triggerar gameQuestions-useMemo att
  // räkna om med korrekt unseen-prioritering.
  //
  // Non-host i IndDev: skicka dessutom historiken till host via
  // `player_seen_questions` så host:s pool exkluderar frågor NÅGON
  // deltagare sett i sina senaste 20 spel. Tre sändningar (retry-mönster
  // som game_sequence_init) täcker subscribe-races — host är normalt redan
  // subscribed eftersom host mountar quiz före non-hosts navigerar in.
  // Payload-cap 500 ids (syncChannel MAX_QUESTION_IDS); slice(-500) behåller
  // de NYASTE (Set-iteration = insertion order = äldsta session först).
  useEffect(() => {
    // Konsumera peer-historik-union:en som host:s handleStartGame stash:ade
    // vid Start Game (lobby_players.seen_question_ids-vägen — enda vägen i
    // Pass-the-Phone, komplement till broadcasten i IndDev). Endast satt på
    // host-enheten; non-host/direkt-nav får null → no-op.
    const pendingPeer = consumePendingPeerSeenIds(params.roomCode ?? '');
    if (pendingPeer) {
      if (pendingPeer.seen.length > 0) {
        setPeerSeenIds((prev) => new Set([...prev, ...pendingPeer.seen]));
      }
      if (pendingPeer.last.length > 0) {
        setPeerLastIds((prev) => new Set([...prev, ...pendingPeer.last]));
      }
    }
    let seenBroadcastTimers: ReturnType<typeof setTimeout>[] = [];
    loadEpochLedger().then(setEpochDebt).catch(() => {});
    Promise.all([loadSeenQuestionIds(), loadLastSessionIds()]).then(([seen, last]) => {
      setSeenQuestionIds(seen);
      setLastSessionIds(last);
      if (
        !isHost &&
        gameMode === 'individual-devices' &&
        selfPlayerId &&
        (seen.size > 0 || last.size > 0)
      ) {
        const payload = {
          player_id: selfPlayerId,
          seen_q_ids: [...seen].slice(-500),
          last_q_ids: [...last].slice(-500),
        };
        const send = () => {
          syncChannelRef.current?.broadcastPlayerSeenQuestions(payload).catch(() => {});
        };
        seenBroadcastTimers = [
          setTimeout(send, 300),
          setTimeout(send, 1800),
          setTimeout(send, 4500),
        ];
      }
    });
    return () => seenBroadcastTimers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "YOU"-spelare (hostar spelet). Läser namn + emoji från turnOrder[0]
  // (= host i mock-setupen) så leaderboarden visar host:s riktiga avatar/
  // namn istället för hardcoded "You" / 🎮. Faller tillbaka till generic
  // "You" / 🎮 om turnOrder är tom (defensiv vid direkt-nav till /quiz
  // utan Lobby).
  const hostFromTurn = turnOrder[0];
  const youPlayer: LeaderboardPlayer = useMemo(
    () => ({
      id: 'you',
      name: hostFromTurn?.name ?? 'You',
      emoji: hostFromTurn?.emoji ?? '🎮',
      assistance: fallbackAssistance,
      age: hostFromTurn?.age ?? age,
      isYou: true,
      isHost: true,
    }),
    [hostFromTurn?.name, hostFromTurn?.emoji, hostFromTurn?.age, fallbackAssistance, age],
  );
  // gamePlayers = den faktiska spelarlistan i detta spel.
  // Pass-the-Phone: alla spelare finns i turnOrder. Visa dem i leaderboarden
  // istället för MOCK_OPPONENTS (som inte spelar i pass-the-phone).
  // Direkt-nav (turnOrder tom) faller tillbaka till [you + mocks].
  const gamePlayers: LeaderboardPlayer[] = useMemo(() => {
    if (turnOrder.length > 0) {
      return turnOrder.map((p, i) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji ?? '👤',
        assistance: p.assistance ?? fallbackAssistance,
        age: p.age ?? age,
        isYou: i === 0,
        isHost: i === 0,
        hasLeft: leftPlayerIds.has(p.id),
      }));
    }
    return [youPlayer, ...MOCK_OPPONENTS];
  }, [turnOrder, youPlayer, fallbackAssistance, age, leftPlayerIds]);

  // Aggregera per-spelare-totals direkt från allRoundScoresHistory så
  // leaderboarden alltid speglar exakt vilka som faktiskt har scoreats —
  // ingen mock-spelare räknas upp om de inte har en post i history.
  const gameTotals: Record<string, number> = useMemo(() => {
    const totals: Record<string, number> = {};
    allRoundScoresHistory.forEach((round) => {
      round.forEach((s) => {
        totals[s.playerId] = (totals[s.playerId] ?? 0) + s.points;
      });
    });
    return totals;
  }, [allRoundScoresHistory]);

  const allPlayers: LeaderboardPlayer[] = gamePlayers;

  // Host:s id (= "your" perspektiv från denna enhet). Pass-the-phone:
  // turnOrder[0]; direkt-nav fallback: 'you'.
  const hostId = turnOrder[0]?.id ?? 'you';
  // Derived host-total — ersätter den tidigare totalPoints-state:n. Räknas
  // alltid mot host:s id i gameTotals så host:s "your" total reflekterar
  // bara sina egna scoreade ronder, inte andras (kritiskt i pass-the-phone).
  const totalPoints = gameTotals[hostId] ?? 0;

  // Live-leaderboard till GetReadyIntro:s utfällbara block. Aggregerar
  // allRoundScoresHistory per spelare till position/poäng/rounds/correct/
  // avg/last response. Sortering: poäng desc → avg response asc (ties bryts
  // av snabbast genomsnitt).
  const liveLeaderboard = useMemo(() => {
    const totalsMap: Record<string, number> = gameTotals;
    const entries = gamePlayers.map((p) => {
      const playerScores: RoundScore[] = allRoundScoresHistory.flatMap((round) =>
        round.filter((s) => s.playerId === p.id),
      );
      const correctAnswers = playerScores.filter((s) => s.correct).length;
      const incorrectAnswers = playerScores.length - correctAnswers;
      const avgResponseSeconds = playerScores.length > 0
        ? playerScores.reduce((sum, s) => sum + s.timeUsed, 0) / playerScores.length
        : 0;
      const lastResponseSeconds = playerScores.length > 0
        ? playerScores[playerScores.length - 1].timeUsed
        : null;
      // Senaste 5 utfallen, äldst → nyast (slice tar upp till 5 sista i
      // historik-ordning). Renderas som färgade dotts/glyphs i leaderboard.
      const lastFiveResults = playerScores.slice(-5).map((s) => s.correct);
      return {
        playerId: p.id,
        name: p.name,
        emoji: p.emoji,
        age: p.age,
        assistance: p.assistance,
        points: totalsMap[p.id] ?? 0,
        playedRounds: playerScores.length,
        correctAnswers,
        incorrectAnswers,
        avgResponseSeconds,
        lastResponseSeconds,
        lastFiveResults,
        hasLeft: leftPlayerIds.has(p.id),
      };
    });
    // connectionErrors = antal frågor spelaren missat jämfört med den som
    // spelat flest. Om A spelat 3 och B spelat 2 → B får 1 i wifi-kolumnen.
    const maxRounds = entries.reduce((m, e) => Math.max(m, e.playedRounds), 0);
    const entriesWithErrors = entries.map((e) => ({
      ...e,
      connectionErrors: Math.max(0, maxRounds - e.playedRounds),
    }));
    return entriesWithErrors.sort((a, b) => {
      // 1. Pts desc — flest poäng vinner
      if (b.points !== a.points) return b.points - a.points;
      // 2. Spelare med 0 spelade ronder får avgResponseSeconds=0 vilket
      //    annars skulle leapfrogga ALLA spelare med faktisk data (0 < deras
      //    avg). Garantera att tom-data alltid sorteras sist.
      if (a.playedRounds === 0 && b.playedRounds > 0) return 1;
      if (b.playedRounds === 0 && a.playedRounds > 0) return -1;
      // 3. Avg response time asc — snabbare avg vinner vid pts-tie. Spelare
      //    som timeoutat alla frågor har avg=max-tiden; en spelare som hann
      //    svara (även fel) har lägre avg och ska därför ranka högre.
      return a.avgResponseSeconds - b.avgResponseSeconds;
    });
  }, [gamePlayers, gameTotals, allRoundScoresHistory, leftPlayerIds]);

  const timerRef = useRef<any>(null);
  // pulseAnim driver opacity:n på timer-progress-baren när tiden
  // är kritisk (≤5s). Default 1 = full opacity, oscillerar mot 0.55 i loop.
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Spring-in-animation för inline reveal-blocket (svar-card + result-row).
  // Triggas när phase växlar till 'reveal' så användaren ser
  // svaret poppa in. Kopierad logik från den borttagna RevealScreen-komponenten.
  const revealScale = useRef(new Animated.Value(0.6)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  // Confirm-knappens blue glow + scale-pulse — körs i loop medan question-
  // fasen är aktiv och pendingYear är giltig (knappen är tappbar). Speglar
  // Lobby:s Start Game-CTA + GetReady:s play-knapp.
  const confirmPulse = useRef(new Animated.Value(1)).current;
  const confirmGlow = useRef(new Animated.Value(0.4)).current;
  // "Activate Timer"-knappens scale-pulse för timer-aktiveraren i
  // Spotify-frågor. Aktiv medan knappen är synlig (pre-timer + DJ öppnat
  // Spotify). Stoppas direkt när timer startat (knappen försvinner).
  const activateTimerPulse = useRef(new Animated.Value(1)).current;
  // Scale-pulse för DJ-flödets reveal-CTA:er. Speglar startskärmens primary-
  // CTA-pulse (1 ↔ 1.03 over 900ms). Körs kontinuerligt — vid mount och
  // framåt — eftersom knapparna bara renderas i reveal-fasen ändå.
  const nextTabPulse = useRef(new Animated.Value(1)).current;
  // Next-tab:ens EGNA pulse — medvetet kraftigare än nextTabPulse (1 ↔ 1.08
  // på 650 ms + halo som andas 0.15 ↔ 0.55) eftersom den är reveal-vyns enda
  // vägen-vidare-CTA och måste läsas som pulserande på en blick (Peter
  // 2026-08-14). Egna Animated.Values så DJ-knapparna ovan förblir dämpade.
  const nextCtaPulse = useRef(new Animated.Value(1)).current;
  const nextCtaGlow = useRef(new Animated.Value(0.2)).current;
  // Glow + scale-pulse på DJ:ns "Start track in Spotify"-CTA — Spotify-grön
  // halo bakom knappen (animated opacity) + 1 ↔ 1.05 scale. Loopen körs
  // kontinuerligt; knappen är ändå bara monterad vid djStep=0 (samma
  // konvention som nextTabPulse).
  const djStartPulse = useRef(new Animated.Value(1)).current;
  const djStartGlow = useRef(new Animated.Value(0.4)).current;
  // Blinkande "scroll for more"-indicator i botten på image-frågor. Prefix-
  // gridens 10 rader + Confirm-knappen ryms inte på en skärm — pilen
  // signalerar till spelaren att fortsätta scrolla. Opacity-loop 1 ↔ 0.3
  // (faster cadence än övriga pulses för att grab attention).
  const scrollHintOpacity = useRef(new Animated.Value(1)).current;
  // True när användaren scrollat tillräckligt nära botten att Confirm-knappen
  // är synlig — pilen göms då (annars blinkar den onödigt över Confirm).
  // Reset:as till false vid varje frågebyte så pilen återkommer på nästa
  // image-fråga oavsett föregående scroll-position.
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  // Pulserande ring runt sekund-räknaren till höger om timer-bar:en. Färgen
  // ärvs från timerColor (primary → warning → error). Två separata loops:
  // scale (subtil "andning") + halo-opacity (glow-effekten bakom ringen).
  const timerRingPulse = useRef(new Animated.Value(1)).current;
  const timerRingGlow = useRef(new Animated.Value(0.3)).current;
  // Förfluten tid med 2-decimals-precision (ms) — driver stopwatch-displayen
  // under timer-bar:en (räknar UPPÅT från 00.00 mot responseSeconds). Drivs
  // av en 20 Hz tick som läser Date.now()-diff så värdet är drift-fritt.
  // Initialiseras till 0 — visas som "00.00" innan timer:n startar.
  const [decimalElapsedMs, setDecimalElapsedMs] = useState<number>(0);

  // Ingen modulo: en tunn pool ska INTE wrappa runt och visa om samma fråga
  // inom spelet — totalQuestions clampas mot gameQuestions.length ovan, så
  // indexet håller sig innanför. Klampas ändå defensivt så ett stale
  // questionIndex under resume/heal ger sista frågan i stället för undefined
  // (`question` är non-nullable och läses direkt på nästa rad).
  const question: QuizQuestion =
    _broadcastOverride ?? gameQuestions[Math.min(questionIndex, gameQuestions.length - 1)];
  const isImageQuestion = question.type === 'image';
  const isActorSelectQuestion = question.type === 'actor-select';
  const isTimelineQuestion = question.type === 'timeline';
  const isLastQuestion = questionIndex === totalQuestions - 1;

  // Svarstyp för pågående Spotify-fråga. Non-host använder broadcastad typ från host;
  // host (eller PtP) beräknar deterministiskt via resolveSpotifyAnswerType med Spotify-ordinal.
  const currentSpotifyAnswerType: 'year' | 'name' | null = isSpotifyQuestion
    ? (!isHost && broadcastSpotifyAnswerType !== null
        ? broadcastSpotifyAnswerType
        : resolveSpotifyAnswerType(questionIndex))
    : null;
  const isSpotifyNameQuestion = isSpotifyQuestion && currentSpotifyAnswerType === 'name';

  // Artistnamn extraherat från hint-fältet (format "Title — Artist").
  const derivedArtistName: string | null =
    isSpotifyNameQuestion && currentQ?.type === 'timeline'
      ? (currentQ.hint?.split(' — ').pop()?.trim() ?? null)
      : null;

  // Bygg image-variant runtime baserat på source + assistance + audience-set.
  // Memo:as på question-id + assistance så shuffle/distractor-pick körs ENDAST
  // när frågan byts eller spelarens assistance ändras (= turnordnings-rotation
  // i Pass-the-Phone). Annars skulle prefix-knappar randomiseras varje render
  // → ImageAnswerBlock skulle få ny variant-prop per frame.
  const imageVariant = useMemo<ImageQuestionVariant | null>(() => {
    if (question.type !== 'image') return null;

    // Lager-kedjan (subject → kön → land/sport) bor i hintsDistractorPool.ts
    // så köns-regeln kan testas utan React. genderLocked = alla items i poolen
    // har samma kön som rätt svar.
    const { itemPool, genderLocked } = buildHintsDistractorPool(
      question.source,
      IMAGE_QUIZ_QUESTIONS,
    );

    // Remote 1v1: seedad RNG så båda spelarnas enheter genererar identiska
    // alternativ i identisk ordning (ingen sync-kanal under spelet).
    const variantSeed = seedForRemoteQuestion(question.id);

    return buildImageVariant(
      question.source,
      currentAssistance,
      audienceSetForVariants,
      itemPool,
      // Den generiska namn-poolen (påhittade namn + artistnamn utan katalog-
      // post) har inget känt kön — den skulle bryta köns-låsningen och stängs
      // därför av när den gäller. Utan lås är den kvar som sista utfyllnad.
      genderLocked ? [] : DISTRACTOR_POOL_NAMES[question.source.category] ?? [],
      5, // 5 svarsalternativ
      variantSeed ? createSeededRng(variantSeed) : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, currentAssistance, audienceSetForVariants, seedForRemoteQuestion]);

  // Bygg Letter Grid-variant för Spotify Name-frågor.
  // Kör som useEffect (inte useMemo) eftersom derivedArtistName är en string
  // som inte är ett stabilt dep för useMemo-chaining.
  //
  // Relevans-filtrering (2026-07-03): distraktorerna lager-filtreras mot den
  // kuraterade SPOTIFY_ARTIST_META-tabellen så alternativen matchar rätt svar
  // i typ (band vs solo), land och kön — en svensk kvinnlig soloartist får
  // andra svenska kvinnliga soloartister, ett amerikanskt band andra
  // amerikanska band. Kandidater = bild-poolens artist/band-items
  // (nationalitet via HINTS_LIBRARY, kön via meta-tabellen — inferGender är
  // opålitlig för artister, låttext-pronomen ger fel kön) + övriga Spotify-
  // artister ur musik-katalogen (syntetiska items med kuraterad meta).
  // Lager striktast → lösast med minst 4 distraktorer per lager; saknar rätt
  // svar meta används hela artist+band-poolen (tidigare beteende).
  // OBS: tidigare version filtrerade IMAGE_SEED_QUESTIONS på ett contentSubject-
  // fält som inte finns på ImageQuestion-toppnivån (ligger i q.source) → tom
  // pool, alla distraktorer kom från generiska DISTRACTOR_POOL_NAMES. Fixat.
  useEffect(() => {
    if (!isSpotifyNameQuestion || !derivedArtistName) {
      setSpotifyNameVariant(null);
      return;
    }
    const correctKey = derivedArtistName.trim().toLowerCase();
    const correctMeta = getSpotifyArtistMeta(derivedArtistName);

    type SpotifyNameCandidate = {
      item: ImageQuizQuestion;
      type: 'artist' | 'band';
      country: string | null;
      gender: 'male' | 'female' | 'mixed' | null;
    };
    const seenNames = new Set<string>([correctKey]);
    const candidates: SpotifyNameCandidate[] = [];

    for (const q of IMAGE_SEED_QUESTIONS) {
      const src = q.source;
      if (src.contentSubject !== 'artist' && src.contentSubject !== 'band') continue;
      const nameKey = src.displayName.trim().toLowerCase();
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
      const meta = getSpotifyArtistMeta(src.displayName);
      const lib = HINTS_LIBRARY[src.id];
      candidates.push({
        item: src,
        type: src.contentSubject,
        country: meta?.country ?? (lib ? inferNationality(lib) : null),
        gender: meta?.gender ?? null,
      });
    }
    for (const cand of SPOTIFY_ARTIST_CANDIDATES) {
      const nameKey = cand.name.toLowerCase();
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);
      candidates.push({
        item: {
          id: `spotify-cand-${nameKey.replace(/[^a-z0-9åäö]+/g, '-')}`,
          displayName: cand.name,
          category: 'artists',
          contentSubject: cand.meta.type,
          audiences: ['all' as ImageQuestionAudience],
          // Syntetiskt distraktor-item — når aldrig region-filtret, men
          // ImageQuizQuestion kräver fältet. 'global' = neutralt/bredast.
          region: ['global'],
          questionText: '',
        },
        type: cand.meta.type,
        country: cand.meta.country,
        gender: cand.meta.gender,
      });
    }

    // Lager-filter, striktast → lösast. Kön jämförs bara när BÅDA sidor har
    // värde ('mixed' matchar 'mixed'). För ICKE-svenska artister skjuts två
    // "internationellt"-lager in före den fria typ-mixen — annars får t.ex.
    // Eagles (USA-band) svenska dansband som alternativ när USA-poolen är
    // för tunn (utländskt band → andra utländska band är mer trovärdigt).
    const MIN_DISTRACTORS = 4;
    let pool: SpotifyNameCandidate[] = candidates;
    if (correctMeta) {
      const genderMatch = (g: SpotifyNameCandidate['gender']) =>
        correctMeta.gender !== null && g === correctMeta.gender;
      const isIntl = (c: SpotifyNameCandidate) => c.country !== null && c.country !== 'sweden';
      const layers = [
        candidates.filter(
          (c) => c.type === correctMeta.type && c.country === correctMeta.country && genderMatch(c.gender),
        ),
        candidates.filter((c) => c.type === correctMeta.type && c.country === correctMeta.country),
        ...(correctMeta.country !== 'sweden'
          ? [
              candidates.filter((c) => c.type === correctMeta.type && isIntl(c) && genderMatch(c.gender)),
              candidates.filter((c) => c.type === correctMeta.type && isIntl(c)),
            ]
          : []),
        candidates.filter((c) => c.type === correctMeta.type && genderMatch(c.gender)),
        candidates.filter((c) => c.type === correctMeta.type),
      ];
      pool = layers.find((l) => l.length >= MIN_DISTRACTORS) ?? candidates;
    }

    const syntheticItem: ImageQuizQuestion = {
      id: `spotify-name-${questionIndex}`,
      displayName: derivedArtistName,
      category: 'artists',
      contentSubject: correctMeta?.type ?? 'artist',
      audiences: ['all' as ImageQuestionAudience],
      // Syntetiskt item för Spotify/Name-svarsblocket — passerar aldrig
      // region-filtret, men fältet krävs av typen.
      region: ['global'],
      questionText: '',
    };
    const variant = buildImageVariant(
      syntheticItem,
      currentAssistance,
      audienceSetForVariants,
      pool.map((c) => c.item),
      DISTRACTOR_POOL_NAMES['artists'] ?? [],
      5,
    );
    setSpotifyNameVariant(variant);
  }, [questionIndex, isSpotifyNameQuestion, currentAssistance, derivedArtistName, audienceSetForVariants]);

  // Aktiv media-källa för aktuell fråga. Returneras `kind: 'none'` om
  // host stängt av alla källor eller frågan saknar curerade klipp —
  // MediaPlayer renderar då NoSourcePlayer-placeholder istället för att
  // krascha. Memoiseras på question-id + lobby-toggles så pickMediaSource
  // inte körs varje render-cykel under en pågående fråga.
  const mediaSource = useMemo(
    () =>
      pickMediaSource(
        {
          // Image-frågor har inga YouTube-klipp; pickMediaSource returnerar
          // då 'none' och MediaPlayer renderas inte (image-grenen ovan).
          // Actor-select (film-frågor) har YouTube-trailer-klipp.
          youtubeClips:
            question.type === 'timeline' || question.type === 'actor-select'
              ? question.youtubeClips
              : undefined,
        },
        { youtubeEnabled, gameMode },
      ),
    [question, youtubeEnabled, gameMode],
  );

  // D-iv: host:s player_id är alltid turnOrder[0] (Lobby-handleStartGame
  // bygger arrayen med host först). Används för default-audio-policyn
  // (host = on när override saknas).
  const hostPlayerId = turnOrder[0]?.id;
  // Lokalt solo-spel (Single Player) — EN spelare på EN enhet, precis som
  // Pass-the-Phone. Appen ska då inte styra ljudet alls: det spelas, och
  // vill spelaren dämpa det använder de enhetens egen volymkontroll.
  // ⚠ Kan INTE härledas ur gameMode: Lobby:s handleSelectSingle sätter bara
  // singlePlayerDefault och rör aldrig gameMode, så ett solo-spel startat
  // från en IndDev-lobby anländer hit med gameMode='individual-devices'.
  // turnOrder.length är den pålitliga signalen (samma test som goToNewLobby).
  // Remote 1v1 är undantaget — där är solo-sessionen per design och raden
  // ska finnas, så läget exkluderas explicit.
  const isLocalSoloGame = gameMode !== 'remote-1v1' && turnOrder.length <= 1;
  // D-iv: ska denna enhet vara mute:ad under uppspelning? Pass-the-Phone och
  // Single Player delar device → alltid ljud på. Vid direkt-nav utan
  // selfPlayerId → fallback till audio på så ljudet hörs i mock-mode. I
  // IndDev läses overrides-mappen; default-policyn kickar in vid saknad key.
  const isAudioMutedForSelf = useMemo(() => {
    if (gameMode === 'pass-the-phone' || isLocalSoloGame) return false;
    // Remote 1v1: solo-session på egen enhet — ljudet spelas lokalt på BÅDA
    // enheterna (ingen host-only-audio-policy; IndDev:s override-map gäller
    // inte här). Default på; spelaren äger sin egen mute via remoteAudioOn.
    if (gameMode === 'remote-1v1') return !remoteAudioOn;
    if (!selfPlayerId) return false;
    if (Object.prototype.hasOwnProperty.call(playerAudioOverrides, selfPlayerId)) {
      return !playerAudioOverrides[selfPlayerId];
    }
    return !isHost;
  }, [gameMode, selfPlayerId, playerAudioOverrides, isHost, remoteAudioOn, isLocalSoloGame]);
  // Aktuell spelares namn i Pass-the-Phone-rotationen — visas subtilt i fråge-
  // kortet ("Answering: {namn}"). Skip:as för Individual Devices (varje
  // spelare är på sin egen enhet och vet redan vem de är).
  const currentPlayerName = turnOrder[currentPlayerIndex]?.name;

  // Ref för exakt question-start-tidpunkt (ms) — används för att räkna ut
  // svarstiden med 2 decimaler vid Confirm. setInterval ger bara sekund-
  // precision så vi måste timestampa separat med Date.now().
  const questionStartMsRef = useRef<number>(0);
  // OBS: hostTimerStartAtRef + timerProgressAnim är deklarerade högre upp
  // (vid timerActive-state:t) eftersom timerActive-effekten använder dem —
  // TS2448 (use before declaration) annars.

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Non-host i IndDev: beräkna korrekt återstående tid baserat på host:s
    // timer_start_at om appen vaknade upp under countdown och vi missade
    // starten. Utan denna korrigering börjar timern alltid om från full
    // responseSeconds fastän host redan räknat ner en bit.
    let effectiveSeconds: number = responseSeconds;
    // Host-sidan kompenserar OCKSÅ — men BARA mot Spotify-timerns stämpel
    // (host-DJ som återvänder från Spotify-appen efter att reserve-
    // aktiveraren startat timern). play_command-stämpeln är host:s egen
    // och ska inte kompenseras — därav den separata Spotify-ref:en.
    // Utan denna gren startade host-DJ:ns timer om från FULL tid vid heal.
    const timerSyncAt = !isHost
      ? hostTimerStartAtRef.current
      : spotifyTimerStartAtRef.current;
    if (timerSyncAt > 0) {
      const elapsed = Math.floor((Date.now() - timerSyncAt) / 1000);
      if (elapsed > 0) {
        effectiveSeconds = Math.max(0, responseSeconds - elapsed);
      }
    }
    setTimeLeft(effectiveSeconds);
    questionStartMsRef.current = Date.now() - (responseSeconds - effectiveSeconds) * 1000;
    // Native-driver kan inte hantera procentuell width, så useNativeDriver:
    // false. Animated.timing schemaläggs ändå via RAF så bar:en uppdateras
    // varje frame oberoende av setInterval-tick:n eller övriga JS-händelser.
    timerProgressAnim.stopAnimation();
    timerProgressAnim.setValue(effectiveSeconds / responseSeconds);
    Animated.timing(timerProgressAnim, {
      toValue: 0,
      duration: effectiveSeconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    // Sekund-räknaren (1 Hz) driver bara den siffer-baserade "23s"-labeln +
    // existing scoring/time-out-logik som jobbar i hela sekunder. Bar:en
    // styrs separat av Animated.Value ovan.
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [questionIndex, timerProgressAnim, responseSeconds, isHost]);

  // Unmount-cleanup så timern inte läcker om component unmounts (t.ex.
  // Quit Game mid-question). Lever utanför phase-baserade effects.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerProgressAnim.stopAnimation();
    };
  }, [timerProgressAnim]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (phase === 'awaiting') {
      // Användaren har redan confirmat — runda + poäng är redan registrerade
      // i handleConfirm. Bara visa reveal-feedbacken när tiden går ut.
      setPhase('reveal');
      return;
    }
    if (phase === 'question') {
      // Time ran out utan Confirm — registrera ronden som missad (0 poäng,
      // inget giltigt svar) och gå direkt till reveal.
      if (question.type === 'timeline') {
        const defaultGuess = new Date().getFullYear() - 20;
        setSelectedYear(defaultGuess);
        setConfirmedCorrect(false);
        setRounds((prev) => [
          ...prev,
          {
            questionNumber: questionIndex + 1,
            category: question.category,
            question: question.question,
            correctYear: question.correctYear,
            selectedYear: defaultGuess,
            correct: false,
            points: 0,
            timeUsed: responseSeconds,
          },
        ]);
      } else {
        // Image/actor-select time-out: confirmed*-state förblir null,
        // reveal visar ✗ Wrong Answer + rätt svar.
        setRounds((prev) => [
          ...prev,
          {
            questionNumber: questionIndex + 1,
            category: question.category,
            question: question.question,
            correctYear: 0,
            selectedYear: 0,
            correct: false,
            points: 0,
            timeUsed: responseSeconds,
          },
        ]);
      }
      recordRoundScore(0, false, responseSeconds, shouldLockForUnstableRef.current);
      setPhase('reveal');
    }
  }, [timeLeft]);

  // Spegla Spotify DJ-state till refs så AppState-listener aldrig läser stale closures.
  useEffect(() => { spotifyDJOpenedAppRef.current = spotifyDJOpenedApp; }, [spotifyDJOpenedApp]);
  useEffect(() => { spotifyDJStartedRef.current = spotifyDJStarted; }, [spotifyDJStarted]);
  useEffect(() => { currentSpotifyTrackIdRef.current = currentSpotifyTrackId; }, [currentSpotifyTrackId]);
  // ── FUTURE VERSION 2 — Automated API Flow (archived ref-sync effects) ─────────────
  // useEffect(() => { spotifyIsPlayingRef.current = spotifyIsPlaying; }, [spotifyIsPlaying]);
  // useEffect(() => { spotifyPausePositionMsRef.current = spotifyPausePositionMs; }, [spotifyPausePositionMs]);
  // ─────────────────────────────────────────────────────────────────────────────────

  // ── FUTURE VERSION 2 — Automated API Flow (archived track-info fetch) ────────────
  // Pre-hämtar track-info så snart frågan är en Spotify-fråga — overlay-data klar
  // för alla spelare när de återvänder från Spotify-appen. Reaktiveras i V2.
  // useEffect(() => {
  //   if (!currentSpotifyTrackId) { setNowPlayingTrackInfo(null); return; }
  //   let cancelled = false;
  //   setNowPlayingTrackInfo(null);
  //   fetchSpotifyTrackInfo(currentSpotifyTrackId).then((info) => {
  //     if (!cancelled && info) setNowPlayingTrackInfo(info);
  //   });
  //   return () => { cancelled = true; };
  // }, [currentSpotifyTrackId]);
  // ─────────────────────────────────────────────────────────────────────────────────

  // AppState-lyssnare: när appen återvänder till förgrunden (t.ex. DJ som
  // kommit tillbaka från Spotify) synkas timern mot real elapsed time.
  // iOS throttlar setInterval + Animated.timing i bakgrunden → lokal timer
  // kan ligga sekunder efter verkligheten när appen aktiveras igen.
  // (phaseRef deklareras redan ovan rad ~1436, ingen ny deklaration behövs här)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;

      // ── FUTURE VERSION 2 — Automated API Flow (archived AppState blocks) ──────────
      // Visa Now Playing-overlay när DJ:n återvänder från Spotify-appen.
      // if (
      //   spotifyDJOpenedAppRef.current &&
      //   !spotifyDJStartedRef.current &&
      //   phaseRef.current === 'question'
      // ) {
      //   setShowNowPlayingOverlay(true);
      // }
      //
      // Auto-resume: DJ återvände från Spotify-appen efter fallback-länk.
      // if (
      //   spotifyWentToFallbackRef.current &&
      //   !spotifyIsPlayingRef.current &&
      //   phaseRef.current === 'question' &&
      //   currentSpotifyTrackIdRef.current
      // ) {
      //   spotifyWentToFallbackRef.current = false;
      //   const trackId = currentSpotifyTrackIdRef.current;
      //   const positionMs = spotifyPausePositionMsRef.current;
      //   resumeSpotifyPlayback(trackId, positionMs).then((ok) => {
      //     if (ok) setSpotifyIsPlaying(true);
      //   });
      // }
      // ─────────────────────────────────────────────────────────────────────────────

      // Non-host i IndDev: om appen vaknade upp under countdown och host:s
      // timer redan har startat → hoppa direkt till question-fasen med
      // korrekt återstående tid. Undviker att de frysta countdown-tick:arna
      // eldar av snabbt och sedan startar timern om från full responseSeconds.
      if (!isHost && hostTimerStartAtRef.current > 0 && phaseRef.current === 'countdown') {
        const now = Date.now();
        const timerStartAt = hostTimerStartAtRef.current;
        if (now >= timerStartAt) {
          const elapsed = Math.floor((now - timerStartAt) / 1000);
          const adjustedLeft = Math.max(0, responseSeconds - elapsed);
          timerProgressAnim.stopAnimation();
          timerProgressAnim.setValue(adjustedLeft / responseSeconds);
          setTimeLeft(adjustedLeft);
          setTimerActive(true);
          setPhase('question');
          return;
        }
      }

      // ── Spotify DJ return: timer-sync när DJ återvänder från Spotify-appen ──
      // spotifyDJOpenedAppRef = true ENBART på DJ:ns enhet (sätts när DJ
      // trycker "Start track in Spotify"). spotifyTimerStartAtRef sätts synkront
      // av onSpotifyDJTrackStarted-payloaden → korrekt wall-clock-referens
      // oavsett om React:s setState-batching hann köra medan appen var bakgrunds.
      // Scenario 1: iOS frös setTimerActive-setTimeout → timerActive=false →
      //   startTimer() kördes aldrig → questionStartMsRef=0 → general path
      //   returnerar tidigt → timer visas som "full 30s" istället för korrekt pos.
      // Scenario 2: timern gick ut medan DJ var i Spotify → phase='reveal'
      //   på icke-DJ-enheter men DJ:ns phase är fortfarande 'question' →
      //   DJ ser timer börja om från början när de återvänder.
      if (spotifyDJOpenedAppRef.current && spotifyTimerStartAtRef.current > 0) {
        const elapsedSec = (Date.now() - spotifyTimerStartAtRef.current) / 1000;
        if (elapsedSec >= responseSeconds) {
          // Timer har redan gått ut — sätt timeLeft=0 om vi fortfarande är i
          // question/awaiting. timeLeft-useEffect:n sköter setPhase('reveal')
          // inkl. score-registrering för timeout-fallet.
          if (phaseRef.current === 'question' || phaseRef.current === 'awaiting') {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            timerProgressAnim.stopAnimation();
            timerProgressAnim.setValue(0);
            setTimeLeft(0);
          }
          // phase='reveal' eller senare → ingenting att göra.
        } else {
          // Timer tickar fortfarande — synka position.
          const remaining: number = responseSeconds - elapsedSec;
          timerProgressAnim.stopAnimation();
          timerProgressAnim.setValue(remaining / responseSeconds);
          Animated.timing(timerProgressAnim, {
            toValue: 0,
            duration: remaining * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start();
          setTimeLeft(Math.ceil(remaining));
          // setTimerActive(true) triggar startTimer()-useEffect:n som
          // kompenserar elapsed via hostTimerStartAtRef → idempotent.
          // Om timerActive redan är true blir det en React no-op.
          setTimerActive(true);
        }
        return;
      }

      const currentPhase = phaseRef.current;
      if (currentPhase !== 'question' && currentPhase !== 'awaiting') return;
      if (questionStartMsRef.current === 0) return;

      const elapsedMs = Date.now() - questionStartMsRef.current;
      const elapsedSec = elapsedMs / 1000;
      const remaining = responseSeconds - elapsedSec;

      if (remaining <= 0) {
        // Tiden har redan gått ut — klipp intervall + animation och sätt timeLeft=0
        // vilket triggar timeLeft-useEffect:n att köra timeout-logiken.
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        timerProgressAnim.stopAnimation();
        timerProgressAnim.setValue(0);
        setTimeLeft(0);
      } else {
        // Tid kvar — synka timeLeft och starta om Animated.timing från rätt position.
        const remainingSec = Math.ceil(remaining);
        setTimeLeft(remainingSec);
        timerProgressAnim.stopAnimation();
        timerProgressAnim.setValue(remaining / responseSeconds);
        Animated.timing(timerProgressAnim, {
          toValue: 0,
          duration: remaining * 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();
      }
    });
    return () => sub.remove();
  }, [responseSeconds, timerProgressAnim, isHost]);

  // Spotify DJ — timer-sync via spotifyDJStarted state-ändring.
  // AppState 'active' fyrar INNAN Supabase Realtime-broadcastens JS-hanterare
  // kör, så spotifyTimerStartAtRef kan vara 0 första gången DJ återvänder från
  // Spotify-appen. Denna effect triggar direkt när state-uppdateringen appliceras
  // — vilket garanterat sker EFTER spotifyTimerStartAtRef satts synkront i
  // broadcasthanteraren. Fungerar som fallback för första återkomsten;
  // andra och efterföljande återkomster hanteras av AppState-path:en ovan.
  useEffect(() => {
    if (!spotifyDJStarted || !spotifyDJOpenedApp) return;
    if (spotifyTimerStartAtRef.current === 0) return;
    if (phaseRef.current !== 'question' && phaseRef.current !== 'awaiting') return;
    const elapsedSec = (Date.now() - spotifyTimerStartAtRef.current) / 1000;
    if (elapsedSec >= responseSeconds) {
      // Timer gick ut medan DJ var i Spotify-appen.
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      timerProgressAnim.stopAnimation();
      timerProgressAnim.setValue(0);
      setTimeLeft(0);
    } else {
      // Timer tickar fortfarande — setTimerActive(true) triggar startTimer()
      // som kompenserar elapsed via hostTimerStartAtRef.
      setTimerActive(true);
    }
  }, [spotifyDJStarted, spotifyDJOpenedApp, responseSeconds, timerProgressAnim]);

  // Registrera score:n för en avslutad fråga. I Pass-the-Phone (eller när
  // turnOrder är satt) skapar vi en post för ENDAST den aktiva spelaren —
  // mock-motspelare auto-genereras inte eftersom alla spelare är riktiga
  // och delar denna enhet (en spelare i taget). Direkt-nav till /quiz utan
  // turnOrder simulerar fortfarande mock-motspelare för gameplay-testning.
  const recordRoundScore = (yourPoints: number, yourCorrect: boolean, yourTimeUsed: number, connectionError?: boolean) => {
    // Förhindra double-scoring per fråga (race: handleConfirm* + useEffect([timeLeft])).
    if (hasRecordedScoreForCurrentQuestionRef.current) return;
    hasRecordedScoreForCurrentQuestionRef.current = true;
    // Samla in svar-statistik per fråga (% rätt globalt) — fire-and-forget.
    // Används i framtida svårighetsgradsstyrning. Hoppas över vid direkt-nav
    // (tom turnOrder = mock-test-läge) för att inte skeva statistiken med
    // auto-genererade mock-svar.
    if (currentQ && turnOrder.length > 0) {
      recordQuestionAnswer(currentQ.id, yourCorrect);
    }
    // Vilken spelare attribueras score:n till?
    //   • Pass-the-Phone: turnOrder[currentPlayerIndex] — aktiv spelare
    //     roterar mellan ronder, alla scoreposter går till "current"-rad:n.
    //   • Individual Devices: selfPlayerId — varje enhet är EN spelare.
    //     currentPlayerIndex stannar på 0 i IndDev (ingen rotation), så om
    //     vi också använde turnOrder[currentPlayerIndex] skulle ALLA scores
    //     på non-host:s enhet attribueras till host (turnOrder[0]) — vilket
    //     gjorde att non-host:s egen rad visade 0 i played rounds/correct/
    //     avg/pts genom hela spelet.
    //   • Direkt-nav utan turnOrder: 'you' som sista fallback.
    // Remote 1v1 attribueras som IndDev — solo-session där selfPlayerId
    // ÄR den enda spelaren (turnOrder = [self], ingen rotation).
    const activePlayerId =
      (gameMode === 'individual-devices' || gameMode === 'remote-1v1') && selfPlayerId
        ? selfPlayerId
        : (turnOrder[currentPlayerIndex]?.id ?? 'you');
    // questionIndex bärs med så match highlights kan joina score → fråga
    // (kategori/mediakälla). Läses ur ref:en, inte state, eftersom
    // recordRoundScore anropas från timer-callbacks vars closure kan vara
    // en render gammal.
    const scoredQuestionIndex = questionIndexRef.current;
    const yourScore: RoundScore = {
      playerId: activePlayerId,
      points: yourPoints,
      correct: yourCorrect,
      timeUsed: yourTimeUsed,
      questionIndex: scoredQuestionIndex,
      ...(connectionError ? { connectionError: true } : {}),
    };
    let allScores: RoundScore[] = [yourScore];
    // Mock-motspelare genereras BARA vid direkt-nav (tom turnOrder).
    if (turnOrder.length === 0) {
      const opponentScores: RoundScore[] = MOCK_OPPONENTS.map((opp) => {
        const gen = generateOpponentRoundScore(opp.assistance ?? 'standard');
        return {
          playerId: opp.id,
          points: gen.points,
          correct: gen.correct,
          timeUsed: generateOpponentTimeUsed(),
          questionIndex: scoredQuestionIndex,
        };
      });
      allScores = [yourScore, ...opponentScores];
    }
    setCurrentRoundScores(allScores);
    setAllRoundScoresHistory((prev) => [...prev, allScores]);
    // Remote 1v1: persistera svaret server-side (fire-and-forget). Unique-
    // constrainten (match_id, user_id, question_index) gör skrivningen
    // idempotent — retry/dubbelanrop dubbelräknar aldrig. Driver resume +
    // motståndarens resultat-jämförelse.
    if (isRemote && remoteMatchId && currentQ) {
      void upsertAnswer(remoteMatchId, {
        questionIndex,
        questionId: currentQ.id,
        correct: yourCorrect,
        points: yourPoints,
        timeUsedSeconds: yourTimeUsed,
      });
    }
    // Broadcast score till andra IndDev-enheter så deras leaderboard
    // uppdateras med vår post. broadcast.self: false gör att vi aldrig
    // tar emot vårt eget event — ingen double-count-risk.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      const scorePayload: PlayerScoreRecordedPayload = {
        player_id: activePlayerId,
        question_index: questionIndex,
        points: yourPoints,
        correct: yourCorrect,
        time_used: yourTimeUsed,
      };
      // Spara alltid i pending-kön — vid reconnect skickas alla om.
      // Dedup-nyckeln player_id+question_index på mottagarsidan gör re-send säkert.
      pendingScoreBroadcastsRef.current.push(scorePayload);
      syncChannelRef.current
        .broadcastPlayerScoreRecorded(scorePayload)
        .catch(() => {});
    }
  };

  useEffect(() => {
    // Timern startas vid 'question'-entry (efter intro/countdown). När
    // användaren bekräftar svaret går phase → 'awaiting' men timern ska
    // FORTSÄTTA ticka — alla spelare får samma tidsbudget oavsett när de
    // bekräftade. Därför ingen cleanup här som klipper intervallet vid
    // phase-byte; intervallet self-clearas när timeLeft hits 0 (eller via
    // unmount-cleanup ovan).
    if (!timerActive) return;
    // Normalt: startar bara i 'question'. Spotify-undantag: om non-host
    // confirmat (phase='awaiting') INNAN DJ aktiverat, startar timern när
    // timerActive sätts true av onSpotifyDJTrackStarted-handleren.
    if (phase !== 'question' && !(isSpotifyQuestion && phase === 'awaiting')) return;
    // Spotify/awaiting-undantaget: starta bara om timern INTE redan körs.
    // Utan denna guard anropas startTimer() igen när host confirmar (phase
    // question→awaiting) vilket startar om nedräkningen från början.
    // Undantaget ska bara fyra när timerActive sätts true medan phase='awaiting'
    // (non-host confirmat INNAN DJ aktiverat trackingen).
    if (phase === 'awaiting' && timerRef.current !== null) return;
    startTimer();
  }, [questionIndex, phase, timerActive, isSpotifyQuestion]);

  // ── Spotify DJ timeout ──────────────────────────────────────────────────
  // Ref till handleAdvanceToNextRound för att undvika stale closure i
  // timeout-useEffect:en (funktionen ändras per render men ref:en är alltid
  // färsk).
  const handleAdvanceToNextRoundRef = useRef<((i?: number) => void) | null>(null);

  // Host broadcastar vem som är DJ för Spotify-frågan när question-fasen startar.
  // Non-host:s onSpotifyQuestionReady-handler sparar dj_player_id → isCurrentPlayerDJ.
  useEffect(() => {
    if (!isHost || !isSpotifyQuestion || phase !== 'question') return;
    if (gameMode !== 'individual-devices' || !syncChannelRef.current) return;
    const q = currentQ as TimelineQuestion | null;
    if (!q || !currentDJPlayer) return;
    syncChannelRef.current
      .broadcastSpotifyQuestionReady({
        question_index: questionIndex,
        spotify_track_id: q.spotifyTrackId ?? '',
        display_name: q.hint,
        correct_year: q.correctYear,
        dj_player_id: currentDJPlayer.id,
        answer_type: resolveSpotifyAnswerType(questionIndex),
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpotifyQuestion, phase, questionIndex]);

  // Fas 1: vänta 240 s på DJ-broadcast innan synlig nedräkning startar.
  // Om spotifyDJStarted blir true cleanas timeout bort.
  // Total timeout: 240 s (fas 1, tyst) + 60 s (fas 2, synlig) = 300 s.
  useEffect(() => {
    if (!isSpotifyQuestion || phase !== 'question' || spotifyDJStarted) return;
    setSpotifyWaitPhase('waiting');
    const phase1 = setTimeout(() => setSpotifyWaitPhase('countdown'), 240_000);
    return () => clearTimeout(phase1);
  }, [isSpotifyQuestion, phase, questionIndex, spotifyDJStarted]);

  // Fas 2: synlig nedräkning 60 → 0.
  useEffect(() => {
    if (spotifyWaitPhase !== 'countdown') return;
    setSpotifyTimeoutSeconds(60);
    const interval = setInterval(() => {
      setSpotifyTimeoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [spotifyWaitPhase, questionIndex]);

  // Fas 3: nedräkning nådde 0 → hoppa över låten utan poäng.
  useEffect(() => {
    if (spotifyWaitPhase !== 'countdown' || spotifyTimeoutSeconds !== 0) return;
    if (phaseRef.current !== 'question') return;
    setSpotifyWaitPhase('skipped');
    // Blockera auto-scoring för denna fråga.
    hasRecordedScoreForCurrentQuestionRef.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // Visa "Track skipped" i 2,5 s, gå sedan till nästa fråga/leaderboard.
    const t = setTimeout(() => {
      handleAdvanceToNextRoundRef.current?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [spotifyTimeoutSeconds, spotifyWaitPhase]);

  useEffect(() => {
    // Pulsa progress-barens opacity (1 → 0.55 → 1) när ≤5s kvar för att
    // signalera att tiden är kritisk. Native driver eftersom det är ren
    // opacity-animation. Gäller både question OCH awaiting (timer:n tickar
    // ned till 0 i båda faserna).
    if (timeLeft <= 5 && (phase === 'question' || phase === 'awaiting')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.55, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [timeLeft, phase]);

  // Spring-in inline-reveal när phase växlar till 'reveal'. Reset:ar värdena
  // varje gång så animationen körs på varje frågetransition (inte bara första).
  useEffect(() => {
    if (phase === 'reveal') {
      revealScale.setValue(0.6);
      revealOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(revealScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(revealOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [phase, revealScale, revealOpacity]);

  // Pulserande ring + glow runt sekund-räknaren — körs i alla aktiva timer-
  // faser ('question' + 'awaiting'). Stoppas i intro/countdown/reveal/
  // leaderboard så ringen står still när timern inte tickar.
  useEffect(() => {
    const isActive = phase === 'question' || phase === 'awaiting';
    if (!isActive) {
      timerRingPulse.stopAnimation();
      timerRingPulse.setValue(1);
      timerRingGlow.stopAnimation();
      timerRingGlow.setValue(0.3);
      return;
    }
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerRingPulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(timerRingPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerRingGlow, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(timerRingGlow, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [phase, timerRingPulse, timerRingGlow]);

  // Next-tab:ens kontinuerliga scale-pulse (1 ↔ 1.03 over 900ms each way) —
  // speglar startskärmens primary-CTA-pulse exakt. Körs på mount och framåt
  // utan phase-gating; tab:en är ändå bara monterad i reveal-fasen.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(nextTabPulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(nextTabPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [nextTabPulse]);

  // Stabil transform-style för DJ-flödets reveal-CTA:er. Ett inline-objekt
  // hade skapats på nytt vid varje re-render av quiz-skärmen (och reveal-
  // fasen re-rendrar ofta — SequentialDots, Realtime-events), vilket får
  // Animated att koppla om sin native-props-nod mitt i pulsen → synliga hack.
  const nextTabPulseStyle = useMemo(
    () => ({ transform: [{ scale: nextTabPulse }] }),
    [nextTabPulse],
  );

  // Next-tab:ens kraftigare pulse: scale + halo-opacity i parallell så
  // knappen både växer och "andas" ljus. Samma stabila-style-krav som ovan.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(nextCtaPulse, { toValue: 1.08, duration: 650, useNativeDriver: true }),
          Animated.timing(nextCtaGlow, { toValue: 0.55, duration: 650, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(nextCtaPulse, { toValue: 1, duration: 650, useNativeDriver: true }),
          Animated.timing(nextCtaGlow, { toValue: 0.15, duration: 650, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [nextCtaPulse, nextCtaGlow]);

  const nextCtaPulseStyle = useMemo(
    () => ({ transform: [{ scale: nextCtaPulse }] }),
    [nextCtaPulse],
  );
  const nextCtaGlowStyle = useMemo(() => ({ opacity: nextCtaGlow }), [nextCtaGlow]);

  // DJ-start-CTA:ns glow + pulse (se deklarationskommentaren vid djStartPulse).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(djStartPulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(djStartGlow, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(djStartPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(djStartGlow, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [djStartPulse, djStartGlow]);

  // Scroll-hint-pulse på image-frågor (1 ↔ 0.3 opacity, 600ms varje håll).
  // Snabbare cadence än övriga pulses så down-chevronen blinkar tydligare och
  // grabbar attention. Körs kontinuerligt — pilen är ändå bara monterad när
  // phase + question-typ matchar.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollHintOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(scrollHintOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scrollHintOpacity]);

  // Reset scroll-hint-synlighet vid varje frågebyte — pilen ska återkomma
  // på nästa image-fråga oavsett om spelaren scrollat ner i föregående fråga.
  useEffect(() => {
    setScrolledToBottom(false);
    setYoutubeError(false);
    // Spotify: nollställ DJ-state + timeout per fråga.
    setSpotifyDJOpenedApp(false);
    setSpotifyDJOpenedAppBroadcast(false);
    setSpotifyDJStarted(false);
    setDjHandedOver(false);
    setDjDismissedOverlay(false);
    setSpotifyWaitPhase(null);
    setSpotifyTimeoutSeconds(60);
    // Nollställ broadcastDJPlayerId så föregående frågas DJ-tilldelning
    // inte läcker in i nästa fråga (non-host hämtar ny via spotify_question_ready).
    setBroadcastDJPlayerId(null);
    setBroadcastSpotifyAnswerType(null);
    // spotifyNameVariant nollställs av build-effekten (rad 2138) via sin
    // early-return-guard när isSpotifyNameQuestion blir false — ingen
    // explicit reset här behövs och den orsakade att varianten nulle:ades
    // efter att build-effekten byggt den (effects körs i registrerings-ordning).
    // ── FUTURE VERSION 2 — Automated API Flow (archived questionIndex resets) ──────
    // setNowPlayingTrackInfo(null);
    // setSpotifyIsPlaying(true);
    // setSpotifyPausePositionMs(0);
    // if (spotifyKeepAliveRef.current !== null) {
    //   clearInterval(spotifyKeepAliveRef.current);
    //   spotifyKeepAliveRef.current = null;
    // }
    // spotifyWentToFallbackRef.current = false;
    // ─────────────────────────────────────────────────────────────────────────────
  }, [questionIndex]);

  // ScrollView:s onScroll → räkna avstånd från content-botten. När < 24 px
  // kvar (≈ Confirm-knappen är fully visible) → setScrolledToBottom(true) →
  // pilen göms via gate i JSX. useCallback för att inte re-skapa handler:n
  // per render (ScrollView re-mountar då).
  const handleScrollHintScroll = useCallback((e: {
    nativeEvent: {
      contentOffset: { y: number };
      layoutMeasurement: { height: number };
      contentSize: { height: number };
    };
  }) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setScrolledToBottom(distanceFromBottom <= 24);
  }, []);

  // 2-decimal countdown-tick (20 Hz). Körs ENDAST i 'question'-fasen — så
  // fort spelaren confirmar (phase → 'awaiting') stoppas tick:n och displayen
  // fryses på exakt confirm-värdet (sätts explicit i handleConfirm). I
  // intro/countdown/reveal/leaderboard återställs till "30.00".
  useEffect(() => {
    const totalMs = responseSeconds * 1000;
    if (phase !== 'question' || !timerActive) {
      // Nollställ bara vid ny frågestart (intro/countdown) eller under
      // 2-sekunders-bufferten (phase='question' men timerActive ännu false).
      // INTE vid 'awaiting'/'reveal' — då är värdet fryst på confirm-momentet
      // och ska inte skrivas över.
      if (phase === 'intro' || phase === 'countdown' || (phase === 'question' && !timerActive)) {
        setDecimalElapsedMs(0);
      }
      return;
    }
    const tick = () => {
      const elapsedMs = Date.now() - questionStartMsRef.current;
      const clamped = Math.min(totalMs, Math.max(0, elapsedMs));
      setDecimalElapsedMs(clamped);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [phase, questionIndex, responseSeconds, timerActive]);

  // Spara alla unika fråge-IDs i denna omgång när spelet är klart.
  // savedSeenRef förhindrar dubbelskrivning om effekten av någon anledning
  // re-fyrar. seenQuestionIds-state uppdateras lokalt också så nästa Play
  // Again direkt i samma session redan ser de nyss spelade frågorna.
  useEffect(() => {
    if (phase !== 'leaderboard' || savedSeenRef.current) return;
    savedSeenRef.current = true;
    // KRITISKT (fix 2026-08-04): på NON-HOST i IndDev är gameQuestions den
    // LOKALA slumpordningen — de faktiskt spelade frågorna är host:s sekvens
    // (broadcastAllQuestionIds). Att spara lokala shufflen gav non-host en
    // felaktig historik → när samma spelare hostade nästa spel kunde exakt
    // samma låt återkomma trots 20-sessions-fönstret.
    const effectivePlayedIds =
      !isHost && broadcastAllQuestionIds && broadcastAllQuestionIds.length > 0
        ? broadcastAllQuestionIds
        : gameQuestions.map((q) => q.id);
    const playedIds = [...new Set(effectivePlayedIds)];
    // Pass-the-Phone: alla registrerade deltagare spelade på DENNA enhet —
    // skriv sessionen även under deras playerName-nycklar så historiken
    // finns här om de senare loggar in/hostar på samma enhet. Egen profil
    // skippas internt (skrivs av addSessionRecord nedan). Guests utan konto
    // filtreras bort — deras historik kan inte valideras.
    if (gameMode !== 'individual-devices' && turnOrder.length > 1) {
      const registeredNames = turnOrder
        .filter((p) => p.type === 'registered' && p.name)
        .map((p) => p.name);
      if (registeredNames.length > 0) {
        addSessionRecordForNames(registeredNames, playedIds).catch(() => {});
      }
    }
    addSessionRecord(playedIds).then(() => {
      setSeenQuestionIds((prev) => new Set([...prev, ...playedIds]));
      // Uppdatera lastSessionIds direkt så Play Again i samma session
      // omedelbart exkluderar den nyss spelade omgångens frågor.
      setLastSessionIds(new Set(playedIds));
    });
    persistEpochLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // "Kan användaren confirma just nu?" — discriminerad-union-helper.
  // Musik: pendingYear satt. Bild: aktiv direkt när hints visas (hintsReady)
  // så knappen pulsar från start — spelaren väljer svar och trycker sedan Confirm.
  // Klick utan valt svar gör ingenting (handleConfirmName-grenen checkar pendingNameOption).
  // DJ kan aldrig confirma (de svarar inte på Spotify-frågor).
  const canConfirm = isCurrentPlayerDJ
    ? false
    : isSpotifyNameQuestion
      ? pendingNameOption !== null
      : isImageQuestion
        ? hintsReady
        : isActorSelectQuestion
          ? pendingActorName !== null
          : pendingYear !== null;

  // Confirm-knappens scale + glow-loop. Körs medan phase === 'question' OCH
  // ett svar är preliminärt valt (knappen är tappbar). Stoppas i andra faser så
  // disabled-knappen står still — pulserande disabled-knapp läses som "klick-
  // bar men inte". Båda loops använder native driver (transform/opacity).
  useEffect(() => {
    if (phase !== 'question' || !canConfirm) {
      confirmPulse.stopAnimation();
      confirmPulse.setValue(1);
      confirmGlow.stopAnimation();
      confirmGlow.setValue(0.4);
      return;
    }
    // Cadensen (1.03 scale + 0.4↔0.85 opacity, 1100ms varje håll) speglar
    // Lobby:s Start Game-CTA exakt så de två "go-action"-knapparna i
    // host-flödet andas i samma rytm.
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmPulse, { toValue: 1.03, duration: 1100, useNativeDriver: true }),
        Animated.timing(confirmPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmGlow, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        Animated.timing(confirmGlow, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [phase, canConfirm, confirmPulse, confirmGlow]);

  // Pulse-loop för "Activate Timer"-knappen i Spotify-frågor (sticky bottom bar).
  // Aktiv enbart när: timer-aktiverare + Spotify-fråga + DJ öppnat + !spotifyDJStarted.
  useEffect(() => {
    if (
      !isTimerActivator ||
      !isSpotifyQuestion ||
      spotifyDJStarted ||
      phase !== 'question' ||
      !spotifyDJOpenedAppBroadcast ||
      spotifyWaitPhase === 'skipped'
    ) {
      activateTimerPulse.stopAnimation();
      activateTimerPulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(activateTimerPulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(activateTimerPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isTimerActivator, isSpotifyQuestion, spotifyDJStarted, phase, spotifyDJOpenedAppBroadcast, spotifyWaitPhase, activateTimerPulse]);

  const handleConfirm = (year: number) => {
    // Defensiv guard: bara aktiv i question-fasen. Använder phaseRef (inte
    // closure-phase) för att fånga race-fallet där setPhase('awaiting') redan
    // anropats av en concurrent handler men React inte hunnit re-rendera.
    if (phaseRef.current !== 'question') return;
    // handleConfirm är timeline-specifik (year-baserad).
    // Image-frågor anropar handleConfirmName istället. Skydd mot fel-binding i UI.
    if (question.type !== 'timeline') return;
    // Timer:n stoppas INTE — alla spelare får samma tidsbudget oavsett när
    // de bekräftade. Reveal-feedbacken visas först när timer:n går till 0
    // (i useEffect:en på timeLeft nedan).
    const interval = getIntervalForAssistance(currentAssistance);
    const correct = isCorrect(year, question.correctYear, interval, eraFrom, eraTo);
    setConfirmedCorrect(correct);
    const pts = calculatePoints(correct, currentAssistance, 'year');
    // 2-decimals svarstid via Date.now()-diff (questionStartMsRef sätts i
    // startTimer). Cap:as till responseSeconds så ev. clock drift inte ger
    // > totalSeconds. Används både till stopwatch-display, reveal-card och
    // leaderboard-aggregat — heltals-derived `responseSeconds - timeLeft`
    // undviks medvetet eftersom den ger "x.00" i AVG/LAST-kolumnerna.
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    // Frys stopwatch-displayen på EXAKT confirm-värdet. Tick-effekten ovan
    // stoppar (phase blir 'awaiting' direkt efter), men det senast tickade
    // värdet kan vara upp till 50 ms före confirm. Genom att skriva exakt
    // elapsed här matchar displayen confirmed time + avatar-markörens
    // x-position på timer-bar:en.
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setSelectedYear(year);
    // totalPoints uppdateras automatiskt via gameTotals (deriveras från
    // history när recordRoundScore tillsätter en post nedan).
    setRounds((prev) => [
      ...prev,
      {
        questionNumber: questionIndex + 1,
        category: question.category,
        question: question.question,
        correctYear: question.correctYear,
        selectedYear: year,
        correct,
        points: pts,
        timeUsed: exactElapsedSec,
      },
    ]);
    // Registrera score:n för aktuell spelare (och i direkt-nav-fallet
    // även mock-motspelarnas auto-genererade poäng). Skickar 2-decimals-
    // exakt elapsed så leaderboardens AVG/LAST-kolumner visar variation.
    recordRoundScore(pts, correct, exactElapsedSec);
    // Markera own confirm lokalt + broadcast till andra devices så deras
    // timer-bar uppdaterar avatar-positionen för denna spelare. Gated på
    // IndDev — i Pass-the-Phone delar alla samma enhet/markör.
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // YouTube-felhantering: kallas när MediaPlayer rapporterar embed-fel.
  // Räknas som missad fråga (0 pts) — spelaren kunde inte se videon.
  // Övergår till reveal-fas efter 2.5 s så rätt svar visas ändå.
  // Gated på 'question'-fas: om felet fyrar under awaiting/reveal har
  // score:n redan registrerats och vi ska inte dubbel-räkna.
  // recordRoundScore är en vanlig funktion (inte useCallback) — referensen
  // är stabil per render, ref-pattern undviker stale-closure utan dep-array.
  const recordRoundScoreRef = useRef(recordRoundScore);
  recordRoundScoreRef.current = recordRoundScore;
  const handleYoutubeError = useCallback(() => {
    if (phase !== 'question') return;
    if (youtubeError) return;
    setYoutubeError(true);
    recordRoundScoreRef.current(0, false, responseSeconds);
    setTimeout(() => setPhase('reveal'), 2500);
  }, [phase, youtubeError, responseSeconds]);

  // Image-fråge-Confirm: speglar handleConfirm men för name-svar.
  // correct = opt.isCorrect (pre-baked från distractor-builderns rätt-flagga).
  const handleConfirmName = (opt: ImageNameOption) => {
    if (phaseRef.current !== 'question') return;
    if (question.type !== 'image' && !isSpotifyNameQuestion) return;
    const correct = opt.isCorrect;
    const pts = calculatePoints(correct, currentAssistance, 'name');
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setConfirmedNameOption(opt);
    // RoundResult-shapen är timeline-formad (correctYear/selectedYear som number).
    // Image-rundor sätter 0 för year-fälten — reveal-renderingen läser
    // displayName från question istället för selectedYear/correctYear.
    setRounds((prev) => [
      ...prev,
      {
        questionNumber: questionIndex + 1,
        category: question.category,
        question: question.question,
        correctYear: 0,
        selectedYear: 0,
        correct,
        points: pts,
        timeUsed: exactElapsedSec,
      },
    ]);
    recordRoundScore(pts, correct, exactElapsedSec);
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // Actor-select-Confirm: speglar handleConfirmName men för filmfrågor.
  // correct = spelarens val finns i question.correctNames.
  const handleConfirmActor = (name: string) => {
    if (phaseRef.current !== 'question') return;
    if (question.type !== 'actor-select') return;
    const correct = question.correctNames.includes(name);
    const pts = calculatePoints(correct, currentAssistance, 'name');
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setConfirmedActorName(name);
    setRounds((prev) => [
      ...prev,
      {
        questionNumber: questionIndex + 1,
        category: question.category,
        question: question.question,
        correctYear: 0,
        selectedYear: 0,
        correct,
        points: pts,
        timeUsed: exactElapsedSec,
      },
    ]);
    recordRoundScore(pts, correct, exactElapsedSec);
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // ── Navigations-handlers ────────────────────────────────────────────────

  // Från Reveal: visa leaderboard
  const handleShowLeaderboard = () => {
    setPhase('leaderboard');
  };

  // D-iii: non-host:s Retry-knapp i ConnectionUnstableOverlay. Rensar
  // sticky-latch + pending-answer-state + routar till intro + broadcastar
  // player_rejoined så A:s leaderboard flippar oss från 'disconnected'
  // tillbaka till connected (heartbeat ENSAM gör inte det per design).
  // När host sedan broadcastar play_command kör B:s playCommandHandler
  // som vanligt (sticky är nu false → ingen ignore).
  const handleRetryFromUnstable = () => {
    setPendingYear(null);
    setSelectedYear(null);
    setConfirmedCorrect(null);
    setPendingNameOption(null);
    setConfirmedNameOption(null);
    setPendingActorName(null);
    setConfirmedActorName(null);
    setConfirmedTimeUsed(null);
    setStickyUnstableForQuestion(false);
    setPhase('intro');
    if (selfPlayerId && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayerRejoined({ sender_id: selfPlayerId })
        .catch(() => {
          // Fire-and-forget. Om broadcast fail:ar (t.ex. flapping connection)
          // sitter A med stale 'disconnected'-flag. Acceptabelt MVP — B kan
          // försöka tapa Retry igen vid nästa stable-moment.
        });
    }
  };

  // Från Reveal eller Leaderboard: hoppa direkt till nästa fråga.
  // `explicitNextIndex` används av non-host:s questionAdvanceHandler för
  // att synka till broadcast:ens canonical-värde — om B missade tidigare
  // question_advance medan offline skulle +1 ge stale index. Host:s
  // lokala Next-tap kallar utan arg → faller tillbaka till +1 (host är
  // alltid canonical så drift kan inte uppstå).
  const handleAdvanceToNextRound = (explicitNextIndex?: number) => {
    // Stäng av eventuellt kvarvarande timer-intervall från föregående fråga.
    // startTimer() clearklar normalt det gamla intervallet, men om spelaren
    // tryckte Next innan timer nådde 0 kan intervallet fortfarande vara aktivt.
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // Återställ scoring-latch + timerstämpel för nästa fråga.
    // questionStartMsRef sätts i startTimer() — om vi INTE nollställer här
    // ser AppState-lyssnaren den gamla stämpeln när DJ:n återvänder från
    // Spotify till en ny Spotify-fråga (ingen startTimer körs ännu) och
    // beräknar elapsed >> responseSeconds → timer hoppar till 0 direkt.
    hasRecordedScoreForCurrentQuestionRef.current = false;
    questionStartMsRef.current = 0;
    hostTimerStartAtRef.current = 0;
    spotifyTimerStartAtRef.current = 0;
    if (explicitNextIndex !== undefined) {
      setQuestionIndex(explicitNextIndex);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
    setSelectedYear(null);
    setConfirmedCorrect(null);
    setPendingYear(null);
    setConfirmedTimeUsed(null);
    // Reset image- + actor-select-state så nästa fråga (oavsett typ) startar rent.
    setPendingNameOption(null);
    setConfirmedNameOption(null);
    setPendingActorName(null);
    setConfirmedActorName(null);
    // Reset per-spelare-confirm-mappen så nästa frågas avatar-markörer
    // börjar från höger kant igen. hasLeft-flag:n påverkas inte.
    setPlayerConfirms({});
    // Båda lägen återgår till GetReady (intro-fasen) mellan frågor:
    // - Pass-the-Phone: telefonen lämnas över till nästa spelare;
    //   currentPlayerIndex roterar.
    // - Individual Devices: host kontrollerar speltempot — Play-tap i
    //   GetReady startar nästa fråga och broadcastar till non-host:s
    //   enheter. Ingen player-rotation (alla på egna devices).
    if (gameMode === 'pass-the-phone' && turnOrder.length > 0) {
      setCurrentPlayerIndex((prev) => (prev + 1) % turnOrder.length);
    }
    setPhase('intro');
  };
  // Håll ref alltid à jour med senaste versionen av handleAdvanceToNextRound.
  handleAdvanceToNextRoundRef.current = handleAdvanceToNextRound;

  // ── Spotify DJ-handlers ───────────────────────────────────────────────────
  /**
   * DJ:n trycker "Starta låten i Spotify".
   * Steg 1 (tvåstegs-flöde mot annons-timing-problem):
   *   Öppnar bara Spotify-appen via deep link. Sätter spotifyDJOpenedApp=true
   *   så DJ:ns vy byter till "Activate timer"-knapp. Inget broadcast, ingen
   *   timer — DJ bekräftar manuellt att låten (inte en annons) faktiskt spelas.
   */
  const handleStartSpotifyTrack = async () => {
    if (!currentSpotifyTrackId || spotifyDJOpenedApp) return;
    const ok = await openSpotifyTrack(currentSpotifyTrackId);
    if (ok) {
      setSpotifyDJOpenedApp(true);
      // Broadcast till gissarnas enheter så deras step-guide hoppar 0→1.
      if (gameMode === 'individual-devices' && syncChannelRef.current && currentDJPlayer) {
        syncChannelRef.current
          .broadcastSpotifyDJOpenedApp({ dj_player_id: currentDJPlayer.id })
          .catch(() => {});
      }
    }
  };

  // ── FUTURE VERSION 2 — Automated API Flow (archived handleSpotifyPlayPause) ──────
  // Fjärrstyrning av Spotify via Web API (PUT /me/player/pause + play).
  // Reaktiveras i V2 när remote play/pause-kontroll behövs.
  // const handleSpotifyPlayPause = () => {
  //   if (spotifyIsPlaying) {
  //     setSpotifyIsPlaying(false);
  //     pauseSpotifyPlayback().then((ok) => {
  //       if (ok) {
  //         setSpotifyPausePositionMs(getLastKnownSpotifyProgressMs() ?? 0);
  //         if (spotifyKeepAliveRef.current !== null) clearInterval(spotifyKeepAliveRef.current);
  //         spotifyKeepAliveRef.current = setInterval(() => { pauseSpotifyPlayback().catch(() => {}); }, 2500);
  //       } else {
  //         setSpotifyIsPlaying(true);
  //         if (currentSpotifyTrackIdRef.current) openSpotifyTrack(currentSpotifyTrackIdRef.current);
  //       }
  //     });
  //   } else {
  //     if (spotifyKeepAliveRef.current !== null) { clearInterval(spotifyKeepAliveRef.current); spotifyKeepAliveRef.current = null; }
  //     setSpotifyIsPlaying(true);
  //     const trackId = currentSpotifyTrackIdRef.current ?? undefined;
  //     resumeSpotifyPlayback(trackId, spotifyPausePositionMs).then((ok) => {
  //       if (!ok) setSpotifyIsPlaying(false);
  //     });
  //   }
  // };
  // ─────────────────────────────────────────────────────────────────────────────────

  const handleActivateTimer = () => {
    if (!currentSpotifyTrackId || spotifyDJStarted) return;
    setSpotifyDJStarted(true);
    // Avbryt eventuell timeout-fas (DJ aktiverade i tid).
    setSpotifyWaitPhase(null);
    // Beräkna exakt när timern startar (2000 ms delay till setTimerActive).
    // Används för synk på mottagarsidan OCH för non-host DJ:s egna enhet
    // (de tar aldrig emot sin egna broadcast via broadcast.self:false).
    const timerStartAt = Date.now() + 2000;
    // Spara stämpeln på aktiverarens egen enhet — driver heartbeat-
    // re-broadcasten nedan (DJ:n kan ha missat original-broadcasten om
    // Realtime-socketen dog medan appen låg i Spotify-bakgrunden).
    spotifyTimerStartAtRef.current = timerStartAt;
    if (phaseRef.current === 'question' || phaseRef.current === 'awaiting') {
      // Non-host DJ: uppdatera hostTimerStartAtRef lokalt så startTimer()
      // inte kompenserar för stale play_command-tid (~30 s tillbaka i tiden).
      if (!isHost) {
        hostTimerStartAtRef.current = timerStartAt;
      }
      setTimeout(() => setTimerActive(true), 2000);
    }
    if (gameMode === 'individual-devices' && syncChannelRef.current && currentDJPlayer) {
      syncChannelRef.current
        .broadcastSpotifyDJTrackStarted({
          dj_player_id: currentDJPlayer.id,
          spotify_track_id: currentSpotifyTrackId,
          timer_start_at: timerStartAt,
        })
        .catch(() => {});
    }
  };

  // ── Spotify timer-heartbeat (aktiverarens enhet) ─────────────────────────
  // DJ:n är i Spotify-appen när timern startas — iOS fryser JS och Realtime-
  // socketen kan dö i bakgrunden, så original-broadcasten av
  // spotify_dj_track_started kan missas HELT av DJ:ns enhet (Realtime
  // replayar inte missade meddelanden vid re-subscribe). Utan heal fastnar
  // DJ:n i question-fasen med still-stående timer → hela spelet blockas
  // eftersom DJ:n (ofta host) äger Next-knappen. Aktiveraren re-broadcastar
  // därför start-stämpeln var 5:e sekund tills frågan avancerar
  // (questionIndex-dep → cleanup). Mottagar-handlern är idempotent
  // (setSpotifyDJStarted(true) + samma ref-värden + timerActive-no-op) så
  // redan synkade enheter påverkas inte; en återvändande DJ healar inom
  // ~5 s via onSpotifyDJTrackStarted → elapsed-kompenserad startTimer
  // eller timeLeft=0 → reveal om tiden redan gått ut.
  useEffect(() => {
    if (gameMode !== 'individual-devices') return;
    if (!isSpotifyQuestion || !spotifyDJStarted || isCurrentPlayerDJ) return;
    if (!isTimerActivator) return;
    const id = setInterval(() => {
      if (spotifyTimerStartAtRef.current === 0) return;
      if (!currentSpotifyTrackId || !currentDJPlayer || !syncChannelRef.current) return;
      syncChannelRef.current
        .broadcastSpotifyDJTrackStarted({
          dj_player_id: currentDJPlayer.id,
          spotify_track_id: currentSpotifyTrackId,
          timer_start_at: spotifyTimerStartAtRef.current,
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [gameMode, isSpotifyQuestion, spotifyDJStarted, isCurrentPlayerDJ, isTimerActivator, questionIndex, currentSpotifyTrackId, currentDJPlayer]);

  // DJ:n överlämnar till host i reveal-fasen — låser upp host:s Next-knapp.
  const handleDJHandover = () => {
    setDjHandedOver(true);
    if (gameMode === 'individual-devices' && syncChannelRef.current && currentDJPlayer) {
      syncChannelRef.current
        .broadcastSpotifyDJHandover({ dj_player_id: currentDJPlayer.id })
        .catch(() => {});
    }
  };

  // Host hoppar över en Spotify-fråga (DJ startar ej, eller host väljer Skip).
  // Skickar alla spelare till GetReady-intro + nästa fråga i kön.
  const handleHostSkipSpotifyQuestion = () => {
    if (hasRecordedScoreForCurrentQuestionRef.current) return;
    hasRecordedScoreForCurrentQuestionRef.current = true;
    setSpotifyWaitPhase('skipped');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    // Broadcast till non-hosts i IndDev så även de går till nästa fråga.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastQuestionAdvance({
          next_question_index: questionIndex + 1,
          all_question_ids: gameQuestionsRef.current.map((q) => q.id),
          spotify_answer_year: spotifyAnswerYear,
          spotify_answer_name: spotifyAnswerName,
        })
        .catch(() => {});
    }
    setTimeout(() => { handleAdvanceToNextRoundRef.current?.(); }, 800);
  };

  // ── IndDev host-broadcast-wrappers ───────────────────────────────────────
  // Host:s Play-tap: 2 s dramatisk paus innan nedräkning startar.
  // Broadcast skickas efter samma fördröjning så host + non-host synkar.
  const handleHostStartFromGetReady = () => {
    // Beräkna exakt när non-host:s timer kommer att starta:
    // countdown: 700 ms initial paus + 5 × 1300 ms tick (5→4→3→2→1→0) +
    // 1000 ms "?"-display = 7200 ms. Plus timerActive-delay 2000 ms = 10200 ms.
    // +300 ms marginal för JS-timer-drift → 10500 ms.
    const timerStartAt = Date.now() + 10500;
    setPhase('countdown');
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayCommand({
          question_index: questionIndex,
          question_id: currentQ?.id ?? '',
          all_question_ids: gameQuestions.map((q) => q.id),
          timer_start_at: timerStartAt,
          spotify_answer_year: spotifyAnswerYear,
          spotify_answer_name: spotifyAnswerName,
          dj_player_id: currentDJPlayer?.id,
        })
        .catch(() => {});
    }
  };
  // Host:s Next-tap i reveal: trigga lokal handleAdvance + broadcast.
  // isLastQuestion-fallet broadcastar next_question_index=null så non-host
  // går till leaderboard, men host själv kör handleShowLeaderboard via
  // existing Next-tab-callback (denna funktion täcker bara non-last-fallet).
  const handleHostAdvanceFromReveal = () => {
    handleAdvanceToNextRound();
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastQuestionAdvance({
          next_question_index: questionIndex + 1,
          all_question_ids: gameQuestionsRef.current.map((q) => q.id),
          spotify_answer_year: spotifyAnswerYear,
          spotify_answer_name: spotifyAnswerName,
        })
        .catch(() => {});
    }
  };
  // Host:s Final Leaderboard-tap.
  const handleHostShowLeaderboard = () => {
    handleShowLeaderboard();
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastQuestionAdvance({
          next_question_index: null,
          all_question_ids: gameQuestionsRef.current.map((q) => q.id),
          spotify_answer_year: spotifyAnswerYear,
          spotify_answer_name: spotifyAnswerName,
        })
        .catch(() => {});
    }
  };
  // D-iv: host togglar audio för en spelare via GetReady-modalen.
  // Trippelt parallellt: optimistisk lokal state (UI uppdateras direkt),
  // Supabase-persist (cross-device durability) + broadcast (fast-path så
  // den drabbade spelarens device mute:as inom <100ms istället för att
  // vänta på Realtime-postgres-changes). Body:n är fire-and-forget; om
  // Supabase-write fail:ar fortsätter broadcast:en så lokal session inte
  // blockas av nätverks-glitch.
  const handlePlayerAudioChange = useCallback(
    (playerId: string, audioOn: boolean) => {
      setPlayerAudioOverridesState((prev) => ({ ...prev, [playerId]: audioOn }));
      if (params.roomCode) {
        setPlayerAudioOverride(params.roomCode, playerId, audioOn).catch(() => {});
      }
      if (gameMode === 'individual-devices' && syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAudioStateChanged({ player_id: playerId, audio_on: audioOn })
          .catch(() => {});
      }
    },
    [params.roomCode, gameMode],
  );

  // Spelaren togglar ljudet på SIN EGEN enhet via Audio-raden i GetReady:s
  // Game settings. Två lägen delar handler eftersom de delar premiss — en
  // spelare per enhet, ljudet ägs lokalt:
  //   remote 1v1  → session-lokalt state (ingen live-sync finns i läget).
  //   IndDev non-host → skrivs in i overrides-mappen på eget id, så
  //     isAudioMutedForSelf förblir enda källan till sanning.
  // Medvetet INGEN persist (lobby_settings är RLS-gated till host) och
  // INGEN broadcast — valet är device-local och angår ingen annan enhet.
  const handleSelfAudioChange = useCallback(
    (audioOn: boolean) => {
      if (gameMode === 'remote-1v1') {
        setRemoteAudioOn(audioOn);
        return;
      }
      if (!selfPlayerId) return;
      selfAudioTouchedRef.current = true;
      setPlayerAudioOverridesState((prev) => ({ ...prev, [selfPlayerId]: audioOn }));
    },
    [gameMode, selfPlayerId],
  );

  // D-v: host:s tap-signal. Anropas av onTouchStart-wrapper på alla
  // return-paths. Resetar host:s egen lastHostActivityRef + broadcastar
  // host_active_ping (throttlat till max 1/5s — fortsatta taps inom
  // fönstret skippar broadcast men resetar fortfarande egna ref:en så
  // host:s lokala countdown inte triggar oönskat).
  const signalHostActivity = useCallback(() => {
    if (gameMode !== 'individual-devices' || !isHost) return;
    const now = Date.now();
    lastHostActivityRef.current = now;
    if (now - lastPingEmittedRef.current < 5000) return;
    lastPingEmittedRef.current = now;
    syncChannelRef.current
      ?.broadcastHostActivePing({
        sender_id: selfPlayerId,
        // D-vi: bär questionIndex så non-host som missat broadcasts under
        // offline kan sync:a vid nästa mottagna ping (heal-on-reconnect).
        question_index: questionIndex,
        // Bär hela frågesekvensen så non-host som reloaded mid-game kan
        // sätta broadcastAllQuestionIds och se rätt GetReady-ikoner.
        all_question_ids: gameQuestionsRef.current.map((q) => q.id),
        // Belt-and-suspenders: non-host som missat play_command kan
        // catch-upa via fase-informationen i nästa ping.
        phase,
      })
      .catch(() => {});
  }, [gameMode, isHost, selfPlayerId, questionIndex, phase]);

  // D-v: shutdown vid 10 min host-inaktivitet. Host river rummet
  // (deactivateRoom + clear all stores) så stale data inte ärver in
  // i nästa session. Non-host hoppar över cleanup — det är host:s
  // ansvar; pg_cron tar hand om force-quit-fallet via 24h-expiry på
  // rooms-tabellen. Båda får samma Alert + Home-nav.
  const handleInactivityShutdown = useCallback(async () => {
    if (inactivityShutdownTriggeredRef.current) return;
    inactivityShutdownTriggeredRef.current = true;
    if (isHost && params.roomCode) {
      try {
        await deactivateRoom(params.roomCode);
      } catch {
        /* fortsätt även om cleanup fail:ar */
      }
      clearLeftPlayers(params.roomCode);
      clearLobbyPlayers(params.roomCode);
      clearLobbySettings(params.roomCode);
      clearEjected(params.roomCode);
      clearGameStarted(params.roomCode);
    }
    Alert.alert(
      'Game ended',
      'Game ended due to host inactivity.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [isHost, params.roomCode]);

  // D-v: 1-sek interval som driver banner-countdown + shutdown-trigger.
  // Värdet räknas alltid från lastHostActivityRef (host-egen aktivitet
  // eller mottagen ping) så host + non-host konvergerar på samma
  // shutdown-tid utan att behöva broadcasta nedräkningen i sig.
  // Trigger-trösklar: 59 min = banner startar; 60 min = shutdown
  // (= 60-sek-countdown). Total tolerans = 1 timme utan host-aktivitet.
  useEffect(() => {
    if (gameMode !== 'individual-devices') return;
    const INACTIVITY_BANNER_MS = 59 * 60 * 1000;
    const INACTIVITY_SHUTDOWN_MS = 60 * 60 * 1000;
    const interval = setInterval(() => {
      const gap = Date.now() - lastHostActivityRef.current;
      if (gap >= INACTIVITY_SHUTDOWN_MS) {
        handleInactivityShutdown();
      } else if (gap >= INACTIVITY_BANNER_MS) {
        const remaining = Math.max(
          0,
          Math.ceil((INACTIVITY_SHUTDOWN_MS - gap) / 1000),
        );
        setInactivityCountdownSec(remaining);
      } else {
        setInactivityCountdownSec((prev) => (prev === null ? prev : null));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameMode, handleInactivityShutdown]);

  // ── Broadcast-listener-refs ──────────────────────────────────────────────
  // Skriv färska handlers in i refs varje render så subscription-callback:n
  // (etablerad en gång på mount) alltid kallar latest logic. Non-host kör
  // samma transition-funktioner som host (lokalt) — de är idempotenta.
  useEffect(() => {
    playCommandHandlerRef.current = (qIdx, qId, allIds, timerStartAt) => {
      // D-iii sticky-gate: om spelaren är låst i unstable-overlay (sticky
      // ELLER live-unstable) → IGNORERA play_command. Spelaren kvarstår i
      // sin nuvarande fas + overlay tills de explicit tappar Retry. Detta
      // är central design-regel: B kan inte hoppa in i ny fråga utan att
      // ha bekräftat sig som "tillbaka" via Retry → broadcast player_rejoined.
      // questionIndex hålls synkad via question_advance (som processas
      // oavsett sticky), så när B sedan retry:ar är de redo för nästa
      // play_command direkt.
      if (stickyUnstableForQuestion || isConnectionUnstable) {
        return;
      }
      // New-question-heal (fix 2026-07-27): en play_command för en ANNAN
      // fråga än den lokala betyder att question_advance missades (frozen
      // JS vid låst skärm / droppad Realtime-broadcast — replayas aldrig).
      // Enheten står då kvar i FÖRRA frågans fas (awaiting/reveal) medan
      // index/question-id/dj-id healas nedan → utan fas-heal renderas nya
      // frågans data i gammal fas (symptom: DJ-kortet "You are the DJ"
      // utan "Start track in Spotify"-knapp — scroll-zonens DJ-CTA kräver
      // phase='question'). Vid isNewQuestion kör vi samma per-frågas-reset
      // som handleAdvanceToNextRound skulle ha gjort + tvingar fas-maskinen
      // in i countdown längst ned.
      const isNewQuestion = questionIndexRef.current !== qIdx;
      if (isNewQuestion && phaseRef.current !== 'intro') {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        hasRecordedScoreForCurrentQuestionRef.current = false;
        questionStartMsRef.current = 0;
        spotifyTimerStartAtRef.current = 0;
        setPlayerConfirms({});
      }
      // Sync questionIndex från broadcast — kritiskt för reconnect-fallet:
      // om B var offline under host:s tidigare question_advance kan B:s
      // lokala questionIndex vara stale (peka på en gammal fråga). Host:s
      // play_command bär canonical question_index → vi alignar B direkt.
      // setQuestionIndex är idempotent när qIdx === questionIndex, så
      // normalfallet (B var online och redan synkad) är no-op.
      setQuestionIndex(qIdx);
      // IndDev-frågefixering: spara host:s question_id så non-host renderar
      // exakt samma fråga oavsett lokal shuffle-ordning.
      setBroadcastQuestionId(qId ?? null);
      // Spara host:s kompletta fråge-sekvens för korrekt GetReady-kö-ikoner.
      if (allIds && allIds.length > 0) setBroadcastAllQuestionIds(allIds);
      // Spara host:s timer-starttid för iOS-bakgrunds-återsynk. Non-host som
      // vaknar upp från bakgrunden under countdown/question-fasen beräknar
      // korrekt återstående tid via hostTimerStartAtRef. Resetas av
      // questionIndex-effekten vid nästa fråga.
      if (!isHost && timerStartAt) {
        hostTimerStartAtRef.current = timerStartAt;
      }
      // Reset answer-state så B inte ärver pending-svar från förra fråga
      // (kan finnas kvar om B retry:ade i sticky-låst tillstånd och inte
      // nådde nästa rondens normalt-rensa-path via handleAdvanceToNextRound).
      //
      // GATED på phase='intro' (2026-07-03) — speglar setPhase-guarden nedan.
      // En sen/re-broadcastad play_command (t.ex. rejoin-heal:ens 500ms-
      // re-broadcast när någon enhets nätverk flappar mid-fråga) som anländer
      // i question/awaiting/reveal får ALDRIG wipe:a ett redan bekräftat
      // svar. Utan guarden raderades confirmedNameOption efter Confirm på
      // Spotify/Name-frågor → reveal:en renderade som time-out (ingen
      // gold-ram runt bekräftade raden). Samma wipe låg bakom det tidigare
      // selectedYear-symptomet som confirmedCorrect-statet workaround:ade.
      // Retry-fallet som resetten skyddar mot täcks fortsatt:
      // handleRetryFromUnstable sätter phase='intro' innan nästa
      // play_command tas emot, så resetten fyrar där den ska.
      // isNewQuestion-fallet (2026-07-27) resettar också: det bekräftade
      // svaret tillhör FÖRRA frågan vars score redan är registrerad —
      // 2026-07-03-skyddet (samma-frågas sena re-broadcast wipe:ar inte)
      // bevaras eftersom isNewQuestion då är false.
      if (phaseRef.current === 'intro' || isNewQuestion) {
        setPendingYear(null);
        setSelectedYear(null);
        setConfirmedCorrect(null);
        setPendingNameOption(null);
        setConfirmedNameOption(null);
        setPendingActorName(null);
        setConfirmedActorName(null);
        setConfirmedTimeUsed(null);
      }
      // Defensiv: från intro-phase tillåts countdown-transition (normal-
      // flödet). isNewQuestion (2026-07-27) tvingar dessutom transition
      // från stale awaiting/reveal när enheten missat question_advance —
      // late-arriving re-broadcasts för SAMMA fråga blockeras fortsatt.
      setPhase((current) => (current === 'intro' || isNewQuestion ? 'countdown' : current));
    };
    questionAdvanceHandlerRef.current = (payload) => {
      const {
        next_question_index: nextIdx,
        all_question_ids: allIds,
        spotify_answer_year: say,
        spotify_answer_name: san,
      } = payload;
      // Uppdatera auktoritativ frågesekvens om host skickade med den.
      if (allIds && allIds.length > 0) setBroadcastAllQuestionIds(allIds);
      if (say !== undefined) setBroadcastHostSpotifyAnswerYear(say);
      if (san !== undefined) setBroadcastHostSpotifyAnswerName(san);
      if (nextIdx === null) {
        handleShowLeaderboard();
      } else {
        // Passa canonical-indexet från broadcast så B alignar även när
        // tidigare advances missats (offline-fönster). Utan denna sync
        // skulle dot-bar:ens currentQuestion-räknare stanna kvar bakom
        // host i en eller flera frågor.
        handleAdvanceToNextRound(nextIdx);
      }
    };
    // Mottagare av player_left: alla klienter (inkl. host) markerar
    // spelaren som hasLeft. Host visar dessutom en Alert-popup. Spelaren
    // själv har redan navigerat till '/' innan broadcast skickas, så de
    // ser aldrig sin egen "Has left"-rad.
    playerLeftHandlerRef.current = (playerId, playerName) => {
      setLeftPlayerIds((prev) => {
        if (prev.has(playerId)) return prev;
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      if (isHost) {
        Alert.alert(`${playerName} has left`, undefined, [{ text: 'OK' }]);
      }
    };
    // Mottagare av player_answer_confirmed: uppdatera per-spelare-confirm-
    // mappen så timer-bar:ens avatar-markörer fryses vid sin position på
    // alla devices. Self-confirms hanteras lokalt i handleConfirm; denna
    // listener fyrar bara för andra spelares confirms.
    playerAnswerConfirmedHandlerRef.current = (playerId, timeUsed) => {
      setPlayerConfirms((prev) => {
        if (prev[playerId] !== undefined) return prev;
        return { ...prev, [playerId]: timeUsed };
      });
    };
    // Mottagare av response_seconds_changed: host ändrade Answer response
    // time i GetReady mellan ronder. Non-host:s read-only-display + timer-
    // budgeten nästa fråga uppdateras till host:s nya värde.
    responseSecondsChangedHandlerRef.current = (seconds) => {
      setResponseSeconds(seconds);
    };
    // Mottagare av player_score_recorded: en annan IndDev-spelare har
    // svarat. Lägg in deras RoundScore i lokal allRoundScoresHistory
    // så liveLeaderboard + final leaderboard visar komplett bild.
    playerScoreRecordedHandlerRef.current = (payload) => {
      // Ignorera egna scores (broadcast.self: false garanterar detta, men
      // defensiv guard mot edge-case om selfPlayerId ändrar sig).
      if (payload.player_id === selfPlayerId) return;
      // Deduplication: samma spelare + samma frågeindex = samma broadcast.
      const key = `${payload.player_id}_${payload.question_index}`;
      if (receivedRemoteScoreKeysRef.current.has(key)) return;
      receivedRemoteScoreKeysRef.current.add(key);
      setAllRoundScoresHistory((prev) => [
        ...prev,
        [{
          playerId: payload.player_id,
          points: payload.points,
          correct: payload.correct,
          timeUsed: payload.time_used,
          // Bevaras (användes tidigare bara till dedup-nyckeln ovan) så
          // match highlights kan joina peer-svar mot rätt fråga. Posten
          // appendas i ankomstordning, så detta är ENDA kopplingen till
          // vilken fråga svaret gällde.
          questionIndex: payload.question_index,
        }],
      ]);
    };
  });

  // Spara det avslutade spelet till AsyncStorage (görs när final leaderboard visas).
  // Player history (i Fas 5) kan sedan hämta denna data.
  const saveFinalGame = async () => {
    // TODO (Fas 6): beräkna riktig HCP-förändring från totalPoints + assistance + ålder
    const hcpBefore = 99;
    const hcpDelta = Math.round(totalPoints / 500); // tillfällig: 1 HCP-poäng per 500 pts
    const hcpAfter = Math.max(1, hcpBefore - hcpDelta);

    const result: GameResult = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString(),
      totalPoints,
      rounds,
      assistance: fallbackAssistance,
      hcpBefore,
      hcpAfter,
    };

    try {
      await saveLatestResult(result);
    } catch {
      // Om sparning misslyckas – leaderboarden visas ändå
    }

    // Append:a HistoryEntry till Player history-listan med game-time-
    // settings frozna (age, assistance, era). Age beräknas från
    // profilen:s birthYear vid speltillfället. assistance/era läses
    // från quiz-state vid kall-tiden (= värden som faktiskt användes
    // i spelet). Tom rounds-array (shouldn't happen men defensiv) →
    // skippa append:n så vi inte spammar 0/NaN-entries.
    // Guest-hostade spel skrivs ALDRIG till Player history — även när en
    // inloggad user spelat som guest (guest-spel är anonyma per design).
    // saveLatestResult ovan behålls (bara använd direkt efter spelet).
    // Remote 1v1 skrivs INTE heller hit — server-tabellerna (remote_matches)
    // är remote-historikkällan (visas i "1vs1 Duels"-blocket i Player
    // History); en AsyncStorage-append hade dubbelräknat spelet.
    if (rounds.length > 0 && !isGuestHostGame && !isRemote) {
      const totalTime = rounds.reduce((sum, r) => sum + (r.timeUsed ?? 0), 0);
      const correctAnswers = rounds.filter((r) => r.correct).length;
      const profile = await loadProfile();
      const birthYear = profile?.birthYear;
      const age =
        typeof birthYear === 'number'
          ? new Date().getFullYear() - birthYear
          : 0;
      const entry: HistoryEntry = {
        id: result.id,
        date: result.date,
        correctAnswers,
        totalQuestions: rounds.length,
        avgResponseSeconds: totalTime / rounds.length,
        age,
        assistance: fallbackAssistance,
        eraFrom,
        eraTo,
        selectedExtraPackages,
        youtubeEnabled,
        imagesEnabled,
      };
      try {
        await appendGameHistoryEntry(entry);
      } catch {
        // Profile history kan visa stale-state utan denna append — inget
        // som ska blockera leaderboard-rendering.
      }
    }
  };

  // Kör när sista rundans leaderboard visas: beräkna HCP-förändringar + spara spel
  useEffect(() => {
    if (phase === 'leaderboard' && isLastQuestion) {
      // Beräkna HCP-förändring för alla spelare.
      // Formel (placeholder till Fas 6): delta = round(totalPoints / 500)
      const changes: Record<string, HcpChange> = {};

      // Iterera över alla gamePlayers (turnOrder i pass-the-phone, mocks
      // vid direkt-nav). gameTotals har redan per-id summorna från history.
      gamePlayers.forEach((p) => {
        const total = gameTotals[p.id] ?? 0;
        const delta = Math.round(total / 500);
        const before = p.isHost ? 99 : MOCK_OPPONENT_HCP_BEFORE[p.id] ?? 99;
        changes[p.id] = { before, after: Math.max(1, before - delta) };
      });

      setPlayerHcpChanges(changes);
      saveFinalGame();
      // Remote 1v1: finalisera egen spelarrad server-side. Sista finishern
      // triggar atomisk vinnarberäkning i RPC:n (radlås — ingen klient-race).
      // Idempotent: redan avgjord match (walkover-sweep) → no-op.
      if (isRemote && remoteMatchId) {
        const flat = allRoundScoresHistory.flat();
        const totalPts = flat.reduce((sum, s) => sum + s.points, 0);
        const correctCount = flat.filter((s) => s.correct).length;
        const avg =
          flat.length > 0
            ? Math.round((flat.reduce((sum, s) => sum + s.timeUsed, 0) / flat.length) * 1000) / 1000
            : null;
        void finalizePlayer(remoteMatchId, {
          totalPoints: totalPts,
          correctAnswers: correctCount,
          avgResponseSeconds: avg,
        });
      }
      track('game_completed', {
        assistance: fallbackAssistance,
        total_points: totalPoints,
        rounds_played: rounds.length,
        guest_host: isGuestHostGame,
        remote_1v1: isRemote,
      });
    }
  }, [phase, isLastQuestion]);

  // Sista rundans actions: starta nytt rum i Lobby (ev. med samma spelare) eller gå hem.
  // `keepSettings` styr om per-spelare-settings (age/assistance) bärs över från
  // detta spel — settings kan ha redigerats av host i Lobby:n. När false:
  // - Host (you): behåller egen profil-baserad age/assistance (kommer från params).
  // - Övriga registrerade: defaults till standard/30 så Lobby:s profile-merge
  //   senare kan fylla i deras profil-värden vid mount.
  // - Guests: defaults till standard/30 så host får redigera om i Lobby.
  const goToNewLobby = async (
    reusePlayers: boolean,
    keepSettings: boolean = true,
    guestOverride?: { guestName: string; guestBirthYear: number },
  ) => {
    // `guestOverride` (credit-gate:ns "Restart as Guest"): tvingar NYA
    // lobbyn till guest-host-läge även när DETTA spel hostades av en
    // registrerad user. Spelarna bärs över som vanligt — bara värd-
    // identiteten byts till den auto-genererade Guest-identiteten så
    // spelet blir gratis (inga credits) och ingen Game History skrivs.
    const asGuestHost = isGuestHostGame || guestOverride != null;
    // ── AUKTORITATIV credit-gate ────────────────────────────────────────
    // Sista kollen INNAN rummet registreras. Anropar:na har egna
    // fail-fast-gates (Start New Game-tappet, dormanta handlePlayAgain),
    // men de körs FÖRE Alert-stegen/approval-väntan — och en enda missad
    // eller stale-läst väg gav en lobby host inte kan starta något spel i
    // ("Out of Host Game Credits" först vid Start Game). Alla lokala
    // lobby-skapanden från Final Leaderboard passerar HÄR, så gaten sitter
    // rätt: blockeras den skapas inget rum och ingen navigation sker.
    //
    // `asGuestHost` (inte isGuestHostGame): den NYA lobbyns värdskap är det
    // som avgör om credits behövs — så credit-gatens egen "Restart as
    // Guest"-utväg (guestOverride) släpps igenom utan att loopa tillbaka
    // in i samma Alert.
    if (!asGuestHost && !(await ensureHostCreditsForNewGame())) return;
    // Ladda host-profilen FÖRE players-listan byggs så host:s riktiga
    // playerName + avatar bär in i carry-over (annars hade host:s rad i
    // nya lobby:n stått som 'You'/🎮 tills mergeProfileIntoHost hann fyra).
    // Guest host: skippa profilen HELT — replay-lobbyn ska bära guest-
    // identiteten (guestName/👤) även om en profil råkar finnas på enheten.
    const profile = asGuestHost ? null : await loadProfile();
    const hostName = guestOverride
      ? guestOverride.guestName
      : isGuestHostGame
        ? (params.guestName?.trim() || turnOrder[0]?.name || 'Guest')
        : profile?.playerName?.trim() || 'You';
    const hostEmoji = asGuestHost
      ? '👤'
      : profile
        ? getAvatarEmojiById(profile.selectedAvatarId)
        : '🎮';
    // Bygg carry-over-listan UTANFÖR if/else så vi kan referera den senare
    // för att skriva direkt till lobby_players-tabellen (innan broadcast)
    // — annars hinner inte host:s LobbyScreen mounta + skriva via useEffect
    // innan non-host:s LobbyScreen:s `getLobbyPlayers` läser för att hitta
    // ev. pre-seeded matchande rad → race ger duplicate-row.
    let carryOverPlayers: LobbyPlayer[];
    if (reusePlayers) {
      // Behåll alla spelare från detta spel. ALLA carry-over-spelare
      // (friends eller ej) auto-approvas i nya lobbyn — de var redan
      // godkända i spelet som just avslutades, så ingen re-approval
      // behövs (Peter-beslut 2026-08-06). LobbyScreen:s code-only-join
      // matchar med approved=true på carry-over-branchen så joiner:s
      // egen upsert inte clobbar.
      carryOverPlayers = allPlayers.map((p) => {
        const turnEntry = turnOrder.find((t) => t.id === p.id);
        // type carry:as från turnOrder (LobbyScreen skickar med den sedan
        // 2026-07-04). Host-raden i guest-hostade spel FORCERAS 'guest' —
        // det är non-host-enheternas detekteringssignal (storedHostIsGuest
        // nycklar på host-radens type) för att dölja Play Again i replayn.
        // Fallback 'registered' bevarar tidigare beteende för gamla payloads.
        const carriedType: 'registered' | 'guest' =
          asGuestHost && p.isHost ? 'guest' : turnEntry?.type ?? 'registered';
        return {
          id: p.id,
          name: p.isYou ? hostName : p.name,
          emoji: p.isYou ? hostEmoji : p.emoji,
          isReady: true,
          type: carriedType,
          age: keepSettings || p.isYou ? p.age : 30,
          // Guest host väljer assistance fritt sedan 2026-08-08 (var låst
          // till Full i LobbyScreen:s guest-host player-edit och forcerades
          // därför här) — nivån bärs numera över som för alla andra.
          assistance: keepSettings || p.isYou ? p.assistance : 'standard',
          hcpComplete: true,
          isHost: p.isHost ?? false,
          approved: true,
          spotifyConnected: turnEntry?.spotifyConnected ?? false,
        };
      });
      await savePendingLobbyPlayers(carryOverPlayers);
    } else {
      // Tom lobby förutom host. **KRITISKT**: host:s id MÅSTE vara `'1'`
      // (= SEED_PLAYERS[0].id i LobbyScreen) eftersom LobbyScreen:s mount-
      // sekvens först sätter `players = [SEED_PLAYERS[0]]` (id='1') och
      // useEffect på `[players]` skriver den raden till lobby_players-
      // tabellen INNAN consumePendingLobbyPlayers() hinner ersätta state
      // med carry-over:n. Om carry-over:s host-id skiljer sig (t.ex. 'you')
      // skapar consumePendingLobbyPlayers + nästa useEffect-write en ANDRA
      // host-rad i DB:n — setLobbyPlayers UPSERT:ar utan att DELETE:a stale
      // rader, så Alex K-raden (id='1') överlever och visas för non-host
      // som en tredje (fantom) spelare i leaderboard + timeline-banner
      // under quiz. Genom att matcha id='1' träffar carry-over-skrivningen
      // SAMMA DB-rad → bara name/emoji uppdateras, ingen extra host-rad.
      carryOverPlayers = [{
        id: '1',
        name: hostName,
        emoji: hostEmoji,
        isReady: true,
        // Guest host: type 'guest' även på fresh-raden (detekteringssignal).
        type: asGuestHost ? 'guest' : 'registered',
        age,
        // fallbackAssistance = quiz-paramets assistance, som för guest host
        // speglar host-kortets valda nivå (LobbyScreen skickar den sedan
        // 2026-08-08; tidigare hårdkodad 'full' i båda ändar).
        assistance: fallbackAssistance,
        hcpComplete: true,
        isHost: true,
      }];
      await savePendingLobbyPlayers(carryOverPlayers);
    }
    const newCode = generateRoomCode();
    // Registrera nya koden som aktivt rum + lagra host:s metadata (samma
    // princip som handleCreateGame på Home-skärmen). currentPlayerCount
    // räknas från carry-over-listan vid reusePlayers=true; annars startar
    // den på 1 (bara host i nya lobbyn). LobbyScreen:s sync-effekter
    // korrigerar countet om SEED_PLAYERS injiceras eller spelare flyttas.
    // TODO (subscription): byt hardcoded `false` mot riktig profile.isPremium.
    const initialCount = reusePlayers ? Math.max(1, allPlayers.length) : 1;
    // Returvärdet MÅSTE kontrolleras — en tyst no-op ger en fantom-lobby
    // som joiners inte hittar ("Room not found"-buggen 2026-08-07).
    const roomRegistered = await registerActiveRoom(newCode, {
      // Guest host är alltid Free-nivå: max 4, ingen premium; hostPlayerName
      // = guest-namnet så own-lobby-detekteringen fungerar för replayn.
      maxPlayers: asGuestHost ? 4 : profile?.maxPlayers ?? 4,
      hostIsPremium: false,
      currentPlayerCount: initialCount,
      hostPlayerName: asGuestHost ? hostName : profile?.playerName ?? '',
      gameStarted: false,
      // Remote 1vs1 har ingen Play Again (final-footern kör guest-flödets
      // "bara Home" via guestHost={isRemote}), så goToNewLobby nås aldrig
      // från en remote-match — den nya lobbyn är alltid standard.
      isRemote1v1: false,
    });
    if (!roomRegistered) {
      Alert.alert(
        'Could not create game lobby',
        'The new room could not be registered. Check your connection and try again.',
      );
      return;
    }
    // Färsk leftPlayers-store + lobbyPlayers-store + ejected-store för nya
    // koden — undviker stale test-data och garanterar att non-host:s polling
    // startar tomt utan eject-status från en tidigare session.
    // VIKTIGT: clearLobbyPlayers MÅSTE awaitas innan setLobbyPlayers nedan.
    // Utan await kan DELETE:n resolva EFTER att UPSERT:en committed och då
    // rensa de nyskapade raderna — non-host hittar då 0 rader i DB.
    // (För ett nytt kod är DELETE en no-op men latens gör att den kan
    // landa sent och träffa UPSERT:ens rader om de skrevs snabbare.)
    clearLeftPlayers(newCode);
    await clearLobbyPlayers(newCode);
    await clearLobbySettings(newCode);
    clearEjected(newCode);
    clearGameStarted(newCode);
    // KRITISKT race-fix: skriv carry-over-listan DIREKT till lobby_players
    // (innan broadcastPlayAgainLobbyReady nedan). Annars hinner inte host:s
    // LobbyScreen mounta + skriva via useEffect innan non-host:s LobbyScreen
    // ankommer och läser `getLobbyPlayers` för dup-detection — non-host
    // skulle då inte hitta sin pre-seeded rad och skapa ett nytt joiner-id,
    // vilket resulterar i två rader med samma playerName.
    if (reusePlayers && params.roomCode && carryOverPlayers.length > 0) {
      // Re-mappa id:t med rumkoden i prefixet så lobby_players-rader inte
      // krockar med det gamla rummet (vi behåller bara namn/age/assistance/
      // approved-data; id:t är rumspecifikt). Faktiskt — vi vill BEHÅLLA
      // id:t exakt så non-host:s ownPlayerId från quiz-sessionen mappar
      // direkt till sin rad i nya rummet via dup-detection-fixet.
      await setLobbyPlayers(newCode, carryOverPlayers).catch((err) => {
        // Loggas explicit — tyst fail här ger att non-host:s syncFromStore
        // returnerar undefined från getLobbyPlayers och felaktigt triggar
        // "started without me"-popup när host sedan startar spelet.
        // Vanligaste orsaken: migration 0015 (spotify_verified-kolumn)
        // inte applicerad i Supabase → upsert kraschar på okänd kolumn.
        console.warn('[goToNewLobby] setLobbyPlayers carry-over failed:', err);
      });
    }
    // Carry-over av game-settings när host valt "Yes, keep them" + "Keep
    // settings". Läser föregående rums lobby_settings-rad och upsert:ar
    // den på nya rumkoden — bevarar gameMode (PtP/IndDev),
    // singlePlayerDefault (= single-player-läget), roundsCount, eraFrom,
    // eraTo, region, samt media-toggles. answerResponseSeconds override:as
    // med host:s AKTUELLA quiz-state (kan ha justerats mid-game via
    // GetReadyIntro:s dropdown). Vid keepSettings=false (Start fresh)
    // lämnar vi nya rummet utan settings-rad så LobbyScreen:s host-seed
    // -effekt fyller den från profilens host-defaults.
    if (keepSettings && params.roomCode) {
      const oldSettings = await getLobbySettings(params.roomCode);
      if (oldSettings) {
        await setLobbySettings(newCode, {
          ...oldSettings,
          answerResponseSeconds: responseSeconds,
        }).catch(() => {
          // Tyst — om upsert fail:ar fall:er nya lobbyn bara tillbaka till
          // host-profil-defaults, vilket är OK degradation istället för att
          // blockera Play Again-flödet.
        });
      }
    }
    // Broadcasta nya rumkoden till non-host:s syncChannel INNAN navigation —
    // när host:s component unmountar rivs sync:n så non-host slutar lyssna.
    // Non-host:s leaderboard har själv en aktiv syncChannel som tar emot
    // detta event och routar dem till nya lobbyn (förutsatt att de tappat
    // Approve Play Again). Fire-and-forget; om send fail:ar (rara race)
    // hänger non-host kvar på lock-overlay tills timeout/manual exit, men
    // host:s egna nav-flow får aldrig blockas.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      // auto_join när spelarna carry:as över: deras pre-seedade rader finns
      // redan i nya lobbyn så non-hosts ska följa med direkt även om de
      // inte hunnit tappa Approve. Kritiskt för credit-gate:ns "Restart as
      // Guest" som bypassar approval-modalen helt — utan flaggan hade alla
      // non-hosts fått "Host has already started a new Game"-popupen → Home
      // trots att host ser dem i nya lobbyn. I den normala "Yes, keep
      // them"-vägen är flaggan en no-op (alla har redan Approve-tappat).
      await syncChannelRef.current
        .broadcastPlayAgainLobbyReady({
          room_code: newCode,
          auto_join: reusePlayers ? true : undefined,
        })
        .catch(() => {});
    }
    if (asGuestHost) {
      // Replay-lobbyn förblir guest-hostad: guest-identiteten + räknaren
      // (+1) följer med så nästa Final Leaderboard visar bara Home.
      // guestBirthYear-fallback: härled från host-kortets age om paramet
      // saknas (äldre payloads) — LobbyScreen kräver värdet för host-kortet.
      // Restart as Guest (guestOverride): birth year kommer från profilen
      // och räknaren startar på 0 — detta ÄR guest-spelets första omgång,
      // så guest-hosten får därefter max 1 Play Again precis som Home:s
      // "Start Game as Guest"-flöde.
      const birthYearParam = guestOverride
        ? String(guestOverride.guestBirthYear)
        : params.guestBirthYear?.trim() ||
          String(new Date().getFullYear() - (turnOrder[0]?.age ?? 30));
      router.replace({
        pathname: '/lobby',
        params: {
          code: newCode,
          isHost: 'true',
          guestHost: 'true',
          guestName: hostName,
          guestBirthYear: birthYearParam,
          // Guest host:s assistance-nivå följer med så host-kortets seed i
          // nya lobbyn matchar carry-over-raden (som annars vinner via
          // consumePendingLobbyPlayers).
          guestAssistance:
            carryOverPlayers.find((p) => p.isHost)?.assistance ?? 'full',
          guestReplays: guestOverride ? '0' : String(guestReplaysUsed + 1),
        },
      });
      return;
    }
    router.replace(`/lobby?code=${newCode}&isHost=true`);
  };

  // Sekventiell Alert-flow: först fråga om spelarna ska följa med, sedan
  // (om ja) en uppföljning om per-spelare-settings ska bevaras eftersom de
  // kan ha redigerats av host under spelet/i Lobby:n. iOS Alert har max 3
  // knappar utan radbryt — därav två steg istället för 4-vägs-prompt.
  //
  // `withCancel`-flaggan inkluderar en extra Cancel-knapp (3 totalt).
  // Används av single-player-Play-Again-flödet där "Re-use all players?"-
  // alerten skippas helt och denna popup blir det enda Play Again-steget
  // — host måste då ha en utväg utan att tvingas välja Reset eller Keep.
  // Vid multi-player anrop:as den utan flagga (= 2 knappar) eftersom den
  // föregående "Yes, keep them"-tap:en redan motsvarade en Cancel-möjlighet.
  const askKeepSettingsThenGo = (withCancel = false) => {
    // Title växlar beroende på single-player (withCancel=true) vs multi-
    // player: single-player har bara en spelare = host så "per player"-
    // formuleringen är missvisande; använd "for lobby" istället för att
    // signalera att det är lobby-wide settings som diskuteras.
    const title = withCancel
      ? 'Keep same setting for lobby'
      : 'Keep same settings per player?';
    Alert.alert(
      title,
      'Settings (assistance level + age) may have been edited during this game. Keep them or reset to defaults?',
      withCancel
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', onPress: () => goToNewLobby(true, false) },
            { text: 'Keep settings', onPress: () => goToNewLobby(true, true) },
          ]
        : [
            { text: 'Reset', onPress: () => goToNewLobby(true, false) },
            { text: 'Keep settings', onPress: () => goToNewLobby(true, true) },
          ],
    );
  };

  // Credit-gate-utvägen "Restart as Guest": kör hela Play Again-carry-over-
  // maskineriet (goToNewLobby med reusePlayers=true) men med guestOverride
  // så NYA lobbyn blir guest-hostad. Alla spelare från detta spel följer
  // med (non-hosts hamnar i "To be approved" som vanligt); värd-identiteten
  // byts till en auto-genererad Guest-identitet — inga credits dras och
  // ingen Game History skrivs. Enda skillnaden mot user-hostad Play Again:
  // guest host får max 1 replay (guestReplays-räknaren startar på 0 här).
  const restartAsGuestHost = async (profile: ProfileData | null) => {
    // Guest-identitet: auto-genererat GuestX-1234567-namn (samma format som
    // Home:s guest-host-form auto-fyller). Birth year tas från profilen så
    // age-baserad content-filtrering förblir rimlig; fallback 30 år.
    const guestHostName = generatePlayerName(new Set(), { prefix: 'Guest' });
    const guestBirthYear =
      profile?.birthYear ?? new Date().getFullYear() - 30;
    track('guest_name_created', { autofilled: true, assistance: 'full' });
    track('room_code_created', { guestHost: true, fromCreditGate: true });
    // keepSettings=true: guest-seed:en i LobbyScreen klampar ändå till de
    // guest-låsta värdena (full era/rounds {2,4}) och tar bara de
    // guest-VARIABLA fälten (gameMode, singlePlayerDefault, roundsCount,
    // spotifyEnabled, answerResponseSeconds) från carry-over:n. goToNewLobby:s IndDev-broadcast
    // (play_again_lobby_ready) routar non-hosts som tappat Approve direkt
    // till nya lobbyn; övriga får "Host has already started a new Game"-
    // popupen → Home och kan joina igen via nya koden (dup-detection
    // matchar deras pre-seedade rad).
    await goToNewLobby(true, true, {
      guestName: guestHostName,
      guestBirthYear,
    });
  };

  // Host Game Credits-gate för alla "starta nytt spel"-vägar från Final
  // Leaderboard (Play Again + lokala re-match-flödets "Start New Game").
  // Returnerar true när host får fortsätta. loadProfile() refreshar Free-
  // saldot vid första load efter midnatt CET så vi jämför mot aktuellt
  // värde. Guest host: gaten skippas HELT — guest-spel förbrukar aldrig
  // credits, och en inloggad user som spelar som guest ska varken blockeras
  // av eller belasta sitt eget saldo.
  const ensureHostCreditsForNewGame = async (): Promise<boolean> => {
    if (isGuestHostGame) return true;
    const [freshProfile, hasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    // Membership = obegränsade host-spel; ingen gate. Lobby:s handleStartGame
    // skippar också deduktionen så Free-saldot förblir orört.
    if (hasPremium) return true;
    if ((freshProfile?.freeGameCredits ?? 0) > 0) return true;
    // Tre-vägs-popup (iOS Alert max 3 knappar):
    // 1. Purchase subscription → Store (unlimited host games + Game
    //    History fortsätter sparas på profilen).
    // 2. Restart as Guest → guest-hostad lobby med ALLA spelare
    //    carry:ade från detta spel; gratis men ingen Game History
    //    skrivs och max 1 replay därefter.
    // 3. Exit → stäng popupen, stanna på Final Leaderboard (Home-
    //    knappen finns kvar där som utväg).
    Alert.alert(
      'Out of Host Game Credits',
      'You have used your free host games for today. Add unlimited Host games and keep storing Game History on your profile with QuizVibe Premium — or restart as Guest (no Game History stored).',
      [
        // Pushar Store UTAN `from=...`-paramet så Store:s Back-knapp fall:er
        // till `router.back()` istället för `router.replace(from)`. Det
        // bevarar /quiz på root Stack:en med Final Leaderboard-state intakt
        // — annars hade replace:n unmountat Quiz-komponenten och spelaren
        // skulle landa på en tom /quiz-vy efter köpet.
        {
          text: 'Purchase subscription',
          onPress: () => router.push('/store?focus=subscription'),
        },
        {
          text: 'Restart as Guest',
          onPress: () => restartAsGuestHost(freshProfile),
        },
        { text: 'Exit', style: 'cancel' },
      ],
    );
    return false;
  };

  // ⚠ DORMANT sedan 2026-08-08: host:s Play Again-knapp är borta ur ALLA
  // slutskärmar (lokalt spel + guest-hostat kör "Start New Game"-flödet,
  // remote har aldrig haft Play Again), så den här handlern — och
  // `playAgainModalVisible`-modalen den öppnar — nås inte längre. Behålls
  // som referens/åter-aktiveringspunkt; non-host-halvan (Approve Replay →
  // `handleApprovePlayAgain` + broadcast-maskineriet) är däremot LIVE.
  const handlePlayAgain = async () => {
    // Guest host har max 1 replay — knappen är redan dold vid >= 1 (Round-
    // Leaderboard), detta är belt-and-suspenders mot oväntade call-paths.
    if (isGuestHostGame && guestReplaysUsed >= 1) return;
    // Broadcasta intent IMMEDIATELY innan vi öppnar dialogerna — non-host:s
    // "Approve Play Again"-knapp ska lysa upp så snart host tappat, oavsett
    // hur lång tid host tar på sig i credit-gate-popupen eller re-use-
    // players-alerten. Om host avbryter (Cancel i credit-gate eller re-use-
    // dialog) håller knappen kvar aktiv tills antingen non-host själva
    // lämnar eller host trycker Play Again igen + slutför flödet.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayAgainInitiated({ sender_id: selfPlayerId })
        .catch(() => {});
    }

    // Host Game Credits-gate (samma som Home:s Create Game + Lobby:s Start
    // Game): blockera Play Again om Free är 0 (engångsköpta Extras borttagna
    // 2026-07-07 — Premium är enda vägen förbi dags-cappen). Bättre att
    // fånga det här innan vi visar re-use-players-prompten — annars fyller
    // man i 2 alerts och får sedan blockaden i Lobby:n vid Start Game.
    if (!(await ensureHostCreditsForNewGame())) return;

    // För Pass-the-Phone (= alla på samma enhet) finns inga non-hosts att
    // vänta in → använd vanlig Alert direkt. För Individual Devices visar
    // vi custom modal istället så vi kan rendera "Yes, keep them"-knappen
    // som utgråad tills alla non-hosts broadcastat sin Approve-signal.
    //
    // Single-player (= PtP med exakt 1 spelare i turnOrder) skippar
    // "Re-use all players?"-frågan helt — det finns ingen att "behålla"
    // utöver host själv. Istället hoppar vi direkt till "Keep same
    // settings?"-popupen med extra Cancel-knapp så host har en utväg
    // tillbaka till Final Leaderboard utan att tvingas till Reset/Keep.
    if (gameMode === 'pass-the-phone') {
      const isSinglePlayer = turnOrder.length === 1;
      // Guest host: skippa Keep/Reset-settings-prompten — guest-lobbyns
      // lobby har få valbara settings, så frågan tillför lite; carry:a
      // alltid (keepSettings=true).
      if (isSinglePlayer) {
        if (isGuestHostGame) {
          goToNewLobby(true, true);
        } else {
          askKeepSettingsThenGo(true);
        }
      } else {
        Alert.alert(
          'Re-use all players?',
          'Start the next room with the same players, or begin fresh?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start fresh', onPress: () => goToNewLobby(false) },
            {
              text: 'Yes, keep them',
              onPress: () =>
                isGuestHostGame ? goToNewLobby(true, true) : askKeepSettingsThenGo(),
            },
          ],
        );
      }
    } else {
      // BEHÅLL existerande approvals när host re-tappar Play Again efter
      // Cancel. Non-host:s "Please Wait..."-overlay tas inte ner vid host:s
      // Cancel (deras awaitingNewLobby state lever vidare) så de re-broadcastar
      // inte sin Approve vid host:s andra Play Again-tap. Om vi reset:ade
      // approvals här hade "Yes, keep them"-knappen varit utgråad trots
      // att non-host redan tidigare godkänt — host skulle behöva nå non-host
      // via annan kanal för att be dem trycka Approve på nytt, vilket inte
      // funkar eftersom "Please Wait..."-overlay:n blockar tap. Att behålla
      // approvals löser det: host:s nästa Play Again-tap öppnar modal:en med
      // "Yes, keep them" redan upplåst om alla redan approvat.
      setPlayAgainModalVisible(true);
    }
  };

  const handleGoHome = async () => {
    // När host trycker Home från Final Leaderboard är lobby:n effektivt
    // stängd — Play Again-flödet är övergivet. Notifiera non-host:s
    // syncChannel + cleanup alla per-rum-stores så de inte fastnar på
    // "Please Wait..."-overlay:n (efter att de tappat Approve) eller
    // stannar passivt på Final Leaderboard. Gated på IndDev + host
    // eftersom Pass-the-Phone bara har en device.
    if (
      isHost &&
      gameMode === 'individual-devices' &&
      params.roomCode &&
      syncChannelRef.current
    ) {
      // Fire FÖRE deactivateRoom/clear så non-host:s syncChannel hinner
      // ta emot innan vi rivs vid component-unmount. Fire-and-forget —
      // ev. send-fail blockar inte host:s nav-flow.
      syncChannelRef.current
        .broadcastLobbyDeleted({ room_code: params.roomCode })
        .catch(() => {});
    }
    // Remote 1v1: host:s Home från Final Leaderboard avslutar INTE matchen.
    // Motståndaren har 48h på sig och kan mycket väl inte ha börjat spela än
    // — raderar vi rummet här får de "Game has been deleted by Host" och
    // förlorar sin omgång. Matchen är auktoritativ (remote_matches lever
    // oberoende av rooms-raden, som cron:en städar vid sin 24h-expiry), så
    // host bara navigerar hem och väntar på resultatet i 1vs1 Matches.
    if (isHost && !isRemote && params.roomCode) {
      // Cleanup-bunten speglar Quit Game-flödet — stänger rummet i Supabase
      // (server-side flagga + RLS-stäng) och rensar alla per-rum-mock-stores.
      try {
        await deactivateRoom(params.roomCode);
      } catch {
        // Tyst — låt navigation gå igenom även om DB-roundtrip skulle failla.
      }
      clearLeftPlayers(params.roomCode);
      clearLobbyPlayers(params.roomCode);
      clearLobbySettings(params.roomCode);
      clearEjected(params.roomCode);
      clearGameStarted(params.roomCode);
    }
    router.replace('/');
  };

  // ── "Start New Game" från Final Leaderboard (remote 1v1) ────────────────
  // Remote-slutskärmen har ingen Play Again (asynkron duell — nytt spel
  // skapas alltid från en ny lobby), så spelaren fick tidigare gå via Home
  // för att utmana igen. Knappen speglar Home:s "Start New Game" inklusive
  // Local/Remote-utfällningen; det här är dess handler och den speglar
  // handleCreateGame i app/index.tsx steg för steg (credit-gate →
  // registerActiveRoom → per-rum-cleanup → lobby).
  //
  // OBS: den PÅGÅENDE matchens rum lämnas orört (samma resonemang som i
  // handleGoHome ovan) — motståndaren har 48h på sig och rooms-raden
  // städas av 24h-expiry, så vi får inte deactivate:a den här.
  const handleStartNewGameFromFinal = async (lobbyType: 'standard' | '1v1') => {
    const [freshProfile, premium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    // Credit-gate: Premium = obegränsat, annars krävs Free-saldo. Samma
    // copy + Store-deeplink som Home så upplevelsen är identisk.
    if (!premium && (freshProfile?.freeGameCredits ?? 0) === 0) {
      Alert.alert(
        'Out of Host Game Credits',
        'You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium for unlimited host games.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/') },
        ],
      );
      return;
    }
    const code = generateRoomCode();
    const newIsRemote1v1 = lobbyType === '1v1';
    // Returvärdet MÅSTE kontrolleras — tyst no-op ger en fantom-lobby som
    // joiners inte hittar ("Room not found"-buggen 2026-08-07).
    const roomRegistered = await registerActiveRoom(code, {
      // Remote 1vs1 är alltid exakt 2 spelare — sätts redan här så
      // kapacitetskollen vid join är korrekt från första sekunden.
      maxPlayers: newIsRemote1v1 ? 2 : freshProfile?.maxPlayers ?? 4,
      hostIsPremium: premium,
      currentPlayerCount: 1,
      hostPlayerName: freshProfile?.playerName ?? '',
      gameStarted: false,
      isRemote1v1: newIsRemote1v1,
    });
    if (!roomRegistered) {
      Alert.alert(
        'Could not create game lobby',
        'The room could not be registered. Check your connection and that you are signed in, then try again.',
      );
      return;
    }
    // Fresh slate för den nya koden så ingen stale per-rum-data smyger in.
    clearLeftPlayers(code);
    clearLobbyPlayers(code);
    clearLobbySettings(code);
    clearEjected(code);
    clearGameStarted(code);
    track('room_code_created');
    // replace (inte push) — det avslutade spelet ska inte ligga kvar bakom
    // den nya lobbyn i navigationsstacken.
    router.replace({
      pathname: '/lobby',
      params: {
        code,
        isHost: 'true',
        ...(newIsRemote1v1 ? { lobbyType: '1v1' } : {}),
      },
    });
  };

  // ── Non-host Play Again-flöde ───────────────────────────────────────────
  // Två oberoende state-bits driver knappens läge på Final Leaderboard:
  // - `hostInitiatedPlayAgain`: host har tappat Play Again-knappen (sin
  //   sida). Flippar Approve-knappen från dimmed → active.
  // - `nextLobbyCode`: host har skapat nytt rum + broadcastat koden.
  //   Driver auto-navigation till nya lobbyn så snart non-host tappat
  //   Approve.
  // - `awaitingNewLobby`: non-host har själv tappat Approve. Lås
  //   skärmen med overlay tills nextLobbyCode kommer in.
  //
  // Race-fall: om nextLobbyCode kommer FÖRE non-host tappat Approve
  // (host plöjde snabbt genom alerts), state hålls kvar tills tap. Tap
  // → useEffect:en nedanför ser båda värdena satta + navigerar.
  // Om non-host valt Home INNAN host:s tap → component unmountar →
  // syncChannel rivs → events tas inte emot → de stannar på Home.
  const [hostInitiatedPlayAgain, setHostInitiatedPlayAgain] = useState(false);
  const [nextLobbyCode, setNextLobbyCode] = useState<string | null>(null);
  const [awaitingNewLobby, setAwaitingNewLobby] = useState(false);

  // Host-side state: vilka non-hosts har broadcastat sin Approve-tap.
  // `playAgainApprovals` är en Set av player_id:n. När size === antal
  // non-hosts i turnOrder, är "Yes, keep them"-knappen i modal:en
  // upplyst (innan dess är den utgråad).
  const [playAgainApprovals, setPlayAgainApprovals] = useState<Set<string>>(
    () => new Set(),
  );
  // Host-side modal: visas istället för Alert.alert efter host:s
  // Play Again-tap så vi kan rendera disabled state visuellt.
  const [playAgainModalVisible, setPlayAgainModalVisible] = useState(false);

  const handleApprovePlayAgain = () => {
    if (!hostInitiatedPlayAgain) return; // belt-and-suspenders mot disabled tap
    setAwaitingNewLobby(true);
    // Broadcasta approval-signal till host:s syncChannel så host:s
    // counter triggas och "Yes, keep them"-knappen kan låsas upp när
    // alla non-hosts godkänt.
    if (
      gameMode === 'individual-devices' &&
      syncChannelRef.current &&
      selfPlayerId
    ) {
      syncChannelRef.current
        .broadcastPlayerApprovedPlayAgain({ player_id: selfPlayerId })
        .catch(() => {});
    }
  };

  // ── Lokalt "Start New Game"-flöde (ersätter host:s Play Again) ──────────
  // Peter 2026-08-08: Final Leaderboard efter LOKALT spel har inte längre en
  // Play Again-knapp — i stället samma gula "Start New Game" som Home, med
  // en invite-fråga inskjuten före lägesvalet:
  //
  //   Start New Game → "Replay and Aggregate Leaderboard"
  //     • Yes, same players again → utfällningen visar BARA Local Play, grå
  //             tills alla non-hosts godkänt reprisen (deras knapp:
  //             "Approve Replay").
  //     • No, start fresh → normal utfällning (Local + Remote), färsk lobby
  //             utan spelare.
  //     • Cancel → tillbaka till Final Leaderboard.
  //
  // Guest-hostade spel kör SAMMA flöde (2026-08-08) med två skillnader:
  // Remote Play visas aldrig (remote 1vs1 är QuizVibe-users-only) och
  // Keep/Reset-settings-prompten hoppas över (guest-lobbyns settings är
  // låsta). Deras 1-replay-cap ligger kvar: vid guestReplaysUsed >= 1
  // renderas ingen "Start New Game" alls — bara Home, precis som förr.
  const [startNewGameExpanded, setStartNewGameExpanded] = useState(false);
  // Host valde "Yes, same players again" → carry-over av föregående spelare
  // (och, i IndDev, väntan på deras godkännande innan lobbyn får skapas).
  const [rematchInvite, setRematchInvite] = useState(false);

  const handleLocalStartNewGamePress = async () => {
    // Guest host har max 1 nytt spel härifrån — knappen renderas inte alls
    // vid >= 1; detta är belt-and-suspenders mot oväntade call-paths.
    if (isGuestHostGame && guestReplaysUsed >= 1) return;
    // Andra tappet stänger panelen igen (samma toggle-känsla som Home).
    if (startNewGameExpanded) {
      setStartNewGameExpanded(false);
      return;
    }
    // Credit-gaten först — meningslöst (och förvirrande för non-hosts) att
    // broadcasta en re-match-inbjudan som host inte kan fullfölja.
    if (!(await ensureHostCreditsForNewGame())) return;
    const totalNonHosts = Math.max(0, turnOrder.length - 1);
    if (totalNonHosts === 0) {
      // Single player: ingen att bjuda in. Behandlas som "invite" så det
      // egna kortet + lobby-settings bärs över precis som förr (Play Again
      // gick direkt till Keep/Reset-prompten i det här läget).
      setRematchInvite(true);
      setStartNewGameExpanded(true);
      return;
    }
    Alert.alert(
      'Replay and Aggregate Leaderboard',
      'Bring the players from this game into the new lobby, or start with an empty lobby?',
      [
        {
          text: 'Yes, same players again',
          onPress: () => {
            setRematchInvite(true);
            setStartNewGameExpanded(true);
            // Non-hosts "Approve Replay"-knapp lyser upp direkt. Avbryter
            // host efteråt står knappen kvar aktiv (samma dokumenterade
            // beteende som gamla Play Again-broadcasten).
            if (gameMode === 'individual-devices' && syncChannelRef.current) {
              syncChannelRef.current
                .broadcastPlayAgainInitiated({ sender_id: selfPlayerId })
                .catch(() => {});
            }
          },
        },
        {
          text: 'No, start fresh',
          onPress: () => {
            setRematchInvite(false);
            setStartNewGameExpanded(true);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleLocalStartNewGameSelect = (lobbyType: 'standard' | '1v1') => {
    setStartNewGameExpanded(false);
    // Remote 1vs1 kan aldrig ärva lokala spelare — egen lobby från scratch
    // (samma handler som remote-slutskärmens knapp).
    if (lobbyType === '1v1') {
      handleStartNewGameFromFinal('1v1');
      return;
    }
    if (!rematchInvite) {
      goToNewLobby(false);
      return;
    }
    // Guest host: hoppa Keep/Reset-prompten — guest-lobbyn har få valbara
    // settings, så frågan tillför lite; carry:a alltid (= behåll dem).
    // Samma gren som gamla Play Again-flödet hade.
    if (isGuestHostGame) {
      goToNewLobby(true, true);
      return;
    }
    // Single player: samma Keep/Reset-prompt med Cancel-utväg som förr.
    askKeepSettingsThenGo(turnOrder.length === 1);
  };

  // När båda non-host:s approval OCH host:s nya-lobby-event ankommit:
  // navigera till nya lobbyn. router.replace ersätter /quiz på Stack:n så
  // Back-knapp inte tar tillbaka till Final Leaderboard.
  useEffect(() => {
    if (awaitingNewLobby && nextLobbyCode) {
      // selfPlayerId är carry-over-id:t i nya lobbyn (goToNewLobby bevarar
      // samma p.id). LobbyScreen använder det för att hoppa över DB-beroende
      // dup-detection och direkt ärva rätt player_id — undviker race där
      // Supabase-replikering ännu inte synkat när non-host:s getLobbyPlayers
      // anropas, vilket annars ger ett ny joiner-DATE-id och två DB-rader.
      const carryOverParam = selfPlayerId ? `&carryOverPlayerId=${encodeURIComponent(selfPlayerId)}` : '';
      router.replace(`/lobby?code=${nextLobbyCode}&isHost=false${carryOverParam}`);
    }
  }, [awaitingNewLobby, nextLobbyCode]);

  // Refs för broadcast-handlers — captureras av syncChannel-subscribe:n.
  const playAgainInitiatedHandlerRef = useRef<() => void>(() => {});
  const playAgainLobbyReadyHandlerRef = useRef<
    (code: string, autoJoin?: boolean) => void
  >(() => {});
  const playerApprovedPlayAgainHandlerRef = useRef<(playerId: string) => void>(
    () => {},
  );
  // D-iv: handler för per-spelare audio-state-broadcast från host.
  // Alla klienter uppdaterar sin lokala overrides-map; den drabbade
  // spelarens device flippar mute via isMuted-prop till MediaPlayer.
  const playerAudioStateChangedHandlerRef = useRef<
    (playerId: string, audioOn: boolean) => void
  >(() => {});
  // D-v: handler för host-active-ping. Non-host:s receiver resetar
  // lastHostActivityRef när host bevisar liv. Host själv får aldrig
  // detta event (Realtime undertrycker self-echo). D-vi-utökning:
  // signaturen tar host:s questionIndex för heal-on-reconnect-sync.
  const hostActivePingHandlerRef = useRef<
    (questionIndex: number, allQuestionIds?: string[], hostPhase?: string) => void
  >(() => {});
  // Handler för host_rejoined: fyrar på non-host när HOST:s uppkoppling
  // återupprättats. Drainer pending score-kön så host:s leaderboard
  // får resultat som host kan ha missat under sitt offline-fönster.
  const hostRejoinedHandlerRef = useRef<() => void>(() => {});
  // Handler för watchdog-baserad peer-reconnect (onPeerReconnected).
  // Fyrar på BÅDA enheterna när watchdog:n detekterar att en peer som
  // var 'disconnected' nu har fresh heartbeat igen.
  // Host: broadcastar host_rejoined → non-host drainer scores.
  // Non-host: drainer scores direkt + broadcastar player_rejoined.
  const peerReconnectedHandlerRef = useRef<(senderId: string) => void>(() => {});
  // Synkron mirror av awaitingNewLobby så lobby-ready-handler:n kan
  // läsa den AKTUELLA värden vid event-ankomst utan att vara beroende
  // av att useEffect:en hunnit uppdatera handler-closure:n. Skyddar mot
  // millisekund-race där non-host tappar Approve "samtidigt" som host:s
  // lobby-ready-event ankommer.
  const awaitingNewLobbyRef = useRef(awaitingNewLobby);
  awaitingNewLobbyRef.current = awaitingNewLobby;
  // Guard så popup:en "Host has already started"-inte fyrar flera
  // gånger om host av någon anledning broadcastar lobby_ready upprepade
  // gånger.
  const hostStartedWithoutMeAlertedRef = useRef(false);
  // Guard så lobby-deleted-popup:en inte fyrar dubbelt om host:s broadcast
  // skulle nå non-host flera gånger (race vid edge-case-disconnect).
  const lobbyDeletedAlertedRef = useRef(false);
  // Ref för broadcast-handler av lobby-deleted-event.
  const lobbyDeletedHandlerRef = useRef<() => void>(() => {});
  // Host raderade lobbyn MEDAN vi fortfarande bläddrar i prisutdelnings-
  // sekvensen. Sekvensen ska inte avbrytas — popupen köas i stället och
  // visas när spelaren själv lämnar summary:n.
  const pendingLobbyDeletedRef = useRef(false);
  const celebrationVisibleRef = useRef(false);
  const showLobbyDeletedAlert = useCallback(() => {
    setAwaitingNewLobby(false);
    Alert.alert(
      'Host has deleted this lobby',
      '',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, []);
  useEffect(() => {
    playAgainInitiatedHandlerRef.current = () => {
      if (!isHost) setHostInitiatedPlayAgain(true);
    };
    playAgainLobbyReadyHandlerRef.current = (code: string, autoJoin?: boolean) => {
      if (isHost) return;
      if (awaitingNewLobbyRef.current || autoJoin) {
        // Non-host har tappat Approve och väntar med lock-overlay —
        // sätt koden så useEffect:en navigerar oss till nya lobbyn.
        // auto_join-fallet: host carry:ade över spelarna men bypassade
        // approval-gaten (Restart as Guest) — vår rad finns redan pre-
        // seedad i nya lobbyn så vi följer med UTAN Approve-tap. Sätt
        // awaitingNewLobby=true så navigations-effekten (som kräver båda
        // state-bits) fyrar; no-op om redan satt.
        setAwaitingNewLobby(true);
        setNextLobbyCode(code);
      } else if (!hostStartedWithoutMeAlertedRef.current) {
        // Non-host har INTE hunnit tappa Approve men host startar redan
        // nytt spel (= Start fresh-vägen, eftersom "Yes, keep them" är
        // utgråad tills alla approvat). Visa info-popup + skicka non-host
        // till startskärmen.
        hostStartedWithoutMeAlertedRef.current = true;
        Alert.alert(
          'Host has already started a new Game',
          '',
          [{ text: 'OK', onPress: () => router.replace('/') }],
          { cancelable: false },
        );
      }
    };
    playerApprovedPlayAgainHandlerRef.current = (playerId: string) => {
      // Bara host:s sida räknar approvals; non-hosts ignorerar
      if (!isHost) return;
      setPlayAgainApprovals((prev) => {
        if (prev.has(playerId)) return prev;
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
    };
    playerAudioStateChangedHandlerRef.current = (playerId, audioOn) => {
      // Speglar host:s ändring i lokal state — varje klient (inkl. host
      // själv om de skulle få eko, vilket Realtime undertrycker) håller
      // egen kopia av overrides-mappen. MediaPlayer:s isMuted re-evalu-
      // eras nästa render via useMemo-deps.
      setPlayerAudioOverridesState((prev) => ({ ...prev, [playerId]: audioOn }));
    };
    lobbyDeletedHandlerRef.current = () => {
      // Host har tappat Home från Final Leaderboard — lobby:n är stängd.
      // Bara non-host:s sida bryr sig (host själv broadcastar och navigerar
      // omedelbart). Visar info-Alert + auto-nav till startskärmen. Guard
      // mot dubbelfyrning via lobbyDeletedAlertedRef. Resetar
      // awaitingNewLobby så ev. "Please Wait..."-overlay släpps innan
      // popupen visas (Alert renderas över overlay:n, men cleanup gör
      // state-tree:t konsistent vid nav).
      if (isHost) return;
      if (lobbyDeletedAlertedRef.current) return;
      lobbyDeletedAlertedRef.current = true;
      // Bläddrar spelaren fortfarande i prisutdelnings-sekvensen? Avbryt den
      // INTE — köa popupen tills de själva lämnar via "Leave summary".
      if (celebrationVisibleRef.current) {
        pendingLobbyDeletedRef.current = true;
        return;
      }
      showLobbyDeletedAlert();
    };
    hostActivePingHandlerRef.current = (
      hostQuestionIndex: number,
      allQuestionIds?: string[],
      hostPhase?: string,
    ) => {
      // Host:s broadcast bekräftar liv → non-host resetar gap-tracker.
      // Detta är den ENDA vägen lastHostActivityRef uppdateras på
      // non-host-sidan; idle non-host:s tap dock påverkar inte ref:en
      // (vi spårar host:s aktivitet, inte vår egen).
      lastHostActivityRef.current = Date.now();
      // Heal-on-reconnect för GetReady-ikonerna: om broadcastAllQuestionIds
      // fortfarande är null (t.ex. efter mid-game reload) sätter vi den från
      // ping-payloaden. play_command gör samma sak men fyrar bara vid Play-tap.
      if (allQuestionIds && allQuestionIds.length > 0) {
        setBroadcastAllQuestionIds((prev) => prev ?? allQuestionIds);
      }
      // D-vi heal-on-reconnect: sync questionIndex mot host:s canonical
      // värde. Idempotent när redan synkad. Skyddar mot stale-index efter
      // offline-fönster där missade play_command/question_advance inte
      // replayas av Supabase Realtime.
      // didDrift beräknas FÖRE setState (2026-07-27) — driver fas-heal nedan.
      const didDrift = questionIndexRef.current !== hostQuestionIndex;
      setQuestionIndex((prev) => {
        if (prev === hostQuestionIndex) return prev;
        // Rensa broadcastQuestionId + broadcastDJPlayerId så _broadcastOverride och
        // isCurrentPlayerDJ inte pekar på stale data — nästa play_command + spotify_question_ready sätter rätt.
        setBroadcastQuestionId(null);
        setBroadcastDJPlayerId(null);
        // Nollställ timer-refs (fix 2026-07-18): en enhet som missade
        // question_advance (frozen/låst) heal:as hit med FÖRRA frågans
        // timer-stämplar kvar i refs — questionIndex-effekten resetar bara
        // state, inte refs (handleAdvanceToNextRound körs inte i heal-vägen).
        // Utan reset ger startTimer:s/timerActive-effektens elapsed-
        // kompensation timeLeft=0 direkt vid nästa question-entry (stämpeln
        // är minuter gammal) → omedelbar timeout + reveal. Nästa
        // play_command/spotify_dj_track_started sätter färska stämplar.
        hostTimerStartAtRef.current = 0;
        spotifyTimerStartAtRef.current = 0;
        // Fix 2026-07-27: även scoring-latch + lokal timerstämpel — annars
        // blockeras nya frågans scoring av förra frågans latch, och
        // AppState-resume räknar elapsed mot en minuter-gammal stämpel.
        hasRecordedScoreForCurrentQuestionRef.current = false;
        questionStartMsRef.current = 0;
        return hostQuestionIndex;
      });
      // Belt-and-suspenders catch-up: om host är bortom intro men non-host
      // fastnat i 'intro' (t.ex. sticky-latch rensat men play_command redan
      // tappat) triggar nästa ping en fas-transition. Kräver att sticky är
      // rensat (= non-host tappat Retry) och att nätet är stabilt igen.
      // Fix 2026-07-27: vid didDrift (frozen enhet som missade BÅDE
      // question_advance OCH play_command) räddas även stale awaiting/
      // reveal — utan detta renderas nya frågans data i förra frågans fas
      // (DJ-kort utan Start-knapp). Samma-frågas pingar (didDrift=false)
      // rör som tidigare bara intro → countdown.
      if (
        hostPhase &&
        (hostPhase === 'countdown' || hostPhase === 'question') &&
        !stickyUnstableForQuestion &&
        !isConnectionUnstable
      ) {
        setPhase((current) =>
          current === 'intro' ||
          (didDrift && (current === 'awaiting' || current === 'reveal' || current === 'question'))
            ? 'countdown'
            : current,
        );
      }
    };
    hostRejoinedHandlerRef.current = () => {
      // Host:s uppkoppling återupprättad — draina pending score-kön så
      // host:s leaderboard får resultat host kan ha missat under offline-fönstret.
      // Mottagarsidan (host) deduplicerar via receivedRemoteScoreKeysRef → idempotent.
      const toRetry = [...pendingScoreBroadcastsRef.current];
      pendingScoreBroadcastsRef.current = [];
      for (const payload of toRetry) {
        syncChannelRef.current?.broadcastPlayerScoreRecorded(payload).catch(() => {
          pendingScoreBroadcastsRef.current.push(payload);
        });
      }
      // Broadcastas även player_rejoined så host:s playerConnectionStatus
      // flippar oss tillbaka till 'connected' — kompletterar score-draining
      // med explicit reconnect-signal.
      if (selfPlayerId) {
        syncChannelRef.current
          ?.broadcastPlayerRejoined({ sender_id: selfPlayerId })
          .catch(() => {});
      }
    };
    peerReconnectedHandlerRef.current = (senderId: string) => {
      // Watchdog detekterade att en peer som var 'disconnected' nu har
      // fresh heartbeat. playerConnectionStatus är redan uppdaterad av
      // onPlayerConnectionChange-callbacken i subscribeSyncChannel.
      if (isHost && gameMode === 'individual-devices' && selfPlayerId) {
        // Host: broadcastas host_rejoined → non-host drainer sina pending
        // scores och broadcastar player_rejoined.
        // Använder selfPlayerId, senderId ignoreras (vi bryr oss inte om
        // vilken peer som kom tillbaka — alla non-hosts drainer vid mottagning).
        void senderId;
        syncChannelRef.current
          ?.broadcastHostRejoined({ sender_id: selfPlayerId })
          .catch(() => {});
      } else if (!isHost && gameMode === 'individual-devices' && selfPlayerId) {
        // Non-host: host kommit tillbaka (senderId = host:s player ID).
        // Draina pending scores direkt + broadcastas player_rejoined så
        // host:s playerConnectionStatus flippar oss till 'connected'.
        const toRetry = [...pendingScoreBroadcastsRef.current];
        pendingScoreBroadcastsRef.current = [];
        for (const payload of toRetry) {
          syncChannelRef.current?.broadcastPlayerScoreRecorded(payload).catch(() => {
            pendingScoreBroadcastsRef.current.push(payload);
          });
        }
        syncChannelRef.current
          ?.broadcastPlayerRejoined({ sender_id: selfPlayerId })
          .catch(() => {});
      }
    };
  }, [isHost]);

  // Quit Game: avslutar pågående spel mitt i, river lobby:n och kastar ut
  // host till Home. Speglar host-flödet "Delete this Game Lobby" från
  // LobbyScreen — deactiverar rumkoden i mockActiveRooms (så ev. ifyllda
  // join-koder börjar visa "Room not found") och rensar leftPlayers-store:n
  // för koden så ingen stale-data ärver in när koden ev. återanvänds.
  // LOKALA lägen only (Single/PtP/IndDev) — Remote 1v1 har sitt eget par
  // utvägar (handleRemoteForfeit / handleRemoteSaveExit nedan) eftersom
  // matchen lever server-side och är frikopplad från lobby:ns livscykel.
  const handleQuitGame = () => {
    Alert.alert(
      'Quit game?',
      'This will end the game and close the lobby for everyone. You will return to the start screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit game',
          style: 'destructive',
          onPress: async () => {
            // Spara frågor som visats hittills (index 0 till questionIndex-1)
            // så hosten inte ser dem igen vid nästa spelstart.
            if (questionIndex > 0) {
              const playedIds = [
                ...new Set(gameQuestions.slice(0, questionIndex).map((q) => q.id)),
              ];
              await addSessionRecord(playedIds);
              // PtP: skriv även under registrerade deltagares playerName-
              // nycklar (samma rationale som leaderboard-recordingen).
              if (gameMode !== 'individual-devices' && turnOrder.length > 1) {
                const registeredNames = turnOrder
                  .filter((p) => p.type === 'registered' && p.name)
                  .map((p) => p.name);
                if (registeredNames.length > 0) {
                  addSessionRecordForNames(registeredNames, playedIds).catch(() => {});
                }
              }
              persistEpochLedger();
            }
            const code = params.roomCode;
            if (code) {
              await deactivateRoom(code);
              clearLeftPlayers(code);
              clearLobbyPlayers(code);
              clearLobbySettings(code);
              clearEjected(code);
              clearGameStarted(code);
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Leave Game: non-host:s motsvarighet till Quit Game. Spelet och lobby:n
  // lever vidare för övriga; bara den här spelaren lämnar och navigerar Home.
  // Innan navigation broadcastar vi `player_left` till alla andra approved
  // enheter så host får popup + leaderboarden uppdateras med "Has left the
  // game" för spelaren. Fire-and-forget — om broadcast fail:ar (network
  // ned) blir host:s vy out-of-sync tills senare reconnect-flow, men user:s
  // navigation hem ska aldrig blockas.
  const handleLeaveGame = () => {
    Alert.alert(
      'Leave game?',
      'You will return to the start screen. The game continues for the other players.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave game',
          style: 'destructive',
          onPress: () => {
            // Spara frågor som hunnit visas (spegling av Quit Games recording,
            // men mot host:s faktiska sekvens — lokala gameQuestions är bara
            // en shuffle-ordning på non-host). Fire-and-forget så navigation
            // aldrig blockas.
            if (questionIndex > 0) {
              const sourceIds =
                broadcastAllQuestionIds && broadcastAllQuestionIds.length > 0
                  ? broadcastAllQuestionIds
                  : gameQuestions.map((q) => q.id);
              const shownIds = [...new Set(sourceIds.slice(0, questionIndex))];
              addSessionRecord(shownIds).catch(() => {});
              persistEpochLedger();
            }
            if (
              gameMode === 'individual-devices' &&
              syncChannelRef.current &&
              selfPlayerId
            ) {
              const selfName =
                turnOrder.find((p) => p.id === selfPlayerId)?.name ?? 'Player';
              syncChannelRef.current
                .broadcastPlayerLeft({
                  player_id: selfPlayerId,
                  player_name: selfName,
                })
                .catch(() => {});
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // ── Remote 1v1: två utvägar ur quiz-vyn, IDENTISKA för host och
  //    motståndare (Peter 2026-08-08). Matchen lever i remote_matches och
  //    är frikopplad från rummet, så det finns ingen anledning att host:s
  //    utväg ska vara mer destruktiv än motståndarens:
  //      • "Quit match"  → ger upp; motståndaren vinner på WALKOVER.
  //      • "Save & Exit" → pausar; återupptas inom 48h via 1vs1 Matches.
  //    Host:s äldre "cancel hela matchen"-väg (cancel_remote_match, 0028)
  //    nås inte längre härifrån — RPC:n + API-wrappern finns kvar för
  //    äldre klienter/admin men är dormant i UI:t.

  // Sätts INNAN forfeit-RPC:n så min EGEN UPDATE inte triggar
  // walkover-popupen nedan på min egen enhet (Realtime pushar tillbaka
  // till avsändaren också, och router.replace hinner inte alltid först).
  const selfForfeitedRef = useRef(false);

  // Motståndaren tryckte "Quit match" medan JAG fortfarande sitter i
  // quiz-vyn → forfeit-RPC:ns UPDATE på remote_matches pushas hit via
  // postgres_changes (samma kanal som slutskärmens resultatpanel).
  // Symmetriskt för båda roller: den som är kvar får kvittot direkt
  // istället för att upptäcka walkovern först i 1vs1 Matches.
  // `alerted`-guarden gör den idempotent — Realtime kan leverera samma
  // UPDATE fler än en gång vid reconnect.
  const opponentQuitAlertedRef = useRef(false);
  useEffect(() => {
    if (!isRemote || !remoteMatchId) return;
    const unsubscribe = subscribeToMatch(remoteMatchId, () => {
      void (async () => {
        if (selfForfeitedRef.current || opponentQuitAlertedRef.current) return;
        const m = await getMatch(remoteMatchId);
        if (!m || m.status !== 'forfeited') return;
        // Bara två deltagare — är det inte jag som gav upp är det
        // motståndaren, och då är jag vinnaren.
        opponentQuitAlertedRef.current = true;
        const myId = await getOwnUserId();
        const opp = m.players.find((p) => p.userId !== myId);
        Alert.alert(
          'Walk over',
          `${formatPlayerLabel(opp, 'Your opponent')} has left this game — you win by walkover.`,
          [{ text: 'OK', onPress: () => router.replace('/') }],
          { cancelable: false },
        );
      })();
    });
    return unsubscribe;
  }, [isRemote, remoteMatchId]);

  // ── Remote 1v1: motståndarens rad på Final Leaderboard ───────────────
  // Duellen är asynkron, så motståndarens resultat finns bara server-side.
  // Deras per-fråga-svar är RLS-skyddade (`remote_match_answers` filtrerar
  // på user_id) — vi läser summary-raden ur `remote_match_players` och
  // matar in den som en förberäknad leaderboard-rad. Raden dyker upp först
  // när de faktiskt spelat klart (finishedAt satt); tills dess är
  // leaderboarden en-radig och duellpanelen under den säger "Waiting for
  // Player: X to play". Realtime-prenumerationen gör att raden poppar in
  // live om motståndaren blir klar medan slutskärmen står uppe.
  const [remoteOpponentSummary, setRemoteOpponentSummary] =
    useState<RemoteMatchPlayer | null>(null);
  // Matchen är avgjord server-side (finished / walkover / void / forfeited /
  // cancelled). Då finns inget mer att vänta in även om motståndaren aldrig
  // spelade klart — "Start New Game" ska låsas upp.
  const [remoteMatchEnded, setRemoteMatchEnded] = useState(false);
  useEffect(() => {
    if (!isRemote || !remoteMatchId || phase !== 'leaderboard') return;
    let cancelled = false;
    const load = async () => {
      const [m, myId] = await Promise.all([getMatch(remoteMatchId), getOwnUserId()]);
      if (cancelled || !m || !myId) return;
      const opp = m.players.find((p) => p.userId !== myId) ?? null;
      setRemoteOpponentSummary(opp?.finishedAt ? opp : null);
      setRemoteMatchEnded(m.status !== 'active');
    };
    void load();
    const unsubscribe = subscribeToMatch(remoteMatchId, () => { void load(); });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isRemote, remoteMatchId, phase]);

  // Spelarlista till Final Leaderboard. Identisk med gamePlayers utom i
  // remote-fallet där motståndarens summary-rad läggs till som #2 (eller
  // #1 — tabellen sorterar på poäng som vanligt).
  const leaderboardPlayers: LeaderboardPlayer[] = useMemo(() => {
    if (!remoteOpponentSummary) return gamePlayers;
    const opp = remoteOpponentSummary;
    return [
      ...gamePlayers,
      {
        id: `remote-opponent-${opp.userId}`,
        name: formatPlayerLabel(opp),
        emoji: '👤',
        assistance: (opp.assistance as AssistanceLevel | null) ?? undefined,
        age: opp.age ?? undefined,
        summaryStats: {
          // De har finaliserat → hela sekvensen är besvarad.
          playedRounds: totalQuestions,
          correctAnswers: opp.correctAnswers,
          avgResponseSeconds: opp.avgResponseSeconds,
          points: opp.totalPoints,
        },
      },
    ];
  }, [gamePlayers, remoteOpponentSummary, totalQuestions]);

  // ── Prisutdelnings-sekvens (celebration + match highlights) ──────────────
  // Overlay ovanpå Final Leaderboard. Se FinalCelebration.tsx för varför det
  // är en overlay och inte en ersättande vy (kort version: slutskärmens
  // server-effekter ska inte fördröjas av en animation).
  // Varje enhet äger sin EGEN sekvens: spelaren lämnar den när de vill via
  // "Leave summary". Ingen broadcast, ingen host-styrning — en host som går
  // till Home avbryter alltså inte en non-host som fortfarande bläddrar.
  const [summaryDone, setSummaryDone] = useState(false);

  // Highlights kräver per-fråge-underlag från BÅDA spelarna. I remote finns
  // ingen sync-channel — motståndarens rad kommer som färdigaggregerad
  // summaryStats — så vi väntar tills matchen är avgjord. Är den inte det
  // visas bara celebration och sedan slutskärmen ("Waiting for opponent").
  const remoteSummaryReady = !isRemote || !!remoteOpponentSummary || remoteMatchEnded;

  // Personal-läge när det inte finns någon att jämföra med: ensam spelare,
  // eller remote där kategori-/källjämförelser saknar underlag.
  const highlightMode =
    isRemote || leaderboardPlayers.length < 2 ? 'personal' : 'competitive';

  const matchHighlights = useMemo(() => {
    if (phase !== 'leaderboard' || !isLastQuestion || !remoteSummaryReady) return [];
    return buildMatchHighlights({
      scores: allRoundScoresHistory,
      players: leaderboardPlayers,
      categoryByQuestion: effectiveCategoryByQuestion,
      mediaSourceByQuestion: effectiveMediaSourceByQuestion,
      mode: highlightMode,
    });
  }, [
    phase,
    isLastQuestion,
    remoteSummaryReady,
    allRoundScoresHistory,
    leaderboardPlayers,
    effectiveCategoryByQuestion,
    effectiveMediaSourceByQuestion,
    highlightMode,
  ]);

  // Speglar om prisutdelnings-overlayen faktiskt är uppe. Läses av
  // lobby_deleted-handlern (registrerad EN gång vid mount) för att skjuta
  // upp "Host has deleted this lobby"-popupen tills spelaren lämnat
  // sekvensen — den ska aldrig avbrytas mitt i.
  celebrationVisibleRef.current =
    phase === 'leaderboard' && isLastQuestion && !summaryDone;

  // Spelaren lämnade sekvensen. Har host hunnit radera lobbyn under tiden
  // visas den uppskjutna popupen nu i stället.
  const handleSummaryDone = useCallback(() => {
    setSummaryDone(true);
    if (pendingLobbyDeletedRef.current) {
      pendingLobbyDeletedRef.current = false;
      showLobbyDeletedAlert();
    }
  }, [showLobbyDeletedAlert]);

  // Frågor som hunnit visas i den här sessionen — skrivs till seen-
  // historiken så de inte återkommer direkt i NÄSTA spel. I remote är
  // `gameQuestions` matchens auktoritativa sekvens (remote-override i
  // useMemo:n) för båda roller, så ingen broadcast-preferens behövs.
  const recordRemoteQuestionsShown = async () => {
    if (questionIndex <= 0) return;
    const shownIds = [
      ...new Set(gameQuestions.slice(0, questionIndex).map((q) => q.id)),
    ];
    await addSessionRecord(shownIds).catch(() => {});
    persistEpochLedger();
  };

  // Quit match: ge upp. forfeit_remote_match sätter status 'forfeited' +
  // result 'walkover' med MOTSTÅNDAREN som vinnare och aggregerar mina
  // hittills sparade svar till en delpoäng. Await:as så UPDATE:n hinner
  // committa innan Home mountar och 1vs1 Matches laddar.
  const handleRemoteForfeit = () => {
    Alert.alert(
      'Quit game?',
      'You give up this 1vs1 match. Your opponent wins by walkover, and the match cannot be resumed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit game',
          style: 'destructive',
          onPress: async () => {
            selfForfeitedRef.current = true;
            await recordRemoteQuestionsShown();
            if (remoteMatchId) {
              await forfeitRemoteMatch(remoteMatchId);
            }
            // Bara host äger rummet — matchen är terminal, så koden ska
            // inte ligga kvar joinbar. Motståndaren rör aldrig rums-
            // livscykeln (samma regel som i lokala lägen).
            const code = params.roomCode;
            if (isHost && code) {
              await deactivateRoom(code);
              clearLeftPlayers(code);
              clearLobbyPlayers(code);
              clearLobbySettings(code);
              clearEjected(code);
              clearGameStarted(code);
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Save & Exit: pausa. Svaren ligger redan server-side (upsertAnswer per
  // fråga, idempotent per question_index) så resume-seeden i init-effekten
  // plockar upp vid första obesvarade frågan. Inget rums-cleanup ens för
  // host — båda ska kunna komma tillbaka.
  const handleRemoteSaveExit = () => {
    Alert.alert(
      'Save & Exit?',
      'Your answers so far are saved. Resume this 1vs1 match within 48 hours via "1vs1 Matches" on the Home screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Exit',
          onPress: async () => {
            await recordRemoteQuestionsShown();
            router.replace('/');
          },
        },
      ],
    );
  };

  // Cross-device-detection (Slice D-i): när host raderar rummet via Quit
  // Game ska non-host:s /quiz-skärm få samma "Game has been deleted by
  // Host"-popup som LobbyScreen visar. Realtime-DELETE-event på rooms-
  // tabellen är canonical-signalen. Gated på !isHost — host:en initierade
  // delete:n och navigerar bort själv, så vi behöver inte poppa något åt
  // dem. Samma defensive channel-cleanup-pattern som LobbyScreen så
  // remount inte racear med stale-subscribed-channels.
  //
  // EJ i Remote 1v1: där är rums-raden bara en genväg till lobbyn, medan
  // remote_matches äger spelets livscykel (48h). Rummet kan försvinna av
  // skäl som inte alls avslutar matchen (host går Home, 24h-expiry) och
  // gör det dessutom vid host:s forfeit — där motståndaren ska få
  // walkover-popupen via subscribeToMatch, inte "deleted by Host".
  const [hostDeletedDetected, setHostDeletedDetected] = useState(false);
  useEffect(() => {
    if (isHost || isRemote || !params.roomCode) return;
    const code = params.roomCode;
    const topic = `realtime:quiz_room:${code}`;
    supabase.getChannels()
      .filter((c) => c.topic === topic)
      .forEach((c) => supabase.removeChannel(c));
    const channel = supabase
      .channel(`quiz_room:${code}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        () => setHostDeletedDetected(true),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isHost, isRemote, params.roomCode]);

  useEffect(() => {
    if (!hostDeletedDetected) return;
    Alert.alert(
      'Game ended',
      'Game has been deleted by Host.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [hostDeletedDetected]);

  // ── Individual Devices sync ──────────────────────────────────────────────
  // Host:s Play- och Next-tap broadcast:as till alla approved enheter via
  // Realtime broadcast-channel `quiz_sync:<roomCode>`. Speglar D-ii-spec:n
  // i docs/individual-devices-spec.md — minimal version utan readiness-
  // handshake/preload/clock-sync, bara screen-transition-events.
  //
  // Båda host och non-host subscribe:ar; default `broadcast.self: false` i
  // Supabase Realtime hindrar host från att eka tillbaka sina egna events.
  // Pass-the-Phone behöver inte sync — alla på samma enhet.
  const syncChannelRef = useRef<SyncChannel | null>(null);
  // Refs så broadcast-listenern alltid pekar på senaste handlern (annars
  // skulle subscription:n captura stale closures vid mount).
  const playCommandHandlerRef = useRef<(qIdx: number, qId?: string, allIds?: string[], timerStartAt?: number) => void>(() => {});
  const questionAdvanceHandlerRef = useRef<(payload: QuestionAdvancePayload) => void>(() => {});
  const playerLeftHandlerRef = useRef<(playerId: string, playerName: string) => void>(
    () => {},
  );
  const playerAnswerConfirmedHandlerRef = useRef<
    (playerId: string, timeUsed: number) => void
  >(() => {});
  const responseSecondsChangedHandlerRef = useRef<(seconds: 30 | 45 | 60) => void>(
    () => {},
  );
  // Cross-device score-aggregering: dedup-set + handler-ref för inkommande
  // remote scores i IndDev-läget. Resetas aldrig manuellt (ett spel per
  // quiz.tsx-mount; ny instans → nytt Set).
  const receivedRemoteScoreKeysRef = useRef<Set<string>>(new Set());
  const playerScoreRecordedHandlerRef = useRef<(payload: PlayerScoreRecordedPayload) => void>(() => {});
  // Pending-kö för score-broadcasts som kan ha tappats under offline-period.
  // Broadcasten körs omedelbart + sparas här; vid reconnect skickas alla om.
  // Mottagarsidan deduplicerar via player_id+question_index — omskick är säkert.
  const pendingScoreBroadcastsRef = useRef<PlayerScoreRecordedPayload[]>([]);
  // D-iii: per-peer connection-status. Drivs av två separata signaler:
  //   - watchdog (15s silence från remote sender) → 'disconnected'
  //   - player_rejoined-event (sender:s explicit Retry-tap) → 'connected'
  // Heartbeat-receipt ENSAM räcker INTE för att flippa tillbaka — sender
  // måste eksplicit broadcasta player_rejoined för att A:s leaderboard ska
  // markera dem som åter aktiva. Egen player_id är aldrig nyckel här.
  const [playerConnectionStatus, setPlayerConnectionStatus] = useState<
    Record<string, 'connected' | 'disconnected'>
  >({});
  // Roster-ref för broadcast sender-validering (syncChannel isKnownSender).
  // Håller aktuella turnOrder-player-ids så en fientlig klient inte kan
  // injicera player-id-bärande events (fake score/leave/approval) för ett id
  // som inte finns i lobbyn. Ref (inte state) så predikatet är stabilt utan
  // att re-subscribe:a channel:n vid varje roster-ändring.
  const turnOrderIdSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    turnOrderIdSetRef.current = new Set(turnOrder.map((p) => p.id));
  }, [turnOrder]);
  useEffect(() => {
    if (gameMode !== 'individual-devices' || !params.roomCode) return;
    const sync = subscribeSyncChannel(params.roomCode, selfPlayerId, {
      // Droppar player-id-bärande events vars id inte är i lobbyn. Fail-open
      // tills rostern populerats (undviker false-drop på tidiga events).
      isKnownSender: (id: string) => {
        const set = turnOrderIdSetRef.current;
        return set.size === 0 || set.has(id);
      },
      onPlayCommand: (payload) => {
        // Synka host:s Spotify-svarstyps-inställningar för GetReady-kö-badge.
        if (payload.spotify_answer_year !== undefined) setBroadcastHostSpotifyAnswerYear(payload.spotify_answer_year);
        if (payload.spotify_answer_name !== undefined) setBroadcastHostSpotifyAnswerName(payload.spotify_answer_name);
        // Sätt DJ-spelarens id tidigt (vid countdown-start) så non-host inte
        // behöver vänta på det separata spotify_question_ready-broadcastet.
        if (payload.dj_player_id) setBroadcastDJPlayerId(payload.dj_player_id);
        playCommandHandlerRef.current(payload.question_index, payload.question_id, payload.all_question_ids, payload.timer_start_at);
      },
      onQuestionAdvance: (payload) => questionAdvanceHandlerRef.current(payload),
      onPlayerLeft: (payload) =>
        playerLeftHandlerRef.current(payload.player_id, payload.player_name),
      onPlayerAnswerConfirmed: (payload) =>
        playerAnswerConfirmedHandlerRef.current(payload.player_id, payload.time_used),
      onResponseSecondsChanged: (payload) =>
        responseSecondsChangedHandlerRef.current(payload.seconds),
      onPlayAgainInitiated: () => playAgainInitiatedHandlerRef.current(),
      onPlayAgainLobbyReady: (payload) =>
        playAgainLobbyReadyHandlerRef.current(payload.room_code, payload.auto_join),
      onPlayerApprovedPlayAgain: (payload) =>
        playerApprovedPlayAgainHandlerRef.current(payload.player_id),
      onLobbyDeleted: () => lobbyDeletedHandlerRef.current(),
      onPlayerAudioStateChanged: (payload) =>
        playerAudioStateChangedHandlerRef.current(payload.player_id, payload.audio_on),
      onHostActivePing: (payload) =>
        hostActivePingHandlerRef.current(payload.question_index, payload.all_question_ids, payload.phase),
      onPlayerConnectionChange: (playerId, status) => {
        setPlayerConnectionStatus((prev) => ({ ...prev, [playerId]: status }));
      },
      onPlayerRejoined: (playerId) => {
        // Explicit Retry-tap från remote spelare → flippa till 'connected'.
        // Detta är ENDA vägen tillbaka (heartbeat-receipt räcker inte).
        setPlayerConnectionStatus((prev) => ({ ...prev, [playerId]: 'connected' }));
        // Del 1-fix: om host redan är i countdown/question re-broadcastar vi
        // play_command med 500 ms fördröjning. Fördröjningen krävs för att
        // ge React tid att rendera setStickyUnstableForQuestion(false) i
        // handleRetryFromUnstable — annars har playCommandHandlerRef-closure:n
        // fortfarande stickyUnstableForQuestion=true och ignorerar broadcasten.
        if (isHost && syncChannelRef.current) {
          const currentPhase = phaseRef.current;
          if (currentPhase === 'countdown' || currentPhase === 'question') {
            const idx = questionIndexRef.current;
            const qId = gameQuestionsRef.current[idx]?.id ?? '';
            const allIds = gameQuestionsRef.current.map((q) => q.id);
            setTimeout(() => {
              syncChannelRef.current?.broadcastPlayCommand({
                question_index: idx,
                question_id: qId,
                all_question_ids: allIds,
                timer_start_at: undefined,
                spotify_answer_year: spotifyAnswerYear,
                spotify_answer_name: spotifyAnswerName,
                // VIA REF (fix 2026-07-27): denna callback registreras EN gång
                // på mount — closure-läsning av currentDJPlayer gav MOUNT-tidens
                // DJ (fråga 0 = host) och demoterade en senare frågas non-host-DJ
                // till gissare när deras Spotify-flap triggade re-broadcasten.
                dj_player_id: currentDJPlayerRef.current?.id,
              }).catch(() => {});
            }, 500);
          }
        }
      },
      onHostRejoined: () => hostRejoinedHandlerRef.current(),
      onPeerReconnected: (senderId) => peerReconnectedHandlerRef.current(senderId),
      // Spotify: host broadcastar vem som är DJ för denna fråga.
      // Non-host sparar dj_player_id — används av isCurrentPlayerDJ
      // istället för lokalt beräknat djRotationPlan (fel pga annan shuffle).
      onSpotifyQuestionReady: (payload) => {
        setBroadcastDJPlayerId(payload.dj_player_id);
        if (payload.answer_type) setBroadcastSpotifyAnswerType(payload.answer_type);
      },
      // Spotify DJ: DJ:n tryckte "Start track in Spotify" → stega guesser-guide 0→1.
      onSpotifyDJOpenedApp: () => {
        setSpotifyDJOpenedAppBroadcast(true);
      },
      // Spotify DJ: DJ:n har öppnat Spotify och broadcastat.
      // Avbryt timeout-fas, uppdatera UI och starta timern med 2 s delay.
      // Uppdatera hostTimerStartAtRef med DJ:ns faktiska timer_start_at —
      // utan detta används stale play_command-tid (~30 s sedan) → startTimer()
      // kompenserar för en elapsed-tid som inte existerar → timern börjar
      // halvvägs eller direkt på 0.
      onSpotifyDJTrackStarted: (payload) => {
        // Stale-guard (fix 2026-07-18): aktiverarens 5s-heartbeat kan överleva
        // ett frågebyte — om aktiverarens enhet var backgroundad/låst vid
        // question_advance missas broadcasten (Realtime replayar inte), och
        // när enheten väcks fyrar det frusna intervallet FÖRE ping-heal:en
        // hunnit synka questionIndex → FÖRRA frågans timer_start_at (minuter
        // gammal) broadcastas. Utan guard latchade mottagaren stale
        // spotifyDJStarted=true + stale hostTimerStartAtRef → timern auto-
        // aktiverades vid question-entry → startTimer:s elapsed-kompensation
        // gav timeLeft=0 → omedelbar timeout + reveal INNAN någon aktiverat
        // timern. Track-ID:t i payloaden identifierar frågan — mismatch mot
        // aktuell fråga = stale → ignorera. Ref:en (inte state) läses eftersom
        // handlern registreras en gång ([isHost]-deps) och closure:n annars
        // vore frusen.
        if (
          !currentSpotifyTrackIdRef.current ||
          payload.spotify_track_id !== currentSpotifyTrackIdRef.current
        ) {
          return;
        }
        setSpotifyDJStarted(true);
        setSpotifyWaitPhase(null);
        if (payload.timer_start_at) {
          hostTimerStartAtRef.current = payload.timer_start_at;
          // Spotify-specifik ref — används av AppState DJ-return-kompensation
          // för att skilja Spotify-timern från play_command-tidens stämpel.
          spotifyTimerStartAtRef.current = payload.timer_start_at;
        }
        // Starta timer för non-host oavsett om de redan confirmat (awaiting)
        // eller inte hunnit (question). Utan 'awaiting'-grenen fastnar non-host
        // som confirmat INNAN DJ aktiverat för alltid i awaiting-fasen.
        if (phaseRef.current === 'question' || phaseRef.current === 'awaiting') {
          setTimeout(() => setTimerActive(true), 2000);
        }
      },
      onSpotifyDJHandover: () => {
        setDjHandedOver(true);
      },
      onPlayerScoreRecorded: (payload) => playerScoreRecordedHandlerRef.current(payload),
      // Cross-player-historik: non-host skickar sin 20-sessions-historik vid
      // quiz-mount. Merge:as ENDAST innan spelet startat (host står i intro
      // på fråga 0) — senare ankomst (t.ex. reconnect-re-broadcast) ignoreras
      // så gameQuestions-useMemo:n aldrig bygger om poolen mitt i ett spel
      // (rebuild skulle byta den aktiva frågan under fötterna på spelarna).
      onPlayerSeenQuestions: (payload) => {
        if (!isHost) return;
        if (phaseRef.current !== 'intro' || questionIndexRef.current !== 0) return;
        if (payload.seen_q_ids.length > 0) {
          setPeerSeenIds((prev) => new Set([...prev, ...payload.seen_q_ids]));
        }
        if (payload.last_q_ids.length > 0) {
          setPeerLastIds((prev) => new Set([...prev, ...payload.last_q_ids]));
        }
      },
      // Non-host: host broadcastar hela fråge-sekvensen ~800ms efter quiz-mount.
      // Sätter broadcastAllQuestionIds → effectiveMediaSourceByQuestion → korrekta
      // GetReady-kö-ikoner redan på FÖRSTA GetReady-skärmen (innan play_command).
      onGameSequenceInit: (payload) => {
        if (!isHost && payload.all_question_ids?.length > 0) {
          setBroadcastAllQuestionIds(payload.all_question_ids);
          if (payload.spotify_answer_year !== undefined) setBroadcastHostSpotifyAnswerYear(payload.spotify_answer_year);
          if (payload.spotify_answer_name !== undefined) setBroadcastHostSpotifyAnswerName(payload.spotify_answer_name);
        }
      },
    });
    syncChannelRef.current = sync;

    // Host: broadcasta hela fråge-sekvensen vid 800ms, 2500ms och 5000ms
    // efter subscribe. Tre sändningar täcker (a) normalt race-fönster,
    // (b) sen subscription, (c) non-host som reloader och subscribar sent.
    // non-hosts hinner subscriba i sin tur och ta emot eventet.
    // play_command skickar också all_question_ids så dubbelts är ofarligt.
    const initBroadcastTimers: ReturnType<typeof setTimeout>[] = [];
    if (isHost) {
      const sendSequence = () => {
        sync
          .broadcastGameSequenceInit({
            all_question_ids: gameQuestionsRef.current.map((q) => q.id),
            spotify_answer_year: spotifyAnswerYear,
            spotify_answer_name: spotifyAnswerName,
          })
          .catch(() => {});
      };
      initBroadcastTimers.push(setTimeout(sendSequence, 800));
      initBroadcastTimers.push(setTimeout(sendSequence, 2500));
      initBroadcastTimers.push(setTimeout(sendSequence, 5000));
    }

    return () => {
      initBroadcastTimers.forEach(clearTimeout);
      sync.unsubscribe();
      syncChannelRef.current = null;
    };
  }, [gameMode, params.roomCode, selfPlayerId, isHost]);

  // D-iv: initial-fetch av audio-overrides-mappen från lobby_settings
  // vid mount. Krävs för non-host som joinar mid-session — broadcasten
  // är fast-path för LIVE-ändringar men ger ingen state-snapshot vid
  // late-join. Host kör samma fetch (idempotent) så pre-existing
  // overrides från carry-over (Play Again) återställs i lokal state.
  useEffect(() => {
    if (gameMode !== 'individual-devices' || !params.roomCode) return;
    let cancelled = false;
    getPlayerAudioOverrides(params.roomCode)
      .then((map) => {
        if (cancelled) return;
        // Har spelaren hunnit toggla sitt EGNA ljud innan fetchen resolvat
        // behålls det valet — annars skulle en sen resolve tyst nolla det.
        setPlayerAudioOverridesState((prev) =>
          selfAudioTouchedRef.current && selfPlayerId
            ? { ...map, [selfPlayerId]: prev[selfPlayerId] }
            : map,
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [gameMode, params.roomCode, selfPlayerId]);

  // D-iii: när lokal monitor återgår från unstable → ok, rensa peer-
  // tracking-state. Allt vi har om andra spelare från perioden vi var
  // offline är potentiellt stale (vi tappade DERAS heartbeats medan VI
  // var offline). Utan reset skulle GetReady visa stale "Connection
  // unstable"-rader för spelare som faktiskt aldrig var disconnected,
  // tills nästa heartbeat från varje peer hinner fram (upp till 10s
  // flicker). Reset:n täcker både UI-map:en + syncChannel:s interna
  // lastSeen/lastReported så watchdog:n inte fyrar gammal disconnect-
  // status igen.
  // Non-host: broadcasta även player_rejoined automatiskt vid recovery
  // så host:s leaderboard flippar tillbaka till 'connected' direkt.
  // Heartbeat-receipt räcker inte per design — explicit signal krävs.
  const prevConnectionStatusRef = useRef<'ok' | 'unstable'>('ok');
  useEffect(() => {
    const wasUnstable = prevConnectionStatusRef.current === 'unstable';
    const isOk = connection.status === 'ok';
    if (wasUnstable && isOk) {
      setPlayerConnectionStatus({});
      syncChannelRef.current?.resetPeerTracking();
      if (isHost && gameMode === 'individual-devices' && selfPlayerId) {
        // Host återansluten — signalera till non-hosts att draina sina
        // pending score-köer. Non-hosts re-broadcastar allt de skickat
        // sedan spelet startade; mottagarsidan (host) deduplicerar.
        syncChannelRef.current
          ?.broadcastHostRejoined({ sender_id: selfPlayerId })
          .catch(() => {});
      }
      if (!isHost && gameMode === 'individual-devices' && selfPlayerId) {
        // Re-broadcasta scores som kan ha tappats under offline-perioden.
        // Körs före player_rejoined så host:s leaderboard uppdateras
        // med poäng innan reconnect-signalen flippar statusen till 'connected'.
        const toRetry = [...pendingScoreBroadcastsRef.current];
        pendingScoreBroadcastsRef.current = [];
        for (const payload of toRetry) {
          syncChannelRef.current?.broadcastPlayerScoreRecorded(payload).catch(() => {
            // Om retry också failar, lägg tillbaka i kön.
            pendingScoreBroadcastsRef.current.push(payload);
          });
        }
        syncChannelRef.current
          ?.broadcastPlayerRejoined({ sender_id: selfPlayerId })
          .catch(() => {});
      }
    }
    prevConnectionStatusRef.current = connection.status;
  }, [connection.status]);

  // D-iii: host-popup vid edge-transition 0→≥1 disconnected peer:s. Bara
  // host (host driver speltempot — non-host behöver inte aware:nessa om
  // andra peers, deras egna overlay räcker). Popup:en får BARA fyra när
  // host är i GetReady (phase='intro') — aldrig mid-quiz. Disconnects
  // som inträffar under question/awaiting/reveal köas via pendingAlertRef
  // och fyrar när host återvänder till intro. Re-armas när alla
  // återansluts (count → 0) så nästa nya disconnect-våg ger nytt popup.
  // Non-IndDev: ingen popup (map:en hålls tom där).
  const prevDisconnectedCountRef = useRef(0);
  const pendingDisconnectAlertRef = useRef(false);
  useEffect(() => {
    if (!isHost || gameMode !== 'individual-devices') return;
    const disconnectedCount = Object.values(playerConnectionStatus).filter(
      (s) => s === 'disconnected',
    ).length;
    // Edge 0→≥1: markera pending. Coalescerar flera disconnects till en
    // popup — ytterligare disconnects mellan edge och fire ger inte extra
    // popups.
    if (disconnectedCount >= 1 && prevDisconnectedCountRef.current === 0) {
      pendingDisconnectAlertRef.current = true;
    }
    // Edge ≥1→0: alla återanslutna (via player_rejoined). Pending blir
    // inaktuellt → rensa så situationen inte rapporteras i efterhand.
    if (disconnectedCount === 0) {
      pendingDisconnectAlertRef.current = false;
    }
    prevDisconnectedCountRef.current = disconnectedCount;
    // Fire-gate: bara i intro-phase. Effekten triggas på phase-byten
    // (phase är i deps) så pending som sattes mid-quiz fyrar automatiskt
    // när host kommer till nästa GetReady.
    if (pendingDisconnectAlertRef.current && phase === 'intro') {
      pendingDisconnectAlertRef.current = false;
      Alert.alert('Please note', 'Some players connection unstable.');
    }
  }, [playerConnectionStatus, isHost, gameMode, phase]);

  // D-vi: detect-effect för host-disconnect-grace. Triggar grace när
  // non-host är i reveal-fas och host är markerad som disconnected i
  // peer-tracker. Cancel:s när antingen host återansluts ELLER phase
  // byter (= host:s question_advance kommit fram, normalt flow återupp-
  // taget). Pass-the-Phone bryr sig inte (gameMode-gate).
  useEffect(() => {
    if (isHost || gameMode !== 'individual-devices') return;
    const hostId = turnOrder[0]?.id;
    if (!hostId) return;
    const isHostDisconnected = playerConnectionStatus[hostId] === 'disconnected';
    const inReveal = phase === 'reveal';
    // Supprimera grace-timern om DJ:n (host) redan startat Spotify-låten —
    // host är AVSIKTLIGT utanför QuizVibe för att spela låten. Non-host
    // ska stanna i reveal och vänta tills host kommer tillbaka.
    if (isHostDisconnected && inReveal && !hostDisconnectGraceActive && !spotifyDJStarted) {
      hostDisconnectGraceStartRef.current = Date.now();
      setHostDisconnectGraceActive(true);
    } else if (
      (!isHostDisconnected || !inReveal) &&
      hostDisconnectGraceActive
    ) {
      hostDisconnectGraceStartRef.current = null;
      setHostDisconnectGraceActive(false);
      setHostDisconnectGraceCountdownSec(null);
    }
  }, [
    isHost,
    gameMode,
    turnOrder,
    playerConnectionStatus,
    phase,
    hostDisconnectGraceActive,
    spotifyDJStarted,
  ]);

  // D-vi: tick-effect — kör ENDAST när grace är aktiv. Var 250ms räknas
  // remaining; första 7 sek (>3s kvar) håller countdownSec null så bara
  // normal reveal-UI syns ("frozen reveal-state med feedback synlig"
  // per spec). Sista 3 sek (≤3s kvar) sätter countdownSec till 3/2/1
  // som driver big-number-overlay. Vid 0 sek → setPhase('intro') routar
  // till GetReady; cancel-grenen i detect-effect:en ovan rensar sedan
  // graceActive eftersom phase ändras.
  useEffect(() => {
    if (!hostDisconnectGraceActive) return;
    const interval = setInterval(() => {
      const start = hostDisconnectGraceStartRef.current;
      if (start === null) return;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 10_000 - elapsed);
      if (remaining <= 0) {
        hostDisconnectGraceStartRef.current = null;
        setHostDisconnectGraceActive(false);
        setHostDisconnectGraceCountdownSec(null);
        setPhase('intro');
      } else if (remaining <= 3_000) {
        setHostDisconnectGraceCountdownSec(Math.ceil(remaining / 1000));
      } else {
        // >3s kvar: ingen visuell countdown än, bara frozen reveal-UI.
        setHostDisconnectGraceCountdownSec((prev) =>
          prev === null ? prev : null,
        );
      }
    }, 250);
    return () => clearInterval(interval);
  }, [hostDisconnectGraceActive]);

  // Timer-progress-barens färg byter vid 10s (warning) och 5s (error).
  // Bar:ens BREDD drivs av timerProgressAnim (Animated.Value, RAF-driven).
  // Färgen styrs fortfarande av sekund-räknaren timeLeft eftersom färg-
  // tröskeln är vid hela sekunder.
  const timerColor = timeLeft > 10 ? Colors.primary : timeLeft > 5 ? Colors.warning : QUIZ_ERROR_RED;
  // Stopwatch:n (decimal-rutan) byter till en lugnare ljusblå ton så fort
  // användaren confirmat (awaiting) OCH stannar blå genom reveal-fasen så
  // den inte byter till varnings-röd när tiden går ut. Question-fasen
  // använder vanlig timerColor så användaren ser tidens-status normalt.
  const STOPWATCH_AWAITING_COLOR = '#8CC1FF';
  const stopwatchColor =
    phase === 'question' ? timerColor : STOPWATCH_AWAITING_COLOR;

  // Remote 1v1-gate: blockera ALLT spel-UI tills den auktoritativa fråge-
  // sekvensen laddats från remote_matches + ev. resume-seed är klar. Utan
  // gaten skulle den lokala shuffle-ordningen hinna visas (och i värsta
  // fall spelas) innan DB-sekvensen ersätter den. Fönstret är normalt
  // <1-2 s (host persisterar vid sin quiz-mount).
  if (isRemote && (!remoteQuestionIds || !remoteSessionReady)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md }}>
          <Text style={{ color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600' }}>
            Preparing 1vs1 match
          </Text>
          <SequentialDots color={Colors.warning} />
        </View>
      </SafeAreaView>
    );
  }

  // Get-Ready-skärmen renderas före quiz-UI:t. Vid spelstart för båda lägena,
  // och mellan rundor för Pass-the-phone (ej Individual Devices). Faller
  // tillbaka till 'You' om turnOrder skulle vara tom (defensiv — initial
  // phase-init filtrerar redan bort det fallet).
  if (phase === 'intro') {
    const currentPlayer = turnOrder[currentPlayerIndex] ?? {
      id: 'you',
      name: 'You',
      emoji: '🎮',
    };
    const playerCount = Math.max(1, turnOrder.length);
    const currentRound = Math.floor(questionIndex / playerCount) + 1;
    const currentQuestion = questionIndex + 1;
    // Kö-spelarnas runda och fråge-nummer räknas på den absoluta
    // question-positionen där just den spelaren faktiskt får sin tur
    // (questionIndex + 1 + i, 0-baserat). Cap:a på totalQuestions så
    // wrap-around-spelare i sista rundan som aldrig hinner spela försvinner
    // från listan helt — annars hade vi visat siffror som overshootar.
    // Alla tre arrays slicas parallellt så indexen håller ihop.
    const queueWithCounts = queue
      .map((p, i) => {
        const absoluteQuestion0 = questionIndex + 1 + i; // 0-baserat
        return {
          player: p,
          round: Math.floor(absoluteQuestion0 / playerCount) + 1,
          question: absoluteQuestion0 + 1, // 1-baserat
          withinBudget: absoluteQuestion0 < totalQuestions,
        };
      })
      .filter((entry) => entry.withinBudget);
    const introQueue = queueWithCounts.map((entry) => entry.player);
    const queueRoundNumbers = queueWithCounts.map((entry) => entry.round);
    const queueQuestionNumbers = queueWithCounts.map((entry) => entry.question);
    // Answer response time får BARA ändras vid round-boundary i Pass-the-
    // Phone-läget — dvs när nästa spelare = första i turordningen
    // (currentPlayerIndex === 0 = alla har svarat lika många gånger).
    // Individual Devices skippar intro mellan ronder så där är det alltid
    // adjustable när intro visas (typiskt bara vid game start).
    const responseSecondsLocked =
      gameMode === 'pass-the-phone' && currentPlayerIndex !== 0;
    // Pre-decode kommande image-fråga genom att mounta osynlig <Image>
    // redan i intro-fasen. iOS UIImageView avkodar 1920×1080 WebP
    // asynkront (typiskt 100–500 ms första gången) — utan pre-decode
    // visas pure-svart innan ProgressiveCover-mosaiken hinner reveal:a
    // tillräckligt för att bild bakom syns. Genom att rendera Image
    // tidigare (oavsett storlek) börjar RN:s image-cache decode-jobbet
    // direkt; samma source-require:t i question-fasen återanvänder
    // cachat bitmap. 1×1 px + opacity 0 → ingen visuell påverkan, men
    // räcker för att trigga decode-pipeline:n.
    const nextDJName: string | undefined =
      djRotationPlan &&
      spotifyEnabled &&
      effectiveMediaSourceByQuestion?.[questionIndex] === 'spotify'
        ? (getDJForQuestionIndex(djRotationPlan, questionIndex)?.name ?? undefined)
        : undefined;

    return (
      <View style={styles.touchWrap} onTouchStart={signalHostActivity}>
      <GetReadyIntro
        mode={gameMode}
        currentPlayer={currentPlayer}
        queue={introQueue}
        queueRoundNumbers={queueRoundNumbers}
        queueQuestionNumbers={queueQuestionNumbers}
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        playerCount={playerCount}
        mediaSourceByQuestion={effectiveMediaSourceByQuestion}
        categoryByQuestion={effectiveCategoryByQuestion}
        answerTypeByQuestion={effectiveAnswerTypeByQuestion}
        spotifyQuestionIndices={effectiveSpotifyQuestionIndices}
        nextDJName={nextDJName}
        eraFrom={eraFrom}
        eraTo={eraTo}
        answerResponseSeconds={responseSeconds}
        onAnswerResponseSecondsChange={(seconds) => {
          setResponseSeconds(seconds);
          // I IndDev broadcastar host:s ändring så non-host:s read-only-
          // display + nästa frågas timer-budget syncas. Pass-the-Phone
          // delar device → ingen broadcast behövs.
          if (
            gameMode === 'individual-devices' &&
            isHost &&
            syncChannelRef.current
          ) {
            syncChannelRef.current
              .broadcastResponseSecondsChanged({ seconds })
              .catch(() => {});
          }
        }}
        responseSecondsLocked={responseSecondsLocked}
        leaderboard={liveLeaderboard}
        // D-iii: per-peer connection-status driver disconnect-ikon framför
        // namnet i live-leaderboard. Tom map = ingen indikator.
        // Om lokal enhet är offline kan vi inte bedöma andras status —
        // heartbeats tappas och watchdog:n fyrar för alla peers. Skicka
        // tom map så ingen annan felaktigt visas under "Connection Unstable".
        playerConnectionStatus={connection.status === 'unstable' ? {} : playerConnectionStatus}
        // D-iii: unstable-overlay i intro-fasen styrs av sticky-latch +
        // live-monitor, så B fastnar i overlay genom alla phase-byten
        // tills Retry trycks. Bara non-host får Retry-knappen (host kan
        // inte bail:a mid-game eftersom det river broadcast-flödet).
        unstableLocked={shouldLockForUnstable}
        unstableCanRetry={!isConnectionUnstable && stickyUnstableForQuestion}
        onUnstableRetry={!isHost ? handleRetryFromUnstable : undefined}
        // D-iv: host:s egen audio-toggle i IndDev. Går via onPlayerAudioChange
        // (persist + broadcast) så host:s val överlever Play Again-carry-over.
        // Per-spelare-styrning finns inte i UI:t — varje enhet äger sitt ljud.
        // Lokalt solo-spel får INGEN callback → ingen rad: en spelare på en
        // enhet behöver ingen app-kontroll, enhetens volymknappar räcker.
        hostPlayerId={hostPlayerId}
        playerAudioOverrides={playerAudioOverrides}
        onPlayerAudioChange={isLocalSoloGame ? undefined : handlePlayerAudioChange}
        // Enhetens EGET ljud — remote 1v1 (båda spelarna) samt IndDev
        // non-host, som annars vore permanent tyst. Host i IndDev använder
        // onPlayerAudioChange ovan i stället, och PtP delar enhet så där
        // finns inget att styra → ingen callback, ingen rad. Värdet härleds
        // ur isAudioMutedForSelf så raden alltid speglar det som faktiskt
        // spelas (i remote är det identiskt med remoteAudioOn).
        selfAudioOn={!isAudioMutedForSelf}
        // selfPlayerId krävs i IndDev — utan id har handlern ingen nyckel att
        // skriva på, så raden skulle bli ett dött tap-mål. Saknas den (legacy-
        // payload/direkt-nav) döljs raden hellre än att ljuga om att den gör
        // något; isAudioMutedForSelf faller då tillbaka på ljud PÅ.
        onSelfAudioChange={
          gameMode === 'remote-1v1' ||
          (gameMode === 'individual-devices' && !isHost && !!selfPlayerId)
            ? handleSelfAudioChange
            : undefined
        }
        // I IndDev wrappar vi onReady så host:s tap också broadcastar
        // play_command till non-host:s enheter. Pass-the-Phone behöver
        // ingen wrapping (alla på samma enhet). Non-host i IndDev får
        // ändå inte tryck — knappen är dold via isHost-prop nedan.
        onReady={handleHostStartFromGetReady}
        // IndDev: enhetens egen spelare visas högerställd i top-bannern.
        // selfPlayerId sätts av båda Lobby-navigations-paths; host-fallback
        // till turnOrder[0] täcker direkt-nav/legacy-payload utan id.
        selfPlayerName={
          gameMode === 'individual-devices'
            ? (turnOrder.find((p) => p.id === selfPlayerId) ??
                (isHost ? turnOrder[0] : undefined))?.name
            : undefined
        }
        isHost={isHost}
        // LOKALA lägen: host får Quit Game (river rummet); non-host får
        // Leave Game (lämnar bara egen plats). Båda går ALDRIG via samma
        // codepath för cleanup eftersom non-host inte ska avsluta spelet
        // för andra.
        // REMOTE 1v1: båda rollerna får samma par — "Quit match"
        // (walkover åt motståndaren) + "Save & Exit" (resume inom 48h).
        onQuit={isRemote ? handleRemoteForfeit : isHost ? handleQuitGame : undefined}
        onLeave={!isRemote && !isHost ? handleLeaveGame : undefined}
        onSaveExit={isRemote ? handleRemoteSaveExit : undefined}
        quitLabel={isRemote ? 'Quit Game' : undefined}
      />
      {/* Pre-decode-trick borttaget 2026-05-27 — text-rendering kräver ingen
          asset-decode. När AI-tecknade sketches kommer på plats behöver vi
          återintroducera detta block för sketch-decode-preload. */}
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      {/* Ambient-slinga fortsätter sömlöst från Lobby-ljud under GetReady — ingen pulsering.
          Grindas ENBART på isAudioMutedForSelf, precis som appens tre övriga
          ljudkällor: den memon kodar redan hela policyn per läge (PtP alltid
          på, remote lokalt, IndDev via override med host=on/non-host=off som
          default). Ett extra isHost-villkor här skulle göra en non-host som
          slagit på sitt ljud halvt tyst. */}
      {!isAudioMutedForSelf && <MorseAmbientSound />}
      </View>
    );
  }

  // 3-2-1-nedräkning mellan tap på play-knappen i intro:n och fråge-vyn.
  // playerName + playerEmoji från turordningen så Pass-the-Phone-mode
  // anchorar nedräkningen till rätt spelare även medan telefonen lämnas över.
  if (phase === 'countdown') {
    const countdownPlayer = turnOrder[currentPlayerIndex];
    return (
      <View style={styles.touchWrap} onTouchStart={signalHostActivity}>
      <CountdownIntro
        mode={gameMode}
        playerName={countdownPlayer?.name}
        playerEmoji={countdownPlayer?.emoji}
        mediaSource={effectiveMediaSourceByQuestion[questionIndex] ?? null}
        answerType={effectiveAnswerTypeByQuestion[questionIndex] ?? null}
        category={effectiveCategoryByQuestion[questionIndex] ?? null}
        onComplete={() => setPhase('question')}
        finalWord={isImageQuestion || isActorSelectQuestion || isSpotifyNameQuestion ? 'Who' : isTimelineQuestion ? 'When' : undefined}
        // Talad nedräkning följer samma grind som övriga ljudkällor — se
        // MorseAmbientSound ovan för varför isHost inte hör hemma här.
        silent={isAudioMutedForSelf}
      />
      {/* Pre-decode-trick borttaget 2026-05-27 (text-rendering = no decode). */}
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      </View>
    );
  }

  // Leaderboard renderas UTANFÖR den övergripande ScrollView:n så dess sticky
  // footer (Home + Play Again) kan pinnas vid skärmens nederkant via flex —
  // läggs den inuti parent-scroll:n följer footer:n med upp när användaren
  // scrollar och blir inte längre alltid synlig.
  if (phase === 'leaderboard') {
    // Lokalt spel (ej remote): host:s Play Again ersätts av Home:s gula
    // "Start New Game" med invite-frågan före lägesvalet. Guest hosts ingår,
    // men bara på sin enda tillåtna omgång — vid guestReplaysUsed >= 1
    // faller de igenom till RoundLeaderboard:s "bara Home"-gren som förr.
    const localRematchFlow =
      isLastQuestion &&
      isHost &&
      !isRemote &&
      !(isGuestHostGame && guestReplaysUsed >= 1);
    const rematchTotalNonHosts = Math.max(0, turnOrder.length - 1);
    const rematchAllApproved =
      rematchTotalNonHosts === 0 ||
      playAgainApprovals.size >= rematchTotalNonHosts;
    // Bara Individual Devices behöver godkännande — i Pass-the-Phone sitter
    // alla på samma enhet och det finns ingen att vänta in.
    const rematchNeedsApproval =
      rematchInvite &&
      gameMode === 'individual-devices' &&
      rematchTotalNonHosts > 0;
    const rematchWaitingCount =
      rematchTotalNonHosts - playAgainApprovals.size;
    return (
      <SafeAreaView style={styles.safe} onTouchStart={signalHostActivity}>
        {inactivityCountdownSec !== null && (
          <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
        )}
        <RoundLeaderboard
          // Remote: motståndarens summary-rad ingår när de spelat klart, så
          // slutskärmen visar en riktig #1/#2-tabell med båda spelarna.
          players={leaderboardPlayers}
          roundScores={currentRoundScores}
          totalsByPlayerId={gameTotals}
          roundNumber={questionIndex + 1}
          totalRounds={totalQuestions}
          onNextRound={handleAdvanceToNextRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          onApprovePlayAgain={handleApprovePlayAgain}
          isLastRound={isLastQuestion}
          isHost={isHost}
          // Remote 1v1: Play Again döljs (asynkron duell har ingen replay-
          // koppling — nytt spel skapas från Lobby). guestHost=true +
          // replaysUsed=1 återanvänder guest-flödets "bara Home"-footer.
          guestHost={isGuestHostGame || isRemote}
          guestReplaysUsed={isRemote ? 1 : guestReplaysUsed}
          hostInitiatedPlayAgain={hostInitiatedPlayAgain}
          allRoundScoresHistory={allRoundScoresHistory}
          hcpChanges={isLastQuestion ? playerHcpChanges : undefined}
          remote1v1={isRemote}
          // Remote 1v1: gold "Start New Game" + Local/Remote-utfällning
          // (samma som Home) eftersom Play Again inte finns här. Bara på
          // sista frågans slutskärm och aldrig för guest hosts — remote
          // spelas enbart av QuizVibe-users, och lokal guest-host får
          // fortsatt sin egen "bara Home"-footer.
          onStartNewGame={
            isRemote && isLastQuestion && !isGuestHostGame
              ? handleStartNewGameFromFinal
              : localRematchFlow
                ? handleLocalStartNewGameSelect
                : undefined
          }
          // Lokalt flöde: tappet öppnar invite-frågan i stället för att
          // fälla ut lägesvalet direkt, så panelens öppet-läge ägs här.
          onStartNewGamePress={
            localRematchFlow ? handleLocalStartNewGamePress : undefined
          }
          startNewGameExpanded={
            localRematchFlow ? startNewGameExpanded : undefined
          }
          // Re-match: Local Play grå tills alla non-hosts godkänt, och
          // Remote Play dolt (lokala spelare kan inte bäras in i en duell).
          localPlayLocked={
            localRematchFlow && rematchNeedsApproval && !rematchAllApproved
          }
          onLocalPlayLockedPress={() =>
            Alert.alert(
              'Waiting for players',
              'The new lobby opens as soon as every player has approved the replay.',
            )
          }
          // Guest host: Remote Play visas ALDRIG — remote 1vs1 spelas enbart
          // mellan QuizVibe-users. Annars döljs den bara när föregående
          // spelare bärs över (de kan inte följa med in i en duell); single
          // player räknas som "invite" för att bära över egna settings men
          // har inget carry-over som krockar, så där står Remote kvar.
          hideRemotePlay={
            localRematchFlow &&
            (isGuestHostGame || (rematchInvite && rematchTotalNonHosts > 0))
          }
          startNewGameNote={
            localRematchFlow && rematchNeedsApproval ? (
              rematchAllApproved ? (
                <Text style={styles.playAgainModalStatusReadyText}>
                  ✓ All players have approved
                </Text>
              ) : (
                <View style={styles.playAgainModalStatusWaitingRow}>
                  <Text style={styles.playAgainModalStatusWaitingText}>
                    Waiting for {rematchWaitingCount} of {rematchTotalNonHosts}{' '}
                    {rematchTotalNonHosts === 1 ? 'player' : 'players'} to
                    approve
                  </Text>
                  <SequentialDots color={Colors.textSecondary} />
                </View>
              )
            ) : undefined
          }
          // ...men låst tills duellen faktiskt är avgjord. Den som blir klar
          // först ska inte kunna starta nästa match medan motståndaren
          // fortfarande spelar sin halva (48h-fönstret). Upplåst så fort
          // motståndaren finaliserat ELLER matchen avslutats på annat sätt
          // (walkover / void / forfeit) — då finns inget kvar att vänta på.
          startNewGameLocked={
            isRemote && !remoteOpponentSummary && !remoteMatchEnded
          }
          onStartNewGameLockedPress={() =>
            Alert.alert(
              'Waiting for your opponent',
              'You can start a new game as soon as both players have finished this match.',
            )
          }
          // Remote 1v1: duellstatus/resultat i en EGEN sektion UNDER
          // leaderboarden — den som når slutskärmen först ser sitt eget
          // resultat överst och därunder "Waiting for Player: X to play"
          // (live via Realtime) som flippar till W/L/D-banner när
          // motståndaren spelat klart.
          belowTable={
            isRemote && remoteMatchId && isLastQuestion ? (
              <RemoteMatchResultPanel matchId={remoteMatchId} />
            ) : undefined
          }
        />
        {/* Prisutdelnings-sekvensen. Ligger OVANPÅ den redan monterade
            slutskärmen och tonar bort för att avslöja den — så alla
            leaderboard-effekter (saveFinalGame, finalizePlayer, analytics)
            hinner köra medan sekvensen spelar.
            Gating på isLastQuestion är viktigt: phase kan bli 'leaderboard'
            även MELLAN ronder via footerns "Next Round →"-gren, och där ska
            ingen prisutdelning fyra. */}
        {isLastQuestion && !summaryDone && (
          <FinalCelebration highlights={matchHighlights} onDone={handleSummaryDone} />
        )}
        {/* Lock-overlay för non-host som tappat Approve Play Again men där
            host ännu inte hunnit skapa nya lobbyn. cancelable: false →
            ingen tap utanför card:en kan stänga; non-host väntar tills
            nextLobbyCode kommer in via syncChannel → useEffect navigerar
            dem automatiskt. Speglar LobbyScreen:s "Please Wait — Deleting
            this Lobby"-overlay i form och färgpalett. */}
        <Modal
          visible={awaitingNewLobby}
          transparent
          animationType="fade"
        >
          <View style={styles.waitingLobbyOverlay}>
            <View style={styles.waitingLobbyCard}>
              <View style={styles.waitingLobbyTextRow}>
                <Text style={styles.waitingLobbyText}>
                  Please Wait — Host is creating new game
                </Text>
                <SequentialDots />
              </View>
            </View>
          </View>
        </Modal>

        {/* ⚠ DORMANT sedan 2026-08-08 — öppnas bara av `handlePlayAgain`,
            som inte längre nås (host kör "Start New Game"-flödet där
            approval-statusen visas som grå Local Play + statusrad i
            utfällningen istället). Behålls som referens.

            Re-use-players-modal för host (Individual Devices) — ersätter
            Alert.alert så vi kan rendera "Yes, keep them" som utgråad
            tills alla non-hosts har broadcastat sin Approve-signal.
            totalNonHosts = turnOrder.length - 1 (host vid index 0).
            allApproved = alla non-hosts har broadcastat in. */}
        {(() => {
          const totalNonHosts = Math.max(0, turnOrder.length - 1);
          const approvedCount = playAgainApprovals.size;
          const allApproved = totalNonHosts === 0 || approvedCount >= totalNonHosts;
          const waitingPlayers = totalNonHosts - approvedCount;
          return (
            <Modal
              visible={playAgainModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setPlayAgainModalVisible(false)}
            >
              <View style={styles.playAgainModalOverlay}>
                <View style={styles.playAgainModalCard}>
                  <Text style={styles.playAgainModalTitle}>
                    Re-use all players?
                  </Text>
                  <Text style={styles.playAgainModalBody}>
                    Start the next room with the same players, or begin fresh?
                  </Text>
                  {totalNonHosts > 0 && (
                    <View style={styles.playAgainModalStatus}>
                      {allApproved ? (
                        <Text style={styles.playAgainModalStatusReadyText}>
                          ✓ All players have approved
                        </Text>
                      ) : (
                        <View style={styles.playAgainModalStatusWaitingRow}>
                          <Text style={styles.playAgainModalStatusWaitingText}>
                            Waiting for {waitingPlayers} of {totalNonHosts}{' '}
                            {totalNonHosts === 1 ? 'player' : 'players'} to approve
                          </Text>
                          <SequentialDots color={Colors.textSecondary} />
                        </View>
                      )}
                    </View>
                  )}
                  <View style={styles.playAgainModalActions}>
                    <Pressable
                      onPress={() => setPlayAgainModalVisible(false)}
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        styles.playAgainModalBtnCancel,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.playAgainModalBtnTextCancel}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPlayAgainModalVisible(false);
                        goToNewLobby(false);
                      }}
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        styles.playAgainModalBtnSecondary,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.playAgainModalBtnTextSecondary}>
                        Start fresh
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={
                        allApproved
                          ? () => {
                              setPlayAgainModalVisible(false);
                              // Guest host: hoppa Keep/Reset-prompten —
                              // settings är låsta, carry:a alltid.
                              if (isGuestHostGame) {
                                goToNewLobby(true, true);
                              } else {
                                askKeepSettingsThenGo();
                              }
                            }
                          : undefined
                      }
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        allApproved
                          ? styles.playAgainModalBtnPrimary
                          : styles.playAgainModalBtnDisabled,
                        allApproved && pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={
                          allApproved
                            ? styles.playAgainModalBtnTextPrimary
                            : styles.playAgainModalBtnTextDisabled
                        }
                      >
                        Yes, keep them
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          );
        })()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} onTouchStart={signalHostActivity}>
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      {/* D-vi: 3-2-1-countdown-overlay sista 3 sek av host-disconnect-grace
          (sec 7-10 efter reveal-start, när host inte svarat på question_
          advance). pointerEvents='none' så reveal-UI:t bakom fortsatt
          interaktivt — användaren kan inte avbryta countdown:n (host
          måste reconnecta + advance:a, eller låta countdown:n nå 0). */}
      {hostDisconnectGraceCountdownSec !== null && (
        <View style={styles.graceCountdownOverlay} pointerEvents="none">
          <View style={styles.graceCountdownCard}>
            <Text style={styles.graceCountdownLabel}>
              Host disconnected — returning to lobby in
            </Text>
            <Text style={styles.graceCountdownNumber}>
              {hostDisconnectGraceCountdownSec}
            </Text>
          </View>
        </View>
      )}
      {/* Fixed-top zone — media + timer + question card är ALLTID synliga.
          Tidigare låg alla element i en enda ScrollView vilket lät spelaren
          scrolla bort media+timer när de letade bland prefix-knappar.
          Layout nu: [fixed-top: media+timer+question] + [ScrollView: bara
          answer-block + reveal-feedback] + [sticky-bottom: Confirm-bar]. */}
      <View style={styles.fixedTopZone}>
        {/* Hjärtslag enbart för Hints-frågor under aktiv svarstid.
            YT- och Spotify-frågor är tysta i quiz-vyn. Grindas ENBART på
            isAudioMutedForSelf — se MorseAmbientSound i intro-vyn. */}
        {!isAudioMutedForSelf && isImageQuestion && (phase === 'question' || phase === 'awaiting') && (
          <HeartbeatSound bpm={80} />
        )}
          {/* phase är här narrowed till 'question' | 'awaiting' | 'reveal'
            (leaderboard fångas av early-return ovan), så ingen extra
            phase-check behövs runt question UI. */}
            {/* MediaPlayer — provider-agnostisk dispatcher som väljer rätt
                impl (YouTube/None) baserat på pickMediaSource. Stuben
                i Expo Go visar thumbnail + clip-meta; Phase 4 byter den mot
                en riktig WebView-baserad player utan att röra detta call-
                site. isPlaying håller på genom hela question→awaiting→reveal-
                cykeln (uppspelningen fortsätter tills Next-tab trycks per
                tidigare UX-spec). showVideo gömmer video-frame:n under
                question/awaiting (annars ger thumbnail visuella ledtrådar
                till svaret) och visar den vid reveal. */}
            {/* ── Spotify DJ-fråga (V1 — Interactive DJ & Player Flow) ──────────
                V1-flöde: DJ stannar i Spotify hela rundan. Host (eller reserv)
                aktiverar timern. Vanliga gissare lyssnar och svarar.
                Tre roller:
                  DJ (isCurrentPlayerDJ): steg-guide + "Start track in Spotify"-
                    knapp. Stannar i Spotify tills gruppen kallar tid.
                    Steg 0: "Start track in Spotify"
                    Steg 1: "Stay in Spotify" (timer ej startad)
                    Steg 2: "Timer counting down" (timer aktiv)
                    Steg 3: "Pause and come back" (reveal)
                    Steg 4: "End DJ" tryckt (djHandedOver)
                  Timer-aktiverare (isTimerActivator): Q-logo + "Activate Timer".
                  Vanlig gissare: Q-logo, väntar på att timern aktiveras. */}
            {isSpotifyQuestion ? (
              isCurrentPlayerDJ ? (
                /* ── DJ-vyn: steg-guide ────────────────────────────────── */
                (() => {
                  const djStep = !spotifyDJOpenedApp ? 0 : !spotifyDJStarted ? 1 : djHandedOver ? 4 : djDismissedOverlay ? 4 : phase === 'reveal' ? 3 : 2;
                  return (
                    <View style={styles.spotifyDJCard}>
                      <View style={styles.spotifyDJIconRow}>
                        <SpotifyBrandIcon size={28} variant="white" />
                        <Text style={styles.spotifyDJLabel}>You are the DJ</Text>
                      </View>
                      <View style={styles.spotifyGuideSection}>
                        {SPOTIFY_DJ_STEPS.map((step, i) => {
                          const isDone = i < djStep;
                          const isActive = i === djStep;
                          return (
                            <View key={i} style={styles.spotifyGuideStep}>
                              <View style={[styles.spotifyGuideNum, isActive && styles.spotifyGuideNumActive, isDone && styles.spotifyGuideNumDone]}>
                                <Text style={[styles.spotifyGuideNumText, isActive && styles.spotifyGuideNumTextActive, isDone && styles.spotifyGuideNumTextDone]}>
                                  {isDone ? '✓' : i + 1}
                                </Text>
                              </View>
                              <Text style={[styles.spotifyGuideText, { flex: 0, flexShrink: 1 }, isActive && styles.spotifyGuideTextActive, isDone && styles.spotifyGuideTextDone]}>{renderStepText(step)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })()
              ) : (
                /* ── Q-logo-vyn (gissare + host) ────────────────────────── */
                <View style={styles.spotifyQLogoCard}>
                  <QuizVibeLogo size={90} />
                  {/* Status-rad: visas bara vid error-states + djStep=0 (väntar på DJ).
                      Övriga steg kommuniceras via den numrerade guide-listan nedan. */}
                  {(spotifyWaitPhase === 'skipped' || spotifyWaitPhase === 'countdown' || !spotifyDJOpenedAppBroadcast) && (
                    <View style={styles.spotifyStatusRow}>
                      <SpotifyBrandIcon size={14} variant="white" />
                      <Text style={styles.spotifyStatusText}>
                        {spotifyWaitPhase === 'skipped'
                          ? 'Track skipped — DJ didn\'t start'
                          : spotifyWaitPhase === 'countdown'
                            ? `DJ not responding — skipping in ${spotifyTimeoutSeconds}s…`
                            : `Waiting — ${currentDJPlayer?.name ?? 'DJ'} will start Spotify`}
                      </Text>
                    </View>
                  )}
                  {isHost && spotifyWaitPhase !== 'skipped' && phase === 'question' && (
                    <Pressable
                      onPress={handleHostSkipSpotifyQuestion}
                      style={({ pressed }) => [styles.spotifySkipBtn, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={styles.spotifySkipBtnText}>Skip question  →</Text>
                    </Pressable>
                  )}
                  {/* "Activate Timer"-knappen är borttagen härifrån — den
                      visas nu som stor sticky CTA i botten av skärmen. */}
                  {spotifyWaitPhase !== 'skipped' && spotifyWaitPhase !== 'countdown' && (() => {
                    const activeStep = !spotifyDJOpenedAppBroadcast ? 0
                      : !spotifyDJStarted ? 1
                      : djHandedOver ? 4
                      : phase !== 'reveal' ? 2
                      : 3;
                    return (
                      <View style={styles.spotifyGuideSection}>
                        {SPOTIFY_NON_DJ_STEPS.map((step, i) => {
                          const isDone = i < activeStep;
                          const isActive = i === activeStep;
                          return (
                            <View key={i} style={styles.spotifyGuideStep}>
                              <View style={[styles.spotifyGuideNum, isActive && styles.spotifyGuideNumActive, isDone && styles.spotifyGuideNumDone]}>
                                <Text style={[styles.spotifyGuideNumText, isActive && styles.spotifyGuideNumTextActive, isDone && styles.spotifyGuideNumTextDone]}>
                                  {isDone ? '✓' : i + 1}
                                </Text>
                              </View>
                              <Text style={[styles.spotifyGuideText, { flex: 0, flexShrink: 1 }, isActive && styles.spotifyGuideTextActive, isDone && styles.spotifyGuideTextDone]}>{renderStepText(step)}</Text>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>
              )
            ) : isImageQuestion ? (
              <View style={styles.imageMediaCard}>
                <HintsQuizCard
                  key={questionIndex}
                  library={question.type === 'image' ? question.hints : undefined}
                  displayName={question.type === 'image' ? question.displayName : ''}
                  contentSubject={question.type === 'image' ? question.source.contentSubject : undefined}
                  resetKey={questionIndex}
                  totalSeconds={responseSeconds}
                  assistance={currentAssistance}
                  playerBirthYear={(() => {
                    const p =
                      gameMode === 'individual-devices' && selfPlayerId
                        ? turnOrder.find((tp) => tp.id === selfPlayerId)
                        : turnOrder[currentPlayerIndex];
                    return p?.age ? new Date().getFullYear() - p.age : 1990;
                  })()}
                  isRevealed={phase === 'reveal'}
                  hintsActive={hintsReady}
                  mosaicActive={timerActive}
                  hintsSeed={seedForRemoteQuestion(question.id)}
                />
              </View>
            ) : youtubeError ? (
              <View style={styles.youtubeErrorCard}>
                <Text style={styles.youtubeErrorIcon}>⚠</Text>
                <Text style={styles.youtubeErrorTitle}>Video unavailable</Text>
                <Text style={styles.youtubeErrorSub}>Skipping to result…</Text>
              </View>
            ) : (
              <MediaPlayer
                source={mediaSource}
                isPlaying={
                  phase === 'question' ||
                  phase === 'awaiting' ||
                  phase === 'reveal'
                }
                // Film-trailer (actor-select) visar video alltid — spelaren
                // ska se klippet för att gissa skådespelaren. Musik (timeline)
                // döljer videon under frågan för att undvika år-spoilers i
                // YouTube-titeln.
                showVideo={isActorSelectQuestion ? true : phase === 'reveal'}
                // isAudioMutedForSelf (INTE !isHost): remote 1v1 spelar ljud
                // lokalt på båda enheterna, PtP delar enhet, och i IndDev är
                // det host:s per-spelare-override som avgör.
                isMuted={isAudioMutedForSelf}
                onError={handleYoutubeError}
              />
            )}

            {/* Horisontell timer-progress-bar — krymper från 100% → 0% över
                30s, byter färg vid 10s/5s, pulserar i opacity vid ≤5s. Fryses
                vid sin sista bredd när phase=reveal (interval clear:as i
                handleConfirm). Sekunderna kvar visas till höger som ett
                tabular-nums-värde i samma färg som baren. */}
            <View style={styles.timerSection}>
              <View style={styles.timerTrack}>
                {/* Yttre pulse-wrapper håller opacity (native driver). Inre
                    fill håller width (JS driver). Måste separeras på olika
                    Animated.Views — annars markerar native driver noden
                    som "owned" och JS-driver-uppdatering av width kraschar
                    med "Attempting to run JS driven animation on animated
                    node that has been moved to native". */}
                <Animated.View
                  style={[styles.timerFillPulseWrap, { opacity: pulseAnim }]}
                >
                  <Animated.View
                    style={[
                      styles.timerFill,
                      {
                        // Bredden interpoleras från Animated.Value (0 → 1) till
                        // procent (0 % → 100 %) — RAF-driven, så bar:en rör sig
                        // smooth varje frame även när JS-tråden är upptagen med
                        // Confirm-handlerns batch av setStates.
                        width: timerProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: timerColor,
                      },
                    ]}
                  />
                </Animated.View>
                {/* Timer-bar avatar-markörer.
                    - Pass-the-Phone: en markör för current player vid
                      sin confirm-position (timerFill krymper bakom).
                    - Individual Devices: en markör per turnOrder-spelare.
                      Confirmade spelare har fast left% baserat på sin
                      time_used; ej-confirmade rör sig med timerProgressAnim
                      (rätta kanten av krympande fyllningen). Spelare som
                      lämnat (hasLeft) döljs. Vertikal stagger per index så
                      ej-confirmade avatarer som ligger på samma x ändå syns. */}
                {gameMode === 'pass-the-phone'
                  ? confirmedTimeUsed !== null && !(isSpotifyQuestion && isCurrentPlayerDJ) && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.timerMarker,
                          {
                            left: `${
                              ((responseSeconds - confirmedTimeUsed) /
                                responseSeconds) *
                              100
                            }%`,
                          },
                        ]}
                      >
                        {turnOrder[currentPlayerIndex]?.avatarUri ? (
                          <Image
                            source={{
                              uri: turnOrder[currentPlayerIndex].avatarUri,
                            }}
                            style={styles.timerMarkerAvatar}
                          />
                        ) : (
                          <View style={styles.timerMarkerFallback}>
                            <Text style={styles.timerMarkerEmoji}>
                              {turnOrder[currentPlayerIndex]?.emoji ?? '👤'}
                            </Text>
                          </View>
                        )}
                      </View>
                    )
                  : turnOrder
                      .filter((p) => !leftPlayerIds.has(p.id))
                      .map((p, idx) => {
                        const used = playerConfirms[p.id];
                        const isConfirmed = used !== undefined;
                        const topOffset = -11 + idx * 4;
                        if (isSpotifyQuestion && currentDJPlayer?.id === p.id) {
                          return null;
                        }
                        const avatarNode = p.avatarUri ? (
                          <Image
                            source={{ uri: p.avatarUri }}
                            style={styles.timerMarkerAvatar}
                          />
                        ) : (
                          <View style={styles.timerMarkerFallback}>
                            <Text style={styles.timerMarkerEmoji}>
                              {p.emoji ?? '👤'}
                            </Text>
                          </View>
                        );
                        if (isConfirmed) {
                          return (
                            <View
                              key={p.id}
                              pointerEvents="none"
                              style={[
                                styles.timerMarker,
                                {
                                  top: topOffset,
                                  left: `${
                                    ((responseSeconds - used) /
                                      responseSeconds) *
                                    100
                                  }%`,
                                },
                              ]}
                            >
                              {avatarNode}
                            </View>
                          );
                        }
                        return (
                          <Animated.View
                            key={p.id}
                            pointerEvents="none"
                            style={[
                              styles.timerMarker,
                              {
                                top: topOffset,
                                left: timerProgressAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0%', '100%'],
                                }),
                              },
                            ]}
                          >
                            {avatarNode}
                          </Animated.View>
                        );
                      })}
              </View>
              {/* Höger-siffran sitter i en pulserande ring vars border-färg
                  ärvs från timerColor. Halo:n bakom ger glow på Android som
                  saknar shadowColor-stöd; iOS får dessutom shadow via
                  timerRingHalo:s skugga. */}
              <Animated.View
                style={[
                  styles.timerRingWrap,
                  { transform: [{ scale: timerRingPulse }] },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.timerRingHalo,
                    { backgroundColor: timerColor, opacity: timerRingGlow },
                  ]}
                />
                <View style={[styles.timerRing, { borderColor: timerColor }]}>
                  <Animated.Text
                    style={[
                      styles.timerRingNum,
                      { color: timerColor, opacity: pulseAnim },
                    ]}
                  >
                    {timeLeft}
                  </Animated.Text>
                </View>
              </Animated.View>
            </View>

            {/* 2-decimal countdown under timer-bar:en. Döljs för DJ på Spotify-
                frågor — DJ svarar inte och har ingen svarstid att visa. */}
            {!(isSpotifyQuestion && isCurrentPlayerDJ) && <View style={styles.decimalTimerWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.decimalTimerHalo,
                  { backgroundColor: timerColor, opacity: timerRingGlow },
                ]}
              />
              <View style={[styles.decimalTimerBox, { borderColor: stopwatchColor }]}>
                {/* Wrap-View med integer-höjd centrerar SVG:n vertikalt
                    relativt den stora sekund-siffran (38 px lineHeight). */}
                <View style={styles.decimalTimerIconWrap}>
                  <StopwatchIcon size={qh(32)} color={stopwatchColor} />
                </View>
                <Text style={[styles.decimalTimerInt, { color: stopwatchColor }]}>
                  {String(Math.floor(decimalElapsedMs / 1000)).padStart(2, '0')}
                </Text>
                <Text style={[styles.decimalTimerDec, { color: Colors.textSecondary }]}>
                  .{String(Math.floor((decimalElapsedMs % 1000) / 10)).padStart(2, '0')}
                </Text>
              </View>
            </View>}

            <View style={styles.questionCard}>
              {/* Top-rad: Question-räkneverk vänster + Answering-pillen höger.
                  Pass-the-Phone-only — Individual Devices har spelaren på
                  egen enhet och vet redan vem de är. */}
              <View style={styles.questionTopRow}>
                <Text style={styles.questionMeta}>
                  Question {questionIndex + 1} of {totalQuestions}
                </Text>
                {gameMode === 'pass-the-phone' && currentPlayerName && (
                  <View style={styles.answeringStack}>
                    <Text style={styles.answeringLabel}>Answering:</Text>
                    <Text style={styles.answeringPlayerName} numberOfLines={1}>
                      {currentPlayerName}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.questionTextWrap, isCurrentPlayerDJ && { opacity: 0.3 }]}>
                {/* Frågetexten renderas som ett enskilt Text-element med
                    inline-highlight på nyckelordet (Year/Name/City/Country)
                    via nested Text-styling. Bara nyckelordet är stort; resten
                    är vanlig läs-storlek. Detta håller frågekortet kompakt
                    (1-2 rader istället för tidigare 2-3-rader-split) och styr
                    blicken direkt till frågans semantiska anker.
                    Regex är case-insensitive + \b-ordsgränser så vi inte
                    matchar substrings (t.ex. "Yearly"). Första matchen
                    highlightas; resterande förekomster (sällsynt) lämnas
                    orörda. */}
                {(() => {
                  // Spotify Name-frågor har fel bakat questionText ("Which Year…")
                  // eftersom de är song-items. Visa rätt text för svarstypen.
                  const displayQuestionText = isSpotifyNameQuestion
                    ? 'What is the Name of this Artist/Band?'
                    : question.question;
                  const match = displayQuestionText.match(
                    /^(.*?)\b(Year|Name|City|Country)\b(.*)$/i,
                  );
                  // Spotify-frågor: kompakt en-rad-format (mer plats åt prefix-rutor)
                  const isSpotifyQ = isSpotifyQuestion || isSpotifyNameQuestion;
                  const compactText = isSpotifyQ
                    ? { fontSize: 16, lineHeight: 22 }
                    : undefined;
                  const compactHeadline = isSpotifyQ
                    ? { fontSize: 24 }
                    : undefined;
                  if (match) {
                    const [, before, keyword, after] = match;
                    // Tvinga versal begynnelsebokstav på keyword oavsett hur det
                    // står i FIXED_QUESTION_TEXT (city/country är lowercase i
                    // matrisen men ska visuellt vara "City"/"Country" som
                    // semantisk titel).
                    const capitalized =
                      keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
                    return (
                      <Text style={[styles.questionText, compactText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {before}
                        <Text style={[styles.questionTextHeadline, compactHeadline]}>{capitalized}</Text>
                        {after}
                      </Text>
                    );
                  }
                  return (
                    <Text style={[styles.questionText, compactText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{displayQuestionText}</Text>
                  );
                })()}
              </View>
            </View>
      </View>
      {/* Scroll-zone — wrappar BARA svar-blocket (TimelineSelector eller
          ImageAnswerBlock) + reveal-feedback. ScrollView:s flex: 1 låter den
          ta resterande höjd mellan fixed-top och sticky-Confirm-bar. */}
      <ScrollView
        style={styles.scrollZone}
        contentContainerStyle={styles.scrollZoneContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScrollHintScroll}
        scrollEventThrottle={32}
      >
            {/* Svarsmetod beror på fråge-typ:
                • timeline → TimelineSelector (år-svar)
                • image    → ImageAnswerBlock (Letter Grid → Final Selection)
                Disabled-states följer phase: båda låsta i awaiting + reveal
                så svar inte kan ändras efter Confirm. */}
            {/* DJ correct-year-ruta: direkt under question-card, utanför scroll-zonen */}
            {/* DJ-vy i scroll-zonen: steg 0 + 1 centrerade där TimelineSelector annars sitter.
                'awaiting' ingår som render-försvar (2026-07-27): en DJ kan aldrig
                legitimt nå awaiting (canConfirm=false för DJ), men om fas-maskinen
                fastnar i stale awaiting (missad question_advance) ska DJ-CTA:n ändå
                visas — DJ-enhetens fas är i praktiken irrelevant för DJ-rollen. */}
            {question.type === 'timeline' && isCurrentPlayerDJ && (phase === 'question' || phase === 'awaiting' || (phase === 'reveal' && !djDismissedOverlay)) && (
              <View style={[styles.spotifyDJScrollZone, phase === 'reveal' && { paddingTop: Spacing.xl }]}>
                {phase === 'reveal' ? (
                  // Reveal-fas för DJ: Open Spotify (fortsätt uppspelning) + OR + bekräfta stopp
                  <>
                    <Animated.View style={nextTabPulseStyle}>
                      <Pressable
                        style={[styles.spotifyDJActionBtn, { flex: 0, paddingHorizontal: Spacing.xl }]}
                        onPress={() => openSpotifyApp()}
                      >
                        <SpotifyBrandIcon size={20} variant="white" />
                        <Text style={styles.spotifyDJActionBtnText}>Open Spotify</Text>
                      </Pressable>
                    </Animated.View>
                    <Text style={styles.djOrSeparatorText}>OR</Text>
                    <Animated.View style={nextTabPulseStyle}>
                      <TouchableOpacity
                        style={styles.djStopConfirmInlineBtn}
                        onPress={() => {
                          setDjDismissedOverlay(true);
                          // Host behöver inte trycka "End DJ" separat — handover sker direkt.
                          // Non-host DJ får "End DJ"-knappen via revealNextAbsolute istället.
                          if (isHost) handleDJHandover();
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.djStopConfirmInlineBtnText}>Spotify song has been stopped</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                ) : !spotifyDJOpenedApp ? (
                  // djStep=0: primär CTA — öppna Spotify och starta spåret.
                  // Låttitel + artist direkt under knappen. Ingen spoiler-risk —
                  // DJ:n svarar aldrig (canConfirm=false) och ser ändå låten i
                  // Spotify. Kritisk när autoplay misslyckas (varm Spotify-
                  // session, typiskt direkt efter Play Again när förra spelets
                  // låt ligger kvar pausad i mini-playern): utan titeln vet
                  // DJ:n inte VILKEN låt som ska sökas/startas manuellt.
                  <DJTrackCard hint={currentQ?.type === 'timeline' ? currentQ.hint : null} trackId={currentSpotifyTrackId}>
                    <Animated.View style={{ width: '50%', transform: [{ scale: djStartPulse }] }}>
                      <Animated.View
                        pointerEvents="none"
                        style={[styles.djStartHalo, { opacity: djStartGlow }]}
                      />
                      <Pressable
                        style={[styles.spotifyDJActionBtn, { flex: 0 }]}
                        onPress={handleStartSpotifyTrack}
                      >
                        <Text style={[styles.spotifyDJActionBtnText, { fontSize: FontSize.xl }]}>Start track in Spotify</Text>
                        <View style={{ marginLeft: -16 }}>
                          <SpotifyBrandIcon size={30} variant="white" />
                        </View>
                      </Pressable>
                    </Animated.View>
                  </DJTrackCard>
                ) : !spotifyDJStarted ? (
                  // djStep=1: DJ har öppnat Spotify men timern är INTE aktiverad
                  // än. Re-öppna TRACK-länken (inte bara appen): om autoplay
                  // misslyckades — typiskt varm Spotify-session direkt efter
                  // Play Again där förra spelets låt ligger kvar pausad i mini-
                  // playern — behöver DJ:n en väg tillbaka till rätt låt-sida.
                  // Omstart från början är ofarlig innan timern aktiverats
                  // (gissarnas klocka har inte börjat ticka).
                  <DJTrackCard hint={currentQ?.type === 'timeline' ? currentQ.hint : null} trackId={currentSpotifyTrackId}>
                    <Pressable
                      style={[styles.spotifyDJActionBtn, { flex: 0, paddingHorizontal: Spacing.xl }]}
                      onPress={() => {
                        if (currentSpotifyTrackId) openSpotifyTrack(currentSpotifyTrackId);
                      }}
                    >
                      <SpotifyBrandIcon size={20} variant="white" />
                      <Text style={styles.spotifyDJActionBtnText}>Open track in Spotify</Text>
                    </Pressable>
                  </DJTrackCard>
                ) : (
                  // djStep=2: timern rullar — använd openSpotifyApp (inte
                  // openSpotifyTrack) så låten INTE startar om från början
                  // utan fortsätter spelas. Samma track-kort-ram med artist +
                  // titel som steg 0/1 så DJ:n hela tiden ser vilken låt som
                  // ska spelas.
                  <DJTrackCard hint={currentQ?.type === 'timeline' ? currentQ.hint : null} trackId={currentSpotifyTrackId}>
                    <Pressable
                      style={[styles.spotifyDJActionBtn, { flex: 0, paddingHorizontal: Spacing.xl }]}
                      onPress={() => openSpotifyApp()}
                    >
                      <SpotifyBrandIcon size={20} variant="white" />
                      <Text style={styles.spotifyDJActionBtnText}>Open Spotify</Text>
                    </Pressable>
                  </DJTrackCard>
                )}
              </View>
            )}
            {isSpotifyNameQuestion && spotifyNameVariant && !isCurrentPlayerDJ && (spotifyDJStarted || phase === 'reveal') ? (
              // Spotify Name-fråga: gissa artistnamnet via Letter Grid.
              // Döljs helt tills DJ aktiverat timern (spotifyDJStarted=true).
              // reveal-grenen visas alltid (isTimedOut-hantering inuti komponenten).
              <View
                pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
              >
                <ImageAnswerBlock
                  question={spotifyNameVariant}
                  phase={phase}
                  pendingName={pendingNameOption}
                  confirmedName={confirmedNameOption}
                  isTimedOut={phase === 'reveal' && confirmedNameOption === null}
                  onNameSelect={setPendingNameOption}
                  resetKey={`spotify-name-${questionIndex}-${currentAssistance}`}
                />
              </View>
            ) : question.type === 'timeline' && !isCurrentPlayerDJ && !isSpotifyNameQuestion && (!isSpotifyQuestion || spotifyDJStarted || effectiveDJId === null) ? (
              <TimelineSelector
                key={`${questionIndex}-${currentAssistance}`}
                assistance={currentAssistance}
                eraFrom={eraFrom}
                eraTo={eraTo}
                onYearChange={setPendingYear}
                // D-iii: vid unstable spelaren får inte avge svar. Reuse
                // existerande disabled-prop:s phase-gating + OR:a in
                // connection-status så låsningen sker både post-Confirm
                // OCH vid network-blip.
                disabled={
                  phase === 'awaiting' || phase === 'reveal' || shouldLockForUnstable
                }
              />
            ) : question.type === 'actor-select' ? (
              <View
                pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
              >
                <ActorSelectBlock
                  correctNames={question.correctNames}
                  distractorNames={question.distractorNames}
                  phase={phase}
                  pendingName={pendingActorName}
                  confirmedName={confirmedActorName}
                  isTimedOut={phase === 'reveal' && confirmedActorName === null}
                  onNameSelect={setPendingActorName}
                  resetKey={questionIndex}
                  assistance={currentAssistance}
                  movieTitle={question.displayName}
                  movieYear={question.correctYear}
                  optionsSeed={seedForRemoteQuestion(question.id)}
                />
              </View>
            ) : imageVariant ? (
              // Variant byggdes runtime via `imageVariant`-useMemo ovan.
              // D-iii: ImageAnswerBlock har ingen egen disabled-prop —
              // wrappa i View med pointerEvents='none' + dimmad opacity
              // när connection är unstable. Komponenten själv behåller
              // sin phase-baserade låsning oförändrat.
              <View
                pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
              >
                <ImageAnswerBlock
                  question={imageVariant}
                  phase={phase}
                  pendingName={pendingNameOption}
                  confirmedName={confirmedNameOption}
                  isTimedOut={phase === 'reveal' && confirmedNameOption === null}
                  onNameSelect={setPendingNameOption}
                  resetKey={`${questionIndex}-${currentAssistance}`}
                />
              </View>
            ) : null}

            {/* Inline reveal-feedback: green vid rätt, red vid fel. Visas
                ENDAST i 'reveal'-fasen (= efter timer hit 0) — under awaiting
                hålls feedbacken dold trots att svaret redan är låst, så
                tidiga svarare inte får facit före sena.
                  • timeline: "Correct year: xxxx" — användarens val syns i låst TimelineSelector.
                  • image:    SKIPPAS — ImageAnswerBlock renderar Correct/Wrong-
                    badges direkt på spelarens (och rätta) namn-kort istället
                    så reveal-state syns inline i svarsrutan. */}
            {phase === 'reveal' && isSpotifyNameQuestion && isCurrentPlayerDJ && question.type === 'timeline' && (() => {
              // DJ på Spotify/Name-fråga: Letter Grid visas inte för DJ →
              // rendera ett reveal-kort med artistnamnet.
              const artistName = question.hint?.split(' — ').pop()?.trim() ?? null;
              if (!artistName) return null;
              const hintTitle = question.hint ?? '';
              return (
                <View style={rv.container}>
                  <Animated.View
                    style={[
                      rv.feedbackCard,
                      rv.feedbackCorrect,
                      { transform: [{ scale: revealScale }], opacity: revealOpacity },
                    ]}
                  >
                    <Text style={rv.feedbackCorrectYear}>
                      {'Correct Name: '}
                      <Text style={rv.feedbackCorrectYearBold}>{artistName}</Text>
                    </Text>
                    <Text style={rv.feedbackSongMeta} numberOfLines={1} ellipsizeMode="tail">
                      {`${question.correctYear} · ${hintTitle}`}
                    </Text>
                  </Animated.View>
                </View>
              );
            })()}
            {phase === 'reveal' && question.type === 'timeline' && (() => {
              // Name-svar (non-DJ): ImageAnswerBlock renderar inline reveal (badges per prefix-rad) → skippa kort
              // DJ på Spotify/Name renderas av blocket ovanför
              if (isSpotifyNameQuestion) return null;
              if (!isSpotifyQuestion && !isSpotifyNameQuestion && selectedYear === null) return null;

              // confirmedCorrect sätts i handleConfirm och vid time-out — robust
              // mot att selectedYear nollställs av play_command-reset efter confirm.
              const wasCorrect = isCurrentPlayerDJ ? true : (confirmedCorrect ?? false);

              // Spotify/Name → visa "Correct: [Artist]", Spotify/Year → "Correct year: [Year]"
              // Gäller för ALLA (DJ och non-DJ). isSpotifyNameQuestion fångas tidigt ovan
              // men Spotify/Year når hit och ska behandlas identiskt med vanlig Year-fråga.
              const correctLabel = 'Correct year:';
              const correctValue = String(question.correctYear);
              return (
                <View style={rv.container}>
                  <Animated.View
                    style={[
                      rv.feedbackCard,
                      wasCorrect ? rv.feedbackCorrect : rv.feedbackWrong,
                      { transform: [{ scale: revealScale }], opacity: revealOpacity },
                    ]}
                  >
                    {!isCurrentPlayerDJ && (
                      <Text
                        style={[
                          rv.feedbackBadge,
                          wasCorrect ? rv.feedbackBadgeCorrect : rv.feedbackBadgeWrong,
                        ]}
                      >
                        {wasCorrect ? '✓ Correct Answer' : '✗ Wrong Answer'}
                      </Text>
                    )}
                    <Text style={rv.feedbackCorrectYear}>
                      {correctLabel}{' '}
                      <Text style={rv.feedbackCorrectYearBold}>
                        {correctValue}
                      </Text>
                    </Text>
                    {/* Låt-titel + artist från question.hint (format
                        "Title — Artist" från MUSIC_QUESTIONS.displayName).
                        FontSize.xs + tight lineHeight håller raden kompakt
                        så feedback-kortet inte växer märkbart. numberOfLines=1
                        + ellipsizeMode='tail' skyddar mot långa titlar som
                        annars skulle wrappa och pusha kortet längre ner. */}
                    {question.hint && (
                      <Text
                        style={rv.feedbackSongMeta}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {question.hint}
                      </Text>
                    )}
                  </Animated.View>
                </View>
              );
            })()}

            {/* Per-spelare reveal-summary med unfold-logik.
                Deriveras från allRoundScoresHistory (inte currentRoundScores) så:
                  • IndDev: remote scores ankommer via sync och uppdaterar history → listan
                    uppdateras live allteftersom andra spelares svar tas emot.
                  • PtP: visar varje spelares senaste svar oavsett vilken fråga de svarade. */}

      </ScrollView>
      {/* Sticky Confirm/Awaiting-bar — ligger UTANFÖR ScrollView så Confirm-
          knappen alltid är synlig oavsett hur långt spelaren scrollat bland
          prefix/fullnamn-alternativen. Tidigare låg blocket inuti ScrollView
          vilket tvingade spelaren scrolla till slutet av answer-listan för
          att nå Confirm. Renderas bara i question/awaiting; reveal har sin
          egen Next-tab i bottom-right (absolute-positionerad nedan).
          Fas-medveten action-knapp:
            • question  → Confirm (blå glow + pulse)
            • awaiting  → låst "Confirmed — waiting for time" */}
      {(phase === 'question' || phase === 'awaiting' || (phase === 'reveal' && isSpotifyQuestion && isCurrentPlayerDJ)) &&
        /* Dölj sticky-bar för icke-DJ Spotify pre-timer när det inte finns
           något att visa (reguljär gissare har ingen action-knapp förrän
           timern startat). Timer-aktiveraren däremot får "Activate Timer". */
        !(isSpotifyQuestion && !isCurrentPlayerDJ && !spotifyDJStarted && phase === 'question' &&
          !(isTimerActivator && spotifyDJOpenedAppBroadcast && spotifyWaitPhase !== 'skipped')) && (
        <View style={styles.stickyConfirmBar}>
          {isSpotifyQuestion && isCurrentPlayerDJ ? null :
            isSpotifyQuestion && !isCurrentPlayerDJ && !spotifyDJStarted ? (
              /* Non-DJ Spotify pre-timer: timer-aktiveraren ser stor grön
                 "Activate Timer"-CTA. Reguljära gissare filtrerades bort av
                 outer gate ovan och når aldrig denna gren. */
              isTimerActivator && spotifyDJOpenedAppBroadcast && spotifyWaitPhase !== 'skipped' && phase === 'question' ? (
                <Animated.View style={{ transform: [{ scale: activateTimerPulse }], width: '100%' }}>
                  {/* TouchableOpacity (inte Pressable) — activeOpacity finns bara här. */}
                  <TouchableOpacity
                    style={styles.spotifyActivateTimerBtnLarge}
                    onPress={handleActivateTimer}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.spotifyActivateTimerBtnLargeText}>Activate Timer</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : null
            ) : (
            <>
              {phase === 'question' && (
                <Animated.View
                  style={[
                    styles.confirmWrap,
                    { transform: [{ scale: confirmPulse }] },
                  ]}
                >
              <Animated.View
                style={[styles.confirmHalo, { opacity: confirmGlow }]}
                pointerEvents="none"
              />
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.actionBtnConfirm,
                  (!canConfirm || shouldLockForUnstable) &&
                    styles.actionBtnDisabled,
                ]}
                onPress={() => {
                  if (!canConfirm || shouldLockForUnstable) return;
                  if (isSpotifyNameQuestion && pendingNameOption) {
                    handleConfirmName(pendingNameOption);
                  } else if (question.type === 'image' && pendingNameOption) {
                    handleConfirmName(pendingNameOption);
                  } else if (question.type === 'actor-select' && pendingActorName) {
                    handleConfirmActor(pendingActorName);
                  } else if (question.type === 'timeline' && pendingYear !== null) {
                    handleConfirm(pendingYear);
                  }
                }}
                disabled={!canConfirm || shouldLockForUnstable}
                activeOpacity={0.85}
              >
                {/* Q-glyph (ring + tail + 3 ljudvågs-bågar från QuizVibe-
                    loggan) ersätter ett typografiskt C så ordet läses som
                    "Qonfirm" med QuizVibe:s brand-Q. Färgas i Colors.warning
                    (gold) för att framhäva brand-glyfen mot den vita
                    "onfirm"-texten. Bågarna är arc-koordinater från
                    QuizVibeLogo, translerade +3x/+1y eftersom Q-center
                    sitter på (40,38) här istället för loggans (37,37).
                    Rotation 25° kring Q-center matchar loggans snedställning.
                    strokeWidth 1.6 på bågarna = klart smalare än Q-ringens
                    6.5 så de läses som "ljudvågor" inom ringen. */}
                <View style={styles.actionBtnContent}>
                  {/* viewBox expanderad till "23 18 34 37" (från "24 22 30
                      32") för att rymma Q-ringens tjockare 6.5-stroke utan
                      klippning på vänster kant, samt den breddade topp-
                      bågens rotation-bbox. SVG-dimensionerna bumpade till
                      24 för att kompensera så Q-glyfens visuella storlek
                      är ungefär densamma som tidigare. */}
                  <Svg width={24} height={24} viewBox="23 18 34 37">
                    <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.warning} strokeWidth="6.5" />
                    <Path d="M49 47 L53 51" stroke={Colors.warning} strokeWidth="6.5" strokeLinecap="round" />
                    <G transform="rotate(25 40 38)">
                      {/* Topp-båge (utanför Q-ringens topp-kant) — chord 20,
                          radius bumpad från 12 → 16 så bågen är flatare
                          och mer parallell med Q-ringens kantlinje. Mindre
                          sagitta minskar också rotation-bbox så bågen inte
                          klipps av viewBox:s topp efter 25°-rotationen. */}
                      <Path d="M 30 22 A 16 16 0 0 1 50 22" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                      {/* Mitten-båge (inne i Q-ringen) */}
                      <Path d="M 34 33 A 9 9 0 0 1 46 33" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                      {/* Botten-båge (inne i Q-ringen) */}
                      <Path d="M 36 35 A 6 6 0 0 1 44 35" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                    </G>
                  </Svg>
                  <Text style={styles.actionBtnText}>onfirm</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          {phase === 'awaiting' && (
            <View style={[styles.actionBtn, styles.actionBtnAwaiting]}>
              <Text style={styles.actionBtnAwaitingText}>
                ✓ Confirmed — waiting for time
              </Text>
            </View>
          )}
            </>
          )}
        </View>
      )}
      {/* Next-tab / Waiting-for-host-pill — absolute-positionerad i nedre
          högra hörnet av SafeAreaView:n så CTA:n alltid är synlig oavsett
          ScrollView:s scroll-position. Visas i reveal-fas för BÅDA timeline-
          och image-frågor (identisk placering och storlek så hörnet är den
          permanenta Next-positionen oavsett fråge-typ). I IndDev kontrollerar
          host speltempot; non-host ser en passiv "Waiting for host"-pill
          istället för Next-tab. */}
      {phase === 'reveal' && (
        <View style={rv.revealNextAbsolute} pointerEvents="box-none">
          {/* Spotify DJ-handover-steg: väntar på att DJ trycker "End DJ" innan host kan gå vidare */}
          {isSpotifyQuestion && !djHandedOver ? (
            isCurrentPlayerDJ ? (
              djDismissedOverlay ? (
                <Animated.View style={nextTabPulseStyle}>
                  <TouchableOpacity style={rv.djHandoverBtn} onPress={handleDJHandover} activeOpacity={0.85}>
                    <Text style={rv.djHandoverBtnText}>End DJ — handover to Host</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : null /* knappar ligger i scroll-zonen ovan */
            ) : (
              <View style={rv.waitingForHostPill}>
                <Text style={rv.waitingForHostPillText}>Waiting for DJ to handover to Host</Text>
                <SequentialDots color={Colors.textSecondary} />
              </View>
            )
          ) : gameMode === 'individual-devices' && !isHost ? (
            <View style={rv.waitingForHostPill}>
              <Text style={rv.waitingForHostPillText}>Waiting for host</Text>
              <SequentialDots color={Colors.textSecondary} />
            </View>
          ) : (
            <Animated.View style={[rv.nextTabWrap, nextCtaPulseStyle]}>
              <Animated.View style={[rv.nextTabHalo, nextCtaGlowStyle]} pointerEvents="none" />
              <TouchableOpacity
                style={[rv.nextTab, shouldLockForUnstable && { opacity: 0.4 }]}
                onPress={
                  isLastQuestion
                    ? handleHostShowLeaderboard
                    : handleHostAdvanceFromReveal
                }
                activeOpacity={0.85}
                disabled={shouldLockForUnstable}
              >
                <Text style={rv.nextTabText}>
                  {isLastQuestion ? '🏆  Final Leaderboard' : 'Next  →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
      {/* Scroll-hint pil — blinkar i botten av skärmen på image-frågor för att
          signalera att fler prefix-knappar + Confirm-knappen finns längre ned.
          Gäller question/awaiting; under reveal sitter Next-tab i bottom-right
          som permanent CTA så scroll-hint behövs inte där. Pinnad ovanför
          safe-area:n via SafeAreaView:s flex-tree; absolute positioning.
          pointerEvents='none' så taps under den når Confirm/grid. */}
      {question.type === 'image' && (phase === 'question' || phase === 'awaiting') && !scrolledToBottom && (
        <Animated.View
          style={[scrollHintStyles.wrap, { opacity: scrollHintOpacity }]}
          pointerEvents="none"
        >
          <View style={scrollHintStyles.pill}>
            <Text style={scrollHintStyles.chevron}>⌄</Text>
          </View>
        </Animated.View>
      )}
      {/* D-iii: bad-connection-overlay. Modal:n hanterar sin egen fullscreen-
          rendering med high zIndex, så den ligger ovanpå ScrollView:n utan
          extra wrapping. Bara aktiv i IndDev (gated via shouldLockForUnstable
          — Pass-the-Phone får aldrig unstable-state eftersom syncChannel
          inte subscribar:as där). Använder sticky-latch så overlay:n står
          kvar ända till nästa rondens GetReady även om uppkopplingen
          återkommer mid-question.

          Retry-knapp passas BARA för non-host. Host:s retry skulle riva
          host:s authoritative-driver-roll mid-question (broadcasts skulle
          inte gå ut, andra devices fastnar i reveal) — host måste vänta
          ut sin runda. canRetry = sticky-latched MEN connection åter OK.
          När fortfarande live-unstable visas grå "Waiting for connection…"-
          text istället. */}
      {/* ── FUTURE VERSION 2 — Automated API Flow (archived JSX) ─────────────────────
      <SpotifyNowPlayingOverlay
        visible={showNowPlayingOverlay && isCurrentPlayerDJ}
        trackName={nowPlayingTrackInfo?.trackName ?? ''}
        artistName={nowPlayingTrackInfo?.artistName ?? ''}
        albumArtUrl={nowPlayingTrackInfo?.albumArtUrl ?? null}
        isPlaying={spotifyIsPlaying}
        onPlayPause={handleSpotifyPlayPause}
        canActivate={false}
        onActivate={handleActivateTimer}
        canDismiss={phase !== 'question'}
        onDismiss={() => { setShowNowPlayingOverlay(false); if (isCurrentPlayerDJ) setDjDismissedOverlay(true); }}
      />
      ── END FUTURE VERSION 2 ──────────────────────────────────────────────────── */}
      <ConnectionUnstableOverlay
        visible={shouldLockForUnstable}
        onRetry={!isHost ? handleRetryFromUnstable : undefined}
        canRetry={!isConnectionUnstable && stickyUnstableForQuestion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  // D-v: outer wrapper för fragment-baserade return-paths (intro/countdown)
  // så onTouchStart kan registrera host:s activity utan att claim:a
  // responder från SafeAreaView/GetReadyIntro inuti.
  touchWrap: { flex: 1 },
  // D-vi: 3-2-1-countdown vid host-disconnect i reveal-fas. Center-
  // positionerad så den dominerar visuellt under sista 3 sek innan
  // auto-route till GetReady. pointerEvents='none' sätts på View:n
  // i JSX (inte här) eftersom det är en runtime-prop, inte style.
  graceCountdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 25,
  },
  graceCountdownCard: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 2,
    borderColor: Colors.warning,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 8,
    minWidth: 240,
  },
  graceCountdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  graceCountdownNumber: {
    fontSize: 80,
    fontWeight: '900',
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
    lineHeight: 88,
  },
  content: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  // Fixed-top-zonen — media + timer + question card hålls alltid i toppen
  // (utanför ScrollView). gap: md ger samma luftiga avstånd mellan elementen
  // som tidigare ScrollView.contentContainerStyle.content.
  fixedTopZone: {
    gap: qh(Spacing.md),
    // Får krympa som sista utväg (mot minHeight på imageMediaCard) så
    // scroll-zonen nedanför aldrig hamnar på 0 px höjd.
    flexShrink: 1,
  },
  // Scroll-zonen — wrappar bara svar-block + ev. reveal-feedback. flex: 1 så
  // den expanderar till resterande höjd mellan fixed-top och sticky-Confirm.
  scrollZone: {
    flex: 1,
  },
  scrollZoneContent: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },

  // Lock-overlay för non-host som tappat Approve Play Again men väntar
  // på host:s lobby-ready-event. Mörk backdrop + centrerat card med
  // statustext + animerade dots. Speglar LobbyScreen:s deletingOverlay
  // 1:1 (form, padding, färgpalett, dots-position).
  waitingLobbyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingLobbyCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waitingLobbyTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  waitingLobbyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },

  // Re-use-players-modal för host (Individual Devices). Speglar
  // alert-formen men har en disabled-state på "Yes, keep them" som låses
  // upp först när alla non-hosts broadcastat sin Approve-signal.
  playAgainModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  playAgainModalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    width: '100%',
    maxWidth: 360,
    gap: Spacing.md,
  },
  playAgainModalTitle: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  playAgainModalBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  playAgainModalStatus: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playAgainModalStatusWaitingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playAgainModalStatusWaitingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  playAgainModalStatusReadyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  playAgainModalActions: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  playAgainModalBtn: {
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  playAgainModalBtnCancel: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  playAgainModalBtnTextCancel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  playAgainModalBtnSecondary: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  playAgainModalBtnTextSecondary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  playAgainModalBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  playAgainModalBtnTextPrimary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  playAgainModalBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderStrong,
  },
  playAgainModalBtnTextDisabled: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textDisabled,
  },

  // Image-fråge-mediaCard: 16:9-ram med `resizeMode='contain'`. Container-
  // storleken är fix (matchar timeline-frågors media-area så layout är
  // konsistent mellan fråge-typer). Bilden anpassas inom ramen — inget
  // klipps men porträtt-bilder (14 av 17 i poolen) får letterbox vänster+
  // höger i `Colors.card`-färg. Landscape-bilder (städer) fyller bredden
  // med liten letterbox topp+botten. ProgressiveCover-mosaiken täcker hela
  // containern via absoluteFill.
  imageMediaCard: {
    // Kort skärm → fast (lägre) höjd i stället för 16:9, se
    // QUIZ_IMAGE_CARD_H. flexShrink + minHeight är ventilen om fixed-top-
    // zonen ändå blir för hög (t.ex. ett ovanligt högt frågekort): kortet
    // ger då efter i stället för att svars-scrollzonen kollapsar till 0.
    height: QUIZ_IMAGE_CARD_H,
    flexShrink: 1,
    minHeight: 110,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // ── Spotify DJ-kortet (DJ:ns vy, innan start) ─────────────────────────
  spotifyDJCard: {
    minHeight: QUIZ_MEDIA_H,
    backgroundColor: '#0D2010',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1DB954',
  },
  spotifyDJIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spotifyDJLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  spotifyTrackCard: {
    borderWidth: 1.5,
    borderColor: '#1DB954',
    borderRadius: Radius.md,
    // Symmetrisk luft kring pulserande "Start track in Spotify"-knappen:
    // samma avstånd ovanför (paddingTop) som nedanför (spotifyTrackCard-
    // FirstLabel.marginTop) så knappen hamnar mitt emellan ramens överkant
    // och "Artist"-rubriken.
    paddingTop: Spacing.xl * 1.5,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 2,
    alignSelf: 'stretch',
  },
  spotifyTrackCardFieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // Första rubriken under CTA-knappen — speglar kortets paddingTop så
  // knappen centreras vertikalt mellan ram-överkant och "Artist"-rubriken.
  spotifyTrackCardFirstLabel: {
    marginTop: Spacing.xl * 1.5,
  },
  spotifyTrackCardPosition: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#1DB954',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  spotifyTrackCardWarnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.warning,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  spotifyTrackCardWarnIcon: {
    fontSize: FontSize.md,
  },
  spotifyTrackCardWarnText: {
    flexShrink: 1,
    maxWidth: Math.round(Dimensions.get('window').width * (2 / 3)),
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.warning,
    textAlign: 'center',
  },
  spotifyTrackCardArtist: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  spotifyTrackCardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  spotifyStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1DB954',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  spotifyStartBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  // ── DJ-scroll-zon: centrerar steg-0/1-knapparna där TimelineSelector annars sitter ──
  spotifyDJScrollZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  djStopConfirmInlineBtn: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  djStopConfirmInlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
  djOrSeparatorText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // ── DJ-handlingsknappar i stickyConfirmBar ───────────────────────────
  spotifyDJActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  // Grön glow-halo bakom "Start track in Spotify"-CTA:n — speglar
  // confirmHalo-mönstret (absolut-positionerad bakom, animated opacity).
  djStartHalo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: Radius.md + 6,
    backgroundColor: '#1DB954',
  },
  spotifyDJActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1DB954',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  spotifyDJActionBtnDone: {
    opacity: 0.38,
  },
  spotifyDJActionBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  spotifyDJHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.xs,
  },
  // ── Q-logo-kortet (gissare + DJ efter start) ──────────────────────────
  spotifyQLogoCard: {
    minHeight: QUIZ_MEDIA_H,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  spotifyStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
  },
  spotifyStatusText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    flexShrink: 1,
    textAlign: 'left',
  },
  // ── Spotify steg-guide (DJ + gissare) ────────────────────────────────
  spotifyGuideSection: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: Spacing.xs,
  },
  spotifyGuideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  spotifyGuideNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyGuideNumActive: {
    backgroundColor: '#1DB954',
  },
  spotifyGuideNumDone: {
    backgroundColor: 'rgba(29,185,84,0.3)',
  },
  spotifyGuideNumText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.4)',
  },
  spotifyGuideNumTextActive: {
    color: '#000000',
  },
  spotifyGuideNumTextDone: {
    color: '#1DB954',
  },
  spotifyGuideText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.35)',
    flex: 1,
  },
  spotifyGuideTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  spotifyGuideTextDone: {
    color: 'rgba(29,185,84,0.6)',
  },
  spotifySkipBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.sm,
    alignSelf: 'center',
  },
  spotifySkipBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  spotifyActivateTimerBtn: {
    marginTop: Spacing.md,
    backgroundColor: '#1DB954',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignSelf: 'center',
  },
  spotifyActivateTimerBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Stor sticky-bottom-version av "Activate Timer" (ersätter den lilla knappen
  // som låg inne i non-DJ-kortet). Full bredd + generös padding för tydlig CTA.
  spotifyActivateTimerBtnLarge: {
    backgroundColor: '#1DB954',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  spotifyActivateTimerBtnLargeText: {
    color: Colors.background,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  // Visas när YouTubeMediaPlayer rapporterar embed-fel — ersätter spelaren
  // med en diskret felindikator i samma höjd som mediarutan.
  youtubeErrorCard: {
    height: QUIZ_MEDIA_H,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  youtubeErrorIcon: {
    fontSize: 28,
    color: Colors.textSecondary,
  },
  youtubeErrorTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  youtubeErrorSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  imageMediaImage: {
    width: '100%',
    height: '100%',
  },
  imageMediaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.cardElevated,
  },


  // Timer-section — radlayout med bar:en (flex 1) + sekund-räknaren till
  // höger. Sitter direkt under mediakortet (negativ marginTop -Spacing.md
  // kompenserar för ScrollView-content:s gap så sektionen limmar mot
  // mediakortets underkant istället för att flyta i tomrum). Horisontell
  // padding matchar fråge-kortets margin så bar:en linjerar med kortets
  // sidkanter istället för att vara edge-to-edge.
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    // Tidigare marginTop: -Spacing.md drog upp raden 16 px in i medie-
    // kortet — ringen (56×56) + halon (+4 px topp) krockade då med
    // YouTube-spelarens nedre högra hörn. Borttagen så `content.gap`
    // (Spacing.md) ger normalt avstånd och halon klarar sig själv.
  },
  timerTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    // Ingen overflow:hidden — avatar-markören (timerMarker) extenderar långt
    // utanför 6 px bar-höjden. timerFill har egen borderRadius:3 så fillen
    // ser fortsatt rundad ut vid edges utan klippning.
    position: 'relative',
  },
  timerFillPulseWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Avatar-markör som sitter på timer-bar:en vid den x-position som motsvarar
  // tiden då spelaren bekräftade. left: ${elapsed/30 * 100}% — track:s
  // egen position:relative gör att percentagen räknas mot den.
  // marginLeft -14 centrerar 28-wide avataren på den exakta x-pixeln.
  // top: bar-center (3) - avatar-radie (14) = -11.
  timerMarker: {
    position: 'absolute',
    top: -11,
    marginLeft: -14,
    width: 28,
    height: 28,
    zIndex: 10,
  },
  timerMarkerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.cardElevated,
  },
  timerMarkerFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerMarkerEmoji: {
    fontSize: 16,
  },
  // Pulserande ring runt sekund-räknaren till höger om timer-bar:en. Cirkel-
  // form via lika width/height + borderRadius:50% (= halv av storleken).
  // timerRingHalo ligger absolut inset utanför ringen och pulserar i
  // opacity för cross-platform glow.
  timerRingWrap: {
    position: 'relative',
    width: qh(56),
    height: qh(56),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
  },
  timerRing: {
    width: qh(56),
    height: qh(56),
    borderRadius: qh(56) / 2,
    borderWidth: 2,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingNum: {
    fontSize: qf(24),
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },

  // Wrap runt 2-decimal countdown — håller halo + box. Centrerad
  // horisontellt. Negativ marginTop drar boxen nära timer-bar:en (ScrollView-
  // content-gap pushar annars ned med Spacing.md = 16 px); -10 lämnar bara
  // ~6 px luft mellan bar:ens nedkant och stopwatch-boxens överkant.
  decimalTimerWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginTop: -10,
  },
  // Halo bakom boxen — pulserar i opacity via timerRingGlow så glöden
  // matchar ringen runt sekund-räknaren ovanför.
  decimalTimerHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Radius.lg + 4,
  },
  // Själva boxen runt stopwatch-ikon + tal. Border-färgen ärvs från
  // stopwatchColor (sätts dynamiskt i render). Bakgrund Colors.cardElevated
  // så texten har kontrast mot halo:n bakom. alignItems:'center' centrerar
  // ikonen + decimal-delen vertikalt med den stora integer-siffran (38 px).
  decimalTimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: qh(Spacing.sm),
    borderRadius: Radius.lg,
    borderWidth: 2,
    backgroundColor: Colors.cardElevated,
  },
  // Wrap runt SVG-ikonen — höjden matchar integer-textens lineHeight
  // så ikonens visuella mitt linjerar exakt med siffrans visuella mitt.
  decimalTimerIconWrap: {
    width: qh(32),
    height: qf(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  decimalTimerInt: {
    fontSize: qf(38),
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    lineHeight: qf(40),
  },
  decimalTimerDec: {
    fontSize: qf(22),
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },

  questionCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: qh(Spacing.md),
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    // minHeight borttagen — keyword-highlight ger naturlig 1-2-rads-höjd
    // (~70-90px) istället för tidigare fixed 140px.
  },
  // Top-rad pinnas mot kortets överkant så frågan kan flex-centreras under.
  // alignItems:'flex-start' gör att höger Answering-stack:en kan vara två rader
  // tall utan att skjuta question-räknaren neråt; båda anchorar mot top-edge.
  questionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  // Wrap runt frågetexten — kompakt vertikal yta eftersom keyword-highlight
  // ryms på 1-2 rader istället för tidigare 2-3-rad-split. Liten padding så
  // frågekortet blir totalhöjd ~80px istället för ~140px.
  questionTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  questionMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  // "Answering"-stack — label ovanpå PlayerName, höger-justerat. Två rader
  // ger plats åt långa Player Names utan att kollidera med question-räknaren
  // i vänster kolumn. alignItems:'flex-end' så båda raderna är högerställda
  // (textAlign på Text-elementen behövs inte när container redan är höger-
  // anchored).
  answeringStack: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  answeringLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  answeringPlayerName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
    maxWidth: 180,
  },
  // Inline keyword-highlight (nested inom questionText). Markant större +
  // bold så ögat fastnar på frågans semantiska anker (Year/Name/City/
  // Country). Renderas via <Text> nested i parent <Text>, så text-flowet
  // håller orden tillsammans på samma rad/wrap-ningsformat.
  questionTextHeadline: {
    fontSize: qf(30),
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: qf(18),
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: qf(30),
    textAlign: 'center',
  },

  // Action-knapp (Confirm / Next Round / Final Leaderboard) — paddningen
  // matchar TimelineSelector:s wrapper så knappen står i samma kolumn.
  actionWrap: {
    paddingHorizontal: Spacing.lg,
  },
  // Sticky Confirm-bar — sitter UTANFÖR ScrollView som sibling i SafeArea-
  // tree:n så Confirm-knappen alltid är synlig medan spelaren scrollar bland
  // prefix/fullnamn-alternativen. Bg + border-top markerar den som en
  // visuellt separat zone från scroll-innehållet ovanför. paddingVertical
  // ger luft runt knappen så den inte limmar mot border-top:en.
  stickyConfirmBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: qh(Spacing.md),
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    height: qh(56),
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Row-wrap för Q-glyph + "onfirm"-text inuti Confirm-knappen. Tight gap
  // så Q och bokstäverna läses som ett sammanhängande ord. alignItems:
  // 'center' baseline-justerar Q-SVG:n mot text-mitten.
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  // Confirm-knappens stil: blue + iOS shadow för glow-effekten. Halo:n bakom
  // (confirmHalo) ger cross-platform glow på Android som saknar shadow-color.
  // Confirm-knappen delar färgschema med rv.nextTab (outline blå border på
  // Colors.cardElevated-bg). Den separata confirmHalo-View:n bakom knappen
  // bär fortfarande den pulserande blå glow:en — så Confirm har samma fyll-
  // färger som Next, men extra glow för CTA-fokus.
  actionBtnConfirm: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  // Wrap runt Confirm-knappen för scale-pulse + halo-positionering.
  // position: relative så confirmHalo (absolute) ankrars hit istället för
  // mot ScrollView:n. Speglar Lobby:s startGameWrap-mönster.
  confirmWrap: {
    position: 'relative',
  },
  confirmHalo: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: Radius.md + 4,
    backgroundColor: Colors.primary,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  // Awaiting-state-knapp: passiv pillar med subtila brand-toner — signalerar
  // "låst, vänta på tiden" utan att se klickbar ut. Speglar Lobby:s
  // waitingForHostBox-styling (primaryMuted bg + primaryBorder).
  actionBtnAwaiting: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  actionBtnAwaitingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.warning,
    letterSpacing: 0.5,
  },
});

// Inline reveal-feedback — green/red-bordered card med ✓/✗ badge i övre
// vänstra hörnet, "You chose: X" och (vid fel) "Correct answer: Y". Speglar
// name-quiz-demo:s feedback-mönster så reveal-vyn ser likadan ut oavsett
// fråge-typ. Pts-räknaren sitter i övre högra hörnet på samma rad som badgen.
const rv = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg },
  feedbackCard: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: 2,
    // marginTop ger badgen (top: -8, border-cutting) andrum att protruda
    // uppåt utan att krocka med fråge-kortet ovanför.
    marginTop: Spacing.sm,
  },
  // Båda statusarna delar bg-färg (Colors.card) som matchar question-kortet
  // ovanför så reveal-vyn känns som en seamless förlängning av frågan istället
  // för en "alarm-ruta". Status-färgen bärs på badge + border.
  feedbackCorrect: {
    backgroundColor: Colors.card,
    borderColor: Colors.success,
  },
  feedbackWrong: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  // Border-cutting badge: sitter på kortets övre kantlinje (top: -8) istället
  // för inuti kortet. Speglar HOST/GUEST-taggen på PlayerRow och FREE/PREMIUM-
  // badgen på Game Mode-toggle:n. Solid bg matchar kortets borderColor så
  // taggen visuellt "är en del av" ramen. Vit text för kontrast mot grön/röd.
  feedbackBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    zIndex: 10,
    elevation: 4,
  },
  feedbackBadgeCorrect: {
    backgroundColor: Colors.success,
  },
  feedbackBadgeWrong: {
    backgroundColor: QUIZ_ERROR_RED,
  },
  // "Correct year: 1980" — fortfarande primärt fokus i reveal-vyn men
  // krympt så hela kortet håller låg höjd oavsett assistance-nivå (kortet
  // ska bara vara så högt att badge + correct-year-raden får plats).
  feedbackCorrectYear: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Låt-titel + artist under "Correct year"-raden i timeline-reveal:
  // FontSize.xs (11) + tight lineHeight 13 ger en kompakt rad som bara
  // adderar ~2-3px till kort-höjden. textSecondary för att inte konkurrera
  // visuellt med "Correct year"-värdet ovanför.
  feedbackSongMeta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  feedbackCorrectYearBold: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  // Wrapper för Next-tab UTANFÖR feedback-kortet — sträcker sig full bredd
  // i container:n (paddingHorizontal: Spacing.lg från rv.container ger
  // konsekvent högra/vänstra marginal mot skärmkanten). marginTop ger luft
  // mot kortets underkant. Default alignItems (stretch) gör att Animated.View-
  // wrappern och TouchableOpacity inom fyller bredden.
  revealNextWrap: {
    marginTop: Spacing.md,
  },
  // Next-tab / Waiting-pill positionerad absolut i nedre högra hörnet av
  // SafeAreaView:n. Sibling till ScrollView så den alltid syns oavsett
  // scroll-position. zIndex + elevation behövs för iOS + Android stacking
  // över ScrollView-innehåll. pointerEvents='box-none' på wrappern så taps
  // utanför själva knappen når underliggande ScrollView (knappen själv
  // fångar sina taps via TouchableOpacity).
  revealNextAbsolute: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    zIndex: 60,
    elevation: 60,
    alignItems: 'flex-end',
  },
  // Next-tab — delar färgspråk med TimelineSelector:s årsruta (Peter
  // 2026-08-14): guld 3px-kant + mörk navy fyllning + guld glow, samma
  // BOX_COLOR/BOX_BG-konstanter så de aldrig glider isär. Reveal-kortets
  // border + badge bär status-färgen (grön/röd); tab:en är "fortsätt"-CTA:n.
  //
  // ⚠ INGEN shadow* här — knappen scale-pulsar, och en iOS-skugga utan
  // shadowPath tvingar CoreAnimation att räkna om skuggkonturen varje frame
  // vilket gjorde pulsen hackig. Glow:en bärs av nextTabHalo bakom istället
  // (samma mönster som confirmHalo/djStartHalo).
  nextTab: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: BOX_COLOR,
    backgroundColor: BOX_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Wrap runt Next-tab för scale-pulse + halo-ankring (position: relative så
  // halo:n absolut-positioneras mot knappen, inte mot skärmen).
  nextTabWrap: {
    position: 'relative',
  },
  // Guld-halo bakom Next-tab:en. Opacity sätts av nextCtaGlow (0.15 ↔ 0.55)
  // — sätt ingen statisk opacity här, den skulle ändå överskuggas.
  nextTabHalo: {
    position: 'absolute',
    top: -9,
    left: -9,
    right: -9,
    bottom: -9,
    borderRadius: 19,
    backgroundColor: BOX_COLOR,
  },
  nextTabText: {
    fontSize: 17,
    fontWeight: '700',
    color: BOX_COLOR,
    letterSpacing: 0.3,
  },
  // Non-host:s "Waiting for host…"-pill i IndDev — sitter i samma position
  // som Next-tab skulle. Dämpad styling (textSecondary + borderStrong)
  // signalerar passiv vänte-state istället för aktion.
  waitingForHostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    gap: 4,
  },
  waitingForHostPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  djHandoverBtn: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  djHandoverBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
});

// Scroll-hint-pil i botten på image-frågor. Eget StyleSheet så `styles` och
// `rv` namespacen inte blir röriga med fler keys. Solid Colors.primary-pill +
// elevation/shadow för att garantera synlighet över både Colors.card-grid:n
// och ev. media-card-bilder. zIndex + elevation behövs båda (iOS + Android).
const scrollHintStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // Bottom: sitter ovanför sticky Confirm-bar:n (~81px hög: 56 button + 24
    // paddingVertical + border; ~65px i kompakt läge). Tidigare Spacing.lg
    // räckte när Confirm var inuti ScrollView, men nu skulle pilen krocka
    // med sticky-bar:n.
    bottom: qh(96),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    elevation: 50,
  },
  pill: {
    minWidth: 64,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  chevron: {
    fontSize: 32,
    lineHeight: 32,
    color: '#FFFFFF',
    fontWeight: '900',
    // Negative marginTop kompenserar för Text:s default line-box som har
    // ascent-utrymme ovanför glyfen — utan det ligger ⌄ visuellt under
    // pillens vertikala center.
    marginTop: -10,
  },
});