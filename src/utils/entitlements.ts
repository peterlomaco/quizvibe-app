// Multiplayer v2 — feature gates + entitlements (pure, no I/O).
//
// The runtime layer that fetches/caches the gates lives in featureGates.ts;
// this module only parses and evaluates them so the rules can be unit-tested
// (backend/content/test/multiplayerV2.test.ts).
//
// Remote config: app_config row `feature_gates` (migration 0062), same
// key/jsonb table and read path as `free_premium_promo` (0035).
//
//   multiplayerV2 : rollout gate for the 1 by 1 / All at Once model. false in
//                   PROD until the hybrid 1 by 1 flow is complete and tested.
//   allAtOnce     : who may play All at Once. 'everyone' at launch (Guest
//                   Hosts included); flipping to 'premium' later is a SQL
//                   change only — no engine, mode or sync change.

export type FeatureGateAudience = 'everyone' | 'premium';

export interface FeatureGates {
  multiplayerV2: boolean;
  allAtOnce: FeatureGateAudience;
}

/**
 * Used when the row has never been read (or is malformed). multiplayerV2
 * fails CLOSED (old behaviour), allAtOnce fails OPEN (launch decision:
 * available to everyone).
 */
export const DEFAULT_FEATURE_GATES: Readonly<FeatureGates> = Object.freeze({
  multiplayerV2: false,
  allAtOnce: 'everyone',
});

function isAudience(v: unknown): v is FeatureGateAudience {
  return v === 'everyone' || v === 'premium';
}

/** Tolerant per-field parse: an invalid field falls back to its default. */
export function parseFeatureGates(raw: unknown): FeatureGates {
  const out: FeatureGates = { ...DEFAULT_FEATURE_GATES };
  if (!raw || typeof raw !== 'object') return out;
  const v = raw as { multiplayerV2?: unknown; allAtOnce?: unknown };
  if (typeof v.multiplayerV2 === 'boolean') out.multiplayerV2 = v.multiplayerV2;
  if (isAudience(v.allAtOnce)) out.allAtOnce = v.allAtOnce;
  return out;
}

export type EntitledFeature = 'allAtOnce';

export interface EntitlementContext {
  /** The HOST's premium status — the host's entitlement decides the lobby. */
  isPremium: boolean;
  /** Guest Hosts are never premium, whatever the device's account says. */
  isGuestHost: boolean;
}

/**
 * Whether the host may use a feature. Evaluated live in the lobby and
 * SNAPSHOT at Start Game — a game in progress never re-checks it, so an
 * expiring subscription or a flipped flag only affects the next Start.
 */
export function canUse(
  feature: EntitledFeature,
  ctx: EntitlementContext,
  gates: FeatureGates = DEFAULT_FEATURE_GATES,
): boolean {
  switch (feature) {
    case 'allAtOnce': {
      if (gates.allAtOnce === 'everyone') return true;
      return ctx.isPremium && !ctx.isGuestHost;
    }
    default:
      return false;
  }
}
