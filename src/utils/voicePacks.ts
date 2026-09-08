/**
 * Countdown + lobby voice packs.
 *
 * Två röster (Peter 2026-09-07): `hype` = "Female voice", `coach` = "Male voice".
 * `hype` är DEFAULT — den används överallt appen talar (countdown 3-2-1 samt
 * "QuizVibe"-välkomsten när host går in i lobbyn) tills spelaren väljer något
 * annat i Profile → "Countdown voice".
 *
 * Varje pack är en handfull förinspelade mp3-klipp. Tokens:
 *  - '1'..'3' talas i nedräkningen (+ '4'/'5' som reserv om voiceFrom höjs)
 *  - 'quizvibe' talas i lobbyn (ersätter den gamla expo-speech-välkomsten)
 *  - 'when'/'who' är KVAR som klipp men talas inte längre (slut-ordet är borttaget
 *    ur nedräkningen 2026-09-07) — behålls för enkel återaktivering.
 *
 * ⚠ Klippen genereras via `backend/scripts/generate-voice-packs.ts` (OpenAI TTS,
 * hype→shimmer/kvinnlig, coach→ash/manlig). Samma filnamn = inga kodändringar
 * vid omgenerering. Lägg till ett pack: droppa `assets/voice-packs/<id>/*.mp3`
 * + en post i `VOICE_PACKS`; Profile-pickern + VOICE_OPTIONS följer med.
 */

export type VoiceToken = '1' | '2' | '3' | '4' | '5' | 'when' | 'who' | 'quizvibe';

/** Alla token i kanonisk ordning — driver preload i CountdownIntro. */
export const VOICE_TOKENS: readonly VoiceToken[] = ['1', '2', '3', '4', '5', 'when', 'who', 'quizvibe'];

export interface VoicePack {
  id: string;
  label: string;
  /** Metro-asset-id (`require()`) per token — matas till expo-audio. */
  clips: Record<VoiceToken, number>;
}

/** Standardröst: används när spelaren inte valt något (samt fallback). */
export const DEFAULT_VOICE_ID = 'hype';

export const VOICE_PACKS: VoicePack[] = [
  {
    id: 'hype',
    label: 'Female voice',
    clips: {
      '1': require('../../assets/voice-packs/hype/1.mp3'),
      '2': require('../../assets/voice-packs/hype/2.mp3'),
      '3': require('../../assets/voice-packs/hype/3.mp3'),
      '4': require('../../assets/voice-packs/hype/4.mp3'),
      '5': require('../../assets/voice-packs/hype/5.mp3'),
      when: require('../../assets/voice-packs/hype/when.mp3'),
      who: require('../../assets/voice-packs/hype/who.mp3'),
      quizvibe: require('../../assets/voice-packs/hype/quizvibe.mp3'),
    },
  },
  {
    id: 'coach',
    label: 'Male voice',
    clips: {
      '1': require('../../assets/voice-packs/coach/1.mp3'),
      '2': require('../../assets/voice-packs/coach/2.mp3'),
      '3': require('../../assets/voice-packs/coach/3.mp3'),
      '4': require('../../assets/voice-packs/coach/4.mp3'),
      '5': require('../../assets/voice-packs/coach/5.mp3'),
      when: require('../../assets/voice-packs/coach/when.mp3'),
      who: require('../../assets/voice-packs/coach/who.mp3'),
      quizvibe: require('../../assets/voice-packs/coach/quizvibe.mp3'),
    },
  },
];

export interface VoiceOption {
  id: string;
  label: string;
}

/** Val som visas i Profile-pickern: bara de två rösterna (ingen system-TTS). */
export const VOICE_OPTIONS: VoiceOption[] = VOICE_PACKS.map((p) => ({ id: p.id, label: p.label }));

/** Returnerar packet för ett id, eller null om det inte finns. */
export function getVoicePack(id: string | null | undefined): VoicePack | null {
  if (!id) return null;
  return VOICE_PACKS.find((p) => p.id === id) ?? null;
}

/** Som getVoicePack men faller ALLTID tillbaka på default-rösten (hype) för
 *  okända/stale id:n — så countdown + lobby alltid har en röst att spela. */
export function resolveVoicePack(id: string | null | undefined): VoicePack {
  return getVoicePack(id) ?? getVoicePack(DEFAULT_VOICE_ID)!;
}

/** True om id:t är en giltig, valbar röst (för coerce av stale profil-värden). */
export function isValidVoiceId(id: string | null | undefined): boolean {
  return !!getVoicePack(id);
}
