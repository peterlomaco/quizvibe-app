import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { QuizVibeQuestionMarkLogo } from './QuizVibeQuestionMarkLogo';
import { RevealProfile } from '../utils/revealCurve';

// Mosaik-grid: 32 kolumner × 18 rader = 576 block. Matchar mediaCard:s 16:9-ratio
// så blocken är ungefär kvadratiska. Vi tar bort BLOCKS_PER_TICK block per tick
// så reveal-hastigheten är samma som vid mindre grid — bara finare granularitet.
const COLS = 32;
const ROWS = 18;
const TOTAL_BLOCKS = COLS * ROWS;
const BLOCKS_PER_TICK = 4;

interface Props {
  /**
   * När detta värde ändras (typiskt `questionIndex`) reset:as cover till
   * full täckning och reveal-animation startar om från början.
   */
  resetKey: string | number;
  /** Spelarens profil — reserverat för framtida tweakar (t.ex. assistance-baserad reveal-curve). */
  profile: RevealProfile;
  /** Time-elapse-perioden i sekunder (typiskt 30/45/60). */
  totalSeconds: number;
  /**
   * När `true` snap:ar cover omedelbart till helt revealed (alla block
   * borta + logga osynlig). Sätt vid Confirm-tryck så bilden blir helt
   * synlig under reveal-fasen.
   */
  isRevealed?: boolean;
  /** Storlek på QuizVibe-loggan med "?"-glyph (default 180). */
  logoSize?: number;
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
  isRevealed = false,
  logoSize = 180,
}: Props) {
  const [revealedCount, setRevealedCount] = useState(0);

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

  // Reset + start timer vid resetKey-byte.
  useEffect(() => {
    setRevealedCount(0);
    if (isRevealed) return; // hanteras av nästa effect

    const ticks = Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_TICK);
    const intervalMs = Math.max(30, (totalSeconds * 1000) / ticks);
    const id = setInterval(() => {
      setRevealedCount((c) => {
        const next = Math.min(c + BLOCKS_PER_TICK, TOTAL_BLOCKS);
        if (next >= TOTAL_BLOCKS) clearInterval(id);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Snap till alla block borta vid Confirm.
  useEffect(() => {
    if (isRevealed) {
      setRevealedCount(TOTAL_BLOCKS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed]);

  // Set av block-index som är borttagna (transparenta).
  const revealedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < revealedCount; i++) {
      s.add(revealOrder[i]);
    }
    return s;
  }, [revealedCount, revealOrder]);

  // Q-logga fadar linjärt med reveal-progress.
  const logoOpacity = 1 - revealedCount / TOTAL_BLOCKS;

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
