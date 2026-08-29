// Session-cache (per app-körning, nollställs vid app-omstart) över om Home:s
// sekundär-rad-knappar var synliga senast: "Competition" (CompetitionsButton)
// och "1vs1" (MyMatchesSection).
//
// Varför: båda knapparna self-gatar till null tills sin async-fetch
// (AsyncStorage + Supabase) resolvat, och rapporterar synlighet ~1 s efter
// mount. HomeExtrasRow är då `display:'none'` (0 höjd) och pop:ar in när
// knappen dyker upp. Home:s ScrollView-container använder
// justifyContent:'space-between', så den sena höjdökningen redistribuerar
// HELA kolumnen → CTA-knapparna hoppar. Syns tydligast vid en RE-MOUNT av
// Home (router.replace('/') efter lobby-delete) där användaren precis hade
// raden synlig.
//
// Genom att seed:a HomeExtrasRow + barnen från den senast kända synligheten
// renderas raden med rätt höjd FRÅN FÖRSTA FRAME i stället för att pop:a in.
// Efter mountens första reload litar vi på riktig data igen (så en rad som
// blivit tom sedan förra besöket kollapsar). Enda kvarvarande pop-in är
// allra första Home-visningen i en app-session (cachen är då false) — sällan
// och engångs.
//
// Session-scoped med flit: en modul-`let` överlever re-mounts men nollställs
// vid app-omstart, samma mönster som övriga in-memory-mockstores.

export type HomeRowKey = 'competitions' | 'matches';

const cache: Record<HomeRowKey, boolean> = {
  competitions: false,
  matches: false,
};

export function getCachedHomeRowVisible(key: HomeRowKey): boolean {
  return cache[key];
}

export function setCachedHomeRowVisible(key: HomeRowKey, visible: boolean): void {
  cache[key] = visible;
}
