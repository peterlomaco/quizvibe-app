// Connection-monitor — D-iii: bad-connection-detection för Individual
// Devices-läget. Speglar specen i docs/individual-devices-spec.md § D-iii.
//
// Module-singleton som aggregerar två oberoende signaler:
//
//   1) Media-buffering — rapporterad av YT/Spotify/Image-adapters via
//      reportMediaStatus(). Inte trådad in i D-iii MVP (adapters finns inte
//      än); metoden lämnas som ready stub så framtida slice kan wire:a in
//      utan call-site-ändringar.
//
//   2) Realtime channel-health — rapporterad av syncChannel.ts via
//      reportRealtimeStatus(). Drivs av Supabase Realtime channel-state-
//      events (CHANNEL_ERROR / TIMED_OUT / CLOSED) + custom heartbeat-
//      timeout.
//
// Signalerna OR:as: endera räcker för att gå till `unstable`. Recovery
// kräver att BÅDA är OK + 2s hysteresis-fönster utan ny unstable-trigger.
//
// Singleton-livslängd: app-mount → app-unmount. Cleanas INTE vid screen-
// byte; samma instans delas över Lobby/Quiz/GetReady så monitor:n
// behåller state vid phase-transitions.

import { useEffect, useState } from 'react';

export type ConnectionStatus = 'ok' | 'unstable';

export type ConnectionReason =
  | 'media-buffering'
  | 'media-timeout'
  | 'realtime-error'
  | 'heartbeat-drop'
  | null;

export interface ConnectionMonitorState {
  status: ConnectionStatus;
  /** Vilken signal triggrade unstable-state. För telemetri/debug + framtida D-vi-eskalering. */
  reason: ConnectionReason;
  /** Date.now() när unstable först blev satt. Används av D-vi:s 15s-disconnect-eskalering. */
  unstableSince: number | null;
}

type MediaStatus = 'loading' | 'cued' | 'unstable';
type RealtimeStatus = 'ok' | 'error' | 'heartbeat-drop';

/** 2s av clean state på BÅDA signals krävs innan unstable→ok. Förhindrar flapping vid intermittent buffering. */
const HYSTERESIS_MS = 2000;

class ConnectionMonitor {
  private state: ConnectionMonitorState = {
    status: 'ok',
    reason: null,
    unstableSince: null,
  };
  // Senast rapporterade signal-state per kanal. Båda måste vara icke-unstable
  // för att monitor:n ska kunna gå tillbaka till ok.
  private lastMediaStatus: MediaStatus = 'cued';
  private lastRealtimeStatus: RealtimeStatus = 'ok';
  private listeners: Set<(s: ConnectionMonitorState) => void> = new Set();
  private clearUnstableTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Rapporteras av media-adapters (YT/Spotify/Image) när deras buffering-
   * eller load-state ändras. D-iii MVP wire:ar inte in detta — adapters
   * finns inte än — men metoden är klar för framtida slice.
   */
  reportMediaStatus(status: MediaStatus): void {
    if (this.lastMediaStatus === status) return;
    this.lastMediaStatus = status;
    if (status === 'unstable') {
      this.transitionToUnstable('media-buffering');
    } else {
      this.maybeTransitionToOk();
    }
  }

  /**
   * Rapporteras av syncChannel.ts vid channel state-events eller heartbeat-
   * timeout. `'ok'` = SUBSCRIBED + heartbeats inom 15s. `'error'` =
   * CHANNEL_ERROR/TIMED_OUT/CLOSED. `'heartbeat-drop'` = inga events på 15s
   * trots att channel claims subscribed.
   */
  reportRealtimeStatus(status: RealtimeStatus): void {
    if (this.lastRealtimeStatus === status) return;
    this.lastRealtimeStatus = status;
    if (status === 'error') {
      this.transitionToUnstable('realtime-error');
    } else if (status === 'heartbeat-drop') {
      this.transitionToUnstable('heartbeat-drop');
    } else {
      this.maybeTransitionToOk();
    }
  }

  getState(): ConnectionMonitorState {
    return this.state;
  }

  subscribe(listener: (s: ConnectionMonitorState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Hard reset — för testing och för att rensa state vid Quit/Leave Game.
   * Cancellar pågående hysteresis-timer.
   */
  reset(): void {
    if (this.clearUnstableTimer) {
      clearTimeout(this.clearUnstableTimer);
      this.clearUnstableTimer = null;
    }
    this.lastMediaStatus = 'cued';
    this.lastRealtimeStatus = 'ok';
    const wasUnstable = this.state.status === 'unstable';
    this.state = { status: 'ok', reason: null, unstableSince: null };
    if (wasUnstable) this.notify();
  }

  private transitionToUnstable(reason: NonNullable<ConnectionReason>): void {
    if (this.clearUnstableTimer) {
      clearTimeout(this.clearUnstableTimer);
      this.clearUnstableTimer = null;
    }
    if (this.state.status === 'unstable') {
      // Uppdatera bara reason om den ändrats — listeners notifieras vid byte
      // av reason eftersom telemetri/debug-vyer vill se senaste orsaken.
      if (this.state.reason !== reason) {
        this.state = { ...this.state, reason };
        this.notify();
      }
      return;
    }
    this.state = {
      status: 'unstable',
      reason,
      unstableSince: Date.now(),
    };
    this.notify();
  }

  private maybeTransitionToOk(): void {
    if (this.state.status === 'ok') return;
    // Båda signals måste vara icke-unstable för att starta hysteresis-fönstret.
    const mediaOk = this.lastMediaStatus !== 'unstable';
    const realtimeOk = this.lastRealtimeStatus === 'ok';
    if (!mediaOk || !realtimeOk) return;

    // Starta 2s-hysteresis. Om någon signal flippar till unstable igen under
    // fönstret cancellas timer:n och state stannar i unstable.
    if (this.clearUnstableTimer) clearTimeout(this.clearUnstableTimer);
    this.clearUnstableTimer = setTimeout(() => {
      this.clearUnstableTimer = null;
      // Re-validera: en signal kan ha flippat tillbaka till unstable under
      // timer:ns gång utan att maybeTransitionToOk hann snapshot:a.
      const stillOk =
        this.lastMediaStatus !== 'unstable' && this.lastRealtimeStatus === 'ok';
      if (!stillOk) return;
      this.state = { status: 'ok', reason: null, unstableSince: null };
      this.notify();
    }, HYSTERESIS_MS);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const connectionMonitor = new ConnectionMonitor();

/**
 * React-hook för komponenter som vill rendera baserat på connection-state.
 * Använd ENDAST i Individual Devices-flöden (quiz.tsx + GetReadyIntro).
 * I Pass-the-Phone returnerar monitor:n alltid `ok` eftersom inga signals
 * rapporteras in där — hooken är säker att anropa men ger ingen signal.
 */
export function useConnectionStatus(): ConnectionMonitorState {
  const [state, setState] = useState<ConnectionMonitorState>(() =>
    connectionMonitor.getState(),
  );
  useEffect(() => connectionMonitor.subscribe(setState), []);
  return state;
}
