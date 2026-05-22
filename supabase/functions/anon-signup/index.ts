// ─────────────────────────────────────────────────────────────────────
// anon-signup — Edge Function som wrap:ar supabase.auth.signInAnonymously
// med per-IP-rate-limiting (max 5 signups per IP per 1h-fönster).
//
// Pre-launch bot-skydd för anon-sign-in. Skyddar mot:
//   - Naiva bots som anropar appens egna endpoints i loop
//   - Manual abuse (en användare som scriptar mot vår API)
//
// Skyddar INTE mot:
//   - Sofistikerade attackers som extractar SUPABASE_URL + anon-key från
//     IPA/APK-bundlen och anropar Supabase auth-endpoints direkt utan att
//     gå via vår function. Mitigering kräver disabling av direct anon-
//     sign-in i Supabase + custom JWT-issuance (post-launch om vi ser
//     bot-trafik), eller App Attest (iOS) + Play Integrity (Android).
//
// Required Edge Function secrets (sätts i Supabase Dashboard → Edge
// Functions → anon-signup → Settings → Add new secret):
//   - SUPABASE_URL — auto-injicerat
//   - SUPABASE_SERVICE_ROLE_KEY — auto-injicerat
//   - SUPABASE_ANON_KEY — auto-injicerat
// (Inga manuella secrets behövs — alla tre är auto-tillgängliga i
// Edge Functions-runtime.)
// ─────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1h
const MAX_SIGNUPS_PER_IP = 5;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const userClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function getClientIp(req: Request): string {
  // Supabase Edge Runtime forwards x-forwarded-for med klient-IP först.
  // Fly.io (Supabase:s host) prepender Fly-Client-IP också; vi prefererar
  // x-forwarded-for som standardiserad.
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const first = xff.split(',')[0].trim();
  return first || req.headers.get('fly-client-ip') || 'unknown';
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const ip = getClientIp(req);
  const cutoffIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  // Cleanup-first: ta bort attempts äldre än 1h för denna IP. Håller
  // tabellen rimligt liten utan separat cron-cleanup.
  await admin
    .from('anon_signup_attempts')
    .delete()
    .eq('ip', ip)
    .lt('created_at', cutoffIso);

  // Räkna kvarvarande attempts för denna IP inom fönstret.
  const { count, error: countError } = await admin
    .from('anon_signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip);

  if (countError) {
    console.error('[anon-signup] count failed:', countError.message);
    return jsonResponse({ error: 'rate_limit_check_failed' }, 500);
  }

  if ((count ?? 0) >= MAX_SIGNUPS_PER_IP) {
    return jsonResponse(
      {
        error: 'rate_limited',
        message: `Too many sign-in attempts. Try again in 1 hour.`,
        retry_after_seconds: 3600,
      },
      429,
    );
  }

  // Logga attempt FÖRE sign-up så även misslyckade signups räknas
  // (anti-bruteforce). Race-condition acceptabel: vid concurrent burst
  // kan en IP nå MAX+1 ─ fortsatt bot-skydd.
  const { error: insertError } = await admin
    .from('anon_signup_attempts')
    .insert({ ip });

  if (insertError) {
    console.error('[anon-signup] insert failed:', insertError.message);
    return jsonResponse({ error: 'rate_limit_log_failed' }, 500);
  }

  // Skapa anon-user via vanlig client (admin-API:t har inte
  // signInAnonymously eftersom det är client-side concept).
  const { data, error } = await userClient.auth.signInAnonymously();

  if (error || !data.session || !data.user) {
    console.error('[anon-signup] signInAnonymously failed:', error?.message);
    return jsonResponse(
      {
        error: 'signup_failed',
        message: error?.message ?? 'Unknown sign-up error',
      },
      500,
    );
  }

  return jsonResponse(
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    },
    200,
  );
});
