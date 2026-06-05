import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { QuizVibeQuestionMarkLogo } from './QuizVibeQuestionMarkLogo';
import { RevealProfile } from '../utils/revealCurve';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

// Mosaik-grid: 32 kolumner × 18 rader = 576 block. Matchar mediaCard:s 16:9-ratio
// så blocken är ungefär kvadratiska. Vi tar bort BLOCKS_PER_TICK block per tick
// så reveal-hastigheten är samma som vid mindre grid — bara finare granularitet.
const COLS = 32;
const ROWS = 18;
const TOTAL_BLOCKS = COLS * ROWS;
const BLOCKS_PER_TICK = 4;

// Assistance-driven reveal-fraktion: anger hur stor del av Answer Response Time
// som mosaiken tar på sig att försvinna. Lägre = snabbare reveal = mer hjälp.
// Full assistance avslöjar bilden snabbast (25 % av tiden); minimal håller
// den dold längst (75 %) så bilden kommer fram först precis innan tiden är ute.
const ASSISTANCE_REVEAL_FRACTION: Record<AssistanceLevel, number> = {
  full: 0.25,
  standard: 0.5,
  minimal: 0.75,
};

// Q-loggan fadar oberoende av mosaiken — alltid helt borta efter 3 sek så
// den inte sitter kvar och konkurrerar med bilden under hela response-time:n.
const LOGO_FADE_DURATION_MS = 3000;
const LOGO_FADE_TICK_MS = 50;

interface Props {
  /**
   * När detta värde ändras (typiskt `questionIndex`) reset:as cover till
   * full täckning och reveal-animation startar om från början.
   */
  resetKey: string | number;
  /** Spelarens profil — reserverat för framtida tweakar (t.ex. assistance-baserad reveal-curve). */
  profile: RevealProfile;
  /** Time-elapse-perioden i sekunder (typiskt 30/45/60) — Answer Response Time. */
  totalSeconds: number;
  /** Spelarens assistance-nivå — driver hur snabbt mosaiken försvinner.
   *  Defaults till 'standard' om utelämnat. */
  assistance?: AssistanceLevel;
  /**
   * När `true` snap:ar cover omedelbart till helt revealed (alla block
   * borta + logga osynlig). Sätt vid Confirm-tryck så bilden blir helt
   * synlig under reveal-fasen.
   */
  isRevealed?: boolean;
  /** Storlek på QuizVibe-loggan med "?"-glyph (default 180). */
  logoSize?: number;
  /**
   * Mosaiktimern och logo-faden startar INTE förrän `active` är true.
   * Default true (bakåtkompatibelt). Sätt till false under buffer-perioden
   * (hintsActive=false) så mosaikborttagningen synkar med första hinten.
   */
  active?: boolean;
}

/**
 * Mosaik-cover som avslöjar bilden under sig pixel för pixel.
 *
 * - Vid start: alla 144 block är svarta (helt täckt) + Q-logga centrerad.
 * - Över tid: block försvinner ett åt gången i random ordning.
 * - Q-loggan fadar parallellt baserat på % block revealed.
 * - Vid `isRevealed=true`: alla block försvinner + logga blir osynlig direkt.
 *
 * Originalbilden under är aldrig pixlad — den är skarp hela tiden, bara
 * skymd av svarta block som plockas bort.
 */
export function ProgressiveCover({
  resetKey,
  totalSeconds,
  assistance = 'standard',
  isRevealed = false,
  logoSize = 180,
  active = true,
}: Props) {
  const [revealedCount, setRevealedCount] = useState(0);
  // Q-loggans opacity drivs av en separat 3-sekunds-fade istället för av
  // reveal-progress — så att den alltid är helt borta efter 3 sek oavsett
  // hur långsamt mosaiken plockas bort på minimal/standard-assistance.
  const [logoOpacity, setLogoOpacity] = useState(1);

  // Generera random reveal-order vid varje resetKey-byte. Indexet i denna
  // array bestämmer vilken block försvinner vid n:te tick.
  const revealOrder = useMemo(() => {
    const order: number[] = [];
    for (let i = 0; i < TOTAL_BLOCKS; i++) order.push(i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Reset + start mosaik-timer vid resetKey/assistance-byte. Hela reveal:n
  // körs över `fraction × totalSeconds` så att t.ex. minimal assistance håller
  // bilden dold tills 75 % av response time gått, medan full snabbavslöjar.
  useEffect(() => {
    setRevealedCount(0);
    if (isRevealed) return; // hanteras av nästa effect
    if (!active) return;    // vänta tills hintsActive=true

    const fraction = ASSISTANCE_REVEAL_FRACTION[assistance] ?? 0.5;
    const revealDurationMs = Math.max(500, totalSeconds * fraction * 1000);
    const ticks = Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_TICK);
    const intervalMs = Math.max(20, revealDurationMs / ticks);
    const id = setInterval(() => {
      setRevealedCount((c) => {
        const next = Math.min(c + BLOCKS_PER_TICK, TOTAL_BLOCKS);
        if (next >= TOTAL_BLOCKS) clearInterval(id);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, assistance, totalSeconds, active]);

  // Q-logga: linjär fade från 1 → 0 över 3 sek. Egen timer så fade-tiden
  // inte hänger på mosaik-speed (på minimal skulle reveal-driven opacity
  // hänga kvar långt över halva response-time:n).
  useEffect(() => {
    setLogoOpacity(1);
    if (isRevealed) return;
    if (!active) return; // vänta tills hintsActive=true
    const startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const next = Math.max(0, 1 - elapsed / LOGO_FADE_DURATION_MS);
      setLogoOpacity(next);
      if (next <= 0) clearInterval(id);
    }, LOGO_FADE_TICK_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, active]);

  // Snap till alla block borta + logga osynlig vid Confirm.
  useEffect(() => {
    if (isRevealed) {
      setRevealedCount(TOTAL_BLOCKS);
      setLogoOpacity(0);
    }
  }, [isRevealed]);

  // Set av block-index som är borttagna (transparenta).
  const revealedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < revealedCount; i++) {
      s.add(revealOrder[i]);
    }
    return s;
  }, [revealedCount, revealOrder]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Mosaik-grid av svarta block */}
      <View style={styles.grid}>
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => (
          <Block key={i} hidden={revealedSet.has(i)} />
        ))}
      </View>
      {/* Q-logga centrerad ovanpå mosaiken */}
      <View style={[styles.logoCenter, { opacity: logoOpacity }]}>
        <QuizVibeQuestionMarkLogo size={logoSize} />
      </View>
    </View>
  );
}

// Memoized block — bara block vars `hidden`-prop ändras re-renderas, så
// per tick re-renderas bara BLOCKS_PER_TICK blocks (inte alla 576).
const Block = React.memo(function Block({ hidden }: { hidden: boolean }) {
  return <View style={[styles.block, hidden ? styles.blockGone : null]} />;
});

const styles = StyleSheet.create({
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  block: {
    width: `${100 / COLS}%`,
    height: `${100 / ROWS}%`,
    backgroundColor: '#000',
  },
  blockGone: {
    opacity: 0,
  },
  logoCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
