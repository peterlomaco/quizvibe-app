/**
 * generate-voice-packs.ts — genererar de riktiga countdown-röstklippen.
 *
 * Countdown-vokabulären är ett litet FAST set (siffror + "When"/"Who"), så
 * varje röstpack är bara ~7 korta mp3-klipp. Detta script anropar en cloud-
 * neural-TTS och skriver klippen till `assets/voice-packs/<packId>/<token>.mp3`
 * — SAMMA filnamn som platshållarna, så klienten kräver inga kodändringar när
 * de riktiga klippen ersätter platshållarna.
 *
 * Standard-provider = OpenAI TTS (`gpt-4o-mini-tts`). Byt provider genom att
 * ersätta `synthesize()` nedan — resten av scriptet är provider-agnostiskt.
 *
 * Körning (från backend/):
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-voice-packs.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-voice-packs.ts --only deep
 *
 * ⚠ Håll `PACKS`/`TOKENS` i synk med src/utils/voicePacks.ts. Lägg till ett
 * nytt pack här + i VOICE_PACKS, kör scriptet, klart.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Skript-katalogen härledd ur import.meta.url (robust under tsx/ESM, oberoende
// av var kommandot körs ifrån — undviker att `__dirname` saknas i ESM).
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Token → texten som ska läsas. Numren som ORD ger renare uttal än siffror.
const TOKENS: Record<string, string> = {
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  when: 'When',
  who: 'Who',
  // Sagt när host går in i lobbyn (ersätter expo-speech-välkomsten).
  // ETT ord, gemener 'v' — camelCase 'QuizVibe' fick TTS att pausa mellan
  // "Quiz" och "Vibe" (Peter 2026-09-08).
  quizvibe: 'Quizvibe',
};

interface PackConfig {
  id: string;
  /** Provider-röst-id (OpenAI: alloy/echo/fable/onyx/nova/shimmer). */
  voice: string;
  /** Stil-instruktion (gpt-4o-mini-tts stödjer `instructions`). */
  instructions: string;
}

// Gentle/less-shouty direction (Peter 2026-09-07): positive and pleasant but
// soft-spoken and calm — NOT loud, shouting, intense or theatrical. Each pack
// keeps a distinct warm character. Say the word softly, relaxed, at a natural
// conversational volume.
// Bara två röster (Peter 2026-09-07): hype = "Female voice", coach = "Male
// voice". Övriga fyra borttagna. Gentle/soft-spoken direktion behålls.
const PACKS: PackConfig[] = [
  {
    id: 'hype',
    voice: 'shimmer', // kvinnlig
    instructions:
      'Female voice. Warm and gently upbeat, like a friendly host smiling. Positive and lively but soft-spoken and relaxed. Do NOT shout or raise your voice. One short word, said calmly.',
  },
  {
    id: 'coach',
    voice: 'ash', // manlig
    instructions:
      'Male voice. Calm, reassuring and steady, like a supportive mentor speaking quietly. Confident but soft and gentle, never intense or shouting. One short word.',
  },
];

const OPENAI_MODEL = 'gpt-4o-mini-tts';
const ASSETS_ROOT = path.resolve(SCRIPT_DIR, '../../assets/voice-packs');

/**
 * Provider-gränssnittet — allt providerspecifikt bor här. Returnerar mp3-bytes.
 * Byt till ElevenLabs/Azure genom att skriva om denna funktion.
 */
async function synthesize(text: string, pack: PackConfig): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY saknas i miljön.');
  }
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      voice: pack.voice,
      input: text,
      instructions: pack.instructions,
      response_format: 'mp3',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`TTS ${res.status} ${res.statusText}: ${detail.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const onlyArg = process.argv.indexOf('--only');
  const onlyId = onlyArg >= 0 ? process.argv[onlyArg + 1] : null;
  const packs = onlyId ? PACKS.filter((p) => p.id === onlyId) : PACKS;
  if (packs.length === 0) {
    console.error(`Inget pack matchar --only ${onlyId}. Kända: ${PACKS.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }
  // --token <id> begränsar till en enskild token (t.ex. regenerera en dålig
  // "tyst" TTS-träff utan att röra pack:ets övriga klipp).
  const tokenArg = process.argv.indexOf('--token');
  const onlyToken = tokenArg >= 0 ? process.argv[tokenArg + 1] : null;
  const tokenEntries = onlyToken
    ? Object.entries(TOKENS).filter(([t]) => t === onlyToken)
    : Object.entries(TOKENS);
  if (tokenEntries.length === 0) {
    console.error(`Ingen token matchar --token ${onlyToken}. Kända: ${Object.keys(TOKENS).join(', ')}`);
    process.exit(1);
  }

  for (const pack of packs) {
    const dir = path.join(ASSETS_ROOT, pack.id);
    await mkdir(dir, { recursive: true });
    for (const [token, text] of tokenEntries) {
      const mp3 = await synthesize(text, pack);
      const out = path.join(dir, `${token}.mp3`);
      await writeFile(out, mp3);
      console.log(`✓ ${pack.id}/${token}.mp3 (${(mp3.length / 1024).toFixed(1)} KB) — "${text}"`);
      // Snäll throttling mot rate-limits.
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  console.log('\nKlart. Kör sedan i klient-repot: verifiera i en dev-build (INTE Expo Go).');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
