import MultiSlider from '@ptomasroos/react-native-multi-slider';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Pressable, Switch, TouchableOpacity } from '@/src/components/haptic';
import { useAsyncAction } from '@/src/utils/useAsyncAction';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Avatar } from '../components/Avatar';
import { YouTubeBrandIcon } from '../components/YouTubeBrandIcon';
import { SpotifyBrandIcon } from '../components/SpotifyBrandIcon';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EraMarkerMinusCompact, EraMarkerPlusCompact } from '../components/EraSliderMarker';
import { HCPShieldCard } from '../components/HCPShield';
import { HostTypeOptions, type HostLobbyType } from '../components/HostTypeOptions';
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
import { setNavigationGuard } from '../utils/navigationGuard';
import { QuizVibeDialog, QuizVibeDialogOverlay } from '@/src/components/QuizVibeDialog';
import { TrashIcon } from '../components/TrashIcon';
import { PackageThumbnail, hasPackageThumbnail } from '@/src/components/PackageThumbnail';
import { QuizVibeAvatarQ, QuizVibeDefaultAvatar } from '../components/QuizVibeDefaultAvatar';
import { QuizVibeToggle, quizVibeToggleWidth } from '../components/QuizVibeToggle';
import { ClapperboardIcon, MusicNoteIcon } from '../components/CategoryIcons';
import { ChevronIcon } from '../components/ChevronIcon';
import { LogoutIcon } from '../components/LogoutIcon';
import { ProfileOutlineIcon } from '../components/ProfileOutlineIcon';
import {
  CrownOutlineIcon,
  DocumentOutlineIcon,
  FriendsOutlineIcon,
  LockOutlineIcon,
  PackageOutlineIcon,
} from '../components/SectionIcons';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { SectionToggle } from '../components/SectionToggle';
import { PlayerNameInput } from '../components/PlayerNameInput';

// Spotify Type-raden (Type: Year [toggle] Name [toggle]) ryms bara från ~375 pt;
// smalare skärmar (SE / Display Zoom) staplar Year/Name.
const SPOTIFY_TYPE_INLINE = Dimensions.get('window').width >= 375;

// ── Profile v2 (2026-10-16): delad accordion-vokabulär ──────────────────
// Dämpad ikon i vila, guld när sektionen är utfälld (aktivt state).
// Alla sektioner som Profile default settings: dämpad ikon även utfälld.
const sectionIconColor = (_expanded: boolean) => BrandUi.iconMuted;


import { resetIdentity, track } from '../utils/analytics';
import { deleteAccount } from '../utils/auth';
import { TRACK_VIEWPORT_W } from '../utils/responsive';
import { AVATARS, getAvatarEmojiById } from '../utils/avatars';
import {
    addFriend,
    loadFriends,
    removeFriend,
    type Friend,
} from '../utils/friendsStorage';
import { PURCHASED_PACKAGES, parentRestrictedPackageMessage, type MusicPackage } from '../utils/mockPurchasedPackages';
import {
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
import { checkActiveElsewhere } from '../utils/activeLobbyGuard';
import { clearLobbyPlayers } from '../utils/mockLobbyPlayers';
import { performLogout } from '../utils/logout';
import { clearLobbySettings } from '../utils/mockLobbySettings';
import { clearGameStarted } from '../utils/mockStartedGames';
import { generateRoomCode } from '../utils/roomCode';
import { checkSpotifyInstalled } from '../utils/spotifyDJ';
import { resolveDisplayHcp } from '../utils/hcpEngine';
import { DEFAULT_VOICE_ID, isValidVoiceId, SILENT_VOICE_ID, VOICE_OPTIONS } from '../utils/voicePacks';
import { playVoiceClip } from '../utils/voicePlayback';
import { loadOwnHcpBundle, refreshOwnHcpDecay } from '../utils/hcpProgress';
import { useWaitingInviteSignal } from '../hooks/useWaitingInviteSignal';
import { getCachedFeatureGates } from '../utils/featureGates';
import { modeLabels } from '../utils/gameFlow';
import { JoinModal } from '../../app/index';

// ─── Data ─────────────────────────────────────────────────────────────────────

type AvatarCategory =
  | 'All'
  | 'Basic'
  | 'Retro'
  | 'Music'
  | 'Film'
  | 'Sports'
  | 'Tech'
  | 'Animals'
  | 'Food'
  | 'Nature'
  | 'Fun';

const CATEGORIES: AvatarCategory[] = [
  'All', 'Basic', 'Retro', 'Music', 'Film', 'Sports', 'Tech', 'Animals', 'Food', 'Nature', 'Fun',
];

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
// Skärmbredds-härledd (delad med Lobby:s era-slider + RoundsRuler, se
// responsive.ts) — fyller kortet på alla telefoner i stället för fast 280 px.
const ERA_SLIDER_WIDTH = TRACK_VIEWPORT_W;
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
    <View style={{ width: ERA_SLIDER_WIDTH, height: 64, marginTop: 4 }}>
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
            <View style={{ width: 52, height: 18, marginTop: 12, transform: [{ rotate: '90deg' }] }}>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', width: 52 }}>
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
  // Save-knapparna skriver profilen till Supabase — spinner + dubbeltrycks-skydd.
  const saveAction = useAsyncAction();
  // Start New Game-raderna i konto-sheet:en (credit-gate + rums-registrering).
  const createAction = useAsyncAction();
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
  // Automatiska klampningar (premium saknas → Max 4, rundor över taket) är
  // normalisering, inte användarändringar — uppdatera snapshoten så de
  // aldrig triggar "Unsaved changes".
  const rebaseSnapshot = (patch: Record<string, unknown>) => {
    if (!savedSnapshotRef.current) return;
    try {
      savedSnapshotRef.current = JSON.stringify({ ...JSON.parse(savedSnapshotRef.current), ...patch });
    } catch { /* ignore */ }
  };
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [playerName, setPlayerName]           = useState('Player One');
  const [email, setEmail]                     = useState<string>('');
  const [birthYear, setBirthYear]         = useState<number | null>(null);
  const [assistance, setAssistance]       = useState<AssistanceLevel | null>(null);
  // Countdown-röst (röstpack-id, eller DEFAULT_VOICE_ID = system-TTS).
  const [voice, setVoice]                 = useState<string>(DEFAULT_VOICE_ID);
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
  // Multiplayer v2: the lobby derives the mode from devices, so the profile
  // has no mode choice — the default is All at Once (20 rounds with Premium;
  // a 1 by 1 game is clamped to 4 in the lobby / at Start).
  const multiplayerV2Profile = getCachedFeatureGates().multiplayerV2;
  const roundsMax =
    hasPremium && (multiplayerV2Profile || gameMode === 'individual-devices')
      ? ROUNDS_MAX_INDIV
      : ROUNDS_MAX_PASS;
  // Ej premium → klampas alltid till Max 4. Effekten körs både när hasPremium
  // ändras (t.ex. sub löper ut) OCH när maxPlayers sätts till 12 från sparad
  // profil (race-safe: efffekten fyrar vid maxPlayers-ändringen → sätter 4 →
  // effekten fyrar igen men condition är false → stannar).
  useEffect(() => {
    if (!hasPremium && maxPlayers > 4) {
      setMaxPlayers(4);
      rebaseSnapshot({ maxPlayers: 4 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPremium, maxPlayers]);
  // HCP-sköldarnas visningsvärde. Seedas synkront ur profil-spegeln (undviker
  // flimmer vid mount) men uppdateras på FOCUS ur den AUKTORITATIVA progress-
  // storen (loadOwnHcpBundle), så ett HCP som ändrades i ett nyss spelat spel
  // garanterat visas här — även om profil-spegeln (profile.hcp) råkat bli stale.
  const [hcpDisplayBundle, setHcpDisplayBundle] = useState(() => {
    const cat = getCachedProfile()?.hcpByCategory;
    return {
      total: resolveDisplayHcp(cat?.total ?? getCachedProfile()?.hcp),
      music: resolveDisplayHcp(cat?.music),
      film: resolveDisplayHcp(cat?.film),
    };
  });
  // §2.4 — kör inaktivitets-decay vid varje Profile-focus (persisterar + speglar)
  // och läs sedan det färska display-bundlet ur progress-storen. useFocusEffect
  // (inte mount-only) så återkomst efter ett spel alltid visar rätt HCP.
  useFocusEffect(
    useCallback(() => {
      // Region scope HCP är kopplat till — spelarens egen content-breadth (V1
      // alltid 'sweden').
      const region = getCachedProfile()?.region ?? 'sweden';
      let active = true;
      void refreshOwnHcpDecay(region);
      void loadOwnHcpBundle(region).then((b) => {
        if (active) {
          setHcpDisplayBundle({
            total: resolveDisplayHcp(b.total),
            music: resolveDisplayHcp(b.music),
            film: resolveDisplayHcp(b.film),
          });
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );
  const handleSelectMaxPlayers = (n: 4 | 12) => {
    if (n === 12 && !multiplayerV2Profile && gameMode !== 'individual-devices') {
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
      // Haptiken fyras nu av den wrappade tryck-primitiven (se src/components/haptic).
      return next;
    });
  };
  const handleIncrementRounds = () => {
    if (roundsCount >= roundsMax) {
      if (!multiplayerV2Profile && (gameMode === 'pass-the-phone' || gameMode === 'remote-1v1')) {
        Alert.alert('More rounds not available', 'More than 4 rounds is only available with both Individual device and Premium activated.');
      }
      return;
    }
    setRoundsCount((prev) => {
      const next = Math.min(roundsMax, prev + ROUNDS_STEP);
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
      const clamped = Math.max(ROUNDS_MIN, roundsMax);
      setRoundsCount(clamped);
      rebaseSnapshot({ roundsCount: clamped });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Home v2 (2026-10-16): ingen FREE-badge (gratis = normalt), guld
            kant + guld ✓ = vald. redIndiv ger inte längre röd text — rött
            betyder fel/destruktivt, inte "ej tillgängligt". */}
        <Text
          style={[styles.modeLabel, { textAlign: 'center' }, smallText && { fontSize: FontSize.xs }, isActive && styles.modeLabelActiveFree]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {isActive && (
          <Text style={styles.modeCheck} pointerEvents="none">✓</Text>
        )}
      </Pressable>
    );
  };

  const [yearPickerOpen, setYearPickerOpen]     = useState(false);
  const [assistancePickerOpen, setAssistancePickerOpen]   = useState(false);
  const [voicePickerOpen, setVoicePickerOpen]   = useState(false);
  // Film/TV-kolumnens bredd (onLayout) → högerinsättning som gör att Spotify-
  // och Parent Control-togglarna linjerar exakt med Film/TV-togglarna (som är
  // centrerade i kolumnen) på alla skärmbredder. Kolumnen har 1 pt vänsterkant.
  const [filmColWidth, setFilmColWidth] = useState(0);
  const mixerToggleRightInset = filmColWidth
    ? Math.max(0, (filmColWidth - 1 - quizVibeToggleWidth('mixer')) / 2)
    : Spacing.sm;
  // "+"-utfällning av per-kategori-HCP-sköldarna (Music/Film). Default av.
  const [hcpCategoriesExpanded, setHcpCategoriesExpanded] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [answerResponsePickerOpen, setAnswerResponsePickerOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  // "Join with Room code" från konto-menyn öppnar Home:s Join-formulär
  // HÄR, ovanpå Profile — Cancel tar användaren tillbaka till menyn.
  const [joinVisible, setJoinVisible] = useState(false);
  const inviteSignal = useWaitingInviteSignal();
  // Synkron fokus-spegel: JoinModal anropar onClose även efter en lyckad
  // join (då har /lobby redan pushats och Profile tappat fokus) — menyn
  // ska bara öppnas igen vid Cancel, dvs. när Profile fortfarande har fokus.
  const profileFocusedRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      profileFocusedRef.current = true;
      return () => { profileFocusedRef.current = false; };
    }, []),
  );
  // Lobbytyp-utfällning under "Start New Game" i logout-sheet:n — samma
  // inline-väljare (Single Game / Multiplayer Game / Head-to-head) som Home:s
  // "Start New Game" (Peter 2026-08-29). Kollapsas när sheet:en stängs.
  const [hostTypeExpanded, setHostTypeExpanded] = useState(false);
  // Konto-sheet:en ligger ovanför nav-stacken (iOS): nästa skärm glider in
  // bakom den. Stäng den först när pushen landat, annars syns Profile ett
  // ögonblick innan nästa skärm (Peter 2026-10-21).
  const closeSheetBehindNav = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setHostTypeExpanded(false);
        setLogoutModalVisible(false);
        resolve();
      }, 350);
    });
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
  // MUSIC-ONLY LAUNCH: per-kategori-HCP-utfällningen borttagen (bara Total-sköld).
  // Host default settings-blocket (Game Mode → Number of Rounds) —
  // egen huvudrubrik mellan Profile defaults och Game connections, samma
  // kollapsbara mönster som de övriga top-level sektionerna.
  const [hostDefaultsExpanded, setHostDefaultsExpanded] = useState(false);
  // "Parent controlled"-dialogen (paketrad-info) + scroll-mål för "Go to
  // Parent Control". Y = Host-sektionens preview (direkt barn till scroll-
  // innehållet) + Parent Control-fältets y inuti den — onLayout-kedja, inte
  // measureLayout (no-op på Fabric).
  const [parentControlledDialogOpen, setParentControlledDialogOpen] = useState(false);
  const hostPreviewYRef = useRef<number | null>(null);
  const parentControlFieldYRef = useRef<number | null>(null);
  const pendingParentControlScrollRef = useRef(false);
  const tryScrollToParentControl = () => {
    if (!pendingParentControlScrollRef.current) return;
    const a = hostPreviewYRef.current;
    const b = parentControlFieldYRef.current;
    if (a == null || b == null) return;
    pendingParentControlScrollRef.current = false;
    scrollRef.current?.scrollTo({ y: Math.max(0, a + b - Spacing.lg), animated: true });
  };
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
  // Parent Control blockerar parent-restricted-paket (Hip Hop & RnB) —
  // dialogen erbjuder "Deactivate now" (PC av + paketet på i samma tryck).
  const [pcBlockedPackageId, setPcBlockedPackageId] = useState<string | null>(null);
  const handleToggleHostPackage = (id: string) => {
    if (
      !enabledHostPackages.includes(id) &&
      parentControlEnabled &&
      PURCHASED_PACKAGES.find((p) => p.id === id)?.parentRestricted
    ) {
      setPcBlockedPackageId(id);
      return;
    }
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
  const sourcesAllEnabled = artistsAllOn && actorsAllOn;
  const enabledSourceColumnsCount = [artistsEnabled, actorsEnabled].filter(Boolean).length;
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

  // ── Parent Control ───────────────────────────────────────────────────
  // Host-default: när på filtreras YT-items taggade parentControlled bort ur
  // frågeurvalet i alla spel där denna profil är host. Default PÅ (safe default;
  // load-effekten sätter om från profilen via `?? true`).
  const [parentControlEnabled, setParentControlEnabled] = useState(true);
  // Turning OFF kräver bekräftelse (mature-content-varning); turning ON sker
  // direkt — ett aktiverat paket i Profile betyder bara "valbart i lobby", så
  // ingen paket-hantering behövs här (Peter 2026-09-15).
  const handleToggleParentControl = (next: boolean) => {
    if (next) {
      setParentControlEnabled(true);
      return;
    }
    Alert.alert(
      'Parent Control',
      'I am aware that this activates mature content, some of it might not be appropriate for children. Still want to deactivate Parent control?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => setParentControlEnabled(false) },
      ],
    );
  };

  const [smColWidth, setSmColWidth] = useState(0);
  const smCellStyle = smColWidth > 0 ? { width: smColWidth } : undefined;

  // YouTube och Hints är OBEROENDE — ingen auto-sync mellan källorna.

  const handleToggleAllSources = (value: boolean) => {
    if (!value && !spotifyEnabled) {
      Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.');
      return;
    }
    // Music + Film (de enda live kategorierna sedan Sport togs bort 2026-09).
    setYoutubeEnabledCategories(value ? ['Music', 'Film'] : []);
    setImagesEnabledCategories(value ? ['Music', 'Film'] : []);
    if (value && spotifyConnected) setSpotifyEnabled(true);
  };

  const handleToggleArtistsColumn = (value: boolean) => {
    if (!value && !spotifyEnabled) {
      const remainingActors = [
        youtubeEnabledCategories.includes('Film'),
        imagesEnabledCategories.includes('Film'),
      ].filter(Boolean).length;
      if (remainingActors < 2) {
        Alert.alert('Not applicable', 'Enable at least 2 Actors combinations before turning off Artists, or keep Spotify active.');
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
        // Utan Music-källa (Artists) finns inget kvar när Actors stängs av.
        Alert.alert('Not applicable', 'Enable Artists or Spotify before turning off Actors.'); return;
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

  const handleToggleArtistsYoutube = (value: boolean) => {
    if (!value && !spotifyEnabled) {
      const artistsWouldStillBeActive = imagesEnabledCategories.includes('Music');
      if (!artistsWouldStillBeActive) {
        const remainingActors = [
          youtubeEnabledCategories.includes('Film'),
          imagesEnabledCategories.includes('Film'),
        ].filter(Boolean).length;
        if (remainingActors < 2) {
          Alert.alert('Not applicable', 'Enable at least 2 Actors combinations before turning off Artists, or keep Spotify active.');
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
        const remainingActors = [
          youtubeEnabledCategories.includes('Film'),
          imagesEnabledCategories.includes('Film'),
        ].filter(Boolean).length;
        if (remainingActors < 2) {
          Alert.alert('Not applicable', 'Enable at least 2 Actors combinations before turning off Artists, or keep Spotify active.');
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
        // Utan Music-källa (Artists) finns inget kvar när Actors-YT stängs av.
        Alert.alert('Not applicable', 'Enable Artists or Spotify before turning off Actors.'); return;
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
        // Utan Music-källa (Artists) finns inget kvar när Actors-Hints stängs av.
        Alert.alert('Not applicable', 'Enable Artists or Spotify before turning off Actors.'); return;
      }
      if (enabledColumnsCount <= 1 && !youtubeEnabledCategories.includes('Film')) { Alert.alert('Minimum 1 required', 'At least 1 profession must be enabled.'); return; }
    }
    setImagesEnabledCategories((prev) =>
      value ? ([...new Set([...prev, 'Film'])] as MainCategory[]) : prev.filter((c) => c !== 'Film'),
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
  // Alla tema-paket i PURCHASED_PACKAGES, sorterade alfabetiskt på display-
  // namn (samma localeCompare-ordning som Lobby-listan) så de två vyerna
  // visar paketen i samma sekvens.
  const availablePackages = useMemo<MusicPackage[]>(
    () =>
      [...PURCHASED_PACKAGES].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      ),
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
          // Coerce stale/borttagna röst-id:n (t.ex. 'default'/'cheer' från
          // tidigare lineup) till default-rösten (hype). wasIncomplete nedan
          // triggar en defensiv write så storage konvergerar.
          voice: isValidVoiceId(data.voice) ? data.voice! : DEFAULT_VOICE_ID,
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
          // Per-source categories — default all 3 ENDAST när fältet saknas
          // (aldrig konfigurerat). En tom array `[]` är ett MEDVETET val =
          // hela källan AV (t.ex. Hints av, YouTube på) och måste bevaras —
          // annars skriver denna augment tyst tillbaka alla 3 och ett nytt
          // spel serverar Hints trots att profilen har dem av. Array.isArray
          // hedrar även en legacy-`null` som "saknas".
          youtubeEnabledCategories: Array.isArray(data.youtubeEnabledCategories)
            ? data.youtubeEnabledCategories
            : defaultEnabledMainCategories(),
          imagesEnabledCategories: Array.isArray(data.imagesEnabledCategories)
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
          !isValidVoiceId(data.voice) ||
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
          // Endast SAKNAT fält (aldrig konfigurerat) är ofullständigt — en tom
          // array är ett giltigt "källan av"-val och får INTE trigga en
          // coerce-write tillbaka till alla 3.
          !Array.isArray(data.youtubeEnabledCategories) ||
          !Array.isArray(data.imagesEnabledCategories)
        );
        if (wasIncomplete) {
          saveProfile(augmented).catch(() => { /* silent — vyn fungerar ändå */ });
        }
        setPlayerName(augmented.playerName);
        setEmail(augmented.email ?? '');
        setBirthYear(augmented.birthYear);
        setAssistance(augmented.assistance);
        setVoice(augmented.voice ?? DEFAULT_VOICE_ID);
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
        const clampTo = Math.max(ERA_TO_MIN, Math.min(ERA_MAX, augmented.gameEraTo ?? ERA_MAX));
        const clampFrom = Math.max(ERA_MIN, Math.min(augmented.gameEraFrom ?? 1981, clampTo - ERA_MIN_INTERVAL));
        setEraValues([clampFrom, clampTo]);
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
        const loadedRounds = Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds));
        setRoundsCount(loadedRounds);
        setEnabledHostPackages(augmented.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id));
        setYoutubeEnabledCategories(augmented.youtubeEnabledCategories ?? defaultEnabledMainCategories());
        setImagesEnabledCategories(augmented.imagesEnabledCategories ?? defaultEnabledMainCategories());
        setSpotifyEnabled(augmented.spotifyDefaultEnabled ?? false);
        setSpotifyAnswerYear(augmented.spotifyAnswerYear ?? true);
        setSpotifyAnswerName(augmented.spotifyAnswerName ?? true);
        // Parent Control är default PÅ (safe default för alla QuizVibe-users,
        // inkl. befintliga profiler som aldrig satt fältet → undefined läses PÅ).
        setParentControlEnabled(augmented.parentControlEnabled ?? true);
        // Snapshot av laddad state — jämförs vid navigation bort.
        // gameMode speglar den COERCADE staten (inte rå augmented) så en
        // stale 'remote-1v1'-profil inte fastnar i evig "unsaved changes".
        savedSnapshotRef.current = JSON.stringify({
          birthYear: augmented.birthYear,
          assistance: augmented.assistance,
          voice: augmented.voice ?? DEFAULT_VOICE_ID,
          // Era + rundor: EXAKT de klampade värden som gick in i state —
          // annars ger en gammal profil (era/rundor utanför dagens regler)
          // en evig falsk "Unsaved changes"-popup.
          gameEraFrom: clampFrom,
          gameEraTo: clampTo,
          gameMode: loadedGameMode,
          maxPlayers: augmented.maxPlayers ?? 4,
          roundsCount: loadedRounds,
          answerResponseSeconds: augmented.answerResponseSeconds ?? 30,
          youtubeEnabledCategories: augmented.youtubeEnabledCategories ?? defaultEnabledMainCategories(),
          imagesEnabledCategories: augmented.imagesEnabledCategories ?? defaultEnabledMainCategories(),
          enabledHostPackages: augmented.enabledHostPackages ?? [],
          parentControlEnabled: augmented.parentControlEnabled ?? true,
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
      // Kan inte lägga till sig själv som vän (annars går det att bjuda in sig
      // själv till sin egen lobby). Speglar Lobby:s handleAddFriendFromShare.
      const ownName = (await loadProfile())?.playerName?.trim().toLowerCase();
      if (ownName && trimmed.toLowerCase() === ownName) {
        setAddFriendError("You can't add yourself as a friend");
        return;
      }
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
  const voiceLabel       = VOICE_OPTIONS.find((v) => v.id === voice)?.label;
  // Player-HCP-sköldar (§1.3 UI). Läser den intjänade per-kategori-bundlen ur
  // profil-spegeln (motorn skriver profile.hcpByCategory efter varje spel).
  // Saknas den → 99 för alla (ny spelare / aldrig spelat). Total-sköld + två
  // sub-sköldar (Music/Film) visas alltid i Profile.
  // Läses ur focus-uppdaterade state:n (auktoritativa progress-storen), inte
  // direkt ur profil-spegeln — se hcpDisplayBundle ovan.
  const hcpShieldBundle = hcpDisplayBundle;
  const regionLabel = REGION_OPTIONS.find((r) => r.id === region)?.label;
  const answerResponseLabel = ANSWER_RESPONSE_OPTIONS.find(
    (o) => o.id === answerResponseSeconds,
  )?.label;

  const handleSave = async (section: 'defaults' | 'host' | 'packages') => {
    // Spotify DJ kräver Individual Devices-läge — blockera om Spotify är på
    // men mode-valet inte är IndDev.
    // v2: no mode default exists — the lobby forces All at Once for Spotify.
    if (spotifyEnabled && !multiplayerV2Profile && gameMode !== 'individual-devices') {
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
        parentControlEnabled,
        voice,
      });
      savedSnapshotRef.current = JSON.stringify({
        birthYear, assistance, voice,
        gameEraFrom: eraValues[0], gameEraTo: eraValues[1],
        gameMode, maxPlayers, roundsCount,
        answerResponseSeconds, youtubeEnabledCategories,
        imagesEnabledCategories, enabledHostPackages,
        parentControlEnabled,
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
      birthYear, assistance, voice,
      gameEraFrom: eraValues[0], gameEraTo: eraValues[1],
      gameMode, maxPlayers, roundsCount,
      answerResponseSeconds, youtubeEnabledCategories,
      imagesEnabledCategories, enabledHostPackages,
      parentControlEnabled,
    });
    // Profilen har inte laddats klart (loadProfile gör en Supabase-roundtrip)
    // → inget att jämföra mot, alltså inga osparade ändringar.
    if (!savedSnapshotRef.current) return false;
    // Jämför fält för fält; arrayer oberoende av ordning (samma kategorier/
    // paket i annan ordning är ingen ändring).
    const norm = (v: unknown) =>
      Array.isArray(v) ? JSON.stringify([...v].map(String).sort()) : JSON.stringify(v ?? null);
    let saved: Record<string, unknown>;
    try {
      saved = JSON.parse(savedSnapshotRef.current);
    } catch {
      return false;
    }
    const now = JSON.parse(current) as Record<string, unknown>;
    const changed = Object.keys(now).filter((k) => norm(now[k]) !== norm(saved[k]));
    if (__DEV__ && changed.length > 0) {
      console.log('[Profile] unsaved fields:', changed.map((k) => `${k}: ${norm(saved[k])} → ${norm(now[k])}`));
    }
    return changed.length > 0;
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

  // Bottom-bannerns Home/Store-tabbar (som lever i _layout utanför skärmen)
  // ska ge samma "Unsaved changes"-popup. Ref-spegel så den registrerade
  // guarden alltid läser aktuellt state; registreras bara medan Profile har
  // fokus.
  const guardedNavigateRef = useRef(guardedNavigate);
  useEffect(() => {
    guardedNavigateRef.current = guardedNavigate;
  });
  useFocusEffect(
    useCallback(
      () => setNavigationGuard((navigate) => guardedNavigateRef.current(navigate)),
      [],
    ),
  );

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
  const [loggingOut, setLoggingOut] = useState(false);
  const handleConfirmLogout = async () => {
    // supabase.auth.signOut() MÅSTE köras innan clearProfile() — annars
    // lever Supabase-sessionen vidare i AsyncStorage även när profil-cachen
    // är borta. Konsekvensen är att efterföljande supabase.functions.invoke()
    // skickar en stale JWT (förmodlig orsak till delete-account-bugen som
    // dök upp 2026-05-23). Speglar Home-skärmens handleLogout-pattern.
    // FÖRE signOut (kräver levande session): städa bort kontots aktiva
    // lobby-deltaganden så en annan enhet med samma konto inte längre
    // blockeras av "redan aktiv login"-guarden. Best-effort, med tidstak
    // (performLogout, 2026-10-21) så utloggningen aldrig ser ut att hänga.
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await performLogout();
      track('user_logged_out');
      resetIdentity();
    } finally {
      setLoggingOut(false);
      setLogoutModalVisible(false);
      router.replace('/');
    }
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
    setDeleteConfirmSource(null);
    setLogoutModalVisible(false);
    router.replace('/');
  };

  // Wrapper som visar två-stegs confirmation FÖRE deletion. Tydlig copy
  // om irreversibilitet — Apple-review tittar specifikt efter att flödet
  // inte är "oavsiktligt destruktivt".
  // UI 2026-10-19: native Alert ersatt av mörk QuizVibeDialog. Källan styr
  // VAR dialogen renderas — från logout-sheet:en måste den ligga inuti
  // sheet:ens Modal (QuizVibeDialogOverlay), annars kan två samtidiga RN-
  // Modals sväljas på iOS. Flödet (Cancel / Delete → handleConfirmDeleteAccount)
  // är oförändrat.
  const [deleteConfirmSource, setDeleteConfirmSource] = useState<'screen' | 'sheet' | null>(null);
  const handleRequestDeleteAccount = (source: 'screen' | 'sheet') => {
    setDeleteConfirmSource(source);
  };
  const deleteConfirmProps = {
    title: 'Delete account?',
    message:
      'This will permanently delete your QuizVibe account and all associated data, including your profile, game history and friends.',
    warning: 'This cannot be undone.',
    icon: <TrashIcon size={22} color="rgba(255,107,107,0.9)" />,
    secondaryLabel: 'Cancel',
    primaryLabel: 'Delete Account',
    destructive: true,
    // 2026-10-20: dra-för-att-radera i stället för en knapp. Dialogen står
    // kvar under raderingen ("Deleting account…"); vid fel återställs
    // slidern och den vanliga felmeddelande-Alerten visas.
    slideToConfirm: {
      label: 'Slide to permanently delete',
      busyLabel: 'Deleting account…',
      busy: deletingAccount,
      accessibilityHint:
        'Drag all the way to the right to permanently delete your account. This cannot be undone.',
    },
    onClose: () => {
      if (!deletingAccount) setDeleteConfirmSource(null);
    },
    onPrimary: () => {
      if (deletingAccount) return;
      handleConfirmDeleteAccount();
    },
  };

  // Create Game-genväg från logout-sheet:n. Identisk logik som Home-
  // skärmens handleCreateGame — credit-gate först (Out of Host Game
  // Credits-popup om Free = 0 och user inte har Premium; engångsköpta
  // Extras borttagna 2026-07-07), sedan generera kod, registrera rum,
  // rensa stale mock-stores, tracka event och navigera till /lobby.
  // Inlinad här istället för delad utility tills en tredje call-site
  // dyker upp (då lyfter vi till en delad helper i src/utils/).
  const handleCreateGame = async (lobbyType: HostLobbyType = 'multiplayer') => {
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
    // Two-device-guard: kan inte hosta ett nytt spel medan kontot redan är
    // aktivt i en annan lobby på en annan enhet.
    if (await checkActiveElsewhere()) return;
    const code = generateRoomCode();
    // Remote 1vs1 är alltid exakt 2 spelare. Sätts redan här (i stället för
    // att vänta på LobbyScreen:s setRoomMaxPlayers-effekt) så kapacitets-
    // kollen vid join är korrekt från första sekunden. Speglar Home:s
    // handleCreateGame — se app/index.tsx.
    const isRemote1v1 = lobbyType === '1v1';
    // Returvärdet MÅSTE kontrolleras — en tyst no-op ger en fantom-lobby
    // som joiners inte hittar ("Room not found"-buggen 2026-08-07).
    const roomRegistered = await registerActiveRoom(code, {
      maxPlayers: isRemote1v1 ? 2 : freshProfile?.maxPlayers ?? 4,
      hostIsPremium: freshHasPremium,
      currentPlayerCount: 1,
      hostPlayerName: freshProfile?.playerName ?? '',
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
    clearLeftPlayers(code);
    clearLobbyPlayers(code);
    clearLobbySettings(code);
    clearEjected(code);
    clearGameStarted(code);
    track('room_code_created');
    // lobbyType styr lobbyns förvalda läge ('single'/'multiplayer') resp.
    // remote-läget ('1v1') — samma param som Home skickar.
    // Push FÖRST, stäng sheet:en när lobbyn landat (ingen Profile-glimt).
    router.push({ pathname: '/lobby', params: { code, isHost: 'true', lobbyType } });
    // Await:as så radens spinner står kvar tills sheet:en försvunnit.
    await closeSheetBehindNav();
  };

  // Spotify-svarslägen — renderas i både rad- och staplad layout (Type-blocket).
  // Samma guards som förut: minst ett svarsläge måste vara på.
  const renderSpotifyYearToggle = () => (
    <QuizVibeToggle
      variant="mixer"
      value={spotifyAnswerYear}
      onValueChange={(v) => {
        if (!v && !spotifyAnswerName) {
          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
          return;
        }
        setSpotifyAnswerYear(v);
      }}
      accessibilityLabel="Spotify answer type Year"
    />
  );
  const renderSpotifyNameToggle = () => (
    <QuizVibeToggle
      variant="mixer"
      value={spotifyAnswerName}
      onValueChange={(v) => {
        if (!v && !spotifyAnswerYear) {
          Alert.alert('At least one answer type required', 'At least one Spotify answer type must be enabled.');
          return;
        }
        setSpotifyAnswerName(v);
      }}
      accessibilityLabel="Spotify answer type Name"
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top board (login status) — sticky utanför ScrollView. Klick på
          pillen öppnar logout-modalen (samma visuella sheet som Home-
          skärmens profileMenu). Bannern self-loadar profil via
          useFocusEffect så den uppdateras när vi navigerar tillbaka efter
          login/edit på andra skärmar. */}
      <TopUserBanner
        open={logoutModalVisible}
        onPress={() => { setHostTypeExpanded(false); setLogoutModalVisible(true); }}
        // Ingen Home-länk här (Peter 2026-10-16) — bottennavigeringens Home
        // räcker och går genom samma unsaved-changes-guard.
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
              <View style={styles.creditsMembershipBadge}>
                <Text style={styles.creditsMembershipBadgeText}>PREMIUM</Text>
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
            {/* Dämpad ikon även utfälld — guld reserveras för Save Profile. */}
            <ProfileOutlineIcon size={24} color={BrandUi.iconMuted} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Profile default settings</Text>
          <SectionToggle expanded={profileDefaultsExpanded} />
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
              accessibilityRole="button"
              accessibilityLabel="Change avatar"
            >
              <Avatar
                emoji={source === 'default' ? undefined : selectedAvatar?.emoji}
                useBrandFallback={source === 'default'}
                brandColor={Colors.warning}
                // Q:t krympt ~6 % och lyft ~4 pt — optiskt centrerat med
                // plats för redigera-badgen nere till höger.
                brandMarkScale={0.525}
                brandOffsetY={-4}
                size={96}
              />
              {/* Liten redigera-badge nere till höger — hela avataren (96 pt)
                  är tap-ytan, så badgen kan vara visuellt liten. */}
              <View style={styles.changeBadge} pointerEvents="none">
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path
                    d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z M13.5 8.5l3 3"
                    stroke={Colors.warning}
                    strokeWidth={1.9}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </Pressable>

            {/* Player Name är read-only i profil-kortet — sätts vid
                registrering och kan inte redigeras härifrån. */}
            <Text style={styles.playerNameDisplay} numberOfLines={1}>
              {playerName}
            </Text>

            {/* Total-HCP-sköld under avatar + namn (§1.3, Total = snittet
                Music + Film). Music/Film fälls ut via "HCP per category"-raden
                i höger-kolumnen. */}
            <View style={styles.hcpShieldWrap}>
              <HCPShieldCard hcp={hcpShieldBundle.total} size={54} label="Total" badgeColor={Colors.background} badgeTextColor={Colors.textPrimary} badgeBorderColor={Colors.warning} />
            </View>
          </View>

          {/* Högerkolumn: competition setup */}
          <View style={styles.rightColumn}>
            <Text style={styles.setupHeader}>
              User default settings
            </Text>

            {/* Competition Year of birth */}
            <View style={styles.field}>
              <Text style={styles.fieldLabelPlain}>Year of birth</Text>
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
                <ChevronIcon size={16} />
              </Pressable>
            </View>

            {/* Competition Age (auto-beräknad, icke-tappbar). Värdet
                visas inline till höger om labeln så raden inte tar mer
                vertikal yta än gap-en till intilliggande fält. */}
            <View style={styles.ageRow}>
              <Text style={styles.fieldLabelPlain}>Age</Text>
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
                <Text style={styles.fieldLabelPlain}>Assistance level</Text>
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
                <ChevronIcon size={16} />
              </Pressable>
            </View>

            {/* Countdown voice */}
            <View style={styles.field}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.fieldLabelPlain}>Voice</Text>
                <Pressable
                  style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => Alert.alert(
                    'Voice',
                    'The voice used in the app — the 3-2-1 countdown before each question and the "QuizVibe" welcome in the lobby. Choose a female or male voice, or "No voice" for a silent countdown.\n\nTap the ▶ button in the list to hear a voice before choosing.',
                  )}
                  hitSlop={8}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => setVoicePickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text style={styles.selectorText}>
                  {voiceLabel ?? 'Female voice'}
                </Text>
                <ChevronIcon size={16} />
              </Pressable>
            </View>

            {/* "HCP per category"-rad — under Voice-dropdownen i höger-
                kolumnen. "+"/"−"-toggle fäller ut Music/Film-sköldarna.
                Rubriken i samma font som fält-labels ("Assistance level"). */}
            <Pressable
              onPress={() => setHcpCategoriesExpanded((v) => !v)}
              hitSlop={8}
              style={({ pressed }) => [styles.hcpCatHeaderRow, pressed && { opacity: 0.7 }]}
            >
              <View
                style={[styles.hcpCatToggleBox, hcpCategoriesExpanded && { borderColor: 'rgba(245,166,35,0.55)' }]}
              >
                <ChevronIcon
                  size={16}
                  strokeWidth={2}
                  color={hcpCategoriesExpanded ? Colors.warning : Colors.textSecondary}
                  direction={hcpCategoriesExpanded ? 'up' : 'down'}
                />
              </View>
              <Text style={styles.fieldLabelPlain}>HCP by category</Text>
            </Pressable>
            {/* Per-kategori-HCP (§1.3) — full-bredds-rad, utfälld via raden ovan.
                Bara Music + Film (Sport parkerad). Badge-färgen matchar
                GetReady/countdown-vyns kategori-badge (guld + svart). */}
            {hcpCategoriesExpanded && (
              <View style={styles.hcpSubRow}>
                {/* ~18 % mindre än förr (56) så Total förblir primär; mörka
                    pills med tunn guldkant i stället för solida guld-badges. */}
                <HCPShieldCard hcp={hcpShieldBundle.music} size={46} label="Music" badgeColor={Colors.background} badgeTextColor={Colors.textPrimary} badgeBorderColor={Colors.warning} badgeMinWidth={68} />
                <HCPShieldCard hcp={hcpShieldBundle.film} size={46} label="Film/TV" badgeColor={Colors.background} badgeTextColor={Colors.textPrimary} badgeBorderColor={Colors.warning} badgeMinWidth={68} />
              </View>
            )}

          </View>
          </View>

          {/* ── Save (inuti kortet) ─────────────────────────────── */}
          <Button
            label={savedSection === 'defaults' ? '✓ Saved' : 'Save Profile'}
            onPress={() => saveAction.run('defaults', () => handleSave('defaults'))}
            loading={saveAction.isBusy('defaults')}
            variant={savedSection === 'defaults' ? 'secondary' : 'gold'}
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
          <View style={styles.sectionHeaderIcon}>
            <CrownOutlineIcon size={24} color={sectionIconColor(hostDefaultsExpanded)} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Host default settings</Text>
          <SectionToggle expanded={hostDefaultsExpanded} />
        </Pressable>
        {!hostDefaultsExpanded && <View style={styles.sectionDivider} />}

        {hostDefaultsExpanded && (
        <>
        <View
          style={[styles.preview, { gap: Spacing.xl }]}
          onLayout={(e) => {
            hostPreviewYRef.current = e.nativeEvent.layout.y;
            tryScrollToParentControl();
          }}
        >
          {/* ── Game Mode (host-default) ─────────────────────────
              Pass-the-Phone (gratis) vs Individual Devices (Premium).
              Speglar Lobby:s Game Mode-toggle exakt — grön aktiv för
              Pass-the-Phone (free), guld aktiv för Individual Devices
              (premium-läge). Försök att välja Individual Devices utan
              Premium triggar Store-omdirigering. */}
          <View style={styles.field}>
            {/* Rubrik + info-ikon (flyttad hit från den borttagna MULTIPLAYER-
                klammern under rutorna — Profile v2, 2026-10-16). Single player
                och Remote (1vs1) är INTE host-defaults: de väljs per spel via
                "Start New Game" på Home (2026-08-26). */}
            {/* Multiplayer v2: no mode default — the lobby derives it. */}
            {!multiplayerV2Profile && (
            <>
            <View style={styles.regionLabelRow}>
              <Text style={styles.sectionLabel}>Multiplayer Game Mode</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() =>
                  Alert.alert(
                    'Multiplayer mode',
                    'This is your default for Multiplayer games.\n\nPass-the-Phone: All players share one device. Max 4 players, even with Premium. Spotify not applicable for PtP mode.\n\nIndividual device: Each player uses their own device. Max 4 players on Basic, max 12 players with Premium.\n\nSingle player and Head-to-head are picked per game on the Home screen — tap Start New Game and choose "Single Game" or "Head-to-head".',
                  )
                }
                hitSlop={8}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
            </View>
            <View style={[styles.modeRow, { marginTop: Spacing.sm }]}>
              {renderModeBox('ptp', 'Pass-the-Phone', true)}
              {renderModeBox('indiv', 'Individual device', true)}
            </View>
            </>
            )}
            {/* Players — max antal spelare (Max 4 gratis / Max 12 Premium). */}
            <View style={styles.playersLabelRow}>
              <Text style={[styles.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>Players</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Players', `Max 4 players - use as standard and applicable for all Single and Multiplayer modes.\n\nMax 12 players - only applicable with ${modeLabels(multiplayerV2Profile).allAtOnce} mode.`)}
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
                {maxPlayers === 4 && <Text style={styles.modeCheck} pointerEvents="none">✓</Text>}
              </Pressable>
              {/* Max 12: aktiv (guld) när maxPlayers===12. Badge grå/guld per premium-status. */}
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  maxPlayers === 12 ? styles.modeOptionPassActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectMaxPlayers(12)}
              >
                {/* Låst Premium-val: dämpat + lås-ikon; den lilla guld-
                    PREMIUM-badgen bär förklaringen (aldrig rött). */}
                <View style={[styles.lockedContentRow, !hasPremium && styles.lockedContent]}>
                  {!hasPremium && <LockOutlineIcon size={13} />}
                  <Text style={[styles.modeLabel, { textAlign: 'center' }, maxPlayers === 12 && styles.modeLabelActiveFree]}>
                    Max 12 players
                  </Text>
                </View>
                {maxPlayers === 12 && <Text style={styles.modeCheck} pointerEvents="none">✓</Text>}
                <View style={styles.premiumBadge} pointerEvents="none">
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
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
              <ChevronIcon size={16} direction="down" />
            </TouchableOpacity>
          </View>

          {/* Source Mixerboard */}
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Quiz Mixer</Text>
            {/* Grå ram runt hela mixerboarden (Spotify + YouTube + Hints) —
                samma setup som lobby-vyn. Spotify-blockets egen bg borttagen så
                ramen blir en enda enhetlig box. */}
            <View style={styles.mixerboardBox}>
            {/* Spotify DJ-rad — alltid synlig, tillgänglig om konto kopplat */}
            <View style={{ marginBottom: Spacing.xs, paddingBottom: spotifyEnabled ? 6 : 0 }}>
            {/* Attest-box "I have Spotify App on this device" — samma som lobby-vyn.
                Kant-skärande namn-badge (grön=bekräftat, röd=ej), toggle höger. */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginLeft: Spacing.sm,
                marginRight: 0,
                marginTop: 6,
                // Ingen ram (Peter 2026-10-19) — toggeln bär läget.
                paddingLeft: Spacing.sm,
                paddingRight: mixerToggleRightInset,
                paddingVertical: 6,
              }}
            >
              {/* Namn-badgen på attest-boxen borttagen (Peter 2026-10-19). */}
              <Text style={[styles.spotifyLinkText, { color: Colors.textPrimary, fontSize: FontSize.sm, flex: 1, textDecorationLine: 'none' }]}>
                I have Spotify App on this device
              </Text>
              <QuizVibeToggle
                variant="mixer"
                value={spotifyConnected}
                onValueChange={handleToggleSpotifyUser}
                accessibilityLabel="I have Spotify App on this device"
              />
            </View>
            {/* paddingRight = attest-radens (Spacing.sm) så Spotify-toggeln linjerar med de andra. */}
            <View style={[styles.spotifyDJRow, { backgroundColor: undefined, borderRadius: undefined, marginBottom: 0, paddingRight: mixerToggleRightInset }]}>
              <View style={[styles.connectionIconWrap, { alignSelf: 'flex-start', marginTop: 1, marginLeft: -2 }]}>
                <SpotifyBrandIcon size={22} variant="white" />
              </View>
              <View style={{ flex: 1, alignSelf: 'flex-start', marginTop: 6, marginLeft: -8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.connectionLabel, { minWidth: 0 }]}>Spotify</Text>
                  <Pressable
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => Alert.alert('Spotify', `• Only applicable in ${modeLabels(multiplayerV2Profile).allAtOnce} mode\n\n• For Spotify music, one player at a time (the DJ) will be directed via QuizVibe to Spotify\n\n• The DJ needs the Spotify app on their device — free or Premium`, [
                      { text: 'Guide How it works', onPress: () => setSpotifyGuideVisible(true) },
                      { text: 'Close', style: 'cancel' },
                    ])}
                    hitSlop={8}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
                {/* Attest ("I have Spotify App...") ligger i egen box ovanför —
                    samma som lobby-vyn. Guide via info-ikonens popup. */}
              </View>
              {/* Enabled/Disabled-pill + toggle (samma som lobby). Pillen visas
                  bara när Spotify är attestat; speglar spotifyEnabled-läget. */}
              <View style={[styles.spotifyHostControls, { alignSelf: 'center', gap: Spacing.sm }]}>
                {/* "Enabled/Disabled"-pillen borttagen 2026-10-19 — den speglade
                    bara spotifyEnabled, dvs. exakt samma läge som toggeln visar. */}
                {/* Låst (disabled) tills Spotify är attesterat — som förut. */}
                <QuizVibeToggle
                  variant="mixer"
                  value={spotifyConnected && spotifyEnabled}
                  onValueChange={spotifyConnected ? handleToggleSpotifyEnabled : undefined}
                  disabled={!spotifyConnected}
                  accessibilityLabel="Spotify DJ"
                />
              </View>
            </View>
            {spotifyEnabled && (
              // Hela Type-blocket höger-ställt (alignItems:'flex-end'): "Type:"-
              // header + Year/Name-rader nära högerkanten, label direkt till
              // vänster om sin toggle. Togglarna (marginRight -16) linjerar under
              // Spotify/YouTube/Hints-togglarna. Speglar lobby-vyn.
              // Inre block vänsterställt så "Type:", "Year" och "Name" börjar på
              // samma x (Name står kvar där den stod); togglarna i högerkanten.
              <View style={{ paddingRight: mixerToggleRightInset, paddingTop: 2, paddingBottom: 4, alignItems: 'flex-end' }}>
                {SPOTIFY_TYPE_INLINE ? (
                  // Kompakt: "Type:  Year [toggle]  Name [toggle]" på en rad.
                  <View style={styles.spotifyTypeInline}>
                    <Text style={styles.spotifyTypeHeader}>Type:</Text>
                    <Text style={styles.spotifyTypeInlineLabel}>Year</Text>
                    {renderSpotifyYearToggle()}
                    <Text style={[styles.spotifyTypeInlineLabel, { marginLeft: Spacing.xs }]}>Name</Text>
                    {renderSpotifyNameToggle()}
                  </View>
                ) : (
                  // Smala skärmar: staplat, men tätare.
                  <View style={{ alignItems: 'flex-start' }}>
                    <Text style={styles.spotifyTypeHeader}>Type:</Text>
                    <View style={styles.spotifyTypeRow}>
                      <Text style={styles.spotifyTypeLabel}>Year</Text>
                      {renderSpotifyYearToggle()}
                    </View>
                    <View style={styles.spotifyTypeRow}>
                      <Text style={styles.spotifyTypeLabel}>Name</Text>
                      {renderSpotifyNameToggle()}
                    </View>
                  </View>
                )}
              </View>
            )}
            </View>
            {/* Grått streck mellan Spotify-delen och YouTube-delen (speglar lobby). */}
            <View style={styles.mixerboardDivider} />
            {/* Source × Category Matrix (Music + Film) — host-default.
                Sport parkerat (catalog/deferred/) → ingen Sport-kolumn; lägg
                tillbaka en tredje kolumn + Sport-handlers när Sport av-parkeras.
                Kolumnbredd via smDataStack flex:1 (ingen onLayout-mätning). */}
            <View style={styles.smGrid}>

              {/* Etikett-stack (vänster) */}
              <View style={styles.smLabelStack}>
                <View style={[styles.smHeaderCell, styles.smDataShift]}>
                  <Text style={styles.sourceMatrixAllText}>All</Text>
                </View>
                <View style={[styles.smAllToggleCell, { borderTopLeftRadius: Radius.sm, borderBottomLeftRadius: Radius.sm }]}>
                  <QuizVibeToggle
                    variant="mixer"
                    value={sourcesAllEnabled}
                    onValueChange={handleToggleAllSources}
                    accessibilityLabel="All sources"
                  />
                </View>
                <View style={styles.smLabelSourceCell}>
                  <YouTubeBrandIcon size={20} />
                  <Text style={styles.sourceMatrixSourceText}>YouTube</Text>
                  <Pressable
                    onPress={() => Alert.alert('YouTube sources', '• Artists – music videos\n• Actors – movie clips & trailers')}
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
                      <Circle cx="40" cy="38" r="13" fill="none" stroke={BrandUi.iconMuted} strokeWidth="2.5" />
                      <Path d="M49 47 L53 51" stroke={BrandUi.iconMuted} strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.imagesQMark}>?</Text>
                  </View>
                  <Text style={styles.sourceMatrixSourceText}>Hints</Text>
                  <Pressable
                    onPress={() => Alert.alert('Hints', 'Guess the artist, band or actor from a flag + progressive clues.')}
                    hitSlop={8}
                    style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
              </View>

              {/* Music (Artists) kolumn */}
              <View style={styles.smDataStack}>
                <View style={styles.smHeaderCell}>
                  <Text style={styles.sourceMatrixHeaderText}>Music</Text>
                </View>
                {/* QuizVibeToggle (mixer) med not-ikon i knoppen — ikonen syns i
                    båda lägena; guld är det enda ON-språket. */}
                <View style={styles.smAllToggleCell}>
                  <QuizVibeToggle variant="mixer" value={artistsAllOn} onValueChange={handleToggleArtistsColumn} icon={(color, size) => <MusicNoteIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="All Music sources" />
                </View>
                <View style={styles.smSwitchCell}>
                  <QuizVibeToggle variant="mixer" value={youtubeEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsYoutube} icon={(color, size) => <MusicNoteIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="Music on YouTube" />
                </View>
                <View style={styles.smAutoCell} />
                <View style={styles.smSwitchCell}>
                  <QuizVibeToggle variant="mixer" value={imagesEnabledCategories.includes('Music')} onValueChange={handleToggleArtistsGuessWho} icon={(color, size) => <MusicNoteIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="Music in Hints" />
                </View>
              </View>

              {/* Film (Actors) kolumn */}
              <View
                style={[styles.smDataStack, styles.sourceMatrixColSep]}
                onLayout={(e) => {
                  const w = Math.round(e.nativeEvent.layout.width);
                  setFilmColWidth((prev) => (prev === w ? prev : w));
                }}
              >
                <View style={styles.smHeaderCell}>
                  <Text style={styles.sourceMatrixHeaderText} numberOfLines={1}>Film/TV</Text>
                </View>
                <View style={[styles.smAllToggleCell, { borderTopRightRadius: Radius.sm, borderBottomRightRadius: Radius.sm }]}>
                  <QuizVibeToggle variant="mixer" value={actorsAllOn} onValueChange={handleToggleActorsColumn} icon={(color, size) => <ClapperboardIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="All Film/TV sources" />
                </View>
                <View style={styles.smSwitchCell}>
                  <QuizVibeToggle variant="mixer" value={youtubeEnabledCategories.includes('Film')} onValueChange={handleToggleActorsYoutube} icon={(color, size) => <ClapperboardIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="Film/TV on YouTube" />
                </View>
                <View style={styles.smAutoCell} />
                <View style={styles.smSwitchCell}>
                  <QuizVibeToggle variant="mixer" value={imagesEnabledCategories.includes('Film')} onValueChange={handleToggleActorsGuessWho} icon={(color, size) => <ClapperboardIcon size={size} color={color} strokeWidth={2.2} />} accessibilityLabel="Film/TV in Hints" />
                </View>
              </View>

            </View>
            </View>{/* ── slut grå mixerboard-ram ── */}

          </View>

          {/* Parent Control — host-default. När på filtreras YT-klipp taggade
              parentControlled bort ur frågeurvalet i spel där denna profil är
              host. Placerad under Source Mixerboard, precis ovanför Game era. */}
          <View
            style={styles.field}
            onLayout={(e) => {
              parentControlFieldYRef.current = e.nativeEvent.layout.y;
              tryScrollToParentControl();
            }}
          >
            <View style={styles.regionLabelRow}>
              <Text style={styles.sectionLabel}>Parent Control</Text>
              <Pressable
                style={({ pressed }) => [styles.infoIconBtn, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Parent Control', 'When on, mature content is kept out of the games you host — parent-controlled clips and mature packages are excluded from the question selection.')}
                hitSlop={8}
              >
                <Text style={styles.infoIconText}>i</Text>
              </Pressable>
              {/* QuizVibe-toggle på rubrikraden, högerställd så den linjerar
                  med Film/TV-togglarna (mixerboard-ram 1 + padding 4 = +5 pt).
                  Kontrollerad: avstängningens bekräftelse-Alert lämnar den på
                  ON tills användaren bekräftar. */}
              <View style={{ marginLeft: 'auto', marginRight: mixerToggleRightInset + 5 }}>
                <QuizVibeToggle
                  variant="mixer"
                  value={parentControlEnabled}
                  onValueChange={handleToggleParentControl}
                  accessibilityLabel="Parent Control"
                />
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
                customMarkerLeft={EraMarkerMinusCompact}
                customMarkerRight={EraMarkerPlusCompact}
                markerOffsetY={3}
                selectedStyle={{
                  backgroundColor: Colors.warning,
                  borderRadius: 3,
                  // Profile v2: svag glöd (var 0.85 / 8).
                  shadowColor: Colors.warning,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                  elevation: 1,
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
              {/* + och PREMIUM-pillen i en egen tät grupp så det syns direkt
                  att det är ökningen som är Premium-låst. */}
              <View style={styles.roundsPlusGroup}>
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
                  hitSlop={8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  {/* Låst Premium-intervall: lås + liten guld-PREMIUM-pill. */}
                  {!hasPremium && <LockOutlineIcon size={13} />}
                  <View style={{ backgroundColor: Colors.warning, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#000', letterSpacing: 0.6 }}>PREMIUM</Text>
                  </View>
                </TouchableOpacity>
              )}
              </View>
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
                indivActive={multiplayerV2Profile || gameMode === 'individual-devices'}
                brandV2
              />
            </View>
            <Text style={styles.roundsScopeNote}>
              Applies to Multiplayer games.{'\n'}Single player is limited to 4 rounds.
            </Text>
          </View>

          {/* Game mode quick-select — under RoundsRuler för snabb mode-byte.
              EN rad med två rutor, som huvud-Game Mode-sektionen. */}
          {!multiplayerV2Profile && (
          <View style={[styles.field, { marginTop: -Spacing.sm }]}>
            <View style={styles.modeRow}>
              {renderModeBox('ptp', 'Pass-the-Phone', true)}
              {renderModeBox('indiv', 'Individual device', true)}
            </View>
          </View>
          )}

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
            onPress={() => saveAction.run('host', () => handleSave('host'))}
            loading={saveAction.isBusy('host')}
            variant={savedSection === 'host' ? 'secondary' : 'gold'}
            style={{ height: 48 }}
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
          <View style={styles.sectionHeaderIcon}>
            <PackageOutlineIcon size={24} color={sectionIconColor(customizedPackagesExpanded)} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Customized Host packages</Text>
          <SectionToggle expanded={customizedPackagesExpanded} />
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
                // Starkaste guldet i sektionen: full guldkant med Premium,
                // dämpad guld utan (låst).
                { borderColor: hasPremium ? Colors.warning : 'rgba(245,166,35,0.45)' },
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
              <View style={[styles.lockedContentRow, !hasPremium && styles.lockedContent]}>
                {!hasPremium && <LockOutlineIcon size={13} />}
                <Text style={[styles.modeLabel, hasPremium && styles.modeLabelActiveFree]}>Activate Extra package</Text>
              </View>
              <View style={styles.premiumBadge} pointerEvents="none">
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
              <View style={styles.addPackageChevron} pointerEvents="none">
                <ChevronIcon size={16} />
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
              <Text style={[styles.fieldLabel, styles.packagesSubheading]}>
                Available when you are the Host:
              </Text>
              {/* Select all-toggle göms när bara 1 paket finns — då blir
                  den redundant (single packagets egen toggle gör samma
                  jobb). Aktiveras när themed packages introduceras i v1.1+. */}
              {availablePackages.length > 1 && (
                <View style={styles.selectAllRow}>
                  <Text style={styles.selectAllLabel}>Select all</Text>
                  {/* Compact QuizVibeToggle — samma logik som förut. */}
                  <QuizVibeToggle
                    variant="mixer"
                    value={isAllPackagesEnabled}
                    onValueChange={handleToggleAllPackages}
                    accessibilityLabel="Select all packages"
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
                      // Profile v2-paketrad (2026-10-19): [identitet] [namn]
                      // [i] [compact-toggle]. Toggeln bär ON-signalen; raden
                      // får bara en svag guldkant när paketet är på.
                      <View
                        key={pkg.id}
                        style={[styles.packageListRow, isEnabled && styles.packageListRowOn]}
                      >
                        {hasPackageThumbnail(pkg.id) ? (
                          <View style={styles.packageThumbWrap}>
                            <PackageThumbnail
                              packageId={pkg.id}
                              state={
                                isEnabled
                                  ? 'on'
                                  : parentControlEnabled && pkg.parentRestricted
                                    ? 'unavailable'
                                    : 'off'
                              }
                            />
                          </View>
                        ) : (
                          <MusicNoteIcon size={18} color={isEnabled ? Colors.warning : BrandUi.iconMuted} />
                        )}
                        <View style={styles.packageNameWrap}>
                          <Text
                            style={[styles.packageRowText, !isEnabled && styles.packageRowTextInactive]}
                            numberOfLines={2}
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
                        {/* Info-ikon bara på parent-restricted paket (Hip Hop & RnB). */}
                        {pkg.parentRestricted && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.infoIconBtn,
                            styles.infoIconBtnSubtle,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => setParentControlledDialogOpen(true)}
                          hitSlop={12}
                          accessibilityLabel={`${pkg.name} info`}
                        >
                          <Text style={[styles.infoIconText, styles.infoIconTextSubtle]}>i</Text>
                        </Pressable>
                        )}
                        <QuizVibeToggle
                          variant="mixer"
                          value={isEnabled}
                          onValueChange={() => handleToggleHostPackage(pkg.id)}
                          accessibilityLabel={pkg.name}
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
              onPress={() => saveAction.run('packages', () => handleSave('packages'))}
            loading={saveAction.isBusy('packages')}
              variant={savedSection === 'packages' ? 'secondary' : 'gold'}
              size="compact"
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
          <View style={styles.sectionHeaderIcon}>
            <FriendsOutlineIcon size={24} color={sectionIconColor(gameConnectionsExpanded)} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Community & Friends</Text>
          <SectionToggle expanded={gameConnectionsExpanded} />
        </Pressable>
        {!gameConnectionsExpanded && <View style={styles.sectionDivider} />}

        {gameConnectionsExpanded && (
          <>
        {/* ── QuizVibe friends ─────────────────────────────────── */}
        {/* Sparade playerNames används senare för direktinbjudningar via
            Lobby's Share invite (visas hos vänner i Join Waiting Invites). */}
        <View style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendsTitle}>Friends</Text>
              <Text style={styles.friendsSubtitle}>
                Add friends for faster game invites.
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
            <Text style={styles.friendsBtnText}>
              <Text style={styles.friendsBtnPlus}>+  </Text>Add Friend
            </Text>
          </Pressable>

          {/* Inline lista över sparade vänner — en rad per friend. Speglar
              modalens friendRow-layout (avatar + namn + ×) så listan känns
              som samma vy. Modalens lista är kvar oförändrad. */}
          {friends.length > 0 && (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendsListRow}>
                  <View style={styles.friendsListAvatar}>
                    <Text style={styles.friendsListEmoji}>
                      {getAvatarEmojiById(friend.avatarId)}
                    </Text>
                  </View>
                  <Text style={styles.friendsListName} numberOfLines={1}>
                    {friend.playerName}
                  </Text>
                  {/* Dämpat grått × i vila — rött bara medan det trycks. */}
                  <Pressable pressFeedback
                    onPress={() => handleRemoveFriend(friend.id)}
                    hitSlop={12}
                    style={styles.friendsListRemoveBtn}
                  >
                    {({ pressed }) => (
                      <Svg width={14} height={14} viewBox="0 0 24 24">
                        <Line x1={6} y1={6} x2={18} y2={18} stroke={pressed ? Colors.error : BrandUi.iconMuted} strokeWidth={2} strokeLinecap="round" />
                        <Line x1={18} y1={6} x2={6} y2={18} stroke={pressed ? Colors.error : BrandUi.iconMuted} strokeWidth={2} strokeLinecap="round" />
                      </Svg>
                    )}
                  </Pressable>
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
          <View style={styles.sectionHeaderIcon}>
            <DocumentOutlineIcon size={24} color={sectionIconColor(legalExpanded)} />
          </View>
          <Text style={styles.gameConnectionsHeader}>Legal</Text>
          <SectionToggle expanded={legalExpanded} />
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
              <ChevronIcon size={18} />
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
              <ChevronIcon size={18} />
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
              <ChevronIcon size={18} />
            </Pressable>
            <Text style={styles.legalFootnote}>
              Privacy Policy and Terms open in a secure in-app browser.
              FAQ is handled inside the app.
            </Text>
            <Text style={styles.legalDisclaimer}>
              QuizVibe is an independent app and is not affiliated with, sponsored by, or officially endorsed by Spotify AB, YouTube, or Google LLC.
            </Text>
          </View>
        )}

        {/* ── Account — alltid synlig Delete Account (App Review 5.1.1(v),
            avslag 2026-10-14: granskaren hittade inte knappen i login-pill-
            sheet:en). Samma två-stegs-confirm som sheet-varianten. */}
        <View style={styles.accountSection}>
          <Text style={styles.accountSectionLabel}>Danger zone</Text>
          <Pressable
            style={({ pressed }) => [
              styles.accountDeleteBtn,
              pressed && { borderColor: 'rgba(255,107,107,0.85)', opacity: 0.9 },
              deletingAccount && { opacity: 0.5 },
            ]}
            onPress={() => handleRequestDeleteAccount('screen')}
            disabled={deletingAccount}
            accessibilityRole="button"
            accessibilityHint="Permanently deletes your account. This cannot be undone."
          >
            <TrashIcon size={20} color={Colors.error} />
            <Text style={styles.accountDeleteBtnText}>
              {deletingAccount ? 'Deleting…' : 'Delete Account'}
            </Text>
          </Pressable>
          <Text style={styles.accountSectionNote}>
            Permanently deletes your QuizVibe account and all associated data. This{' '}
            <Text style={styles.accountSectionNoteStrong}>cannot be undone</Text>.
          </Text>
        </View>

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
            <Text style={friendsModal.title}>Add Friend</Text>
            <Text style={friendsModal.subtitle}>
              Add a player to your Friends list for faster game invites.
            </Text>

            {/* Add friend row — samma split-field-struktur (bokstäver +
                siffror, QuizVibe:s egna CodeKeyboard) som PlayerName skapas
                överallt annars i appen, speglar Lobby:s Share invite-modal
                1:1 (Peter 2026-08-27). `appendPlayerNameLetter` sköter
                versal-först/gemener-resten-formatet per tangenttryck.
                `playerNameExists` verifierar att namnet tillhör en
                registrerad QuizVibe-user innan det sparas. */}
            <Text style={friendsModal.addFieldLabel}>Player Name</Text>
            <PlayerNameInput
              letters={getPlayerNameLetters(newFriendPlayerName)}
              digits={getPlayerNameDigits(newFriendPlayerName)}
              lettersRef={addFriendLettersRef}
              digitsRef={addFriendDigitsRef}
              focusedField={addFriendFocused ? addFriendKbMode : null}
              lettersEditable={!addFriendChecking}
              digitsEditable={!addFriendChecking && getPlayerNameLetters(newFriendPlayerName).length > 0}
              digitsDimmed={getPlayerNameLetters(newFriendPlayerName).length === 0}
              onLettersFocus={() => {
                setAddFriendKbMode('letter');
                setAddFriendFocused(true);
              }}
              onDigitsFocus={() => {
                if (getPlayerNameLetters(newFriendPlayerName).length === 0) {
                  addFriendLettersRef.current?.focus();
                  return;
                }
                setAddFriendKbMode('digit');
                setAddFriendFocused(true);
              }}
              onBlur={() => setAddFriendFocused(false)}
              trailing={
                <Pressable
                  onPress={handleAddFriend}
                  disabled={!newFriendPlayerName.trim() || addFriendChecking}
                  style={({ pressed }) => [
                    friendsModal.addBtn,
                    (!newFriendPlayerName.trim() || addFriendChecking) && friendsModal.addBtnDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      friendsModal.addBtnText,
                      (!newFriendPlayerName.trim() || addFriendChecking) && friendsModal.addBtnTextDisabled,
                    ]}
                  >
                    {addFriendChecking ? '…' : (
                      <>
                        <Text style={newFriendPlayerName.trim() ? friendsModal.addBtnPlus : undefined}>+ </Text>Add
                      </>
                    )}
                  </Text>
                </Pressable>
              }
            />
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
                    <View key={friend.id} style={i > 0 && friendsModal.friendRowSpacing}>
                      <View style={friendsModal.friendRow}>
                        <View style={friendsModal.friendAvatar}>
                          <Text style={friendsModal.friendEmoji}>
                            {getAvatarEmojiById(friend.avatarId)}
                          </Text>
                        </View>
                        <Text style={friendsModal.friendName} numberOfLines={1}>{friend.playerName}</Text>
                        {/* Kryssruta (2026-08-27, ersatte per-rad "×") —
                            speglar Lobby:s shareSheet.checkbox-mönster så
                            host bockar för flera friends och tar bort dem
                            allihop via Delete-knappen längst ner. */}
                        <Pressable pressFeedback
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
                          {checked && (
                            <Svg width={12} height={12} viewBox="0 0 24 24">
                              <Path d="M5 12.5 L10 17 L19 7" stroke={Colors.warning} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </Svg>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={friendsModal.footerRow}>
              <Pressable pressFeedback
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
              <Pressable pressFeedback
                onPress={() => setFriendsModalOpen(false)}
                style={friendsModal.closeBtn}
              >
                <Text style={friendsModal.closeBtnText}>Close</Text>
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

      {/* ── Countdown voice picker modal ─────────────────────────── */}
      <Modal
        visible={voicePickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setVoicePickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setVoicePickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Voice</Text>
              <Pressable
                onPress={() => setVoicePickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {VOICE_OPTIONS.map((opt) => {
              const isSelected = voice === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setVoice(opt.id);
                    setVoicePickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  {/* ▶ förhandslyssning — egen Pressable så tap på ikonen
                      spelar rösten utan att välja + stänga pickern. "No voice"
                      har inget att förhandslyssna → knappen döljs. */}
                  {opt.id !== SILENT_VOICE_ID && (
                    <Pressable
                      onPress={() => playVoiceClip(opt.id, 'quizvibe', 'QuizVibe')}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.voicePreviewBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={styles.voicePreviewIcon}>▶</Text>
                    </Pressable>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      styles.voiceOptionLabel,
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
        onRequestClose={() => { setHostTypeExpanded(false); setLogoutModalVisible(false); }}
      >
        <View style={styles.logoutOverlay}>
          <Pressable
            style={[styles.logoutBackdrop, joinVisible && styles.logoutHiddenBehindJoin]}
            onPress={() => { setHostTypeExpanded(false); setLogoutModalVisible(false); }}
          />
          <View
            style={[styles.logoutSheet, joinVisible && { opacity: 0 }]}
            pointerEvents={joinVisible ? 'none' : 'auto'}
          >
            <View style={styles.logoutHeader}>
              {selectedAvatarId && source !== 'default' ? (
                <Text style={styles.logoutHeaderEmoji}>
                  {getAvatarEmojiById(selectedAvatarId)}
                </Text>
              ) : null /* Ingen Q-ikon före namnet (Peter 2026-11-04). */}
              <View style={{ flex: 1 }}>
                <Text style={styles.logoutHeaderName}>
                  {playerName.trim() || 'Signed in'}
                </Text>
                {/* E-post under namnet (återinförd 2026-11-06, Peter). */}
                <Text style={styles.logoutHeaderStatus} numberOfLines={1}>
                  {email.trim() || 'Logged in'}
                </Text>
              </View>
            </View>
            {/* Samma avdelare som Home:s konto-sheet (profileMenu.menuDivider). */}
            <View style={styles.logoutHeaderDivider} />

            {/* "Start New Game", "Join with Room code" och "Store" borttagna ur
                konto-menyn (Peter 2026-11-04) — nås via Home / bottom banner. */}
            {/* Övriga sheet-knappar döljs medan lobbytyp-väljaren är utfälld
                så valet står ensamt (speglar Home) och sheet:en inte svämmar
                över på korta skärmar. */}
            {!hostTypeExpanded && (
              <>

            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleConfirmLogout}
              disabled={deletingAccount || loggingOut}
            >
              {/* Vänsterställd rad: spinnern tar ikonens plats (samma 22 pt-ruta)
                  så labeln står still. */}
              <View style={styles.logoutIconSlot}>
                {loggingOut ? (
                  <ActivityIndicator size="small" color={BrandUi.iconMuted} />
                ) : (
                  <LogoutIcon size={22} color={Colors.error} />
                )}
              </View>
              <Text style={styles.logoutBtnText}>Log out</Text>
            </Pressable>

            {/* Cancel hör till de vanliga konto-åtgärderna — direkt under
                Log out, före Danger zone (UI v2 2026-10-22). */}
            <Pressable pressFeedback
              style={[styles.logoutCancelBtn, styles.logoutCancelInMenu, styles.menuCancelButton]}
              onPress={() => setLogoutModalVisible(false)}
              disabled={deletingAccount}
            >
              <Text style={[styles.logoutCancelText, styles.menuCancelButtonText]}>Cancel</Text>
            </Pressable>

            {/* Danger zone (UI 2026-10-20) — Delete Account avskild från Log
                out, samma dämpade röda stil som Profile-skärmens Danger
                zone. Öppnar SAMMA slide-to-delete-dialog (källa 'sheet'
                → QuizVibeDialogOverlay inuti denna Modal). Apple Guideline
                5.1.1(v): in-app deletion. */}
            <View style={styles.sheetDangerZone}>
              <Text style={styles.sheetDangerLabel}>Danger zone</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.accountDeleteBtn,
                  styles.sheetDeleteBtn,
                  pressed && { borderColor: 'rgba(255,107,107,0.85)', opacity: 0.9 },
                  deletingAccount && { opacity: 0.5 },
                ]}
                onPress={() => handleRequestDeleteAccount('sheet')}
                disabled={deletingAccount}
                accessibilityRole="button"
                accessibilityHint="Permanently deletes your account. This cannot be undone."
              >
                <TrashIcon size={20} color={Colors.error} />
                <Text style={styles.accountDeleteBtnText}>
                  {deletingAccount ? 'Deleting…' : 'Delete Account'}
                </Text>
              </Pressable>
            </View>
              </>
            )}

            {/* Utfälld lobbytyp-väljare → "Back" längst ned kollapsar
                tillbaka till menyn. (I menyläget ligger Cancel direkt under
                Log out, ovanför Danger zone.) */}
            {hostTypeExpanded && (
              <Pressable pressFeedback
                style={styles.logoutCancelBtn}
                onPress={() => setHostTypeExpanded(false)}
                disabled={deletingAccount}
              >
                <Text style={styles.logoutCancelText}>Back</Text>
              </Pressable>
            )}
          </View>
          {deleteConfirmSource === 'sheet' && <QuizVibeDialogOverlay {...deleteConfirmProps} />}
        </View>
        {/* Nästlad i konto-sheet:ens Modal så den presenteras ovanpå den. */}
        <JoinModal
          visible={joinVisible}
          onClose={() => {
            setJoinVisible(false);
            // Cancel → sheet:en syns igen direkt (den har legat kvar under).
            // Efter en lyckad join har Profile redan tappat fokus (lobbyn
            // pushad) → stäng även sheet:en.
            if (!profileFocusedRef.current) {
              setHostTypeExpanded(false);
              setLogoutModalVisible(false);
            }
          }}
          initialStep="choose"
          hideGuest
          currentPlayerName={playerName.trim() || null}
          hasNewInvite={inviteSignal.hasNewInvite}
          onInvitesSeen={inviteSignal.markInvitesSeen}
        />
      </Modal>

      <QuizVibeDialog visible={deleteConfirmSource === 'screen'} {...deleteConfirmProps} />

      {/* ── Spotify DJ guide modal ──────────────────────────────────────
          Visas när användaren tappar "Guide How Spotify DJ works" i Spotify-
          raden. Plan B (2026-07-22): ingen kontokoppling — bara Spotify-appen. */}
      <QuizVibeDialog
        visible={pcBlockedPackageId !== null}
        title="Parent Control"
        message={parentRestrictedPackageMessage(
          PURCHASED_PACKAGES.find((p) => p.id === pcBlockedPackageId)?.name ?? null,
        )}
        secondaryLabel="Cancel"
        primaryLabel="Deactivate now"
        onClose={() => setPcBlockedPackageId(null)}
        onPrimary={() => {
          const id = pcBlockedPackageId;
          setPcBlockedPackageId(null);
          if (!id) return;
          setParentControlEnabled(false);
          setEnabledHostPackages((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }}
      />

      <QuizVibeDialog
        visible={parentControlledDialogOpen}
        title="Parent controlled"
        message={'This package is controlled by Parent Control.\nTurn off Parent Control to activate this package.'}
        secondaryLabel="Cancel"
        primaryLabel="Go to Parent Control"
        onClose={() => setParentControlledDialogOpen(false)}
        onPrimary={() => {
          setParentControlledDialogOpen(false);
          pendingParentControlScrollRef.current = true;
          if (hostDefaultsExpanded) tryScrollToParentControl();
          else setHostDefaultsExpanded(true);
        }}
      />

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
// Profile v2 (2026-10-20): navy/gunmetal-ytor, guld ENBART för valt läge
// (källa, kategori, avatar) + primär-CTA. Done ligger i en fast footer under
// listan så sista raden alltid kan scrollas fram ovanför knappen. Logik,
// avatar-id:n och spar-beteende orörda.

const AVATAR_CELL = 60;
const GOLD_SELECT_BORDER = Colors.warning;
const GOLD_SELECT_BG = 'rgba(245,166,35,0.07)';

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
      <View style={styles.apHeader}>
        <Text style={styles.apTitle}>Change Avatar</Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.apClose, pressed && { opacity: 0.6 }]}
          hitSlop={10}
          accessibilityLabel="Close"
        >
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Line x1="5" y1="5" x2="19" y2="19" stroke={BrandUi.iconMuted} strokeWidth={2.4} strokeLinecap="round" />
            <Line x1="19" y1="5" x2="5" y2="19" stroke={BrandUi.iconMuted} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.apContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Source selector */}
        <View style={styles.apSection}>
          <Text style={styles.apSectionLabel}>Avatar style</Text>
          <View style={styles.apSourceList}>
            {SOURCE_OPTIONS.map((opt) => (
              <SourceRow
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                subtitle={opt.subtitle}
                selected={source === opt.id}
                onPress={() => setSource(opt.id)}
              />
            ))}
          </View>
        </View>

        {/* Avatar picker (only when source = 'choose') */}
        {source === 'choose' && (
          <View style={styles.apSection}>
            <Text style={styles.apSectionLabel}>Collection</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.apChipScroll}
              contentContainerStyle={styles.apChipRow}
            >
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={({ pressed }) => [
                      styles.apChip,
                      active && styles.apChipActive,
                      pressed && !active && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.apChipLabel, active && styles.apChipLabelActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.apGridPanel}>
              <View style={styles.apGrid}>
                {filteredAvatars.map((item) => {
                  const isSel = selectedAvatarId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedId(item.id)}
                      style={({ pressed }) => [styles.apGridCell, pressed && !isSel && { opacity: 0.7 }]}
                      accessibilityState={{ selected: isSel }}
                    >
                      <View>
                        <Avatar
                          emoji={item.emoji}
                          size={AVATAR_CELL}
                          selected={isSel}
                          style={isSel ? styles.apAvatarSelected : styles.apAvatar}
                        />
                        {isSel && (
                          <View style={styles.apCheckBadge} pointerEvents="none">
                            <GoldCheck size={10} />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}
        {/* Default Image vald: centrerad förhandsvisning så vyn inte känns tom. */}
        {source === 'default' && (
          <View style={styles.apDefaultPreview}>
            <QuizVibeDefaultAvatar size={128} framed smile />
            <Text style={styles.apDefaultCaption}>QuizVibe default</Text>
          </View>
        )}
      </ScrollView>

      {/* Fast footer — utanför ScrollView så Done aldrig täcker sista raden. */}
      <View style={styles.apFooter}>
        <Button label="Done" onPress={onClose} variant="gold" />
      </View>
    </SafeAreaView>
  );
}

// ─── Small icons for the avatar picker ───────────────────────────────────────

function GoldCheck({ size = 10, color = '#1A1205' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Outline-ikon för "Choose Avatar" — fyra cirklar i ett 2×2-rutnät (24-grid). */
function AvatarGridIcon({ size = 22, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="7.5" cy="7.5" r="3.6" stroke={color} strokeWidth={1.8} fill="none" />
      <Circle cx="16.5" cy="7.5" r="3.6" stroke={color} strokeWidth={1.8} fill="none" />
      <Circle cx="7.5" cy="16.5" r="3.6" stroke={color} strokeWidth={1.8} fill="none" />
      <Circle cx="16.5" cy="16.5" r="3.6" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

// ─── SourceRow sub-component ──────────────────────────────────────────────────

function SourceRow({
  icon, label, subtitle, selected, onPress,
}: {
  icon: string; label: string; subtitle: string;
  selected: boolean; onPress: () => void;
}) {
  const iconColor = selected ? Colors.warning : BrandUi.iconMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.sourceRow,
        selected && styles.sourceRowSelected,
        pressed && !selected && styles.sourceRowPressed,
      ]}
    >
      <View style={[styles.sourceIcon, selected && styles.sourceIconSelected]}>
        {/* icon='Q' är en sentinel för Default Image-raden — rendera
            QuizVibe Q-marken (samma som profil-avataren blir) i stället
            för en text-emoji. */}
        {icon === 'Q' ? (
          <QuizVibeAvatarQ size={24} color={selected ? undefined : BrandUi.iconMuted} smile />
        ) : (
          <AvatarGridIcon color={iconColor} />
        )}
      </View>
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceLabel}>{label}</Text>
        <Text style={styles.sourceSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <GoldCheck size={12} />}
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
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // Join-formuläret har egen dimning — sheet:ens backdrop blir genomskinlig
  // medan det är öppet så det inte dubbeldimmas.
  logoutHiddenBehindJoin: { backgroundColor: 'transparent' },
  logoutSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    // Samma bottenpadding som Home:s konto-sheet (profileMenu.sheetAccount).
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
  },
  // Profile v2: informativ identitets-header (ingen ram) — speglar Home:s
  // konto-sheet 1:1 (header + separat hårfin avdelare).
  logoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  logoutHeaderDivider: {
    height: 1,
    backgroundColor: BrandUi.border,
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
    fontSize: 13,
    color: BrandUi.textMuted,
    marginTop: 2,
  },
  // Create Game + Join Game-knappar i logout-sheet:n. Speglar Store-
  // knappens styling exakt (blå-konturad, cardElevated bg, textPrimary
  // text) så alla tre genvägar visuellt grupperas. CTA-hierarkin är:
  // Create Game / Join Game / Store (alla neutrala) → Log out (röd,
  // destruktiv) → Cancel (text-only).
  // Profile v2: neutrala menyrader (samma som Home:s konto-sheet).
  logoutCreateGameBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    // Ikon + text centrerade som Start New Game / Join; chevronen ligger
    // absolut i högerkanten så den inte drar grupperingen ur centrum.
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  logoutStoreChevron: {
    position: 'absolute',
    right: Spacing.lg,
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
  // Tyst röd rad (ingen fylld knapp) — som Home:s konto-sheet.
  logoutIconSlot: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  // UI 2026-10-20: Log out är en NEUTRAL sekundär rad (ingen röd) — bara
  // Delete Account i Danger zone ser destruktiv ut.
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    // Röd (Peter 2026-11-04), samma som Home:s konto-meny.
    color: Colors.error,
  },
  sheetDangerZone: {
    // Tydlig separation mellan vanliga konto-åtgärder (… Log out, Cancel)
    // och Delete Account: + sheet:ens gap (md) ≈ 36 pt luft till avdelaren.
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandUi.border,
    gap: Spacing.sm,
  },
  sheetDangerLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: 'rgba(255,107,107,0.42)',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  // Något lägre än Profile-skärmens Danger zone-knapp för bättre balans i sheet:en.
  sheetDeleteBtn: {
    height: 42,
  },
  logoutCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  // Cancel i menyläget: lite extra luft från Log out-raden ovanför.
  logoutCancelInMenu: {
    marginTop: Spacing.xs,
  },
  logoutCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Konto-menyns Cancel som riktig knapp (Peter 2026-11-04) — neutral yta,
  // samma som Home:s konto-meny.
  menuCancelButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: BrandUi.surface,
    borderColor: BrandUi.border,
    marginTop: Spacing.sm,
  },
  menuCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accountSection: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  // Account-sektionens egen Delete-knapp — lugnare än sheet-varianten:
  // lägre, tunnare röd kant, dämpad röd text, mörk yta.
  // UI 2026-10-19: "Danger zone" — samma höjd (48) som compact-knapparna,
  // mörk gunmetal-yta, raffinerad röd kant + röd papperskorg. Inget guld,
  // ingen glöd.
  accountDeleteBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.6)',
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDeleteBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
  },
  accountSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: 'rgba(255,107,107,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  accountSectionNote: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    color: BrandUi.textMuted,
    textAlign: 'center',
  },
  accountSectionNoteStrong: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
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
  // Profile v2: återhållsamt navy-kort, neutral kant (guld när Premium).
  creditsPill: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
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
    borderWidth: 1,
    borderColor: Colors.warning,
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
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  // Profile v2: Free-saldot är vanlig vit information (grönt = bara äkta
  // success). Premium-hostens "Unlimited" är guld.
  creditsValueFree: {
    color: Colors.textPrimary,
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
    // flex: 1 → +/−-rutan hamnar i högerkanten, linjerad för alla sektioner.
    flex: 1,
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
    // Profile v2: låg kontrast — luft bär separationen, inte linjen.
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Legal-sektionens kort (Privacy Policy + Terms of Service-rader).
  // Sparsam styling — sektionen är sällan-besökt och ska kännas som
  // en lista, inte ett feature-kort.
  legalCard: {
    backgroundColor: BrandUi.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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

  // Friends-kortet (Profile v2, 2026-10-19): mörk navy/gunmetal, bara en
  // aning ljusare än bakgrunden + tunn kant — ingen blå "settings-panel".
  friendsCard: {
    backgroundColor: BrandUi.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: Spacing.lg,
    gap: Spacing.lg,
    // Negativ marginal: ~18 % kortare luft ned till Player history.
    marginBottom: -6,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  friendsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  friendsSubtitle: {
    fontSize: FontSize.xs,
    color: BrandUi.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  // Antal vänner: mörk pill, tunn guldkant, guld siffra.
  friendsCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: Radius.full,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsCountText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
  },
  // + Add Friend: sekundär CTA — gunmetal yta, tunn dämpad guldkant,
  // vit text med guld "+". Ingen guldfyllning, ingen glöd.
  friendsBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  friendsBtnPlus: {
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
  // Vänlistan: en kompakt profilrad per vän.
  friendsList: {
    gap: Spacing.sm,
  },
  friendsListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  friendsListAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsListEmoji: {
    fontSize: 16,
    textAlign: 'center',
  },
  friendsListName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Subtilt ×: ingen synlig behållare, bara en tappyta.
  friendsListRemoveBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Preview card — vertical container: [columns row] + [Save button]
  preview: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandUi.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  // Inre rad som håller vänster- och högerkolumnen sida vid sida.
  // alignItems: 'center' centrerar avatar+playerName-kolumnen vertikalt
  // i förhållande till den högre högerkolumnen.
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    right: 0,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    // Profile v2: sekundär redigera-badge — mörk navy, tunn kant, guld penna.
    backgroundColor: '#152238',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerNameDisplay: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  hcpShieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // "HCP per category"-rad: under Assistance-dropdownen i högerkolumnen.
  hcpCatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  // "+"/"−"-knapp som fäller ut kategori-sköldarna — samma stil som
  // sektion-rubrikernas gameConnectionsToggleBox.
  hcpCatToggleBox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: BrandUi.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Full-bredds-rad med Music/Film/Sport-sköldarna under kolumnerna.
  hcpSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
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
  eraGuestBoxWrap: { alignItems: 'center', paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  eraGuestBox: {
    // Profile v2: premium i stället för neon — tunn guldkant, mörk navy-yta,
    // bara en svag skugga (glöden var shadowOpacity 0.85 / radius 18).
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    borderColor: Colors.warning,
    // Samma navy som valda val-rutor (4 rounds / 30s), 2026-10-26.
    backgroundColor: BrandUi.selectedFill,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraGuestBoxText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#F5A623',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  // Info-ikon-rader för rubriker — speglar Lobby 1:1.
  multiplayerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs, marginBottom: 8 },
  // Profile v2: lite närmare Game Mode-rutorna efter att klammer-raden togs bort.
  playersLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.lg, marginBottom: 8 },
  regionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Profile v2: enkel etikett i title case (ingen versal-overline) för
  // Profile default settings — samma stil som gästformulärets formLabel.
  fieldLabelPlain: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: BrandUi.textMuted,
  },
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
  // Samma färgtema som Lobbyns val-rutor (CHOICE_BG / CHOICE_BORDER), 2026-10-26.
  modeOptionInactive: {
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#111826',
  },
  // Dämpad variant — appliceras på Pass-the-Phone-rutan när
  // singlePlayerDefault-checkboxen är på. Matchar Individual Devices
  // inaktiva/låsta look (Colors.borderStrong border + grå badge) så
  // båda alternativen ser likadant ut i sitt "låsta" tillstånd.
  modeOptionDimmed: {
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#111826',
  },
  // Vald = guld kant + navy fyllning (samma som Lobby; den genomskinliga
  // guldtonen blev brun mot navy), 2026-10-26.
  modeOptionPassActive: {
    borderColor: Colors.warning,
    backgroundColor: BrandUi.selectedFill,
  },
  // Guld ✓ i övre högra hörnet på vald ruta.
  modeCheck: {
    position: 'absolute',
    top: 6,
    right: 10,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.warning,
  },
  // Låst Premium-val: lås + dämpad etikett på samma rad.
  lockedContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockedContent: {
    opacity: 0.55,
  },
  modeOptionIndivActive: {
    borderColor: Colors.warning,
    backgroundColor: BrandUi.selectedFill,
  },
  // Guld-tonad aktiv variant — Individual Devices när det är valt och
  // host har Premium. Speglar PREMIUM-badge:s guldfärg så toggle-rutan,
  // badge:n och texten bildar ett samlat "premium-läge"-uttryck.
  modeOptionPremiumActive: {
    borderColor: Colors.warning,
    backgroundColor: BrandUi.selectedFill,
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
  // Profile v2: liten guld-PREMIUM-pill (alltid guld, aldrig grå).
  premiumBadge: {
    position: 'absolute',
    top: -7,
    right: Spacing.sm,
    backgroundColor: Colors.warning,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  premiumBadgeText: {
    fontSize: 9,
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
    backgroundColor: 'rgba(255,255,255,0.04)',
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: Spacing.xs,
  },
  smDataShift: {
    paddingLeft: 4,
  },
  // Data-kolumnernas (Music/Film) switch-celler: nudgas höger så switchen
  // hamnar centrerad UNDER sin kolumnrubrik (iOS-<Switch> renderar vänster-
  // biasad; paddingLeft flyttar ~1:1). Speglar LobbyScreen:s smSwitchNudge. Tuna här.
  smSwitchNudge: {
    paddingLeft: 20,
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
    // Dämpad avdelare Music | Film/TV.
    borderLeftColor: 'rgba(255,255,255,0.07)',
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
    color: BrandUi.iconMuted,
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BrandUi.border,
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    // Tjockare kantlinje (3 px → bumpat från 2 → ursprungligen 1) så
    // Add-knappen sticker ut tydligt mot listan över aktiverade paket
    // nedanför, som har 1 px-borders.
    // Profile v2: 1 px neutral kant (var 3 px).
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  // Lista över köpta extra-paket. Varje rad har info-ikon + blå-bordred
  // ruta side-by-side (speglar Lobby:s purchasedPackageRow-mönster).
  packagesList: {
    gap: Spacing.sm,
  },
  // Profile v2-paketrad: kompakt navy-rad med tunn kant (~44 pt).
  // [ikon] [namn flex:1] [i] [compact-toggle].
  packageListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    // Tumnageln (48) styr radhöjden → tunnare vertikal padding och mindre
    // vänsterpadding så raden inte växer märkbart.
    paddingLeft: Spacing.xs + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
  },
  // Påslaget paket: bara en dämpad guldton i kanten — toggeln + guld-
  // ikonen bär ON-signalen, raden ska inte ramas in i starkt guld.
  packageListRowOn: {
    borderColor: 'rgba(245,166,35,0.2)',
  },
  // Luft under "Available when you are the Host:" innan Select all/listan.
  packagesSubheading: {
    marginBottom: Spacing.xs,
  },
  // Tumnagel → paketnamn = radens gap (8 pt), inget extra.
  packageThumbWrap: {},
  packageNameWrap: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  // Chevron i Activate Extra package-knappens högerkant.
  addPackageChevron: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
  // Dämpad info-ikon i paketraderna — konkurrerar inte med namn/toggle.
  infoIconBtnSubtle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: BrandUi.border,
  },
  infoIconTextSubtle: {
    fontSize: 12,
    lineHeight: 14,
    color: BrandUi.iconMuted,
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
    // Profile v2: påslaget paket = guldkant (var blå).
    borderColor: Colors.warning,
    backgroundColor: 'transparent',
  },
  packageRowText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Disabled-läge för paket-rutan (toggle off): grå borderStrong-kant +
  // transparent bg + dämpad text (samma look som Lobby:s
  // purchasedPackageBox utan active-styling).
  packageRowInactive: {
    borderColor: BrandUi.border,
    backgroundColor: 'transparent',
  },
  packageRowTextInactive: {
    color: 'rgba(255,255,255,0.75)',
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
  // Select all: sekundär rad, högerställd så compact-toggeln linjerar med
  // paketradernas togglar (radens paddingHorizontal: md + 1 pt kant).
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingRight: Spacing.md + 1,
  },
  selectAllSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  selectAllLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: BrandUi.textMuted,
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
    marginTop: Spacing.sm,
    lineHeight: 16,
    textAlign: 'center',
  },
  roundsGuestBox: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    // Profile v2: valt värde = guld (tunn kant, ingen fyllning).
    borderWidth: 1.5,
    borderRadius: Radius.md,
    borderColor: Colors.warning,
    // Samma navy som Game era-rutan och valda val-rutor, 2026-10-26.
    backgroundColor: BrandUi.selectedFill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  roundsGuestBoxText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  roundsPlusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
    // Profile v2: neutrala −/+ (blått = bara fokus/redigering).
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundsStepperBtnDisabled: {
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  roundsStepperBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  roundsStepperBtnTextDisabled: {
    color: Colors.textDisabled,
  },
  // Region trigger + Answer response — speglar Lobby 1:1.
  regionTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: BrandUi.border, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  regionTriggerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  responseRow: { flexDirection: 'row', gap: Spacing.sm },
  responseBtn: { flex: 1, height: 44, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // Profile v2: vald = guld kant + svag guldton; ovald = neutral.
  responseBtnActive: { borderColor: Colors.warning, backgroundColor: BrandUi.selectedFill },
  responseBtnInactive: { borderColor: BrandUi.border, backgroundColor: 'transparent' },
  responseBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  // Vald = vit text, guldkanten bär "vald"-signalen (färgregel 2026-10-21, = Lobby).
  responseBtnTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
    // Profile v2: neutralt navy-fält med dämpad kant.
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: BrandUi.border,
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
  optionRowSelected: { backgroundColor: 'rgba(245,166,35,0.08)' },
  optionRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.warning,
    fontWeight: FontWeight.semibold,
  },
  optionCheck: {
    fontSize: FontSize.md,
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
  // Voice-pickerns ▶-preview: liten rund tap-yta till vänster om labeln.
  voicePreviewBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePreviewIcon: {
    fontSize: 13,
    color: Colors.warning,
    marginLeft: 2, // optisk centrering av ▶-glyfen
  },
  voiceOptionLabel: {
    flex: 1,
    marginLeft: Spacing.md,
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

  // ── Avatar picker (Profile v2) ──────────────────────────────
  apHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  apTitle: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  apClose: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  apContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  apSection: { gap: Spacing.sm },
  apSectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: BrandUi.textMuted,
    paddingHorizontal: Spacing.xs,
  },
  apSourceList: { gap: Spacing.sm },

  // Source rows
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
    backgroundColor: BrandUi.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceRowSelected: {
    backgroundColor: GOLD_SELECT_BG,
    borderColor: 'rgba(245,166,35,0.55)',
  },
  sourceRowPressed: { backgroundColor: 'rgba(255,255,255,0.07)' },
  sourceIcon: {
    width: 44, height: 44,
    borderRadius: Radius.sm,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceIconSelected: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderColor: 'rgba(245,166,35,0.30)',
  },
  sourceInfo: { flex: 1 },
  sourceLabel: { ...Typography.bodyMedium, color: Colors.textPrimary },
  sourceSubtitle: { ...Typography.caption, color: BrandUi.textMuted, marginTop: 2 },
  // Val-indikator: tom tunn ring (ej vald) → liten guld-bock (vald).
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: BrandUi.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderWidth: 0, backgroundColor: Colors.warning },

  // Category chips — scrollen går kant-i-kant så chippen som fortsätter
  // åt höger klipps mot skärmkanten (avsiktligt), inte mitt i innehållet.
  apChipScroll: { marginHorizontal: -Spacing.lg },
  apChipRow: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xs },
  apChip: {
    paddingHorizontal: Spacing.md + 2,
    height: 34,
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  apChipActive: {
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderColor: 'rgba(245,166,35,0.60)',
  },
  apChipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
  },
  apChipLabelActive: { color: Colors.warning, fontWeight: FontWeight.semibold },

  // Grid
  apGridPanel: {
    backgroundColor: BrandUi.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  apGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.md },
  apGridCell: { width: '25%', alignItems: 'center' },
  apAvatar: {
    backgroundColor: '#152238',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  apAvatarSelected: {
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderWidth: 2,
    borderColor: GOLD_SELECT_BORDER,
  },
  apDefaultPreview: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xl,
  },
  apDefaultCaption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
  },
  apCheckBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.warning,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  apFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },

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
  yearRowSelected: { backgroundColor: 'rgba(245,166,35,0.08)' },
  yearRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  yearText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  yearTextSelected: {
    color: Colors.warning,
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
  // Spotify "Type:"-rader: fast etikettbredd så Year/Name-togglarna linjerar.
  spotifyTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  // Rad-layouten: Type: · Year [toggle] · Name [toggle].
  spotifyTypeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spotifyTypeInlineLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
  },
  spotifyTypeHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  // Fast bredd + vänsterställd → Year/Name/Type: delar startpunkt.
  spotifyTypeLabel: {
    width: 42,
    textAlign: 'left',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
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
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderColor: Colors.warning,
  },
  spotifyAvailPillOff: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: Colors.border,
  },
  spotifyAvailPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
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
  // Kant-skärande namn-badge på attest-boxen (övre vänstra hörnet) — speglar
  // lobby-vyn. bg sätts inline (grön = attestat, röd = ej).
  spotifyAttestBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 240,
    zIndex: 2,
  },
  spotifyAttestBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  // Grå ram runt hela mixerboarden (Spotify + YouTube + Hints) — speglar
  // lobby-vyns mixerboardBox.
  mixerboardBox: {
    borderWidth: 1,
    borderColor: BrandUi.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  // Grått streck inuti mixerboarden mellan Spotify-delen och YouTube-delen.
  mixerboardDivider: {
    height: 1,
    backgroundColor: BrandUi.border,
    marginVertical: Spacing.xs,
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
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
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
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  // Profile v2 (2026-10-19): mörk navy/gunmetal i stället för blå panel.
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    // Bounder sheet:en till viewport så toppen aldrig spiller över skärmen
    // när CodeKeyboard:et (Add by Player Name) tar plats — samma mönster
    // som Lobby:s Share invite-modal.
    maxHeight: '90%',
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: BrandUi.textMuted,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 280,
    // Tätare mot titeln, mer luft före formuläret.
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  // Add-by-Player-Name-label + split-field-rad (2026-08-27) — samma
  // struktur (bokstäver + siffror via CodeKeyboard) som PlayerName skapas
  // överallt annars i appen. Speglar Lobby:s shareSheet-motsvarigheter
  // (LobbyScreen.tsx) exakt.
  addFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandUi.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -Spacing.xs,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addInput: {
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 2,
  },
  addPlayerNameInputActive: { borderColor: 'rgba(245,166,35,0.65)' },
  addPlayerNameInputDisabled: { opacity: 0.45 },
  // Add = sekundär: gunmetal + tunn dämpad guldkant (svagare än Done).
  addBtn: {
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  addBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'transparent',
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  addBtnTextDisabled: { color: 'rgba(255,255,255,0.35)' },
  addBtnPlus: { color: Colors.warning, fontWeight: FontWeight.bold },
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
  // Samma kompakta profilrad som Friends-kortet på Profile.
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  friendRowSpacing: { marginTop: Spacing.sm },
  friendAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendEmoji: {
    fontSize: 16,
    textAlign: 'center',
  },
  friendName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Kryssruta (2026-08-27, ersatte removeBtn/"×") — speglar Lobby:s
  // shareSheet.checkbox/checkboxChecked/checkmark-mönster exakt.
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#141C2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.warning,
  },
  checkmark: {
    color: '#000',
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
  // Hierarki: Done (primär, bredast, tydligast guldkant) > Add >
  // Delete (kontextuell, smal, röd bara när något är markerat).
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  deleteBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'transparent',
  },
  deleteBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,107,107,0.9)',
  },
  deleteBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  closeBtn: {
    flex: 1.8,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
