// ─────────────────────────────────────────────────────────────────────
// resend-by-name — skicka om aktiveringsmailet givet ett PlayerName, utan
// att läcka email:en klient-side.
//
// Bakgrund: login-via-PlayerName håller aldrig email:en klient-side (se
// login-by-name). När en användare försöker logga in med PlayerName men
// mailet inte är bekräftat vill vi ändå kunna erbjuda "skicka länken igen"
// — men klienten vet inte email:en. Denna funktion slår upp email:en
// server-side och ber GoTrue skicka om signup-bekräftelsen.
//
// Anti-enumerering: returnerar ALLTID ett generiskt 200 { ok: true },
// oavsett om PlayerName:t finns, redan är bekräftat, eller resend failar.
// En angripare kan alltså inte använda endpointen för att avgöra om ett
// PlayerName existerar. GoTrue rate-limitar dessutom resend per email
// (~1/60s) vilket dämpar inbox-spam via gissade PlayerNames.
//
// Required Edge Function secrets (auto-injicerade, inga manuella):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//   - SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

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

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'bad_request' }, 400);
  }

  const playerName =
    typeof (body as { playerName?: unknown })?.playerName === 'string'
      ? ((body as { playerName: string }).playerName).trim()
      : '';

  if (!playerName) {
    return jsonResponse({ error: 'bad_request' }, 400);
  }

  // Slå upp email server-side. player_name är citext → case-insensitiv match.
  const { data: prof, error: lookupError } = await admin
    .from('profiles')
    .select('email')
    .eq('player_name', playerName)
    .maybeSingle();

  // Vid uppslag-fel loggar vi men returnerar ändå generiskt ok (anti-enum).
  if (lookupError) {
    console.error('[resend-by-name] lookup failed:', lookupError.message);
    return jsonResponse({ ok: true }, 200);
  }

  // Namnet finns → be GoTrue skicka om signup-bekräftelsen. Redan bekräftat
  // konto → GoTrue no-op:ar. Fel loggas men läcker aldrig till klienten.
  if (prof?.email) {
    const { error: resendError } = await userClient.auth.resend({
      type: 'signup',
      email: prof.email,
    });
    if (resendError) {
      console.error('[resend-by-name] resend failed:', resendError.message);
    }
  }

  // Alltid generiskt ok — avslöjar aldrig om namnet fanns eller ej.
  return jsonResponse({ ok: true }, 200);
});
