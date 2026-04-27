/**
 * QuizVibe HCP Engine
 * HCP-skalan går från 99 (nybörjare) till 1 (elit)
 */

export type SkillLevel = 'easy' | 'intermediate' | 'expert';

// ─── HCP Caps per skill level ─────────────────────────────────────────────────

export const HCP_CAPS: Record<SkillLevel, number> = {
  easy:         66,
  intermediate: 33,
  expert:        1,
};

// ─── Startvärde baserat på skill ─────────────────────────────────────────────

export function getStartingHCP(skill: SkillLevel): number {
  switch (skill) {
    case 'easy':         return 99;
    case 'intermediate': return 75;
    case 'expert':       return 50;
  }
}

// ─── Era-logik (vilket innehåll spelaren får) ─────────────────────────────────

export interface EraRange {
  from: number;
  to: number;
}

export function getEraRange(birthYear: number, skill: SkillLevel): EraRange {
  const currentYear = new Date().getFullYear();

  switch (skill) {
    case 'easy':
      // Strikt inom livstiden
      return { from: birthYear, to: currentYear };

    case 'intermediate':
      // Livstid + 10 år bakåt
      return { from: birthYear - 10, to: currentYear };

    case 'expert':
      // Full historisk tillgång
      return { from: 1950, to: currentYear };
  }
}

// ─── HCP-progression (poäng sänker HCP) ──────────────────────────────────────

export function calculateNewHCP(
  currentHCP: number,
  pointsEarned: number,
  skill: SkillLevel
): number {
  const cap = HCP_CAPS[skill];
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

// ─── Beräkna HCP från ålder + skill (för nya spelare) ────────────────────────

export function calculateInitialHCP(age: number, skill: SkillLevel): number {
  let base = getStartingHCP(skill);

  // Ålder påverkar startpoängen – äldre = bredare frågepool = högre HCP
  if (age >= 51)      base = Math.min(base + 10, 99);
  else if (age >= 36) base = Math.min(base + 5,  99);
  else if (age >= 21) base = base;
  else                base = Math.max(base - 5,  HCP_CAPS[skill]);

  return base;
}

// ─── Färg baserat på HCP-tal ──────────────────────────────────────────────────

export function getHCPColor(skill: SkillLevel): string {
  switch (skill) {
    case 'easy':         return '#52C87A'; // Grön
    case 'intermediate': return '#4DA3FF'; // Blå
    case 'expert':       return '#F5A623'; // Guld
  }
}