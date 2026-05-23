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
    View,
} from 'react-native';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EraMarkerMinus, EraMarkerPlus } from '../components/EraSliderMarker';
import { PlayerHistorySection } from '../components/PlayerHistorySection';
import { QuizVibeFriendsLogo } from '../components/QuizVibeFriendsLogo';
import { QuizVibeQAvatar } from '../components/QuizVibeQAvatar';
import { ShoppingCartIcon } from '../components/ShoppingCartIcon';
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
import {
    PURCHASED_PACKAGES,
    getFreeGenerationPackage,
    syncGenerationPackageIds,
} from '../utils/mockPurchasedPackages';
import {
    clearProfile,
    loadProfile,
    saveProfile,
    type AssistanceLevel,
    type AvatarSource,
    type GameMode,
    type ProfileData,
    type Region,
} from '../utils/profileStorage';
import { hasPremiumSubscription } from '../utils/subscriptionStorage';
// Create Game-flödet (samma som Home:s handleCreateGame). När fler skärmar
// får denna entry-punkt: lyft till en delad utility i src/utils/.
import { clearEjected } from '../utils/ejectedPlayers';
import { clearLeftPlayers } from '../utils/leftPlayers';
import { registerActiveRoom } from '../utils/mockActiveRooms';
import { clearLobbyPlayers } from '../utils/mockLobbyPlayers';
import { clearLobbySettings } from '../utils/mockLobbySettings';
import { clearGameStarted } from '../utils/mockStartedGames';
import { generateRoomCode } from '../utils/roomCode';

// ─── Data ─────────────────────────────────────────────────────────────────────

type AvatarCategory = 'All' | 'Basic' | 'Retro' | 'Music' | 'Tech' | 'Fun';

const CATEGORIES: AvatarCategory[] = ['All', 'Basic', 'Retro', 'Music', 'Tech', 'Fun'];

// ─── Birth year options (descending, newest first) ────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
// 13+ minimum age requirement (App Store / GDPR compliance). Dynamisk så
// minimum-året följer current year — 2026: max 2013, 2027: max 2014, osv.
const MAX_BIRTH_YEAR = CURRENT_YEAR - 13;
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

// Hur länge spelarna har på sig att svara på en fråga (skiljer sig från
// hur länge själva frågematerialet — låt/video/bild — spelas upp).
type AnswerResponse = 15 | 30 | 45 | 60;
const ANSWER_RESPONSE_OPTIONS: { id: AnswerResponse; label: string }[] = [
  { id: 15, label: '15 seconds' },
  { id: 30, label: '30 seconds' },
  { id: 45, label: '45 seconds' },
  { id: 60, label: '60 seconds' },
];

// Game era — år-spann för frågor. Speglar Lobby-skärmens slider men utan
// player-clamping (Profile är default-setup, inga spelare i kontext).
// ERA_MIN_INTERVAL = minsta tillåtna avstånd mellan from/to-markörer (10 år).
// ERA_MIN_INTERVAL_PX räknar om det till slider-pixel för MultiSlider:s
// minMarkerOverlapDistance-prop.
// ERA_MIN = 1930 så slider-värdet matchar tidsaxelns vänsterkant ("<1930").
// Tidigare gick slidern 1900..currentYear medan axeln visuellt började vid
// "<1930" — det skapade en 30-års-förskjutning mellan thumb-position och
// vad rutan ovan visade. Nu mappar 0 % → 1930 och 100 % → currentYear.
const ERA_MIN = 1930;
const ERA_MAX = new Date().getFullYear();
const ERA_SLIDER_WIDTH = 280;
// SLIDER_INSET = pixel-buffer på vardera sida så thumb-cirklarna inte
// sticker ut förbi slider-trackens kanter. MultiSlider:s sliderLength
// sätts till INNER_WIDTH och DecadeMarks-positionen offset:as med INSET.
const ERA_SLIDER_INSET = 12;
const ERA_SLIDER_INNER_WIDTH = ERA_SLIDER_WIDTH - 2 * ERA_SLIDER_INSET;
const ERA_MIN_INTERVAL = 10;
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
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [playerName, setPlayerName]           = useState('Player One');
  const [email, setEmail]                     = useState<string>('');
  const [birthYear, setBirthYear]         = useState<number | null>(null);
  const [assistance, setAssistance]       = useState<AssistanceLevel | null>(null);
  const [region, setRegion]               = useState<Region | null>(null);
  const [gameCredits, setGameCredits]     = useState<number>(0);
  const [freeGameCredits, setFreeGameCredits] = useState<number>(0);
  // Datum för senaste auto-refresh av freeGameCredits (CET, "YYYY-MM-DD").
  // Sparas tillsammans med freeGameCredits så loadProfile kan avgöra om
  // top-up till FREE_CREDITS_DAILY_CAP behövs vid nästa load. Saknas på
  // gamla profiler — då räknas första load som "ny dag" och fyller på.
  const [lastFreeCreditsRefreshDate, setLastFreeCreditsRefreshDate] = useState<string | undefined>(undefined);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [newFriendPlayerName, setNewFriendPlayerName] = useState('');
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
  const [maxPlayers, setMaxPlayers] = useState<4 | 12>(4);
  // Default game mode (host-default) — 'pass-the-phone' (gratis) eller
  // 'individual-devices' (Premium).
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');
  // "Use single player mode as default" — när checkad låses host-default till
  // Individual Devices och Pass-the-Phone-rutan visas dämpad/grå i toggle:n.
  const [singlePlayerDefault, setSinglePlayerDefault] = useState(false);
  // Premium-status — styr om PREMIUM-badge på Max 12-toggle visas i guld
  // (köpt) eller grått (inte köpt än), om Individual Devices är unlocked,
  // om Rounds-rulern visar gold-bracket + blå-tickade siffror, och om
  // Host Game Credits-pillen får gold-bordred + "Unlimited"-badge. Synced
  // med Lobby:s motsvarande hasPremium-state via samma subscriptionStorage-
  // helper. Load:as i useFocusEffect nedan så Profile speglar köp som
  // gjorts i Store utan delay.
  const [hasPremium, setHasPremium] = useState(false);
  // Default antal rundor (host-default). Speglar Lobby:s rounds-stepper +
  // RoundsRuler. Capas av gameMode — Pass-the-Phone (inkl. single-player
  // ovanpå PtP) är ALLTID max 4 oavsett subscription; Individual Devices
  // (Premium-gated) får 20. Vid byte av gameMode clampas värdet automatiskt
  // ner om det skulle hamna utanför nya max:t.
  const [roundsCount, setRoundsCount] = useState<number>(ROUNDS_DEFAULT);
  const roundsMax = gameMode === 'individual-devices' ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS;
  // Auto-sync maxPlayers ↔ gameMode: Pass-the-Phone capas alltid vid 4
  // (PtP med 12 spelare × 20 rundor = orimligt långt spel), Individual
  // Devices defaulta:r till 12 så host får full multiplayer-cap direkt.
  // Speglar Lobby:s motsvarande auto-sync så host-defaults och in-lobby-
  // state håller samma policy.
  useEffect(() => {
    const targetMax: 4 | 12 = gameMode === 'pass-the-phone' ? 4 : 12;
    setMaxPlayers((prev) => (prev === targetMax ? prev : targetMax));
  }, [gameMode]);
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
    setRoundsCount((prev) => {
      const next = Math.min(roundsMax, prev + ROUNDS_STEP);
      if (next !== prev) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  };
  // När gameMode växlar (t.ex. Pass-the-Phone → Individual Devices) clampas
  // roundsCount automatiskt så det inte hamnar utanför nya range:n. Speglar
  // Lobby:s motsvarande clamp-effekt.
  useEffect(() => {
    setRoundsCount((prev) => Math.max(ROUNDS_MIN, Math.min(roundsMax, prev)));
  }, [roundsMax]);

  // Försök att välja Individual Devices utan Premium → Store-omdirigering.
  // Speglar Lobby:s handleSelectMode-pattern.
  const handleSelectGameMode = (mode: GameMode) => {
    if (mode === gameMode) return;
    if (mode === 'individual-devices' && !hasPremium) {
      Alert.alert(
        'Premium feature',
        'Multiplayer on individual devices requires the Premium subscription. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
        ],
      );
      return;
    }
    setGameMode(mode);
  };

  // Försök att välja Max 12 utan Premium → Store-omdirigering. Speglar
  // Lobby:s handleSelectMode-pattern för Individual Devices utan paket.
  const handleSelectMaxPlayers = (value: 4 | 12) => {
    if (value === 12 && !hasPremium) {
      Alert.alert(
        'Premium feature',
        'Hosting up to 12 players requires the Premium subscription. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store?focus=subscription&from=/profile') },
        ],
      );
      return;
    }
    setMaxPlayers(value);
    // Max 12 är meningsfullt bara i Individual Devices (PtP capas vid 4
    // pga orimlig speltid). Snäpper gameMode automatiskt till IndDev när
    // host väljer Max 12 från PtP — speglar Lobby:s motsvarande logik.
    if (value === 12 && gameMode === 'pass-the-phone') {
      setGameMode('individual-devices');
    }
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
  const [gameConnectionsExpanded, setGameConnectionsExpanded] = useState(true);
  // Profile default settings-blocket (avatar + playerName + setup + Save)
  // — samma kollapsbara mönster som Game connections och Player history.
  const [profileDefaultsExpanded, setProfileDefaultsExpanded] = useState(true);
  // Host default settings-blocket (Game Mode → Number of Rounds) —
  // egen huvudrubrik mellan Profile defaults och Game connections, samma
  // kollapsbara mönster som de övriga top-level sektionerna.
  const [hostDefaultsExpanded, setHostDefaultsExpanded] = useState(true);
  // Customized Host packages — egen kollapsbar sektion mellan Host defaults
  // och Game connections. Listar PURCHASED_PACKAGES (mock tills Store-
  // integrationen är inkopplad) + Add-knapp som leder till Store.
  const [customizedPackagesExpanded, setCustomizedPackagesExpanded] = useState(true);
  // Legal-sektionen — Privacy Policy + Terms of Service. Default collapsed
  // eftersom användare sällan behöver öppna dokumenten; vid behov hittar
  // de fram via +-toggleln.
  const [legalExpanded, setLegalExpanded] = useState(false);
  // Per-paket on/off — styr om paketet visas i Lobby:s Customized Host
  // packages-block (när användaren är host). Default = alla aktiverade så
  // nyköpta paket dyker upp i Lobby utan att man måste gå till Profile först.
  // Free-gen-paket-id:t läggs in i loadProfile-effekten (kräver birthYear).
  const [enabledHostPackages, setEnabledHostPackages] = useState<string[]>(
    () => PURCHASED_PACKAGES.map((p) => p.id),
  );
  const handleToggleHostPackage = (id: string) => {
    setEnabledHostPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };
  // Gratis generations-paket utifrån user:s Competition Year of Birth.
  // Byts automatiskt när birthYear ändras (effect:en nedanför löser
  // syncen i enabledHostPackages); denna useMemo styr bara render-listan.
  const freeGenerationPackage = useMemo(
    () => getFreeGenerationPackage(birthYear),
    [birthYear],
  );
  // Komplett paket-katalog som visas i Customized Host packages-listan.
  // Gen-paket först (gratis), köpta paket sedan. När birthYear saknas
  // visas bara köpta — registreringsflödet kräver dock birthYear så
  // detta är defensivt.
  const availablePackages = useMemo(
    () => (freeGenerationPackage ? [freeGenerationPackage, ...PURCHASED_PACKAGES] : [...PURCHASED_PACKAGES]),
    [freeGenerationPackage],
  );
  // "Select all"-state — true bara när alla synliga paket (gen + köpta)
  // är aktiverade. Speglar Lobby:s isAllSelected-mönster.
  const isAllPackagesEnabled =
    availablePackages.length > 0 &&
    availablePackages.every((p) => enabledHostPackages.includes(p.id));
  const handleToggleAllPackages = () => {
    setEnabledHostPackages(isAllPackagesEnabled ? [] : availablePackages.map((p) => p.id));
  };
  // Synca generations-paket-id i enabledHostPackages när birthYear byts.
  // Strippar gamla gen-id:n och lägger till aktuell — köpta paket-id:n
  // lämnas orörda. Idempotent så det är säkert att fyra på varje render
  // där birthYear förändras.
  useEffect(() => {
    setEnabledHostPackages((prev) => {
      const next = syncGenerationPackageIds(prev, birthYear);
      // Bara skriv state om resultatet faktiskt skiljer sig — undviker
      // onödig re-render när birthYear-ändringen råkar landa inom samma
      // generation (eller bara löste in den förra renderens redan-correcta
      // state).
      if (next.length === prev.length && next.every((id, i) => id === prev[i])) {
        return prev;
      }
      return next;
    });
  }, [birthYear]);

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
        const augmented: ProfileData = {
          ...data,
          birthYear: data.birthYear ?? randomAdultBirthYear(),
          assistance: data.assistance ?? 'standard',
          // V1: bara Sweden. Coerce sparad 'nordics'/'global' (från innan
          // v1-launch-scopet) till 'sweden' så UI:t och persisterad state
          // alltid stämmer. wasIncomplete-checken nedan upptäcker att fältet
          // ändrades och persisterar via defensive write.
          region: 'sweden',
          gameEraFrom: data.gameEraFrom ?? 1981,
          gameEraTo: data.gameEraTo ?? ERA_MAX,
          maxPlayers: data.maxPlayers ?? 4,
          gameMode: data.gameMode ?? 'pass-the-phone',
          singlePlayerDefault: data.singlePlayerDefault ?? false,
          roundsDefault: data.roundsDefault ?? ROUNDS_DEFAULT,
          answerResponseSeconds: data.answerResponseSeconds ?? 30,
          // Default — alla köpta paket aktiverade så nyköpta dyker upp i
          // Lobby utan extra steg via Profile. Free gen-paket-id:t läggs
          // in nedanför via syncGenerationPackageIds (kräver birthYear).
          enabledHostPackages: data.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id),
        };
        // Synca free gen-paket-id (utifrån augmented birthYear) — täcker
        // både fresh profil och äldre profiler skapade innan free-gen-
        // funktionen kom in. Idempotent så ingen-op om gen-id redan är rätt.
        augmented.enabledHostPackages = syncGenerationPackageIds(
          augmented.enabledHostPackages ?? [],
          augmented.birthYear,
        );
        // Om något fält saknades: persistera augmented-profilen tillbaka
        // direkt så fallback-värdena (särskilt random birthYear) inte
        // regenereras vid nästa reload. One-shot defensive write.
        // Detect om syncGenerationPackageIds ändrade listan (gen-id saknades
        // eller fel gen-id stod kvar efter birthYear-ändring i tidigare
        // session). Då skriver vi också tillbaka.
        const savedPackages = data.enabledHostPackages ?? null;
        const packagesChanged =
          savedPackages == null ||
          savedPackages.length !== augmented.enabledHostPackages!.length ||
          savedPackages.some((id, i) => id !== augmented.enabledHostPackages![i]);
        const wasIncomplete = (
          data.birthYear == null ||
          data.assistance == null ||
          // null ELLER non-sweden → coerce-write krävs (v1 Sweden-only)
          data.region !== 'sweden' ||
          data.gameEraFrom == null ||
          data.gameEraTo == null ||
          data.maxPlayers == null ||
          data.gameMode == null ||
          data.singlePlayerDefault == null ||
          data.roundsDefault == null ||
          data.answerResponseSeconds == null ||
          packagesChanged
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
        // Clamp till nuvarande slider-range — gamla profiler kan ha sparat
        // gameEraFrom < 1930 från tiden då ERA_MIN var 1900. Utan clamp:n
        // skulle box visa t.ex. "1925" medan thumben sitter på 1930.
        setEraValues([
          Math.max(ERA_MIN, augmented.gameEraFrom ?? 1981),
          Math.min(ERA_MAX, augmented.gameEraTo ?? ERA_MAX),
        ]);
        setMaxPlayers(augmented.maxPlayers ?? 4);
        setGameMode(augmented.gameMode ?? 'pass-the-phone');
        setSinglePlayerDefault(augmented.singlePlayerDefault ?? false);
        // Clamp så ett gammalt värde > nuvarande max (t.ex. om host har 8
        // sparat från Individual Devices-läget och nu defaultar till
        // Pass-the-Phone) inte hamnar utanför range:n.
        const savedRounds = augmented.roundsDefault ?? ROUNDS_DEFAULT;
        const initialMax = (augmented.gameMode ?? 'pass-the-phone') === 'pass-the-phone'
          ? ROUNDS_MAX_PASS
          : ROUNDS_MAX_INDIV;
        setRoundsCount(Math.max(ROUNDS_MIN, Math.min(initialMax, savedRounds)));
        setEnabledHostPackages(augmented.enabledHostPackages ?? PURCHASED_PACKAGES.map((p) => p.id));
      });
      loadFriends().then((list) => {
        if (active) setFriends(list);
      });
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

  const handleAddFriend = async () => {
    if (!newFriendPlayerName.trim()) return;
    const updated = await addFriend(newFriendPlayerName);
    setFriends(updated);
    setNewFriendPlayerName('');
  };

  const handleRemoveFriend = async (id: string) => {
    const updated = await removeFriend(id);
    setFriends(updated);
  };

  const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId);
  const age = birthYear !== null ? CURRENT_YEAR - birthYear : null;
  const assistanceLabel  = ASSISTANCE_OPTIONS.find((s) => s.id === assistance)?.label;
  const regionLabel = REGION_OPTIONS.find((r) => r.id === region)?.label;
  const answerResponseLabel = ANSWER_RESPONSE_OPTIONS.find(
    (o) => o.id === answerResponseSeconds,
  )?.label;

  const handleSave = async (section: 'defaults' | 'host' | 'packages') => {
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
        singlePlayerDefault,
        roundsDefault: roundsCount,
        enabledHostPackages,
      });
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 2000);
    } catch {
      // TODO: visa felmeddelande till användaren om spara misslyckas
    }
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
        `Something went wrong (${result.reason}). Please try again, or email infoquizvibe@gmail.com if the problem persists.`,
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
  // Credits-popup om Free + Extras = 0 och user inte har Premium), sedan
  // generera kod, registrera rum, rensa stale mock-stores, tracka event
  // och navigera till /lobby. Inlinad här istället för delad utility
  // tills en tredje call-site dyker upp (då lyfter vi till en delad
  // helper i src/utils/).
  const handleCreateGame = async () => {
    const [freshProfile, freshHasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    if (!freshHasPremium) {
      const free = freshProfile?.freeGameCredits ?? 0;
      const extras = freshProfile?.gameCredits ?? 0;
      if (free === 0 && extras === 0) {
        Alert.alert(
          'Out of Host Game Credits',
          'You have no credits left for today. Buy extra credits in Store, wait for the daily refresh at midnight CET, or upgrade to a QuizVibe membership for unlimited host games.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Store', onPress: () => router.push('/store?focus=credits&from=/profile') },
          ],
        );
        return;
      }
    }
    const code = generateRoomCode();
    await registerActiveRoom(code, {
      maxPlayers: freshProfile?.maxPlayers ?? 4,
      hostIsPremium: freshHasPremium,
      currentPlayerCount: 1,
      hostPlayerName: freshProfile?.playerName ?? '',
      gameStarted: false,
    });
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
        onBackPress={() => router.replace('/')}
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
            onPress={() => router.push('/store?focus=credits&from=/profile')}
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
              {/* Extras-ruta — egen Pressable inom pillen, gold-bordred
                  + gold PREMIUM-pill när extras > 0, grey-bordred + grey
                  PREMIUM-pill när 0. Tap visar Store-redirect-Alert
                  (separat handler från pillens onPress; nested Pressable
                  i RN konsumerar tap så outer onPress inte fyrar). */}
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
                      { text: 'Go to Store', onPress: () => router.push('/store?focus=credits&from=/profile') },
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
              <Text style={styles.fieldLabel}>Assistance level</Text>
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
            Game Mode → Number of Players → Region scope + Answer
            response → Game era → Number of Rounds. Egen top-level
            sektion mellan Profile defaults och Game connections;
            samma kollapsbara mönster (+/− toggle, sectionDivider när
            kollapsad) som de övriga top-level rubrikerna. */}
        <Pressable
          onPress={() => setHostDefaultsExpanded(!hostDefaultsExpanded)}
          style={({ pressed }) => [
            styles.gameConnectionsHeaderRow,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <Text style={styles.sectionHeaderEmoji}>👑</Text>
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
            <Text style={styles.fieldLabel}>Game Mode</Text>
            {/* "Use single player mode as default" — sitter ovanför Game
                Mode-toggle:n. När checkad dämpas BÅDA multiplayer-rutorna
                (Pass-the-Phone + Individual Devices) eftersom single-player
                inte använder någon av dem. När bocken tas bort defaultar
                vi alltid till Pass-the-Phone (gratis-läget) — användaren
                kan sedan tappa Individual Devices-rutan om de vill växla. */}
            <Pressable
              style={({ pressed }) => [
                styles.singlePlayerRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                setSinglePlayerDefault((v) => {
                  const next = !v;
                  if (!next) {
                    // Uncheck → defaulta till gratis-läget på BÅDA
                    // toggles (Pass-the-Phone + Max 4) så användaren
                    // hamnar i ett konsekvent multiplayer-läge.
                    setGameMode('pass-the-phone');
                    setMaxPlayers(4);
                  }
                  return next;
                });
              }}
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
                Single-player mode
              </Text>
            </Pressable>
            <View style={styles.modeToggle}>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : gameMode === 'pass-the-phone'
                      ? styles.modeOptionPassActive
                      : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (singlePlayerDefault) {
                    setSinglePlayerDefault(false);
                    setGameMode('pass-the-phone');
                    return;
                  }
                  handleSelectGameMode('pass-the-phone');
                }}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    !singlePlayerDefault && gameMode === 'pass-the-phone' && styles.modeLabelActiveFree,
                    singlePlayerDefault && styles.modeLabelDimmed,
                  ]}
                >
                  Pass-the-Phone
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
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : gameMode === 'individual-devices'
                      ? styles.modeOptionPremiumActive
                      : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (singlePlayerDefault) {
                    if (!hasPremium) {
                      handleSelectGameMode('individual-devices');
                      return;
                    }
                    setSinglePlayerDefault(false);
                    setGameMode('individual-devices');
                    return;
                  }
                  handleSelectGameMode('individual-devices');
                }}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    !singlePlayerDefault && gameMode === 'individual-devices' && styles.modeLabelActivePremium,
                    singlePlayerDefault && styles.modeLabelDimmed,
                  ]}
                >
                  Individual Devices
                </Text>
                <View
                  style={[
                    styles.premiumBadge,
                    (singlePlayerDefault || !(gameMode === 'individual-devices' || hasPremium)) && styles.premiumBadgeGrey,
                  ]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.premiumBadgeText,
                      (singlePlayerDefault || !(gameMode === 'individual-devices' || hasPremium)) && styles.premiumBadgeTextGrey,
                    ]}
                  >
                    PREMIUM
                  </Text>
                </View>
              </Pressable>
            </View>
            {/* Klammer (uppåt-öppen U) under modeToggle:n med "Multiplayer
                mode"-label centrerad. */}
            <View style={styles.multiplayerBracketWrap}>
              <View style={styles.multiplayerBracket} />
              <Text style={styles.multiplayerBracketLabel}>Multiplayer mode</Text>
            </View>
          </View>

          {/* ── Number of Players per Game ────────────────────── */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Number of Players per Game</Text>
            <View style={styles.modeToggle}>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : maxPlayers === 4
                      ? styles.modeOptionPassActive
                      : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
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
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  singlePlayerDefault
                    ? styles.modeOptionDimmed
                    : maxPlayers === 12
                      ? styles.modeOptionPremiumActive
                      : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
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
              </Pressable>
            </View>
          </View>

          {/* Region scope + Answer response — sida vid sida, halv bredd
              vardera. */}
          <View style={styles.fieldRow}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Region scope</Text>
              <Pressable
                onPress={() => setRegionPickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    region === null && styles.selectorPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {regionLabel ?? 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.fieldLabel}>Answer response time</Text>
              <Pressable
                onPress={() => setAnswerResponsePickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text style={styles.selectorText} numberOfLines={1}>
                  {answerResponseLabel}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Game era — adjustable år-spann för frågor. */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Game era (min 10 year interval)</Text>
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

                  if (next[1] - next[0] < ERA_MIN_INTERVAL) return;
                  if (next[0] === eraValues[0] && next[1] === eraValues[1]) return;
                  void Haptics.selectionAsync();
                  setEraValues(next);
                }}
                onValuesChangeFinish={() => {
                  draggingEraThumbRef.current = null;
                }}
                minMarkerOverlapDistance={ERA_MIN_INTERVAL_PX}
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
          </View>

          {/* Number of Rounds — speglar Lobby:s motsvarande sektion. */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Number of Rounds</Text>
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
                onPress={handleIncrementRounds}
                disabled={roundsCount >= roundsMax}
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
            </View>
            <View style={{ alignItems: 'center' }}>
              <RoundsRuler
                value={roundsCount}
                min={ROUNDS_MIN}
                gameModeMax={roundsMax}
                onPremiumPress={() => router.push('/store?focus=subscription&from=/profile')}
                hasSubscription={hasPremium}
                applicable={gameMode === 'individual-devices'}
              />
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
          <Text style={styles.sectionHeaderEmoji}>🎁</Text>
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
            {/* Add-knappen — modeOption-baserad styling så storlek + form
                matchar Individual Devices-knappen. PREMIUM-badge i grå
                (icke-köpt) variant tills Store-integrationen kan flagga
                purchase-status; tap → Store med subscriptions överst (PREMIUM-
                badge:n signalerar premium-feature). */}
            <Pressable
              style={({ pressed }) => [
                styles.addPackageBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push('/store?focus=packages&from=/profile')}
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
            </Pressable>

            {/* Sub-rubrik på egen rad. Select all-toggle hamnar på en
                separat rad nedanför, högerställd så switchen linjerar
                med per-paket-switcharna i listan. Empty state visar en
                informativ text när inga paket är tillgängliga (gen +
                köpta tillsammans tomma — t.ex. inget birthYear). */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Available when you are the Host:
              </Text>
              {/* Select all-toggle göms när bara 1 paket finns — då blir
                  den redundant (single packagets egen toggle gör samma
                  jobb). I v1 har vi bara gen-paketet; återinförs när
                  themed packages aktiveras i framtida release. */}
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
                              isFree
                                ? 'This Customized Host package is included for free based on your Competition Year of Birth. It changes automatically if you update your birth year.'
                                : 'Information about this package will be available later.',
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
                            purchasedPackageBoxActive-mönster. Free gen-paket
                            får en kantskärande FREE-badge för att markera att
                            paketet ingår gratis. */}
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
          <Text style={styles.sectionHeaderEmoji}>🔗</Text>
          <Text style={styles.gameConnectionsHeader}>Game connections</Text>
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
            onPress={() => setFriendsModalOpen(true)}
            style={({ pressed }) => [
              styles.friendsBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.friendsBtnText}>+ Add QuizVibe Friends</Text>
          </Pressable>
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
                  'https://peterlomaco.github.io/quizvibe-app/legal/privacy/',
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
                  'https://peterlomaco.github.io/quizvibe-app/legal/terms/',
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
            <Text style={styles.legalFootnote}>
              Opens in a secure in-app browser. Both documents are also
              available at peterlomaco.github.io/quizvibe-app/legal/.
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

            {/* Add friend row */}
            <View style={friendsModal.addRow}>
              <TextInput
                style={friendsModal.addInput}
                placeholder="Add by Player Name"
                placeholderTextColor={Colors.textDisabled}
                value={newFriendPlayerName}
                onChangeText={setNewFriendPlayerName}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleAddFriend}
              />
              <Pressable
                onPress={handleAddFriend}
                disabled={!newFriendPlayerName.trim()}
                style={({ pressed }) => [
                  friendsModal.addBtn,
                  !newFriendPlayerName.trim() && friendsModal.addBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={friendsModal.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* List */}
            <ScrollView style={{ maxHeight: 320 }}>
              {friends.length === 0 ? (
                <View style={friendsModal.emptyState}>
                  <Text style={friendsModal.emptyIcon}>🫥</Text>
                  <Text style={friendsModal.emptyText}>No friends yet</Text>
                  <Text style={friendsModal.emptySubtext}>
                    Add a Player Name above to start your list.
                  </Text>
                </View>
              ) : (
                friends.map((friend, i) => (
                  <View key={friend.id}>
                    <View style={friendsModal.friendRow}>
                      <Text style={friendsModal.friendEmoji}>
                        {getAvatarEmojiById(friend.avatarId)}
                      </Text>
                      <Text style={friendsModal.friendName}>{friend.playerName}</Text>
                      <Pressable
                        onPress={() => handleRemoveFriend(friend.id)}
                        hitSlop={10}
                        style={friendsModal.removeBtn}
                      >
                        <Text style={friendsModal.removeBtnText}>×</Text>
                      </Pressable>
                    </View>
                    {i < friends.length - 1 && <View style={friendsModal.divider} />}
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              onPress={() => setFriendsModalOpen(false)}
              style={friendsModal.closeBtn}
            >
              <Text style={friendsModal.closeBtnText}>Done</Text>
            </Pressable>
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
              onPress={handleCreateGame}
            >
              <Text style={styles.logoutCreateGameBtnText}>Create Game</Text>
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
              onPress={() => {
                setLogoutModalVisible(false);
                router.push('/?openJoinRegistered=1');
              }}
            >
              <Text style={styles.logoutCreateGameBtnText}>Join Game</Text>
            </Pressable>

            {/* Store-genväg — utan focus-param följer Store sin default-
                ordning (Basic → Credits → Packages → Subscriptions),
                samma som direkt tab-tryck på Store. */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutStoreBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                setLogoutModalVisible(false);
                router.push('/store?from=/profile');
              }}
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
    paddingBottom: Spacing.xxl,
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
    minWidth: 210,
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
  fieldLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // Number of Players per Game-toggle — speglar Lobby:s Game Mode-toggle
  // (Pass-the-Phone vs Individual Devices) i form, mått och färg.
  // Vänster ruta = Max 4 (free, grön aktiv), höger ruta = Max 12 (premium,
  // blå aktiv) med kantskärande PREMIUM-badge i guld.
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
  modeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
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
  // Guld-tonad aktiv variant — Max 12 Players när det är valt. Speglar
  // PREMIUM-badge:s guldfärg så toggle-rutan, badge:n och texten bildar
  // ett samlat "premium-läge"-uttryck.
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
  // Guld-tonad aktiv label — Max 12 Players när det är valt.
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
    right: 8,
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
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
  },
  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
