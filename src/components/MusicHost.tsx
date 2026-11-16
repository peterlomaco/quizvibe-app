// Background music host — mounted ONCE in app/_layout.tsx (never unmounts).
//
// The visible route (usePathname) is the single authority:
//   Home zone (6 routes)  → 'home'  — one continuous zone, no restart (G1)
//   /lobby                → the Lobby's published state
//   /quiz                 → the Quiz's published state
//   anything else         → silence
// Screens mounted underneath can publish, but their entry is only read when
// their route is visible again — they can never take audio back.
//
// ⚠ Apple 2.5.4 (fix b6d08cc): never enable background playback here.
'use no memo';

import { usePathname } from 'expo-router';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ROUTE_HOLD_MS } from '@/src/audio/musicConfig';
import {
  getMusicVersion,
  getRouteMusic,
  subscribeMusic,
  type MusicRouteKey,
} from '@/src/audio/musicController';
import { setDesired, type DesiredMusic } from '@/src/audio/musicEngine';

const HOME_ZONE = new Set(['/', '/profile', '/store', '/faq', '/my-matches', '/competitions']);
/** Home-zone routes where the Home loop skips its start delay. */
const HOME_ZONE_START_NOW = new Set(['/profile', '/store']);

function routeKeyFor(pathname: string): MusicRouteKey | null {
  if (pathname === '/lobby') return 'lobby';
  if (pathname === '/quiz') return 'quiz';
  return null;
}

const SILENCE: DesiredMusic = { track: null, audible: false };

export function MusicHost() {
  const pathname = usePathname();
  // Re-render whenever any route publishes.
  useSyncExternalStore(subscribeMusic, getMusicVersion, getMusicVersion);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeKey = routeKeyFor(pathname);
  const entry = routeKey ? getRouteMusic(routeKey) : null;
  const inHomeZone = HOME_ZONE.has(pathname);

  useEffect(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (inHomeZone) {
      // Profile / Store: the Home loop starts right away with its normal
      // fade-in (TRACK_FADE_IN_MS.home) instead of waiting out the 10 s
      // Home delay — also cutting a pending delay short (2026-11-16).
      setDesired(
        HOME_ZONE_START_NOW.has(pathname)
          ? { track: 'home', audible: true, fadeInDelayMs: 0 }
          : { track: 'home', audible: true },
      );
      return;
    }
    if (routeKey && entry) {
      setDesired(entry);
      return;
    }
    if (routeKey) {
      // Visible route hasn't published yet (e.g. /quiz right after Lobby's
      // Start Game). Keep whatever plays for up to ROUTE_HOLD_MS — never
      // start anything — then fall silent if it still hasn't published.
      holdTimer.current = setTimeout(() => {
        holdTimer.current = null;
        setDesired(SILENCE);
      }, ROUTE_HOLD_MS);
      return;
    }
    setDesired(SILENCE);
  }, [
    pathname,
    inHomeZone,
    routeKey,
    entry?.track,
    entry?.audible,
    entry?.fadeInDelayMs,
    entry?.fastFadeOut,
    entry,
  ]);

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  return null;
}
