/**
 * QuizVibe HCP Engine
 * HCP-skalan går från 99 (nybörjare) till 1 (elit)
 */

export type AssistanceLevel = 'minimal' | 'standard' | 'full';

// ─── HCP Caps per assistance level ───────────────────────────────────────────
// Mer assistans = nybörjare-spår (högre cap = sämre HCP tillåten).
// Minimal assistans = elit-spår (cap 1).

export const HCP_CAPS: Record<AssistanceLevel, number> = {
  full:     66,
  standard: 33,
  minimal:   1,
};

// ─── Avrundning ──────────────────────────────────────────────────────────────
// Alla HCP-beräkningar som kan producera decimaler ska avrundas till
// närmaste heltal med 0,5 uppåt. JS:s Math.round följer denna regel för
// positiva tal (0.5→1, 1.5→2, 2.5→3) och HCP är alltid 1–99 så
// negativ-fallet (Math.round(-0.5) = 0) är inte aktuellt här.
// Centraliserad helper så regeln är enkel att flytta om den ändras.
export function roundHcp(value: number): number {
  return Math.round(value);
}

// ─── Startvärde baserat på assistance ────────────────────────────────────────

export function getStartingHCP(assistance: AssistanceLevel): number {
  switch (assistance) {
    case 'full':     return 99;
    case 'standard': return 75;
    case 'minimal':  return 50;
  }
}

// ─── Era-logik (vilket innehåll spelaren får) ─────────────────────────────────

export interface EraRange {
  from: number;
  to: number;
}

export function getEraRange(birthYear: number, assistance: AssistanceLevel): EraRange {
  const currentYear = new Date().getFullYear();

  switch (assistance) {
    case 'full':
      // Strikt inom livstiden
      return { from: birthYear, to: currentYear };

    case 'standard':
      // Livstid + 10 år bakåt
      return { from: birthYear - 10, to: currentYear };

    case 'minimal':
      // Full historisk tillgång
      return { from: 1950, to: currentYear };
  }
}

// ─── HCP-progression (poäng sänker HCP) ──────────────────────────────────────

export function calculateNewHCP(
  currentHCP: number,
  pointsEarned: number,
  assistance: AssistanceLevel
): number {
  const cap = HCP_CAPS[assistance];
  // Avrundning enligt projekt-policy (roundHcp) — 2 poäng → 1 i reduktion,
  // 1 poäng → 1 (0.5 rundas uppåt till spelarens fördel). Skalan följer
  // nya scoring-modellen där 1 rätt svar = 1 poäng (calculatePoints i
  // app/quiz.tsx). Tidigare var divisorn 10 från då varje fråga gav 0-1000
  // pts; binär 0/1-modell kräver mycket smalare proportion.
  const reduction = roundHcp(pointsEarned / 2);
  const newHCP = currentHCP - reduction;
  return Math.max(newHCP, cap);
}

// ─── Ålderspenalty (om spelaren ökar sin ålder) ───────────────────────────────

export function applyAgePenalty(
  currentHCP: number,
  oldAge: number,
  newAge: number
): number {
  if (newAge <= oldAge) return currentHCP;
  const penalty = (newAge - oldAge) * 2;
  return Math.min(currentHCP + penalty, 99);
}

// ─── Beräkna HCP från ålder + assistance (för nya spelare) ────────────────────

export function calculateInitialHCP(age: number, assistance: AssistanceLevel): number {
  let base = getStartingHCP(assistance);

  // Ålder påverkar startpoängen – äldre = bredare frågepool = högre HCP
  if (age >= 51)      base = Math.min(base + 10, 99);
  else if (age >= 36) base = Math.min(base + 5,  99);
  else if (age >= 21) base = base;
  else                base = Math.max(base - 5,  HCP_CAPS[assistance]);

  return base;
}

// ─── Färg baserat på assistance level ────────────────────────────────────────

export function getHCPColor(assistance: AssistanceLevel): string {
  switch (assistance) {
    case 'full':     return '#52C87A'; // Grön
    case 'standard': return '#4DA3FF'; // Blå
    case 'minimal':  return '#F5A623'; // Guld
  }
}

// ─── HCP-floor ───────────────────────────────────────────────────────────────
// Minimum tillåtet HCP i spelet — gäller både guest-auto-derivering och
// host:s manuella redigering av registrerade spelares HCP. 50 är "halva
// skalan" — bättre nivåer är reserverade för spelare som tjänar in dem
// genom progression (calculateNewHCP), inte för manuell justering.
export const MIN_HCP = 50;

// ─── Guest HCP från närmaste age-matched registrerade spelare ────────────────
// Visuellt visar guest-kort alltid "Guest HCP"-placeholder (utan siffra).
// Internt används ett härledt värde:
//
//  • >1 registrerad spelare → HCP hos den registrerade vars Competition
//    Age of birth ligger närmast guest:ens (tie-break på första-förekomst
//    i arrayen, typiskt host eftersom host alltid är index 0).
//  • Endast en registrerad (typiskt host ensam) → mellanvärdet mellan
//    den enda referensens HCP och 100. Skälet: med en enda match-kandidat
//    blir närmaste-age-algoritmen meningslös, så vi biasar guest:en mot
//    nybörjar-änden istället.
//
// Resultatet clampas alltid till [MIN_HCP, 99] — guests får aldrig
// spela på "för bra" nivå oavsett vilken referens som matchade.
// Returnerar null om det inte finns någon registrerad spelare alls.
export function getGuestHcpFromClosestAge(
  guestAge: number,
  registeredPlayers: Array<{ age?: number; assistance?: AssistanceLevel; hcpOverride?: number }>,
): number | null {
  const eligible = registeredPlayers.filter(
    (p) => p.age !== undefined && p.assistance !== undefined,
  );
  if (eligible.length === 0) return null;

  const refHcp = (p: { age?: number; assistance?: AssistanceLevel; hcpOverride?: number }) =>
    p.hcpOverride ?? calculateInitialHCP(p.age!, p.assistance!);

  let derivedHcp: number;
  if (eligible.length === 1) {
    derivedHcp = roundHcp((refHcp(eligible[0]!) + 100) / 2);
  } else {
    let best: { age: number; hcp: number } | null = null;
    for (const p of eligible) {
      const hcp = refHcp(p);
      if (best === null || Math.abs(p.age! - guestAge) < Math.abs(best.age - guestAge)) {
        best = { age: p.age!, hcp };
      }
    }
    derivedHcp = best!.hcp;
  }

  return Math.min(99, Math.max(MIN_HCP, derivedHcp));
}
