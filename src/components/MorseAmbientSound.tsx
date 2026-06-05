import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Morse-liknande ambient-loop: * * * ----
// Genereras via Web Audio API i en osynlig WebView — inga audio-filer behövs.
//
// Dovt/mörkt ljud via:
//   • Låg frekvens: 390 Hz (sub-bas-register)
//   • BiquadFilter lowpass vid 500 Hz — klipper höga övertoner, ger muffled känsla
//   • Lång attack/release-ramp (45 ms) — mjuk, ej skarp kant
//   • Låg gain: 0.08
//
// Mönster per loop (~8 s totalt):
//   PIP   = 200 ms  (kort dovt pip)
//   GAP   = 380 ms  (paus mellan pips — välseparerade, inte tätt Morse)
//   DRONE = 2000 ms (lång avslutande ton)
//   END   = 2800 ms (tystnad innan loop-restart)
//   [ PIP GAP ] × 3  +  [ DRONE ]  +  END

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;

  function beep(t, dur) {
    var o   = ctx.createOscillator();
    var lpf = ctx.createBiquadFilter();
    var g   = ctx.createGain();

    // Sinusvåg på låg frekvens + lowpass-filter = dov, mörk ton utan skärpa.
    o.type = 'sine';
    o.frequency.value = 390;

    lpf.type = 'lowpass';
    lpf.frequency.value = 500;
    lpf.Q.value = 0.8;

    o.connect(lpf);
    lpf.connect(g);
    g.connect(ctx.destination);

    // Lång ramp (45 ms) → mjuk, inte klick-aktig.
    var R = 0.045;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + R);
    g.gain.setValueAtTime(0.08, t + dur - R);
    g.gain.linearRampToValueAtTime(0, t + dur);

    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function loop() {
    var PIP   = 0.20;   // kort pip
    var GAP   = 0.38;   // paus mellan pips
    var DRONE = 2.00;   // lång avslutande ton
    var END   = 2.80;   // tystnad innan restart

    var t = ctx.currentTime + 0.05;

    // Tre separata, välseparerade korta pips
    beep(t, PIP); t += PIP + GAP;
    beep(t, PIP); t += PIP + GAP;
    beep(t, PIP); t += PIP + GAP * 0.5; // lite kortare paus innan dronen

    // Lång avslutande drone
    beep(t, DRONE); t += DRONE;

    setTimeout(loop, (t - ctx.currentTime + END) * 1000);
  }

  function start() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
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
 * Osynlig WebView som spelar en dov Morse-liknande ambient-loop i lobbyn.
 * Mönster: * * * ---- (~8 s per loop). Monteras/avmonteras med LobbyScreen.
 * Inga audio-filer behövs; tonerna genereras via Web Audio API.
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
