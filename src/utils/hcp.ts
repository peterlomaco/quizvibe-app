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
  const reduction = Math.floor(pointsEarned / 10);
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
