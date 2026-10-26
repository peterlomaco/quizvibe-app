// Distraktor-pool för Spotify/Name-frågor ("What is the Name of this
// Artist/Band?"). Ren modul — inga React/RN-beroenden — så regeln kan
// enhetstestas (backend/content/test/spotifyNameDistractors.test.ts).
//
// RELEVANS = SAMMA PAKET (Peter 2026-10-15): tillhör rätt artist ett eller
// flera paket (genrePackages på artistens låtar) väljs alternativen bland
// artister i samma paket — Swedish House Mafia ("Dance Music") får t.ex.
// David Guetta. Saknar artisten paket är alternativen valfria (dagens
// typ/land/kön-lager via SPOTIFY_ARTIST_META, sist hela poolen).
//
// Taggarna provas SÄLLSYNTAST först, så ett smalt paket ("Dance Music") vinner
// över breda ("Disco & Pop", "Soft & Love") när artisten bär båda.
//
// Ett lager väljs bara om det är ANVÄNDBART: tillräckligt många kandidater i
// samma ord-klass (1 ord vs 2+ ord, via getPrefixForItem) med distinkta
// förstabokstäver — samma regler som buildLetterGrid tillämpar. Annars hade
// grid-bygget tömt lagret och fallit till generiska DISTRACTOR_POOL_NAMES.

import { MUSIC_QUESTIONS } from './musicQuestions';
import { getSpotifyArtistMeta, type SpotifyArtistMeta } from './spotifyArtistMeta';
import { getPrefixForItem } from './imageQuestionBuilder';
import type { ImageQuizQuestion } from './quizImageQuestions';

/** Artist-delen av "Title — Artist", featured-led strippat, lowercase. */
export function spotifyArtistKey(name: string): string {
  const base = name.split(/\s+(?:ft\.?|feat\.?)\s+/i)[0] ?? name;
  return base.trim().toLowerCase();
}

/** Artist-delen av en musikfrågas displayName ("Title — Artist"). */
function artistOf(displayName: string): string | null {
  const artist = displayName.split(' — ').pop()?.trim();
  return artist || null;
}

/** artistKey → union av paket-taggar över artistens Spotify-låtar. */
export const SPOTIFY_ARTIST_PACKAGES: ReadonlyMap<string, ReadonlySet<string>> = (() => {
  const out = new Map<string, Set<string>>();
  for (const q of MUSIC_QUESTIONS) {
    if (!q.spotifyTrackId) continue;
    const artist = artistOf(q.displayName);
    if (!artist) continue;
    const key = spotifyArtistKey(artist);
    const set = out.get(key) ?? new Set<string>();
    for (const tag of q.genrePackages ?? []) set.add(tag);
    out.set(key, set);
  }
  return out;
})();

/** Antal Spotify-låtar per paket-tagg — avgör "sällsyntast först". */
export const PACKAGE_TAG_FREQUENCY: ReadonlyMap<string, number> = (() => {
  const out = new Map<string, number>();
  for (const q of MUSIC_QUESTIONS) {
    if (!q.spotifyTrackId) continue;
    for (const tag of q.genrePackages ?? []) out.set(tag, (out.get(tag) ?? 0) + 1);
  }
  return out;
})();

export function getArtistPackages(name: string): ReadonlySet<string> {
  return SPOTIFY_ARTIST_PACKAGES.get(spotifyArtistKey(name)) ?? new Set<string>();
}

/** Alla Spotify-artister i katalogen (meta valfri). Kandidat-namnet strippas
 *  på featured-delen — "Jay-Z ft. Alicia Keys" blir distraktorn "Jay-Z". */
export const SPOTIFY_ARTIST_CANDIDATES: readonly {
  name: string;
  meta: SpotifyArtistMeta | null;
}[] = (() => {
  const seen = new Set<string>();
  const out: { name: string; meta: SpotifyArtistMeta | null }[] = [];
  for (const q of MUSIC_QUESTIONS) {
    if (!q.spotifyTrackId) continue;
    const artist = artistOf(q.displayName);
    if (!artist) continue;
    const candName = artist.split(/\s+(?:ft\.?|feat\.?)\s+/i)[0]?.trim() || artist;
    const key = candName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: candName, meta: getSpotifyArtistMeta(artist) });
  }
  return out;
})();

export interface SpotifyNameCandidate {
  item: ImageQuizQuestion;
  type: 'artist' | 'band' | null;
  country: string | null;
  gender: 'male' | 'female' | 'mixed' | null;
  packages: ReadonlySet<string>;
}

export const MIN_SPOTIFY_NAME_DISTRACTORS = 4;

function wordClass(name: string, prefixLength: number): number {
  const prefix = getPrefixForItem(name, prefixLength);
  return prefix ? prefix.split(' ').length : 0;
}

/** Hur många alternativ ett lager faktiskt kan ge efter buildLetterGrid:s
 *  regler (samma ord-klass, unik förstabokstav skild från rätt svars). */
export function countUsableDistractors(
  correctName: string,
  layer: readonly SpotifyNameCandidate[],
  prefixLength: number,
): number {
  const correctPrefix = getPrefixForItem(correctName, prefixLength);
  if (!correctPrefix) return 0;
  const correctClass = correctPrefix.split(' ').length;
  const correctKey = correctName.trim().toLowerCase();
  const letters = new Set<string>([correctPrefix.charAt(0)]);
  let usable = 0;
  for (const c of layer) {
    if (c.item.displayName.trim().toLowerCase() === correctKey) continue;
    const prefix = getPrefixForItem(c.item.displayName, prefixLength);
    if (!prefix || prefix === correctPrefix) continue;
    if (wordClass(c.item.displayName, prefixLength) !== correctClass) continue;
    if (letters.has(prefix.charAt(0))) continue;
    letters.add(prefix.charAt(0));
    usable++;
  }
  return usable;
}

/** Välj distraktor-poolen för en Spotify/Name-fråga. */
export function pickSpotifyNamePool(args: {
  correctName: string;
  correctMeta: SpotifyArtistMeta | null;
  candidates: readonly SpotifyNameCandidate[];
  prefixLength: number;
  minDistractors?: number;
}): readonly SpotifyNameCandidate[] {
  const {
    correctName,
    correctMeta,
    candidates,
    prefixLength,
    minDistractors = MIN_SPOTIFY_NAME_DISTRACTORS,
  } = args;
  const usable = (layer: readonly SpotifyNameCandidate[]) =>
    countUsableDistractors(correctName, layer, prefixLength) >= minDistractors;

  // 1. Samma paket — sällsyntast tagg först.
  const tags = [...getArtistPackages(correctName)].sort(
    (a, b) =>
      (PACKAGE_TAG_FREQUENCY.get(a) ?? 0) - (PACKAGE_TAG_FREQUENCY.get(b) ?? 0) ||
      a.localeCompare(b),
  );
  for (const tag of tags) {
    const layer = candidates.filter((c) => c.packages.has(tag));
    if (usable(layer)) return layer;
  }
  // Alla artistens paket tillsammans, innan vi släpper paket-kravet.
  if (tags.length > 1) {
    const layer = candidates.filter((c) => tags.some((t) => c.packages.has(t)));
    if (usable(layer)) return layer;
  }

  // 2. Valfritt: typ/land/kön-lager (striktast → lösast). Kön jämförs bara när
  //    båda sidor har värde. Icke-svenska artister får två "internationellt"-
  //    lager så t.ex. ett USA-band inte får svenska dansband.
  if (correctMeta) {
    const genderMatch = (g: SpotifyNameCandidate['gender']) =>
      correctMeta.gender !== null && g === correctMeta.gender;
    const sameType = (c: SpotifyNameCandidate) => c.type === correctMeta.type;
    const isIntl = (c: SpotifyNameCandidate) => c.country !== null && c.country !== 'sweden';
    const layers: SpotifyNameCandidate[][] = [
      candidates.filter((c) => sameType(c) && c.country === correctMeta.country && genderMatch(c.gender)),
      candidates.filter((c) => sameType(c) && c.country === correctMeta.country),
      ...(correctMeta.country !== 'sweden'
        ? [
            candidates.filter((c) => sameType(c) && isIntl(c) && genderMatch(c.gender)),
            candidates.filter((c) => sameType(c) && isIntl(c)),
          ]
        : []),
      candidates.filter((c) => sameType(c) && genderMatch(c.gender)),
      candidates.filter(sameType),
    ];
    for (const layer of layers) if (usable(layer)) return layer;
  }

  // 3. Hela poolen.
  return candidates;
}
