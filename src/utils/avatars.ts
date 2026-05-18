/**
 * Delad lista av avatar-emojis. Används av både ProfileScreen
 * (där användaren väljer) och LobbyScreen (där hostens kort
 * visar samma emoji som valts i profilen).
 */

export type AvatarCategory = 'Basic' | 'Retro' | 'Music' | 'Tech' | 'Fun';

export interface AvatarItem {
  id: string;
  emoji: string;
  category: AvatarCategory;
}

export const AVATARS: AvatarItem[] = [
  // Anonym-silhouette flyttad hit från "Default Image"-source-raden (2026-05-18).
  // Egen 'Basic'-kategori så raden hamnar först + är lätt att hitta för
  // användare som vill ha den neutrala silhouetten utan att gå via Default Image.
  { id: '17', emoji: '😶', category: 'Basic' },
  { id: '1',  emoji: '🎮', category: 'Retro' },
  { id: '2',  emoji: '👾', category: 'Retro' },
  { id: '3',  emoji: '🕹️', category: 'Retro' },
  { id: '4',  emoji: '📺', category: 'Retro' },
  { id: '5',  emoji: '🎸', category: 'Music' },
  { id: '6',  emoji: '🎤', category: 'Music' },
  { id: '7',  emoji: '🎹', category: 'Music' },
  { id: '8',  emoji: '🥁', category: 'Music' },
  { id: '9',  emoji: '💻', category: 'Tech'  },
  { id: '10', emoji: '🤖', category: 'Tech'  },
  { id: '11', emoji: '📱', category: 'Tech'  },
  { id: '12', emoji: '🛸', category: 'Tech'  },
  { id: '13', emoji: '🦊', category: 'Fun'   },
  { id: '14', emoji: '🐉', category: 'Fun'   },
  { id: '15', emoji: '🦄', category: 'Fun'   },
  { id: '16', emoji: '🐙', category: 'Fun'   },
];

export const DEFAULT_AVATAR_EMOJI = '👤';

export function getAvatarEmojiById(id: string | null | undefined): string {
  if (!id) return DEFAULT_AVATAR_EMOJI;
  return AVATARS.find((a) => a.id === id)?.emoji ?? DEFAULT_AVATAR_EMOJI;
}
