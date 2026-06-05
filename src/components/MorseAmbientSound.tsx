import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Mjuk ambient lobby-pad genererad via Web Audio API i en osynlig WebView.
//
// Ackordprogression (Am → F → C → G, 4 × 7 s = 28 s loop):
//   Am   A3-C4-E4   (220 / 261.63 / 329.63 Hz)
//   Fmaj F3-A3-C4   (174.61 / 220 / 261.63 Hz)
//   Cmaj C3-E3-G3   (130.81 / 164.81 / 196 Hz)
//   Gmaj G3-B3-D4   (196 / 246.94 / 293.66 Hz)
//
// Varje not = 3 sinusvågor detunade ±5 cent → chorus/pad-tjocklek.
// Lowpass-filter vid 800 Hz → varm, dov klang utan höga övertoner.
// 2.5 s crossfade mellan ackord → sömlösa övergångar.
// LFO 0.05 Hz ±7 % på master-gain → subtilt "andetag".

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;
  var master = null;
  var chordIndex = 0;

  // Am → F → C → G  (frekvenser i Hz, basoktav 3)
  var CHORDS = [
    [220.00, 261.63, 329.63],
    [174.61, 220.00, 261.63],
    [130.81, 164.81, 196.00],
    [196.00, 246.94, 293.66],
  ];

  var DUR  = 7.0;   // sekunder per ackord
  var FADE = 2.5;   // crossfade-tid (fade-in och fade-out)

  // Skapar en tonstapel för en frekvens: 3 detunade sinusvågor → lowpass → gain.
  function playNote(freq, startTime, totalDur) {
    [-5, 0, 5].forEach(function (cents) {
      var osc = ctx.createOscillator();
      var lpf = ctx.createBiquadFilter();
      var g   = ctx.createGain();

      osc.type = 'sine';
      // cents-detuning: f × 2^(c/1200)
      osc.frequency.value = freq * Math.pow(2, cents / 1200);

      lpf.type = 'lowpass';
      lpf.frequency.value = 800;
      lpf.Q.value = 0.5;

      osc.connect(lpf);
      lpf.connect(g);
      g.connect(master);

      var vol = 0.016;  // per oscillator — totalt ~0.14 per ackord vid full gain
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(vol, startTime + FADE);
      g.gain.setValueAtTime(vol, startTime + totalDur - FADE);
      g.gain.linearRampToValueAtTime(0, startTime + totalDur);

      osc.start(startTime);
      osc.stop(startTime + totalDur + 0.1);
    });
  }

  // Schemalägger ett helt ackord (alla toner) från startTime.
  // totalDur = DUR + FADE så nästa ackords fade-in överlappar fade-out.
  function scheduleChord(idx, startTime) {
    var freqs = CHORDS[idx % CHORDS.length];
    freqs.forEach(function (freq) {
      playNote(freq, startTime, DUR + FADE);
    });
  }

  // Loopfunktion: schemalägger nästa ackord och återanropar sig via setTimeout.
  function loop() {
    scheduleChord(chordIndex, ctx.currentTime);
    chordIndex = (chordIndex + 1) % CHORDS.length;
    setTimeout(loop, DUR * 1000);
  }

  function start() {
    if (ctx) return;
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.88;
    master.connect(ctx.destination);

    // Subtil LFO-pulsering (20 s cykel, ±7 %) — som ett lugnt andetag.
    var lfo  = ctx.createOscillator();
    var lfoG = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoG.gain.value = 0.07;
    lfo.connect(lfoG);
    lfoG.connect(master.gain);
    lfo.start();

    if (ctx.state === 'suspended') {
      ctx.resume().then(loop);
    } else {
      loop();
    }
  }

  setTimeout(start, 150);
  document.addEventListener('touchstart', start, { once: true });
})();
</script>
</body>
</html>`;

/**
 * Osynlig WebView som spelar mjuk ambient lobby-musik via Web Audio API.
 * Ackordprogression Am→F→C→G med 28 s loop, sömlösa crossfades, LFO-pulsering.
 * Monteras/avmonteras med LobbyScreen — musik stoppas automatiskt vid navigation.
 * Inga audio-filer behövs.
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
