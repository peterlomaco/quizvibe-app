import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptik finns bara på riktiga iOS/Android-enheter (inte web, inte simulator).
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Fire-and-forget lätt vibration vid tryck. Följer den befintliga
 * `void Haptics.impactAsync(Light)`-konventionen i appen.
 *
 * Enhetlig "light impact" används på ALLT man trycker — knappar, länkar,
 * switchar, checkboxar, val, info-ikoner och den anpassade knappsatsen —
 * per Peters beslut (uniform känsla, ingen differentiering).
 */
export function tapHaptic() {
  if (!supported) return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptik ej tillgänglig på enheten/bygget — ignorera tyst.
  }
}
