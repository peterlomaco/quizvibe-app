// Forced-update gate (Build 41, 2026-11-26).
//
// app_config.min_supported_build = { "ios": <int>, "message"?: string }.
// When this binary's build number (CFBundleVersion via expo-constants) is
// below the minimum, the app shows UpdateRequiredScreen and nothing else.
//
// Rules (Peter 2026-11-26):
// - Checked at app start and whenever the app returns to the foreground.
// - The cache is ENVIRONMENT-scoped (envKey → project ref), so a STAGING
//   requirement can never affect PROD.
// - A failed fetch keeps the last confirmed requirement; a successful fetch
//   without a requirement clears it.
// - Fail open: no row, Expo Go, unknown build → never blocks.
// - DEV only: globalThis.__qvSetNativeBuildOverride(n | null) fakes the
//   native build number to test both sides.

import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
import {
  isBuildSupported,
  nextConfirmedMin,
  parseMinBuildConfig,
  parseMinBuildMessage,
  parseNativeBuild,
  type MinBuildFetchResult,
} from './minSupportedBuildCore';
import { envKey, scopedStorage } from './storageScope';
import { supabase } from './supabase';

const CONFIG_KEY = 'min_supported_build';
const CACHE_KEY = envKey('minSupportedBuild');
const FOREGROUND_THROTTLE_MS = 60_000;

let confirmedMin: number | null = null;
let message: string | null = null;
let refreshedFromServer = false;
let devNativeOverride: number | null | undefined; // undefined = no override
let lastCheckAt = 0;
let watcherStarted = false;

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot = false;

function nativeBuild(): number | null {
  if (__DEV__ && devNativeOverride !== undefined) return devNativeOverride;
  if (Platform.OS !== 'ios') return null;
  return parseNativeBuild(Constants.platform?.ios?.buildNumber ?? null);
}

function publish(): void {
  const next = !isBuildSupported(nativeBuild(), confirmedMin);
  if (next === snapshot) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

/** Synchronous: should the app be blocked right now? */
export function isUpdateRequired(): boolean {
  return snapshot;
}

export function getUpdateRequiredMessage(): string | null {
  return message;
}

export function subscribeUpdateRequired(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function warmFromCache(): Promise<void> {
  try {
    const raw = await scopedStorage.getItem(CACHE_KEY);
    if (!raw || refreshedFromServer) return;
    const parsed = JSON.parse(raw);
    confirmedMin = parseMinBuildConfig(parsed);
    message = parseMinBuildMessage(parsed);
    publish();
  } catch (err) {
    console.warn('[minSupportedBuild] warm failed:', err);
  }
}
void warmFromCache();

/** Fetches the requirement. Never throws. */
export async function refreshMinSupportedBuild(): Promise<void> {
  lastCheckAt = Date.now();
  let result: MinBuildFetchResult;
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .maybeSingle();
    result = error ? { kind: 'error' } : { kind: 'ok', value: data?.value ?? null };
    if (error) console.warn('[minSupportedBuild] refresh failed:', error.message);
  } catch (err) {
    console.warn('[minSupportedBuild] refresh failed:', err);
    result = { kind: 'error' };
  }
  if (result.kind === 'error') return; // keep the last confirmed value

  refreshedFromServer = true;
  confirmedMin = nextConfirmedMin(confirmedMin, result);
  message = confirmedMin === null ? null : parseMinBuildMessage(result.value);
  try {
    if (confirmedMin === null) await scopedStorage.removeItem(CACHE_KEY);
    else await scopedStorage.setItem(CACHE_KEY, JSON.stringify(result.value));
  } catch (err) {
    console.warn('[minSupportedBuild] cache write failed:', err);
  }
  publish();
}

/** Start once from the root layout: check now + on every foreground. */
export function startMinSupportedBuildWatcher(): () => void {
  if (watcherStarted) return () => {};
  watcherStarted = true;
  void refreshMinSupportedBuild();
  const sub = AppState.addEventListener('change', (state) => {
    if (state !== 'active') return;
    if (Date.now() - lastCheckAt < FOREGROUND_THROTTLE_MS && !snapshot) return;
    void refreshMinSupportedBuild();
  });
  return () => {
    sub.remove();
    watcherStarted = false;
  };
}

if (__DEV__) {
  (globalThis as Record<string, unknown>).__qvSetNativeBuildOverride = (n: number | null | undefined) => {
    devNativeOverride = n;
    console.log('[minSupportedBuild] DEV native build override:', n, '→ blocked:', !isBuildSupported(nativeBuild(), confirmedMin));
    publish();
  };
  (globalThis as Record<string, unknown>).__qvSetMinBuildOverride = (n: number | null) => {
    confirmedMin = n;
    console.log('[minSupportedBuild] DEV min build override:', n);
    publish();
  };
}
