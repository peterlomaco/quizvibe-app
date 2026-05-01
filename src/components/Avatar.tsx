import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontWeight } from '../theme';
import { DEFAULT_AVATAR_EMOJI } from '../utils/avatars';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';

interface AvatarProps {
  uri?: string;
  emoji?: string;
  /** Used to derive initials when neither uri nor emoji is provided */
  name?: string;
  size?: number;
  selected?: boolean;
  style?: ViewStyle;
  /**
   * När true och avataren saknar custom emoji/uri (eller har default-
   * silhouetten 👤) renderas QuizVibe Q-marken med ansikte istället för
   * silhouetten. Används för registrerade users — gäster lämnas utan
   * proppen så de behåller silhouetten som visuell guest-signal.
   * Q-marken renderas vid 70% av containerstorleken så Q + svans
   * ryms inom den cirkulära containerns inscribed-circle utan att
   * klippas i hörnet.
   */
  useBrandFallback?: boolean;
}

export function Avatar({
  uri,
  emoji,
  name,
  size = 56,
  selected,
  style,
  useBrandFallback,
}: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const isDefaultEmoji = !emoji || emoji === DEFAULT_AVATAR_EMOJI;
  const showBrand = useBrandFallback && !uri && isDefaultEmoji;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.selected,
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: size / 2 }]}
        />
      ) : showBrand ? (
        <QuizVibeQAvatar size={Math.round(size * 0.7)} />
      ) : emoji ? (
        <Text style={{ fontSize: size * 0.46, lineHeight: size * 0.58 }}>
          {emoji}
        </Text>
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.34 }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selected: {
    borderColor: Colors.primary,
    borderWidth: 2.5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initials: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
});