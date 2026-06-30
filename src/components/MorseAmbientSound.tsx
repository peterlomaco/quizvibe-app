import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Mörk ambient lobby-pad genererad via Web Audio API i en osynlig WebView.
//
// Ackordprogression (Am → Em → Dm → Am, en oktav lägre än förut):
//   Am   A2-C3-E3   (110 / 130.81 / 164.81 Hz)
//   Em   E2-G2-B2   (82.41 / 98.00 / 123.47 Hz)
//   Dm   D2-F2-A2   (73.41 / 87.31 / 110.00 Hz)
//   Am   (återgång)
//
// Sågvågor (rika övertoner) → aggressiv LPF 180 Hz, Q 2.5 → klassisk mörk synth-pad.
// Feedback-delay (600 ms, 35 %) → atmosfäriskt djup och rörelse.
// Sub-bass A0 = 27.5 Hz — känns mer än hörs, ger tyngd.
// LFO 0.015 Hz ±6 % — extremt trög pulsering.

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;
  var master = null;
  var delay = null;
  var chordIndex = 0;

  // Am → Em → Dm → Am — en oktav lägre = mycket tyngre och mörkare
  var CHORDS = [
    [110.00, 130.81, 164.81],   // Am  A2-C3-E3
    [ 82.41,  98.00, 123.47],   // Em  E2-G2-B2
    [ 73.41,  87.31, 110.00],   // Dm  D2-F2-A2
    [110.00, 130.81, 164.81],   // Am  återgång
  ];

  var DUR  = 12.0;  // sekunder per ackord
  var FADE = 4.5;   // crossfade

  // Skapar ett delay-nätverk för atmosfäriskt eko.
  function buildDelay() {
    var del  = ctx.createDelay(2.0);
    var fb   = ctx.createGain();
    var send = ctx.createGain();
    del.delayTime.value = 0.6;   // 600 ms eko
    fb.gain.value       = 0.35;  // 35 % feedback
    send.gain.value     = 0.28;  // send-nivå till eko

    del.connect(fb);
    fb.connect(del);
    del.connect(master);

    return { input: send, _nodes: [del, fb] };
  }

  // Sågvåga → LPF → gain → master + send till delay.
  function playNote(freq, startTime, totalDur) {
    [-10, 0, 10].forEach(function (cents) {
      var osc  = ctx.createOscillator();
      var lpf  = ctx.createBiquadFilter();
      var g    = ctx.createGain();
      var send = ctx.createGain();

      osc.type = 'sawtooth';   // rika övertoner → filtret skapar mörk, varm synth-pad
      osc.frequency.value = freq * Math.pow(2, cents / 1200);

      lpf.type = 'lowpass';
      lpf.frequency.value = 180;  // 180 Hz — extremt dov, nästan bara fundamental kvar
      lpf.Q.value = 2.5;          // tydlig resonans → igenkännlig mörk synth-karaktär

      send.gain.value = 0.4;

      osc.connect(lpf);
      lpf.connect(g);
      lpf.connect(send);
      g.connect(master);
      send.connect(delay.input);

      var vol = 0.012;
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(vol, startTime + FADE);
      g.gain.setValueAtTime(vol, startTime + totalDur - FADE);
      g.gain.linearRampToValueAtTime(0, startTime + totalDur);

      osc.start(startTime);
      osc.stop(startTime + totalDur + 0.1);
    });
  }

  function scheduleChord(idx, startTime) {
    var freqs = CHORDS[idx % CHORDS.length];
    freqs.forEach(function (freq) {
      playNote(freq, startTime, DUR + FADE);
    });
  }

  // Sub-bass A0 = 27.5 Hz — djup, tung grund som känns i bröstet.
  function startSubBass() {
    var osc  = ctx.createOscillator();
    var lpf  = ctx.createBiquadFilter();
    var g    = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 27.5;  // A0 — djupaste praktiska ton

    lpf.type = 'lowpass';
    lpf.frequency.value = 60;
    lpf.Q.value = 0.7;

    // Långsam tremolo 0.05 Hz — ger sub-bassen liv
    var trem  = ctx.createOscillator();
    var tremG = ctx.createGain();
    trem.frequency.value = 0.05;
    tremG.gain.value = 0.025;
    trem.connect(tremG);
    tremG.connect(g.gain);
    trem.start();

    osc.connect(lpf);
    lpf.connect(g);
    g.connect(master);
    g.gain.value = 0.14;
    osc.start();
  }

  function loop() {
    scheduleChord(chordIndex, ctx.currentTime);
    chordIndex = (chordIndex + 1) % CHORDS.length;
    setTimeout(loop, DUR * 1000);
  }

  function start() {
    if (ctx) return;
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.78;
    master.connect(ctx.destination);

    delay = buildDelay();

    // LFO — extremt trög (67 s cykel), ±6 % — andetag på djuphavet
    var lfo  = ctx.createOscillator();
    var lfoG = ctx.createGain();
    lfo.frequency.value = 0.015;
    lfoG.gain.value = 0.09;
    lfo.connect(lfoG);
    lfoG.connect(master.gain);
    lfo.start();

    if (ctx.state === 'suspended') {
      ctx.resume().then(function () { startSubBass(); loop(); });
    } else {
      startSubBass();
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
 * Osynlig WebView som spelar mörk ambient lobby-pad via Web Audio API.
 * Ackordprogression Am→Em→Dm→Am en oktav lägre (A2/E2/D2), sågvågor, LPF 180 Hz Q 2.5,
 * feedback-delay 600 ms + sub-bass A0 = 27.5 Hz. Monteras/avmonteras med LobbyScreen.
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
