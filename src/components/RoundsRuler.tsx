import React from 'react';
import { StyleSheet, View } from 'react-native';
// Linjemätaren är bara siffror + FREE/PREMIUM-badges → capped mot Dynamic Type.
import { CappedText as Text } from './CappedText';
import { TouchableOpacity } from '@/src/components/haptic';
import { Colors, Radius } from '../theme';
import { TRACK_VIEWPORT_W } from '../utils/responsive';

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
// Lobby:s era-slider (delad, skärmbredds-härledd viewport, se responsive.ts).
const RULER_WIDTH = TRACK_VIEWPORT_W;

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
 * så non-host ser korrekt vilka rounds-värden host *kan* välja.
 *
 * Två separata color-axlar:
 *   • `hasSubscription` — äger user premium? Driver enbart PREMIUM-badge:s
 *     färg (gold + svart text om true, grå + vit text om false).
 *   • `applicable` (default true) — är feature unlocked i nuvarande mode?
 *     Driver klammer + tick-färger. När false (typiskt PtP där premium inte
 *     unlock:ar långa spel) renderas alla locked-elementen som "icke-
 *     tillgängliga" oavsett premium-status, och en explainer-text
 *     "Applicable for Individual device mode" visas ovanför klammern.
 *
 * Resultat: Premium-host i PtP ser gold PREMIUM-badge (de äger feature:n)
 * men grå klammer + grå locked-tickar + explainer (feature gäller inte
 * här). Free host i PtP ser allt grått (vanlig upsell). Premium-host i
 * IndDev ser allt guld/blå (feature unlocked). Free host i IndDev ser
 * också allt unlocked eftersom IndDev:s rounds-cap är 20 och locked-zonen
 * inte renderas.
 */
export function RoundsRuler({ value, min, gameModeMax, onPremiumPress, hasSubscription = false, applicable = true, indivActive = false }: {
  value: number;
  min: number;
  gameModeMax: number;
  onPremiumPress?: () => void;
  hasSubscription?: boolean;
  applicable?: boolean;
  indivActive?: boolean;
}) {
  // Klammer + ticks visas "unlocked" bara när BÅDA villkoren stämmer:
  // user äger premium OCH feature:n gäller i nuvarande mode. Annars grå.
  const featureUnlocked = hasSubscription && applicable;
  const klammerColor = featureUnlocked ? '#F5A623' : '#6B7280';
  const lockedTickColor = featureUnlocked ? Colors.primary : Colors.borderStrong;
  const lockedFigureColor = featureUnlocked ? Colors.primary : Colors.textDisabled;
  // PREMIUM-badge:s färgschema följer ENDAST hasSubscription (ownership-
  // signal). Premium-host får guld även när feature:n inte gäller här —
  // klammern + texten ovanför signalerar att den inte är applicable.
  const badgeBg = hasSubscription ? '#F5A623' : '#6B7280';
  const badgeTextColor = hasSubscription ? '#000' : '#FFF';
  const RULER_MAX = ROUNDS_MAX_INDIV;
  const ticks: number[] = [];
  for (let n = min; n <= RULER_MAX; n += 2) ticks.push(n);
  const range = RULER_MAX - min;
  const fillWidth = ((value - min) / range) * RULER_WIDTH;
  // Read-only-vyn (non-host i Lobby) tar bort klammern. När host:en är
  // interaktiv visas klammern i BÅDA mode:n (PtP visar locked-tier-upsell,
  // IndDev visar premium-tier ownership-indikator). Tidigare gating på
  // `gameModeMax < RULER_MAX` gömde klammern i IndDev — nu vill vi att
  // premium-host ser guld-klammer även där för att signalera att de äger
  // funktionen.
  const interactive = !!onPremiumPress;
  const hasBracket = interactive;

  // Klammer-positionering: spänner ALLTID över premium-tier-rangen
  // (ROUNDS_MAX_PASS+2 → 20), oavsett gameMode. Detta gör att bracket-
  // span är konsekvent mellan PtP och IndDev — bara färg/text-styling
  // ändras med mode. Variabelnamnet behålls för minimal diff.
  const firstLocked = ROUNDS_MAX_PASS + ROUNDS_STEP;
  const bracketLeft = ((firstLocked - min) / range) * RULER_WIDTH - 13;
  const bracketRight = ((RULER_MAX - min) / range) * RULER_WIDTH + 13;
  const bracketWidth = bracketRight - bracketLeft;

  // FREE-klammer: spänner över gratis-tier-rangen (min → ROUNDS_MAX_PASS),
  // dvs 2–4 rundor. Speglar premium-klammerns +13/-13-offsetmönster så de två
  // klammrarna ligger direkt intill varandra. FREE-badgen är ALLTID grön
  // (2–4 rundor är gratis oavsett subscription-status).
  const freeBracketLeft = ((min - min) / range) * RULER_WIDTH - 13;
  const freeBracketRight = ((ROUNDS_MAX_PASS - min) / range) * RULER_WIDTH + 13;
  const freeBracketWidth = freeBracketRight - freeBracketLeft;

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
      {hasBracket && (
        <>
          {/* Label ovanför klammern — förklarar kravet för >4 rundor.
              Absolutpositionerad över klammerns horisontella span så texten
              centreras exakt ovanför klammern. height + marginTop reserverar
              layout-platsen som flow-element så bracket-blocket hamnar under. */}
          <View style={{ marginTop: 4, height: 10, position: 'relative' }}>
            <View
              style={{
                position: 'absolute',
                left: bracketLeft,
                width: bracketWidth,
                alignItems: 'center',
              }}
            >
              <Text style={roundsRulerStyles.requiredHint}>
                Required to apply more than 4 rounds:
              </Text>
            </View>
          </View>
          {/* height tar plats för bracket (top 0, height 10) + premium-badge
              (top 14, ~18px hög) → ~32px. Bracket är absolutpositionerad så
              wrapper:n behöver explicit höjd för att inte kollapsa. Badgen
              sitter i en absolutpositionerad centrerad wrapper över samma
              bracket-bredd så den auto-centrerar oavsett innehållsbredd. */}
          <View style={{ marginTop: 0, height: 34 }}>
            {/* FREE-klammer (2–4 rundor) — direkt intill premium-klammern.
                Alltid grön, ingen press-handler (gratis-tier kräver inget). */}
            <View style={[roundsRulerStyles.bracket, {
              left: freeBracketLeft,
              width: freeBracketWidth,
              borderColor: Colors.success,
            }]} />
            <View
              style={{
                position: 'absolute',
                top: 14,
                left: freeBracketLeft,
                width: freeBracketWidth,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={roundsRulerStyles.freeBadge}>
                <Text style={roundsRulerStyles.freeBadgeText}>FREE</Text>
              </View>
            </View>
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {/* "Individual device +" — grön när IndDev aktivt, röd annars. */}
              <Text style={[roundsRulerStyles.individualDeviceText, { color: indivActive ? Colors.success : Colors.error }]} numberOfLines={1}>
                Individual device +
              </Text>
              {/* hasBracket => interactive => onPremiumPress definierad. Säkert
                  att rendera direkt utan onPremiumPress-presence-fallback.
                  Badge:n följer subscription-status: guld + svart text när
                  hasSubscription, grå + vit text annars. */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPremiumPress}
                hitSlop={8}
                style={[roundsRulerStyles.premiumBadge, { backgroundColor: badgeBg }]}
              >
                <Text style={[roundsRulerStyles.premiumBadgeText, { color: badgeTextColor }]}>
                  PREMIUM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
  // FREE-CTA under FREE-klammern — speglar premiumBadge:s form (borderRadius 4,
  // 8/2 padding, 10px/700/0.6 text) men grön bg + vit text. Alltid grön.
  freeBadge: {
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  // "Individual device +" framför PREMIUM-badgen under klammern.
  // Färg sätts inline (grön/röd beroende på indivActive) — ingen statisk färg här.
  individualDeviceText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Label ovanför klammern — förklarar kravet för >4 rundor.
  requiredHint: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
