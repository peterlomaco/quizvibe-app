// Full-screen "Update required" gate — Build 40 OTA variant (2026-11-26).
// Rendered last in app/_layout.tsx as a plain View (not a Modal).
// See src/utils/minSupportedBuild.ts.
'use no memo';

import { useSyncExternalStore } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { QuizVibeLogo } from '@/src/components/QuizVibeLogo';
import { Colors, FontSize, Radius, Spacing } from '@/src/theme';
import {
  getUpdateRequiredMessage,
  isUpdateRequired,
  subscribeUpdateRequired,
} from '@/src/utils/minSupportedBuild';

const APP_STORE_ID = '6772559846';
const STORE_URL_NATIVE = `itms-apps://apps.apple.com/app/id${APP_STORE_ID}`;
const STORE_URL_WEB = `https://apps.apple.com/app/id${APP_STORE_ID}`;

async function openStore(): Promise<void> {
  try {
    await Linking.openURL(STORE_URL_NATIVE);
  } catch {
    try {
      await Linking.openURL(STORE_URL_WEB);
    } catch (err) {
      console.warn('[UpdateRequired] could not open App Store:', err);
    }
  }
}

export function UpdateRequiredScreen() {
  const required = useSyncExternalStore(subscribeUpdateRequired, isUpdateRequired, isUpdateRequired);
  if (!required) return null;
  const message =
    getUpdateRequiredMessage() ??
    'A new version of QuizVibe is available. Please update the app to continue playing.';
  return (
    <View style={styles.cover} accessibilityViewIsModal>
      <View style={styles.content}>
        <QuizVibeLogo size={104} />
        <Text style={styles.title}>Update required</Text>
        <Text style={styles.body}>{message}</Text>
        <Pressable
          onPress={() => void openStore()}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Update</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  content: { alignItems: 'center', gap: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '700', textAlign: 'center' },
  body: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  btn: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  btnText: { color: '#000', fontSize: 17, fontWeight: '700' },
});
