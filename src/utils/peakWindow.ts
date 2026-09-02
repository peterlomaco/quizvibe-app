// Härleder ett "aktiv-era"-fönster (peakFrom/peakTo) för person/image-items så
// att Game Era-filtret i quiz.tsx kan utesluta artister vars aktiva år inte
// överlappar spelets era (t.ex. Jo Stafford 1944–1955 i ett 1981–2026-spel).
//
// Ren modul utan React/RN/fs — importeras av backend/scripts/export-image-questions.ts
// OCH enhetstestas i backend/content/test. Katalogens correctYear för en person
// är FÖDELSEÅR (för band = bildningsår), inte ett eventår, så det duger inte
// direkt som era-filter — därav peak-fönstret.

export interface PeakWindow {
  peakFrom: number;
  peakTo: number;
}

// Solo-personer: correctYear = födelseår → aktiv ≈ +18 .. +58.
const SOLO_PERSON_SUBJECTS = new Set([
  'artist',
  'actor',
  'athlete',
  'character',
  'celebrity',
  'cultural-person',
]);
// Grupper: correctYear = bildningsår → aktiv ≈ bildning .. +40.
const BAND_SUBJECTS = new Set(['band']);

/** Alla person-subjekt (solo + band) — övriga (city/country/place) får inget
 *  härlett peak-fönster (de era-filtreras redan på correctYear i quiz.tsx). */
export const PERSON_SUBJECTS = new Set<string>([
  ...SOLO_PERSON_SUBJECTS,
  ...BAND_SUBJECTS,
]);

function parseYearToken(
  token: string,
  currentYear: number,
  isEnd: boolean,
): number | null {
  const t = token.toLowerCase().trim();
  if (t === 'present' || t === 'now' || t === 'today') return currentYear;
  // Decennium, t.ex. "1920s" → start 1920, slut 1929.
  const decade = t.match(/^(\d{4})s$/);
  if (decade) {
    const base = parseInt(decade[1], 10);
    return isEnd ? base + 9 : base;
  }
  const m = t.match(/(\d{4})/);
  if (m) return parseInt(m[1], 10);
  return null;
}

/**
 * Tolkar en `peak_year`-ledtrådssträng till ett årsspann.
 * Format: `'YYYY – YYYY'`, `'YYYY – present'`, `'YYYYs – YYYYs'` (en-dash eller
 * bindestreck). Ett ensamt token behandlas som from = to.
 * Returnerar null om inget år kan tolkas eller om to < from.
 */
export function parsePeakYear(
  value: string,
  currentYear: number,
): PeakWindow | null {
  if (!value) return null;
  const parts = value.split(/[–—-]/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) {
    const one = parseYearToken(parts[0], currentYear, false);
    return one == null ? null : { peakFrom: one, peakTo: one };
  }
  const from = parseYearToken(parts[0], currentYear, false);
  const to = parseYearToken(parts[1], currentYear, true);
  if (from == null || to == null) return null;
  if (to < from) return null;
  return { peakFrom: from, peakTo: to };
}

/**
 * Löser ett peak-fönster för ett item, i prioritetsordning:
 *   1. Katalogens explicita peakFrom/peakTo (curator-override, vinner alltid).
 *   2. Härlett ur item:ets `peak_year`-ledtråd (curated).
 *   3. Fallback ur correctYear (person → födelseår+18..+58, band → +0..+40),
 *      klampat mot currentYear.
 *   4. Inget → null (item förblir era-agnostiskt).
 */
export function resolvePeakWindow(opts: {
  catalogPeakFrom?: number;
  catalogPeakTo?: number;
  peakYearHint?: string;
  correctYear?: number;
  contentSubject: string;
  currentYear: number;
}): PeakWindow | null {
  const {
    catalogPeakFrom,
    catalogPeakTo,
    peakYearHint,
    correctYear,
    contentSubject,
    currentYear,
  } = opts;

  // 1. Katalog explicit.
  if (catalogPeakFrom !== undefined && catalogPeakTo !== undefined) {
    return { peakFrom: catalogPeakFrom, peakTo: catalogPeakTo };
  }

  // 2. Curated peak_year-ledtråd.
  if (peakYearHint) {
    const parsed = parsePeakYear(peakYearHint, currentYear);
    if (parsed) return parsed;
  }

  // 3. Fallback ur correctYear (bara för person-subjekt).
  if (correctYear !== undefined) {
    if (SOLO_PERSON_SUBJECTS.has(contentSubject)) {
      const from = correctYear + 18;
      const to = Math.min(correctYear + 58, currentYear);
      if (from <= to) return { peakFrom: from, peakTo: to };
    } else if (BAND_SUBJECTS.has(contentSubject)) {
      const from = correctYear;
      const to = Math.min(correctYear + 40, currentYear);
      if (from <= to) return { peakFrom: from, peakTo: to };
    }
  }

  // 4. Inget underlag.
  return null;
}
