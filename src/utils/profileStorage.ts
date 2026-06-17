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
export type GameMode = 'pass-the-phone' | 'individual-devices';

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
  // Antal extra Host Game-credits användaren har kvar av sina KÖPTA paket
  // (5/10/20-tiers från Store). Bumpas vid purchase, dras vid Create Game när
  // freeGameCredits är slut. Optional för bakåtkompatibilitet.
  gameCredits?: number;
  // Antal Host Game-credits användaren har kvar av de GRATIS som följer med
  // Basic-planen / kampanj-bonus. Konsumeras före gameCredits vid Create Game.
  // Optional för bakåtkompatibilitet — defaultas till FREE_CREDITS_DAILY_CAP
  // i UI och fylls på automatiskt till samma cap vid första profil-load efter
  // midnatt CET (se refreshFreeCreditsIfNeeded).
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
  // 12 = kräver Premium-paket. Optional för bakåtkompatibilitet —
  // defaultas till 4 i UI.
  maxPlayers?: 4 | 12;
  // Default game mode (host-default). 'pass-the-phone' = en delad enhet
  // (gratis), 'individual-devices' = parallellt spel (kräver Premium).
  // Optional för bakåtkompatibilitet — defaultas till 'pass-the-phone' i UI.
  gameMode?: GameMode;
  // Om checkad låser host-default till Individual Devices och Pass-the-Phone
  // visas dämpad/grå i Profile:s Game Mode-toggle. Optional för
  // bakåtkompatibilitet — defaultas till false i UI.
  singlePlayerDefault?: boolean;
  // Default antal rundor per spel (host-default). Stegrar i 2 (jämn lap-tal),
  // capas av gameMode i Lobby (Pass-the-Phone max 4, Individual Devices max
  // 20). Optional för bakåtkompatibilitet — defaultas till ROUNDS_DEFAULT i UI.
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
}

// Dual-read mapping för profiler skapade innan rename
// (skill: 'easy' | 'intermediate' | 'expert' → assistance: 'full' | 'standard' | 'minimal').
// Mer hjälp = full assistance; mindre hjälp = minimal assistance.
const LEGACY_SKILL_TO_ASSISTANCE: Record<string, AssistanceLevel> = {
  easy: 'full',
  intermediate: 'standard',
  expert: 'minimal',
};

// Daily-cap för fria Host Games. Top-up till MAX 2 vid midnatt CET via
// refreshFreeCreditsIfNeeded (anropas i loadProfile). Topp-up:en är aldrig
// destruktiv — om saldot redan är ≥ 2 (t.ex. efter en kampanj-bonus) lämnas
// det orört. Konsumeras före gameCredits vid Create Game.
export const FREE_CREDITS_DAILY_CAP = 2;

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
  max_players: 4 | 12;
  game_mode: GameMode;
  single_player_default: boolean;
  enabled_host_packages: string[];
  enabled_main_categories: string[];
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
    youtubeEnabledCategories: ((row as any).youtube_enabled_categories as string[] | undefined)?.filter(isMainCategory) as MainCategory[] | undefined,
    imagesEnabledCategories: ((row as any).images_enabled_categories as string[] | undefined)?.filter(isMainCategory) as MainCategory[] | undefined,
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
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
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
    // Fält som enbart lever i AsyncStorage mergas in (spotifyDefaultEnabled saknar DB-kolumn).
    // youtubeEnabledCategories / imagesEnabledCategories: skrivs nu till DB (migration 0014
    // applicerad) — men merge-logiken nedan bevaras som belt-and-suspenders-fallback.
    // spotifyDefaultEnabled: ingen DB-kolumn ännu — alltid från cache.
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
        youtubeEnabledCategories:
          supabaseYT && supabaseYT.length > 0
            ? supabaseYT
            : cached?.youtubeEnabledCategories,
        imagesEnabledCategories:
          supabaseImg && supabaseImg.length > 0
            ? supabaseImg
            : cached?.imagesEnabledCategories,
        spotifyDefaultEnabled: cached?.spotifyDefaultEnabled,
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
}

/**
 * Slår upp email för ett givet playerName via Supabase RPC. Används av
 * login-flödet när user skriver in PlayerName istället för email — vi
 * översätter det till email på serversidan och kallar sedan
 * signInWithPassword som vanligt.
 *
 * Returnerar null om playerName inte finns. RPC:n är `security definer`
 * så anonyma klienter får kalla den utan att kunna SELECT:a profiles-
 * tabellen direkt (vilket skulle leaka data).
 */
export async function lookupEmailByPlayerName(playerName: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('lookup_email_by_player_name', {
    p_name: playerName,
  });
  if (error) {
    console.warn('[profileStorage] lookup_email_by_player_name failed:', error.message);
    return null;
  }
  return typeof data === 'string' ? data : null;
}
