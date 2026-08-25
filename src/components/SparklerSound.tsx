import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Sprakljudet till prisutdelningens Q-ritning — ett tomtebloss som fräser
 * medan pennan går, och en fyrverkerismäll när svansen är klar.
 *
 * ── Varför WebView och inte en ljudfil ──────────────────────────────────
 * Repot har INGEN audio-modul: `expo-audio` är parkerad och det finns inga
 * ljud-assets. Den etablerade vägen är osynlig WebView + Web Audio API —
 * samma mönster som [MorseAmbientSound](src/components/MorseAmbientSound.tsx).
 * Allt syntetiseras, ingen fil laddas, inget nytt beroende.
 *
 * ── Allt schemaläggs på EN gång ─────────────────────────────────────────
 * Sekvensen är bara ~1,7 s, så varje smäll och knaster läggs på absolut
 * tid direkt vid start. Ingen look-ahead-loop behövs (till skillnad från
 * MorseAmbientSounds oändliga slinga) och ingenting kan drifta.
 *
 * ── ⚠ WebView:n laddar långsammare än animationen startar ───────────────
 * HTML-laddning + AudioContext-uppstart tar 100–300 ms på enhet, medan
 * ritningen börjar direkt vid mount. Utan kompensation hade ljudet legat
 * en femtedel efter bilden. Därför får sidan mount-tidsstämpeln via
 * `injectedJavaScriptBeforeContentLoaded` och HOPPAR ÖVER den del av
 * schemat som redan hunnit passera. Ta inte bort `window.__t0` — utan den
 * hamnar smällen efter pokalen i stället för på den.
 */

const HIDDEN: React.ComponentProps<typeof View>['style'] = {
  position: 'absolute',
  left: -2,
  top: -2,
  width: 1,
  height: 1,
  overflow: 'hidden',
};

/** Fyrverkeriets efterknaster, i sekunder efter smällen. */
const FINALE_TAIL_SEC = 0.9;

function buildHtml(durationSec: number): string {
  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#000;">
<script>
(function () {
  var DRAW = ${durationSec.toFixed(3)};
  var TAIL = ${FINALE_TAIL_SEC};
  var started = false;

  function noiseBuffer(ctx, seconds) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function start() {
    if (started) return;
    started = true;

    // Hur mycket av schemat som redan hunnit passera medan WebView:n
    // laddade. Allt före den punkten hoppas över.
    var late = 0;
    try {
      if (window.__t0) late = Math.max(0, (Date.now() - window.__t0) / 1000);
    } catch (e) {}
    // Har hela sekvensen redan runnit ut är det bättre att vara tyst än
    // att smälla av ett fyrverkeri över summary-korten.
    if (late > DRAW + 0.35) return;

    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    var noise = noiseBuffer(ctx, 2);
    var t0 = ctx.currentTime + 0.02;
    // Schemalägg-tid: s är "sekunder in i ritningen".
    function at(s) { return t0 + (s - late); }

    // ── Fräset: filtrerat brus som ligger under hela ritningen ──────────
    var bedFrom = Math.max(0, late);
    var bedLen = DRAW - bedFrom;
    if (bedLen > 0.05) {
      var src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;

      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 4200;
      bp.Q.value = 0.7;

      var hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1600;

      var bg = ctx.createGain();
      src.connect(bp); bp.connect(hp); hp.connect(bg); bg.connect(master);

      var bedStart = at(bedFrom);
      var bedEnd = at(DRAW);
      bg.gain.setValueAtTime(0.0001, bedStart);
      // Kort attack, och en svag stegring mot slutet så fräset "drar ihop
      // sig" inför smällen.
      bg.gain.linearRampToValueAtTime(0.09, bedStart + Math.min(0.12, bedLen * 0.2));
      bg.gain.linearRampToValueAtTime(0.15, bedEnd);
      bg.gain.exponentialRampToValueAtTime(0.0001, bedEnd + 0.12);
      src.start(bedStart);
      src.stop(bedEnd + 0.2);
    }

    // ── Knastret: korta brusknäppar ─────────────────────────────────────
    function crackle(when, vol, bright) {
      if (when < 0) return;
      var s = ctx.createBufferSource();
      s.buffer = noise;
      s.playbackRate.value = 0.8 + Math.random() * 1.4;

      var f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = bright;

      var g = ctx.createGain();
      s.connect(f); f.connect(g); g.connect(master);

      var t = at(when);
      var dur = 0.005 + Math.random() * 0.022;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.start(t, Math.random() * 1.5, dur + 0.03);
    }

    // Tätheten ökar mot slutet — blosset brinner sig varmare.
    var s = 0;
    while (s < DRAW) {
      var f = s / DRAW;
      if (s >= late) crackle(s, 0.05 + Math.random() * (0.10 + f * 0.12), 2200 + Math.random() * 3800);
      s += 0.016 + Math.random() * (0.055 - f * 0.03);
    }

    // ── Fyrverkeriet: smäll när svansen är färdig ───────────────────────
    var boom = at(DRAW);

    // Ljus explosion.
    var bs = ctx.createBufferSource();
    bs.buffer = noise;
    bs.playbackRate.value = 0.7;
    var bf = ctx.createBiquadFilter();
    bf.type = 'highpass';
    bf.frequency.value = 900;
    var bgn = ctx.createGain();
    bs.connect(bf); bf.connect(bgn); bgn.connect(master);
    bgn.gain.setValueAtTime(0.0001, boom);
    bgn.gain.linearRampToValueAtTime(0.34, boom + 0.006);
    bgn.gain.exponentialRampToValueAtTime(0.0001, boom + 0.42);
    bs.start(boom, 0, 0.5);

    // Tryckvågen under — sinus som sveper ned. Utan den låter smällen
    // tunn och sitter inte i bröstet.
    var thump = ctx.createOscillator();
    thump.type = 'sine';
    var tg = ctx.createGain();
    thump.connect(tg); tg.connect(master);
    thump.frequency.setValueAtTime(140, boom);
    thump.frequency.exponentialRampToValueAtTime(42, boom + 0.28);
    tg.gain.setValueAtTime(0.0001, boom);
    tg.gain.linearRampToValueAtTime(0.30, boom + 0.012);
    tg.gain.exponentialRampToValueAtTime(0.0001, boom + 0.34);
    thump.start(boom);
    thump.stop(boom + 0.4);

    // Efterknastret — de sista gnistorna som faller.
    var k = 0.05;
    while (k < TAIL) {
      crackle(DRAW + k, 0.16 * (1 - k / TAIL) * (0.5 + Math.random() * 0.5), 3000 + Math.random() * 4000);
      k += 0.02 + Math.random() * 0.07;
    }
  }

  if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
    // Så tidigt som möjligt — varje millisekund här blir "late" ovan.
    start();
  }
  document.addEventListener('touchstart', start, { once: true });
})();
</script>
</body>
</html>`;
}

interface SparklerSoundProps {
  /**
   * `Date.now()` när ritningen började. Sidan använder den för att hoppa
   * över den del av schemat som passerat medan WebView:n laddade.
   */
  startedAt: number;
  /** Rit-tiden i ms. Fyrverkeriet smäller när den löper ut. */
  durationMs: number;
}

/**
 * Osynlig WebView som spelar tomtebloss-fräs + fyrverkerismäll via Web
 * Audio API. Monteras av FinalCelebration under ritningen och rivs när
 * sekvensen går vidare; ingen ljudfil, inget beroende, ingen städning
 * utöver unmount.
 */
export default function SparklerSound({ startedAt, durationMs }: SparklerSoundProps) {
  const html = useMemo(() => buildHtml(durationMs / 1000), [durationMs]);
  return (
    <View style={HIDDEN} pointerEvents="none">
      <WebView
        source={{ html }}
        injectedJavaScriptBeforeContentLoaded={`window.__t0=${startedAt};true;`}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
