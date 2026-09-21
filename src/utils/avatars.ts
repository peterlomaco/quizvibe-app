/**
 * Delad lista av avatar-emojis. Används av både ProfileScreen
 * (där användaren väljer) och LobbyScreen (där hostens kort
 * visar samma emoji som valts i profilen).
 *
 * Avatarerna är emoji — inte bildfiler. Det håller bundle-storleken nere,
 * undviker licensiering och renderar konsekvent på iOS. "Fler avatarer"
 * = fler emoji-val, inte nedladdade bilder.
 *
 * ⚠ Id:n är stabila nycklar (sparas som `selectedAvatarId` i profilen).
 * Ändra ALDRIG ett befintligt id ↔ emoji-par — det byter avatar för alla
 * som valt den. Lägg bara till nya id:n i slutet. Ny kategori måste även
 * läggas till i ProfileScreen (`AvatarCategory`-typen + `CATEGORIES`).
 */

export type AvatarCategory =
  | 'Basic'
  | 'Retro'
  | 'Music'
  | 'Film'
  | 'Sports'
  | 'Tech'
  | 'Animals'
  | 'Food'
  | 'Nature'
  | 'Fun';

export interface AvatarItem {
  id: string;
  emoji: string;
  category: AvatarCategory;
}

export const AVATARS: AvatarItem[] = [
  // ── Retro (gaming) ──
  { id: '1',  emoji: '🎮', category: 'Retro' },
  { id: '2',  emoji: '👾', category: 'Retro' },
  { id: '3',  emoji: '🕹️', category: 'Retro' },
  { id: '4',  emoji: '📺', category: 'Retro' },

  // ── Music ──
  { id: '5',  emoji: '🎸', category: 'Music' },
  { id: '6',  emoji: '🎤', category: 'Music' },
  { id: '7',  emoji: '🎹', category: 'Music' },
  { id: '8',  emoji: '🥁', category: 'Music' },

  // ── Tech ──
  { id: '9',  emoji: '💻', category: 'Tech'  },
  { id: '10', emoji: '🤖', category: 'Tech'  },
  { id: '11', emoji: '📱', category: 'Tech'  },
  { id: '12', emoji: '🛸', category: 'Tech'  },

  // ── Fun ──
  { id: '13', emoji: '🦊', category: 'Fun'   },
  { id: '14', emoji: '🐉', category: 'Fun'   },
  { id: '15', emoji: '🦄', category: 'Fun'   },
  { id: '16', emoji: '🐙', category: 'Fun'   },

  // ─────────────────────────────────────────────────────────────
  // Tillagda 2026-09-20 — bredare urval (id 18+). Håll varje emoji unik.
  // ─────────────────────────────────────────────────────────────

  // ── Basic (uttrycksfulla ansikten) ──
  { id: '18', emoji: '🙂', category: 'Basic' },
  { id: '19', emoji: '😎', category: 'Basic' },
  { id: '20', emoji: '🤓', category: 'Basic' },
  { id: '21', emoji: '🥳', category: 'Basic' },
  { id: '22', emoji: '😇', category: 'Basic' },
  { id: '23', emoji: '🤠', category: 'Basic' },
  { id: '24', emoji: '😜', category: 'Basic' },
  { id: '25', emoji: '🤩', category: 'Basic' },
  { id: '26', emoji: '🥸', category: 'Basic' },
  { id: '27', emoji: '🫡', category: 'Basic' },
  { id: '28', emoji: '😴', category: 'Basic' },
  { id: '29', emoji: '🤯', category: 'Basic' },

  // ── Retro ──
  { id: '30', emoji: '💾', category: 'Retro' },
  { id: '31', emoji: '📟', category: 'Retro' },
  { id: '32', emoji: '☎️', category: 'Retro' },
  { id: '33', emoji: '📼', category: 'Retro' },
  { id: '34', emoji: '🎞️', category: 'Retro' },
  { id: '35', emoji: '🧩', category: 'Retro' },
  { id: '36', emoji: '🎲', category: 'Retro' },
  { id: '37', emoji: '♟️', category: 'Retro' },
  { id: '38', emoji: '📻', category: 'Retro' },

  // ── Music ──
  { id: '39', emoji: '🎧', category: 'Music' },
  { id: '40', emoji: '🎷', category: 'Music' },
  { id: '41', emoji: '🎺', category: 'Music' },
  { id: '42', emoji: '🎻', category: 'Music' },
  { id: '43', emoji: '🪕', category: 'Music' },
  { id: '44', emoji: '🎼', category: 'Music' },
  { id: '45', emoji: '🪗', category: 'Music' },
  { id: '46', emoji: '🎶', category: 'Music' },

  // ── Film ──
  { id: '47', emoji: '🎬', category: 'Film' },
  { id: '48', emoji: '🎥', category: 'Film' },
  { id: '49', emoji: '🍿', category: 'Film' },
  { id: '50', emoji: '📽️', category: 'Film' },
  { id: '51', emoji: '🎭', category: 'Film' },
  { id: '52', emoji: '📸', category: 'Film' },
  { id: '53', emoji: '🎟️', category: 'Film' },
  { id: '54', emoji: '🌟', category: 'Film' },

  // ── Sports ──
  { id: '55', emoji: '⚽', category: 'Sports' },
  { id: '56', emoji: '🏀', category: 'Sports' },
  { id: '57', emoji: '🏈', category: 'Sports' },
  { id: '58', emoji: '⚾', category: 'Sports' },
  { id: '59', emoji: '🎾', category: 'Sports' },
  { id: '60', emoji: '🏐', category: 'Sports' },
  { id: '61', emoji: '🏓', category: 'Sports' },
  { id: '62', emoji: '🏆', category: 'Sports' },
  { id: '63', emoji: '🥇', category: 'Sports' },
  { id: '64', emoji: '🥊', category: 'Sports' },
  { id: '65', emoji: '🏂', category: 'Sports' },
  { id: '66', emoji: '⛷️', category: 'Sports' },
  { id: '67', emoji: '🏄', category: 'Sports' },
  { id: '68', emoji: '🚴', category: 'Sports' },
  { id: '69', emoji: '🏋️', category: 'Sports' },
  { id: '70', emoji: '🎯', category: 'Sports' },

  // ── Tech ──
  { id: '71', emoji: '🚀', category: 'Tech' },
  { id: '72', emoji: '🛰️', category: 'Tech' },
  { id: '73', emoji: '🔋', category: 'Tech' },
  { id: '74', emoji: '💡', category: 'Tech' },
  { id: '75', emoji: '🖥️', category: 'Tech' },
  { id: '76', emoji: '⌨️', category: 'Tech' },
  { id: '77', emoji: '🧠', category: 'Tech' },
  { id: '78', emoji: '🔮', category: 'Tech' },

  // ── Animals ──
  { id: '79', emoji: '🐶', category: 'Animals' },
  { id: '80', emoji: '🐱', category: 'Animals' },
  { id: '81', emoji: '🐼', category: 'Animals' },
  { id: '82', emoji: '🐨', category: 'Animals' },
  { id: '83', emoji: '🦁', category: 'Animals' },
  { id: '84', emoji: '🐯', category: 'Animals' },
  { id: '85', emoji: '🐸', category: 'Animals' },
  { id: '86', emoji: '🐵', category: 'Animals' },
  { id: '87', emoji: '🦉', category: 'Animals' },
  { id: '88', emoji: '🦅', category: 'Animals' },
  { id: '89', emoji: '🐺', category: 'Animals' },
  { id: '90', emoji: '🦈', category: 'Animals' },
  { id: '91', emoji: '🐢', category: 'Animals' },
  { id: '92', emoji: '🦖', category: 'Animals' },
  { id: '93', emoji: '🐝', category: 'Animals' },
  { id: '94', emoji: '🦋', category: 'Animals' },
  { id: '95', emoji: '🐧', category: 'Animals' },
  { id: '96', emoji: '🦩', category: 'Animals' },

  // ── Food ──
  { id: '97',  emoji: '🍕', category: 'Food' },
  { id: '98',  emoji: '🍔', category: 'Food' },
  { id: '99',  emoji: '🌮', category: 'Food' },
  { id: '100', emoji: '🍩', category: 'Food' },
  { id: '101', emoji: '🍦', category: 'Food' },
  { id: '102', emoji: '☕', category: 'Food' },
  { id: '103', emoji: '🍫', category: 'Food' },
  { id: '104', emoji: '🍉', category: 'Food' },
  { id: '105', emoji: '🥑', category: 'Food' },
  { id: '106', emoji: '🍣', category: 'Food' },
  { id: '107', emoji: '🧁', category: 'Food' },
  { id: '108', emoji: '🍺', category: 'Food' },

  // ── Nature ──
  { id: '109', emoji: '🌸', category: 'Nature' },
  { id: '110', emoji: '🌵', category: 'Nature' },
  { id: '111', emoji: '🌊', category: 'Nature' },
  { id: '112', emoji: '🌙', category: 'Nature' },
  { id: '113', emoji: '☀️', category: 'Nature' },
  { id: '114', emoji: '⚡', category: 'Nature' },
  { id: '115', emoji: '❄️', category: 'Nature' },
  { id: '116', emoji: '🍁', category: 'Nature' },
  { id: '117', emoji: '🌴', category: 'Nature' },
  { id: '118', emoji: '🌋', category: 'Nature' },
  { id: '119', emoji: '🌻', category: 'Nature' },
  { id: '120', emoji: '🍀', category: 'Nature' },

  // ── Fun ──
  { id: '121', emoji: '🎃', category: 'Fun' },
  { id: '122', emoji: '🎈', category: 'Fun' },
  { id: '123', emoji: '🎉', category: 'Fun' },
  { id: '124', emoji: '🌈', category: 'Fun' },
  { id: '125', emoji: '⭐', category: 'Fun' },
  { id: '126', emoji: '🔥', category: 'Fun' },
  { id: '127', emoji: '💎', category: 'Fun' },
  { id: '128', emoji: '🍄', category: 'Fun' },
  { id: '129', emoji: '👻', category: 'Fun' },
  { id: '130', emoji: '👽', category: 'Fun' },
  { id: '131', emoji: '🤡', category: 'Fun' },
  { id: '132', emoji: '💀', category: 'Fun' },

  // Anonym/neutral silhouette (flyttad hit från "Default Image"-source-raden
  // 2026-05-18). Placerad SIST i listan per Peter 2026-09-21 — den munlösa
  // 😶 ska ligga efter de riktiga emoji-valen, inte först.
  { id: '17', emoji: '😶', category: 'Basic' },
];

export const DEFAULT_AVATAR_EMOJI = '👤';

export function getAvatarEmojiById(id: string | null | undefined): string {
  if (!id) return DEFAULT_AVATAR_EMOJI;
  return AVATARS.find((a) => a.id === id)?.emoji ?? DEFAULT_AVATAR_EMOJI;
}
