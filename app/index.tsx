import { CodeKeyboard } from '@/src/components/CodeKeyboard';
import { QuizVibeLogo } from '@/src/components/QuizVibeLogo';
import { QuizVibeQAvatar } from '@/src/components/QuizVibeQAvatar';
import { ShoppingCartIcon } from '@/src/components/ShoppingCartIcon';
import { TopUserBanner } from '@/src/components/TopUserBanner';
import { HostTypeOptions, type HostLobbyType } from '@/src/components/HostTypeOptions';
import { Colors, Radius, Spacing } from '@/src/theme';
import { identify, resetIdentity, track } from '@/src/utils/analytics';
import { getAvatarEmojiById } from '@/src/utils/avatars';
import { clearLeftPlayers } from '@/src/utils/leftPlayers';
import { clearEjected } from '@/src/utils/ejectedPlayers';
import { clearLobbyPlayers, getLobbyPlayers } from '@/src/utils/mockLobbyPlayers';
import { clearLobbySettings, getLobbySettings } from '@/src/utils/mockLobbySettings';
import { clearGameStarted } from '@/src/utils/mockStartedGames';
import { getRoomMeta, isActiveRoom, isLobbyFull, isOwnLobby, registerActiveRoom } from '@/src/utils/mockActiveRooms';
import { buildRemoteQuizParams, getMatchByRoomCode, getOwnUserId, splitMatchForUser } from '@/src/utils/remoteMatches';
import { MyMatchesSection } from '@/src/components/MyMatchesSection';
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
} from '@/src/utils/playerName';
import { ensureAuthSession, signInWithPlayerName } from '@/src/utils/auth';
import { containsProfanity } from '@/src/utils/profanity';
import { clearProfile, emailExists, getCachedProfile, loadProfile, playerNameExists, saveProfile, type ProfileData } from '@/src/utils/profileStorage';
import { clearPremiumSubscription, hasPremiumSubscription } from '@/src/utils/subscriptionStorage';
import { supabase } from '@/src/utils/supabase';
import { formatRoomCode, generateRoomCode, isBlockedLetterPair, isLetterCellIndex, ROOM_CODE_DIGITS, ROOM_CODE_LEADING_LETTERS, ROOM_CODE_LENGTH, ROOM_CODE_TRAILING_LETTERS } from '@/src/utils/roomCode';
import { loadInvites, removeInvite, type WaitingInvite } from '@/src/utils/waitingInvites';
import { addFriend } from '@/src/utils/friendsStorage';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
const SCREEN_HEIGHT = Dimensions.get('window').height;

// ─── Join Modal ───────────────────────────────────────────────────────────────

type JoinStep = 'choose' | 'code' | 'invites' | 'guest' | 'guest-host';

interface JoinModalProps {
  visible: boolean;
  onClose: () => void;
  initialStep?: JoinStep;
  // Döljer Guest-valet i chooser-steget. Sätts när användaren öppnat
  // modalen via "Join with Room Code — user"-knappen, eftersom
  // guest då är ett irrelevant val.
  hideGuest?: boolean;
  // Inloggad users playerName från parent (HomeScreen). Används för
  // own-lobby-detektion i join-handlers — om koden tillhör en lobby med
  // samma playerName som host:s, blockas join (samma user försöker joina
  // sin egen lobby från en andra enhet). null när ingen är inloggad.
  currentPlayerName?: string | null;
  // Lobbytyp vald i inline-väljaren (HostTypeOptions) INNAN guest-host-
  // formen öppnades ('1v1' → renodlad Remote 1v1-lobby). Konsumeras av
  // handleStartGameAsGuestHost som skickar lobbyType-param till /lobby.
  guestHostLobbyType?: HostLobbyType;
  // Öppnar "Register or Login" när guest-läge träffar en Remote 1vs1-gate.
  // `context` styr förklaringstexten: 'join' (rumskoden visade sig vara en
  // 1v1-match) vs 'host' (guest-host med stale '1v1'). `draft` bär de
  // ifyllda guest-fälten så formen kan återställas om spelaren trycker
  // Cancel. Auth-formuläret lever i HomeScreen, därav callbacken.
  onRemoteAccountRequired?: (context: RemoteBlockContext, draft?: GuestJoinDraft) => void;
  // Återställer guest-formens fält när modalen öppnas — sätts av HomeScreen
  // när spelaren tryckt Cancel i auth-formuläret efter en Remote 1vs1-gate.
  // Rumskoden återställs INTE (se GuestJoinDraft).
  initialGuestDraft?: GuestJoinDraft | null;
}

/**
 * Upsell när guest-läge stöter på Remote 1vs1. Läget spelas ENBART mellan
 * två QuizVibe-users (rev 3, 2026-08-08) — både en ren guest och en
 * registrerad user som spelar som Guest är utestängda.
 *
 * Två kontexter med olika copy, eftersom spelaren behöver veta VAD som
 * hände, inte bara vilken policy som gäller:
 *   'join' — de knappade in en rumskod som visade sig vara en 1v1-match.
 *            Leder med rummet, inte med regeln.
 *   'host' — de försökte VÄLJA Remote Play i guest-panelen.
 *
 * Module-level så både HomeScreen och JoinModal kan visa exakt samma copy;
 * register-navigationen injiceras eftersom den bara finns i HomeScreen.
 */
type RemoteBlockContext = 'join' | 'host';

/**
 * Förklaringstexten som ersätter "Sign in to create and join games" som
 * subtitel i "Register or Login"-formuläret när spelaren kom dit via en
 * Remote 1vs1-gate. Ingen Alert i vägen (Peter 2026-08-08): tapp på en
 * blockerad knapp går DIREKT till formuläret, och texten här förklarar
 * varför de hamnade där.
 */
/**
 * Väntetid mellan att en RN-modal stängs och nästa öppnas. Två `<Modal>`
 * kan inte vara presenterade samtidigt — öppnar man den andra innan den
 * första fade:at ut sväljer iOS den tyst. `animationType="fade"` tar ~300ms;
 * 350 ger marginal. Samma storleksordning som modal-resetens 300ms-timeout.
 */
const MODAL_SWAP_DELAY_MS = 350;

const REMOTE_BLOCK_NOTICE: Record<RemoteBlockContext, string> = {
  join: 'This Room Code belongs to a Remote 1vs1 match. Remote duels can only be played between QuizVibe users — register a free account or log in to join.',
  host: 'Remote 1vs1 matches can only be played between QuizVibe users. Register a free account or log in to host a 1vs1 match.',
};

function isRemoteBlockContext(value: unknown): value is RemoteBlockContext {
  return value === 'join' || value === 'host';
}

/**
 * Jämförelsen bakom info-ikonen intill "QuizVibe user"-rubriken på Home.
 * Svarar på "vad får jag som registrerad user som en Guest inte får?".
 *
 * `user` / `guest` är antingen `true` (grön ✓), `false` (grå ✗) eller en
 * kort värde-sträng när skillnaden är ett tak snarare än av/på. Håll
 * strängarna korta — kolumnerna är smala.
 *
 * MEDVETET: tabellen listar bara det GRATIS kontot mot Guest. Allt som
 * kräver betalning ligger i `PREMIUM_FEATURES` nedan och nås via raden
 * "Premium option" — inga asterisker i värde-kolumnerna (Peter 2026-08-09).
 *
 * Källor för värdena: Remote 1vs1 är users-only; guest-hostade spel skriver
 * ingen Player history; guest host är låst till fast Game era / inga Extra
 * packages / max 1 Play Again; free host = FREE_CREDITS_DAILY_CAP (4) —
 * både grant vid registrering och daglig top-up-cap, samma siffra som
 * Store:s "Basic: 4 games per day". Guest = ogated men trial-begränsat
 * spel.
 */
const USER_VS_GUEST_ROWS: { label: string; user: boolean | string; guest: boolean | string }[] = [
  { label: 'Local play — Single, Pass-the-Phone, Individual devices', user: true, guest: true },
  { label: 'Remote play — 1vs1 matches', user: true, guest: false },
  { label: 'Saved results & player history', user: true, guest: false },
  { label: 'Friends list & in-app invites', user: true, guest: false },
  { label: 'Choose Game era', user: true, guest: false },
  { label: 'Host games per day', user: '4 free', guest: 'Trial' },
  { label: 'Replay & Competition Leaderboard', user: true, guest: false },
  { label: 'Premium option', user: true, guest: false },
];

/**
 * Vad Premium-abonnemanget lägger till ovanpå det gratis kontot. Listas
 * SEPARAT under jämförelsetabellen så gratis-kontots rader inte blandas
 * ihop med betalda tak.
 *
 * ⚠ ORDAGRANN SPEGEL av StoreScreen:s `SUBSCRIPTION_FEATURES` — samma
 * strängar, samma ordning, samma Premium-vs-Basic-rendering (Peter
 * 2026-08-12: sektionen ska se ut som i Store). Ändra ALLTID båda.
 */
const PREMIUM_FEATURES: { premium: string; basic: string }[] = [
  { premium: 'Host Game Credits Unlimited', basic: '4 games per day' },
  { premium: '20 rounds per game (Individual device)', basic: 'Max 4 rounds per game' },
  { premium: 'Invite 12 players per game (Individual device)', basic: 'Max 4 players' },
  { premium: 'All Extra Host packages included', basic: 'Generic content only' },
];

/**
 * Ifyllda guest-formulärsfält som bevaras när en Remote 1vs1-gate tar
 * spelaren till "Register or Login". Trycker de Cancel återställs formen
 * med dessa värden så de slipper fylla i allt igen.
 *
 * Rumskoden ingår MEDVETET INTE — den koden var ju just den de INTE fick
 * joina, så fältet ska stå tomt och redo för en ny kod.
 */
interface GuestJoinDraft {
  guestName: string;
  guestBirthYearText: string;
  guestAssistance: AssistanceLevel;
}

type AssistanceLevel = 'minimal' | 'standard' | 'full';
const ASSISTANCE_OPTIONS: { id: AssistanceLevel; label: string }[] = [
  { id: 'full',     label: 'Full' },
  { id: 'standard', label: 'Standard' },
  { id: 'minimal',  label: 'Minimal' },
];

// Mock-list över "redan tagna" playerNames så availability-checken har något
// att faktiskt fela på. Lowercase för case-insensitive match.
// TODO (backend): byt mot riktig playerName-uniqueness-check mot servern.
const TAKEN_PLAYER_NAMES = new Set([
  'player one', 'anna', 'kalle', 'admin', 'test', 'guest', 'host', 'quizvibe',
]);

type PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// Validerar ett manuellt inmatat Player Name. Kontrollerar i ordning:
//   1. Canonical format (Abcdef- eller Abcdef-1234567)
//   2. Olämpligt ledande par (samma blocklist som auto-gen)
//   3. Profanity
//   4. Uniqueness mot mock-listan
function validatePlayerName(name: string): 'available' | 'taken' | 'invalid' {
  const trimmed = name.trim();
  if (!isPlayerNameFormatValid(trimmed)) return 'invalid';
  if (hasBlockedLetterLead(trimmed)) return 'invalid';
  if (containsProfanity(trimmed)) return 'invalid';
  // Reserverat: brand-namnet "quizvibe" (case-insensitive) får inte ingå
  // som substring i letters-sektionen — skyddar mot "QuizVibe", "Myquizvibe",
  // etc. Synkad med playerName.ts:s auto-gen-blocklist.
  if (containsBlockedLetterSubstring(trimmed)) return 'invalid';
  if (TAKEN_PLAYER_NAMES.has(trimmed.toLowerCase())) return 'taken';
  return 'available';
}

// Lös format-validering — tillräckligt för UI-feedback. Riktig validering
// sker server-side via aktiverings-/recovery-mail.
const REG_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegRegion = 'sweden' | 'nordics' | 'global';
// V1: bara Sweden — type:n stannar bred för bakåtkompat (profileStorage:s
// Region-typ är identisk) men Register-formens picker exponerar bara Sweden.
const REG_REGION_OPTIONS: { id: RegRegion; label: string }[] = [
  { id: 'sweden', label: 'Sweden' },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1950;
// 15+ minimum age requirement (2026-06-01: höjt från 13+ pga 15+-gränsat
// film-/innehåll i appen, utöver App Store / GDPR). Dynamisk så minimum-året
// följer current year — 2026: max 2011, 2027: max 2012, osv.
const MAX_BIRTH_YEAR = CURRENT_YEAR - 15;
// Lista, nyaste år först — samma ordning som ProfileScreens year picker.
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

/**
 * Format-helper för Year-of-Birth-pickaren i Register- och Guest-formen.
 * Endpoints renderas med "or earlier"/"or later"-suffix eftersom de
 * representerar öppna intervall (alla födda ≤1930 respektive ≥2020).
 * Övriga år renderas oförändrat. Internt sparas alltid årtalet som siffra
 * — etiketten är rent kosmetisk och påverkar inte ålders/HCP-beräkning.
 */
function formatBirthYear(year: number): string {
  if (year === MIN_BIRTH_YEAR) return `${year} or earlier`;
  if (year === MAX_BIRTH_YEAR) return `${year} or later`;
  return String(year);
}

// Visar "Lobby is full"-Alert med text som beror på host:s subscription-
// status. Free host får upgrade-CTA-formulering; Premium host får bara
// "remove players"-versionen (inget upselling-meddelande). Returnerar true
// om popup visades (= caller ska abortera vidare navigation), false annars.
async function checkLobbyCapacity(code: string): Promise<boolean> {
  if (!(await isLobbyFull(code))) return false;
  const meta = await getRoomMeta(code);
  const message = meta?.hostIsPremium
    ? 'Lobby is full. Host need to remove players from lobby for others to join'
    : 'Lobby is full. Host either need to remove players from lobby or to upgrade';
  Alert.alert('Lobby is full', message);
  return true;
}

// Single-player-lobby: host spelar ensam, så det finns ingen plats att joina
// (spegelbilden av "+ Add Player"-mellansteget i lobbyn, Peter 2026-08-24).
// Samma kontrakt som checkLobbyCapacity: true = popup visades = caller ska
// abortera.
//
// Källan är `lobby_settings.single_player_default` — MEDVETET inte en kolumn
// på rooms-raden som `is_remote_1v1`. Remote-läget är låst vid skapandet och
// kunde därför göras atomiskt; single vs multiplayer är en LEVANDE toggle
// host kan slå om när som helst, så ett värde fruset vid rums-skapandet hade
// blivit stale. Fail-open när settings-raden ännu inte skrivits (host:s
// 300 ms-debounce) — samma konvention som isLobbyFull/isOwnLobby, och i
// praktiken onåbart eftersom koden måste läsas av och delas manuellt först.
async function checkSinglePlayerLobby(code: string): Promise<boolean> {
  const settings = await getLobbySettings(code);
  if (!settings?.singlePlayerDefault) return false;
  Alert.alert(
    'Single player lobby',
    'This Room Code belongs to a single player lobby. Ask the Host to switch to a Multiplayer mode, then try again.',
  );
  return true;
}

// Re-match-lobby: uppsättningen är låst till spelarna från föregående spel,
// så bara de får komma in (Peter 2026-08-25). Samma kontrakt som
// checkLobbyCapacity: true = popup visades = caller ska abortera.
//
// Källan är `rooms.rematch_locked` (0037) — INTE lobby_settings — av samma
// skäl som `is_remote_1v1`: rums-raden skrivs atomiskt vid skapandet, medan
// lobby_settings går genom hostens 300 ms-debounce och hade gjort gaten
// fail-open i ~1s efter att lobbyn skapats.
//
// En spelare som VAR med i förra spelet har redan en pre-seedad rad i
// lobby_players (carry-over) och släpps igenom — de ärver sitt gamla
// player_id via code-only-joinens befintliga dup-detection. Matchningen är
// case-insensitiv på playerName, samma nyckel som den grenen använder.
//
// Fail-open när metan saknas, samma konvention som isLobbyFull/isOwnLobby.
async function checkRematchLockedLobby(
  code: string,
  playerName: string | null | undefined,
): Promise<boolean> {
  const meta = await getRoomMeta(code);
  if (!meta?.rematchLocked) return false;
  const name = playerName?.trim().toLowerCase();
  if (name) {
    const seeded = await getLobbyPlayers(code);
    if (seeded?.some((p) => p.name.trim().toLowerCase() === name)) return false;
  }
  Alert.alert(
    'Re-match lobby',
    'This Room Code belongs to a re-match. Only the players from the previous game can join.',
  );
  return true;
}

function JoinModal({ visible, onClose, initialStep = 'choose', hideGuest = false, currentPlayerName, guestHostLobbyType = 'multiplayer', onRemoteAccountRequired, initialGuestDraft }: JoinModalProps) {
  const [step, setStep] = useState<JoinStep>(initialStep);
  const [code, setCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestBirthYearText, setGuestBirthYearText] = useState('');
  const [guestAssistance, setGuestAssistance] = useState<AssistanceLevel>('full');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [playerNameStatus, setPlayerNameStatus] = useState<PlayerNameStatus>('idle');
  const [invites, setInvites] = useState<WaitingInvite[]>([]);
  // Index på den code-cell som har fokus — driver vilken `mode` (letter/digit)
  // CodeKeyboard renderar samt vilken cell tap-knapparna skriver in i. null =
  // ingen code-cell fokuserad → custom keyboard döljs (system keyboard kan
  // visas för andra fält som Player Name).
  const [focusedCodeIdx, setFocusedCodeIdx] = useState<number | null>(null);

  // Refs till de 6 cells för rumkoden — för auto-fokus framåt och bakåt.
  const codeRefs = useRef<Array<TextInput | null>>([]);
  // Ref till guest-formens ScrollView så vi kan scrolla det fokuserade
  // fältet till syn när det custom CodeKeyboardet öppnas. På korta skärmar
  // (äldre iPhones) krymper ScrollView:n så det aktiva fältet annars hamnar
  // utanför den synliga ytan ovanför tangentbordet.
  const guestScrollRef = useRef<ScrollView>(null);
  // Refs till PlayerName-fältens två separata TextInputs (split-field UI).
  // Letter-fältet är default-fokus efter Remove; digit-fältet kan fokuseras
  // bara när letter-sektionen har minst 1 tecken.
  const playerNameLettersRef = useRef<TextInput>(null);
  const playerNameDigitsRef = useRef<TextInput>(null);
  // PlayerName använder samma CodeKeyboard som code-cellerna men med
  // egen state — fri-text-fält behöver manuell mode-toggle (vs cell-typen
  // som styr code-keyboardet automatiskt).
  const [playerNameKbMode, setPlayerNameKbMode] = useState<'letter' | 'digit'>('letter');
  const [playerNameFocused, setPlayerNameFocused] = useState(false);
  // Spåra om föregående step var 'guest' så Player Name-autofill bara
  // triggar vid transition INTO guest-steget (inte refill om användaren
  // rensat fältet efter en autofill).
  const prevGuestStepRef = useRef(false);
  // Avled cell-värdena från `code`-strängen så de alltid är i sync.
  const codeCells: string[] = Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => code[i] ?? '');

  const handleCodeCellChange = (index: number, char: string) => {
    // Per-cell-filter: bokstavs-celler (0–1 + 4–5) = A–Z, siffer-celler (2–3) = 0–9.
    const isLetterCell = isLetterCellIndex(index);
    const allowed = isLetterCell ? /[^A-Z]/g : /[^0-9]/g;
    const clean = char.toUpperCase().replace(allowed, '').slice(0, 1);
    const arr = [...codeCells];
    arr[index] = clean;
    // Stoppa manual entry av samma blockerade bokstavspar som
    // genererings-flödet aldrig delar ut. Två oberoende checks beroende
    // på vilket par som påverkades — leading-paret (cell 0–1) eller
    // trailing-paret (cell 4–5). Validering körs när det relevanta paret
    // är fullt fyllt; samma blocklista gäller båda paren. På träff:
    // ändringen avbryts (cellen behåller sitt gamla värde), ingen
    // auto-focus-shift, och användaren får en native Alert.
    if (isLetterCell && clean) {
      if (index < ROOM_CODE_LEADING_LETTERS) {
        const leadingPair = arr.slice(0, ROOM_CODE_LEADING_LETTERS).join('');
        if (leadingPair.length === ROOM_CODE_LEADING_LETTERS && isBlockedLetterPair(leadingPair)) {
          Alert.alert('Combination not compliant', 'Please re-enter');
          return;
        }
      } else {
        const trailingStart = ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS;
        const trailingPair = arr.slice(trailingStart).join('');
        if (trailingPair.length === ROOM_CODE_TRAILING_LETTERS && isBlockedLetterPair(trailingPair)) {
          Alert.alert('Combination not compliant', 'Please re-enter');
          return;
        }
      }
    }
    setCode(arr.join(''));
    if (clean && index < ROOM_CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeCellKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !codeCells[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  // Handlers för CodeKeyboard:s knappar. Återanvänder befintliga sanitize/
  // auto-advance-flöden via handleCodeCellChange — så blocked-triplet-Alert
  // och cell-tomning fungerar identiskt oavsett om input kommer från system-
  // tangentbord (legacy-väg om showSoftInputOnFocus skulle aktiveras igen)
  // eller vår custom keyboard.
  const handleCustomCharPress = (char: string) => {
    if (focusedCodeIdx === null) return;
    handleCodeCellChange(focusedCodeIdx, char);
  };

  // Strikt sekventiell cell-fokus: cursor:n får bara stå i nästa-tomma cell
  // (eller på sista cellen om alla är fyllda så backspace fungerar därifrån).
  // Om användaren tappar en otillåten cell snäpper fokus tillbaka direkt —
  // ingen "skutta över tomma celler"-trick. Forward = typ ett tecken,
  // backward = backspace, ingen direkt-tap-navigation.
  const handleCellFocus = (i: number) => {
    const empty = codeCells.findIndex((c) => !c);
    const allowed = empty === -1 ? ROOM_CODE_LENGTH - 1 : empty;
    if (i !== allowed) {
      // Redirect:a fokus till tillåten cell. Den cellens egna onFocus
      // kör handleCellFocus igen (som passerar valideringen och sätter
      // focusedCodeIdx) — så vi return:ar utan att uppdatera state här.
      codeRefs.current[allowed]?.focus();
      return;
    }
    setFocusedCodeIdx(i);
  };

  // Backspace-flow:
  //   1) Cell:n innehåller något → töm den, stanna kvar (vanligt fall).
  //   2) Cell:n är tom och inte första cellen → flytta fokus till föregående
  //      cell och töm den (matchar iOS:s system-keyboard-backspace-beteende
  //      som handleCodeCellKeyPress redan emulerar för system-tangentbordet).
  const handleCustomBackspace = () => {
    if (focusedCodeIdx === null) return;
    if (codeCells[focusedCodeIdx]) {
      handleCodeCellChange(focusedCodeIdx, '');
    } else if (focusedCodeIdx > 0) {
      const prevIdx = focusedCodeIdx - 1;
      handleCodeCellChange(prevIdx, '');
      codeRefs.current[prevIdx]?.focus();
    }
  };

  // När modalen öppnas: nollställ ALLT state och börja på det step caller
  // bad om. Reset på öppning (inte stängning) så att state alltid är färskt
  // även om användaren stänger och öppnar igen snabbt — under fade-out
  // behåller modalen senaste UI-state, vilket är önskvärt visuellt.
  // Reset:ar även prevGuestStepRef så Player Name-autofill triggar vid
  // nästa entry till guest-steget (oavsett om det sker via chooser eller
  // initialStep='guest' direkt från Home-skärmens Join-as-Guest-knapp) —
  // UTOM när ett initialGuestDraft återställs, se nedan.
  useEffect(() => {
    if (visible) {
      // `initialGuestDraft` återställer guest-fälten efter en Remote
      // 1vs1-gate + Cancel i auth-formuläret — spelaren ska slippa fylla i
      // namn/födelseår igen. Koden nollställs alltid (den koden var ju just
      // den de inte fick joina). prevGuestStepRef sätts till true i det
      // läget så auto-genereringen av PlayerName INTE skriver över det
      // återställda namnet.
      setCode('');
      setGuestName(initialGuestDraft?.guestName ?? '');
      setGuestBirthYearText(initialGuestDraft?.guestBirthYearText ?? '');
      setGuestAssistance(initialGuestDraft?.guestAssistance ?? 'full');
      setYearPickerOpen(false);
      setPlayerNameStatus('idle');
      setStep(initialStep);
      setFocusedCodeIdx(null);
      prevGuestStepRef.current = !!initialGuestDraft;
    }
  }, [visible, initialStep, initialGuestDraft]);

  // Ladda invites när modalen öppnas — vi behöver längden redan på chooser-steget
  // för att kunna visa rätt enabled/disabled-läge på "Join Waiting Invites".
  useEffect(() => {
    if (visible) {
      loadInvites().then(setInvites);
    }
  }, [visible]);

  // Realtime push av invites medan modalen är öppen. Lyssnar på BÅDA INSERT
  // (ny host-skickad invite med to_user_id som matchar oss — backfillas av
  // set_invite_to_user_id-triggern via profiles.player_name) OCH DELETE
  // (host raderar lobby:n eller startar spelet → CASCADE/explicit cleanup
  // tar bort raden). Bägge events triggar en full re-load så stale invites
  // försvinner live utan att user behöver stänga/öppna modal:en.
  //
  // Subscription är gated på `visible` så vi inte håller en idle channel
  // öppen när modalen är stängd. Defensiv channel-cleanup speglar
  // LobbyScreen:s pattern — supabase.channel(name) återanvänder befintlig
  // topic så stale subscribed channels från remount måste rensas innan
  // .on() registreras (annars kraschar med "cannot add postgres_changes
  // callbacks after subscribe()").
  //
  // DELETE-events har en quirk: filter på to_user_id=eq.<userId> matchar
  // bara om raden hade exakt to_user_id satt vid radering (vilket den har
  // efter trigger:n). CASCADE-deletes från rooms-deletion bär samma
  // to_user_id så filtret träffar korrekt.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = userResp.user?.id;
      if (!userId || cancelled) return;
      const topic = `realtime:waiting_invites:${userId}`;
      supabase.getChannels()
        .filter((c) => c.topic === topic)
        .forEach((c) => supabase.removeChannel(c));
      const reload = () => {
        loadInvites().then((updated) => {
          if (!cancelled) setInvites(updated);
        });
      };
      channel = supabase
        .channel(`waiting_invites:${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'waiting_invites', filter: `to_user_id=eq.${userId}` },
          reload,
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'waiting_invites', filter: `to_user_id=eq.${userId}` },
          reload,
        )
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [visible]);

  // Faktiskt utför accept-flödet — guards + navigation oförändrade. Bruten
  // ut ur handleAcceptInvite (2026-08-27) så både "redan friend"-fallet och
  // consent-popupens OK-knapp kan dela EXAKT samma logik.
  const proceedAcceptInvite = async (invite: WaitingInvite) => {
    // Active-room-check: host kan ha raderat lobby:n mellan att invite
    // skickades och usern hann confirma. Visa tydlig "Lobby no longer
    // available"-popup och rensa bort den stale inviten ur listan så user
    // inte kan tap:a den igen. removeInvite anropas FÖRE Alert eftersom
    // listan ska vara aktuell direkt vid OK — annars hänger den döda
    // posten kvar tills nästa modal-open.
    if (!(await isActiveRoom(invite.roomCode))) {
      const updated = await removeInvite(invite.id);
      setInvites(updated);
      Alert.alert(
        'Lobby no longer available',
        'This lobby has been deleted by the Host.',
      );
      return;
    }
    // Single-player-lobby: host kan ha skickat inbjudan och sedan bytt till
    // single. Inviten ligger KVAR i listan (som capacity-fallet) — host kan
    // byta tillbaka, och då ska den fortfarande gå att tacka ja till.
    if (await checkSinglePlayerLobby(invite.roomCode)) return;
    // Host kan ha startat en re-match efter att inbjudan skickades — då är
    // uppsättningen låst och bara förra spelets spelare kommer in.
    if (await checkRematchLockedLobby(invite.roomCode, currentPlayerName)) return;
    // Capacity-check FÖRE removeInvite: om lobby:n är full ska usern få
    // popup och inviten ligga kvar i listan, så de kan försöka igen om
    // någon lämnar. Speglar samma check som handleJoinWithCode kör.
    if (await checkLobbyCapacity(invite.roomCode)) return;
    // Ömsesidig friend-add (Peter 2026-08-27): att acceptera lägger till
    // HOST:en på RECIPIENT:ens egna friends-lista också — host-sidans add
    // sker separat via LobbyScreen:s pending→confirmed-watcher när den här
    // spelaren dyker upp i lobbyns players[]. addFriend dedupar case-
    // insensitivt så det är säkert att anropa ovillkorligt.
    await addFriend(invite.fromPlayerName, invite.fromAvatarId);
    await removeInvite(invite.id);
    onClose();
    router.push({
      pathname: '/lobby',
      params: { code: invite.roomCode, isHost: 'false' },
    });
  };

  // "Deny" (Peter 2026-08-27) — tyst avböjning, ingen host-notifiering.
  // Raden tas bara bort ur mottagarens inbox.
  const handleDenyInvite = async (invite: WaitingInvite) => {
    const updated = await removeInvite(invite.id);
    setInvites(updated);
  };

  // Accept-knappen (Peter 2026-08-27, ersatte hela-radens implicita accept).
  // Om host:s invite redan har mottagaren som friend (invite.alreadyFriend)
  // går det direkt igenom; annars visas ett consent-steg FÖRST eftersom
  // accepterandet lägger till en NY, ömsesidig friend-relation.
  const handleAcceptInvite = async (invite: WaitingInvite) => {
    if (invite.alreadyFriend) {
      await proceedAcceptInvite(invite);
      return;
    }
    Alert.alert(
      'Accept invitation?',
      'By accepting this invitation you will both 1. join the lobby and 2. accept that both of you will be added to each others QuizVibe friend list.',
      [
        { text: 'OK', onPress: () => proceedAcceptInvite(invite) },
        { text: 'Deny', style: 'destructive', onPress: () => handleDenyInvite(invite) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleJoinWithCode = async () => {
    if (code.length < ROOM_CODE_LENGTH) return;
    // Existence-check mot Supabase rooms-tabellen. Saknas koden (eller är
    // den expired/game-started) visar vi Alert och stannar i formuläret
    // istället för att navigera.
    if (!(await isActiveRoom(code))) {
      // Remote 1v1-återinträde: rummet kan vara stängt (game_started) eller
      // dött (24h-expiry) medan MATCHEN lever sin egen 48h-livscykel. Om
      // koden pekar på en aktiv remote-match där JAG är deltagare (RLS
      // filtrerar) → gå direkt till solo-quizen (resume vid första
      // obesvarade frågan) istället för "Room not found".
      const remoteMatch = await getMatchByRoomCode(code);
      if (remoteMatch) {
        const userId = await getOwnUserId();
        const my = userId ? splitMatchForUser(remoteMatch, userId) : null;
        if (my) {
          if (my.me.finishedAt != null) {
            Alert.alert(
              'Already played',
              'You have already played your questions in this 1vs1 match. Check "1vs1" on the Home screen for the result.',
            );
            return;
          }
          onClose();
          router.push({ pathname: '/quiz', params: buildRemoteQuizParams(my) });
          return;
        }
      }
      Alert.alert(
        'Room not found',
        'There is no Room code activated with this combination',
      );
      return;
    }
    // Own-lobby-check: samma user inloggad på två enheter och försöker joina
    // sin egen lobby från device B. Måste komma före capacity-checken så
    // användaren får det mer specifika felmeddelandet.
    if (await isOwnLobby(code, currentPlayerName)) {
      Alert.alert('Already in lobby', 'User already exists in the lobby');
      return;
    }
    // Single-player-lobby: ingen plats att joina förrän host byter läge.
    if (await checkSinglePlayerLobby(code)) return;
    // Re-match-lobby: låst uppsättning — bara förra spelets spelare släpps in.
    if (await checkRematchLockedLobby(code, currentPlayerName)) return;
    // Capacity-check: om host:s lobby redan är full visar vi popup med text
    // som beror på Free vs Premium-host. Användaren stannar i join-formuläret.
    if (await checkLobbyCapacity(code)) return;
    // Spotify pre-join-gate borttagen (Plan B 2026-07-22): ingen OAuth att
    // verifiera — spelaren self-attestar Spotify i lobbyn, och host:s
    // approve-guards blockerar oattesterade spelare i Spotify-spel.
    onClose();
    router.push({ pathname: '/lobby', params: { code, isHost: 'false' } });
  };

  // Parsea och validera birth year. Returnerar null om input inte är ett
  // giltigt 4-siffrigt år inom tillåtet intervall.
  const parsedBirthYear = (() => {
    const n = parseInt(guestBirthYearText, 10);
    if (isNaN(n)) return null;
    if (n < MIN_BIRTH_YEAR || n > MAX_BIRTH_YEAR) return null;
    return n;
  })();

  // Sekventiella låsnings-gates: varje fält låses upp först när föregående
  // är klart. PlayerNamet måste *valideras* (inte bara skrivas) innan year
  // låses upp — det är hur vi visar progress mot lobbyn.
  const yearUnlocked = playerNameStatus === 'available';
  const assistanceUnlocked = yearUnlocked && parsedBirthYear !== null;
  // Assistance är default-ifylld, så code-låset följer assistance-låset direkt.
  const codeUnlocked = assistanceUnlocked;

  const isGuestFormValid =
    playerNameStatus === 'available' &&
    parsedBirthYear !== null &&
    code.length === ROOM_CODE_LENGTH;

  // Guest-host-formen saknar rumkod (koden genereras vid submit) —
  // giltig så fort namnet validerats och år valts.
  const isGuestHostFormValid =
    playerNameStatus === 'available' && parsedBirthYear !== null;

  const handleCheckPlayerName = () => {
    const trimmed = guestName.trim();
    if (!trimmed) return;
    // Auto-inserta dash om användaren bara typat letters innan Check —
    // dashen är "fixed" i format-spec:en så användaren ska inte behöva
    // tänka på den manuellt.
    const normalized = normalizePlayerName(trimmed);
    if (normalized !== guestName) setGuestName(normalized);
    Keyboard.dismiss();
    setPlayerNameStatus('checking');
    // Mock-latens — byt mot riktigt API-anrop när backend finns.
    setTimeout(() => {
      setPlayerNameStatus(validatePlayerName(normalized));
    }, 600);
  };

  // Rensa namnet och låt användaren skriva eget. Status faller till 'idle'
  // så Year-låset stängs igen tills nytt namn validerats via Check.
  // Refokuserar fältet så CodeKeyboard:n stannar uppe direkt — eftersom
  // det är ett in-app-keyboard pushar inte layouten upp som system-keyb.
  const handleGuestRemoveName = () => {
    setGuestName('');
    setPlayerNameStatus('idle');
    setPlayerNameKbMode('letter');
    playerNameLettersRef.current?.focus();
  };

  // Auto-generera-helper: skickar nya namnet till state + status='available'
  // (förvaliderat mot TAKEN_PLAYER_NAMES + profanity i generatePlayerName).
  const applyGenerated = (generated: string) => {
    setGuestName(generated);
    setPlayerNameStatus('available');
    Keyboard.dismiss();
  };

  // Auto-generera Player Name. Två branches:
  //   • Fältet tomt → generera direkt med "Guest"-prefix → "GuestA-1234567".
  //   • Användaren har redan typat letters → fråga "Try to keep PlayerName
  //     letters or not?". Yes-branchen bevarar letters och randomiserar bara
  //     digits; No-branchen genererar helt nytt med "Guest"-prefixet igen.
  // excludeLetters härleds från lobbyns nuvarande spelar-lista så två
  // guests inte får samma identifierar-bokstav (GuestA + GuestB istället
  // för GuestA + GuestA). Async lookup mot mockLobbyPlayers; om koden
  // saknar lobby-data faller setet tillbaka till tom (= ingen exclusion).
  const handleGuestGenerateName = async () => {
    const trimmedLetters = getPlayerNameLetters(guestName.trim());
    const lobbyPlayers = await getLobbyPlayers(code).catch(() => null);
    const excludeLetters = extractTakenGuestLetters(
      (lobbyPlayers ?? []).map((p) => p.name),
    );
    if (trimmedLetters.length > 0) {
      Alert.alert(
        'Auto-generate Player Name',
        'Try to keep PlayerName letters or not?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace all',
            onPress: () => applyGenerated(generatePlayerName(TAKEN_PLAYER_NAMES, { prefix: 'Guest', excludeLetters })),
          },
          {
            text: 'Keep letters',
            onPress: () => applyGenerated(generatePlayerName(TAKEN_PLAYER_NAMES, { keepLetters: trimmedLetters })),
          },
        ],
      );
      return;
    }
    applyGenerated(generatePlayerName(TAKEN_PLAYER_NAMES, { prefix: 'Guest', excludeLetters }));
  };

  // CodeKeyboard skickar tecknet hit. Letter/digit dispatch:as via
  // playerName-helpers så format-reglerna upprätthålls per tangenttryck:
  //   • Letters: A–Z, första versal/resten gemener, max 10, låst när dash finns.
  //   • Digits:  0–9, max 7, kräver minst 1 letter (auto-insertar dash).
  const handlePlayerNameKeyPress = (char: string) => {
    setGuestName((prev) =>
      playerNameKbMode === 'letter'
        ? appendPlayerNameLetter(prev, char)
        : appendPlayerNameDigit(prev, char),
    );
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  // Backspace dispatchas per fokuserat fält så letter-fältet aldrig
  // muteras när digits finns (skyddar mot orphan-digits utan letters).
  const handlePlayerNameBackspace = () => {
    setGuestName((prev) =>
      playerNameKbMode === 'letter'
        ? backspacePlayerNameLetters(prev)
        : backspacePlayerNameDigits(prev),
    );
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const togglePlayerNameKbMode = () => {
    // Digit-mode är låst tills letter-sektionen har minst 1 tecken — toggle
    // är no-op i det läget (knappen renderas dimmad via modeToggleDisabled).
    if (guestName.length === 0 && playerNameKbMode === 'letter') return;
    if (playerNameKbMode === 'letter') {
      setPlayerNameKbMode('digit');
      playerNameDigitsRef.current?.focus();
    } else {
      setPlayerNameKbMode('letter');
      playerNameLettersRef.current?.focus();
    }
  };

  // Auto-fyll Player Name när användaren går in i guest-steget och fältet
  // är tomt. Genererar ett unikt namn (verifierat mot mock TAKEN_PLAYER_NAMES)
  // och markerar status som 'available' så användaren kan gå direkt till
  // year of birth. excludeLetters härleds från lobbyns spelar-lista via
  // async lookup (getLobbyPlayers är Promise-baserad) så två guests inte
  // får samma identifierar-bokstav. Manuell ändring återställer status till
  // 'idle' via handleGuestNameChange och kräver Check innan formuläret går vidare.
  useEffect(() => {
    const wasGuest = prevGuestStepRef.current;
    const inGuestStep = step === 'guest' || step === 'guest-host';
    prevGuestStepRef.current = inGuestStep;
    if (inGuestStep && !wasGuest && guestName === '') {
      let cancelled = false;
      (async () => {
        // Guest-host-steget har ingen rumkod ännu — ingen lobby att
        // exkludera letters mot, så lookup:en hoppas över helt.
        const lobbyPlayers = step === 'guest'
          ? await getLobbyPlayers(code).catch(() => null)
          : null;
        if (cancelled) return;
        const excludeLetters = extractTakenGuestLetters(
          (lobbyPlayers ?? []).map((p) => p.name),
        );
        // Guest-flödet använder "Guest"-prefixet → "GuestA-1234567"
        // (6 letters: "Guest" + 1 versal random, sedan 7 random digits).
        const generated = generatePlayerName(TAKEN_PLAYER_NAMES, {
          prefix: 'Guest',
          excludeLetters,
        });
        setGuestName(generated);
        setPlayerNameStatus('available');
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [step, guestName, code]);

  const handleJoinAsGuest = async () => {
    if (!isGuestFormValid || parsedBirthYear === null || guestAssistance === null) return;
    // Existence-check mot Supabase rooms-tabellen. PlayerName-uniqueness är
    // fortsatt mockad mot TAKEN_PLAYER_NAMES via validatePlayerName (separat
    // store, ej i scope för Slice 3A).
    if (!(await isActiveRoom(code))) {
      Alert.alert(
        'Room not found',
        'There is no Room code activated with this combination',
      );
      return;
    }
    // IndDev-blocket för självanslutna guests borttaget (policy 2026-08-06):
    // guests med egen enhet får joina IndDev-lobbies. Endast host-TILLAGDA
    // guests är blockerade från IndDev (de saknar enhet) — enforcas i Lobby.
    //
    // Remote 1vs1-gate (2026-08-08): läget spelas ENBART av QuizVibe-users
    // mot varandra. Guest-formen är per definition guest-läge, så den
    // blockeras ALLTID mot 1v1-lobbies — även om enheten råkar ha en
    // inloggad profil (en registrerad user som spelar som Guest är lika
    // utestängd som en ren guest).
    //
    // Signalen läses från rooms-raden (`is_remote_1v1`, migration 0031),
    // INTE från lobby_settings.game_mode: rums-raden skrivs atomiskt vid
    // skapandet innan någon join är möjlig, medan lobby_settings skrivs
    // genom en 300ms-debounce och gjorde gaten fail-open i ~1s efter att
    // lobbyn skapats. Nu finns ingen race — svaret är alltid definitivt.
    //
    // Rum skapade FÖRE 0031 saknar kolumnen och resolvar till false; de
    // fångas av lobby-backstoppen och försvinner själva inom 24h
    // (expires_at). Ingen backfill behövs.
    const roomMeta = await getRoomMeta(code);
    if (roomMeta?.isRemote1v1) {
      // Skicka med de ifyllda fälten så Cancel i auth-formuläret kan
      // återställa guest-formen i stället för att kasta bort allt.
      onRemoteAccountRequired?.('join', {
        guestName,
        guestBirthYearText,
        guestAssistance,
      });
      return;
    }
    // Spotify pre-join-gate borttagen (Plan B 2026-07-22): inget konto krävs —
    // guests kan self-attesta Spotify i lobbyn. (Spotify DJ är dessutom
    // IndDev-only, så guest-fallet fångas redan av IndDev-blocket ovan.)
    // Own-lobby-check: jämför mot guestName (identiteten användaren joinar
    // med via guest-formen) ELLER currentPlayerName (om inloggad). Fångar
    // både den inloggade-på-två-enheter-fallen och den explicita "joina egen
    // lobby som guest"-fallet om de råkar typa in sin egen playerName.
    const guestIdentity = guestName.trim();
    const ownByLogin = await isOwnLobby(code, currentPlayerName);
    const ownByGuest = guestIdentity ? await isOwnLobby(code, guestIdentity) : false;
    if (ownByLogin || ownByGuest) {
      Alert.alert('Already in lobby', 'User already exists in the lobby');
      return;
    }
    // Single-player-lobby: speglar handleJoinWithCode.
    if (await checkSinglePlayerLobby(code)) return;
    // Re-match-lobby: speglar handleJoinWithCode. En gäst som VAR med i
    // förra spelet har en pre-seedad rad och matchar på sitt guest-namn.
    if (await checkRematchLockedLobby(code, guestIdentity || currentPlayerName)) return;
    // Capacity-check: speglar handleJoinWithCode — full lobby visar popup
    // istället för att skicka in gästen som ändå skulle få "lobby is full"
    // när de hamnade i Lobby-vyn.
    if (await checkLobbyCapacity(code)) return;
    // Auto-fill-detektion: format `GuestA-1234567` — "Guest"-prefix + 1
    // versal random + dash + 7 digits. Om användaren ändrat namnet
    // manuellt blir flaggan false.
    const autofilled = /^Guest[A-Z]-\d{7}$/.test(guestName.trim());
    track('guest_name_created', { autofilled, assistance: guestAssistance });
    onClose();
    router.push({
      pathname: '/lobby',
      params: {
        code,
        isHost: 'false',
        asGuest: 'true',
        // normalizePlayerName strippar ev. trailing dash så lobby visar
        // "Anna" istället för "Anna-" när inga digits finns.
        guestName: normalizePlayerName(guestName.trim()),
        guestBirthYear: String(parsedBirthYear),
        guestAssistance: guestAssistance,
      },
    });
  };

  // "Start Game as Guest" — guest-HOST-flödet. Speglar HomeScreen:s
  // handleCreateGame minus credit-gaten (guest hosts förbrukar aldrig
  // credits; begränsningen ligger i lobbyns låsta settings + att Play
  // Again saknas — nytt spel kräver att hela proceduren görs om).
  // Fungerar för både utloggade och inloggade users — en inloggad user
  // som väljer denna väg spelar under Guest-identiteten, inte sin profil.
  const handleStartGameAsGuestHost = async () => {
    if (!isGuestHostFormValid || parsedBirthYear === null) return;
    // Belt-and-suspenders: Remote 1vs1 spelas enbart av QuizVibe-users mot
    // varandra, så guest-hosting når det ALDRIG — oavsett om enheten har en
    // inloggad profil. Panelens Remote-rad är redan låst (utloggad) eller
    // helt dold (inloggad), men guestLobbyType är sessions-state så en
    // stale '1v1' får inte slinka igenom hit.
    if (guestHostLobbyType === '1v1') {
      onRemoteAccountRequired?.('host');
      return;
    }
    // Anon-session KRÄVS före registerActiveRoom — utan Supabase-session
    // no-op:ar room-INSERT:en tyst (mockActiveRooms varnar bara) och
    // joiners skulle få "Room not found" på en kod hosten sitter i.
    // ensureAuthSession är idempotent: inloggade users behåller sin
    // riktiga session, utloggade får en anonym via anon-signup.
    const user = await ensureAuthSession();
    if (!user) {
      Alert.alert(
        'Could not start',
        'Please check your connection and try again.',
      );
      return;
    }
    const hostName = normalizePlayerName(guestName.trim());
    const newCode = generateRoomCode();
    // Guest host är alltid Free-nivå: max 4 spelare, ingen premium.
    // Returvärdet MÅSTE kontrolleras — en tyst no-op (session-glitch/
    // nätverksfel) ger annars en fantom-lobby som joiners inte hittar
    // ("Room not found"-buggen 2026-08-07).
    const roomRegistered = await registerActiveRoom(newCode, {
      maxPlayers: 4,
      hostIsPremium: false,
      currentPlayerCount: 1,
      hostPlayerName: hostName,
      gameStarted: false,
      // Guest-hosting når aldrig Remote 1vs1 — guarden ovan returnerar för
      // '1v1' (läget är QuizVibe-users-only). Alltid en standard-lobby.
      isRemote1v1: false,
    });
    if (!roomRegistered) {
      Alert.alert(
        'Could not create game lobby',
        'The room could not be registered. Check your connection and try again.',
      );
      return;
    }
    // Samma fresh-slate-cleanup som handleCreateGame — se kommentaren där.
    clearLeftPlayers(newCode);
    clearLobbyPlayers(newCode);
    clearLobbySettings(newCode);
    clearEjected(newCode);
    clearGameStarted(newCode);
    const autofilled = /^Guest[A-Z]-\d{7}$/.test(guestName.trim());
    track('guest_name_created', { autofilled, assistance: guestAssistance });
    track('room_code_created', { guestHost: true });
    onClose();
    router.push({
      pathname: '/lobby',
      params: {
        code: newCode,
        isHost: 'true',
        guestHost: 'true',
        guestName: hostName,
        guestBirthYear: String(parsedBirthYear),
        // Guest host väljer assistance på formen sedan 2026-08-08 (var
        // hårdkodad Full) — seedar host-kortet i LobbyScreen.
        guestAssistance,
        // Vald lobbytyp ('single' | 'multiplayer') seedar lobbyns Game Mode.
        // Aldrig '1v1' — guarden ovan returnerar för det (remote 1vs1 är
        // QuizVibe-users-only sedan 2026-08-08).
        lobbyType: guestHostLobbyType,
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.sheet}>
          {step !== 'choose' && (
            <TouchableOpacity
              onPress={() => {
                // Guest-flödena är meant som snabb-vägar: chooser:s
                // andra alternativ (Room Code / Waiting Invites) är inte
                // relevanta för någon som valt guest. Back stänger
                // modalen istället för att leda tillbaka till chooser:n.
                if (step === 'guest' || step === 'guest-host') {
                  onClose();
                } else {
                  setStep('choose');
                }
              }}
              style={modal.backBtn}
              hitSlop={10}
            >
              <Text style={modal.backText}>← Back</Text>
            </TouchableOpacity>
          )}

          {step === 'choose' && (
            <>
              <Text style={modal.title}>Join Game</Text>
              <Text style={modal.subtitle}>Pick how you want to join</Text>
              <View style={modal.choiceList}>
                <ChoiceRow
                  icon="🔑"
                  label="Join with Room Code"
                  subtitle="Enter a code shared by the host"
                  onPress={() => setStep('code')}
                />
                <ChoiceRow
                  icon="📨"
                  label="Join Waiting Invites"
                  subtitle="See invites hosts have sent you"
                  disabled={invites.length === 0}
                  onPress={() => {
                    if (invites.length === 0) {
                      Alert.alert(
                        'No Waiting Invites',
                        "You don't have any pending invites yet. When a host sends you one, it will appear here.",
                      );
                      return;
                    }
                    setStep('invites');
                  }}
                />
                {!hideGuest && (
                  <ChoiceRow
                    icon="👤"
                    label="Join as Guest"
                    subtitle="No account — just pick a Player Name"
                    onPress={() => setStep('guest')}
                  />
                )}
              </View>
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={modal.title}>Enter Room Code</Text>
              <Text style={modal.subtitle}>Ask the host for the code</Text>
              {/* Samma 6-cell-layout som i guest-steget: 2 bokstäver +
                  bindestreck + 2 siffror + bindestreck + 2 trailing
                  bokstäver. Cell 0–1 och 4–5 visar bokstavstangentbord,
                  2–3 sifferkeypad. Auto-fokus hoppar framåt vid input
                  och bakåt vid backspace. */}
              <View style={modal.codeCellRow}>
                {(() => {
                  const nextEmpty = codeCells.findIndex((c) => !c);
                  return codeCells.map((cell, i) => {
                    const isLetterCell = isLetterCellIndex(i);
                    const isNextCell = i === nextEmpty;
                    return (
                      <React.Fragment key={i}>
                        <TextInput
                          ref={(ref) => { codeRefs.current[i] = ref; }}
                          style={[
                            modal.codeCell,
                            !!cell && modal.codeCellFilled,
                            isNextCell && !cell && modal.codeCellActive,
                          ]}
                          value={cell}
                          onChangeText={(t) => handleCodeCellChange(i, t)}
                          onKeyPress={(e) => handleCodeCellKeyPress(i, e.nativeEvent.key)}
                          maxLength={1}
                          // System-tangentbord helt avstängt — CodeKeyboard
                          // (custom in-app, render:as nedanför cellerna) är
                          // input-mekanism. Garanterar strikt content (bara A–Z
                          // i letter-celler, bara 0–9 i digit-celler) utan
                          // 123/ABC-switchar, samt konstant höjd så modal-
                          // layouten aldrig reflowar mellan letter↔digit-mode.
                          showSoftInputOnFocus={false}
                          // Sekventiell fokus — handleCellFocus snäpper tillbaka
                          // till next-empty-cell om användaren tappar nån annan.
                          onFocus={() => handleCellFocus(i)}
                          autoCapitalize={isLetterCell ? 'characters' : 'none'}
                          autoCorrect={false}
                          spellCheck={false}
                          selectTextOnFocus
                          autoFocus={i === 0}
                        />
                        {(i === ROOM_CODE_LEADING_LETTERS - 1 ||
                          i === ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS - 1) && (
                          <Text style={modal.codeDash}>–</Text>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
              </View>
              {focusedCodeIdx !== null && (
                <CodeKeyboard
                  mode={isLetterCellIndex(focusedCodeIdx) ? 'letter' : 'digit'}
                  onPress={handleCustomCharPress}
                  onBackspace={handleCustomBackspace}
                />
              )}
              <TouchableOpacity
                style={[
                  modal.joinBtn,
                  code.length < ROOM_CODE_LENGTH && modal.joinBtnDisabled,
                ]}
                onPress={handleJoinWithCode}
                disabled={code.length < ROOM_CODE_LENGTH}
              >
                <Text style={modal.joinBtnText}>Join Game Lobby</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'invites' && (
            <>
              <Text style={modal.title}>Waiting Invites</Text>
              <Text style={modal.subtitle}>Invites that hosts have sent you</Text>
              {invites.length === 0 ? (
                <View style={modal.emptyState}>
                  <Text style={modal.emptyIcon}>📭</Text>
                  <Text style={modal.emptyText}>No invites yet</Text>
                  <Text style={modal.emptySubtext}>
                    When a host shares a room with you, it will appear here.
                  </Text>
                </View>
              ) : (
                invites.map((inv) => (
                  <View key={inv.id} style={modal.inviteRow}>
                    <Text style={modal.inviteEmoji}>
                      {getAvatarEmojiById(inv.fromAvatarId)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={modal.inviteFrom}>{inv.fromPlayerName}</Text>
                      <Text style={modal.inviteCode}>Room {formatRoomCode(inv.roomCode)}</Text>
                    </View>
                    <View style={modal.inviteActions}>
                      <TouchableOpacity
                        style={modal.inviteDenyBtn}
                        activeOpacity={0.7}
                        onPress={() => handleDenyInvite(inv)}
                      >
                        <Text style={modal.inviteDenyText}>Deny</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={modal.inviteAcceptBtn}
                        activeOpacity={0.7}
                        onPress={() => handleAcceptInvite(inv)}
                      >
                        <Text style={modal.inviteAcceptText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {(step === 'guest' || step === 'guest-host') && (
            <>
              {/* Guest-JOIN och guest-HOST delar samma form-stomme (PlayerName
                  split-field + Year of birth) — samma state/handlers. Delarna
                  som skiljer (titel, assistance, room code, fasta settings-
                  rader, submit) gate:as på step nedan.
                  På korta skärmar (< 700 px) göms titel + subtitel medan det
                  custom CodeKeyboardet är uppe, så fältet som skrivs in ryms
                  ovanför tangentbordet. På högre skärmar visas de alltid. */}
              {!(SCREEN_HEIGHT < 700 && (playerNameFocused || focusedCodeIdx !== null)) && (
                <>
                  <Text style={modal.title}>
                    {step === 'guest-host' ? 'Start Game - Guest login' : 'Join as Guest'}
                  </Text>
                  <Text style={modal.subtitle}>
                    {step === 'guest-host'
                      ? 'Host a game without an account'
                      : 'Tap a field to fill in your details'}
                  </Text>
                </>
              )}

              <ScrollView
                ref={guestScrollRef}
                keyboardShouldPersistTaps="handled"
                // flexShrink: 1 låter ScrollView:n krympa när PlayerName- eller
                // Room Code-fältets custom CodeKeyboard tar plats nedanför.
                // maxHeight sänks på korta skärmar (äldre iPhones) så fält +
                // tangentbord ryms inom sheet:ens maxHeight (90 %).
                style={{ flexShrink: 1, maxHeight: SCREEN_HEIGHT < 700 ? 240 : 420 }}
                contentContainerStyle={{ gap: Spacing.md }}
              >
                {/* PlayerName — split-field: [Letters] – [Digits] [Check].
                    Två separata TextInputs så användaren ser tydligt
                    var letter-sektionen slutar och digit-sektionen börjar.
                    State-värdet (`guestName`) håller sammansatt format
                    "Abcd-123" som källa; fälten visar derived getters. */}
                <View style={modal.fieldGroup}>
                  <Text style={modal.fieldLabel}>Player Name - Letter-digit format</Text>
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
                      value={getPlayerNameLetters(guestName)}
                      maxLength={PLAYER_NAME_MAX_LETTERS}
                      editable={playerNameStatus !== 'checking'}
                      showSoftInputOnFocus={false}
                      // Cursor låst efter sista tecknet — användaren kan inte
                      // markera text eller flytta cursor in i mitten. Backspace
                      // är enda sättet att radera och tar alltid sista tecknet.
                      selection={{
                        start: getPlayerNameLetters(guestName).length,
                        end: getPlayerNameLetters(guestName).length,
                      }}
                      selectTextOnFocus={false}
                      contextMenuHidden={true}
                      onFocus={() => {
                        setFocusedCodeIdx(null);
                        setPlayerNameKbMode('letter');
                        setPlayerNameFocused(true);
                        // Scrolla PlayerName (formens första fält) till toppen
                        // så det syns ovanför CodeKeyboardet på korta skärmar.
                        requestAnimationFrame(() => {
                          guestScrollRef.current?.scrollTo({ y: 0, animated: true });
                        });
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
                        getPlayerNameLetters(guestName).length === 0 && modal.playerNameInputDisabled,
                      ]}
                      placeholder="1234"
                      placeholderTextColor={Colors.textDisabled}
                      value={getPlayerNameDigits(guestName)}
                      maxLength={PLAYER_NAME_MAX_DIGITS}
                      editable={playerNameStatus !== 'checking' && getPlayerNameLetters(guestName).length > 0}
                      showSoftInputOnFocus={false}
                      selection={{
                        start: getPlayerNameDigits(guestName).length,
                        end: getPlayerNameDigits(guestName).length,
                      }}
                      selectTextOnFocus={false}
                      contextMenuHidden={true}
                      onFocus={() => {
                        if (getPlayerNameLetters(guestName).length === 0) {
                          // Prevent fokus om letter-fältet är tomt — flytta
                          // tillbaka till letter-fältet så användaren typar
                          // letters först.
                          playerNameLettersRef.current?.focus();
                          return;
                        }
                        setFocusedCodeIdx(null);
                        setPlayerNameKbMode('digit');
                        setPlayerNameFocused(true);
                        requestAnimationFrame(() => {
                          guestScrollRef.current?.scrollTo({ y: 0, animated: true });
                        });
                      }}
                      onBlur={() => setPlayerNameFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={handleCheckPlayerName}
                      disabled={!guestName.trim() || playerNameStatus === 'checking' || playerNameStatus === 'available'}
                      style={[
                        modal.checkBtn,
                        (!guestName.trim() || playerNameStatus === 'checking') && modal.checkBtnDisabled,
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
                  {/* Sekundära åtgärder under namnfältet — Remove är aktiv så
                      fort fältet har innehåll. Auto-generate är ALLTID aktiv
                      (förutom under checking) — när användaren har typat
                      letters visas en "Try to keep PlayerName letters?"-prompt
                      innan namnet genereras. */}
                  <View style={modal.playerNameActionRow}>
                    <TouchableOpacity
                      onPress={handleGuestRemoveName}
                      disabled={guestName.length === 0 || playerNameStatus === 'checking'}
                      style={[
                        modal.nameActionBtn,
                        (guestName.length === 0 || playerNameStatus === 'checking') &&
                          modal.nameActionBtnDisabled,
                      ]}
                    >
                      <Text style={modal.nameActionBtnText}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleGuestGenerateName}
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
                  {/* Status-rad */}
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
                      // Lys upp triggeren när den är "nästa steg" (upplåst
                      // men inget år valt än) så ögat dras dit.
                      yearUnlocked && !parsedBirthYear && modal.yearTriggerActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      Keyboard.dismiss();
                      // Dölj custom CodeKeyboard om den var aktiv — vi öppnar
                      // year-pickern över formen och vill inte ha keyboard:n
                      // synlig under den.
                      setFocusedCodeIdx(null);
                      setYearPickerOpen(true);
                    }}
                  >
                    <Text
                      style={[
                        modal.yearTriggerText,
                        !parsedBirthYear && modal.yearTriggerPlaceholder,
                        yearUnlocked && !parsedBirthYear && modal.yearTriggerPlaceholderActive,
                      ]}
                    >
                      {parsedBirthYear ? formatBirthYear(parsedBirthYear) : 'Select year'}
                    </Text>
                    <Text style={modal.yearTriggerArrow}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Assistance level (låst tills year valt). Default 'full'
                    är förvalt, så användaren kan gå direkt till Room Code.
                    Delas av guest-JOIN och guest-HOST sedan 2026-08-08 —
                    guest host var tidigare låst till Full (visades som en
                    read-only "Fixed Guest settings"-ruta tillsammans med
                    60s svarstid). Guest host väljer numera BÅDA fritt:
                    nivån här, svarstiden i lobbyn. Kvar som fast för guest
                    host är enbart Game era (fulla spannet).
                    Guest-HOST har inga rumkods-celler — koden genereras vid
                    submit i handleStartGameAsGuestHost. */}
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
                    {ASSISTANCE_OPTIONS.map((opt) => {
                      const isSelected = guestAssistance === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            modal.skillBtn,
                            isSelected && modal.skillBtnActive,
                          ]}
                          onPress={() => {
                            // Dölj custom CodeKeyboard om aktiv — användaren
                            // har lämnat code-cellerna för att klicka assistance.
                            setFocusedCodeIdx(null);
                            setGuestAssistance(opt.id);
                          }}
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

                {step === 'guest' && (
                <>
                {/* Room code — 3 bokstäver + bindestreck + 2 siffror +
                    1 trailing bokstav. Cell 0–2 och 5 visar bokstavs-
                    tangentbord, 3–4 sifferkeypad.
                    Låst tills assistance level är valt. */}
                <View
                  style={[modal.fieldGroup, !codeUnlocked && modal.fieldGroupLocked]}
                  pointerEvents={codeUnlocked ? 'auto' : 'none'}
                >
                  <Text style={modal.fieldLabel}>Room Code</Text>
                  <View style={modal.codeCellRow}>
                    {(() => {
                      // Hitta nästa tomma cell — den ska highlightas medan
                      // användaren fyller i koden.
                      const nextEmpty = codeCells.findIndex((c) => !c);
                      return codeCells.map((cell, i) => {
                        const isLetterCell = isLetterCellIndex(i);
                        const isNextCell = codeUnlocked && i === nextEmpty;
                        return (
                          <React.Fragment key={i}>
                            <TextInput
                              ref={(ref) => { codeRefs.current[i] = ref; }}
                              style={[
                                modal.codeCell,
                                !!cell && modal.codeCellFilled,
                                isNextCell && !cell && modal.codeCellActive,
                              ]}
                              value={cell}
                              onChangeText={(t) => handleCodeCellChange(i, t)}
                              onKeyPress={(e) => handleCodeCellKeyPress(i, e.nativeEvent.key)}
                              maxLength={1}
                              // Se Room Code-flödet ovan för rationale —
                              // CodeKeyboard (custom in-app) sköter input,
                              // handleCellFocus enforcar sekventiell fokus.
                              showSoftInputOnFocus={false}
                              onFocus={() => {
                                handleCellFocus(i);
                                // Room Code är formens sista fält — scrolla ned
                                // så det syns ovanför CodeKeyboardet på korta
                                // skärmar.
                                requestAnimationFrame(() => {
                                  guestScrollRef.current?.scrollToEnd({ animated: true });
                                });
                              }}
                              autoCapitalize={isLetterCell ? 'characters' : 'none'}
                              autoCorrect={false}
                              spellCheck={false}
                              selectTextOnFocus
                            />
                            {(i === ROOM_CODE_LEADING_LETTERS - 1 ||
                              i === ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS - 1) && (
                              <Text style={modal.codeDash}>–</Text>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </View>
                </View>
                </>
                )}
              </ScrollView>

              {focusedCodeIdx !== null && (
                <CodeKeyboard
                  mode={isLetterCellIndex(focusedCodeIdx) ? 'letter' : 'digit'}
                  onPress={handleCustomCharPress}
                  onBackspace={handleCustomBackspace}
                />
              )}
              {playerNameFocused && (
                <CodeKeyboard
                  mode={playerNameKbMode}
                  // Fullt A–Z för fritext-input (vs Room Code:s 24-bokstavs
                  // charset som exkluderar O/I för disambiguation).
                  letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  onPress={handlePlayerNameKeyPress}
                  onBackspace={handlePlayerNameBackspace}
                  onModeToggle={togglePlayerNameKbMode}
                  // Digit-mode kräver minst 1 letter — toggle-knappen dimmas
                  // i letter-mode tills letter-sektionen har innehåll.
                  modeToggleDisabled={playerNameKbMode === 'letter' && guestName.length === 0}
                />
              )}
              {step === 'guest' ? (
                <TouchableOpacity
                  style={[
                    modal.joinBtn,
                    !isGuestFormValid && modal.joinBtnDisabled,
                  ]}
                  onPress={handleJoinAsGuest}
                  disabled={!isGuestFormValid}
                >
                  <Text style={modal.joinBtnText}>Join as Guest</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    modal.joinBtn,
                    !isGuestHostFormValid && modal.joinBtnDisabled,
                  ]}
                  onPress={handleStartGameAsGuestHost}
                  disabled={!isGuestHostFormValid}
                >
                  <Text style={modal.joinBtnText}>Start Game - Guest login</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity onPress={onClose} style={modal.cancelBtn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* ── Year-picker overlay ─────────────────────────────────
            Renderas inuti samma Modal som conditional overlay för att
            slippa nästlade native-modals (kan strula på iOS). */}
        {yearPickerOpen && (
          <View style={modal.yearPickerOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setYearPickerOpen(false)}
            />
            <View style={modal.yearPickerSheet}>
              <View style={modal.yearPickerHandle} />
              <Text style={modal.title}>Select Year of Birth</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {BIRTH_YEARS.map((year) => {
                  const selected = parsedBirthYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setGuestBirthYearText(String(year));
                        setYearPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          modal.yearItemText,
                          selected && modal.yearItemTextSelected,
                        ]}
                      >
                        {formatBirthYear(year)}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setYearPickerOpen(false)}
                style={modal.cancelBtn}
              >
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChoiceRow({
  icon, label, subtitle, onPress, disabled = false,
}: {
  icon: string; label: string; subtitle: string;
  onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[modal.choiceRow, disabled && modal.choiceRowDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[modal.choiceIcon, disabled && modal.choiceTextDisabled]}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[modal.choiceLabel, disabled && modal.choiceTextDisabled]}>{label}</Text>
        <Text style={[modal.choiceSubtitle, disabled && modal.choiceTextDisabled]}>{subtitle}</Text>
      </View>
      <Text style={[modal.choiceArrow, disabled && modal.choiceTextDisabled]}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

// Pulserande tagline-array. Renderingen växlar mellan dessa tre strängar
// med en cross-fade (se taglineFade-effekten nedan). Module-level för
// att undvika re-allokering per render. Behöver inte i18n:as här eftersom
// hela appen är engelska för V1-launchen.
const TAGLINES = [
  'Challenge yourself. Play together.',
  'Invite Friends. Socialize.',
  'Music. Film. Sport.',
];

export default function HomeScreen() {
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinInitialStep, setJoinInitialStep] = useState<JoinStep>('choose');
  const [joinHideGuest, setJoinHideGuest] = useState(false);
  // Lobbytyp-väljaren — fälls ut INLINE under Start-knappen (ingen modal).
  // Värdet säger vilken knapp som är expanderad; valet leder sedan till
  // handleCreateGame (registrerad) resp. guest-host-formen med
  // guestLobbyType satt (konsumeras av handleStartGameAsGuestHost via prop).
  const [hostTypeExpanded, setHostTypeExpanded] = useState<'none' | 'registered' | 'guest'>('none');
  const [guestLobbyType, setGuestLobbyType] = useState<HostLobbyType>('multiplayer');
  // Guest-sektionens fold-state — bara relevant för inloggade users (Peter
  // 2026-08-27). Default false (ihopfälld) så "Start New Game"-guest-
  // knappen inte konkurrerar visuellt med de gyllene user-knapparna;
  // en tap på "+" fäller ut den. Utloggade users påverkas inte — deras
  // guest-sektion visas alltid oförändrad.
  const [guestSectionExpanded, setGuestSectionExpanded] = useState(false);
  // Info-modalen bakom "i"-ikonerna intill BÅDA sektionsrubrikerna
  // ("QuizVibe user" + "Guest login / Non-registered") — jämförelse
  // user vs guest (USER_VS_GUEST_ROWS + PREMIUM_FEATURES).
  const [compareInfoVisible, setCompareInfoVisible] = useState(false);
  // Seedas från den synkrona profil-spegeln, INTE från null: Home nås alltid
  // via router.replace('/') (= full re-mount), och med null-start renderades
  // utloggat läge under hela loadProfile:s Supabase-roundtrip innan det
  // hoppade till inloggat. Spegeln ger rätt läge redan på första framen.
  const [profile, setProfile] = useState<ProfileData | null>(() => getCachedProfile() ?? null);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileMenuStep, setProfileMenuStep] = useState<'menu' | 'login' | 'register' | 'forgot'>('menu');
  // Pending-flagga för ?openRegister=1-deeplinken (guest-hostens "Activate
  // Extra package"-flöde från Lobby). Sätts av param-effekten nedan och
  // konsumeras av open-side reset-effekten som annars forcerar step='menu'.
  const openRegisterPendingRef = useRef(false);
  // Kontextuell subtitel i "Register or Login"-formuläret. null = default
  // ("Sign in to create and join games"). Sätts via ref-hand-off av
  // Remote 1vs1-gaterna; konsumeras av open-side-resetet nedan.
  const pendingAuthNoticeRef = useRef<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  // Guest-formens ifyllda fält när en Remote 1vs1-gate tog över. Sätts av
  // handleRemoteAccountRequired och konsumeras av auth-formulärets Cancel,
  // som då återöppnar guest-formen i stället för att lämna spelaren på Home.
  // Nollas när modalen stängs på något ANNAT sätt (lyckad register/login) —
  // då är guest-vägen inte längre relevant.
  const pendingGuestJoinDraftRef = useRef<GuestJoinDraft | null>(null);
  const [guestJoinDraft, setGuestJoinDraft] = useState<GuestJoinDraft | null>(null);
  const [loginPlayerName, setLoginPlayerName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // 'playerName' (default) renderar split-field [Letters]–[Digits] med custom
  // CodeKeyboard. 'email' renderar en single TextInput med system-keyboard.
  // handleLogin kollar mode för att veta om PlayerName→email-lookup behövs.
  const [loginMode, setLoginMode] = useState<'playerName' | 'email'>('playerName');
  const [forgotEmail, setForgotEmail] = useState('');
  // Forgot-flödet har två sub-steps: ange email → ange 6-siffrig OTP-kod
  // (mottagen via Supabase-recovery-email) + nytt lösenord. Splittas så
  // user inte ser kod-fält innan email skickats, och så att Back-knappen
  // i kod-steget tar tillbaka till email-steget (inte hela vägen ut).
  const [forgotStep, setForgotStep] = useState<'email' | 'code'>('email');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  // Login-formens custom CodeKeyboard för PlayerName-fältet (samma mönster
  // som Register + guest-form). Letter-fältet är fokuserat default; digit
  // låses upp när minst 1 letter typats.
  const loginPlayerNameLettersRef = useRef<TextInput>(null);
  const loginPlayerNameDigitsRef = useRef<TextInput>(null);
  const [loginPlayerNameKbMode, setLoginPlayerNameKbMode] = useState<'letter' | 'digit'>('letter');
  const [loginPlayerNameFocused, setLoginPlayerNameFocused] = useState(false);

  // ── Register-form state (sekventiell upplåsning som guest-flödet) ──
  const [regEmail, setRegEmail] = useState('');
  // Email valideras vid email-steget: format + "finns redan?" (Check-knapp).
  // Delar status-type med PlayerName (idle/checking/available/taken/invalid).
  const [regEmailStatus, setRegEmailStatus] = useState<PlayerNameStatus>('idle');
  const [regPlayerName, setRegPlayerName] = useState('');
  const [regPlayerNameStatus, setRegPlayerNameStatus] = useState<PlayerNameStatus>('idle');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirmed, setRegPasswordConfirmed] = useState(false);
  const [regBirthYearText, setRegBirthYearText] = useState('');
  // Default-värden: användaren kan registrera direkt efter year of birth.
  // Assistance och Region är förvalda men kan ändras via picker:erna.
  const [regAssistance, setRegAssistance] = useState<AssistanceLevel>('full');
  const [regRegion, setRegRegion] = useState<RegRegion>('sweden');
  const [regYearPickerOpen, setRegYearPickerOpen] = useState(false);
  const [regAssistancePickerOpen, setRegAssistancePickerOpen] = useState(false);
  const [regRegionPickerOpen, setRegRegionPickerOpen] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;

  // Pulserande tagline-byte via TRUE cross-fade — alla tre texterna är
  // alltid renderade (TAGLINES[0] i flow definierar wrap-höjden,
  // TAGLINES[1+] är absolut-positionerade ovanpå), var och en med egen
  // Animated.Value för opacity. Vid varje cycle körs två parallella
  // timings: nuvarande text fadar till 0 + nästa fadar till 1, båda
  // samtidigt = ingen blank-moment och en mjuk korsande övergång.
  //
  // Duration 2600ms + 6000ms mellan cykler = ~3.4s fullt synlig per
  // tagline + 2600ms cross-fade. Långsam fade ger lugnt tempo på
  // själva övergången utan att förlänga totaltiden per cykel.
  // Bezier(0.4, 0, 0.2, 1) är Material:s "standard ease" — accelererar
  // mjukt i början, decelererar mjukt i slutet, ingen plötslig
  // start/slut-känsla.
  //
  // useNativeDriver: true → opacity körs på native-tråden så animationen
  // stannar smooth även när JS-bridgen är upptagen (modal-öppningar,
  // focus-effects, etc.).
  const taglineOpacity0 = useRef(new Animated.Value(1)).current;
  const taglineOpacity1 = useRef(new Animated.Value(0)).current;
  const taglineOpacity2 = useRef(new Animated.Value(0)).current;
  const taglineActiveIdxRef = useRef(0);
  useEffect(() => {
    const opacities = [taglineOpacity0, taglineOpacity1, taglineOpacity2];
    const easing = Easing.bezier(0.4, 0, 0.2, 1);
    const cycle = () => {
      const current = taglineActiveIdxRef.current;
      const next = (current + 1) % opacities.length;
      Animated.parallel([
        Animated.timing(opacities[current], {
          toValue: 0,
          duration: 2600,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(opacities[next], {
          toValue: 1,
          duration: 2600,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
      taglineActiveIdxRef.current = next;
    };
    const interval = setInterval(cycle, 6000);
    return () => clearInterval(interval);
  }, [taglineOpacity0, taglineOpacity1, taglineOpacity2]);
  const taglineOpacities = [taglineOpacity0, taglineOpacity1, taglineOpacity2];

  // Ref + state för custom CodeKeyboard på Register-formens PlayerName-fält
  // — speglar guest-formens setup (se JoinModal). Samma motivation:
  // system-tangentbord pushar upp modalen och döljer fältet.
  // Split-field PlayerName: separat ref per fält (letter + digit).
  const regPlayerNameLettersRef = useRef<TextInput>(null);
  const regPlayerNameDigitsRef = useRef<TextInput>(null);
  const [regPlayerNameKbMode, setRegPlayerNameKbMode] = useState<'letter' | 'digit'>('letter');
  const [regPlayerNameFocused, setRegPlayerNameFocused] = useState(false);
  // Refs för att kunna scrolla PlayerName-fältet till toppen av ScrollView:n
  // när custom keyboardet öppnas — annars klipps fältet på mitten eftersom
  // ScrollView:n krymper med flexShrink:1 och PlayerName ligger en bit ner.
  // Password får samma behandling när system-tangentbordet öppnas så fältet
  // inte hamnar bakom keyboardet (KAV-padding pushar sheet:en upp men
  // Password ligger längre ned i ScrollView).
  const regScrollRef = useRef<ScrollView>(null);
  const regPlayerNameYRef = useRef(0);
  const regPasswordYRef = useRef(0);
  // Spårar om Password-fältet är fokuserat så Keyboard.addListener-effekten
  // kan scrolla till rätt fält när tangentbordet är fullt synligt. Setas i
  // onFocus/onBlur — keyboardDidShow är då en tillförlitlig trigger för
  // scroll (vs onFocus + setTimeout som råkar köra mot stale layout).
  const regPasswordFocusedRef = useRef(false);

  // Återställ menyns sub-step + alla form-fields när modalen stängs
  useEffect(() => {
    if (!profileMenuVisible) {
      const t = setTimeout(() => {
        setProfileMenuStep('menu');
        setLoginPlayerName('');
        setLoginEmail('');
        setLoginMode('playerName');
        setLoginPlayerNameFocused(false);
        setLoginPlayerNameKbMode('letter');
        setLoginPassword('');
        setForgotEmail('');
        setForgotStep('email');
        setForgotCode('');
        setForgotNewPassword('');
        setForgotSending(false);
        setRegEmail('');
        setRegEmailStatus('idle');
        setRegPlayerName('');
        setRegPlayerNameStatus('idle');
        setRegPassword('');
        setRegPasswordConfirmed(false);
        setRegBirthYearText('');
        setRegAssistance('full');
        setRegRegion('sweden');
        setRegYearPickerOpen(false);
        setRegAssistancePickerOpen(false);
        setRegRegionPickerOpen(false);
        setRegPlayerNameFocused(false);
        setRegPlayerNameKbMode('letter');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [profileMenuVisible]);

  // Scrolla Password-fältet till toppen av ScrollView:n när tangentbordet
  // visats. keyboardDidShow är garanterat efter att layouten stabiliserats
  // (KAV-padding applicerad) — onFocus + setTimeout var opålitligt.
  // Vi scrollar endast EN gång per focus-session (didScrollRef) eftersom
  // iOS:s autofill/QuickType-bar kan trigga keyboardDidShow flera gånger
  // medan användaren skriver — om vi animerade scroll vid varje fire skulle
  // ScrollView:n vara i konstant animation och Confirm-knappens hit-target
  // hoppa under användarens tap.
  useEffect(() => {
    const didScrollRef = { current: false };
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      if (regPasswordFocusedRef.current && !didScrollRef.current) {
        didScrollRef.current = true;
        regScrollRef.current?.scrollTo({
          y: regPasswordYRef.current,
          animated: true,
        });
      }
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      didScrollRef.current = false;
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Open-side reset — körs direkt när modalen öppnas. Garanterar färska
  // fält oavsett om close-side-resetet (300ms timeout ovan) hann köra
  // klart innan användaren öppnade modalen igen. Utan denna kunde t.ex.
  // regEmail bli kvar om man tryckte Cancel + Register snabbt.
  useEffect(() => {
    if (profileMenuVisible) {
      // openRegister-deeplink (2026-07-07): guest-hostens "Activate Extra
      // package → register"-flöde i Lobby navigerar hit med ?openRegister=1.
      // Utan ref-hand-off:en skulle denna reset forcera step tillbaka till
      // 'menu' och register-formuläret aldrig visas. Ref:en rensas direkt
      // så nästa normala öppning startar på 'menu' som vanligt.
      setProfileMenuStep(openRegisterPendingRef.current ? 'register' : 'menu');
      openRegisterPendingRef.current = false;
      // Samma ref-hand-off för den kontextuella subtiteln: satt av
      // Remote 1vs1-gaterna precis före setProfileMenuVisible(true).
      // Null:as här när den saknas så en vanlig öppning alltid visar
      // default-texten.
      setAuthNotice(pendingAuthNoticeRef.current);
      pendingAuthNoticeRef.current = null;
      setLoginPlayerName('');
      setLoginEmail('');
      setLoginMode('playerName');
      setLoginPlayerNameFocused(false);
      setLoginPlayerNameKbMode('letter');
      setLoginPassword('');
      setForgotEmail('');
      setForgotStep('email');
      setForgotCode('');
      setForgotNewPassword('');
      setForgotSending(false);
      setRegEmail('');
      setRegEmailStatus('idle');
      setRegPlayerName('');
      setRegPlayerNameStatus('idle');
      setRegPassword('');
      setRegPasswordConfirmed(false);
      setRegBirthYearText('');
      setRegAssistance('full');
      setRegRegion('sweden');
      setRegYearPickerOpen(false);
      setRegAssistancePickerOpen(false);
      setRegRegionPickerOpen(false);
      setRegPlayerNameFocused(false);
      setRegPlayerNameKbMode('letter');
    }
  }, [profileMenuVisible]);

  // Step-side reset — resetar register-fälten varje gång användaren
  // navigerar in i 'register'-steget. Täcker fallet där modalen är öppen
  // men användaren tryckt Back ner till menyn och sen Register igen
  // (open-side resetet ovan körs inte eftersom profileMenuVisible är
  // oförändrat true). Båda är defensiva — om en path missar är den andra
  // backup.
  useEffect(() => {
    if (profileMenuStep === 'register') {
      setRegEmail('');
      setRegEmailStatus('idle');
      setRegPlayerName('');
      setRegPlayerNameStatus('idle');
      setRegPassword('');
      setRegPasswordConfirmed(false);
      setRegBirthYearText('');
      setRegAssistance('full');
      setRegRegion('sweden');
      setRegYearPickerOpen(false);
      setRegAssistancePickerOpen(false);
      setRegRegionPickerOpen(false);
      setRegPlayerNameFocused(false);
      setRegPlayerNameKbMode('letter');
    }
  }, [profileMenuStep]);

  // TODO (auth): byt till riktig login-status när auth är inkopplad. Just nu
  // använder vi sparad profil i AsyncStorage som proxy för inloggad-state.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Synk-spegeln först (kan ha hunnit hydreras efter mount-seedningen),
      // sedan den auktoritativa async-laddningen. `undefined` = ännu inte
      // hydrerad → rör inte state, annars hade vi blinkat "utloggad".
      const cached = getCachedProfile();
      if (cached !== undefined) setProfile(cached);
      loadProfile().then((data) => {
        if (active) setProfile(data);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const isLoggedIn = !!profile;

  // Fäll ihop guest-sektionen automatiskt när spelaren loggar in — annars
  // kunde den stå kvar utfälld från en session där man tittade på den som
  // utloggad guest och sedan loggade in utan att skärmen remountat.
  useEffect(() => {
    if (isLoggedIn) setGuestSectionExpanded(false);
  }, [isLoggedIn]);

  const openJoin = (step: JoinStep = 'choose', options?: { hideGuest?: boolean }) => {
    setJoinInitialStep(step);
    setJoinHideGuest(options?.hideGuest ?? false);
    setJoinVisible(true);
  };

  /**
   * Remote 1vs1-gate → öppna "Register or Login"-formuläret DIREKT (ingen
   * Alert emellan, Peter 2026-08-08). Formulärets subtitel byts ut mot
   * `REMOTE_BLOCK_NOTICE[context]` så spelaren förstår varför de hamnade
   * där — det är den enda förklaringen som visas.
   *
   * Landar på MENU-steget (Welcome to QuizVibe → Register / Log in), INTE
   * på register-steget: en guest som blockas kan mycket väl redan ha ett
   * konto och bara vara utloggad. Därför sätts `openRegisterPendingRef`
   * medvetet INTE här (till skillnad från guest-host-registreringen, som
   * vet att kontot saknas).
   *
   * Ref-hand-off i stället för rakt setState eftersom open-side-resetet
   * körs EFTER att modalen blivit synlig och annars hade nollat noticen —
   * exakt samma mönster som openRegisterPendingRef.
   *
   * ⚠ MODAL-SWAP: båda gaterna kan fyra medan JoinModal är ÖPPEN
   * (guest-formens "Join as Guest" och guest-host-formens submit). Två RN
   * `<Modal>` kan inte presenteras samtidigt — iOS sväljer den andra TYST,
   * så användaren ser "ingenting händer". JoinModal måste därför stängas
   * FÖRST och profileMenu öppnas efter att fade-ut:en hunnit klart.
   * Delayen hoppas över när JoinModal inte var öppen (låsta Remote
   * Play-radens tap sker direkt på Home) så det vanliga fallet är instant.
   */
  const handleRemoteAccountRequired = useCallback(
    (context: RemoteBlockContext, draft?: GuestJoinDraft) => {
      pendingAuthNoticeRef.current = REMOTE_BLOCK_NOTICE[context];
      pendingGuestJoinDraftRef.current = draft ?? null;
      setHostTypeExpanded('none');
      if (joinVisible) {
        setJoinVisible(false);
        // Spegla JoinModal:s onClose — annars läcker ett '1v1'-val vidare.
        setGuestLobbyType('multiplayer');
        setTimeout(() => setProfileMenuVisible(true), MODAL_SWAP_DELAY_MS);
        return;
      }
      setProfileMenuVisible(true);
    },
    [joinVisible],
  );

  /**
   * Cancel i auth-formuläret. Kom spelaren hit från guest-formens Remote
   * 1vs1-gate återöppnas den formen med fälten ifyllda (ny rumskod kan
   * skrivas in, eller Back → Home) i stället för att dumpa dem på Home.
   * Annars vanlig stängning.
   *
   * RN kan inte visa två modaler samtidigt, så guest-formen kan inte ligga
   * kvar "bakom" auth-formuläret — den återskapas i stället, vilket ser
   * likadant ut för användaren.
   */
  const handleAuthFormCancel = useCallback(() => {
    const draft = pendingGuestJoinDraftRef.current;
    pendingGuestJoinDraftRef.current = null;
    setProfileMenuVisible(false);
    if (!draft) return;
    setGuestJoinDraft(draft);
    setTimeout(() => openJoin('guest'), MODAL_SWAP_DELAY_MS);
  }, []);

  // Auto-open JoinModal när Home entras med `?openJoinRegistered=1` i routen.
  // Används av Profile-skärmens "Join Game"-knapp i logout-sheet:n så
  // användaren landar direkt på registered-user join-flödet (hideGuest:true)
  // utan att se Home flicker. router.setParams clearar paramen efter open
  // så framtida fokus utan param inte trigggar modalen igen.
  const localParams = useLocalSearchParams<{ openJoinRegistered?: string; openRegister?: string; openAuth?: string }>();
  useFocusEffect(
    useCallback(() => {
      if (localParams.openJoinRegistered === '1') {
        openJoin('choose', { hideGuest: true });
        router.setParams({ openJoinRegistered: undefined });
      }
    }, [localParams.openJoinRegistered]),
  );

  // Auto-open Register-formuläret när Home entras med `?openRegister=1` —
  // guest-hostens "Activate Extra package"-popup i Lobby (Yes raderar lobbyn
  // och skickar hit). Ref:en konsumeras av open-side reset-effekten ovan som
  // annars hade forcerat step till 'menu'. OBS: register-steget renderas bara
  // för !isLoggedIn — en INLOGGAD guest host landar därför i den inloggade
  // menyn istället (acceptabelt: hen har redan ett konto).
  useFocusEffect(
    useCallback(() => {
      if (localParams.openRegister === '1') {
        openRegisterPendingRef.current = true;
        setProfileMenuVisible(true);
        router.setParams({ openRegister: undefined });
      }
    }, [localParams.openRegister]),
  );

  // Auto-open "Register or Login"-formuläret (profileMenu:ns menu-steg) när
  // Home entras med `?openAuth=join|host` — Lobby-backstoppen för Remote
  // 1vs1. Paramets värde ÄR kontexten, så samma förklarings-subtitel visas
  // som när gaten träffas direkt på Home.
  //
  // Skiljer sig från openRegister genom att INTE sätta pending-ref:en: en
  // guest som blockas från 1vs1 kan mycket väl redan HA ett konto, så de ska
  // få välja Register ELLER Log in i stället för att tvingas registrera.
  useFocusEffect(
    useCallback(() => {
      if (isRemoteBlockContext(localParams.openAuth)) {
        pendingAuthNoticeRef.current = REMOTE_BLOCK_NOTICE[localParams.openAuth];
        setProfileMenuVisible(true);
        router.setParams({ openAuth: undefined });
      }
    }, [localParams.openAuth]),
  );

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // lobbyType kommer från inline-väljaren ("Single & Multiplayer mode"
  // vs "1vs1 Matches") — '1v1' skickas som lobbyType-param till LobbyScreen
  // vars seed forcerar gameMode='remote-1v1' (renodlad 1vs1-lobby).
  // Host Game Credits-gate: blockerar host-flödet om Free är 0 (engångs-
  // köpta Extras borttagna 2026-07-07 — Premium är enda vägen förbi
  // dags-cappen). loadProfile() top-up:ar Free-saldot vid första load
  // efter midnatt CET (refreshFreeCreditsIfNeeded), så vi alltid jämför
  // mot aktuellt värde. Speglar samma blockad i LobbyScreen.handleStartGame
  // — skillnaden här är att vi gateas ut REDAN på Home så användaren inte
  // ens hinner skapa en lobby de inte kan starta.
  //
  // Returnerar profil + premium-status när det är fritt fram (så anroparen
  // slipper läsa om dem), annars null EFTER att ha visat popupen.
  // Anropas från TVÅ ställen: (a) "Start New Game"-knappens tap — så
  // popupen kommer direkt istället för först efter Local/Remote-valet
  // (Peter 2026-08-07); (b) handleCreateGame som backstop.
  const checkHostCredits = async (): Promise<{
    freshProfile: Awaited<ReturnType<typeof loadProfile>>;
    hasPremium: boolean;
  } | null> => {
    const [freshProfile, hasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    // Membership = obegränsade host-spel; ingen gate. Lobby:s handleStartGame
    // skippar också deduktionen så Free-saldot förblir orört.
    if (!hasPremium && (freshProfile?.freeGameCredits ?? 0) === 0) {
      Alert.alert(
        'Out of Host Game Credits',
        'You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium for unlimited host games.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/') },
        ],
      );
      return null;
    }
    return { freshProfile, hasPremium };
  };

  const handleCreateGame = async (lobbyType: HostLobbyType = 'multiplayer') => {
    const credits = await checkHostCredits();
    if (!credits) return;
    const { freshProfile, hasPremium } = credits;

    const code = generateRoomCode();
    // Registrera koden i Supabase rooms-tabellen + lagra host:s metadata så
    // join-flödena (handleJoinWithCode, handleJoinAsGuest) kan validera mot
    // den OCH visa rätt "Lobby is full"-popup baserat på Premium-status.
    // Auto-expirar efter 24h eller när host trycker Start Game.
    // hostIsPremium driver lobby-capacity-popupens text (Free host: "or to
    // upgrade", Premium host: "Host need to remove players"). Använder
    // subscriptionStorage:s flagga som loadProfile-effekten precis läste in.
    // Returvärdet MÅSTE kontrolleras — en tyst no-op (utloggad host/
    // nätverksfel) ger annars en fantom-lobby som joiners inte hittar
    // ("Room not found"-buggen 2026-08-07).
    const isRemote1v1 = lobbyType === '1v1';
    const roomRegistered = await registerActiveRoom(code, {
      // Remote 1vs1 är alltid exakt 2 spelare. Sätts redan här (i stället
      // för att vänta på LobbyScreen:s setRoomMaxPlayers-effekt) så
      // kapacitetskollen vid join är korrekt från första sekunden.
      maxPlayers: isRemote1v1 ? 2 : freshProfile?.maxPlayers ?? profile?.maxPlayers ?? 4,
      hostIsPremium: hasPremium,
      currentPlayerCount: 1,
      hostPlayerName: freshProfile?.playerName ?? profile?.playerName ?? '',
      gameStarted: false,
      isRemote1v1,
    });
    if (!roomRegistered) {
      Alert.alert(
        'Could not create game lobby',
        'The room could not be registered. Check your connection and that you are signed in, then try again.',
      );
      return;
    }
    // Säkerställ att leftPlayers-storen är tom för den nya koden så
    // ingen stale test-data smyger in i den färska lobby:n och felaktigt
    // markerar nån som "LEFT THIS GAME LOBBY". Samma princip för mock-
    // lobbyPlayers-storen — fresh slate så non-host:s polling inte plockar
    // upp stale spelar-data från en tidigare session med samma kod.
    clearLeftPlayers(code);
    clearLobbyPlayers(code);
    clearLobbySettings(code);
    clearEjected(code);
    clearGameStarted(code);
    track('room_code_created');
    router.push({
      pathname: '/lobby',
      params: {
        code,
        isHost: 'true',
        // Skickas ALLTID sedan 2026-08-24 — 'single'/'multiplayer' styr
        // lobbyns förvalda Game Mode precis som '1v1' styr remote-läget.
        lobbyType,
      },
    });
  };

  // Mock-login: sparar en minimal profil med användarens playerName.
  // Lösenordet valideras inte — det är bara UI-scaffolding.
  // Identifier-fältet accepterar både Player Name OCH email. För Player
  // Name lagrar vi som-är. För email finns ingen backend-uppslagning av
  // motsvarande Player Name, så som mock härleder vi det från email-
  // prefixet (delen före '@'). Bannern måste alltid visa ett Player
  // Name, aldrig själva email-adressen.
  // TODO (auth): byt till riktigt auth-API som validerar Player Name/
  // email + password mot backend, returnerar session-token och hämtar
  // hela profilen (inkl. det riktiga Player Name som hör till email:en).
  // CodeKeyboard-handlers för Login:s PlayerName-split-field. Speglar
  // Register-formens handlers exakt — bara state-varianten skiljer.
  const handleLoginPlayerNameKeyPress = (char: string) => {
    setLoginPlayerName((prev) =>
      loginPlayerNameKbMode === 'letter'
        ? appendPlayerNameLetter(prev, char)
        : appendPlayerNameDigit(prev, char),
    );
  };
  const handleLoginPlayerNameBackspace = () => {
    setLoginPlayerName((prev) =>
      loginPlayerNameKbMode === 'letter'
        ? backspacePlayerNameLetters(prev)
        : backspacePlayerNameDigits(prev),
    );
  };
  const toggleLoginPlayerNameKbMode = () => {
    if (loginPlayerName.length === 0 && loginPlayerNameKbMode === 'letter') return;
    if (loginPlayerNameKbMode === 'letter') {
      setLoginPlayerNameKbMode('digit');
      loginPlayerNameDigitsRef.current?.focus();
    } else {
      setLoginPlayerNameKbMode('letter');
      loginPlayerNameLettersRef.current?.focus();
    }
  };

  const handleLogin = async () => {
    // Identifier depends on aktuell mode. PlayerName-läget normaliseras
    // (strippar trailing dash) så "Anna-" och "Anna" lookup:as identiskt.
    const identifierRaw = loginMode === 'playerName' ? loginPlayerName : loginEmail;
    const trimmed = identifierRaw.trim();
    if (!trimmed || !loginPassword.trim()) return;
    let identifierMethod: 'email' | 'player_name' = 'email';
    let userId: string;
    if (loginMode === 'playerName') {
      // Login-via-PlayerName görs helt server-side (Edge Function
      // 'login-by-name') så email:en aldrig returneras till klienten —
      // stänger email-enumereringsläckan (security review Nivå 1 punkt 1).
      const normalized = normalizePlayerName(trimmed);
      const result = await signInWithPlayerName(normalized, loginPassword);
      if (!result.ok) {
        // Generiskt fel för både "namnet finns inte" och "fel lösenord"
        // (function:n skiljer inte på dem — anti-enumerering).
        Alert.alert(
          'Login failed',
          'Invalid Player Name or password. Please check, or switch to Email mode and use the email you registered with.',
        );
        return;
      }
      userId = result.user.id;
      identifierMethod = 'player_name';
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password: loginPassword,
      });
      if (error || !data.user) {
        Alert.alert('Login failed', 'Invalid PlayerName/Email or password. Please check');
        return;
      }
      userId = data.user.id;
    }
    // Profilen läses nu från Supabase (eller backfillas från user_metadata
    // om profiles-raden saknas — pre-Fas-2-user). loadProfile sköter dual-
    // read internt.
    const profile = await loadProfile();
    if (profile) {
      setProfile(profile);
    }
    const traits: Record<string, string | number | boolean | null> = {};
    if (profile?.assistance) traits.assistance = profile.assistance;
    if (profile?.region) traits.region = profile.region;
    identify(userId, traits);
    track('user_logged_in', { method: identifierMethod });
    setProfileMenuVisible(false);
  };

  // Register öppnar ett formulär i samma menyn med samma fält som
  // Profile-skärmens setup (utom Room code som inte finns här).
  const handleRegister = () => {
    setProfileMenuStep('register');
  };

  // Forgot password: 2-stegs OTP-flow via Supabase.
  // Steg 1: user anger email → resetPasswordForEmail() skickar 6-siffrig
  //         kod via email-templaten (kräver att template:t inkluderar
  //         {{ .Token }} — se supabase/migrations/notes).
  // Steg 2: user matar in kod + nytt lösenord → verifyOtp + updateUser.
  const forgotEmailValid = REG_EMAIL_REGEX.test(forgotEmail.trim());
  // Supabase OTP-token är typiskt 6–8 siffror beroende på projekt-config.
  // Accept:erar hela spannet så vi inte bryter mot framtida förändringar.
  const forgotCodeValid = /^\d{6,8}$/.test(forgotCode);
  const forgotNewPasswordValid = forgotNewPassword.length >= 6 && forgotNewPassword.length <= 32;

  const handleSendRecoveryCode = async () => {
    if (!forgotEmailValid || forgotSending) return;
    const trimmed = forgotEmail.trim();
    setForgotSending(true);
    Keyboard.dismiss();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
    setForgotSending(false);
    if (error) {
      Alert.alert('Could not send code', error.message);
      return;
    }
    setForgotStep('code');
  };

  const handleResetPassword = async () => {
    if (!forgotCodeValid || !forgotNewPasswordValid || forgotSending) return;
    const trimmed = forgotEmail.trim();
    setForgotSending(true);
    Keyboard.dismiss();
    // verifyOtp med type:'recovery' valideras koden mot Supabase och
    // returnerar en session som ger oss rätt att updateUser.
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: trimmed,
      token: forgotCode,
      type: 'recovery',
    });
    if (verifyErr) {
      setForgotSending(false);
      Alert.alert('Invalid code', 'The code is incorrect or has expired. Request a new one.');
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: forgotNewPassword });
    setForgotSending(false);
    if (updateErr) {
      Alert.alert('Could not reset password', updateErr.message);
      return;
    }
    // Password uppdaterat — user är inloggad via recovery-sessionen.
    // Hämta profil och stäng modalen så HomeScreen renderar logged-in-läget.
    const profile = await loadProfile();
    if (profile) setProfile(profile);
    setProfileMenuVisible(false);
    Alert.alert('Password updated', 'You are now signed in with your new password.');
  };

  // ── Register-form: parsa year, gates, och submit ──────────────────
  const regParsedBirthYear = (() => {
    const n = parseInt(regBirthYearText, 10);
    if (isNaN(n) || n < MIN_BIRTH_YEAR || n > MAX_BIRTH_YEAR) return null;
    return n;
  })();
  const regEmailValid = REG_EMAIL_REGEX.test(regEmail.trim());
  // Password måste ha minst 6 tecken — i linje med NIST-baseline-policy så
  // användaren inte tvingas migrera från 1-2-tecken-lösenord när riktig
  // backend-validering kopplas in. Användaren måste även explicit trycka
  // Confirm för att låsa lösenordet och låsa upp nästa fält.
  const REG_PASSWORD_MIN_LENGTH = 6;
  const REG_PASSWORD_MAX_LENGTH = 32;
  const regPasswordValid = regPassword.length >= REG_PASSWORD_MIN_LENGTH;
  // Sekventiella gates: email → playerName → password → year → assistance → region.
  // Email måste nu Check:as (format + uniqueness) — inte bara ha giltigt format —
  // innan PlayerName låses upp.
  const regPlayerNameUnlocked = regEmailStatus === 'available';
  const regPasswordUnlocked = regPlayerNameUnlocked && regPlayerNameStatus === 'available';
  const regYearUnlocked = regPasswordUnlocked && regPasswordConfirmed;
  const regAssistanceUnlocked = regYearUnlocked && regParsedBirthYear !== null;
  // Assistance och Region är default-ifyllda, så region-låset följer assistance-låset.
  const regRegionUnlocked = regAssistanceUnlocked;
  const isRegisterFormValid =
    regEmailStatus === 'available' &&
    regPlayerNameStatus === 'available' &&
    regPasswordConfirmed &&
    regParsedBirthYear !== null;

  // Email: ändra text → status faller till 'idle' så användaren måste Check:a
  // igen efter varje redigering (samma mönster som PlayerName).
  const handleRegEmailChange = (t: string) => {
    setRegEmail(t);
    if (regEmailStatus !== 'idle') setRegEmailStatus('idle');
  };

  // Check-knapp på email: (1) format via REG_EMAIL_REGEX, (2) uniqueness via
  // email_exists-RPC. Fail-open till 'available' vid nätverksfel — Register-
  // submitens signUp är sista auktoriteten (samma som playerName-checken).
  const handleRegCheckEmail = async () => {
    const trimmed = regEmail.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    if (!REG_EMAIL_REGEX.test(trimmed)) {
      setRegEmailStatus('invalid');
      return;
    }
    setRegEmailStatus('checking');
    try {
      const exists = await emailExists(trimmed);
      setRegEmailStatus(exists ? 'taken' : 'available');
    } catch {
      setRegEmailStatus('available');
    }
  };

  const handleRegCheckPlayerName = async () => {
    const trimmed = regPlayerName.trim();
    if (!trimmed) return;
    // Auto-inserta dash om användaren bara typat letters innan Check —
    // dashen är "fixed" i format-spec:en.
    const normalized = normalizePlayerName(trimmed);
    if (normalized !== regPlayerName) setRegPlayerName(normalized);
    Keyboard.dismiss();
    setRegPlayerNameStatus('checking');
    // Snabb lokal validering (format + profanity + mock-blocklist).
    const localResult = validatePlayerName(normalized);
    if (localResult !== 'available') {
      setRegPlayerNameStatus(localResult);
      return;
    }
    // Riktigt uniqueness-check mot Supabase: om namnet finns → 'taken'.
    try {
      const exists = await playerNameExists(normalized);
      setRegPlayerNameStatus(exists ? 'taken' : 'available');
    } catch {
      // Vid nätverksfel: faller tillbaka på lokal validering (godkänd).
      setRegPlayerNameStatus('available');
    }
  };

  // Rensa namnet och låt användaren skriva eget. Status faller till 'idle'
  // så Password-låset stängs igen tills nytt namn validerats via Check.
  // Refokus → CodeKeyboard:n stannar uppe (custom keyboard pushar inte layout).
  const handleRegRemoveName = () => {
    setRegPlayerName('');
    setRegPlayerNameStatus('idle');
    setRegPlayerNameKbMode('letter');
    regPlayerNameLettersRef.current?.focus();
  };

  const applyRegGenerated = (generated: string) => {
    setRegPlayerName(generated);
    setRegPlayerNameStatus('available');
    Keyboard.dismiss();
  };

  // Auto-generera Player Name. Två branches:
  //   • Fältet tomt → generera direkt (ingen prefix → "Abcdefghi-1234567").
  //   • Användaren har redan typat letters → fråga "Try to keep PlayerName
  //     letters or not?". Yes-branchen bevarar letters; No regenererar allt.
  const handleRegGenerateName = () => {
    const trimmedLetters = getPlayerNameLetters(regPlayerName.trim());
    if (trimmedLetters.length > 0) {
      Alert.alert(
        'Auto-generate Player Name',
        'Try to keep PlayerName letters or not?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace all',
            onPress: () => applyRegGenerated(generatePlayerName(TAKEN_PLAYER_NAMES)),
          },
          {
            text: 'Keep letters',
            onPress: () => applyRegGenerated(generatePlayerName(TAKEN_PLAYER_NAMES, { keepLetters: trimmedLetters })),
          },
        ],
      );
      return;
    }
    applyRegGenerated(generatePlayerName(TAKEN_PLAYER_NAMES));
  };

  // CodeKeyboard skickar tecknet hit. Helpers upprätthåller format per
  // tangenttryck: letters först (max 10, första versal/resten gemener),
  // dash auto-insertas vid första digit-tryck, max 7 digits.
  const handleRegPlayerNameKeyPress = (char: string) => {
    setRegPlayerName((prev) =>
      regPlayerNameKbMode === 'letter'
        ? appendPlayerNameLetter(prev, char)
        : appendPlayerNameDigit(prev, char),
    );
    if (regPlayerNameStatus !== 'idle') setRegPlayerNameStatus('idle');
  };

  const handleRegPlayerNameBackspace = () => {
    setRegPlayerName((prev) =>
      regPlayerNameKbMode === 'letter'
        ? backspacePlayerNameLetters(prev)
        : backspacePlayerNameDigits(prev),
    );
    if (regPlayerNameStatus !== 'idle') setRegPlayerNameStatus('idle');
  };

  const toggleRegPlayerNameKbMode = () => {
    if (regPlayerName.length === 0 && regPlayerNameKbMode === 'letter') return;
    if (regPlayerNameKbMode === 'letter') {
      setRegPlayerNameKbMode('digit');
      regPlayerNameDigitsRef.current?.focus();
    } else {
      setRegPlayerNameKbMode('letter');
      regPlayerNameLettersRef.current?.focus();
    }
  };

  // Player Name auto-fyll borttagen — användaren ska aktivt välja namn
  // (typa eller trycka Auto-generate). Fältet startar tomt vid open och
  // resets återgår alltid till tom enligt step/visible-effekterna ovan.

  // Password — användaren måste explicit Confirm:a innan year låses upp.
  // Om de ändrar password efteråt återställs confirmed-state.
  const handleRegPasswordChange = (t: string) => {
    setRegPassword(t);
    if (regPasswordConfirmed) setRegPasswordConfirmed(false);
  };

  const handleRegConfirmPassword = () => {
    if (!regPasswordValid) return;
    Keyboard.dismiss();
    setRegPasswordConfirmed(true);
  };

  // När registreringen är klar — spara komplett profil + logga in.
  // TODO (auth): trigga riktig aktiveringsmail via backend istället för
  // mock-alerten nedan. Profilen bör då markeras som "pending verification"
  // tills användaren klickat på länken.
  const handleRegisterSubmit = async () => {
    if (!isRegisterFormValid || regParsedBirthYear === null) return;
    const trimmedEmail = regEmail.trim();
    const normalizedPlayerName = normalizePlayerName(regPlayerName.trim());
    // Fas 1 — Supabase auth (email + password). Profil-fält (playerName,
    // birthYear, assistance, region) skickas som user_metadata så de
    // sparas server-side direkt, men AsyncStorage-profilen behålls som
    // local cache så övriga skärmar fungerar oförändrat tills Fas 2 byter
    // dem mot Supabase profiles-tabellen.
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: regPassword,
      options: {
        data: {
          playerName: normalizedPlayerName,
          birthYear: regParsedBirthYear,
          assistance: regAssistance,
          region: regRegion,
        },
      },
    });
    if (error) {
      Alert.alert('Registration failed', error.message);
      return;
    }
    if (!data.user) {
      Alert.alert('Registration failed', 'Could not create account. Please try again.');
      return;
    }
    // Beräkna default game era: från starten av spelarens generation till
    // slutet av generation+2 (A=1950-64, B=1965-80, C=1981-96, D=1997-2012, E=2013-2026).
    const _regCurrentYear = new Date().getFullYear();
    const _genEndYears = [1964, 1980, 1996, 2012, _regCurrentYear];
    const _genIdx = regParsedBirthYear <= 1964 ? 0 : regParsedBirthYear <= 1980 ? 1 : regParsedBirthYear <= 1996 ? 2 : regParsedBirthYear <= 2012 ? 3 : 4;
    const _defaultEraTo = _genEndYears[Math.min(_genIdx + 2, 4)];
    const newProfile: ProfileData = {
      playerName: normalizedPlayerName,
      email: trimmedEmail,
      birthYear: regParsedBirthYear,
      assistance: regAssistance,
      region: regRegion,
      avatarSource: 'default',
      selectedAvatarId: '',
      gameEraFrom: regParsedBirthYear,
      gameEraTo: _defaultEraTo,
      gameMode: 'pass-the-phone',
      singlePlayerDefault: false,
    };
    await saveProfile(newProfile);
    // Ett nyregistrerat konto har per definition ingen prenumeration. Den
    // lokala premium-spegeln är per ENHET, så utan denna rensning ärvde det
    // nya kontot ett tidigare kontos `true` och visade "Unlimited" i
    // credits-pillen i stället för "Free: 4" (Peter 2026-08-13).
    // Självläkande: har Apple-ID:t en giltig prenumeration sätter
    // RevenueCats customer-info-listener i app/_layout.tsx tillbaka den
    // direkt efter att SIGNED_IN kopplat RC till den nya user-id:n.
    // (Kampanjens gratismånad hanteras separat — den är ägarstämplad, se
    // promoPremium.CLAIM_KEY.)
    await clearPremiumSubscription();
    setProfile(newProfile);
    identify(data.user.id, { assistance: regAssistance, region: regRegion });
    track('user_registered', { assistance: regAssistance, region: regRegion });
    setProfileMenuVisible(false);
  };

  // Bekräftar och loggar ut. Rensar Supabase-sessionen + AsyncStorage-cachen.
  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      'Your profile will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              // Forsätt med lokal cleanup ändå — session kan ha gått ut server-side
              // utan att klienten vet. Logga för diagnostik.
              console.warn('supabase signOut error:', error.message);
            }
            await clearProfile();
            setProfile(null);
            track('user_logged_out');
            resetIdentity();
            setProfileMenuVisible(false);
          },
        },
      ],
    );
  };

  const appNameFont = fontsLoaded ? 'Nunito_700Bold' : undefined;
  const taglineFont = fontsLoaded ? 'Nunito_400Regular' : undefined;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top board (login status) ─────────────────────────── */}
      {/* Döljs helt när utloggad — "Register or Login"-pillen var redundant
          mot den gröna Register or Login-knappen i actions-sektionen som är
          primär CTA för utloggade. Visas när profil finns (login-pill med
          avatar + PlayerName → profil-menyn). */}
      {isLoggedIn && (
        <TopUserBanner profile={profile} onPress={() => setProfileMenuVisible(true)} />
      )}

      <ScrollView
        style={styles.containerScroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Brand ──────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <QuizVibeLogo size={SCREEN_HEIGHT < 600 ? 100 : 140} />
          <Text style={[styles.appName, { fontFamily: appNameFont }]}>
            QuizVibe
          </Text>
          {/* Cross-fade tagline-wrap. Första texten i flow definierar
              höjden; index 1+ är absolut-positionerade ovanpå och fadar
              i/ur via egna taglineOpacities[i]. `alignSelf: stretch` så
              wrappen tar full brandSection-bredd och texterna kan
              centreras via textAlign utan att kämpa om intrinsisk
              bredd. Alla TAGLINES måste passa på en rad i samma
              fontSize/lineHeight för att höjden ska kännas stabil. */}
          <View style={styles.taglineWrap}>
            {TAGLINES.map((text, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.tagline,
                  styles.taglineCentered,
                  i > 0 && styles.taglineOverlay,
                  { fontFamily: taglineFont, opacity: taglineOpacities[i] },
                ]}
              >
                {text}
              </Animated.Text>
            ))}
          </View>
        </View>

        {/* ── Primary actions ───────────────────────────────── */}
        {/* Knappordning (uppifrån):
              1. Register or Login (bara när utloggad — pulse:ar som primär CTA,
                 grön kantlinje)
              2. Create Game (bara när inloggad)
              3. Join with Room Code — user (bara när inloggad)
              4. Guest-rutan + Join with Room Code — guest + Start Game as Guest
            Pulse följer "primär åtgärd för aktuellt login-state":
              - utloggad → Register or Login + båda guest-knapparna pulserar
              - inloggad → Create + Join (registered) pulserar */}
        <View style={styles.actionsSection}>
          {/* Register or Login — bara när utloggad. Primär CTA → leder till
              profile-menyn. Grön kantlinje särskiljer den från de blå
              guest-knapparna. "QuizVibe user"-rubriken ovanför speglar
              Guest-rubrikens ruta men i grönt (matchar knappens kantlinje). */}
          {!isLoggedIn && hostTypeExpanded === 'none' && (
            <>
              {/* appNameFont (Nunito_700Bold) — en explicit fontFamily
                  override:ar fontWeight på iOS, så bold kräver bold-filen
                  (taglineFont = 400Regular renderade rubriken tunn). */}
              {/* Rubrik + info-ikon på samma rad. Ikonen öppnar
                  jämförelsen user vs guest (USER_VS_GUEST_ROWS). Samma
                  ikon sitter på Guest-rubriken nedan och öppnar samma
                  modal — skillnaden ska kunna läsas från båda hållen. */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.userSectionHeader, { fontFamily: appNameFont }]}>
                  QuizVibe user
                </Text>
                <Pressable
                  onPress={() => setCompareInfoVisible(true)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="What is included as a QuizVibe user compared to Guest"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <Animated.View style={{ transform: [{ scale: pulse }] }}>
                <TouchableOpacity
                  style={[styles.gameBtn, styles.gameBtnRegister]}
                  activeOpacity={0.85}
                  onPress={() => setProfileMenuVisible(true)}
                >
                  <Text
                    style={[
                      styles.gameBtnText,
                      { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Register or Login
                  </Text>
                  {/* FREE-badge — vit kantlinje så den syns mot knappens
                      gröna bakgrund. */}
                  <View
                    style={[styles.homeFreeBadge, styles.homeFreeBadgeRegister]}
                    pointerEvents="none"
                  >
                    <Text style={styles.homeFreeBadgeText}>FREE</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}

          {/* Create Game — döljs helt när utloggad (tidigare 🔒-låst variant).
              Gold-tema för inloggade users (samma vokabulär som appens
              gold-CTA:er — Start Game-loggan, PREMIUM-badges). */}
          {isLoggedIn && hostTypeExpanded !== 'guest' && (
            <View>
              {/* Pulsen ligger BARA på knappen — den utfällda panelen ska
                  stå still. Tap togglar utfällningen av lobbytyp-valen.
                  Övriga Home-knappar döljs medan panelen är utfälld så
                  valet står ensamt (Peter 2026-08-07). */}
              <Animated.View style={{ transform: [{ scale: hostTypeExpanded === 'registered' ? 1 : pulse }] }}>
                <TouchableOpacity
                  style={[styles.gameBtn, styles.gameBtnUser]}
                  activeOpacity={0.85}
                  onPress={() => {
                    // Collapse behöver ingen check. Vid expand körs credit-
                    // gaten FÖRST så "Out of Host Game Credits" visas direkt
                    // på knappen istället för efter Local/Remote-valet.
                    if (hostTypeExpanded === 'registered') {
                      setHostTypeExpanded('none');
                      return;
                    }
                    void checkHostCredits().then((credits) => {
                      if (credits) setHostTypeExpanded('registered');
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.gameBtnText,
                      styles.gameBtnUserText,
                      { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                    ]}
                  >
                    Start New Game
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              {hostTypeExpanded === 'registered' && (
                <HostTypeOptions
                  accentColor={Colors.warning}
                  onSelect={(lobbyType) => {
                    setHostTypeExpanded('none');
                    void handleCreateGame(lobbyType);
                  }}
                />
              )}
            </View>
          )}

          {/* Join with Room Code — user — döljs helt när utloggad ELLER när
              någon lobbytyp-utfällning är aktiv. */}
          {isLoggedIn && hostTypeExpanded === 'none' && (
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                style={[styles.gameBtn, styles.gameBtnUser]}
                activeOpacity={0.85}
                onPress={() => openJoin('choose', { hideGuest: true })}
              >
                <Text
                  style={[
                    styles.gameBtnText,
                    styles.gameBtnUserText,
                    { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Join with Room Code
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Remote Play History — inloggat läge: grupperas med de gyllene user-
              knapparna ovanför (naturlig actionsSection-gap, ingen extra
              marginTop) så den hamnar OVANFÖR guest-rubriken nedan.
              Utloggade guests får den kvar sist på skärmen (se blocket
              efter actionsSection). Renderar sig själv bara när användaren
              har minst en 1vs1-match — annars null. */}
          {isLoggedIn && hostTypeExpanded === 'none' && <MyMatchesSection />}

          {/* Guest-sektionen (rubrik + två knappar) — döljs HELT när
              inloggad (registered users använder Join with Room Code —
              user) ELLER när en lobbytyp-utfällning är aktiv. Knapparna
              döljs visuellt när Join-modalen är öppen så att modal-sheetens
              rundade ovankant inte avslöjar dem bakom; layout-utrymmet
              bevaras med opacity/pointerEvents så övriga element inte hoppar. */}
          {!isLoggedIn && hostTypeExpanded === 'none' && (
            <>
              {/* Guest-rubrik i grå text — separerar guest-pathen från
                  registered-åtgärderna ovan. */}
              {/* appNameFont av samma skäl som QuizVibe user-rubriken ovan.
                  Sektions-marginalen (guestSectionHeader.marginTop) flyttas
                  till radwrappern så rubrik + ikon centreras som en enhet. */}
              <View style={[styles.sectionHeaderRow, { marginTop: Spacing.xl }]}>
                <Text
                  style={[styles.guestSectionHeader, { fontFamily: appNameFont, marginTop: 0 }]}
                >
                  Guest login / Non-registered
                </Text>
                <Pressable
                  onPress={() => setCompareInfoVisible(true)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="What is included as a Guest compared to a QuizVibe user"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>

              {/* Join with Room Code — guest. Pulserar (primär spel-path
                  för guests). */}
              <Animated.View
                style={[
                  joinVisible && { opacity: 0 },
                  { transform: [{ scale: pulse }] },
                ]}
                pointerEvents={joinVisible ? 'none' : 'auto'}
              >
                <TouchableOpacity
                  style={[styles.gameBtn, styles.gameBtnGuest]}
                  activeOpacity={0.85}
                  onPress={() => openJoin('guest')}
                >
                  <Text
                    style={[
                      styles.gameBtnText,
                      { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    Join with Room Code
                  </Text>
                  <View style={styles.homeFreeBadge} pointerEvents="none">
                    <Text style={styles.homeFreeBadgeText}>FREE</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}

          {/* Start New Game (guest-host) — synlig i BÅDA login-lägena (inloggade
              spelare ska också kunna hosta som guest). Pulserar alltid.
              Badge: "No Data Saved" inloggad / FREE utloggad.
              Öppnar guest-HOST-formen
              (begränsad registrering → lobby som host). Inloggad: extra
              marginTop (Spacing.xl, samma sektions-separation som guest-
              rubriken i utloggat läge) så knappen distanseras från de
              gyllene user-knapparna ovanför — trial-vägen är sekundär. */}
          {/* Döljs helt när "Start New Game"-utfällningen är aktiv (valet
              ska stå ensamt). */}
          {hostTypeExpanded !== 'registered' && (
          <View
            style={[
              joinVisible && { opacity: 0 },
              isLoggedIn && hostTypeExpanded === 'none' && { marginTop: Spacing.xl },
            ]}
            pointerEvents={joinVisible ? 'none' : 'auto'}
          >
            {/* Inloggat läge saknar guest-sektionens rubrik ovanför (den
                renderas bara i !isLoggedIn-blocket) — utan den skulle en
                ensam "Start Game"-knapp vara tvetydig intill de gyllene
                user-knapparna. Rendera samma grå rubrik här. marginTop 0
                eftersom wrappern redan bär sektions-separationen (xl);
                marginBottom matchar actionsSection:s gap så rytmen blir
                identisk med utloggat läge. */}
            {isLoggedIn && hostTypeExpanded === 'none' && (
              // Fold-header — bara inloggade users har något att fälla ihop
              // (utloggade guests ser rubriken ovan, utan toggle, som förut).
              // Toggle-boxen ("+"/"−") ligger FÖRST i raden så den hamnar
              // längst till vänster på skärmen (Peter 2026-08-27), speglar
              // Profile-skärmens kollapsbara sektioner men med rubriken
              // vänsterjusterad istället för centrerad.
              <View style={[styles.guestFoldHeaderRow, { marginBottom: Spacing.md }]}>
                <Pressable
                  onPress={() => setGuestSectionExpanded((prev) => !prev)}
                  style={({ pressed }) => [styles.guestFoldToggleRow, pressed && { opacity: 0.7 }]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={guestSectionExpanded ? 'Collapse guest options' : 'Expand guest options'}
                >
                  <View style={styles.guestFoldToggleBox}>
                    <Text style={styles.guestFoldToggleText}>
                      {guestSectionExpanded ? '−' : '+'}
                    </Text>
                  </View>
                  <Text
                    style={[styles.guestSectionHeader, { fontFamily: appNameFont, marginTop: 0 }]}
                  >
                    Guest login / Non-registered
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCompareInfoVisible(true)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityLabel="What is included as a Guest compared to a QuizVibe user"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
            )}
            {(!isLoggedIn || guestSectionExpanded) && (
              <>
                {/* Pulsen ligger BARA på knappen — utfälld panel står still. */}
                <Animated.View
                  style={{ transform: [{ scale: hostTypeExpanded === 'guest' ? 1 : pulse }] }}
                >
                  <TouchableOpacity
                    style={[styles.gameBtn, styles.gameBtnGuest]}
                    activeOpacity={0.85}
                    onPress={() =>
                      setHostTypeExpanded((prev) => (prev === 'guest' ? 'none' : 'guest'))
                    }
                  >
                    <Text
                      style={[
                        styles.gameBtnText,
                        { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      Start New Game
                    </Text>
                    {/* Badge per login-läge: inloggad → "No Data Saved"
                        i grått (samma homeUserBadge-stil som user-knapparna);
                        utloggad → FREE i grönt (matchar övriga guest-/register-
                        knappar).

                        Göms när utfällningen är öppen: då bär Local Play/Remote
                        Play sina egna badges och en badge på föräldern blir
                        dubbelinformation. */}
                    {hostTypeExpanded !== 'guest' && (
                    <View
                      style={[styles.homeFreeBadge, isLoggedIn && styles.homeUserBadge]}
                      pointerEvents="none"
                    >
                      <Text style={styles.homeFreeBadgeText}>
                        {isLoggedIn ? 'No Data Saved' : 'FREE'}
                      </Text>
                    </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
                {hostTypeExpanded === 'guest' && (
                  <HostTypeOptions
                    accentColor="#6B7280"
                    remoteMode={isLoggedIn ? 'hidden' : 'locked'}
                    onRemoteLockedPress={() => handleRemoteAccountRequired('host')}
                    localBadge={
                      isLoggedIn
                        ? { text: 'No Data Saved', muted: true }
                        : { text: 'FREE' }
                    }
                    onSelect={(lobbyType) => {
                      setHostTypeExpanded('none');
                      setGuestLobbyType(lobbyType);
                      openJoin('guest-host');
                    }}
                  />
                )}
              </>
            )}
          </View>
          )}
        </View>

        {/* ── Remote Play History (utloggad/guest) ──────────────
            Huvudknapp för Remote 1v1-dueller — navigerar till den
            dedikerade /my-matches-skärmen där matcherna listas. Renderar
            sig själv bara när användaren har matcher — annars null.
            Blinkande "New update" + guld-pil när något ändrats.
            Inloggade får den högre upp (inuti actionsSection, ovanför
            guest-rubriken); här ligger guest-varianten kvar sist.
            Döljs (som övriga Home-knappar) medan en lobbytyp-utfällning
            är aktiv så valet står ensamt. */}
        {!isLoggedIn && hostTypeExpanded === 'none' && (
          <View style={{ marginTop: Spacing.xl }}>
            <MyMatchesSection />
          </View>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        {/* "FAQ" är tappbar Pressable som öppnar /faq?from=/. About- och
            ·-texterna är fortsatt plain Text (placeholder för framtida
            About-skärm). Tappbar styling: aktiv färg (textPrimary) +
            underline så det syns att raden är en länk även för logged-out
            users som är skärmens primära FAQ-målgrupp. */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontFamily: taglineFont }]}>About QuizVibe</Text>
          <Text style={[styles.footerDot, { fontFamily: taglineFont }]}>·</Text>
          <Pressable
            onPress={() => router.push('/faq?from=/')}
            hitSlop={8}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.footerText,
                  styles.footerLink,
                  { fontFamily: taglineFont },
                  pressed && { opacity: 0.6 },
                ]}
              >
                FAQ
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <JoinModal
        visible={joinVisible}
        onClose={() => {
          setJoinVisible(false);
          // Nollställ lobbytypen när guest-host-formen stängs — annars
          // lever ett tidigare '1v1'-val kvar i sessions-state och kan
          // följa med in i ett senare guest-host-flöde.
          setGuestLobbyType('multiplayer');
          // Draften är förbrukad när formen väl öppnats med den; utan detta
          // skulle ett senare, orelaterat Join-as-Guest återuppliva gamla
          // fält.
          setGuestJoinDraft(null);
        }}
        initialStep={joinInitialStep}
        hideGuest={joinHideGuest}
        currentPlayerName={profile?.playerName ?? null}
        guestHostLobbyType={guestLobbyType}
        onRemoteAccountRequired={handleRemoteAccountRequired}
        initialGuestDraft={guestJoinDraft}
      />

      {/* Lobbytyp-väljaren är INLINE under respektive Start-knapp
          (HostTypeOptions) — ingen separat modal. */}

      {/* ── Profile-meny ─────────────────────────────────────── */}
      {/* När utloggad: Register / Log in. När inloggad: Log out.
          Login-steget visar playerName + password-form. */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <KeyboardAvoidingView
          style={profileMenu.overlay}
          // behavior="padding" lägger till padding-bottom = tangentbordet:s
          // höjd när det öppnas. Sheet:en pushas upp så bottom-knapparna
          // hålls ovanför tangentbordet. Password-fältet scrollas separat
          // till syn via Keyboard.addListener-eventet (se useEffect nedan).
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={profileMenu.backdrop}
            activeOpacity={1}
            onPress={() => setProfileMenuVisible(false)}
          />
          <View style={profileMenu.sheet}>
            {/* ── Inloggad: header + Log out ────────────── */}
            {isLoggedIn && profileMenuStep === 'menu' && (
              <>
                <View style={profileMenu.header}>
                  {profile?.selectedAvatarId ? (
                    <Text style={profileMenu.headerEmoji}>
                      {getAvatarEmojiById(profile?.selectedAvatarId)}
                    </Text>
                  ) : (
                    <View style={profileMenu.headerBrandWrap}>
                      <QuizVibeQAvatar size={32} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={profileMenu.headerName}>
                      {profile?.playerName?.trim() || 'Signed in'}
                    </Text>
                    <Text style={profileMenu.headerStatus}>
                      {profile?.email?.trim() || 'Logged in'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={profileMenu.secondaryBtn}
                  onPress={() => {
                    setProfileMenuVisible(false);
                    // scrollToTop=1 så Profile:s useFocusEffect snäpper
                    // ScrollView:n till toppen — tab-navigatorn bevarar
                    // annars senaste scroll-position mellan tab-byten.
                    router.push({
                      pathname: '/profile',
                      params: { scrollToTop: '1' },
                    });
                  }}
                >
                  <View style={profileMenu.secondaryBtnInner}>
                    <QuizVibeQAvatar size={26} />
                    <Text style={profileMenu.secondaryBtnText}>Profile settings</Text>
                  </View>
                </TouchableOpacity>

                {/* Store-genväg — utan focus-param följer Store sin default-
                    ordning (Basic → Credits → Packages → Subscriptions),
                    samma som direkt tab-tryck på Store. `from=/` så Store:s
                    Back-knapp tar användaren tillbaka till Home. */}
                <TouchableOpacity
                  style={profileMenu.secondaryBtn}
                  onPress={() => {
                    setProfileMenuVisible(false);
                    router.push('/store?from=/');
                  }}
                >
                  <View style={profileMenu.secondaryBtnInner}>
                    <ShoppingCartIcon size={22} />
                    <Text style={profileMenu.secondaryBtnText}>Store</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={profileMenu.logoutBtn} onPress={handleLogout}>
                  <Text style={profileMenu.logoutText}>Log out</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Utloggad: Register / Log in ──────────── */}
            {!isLoggedIn && profileMenuStep === 'menu' && (
              <>
                <Text style={profileMenu.title}>Welcome to QuizVibe</Text>
                {/* Kontextuell subtitel: Remote 1vs1-gaterna skickar in en
                    förklaring via authNotice (de visar ingen Alert, så detta
                    är enda stället spelaren får veta varför de hamnade här).
                    Annars default-texten. */}
                <Text style={profileMenu.subtitle}>
                  {authNotice ?? 'Sign in to create and join games'}
                </Text>

                <View style={profileMenu.btnWithBadge}>
                  <TouchableOpacity
                    style={[profileMenu.secondaryBtn, profileMenu.secondaryBtnFree]}
                    onPress={handleRegister}
                  >
                    <Text style={profileMenu.secondaryBtnText}>Register</Text>
                  </TouchableOpacity>
                  {/* FREE-badge som skär kantlinjen — samma teknik som
                      HOST/GUEST-badges på spelarkorten i Lobbyn. */}
                  <View style={profileMenu.freeBadge} pointerEvents="none">
                    <Text style={profileMenu.freeBadgeText}>FREE</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={profileMenu.secondaryBtn}
                  onPress={() => setProfileMenuStep('login')}
                >
                  <Text style={profileMenu.secondaryBtnText}>Log in</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Login-form ───────────────────────────── */}
            {!isLoggedIn && profileMenuStep === 'login' && (
              <>
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('menu')}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={profileMenu.title}>Log in</Text>
                <Text style={profileMenu.subtitle}>Choose login method</Text>

                {/* Mode-toggle: PlayerName (split-field) vs Email (single field).
                    Speglar Lobby:s Game Mode-toggle visuellt — aktiv ruta får
                    primärblå border, inaktiv är dämpad. */}
                <View style={profileMenu.loginModeRow}>
                  <TouchableOpacity
                    style={[
                      profileMenu.loginModeBtn,
                      loginMode === 'playerName' && profileMenu.loginModeBtnActive,
                    ]}
                    onPress={() => {
                      setLoginMode('playerName');
                      setLoginPlayerNameFocused(false);
                    }}
                  >
                    <Text
                      style={[
                        profileMenu.loginModeText,
                        loginMode === 'playerName' && profileMenu.loginModeTextActive,
                      ]}
                    >
                      Player Name
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      profileMenu.loginModeBtn,
                      loginMode === 'email' && profileMenu.loginModeBtnActive,
                    ]}
                    onPress={() => {
                      setLoginMode('email');
                      setLoginPlayerNameFocused(false);
                    }}
                  >
                    <Text
                      style={[
                        profileMenu.loginModeText,
                        loginMode === 'email' && profileMenu.loginModeTextActive,
                      ]}
                    >
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>

                {loginMode === 'playerName' ? (
                  <View style={modal.fieldGroup}>
                    <Text style={modal.fieldLabel}>Player Name - Letter-digit format</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        ref={loginPlayerNameLettersRef}
                        style={[
                          modal.inputText,
                          modal.playerNameLettersInput,
                          loginPlayerNameKbMode === 'letter' && modal.playerNameInputActive,
                        ]}
                        placeholder="Anna"
                        placeholderTextColor={Colors.textDisabled}
                        value={getPlayerNameLetters(loginPlayerName)}
                        maxLength={PLAYER_NAME_MAX_LETTERS}
                        showSoftInputOnFocus={false}
                        selection={{
                          start: getPlayerNameLetters(loginPlayerName).length,
                          end: getPlayerNameLetters(loginPlayerName).length,
                        }}
                        selectTextOnFocus={false}
                        contextMenuHidden={true}
                        onFocus={() => {
                          setLoginPlayerNameKbMode('letter');
                          setLoginPlayerNameFocused(true);
                        }}
                        onBlur={() => setLoginPlayerNameFocused(false)}
                      />
                      <Text style={modal.playerNameSeparator}>–</Text>
                      <TextInput
                        ref={loginPlayerNameDigitsRef}
                        style={[
                          modal.inputText,
                          modal.playerNameDigitsInput,
                          loginPlayerNameKbMode === 'digit' && modal.playerNameInputActive,
                          getPlayerNameLetters(loginPlayerName).length === 0 && modal.playerNameInputDisabled,
                        ]}
                        placeholder="1234"
                        placeholderTextColor={Colors.textDisabled}
                        value={getPlayerNameDigits(loginPlayerName)}
                        maxLength={PLAYER_NAME_MAX_DIGITS}
                        editable={getPlayerNameLetters(loginPlayerName).length > 0}
                        showSoftInputOnFocus={false}
                        selection={{
                          start: getPlayerNameDigits(loginPlayerName).length,
                          end: getPlayerNameDigits(loginPlayerName).length,
                        }}
                        selectTextOnFocus={false}
                        contextMenuHidden={true}
                        onFocus={() => {
                          if (getPlayerNameLetters(loginPlayerName).length === 0) {
                            loginPlayerNameLettersRef.current?.focus();
                            return;
                          }
                          setLoginPlayerNameKbMode('digit');
                          setLoginPlayerNameFocused(true);
                        }}
                        onBlur={() => setLoginPlayerNameFocused(false)}
                      />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      profileMenu.input,
                      !loginEmail.trim() && profileMenu.inputActive,
                    ]}
                    placeholder="Email"
                    placeholderTextColor={Colors.textDisabled}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                )}

                {(() => {
                  const identifier = (loginMode === 'playerName' ? loginPlayerName : loginEmail).trim();
                  const pwUnlocked = identifier.length > 0;
                  return (
                    <View
                      pointerEvents={pwUnlocked ? 'auto' : 'none'}
                      style={!pwUnlocked && { opacity: 0.4 }}
                    >
                      <TextInput
                        style={[
                          profileMenu.input,
                          pwUnlocked && !loginPassword.trim() && profileMenu.inputActive,
                        ]}
                        placeholder="Password"
                        placeholderTextColor={Colors.textDisabled}
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                    </View>
                  );
                })()}

                {/* Forgot-länk — leder till recovery-flow via email */}
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('forgot')}
                  style={profileMenu.forgotLinkWrap}
                  hitSlop={6}
                >
                  <Text style={profileMenu.forgotLinkText}>
                    Forgot your Player Name or password?
                  </Text>
                </TouchableOpacity>

                {(() => {
                  const identifier = (loginMode === 'playerName' ? loginPlayerName : loginEmail).trim();
                  const canSubmit = identifier.length > 0 && loginPassword.trim().length > 0;
                  return (
                    <TouchableOpacity
                      style={[
                        profileMenu.primaryBtn,
                        !canSubmit && profileMenu.primaryBtnDisabled,
                      ]}
                      onPress={handleLogin}
                      disabled={!canSubmit}
                    >
                      <Text style={profileMenu.primaryBtnText}>Log in</Text>
                    </TouchableOpacity>
                  );
                })()}

                {loginPlayerNameFocused && loginMode === 'playerName' && (
                  <CodeKeyboard
                    mode={loginPlayerNameKbMode}
                    letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    onPress={handleLoginPlayerNameKeyPress}
                    onBackspace={handleLoginPlayerNameBackspace}
                    onModeToggle={toggleLoginPlayerNameKbMode}
                    modeToggleDisabled={loginPlayerNameKbMode === 'letter' && loginPlayerName.length === 0}
                  />
                )}
              </>
            )}

            {/* ── Forgot password — 2-stegs OTP-flow ────────── */}
            {!isLoggedIn && profileMenuStep === 'forgot' && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    if (forgotStep === 'code') {
                      setForgotStep('email');
                    } else {
                      setProfileMenuStep('login');
                    }
                  }}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                {forgotStep === 'email' ? (
                  <>
                    <Text style={profileMenu.title}>Reset password</Text>
                    <Text style={profileMenu.subtitle}>
                      Enter the email you registered with. We&apos;ll send you a verification code.
                    </Text>

                    <TextInput
                      style={[
                        profileMenu.input,
                        !forgotEmailValid && profileMenu.inputActive,
                      ]}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.textDisabled}
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={60}
                      returnKeyType="send"
                      onSubmitEditing={handleSendRecoveryCode}
                    />

                    <TouchableOpacity
                      style={[
                        profileMenu.primaryBtn,
                        (!forgotEmailValid || forgotSending) && profileMenu.primaryBtnDisabled,
                      ]}
                      onPress={handleSendRecoveryCode}
                      disabled={!forgotEmailValid || forgotSending}
                    >
                      <Text style={profileMenu.primaryBtnText}>
                        {forgotSending ? 'Sending…' : 'Send code'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={profileMenu.title}>Enter code</Text>
                    <Text style={profileMenu.subtitle}>
                      We sent a verification code to {forgotEmail.trim()}. Enter it below
                      along with your new password.
                    </Text>

                    <TextInput
                      style={[
                        profileMenu.input,
                        !forgotCodeValid && profileMenu.inputActive,
                      ]}
                      placeholder="Verification code"
                      placeholderTextColor={Colors.textDisabled}
                      value={forgotCode}
                      onChangeText={(t) => setForgotCode(t.replace(/\D/g, '').slice(0, 8))}
                      keyboardType="number-pad"
                      maxLength={8}
                      returnKeyType="next"
                    />

                    <View
                      pointerEvents={forgotCodeValid ? 'auto' : 'none'}
                      style={!forgotCodeValid && { opacity: 0.4 }}
                    >
                      <TextInput
                        style={[
                          profileMenu.input,
                          forgotCodeValid && !forgotNewPasswordValid && profileMenu.inputActive,
                        ]}
                        placeholder="New password (min 6 chars)"
                        placeholderTextColor={Colors.textDisabled}
                        value={forgotNewPassword}
                        onChangeText={setForgotNewPassword}
                        secureTextEntry
                        maxLength={32}
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
                      />
                    </View>

                    <TouchableOpacity
                      style={[
                        profileMenu.primaryBtn,
                        (!forgotCodeValid || !forgotNewPasswordValid || forgotSending) &&
                          profileMenu.primaryBtnDisabled,
                      ]}
                      onPress={handleResetPassword}
                      disabled={!forgotCodeValid || !forgotNewPasswordValid || forgotSending}
                    >
                      <Text style={profileMenu.primaryBtnText}>
                        {forgotSending ? 'Resetting…' : 'Reset password'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSendRecoveryCode}
                      style={profileMenu.forgotLinkWrap}
                      hitSlop={6}
                      disabled={forgotSending}
                    >
                      <Text style={profileMenu.forgotLinkText}>
                        Didn&apos;t get the code? Send again
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* ── Register-form ──────────────────────────── */}
            {!isLoggedIn && profileMenuStep === 'register' && (
              <>
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('menu')}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                {/* På korta skärmar göms titel + subtitel medan PlayerName:s
                    custom CodeKeyboard är uppe, så fältet ryms ovanför det. */}
                {!(SCREEN_HEIGHT < 700 && regPlayerNameFocused) && (
                  <>
                    <Text style={profileMenu.title}>Register</Text>
                    <Text style={profileMenu.subtitle}>Set up your profile to start playing</Text>
                  </>
                )}

                <ScrollView
                  ref={regScrollRef}
                  // "always" istället för "handled" — säkerställer att
                  // Confirm/Check-knapparna definitivt får sin onPress
                  // när tangentbordet är uppe. "handled" hade en edge-case
                  // där tap blev konsumerat av keyboard-dismiss istället för
                  // knappen.
                  keyboardShouldPersistTaps="always"
                  // automaticallyAdjustKeyboardInsets borttaget — den auto-
                  // scrollade fokuserade fältet UNDER keyboardet (med inset)
                  // samtidigt som vi manuellt scrollar via Keyboard-listener,
                  // så de slogs och resultatet blev att Password klipptes bort.
                  // flexShrink: 1 låter ScrollView:n krympa när PlayerName:s
                  // custom CodeKeyboard tar plats nedanför; maxHeight 320 är
                  // tak när keyboardet inte är uppe.
                  style={{ flexShrink: 1, maxHeight: SCREEN_HEIGHT < 600 ? 200 : 320 }}
                  contentContainerStyle={{ gap: Spacing.md }}
                >
                  {/* Email — först ut. Måste Check:as (format + "finns redan?")
                      innan PlayerName låses upp. Aktiveringslänk skickas hit
                      efter Register. */}
                  <View style={modal.fieldGroup}>
                    <Text style={modal.fieldLabel}>Email</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        style={[
                          modal.inputText,
                          modal.playerNameInput,
                          // Highlight medan email är aktivt steg (ej Check:ad än)
                          regEmailStatus !== 'available' && modal.playerNameInputActive,
                        ]}
                        placeholder="you@example.com"
                        placeholderTextColor={Colors.textDisabled}
                        value={regEmail}
                        onChangeText={handleRegEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={60}
                        editable={regEmailStatus !== 'checking'}
                        returnKeyType="next"
                        onSubmitEditing={handleRegCheckEmail}
                      />
                      <TouchableOpacity
                        onPress={handleRegCheckEmail}
                        disabled={!regEmailValid || regEmailStatus === 'checking' || regEmailStatus === 'available'}
                        style={[
                          modal.checkBtn,
                          (!regEmailValid || regEmailStatus === 'checking') && modal.checkBtnDisabled,
                          regEmailStatus === 'available' && modal.checkBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            modal.checkBtnText,
                            regEmailStatus === 'available' && modal.checkBtnTextDone,
                          ]}
                        >
                          {regEmailStatus === 'checking' ? '…'
                            : regEmailStatus === 'available' ? '✓'
                            : 'Check'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {regEmailStatus === 'idle' && (
                      <Text style={modal.statusHint}>
                        We&apos;ll send an activation link here to verify your address.
                      </Text>
                    )}
                    {regEmailStatus === 'checking' && (
                      <Text style={modal.statusHint}>Checking email…</Text>
                    )}
                    {regEmailStatus === 'available' && (
                      <Text style={[modal.statusHint, modal.statusHintOk]}>
                        ✓ Email is available
                      </Text>
                    )}
                    {regEmailStatus === 'taken' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Email already registered — log in instead or use another
                      </Text>
                    )}
                    {regEmailStatus === 'invalid' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Invalid email format
                      </Text>
                    )}
                  </View>

                  {/* PlayerName (låst tills email är giltig). onLayout
                      sparar fältets y-position i ScrollView:n så onFocus
                      kan scrolla det till toppen när custom keyboardet öppnas. */}
                  <View
                    style={[modal.fieldGroup, !regPlayerNameUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regPlayerNameUnlocked ? 'auto' : 'none'}
                    onLayout={(e) => {
                      regPlayerNameYRef.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <Text style={modal.fieldLabel}>Player Name - Letter-digit format</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        ref={regPlayerNameLettersRef}
                        style={[
                          modal.inputText,
                          modal.playerNameLettersInput,
                          regPlayerNameUnlocked && regPlayerNameKbMode === 'letter' && regPlayerNameStatus !== 'available' && modal.playerNameInputActive,
                        ]}
                        placeholder="Anna"
                        placeholderTextColor={Colors.textDisabled}
                        value={getPlayerNameLetters(regPlayerName)}
                        maxLength={PLAYER_NAME_MAX_LETTERS}
                        editable={regPlayerNameStatus !== 'checking'}
                        showSoftInputOnFocus={false}
                        selection={{
                          start: getPlayerNameLetters(regPlayerName).length,
                          end: getPlayerNameLetters(regPlayerName).length,
                        }}
                        selectTextOnFocus={false}
                        contextMenuHidden={true}
                        onFocus={() => {
                          setRegPlayerNameKbMode('letter');
                          setRegPlayerNameFocused(true);
                          requestAnimationFrame(() => {
                            regScrollRef.current?.scrollTo({
                              y: regPlayerNameYRef.current,
                              animated: true,
                            });
                          });
                        }}
                        onBlur={() => setRegPlayerNameFocused(false)}
                      />
                      <Text style={modal.playerNameSeparator}>–</Text>
                      <TextInput
                        ref={regPlayerNameDigitsRef}
                        style={[
                          modal.inputText,
                          modal.playerNameDigitsInput,
                          regPlayerNameUnlocked && regPlayerNameKbMode === 'digit' && regPlayerNameStatus !== 'available' && modal.playerNameInputActive,
                          getPlayerNameLetters(regPlayerName).length === 0 && modal.playerNameInputDisabled,
                        ]}
                        placeholder="1234"
                        placeholderTextColor={Colors.textDisabled}
                        value={getPlayerNameDigits(regPlayerName)}
                        maxLength={PLAYER_NAME_MAX_DIGITS}
                        editable={regPlayerNameStatus !== 'checking' && getPlayerNameLetters(regPlayerName).length > 0}
                        showSoftInputOnFocus={false}
                        selection={{
                          start: getPlayerNameDigits(regPlayerName).length,
                          end: getPlayerNameDigits(regPlayerName).length,
                        }}
                        selectTextOnFocus={false}
                        contextMenuHidden={true}
                        onFocus={() => {
                          if (getPlayerNameLetters(regPlayerName).length === 0) {
                            regPlayerNameLettersRef.current?.focus();
                            return;
                          }
                          setRegPlayerNameKbMode('digit');
                          setRegPlayerNameFocused(true);
                          requestAnimationFrame(() => {
                            regScrollRef.current?.scrollTo({
                              y: regPlayerNameYRef.current,
                              animated: true,
                            });
                          });
                        }}
                        onBlur={() => setRegPlayerNameFocused(false)}
                      />
                      <TouchableOpacity
                        onPress={handleRegCheckPlayerName}
                        disabled={!regPlayerName.trim() || regPlayerNameStatus === 'checking' || regPlayerNameStatus === 'available'}
                        style={[
                          modal.checkBtn,
                          (!regPlayerName.trim() || regPlayerNameStatus === 'checking') && modal.checkBtnDisabled,
                          regPlayerNameStatus === 'available' && modal.checkBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            modal.checkBtnText,
                            regPlayerNameStatus === 'available' && modal.checkBtnTextDone,
                          ]}
                        >
                          {regPlayerNameStatus === 'checking' ? '…'
                            : regPlayerNameStatus === 'available' ? '✓'
                            : 'Check'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {/* Sekundära åtgärder under namnfältet — se guest-formen
                        ovan för rationale (mutually-exclusive enable). */}
                    <View style={modal.playerNameActionRow}>
                      <TouchableOpacity
                        onPress={handleRegRemoveName}
                        disabled={regPlayerName.length === 0 || regPlayerNameStatus === 'checking'}
                        style={[
                          modal.nameActionBtn,
                          (regPlayerName.length === 0 || regPlayerNameStatus === 'checking') &&
                            modal.nameActionBtnDisabled,
                        ]}
                      >
                        <Text style={modal.nameActionBtnText}>Remove</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleRegGenerateName}
                        disabled={regPlayerNameStatus === 'checking'}
                        style={[
                          modal.nameActionBtn,
                          regPlayerNameStatus === 'checking' &&
                            modal.nameActionBtnDisabled,
                        ]}
                      >
                        <Text style={modal.nameActionBtnText}>Auto-generate</Text>
                      </TouchableOpacity>
                    </View>
                    {/* Status-rad — i idle visas format-hint istället för char-räknare. */}
                    {regPlayerNameStatus === 'idle' && (
                      <Text style={modal.statusHint}>
                        Format: 1-{PLAYER_NAME_MAX_LETTERS} letters, 0-{PLAYER_NAME_MAX_DIGITS} digits
                      </Text>
                    )}
                    {regPlayerNameStatus === 'checking' && (
                      <Text style={modal.statusHint}>Checking availability…</Text>
                    )}
                    {regPlayerNameStatus === 'available' && (
                      <Text style={[modal.statusHint, modal.statusHintOk]}>
                        ✓ Player Name is available
                      </Text>
                    )}
                    {regPlayerNameStatus === 'taken' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Player Name already taken — try another
                      </Text>
                    )}
                    {regPlayerNameStatus === 'invalid' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Player Name not allowed — must follow format and avoid blocked combinations
                      </Text>
                    )}
                  </View>

                  {/* Password (låst tills playerName är validerat).
                      Användaren måste trycka Confirm för att låsa upp Year.
                      onLayout sparar fältets y-position så onFocus kan
                      scrolla det till toppen när system-tangentbordet öppnas. */}
                  <View
                    style={[modal.fieldGroup, !regPasswordUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regPasswordUnlocked ? 'auto' : 'none'}
                    onLayout={(e) => {
                      regPasswordYRef.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <Text style={modal.fieldLabel}>Password</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        style={[
                          modal.inputText,
                          modal.playerNameInput,
                          regPasswordUnlocked && !regPasswordConfirmed && modal.playerNameInputActive,
                        ]}
                        placeholder={`At least ${REG_PASSWORD_MIN_LENGTH} characters`}
                        placeholderTextColor={Colors.textDisabled}
                        value={regPassword}
                        onChangeText={handleRegPasswordChange}
                        secureTextEntry
                        maxLength={REG_PASSWORD_MAX_LENGTH}
                        returnKeyType="done"
                        onSubmitEditing={handleRegConfirmPassword}
                        onFocus={() => {
                          // Markera fältet som fokuserat — den globala
                          // keyboardDidShow-effekten plockar upp detta och
                          // scrollar fältet till toppen när tangentbordet
                          // är fullt synligt.
                          regPasswordFocusedRef.current = true;
                        }}
                        onBlur={() => {
                          regPasswordFocusedRef.current = false;
                        }}
                      />
                      <TouchableOpacity
                        onPress={handleRegConfirmPassword}
                        disabled={!regPasswordValid || regPasswordConfirmed}
                        style={[
                          modal.checkBtn,
                          !regPasswordValid && modal.checkBtnDisabled,
                          regPasswordConfirmed && modal.checkBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            modal.checkBtnText,
                            regPasswordConfirmed && modal.checkBtnTextDone,
                          ]}
                        >
                          {regPasswordConfirmed ? '✓' : 'Confirm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={modal.statusHint}>
                      Format: min {REG_PASSWORD_MIN_LENGTH}-{REG_PASSWORD_MAX_LENGTH} characters
                    </Text>
                  </View>

                  {/* Year of birth */}
                  <View
                    style={[modal.fieldGroup, !regYearUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regYearUnlocked ? 'auto' : 'none'}
                  >
                    <Text style={modal.fieldLabel}>Competition Year of Birth</Text>
                    <TouchableOpacity
                      style={[
                        modal.yearTrigger,
                        regYearUnlocked && !regParsedBirthYear && modal.yearTriggerActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        Keyboard.dismiss();
                        setRegYearPickerOpen(true);
                      }}
                    >
                      <Text
                        style={[
                          modal.yearTriggerText,
                          !regParsedBirthYear && modal.yearTriggerPlaceholder,
                          regYearUnlocked && !regParsedBirthYear && modal.yearTriggerPlaceholderActive,
                        ]}
                      >
                        {regParsedBirthYear ? formatBirthYear(regParsedBirthYear) : 'Select year'}
                      </Text>
                      <Text style={modal.yearTriggerArrow}>›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Assistance level + Region scope side by side, drop-down pickers.
                      Default-värden ('standard'/'global') är förvalda så
                      användaren kan registrera direkt efter year of birth. */}
                  <Text
                    style={[
                      modal.statusHint,
                      !regAssistanceUnlocked && modal.fieldGroupLocked,
                    ]}
                  >
                    Use default or select prefered setup
                  </Text>
                  <View style={modal.fieldRow}>
                    {/* Assistance level (vänster halva) */}
                    <View
                      style={[modal.fieldGroupHalf, !regAssistanceUnlocked && modal.fieldGroupLocked]}
                      pointerEvents={regAssistanceUnlocked ? 'auto' : 'none'}
                    >
                      <Text style={modal.fieldLabel}>Assistance Level</Text>
                      <TouchableOpacity
                        style={modal.yearTrigger}
                        activeOpacity={0.7}
                        onPress={() => {
                          Keyboard.dismiss();
                          setRegAssistancePickerOpen(true);
                        }}
                      >
                        <Text style={modal.yearTriggerText} numberOfLines={1}>
                          {ASSISTANCE_OPTIONS.find((o) => o.id === regAssistance)?.label}
                        </Text>
                        <Text style={modal.yearTriggerArrow}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Region scope (höger halva) */}
                    <View
                      style={[modal.fieldGroupHalf, !regRegionUnlocked && modal.fieldGroupLocked]}
                      pointerEvents={regRegionUnlocked ? 'auto' : 'none'}
                    >
                      <Text style={modal.fieldLabel}>Region Scope</Text>
                      <TouchableOpacity
                        style={modal.yearTrigger}
                        activeOpacity={0.7}
                        onPress={() => {
                          Keyboard.dismiss();
                          setRegRegionPickerOpen(true);
                        }}
                      >
                        <Text style={modal.yearTriggerText} numberOfLines={1}>
                          {REG_REGION_OPTIONS.find((o) => o.id === regRegion)?.label}
                        </Text>
                        <Text style={modal.yearTriggerArrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                {regPlayerNameFocused && (
                  <CodeKeyboard
                    mode={regPlayerNameKbMode}
                    letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    onPress={handleRegPlayerNameKeyPress}
                    onBackspace={handleRegPlayerNameBackspace}
                    onModeToggle={toggleRegPlayerNameKbMode}
                    // Digit-mode kräver minst 1 letter — toggle-knappen dimmas
                    // i letter-mode tills letter-sektionen har innehåll.
                    modeToggleDisabled={regPlayerNameKbMode === 'letter' && regPlayerName.length === 0}
                  />
                )}

                <TouchableOpacity
                  style={[
                    profileMenu.primaryBtn,
                    !isRegisterFormValid && profileMenu.primaryBtnDisabled,
                  ]}
                  onPress={handleRegisterSubmit}
                  disabled={!isRegisterFormValid}
                >
                  <Text style={profileMenu.primaryBtnText}>Register</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={profileMenu.cancelBtn}
              onPress={handleAuthFormCancel}
            >
              <Text style={profileMenu.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Year picker overlay för register-formen */}
          {regYearPickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegYearPickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Year of Birth</Text>
                <ScrollView style={{ maxHeight: 360 }}>
                  {BIRTH_YEARS.map((year) => {
                    const selected = regParsedBirthYear === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[modal.yearItem, selected && modal.yearItemSelected]}
                        onPress={() => {
                          setRegBirthYearText(String(year));
                          setRegYearPickerOpen(false);
                        }}
                      >
                        <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                          {formatBirthYear(year)}
                        </Text>
                        {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={() => setRegYearPickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Assistance picker overlay för register-formen */}
          {regAssistancePickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegAssistancePickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Assistance Level</Text>
                {ASSISTANCE_OPTIONS.map((opt) => {
                  const selected = regAssistance === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setRegAssistance(opt.id);
                        setRegAssistancePickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {opt.label}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={() => setRegAssistancePickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Region picker overlay för register-formen */}
          {regRegionPickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegRegionPickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Region Scope</Text>
                {REG_REGION_OPTIONS.map((opt) => {
                  const selected = regRegion === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setRegRegion(opt.id);
                        setRegRegionPickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {opt.label}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={() => setRegRegionPickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ── QuizVibe user vs Guest ─────────────────────────────
          Öppnas av info-ikonen intill BÅDA sektionsrubrikerna
          ("QuizVibe user" + "Guest login / Non-registered").
          Bottom-sheet i samma vokabulär som profileMenu/JoinModal.
          ScrollView inuti eftersom raderna + Premium-listan kan bli
          högre än 90 % viewport på korta skärmar. */}
      <Modal
        visible={compareInfoVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setCompareInfoVisible(false)}
      >
        <Pressable style={modal.overlay} onPress={() => setCompareInfoVisible(false)}>
          {/* Tap inuti sheet:en ska INTE stänga — egen Pressable som
              sväljer trycket. */}
          <Pressable style={modal.sheet} onPress={() => {}}>
            <Text style={modal.title}>QuizVibe user vs Guest</Text>
            <Text style={modal.subtitle}>Registration is free.</Text>
            <ScrollView style={{ flexShrink: 1 }} showsVerticalScrollIndicator={false}>
              <View style={styles.compareHeaderRow}>
                <View style={styles.compareLabelCell} />
                <Text style={[styles.compareColHead, styles.compareColHeadUser]}>USER</Text>
                <Text style={styles.compareColHead}>GUEST</Text>
              </View>
              {USER_VS_GUEST_ROWS.map((row) => (
                <View key={row.label} style={styles.compareRow}>
                  <Text style={[styles.compareLabelCell, styles.compareLabel]}>{row.label}</Text>
                  <CompareCell value={row.user} positive />
                  <CompareCell value={row.guest} />
                </View>
              ))}
              {/* Premium listas SEPARAT — tabellen ovan gäller det gratis
                  kontot, så inga betalda tak blandas in där.
                  Kortet speglar StoreScreen:s featureList 1:1 (grön ✓ +
                  Premium-rad + "Basic: …"-underrad i en bordered card). */}
              <Text style={styles.compareSectionHead}>With QuizVibe Premium</Text>
              <View style={styles.premiumFeatureList}>
                {PREMIUM_FEATURES.map((feature) => (
                  <View key={feature.premium} style={styles.premiumFeatureRow}>
                    <Text style={styles.premiumFeatureCheck}>✓</Text>
                    <View style={styles.premiumFeatureTextWrap}>
                      <Text style={styles.premiumFeaturePremium}>{feature.premium}</Text>
                      <Text style={styles.premiumFeatureBasic}>Basic: {feature.basic}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.compareFootnote}>
                Joining other players&apos; games is always free — host credits are only
                used when you host.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setCompareInfoVisible(false)} style={modal.cancelBtn}>
              <Text style={modal.cancelText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * En cell i user/guest-jämförelsen. Boolean → ✓ (grön i user-kolumnen,
 * annars neutral) / ✗ (grå). Sträng → värdet som text (t.ex. "Up to 12*").
 */
function CompareCell({ value, positive }: { value: boolean | string; positive?: boolean }) {
  if (typeof value === 'string') {
    return <Text style={[styles.compareValueCell, styles.compareValueText]}>{value}</Text>;
  }
  return (
    <Text
      style={[
        styles.compareValueCell,
        styles.compareMark,
        value
          ? positive
            ? styles.compareMarkYesUser
            : styles.compareMarkYes
          : styles.compareMarkNo,
      ]}
    >
      {value ? '✓' : '✗'}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  containerScroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: SCREEN_HEIGHT < 600 ? Spacing.md : Spacing.xxl,
    paddingBottom: Spacing.lg + 52, // + BOTTOM_BANNER_HEIGHT
    justifyContent: 'space-between',
  },

  brandSection: { alignItems: 'center', gap: SCREEN_HEIGHT < 600 ? 2 : Spacing.sm },
  appName: {
    fontSize: SCREEN_HEIGHT < 600 ? 30 : 38,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: SCREEN_HEIGHT < 600 ? 2 : Spacing.sm,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  // Wrap för cross-fade tagline. Stretches across full brandSection-bredd
  // (annars skulle alignItems: center krympa wrappen till första textens
  // intrinsiska bredd och den absolut-positionerade andra texten skulle
  // sticka ut eller wrappa). position: 'relative' behövs för att
  // taglineOverlay:s absolute-positioning ska anchor:as här.
  taglineWrap: {
    alignSelf: 'stretch',
    position: 'relative',
  },
  taglineCentered: {
    textAlign: 'center',
  },
  // Andra taglinen overlay:as ovanpå den första — fyller wrappens
  // bounds så texten centreras i samma område som första texten.
  taglineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  actionsSection: { gap: Spacing.md },
  gameBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gameBtnDisabled: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  gameBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  // Register or Login-knappen — helgrön (bg + kant) så den särskiljs från
  // guest-knapparna nedanför och matchar "QuizVibe user"-rubrikens ruta.
  gameBtnRegister: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  // Inloggade user-knapparna (Start New Game + Join with Room Code — user)
  // — helgold (Colors.warning, bg + kant) med svart text per appens
  // gold-badge-konvention (PREMIUM-badges, GetReady-kategori-badge).
  gameBtnUser: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  gameBtnUserText: {
    color: '#000000',
  },
  // Guest-knapparna (Join with Room Code — guest + Start Game as Guest) — helgrå
  // (bg + kant) i samma grå ton som Guest-rubrikens ruta (#6B7280).
  gameBtnGuest: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
  },
  // Kant-skärande FREE-badge på startskärmens tre knappar (utloggat läge).
  // Grön bg + grön kant (guest-knapparna); Register-varianten byter till
  // vit kant så badgen syns mot knappens gröna bakgrund.
  homeFreeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
    backgroundColor: Colors.success,
    borderRadius: 4,
    borderWidth: 1,
    // Vit kant på ALLA Home-badges (2026-07-03, var Colors.success) —
    // gör homeFreeBadgeRegister/homeUserBadge:s borderColor-overrides
    // redundanta men de behålls (homeUserBadge sätter även bg).
    borderColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  // "No Data Saved"-badgen på Start Game - Guest login i
  // inloggat läge — grå bg (samma PREMIUM-grå som guest-knapparna) +
  // vit kant. User-knapparnas "Game Results - Saved"-badges togs bort
  // 2026-08-07.
  homeUserBadge: {
    backgroundColor: '#6B7280',
    borderColor: '#FFFFFF',
  },
  homeFreeBadgeRegister: {
    borderColor: '#FFFFFF',
  },
  homeFreeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  createGameHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    fontStyle: 'italic',
  },
  // Sektionsrubrik + info-ikon centrerade som en enhet. Delas av
  // "QuizVibe user"- och Guest-rubriken. Rubrikens egen marginTop måste
  // nollas på call-siten och flyttas hit, annars förskjuts bara texten
  // inuti raden i stället för hela blocket.
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  // Info-knapp ("i" i cirkel) — samma vokabulär som Lobby-skärmens
  // infoIconBtn så alla info-affordances i appen ser lika ut.
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
  // ── user vs guest-jämförelsen (info-modalen) ─────────────────────
  compareHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // Label tar resterande bredd; värde-kolumnerna är fixa så ✓/✗ linjerar
  // under sina rubriker oavsett hur långa etiketterna blir.
  compareLabelCell: { flex: 1, paddingRight: Spacing.sm },
  compareLabel: { fontSize: 13, color: Colors.textPrimary, lineHeight: 17 },
  compareValueCell: { width: 72, textAlign: 'center' },
  compareColHead: {
    width: 72,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },
  compareColHeadUser: { color: Colors.success },
  compareMark: { fontSize: 16, fontWeight: '700' },
  compareMarkYesUser: { color: Colors.success },
  compareMarkYes: { color: Colors.textSecondary },
  compareMarkNo: { color: Colors.textDisabled },
  compareValueText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  // Rubrik + punktlista för Premium-blocket under jämförelsetabellen.
  // Gold matchar PREMIUM-badgarnas färgspråk i resten av appen.
  compareSectionHead: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.warning,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  // Premium-listan i info-modalen — ORDAGRANN spegel av StoreScreen:s
  // featureList/featureRow/featureCheck/featureTextWrap/featurePremium/
  // featureBasic. Theme-tokens är utskrivna som råa värden eftersom den
  // här filen inte importerar FontSize/FontWeight (FontSize.md=15,
  // sm=13, xs=11; FontWeight.bold='700', medium='500').
  premiumFeatureList: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  premiumFeatureCheck: {
    fontSize: 15,
    color: Colors.success,
    fontWeight: '700',
    width: 16,
    marginTop: 1,
  },
  premiumFeatureTextWrap: {
    flex: 1,
    gap: 2,
  },
  premiumFeaturePremium: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  premiumFeatureBasic: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  compareFootnote: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: Spacing.md,
  },
  // "QuizVibe user"-rubriken ovanför Register or Login — grön text utan
  // ruta (matchar knappens gröna färgtema).
  userSectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Guest-rubriken — grå text utan ruta, i samma grå ton som
  // guest-knapparna (#6B7280). Separerar guest-pathen från
  // registered-action-knapparna ovan.
  guestSectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  // Fold-header för inloggade users' guest-sektion — speglar Profile-
  // skärmens kollapsbara sektioner (+/− toggle-box) men vänsterjusterad
  // istället för centrerad, så toggle-boxen hamnar längst till vänster
  // på skärmen (Peter 2026-08-27).
  guestFoldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guestFoldToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guestFoldToggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestFoldToggleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm },
  footerText: { fontSize: 12, color: Colors.textSecondary },
  footerDot: { fontSize: 12, color: Colors.textSecondary },
  // Tappbar variant av footerText. Lite mer framträdande färg
  // (textPrimary) + underline så det syns att raden är en länk även för
  // logged-out users som är skärmens primära FAQ-målgrupp.
  footerLink: { color: Colors.textPrimary, textDecorationLine: 'underline' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  // maxHeight: '90%' bounder sheet:en till viewport så toppen aldrig spiller
  // över skärmen när PlayerName:s custom CodeKeyboard tar plats nedanför
  // ScrollView:n. ScrollView:n inuti har flexShrink: 1 så den krymper
  // när chrome+keyboard sammanlagt skulle överskrida sheet:s maxhöjd.
  sheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    // Tightare padding/gap på korta skärmar (< 700 px = iPhone SE/8 m.fl.) så
    // fält + custom CodeKeyboard ryms inom maxHeight (90 %).
    padding: SCREEN_HEIGHT < 700 ? Spacing.md : Spacing.xl,
    gap: SCREEN_HEIGHT < 700 ? Spacing.sm : Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    maxHeight: '90%',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  // lineHeight krävs sedan subtiteln kan bära Remote 1vs1-gaternas
  // förklaringstext (~3 rader) i stället för default-enraddaren.
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  input: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg,
    fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 4,
  },
  inputText: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg,
    fontSize: 16, fontWeight: '500', color: Colors.textPrimary,
  },
  joinBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  joinBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  joinBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  cancelText: { fontSize: 14, color: Colors.textSecondary },

  backBtn: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: Spacing.md },
  backText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },

  // Choice list (chooser step)
  choiceList: { gap: Spacing.sm, marginTop: Spacing.xs },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  choiceIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  choiceLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  choiceSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  choiceArrow: { fontSize: 22, color: Colors.textSecondary },
  choiceRowDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  choiceTextDisabled: { color: Colors.textDisabled },

  // Empty state (invites)
  emptyState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },

  // Guest-form fält
  fieldGroup: { gap: 6 },
  fieldGroupLocked: { opacity: 0.4 },
  // Side-by-side fältlayout (assistance + region i samma row)
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldGroupHalf: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xs,
  },
  // Guest-host-formens read-only settings-rader (Response time 60s +
  // Assistance Full). Bordered rad som speglar yearTrigger-vokabulären
  // men utan tap-affordance — värdet är fast.
  guestFixedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  guestFixedLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  guestFixedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // PlayerName-rad: input + Check-knapp inline
  playerNameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  playerNameInput: {
    flex: 1,
  },
  // Split-field PlayerName: letter-fält (vänster) + fixed dash + digit-fält
  // (höger). Empiriskt tunad ratio 7:6 — letters behöver mer plats än
  // digits eftersom "GuestAbcde" (10 chars) renderas bredare än "1234567"
  // (7 narrower digits). paddingHorizontal sänkt till Spacing.sm = 8 (vs
  // inputText:s default Spacing.lg = 16) — sparar 16px content-yta per
  // fält så hela namnet + alla 7 siffror ryms.
  playerNameLettersInput: {
    flex: 7,
    minWidth: 0,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  playerNameDigitsInput: {
    flex: 6,
    minWidth: 0,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  playerNameSeparator: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 2,
  },
  playerNameInputDisabled: {
    opacity: 0.45,
  },
  playerNameInputActive: {
    borderColor: Colors.primary,
  },
  checkBtn: {
    minWidth: 72,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  checkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  checkBtnTextDone: {
    color: Colors.success,
    fontSize: 18,
  },

  // Sekundära åtgärds-rad under namnfältet (Remove + Auto-generate).
  // Vänster-justerad — knapparna ligger under input:s vänsterkant.
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
  // Opacity på hela knappen dimmer både text, border och bg så aktiv vs
  // inaktiv kontrast blir tydlig (white text @ 100% vs ~40%).
  nameActionBtnDisabled: {
    opacity: 0.4,
  },
  nameActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Status-rad under playerName
  statusHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    marginTop: 2,
  },
  statusHintOk: {
    color: Colors.success,
    fontWeight: '600',
  },
  statusHintError: {
    color: Colors.error,
    fontWeight: '600',
  },
  skillRow: { flexDirection: 'row', gap: Spacing.sm },
  skillBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  skillBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  skillBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  skillBtnTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Year of birth — drop-down trigger
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
  yearTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  yearTriggerText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  yearTriggerPlaceholder: { color: Colors.textDisabled, fontWeight: '400' },
  yearTriggerPlaceholderActive: { color: '#FFFFFF', fontWeight: '600' },
  yearTriggerArrow: { fontSize: 18, color: Colors.textSecondary },

  // Year picker overlay (inuti samma Modal)
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

  // Room code cells (6 separata rutor med auto-focus): 3 bokstäver +
  // 2 siffror + 1 trailing bokstav. flex:1 fördelar bredd jämnt över
  // tillgänglig yta så cellerna krymper graciöst på smalare devices.
  codeCellRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeCell: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  codeCellFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  // Highlight på nästa tomma cell — visar var användaren förväntas skriva
  codeCellActive: {
    borderColor: Colors.primary,
  },
  codeDash: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
    alignSelf: 'center',
  },

  // Invite-rader (waiting invites-listan)
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inviteEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  inviteFrom: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  inviteCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    marginTop: 2,
  },
  // Deny/Accept-knapparna (Peter 2026-08-27, ersatte hela-radens implicita
  // accept + "Join ›"-texten).
  inviteActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inviteDenyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  inviteDenyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  inviteAcceptBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  inviteAcceptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});

const profileMenu = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  // maxHeight: '90%' bounder sheet:en så toppen inte spiller ut när
  // PlayerName:s custom CodeKeyboard tar plats — samma fix som
  // modal.sheet (JoinModal). ScrollView:n inuti har flexShrink: 1.
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // Tightare padding/gap på korta skärmar (< 700 px) så Register-formens
    // fält + custom CodeKeyboard ryms inom maxHeight (90 %).
    padding: SCREEN_HEIGHT < 700 ? Spacing.md : Spacing.xl,
    paddingBottom: SCREEN_HEIGHT < 700 ? Spacing.lg : Spacing.xxl,
    gap: SCREEN_HEIGHT < 700 ? Spacing.sm : Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '90%',
  },
  header: {
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
  headerEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  headerBrandWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  logoutBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Login / Register sub-menu
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Login-mode-toggle ([Player Name] / [Email]). Visuellt mönster:
  // Lobby:s Game Mode-toggle 1:1 — borderStrong + bg-transparent default,
  // primary-border + primaryMuted-bg när aktiv.
  loginModeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  loginModeBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginModeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  loginModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  loginModeTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Matchar startskärmens gameBtn-style så Register / Log in i menyn
  // ser ut som Join Game / Create Game-knapparna.
  secondaryBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Row-layout för secondaryBtn:s med leading-ikon (Profile settings, Store).
  // Knappens egen alignItems/justifyContent: 'center' centrerar denna inner-
  // wrapper i sin tur, så ikon + text hamnar centrerat som grupp.
  secondaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Override för Register: grön kantlinje som matchar FREE-badgen och
  // signalerar "gratis / new-user-friendly".
  secondaryBtnFree: {
    borderColor: Colors.success,
  },

  // Wrapper som ger position-context för FREE-badgen på Register-knappen
  btnWithBadge: {
    position: 'relative',
  },
  freeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
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
  input: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputActive: {
    borderColor: Colors.primary,
  },
  // "Forgot password"-länk under password-fältet
  forgotLinkWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotLinkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: Spacing.md,
  },
  backText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});