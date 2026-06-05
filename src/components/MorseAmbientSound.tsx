import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Morse-liknande ambient-loop: **- **- **- **----
// Genereras via Web Audio API i en osynlig WebView — inga audio-filer behövs.
// Frekvens 720 Hz (radio-Morse-känsla), gain 0.12 (diskret ambient-nivå).
//
// Timings:
//   DIT  = 100 ms  (kort pip, **)
//   DAH  = 320 ms  (långt pip, -)
//   DAH4 = 1280 ms (avslutande lång pip, ----)
//   SYM  = 80 ms   (paus mellan symboler)
//   GRP  = 240 ms  (paus mellan grupper)
//   END  = 1200 ms (tystnad innan loop-restart)
//
// Mönster per loop (~6 s totalt):
//   [DIT SYM DIT SYM DAH GRP] × 3  +  [DIT SYM DIT SYM DAH×4]  +  END

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;

  function beep(t, dur) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.value = 720;
    // Mjuka in/ut-ramper (8 ms) undviker klick-artefakter.
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.008);
    g.gain.setValueAtTime(0.12, t + dur - 0.008);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function loop() {
    var DIT = 0.10;
    var DAH = 0.32;
    var SYM = 0.08;
    var GRP = 0.24;
    var END = 1.20;

    var t = ctx.currentTime + 0.05;
    var i;

    // **- **- **-  (tre gånger)
    for (i = 0; i < 3; i++) {
      beep(t, DIT); t += DIT + SYM;
      beep(t, DIT); t += DIT + SYM;
      beep(t, DAH); t += DAH + GRP;
    }

    // **---- (avslutande lång pip)
    beep(t, DIT); t += DIT + SYM;
    beep(t, DIT); t += DIT + SYM;
    beep(t, DAH * 4); t += DAH * 4;

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

  // Starta direkt — RN WebView tillämpar inte webbläsarens user-gesture-krav.
  setTimeout(start, 150);
  // Backup om AudioContext ändå är suspended: starta vid touch.
  document.addEventListener('touchstart', start, { once: true });
})();
</script>
</body>
</html>`;

/**
 * Osynlig WebView som spelar en Morse-liknande ambient-loop i lobbyn.
 * Monteras/avmonteras med LobbyScreen — ljudet stoppas automatiskt vid
 * navigation. Inga audio-filer behövs; tonerna genereras via Web Audio API.
 */
export function MorseAmbientSound() {
  return (
    <View
      // Positioneras utanför skärmens synliga yta så WebView inte påverkar layout.
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
