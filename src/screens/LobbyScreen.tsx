import MultiSlider from '@ptomasroos/react-native-multi-slider';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';
import { ApproveToggle } from '../components/ApproveToggle';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CodeKeyboard } from '../components/CodeKeyboard';
import { EraMarkerMinus, EraMarkerPlus } from '../components/EraSliderMarker';
import { useLobbyPeerHealth } from '../lib/realtime/lobbyHealthChannel';
import { Player, PlayerRow } from '../components/PlayerRow';
import { QuizVibeFriendsLogo } from '../components/QuizVibeFriendsLogo';
import { QuizVibeLogo } from '../components/QuizVibeLogo';
import { QuizVibePlayLogo } from '../components/QuizVibePlayLogo';
import { YouTubeBrandIcon } from '../components/YouTubeBrandIcon';
import { SpotifyBrandIcon } from '../components/SpotifyBrandIcon';
// Spotify OAuth-imports borttagna (Plan B 2026-07-22) — handleConnectSpotify/
// handleDisconnectSpotify är numera lokala self-attest-handlers utan API.
// Spotify OAuth-status-import borttagen (Plan B 2026-07-22) — self-attest via
// profile.spotifyAppConfirmed ersätter getSpotifyConnectionStatus.
import { SequentialDots } from '../components/SequentialDots';
import {
    ROUNDS_DEFAULT,
    ROUNDS_MAX_INDIV,
    ROUNDS_MAX_PASS,
    ROUNDS_MIN,
    ROUNDS_STEP,
    RoundsRuler,
} from '../components/RoundsRuler';
import { TopUserBanner } from '../components/TopUserBanner';
import { MorseAmbientSound } from '../components/MorseAmbientSound';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { isAnonymousSession } from '../utils/auth';
import { AVATARS, getAvatarEmojiById } from '../utils/avatars';
import { addFriend, loadFriends, type Friend } from '../utils/friendsStorage';
import { MIN_HCP, calculateInitialHCP } from '../utils/hcp';
import { addLeftPlayer, getLeftPlayers, removeLeftPlayer } from '../utils/leftPlayers';
import { deactivateRoom, getRoomMeta, markRoomGameStarted, roomExists, setRoomMaxPlayers, setRoomPlayerCount } from '../utils/mockActiveRooms';
import { describeMissingPlayers, findMissingRematchPlayers } from '../utils/rematchLineup';
import { clearEjected, isEjected, markEjected } from '../utils/ejectedPlayers';
import { claimCarryOverLobbyPlayer, clearLobbyPlayers, getLobbyPlayers, getLobbySeenQuestionIds, markOwnPlayerLeft, publishOwnAccountName, setLobbyPlayers, updateOwnSeenQuestionIds, upsertOwnLobbyPlayer } from '../utils/mockLobbyPlayers';
import { loadLastSessionIds, loadSeenQuestionIds } from '../utils/hostQuestionHistory';
import { setPendingPeerSeenIds } from '../utils/pendingSeenQuestions';
import { clearLobbySettings, getLobbySettings, setLobbySettings, type LobbyRemoteAssistance } from '../utils/mockLobbySettings';
import { createRemoteMatch, getMatchByRoomCode, getOwnUserId } from '../utils/remoteMatches';
import { saveLobby } from '../utils/savedLobbies';
import { defaultEnabledMainCategories, subjectToMainCategory, type MainCategory } from '../utils/mainCategory';
import { MUSIC_QUESTIONS } from '../utils/musicQuestions';
import { IMAGE_QUIZ_QUESTIONS } from '../utils/quizImageQuestions';
import { supabase } from '../utils/supabase';
import { clearGameStarted, isGameStarted, markGameStarted } from '../utils/mockStartedGames';
import {
  PURCHASED_PACKAGES,
  type MusicPackage,
} from '../utils/mockPurchasedPackages';
import { consumePendingLobbyPlayers } from '../utils/pendingLobby';
import {
  appendPlayerNameDigit,
  appendPlayerNameLetter,
  backspacePlayerNameDigits,
  backspacePlayerNameLetters,
  containsBlockedLetterSubstring,
  extractTakenGuestLetters,
  generatePlayerName,
  getPlayerNameDigits,
  getPlayerNameLetters,
  hasBlockedLetterLead,
  isPlayerNameFormatValid,
  normalizePlayerName,
  PLAYER_NAME_MAX_DIGITS,
  PLAYER_NAME_MAX_LETTERS,
} from '../utils/playerName';
import { containsProfanity } from '../utils/profanity';
import { getCachedProfile, loadProfile, playerNameExists, saveProfile, type ProfileData, type Region as ProfileRegion } from '../utils/profileStorage';
import { getCachedPremium, hasPremiumSubscription } from '../utils/subscriptionStorage';
import { ROOM_CODE_DIGITS, ROOM_CODE_LEADING_LETTERS, generateRoomCode } from '../utils/roomCode';
import { checkSpotifyInstalled } from '../utils/spotifyDJ';
import { addInvite, clearWaitingInvitesForRoom } from '../utils/waitingInvites';

export interface LobbyPlayer extends Player {
  type: 'registered' | 'guest' | 'manual';
  age?: number;
  assistance?: 'minimal' | 'standard' | 'full';
  hcpComplete: boolean;
  isHost?: boolean;
  // Host godkänner spelare innan de tas in i spelet. Host själv är
  // alltid auto-approved (treats !!isHost as approved när approved saknas).
  approved?: boolean;
  // Host kan tweaka HCP per spelare i lobbyn. Override:n bor i lobby-state
  // och persisteras inte över sessions — det är en per-spel-justering.
  // Saknas → använd beräkning från age+assistance som tidigare.
  hcpOverride?: number;
  // True om host har redigerat något av spelarens lobby-fält (age,
  // assistance eller hcpOverride). Skyddar mot att profil-merge clobbrar
  // lokala redigeringar när host återvänder till lobby-tabben (relevant
  // för host:s eget kort eftersom mergeProfileIntoHost kör i useFocusEffect).
  // Inga skrivningar går mot AsyncStorage så redigeringen är garanterat
  // lobby-lokal — gäller bara för detta spel-instance.
  lobbyEdited?: boolean;
  // True om host lade till spelaren manuellt via +Add Player. Dessa
  // spelare saknar egen mobil och måste tas bort om läget byts till
  // Individual Devices.
  addedByHost?: boolean;
  // True om spelaren har lämnat lobby:n via TopUserBanner → Leave Game Lobby-
  // flödet. Persisteras per rumkod via src/utils/leftPlayers.ts och appliceras
  // av LobbyScreen:s useFocusEffect. PlayerRow renderar då greyed-out text +
  // "LEFT THIS GAME LOBBY"-label så övriga i lobby:n ser att spelaren gått.
  hasLeft?: boolean;
  // True om spelaren har self-attestat att den har Spotify-appen (Plan B
  // 2026-07-22 — ingen OAuth). Syncas via lobby_players.spotify_verified;
  // källan är profile.spotifyAppConfirmed eller lobby-radens attest-tap.
  spotifyConnected?: boolean;
  // QuizVibe-kontots playerName när spelaren deltar under ett Guest alias
  // ("GuestA-1234567" i lobbyn, men kontot är "Anna-42"). Publiceras av
  // spelaren själv via publishOwnAccountName → lobby_players
  // .account_player_name (migration 0030); `profiles` är own-row-only i
  // RLS så ingen annan klient kan slå upp namnet. undefined = spelaren
  // använder sitt kontonamn, eller är en ren guest utan konto.
  accountPlayerName?: string;
}

type GameMode = 'pass-the-phone' | 'individual-devices' | 'remote-1v1';

// Year-of-birth gränser (samma som registreringsformuläret för gäster) ....
// 15+ minimum age requirement (2026-06-01: höjt från 13+ pga 15+-gränsat
// film-/innehåll i appen, utöver App Store / GDPR). Dynamisk så minimum-året
// följer current year — 2026: max 2011, 2027: max 2012, osv.
// Smal skärm = iPhone SE1 (320 pt) ELLER valfri iPhone med iOS Display Zoom
// påslaget (SE2/8 rapporterar då 320 pt i stället för 375). Headern
// "Game Lobby" + Host Game Credits-pillen kräver ~306 pt på en rad med
// default-storlekarna, vilket klipper pillens högerkant på 288 pt
// tillgänglig bredd. Se `header` / `screenTitle` / `creditsPill`.
const SCREEN_WIDTH = Dimensions.get('window').width;
const NARROW_SCREEN = SCREEN_WIDTH < 360;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1950;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 15;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

/**
 * Mergar sparad profildata in i host-spelarkortet. Behåller övriga fält
 * som id och isHost, men skriver över namn/avatar/age/assistance med
 * profilens värden. Om profilen saknar required fält (assistance eller
 * birthYear) markeras hcpComplete=false så host-kortet visar
 * "HCP Required" på samma sätt som andra spelare utan komplett HCP.
 */
// Generisk fallback för host-spelarens birthYear när profil saknar fältet —
// random år i [1970, 2005] (ger 21–56 år gammal vuxen). Hellre rimlig
// approximation än "no age" eftersom HCP-beräkningen kräver ett värde.
function randomBirthYear(): number {
  const min = 1970;
  const max = 2005;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mergeProfileIntoHost(existing: LobbyPlayer, profile: ProfileData): LobbyPlayer {
  // Om host:en har redigerat sitt eget kort lokalt i lobbyn ska re-merge:n
  // INTE clobba de värdena. Profil-data är källan vid första entry, men
  // efter en host-edit äger lobby-state datan tills lobbyn lämnas/raderas.
  // Avatar/playerName uppdateras fortsatt från profil eftersom de inte
  // exponeras i lobby-edit-modalen.
  if (existing.lobbyEdited) {
    return {
      ...existing,
      name: profile.playerName?.trim() || existing.name,
      emoji: getAvatarEmojiById(profile.selectedAvatarId),
    };
  }
  const currentYear = new Date().getFullYear();
  // Fallbacks om profil saknar fältet — slumpmässig birthYear + 'standard'
  // assistance så host alltid har komplett HCP vid lobby-start (annars
  // visas "HCP Required" och Start Game blir blockerad).
  const effectiveBirthYear = profile.birthYear ?? randomBirthYear();
  const effectiveAssistance = profile.assistance ?? 'standard';
  const age = currentYear - effectiveBirthYear;
  return {
    ...existing,
    name: profile.playerName?.trim() || existing.name,
    emoji: getAvatarEmojiById(profile.selectedAvatarId),
    age,
    assistance: effectiveAssistance,
    hcpComplete: true,
    isReady: true,
    type: 'registered',
    isHost: true,
  };
}

const SEED_PLAYERS: LobbyPlayer[] = [
  { id: '1', name: 'Alex K.',   emoji: '🦊', isReady: true,  type: 'registered', hcpComplete: true,  age: 32, assistance: 'standard', isHost: true, approved: true  },
  { id: '2', name: 'Sam L.',    emoji: '🎸', isReady: true,  type: 'registered', hcpComplete: true,  age: 28, assistance: 'minimal',                approved: false },
  { id: '3', name: 'Jordan M.', emoji: '🤖', isReady: true,  type: 'guest',      hcpComplete: true,  age: 35, assistance: 'standard',               approved: false },
  { id: '4', name: 'Casey P.',  emoji: '🐉', isReady: true,  type: 'registered', hcpComplete: true,  age: 41, assistance: 'full',                   approved: false },
];

// V1-launch: Region scope visar bara Sweden i Lobby. Tidigare hade vi
// Nordics/Europe/Global också men de är borttagna tills content-katalogen
// täcker fler länder. Listan stannar som as const-array (fortfarande
// "set"-form) så framtida tillägg bara behöver utöka arrayen + flagg-mapen.
const REGIONS = ['Sweden'] as const;
type Region = typeof REGIONS[number];

// Profile-skärmen lagrar region som lowercase ('sweden' | 'nordics' | 'global')
// men UI:t exponerar bara Sweden i v1; mappa ner non-sweden till Sweden.
function mapProfileRegion(r: ProfileRegion | null | undefined): Region | null {
  if (r === 'sweden') return 'Sweden';
  return null;
}

// (Music packages — extra paket host kan köpa via QuizVibe Store och välja
// per room — har flyttats till `src/utils/mockPurchasedPackages.ts` så
// Profile-vyn delar samma mock. Importen sker högst upp.)

const REGION_FLAGS: Record<Region, string> = {
  Sweden: '🇸🇪',
};

// ERA_MIN = 1950 så slider-värdet matchar tidsaxelns vänsterkant ("<1950").
// Tidigare gick slidern 1900..currentYear medan axeln visuellt började vid
// "<1930" — det skapade en 30-års-förskjutning mellan thumb-position och
// vad rutan ovan visade. Nu mappar 0 % → 1930 och 100 % → currentYear.
const ERA_MIN = 1950;
const ERA_MAX = new Date().getFullYear();
const SLIDER_WIDTH = 280;
// SLIDER_INSET = pixel-buffer på vardera sida så thumb-cirklarna (24px,
// extends 12px från center) inte sticker ut förbi slider-trackens kanter
// vid ERA_MIN/ERA_MAX. MultiSlider:s sliderLength sätts till INNER_WIDTH
// och DecadeMarks-positionen offset:as med INSET så labels och thumbs
// fortsatt aligns inom det inset:ade området. Resultat: vänster thumb
// flyttas något åt höger och höger thumb något åt vänster relativt
// slider-viewport:en, men matchar fortfarande sina år-labels exakt.
const SLIDER_INSET = 12;
const SLIDER_INNER_WIDTH = SLIDER_WIDTH - 2 * SLIDER_INSET;
// Minsta tillåtna avstånd mellan from/to-markörerna på Game Era-slidern.
// Ett 15-årigt fönster är minimum för att frågedatabasen ska kunna leverera
// ett rimligt urval — kortare span blir för glest.
const ERA_MIN_INTERVAL = 15;
// Lägsta tillåtna "to"-år (höger thumb-golv). En era som slutar före 1980 ger
// för tunn pool. Vänster thumb (from) får fortf. gå till ERA_MIN; bara
// to-thumben golvas. Enforced i onValuesChange + seed-clamp.
const ERA_TO_MIN = 1980;
// MultiSlider:s minMarkerOverlapDistance är i pixel — räkna ut hur många
// pixel ERA_MIN_INTERVAL år motsvarar på SLIDER_INNER_WIDTH-skalan så lib:n
// håller markörerna från att komma närmare än så. Ceil för att inte underskrida.
const ERA_MIN_INTERVAL_PX = Math.ceil((ERA_MIN_INTERVAL / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH);

// (Antal rundor: konstanter + RoundsRuler-komponenten lever i shared
// `src/components/RoundsRuler.tsx` så både Lobby och Profile delar samma
// implementation. Importen sker högst upp i fil-huvudet.)

// Returnerar en informativ warning om host:s valda era inte intersekta:r
// yngsta spelarens livstid — vi clampa:r INTE displayen längre eftersom
// det skapade en illusion att slider:n flyttade undre thumben automatiskt
// när host drog övre under youngestBirth (boxens "from"-värde ändrades
// men slider-thumben gjorde det inte). Host får nu se exakt vad de valt
// + en gul warning om eran exkluderar någon.
function checkEraAgainstPlayer(toYear: number, players: LobbyPlayer[]) {
  const currentYear = new Date().getFullYear();
  const ages = players.filter((p) => p.hcpComplete && p.age).map((p) => p.age as number);
  if (ages.length === 0) return { warning: null };
  const youngestBirth = currentYear - Math.min(...ages);
  if (toYear < youngestBirth) {
    return { warning: `Youngest player born ${youngestBirth}. Selected era ends ${youngestBirth - toYear} year${youngestBirth - toYear === 1 ? '' : 's'} before they were born.` };
  }
  return { warning: null };
}

function DecadeMarks() {
  // Tidsaxel — labels positionerade på faktiska års-värden, INTE jämnt
  // fördelade. Det gör att thumben landar exakt på respektive label
  // (eftersom slidern mappar ERA_MIN..ERA_MAX linjärt). Tidigare jämn-
  // fördelning gav 1–5 års offset mellan thumb och label vilket såg
  // omatchat ut. Nu: position = ((year - ERA_MIN) / (ERA_MAX - ERA_MIN))
  // * SLIDER_WIDTH per label. Ledmellanrummet 2010 → ERA_MAX är något
  // bredare än övriga eftersom det spannet är ~16 år istället för 10.
  const labelEntries: { label: string; year: number }[] = [
    { label: '<1950', year: ERA_MIN },
    { label: '1960', year: 1960 },
    { label: '1970', year: 1970 },
    { label: '1980', year: 1980 },
    { label: '1990', year: 1990 },
    { label: '2000', year: 2000 },
    { label: '2010', year: 2010 },
    { label: '2020', year: 2020 },
  ];
  return (
    <View style={{ width: SLIDER_WIDTH, height: 75, marginTop: 6 }}>
      {labelEntries.map(({ label, year }) => {
        const position = SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH;
        return (
          <View key={label} style={{ position: 'absolute', left: position, alignItems: 'center', width: 1 }}>
            {/* Tick: marginTop:-10 + height:14 → ticken pokar 10px upp i
                slider-zonen och fortsätter 4px ned i gapet under, så den
                visuellt skär slider-tracken något. */}
            <View style={{ width: 1, height: 14, backgroundColor: Colors.borderStrong, marginTop: -10 }} />
            {/* Label-container: width 60 × height 20 (var 30×10) för att
                rymma fördubblad text. fontSize 16 (var 8) ≈ 2× större per
                användarens önskan. */}
            <View style={{ width: 60, height: 20, marginTop: 14, transform: [{ rotate: '90deg' }] }}>
              <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center', width: 60 }}>
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Region Modal ─────────────────────────────────────────────────────────────

function RegionModal({ visible, value, onChange, onClose }: {
  visible: boolean; value: Region; onChange: (r: Region) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={regionSheet.overlay}>
        <TouchableOpacity style={regionSheet.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={regionSheet.container}>
          <View style={regionSheet.handle} />
          <Text style={regionSheet.title}>Region Scope</Text>
          <Text style={regionSheet.subtitle}>Sets the recognition context based on</Text>
          <View style={regionSheet.list}>
            {REGIONS.map((r, i) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.7}
                style={[regionSheet.item, r === value && regionSheet.itemActive, i < REGIONS.length - 1 && regionSheet.itemBorder]}
                onPress={() => { onChange(r); onClose(); }}
              >
                <Text style={regionSheet.itemFlag}>{REGION_FLAGS[r]}</Text>
                <Text style={[regionSheet.itemText, r === value && regionSheet.itemTextActive]}>{r}</Text>
                {r === value && <Text style={regionSheet.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={regionSheet.cancelBtn} activeOpacity={0.7} onPress={onClose}>
            <Text style={regionSheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const regionSheet = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 48, borderWidth: 1, borderColor: Colors.border },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong, alignSelf: 'center', marginBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, marginTop: 4 },
  list: { backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  itemActive: { backgroundColor: Colors.primaryMuted },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.separator },
  itemFlag: { fontSize: 22 },
  itemText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  itemTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  check: { fontSize: 16, color: Colors.primary, fontWeight: FontWeight.semibold },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: FontSize.md, color: Colors.textSecondary },
});

// Att presentera en RN <Modal> direkt i en Alert-callback kan sväljas tyst
// på iOS — alertens dismiss-animation pågår fortfarande när handlern kör, och
// en presentation mitt i en transition no-op:ar. Samma defensiva delay som
// MODAL_SWAP_DELAY_MS i app/index.tsx (där Modal→Modal gav exakt den buggen).
const ALERT_TO_MODAL_DELAY_MS = 350;

// Delad copy för single-player-approve-spärren så ALLA approve-vägar
// (ApproveToggle, "Approve All"-mastern, join-popupens Approve och
// Approve + Add to Friend list) säger exakt samma sak.
const SINGLE_PLAYER_APPROVE_BLOCK: [string, string] = [
  'Single player mode',
  'Can not be approved due to Single player mode. Please change to Multiplayer before approval.',
];

/** Prio för `singlePlayerDefault`-seeden: `lobbyType`-paramet (= host:s
 *  explicita val i "Start New Game"-panelen på Home / Final Leaderboard) >
 *  `fallback` (carry-over lobby_settings > profilens host-default). Utan
 *  param (äldre navigation) gäller fallback:en oförändrat.
 *
 *  Module-level och ren — så den aldrig blir en dependency i seed-effekten
 *  (`lobbyType` ligger redan där och är allt funktionen läser).
 *  '1v1' MÅSTE ge false: alla remote-guards är gated på
 *  `gameMode === 'remote-1v1' && !singlePlayerDefault`. */
function resolveSeedSinglePlayer(lobbyType: string | undefined, fallback: boolean) {
  if (lobbyType === '1v1') return false;
  if (lobbyType === 'single') return true;
  if (lobbyType === 'multiplayer') return false;
  return fallback;
}

// ─── Add Player Modal ─────────────────────────────────────────────────────────

type AddPlayerAssistance = 'minimal' | 'standard' | 'full';
const ADD_PLAYER_ASSISTANCE_OPTIONS: { id: AddPlayerAssistance; label: string }[] = [
  { id: 'full',     label: 'Full' },
  { id: 'standard', label: 'Standard' },
  { id: 'minimal',  label: 'Minimal' },
];

// Remote 1v1: gemensam hjälpnivå för båda spelarna (host väljer i lobbyn).
// Etiketterna speglar MEDVETET resten av appen (Profile, Add Player,
// player-edit, leaderboard-metaraden) — samma nivå ska heta samma sak
// överallt. Håll listan i synk med ADD_PLAYER_ASSISTANCE_OPTIONS ovan.
const REMOTE_ASSISTANCE_OPTIONS: { id: LobbyRemoteAssistance; label: string }[] = [
  { id: 'full',     label: 'Full' },
  { id: 'standard', label: 'Standard' },
  { id: 'minimal',  label: 'Minimal' },
];

// Mock-list över "redan tagna" playerNames — synced med hemskärmens
// motsvarande lista i app/index.tsx så Add Player-flödet känner
// samma collisions som Join as Guest. TODO (backend): byt mot riktig
// playerName-uniqueness-check.
const TAKEN_PLAYER_NAMES_LOBBY = new Set([
  'player one', 'anna', 'kalle', 'admin', 'test', 'guest', 'host', 'quizvibe',
]);

type AddPlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function validateAddPlayerName(name: string, existingNames?: Set<string>): 'available' | 'taken' | 'invalid' {
  const trimmed = name.trim();
  // Format: Abcdef- eller Abcdef-1234567 (1-10 letters + dash + 0-7 digits).
  if (!isPlayerNameFormatValid(trimmed)) return 'invalid';
  // Olämpliga ledande par (synced med auto-gen-blocklistan).
  if (hasBlockedLetterLead(trimmed)) return 'invalid';
  if (containsProfanity(trimmed)) return 'invalid';
  // Reserverat: brand-namnet "quizvibe" (case-insensitive) får inte ingå.
  if (containsBlockedLetterSubstring(trimmed)) return 'invalid';
  if (TAKEN_PLAYER_NAMES_LOBBY.has(trimmed.toLowerCase())) return 'taken';
  // Kollar mot befintliga spelare i lobbyn (case-insensitive).
  if (existingNames?.has(trimmed.toLowerCase())) return 'taken';
  return 'available';
}

// Endpoints renderas med "or earlier"/"or later"-suffix eftersom de
// representerar öppna intervall (samma framing som Profile/Register/Guest).
function formatAddPlayerBirthYear(year: number): string {
  if (year === MIN_BIRTH_YEAR) return `${year} or earlier`;
  if (year === MAX_BIRTH_YEAR) return `${year} or later`;
  return String(year);
}

function AddPlayerModal({ visible, onClose, onAdd, takenGuestLetters, existingNames }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, age: number, assistance: AddPlayerAssistance) => void;
  /** Bokstäver som redan används som identifierar-suffix på Guest-spelare
   *  i lobbyn (t.ex. {'A', 'C'} om GuestA + GuestC redan finns). Filtreras
   *  bort vid auto-genereringen så två guests inte får samma versal-bokstav. */
  takenGuestLetters?: Set<string>;
  /** Alla nuvarande spelarnamn i lobbyn (lowercase) — förhindrar dubletter. */
  existingNames?: Set<string>;
}) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [assistance, setAssistance] = useState<AddPlayerAssistance>('full');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [playerNameStatus, setPlayerNameStatus] = useState<AddPlayerNameStatus>('idle');
  const [playerNameKbMode, setPlayerNameKbMode] = useState<'letter' | 'digit'>('letter');
  const [playerNameFocused, setPlayerNameFocused] = useState(false);
  // Split-field PlayerName: separat ref per fält (letter + digit).
  const playerNameLettersRef = useRef<TextInput>(null);
  const playerNameDigitsRef = useRef<TextInput>(null);
  // Spårar visible-transition så Auto-fyll bara triggar vid open (inte vid
  // re-render efter manuell rensning).
  const prevVisibleRef = useRef(false);

  // Återställ allt när modalen stängs (med liten delay för slide-animation)
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setName('');
        setBirthYear(null);
        setAssistance('full');
        setYearPickerOpen(false);
        setPlayerNameStatus('idle');
        setPlayerNameFocused(false);
        setPlayerNameKbMode('letter');
        prevVisibleRef.current = false;
      }, 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // Auto-fyll Player Name vid öppning. Använder "Guest"-prefix precis som
  // Join-as-Guest-flödet så namnet signalerar "lokal gäst" snarare än
  // registrerad user. excludeLetters skickas in så två guests i samma lobby
  // inte får samma identifierar-bokstav (GuestA + GuestB istället för
  // GuestA + GuestA). Manuell ändring återställer status till 'idle' och
  // kräver Check innan fältet räknas validerat igen.
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;
    if (visible && !wasVisible && name === '') {
      // "Guest"-prefix → "GuestA-1234567" (6 letters totalt + 7 digits).
      const generated = generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, {
        prefix: 'Guest',
        excludeLetters: takenGuestLetters,
      });
      setName(generated);
      setPlayerNameStatus('available');
    }
  }, [visible, name, takenGuestLetters]);

  // Sekventiella låsnings-gates — speglar Join-as-Guest-formen exakt
  // (utan code-steget).
  const yearUnlocked = playerNameStatus === 'available';
  const assistanceUnlocked = yearUnlocked && birthYear !== null;
  const isFormValid = playerNameStatus === 'available' && birthYear !== null;

  const handleCheckPlayerName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Auto-inserta dash om användaren bara typat letters innan Check.
    const normalized = normalizePlayerName(trimmed);
    if (normalized !== name) setName(normalized);
    Keyboard.dismiss();
    setPlayerNameStatus('checking');
    // Snabb lokal validering (format + profanity + lobby-dubletter).
    const localResult = validateAddPlayerName(normalized, existingNames);
    if (localResult !== 'available') {
      setPlayerNameStatus(localResult);
      return;
    }
    // Riktigt uniqueness-check mot Supabase: om namnet finns → 'taken'.
    try {
      const exists = await playerNameExists(normalized);
      setPlayerNameStatus(exists ? 'taken' : 'available');
    } catch {
      setPlayerNameStatus('available');
    }
  };

  const handleRemoveName = () => {
    setName('');
    setPlayerNameStatus('idle');
    setPlayerNameKbMode('letter');
    playerNameLettersRef.current?.focus();
  };

  const applyAddGenerated = (generated: string) => {
    setName(generated);
    setPlayerNameStatus('available');
    Keyboard.dismiss();
  };

  // Auto-generera Player Name. Två branches:
  //   • Fältet tomt → "Guest"-prefix → "GuestA-1234567".
  //   • Användaren har redan typat letters → fråga "Try to keep PlayerName
  //     letters or not?".
  // excludeLetters: takenGuestLetters skickas till Guest-prefix-grenarna så
  // genereringen aldrig kollar på en bokstav som redan används av en annan
  // guest i lobbyn.
  const handleGenerateName = () => {
    const trimmedLetters = getPlayerNameLetters(name.trim());
    if (trimmedLetters.length > 0) {
      Alert.alert(
        'Auto-generate Player Name',
        'Try to keep PlayerName letters or not?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace all',
            onPress: () => applyAddGenerated(generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, { prefix: 'Guest', excludeLetters: takenGuestLetters })),
          },
          {
            text: 'Keep letters',
            onPress: () => applyAddGenerated(generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, { keepLetters: trimmedLetters })),
          },
        ],
      );
      return;
    }
    applyAddGenerated(generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, { prefix: 'Guest', excludeLetters: takenGuestLetters }));
  };

  // CodeKeyboard skickar tecknet hit. Helpers upprätthåller format per
  // tangenttryck: letters först (max 10, första versal/resten gemener),
  // dash auto-insertas vid första digit-tryck, max 7 digits.
  const handlePlayerNameKeyPress = (char: string) => {
    setName((prev) =>
      playerNameKbMode === 'letter'
        ? appendPlayerNameLetter(prev, char)
        : appendPlayerNameDigit(prev, char),
    );
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const handlePlayerNameBackspace = () => {
    setName((prev) =>
      playerNameKbMode === 'letter'
        ? backspacePlayerNameLetters(prev)
        : backspacePlayerNameDigits(prev),
    );
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const togglePlayerNameKbMode = () => {
    if (name.length === 0 && playerNameKbMode === 'letter') return;
    if (playerNameKbMode === 'letter') {
      setPlayerNameKbMode('digit');
      playerNameDigitsRef.current?.focus();
    } else {
      setPlayerNameKbMode('letter');
      playerNameLettersRef.current?.focus();
    }
  };

  const handleAdd = () => {
    if (!isFormValid || birthYear === null) return;
    const age = CURRENT_YEAR - birthYear;
    // Strippa ev. trailing dash så Lobby renderar "Anna" istället för "Anna-"
    // när host la till en gäst utan digits.
    onAdd(normalizePlayerName(name.trim()), age, assistance);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.container}>
          <Text style={modal.title}>Add Guest</Text>
          <Text style={modal.subtitle}>For local guests playing on this phone</Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flexShrink: 1, maxHeight: 420 }}
            contentContainerStyle={{ gap: Spacing.md }}
          >
            {/* PlayerName — måste valideras mot taken-list/profanity innan
                Year låses upp. Speglar Join-as-Guest-flödet 1:1. */}
            <View style={modal.fieldGroup}>
              <Text style={modal.fieldLabel}>Player Name</Text>
              <View style={modal.playerNameRow}>
                <TextInput
                  ref={playerNameLettersRef}
                  style={[
                    modal.inputText,
                    modal.playerNameLettersInput,
                    playerNameKbMode === 'letter' && playerNameStatus !== 'available' && modal.playerNameInputActive,
                  ]}
                  placeholder="Anna"
                  placeholderTextColor={Colors.textDisabled}
                  value={getPlayerNameLetters(name)}
                  maxLength={PLAYER_NAME_MAX_LETTERS}
                  editable={playerNameStatus !== 'checking'}
                  showSoftInputOnFocus={false}
                  // Cursor låst efter sista tecknet — användaren kan inte
                  // markera text eller flytta cursor in i mitten. Backspace
                  // är enda sättet att radera och tar alltid sista tecknet.
                  selection={{
                    start: getPlayerNameLetters(name).length,
                    end: getPlayerNameLetters(name).length,
                  }}
                  selectTextOnFocus={false}
                  contextMenuHidden={true}
                  onFocus={() => {
                    setPlayerNameKbMode('letter');
                    setPlayerNameFocused(true);
                  }}
                  onBlur={() => setPlayerNameFocused(false)}
                />
                <Text style={modal.playerNameSeparator}>–</Text>
                <TextInput
                  ref={playerNameDigitsRef}
                  style={[
                    modal.inputText,
                    modal.playerNameDigitsInput,
                    playerNameKbMode === 'digit' && playerNameStatus !== 'available' && modal.playerNameInputActive,
                    getPlayerNameLetters(name).length === 0 && modal.playerNameInputDisabled,
                  ]}
                  placeholder="1234"
                  placeholderTextColor={Colors.textDisabled}
                  value={getPlayerNameDigits(name)}
                  maxLength={PLAYER_NAME_MAX_DIGITS}
                  editable={playerNameStatus !== 'checking' && getPlayerNameLetters(name).length > 0}
                  showSoftInputOnFocus={false}
                  selection={{
                    start: getPlayerNameDigits(name).length,
                    end: getPlayerNameDigits(name).length,
                  }}
                  selectTextOnFocus={false}
                  contextMenuHidden={true}
                  onFocus={() => {
                    if (getPlayerNameLetters(name).length === 0) {
                      playerNameLettersRef.current?.focus();
                      return;
                    }
                    setPlayerNameKbMode('digit');
                    setPlayerNameFocused(true);
                  }}
                  onBlur={() => setPlayerNameFocused(false)}
                />
                <TouchableOpacity
                  onPress={handleCheckPlayerName}
                  disabled={!name.trim() || playerNameStatus === 'checking' || playerNameStatus === 'available'}
                  style={[
                    modal.checkBtn,
                    (!name.trim() || playerNameStatus === 'checking') && modal.checkBtnDisabled,
                    playerNameStatus === 'available' && modal.checkBtnDone,
                  ]}
                >
                  <Text
                    style={[
                      modal.checkBtnText,
                      playerNameStatus === 'available' && modal.checkBtnTextDone,
                    ]}
                  >
                    {playerNameStatus === 'checking' ? '…'
                      : playerNameStatus === 'available' ? '✓'
                      : 'Check'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={modal.playerNameActionRow}>
                <TouchableOpacity
                  onPress={handleRemoveName}
                  disabled={name.length === 0 || playerNameStatus === 'checking'}
                  style={[
                    modal.nameActionBtn,
                    (name.length === 0 || playerNameStatus === 'checking') &&
                      modal.nameActionBtnDisabled,
                  ]}
                >
                  <Text style={modal.nameActionBtnText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGenerateName}
                  disabled={playerNameStatus === 'checking'}
                  style={[
                    modal.nameActionBtn,
                    playerNameStatus === 'checking' &&
                      modal.nameActionBtnDisabled,
                  ]}
                >
                  <Text style={modal.nameActionBtnText}>Auto-generate</Text>
                </TouchableOpacity>
              </View>
              {playerNameStatus === 'idle' && (
                <Text style={modal.statusHint}>
                  Format: 1-{PLAYER_NAME_MAX_LETTERS} letters, 0-{PLAYER_NAME_MAX_DIGITS} digits
                </Text>
              )}
              {playerNameStatus === 'checking' && (
                <Text style={modal.statusHint}>Checking availability…</Text>
              )}
              {playerNameStatus === 'available' && (
                <Text style={[modal.statusHint, modal.statusHintOk]}>
                  ✓ Player Name is available
                </Text>
              )}
              {playerNameStatus === 'taken' && (
                <Text style={[modal.statusHint, modal.statusHintError]}>
                  ✗ Player Name already taken — try another
                </Text>
              )}
              {playerNameStatus === 'invalid' && (
                <Text style={[modal.statusHint, modal.statusHintError]}>
                  ✗ Player Name not allowed — must follow format and avoid blocked combinations
                </Text>
              )}
            </View>

            {/* Year of birth — drop-down picker (låst tills playerName validerat) */}
            <View
              style={[modal.fieldGroup, !yearUnlocked && modal.fieldGroupLocked]}
              pointerEvents={yearUnlocked ? 'auto' : 'none'}
            >
              <Text style={modal.fieldLabel}>Competition Year of Birth</Text>
              <TouchableOpacity
                style={[
                  modal.yearTrigger,
                  yearUnlocked && birthYear === null && modal.yearTriggerActive,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss();
                  setYearPickerOpen(true);
                }}
              >
                <Text
                  style={[
                    modal.yearTriggerText,
                    birthYear === null && modal.yearTriggerPlaceholder,
                    yearUnlocked && birthYear === null && modal.yearTriggerPlaceholderActive,
                  ]}
                >
                  {birthYear === null ? 'Select year' : formatAddPlayerBirthYear(birthYear)}
                </Text>
                <Text style={modal.yearTriggerArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Assistance level (låst tills year valt). Default 'standard'
                är förvalt så användaren kan submit:a direkt efter year-pick. */}
            <Text
              style={[
                modal.statusHint,
                !assistanceUnlocked && modal.fieldGroupLocked,
              ]}
            >
              Use default or select prefered setup
            </Text>
            <View
              style={[modal.fieldGroup, !assistanceUnlocked && modal.fieldGroupLocked]}
              pointerEvents={assistanceUnlocked ? 'auto' : 'none'}
            >
              <Text style={modal.fieldLabel}>Assistance Level</Text>
              <View style={modal.skillRow}>
                {ADD_PLAYER_ASSISTANCE_OPTIONS.map((opt) => {
                  const isSelected = assistance === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[modal.skillBtn, isSelected && modal.skillBtnActive]}
                      onPress={() => setAssistance(opt.id)}
                    >
                      <Text
                        style={[
                          modal.skillBtnText,
                          isSelected && modal.skillBtnTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {playerNameFocused && (
            <CodeKeyboard
              mode={playerNameKbMode}
              letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              onPress={handlePlayerNameKeyPress}
              onBackspace={handlePlayerNameBackspace}
              onModeToggle={togglePlayerNameKbMode}
              // Digit-mode kräver minst 1 letter — toggle dimmas i letter-mode
              // tills letter-sektionen har innehåll.
              modeToggleDisabled={playerNameKbMode === 'letter' && name.length === 0}
            />
          )}

          <TouchableOpacity
            style={[modal.joinBtn, !isFormValid && modal.joinBtnDisabled]}
            onPress={handleAdd}
            disabled={!isFormValid}
          >
            <Text style={modal.joinBtnText}>Add to Lobby</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={modal.cancelBtn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Year picker som conditional overlay (inte nested Modal) */}
        {yearPickerOpen && (
          <View style={modal.yearPickerOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setYearPickerOpen(false)}
            />
            <View style={modal.yearPickerSheet}>
              <View style={modal.yearPickerHandle} />
              <Text style={modal.title}>Select Year of Birth</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {BIRTH_YEARS.map((year) => {
                  const selected = birthYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setBirthYear(year);
                        setYearPickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {formatAddPlayerBirthYear(year)}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity onPress={() => setYearPickerOpen(false)} style={modal.cancelBtn}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── WaveDots ─────────────────────────────────────────────────────────────────

/**
 * Tre prickar som hoppar i sekvens (våg-effekt) — används som loading-
 * indikator i deleting-lobby-overlay:n. Varje prick har en 900ms cykel
 * (300ms upp+ner + 600ms vila) men startas med 150ms-offset så de ser
 * ut att rulla som en våg från vänster till höger.
 */
// Cross-player seen-historik: publicera enhetens lokala 20-sessions fråge-
// historik till egen lobby_players-rad (migration 0026) så host kan
// exkludera frågor som NÅGON deltagare sett i sina senaste 20 spel — även i
// Pass-the-Phone där ingen quiz_sync-broadcast-channel finns. Guests utan
// profil har tom historik → skippas (kolumnen förblir NULL). Fire-and-forget:
// join-flödet blockas aldrig; saknad migration ger bara en console.warn i
// updateOwnSeenQuestionIds. Cap 500 ids (slice(-500) behåller nyaste —
// Set-iteration = insertion order = äldsta session först).
function publishOwnSeenHistory(roomCode: string, playerId: string): void {
  Promise.all([loadSeenQuestionIds(), loadLastSessionIds()])
    .then(([seen, last]) => {
      if (seen.size === 0 && last.size === 0) return;
      return updateOwnSeenQuestionIds(roomCode, playerId, {
        seen: [...seen].slice(-500),
        last: [...last].slice(-500),
      });
    })
    .catch(() => {});
}

/**
 * Guest alias: publicera det inloggade kontots playerName på egen
 * lobby_players-rad (migration 0030) så övriga i lobbyn ser vilket konto
 * som sitter bakom ett guest-namn. `profiles` är own-row-only i RLS —
 * ingen annan klient kan slå upp namnet, ägaren måste publicera det.
 *
 * Publiceras ALLTID när en profil finns; renderingen (PlayerRow) avgör om
 * det faktiskt är ett alias genom att jämföra mot visningsnamnet. Det
 * håller display-regeln på ETT ställe och gör att aliaset dyker upp rätt
 * även om host döper om spelaren i efterhand.
 *
 * Ren guest (ingen profil) → no-op, kolumnen förblir null.
 * Fire-and-forget: aliaset är kosmetiskt och får aldrig blockera join.
 * MÅSTE anropas efter att egen rad finns i DB (UPDATE:n träffar annars
 * 0 rader) — därav kedjning på upsert/setLobbyPlayers-promisen.
 */
function publishOwnAccountAlias(roomCode: string, playerId: string): void {
  loadProfile()
    .then((profile) => {
      const account = profile?.playerName?.trim();
      if (!account) return;
      return publishOwnAccountName(roomCode, playerId, account);
    })
    .catch(() => {});
}

/**
 * Alert.alert som en await-bar Promise<boolean>. Används för guards inuti
 * redan-async flöden (t.ex. handleStartGame) där vi vill avbryta på Cancel
 * utan att lägga till en parameter + rekursion à la ptpConfirmed — och utan
 * att riskera Pressable-event-fällan där ett syntetiskt event landar i ett
 * defaultat argument. Dismiss (Android back) räknas som Cancel.
 */
function confirmAsync(title: string, message: string, confirmLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

function WaveDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycleMs = 900;
    const upMs = 150;
    const downMs = 150;
    const makeDot = (val: Animated.Value, offsetMs: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(offsetMs),
          Animated.timing(val, { toValue: -6, duration: upMs, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: downMs, useNativeDriver: true }),
          Animated.delay(cycleMs - offsetMs - upMs - downMs),
        ]),
      );
    const a1 = makeDot(dot1, 0);
    const a2 = makeDot(dot2, 150);
    const a3 = makeDot(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={waveDotsStyles.row}>
      <Animated.Text style={[waveDotsStyles.dot, { transform: [{ translateY: dot1 }] }]}>.</Animated.Text>
      <Animated.Text style={[waveDotsStyles.dot, { transform: [{ translateY: dot2 }] }]}>.</Animated.Text>
      <Animated.Text style={[waveDotsStyles.dot, { transform: [{ translateY: dot3 }] }]}>.</Animated.Text>
    </View>
  );
}

const waveDotsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginHorizontal: 1,
    // lineHeight säkrar att translateY rörelsen inte klipps av container:s
    // tighta vertikala mått runt textens baseline.
    lineHeight: 20,
  },
});

// SequentialDots flyttat till src/components/SequentialDots.tsx för delning
// med GetReadyIntro (icke-host:s "Waiting for Host to start quiz"-ruta).


// Approved-kapacitetsruta som äger sin egen blink-animation. opacity är ALLTID
// samma Animated.Value (byter aldrig typ mellan static-number och Animated.Value,
// vilket annars gör att native-driver-bindningen inte re-attachar → rutan fastnar
// på fast sken). Loopen startas/stoppas via `blinking`-propen.
function ApprovedBox({
  blinking,
  style,
  children,
}: {
  blinking: boolean;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!blinking) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blinking, opacity]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

// Blinkande text som äger sin egen blink-loop (startas i egen effekt vid mount)
// så den blinkar pålitligt även när den monteras om (t.ex. när "Players Waiting"
// dyker upp igen efter att host rejectat en spelare). Att binda till ett delat,
// redan löpande native-värde gör annars att en nyss-monterad nod fastnar på en
// svag opacity utan att animera.
function BlinkingLabel({
  style,
  children,
  duration = 600,
}: {
  style: StyleProp<TextStyle>;
  children: React.ReactNode;
  duration?: number;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, duration]);
  return (
    <Animated.Text style={[style, { opacity }]} numberOfLines={1}>
      {children}
    </Animated.Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

// Synlig OFF-färg för source matrix-switchar. Colors.borderStrong är
// rgba(255,255,255,0.14) = nästan osynlig på mörk bakgrund.
const MATRIX_SWITCH_OFF = '#3A5068';

export default function LobbyScreen() {
  const {
    code,
    isHost,
    asGuest,
    guestHost,
    guestName,
    guestBirthYear,
    guestAssistance,
    guestReplays,
    carryOverPlayerId,
    lobbyType,
    rematchLocked,
  } = useLocalSearchParams<{
    code: string;
    isHost: string;
    asGuest?: string;
    /** 'true' när lobbyn skapats via "Start Game as Guest" — hosten spelar
     *  under Guest-identitet (guestName/guestBirthYear) utan profil.
     *  Driver isGuestHost som låser settings-UI:t + skippar credit-gaten. */
    guestHost?: string;
    guestName?: string;
    guestBirthYear?: string;
    guestAssistance?: string;
    /** Antal Play Again-replays guest-hosten redan förbrukat ('0' default).
     *  Sätts till '1' av quiz.tsx:s goToNewLobby när guest host trycker
     *  Play Again — forwardas till quiz så Final Leaderboard kan dölja
     *  Play Again efter den andra spelomgången (max 1 replay). */
    guestReplays?: string;
    /** Play Again carry-over: non-host:s player_id från föregående spel.
     *  Sätts av quiz.tsx vid navigation → LobbyScreen hoppar DB-beroende
     *  dup-detection och ärver rätt id direkt. */
    carryOverPlayerId?: string;
    /** '1v1' när lobbyn skapades via HostTypeModal-valet "1vs1 Matches" på
     *  Home (registrerad ELLER guest host). Seedar gameMode='remote-1v1'
     *  hårt — den renodlade 1vs1-lobbyn visar ingen Game Mode-sektion så
     *  läget kan aldrig bytas inne i lobbyn. */
    lobbyType?: string;
    /** 'true' när lobbyn skapades via Re-match/Replay från Final Leaderboard.
     *  Spelaruppsättningen är då LÅST till exakt spelarna från förra spelet.
     *  Skickas som param (utöver rums-radens rematch_locked) så låst läge
     *  renderas redan på första framen, utan att vänta på en DB-läsning. */
    rematchLocked?: string;
  }>();
  // Om ingen kod skickas (t.ex. om man öppnar lobby-tabben direkt) genereras en.
  // useMemo ser till att koden är stabil över re-renders.
  const roomCode = useMemo(() => code ?? generateRoomCode(), [code]);
  const hostMode = isHost === 'true';
  const guestMode = asGuest === 'true';
  // Sann när användaren joinat lobbyn via guest-formen *och* har ett namn
  // i URL-params. Driver TopUserBanner:s guest-pill samt tap-handler-
  // branchen som öppnar Leave-room-sheet:n istället för Profile-tabben.
  const isGuestInRoom = guestMode && !!guestName?.trim();
  // Guest HOST — lobbyn skapades via "Start Game as Guest". Hosten spelar
  // under Guest-identitet (även om en profil råkar finnas på enheten).
  // Låser settings till fasta värden (max 4 rundor/spelare, fulla
  // era-spannet, inga paket, Mixerboard pinnad ON), döljer credits-pill +
  // Share invite och skippar credit-gaten i handleStartGame.
  // Svarstid (30/45/60) och assistance (Full/Standard/Minimal) är FRIA
  // sedan 2026-08-08 — bara Game era är fast av spelinställningarna.
  const isGuestHost = hostMode && guestHost === 'true' && !!guestName?.trim();
  // Renodlad 1vs1-lobby (2026-08-07): skapades via "1vs1 Matches"-valet på
  // Home. Driver den forcerade remote-1v1-seeden (host-sidan). UI-gating
  // sker däremot på gameMode === 'remote-1v1' (state) så non-host — som får
  // gameMode via settings-syncen — döljer samma sektioner utan egen param.
  const is1v1Lobby = lobbyType === '1v1';
  // Re-match/Replay-lobby (Peter 2026-08-25): uppsättningen är låst till
  // spelarna från föregående spel, så aggregatet förblir en rättvis serie.
  // Konsekvenser: "+ Add Player" döljs, papperskorg + Approve-toggle döljs,
  // Game Mode + Players blir en statisk indikator (VARJE lägesbyte ejectar
  // spelare), Start Game blockeras tills alla är tillbaka, och join-gaten
  // på Home släpper bara in spelare som redan finns i lobbyn.
  // Host har fortfarande "Delete this Game Lobby" som utväg.
  const isRematchLobby = rematchLocked === 'true';
  // 'single' / 'multiplayer' är de två andra lobbyType-värdena (2026-08-24):
  // Single vs Multiplayer väljs numera redan på Home / Final Leaderboard i
  // stället för via Game Mode-rutorna här inne. De läses av
  // resolveSeedSinglePlayer (module-level ovan) och styr ENBART
  // singlePlayerDefault-seeden — Game Mode-sektionen renderas som vanligt i
  // båda fallen, så host kan fritt byta läge inne i lobbyn.

  // Initial = tom; mount-useEffect på [code, guestMode, ..., hostMode] sätter
  // till [SEED_PLAYERS[0]] för host eller [] för non-host. SEED_PLAYERS som
  // initial-värde skrev tidigare 4 mock-rader till DB innan mount-effect:n
  // hann clamp:a → 3 mock-rader stannade i DB och host:s Realtime-fetchNewJoiners
  // ärvde in dem igen vid varje fresh lobby-entry.
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);

  // Eget player-id (host:s seed-id för host, eller den auto-tillagda
  // guest/joiner-id:n för non-hosts). Används av leave-flödet för att
  // markera rätt spelare som "left" i leftPlayers-storen så övriga ser
  // status:en när de öppnar lobby:n.
  const ownPlayerIdRef = useRef<string | null>(null);
  // Markeras true när self-rad först ses i stored från DB. Används av
  // syncFromStore för att skilja "vår INSERT har inte propagerat än"
  // (false → injecta från prev) från "host har raderat oss via DB DELETE"
  // (true men nu missing → trigga eject-popup). Resetas vid rumkods-byte
  // i mount-useEffect:n.
  const selfEverInStoredRef = useRef(false);
  // Markeras true när seed-effektens Promise.all är klar. Debounce-effekten
  // skriver INTE till setLobbySettings förrän seeding är klar — annars kan
  // debounce:n skriva med default-värden (spotifyEnabled=false) 300 ms
  // innan Promise.all resolvar och skapa en "stored"-post som sedan vinner
  // mot profil-defaults i if (!stored)-grenen.
  const lobbySeededRef = useRef(false);
  // Guard mot dubbel-navigation till /quiz när game_started detekteras.
  // Polling-effekten fyrar både via Realtime-tick OCH 2s-interval — utan
  // denna ref skulle vi anropa router.push flera gånger innan unmount.
  const navigatedToQuizRef = useRef(false);

  // Gold-glow-animation för host:s Start Game-knapp. Två native-driver-loops
  // som "andas" tillsammans: halo-opacity (0.4 ↔ 0.85) + subtil scale-pulse
  // (1 ↔ 1.03). Subtil pulse — knappen är CTA, inte distraherande hopp-effekt.
  // Loopen startas/stoppas via useEffect-deps på hostMode så non-host:s aldrig
  // kör onödig animation.
  const startGlow = useRef(new Animated.Value(0.4)).current;
  const startPulse = useRef(new Animated.Value(1)).current;

  // Cross-fade host-badge: "You are the host" → "Invite friends" → "Single
  // or multiplayer game". I 1vs1-lobbyn hoppas den tredje frasen över —
  // varken single player eller fler än 2 spelare finns där (Peter 2026-08-07).
  const hostBadgeOp0 = useRef(new Animated.Value(1)).current;
  const hostBadgeOp1 = useRef(new Animated.Value(0)).current;
  const hostBadgeOp2 = useRef(new Animated.Value(0)).current;
  const hostBadgeIdxRef = useRef(0);

  useEffect(() => {
    // Animationen körs för båda host (Start Game-knappen) och non-host
    // (Waiting for Host-statusrutan) — båda har gold-glowing pulse-effekt
    // i samma layout-position. Värdena delas via samma Animated.Value-pair
    // eftersom bara en av rutorna renderas åt gången per role.
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(startGlow, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        Animated.timing(startGlow, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(startPulse, { toValue: 1.03, duration: 1100, useNativeDriver: true }),
        Animated.timing(startPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    );
    glowLoop.start();
    pulseLoop.start();
    return () => {
      glowLoop.stop();
      pulseLoop.stop();
    };
  }, [startGlow, startPulse]);

  // Vid mount OCH vid URL-params-ändring (när lobby-tabben återanvänds över
  // host→guest-transitions inom samma tab-instans, t.ex. host som går home
  // och sen joinar som guest med sin egen kod): kolla pending players från
  // Play Again, annars auto-adda spelaren baserat på guest/non-host/host-flow.
  // Reset:ar players till SEED_PLAYERS + nollar ownPlayerIdRef innan logiken
  // körs så vi inte ärver state från en tidigare lobby-session i samma instans.
  useEffect(() => {
    let cancelled = false;
    // Snäpp scroll-position till toppen vid varje fresh entry. Tab-navigatorn
    // kan annars återanvända samma route-instans och ärva tidigare scroll-
    // position — guest-användare som joinar via Join Game hamnade då mitt
    // på sidan istället för vid headern. requestAnimationFrame ger React
    // chans att rendera en frame så scroll-targeten existerar innan vi
    // anropar scrollTo.
    requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    // Host: starta med BARA host-platshållaren (Alex K. som sedan merge:as
    // med profilens playerName/avatar via mergeProfileIntoHost). Tidigare
    // seedades alla 4 SEED_PLAYERS men det skickar current_player_count=4
    // till rooms-tabellen → joiners ser "Lobby is full" direkt. Mock-spelarna
    // (Sam L./Jordan M./Casey P.) lämnas i SEED_PLAYERS-konstanten för
    // ev. framtida QA-användning men injiceras inte längre automatiskt.
    // Guest host: seed:a host-kortet direkt från guest-params istället för
    // SEED_PLAYERS — ingen profil-merge sker (mergeProfileIntoHost är gated
    // på !isGuestHost). id '1' behålls: host-kort-maskineriet (bl.a. Start
    // Fresh-carry-over i quiz.tsx) antar SEED_PLAYERS[0].id === '1'.
    // type 'guest' på host-raden är signalen non-host-enheter använder för
    // att detektera guest-hostat spel (döljer Play Again på final leaderboard).
    // Non-host: starta med tom lista — polling/Realtime fyller i host:s lista.
    setPlayers(
      hostMode
        ? isGuestHost
          ? [{
              id: '1',
              name: guestName!.trim(),
              emoji: '👤',
              isReady: true,
              type: 'guest',
              age: guestBirthYear
                ? CURRENT_YEAR - parseInt(guestBirthYear, 10)
                : undefined,
              // Nivån väljs på Home:s guest-host-form (och kan sedan ändras
              // i player-edit-sheeten) — var hårdkodad 'full' t.o.m.
              // 2026-08-08. Fallback 'full' för äldre payloads utan param.
              assistance:
                guestAssistance === 'standard' || guestAssistance === 'minimal'
                  ? guestAssistance
                  : 'full',
              hcpComplete: true,
              isHost: true,
              approved: true,
            }]
          : [SEED_PLAYERS[0]]
        : [],
    );
    ownPlayerIdRef.current = null;
    selfEverInStoredRef.current = false;
    navigatedToQuizRef.current = false;
    lobbySeededRef.current = false;
    // Host: seed lobby-wide settings. Prio-ordning:
    //   1. lobby_settings (`stored`) — finns redan i DB om host nyss kom
    //      via "Play again + Keep settings"-flowet (quiz.tsx skrev över
    //      settings till nya rumkoden innan navigation).
    //   2. Profilens "Host default settings"-block (= fallback för fresh
    //      lobbies där ingen lobby_settings-rad ännu finns).
    //   3. Generisk spec (Pass-the-Phone, Max 4, Global, 1981→innevarande
    //      år, ROUNDS_DEFAULT, 30 sek) som hard-baseline.
    // Effekten triggar både vid första mount OCH vid Play Again-återinträde
    // (component re-mountar).
    if (isGuestHost) {
      // Guest host: ingen PROFIL-läsning — även en inloggad user som valt
      // "Start Game as Guest" ska få guest-värdena, inte sina host-defaults.
      // Stored lobby_settings LÄSES däremot för de guest-VARIABLA fälten
      // (gameMode/singlePlayerDefault/roundsCount/spotifyEnabled) så
      // "Play Again + keep players" bevarar guest-hostens val — quiz.tsx:s
      // goToNewLobby skriver carry-over-settings till nya rumkoden innan
      // navigation. Fresh lobby saknar stored-rad → defaults nedan.
      // Låsta fält förblir ALLTID hårdkodade (maxPlayers 4, full era, inga
      // paket, alla source-kategorier ON — Mixerboard är guest-låst).
      // answerResponseSeconds är guest-VARIABEL sedan 2026-08-08 (30/45/60).
      getLobbySettings(roomCode).then((stored) => {
        if (cancelled) return;
        // Renodlad 1vs1-lobby: mode forceras av Home-valet — stored/default
        // ignoreras. Standard-lobby: stale 'remote-1v1' coercas till PtP
        // (remote kan inte längre väljas inne i lobbyn).
        setGameMode(
          is1v1Lobby
            ? 'remote-1v1'
            : (stored?.gameMode ?? 'pass-the-phone') === 'remote-1v1'
              ? 'pass-the-phone'
              : stored?.gameMode ?? 'pass-the-phone',
        );
        // 1v1: singlePlayerDefault MÅSTE vara false — alla remote-guards
        // (start-knapp-swap, handleStartGame, maxPlayers-effekten) är
        // gated på `gameMode === 'remote-1v1' && !singlePlayerDefault`.
        // single/multiplayer: Home-valet vinner över carry-over.
        setSinglePlayerDefault(resolveSeedSinglePlayer(lobbyType, stored?.singlePlayerDefault ?? false));
        setMaxPlayers(is1v1Lobby ? 2 : 4);
        setRegion('Sweden');
        // Clampa mot utbudet {30, 45, 60} — defensivt mot oväntade värden
        // (och mot 15s-alternativet som togs bort 2026-06-08). Fresh guest-
        // lobby defaultar till 30s (Peter 2026-08-08); carry-over av 45/60
        // från föregående guest-lobby respekteras.
        setAnswerResponseSeconds(
          stored?.answerResponseSeconds === 45
            ? 45
            : stored?.answerResponseSeconds === 60
              ? 60
              : 30,
        );
        setEraValues([ERA_MIN, ERA_MAX]);
        // Clampa mot guest-utbudet {2, 4} — defensivt mot oväntade värden.
        setRoundsCount(
          stored?.roundsCount === 2 ? 2 : stored?.roundsCount === 4 ? 4 : ROUNDS_DEFAULT,
        );
        setSelectedExtraPackages([]);
        setSketchEnabled(false);
        // Spotify-carry: attesten re-verifieras av "Spotify not confirmed"-
        // guarden i handleStartGame — ingen egen koll behövs här.
        setSpotifyEnabled(stored?.spotifyEnabled ?? false);
        setEnabledHostPackages([]);
        setYoutubeEnabledCategories(defaultEnabledMainCategories());
        setImagesEnabledCategories(defaultEnabledMainCategories());
        // Släpp debounce-skrivningen till lobby_settings så non-hosts ser
        // de fasta värdena via sin settings-sync.
        lobbySeededRef.current = true;
      });
    } else if (hostMode) {
      Promise.all([loadProfile(), getLobbySettings(roomCode), hasPremiumSubscription()]).then(
        ([profile, stored, premium]) => {
          if (cancelled) return;
          // Om Spotify är sparad som default i profilen måste lobby starta i
          // IndDev-läge (Spotify DJ kräver Individual Devices).
          // Renodlad 1vs1-lobby (lobbyType='1v1' från Home-valet): mode
          // forceras till remote-1v1 — stored/profil ignoreras. Standard-
          // lobby: stale 'remote-1v1' (t.ex. gammal profil-default från
          // innan Remote-rutan togs bort) coercas till Pass-the-Phone.
          const rawSeedGameMode =
            stored?.gameMode ??
            (profile?.spotifyDefaultEnabled ? 'individual-devices' : undefined) ??
            profile?.gameMode ??
            'pass-the-phone';
          const seedGameMode: GameMode = is1v1Lobby
            ? 'remote-1v1'
            : rawSeedGameMode === 'remote-1v1'
              ? 'pass-the-phone'
              : rawSeedGameMode;
          setGameMode(seedGameMode);
          // Clamp mot premium-status: profilen kan ha ett stale maxPlayers=12
          // från en tidigare session med aktiv prenumeration — utan denna
          // clamping sätts 12 EFTER att hasPremium-clamp-effekten kört 4,
          // och effekten re-fyrar inte eftersom hasPremium inte ändrats.
          // Remote 1v1: alltid låst till 2 (host + 1 motståndare).
          if (seedGameMode === 'remote-1v1') {
            setMaxPlayers(2);
          } else {
            const rawMax = profile?.maxPlayers ?? 4;
            setMaxPlayers(!premium && rawMax > 4 ? 4 : rawMax === 2 ? 4 : (rawMax as 4 | 12));
          }
          // 1v1: singlePlayerDefault MÅSTE vara false — alla remote-guards
          // är gated på `gameMode === 'remote-1v1' && !singlePlayerDefault`.
          // single/multiplayer: Home-valet vinner över carry-over + profil.
          // Resolveras EN gång — rounds-clampen nedan MÅSTE läsa samma
          // värde, annars cappas en "Single Game"-lobby mot fel läge.
          const seedSinglePlayer = resolveSeedSinglePlayer(
            lobbyType,
            stored?.singlePlayerDefault ?? profile?.singlePlayerDefault ?? false,
          );
          setSinglePlayerDefault(seedSinglePlayer);
          // V1: bara Sweden — eventuella stored/profile-värden som inte är
          // Sweden ignoreras (legacy från Nordics/Europe/Global-tiden).
          setRegion('Sweden');
          setAnswerResponseSeconds(
            stored?.answerResponseSeconds ??
              profile?.answerResponseSeconds ??
              30,
          );
          const eraFrom = stored?.eraFrom ?? profile?.gameEraFrom ?? 1981;
          const eraTo = stored?.eraTo ?? profile?.gameEraTo ?? ERA_MAX;
          // to golvas till ERA_TO_MIN (1980), from till [ERA_MIN, to - intervall]
          // så seedade/carry-over-värden alltid hamnar i giltigt spann.
          const clampTo = Math.max(ERA_TO_MIN, Math.min(ERA_MAX, eraTo));
          const clampFrom = Math.max(ERA_MIN, Math.min(eraFrom, clampTo - ERA_MIN_INTERVAL));
          setEraValues([clampFrom, clampTo]);
          // Clamp roundsCount mot gameMode:s tak OCH premium-status.
          // stepperMax-logiken (premium krävs för >4 i IndDev) speglas här
          // vid load så ett gammalt sparat värde från en premium-session
          // inte sätts > 4 när premium saknas.
          const savedRounds =
            stored?.roundsCount ?? profile?.roundsDefault ?? ROUNDS_DEFAULT;
          const isIndivPremium =
            premium && seedGameMode === 'individual-devices' && !seedSinglePlayer;
          const initialMax = isIndivPremium ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
          setRoundsCount(
            Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds)),
          );
          // Per-source categories + extra-paket från stored (carry-over) om finns,
          // annars profil-default, annars all 3 (defensive fallback).
          // Extra-paket (2026-07-07 — Premium-inkluderade, ej styckköp):
          //   • stored (Play Again + Keep settings) VINNER — inkl. ett
          //     medvetet tomt Generic-val — men klampas mot premium-status
          //     (utgången premium → []) och profilens enabledHostPackages.
          //   • fresh lobby + premium → auto-aktivera alla enabled paket.
          //   • ej premium → selection förblir [] (Generic).
          const catalogIds = PURCHASED_PACKAGES.map((p) => p.id);
          const enabledIds = (profile?.enabledHostPackages ?? catalogIds).filter(
            (id) => catalogIds.includes(id),
          );
          if (stored) {
            setSelectedExtraPackages(
              premium
                ? stored.selectedExtraPackages.filter((id) => enabledIds.includes(id))
                : [],
            );
            setSketchEnabled(stored.sketchEnabled);
            // 1v1: Spotify är aldrig tillgängligt (kortet göms) — forcera av.
            setSpotifyEnabled(is1v1Lobby ? false : stored.spotifyEnabled);
          } else if (premium) {
            setSelectedExtraPackages(enabledIds);
          }
          setEnabledHostPackages(enabledIds);
          // YouTube categories — prio: stored > profil > all 3.
          // Villkor: !== undefined (ej length > 0) så att [] (explicit av) respekteras.
          const seedYtCats =
            stored?.youtubeEnabledCategories !== undefined
              ? stored.youtubeEnabledCategories
              : profile?.youtubeEnabledCategories !== undefined
                ? profile.youtubeEnabledCategories
                : defaultEnabledMainCategories();
          setYoutubeEnabledCategories(seedYtCats);
          // Images categories — prio: stored > profil > all 3.
          const seedImgCats =
            stored?.imagesEnabledCategories !== undefined
              ? stored.imagesEnabledCategories
              : profile?.imagesEnabledCategories !== undefined
                ? profile.imagesEnabledCategories
                : defaultEnabledMainCategories();
          setImagesEnabledCategories(seedImgCats);
          // Spotify default — prio: stored > profil. Sätts här så toggeln
          // är rätt seedat oavsett om Spotify-callbacken hinner före render.
          // 1v1: alltid av (Spotify-kortet göms i renodlade 1vs1-lobbyn).
          if (!stored) {
            setSpotifyEnabled(is1v1Lobby ? false : profile?.spotifyDefaultEnabled ?? false);
          }
          // Remote 1v1: gemensam hjälpnivå. Carry-over (Play Again) vinner,
          // annars produktdefaulten Full — MEDVETET inte hostens personliga
          // profil-assistance: nivån gäller båda spelarna, så hostens egen
          // inställning ska inte tyst påtvingas motståndaren. Switchen är av
          // i en ny lobby (opt-in) men bärs över vid Play Again.
          setRemoteAssistance(stored?.remoteAssistance ?? 'full');
          setMutualAssistanceEnabled(stored?.mutualAssistanceEnabled ?? false);
          // Tillåt debounce-effekten att skriva till setLobbySettings nu när
          // alla initiala värden är satta. Utan denna guard kan debounce:n
          // hinna skriva med default-värden (spotifyEnabled=false) INNAN
          // Promise.all resolvar — och skapa en "stored"-post som vinner
          // mot profil-defaults i if (!stored)-grenen ovan.
          lobbySeededRef.current = true;
        },
      );
    }
    consumePendingLobbyPlayers().then(async (carriedOver) => {
      if (cancelled) return;
      if (carriedOver && carriedOver.length > 0) {
        setPlayers(carriedOver);
        // För host-flödet med carry-over: own player är hosten i listan.
        const hostInCarry = carriedOver.find((p) => p.isHost);
        if (hostInCarry) ownPlayerIdRef.current = hostInCarry.id;
        return;
      }
      if (guestMode && guestName) {
        const currentYear = new Date().getFullYear();
        const age = guestBirthYear ? currentYear - parseInt(guestBirthYear, 10) : undefined;
        const assistance = (guestAssistance === 'minimal' || guestAssistance === 'standard' || guestAssistance === 'full')
          ? guestAssistance
          : 'standard';
        const guestPlayerId = `guest-${Date.now()}`;
        ownPlayerIdRef.current = guestPlayerId;
        const guestPlayer: LobbyPlayer = {
          id: guestPlayerId,
          name: guestName,
          emoji: '👤',
          isReady: true,
          type: 'guest',
          age,
          assistance,
          hcpComplete: true,
          // Ny joiner landar UNAPPROVED — host får join-approval-popupen
          // (eller auto-approvar via friends-listan för registrerade).
          approved: false,
        };
        // Sätt in gästen direkt efter host (index 1) så de syns högt upp.
        setPlayers((prev) => {
          const hostIdx = prev.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...prev];
          next.splice(insertAt, 0, guestPlayer);
          return next;
        });
        // Publicera egen rad till lobby_players så host:s Realtime-channel
        // får broadcast och hen ser den nya spelaren direkt i sin vy.
        upsertOwnLobbyPlayer(roomCode, guestPlayer)
          // Guest alias: en INLOGGAD user som joinar via guest-formen
          // publicerar sitt kontonamn så host ser vem det är. Kedjat på
          // upsert:en så raden garanterat finns när UPDATE:n körs.
          .then(() => publishOwnAccountAlias(roomCode, guestPlayerId))
          .catch(() => { /* loggas i lobbyPlayers */ });
        // Publicera enhetens fråge-historik för cross-player-exkludering.
        // Guest-join på en enhet med inloggad profil publicerar profilens
        // historik (samma människa); enhet utan profil → tom → no-op.
        publishOwnSeenHistory(roomCode, guestPlayerId);
        // Rensa ev. stale leftPlayers-snapshot för det här player_id:t. Guest
        // får alltid fresh id så normalt finns inget att rensa, men anropet
        // är idempotent och håller koden symmetrisk med code-only-pathen.
        removeLeftPlayer(roomCode, guestPlayerId).catch(() => { /* loggas i leftPlayers */ });
        return;
      }
      if (!hostMode) {
        // Code-only join (ingen guest-form-data): användaren har redan en
        // sparad profil från registreringen. Ladda profilen och lägg in
        // dem som "to be approved by host" så de ser sig själva i lobbyn
        // direkt — de behöver inte vänta på godkännande för att se rummet.
        // Fallback till en generisk "Guest"-rad om profil saknas.
        // Spotify self-attest läses ur profilen (Plan B — ingen OAuth-status)
        // och install-verifieras mot DENNA enhet innan den skrivs till lobbyn.
        //
        // Profil-flaggan kan vara månader gammal — usern kan ha avinstallerat
        // Spotify sedan dess. Checken körs lokalt (enda stället den KAN köras)
        // men resultatet når host via lobby_players.spotify_verified → deras
        // spelarkort visar "Spotify ready"/"No Spotify" på verifierad grund.
        //
        // ENDAST NEDGRADERING: attesterad + saknas → av. Installerad men
        // INTE attesterad → fortsatt av. Toggeln bär avsikt, inte bara
        // förmåga — någon kan ha Spotify installerat och ändå inte vilja ha
        // DJ-rollen (barnets konto, mobildata, vill inte lämna appen).
        //
        // Nedgraderingen skrivs MEDVETET inte tillbaka till profilen: lobby-
        // raden speglar nuläget, profil-toggeln speglar avsikten. Usern ser
        // attest-switchen av med röd ram och kan slå på den igen, vilket går
        // via handleConnectSpotify och dess "Turn on anyway"-varning.
        const profile = await loadProfile();
        const spotifyInstallCheck = await checkSpotifyInstalled();
        const ownSpotifyAttested =
          (profile?.spotifyAppConfirmed ?? false) && spotifyInstallCheck !== 'not-found';
        const currentYear = new Date().getFullYear();
        const age = profile?.birthYear ? currentYear - profile.birthYear : undefined;
        const assistance = profile?.assistance ?? undefined;
        const hcpComplete = !!(assistance && age !== undefined);
        const myPlayerName = profile?.playerName?.trim() || 'You';
        // Anti-duplicate: om lobby_players redan har en non-host-rad med
        // SAMMA playerName (case-insensitive), ÄRV den raden:s id istället
        // för att generera ett nytt. Detta händer t.ex. när host kört
        // "Play again + Keep settings" och carry-over:at non-host:en in i
        // den nya lobbyn — om non-host sedan har skickats till Home (för
        // att de inte hann tappa Approve) och loggar in via Room Code,
        // skulle ett färskt joinerId annars skapa en TVÅA-rad i host:s vy.
        // Genom att återanvända id:t träffar DB-skrivningen befintlig rad
        // istället för att skapa en ny INSERT.
        // Play Again carry-over: quiz.tsx skickar med non-host:s tidigare
        // player_id i URL-param. Använd det direkt utan DB-query — undviker
        // Supabase-replikeringsfördröjning där getLobbyPlayers returnerar tom
        // lista (host:s setLobbyPlayers-skrivning inte synkad än) och vi
        // annars hade genererat ett nytt joiner-${Date.now()}-id, vilket ger
        // två DB-rader med samma playerName och bryter approval-synken.
        let joinerId: string;
        let existingMatch: LobbyPlayer | undefined;
        if (carryOverPlayerId?.trim()) {
          joinerId = carryOverPlayerId.trim();
        } else {
          const existingPlayers = await getLobbyPlayers(roomCode);
          existingMatch = existingPlayers?.find(
            (p) =>
              !p.isHost &&
              p.name.trim().toLowerCase() === myPlayerName.toLowerCase(),
          );
          joinerId = existingMatch?.id ?? `joiner-${Date.now()}`;
        }
        ownPlayerIdRef.current = joinerId;
        // Approved-policy: carry-over (Play Again) är pre-approvad av host:s
        // goToNewLobby (approved=true på alla carry-over-rader) — matcha den
        // så upsert:en nedan inte clobbar. Regular join ärver ev. tidigare
        // approval från befintlig DB-rad, annars false — host approvar via
        // join-approval-popupen (eller auto-approve via friends-listan).
        const joinerApproved = carryOverPlayerId?.trim()
          ? true
          : existingMatch?.approved ?? false;
        const joiner: LobbyPlayer = {
          id: joinerId,
          name: myPlayerName,
          emoji: profile ? getAvatarEmojiById(profile.selectedAvatarId) : '👤',
          isReady: hcpComplete,
          type: profile ? 'registered' : 'guest',
          age,
          assistance,
          hcpComplete,
          approved: joinerApproved,
          spotifyConnected: ownSpotifyAttested,
        };
        // Sätt non-host:s egna Spotify-attest så Source Mixerboard visar
        // rätt (samma som host-pathen gör i useFocusEffect nedan).
        setSpotifyConnected(ownSpotifyAttested);
        setPlayers((prev) => {
          // Dedupe på id: om syncFromStore-pollen redan har dragit in
          // carry-over-raden (med samma id efter dup-detection-fixet) så
          // ersätt den med vår lokala joiner-payload istället för att
          // insert:a en TVÅA-rad. Annars race-fall: poll:en plockar in
          // raden → vi insert:ar → två rader med samma id syns kort tills
          // nästa poll skriver över local state.
          //
          // Bevara approved från prev om den redan är satt till true.
          // Race: Promise.all-awaiten (~200-500ms) ger syncFromStore tid att
          // köra och sätta approved=true via Realtime/polling. Om vi
          // sedan skriver joiner.approved=false clobbar vi det värdet och
          // non-host ser sig fortfarande som "To be Approved" tills nästa
          // syncFromStore-körning (0-2s). Med denna override bevaras
          // approved=true om host hann approva under väntetiden.
          const existing = prev.find((p) => p.id === joinerId);
          const joinerWithApproval = { ...joiner, approved: existing?.approved ?? joiner.approved };
          const filtered = prev.filter((p) => p.id !== joinerId);
          const hostIdx = filtered.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...filtered];
          next.splice(insertAt, 0, joinerWithApproval);
          return next;
        });
        // Publicera egen rad till lobby_players så host:s Realtime-channel
        // får broadcast och hen ser den nya spelaren direkt i sin vy.
        // Carry-over-path: raden är redan pre-skriven av host (goToNewLobby).
        // Använd claimCarryOverLobbyPlayer (UPDATE user_id + has_left) istället
        // för upsertOwnLobbyPlayer — undviker att skriva approved=false och
        // därmed clobba host:s eventuella pre-approval på carry-over-raden.
        // Regular-path: UPSERT som tidigare (INSERT eller UPDATE hela raden).
        if (carryOverPlayerId?.trim()) {
          // claim sätter user_id + has_left=false; separat upsert skriver approved=true.
          claimCarryOverLobbyPlayer(roomCode, joinerId).catch(() => { /* loggas i lobbyPlayers */ });
          upsertOwnLobbyPlayer(roomCode, joiner)
            .then(() => publishOwnAccountAlias(roomCode, joinerId))
            .catch(() => { /* loggas i lobbyPlayers */ });
        } else {
          upsertOwnLobbyPlayer(roomCode, joiner)
            .then(() => publishOwnAccountAlias(roomCode, joinerId))
            .catch(() => { /* loggas i lobbyPlayers */ });
        }
        // Publicera enhetens fråge-historik för cross-player-exkludering
        // (registrerade users har 20-sessions-historik lokalt; tom → no-op).
        publishOwnSeenHistory(roomCode, joinerId);
        // Rensa ev. stale leftPlayers-snapshot för det ärvda player_id:t.
        // Kritiskt när id:t ärvts från en tidigare Leave Game: AsyncStorage:s
        // leftIds får annars syncFromStore:s self-injection att felaktigt sätta
        // hasLeft=true trots att DB:s has_left nu är false (satt av
        // claimCarryOverLobbyPlayer eller upsertOwnLobbyPlayer).
        // Resultat utan denna rad: re-join via invite/code → spelaren
        // renderas inte (vårt hasLeft-filter exkluderar dem).
        removeLeftPlayer(roomCode, joinerId).catch(() => { /* loggas i leftPlayers */ });
        return;
      }
      // Host-flödet utan carry-over: hostens id är seed-värdet '1' (Alex K.).
      // Sätts som own player så host:s leave-flow (om implementerat senare)
      // kan referera till rätt spelare.
      const seedHost = SEED_PLAYERS.find((p) => p.isHost);
      if (seedHost) ownPlayerIdRef.current = seedHost.id;
    });
    return () => { cancelled = true; };
  }, [code, guestMode, guestName, guestBirthYear, guestAssistance, hostMode, isGuestHost, carryOverPlayerId, lobbyType]);

  // Varje gång Lobby får fokus (t.ex. man kommer tillbaka från Profile-tabben):
  // ladda sparad profil och uppdatera host-spelarkortet med profilens värden.
  // Detta gör att ändringar i Profile (playerName, ålder, assistance, avatar) slår
  // igenom direkt på host-kortet i Lobby.
  // Samtidigt: ladda leftPlayers för rumkoden och markera matchande spelar-
  // kort med hasLeft=true så PlayerRow renderar dem som "LEFT THIS GAME LOBBY".
  useFocusEffect(
    useCallback(() => {
      let active = true;
      // hasPremium från subscriptionStorage parallellt med profil-load.
      // Refreshas vid varje focus så återkomst från Store (efter purchase)
      // direkt unlockar Individual Devices + Max 12 utan extra refresh.
      // Ladda Spotify-self-attest ur profilen (Plan B — ingen OAuth-status).
      if (hostMode) {
        loadProfile().then(async (prof) => {
          if (!active) return;
          // Install-verifiera profil-attesten mot denna enhet — samma
          // nedgraderings-regel som non-host-joinen ovan (attesterad +
          // saknas → av; installerad utan attest → fortsatt av; ingen
          // återskrivning till profilen). Nedgraderingen gatar även
          // spotifyEnabled-seeden nedan, så en host utan Spotify inte
          // tyst startar en lobby med DJ-läget påslaget.
          const installCheck = await checkSpotifyInstalled();
          // Andra active-guard: awaiten ovan öppnar ett nytt fönster där
          // skärmen kan ha tappat fokus innan vi hinner sätta state.
          if (!active) return;
          const attested =
            (prof?.spotifyAppConfirmed ?? false) && installCheck !== 'not-found';
          setSpotifyConnected(attested);
          // Uppdatera host:s spelarkort direkt — setPlayers i Promise.all-grenen
          // nedan fångar spotifyConnected-staten vid closure-skapande (false), inte
          // efter att denna async-operation resolvar. Explicit patch är nödvändigt.
          setPlayers((prev) =>
            prev.map((p) => (p.isHost ? { ...p, spotifyConnected: attested } : p)),
          );
          // Seed spotifyEnabled — prio: carry-over stored lobby setting >
          // profil-default. Kräver self-attest för att aktivera DJ-läget.
          // Guest host: hoppa över seedingen — Spotify startar alltid AV
          // (guest togglar på manuellt i Source Mixerboard om önskat).
          // 1v1-lobby: hoppa också över — Spotify-kortet göms helt och
          // spotifyEnabled ska förbli false (profil-defaulten får inte läcka in).
          if (attested && !isGuestHost && !is1v1Lobby) {
            getLobbySettings(roomCode).then((lobbySt) => {
              if (!active) return;
              // Prefer carry-over value if lobby_settings redan finns (Play Again
              // + Keep Settings skriver spotifyEnabled till nya rumkoden via
              // goToNewLobby). Faller tillbaka till profil-default för fresh lobbies.
              const shouldEnable =
                lobbySt?.spotifyEnabled ?? prof?.spotifyDefaultEnabled ?? false;
              setSpotifyEnabled(shouldEnable);
              setSpotifyAnswerYear(lobbySt?.spotifyAnswerYear ?? prof?.spotifyAnswerYear ?? true);
              setSpotifyAnswerName(lobbySt?.spotifyAnswerName ?? prof?.spotifyAnswerName ?? true);
            });
          }
        });
      }

      Promise.all([
        loadProfile(),
        getLeftPlayers(roomCode),
        getLobbyPlayers(roomCode),
        hasPremiumSubscription(),
      ]).then(([profile, leftSnapshots, stored, premium]) => {
        if (!active) return;
        // Guest host är alltid Free-nivå — en inloggad premium-user som
        // valt "Start Game as Guest" ska inte få premium-auto-beteenden
        // (Max 12-autolås i IndDev, 20-runders stepper, etc.).
        setHasPremium(isGuestHost ? false : premium);
        // Premium-övergångar mid-session för extra-paket (2026-07-07 —
        // paketen ingår i Premium): fyrar bara på en OBSERVERAD övergång
        // (prevPremiumRef init:as till null så första focus-tick aldrig
        // feltolkas som upgrade och clobbar ett medvetet Generic-carry-
        // over). Gated på lobbySeededRef så seed-effekten förblir
        // auktoritativ för initialt state.
        //   • premium tappad (lapse/expiry) → töm selection (Generic).
        //   • premium köpt mid-session (Store-besök → tillbaka) →
        //     auto-aktivera BARA om selection är tom.
        if (hostMode) {
          const effPremium = isGuestHost ? false : premium;
          if (lobbySeededRef.current && prevPremiumRef.current !== null) {
            const catIds = PURCHASED_PACKAGES.map((p) => p.id);
            const enIds = (profile?.enabledHostPackages ?? catIds).filter((id) =>
              catIds.includes(id),
            );
            if (!effPremium && prevPremiumRef.current) {
              setSelectedExtraPackages([]);
            } else if (effPremium && !prevPremiumRef.current) {
              setSelectedExtraPackages((prev) => (prev.length === 0 ? enIds : prev));
            }
          }
          prevPremiumRef.current = effPremium;
        }
        // Speglar Profile:s credits-pill — refresh-logiken i loadProfile
        // top-up:ar `freeGameCredits` till FREE_CREDITS_DAILY_CAP vid första
        // load efter midnatt CET, så lobbyn visar alltid aktuellt värde.
        setFreeGameCredits(profile?.freeGameCredits ?? 0);
        setPlayers((prev) => {
          const leftIds = leftSnapshots.map((s) => s.id);
          // DB has_left-set (Slice 3C-ii cross-device). OR:as med AsyncStorage-
          // baserade leftIds så cross-device-broadcast slår igenom även när
          // AsyncStorage saknar entry (annan device markerade left).
          const dbLeftIds = new Set(
            (stored ?? []).filter((p) => !!p.hasLeft).map((p) => p.id),
          );
          // Steg 1: mappa över befintliga spelare och applicera hasLeft på de
          // som matchar en snapshot. Host:en passerar utan hasLeft (host kan
          // aldrig vara "left" — TopUserBanner-tap navigerar till Profile).
          const mapped = prev.map((p) => {
            // Merge:a bara profil in i seed-host:en när användaren FAKTISKT är
            // host (hostMode=true). När man joinar via kod är man non-host →
            // seed-hosten Alex K. ska visas med sina egna seed-värden, inte
            // få den nuvarande user:s profil-data tilldelad — annars ser det
            // ut som att joinaren är host eftersom HOST-badge:n + ens egen
            // avatar/namn syns på det kortet.
            // Guest host: merge:a ALDRIG profilen — host-kortet bär guest-
            // identiteten (guestName/ålder/Full) även om en profil finns.
            let next = hostMode && !isGuestHost && profile && p.isHost ? mergeProfileIntoHost(p, profile) : p;
            if (next.isHost) {
              // Guest alias på host:s EGET kort: en inloggad user som hostar
              // som Guest visar guest-namnet men ska visa kontot under.
              // Sätts lokalt (profilen finns ju här) i stället för att
              // vänta på DB-roundtrip — kortet ägs lokalt av host.
              if (hostMode && isGuestHost && profile?.playerName) {
                next = { ...next, accountPlayerName: profile.playerName };
              }
              // Rör INTE next.spotifyConnected här — det sätts av den parallella
              // spotify-attest-kedjans setPlayers-patch. Om vi skriver
              // spotifyConnected-state (alltid false i closure vid körning) kan
              // Promise.all-grenen vinna racet och skriva över ett redan korrekt true.
              return next.hasLeft ? { ...next, hasLeft: false } : next;
            }
            const inLeft = leftIds.includes(next.id) || dbLeftIds.has(next.id);
            if (inLeft && !next.hasLeft) return { ...next, hasLeft: true };
            if (!inLeft && next.hasLeft) return { ...next, hasLeft: false };
            return next;
          });
          // Steg 2: injecta snapshot:s som INTE redan finns i listan. Händer
          // när en ny user joinar samma rum efter en tidigare lämning — då
          // finns inte den lämnade spelaren i nya user:s SEED-baseline, men
          // vi vill ändå rendera kortet med "LEFT THIS GAME LOBBY"-styling.
          const existingIds = new Set(mapped.map((p) => p.id));
          const orphanSnapshots = leftSnapshots.filter((s) => !existingIds.has(s.id));
          const orphanPlayers: LobbyPlayer[] = orphanSnapshots.map((s) => ({
            id: s.id,
            name: s.name,
            emoji: s.emoji,
            avatarUri: s.avatarUri,
            isReady: false,
            type: s.type ?? 'guest',
            age: s.age,
            assistance: s.assistance,
            hcpComplete: s.hcpComplete ?? false,
            approved: s.approved,
            hasLeft: true,
          }));
          return [...mapped, ...orphanPlayers];
        });
      });
      return () => {
        active = false;
      };
    }, [roomCode, isGuestHost]),
  );
  const [addModalVisible, setAddModalVisible] = useState(false);
  const ROOM_LOGO_SIZE = 104;
  // Lobby-wide settings — defaults speglar generic-fallback-spec (används
  // bara innan profil-seed-effekten hinner köra). Profile:s host-default
  // settings overridar dessa vid lobby-mount för host (se useEffect nedan).
  const [eraValues, setEraValues] = useState([1981, ERA_MAX]);
  // Era-slidern körs i en delvis okontrollerad-läge under drag: vi
  // uppdaterar INTE values-propen mid-drag eftersom MultiSlider:s
  // componentDidUpdate då återställer pastOne/pastTwo, vilket bryter
  // gestureDx-mattan (= cumulative från drag-start) och får aktiv thumb
  // att drifta visuellt från sin year-label. Lib:ns moveOne/moveTwo
  // blockar redan inaktiv thumb mot minMarkerOverlapDistance, så vi
  // behöver inte heller egen låsning. dragEraValues håller realtids-
  // värdet för box-display + warning; eraValues commitas först i
  // onValuesChangeFinish. dragEraValuesRef speglar state synkront så
  // Finish-handlern alltid läser det senaste värdet utan att vara
  // beroende av render-ordning mellan sista onValuesChange och Finish.
  const [dragEraValues, setDragEraValues] = useState<number[] | null>(null);
  const dragEraValuesRef = useRef<number[] | null>(null);
  const [roundsCount, setRoundsCount] = useState(ROUNDS_DEFAULT);
  const [region, setRegion] = useState<Region>('Sweden');
  // Hur länge spelarna har på sig att svara på en fråga (sekunder). Ingen
  // Lobby-UI än — propageras vidare till quiz.tsx via handleStartGame så
  // host:s profil-default följer med in i spelet.
  const [answerResponseSeconds, setAnswerResponseSeconds] = useState<30 | 45 | 60>(30);
  // gameMode-state declareras längre ner — se rad ~751.
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  // Share invite modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  // Host:s friends-lista, laddad vid lobby-mount (inte lazy som `friends`
  // ovan som fylls först när Share-modalen öppnas). Driver auto-approve av
  // joiners som redan är friends. `null` = ännu inte laddad — join-watcher-
  // effekten väntar tills load:en är klar så en friend aldrig råkar få
  // popupen pga en load-race. Guest host (ingen profil) → loadFriends
  // returnerar [] → auto-approve matchar aldrig.
  const hostFriendsRef = useRef<Friend[] | null>(null);
  const [invitedFriendIds, setInvitedFriendIds] = useState<Set<string>>(new Set());
  // Input för "Add by Player Name"-raden i Share invite — speglar Profile:s
  // friends-modal så host kan lägga till en QuizVibe friend direkt från lobby
  // utan att behöva navigera till Profile först. Nyligen tillagd friend
  // dyker upp i listan med en Invite-knapp redo att tappas.
  const [newFriendPlayerName, setNewFriendPlayerName] = useState('');

  // Ref till lobby:s primär-ScrollView. Används för att snäppa scroll-position
  // till toppen vid varje fresh entry (mount eller URL-params-byte) — utan
  // detta ärver tab-navigatorn ev. tidigare scroll-position när samma route-
  // instans återanvänds, så guest-användare som joinar hamnar mitt på sidan
  // istället för vid headern.
  const mainScrollRef = useRef<ScrollView | null>(null);

  // Guest leave-room sheet — bara aktiv när guestMode är på (gäster har ingen
  // sparad profil och Profile-tabben är meningslös för dem). Tap på guest-
  // pillen i TopUserBanner öppnar sheet:n; "Leave Game Lobby" → Alert-confirm →
  // tillbaka till Home.
  const [guestLeaveSheetVisible, setGuestLeaveSheetVisible] = useState(false);

  // Host Game Credits — speglar Profile:s credits-pill exakt. Värdet läses
  // från sparad profil i useFocusEffect:n nedan så lobbyn alltid visar
  // samma siffra som Profile (och uppdateras direkt om användaren spenderat
  // / fyllts på via daily refresh mellan tab-byten). Engångsköpta Extras
  // (gameCredits) borttagna 2026-07-07 — bara Free + Premium/Unlimited kvar.
  //
  // Seedas från den synkrona profil-spegeln av samma skäl som hasPremium
  // nedan: `useState(0)` renderade en frame med "Free: 0", vilket läser som
  // "slut på credits". Är spegeln kall (undefined/null) står 0 kvar som förut
  // tills focus-effektens loadProfile hinner.
  const [freeGameCredits, setFreeGameCredits] = useState<number>(
    () => getCachedProfile()?.freeGameCredits ?? 0,
  );

  // Host delete-lobby sheet — bara aktiv när hostMode är på. Tap på TopUserBanner-
  // pillen öppnar sheet:n istället för att navigera till Profile (host:s
  // profil hanteras via Profile-tabben i bottom nav). Sheet:n har en
  // destruktiv "Delete this Game Lobby"-knapp + Cancel. Yes på Alert:en
  // gör roomCode inaktiv via deactivateRoom() — kvarvarande non-hosts
  // får då en deletion-popup via polling-detection längre ner.
  const [hostDeleteSheetVisible, setHostDeleteSheetVisible] = useState(false);
  // "No approved players"-dialog vid Start Game i multiplayer-läge utan
  // godkända non-hosts. Custom Modal (inte Alert) eftersom "Approve
  // players"-knappen ska kunna renderas utgråad/disabled när det inte
  // finns några andra spelare alls i lobbyn — native Alert kan inte
  // disable:a enskilda knappar.
  const [noApprovedModalVisible, setNoApprovedModalVisible] = useState(false);
  // Join-approval-popup (host): kö av player-ids som väntar på hostens
  // beslut. En modal åt gången — first-in-first-out; actions (Approve /
  // Approve+AddFriend / Deny / Later) shiftar kön. promptedIdsRef håller
  // ids som redan fått popup (eller auto-approvats) så samma spelare inte
  // re-promptas i loop; ids prunas när spelaren lämnar (hasLeft) eller
  // försvinner ur players[] så en genuin rejoin promptar igen.
  const [joinPopupQueue, setJoinPopupQueue] = useState<string[]>([]);

  // "1vs1 match started"-popup (custom modal istället för native Alert så
  // rubriken "Play" kan stå OVANFÖR knapparna "Now"/"Later"). Delas av
  // host:s Start Game-väg och non-host:s game-started-detektering — båda
  // sätter bara message + playNow-callback.
  const [remoteStartPrompt, setRemoteStartPrompt] = useState<
    { message: string; playNow: () => void } | null
  >(null);
  const promptedIdsRef = useRef<Set<string>>(new Set());
  // Ids som HOST explicit har un-approvat (ApproveToggle av, D-vii unstable-
  // demote). Friend-auto-approve respekterar setet — en friend host medvetet
  // flyttat till waiting re-approvas ALDRIG tyst. Utan setet kan watchern
  // inte skilja host-intent från en stale DB→local-sync (syncNonHostFields
  // kan läsa joiner:s approved=false INNAN hostens bulk-write committat och
  // downgradea en nyss auto-approvad friend — watchern self-heal:ar det
  // fallet genom att re-approva friends som INTE finns i setet). Rensas när
  // spelaren blir approved (valfri väg) eller lämnar.
  const hostUnapprovedIdsRef = useRef<Set<string>>(new Set());
  // Host:s approve-beslut som ännu INTE bekräftats av DB:n — id → önskat
  // värde. Löser flimret mellan "Approved" och "To be Approved" (Peter
  // 2026-08-24): host:s bulk-write (setLobbyPlayers på [players]) är
  // fire-and-forget OCH ekar tillbaka som Realtime-UPDATE på VARJE rad, så
  // syncNonHostFields kan läsa raden innan approve-commiten är synlig, sätta
  // approved=false lokalt, trigga en ny bulk-write, trigga fler UPDATE-
  // events … = oscillation.
  //
  // Kontrakt: så länge en id ligger här ignorerar syncNonHostFields DB:s
  // `approved` för den spelaren (övriga fält syncas som vanligt). När DB
  // äntligen rapporterar samma värde är skrivningen bekräftad och posten
  // tas bort → normal sync återupptas, så en RE-JOIN:s approved=false
  // fortfarande propagerar (vilket är hela skälet till att approved
  // överhuvudtaget syncas hit — se kommentaren vid syncNonHostFields).
  const pendingApprovalRef = useRef<Map<string, boolean>>(new Map());
  // True när non-host har upptäckt att rummet blivit deaktiverat (host
  // har raderat lobby:n). Triggar Alert:en "This Game Lobby has been
  // deleted by Host" → OK-knappen tar dem till Home.
  const [roomDeletedDetected, setRoomDeletedDetected] = useState(false);
  // True när non-host har upptäckt att host har radat dem ur lobby:n
  // (trash-action på deras spelar-rad). Triggar info-popup → OK tar dem
  // till Home. Skiljs från roomDeletedDetected eftersom endast en spelare
  // är drabbad, inte hela rummet.
  const [playerEjectedDetected, setPlayerEjectedDetected] = useState(false);
  // True när non-host (typ ej approved) har upptäckt att host tryckt Start
  // Game utan att approverat dem. Triggar info-popup "Host started game
  // without this user" → OK tar dem till Home. Skiljs från
  // playerEjectedDetected eftersom det rör en helt annan trigger (Start
  // Game vs trash-knappen).
  const [startedWithoutMeDetected, setStartedWithoutMeDetected] = useState(false);
  // True när en REN guest (anon-session, inget QuizVibe-konto) hamnat i en
  // Remote 1vs1-lobby. Backstop för Home:s fail-open join-gate — remote-
  // matcher lagras i 48h och kräver ett konto. Ref:en gör ejectet
  // idempotent så 2s-pollen inte kan trigga markOwnPlayerLeft flera gånger.
  const [remoteGuestBlockedDetected, setRemoteGuestBlockedDetected] = useState(false);
  const remoteGuestEjectedRef = useRef(false);
  // One-shot-guard: host publicerar sitt Guest alias en gång per lobby
  // (players-sync-effekten körs vid varje ändring).
  const hostAliasPublishedRef = useRef(false);
  // True under den korta processing-fasen mellan host:s Yes-konfirmation
  // och navigation till Home. Visar en loading-overlay med "Please Wait —
  // Deleting this Lobby..." + animerade våg-prickar så host:en känner att
  // appen jobbar (undviker upplevelsen av instant-cut till Home).
  const [deletingLobby, setDeletingLobby] = useState(false);

  // True enbart när LobbyScreen är aktiv — stänger av MorseAmbientSound
  // (WebView-baserat ljud) när Stack-navigatorn trycker Quiz ovanpå.
  const [screenFocused, setScreenFocused] = useState(true);

  // Ambient-ljud startar 2.5 s efter att host-välkomst-rösten sagt "QuizVibe".
  const [showAmbient, setShowAmbient] = useState(false);
  // Engångsskydd så välkomst-rösten bara spelas en gång per lobby-session.
  const hasSpokeRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, []),
  );

  // Välkomst-röst "QuizVibe" när host kliver in i lobbyn — en gång per session.
  useEffect(() => {
    if (!hostMode || hasSpokeRef.current) return;
    hasSpokeRef.current = true;
    try {
      Speech.speak('QuizVibe', {
        language: 'en-US',
        pitch: 0.85,
        rate: 0.32,
      });
    } catch {
      // expo-speech saknas i Expo Go — tyst fallback
    }
    const t = setTimeout(() => setShowAmbient(true), 6000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostMode]);

  // Master "Approve All"-state — återställs automatiskt till 'no' när
  // waiting-listan blivit tom (efter approve all eller när ingen väntar).
  const [approveAllValue, setApproveAllValue] = useState<'no' | 'yes'>('no');

  // Game mode toggle (Pass-the-Phone vs Multiplayer Individual Devices)
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');

  // Host-badgens cross-fade-loop (Animated.Values deklareras längre upp).
  // Ligger här nere eftersom den tredje frasens TEXT beror på `gameMode`
  // ("1vs1 challenge" i remote-lobbyn, annars "Single or multiplayer game").
  useEffect(() => {
    if (!hostMode) return;
    const opacities = [hostBadgeOp0, hostBadgeOp1, hostBadgeOp2];
    // Nollställ cykeln vid lägesbyte så fasen alltid startar på
    // "You are the host".
    hostBadgeIdxRef.current = 0;
    hostBadgeOp0.setValue(1);
    hostBadgeOp1.setValue(0);
    hostBadgeOp2.setValue(0);
    const easing = Easing.bezier(0.4, 0, 0.2, 1);
    const cycle = () => {
      const current = hostBadgeIdxRef.current;
      const next = (current + 1) % opacities.length;
      Animated.parallel([
        Animated.timing(opacities[current], { toValue: 0, duration: 2600, easing, useNativeDriver: true }),
        Animated.timing(opacities[next], { toValue: 1, duration: 2600, easing, useNativeDriver: true }),
      ]).start();
      hostBadgeIdxRef.current = next;
    };
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, [hostMode, gameMode, hostBadgeOp0, hostBadgeOp1, hostBadgeOp2]);

  // D-vii: per-peer connection-health via `lobby_health:<roomCode>`-
  // channel. Heartbeats var 5s, 3-tier-tier computed lokalt (ok < 7s,
  // slow 7-12s, unstable > 12s). Bara Individual Devices — Pass-the-
  // Phone delar device. Hook:en filtrerar bort self från returnerade
  // map:en; LobbyScreen passar `'self'` literal till PlayerRow för
  // egna kortet så grön dot ändå syns. Deklareras tidigt så
  // handleSetApproved + auto-un-approve-effect kan läsa state utan TDZ.
  const lobbyPeerHealth = useLobbyPeerHealth(
    roomCode,
    ownPlayerIdRef.current ?? '',
    gameMode === 'individual-devices',
  );
  // "Use single player mode as default" — när checkad dämpas Pass-the-Phone-
  // rutan i toggle:n. Speglar Profile:s motsvarande checkbox; lokal lobby-
  // state utan profil-pre-load (konsekvent med gameMode som också är lokal).
  const [singlePlayerDefault, setSinglePlayerDefault] = useState(false);

  // Max antal spelare per spel — 4 = Basic (gratis), 12 = Premium.
  // Lobby-local state; speglar Profile:s host-default-toggle.
  const [maxPlayers, setMaxPlayers] = useState<2 | 4 | 12>(4);
  // Premium-state laddas från subscriptionStorage i useFocusEffect så vi
  // re-checkar efter återkomst från Store (mock-purchase aktiverar flaggan).
  // Driver BÅDA Individual Devices-unlock OCH Max 12-unlock. TODO (Store
  // integration): byt subscriptionStorage mot RevenueCat entitlement-check.
  //
  // Seedas från den SYNKRONA spegeln så första framen redan är rätt. Med
  // `useState(false)` renderade en Premium-host en frame av låst läge —
  // credits-pillen blinkade grå PREMIUM + "Free: 4" innan den hoppade till
  // guld + "Unlimited" (Peter 2026-08-13). `undefined` (kall start) → false,
  // fail-closed; focus-effektens async läsning korrigerar direkt efter.
  const [hasPremium, setHasPremium] = useState(() => getCachedPremium() ?? false);
  // Senast OBSERVERADE premium-status i focus-effekten — driver mid-session-
  // övergångar för extra-paketen (auto-aktivera vid köp, töm vid lapse).
  // null = "inte observerad än" så första focus-tick aldrig feltolkas som
  // en upgrade (se premium-övergångs-blocket i useFocusEffect).
  const prevPremiumRef = useRef<boolean | null>(null);

  // Tap på Host Game Credits-pillen. Utan prenumeration frågar vi först —
  // pillen sitter i headern och nås lätt av misstag, och att slängas ur
  // lobbyn till Store mitt i en pågående lobby-setup är en dyr felnavigering.
  // Med prenumeration finns inget att sälja, så då är tappet en ren genväg
  // till Store utan mellansteg.
  // ⚠ Måste ligga EFTER hasPremium-deklarationen — deps-arrayen evalueras
  // direkt vid render, så en placering ovanför ger TDZ-ReferenceError.
  const goToStoreFromCredits = useCallback(() => {
    router.push({
      pathname: '/store' as const,
      params: { focus: 'subscription', from: '/lobby', fromCode: roomCode },
    });
  }, [roomCode]);

  const handleCreditsPillPress = useCallback(() => {
    if (hasPremium) {
      goToStoreFromCredits();
      return;
    }
    Alert.alert(
      'Go to Store?',
      'QuizVibe Premium gives you unlimited host games — no daily limit.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Store', onPress: goToStoreFromCredits },
      ],
    );
  }, [hasPremium, goToStoreFromCredits]);

  // Sync lobby-state till mockActiveRooms-registry så join-flödet
  // (handleJoinWithCode / handleJoinAsGuest i index.tsx) kan validera
  // capacity i realtid. Två separata effects:
  //  • players → currentPlayerCount (alla spelare exkl. de som lämnat)
  //  • maxPlayers → host:s aktuella cap (bara host skriver — non-host:s
  //    lokala state är default 4 och vi vill inte överskriva host:s 12)
  // Båda är no-ops i registry om koden inte längre är registrerad
  // (skydd mot stale skrivningar efter Delete this Game Lobby).
  useEffect(() => {
    if (!roomCode) return;
    const activeCount = players.filter((p) => !p.hasLeft).length;
    // Fire-and-forget — UI:t behöver inte vänta på roundtrip:en till DB.
    setRoomPlayerCount(roomCode, activeCount).catch(() => { /* loggas i mockActiveRooms */ });
  }, [players, roomCode]);
  useEffect(() => {
    if (!roomCode || !hostMode) return;
    setRoomMaxPlayers(roomCode, maxPlayers).catch(() => { /* loggas i mockActiveRooms */ });
  }, [maxPlayers, roomCode, hostMode]);

  // Auto-sync maxPlayers ↔ gameMode (host-only): Pass-the-Phone capas alltid
  // vid 4 spelare (PtP med 12 spelare × 20 rundor = orimligt långt spel),
  // Individual Devices defaulta:r till 12 så host får full multiplayer-cap
  // direkt utan extra knapptryck. Non-host syncar maxPlayers via room-meta-
  // maxPlayers sätts nu explicit via Players-toggeln (Max 4 / Max 12).
  // Premium → auto-välj Max 12 och lås (Max 4 utgråas).
  // Ej premium → tvinga tillbaka till Max 4.
  // Remote 1v1 → ALLTID 2 (host + 1 motståndare) oavsett premium.
  useEffect(() => {
    if (!hostMode) return;
    setMaxPlayers(gameMode === 'remote-1v1' ? 2 : hasPremium ? 12 : 4);
  }, [hostMode, hasPremium, gameMode]);

  // Max rundor beror på spelläge: IndDev → 20, PtP/Single → 4.
  // Premium ger INTE fler rundor i PtP — premium-host i PtP hänvisas till
  // att byta till IndDev för att nå 20 rundor (se onPremiumPress-alertet).
  const roundsMax = gameMode === 'individual-devices' && !singlePlayerDefault ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
  // stepperMax är taket för +/−-knapparna — kräver premium för >4 rundor.
  // RoundsRuler:s gameModeMax=roundsMax (20) behålls för att visa bracketets
  // fulla span med låsta tickar ovanför stepperMax.
  const stepperMax = hasPremium ? roundsMax : Math.min(roundsMax, ROUNDS_MAX_PASS);
  useEffect(() => {
    // Clamp:a bara för host — non-host ska alltid spegla host:s val utan
    // att premium-status på non-host:s enhet begränsar visningen.
    if (!hostMode) return;
    if (roundsCount > stepperMax) setRoundsCount(Math.max(ROUNDS_MIN, stepperMax));
  }, [hostMode, roundsCount, stepperMax]);

  const handleDecrementRounds = useCallback(() => {
    setRoundsCount((prev) => {
      const next = Math.max(ROUNDS_MIN, prev - ROUNDS_STEP);
      // Haptic-klick bara när värdet faktiskt ändras (vid range-floor
      // skulle annars en "tom" tap fyra haptik utan visuell respons).
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  }, []);
  const handleIncrementRounds = useCallback(() => {
    if (roundsCount >= stepperMax) {
      if (singlePlayerDefault || gameMode === 'pass-the-phone' || gameMode === 'remote-1v1') {
        Alert.alert('More rounds not available', 'More than 4 rounds is only available with both Individual device and Premium activated.');
      }
      return;
    }
    setRoundsCount((prev) => {
      const next = Math.min(stepperMax, prev + ROUNDS_STEP);
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  }, [stepperMax, roundsCount, singlePlayerDefault, gameMode]);
  // Per-source profession-category-filter (ersätter youtubeEnabled/imagesEnabled/enabledMainCategories).
  // YouTube: alla tre valbara, min 1 krävs. Images: Film+Sport mandatory, Music valbar.
  const [youtubeEnabledCategories, setYoutubeEnabledCategories] = useState<MainCategory[]>(
    () => defaultEnabledMainCategories(),
  );
  const [imagesEnabledCategories, setImagesEnabledCategories] = useState<MainCategory[]>(
    () => defaultEnabledMainCategories(),
  );
  // Sketch — prototyp, ej wirad till quiz-poolen. Strukturell placeholder.
  const [sketchEnabled, setSketchEnabled] = useState(false);
  // Spotify DJ-läge — host aktiverar. Plan B (2026-07-22): ingen OAuth,
  // inget Premium-krav — DJ:n behöver bara Spotify-appen (self-attest).
  const [spotifyEnabled, setSpotifyEnabled] = useState(false);
  const [spotifyAnswerYear, setSpotifyAnswerYear] = useState(true);
  const [spotifyAnswerName, setSpotifyAnswerName] = useState(true);
  // Remote 1v1: EN gemensam hjälpnivå för båda spelarna (default Full).
  // Assistance är annars personligt, men i en duell där båda kör samma
  // frågesekvens var för sig blir olika nivåer inte jämförbart — därför KAN
  // host låsa båda till samma nivå, som då skrivs till båda
  // remote_match_players-raderna vid Start Game. Ignoreras i lokala lägen.
  const [remoteAssistance, setRemoteAssistance] =
    useState<LobbyRemoteAssistance>('full');
  // ...men det är OPT-IN: switchen är AV när lobbyn skapas, och först när
  // host slår på den blir nivå-valet aktivt. Av → varje spelare kör sin egen
  // personliga nivå (samma modell som lokala lägen).
  const [mutualAssistanceEnabled, setMutualAssistanceEnabled] = useState(false);
  // Egen Spotify-self-attest ("jag har Spotify-appen") — seedas från
  // profile.spotifyAppConfirmed i useFocusEffect; namnet spotifyConnected
  // behållet för minimal diff mot OAuth-eran.
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyGuideVisible, setSpotifyGuideVisible] = useState(false);
  // Spotify DJ kräver Individual Devices — DJ lämnar appen till Spotify-appen.
  // PtP/Single Player stöds inte (en delad enhet kan inte lämna + återvända).
  const isSpotifyAvailable = gameMode === 'individual-devices' && !singlePlayerDefault;
  // Kollapsbara Lobby-sektioner (samma +/− mönster som Profile-vyn). Default expanderade.
  // Alla (host OCH non-host) kommer in med Game Settings + Quiz Tuning REDAN
  // hopfällda (folded) och Players in Lobby utfälld.
  const [gameSettingsExpanded, setGameSettingsExpanded] = useState(false);
  // Host kommer in med Players in Lobby hopfälld (likt Game Settings + Quiz
  // Tuning); non-host får den utfälld så de direkt ser spelarlistan.
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [newPlayerJoined, setNewPlayerJoined] = useState(false);
  const [quizTuningExpanded, setQuizTuningExpanded] = useState(false);
  const [customizeExpanded, setCustomizeExpanded] = useState(false);
  useEffect(() => {
    if (customizeExpanded) {
      // Ge layouten 150 ms att mätas klart innan vi scrollar till botten.
      const t = setTimeout(() => {
        mainScrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [customizeExpanded]);

  // Scroll-hint-pil i nederkant (samma som quiz.tsx:s namn-fråge-pil) — guidar
  // användaren att scrolla ner till Start Game-knappen. Blink-puls + auto-göm
  // när man nått botten / när innehållet inte är scrollbart.
  const scrollHintOpacity = useRef(new Animated.Value(1)).current;
  const [scrollHintAtBottom, setScrollHintAtBottom] = useState(false);
  const [scrollHintScrollable, setScrollHintScrollable] = useState(false);
  const scrollViewportH = useRef(0);
  const scrollContentH = useRef(0);
  const recomputeScrollHint = useCallback(() => {
    setScrollHintScrollable(scrollContentH.current > scrollViewportH.current + 24);
  }, []);
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


  const handleScrollHintScroll = useCallback((e: {
    nativeEvent: {
      contentOffset: { y: number };
      layoutMeasurement: { height: number };
      contentSize: { height: number };
    };
  }) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    scrollViewportH.current = layoutMeasurement.height;
    scrollContentH.current = contentSize.height;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setScrollHintAtBottom(distanceFromBottom <= 24);
    setScrollHintScrollable(contentSize.height > layoutMeasurement.height + 24);
  }, []);
  // ── Source Dashboard — kolumn-masters + individuella togglear ─────────
  // Artists: YouTube + Images är oberoende valbara var och en.
  // Actors/Athletes: Images följer YouTube automatiskt (Auto).
  // All-master slår på alla kolumner; kolumn-masters slår på/av en kolumn.

  // Kolumn är "aktiv" om minst EN källa (YT eller Guess Who) är på.
  const artistsEnabled =
    youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
  // Artists/All är ON enbart om BÅDA YT och Guess Who är aktiva (AND).
  const artistsAllOn =
    youtubeEnabledCategories.includes('Music') && imagesEnabledCategories.includes('Music');
  // Actors/Athletes: kolumn aktiv (OR) om minst en källa är på — används för min-1-guards.
  const actorsEnabled =
    youtubeEnabledCategories.includes('Film') || imagesEnabledCategories.includes('Film');
  const athletesEnabled =
    youtubeEnabledCategories.includes('Sport') || imagesEnabledCategories.includes('Sport');
  // AND-logik: Actors/All och Athletes/All är ON enbart om BÅDA YT och Guess Who är aktiva.
  const actorsAllOn =
    youtubeEnabledCategories.includes('Film') && imagesEnabledCategories.includes('Film');
  const athletesAllOn =
    youtubeEnabledCategories.includes('Sport') && imagesEnabledCategories.includes('Sport');
  const allEnabled = artistsAllOn && actorsAllOn && athletesAllOn;
  const enabledColumnsCount = [artistsEnabled, actorsEnabled, athletesEnabled].filter(Boolean).length;
  // Uppmätt kolumnbredd via onLayout på smGrid — garanterar pixel-perfekt
  // centrering oavsett flex-beräkningsfel i Yoga/React Native.
  const [smColWidth, setSmColWidth] = useState(0);
  const smCellStyle = smColWidth > 0 ? { width: smColWidth } : undefined;
  // Höger-marginaler som centrerar Spotify-radens switchar på Sport-kolumnens
  // switch-mittlinje i matrisen nedanför. Härledd formel (smColWidth/2 från
  // högerkanten) gav per-enhets-residualer (kolumn-separatorer, cell-padding,
  // flex-avrundning) — därför MÄTS Sport-cellens faktiska position via
  // measureLayout mot grid:en istället (exakt på alla enheter).
  const SPOTIFY_SWITCH_W = 51; // RN Switch-layoutbredd (transform-scale påverkar inte layoutboxen)
  const [smGridW, setSmGridW] = useState(0);
  // Sport-switchens center härleds via ONLAYOUT-kedja (stack-x i grid +
  // cell-center i stack). OBS: measureLayout användes först men är opålitlig
  // på Fabric/new arch — silent no-op via error-callbacken, vilket lämnade
  // fallback-marginaler som bara råkade aligna på vissa skärmbredder
  // (414pt ok, 390pt ~4.5pt fel). onLayout fyrar alltid.
  const [sportStackX, setSportStackX] = useState(0);
  const [sportCellCenter, setSportCellCenter] = useState(0);
  // Cellens alignItems:'center' + paddingLeft 3 → switch-center = cellcenter + 1.5.
  const sportSwitchCenter = sportStackX + sportCellCenter + 1.5;
  const haveSportMeasure = smGridW > 0 && sportStackX > 0 && sportCellCenter > 0;
  // DJ-/Year-Name-raderna har paddingRight 18; negativ margin får äta av den
  // på smala skärmar. Attest-ramen: paddingRight 4 + border 1 innanför
  // marginalen. Fallback tills onLayout-mätningarna landat.
  // −4 = konstant bias (debug-linje-verifierad 2026-08-06: mätningen träffar
  // Sport-kolumnens center exakt på båda enheterna, men Spotify-switcharna
  // låg ~3–4pt vänster om linjen på BÅDA — switch-layoutbreddens antagande
  // är några pt för smalt).
  const spotifySwitchMR = haveSportMeasure
    ? Math.round(smGridW - sportSwitchCenter - 18 - SPOTIFY_SWITCH_W / 2) - 4
    : 0;
  const spotifyAttestMR = haveSportMeasure
    ? Math.max(0, Math.round(smGridW - sportSwitchCenter - 2 - 1 - SPOTIFY_SWITCH_W / 2) - 4)
    : 28;

  // YouTube och Hints (imagesEnabledCategories) är oberoende — ingen auto-sync.

  // Guest host: Mixerboarden är LÅST (alla kategorier ON, källor slumpas
  // per fråga i quiz.tsx) — bara Spotify på/av är valbart. Switcharna
  // renderas ENABLED (disabled-Switch sväljer tap → ingen Alert skulle
  // kunna fyras) men onValueChange pekar hit istället för settern, så
  // värdet snappar tillbaka visuellt (samma mönster som Year/Name-
  // togglarna). Registrerings-trigger per Peters trial-design 2026-07-04.
  const guestLockAlert = () =>
    Alert.alert(
      'Locked for Guest Host',
      'Activation/deactivation only applicable by QuizVibe users Host',
    );

  const handleToggleAllSources = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
      return;
    }
    setYoutubeEnabledCategories(value ? ['Music', 'Film', 'Sport'] : []);
    setImagesEnabledCategories(value ? ['Music', 'Film', 'Sport'] : []);
    // Slå även på Spotify om host har kopplat konto + IndDev är aktivt.
    if (value && isSpotifyAvailable && spotifyConnected) {
      setSpotifyEnabled(true);
    }
  };

  const handleToggleArtistsColumn = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      // Column-toggle stänger av BÅDA källorna → Artists alltid inaktiv efteråt.
      const remainingActorsAthletes = [
        youtubeEnabledCategories.includes('Film'),
        youtubeEnabledCategories.includes('Sport'),
        imagesEnabledCategories.includes('Film'),
        imagesEnabledCategories.includes('Sport'),
      ].filter(Boolean).length;
      if (remainingActorsAthletes < 2) {
        Alert.alert('Not applicable', 'Enable at least 2 Actors/Athletes combinations before turning off Artists, or keep Spotify active.');
        return;
      }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Music'])] as MainCategory[]) : prev.filter((c) => c !== 'Music'),
    );
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Music'])] as MainCategory[]) : prev.filter((c) => c !== 'Music'),
    );
  };

  const handleToggleActorsColumn = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Sport'), imagesEnabledCategories.includes('Sport')].filter(Boolean).length;
        if (remaining < 2) {
          Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.');
          return;
        }
      }
      if (enabledColumnsCount <= 1) {
        Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
        return;
      }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
  };

  const handleToggleAthletesColumn = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Film'), imagesEnabledCategories.includes('Film')].filter(Boolean).length;
        if (remaining < 2) {
          Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.');
          return;
        }
      }
      if (enabledColumnsCount <= 1) {
        Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
        return;
      }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
  };

  // YouTube och Hints är OBEROENDE — individuella source-switchar rör bara sin
  // egen källa. Min-1-guard: blockera bara om VARKEN YouTube NOR Hints är på
  // för den aktuella kolumnen OCH det är sista aktiva kolumnen.

  const handleToggleArtistsYoutube = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      // Artists inaktiv efteråt bara om Hints Music OCKSÅ är av.
      const artistsWouldStillBeActive = imagesEnabledCategories.includes('Music');
      if (!artistsWouldStillBeActive) {
        const remainingActorsAthletes = [
          youtubeEnabledCategories.includes('Film'),
          youtubeEnabledCategories.includes('Sport'),
          imagesEnabledCategories.includes('Film'),
          imagesEnabledCategories.includes('Sport'),
        ].filter(Boolean).length;
        if (remainingActorsAthletes < 2) {
          Alert.alert('Not applicable', 'Enable at least 2 Actors/Athletes combinations before turning off Artists, or keep Spotify active.');
          return;
        }
      }
      // Befintlig min-1-guard (sista kolumn)
      if (enabledColumnsCount <= 1 && !artistsWouldStillBeActive) {
        Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
        return;
      }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Music'])] as MainCategory[]) : prev.filter((c) => c !== 'Music'),
    );
  };

  const handleToggleArtistsGuessWho = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      // Artists inaktiv efteråt bara om YouTube Music OCKSÅ är av.
      const artistsWouldStillBeActive = youtubeEnabledCategories.includes('Music');
      if (!artistsWouldStillBeActive) {
        const remainingActorsAthletes = [
          youtubeEnabledCategories.includes('Film'),
          youtubeEnabledCategories.includes('Sport'),
          imagesEnabledCategories.includes('Film'),
          imagesEnabledCategories.includes('Sport'),
        ].filter(Boolean).length;
        if (remainingActorsAthletes < 2) {
          Alert.alert('Not applicable', 'Enable at least 2 Actors/Athletes combinations before turning off Artists, or keep Spotify active.');
          return;
        }
      }
      if (enabledColumnsCount <= 1 && !artistsWouldStillBeActive) {
        Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
        return;
      }
    }
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Music'])] as MainCategory[]) : prev.filter((c) => c !== 'Music'),
    );
  };

  const handleToggleActorsYoutube = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [false, youtubeEnabledCategories.includes('Sport'), imagesEnabledCategories.includes('Film'), imagesEnabledCategories.includes('Sport')].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1 && !imagesEnabledCategories.includes('Film')) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
  };

  const handleToggleActorsGuessWho = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Film'), youtubeEnabledCategories.includes('Sport'), false, imagesEnabledCategories.includes('Sport')].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1 && !youtubeEnabledCategories.includes('Film')) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
  };

  const handleToggleAthletesYoutube = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Film'), imagesEnabledCategories.includes('Film'), false, imagesEnabledCategories.includes('Sport')].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1 && !imagesEnabledCategories.includes('Sport')) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
  };

  const handleToggleAthletesGuessWho = (value: boolean) => {
    if (isGuestHost) { guestLockAlert(); return; }
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Film'), imagesEnabledCategories.includes('Film'), youtubeEnabledCategories.includes('Sport'), false].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1 && !youtubeEnabledCategories.includes('Sport')) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
  };
  // ── Spotify DJ-handlers ───────────────────────────────────────────────
  /**
   * Applicerar self-attesten (Plan B 2026-07-22): usern har Spotify-appen
   * på enheten — ersätter OAuth-connect. Behåller samma side-effects som
   * OAuth-versionen (spelarkort + spotify_verified-sync) och persisterar
   * dessutom attesten till profilen så Profile-toggeln speglar den.
   *
   * Anropa INTE direkt från UI — gå via handleConnectSpotify nedan, som
   * install-verifierar först. Denna är utbruten just för att verifierings-
   * vägen och "Turn on anyway"-vägen ska dela exakt samma side-effects.
   */
  const applySpotifyAttest = () => {
    setSpotifyConnected(true);
    // Auto-aktivera DJ-toggeln direkt efter attest (host) — annars måste
    // användaren trycka på toggeln en extra gång manuellt efteråt.
    if (hostMode) setSpotifyEnabled(true);
    // Uppdatera spelarkortet direkt.
    const ownId = ownPlayerIdRef.current;
    if (ownId) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === ownId ? { ...p, spotifyConnected: true } : p)),
      );
    }
    // Non-host: synka spotify_verified=true till lobby_players så host:s
    // polling ser Spotify-badge:n uppdateras direkt utan reload.
    if (!hostMode && ownId) {
      const ownPlayer = players.find((p) => p.id === ownId);
      if (ownPlayer) {
        upsertOwnLobbyPlayer(roomCode, { ...ownPlayer, spotifyConnected: true }).catch(() => {});
      }
    }
    // Persistera attesten till profilen (registrerade users) så den överlever
    // lobbyn och seedar nästa join. Guests har ingen profil — no-op via null.
    loadProfile().then((profile) => {
      if (profile) {
        saveProfile({ ...profile, spotifyAppConfirmed: true }).catch(() => {});
      }
    }).catch(() => {});
  };

  /**
   * Verifierar att Spotify-appen finns på enheten innan attesten appliceras.
   *
   * Alla tre attest-ingångar går genom denna funktion — switchen i Source
   * Mixerboard samt "I have Spotify"-knapparna i handleToggleSpotifyEnabled
   * och handleStartGame — så checken behöver bara sitta här.
   *
   * FAIL-OPEN: 'installed' och 'unknown' (Expo Go / OS-fel) appliceras tyst.
   * Bara 'not-found' varnar, och användaren kan alltid köra vidare ändå.
   */
  const handleConnectSpotify = async () => {
    const installed = await checkSpotifyInstalled();
    if (installed !== 'not-found') {
      applySpotifyAttest();
      return;
    }
    Alert.alert(
      'Spotify not found on this device',
      "We couldn't find the Spotify app on this device. You need it installed to be the DJ in a Spotify game.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn on anyway', onPress: applySpotifyAttest },
      ],
    );
  };

  /**
   * Tar bort self-attesten ("jag har inte Spotify ändå").
   * Stänger av Spotify DJ-läget om det var aktivt.
   */
  const handleDisconnectSpotify = () => {
    Alert.alert(
      'Remove Spotify confirmation',
      'Do you want to remove your "I have Spotify" confirmation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setSpotifyConnected(false);
            setSpotifyEnabled(false);
            const ownId = ownPlayerIdRef.current;
            if (ownId) {
              setPlayers((prev) =>
                prev.map((p) => (p.id === ownId ? { ...p, spotifyConnected: false } : p)),
              );
            }
            // Non-host: synka spotify_verified=false till lobby_players.
            if (!hostMode && ownId) {
              const ownPlayer = players.find((p) => p.id === ownId);
              if (ownPlayer) {
                upsertOwnLobbyPlayer(roomCode, { ...ownPlayer, spotifyConnected: false }).catch(() => {});
              }
            }
            loadProfile().then((profile) => {
              if (profile) {
                saveProfile({ ...profile, spotifyAppConfirmed: false }).catch(() => {});
              }
            }).catch(() => {});
          },
        },
      ],
    );
  };

  /**
   * Togglar Spotify DJ-läget. Om aktivering utan self-attest:
   * erbjud att bekräfta direkt.
   */
  const handleToggleSpotifyEnabled = (val: boolean) => {
    if (val && !spotifyConnected) {
      Alert.alert(
        'Confirm Spotify first',
        'Confirm that you have the Spotify app on this device before enabling Spotify DJ mode. No Spotify account connection is needed — the song opens in your own Spotify app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'I have Spotify', onPress: handleConnectSpotify },
        ],
      );
      return;
    }
    if (val) {
      // Kontrollera Spotify-attest för approved non-hosts i lobbyn.
      const approvedNonHosts = players.filter((p) => !p.isHost && !p.hasLeft && p.approved);
      const withSpotify = approvedNonHosts.filter((p) => p.spotifyConnected);
      const withoutSpotify = approvedNonHosts.filter((p) => !p.spotifyConnected);

      if (approvedNonHosts.length > 0 && withSpotify.length === 0) {
        // Check 1: Ingen annan spelare har bekräftat Spotify.
        Alert.alert(
          'Spotify not applicable',
          'No other players have confirmed Spotify. Please ask other players to confirm they have the Spotify app (in their Spotify settings row).',
        );
        return;
      }
      if (withoutSpotify.length > 0) {
        // Check 2: Några approved spelare saknar Spotify-attest — erbjud att flytta dem till waiting.
        Alert.alert(
          'Not all players have Spotify',
          `${withoutSpotify.length} approved player${withoutSpotify.length > 1 ? 's have' : ' has'} not confirmed the Spotify app. They will be moved back to "To be approved" status. Proceed anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Proceed',
              onPress: () => {
                setPlayers((prev) =>
                  prev.map((p) =>
                    withoutSpotify.some((w) => w.id === p.id) ? { ...p, approved: false } : p,
                  ),
                );
                setSpotifyEnabled(true);
              },
            },
          ],
        );
        return;
      }
    }
    if (!val) {
      // Samma regel som i handleStartGame: Artists ensamt räcker (som Spotify).
      // För Actors/Athletes krävs ≥ 2 aktiva kombinationer om varken Spotify
      // eller Artists är aktiv.
      const activeNonSpotifyCount = [
        youtubeEnabledCategories.includes('Music'),
        youtubeEnabledCategories.includes('Film'),
        youtubeEnabledCategories.includes('Sport'),
        imagesEnabledCategories.includes('Music'),
        imagesEnabledCategories.includes('Film'),
        imagesEnabledCategories.includes('Sport'),
      ].filter(Boolean).length;
      const artistsActiveForSpotify =
        youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActiveForSpotify && activeNonSpotifyCount < 2) {
        Alert.alert(
          'Not applicable',
          'Enable at least 2 source combinations, or enable Artists or Spotify — those can be played on their own.',
        );
        return;
      }
    }
    setSpotifyEnabled(val);
  };

  // Use Packages — Basic-utbudet är alltid implicit aktivt (ingen UI). Hosten
  // kan välja till extra-paket ovanpå. Knytningen mellan packages och
  // room-code är implicit (lobby-state).
  const [selectedExtraPackages, setSelectedExtraPackages] = useState<string[]>([]);
  // Profil-styrd filterlista: bara paket som hosten aktiverat i sin
  // Profile (Customized Host packages-toggle) visas i Lobby. Default =
  // alla paket aktiverade så nyköpta dyker upp utan extra steg via Profile.
  // V1: PURCHASED_PACKAGES är tom så denna är tom array idag.
  const [enabledHostPackages, setEnabledHostPackages] = useState<string[]>(
    () => PURCHASED_PACKAGES.map((p) => p.id),
  );
  // Komplett katalog av möjliga paket. V1: bara PURCHASED_PACKAGES (tom)
  // — gen-paketen togs bort 2026-05-27. För host filtreras detta sedan
  // via enabledHostPackages (host:s profil-val); för non-host returneras
  // hela katalogen oförändrad eftersom selectedExtraPackages från host är
  // vad som styr vad som faktiskt visas på non-host:s sida.
  const allPackagesCatalog = useMemo<MusicPackage[]>(
    () => [...PURCHASED_PACKAGES],
    [],
  );
  const availablePackages = useMemo(
    () =>
      hostMode
        ? allPackagesCatalog.filter((p) => enabledHostPackages.includes(p.id))
        : allPackagesCatalog,
    [allPackagesCatalog, enabledHostPackages, hostMode],
  );

  const handleToggleExtraPackage = (id: string) => {
    setSelectedExtraPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };
  // "Select all"-toggle på rubrik-raden — låter host aktivera/avaktivera
  // alla synliga (profil-aktiverade) paket med ett enda klick.
  const isAllSelected =
    availablePackages.length > 0 &&
    selectedExtraPackages.length === availablePackages.length;
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedExtraPackages([]);
    } else {
      setSelectedExtraPackages(availablePackages.map((p) => p.id));
    }
  };

  // Switch som kräver att host:s manuellt tillagda guests försvinner (de
  // saknar egen mobil och kan inte spela på individual devices). Visar Alert
  // om sådana finns, raderar dem lokalt + i lobby_players-DB:n vid confirm,
  // och kör `applySwitch` när alla raderingar är schemalagda. Om inga guests
  // finns körs `applySwitch` direkt utan prompt. Används av handleSelectMode
  // (PtP→IndDev). DB DELETE krävs — utan det skulle host:s fetchNewJoiners-
  // sync re-injektera guests nästa state-ändring (setLobbyPlayers är
  // UPSERT-only).
  // Individual device: endast HOST-TILLAGDA guests blockeras (de saknar egen
  // enhet — ingen mobil kan visa frågor/skicka svar för dem). Självanslutna
  // guests HAR egen enhet + anon-session och får vara med (policy-ändring
  // 2026-08-06, ersätter 2026-06-01-regeln som blockade alla guests). Vid
  // byte till IndDev tas bara addedByHost-spelare bort. markEjected +
  // DB-DELETE (belt-and-suspenders — host-tillagda har ingen egen enhet
  // som kan visa eject-popupen, men raden måste bort ur DB).
  const confirmAndRemoveGuests = (title: string, applySwitch: () => void) => {
    const guests = players.filter((p) => !p.isHost && p.addedByHost);
    if (guests.length === 0) {
      applySwitch();
      return;
    }
    Alert.alert(
      title,
      'Guest players added by the Host will be removed — they have no device of their own. Ask them to join with their own device instead.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch & remove',
          style: 'destructive',
          onPress: () => {
            setPlayers((prev) => prev.filter((p) => p.isHost || !p.addedByHost));
            applySwitch();
            guests.forEach((p) => {
              markEjected(roomCode, p.id);
              supabase
                .from('lobby_players')
                .delete()
                .eq('room_code', roomCode)
                .eq('player_id', p.id)
                .then(({ error }) => {
                  if (error) {
                    console.warn(
                      '[lobbyPlayers] guest delete on IndDev switch failed:',
                      error.message,
                    );
                  }
                });
            });
          },
        },
      ],
    );
  };

  // Game mode-val: fyra fria lägen (single / PtP / Remote 1v1 / IndDev).
  // IndDev är INTE längre premium-gated — alla är gratis att välja.
  // Subscription gatar istället caps (rundor/spelare), inte lägesvalet.
  const handleSelectMode = (mode: GameMode) => {
    if (mode === gameMode && !singlePlayerDefault) return;
    // Vid byte till Individual device: varna om host har manuellt tillagda
    // spelare (de saknar egen mobil och måste tas bort när alla spelar från
    // sina egna enheter). Lämnar även single-player-läget.
    if (mode === 'individual-devices') {
      confirmAndRemoveGuests('Switch to Individual device?', () => {
        setSinglePlayerDefault(false);
        setGameMode('individual-devices');
        // Premium → återställ Max 12 automatiskt (kan ha satts till 4 av PtP-bytet).
        if (hasPremium) setMaxPlayers(12);
      });
      return;
    }
    // Remote (1vs1): DÖD KOD sedan 2026-08-07 — Remote-rutan togs bort ur
    // lobbyns Game Mode-val (1vs1 nås via "1vs1 Matches"-valet på Home som
    // seedar mode direkt, utan denna handler). Grenen behålls orörd ifall
    // in-lobby-byte till 1vs1 skulle återinföras.
    if (mode === 'remote-1v1') {
      const applyRemote = () => {
        setSinglePlayerDefault(false);
        setGameMode('remote-1v1');
        setMaxPlayers(2);
        setSpotifyEnabled(false);
      };
      const selfJoinedNonHosts = players.filter(
        (p) => !p.isHost && !p.hasLeft && !p.addedByHost,
      );
      if (selfJoinedNonHosts.length > 1) {
        Alert.alert(
          'Switch to Remote (1vs1)?',
          'Remote 1vs1 allows only 1 opponent. All players will be removed from the lobby — invite ONE opponent again after switching.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              style: 'destructive',
              onPress: () => {
                const allNonHosts = players.filter((p) => !p.isHost && !p.hasLeft);
                allNonHosts.forEach((p) => {
                  markEjected(roomCode, p.id);
                  supabase
                    .from('lobby_players')
                    .delete()
                    .eq('room_code', roomCode)
                    .eq('player_id', p.id)
                    .then(({ error }) => {
                      if (error) console.warn('[lobbyPlayers] Remote-switch eject failed:', error.message);
                    });
                });
                setPlayers((prev) => prev.filter((p) => p.isHost));
                applyRemote();
              },
            },
          ],
        );
        return;
      }
      // ≤1 självansluten motståndare — behåll den; rensa ev. host-tillagda
      // guests via samma confirm-flöde som IndDev.
      confirmAndRemoveGuests('Switch to Remote (1vs1)?', applyRemote);
      return;
    }
    // Vid byte till PtP: maxPlayers alltid 4 (PtP-cap). Om host godkänt fler
    // än 3 non-hosts (= totalt > 4 med host) visas popup och ALLA non-hosts
    // ejektas — lobbyn skalas ner till enbart host.
    const approvedNonHosts = players.filter((p) => !p.isHost && !p.hasLeft && p.approved);
    if (approvedNonHosts.length > 3) {
      Alert.alert(
        'Change to Pass-the-Phone',
        'Change from Individual Devices will remove all players from lobby. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            style: 'destructive',
            onPress: () => {
              const allNonHosts = players.filter((p) => !p.isHost && !p.hasLeft);
              allNonHosts.forEach((p) => {
                markEjected(roomCode, p.id);
                supabase
                  .from('lobby_players')
                  .delete()
                  .eq('room_code', roomCode)
                  .eq('player_id', p.id)
                  .then(({ error }) => {
                    if (error) console.warn('[lobbyPlayers] IndDev→PtP eject failed:', error.message);
                  });
              });
              setPlayers((prev) => prev.filter((p) => p.isHost));
              setSinglePlayerDefault(false);
              setGameMode('pass-the-phone');
              setMaxPlayers(4);
              setSpotifyEnabled(false);
            },
          },
        ],
      );
      return;
    }
    setSinglePlayerDefault(false);
    setGameMode('pass-the-phone');
    setMaxPlayers(4);
    setSpotifyEnabled(false);
  };

  // Single player-val: ejecta ev. non-host-spelare (de kan inte vara med i
  // single-player). Samma logik som tidigare singlePlayerDefault-checkbox ON.
  const handleSelectSingle = () => {
    if (singlePlayerDefault) return;
    const ejectables = players.filter((p) => !p.isHost && !p.hasLeft);
    if (ejectables.length === 0) {
      setSinglePlayerDefault(true);
      setSpotifyEnabled(false);
      return;
    }
    Alert.alert(
      'Switch to single-player mode?',
      'Play single player mode will delete players in lobby. Still want to play single player?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            ejectables.forEach((p) => {
              markEjected(roomCode, p.id);
              supabase
                .from('lobby_players')
                .delete()
                .eq('room_code', roomCode)
                .eq('player_id', p.id)
                .then(({ error }) => {
                  if (error) console.warn('[lobbyPlayers] single-player eject failed:', error.message);
                });
            });
            setPlayers((prev) => prev.filter((p) => p.isHost));
            setSinglePlayerDefault(true);
            setSpotifyEnabled(false);
          },
        },
      ],
    );
  };

  // Players-val: Max 4 (gratis) / Max 12 (Premium).
  // Max 12 kräver IndDev-läge (PtP/Single → info-alert) OCH Premium
  // (gratis-host i IndDev → Store-redirect).
  const handleSelectMaxPlayers = (n: 4 | 12) => {
    if (n === 12) {
      // Fel läge: Max 12 kräver Individual device
      if (singlePlayerDefault || gameMode !== 'individual-devices') {
        Alert.alert(
          'Individual device required',
          'Please activate Individual device to be able to select Max 12 players.',
          [{ text: 'OK' }],
        );
        return;
      }
      // Rätt läge men inget premium → Store
      if (!hasPremium) {
        Alert.alert(
          'Premium feature',
          'Hosting up to 12 players requires QuizVibe Premium. Get it in the Store?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
          ],
        );
        return;
      }
    }
    setMaxPlayers(n);
  };

  // En game-mode-ruta (delas av Single device- och Multiplayer-grupperna).
  // FREE-badge grön när aktiv, grå när inaktiv. disabled för non-host.
  // redIndiv: om true färgas "Individual device"-rutan röd när inaktiv (används
  // bara i Number of Rounds quick-select, INTE i Game Settings/Game Mode).
  const renderModeBox = (key: 'single' | 'ptp' | 'remote' | 'indiv', label: string, smallText?: boolean, redIndiv?: boolean) => {
    const isActive =
      key === 'single'
        ? singlePlayerDefault
        : key === 'ptp'
          ? !singlePlayerDefault && gameMode === 'pass-the-phone'
          : key === 'remote'
            ? !singlePlayerDefault && gameMode === 'remote-1v1'
            : !singlePlayerDefault && gameMode === 'individual-devices';
    return (
      <TouchableOpacity
        style={[styles.modeOption, isActive ? styles.modeOptionPassActive : styles.modeOptionInactive]}
        onPress={() =>
          key === 'single'
            ? handleSelectSingle()
            : handleSelectMode(
                key === 'ptp' ? 'pass-the-phone' : key === 'remote' ? 'remote-1v1' : 'individual-devices',
              )
        }
        disabled={!hostMode}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.modeLabel, { textAlign: 'center' }, smallText && { fontSize: FontSize.xs }, isActive && styles.modeLabelActiveFree, redIndiv && key === 'indiv' && !isActive && { color: Colors.error }]}
          numberOfLines={2}
        >
          {label}
        </Text>
        <View style={[styles.freeBadge, !isActive && styles.freeBadgeDimmed]} pointerEvents="none">
          <Text style={[styles.freeBadgeText, !isActive && styles.freeBadgeTextDimmed]}>FREE</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Approved spelare = i spelet, har turn-nummer, syns överst.
  // Host räknas alltid som approved oavsett approved-flaggans värde.
  // Alla spelare som hamnar i lobbyn har komplett HCP (sätts vid Join as
  // Guest eller importeras automatiskt för registrerade användare) — så
  // det finns ingen "missing info"-grupp längre.
  //
  // **hasLeft-filter**: spelare som lämnat lobbyn (egen Leave-action eller
  // host:s trash) ska försvinna helt från BÅDA listorna i BÅDA vyer (host
  // OCH non-host). Tidigare visades de som grå "LEFT THIS GAME LOBBY"-kort
  // via orphan-injection, men det skapade förvirring — usern ska tolka
  // listan som "spelare just nu i rummet". Data-modell-wise lever raden
  // kvar i lobby_players med has_left=true (för audit/debug) men render-
  // pathen exkluderar dem. handleStartGame:s turnOrder-bygge filtrerar
  // redan oberoende så ingen risk att hasLeft hamnar i turn-order.
  const isPlayerApproved = (p: LobbyPlayer) => !!p.approved || !!p.isHost;
  const approvedPlayers = players.filter((p) => isPlayerApproved(p) && !p.hasLeft);
  // Bokstäver som redan används som identifierar-suffix på Guest-spelare i
  // lobbyn. hasLeft-spelare exkluderas — deras letter frigörs. Skickas till
  // AddPlayerModal:s auto-gen så två guests inte får samma bokstav.
  const takenGuestLetters = useMemo(
    () => extractTakenGuestLetters(players.filter((p) => !p.hasLeft).map((p) => p.name)),
    [players],
  );
  const waitingForApproval = players.filter((p) => !isPlayerApproved(p) && !p.hasLeft);

  // Notify host när Players in Lobby är hopfällt och en ny spelare ansluter.
  const prevNonHostApprovedRef = useRef(-1);
  useEffect(() => {
    const count = approvedPlayers.filter((p) => !p.isHost).length;
    if (prevNonHostApprovedRef.current === -1) {
      prevNonHostApprovedRef.current = count;
      return;
    }
    if (!playersExpanded && count > prevNonHostApprovedRef.current) {
      setNewPlayerJoined(true);
    }
    prevNonHostApprovedRef.current = count;
  }, [approvedPlayers.length, playersExpanded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (playersExpanded) setNewPlayerJoined(false);
  }, [playersExpanded]);

  // ── Join-approval-popup + friend-auto-approve (host) ──────────────────
  // Watcher på players[]: varje NY unapproved non-host får antingen
  // (a) tyst auto-approve om hen är registrerad OCH redan finns på hostens
  // friends-lista (case-insensitive playerName-match) — gröna "New Player
  // joined"-blinken signalerar; eller (b) en plats i join-popup-kön så host
  // får Approve / Approve+AddFriend / Deny / Later-modalen. Effekt-driven
  // (inte hookad i fetchNewJoiners) så samma väg täcker Realtime-INSERT,
  // mount-fetchen OCH rejoin (hasLeft→false via syncNonHostFields) enhetligt.
  useEffect(() => {
    if (!hostMode) return;
    // Vänta tills friends-listan laddats — annars kan en friend hinna få
    // popupen pga en load-race.
    const hostFriends = hostFriendsRef.current;
    if (hostFriends === null) return;
    // Pruna: ids vars spelare försvunnit eller lämnat (hasLeft) tas bort ur
    // prompted-setet så en genuin rejoin promptar igen. Kön rensas från
    // stale ids (borta, lämnade eller approvade via annan väg — t.ex.
    // ApproveToggle:n medan popupen låg i kö).
    const activeIds = new Set(players.filter((p) => !p.hasLeft).map((p) => p.id));
    promptedIdsRef.current.forEach((id) => {
      if (!activeIds.has(id)) promptedIdsRef.current.delete(id);
    });
    // hostUnapprovedIdsRef rensas när spelaren är approved (valfri väg) eller
    // borta — ett senare join-varv börjar då med rent intent-state.
    hostUnapprovedIdsRef.current.forEach((id) => {
      const p = players.find((x) => x.id === id);
      if (!p || p.hasLeft || p.approved) hostUnapprovedIdsRef.current.delete(id);
    });
    // Pending approve-beslut för spelare som försvunnit ur lobbyn städas —
    // annars läcker de och skulle blockera approved-syncen om samma id
    // dyker upp igen (carry-over bevarar id:n mellan lobbies).
    pendingApprovalRef.current.forEach((_v, id) => {
      if (!activeIds.has(id)) pendingApprovalRef.current.delete(id);
    });
    setJoinPopupQueue((prev) => {
      const next = prev.filter((id) => {
        const p = players.find((x) => x.id === id);
        return !!p && !p.hasLeft && !p.approved;
      });
      return next.length === prev.length ? prev : next;
    });
    // Auto-approve friends eller enqueue nya unapproved joiners.
    players.forEach((p) => {
      if (p.isHost || p.hasLeft || p.approved) return;
      const isFriend =
        p.type === 'registered' &&
        hostFriends.some(
          (f) => f.playerName.toLowerCase() === p.name.trim().toLowerCase(),
        );
      // Samma guards som handleSetApproved — blockeras tyst approve faller
      // spelaren tillbaka till popupen där Approve-tappen visar guard-Alerten.
      const passesSilentGuards =
        !singlePlayerDefault &&
        lobbyPeerHealth[p.id] !== 'unstable' &&
        (!spotifyEnabled || !!p.spotifyConnected);
      if (isFriend && passesSilentGuards && !hostUnapprovedIdsRef.current.has(p.id)) {
        // Tyst auto-approve. MEDVETET inte gated på promptedIdsRef — om en
        // stale DB→local-sync (syncNonHostFields hann läsa joiner-radens
        // approved=false innan hostens bulk-write committat) downgradear en
        // nyss auto-approvad friend self-heal:ar nästa effekt-cykel genom
        // att re-approva. Hostens explicita un-approves respekteras via
        // hostUnapprovedIdsRef-checken ovan. DB-skrivning sker via host:s
        // bulk-write-effekt på [players] (setLobbyPlayers).
        promptedIdsRef.current.add(p.id);
        pendingApprovalRef.current.set(p.id, true);
        setPlayers((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, approved: true } : x)),
        );
        return;
      }
      if (promptedIdsRef.current.has(p.id)) return;
      promptedIdsRef.current.add(p.id);
      setJoinPopupQueue((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
    });
    // `friends` i deps: hostFriendsRef är en ref (triggar ingen re-run) —
    // mount-load:en sätter ref + setFriends ihop, så deps-membern garanterar
    // att watchern körs om när listan blir laddad även om players[] inte
    // ändrats sedan dess (joiner som hann in före loadFriends-resolven).
  }, [players, hostMode, spotifyEnabled, singlePlayerDefault, lobbyPeerHealth, friends]);

  // Driver "Waiting for approval"-mellansteget för non-host. När host inte
  // har godkänt mig än ska jag inte se lobby:n överhuvudtaget — bara en
  // status-skärm. Polling-effekten ovan plockar upp host:s approve-toggle
  // inom ~2s och då kan jag äntligen se hela lobby:n.
  const isApprovedByHost =
    !hostMode &&
    !!ownPlayerIdRef.current &&
    players.some((p) => p.id === ownPlayerIdRef.current && !!p.approved);
  const youtubeEnabled = youtubeEnabledCategories.length > 0;
  // guessWhereEnabled definieras ovan i derived state-blocket (imagesEnabledCategories.length > 0).
  // displayEra speglar realtids-värdet under drag och commitat värde
  // däremellan — så box "1990 – 2020" + youngest-player-warning uppdateras
  // live medan host drar utan att vi behöver toucha lib:ns prop.
  const displayEra = dragEraValues ?? eraValues;
  const { warning: eraWarning } = checkEraAgainstPlayer(displayEra[1], players);
  // To-året kan inte gå under ERA_TO_MIN (1980) — visa gul varning vid golvet.
  const eraAtToFloor = displayEra[1] <= ERA_TO_MIN;
  // Intervallet kan inte bli mindre än ERA_MIN_INTERVAL (15 år) — gul varning.
  const eraAtMinInterval = displayEra[1] - displayEra[0] <= ERA_MIN_INTERVAL;

  // Räkna aktiva spelare (exkl. hasLeft, vars plats är frigjord) — används
  // som capacity-check både vid + Add Player-knappen och vid Confirm i
  // formuläret. Defensiv dubbel-check skyddar mot race conditions där
  // någon annan joinar via room code mellan knapp-tryck och confirm.
  const isLobbyAtCapacity = () =>
    players.filter((p) => !p.hasLeft).length >= maxPlayers;

  // Tryck på "+ Add Player" — blockera redan här om lobbyn är full så
  // host inte slösar tid på att fylla i formuläret.
  const handleOpenAddPlayer = () => {
    // Re-match: uppsättningen är låst till förra spelets spelare. Knappen
    // renderas inte i det läget — detta är belt-and-suspenders mot oväntade
    // call-paths (och gör regeln läsbar där den faktiskt gäller).
    if (isRematchLobby) {
      Alert.alert(
        'Line-up locked',
        'A re-match keeps the exact same players as the previous game. Use Start New Game to play with someone else.',
      );
      return;
    }
    // Single player: lobbyn har per definition ingen plats för fler spelare.
    // Att tyst öppna formuläret gav en lobby med två kort men ett spel som
    // ändå startade som single player (Peter 2026-08-24) — fråga i stället
    // vilket multiplayer-läge host vill byta till. Cancel lämnar allt orört.
    if (singlePlayerDefault) {
      Alert.alert(
        'Change to Multiplayer mode?',
        'Adding a player requires a multiplayer mode. Which one do you want to play?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            // Individual device tar bort möjligheten att lägga till spelare
            // manuellt (varje spelare behöver en egen enhet), så vi byter
            // läge och förklarar vägen in i stället för att öppna formuläret.
            text: 'Individual device',
            onPress: () => {
              handleSelectMode('individual-devices');
              Alert.alert(
                'Individual device',
                "Game mode changed. Players can't be added manually in this mode — every player needs their own device. Share the room code and let them join from it.",
              );
            },
          },
          {
            text: 'Pass-the-Phone',
            onPress: () => {
              handleSelectMode('pass-the-phone');
              setTimeout(() => setAddModalVisible(true), ALERT_TO_MODAL_DELAY_MS);
            },
          },
        ],
      );
      return;
    }
    // Individual device + Remote 1v1 kräver egen enhet — host kan inte lägga
    // till guests manuellt. De måste joina med egen enhet via room code.
    if ((gameMode === 'individual-devices' || gameMode === 'remote-1v1') && !singlePlayerDefault) {
      Alert.alert(
        'Own device required',
        "Players can't be added manually in this game mode — every player needs their own device. Ask them to join with the room code instead, or switch game mode.",
      );
      return;
    }
    if (isLobbyAtCapacity()) {
      Alert.alert('Lobby is full', 'Lobby is already full with waiting and approved players. Remove players if to add others');
      return;
    }
    setAddModalVisible(true);
  };

  const handleAddPlayer = (name: string, age: number, assistance: AddPlayerAssistance) => {
    if (isLobbyAtCapacity()) {
      Alert.alert('Lobby is full', 'Lobby is already full with waiting and approved players. Remove players if to add others');
      return;
    }
    setPlayers((prev) => [
      ...prev,
      {
        id: `guest-${Date.now()}`,
        name,
        emoji: '👤',
        isReady: true,
        approved: true,
        type: 'guest',
        age,
        assistance,
        hcpComplete: true,
        addedByHost: true,
      },
    ]);
  };
  // Returnerar true när approve-ändringen applicerades, false när en guard
  // blockerade (Alert visad). Join-popup-handlers använder returvärdet för
  // att hålla popupen öppen vid guard-block; ApproveToggle-sites ignorerar det.
  const handleSetApproved = (id: string, approved: boolean): boolean => {
    // Check 0: single player — lobbyn har ingen plats för fler spelare, så
    // ingen non-host får approvas (Peter 2026-08-24). Home:s join-gate
    // (checkSinglePlayerLobby) kan fail-open:a i host:s 300 ms-debounce-
    // fönster, och en spelare som tagit sig in DÅ ska ändå aldrig kunna bli
    // godkänd. Detta är den auktoritativa spärren: den läser host:s EGEN
    // live-state, inte en DB-rad som kan vara i otakt.
    if (approved && singlePlayerDefault) {
      Alert.alert(...SINGLE_PLAYER_APPROVE_BLOCK);
      return false;
    }
    if (approved && lobbyPeerHealth[id] === 'unstable') {
      Alert.alert(
        'Connection unstable',
        'This player has an unstable connection. Wait for it to stabilize before approving them.',
      );
      return false;
    }
    // Check 3: Spotify är aktiverat och spelaren saknar Spotify-attest.
    if (approved && spotifyEnabled) {
      const player = players.find((p) => p.id === id);
      if (player && !player.spotifyConnected) {
        Alert.alert(
          'No Spotify confirmed',
          'This player has not confirmed the Spotify app. Either ask the player to confirm Spotify in their settings row, or switch off Spotify DJ in Source Dashboard to approve the player.',
        );
        return false;
      }
    }
    // Registrera host-intent så friend-auto-approve-watchern inte tyst
    // re-approvar en friend som host medvetet togglat till waiting.
    if (approved) hostUnapprovedIdsRef.current.delete(id);
    else hostUnapprovedIdsRef.current.add(id);
    pendingApprovalRef.current.set(id, approved);
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, approved } : p));
    return true;
  };

  // D-vii auto-un-approve: när en non-host:s peerHealth transitionerar
  // till 'unstable' OCH de är approved, kasta dem tillbaka till waiting
  // automatiskt. Host måste manuellt re-approva när uppkopplingen är
  // stable igen. Effekt:en gateas på hostMode + IndDev — non-hosts har
  // inte approval-power, Pass-the-Phone delar device → ingen peer-health.
  useEffect(() => {
    if (!hostMode || gameMode !== 'individual-devices') return;
    Object.entries(lobbyPeerHealth).forEach(([playerId, health]) => {
      if (health !== 'unstable') return;
      const player = players.find((p) => p.id === playerId);
      if (!player || player.isHost || !player.approved) return;
      // Registrera som host-intent — dokumenterad D-vii-semantik är att
      // host manuellt re-approvar när uppkopplingen är stable igen; utan
      // detta skulle friend-auto-approve-watchern tyst re-approva friends
      // så fort peerHealth blir stable.
      hostUnapprovedIdsRef.current.add(playerId);
      pendingApprovalRef.current.set(playerId, false);
      // Idempotent: setPlayers no-op:ar när raden redan är unapproved.
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, approved: false } : p)),
      );
    });
  }, [lobbyPeerHealth, hostMode, gameMode, players]);

  // Delad eject-body: används av trash-flowet (efter confirm-Alert) och av
  // join-popupens Deny (utan extra confirm — popupen ÄR beslutet).
  const ejectPlayer = (id: string) => {
    // 1. Markera ejected i in-memory store så non-host:s lokala
    //    polling-detektion fortfarande triggar popupen (för spelare
    //    på SAMMA device, t.ex. simulator-multi-instance-test).
    markEjected(roomCode, id);
    // 2. Filter bort raden från host:s local state.
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    // 3. DELETE raden från lobby_players-DB:n. Realtime DELETE-event
    //    broadcastas till non-host:s subscription → triggar Device B:s
    //    eject-popup cross-device. Fire-and-forget.
    supabase
      .from('lobby_players')
      .delete()
      .eq('room_code', roomCode)
      .eq('player_id', id)
      .then(({ error }) => {
        if (error) console.warn('[lobbyPlayers] eject delete failed:', error.message);
      });
  };

  // Papperskorg-flow: bara host kan radera, bara på waiting-spelare.
  // Visar confirm-popup; vid bekräftelse filtreras spelaren bort ur
  // players[]. För approved-spelare måste host först toggla tillbaka
  // till No så raden hamnar i waiting-listan igen och papperskorgen syns.
  const handleDeletePlayer = (id: string) => {
    Alert.alert(
      'Remove player',
      'Are you sure you want to delete this Player from this Lobby?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => ejectPlayer(id) },
      ],
    );
  };

  // ── Join-approval-popup handlers (host) ───────────────────────────────
  // Aktuell popup-spelare = första id i kön som fortfarande är kvar,
  // aktiv och unapproved — stale entries (approvade via toggle, lämnade)
  // auto-skippas via derivationen + watcher-effektens kö-prune.
  const joinPopupPlayer =
    players.find(
      (p) => p.id === joinPopupQueue[0] && !p.hasLeft && !p.approved,
    ) ?? null;
  const advanceJoinPopup = () => setJoinPopupQueue((prev) => prev.slice(1));
  const handleJoinPopupApprove = () => {
    if (!joinPopupPlayer) return;
    // Guard-block (peer health / Spotify) → Alert visas och popupen står
    // kvar så host fortfarande kan välja Deny/Later.
    if (handleSetApproved(joinPopupPlayer.id, true)) advanceJoinPopup();
  };
  const handleJoinPopupApproveAndFriend = () => {
    if (!joinPopupPlayer) return;
    const p = joinPopupPlayer;
    if (!handleSetApproved(p.id, true)) return;
    advanceJoinPopup();
    // Fire-and-forget: addFriend dedupar case-insensitive på playerName.
    // Reverse emoji→avatarId-lookup (emojis är unika i AVATARS-listan);
    // guest-emoji 👤 saknas där → undefined, vilket är OK för Friend-shapen.
    const avatarId = AVATARS.find((a) => a.emoji === p.emoji)?.id;
    addFriend(p.name, avatarId)
      .then((updated) => {
        hostFriendsRef.current = updated;
        setFriends(updated);
      })
      .catch(() => { /* friends-skrivning loggas i friendsStorage */ });
  };
  const handleJoinPopupDeny = () => {
    if (!joinPopupPlayer) return;
    ejectPlayer(joinPopupPlayer.id);
    advanceJoinPopup();
  };
  // Later: spelaren ligger kvar i "To be Approved by Host"-listan för
  // manuell approve via ApproveToggle:n; id:t stannar i promptedIdsRef så
  // ingen re-prompt-loop uppstår.
  const handleJoinPopupLater = () => advanceJoinPopup();
  const handleApproveAll = () => {
    // Check 0: single player — samma spärr som handleSetApproved.
    // ⚠ Denna master-toggle skriver setPlayers DIREKT och går ALDRIG via
    // handleSetApproved, så varje ny approve-guard måste speglas hit.
    // (Det var precis den luckan som lät en non-host bli approved i en
    // single-player-lobby, Peter 2026-08-24.)
    if (singlePlayerDefault) {
      Alert.alert(...SINGLE_PLAYER_APPROVE_BLOCK);
      return;
    }
    // Check 4: Spotify är aktiverat och några waiting-spelare saknar Spotify-attest.
    if (spotifyEnabled) {
      const waiting = players.filter((p) => !p.isHost && !p.hasLeft && !p.approved && p.hcpComplete);
      const withoutSpotify = waiting.filter((p) => !p.spotifyConnected);
      if (withoutSpotify.length > 0) {
        Alert.alert(
          'Not all players have Spotify',
          'Not all players in the lobby have confirmed the Spotify app. Please ask them to confirm Spotify in their settings row, or switch off Spotify DJ in Source Dashboard to approve players.',
        );
        return;
      }
    }
    players.forEach((p) => {
      if (p.hcpComplete && !p.isHost) pendingApprovalRef.current.set(p.id, true);
    });
    setPlayers((prev) => prev.map((p) => p.hcpComplete ? { ...p, approved: true } : p));
  };

  // ── Player-edit modal (host-only) ────────────────────────────────
  // Host kan redigera Assistance level, Competition Year of Birth och HCP
  // för valfri spelare i lobbyn (inkl. sig själv). Guest:s HCP göms i
  // formuläret eftersom det auto-deriveras från närmaste age-matched
  // registrerade spelare. Alla skrivningar går bara till lokal players[]-
  // state — saveProfile() kallas ALDRIG från detta flöde, så redigeringen
  // är garanterat lobby-lokal och påverkar inte spelarens profil för
  // framtida spel.
  const [playerEditTargetId, setPlayerEditTargetId] = useState<string | null>(null);
  const [editHcpValue, setEditHcpValue] = useState('');
  const [editBirthYear, setEditBirthYear] = useState<number | null>(null);
  const [editAssistance, setEditAssistance] = useState<'minimal' | 'standard' | 'full'>('standard');
  const [editYearPickerOpen, setEditYearPickerOpen] = useState(false);

  const playerEditTarget = playerEditTargetId
    ? players.find((p) => p.id === playerEditTargetId) ?? null
    : null;
  const playerEditIsGuest = playerEditTarget?.type === 'guest';

  const openPlayerEdit = (id: string) => {
    const target = players.find((p) => p.id === id);
    if (!target) return;
    const currentYear = new Date().getFullYear();
    // Förfyll med aktuella värden i lobby-state. age → birthYear via
    // current-year-räkning (ev. dag-precision off-by-one är trivial
    // jämfört med år-räkningens granularitet).
    const seedBirthYear = target.age !== undefined ? currentYear - target.age : null;
    const seedAssistance = target.assistance ?? 'standard';
    const calcHcp =
      target.hcpComplete && target.age && target.assistance
        ? calculateInitialHCP(target.age, target.assistance)
        : null;
    const seedHcp = target.hcpOverride ?? calcHcp;
    setEditBirthYear(seedBirthYear);
    setEditAssistance(seedAssistance);
    setEditHcpValue(seedHcp !== null && seedHcp !== undefined ? String(seedHcp) : '');
    setEditYearPickerOpen(false);
    setPlayerEditTargetId(id);
  };

  const closePlayerEdit = () => {
    setPlayerEditTargetId(null);
    setEditHcpValue('');
    setEditBirthYear(null);
    setEditAssistance('standard');
    setEditYearPickerOpen(false);
  };

  // Assistance-progressions-ordning: lägre tal = svårare nivå. Host får
  // bara flytta nedåt eller stå still — Full(2) → Standard(1) → Minimal(0).
  // Minimal är låst (kan inte ändras alls).
  // Host får fritt justera Assistance åt båda håll (lättare som svårare) från
  // spelarens default — ingen riktnings-låsning längre (2026-06-01).
  const handleSelectEditAssistance = (next: 'minimal' | 'standard' | 'full') => {
    setEditAssistance(next);
  };

  const handleSavePlayerEdit = () => {
    if (!playerEditTargetId || !playerEditTarget) return;
    if (editBirthYear === null) {
      Alert.alert('Missing year', 'Pick a Competition Year of Birth.');
      return;
    }
    const target = playerEditTarget;
    const currentYear = new Date().getFullYear();
    const nextAge = currentYear - editBirthYear;
    const originalAge = target.age ?? nextAge;

    // 1) Age får bara höjas (= tidigare birth year). Stå-still tillåtet.
    if (nextAge < originalAge) {
      Alert.alert(
        'Cannot lower age',
        'Age can only be raised — pick an earlier Year of Birth.',
      );
      return;
    }

    // 2) Assistance: host får sätta valfri nivå (lättare som svårare) — ingen
    //    riktnings-validering längre.

    // 3) HCP-validering bara för icke-guest (guest:ens HCP är auto-derived
    //    och fältet är dolt). För registrerade kräver vi ett giltigt 1–99
    //    OCH att värdet inte höjs jämfört med innan editen.
    let nextHcpOverride: number | undefined;
    if (!playerEditIsGuest) {
      const trimmed = editHcpValue.trim();
      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed) || parsed < MIN_HCP || parsed > 99) {
        Alert.alert('Invalid HCP', `HCP must be a number between ${MIN_HCP} and 99.`);
        return;
      }
      const calcHcp =
        target.hcpComplete && target.age && target.assistance
          ? calculateInitialHCP(target.age, target.assistance)
          : null;
      const originalHcp = target.hcpOverride ?? calcHcp;
      if (originalHcp !== null && parsed > originalHcp) {
        Alert.alert(
          'Cannot raise HCP',
          `HCP can only be lowered — pick a value of ${originalHcp} or less.`,
        );
        return;
      }
      nextHcpOverride = parsed;
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerEditTargetId
          ? {
              ...p,
              age: nextAge,
              assistance: editAssistance,
              // Guest:ens hcpOverride lämnas alltid undefined — getGuestHcp
              // sköter beräkningen från registrerade spelare i lobbyn.
              hcpOverride: playerEditIsGuest ? undefined : nextHcpOverride,
              lobbyEdited: true,
            }
          : p,
      ),
    );
    closePlayerEdit();
  };

  // Synka HCP-fältet med det beräknade värdet när host justerar age eller
  // assistance i samma session — så fältet visar "vad HCP skulle bli" om
  // host inte typar något manuellt. Trigger: när birthYear/assistance
  // ändras OCH host inte själv pratat HCP-input fritt sedan.
  // Implementation: bevara om host:s nuvarande HCP-input matchar tidigare
  // beräkning; om de skrivit ett eget värde lämnar vi det orört.
  // (Enklare alternativ: ingen auto-sync — host får skriva eget HCP eller
  // använda Reset till default. Vi väljer just nu enkelhet.)
  const movePlayer = (id: string, dir: 'up' | 'down') => {
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = dir === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };
  // Öppnar Share invite-modalen och laddar in den senaste friends-listan.
  const handleOpenShareModal = async () => {
    setInvitedFriendIds(new Set());
    setNewFriendPlayerName('');
    setShareModalOpen(true);
    const list = await loadFriends();
    setFriends(list);
    hostFriendsRef.current = list;
  };

  // Lägg till en QuizVibe friend direkt från Share invite-modalen. Speglar
  // Profile:s handleAddFriend exakt — addFriend dedupar case-insensitive på
  // playerName så dubbel-add är säkert. Efter tillagd friend syns hen i
  // listan med en Invite-knapp; host kan välja att invite:a direkt eller
  // bara behålla för senare spel.
  const handleAddFriendFromShare = async () => {
    if (!newFriendPlayerName.trim()) return;
    const updated = await addFriend(newFriendPlayerName);
    setFriends(updated);
    // Håll auto-approve-listan i sync så en nyligen tillagd friend som
    // joinar direkt efteråt auto-approvas utan popup.
    hostFriendsRef.current = updated;
    setNewFriendPlayerName('');
  };

  // Remote 1v1-lobby (inte single player). Gatar "Save 1vs1 – Play later"
  // i BÅDA TopUserBanner-sheetsen — läget är det enda där lobbyn är värd
  // att spara: rummet lever 24h och matchen är asynkron ändå.
  // Förväntad uppsättning i en låst re-match-lobby: lobby_players.player_id
  // för spelarna från föregående spel, skrivna atomiskt på rums-raden av
  // registerActiveRoom (migration 0037). Driver både antalet i den statiska
  // indikatorn och "alla på plats"-guarden i handleStartGame.
  const [rematchExpectedIds, setRematchExpectedIds] = useState<string[]>([]);
  useEffect(() => {
    if (!isRematchLobby) return;
    let cancelled = false;
    void getRoomMeta(roomCode).then((meta) => {
      const ids = meta?.rematchPlayerIds ?? [];
      if (!cancelled && ids.length > 0) setRematchExpectedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [isRematchLobby, roomCode]);
  // Fallback till de faktiskt pre-seedade raderna när rums-raden saknar
  // listan (0037 inte körd → registerActiveRoom:s fallback skrev rummet
  // utan fälten). Lobbyn låses ändå visuellt; bara "alla på plats"-guarden
  // degraderar till en no-op, vilket är rätt riktning att fela åt.
  const lockedLineupCount =
    rematchExpectedIds.length || players.filter((p) => !p.hasLeft).length;

  const isRemoteLobby = gameMode === 'remote-1v1' && !singlePlayerDefault;
  // Gemensam hjälpnivå gäller bara när BÅDE lobbyn är remote OCH host slagit
  // på switchen. Är den av beter sig assistance precis som i lokala lägen
  // (per spelarkort), så alla per-spelare-vägar (player-edit, PlayerRow-pill,
  // turnOrder-assistance) ska då lämnas orörda.
  const mutualAssistanceActive = isRemoteLobby && mutualAssistanceEnabled;

  /**
   * "Save 1vs1 – Play later" — sparar LOBBYN (inte matchen) lokalt för den
   * här användaren och går till Home. Posten dyker upp i Remote Play
   * History under "Not started"; tap:en där tar spelaren tillbaka in i
   * lobbyn så länge rummet lever (24h).
   *
   * Medvetet INTE samma sak som Leave/Delete:
   *  • Non-host markeras ALDRIG som `hasLeft` — de behåller sin plats i
   *    rostern så host fortfarande kan trycka Start Game.
   *  • Host raderar INTE rummet — rooms-raden lever vidare till sin
   *    24h-deadline och koden är fortsatt joinbar.
   * Ingen match skapas och ingen credit dras — det sker först vid Start Game.
   */
  const handleSaveRemoteLobby = async (fromHostSheet: boolean) => {
    if (fromHostSheet) setHostDeleteSheetVisible(false);
    else setGuestLeaveSheetVisible(false);
    // Motståndaren = den andra aktiva parten sett från den som sparar.
    // Bara till radens undertext; null när ingen hunnit joina ännu.
    const counterpart = hostMode
      ? players.find((p) => !p.isHost && !p.hasLeft)
      : players.find((p) => p.isHost);
    await saveLobby({
      roomCode,
      isHost: hostMode,
      opponentName: counterpart?.name ?? null,
      savedAt: new Date().toISOString(),
    });
    Alert.alert(
      '1vs1 lobby saved',
      'Find it under "1vs1" on the Home screen, with status Not started. The lobby stays open for 24 hours.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
    );
  };

  // Två-stegs leave-flow för non-hosts (både gäster och registrerade
  // spelare som joinat via kod):
  // 1) Sheet:n stängs.
  // 2) Native Alert konfirmerar destruktiv åtgärd.
  // Yes → markera spelaren som left i leftPlayers-storen (så övriga i
  //   lobby:n ser "LEFT THIS GAME LOBBY" på spelarkortet) → router.replace('/')
  //   tar dem till Home. Lokal lobby-state + URL-params kasseras automatiskt
  //   när komponenten unmountas.
  const handleGuestLeaveRoom = () => {
    setGuestLeaveSheetVisible(false);
    Alert.alert(
      'Leave this Game Lobby?',
      // Remote 1v1 spelas bara av QuizVibe-users — där finns ingen
      // guest-data att förlora, så meddelandet säger bara vad som händer.
      isRemoteLobby
        ? 'You will be removed from this Game Lobby.'
        : 'You will be directed to Home page and Guest Player data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const ownId = ownPlayerIdRef.current;
            const ownPlayer = ownId ? players.find((p) => p.id === ownId) : undefined;
            if (ownPlayer) {
              // Cross-device-sync (Slice 3C-ii): UPDATE:a egen rad i
              // lobby_players med has_left=true så övriga klienter får
              // Realtime-broadcast → ser kortet renderat med grå "LEFT
              // THIS GAME LOBBY"-styling utan att vänta på polling.
              // Parallellt med AsyncStorage-snapshot:en (legacy + offline-
              // fallback för test-seed-rum). Båda körs i parallel — DB
              // failar tyst om guests saknar anon-session, AsyncStorage
              // funkar alltid lokalt.
              await Promise.all([
                markOwnPlayerLeft(roomCode, ownPlayer.id),
                addLeftPlayer(roomCode, {
                  id: ownPlayer.id,
                  name: ownPlayer.name,
                  emoji: ownPlayer.emoji,
                  avatarUri: ownPlayer.avatarUri,
                  type: ownPlayer.type,
                  age: ownPlayer.age,
                  assistance: ownPlayer.assistance,
                  hcpComplete: ownPlayer.hcpComplete,
                  approved: ownPlayer.approved,
                }),
              ]);
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Delad delete-mekanik för host:en — används av BÅDE "Delete this Game
  // Lobby"-flödet OCH guest-hostens "Activate Extra package → register"-
  // flöde (2026-07-07). Deaktiverar rummet + rensar mock-stores, visar
  // loading-overlay ~1.6s och kör sedan onDone (navigation).
  // Speglar EXAKT tidigare handleDeleteLobby-beteende (clearLeftPlayers
  // ingår medvetet INTE — anropades inte tidigare heller).
  const performLobbyDelete = async (onDone: () => void) => {
    // Deaktivera rummet direkt så non-hosts polling-detection
    // upptäcker det inom ~2s (även medan host:s loading-overlay
    // visas — det är realistiskt async-beteende).
    await deactivateRoom(roomCode);
    clearLobbyPlayers(roomCode);
    clearLobbySettings(roomCode);
    clearEjected(roomCode);
    clearGameStarted(roomCode);
    // Visa loading-overlay i ~1.6s innan navigation. Ger host:en
    // visuell feedback att appen processar och matchar real-
    // backend-känsla där en DELETE-request tar några hundra ms.
    // VIKTIGT: stäng overlay:n EXPLICIT innan navigation. Stack-
    // navigatorn kan bevara Modal-state över route-replace —
    // utan dismiss skulle Modal:en stå kvar synlig ovanpå Home-
    // skärmen efter navigationen.
    setDeletingLobby(true);
    setTimeout(() => {
      setDeletingLobby(false);
      onDone();
    }, 1600);
  };

  // Två-stegs delete-flow för host:en (motsvarighet till non-host:s
  // leave-flow). Yes → deactivateRoom() tar bort koden från ACTIVE_ROOM_
  // CODES, vilket gör att:
  //   • Nya join-försök blockeras med "Room not found"-Alert via existing
  //     isActiveRoom-check i handleJoinWithCode/handleJoinAsGuest.
  //   • Kvarvarande non-hosts i lobby:n upptäcker det via polling-effekten
  //     nedan och får "Game Lobby deleted by Host"-popup → OK → Home.
  // Host själv navigeras till Home direkt efter deactivation. Lokal lobby-
  // state kasseras automatiskt när komponenten unmountas.
  const handleDeleteLobby = () => {
    setHostDeleteSheetVisible(false);
    Alert.alert(
      'Delete this Game Lobby?',
      'All players currently in this lobby will be notified and disconnected. The room code will become inactive.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => performLobbyDelete(() => router.replace('/')),
        },
      ],
    );
  };

  // Non-host detection: pollar roomExists var 2:a sekund. När rummet
  // blir borta (host har deletat det) sätter vi roomDeletedDetected=true
  // som triggar Alert:en nedanför. Polling istället för Realtime —
  // ersätts med supabase.channel('postgres_changes').on(...) i Slice 3B.
  // Host själv exkluderas — de som deletat ska inte få sin egen popup.
  // Noterat att vi använder roomExists (ej isActiveRoom) — game_started
  // ska inte trigga "deleted by host"-popupen; non-hosts som hamnar i
  // detta läge sköts av mockStartedGames-polling separat.
  useEffect(() => {
    if (hostMode) return;
    let cancelled = false;
    const check = async () => {
      const exists = await roomExists(roomCode);
      if (cancelled) return;
      if (!exists) setRoomDeletedDetected(true);
    };
    check();
    const interval = setInterval(check, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hostMode, roomCode]);

  // Sync maxPlayers från host:s rummeta för non-host. Polling-mönstret
  // speglar room-deletion-detection ovan. Ersätts med Realtime-
  // subscription på rooms-tabellen i Slice 3B.
  useEffect(() => {
    if (hostMode) return;
    let cancelled = false;
    const syncFromMeta = async () => {
      const meta = await getRoomMeta(roomCode);
      if (cancelled) return;
      if (meta && meta.maxPlayers !== maxPlayers) {
        setMaxPlayers(meta.maxPlayers);
      }
    };
    syncFromMeta();
    const interval = setInterval(syncFromMeta, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hostMode, roomCode, maxPlayers]);

  // Host: skriv players[]-state till lobby_players-tabellen vid varje
  // ändring så non-hosts (via Realtime-subscription) får authoritative
  // listan direkt. Gated på hostMode så non-hosts aldrig skriver tillbaka
  // över host:s snapshot. Fire-and-forget — UI:t väntar inte på roundtrip.
  useEffect(() => {
    if (!hostMode) return;
    setLobbyPlayers(roomCode, players)
      .then(() => {
        // Guest alias för host: en INLOGGAD user som hostar som Guest
        // publicerar sitt kontonamn så joiners ser vem värden är. En gång
        // per lobby — effekten körs vid varje players-ändring, och
        // kolumnen ändras aldrig under lobbyns livstid.
        if (hostAliasPublishedRef.current) return;
        const hostId = players.find((p) => p.isHost)?.id;
        if (!hostId) return;
        hostAliasPublishedRef.current = true;
        publishOwnAccountAlias(roomCode, hostId);
      })
      .catch(() => { /* loggas i mockLobbyPlayers */ });
  }, [hostMode, roomCode, players]);

  // Host: skriv host-settings (gameMode, region, era, rounds, response time,
  // packages, Game Connections-toggles) till mockLobbySettings-storen vid
  // varje ändring. Speglar samma write-pattern som players-storen ovan.
  // Non-host:s poll-effekt nedan plockar upp och syncar lokal state.
  // Debounce-write: snabba ändringar (era-slider-drag, multi-toggle) kan
  // generera N upserts per sekund. Utan debounce ger det Realtime-thrashing
  // + risk att in-flight responses arriverar i fel ordning → DB hamnar
  // i fel sluttillstånd. 300ms idle räknas som "användaren stoppade" →
  // sista state-snapshot:en skrivs då.
  useEffect(() => {
    // Skriver inte förrän seed-effekten är klar (lobbySeededRef.current = true).
    // Utan denna guard hinner debounce:n skriva med default-värden 300 ms
    // INNAN Promise.all resolvar — skapar en "stored"-post med spotifyEnabled=false
    // som sedan vinner mot profil-defaults i seed-effektens if (!stored)-gren.
    if (!hostMode || !lobbySeededRef.current) return;
    const handle = setTimeout(() => {
      setLobbySettings(roomCode, {
        gameMode,
        singlePlayerDefault,
        maxPlayers,
        region,
        answerResponseSeconds,
        eraFrom: eraValues[0],
        eraTo: eraValues[1],
        roundsCount,
        selectedExtraPackages,
        youtubeEnabledCategories,
        imagesEnabledCategories,
        sketchEnabled,
        spotifyEnabled,
        spotifyAnswerYear,
        spotifyAnswerName,
        remoteAssistance,
        mutualAssistanceEnabled,
      }).catch(() => { /* loggas i mockLobbySettings */ });
    }, 300);
    return () => clearTimeout(handle);
  }, [
    hostMode,
    roomCode,
    gameMode,
    singlePlayerDefault,
    maxPlayers,
    region,
    answerResponseSeconds,
    eraValues,
    roundsCount,
    selectedExtraPackages,
    youtubeEnabledCategories,
    imagesEnabledCategories,
    sketchEnabled,
    spotifyEnabled,
    spotifyAnswerYear,
    spotifyAnswerName,
    remoteAssistance,
    mutualAssistanceEnabled,
  ]);

  // Realtime-tick: bumpas av lobby_players + lobby_settings-channel-
  // subscriptions nedan. Settings- och players-syncningseffekterna har
  // den i sina deps så de re-fetchar direkt vid varje broadcast — ~200ms
  // istället för 2s polling-fallback.
  const [realtimeTick, setRealtimeTick] = useState(0);


  // Non-host: spegla host-settings (Game Mode, Region, Game Era, Number
  // of Rounds, Answer response time, Packages, Game Connections-toggles).
  // Initial-fetch + 2s polling som fallback om Realtime droppar; realtime-
  // tick i deps triggar omedelbar re-fetch vid broadcast.
  useEffect(() => {
    if (hostMode) return;
    let cancelled = false;
    const syncFromStore = async () => {
      const stored = await getLobbySettings(roomCode);
      if (cancelled || !stored) return;
      // Remote 1vs1-backstop (2026-08-08): läget spelas ENBART av
      // QuizVibe-users mot varandra. Home:s guest-join-gate är fail-open
      // under fönstret innan hostens settings-skrivning landat, så vi
      // ejectar guest-läge här så fort gameMode resolvat. Gatan är på
      // guest-LÄGE (isGuestInRoom), inte på anon-session: en registrerad
      // user som joinat via guest-formen spelar också som Guest och är
      // lika utestängd. Körs före all state-spegling så vi inte renderar
      // en 1v1-lobby för någon som ändå ska ut.
      // Redan ejectad → sluta spegla settings helt medan popup:en visas.
      if (remoteGuestEjectedRef.current) return;
      if (stored.gameMode === 'remote-1v1' && isGuestInRoom) {
        if (cancelled) return;
        remoteGuestEjectedRef.current = true;
        // Städa den egna raden först så ingen orphan blir kvar i lobbyn
        // (samma ordning som Leave-flödet).
        const ownId = ownPlayerIdRef.current;
        if (ownId) await markOwnPlayerLeft(roomCode, ownId).catch(() => {});
        setRemoteGuestBlockedDetected(true);
        return;
      }
      setGameMode(stored.gameMode);
      setSinglePlayerDefault(stored.singlePlayerDefault);
      setMaxPlayers(stored.maxPlayers);
      // V1: Region är låst till 'Sweden'. Stored.region kan vara legacy
      // (Nordics/Europe/Global) — ignorera den och stå kvar på Sweden.
      setRegion('Sweden');
      setAnswerResponseSeconds(stored.answerResponseSeconds);
      setEraValues((prev) =>
        prev[0] === stored.eraFrom && prev[1] === stored.eraTo
          ? prev
          : [stored.eraFrom, stored.eraTo],
      );
      setRoundsCount(stored.roundsCount);
      setSelectedExtraPackages((prev) => {
        if (
          prev.length === stored.selectedExtraPackages.length &&
          prev.every((id, i) => id === stored.selectedExtraPackages[i])
        ) {
          return prev;
        }
        return stored.selectedExtraPackages;
      });
      setSketchEnabled(stored.sketchEnabled);
      setSpotifyEnabled(stored.spotifyEnabled);
      setSpotifyAnswerYear(stored.spotifyAnswerYear);
      setSpotifyAnswerName(stored.spotifyAnswerName);
      // Remote 1v1: hostens gemensamma hjälpnivå + om den alls är påslagen
      // (read-only för non-host).
      setRemoteAssistance(stored.remoteAssistance);
      setMutualAssistanceEnabled(stored.mutualAssistanceEnabled);
      // Per-source categories — [] är ett giltigt "allt av"-val och får INTE
      // coerceas till defaults. Direkt tilldelning respekterar host:s explicita val.
      setYoutubeEnabledCategories((prev) => {
        const next = stored.youtubeEnabledCategories;
        return prev.length === next.length && prev.every((c, i) => c === next[i]) ? prev : next;
      });
      setImagesEnabledCategories((prev) => {
        const next = stored.imagesEnabledCategories;
        return prev.length === next.length && prev.every((c, i) => c === next[i]) ? prev : next;
      });
    };
    syncFromStore();
    const interval = setInterval(syncFromStore, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hostMode, roomCode, realtimeTick, isGuestInRoom]);

  // Realtime-channel (non-host): prenumererar på lobby_players + lobby_settings
  // postgres_changes-events filtrerade på vårt roomCode. Vid varje event
  // bumpar vi realtimeTick som triggar settings/players-syncningseffekterna
  // att re-fetcha.
  useEffect(() => {
    if (hostMode || !roomCode) return;
    // Defensiv: supabase.channel(name) returnerar BEFINTLIG channel om
    // topic matchar (per RealtimeClient.ts), så om föregående cleanup inte
    // hunnit klart innan effekten re-körs får vi tillbaka en subscribed
    // channel → .on() därpå kraschar med "cannot add postgres_changes
    // callbacks after subscribe()". Rensa stale först.
    const topic = `realtime:lobby:${roomCode}`;
    supabase.getChannels()
      .filter((c) => c.topic === topic)
      .forEach((c) => supabase.removeChannel(c));
    const channel = supabase
      .channel(`lobby:${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lobby_players', filter: `room_code=eq.${roomCode}` },
        () => setRealtimeTick((t) => t + 1),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lobby_settings', filter: `room_code=eq.${roomCode}` },
        () => setRealtimeTick((t) => t + 1),
      )
      // rooms-changes: när host sätter game_started=true (3A markRoomGameStarted)
      // bumpas tick:en och player-poll-effekten re-fetchar → detekterar via
      // getRoomMeta().gameStarted att host startat → approved spelare navigerar
      // till /quiz, oapproverade spelare får "started without me"-popup.
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
        () => setRealtimeTick((t) => t + 1),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hostMode, roomCode]);

  // Host: ladda friends-listan vid mount så join-watcher-effekten kan
  // auto-approva joiners som redan är friends. Speglas även in i `friends`-
  // state så Share-modalen visar samma lista utan extra load.
  useEffect(() => {
    if (!hostMode) return;
    let cancelled = false;
    loadFriends().then((list) => {
      if (cancelled) return;
      hostFriendsRef.current = list;
      setFriends(list);
    });
    return () => {
      cancelled = true;
    };
  }, [hostMode]);

  // Realtime-channel (host): detekterar nya joiners via INSERT-event på
  // lobby_players. När en joiner INSERT:ar sin rad fyrar Realtime → host
  // re-fetchar listan och merge:ar in joiners som ännu inte finns i lokala
  // players[]-state. Host bevarar sina lokala modifications (approve, age-
  // edit etc.) genom att INTE överskriva existerande rader.
  //
  // UPDATE-events hanteras parallellt med en separat sync som BARA
  // uppdaterar has_left-flaggan på existerande rader (Slice 3C-ii). Detta
  // är medvetet konservativt — vi vill inte överskriva host:s lokala
  // edits (approve, age, lobbyEdited) som inte är källa-of-truth i DB.
  useEffect(() => {
    if (!hostMode || !roomCode) return;
    let cancelled = false;
    const fetchNewJoiners = async () => {
      const stored = await getLobbyPlayers(roomCode);
      if (cancelled || !stored) return;
      setPlayers((prev) => {
        const localIds = new Set(prev.map((p) => p.id));
        // Namn-dedup mot lokala state: Play Again carry-over kan ge en race
        // där non-host:s code-only-join inte hittade carry-over-raden i DB
        // (Supabase-propagering hann inte) → non-host insertade en ny rad
        // med nytt id. DB har då två rader: carry-over-id + ny-id. Utan
        // namnfilter läser fetchNewJoiners in ny-id-raden som "ny joiner"
        // (carry-over-id finns i localIds men inte ny-id) → host ser 2 kort.
        const localNames = new Set(
          prev.filter((p) => !p.isHost).map((p) => p.name.trim().toLowerCase()),
        );
        // Hoppa över rader som är host-typade (host:s eget kort hanteras
        // separat via mergeProfileIntoHost) — vi vill bara plocka in nya
        // joiners (registered/guest/manual som ännu inte är i lokal state).
        const newJoiners = stored.filter(
          (p) => !p.isHost && !localIds.has(p.id) && !localNames.has(p.name.trim().toLowerCase()),
        );
        if (newJoiners.length === 0) return prev;
        const hostIdx = prev.findIndex((p) => p.isHost);
        const insertAt = hostIdx === -1 ? prev.length : hostIdx + 1;
        const next = [...prev];
        next.splice(insertAt, 0, ...newJoiners);
        return next;
      });
    };
    // Syncar non-host-fält som non-host:en själv kan skriva till DB:n:
    // `hasLeft` (markOwnPlayerLeft + reset vid re-join). `approved` läses
    // hit-vägen — carry-over-join rör INTE approved i DB, så host:s eventuella
    // approval (approved=true) syns hit via denna sync (fetchNewJoiners).
    //
    // Utan approved-sync skulle host:s useEffect [players]-trigger (från
    // hasLeft-ändringen) köra setLobbyPlayers som bulk-UPSERT:ar lokala
    // state — och eftersom host:s lokala `approved` ligger kvar som true
    // från en tidigare approval skulle bulk-UPSERT:en clobba DB:s freshly-
    // set approved=false tillbaka till true. Resultatet: non-host som
    // re-joinar via Share invite eller code skulle auto-approvas av host
    // utan att host gjort något — fel beteende.
    //
    // Genom att pulla approved från DB:n in i lokala state INNAN useEffect
    // fyrar, blir bulk-UPSERT:ens payload `approved=false` (i sync med DB)
    // och ingen clobber sker.
    const syncNonHostFields = async () => {
      const stored = await getLobbyPlayers(roomCode);
      if (cancelled || !stored) return;
      setPlayers((prev) => {
        let changed = false;
        const next = prev.map((p) => {
          if (p.isHost) return p; // host:s fält ägs lokalt (mergeProfileIntoHost)
          const updated = stored.find((s) => s.id === p.id);
          if (!updated) return p;
          const nextHasLeft = !!updated.hasLeft;
          const dbApproved = !!updated.approved;
          // Host:s egna, ännu obekräftade approve-beslut vinner över DB:n.
          // När DB rapporterar samma värde är skrivningen bekräftad →
          // släpp posten så normal sync (t.ex. re-join → approved=false)
          // fungerar igen. Utan detta flimrar kortet mellan "Approved" och
          // "To be Approved" medan bulk-write:en är i flykt.
          const pending = pendingApprovalRef.current.get(p.id);
          if (pending !== undefined && dbApproved === pending) {
            pendingApprovalRef.current.delete(p.id);
          }
          const nextApproved =
            pending !== undefined && dbApproved !== pending ? pending : dbApproved;
          const nextSpotifyConnected = !!updated.spotifyConnected;
          // Guest alias publiceras av spelaren själv en kort stund EFTER
          // deras upsert, så fetchNewJoiners hinner ofta läsa raden innan
          // kolumnen är satt (och plockar sedan aldrig upp den igen —
          // spelaren är då redan i localIds). Konvergera den här istället.
          const nextAccountName = updated.accountPlayerName;
          if (
            !!p.hasLeft === nextHasLeft &&
            !!p.approved === nextApproved &&
            !!p.spotifyConnected === nextSpotifyConnected &&
            p.accountPlayerName === nextAccountName
          )
            return p;
          changed = true;
          return {
            ...p,
            hasLeft: nextHasLeft,
            approved: nextApproved,
            spotifyConnected: nextSpotifyConnected,
            accountPlayerName: nextAccountName,
          };
        });
        return changed ? next : prev;
      });
    };
    // Bakåtkompat-alias för call-sites nedan som fortsatt heter syncHasLeft.
    const syncHasLeft = syncNonHostFields;
    // Initial check direkt vid mount så ev. joiners som hunnit INSERT:a
    // innan host:s subscription var aktiv kommer in i listan.
    fetchNewJoiners();
    // Defensiv channel-cleanup (samma som non-host channel:n ovan) —
    // supabase.channel(name) återanvänder existerande topic, så stale
    // subscribed channels från remount måste rensas innan vi addar .on().
    const hostTopic = `realtime:lobby_host:${roomCode}`;
    supabase.getChannels()
      .filter((c) => c.topic === hostTopic)
      .forEach((c) => supabase.removeChannel(c));
    const channel = supabase
      .channel(`lobby_host:${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lobby_players', filter: `room_code=eq.${roomCode}` },
        () => fetchNewJoiners(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lobby_players', filter: `room_code=eq.${roomCode}` },
        () => syncHasLeft(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [hostMode, roomCode]);

  // Non-host: poll:a host:s player-lista var 2:a sekund och rebuild local
  // players[] från storen.
  //
  // Renderingsregler för non-host:
  //   • Bara approved-spelare (eller host) från host:s lista syns. Trash-
  //     borttagna spelare är redan ute ur host:s lista (host filtrerar bort
  //     dem vid radering) → de syns inte heller här.
  //   • Host-rad ALLTID synlig: även om storen är tom (host har inte hunnit
  //     skriva) eller saknar isHost-rad, syntheseras en minimal host-rad
  //     från RoomMeta.hostPlayerName så non-host ser vem de förväntas spela
  //     med direkt vid join, INNAN host:s första write hunnit propagera.
  //     Synthen ersätts av real host-data vid nästa poll så fort store har
  //     fyllts på.
  //   • Self-injection: om non-host:s ownPlayerIdRef inte finns i host:s
  //     approved-lista injectas den lokala self-raden så användaren ser sin
  //     egen status under "To be Approved" tills host approverar.
  //   • hasLeft-overlay: appliceras inline här (inte via useFocusEffect)
  //     eftersom polling överskriver players[] varannan sekund — utan
  //     inline-applicering skulle hasLeft blinka av/på.
  //   • Orphan-left-spelare (lämnade men inte i host:s lista) injectas så
  //     non-host ser samma "LEFT THIS GAME LOBBY"-kort som host.
  useEffect(() => {
    if (hostMode) return;
    let cancelled = false;
    const syncFromStore = async () => {
      // Eject-check FÖRST: om host har trashat den här spelaren visar vi
      // popup och avbryter sync:en (player-listan ska inte uppdateras vidare
      // när användaren ändå snart kastas ut till Home).
      let ownId = ownPlayerIdRef.current;
      if (ownId && isEjected(roomCode, ownId)) {
        if (!cancelled) setPlayerEjectedDetected(true);
        return;
      }
      // Game-started-check (Slice 3C-i): läs både in-memory mockStartedGames
      // (samma-device QA) OCH cross-device från rooms.game_started via meta.
      // Om host startat:
      //  • Approved spelare → navigera till /quiz med turnOrder från lobby_players
      //  • Oapprovaderade  → "Host started game without this user"-popup → Home
      const meta = await getRoomMeta(roomCode);
      if (cancelled) return;
      const remoteGameStarted = !!meta?.gameStarted;
      const localGameStarted = ownId ? isGameStarted(roomCode) : false;
      if (ownId && (remoteGameStarted || localGameStarted)) {
        // Fetch authoritative lobby_settings inline — non-host:s lokala
        // state (gameMode, answerResponseSeconds, etc.) kan vara stale om
        // host ändrade en setting strax innan Start Game och Realtime/
        // polling inte hunnit propagera än. settings här är canonical
        // (samma DB-rad som host skrev till).
        const [playersStored, settingsStored] = await Promise.all([
          getLobbyPlayers(roomCode),
          getLobbySettings(roomCode),
        ]);
        if (cancelled) return;
        // ID-heal (game-started-path): Play Again-race kan ge att ownId
        // (joiner-DATE, approved=false) finns i DB medan carry-over-ID (samma
        // namn, approved=true) också finns. Adoptera carry-over-ID:t INNAN
        // selfApproved-checken nedan så vi inte felaktigt skickar non-host
        // till "started without me"-popup trots att host godkänt dem.
        if (ownId) {
          const ownRowInStored = playersStored?.find((p) => p.id === ownId);
          if (!ownRowInStored?.approved) {
            const selfNameLower = ownRowInStored?.name?.trim().toLowerCase();
            if (selfNameLower) {
              const approvedAlt = playersStored?.find(
                (p) =>
                  !p.isHost &&
                  p.id !== ownId &&
                  p.name.trim().toLowerCase() === selfNameLower &&
                  p.approved,
              );
              if (approvedAlt) {
                ownPlayerIdRef.current = approvedAlt.id;
                ownId = approvedAlt.id;
              }
            }
          }
        }
        // Guard: null = DB-fel, undefined = inga rader ännu (carry-over-skrivningen
        // har inte propagerat eller misslyckades). Båda är tvetydiga — bränn INTE
        // popup:en på oklart underlag, låt nästa poll avgöra.
        // Vanligaste orsak till undefined: migration 0015 (spotify_verified) ej
        // applicerad → setLobbyPlayers UPSERT kraschar tyst i goToNewLobby →
        // inga carry-over-rader i DB → getLobbyPlayers returnerar undefined.
        if (playersStored == null) {
          return;
        }
        // Hittade rader men vår rad saknas — kan vara propagerings-delay.
        // Vi har redan försökt ID-heal ovan; om inget hittats hoppar vi över
        // och låter nästa poll försöka igen.
        const selfRow = playersStored.find((p) => p.id === ownId);
        if (!selfRow) {
          return;
        }
        const selfApproved = !!selfRow.approved;
        if (!selfApproved) {
          if (!cancelled) setStartedWithoutMeDetected(true);
          return;
        }
        // Använd settings från store där det finns; fall tillbaka till
        // local state för fält som inte syncas via lobby_settings än.
        const effectiveGameMode = settingsStored?.gameMode ?? gameMode;
        const effectiveAnswerResponseSeconds =
          settingsStored?.answerResponseSeconds ?? answerResponseSeconds;
        const effectiveEraFrom = settingsStored?.eraFrom ?? eraValues[0];
        const effectiveEraTo = settingsStored?.eraTo ?? eraValues[1];
        const effectiveRoundsCount = settingsStored?.roundsCount ?? roundsCount;
        // Per-source categories — KRITISKT att non-host får samma värden
        // som host så båda enheter bygger identisk gameQuestions-pool.
        const effectiveYtCats =
          settingsStored?.youtubeEnabledCategories ?? youtubeEnabledCategories;
        const effectiveImgCats =
          settingsStored?.imagesEnabledCategories ?? imagesEnabledCategories;
        // Non-host:s väg in i /quiz. Delas av Pass-the-Phone-promptens
        // "Yes" och Individual Devices-fallthrough:en längst ned — båda
        // lägena behöver EXAKT samma params (host:s settings + hela
        // turnOrder), skillnaden är bara att PtP frågar först.
        const goToQuizAsNonHost = () => {
          const turnOrder = (playersStored ?? [])
            .filter((p) => !!p.approved || !!p.isHost)
            .map((p) => ({
              id: p.id,
              name: p.name,
              emoji: p.emoji,
              avatarUri: p.avatarUri,
              assistance: p.assistance ?? 'standard',
              age: p.age,
              spotifyConnected: p.spotifyConnected ?? false,
              type: p.type,
            }));
          // Guest-hostat spel detekteras via host-radens type i lobby_players
          // (guest host seedar sitt kort med type 'guest'; registrerade hosts
          // får alltid 'registered' via mergeProfileIntoHost). Ingen DB-
          // migration behövs — gamla lobbies resolvar false. quiz.tsx döljer
          // Play Again på final leaderboard när flaggan är satt.
          const storedHostIsGuest = (playersStored ?? []).some(
            (p) => p.isHost && p.type === 'guest',
          );
          router.replace({
            pathname: '/quiz',
            params: {
              assistance: 'standard',
              age: '32',
              gameMode: effectiveGameMode,
              guestHost: String(storedHostIsGuest),
              // Non-host-vägen från Realtime-driven game-started-detection.
              // quiz.tsx använder isHost för att rendera Leave Game-knapp
              // istället för Quit Game-knapp i GetReadyIntro/CountdownIntro.
              isHost: 'false',
              // Non-host:s egna player_id — används av Leave-flödet för att
              // broadcasta `player_left` så host:s skärm får popup + markerar
              // spelaren som hasLeft i leaderboarden. I Pass-the-Phone är det
              // dessutom nyckeln som matchar host:s score-broadcasts mot rätt
              // rad i spectator-tabellen.
              selfPlayerId: ownId ?? '',
              players: JSON.stringify(turnOrder),
              roundsCount: String(effectiveRoundsCount),
              answerResponseSeconds: String(effectiveAnswerResponseSeconds),
              eraFrom: String(effectiveEraFrom),
              eraTo: String(effectiveEraTo),
              youtubeEnabledCategories: JSON.stringify(effectiveYtCats),
              imagesEnabledCategories: JSON.stringify(effectiveImgCats),
              // Theme packages aktiva i lobby:n vid speltillfället (non-host
              // path — efter Realtime-detection av game-started). Speglar
              // host-path:en så HistoryEntry får samma data oavsett vilken
              // enhet som triggade navigation till /quiz.
              selectedExtraPackages: JSON.stringify(settingsStored?.selectedExtraPackages ?? []),
              // Spotify DJ-läge måste matchas med host:s värde så non-host
              // behandlar Spotify-frågor korrekt (timer gating, mediaSource).
              spotifyEnabled: String(settingsStored?.spotifyEnabled ?? false),
              roomCode,
            },
          });
        };
        // Approved spelare: nästa steg beror på gameMode.
        // - Pass-the-Phone: alla svarar på HOST:ens telefon, men non-host:s
        //   egen enhet kan följa leaderboarden live (score-broadcasts). Fråga
        //   först — vill spelaren inte titta med går de Home som förut.
        // - Remote 1v1: asynkron duell — motståndaren väljer själv Play now
        //   (solo-quiz direkt) eller Play later (Home → 1vs1 Matches,
        //   48h-fönster).
        // - Individual Devices: alla approved spelare spelar på sin egen
        //   enhet → navigera till /quiz med derived turnOrder.
        if (effectiveGameMode === 'pass-the-phone') {
          // navigatedToQuizRef sätts FÖRE Alerten — 2s-pollen (+ realtime-
          // tick:en) skulle annars stapla en ny popup varannan sekund.
          if (navigatedToQuizRef.current || cancelled) return;
          navigatedToQuizRef.current = true;
          Alert.alert(
            'Host has started the Game',
            'Please use Host device. Do you want to follow the Leaderboard on this device?',
            [
              { text: 'No', style: 'cancel', onPress: () => router.replace('/') },
              { text: 'Yes', onPress: () => goToQuizAsNonHost() },
            ],
            { cancelable: false },
          );
          return;
        }
        if (effectiveGameMode === 'remote-1v1') {
          if (navigatedToQuizRef.current || cancelled) return;
          const match = await getMatchByRoomCode(roomCode);
          // Matchen kan ännu inte ha propagerat (host skapar den precis före
          // game_started-flaggan) — låt nästa 2s-poll försöka igen.
          if (!match || cancelled) return;
          navigatedToQuizRef.current = true;
          // Assistance tas ur MATCH-snapshotten, inte ur lobby_players: i
          // remote gäller hostens gemensamma nivå för båda spelarna, och
          // create_remote_match skrev samma värde på båda raderna. Egen rad
          // först, annars motpartens (identiska), annars lobby-raden som
          // fallback för matcher skapade före den gemensamma nivån infördes.
          const matchAssistance =
            match.players.find((p) => p.userId === ownId)?.assistance ??
            match.players[0]?.assistance ??
            selfRow.assistance ??
            'standard';
          const selfTurnOrder = [{
            id: selfRow.id,
            name: selfRow.name,
            emoji: selfRow.emoji,
            avatarUri: selfRow.avatarUri,
            assistance: matchAssistance,
            age: selfRow.age,
            spotifyConnected: false,
            type: selfRow.type,
          }];
          const goPlayNow = () => {
            router.replace({
              pathname: '/quiz',
              params: {
                assistance: matchAssistance,
                age: selfRow.age != null ? String(selfRow.age) : '32',
                gameMode: 'remote-1v1',
                remoteMatchId: match.id,
                guestHost: 'false',
                isHost: 'false',
                selfPlayerId: ownId ?? '',
                players: JSON.stringify(selfTurnOrder),
                roundsCount: String(match.settings.roundsCount),
                answerResponseSeconds: String(match.settings.answerResponseSeconds),
                eraFrom: String(match.settings.eraFrom),
                eraTo: String(match.settings.eraTo),
                youtubeEnabledCategories: JSON.stringify(match.settings.youtubeEnabledCategories),
                imagesEnabledCategories: JSON.stringify(match.settings.imagesEnabledCategories),
                selectedExtraPackages: JSON.stringify(match.settings.selectedExtraPackages),
                spotifyEnabled: 'false',
                roomCode,
              },
            });
          };
          setRemoteStartPrompt({
            message:
              'Host has started the 1vs1 match. You have 48 hours to play your questions — now or later via "1vs1" on the Home screen.',
            playNow: goPlayNow,
          });
          return;
        }
        if (!navigatedToQuizRef.current && !cancelled) {
          navigatedToQuizRef.current = true;
          goToQuizAsNonHost();
        }
        return;
      }
      const stored = await getLobbyPlayers(roomCode);
      if (cancelled) return;
      // D-vii bugfix: `null` = Supabase-query failade (network-glitch).
      // Skippa hela sync:en så local players-state inte clearas — host
      // skulle annars försvinna från non-host:s vy vid varje connection-
      // hicka. Polling-loopen försöker igen om 2s med fresh connection.
      if (stored === null) return;
      // DB-eject-detection: om self-rad TIDIGARE syntes i stored men nu är
      // borta → host har raderat oss via lobby_players DELETE. Triggar
      // samma popup som in-memory-baserad markEjected. Guard:as på
      // selfEverInStoredRef så vi inte felaktigt fyrar innan vår egen
      // INSERT hunnit propagera till första stored-läsning.
      if (ownId && stored && selfEverInStoredRef.current) {
        const selfStillThere = stored.some((p) => p.id === ownId);
        if (!selfStillThere) {
          if (!cancelled) setPlayerEjectedDetected(true);
          return;
        }
      }
      // Markera när self först syns i stored så framtida frånvaro räknas
      // som faktisk ejection (inte bara att vår INSERT inte hunnit än).
      if (ownId && stored?.some((p) => p.id === ownId)) {
        selfEverInStoredRef.current = true;
      }
      const leftSnapshots = await getLeftPlayers(roomCode);
      if (cancelled) return;
      const leftIds = new Set(leftSnapshots.map((s) => s.id));
      // hasLeft kommer från TVÅ källor: (a) DB:s has_left-kolumn (cross-
      // device Slice 3C-ii) via rowToPlayer-mapping, (b) AsyncStorage-
      // snapshot:s (legacy + offline-fallback). OR:as så cross-device-
      // broadcasts slår igenom även när AsyncStorage inte hunnit synka.
      // Inkludera ALLA spelare (godkända + väntande på godkännande), inte bara
      // approved — annars saknar non-host:ens lokala state väntande spelare och
      // Approved-kapacitetsrutorna kan aldrig blinka för dem (2026-06-01-fix).
      // Väntande spelare renderas read-only i "To be Approved by Host"-listan
      // för non-host (approve-kontrollerna är ändå host-gated).
      let approvedFromHost: LobbyPlayer[] = stored
        ? stored.map((p) => {
            if (p.isHost) return { ...p, hasLeft: false };
            return { ...p, hasLeft: !!p.hasLeft || leftIds.has(p.id) };
          })
        : [];
      // Synthesera host-placeholder från RoomMeta om host saknas i listan
      // (mock-only — non-host joinar via test-seed-kod eller fresh kod där
      // host ännu inte hunnit skriva). Använder en stabil ålder (35) +
      // 'standard' assistance så Assistance · Age · HCP-raden alltid
      // renderas — utan flicker varannan poll (random skulle ge ny ålder
      // varje 2s). Real host-data ersätter raden vid nästa poll efter
      // att host:s write har körts.
      const hasHost = approvedFromHost.some((p) => p.isHost);
      if (!hasHost) {
        const meta = await getRoomMeta(roomCode);
        if (cancelled) return;
        if (meta?.hostPlayerName) {
          const syntheticHost: LobbyPlayer = {
            id: 'synthetic-host',
            name: meta.hostPlayerName,
            emoji: '👑',
            isReady: true,
            type: 'registered',
            age: 35,
            assistance: 'standard',
            hcpComplete: true,
            isHost: true,
            approved: true,
          };
          approvedFromHost = [syntheticHost, ...approvedFromHost];
        }
      }
      setPlayers((prev) => {
        let ownId = ownPlayerIdRef.current;
        // ID-heal: Play Again-race kan ge att ownId (joiner-DATE) antingen
        // saknas helt i approvedFromHost, ELLER finns men med approved=false
        // medan carry-over-ID (samma namn, approved=true) också finns.
        // Adoptera carry-over-id:t i båda fallen så approved-status och
        // game-start-checken hittar rätt rad.
        const ownRowInHost = ownId ? approvedFromHost.find((p) => p.id === ownId) : null;
        const needsHeal =
          ownId && (!ownRowInHost || (!ownRowInHost.isHost && !ownRowInHost.approved));
        if (needsHeal) {
          const selfRow = ownRowInHost ?? prev.find((p) => p.id === ownId);
          if (selfRow) {
            const selfNameLower = selfRow.name.trim().toLowerCase();
            const approvedAlt = approvedFromHost.find(
              (p) =>
                !p.isHost &&
                p.id !== ownId &&
                p.name.trim().toLowerCase() === selfNameLower &&
                p.approved,
            );
            if (approvedAlt) {
              ownPlayerIdRef.current = approvedAlt.id;
              ownId = approvedAlt.id;
            }
          }
        }
        // Name-dedup: Play Again carry-over kan ge två rader med samma namn
        // men olika id i DB (race: host:s Supabase-write hann inte propagera
        // när non-host:s code-only-join körde → ny id insertad bredvid
        // carry-over-raden). Spelarnamn är unika i en lobby → säkert att deduplicera.
        // Prio: behåll raden vars id matchar ownId; annars första förekomsten.
        const nameSeenMap = new Map<string, LobbyPlayer>();
        for (const p of approvedFromHost) {
          const key = p.name.trim().toLowerCase();
          if (!nameSeenMap.has(key)) {
            nameSeenMap.set(key, p);
          } else if (ownId && p.id === ownId) {
            nameSeenMap.set(key, p);
          }
        }
        const deduped: LobbyPlayer[] = [...nameSeenMap.values()];
        const selfInHostList = ownId
          ? deduped.some((p) => p.id === ownId)
          : false;
        let next: LobbyPlayer[] = deduped;
        if (ownId && !selfInHostList) {
          // Hämta senaste self-data från DB-stored (inte prev local state)
          // så approved/age/etc. reflekterar host:s nyligen synkade ändringar.
          // Annars skulle host:s "unapprove" slå igenom på övriga vyer men
          // self-rad fortsätter visa stale approved=true.
          const selfRow = stored?.find((p) => p.id === ownId)
            ?? prev.find((p) => p.id === ownId);
          if (selfRow) {
            // Applicera hasLeft från BÅDA källor (DB has_left + AsyncStorage)
            // även på self-rad så cross-device-broadcast slår igenom.
            const hasLeft = !!selfRow.hasLeft || leftIds.has(selfRow.id);
            // Ta bort eventuell carry-over-rad med samma namn (uppstår när
            // race-condition + self-inject kombineras: carry-over-raden låg
            // i `deduped` men ownId-raden fanns inte → namn-kollidering vid inject).
            const selfNameLower = selfRow.name.trim().toLowerCase();
            next = next.filter((p) => p.name.trim().toLowerCase() !== selfNameLower);
            next = [...next, { ...selfRow, hasLeft }];
          }
        }
        // Orphan-left: snapshot:s som inte längre finns i host:s lista men
        // som har lämnat — visa kortet med hasLeft=true så non-host ser
        // samma history som host.
        const existingIds = new Set(next.map((p) => p.id));
        const orphans: LobbyPlayer[] = leftSnapshots
          .filter((s) => !existingIds.has(s.id))
          .map((s) => ({
            id: s.id,
            name: s.name,
            emoji: s.emoji,
            avatarUri: s.avatarUri,
            isReady: false,
            type: s.type ?? 'guest',
            age: s.age,
            assistance: s.assistance,
            hcpComplete: s.hcpComplete ?? false,
            approved: s.approved,
            hasLeft: true,
          }));
        return [...next, ...orphans];
      });
    };
    void syncFromStore();
    const interval = setInterval(() => { void syncFromStore(); }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hostMode, roomCode, realtimeTick]);

  // När detection-state slår till: visa native Alert med OK-knapp som
  // tar non-host:en till Home. cancelable:false så användaren inte kan
  // tap:a runt om popup:en — de MÅSTE acknowledgea via OK.
  useEffect(() => {
    if (!roomDeletedDetected) return;
    Alert.alert(
      'Game Lobby deleted',
      'This Game Lobby has been deleted by Host.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [roomDeletedDetected]);

  // Player-ejected-popup: när host har trashat just denna spelare. Speglar
  // room-deletion-popupen ovan (cancelable:false + OK→Home) men ramad som
  // info istället för "deleted lobby" eftersom det rör en enskild spelare,
  // inte hela rummet.
  useEffect(() => {
    if (!playerEjectedDetected) return;
    Alert.alert(
      'Removed from lobby',
      'User have been removed from this lobby',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [playerEjectedDetected]);

  // Remote-1vs1-popup: guest-läge hamnade i en 1v1-lobby (Home:s gate är
  // fail-open innan hostens debounced settings-skrivning landat). Samma
  // situation som Home:s 'join'-gate → IDENTISK copy, håll dem i sync.
  // cancelable:false och BÅDA knapparna lämnar lobbyn — spelaren kan inte
  // vara kvar här. CTA:n använder ?openAuth=1-deeplinken som öppnar
  // "Register or Login"-formuläret på Home (profileMenu:ns menu-steg) —
  // INTE ?openRegister=1, som hoppar direkt till registrering; en guest
  // som blockas här kan redan ha ett konto och bara vara utloggad.
  useEffect(() => {
    if (!remoteGuestBlockedDetected) return;
    Alert.alert(
      'Remote 1vs1 Room',
      'This Room Code belongs to a Remote 1vs1 match. Remote duels can only be played between QuizVibe users — register a free account or log in to join.',
      [
        { text: 'OK', onPress: () => router.replace('/') },
        { text: 'Register or Login', onPress: () => router.replace('/?openAuth=join') },
      ],
      { cancelable: false },
    );
  }, [remoteGuestBlockedDetected]);

  // Started-without-me-popup: när host tryckt Start Game utan att approverat
  // den här spelaren. Speglar samma cancelable:false + OK→Home-mönster.
  useEffect(() => {
    if (!startedWithoutMeDetected) return;
    Alert.alert(
      'Game already started',
      'Host started game without this user',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [startedWithoutMeDetected]);

  // Skickar invite in-app till en vän — sparas i mottagarens per-user-
  // namespacade Waiting Invites-inbox (friend.playerName som nyckel).
  // Använder hostens profil-playerName/avatar som "from"-data.
  const handleInviteFriend = async (friend: Friend) => {
    // Remote 1v1-regel: max 4 obesvarade invites per host. Räknas via
    // sender-läs-policyn på waiting_invites (migration 0027 DEL 7 —
    // from_user_id = auth.uid()). Accepterade invites raderas (removeInvite)
    // och faller ur räkningen. Query-fel → fail-open (spam-taket är en
    // mjuk produktregel, inte säkerhetskritiskt — DB-rate-limiten på 50/h
    // ligger kvar som hård gräns).
    if (gameMode === 'remote-1v1' && !singlePlayerDefault) {
      const userId = await getOwnUserId();
      if (userId) {
        const { count, error } = await supabase
          .from('waiting_invites')
          .select('id', { count: 'exact', head: true })
          .eq('from_user_id', userId);
        if (!error && (count ?? 0) >= 4) {
          Alert.alert(
            'Invitation limit reached',
            'You already have 4 unanswered 1vs1 invitations. Wait for an answer or for old invitations to expire before sending more.',
          );
          return;
        }
      }
    }
    const profile = await loadProfile();
    const fromPlayerName = profile?.playerName?.trim() || 'Host';
    await addInvite(friend.playerName, {
      roomCode,
      fromPlayerName,
      fromAvatarId: profile?.selectedAvatarId,
    });
    setInvitedFriendIds((prev) => {
      const next = new Set(prev);
      next.add(friend.id);
      return next;
    });
  };

  const handleStartGame = async (ptpConfirmed = false) => {
    // Pool-preflight FÖRST — settings-issue ska upptäckas innan vi bryr
    // oss om spelar-state (approve/single-player-popups). Om host:s filter-
    // kombo (era + main-categories + source-toggles) ger noll matchande
    // items i båda pools, visa egen separat popup och avbryt. Detta är
    // ortogonalt från player-flödet — egen popup, ingen overlay mot andra
    // start-game-popupar (single player / approve players in lobby).
    //
    // Tidigare bug (2026-05-27): emergency fallback i quiz.tsx returnerade
    // SEED_QUESTIONS (orörda music-items) när båda pools var tomma →
    // bypassade era + category-filter helt → user fick t.ex. Armstrong 1930
    // efter att ha valt Sport-only + 2016-2026. Fångas nu här.
    // Spotify-only single-player guard: Spotify DJ kräver minst en annan
    // spelare (DJ + gissare). Om Spotify är enda aktiva källa och host är
    // ensam (single player eller inga approved non-hosts) är det ej möjligt.
    const approvedNonHostCount = approvedPlayers.filter((p) => !p.isHost && !p.hasLeft).length;

    // Min-2-regel: minst 2 aktiva val i Source Dashboard (YouTube × profession
    // eller Hints × profession). Spotify kan spelas ensamt och räknas separat.
    const activeNonSpotifyCount = [
      youtubeEnabledCategories.includes('Music'),
      youtubeEnabledCategories.includes('Film'),
      youtubeEnabledCategories.includes('Sport'),
      imagesEnabledCategories.includes('Music'),
      imagesEnabledCategories.includes('Film'),
      imagesEnabledCategories.includes('Sport'),
    ].filter(Boolean).length;
    // Undantag från min-2: Spotify eller Artists (Music) ensamt räcker.
    // Min-2 gäller bara om varken Spotify eller Artists är aktiv.
    const artistsActive =
      youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
    if (!spotifyEnabled && !artistsActive && activeNonSpotifyCount < 2) {
      Alert.alert(
        'Too few sources selected',
        'Enable at least 2 source combinations for Actors/Athletes, or also enable Artists or Spotify — those can be played on their own.',
      );
      return;
    }

    if (
      spotifyEnabled &&
      youtubeEnabledCategories.length === 0 &&
      imagesEnabledCategories.length === 0 &&
      (singlePlayerDefault || approvedNonHostCount === 0)
    ) {
      Alert.alert(
        'Spotify DJ not applicable',
        'Spotify DJ mode is not possible for single player. Please approve other players or change source settings.',
      );
      return;
    }

    const eraFrom = eraValues[0];
    const eraTo = eraValues[1];
    const ytCatsAll = youtubeEnabledCategories.length === 3;
    const matchesYtCat = (mc: MainCategory | null) =>
      ytCatsAll ? true : mc !== null && youtubeEnabledCategories.includes(mc);
    const imgCatsAll = imagesEnabledCategories.length === 3;
    const matchesImgCat = (mc: MainCategory | null) =>
      imgCatsAll ? true : mc !== null && imagesEnabledCategories.includes(mc);
    const hasSpotifyHit =
      spotifyEnabled &&
      MUSIC_QUESTIONS.some(
        (q) =>
          !!q.spotifyTrackId &&
          q.correctYear !== undefined &&
          q.correctYear >= eraFrom &&
          q.correctYear <= eraTo,
      );
    const hasMusicHit =
      hasSpotifyHit ||
      (youtubeEnabled &&
        MUSIC_QUESTIONS.some(
          (q) =>
            q.correctYear !== undefined &&
            q.correctYear >= eraFrom &&
            q.correctYear <= eraTo &&
            matchesYtCat(subjectToMainCategory(q.contentSubject)),
        ));
    const hasImageHit = IMAGE_QUIZ_QUESTIONS.some((q) => {
      let inEra = true;
      if (q.peakFrom !== undefined && q.peakTo !== undefined) {
        inEra = eraFrom <= q.peakTo && eraTo >= q.peakFrom;
      } else if (q.correctYear !== undefined) {
        inEra = q.correctYear >= eraFrom && q.correctYear <= eraTo;
      }
      return inEra && matchesImgCat(subjectToMainCategory(q.contentSubject));
    });
    if (!hasMusicHit && !hasImageHit) {
      Alert.alert(
        'No matching quiz',
        'No quiz within selected range of game connections, game era and main category. Please change settings.',
      );
      return;
    }

    // Turordningen för Pass-the-phone bygger på array-ordningen i `players[]`
    // (host alltid på index 0). Filtrera bort spelare som lämnat lobbyn —
    // de kan inte vara på tur. Skicka en minimal player-payload så quiz.tsx
    // kan rendera "Up next: <namn>" och rotera mellan rundor.
    //
    // Single player: BARA host spelar, oavsett vad som råkar ligga approved i
    // listan (Peter 2026-08-24). Sista spärren — approve-vägarna är redan
    // gated, men en rad som blivit approved innan host växlade till single
    // hade annars dragits in i ett "solo"-spel med två spelare.
    const turnOrder = approvedPlayers
      .filter((p) => !p.hasLeft && (!singlePlayerDefault || p.isHost))
      .map((p) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        avatarUri: p.avatarUri,
        // Per-player assistance så quiz.tsx kan applicera rätt svarsruta-
        // intervall (full=5 år, standard=3 år, minimal=1 år) per spelare
        // när det är deras tur. Default 'standard' om saknas.
        assistance: p.assistance ?? 'standard',
        age: p.age,
        spotifyConnected: p.spotifyConnected ?? false,
        // type följer med så goToNewLobby:s carry-over kan återskapa raderna
        // med korrekt guest/registered — host-radens 'guest' är non-host-
        // enheternas detekteringssignal för guest-hostade spel.
        type: p.type,
      }));

    if (turnOrder.length === 0) {
      Alert.alert('Cannot start', 'No approved players to start the game.');
      return;
    }

    // Guard: i multiplayer-läge (PtP eller IndDev = singlePlayerDefault är
    // false) MÅSTE det finnas minst en approved non-host. turnOrder är
    // typiskt {host}-only när inga andra approvats — det är ett giltigt
    // spel-tillstånd bara i single-player-läge. Ge användaren två tydliga
    // val: approva fler spelare (avbryt) eller växla till single-player-
    // läge (då blir host:s solo-start meningsfull).
    const approvedNonHosts = turnOrder.filter(
      (p) => p.id !== (players.find((pp) => pp.isHost)?.id ?? ''),
    );
    // Spotify DJ kräver minst en annan spelare — blockera single player.
    if (spotifyEnabled && (singlePlayerDefault || approvedNonHosts.length === 0)) {
      Alert.alert(
        'Spotify DJ not applicable',
        'Spotify DJ mode requires at least one other player. Please approve other players or disable Spotify DJ in Source Dashboard before starting.',
      );
      return;
    }

    if (!singlePlayerDefault && approvedNonHosts.length === 0) {
      setNoApprovedModalVisible(true);
      return;
    }

    // Guard: Pass-the-Phone-bekräftelse innan host startar spel där alla
    // spelare delar denna enhet. Förhindrar att host:s game-credit dras för
    // ett spel som var tänkt med Individual Devices men där PtP-toggle:n
    // glömts bort. Hoppar guarden i single-player-läge (irrelevant att
    // fråga "är alla här?" när det bara är host) och i IndDev (varje
    // spelare på egen enhet). `ptpConfirmed`-flaggan på rekursivt
    // handleStartGame(true)-anrop hoppar guarden så Yes-grenen inte
    // re-triggar samma popup.
    if (
      gameMode === 'pass-the-phone' &&
      !singlePlayerDefault &&
      approvedNonHosts.length > 0 &&
      !ptpConfirmed
    ) {
      Alert.alert(
        'Pass-the-Phone mode',
        'Are all players in the same room so you can share this device?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => handleStartGame(true) },
        ],
      );
      return;
    }

    // D-vii: blockera start om någon approved non-host har röd peer-
    // health. Pass-the-Phone delar device → ingen peer-health-koncept
    // där, gateas bort. Host:s egen status är aldrig 'unstable' i
    // map:en (self exkluderas från useLobbyPeerHealth-returvärdet).
    if (gameMode === 'individual-devices') {
      // IndDev: host-tillagda guests saknar egen enhet och kan inte spela.
      // Självanslutna guests är OK (egen enhet, policy 2026-08-06). Defensiv
      // guard ifall en host-tillagd guest överlevt mode-bytet.
      const guestPlayer = approvedPlayers.find(
        (p) => !p.isHost && !p.hasLeft && p.addedByHost,
      );
      if (guestPlayer) {
        Alert.alert(
          'Own device required',
          `${guestPlayer.name} was added by the Host and has no device of their own. Remove them or switch game mode before starting an Individual device game.`,
        );
        return;
      }
      const unstablePlayer = approvedPlayers.find(
        (p) => !p.isHost && !p.hasLeft && lobbyPeerHealth[p.id] === 'unstable',
      );
      if (unstablePlayer) {
        Alert.alert(
          'Connection unstable',
          `${unstablePlayer.name} has an unstable connection. Wait for it to stabilize, or remove them from the lobby before starting.`,
        );
        return;
      }
    }

    // Remote 1v1-guards: exakt 1 approved motståndare krävs, motståndaren
    // måste ha egen enhet (user_id i lobby_players — self-joined spelare har
    // alltid det via upsertOwnLobbyPlayer; host-tillagda guests har null).
    // user_id:t behövs för remote_match_players-raden (server-side identitet
    // som överlever rummets 24h-expiry).
    let remoteOpponent: LobbyPlayer | null = null;
    let remoteOpponentUserId: string | null = null;
    if (gameMode === 'remote-1v1' && !singlePlayerDefault) {
      // Sista linjen före matchraden skrivs: Remote 1vs1 spelas ENBART av
      // QuizVibe-users mot varandra (2026-08-08). Guest-läge ska aldrig nå
      // hit — Home-gaten + lobby-backstoppen fångar det — men detta är den
      // enda punkten där en felaktig match faktiskt skulle persisteras.
      if (isGuestHost) {
        Alert.alert(
          'QuizVibe account required',
          'Remote 1vs1 matches can only be played between QuizVibe users. Register or sign in to host a 1vs1 match.',
        );
        return;
      }
      const activeApprovedNonHosts = approvedPlayers.filter((p) => !p.isHost && !p.hasLeft);
      if (activeApprovedNonHosts.length !== 1) {
        Alert.alert(
          'Remote 1vs1 requires exactly 1 opponent',
          activeApprovedNonHosts.length === 0
            ? 'Invite and approve one opponent before starting the match.'
            : 'Remove players until exactly one approved opponent remains.',
        );
        return;
      }
      remoteOpponent = activeApprovedNonHosts[0];
      if (remoteOpponent.addedByHost) {
        Alert.alert(
          'Own device required',
          `${remoteOpponent.name} was added by the Host and has no device of their own. Remote 1vs1 opponents must join with their own device.`,
        );
        return;
      }
      // Motståndar-sidan av users-only-regeln: `type === 'guest'` betyder
      // att de gick in via guest-formen, oavsett om enheten har ett konto.
      if (remoteOpponent.type === 'guest') {
        Alert.alert(
          'QuizVibe account required',
          `${remoteOpponent.name} joined as a Guest. Remote 1vs1 matches can only be played between QuizVibe users.`,
        );
        return;
      }
      const { data: oppRow, error: oppErr } = await supabase
        .from('lobby_players')
        .select('user_id')
        .eq('room_code', roomCode)
        .eq('player_id', remoteOpponent.id)
        .maybeSingle();
      remoteOpponentUserId = (oppRow?.user_id as string | null) ?? null;
      if (oppErr || !remoteOpponentUserId) {
        Alert.alert(
          'Cannot start match',
          `${remoteOpponent.name}'s device session could not be verified. Ask them to re-join with the room code, then try again.`,
        );
        return;
      }
    }

    // Spotify DJ-guard: om läget är aktiverat måste host ha self-attestat
    // Spotify-appen (Plan B — ingen kontokoppling, inget Premium-krav).
    if (spotifyEnabled && !spotifyConnected) {
      Alert.alert(
        'Spotify not confirmed',
        'Confirm that you have the Spotify app on this device before starting a Spotify DJ game.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'I have Spotify', onPress: handleConnectSpotify },
        ],
      );
      return;
    }

    // Pre-flight: host ÄR attesterad, men stämmer attesten fortfarande?
    // Täcker fallen som join-verifieringen missar — Spotify avinstallerat
    // efter att lobbyn öppnades, eller attest satt via "Turn on anyway".
    // Host är alltid en av DJ:arna (rotationen börjar på turnOrder[0]), så
    // en felaktig attest här kostar hela lobbyn 240s tyst väntan + 60s
    // nedräkning + auto-skip på hostens DJ-runda.
    //
    // MÅSTE ligga före credit-blocket nedan — per regeln att alla guards
    // körs före credit-deduktionen så en avbruten start aldrig kostar en credit.
    if (spotifyEnabled && spotifyConnected) {
      if ((await checkSpotifyInstalled()) === 'not-found') {
        const proceed = await confirmAsync(
          'Spotify not found on this device',
          "You've confirmed Spotify, but we can't find the app on this device. As host you'll be one of the DJs — without Spotify your DJ round will be skipped.",
          'Start anyway',
        );
        if (!proceed) return;
      }
    }

    // Re-match: hela uppsättningen från förra spelet måste vara tillbaka.
    // Ligger FÖRE credit-blocket — en avbruten start får aldrig kosta en
    // credit (samma regel som Spotify-attest-guarden ovan).
    //
    // Saknas listan (rums-raden skrevs utan 0037-fälten) är detta en no-op;
    // låsningen i UI:t gäller ändå. Host har alltid "Delete this Game Lobby"
    // som utväg om någon aldrig kommer tillbaka.
    if (isRematchLobby) {
      const missing = findMissingRematchPlayers(rematchExpectedIds, players);
      if (missing.length > 0) {
        Alert.alert(
          'Waiting for players',
          `${describeMissingPlayers(missing)} from the previous game hasn't re-joined yet. A re-match keeps the exact same line-up, so everyone has to be back before it can start.`,
        );
        return;
      }
    }

    // Konsumera 1 Free Host Game-credit per påbörjat spel (2 gratis/dag,
    // top-up vid midnatt CET). Blockerar start om Free är 0 och host saknar
    // Premium (visar Store-redirect-Alert mot subscription). Engångsköpta
    // Extras-credits togs bort 2026-07-07 — Premium-abonnemang är enda
    // vägen förbi dags-cappen. Persisterar tillbaka via saveProfile så
    // Profile-pillen + nästa lobby-session ser den uppdaterade siffran.
    // Spread:ar in tidigare profil-fields (...profile) så vi inte stripper
    // andra sparade settings.
    // Guest host: HELA blocket skippas — ingen profil krävs ("Sign in
    // required" vore fel), inga credits förbrukas. Begränsningen ligger i
    // de låsta lobby-inställningarna + max 1 Play Again-replay.
    if (!isGuestHost) {
      const profile = await loadProfile();
      if (!profile) {
        Alert.alert('Sign in required', 'Log in or register before starting a game.');
        return;
      }
      const free = profile.freeGameCredits ?? 0;
      // Membership = obegränsade host-spel; ingen gate, ingen deduktion.
      // Free lämnas helt orört så pillen behåller sitt värde om membership
      // skulle gå ut senare och dags-cappen återuppstår.
      if (!hasPremium) {
        if (free === 0) {
          Alert.alert(
            'Out of Host Game Credits',
            'You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium for unlimited host games.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
            ],
          );
          return;
        }
        const nextFree = free - 1;
        try {
          await saveProfile({ ...profile, freeGameCredits: nextFree });
          // Lokal state-sync så pillen i lobby-headern uppdateras direkt
          // (annars hade den gamla siffran legat kvar tills nästa fokus-load).
          setFreeGameCredits(nextFree);
        } catch {
          // Tyst — låt spelet börja även om persist-write skulle failla. Nästa
          // load reflekterar då fortfarande gamla värdet, vilket är säkrare än
          // att blockera spelstart helt på en AsyncStorage-glitch.
        }
      }
    }

    // Säkerställ att DB:n har approved-state INNAN game_started sätts.
    // Race: host:s useEffect([players]) kallar setLobbyPlayers fire-and-
    // forget. Om host godkände en spelare och direkt tryckte Start Game kan
    // UPSERT:en (approved=true) ligga in-flight när markRoomGameStarted
    // committar. Non-host:s syncFromStore detectar då game_started=true +
    // läser approved=false → "started without me"-popup trots att host
    // faktiskt approvade spelaren. Explicit await här garanterar att
    // approved:true är i DB innan game_started=true sätts.
    await setLobbyPlayers(roomCode, players);

    // Remote 1v1: skapa den server-side matchen (remote_matches + 2 spelar-
    // rader) INNAN game_started broadcastas — motståndarens enhet slår upp
    // matchen via room_code när starten detekteras. Frågesekvensen skrivs
    // separat av host:s quiz-mount (set_remote_match_questions).
    let remoteMatchId: string | null = null;
    if (gameMode === 'remote-1v1' && !singlePlayerDefault && remoteOpponent && remoteOpponentUserId) {
      const hostRow = players.find((p) => p.isHost);
      const hostIsAnonymous = await isAnonymousSession();
      const hostUserId = await getOwnUserId();
      if (!hostUserId) {
        Alert.alert('Cannot start match', 'No active session. Check your connection and try again.');
        return;
      }
      remoteMatchId = await createRemoteMatch(
        roomCode,
        {
          roundsCount,
          answerResponseSeconds,
          eraFrom: eraValues[0],
          eraTo: eraValues[1],
          youtubeEnabledCategories,
          imagesEnabledCategories,
          selectedExtraPackages,
        },
        // playerType är enbart en FALLBACK för databaser där migration
        // 0029 ännu inte körts — därifrån härleder servern själv både
        // player_type och account_player_name (Guest alias) ur
        // profiles-raden och ignorerar det vi skickar.
        //
        // Host-raden får INTE använda isGuestHost: den säger bara HUR
        // spelaren gick in i lobbyn. En registrerad user som hostar som
        // Guest HAR ett konto och måste skrivas som 'registered', annars
        // raderar guest-retention-cron:en deras avgjorda match efter 24h.
        // Motståndarens auth-status går inte att se klient-side — där är
        // LobbyPlayer.type bästa gissningen tills 0029 är applicerad.
        //
        // assistance: med "Mutual assistance level" PÅ får BÅDA raderna
        // hostens gemensamma `remoteAssistance`; är switchen av behåller
        // varje spelare sin egen nivå. Match-snapshotten är sanningen under
        // spel — quiz-params härleds ur den både via buildRemoteQuizParams
        // (1vs1 Matches / kod-återinträde) och via lobbyns game-started-
        // detektering — så det som skrivs här är det som faktiskt gäller.
        [
          {
            userId: hostUserId,
            playerName: hostRow?.name ?? 'Host',
            isHost: true,
            playerType: hostIsAnonymous ? 'guest' : 'registered',
            assistance: mutualAssistanceEnabled
              ? remoteAssistance
              : hostRow?.assistance ?? 'standard',
            age: hostRow?.age ?? null,
          },
          {
            userId: remoteOpponentUserId,
            playerName: remoteOpponent.name,
            isHost: false,
            playerType: remoteOpponent.type === 'registered' ? 'registered' : 'guest',
            assistance: mutualAssistanceEnabled
              ? remoteAssistance
              : remoteOpponent.assistance ?? 'standard',
            age: remoteOpponent.age ?? null,
          },
        ],
      );
      if (!remoteMatchId) {
        // Best-effort credit-återbetalning — matchen kunde inte skapas så
        // spelet startar inte; hostens dragna credit ska inte gå förlorad.
        if (!isGuestHost && !hasPremium) {
          try {
            const p2 = await loadProfile();
            if (p2) {
              const restored = (p2.freeGameCredits ?? 0) + 1;
              await saveProfile({ ...p2, freeGameCredits: restored });
              setFreeGameCredits(restored);
            }
          } catch { /* tyst — pillen självkorrigerar vid nästa load */ }
        }
        Alert.alert('Cannot start match', 'The 1vs1 match could not be created. Check your connection and try again.');
        return;
      }
    }

    // Cross-player seen-historik: läs alla deltagares publicerade 20-spels-
    // historik ur lobby_players och lämna union:en till quiz.tsx via
    // in-memory-store (host-enheten bygger den auktoritativa fråge-poolen).
    // Primär väg för Pass-the-Phone (ingen quiz_sync-channel där);
    // belt-and-suspenders i IndDev där player_seen_questions-broadcasten är
    // fast-path. null (query-fel/migration saknas/inget publicerat) → skip —
    // host:s egen lokala historik gäller ändå i quiz.tsx.
    const peerSeen = await getLobbySeenQuestionIds(roomCode);
    if (peerSeen) setPendingPeerSeenIds(roomCode, peerSeen);

    // Markera rumkoden som "game-started" — non-host:s Realtime-subscription
    // (rooms-tabellen nu i publikationen via migration 0020) + 2s-polling
    // detekterar detta. Måste komma EFTER setLobbyPlayers ovan så approved-
    // state är committed när syncFromStore läser det.
    markGameStarted(roomCode);
    // Server-side flagga: rooms.game_started=true så isActiveRoom returnerar
    // false för nya joiners (rummet är inte längre joinbart). Fire-and-forget
    // — UI:t väntar inte på roundtrip efter att vi redan explict awaitat
    // setLobbyPlayers ovan.
    markRoomGameStarted(roomCode).catch(() => { /* loggas i mockActiveRooms */ });
    // Rensa pending invites för det här rummet — host startar spelet, så
    // alla mottagare som ännu inte accepterat ska INTE längre se inviten
    // som ett valbart alternativ på Home. Game-start raderar inte rooms-
    // raden så ON DELETE CASCADE fyrar inte — explicit cleanup behövs.
    // Realtime DELETE-events propageras till mottagarnas JoinModal-sub:ar.
    clearWaitingInvitesForRoom(roomCode).catch(() => { /* loggas i waitingInvites */ });

    // Navigations-payloaden byggs först — i remote-läget visas en popup
    // ("Play now" / "Play later") innan den används, precis som motståndaren
    // får när starten detekteras.
    const quizNav = {
      pathname: '/quiz' as const,
      params: {
        // Guest host: fallback-assistance/age speglar guest-identiteten
        // (host-kortets valda nivå + ålder från guestBirthYear) istället för
        // de generiska 'standard'/'32'. turnOrder-hostens kort bär samma
        // värden. Nivån var låst till Full t.o.m. 2026-08-08 — sedan dess
        // väljer guest host fritt via player-edit-sheeten.
        // Remote 1v1 med Mutual assistance på: hostens gemensamma nivå vinner
        // — samma värde som skrevs till båda remote_match_players-raderna.
        assistance:
          remoteMatchId && mutualAssistanceEnabled
            ? remoteAssistance
            : isGuestHost
              ? turnOrder.find((p) => p.id === '1')?.assistance ?? 'full'
              : 'standard',
        age: isGuestHost && guestBirthYear
          ? String(CURRENT_YEAR - parseInt(guestBirthYear, 10))
          : '32',
        gameMode,
        // Guest-hostat spel — quiz.tsx döljer Play Again på final
        // leaderboard + skippar Player history-skrivningen.
        guestHost: String(isGuestHost),
        // Guest-identitet + replay-räknare vidare till quiz så guest-hostens
        // Play Again (goToNewLobby) kan återskapa lobbyn utan profil och
        // Final Leaderboard kan dölja Play Again efter max 1 replay.
        ...(isGuestHost
          ? {
              guestName: guestName ?? '',
              guestBirthYear: guestBirthYear ?? '',
              guestReplays: guestReplays ?? '0',
            }
          : {}),
        // Host-vägen från Start Game-tap. quiz.tsx använder detta för att
        // rendera Quit Game-knapp (river hela rummet) istället för Leave
        // Game-knapp (bara non-host:s egen utväg).
        isHost: 'true',
        // Host:s egna player_id — speglar non-host-paths selfPlayerId.
        // Inte använt för broadcast (host kan inte Leave Game, bara Quit)
        // men inkluderat för symmetri så framtida features kan referensa
        // ownId utan att behöva ändra Lobby:n.
        selfPlayerId: ownPlayerIdRef.current ?? turnOrder[0]?.id ?? '',
        // Remote 1v1: host spelar SOLO på sin enhet — turnOrder innehåller
        // bara host:s egen rad (motståndaren spelar sin egen session senare).
        // remoteMatchId driver sekvens-persistens + answer-skrivningar i quiz.
        //
        // OBS: quiz.tsx läser assistance PRIMÄRT ur turnOrder-raden
        // (`turnOrder[currentPlayerIndex]?.assistance`) och bara sekundärt ur
        // `params.assistance` — så med Mutual assistance på måste den
        // gemensamma nivån sättas HÄR, annars kör host vidare på sin
        // personliga profilnivå.
        players: JSON.stringify(
          remoteMatchId && remoteOpponent
            ? turnOrder
                .filter((t) => t.id !== remoteOpponent.id)
                .map((t) =>
                  mutualAssistanceEnabled ? { ...t, assistance: remoteAssistance } : t,
                )
            : turnOrder,
        ),
        ...(remoteMatchId ? { remoteMatchId } : {}),
        roundsCount: String(roundsCount),
        // Tidsgränsen per fråga från host:s profil (default 30 sek). Quiz
        // använder den för timer-bar:en + reveal-trigger.
        answerResponseSeconds: String(answerResponseSeconds),
        // Game era — passa RAW eraValues (samma värde som lobbySettings-
        // store håller och som non-host:s navigation läser via
        // settingsStored). Critical för IndDev: båda enheter MÅSTE bygga
        // identiskt gameQuestions-pool (samma `inEra`-filter).
        // checkEraAgainstPlayer ger bara en informativ warning idag
        // (ingen auto-clamp av display) — så host:s exakta val är det
        // som går till fråge-poolen. Re-introduce clamping vid behov
        // genom att skriva clamped till lobbySettings.
        eraFrom: String(eraValues[0]),
        eraTo: String(eraValues[1]),
        // Per-source category-filter. quiz.tsx filtrerar YouTube-pool mot
        // youtubeEnabledCategories och image-pool mot imagesEnabledCategories.
        youtubeEnabledCategories: JSON.stringify(youtubeEnabledCategories),
        imagesEnabledCategories: JSON.stringify(imagesEnabledCategories),
        // Theme packages aktiva i lobby:n vid speltillfället. JSON-stringifierad
        // array av paket-IDs (tom array = Generic). quiz.tsx läser detta för
        // att frysa in i HistoryEntry så Player history visar vilket paket
        // spelet kördes med.
        selectedExtraPackages: JSON.stringify(selectedExtraPackages),
        // Spotify DJ-läge — activeras om host slagit på toggeln i Game Connections
        // OCH host har self-attestat Spotify-appen (Plan B — ingen kontokoppling).
        // quiz.tsx beräknar DJ-rotationsplanen från turnOrder + totalRounds +
        // frågor med spotifyTrackId.
        spotifyEnabled: String(spotifyEnabled && spotifyConnected),
        spotifyAnswerYear: String(spotifyAnswerYear),
        spotifyAnswerName: String(spotifyAnswerName),
        // Skickas så Quit Game-flödet i quiz.tsx kan deactivera rummet
        // och rensa leftPlayers när host avslutar mitt i ett spel.
        roomCode,
      },
    };

    // Remote 1v1: host spelar sin session self-paced inom 48h, precis som
    // motståndaren — samma popup som non-host får när starten detekteras.
    if (remoteMatchId) {
      setRemoteStartPrompt({
        message:
          'The 1vs1 match has been created. You have 48 hours to play your questions — now or later via "1vs1" on the Home screen.',
        playNow: () => router.push(quizNav),
      });
      return;
    }

    router.push(quizNav);
  };

  // ── Game Sequence förhandsvisning ──────────────────────────────────────────
  // Speglar quiz.tsx:s 3-pool-block-logik (Spotify → YouTube → Image) och
  // härleder medie-källa + kategori per rund baserat på aktuella lobby-inställningar.
  type GsSlot = { source: 'spotify' | 'youtube' | 'image' | 'none'; category: MainCategory | null };
  const gameSequencePreview = useMemo<GsSlot[]>(() => {
    const ytFiltered = MUSIC_QUESTIONS.filter(q => {
      if (q.contentSubject === 'song') return youtubeEnabledCategories.includes('Music');
      if (q.contentSubject === 'movie') return youtubeEnabledCategories.includes('Film');
      if (q.contentSubject === 'sport-event') return youtubeEnabledCategories.includes('Sport');
      return false;
    });
    const imgFiltered = IMAGE_QUIZ_QUESTIONS.filter(q => {
      const s = q.contentSubject;
      if (s === 'artist' || s === 'band') return imagesEnabledCategories.includes('Music');
      if (s === 'actor' || s === 'character') return imagesEnabledCategories.includes('Film');
      if (s === 'athlete') return imagesEnabledCategories.includes('Sport');
      return false;
    });
    // Spotify bara i IndDev — PtP och Single Player kör utan Spotify DJ.
    const spotifyActive = spotifyEnabled && gameMode === 'individual-devices' && !singlePlayerDefault;
    const spotifyPool = spotifyActive ? MUSIC_QUESTIONS.filter(q => q.spotifyTrackId) : [];
    // Ren YT-pool: ytFiltered (respekterar youtubeEnabledCategories) minus Spotify-items.
    const pureYtPool = spotifyActive ? ytFiltered.filter(q => !q.spotifyTrackId) : ytFiltered;
    const imagePool = imgFiltered;
    const hasSpotify = spotifyPool.length > 0;
    const hasPureYt = pureYtPool.length > 0;
    const hasImage = imagePool.length > 0;

    // Sekventiell fasordning: Spotify → YouTube → Hints/Image
    // Ratio med Spotify (IndDev):  25% Spotify / 25% YouTube / 50% Hints.
    // Ratio utan Spotify (PtP/SP): 50% YouTube / 50% Hints — Spotify-blocken
    // absorberas av YouTube om YT är aktiverat, annars av Hints.
    // Fallback: saknas Hints omdirigeras dess block till Spotify → YouTube.
    let spotifyCount = hasSpotify ? Math.floor(roundsCount / 4) : 0;
    // YouTube: 25% om Spotify aktiv, 50% om Spotify saknas.
    const ytDivisor = hasSpotify ? 4 : 2;
    let ytCount = hasPureYt ? Math.floor(roundsCount / ytDivisor) : 0;
    let imageCount = roundsCount - spotifyCount - ytCount;

    if (!hasImage && imageCount > 0) {
      if (hasSpotify) spotifyCount += imageCount;
      else if (hasPureYt) ytCount += imageCount;
      imageCount = 0;
    }

    const slots: GsSlot[] = [];

    // Fas 1: Spotify-slots
    for (let b = 0; b < spotifyCount; b++) {
      if (spotifyPool.length === 0) { slots.push({ source: 'none', category: null }); continue; }
      const item = spotifyPool[b % spotifyPool.length];
      slots.push({ source: 'spotify', category: subjectToMainCategory(item?.contentSubject) });
    }

    // Fas 2: YouTube-slots med jämn rotation per aktiverad kategori.
    // Inom varje block gäller en kategori (Music → Film → Sport → Music …).
    if (ytCount > 0) {
      type YtCatEntry = { cat: MainCategory; items: typeof pureYtPool };
      const subjectForCat: Record<MainCategory, string[]> = {
        Music: ['song'],
        Film: ['movie'],
        Sport: ['sport-event'],
      };
      const ytCatEntries: YtCatEntry[] = (youtubeEnabledCategories as MainCategory[])
        .map((cat) => ({
          cat,
          items: pureYtPool.filter((q) => subjectForCat[cat]?.includes(q.contentSubject ?? '')),
        }))
        .filter((e) => e.items.length > 0);

      if (ytCatEntries.length > 0) {
        const base = Math.floor(ytCount / ytCatEntries.length);
        const remainder = ytCount % ytCatEntries.length;
        ytCatEntries.forEach(({ cat }, catIdx) => {
          const blocksForCat = base + (catIdx < remainder ? 1 : 0);
          for (let b = 0; b < blocksForCat; b++) {
            slots.push({ source: 'youtube', category: cat });
          }
        });
      }
    }

    // Fas 3: Hints/Image-slots — alla block per kategori samlade (Music → Film → Sport).
    if (imageCount > 0 && imagePool.length > 0) {
      const imgSubjectForCat: Record<MainCategory, string[]> = {
        Music: ['artist', 'band'],
        Film: ['actor', 'character'],
        Sport: ['athlete'],
      };
      const imgCatEntries = (imagesEnabledCategories as MainCategory[])
        .map((cat) => ({
          cat,
          items: imagePool.filter((q) => imgSubjectForCat[cat]?.includes(q.contentSubject ?? '')),
        }))
        .filter((e) => e.items.length > 0);

      if (imgCatEntries.length > 0) {
        const base = Math.floor(imageCount / imgCatEntries.length);
        const remainder = imageCount % imgCatEntries.length;
        imgCatEntries.forEach(({ cat }, catIdx) => {
          const blocksForCat = base + (catIdx < remainder ? 1 : 0);
          for (let b = 0; b < blocksForCat; b++) {
            slots.push({ source: 'image', category: cat });
          }
        });
      } else {
        for (let b = 0; b < imageCount; b++) {
          slots.push({ source: 'image', category: subjectToMainCategory(imagePool[b % imagePool.length]?.contentSubject) });
        }
      }
    }

    return slots;
  }, [roundsCount, youtubeEnabledCategories, imagesEnabledCategories, spotifyEnabled, gameMode, singlePlayerDefault]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Morse-ambient-ljud — tystas när skärmen tappar fokus (Stack-
          navigation till t.ex. Quiz), annars fortsätter WebView:n spela trots
          att LobbyScreen ligger kvar monterad i stacken.
          ⚠ Elementet AVMONTERAS INTE vid blur — `active={screenFocused}`
          tonar ut ljudet i stället. Att riva WebView:n mitt i en ringande ton
          gav ett hörbart klick när host tryckte Start Game (Peter 2026-08-26);
          se ⚠-noten i MorseAmbientSound.tsx. */}
      {hostMode && showAmbient && <MorseAmbientSound active={screenFocused} />}
      {/* Top board (login status) — sticky utanför ScrollView så den följer
          med när användaren scrollar i lobbyn. Tap-beteendet är roll-
          beroende:
          • Host: öppnar Delete-this-Game-Lobby-sheet:n (host:s motsvarighet
            till non-host:s leave-flow). Profile-hantering sker via Profile-
            tabben i bottom nav.
          • Non-host (både guest och registrerade): öppnar Leave Game Lobby-
            sheet:n så de kan ta sig ur rummet utan att lämna appen. */}
      <TopUserBanner
        guestName={isGuestInRoom || isGuestHost ? guestName : undefined}
        // Guest host: forcera controlled mode med profile=null — annars
        // self-loadar bannern en ev. inloggad users profil och visar deras
        // registrerade pill istället för guest-identiteten.
        profile={isGuestHost ? null : undefined}
        onPress={
          hostMode
            ? () => setHostDeleteSheetVisible(true)
            : () => setGuestLeaveSheetVisible(true)
        }
      />
      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={handleScrollHintScroll}
        onLayout={(e) => { scrollViewportH.current = e.nativeEvent.layout.height; recomputeScrollHint(); }}
        onContentSizeChange={(_w, h) => { scrollContentH.current = h; recomputeScrollHint(); }}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Game Lobby</Text>
          {/* Host Game Credits-pill — host-only. Speglar Profile:s motsvarande
              pill exakt (samma styling, samma värden via loadProfile-source).
              Tap navigerar till Store. Värdena uppdateras vid varje fokus
              på Lobby så de följer Profile:s state utan delay. Renderas inte
              för non-host (de är inte host i detta spel → credits irrelevanta)
              eller guest host (credits förbrukas aldrig → pill irrelevant). */}
          {hostMode && !isGuestHost && (
            <Pressable
              style={({ pressed }) => [
                styles.creditsPill,
                hasPremium && styles.creditsPillMembership,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleCreditsPillPress}
            >
              {/* Badgen renderas ALLTID — guld när prenumerationen är aktiv,
                  grå när den inte är det (samma lås-signal som Max 12-rutan
                  och Rounds-rulern). Tidigare doldes den helt utan Premium,
                  vilket gjorde att pillen inte antydde att det fanns något
                  att låsa upp. */}
              <View style={styles.creditsMembershipBadgeWrap} pointerEvents="none">
                <View style={[styles.creditsMembershipBadge, !hasPremium && styles.creditsMembershipBadgeGrey]}>
                  <Text style={[styles.creditsMembershipBadgeText, !hasPremium && styles.creditsMembershipBadgeTextGrey]}>PREMIUM</Text>
                </View>
              </View>
              {/* 2 rader tillåtna: labeln wrappar ("HOST GAME / CREDITS")
                  i stället för att kapas till "HOST GAME CRE…" när pillen
                  är trång — t.ex. vid Display Zoom eller stor Dynamic Type. */}
              <Text style={styles.creditsLabel} numberOfLines={2} ellipsizeMode="tail">Host Game Credits</Text>
              {/* Extras-rutan borttagen 2026-07-07 — engångsköpta credits finns
                  inte längre (V1 säljer enbart Premium-abonnemang). Pillen
                  visar Free-saldot för gratis-hosts; Premium-hosts drar aldrig
                  credits (handleStartGame skippar deduktionen) så saldot är
                  irrelevant för dem — de får "Unlimited" i guld i stället. */}
              <View style={styles.creditsValueRow}>
                {hasPremium ? (
                  <Text style={[styles.creditsValue, styles.creditsValueUnlimited]}>Unlimited</Text>
                ) : (
                  <>
                    <Text style={styles.creditsKey}>Free:</Text>
                    <Text style={[styles.creditsValue, styles.creditsValueFree]}>{freeGameCredits}</Text>
                  </>
                )}
              </View>
            </Pressable>
          )}
          {/* Non-host: "Music. Film. Sport."-tagline på samma rad som "Game
              Lobby", uppe i högra hörnet (host saknar credits-pill där så
              utrymmet är fritt). Host visar den ovanför room code-kortet. */}
          {!hostMode && (
            <Text style={styles.headerTagline} numberOfLines={1}>
              Music. Film. Sport.
            </Text>
          )}
        </View>

        {/* Brand-tagline (glowing gold, opacity-pulse) — host visar den OVANFÖR
            room code-kortet; non-host visar den i headern (se ovan). */}
        {hostMode && (
          <Text style={styles.roomTagline}>
            Music. Film. Sport.
          </Text>
        )}

        <Card style={styles.roomCard} padding={Spacing.xl}>
          {/* Loggan är absolut-positionerad i Card:ens övre vänstra hörn med
              en liten inset från kantlinjen. Card är default position:
              relative i RN så absolute children pinnas mot Card:s padding-
              edge. */}
          <View style={styles.roomCodeLogoWrap}>
            <QuizVibeLogo size={ROOM_LOGO_SIZE} />
          </View>
          {/* För guest renderas labeln absolut i Card:s övre del med
              vertikal mitt direkt på loggans visuella mitt — ger ett
              "label-genom-loggan"-uttryck som inte kan rubbas av flex-
              layout-quirks. textAlign center + left/right: 0 håller
              labeln horisontellt centrerad i kortet. "You are invited"
              läggs till ovanför som kontext-rad — gäller alla non-hosts
              (både code-only joiners och guests anslutit via JoinModal). */}
          {!hostMode && (
            <>
              <View style={styles.guestInvitedBadgeWrap}>
                <View style={styles.guestInvitedBadge}>
                  <Text style={styles.guestInvitedBadgeText}>You are invited</Text>
                </View>
              </View>
              <Text style={styles.roomLabelGuestAbsolute}>Room Code</Text>
            </>
          )}
          {/* Host-badge med tre cross-fadande fraser:
              "You are the host" (blå) → "Invite friends" (guld) → lägesberoende
              tredje fras (guld): "1vs1 challenge" i remote-lobbyn, annars
              "Single or multiplayer game". */}
          {hostMode && (
            <View style={[styles.hostBadge, { position: 'relative' }]}>
              {/* Index 0 — "You are the host" (blå, starts visible) */}
              <Animated.View style={[styles.hostBadgeInner, { opacity: hostBadgeOp0 }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d="M5 16L3 6l5 4 4-6 4 6 5-4-2 10H5zm0 2h14v2H5v-2z" fill={Colors.primary} />
                </Svg>
                <Text style={styles.hostBadgeText}>You are the host</Text>
              </Animated.View>
              {/* Index 1 — "Invite friends" (guld, overlay) */}
              <Animated.View style={[styles.hostBadgeInner, styles.hostBadgeOverlay, { opacity: hostBadgeOp1 }]}>
                <Text style={styles.hostBadgeTextGold}>Invite friends</Text>
              </Animated.View>
              {/* Index 2 (guld, overlay) — lägesberoende text: 1vs1-lobbyn
                  visar "1vs1 challenge", övriga "Single or multiplayer game". */}
              <Animated.View style={[styles.hostBadgeInner, styles.hostBadgeOverlay, { opacity: hostBadgeOp2 }]}>
                <Text style={styles.hostBadgeTextGold}>
                  {gameMode === 'remote-1v1' ? '1vs1 challenge' : 'Single or multiplayer game'}
                </Text>
              </Animated.View>
            </View>
          )}
          <View style={[styles.roomCodeRow, !hostMode && styles.roomCodeRowGuestSpacing, hostMode && styles.roomCodeRowHostSpacing]}>
            <View style={styles.roomCodeStack}>
              {hostMode && (
                <Text style={styles.roomLabel}>Room Code</Text>
              )}
              {/* Varje tecken i en bordered cell — samma look som "Enter Room
                  Code"-inputen i Join-modalen i fyllt läge (Colors.primary
                  border + Colors.primaryMuted bg). Bindestreck renderas som
                  separata textelement vid varje letter/digit-transition
                  (efter cell 1 och efter cell 3), identiskt med Join-
                  modalens layout. */}
              <View style={styles.roomCodeCellsRow}>
                {roomCode.split('').map((ch, i) => (
                  <React.Fragment key={i}>
                    <View style={styles.roomCodeCell}>
                      <Text style={styles.roomCodeCellText}>{ch}</Text>
                    </View>
                    {(i === ROOM_CODE_LEADING_LETTERS - 1 ||
                      i === ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS - 1) && (
                      <Text style={styles.roomCodeCellDash}>–</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
          {/* Share invite är host-only — bara host bjuder in nya spelare.
              Guest host: dold — friends-invites kräver registrerat konto;
              guests delar rumkoden muntligt istället. */}
          {hostMode && !isGuestHost && (
            <TouchableOpacity onPress={handleOpenShareModal} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>↑ Share invite to friends</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Players in Lobby ─────────────────────────────────── */}
        <View style={styles.section}>
          {/* Kollapsbar sektionsrubrik (samma +/− mönster som Profile). */}
          <TouchableOpacity
            onPress={() => setPlayersExpanded(!playersExpanded)}
            activeOpacity={0.7}
            style={styles.sectionHeaderRow}
            hitSlop={8}
          >
            <Text style={styles.sectionHeaderEmoji}>👥</Text>
            <Text style={styles.sectionHeaderTitle}>Players in Lobby</Text>
            <View style={styles.sectionToggleBox}>
              <Text style={styles.sectionChevron}>{playersExpanded ? '−' : '+'}</Text>
            </View>
            {/* Röd "Players Waiting"-signal till höger om +/− när det finns
                spelare som väntar på godkännande. Försvinner när alla är godkända. */}
            {waitingForApproval.length > 0 && (
              <BlinkingLabel style={styles.playersWaitingLabel}>
                Players Waiting
              </BlinkingLabel>
            )}
            {!playersExpanded && newPlayerJoined && waitingForApproval.length === 0 && (
              <BlinkingLabel style={[styles.playersWaitingLabel, { color: Colors.success }]}>
                New Player joined
              </BlinkingLabel>
            )}
          </TouchableOpacity>
          {!playersExpanded && <View style={styles.sectionDivider} />}
          {playersExpanded && (<>
          {/* Approved-räknaren + "+ Add Guest" flyttade ned till egen rad
              under rubriken (2026-06-01), högerställd med lite toppluft. */}
          {/* Approved-kapacitetsmätare: "Approved"-rubrik + N rutor (N = maxPlayers,
              4 i Pass-the-Phone/Max 4, 12 i Individual Devices/Max 12). Rutorna
              speglar GetReady:s rounds-dots: filled (lit) = godkänd spelare (host
              alltid med = ruta 1), blinkande = väntar på godkännande, tom = ledig
              plats. Sista rutan visar "max N". */}
          <View style={[styles.sectionRow, styles.playersMetaRow]}>
            <Text style={styles.approvedLabel}>Approved</Text>
            <View style={styles.approvedBoxesGrid}>
              {(() => {
                const approvedCount = approvedPlayers.filter((p) => !p.hasLeft).length;
                const waitingCount = waitingForApproval.length;
                // 4 rutor i bredd → 4 spelare = 1 rad, 12 spelare = 3 rader
                // (ruta 5 hamnar under ruta 1, ruta 6 under ruta 2 osv.).
                const COLS = 4;
                const renderBox = (i: number) => {
                  const isFilled = i < approvedCount;
                  const isBlinking = !isFilled && i < approvedCount + waitingCount;
                  // Sista rutan får "max N"-stacken — utom i 1vs1-lobbyn där
                  // taket alltid är 2 och rutan bara visar siffran "2".
                  const isLast = i === maxPlayers - 1 && gameMode !== 'remote-1v1';
                  const boxStyle = [
                    styles.approvedBox,
                    (isFilled || isBlinking) && styles.approvedBoxFilled,
                  ];
                  // Sista rutan: "max" på en rad och siffran (4/12) på raden under.
                  const content = isLast ? (
                    <View style={styles.approvedBoxMaxStack}>
                      <Text style={styles.approvedBoxMaxLabel} numberOfLines={1}>max</Text>
                      <Text style={styles.approvedBoxMaxNum} numberOfLines={1}>{maxPlayers}</Text>
                    </View>
                  ) : (
                    <Text
                      style={styles.approvedBoxNumber}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {i + 1}
                    </Text>
                  );
                  // ApprovedBox äger sin egen blink-loop (start/stopp via prop)
                  // så övergången fast sken ↔ blinkande fungerar pålitligt.
                  return (
                    <ApprovedBox key={i} blinking={isBlinking} style={boxStyle}>
                      {content}
                    </ApprovedBox>
                  );
                };
                const rowCount = Math.ceil(maxPlayers / COLS);
                return Array.from({ length: rowCount }).map((_, r) => (
                  <View key={r} style={styles.approvedBoxesGridRow}>
                    {Array.from({ length: COLS }).map((_, c) => {
                      const i = r * COLS + c;
                      // Osynlig spacer på ev. ofull sista rad så kolumnerna
                      // linjerar (maxPlayers=4/12 = alltid full, men robust).
                      return i < maxPlayers ? renderBox(i) : (
                        <View key={`sp-${c}`} style={styles.approvedBoxSpacer} />
                      );
                    })}
                  </View>
                ));
              })()}
            </View>
            {hostMode && gameMode === 'pass-the-phone' && !isRematchLobby && (
              <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddPlayer}>
                <Text style={styles.addBtnText}>+ Add Guest</Text>
              </TouchableOpacity>
            )}
          </View>

          {gameMode === 'pass-the-phone' && approvedPlayers.length > 0 && (
            <Text style={styles.turnOrderHint}>
              {hostMode
                ? 'Turn order — top plays first. Use ↑↓ to reorder.'
                : 'Playing order — selected by Host'}
            </Text>
          )}

          <View style={styles.playerBoard}>
            {/* Approved spelare = i spelet, har turn-nummer.
                Host ser toggle på övriga approved (men inte sig själv). */}
            {approvedPlayers.map((player, index) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={players.indexOf(player)}
                onMoveUp={hostMode && !player.hasLeft ? () => movePlayer(player.id, 'up') : undefined}
                onMoveDown={hostMode && !player.hasLeft ? () => movePlayer(player.id, 'down') : undefined}
                canMoveUp={hostMode && index > 0}
                canMoveDown={hostMode && index < approvedPlayers.length - 1}
                hcpComplete={player.hcpComplete}
                age={player.age}
                assistance={mutualAssistanceActive ? remoteAssistance : player.assistance}
                isHostPlayer={player.isHost}
                isGuest={player.type === 'guest'}
                accountPlayerName={player.accountPlayerName}
                turnNumber={gameMode === 'pass-the-phone' ? index + 1 : undefined}
                showApproveToggle={hostMode && !isRematchLobby && !player.isHost && !player.hasLeft}
                approved={true}
                onApproveChange={(next) => handleSetApproved(player.id, next)}
                hasLeft={player.hasLeft}
                onEditPlayer={hostMode && !player.hasLeft ? () => openPlayerEdit(player.id) : undefined}
                peerHealth={
                  gameMode === 'individual-devices'
                    ? player.id === ownPlayerIdRef.current
                      ? 'self'
                      : lobbyPeerHealth[player.id]
                    : undefined
                }
                spotifyConnected={player.spotifyConnected}
                showSpotifyBadge={gameMode !== 'remote-1v1'}
              />
            ))}

            {/* Waiting-for-approval section: divider + master toggle + spelarkort */}
            {waitingForApproval.length > 0 && (
              <View style={styles.waitingSection}>
                <Text style={styles.waitingSectionLabel}>
                  To be Approved by Host
                </Text>

                {/* Master "Approve All"-toggle — bara host ser/använder den.
                    Drar host till Yes godkänns alla aktuellt väntande spelare. */}
                {hostMode && !isRematchLobby && waitingForApproval.length > 0 && (
                  <View style={styles.approveAllRow}>
                    <ApproveToggle
                      label="Approve All"
                      value={approveAllValue}
                      onChange={(next) => {
                        setApproveAllValue(next);
                        if (next === 'yes') {
                          handleApproveAll();
                          // Reset till 'no' så toggleln åter visas i No-läge
                          // när nya spelare hamnar i listan i framtiden.
                          setTimeout(() => setApproveAllValue('no'), 400);
                        }
                      }}
                    />
                  </View>
                )}

                {waitingForApproval.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    index={players.indexOf(player)}
                    hcpComplete={player.hcpComplete}
                    age={player.age}
                    assistance={mutualAssistanceActive ? remoteAssistance : player.assistance}
                    isHostPlayer={false}
                    isGuest={player.type === 'guest'}
                    accountPlayerName={player.accountPlayerName}
                    showApproveToggle={hostMode && !isRematchLobby && !player.hasLeft}
                    approved={false}
                    onApproveChange={(next) => handleSetApproved(player.id, next)}
                    hasLeft={player.hasLeft}
                    onDelete={
                      hostMode && !isRematchLobby
                        ? () => handleDeletePlayer(player.id)
                        : undefined
                    }
                    onEditPlayer={hostMode && !player.hasLeft ? () => openPlayerEdit(player.id) : undefined}
                    peerHealth={
                      gameMode === 'individual-devices'
                        ? player.id === ownPlayerIdRef.current
                          ? 'self'
                          : lobbyPeerHealth[player.id]
                        : undefined
                    }
                    spotifyConnected={player.spotifyConnected}
                    showSpotifyBadge={gameMode !== 'remote-1v1'}
                  />
                ))}
              </View>
            )}

          </View>
          </>)}
        </View>

        {/* Start Game-boxen ligger numera som sticky bottom-bar utanför
            ScrollView:n (se efter </ScrollView>) så den alltid är synlig
            under scroll. */}

        {/* ── Customize QuizVibe — kollapsbar, synlig för host OCH non-host ── */}
        <TouchableOpacity
          onPress={() => setCustomizeExpanded((v) => !v)}
          activeOpacity={0.7}
          style={styles.customizeSectionHeader}
        >
          <Text style={styles.customizeSectionHeaderText}>Customize QuizVibe</Text>
          <View style={styles.sectionToggleBox}>
            <Text style={styles.sectionChevron}>{customizeExpanded ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>

        {customizeExpanded && (<>

        {/* Game Settings — sitter mellan room code-kortet och Game Mode-kortet.
            Wrappad i styles.section (samma som Players/Quiz Tuning) så header→
            divider-avståndet styrs av section-gap och blir identiskt för alla tre. */}
        <View style={styles.section}>
        {/* Kollapsbar sektionsrubrik (samma +/− mönster som Profile). */}
        <TouchableOpacity
          onPress={() => setGameSettingsExpanded(!gameSettingsExpanded)}
          activeOpacity={0.7}
          style={styles.sectionHeaderRow}
          hitSlop={8}
        >
          {/* Blå kugghjuls-silhuett (Colors.primary) — matchar blå-temat. */}
          <View style={styles.sectionHeaderSvg}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                fill={Colors.primary}
              />
            </Svg>
          </View>
          <Text style={styles.sectionHeaderTitle}>Game Settings</Text>
          <View style={styles.sectionToggleBox}>
            <Text style={styles.sectionChevron}>{gameSettingsExpanded ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>
        {!gameSettingsExpanded && <View style={styles.sectionDivider} />}

        {/* ── Game Settings (kollapsbar body) ──────────────────────
            Game Mode + Game Connections delar en gemensam blåbordrad
            container. Ger semantiskt en "vad spelet ska spelas som"-sektion
            som visuellt skiljer sig från Players in Lobby nedanför. */}
        {gameSettingsExpanded && (
        <View style={styles.gameSettingsBorder}>
        <View style={styles.definedByHostBadge} pointerEvents="none">
          <Text style={styles.definedByHostBadgeText}>DEFINED BY HOST</Text>
        </View>
        {/* ── Game Mode ─────────────────────────────────────────── */}
        {/* Visas för alla i lobbyn, men kan bara *ändras* av host. För icke-host
            döljs FREE/PREMIUM-badges (de är host-relevanta paketdetaljer) och
            det aktiva läget får istället den blå "lit" kanten — samma primary-
            färg som startskärmens knappar — så att det aktuella host-valet
            tydligt sticker ut utan att se ut som en interaktiv toggle.
            marginTop ger lite extra luft mellan kortets överkant och rubriken. */}
        {gameMode === 'remote-1v1' ? (
          /* Renodlad 1vs1-lobby (2026-08-07): inga Game Mode-val och ingen
             Players-sektion — lobbytypen är låst via Home-valet och antalet
             spelare är alltid 2. En statisk grön indikator visar typen.
             Gating på gameMode-STATE (inte lobbyType-param) så non-host —
             som får gameMode via settings-syncen — ser samma renodlade vy. */
          <View style={[styles.section, { marginTop: Spacing.xs }]}>
            <Text style={styles.sectionLabel}>Game Mode</Text>
            <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
              <View style={[styles.modeOption, styles.modeOptionPassActive]}>
                <Text style={[styles.modeLabel, { textAlign: 'center' }, styles.modeLabelActiveFree]}>
                  Remote play — 1vs1
                </Text>
                <View style={styles.freeBadge} pointerEvents="none">
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </View>
              <View style={{ flex: 1 }} />
            </View>

            {/* Mutual assistance level — OPT-IN. Assistance är normalt
                personligt (per spelarkort), men eftersom båda här svarar på
                samma frågesekvens var för sig kan host välja att låsa båda
                till EN nivå. Switchen är av när lobbyn skapas; nivå-rutorna
                visas först när den slås på. Renderas för alla men bara host
                kan ändra (samma mönster som resten av Game Settings). */}
            <View
              style={[
                styles.mutualAssistanceRow,
                { borderColor: mutualAssistanceEnabled ? Colors.success : Colors.borderStrong },
              ]}
            >
              <Text style={styles.mutualAssistanceLabel}>Mutual assistance level</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() =>
                  Alert.alert(
                    'Mutual assistance level',
                    'Off: each player plays with their own personal assistance level.\n\nOn: both players get the SAME level — the one the Host picks below. In a 1vs1 match both answer the same questions on their own devices, so a shared level makes the duel directly comparable.\n\nFull: the full names are listed, just pick the right one.\nStandard: 2-letter hints, then pick the name.\nMinimal: 1-letter hints, then pick the name.\n\nIt also sets how wide the year interval is on Year questions.',
                  )
                }
                hitSlop={8}
                accessibilityLabel="Mutual assistance level info"
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
              <Switch
                value={mutualAssistanceEnabled}
                onValueChange={setMutualAssistanceEnabled}
                disabled={!hostMode}
                trackColor={{ false: '#3C3C3C', true: Colors.success }}
                thumbColor="#FFF"
                ios_backgroundColor={mutualAssistanceEnabled ? Colors.success : '#3C3C3C'}
                style={styles.sourceMatrixSwitch}
              />
            </View>
            {mutualAssistanceEnabled && (
              <>
                <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
                  {REMOTE_ASSISTANCE_OPTIONS.map((opt) => {
                    const isSelected = remoteAssistance === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.modeOption,
                          isSelected ? styles.modeOptionPassActive : styles.modeOptionInactive,
                        ]}
                        onPress={() => setRemoteAssistance(opt.id)}
                        disabled={!hostMode}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.modeLabel,
                            { textAlign: 'center' },
                            isSelected && styles.modeLabelActiveFree,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.remoteAssistanceNote}>
                  {hostMode
                    ? 'Applies to both players in this 1vs1 match.'
                    : 'Selected by the Host — applies to both players.'}
                </Text>
              </>
            )}
            {!mutualAssistanceEnabled && (
              <Text style={styles.remoteAssistanceNote}>
                Each player plays with their own assistance level.
              </Text>
            )}
          </View>
        ) : isRematchLobby ? (
          /* Re-match/Replay-lobby (Peter 2026-08-25): spelaruppsättningen är
             låst till exakt spelarna från förra spelet, så aggregatet förblir
             en rättvis serie. Därför INGA Game Mode-val och ingen
             Players-sektion — VARJE lägesbyte ejectar spelare (Single player
             kastar ut alla non-hosts, Individual device tar bort host-tillagda
             gäster, Pass-the-Phone nollar maxPlayers till 4). Statisk
             indikator i samma vokabulär som den renodlade 1vs1-lobbyn ovan.
             Allt ANNAT (rundor, era, Source Mixerboard, paket, svarstid) är
             kvar redigerbart — det rör inte uppsättningen. */
          <View style={[styles.section, { marginTop: Spacing.xs }]}>
            <Text style={styles.sectionLabel}>Game Mode</Text>
            <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
              <View style={[styles.modeOption, styles.modeOptionPassActive]}>
                <Text style={[styles.modeLabel, { textAlign: 'center' }, styles.modeLabelActiveFree]}>
                  {singlePlayerDefault
                    ? 'Replay — Single player (locked)'
                    : `Re-match — ${lockedLineupCount} players (line-up locked)`}
                </Text>
                <View style={styles.freeBadge} pointerEvents="none">
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.guestHostNote}>
              These are the players from the previous game. Use Start New Game
              to play with others.
            </Text>
          </View>
        ) : (
        <View style={[styles.section, { marginTop: Spacing.xs }]}>
          {/* Non-host: skriv "GAME MODE - MULTIPLAYER" inline istället för
              klammer + label under toggle:n nedan. Båda delar samma
              sectionLabel-style → Typography.overline:s textTransform
              uppercasar hela strängen automatiskt. */}
          <Text style={styles.sectionLabel}>
            Game Mode
          </Text>

          {/* Tre rutor i EN rad + bracket-etiketter undertill. Layouten
              splittades tillfälligt i två rader när Remote (1vs1) låg här;
              återställd 2026-08-12 när Remote flyttades till Home-valet. */}
          <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
            {renderModeBox('single', 'Single player', true)}
            {renderModeBox('ptp', 'Pass-the-Phone', true)}
            {renderModeBox('indiv', 'Individual device', true)}
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: 2 }}>
            {/* Bracket under "Single player" */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={styles.multiplayerBracket} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Text style={styles.multiplayerBracketLabel}>Single mode</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() =>
                    Alert.alert(
                      'Single player mode',
                      'One player only — challenge yourself.\n\nMax 4 rounds, even with a Premium subscription. Spotify not applicable for Single player mode.',
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
            </View>
            {/* Bracket under "Pass-the-Phone" + "Individual device" —
                flex:2 så den spänner över båda rutorna. */}
            <View style={{ flex: 2, alignItems: 'center' }}>
              <View style={styles.multiplayerBracket} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Text style={styles.multiplayerBracketLabel}>Multiplayer</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() =>
                    Alert.alert(
                      'Multiplayer mode',
                      'Pass-the-Phone: All players share one device. Max 4 players, even with Premium. Spotify not applicable for PtP mode.\n\nIndividual device: Each player uses their own device. Max 4 players on Basic, max 12 players with Premium.\n\nLooking for 1vs1? Remote duels are started from the Home screen — tap Start New Game and pick "Remote Play".',
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Players — max antal spelare. Max 4 gratis, Max 12 Premium. Styr
              lobby-cap + hur många host kan godkänna i "Players in lobby".
              Renderas för alla men disabled för non-host (read-only). */}
          {/* Versaler i samma stil som Game Mode-rubriken (sectionLabel/overline)
              + info-ikon vars popup förklarar Max 4 vs Max 12. */}
          <View style={styles.playersLabelRow}>
            <Text style={[styles.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>Players</Text>
            <Pressable
              style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
              onPress={() =>
                Alert.alert(
                  'Players',
                  'Max 4 players - use as standard and applicable for all Single and Multiplayer modes.\n\nMax 12 players - only applicable with Individual device mode.',
                )
              }
              hitSlop={8}
              accessibilityLabel="Players info"
            >
              <Text style={styles.infoIconText}>i</Text>
            </Pressable>
          </View>
          {/* "2 players (1vs1)"-indikatorn borttagen härifrån 2026-08-07 —
              hela Game Mode+Players-sektionen renderas bara i standard-
              lobbies numera (remote-fallet visar sin egen indikator ovan). */}
          <View style={styles.modeRow}>
            {/* Max 4: aktiv (grön) när maxPlayers === 4, oavsett premium.
                Premium i IndDev → disabled (auto-låst till 12).
                Premium i PtP → maxPlayers=4, grön, ej disabled. */}
            <TouchableOpacity
              style={[styles.modeOption, maxPlayers === 4 ? styles.modeOptionPassActive : styles.modeOptionInactive]}
              onPress={() => handleSelectMaxPlayers(4)}
              disabled={!hostMode || isGuestHost || (hasPremium && gameMode === 'individual-devices' && !singlePlayerDefault)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 4 && styles.modeLabelActiveFree]}>
                Max 4 players
              </Text>
              <View style={[styles.freeBadge, maxPlayers !== 4 && styles.freeBadgeDimmed]} pointerEvents="none">
                <Text style={[styles.freeBadgeText, maxPlayers !== 4 && styles.freeBadgeTextDimmed]}>FREE</Text>
              </View>
            </TouchableOpacity>
            {/* Max 12: auto-valt och aktivt (guld) när premium.
                Guest host: rutan renderas inte alls — Max 4 är enda valet;
                en not under förklarar Premium-vägen. */}
            {!isGuestHost && (
              <TouchableOpacity
                style={[styles.modeOption, maxPlayers === 12 ? styles.modeOptionPremiumActive : styles.modeOptionInactive]}
                onPress={() => handleSelectMaxPlayers(12)}
                disabled={!hostMode}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 12 && styles.modeLabelActivePremium]}>
                  Max 12 players
                </Text>
                <View style={[styles.premiumBadge, !hasPremium && styles.premiumBadgeGrey]} pointerEvents="none">
                  <Text style={[styles.premiumBadgeText, !hasPremium && styles.premiumBadgeTextGrey]}>PREMIUM</Text>
                </View>
              </TouchableOpacity>
            )}
            {/* Spacer så Max 4-rutan behåller halv bredd när Max 12 är dold
                (speglar Single player-rutans vänsterställnings-mönster). */}
            {isGuestHost && <View style={{ flex: 1 }} />}
          </View>
          {isGuestHost && (
            <Text style={styles.guestHostNote}>
              Upto 12 players option for registered Quizvibe users with Premium
            </Text>
          )}

        </View>
        )}

        {/* ── Region Scope ──────────────────────────────────────
            Host-satt spelregel (vilken kulturell kontext frågorna
            ska dras från). Visas för alla i lobbyn men kan bara
            *ändras* av host — samma mönster som Game Mode ovanför. */}
        <View style={[styles.section, { marginTop: Spacing.sm, gap: Spacing.xs }]}>
          <View style={styles.regionLabelRow}>
            <Text style={styles.sectionLabel}>Region Scope</Text>
            <Pressable
              style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
              onPress={() =>
                Alert.alert(
                  'Region Scope',
                  "Recognition context — the region the questions are drawn from and whose audience the recognition level is based on. Players get content that's familiar in the chosen region.",
                )
              }
              hitSlop={8}
              accessibilityLabel="Region Scope info"
            >
              <Text style={styles.infoIconText}>i</Text>
            </Pressable>
          </View>
          <TouchableOpacity
            style={styles.regionTrigger}
            activeOpacity={0.7}
            disabled={!hostMode}
            onPress={() => { if (hostMode) setRegionModalOpen(true); }}
          >
            <Text style={{ fontSize: 18 }}>{REGION_FLAGS[region]}</Text>
            <Text style={styles.regionTriggerText}>{region}</Text>
            {hostMode && <Text style={{ fontSize: 14, color: Colors.textSecondary }}>⌄</Text>}
          </TouchableOpacity>
        </View>

        {/* ── Game Connections ─────────────────────────────────── */}
        {/* Visar vilka källor spelet drar frågor från. Vänsterjusterad lista
            med färgade brand-badges (kompakt list-format). marginTop ger lite
            extra luft mellan Game Mode-beskrivningen och denna rubrik. */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
          <Text style={styles.sectionLabel}>SOURCE MIXERBOARD</Text>
          <View style={styles.connectionsList}>
            {/* ── Spotify DJ-läge ─────────────────────────────────────────
                Synlig i alla lägen UTOM renodlade 1vs1-lobbyn (Spotify är
                aldrig tillämpligt i asynkrona dueller — kortet göms helt,
                inkl. attest-raden). Availability-pillen visar om Spotify DJ
                stöds i aktuellt game mode (IndDev = grön "Enabled",
                PtP/Single = grå "Disabled" + toggle utgråad). */}
            {gameMode !== 'remote-1v1' && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm, marginBottom: Spacing.xs, paddingBottom: spotifyEnabled ? 6 : 0 }}>
            {/* Attest-kontroll ("I have Spotify app..." + switch) — egen rad
                ÖVERST i boxen, ovanför ikon/rubrik-raden, synlig i BÅDA
                attest-lägen. Switchen är controlled på spotifyConnected:
                ON → handleConnectSpotify, OFF → handleDisconnectSpotify
                (Cancel i disconnect-alerten lämnar den kvar i ON). Grå ram
                runt text + switch så de läses som EN kontroll. */}
            {/* marginRight: 28 + paddingRight: 4 → attest-switchens högerkant
                hamnar 32px från boxkanten = samma kolumn som DJ-switchen i
                rubrikraden (spotifyDJRow paddingRight 18 + controls margin 14).
                Texten flex: 1 skjuter switchen mot ramens högerkant. */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginLeft: Spacing.sm,
                marginRight: spotifyAttestMR,
                marginTop: 6,
                borderWidth: 1,
                // Ramfärg speglar attest-läget: grön = Yes, röd = No.
                borderColor: spotifyConnected ? Colors.success : Colors.error,
                borderRadius: Radius.sm,
                paddingLeft: Spacing.sm,
                // Smal höger-padding (2) — vid 4 slog attest-marginalens
                // 0-golv i på 390pt-skärmar och switchen fastnade ~2pt vänster.
                paddingRight: 2,
                paddingVertical: 2,
              }}
            >
              <Text
                style={[styles.spotifyLinkText, { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1, textDecorationLine: 'none' }]}
              >
                I have Spotify App on this device
              </Text>
              <Switch
                value={spotifyConnected}
                onValueChange={(v) => (v ? handleConnectSpotify() : handleDisconnectSpotify())}
                trackColor={{ false: '#3C3C3C', true: '#1DB954' }}
                thumbColor="#FFF"
                ios_backgroundColor={spotifyConnected ? '#1DB954' : '#3C3C3C'}
                style={styles.sourceMatrixSwitch}
              />
            </View>
            <View style={[styles.spotifyDJRow, { backgroundColor: undefined, borderRadius: undefined, marginBottom: 0 }]}>
              <View style={[styles.connectionIconWrap, { alignSelf: 'flex-start', marginTop: 0, marginLeft: -2 }]}>
                {/* variant="white" — mörk kortbakgrund kräver monokrom vit
                    per Spotifys brand guidelines (grönt bara på svart/vit bg). */}
                <SpotifyBrandIcon size={22} variant="white" />
              </View>
              <View style={{ flex: 1, alignSelf: 'flex-start', marginTop: 5, marginLeft: -8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.connectionLabel, { minWidth: 0 }]}>Spotify</Text>
                  <Pressable
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                    onPress={() =>
                      Alert.alert(
                        'Spotify',
                        '• Only applicable in Individual Devices mode\n\n• For Spotify music, one player at a time (the DJ) will be directed via QuizVibe to Spotify\n\n• The DJ needs the Spotify app on their device — free or Premium',
                        [
                          { text: 'Guide How it works', onPress: () => setSpotifyGuideVisible(true) },
                          { text: 'Close', style: 'cancel' },
                        ],
                      )
                    }
                    hitSlop={8}
                    accessibilityLabel="Spotify info"
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
                {/* Spotify self-attest (Plan B 2026-07-22): bekräfta/ta bort
                    "jag har Spotify-appen" via attest-switchen ÖVERST i boxen.
                    Även självanslutna guests får attesta (policy 2026-08-06:
                    de har egen enhet och får spela IndDev + Spotify).
                    Ingen status-text — attest-switchens läge bär statusen.
                    Guide-länken nås via info-ikonens popup ("Guide How it
                    works"-knappen). */}
              </View>
              {hostMode ? (
                // Konstant marginRight (14) — växlade tidigare 14/-16 på
                // attest-state vilket fick DJ-switchen att "hoppa" 30px när
                // attest-switchen slogs på/av. Pillen dyker upp till VÄNSTER
                // om switchen (radens högerkant ligger fast) så switchens
                // position är stabil i båda lägen.
                <View style={[styles.spotifyHostControls, { marginRight: spotifySwitchMR, alignSelf: 'flex-start', marginTop: 1, gap: 4 }]}>
                  {/* Availability-pill: visas bara när Spotify är kopplat — annars tar pillen för mycket horisontellt utrymme och "Not activated"-texten tvingas ned på ny rad */}
                  {spotifyConnected && (
                    <View style={[
                      styles.spotifyAvailPill,
                      isSpotifyAvailable
                        ? styles.spotifyAvailPillOn
                        : styles.spotifyAvailPillOff,
                    ]}>
                      <Text style={[
                        styles.spotifyAvailPillText,
                        !isSpotifyAvailable && styles.spotifyAvailPillTextOff,
                      ]}>
                        {isSpotifyAvailable ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  )}
                  <Switch
                    value={isSpotifyAvailable && spotifyEnabled}
                    onValueChange={isSpotifyAvailable ? handleToggleSpotifyEnabled : undefined}
                    disabled={!isSpotifyAvailable}
                    trackColor={{ false: '#3C3C3C', true: '#1DB954' }}
                    thumbColor={isSpotifyAvailable ? '#FFF' : '#888'}
                    ios_backgroundColor={isSpotifyAvailable && spotifyEnabled ? '#1DB954' : '#3C3C3C'}
                    style={[
                      styles.sourceMatrixSwitch,
                      !isSpotifyAvailable && { opacity: 0.4 },
                    ]}
                  />
                </View>
              ) : (
                /* Non-host: read-only switch speglar host:s spotifyEnabled-val */
                <View style={{ marginRight: spotifySwitchMR, alignSelf: 'flex-start', marginTop: 1 }}>
                  <Switch
                    value={spotifyEnabled}
                    disabled
                    trackColor={{ false: '#3C3C3C', true: '#1DB954' }}
                    thumbColor={spotifyEnabled ? '#FFF' : '#888'}
                    ios_backgroundColor={spotifyEnabled ? '#1DB954' : '#3C3C3C'}
                    style={styles.sourceMatrixSwitch}
                  />
                </View>
              )}
            </View>

            {/* ── Spotify answer type toggles (synliga bara när Spotify är aktiverat) ── */}
            {spotifyEnabled && (
              // paddingLeft: 34 = samma x som "Spotify"-rubriken ovanför
              // (8 row-padding − 2 ikon-margin + 28 ikon + 8 gap − 8
              // kolumn-margin). "Type:" pinnas vänster; switch-gruppen
              // behåller höger-ankring via marginLeft: 'auto'.
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 34, paddingRight: 18, paddingTop: 2, paddingBottom: 2 }}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Type:</Text>
                <View style={{ marginLeft: 'auto', marginRight: spotifySwitchMR, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Year</Text>
                    <Switch
                      value={spotifyAnswerYear}
                      disabled={!hostMode}
                      onValueChange={(v) => {
                        // Guest host: Year/Name är låsta (båda ON) — bara
                        // Spotify på/av är guest-valbart.
                        if (isGuestHost) { guestLockAlert(); return; }
                        if (!v && !spotifyAnswerName) {
                          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
                          return;
                        }
                        setSpotifyAnswerYear(v);
                      }}
                      trackColor={{ false: Colors.error, true: Colors.success }}
                      thumbColor="#FFF"
                      ios_backgroundColor={spotifyAnswerYear ? Colors.success : Colors.error}
                      style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Name</Text>
                    <Switch
                      value={spotifyAnswerName}
                      disabled={!hostMode}
                      onValueChange={(v) => {
                        // Guest host: låst — se Year-switchen ovan.
                        if (isGuestHost) { guestLockAlert(); return; }
                        if (!v && !spotifyAnswerYear) {
                          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
                          return;
                        }
                        setSpotifyAnswerName(v);
                      }}
                      trackColor={{ false: Colors.error, true: Colors.success }}
                      thumbColor="#FFF"
                      ios_backgroundColor={spotifyAnswerName ? Colors.success : Colors.error}
                      style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]}
                    />
                  </View>
                </View>
              </View>
            )}
            </View>
            )}

            {/* ── Source × Category Matrix ── */}
            <View
              style={styles.smGrid}
              onLayout={(e) => {
                const fullW = e.nativeEvent.layout.width;
                if (fullW > 0 && fullW !== smGridW) setSmGridW(fullW);
                const w = Math.round((fullW - 112) / 3);
                if (w > 0 && w !== smColWidth) setSmColWidth(w);
              }}
            >

              {/* ── Etikett-stack (vänster) ── */}
              <View style={styles.smLabelStack}>
                <View style={[styles.smHeaderCell, styles.smDataShift]}>
                  <Text style={styles.sourceMatrixAllText}>All</Text>
                </View>
                <View style={[styles.smAllToggleCell, { paddingLeft: 29, borderTopLeftRadius: Radius.sm, borderBottomLeftRadius: Radius.sm }]}>
                  <Switch
                    value={allEnabled}
                    onValueChange={hostMode ? handleToggleAllSources : undefined}
                    disabled={!hostMode}
                    trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }}
                    thumbColor="#FFF"
                    ios_backgroundColor={allEnabled ? Colors.success : MATRIX_SWITCH_OFF}
                    style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]}
                  />
                </View>
                <View style={styles.smLabelSourceCell}>
                  <YouTubeBrandIcon size={22} />
                  <Text style={styles.sourceMatrixSourceText}>YouTube</Text>
                  <Pressable
                    onPress={() => Alert.alert('YouTube sources', '• Artists – music videos\n• Actors – movie clips & trailers\n• Athletes – sport events')}
                    hitSlop={8}
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
                <View style={styles.smAutoCell} />
                <View style={styles.smLabelSourceCell}>
                  <View style={styles.imagesIconWrap}>
                    <Svg width={22} height={22} viewBox="24 22 32 32">
                      <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.primary} strokeWidth="2.5" />
                      <Path d="M49 47 L53 51" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.imagesQMark}>?</Text>
                  </View>
                  <Text style={styles.sourceMatrixSourceText}>Hints</Text>
                  <Pressable
                    onPress={() => Alert.alert('Hints', 'Person name guessing — currently being prepared. Switches are available for when the feature activates.')}
                    hitSlop={8}
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
              </View>

              {/* ── Artists kolumn-stack ── */}
              <View style={styles.smDataStack}>
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Music</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift]}>
                  <Switch
                    value={artistsAllOn}
                    onValueChange={hostMode ? handleToggleArtistsColumn : undefined}
                    disabled={!hostMode}
                    trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }}
                    thumbColor="#FFF"
                    ios_backgroundColor={artistsAllOn ? Colors.success : MATRIX_SWITCH_OFF}
                    style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]}
                  />
                </View>
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={youtubeEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsYoutube} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Music') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsGuessWho} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Music') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
              </View>

              {/* ── Actors kolumn-stack ── */}
              <View style={[styles.smDataStack, styles.sourceMatrixColSep]}>
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Film</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={actorsAllOn} onValueChange={hostMode ? handleToggleActorsColumn : undefined} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={actorsAllOn ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={youtubeEnabledCategories.includes('Film')} onValueChange={handleToggleActorsYoutube} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Film') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Film')} onValueChange={handleToggleActorsGuessWho} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Film') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
              </View>

              {/* ── Athletes kolumn-stack ── */}
              <View
                style={[styles.smDataStack, styles.sourceMatrixColSep]}
                onLayout={(e) => setSportStackX(e.nativeEvent.layout.x)}
              >
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Sport</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift, { borderTopRightRadius: Radius.sm, borderBottomRightRadius: Radius.sm }]}>
                  <Switch value={athletesAllOn} onValueChange={hostMode ? handleToggleAthletesColumn : undefined} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={athletesAllOn ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
                <View
                  onLayout={(e) => setSportCellCenter(e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2)}
                  style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}
                >
                  <Switch value={youtubeEnabledCategories.includes('Sport')} onValueChange={handleToggleAthletesYoutube} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Sport') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Sport')} onValueChange={handleToggleAthletesGuessWho} disabled={!hostMode} trackColor={{ false: MATRIX_SWITCH_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Sport') ? Colors.success : MATRIX_SWITCH_OFF} style={[styles.sourceMatrixSwitch, isGuestHost && { opacity: 0.45 }]} />
                </View>
              </View>

            </View>

            {/* 1vs1: Spotify-kortet göms helt (se toppen av mixerboarden) —
                noten sitter under hela matrisen, ovanför Customized Host
                packages, så det inte läses som en bugg att raden saknas. */}
            {gameMode === 'remote-1v1' && (
              <Text style={styles.guestHostNote}>
                Spotify is not available in 1vs1 Games
              </Text>
            )}

            {/* Use Packages — sub-block sist i Game Connections för musikpaket-val.
                Basic-utbudet är alltid implicit aktivt (ingen synlig chip);
                hosten kan välja till köpta Extra packages ovanpå. För
                icke-host visas allt read-only (disabled på TouchableOpacity). */}
            <View style={styles.usePackagesBlock}>
              {/* Rubrik-rad: section label vänster + info-ikon höger som
                  förklarar Generic vs Extra Host Packages. Info-ikonen
                  använder samma styling som paket-radernas infoIconBtn. */}
              <View style={styles.customizedPackagesHeaderRow}>
                <Text style={styles.sectionLabel}>Customized Host packages</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.infoIconBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      'Customized Host packages',
                      'Generic - Generic portfolio includes quiz from all main categories Music, Film and Sport.\n\nExtra Host Packages - specific themes for a customized game experience',
                    )
                  }
                  hitSlop={8}
                  accessibilityLabel="Customized Host packages info"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>

              {/* Två-knapps-rad direkt under rubriken — vänster: "Generic"-
                  ruta med FREE-badge som signalerar att lobby:n kör basic
                  innehåll utan extra-paket; höger: "Activate Extra package"
                  med PREMIUM-badge (2026-07-07 — ersatte "+ Add Host
                  packages"-Store-CTAn; paket säljs inte styckvis längre utan
                  INGÅR i Premium-abonnemanget). Båda halvbreda (flex: 1 +
                  gap: 4 i raden). Generic lyser grön när inga extra-paket är
                  valda; dämpas till grå när paket är aktiva. Host-only. */}
              {hostMode && (() => {
                // Generic är aktiv (grön) när inga extra-paket är valda.
                // Så fort minst ett paket är valt — inklusive Select all-
                // läget — dämpas Generic till grå (paketen är nu i bruk
                // istället för bara basic-utbudet).
                const isGenericActive = selectedExtraPackages.length === 0;
                const isPackagesActive = selectedExtraPackages.length > 0;
                const handleGenericPress = () => {
                  if (isGenericActive) return;
                  // Minst ett paket valt → fråga innan vi rensar selection.
                  Alert.alert(
                    'Switch to Generic?',
                    'This will deactivate all selected packages and use only the generic content for this lobby.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Switch',
                        onPress: () => setSelectedExtraPackages([]),
                      },
                    ],
                  );
                };
                // Activate-knappens tap-beteende per roll:
                //   • Guest host → register-popup (Yes raderar lobbyn +
                //     öppnar Register-formuläret på Home). Inloggad guest
                //     host landar i inloggade menyn istället (register-
                //     steget är gated !isLoggedIn på Home) — acceptabelt.
                //   • Inloggad utan Premium → Store-upsell (subscription).
                //   • Premium + Generic aktivt → re-aktivera alla paket
                //     (tom V1-katalog → coming soon-Alert).
                //   • Premium + paket redan aktiva → no-op (speglar
                //     Generic-knappens active-no-op).
                const handleActivatePress = () => {
                  if (isGuestHost) {
                    Alert.alert(
                      'Premium feature',
                      'Extra packages are only available for QuizVibe users with Premium. Do you want to register as a QuizVibe user? Please be aware this Game Lobby will be deleted.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Yes',
                          style: 'destructive',
                          onPress: () =>
                            performLobbyDelete(() =>
                              router.replace({ pathname: '/', params: { openRegister: '1' } }),
                            ),
                        },
                      ],
                    );
                    return;
                  }
                  if (!hasPremium) {
                    Alert.alert(
                      'Premium feature',
                      'Extra Host packages for a customized quiz experience are included with QuizVibe Premium. Get it in the Store?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
                      ],
                    );
                    return;
                  }
                  if (isPackagesActive) return;
                  if (availablePackages.length === 0) {
                    Alert.alert(
                      'No Extra packages available',
                      'New Extra Host packages are coming soon and will be included in your Premium subscription.',
                    );
                    return;
                  }
                  setSelectedExtraPackages(availablePackages.map((p) => p.id));
                };
                const activateIsActive = hasPremium && isPackagesActive;
                return (
                  <View style={styles.packageActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.addPackageBtn,
                        isGenericActive && styles.genericBtnActive,
                      ]}
                      onPress={handleGenericPress}
                      activeOpacity={isGenericActive ? 1 : 0.7}
                    >
                      <Text
                        style={[
                          styles.modeLabel,
                          isGenericActive && styles.modeLabelActiveFree,
                        ]}
                      >
                        Generic
                      </Text>
                      <View
                        style={[
                          styles.freeBadge,
                          !isGenericActive && styles.freeBadgeDimmed,
                        ]}
                        pointerEvents="none"
                      >
                        <Text
                          style={[
                            styles.freeBadgeText,
                            !isGenericActive && styles.freeBadgeTextDimmed,
                          ]}
                        >
                          FREE
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addPackageBtn,
                        activateIsActive && styles.activatePackageBtnActive,
                      ]}
                      onPress={handleActivatePress}
                      activeOpacity={activateIsActive ? 1 : 0.7}
                    >
                      <Text
                        style={[
                          styles.modeLabel,
                          activateIsActive && styles.modeLabelActivePremium,
                        ]}
                      >
                        Activate Extra package
                      </Text>
                      <View
                        style={[
                          styles.premiumBadge,
                          !hasPremium && styles.premiumBadgeGrey,
                        ]}
                        pointerEvents="none"
                      >
                        <Text
                          style={[
                            styles.premiumBadgeText,
                            !hasPremium && styles.premiumBadgeTextGrey,
                          ]}
                        >
                          PREMIUM
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })()}

              {/* Guest host: paket-listan (wrappern nedan) ersätts av en not. */}
              {isGuestHost && (
                <Text style={styles.guestHostNote}>
                  Extra packages only available for registered QuizVibe users with Premium
                </Text>
              )}

              {/* Yttre svart container som omsluter paketlistan — speglar
                  modeToggle:s padding (3), gap (4), borderRadius (md) och
                  Colors.background-bakgrund. Synlighet (2026-07-07): paket-
                  listan visas för host ENDAST när hosten är inloggad QuizVibe-
                  user med Premium (paket ingår i Premium — ej styckköp).
                  Guest host: noten ovanför kommunicerar låset. Ej-Premium
                  host: inget under knapp-raden (grå PREMIUM-badge är lås-
                  signalen, samma mönster som Max 12). Non-host: oförändrat —
                  ser hostens aktiva paket. */}
              {(!hostMode || (!isGuestHost && hasPremium)) && (
              <View style={styles.extraPackagesWrapper}>
                {/* Sub-rubrik högst upp i wrappern. För host introducerar den
                    de egna köpta paketen; för icke-host listas de paket hosten
                    valt att aktivera i den här lobbyn. */}
                <View style={styles.extraPackagesHeadingRow}>
                  <Text style={styles.extraPackagesHeading}>
                    {hostMode ? 'Your Customized packages:' : 'Packages for this lobby selected by the Host:'}
                  </Text>
                  {/* Select all-toggle göms när bara 1 paket finns — då
                      blir den redundant (single packagets egen toggle gör
                      samma jobb). Aktiveras när themed packages introduceras
                      i v1.1+ (V1 har inga paket alls). */}
                  {hostMode && availablePackages.length > 1 && (
                    <View style={styles.selectAllGroup}>
                      <Text style={styles.selectAllLabel}>Select all</Text>
                      <Switch
                        value={isAllSelected}
                        onValueChange={handleToggleAll}
                        disabled={availablePackages.length === 0}
                        trackColor={{ false: Colors.error, true: Colors.success }}
                        thumbColor="#FFF"
                        // Synca ios_backgroundColor med aktiv track-färg —
                        // se YouTube-switchen ovan för rationale.
                        ios_backgroundColor={isAllSelected ? Colors.success : Colors.error}
                        style={styles.connectionSwitch}
                      />
                    </View>
                  )}
                </View>

                {/* Host ser sin profil-aktiverade paket-lista med switch per
                    paket (paket disabled i Profile visas inte alls här);
                    icke-host ser endast paket som hosten aktiverat för denna
                    lobby — alltid i active-style eftersom de per definition
                    är "på" i denna lobby. */}
                {(() => {
                  const visiblePackages = hostMode
                    ? [...availablePackages]
                    : availablePackages.filter((pkg) => selectedExtraPackages.includes(pkg.id));
                  const sorted = visiblePackages.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true }),
                  );

                  if (sorted.length === 0) {
                    return (
                      <Text style={styles.noExtraPackagesText}>
                        {hostMode ? 'No Extra packages available yet' : 'No extra packages active in this lobby'}
                      </Text>
                    );
                  }

                  return sorted.map((pkg) => {
                    const isSelected = selectedExtraPackages.includes(pkg.id);
                    // För icke-host är raden alltid "aktiv" (vi visar bara
                    // valda paket), så active-stylen används oavsett.
                    const showActive = hostMode ? isSelected : true;
                    const isFree = !!pkg.free;
                    return (
                      <View key={pkg.id} style={styles.purchasedPackageRow}>
                        <TouchableOpacity
                          style={styles.infoIconBtn}
                          onPress={() =>
                            Alert.alert(
                              pkg.name,
                              'Information about this package will be available later.',
                            )
                          }
                          hitSlop={8}
                          accessibilityLabel={`${pkg.name} info`}
                        >
                          <Text style={styles.infoIconText}>i</Text>
                        </TouchableOpacity>
                        <View
                          style={[
                            styles.purchasedPackageBox,
                            showActive && styles.purchasedPackageBoxActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.purchasedPackageName,
                              showActive && styles.purchasedPackageNameActive,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {pkg.name}
                          </Text>
                          {isFree && (
                            <View
                              style={[styles.packageRowFreeBadge, !showActive && styles.packageRowFreeBadgeMuted]}
                              pointerEvents="none"
                            >
                              <Text
                                style={[styles.packageRowFreeBadgeText, !showActive && styles.packageRowFreeBadgeTextMuted]}
                              >
                                FREE
                              </Text>
                            </View>
                          )}
                        </View>
                        {hostMode && (
                          <Switch
                            value={isSelected}
                            onValueChange={() => handleToggleExtraPackage(pkg.id)}
                            trackColor={{ false: Colors.error, true: Colors.success }}
                            thumbColor="#FFF"
                            // Synca ios_backgroundColor med aktiv track-färg
                            // — se YouTube-switchen ovan för rationale.
                            ios_backgroundColor={isSelected ? Colors.success : Colors.error}
                            style={styles.connectionSwitch}
                          />
                        )}
                      </View>
                    );
                  });
                })()}

              </View>
              )}
            </View>
          </View>
        </View>
        </View>
        )}{/* /gameSettingsBorder */}
        </View>{/* /Game Settings section */}

        {/* ── Quiz Settings ─────────────────────────────────────
            Game Era + Number of Rounds delar en gemensam ram
            (quizSettingsBorder, samma stil som gameSettingsBorder).
            "– defined by Host" visas på sektion-rubriken för icke-host,
            inte per-block, så ramen visuellt klumpar host-kontrollerade
            quiz-inställningar tillsammans. */}
        <View style={styles.section}>
          {/* Kollapsbar sektionsrubrik (samma +/− mönster som Profile). */}
          <TouchableOpacity
            onPress={() => setQuizTuningExpanded(!quizTuningExpanded)}
            activeOpacity={0.7}
            style={styles.sectionHeaderRow}
            hitSlop={8}
          >
            {/* Sliders/equalizer-ikon (tre horisontella reglage med rattar)
                — inline-SVG, matchar referensbilden. Cirklarna fylls med
                bakgrundsfärgen så linjen "stannar" vid ratten (hollow knob). */}
            <View style={styles.sectionHeaderSvg}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path d="M3 6 H21" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                <Path d="M3 12 H21" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                <Path d="M3 18 H21" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                <Circle cx={9} cy={6} r={3} fill={Colors.background} stroke={Colors.primary} strokeWidth={2} />
                <Circle cx={15} cy={12} r={3} fill={Colors.background} stroke={Colors.primary} strokeWidth={2} />
                <Circle cx={9} cy={18} r={3} fill={Colors.background} stroke={Colors.primary} strokeWidth={2} />
              </Svg>
            </View>
            <Text style={styles.sectionHeaderTitle}>Quiz Tuning</Text>
            <View style={styles.sectionToggleBox}>
              <Text style={styles.sectionChevron}>{quizTuningExpanded ? '−' : '+'}</Text>
            </View>
          </TouchableOpacity>
          {!quizTuningExpanded && <View style={styles.sectionDivider} />}

          {quizTuningExpanded && (
          <View style={styles.quizSettingsBorder}>
            <View style={styles.definedByHostBadge} pointerEvents="none">
              <Text style={styles.definedByHostBadgeText}>DEFINED BY HOST</Text>
            </View>
            {/* Game Era */}
            <View>
              <View style={styles.regionLabelRow}>
                <Text style={styles.sectionLabel}>Game Era (min 15 year interval)</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Alert.alert('Game Era', 'Set the time span for questions')}
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              {/* Det valda årtalsintervallet visas i samma gul/glow-ruta för
                  både host och non-host (in-game year-selector-paritet). Host
                  får dessutom slidern + DecadeMarks under för att kunna dra.
                  Slidern är guldtonad (Colors.warning = #F5A623) för att
                  matcha rutans kantlinje + glow. minMarkerOverlapDistance
                  hindrar markörerna från att komma närmare än 10 år. */}
              <View style={styles.eraGuestBoxWrap}>
                <View style={styles.eraGuestBox}>
                  <Text style={styles.eraGuestBoxText}>{displayEra[0]} – {displayEra[1]}</Text>
                </View>
              </View>
              {/* Guest host: era är låst till fulla spannet — ingen slider,
                  bara info-not under display-boxen. */}
              {isGuestHost && (
                <Text style={styles.guestHostNote}>
                  change Game era not available for Guest user
                </Text>
              )}
              {hostMode && !isGuestHost && (
                <View style={{ alignItems: 'center', position: 'relative', width: SLIDER_WIDTH, alignSelf: 'center' }}>
                  <MultiSlider
                    // values-propen hålls STABIL under drag (= committed
                    // eraValues). MultiSlider:s componentDidUpdate skulle
                    // annars återställa pastOne/pastTwo varje gång vi
                    // ekade onValuesChange tillbaka, vilket dubbel-räknar
                    // gestureDx och får aktiv thumb att drifta från sin
                    // year-label. Vi skriver till dragEraValues för
                    // realtids-display istället; commit på Finish.
                    values={eraValues}
                    min={ERA_MIN}
                    max={ERA_MAX}
                    step={1}
                    onValuesChangeStart={() => {
                      const snapshot: [number, number] = [eraValues[0], eraValues[1]];
                      dragEraValuesRef.current = snapshot;
                      setDragEraValues(snapshot);
                    }}
                    onValuesChange={(vals) => {
                      // Lib:n blockar redan inaktiv thumb mot
                      // minMarkerOverlapDistance, så vals reflekterar bara
                      // den aktiva thumben — vi behöver ingen egen
                      // detektion/låsning. Defensiv guard ifall lib:n
                      // släpper igenom värden under 10 år.
                      // to-golv: clampa (inte frys) så rutan spårar exakt till
                      // 1980 även vid snabba drag, och thumben commit:as till
                      // 1980 vid släpp.
                      const clampedTo = Math.max(vals[1], ERA_TO_MIN);
                      if (clampedTo - vals[0] < ERA_MIN_INTERVAL) return;
                      const prev = dragEraValuesRef.current;
                      if (prev && prev[0] === vals[0] && prev[1] === clampedTo) return;
                      const next: [number, number] = [vals[0], clampedTo];
                      dragEraValuesRef.current = next;
                      // Tick-haptic per år-ändring — selectionAsync är
                      // Apple:s picker-tick på iOS, KEYBOARD_TAP på
                      // Android. No-op på web. Step=1 ⇒ exakt en
                      // haptic per år.
                      void Haptics.selectionAsync();
                      setDragEraValues(next);
                    }}
                    onValuesChangeFinish={() => {
                      // Commit drag-värdet till eraValues — först nu
                      // ändras lib:ns values-prop, vilket triggar
                      // componentDidUpdate:s pastOne/pastTwo-reset till
                      // korrekta positioner för nästa drag. Läser via
                      // ref så vi alltid får senaste värdet oavsett
                      // render-ordning.
                      const final = dragEraValuesRef.current;
                      if (final) setEraValues([final[0], final[1]]);
                      dragEraValuesRef.current = null;
                      setDragEraValues(null);
                    }}
                    minMarkerOverlapDistance={ERA_MIN_INTERVAL_PX}
                    minMarkerValueTwo={ERA_TO_MIN}
                    isMarkersSeparated
                    customMarkerLeft={EraMarkerMinus}
                    customMarkerRight={EraMarkerPlus}
                    // markerOffsetY = trackStyle.height / 2 — centrerar
                    // thumben på track-centerlinjen. Utan offsetten lägger
                    // lib:n thumben med center vid fullTrack-top istället.
                    markerOffsetY={3}
                    selectedStyle={{
                      backgroundColor: Colors.warning,
                      borderRadius: 3,
                      shadowColor: Colors.warning,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.85,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                    unselectedStyle={{ backgroundColor: Colors.border }}
                    trackStyle={{ height: 6 }}
                    containerStyle={{ alignSelf: 'center' }}
                    sliderLength={SLIDER_INNER_WIDTH}
                  />
                  {/* Blocka fill-bar-touches (= mellan thumbs) så lib:ns
                      _panResponderBetween inte triggar moveOne+moveTwo
                      parallellt och drar hela spannet samtidigt. Cover
                      sitter 25 px (= lib:s default touchDimensions.width
                      / 2) innanför vardera thumb-center så thumb-touch-
                      zonerna förblir oberörda. Renderas bara när span
                      är bred nog att exponera fill-bar mellan thumb-
                      zonerna (≤ ~19 år ⇒ ingen synlig fill-bar att
                      blocka). y=22/h=6 = lib:ns fullTrack-position
                      vertikalt centrerad i den 50 px höga slider-
                      containern med trackStyle.height=6. */}
                  {(() => {
                    const yearToSliderX = (year: number) =>
                      ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH;
                    const THUMB_TOUCH_HALF = 25;
                    const sliderX0 = yearToSliderX(displayEra[0]);
                    const sliderX1 = yearToSliderX(displayEra[1]);
                    const coverWidth = sliderX1 - sliderX0 - 2 * THUMB_TOUCH_HALF;
                    if (coverWidth <= 0) return null;
                    return (
                      <View
                        onStartShouldSetResponder={() => true}
                        onStartShouldSetResponderCapture={() => true}
                        onResponderTerminationRequest={() => false}
                        onResponderGrant={() => { /* swallow */ }}
                        onResponderMove={() => { /* swallow */ }}
                        onResponderRelease={() => { /* swallow */ }}
                        style={{
                          position: 'absolute',
                          left: SLIDER_INSET + sliderX0 + THUMB_TOUCH_HALF,
                          width: coverWidth,
                          top: 22,
                          height: 6,
                          backgroundColor: 'transparent',
                        }}
                      />
                    );
                  })()}
                  <DecadeMarks />
                </View>
              )}
              {hostMode && !isGuestHost && eraAtToFloor && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ To-year can not be earlier than 1980</Text></View>}
              {hostMode && !isGuestHost && eraAtMinInterval && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ Min interval 15 years</Text></View>}
              {eraWarning && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ {eraWarning}</Text></View>}
            </View>

            {/* Number of Rounds */}
            <View>
              <View style={styles.regionLabelRow}>
                <Text style={styles.sectionLabel}>Number of Rounds</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Alert.alert('Number of Rounds', 'How many rounds in this game')}
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              {/* Siffran ramas in i samma blå-bordred ruta för både host och
                  non-host. Host får -/+ knappar på sidorna och RoundsRuler
                  under för att stega och se intervallet.
                  Guest host: ENDAST två val-rutor (2/4) — stepper, ruler och
                  game-mode quick-select renderas inte alls. */}
              {isGuestHost ? (
                <>
                  <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
                    {([2, 4] as const).map((n) => {
                      const isActive = roundsCount === n;
                      return (
                        <TouchableOpacity
                          key={n}
                          style={[
                            styles.modeOption,
                            isActive ? styles.modeOptionPassActive : styles.modeOptionInactive,
                          ]}
                          onPress={() => setRoundsCount(n)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modeLabel,
                              { textAlign: 'center' },
                              isActive && styles.modeLabelActiveFree,
                            ]}
                          >
                            {n} rounds
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.guestHostNote}>
                    Upto 20 rounds option for registered Quizvibe users with Premium
                  </Text>
                </>
              ) : hostMode ? (
                <>
                  <View style={styles.roundsStepperRow}>
                    <TouchableOpacity
                      style={[styles.roundsStepperBtn, roundsCount <= ROUNDS_MIN && styles.roundsStepperBtnDisabled]}
                      onPress={handleDecrementRounds}
                      disabled={roundsCount <= ROUNDS_MIN}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roundsStepperBtnText, roundsCount <= ROUNDS_MIN && styles.roundsStepperBtnTextDisabled]}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.roundsGuestBox}>
                      <Text style={styles.roundsGuestBoxText}>{roundsCount}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.roundsStepperBtn, roundsCount >= stepperMax && styles.roundsStepperBtnDisabled]}
                      onPress={roundsCount >= stepperMax && !hasPremium && gameMode !== 'remote-1v1'
                        ? () => Alert.alert(
                            'Premium feature',
                            'Host more than 4 rounds require QuizVibe Premium. Go to Store?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
                            ],
                          )
                        // Remote 1v1 vid cap → handleIncrementRounds visar den
                        // ärliga "More rounds not available"-alerten (Premium
                        // ger INTE fler rundor i 1vs1).
                        : handleIncrementRounds}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roundsStepperBtnText, roundsCount >= stepperMax && styles.roundsStepperBtnTextDisabled]}>+</Text>
                    </TouchableOpacity>
                    {/* PREMIUM-badgen göms i 1v1-lobbyn — remote är hårt
                        cappad på 4 rundor oavsett Premium (upsell vore
                        missvisande). */}
                    {roundsCount >= stepperMax && gameMode !== 'remote-1v1' && (
                      <TouchableOpacity
                        onPress={() => Alert.alert(
                          'Premium feature',
                          'Host more than 4 rounds require QuizVibe Premium. Go to Store?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
                          ],
                        )}
                        activeOpacity={0.7}
                        style={{ backgroundColor: hasPremium ? '#F5A623' : '#6B7280', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', color: hasPremium ? '#000' : '#FFF', letterSpacing: 0.6 }}>PREMIUM</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <RoundsRuler
                      value={roundsCount}
                      min={ROUNDS_MIN}
                      gameModeMax={stepperMax}
                      // 1v1: ingen premium-klammer/badge (onPremiumPress
                      // utelämnad → RoundsRuler döljer dem) — remote är
                      // alltid max 4 rundor, ingen Premium-väg förbi.
                      onPremiumPress={gameMode === 'remote-1v1' ? undefined : () => {
                        Alert.alert(
                          'Premium feature',
                          'Host more than 4 rounds require QuizVibe Premium. Get in Store?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } }) },
                          ],
                        );
                      }}
                      hasSubscription={hasPremium}
                      indivActive={!singlePlayerDefault && gameMode === 'individual-devices'}
                    />
                  </View>
                  {/* Game mode quick-select — under RoundsRuler för snabb mode-byte.
                      EN rad med tre rutor, som huvud-Game Mode-sektionen.
                      Göms HELT i renodlade 1vs1-lobbyn (mode är låst där);
                      Remote-rutan borttagen 2026-08-07 (1vs1 nås via
                      Home-valet).
                      ⚠ Göms ÄVEN i re-match/replay-lobbyn — annars hade den
                      varit en bakväg förbi låsningen i Game Mode-sektionen
                      längre upp, och VARJE lägesbyte ejectar spelare. */}
                  {gameMode !== 'remote-1v1' && !isRematchLobby && (
                    <>
                      <View style={[styles.modeRow, { marginTop: Spacing.lg }]}>
                        {renderModeBox('single', 'Single player', true)}
                        {renderModeBox('ptp', 'Pass-the-Phone', true)}
                        {renderModeBox('indiv', 'Individual device', true, true)}
                      </View>
                    </>
                  )}
                </>
              ) : (
                // Non-host: samma rounds-display + ruler + klammer/Premium-
                // pillar som host, men utan stepper-knappar och Premium är
                // icke-klickbar (utelämnar onPremiumPress).
                <>
                  <View style={styles.roundsGuestBoxWrap}>
                    <View style={styles.roundsGuestBox}>
                      <Text style={styles.roundsGuestBoxText}>{roundsCount}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <RoundsRuler
                      value={roundsCount}
                      min={ROUNDS_MIN}
                      gameModeMax={roundsMax}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Game Sequence — ruta per rund med medie-källa och kategori.
                Speglar quiz.tsx:s 3-pool-logik baserat på aktuella inställningar.
                Synlig för alla (host + non-host) som read-only feedback. */}
            <View>
              <View style={styles.regionLabelRow}>
                <Text style={styles.sectionLabel}>Game Sequence</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() =>
                    Alert.alert(
                      'Game Sequence',
                      'Preview of which source (Spotify / YouTube / Image) and category (Music / Film / Sport) each round will use based on current settings.'
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              {/* Guest host: källorna slumpas per fråga vid spelstart (viktad
                  dragning i quiz.tsx) — previewn KAN inte veta utfallet, så
                  slots renderas som "?" + en förklarande not. Ärligare än
                  att spegla en fördelning som inte kommer stämma. */}
              {isGuestHost ? (
                <>
                  <View style={styles.gsGrid}>
                    {Array.from({ length: roundsCount }, (_, idx) => (
                      <View key={idx} style={styles.gsBox}>
                        <View style={styles.gsInlineIconWrap}>
                          <Text style={styles.gsNumber}>{idx + 1}</Text>
                          {/* Fristående ?-glyf (gsSourceQMark är absolut-
                              positionerad för Q-ring-wrappen och funkar
                              inte utanför den). */}
                          <Text style={styles.gsRandomMark}>?</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.guestHostNote}>
                    Sources randomized for Guest games
                  </Text>
                </>
              ) : (
              <View style={styles.gsGrid}>
                {gameSequencePreview.map((slot, idx) => (
                  <View key={idx} style={styles.gsBox}>
                    <View style={styles.gsInlineIconWrap}>
                      <Text style={styles.gsNumber}>{idx + 1}</Text>
                      {slot.source === 'spotify' ? (
                        <SpotifyBrandIcon size={12} variant="white" />
                      ) : slot.source === 'youtube' ? (
                        <YouTubeBrandIcon size={14} />
                      ) : slot.source === 'image' ? (
                        <View style={styles.gsSourceQWrap}>
                          <Svg width={13} height={13} viewBox="24 22 32 32">
                            <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.primary} strokeWidth="2.5" />
                            <Path d="M49 47 L53 51" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                          </Svg>
                          <Text style={styles.gsSourceQMark}>?</Text>
                        </View>
                      ) : null}
                    </View>
                    {slot.category != null && (
                      <View style={styles.gsCategoryWrap} pointerEvents="none">
                        <View style={styles.gsCategoryBadge}>
                          <Text style={styles.gsCategoryText}>{slot.category}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              )}
            </View>

            {/* Answer response time */}
            <View>
              <View style={styles.regionLabelRow}>
                <Text style={styles.sectionLabel}>Answer response time</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Alert.alert('Answer response time', 'Seconds players have to answer each question')}
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              {/* 3-knapps-rad (30/45/60). Renderas för alla i lobbyn så
                  non-host ser host:s val i real-tid; bara host kan ändra
                  (disabled={!hostMode}). Default-värdet seeds från host:s
                  profil via host-seed-effekten ovan.
                  Guest host har SAMMA val sedan 2026-08-08 (Peter) — tidigare
                  var raden låst till 60s. */}
              <View style={styles.responseRow}>
                {([30, 45, 60] as const).map((sec) => {
                  const isActive = answerResponseSeconds === sec;
                  return (
                    <Pressable
                      key={sec}
                      onPress={() => setAnswerResponseSeconds(sec)}
                      disabled={!hostMode}
                      style={({ pressed }) => [
                        styles.responseBtn,
                        isActive ? styles.responseBtnActive : styles.responseBtnInactive,
                        pressed && hostMode && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={[
                        styles.responseBtnText,
                        isActive && styles.responseBtnTextActive,
                      ]}>
                        {sec}s
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
          )}
        </View>

        </>)}{/* /customizeExpanded */}

        <TouchableOpacity
          onPress={() => mainScrollRef.current?.scrollTo({ y: 0, animated: true })}
          activeOpacity={0.7}
          style={styles.toTopBtn}
        >
          <View style={styles.toTopBox}>
            <BlinkingLabel style={styles.toTopLabel} duration={1800}>Back to the top ↑</BlinkingLabel>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Start Game — sticky bottom-bar ──────────────────────────
          Ligger utanför ScrollView:n så den alltid är synlig oavsett
          scroll-position. Kompakt row-layout (label + play-logo på samma
          rad, logo 64 istället för 140) så baren tar minimal höjd.
          Host: tappbar → handleStartGame. Non-host: passiv väntetext med
          samma gold-glowing visuella språk. */}
      <View style={styles.startStickyBar}>
        {/* Gul glödande yta som fyller hela baren runt Start Game-pillen.
            Opaciteten pulsar via samma startGlow-loop som logo-halon så
            hela bottenzonen andas i takt med CTA:n. */}
        <Animated.View
          style={[styles.startStickyBarGlow, { opacity: startGlow }]}
          pointerEvents="none"
        />
        {hostMode && gameMode === 'remote-1v1' && !singlePlayerDefault &&
         approvedPlayers.filter((p) => !p.isHost).length === 0 ? (
          /* Remote 1vs1 utan approved motståndare: Start Game ersätts av en
             HELT PASSIV väntetext (Peter 2026-08-07) — samma vokabulär som
             non-host:s "Waiting for Host to Start Game". Host delar koden
             via Share invite eller rumkoden i kortet ovan; baren byter till
             Start Game så fort motståndaren joinat och godkänts. */
          <Animated.View
            style={[styles.startGameCompactWrap, { transform: [{ scale: startPulse }] }]}
          >
            <View style={styles.startGameCompactRow} pointerEvents="none">
              <View style={styles.startGameWaitTextWrap}>
                <Text
                  style={styles.startGameWaitTextLarge}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  Wait for friend to join
                </Text>
                {/* Grå prickar — samma dämpade färg som texten så hela
                    väntestatusen läses som en enhet. */}
                <SequentialDots color={Colors.textSecondary} />
              </View>
              <View style={styles.startGameCompactLogoWrap}>
                <Animated.View
                  style={[styles.startGameCompactHalo, { opacity: startGlow }]}
                  pointerEvents="none"
                />
                <QuizVibePlayLogo size={64} color={Colors.warning} />
              </View>
            </View>
          </Animated.View>
        ) : hostMode ? (
          <Animated.View
            style={[styles.startGameCompactWrap, { transform: [{ scale: startPulse }] }]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleStartGame()}
              style={styles.startGameCompactRow}
            >
              <BlinkingLabel style={styles.startGameCompactLabel}>Start Game</BlinkingLabel>
              <View style={styles.startGameCompactLogoWrap}>
                <Animated.View
                  style={[styles.startGameCompactHalo, { opacity: startGlow }]}
                  pointerEvents="none"
                />
                <QuizVibePlayLogo size={64} color={Colors.warning} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[styles.startGameCompactWrap, { transform: [{ scale: startPulse }] }]}
          >
            <View style={styles.startGameCompactRow} pointerEvents="none">
              <View style={styles.startGameWaitTextWrap}>
                <Text style={styles.startGameWaitText}>Waiting for Host to Start Game</Text>
                {/* Grå prickar — samma dämpade färg som texten. */}
                <SequentialDots color={Colors.textSecondary} />
              </View>
              <View style={styles.startGameCompactLogoWrap}>
                <Animated.View
                  style={[styles.startGameCompactHalo, { opacity: startGlow }]}
                  pointerEvents="none"
                />
                <QuizVibePlayLogo size={64} color={Colors.warning} />
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Scroll-hint-pil — guidar ner i lobby-innehållet. Samma som
          quiz.tsx:s namn-fråge-pil (blink-puls, auto-göm vid botten).
          bottom är höjd upp så pillen svävar OVANFÖR sticky Start Game-baren. */}
      {scrollHintScrollable && !scrollHintAtBottom && (
        <Animated.View
          style={[lobbyScrollHintStyles.wrap, { opacity: scrollHintOpacity }]}
          pointerEvents="none"
        >
          <View style={lobbyScrollHintStyles.pill}>
            <Text style={lobbyScrollHintStyles.chevron}>⌄</Text>
          </View>
        </Animated.View>
      )}

      {/* Alla modaler utanför ScrollView */}
      <AddPlayerModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddPlayer}
        takenGuestLetters={takenGuestLetters}
        existingNames={new Set(players.filter(p => !p.hasLeft).map(p => p.name.trim().toLowerCase()))}
      />

      {/* ── Player-edit-sheet (host-only) ──────────────────────────
          Bottom-sheet där host kan redigera Assistance level, Competition
          Year of Birth och HCP för en spelare. HCP-fältet göms för
          guests (auto-deriveras från närmaste age-matched registrerade
          spelare). Skrivningar är garanterat lobby-lokala — inget anrop
          till saveProfile() från denna handler. */}
      <Modal
        visible={playerEditTargetId !== null}
        transparent
        animationType="slide"
        onRequestClose={closePlayerEdit}
      >
        <KeyboardAvoidingView
          style={playerEditSheet.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={playerEditSheet.backdrop} onPress={closePlayerEdit} />
          <View style={playerEditSheet.container}>
            <View style={playerEditSheet.handle} />
            <Text style={playerEditSheet.title}>Edit player</Text>
            {playerEditTarget && (
              <Text style={playerEditSheet.subtitle}>
                {playerEditTarget.name} · changes apply to this lobby only
              </Text>
            )}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flexShrink: 1, maxHeight: 360 }}
              contentContainerStyle={{ gap: Spacing.md }}
            >
              {/* Competition Year of Birth */}
              <View style={playerEditSheet.fieldGroup}>
                <Text style={playerEditSheet.fieldLabel}>Competition Year of Birth</Text>
                <TouchableOpacity
                  style={playerEditSheet.yearTrigger}
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss();
                    setEditYearPickerOpen(true);
                  }}
                >
                  <Text
                    style={[
                      playerEditSheet.yearTriggerText,
                      editBirthYear === null && playerEditSheet.yearTriggerPlaceholder,
                    ]}
                  >
                    {editBirthYear === null ? 'Select year' : (
                      editBirthYear === MIN_BIRTH_YEAR ? `${editBirthYear} or earlier`
                      : editBirthYear === MAX_BIRTH_YEAR ? `${editBirthYear} or later`
                      : String(editBirthYear)
                    )}
                  </Text>
                  <Text style={playerEditSheet.yearTriggerArrow}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Assistance level — host får fritt välja valfri nivå (lättare
                  som svårare) från spelarens default. Ingen riktnings-låsning.
                  Gäller sedan 2026-08-08 även guest host:s EGET kort (var
                  tidigare låst till Full med statisk chip + not). */}
              <View style={playerEditSheet.fieldGroup}>
                <Text style={playerEditSheet.fieldLabel}>Assistance Level</Text>
                {mutualAssistanceActive ? (
                  /* Remote 1v1 med Mutual assistance PÅ: nivån är gemensam och
                     sätts i Game Mode-sektionen — per-spelare-val här skulle
                     bara skrivas över av match-snapshotten vid Start Game. Visa
                     den gällande nivån statiskt + peka på rätt kontroll.
                     Är switchen AV faller vi igenom till den vanliga
                     per-spelare-raden nedan. */
                  <>
                    <View style={playerEditSheet.skillRow}>
                      <View style={[playerEditSheet.skillBtn, playerEditSheet.skillBtnActive]}>
                        <Text style={[playerEditSheet.skillBtnText, playerEditSheet.skillBtnTextActive]}>
                          {REMOTE_ASSISTANCE_OPTIONS.find((o) => o.id === remoteAssistance)?.label
                            ?? 'Full'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.guestHostNote}>
                      {hostMode
                        ? 'Shared by both players — change it under Game Mode.'
                        : 'Shared by both players — selected by the Host.'}
                    </Text>
                  </>
                ) : (
                <View style={playerEditSheet.skillRow}>
                  {(['full', 'standard', 'minimal'] as const).map((opt) => {
                    const isSelected = editAssistance === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          playerEditSheet.skillBtn,
                          isSelected && playerEditSheet.skillBtnActive,
                        ]}
                        onPress={() => handleSelectEditAssistance(opt)}
                      >
                        <Text
                          style={[
                            playerEditSheet.skillBtnText,
                            isSelected && playerEditSheet.skillBtnTextActive,
                          ]}
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                )}
              </View>

              {/* HCP — bara för registrerade spelare. Guest:s HCP
                  auto-deriveras från närmaste age-matched registrerade
                  spelare och kan inte editeras direkt. */}
              {/* HCP-fält + Guest HCP-not borttagna 2026-05-25 — HCP är
                  inte en del av V1 release. handleSavePlayerEdit:s
                  HCP-validering är död kod tills v2 reaktiverar feature:n.
                  editHcpValue-state samt MIN_HCP-import lämnas kvar för
                  enkel reaktivering. */}
            </ScrollView>

            <TouchableOpacity onPress={handleSavePlayerEdit} style={playerEditSheet.saveBtn}>
              <Text style={playerEditSheet.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closePlayerEdit} style={playerEditSheet.cancelBtn}>
              <Text style={playerEditSheet.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Year picker overlay (inom samma Modal — inga nested native-modals) */}
          {editYearPickerOpen && (
            <View style={playerEditSheet.yearPickerOverlay}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setEditYearPickerOpen(false)}
              />
              <View style={playerEditSheet.yearPickerSheet}>
                <View style={playerEditSheet.yearPickerHandle} />
                <Text style={playerEditSheet.title}>Select Year of Birth</Text>
                <ScrollView style={{ maxHeight: 360 }}>
                  {BIRTH_YEARS.map((year) => {
                    const selected = editBirthYear === year;
                    const label =
                      year === MIN_BIRTH_YEAR ? `${year} or earlier`
                      : year === MAX_BIRTH_YEAR ? `${year} or later`
                      : String(year);
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[playerEditSheet.yearItem, selected && playerEditSheet.yearItemSelected]}
                        onPress={() => {
                          setEditBirthYear(year);
                          setEditYearPickerOpen(false);
                        }}
                      >
                        <Text style={[playerEditSheet.yearItemText, selected && playerEditSheet.yearItemTextSelected]}>
                          {label}
                        </Text>
                        {selected && <Text style={playerEditSheet.yearItemCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={() => setEditYearPickerOpen(false)} style={playerEditSheet.cancelBtn}>
                  <Text style={playerEditSheet.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
      <RegionModal
        visible={regionModalOpen}
        value={region}
        onChange={setRegion}
        onClose={() => setRegionModalOpen(false)}
      />

      {/* ── Share invite modal ──────────────────────────────────── */}
      <Modal
        visible={shareModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={shareSheet.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={shareSheet.backdrop}
            activeOpacity={1}
            onPress={() => setShareModalOpen(false)}
          />
          <View style={shareSheet.container}>
            <View style={shareSheet.handle} />
            <Text style={shareSheet.title}>Share invite</Text>
            <Text style={shareSheet.subtitle}>
              Add a QuizVibe friend or invite an existing one to this lobby.
            </Text>

            {/* QuizVibe friends section label */}
            <View style={shareSheet.sectionLabelRow}>
              <QuizVibeFriendsLogo size={28} />
              <Text style={shareSheet.sectionLabel}>QuizVibe friends</Text>
            </View>

            {/* Add by Player Name — speglar Profile:s friends-modal så host
                kan lägga till en friend direkt från lobby utan att hoppa
                till Profile. Efter Add hamnar friend:en i listan nedan med
                en Invite-knapp redo att tappas. */}
            <View style={shareSheet.addRow}>
              <TextInput
                style={shareSheet.addInput}
                placeholder="Add by Player Name"
                placeholderTextColor={Colors.textDisabled}
                value={newFriendPlayerName}
                onChangeText={setNewFriendPlayerName}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleAddFriendFromShare}
              />
              <Pressable
                onPress={handleAddFriendFromShare}
                disabled={!newFriendPlayerName.trim()}
                style={({ pressed }) => [
                  shareSheet.addBtn,
                  !newFriendPlayerName.trim() && shareSheet.addBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={shareSheet.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {friends.length === 0 ? (
              <View style={shareSheet.emptyState}>
                <Text style={shareSheet.emptyText}>No friends saved yet</Text>
                <Text style={shareSheet.emptySubtext}>
                  Add a Player Name above to invite them with one tap.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                {friends.map((friend, i) => {
                  const invited = invitedFriendIds.has(friend.id);
                  return (
                    <View key={friend.id}>
                      <View style={shareSheet.friendRow}>
                        <Text style={shareSheet.friendEmoji}>
                          {getAvatarEmojiById(friend.avatarId)}
                        </Text>
                        <Text style={shareSheet.friendName}>{friend.playerName}</Text>
                        <TouchableOpacity
                          onPress={() => handleInviteFriend(friend)}
                          disabled={invited}
                          style={[
                            shareSheet.inviteBtn,
                            invited && shareSheet.inviteBtnDone,
                          ]}
                        >
                          <Text
                            style={[
                              shareSheet.inviteBtnText,
                              invited && shareSheet.inviteBtnTextDone,
                            ]}
                          >
                            {invited ? '✓ Invited' : 'Invite'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {i < friends.length - 1 && <View style={shareSheet.divider} />}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => setShareModalOpen(false)}
              style={shareSheet.closeBtn}
            >
              <Text style={shareSheet.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Guest leave-room sheet ───────────────────────────────────
          Bottom-sheet som speglar Profile-skärmens logout-sheet (avatar +
          namn + status, röd primär-knapp, Cancel). Visas bara när tap
          sker på guest-pillen i TopUserBanner — gating sker via onPress-
          branchen ovan, så själva Modal:en kan stå alltid mounted med
          visible-flag. */}
      <Modal
        visible={guestLeaveSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGuestLeaveSheetVisible(false)}
      >
        <View style={styles.guestLeaveOverlay}>
          <Pressable
            style={styles.guestLeaveBackdrop}
            onPress={() => setGuestLeaveSheetVisible(false)}
          />
          <View style={styles.guestLeaveSheet}>
            {(() => {
              // Visa-data hämtas från own-player i players[] (sätts av auto-add-
              // useEffect:en via ownPlayerIdRef). Funkar identiskt för guest
              // (👤 + guestName) som registrerad non-host (profile-emoji + playerName)
              // — vi behöver inte greina på flow eftersom kortet bär datan.
              const ownPlayer = players.find((p) => p.id === ownPlayerIdRef.current);
              const displayEmoji = ownPlayer?.emoji ?? '👤';
              const displayName = ownPlayer?.name ?? guestName?.trim() ?? 'You';
              const displayStatus = ownPlayer?.type === 'guest' ? 'Guest' : 'Player';
              return (
                <View style={styles.guestLeaveHeader}>
                  <Text style={styles.guestLeaveHeaderEmoji}>{displayEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestLeaveHeaderName}>{displayName}</Text>
                    <Text style={styles.guestLeaveHeaderStatus}>{displayStatus}</Text>
                  </View>
                </View>
              );
            })()}

            {/* Remote 1v1: spara lobbyn istället för att lämna den —
                spelaren behåller sin plats i rostern och hittar lobbyn
                igen under Remote Play History → Not started. Ligger ovanför
                den röda destruktiva knappen. */}
            {isRemoteLobby && (
              <Pressable
                style={({ pressed }) => [
                  styles.saveLobbyBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => { void handleSaveRemoteLobby(false); }}
              >
                <Text style={styles.saveLobbyBtnText}>Save 1vs1 — Play later</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.guestLeaveBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleGuestLeaveRoom}
            >
              <Text style={styles.guestLeaveBtnText}>Leave Game Lobby — Go to Home</Text>
            </Pressable>

            <Pressable
              style={styles.guestLeaveCancelBtn}
              onPress={() => setGuestLeaveSheetVisible(false)}
            >
              <Text style={styles.guestLeaveCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Host delete-lobby sheet ───────────────────────────────────
          Speglar guest leave-sheet:s layout exakt — samma styling-
          klasser återanvänds (guestLeave*) eftersom färg/form är
          identiska, bara handler-knappen och status-texten skiljer.
          Visas bara när tap sker på host:s TopUserBanner-pill. */}
      <Modal
        visible={hostDeleteSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHostDeleteSheetVisible(false)}
      >
        <View style={styles.guestLeaveOverlay}>
          <Pressable
            style={styles.guestLeaveBackdrop}
            onPress={() => setHostDeleteSheetVisible(false)}
          />
          <View style={styles.guestLeaveSheet}>
            {(() => {
              // Host-spelarkortet (id '1' efter mergeProfileIntoHost) bär
              // användarens profil-data. Hämtar därifrån för konsistens.
              const hostPlayer = players.find((p) => p.isHost);
              const displayEmoji = hostPlayer?.emoji ?? '👑';
              const displayName = hostPlayer?.name ?? 'Host';
              return (
                <View style={styles.guestLeaveHeader}>
                  <Text style={styles.guestLeaveHeaderEmoji}>{displayEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guestLeaveHeaderName}>{displayName}</Text>
                    <Text style={styles.guestLeaveHeaderStatus}>Host</Text>
                  </View>
                </View>
              );
            })()}

            {/* Remote 1v1: host kan parkera lobbyn istället för att radera
                den — rummet lever kvar sina 24h och koden är fortsatt
                joinbar, så motståndaren hinner ansluta under tiden. */}
            {isRemoteLobby && (
              <Pressable
                style={({ pressed }) => [
                  styles.saveLobbyBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => { void handleSaveRemoteLobby(true); }}
              >
                <Text style={styles.saveLobbyBtnText}>Save 1vs1 — Play later</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.guestLeaveBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleDeleteLobby}
            >
              <Text style={styles.guestLeaveBtnText}>Delete this Game Lobby</Text>
            </Pressable>

            <Pressable
              style={styles.guestLeaveCancelBtn}
              onPress={() => setHostDeleteSheetVisible(false)}
            >
              <Text style={styles.guestLeaveCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── "No approved players"-dialog (Start Game-guard) ───────────
          Custom centrerad dialog istället för Alert så "Approve players"
          kan vara utgråad när det inte finns några andra spelare alls i
          lobbyn (varken godkända eller väntande). Cancel stänger bara
          dialogen — host står kvar i lobbyn oförändrat. */}
      <Modal
        visible={noApprovedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoApprovedModalVisible(false)}
      >
        <View style={styles.noApprovedOverlay}>
          <Pressable
            style={styles.guestLeaveBackdrop}
            onPress={() => setNoApprovedModalVisible(false)}
          />
          <View style={styles.noApprovedCard}>
            <Text style={styles.noApprovedTitle}>No approved players</Text>
            <Text style={styles.noApprovedMessage}>
              You have not approved any other players. Either approve players
              or switch to single player mode.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.noApprovedBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                setNoApprovedModalVisible(false);
                setSinglePlayerDefault(true);
              }}
            >
              <Text style={styles.noApprovedBtnText}>
                Switch to single player
              </Text>
            </Pressable>

            {(() => {
              // Utgråad när inga andra spelare finns i lobbyn — det finns
              // då ingen att godkänna. hasLeft-spelare räknas inte.
              const hasOtherPlayers = players.some(
                (p) => !p.isHost && !p.hasLeft,
              );
              return (
                <Pressable
                  disabled={!hasOtherPlayers}
                  style={({ pressed }) => [
                    styles.noApprovedBtn,
                    !hasOtherPlayers && styles.noApprovedBtnDisabled,
                    pressed && hasOtherPlayers && { opacity: 0.85 },
                  ]}
                  onPress={() => {
                    // Stäng dialogen + öppna Players-sektionen så host
                    // landar direkt vid listan med väntande spelare.
                    setNoApprovedModalVisible(false);
                    setPlayersExpanded(true);
                  }}
                >
                  <Text
                    style={[
                      styles.noApprovedBtnText,
                      !hasOtherPlayers && styles.noApprovedBtnTextDisabled,
                    ]}
                  >
                    Approve players
                  </Text>
                </Pressable>
              );
            })()}

            <Pressable
              style={styles.guestLeaveCancelBtn}
              onPress={() => setNoApprovedModalVisible(false)}
            >
              <Text style={styles.guestLeaveCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Join-approval-popup (host) ────────────────────────────────
          Visas automatiskt när en ny unapproved joiner upptäcks (via
          watcher-effekten på players[]). En modal åt gången — kön i
          joinPopupQueue shiftas av varje action. "Approve + Add to
          Friend list" bara för registrerade joiners (guest-namn är
          efemära) och aldrig för guest host (ingen friends-lista).
          Backdrop/Android-back = Later (spelaren ligger kvar i "To be
          Approved by Host"-listan). */}
      <Modal
        visible={hostMode && !!joinPopupPlayer}
        transparent
        animationType="fade"
        onRequestClose={handleJoinPopupLater}
      >
        <View style={styles.noApprovedOverlay}>
          <Pressable
            style={styles.guestLeaveBackdrop}
            onPress={handleJoinPopupLater}
          />
          {joinPopupPlayer && (
            <View style={styles.noApprovedCard}>
              <View style={styles.joinApprovalHeader}>
                <View style={styles.joinApprovalAvatar}>
                  {joinPopupPlayer.avatarUri ? (
                    <Image
                      source={{ uri: joinPopupPlayer.avatarUri }}
                      style={styles.joinApprovalAvatarImg}
                    />
                  ) : (
                    <Text style={styles.joinApprovalAvatarEmoji}>
                      {joinPopupPlayer.emoji ?? '👤'}
                    </Text>
                  )}
                </View>
                <Text style={styles.joinApprovalName} numberOfLines={1}>
                  {joinPopupPlayer.name}
                </Text>
              </View>
              <Text style={styles.noApprovedMessage}>
                wants to join this lobby
                {joinPopupQueue.length > 1
                  ? ` · +${joinPopupQueue.length - 1} more waiting`
                  : ''}
              </Text>

              {joinPopupPlayer.type === 'registered' && !isGuestHost && (
                <Pressable
                  style={({ pressed }) => [
                    styles.noApprovedBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleJoinPopupApproveAndFriend}
                >
                  <Text style={styles.noApprovedBtnText}>
                    Approve + Add to Friend list
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.noApprovedBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleJoinPopupApprove}
              >
                <Text style={styles.noApprovedBtnText}>Approve</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.joinApprovalDenyBtn,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleJoinPopupDeny}
              >
                <Text style={styles.joinApprovalDenyText}>
                  Deny — remove from lobby
                </Text>
              </Pressable>

              <Pressable
                style={styles.guestLeaveCancelBtn}
                onPress={handleJoinPopupLater}
              >
                <Text style={styles.guestLeaveCancelText}>Later</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* ── "Remote Play started — 1vs1"-popup ────────────────────────
          Custom modal (inte native Alert) så rubriken "Play" kan stå
          ovanför knapp-raden. Samma card-vokabulär som noApproved-/
          join-approval-dialogerna. Ingen backdrop-dismiss och ingen
          Android-back-stängning — spelaren MÅSTE välja Now eller Later
          (matchen är redan skapad server-side i båda fallen). */}
      <Modal
        visible={!!remoteStartPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => { /* måste välja Now/Later */ }}
      >
        <View style={styles.noApprovedOverlay}>
          <View style={styles.guestLeaveBackdrop} pointerEvents="none" />
          {remoteStartPrompt && (
            <View style={styles.noApprovedCard}>
              <Text style={styles.noApprovedTitle}>Remote Play started — 1vs1</Text>
              <Text style={styles.noApprovedMessage}>{remoteStartPrompt.message}</Text>
              <Text style={styles.remoteStartPlayLabel}>Play</Text>
              <View style={styles.remoteStartBtnRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.noApprovedBtn,
                    styles.remoteStartBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => {
                    const go = remoteStartPrompt.playNow;
                    setRemoteStartPrompt(null);
                    go();
                  }}
                >
                  <Text style={styles.noApprovedBtnText}>Now</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.noApprovedBtn,
                    styles.remoteStartBtn,
                    styles.remoteStartLaterBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => {
                    setRemoteStartPrompt(null);
                    router.replace('/');
                  }}
                >
                  <Text style={styles.noApprovedBtnText}>Later</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ── Deleting-lobby loading-overlay ────────────────────────────
          Visar processing-feedback under tiden mellan host:s Yes-
          konfirmation och navigation till Home. cancelable:false så
          host:en inte kan tap:a runt om — vänta tills den färdig. */}
      <Modal
        visible={deletingLobby}
        transparent
        animationType="fade"
      >
        <View style={styles.deletingOverlay}>
          <View style={styles.deletingCard}>
            <View style={styles.deletingTextRow}>
              <Text style={styles.deletingText}>Please Wait — Deleting this Lobby</Text>
              <WaveDots />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Spotify DJ guide modal ──────────────────────────────────────
          Visas när användaren tappar "Guide How it works" i Spotify-raden.
          Plan B (2026-07-22): ingen kontokoppling — bara Spotify-appen. */}
      <Modal
        visible={spotifyGuideVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSpotifyGuideVisible(false)}
      >
        <View style={styles.spotifyGuideOverlay}>
          <Pressable
            style={styles.spotifyGuideBackdrop}
            onPress={() => setSpotifyGuideVisible(false)}
          />
          <View style={styles.spotifyGuideSheet}>
            <Text style={styles.spotifyGuideTitle}>
              How Spotify DJ works
            </Text>
            <View style={styles.spotifyGuideSteps}>
              <View style={styles.spotifyGuideStep}>
                <Text style={styles.spotifyGuideStepNumber}>1</Text>
                <Text style={styles.spotifyGuideStepText}>
                  Have the Spotify app installed on your device — free or Premium
                </Text>
              </View>
              <View style={styles.spotifyGuideStep}>
                <Text style={styles.spotifyGuideStepNumber}>2</Text>
                {/* Citerar attest-radens EXAKTA label (se spotifyLinkText-raden
                    i Source Mixerboard) — texten sa tidigare Tap "I have the
                    Spotify app", vilket varken matchade labeln eller att
                    kontrollen är en switch. Sträng-expression i stället för
                    JSX-text så citattecknen inte triggar
                    react/no-unescaped-entities. */}
                <Text style={styles.spotifyGuideStepText}>
                  {'Switch on "I have Spotify App on this device" to confirm — now you are ready to play Spotify music in Individual device mode'}
                </Text>
              </View>
              <View style={styles.spotifyGuideStep}>
                <Text style={styles.spotifyGuideStepNumber}>3</Text>
                <Text style={styles.spotifyGuideStepText}>
                  When you are the DJ, tap Start track in Spotify — the song opens in your Spotify app. If it does not start automatically, press Play in Spotify
                </Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.spotifyGuideCloseBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setSpotifyGuideVisible(false)}
            >
              <Text style={styles.spotifyGuideCloseBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Scroll-hint-pil — speglar quiz.tsx:s scrollHintStyles 1:1 (blå pill + vit ⌄).
const lobbyScrollHintStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // Sticky Start Game-baren är ~96 px hög — pillen placeras strax ovanför
    // så den inte täcker Start Game-CTA:n.
    bottom: 104,
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
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    // Golden glow — guld shadow med 0 offset ger en jämn glöd runt pillen.
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  chevron: {
    fontSize: 32,
    lineHeight: 32,
    // Mörk glyph på guld (samma vokabulär som Start Game-knappens text på guld).
    color: Colors.background,
    fontWeight: '900',
    marginTop: -10,
  },
});

const styles = StyleSheet.create({
  // ── Guest leave-room sheet (speglar ProfileScreen.logout-sheet —
  //     samma shell/typografi/färgpalett. Status-texten är textSecondary
  //     istället för Colors.success eftersom guest INTE är inloggad.) ─
  guestLeaveOverlay: { flex: 1, justifyContent: 'flex-end' },
  guestLeaveBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  guestLeaveSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestLeaveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestLeaveHeaderEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  guestLeaveHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guestLeaveHeaderStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guestLeaveBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLeaveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  // "Save 1vs1 — Play later" (remote-lobbies) — exakt samma geometri och
  // typografi som guestLeaveBtn/guestLeaveBtnText nedanför, men i grönt:
  // åtgärden är bevarande, inte destruktiv. Grön ram + ljus grön botten +
  // stark grön text speglar den rödas ram/botten/text-uppdelning.
  saveLobbyBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.successMuted,
    borderWidth: 1,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLobbyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  guestLeaveCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  guestLeaveCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // "No approved players"-dialog — centrerad card-dialog (ersätter
  // native Alert som inte kan grå-ut enskilda knappar). Delar backdrop-
  // och Cancel-styling med guestLeave-sheeten.
  noApprovedOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  noApprovedCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  noApprovedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  noApprovedMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  noApprovedBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noApprovedBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderStrong,
  },
  noApprovedBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noApprovedBtnTextDisabled: {
    color: Colors.textDisabled,
  },

  // "1vs1 match started"-popupens knapp-rad. "Play"-rubriken står som
  // egen rad ovanför de två 50/50-knapparna (Now = primär blå outline,
  // Later = dämpad grå outline).
  remoteStartPlayLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  remoteStartBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  remoteStartBtn: {
    flex: 1,
  },
  remoteStartLaterBtn: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderStrong,
  },

  // Join-approval-popup — delar overlay/card/knapp-vokabulär med
  // noApproved-dialogen ovan. Header = avatar-cirkel + joiner-namn;
  // Deny-knappen är en röd outline-variant av noApprovedBtn.
  joinApprovalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  joinApprovalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  joinApprovalAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  joinApprovalAvatarEmoji: {
    fontSize: 22,
  },
  joinApprovalName: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  joinApprovalDenyBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinApprovalDenyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },

  // Deleting-lobby loading-overlay — täcker hela skärmen med dimmad
  // backdrop, centrerar ett card med "Please Wait — Deleting this Lobby"
  // + tre animerade våg-prickar.
  deletingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deletingTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  deletingText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },

  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl, flexGrow: 1 },

  // Lobby-header — title vänster, Host Game Credits-pill höger.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    // Sista-utvägs-ventil: får raden ändå inte plats (stor Dynamic Type
    // ovanpå Display Zoom) hoppar credits-pillen ned på egen rad i stället
    // för att klippas i högerkanten. `marginLeft: 'auto'` på pillen håller
    // den högerställd i BÅDA fallen (space-between räcker bara på en rad).
    flexWrap: 'wrap',
    rowGap: Spacing.sm,
  },
  // Non-host: "Music. Film. Sport." på samma rad som Game Lobby (höger).
  headerTagline: {
    flexShrink: 1,
    fontSize: 19,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'right',
  },
  // Speglar Profile:s creditsPill 1:1 (samma styling, samma layout) så
  // pillen ser identisk ut i båda vyerna och användaren känner igen den.
  creditsPill: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: NARROW_SCREEN ? Spacing.sm : Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    // Större gap mellan label och values-row så Extras-boxens kant-
    // skärande PREMIUM-badge (top:-7) inte överlappar "HOST GAME CREDITS"-
    // texten ovanför.
    gap: 8,
    // 160 pt + 24 pt padding + 24 px-titeln spränger 288 pt-raden på en
    // 320 pt-skärm → pillens högerkant klipptes. 140 räcker för labeln
    // ("HOST GAME CREDITS" ≈ 116 pt vid 10 px + 0.6 letterSpacing).
    minWidth: NARROW_SCREEN ? 140 : 160,
    flexShrink: 1,
    // Håller pillen högerställd även när headern wrappar (se `header`).
    marginLeft: 'auto',
    position: 'relative',
  },
  // Gold-framed-variant av pillen när host har aktiv membership-prenu-
  // meration. Border + kantskärande MEMBERSHIP-badge signalerar att
  // credits inte räknas ner (handleStartGame skippar deduktionen).
  // Border-färgen byts till gold (samma `#F5A623` som premium-badges
  // använder); border-bredden bumpas till 2 så ramen syns tydligare.
  creditsPillMembership: {
    borderWidth: 2,
    borderColor: '#F5A623',
  },
  // Wrap för MEMBERSHIP-badgen — absolut-positionerad ovanför pillens
  // topp-border (top: -8). Höger-anchorad (right: 12) istället för
  // centrerad så badgen inte krockar med "HOST GAME CREDITS"-labeln.
  // pointerEvents: 'none' så outer pillens onPress (Store) fortfarande
  // fyrar när användaren tappar i badge-zonen.
  creditsMembershipBadgeWrap: {
    position: 'absolute',
    top: -8,
    right: 12,
    zIndex: 10,
    elevation: 4,
  },
  creditsMembershipBadge: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  creditsMembershipBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#000',
  },
  // Låst variant — grå bg + vit text. Samma vokabulär som premiumBadgeGrey
  // på Max 12-rutan och Rounds-rulerns badge, så "grått = ej upplåst" läses
  // likadant överallt i appen.
  creditsMembershipBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  creditsMembershipBadgeTextGrey: {
    color: '#FFF',
  },
  creditsLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  creditsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsKey: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  creditsValueFree: {
    color: Colors.success,
  },
  // Premium-hostens "Unlimited" — samma guld som PREMIUM-badgen + pillens
  // ram, så hela pillen läses som ett guld-tema när prenumerationen är aktiv.
  creditsValueUnlimited: {
    color: '#F5A623',
  },
  creditsValueExtras: {
    color: '#F5A623',
  },
  creditsArrow: { fontSize: 16, color: Colors.primary, marginLeft: 2 },
  // Extras-ruta inom pillen — speglar Profile:s creditsExtrasBox 1:1.
  creditsExtrasBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingRight: 18,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 6,
    position: 'relative',
  },
  creditsExtrasBoxActive: {
    borderColor: '#F5A623',
  },
  creditsExtrasBoxInactive: {
    borderColor: '#6B7280',
  },
  // Kant-skärande PREMIUM-badge (top:-7) — speglar Profile:s motsvarande
  // badge så de ser identiska ut i båda vyerna.
  creditsExtrasPremiumBadge: {
    position: 'absolute',
    top: -7,
    right: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    zIndex: 10,
    elevation: 4,
  },
  creditsExtrasPremiumBadgeActive: {
    backgroundColor: '#F5A623',
  },
  creditsExtrasPremiumBadgeInactive: {
    backgroundColor: '#6B7280',
  },
  creditsExtrasPremiumBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  creditsExtrasPremiumBadgeTextActive: {
    color: '#000',
  },
  creditsExtrasPremiumBadgeTextInactive: {
    color: '#FFF',
  },
  // flexShrink så titeln ger efter före pillen när raden är trång; 20 px på
  // smala skärmar frigör ~22 pt så pillen får plats i sin helhet.
  screenTitle: {
    fontSize: NARROW_SCREEN ? 20 : 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },

  // "You are the host" — centrerad rubrik med cross-fade animation.
  hostBadge: { alignSelf: 'stretch', marginTop: -Spacing.sm, marginBottom: Spacing.sm, height: 26 },
  hostBadgeInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hostBadgeOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  hostBadgeText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  hostBadgeTextGold: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.warning },

  // paddingBottom override:ar Card:ens uniforma Spacing.xl-padding → minskar
  // avståndet mellan Share invite-rutan och kortets nederkant.
  roomCard: { alignItems: 'center', paddingBottom: Spacing.lg },
  // Logga + Room Code-stack på en rad. Stacken har `flex: 1` och en
  // matchande spacer på höger sida så Room Code-numret hamnar centrerat
  // i kortet samtidigt som loggan ligger vänsterställd. width: '100%' så
  // raden fyller hela inner-bredden av Card:en (overrides parent:s
  // alignItems: 'center').
  // Stacken centreras mot hela kortets bredd via justifyContent. Loggan
  // ligger utanför raden (absolut i Card:s övre vänstra hörn) så raden
  // behöver inte reservera flex-utrymme för den.
  roomCodeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // För icke-host saknas host-badgen som annars knuffar ner cell-raden.
  // Labeln är absolut-positionerad (roomLabelGuestAbsolute) med top: 29 +
  // höjd ~24 → label-bottom vid y≈53. marginTop placerar cell-raden
  // strax under labeln; värdet är empiriskt finjusterat så cellerna inte
  // ligger för långt ner i kortet.
  // marginTop justerad i takt med roomLabelGuestAbsolute.top så label-cells-
  // gapet bevaras när hela block:et flyttas ned för att ge plats åt
  // "You are invited"-badge:n ovanför.
  roomCodeRowGuestSpacing: { marginTop: 64 },
  // Host: skjut ned "Room Code"-labeln + cellerna så de klarar QuizVibe-loggan
  // (104px) i kortets övre vänstra hörn — annars går AA-11-AA in i loggan.
  // Mindre än guest-spacing (64) eftersom host-rubriken "You are the host"
  // redan tar lite toppyta.
  roomCodeRowHostSpacing: { marginTop: 18 },
  // Loggan pinnas i Card:s övre vänstra hörn. top/left: 0 = inkant av
  // Card:s padding-edge (RN positionerar absolute children från padding-
  // edge, inte content-edge). Negativa offsets drar in loggan i själva
  // padding-zonen så den hamnar närmare Card:s rundade kant.
  roomCodeLogoWrap: {
    position: 'absolute',
    top: -Spacing.sm,
    left: -Spacing.sm,
  },
  roomCodeStack: { alignItems: 'center' },
  roomLabel: { ...Typography.overline, color: Colors.textSecondary, marginBottom: Spacing.sm },
  // Guest-label position och utseende. Pinnas absolut i Card:ens övre del
  // så vertikalpositionen blir helt deterministisk (oberoende av flex/
  // line-height-quirks). top är beräknat så label-mitten landar på
  // loggans visuella mitt:
  //   • Loggan: top=-Spacing.sm=-8, höjd 104. SVG synlig center vid cy=38
  //     i 80-unit viewBox → 38/80 × 104 = 49.4 från logg-topp.
  //   • Logo center y i padded coords = -8 + 49.4 ≈ 41
  //   • Label center y = top + halv label-höjd (~12 för fontSize 20)
  //   • top ≈ 41 - 12 = 29
  // left/right: 0 + textAlign center ger horisontell centrering över hela
  // kortets bredd.
  roomLabelGuestAbsolute: {
    ...Typography.overline,
    fontSize: FontSize.xxl,
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    position: 'absolute',
    // top justerad från 27 → 39 för att ge tydligt mellanrum mellan
    // "You are invited"-badge:n (top ~6, bottom ~27) och denna label.
    // Logo-mitt-alignment-constraint:en (tidigare y≈41) prioriteras
    // numera lägre eftersom badge+label är primär visuell stack och
    // läses som en grupp ovanför kod-cellerna.
    top: 39,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  // Kontext-pill ovanför "Room Code" för non-hosts. Speglar hostBadge:s
  // styling exakt (primaryMuted bg + primaryBorder kant + xs-font + primary-
  // färg) så host- och guest-vyn känns visuellt "lika" på sin respektive
  // identitets-rad. Wrap är absolut-positionerad och centrerar badge:n
  // horisontellt via alignItems: 'center'; top: 6 placerar den direkt under
  // card-padding-top:en utan att kollidera med loggans yta (loggan är
  // vänsterställd så center-aligned content landar visuellt på dess höger).
  guestInvitedBadgeWrap: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guestInvitedBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  guestInvitedBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  // Cell-rad för rumskoden — speglar Join-modalens "Enter Room Code"-cells
  // i fyllt läge. Storleken (36×50) håller raden tillräckligt smal för att
  // logga + cell-rad ska få plats sida vid sida i den centrerade stacken.
  roomCodeCellsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  roomCodeCell: {
    width: 36,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomCodeCellText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  roomCodeCellDash: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
  shareBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primaryBorder },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  // Brand-tagline i room code-kortet — speglar startskärmens tagline-format
  // (textSecondary, letterSpacing 0.2) men i större font (20 vs 15).
  // marginTop = kortets bottenpadding (Spacing.xl) så avståndet text→Share invite
  // matchar avståndet text→kortets nederkant (border).
  // Glowing gold tagline — guld-text (Colors.warning) med matchande
  // text-shadow-glow. Opacity-pulsen ovanpå ger en levande "glödande" känsla.
  roomTagline: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 19,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  section: { gap: Spacing.sm },

  // Wrapper-container runt Game Mode + Game Connections — markerar dem som
  // en sammanhängande "spelregler"-grupp. Använder samma kort-bakgrund
  // (Colors.card + diskret border) som playerBoard nedanför, så de två
  // grupperingarna visuellt matchar varandra. position:'relative' så
  // definedByHostBadge:n förankras till ramen för icke-host.
  gameSettingsBorder: {
    position: 'relative',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  // Quiz Settings — speglar gameSettingsBorder. Game Era + Number of
  // Rounds samlas i en gemensam ram så de visuellt läses som en grupp
  // av host-kontrollerade quiz-inställningar. position:'relative' så
  // border-cutting badge:n (definedByHostBadge) hamnar över ramens
  // top-border när non-host.
  quizSettingsBorder: {
    position: 'relative',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  // "DEFINED BY HOST"-badge som skär gameSettingsBorder/quizSettingsBorder:s
  // top-border — samma border-cutting-teknik som FREE/PREMIUM-badges i Game
  // Mode. Solid brand-blå bg (Colors.primary) för att signalera host-kontroll
  // tydligt. Ingen transparens.
  definedByHostBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  definedByHostBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },

  // Game Mode toggle (Pass-the-Phone vs Individual Devices) — yttre container
  // som håller två permanenta inre rutor side-by-side.
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    // 56 (höjt från 46) så de tre smalare rutorna rymmer 2-raders-labels
    // ("Pass-the-Phone", "Individual device") + FREE-badgen ovanför.
    height: 56,
    gap: 4,
  },
  // Grå rubriker över Single device- resp. Multiplayer-grupperna.
  gameModeGroupLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  gameModeGroupLabelSpaced: {
    marginTop: Spacing.md,
  },
  // Multiplayer mode-rubrik + info-ikon på en rad.
  multiplayerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    marginBottom: 8,
  },
  // Players-rubrik + info-ikon på en rad.
  playersLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  // Region Scope-rubrik + info-ikon på en rad.
  regionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Info-rader under multiplayer-rutorna (Pass-the-Phone / Individual device).
  modeInfoLine: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  // Rad som håller game-mode-rutorna. Transparent (ingen segment-container) —
  // rutorna är fristående bordered boxar med egen FREE-badge.
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Bas-stil för game-mode-rutorna. Fast höjd 38 = samma som Generic-/Add
  // host packages-rutorna (addPackageBtn) så alla val-rutor är enhetliga.
  // Kant-/bg-färg sätts av varianterna nedan.
  modeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    height: 38,
    paddingHorizontal: 4,
    position: 'relative',
  },
  // Inaktiv ruta — svag grå kantlinje, transparent bg. Används för båda alternativen
  // när de inte är valda (samt för Individual Devices så länge premium saknas).
  modeOptionInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  // Dämpad variant — appliceras på Pass-the-Phone-rutan när
  // singlePlayerDefault-checkboxen är på. Matchar modeOptionInactive
  // (samma grå border) så Pass-the-Phone i låst läge ser likadant ut
  // som Individual Devices i sitt inaktiva läge.
  modeOptionDimmed: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  // Pass-the-Phone aktiv (gratis-läge) — grön kant, muted bg.
  modeOptionPassActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.primaryMuted,
  },
  // Individual Devices aktiv MED premium — "lit" blå kant (samma som
  // startskärmens primary-knappar), muted bg.
  modeOptionIndivActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  // Guld-tonad aktiv variant — Individual Devices för host med premium-paket
  // OCH läget är aktivt valt. Speglar PREMIUM-badge:s guldfärg så toggle-
  // rutan, badge:n och texten bildar ett samlat "premium-läge"-uttryck.
  // Host kan ha Premium men ändå köra Pass-the-Phone eller Single Play —
  // i de fallen renderas IndDev-rutan grå (modeOptionInactive) trots Premium.
  modeOptionPremiumActive: {
    borderColor: '#F5A623',
    backgroundColor: Colors.primaryMuted,
  },
  // FREE-badge som skär den gröna kantlinjen — samma teknik som HOST-taggen i
  // PlayerRow och Register-knappen i Profile-menyn.
  freeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  // Dämpad FREE-badge — appliceras tillsammans med modeOptionDimmed
  // när singlePlayerDefault är på, så badgen signalerar "låst" istället
  // för "tillgängligt gratis".
  freeBadgeDimmed: {
    backgroundColor: '#6B7280',
  },
  freeBadgeTextDimmed: {
    color: '#FFF',
  },
  // PREMIUM-badge i guld — markerar att Individual Devices kräver paketet.
  // Försvinner när användaren har premium aktivt.
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.sm,
    backgroundColor: '#F5A623',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.6,
  },
  // Grå variant av PREMIUM-badge — appliceras när host inte köpt paketet än.
  // Guld signalerar "tillgängligt", grått signalerar "låst tills du köper".
  premiumBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  premiumBadgeTextGrey: {
    color: '#FFF',
  },
  modeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  modeLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  // Guld-tonad aktiv label — Individual Devices för host med premium-paket.
  modeLabelActivePremium: {
    color: '#F5A623',
    fontWeight: FontWeight.semibold,
  },
  // Aktiv label-stil för Pass-the-Phone när läget är gratis (grön pill).
  // Vit text för bättre kontrast mot den muted bakgrunden + grön kantlinje.
  modeLabelActiveFree: {
    color: '#FFF',
    fontWeight: FontWeight.semibold,
  },
  // Dämpad text-label på Pass-the-Phone när singlePlayerDefault är på.
  modeLabelDimmed: {
    color: Colors.textSecondary,
  },
  // "Use single player mode as default"-rad ovanför Game Mode-toggle:n.
  singlePlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  singlePlayerCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singlePlayerCheckboxChecked: {
    backgroundColor: Colors.borderStrong,
    borderColor: Colors.borderStrong,
  },
  singlePlayerCheckmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  singlePlayerLabel: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  // "Multiplayer mode"-klammer under Game Mode-toggle:n. Speglar
  // Profile:s motsvarande klammer och Lobby:s Number of Rounds-bracket
  // (`roundsRulerStyles.bracket`) i form, mått och färg.
  multiplayerBracketWrap: {
    marginTop: 4,
    alignItems: 'center',
  },
  multiplayerBracket: {
    alignSelf: 'stretch',
    height: 10,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#6B7280',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  multiplayerBracketLabel: {
    marginTop: 0,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  modeDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    lineHeight: 17,
  },

  // Game Connections — vänsterjusterad lista över källor (YouTube/AI VIBE).
  // Varje rad har en färgad brand-badge (rundad, brand-färgad bakgrund med
  // emoji centrerad inuti) i kompakt list-format.
  connectionsList: {
    // Stretch så varje rad fyller hela bredden — gör att switchar kan
    // höger-justeras med marginLeft:'auto'.
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    // Höger-inset så att switcharna linjerar vertikalt med switcharna i
    // paketlistan nedanför. Pillarna shiftas vänster med samma värde via
    // en mindre connectionLabel.minWidth.
    paddingRight: 18,
  },
  // ── Spotify DJ-rad ───────────────────────────────────────────────────
  spotifyDJRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: 18,
    marginBottom: Spacing.xs,
    // Samma box-styling som smAllToggleCell (All-raden).
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingLeft: Spacing.sm,
  },
  spotifyConnectedLabel: {
    fontSize: FontSize.xs,
    color: '#1DB954',            // Spotify Green — bekräftar kopplat konto.
    marginTop: 2,
  },
  spotifyNotActivatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  spotifyNoConnectionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  spotifyGuideLinkText: {
    fontSize: FontSize.xs,
    color: '#1DB954',
    textDecorationLine: 'underline',
  },
  spotifyGuideOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotifyGuideBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  spotifyGuideSheet: {
    width: '88%',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  spotifyGuideTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  spotifyGuideSteps: {
    gap: Spacing.md,
  },
  spotifyGuideStep: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  spotifyGuideStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1DB954',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
    flexShrink: 0,
  },
  spotifyGuideStepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  spotifyGuideCloseBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  spotifyGuideCloseBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#000',
    letterSpacing: 0.3,
  },
  spotifyHostControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: 'auto',
  },
  spotifyLinkText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  // Availability-pill för Spotify DJ-raden.
  spotifyAvailPill: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    minWidth: 72,
    alignItems: 'center',
  },
  spotifyAvailPillOn: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.success,
  },
  spotifyAvailPillOff: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: Colors.border,
  },
  spotifyAvailPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  spotifyAvailPillTextOff: {
    color: Colors.textSecondary,
  },
  // "Profiles"-förälder-rubrik över Images/Sketch-under-togglarna.
  connectionSubHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  connectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // YouTube "Enabled"-pill: grön kantlinje + muted bg + vit text, med
  // FREE-badge som skär kantlinjen i toppen (samma border-skärande badge-
  // mönster som Pass-the-Phone-knappen i Game Mode-toggle). Pillen måste
  // vara position:relative och får inte ha overflow:hidden — annars klipps
  // FREE-badgen som sticker upp 8px ovanför pillen.
  youtubeEnabledPill: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    position: 'relative',
    // Matchar statusPillEnabled/Disabled så pillar linjerar mellan raderna.
    minWidth: 80,
    alignItems: 'center',
  },
  youtubeEnabledText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Mindre variant av freeBadge för den kompakta YouTube-pillen, så texten
  // "Enabled" inte täcks. Samma teknik som freeBadge men med mindre padding,
  // mindre fontstorlek och något lägre top-offset.
  freeBadgeSmall: {
    position: 'absolute',
    top: -7,
    right: 4,
    backgroundColor: Colors.success,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  freeBadgeTextSmall: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Grey overrides för freeBadgeSmall + freeBadgeTextSmall som appliceras när
  // host stängt av en gratis-funktion (YouTube eller Images). FREE-
  // badgen behålls för att kommunicera "ingår utan kostnad", men dämpas till
  // grått så pillen tydligt läses som Disabled.
  freeBadgeSmallGrey: {
    backgroundColor: '#6B7280',
  },
  freeBadgeSmallTextGrey: {
    color: Colors.textSecondary,
  },
  // Switchen är default ganska stor; krymp till 80% så den passar i list-raden.
  // marginLeft:'auto' pressar switchen till höger kant — övriga element
  // (ikon, label, ev. status-pill) hålls grupperade till vänster.
  connectionSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginLeft: 'auto',
  },
  // YouTube-källan använder nu YouTube:s officiella play-button-ikon
  // (`YouTubeBrandIcon`-komponenten) per deras Branding Guidelines —
  // röd rounded-rect + vit triangel, oförändrad färg/proportion. Den
  // gamla generiska blå-cirkel + vit-play-triangel-stilen är borttagen
  // 2026-05-22. `connectionIconWrap` (28×28) återanvänds som container
  // för layout-paritet med Images-raden på raden under; bg är transparent
  // (YouTube-ikonen har egen röd bg).
  connectionIconGlyph: { fontSize: 14 },
  // Images: Q-figur från startskärmens logga (cirkel + svans i primary-blå),
  // utan omgivande ram. "?"-glyph överlagras i Q-cirkelns mitt — speglar
  // QuizVibeQuestionMarkLogo:s symbolik (bold + ej italic, eftersom italic
  // på ett ensamt "?" dubbel-lutar glyfen). Style-key behålls (`...AiText`)
  // som privat CSS-vokabulär — minimal diff.
  connectionIconAiText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    // translateY -1 kompenserar för att Text:s default-line-box har
    // descender-utrymme under baseline — utan det ligger glyfen något
    // under Q-ringens visuella mitt trots att box-centret är linjerat.
    transform: [{ translateY: -1 }],
  },
  // Status-pill för "Enabled"/"Disabled" bredvid en Game Connection.
  // Fast minWidth så Enabled/Disabled-pillar (och YouTubes Enabled-pill)
  // får samma bredd och linjerar visuellt mellan raderna.
  statusPillEnabled: {
    // Bakgrund + border matchar YouTubes Enabled-pill: blå-tonad muted bg
    // (Colors.primaryMuted) och solid grön kantlinje (Colors.success).
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  statusPillDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    minWidth: 80,
    alignItems: 'center',
    // position:'relative' så att FREE-badgen (på YouTube- och Profiles &
    // Places-raderna) kan sticka upp över kantlinjen även i Disabled-läget.
    position: 'relative',
  },
  statusPillTextEnabled: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statusPillTextDisabled: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Main categories-block — sub-block mellan Game Connections-källorna
  // och Customized Host packages-blocket. Speglar usePackagesBlock i
  // paddings/marginal så de tre delarna inom connectionsList sitter med
  // samma luftgivning. Lokal kopia av mainCategoryToggle-stilen som även
  // finns i ProfileScreen — håll dem synkade vid framtida ändringar.
  mainCategoryBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  mainCategoryToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
    gap: 4,
  },
  mainCategoryBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    position: 'relative',
  },
  mainCategoryBoxInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  mainCategoryBoxActive: {
    borderColor: Colors.success,
    // bg matchar Pass-the-Phone-rutans aktiva bg (modeOptionPassActive) — 2026-06-01.
    backgroundColor: Colors.primaryMuted,
  },
  mainCategoryLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  mainCategoryLabelActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  // Free-badge på varje person-type-ruta (kant-skärande): grön + vit text när
  // aktiv, grå + grå text när inaktiv. Matchar Game Connections-radernas FREE.
  mainCategoryFreeBadge: {
    position: 'absolute',
    top: -8,
    right: 4,
    backgroundColor: Colors.success,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  mainCategoryFreeBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  mainCategoryFreeBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  mainCategoryFreeBadgeTextGrey: {
    color: Colors.textSecondary,
  },
  mainCategoryDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    lineHeight: 17,
  },
  // ── Source Dashboard: äkta kolumn-baserad layout ────────────────────
  // Varje profession är en egen vertikal stack (smDataStack). Alla element
  // i stacken delar samma flex: 1 container → garanterad centrering.
  smGrid: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
  },
  smLabelStack: {
    width: 112,
    minWidth: 112,
    maxWidth: 112,
    flexShrink: 0,
  },
  smDataStack: {
    flex: 1,
  },
  smLabelAllCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: Radius.sm,
    borderBottomLeftRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  smDataAllCell: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
    height: 52,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: Spacing.xs,
  },
  smHeaderCell: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smAllToggleCell: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: Spacing.xs,
  },
  smDataShift: {
    paddingLeft: 3,
  },
  smAllToggleShift: {
    paddingLeft: 18,
  },
  smLabelSourceCell: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smSwitchCell: {
    alignSelf: 'stretch',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smAutoCell: {
    alignSelf: 'stretch',
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceMatrixAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sourceMatrixHeaderText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  sourceMatrixSourceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Matrix-switch: centrerad (ingen marginLeft:'auto' som connectionSwitch har).
  sourceMatrixSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  // Vertikal separator-linje mellan kolumnerna (Actors och Athletes får borderLeft).
  sourceMatrixColSep: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.borderStrong,
  },
  // "Auto-sync"-text i Actors/Athletes-kolumnerna.
  autoActivationLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Q-ikon för Images-källan: ringen + svansen i SVG med "?"-Text ovanpå.
  imagesIconWrap: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  imagesQMark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    lineHeight: 22,
    color: Colors.primary,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  // Use Packages — sub-block för musikpaket-val. Vänsterställt mot
  // connectionsList-kanten så "Extra packages:"-labeln och chipsen börjar
  // på samma x-position som ikonerna i matrisen ovanför.
  usePackagesBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    // Extra luft ovanför så "Customized Host packages"-rubriken inte
    // hamnar för nära Images-radens switch ovanför.
    marginTop: Spacing.md,
  },
  usePackagesLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Två-knapps-rad: Generic (vänster) + Add host packages (höger). gap 4
  // matchar modeToggle:s gap så de visuellt hör ihop. marginTop:'sm' ger
  // luft mot rubriken ovanför.
  packageActionsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.sm,
  },
  // Bas-look för båda knapparna i raden — flex: 1 ger 50/50 bredd, 38 px
  // hög (matchar PtP/IndDev-boxarnas VISUELLA inner-höjd i modeToggle:
  // modeToggle är 46 px outer med 3 px padding + 1 px border → inner ≈ 38 px).
  // position:'relative' så FREE/PREMIUM-badge:n kan sticka upp över
  // kantlinjen utan att klippas.
  addPackageBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    // Tjockare kantlinje (3 px → bumpat från 2 → ursprungligen 1) så
    // knappen sticker ut tydligt mot omgivande paket-rader (1 px-borders).
    // Synkat med Profile-vyns addPackageBtn.
    borderWidth: 3,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  // Aktiv-look för Generic — grön kantlinje + muted bg (samma palett
  // som Pass-the-Phone aktiv i Game Mode-toggle:n).
  genericBtnActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.primaryMuted,
  },
  // Aktiv-stil för "Activate Extra package"-knappen (2026-07-07): guld
  // kant när Premium-hostens paket är aktiva — Generic/Activate bildar
  // ett grönt⟷guld-par som speglar Max 4 / Max 12-rutorna.
  activatePackageBtnActive: {
    borderColor: '#F5A623',
    backgroundColor: Colors.primaryMuted,
  },
  // Yttre wrapper kring sub-rubriken, paketlistan och Buy CTA. Geometrin
  // (padding 3, gap 4, Radius.md, 1px Colors.border, Colors.background-bg)
  // är identisk med modeToggle:n så att Buy CTA hamnar i samma inre avstånd
  // från ramen som Individual Devices har, och så att svart-bakgrunden runt
  // om har samma bredd som modeToggle ovanför.
  extraPackagesWrapper: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 3,
    paddingTop: 3,
    // Större bottom-padding ger extra luft mellan Buy CTA:ns underkant och
    // wrappern:s nederkant — bryter med modeToggle:s symmetri här.
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  // Sub-rubrik högst upp i extraPackagesWrapper — matchar paket-namnens
  // storlek och färg (FontSize.sm + Colors.textPrimary) så raden läses som
  // en likvärdig introduktion till listan under den.
  // Rubrik-rad: heading text på vänster, "Select all"-grupp på höger.
  // paddingRight: 0 (mindre än paket-radernas 4) eftersom Switch:en sitter
  // i en sub-grupp (selectAllGroup) som kompenserar layouten — utan denna
  // justering hamnar Select all-switchen marginellt vänster om paket-switcharna.
  extraPackagesHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
    paddingRight: 0,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  extraPackagesHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    // translateY puttar rubrikens visuella glyfer uppåt så de linjerar med
    // switchens visuella mitt.
    transform: [{ translateY: -1 }],
  },
  // "Select all"-gruppen (label + switch) pushas till höger via marginLeft:'auto'.
  selectAllGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 'auto',
  },
  selectAllLabel: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  // Empty-state-text när hosten inte har köpt några extra-paket. Italic +
  // dämpad färg signalerar att det är ett informativt placeholder, inte
  // en aktiv lista. Buy CTA visas fortsatt nedanför så host kan köpa.
  noExtraPackagesText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  // Layout-rad för ett köpt extra-paket: bordered text-box (vänster, indenterat
  // så det startar vid Buy CTA:s vänsterkant) + Switch (höger via
  // connectionSwitch.marginLeft:'auto'). Ingen border på själva raden —
  // bara text-boxen är inramad.
  purchasedPackageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Layout per child från rad-vänster: paddingLeft 4 → info-ikon (width 20)
    // → gap 8 → text-box → marginLeft:auto (på switch) → switch → paddingRight 4.
    // Info-ikonens center hamnar vid rad x=14 (4 + 10) = absolut x=18 (mitt
    // mellan wrapper-yttre-vänsterkant 0 och box-vänsterkant 36, där wrapper-
    // inset 4 + paddingLeft 4 + ikon 20 + gap 8 = 36 = absolut x för box-left).
    paddingLeft: 4,
    paddingRight: 4,
    gap: Spacing.sm,
  },
  // Inramad text-box: omsluter ENDAST paketnamnet (inte switchen). Default-
  // state (toggle av): grå borderStrong-kant + transparent bg + dämpad text.
  // Aktivt state (toggle på): blå primary-kant + Colors.cardElevated bg + vit
  // text (matchar Buy CTA:s tema). Bredd 204 så höger-kanten linjerar med
  // connection-radernas pill-höger (icon 28 + gap 8 + label.minWidth 112 +
  // gap 8 + pill.marginLeft 4 + pill.minWidth 80 = 240, minus box.left 36
  // = 204) — ger samma avstånd från box till switch som pill till switch.
  purchasedPackageBox: {
    width: 204,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.sm,
  },
  purchasedPackageBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  purchasedPackageName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  purchasedPackageNameActive: {
    color: Colors.textPrimary,
  },
  // Kantskärande FREE-badge på paket-raden — markerar gratis generations-
  // paket (auto-tilldelat utifrån host:s Competition Year of Birth).
  // Speglar samma teknik som freeBadge på Game Mode-toggle:n.
  packageRowFreeBadge: {
    position: 'absolute',
    top: -7,
    right: 14,
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  packageRowFreeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  // Dämpad variant när paketet är toggle:at OFF i lobby:n — signalerar
  // "tillgängligt gratis men inte aktivt i denna lobby".
  packageRowFreeBadgeMuted: {
    backgroundColor: '#6B7280',
  },
  packageRowFreeBadgeTextMuted: {
    color: '#FFF',
  },
  // Rubrik-rad för Customized Host packages-blocket: section-label
  // vänster, info-ikon höger som förklarar Generic vs Extra packages.
  customizedPackagesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Liten info-knapp ("i" i en cirkel) som används av paket-raderna i
  // Customized Host packages-listan — tap visar en Alert med förklaringen
  // istället för att alltid skriva ut texten.
  infoIconBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  connectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    // Reservera samma horisontella utrymme för alla labels så efterföljande
    // status-pillar (YouTubes Enabled / Images Enabled-Disabled) linjerar
    // exakt under varandra trots att labels har olika pixel-bredd i
    // proportionell font. Värdet rymmer den bredaste labeln (idag
    // "Profiles Images" ~110px @ FontSize.sm) med marginal — annars trycks
    // just den radens pill till höger och bryter linjeringen mot YouTube-
    // raden. Värdet är paret med connectionRow.paddingRight (18) så att
    // pillarna och switcharna båda shiftas vänster med 18px och linjerar
    // med paketlistans switchar.
    minWidth: 124,
  },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs },
  // Kollapsbar sektionsrubrik — speglar Profile-vyns header-mönster (ledande
  // ikon + Typography.title bold + +/−-toggle-box). paddingHorizontal: xs så
  // rubriken linjerar i vänsterkant med övriga sektioner. 2026-06-01.
  customizeSectionHeader: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  customizeSectionHeaderText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    // Ingen marginBottom — avståndet header→divider/innehåll styrs av
    // section-containerns `gap` så alla tre sektioner blir identiska.
  },
  sectionHeaderEmoji: { fontSize: 22, lineHeight: 26 },
  // Wrap för SVG-ikon i sektionsrubrik — samma höjd som emoji-varianten
  // så raden centreras likadant.
  sectionHeaderSvg: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
  sectionHeaderTitle: { ...Typography.title, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  // Röd "Players Waiting"-signal i Players in Lobby-rubriken (vid väntande spelare).
  playersWaitingLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.error },
  sectionToggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChevron: { fontSize: 18, fontWeight: FontWeight.bold, color: Colors.textSecondary, lineHeight: 20 },
  // Tunn linje under kollapsad rubrik (visuell separation), som i Profile.
  sectionDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.xs },
  // Approved-räknare + "+ Add Guest" på egen rad under "Players in Lobby"-
  // rubriken — högerställd med lite toppluft (2026-06-01).
  playersMetaRow: { justifyContent: 'flex-start', marginTop: Spacing.sm, gap: Spacing.sm },
  // "Approved"-rubrik vänster om kapacitetsrutorna.
  approvedLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  // Kapacitetsruts-grid — kolumn av rader (4 rutor i bredd per rad). flex:1 så
  // den fyller mitten; marginRight ger "viss avstånd" till "+ Add Guest".
  approvedBoxesGrid: { flex: 1, gap: 4, marginRight: Spacing.md },
  approvedBoxesGridRow: { flexDirection: 'row', gap: 4 },
  // Osynlig spacer som håller kolumn-linjeringen på ev. ofull sista rad.
  approvedBoxSpacer: { flex: 1 },
  // Enskild ruta — speglar GetReady:s progressDot/progressDotFilled.
  approvedBox: {
    flex: 1,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedBoxFilled: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  approvedBoxNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 13,
    includeFontPadding: false,
    paddingHorizontal: 1,
  },
  // Sista rutans "max"/siffra-stack — två kompakta rader inom rutans 24px-höjd.
  approvedBoxMaxStack: { alignItems: 'center', justifyContent: 'center' },
  approvedBoxMaxLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 9,
    includeFontPadding: false,
  },
  approvedBoxMaxNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 11,
    includeFontPadding: false,
  },
  sectionRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionLabel: { ...Typography.overline, color: Colors.textSecondary },
  sectionHint: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  sectionMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primary },
  // Stack:ar "Approved:"-labeln över räknar-raden för en två-rads-look.
  // alignItems: 'center' så raderna centreras gentemot varandra (gemensam
  // mittlinje istället för höger-justering).
  sectionMetaStack: { alignItems: 'center' },
  sectionMetaTop: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  addBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primaryBorder },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  playerBoard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.xs },
  turnOrderHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  missingSection: { gap: Spacing.xs, marginTop: Spacing.xs },
  missingSectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.warning, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs, paddingHorizontal: Spacing.xs },

  // "Waiting to be approved by Host" — separator + grupp under approved-listan
  waitingSection: { gap: Spacing.xs, marginTop: Spacing.md },
  approveAllRow: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  waitingSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  missingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningMuted, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.warningBorder, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  missingEmoji: { fontSize: 20 },
  missingInfo: { flex: 1 },
  missingName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary, marginBottom: 2 },
  missingSubtext: { fontSize: FontSize.xs, color: Colors.warning, lineHeight: 16 },
  missingArrow: { fontSize: 18, color: Colors.warning },

  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.md },

  eraDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  eraDisplayYear: { fontSize: 36, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  eraDisplayDash: { fontSize: 28, fontWeight: '300', color: Colors.textSecondary },
  // Non-host Game Era — speglar in-game year-selector-rutan från app/quiz.tsx
  // (BOX_COLOR='#F5A623', BOX_BG='rgba(26,48,80,0.92)'). Ingen årtalslinje här.
  eraGuestBoxWrap: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  eraGuestBox: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(26,48,80,0.92)',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraGuestBoxText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5A623',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },

  // Non-host Number of Rounds — distinkt från era-rutans gula glow:
  // solid blå kantlinje + svag blå bg + blå siffra. Ingen shadow/glow.
  roundsGuestBoxWrap: { alignItems: 'center', paddingVertical: Spacing.sm },
  roundsGuestBox: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  roundsGuestBoxText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },

  // Host-stepper för Number of Rounds — -/+ knappar flankerar rounds-rutan.
  // Knapparna är 44x44 (Apple HIG min hit-target) med brand-blå border som
  // matchar rutans border. paddingVertical ger samma vertikala luft som
  // roundsGuestBoxWrap så raden står balanserat över RoundsRuler:n.
  roundsStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  roundsStepperBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundsStepperBtnDisabled: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  roundsStepperBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 26,
  },
  roundsStepperBtnTextDisabled: {
    color: Colors.textDisabled,
  },
  eraWarning: { backgroundColor: Colors.warningMuted, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.warningBorder, marginTop: Spacing.sm },
  eraWarningText: { fontSize: FontSize.xs, color: Colors.warning, lineHeight: 17 },
  // Info-not under låsta settings i guest-host-lobbyn ("change Game era not
  // available for Guest user" etc.). Delad stil för alla guest-host-noter.
  guestHostNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // "Mutual assistance level"-raden i 1vs1-lobbyn: label + info-ikon + switch
  // i en ram vars färg speglar läget (grön = på, grå = av) — samma
  // "text + switch läses som EN kontroll"-mönster som Spotify-attestraden.
  mutualAssistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingLeft: Spacing.sm,
    paddingRight: 2,
    paddingVertical: 2,
  },
  mutualAssistanceLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },

  // Not under 1vs1-lobbyns Assistance level-rad — förtydligar att nivån
  // gäller BÅDA spelarna (till skillnad från lokala lägen där den är personlig).
  remoteAssistanceNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  regionTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  regionTriggerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  startSection: { gap: 0, alignItems: 'center' },
  // Answer response time-rad: 4 knappar (15/30/45/60s) på en rad. Active-
  // varianten speglar Number of Rounds:s blå-bordred ruta (primaryBorder +
  // primaryMuted bg) så Quiz Settings-blocket har konsekvent färgvokabulär.
  responseRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  responseBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseBtnActive: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
  },
  responseBtnInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  responseBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  responseBtnTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  // Start Game wrap — auto-höjd så label + logo ryms; ringarna positioneras relativt hela wrappern.
  startGameWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 16,
  },
  startGameHalo: {
    position: 'absolute',
    bottom: 30,
    left: 42,
    right: 42,
    height: 112,
    borderRadius: Radius.xl,
    backgroundColor: Colors.warning,
  },
  // Yttre ring — omsluter hela wrappern (label + logo)
  startGameRingOuter: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: Colors.warning,
  },
  // Inre ring — tätare intill wrappern
  startGameRingInner: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: Colors.warning,
  },
  startGameLogoTouch: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // "Start Game"-label + pil ovanför play-loggan (speglar GetReadyIntro:s tapHereRow).
  startGameLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  startGameLabelText: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 0.5,
  },

  // ── Sticky Start Game-bar (kompakt) ─────────────────────────────
  // Baren pinnas under ScrollView:n (sibling i SafeAreaView) så Start
  // Game alltid är synlig. Row-layout med logo 64 håller höjden nere
  // (~96 px totalt vs ~230 px för gamla stacked-layouten).
  startStickyBar: {
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: Colors.warning,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    // Gold-glow uppåt så baren "lyser" mot scroll-innehållet ovanför.
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  // Gul yta som täcker hela baren (bakom pillen). Animated opacity
  // (startGlow 0.4 ↔ 0.85) ger pulserande glöd; pillen har egen mörk
  // bg + guld-border så den förblir läsbar ovanpå.
  startStickyBarGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.warning,
  },
  startGameCompactWrap: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.warning,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: Colors.background,
  },
  startGameCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    paddingVertical: 4,
  },
  startGameCompactLabel: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  // Halo bara bakom logon (inte texten) så labeln förblir läsbar när
  // glow-opaciteten pulsar upp mot 0.85.
  startGameCompactLogoWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameCompactHalo: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: Colors.warning,
  },
  startGameWaitTextWrap: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startGameWaitText: {
    flexShrink: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  // 1vs1-lobbyns "Wait for friend to join": samma typografiska mått som
  // startGameCompactLabel (Start Game) så pillen får exakt samma storlek
  // som när motståndaren anslutit och baren byter till Start Game. Färgen
  // är dämpad så läget ändå läses som passivt. (Non-host:s längre
  // "Waiting for Host to Start Game" behåller md-storleken ovan — den
  // hade wrappat till två rader vid 20 px.)
  startGameWaitTextLarge: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  waitingForHostText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    letterSpacing: 0.4,
  },
  startHint: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 17 },
  bottomPad: { height: Spacing.xl },
  toTopBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  toTopBox: {
    backgroundColor: Colors.borderStrong,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  toTopLabel: { fontSize: FontSize.sm, color: Colors.textPrimary, letterSpacing: 0.5 },
  // ── Game Sequence ──────────────────────────────────────────────────────────
  // Ingen topp-badge längre — bara botten-badge (kategori) skär kantlinjen.
  // rowGap 16 räcker: botten-badge 9 px under + 7 px luft till nästa rads topkant.
  gsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  gsBox: {
    width: 56,
    height: 36,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gsNumber: {
    fontSize: FontSize.md,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as any,
  },
  gsInlineIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Q-ring + "?"-overlay för Hints-källikon inuti rutan —
  // samma viewBox och stroke som Source Dashboard:s Hints-rad men primär-blå
  // (synligt mot den mörka box-bakgrunden Colors.cardElevated).
  gsSourceQWrap: {
    width: 13,
    height: 13,
    position: 'relative',
  },
  gsSourceQMark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    lineHeight: 13,
    color: Colors.primary,
    fontSize: 6,
    fontWeight: FontWeight.bold,
  },
  // Fristående "?"-glyf för guest-hostens randomiserade Game Sequence-
  // slots (källan avgörs först vid spelstart av den viktade dragningen).
  gsRandomMark: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: FontWeight.bold,
  },
  gsCategoryWrap: {
    position: 'absolute',
    top: -9,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  gsCategoryBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  gsCategoryText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    lineHeight: 12,
  },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  // maxHeight: '90%' bounder sheet:en till viewport så toppen aldrig spiller
  // över skärmen när PlayerName:s custom CodeKeyboard tar plats nedanför
  // ScrollView:n. ScrollView:n inuti har flexShrink: 1 så den krymper
  // när chrome+keyboard sammanlagt skulle överskrida sheet:s maxhöjd.
  container: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border, maxHeight: '90%' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  fieldGroup: { gap: Spacing.xs },
  fieldGroupLocked: { opacity: 0.4 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  input: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, fontSize: 16, color: Colors.textPrimary },
  inputText: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  skillRow: { flexDirection: 'row', gap: Spacing.sm },
  skillBtn: { flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  skillBtnActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  skillBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  skillBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  previewBox: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primaryBorder, alignItems: 'center' },
  previewText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  cancelText: { fontSize: 14, color: Colors.textSecondary },

  // PlayerName-rad: input + Check-knapp inline. Speglar Join-as-Guest-formen.
  playerNameRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  playerNameInput: { flex: 1 },
  // Split-field PlayerName: letters (vänster) + fixed dash + digits (höger).
  // Empiriskt tunad ratio 7:6 — letters behöver mer plats än digits eftersom
  // "GuestAbcde" (10 chars) är bredare än "1234567" (7 narrower digits).
  // paddingHorizontal: Spacing.sm sparar content-yta så allt syns.
  playerNameLettersInput: { flex: 7, minWidth: 0, paddingHorizontal: Spacing.sm, textAlign: 'center' as const },
  playerNameDigitsInput: { flex: 6, minWidth: 0, paddingHorizontal: Spacing.sm, textAlign: 'center' as const },
  playerNameSeparator: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    paddingHorizontal: 2,
  },
  playerNameInputDisabled: { opacity: 0.45 },
  playerNameInputActive: { borderColor: Colors.primary },
  checkBtn: {
    minWidth: 72,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  checkBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  checkBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  checkBtnTextDone: { color: Colors.success, fontSize: 18 },

  // Sekundära åtgärds-rad under namnfältet (Remove + Auto-generate).
  playerNameActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  nameActionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardElevated,
  },
  nameActionBtnDisabled: { opacity: 0.4 },
  nameActionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  // Status-rad under playerName
  statusHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    marginTop: 2,
  },
  statusHintOk: { color: Colors.success, fontWeight: '600' },
  statusHintError: { color: Colors.error, fontWeight: '600' },

  // Submit-knapp (Add to Lobby)
  joinBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  joinBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  joinBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Year of birth — drop-down trigger (för Add Player)
  yearTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
  },
  // Active-state lyser triggern blå när den är "nästa steg" (yearUnlocked
  // men inget år valt än) — speglar Join-as-Guest-formen.
  yearTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  yearTriggerText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  yearTriggerPlaceholder: { color: Colors.textDisabled, fontWeight: '400' },
  yearTriggerPlaceholderActive: { color: '#FFFFFF', fontWeight: '600' },
  yearTriggerArrow: { fontSize: 18, color: Colors.textSecondary },

  // Year picker som conditional overlay inuti samma Modal
  yearPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  yearPickerSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yearPickerHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  yearItemSelected: { backgroundColor: Colors.primaryMuted },
  yearItemText: { fontSize: 17, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  yearItemTextSelected: { color: Colors.primary, fontWeight: '700' },
  yearItemCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});

const playerEditSheet = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '90%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },

  fieldGroup: { gap: Spacing.xs },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xs,
  },

  // Year-trigger speglar AddPlayerModal:s yearTrigger för konsistens.
  yearTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
  },
  yearTriggerText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  yearTriggerPlaceholder: { color: Colors.textDisabled, fontWeight: '400' },
  yearTriggerArrow: { fontSize: 18, color: Colors.textSecondary },

  // Assistance-knapprad speglar AddPlayerModal:s skillRow.
  skillRow: { flexDirection: 'row', gap: Spacing.sm },
  skillBtn: {
    flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  skillBtnActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  // Disallowed assistance-transition — knappen är fortfarande tappbar så
  // popup:en kan informera, men dimmas så host ser att det inte är ett
  // giltigt val.
  skillBtnLocked: { opacity: 0.4 },
  skillBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  skillBtnTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  skillBtnTextLocked: { color: Colors.textDisabled },

  // HCP-input — stort centrerat fält; samma form som tidigare hcpEditSheet.
  hcpInput: {
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 4,
  },
  // Info-text för guest-spelare där HCP-fältet är gömt.
  guestHcpNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },

  saveBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary },

  // Year-picker overlay inom samma Modal (inga nested native-modals).
  yearPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  yearPickerSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yearPickerHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  yearItemSelected: { backgroundColor: Colors.primaryMuted },
  yearItemText: { fontSize: 17, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  yearItemTextSelected: { color: Colors.primary, fontWeight: '700' },
  yearItemCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});

const shareSheet = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },

  // Rad med QuizVibeFriendsLogo bredvid "QuizVibe friends"-labeln —
  // samma ikon som på Profile-skärmens friends-kort.
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
  },

  // Add-by-Player-Name-rad — speglar Profile:s friendsModal.addRow exakt så
  // visual-vokabulär förblir konsistent mellan Profile och Lobby.
  addRow: {
    gap: Spacing.sm,
  },
  addInput: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.3,
  },

  emptyState: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
  },
  emptyText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  friendEmoji: { fontSize: 22, width: 36, textAlign: 'center' },
  friendName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  inviteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  inviteBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  inviteBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
  inviteBtnTextDone: { color: Colors.success },

  divider: { height: 1, backgroundColor: Colors.separator },

  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  closeBtnText: { fontSize: 15, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
});