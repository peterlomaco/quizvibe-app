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
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Circle, Path } from 'react-native-svg';
import { ApproveToggle } from '../components/ApproveToggle';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CodeKeyboard } from '../components/CodeKeyboard';
import { EraMarkerMinus, EraMarkerPlus } from '../components/EraSliderMarker';
import { Player, PlayerRow } from '../components/PlayerRow';
import { QuizVibeFriendsLogo } from '../components/QuizVibeFriendsLogo';
import { QuizVibeLogo } from '../components/QuizVibeLogo';
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
import { loadFriends, type Friend } from '../utils/friendsStorage';
import { MIN_HCP, calculateInitialHCP } from '../utils/hcp';
import { addLeftPlayer, getLeftPlayers } from '../utils/leftPlayers';
import { deactivateRoom, isActiveRoom, setRoomMaxPlayers, setRoomPlayerCount } from '../utils/mockActiveRooms';
import { PURCHASED_PACKAGES } from '../utils/mockPurchasedPackages';
import { consumePendingLobbyPlayers } from '../utils/pendingLobby';
import { generatePlayerName } from '../utils/playerName';
import { containsProfanity } from '../utils/profanity';
import { loadProfile, saveProfile, type ProfileData, type Region as ProfileRegion } from '../utils/profileStorage';
import { ROOM_CODE_DIGITS, ROOM_CODE_LEADING_LETTERS, formatRoomCode, generateRoomCode } from '../utils/roomCode';
import { addInvite } from '../utils/waitingInvites';

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
  // Driver "Spotify enabled/disabled"-statusen i Game Connections-sektionen.
  // Sätts från profile.spotifyConnected för registrerade spelare (host via
  // mergeProfileIntoHost, room-code-joiners via deras profil när det flödet
  // implementeras). Guests och manuellt tillagda spelare lämnas falsy —
  // de räknas alltid som "ej Spotify-kopplade".
  spotifyConnected?: boolean;
  // True om spelaren har lämnat lobby:n via TopUserBanner → Leave Game Lobby-
  // flödet. Persisteras per rumkod via src/utils/leftPlayers.ts och appliceras
  // av LobbyScreen:s useFocusEffect. PlayerRow renderar då greyed-out text +
  // "LEFT THIS GAME LOBBY"-label så övriga i lobby:n ser att spelaren gått.
  hasLeft?: boolean;
}

type GameMode = 'pass-the-phone' | 'individual-devices';

// Year-of-birth gränser (samma som registreringsformuläret för gäster) ....
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
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
      spotifyConnected: profile.spotifyConnected ?? existing.spotifyConnected,
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
    spotifyConnected: profile.spotifyConnected ?? false,
  };
}

const SEED_PLAYERS: LobbyPlayer[] = [
  { id: '1', name: 'Alex K.',   emoji: '🦊', isReady: true,  type: 'registered', hcpComplete: true,  age: 32, assistance: 'standard', isHost: true, approved: true,  spotifyConnected: true  },
  { id: '2', name: 'Sam L.',    emoji: '🎸', isReady: true,  type: 'registered', hcpComplete: true,  age: 28, assistance: 'minimal',                approved: false, spotifyConnected: true  },
  { id: '3', name: 'Jordan M.', emoji: '🤖', isReady: true,  type: 'guest',      hcpComplete: true,  age: 35, assistance: 'standard',               approved: false                          },
  { id: '4', name: 'Casey P.',  emoji: '🐉', isReady: true,  type: 'registered', hcpComplete: true,  age: 41, assistance: 'full',                   approved: false, spotifyConnected: false },
];

const REGIONS = ['Sweden', 'Nordics', 'Europe', 'Global'] as const;
type Region = typeof REGIONS[number];

// Profile-skärmen lagrar region som lowercase ('sweden' | 'nordics' | 'global')
// medan Lobby:s Region-set är capitalized + inkluderar 'Europe'. Mappa över
// vid seed; null = profile saknar region (eller har okänt värde) så caller
// kan applicera generic 'Global'-fallback.
function mapProfileRegion(r: ProfileRegion | null | undefined): Region | null {
  if (r === 'sweden') return 'Sweden';
  if (r === 'nordics') return 'Nordics';
  if (r === 'global') return 'Global';
  return null;
}

// (Music packages — extra paket host kan köpa via QuizVibe Store och välja
// per room — har flyttats till `src/utils/mockPurchasedPackages.ts` så
// Profile-vyn delar samma mock. Importen sker högst upp.)

const REGION_FLAGS: Record<Region, string> = {
  Sweden: '🇸🇪', Nordics: '🌐', Europe: '🇪🇺', Global: '🌍',
};

// ERA_MIN = 1930 så slider-värdet matchar tidsaxelns vänsterkant ("<1930").
// Tidigare gick slidern 1900..currentYear medan axeln visuellt började vid
// "<1930" — det skapade en 30-års-förskjutning mellan thumb-position och
// vad rutan ovan visade. Nu mappar 0 % → 1930 och 100 % → currentYear.
const ERA_MIN = 1930;
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
// Ett 10-årigt fönster är minimum för att frågedatabasen ska kunna leverera
// ett rimligt urval — kortare span blir för glest.
const ERA_MIN_INTERVAL = 10;
// MultiSlider:s minMarkerOverlapDistance är i pixel — räkna ut hur många
// pixel 10 år motsvarar på SLIDER_INNER_WIDTH-skalan så lib:n håller
// markörerna från att komma närmare än så. Ceil för att inte underskrida.
const ERA_MIN_INTERVAL_PX = Math.ceil((ERA_MIN_INTERVAL / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH);

// (Antal rundor: konstanter + RoundsRuler-komponenten lever i shared
// `src/components/RoundsRuler.tsx` så både Lobby och Profile delar samma
// implementation. Importen sker högst upp i fil-huvudet.)

function clampEraToPlayer(fromYear: number, toYear: number, players: LobbyPlayer[]) {
  const currentYear = new Date().getFullYear();
  const ages = players.filter((p) => p.hcpComplete && p.age).map((p) => p.age as number);
  if (ages.length === 0) return { from: fromYear, to: toYear, warning: null };
  const youngestBirth = currentYear - Math.min(...ages);
  if (toYear < youngestBirth) {
    const adjustedFrom = Math.max(ERA_MIN, toYear - 10);
    return { from: adjustedFrom, to: toYear, warning: `Youngest player born ${youngestBirth}. Showing: ${adjustedFrom}–${toYear}.` };
  }
  return { from: fromYear, to: toYear, warning: null };
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
    { label: '<1930', year: ERA_MIN },
    { label: '1940', year: 1940 },
    { label: '1950', year: 1950 },
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
          <Text style={regionSheet.subtitle}>Sets the cultural context for questions</Text>
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
// motsvarande lista i app/(tabs)/index.tsx så Add Player-flödet känner
// samma collisions som Join as Guest. TODO (backend): byt mot riktig
// playerName-uniqueness-check.
const TAKEN_PLAYER_NAMES_LOBBY = new Set([
  'player one', 'anna', 'kalle', 'admin', 'test', 'guest', 'host', 'quizvibe',
]);

type AddPlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function validateAddPlayerName(name: string): 'available' | 'taken' | 'invalid' {
  const trimmed = name.trim();
  if (containsProfanity(trimmed)) return 'invalid';
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

function AddPlayerModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, age: number, assistance: AddPlayerAssistance) => void;
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
  const playerNameInputRef = useRef<TextInput>(null);
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
  // registrerad user. Manuell ändring återställer status till 'idle' och
  // kräver Check innan fältet räknas validerat igen.
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;
    if (visible && !wasVisible && name === '') {
      const generated = generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, 'Guest');
      setName(generated);
      setPlayerNameStatus('available');
    }
  }, [visible, name]);

  // Sekventiella låsnings-gates — speglar Join-as-Guest-formen exakt
  // (utan code-steget).
  const yearUnlocked = playerNameStatus === 'available';
  const assistanceUnlocked = yearUnlocked && birthYear !== null;
  const isFormValid = playerNameStatus === 'available' && birthYear !== null;

  const handleNameChange = (t: string) => {
    setName(t);
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const handleCheckPlayerName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setPlayerNameStatus('checking');
    // Mock-latens — byt mot riktigt API-anrop när backend finns.
    setTimeout(() => {
      setPlayerNameStatus(validateAddPlayerName(trimmed));
    }, 600);
  };

  const handleRemoveName = () => {
    setName('');
    setPlayerNameStatus('idle');
    playerNameInputRef.current?.focus();
  };

  const handleGenerateName = () => {
    const generated = generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, 'Guest');
    setName(generated);
    setPlayerNameStatus('available');
    Keyboard.dismiss();
  };

  // Custom CodeKeyboard skickar tecknet vidare hit. Första bokstaven
  // versal, resten gemener — stilfullare lobbyn-display ("Anna" istf "ANNA").
  const handlePlayerNameKeyPress = (char: string) => {
    setName((prev) => {
      if (prev.length >= 20) return prev;
      let appended = char;
      if (/[A-Z]/.test(char)) {
        const hasLetter = /[A-Za-z]/.test(prev);
        appended = hasLetter ? char.toLowerCase() : char;
      }
      return prev + appended;
    });
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const handlePlayerNameBackspace = () => {
    setName((prev) => prev.slice(0, -1));
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const togglePlayerNameKbMode = () => {
    setPlayerNameKbMode((m) => (m === 'letter' ? 'digit' : 'letter'));
  };

  const handleAdd = () => {
    if (!isFormValid || birthYear === null) return;
    const age = CURRENT_YEAR - birthYear;
    onAdd(name.trim(), age, assistance);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.container}>
          <Text style={modal.title}>Add Player</Text>
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
                  ref={playerNameInputRef}
                  style={[
                    modal.inputText,
                    modal.playerNameInput,
                    playerNameStatus !== 'available' && modal.playerNameInputActive,
                  ]}
                  placeholder="Pick a unique Player Name"
                  placeholderTextColor={Colors.textDisabled}
                  value={name}
                  onChangeText={handleNameChange}
                  maxLength={20}
                  editable={playerNameStatus !== 'checking'}
                  showSoftInputOnFocus={false}
                  onFocus={() => {
                    setPlayerNameKbMode('letter');
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
                  disabled={name.length > 0 || playerNameStatus === 'checking'}
                  style={[
                    modal.nameActionBtn,
                    (name.length > 0 || playerNameStatus === 'checking') &&
                      modal.nameActionBtnDisabled,
                  ]}
                >
                  <Text style={modal.nameActionBtnText}>Auto-generate</Text>
                </TouchableOpacity>
              </View>
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
                  ✗ Player Name contains inappropriate language — try another
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

// ─── SequentialDots ───────────────────────────────────────────────────────────

/**
 * Tre prickar som tänds en och en med fade-in, sedan släcks alla samtidigt
 * och cykeln börjar om. Används av "Waiting for Host to Start Game…"-rutan
 * för icke-host så de visuellt ser att appen väntar/lever. Cykellängd 1600ms
 * (0/400/800ms-stagger för ON, alla OFF vid 1200ms, 400ms blank-period).
 */
function SequentialDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeMs = 100;
    const makeDot = (val: Animated.Value, onAt: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(onAt),
          Animated.timing(val, { toValue: 1, duration: fadeMs, useNativeDriver: true }),
          Animated.delay(1200 - onAt - fadeMs),
          Animated.timing(val, { toValue: 0, duration: fadeMs, useNativeDriver: true }),
          Animated.delay(300),
        ]),
      );
    const a1 = makeDot(dot1, 0);
    const a2 = makeDot(dot2, 400);
    const a3 = makeDot(dot3, 800);
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
    <View style={sequentialDotsStyles.row}>
      <Animated.Text style={[sequentialDotsStyles.dot, { opacity: dot1 }]}>.</Animated.Text>
      <Animated.Text style={[sequentialDotsStyles.dot, { opacity: dot2 }]}>.</Animated.Text>
      <Animated.Text style={[sequentialDotsStyles.dot, { opacity: dot3 }]}>.</Animated.Text>
    </View>
  );
}

const sequentialDotsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  dot: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginHorizontal: 1,
    lineHeight: 20,
  },
});

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

  const [players, setPlayers] = useState<LobbyPlayer[]>(SEED_PLAYERS);

  // Eget player-id (host:s seed-id för host, eller den auto-tillagda
  // guest/joiner-id:n för non-hosts). Används av leave-flödet för att
  // markera rätt spelare som "left" i leftPlayers-storen så övriga ser
  // status:en när de öppnar lobby:n.
  const ownPlayerIdRef = useRef<string | null>(null);

  // Vid mount OCH vid URL-params-ändring (när lobby-tabben återanvänds över
  // host→guest-transitions inom samma tab-instans, t.ex. host som går home
  // och sen joinar som guest med sin egen kod): kolla pending players från
  // Play Again, annars auto-adda spelaren baserat på guest/non-host/host-flow.
  // Reset:ar players till SEED_PLAYERS + nollar ownPlayerIdRef innan logiken
  // körs så vi inte ärver state från en tidigare lobby-session i samma instans.
  useEffect(() => {
    let cancelled = false;
    setPlayers(SEED_PLAYERS);
    ownPlayerIdRef.current = null;
    // Host: seed lobby-wide settings från profil (Profile:s "Host default
    // settings"-block). Per-fält fallbacks följer den generiska spec:en
    // (Pass-the-Phone, Max 4, Global, 1981→innevarande år, ROUNDS_DEFAULT, 30 sek)
    // när profilen saknas eller fältet är otomt. Effekten triggar både
    // vid första mount OCH vid Play Again-återinträde (component re-mountar).
    if (hostMode) {
      loadProfile().then((profile) => {
        if (cancelled) return;
        const profileGameMode = profile?.gameMode ?? 'pass-the-phone';
        setGameMode(profileGameMode);
        setMaxPlayers(profile?.maxPlayers ?? 4);
        setSinglePlayerDefault(profile?.singlePlayerDefault ?? false);
        setRegion(mapProfileRegion(profile?.region) ?? 'Global');
        setAnswerResponseSeconds(profile?.answerResponseSeconds ?? 30);
        const eraFrom = profile?.gameEraFrom ?? 1981;
        const eraTo = profile?.gameEraTo ?? ERA_MAX;
        setEraValues([
          Math.max(ERA_MIN, eraFrom),
          Math.min(ERA_MAX, eraTo),
        ]);
        // Clamp roundsCount mot gameMode:s tak (Pass-the-Phone capas vid 4,
        // Individual Devices vid 20) så ett gammalt sparat värde inte
        // hamnar utanför range:n.
        const savedRounds = profile?.roundsDefault ?? ROUNDS_DEFAULT;
        const initialMax = profileGameMode === 'pass-the-phone'
          ? ROUNDS_MAX_PASS
          : ROUNDS_MAX_INDIV;
        setRoundsCount(Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds)));
        // Filterlistan från Profile:s Customized Host packages-toggle.
        // Default = alla köpta paket aktiverade om profilen saknar fältet.
        setEnabledHostPackages(
          profile?.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id),
        );
      });
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
        const joinerId = `joiner-${Date.now()}`;
        ownPlayerIdRef.current = joinerId;
        const joiner: LobbyPlayer = {
          id: joinerId,
          name: profile?.playerName?.trim() || 'You',
          emoji: profile ? getAvatarEmojiById(profile.selectedAvatarId) : '👤',
          isReady: hcpComplete,
          type: profile ? 'registered' : 'guest',
          age,
          assistance,
          hcpComplete,
          spotifyConnected: profile?.spotifyConnected ?? false,
          approved: false,
        };
        setPlayers((prev) => {
          const hostIdx = prev.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...prev];
          next.splice(insertAt, 0, joiner);
          return next;
        });
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
      Promise.all([loadProfile(), getLeftPlayers(roomCode)]).then(([profile, leftSnapshots]) => {
        if (!active) return;
        // Speglar Profile:s credits-pill — refresh-logiken i loadProfile
        // top-up:ar `freeGameCredits` till FREE_CREDITS_DAILY_CAP vid första
        // load efter midnatt CET, så lobbyn visar alltid aktuellt värde.
        setFreeGameCredits(profile?.freeGameCredits ?? 0);
        setGameCredits(profile?.gameCredits ?? 0);
        setPlayers((prev) => {
          const leftIds = leftSnapshots.map((s) => s.id);
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
            const inLeft = leftIds.includes(next.id);
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
  const [roundsCount, setRoundsCount] = useState(ROUNDS_DEFAULT);
  const [region, setRegion] = useState<Region>('Global');
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
  // "Use single player mode as default" — när checkad dämpas Pass-the-Phone-
  // rutan i toggle:n. Speglar Profile:s motsvarande checkbox; lokal lobby-
  // state utan profil-pre-load (konsekvent med gameMode som också är lokal).
  const [singlePlayerDefault, setSinglePlayerDefault] = useState(false);

  // Max antal spelare per spel — 4 = Basic (gratis), 12 = Premium.
  // Lobby-local state; speglar Profile:s host-default-toggle.
  const [maxPlayers, setMaxPlayers] = useState<4 | 12>(4);
  // TODO (Store integration): byt mot riktig subscription-check när
  // RevenueCat är inkopplad.
  const hasPremium = false;

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
    setRoomPlayerCount(roomCode, activeCount);
  }, [players, roomCode]);
  useEffect(() => {
    if (!roomCode || !hostMode) return;
    setRoomMaxPlayers(roomCode, maxPlayers);
  }, [maxPlayers, roomCode, hostMode]);

  // Max rundor beror på gameMode — Pass-the-Phone capas vid 4, Individual
  // Devices vid 20. När host växlar läge clampas roundsCount automatiskt
  // ner om det skulle hamna utanför nya max:t.
  const roundsMax = gameMode === 'pass-the-phone' ? ROUNDS_MAX_PASS : ROUNDS_MAX_INDIV;
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
  // Host-override för Spotify ovanpå auto-regeln (alla spelare måste ha
  // Spotify-konto). Spotify visas som Enabled bara om både auto OCH toggle är på.
  const [spotifyHostToggle, setSpotifyHostToggle] = useState(true);
  // Profiles and Places styrs helt av host-toggeln. Default = på.
  const [profilesEnabled, setProfilesEnabled] = useState(true);
  // Use Packages — Basic-utbudet är alltid implicit aktivt (ingen UI). Hosten
  // kan välja till extra-paket ovanpå. Knytningen mellan packages och
  // room-code är implicit (lobby-state).
  const [selectedExtraPackages, setSelectedExtraPackages] = useState<string[]>([]);
  // Profil-styrd filterlista: bara paket som hosten aktiverat i sin
  // Profile (Customized Host packages-toggle) visas i Lobby. Default =
  // alla paket aktiverade så nyköpta dyker upp utan extra steg via Profile.
  const [enabledHostPackages, setEnabledHostPackages] = useState<string[]>(
    () => PURCHASED_PACKAGES.map((p) => p.id),
  );
  const availablePackages = useMemo(
    () => PURCHASED_PACKAGES.filter((p) => enabledHostPackages.includes(p.id)),
    [enabledHostPackages],
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
  // TODO (Store integration): koppla till riktig köpstatus när Store-paketet är inkopplat.
  const hasMultiplayerPackage = false;

  const handleSelectMode = (mode: GameMode) => {
    if (mode === gameMode) return;
    if (mode === 'individual-devices' && !hasMultiplayerPackage) {
      Alert.alert(
        'Premium feature',
        'Multiplayer on individual devices requires the "Multiplayer Individual Devices" package. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store') },
        ],
      );
      return;
    }
    // Vid byte till Individual Devices: varna om host har manuellt tillagda
    // spelare. De saknar egen mobil och måste tas bort när alla ska spela
    // från sina egna enheter.
    if (mode === 'individual-devices') {
      const manualPlayers = players.filter((p) => p.addedByHost);
      if (manualPlayers.length > 0) {
        Alert.alert(
          'Switch to Individual Devices?',
          'Manual added players will be removed — ask them to join with their own device.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Switch & remove',
              style: 'destructive',
              onPress: () => {
                setPlayers((prev) => prev.filter((p) => !p.addedByHost));
                setGameMode(mode);
              },
            },
          ],
        );
        return;
      }
    }
    setGameMode(mode);
  };

  // Försök att välja Max 12 utan Premium → Store-omdirigering. Speglar
  // handleSelectMode-pattern för Individual Devices utan paket.
  const handleSelectMaxPlayers = (value: 4 | 12) => {
    if (value === maxPlayers) return;
    if (value === 12 && !hasPremium) {
      Alert.alert(
        'Premium feature',
        'Hosting up to 12 players requires the Premium subscription. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store') },
        ],
      );
      return;
    }
    setMaxPlayers(value);
  };

  // Approved spelare = i spelet, har turn-nummer, syns överst.
  // Host räknas alltid som approved oavsett approved-flaggans värde.
  // Alla spelare som hamnar i lobbyn har komplett HCP (sätts vid Join as
  // Guest eller importeras automatiskt för registrerade användare) — så
  // det finns ingen "missing info"-grupp längre.
  const isPlayerApproved = (p: LobbyPlayer) => !!p.approved || !!p.isHost;
  const approvedPlayers = players.filter((p) => isPlayerApproved(p));
  const waitingForApproval = players.filter((p) => !isPlayerApproved(p));
  // Spotify-kravet beror på Game Mode:
  //  • Pass-the-Phone — bara en enhet skickas runt; en Spotify-låt skulle
  //    tvinga öppna Spotify-appen och stjäla fokus från QuizVibe, vilket
  //    bryter timern som tickar medan låten spelas. Spotify är därför
  //    alltid auto-Disabled i detta läge.
  //  • Individual Devices — varje spelare streamar låtarna på sin egen
  //    telefon, så ALLA godkända spelare behöver ett Spotify-konto.
  // Host kan ovanpå auto-regeln manuellt slå av via spotifyHostToggle;
  // visad status = auto AND host-toggle. Info-ikonen visas alltid i båda
  // lägena (enabled som disabled) med samma rules-text — så att användaren
  // alltid kan kontrollera vilket kriterium som gäller per Game Mode.
  const spotifyAutoEnabled =
    gameMode === 'individual-devices' &&
    approvedPlayers.length > 0 &&
    approvedPlayers.every((p) => p.spotifyConnected === true);
  const spotifyEnabled = spotifyAutoEnabled && spotifyHostToggle;
  // Minst en Game Connection-källa måste vara aktiv — annars finns inget
  // underlag att hämta frågor från. Räkna aktiva källor och blockera när
  // användaren försöker stänga av den enda kvarvarande.
  const enabledSourceCount =
    (youtubeEnabled ? 1 : 0) + (spotifyEnabled ? 1 : 0) + (profilesEnabled ? 1 : 0);
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
  const { from: clampedFrom, to: clampedTo, warning: eraWarning } = clampEraToPlayer(eraValues[0], eraValues[1], players);

  // Räkna aktiva spelare (exkl. hasLeft, vars plats är frigjord) — används
  // som capacity-check både vid + Add Player-knappen och vid Confirm i
  // formuläret. Defensiv dubbel-check skyddar mot race conditions där
  // någon annan joinar via room code mellan knapp-tryck och confirm.
  const isLobbyAtCapacity = () =>
    players.filter((p) => !p.hasLeft).length >= maxPlayers;

  // Tryck på "+ Add Player" — blockera redan här om lobbyn är full så
  // host inte slösar tid på att fylla i formuläret.
  const handleOpenAddPlayer = () => {
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
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, approved } : p));
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
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPlayers((prev) => prev.filter((p) => p.id !== id));
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
  const ASSISTANCE_RANK: Record<'minimal' | 'standard' | 'full', number> = {
    full: 2,
    standard: 1,
    minimal: 0,
  };

  // Tap-tid-validering på Assistance-knappen — visar popup för disallowed
  // transitions istället för att uppdatera state. Tillåtna: stå still
  // (samma värde), eller progress nedåt i ranken. Disallowed: höja
  // ranken eller röra Minimal alls.
  const handleSelectEditAssistance = (next: 'minimal' | 'standard' | 'full') => {
    const current = playerEditTarget?.assistance ?? 'standard';
    if (current === 'minimal' && next !== 'minimal') {
      Alert.alert(
        'Cannot change Minimal',
        'Once a player has Minimal assistance, it cannot be changed.',
      );
      return;
    }
    if (ASSISTANCE_RANK[next] > ASSISTANCE_RANK[current]) {
      Alert.alert(
        'Cannot raise assistance',
        'Assistance can only progress in the order Full → Standard → Minimal.',
      );
      return;
    }
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
    const originalAssistance = target.assistance ?? 'standard';

    // 1) Age får bara höjas (= tidigare birth year). Stå-still tillåtet.
    if (nextAge < originalAge) {
      Alert.alert(
        'Cannot lower age',
        'Age can only be raised — pick an earlier Year of Birth.',
      );
      return;
    }

    // 2) Assistance: dubbelkollar samma regler som tap-tid-checken (host
    //    kan ha öppnat picker:n med disallowed seedAssistance från korrupt
    //    state, eller om vi i framtiden tillåter direkt-input). Belt + suspenders.
    if (originalAssistance === 'minimal' && editAssistance !== 'minimal') {
      Alert.alert(
        'Cannot change Minimal',
        'Once a player has Minimal assistance, it cannot be changed.',
      );
      return;
    }
    if (ASSISTANCE_RANK[editAssistance] > ASSISTANCE_RANK[originalAssistance]) {
      Alert.alert(
        'Cannot raise assistance',
        'Assistance can only progress in the order Full → Standard → Minimal.',
      );
      return;
    }

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
    setShareModalOpen(true);
    const list = await loadFriends();
    setFriends(list);
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
              // Spara hela snapshot:en av lämnande spelaren så nya joiners
              // som kommer in i samma rum efter detta kan rendera kortet
              // som "LEFT THIS GAME LOBBY" — inte bara id:t (då har de inte
              // den lämnande spelaren i sin lokala SEED-baseline).
              await addLeftPlayer(roomCode, {
                id: ownPlayer.id,
                name: ownPlayer.name,
                emoji: ownPlayer.emoji,
                avatarUri: ownPlayer.avatarUri,
                type: ownPlayer.type,
                age: ownPlayer.age,
                assistance: ownPlayer.assistance,
                hcpComplete: ownPlayer.hcpComplete,
                approved: ownPlayer.approved,
              });
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
          onPress: () => {
            // Deaktivera rummet direkt så non-hosts polling-detection
            // upptäcker det inom ~2s (även medan host:s loading-overlay
            // visas — det är realistiskt async-beteende).
            deactivateRoom(roomCode);
            // Visa loading-overlay i ~1.6s innan navigation. Ger host:en
            // visuell feedback att appen processar och matchar real-
            // backend-känsla där en DELETE-request tar några hundra ms.
            // VIKTIGT: stäng overlay:n EXPLICIT innan navigation. Lobby
            // ligger i (tabs)-gruppen och tab-navigatorn bevarar screen-
            // state över route-replace — utan dismiss skulle Modal:en
            // stå kvar synlig ovanpå Home-skärmen efter navigationen.
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

  // Non-host detection: pollar isActiveRoom var 2:a sekund. När rummet
  // blir inaktivt (host har deletat det) sätter vi roomDeletedDetected=true
  // som triggar Alert:en nedanför. Polling istället för event-driven
  // (som backend) eftersom mockstoren bara är in-memory utan event-bus.
  // Host själv exkluderas — de som deletat ska inte få sin egen popup.
  useEffect(() => {
    if (hostMode) return;
    // Initial check direkt vid mount så vi inte behöver vänta polling-
    // intervallet om rummet redan är deletat när användaren landar.
    if (!isActiveRoom(roomCode)) {
      setRoomDeletedDetected(true);
      return;
    }
    const interval = setInterval(() => {
      if (!isActiveRoom(roomCode)) {
        setRoomDeletedDetected(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [hostMode, roomCode]);

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

  // Skickar invite in-app till en vän — sparas i deras Waiting Invites.
  // Använder hostens profil-playerName/avatar som "from"-data.
  const handleInviteFriend = async (friend: Friend) => {
    const profile = await loadProfile();
    const fromPlayerName = profile?.playerName?.trim() || 'Host';
    await addInvite({
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

  const handleStartGame = async () => {
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
      }));

    if (turnOrder.length === 0) {
      Alert.alert('Cannot start', 'No approved players to start the game.');
      return;
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
    if (free === 0 && extras === 0) {
      Alert.alert(
        'Out of Host Game Credits',
        'You have no credits left for today. Buy extra credits in Store, wait for the daily refresh at midnight CET, or upgrade to a QuizVibe membership for unlimited host games.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/(tabs)/store') },
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

    router.push({
      pathname: '/quiz',
      params: {
        assistance: 'standard',
        age: '32',
        gameMode,
        players: JSON.stringify(turnOrder),
        roundsCount: String(roundsCount),
        // Tidsgränsen per fråga från host:s profil (default 30 sek). Quiz
        // använder den för timer-bar:en + reveal-trigger.
        answerResponseSeconds: String(answerResponseSeconds),
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
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Game Lobby</Text>
          {/* Host Game Credits-pill — speglar Profile:s motsvarande pill
              exakt (samma styling, samma värden via loadProfile-source).
              Tap navigerar till Store. Värdena uppdateras vid varje fokus
              på Lobby så de följer Profile:s state utan delay. */}
          <Pressable
            style={({ pressed }) => [
              styles.creditsPill,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push('/(tabs)/store')}
          >
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
                      { text: 'Go to Store', onPress: () => router.push('/(tabs)/store') },
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
        </View>

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
          {hostMode && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>👑 You are the host</Text></View>}
          <View style={[styles.roomCodeRow, !hostMode && styles.roomCodeRowGuestSpacing]}>
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

        {/* ── Game Settings ───────────────────────────────────────
            Game Mode + Game Connections delar en gemensam blåbordrad
            container. Ger semantiskt en "vad spelet ska spelas som"-sektion
            som visuellt skiljer sig från Players in Lobby nedanför. */}
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
          <Text style={styles.sectionLabel}>Game Mode</Text>

          {/* "Use single player mode as default" — sitter ovanför Game
              Mode-toggle:n. När checkad dämpas BÅDA multiplayer-rutorna
              (Pass-the-Phone + Individual Devices) eftersom single-player
              inte använder någon av dem. När bocken tas bort defaultar
              vi alltid till Pass-the-Phone (gratis-läget). Disabled för
              non-host (read-only följer host:s val — samma mönster som
              modeToggle nedan). */}
          <TouchableOpacity
            style={styles.singlePlayerRow}
            activeOpacity={0.7}
            onPress={() => {
              setSinglePlayerDefault((v) => {
                const next = !v;
                if (!next) {
                  // Uncheck → defaulta till gratis-läget på BÅDA
                  // toggles (Pass-the-Phone + Max 4) så lobby:n hamnar
                  // i ett konsekvent multiplayer-läge.
                  setGameMode('pass-the-phone');
                  setMaxPlayers(4);
                }
                return next;
              });
            }}
            disabled={!hostMode}
          >
            <View
              style={[
                styles.singlePlayerCheckbox,
                singlePlayerDefault && styles.singlePlayerCheckboxChecked,
              ]}
            >
              {singlePlayerDefault && (
                <Text style={styles.singlePlayerCheckmark}>✓</Text>
              )}
            </View>
            <Text style={styles.singlePlayerLabel}>
              Use single player mode as default
            </Text>
          </TouchableOpacity>

          <View style={styles.modeToggle}>
            {/* Pass-the-Phone */}
            <TouchableOpacity
              style={[
                styles.modeOption,
                singlePlayerDefault
                  ? styles.modeOptionDimmed
                  : gameMode === 'pass-the-phone'
                    ? (hostMode ? styles.modeOptionPassActive : styles.modeOptionIndivActive)
                    : styles.modeOptionInactive,
              ]}
              onPress={() => {
                // Tap på dämpad ruta = bocka av single-player-defaulten
                // OCH aktivera Pass-the-Phone i samma gest. Bara host:en
                // (disabled-prop blockar non-host innan vi når hit).
                if (singlePlayerDefault) {
                  setSinglePlayerDefault(false);
                  setGameMode('pass-the-phone');
                  return;
                }
                handleSelectMode('pass-the-phone');
              }}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeLabel,
                !singlePlayerDefault && gameMode === 'pass-the-phone' && styles.modeLabelActiveFree,
                singlePlayerDefault && styles.modeLabelDimmed,
              ]}>
                Pass-the-Phone
              </Text>
              {hostMode && gameMode === 'pass-the-phone' && (
                <View
                  style={[styles.freeBadge, singlePlayerDefault && styles.freeBadgeDimmed]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.freeBadgeText,
                      singlePlayerDefault && styles.freeBadgeTextDimmed,
                    ]}
                  >
                    FREE
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Individual Devices — premium-låst för host (paketkrav). För host
                med paket aktivt: kantlinjen, texten och PREMIUM-badge:n är guld
                (samlat "premium-läge"-uttryck, samma mönster som Max 12 Players-
                toggle:n i Profile). För icke-host visas blå "lit" kant när läget
                är aktivt, oavsett deras egna paket. När singlePlayerDefault är
                checkad: rutan dämpas (samma look som Pass-the-Phone-dimming)
                och tap bockar av defaulten + defaultar till Pass-the-Phone
                (alltid Pass-the-Phone på uncheck). */}
            <TouchableOpacity
              style={[
                styles.modeOption,
                singlePlayerDefault
                  ? styles.modeOptionDimmed
                  : gameMode === 'individual-devices' && (hostMode ? hasMultiplayerPackage : true)
                    ? (hostMode ? styles.modeOptionPremiumActive : styles.modeOptionIndivActive)
                    : styles.modeOptionInactive,
              ]}
              onPress={() => {
                // Tap på dämpad Individual Devices-ruta är Premium-gated:
                //   • Med Multiplayer-paket → bocka av defaulten OCH aktivera
                //     Individual Devices direkt (en gest för båda).
                //   • Utan paket → låt handleSelectMode visa Premium-popup
                //     (Store-redirect) UTAN att ändra state. Pass-the-Phone
                //     tänds inte upp; användaren måste tappa Pass-the-Phone-
                //     rutan eller bocka ur checkboxen för att lämna single-
                //     player-läget.
                if (singlePlayerDefault) {
                  if (!hasMultiplayerPackage) {
                    handleSelectMode('individual-devices');
                    return;
                  }
                  setSinglePlayerDefault(false);
                  setGameMode('individual-devices');
                  return;
                }
                handleSelectMode('individual-devices');
              }}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeLabel,
                !singlePlayerDefault && gameMode === 'individual-devices' && (
                  hostMode
                    ? hasMultiplayerPackage && styles.modeLabelActivePremium
                    : styles.modeLabelActiveFree
                ),
                singlePlayerDefault && styles.modeLabelDimmed,
              ]}>
                Individual Devices
              </Text>
              {hostMode && (
                <View
                  style={[
                    styles.premiumBadge,
                    (singlePlayerDefault || !hasMultiplayerPackage) && styles.premiumBadgeGrey,
                  ]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.premiumBadgeText,
                      (singlePlayerDefault || !hasMultiplayerPackage) && styles.premiumBadgeTextGrey,
                    ]}
                  >
                    PREMIUM
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Klammer (uppåt-öppen U) under modeToggle:n med "Multiplayer
              mode"-label centrerad. Speglar Profile:s motsvarande klammer
              och Lobby:s Number of Rounds-bracket — samma #6B7280 grå,
              1.5px borders, 10px höga ben med rundade botten-hörn. */}
          <View style={styles.multiplayerBracketWrap}>
            <View style={styles.multiplayerBracket} />
            <Text style={styles.multiplayerBracketLabel}>Multiplayer mode</Text>
          </View>

          <Text style={styles.modeDescription}>
            {gameMode === 'pass-the-phone'
              ? 'Players take turns answering on this single device. Free.'
              : 'Each player plays simultaneously on their own phone. Requires the Multiplayer Individual Devices package.'}
          </Text>

          {/* ── Number of Players per Game ───────────────────────
              Direkt under Game Mode-toggle:n. Speglar Profile:s host-
              default-toggle: Max 4 (free, grön aktiv + FREE-badge) vs
              Max 12 (premium, guld aktiv + PREMIUM-badge). Försök att
              välja Max 12 utan Premium triggar Store-omdirigering. När
              singlePlayerDefault är checkad dämpas BÅDA rutorna (samma
              dimming-mönster som Game Mode-toggle:n ovan). */}
          <View style={{ marginTop: Spacing.md }}>
            <Text style={styles.sectionLabel}>Number of Players per Game</Text>
            <View style={[styles.modeToggle, { marginTop: Spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : maxPlayers === 4
                      ? styles.modeOptionPassActive
                      : styles.modeOptionInactive,
                ]}
                onPress={() => {
                  if (singlePlayerDefault) {
                    setSinglePlayerDefault(false);
                    setGameMode('pass-the-phone');
                    setMaxPlayers(4);
                    return;
                  }
                  handleSelectMaxPlayers(4);
                }}
                disabled={!hostMode}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    !singlePlayerDefault && maxPlayers === 4 && styles.modeLabelActiveFree,
                    singlePlayerDefault && styles.modeLabelDimmed,
                  ]}
                >
                  Max 4 Players
                </Text>
                <View
                  style={[styles.freeBadge, singlePlayerDefault && styles.freeBadgeDimmed]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.freeBadgeText,
                      singlePlayerDefault && styles.freeBadgeTextDimmed,
                    ]}
                  >
                    FREE
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : maxPlayers === 12
                      ? styles.modeOptionPremiumActive
                      : styles.modeOptionInactive,
                ]}
                onPress={() => {
                  if (singlePlayerDefault) {
                    if (!hasPremium) {
                      handleSelectMaxPlayers(12);
                      return;
                    }
                    setSinglePlayerDefault(false);
                    setGameMode('pass-the-phone');
                    setMaxPlayers(12);
                    return;
                  }
                  handleSelectMaxPlayers(12);
                }}
                disabled={!hostMode}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    !singlePlayerDefault && maxPlayers === 12 && styles.modeLabelActivePremium,
                    singlePlayerDefault && styles.modeLabelDimmed,
                  ]}
                >
                  Max 12 Players
                </Text>
                <View
                  style={[
                    styles.premiumBadge,
                    (singlePlayerDefault || !(maxPlayers === 12 || hasPremium)) && styles.premiumBadgeGrey,
                  ]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.premiumBadgeText,
                      (singlePlayerDefault || !(maxPlayers === 12 || hasPremium)) && styles.premiumBadgeTextGrey,
                    ]}
                  >
                    PREMIUM
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Region Scope ──────────────────────────────────────
            Host-satt spelregel (vilken kulturell kontext frågorna
            ska dras från). Visas för alla i lobbyn men kan bara
            *ändras* av host — samma mönster som Game Mode ovanför. */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
          <Text style={styles.sectionLabel}>🌍 Region Scope</Text>
          <Text style={styles.cardSubtitle}>Sets the cultural context for questions</Text>
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
            med färgade brand-badges (samma mönster som Spotify-kortet på
            Profile-sidan, fast i kompakt list-format). marginTop ger lite
            extra luft mellan Game Mode-beskrivningen och denna rubrik. */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
          <Text style={styles.sectionLabel}>Game Connections</Text>
          <View style={styles.connectionsList}>
            {/* YouTube — alltid tillgänglig, host kan toggla av/på manuellt.
                Enabled-pillen får grön kantlinje + FREE-badge (samma border-
                skärande badge-mönster som Pass-the-Phone-knappen). Switchen
                till höger är host-only och får grön track när på, röd när av.
                Loggan är en röd kvadrat med vit playpil (CSS-triangel via
                border-trick) så pilen alltid är vit oavsett emoji-rendering
                på iOS vs Android. */}
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconYoutube]}>
                <View style={styles.connectionIconYoutubeArrow} />
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
                  ios_backgroundColor={Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconSpotify]}>
                <Text style={styles.connectionIconGlyph}>🎵</Text>
              </View>
              {/* Label + info-ikon paras ihop i en grupp som upptar samma
                  minWidth (130) som vanlig connectionLabel — så pillen efter
                  startar på exakt samma x-position som YouTubes och Profiles
                  & Places-radens pillar, och switchen längst ut linjerar med
                  de andra radernas switchar via marginLeft:'auto'. */}
              <View style={styles.connectionLabelGroup}>
                <Text style={[styles.connectionLabel, styles.connectionLabelInGroup]}>Spotify</Text>
                {/* Info-ikonen visas alltid (oavsett mode och enabled/disabled-
                    state) med samma rules-text. Sitter direkt efter "Spotify"
                    så den läses som en del av labeln. */}
                <TouchableOpacity
                  style={styles.infoIconBtn}
                  onPress={() =>
                    Alert.alert(
                      'Spotify requirements',
                      'Pass-the-Phone — Spotify is unavailable in this mode.\n\nIndividual Devices — All approved players (incl. host) need a Spotify account activated in their Profile.',
                    )
                  }
                  hitSlop={8}
                  accessibilityLabel="Spotify requirements"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </TouchableOpacity>
              </View>
              <View style={spotifyEnabled ? styles.statusPillEnabled : styles.statusPillDisabled}>
                <Text style={spotifyEnabled ? styles.statusPillTextEnabled : styles.statusPillTextDisabled}>
                  {spotifyEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              {hostMode && (
                <Switch
                  value={spotifyHostToggle}
                  onValueChange={(v) => handleToggleSource(spotifyEnabled, setSpotifyHostToggle, v)}
                  // Locked för host när auto-regeln inte uppfylls (alla godkända
                  // måste ha Spotify-konto). Vid auto-disable visas en mörkgrå
                  // track och ljusgrå thumb istället för röd/grön-paletten, för
                  // att tydligt signalera "ej tillgänglig".
                  disabled={!spotifyAutoEnabled}
                  trackColor={
                    spotifyAutoEnabled
                      ? { false: Colors.error, true: Colors.success }
                      : { false: '#3A3F4B', true: '#3A3F4B' }
                  }
                  thumbColor={spotifyAutoEnabled ? '#FFF' : '#9CA3AF'}
                  ios_backgroundColor={spotifyAutoEnabled ? Colors.error : '#3A3F4B'}
                  style={styles.connectionSwitch}
                />
              )}
            </View>

            {/* AI — mörkblå cirkel med blå primary-border och italiserad "AI"-text. */}
            <View style={styles.connectionRow}>
              <View style={styles.connectionIconWrap}>
                {/* Q-figuren från startskärmens logga (utan omgivande kvadrater).
                    "AI"-text överlagrad i mitten ersätter den lilla pricken. */}
                <Svg width={28} height={28} viewBox="24 22 32 32" style={StyleSheet.absoluteFillObject}>
                  <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.primary} strokeWidth="2.5" />
                  <Path d="M49 47 L53 51" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
                <Text style={styles.connectionIconAiText}>AI</Text>
              </View>
              <Text style={styles.connectionLabel}>Profiles & Places</Text>
              {/* FREE-badgen sitter alltid kvar (samma mönster som YouTube) —
                  grön i Enabled, grå i Disabled. */}
              <View style={profilesEnabled ? styles.youtubeEnabledPill : styles.statusPillDisabled}>
                <Text style={profilesEnabled ? styles.youtubeEnabledText : styles.statusPillTextDisabled}>
                  {profilesEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View
                  style={[styles.freeBadgeSmall, !profilesEnabled && styles.freeBadgeSmallGrey]}
                  pointerEvents="none"
                >
                  <Text style={[styles.freeBadgeTextSmall, !profilesEnabled && styles.freeBadgeSmallTextGrey]}>
                    FREE
                  </Text>
                </View>
              </View>
              {hostMode && (
                <Switch
                  value={profilesEnabled}
                  onValueChange={(v) => handleToggleSource(profilesEnabled, setProfilesEnabled, v)}
                  trackColor={{ false: Colors.error, true: Colors.success }}
                  thumbColor="#FFF"
                  ios_backgroundColor={Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>

            {/* Use Packages — sub-block sist i Game Connections för musikpaket-val.
                Basic-utbudet är alltid implicit aktivt (ingen synlig chip);
                hosten kan välja till köpta Extra packages ovanpå. För
                icke-host visas allt read-only (disabled på TouchableOpacity). */}
            <View style={styles.usePackagesBlock}>
              <Text style={styles.sectionLabel}>Customized Host packages</Text>

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
                      onPress={() => router.push('/(tabs)/store')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modeLabel}>+ Add host packages</Text>
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
                    {hostMode ? 'Packages available for you:' : 'Packages for this lobby selected by the Host:'}
                  </Text>
                  {hostMode && (
                    <View style={styles.selectAllGroup}>
                      <Text style={styles.selectAllLabel}>Select all</Text>
                      <Switch
                        value={isAllSelected}
                        onValueChange={handleToggleAll}
                        disabled={availablePackages.length === 0}
                        trackColor={{ false: Colors.error, true: Colors.success }}
                        thumbColor="#FFF"
                        ios_backgroundColor={Colors.error}
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
                        {hostMode ? 'No Extra packages purchased' : 'No extra packages active in this lobby'}
                      </Text>
                    );
                  }

                  return sorted.map((pkg) => {
                    const isSelected = selectedExtraPackages.includes(pkg.id);
                    // För icke-host är raden alltid "aktiv" (vi visar bara
                    // valda paket), så active-stylen används oavsett.
                    const showActive = hostMode ? isSelected : true;
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
                        </View>
                        {hostMode && (
                          <Switch
                            value={isSelected}
                            onValueChange={() => handleToggleExtraPackage(pkg.id)}
                            trackColor={{ false: Colors.error, true: Colors.success }}
                            thumbColor="#FFF"
                            ios_backgroundColor={Colors.error}
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
        </View>{/* /gameSettingsBorder */}

        {/* ── Players in Lobby ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Players in Lobby</Text>
            <View style={styles.sectionRowRight}>
              <View style={styles.sectionMetaStack}>
                <Text style={styles.sectionMetaTop}>Approved:</Text>
                <Text style={styles.sectionMeta}>
                  {approvedPlayers.filter((p) => !p.hasLeft).length} of max {maxPlayers}
                </Text>
              </View>
              {hostMode && gameMode === 'pass-the-phone' && (
                <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddPlayer}>
                  <Text style={styles.addBtnText}>+ Add Player</Text>
                </TouchableOpacity>
              )}
            </View>
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
                hcpOverride={player.hcpOverride}
                onEditPlayer={hostMode && !player.hasLeft ? () => openPlayerEdit(player.id) : undefined}
                onGuestHcpTap={hostMode && !player.hasLeft && player.type === 'guest' ? () => Alert.alert('Guest HCP', 'Guest HCP cannot be changed') : undefined}
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
                    hcpOverride={player.hcpOverride}
                    onEditPlayer={hostMode && !player.hasLeft ? () => openPlayerEdit(player.id) : undefined}
                    onGuestHcpTap={hostMode && !player.hasLeft && player.type === 'guest' ? () => Alert.alert('Guest HCP', 'Guest HCP cannot be changed') : undefined}
                  />
                ))}
              </View>
            )}

          </View>
        </View>

        {/* ── Quiz Settings ─────────────────────────────────────
            Game Era + Number of Rounds delar en gemensam ram
            (quizSettingsBorder, samma stil som gameSettingsBorder).
            "– defined by Host" visas på sektion-rubriken för icke-host,
            inte per-block, så ramen visuellt klumpar host-kontrollerade
            quiz-inställningar tillsammans. */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quiz Settings</Text>

          <View style={styles.quizSettingsBorder}>
            <View style={styles.definedByHostBadge} pointerEvents="none">
              <Text style={styles.definedByHostBadgeText}>DEFINED BY HOST</Text>
            </View>
            {/* Game Era */}
            <View>
              <Text style={styles.cardTitle}>🕐 Game Era (min 10 year interval)</Text>
              <Text style={styles.cardSubtitle}>Set the time span for questions</Text>
              {/* Det valda årtalsintervallet visas i samma gul/glow-ruta för
                  både host och non-host (in-game year-selector-paritet). Host
                  får dessutom slidern + DecadeMarks under för att kunna dra.
                  Slidern är guldtonad (Colors.warning = #F5A623) för att
                  matcha rutans kantlinje + glow. minMarkerOverlapDistance
                  hindrar markörerna från att komma närmare än 10 år. */}
              <View style={styles.eraGuestBoxWrap}>
                <View style={styles.eraGuestBox}>
                  <Text style={styles.eraGuestBoxText}>{clampedFrom} – {clampedTo}</Text>
                </View>
              </View>
              {hostMode && (
                <View style={{ alignItems: 'center' }}>
                  <MultiSlider
                    values={eraValues}
                    min={ERA_MIN}
                    max={ERA_MAX}
                    step={1}
                    onValuesChange={(vals) => {
                      // Defensiv guard ifall lib:n släpper igenom värden under
                      // 10 år trots minMarkerOverlapDistance — ignorera updates
                      // som bryter regeln. UI:t snappar visuellt till senaste
                      // giltiga state.
                      if (vals[1] - vals[0] < ERA_MIN_INTERVAL) return;
                      // Tick-haptic per år-ändring — selectionAsync är Apple:s
                      // picker-tick (subtil tap-känsla på iOS, KEYBOARD_TAP-
                      // feedback på Android som även producerar OS-klick-ljud).
                      // No-op på web. Step=1 ⇒ exakt en haptic per år.
                      void Haptics.selectionAsync();
                      setEraValues(vals);
                    }}
                    minMarkerOverlapDistance={ERA_MIN_INTERVAL_PX}
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
                  <DecadeMarks />
                </View>
              )}
              {eraWarning && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ {eraWarning}</Text></View>}
            </View>

            {/* Number of Rounds */}
            <View>
              <Text style={styles.cardTitle}>🎯 Number of Rounds</Text>
              <Text style={styles.cardSubtitle}>How many rounds in this game</Text>
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
                      onPremiumPress={() => router.push('/store')}
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
          </View>
        </View>

        {/* ── Start game ────────────────────────────────────────
            Host-only — non-host kan inte trigga spelstart. När backend
            kommer in pushas alla godkända spelare in i quizet via socket-
            event som host:s Start Game-tap fyrar. */}
        {hostMode && (
          <View style={styles.startSection}>
            <Button
              label="Start Game"
              onPress={handleStartGame}
              variant="primary"
            />
          </View>
        )}

        {/* Non-host: status-ruta i samma layout-position som host:s
            Start Game-knapp. Sekventiella prickar signalerar att appen
            lever och väntar på host:ens spelstart. */}
        {!hostMode && (
          <View style={styles.startSection}>
            <View style={styles.waitingForHostBox}>
              <Text style={styles.waitingForHostText}>Waiting for Host to Start Game</Text>
              <SequentialDots />
            </View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Alla modaler utanför ScrollView */}
      <AddPlayerModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddPlayer} />

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

              {/* Assistance level — Full→Standard→Minimal, en-väg.
                  Disallowed transitions dimmas (men förblir tappbara så
                  popup:en kan informera). Originalet bestäms av playerEdit-
                  Target:s sparade värde, inte editAssistance — så host kan
                  toggla mellan tillåtna alternativ utan att låsa sig. */}
              <View style={playerEditSheet.fieldGroup}>
                <Text style={playerEditSheet.fieldLabel}>Assistance Level</Text>
                <View style={playerEditSheet.skillRow}>
                  {(['full', 'standard', 'minimal'] as const).map((opt) => {
                    const isSelected = editAssistance === opt;
                    const originalAssistance = playerEditTarget?.assistance ?? 'standard';
                    const isLocked =
                      (originalAssistance === 'minimal' && opt !== 'minimal') ||
                      ASSISTANCE_RANK[opt] > ASSISTANCE_RANK[originalAssistance];
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          playerEditSheet.skillBtn,
                          isSelected && playerEditSheet.skillBtnActive,
                          isLocked && playerEditSheet.skillBtnLocked,
                        ]}
                        onPress={() => handleSelectEditAssistance(opt)}
                      >
                        <Text
                          style={[
                            playerEditSheet.skillBtnText,
                            isSelected && playerEditSheet.skillBtnTextActive,
                            isLocked && playerEditSheet.skillBtnTextLocked,
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
              {!playerEditIsGuest && (
                <View style={playerEditSheet.fieldGroup}>
                  <Text style={playerEditSheet.fieldLabel}>HCP ({MIN_HCP}–99)</Text>
                  <TextInput
                    style={playerEditSheet.hcpInput}
                    value={editHcpValue}
                    onChangeText={(t) => setEditHcpValue(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="—"
                    placeholderTextColor={Colors.textDisabled}
                    returnKeyType="done"
                    onSubmitEditing={handleSavePlayerEdit}
                  />
                </View>
              )}
              {playerEditIsGuest && (
                <Text style={playerEditSheet.guestHcpNote}>
                  Guest HCP is auto-calculated and cannot be edited.
                </Text>
              )}
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
        <View style={shareSheet.overlay}>
          <TouchableOpacity
            style={shareSheet.backdrop}
            activeOpacity={1}
            onPress={() => setShareModalOpen(false)}
          />
          <View style={shareSheet.container}>
            <View style={shareSheet.handle} />
            <Text style={shareSheet.title}>Share invite</Text>
            <Text style={shareSheet.subtitle}>
              Send invites to your QuizVibe friends.
            </Text>

            {/* QuizVibe friends list */}
            <View style={shareSheet.sectionLabelRow}>
              <QuizVibeFriendsLogo size={28} />
              <Text style={shareSheet.sectionLabel}>QuizVibe friends</Text>
            </View>
            {friends.length === 0 ? (
              <View style={shareSheet.emptyState}>
                <Text style={shareSheet.emptyText}>No friends saved yet</Text>
                <Text style={shareSheet.emptySubtext}>
                  Add friends in Profile to invite them with one tap.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 260 }}>
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
        </View>
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

  hostBadge: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.primaryBorder },
  hostBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },

  roomCard: { alignItems: 'center' },
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
  shareBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },

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
    height: 46,
    gap: 4,
  },
  // Bas-stil för båda inre rutorna. Konkret kant-/bg-färg sätts av varianterna nedan.
  modeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
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
  // Guld-tonad aktiv variant — Individual Devices för host med premium-paket.
  // Speglar PREMIUM-badge:s guldfärg så toggle-rutan, badge:n och texten
  // bildar ett samlat "premium-läge"-uttryck (samma mönster som Profile:s
  // Max 12 Players-toggle).
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
    color: '#000',
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
    borderColor: Colors.primaryDark,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singlePlayerCheckboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
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

  // Game Connections — vänsterjusterad lista över källor (YouTube/Spotify/AI VIBE).
  // Varje rad har en färgad brand-badge (samma mönster som Profile-sidans
  // Spotify-ikon: rundad, brand-färgad bakgrund med emoji centrerad inuti)
  // i kompakt list-format.
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
    color: '#000',
    letterSpacing: 0.5,
  },
  // Grey overrides för freeBadgeSmall + freeBadgeTextSmall som appliceras när
  // host stängt av en gratis-funktion (YouTube eller Profiles & Places). FREE-
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
  // YouTube: röd rundad kvadrat med vit playpil (CSS-triangel) inuti.
  // borderRadius:6 override:ar connectionIconWrap.borderRadius (14 = cirkel)
  // så bara YouTube-raden får kvadrat-formen; Spotify/Profiles behåller cirkel.
  connectionIconYoutube: {
    backgroundColor: '#FF0000',
    borderRadius: 6,
  },
  connectionIconYoutubeArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2, // optisk centrering — pilen ser balanserad ut mot röd bg
  },
  // Spotify: brand-grön cirkel med 🎵 (samma färg som Profile-sidans icon-wrap).
  connectionIconSpotify: { backgroundColor: '#1DB954' },
  connectionIconGlyph: { fontSize: 14 },
  // AI: Q-figur från startskärmens logga (cirkel + svans i primary-blå),
  // utan omgivande ram. "AI"-text överlagras i Q-cirkelns mitt — mindre
  // fontSize än tidigare så texten ryms inuti cirkeln.
  connectionIconAiText: {
    fontSize: 10,
    fontWeight: '800',
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: 0.5,
    // translateY -1 kompenserar för att Text:s default-line-box har
    // descender-utrymme under baseline — utan det ligger glyferna något
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
  // Use Packages — sub-block under Spotify för musikpaket-val. Vänsterställt
  // mot connectionsList-kanten så "Extra packages:"-labeln och chipsen börjar
  // på samma x-position som ikonerna på YouTube/Spotify-raderna ovanför.
  usePackagesBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    // Extra luft ovanför så "Customized Host packages"-rubriken inte
    // hamnar för nära Profiles & Places-radens switch ovanför.
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
  // Bas-look för båda knapparna i raden — flex: 1 ger 50/50 bredd, 46 px
  // hög (matchar modeToggle), 1 px borderStrong + transparent bg.
  // position:'relative' så FREE/PREMIUM-badge:n kan sticka upp över
  // kantlinjen utan att klippas.
  addPackageBtn: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
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
  // Liten info-knapp ("i" i en cirkel) som sitter direkt efter Spotify-labeln
  // i connectionLabelGroup — tap visar en Alert med förklaringen istället för
  // att alltid skriva ut texten. Avstånd till labeln styrs av gruppens gap.
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
    // status-pillar (YouTubes Enabled / Spotifys Enabled-Disabled / Profiles
    // & Places Enabled-Disabled) linjerar exakt under varandra trots att
    // labels har olika pixel-bredd i proportionell font. Värdet måste rymma
    // den bredaste labeln ("Profiles & Places") — annars trycks just den
    // radens pill till höger och bryter linjeringen. Värdet är paret med
    // connectionRow.paddingRight (18) så att pillarna och switcharna båda
    // shiftas vänster med 18px och linjerar med paketlistans switchar.
    minWidth: 112,
  },
  // Spotify-radens label + info-ikon ligger i en gemensam grupp som upptar
  // samma minWidth (130) som plain connectionLabel — då stannar pillen och
  // switchen i linje med YouTube- och Profiles & Places-radernas. Texten
  // inuti måste få minWidth: 0 (via connectionLabelInGroup) för att inte
  // själv ta hela 130px och skuffa info-ikonen utanför gruppens bredd.
  connectionLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 112,
  },
  connectionLabelInGroup: {
    minWidth: 0,
  },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs },
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
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },

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
  eraGuestBoxWrap: { alignItems: 'center', paddingVertical: Spacing.sm },
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

  // Waiting-ruta för non-host — speglar Button:s base-mått (52px höjd,
  // Radius.md) men styls som en passiv status-pillar med subtila brand-
  // toner: primaryMuted bg + primaryBorder kant + textPrimary text.
  // Layouten är row så texten + SequentialDots står på samma rad.
  waitingForHostBox: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  waitingForHostText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
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
  playerNameRow: { flexDirection: 'row', gap: Spacing.sm },
  playerNameInput: { flex: 1 },
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