// Runtime layer for app_config.feature_gates (migration 0062).
//
// Same pattern as promoPremium.ts' offer config: one best-effort network read
// at app start, cached in AsyncStorage, plus a synchronous mirror so callers
// (registerActiveRoom, later the lobby) can read the gates without awaiting.
// Never-read / unreachable → DEFAULT_FEATURE_GATES (multiplayerV2 off).

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_FEATURE_GATES,
  parseFeatureGates,
  type FeatureGates,
} from './entitlements';
import { supabase } from './supabase';

const CONFIG_KEY = 'feature_gates';
const CACHE_KEY = '@quizvibe/featureGates/v1';

let mirror: FeatureGates = { ...DEFAULT_FEATURE_GATES };
// Set once a network refresh has landed, so a slower cache warm can never
// overwrite fresher server values with the stale cached ones.
let refreshedFromServer = false;

/** Synchronous read of the last known gates. Defaults until warmed. */
export function getCachedFeatureGates(): FeatureGates {
  return mirror;
}

/** Warms the mirror from AsyncStorage (module load). */
async function warmFromCache(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw && !refreshedFromServer) mirror = parseFeatureGates(JSON.parse(raw));
  } catch (err) {
    console.warn('[featureGates] warm failed:', err);
  }
}
void warmFromCache();

/**
 * Fetches the gates from Supabase and caches them. Best-effort: on network
 * error / missing row the previous cache (or defaults) stays in place.
 */
export async function refreshFeatureGates(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .maybeSingle();
    if (error) {
      console.warn('[featureGates] refresh failed:', error.message);
      return;
    }
    if (!data) return; // migration 0062 not applied — keep defaults
    const parsed = parseFeatureGates(data.value);
    mirror = parsed;
    refreshedFromServer = true;
    if (__DEV__) console.log('[featureGates] loaded from server:', parsed);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn('[featureGates] refresh failed:', err);
  }
}
