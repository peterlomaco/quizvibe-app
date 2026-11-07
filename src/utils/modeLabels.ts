// Gate-aware mode labels for screens outside a lobby (Home, Store, FAQ,
// Profile, quiz). Reads the cached Multiplayer v2 gate synchronously; the
// lobby passes its room's own flag to modeLabels() instead.
import { getCachedFeatureGates } from './featureGates';
import { modeLabels, type ModeLabels } from './gameFlow';

export function currentModeLabels(): ModeLabels {
  return modeLabels(getCachedFeatureGates().multiplayerV2);
}

export function isMultiplayerV2Copy(): boolean {
  return getCachedFeatureGates().multiplayerV2;
}
