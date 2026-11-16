import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Osynlig, tyst WebView vars ENDA syfte är att förvärma vägen till YouTube så
// YouTube-spelaren bootar snabbare vid question-entry.
//
// Bakgrund: utan en levande WebView under intro+countdown är iOS delade
// WKWebView-process-pool + nätverksvägen kall → videon syns märkbart senare
// även när fasen är perfekt synkad. (Tidigare gjorde ambient-ljudets WebView
// detta för enheter med ljud; bakgrundsmusiken spelas nu via expo-audio, så
// värmaren monteras för ALLA enheter sedan 2026-11-16.)
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
// ⚠ Montera på SAMMA barn-position i både intro- och countdown-grenen så
// WebView-instansen återanvänds över
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
