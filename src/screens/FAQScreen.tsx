import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { TopUserBanner } from '../components/TopUserBanner';
import { SectionToggle } from '../components/SectionToggle';
import { ChevronIcon } from '../components/ChevronIcon';
import { MusicNoteIcon } from '../components/CategoryIcons';
import {
  ControllerOutlineIcon,
  DevicesOutlineIcon,
  GlobeOutlineIcon,
  LockOutlineIcon,
  RocketOutlineIcon,
  StarOutlineIcon,
  TargetOutlineIcon,
  TicketOutlineIcon,
} from '../components/SectionIcons';
import { subscriptionFeatures } from './StoreScreen';
import { getCachedFeatureGates } from '../utils/featureGates';
import { guestHostCanPlayAllAtOnce } from '../utils/entitlements';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';

// ─── Data ───────────────────────────────────────────────────────────────────
// Q&A:s härleds från det som är dokumenterat i koden + CLAUDE.md. Inga
// promises om feature:s som inte finns. Uppdatera när nya features
// landar eller när support-tickets visar att en Q saknas. Behåll
// språket på svenska — målgruppen är V1 svensk-igenkänning.

interface FaqItem {
  q: string;
  a: string;
  // När true renderas Premium-vs-Basic-jämförelsekortet under svarstexten —
  // samma kort (och samma SUBSCRIPTION_FEATURES-data) som Store:ns "QuizVibe
  // membership"-sektion. Renderas i komponenten, inte här, eftersom `styles`
  // deklareras efter denna array (TDZ vid inline-JSX på modulnivå).
  membershipCard?: boolean;
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
        a: 'A social quiz game about music and film. Guess the release year on song and movie clips, or the name behind an artist or band from a set of progressive hints. Play solo (Single Player), with friends in the same room — on one shared phone (Pass-the-Phone) or on everyone\'s own phone (Individual device) — or challenge a friend remotely (Head-to-head).',
      },
      {
        q: 'Do I need an account to play?',
        a: 'No. You can join a game as a guest with a Room Code + a Player Name, and you can even host a game as a guest — a trial version with fixed settings (YouTube clips only, 30 seconds to answer). To save game history, host with your own settings, play Head-to-head, or get Premium, you need to register an account.',
      },
      {
        q: 'What is the age minimum?',
        a: '15 years. The content in QuizVibe includes material rated for ages 15 and above. You provide a year of birth at registration, which is used to set sensible default game settings (such as the era range for your games) and your competition age.',
      },
      {
        q: 'How do I get started fastest?',
        a: '(1) Tap Start New Game on the Home screen and choose how to play — Single Player, Multiplayer or Head-to-head, (2) share the Room Code with friends or tap Invite friends in the Lobby, (3) approve players who join, (4) tap Start Game. Friends join with Join a Game on their Home screen. As a registered user you get a set of free Host Game Credits that refresh every day.',
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
        q: 'What is the difference between Pass-the-Phone and Individual device?',
        a: 'Both are Multiplayer modes. Pass-the-Phone (free): all players share one phone and take turns — the quiz pauses between turns so you can pass it on. Individual device (free): each player has their own phone and answers the same question at the same time.',
      },
      {
        q: 'What is Single Player mode?',
        a: 'A way to play on your own. Tap Start New Game on the Home screen and choose Single Player — the Lobby then opens locked to one player, so you can start right away without approving anyone.',
      },
      {
        q: 'What is the difference between Host and non-host?',
        a: 'Host is the player who created the room and controls all settings: Game Mode, Era, Number of Rounds, which packages are used, which media sources the questions are drawn from (YouTube/Spotify clips and/or Hints), and the maximum answer response time. A non-host is any other player in the room — they join via Room Code and see the Host\'s settings read-only. A non-host can be a registered QuizVibe user or a Guest.',
      },
      {
        q: 'What is a Guest?',
        a: 'A Guest is a player who is not a registered QuizVibe user. You can join a game as a Guest with just a Player Name and Year of birth, or host a trial game as a Guest — but Guest games don\'t save any Player history or HCP, and some features (Head-to-head, Hints, Extra packages, more rounds) require a registered account. A Guest can be either the Host or a non-host in a room.',
      },
      {
        q: 'What settings does a guest-hosted game use?',
        a: 'A game hosted as a Guest is a trial with fixed settings, so the Lobby only shows Players in Lobby and Quiz Tuning:\n• Questions: YouTube clips only (music and film) — no Hints or Spotify.\n• Answer time: always 30 seconds.\n• Assistance level: always Full.\n• Rounds: 2 or 4. You can still choose the Game Era.\n• Multiplayer is Pass-the-Phone only, up to 4 players.\n• Parent Control is always on, so mature content is kept out.\nRegister a free QuizVibe account to unlock all settings.',
      },
      {
        q: 'How many players can be in one room?',
        a: 'Up to 4 players per room. With Premium, Individual device games can have up to 12 players (Pass-the-Phone is always max 4). Single Player is one player and Head-to-head is two.',
      },
      {
        q: 'Does Individual device require Premium?',
        a: 'No — Individual device is free for everyone. Premium unlocks extra capacity in Individual device games: up to 12 players per room and up to 20 rounds per game (the free limit is 4 players and 4 rounds). Here is everything Premium adds:',
        membershipCard: true,
      },
    ],
  },
  {
    id: 'connection',
    emoji: '📡',
    title: 'Connection & Devices',
    items: [
      {
        q: 'Do all players need internet?',
        a: 'Yes, every player needs a stable internet connection throughout the game (WiFi recommended; 4G/5G works too). YouTube clips stream directly from YouTube and need bandwidth to play.',
      },
      {
        q: 'What happens if my connection drops mid-game?',
        a: 'In Pass-the-Phone only the Host\'s phone needs to be online — if the Host loses internet, the game pauses until the connection is back. In Individual device games, a player with an unstable connection is flagged in the Lobby, and the Host is warned before starting while someone\'s connection is unstable.',
      },
      {
        q: 'What WiFi strength is recommended?',
        a: 'For Pass-the-Phone: normal 4G/5G or WiFi is enough. For Individual device: every player needs stable WiFi or 4G/5G on their own phone — YouTube buffering on one player\'s phone does not affect the others.',
      },
      {
        q: 'Why can\'t I join a room?',
        a: 'Common reasons: (1) Room Code misspelled — check against the Host\'s screen, (2) the Lobby is full (4 players, or up to 12 in a Premium Individual device game), (3) the Host has deleted the Lobby, (4) the Host has already started the game without you, (5) it is a Single Player lobby, or a Head-to-head match (which requires a QuizVibe account).',
      },
    ],
  },
  {
    id: 'generations',
    emoji: '🎵',
    title: 'Content & questions',
    items: [
      {
        q: 'Why do some questions play a clip and others show hints?',
        a: 'QuizVibe has two question types: song and movie clips from YouTube/Spotify (answer = the release year, or for films one of the main actors) and Hints — a country flag plus progressive clues about a person or band (answer = the name). The Host tunes which sources are used in the Lobby\'s Quiz Mixer, but at least one source must always be active. Hints are only available when a registered QuizVibe user hosts the game — guest-hosted games use YouTube clips only.',
      },
      {
        q: 'Can questions be based on Spotify?',
        a: 'Yes. In Individual device games the Host can turn on Spotify DJ in the Source Mixerboard. For a Spotify question one player becomes the DJ and opens the track in the Spotify app on their own phone; everyone else listens and guesses the release year or the artist name. You don\'t need Spotify Premium, but the Spotify app should be installed on the DJ\'s phone.',
      },
      {
        q: 'Why do I sometimes get questions from before my time?',
        a: 'The Host sets the Game Era — a year range that acts as a hard limit on which clips can appear. If the Host picks an era outside your own lifespan (e.g. 1950-1970), you\'ll get questions from that era. Hint questions about people are not limited by era. Tip: agree on an era everyone recognizes before you start.',
      },
      {
        q: 'What are Extra packages?',
        a: 'Extra packages let the Host focus a game on a specific theme (for example Melodifestivalen or Hip Hop & RnB). They are included with QuizVibe Premium — a Premium Host activates them in the Lobby or in Profile settings. With a package active, the Game Era can be narrowed within the package’s years, minimum 25 years (15 years without a package). Themes might be changed over time.',
      },
      {
        q: 'What is Parent Control?',
        a: 'Parent Control filters out content that may not suit children, and blocks Extra packages marked as parent controlled (for example Hip Hop & RnB). When you register a QuizVibe account, Parent Control is turned off by default. You can turn it on anytime in Profile settings → Host default settings, and the Host can also switch it on or off in the Lobby for each game. Games hosted as Guest always have Parent Control on.',
      },
      {
        q: 'Why did a clip not play, or look different than before?',
        a: 'Please be aware that we don\'t own the external material (YouTube and Spotify). Clips can be changed, removed or blocked in your region over time, so some may not work as expected. If a clip can\'t be played, QuizVibe picks another question for you. We appreciate your understanding — enjoy, it\'s just a game! If you find anything that doesn\'t work as it should, please contact info@quizvibe.se and attach screenshots.',
      },
    ],
  },
  {
    id: 'hcp',
    emoji: '🎯',
    title: 'HCP',
    items: [
      {
        q: 'What is HCP?',
        a: 'HCP (handicap) is your skill rating in QuizVibe, on a scale from 99 (beginner) down to 1 (elite) — the lower the number, the better. Every registered player starts at 99 and earns their way down by playing. You have a separate HCP for Music and for Film/TV, plus a Total (the average of the two), each shown as a coloured shield on your Profile, on the Lobby player cards, and after each game on the leaderboard.',
      },
      {
        q: 'How does my HCP change?',
        a: 'It follows your recent form. The game looks at your last 10 answers on each assistance level, per category: consistently strong games lower your HCP (you improve), weaker games raise it. A new player\'s HCP holds steady until they\'ve played a few games, then it moves continuously. A single game can never move it by more than 10 points. Your HCP also rises on its own if you stop playing — see below.',
      },
      {
        q: 'How do I earn HCP faster?',
        a: 'Challenge yourself — the less help you use and the wider the era you play, the more each good game counts:\n• Assistance level: Minimal earns the most, then Standard, then Full. With less help a strong result moves your HCP more (and a weak result costs you less).\n• Game Era: a wider year range is harder to place, so a wide era earns more than a narrow one.\nSo a great game on Minimal assistance across a wide Game Era moves your HCP the most.',
      },
      {
        q: 'What happens to my HCP if I stop playing?',
        a: 'It rises automatically — HCP is a rating of current form, so it drifts back toward beginner while you are away. For every full week without a game your HCP goes up by 0.5 points (about 2 points a month), until it reaches 99.\nThis happens per category, each on its own clock: if you keep playing Music but not Film/TV, only your Film/TV HCP rises — which still pulls your Total down, since the Total is the average of the two. Playing a single game in a category resets that category\'s clock. Nothing you have earned is wiped; you just need to keep playing to hold your level.',
      },
      {
        q: 'Do guests earn HCP?',
        a: 'No. HCP is earned only when you play signed in to your own account. Guest games, guest-hosted games, and simply watching the leaderboard don\'t change anyone\'s HCP.',
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
        a: 'Each game you start as Host consumes 1 credit. You get a set of free credits each day — they refresh automatically every midnight CET. With a Premium subscription you have unlimited host games and no credits are consumed. Joining and playing in games hosted by others is always unlimited and free.',
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
        a: 'Premium vs the free Basic plan — the same comparison shown under "QuizVibe Premium" in the Store:',
        membershipCard: true,
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
        a: 'Apple handles all refunds. You can request a refund via reportaproblem.apple.com. QuizVibe doesn\'t have access to payment decisions.',
      },
      {
        q: 'How does the subscription work?',
        a: 'QuizVibe Premium is a single monthly plan that auto-renews until you cancel. During the launch period Premium is offered for free — activate it from the Store. The monthly subscription price applies once the launch offer ends.',
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
        a: 'Go to Profile and scroll to the bottom → Delete Account, then slide to confirm. (You can also tap your Player Name at the top right of the Profile screen → Delete Account.) Everything is permanently deleted: profile, game history, subscription binding, friends, pending invites. Cannot be undone.',
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
        a: 'Player Name, email, your year of birth (used to set default game settings and competition age), selected settings (assistance level, host defaults), friends you have added, and game history (correct answers + response times). No location data, no contacts, no social media links. Full list in the Privacy Policy.',
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
        a: 'A setting in Host default settings on Profile and in the Lobby (Host only). It controls the regional scope of the question selection. The V1 catalog covers Sweden, so Region Scope is effectively fixed to Sweden in this version.',
      },
      {
        q: 'Does QuizVibe work outside Sweden?',
        a: 'The app is currently focused on Swedish recognition.',
      },
    ],
  },
];

// ─── Komponent ──────────────────────────────────────────────────────────────

// Kategori-ikoner (UI 2026-10-21): outline-familjen från Profile (24-grid,
// 1.8-streck, dämpad vit) ersätter de färgglada emojierna. Data-filens
// emoji-fält lämnas orört men renderas inte längre.
// ---------------------------------------------------------------------------
// Multiplayer v2-copy (Step 7). FAQ_CATEGORIES ovan är legacy-texten (PROD tills
// flaggan slås på). Med gaten på skrivs svaren om: två frågor ersätts helt,
// resten via fras-ersättningar (specifika fraser först, generiska namnbyten sist).
// ---------------------------------------------------------------------------

const V2_DIFFERENCE_Q = 'What is the difference between Pass-the-Phone and Individual device?';
const V2_PREMIUM_Q = 'Does Individual device require Premium?';

function faqCategories(): FaqCategory[] {
  const gates = getCachedFeatureGates();
  if (!gates.multiplayerV2) return FAQ_CATEGORIES;
  const allAtOnceFree = gates.allAtOnce === 'everyone';
  const guestAllAtOnce = guestHostCanPlayAllAtOnce(gates);
  const phrases: [string, string][] = [
    [
      "on one shared phone (Pass-the-Phone) or on everyone's own phone (Individual device)",
      "taking turns (1 by 1) or answering at the same time on everyone's own phone (All at Once)",
    ],
    [
      "In Pass-the-Phone only the Host's phone needs to be online",
      "When everyone plays on the Host's phone, only that phone needs to be online",
    ],
    ['In Individual device games, a player', 'When players use their own phones, a player'],
    ['For Pass-the-Phone: normal', "On the Host's phone only: normal"],
    ['For Individual device: every player', 'On their own phones: every player'],
    [
      '• Multiplayer is Pass-the-Phone only, up to 4 players.',
      guestAllAtOnce
        ? '• Multiplayer is 1 by 1 or All at Once, up to 4 players.'
        : '• Multiplayer is 1 by 1 only, up to 4 players.',
    ],
    ['Individual device', 'All at Once'],
    ['Pass-the-Phone', '1 by 1'],
  ];
  const rewrite = (text: string) => phrases.reduce((t, [from, to]) => t.split(from).join(to), text);

  return FAQ_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      if (item.q === V2_DIFFERENCE_Q) {
        return {
          q: 'What is the difference between 1 by 1 and All at Once?',
          a: "Both are Multiplayer games, and the Lobby picks the right one from how players join. When you join a game you choose whether you play on your own phone or on the Host's phone.\n• 1 by 1: players take turns answering — on the Host's phone, or on their own phone when it is their turn. Up to 4 players and 4 rounds.\n• All at Once: everyone answers the same question at the same time on their own phone.\nIf anyone plays on the Host's phone the game is 1 by 1. The Host can also choose 1 by 1 when everyone has their own phone. Spotify DJ always plays All at Once.",
        };
      }
      if (item.q === V2_PREMIUM_Q) {
        return {
          ...item,
          q: 'Does All at Once require Premium?',
          a: allAtOnceFree
            ? 'No — All at Once is free for everyone. Premium unlocks extra capacity in All at Once games: up to 12 players per room and up to 20 rounds per game (the free limit is 4 players and 4 rounds). Here is everything Premium adds:'
            : 'Yes — All at Once requires QuizVibe Premium, which also allows up to 12 players per room and up to 20 rounds per game. Without Premium, Multiplayer games are played 1 by 1 (up to 4 players and 4 rounds). Here is everything Premium adds:',
        };
      }
      return { ...item, q: rewrite(item.q), a: rewrite(item.a) };
    }),
  }));
}

const CATEGORY_ICONS: Record<string, (props: { size?: number; color?: string }) => React.ReactElement> = {
  'getting-started': RocketOutlineIcon,
  'game-modes': ControllerOutlineIcon,
  connection: DevicesOutlineIcon,
  generations: MusicNoteIcon,
  hcp: TargetOutlineIcon,
  credits: TicketOutlineIcon,
  premium: StarOutlineIcon,
  account: LockOutlineIcon,
  region: GlobeOutlineIcon,
};

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
      {/* Pillen öppnar samma sheet som på Home (Register or Login / profil-
          menyn) — via Home:s ?openProfileMenu=1-deeplink. */}
      <TopUserBanner
        onBackPress={handleBack}
        backLabel="Back"
        onPress={() => router.replace('/?openProfileMenu=1' as never)}
      />
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

        {faqCategories().map((category) => {
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
                <View style={styles.categoryIcon}>
                  {(() => {
                    const Icon = CATEGORY_ICONS[category.id];
                    return Icon ? <Icon size={24} color={BrandUi.iconMuted} /> : null;
                  })()}
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {/* Samma +/−-kontroll som Profile-sektionerna. */}
                <SectionToggle expanded={isCategoryOpen} />
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
                          <View style={{ width: 22, alignItems: 'center' }}>
                            <ChevronIcon size={18} color={isOpen ? Colors.warning : BrandUi.iconMuted} direction={isOpen ? 'up' : 'down'} />
                          </View>
                        </Pressable>
                        {isOpen && (
                          <View>
                            <Text style={styles.answerText}>{item.a}</Text>
                            {item.membershipCard && (
                              <View style={styles.featureList}>
                                {subscriptionFeatures().map((feature) => (
                                  <View key={feature.premium} style={styles.featureRow}>
                                    <Text style={styles.featureCheck}>✓</Text>
                                    <View style={styles.featureTextWrap}>
                                      <Text style={styles.featurePremium}>{feature.premium}</Text>
                                      <Text style={styles.featureBasic}>Basic: {feature.basic}</Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
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
          Missing an answer? Email{' '}
          <Text
            style={styles.footnoteLink}
            onPress={() => { void Linking.openURL('mailto:info@quizvibe.se'); }}
            accessibilityRole="link"
          >
            info@quizvibe.se
          </Text>{' '}
          and we&apos;ll add the question here if it&apos;s of general value.
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
    marginBottom: Spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  // Samma mått som Profile:s sectionHeaderIcon (28×28 runt 24-ikonen).
  categoryIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Tydligt under sidtiteln (24/700): 17 semibold.
  categoryTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    // Profile v2: låg kontrast — luft bär separationen, inte linjen.
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Q&A-kort som visas när kategorin är expanded. Innehåller alla Q:s
  // för kategorin, separerade med tunna dividers. Per-Q expand/collapse
  // sker inom kortet — ingen återbruk av legalCard-styling eftersom
  // kategorin har egen visuell scope.
  questionsCard: {
    // Samma yta som Profile:s Legal-kort.
    backgroundColor: BrandUi.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    color: BrandUi.iconMuted,
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Premium-vs-Basic-jämförelsekort — speglar StoreScreen:s featureList 1:1
  // (samma SUBSCRIPTION_FEATURES-data importeras). Renderas under svaret på
  // "What is included in Premium?".
  featureList: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  featureCheck: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    width: 16,
    marginTop: 1,
  },
  featureTextWrap: {
    flex: 1,
    gap: 2,
  },
  featurePremium: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  featureBasic: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  footnote: {
    ...Typography.caption,
    color: BrandUi.textMuted,
    marginTop: Spacing.xl,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 20,
  },
  // Kontaktadressen = det interaktiva elementet (öppnar mejlappen).
  footnoteLink: {
    color: Colors.warning,
    textDecorationLine: 'underline',
  },

  bottomPad: { height: Spacing.xl },
});
