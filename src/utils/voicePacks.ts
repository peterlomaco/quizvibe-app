/**
 * Countdown voice packs.
 *
 * Varje pack är en handfull förinspelade ljudklipp som ersätter den
 * syntetiska expo-speech-rösten i CountdownIntro (3-2-1 + "When"/"Who").
 * Spelarens röstval lagras per profil (`ProfileData.voice`, AsyncStorage-only)
 * och väljs i Profile → "Countdown voice".
 *
 * `DEFAULT_VOICE_ID` behåller den nuvarande system-TTS-rösten: ingen ljudfil,
 * alltid tillgänglig, och den fallback CountdownIntro faller tillbaka på om ett
 * pack inte kan laddas.
 *
 * Talad vokabulär i countdown är ett litet FAST set — tokens '1','2','3' (de
 * enda siffror som talas idag, `voiceFrom` default 3) + finalWord 'when'/'who'.
 * '4'/'5' bundlas som reserv ifall `voiceFrom`/`startFrom` någonsin höjs.
 *
 * ⚠ Klippen är i dag PLATSHÅLLARE genererade lokalt (Windows TTS). Kör
 * `backend/scripts/generate-voice-packs.ts` med en cloud-TTS-nyckel för att
 * skriva över dem med riktiga röster — samma filnamn, inga kodändringar.
 *
 * Lägg till ett nytt pack: droppa `assets/voice-packs/<id>/{1,2,3,4,5,when,who}.mp3`
 * och lägg till en post i `VOICE_PACKS`. VOICE_OPTIONS + Profile-pickern följer med.
 */

export type VoiceToken = '1' | '2' | '3' | '4' | '5' | 'when' | 'who';

/** Alla token i kanonisk ordning — driver preload + placeholder-generering. */
export const VOICE_TOKENS: readonly VoiceToken[] = ['1', '2', '3', '4', '5', 'when', 'who'];

export interface VoicePack {
  id: string;
  label: string;
  /** Metro-asset-id (`require()`) per token — matas till expo-audio. */
  clips: Record<VoiceToken, number>;
}

/** Sentinel: behåll den nuvarande expo-speech-rösten. Även global fallback. */
export const DEFAULT_VOICE_ID = 'default';

// Energiska/positiva röster först (Peter 2026-09-07), Deep sist som den
// dramatiska kontrasten. Lägg till nya pack här — pickern + VOICE_OPTIONS följer.
export const VOICE_PACKS: VoicePack[] = [
  {
    id: 'hype',
    label: 'Hype',
    clips: {
      '1': require('../../assets/voice-packs/hype/1.mp3'),
      '2': require('../../assets/voice-packs/hype/2.mp3'),
      '3': require('../../assets/voice-packs/hype/3.mp3'),
      '4': require('../../assets/voice-packs/hype/4.mp3'),
      '5': require('../../assets/voice-packs/hype/5.mp3'),
      when: require('../../assets/voice-packs/hype/when.mp3'),
      who: require('../../assets/voice-packs/hype/who.mp3'),
    },
  },
  {
    id: 'cheer',
    label: 'Cheer',
    clips: {
      '1': require('../../assets/voice-packs/cheer/1.mp3'),
      '2': require('../../assets/voice-packs/cheer/2.mp3'),
      '3': require('../../assets/voice-packs/cheer/3.mp3'),
      '4': require('../../assets/voice-packs/cheer/4.mp3'),
      '5': require('../../assets/voice-packs/cheer/5.mp3'),
      when: require('../../assets/voice-packs/cheer/when.mp3'),
      who: require('../../assets/voice-packs/cheer/who.mp3'),
    },
  },
  {
    id: 'bright',
    label: 'Bright',
    clips: {
      '1': require('../../assets/voice-packs/bright/1.mp3'),
      '2': require('../../assets/voice-packs/bright/2.mp3'),
      '3': require('../../assets/voice-packs/bright/3.mp3'),
      '4': require('../../assets/voice-packs/bright/4.mp3'),
      '5': require('../../assets/voice-packs/bright/5.mp3'),
      when: require('../../assets/voice-packs/bright/when.mp3'),
      who: require('../../assets/voice-packs/bright/who.mp3'),
    },
  },
  {
    id: 'announcer',
    label: 'Announcer',
    clips: {
      '1': require('../../assets/voice-packs/announcer/1.mp3'),
      '2': require('../../assets/voice-packs/announcer/2.mp3'),
      '3': require('../../assets/voice-packs/announcer/3.mp3'),
      '4': require('../../assets/voice-packs/announcer/4.mp3'),
      '5': require('../../assets/voice-packs/announcer/5.mp3'),
      when: require('../../assets/voice-packs/announcer/when.mp3'),
      who: require('../../assets/voice-packs/announcer/who.mp3'),
    },
  },
  {
    id: 'coach',
    label: 'Coach',
    clips: {
      '1': require('../../assets/voice-packs/coach/1.mp3'),
      '2': require('../../assets/voice-packs/coach/2.mp3'),
      '3': require('../../assets/voice-packs/coach/3.mp3'),
      '4': require('../../assets/voice-packs/coach/4.mp3'),
      '5': require('../../assets/voice-packs/coach/5.mp3'),
      when: require('../../assets/voice-packs/coach/when.mp3'),
      who: require('../../assets/voice-packs/coach/who.mp3'),
    },
  },
  {
    id: 'deep',
    label: 'Deep',
    clips: {
      '1': require('../../assets/voice-packs/deep/1.mp3'),
      '2': require('../../assets/voice-packs/deep/2.mp3'),
      '3': require('../../assets/voice-packs/deep/3.mp3'),
      '4': require('../../assets/voice-packs/deep/4.mp3'),
      '5': require('../../assets/voice-packs/deep/5.mp3'),
      when: require('../../assets/voice-packs/deep/when.mp3'),
      who: require('../../assets/voice-packs/deep/who.mp3'),
    },
  },
];

export interface VoiceOption {
  id: string;
  label: string;
}

/** Val som visas i Profile-pickern: Default + alla pack. */
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: DEFAULT_VOICE_ID, label: 'Default (system voice)' },
  ...VOICE_PACKS.map((p) => ({ id: p.id, label: p.label })),
];

/** Returnerar packet för ett id, eller null för Default / okänt id (→ fallback). */
export function getVoicePack(id: string | null | undefined): VoicePack | null {
  if (!id || id === DEFAULT_VOICE_ID) return null;
  return VOICE_PACKS.find((p) => p.id === id) ?? null;
}
