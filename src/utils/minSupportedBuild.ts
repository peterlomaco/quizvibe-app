// Forced-update gate — Build 40 OTA variant (2026-11-26).
//
// Same rules as Build 41's src/utils/minSupportedBuild.ts, adapted to the
// Build 40 code base (no storageScope / featureGates):
//   app_config.min_supported_build = { "ios": <int>, "message"?: string }
//   native build (CFBundleVersion via expo-constants) < min → "Update required".
// - Checked at app start and on every return to the foreground.
// - Cache is ENVIRONMENT-scoped: the key carries the Supabase project host,
//   so a STAGING value can never apply to PROD.
// - A failed fetch keeps the last confirmed requirement; a successful fetch
//   without one clears it. Fail open otherwise (no row, Expo Go, odd build).
// - DEV only: globalThis.__qvSetNativeBuildOverride(n | null | undefined).

import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { supabase } from './supabase';

const CONFIG_KEY = 'min_supported_build';
const ENV_TAG = (() => {
  try {
    return new URL(process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').host || 'unknown';
  } catch {
    return 'unknown';
  }
})();
const CACHE_KEY = `@quizvibe/minSupportedBuild/v1/${ENV_TAG}`;
const FOREGROUND_THROTTLE_MS = 60_000;

let confirmedMin: number | null = null;
let message: string | null = null;
let refreshedFromServer = false;
let devNativeOverride: number | null | undefined;
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
    const raw = await AsyncStorage.getItem(CACHE_KEY);
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
  if (result.kind === 'error') return;

  refreshedFromServer = true;
  confirmedMin = nextConfirmedMin(confirmedMin, result);
  message = confirmedMin === null ? null : parseMinBuildMessage(result.value);
  try {
    if (confirmedMin === null) await AsyncStorage.removeItem(CACHE_KEY);
    else await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result.value));
  } catch (err) {
    console.warn('[minSupportedBuild] cache write failed:', err);
  }
  publish();
}

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
    publish();
  };
  (globalThis as Record<string, unknown>).__qvSetMinBuildOverride = (n: number | null) => {
    confirmedMin = n;
    publish();
  };
}
