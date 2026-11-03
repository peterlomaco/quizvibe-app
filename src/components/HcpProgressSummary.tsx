import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';
import { HCPShield, getShieldTierColor, getShieldTierRank } from './HCPShield';

/**
 * Game Summary:s HCP-kort: [förändrings-sköld] → [nytt HCP].
 *
 * Läses utan förklarande text:
 *  - Vänster sköld = förändringen i det här spelet ("−3", "+2", "0").
 *    Lägre HCP = bättre, så ett minus är en förbättring.
 *  - Pil mellan sköldarna.
 *  - Höger sköld = nytt HCP, större och dominant, i sin vanliga tier-färg,
 *    med en TOTAL-etikett under.
 *
 * Avslöjandet: skölden snurrar som ett mynt och LANDAR — själva landningen är
 * höjdpunkten. Där pulserar en ring ut runt skölden och skölden gör ett
 * litet studs. Intensiteten följer resultatet:
 *   oförändrat/sämre → svag guldpuls
 *   förbättrat       → starkare guldpuls
 *   ny HÖGRE tier    → milstolpe: dubbel ring (nya tierns färg + guld), fler
 *                      gnistor, ett tydligare studs och "NEW HCP RANK!" som
 *                      poppar in kort och tonar bort.
 * Tier = HCPShield:s egna trösklar (getShieldTierRank) — milstolpen kräver att
 * spelaren KORSAR in i en högre tier, inte bara att talet ändras.
 * Ingen bakgrundsplatta bakom skölden — ringarna är rena konturer, och allt
 * tonar ut så kortet landar i sköldens vanliga utseende.
 * Oförändrat eller sämre är aldrig rött: sekvensen är ett firande.
 */

const COMPACT = Dimensions.get('window').height < 700;
const CHANGE_SIZE = COMPACT ? 58 : 68;
const CURRENT_SIZE = COMPACT ? 92 : 110;
// Myntsnurret på nya skölden: antal hela varv + total tid.
const COIN_TURNS = 5;
const COIN_SPIN_MS = 1900;
// Pulsen när myntet landat.
const PULSE_MS = 650;
/** Hur länge HCP-kortet bör stå innan auto-bläddring: snurr + puls + läsro. */
export const HCP_CARD_HOLD_MS = COIN_SPIN_MS + PULSE_MS + 1500;

// Milstolpe ("NEW HCP RANK!"): texten studsar upp när skölden landar, och när
// den nått full storlek exploderar en kort konfetti-skur ut från den. Hela
// förloppet efter landningen ≈ 1,4 s — ryms inom HCP_CARD_HOLD_MS.
const MILESTONE_POP_MS = 380;
const MILESTONE_HOLD_MS = 650;
const MILESTONE_OUT_MS = 320;
const BURST_MS = 1000;

// Konfetti-skuren: få partiklar (lätt), deterministiska riktningar. Vinklar i
// grader (0 = höger), med tyngd åt höger mot nya skölden. Varannan partikel
// guld, varannan i nya tierns färg.
const BURST = [
  { a: -100, d: 46 }, { a: -60, d: 70 }, { a: -25, d: 92 }, { a: 5, d: 100 },
  { a: 30, d: 88 }, { a: 60, d: 64 }, { a: 95, d: 44 }, { a: 130, d: 52 },
  { a: 165, d: 60 }, { a: -150, d: 56 }, { a: -40, d: 54 }, { a: 15, d: 66 },
  { a: 45, d: 104 }, { a: -10, d: 76 },
].map((p, i) => {
  const rad = (p.a * Math.PI) / 180;
  return {
    dx: Math.cos(rad) * p.d,
    dy: Math.sin(rad) * p.d,
    rot: (i % 2 === 0 ? 1 : -1) * (180 + i * 37),
    w: i % 3 === 0 ? 3 : 4,
    h: i % 3 === 0 ? 7 : 5,
    gold: i % 2 === 0,
  };
});

// worse    = HCP försämrat: bara snurret, ingen puls/studs/firande.
// subtle   = oförändrat: svag guldpuls.
// strong   = förbättrat inom samma tier: starkare guldpuls.
// newTier  = förbättrat IN I en högre tier: hela milstolpen.
type RevealLevel = 'worse' | 'subtle' | 'strong' | 'newTier';

const PULSE_BY_LEVEL: Record<RevealLevel, { peak: number; scale: number; border: number }> = {
  worse: { peak: 0, scale: 1, border: 0 },
  subtle: { peak: 0.35, scale: 1.18, border: 2 },
  strong: { peak: 0.8, scale: 1.3, border: 3 },
  newTier: { peak: 1, scale: 1.42, border: 3.5 },
};

// Gnistor (ny tier): positioner runt skölden, relativt dess storlek.
const SPARKS = [
  { x: -0.62, y: -0.42, size: 18, at: 0.06 },
  { x: 0.6, y: -0.5, size: 14, at: 0.14 },
  { x: 0.7, y: 0.05, size: 12, at: 0.2 },
  { x: 0.66, y: 0.34, size: 16, at: 0.26 },
  { x: -0.58, y: 0.38, size: 13, at: 0.32 },
  { x: -0.7, y: -0.02, size: 11, at: 0.38 },
];

interface Props {
  before: number;
  after: number;
  /** True när kortet är den synliga sidan — då spelas avslöjandet. */
  active: boolean;
}

export default function HcpProgressSummary({ before, after, active }: Props) {
  const delta = after - before;
  const improved = delta < 0;
  const deltaText = delta === 0 ? '0' : delta < 0 ? `−${-delta}` : `+${delta}`;
  // Pilen: guld vid förbättring, annars en ljusare grå än skölden så den
  // syns tydligt mot navy.
  const accent = improved ? Colors.warning : '#9CA3AF';
  const worsened = delta > 0;
  // Bara när spelaren FÖRBÄTTRAS in i en HÖGRE tier (lägre HCP-tal = högre
  // rang). `improved` står med explicit så en försämring aldrig kan trigga.
  const newTier = improved && getShieldTierRank(after) > getShieldTierRank(before);
  const level: RevealLevel = newTier
    ? 'newTier'
    : improved
      ? 'strong'
      : worsened
        ? 'worse'
        : 'subtle';
  // Förändringssiffran: guld = bättre, vit = oförändrat, röd = sämre.
  const deltaColor = improved ? Colors.warning : worsened ? Colors.error : '#FFFFFF';
  const pulseCfg = PULSE_BY_LEVEL[level];
  // Ny tier: första ringen i nya tierns RIKTIGA färg (samma som skölden).
  const ringColor = newTier ? getShieldTierColor(after) : Colors.warning;

  const reveal = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  // 0 → 1 under pulsen (ringen expanderar och tonar ut).
  const pulse = useRef(new Animated.Value(0)).current;
  // Landnings-studs på skölden.
  const land = useRef(new Animated.Value(0)).current;
  // Gnistor — en gemensam driver, staggerad via interpolation per gnista.
  const sparks = useRef(new Animated.Value(0)).current;
  // "NEW HCP RANK!": 0 → 1 (in) → 2 (ut).
  const milestone = useRef(new Animated.Value(0)).current;
  // Konfetti-skuren: 0 → 1, en driver för alla partiklar.
  const burst = useRef(new Animated.Value(0)).current;
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active || playedRef.current) return;
    playedRef.current = true;
    const pop = Animated.spring(reveal, {
      toValue: 1,
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    });
    // Myntet: snabbt först, bromsar in och landar med framsidan fram.
    // Landningen triggar pulsen (+ milstolpen vid ny tier).
    const seq = Animated.sequence([
      Animated.timing(spin, {
        toValue: 1,
        duration: COIN_SPIN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(land, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.spring(land, { toValue: 0, friction: 5, tension: 120, useNativeDriver: true }),
        ]),
        ...(level === 'newTier'
          ? [
              Animated.timing(sparks, {
                toValue: 1,
                duration: PULSE_MS + 450,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.sequence([
                // Snabb, energisk studs upp till full storlek (back-easing ger
                // överslaget utan en långsam fjäder som skjuter upp skuren).
                Animated.timing(milestone, {
                  toValue: 1,
                  duration: MILESTONE_POP_MS,
                  easing: Easing.out(Easing.back(2.2)),
                  useNativeDriver: true,
                }),
                // Full storlek → texten "exploderar": skuren går ut medan
                // texten står kvar en stund och sedan tonar bort.
                Animated.parallel([
                  Animated.timing(burst, {
                    toValue: 1,
                    duration: BURST_MS,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }),
                  Animated.sequence([
                    Animated.delay(MILESTONE_HOLD_MS),
                    Animated.timing(milestone, {
                      toValue: 2,
                      duration: MILESTONE_OUT_MS,
                      easing: Easing.in(Easing.quad),
                      useNativeDriver: true,
                    }),
                  ]),
                ]),
              ]),
            ]
          : []),
      ]),
    ]);
    pop.start();
    seq.start();
    return () => {
      pop.stop();
      seq.stop();
    };
  }, [active, level, reveal, spin, pulse, land, sparks, milestone, burst]);

  const currentScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const currentOpacity = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const coinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${COIN_TURNS * 360}deg`],
  });
  const landScale = land.interpolate({
    inputRange: [0, 1],
    // Försämring: inget landnings-studs (inget firande).
    outputRange: [1, level === 'newTier' ? 1.14 : level === 'worse' ? 1 : 1.08],
  });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, pulseCfg.scale] });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, pulseCfg.peak, 0],
  });
  // Milstolpe: en andra guldring som släpar efter tier-ringen.
  const ring2Scale = pulse.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.9, 0.9, pulseCfg.scale + 0.14],
  });
  const ring2Opacity = pulse.interpolate({
    inputRange: [0, 0.3, 0.5, 1],
    outputRange: [0, 0, 0.75, 0],
  });
  const milestoneOpacity = milestone.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  const milestoneScale = milestone.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.2, 1, 0.98],
  });
  const burstOpacity = burst.interpolate({
    inputRange: [0, 0.08, 0.65, 1],
    outputRange: [0, 1, 0.9, 0],
  });

  return (
    <View style={styles.row}>
      <HCPShield
        hcp={after}
        size={CHANGE_SIZE}
        valueText={deltaText}
        hideLabel
        tone={improved ? 'gold' : 'neutral'}
        strokeScale={1.35}
        valueColor={deltaColor}
        // Metallisk guldglans på förbättringssiffran.
        valueGlow={improved ? 'rgba(255,214,120,0.75)' : undefined}
      />

      <View style={styles.arrowWrap}>
        <Svg width={40} height={24} viewBox="0 0 40 24" style={styles.arrow}>
          <Path
            d="M3 12 H34 M26 4 L35 12 L26 20"
            stroke={accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>

        {/* Milstolpen: liten guldtext ovanför pilen, mellan sköldarna — den
            täcker varken talen eller TOTAL-märket. Konfettin skjuts ut från
            textens mitt. Allt absolut → ingen layoutändring. */}
        {level === 'newTier' && (
          <View style={styles.milestoneAnchor} pointerEvents="none">
            {BURST.map((p, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confetti,
                  {
                    width: p.w,
                    height: p.h,
                    backgroundColor: p.gold ? Colors.warning : ringColor,
                    opacity: burstOpacity,
                    transform: [
                      {
                        translateX: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, p.dx],
                        }),
                      },
                      {
                        // Lätt tyngd: partiklarna sjunker en aning mot slutet.
                        translateY: burst.interpolate({
                          inputRange: [0, 0.6, 1],
                          outputRange: [0, p.dy * 0.9, p.dy + 16],
                        }),
                      },
                      {
                        rotate: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${p.rot}deg`],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
            <Animated.Text
              style={[
                styles.milestoneText,
                { opacity: milestoneOpacity, transform: [{ scale: milestoneScale }] },
              ]}
              allowFontScaling={false}
            >
              {'NEW HCP\nRANK!'}
            </Animated.Text>
          </View>
        )}
      </View>

      <Animated.View
        style={[styles.currentWrap, { opacity: currentOpacity, transform: [{ scale: currentScale }] }]}
      >
        {/* Puls: ren kontur, ingen fylld platta bakom skölden. */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            {
              borderWidth: pulseCfg.border,
              borderColor: ringColor,
              shadowColor: ringColor,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        {level === 'newTier' && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              { borderWidth: 2, opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
            ]}
          />
        )}
        {level === 'newTier' &&
          SPARKS.map((sp, i) => {
            const range = [0, sp.at, sp.at + 0.25, 1];
            const op = sparks.interpolate({
              inputRange: range,
              outputRange: [0, 0, 1, 0],
              extrapolate: 'clamp',
            });
            const sc = sparks.interpolate({
              inputRange: range,
              outputRange: [0.4, 0.4, 1.15, 0.7],
              extrapolate: 'clamp',
            });
            return (
              <Animated.Text
                key={i}
                pointerEvents="none"
                style={[
                  styles.spark,
                  {
                    fontSize: sp.size,
                    left: (CURRENT_SIZE * 0.9) / 2 + sp.x * CURRENT_SIZE - sp.size / 2,
                    top: (CURRENT_SIZE * 1.15) / 2 + sp.y * CURRENT_SIZE - sp.size / 2,
                    opacity: op,
                    transform: [{ scale: sc }],
                  },
                ]}
              >
                {'✦'}
              </Animated.Text>
            );
          })}
        <Animated.View
          style={{ transform: [{ perspective: 800 }, { rotateY: coinRotate }, { scale: landScale }] }}
        >
          <HCPShield hcp={after} size={CURRENT_SIZE} />
        </Animated.View>
        {/* Kant-skärande etikett under spetsen (absolut → ingen layoutändring). */}
        <View style={styles.totalBadge} pointerEvents="none">
          <Text style={styles.totalBadgeText}>TOTAL</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  arrow: {
    marginHorizontal: 2,
  },
  currentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBadge: {
    position: 'absolute',
    bottom: -9,
    backgroundColor: Colors.warning,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#000',
    letterSpacing: 0.6,
  },
  // Pulsringen: bara kontur (transparent mitt) + glöd längs kanten.
  pulseRing: {
    position: 'absolute',
    width: CURRENT_SIZE * 1.05,
    height: CURRENT_SIZE * 1.05,
    borderRadius: CURRENT_SIZE,
    borderColor: Colors.warning,
    backgroundColor: 'transparent',
    shadowColor: Colors.warning,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  // zIndex: konfettin ska flyga OVANFÖR nya skölden, som renderas efter pilen.
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 5,
  },
  // Förankrad ovanför pilen, centrerad över den. Bredare än pilen så två
  // korta rader ryms i gapet mellan sköldarna; nollhöjd-ankaret gör att
  // konfettin skjuts ut från textens mitt.
  milestoneAnchor: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 6,
    width: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(245,166,35,0.55)',
    textShadowRadius: 6,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 1,
  },
  spark: {
    position: 'absolute',
    color: Colors.warning,
    textShadowColor: Colors.warning,
    textShadowRadius: 8,
  },
});
