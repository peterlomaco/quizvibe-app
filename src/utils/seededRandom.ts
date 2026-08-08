// seededRandom.ts — deterministisk RNG för innehåll som MÅSTE se identiskt ut
// på flera enheter.
//
// Bakgrund: Remote 1v1 har ingen sync-kanal under spel — båda spelarna bygger
// sina svarsalternativ och sitt hint-urval LOKALT ur samma katalog. Med
// `Math.random` blir urval och ordning olika på de två enheterna, vilket gör
// duellen orättvis (olika distraktorer, olika ledtrådar, olika sekvens).
// Genom att seeda RNG:n på ett värde båda enheterna delar (matchens id +
// frågans id) producerar samma kod samma output överallt.
//
// Använd ALLTID en seed som är stabil över tid OCH lika för båda spelarna —
// t.ex. `${matchId}:${questionId}`. Seeda ALDRIG på något enhets- eller
// spelarspecifikt (playerId, timestamp, index i en lokalt shufflad lista).

/** FNV-1a 32-bit — liten, snabb, tillräckligt spridd för spel-shuffle. */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Returnerar en `() => number`-funktion med samma kontrakt som `Math.random`
 * (float i [0, 1)), men deterministisk för en given seed-sträng.
 *
 * Algoritm: mulberry32 — 32-bitars PRNG med bra fördelning för vårt bruk
 * (Fisher-Yates-shuffle av listor på <100 element). Inte kryptografisk.
 */
export function createSeededRng(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
