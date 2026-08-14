// Responsiva mått för quiz-vyns fråge-skärm.
//
// Bor i en egen modul eftersom BÅDE app/quiz.tsx (fixed-top-zonens styles)
// och MediaPlayer-providern måste räkna med exakt samma mediamått. De hade
// tidigare var sin kopia av formeln — tyst divergens-risk, och kortet klipper
// iframen så fort talen glider isär.
//
// Två OBEROENDE begränsningar styr layouten, och båda har bränt oss:
//
//   1. BREDD — YouTube-iframen är alltid 16:9. Se QUIZ_MEDIA_W/H nedan.
//   2. HÖJD — fråge-vyn är [fixed-top: media + timer + stopwatch + frågekort]
//      + [ScrollView: svarsalternativ] + [sticky Confirm-bar]. Fixed-top har
//      naturlig höjd och krymper inte (flexShrink default 0 i RN), medan
//      ScrollView:n har flex: 1 (= flexBasis 0 + shrink). När summan
//      överstiger skärmen kollapsar alltså ALLTID scroll-zonen först — och
//      när den nått 0 trycks sticky-baren utanför skärmen.
//
// Modulen löser båda genom att räkna i stället för att gissa: mediarutan får
// exakt 16:9 av sin faktiska bredd, och allt annat skalas mot hur mycket
// höjd som verkligen är kvar efter safe area.
//
// ⚠ Måtten läses EN gång vid import. Appen är portrait-låst (app.json) så
// fönstret ändras inte under körning; skulle den låsas upp måste det här bli
// en hook.

import { Dimensions } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const WIN = Dimensions.get('window');
const SCREEN_W = WIN.width;
const SCREEN_H = WIN.height;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// `initialWindowMetrics` är en native-konstant som går att läsa synkront redan
// vid import — alltså riktiga insets på modulnivå, där useSafeAreaInsets inte
// är möjlig (StyleSheet är inte en komponent). Fallback-estimatet per era
// gäller bara om native-modulen saknas (web/Expo Go-edge-fall).
const INSETS = initialWindowMetrics?.insets;
const INSET_V = INSETS ? INSETS.top + INSETS.bottom : SCREEN_H >= 800 ? 93 : 20;

/** Höjden som faktiskt är kvar åt quiz-layouten efter notch + home indicator. */
export const QUIZ_USABLE_H = SCREEN_H - INSET_V;

// Höjden full-size-layouten är ritad för (≈ iPhone 14/15/16: 852 pt fönster
// minus 93 pt safe area). Allt mindre skalas ned proportionellt i stället för
// att falla i diskreta hinkar — en 716 pt-enhet ska inte tvingas välja mellan
// "SE-liten" och "för stor".
const REF_H = 760;
const RATIO = QUIZ_USABLE_H / REF_H;

/**
 * Skala för höjder, padding och gaps. Får gå ner till 0.66 — vitytor tål
 * mycket mer nedskalning än text innan något blir oanvändbart.
 */
export const QUIZ_SPACE_SCALE = clamp(RATIO, 0.66, 1);

/**
 * Skala för typsnitt. Golvet är MEDVETET högre (0.82) — läsbarheten är
 * viktigare än ytan, och frågetexten har dessutom `adjustsFontSizeToFit`
 * som sista utväg.
 */
export const QUIZ_TEXT_SCALE = clamp(RATIO, 0.82, 1);

/** Skala ett höjd-/padding-mått. `qh(56)` → 56 på referensskärm, mindre nedåt. */
export const qh = (v: number) => Math.round(v * QUIZ_SPACE_SCALE);

/** Skala ett typsnittsmått. */
export const qf = (v: number) => Math.round(v * QUIZ_TEXT_SCALE);

// ── Mediarutan ───────────────────────────────────────────────────────────────
//
// ⚠ YouTube-iframen är ALLTID 16:9 av sin BREDD. react-native-youtube-iframe
// renderar wrapper-HTML med `padding-bottom: 56.25%` och `iframe { height:
// 100% }` — `height`-propen sizear bara RN-View:n runt omkring, den styr inte
// spelaren. Är kortet lägre än 9/16 × bredden kapas spelarens nederkant av
// `overflow: hidden`. Det var precis buggen på breda enheter: ett fast 220 pt-
// kort mot 414 pt bredd (iPhone XR/11/8 Plus) gav 233 pt spelare → 13 pt
// klippt, och 428 pt (Pro Max) → 21 pt. Smala enheter (375–390 pt) råkade
// klara sig, vilket är varför det såg ut att bara drabba "vissa enheter".
//
// Därför: härled höjden ur bredden, och när höjdbudgeten inte räcker till
// full bredd — krymp BREDDEN också, så 16:9 hålls och spelaren letterboxas
// horisontellt i stället för att kapas.

/** Vad full skärmbredd skulle kosta i höjd vid 16:9. */
const FULL_WIDTH_16_9 = Math.round((SCREEN_W * 9) / 16);

// Höjdbudget: allt utom mediarutan i fixed-top-zonen (timer + stopwatch +
// frågekort + gaps) plus sticky-baren, samt en minsta svarsyta som fortfarande
// går att svepa i. Referensvärdena är uppmätta på full-size-layouten och
// skalas med samma faktor som styles:en de beskriver.
const NON_MEDIA_H = qh(315);
const ANSWER_MIN_H = qh(165);
const HEIGHT_BUDGET = QUIZ_USABLE_H - NON_MEDIA_H - ANSWER_MIN_H;

/** Mediarutans höjd — 16:9 av full bredd, kapad av höjdbudgeten. */
export const QUIZ_MEDIA_H = Math.round(
  clamp(Math.min(FULL_WIDTH_16_9, HEIGHT_BUDGET), 120, FULL_WIDTH_16_9),
);

/**
 * Mediarutans bredd. Lika med skärmbredden när höjdbudgeten räcker; annars
 * smalare så att 16:9 bevaras. Kortet runt om är fortfarande fullbrett —
 * skillnaden blir letterbox i kortets bakgrundsfärg, inte kapat innehåll.
 */
export const QUIZ_MEDIA_W = Math.min(SCREEN_W, Math.round((QUIZ_MEDIA_H * 16) / 9));

/**
 * Höjd på hints-/bild-kortet och Spotify-kortens `minHeight`.
 *
 * Till skillnad från YouTube-kortet är det här VÅR egen komponent utan
 * iframe, så 16:9 är ingen tvingande regel — hint-listan har egen intern
 * scroll och tappar inget innehåll av en lägre ruta. Vi låter det därför
 * skalas ned ett extra steg på korta skärmar och lämna höjden till
 * svarsalternativen, medan YouTube-kortet måste hålla sin aspect.
 */
export const QUIZ_IMAGE_CARD_H = qh(QUIZ_MEDIA_H);
