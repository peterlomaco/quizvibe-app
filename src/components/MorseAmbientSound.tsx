import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Ljus "appen är igång"-slinga via Web Audio API.
//
// Ersatte 2026-08-24 den låga moll-padden (Am→F→C→G, 98–220 Hz) som Peter
// upplevde som tung/dyster. Nu: mjuka music-box-plingar i C-dur över den
// glada pop-kadensen C → G → Am → F, i ett HÖGT register (349–1047 Hz) så
// tonerna läser som "liv i appen" i stället för en drone.
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
// mellan en LJUS och en MÖRK röst — samma toner, samma 4-takt, men den mörka
// ligger en oktav ned med dovare lowpass och nästan ingen oktav-shimmer.
// Kontrasten ligger alltså i KLANG, inte i tempo.
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

  // C → G → Am → F (I–V–vi–IV). Arpeggio-toner, lågt index spelas först.
  var CHORDS = [
    [523.25, 659.25, 783.99, 1046.50], // C  : C5 E5 G5 C6
    [392.00, 493.88, 587.33,  783.99], // G  : G4 B4 D5 G5
    [440.00, 523.25, 659.25,  880.00], // Am : A4 C5 E5 A5
    [349.23, 440.00, 523.25,  698.46], // F  : F4 A4 C5 F5
  ];

  // Två klangvarv. Samma toner och samma takt — bara register och filter
  // skiljer. 'gain' kompenserar att den mörka oktaven uppfattas svagare i
  // mobilhögtalare; 'decay' är längre där så den mörka frasen får ringa ut.
  var VOICES = [
    { octave: 1.0,  lpf: 2600, shine: 0.22, decay: 1.45, gain: 1.00 }, // ljus
    { octave: 0.5,  lpf: 1200, shine: 0.09, decay: 1.80, gain: 1.20 }, // mörk
  ];

  var STEP      = 0.55;                    // sekunder mellan plingarna — FAST
  var REST      = 2.0;                     // tystnad mellan fraserna
  var LOOKAHEAD = 0.40;                    // schemalägg så här långt fram

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
    if (!ctx) return;
    while (nextChordTime < ctx.currentTime + LOOKAHEAD) {
      schedulePhrase(chordIndex, nextChordTime, VOICES[voiceIndex]);
      chordIndex = (chordIndex + 1) % CHORDS.length;
      voiceIndex = (voiceIndex + 1) % VOICES.length;
      nextChordTime += STEP * 4 + REST;   // fras + tystnad
    }
  }

  function start() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.30;
    master.connect(ctx.destination);
    delaySend = buildDelay();

    function run() {
      nextChordTime = ctx.currentTime + 0.08;
      scheduler();
      // Ingen clearInterval behövs — WebView:n rivs vid unmount.
      setInterval(scheduler, 25);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(run);
    } else {
      run();
    }
  }

  setTimeout(start, 150);
  document.addEventListener('touchstart', start, { once: true });
})();
</script>
</body>
</html>`;

/**
 * Osynlig WebView som spelar en ljus, gles närvaro-slinga via Web Audio API.
 * C→G→Am→F som music-box-plingar i fraser om fyra toner med tystnad emellan.
 * Fraserna växlar mellan en ljus och en mörk röst i samma fasta takt.
 * Inget bakgrundslager — bara plingarna.
 * Monteras i LobbyScreen (host) och i quiz.tsx under GetReady-fasen.
 * Ingen audio-fil behövs; stoppas automatiskt vid unmount.
 */
export function MorseAmbientSound() {
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
        source={{ html: HTML }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
