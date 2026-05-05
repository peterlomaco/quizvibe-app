/**
 * Reveal-kurva för Namn-svarsmodellens progressive cover.
 *
 * Cover:n (svart 16:9 + QuizVibe-logga med "?" i mitten) startar opacity 1
 * och fadear ut till `finalOpacity` över `duration` ms. Reglerna kan
 * iterera över tid baserat på testgruppens feedback — denna fil är
 * referens-implementationen som kapslar in nuvarande beslut.
 *
 * Kopplad till spelarens profil:
 * - `assistance` styr huvudkurvan
 * - `birthYear` är reserverat för framtida tweakar (t.ex. handicap för
 *   yngsta/äldsta spelarna)
 */

export type AssistanceLevel = 'minimal' | 'standard' | 'full';

export interface RevealProfile {
  birthYear: number;
  assistance: AssistanceLevel;
}

export interface RevealCurve {
  /** Hur lång tid ms innan cover når finalOpacity. */
  duration: number;
  /** Slutlig cover-opacity (0 = bilden helt synlig, 0.15 = aldrig helt avslöjad). */
  finalOpacity: number;
}

/**
 * @param profile      Spelarens profil (assistance driver kurvan)
 * @param totalSeconds Time-elapse-perioden i sekunder (30 / 45 / 60 enligt
 *                     `answerResponseSeconds`-profilinställning)
 */
export function getRevealCurve(
  profile: RevealProfile,
  totalSeconds: number,
): RevealCurve {
  const totalMs = totalSeconds * 1000;

  switch (profile.assistance) {
    case 'full':
      // Snabb reveal: bilden helt synlig vid 60% av perioden.
      // Spelaren får 40% extra tid att fundera med skarp bild.
      return { duration: totalMs * 0.6, finalOpacity: 0 };

    case 'minimal':
      // Långsam reveal: cover stannar vid 0.15 — bilden blir aldrig helt
      // avslöjad under svarsfasen, vilket bibehåller utmaningen.
      return { duration: totalMs * 0.95, finalOpacity: 0.15 };

    case 'standard':
    default:
      // Linjär reveal över hela perioden — bilden helt synlig precis
      // när tiden tar slut.
      return { duration: totalMs, finalOpacity: 0 };
  }
}
