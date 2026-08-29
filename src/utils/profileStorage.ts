import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { MainCategory, defaultEnabledMainCategories, isMainCategory } from './mainCategory';

/**
 * Profil-lagring — dual-läge sedan Fas 2:
 * - **Med session**: source of truth är Supabase `profiles`-tabellen.
 *   AsyncStorage används som lokal cache så UI:t renderas direkt utan
 *   nätverks-roundtrip vid skärm-byten.
 * - **Utan session** (pre-login): bara AsyncStorage. Gäller t.ex. guest-
 *   spelare som joinar lobby utan att vara registrerade.
 *
 * AsyncStorage-nyckeln versioneras (v1) för framtida schema-migrationer.
 */
const PROFILE_KEY = '@quizvibe/profile/v1';

export type AssistanceLevel = 'minimal' | 'standard' | 'full';
export type Region = 'sweden' | 'nordics' | 'global';
export type AvatarSource = 'upload' | 'choose' | 'default';
export type GameMode = 'pass-the-phone' | 'individual-devices' | 'remote-1v1';

export interface ProfileData {
  playerName: string;
  // Email används vid registrering för att skicka aktiveringslänk.
  // Optional för bakåtkompatibilitet med profiler skapade innan fältet fanns.
  email?: string;
  birthYear: number | null;
  assistance: AssistanceLevel | null;
  region: Region | null;
  avatarSource: AvatarSource;
  selectedAvatarId: string;
  // LEGACY (2026-07-07): engångsköpta Extras-credits borttagna ur V1 —
  // Store säljer inte 5/10/20-paketen längre och varken UI, gates eller
  // deduktion läser fältet. Kvar i typen (+ persistens-passthrough) så
  // gamla sparade saldon inte nollas och ev. framtida re-aktivering
  // slipper migration.
  gameCredits?: number;
  // Antal Host Game-credits användaren har kvar av de GRATIS som följer med
  // Basic-planen (4 per dag). Konsumeras vid Start Game (om ej Premium —
  // Premium = unlimited, ingen deduktion). Optional för bakåtkompatibilitet
  // — defaultas till FREE_CREDITS_DAILY_CAP i UI och fylls på automatiskt
  // till samma cap vid första profil-load efter midnatt CET
  // (se refreshFreeCreditsIfNeeded).
  freeGameCredits?: number;
  // ISO-datum (YYYY-MM-DD i Europe/Stockholm-tidszon) för senaste auto-
  // refresh av freeGameCredits. Används av refreshFreeCreditsIfNeeded i
  // loadProfile för att avgöra om vi ska fylla på till FREE_CREDITS_DAILY_CAP.
  // Optional — saknas på profiler skapade innan refresh-logiken kom in.
  lastFreeCreditsRefreshDate?: string;
  // Hur länge spelarna har på sig att svara på en fråga (i sekunder).
  // Skiljer sig från hur länge frågematerialet (låt/video/bild) spelas upp.
  // Optional för bakåtkompatibilitet — defaultas till 30 i UI.
  answerResponseSeconds?: 30 | 45 | 60;
  // Game era — år-spann för frågor (host-default vid skapande av spel).
  // Optional för bakåtkompatibilitet — defaultas till [1980, 2010] i UI.
  gameEraFrom?: number;
  gameEraTo?: number;
  // Max antal spelare per spel (host-default). 4 = gratis Basic-plan,
  // 12 = kräver Premium-paket, 2 = låst värde för Remote 1v1-läget
  // (sätts av Lobby-seedningen, sparas normalt inte som profil-default).
  // Optional för bakåtkompatibilitet — defaultas till 4 i UI.
  maxPlayers?: 2 | 4 | 12;
  // Default game mode för MULTIPLAYER-spel (host-default). 'pass-the-phone'
  // = en delad enhet, 'individual-devices' = parallellt spel. Single player
  // och Remote 1vs1 är INTE host-defaults — de väljs per spel via
  // "Start New Game" på Home. Optional för bakåtkompatibilitet — defaultas
  // till 'pass-the-phone' i UI.
  gameMode?: GameMode;
  // ⚠ LEGACY sedan 2026-08-26: Single player är inte längre en host-default.
  // Profile skriver alltid false (och coercar ett stale true vid load), men
  // fältet är kvar eftersom DB-kolumnen finns och Lobby:s seed läser
  // motsvarande värde ur lobby_settings vid carry-over (Replay).
  singlePlayerDefault?: boolean;
  // Default antal rundor per MULTIPLAYER-spel (host-default). Stegrar i 2,
  // capas av gameMode i Lobby (Pass-the-Phone max 4, Individual Devices max
  // 20 med Premium). En Single player-lobby ignorerar detta och startar
  // alltid på 4. Optional för bakåtkompatibilitet — defaultas till
  // ROUNDS_DEFAULT i UI.
  roundsDefault?: number;
  // Lista över paket-id:n som användaren har aktiverat i sin Profile för
  // att vara valbara i Lobby (host-vyn). Paket som inte finns i denna lista
  // visas inte alls i Lobby. Optional för bakåtkompat — defaultas till alla
  // PURCHASED_PACKAGES-id:n (allt aktiverat) i UI.
  enabledHostPackages?: string[];
  // Per-source profession-category-defaults (ersätter enabledMainCategories).
  // YouTube: alla tre valbara, min 1 krävs. Default = alla 3.
  // Images: Film+Sport är mandatory (alltid i arrayen), Music valbar. Default = alla 3.
  youtubeEnabledCategories?: MainCategory[];
  imagesEnabledCategories?: MainCategory[];
  // Om Spotify DJ-läget är aktiverat som standard-val i Host defaults.
  // Optional — defaultas till false om saknas.
  spotifyDefaultEnabled?: boolean;
  // Parent Control (barnvänligt urval). När true filtreras YT-items taggade
  // parentControlled bort ur frågeurvalet i alla spel där denna profil är host.
  // AsyncStorage-ONLY (ingen DB-kolumn — samma mönster som spotifyDefaultEnabled).
  // Default false om saknas.
  parentControlEnabled?: boolean;
  // Spotify-svarstyper. Båda true = alternerar per frågeindex (Year / Name).
  // Minst en måste vara true när Spotify är aktiverat.
  spotifyAnswerYear?: boolean;   // default true
  spotifyAnswerName?: boolean;   // default true
  // Self-attest (Plan B 2026-07-22): user har manuellt bekräftat att den har
  // Spotify-appen på enheten ("Spotify user"-toggle i Profile). Ersätter
  // OAuth-verifieringen — ingen DB-kolumn, lever enbart i AsyncStorage-cachen.
  // Default false. Seedar lobby_players.spotify_verified vid join/host.
  spotifyAppConfirmed?: boolean;
  // Player HCP (Dynamic Handicap System). Skala 1–99, 1 = elit, 99 = nybörjare
  // (se src/utils/hcp.ts). Aktuellt intjänat värde per registrerad profil;
  // sköldarna faller tillbaka på calculateInitialHCP(age, assistance) tills
  // justeringsmotorn (Phase D) skrivit ett riktigt värde här.
  //
  // ⚠ AsyncStorage-ONLY (som spotify*-fälten) — MEDVETET ingen DB-kolumn ännu.
  // (a) En upsert som nämner en okörd kolumn failar HELA profiles-skrivningen
  // (samma klass som sketch_enabled/spotify_answer_*), och (b) HCP-progressens
  // INDATA (sliding-fönstren) är device-lokala, så att spegla enbart det
  // härledda värdet cross-device utan fönster-historiken ger inkonsekventa
  // justeringar. Promotera till en profiles-kolumn (egen migration) först när
  // cross-device-HCP faktiskt behövs. Optional för bakåtkompat.
  hcp?: number;
}

// Dual-read mapping för profiler skapade innan rename
// (skill: 'easy' | 'intermediate' | 'expert' → assistance: 'full' | 'standard' | 'minimal').
// Mer hjälp = full assistance; mindre hjälp = minimal assistance.
const LEGACY_SKILL_TO_ASSISTANCE: Record<string, AssistanceLevel> = {
  easy: 'full',
  intermediate: 'standard',
  expert: 'minimal',
};

// Daily-cap för fria Host Games. Top-up till MAX 4 vid midnatt CET via
// refreshFreeCreditsIfNeeded (anropas i loadProfile). Topp-up:en är aldrig
// destruktiv — om saldot redan är ≥ 4 (t.ex. efter en kampanj-bonus) lämnas
// det orört. Konsumeras vid Start Game (Premium = unlimited, ingen deduktion).
// Höjt 2 → 4 (Peter 2026-08-07) — Store visar "Basic: 4 games per day".
export const FREE_CREDITS_DAILY_CAP = 4;

/**
 * Returnerar dagens datum i Europe/Stockholm-tidszon som "YYYY-MM-DD".
 * `sv-SE`-locale ger redan ISO-likt format ("2026-05-06") så ingen
 * extra parsing behövs. Stockholm-tidszonen hanterar DST automatiskt
 * (CET vintertid, CEST sommartid — båda gångbara enligt user-spec
 * "midnatt CET" eftersom DST styr när midnatt faktiskt inträffar).
 */
function todayCETDate(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Top up:ar `freeGameCredits` upp till `FREE_CREDITS_DAILY_CAP` om CET-datumet
 * har passerat sedan senaste refresh. Top-up:en är **icke-destruktiv**:
 *   • saldo ≥ cap → lämnas orört (ingen reduktion).
 *   • saldo < cap → bumpas upp till cap (skillnaden adderas).
 *   • undefined   → behandlas som 0 → bumpas upp till cap.
 * Extras (`gameCredits`) är ALLTID orört av denna funktion — bara Free
 * påverkas vid midnatt. Returnerar `{ data, changed }` så loadProfile bara
 * persisterar om något faktiskt ändrades (inkl. första-läget då datum saknas
 * på legacy-profil men saldo råkar redan vara på cap).
 *
 * Edge case: helt nya profiler (utan lastFreeCreditsRefreshDate) räknas som
 * "ny dag" → får cap direkt vid första load.
 */
function refreshFreeCreditsIfNeeded(data: ProfileData): { data: ProfileData; changed: boolean } {
  const today = todayCETDate();
  if (data.lastFreeCreditsRefreshDate === today) {
    return { data, changed: false };
  }
  const currentFree = data.freeGameCredits ?? 0;
  const nextFree = Math.max(currentFree, FREE_CREDITS_DAILY_CAP);
  return {
    data: {
      ...data,
      freeGameCredits: nextFree,
      lastFreeCreditsRefreshDate: today,
    },
    changed: true,
  };
}

// ── Supabase row-shape (snake_case som det lagras i DB) ────────────────
// Speglar profiles-tabellen från migrationen i Fas 2. Hålls intern — call-
// sites använder ProfileData-shapen via adapter-funktionerna nedan.
interface ProfileRow {
  id: string;
  email: string;
  player_name: string;
  birth_year: number | null;
  assistance: AssistanceLevel | null;
  region: Region | null;
  avatar_source: AvatarSource;
  selected_avatar_id: string;
  game_credits: number;
  free_game_credits: number;
  last_free_credits_refresh_date: string | null;
  answer_response_seconds: 30 | 45 | 60;
  game_era_from: number | null;
  game_era_to: number | null;
  max_players: 2 | 4 | 12;
  game_mode: GameMode;
  single_player_default: boolean;
  enabled_host_packages: string[];
  enabled_main_categories: string[];
  // Migration 0014: per-source category-kolumner. Optional + nullable så
  // rows från en DB utan migrationen (eller med NULL) fortfarande parsar.
  youtube_enabled_categories?: string[] | null;
  images_enabled_categories?: string[] | null;
  rounds_count: number;
}

function rowToProfile(row: ProfileRow): ProfileData {
  return {
    playerName: row.player_name,
    email: row.email,
    birthYear: row.birth_year,
    assistance: row.assistance,
    region: row.region,
    avatarSource: row.avatar_source,
    selectedAvatarId: row.selected_avatar_id,
    gameCredits: row.game_credits,
    freeGameCredits: row.free_game_credits,
    lastFreeCreditsRefreshDate: row.last_free_credits_refresh_date ?? undefined,
    answerResponseSeconds: row.answer_response_seconds,
    gameEraFrom: row.game_era_from ?? undefined,
    gameEraTo: row.game_era_to ?? undefined,
    maxPlayers: row.max_players,
    gameMode: row.game_mode,
    singlePlayerDefault: row.single_player_default,
    enabledHostPackages: row.enabled_host_packages,
    // Dual-read: läs nya per-source-fält om de finns, annars migrera från
    // gamla enabled_main_categories (alla tre → båda sources all-on; annars defaults).
    youtubeEnabledCategories: row.youtube_enabled_categories?.filter(isMainCategory) as MainCategory[] | undefined,
    imagesEnabledCategories: row.images_enabled_categories?.filter(isMainCategory) as MainCategory[] | undefined,
    roundsDefault: row.rounds_count,
  };
}

// Konvertera ProfileData → DB-row för upsert. Defaults appliceras här så
// optionella TS-fält aldrig blir NULL i DB:n om de inte är meningsfulla
// där (t.ex. game_mode måste vara satt enligt CHECK-constraint).
function profileToRow(userId: string, email: string, p: ProfileData): ProfileRow {
  return {
    id: userId,
    email: p.email ?? email,
    player_name: p.playerName,
    birth_year: p.birthYear,
    assistance: p.assistance,
    region: p.region,
    avatar_source: p.avatarSource,
    selected_avatar_id: p.selectedAvatarId,
    game_credits: p.gameCredits ?? 0,
    free_game_credits: p.freeGameCredits ?? FREE_CREDITS_DAILY_CAP,
    last_free_credits_refresh_date: p.lastFreeCreditsRefreshDate ?? null,
    answer_response_seconds: p.answerResponseSeconds ?? 30,
    game_era_from: p.gameEraFrom ?? null,
    game_era_to: p.gameEraTo ?? null,
    max_players: p.maxPlayers ?? 4,
    game_mode: p.gameMode ?? 'pass-the-phone',
    single_player_default: p.singlePlayerDefault ?? false,
    enabled_host_packages: p.enabledHostPackages ?? [],
    // Gamla kolumn bevaras för bakåt-kompatibilitet.
    enabled_main_categories: defaultEnabledMainCategories(),
    // Migration 0014 applicerad — skriver per-source category-kolumner till profiles-tabellen.
    youtube_enabled_categories: p.youtubeEnabledCategories ?? defaultEnabledMainCategories(),
    images_enabled_categories: p.imagesEnabledCategories ?? defaultEnabledMainCategories(),
    rounds_count: p.roundsDefault ?? 4,
  };
}

// Hämtar current session.user. null = ingen session (= guest/pre-login).
// Anonyma sessioner (guests får en via ensureAuthSession för RLS-writes)
// räknas OCKSÅ som "ingen user" — en guest är inte inloggad och ska varken
// läsa/skriva profiles-rader eller trigga backfillProfileFromSession (som
// annars byggde en fantom-profil med tomt playerName → Home/BottomBanner
// visade inloggat läge för guests som ejectats tillbaka till Home).
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  if (data.user?.is_anonymous) return null;
  return data.user;
}

// ── Synkron profil-spegel (login-state utan flimmer) ────────────────────
// `undefined` = ännu inte hydrerad (vi VET inte om användaren är inloggad),
// `null` = utloggad, objekt = inloggad.
//
// Varför: Home nås ALLTID via router.replace('/') (BottomBanner, Profile,
// Store, FAQ, Lobby) vilket är en full re-mount — skärmens `profile`-state
// börjar då om på null medan loadProfile() gör en Supabase-roundtrip
// (auth.getUser + profiles-select). Under den väntan renderades utloggat
// läge, som sedan hoppade till inloggat. Spegeln låter en re-mountad skärm
// rendera rätt läge redan på första framen.
let cachedProfile: ProfileData | null | undefined = undefined;

/**
 * Senast kända profil, synkront. Returnerar `undefined` när spegeln ännu
 * inte hydrerats — call-sites ska då INTE tolka det som "utloggad" utan
 * vänta in loadProfile().
 */
export function getCachedProfile(): ProfileData | null | undefined {
  return cachedProfile;
}

// Värm spegeln från AsyncStorage direkt vid modul-load så även app-cold-start
// har rätt läge innan första skärm-renderingen. En riktig loadProfile() som
// hinner före vinner (guarden nedan) — den har färskare data.
// loadFromAsyncStorage används (i stället för en egen getItem) så legacy-
// migrationerna (nickname→playerName, skill→assistance) och fantom-cache-
// saneringen gäller även spegeln — annars kunde en legacy-profil rendera
// tomt playerName på första framen.
void (async () => {
  try {
    const cached = await loadFromAsyncStorage();
    // En riktig loadProfile() kan ha hunnit före — den har färskare data.
    if (cachedProfile === undefined) cachedProfile = cached;
  } catch {
    // Best-effort — loadProfile() hydrerar spegeln ändå strax efter.
  }
})();

// ── Profil-change-notifier ──────────────────────────────────────────────
// Lättviktig in-memory event-bus så komponenter utanför screen-trädet
// (BottomBanner i app/_layout.tsx) kan reagera på login/logout utan
// polling. useFocusEffect fungerar inte där (ingen route-focus), och
// Supabase auth-events räcker inte ensamt — clearProfile körs EFTER
// signOut i logout-flödet, så en SIGNED_OUT-triggad reload kan hinna
// läsa stale AsyncStorage-cache. Notify:n från clearProfile stänger
// det fönstret.
type ProfileChangeListener = () => void;
const profileChangeListeners = new Set<ProfileChangeListener>();

export function subscribeProfileChanges(listener: ProfileChangeListener): () => void {
  profileChangeListeners.add(listener);
  return () => {
    profileChangeListeners.delete(listener);
  };
}

function notifyProfileChanged(): void {
  profileChangeListeners.forEach((fn) => fn());
}

/**
 * Skriver profilen lokalt + (om session finns) till Supabase. AsyncStorage
 * skrivs alltid först som optimistisk cache så UI-läsare ser uppdateringen
 * direkt även innan nätverks-roundtrip:en klarar sig.
 *
 * Supabase-upsert:en är best-effort: om den failar (offline, RLS-violation,
 * etc.) loggas det men funktionen kastar inte — appen fortsätter funka med
 * lokal cache och nästa save försöker igen.
 */
export async function saveProfile(data: ProfileData): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[profileStorage] Failed to save profile to AsyncStorage:', err);
    throw err;
  }
  cachedProfile = data;
  notifyProfileChanged();
  const user = await getCurrentUser();
  if (!user) return;
  const row = profileToRow(user.id, user.email ?? '', data);
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) {
    console.warn('[profileStorage] Failed to upsert profile to Supabase:', error.message);
  }
}

/**
 * Laddar profilen — Supabase först (när session finns), AsyncStorage som
 * fallback/cache. Daglig free-credits-refresh körs alltid efter load så
 * top-up:en triggar oavsett källa.
 *
 * Edge case "session men ingen profiles-rad" (pre-Fas-2-användare som
 * registrerade sig innan tabellen fanns, eller insert som failade vid
 * signUp): backfilla från user_metadata + AsyncStorage-cache, INSERT
 * raden, returnera.
 */
export async function loadProfile(): Promise<ProfileData | null> {
  const profile = await loadProfileFresh();
  // Håll den synkrona spegeln färsk så nästa skärm-mount slipper flimra.
  cachedProfile = profile;
  return profile;
}

async function loadProfileFresh(): Promise<ProfileData | null> {
  const user = await getCurrentUser();

  // Pre-login: bara AsyncStorage (guest-mode/legacy).
  if (!user) {
    if (__DEV__) console.log('[profileStorage] loadProfile: no session, falling back to AsyncStorage');
    return loadFromAsyncStorage();
  }

  if (__DEV__) console.log('[profileStorage] loadProfile: session user.id=', user.id);

  // Logged in: försök Supabase först.
  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('[profileStorage] Failed to fetch profile from Supabase:', error.message, error);
    // Fall through to AsyncStorage cache; nätet kan vara nere men user ska
    // fortfarande kunna använda appen.
    return loadFromAsyncStorage();
  }

  if (row) {
    if (__DEV__) console.log('[profileStorage] loadProfile: found profiles row');
    let profile = rowToProfile(row as ProfileRow);
    // Fält som enbart lever i AsyncStorage mergas in (saknar DB-kolumn).
    // youtubeEnabledCategories / imagesEnabledCategories: skrivs nu till DB (migration 0014
    // applicerad) — men merge-logiken nedan bevaras som belt-and-suspenders-fallback.
    // spotifyDefaultEnabled + spotifyAnswerYear + spotifyAnswerName: ingen DB-kolumn — alltid från cache.
    {
      const cached = await loadFromAsyncStorage();
      // youtubeEnabledCategories / imagesEnabledCategories: Supabase är
      // ALLTID auktoritativ källa för dessa fält (om migration 0014 är
      // applicerad och kolumnen finns). Rationale: saveProfile() skriver
      // till Supabase SIST (efter AS), medan loadProfile():s fire-and-forget
      // cache-back skriver till AS utan await. Det skapar en race-condition
      // där en tidig loadProfile()-anrop (LP1) startar sitt fire-and-forget
      // med gamla data, och sedan kompletterar EFTER att user:s saveProfile()
      // har lagt ny data i AS — LP1:s write raderar user:s save i AS.
      // Supabase påverkas aldrig av fire-and-forget och speglar alltid
      // den senaste explicita saveProfile()-körningen, dvs. user:s korrekta
      // val. Fallback till AS om Supabase saknar kolumnen (migration 0014
      // inte applicerad ännu, supabaseYT = undefined).
      // spotifyDefaultEnabled: ingen DB-kolumn — alltid från AS-cache.
      const supabaseYT = profile.youtubeEnabledCategories;
      const supabaseImg = profile.imagesEnabledCategories;
      profile = {
        ...profile,
        // En array från Supabase (även TOM = källan medvetet av) är
        // auktoritativ. Bara null/undefined (kolumnen saknas, migration 0014
        // ej applicerad) faller tillbaka på AS-cachen. Tidigare `length > 0`
        // kastade en sparad tom array och kunde återuppliva alla 3 ur cachen.
        youtubeEnabledCategories: Array.isArray(supabaseYT)
          ? supabaseYT
          : cached?.youtubeEnabledCategories,
        imagesEnabledCategories: Array.isArray(supabaseImg)
          ? supabaseImg
          : cached?.imagesEnabledCategories,
        spotifyDefaultEnabled: cached?.spotifyDefaultEnabled,
        spotifyAnswerYear: cached?.spotifyAnswerYear,
        spotifyAnswerName: cached?.spotifyAnswerName,
        spotifyAppConfirmed: cached?.spotifyAppConfirmed,
        // AsyncStorage-only (ingen DB-kolumn) — alltid från cache.
        parentControlEnabled: cached?.parentControlEnabled,
        hcp: cached?.hcp,
      };
    }
    const { data: refreshed, changed } = refreshFreeCreditsIfNeeded(profile);
    // Cache till AsyncStorage så efterföljande loads har varm fallback.
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(refreshed)).catch((err) => {
      console.warn('[profileStorage] Failed to cache profile after Supabase fetch:', err);
    });
    if (changed) {
      // Daily-refresh ändrade saldot — persistera mot Supabase också.
      saveProfile(refreshed).catch(() => { /* loggas redan i saveProfile */ });
    }
    return refreshed;
  }

  // Ingen rad i profiles — backfill från user_metadata + ev. AsyncStorage-cache.
  if (__DEV__) console.log('[profileStorage] loadProfile: no row found, running backfill');
  return await backfillProfileFromSession(user);
}

async function loadFromAsyncStorage(): Promise<ProfileData | null> {
  try {
    const json = await AsyncStorage.getItem(PROFILE_KEY);
    if (!json) return null;
    const raw = JSON.parse(json) as Partial<ProfileData> & {
      nickname?: string;
      skill?: string;
    };
    // Migrera gamla profiler (skapade när fältet hette `nickname`) till
    // nya schemat med `playerName`. Nästa saveProfile skriver bara nya
    // fältet, så storage konvergerar passivt mot det nya schemat.
    if (raw.playerName === undefined && typeof raw.nickname === 'string') {
      raw.playerName = raw.nickname;
      delete raw.nickname;
    }
    // Migrera profiler skapade när fältet hette `skill` med värdena
    // easy/intermediate/expert → nya `assistance` med full/standard/minimal.
    if (raw.assistance === undefined && typeof raw.skill === 'string') {
      raw.assistance = LEGACY_SKILL_TO_ASSISTANCE[raw.skill] ?? null;
      delete raw.skill;
    }
    // Fantom-cache-sanering: en tidigare bugg lät anon-sessioner (guests)
    // backfilla en profil med tomt playerName hit → guests såg inloggat
    // läge på Home. Legitima profiler har alltid playerName (Register
    // validerar non-empty) — tomt namn = bogus rad, rensa och returnera
    // utloggat läge.
    if (typeof raw.playerName !== 'string' || raw.playerName.trim() === '') {
      AsyncStorage.removeItem(PROFILE_KEY).catch(() => { /* best-effort */ });
      return null;
    }
    // Auto-refresh fria credits vid första load efter midnatt CET. Skriv
    // tillbaka direkt om top-up skedde så storage konvergerar.
    const { data: refreshed, changed } = refreshFreeCreditsIfNeeded(raw as ProfileData);
    if (changed) {
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(refreshed)).catch((err) => {
        console.warn('[profileStorage] Failed to persist daily-credits refresh:', err);
      });
    }
    return refreshed;
  } catch (err) {
    console.warn('[profileStorage] Failed to load profile from AsyncStorage:', err);
    return null;
  }
}

/**
 * Backfill när session finns men profiles-tabellen saknar raden (pre-Fas-2-
 * registrering eller misslyckad insert). Bygger en minimal profil från
 * user_metadata + ev. AsyncStorage-cache, persisterar mot Supabase + cache.
 */
async function backfillProfileFromSession(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<ProfileData | null> {
  const cache = await loadFromAsyncStorage();
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaPlayerName = typeof meta.playerName === 'string' ? meta.playerName : null;
  const metaBirthYear = typeof meta.birthYear === 'number' ? meta.birthYear : null;
  const metaAssistance: AssistanceLevel | null =
    meta.assistance === 'minimal' || meta.assistance === 'standard' || meta.assistance === 'full'
      ? (meta.assistance as AssistanceLevel)
      : null;
  const metaRegion: Region | null =
    meta.region === 'sweden' || meta.region === 'nordics' || meta.region === 'global'
      ? (meta.region as Region)
      : null;

  // Prio: cache > metadata > fallback. Cache vinner eftersom user kan ha
  // hunnit redigera lokalt innan profiles-raden skapas.
  const profile: ProfileData = {
    playerName: cache?.playerName ?? metaPlayerName ?? (user.email?.split('@')[0] ?? ''),
    email: user.email,
    birthYear: cache?.birthYear ?? metaBirthYear,
    assistance: cache?.assistance ?? metaAssistance,
    region: cache?.region ?? metaRegion,
    avatarSource: cache?.avatarSource ?? 'default',
    selectedAvatarId: cache?.selectedAvatarId ?? '',
    gameCredits: cache?.gameCredits,
    freeGameCredits: cache?.freeGameCredits,
    lastFreeCreditsRefreshDate: cache?.lastFreeCreditsRefreshDate,
    answerResponseSeconds: cache?.answerResponseSeconds,
    gameEraFrom: cache?.gameEraFrom,
    gameEraTo: cache?.gameEraTo,
    maxPlayers: cache?.maxPlayers,
    gameMode: cache?.gameMode,
    singlePlayerDefault: cache?.singlePlayerDefault,
    roundsDefault: cache?.roundsDefault,
    enabledHostPackages: cache?.enabledHostPackages,
    youtubeEnabledCategories: cache?.youtubeEnabledCategories,
    imagesEnabledCategories: cache?.imagesEnabledCategories,
    spotifyDefaultEnabled: cache?.spotifyDefaultEnabled,
    spotifyAnswerYear: cache?.spotifyAnswerYear,
    spotifyAnswerName: cache?.spotifyAnswerName,
    spotifyAppConfirmed: cache?.spotifyAppConfirmed,
    parentControlEnabled: cache?.parentControlEnabled,
    hcp: cache?.hcp,
  };

  // Persistera mot Supabase. Vi använder upsert eftersom raden kan ha
  // skapats av en parallell flöde (t.ex. signUp insert som råkar landa
  // samtidigt). RLS-policyn enforcar att id matchar auth.uid().
  const row = profileToRow(user.id, user.email ?? '', profile);
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) {
    console.warn('[profileStorage] Failed to backfill profile to Supabase:', error.message);
  }

  // Cache to AsyncStorage too.
  AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile)).catch(() => { /* best-effort */ });
  return profile;
}

/**
 * Rensar LOKAL profil-cache. Server-side data (profiles-rad i Supabase)
 * lämnas orörd — den behövs för att kunna logga in igen från denna eller
 * annan enhet. Anropas typiskt av logout-flödet efter supabase.auth.signOut.
 */
export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (err) {
    console.warn('[profileStorage] Failed to clear profile from AsyncStorage:', err);
  }
  cachedProfile = null;
  notifyProfileChanged();
}

/**
 * Kollar om ett playerName redan är registrerat — driver uniqueness-checken
 * i Register-formen + Add Player-modalen. Returnerar bara en boolean; ingen
 * email eller annan profil-data läcker (till skillnad från den tidigare
 * lookup_email_by_player_name-RPC:n, som togs bort som email-enumererings-
 * fix i migration 0022).
 *
 * player_name är citext så matchningen är case-insensitiv (samma semantik
 * som uniqueness-constrainten). Fail-open (false = "ledigt") vid nätverksfel
 * så lokal validering avgör — matchar tidigare catch-beteende.
 */
export async function playerNameExists(playerName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('player_name_exists', {
    p_name: playerName,
  });
  if (error) {
    console.warn('[profileStorage] player_name_exists failed:', error.message);
    return false;
  }
  return data === true;
}

/**
 * Kollar om en email redan är registrerad — driver email-uniqueness-checken
 * i Register-formens Check-knapp. Returnerar bara en boolean; ingen profil-
 * data läcker. Case-insensitiv (RPC lower():ar auth.users.email).
 *
 * ⚠ Detta är en email-enumereringsvektor (se migration 0040 för rationale +
 * Peters beslut). Fail-open (false = "ledigt") vid nätverksfel så lokal
 * format-validering + Register-submitens signUp avgör — matchar
 * playerNameExists-beteendet.
 */
export async function emailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('email_exists', {
    p_email: email,
  });
  if (error) {
    console.warn('[profileStorage] email_exists failed:', error.message);
    return false;
  }
  return data === true;
}
