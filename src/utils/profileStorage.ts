import { supabase } from './supabase';
import { MainCategory, defaultEnabledMainCategories, isMainCategory } from './mainCategory';
import { cacheBelongsTo, pickBackfillIdentity } from './sessionIdentity';
import {
  getSessionState,
  isRegisteredStored,
  readStoredSession,
  registeredUserOf,
  type SessionUser,
} from './sessionState';
import { currentAuthEpoch, getUserScope, scopedStorage, userKey } from './storageScope';

/**
 * Profil-lagring:
 * - Source of truth är Supabase `profiles`-tabellen.
 * - En lokal cache per konto (userKey(uid,'profile'), se storageScope.ts) gör
 *   att UI:t renderas direkt och att en inloggad användare fungerar offline.
 * - Utan registrerad session i DETTA projekt finns ingen profil (Build 41) —
 *   gäster och utloggade får null.
 */

export type AssistanceLevel = 'minimal' | 'standard' | 'full';
export type Region = 'sweden' | 'nordics' | 'global';
export type AvatarSource = 'upload' | 'choose' | 'default';
export type GameMode = 'pass-the-phone' | 'individual-devices' | 'remote-1v1';

export interface ProfileData {
  playerName: string;
  // Email används vid registrering för att skicka aktiveringslänk.
  // Optional för bakåtkompatibilitet med profiler skapade innan fältet fanns.
  email?: string;
  // Supabase user id för kontot som skrev den lokala cachen (Build 41).
  // Stämplas vid varje cache-skrivning och avgör ägarskap (cacheBelongsTo).
  ownerUserId?: string;
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
  // YouTube: Music/Film valbara, min 1 krävs. Default = båda (Sport borttaget 2026-09).
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
  // Filter: "Include theme-specific questions" (Peter 2026-11-26). true =
  // theme-only items (inBaseCatalog: false) also join Generic games. Host
  // default. AsyncStorage-ONLY, default false (excluded) om saknas.
  includeThemeQuestions?: boolean;
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
  // Per-kategori-HCP för den region scope spelaren senast spelade i (§1.3).
  // AsyncStorage-only, samma rationale som `hcp`. `hcp` ovan = `total` här (den
  // enda skalär lobby-kolumnen + legacy-läsare läser fortfarande `hcp`). Detta
  // fält låter sköldarna läsa alla värden synkront via getCachedProfile().
  // Bara EN region lagras här (den senast spelade) — sköldarna är per-session;
  // en per-region-map skulle blåsa upp profil-bloben i onödan. Speglas av
  // hcpProgress.ts mirrorToProfile. Display-heltal (avrundade uppåt).
  // (Sport är borttaget ur modellen 2026-09; en äldre profil-spegel kan bära en
  // kvarvarande `sport`-nyckel — den ignoreras.)
  hcpByCategory?: {
    region: string;
    total: number;
    music: number;
    film: number;
  };
  // Vald countdown-röst (röstpack-id, eller DEFAULT_VOICE_ID = system-TTS).
  // Styr vilken röst som talar 3-2-1 + "When"/"Who" i CountdownIntro. Läses
  // per enhet ur den lokala profil-spegeln vid speltid (device-lokal audio-
  // preferens, som "Audio this device"). AsyncStorage-ONLY (ingen DB-kolumn —
  // samma mönster som parentControlEnabled). Default 'default' i UI.
  voice?: string;
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

// ── Session + cache helpers (Build 41, 2026-11-26) ──────────────────────
//
// Inloggat läge kräver en REGISTRERAD session för DETTA Supabase-projekt
// (online eller offline — se sessionState.ts). En lokalt sparad profil räcker
// aldrig ensam. Profil-cachen ligger under userKey(uid, 'profile') och bär
// `ownerUserId`, så ett konto aldrig ser ett annat kontos cache.

/** Parent Control-default ur signup-metadata (bara satt på nya konton). */
function metaParentControl(meta: Record<string, unknown> | undefined): boolean | undefined {
  const v = meta?.parentControlEnabled;
  return typeof v === 'boolean' ? v : undefined;
}

// Levande, icke-anonym session — krävs för alla SERVER-skrivningar.
// Läser den lokala sessionen (ingen getUser-nätverksrunda, se 2026-10-21).
async function getCurrentUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData.session?.user;
  if (!sessionUser || sessionUser.is_anonymous) return null;
  return sessionUser;
}

const PROFILE_STORE = 'profile';
// Godkända preferensfält som engångsövergången flyttat från en äldre cache
// (storageTransition.ts). Konsumeras vid första lyckade online-laddning.
const LEGACY_PREFS_STORE = 'legacyPrefs';
// "Include mature content" (= !parentControlEnabled): ett sparat val bevaras
// alltid, även från Build 40 (Peter 2026-11-26). Den tidigare engångsreseten
// (nyckeln 'matureDefaultV2') är borttagen; en kvarliggande nyckel ignoreras.

type LegacyPrefs = Partial<
  Pick<
    ProfileData,
    | 'voice'
    | 'parentControlEnabled'
    | 'spotifyAppConfirmed'
    | 'spotifyDefaultEnabled'
    | 'spotifyAnswerYear'
    | 'spotifyAnswerName'
  >
>;

function parseProfileCache(json: string | null): ProfileData | null {
  if (!json) return null;
  try {
    const raw = JSON.parse(json) as Partial<ProfileData> & {
      nickname?: string;
      skill?: string;
    };
    if (raw.playerName === undefined && typeof raw.nickname === 'string') {
      raw.playerName = raw.nickname;
      delete raw.nickname;
    }
    if (raw.assistance === undefined && typeof raw.skill === 'string') {
      raw.assistance = LEGACY_SKILL_TO_ASSISTANCE[raw.skill] ?? null;
      delete raw.skill;
    }
    if (typeof raw.playerName !== 'string' || raw.playerName.trim() === '') return null;
    return raw as ProfileData;
  } catch {
    return null;
  }
}

/** Kontots egen profil-cache, eller null (saknas, trasig eller annan ägare). */
async function readUserCache(user: { id: string; email?: string | null }): Promise<ProfileData | null> {
  try {
    const cache = parseProfileCache(await scopedStorage.getItem(userKey(user.id, PROFILE_STORE)));
    if (!cache || !cacheBelongsTo(cache, user)) return null;
    const { data: refreshed, changed } = refreshFreeCreditsIfNeeded(cache);
    if (changed) await writeUserCache(user.id, refreshed);
    return refreshed;
  } catch (err) {
    console.warn('[profileStorage] Failed to read profile cache:', err);
    return null;
  }
}

async function writeUserCache(uid: string, data: ProfileData): Promise<ProfileData> {
  const stamped: ProfileData = { ...data, ownerUserId: uid };
  await scopedStorage.setItem(userKey(uid, PROFILE_STORE), JSON.stringify(stamped));
  return stamped;
}

async function readLegacyPrefs(uid: string): Promise<LegacyPrefs | null> {
  try {
    const raw = await scopedStorage.getItem(userKey(uid, LEGACY_PREFS_STORE));
    return raw ? (JSON.parse(raw) as LegacyPrefs) : null;
  } catch {
    return null;
  }
}

// ── Synkron profil-spegel (login-state utan flimmer) ────────────────────
// `undefined` = ännu inte hydrerad (vi VET inte om användaren är inloggad),
// `null` = utloggad, objekt = inloggad.
//
// Varför: Home nås ALLTID via router.replace('/') (BottomBanner, Profile,
// Store, FAQ, Lobby) vilket är en full re-mount — skärmens `profile`-state
// börjar då om på null medan loadProfile() gör en Supabase-roundtrip. Under
// den väntan renderades utloggat läge, som sedan hoppade till inloggat.
// Spegeln låter en re-mountad skärm rendera rätt läge redan på första framen.
let cachedProfile: ProfileData | null | undefined = undefined;

/**
 * Senast kända profil, synkront. Returnerar `undefined` när spegeln ännu
 * inte hydrerats — call-sites ska då INTE tolka det som "utloggad" utan
 * vänta in loadProfile().
 */
export function getCachedProfile(): ProfileData | null | undefined {
  return cachedProfile;
}

// Värm spegeln vid modul-load UTAN nätverk: den sparade sessionen för detta
// projekt avgör kontot, och bara det kontots egen cache får seeda spegeln.
// En riktig loadProfile() som hinner före vinner (guarden nedan).
void (async () => {
  try {
    const epoch = currentAuthEpoch();
    const stored = await readStoredSession();
    if (stored.status === 'error') return; // vet inte — låt loadProfile avgöra
    const warm = isRegisteredStored(stored)
      ? await readUserCache({ id: stored.user.id, email: stored.user.email })
      : null;
    if (cachedProfile === undefined && epoch === currentAuthEpoch()) cachedProfile = warm;
  } catch {
    // Best-effort — loadProfile() hydrerar spegeln ändå strax efter.
  }
})();

// ── Profil-change-notifier ──────────────────────────────────────────────
// Lättviktig in-memory event-bus så komponenter utanför screen-trädet
// (BottomBanner i app/_layout.tsx) kan reagera på login/logout utan
// polling. clearProfile körs EFTER signOut i logout-flödet, så notify:n
// därifrån stänger fönstret där en SIGNED_OUT-triggad reload annars kunde
// läsa en inaktuell spegel.
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
 * True när profiländringar kan sparas till servern just nu. Offline (utgången
 * token utan nät) blockeras profil-redigering i Build 41 — det finns ingen
 * offline-synk, och en lokal ändring skulle annars skrivas över av DB-raden
 * vid nästa online-laddning.
 */
export async function canSaveProfileNow(): Promise<boolean> {
  return (await getSessionState()).kind === 'online';
}

/**
 * Skriver profilen till kontots egen cache + (online) till Supabase.
 * Utan registrerad session sparas ingenting — en gäst/utloggad har ingen
 * profil. Supabase-upserten är best-effort som tidigare.
 */
export async function saveProfile(data: ProfileData): Promise<void> {
  const epoch = currentAuthEpoch();
  const scope = await getUserScope();
  if (!scope) {
    if (__DEV__) console.warn('[profileStorage] saveProfile ignored — no registered session');
    return;
  }
  let stamped: ProfileData;
  try {
    stamped = await writeUserCache(scope.uid, data);
  } catch (err) {
    console.warn('[profileStorage] Failed to save profile to AsyncStorage:', err);
    throw err;
  }
  if (epoch === currentAuthEpoch()) {
    cachedProfile = stamped;
    notifyProfileChanged();
  }
  if (scope.state.kind !== 'online') return;
  const user = await getCurrentUser();
  if (!user || user.id !== scope.uid) return;
  const row = profileToRow(user.id, user.email ?? '', stamped);
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) {
    console.warn('[profileStorage] Failed to upsert profile to Supabase:', error.message);
  }
}

/**
 * Laddar profilen för den registrerade sessionen i detta projekt.
 * - online: Supabase-raden (cache som fallback vid DB-fel).
 * - offline: kontots egen cache.
 * - gäst / utloggad / okänt: null. Inget raderas vid okänt läge.
 */
export async function loadProfile(): Promise<ProfileData | null> {
  let epoch = currentAuthEpoch();
  let profile = await loadProfileFresh();
  if (epoch !== currentAuthEpoch()) {
    // Kontot bytte under laddningen — svaret gäller det gamla kontot.
    epoch = currentAuthEpoch();
    profile = await loadProfileFresh();
  }
  if (epoch === currentAuthEpoch()) cachedProfile = profile;
  return profile;
}

async function loadProfileFresh(): Promise<ProfileData | null> {
  const state = await getSessionState();
  const user = registeredUserOf(state);
  if (!user) return null;
  if (state.kind === 'offline') return readUserCache(user);

  const { data: row, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('[profileStorage] Failed to fetch profile from Supabase:', error.message, error);
    return readUserCache(user);
  }

  if (!row) {
    if (__DEV__) console.log('[profileStorage] loadProfile: no row found, running backfill');
    return await backfillProfileFromSession(user);
  }

  let profile = rowToProfile(row as ProfileRow);
  const cached = await readUserCache(user);
  const legacy = cached ? null : await readLegacyPrefs(user.id);
  const prefs: LegacyPrefs = cached ?? legacy ?? {};
  // youtube/images-kategorierna: Supabase är auktoritativ när kolumnen finns
  // (även en TOM array = källan medvetet av); bara null/undefined faller
  // tillbaka på cachen. Övriga fält saknar DB-kolumn och kommer alltid från
  // kontots egen cache (eller från engångsövergångens legacyPrefs).
  const supabaseYT = profile.youtubeEnabledCategories;
  const supabaseImg = profile.imagesEnabledCategories;
  profile = {
    ...profile,
    youtubeEnabledCategories: Array.isArray(supabaseYT) ? supabaseYT : cached?.youtubeEnabledCategories,
    imagesEnabledCategories: Array.isArray(supabaseImg) ? supabaseImg : cached?.imagesEnabledCategories,
    spotifyDefaultEnabled: prefs.spotifyDefaultEnabled,
    spotifyAnswerYear: prefs.spotifyAnswerYear,
    spotifyAnswerName: prefs.spotifyAnswerName,
    spotifyAppConfirmed: prefs.spotifyAppConfirmed,
    // Ett sparat val (cache eller engångsövergångens legacyPrefs) bevaras
    // alltid (Peter 2026-11-26 — ingen reset). Saknas det faller vi på
    // signup-metadata; saknas även den → undefined → `?? false` i skärmarna,
    // dvs. "Include mature content" PÅ för QuizVibe-users.
    parentControlEnabled: prefs.parentControlEnabled ?? metaParentControl(user.userMetadata),
    includeThemeQuestions: cached?.includeThemeQuestions,
    hcp: cached?.hcp,
    hcpByCategory: cached?.hcpByCategory,
    voice: prefs.voice,
  };
  const { data: refreshed, changed } = refreshFreeCreditsIfNeeded(profile);
  try {
    await writeUserCache(user.id, refreshed);
    if (legacy) await scopedStorage.removeItem(userKey(user.id, LEGACY_PREFS_STORE));
  } catch (err) {
    console.warn('[profileStorage] Failed to cache profile after Supabase fetch:', err);
  }
  if (changed) {
    saveProfile(refreshed).catch(() => { /* loggas redan i saveProfile */ });
  }
  return { ...refreshed, ownerUserId: user.id };
}

/**
 * Backfill när session finns men profiles-raden saknas (pre-Fas-2-konton
 * eller en misslyckad insert). Kontots egen signup-metadata vinner; en lokal
 * cache används bara om den bevisligen tillhör samma konto.
 */
async function backfillProfileFromSession(user: SessionUser): Promise<ProfileData | null> {
  const owned = await readUserCache(user);
  const legacy = owned ? null : await readLegacyPrefs(user.id);
  const prefs: LegacyPrefs = owned ?? legacy ?? {};
  const identity = pickBackfillIdentity(user.userMetadata, owned, user);

  const profile: ProfileData = {
    playerName: identity.playerName,
    email: user.email ?? undefined,
    birthYear: identity.birthYear,
    assistance: identity.assistance,
    region: identity.region,
    avatarSource: owned?.avatarSource ?? 'default',
    selectedAvatarId: owned?.selectedAvatarId ?? '',
    gameCredits: owned?.gameCredits,
    freeGameCredits: owned?.freeGameCredits,
    lastFreeCreditsRefreshDate: owned?.lastFreeCreditsRefreshDate,
    answerResponseSeconds: owned?.answerResponseSeconds,
    gameEraFrom: owned?.gameEraFrom,
    gameEraTo: owned?.gameEraTo,
    maxPlayers: owned?.maxPlayers,
    gameMode: owned?.gameMode,
    singlePlayerDefault: owned?.singlePlayerDefault,
    roundsDefault: owned?.roundsDefault,
    enabledHostPackages: owned?.enabledHostPackages,
    youtubeEnabledCategories: owned?.youtubeEnabledCategories,
    imagesEnabledCategories: owned?.imagesEnabledCategories,
    spotifyDefaultEnabled: prefs.spotifyDefaultEnabled,
    spotifyAnswerYear: prefs.spotifyAnswerYear,
    spotifyAnswerName: prefs.spotifyAnswerName,
    spotifyAppConfirmed: prefs.spotifyAppConfirmed,
    parentControlEnabled: prefs.parentControlEnabled ?? metaParentControl(user.userMetadata),
    includeThemeQuestions: owned?.includeThemeQuestions,
    hcp: owned?.hcp,
    hcpByCategory: owned?.hcpByCategory,
    voice: prefs.voice,
  };

  // RLS-policyn kräver att id matchar auth.uid().
  const row = profileToRow(user.id, user.email ?? '', profile);
  const { error } = await supabase.from('profiles').upsert(row);
  if (error) {
    console.warn('[profileStorage] Failed to backfill profile to Supabase:', error.message);
  }

  try {
    const stamped = await writeUserCache(user.id, profile);
    if (legacy) await scopedStorage.removeItem(userKey(user.id, LEGACY_PREFS_STORE));
    return stamped;
  } catch {
    return { ...profile, ownerUserId: user.id };
  }
}

/**
 * Nollställer den inloggade profil-spegeln (logout). Kontots lokala data
 * ligger kvar under sitt eget uid och syns inte för något annat konto;
 * Delete Account raderar den via clearUserScope (auth.ts).
 */
export async function clearProfile(): Promise<void> {
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
