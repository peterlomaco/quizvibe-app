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
// ett lowpass vid 2.6 kHz. Snabb attack (8 ms) + exponentiell decay ger
// klockkaraktär utan hårda övertoner.
//
// INGEN pad. Ett viskande sinus-lager under plingarna testades 2026-08-24 och
// togs bort direkt (Peter): det gjorde slingan till en oavbruten bakgrundston,
// vilket var precis det den gamla drone-padden dömdes ut för.
//
// Slingan är MEDVETET gles — en fras på fyra toner följt av 2 s TYSTNAD innan
// nästa ackord. Det är en närvaro-signal som pickar till då och då, inte musik
// som ligger på. Kör den utan paus och den blir bakgrundsmusik igen.
//
// TAKT-RAMP (Peter 2026-08-24): takten stegras över tre fraser (550 → 510 →
// 470 ms mellan plingarna) och börjar sedan om på den långsamma. Fyra toner
// per fras ligger fast; STEPS (takt) och REST (paus) är rattarna.
//
// Stegringen är MEDVETET nätt och jämnt märkbar (~8 % per fras, 15 % totalt)
// och dämpades i två omgångar: 550→420→320 (42 %) lät forcerat, 550→480→420
// (24 %) fortfarande för snabbt. Rampen ska ANAS, inte höras som att något
// håller på att hända i spelet. Branta ramper hör hemma i nedräkningen
// (CountdownIntro), inte här.
//
// Takt-rampen (3 lång) och ackordföljden (4 lång) löper OBEROENDE, så det tar
// 12 fraser innan exakt samma kombination återkommer — avsiktligt, det håller
// slingan från att låta uppenbart loopad.
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
  var tempoIndex = 0;
  var nextChordTime = 0;

  // C → G → Am → F (I–V–vi–IV). Arpeggio-toner, lågt index spelas först.
  var CHORDS = [
    [523.25, 659.25, 783.99, 1046.50], // C  : C5 E5 G5 C6
    [392.00, 493.88, 587.33,  783.99], // G  : G4 B4 D5 G5
    [440.00, 523.25, 659.25,  880.00], // Am : A4 C5 E5 A5
    [349.23, 440.00, 523.25,  698.46], // F  : F4 A4 C5 F5
  ];

  // Takt-ramp: tre fraser där takten stegras, sedan tillbaka till fras 1:s
  // takt. Ger en liten "det händer något"-stegring utan att bli musik.
  var STEPS     = [0.55, 0.51, 0.47];      // sekunder mellan plingarna per omgång
  var REST      = 2.0;                     // tystnad mellan fraserna (konstant)
  var LOOKAHEAD = 0.40;                    // schemalägg så här långt fram

  function buildDelay() {
    var del  = ctx.createDelay(1.0);
    var fb   = ctx.createGain();
    var send = ctx.createGain();
    // Fast tid — delayTime får INTE ändras per fras (abrupt byte ger
    // pitch-warble i delay-linjen). 0.275 ligger mellan takt-rampens steg.
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
  function playPluck(freq, time, vol) {
    var lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 2600;
    lpf.Q.value = 0.7;

    var g = ctx.createGain();
    lpf.connect(g);
    g.connect(master);
    g.connect(delaySend);

    var body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.value = freq;
    body.connect(lpf);

    var shine = ctx.createGain();
    shine.gain.value = 0.22;
    var upper = ctx.createOscillator();
    upper.type = 'sine';
    upper.frequency.value = freq * 2;
    upper.connect(shine);
    shine.connect(lpf);

    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 1.45);

    body.start(time);  body.stop(time + 1.55);
    upper.start(time); upper.stop(time + 1.55);
  }

  function schedulePhrase(idx, startTime, step) {
    var notes = CHORDS[idx % CHORDS.length];
    // Volymkontur: andra tonen lyfts lite så frasen får en puls framåt,
    // sista tonen dör bort så tystnaden efteråt känns avsiktlig.
    var VOLS = [0.10, 0.13, 0.11, 0.08];
    for (var i = 0; i < notes.length; i++) {
      playPluck(notes[i], startTime + i * step, VOLS[i]);
    }
  }

  function scheduler() {
    if (!ctx) return;
    while (nextChordTime < ctx.currentTime + LOOKAHEAD) {
      var step = STEPS[tempoIndex];
      schedulePhrase(chordIndex, nextChordTime, step);
      chordIndex = (chordIndex + 1) % CHORDS.length;
      tempoIndex = (tempoIndex + 1) % STEPS.length;
      nextChordTime += step * 4 + REST;   // fras + tystnad
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
 * C→G→Am→F som music-box-plingar (349–1047 Hz) i fraser om fyra toner med
 * tystnad emellan, där takten stegras över tre fraser och sedan börjar om.
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
