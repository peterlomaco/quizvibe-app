// Supabase Realtime broadcast-channel för per-room sync-events i Individual
// Devices-läget. Transient events (lever bara så länge channel:n är öppen) —
// inga DB-tabeller eller migrations behövs.
//
// MVP-omfattning (denna fil): bara play_command + question_advance. Räcker
// för att host:s Play- och Next-tap ska transitionera alla approved spelares
// /quiz-skärm samtidigt. Full D-ii-spec (player_media_ready,
// network_heartbeat, start_at-timestamp, readiness-handshake) layer:as in
// senare; denna fil utökas då med fler event-typer.
//
// Skiljs medvetet från postgres_changes-baserade Realtime-subscriptions
// (rooms/lobby_players/lobby_settings) som driver persistent state. Broadcast
// är for event-bus mellan klienter där state inte ska skrivas till DB.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/src/utils/supabase';

export interface PlayCommandPayload {
  /** 0-baserat. Klienten validerar att den match:ar lokal current question. */
  question_index: number;
}

export interface QuestionAdvancePayload {
  /** null = sista frågan, gå till leaderboard. Annars next question index (0-baserat). */
  next_question_index: number | null;
}

export interface PlayerLeftPayload {
  /** Lobby_players.player_id för den som lämnar. Mottagare markerar
   *  spelaren som `hasLeft` i lokal state. */
  player_id: string;
  /** Visningsnamn för host:s popup. */
  player_name: string;
}

export interface PlayerAnswerConfirmedPayload {
  /** Lobby_players.player_id för den som confirmade. */
  player_id: string;
  /** Sekunder från fråge-start till confirm (0..responseSeconds, 2-decimaler). */
  time_used: number;
}

export interface ResponseSecondsChangedPayload {
  /** Host:s nya val. Speglar Lobby:s val-set (15/30/45/60). */
  seconds: 15 | 30 | 45 | 60;
}

export interface SyncChannelHandlers {
  onPlayCommand?: (payload: PlayCommandPayload) => void;
  onQuestionAdvance?: (payload: QuestionAdvancePayload) => void;
  onPlayerLeft?: (payload: PlayerLeftPayload) => void;
  onPlayerAnswerConfirmed?: (payload: PlayerAnswerConfirmedPayload) => void;
  onResponseSecondsChanged?: (payload: ResponseSecondsChangedPayload) => void;
}

export interface SyncChannel {
  channel: RealtimeChannel;
  broadcastPlayCommand: (payload: PlayCommandPayload) => Promise<void>;
  broadcastQuestionAdvance: (payload: QuestionAdvancePayload) => Promise<void>;
  broadcastPlayerLeft: (payload: PlayerLeftPayload) => Promise<void>;
  broadcastPlayerAnswerConfirmed: (
    payload: PlayerAnswerConfirmedPayload,
  ) => Promise<void>;
  broadcastResponseSecondsChanged: (
    payload: ResponseSecondsChangedPayload,
  ) => Promise<void>;
  unsubscribe: () => void;
}

/**
 * Subscribe till `quiz_sync:<roomCode>`-channel. Bägge host och non-host
 * kan subscribe:a — `broadcast.self: false` är default i Supabase Realtime
 * så sender:n inte ekoar tillbaka egna events.
 *
 * Defensive cleanup av stale channels med samma topic körs INNAN subscribe
 * så React-remount inte lämnar duplicate listeners.
 */
export function subscribeSyncChannel(
  roomCode: string,
  handlers: SyncChannelHandlers = {},
): SyncChannel {
  const topic = `quiz_sync:${roomCode}`;
  supabase
    .getChannels()
    .filter((c) => c.topic === `realtime:${topic}`)
    .forEach((c) => supabase.removeChannel(c));

  const channel = supabase.channel(topic);
  if (handlers.onPlayCommand) {
    channel.on('broadcast', { event: 'play_command' }, ({ payload }) => {
      handlers.onPlayCommand!(payload as PlayCommandPayload);
    });
  }
  if (handlers.onQuestionAdvance) {
    channel.on('broadcast', { event: 'question_advance' }, ({ payload }) => {
      handlers.onQuestionAdvance!(payload as QuestionAdvancePayload);
    });
  }
  if (handlers.onPlayerLeft) {
    channel.on('broadcast', { event: 'player_left' }, ({ payload }) => {
      handlers.onPlayerLeft!(payload as PlayerLeftPayload);
    });
  }
  if (handlers.onPlayerAnswerConfirmed) {
    channel.on('broadcast', { event: 'player_answer_confirmed' }, ({ payload }) => {
      handlers.onPlayerAnswerConfirmed!(payload as PlayerAnswerConfirmedPayload);
    });
  }
  if (handlers.onResponseSecondsChanged) {
    channel.on('broadcast', { event: 'response_seconds_changed' }, ({ payload }) => {
      handlers.onResponseSecondsChanged!(payload as ResponseSecondsChangedPayload);
    });
  }
  channel.subscribe();

  return {
    channel,
    broadcastPlayCommand: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'play_command', payload });
    },
    broadcastQuestionAdvance: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'question_advance', payload });
    },
    broadcastPlayerLeft: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_left', payload });
    },
    broadcastPlayerAnswerConfirmed: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'player_answer_confirmed',
        payload,
      });
    },
    broadcastResponseSecondsChanged: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'response_seconds_changed',
        payload,
      });
    },
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
