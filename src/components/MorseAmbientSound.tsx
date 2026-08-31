import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Ljus "appen är igång"-slinga via Web Audio API.
//
// Ersatte 2026-08-24 den låga moll-padden (Am→F→C→G, 98–220 Hz) som Peter
// upplevde som tung/dyster. Nu: mjuka music-box-plingar i C-dur över den
// glada pop-kadensen C → G → Am → F, som korta plingar i stället för en
// drone — det är anslaget, inte registret, som gör att den läser som "liv i
// appen".
//
// ETT lager: pluck — triangelvåg + en oktav ovanpå (sinus, låg gain) genom
// ett lowpass. Snabb attack (8 ms) + exponentiell decay ger klockkaraktär
// utan hårda övertoner.
//
// INGEN pad. Ett viskande sinus-lager under plingarna testades 2026-08-24 och
// togs bort direkt (Peter): det gjorde slingan till en oavbruten bakgrundston,
// vilket var precis det den gamla drone-padden dömdes ut för.
//
// Slingan är MEDVETET gles — en fras på fyra toner följt av 2 s TYSTNAD innan
// nästa ackord. Det är en närvaro-signal som pickar till då och då, inte musik
// som ligger på. Kör den utan paus och den blir bakgrundsmusik igen.
//
// TVÅ KLANGVARV (Peter 2026-08-24, ersatte takt-rampen): fraserna växlar
// mellan en DÄMPAD och en MÖRK röst — samma toner, samma 4-takt, men den
// mörka ligger en oktav ned med dovare lowpass och nästan ingen oktav-
// shimmer. Kontrasten ligger alltså i KLANG, inte i tempo.
//
// MÖRKNINGEN skedde i tre pass 2026-08-24 (Peter). Först dämpades varv 1:s
// filter (lpf 2600 → 1700 → 1450, shine 0.22 → 0.11). När filtren väl låg
// nära varandra bar oktaven hela kontrasten, så sista passet sänkte i
// stället BÅDA varven ett helt oktavsteg: 1.0/0.5 → 0.5/0.25. Grundtonerna
// ligger nu på 175–523 Hz (varv 1) och 87–262 Hz (varv 2).
//
// ⚠ Varv 2:s grundton ligger UNDER vad en mobilhögtalare återger. Den hörs
// via oktaven ovanför (175–523 Hz), varför 'shine' är uppskruvad där
// (0.09 → 0.20) och gain lyft till 1.60. Låter varv 2 tunt eller frånvarande
// snarare än mörkt på riktig enhet är felet registret, inte volymen — ta då
// tillbaka det till octave 0.5 och låt filtret bära skillnaden i stället.
//
// ⚠ 'octave' är BARA 1.0 eller 0.5 — aldrig något däremellan. Enbart
// oktavtransponering bevarar harmoniken; en kvint eller kvart ned skulle
// transponera frasen och låta som att progressionen modulerar mitt i
// slingan. Vill man ha ett mellanläge i ljusstyrka är det lpf/shine/decay
// som är rattarna, inte registret.
//
// ⚠ Takten är FAST (STEP, 550 ms) i båda varven — det är hela poängen med
// ändringen. Den tidigare takt-rampen (3 fraser som stegrades) dämpades i tre
// omgångar (42 % → 24 % → 15 %) innan den ströks helt: varje hörbar stegring
// läste som att något höll på att hända i spelet. Sådant hör hemma i
// nedräkningen (CountdownIntro), inte här. Återinför inte en ramp.
//
// Klangvarven (2 långa) och ackordföljden (4 lång) löper OBEROENDE, så varje
// ackord får konsekvent samma röst: C ljus, G mörk, Am ljus, F mörk → repris
// var fjärde fras. Progressionen andas därmed ljus/mörk fram och tillbaka.
//
// Look-ahead-schemaläggare (25 ms-intervall, 0.4 s framförhållning) i stället
// för setTimeout-per-ackord: setTimeout driftar och gav hörbar glapp/överlapp
// mellan varven i den gamla versionen.

// ⚠ UTTONING I STÄLLET FÖR TEARDOWN (2026-08-26, Peter: "det klickar eller
// piper till ibland när man trycker start game"). Att avmontera WebView:n
// river AudioContext:en synkront — ligger en pluck och ringer (decay 1.7–1.9 s
// av en 4.2 s-cykel, dvs. ~80 % av tiden) kapas vågformen mitt i och ger ett
// hörbart klick i högtalaren. Därför tar komponenten en `active`-prop:
// föräldern LÅTER DEN VARA MONTERAD och flippar `active` i stället, varpå
// master-gain rampas till noll på 300 ms och contexten suspendas först när
// alla toner klingat ut. Det ~20 %-fönster där ingenting lät är hela
// förklaringen till att klicket bara hördes "ibland".
//
// ⚠ Avmontera ALDRIG komponenten medan `active` är true — då är vi tillbaka
// i den hårda teardownen. Ska ljudet sluta: sätt `active={false}` och låt
// elementet ligga kvar på samma plats i trädet. I quiz.tsx betyder det att
// intro- och countdown-grenarna renderar den i SAMMA barn-position, så
// React behåller instansen över fasbytet i stället för att riva den.

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;
  var master = null;
  var delaySend = null;
  var chordIndex = 0;
  var voiceIndex = 0;
  var nextChordTime = 0;
  var started = false;
  var suspendTimer = null;
  // Startläget injiceras före sid-laddning (window.__qvActive). Är den false
  // skapas ingen AudioContext alls — en tyst enhet ska inte betala för en.
  var active = (window.__qvActive !== false);

  // C → G → Am → F (I–V–vi–IV). Arpeggio-toner, lågt index spelas först.
  var CHORDS = [
    [523.25, 659.25, 783.99, 1046.50], // C  : C5 E5 G5 C6
    [392.00, 493.88, 587.33,  783.99], // G  : G4 B4 D5 G5
    [440.00, 523.25, 659.25,  880.00], // Am : A4 C5 E5 A5
    [349.23, 440.00, 523.25,  698.46], // F  : F4 A4 C5 F5
  ];

  // Två klangvarv. Samma toner och samma takt — bara register och filter
  // skiljer. 'gain' kompenserar att mörkare klang uppfattas svagare i
  // mobilhögtalare; 'decay' är längre i den mörka så frasen får ringa ut.
  // Filtren är skalade med registret — halveras tonhöjden måste cutoff
  // följa med, annars försvinner dämpningen (den skulle bara sitta ovanför
  // det som faktiskt låter). 'shine' är däremot HÖJD i det låga läget: det
  // är oktaven ovanför grundtonen som bär ljudet i en mobilhögtalare, se
  // varningen överst.
  var VOICES = [
    { octave: 0.50, lpf:  900, shine: 0.14, decay: 1.70, gain: 1.30 }, // dämpad
    { octave: 0.25, lpf:  750, shine: 0.20, decay: 1.90, gain: 1.60 }, // mörk
  ];

  var STEP      = 0.55;                    // sekunder mellan plingarna — FAST
  var REST      = 2.0;                     // tystnad mellan fraserna
  var LOOKAHEAD = 0.40;                    // schemalägg så här långt fram
  var MASTER    = 0.30;                    // full volym
  var FADE_OUT  = 0.30;                    // uttoning vid active=false
  var FADE_IN   = 0.15;                    // intoning vid active=true
  // Längsta decay (1.9 s) + delay-svans, med marginal: först när allt tystnat
  // suspendas contexten. Suspend tidigare fryser toner mitt i utklingningen
  // och de skulle då återuppstå vid nästa resume.
  var TAIL_MS   = 2600;

  function buildDelay() {
    var del  = ctx.createDelay(1.0);
    var fb   = ctx.createGain();
    var send = ctx.createGain();
    // Fast tid — delayTime får INTE moduleras per fras (abrupt byte ger
    // pitch-warble i delay-linjen). 0.275 = halvt steg mot 550 ms-takten.
    del.delayTime.value = 0.275;
    fb.gain.value       = 0.22;
    send.gain.value     = 0.22;
    send.connect(del);
    del.connect(fb);
    fb.connect(del);
    del.connect(master);
    return send;
  }

  // Klocklik pluck: grundton + oktav, lowpass, snabb attack / lång decay.
  function playPluck(freq, time, vol, voice) {
    var f = freq * voice.octave;

    var lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = voice.lpf;
    lpf.Q.value = 0.7;

    var g = ctx.createGain();
    lpf.connect(g);
    g.connect(master);
    g.connect(delaySend);

    var body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.value = f;
    body.connect(lpf);

    var shine = ctx.createGain();
    shine.gain.value = voice.shine;
    var upper = ctx.createOscillator();
    upper.type = 'sine';
    upper.frequency.value = f * 2;
    upper.connect(shine);
    shine.connect(lpf);

    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol * voice.gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + voice.decay);

    var stopAt = time + voice.decay + 0.1;
    body.start(time);  body.stop(stopAt);
    upper.start(time); upper.stop(stopAt);
  }

  function schedulePhrase(idx, startTime, voice) {
    var notes = CHORDS[idx % CHORDS.length];
    // Volymkontur: andra tonen lyfts lite så frasen får en puls framåt,
    // sista tonen dör bort så tystnaden efteråt känns avsiktlig.
    var VOLS = [0.10, 0.13, 0.11, 0.08];
    for (var i = 0; i < notes.length; i++) {
      playPluck(notes[i], startTime + i * STEP, VOLS[i], voice);
    }
  }

  function scheduler() {
    if (!ctx || !active) return;
    while (nextChordTime < ctx.currentTime + LOOKAHEAD) {
      schedulePhrase(chordIndex, nextChordTime, VOICES[voiceIndex]);
      chordIndex = (chordIndex + 1) % CHORDS.length;
      voiceIndex = (voiceIndex + 1) % VOICES.length;
      nextChordTime += STEP * 4 + REST;   // fras + tystnad
    }
  }

  // Rampa master-gain mjukt. cancelScheduledValues + setValueAtTime(current)
  // gör att en ramp som avbryts mitt i fortsätter från sitt FAKTISKA värde i
  // stället för att hoppa — ett hopp i gain är precis det klick vi undviker.
  function rampTo(value, seconds) {
    var now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(value, now + seconds);
  }

  function resumeAudio() {
    if (suspendTimer) { clearTimeout(suspendTimer); suspendTimer = null; }
    function run() {
      if (!active) return;
      // Ny fras direkt. nextChordTime från förra sessionen ligger i det gamla
      // tidsfönstret och skulle annars ge en skur av köade fraser på en gång.
      nextChordTime = ctx.currentTime + 0.08;
      rampTo(MASTER, FADE_IN);
      scheduler();
    }
    if (ctx.state === 'suspended') { ctx.resume().then(run); } else { run(); }
  }

  function start() {
    if (started) { resumeAudio(); return; }
    started = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0001;   // tonas in av resumeAudio
    master.connect(ctx.destination);
    delaySend = buildDelay();
    // Ingen clearInterval behövs — WebView:n rivs vid unmount.
    setInterval(scheduler, 25);
    resumeAudio();
  }

  function setActive(next) {
    next = !!next;
    if (next === active && started) { if (next) { resumeAudio(); } return; }
    active = next;
    if (active) { start(); return; }
    if (!ctx) return;
    rampTo(0.0001, FADE_OUT);
    if (suspendTimer) clearTimeout(suspendTimer);
    suspendTimer = setTimeout(function () {
      suspendTimer = null;
      if (!active && ctx.state === 'running') { ctx.suspend(); }
    }, TAIL_MS);
  }

  window.qvAmbient = { setActive: setActive };

  // !started-guarden: onLoadEnd-flushen kan hinna före den här timern och
  // har då redan startat. Utan guarden skulle start() → resumeAudio() rulla
  // om frasen från början 150 ms in.
  setTimeout(function () { if (active && !started) start(); }, 150);
  // Fallback om autoplay-policyn blockerade den tysta starten ovan.
  document.addEventListener('touchstart', function () {
    if (active) start();
  }, { once: true });
})();
</script>
</body>
</html>`;

const setActiveJS = (on: boolean) =>
  `window.qvAmbient && window.qvAmbient.setActive(${on ? 'true' : 'false'}); true;`;

/**
 * Osynlig WebView som spelar en ljus, gles närvaro-slinga via Web Audio API.
 * C→G→Am→F som music-box-plingar i fraser om fyra toner med tystnad emellan.
 * Fraserna växlar mellan en dämpad och en mörk röst i samma fasta takt.
 * Inget bakgrundslager — bara plingarna.
 * Monteras i LobbyScreen (host) och i quiz.tsx under GetReady-fasen.
 * Ingen audio-fil behövs.
 *
 * `active` styr uppspelningen — se ⚠-noten överst i filen. Låt komponenten
 * vara monterad och flippa proppen; att avmontera den medan den låter ger ett
 * hörbart klick när WebView:n (och därmed AudioContext:en) rivs synkront.
 */
export function MorseAmbientSound({ active = true }: { active?: boolean }) {
  const webRef = useRef<WebView>(null);
  // Sidan är inte laddad direkt vid mount; injectJavaScript före onLoadEnd
  // tappas tyst. Vi speglar därför önskat läge och flushar det vid load.
  const loadedRef = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!loadedRef.current) return;
    webRef.current?.injectJavaScript(setActiveJS(active));
  }, [active]);

  return (
    <View
      style={{
        position: 'absolute',
        left: -2,
        top: -2,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      <WebView
        ref={webRef}
        source={{ html: HTML }}
        // Startläget måste finnas INNAN sidans script kör, annars hinner en
        // enhet som monteras inaktiv skapa en AudioContext i onödan.
        injectedJavaScriptBeforeContentLoaded={`window.__qvActive = ${active ? 'true' : 'false'}; true;`}
        onLoadEnd={() => {
          loadedRef.current = true;
          webRef.current?.injectJavaScript(setActiveJS(activeRef.current));
        }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
