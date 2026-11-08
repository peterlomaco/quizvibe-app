import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { QuizVibeDialog } from './QuizVibeDialog';
import { BrandUi, Colors, FontSize, FontWeight, Spacing } from '../theme';

/**
 * InfoDialog — QuizVibe-styled popup for info icons (ⓘ), replacing native
 * Alert.alert / quizVibeAlert there (Peter 2026-11-07).
 *
 * Built on QuizVibeDialog (a plain RN <Modal> per screen — the pattern that
 * renders reliably on device; the global quizVibeAlert host does not).
 *
 * Body format: paragraphs separated by a blank line. A paragraph written as
 * "Term: text" renders the term in bold white and the text muted, which keeps
 * mode / level lists compact. The body scrolls once it is long.
 */

export interface InfoContent {
  title: string;
  message: string;
  /** Optional second action (e.g. Spotify "How it works"). With an action the
   *  buttons are Close + action; without, a single OK. */
  action?: { label: string; onPress: () => void };
}

const BODY_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.55);
// Delay before running an action that opens another Modal — two RN Modals at
// once can be swallowed on iOS (the modal-swap trap).
const ACTION_DELAY_MS = 350;
// Term = a short label (≤ 24 chars, e.g. "All at Once", "Individual device").
// Longer leads like "Which source each round uses: …" stay plain sentences.
const TERM_RE = /^([^:\n]{1,24}):\s+([\s\S]+)$/;

function InfoBody({ message }: { message: string }) {
  const paragraphs = message.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} bounces={false}>
      {paragraphs.map((p, i) => {
        const m = TERM_RE.exec(p);
        return m ? (
          <Text key={i} style={styles.paragraph}>
            <Text style={styles.term}>{m[1]}: </Text>
            {m[2]}
          </Text>
        ) : (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        );
      })}
    </ScrollView>
  );
}

/** One info dialog per screen: render `infoDialog` once at the screen root and
 *  call `showInfo(...)` from the info icons. */
export function useInfoDialog() {
  const [content, setContent] = useState<InfoContent | null>(null);
  const showInfo = useCallback((c: InfoContent) => setContent(c), []);
  const close = useCallback(() => setContent(null), []);

  const action = content?.action;
  const infoDialog = (
    <QuizVibeDialog
      visible={content !== null}
      title={content?.title ?? ''}
      message=""
      body={content ? <InfoBody message={content.message} /> : null}
      primaryLabel={action ? action.label : 'OK'}
      secondaryLabel={action ? 'Close' : undefined}
      onPrimary={() => {
        setContent(null);
        if (action) setTimeout(action.onPress, ACTION_DELAY_MS);
      }}
      onClose={close}
    />
  );
  return { showInfo, infoDialog };
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: BODY_MAX_HEIGHT,
    flexGrow: 0,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: BrandUi.textMuted,
  },
  term: {
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
