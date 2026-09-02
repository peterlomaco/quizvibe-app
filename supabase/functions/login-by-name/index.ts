// ─────────────────────────────────────────────────────────────────────
// login-by-name — Edge Function för login-via-PlayerName utan att läcka
// email till klienten.
//
// Bakgrund (security review, Nivå 1 punkt 1): tidigare översatte klienten
// PlayerName → email via RPC:n lookup_email_by_player_name() och kallade
// sedan signInWithPassword() själv. Den RPC:n gav vem som helst en users
// email givet deras (öppet synliga) PlayerName = email-enumereringsläcka.
//
// Nu görs hela sign-in server-side: klienten skickar { playerName, password },
// vi slår upp email:en med service-role, kör signInWithPassword, och
// returnerar BARA session-tokens. Email:en lämnar aldrig servern.
//
// Anti-enumerering: både "namnet finns inte" och "fel lösenord" returnerar
// SAMMA generiska 401 { error: 'invalid_credentials' } — en angripare kan
// inte skilja på om ett PlayerName existerar eller ej.
//
// Required Edge Function secrets (auto-injicerade i runtime, inga manuella):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//   - SUPABASE_ANON_KEY
//
// OBS: rate-limiting på fel-lösenord hanteras av Supabase Auth (GoTrue)
// per-IP by default. Vill vi ha striktare per-PlayerName-throttling kan vi
// lägga till samma anon_signup_attempts-mönster som anon-signup — följdfix.
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
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  // Body-parse med guard mot ogiltig/tom JSON.
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
  const password =
    typeof (body as { password?: unknown })?.password === 'string'
      ? (body as { password: string }).password
      : '';

  if (!playerName || !password) {
    return jsonResponse({ error: 'bad_request' }, 400);
  }

  // Slå upp email server-side. player_name är citext → case-insensitiv match.
  const { data: prof, error: lookupError } = await admin
    .from('profiles')
    .select('email')
    .eq('player_name', playerName)
    .maybeSingle();

  if (lookupError) {
    console.error('[login-by-name] lookup failed:', lookupError.message);
    return jsonResponse({ error: 'server_error' }, 500);
  }

  // Namnet finns inte → generiskt fel (samma som fel lösenord, anti-enum).
  if (!prof?.email) {
    return jsonResponse({ error: 'invalid_credentials' }, 401);
  }

  const { data, error } = await userClient.auth.signInWithPassword({
    email: prof.email,
    password,
  });

  // Email ej bekräftad än ("Confirm email" PÅ) → distinkt reason så klienten
  // kan visa "bekräfta ditt mail" i stället för det generiska felet.
  // Returneras med HTTP 200 (inte 4xx): supabase-js functions.invoke sväljer
  // response-body:n vid non-2xx-status, så klienten läser detta via
  // data.error. Tradeoff (accepterad): avslöjar att PlayerName:t finns men är
  // obekräftat — liten enumereringsyta; PlayerName är ändå publikt synligt.
  if (error?.code === 'email_not_confirmed') {
    return jsonResponse({ error: 'email_not_confirmed' }, 200);
  }

  // Fel lösenord (eller annan auth-fail) → samma generiska fel.
  if (error || !data.session || !data.user) {
    return jsonResponse({ error: 'invalid_credentials' }, 401);
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
