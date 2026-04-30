import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import { loadProfile, type ProfileData } from '../utils/profileStorage';

interface Props {
  /**
   * Tap-handler för login-pillen. Lämna ofylld på skärmar där pillen är
   * rent informativ (t.ex. Profile-sidan, där användaren redan är där
   * pillen skulle navigera till) — då renderas pillen som en plain View
   * istället för TouchableOpacity.
   */
  onPress?: () => void;
  /**
   * Optional kontrollerad profil. Skärmar med in-place-login (som Home,
   * där pillen och login-modalen lever på samma skärm) måste passera
   * sin profil här så bannern uppdateras direkt när profilen ändras —
   * useFocusEffect-self-load triggar inte eftersom skärmen aldrig
   * tappar focus. Skärmar som bara läser profilen (Lobby, Profile)
   * kan utelämna proppen och låta bannern self-loada via useFocusEffect.
   */
  profile?: ProfileData | null;
}

/**
 * Full-bredd-band överst på en skärm med en login-pill i högra hörnet.
 * Pillen visar inloggad användares avatar + playerName (eller "Register or
 * Login" när profil saknas). När `profile`-proppen utelämnas läses den
 * via AsyncStorage på focus så den uppdateras när användaren ändrar
 * playerName/avatar i Profile-tabben och sedan kommer tillbaka.
 */
export function TopUserBanner({ onPress, profile: profileProp }: Props) {
  const [internalProfile, setInternalProfile] = useState<ProfileData | null>(null);
  const isControlled = profileProp !== undefined;

  useFocusEffect(
    useCallback(() => {
      if (isControlled) return;
      let active = true;
      loadProfile().then((data) => {
        if (active) setInternalProfile(data);
      });
      return () => {
        active = false;
      };
    }, [isControlled]),
  );

  const profile = isControlled ? profileProp : internalProfile;
  const isLoggedIn = !!profile;
  const pillStyle = [
    styles.loginPill,
    isLoggedIn ? styles.loginPillActive : styles.loginPillMuted,
  ];
  const iconText = isLoggedIn ? getAvatarEmojiById(profile?.selectedAvatarId) : '👤';
  const labelText = isLoggedIn ? (profile?.playerName?.trim() || 'Signed in') : 'Register or Login';
  const labelStyle = [
    styles.loginPillText,
    isLoggedIn ? styles.loginPillTextActive : styles.loginPillTextMuted,
  ];

  return (
    <View style={styles.topBoard}>
      {onPress ? (
        <TouchableOpacity style={pillStyle} activeOpacity={0.7} onPress={onPress}>
          <Text style={styles.loginPillIcon}>{iconText}</Text>
          <Text style={labelStyle} numberOfLines={1}>
            {labelText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={pillStyle}>
          <Text style={styles.loginPillIcon}>{iconText}</Text>
          <Text style={labelStyle} numberOfLines={1}>
            {labelText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBoard: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Vänsterjustera innehållet så avatar/ikon alltid sitter mot vänster
    // kant av pillen — då hamnar avatarbilden på samma position oavsett
    // om man är inloggad eller utloggad.
    justifyContent: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    // Fast minWidth motsvarar "Register or Login"-textens bredd så pillen
    // håller samma storlek både utloggad och inloggad.
    minWidth: 165,
    maxWidth: 200,
  },
  loginPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  loginPillMuted: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  loginPillIcon: {
    fontSize: 14,
  },
  loginPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginPillTextActive: {
    color: Colors.primary,
  },
  loginPillTextMuted: {
    color: Colors.textSecondary,
  },
});
