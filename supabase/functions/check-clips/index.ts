// ─────────────────────────────────────────────────────────────────────
// check-clips — pre-game kontroll av YouTube-klipp (2026-09-23).
//
// Anropas av klientens pre-game-check (src/utils/youtubeLiveness.ts) INNAN
// första frågan spelas. Returnerar de videoIds som INTE ska spelas, så
// quiz.tsx kan byta ut frågan mot en reserv innan Play — spelaren märker
// ingenting och den utbytta frågan räknas som vanligt.
//
// Ett klipp räknas som DÖTT om något av följande gäller:
//   1. YouTube Data API: saknas (raderat) / inte public|unlisted / ej
//      bearbetat / embeddable=false / åldersbegränsat / regionRestriction
//      som utesluter SE.
//   2. BLOCKLISTA: klippet har rapporterats som 'video_not_found' eller
//      'embed_not_allowed' från en riktig spelares enhet (clip_playback_errors,
//      migration 0056) de senaste 30 dagarna och raden är inte `cleared`.
//      Punkt 2 är enda sättet att fånga claim-baserade embed-block per land —
//      de syns varken i Data API eller oEmbed.
//
// Nyckeln ligger bara här (secret YOUTUBE_API_KEY) — aldrig i app-bundlen.
// Kvot: 1 enhet per 50 ids. Resultat cachas per instans i 6 h.
//
// Verify JWT-toggeln MÅSTE vara AV (samma som anon-signup/login-by-name:
// sb_publishable_*-nycklar är inte legacy-JWT → gateway 401).
//
// Secrets: YOUTUBE_API_KEY (manuell), SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// (auto-injicerade).
// ─────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') ?? '';

// V1 levererar bara till Sverige. Utöka när fler marknader öppnas
// (samma lista som backend/youtube/client.ts SERVED_REGIONS).
const SERVED_REGIONS = ['SE'];
const MAX_IDS = 60;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const BLOCKLIST_CODES = ['video_not_found', 'embed_not_allowed'];
const ID_RE = /^[A-Za-z0-9_-]{11}$/;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

// videoId -> { dead, at } — bara Data API-utfall cachas (blocklistan läses
// alltid färskt så en ny rapport slår igenom direkt).
const apiCache = new Map<string, { dead: boolean; at: number }>();

interface YtItem {
  id: string;
  status?: { privacyStatus?: string; embeddable?: boolean; uploadStatus?: string };
  contentDetails?: {
    regionRestriction?: { allowed?: string[]; blocked?: string[] };
    contentRating?: { ytRating?: string };
  };
}

function isDeadByApi(item: YtItem): boolean {
  const s = item.status ?? {};
  if (s.privacyStatus && s.privacyStatus !== 'public' && s.privacyStatus !== 'unlisted') return true;
  if (s.uploadStatus && s.uploadStatus !== 'processed' && s.uploadStatus !== 'uploaded') return true;
  if (s.embeddable === false) return true;
  const cd = item.contentDetails ?? {};
  if (cd.contentRating?.ytRating === 'ytAgeRestricted') return true;
  const rr = cd.regionRestriction;
  if (rr) {
    if (rr.blocked && SERVED_REGIONS.some((r) => rr.blocked!.includes(r))) return true;
    if (rr.allowed && SERVED_REGIONS.some((r) => !rr.allowed!.includes(r))) return true;
  }
  return false;
}

async function checkViaApi(ids: string[]): Promise<{ dead: Set<string>; ok: boolean }> {
  const dead = new Set<string>();
  const now = Date.now();
  const toFetch: string[] = [];
  for (const id of ids) {
    const c = apiCache.get(id);
    if (c && now - c.at < CACHE_TTL_MS) {
      if (c.dead) dead.add(id);
    } else {
      toFetch.push(id);
    }
  }
  if (toFetch.length === 0 || !YOUTUBE_API_KEY) return { dead, ok: !!YOUTUBE_API_KEY || toFetch.length === 0 };
  let ok = true;
  for (let i = 0; i < toFetch.length; i += 50) {
    const chunk = toFetch.slice(i, i + 50);
    const url =
      'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails' +
      `&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        ok = false;
        continue; // fail-open för den här chunken
      }
      const json = (await res.json()) as { items?: YtItem[] };
      const found = new Map((json.items ?? []).map((it) => [it.id, it]));
      for (const id of chunk) {
        const it = found.get(id);
        const isDead = !it || isDeadByApi(it); // saknas i svaret = raderat/privat
        apiCache.set(id, { dead: isDead, at: now });
        if (isDead) dead.add(id);
      }
    } catch {
      ok = false;
    }
  }
  return { dead, ok };
}

async function checkBlocklist(ids: string[]): Promise<Set<string>> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from('clip_playback_errors')
    .select('video_id')
    .in('video_id', ids)
    .in('error_code', BLOCKLIST_CODES)
    .eq('cleared', false)
    .gte('created_at', since);
  if (error) {
    // 0056 ej applicerad eller tillfälligt fel — fail-open.
    console.warn('[check-clips] blocklist query failed:', error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r: { video_id: string }) => r.video_id));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }
  const raw = (body as { videoIds?: unknown })?.videoIds;
  if (!Array.isArray(raw)) return jsonResponse({ error: 'videoIds_required' }, 400);
  const ids = Array.from(
    new Set(raw.filter((v): v is string => typeof v === 'string' && ID_RE.test(v))),
  ).slice(0, MAX_IDS);
  if (ids.length === 0) return jsonResponse({ dead: [], apiOk: true }, 200);

  const [api, blocked] = await Promise.all([checkViaApi(ids), checkBlocklist(ids)]);
  const dead = new Set([...api.dead, ...blocked]);
  return jsonResponse({ dead: Array.from(dead), apiOk: api.ok }, 200);
});
