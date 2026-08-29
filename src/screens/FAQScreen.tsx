import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { TopUserBanner } from '../components/TopUserBanner';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';

// ─── Data ───────────────────────────────────────────────────────────────────
// Q&A:s härleds från det som är dokumenterat i koden + CLAUDE.md. Inga
// promises om feature:s som inte finns. Uppdatera när nya features
// landar eller när support-tickets visar att en Q saknas. Behåll
// språket på svenska — målgruppen är V1 svensk-igenkänning.

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  emoji: string;
  title: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    emoji: '🚀',
    title: 'Getting started',
    items: [
      {
        q: 'What is QuizVibe?',
        a: 'A social quiz game where you guess years on music clips and names on images. Play with friends in the same room (Pass-the-Phone) or on separate phones (Individual Devices — free for everyone).',
      },
      {
        q: 'Do I need an account to play?',
        a: 'No. You can join a game as a guest by entering a Room Code + a Player Name. To host your own games, save game history, or buy Premium, you need to register an account.',
      },
      {
        q: 'What is the age minimum?',
        a: '15 years. The content in QuizVibe includes material rated for ages 15 and above. You provide a year of birth at registration which we use to match the generation category that fits your recognition — we do not store your actual age, only the generation category you play as.',
      },
      {
        q: 'How do I get started fastest?',
        a: '(1) Tap Create Game on the Home screen, (2) share the Room Code with friends or invite them from the Lobby, (3) approve players who join, (4) tap Start Game. You get 2 Free Host Game Credits per day.',
      },
      {
        q: 'Does QuizVibe work on Android?',
        a: 'QuizVibe is currently developed for iOS only and is available on the App Store. An Android version is not available at this time.',
      },
      {
        q: 'Does QuizVibe work on older iPhones?',
        a: 'QuizVibe requires a reasonably recent version of iOS. On older iPhones or older iOS versions some layout elements may not display correctly and the overall game experience may be reduced. For the best experience we recommend keeping iOS updated to the latest version.',
      },
    ],
  },
  {
    id: 'game-modes',
    emoji: '🎮',
    title: 'Game modes',
    items: [
      {
        q: 'What is the difference between Pass-the-Phone and Individual Devices?',
        a: 'Pass-the-Phone (free): all players share one phone and take turns — the quiz pauses between rounds so you can pass it on. Individual Devices (free): each player has their own phone and answers the same question in parallel.',
      },
      {
        q: 'What is Single Player mode?',
        a: 'A checkbox above the Game Mode toggle. Tick it to play alone — the multiplayer options dim and you only need to approve your own card before Start Game.',
      },
      {
        q: 'What is the difference between Host and Guest?',
        a: 'Host is the player who created the room and controls all settings: Game Mode, Era, Number of Rounds, which packages are used, which media source the questions are drawn from (YouTube clips and/or images), and the maximum answer response time. Guest joins via Room Code and sees the Host\'s settings read-only.',
      },
      {
        q: 'How many players can be in one room?',
        a: 'Max 4 players per room for free Hosts. Premium Hosts can have up to 12 players.',
      },
      {
        q: 'Does Individual Devices require Premium?',
        a: 'No — Individual Devices is free for all registered users. Premium unlocks extra capacity: up to 12 players per room and up to 20 rounds per game (instead of the free limit of 4 players and 4 rounds in Pass-the-Phone).',
      },
    ],
  },
  {
    id: 'connection',
    emoji: '📡',
    title: 'Connection & Individual Devices',
    items: [
      {
        q: 'Do all players need internet?',
        a: 'Yes, every player needs a stable internet connection throughout the game (WiFi recommended; 4G/5G works too). YouTube clips stream directly from YouTube and need bandwidth to play.',
      },
      {
        q: 'What happens if my connection drops mid-game?',
        a: 'In Pass-the-Phone only the Host\'s phone needs to be online — if the Host loses internet, the game pauses until the connection is back. In Individual Devices the system flags an "unstable peer" on the affected player and can block Start Game if anyone has red peer-health.',
      },
      {
        q: 'What WiFi strength is recommended?',
        a: 'For Pass-the-Phone: normal 4G/5G or WiFi is enough. For Individual Devices: all players should be on the same WiFi network or have stable 4G/5G — YouTube buffering on one player does not affect others.',
      },
      {
        q: 'Why can\'t I join a room?',
        a: 'Common reasons: (1) Room Code misspelled — check against the Host\'s screen, (2) the Lobby is full (4 players for free Host, 12 for Premium), (3) the Host has deleted the Lobby, (4) the Host has already started the game without you.',
      },
    ],
  },
  {
    id: 'generations',
    emoji: '🎵',
    title: 'Generations & content',
    items: [
      {
        q: 'How is my generation determined?',
        a: 'Based on the year you provided at registration: Elder (1925-1964), Gen X (1965-1980), Millennials (1981-1996), Gen Z (1997-2012), Gen Alpha (2013-). You automatically get a free "Play as <Your Generation>" package. If you later update your birth year and cross into a different generation, your free Play-as package is automatically swapped to match the new generation.',
      },
      {
        q: 'Why do I sometimes get questions I don\'t recognize from my generation?',
        a: 'Recognition depends on two things: (a) the generations of the players in the lobby — we prioritize items tagged for those generations, and (b) Game Era — the Host picks a year range that acts as a hard limit. If the Host picks an era outside your generation (e.g. 1950-1970 when you were born in 2011), the selection will be items from that era regardless of your generation, because Era is always respected. You can also enable a different "Play as X" package (e.g. "Play as Elder" or "Play as Millennials") to override the generic generation-based pool — that tells the app to specifically include items recognized by that generation, useful when the Game Era falls outside your own lifespan and you still want a recognizable mix.',
      },
      {
        q: 'What is a "Theme Package"?',
        a: 'Theme Packages are purchasable extra packages you can select to make a game round specifically focused on a certain theme. Theme packages will be available continously — they are parked for the V1 launch and arrive in v1.1+. Right now everyone gets the free generation package that matches the year they chose at registration.',
      },
      {
        q: 'Why do some questions have video and others have an image?',
        a: 'We have two question types covering our three main categories (Music, Film, Sport): YouTube clips (answer = year) and images of artists, actors, and athletes (answer = name). The Host can disable YouTube or images in the Lobby\'s Game Connections block, but at least one source must be active.',
      },
    ],
  },
  {
    id: 'credits',
    emoji: '🎫',
    title: 'Host Game Credits',
    items: [
      {
        q: 'What are Host Game Credits?',
        a: 'Each game you start as Host consumes 1 credit. You get 2 free credits per day — they refresh automatically every midnight CET. With a Premium subscription you have unlimited host games and no credits are consumed. Joining and playing in games hosted by others is always unlimited and free.',
      },
      {
        q: 'When do I get my daily free credits?',
        a: 'At midnight CET (Central European Time, same as Swedish time except during the summer/winter DST shift). The refresh triggers the first time you open Profile or Lobby after midnight — if the app is open across midnight without you visiting one of those screens, the top-up happens at next focus.',
      },
      {
        q: 'What happens when I have 0 credits left?',
        a: 'Start Game is blocked with a popup giving you two options: wait for the next daily refresh at midnight CET, or upgrade to a Premium subscription in the Store (unlimited host games).',
      },
      {
        q: 'Are credits spent if my game is interrupted?',
        a: 'The credit is deducted at Start Game tap. If you delete the lobby or the game is interrupted for technical reasons, the credit is not refunded in the current version — so don\'t go back to the Lobby unless you plan to continue.',
      },
    ],
  },
  {
    id: 'premium',
    emoji: '⭐',
    title: 'Premium subscription',
    items: [
      {
        q: 'What is included in Premium?',
        a: 'Unlimited Host Games (no daily cap), up to 12 players per Lobby, and longer quiz games (up to 20 rounds instead of 4). Individual Devices is free for all users.',
      },
      {
        q: 'How do I restore purchases on a new phone?',
        a: 'Go to the Store screen and scroll down to the "Restore Purchases" button at the bottom. It reads your Apple ID\'s previous purchases and reactivates the subscription if you have an active one.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Subscriptions are handled by Apple — go to iPhone Settings → your name → Subscriptions → QuizVibe → Cancel Subscription. QuizVibe cannot cancel subscriptions on your behalf (Apple policy).',
      },
      {
        q: 'Can I get a refund?',
        a: 'Apple handles all refunds. You can request a refund via reportaproblem.apple.com or via iPhone Settings → Wallet → your subscription. QuizVibe doesn\'t have access to payment decisions.',
      },
      {
        q: 'What subscription lengths are available?',
        a: '1 month (79 kr), 3 months (199 kr), 6 months (279 kr), or 12 months (399 kr ≈ 33 kr/mo — saves 58% vs monthly). All auto-renew until you cancel.',
      },
    ],
  },
  {
    id: 'account',
    emoji: '🔐',
    title: 'Account & privacy',
    items: [
      {
        q: 'How do I delete my account?',
        a: 'Tap your Player Name pill (top right corner) → Delete Account. Everything is permanently deleted: profile, game history, subscription binding, friends, pending invites. Cannot be undone.',
      },
      {
        q: 'Where do I find the Privacy Policy and Terms of Service?',
        a: 'On the Profile screen: scroll down to the Legal section and tap the +-toggle. Both documents open in a secure in-app browser.',
      },
      {
        q: 'Can I change my Player Name?',
        a: 'Not in the current version — Player Name is set at registration and shown read-only on Profile. If you absolutely need to change it: delete the account and register a new one with the desired name (you will lose game history and subscription binding).',
      },
      {
        q: 'What data is saved about me?',
        a: 'Player Name, email, the generation category you play as (Elder / Gen X / Millennials / Gen Z / Gen Alpha — this determines which content you receive and does not need to reflect your actual age), selected settings (assistance level, host defaults), friends you have added, and game history (points + response times). Your actual age or date of birth is never stored. No location data, no contacts, no social media links. Full list in the Privacy Policy.',
      },
      {
        q: 'How do I stop friends from seeing me?',
        a: 'You don\'t need to approve friends — other players add you by typing your exact Player Name. To be "invisible" to a specific friend, ask them to remove you from their Friends list (you can also remove them from yours).',
      },
      {
        q: 'Who is behind QuizVibe?',
        a: 'QuizVibe is operated by LoMaCo AB (org. no. 559388-9511), a company registered in Sweden. Contact: info@quizvibe.se. Full details are in the Privacy Policy and Terms of Service under Legal.',
      },
    ],
  },
  {
    id: 'region',
    emoji: '🌍',
    title: 'Region',
    items: [
      {
        q: 'What does "Region Scope" mean?',
        a: 'A setting available in Profile defaults and on the Lobby screen (host-only). It controls the regional scope of the question selection. The V1 catalog covers Sweden, so Region Scope is effectively fixed to Sweden in this version.',
      },
      {
        q: 'Does QuizVibe work outside Sweden?',
        a: 'The app is currently focused on Swedish recognition.',
      },
    ],
  },
];

// ─── Komponent ──────────────────────────────────────────────────────────────

export default function FAQScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const from = typeof params.from === 'string' ? params.from : undefined;

  // Två nivåer av expand-state: kategori (id → bool) och Q (id-q-index → bool).
  // Båda default-kollapsade — användaren öppnar kategorin först, scannar
  // Q-rubrikerna, tappar Q för att se A. Ingen persistens över sessions —
  // re-collapsas vid skärmbyte (samma mönster som ProfileScreen-sektionerna).
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleQuestion = (key: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Back-routing: samma mönster som StoreScreen. Försök router.back() först
  // (bevarar Profile/Home:s state intakt), fall tillbaka till explicit
  // replace mot `?from=`-param när no history, sista utväg = Home.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (from && typeof from === 'string') {
      router.replace(from as never);
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopUserBanner onBackPress={handleBack} backLabel="Back" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.headerSubtitle}>
            Tap a category to expand it, then tap a question to read the answer.
          </Text>
        </View>

        {FAQ_CATEGORIES.map((category) => {
          const isCategoryOpen = expandedCategories.has(category.id);
          return (
            <View key={category.id} style={styles.categoryWrap}>
              <Pressable
                onPress={() => toggleCategory(category.id)}
                style={({ pressed }) => [
                  styles.categoryHeader,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.toggleBox}>
                  <Text style={styles.toggleChevron}>{isCategoryOpen ? '−' : '+'}</Text>
                </View>
              </Pressable>
              {!isCategoryOpen && <View style={styles.sectionDivider} />}

              {isCategoryOpen && (
                <View style={styles.questionsCard}>
                  {category.items.map((item, idx) => {
                    const qKey = `${category.id}-${idx}`;
                    const isOpen = expandedQuestions.has(qKey);
                    return (
                      <View key={qKey}>
                        <Pressable
                          onPress={() => toggleQuestion(qKey)}
                          style={({ pressed }) => [
                            styles.questionRow,
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text style={styles.questionText}>{item.q}</Text>
                          <Text style={styles.questionChevron}>{isOpen ? '−' : '+'}</Text>
                        </Pressable>
                        {isOpen && <Text style={styles.answerText}>{item.a}</Text>}
                        {idx < category.items.length - 1 && (
                          <View style={styles.questionDivider} />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.footnote}>
          Missing an answer? Email info@quizvibe.se and we'll add
          the question here if it's of general value.
        </Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  headerBlock: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Kategori-rubrik-rad. Speglar ProfileScreen:s gameConnectionsHeaderRow:
  // emoji + titel vänster, +/−-toggle-box höger. Ingen aktiv border när
  // kollapsad — sectionDivider under raden ger separation istället.
  categoryWrap: {
    marginBottom: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  categoryEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  categoryTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  toggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleChevron: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Q&A-kort som visas när kategorin är expanded. Innehåller alla Q:s
  // för kategorin, separerade med tunna dividers. Per-Q expand/collapse
  // sker inom kortet — ingen återbruk av legalCard-styling eftersom
  // kategorin har egen visuell scope.
  questionsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  questionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  questionChevron: {
    fontSize: 22,
    color: Colors.textSecondary,
    lineHeight: 22,
    width: 22,
    textAlign: 'center',
  },
  answerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    paddingBottom: Spacing.md,
    paddingRight: Spacing.lg,
    lineHeight: 22,
  },
  questionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  footnote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },

  bottomPad: { height: Spacing.xl },
});
