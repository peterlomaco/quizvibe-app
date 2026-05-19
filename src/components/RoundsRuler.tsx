import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../theme';

// Antal rundor:
//   • Pass-the-Phone: 2–4 (telefonen rör sig fysiskt mellan spelare så
//     speltiden växer snabbt med fler rundor).
//   • Individual Devices: 2–20 (alla spelar parallellt → tål långa spel).
//   • Stegrar i 2 så det alltid blir jämna lap-tal (varje runda = ett
//     varv där alla spelare svarar en gång).
export const ROUNDS_MIN = 2;
export const ROUNDS_MAX_PASS = 4;
export const ROUNDS_MAX_INDIV = 20;
export const ROUNDS_STEP = 2;
export const ROUNDS_DEFAULT = 4;
// Bredd-konstant för linjemätaren — håller pixel-positionerna i sync med
// Lobby:s era-slider (samma 280 px viewport).
const RULER_WIDTH = 280;

/**
 * Linjemätare för Number of Rounds — tunn horisontell linje över intervallet
 * 2–20 med ett kort vertikalt streck per jämnt nummer som markerar tick-
 * positionen. Under linjen står själva siffrorna utan ruta (bara text) i
 * blå nyans för valbara värden, grå för locked (kräver Premium). Aktuellt
 * val lyser upp i en solid blå box med vit text + glow. Locked-intervallet
 * ramas in av en uppåt-öppen klammer med en klickbar "Premium"-knapp under
 * som leder till Store. Delas mellan Lobby:s host-vy och Profile:s host-
 * default-block.
 *
 * `onPremiumPress` saknas → read-only-läge: klammer + PREMIUM-badge döljs
 * helt. Locked-tickarna (n > gameModeMax) renderas dock fortsatt i grått
 * så non-host ser korrekt vilka rounds-värden host *kan* välja. Det betyder:
 * när host:en är Free (max 4 rounds) syns 6–20 grå även för non-host —
 * locked-color speglar host:s rättigheter, men non-host får ingen Premium-
 * CTA eftersom upgrade är host:s ansvar, inte deras.
 *
 * `hasSubscription` (host-vyn) styr färgsättningen i två separata grupper:
 *   • Sub off — klammer GRÅ (#6B7280), tick-streck + siffror GRÅ
 *     (textDisabled / borderStrong), PREMIUM-badge GRÅ.
 *   • Sub on — klammer GULD (#F5A623, signalerar "premium territory du
 *     äger"), tick-streck + siffror BLÅA (Colors.primary, signalerar
 *     "tillgängliga"; locked-distinktionen försvinner visuellt eftersom
 *     host har subscription), PREMIUM-badge GULD.
 *
 * Premium-host får 20 rundor oavsett gameMode (subscription unlock:ar långa
 * spel även i Pass-the-Phone och single-player). Free-host i Pass-the-Phone
 * capas fortfarande vid 4 — telefonen rör sig fysiskt mellan spelare så
 * speltiden växer snabbt med fler rundor. Locked-vokabulär (klammer + badge)
 * syns bara när host saknar subscription OCH `gameModeMax < ROUNDS_MAX_INDIV`.
 */
export function RoundsRuler({ value, min, gameModeMax, onPremiumPress, hasSubscription = false }: {
  value: number;
  min: number;
  gameModeMax: number;
  onPremiumPress?: () => void;
  hasSubscription?: boolean;
}) {
  // Klammer-färg: signalerar premium-status (gold = ägd) ELLER låst (grey).
  const klammerColor = hasSubscription ? '#F5A623' : '#6B7280';
  // Tick-streck + siffror för locked-intervall: när sub är på får de samma
  // blå färg som unlocked-tickar (alla siffror unifierade som "tillgängliga"),
  // när sub är av är de dämpade grå.
  const lockedTickColor = hasSubscription ? Colors.primary : Colors.borderStrong;
  const lockedFigureColor = hasSubscription ? Colors.primary : Colors.textDisabled;
  // PREMIUM-badge:s färgschema — guld med svart text (ägd) eller grå med
  // vit text (locked).
  const badgeBg = hasSubscription ? '#F5A623' : '#6B7280';
  const badgeTextColor = hasSubscription ? '#000' : '#FFF';
  const RULER_MAX = ROUNDS_MAX_INDIV;
  const ticks: number[] = [];
  for (let n = min; n <= RULER_MAX; n += 2) ticks.push(n);
  const range = RULER_MAX - min;
  const fillWidth = ((value - min) / range) * RULER_WIDTH;
  // Read-only-vyn (non-host i Lobby) tar bort allt locked-vokabulär. Klammern
  // visas bara när komponenten är interaktiv (onPremiumPress definierad) OCH
  // det faktiskt finns locked-tickar.
  const interactive = !!onPremiumPress;
  const hasLocked = interactive && gameModeMax < RULER_MAX;

  // Klammer-positionering: spänner över alla locked-tickar (gameModeMax+2 → 20).
  // Lite extra bredd så armarna omsluter siffrorna, inte sitter innanför dem.
  const firstLocked = gameModeMax + ROUNDS_STEP;
  const bracketLeft = ((firstLocked - min) / range) * RULER_WIDTH - 13;
  const bracketRight = ((RULER_MAX - min) / range) * RULER_WIDTH + 13;
  const bracketWidth = bracketRight - bracketLeft;

  return (
    <View style={{ width: RULER_WIDTH, marginTop: 6 }}>
      {/* Tunn track-linje + filled-portion */}
      <View style={{ height: 2, borderRadius: 1, backgroundColor: Colors.border }}>
        <View style={{ height: 2, width: fillWidth, borderRadius: 1, backgroundColor: Colors.primary }} />
      </View>
      {/* Vertikala tick-streck på linjen + nummer-labels under */}
      <View style={{ height: 32, marginTop: 0 }}>
        {ticks.map((n) => {
          const position = ((n - min) / range) * RULER_WIDTH;
          const isCurrent = n === value;
          // Locked-tick = utanför host:s nuvarande gameMode-max. Gäller både
          // host-vyn (visualiserar Premium-tier-låsning) och non-host-vyn
          // (speglar host:s rättigheter — om host inte har Premium så är
          // 6–20 grå även för non-host). Det är BARA klammer + PREMIUM-
          // badge som hides i read-only-läget, inte själva locked-stylingen.
          const isLocked = n > gameModeMax;
          return (
            <View key={n} style={{ position: 'absolute', left: position - 13, width: 26, alignItems: 'center' }}>
              <View style={{
                width: 1.5,
                height: 7,
                marginTop: -4,
                backgroundColor: isLocked ? lockedTickColor : Colors.primary,
              }} />
              {isCurrent ? (
                <View style={roundsRulerStyles.tickBoxCurrent}>
                  <Text style={roundsRulerStyles.tickBoxTextCurrent}>{n}</Text>
                </View>
              ) : (
                <Text style={[
                  roundsRulerStyles.tickText,
                  isLocked && { color: lockedFigureColor },
                ]}>
                  {n}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      {hasLocked && (
        // height tar plats för bracket (top 0, height 10) + premium-badge
        // (top 14, ~18px hög) → ~32px. Bracket är absolutpositionerad så
        // wrapper:n behöver explicit höjd för att inte kollapsa. Badgen
        // sitter i en absolutpositionerad centrerad wrapper över samma
        // bracket-bredd så den auto-centrerar oavsett innehållsbredd.
        <View style={{ marginTop: 4, height: 34 }}>
          <View style={[roundsRulerStyles.bracket, {
            left: bracketLeft,
            width: bracketWidth,
            borderColor: klammerColor,
          }]} />
          <View
            style={{
              position: 'absolute',
              top: 14,
              left: bracketLeft,
              width: bracketWidth,
              alignItems: 'center',
            }}
            pointerEvents="box-none"
          >
            {/* hasLocked => interactive => onPremiumPress definierad. Säkert
                att rendera direkt utan onPremiumPress-presence-fallback.
                Badge:n följer subscription-status: guld + svart text när
                hasSubscription, grå + vit text annars. */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPremiumPress}
              style={[roundsRulerStyles.premiumBadge, { backgroundColor: badgeBg }]}
            >
              <Text style={[roundsRulerStyles.premiumBadgeText, { color: badgeTextColor }]}>
                PREMIUM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const roundsRulerStyles = StyleSheet.create({
  // "Lit"-state för aktuellt val — solid blå box med vit text + glow,
  // matchar formatet på den stora roundsGuestBox men mindre.
  tickBoxCurrent: {
    width: 26,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  tickBoxTextCurrent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    lineHeight: 14,
  },
  // Bara siffer-text (ingen ruta) för valbara icke-valda värden.
  tickText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    marginTop: 9, // matchar tickBoxCurrent.marginTop + (height-fontSize)/2 så raden linjerar
  },
  // Klammer (uppåt-öppen U) som ramar in locked-tickarna. borderTopWidth=0
  // implicit; vänster/höger/botten-borders bildar U:t. Färg sätts inline
  // via `lockedColor` (grå utan subscription, guld med).
  bracket: {
    position: 'absolute',
    top: 0,
    height: 10,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  // Premium-CTA — speglar Individual Devices PREMIUM-badge:n exakt:
  // borderRadius 4 (rektangulär tag, inte pill), guld bg #F5A623, svart
  // text 10px med letterSpacing 0.6. Alltid guld (oavsett hasSubscription).
  // Tap navigerar till Store. Centrering sköts av wrapper:n över bracket-
  // bredden (alignItems: 'center').
  premiumBadge: {
    backgroundColor: '#F5A623',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.6,
  },
});
