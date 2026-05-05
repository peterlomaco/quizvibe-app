import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PlayerHistorySection } from '../components/PlayerHistorySection';
import { QuizVibeFriendsLogo } from '../components/QuizVibeFriendsLogo';
import { QuizVibeQAvatar } from '../components/QuizVibeQAvatar';
import { TopUserBanner } from '../components/TopUserBanner';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { resetIdentity, track } from '../utils/analytics';
import { AVATARS, getAvatarEmojiById } from '../utils/avatars';
import {
    addFriend,
    loadFriends,
    removeFriend,
    type Friend,
} from '../utils/friendsStorage';
import {
    clearProfile,
    loadProfile,
    saveProfile,
    type AssistanceLevel,
    type AvatarSource,
    type GameMode,
    type Region,
} from '../utils/profileStorage';

// ─── Data ─────────────────────────────────────────────────────────────────────

type AvatarCategory = 'All' | 'Retro' | 'Music' | 'Tech' | 'Fun';

const CATEGORIES: AvatarCategory[] = ['All', 'Retro', 'Music', 'Tech', 'Fun'];

// ─── Birth year options (descending, newest first) ────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

const SOURCE_OPTIONS: { id: AvatarSource; icon: string; label: string; subtitle: string }[] = [
  { id: 'upload',  icon: '📤', label: 'Upload Photo',   subtitle: 'Use a photo from your library' },
  { id: 'choose',  icon: '✨', label: 'Choose Avatar',  subtitle: 'Pick from our collection'      },
  { id: 'default', icon: '😶', label: 'Default Image',  subtitle: 'Anonymous silhouette'          },
];

// ─── Competition defaults ─────────────────────────────────────────────────────
// Assistance level styr mängden hjälp i Letter Grid + reveal-kurvor:
// full = mest hjälp (3-letter prefix), minimal = minst (1-letter prefix).
const ASSISTANCE_OPTIONS: { id: AssistanceLevel; label: string }[] = [
  { id: 'full',     label: 'Full'     },
  { id: 'standard', label: 'Standard' },
  { id: 'minimal',  label: 'Minimal'  },
];

const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: 'sweden',  label: 'Sweden'  },
  { id: 'nordics', label: 'Nordics' },
  { id: 'global',  label: 'Global'  },
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
const ERA_MIN = 1900;
const ERA_MAX = new Date().getFullYear();
const ERA_SLIDER_WIDTH = 280;

function DecadeMarks() {
  const decades = Array.from(
    { length: Math.floor((ERA_MAX - ERA_MIN) / 10) + 1 },
    (_, i) => ERA_MIN + i * 10,
  );
  return (
    <View style={{ width: ERA_SLIDER_WIDTH, height: 50, marginTop: 6 }}>
      {decades.map((year) => {
        const position = ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * ERA_SLIDER_WIDTH;
        return (
          <View key={year} style={{ position: 'absolute', left: position, alignItems: 'center', width: 1 }}>
            <View style={{ width: 1, height: 5, backgroundColor: Colors.borderStrong }} />
            <View style={{ width: 30, height: 10, marginTop: 12, transform: [{ rotate: '90deg' }] }}>
              <Text style={{ fontSize: 8, color: Colors.textSecondary, textAlign: 'center', width: 30 }}>
                {year}
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
  const [source, setSource]               = useState<AvatarSource>('choose');
  const [category, setCategory]           = useState<AvatarCategory>('All');
  const [selectedAvatarId, setSelectedId] = useState<string>('5');
  const [isSaved, setIsSaved]             = useState(false);
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [playerName, setPlayerName]           = useState('Player One');
  const [email, setEmail]                     = useState<string>('');
  const [birthYear, setBirthYear]         = useState<number | null>(null);
  const [assistance, setAssistance]       = useState<AssistanceLevel | null>(null);
  const [region, setRegion]               = useState<Region | null>(null);
  const [gameCredits, setGameCredits]     = useState<number>(0);
  const [freeGameCredits, setFreeGameCredits] = useState<number>(0);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean>(false);
  const [youtubeConnected, setYoutubeConnected] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [newFriendPlayerName, setNewFriendPlayerName] = useState('');
  const [answerResponseSeconds, setAnswerResponseSeconds] = useState<AnswerResponse>(30);
  const [eraValues, setEraValues] = useState<[number, number]>([1980, 2010]);
  // Max antal spelare per spel — 4 = Basic (gratis), 12 = Premium.
  const [maxPlayers, setMaxPlayers] = useState<4 | 12>(4);
  // Default game mode (host-default) — 'pass-the-phone' (gratis) eller
  // 'individual-devices' (Premium).
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');
  // Premium-status — styr om PREMIUM-badge på Max 12-toggle visas i guld
  // (köpt) eller grått (inte köpt än). ProfileData saknar subscription-fält
  // tills RevenueCat-integrationen kommer in, så håll false tills vidare.
  const hasPremium = false;

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
          { text: 'Go to Store', onPress: () => router.push('/store') },
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
          { text: 'Go to Store', onPress: () => router.push('/store') },
        ],
      );
      return;
    }
    setMaxPlayers(value);
  };
  const [yearPickerOpen, setYearPickerOpen]     = useState(false);
  const [assistancePickerOpen, setAssistancePickerOpen]   = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [answerResponsePickerOpen, setAnswerResponsePickerOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  // Game connections-blocket (Spotify + YouTube + Friends) kan kollapsas
  // för att minska scrollning. Default expanded så användaren ser
  // alternativen direkt vid första besöket.
  const [gameConnectionsExpanded, setGameConnectionsExpanded] = useState(true);
  // Profile default settings-blocket (avatar + playerName + setup + Save)
  // — samma kollapsbara mönster som Game connections och Player history.
  const [profileDefaultsExpanded, setProfileDefaultsExpanded] = useState(true);

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
        setPlayerName(data.playerName);
        setEmail(data.email ?? '');
        setBirthYear(data.birthYear);
        setAssistance(data.assistance);
        setRegion(data.region);
        setSource(data.avatarSource);
        setSelectedId(data.selectedAvatarId);
        setGameCredits(data.gameCredits ?? 0);
        setFreeGameCredits(data.freeGameCredits ?? 0);
        setSpotifyConnected(data.spotifyConnected ?? false);
        setYoutubeConnected(data.youtubeConnected ?? false);
        setAnswerResponseSeconds(data.answerResponseSeconds ?? 30);
        setEraValues([data.gameEraFrom ?? 1980, data.gameEraTo ?? 2010]);
        setMaxPlayers(data.maxPlayers ?? 4);
        setGameMode(data.gameMode ?? 'pass-the-phone');
      });
      loadFriends().then((list) => {
        if (active) setFriends(list);
      });
      return () => { active = false; };
    }, []),
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

  const handleSave = async () => {
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
        spotifyConnected,
        youtubeConnected,
        answerResponseSeconds,
        gameEraFrom: eraValues[0],
        gameEraTo: eraValues[1],
        maxPlayers,
        gameMode,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // TODO: visa felmeddelande till användaren om spara misslyckas
    }
  };

  const previewCaption =
    source === 'upload'  ? 'Custom photo'
    : source === 'default' ? 'Default image'
    : `${selectedAvatar?.category ?? ''} avatar`;

  // Mock Spotify connect: för riktig integration används OAuth via Spotify
  // Web API + expo-auth-session. Just nu togglas bara state + spara på profil.
  // TODO (auth): implementera riktig Spotify OAuth.
  const handleConnectSpotify = async () => {
    setSpotifyConnected(true);
    try {
      const data = await loadProfile();
      const next = {
        playerName: data?.playerName ?? playerName,
        birthYear: data?.birthYear ?? birthYear,
        assistance: data?.assistance ?? assistance,
        region: data?.region ?? region,
        avatarSource: data?.avatarSource ?? source,
        selectedAvatarId: data?.selectedAvatarId ?? selectedAvatarId,
        gameCredits: data?.gameCredits ?? gameCredits,
        freeGameCredits: data?.freeGameCredits ?? freeGameCredits,
        spotifyConnected: true,
      };
      await saveProfile(next);
    } catch {
      // tyst — UI:t har redan uppdaterats
    }
  };

  const handleDisconnectSpotify = () => {
    Alert.alert(
      'Disconnect Spotify?',
      'Songs during games will play with Spotify ads.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setSpotifyConnected(false);
            try {
              const data = await loadProfile();
              if (data) {
                await saveProfile({ ...data, spotifyConnected: false });
              }
            } catch {
              // tyst
            }
          },
        },
      ],
    );
  };

  // Mock YouTube connect — speglar Spotify-mönstret. För riktig integration
  // används YouTube Data API + OAuth via Google sign-in.
  // TODO (auth): implementera riktig YouTube OAuth.
  const handleConnectYoutube = async () => {
    setYoutubeConnected(true);
    try {
      const data = await loadProfile();
      if (data) {
        await saveProfile({ ...data, youtubeConnected: true });
      }
    } catch {
      // tyst — UI:t har redan uppdaterats
    }
  };

  const handleDisconnectYoutube = () => {
    Alert.alert(
      'Disconnect YouTube?',
      'You will lose the enhanced video experience during games.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setYoutubeConnected(false);
            try {
              const data = await loadProfile();
              if (data) {
                await saveProfile({ ...data, youtubeConnected: false });
              }
            } catch {
              // tyst
            }
          },
        },
      ],
    );
  };

  // Logout-flow via TopUserBanner-pillen. Speglar Home-skärmens
  // profileMenu (header med avatar+playerName+"Logged in"-status, röd
  // Log out-knapp, Cancel) — samma visuella behandling så användaren
  // får konsistent UX oavsett varifrån de loggar ut.
  const handleConfirmLogout = async () => {
    await clearProfile();
    track('user_logged_out');
    resetIdentity();
    setLogoutModalVisible(false);
    router.replace('/');
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
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push('/store')}
          >
            <Text style={styles.creditsLabel}>Host Game Credits</Text>
            <View style={styles.creditsValueRow}>
              <Text style={styles.creditsKey}>Free:</Text>
              <Text style={[styles.creditsValue, styles.creditsValueFree]}>{freeGameCredits}</Text>
              <Text style={styles.creditsKey}>Extras:</Text>
              <Text style={[styles.creditsValue, styles.creditsValueExtras]}>{gameCredits}</Text>
              <Text style={styles.creditsArrow}>›</Text>
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
                  {birthYear ?? 'Select'}
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

          {/* ── Region scope (full kort-bredd, eget block) ───────
              Sub-rubrik centrerad över hela kort-bredden så det blir
              tydlig visuell separering mellan player-defaults (Year of
              birth + Assistance level i kolumnen ovan) och host-specifika
              defaults (Region scope). */}
          <Text style={styles.setupHeaderFullWidth}>
            Host default settings
          </Text>
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

            {/* Answer response — hur lång tid spelarna har på sig att svara
                på en fråga. Skiljer sig från hur länge själva frågematerialet
                (låt/video/bild) spelas upp. */}
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

          {/* Game era — adjustable år-spann för frågor (samma slider-mönster
              som Lobbyns Game Era). */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Game era</Text>
            <View style={styles.eraDisplay}>
              <Text style={styles.eraDisplayYear}>{eraValues[0]}</Text>
              <Text style={styles.eraDisplayDash}>–</Text>
              <Text style={styles.eraDisplayYear}>{eraValues[1]}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MultiSlider
                values={eraValues}
                min={ERA_MIN}
                max={ERA_MAX}
                step={1}
                onValuesChange={(vals) => setEraValues([vals[0], vals[1]])}
                selectedStyle={{ backgroundColor: Colors.primary }}
                unselectedStyle={{ backgroundColor: Colors.border }}
                markerStyle={{
                  backgroundColor: Colors.primary,
                  borderColor: Colors.background,
                  borderWidth: 2,
                  width: 22,
                  height: 22,
                }}
                trackStyle={{ height: 4, borderRadius: 2 }}
                containerStyle={{ alignSelf: 'center' }}
                sliderLength={ERA_SLIDER_WIDTH}
              />
              <DecadeMarks />
            </View>
          </View>

          {/* ── Game Mode (host-default) ─────────────────────────
              Pass-the-Phone (gratis) vs Individual Devices (Premium).
              Speglar Lobby:s Game Mode-toggle exakt — grön aktiv för
              Pass-the-Phone (free), guld aktiv för Individual Devices
              (premium-läge). Försök att välja Individual Devices utan
              Premium triggar Store-omdirigering. */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Game Mode</Text>
            <View style={styles.modeToggle}>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  gameMode === 'pass-the-phone' ? styles.modeOptionPassActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectGameMode('pass-the-phone')}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    gameMode === 'pass-the-phone' && styles.modeLabelActiveFree,
                  ]}
                >
                  Pass-the-Phone
                </Text>
                <View style={styles.freeBadge} pointerEvents="none">
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  gameMode === 'individual-devices' ? styles.modeOptionPremiumActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectGameMode('individual-devices')}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    gameMode === 'individual-devices' && styles.modeLabelActivePremium,
                  ]}
                >
                  Individual Devices
                </Text>
                <View
                  style={[
                    styles.premiumBadge,
                    !(gameMode === 'individual-devices' || hasPremium) && styles.premiumBadgeGrey,
                  ]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.premiumBadgeText,
                      !(gameMode === 'individual-devices' || hasPremium) && styles.premiumBadgeTextGrey,
                    ]}
                  >
                    PREMIUM
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* ── Number of Players per Game ──────────────────────────
              Host-default: max 4 spelare (Basic / gratis) eller max 12
              (Premium). Toggle:n speglar Lobby:s Game Mode-toggle:
              grön aktiv för Max 4 (free-läge), blå aktiv för Max 12
              (premium-läge) med PREMIUM-badge i guld som kantskärande
              tag på den högra rutan. */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Number of Players per Game</Text>
            <View style={styles.modeToggle}>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  maxPlayers === 4 ? styles.modeOptionPassActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectMaxPlayers(4)}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    maxPlayers === 4 && styles.modeLabelActiveFree,
                  ]}
                >
                  Max 4 Players
                </Text>
                <View style={styles.freeBadge} pointerEvents="none">
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modeOption,
                  maxPlayers === 12 ? styles.modeOptionPremiumActive : styles.modeOptionInactive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSelectMaxPlayers(12)}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    maxPlayers === 12 && styles.modeLabelActivePremium,
                  ]}
                >
                  Max 12 Players
                </Text>
                {/* PREMIUM-badge: guld när Max 12 är vald (visuell bekräftelse
                    på premium-läge) eller när användaren har betalat. Grå
                    annars — signalerar "låst tills du köper". */}
                <View
                  style={[
                    styles.premiumBadge,
                    !(maxPlayers === 12 || hasPremium) && styles.premiumBadgeGrey,
                  ]}
                  pointerEvents="none"
                >
                  <Text
                    style={[
                      styles.premiumBadgeText,
                      !(maxPlayers === 12 || hasPremium) && styles.premiumBadgeTextGrey,
                    ]}
                  >
                    PREMIUM
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* ── Save (inuti kortet) ─────────────────────────────── */}
          <Button
            label={isSaved ? '✓ Saved' : 'Save Profile'}
            onPress={handleSave}
            variant={isSaved ? 'secondary' : 'primary'}
          />
        </View>
        </>
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
        {/* Spotify-koppling: tillåter ad-free playback under quiz-rundor
            och låser upp Spotify-källan i Lobbyns Game connections-blocket. */}
        <View style={styles.spotifyCard}>
          <View style={styles.spotifyHeader}>
            <View style={[styles.spotifyIconWrap, !spotifyConnected && styles.iconWrapMuted]}>
              <Text style={[styles.spotifyIcon, !spotifyConnected && styles.iconGlyphMuted]}>♫</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotifyTitle}>
                {spotifyConnected ? 'Spotify connected' : 'Connect your Spotify account'}
              </Text>
              <Text style={styles.spotifySubtitle}>
                {spotifyConnected
                  ? 'Songs play full-length with no Spotify ads.'
                  : 'Pre-requisite to access Spotify when Game mode / Individual devices are activated.'}
              </Text>
            </View>
            {spotifyConnected && <Text style={styles.spotifyCheck}>✓</Text>}
          </View>

          <Pressable
            onPress={spotifyConnected ? handleDisconnectSpotify : handleConnectSpotify}
            style={({ pressed }) => [
              styles.spotifyBtn,
              spotifyConnected ? styles.spotifyBtnDisconnect : styles.spotifyBtnConnect,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[
              styles.spotifyBtnText,
              spotifyConnected && styles.spotifyBtnTextDisconnect,
            ]}>
              {spotifyConnected ? 'Disconnect' : 'Connect Spotify account'}
            </Text>
          </Pressable>
        </View>

        {/* ── YouTube-koppling ──────────────────────────────────── */}
        {/* Speglar Spotify-kortets layout. Loggan är en röd kvadrat
            (44x44) med vit playpil centrerad — matchar Spotify-ikonens
            storlek och Lobbyns YouTube-rad fast uppskalat. */}
        <View style={styles.youtubeCard}>
          {/* "Partly Free"-badge som skär kortets röda kantlinje i
              övre högre delen — samma border-skärande mönster som
              FREE-badgen i Lobbyns Game Mode-toggle. */}
          <View style={styles.partlyFreeBadge} pointerEvents="none">
            <Text style={styles.partlyFreeBadgeText}>PARTLY FREE</Text>
          </View>
          <View style={styles.spotifyHeader}>
            <View style={[styles.youtubeIconWrap, !youtubeConnected && styles.youtubeIconWrapMuted]}>
              <View style={[styles.youtubeIconArrow, !youtubeConnected && styles.youtubeIconArrowMuted]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotifyTitle}>
                {youtubeConnected ? 'YouTube connected' : 'Connect your YouTube account'}
              </Text>
              <Text style={styles.spotifySubtitle}>
                Use the most potential from YouTube. No connection will still use YouTube basic material for free.
              </Text>
            </View>
            {youtubeConnected && <Text style={styles.youtubeCheck}>✓</Text>}
          </View>

          <Pressable
            onPress={youtubeConnected ? handleDisconnectYoutube : handleConnectYoutube}
            style={({ pressed }) => [
              styles.spotifyBtn,
              youtubeConnected ? styles.youtubeBtnDisconnect : styles.youtubeBtnConnect,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[
              styles.spotifyBtnText,
              youtubeConnected && styles.youtubeBtnTextDisconnect,
            ]}>
              {youtubeConnected ? 'Disconnect' : 'Connect YouTube account'}
            </Text>
          </Pressable>
        </View>

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
        <View style={friendsModal.overlay}>
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
        </View>
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
                      {item}
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

            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleConfirmLogout}
            >
              <Text style={styles.logoutBtnText}>Log out</Text>
            </Pressable>

            <Pressable
              style={styles.logoutCancelBtn}
              onPress={() => setLogoutModalVisible(false)}
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
        <Text style={styles.sourceIconText}>{icon}</Text>
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
  // ── Logout-modal (speglar profileMenu från app/(tabs)/index.tsx
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
    gap: 2,
    minWidth: 170,
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

  // Spotify connect-card (viktig integration — Spotify-grön accent)
  spotifyCard: {
    backgroundColor: 'rgba(29,185,84,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  spotifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Unicode-text-glyph (♫, U+266B) istället för 🎵-emoji så color + fontWeight
  // faktiskt appliceras — emoji ignorerar color-stylen och blir grön mot grön
  // bg. Med text-glyfen får vi tydlig svart not.
  spotifyIcon: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: '#000000',
  },
  // Muted-varianter för ikon-wrap + glyph när användaren inte är connectead.
  // Bg byts till neutral grå (samma palett som Lobbyns auto-disabled Spotify-
  // switch) så ikonen "släcks". När användaren connectar lyser den upp
  // tillbaka till sin brand-färg.
  iconWrapMuted: {
    backgroundColor: '#3A3F4B',
  },
  iconGlyphMuted: {
    opacity: 0.45,
  },
  spotifyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  spotifySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  spotifyCheck: {
    fontSize: 22,
    color: '#1DB954',
    fontWeight: FontWeight.bold,
  },
  spotifyBtn: {
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyBtnConnect: {
    backgroundColor: '#1DB954',
  },
  spotifyBtnDisconnect: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  spotifyBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  spotifyBtnTextDisconnect: {
    color: Colors.textSecondary,
  },

  // YouTube connect-card (speglar Spotify-mönstret — YouTube-röd accent).
  // position:'relative' så absolut-positionerad PARTLY FREE-badge kan skära
  // kantlinjen utan att klippas (overflow får INTE vara hidden).
  youtubeCard: {
    position: 'relative',
    backgroundColor: 'rgba(255,0,0,0.06)',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#FF0000',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  // Border-skärande badge i övre högre hörnet — samma teknik som FREE-badgen
  // i Lobbyns Game Mode-toggle. Bg matchar youtubeCard.borderColor (#FF0000)
  // så den känns som en "tag" som överlappar kantlinjen. Vit text för kontrast.
  partlyFreeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: '#FF0000',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  partlyFreeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  // 44x44 röd rundad kvadrat med vit playpil centrerad
  // (samma logo-mönster som Lobbyns YouTube-rad fast uppskalat).
  // marginTop sänker ikonen optiskt mot subtitle-textens vertikala mitt.
  youtubeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  youtubeIconArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 9.5,
    borderBottomWidth: 9.5,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  // Muted-varianter för YouTube-ikonen när användaren inte är connectead.
  // Bg byts till neutral grå (samma palett som Spotify-ikonens muted-state)
  // och playpilen får ljusare grå färg så den fortfarande syns mot bg:n.
  youtubeIconWrapMuted: {
    backgroundColor: '#3A3F4B',
  },
  youtubeIconArrowMuted: {
    borderLeftColor: '#9CA3AF',
  },
  youtubeCheck: {
    fontSize: 22,
    color: '#FF0000',
    fontWeight: FontWeight.bold,
  },
  youtubeBtnConnect: {
    backgroundColor: '#FF0000',
  },
  youtubeBtnDisconnect: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  youtubeBtnTextDisconnect: {
    color: Colors.textSecondary,
  },

  // QuizVibe friends card (samma struktur som Spotify-kortet:
  // header upptill, full-bredd-knapp i underkant)
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
  // Wrapper för QuizVibeFriendsLogo. Bredden matchar Spotify/YouTube-
  // icon-wrapsen (44) så text-blocket börjar på samma x; SVG:n får
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
  // Sub-rubrik som spänner hela kort-bredden (placeras utanför
  // columnsRow). Vänsterställd för att linjera med fältens labels nedanför.
  setupHeaderFullWidth: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'left',
    marginTop: Spacing.md,
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
  // Game era display + slider styling (matchar Lobby-skärmens mönster)
  eraDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  eraDisplayYear: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  eraDisplayDash: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.textSecondary,
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
