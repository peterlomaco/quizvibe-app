import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Osynlig, tyst WebView vars ENDA syfte är att förvärma vägen till YouTube så
// den mutade non-host:ens YouTube-spelare bootar snabbare vid question-entry.
//
// Bakgrund: host har en levande WebView (MorseAmbientSound) genom hela
// intro+countdown, vilket incidentellt värmer iOS delade WKWebView-process-
// pool → host:s YouTube-WebView spinner upp snabbt. Non-host är mutad →
// MorseAmbientSound gatas bort (!isAudioMutedForSelf) → ingen WebView alls →
// kall pool + kall nätverksväg → videon syns märkbart senare även när fasen är
// perfekt synkad. Den här komponenten återställer symmetrin.
//
// Två saker värms:
//   1. WKWebView-PROCESS-poolen (bara att en WebView lever).
//   2. NÄTVERKSVÄGEN till YouTube: DNS + TLS via <link rel="preconnect"> och
//      iframe_api.js hämtas in i den delade HTTP-cachen via fetch(no-cors).
//      iOS delar NSURLCache + connection-pool mellan alla WebViews i appen, så
//      när den riktiga spelaren monteras är DNS löst, TLS varmt och
//      iframe_api.js ofta ett cache-hit → färre round-trips före första bild.
//
// ⚠ Detta laddar INGEN video, skapar INGEN YT.Player och spelar INGENTING —
// bara preconnect/prefetch, exakt som en webbläsares resurs-hint. Ingen
// uppspelning-medan-dold, ingen player-chrome, ingen YouTube-ToS-yta. Vill man
// stänga även den kvarvarande buffer-luckan krävs en riktig pre-cue av
// spelaren (villkorlig autoplay-patch + player som överlever countdown→
// question) — medvetet INTE här pga ToS + refaktor.
//
// ⚠ Montera på SAMMA barn-position i både intro- och countdown-grenen (samma
// mönster som MorseAmbientSound) så WebView-instansen återanvänds över
// intro→countdown och varmvärmningen inte kastas bort mitt i.
const WARM_HTML = `<!doctype html><meta name="viewport" content="width=device-width">
<link rel="preconnect" href="https://www.youtube.com" crossorigin>
<link rel="preconnect" href="https://s.ytimg.com" crossorigin>
<link rel="preconnect" href="https://i.ytimg.com" crossorigin>
<link rel="dns-prefetch" href="https://www.youtube.com">
<link rel="dns-prefetch" href="https://s.ytimg.com">
<script>
  // Dra in iframe_api.js i den delade HTTP-cachen. no-cors → opak respons
  // (vi behöver den inte), men DNS/TLS/nätverkshämtningen sker ändå. try/catch
  // så ett ev. nätverksfel aldrig stör — det här är ren opportunistisk värme.
  try { fetch('https://www.youtube.com/iframe_api', { mode: 'no-cors' }); } catch (e) {}
</script>`;

/**
 * Se fil-kommentaren ovan. Renderar en 1×1 dold WebView som preconnectar +
 * prefetchar YouTube-resurser. Ingen prop — den gör alltid samma sak.
 */
export function WebViewWarmer() {
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
        source={{ html: WARM_HTML }}
        scrollEnabled={false}
        bounces={false}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
