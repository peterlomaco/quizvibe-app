import MultiSlider from '@ptomasroos/react-native-multi-slider';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Avatar } from '../components/Avatar';
import { YouTubeBrandIcon } from '../components/YouTubeBrandIcon';
import { SpotifyBrandIcon } from '../components/SpotifyBrandIcon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EraMarkerMinus, EraMarkerPlus } from '../components/EraSliderMarker';
import { PlayerHistorySection } from '../components/PlayerHistorySection';
import { QuizVibeFriendsLogo } from '../components/QuizVibeFriendsLogo';
import { QuizVibeQAvatar } from '../components/QuizVibeQAvatar';
import { ShoppingCartIcon } from '../components/ShoppingCartIcon';
import { CodeKeyboard } from '../components/CodeKeyboard';
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
import { resetIdentity, track } from '../utils/analytics';
import { deleteAccount } from '../utils/auth';
import { supabase } from '../utils/supabase';
import { AVATARS, getAvatarEmojiById } from '../utils/avatars';
import {
    addFriend,
    loadFriends,
    removeFriend,
    type Friend,
} from '../utils/friendsStorage';
import { PURCHASED_PACKAGES, type MusicPackage } from '../utils/mockPurchasedPackages';
import {
    clearProfile,
    getCachedProfile,
    loadProfile,
    playerNameExists,
    saveProfile,
    type AssistanceLevel,
    type AvatarSource,
    type GameMode,
    type ProfileData,
    type Region,
} from '../utils/profileStorage';
import {
    appendPlayerNameDigit,
    appendPlayerNameLetter,
    backspacePlayerNameDigits,
    backspacePlayerNameLetters,
    getPlayerNameDigits,
    getPlayerNameLetters,
    normalizePlayerName,
    PLAYER_NAME_MAX_DIGITS,
    PLAYER_NAME_MAX_LETTERS,
} from '../utils/playerName';
// Spotify OAuth-imports borttagna (Plan B 2026-07-22) — self-attest via
// ProfileData.spotifyAppConfirmed ersätter connectSpotify/getSpotifyConnectionStatus.
import { getCachedPremium, hasPremiumSubscription } from '../utils/subscriptionStorage';
import {
    defaultEnabledMainCategories,
    type MainCategory,
} from '../utils/mainCategory';
// Create Game-flödet (samma som Home:s handleCreateGame). När fler skärmar
// får denna entry-punkt: lyft till en delad utility i src/utils/.
import { clearEjected } from '../utils/ejectedPlayers';
import { clearLeftPlayers } from '../utils/leftPlayers';
import { registerActiveRoom } from '../utils/mockActiveRooms';
import { clearLobbyPlayers } from '../utils/mockLobbyPlayers';
import { clearLobbySettings } from '../utils/mockLobbySettings';
import { clearGameStarted } from '../utils/mockStartedGames';
import { generateRoomCode } from '../utils/roomCode';
import { checkSpotifyInstalled } from '../utils/spotifyDJ';

// ─── Data ─────────────────────────────────────────────────────────────────────

type AvatarCategory = 'All' | 'Basic' | 'Retro' | 'Music' | 'Tech' | 'Fun';

const CATEGORIES: AvatarCategory[] = ['All', 'Basic', 'Retro', 'Music', 'Tech', 'Fun'];

// ─── Birth year options (descending, newest first) ────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1950;
// 15+ minimum age requirement (2026-06-01: höjt från 13+ pga 15+-gränsat
// film-/innehåll i appen, utöver App Store / GDPR). Dynamisk så minimum-året
// följer current year — 2026: max 2011, 2027: max 2012, osv.
const MAX_BIRTH_YEAR = CURRENT_YEAR - 15;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);
// Generisk fallback för Competition Year of Birth när profilen saknar
// fältet — random år i [1970, 2005] (vuxenålder 21–56). Säkrar att
// Competition Age beräknas och Profile-vyn aldrig visar tomt selector-
// värde. Speglar Lobby:s motsvarande randomBirthYear-helper.
function randomAdultBirthYear(): number {
  const min = 1970;
  const max = 2005;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Endpoints renderas med "or earlier"/"or later"-suffix eftersom de
// representerar öppna intervall (alla födda <=1930 respektive >=2020).
const formatBirthYear = (y: number): string =>
  y === MIN_BIRTH_YEAR
    ? `${MIN_BIRTH_YEAR} or earlier`
    : y === MAX_BIRTH_YEAR
      ? `${MAX_BIRTH_YEAR} or later`
      : String(y);

// Default Image-raden använder QuizVibe Q-brand som visuell ikon (rendereras
// i SourceRow nedan via icon='Q'-sentineln). Tidigare emoji '😶' (anonym
// silhouette) flyttades 2026-05-18 till Choose Avatar-urvalet (kategorin
// 'Basic') så användaren kan plocka silhouetten explicit istället för att
// gå via Default Image-raden. Default Image-raden fortsätter att rendera
// QuizVibe Q-marken som faktisk avatar (useBrandFallback i Avatar.tsx).
// 'upload' tas medvetet bort ur menyn 2026-05-19 — Upload Photo-flödet
// avvecklas (kräver image-picker + storage-bucket som inte är aktiverat,
// och Choose Avatar + Default Image täcker MVP-behovet). AvatarSource-
// typen behåller 'upload' som värde så profiles som tidigare valt det
// fortsatt loadar utan migrations-error; previewCaption har en fallback
// för 'Custom photo'-strängen.
const SOURCE_OPTIONS: { id: AvatarSource; icon: string; label: string; subtitle: string }[] = [
  { id: 'choose',  icon: '✨', label: 'Choose Avatar',  subtitle: 'Pick from our collection'      },
  { id: 'default', icon: 'Q',  label: 'Default Image',  subtitle: 'QuizVibe brand mark'           },
];

// ─── Competition defaults ─────────────────────────────────────────────────────
// Assistance level styr mängden hjälp i Letter Grid + reveal-kurvor:
// full = mest hjälp (3-letter prefix), minimal = minst (1-letter prefix).
const ASSISTANCE_OPTIONS: { id: AssistanceLevel; label: string }[] = [
  { id: 'full',     label: 'Full'     },
  { id: 'standard', label: 'Standard' },
  { id: 'minimal',  label: 'Minimal'  },
];

// V1-launch: enbart Sweden som val. Type:n i profileStorage stannar bred
// ('sweden' | 'nordics' | 'global') så befintliga sparade profiler kan
// läsas in utan migrationspipeline, men UI:t exponerar bara Sweden och
// load-effekten coerce:ar non-sweden till 'sweden' så det blir konsekvent.
const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: 'sweden', label: 'Sweden' },
];
const REGION_FLAGS: Record<string, string> = { sweden: '🇸🇪', Sweden: '🇸🇪' };

// Hur länge spelarna har på sig att svara på en fråga (skiljer sig från
// hur länge själva frågematerialet — låt/video/bild — spelas upp).
type AnswerResponse = 30 | 45 | 60;
const ANSWER_RESPONSE_OPTIONS: { id: AnswerResponse; label: string }[] = [
  { id: 30, label: '30 seconds' },
  { id: 45, label: '45 seconds' },
  { id: 60, label: '60 seconds' },
];

// Game era — år-spann för frågor. Speglar Lobby-skärmens slider men utan
// player-clamping (Profile är default-setup, inga spelare i kontext).
// ERA_MIN_INTERVAL = minsta tillåtna avstånd mellan from/to-markörer (15 år).
// ERA_MIN_INTERVAL_PX räknar om det till slider-pixel för MultiSlider:s
// minMarkerOverlapDistance-prop.
// ERA_TO_MIN = lägsta tillåtna "to"-år (höger thumb-golv). En era som slutar
// före 1980 ger för tunn pool. Vänster thumb (from) får gå till ERA_MIN.
// ERA_MIN = 1950 så slider-värdet matchar tidsaxelns vänsterkant ("<1950").
// Tidigare gick slidern 1900..currentYear medan axeln visuellt började vid
// "<1930" — det skapade en 30-års-förskjutning mellan thumb-position och
// vad rutan ovan visade. Nu mappar 0 % → 1930 och 100 % → currentYear.
const ERA_MIN = 1950;
const ERA_MAX = new Date().getFullYear();
const ERA_SLIDER_WIDTH = 280;
// SLIDER_INSET = pixel-buffer på vardera sida så thumb-cirklarna inte
// sticker ut förbi slider-trackens kanter. MultiSlider:s sliderLength
// sätts till INNER_WIDTH och DecadeMarks-positionen offset:as med INSET.
const ERA_SLIDER_INSET = 12;
const ERA_SLIDER_INNER_WIDTH = ERA_SLIDER_WIDTH - 2 * ERA_SLIDER_INSET;
const ERA_MIN_INTERVAL = 15;
const ERA_TO_MIN = 1980;
const ERA_MIN_INTERVAL_PX = Math.ceil((ERA_MIN_INTERVAL / (ERA_MAX - ERA_MIN)) * ERA_SLIDER_INNER_WIDTH);

function DecadeMarks() {
  // Tidsaxel — labels positionerade på faktiska års-värden, INTE jämnt
  // fördelade. Det gör att thumben landar exakt på respektive label
  // (eftersom slidern mappar ERA_MIN..ERA_MAX linjärt). Tidigare jämn-
  // fördelning gav 1–5 års offset mellan thumb och label vilket såg
  // omatchat ut. Nu: position = ((year - ERA_MIN) / (ERA_MAX - ERA_MIN))
  // * ERA_SLIDER_WIDTH per label. Ledmellanrummet 2010 → ERA_MAX är något
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
    <View style={{ width: ERA_SLIDER_WIDTH, height: 75, marginTop: 6 }}>
      {labelEntries.map(({ label, year }) => {
        const position = ERA_SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * ERA_SLIDER_INNER_WIDTH;
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

// ─── Screen ───────────────────────────────────────────────────────────────────

// Synlig OFF-färg för Source Dashboard-switchar (Colors.borderStrong är för transparent).
const PROFILE_MATRIX_OFF = '#3A5068';

export default function ProfileScreen() {
  // ScrollView-ref för programmatisk scroll-to-top när man entrar via Home:s
  // "Profile settings"-knapp (som pushar med scrollToTop=1 i routen-paramen).
  // Tab-navigatorn bevarar scroll-position mellan tab-byten, så utan denna
  // hamnar man kvar där man var senast.
  const scrollRef = useRef<ScrollView>(null);
  const localParams = useLocalSearchParams<{ scrollToTop?: string }>();

  const [source, setSource]               = useState<AvatarSource>('choose');
  const [category, setCategory]           = useState<AvatarCategory>('All');
  const [selectedAvatarId, setSelectedId] = useState<string>('5');
  // Vilken Save-knapp som senast trycktes — driver "✓ Saved"-feedback bara
  // på den knappen, inte på de andra två. Tillbaka till null efter 2s.
  // Save-action:en själv persisterar hela profilen oavsett knapp (en blob i
  // AsyncStorage); det är bara den visuella bekräftelsen som är knapp-lokal.
  const [savedSection, setSavedSection] = useState<null | 'defaults' | 'host' | 'packages'>(null);
  // Snapshot av profil-state vid senaste load/save — jämförs mot aktuell state
  // i guardedNavigate för att avgöra om osparade ändringar finns.
  const savedSnapshotRef = useRef('');
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [playerName, setPlayerName]           = useState('Player One');
  const [email, setEmail]                     = useState<string>('');
  const [birthYear, setBirthYear]         = useState<number | null>(null);
  const [assistance, setAssistance]       = useState<AssistanceLevel | null>(null);
  const [region, setRegion]               = useState<Region | null>(null);
  // gameCredits (engångsköpta Extras) är LEGACY sedan 2026-07-07 — visas
  // inte i UI och köps inte i Store längre. State:n finns kvar enbart som
  // save-passthrough så ett ev. gammalt sparat saldo inte nollas av
  // handleSave (profilen skrivs som hel blob).
  const [gameCredits, setGameCredits]     = useState<number>(0);
  // Seedas från den synkrona profil-spegeln så pillen inte renderar en frame
  // med "Free: 0" (läses som "slut på credits") innan loadProfile hinner.
  // Kall spegel → 0 som förut. Speglar Lobby.
  const [freeGameCredits, setFreeGameCredits] = useState<number>(
    () => getCachedProfile()?.freeGameCredits ?? 0,
  );
  // Datum för senaste auto-refresh av freeGameCredits (CET, "YYYY-MM-DD").
  // Sparas tillsammans med freeGameCredits så loadProfile kan avgöra om
  // top-up till FREE_CREDITS_DAILY_CAP behövs vid nästa load. Saknas på
  // gamla profiler — då räknas första load som "ny dag" och fyller på.
  const [lastFreeCreditsRefreshDate, setLastFreeCreditsRefreshDate] = useState<string | undefined>(undefined);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  // Checkbox-urval för bulk-delete i "+ Add QuizVibe Friends"-modalen
  // (Peter 2026-08-27, ersatte den tidigare per-rad "×"-knappen).
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  // Add-by-Player-Name-fältet (2026-08-27, omarbetat till samma split-field-
  // struktur — bokstäver + siffror via QuizVibe:s egna CodeKeyboard — som
  // PlayerName skapas överallt annars i appen. Speglar Lobby:s Share invite-
  // modal 1:1 (se LobbyScreen.tsx) så de två "Add QuizVibe friend"-formulären
  // beter sig identiskt.
  const [newFriendPlayerName, setNewFriendPlayerName] = useState('');
  const [addFriendKbMode, setAddFriendKbMode] = useState<'letter' | 'digit'>('letter');
  const [addFriendFocused, setAddFriendFocused] = useState(false);
  const addFriendLettersRef = useRef<TextInput>(null);
  const addFriendDigitsRef = useRef<TextInput>(null);
  // Async existence-check (playerNameExists) — bara riktiga registrerade
  // QuizVibe-users kan sparas som friend. `addFriendChecking` disable:ar
  // Add-knappen under roundtrip:en, `addFriendError` visas inline vid miss.
  const [addFriendChecking, setAddFriendChecking] = useState(false);
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  const [answerResponseSeconds, setAnswerResponseSeconds] = useState<AnswerResponse>(30);
  // Initial-värde matchar generic-fallback-spec (1981 → innevarande år
  // via ERA_MAX) — Profile:s loadProfile-effect overridar med profilens
  // sparade värde om det finns.
  const [eraValues, setEraValues] = useState<[number, number]>([1981, ERA_MAX]);
  // Drag-tracking för era-slidern: håll non-active thumb fast vid sitt
  // start-värde medan host drar den aktiva (spegelt Lobby:s slider). Utan
  // detta puttar minMarkerOverlapDistance den passiva thumben framför sig.
  const draggingEraThumbRef = useRef<0 | 1 | null>(null);
  const eraDragStartValuesRef = useRef<[number, number]>([1981, ERA_MAX]);
  // Max antal spelare per spel — 4 = Basic (gratis), 12 = Premium.
  const [maxPlayers, setMaxPlayers] = useState<2 | 4 | 12>(4);
  // Default game mode (host-default) — 'pass-the-phone' (gratis) eller
  // 'individual-devices' (Premium).
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');
  // Single player är BORTTAGET som host-default 2026-08-26 — läget väljs per
  // spel via "Start New Game" på Home, inte i profilen. ProfileData-fältet
  // `singlePlayerDefault` finns kvar (DB-kolumn + Lobby:s carry-over läser
  // den) men skrivs härifrån alltid som false; se stale-coercen i load-
  // effekten och den explicita false-skrivningen i handleSave.
  // Premium-status — styr om PREMIUM-badge på Max 12-toggle visas i guld
  // (köpt) eller grått (inte köpt än), om Individual Devices är unlocked,
  // om Rounds-rulern visar gold-bracket + blå-tickade siffror, och om
  // Host Game Credits-pillen får gold-bordred + "Unlimited"-badge. Synced
  // med Lobby:s motsvarande hasPremium-state via samma subscriptionStorage-
  // helper. Load:as i useFocusEffect nedan så Profile speglar köp som
  // gjorts i Store utan delay.
  //
  // Seedas från den SYNKRONA spegeln så första framen redan är rätt — annars
  // blinkar credits-pillen låst läge (grå PREMIUM + "Free: N") innan den
  // async läsningen hinner. Speglar Lobby; se getCachedPremium.
  const [hasPremium, setHasPremium] = useState(() => getCachedPremium() ?? false);
  // Default antal rundor (host-default). Speglar Lobby:s rounds-stepper +
  // RoundsRuler. Capas av gameMode — Pass-the-Phone (inkl. single-player
  // ovanpå PtP) är ALLTID max 4 oavsett subscription; Individual Devices
  // (Premium-gated) får 20. Vid byte av gameMode clampas värdet automatiskt
  // ner om det skulle hamna utanför nya max:t.
  const [roundsCount, setRoundsCount] = useState<number>(ROUNDS_DEFAULT);
  // 20 rundor kräver Premium OCH Individual Devices — speglar Lobby-logiken
  // exakt. PtP är alltid max 4 oavsett subscription. (Single player hanteras
  // inte här alls — det är ett per-spel-val på Home och alltid max 4.)
  const roundsMax =
    hasPremium && gameMode === 'individual-devices' ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
  // Ej premium → klampas alltid till Max 4. Effekten körs både när hasPremium
  // ändras (t.ex. sub löper ut) OCH när maxPlayers sätts till 12 från sparad
  // profil (race-safe: efffekten fyrar vid maxPlayers-ändringen → sätter 4 →
  // effekten fyrar igen men condition är false → stannar).
  useEffect(() => {
    if (!hasPremium && maxPlayers > 4) setMaxPlayers(4);
  }, [hasPremium, maxPlayers]);
  const handleSelectMaxPlayers = (n: 4 | 12) => {
    if (n === 12 && gameMode !== 'individual-devices') {
      Alert.alert(
        'Individual device required',
        'Please activate Individual device mode to be able to select Max 12 players.',
      );
      return;
    }
    if (n === 12 && !hasPremium) {
      Alert.alert(
        'Premium feature',
        'Hosting up to 12 players requires QuizVibe Premium. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
        ],
      );
      return;
    }
    setMaxPlayers(n);
  };
  const handleDecrementRounds = () => {
    setRoundsCount((prev) => {
      const next = Math.max(ROUNDS_MIN, prev - ROUNDS_STEP);
      // Haptic-klick bara när värdet faktiskt ändras (vid range-floor
      // skulle annars en "tom" tap fyra haptik utan visuell respons).
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  };
  const handleIncrementRounds = () => {
    if (roundsCount >= roundsMax) {
      if (gameMode === 'pass-the-phone' || gameMode === 'remote-1v1') {
        Alert.alert('More rounds not available', 'More than 4 rounds is only available with both Individual device and Premium activated.');
      }
      return;
    }
    setRoundsCount((prev) => {
      const next = Math.min(roundsMax, prev + ROUNDS_STEP);
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  };
  // Klampar roundsCount när roundsMax minskar (mode-byte, premium upphör) ELLER
  // när roundsCount sätts till ett värde > roundsMax (t.ex. sparad profil med 12
  // rundor från Individual Devices-läget när hasPremium=false).
  // Konditionell setRoundsCount undviker onödiga re-renders (utan kondition
  // skulle effekten anropa setRoundsCount vid varje roundsCount-ändring).
  useEffect(() => {
    if (roundsCount > roundsMax) {
      setRoundsCount(Math.max(ROUNDS_MIN, roundsMax));
    }
  }, [roundsCount, roundsMax]);

  // Två fria multiplayer-val (host-default). Inget premium-gate på lägesvalet
  // — subscription gatar caps (rundor/spelare) separat. Single player och
  // Remote 1vs1 väljs per spel på Home, inte här.
  const handleSelectGameMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode !== 'individual-devices') {
      setMaxPlayers(4);
    } else if (hasPremium) {
      setMaxPlayers(12);
    }
  };
  // En game-mode-ruta (delas av Single device- och Multiplayer-grupperna).
  // FREE-badge grön när aktiv, grå när inaktiv. Speglar Lobby.
  // redIndiv: om true färgas "Individual device"-rutan röd när inaktiv (används
  // bara i Number of Rounds quick-select, INTE i Game Settings/Game Mode).
  const renderModeBox = (key: 'ptp' | 'remote' | 'indiv', label: string, smallText?: boolean, redIndiv?: boolean) => {
    const isActive =
      key === 'ptp'
        ? gameMode === 'pass-the-phone'
        : key === 'remote'
          ? gameMode === 'remote-1v1'
          : gameMode === 'individual-devices';
    return (
      <Pressable
        style={({ pressed }) => [
          styles.modeOption,
          isActive ? styles.modeOptionPassActive : styles.modeOptionInactive,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() =>
          handleSelectGameMode(
            key === 'ptp' ? 'pass-the-phone' : key === 'remote' ? 'remote-1v1' : 'individual-devices',
          )
        }
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
      </Pressable>
    );
  };

  const [yearPickerOpen, setYearPickerOpen]     = useState(false);
  const [assistancePickerOpen, setAssistancePickerOpen]   = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [answerResponsePickerOpen, setAnswerResponsePickerOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  // Loading-state under server-anropet i handleConfirmDeleteAccount. Blockar
  // dubbel-tap på Delete Account-knappen + dimmer UI:t i sheet:en så user
  // ser att något händer.
  const [deletingAccount, setDeletingAccount] = useState(false);
  // Game connections-blocket (Friends) kan kollapsas
  // för att minska scrollning. Default expanded så användaren ser
  // alternativen direkt vid första besöket.
  const [gameConnectionsExpanded, setGameConnectionsExpanded] = useState(false);
  // Profile default settings-blocket (avatar + playerName + setup + Save)
  // — samma kollapsbara mönster som Game connections och Player history.
  const [profileDefaultsExpanded, setProfileDefaultsExpanded] = useState(false);
  // Host default settings-blocket (Game Mode → Number of Rounds) —
  // egen huvudrubrik mellan Profile defaults och Game connections, samma
  // kollapsbara mönster som de övriga top-level sektionerna.
  const [hostDefaultsExpanded, setHostDefaultsExpanded] = useState(false);
  // Customized Host packages — egen kollapsbar sektion mellan Host defaults
  // och Game connections. Listar PURCHASED_PACKAGES (mock tills Store-
  // integrationen är inkopplad) + Add-knapp som leder till Store.
  const [customizedPackagesExpanded, setCustomizedPackagesExpanded] = useState(false);
  // Legal-sektionen — Privacy Policy + Terms of Service. Default collapsed
  // eftersom användare sällan behöver öppna dokumenten; vid behov hittar
  // de fram via +-toggleln.
  const [legalExpanded, setLegalExpanded] = useState(false);
  // Per-paket on/off — styr om paketet visas i Lobby:s Customized Host
  // packages-block (när användaren är host). Default = alla aktiverade så
  // nyköpta paket dyker upp i Lobby utan att man måste gå till Profile först.
  // V1: PURCHASED_PACKAGES är tom så listan startar tom (gen-paketen togs
  // bort 2026-05-27).
  const [enabledHostPackages, setEnabledHostPackages] = useState<string[]>(
    () => PURCHASED_PACKAGES.map((p) => p.id),
  );
  const handleToggleHostPackage = (id: string) => {
    setEnabledHostPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };
  // Per-source profession-category-defaults (ersätter enabledMainCategories).
  const [youtubeEnabledCategories, setYoutubeEnabledCategories] = useState<MainCategory[]>(
    () => defaultEnabledMainCategories(),
  );
  const [imagesEnabledCategories, setImagesEnabledCategories] = useState<MainCategory[]>(
    () => defaultEnabledMainCategories(),
  );
  // ── Source Dashboard — derived state ────────────────────────────────
  const artistsEnabled =
    youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
  const artistsAllOn =
    youtubeEnabledCategories.includes('Music') && imagesEnabledCategories.includes('Music');
  const actorsEnabled =
    youtubeEnabledCategories.includes('Film') || imagesEnabledCategories.includes('Film');
  const actorsAllOn =
    youtubeEnabledCategories.includes('Film') && imagesEnabledCategories.includes('Film');
  const athletesEnabled =
    youtubeEnabledCategories.includes('Sport') || imagesEnabledCategories.includes('Sport');
  const athletesAllOn =
    youtubeEnabledCategories.includes('Sport') && imagesEnabledCategories.includes('Sport');
  const sourcesAllEnabled = artistsAllOn && actorsAllOn && athletesAllOn;
  const enabledSourceColumnsCount = [artistsEnabled, actorsEnabled, athletesEnabled].filter(Boolean).length;
  // Alias som matchar Lobby-namngivningen (används i porterade handlers).
  const enabledColumnsCount = enabledSourceColumnsCount;

  // ── Spotify-state ────────────────────────────────────────────────────
  const [spotifyEnabled, setSpotifyEnabled] = useState(false);
  const [spotifyAnswerYear, setSpotifyAnswerYear] = useState(true);
  const [spotifyAnswerName, setSpotifyAnswerName] = useState(true);
  // Self-attest (Plan B 2026-07-22): "Spotify user"-togglens värde. Behåller
  // namnet spotifyConnected (minimal diff) men betyder numera "user har
  // manuellt bekräftat att den har Spotify-appen" — ingen OAuth-verifiering.
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyGuideVisible, setSpotifyGuideVisible] = useState(false);
  // I Profile: Spotify DJ-defaulten är valbar om usern attestat "Spotify user".
  const isSpotifyAvailable = spotifyConnected;

  const [smColWidth, setSmColWidth] = useState(0);
  const smCellStyle = smColWidth > 0 ? { width: smColWidth } : undefined;

  // YouTube och Hints är OBEROENDE — ingen auto-sync mellan källorna.

  const handleToggleAllSources = (value: boolean) => {
    if (!value && !spotifyEnabled) {
      Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
      return;
    }
    setYoutubeEnabledCategories(value ? ['Music', 'Film', 'Sport'] : []);
    setImagesEnabledCategories(value ? ['Music', 'Film', 'Sport'] : []);
    if (value && spotifyConnected) setSpotifyEnabled(true);
  };

  const handleToggleArtistsColumn = (value: boolean) => {
    if (!value && !spotifyEnabled) {
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
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Sport'), imagesEnabledCategories.includes('Sport')].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
    );
  };

  const handleToggleAthletesColumn = (value: boolean) => {
    if (!value && !spotifyEnabled) {
      const artistsActive = youtubeEnabledCategories.includes('Music') || imagesEnabledCategories.includes('Music');
      if (!artistsActive) {
        const remaining = [youtubeEnabledCategories.includes('Film'), imagesEnabledCategories.includes('Film')].filter(Boolean).length;
        if (remaining < 2) { Alert.alert('Not applicable', 'At least 2 Actors/Athletes source combinations must remain active — or enable Artists or Spotify.'); return; }
      }
      if (enabledColumnsCount <= 1) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setYoutubeEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Sport'])] as MainCategory[]) : prev.filter((c) => c !== 'Sport'),
    );
  };

  const handleToggleArtistsYoutube = (value: boolean) => {
    if (!value && !spotifyEnabled) {
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
    if (!value && !spotifyEnabled) {
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
  // Self-attest (Plan B 2026-07-22): "Spotify user"-toggeln ersätter OAuth-
  // connect/disconnect. Av → DJ-defaulten stängs också av (den är gated på
  // attesten). Persisteras som spotifyAppConfirmed via Save Host settings.
  //
  // Applicerar attesten. Utbruten så att direkt-vägen och "Turn on anyway"-
  // vägen i handleToggleSpotifyUser delar exakt samma side-effects.
  const applySpotifyUserToggle = (val: boolean) => {
    setSpotifyConnected(val);
    if (!val) setSpotifyEnabled(false);
  };

  const handleToggleSpotifyUser = async (val: boolean) => {
    // Av-vägen verifierar inget — man får alltid ta tillbaka sin attest.
    if (!val) {
      applySpotifyUserToggle(false);
      return;
    }
    // På-vägen: verifiera att Spotify-appen faktiskt finns på enheten.
    // FAIL-OPEN — 'installed' och 'unknown' (Expo Go / OS-fel) passerar tyst.
    const installed = await checkSpotifyInstalled();
    if (installed !== 'not-found') {
      applySpotifyUserToggle(true);
      return;
    }
    // Bara 'not-found' varnar, och användaren kan alltid köra vidare ändå
    // (t.ex. om de tänker installera Spotify innan de spelar). Cancel rör
    // inte staten → den kontrollerade Switchen snäpper tillbaka av sig själv,
    // samma mönster som Year/Name-guardsen.
    Alert.alert(
      'Spotify not found on this device',
      "We couldn't find the Spotify app on this device. You need it installed to be the DJ in a Spotify game.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn on anyway', onPress: () => applySpotifyUserToggle(true) },
      ],
    );
  };

  const handleToggleSpotifyEnabled = (val: boolean) => {
    if (!val) {
      const hasOtherSource = youtubeEnabledCategories.length > 0 || imagesEnabledCategories.length > 0;
      if (!hasOtherSource) {
        Alert.alert('No active sources', 'Enable at least one YouTube or Guess Who source before disabling Spotify DJ.');
        return;
      }
      if (
        imagesEnabledCategories.length === 0 &&
        enabledSourceColumnsCount <= 1 &&
        !youtubeEnabledCategories.includes('Music')
      ) {
        Alert.alert('Not applicable', 'Only one source combination is active. Please enable another profession or source before turning this off.');
        return;
      }
    } else {
      setImagesEnabledCategories([...youtubeEnabledCategories] as MainCategory[]);
    }
    setSpotifyEnabled(val);
  };
  // V1 har inga themed packages i PURCHASED_PACKAGES (parkerade till v1.1+
  // per project_launch_scope_v1) och gen-paketen är borttagna 2026-05-27.
  // availablePackages är därmed tom i hela V1 — UI:t visar empty-state.
  const availablePackages = useMemo<MusicPackage[]>(
    () => [...PURCHASED_PACKAGES],
    [],
  );
  // "Select all"-state — true bara när alla synliga paket är aktiverade.
  // Vid tom availablePackages är detta alltid false (UI gömmer toggle:n
  // ändå när listan är tom).
  const isAllPackagesEnabled =
    availablePackages.length > 0 &&
    availablePackages.every((p) => enabledHostPackages.includes(p.id));
  const handleToggleAllPackages = () => {
    setEnabledHostPackages(isAllPackagesEnabled ? [] : availablePackages.map((p) => p.id));
  };

  // Ladda sparad profil från AsyncStorage varje gång Profile får fokus.
  // Detta täcker både mount och senare scenarier — t.ex. ny registrering
  // på Home medan Profile redan ligger mountad i tab-navigatorn, eller
  // återkomst från Store efter Extra Games-köp. useFocusEffect re-fyrar
  // vid varje focus så hela kortet alltid speglar senaste profilen.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((data) => {
        if (!active || !data) return;
        // Generic-fallback-spec för ofullständiga profiler (skulle
        // egentligen aldrig hända — registreringsflödet kräver alla fält
        // — men säkrar att vyn aldrig visar tomma selectors). Beräkna
        // augmented-profilen EN gång så samma värden används för både
        // setState OCH eventuellt saveProfile-write nedan; annars skulle
        // randomAdultBirthYear() ge olika värden vid varje reload.
        // Beräkna default game era: från starten av spelarens generation till
        // slutet av generation+2 (A=ERA_MIN-64, B=1965-80, C=1981-96, D=1997-2012, E=2013-ERA_MAX).
        const resolvedBirthYear = data.birthYear ?? randomAdultBirthYear();
        const _genEndYears = [1964, 1980, 1996, 2012, ERA_MAX];
        const _genIdx = resolvedBirthYear <= 1964 ? 0 : resolvedBirthYear <= 1980 ? 1 : resolvedBirthYear <= 1996 ? 2 : resolvedBirthYear <= 2012 ? 3 : 4;
        const _defaultEraTo = _genEndYears[Math.min(_genIdx + 2, 4)];
        const augmented: ProfileData = {
          ...data,
          birthYear: resolvedBirthYear,
          assistance: data.assistance ?? 'standard',
          // V1: bara Sweden. Coerce sparad 'nordics'/'global' (från innan
          // v1-launch-scopet) till 'sweden' så UI:t och persisterad state
          // alltid stämmer. wasIncomplete-checken nedan upptäcker att fältet
          // ändrades och persisterar via defensive write.
          region: 'sweden',
          gameEraFrom: data.gameEraFrom ?? resolvedBirthYear,
          gameEraTo: data.gameEraTo ?? _defaultEraTo,
          maxPlayers: data.maxPlayers ?? 4,
          gameMode: data.gameMode ?? 'pass-the-phone',
          // Stale-coerce: Single player togs bort som host-default
          // 2026-08-26. Ett gammalt sparat `true` skulle annars smyga in i
          // Lobby:s seed-fallback och låsa en Multiplayer-lobby.
          singlePlayerDefault: false,
          roundsDefault: data.roundsDefault ?? ROUNDS_DEFAULT,
          answerResponseSeconds: data.answerResponseSeconds ?? 30,
          // Default — alla köpta paket aktiverade så nyköpta dyker upp i
          // Lobby utan extra steg via Profile. V1: PURCHASED_PACKAGES är
          // tom så detta resulterar i tom array idag. Legacy gen-paket-ids
          // strippas nedanför.
          enabledHostPackages: data.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id),
          // Per-source categories — default all 3 (safe fallback).
          youtubeEnabledCategories:
            data.youtubeEnabledCategories && data.youtubeEnabledCategories.length > 0
              ? data.youtubeEnabledCategories
              : defaultEnabledMainCategories(),
          imagesEnabledCategories:
            data.imagesEnabledCategories && data.imagesEnabledCategories.length > 0
              ? data.imagesEnabledCategories
              : defaultEnabledMainCategories(),
        };
        // Strippa eventuellt kvarvarande gen-paket-id:n (pkg-gen-elder,
        // pkg-gen-x, etc.) ur enabledHostPackages — gen-paket-konceptet
        // togs bort 2026-05-27. Idempotent: ingen-op när inga gen-ids finns.
        const LEGACY_GEN_PKG_IDS = ['pkg-gen-elder', 'pkg-gen-x', 'pkg-gen-millennials', 'pkg-gen-z', 'pkg-gen-alpha'];
        const strippedPackages = (augmented.enabledHostPackages ?? []).filter(
          (id) => !LEGACY_GEN_PKG_IDS.includes(id),
        );
        const packagesChanged =
          data.enabledHostPackages == null ||
          strippedPackages.length !== (data.enabledHostPackages?.length ?? 0) ||
          strippedPackages.some((id, i) => id !== data.enabledHostPackages![i]);
        augmented.enabledHostPackages = strippedPackages;
        const wasIncomplete = (
          data.birthYear == null ||
          data.assistance == null ||
          // null ELLER non-sweden → coerce-write krävs (v1 Sweden-only)
          data.region !== 'sweden' ||
          data.gameEraFrom == null ||
          data.gameEraTo == null ||
          data.maxPlayers == null ||
          data.gameMode == null ||
          data.singlePlayerDefault !== false ||
          data.roundsDefault == null ||
          data.answerResponseSeconds == null ||
          packagesChanged ||
          !data.youtubeEnabledCategories || data.youtubeEnabledCategories.length === 0 ||
          !data.imagesEnabledCategories || data.imagesEnabledCategories.length === 0
        );
        if (wasIncomplete) {
          saveProfile(augmented).catch(() => { /* silent — vyn fungerar ändå */ });
        }
        setPlayerName(augmented.playerName);
        setEmail(augmented.email ?? '');
        setBirthYear(augmented.birthYear);
        setAssistance(augmented.assistance);
        setRegion(augmented.region);
        setSource(augmented.avatarSource);
        setSelectedId(augmented.selectedAvatarId);
        setGameCredits(augmented.gameCredits ?? 0);
        setFreeGameCredits(augmented.freeGameCredits ?? 0);
        setLastFreeCreditsRefreshDate(augmented.lastFreeCreditsRefreshDate);
        setAnswerResponseSeconds(augmented.answerResponseSeconds ?? 30);
        // Clamp till nuvarande slider-range + regler: to-året golvas till
        // ERA_TO_MIN (1980) och from till [ERA_MIN, to - ERA_MIN_INTERVAL] så
        // gamla profiler (sparade när golvet/intervallet var lägre) hamnar i
        // ett giltigt läge istället för att box/thumb hamnar i otillåtet spann.
        {
          const clampTo = Math.max(ERA_TO_MIN, Math.min(ERA_MAX, augmented.gameEraTo ?? ERA_MAX));
          const clampFrom = Math.max(ERA_MIN, Math.min(augmented.gameEraFrom ?? 1981, clampTo - ERA_MIN_INTERVAL));
          setEraValues([clampFrom, clampTo]);
        }
        setMaxPlayers(augmented.maxPlayers ?? 4);
        // Stale-coerce: 'remote-1v1' kan ligga sparad som host-default från
        // innan Remote-rutan togs bort (2026-08-07 — 1vs1 väljs numera per
        // spel via Home-valet, inte som profil-default). Utan coerce skulle
        // profilen fastna i ett läge utan synlig/valbar ruta.
        const loadedGameMode =
          (augmented.gameMode ?? 'pass-the-phone') === 'remote-1v1'
            ? 'pass-the-phone'
            : augmented.gameMode ?? 'pass-the-phone';
        setGameMode(loadedGameMode);
        // Clamp så ett gammalt värde > nuvarande max (t.ex. om host har 12
        // rundor sparat från Individual Devices + Premium men nu saknar Premium)
        // inte hamnar utanför range:n. initialMax tar hänsyn till BÅDE läge OCH
        // premium-status (hasPremium kan ha laddats av den parallella async-grenen
        // redan — om inte hanterar useEffect([roundsCount, roundsMax]) clampen).
        const savedRounds = augmented.roundsDefault ?? ROUNDS_DEFAULT;
        const isIndivPremium =
          hasPremium &&
          (augmented.gameMode ?? 'pass-the-phone') === 'individual-devices';
        const initialMax = isIndivPremium ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
        setRoundsCount(Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds)));
        setEnabledHostPackages(augmented.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id));
        setYoutubeEnabledCategories(augmented.youtubeEnabledCategories ?? defaultEnabledMainCategories());
        setImagesEnabledCategories(augmented.imagesEnabledCategories ?? defaultEnabledMainCategories());
        setSpotifyEnabled(augmented.spotifyDefaultEnabled ?? false);
        setSpotifyAnswerYear(augmented.spotifyAnswerYear ?? true);
        setSpotifyAnswerName(augmented.spotifyAnswerName ?? true);
        // Snapshot av laddad state — jämförs vid navigation bort.
        // gameMode speglar den COERCADE staten (inte rå augmented) så en
        // stale 'remote-1v1'-profil inte fastnar i evig "unsaved changes".
        savedSnapshotRef.current = JSON.stringify({
          birthYear: augmented.birthYear,
          assistance: augmented.assistance,
          gameEraFrom: augmented.gameEraFrom ?? 1981,
          gameEraTo: augmented.gameEraTo ?? ERA_MAX,
          gameMode: loadedGameMode,
          maxPlayers: augmented.maxPlayers ?? 4,
          roundsCount: Math.max(ROUNDS_MIN, Math.min(
            // Bara IndDev får 20-cappen — PtP OCH Remote 1v1 är max 4.
            (augmented.gameMode ?? 'pass-the-phone') === 'individual-devices' ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS,
            augmented.roundsDefault ?? ROUNDS_DEFAULT,
          )),
          answerResponseSeconds: augmented.answerResponseSeconds ?? 30,
          youtubeEnabledCategories: augmented.youtubeEnabledCategories ?? defaultEnabledMainCategories(),
          imagesEnabledCategories: augmented.imagesEnabledCategories ?? defaultEnabledMainCategories(),
          enabledHostPackages: augmented.enabledHostPackages ?? [],
        });
      });
      loadFriends().then((list) => {
        if (active) setFriends(list);
      });
      // Spotify self-attest + DJ-defaults — läses från profilen (Plan B:
      // ingen OAuth-status att slå upp; spotifyAppConfirmed är källan).
      //
      // MEDVETET ingen install-verifiering här (till skillnad från lobby-
      // joinen): Profile-toggeln visar användarens SPARADE AVSIKT, lobby-
      // raden visar verifierat nuläge. Nedgraderade vi vid load skulle ett
      // efterföljande "Save Host settings" tyst radera avsikten. Checken
      // körs i stället när användaren aktivt slår PÅ toggeln
      // (handleToggleSpotifyUser) och vid lobby-join/Start Game.
      loadProfile().then((p) => {
        if (!active) return;
        const attested = p?.spotifyAppConfirmed ?? false;
        setSpotifyConnected(attested);
        setSpotifyEnabled(attested ? (p?.spotifyDefaultEnabled ?? false) : false);
        setSpotifyAnswerYear(p?.spotifyAnswerYear ?? true);
        setSpotifyAnswerName(p?.spotifyAnswerName ?? true);
      }).catch(() => {});
      // Subscription-status — speglar Lobby:s hasPremium-source. Load:as på
      // focus så Store-köp (subscription / unsubscribe) reflektar direkt
      // i Profile utan delay.
      hasPremiumSubscription().then((value) => {
        if (active) setHasPremium(value);
      });
      return () => { active = false; };
    }, []),
  );

  // Scroll till toppen när skärmen entras med scrollToTop=1 i route-paramen
  // (t.ex. via Home:s TopUserBanner → "Profile settings"-knapp). Tab-navigatorn
  // bevarar annars senaste scroll-position. router.setParams rensar paramen
  // efter scroll så efterföljande tab-byten utan param inte trigggar scroll.
  useFocusEffect(
    useCallback(() => {
      if (localParams.scrollToTop === '1') {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        router.setParams({ scrollToTop: undefined });
      }
    }, [localParams.scrollToTop]),
  );

  // Speglar Lobby:s handleAddFriendFromShare — `playerNameExists` verifierar
  // FÖRST att namnet tillhör en registrerad QuizVibe-user innan det sparas.
  const handleAddFriend = async () => {
    const trimmed = normalizePlayerName(newFriendPlayerName.trim());
    if (!trimmed || addFriendChecking) return;
    setAddFriendError(null);
    setAddFriendChecking(true);
    try {
      const exists = await playerNameExists(trimmed);
      if (!exists) {
        setAddFriendError('No QuizVibe user found with that Player Name');
        return;
      }
      const updated = await addFriend(trimmed);
      setFriends(updated);
      setNewFriendPlayerName('');
      setAddFriendKbMode('letter');
    } finally {
      setAddFriendChecking(false);
    }
  };

  // CodeKeyboard-handlers för Add-by-Player-Name-fältet — identiska med
  // Lobby:s handleAddFriendKeyPress/Backspace/toggleAddFriendKbMode.
  const handleAddFriendKeyPress = (char: string) => {
    setNewFriendPlayerName((prev) =>
      addFriendKbMode === 'letter' ? appendPlayerNameLetter(prev, char) : appendPlayerNameDigit(prev, char),
    );
    if (addFriendError) setAddFriendError(null);
  };

  const handleAddFriendBackspace = () => {
    setNewFriendPlayerName((prev) =>
      addFriendKbMode === 'letter' ? backspacePlayerNameLetters(prev) : backspacePlayerNameDigits(prev),
    );
    if (addFriendError) setAddFriendError(null);
  };

  const toggleAddFriendKbMode = () => {
    if (newFriendPlayerName.length === 0 && addFriendKbMode === 'letter') return;
    if (addFriendKbMode === 'letter') {
      setAddFriendKbMode('digit');
      addFriendDigitsRef.current?.focus();
    } else {
      setAddFriendKbMode('letter');
      addFriendLettersRef.current?.focus();
    }
  };

  // "Cancel" på CodeKeyboard:et (2026-08-27) — speglar Lobby:s
  // handleAddFriendCancel. "Done" längst ner i modalen stänger HELA Friends-
  // vyn (mer än vad man vill vid en avbruten inmatning); Cancel tömmer bara
  // det pågående namnet och stänger tangentbordet, modalen är kvar öppen.
  const handleAddFriendCancel = () => {
    setNewFriendPlayerName('');
    setAddFriendKbMode('letter');
    setAddFriendError(null);
    addFriendLettersRef.current?.blur();
    addFriendDigitsRef.current?.blur();
    setAddFriendFocused(false);
  };

  const handleRemoveFriend = async (id: string) => {
    const updated = await removeFriend(id);
    setFriends(updated);
  };

  // Bulk-delete (2026-08-27) — ersätter den tidigare instant-"×" i "+ Add
  // QuizVibe Friends"-modalen. Confirm-Alert speglar Lobby:s
  // handleDeletePlayer-mönster (Cancel + destructive Delete). Sekventiella
  // removeFriend-anrop är säkra — varje call slutför sitt egna
  // loadFriends→filter→saveFriends-varv innan nästa startar.
  const handleDeleteSelectedFriends = () => {
    const count = selectedFriendIds.size;
    if (count === 0) return;
    Alert.alert(
      count === 1 ? 'Remove friend' : 'Remove friends',
      `Are you sure you want to delete ${count} friend${count > 1 ? 's' : ''} from your QuizVibe friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let updated = friends;
            for (const id of selectedFriendIds) {
              updated = await removeFriend(id);
            }
            setFriends(updated);
            setSelectedFriendIds(new Set());
          },
        },
      ],
    );
  };

  const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId);
  const age = birthYear !== null ? CURRENT_YEAR - birthYear : null;
  const assistanceLabel  = ASSISTANCE_OPTIONS.find((s) => s.id === assistance)?.label;
  const regionLabel = REGION_OPTIONS.find((r) => r.id === region)?.label;
  const answerResponseLabel = ANSWER_RESPONSE_OPTIONS.find(
    (o) => o.id === answerResponseSeconds,
  )?.label;

  const handleSave = async (section: 'defaults' | 'host' | 'packages') => {
    // Spotify DJ kräver Individual Devices-läge — blockera om Spotify är på
    // men mode-valet inte är IndDev.
    if (spotifyEnabled && gameMode !== 'individual-devices') {
      Alert.alert(
        'Spotify requires Individual Devices',
        'Spotify DJ mode is only available in Individual Devices mode. Please change the Game Mode or turn off Spotify.',
      );
      return;
    }
    try {
      await saveProfile({
        playerName,
        birthYear,
        assistance,
        region,
        avatarSource: source,
        selectedAvatarId,
        gameCredits,
        freeGameCredits,
        // Bevara senaste refresh-datum så loadProfile inte top-up:ar
        // freeGameCredits till FREE_CREDITS_DAILY_CAP en gång till samma dag.
        lastFreeCreditsRefreshDate,
        answerResponseSeconds,
        gameEraFrom: eraValues[0],
        gameEraTo: eraValues[1],
        maxPlayers,
        gameMode,
        // Explicit false — Single player är inte längre en host-default, och
        // utan skrivningen ligger ett stale `true` kvar i loadProfile:s
        // cache-merge (profileStorage.ts).
        singlePlayerDefault: false,
        roundsDefault: roundsCount,
        enabledHostPackages,
        youtubeEnabledCategories,
        imagesEnabledCategories,
        spotifyDefaultEnabled: spotifyEnabled,
        spotifyAnswerYear,
        spotifyAnswerName,
        spotifyAppConfirmed: spotifyConnected,
      });
      savedSnapshotRef.current = JSON.stringify({
        birthYear, assistance,
        gameEraFrom: eraValues[0], gameEraTo: eraValues[1],
        gameMode, maxPlayers, roundsCount,
        answerResponseSeconds, youtubeEnabledCategories,
        imagesEnabledCategories, enabledHostPackages,
      });
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 2000);
    } catch {
      // TODO: visa felmeddelande till användaren om spara misslyckas
    }
  };

  // Jämför aktuell state mot load-snapshot — true om något ändrats.
  const hasUnsavedChanges = (): boolean => {
    const current = JSON.stringify({
      birthYear, assistance,
      gameEraFrom: eraValues[0], gameEraTo: eraValues[1],
      gameMode, maxPlayers, roundsCount,
      answerResponseSeconds, youtubeEnabledCategories,
      imagesEnabledCategories, enabledHostPackages,
    });
    return current !== savedSnapshotRef.current;
  };

  // Interceptar navigation bort från Profile med osparade ändringar.
  const guardedNavigate = (navigateFn: () => void) => {
    if (!hasUnsavedChanges()) {
      navigateFn();
      return;
    }
    Alert.alert(
      'Unsaved changes',
      'Do you want to save your changes before leaving?',
      [
        {
          text: "Don't save",
          style: 'destructive',
          onPress: () => navigateFn(),
        },
        {
          text: 'Save',
          onPress: async () => {
            await handleSave('defaults');
            await handleSave('host');
            navigateFn();
          },
        },
        { text: 'Stay', style: 'cancel' },
      ],
    );
  };

  // Tap på Host Game Credits-pillen. Utan prenumeration frågar vi först —
  // pillen sitter i headern och nås lätt av misstag. Med prenumeration finns
  // inget att sälja, så då är tappet en ren genväg till Store. Speglar Lobby;
  // ändra alltid båda. guardedNavigate ligger utanpå så osparade profil-
  // ändringar fortfarande fångas på vägen ut (Profile-specifikt).
  const goToStoreFromCredits = () => {
    guardedNavigate(() => router.push('/store?focus=subscription&from=/profile'));
  };

  const handleCreditsPillPress = () => {
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
  };

  const previewCaption =
    source === 'upload'  ? 'Custom photo'
    : source === 'default' ? 'Default image'
    : `${selectedAvatar?.category ?? ''} avatar`;

  // Logout-flow via TopUserBanner-pillen. Speglar Home-skärmens
  // profileMenu (header med avatar+playerName+"Logged in"-status, röd
  // Log out-knapp, Cancel) — samma visuella behandling så användaren
  // får konsistent UX oavsett varifrån de loggar ut.
  const handleConfirmLogout = async () => {
    // supabase.auth.signOut() MÅSTE köras innan clearProfile() — annars
    // lever Supabase-sessionen vidare i AsyncStorage även när profil-cachen
    // är borta. Konsekvensen är att efterföljande supabase.functions.invoke()
    // skickar en stale JWT (förmodlig orsak till delete-account-bugen som
    // dök upp 2026-05-23). Speglar Home-skärmens handleLogout-pattern.
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[ProfileScreen] supabase.auth.signOut failed:', err);
    }
    await clearProfile();
    track('user_logged_out');
    resetIdentity();
    setLogoutModalVisible(false);
    router.replace('/');
  };

  // Permanent account deletion — Apple App Store Guideline 5.1.1(v)
  // kräver in-app deletion för apps med kontoflow. Två-stegs confirmation
  // för att skydda mot oavsiktlig deletion (knapp + Alert).
  //
  // deleteAccount() i utils/auth.ts:
  //   1. Anropar Edge Function 'delete-account' → CASCADE rensar
  //      profiles + rooms + waiting_invites server-side.
  //   2. Nuke:ar lokal AsyncStorage under @quizvibe/*-prefix.
  //   3. supabase.auth.signOut() rensar session-token.
  //
  // Vid success: analytics + navigation hem. Vid fel: visa felmeddelande,
  // user kan försöka igen (state är intakt, deletion är idempotent
  // server-side eftersom CASCADE bara körs om user faktiskt fanns).
  const handleConfirmDeleteAccount = async () => {
    setDeletingAccount(true);
    const result = await deleteAccount();
    setDeletingAccount(false);

    if (!result.ok) {
      Alert.alert(
        'Could not delete account',
        `Something went wrong (${result.reason}). Please try again, or email info@quizvibe.se if the problem persists.`,
      );
      return;
    }

    track('user_account_deleted');
    resetIdentity();
    setLogoutModalVisible(false);
    router.replace('/');
  };

  // Wrapper som visar två-stegs confirmation FÖRE deletion. Tydlig copy
  // om irreversibilitet — Apple-review tittar specifikt efter att flödet
  // inte är "oavsiktligt destruktivt".
  const handleRequestDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your QuizVibe account and all associated data — profile, game history, friends, and any active subscriptions. This cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: handleConfirmDeleteAccount,
        },
      ],
    );
  };

  // Create Game-genväg från logout-sheet:n. Identisk logik som Home-
  // skärmens handleCreateGame — credit-gate först (Out of Host Game
  // Credits-popup om Free = 0 och user inte har Premium; engångsköpta
  // Extras borttagna 2026-07-07), sedan generera kod, registrera rum,
  // rensa stale mock-stores, tracka event och navigera till /lobby.
  // Inlinad här istället för delad utility tills en tredje call-site
  // dyker upp (då lyfter vi till en delad helper i src/utils/).
  const handleCreateGame = async () => {
    const [freshProfile, freshHasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    if (!freshHasPremium) {
      const free = freshProfile?.freeGameCredits ?? 0;
      if (free === 0) {
        Alert.alert(
          'Out of Host Game Credits',
          'You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium for unlimited host games.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
          ],
        );
        return;
      }
    }
    const code = generateRoomCode();
    // Returvärdet MÅSTE kontrolleras — en tyst no-op ger en fantom-lobby
    // som joiners inte hittar ("Room not found"-buggen 2026-08-07).
    const roomRegistered = await registerActiveRoom(code, {
      maxPlayers: freshProfile?.maxPlayers ?? 4,
      hostIsPremium: freshHasPremium,
      currentPlayerCount: 1,
      hostPlayerName: freshProfile?.playerName ?? '',
      gameStarted: false,
      // Profile:s Create Game-genväg skapar alltid en standard-lobby;
      // Remote 1vs1 väljs bara via Home:s HostTypeOptions-utfällning.
      isRemote1v1: false,
    });
    if (!roomRegistered) {
      Alert.alert(
        'Could not create game lobby',
        'The room could not be registered. Check your connection and that you are signed in, then try again.',
      );
      return;
    }
    clearLeftPlayers(code);
    clearLobbyPlayers(code);
    clearLobbySettings(code);
    clearEjected(code);
    clearGameStarted(code);
    track('room_code_created');
    setLogoutModalVisible(false);
    router.push({ pathname: '/lobby', params: { code, isHost: 'true' } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top board (login status) — sticky utanför ScrollView. Klick på
          pillen öppnar logout-modalen (samma visuella sheet som Home-
          skärmens profileMenu). Bannern self-loadar profil via
          useFocusEffect så den uppdateras när vi navigerar tillbaka efter
          login/edit på andra skärmar. */}
      <TopUserBanner
        onPress={() => setLogoutModalVisible(true)}
        onBackPress={() => guardedNavigate(() => router.replace('/'))}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.screenTitle}>Profile</Text>
            <Text style={styles.screenSubtitle}>QuizVibe settings</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.creditsPill,
              hasPremium && styles.creditsPillMembership,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleCreditsPillPress}
          >
            {/* Badgen renderas ALLTID — guld när prenumerationen är aktiv,
                grå när den inte är det (samma lås-signal som Max 12-rutan och
                Rounds-rulern). Speglar Lobby. */}
            <View style={styles.creditsMembershipBadgeWrap} pointerEvents="none">
              <View style={[styles.creditsMembershipBadge, !hasPremium && styles.creditsMembershipBadgeGrey]}>
                <Text style={[styles.creditsMembershipBadgeText, !hasPremium && styles.creditsMembershipBadgeTextGrey]}>PREMIUM</Text>
              </View>
            </View>
            {/* 2 rader — labeln wrappar i stället för att kapas när pillen är
                trång (Display Zoom / stor Dynamic Type). Speglar Lobby. */}
            <Text style={styles.creditsLabel} numberOfLines={2} ellipsizeMode="tail">Host Game Credits</Text>
            {/* Extras-rutan borttagen 2026-07-07 — engångsköpta credits finns
                inte längre (V1 säljer enbart Premium-abonnemang). Pillen
                visar Free-saldot för gratis-hosts; Premium-hosts drar aldrig
                credits (handleStartGame skippar deduktionen) så saldot är
                irrelevant för dem — de får "Unlimited" i guld i stället.
                Speglar Lobby 1:1. */}
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
        </View>

        {/* ── Profile default settings (kollapsbar gruppering) ─── */}
        <Pressable
          onPress={() => setProfileDefaultsExpanded(!profileDefaultsExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <View style={styles.sectionHeaderIcon}>
            <QuizVibeQAvatar size={28} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Profile default settings</Text>
          <View style={styles.gameConnectionsToggleBox}>
            <Text style={styles.gameConnectionsChevron}>
              {profileDefaultsExpanded ? '−' : '+'}
            </Text>
          </View>
        </Pressable>
        {!profileDefaultsExpanded && <View style={styles.sectionDivider} />}

        {profileDefaultsExpanded && (
        <>
        {/* ── Profile card: avatar + playerName (vänster), competition setup (höger), Save längst ner */}
        {/* TODO (backend): PlayerName måste vara unikt i Quizvibe — lägg till
            en check mot backend när användaren sparar (eller on-blur), så att
            samma playerName inte kan registreras av flera profiler. Används
            senare för vän-sökning. */}
        <View style={styles.preview}>
          <View style={styles.columnsRow}>
          {/* Vänsterkolumn: avatar + playerName under */}
          <View style={styles.leftColumn}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Avatar
                emoji={source === 'default' ? undefined : selectedAvatar?.emoji}
                useBrandFallback={source === 'default'}
                size={96}
              />
              <View style={styles.changeBadge} pointerEvents="none">
                <Text style={styles.changeBadgeText}>Change</Text>
              </View>
            </Pressable>

            {/* Player Name är read-only i profil-kortet — sätts vid
                registrering och kan inte redigeras härifrån. */}
            <Text style={styles.playerNameDisplay} numberOfLines={1}>
              {playerName}
            </Text>
          </View>

          {/* Högerkolumn: competition setup */}
          <View style={styles.rightColumn}>
            <Text style={styles.setupHeader}>
              User default settings
            </Text>

            {/* Competition Year of birth */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Competition Year of birth</Text>
              <Pressable
                onPress={() => setYearPickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    birthYear === null && styles.selectorPlaceholder,
                  ]}
                >
                  {birthYear !== null ? formatBirthYear(birthYear) : 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>

            {/* Competition Age (auto-beräknad, icke-tappbar). Värdet
                visas inline till höger om labeln så raden inte tar mer
                vertikal yta än gap-en till intilliggande fält. */}
            <View style={styles.ageRow}>
              <Text style={styles.fieldLabel}>Competition Age</Text>
              <Text
                style={[
                  styles.ageValue,
                  age === null && styles.selectorPlaceholder,
                ]}
              >
                {age ?? '—'}
              </Text>
            </View>

            {/* Assistance level */}
            <View style={styles.field}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.fieldLabel}>Assistance level</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Alert.alert(
                    'Assistance level',
                    'Full\n5-year answer window for Year questions. Full Name list — no letter prefix puzzle.\n\nStandard\n3-year answer window for Year questions. 2-letter prefix hint in Name questions.\n\nMinimal\nExact year required for Year questions. 1-letter prefix hint in Name questions (hardest).',
                  )}
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => setAssistancePickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    assistance === null && styles.selectorPlaceholder,
                  ]}
                >
                  {assistanceLabel ?? 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>

          </View>
          </View>

          {/* ── Save (inuti kortet) ─────────────────────────────── */}
          <Button
            label={savedSection === 'defaults' ? '✓ Saved' : 'Save Profile'}
            onPress={() => handleSave('defaults')}
            variant={savedSection === 'defaults' ? 'secondary' : 'primary'}
          />
        </View>
        </>
        )}

        {/* ── Host default settings (kollapsbar gruppering) ─────
            Game Mode → Region scope + Answer response → Game era →
            Number of Rounds. Number of Players-toggle:n togs bort
            2026-05-25 — maxPlayers deriveras nu från gameMode (PtP=4,
            IndDev=12) via auto-sync useEffect. Egen top-level sektion
            mellan Profile defaults och Game connections; samma
            kollapsbara mönster (+/− toggle, sectionDivider när
            kollapsad) som de övriga top-level rubrikerna. */}
        <Pressable
          onPress={() => setHostDefaultsExpanded(!hostDefaultsExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          {/* Blå krona-silhuett (Colors.primary) — matchar blå-temat. */}
          <View style={styles.sectionHeaderIcon}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M5 16L3 6l5 4 4-6 4 6 5-4-2 10H5zm0 2h14v2H5v-2z" fill={Colors.primary} />
            </Svg>
          </View>
          <Text style={styles.gameConnectionsHeader}>Host default settings</Text>
          <View style={styles.gameConnectionsToggleBox}>
            <Text style={styles.gameConnectionsChevron}>
              {hostDefaultsExpanded ? '−' : '+'}
            </Text>
          </View>
        </Pressable>
        {!hostDefaultsExpanded && <View style={styles.sectionDivider} />}

        {hostDefaultsExpanded && (
        <>
        <View style={styles.preview}>
          {/* ── Game Mode (host-default) ─────────────────────────
              Pass-the-Phone (gratis) vs Individual Devices (Premium).
              Speglar Lobby:s Game Mode-toggle exakt — grön aktiv för
              Pass-the-Phone (free), guld aktiv för Individual Devices
              (premium-läge). Försök att välja Individual Devices utan
              Premium triggar Store-omdirigering. */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Multiplayer Game Mode</Text>
            {/* Två rutor i EN rad + bracket-etikett undertill — speglar Lobby.
                Single player och Remote (1vs1) är INTE host-defaults: de väljs
                per spel via "Start New Game" på Home (2026-08-26). ⚠ Flex-talet
                på bracket-raden MÅSTE spegla antalet rutor ovanför. */}
            <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
              {renderModeBox('ptp', 'Pass-the-Phone', true)}
              {renderModeBox('indiv', 'Individual device', true)}
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: 2 }}>
              {/* Bracket under "Pass-the-Phone" + "Individual device" —
                  flex:1 så den spänner över hela raden (båda rutorna). */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.multiplayerBracket} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <Text style={styles.multiplayerBracketLabel}>Multiplayer</Text>
                  <Pressable
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                    onPress={() =>
                      Alert.alert(
                        'Multiplayer mode',
                        'This is your default for Multiplayer games.\n\nPass-the-Phone: All players share one device. Max 4 players, even with Premium. Spotify not applicable for PtP mode.\n\nIndividual device: Each player uses their own device. Max 4 players on Basic, max 12 players with Premium.\n\nSingle player and Remote 1vs1 are picked per game on the Home screen — tap Start New Game and choose "Single Game" or "Remote Play".',
                      )
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Players — max antal spelare (Max 4 gratis / Max 12 Premium). */}
            <View style={styles.playersLabelRow}>
              <Text style={[styles.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>Players</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Players', 'Max 4 players - use as standard and applicable for all Single and Multiplayer modes.\n\nMax 12 players - only applicable with Individual device mode.')}
                hitSlop={8}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
            </View>
            {/* "2 players (1vs1)"-indikatorn borttagen 2026-08-07 — remote är
                inte längre en profil-default (stale-coerce vid load garanterar
                att gameMode aldrig är 'remote-1v1' här). */}
            <View style={styles.modeRow}>
              {/* Max 4: aktiv (grön) när maxPlayers===4. Disabled enbart när
                  premium-host valt IndDev (auto-upgrades till Max 12 redan). */}
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  maxPlayers === 4 ? styles.modeOptionPassActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                  hasPremium && gameMode === 'individual-devices' && { opacity: 0.45 },
                ]}
                onPress={() => handleSelectMaxPlayers(4)}
                disabled={hasPremium && gameMode === 'individual-devices'}
              >
                <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 4 && styles.modeLabelActiveFree]}>
                  Max 4 players
                </Text>
                <View style={[styles.freeBadge, maxPlayers !== 4 && styles.freeBadgeDimmed]} pointerEvents="none">
                  <Text style={[styles.freeBadgeText, maxPlayers !== 4 && styles.freeBadgeTextDimmed]}>FREE</Text>
                </View>
              </Pressable>
              {/* Max 12: aktiv (guld) när maxPlayers===12. Badge grå/guld per premium-status. */}
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  maxPlayers === 12 ? styles.modeOptionPremiumActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectMaxPlayers(12)}
              >
                <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 12 && styles.modeLabelActivePremium]}>
                  Max 12 players
                </Text>
                <View style={[styles.premiumBadge, !hasPremium && styles.premiumBadgeGrey]} pointerEvents="none">
                  <Text style={[styles.premiumBadgeText, !hasPremium && styles.premiumBadgeTextGrey]}>PREMIUM</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Region scope — samma regionTrigger-stil som i Lobby + info-ikon. */}
          <View style={styles.field}>
            <View style={styles.regionLabelRow}>
              <Text style={styles.sectionLabel}>Region scope</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Region Scope', "Recognition context — the region the questions are drawn from and whose audience the recognition level is based on. Players get content that's familiar in the chosen region.")}
                hitSlop={8}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
            </View>
            <TouchableOpacity
              style={styles.regionTrigger}
              activeOpacity={0.7}
              onPress={() => setRegionPickerOpen(true)}
            >
              <Text style={{ fontSize: 18 }}>{region ? REGION_FLAGS[region] ?? '' : ''}</Text>
              <Text style={styles.regionTriggerText}>{regionLabel ?? 'Select'}</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>⌄</Text>
            </TouchableOpacity>
          </View>

          {/* Source Dashboard */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>SOURCE MIXERBOARD</Text>
            {/* Spotify DJ-rad — alltid synlig, tillgänglig om konto kopplat */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm, marginBottom: Spacing.xs, paddingBottom: spotifyEnabled ? 6 : 0 }}>
            <View style={[styles.spotifyDJRow, { backgroundColor: undefined, borderRadius: undefined, marginBottom: 0 }]}>
              <View style={[styles.connectionIconWrap, { alignSelf: 'flex-start', marginTop: 1, marginLeft: -2 }]}>
                <SpotifyBrandIcon size={22} variant="white" />
              </View>
              <View style={{ flex: 1, alignSelf: 'flex-start', marginTop: 6, marginLeft: -8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.connectionLabel, { minWidth: 0 }]}>Spotify</Text>
                  <Pressable
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => Alert.alert('Spotify', '• Only applicable in Individual Devices mode\n\n• For Spotify music, one player at a time (the DJ) will be directed via QuizVibe to Spotify\n\n• The DJ needs the Spotify app on their device — free or Premium', [
                      { text: 'Guide How it works', onPress: () => setSpotifyGuideVisible(true) },
                      { text: 'Close', style: 'cancel' },
                    ])}
                    hitSlop={8}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
                {/* Self-attest "Spotify user"-toggle (Plan B 2026-07-22) — ersätter
                    OAuth-connect. Default AV; gated DJ-defaulten till höger. */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <Text style={spotifyConnected ? styles.spotifyConnectedLabel : styles.spotifyNoConnectionLabel}>
                    Spotify user
                  </Text>
                  <Switch
                    value={spotifyConnected}
                    onValueChange={handleToggleSpotifyUser}
                    trackColor={{ false: '#3C3C3C', true: '#1DB954' }}
                    thumbColor="#FFF"
                    ios_backgroundColor={spotifyConnected ? '#1DB954' : '#3C3C3C'}
                    style={styles.sourceMatrixSwitch}
                  />
                </View>
                {/* Guide-länken nås via info-ikonens popup ("Guide How it
                    works"-knappen) — inline-länken borttagen 2026-08-06. */}
              </View>
              {/* Toggle — disabled när ej kopplat */}
              <View style={[styles.spotifyHostControls, { marginRight: -16, alignSelf: 'flex-start', marginTop: 1 }]}>
                <Switch
                  value={spotifyConnected && spotifyEnabled}
                  onValueChange={spotifyConnected ? handleToggleSpotifyEnabled : undefined}
                  disabled={!spotifyConnected}
                  trackColor={{ false: '#3C3C3C', true: '#1DB954' }}
                  thumbColor={spotifyConnected ? '#FFF' : '#888'}
                  ios_backgroundColor={spotifyConnected && spotifyEnabled ? '#1DB954' : '#3C3C3C'}
                  style={[styles.sourceMatrixSwitch, !spotifyConnected && { opacity: 0.4 }]}
                />
              </View>
            </View>
            {spotifyEnabled && (
              // paddingLeft: 34 = samma x som "Spotify"-rubriken ovanför
              // (speglar Lobbys Type:-rad).
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 34, paddingRight: 18, paddingTop: 2, paddingBottom: 2 }}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Type:</Text>
                <View style={{ marginLeft: 'auto', marginRight: -16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Year</Text>
                    <Switch
                      value={spotifyAnswerYear}
                      onValueChange={(v) => {
                        if (!v && !spotifyAnswerName) {
                          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
                          return;
                        }
                        setSpotifyAnswerYear(v);
                      }}
                      trackColor={{ false: Colors.error, true: Colors.success }}
                      thumbColor="#FFF"
                      ios_backgroundColor={spotifyAnswerYear ? Colors.success : Colors.error}
                      style={styles.sourceMatrixSwitch}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary }}>Name</Text>
                    <Switch
                      value={spotifyAnswerName}
                      onValueChange={(v) => {
                        if (!v && !spotifyAnswerYear) {
                          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
                          return;
                        }
                        setSpotifyAnswerName(v);
                      }}
                      trackColor={{ false: Colors.error, true: Colors.success }}
                      thumbColor="#FFF"
                      ios_backgroundColor={spotifyAnswerName ? Colors.success : Colors.error}
                      style={styles.sourceMatrixSwitch}
                    />
                  </View>
                </View>
              </View>
            )}
            </View>
            <View
              style={styles.smGrid}
              onLayout={(e) => {
                const w = Math.round((e.nativeEvent.layout.width - 112) / 3);
                if (w > 0 && w !== smColWidth) setSmColWidth(w);
              }}
            >

              {/* Etikett-stack */}
              <View style={styles.smLabelStack}>
                <View style={[styles.smHeaderCell, styles.smDataShift]}>
                  <Text style={styles.sourceMatrixAllText}>All</Text>
                </View>
                <View style={[styles.smAllToggleCell, { paddingLeft: 29, borderTopLeftRadius: Radius.sm, borderBottomLeftRadius: Radius.sm }]}>
                  <Switch
                    value={sourcesAllEnabled}
                    onValueChange={handleToggleAllSources}
                    trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }}
                    thumbColor="#FFF"
                    ios_backgroundColor={sourcesAllEnabled ? Colors.success : PROFILE_MATRIX_OFF}
                    style={styles.profileSwitch}
                  />
                </View>
                <View style={styles.smLabelSourceCell}>
                  <YouTubeBrandIcon size={20} />
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
                    <Svg width={20} height={20} viewBox="24 22 32 32">
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

              {/* Artists kolumn */}
              <View style={styles.smDataStack}>
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Music</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={artistsAllOn} onValueChange={handleToggleArtistsColumn} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={artistsAllOn ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={youtubeEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsYoutube} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Music') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsGuessWho} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Music') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
              </View>

              {/* Actors kolumn */}
              <View style={[styles.smDataStack, styles.sourceMatrixColSep]}>
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Film</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={actorsAllOn} onValueChange={handleToggleActorsColumn} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={actorsAllOn ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={youtubeEnabledCategories.includes('Film')} onValueChange={handleToggleActorsYoutube} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Film') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle, { paddingRight: 0 }]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Film')} onValueChange={handleToggleActorsGuessWho} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Film') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
              </View>

              {/* Athletes kolumn */}
              <View style={[styles.smDataStack, styles.sourceMatrixColSep]}>
                <View style={[styles.smHeaderCell, smCellStyle]}>
                  <Text style={styles.sourceMatrixHeaderText}>Sport</Text>
                </View>
                <View style={[styles.smAllToggleCell, smCellStyle, styles.smDataShift, { borderTopRightRadius: Radius.sm, borderBottomRightRadius: Radius.sm }]}>
                  <Switch value={athletesAllOn} onValueChange={handleToggleAthletesColumn} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={athletesAllOn ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={youtubeEnabledCategories.includes('Sport')} onValueChange={handleToggleAthletesYoutube} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={youtubeEnabledCategories.includes('Sport') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
                <View style={[styles.smAutoCell, smCellStyle, { paddingRight: 0 }]} />
                <View style={[styles.smSwitchCell, smCellStyle, styles.smDataShift]}>
                  <Switch value={imagesEnabledCategories.includes('Sport')} onValueChange={handleToggleAthletesGuessWho} trackColor={{ false: PROFILE_MATRIX_OFF, true: Colors.success }} thumbColor="#FFF" ios_backgroundColor={imagesEnabledCategories.includes('Sport') ? Colors.success : PROFILE_MATRIX_OFF} style={styles.profileSwitch} />
                </View>
              </View>

            </View>

          </View>

          {/* Game era — adjustable år-spann för frågor. */}
          <View style={styles.field}>
            <View style={styles.regionLabelRow}>
              <Text style={styles.sectionLabel}>Game era (min 15 year interval)</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Game Era', 'Set the time span for questions')}
                hitSlop={8}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
            </View>
            <View style={styles.eraGuestBoxWrap}>
              <View style={styles.eraGuestBox}>
                <Text style={styles.eraGuestBoxText}>{eraValues[0]} – {eraValues[1]}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MultiSlider
                values={eraValues}
                min={ERA_MIN}
                max={ERA_MAX}
                step={1}
                onValuesChangeStart={() => {
                  eraDragStartValuesRef.current = [eraValues[0], eraValues[1]];
                  draggingEraThumbRef.current = null;
                }}
                onValuesChange={(vals) => {
                  const start = eraDragStartValuesRef.current;
                  if (draggingEraThumbRef.current === null) {
                    const d0 = vals[0] - start[0];
                    const d1 = vals[1] - start[1];
                    if (d0 !== 0 && d1 === 0) draggingEraThumbRef.current = 0;
                    else if (d1 !== 0 && d0 === 0) draggingEraThumbRef.current = 1;
                    else if (d0 !== 0 && d1 !== 0) {
                      draggingEraThumbRef.current = Math.abs(d0) >= Math.abs(d1) ? 0 : 1;
                    }
                  }

                  let next: [number, number] = [vals[0], vals[1]];
                  if (draggingEraThumbRef.current === 0) {
                    const lockedRight = start[1];
                    const clampedLeft = Math.min(vals[0], lockedRight - ERA_MIN_INTERVAL);
                    next = [clampedLeft, lockedRight];
                  } else if (draggingEraThumbRef.current === 1) {
                    const lockedLeft = start[0];
                    const clampedRight = Math.max(vals[1], lockedLeft + ERA_MIN_INTERVAL);
                    next = [lockedLeft, clampedRight];
                  }

                  // to-golv: clampa to till 1980 + dra in from så intervallet hålls.
                  if (next[1] < ERA_TO_MIN) {
                    next = [Math.min(next[0], ERA_TO_MIN - ERA_MIN_INTERVAL), ERA_TO_MIN];
                  }
                  if (next[1] - next[0] < ERA_MIN_INTERVAL) return;
                  if (next[0] === eraValues[0] && next[1] === eraValues[1]) return;
                  void Haptics.selectionAsync();
                  setEraValues(next);
                }}
                onValuesChangeFinish={() => {
                  draggingEraThumbRef.current = null;
                }}
                minMarkerOverlapDistance={ERA_MIN_INTERVAL_PX}
                minMarkerValueTwo={ERA_TO_MIN}
                isMarkersSeparated
                customMarkerLeft={EraMarkerMinus}
                customMarkerRight={EraMarkerPlus}
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
                sliderLength={ERA_SLIDER_INNER_WIDTH}
              />
              <DecadeMarks />
            </View>
            {eraValues[1] <= ERA_TO_MIN && (
              <View style={{ backgroundColor: Colors.warningMuted, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.warningBorder, marginTop: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.xs, color: Colors.warning, lineHeight: 17 }}>⚠️ To-year can not be earlier than 1980</Text>
              </View>
            )}
            {eraValues[1] - eraValues[0] <= ERA_MIN_INTERVAL && (
              <View style={{ backgroundColor: Colors.warningMuted, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.warningBorder, marginTop: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.xs, color: Colors.warning, lineHeight: 17 }}>⚠️ Min interval 15 years</Text>
              </View>
            )}
          </View>

          {/* Number of Rounds — speglar Lobby:s motsvarande sektion. */}
          <View style={styles.field}>
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
            <View style={styles.roundsStepperRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.roundsStepperBtn,
                  roundsCount <= ROUNDS_MIN && styles.roundsStepperBtnDisabled,
                  pressed && roundsCount > ROUNDS_MIN && { opacity: 0.7 },
                ]}
                onPress={handleDecrementRounds}
                disabled={roundsCount <= ROUNDS_MIN}
              >
                <Text
                  style={[
                    styles.roundsStepperBtnText,
                    roundsCount <= ROUNDS_MIN && styles.roundsStepperBtnTextDisabled,
                  ]}
                >
                  −
                </Text>
              </Pressable>
              <View style={styles.roundsGuestBox}>
                <Text style={styles.roundsGuestBoxText}>{roundsCount}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.roundsStepperBtn,
                  roundsCount >= roundsMax && styles.roundsStepperBtnDisabled,
                  pressed && roundsCount < roundsMax && { opacity: 0.7 },
                ]}
                onPress={roundsCount >= roundsMax && !hasPremium
                  ? () => Alert.alert(
                      'Premium feature',
                      'Host more than 4 rounds require QuizVibe Premium. Go to Store?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
                      ],
                    )
                  : handleIncrementRounds}
              >
                <Text
                  style={[
                    styles.roundsStepperBtnText,
                    roundsCount >= roundsMax && styles.roundsStepperBtnTextDisabled,
                  ]}
                >
                  +
                </Text>
              </Pressable>
              {roundsCount >= roundsMax && (
                <TouchableOpacity
                  onPress={() => Alert.alert(
                    'Premium feature',
                    'Host more than 4 rounds require QuizVibe Premium. Go to Store?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
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
                gameModeMax={roundsMax}
                onPremiumPress={() => Alert.alert(
                  'Premium feature',
                  'Host more than 4 rounds require QuizVibe Premium. Go to Store?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
                  ],
                )}
                hasSubscription={hasPremium}
                indivActive={gameMode === 'individual-devices'}
              />
            </View>
            <Text style={styles.roundsScopeNote}>
              Applies to Multiplayer games. Single player is always 4 rounds.
            </Text>
          </View>

          {/* Game mode quick-select — under RoundsRuler för snabb mode-byte.
              EN rad med två rutor, som huvud-Game Mode-sektionen. */}
          <View style={styles.field}>
            <View style={styles.modeRow}>
              {renderModeBox('ptp', 'Pass-the-Phone', true)}
              {renderModeBox('indiv', 'Individual device', true, true)}
            </View>
          </View>

          {/* Answer response time — 4-knapps-rad (samma som i Lobby). */}
          <View style={styles.field}>
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
            <View style={styles.responseRow}>
              {([30, 45, 60] as const).map((sec) => {
                const isActive = answerResponseSeconds === sec;
                return (
                  <Pressable
                    key={sec}
                    onPress={() => setAnswerResponseSeconds(sec)}
                    style={({ pressed }) => [
                      styles.responseBtn,
                      isActive ? styles.responseBtnActive : styles.responseBtnInactive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={[styles.responseBtnText, isActive && styles.responseBtnTextActive]}>
                      {sec}s
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Save Profile — egen Save-knapp för Host defaults-sektionen
              (helt separerad från Profile defaults-kortet:s Save Profile
              och Customized packages-sektionens Save settings — feedback
              syns bara på den knapp som faktiskt trycks, inte på alla tre).
              Underliggande save-action persisterar hela profilen i ett
              svep oavsett knapp. */}
          <Button
            label={savedSection === 'host' ? '✓ Saved' : 'Save Host settings'}
            onPress={() => handleSave('host')}
            variant={savedSection === 'host' ? 'secondary' : 'primary'}
          />
        </View>
        </>
        )}

        {/* ── Customized Host packages (kollapsbar gruppering) ──
            Mellan Host defaults och Game connections. "+ Add host
            packages"-knappen är formaterad som modeOption (samma
            storlek/kantlinje-mönster som Individual Devices) med
            PREMIUM-badge och navigerar till Store. Under följer en
            sub-rubrik och listan över köpta paket — eller en empty-
            state-text om PURCHASED_PACKAGES är tom. */}
        <Pressable
          onPress={() => setCustomizedPackagesExpanded(!customizedPackagesExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          {/* Blå present/paket-silhuett (Colors.primary) — matchar blå-temat. */}
          <View style={styles.sectionHeaderIcon}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill={Colors.primary} />
            </Svg>
          </View>
          <Text style={styles.gameConnectionsHeader}>Customized Host packages</Text>
          <View style={styles.gameConnectionsToggleBox}>
            <Text style={styles.gameConnectionsChevron}>
              {customizedPackagesExpanded ? '−' : '+'}
            </Text>
          </View>
        </Pressable>
        {!customizedPackagesExpanded && <View style={styles.sectionDivider} />}

        {customizedPackagesExpanded && (
          <View style={styles.preview}>
            {/* "Activate Extra package"-knappen (2026-07-07 — ersatte
                "+ Add Host packages"-Store-CTAn; paket säljs inte styckvis
                längre utan INGÅR i Premium-abonnemanget). Gold badge när
                user har Premium, grå annars. Tap: Premium → info-Alert om
                att paketen ingår; ej Premium → Store-upsell (subscription). */}
            <Pressable
              style={({ pressed }) => [
                styles.addPackageBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() =>
                hasPremium
                  ? Alert.alert(
                      'Included with Premium',
                      'Extra Host packages are included in your Premium subscription. Use the toggles below to choose which packages are available when you host.',
                    )
                  : Alert.alert(
                      'Premium feature',
                      'Extra Host packages for a customized quiz experience are included with QuizVibe Premium. Get it in the Store?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
                      ],
                    )
              }
            >
              <Text style={styles.modeLabel}>Activate Extra package</Text>
              <View
                style={[styles.premiumBadge, !hasPremium && styles.premiumBadgeGrey]}
                pointerEvents="none"
              >
                <Text style={[styles.premiumBadgeText, !hasPremium && styles.premiumBadgeTextGrey]}>
                  PREMIUM
                </Text>
              </View>
            </Pressable>

            {/* Paketlistan + Save visas BARA för Premium (2026-07-07) —
                paketen ingår i abonnemanget; utan Premium finns inget att
                konfigurera (grå badge på knappen är lås-signalen). */}
            {hasPremium && (
            <>
            {/* Sub-rubrik på egen rad. Select all-toggle hamnar på en
                separat rad nedanför, högerställd så switchen linjerar
                med per-paket-switcharna i listan. V1: PURCHASED_PACKAGES
                är tom så empty-state-texten alltid visas. */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Available when you are the Host:
              </Text>
              {/* Select all-toggle göms när bara 1 paket finns — då blir
                  den redundant (single packagets egen toggle gör samma
                  jobb). Aktiveras när themed packages introduceras i v1.1+. */}
              {availablePackages.length > 1 && (
                <View style={styles.selectAllRow}>
                  <Text style={styles.selectAllLabel}>Select all</Text>
                  <Switch
                    value={isAllPackagesEnabled}
                    onValueChange={handleToggleAllPackages}
                    trackColor={{ false: Colors.error, true: Colors.success }}
                    thumbColor="#FFF"
                    // iOS Switch:s native track är något smalare än outer
                    // pill, så `ios_backgroundColor` läcker igenom som en
                    // tunn röd flärd vid kanterna även när toggle är ON.
                    // Synca färgen med aktiv track-färg så ingen röd flärd
                    // syns när toggle är aktiverad.
                    ios_backgroundColor={isAllPackagesEnabled ? Colors.success : Colors.error}
                    style={styles.selectAllSwitch}
                  />
                </View>
              )}
              {availablePackages.length === 0 ? (
                <Text style={styles.packagesEmptyText}>
                  No host packages available
                </Text>
              ) : (
                <View style={styles.packagesList}>
                  {availablePackages.map((pkg) => {
                    const isEnabled = enabledHostPackages.includes(pkg.id);
                    const isFree = !!pkg.free;
                    return (
                      <View key={pkg.id} style={styles.packageListRow}>
                        {/* Info-ikon — speglar Lobby:s purchasedPackageRow-
                            mönster (20×20 cirkel, italic "i"). Tap visar
                            Alert med paketets namn + Store-text. */}
                        <Pressable
                          style={({ pressed }) => [
                            styles.infoIconBtn,
                            pressed && { opacity: 0.7 },
                          ]}
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
                        </Pressable>
                        {/* Paketnamns-box: aktiv styling när enabled, dämpad
                            (grå border, transparent bg, dämpad text) när
                            disabled — speglar Lobby:s purchasedPackageBox /
                            purchasedPackageBoxActive-mönster. Free-paket
                            (pkg.free=true) får en kantskärande FREE-badge —
                            inga free-paket i V1 men styling-pattern bevaras
                            för framtida gratis-paket. */}
                        <View
                          style={[
                            styles.packageRow,
                            !isEnabled && styles.packageRowInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.packageRowText,
                              !isEnabled && styles.packageRowTextInactive,
                            ]}
                          >
                            {pkg.name}
                          </Text>
                          {isFree && (
                            <View
                              style={[styles.packageFreeBadge, !isEnabled && styles.packageFreeBadgeMuted]}
                              pointerEvents="none"
                            >
                              <Text
                                style={[styles.packageFreeBadgeText, !isEnabled && styles.packageFreeBadgeTextMuted]}
                              >
                                FREE
                              </Text>
                            </View>
                          )}
                        </View>
                        {/* On/off-toggle — styr om paketet visas i Lobby
                            när användaren är host. Samma röd/grön-track +
                            vit thumb + 0.8-skala som Lobby:s switchar. */}
                        <Switch
                          value={isEnabled}
                          onValueChange={() => handleToggleHostPackage(pkg.id)}
                          trackColor={{ false: Colors.error, true: Colors.success }}
                          thumbColor="#FFF"
                          // Synca ios_backgroundColor med aktiv track-färg —
                          // se Select all-switchen ovan för rationale.
                          ios_backgroundColor={isEnabled ? Colors.success : Colors.error}
                          style={styles.packageSwitch}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Save settings — egen Save-knapp för Customized packages-
                sektionen (helt separerad från Profile defaults / Host
                defaults Save-knapparna — feedback syns bara här när
                knappen trycks). Underliggande save-action persisterar
                hela profilen i ett svep oavsett knapp. */}
            <Button
              label={savedSection === 'packages' ? '✓ Saved' : 'Save settings'}
              onPress={() => handleSave('packages')}
              variant={savedSection === 'packages' ? 'secondary' : 'primary'}
            />
            </>
            )}
          </View>
        )}

        {/* ── Game connections (kollapsbar gruppering) ─────────── */}
        <Pressable
          onPress={() => setGameConnectionsExpanded(!gameConnectionsExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          {/* Profil-silhuett-emoji — samma ikon som Players in Lobby. */}
          <Text style={styles.sectionHeaderEmoji}>👥</Text>
          <Text style={styles.gameConnectionsHeader}>QuizVibe Community & Friends</Text>
          <View style={styles.gameConnectionsToggleBox}>
            <Text style={styles.gameConnectionsChevron}>
              {gameConnectionsExpanded ? '−' : '+'}
            </Text>
          </View>
        </Pressable>
        {!gameConnectionsExpanded && <View style={styles.sectionDivider} />}

        {gameConnectionsExpanded && (
          <>
        {/* ── QuizVibe friends ─────────────────────────────────── */}
        {/* Sparade playerNames används senare för direktinbjudningar via
            Lobby's Share invite (visas hos vänner i Join Waiting Invites). */}
        <View style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <View style={styles.friendsIconWrap}>
              <QuizVibeFriendsLogo size={48} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendsTitle}>QuizVibe friends</Text>
              <Text style={styles.friendsSubtitle}>
                Share game invitations easier to friends and follow
                each other progression.
              </Text>
            </View>
            <View style={styles.friendsCount}>
              <Text style={styles.friendsCountText}>{friends.length}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              // Fräscha fält varje gång modalen öppnas — speglar Lobby:s
              // handleOpenShareModal.
              setNewFriendPlayerName('');
              setAddFriendKbMode('letter');
              setAddFriendFocused(false);
              setAddFriendError(null);
              setSelectedFriendIds(new Set());
              setFriendsModalOpen(true);
            }}
            style={({ pressed }) => [
              styles.friendsBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.friendsBtnText}>+ Add QuizVibe Friends</Text>
          </Pressable>

          {/* Inline lista över sparade vänner — en rad per friend. Speglar
              modalens friendRow-layout (avatar + namn + ×) så listan känns
              som samma vy. Modalens lista är kvar oförändrad. */}
          {friends.length > 0 && (
            <View style={styles.friendsList}>
              {friends.map((friend, i) => (
                <View key={friend.id}>
                  {i > 0 && <View style={styles.friendsListDivider} />}
                  <View style={styles.friendsListRow}>
                    <Text style={styles.friendsListEmoji}>
                      {getAvatarEmojiById(friend.avatarId)}
                    </Text>
                    <Text style={styles.friendsListName} numberOfLines={1}>
                      {friend.playerName}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveFriend(friend.id)}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.friendsListRemoveBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={styles.friendsListRemoveText}>×</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
          </>
        )}

        {/* ── Player history (mockdata tills backend finns) ──────── */}
        <PlayerHistorySection />

        {/* ── Legal (Privacy Policy + Terms of Service) ───────────── */}
        {/* Default collapsed — användare sällan behöver dokumenten,
            men de måste vara accessible för App Store-compliance och
            GDPR. Länkarna öppnas in-app via expo-web-browser så
            användaren stannar i appens kontext. */}
        <Pressable
          onPress={() => setLegalExpanded(!legalExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <Text style={styles.sectionHeaderEmoji}>📄</Text>
          <Text style={styles.gameConnectionsHeader}>Legal</Text>
          <View style={styles.gameConnectionsToggleBox}>
            <Text style={styles.gameConnectionsChevron}>
              {legalExpanded ? '−' : '+'}
            </Text>
          </View>
        </Pressable>
        {!legalExpanded && <View style={styles.sectionDivider} />}

        {legalExpanded && (
          <View style={styles.legalCard}>
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  'https://quizvibe.se/legal/privacy/',
                )
              }
              style={({ pressed }) => [
                styles.legalRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.legalRowText}>Privacy Policy</Text>
              <Text style={styles.legalRowChevron}>›</Text>
            </Pressable>
            <View style={styles.legalRowDivider} />
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  'https://quizvibe.se/legal/terms/',
                )
              }
              style={({ pressed }) => [
                styles.legalRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.legalRowText}>Terms of Service</Text>
              <Text style={styles.legalRowChevron}>›</Text>
            </Pressable>
            <View style={styles.legalRowDivider} />
            <Pressable
              onPress={() => router.push('/faq?from=/profile')}
              style={({ pressed }) => [
                styles.legalRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.legalRowText}>FAQ</Text>
              <Text style={styles.legalRowChevron}>›</Text>
            </Pressable>
            <Text style={styles.legalFootnote}>
              Privacy Policy and Terms open in a secure in-app browser.
              FAQ is handled inside the app.
            </Text>
            <Text style={styles.legalDisclaimer}>
              QuizVibe is an independent app and is not affiliated with, sponsored by, or officially endorsed by Spotify AB or Google LLC.
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Avatar picker modal ──────────────────────────────────── */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <AvatarPicker
          source={source}
          setSource={setSource}
          category={category}
          setCategory={setCategory}
          selectedAvatarId={selectedAvatarId}
          setSelectedId={setSelectedId}
          onClose={() => setPickerOpen(false)}
        />
      </Modal>

      {/* ── Friends management modal ──────────────────────────────── */}
      <Modal
        visible={friendsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFriendsModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={friendsModal.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={friendsModal.backdrop}
            onPress={() => setFriendsModalOpen(false)}
          />
          <View style={friendsModal.sheet}>
            <View style={friendsModal.handle} />
            <Text style={friendsModal.title}>QuizVibe friends</Text>
            <Text style={friendsModal.subtitle}>
              Save Player Names to invite friends with one tap from Lobby.
            </Text>

            {/* Add friend row — samma split-field-struktur (bokstäver +
                siffror, QuizVibe:s egna CodeKeyboard) som PlayerName skapas
                överallt annars i appen, speglar Lobby:s Share invite-modal
                1:1 (Peter 2026-08-27). `appendPlayerNameLetter` sköter
                versal-först/gemener-resten-formatet per tangenttryck.
                `playerNameExists` verifierar att namnet tillhör en
                registrerad QuizVibe-user innan det sparas. */}
            <Text style={friendsModal.addFieldLabel}>Add by Player Name</Text>
            <View style={friendsModal.addRow}>
              <TextInput
                ref={addFriendLettersRef}
                style={[
                  friendsModal.addInput,
                  friendsModal.addPlayerNameLettersInput,
                  addFriendKbMode === 'letter' && friendsModal.addPlayerNameInputActive,
                ]}
                placeholder="Anna"
                placeholderTextColor={Colors.textDisabled}
                value={getPlayerNameLetters(newFriendPlayerName)}
                maxLength={PLAYER_NAME_MAX_LETTERS}
                editable={!addFriendChecking}
                showSoftInputOnFocus={false}
                selection={{
                  start: getPlayerNameLetters(newFriendPlayerName).length,
                  end: getPlayerNameLetters(newFriendPlayerName).length,
                }}
                selectTextOnFocus={false}
                contextMenuHidden={true}
                onFocus={() => {
                  setAddFriendKbMode('letter');
                  setAddFriendFocused(true);
                }}
                onBlur={() => setAddFriendFocused(false)}
              />
              <Text style={friendsModal.addPlayerNameSeparator}>–</Text>
              <TextInput
                ref={addFriendDigitsRef}
                style={[
                  friendsModal.addInput,
                  friendsModal.addPlayerNameDigitsInput,
                  addFriendKbMode === 'digit' && friendsModal.addPlayerNameInputActive,
                  getPlayerNameLetters(newFriendPlayerName).length === 0 && friendsModal.addPlayerNameInputDisabled,
                ]}
                placeholder="1234"
                placeholderTextColor={Colors.textDisabled}
                value={getPlayerNameDigits(newFriendPlayerName)}
                maxLength={PLAYER_NAME_MAX_DIGITS}
                editable={!addFriendChecking && getPlayerNameLetters(newFriendPlayerName).length > 0}
                showSoftInputOnFocus={false}
                selection={{
                  start: getPlayerNameDigits(newFriendPlayerName).length,
                  end: getPlayerNameDigits(newFriendPlayerName).length,
                }}
                selectTextOnFocus={false}
                contextMenuHidden={true}
                onFocus={() => {
                  if (getPlayerNameLetters(newFriendPlayerName).length === 0) {
                    addFriendLettersRef.current?.focus();
                    return;
                  }
                  setAddFriendKbMode('digit');
                  setAddFriendFocused(true);
                }}
                onBlur={() => setAddFriendFocused(false)}
              />
              <Pressable
                onPress={handleAddFriend}
                disabled={!newFriendPlayerName.trim() || addFriendChecking}
                style={({ pressed }) => [
                  friendsModal.addBtn,
                  (!newFriendPlayerName.trim() || addFriendChecking) && friendsModal.addBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={friendsModal.addBtnText}>
                  {addFriendChecking ? '…' : 'Add'}
                </Text>
              </Pressable>
            </View>
            {addFriendError && (
              <Text style={friendsModal.addErrorText}>{addFriendError}</Text>
            )}
            {addFriendFocused && (
              <CodeKeyboard
                mode={addFriendKbMode}
                letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                onPress={handleAddFriendKeyPress}
                onBackspace={handleAddFriendBackspace}
                onModeToggle={toggleAddFriendKbMode}
                // Digit-mode kräver minst 1 letter — toggle dimmas i letter-
                // mode tills letter-sektionen har innehåll.
                modeToggleDisabled={addFriendKbMode === 'letter' && newFriendPlayerName.length === 0}
                // Cancel avbryter bara den pågående namn-inmatningen och
                // stänger tangentbordet — "Done" längst ner stänger hela
                // Friends-modalen, ett större steg än man vill ta mitt i en
                // felskrivning. Mode-toggle flyttar in i grid:en (efter Z).
                onCancel={handleAddFriendCancel}
              />
            )}

            {/* List — maxHeight krymps medan CodeKeyboard:et är uppe (Add
                by Player Name fokuserad) så hela sheet:en ryms inom
                sheet:s 90%-tak på kortare skärmar. */}
            <ScrollView style={{ maxHeight: addFriendFocused ? 160 : 320 }}>
              {friends.length === 0 ? (
                <View style={friendsModal.emptyState}>
                  <Text style={friendsModal.emptyIcon}>🫥</Text>
                  <Text style={friendsModal.emptyText}>No friends yet</Text>
                  <Text style={friendsModal.emptySubtext}>
                    Add a Player Name above to start your list.
                  </Text>
                </View>
              ) : (
                friends.map((friend, i) => {
                  const checked = selectedFriendIds.has(friend.id);
                  return (
                    <View key={friend.id}>
                      <View style={friendsModal.friendRow}>
                        <Text style={friendsModal.friendEmoji}>
                          {getAvatarEmojiById(friend.avatarId)}
                        </Text>
                        <Text style={friendsModal.friendName}>{friend.playerName}</Text>
                        {/* Kryssruta (2026-08-27, ersatte per-rad "×") —
                            speglar Lobby:s shareSheet.checkbox-mönster så
                            host bockar för flera friends och tar bort dem
                            allihop via Delete-knappen längst ner. */}
                        <Pressable
                          onPress={() => {
                            setSelectedFriendIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(friend.id)) next.delete(friend.id);
                              else next.add(friend.id);
                              return next;
                            });
                          }}
                          hitSlop={8}
                          style={[friendsModal.checkbox, checked && friendsModal.checkboxChecked]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked }}
                          accessibilityLabel={`Select ${friend.playerName}`}
                        >
                          {checked && <Text style={friendsModal.checkmark}>✓</Text>}
                        </Pressable>
                      </View>
                      {i < friends.length - 1 && <View style={friendsModal.divider} />}
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={friendsModal.footerRow}>
              <Pressable
                onPress={handleDeleteSelectedFriends}
                disabled={selectedFriendIds.size === 0}
                style={[friendsModal.deleteBtn, selectedFriendIds.size === 0 && friendsModal.deleteBtnDisabled]}
              >
                <Text
                  style={[
                    friendsModal.deleteBtnText,
                    selectedFriendIds.size === 0 && friendsModal.deleteBtnTextDisabled,
                  ]}
                >
                  {selectedFriendIds.size > 0 ? `Delete (${selectedFriendIds.size})` : 'Delete'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFriendsModalOpen(false)}
                style={friendsModal.closeBtn}
              >
                <Text style={friendsModal.closeBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Birth year picker modal ──────────────────────────────── */}
      <Modal
        visible={yearPickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setYearPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setYearPickerOpen(false)}
        >
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Birth Year</Text>
              <Pressable
                onPress={() => setYearPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={BIRTH_YEARS}
              keyExtractor={(y) => y.toString()}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={
                birthYear !== null
                  ? Math.max(0, BIRTH_YEARS.indexOf(birthYear) - 2)
                  : Math.max(0, BIRTH_YEARS.indexOf(1990) - 2)
              }
              getItemLayout={(_, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
              renderItem={({ item }) => {
                const isSelected = birthYear === item;
                const itemAge = CURRENT_YEAR - item;
                return (
                  <Pressable
                    onPress={() => {
                      setBirthYear(item);
                      setYearPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.yearRow,
                      isSelected && styles.yearRowSelected,
                      pressed && styles.yearRowPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        isSelected && styles.yearTextSelected,
                      ]}
                    >
                      {formatBirthYear(item)}
                    </Text>
                    <Text style={styles.yearAge}>{itemAge} yrs</Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Assistance picker modal ──────────────────────────────── */}
      <Modal
        visible={assistancePickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setAssistancePickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setAssistancePickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Assistance level</Text>
              <Pressable
                onPress={() => setAssistancePickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {ASSISTANCE_OPTIONS.map((opt) => {
              const isSelected = assistance === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setAssistance(opt.id);
                    setAssistancePickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Region picker modal ──────────────────────────────────── */}
      <Modal
        visible={regionPickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setRegionPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setRegionPickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Region</Text>
              <Pressable
                onPress={() => setRegionPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {REGION_OPTIONS.map((opt) => {
              const isSelected = region === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setRegion(opt.id);
                    setRegionPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Answer response picker modal ─────────────────────────── */}
      <Modal
        visible={answerResponsePickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setAnswerResponsePickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setAnswerResponsePickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Answer response time</Text>
              <Pressable
                onPress={() => setAnswerResponsePickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {ANSWER_RESPONSE_OPTIONS.map((opt) => {
              const isSelected = answerResponseSeconds === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setAnswerResponseSeconds(opt.id);
                    setAnswerResponsePickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Logout-modal ──────────────────────────────────────────
          Bottom-sheet med samma layout som Home-skärmens profileMenu
          för logged-in-läget (avatar + Player Name + "Logged in"-status,
          röd Log out-knapp, Cancel). Användaren får konsistent UX
          oavsett varifrån de väljer att logga ut. */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutOverlay}>
          <Pressable
            style={styles.logoutBackdrop}
            onPress={() => setLogoutModalVisible(false)}
          />
          <View style={styles.logoutSheet}>
            <View style={styles.logoutHeader}>
              {selectedAvatarId ? (
                <Text style={styles.logoutHeaderEmoji}>
                  {getAvatarEmojiById(selectedAvatarId)}
                </Text>
              ) : (
                <View style={styles.logoutHeaderBrandWrap}>
                  <QuizVibeQAvatar size={32} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.logoutHeaderName}>
                  {playerName.trim() || 'Signed in'}
                </Text>
                <Text style={styles.logoutHeaderStatus}>
                  {email.trim() || 'Logged in'}
                </Text>
              </View>
            </View>

            {/* Create Game-genväg — gateas av credits-popupen i
                handleCreateGame. Speglar Home:s primary "Create Game"-
                knapp så användaren kan starta ett spel utan att gå
                tillbaka till Home först. Primary-styling (blå bg + vit
                text) så den läser som den tydliga CTA:n i menyn. */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutCreateGameBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => guardedNavigate(handleCreateGame)}
            >
              <Text style={styles.logoutCreateGameBtnText}>Start New Game</Text>
            </Pressable>

            {/* Join Game — as registered user. Navigerar till Home med
                ?openJoinRegistered=1 så Home auto-öppnar JoinModal i
                'choose'-step med hideGuest:true (samma flöde som
                "Join Game — as registered user"-knappen på Home). Speglar
                Create Game-stylen så de visuellt grupperas som spel-CTAs. */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutCreateGameBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => guardedNavigate(() => {
                setLogoutModalVisible(false);
                router.push('/?openJoinRegistered=1');
              })}
            >
              <Text style={styles.logoutCreateGameBtnText}>Join with Room code</Text>
            </Pressable>

            {/* Store-genväg — utan focus-param följer Store sin default-
                ordning (Basic → Credits → Packages → Subscriptions),
                samma som direkt tab-tryck på Store. */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutStoreBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => guardedNavigate(() => {
                setLogoutModalVisible(false);
                router.push('/store?from=/profile');
              })}
            >
              <View style={styles.logoutStoreBtnInner}>
                <ShoppingCartIcon size={22} />
                <Text style={styles.logoutStoreBtnText}>Store</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleConfirmLogout}
              disabled={deletingAccount}
            >
              <Text style={styles.logoutBtnText}>Log out</Text>
            </Pressable>

            {/* Delete Account — separat från Log out, tydligt destruktiv
                styling (röd outline + röd text). Apple App Store
                Guideline 5.1.1(v) kräver in-app deletion för apps med
                kontoflow. Två-stegs confirmation via Alert i
                handleRequestDeleteAccount så user inte triggar deletion
                av misstag. */}
            <Pressable
              style={({ pressed }) => [
                styles.deleteAccountBtn,
                pressed && { opacity: 0.85 },
                deletingAccount && { opacity: 0.5 },
              ]}
              onPress={handleRequestDeleteAccount}
              disabled={deletingAccount}
            >
              <Text style={styles.deleteAccountBtnText}>
                {deletingAccount ? 'Deleting…' : 'Delete Account'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.logoutCancelBtn}
              onPress={() => setLogoutModalVisible(false)}
              disabled={deletingAccount}
            >
              <Text style={styles.logoutCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Spotify DJ guide modal ──────────────────────────────────────
          Visas när användaren tappar "Guide How Spotify DJ works" i Spotify-
          raden. Plan B (2026-07-22): ingen kontokoppling — bara Spotify-appen. */}
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
                <Text style={styles.spotifyGuideStepText}>
                  Switch on the Spotify user toggle to confirm you have the Spotify app — now you are ready to play Spotify music in Individual device mode
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

// ─── Avatar picker (inside modal) ─────────────────────────────────────────────

function AvatarPicker({
  source, setSource,
  category, setCategory,
  selectedAvatarId, setSelectedId,
  onClose,
}: {
  source: AvatarSource;
  setSource: (s: AvatarSource) => void;
  category: AvatarCategory;
  setCategory: (c: AvatarCategory) => void;
  selectedAvatarId: string;
  setSelectedId: (id: string) => void;
  onClose: () => void;
}) {
  const filteredAvatars =
    category === 'All' ? AVATARS : AVATARS.filter((a) => a.category === category);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Change Avatar</Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.6 }]}
          hitSlop={10}
        >
          <Text style={styles.modalCloseText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Source selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo Source</Text>
          <Card padding={Spacing.sm}>
            {SOURCE_OPTIONS.map((opt, i) => (
              <React.Fragment key={opt.id}>
                <SourceRow
                  icon={opt.icon}
                  label={opt.label}
                  subtitle={opt.subtitle}
                  selected={source === opt.id}
                  onPress={() => setSource(opt.id)}
                />
                {i < SOURCE_OPTIONS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Avatar picker (only when source = 'choose') */}
        {source === 'choose' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Avatar Collection</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, category === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, category === cat && styles.chipLabelActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Card padding={Spacing.md}>
              <View style={styles.grid}>
                {filteredAvatars.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
                    style={styles.gridCell}
                  >
                    <Avatar
                      emoji={item.emoji}
                      size={56}
                      selected={selectedAvatarId === item.id}
                    />
                  </Pressable>
                ))}
              </View>
            </Card>
          </View>
        )}

        <Button label="Done" onPress={onClose} variant="primary" />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SourceRow sub-component ──────────────────────────────────────────────────

function SourceRow({
  icon, label, subtitle, selected, onPress,
}: {
  icon: string; label: string; subtitle: string;
  selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceRow,
        selected && styles.sourceRowSelected,
        pressed && styles.sourceRowPressed,
      ]}
    >
      <View style={[styles.sourceIcon, selected && styles.sourceIconSelected]}>
        {/* icon='Q' är en sentinel för Default Image-raden — rendera
            QuizVibe Q-brand-SVG istället för en text-emoji så raden
            visuellt speglar den faktiska avataren som blir resultatet. */}
        {icon === 'Q' ? (
          <QuizVibeQAvatar size={28} />
        ) : (
          <Text style={styles.sourceIconText}>{icon}</Text>
        )}
      </View>
      <View style={styles.sourceInfo}>
        <Text style={[styles.sourceLabel, selected && styles.sourceLabelSelected]}>
          {label}
        </Text>
        <Text style={styles.sourceSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Logout-modal (speglar profileMenu från app/index.tsx
  //     för konsistent UX när man loggar ut från Profile-pillen) ───
  logoutOverlay: { flex: 1, justifyContent: 'flex-end' },
  logoutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  logoutSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutHeader: {
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
  logoutHeaderBrandWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutHeaderEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  logoutHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  logoutHeaderStatus: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  // Create Game + Join Game-knappar i logout-sheet:n. Speglar Store-
  // knappens styling exakt (blå-konturad, cardElevated bg, textPrimary
  // text) så alla tre genvägar visuellt grupperas. CTA-hierarkin är:
  // Create Game / Join Game / Store (alla neutrala) → Log out (röd,
  // destruktiv) → Cancel (text-only).
  logoutCreateGameBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCreateGameBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Store-knapp ovanför Log out i logout-sheet:n. Speglar Home-skärmens
  // profileMenu.secondaryBtn (blå-konturad, neutralt cardElevated bg) så
  // CTA-hierarkin är: Store (neutral) → Log out (röd, destruktiv) →
  // Cancel (text-only). Höjd matchar logoutBtn för visuell rytm.
  logoutStoreBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutStoreBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Row-layout för Store-knappen med leading cart-ikon. Knappens egen
  // alignItems/justifyContent: 'center' centrerar wrapper:n så ikon +
  // text grupperas centrerat.
  logoutStoreBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  logoutCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  logoutCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Delete Account — destruktiv outline-styling. Tunnare/mindre visuell
  // vikt än Log out (som har soft red bg) för att signalera "rare,
  // dangerous action" snarare än "frequent CTA". Solid red outline +
  // transparent bg + röd text följer iOS HIG för destructive buttons.
  deleteAccountBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },

  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl + 52, // + BOTTOM_BANNER_HEIGHT
    gap: Spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerLeft: { flex: 1, gap: 4 },
  screenTitle: { ...Typography.screenTitle, color: Colors.textPrimary },
  screenSubtitle: { ...Typography.label, color: Colors.textSecondary },

  // Host Game Credits pill (top-right of Profile header). Visar två siffror på
  // samma rad: Free (gratis credits från Basic-planen) och Extras (köpta från
  // Store). minWidth bumpat från 110 → 170 för att rymma dubbla key/value-par.
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
    minWidth: 160,
    flexShrink: 1,
    // position:relative + overflow:visible krävs så absoluta Unlimited-
    // badgen (creditsMembershipBadgeWrap, top:-8) kan sticka upp över
    // top-bordern utan att klippas. Speglar Lobby:s pill exakt.
    position: 'relative',
  },
  // Membership-state — synced med Lobby:s creditsPillMembership-styling.
  // 2 px gold border (var 1 px primaryBorder) signalerar att pillen
  // är "premium-tier". Renderas additativt ovanpå creditsPill när
  // hasPremium=true.
  creditsPillMembership: {
    borderWidth: 2,
    borderColor: '#F5A623',
  },
  // Wrap för "Unlimited"-badgen (gold pillen-skärande lapp i top-right).
  // pointerEvents:none så outer pillens onPress fortfarande fyrar när
  // användaren tappar i badge-zonen. Synced med Lobby:s motsvarande styles.
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
  // "Free:" / "Extras:" labels framför respektive siffra. Liten, dämpad text
  // så själva siffran är den dominerande visuella vikten.
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
  // Färg-overrides för att skilja Free (grön = "ingår gratis") från Extras
  // (guld = "köpt premium-resurs"). Gold matchar PREMIUM-badgen i Lobby
  // och 1st-place-färgen i RoundLeaderboard för visuell konsistens.
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
  // Extras-ruta inom pillen — bordred mini-box med "Extras: N" + kant-
  // skärande PREMIUM-badge. Gold border när extras > 0, grey border när 0.
  // position:'relative' så badge:n med top:-7 kan sticka upp över kantlinjen.
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
  // Kant-skärande PREMIUM-badge — speglar premiumBadge-mönstret från
  // Game Mode-toggle:n (top:-8, right:Spacing.sm) men i mindre format
  // för att passa den smala credits-pillen. pointerEvents:'none' så tap
  // går till parent-Pressable.
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

  // Sektionsrubrik ovan Game connections-blocket. Rad-layout med
  // chevron till höger så användaren ser att blocket är kollapsbart.
  // Samma visuella vikt som "Player history"-rubriken i
  // PlayerHistorySection för konsistent hierarki mellan
  // ProfileScreen-sektionerna.
  // Header-rad för Game connections-blocket. +/−-tecknet sitter
  // tätt intill rubriken (inte högerjusterat) — radens children
  // grupperas vänster med en liten gap.
  gameConnectionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: -Spacing.sm,
  },
  gameConnectionsHeader: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  // Ledande ikon/emoji framför sektionsrubriken. Två varianter:
  // sectionHeaderIcon (för Q-avatar SVG, behöver wrap-View) och
  // sectionHeaderEmoji (för text-emoji). Båda är dimensionerade så
  // de visuellt linjerar med rubrikens baseline.
  sectionHeaderIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  // Liten box runt +/−-tecknet så det får en tydlig "knapp"-känsla
  // intill rubriken.
  gameConnectionsToggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameConnectionsChevron: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Tunn linje som visas under sektion-rubrikerna när de är kollapsade
  // — ger visuell separation mellan stack:ade rubriker. Renderas inte
  // i expanded state eftersom innehålls-korten ger separation där.
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Legal-sektionens kort (Privacy Policy + Terms of Service-rader).
  // Sparsam styling — sektionen är sällan-besökt och ska kännas som
  // en lista, inte ett feature-kort.
  legalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  legalRowText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  legalRowChevron: {
    fontSize: 22,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  legalRowDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  legalFootnote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  legalDisclaimer: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    fontStyle: 'italic',
  },

  // QuizVibe friends card (header upptill, full-bredd-knapp i underkant)
  friendsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  // Wrapper för QuizVibeFriendsLogo. Bredden (44) matchar paddingen i
  // andra header-ikoner så text-blocket börjar på samma x; SVG:n får
  // rendera lite större (52) och tillåts overflow:a wrapper-bounds så
  // ikonen visuellt blir större utan att skjuta titeln längre höger.
  friendsIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  friendsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  friendsCount: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsCountText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  // Friends-knappen använder samma färgpalett som TopBanner-pillen och
  // Game era year-display — primaryMuted bg + primaryBorder + primary
  // text. Det ger en mörkblå-tonad yta istället för solid bright blue.
  friendsBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Inline friends-lista under knappen. Mörkare yta (background) inuti
  // kortet så raderna läses som en egen lista, inte som del av kortet.
  friendsList: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  friendsListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  friendsListEmoji: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  friendsListName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  friendsListRemoveBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsListRemoveText: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  friendsListDivider: {
    height: 1,
    backgroundColor: Colors.separator,
  },

  // Preview card — vertical container: [columns row] + [Save button]
  preview: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  // Inre rad som håller vänster- och högerkolumnen sida vid sida.
  // alignItems: 'center' centrerar avatar+playerName-kolumnen vertikalt
  // i förhållande till den högre högerkolumnen.
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // Left column: avatar + playerName under
  leftColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    width: 140,
  },
  avatarButton: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(11,18,32,0.85)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  playerNameDisplay: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },

  // Right column: competition setup
  rightColumn: {
    flex: 1,
    gap: Spacing.sm + 2,
  },
  setupHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  field: {
    gap: 4,
  },
  // Competition Age — inline-rad: label vänster, värde direkt till
  // höger om labeln (liten gap istället för space-between så siffran
  // sitter nära texten). Höjden matchar standard-fält så vertikalt
  // avstånd till Year of birth/Assistance level blir lika via rightColumn:s gap.
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ageValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  // Rad för två side-by-side fält (Region scope + Answer response)
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  // Game era display — kopierad från Lobby (eraGuestBox-mönstret) så Profile
  // använder exakt samma tidsjusterare som Lobbyn. Speglar in-game year-
  // selector-rutan från app/quiz.tsx (BOX_COLOR='#F5A623', BOX_BG=
  // 'rgba(26,48,80,0.92)') — gul kantlinje + gul glow + mörkblå fyllning.
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
  // Info-ikon-rader för rubriker — speglar Lobby 1:1.
  multiplayerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs, marginBottom: 8 },
  playersLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md, marginBottom: 8 },
  regionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // Game Mode-toggle — speglar Lobby:s motsvarande toggle i form, mått och
  // färg. Vänster ruta = Pass-the-Phone (free, grön aktiv), höger ruta =
  // Individual Devices (premium, blå/guld aktiv beroende på subscription)
  // med kantskärande PREMIUM-badge i guld. Number of Players-toggle:n togs
  // bort 2026-05-25 men styles delas fortfarande av Game Mode.
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    // 56 (höjt från 46) så tre smalare rutor rymmer 2-raders-labels + FREE-badge.
    height: 56,
    gap: 4,
  },
  gameModeGroupLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  gameModeGroupLabelSpaced: {
    marginTop: Spacing.md,
  },
  modeInfoLine: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
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
  modeOptionInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  // Dämpad variant — appliceras på Pass-the-Phone-rutan när
  // singlePlayerDefault-checkboxen är på. Matchar Individual Devices
  // inaktiva/låsta look (Colors.borderStrong border + grå badge) så
  // båda alternativen ser likadant ut i sitt "låsta" tillstånd.
  modeOptionDimmed: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  modeOptionPassActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.primaryMuted,
  },
  modeOptionIndivActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  // Guld-tonad aktiv variant — Individual Devices när det är valt och
  // host har Premium. Speglar PREMIUM-badge:s guldfärg så toggle-rutan,
  // badge:n och texten bildar ett samlat "premium-läge"-uttryck.
  modeOptionPremiumActive: {
    borderColor: '#F5A623',
    backgroundColor: Colors.primaryMuted,
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
  // Guld-tonad aktiv label — Individual Devices när det är valt (Premium).
  modeLabelActivePremium: {
    color: '#F5A623',
    fontWeight: FontWeight.semibold,
  },
  modeLabelActiveFree: {
    color: '#FFF',
    fontWeight: FontWeight.semibold,
  },
  modeLabelDimmed: {
    color: Colors.textSecondary,
  },
  // FREE-badge — kantskärande tag (samma teknik som HOST-taggen i PlayerRow
  // och Pass-the-Phone-knappen i Lobby:s Game Mode-toggle).
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
  // PREMIUM-badge — guld-tag på Max 12-knappen (matchar Individual
  // Devices-knappen i Lobby:s Game Mode-toggle).
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
  // Grå variant av PREMIUM-badge — appliceras tills användaren köpt
  // Premium-tjänsten. Guld signalerar "tillgängligt", grått signalerar
  // "låst tills du köper" (samma mönster som Lobby:s Individual Devices).
  premiumBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  premiumBadgeTextGrey: {
    color: '#FFF',
  },
  // ── Source Dashboard: äkta kolumn-baserad layout (speglar LobbyScreen) ─
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
    paddingLeft: 4,
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
  sourceMatrixColSep: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.borderStrong,
  },
  autoSyncLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
    opacity: 0.8,
  },
  imagesIconWrap: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  imagesQMark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.primary,
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  // Switch-style för matrix i Profile
  profileSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
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
  // Mode-beskrivning under Multiplayer-bracket — speglar Lobby:s
  // modeDescription (fontSize.xs, textSecondary, generös lineHeight)
  // för konsistent host-default-vy mellan Profile och Lobby.
  modeDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    lineHeight: 17,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Main categories-toggle (Music / Film / Sport) — multi-select-rad med
  // 3 bordered-rutor som speglar Game Mode-toggle:ns visuella språk
  // (samma container-mått, samma active/inactive-färgvokabulär). Kallas
  // även från Lobby:n med samma styles (men där lyfts de till lokal kopia).
  mainCategoryToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
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
    // bg matchar Pass-the-Phone-rutans aktiva bg (modeOptionPassActive) — synkad med Lobby 2026-06-01.
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
  // aktiv, grå + grå text när inaktiv.
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
    marginTop: Spacing.xs,
  },

  // "Multiplayer mode"-klammer under Game Mode-toggle:n. Speglar
  // Lobby:s Number of Rounds-bracket (`roundsRulerStyles.bracket`) i
  // form, mått och färg så de upplevs som samma visuella språk.
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
  // Customized Host packages — Add-knappen speglar Individual Devices-
  // rutans inaktiva look: full bredd via alignSelf:'stretch', 46 px hög
  // (samma som modeToggle), 1 px borderStrong + transparent bg, Radius.sm.
  // position:'relative' så PREMIUM-badge:n kan sticka upp över kantlinjen
  // utan att klippas (overflow:'hidden' undviks).
  addPackageBtn: {
    alignSelf: 'stretch',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    // Tjockare kantlinje (3 px → bumpat från 2 → ursprungligen 1) så
    // Add-knappen sticker ut tydligt mot listan över aktiverade paket
    // nedanför, som har 1 px-borders.
    borderWidth: 3,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  // Lista över köpta extra-paket. Varje rad har info-ikon + blå-bordred
  // ruta side-by-side (speglar Lobby:s purchasedPackageRow-mönster).
  packagesList: {
    gap: Spacing.sm,
  },
  // Yttre rad: info-ikon (20px) + paketnamns-box (flex 1).
  packageListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // Info-ikon — 20×20 cirkel med italic "i". Identisk styling som Lobby:s
  // infoIconBtn så det ser likadant ut i båda vyerna.
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
  // Speglar Lobby:s purchasedPackageBox + purchasedPackageBoxActive 1:1
  // — fixed width 204, xs-padding vertikalt, primary border + elevated bg
  // (active state, eftersom Profile bara listar host:s egna köpta paket).
  packageRow: {
    width: 204,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  packageRowText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  // Disabled-läge för paket-rutan (toggle off): grå borderStrong-kant +
  // transparent bg + dämpad text (samma look som Lobby:s
  // purchasedPackageBox utan active-styling).
  packageRowInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  packageRowTextInactive: {
    color: Colors.textSecondary,
  },
  // Kantskärande FREE-badge — markerar gratis generations-paket som ingår
  // utifrån user:s Competition Year of Birth. Speglar samma teknik som
  // FREE-badgen på Game Mode-toggle:n (border-cutting på top, högerkant).
  // Box:en måste vara position:relative (default i RN) och inte ha
  // overflow:hidden — packageRow uppfyller båda.
  packageFreeBadge: {
    position: 'absolute',
    top: -8,
    right: 14,
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  packageFreeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  // Dämpad variant när paketet är toggle:at OFF — signalerar "tillgängligt
  // gratis men inaktiverat" istället för "aktivt".
  packageFreeBadgeMuted: {
    backgroundColor: '#6B7280',
  },
  packageFreeBadgeTextMuted: {
    color: '#FFF',
  },
  // Switch-styling — speglar Lobby:s connectionSwitch (0.8-skala). Skicka
  // till höger via marginLeft:'auto' så switchen alltid landar mot
  // raden:s högerkant oavsett paketnamn-bredd.
  packageSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginLeft: 'auto',
  },
  // "Select all"-rad — egen rad under sub-rubriken, högerställd så
  // switchens högerkant linjerar med per-paket-switcharna i listan.
  // Egen switch-style utan marginLeft:'auto' (som packageSwitch har)
  // så label + switch sitter ihop som en grupp i höger kant istället
  // för att switchen dras till rad-änden och lämnar label vid vänsterkant.
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  selectAllSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  selectAllLabel: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  // Empty state — när användaren inte har köpt några extra-paket.
  // Centrerad sekundär-text inom samma field-block.
  packagesEmptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: Spacing.sm,
  },
  // Number of Rounds — speglar Lobby:s roundsGuestBox + roundsStepper*-
  // styles 1:1 så Profile- och Lobby-vyn ser identisk ut.
  // Klargör att Number of Rounds är en MULTIPLAYER-default — Single player
  // väljs per spel på Home och är alltid 4 rundor. Speglar Lobby:s
  // guestHostNote (samma vokabulär för "det här går inte att ändra här").
  roundsScopeNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
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
  // Region trigger + Answer response — speglar Lobby 1:1.
  regionTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  regionTriggerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  responseRow: { flexDirection: 'row', gap: Spacing.sm },
  responseBtn: { flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  responseBtnActive: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryMuted },
  responseBtnInactive: { borderColor: Colors.borderStrong, backgroundColor: 'transparent' },
  responseBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  responseBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorPressed: { opacity: 0.7 },
  selectorText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  selectorPlaceholder: {
    color: Colors.textDisabled,
    fontWeight: FontWeight.regular,
  },
  selectorChevron: {
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  readonlyValue: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
  },

  // Option-rows in assistance/region pickers
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  optionRowSelected: { backgroundColor: Colors.primaryMuted },
  optionRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  optionCheck: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: Colors.textSecondary },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },

  // Sections
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.md,
  },

  // Source rows
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  sourceRowSelected: { backgroundColor: Colors.primaryMuted },
  sourceRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  sourceIcon: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceIconSelected: { backgroundColor: Colors.primaryBorder },
  sourceIconText: { fontSize: 18 },
  sourceInfo: { flex: 1 },
  sourceLabel: { ...Typography.bodyMedium, color: Colors.textPrimary },
  sourceLabelSelected: { color: Colors.primary },
  sourceSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  // Category chips
  categoryRow: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipLabelActive: { color: Colors.primary },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridCell: { width: '22%', alignItems: 'center', paddingVertical: Spacing.xs },

  // Year picker modal (centered card)
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pickerCard: {
    maxHeight: '65%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerCardShort: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  yearRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  yearRowSelected: { backgroundColor: Colors.primaryMuted },
  yearRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  yearText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  yearTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  yearAge: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  bottomPad: { height: Spacing.xl },

  // ── Source Dashboard: Spotify DJ-rad ─────────────────────────────────
  spotifyDJRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: 18,
    marginBottom: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingLeft: Spacing.sm,
  },
  spotifyConnectedLabel: {
    fontSize: FontSize.xs,
    color: '#1DB954',
    marginTop: 2,
  },
  spotifyNoConnectionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  spotifyLinkText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  spotifyHostControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: 'auto',
  },
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
  connectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    minWidth: 0,
  },
  sourceMatrixSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  spotifyNotActivatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
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
});

const friendsModal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    // Bounder sheet:en till viewport så toppen aldrig spiller över skärmen
    // när CodeKeyboard:et (Add by Player Name) tar plats — samma mönster
    // som Lobby:s Share invite-modal.
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  // Add-by-Player-Name-label + split-field-rad (2026-08-27) — samma
  // struktur (bokstäver + siffror via CodeKeyboard) som PlayerName skapas
  // överallt annars i appen. Speglar Lobby:s shareSheet-motsvarigheter
  // (LobbyScreen.tsx) exakt.
  addFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xs,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addPlayerNameLettersInput: {
    flex: 7,
    minWidth: 0,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  addPlayerNameDigitsInput: {
    flex: 6,
    minWidth: 0,
    paddingHorizontal: Spacing.sm,
    textAlign: 'center',
  },
  addPlayerNameSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 2,
  },
  addPlayerNameInputActive: { borderColor: Colors.primary },
  addPlayerNameInputDisabled: { opacity: 0.45 },
  addBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
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
  // Inline felmeddelande under Add-raden — visas när playerNameExists()
  // inte hittar någon registrerad user med det inskrivna Player Name.
  addErrorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    paddingHorizontal: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: {
    fontSize: 16,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  friendEmoji: {
    fontSize: 22,
    width: 36,
    textAlign: 'center',
  },
  friendName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  // Kryssruta (2026-08-27, ersatte removeBtn/"×") — speglar Lobby:s
  // shareSheet.checkbox/checkboxChecked/checkmark-mönster exakt.
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
  },
  // Footer-raden (2026-08-27) — Delete + Done sida vid sida, ersatte den
  // ensamma "Done"-knappen.
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },
  deleteBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  closeBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
