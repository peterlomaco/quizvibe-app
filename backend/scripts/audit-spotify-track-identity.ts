// Auditerar IDENTITETEN for alla spotifyTrackId i katalogen: ar ID:t verkligen
// den lat katalogens displayName pastar?
//
// Bakgrund (2026-08-19): `abba-waterloo` bar ID:t for Eurythmics "Sweet Dreams"
// - DJ:ns kort sa "ABBA / Waterloo" medan Spotify spelade nagot helt annat.
// `npm run spotify-validate` fangar INTE detta: den kollar bara att ID:t lever
// (oEmbed 404 = dott), aldrig VILKEN lat det ar.
//
// INGEN Spotify Web API (Plan B) - vi laser publika open.spotify.com-sidors
// meta-taggar, samma metod som spotify-album-audit:
//   og:title                   -> lattitel ("Waterloo - 2007 Remaster")
//   music:musician_description -> artist(er) ("ABBA")
//   og:description             -> "Artist - Album - Song - Ar"
//
// Jamfors mot katalogens displayName ("Titel - Artist"). Normaliseringen tar
// bort remaster-/version-suffix, parenteser, diakriter och skiljetecken, sa
// "Waterloo - 2007 Remaster" matchar "Waterloo". Traffar flaggas som:
//   MISMATCH - varken titel eller artist matchar (nastan sakert fel ID)
//   TITLE    - artist matchar men inte titeln (fel lat av ratt artist)
//   ARTIST   - titel matchar men inte artisten (cover/tribute/fel version)
// Transienta fetch-fel retry:as en gang och flaggas ALDRIG (listas som okanda).
//
// Output: konsol-summary + backend/output/spotify-track-identity.md
// Exit-kod 1 vid MISMATCH OCH TITLE (se kommentaren vid process.exit nedan) -
// bada innebar att DJ:n far fel lat. ARTIST-flaggor ar ofta godartade
// (stavning/feat/ampersand) och far inte rodfarga nightly-cron:en.
//
// Kor: cd backend && npm run spotify-identity-audit

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalog } from '../content/registry';

const TRACK_PAGE_BASE = 'https://open.spotify.com/track/';
const THROTTLE_MS = 400;
// MINIMAL UA ar avsiktlig - med full Chrome-UA servar Spotify JS-app-skalet
// utan meta-taggar. Samma val som audit-spotify-album-context.ts.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

type Verdict = 'ok' | 'mismatch' | 'title' | 'artist' | 'unknown';

interface Row {
  file: string;
  itemId: string;
  displayName: string;
  trackId: string;
  catalogTitle: string;
  catalogArtist: string | null;
  spotifyTitle: string | null;
  spotifyArtist: string | null;
  verdict: Verdict;
  error: string | null;
}

async function fetchHtml(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 200) return await res.text();
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      return null;
    } catch {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  return null;
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"`, 'i'),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key}"`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

/** Skalar bort version-brus sa "Waterloo - 2007 Remaster" motsvarar "Waterloo". */
function normalize(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      // " - 2007 Remaster", " - Single Version", " - Radio Edit" osv.
      .replace(
        /\s*-\s*(\d{4}\s*)?(digital\s+)?(remaster(ed)?|mono|stereo|single|radio|album|edit|version|mix|live|re-?recorded)\b.*$/i,
        '',
      )
      // "(feat. X)", "[Remastered]"
      .replace(/[([][^)\]]*[)\]]/g, ' ')
      .replace(/\b(feat|ft|featuring|with)\b.*$/i, ' ')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  );
}

/** Lost matchningstest - containment at bada hall racker. */
function matches(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/** Spotify listar ofta "Eurythmics, Annie Lennox, Dave Stewart" - nagon racker. */
function artistMatches(catalogArtist: string, spotifyArtists: string): boolean {
  if (matches(catalogArtist, spotifyArtists)) return true;
  return spotifyArtists.split(/[,·]/).some((a) => matches(catalogArtist, a));
}

/**
 * Titel-matchning ar RIKTAD och strikt: Spotifys og:title far bara vara langre
 * (version-/remaster-suffix normalizern kanske missar), men katalogtiteln maste
 * rymmas i den som en hel ord-sekvens. Vi tillater INTE det omvanda
 * (katalogtiteln innehaller Spotify-titeln) - det lat en fororenad
 * "Titel - Artist"-strang svalja en kort Spotify-titel och ge falskt OK.
 */
function titleMatches(catalogTitle: string, spotifyTitle: string): boolean {
  const c = normalize(catalogTitle);
  const s = normalize(spotifyTitle);
  if (!c || !s) return false;
  if (c === s) return true;
  // Ord-gransat: katalogens tokens maste finnas som sammanhangande hela ord i
  // Spotify-titeln (inte som godtycklig delstrang).
  return ` ${s} `.includes(` ${c} `);
}

/**
 * Splittar "Titel - Artist" pa SISTA dash-separatorn. Separatorn ar oftast
 * spaced em-dash, men hyphen/en-dash och avvikande mellanrum forekommer och
 * gjorde tidigare catalogArtist=null (artist-kollen hoppades over OCH
 * catalogTitle blev hela strangen -> falskt OK). Em/en-dash far sakna
 * mellanrum; plain hyphen kraver omgivande blanksteg sa vi inte klyver ett
 * bindestreck INUTI titeln ("Jean-Michel Jarre", "Ding-Dong Song").
 */
function splitTitleArtist(displayName: string): {
  title: string;
  artist: string | null;
} {
  const sep = /\s*[—–]\s*|\s+-\s+/g;
  let last: { index: number; length: number } | null = null;
  for (const m of displayName.matchAll(sep)) {
    last = { index: m.index, length: m[0].length };
  }
  if (!last) return { title: displayName.trim(), artist: null };
  const title = displayName.slice(0, last.index).trim();
  const artist = displayName.slice(last.index + last.length).trim();
  return { title: title || displayName.trim(), artist: artist || null };
}

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const refs: Omit<Row, 'spotifyTitle' | 'spotifyArtist' | 'verdict' | 'error'>[] = [];
  for (const [file, content] of catalog.files) {
    for (const item of content.items) {
      if (!item.spotifyTrackId) continue;
      // displayName-formatet ar "Titel - Artist"; splittas tolerant mot
      // dash-varianter (em/en-dash, spaced hyphen) sa artisten alltid tas ut.
      const { title, artist } = splitTitleArtist(item.displayName);
      refs.push({
        file,
        itemId: item.id,
        displayName: item.displayName,
        trackId: item.spotifyTrackId,
        catalogTitle: title,
        catalogArtist: artist,
      });
    }
  }

  console.log(`Auditerar identitet for ${refs.length} spotifyTrackId(s)...`);

  const rows: Row[] = [];
  for (const [i, ref] of refs.entries()) {
    const row: Row = {
      ...ref,
      spotifyTitle: null,
      spotifyArtist: null,
      verdict: 'unknown',
      error: null,
    };
    const html = await fetchHtml(`${TRACK_PAGE_BASE}${ref.trackId}`);
    if (!html) {
      row.error = 'track-sidan kunde inte hamtas';
    } else {
      const title = metaContent(html, 'og:title');
      const artist =
        metaContent(html, 'music:musician_description') ??
        metaContent(html, 'og:description')?.split('·')[0] ??
        null;
      row.spotifyTitle = title ? decodeEntities(title) : null;
      row.spotifyArtist = artist ? decodeEntities(artist).trim() : null;

      if (!row.spotifyTitle) {
        row.error = 'meta-taggar saknas pa track-sidan';
      } else {
        const titleOk = titleMatches(ref.catalogTitle, row.spotifyTitle);
        const artistOk =
          !ref.catalogArtist || !row.spotifyArtist
            ? true
            : artistMatches(ref.catalogArtist, row.spotifyArtist);
        row.verdict =
          titleOk && artistOk
            ? 'ok'
            : !titleOk && !artistOk
              ? 'mismatch'
              : titleOk
                ? 'artist'
                : 'title';
      }
    }
    rows.push(row);

    const tag =
      row.verdict === 'ok'
        ? 'OK  '
        : row.verdict === 'mismatch'
          ? 'FEL '
          : row.verdict === 'title'
            ? 'TITL'
            : row.verdict === 'artist'
              ? 'ARTI'
              : '??? ';
    console.log(
      `[${String(i + 1).padStart(3)}/${refs.length}] ${tag} ${ref.itemId}` +
        (row.verdict === 'ok'
          ? ''
          : `  ->  Spotify: "${row.spotifyTitle ?? '-'}" / ${row.spotifyArtist ?? '-'}${
              row.error ? ` (${row.error})` : ''
            }`),
    );

    if (i < refs.length - 1) await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  const bad = rows.filter(
    (r) => r.verdict === 'mismatch' || r.verdict === 'title' || r.verdict === 'artist',
  );
  const unknown = rows.filter((r) => r.verdict === 'unknown');

  const lines: string[] = [
    '# Spotify track identity audit',
    '',
    `Auditerade: ${rows.length} - OK: ${rows.length - bad.length - unknown.length} - Flaggade: ${bad.length} - Okanda: ${unknown.length}`,
    '',
  ];
  if (bad.length) {
    lines.push(
      '## Flaggade',
      '',
      '| Verdict | Item | Katalog | Spotify | Track |',
      '|---|---|---|---|---|',
    );
    for (const r of bad) {
      lines.push(
        `| ${r.verdict.toUpperCase()} | \`${r.itemId}\` (${r.file}) | ${r.displayName} | ${
          r.spotifyTitle ?? '-'
        } — ${r.spotifyArtist ?? '-'} | [${r.trackId}](${TRACK_PAGE_BASE}${r.trackId}) |`,
      );
    }
    lines.push('');
  }
  if (unknown.length) {
    lines.push('## Okanda (transienta fel - kolla manuellt)', '');
    for (const r of unknown)
      lines.push(`- \`${r.itemId}\` - ${r.error ?? 'okant'} (${TRACK_PAGE_BASE}${r.trackId})`);
    lines.push('');
  }

  const outDir = join(__dirname, '..', 'output');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'spotify-track-identity.md');
  writeFileSync(outFile, lines.join('\n'), 'utf8');

  console.log(
    `\nOK: ${rows.length - bad.length - unknown.length}  Flaggade: ${bad.length}  Okanda: ${unknown.length}`,
  );
  console.log(`Rapport: ${outFile}`);
  // Exit 1 pa MISMATCH (varken titel eller artist matchar = sakert fel lat)
  // OCH pa TITLE (ratt artist men fel lat - DJ:n far anda fel lat i
  // hogtalaren). ARTIST-flaggor (titeln matchar, artist-strangen skiljer:
  // stavning, "- Radio Edit", feat-credits, ampersand) ar ofta godartade och
  // far inte rodfarga nightly-cron:en - de listas bara i rapporten.
  if (rows.some((r) => r.verdict === 'mismatch' || r.verdict === 'title')) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
