/**
 * Reveal-kurva för Namn-svarsmodellens progressive cover.
 *
 * Cover:n (svart 16:9 + QuizVibe-logga med "?" i mitten) startar opacity 1
 * och fadear ut till `finalOpacity` över `duration` ms. Reglerna kan
 * iterera över tid baserat på testgruppens feedback — denna fil är
 * referens-implementationen som kapslar in nuvarande beslut.
 *
 * Kopplad till spelarens profil:
 * - `skill` styr huvudkurvan
 * - `birthYear` är reserverat för framtida tweakar (t.ex. handicap för
 *   yngsta/äldsta spelarna)
 */

export type SkillLevel = 'easy' | 'intermediate' | 'expert';

export interface RevealProfile {
  birthYear: number;
  skill: SkillLevel;
}

export interface RevealCurve {
  /** Hur lång tid ms innan cover når finalOpacity. */
  duration: number;
  /** Slutlig cover-opacity (0 = bilden helt synlig, 0.15 = aldrig helt avslöjad). */
  finalOpacity: number;
}

/**
 * @param profile      Spelarens profil (skill driver kurvan)
 * @param totalSeconds Time-elapse-perioden i sekunder (30 / 45 / 60 enligt
 *                     `answerResponseSeconds`-profilinställning)
 */
export function getRevealCurve(
  profile: RevealProfile,
  totalSeconds: number,
): RevealCurve {
  const totalMs = totalSeconds * 1000;

  switch (profile.skill) {
    case 'easy':
      // Snabb reveal: bilden helt synlig vid 60% av perioden.
      // Spelaren får 40% extra tid att fundera med skarp bild.
      return { duration: totalMs * 0.6, finalOpacity: 0 };

    case 'expert':
      // Långsam reveal: cover stannar vid 0.15 — bilden blir aldrig helt
      // avslöjad under svarsfasen, vilket bibehåller utmaningen.
      return { duration: totalMs * 0.95, finalOpacity: 0.15 };

    case 'intermediate':
    default:
      // Linjär reveal över hela perioden — bilden helt synlig precis
      // när tiden tar slut.
      return { duration: totalMs, finalOpacity: 0 };
  }
}
