import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Ambient lobby-pad via Web Audio API.
//
// Ackordprogression Am → F → C → G (en oktav högre än förra versionen).
// Frekvenser i 175–392 Hz-spannet → inga låga beating-frekvenser mot mobilhögtalare.
// Triangelvågor: varmare än sinus på ackord, inga hårda övertoner som sågvåg.
// En oscillator per ton (ingen detuning = inget beating).
// Lätt delay 500 ms, 12 % feedback — subtilt djup utan slamuppbygge.

const HTML = `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx   = null;
  var master = null;
  var delayNode = null;
  var chordIndex = 0;

  // Am → F → C → G — ytterligare en kvart lägre (×0.75)
  var CHORDS = [
    [123.75, 147.17, 185.42],  // Am
    [ 98.22, 123.75, 147.17],  // F
    [147.17, 185.42, 220.50],  // C
    [110.25, 138.91, 165.19],  // G
  ];

  var DUR  = 4.0;  // sekunder per ackord
  var FADE = 1.5;  // crossfade-tid

  function buildDelay() {
    var del  = ctx.createDelay(1.0);
    var fb   = ctx.createGain();
    var send = ctx.createGain();
    del.delayTime.value = 0.50;
    fb.gain.value       = 0.12;
    send.gain.value     = 0.12;
    del.connect(fb);
    fb.connect(del);
    del.connect(master);
    return { input: send };
  }

  function playNote(freq, startTime, totalDur) {
    var osc  = ctx.createOscillator();
    var g    = ctx.createGain();
    var send = ctx.createGain();

    osc.type = 'triangle';      // varmare än sinus, inga hårda övertoner
    osc.frequency.value = freq; // exakt frekvens — ingen detuning

    send.gain.value = 0.18;

    osc.connect(g);
    osc.connect(send);
    g.connect(master);
    send.connect(delayNode.input);

    var vol = 0.12;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + FADE);
    g.gain.setValueAtTime(vol, startTime + totalDur - FADE);
    g.gain.linearRampToValueAtTime(0, startTime + totalDur);

    osc.start(startTime);
    osc.stop(startTime + totalDur + 0.1);
  }

  function scheduleChord(idx, startTime) {
    CHORDS[idx % CHORDS.length].forEach(function (freq) {
      playNote(freq, startTime, DUR + FADE);
    });
  }

  function loop() {
    scheduleChord(chordIndex, ctx.currentTime);
    chordIndex = (chordIndex + 1) % CHORDS.length;
    setTimeout(loop, DUR * 1000);
  }

  function start() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.42;
    master.connect(ctx.destination);
    delayNode = buildDelay();

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
 * Osynlig WebView som spelar ambient lobby-pad via Web Audio API.
 * Am→F→C→G, triangelvågor, 175–392 Hz, diskret delay. Monteras med LobbyScreen.
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
