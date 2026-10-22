import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '@/src/components/haptic';
import { LoadingContent } from './LoadingContent';
import { BrandUi, Colors, Radius } from '../theme';
import { METALLIC_GOLD_EDGE, MetallicGoldFill } from './MetallicGoldFill';

interface Props {
  label: string;
  onPress?: () => void;
  /**
   * Låst/väntande läge: grå knapp (appens "ej upplåst"-vokabulär), ingen
   * puls, inget tap. Används även för passiva vänte-texter.
   */
  locked?: boolean;
  /** Innehåll efter labeln, t.ex. <SequentialDots /> i ett vänteläge. */
  trailing?: React.ReactNode;
  /** Innehåll före labeln, t.ex. appens spinner i "Preparing lobby…". */
  leading?: React.ReactNode;
  accessibilityLabel?: string;
  /** Asynkront anrop pågår: spinner i stället för labeln, tap avstängt. */
  loading?: boolean;
  /** Lägre (50 pt) + dämpad guldmitt — Get Ready:s Press Play. */
  compact?: boolean;
}

/**
 * Guld-fylld CTA i exakt samma stil som Home:s "Start New Game" i inloggat
 * läge (gameBtn + gameBtnUser): 56 pt hög, Radius.md, guld bakgrund + kant,
 * svart Nunito_700Bold 17 pt, puls 1 ↔ 1.03 / 900 ms. Ersätter de gamla
 * Q-play-loggorna på Lobby:s Start Game och Get Ready:s Press Play
 * (Peter 2026-10-15).
 */
export function GoldCtaButton({ label, onPress, locked = false, trailing, leading, accessibilityLabel, loading = false, compact = false }: Props) {
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (locked || loading) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [locked, loading, pulse]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity
        style={[styles.btn, compact && styles.btnCompact, locked && styles.btnLocked]}
        activeOpacity={0.85}
        onPress={onPress}
        disabled={locked || loading || !onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked, busy: loading }}
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {!locked && <MetallicGoldFill tone={compact ? 'soft' : 'default'} />}
        <LoadingContent loading={loading} color="#000000">
        <View style={styles.row}>
          {leading}
          <Text
            style={[
              styles.text,
              locked && styles.textLocked,
              { fontFamily: fontsLoaded ? 'Nunito_700Bold' : undefined },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
          {trailing}
        </View>
        </LoadingContent>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: Radius.md,
    // Metallisk gradient ritas av MetallicGoldFill; bakgrundsfärgen är bara
    // fallback under första framen.
    backgroundColor: Colors.warning,
    borderWidth: 1,
    borderColor: METALLIC_GOLD_EDGE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnCompact: {
    height: 50,
  },
  // Låst/väntande (Lobby v2): mörk gunmetal + svag kant i stället för den
  // gamla blå cardElevated-ytan.
  btnLocked: {
    backgroundColor: '#141C2B',
    borderColor: BrandUi.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  textLocked: {
    color: BrandUi.textMuted,
  },
});
