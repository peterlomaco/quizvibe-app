// Pure rules for the forced-update gate (Build 41, 2026-11-26).
// No React Native / Supabase imports, so vitest can load it directly.
// Runtime layer: minSupportedBuild.ts.

/**
 * app_config.min_supported_build.value → minimum iOS build number, or null
 * when no requirement is set (missing row, missing/invalid `ios`, ≤ 0).
 */
export function parseMinBuildConfig(value: unknown): number | null {
  if (!value || typeof value !== 'object') return null;
  const ios = (value as { ios?: unknown }).ios;
  const n = typeof ios === 'string' ? Number(ios) : ios;
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

/** Optional user-facing message from the config. */
export function parseMinBuildMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const m = (value as { message?: unknown }).message;
  return typeof m === 'string' && m.trim() ? m.trim() : null;
}

/**
 * The binary's CFBundleVersion as an integer. Expo Go / dev clients / odd
 * values → null (the gate never blocks a build it cannot identify).
 */
export function parseNativeBuild(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** Fail open: an unknown build or no requirement is always supported. */
export function isBuildSupported(nativeBuild: number | null, minBuild: number | null): boolean {
  if (nativeBuild === null || minBuild === null) return true;
  return nativeBuild >= minBuild;
}

export type MinBuildFetchResult =
  | { kind: 'error' } // network/DB failure → keep the last confirmed value
  | { kind: 'ok'; value: unknown | null }; // value null = no row

/**
 * Next confirmed minimum after a fetch. A failed fetch keeps the previous
 * value; a successful fetch without a valid requirement clears it.
 */
export function nextConfirmedMin(previous: number | null, result: MinBuildFetchResult): number | null {
  if (result.kind === 'error') return previous;
  return parseMinBuildConfig(result.value);
}
