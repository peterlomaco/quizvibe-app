import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BrandUi } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** 'right' = navigerings-rad, 'down' = öppnar en meny. */
  direction?: 'right' | 'down' | 'up';
  strokeWidth?: number;
}

/**
 * Tunn chevron på samma 24-grid och streckvikt (1.8) som nav-ikonerna
 * (ProfileOutlineIcon / ShoppingCartIcon). Neutral-dämpad som default.
 */
export function ChevronIcon({ size = 16, color = BrandUi.iconMuted, direction = 'right', strokeWidth = 1.8 }: Props) {
  const d =
    direction === 'down' ? 'M6 9 L12 15 L18 9' : direction === 'up' ? 'M6 15 L12 9 L18 15' : 'M9 6 L15 12 L9 18';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
