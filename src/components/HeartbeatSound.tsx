import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Dov hjärt-rytm genererad via Web Audio API i en osynlig WebView.
//
// Mönster: "lub" (62 Hz) → dubGap ms paus → "dub" (78 Hz) → tystnad → loop
// Lowpass-filter vid 150 Hz ger dov, muffad karaktär.
// Varje puls = kort oscillatorsvep med snabb attack (~6 ms) och mjuk decay (~150 ms).
// Monteras i GetReadyIntro (60 BPM) och quiz.tsx Hints-frågor (80 BPM).
// Stoppas automatiskt via component-unmount.

function buildHTML(bpm: number): string {
  // Dela upp BPM-cykeln: 40 % är "lub+gap+dub", 60 % är tystnad.
  const cycleMs = Math.round(60000 / bpm);
  const dubGapMs = Math.round(cycleMs * 0.15);  // gap mellan lub och dub
  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var ctx = null;
  var CYCLE = ${cycleMs};
  var DUB_GAP = ${dubGapMs / 1000};  // sekunder

  function pulse(freq, vol, time) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    var lpf  = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = freq;
    lpf.type = 'lowpass';
    lpf.frequency.value = 150;
    lpf.Q.value = 4;
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.start(time);
    osc.stop(time + 0.22);
  }

  function beat() {
    if (!ctx) return;
    var now = ctx.currentTime;
    pulse(62, 0.65, now);
    pulse(78, 0.48, now + DUB_GAP);
    setTimeout(beat, CYCLE);
  }

  function start() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume().then(beat);
    } else {
      beat();
    }
  }

  setTimeout(start, 200);
  document.addEventListener('touchstart', start, { once: true });
})();
</script>
</body>
</html>`;
}

/**
 * Osynlig WebView som spelar ett dov hjärtslag via Web Audio API.
 * Lub-dub mönster (60 eller 80 BPM beroende på `bpm`-prop), lowpass-filtrerat.
 * Stoppas automatiskt när komponenten avmonteras.
 * Inga audio-filer behövs.
 */
export function HeartbeatSound({ bpm = 60 }: { bpm?: number }) {
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
        source={{ html: buildHTML(bpm) }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
