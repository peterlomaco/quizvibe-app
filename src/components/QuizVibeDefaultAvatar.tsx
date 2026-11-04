import React from 'react';
import { View } from 'react-native';
import { QuizVibeMarkQOnlySvg } from './brand/QuizVibeBrandSvg';

// Default-avatar (2026-10-20): EN källa för alla storlekar — vektor-Q:t ur
// Brand Master-geometrin (QuizVibeMarkQOnlySvg = ring + handtag, utan de tre
// signalbågarna). Ingen PNG. Huvudloggan (QuizVibeMarkSvg/Home) är orörd.
// `smile` (Peter 2026-11-04): glad gubbe i ringen — används där Q:t är
// SPELARENS avatar, inte där det är ett varumärkesmärke (rumskort, DJ-kort).

/** Bara Q-silhuetten. `size` = höjd i pt. `color` = enfärgad (t.ex. dämpad) variant; utelämnad = metallguld. */
export function QuizVibeAvatarQ({ size, color, smile = false }: { size: number; color?: string; smile?: boolean }) {
  return <QuizVibeMarkQOnlySvg size={size} color={color} smile={smile} />;
}

/**
 * Default-avatar: förenklat guld-Q centrerat i en cirkel med diametern `size`.
 * `framed` ritar den mörka navy-cirkeln + subtil guldkant själv (för ställen
 * som inte redan har en avatar-container, t.ex. menyhuvuden och förhandsvisning).
 */
export function QuizVibeDefaultAvatar({
  size,
  framed = false,
  color,
  markScale = 0.56,
  offsetY = 0,
  smile = false,
}: {
  size: number;
  framed?: boolean;
  color?: string;
  /** Q-höjd som andel av cirkeln (default 0.56). */
  markScale?: number;
  /** Lokal vertikal justering i pt (negativ = uppåt). */
  offsetY?: number;
  /** Glad gubbe i ringen — spelarens default-avatar. */
  smile?: boolean;
}) {
  return (
    <View
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        framed && {
          borderRadius: size / 2,
          backgroundColor: '#152238',
          borderWidth: 1,
          borderColor: 'rgba(245,166,35,0.35)',
        },
      ]}
    >
      <View style={offsetY ? { transform: [{ translateY: offsetY }] } : undefined}>
        <QuizVibeAvatarQ size={Math.round(size * markScale)} color={color} smile={smile} />
      </View>
    </View>
  );
}
