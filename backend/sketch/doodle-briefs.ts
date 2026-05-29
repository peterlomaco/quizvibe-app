// "Signature Doodle"-briefs — Creative Director-författade ritningsbeskrivningar.
//
// STRATEGISK PIVOT (2026-05-29): vi går FRÅN foto-derivat (edges/canny i
// generate.ts) TILL ren text-till-bild-doodle utan källfoto. Exakt likhet är
// inte längre målet — en stiliserad doodle som FÅNGAR det ikoniska räcker,
// eftersom de 4 progressiva ledtrådarna bär resten av igenkänningen.
//
// PREMIUM SPOT-COLOR-STIL (2026-05-29, senast): första drafterna såg ut som
// barnsliga klotter. Vi siktar nu på "professional clean-cut minimalist VECTOR
// ILLUSTRATION / corporate game art asset" (Peters art-direction-blueprint, se
// buildDoodlePrompt i doodle.ts) med strategisk SPOT COLOR på det mest ikoniska
// attributet + framtvingade identifierande detaljer (nummer/bindel/utrustning).
//
// Varje brief är input till backend/sketch/doodle.ts:
//   - `concept`       = pose/action-meningen (silhuett, rörelse, vinkel).
//   - `spotColor`     = DEN enskilt mest ikoniska attributet + dess platta färg
//                       (resten förblir svart line-art). MAX ETT dominant.
//   - `jerseyNumber`  = ikoniskt tröjnummer (slottas i blueprintens [NUMBER]).
//                       MÅSTE vara faktiskt korrekt; lämna undefined när inget.
//   - `details`       = övrig avgörande utrustning (bindel/mustasch/instrument/
//                       neutralisering av kit-färg). Faktiskt korrekt eller tom.
//   - `clues`         = de 4 progressiva ledtrådarna i Q:t (spel-metadata).
//
// CREATIVE-DIRECTOR-CHECKLISTA per person (Peters ram 2026-05-29) — känneteckna
// via KARAKTÄRSDRAG, INTE ansiktslikhet (ouppnåeligt med text-till-bild):
//   0. ALDRIG ANSIKTE (hård regel) — pose alltid bakifrån/bortvänt huvud så
//      inga ansiktsdrag syns; ett AI-ansikte är inte personen → vilseledande.
//      Concept MÅSTE formuleras face-away (jfr Valderrama/Zlatan).
//   1. FRISYR/siluett — ofta starkaste signalen (Valderramas afro). Bygg posen
//      så håret/siluetten bär; visa inte ansiktet om det inte tillför.
//   2. SIGNATURFÄRGER — spot-color (se färgval-regel nedan).
//   3. SIFFROR — ikoniskt tröjnummer (jerseyNumber + numberColor).
//   4. SIGNATUR-GEST/POSE — Brolins spinn-leap, Zlatans bicycle-kick, Freddies
//      knytnäve+mic-stativ (i concept).
//   5. ATTRIBUT/REKVISITA — kaptensbindel, instrument, glasögon (details).
//   6. BAKGRUNDS-HINT (mest skådespelare) — subtil rekvisita/miljö som hintar en
//      känd roll (backgroundHint). Små + sekundära, ej upphovsrättsskyddad exakt
//      film-rekvisita. Idrottare: tomt → ren vit botten.
// FÄRGVAL-REGEL (max EN dominant): 1) personlig trademark (hår/plagg) > 2) ikonisk
// kit-färg > 3) signaturaccessoar. Undvik FÄRG-KROCK — neutralisera sekundära
// element så det ENA spot-elementet dominerar.

export type DoodleSubject = 'athlete' | 'artist' | 'band' | 'actor';

/** De 4 progressiva ledtrådarna (visas i ordning inne i Q:t). */
export interface DoodleClues {
  /** Ledtråd 1 — typ: 'Sport' | 'Music' | 'Film'. */
  category: 'Sport' | 'Music' | 'Film';
  /** Ledtråd 2 — peak-era, t.ex. "1990s". */
  era: string;
  /** Ledtråd 3 — ursprungsland (nationalitet, INTE igenkännings-region). */
  country: string;
  /** Ledtråd 4 — 1-2 ord starkt förknippade med personen. */
  recognition: string;
}

export interface DoodleBrief {
  /** kebab-case, matchar katalog-id + asset-filnamn. */
  id: string;
  displayName: string;
  subject: DoodleSubject;
  /** Pose/action-meningen (vinkel + rörelse). Inga skyddade kostymer/karaktärer. */
  concept: string;
  /**
   * DET enskilt mest ikoniska attributet + dess PLATTA färg, formulerat så att
   * ENDAST detta färgläggs och resten är svart line-art.
   */
  spotColor: string;
  /** Valfri sekundär spot-färg — sparsamt (annars tappas "spot"-känslan). */
  spotColorSecondary?: string;
  /** Ikoniskt tröjnummer (blueprintens [NUMBER]). Faktiskt korrekt, annars undefined. */
  jerseyNumber?: string;
  /** Nummer-färg (default 'black'). T.ex. 'blue' för Colombias blåa "10". */
  numberColor?: string;
  /** Övriga avgörande detaljer (bindel/instrument/kit-neutralisering). */
  details: string;
  /**
   * Subtila bakgrunds-ledtrådar — särskilt för skådespelare (t.ex. en svag
   * rekvisita/miljö som hintar om en känd roll). Tomt/undefined → ren vit botten
   * (default för idrottare). Håll små + sekundära så svaret inte avslöjas för lätt,
   * och undvik upphovsrättsskyddade exakta film-rekvisita.
   */
  backgroundHint?: string;
  /** Komponera in en deterministisk horisontell snurr-pil (piruett-indikator).
   * Ritas av oss (sharp), INTE av Flux (modellen klarar inte abstrakta pilar). */
  spinArrow?: boolean;
  clues: DoodleClues;
}

// --- Startuppsättning (Creative Director-författad) ---------------------------

export const DOODLE_BRIEFS: DoodleBrief[] = [
  {
    id: 'carlos-valderrama',
    displayName: 'Carlos Valderrama',
    subject: 'athlete',
    // REN BAKIFRÅN — ansiktslikhet är ouppnåelig med text-till-bild (Peter
    // 2026-05-29, valde n1), så vi visar INTE ansiktet. Den gigantiska afro-
    // siluetten + nummer + kit + bindel bär igenkänningen; ledtrådarna resten.
    concept:
      'a footballer viewed from directly behind in a dynamic mid-dribble action pose with a football at his feet, his head facing away from the viewer, the enormous voluminous afro silhouette dominating the figure, subtle motion lines',
    // Primär spot-färg = den gigantiska afron (gyllengul). Sekundär = den klassiska
    // gula Colombia-tröjan + blå shorts (Peter 2026-05-29 — mer igenkännbart än
    // neutral vit tröja). Afro-tonen hålls aningen varmare/gyllene så den läser
    // mot den klargula tröjan.
    spotColor:
      'the enormous, voluminous afro haircut is bright golden-BLONDE (clearly light blonde hair, NOT brown or auburn) — his unmistakable signature feature',
    spotColorSecondary:
      'the classic football kit is a solid bright yellow jersey with solid blue shorts',
    jerseyNumber: '10',
    numberColor: 'blue',
    // Ingen mustasch här — rygg-pose, ansiktet syns inte (se concept).
    details:
      'a blue collar/neckline on the yellow jersey; a solid red captain\'s armband on the upper left arm',
    clues: { category: 'Sport', era: '1990s', country: 'Colombia', recognition: 'The Afro' },
  },
  {
    id: 'tomas-brolin',
    displayName: 'Tomas Brolin',
    subject: 'athlete',
    // INGET ANSIKTE — bakifrån/bortvänt. Signatur = SNURR-firningen med EN arm
    // rakt upp (pekande mot skyn medan han snurrar) — Brolins ikoniska mål-gest.
    // Ren upprätt pose — snurr-pilen ritas deterministiskt av oss (spinArrow), ej Flux.
    concept:
      'a stocky, compact footballer seen from behind, jumping straight up upright in a joyful goal celebration with ONE arm raised vertically straight above his head, hand pointing directly up over the top of his head; head turned away so no face is visible, short wavy hair; sharp crisp flat linework',
    // Spot-färg = gula landslagströjan (Sverige) + blå shorts. Inget nummer
    // enforced (osäkert → utelämnas; lägg till om Peter bekräftar Brolins nummer).
    spotColor:
      'the jersey is a solid, vibrant yellow (Sweden national team)',
    spotColorSecondary: 'solid blue shorts',
    jerseyNumber: '11',
    numberColor: 'blue',
    details: '',
    spinArrow: true,
    clues: { category: 'Sport', era: '1990s', country: 'Sweden', recognition: "Italia '90" },
  },
  {
    id: 'diego-maradona',
    displayName: 'Diego Maradona',
    subject: 'athlete',
    concept:
      'a short, compact footballer with dark curly mullet hair leaping with one hand raised near a football above his head, intense dynamic pose',
    // Spot-färg = de ikoniska Argentina-ränderna (kit-färgen ÄR signaturen här).
    spotColor:
      'the jersey has solid sky-blue and white vertical stripes (Argentina)',
    jerseyNumber: '10',
    details: '',
    clues: { category: 'Sport', era: '1980s', country: 'Argentina', recognition: 'Hand of God' },
  },
  {
    id: 'zlatan-ibrahimovic',
    displayName: 'Zlatan Ibrahimović',
    subject: 'athlete',
    // INGET ANSIKTE — bakifrån/bortvänt. Siluett-signatur = mörkt hår i en NÄT
    // man-bun (top-knot) baktill. Pose = dynamiskt sparkmoment mot bollen (n2 valdes
    // över bicycle-kicken, som inte läste rätt). "10" på ryggen.
    concept:
      'a tall, athletic footballer seen from behind with his head turned away so no face is visible, his dark hair tied up in a neat man-bun (top-knot) at the back of the head, captured mid-action striking the ball with a raised leg, dynamic and athletic, motion lines',
    spotColor:
      'the jersey is a solid, vibrant yellow (Sweden national team)',
    spotColorSecondary: 'solid blue shorts',
    jerseyNumber: '10',
    numberColor: 'blue',
    details: '',
    clues: { category: 'Sport', era: '2010s', country: 'Sweden', recognition: 'The Kick' },
  },
  {
    id: 'freddie-mercury',
    displayName: 'Freddie Mercury',
    subject: 'artist',
    concept:
      'a male singer with a short dark moustache gripping a microphone on a short cut-off mic stand held aloft like a sceptre, one fist raised triumphantly to the sky, mid power-pose on stage',
    // Trademark stage-look (inte upphovsrättsskyddad karaktär) = gul jacka.
    spotColor:
      'his iconic stage jacket is a solid, vibrant yellow; white trousers',
    details: 'a short, thick dark moustache; a white studded armband on the wrist',
    clues: { category: 'Music', era: '1980s', country: 'UK', recognition: 'The Stance' },
  },
  {
    id: 'abba',
    displayName: 'ABBA',
    subject: 'band',
    concept:
      'four pop musicians (two women, two men) standing in a row in flamboyant flared 70s glam outfits and platform boots, two holding microphones, cheerful retro group pose',
    spotColor:
      'the glam satin outfits are solid powder-blue and white',
    details: 'tall platform boots; one electric guitar',
    clues: { category: 'Music', era: '1970s', country: 'Sweden', recognition: 'Glam jumpsuits' },
  },
];

export function findBrief(id: string): DoodleBrief | undefined {
  return DOODLE_BRIEFS.find((b) => b.id === id);
}
