// D-vii: per-peer connection-health-tracker för Lobby. Driver
// 3-nivå-indikator (🟢 ok / 🟡 slow / 🔴 unstable) på spelarkorten så host
// ser i förväg vilka spelare har bristfällig uppkoppling INNAN Start
// Game tappas. Skiljs medvetet från syncChannel (quiz_sync-topic) som
// kör sin egen heartbeat-stack och tas ner när Lobby unmount:as.
//
// Topic: `lobby_health:<roomCode>`. Varje device som mounter Lobby
// subscribe:ar + broadcastar egen heartbeat var 5s. Mottagare track:ar
// per-sender lastSeenAt-ref. En 1-sek-tick beräknar 3-nivå-tier:
//
//   gap < 7s  → 'ok'      (≈ 1-2 heartbeat-cykler — normalt)
//   gap < 12s → 'slow'    (en heartbeat missad — degraderat)
//   else      → 'unstable' (2+ missade — paj uppkoppling)
//
// Tröskeln 7/12 valdes utifrån 5s broadcast-interval × hysteresis-
// marginal. För korta värden gör att tier:n flickrar vid jitter; för
// långa gör det svårt att se faktisk degradation. Justera vid behov.
//
// Hook:en returnerar bara remote peers — self är aldrig en key
// (heartbeat-handler:n filtrerar bort own sender_id). Self:s indikator
// visas i Lobby som hardcoded 🟢 eftersom vi rendererar = vi är alive.

import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/src/utils/supabase';

export type PeerHealth = 'ok' | 'slow' | 'unstable';

/** Broadcast-frekvens. Var 5s pingar varje device sin lobby_heartbeat. */
const HEARTBEAT_INTERVAL_MS = 5_000;
/** Health-compute-tick. Varje sekund beräknas tier per sender. */
const HEALTH_TICK_MS = 1_000;
/** Tröskel ok→slow. < 1.5 heartbeat-cykler bort. */
const SLOW_THRESHOLD_MS = 7_000;
/** Tröskel slow→unstable. ≥ 2.5 heartbeat-cykler bort. */
const UNSTABLE_THRESHOLD_MS = 12_000;

interface HeartbeatPayload {
  sender_id: string;
}

/**
 * Hook som returnerar live-mappad peer-health per spelar-id. Heartbeats
 * skickas + tas emot så länge `enabled` är true OCH `roomCode`/`selfPlayerId`
 * är icke-tomma. Self exkluderas alltid från returnerade map:en.
 *
 * Anropas i Lobby gated på `gameMode === 'individual-devices'` eftersom
 * Pass-the-Phone-spel delar device → ingen peer-health-koncept där.
 */
export function useLobbyPeerHealth(
  roomCode: string,
  selfPlayerId: string,
  enabled: boolean,
): Record<string, PeerHealth> {
  const [health, setHealth] = useState<Record<string, PeerHealth>>({});
  const lastSeenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled || !roomCode || !selfPlayerId) {
      setHealth({});
      lastSeenRef.current.clear();
      return;
    }

    const topic = `lobby_health:${roomCode}`;
    // Defensive cleanup av stale channels — undviker att React-remount
    // lämnar duplicate listeners eftersom topic är room-bundet.
    supabase
      .getChannels()
      .filter((c) => c.topic === `realtime:${topic}`)
      .forEach((c) => supabase.removeChannel(c));

    const channel: RealtimeChannel = supabase.channel(topic);

    channel.on('broadcast', { event: 'lobby_heartbeat' }, ({ payload }) => {
      const p = payload as HeartbeatPayload | undefined;
      if (!p?.sender_id || p.sender_id === selfPlayerId) return;
      lastSeenRef.current.set(p.sender_id, Date.now());
    });

    channel.subscribe();

    const heartbeatInterval = setInterval(() => {
      channel
        .send({
          type: 'broadcast',
          event: 'lobby_heartbeat',
          payload: { sender_id: selfPlayerId } satisfies HeartbeatPayload,
        })
        .catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    // Bevarar fokuserad re-render: bara om nya tier-värden differs från
    // föregående state uppdateras setHealth (annars triggas React-re-
    // render var 1s i onödan).
    const healthInterval = setInterval(() => {
      const now = Date.now();
      const next: Record<string, PeerHealth> = {};
      lastSeenRef.current.forEach((seenAt, senderId) => {
        const gap = now - seenAt;
        if (gap < SLOW_THRESHOLD_MS) {
          next[senderId] = 'ok';
        } else if (gap < UNSTABLE_THRESHOLD_MS) {
          next[senderId] = 'slow';
        } else {
          next[senderId] = 'unstable';
        }
      });
      setHealth((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (
          prevKeys.length === nextKeys.length &&
          prevKeys.every((k) => prev[k] === next[k])
        ) {
          return prev;
        }
        return next;
      });
    }, HEALTH_TICK_MS);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(healthInterval);
      supabase.removeChannel(channel);
      lastSeenRef.current.clear();
    };
  }, [roomCode, selfPlayerId, enabled]);

  return health;
}
