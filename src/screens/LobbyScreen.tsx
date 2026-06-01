import MultiSlider from '@ptomasroos/react-native-multi-slider';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import { YouTubeBrandIcon } from '../components/YouTubeBrandIcon';
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
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import { addFriend, loadFriends, type Friend } from '../utils/friendsStorage';
import { MIN_HCP, calculateInitialHCP } from '../utils/hcp';
import { addLeftPlayer, getLeftPlayers, removeLeftPlayer } from '../utils/leftPlayers';
import { deactivateRoom, getRoomMeta, markRoomGameStarted, roomExists, setRoomMaxPlayers, setRoomPlayerCount } from '../utils/mockActiveRooms';
import { clearEjected, isEjected, markEjected } from '../utils/ejectedPlayers';
import { clearLobbyPlayers, getLobbyPlayers, markOwnPlayerLeft, setLobbyPlayers, upsertOwnLobbyPlayer } from '../utils/mockLobbyPlayers';
import { clearLobbySettings, getLobbySettings, setLobbySettings } from '../utils/mockLobbySettings';
import { MAIN_CATEGORIES, MAIN_CATEGORY_LABELS, defaultEnabledMainCategories, subjectToMainCategory, type MainCategory } from '../utils/mainCategory';
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
import { loadProfile, saveProfile, type ProfileData, type Region as ProfileRegion } from '../utils/profileStorage';
import { hasPremiumSubscription } from '../utils/subscriptionStorage';
import { ROOM_CODE_DIGITS, ROOM_CODE_LEADING_LETTERS, formatRoomCode, generateRoomCode } from '../utils/roomCode';
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
}

type GameMode = 'pass-the-phone' | 'individual-devices';

// Year-of-birth gränser (samma som registreringsformuläret för gäster) ....
// 15+ minimum age requirement (2026-06-01: höjt från 13+ pga 15+-gränsat
// film-/innehåll i appen, utöver App Store / GDPR). Dynamisk så minimum-året
// följer current year — 2026: max 2011, 2027: max 2012, osv.
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
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

// ─── Add Player Modal ─────────────────────────────────────────────────────────

type AddPlayerAssistance = 'minimal' | 'standard' | 'full';
const ADD_PLAYER_ASSISTANCE_OPTIONS: { id: AddPlayerAssistance; label: string }[] = [
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

function validateAddPlayerName(name: string): 'available' | 'taken' | 'invalid' {
  const trimmed = name.trim();
  // Format: Abcdef- eller Abcdef-1234567 (1-10 letters + dash + 0-7 digits).
  if (!isPlayerNameFormatValid(trimmed)) return 'invalid';
  // Olämpliga ledande par (synced med auto-gen-blocklistan).
  if (hasBlockedLetterLead(trimmed)) return 'invalid';
  if (containsProfanity(trimmed)) return 'invalid';
  // Reserverat: brand-namnet "quizvibe" (case-insensitive) får inte ingå.
  if (containsBlockedLetterSubstring(trimmed)) return 'invalid';
  if (TAKEN_PLAYER_NAMES_LOBBY.has(trimmed.toLowerCase())) return 'taken';
  return 'available';
}

// Endpoints renderas med "or earlier"/"or later"-suffix eftersom de
// representerar öppna intervall (samma framing som Profile/Register/Guest).
function formatAddPlayerBirthYear(year: number): string {
  if (year === MIN_BIRTH_YEAR) return `${year} or earlier`;
  if (year === MAX_BIRTH_YEAR) return `${year} or later`;
  return String(year);
}

function AddPlayerModal({ visible, onClose, onAdd, takenGuestLetters }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, age: number, assistance: AddPlayerAssistance) => void;
  /** Bokstäver som redan används som identifierar-suffix på Guest-spelare
   *  i lobbyn (t.ex. {'A', 'C'} om GuestA + GuestC redan finns). Filtreras
   *  bort vid auto-genereringen så två guests inte får samma versal-bokstav. */
  takenGuestLetters?: Set<string>;
}) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  // Default 'standard' så användaren kan submit:a direkt efter year-pick
  // (samma framing som Join-as-Guest-formen — "Use default or select prefered setup").
  const [assistance, setAssistance] = useState<AddPlayerAssistance>('standard');
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
        setAssistance('standard');
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

  const handleCheckPlayerName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Auto-inserta dash om användaren bara typat letters innan Check.
    const normalized = normalizePlayerName(trimmed);
    if (normalized !== name) setName(normalized);
    Keyboard.dismiss();
    setPlayerNameStatus('checking');
    // Mock-latens — byt mot riktigt API-anrop när backend finns.
    setTimeout(() => {
      setPlayerNameStatus(validateAddPlayerName(normalized));
    }, 600);
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
}: {
  style: StyleProp<TextStyle>;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.Text style={[style, { opacity }]} numberOfLines={1}>
      {children}
    </Animated.Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LobbyScreen() {
  const {
    code,
    isHost,
    asGuest,
    guestName,
    guestBirthYear,
    guestAssistance,
  } = useLocalSearchParams<{
    code: string;
    isHost: string;
    asGuest?: string;
    guestName?: string;
    guestBirthYear?: string;
    guestAssistance?: string;
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
  // Opacity-pulse för "Music. Film. Sport."-taglinen i room code-kortet.
  const taglineFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(taglineFade, { toValue: 0.15, duration: 1600, useNativeDriver: true }),
        Animated.timing(taglineFade, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ]),
    );
    fadeLoop.start();
    return () => fadeLoop.stop();
  }, [taglineFade]);

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
    // Non-host: starta med tom lista — polling/Realtime fyller i host:s lista.
    setPlayers(hostMode ? [SEED_PLAYERS[0]] : []);
    ownPlayerIdRef.current = null;
    selfEverInStoredRef.current = false;
    navigatedToQuizRef.current = false;
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
    if (hostMode) {
      Promise.all([loadProfile(), getLobbySettings(roomCode)]).then(
        ([profile, stored]) => {
          if (cancelled) return;
          const seedGameMode =
            stored?.gameMode ?? profile?.gameMode ?? 'pass-the-phone';
          setGameMode(seedGameMode);
          setMaxPlayers(profile?.maxPlayers ?? 4);
          setSinglePlayerDefault(
            stored?.singlePlayerDefault ??
              profile?.singlePlayerDefault ??
              false,
          );
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
          // Clamp roundsCount mot gameMode:s tak (Pass-the-Phone capas vid 4,
          // Individual Devices vid 20) så ett gammalt sparat värde inte
          // hamnar utanför range:n.
          const savedRounds =
            stored?.roundsCount ?? profile?.roundsDefault ?? ROUNDS_DEFAULT;
          const initialMax =
            seedGameMode === 'pass-the-phone'
              ? ROUNDS_MAX_PASS
              : ROUNDS_MAX_INDIV;
          setRoundsCount(
            Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds)),
          );
          // Game Connections-toggles + extra-paket från stored om finns,
          // annars profil-default (= alla paket aktiverade).
          if (stored) {
            setSelectedExtraPackages(stored.selectedExtraPackages);
            setYoutubeEnabled(stored.youtubeEnabled);
            setImagesEnabled(stored.imagesEnabled);
            setSketchEnabled(stored.sketchEnabled);
          }
          setEnabledHostPackages(
            profile?.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id),
          );
          // Main categories — prio: stored (carry-over från previous Play
          // Again) > profil (host-default) > all 3 (defensive fallback).
          const seedMainCategories =
            stored?.enabledMainCategories && stored.enabledMainCategories.length > 0
              ? stored.enabledMainCategories
              : profile?.enabledMainCategories && profile.enabledMainCategories.length > 0
                ? profile.enabledMainCategories
                : defaultEnabledMainCategories();
          setEnabledMainCategories(seedMainCategories);
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
          // Explicit false så de hamnar i "To be Approved by Host"-listan
          // direkt vid join, istället för att vänta på att host bjuder in.
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
        upsertOwnLobbyPlayer(roomCode, guestPlayer).catch(() => { /* loggas i lobbyPlayers */ });
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
        const profile = await loadProfile();
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
        // Genom att återanvända id:t blir upsertOwnLobbyPlayer en UPDATE
        // av den befintliga raden istället för en INSERT.
        const existingPlayers = await getLobbyPlayers(roomCode);
        const existingMatch = existingPlayers?.find(
          (p) =>
            !p.isHost &&
            p.name.trim().toLowerCase() === myPlayerName.toLowerCase(),
        );
        const joinerId = existingMatch?.id ?? `joiner-${Date.now()}`;
        ownPlayerIdRef.current = joinerId;
        const joiner: LobbyPlayer = {
          id: joinerId,
          name: myPlayerName,
          emoji: profile ? getAvatarEmojiById(profile.selectedAvatarId) : '👤',
          isReady: hcpComplete,
          type: profile ? 'registered' : 'guest',
          age,
          assistance,
          hcpComplete,
          // ALLTID false — non-host måste re-approvas av host vid varje
          // join, även om de varit approved i en tidigare session och nu
          // re-joinar via dup-detection (ärvt player_id). upsertOwnLobbyPlayer
          // skriver approved=false till DB:n så host:s vy får raden i "To
          // be Approved by Host"-listan och kan välja att approva på nytt.
          approved: false,
        };
        setPlayers((prev) => {
          // Dedupe på id: om syncFromStore-pollen redan har dragit in
          // carry-over-raden (med samma id efter dup-detection-fixet) så
          // ersätt den med vår lokala joiner-payload istället för att
          // insert:a en TVÅA-rad. Annars race-fall: poll:en plockar in
          // raden → vi insert:ar → två rader med samma id syns kort tills
          // nästa poll skriver över local state.
          const filtered = prev.filter((p) => p.id !== joinerId);
          const hostIdx = filtered.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...filtered];
          next.splice(insertAt, 0, joiner);
          return next;
        });
        // Publicera egen rad till lobby_players så host:s Realtime-channel
        // får broadcast och hen ser den nya spelaren direkt i sin vy. När
        // joinerId redan finns i tabellen blir det en UPDATE (samma id,
        // ny payload) — inget ny rad skapas.
        upsertOwnLobbyPlayer(roomCode, joiner).catch(() => { /* loggas i lobbyPlayers */ });
        // Rensa ev. stale leftPlayers-snapshot för det ärvda player_id:t.
        // Kritiskt när dup-detection ovan har ärvt OLD-id:t från en tidigare
        // Leave Game: AsyncStorage:s leftIds får annars syncFromStore:s
        // self-injection att felaktigt sätta hasLeft=true trots att DB:s
        // has_left nu är false (via upsertOwnLobbyPlayer:s explicit-set).
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
  }, [code, guestMode, guestName, guestBirthYear, guestAssistance, hostMode]);

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
      Promise.all([
        loadProfile(),
        getLeftPlayers(roomCode),
        getLobbyPlayers(roomCode),
        hasPremiumSubscription(),
      ]).then(([profile, leftSnapshots, stored, premium]) => {
        if (!active) return;
        setHasPremium(premium);
        // Speglar Profile:s credits-pill — refresh-logiken i loadProfile
        // top-up:ar `freeGameCredits` till FREE_CREDITS_DAILY_CAP vid första
        // load efter midnatt CET, så lobbyn visar alltid aktuellt värde.
        setFreeGameCredits(profile?.freeGameCredits ?? 0);
        setGameCredits(profile?.gameCredits ?? 0);
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
            const next = hostMode && profile && p.isHost ? mergeProfileIntoHost(p, profile) : p;
            if (next.isHost) {
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
    }, [roomCode]),
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
  const [answerResponseSeconds, setAnswerResponseSeconds] = useState<15 | 30 | 45 | 60>(30);
  // gameMode-state declareras längre ner — se rad ~751.
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  // Share invite modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
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

  // Host Game Credits — speglar Profile:s credits-pill exakt. Värdena läses
  // från sparad profil i useFocusEffect:n nedan så lobbyn alltid visar
  // samma siffra som Profile (och uppdateras direkt om användaren spenderat
  // / fyllts på via daily refresh / shoppat extras i Store mellan tab-byten).
  const [freeGameCredits, setFreeGameCredits] = useState<number>(0);
  const [gameCredits, setGameCredits] = useState<number>(0);

  // Host delete-lobby sheet — bara aktiv när hostMode är på. Tap på TopUserBanner-
  // pillen öppnar sheet:n istället för att navigera till Profile (host:s
  // profil hanteras via Profile-tabben i bottom nav). Sheet:n har en
  // destruktiv "Delete this Game Lobby"-knapp + Cancel. Yes på Alert:en
  // gör roomCode inaktiv via deactivateRoom() — kvarvarande non-hosts
  // får då en deletion-popup via polling-detection längre ner.
  const [hostDeleteSheetVisible, setHostDeleteSheetVisible] = useState(false);
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
  // Approved non-host i Pass-the-Phone-lobby: host startar → bara host
  // spelar på sin telefon. Non-host får informativ popup ("använd host-
  // device:n"). Skiljs från startedWithoutMeDetected (oapprovaderad)
  // eftersom messaging:en är olika.
  const [passThePhoneStartedDetected, setPassThePhoneStartedDetected] = useState(false);
  // True under den korta processing-fasen mellan host:s Yes-konfirmation
  // och navigation till Home. Visar en loading-overlay med "Please Wait —
  // Deleting this Lobby..." + animerade våg-prickar så host:en känner att
  // appen jobbar (undviker upplevelsen av instant-cut till Home).
  const [deletingLobby, setDeletingLobby] = useState(false);

  // Master "Approve All"-state — återställs automatiskt till 'no' när
  // waiting-listan blivit tom (efter approve all eller när ingen väntar).
  const [approveAllValue, setApproveAllValue] = useState<'no' | 'yes'>('no');

  // Game mode toggle (Pass-the-Phone vs Multiplayer Individual Devices)
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');

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
  const [maxPlayers, setMaxPlayers] = useState<4 | 12>(4);
  // Premium-state laddas från subscriptionStorage i useFocusEffect så vi
  // re-checkar efter återkomst från Store (mock-purchase aktiverar flaggan).
  // Driver BÅDA Individual Devices-unlock OCH Max 12-unlock. TODO (Store
  // integration): byt subscriptionStorage mot RevenueCat entitlement-check.
  const [hasPremium, setHasPremium] = useState(false);

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
  // pollen ovan, så de behöver inte auto-set:as här.
  // maxPlayers sätts nu explicit via Players-toggeln (Max 4 / Max 12). 12 är en
  // subscription-perk → clampa till 4 för gratis-host oavsett seedat värde.
  useEffect(() => {
    if (!hostMode) return;
    if (!hasPremium) setMaxPlayers((prev) => (prev === 4 ? prev : 4));
  }, [hostMode, hasPremium]);

  // Max rundor är en subscription-perk OBEROENDE av läge: Premium → 20, annars
  // 4. (Tidigare gav Individual Devices implicit 20; nu är IndDev gratis och
  // 20-rundor gatas enbart på Premium.)
  const roundsMax = hasPremium ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
  useEffect(() => {
    setRoundsCount((prev) => Math.max(ROUNDS_MIN, Math.min(roundsMax, prev)));
  }, [roundsMax]);

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
    setRoundsCount((prev) => {
      const next = Math.min(roundsMax, prev + ROUNDS_STEP);
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  }, [roundsMax]);
  // YouTube är alltid tillgänglig som källa, men host kan slå av/på manuellt
  // via en toggle. Default = på. Skickas till alla via lobbyns state.
  const [youtubeEnabled, setYoutubeEnabled] = useState(true);
  // "Profiles"-källan har två under-toggles: Images (foto) + Sketch (doodle).
  // Images default på; Sketch default AV (doodlen är prototyp, ej wirad till
  // quiz-poolen — toggeln är strukturell tills den kopplas in).
  const [imagesEnabled, setImagesEnabled] = useState(true);
  const [sketchEnabled, setSketchEnabled] = useState(false);
  // Kollapsbara Lobby-sektioner (samma +/− mönster som Profile-vyn). Default expanderade.
  // Alla (host OCH non-host) kommer in med Game Settings + Quiz Tuning REDAN
  // hopfällda (folded) och Players in Lobby utfälld.
  const [gameSettingsExpanded, setGameSettingsExpanded] = useState(false);
  // Host kommer in med Players in Lobby hopfälld (likt Game Settings + Quiz
  // Tuning); non-host får den utfälld så de direkt ser spelarlistan.
  const [playersExpanded, setPlayersExpanded] = useState(!hostMode);
  const [quizTuningExpanded, setQuizTuningExpanded] = useState(false);

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
  // Main categories (Music/Film/Sport) — host-toggleln filtrerar quiz-poolen
  // via backend-subject → MainCategory-mappning. Min 1 enforce:as i
  // handleToggleMainCategory så listan aldrig blir tom. Seedas från host:s
  // profil i host-seed-effekten; non-host syncar via mockLobbySettings-pollning.
  const [enabledMainCategories, setEnabledMainCategories] = useState<MainCategory[]>(
    () => defaultEnabledMainCategories(),
  );
  const handleToggleMainCategory = (cat: MainCategory) => {
    setEnabledMainCategories((prev) => {
      const isActive = prev.includes(cat);
      if (isActive) {
        if (prev.length <= 1) {
          Alert.alert(
            'At least one main category',
            'Minimum 1 main category needs to be enabled. Activate another category before disabling this one.',
          );
          return prev;
        }
        return prev.filter((c) => c !== cat);
      }
      return MAIN_CATEGORIES.filter((c) => c === cat || prev.includes(c));
    });
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
  // Individual device kräver att ALLA spelare är registrerade QuizVibe-users
  // (guests kan inte vara med — varken host-tillagda eller självanslutna via
  // guest-form). Vid byte till IndDev tas alla icke-registrerade bort. Host
  // exkluderas alltid (host är alltid registrerad/synthetic). markEjected +
  // DB-DELETE så självanslutna guests får eject-popup på sin enhet.
  const confirmAndRemoveGuests = (title: string, applySwitch: () => void) => {
    const guests = players.filter((p) => !p.isHost && p.type !== 'registered');
    if (guests.length === 0) {
      applySwitch();
      return;
    }
    Alert.alert(
      title,
      'Individual device games require every player to have a registered QuizVibe account. Guest players will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch & remove',
          style: 'destructive',
          onPress: () => {
            setPlayers((prev) => prev.filter((p) => p.isHost || p.type === 'registered'));
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

  // Game mode-val: tre fria lägen (single / PtP / IndDev). IndDev är INTE
  // längre premium-gated — alla tre är gratis att välja. Subscription gatar
  // istället caps (rundor/spelare), inte lägesvalet.
  const handleSelectMode = (mode: GameMode) => {
    if (mode === gameMode && !singlePlayerDefault) return;
    // Vid byte till Individual device: varna om host har manuellt tillagda
    // spelare (de saknar egen mobil och måste tas bort när alla spelar från
    // sina egna enheter). Lämnar även single-player-läget.
    if (mode === 'individual-devices') {
      confirmAndRemoveGuests('Switch to Individual device?', () => {
        setSinglePlayerDefault(false);
        setGameMode('individual-devices');
      });
      return;
    }
    setSinglePlayerDefault(false);
    setGameMode('pass-the-phone');
  };

  // Single player-val: ejecta ev. non-host-spelare (de kan inte vara med i
  // single-player). Samma logik som tidigare singlePlayerDefault-checkbox ON.
  const handleSelectSingle = () => {
    if (singlePlayerDefault) return;
    const ejectables = players.filter((p) => !p.isHost && !p.hasLeft);
    if (ejectables.length === 0) {
      setSinglePlayerDefault(true);
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
          },
        },
      ],
    );
  };

  // Players-val: Max 4 (gratis) / Max 12 (Premium). 12 kräver subscription →
  // Store-redirect om gratis-host. Sätter maxPlayers som styr lobby-cap +
  // hur många host kan godkänna i "Players in lobby".
  const handleSelectMaxPlayers = (n: 4 | 12) => {
    if (n === 12 && !hasPremium) {
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
    setMaxPlayers(n);
  };

  // En game-mode-ruta (delas av Single device- och Multiplayer-grupperna).
  // FREE-badge grön när aktiv, grå när inaktiv. disabled för non-host.
  const renderModeBox = (key: 'single' | 'ptp' | 'indiv', label: string) => {
    const isActive =
      key === 'single'
        ? singlePlayerDefault
        : key === 'ptp'
          ? !singlePlayerDefault && gameMode === 'pass-the-phone'
          : !singlePlayerDefault && gameMode === 'individual-devices';
    return (
      <TouchableOpacity
        style={[styles.modeOption, isActive ? styles.modeOptionPassActive : styles.modeOptionInactive]}
        onPress={() =>
          key === 'single'
            ? handleSelectSingle()
            : handleSelectMode(key === 'ptp' ? 'pass-the-phone' : 'individual-devices')
        }
        disabled={!hostMode}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.modeLabel, { textAlign: 'center' }, isActive && styles.modeLabelActiveFree]}
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
  // Driver "Waiting for approval"-mellansteget för non-host. När host inte
  // har godkänt mig än ska jag inte se lobby:n överhuvudtaget — bara en
  // status-skärm. Polling-effekten ovan plockar upp host:s approve-toggle
  // inom ~2s och då kan jag äntligen se hela lobby:n.
  const isApprovedByHost =
    !hostMode &&
    !!ownPlayerIdRef.current &&
    players.some((p) => p.id === ownPlayerIdRef.current && !!p.approved);
  // Minst en Game Connection-källa måste vara aktiv — annars finns inget
  // underlag att hämta frågor från. Räkna aktiva källor och blockera när
  // användaren försöker stänga av den enda kvarvarande.
  const enabledSourceCount =
    (youtubeEnabled ? 1 : 0) + (imagesEnabled ? 1 : 0);
  const handleToggleSource = (
    currentlyEnabled: boolean,
    setter: (v: boolean) => void,
    nextValue: boolean,
  ) => {
    if (!nextValue && currentlyEnabled && enabledSourceCount === 1) {
      Alert.alert(
        'Game connections',
        'Minimum 1 Game connection source needs to be enabled.',
      );
      return;
    }
    setter(nextValue);
  };
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
    // Individual device kräver registrerade konton — host kan inte lägga till
    // guests manuellt. De måste joina med sitt eget registrerade konto.
    if (gameMode === 'individual-devices' && !singlePlayerDefault) {
      Alert.alert(
        'Registered accounts required',
        "Individual device games can't include guest players. Ask players to join with their own registered QuizVibe account, or switch game mode.",
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
        type: 'guest',
        age,
        assistance,
        hcpComplete: true,
        addedByHost: true,
      },
    ]);
  };
  const handleSetApproved = (id: string, approved: boolean) => {
    // D-vii block: host kan inte approva en spelare med röd connection-
    // status. Approve toggle:n är redan disabled visuellt i UI:t men vi
    // validerar även här som belt-and-suspenders (race conditions där
    // status flippade röd just som host tappade).
    if (approved && lobbyPeerHealth[id] === 'unstable') {
      Alert.alert(
        'Connection unstable',
        'This player has an unstable connection. Wait for it to stabilize before approving them.',
      );
      return;
    }
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, approved } : p));
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
      // Idempotent: setPlayers no-op:ar när raden redan är unapproved.
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, approved: false } : p)),
      );
    });
  }, [lobbyPeerHealth, hostMode, gameMode, players]);

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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
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
          },
        },
      ],
    );
  };
  const handleApproveAll = () => {
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
    setNewFriendPlayerName('');
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
      'You will be directed to Home page and Guest Player data will be lost.',
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
          onPress: async () => {
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
              router.replace('/');
            }, 1600);
          },
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
    setLobbyPlayers(roomCode, players).catch(() => { /* loggas i mockLobbyPlayers */ });
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
    if (!hostMode) return;
    const handle = setTimeout(() => {
      setLobbySettings(roomCode, {
        gameMode,
        singlePlayerDefault,
        region,
        answerResponseSeconds,
        eraFrom: eraValues[0],
        eraTo: eraValues[1],
        roundsCount,
        selectedExtraPackages,
        youtubeEnabled,
        imagesEnabled,
        sketchEnabled,
        enabledMainCategories,
      }).catch(() => { /* loggas i mockLobbySettings */ });
    }, 300);
    return () => clearTimeout(handle);
  }, [
    hostMode,
    roomCode,
    gameMode,
    singlePlayerDefault,
    region,
    answerResponseSeconds,
    eraValues,
    roundsCount,
    selectedExtraPackages,
    youtubeEnabled,
    imagesEnabled,
    sketchEnabled,
    enabledMainCategories,
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
      setGameMode(stored.gameMode);
      setSinglePlayerDefault(stored.singlePlayerDefault);
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
      setYoutubeEnabled(stored.youtubeEnabled);
      setImagesEnabled(stored.imagesEnabled);
      setSketchEnabled(stored.sketchEnabled);
      // Main categories — coerce tom array till alla 3 så pool-filtret
      // aldrig blir tomt om host:s skrivning skulle ha landat ofullständig.
      setEnabledMainCategories((prev) => {
        const next = stored.enabledMainCategories.length > 0
          ? stored.enabledMainCategories
          : defaultEnabledMainCategories();
        if (prev.length === next.length && prev.every((c, i) => c === next[i])) {
          return prev;
        }
        return next;
      });
    };
    syncFromStore();
    const interval = setInterval(syncFromStore, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hostMode, roomCode, realtimeTick]);

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
        // Hoppa över rader som är host-typade (host:s eget kort hanteras
        // separat via mergeProfileIntoHost) — vi vill bara plocka in nya
        // joiners (registered/guest/manual som ännu inte är i lokal state).
        const newJoiners = stored.filter((p) => !p.isHost && !localIds.has(p.id));
        if (newJoiners.length === 0) return prev;
        const hostIdx = prev.findIndex((p) => p.isHost);
        const insertAt = hostIdx === -1 ? prev.length : hostIdx + 1;
        const next = [...prev];
        next.splice(insertAt, 0, ...newJoiners);
        return next;
      });
    };
    // Syncar non-host-fält som non-host:en själv kan skriva via sin egen
    // upsertOwnLobbyPlayer: `hasLeft` (markOwnPlayerLeft + reset vid re-join)
    // OCH `approved` (re-join resetar till false så host måste re-approva).
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
          const nextApproved = !!updated.approved;
          if (!!p.hasLeft === nextHasLeft && !!p.approved === nextApproved) return p;
          changed = true;
          return { ...p, hasLeft: nextHasLeft, approved: nextApproved };
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
      const ownId = ownPlayerIdRef.current;
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
        const selfApproved = !!playersStored?.find((p) => p.id === ownId)?.approved;
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
        // Game Connections-källor — KRITISKT att non-host får samma värden
        // som host så båda enheter bygger identisk gameQuestions-pool.
        // Annars ser host bara YouTube-frågor medan non-host får
        // alternerande mix → desync på spelets fråge-typ.
        const effectiveYoutubeEnabled =
          settingsStored?.youtubeEnabled ?? youtubeEnabled;
        const effectiveProfilesEnabled =
          settingsStored?.imagesEnabled ?? imagesEnabled;
        // Approved spelare: nästa steg beror på gameMode.
        // - Pass-the-Phone: bara host spelar på sin telefon → vänligare
        //   popup "Host has started... use the Host device".
        // - Individual Devices: alla approved spelare spelar på sin egen
        //   enhet → navigera till /quiz med derived turnOrder.
        if (effectiveGameMode === 'pass-the-phone') {
          if (!cancelled) setPassThePhoneStartedDetected(true);
          return;
        }
        if (!navigatedToQuizRef.current && !cancelled) {
          navigatedToQuizRef.current = true;
          const turnOrder = (playersStored ?? [])
            .filter((p) => !!p.approved || !!p.isHost)
            .map((p) => ({
              id: p.id,
              name: p.name,
              emoji: p.emoji,
              avatarUri: p.avatarUri,
              assistance: p.assistance ?? 'standard',
              age: p.age,
            }));
          router.replace({
            pathname: '/quiz',
            params: {
              assistance: 'standard',
              age: '32',
              gameMode: effectiveGameMode,
              // Non-host-vägen från Realtime-driven game-started-detection.
              // quiz.tsx använder isHost för att rendera Leave Game-knapp
              // istället för Quit Game-knapp i GetReadyIntro/CountdownIntro.
              isHost: 'false',
              // Non-host:s egna player_id — används av Leave-flödet för att
              // broadcasta `player_left` så host:s skärm får popup + markerar
              // spelaren som hasLeft i leaderboarden.
              selfPlayerId: ownId ?? '',
              players: JSON.stringify(turnOrder),
              roundsCount: String(effectiveRoundsCount),
              answerResponseSeconds: String(effectiveAnswerResponseSeconds),
              eraFrom: String(effectiveEraFrom),
              eraTo: String(effectiveEraTo),
              youtubeEnabled: String(effectiveYoutubeEnabled),
              imagesEnabled: String(effectiveProfilesEnabled),
              // Theme packages aktiva i lobby:n vid speltillfället (non-host
              // path — efter Realtime-detection av game-started). Speglar
              // host-path:en så HistoryEntry får samma data oavsett vilken
              // enhet som triggade navigation till /quiz.
              selectedExtraPackages: JSON.stringify(settingsStored?.selectedExtraPackages ?? []),
              // Main categories — non-host använder host:s synkade värde från
              // settingsStored. Fallback till lokal state om settings ännu
              // inte är skrivna (osannolikt vid game-started-detection).
              enabledMainCategories: JSON.stringify(
                settingsStored?.enabledMainCategories && settingsStored.enabledMainCategories.length > 0
                  ? settingsStored.enabledMainCategories
                  : enabledMainCategories,
              ),
              roomCode,
            },
          });
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
        const ownId = ownPlayerIdRef.current;
        const selfInHostList = ownId
          ? approvedFromHost.some((p) => p.id === ownId)
          : false;
        let next: LobbyPlayer[] = approvedFromHost;
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

  // Pass-the-Phone-popup: approved non-host i en Pass-the-Phone-lobby kan
  // inte själv navigera till /quiz — host:s telefon är den enda enhet som
  // spelar. Visa informativ popup med Back to Home-knapp.
  useEffect(() => {
    if (!passThePhoneStartedDetected) return;
    Alert.alert(
      'Host has started the game',
      'Please use the Host device (Pass-the-Phone game mode).',
      [{ text: 'Back to Home', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [passThePhoneStartedDetected]);

  // Skickar invite in-app till en vän — sparas i mottagarens per-user-
  // namespacade Waiting Invites-inbox (friend.playerName som nyckel).
  // Använder hostens profil-playerName/avatar som "from"-data.
  const handleInviteFriend = async (friend: Friend) => {
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
    const eraFrom = eraValues[0];
    const eraTo = eraValues[1];
    const isAllCats =
      enabledMainCategories.length === 3 &&
      enabledMainCategories.includes('Music') &&
      enabledMainCategories.includes('Film') &&
      enabledMainCategories.includes('Sport');
    const matchesCategory = (mc: MainCategory | null) =>
      isAllCats ? true : mc !== null && enabledMainCategories.includes(mc);
    const hasMusicHit = youtubeEnabled && MUSIC_QUESTIONS.some(
      (q) =>
        q.correctYear >= eraFrom &&
        q.correctYear <= eraTo &&
        matchesCategory(subjectToMainCategory(q.contentSubject)),
    );
    const hasImageHit = imagesEnabled && IMAGE_QUIZ_QUESTIONS.some((q) => {
      let inEra = true;
      if (q.peakFrom !== undefined && q.peakTo !== undefined) {
        inEra = eraFrom <= q.peakTo && eraTo >= q.peakFrom;
      } else if (q.correctYear !== undefined) {
        inEra = q.correctYear >= eraFrom && q.correctYear <= eraTo;
      }
      return inEra && matchesCategory(subjectToMainCategory(q.contentSubject));
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
    const turnOrder = approvedPlayers
      .filter((p) => !p.hasLeft)
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
    if (!singlePlayerDefault && approvedNonHosts.length === 0) {
      Alert.alert(
        'No approved players',
        'You have not approved any other players. Either approve players or switch to single player mode.',
        [
          { text: 'Approve players', style: 'cancel' },
          {
            text: 'Switch to single player',
            onPress: () => setSinglePlayerDefault(true),
          },
        ],
      );
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
      // Individual device kräver registrerade konton för alla — guests
      // (självanslutna eller host-tillagda) får inte vara med. Defensiv guard
      // ifall en guest hann joina via kod efter mode-bytet.
      const guestPlayer = approvedPlayers.find(
        (p) => !p.isHost && !p.hasLeft && p.type !== 'registered',
      );
      if (guestPlayer) {
        Alert.alert(
          'Registered accounts required',
          `Individual device games require every player to have a registered QuizVibe account. Remove ${guestPlayer.name} (guest) or switch game mode before starting.`,
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

    // Konsumera 1 Host Game-credit per påbörjat spel — Free först, Extras
    // sedan. Blockerar start om båda är 0 (visar Store-redirect-Alert).
    // Persisterar tillbaka via saveProfile så Profile-pillen + nästa lobby-
    // session ser den uppdaterade siffran. Spread:ar in tidigare profil-
    // fields (...profile) så vi inte stripper andra sparade settings.
    const profile = await loadProfile();
    if (!profile) {
      Alert.alert('Sign in required', 'Log in or register before starting a game.');
      return;
    }
    const free = profile.freeGameCredits ?? 0;
    const extras = profile.gameCredits ?? 0;
    // Membership = obegränsade host-spel; ingen gate, ingen deduktion.
    // Free + Extras lämnas helt orörda så pillen behåller sina värden om
    // membership skulle gå ut senare och behovet av credits återuppstår.
    if (!hasPremium) {
      if (free === 0 && extras === 0) {
        Alert.alert(
          'Out of Host Game Credits',
          'You have no credits left for today. Buy extra credits in Store, wait for the daily refresh at midnight CET, or upgrade to a QuizVibe membership for unlimited host games.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'credits', from: '/lobby', fromCode: roomCode } }) },
          ],
        );
        return;
      }
      const nextFree = free > 0 ? free - 1 : 0;
      const nextExtras = free > 0 ? extras : extras - 1;
      try {
        await saveProfile({ ...profile, freeGameCredits: nextFree, gameCredits: nextExtras });
        // Lokal state-sync så pillen i lobby-headern uppdateras direkt
        // (annars hade den gamla siffran legat kvar tills nästa fokus-load).
        setFreeGameCredits(nextFree);
        setGameCredits(nextExtras);
      } catch {
        // Tyst — låt spelet börja även om persist-write skulle failla. Nästa
        // load reflekterar då fortfarande gamla värdet, vilket är säkrare än
        // att blockera spelstart helt på en AsyncStorage-glitch.
      }
    }

    // Markera rumkoden som "game-started" innan navigation — non-host:s
    // polling-effekt detekterar detta och visar "Host started game without
    // this user"-popup till spelare som inte hunnit bli approved. Måste
    // sättas FÖRE router.push så non-host:s nästa poll fångar det medan
    // host:s component fortfarande är monterad (vid host:s blur clearas
    // ingen state — markeringen lever till någon lifecycle-cleanup).
    markGameStarted(roomCode);
    // Server-side flagga: rooms.game_started=true så isActiveRoom returnerar
    // false för nya joiners (rummet är inte längre joinbart). Fire-and-forget
    // — UI:t fortsätter inte vänta på DB-roundtrip.
    markRoomGameStarted(roomCode).catch(() => { /* loggas i mockActiveRooms */ });
    // Rensa pending invites för det här rummet — host startar spelet, så
    // alla mottagare som ännu inte accepterat ska INTE längre se inviten
    // som ett valbart alternativ på Home. Game-start raderar inte rooms-
    // raden så ON DELETE CASCADE fyrar inte — explicit cleanup behövs.
    // Realtime DELETE-events propageras till mottagarnas JoinModal-sub:ar.
    clearWaitingInvitesForRoom(roomCode).catch(() => { /* loggas i waitingInvites */ });

    router.push({
      pathname: '/quiz',
      params: {
        assistance: 'standard',
        age: '32',
        gameMode,
        // Host-vägen från Start Game-tap. quiz.tsx använder detta för att
        // rendera Quit Game-knapp (river hela rummet) istället för Leave
        // Game-knapp (bara non-host:s egen utväg).
        isHost: 'true',
        // Host:s egna player_id — speglar non-host-paths selfPlayerId.
        // Inte använt för broadcast (host kan inte Leave Game, bara Quit)
        // men inkluderat för symmetri så framtida features kan referensa
        // ownId utan att behöva ändra Lobby:n.
        selfPlayerId: ownPlayerIdRef.current ?? turnOrder[0]?.id ?? '',
        players: JSON.stringify(turnOrder),
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
        // Game Connections-källor — quiz.tsx gatar fråge-poolen på dessa
        // (YouTube off → items med youtubeClips faller bort; Profiles off
        // → image-items faller bort). Minst en MÅSTE vara på (Lobby
        // blockar avstängning av sista källan), så båda-off-fallet är
        // skyddat upstream.
        youtubeEnabled: String(youtubeEnabled),
        imagesEnabled: String(imagesEnabled),
        // Theme packages aktiva i lobby:n vid speltillfället. JSON-stringifierad
        // array av paket-IDs (tom array = Generic). quiz.tsx läser detta för
        // att frysa in i HistoryEntry så Player history visar vilket paket
        // spelet kördes med.
        selectedExtraPackages: JSON.stringify(selectedExtraPackages),
        // Main categories aktiverade i lobby:n. JSON-stringifierad array av
        // MainCategory-strings (Music/Film/Sport). quiz.tsx läser detta i
        // gameQuestions-useMemo:n för att filtrera pool:en. UI:t enforce:ar
        // min 1 enabled så listan kan inte vara tom här.
        enabledMainCategories: JSON.stringify(enabledMainCategories),
        // Skickas så Quit Game-flödet i quiz.tsx kan deactivera rummet
        // och rensa leftPlayers när host avslutar mitt i ett spel.
        roomCode,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top board (login status) — sticky utanför ScrollView så den följer
          med när användaren scrollar i lobbyn. Tap-beteendet är roll-
          beroende:
          • Host: öppnar Delete-this-Game-Lobby-sheet:n (host:s motsvarighet
            till non-host:s leave-flow). Profile-hantering sker via Profile-
            tabben i bottom nav.
          • Non-host (både guest och registrerade): öppnar Leave Game Lobby-
            sheet:n så de kan ta sig ur rummet utan att lämna appen. */}
      <TopUserBanner
        guestName={isGuestInRoom ? guestName : undefined}
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
              för non-host (de är inte host i detta spel → credits irrelevanta). */}
          {hostMode && (
            <Pressable
              style={({ pressed }) => [
                styles.creditsPill,
                hasPremium && styles.creditsPillMembership,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push({ pathname: '/store' as const, params: { focus: 'credits', from: '/lobby', fromCode: roomCode } })}
            >
              {hasPremium && (
                <View style={styles.creditsMembershipBadgeWrap} pointerEvents="none">
                  <View style={styles.creditsMembershipBadge}>
                    <Text style={styles.creditsMembershipBadgeText}>UNLIMITED</Text>
                  </View>
                </View>
              )}
              <Text style={styles.creditsLabel}>Host Game Credits</Text>
              <View style={styles.creditsValueRow}>
                <Text style={styles.creditsKey}>Free:</Text>
                <Text style={[styles.creditsValue, styles.creditsValueFree]}>{freeGameCredits}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.creditsExtrasBox,
                    gameCredits > 0
                      ? styles.creditsExtrasBoxActive
                      : styles.creditsExtrasBoxInactive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      'Extra Host Game Credits',
                      gameCredits > 0
                        ? `You have ${gameCredits} extra credit${gameCredits === 1 ? '' : 's'}. Buy more in Store?`
                        : 'You have no extra credits. Buy some in Store?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Go to Store', onPress: () => router.push({ pathname: '/store' as const, params: { focus: 'credits', from: '/lobby', fromCode: roomCode } }) },
                      ],
                    )
                  }
                >
                  <Text style={styles.creditsKey}>Extras:</Text>
                  <Text style={[styles.creditsValue, styles.creditsValueExtras]}>{gameCredits}</Text>
                  <View
                    style={[
                      styles.creditsExtrasPremiumBadge,
                      gameCredits > 0
                        ? styles.creditsExtrasPremiumBadgeActive
                        : styles.creditsExtrasPremiumBadgeInactive,
                    ]}
                    pointerEvents="none"
                  >
                    <Text
                      style={[
                        styles.creditsExtrasPremiumBadgeText,
                        gameCredits > 0
                          ? styles.creditsExtrasPremiumBadgeTextActive
                          : styles.creditsExtrasPremiumBadgeTextInactive,
                      ]}
                    >
                      PREMIUM
                    </Text>
                  </View>
                </Pressable>
              </View>
            </Pressable>
          )}
          {/* Non-host: "Music. Film. Sport."-tagline på samma rad som "Game
              Lobby", uppe i högra hörnet (host saknar credits-pill där så
              utrymmet är fritt). Host visar den ovanför room code-kortet. */}
          {!hostMode && (
            <Animated.Text
              style={[styles.headerTagline, { opacity: taglineFade }]}
              numberOfLines={1}
            >
              Music. Film. Sport.
            </Animated.Text>
          )}
        </View>

        {/* Brand-tagline (glowing gold, opacity-pulse) — host visar den OVANFÖR
            room code-kortet; non-host visar den i headern (se ovan). */}
        {hostMode && (
          <Animated.Text style={[styles.roomTagline, { opacity: taglineFade }]}>
            Music. Film. Sport.
          </Animated.Text>
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
          {/* "You are the host" som centrerad rubrik över Room Code (ingen
              kantlinje-ruta längre) — kungakrona-ikon före texten. */}
          {hostMode && (
            <View style={styles.hostBadge}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M5 16L3 6l5 4 4-6 4 6 5-4-2 10H5zm0 2h14v2H5v-2z" fill={Colors.primary} />
              </Svg>
              <Text style={styles.hostBadgeText}>You are the host</Text>
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
          {/* Share invite är host-only — bara host bjuder in nya spelare */}
          {hostMode && (
            <TouchableOpacity onPress={handleOpenShareModal} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>↑ Share invite</Text>
            </TouchableOpacity>
          )}
        </Card>

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
        <View style={[styles.section, { marginTop: Spacing.xs }]}>
          {/* Non-host: skriv "GAME MODE - MULTIPLAYER" inline istället för
              klammer + label under toggle:n nedan. Båda delar samma
              sectionLabel-style → Typography.overline:s textTransform
              uppercasar hela strängen automatiskt. */}
          <Text style={styles.sectionLabel}>
            Game Mode
          </Text>

          {/* Game mode — grupperat i två rader istället för tre rutor bredvid
              varandra (för trångt). Single device får egen full-bredds-ruta;
              Multiplayer-lägena (Pass-the-Phone + Individual device) delar en
              rad. FREE-badge per ruta (grön aktiv / grå inaktiv). Read-only
              (disabled) för non-host. */}
          <Text style={styles.gameModeGroupLabel}>Single player mode</Text>
          {/* Spacer (flex 1) till höger → Single player-rutan blir halv bredd,
              vänsterställd, och linjerar med multiplayer-radens vänstra ruta. */}
          <View style={styles.modeRow}>
            {renderModeBox('single', 'Single player')}
            <View style={{ flex: 1 }} />
          </View>

          {/* Multiplayer mode-rubrik + info-ikon. Beskrivningstexten för PtP/
              IndDev ligger numera i info-ikonens popup istället för under rutorna. */}
          <View style={styles.multiplayerLabelRow}>
            <Text style={[styles.gameModeGroupLabel, { marginTop: 0, marginBottom: 0 }]}>Multiplayer mode</Text>
            <Pressable
              style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
              onPress={() =>
                Alert.alert(
                  'Multiplayer mode',
                  'Pass-the-Phone: Single device mode\n\nIndividual device: Multi-device mode / QuizVibe users only',
                )
              }
              hitSlop={8}
              accessibilityLabel="Multiplayer mode info"
            >
              <Text style={styles.infoIconText}>i</Text>
            </Pressable>
          </View>
          <View style={styles.modeRow}>
            {renderModeBox('ptp', 'Pass-the-Phone')}
            {renderModeBox('indiv', 'Individual device')}
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
                  'Max 4 players - use as standard and applicable for all Single and Multiplayer modes.\n\nMax 12 players - only applicable with Individual device mode',
                )
              }
              hitSlop={8}
              accessibilityLabel="Players info"
            >
              <Text style={styles.infoIconText}>i</Text>
            </Pressable>
          </View>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeOption, maxPlayers === 4 ? styles.modeOptionPassActive : styles.modeOptionInactive]}
              onPress={() => handleSelectMaxPlayers(4)}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 4 && styles.modeLabelActiveFree]}>
                Max 4 players
              </Text>
              <View style={[styles.freeBadge, maxPlayers !== 4 && styles.freeBadgeDimmed]} pointerEvents="none">
                <Text style={[styles.freeBadgeText, maxPlayers !== 4 && styles.freeBadgeTextDimmed]}>FREE</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeOption, maxPlayers === 12 && hasPremium ? styles.modeOptionPremiumActive : styles.modeOptionInactive]}
              onPress={() => handleSelectMaxPlayers(12)}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 12 && hasPremium && styles.modeLabelActivePremium]}>
                Max 12 players
              </Text>
              <View style={[styles.premiumBadge, !hasPremium && styles.premiumBadgeGrey]} pointerEvents="none">
                <Text style={[styles.premiumBadgeText, !hasPremium && styles.premiumBadgeTextGrey]}>PREMIUM</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>

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
          <Text style={styles.sectionLabel}>Game Connections</Text>
          <View style={styles.connectionsList}>
            {/* YouTube — alltid tillgänglig, host kan toggla av/på manuellt.
                Enabled-pillen får grön kantlinje + FREE-badge (samma border-
                skärande badge-mönster som Pass-the-Phone-knappen). Switchen
                till höger är host-only och får grön track när på, röd när av.
                Ikonen är YouTube:s officiella play-button (röd rounded-rect
                + vit triangel) per deras Branding Guidelines — signalerar
                tydligt att klippen kommer från YouTube. */}
            <View style={styles.connectionRow}>
              <View style={styles.connectionIconWrap}>
                <YouTubeBrandIcon size={28} />
              </View>
              <Text style={styles.connectionLabel}>YouTube</Text>
              {/* FREE-badgen sitter alltid kvar — i Enabled-läge med grön bg
                  och svart text, i Disabled-läge med grå bg och dämpad text
                  så den signalerar "ingår gratis" utan att konkurrera med
                  Disabled-pillens budskap. */}
              <View style={youtubeEnabled ? styles.youtubeEnabledPill : styles.statusPillDisabled}>
                <Text style={youtubeEnabled ? styles.youtubeEnabledText : styles.statusPillTextDisabled}>
                  {youtubeEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View
                  style={[styles.freeBadgeSmall, !youtubeEnabled && styles.freeBadgeSmallGrey]}
                  pointerEvents="none"
                >
                  <Text style={[styles.freeBadgeTextSmall, !youtubeEnabled && styles.freeBadgeSmallTextGrey]}>
                    FREE
                  </Text>
                </View>
              </View>
              {hostMode && (
                <Switch
                  value={youtubeEnabled}
                  onValueChange={(v) => handleToggleSource(youtubeEnabled, setYoutubeEnabled, v)}
                  trackColor={{ false: Colors.error, true: Colors.success }}
                  thumbColor="#FFF"
                  // iOS native Switch:s track-fill är något smalare än outer
                  // pill, så `ios_backgroundColor` läcker som en tunn röd
                  // flärd vid kanterna även när toggle är ON. Synca med
                  // aktiv track-färg så ingen röd flärd syns när aktiverad.
                  ios_backgroundColor={youtubeEnabled ? Colors.success : Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>
            {/* ── Profiles Images ── foto-biblioteket (riktiga bilder +
                  mosaik-reveal). Q-cirkel med "?"-glyph. Räknas i min-1-
                  guarden (handleToggleSource). Tidigare "Profiles"-förälder
                  med Images + Sketch-undertoggles — "Profiles"-rubriken + hela
                  Sketch-alternativet borttaget ur lobbyn 2026-06-01 (doodlen
                  var aldrig wirad till quiz-poolen). `sketchEnabled`-state
                  lämnas som död plumbing så settings/DB-synken är orörd. */}
            <View style={styles.connectionRow}>
              <View style={styles.connectionIconWrap}>
                <Svg width={28} height={28} viewBox="24 22 32 32" style={StyleSheet.absoluteFillObject}>
                  <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.primary} strokeWidth="2.5" />
                  <Path d="M49 47 L53 51" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
                <Text style={styles.connectionIconAiText}>?</Text>
              </View>
              <Text style={styles.connectionLabel}>Profiles Images</Text>
              <View style={imagesEnabled ? styles.youtubeEnabledPill : styles.statusPillDisabled}>
                <Text style={imagesEnabled ? styles.youtubeEnabledText : styles.statusPillTextDisabled}>
                  {imagesEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View
                  style={[styles.freeBadgeSmall, !imagesEnabled && styles.freeBadgeSmallGrey]}
                  pointerEvents="none"
                >
                  <Text style={[styles.freeBadgeTextSmall, !imagesEnabled && styles.freeBadgeSmallTextGrey]}>
                    FREE
                  </Text>
                </View>
              </View>
              {hostMode && (
                <Switch
                  value={imagesEnabled}
                  onValueChange={(v) => handleToggleSource(imagesEnabled, setImagesEnabled, v)}
                  trackColor={{ false: Colors.error, true: Colors.success }}
                  thumbColor="#FFF"
                  ios_backgroundColor={imagesEnabled ? Colors.success : Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>

            {/* Main categories — host-toggle som filtrerar quiz-poolen via
                backend-subject → MainCategory-mappning. Mellan Game
                Connections-källorna (YouTube/Images ovan) och Customized
                Host packages-sub-blocket nedan. Speglar Profile:s
                motsvarande sektion 1:1 men visas för alla i lobbyn —
                host-only-tap via disabled-flagga. Min 1 enforce:as i
                handleToggleMainCategory så listan aldrig blir tom. */}
            <View style={styles.mainCategoryBlock}>
              <View style={styles.regionLabelRow}>
                <Text style={styles.sectionLabel}>Person type portfolio</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() =>
                    Alert.alert(
                      'Person type portfolio',
                      'Quiz questions are drawn only from active person types. At least 1 must be enabled.',
                    )
                  }
                  hitSlop={8}
                  accessibilityLabel="Person type portfolio info"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <View style={styles.mainCategoryToggle}>
                {MAIN_CATEGORIES.map((cat) => {
                  const isActive = enabledMainCategories.includes(cat);
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => handleToggleMainCategory(cat)}
                      disabled={!hostMode}
                      style={[
                        styles.mainCategoryBox,
                        isActive ? styles.mainCategoryBoxActive : styles.mainCategoryBoxInactive,
                      ]}
                    >
                      <View style={[styles.mainCategoryFreeBadge, !isActive && styles.mainCategoryFreeBadgeGrey]}>
                        <Text style={[styles.mainCategoryFreeBadgeText, !isActive && styles.mainCategoryFreeBadgeTextGrey]}>FREE</Text>
                      </View>
                      <Text
                        style={[
                          styles.mainCategoryLabel,
                          isActive && styles.mainCategoryLabelActive,
                        ]}
                      >
                        {MAIN_CATEGORY_LABELS[cat]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
                  innehåll utan extra-paket; höger: "+ Add host packages" som
                  navigerar till Store. Båda halvbreda (flex: 1 + gap: 4 i
                  raden). Generic lyser grön när inga extra-paket är valda
                  ELLER när alla tillgängliga paket är valda; dämpas till grå
                  vid partial selection. Host-only — guests ska varken se
                  köp-knappen eller Generic-toggle:n. */}
              {hostMode && (() => {
                // Generic är aktiv (grön) när inga extra-paket är valda.
                // Så fort minst ett paket är valt — inklusive Select all-
                // läget — dämpas Generic till grå (paketen är nu i bruk
                // istället för bara basic-utbudet).
                const isGenericActive = selectedExtraPackages.length === 0;
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
                      style={styles.addPackageBtn}
                      onPress={() => router.push({ pathname: '/store' as const, params: { focus: 'packages-only', from: '/lobby', fromCode: roomCode } })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modeLabel}>+ Add Host packages</Text>
                      <View
                        style={[styles.premiumBadge, styles.premiumBadgeGrey]}
                        pointerEvents="none"
                      >
                        <Text style={[styles.premiumBadgeText, styles.premiumBadgeTextGrey]}>
                          PREMIUM
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })()}

              {/* Yttre svart container som omsluter Buy CTA + paketlistan —
                  speglar modeToggle:s padding (3), gap (4), borderRadius (md)
                  och Colors.background-bakgrund. Det ger Buy CTA samma
                  inre avstånd från ramen som Individual Devices har i
                  Game Mode-toggeln. */}
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
                        {hostMode ? 'No customized package purchased' : 'No extra packages active in this lobby'}
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
            </View>
          </View>
        </View>
        </View>
        )}{/* /gameSettingsBorder */}
        </View>{/* /Game Settings section */}

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
                  const isLast = i === maxPlayers - 1;
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
            {hostMode && gameMode === 'pass-the-phone' && (
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
                assistance={player.assistance}
                isHostPlayer={player.isHost}
                isGuest={player.type === 'guest'}
                turnNumber={gameMode === 'pass-the-phone' ? index + 1 : undefined}
                showApproveToggle={hostMode && !player.isHost && !player.hasLeft}
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
                {hostMode && waitingForApproval.length > 0 && (
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
                    assistance={player.assistance}
                    isHostPlayer={false}
                    isGuest={player.type === 'guest'}
                    showApproveToggle={hostMode && !player.hasLeft}
                    approved={false}
                    onApproveChange={(next) => handleSetApproved(player.id, next)}
                    hasLeft={player.hasLeft}
                    onDelete={hostMode ? () => handleDeletePlayer(player.id) : undefined}
                    onEditPlayer={hostMode && !player.hasLeft ? () => openPlayerEdit(player.id) : undefined}
                    peerHealth={
                      gameMode === 'individual-devices'
                        ? player.id === ownPlayerIdRef.current
                          ? 'self'
                          : lobbyPeerHealth[player.id]
                        : undefined
                    }
                  />
                ))}
              </View>
            )}

          </View>
          </>)}
        </View>

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
              {hostMode && (
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
              {hostMode && eraAtToFloor && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ To-year can not be earlier than 1980</Text></View>}
              {hostMode && eraAtMinInterval && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ Min interval 15 years</Text></View>}
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
                  under för att stega och se intervallet. */}
              {hostMode ? (
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
                      style={[styles.roundsStepperBtn, roundsCount >= roundsMax && styles.roundsStepperBtnDisabled]}
                      onPress={handleIncrementRounds}
                      disabled={roundsCount >= roundsMax}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roundsStepperBtnText, roundsCount >= roundsMax && styles.roundsStepperBtnTextDisabled]}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <RoundsRuler
                      value={roundsCount}
                      min={ROUNDS_MIN}
                      gameModeMax={roundsMax}
                      onPremiumPress={() => {
                        // 20 rundor är en subscription-perk OBEROENDE av läge —
                        // alltid Store-upsell (IndDev är inte längre unlock:en).
                        router.push({ pathname: '/store' as const, params: { focus: 'subscription', from: '/lobby', fromCode: roomCode } });
                      }}
                      hasSubscription={hasPremium}
                    />
                  </View>
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
              {/* 4-knapps-rad (15/30/45/60). Renderas för alla i lobbyn så
                  non-host ser host:s val i real-tid; bara host kan ändra
                  (disabled={!hostMode}). Default-värdet seeds från host:s
                  profil via host-seed-effekten ovan. */}
              <View style={styles.responseRow}>
                {([15, 30, 45, 60] as const).map((sec) => {
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

        {/* ── Start game ────────────────────────────────────────
            Host-only — non-host kan inte trigga spelstart. När backend
            kommer in pushas alla godkända spelare in i quizet via socket-
            event som host:s Start Game-tap fyrar. */}
        {hostMode && (
          <View style={styles.startSection}>
            {/* Gold-glowing CTA. Animated halo-View + iOS gold-shadow ger
                cross-platform glow (Android har ingen shadowColor-support, då
                bär halo:n hela glow-effekten). Mörk text mot gold-bg matchar
                era-slider-thumb-mönstret (Colors.background-glyph på guld). */}
            <Animated.View
              style={[styles.startGameWrap, { transform: [{ scale: startPulse }] }]}
            >
              <Animated.View
                style={[styles.startGameHalo, { opacity: startGlow }]}
                pointerEvents="none"
              />
              <Pressable
                onPress={() => handleStartGame()}
                style={({ pressed }) => [
                  styles.startGameButton,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.startGameLabel}>Start Game</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {/* Non-host: status-ruta i samma layout-position som host:s
            Start Game-knapp. Sekventiella prickar signalerar att appen
            lever och väntar på host:ens spelstart. Gold-glowing visuellt
            språk speglar host:s Start Game-knapp så båda roller har samma
            "ready"-vibe i CTA-positionen. */}
        {!hostMode && (
          <View style={styles.startSection}>
            <Animated.View
              style={[styles.startGameWrap, { transform: [{ scale: startPulse }] }]}
            >
              <Animated.View
                style={[styles.startGameHalo, { opacity: startGlow }]}
                pointerEvents="none"
              />
              <View style={[styles.startGameButton, styles.waitingForHostBox]}>
                <Text style={styles.waitingForHostText}>Waiting for Host to Start Game</Text>
                <SequentialDots color={Colors.background} />
              </View>
            </Animated.View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Scroll-hint-pil — guidar ner till Start Game-knappen. Samma som
          quiz.tsx:s namn-fråge-pil (blink-puls, auto-göm vid botten). */}
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
      <AddPlayerModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddPlayer} takenGuestLetters={takenGuestLetters} />

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
                  som svårare) från spelarens default. Ingen riktnings-låsning. */}
              <View style={playerEditSheet.fieldGroup}>
                <Text style={playerEditSheet.fieldLabel}>Assistance Level</Text>
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

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Scroll-hint-pil — speglar quiz.tsx:s scrollHintStyles 1:1 (blå pill + vit ⌄).
const lobbyScrollHintStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: Spacing.lg,
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
  guestLeaveCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  guestLeaveCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },

  // Lobby-header — title vänster, Host Game Credits-pill höger.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  // Non-host: "Music. Film. Sport." på samma rad som Game Lobby (höger). Mindre
  // än room-card-varianten + glowing gold, så den ryms i headern.
  headerTagline: {
    flexShrink: 1,
    fontSize: 19,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
    letterSpacing: 0.2,
    textAlign: 'right',
    textShadowColor: Colors.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  // Speglar Profile:s creditsPill 1:1 (samma styling, samma layout) så
  // pillen ser identisk ut i båda vyerna och användaren känner igen den.
  creditsPill: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    // Större gap mellan label och values-row så Extras-boxens kant-
    // skärande PREMIUM-badge (top:-7) inte överlappar "HOST GAME CREDITS"-
    // texten ovanför.
    gap: 8,
    minWidth: 210,
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
  creditsLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
  screenTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },

  // "You are the host" — centrerad rubrik (ingen pill/kantlinje) över Room Code.
  hostBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'center', marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  hostBadgeText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },

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
    // Samma storlek som non-host:ens headerTagline (2026-06-01).
    fontSize: 19,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: Colors.warning,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    marginTop: 6,
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
  // Use Packages — sub-block för musikpaket-val. Vänsterställt mot
  // connectionsList-kanten så "Extra packages:"-labeln och chipsen börjar
  // på samma x-position som ikonerna på YouTube-/Images-raderna ovanför.
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
    right: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 14,
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

  regionTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  regionTriggerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  startSection: { gap: Spacing.md },
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
  // Gold-glowing Start Game-knapp (host-only). Wrap håller position-context
  // för halo:n; halo är absolut-positionerad ruta som extender utanför
  // knappens kanter och får opacity-pulserad bakgrundsfärg så glow:en lyser
  // genom utan att klippas av knappens egen border-radius.
  startGameWrap: {
    position: 'relative',
    alignSelf: 'stretch',
  },
  startGameHalo: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: Radius.md + 4,
    backgroundColor: Colors.warning,
  },
  startGameButton: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  startGameLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    letterSpacing: 0.6,
  },

  // Waiting-ruta för non-host — speglar Button:s base-mått (52px höjd,
  // Radius.md) men styls som en passiv status-pillar med subtila brand-
  // toner: primaryMuted bg + primaryBorder kant + textPrimary text.
  // Layouten är row så texten + SequentialDots står på samma rad.
  // Override på startGameButton för Waiting-rutan: byt till row-layout så
  // text + SequentialDots står sida vid sida. Bg/glow/storlek ärvs från
  // startGameButton (gold-bg + iOS shadow). Kombineras via stil-array i
  // render: [styles.startGameButton, styles.waitingForHostBox].
  waitingForHostBox: {
    flexDirection: 'row',
  },
  waitingForHostText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    letterSpacing: 0.4,
  },
  startHint: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 17 },
  bottomPad: { height: Spacing.xl },
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