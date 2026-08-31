// ─────────────────────────────────────────────────────────────────────
// revenuecat-webhook — E1 (Critical) server-side premium-authority.
//
// Tar emot RevenueCat webhook-events och skriver den serverägda
// subscription_entitlements-raden (migration 0046) via service_role. Detta är
// hur premium blir SERVER-sanning i stället för en klient-togglingsbar
// AsyncStorage-boolean.
//
// ⚠ INERT tills den deployas OCH RC-webhooken pekas hit (se aktiverings-
// ordningen i 0046). Ingen befintlig klientkod anropar denna function.
//
// Required Edge Function secrets (Dashboard → Edge Functions → revenuecat-
// webhook → Settings → Add new secret):
//   - REVENUECAT_WEBHOOK_SECRET  — MANUELL. Samma värde sätts i RevenueCat
//     Dashboard → Integrations → Webhooks → Authorization header. Skyddar
//     endpointen mot spoofade events.
//   - SUPABASE_URL               — auto-injicerat
//   - SUPABASE_SERVICE_ROLE_KEY  — auto-injicerat
//
// ⚠ Verify JWT-toggeln för DENNA function MÅSTE vara AV (Dashboard): RC anropar
// utan Supabase-JWT. Vi autentiserar i stället via den delade secreten nedan.
//
// PREREQUISITE: klienten MÅSTE sätta RevenueCat app_user_id = Supabase
// auth.uid() (Purchases.logIn(uid)) — annars kan event.app_user_id inte
// nycklas till en auth.users-rad och upserten faller på FK:n.
// ─────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// RC-event-typer som INNEBÄR aktivt entitlement (subscription lever).
const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
]);
// Typer som INNEBÄR att entitlementet inte längre gäller.
const INACTIVE_EVENTS = new Set(['EXPIRATION', 'CANCELLATION', 'BILLING_ISSUE', 'SUBSCRIPTION_PAUSED']);

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Auth: RC skickar den konfigurerade Authorization-headern rakt av.
  const auth = req.headers.get('authorization') ?? '';
  const provided = auth.replace(/^Bearer\s+/i, '').trim();
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  let payload: { event?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const event = payload.event ?? {};
  const type = String(event['type'] ?? '');
  const appUserId = String(event['app_user_id'] ?? '');
  const productId = event['product_id'] ? String(event['product_id']) : null;
  const entitlementId = event['entitlement_id'] ? String(event['entitlement_id']) : null;
  const expiryMs = typeof event['expiration_at_ms'] === 'number' ? (event['expiration_at_ms'] as number) : null;

  // app_user_id måste vara ett Supabase-uid (klienten sätter det via
  // Purchases.logIn(uid)). Anonyma RC-id:n (`$RCAnonymousID:…`) kan inte
  // nycklas hit och ignoreras tyst (200 så RC inte retriar i evighet).
  if (!appUserId || appUserId.startsWith('$RCAnonymousID')) {
    return json({ ok: true, ignored: 'no_supabase_uid' }, 200);
  }

  const isActive = ACTIVE_EVENTS.has(type)
    ? true
    : INACTIVE_EVENTS.has(type)
      ? false
      : // Okänd typ (TEST, TRANSFER, …): härled ur utgångstiden om möjlig.
        expiryMs !== null
        ? expiryMs > Date.now()
        : null;

  if (isActive === null) {
    return json({ ok: true, ignored: `unhandled_type:${type}` }, 200);
  }

  const { error } = await admin
    .from('subscription_entitlements')
    .upsert(
      {
        user_id: appUserId,
        is_active: isActive,
        product_id: productId,
        entitlement_id: entitlementId,
        expires_at: expiryMs !== null ? new Date(expiryMs).toISOString() : null,
        last_event_type: type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    // 500 → RC retriar. FK-violation (app_user_id inte en auth.users-rad) är
    // dock permanent — logga men svara 200 så RC inte retriar för evigt.
    console.error('[revenuecat-webhook] upsert failed:', error.message);
    const permanent = error.code === '23503'; // foreign_key_violation
    return json({ error: 'upsert_failed', detail: error.message }, permanent ? 200 : 500);
  }

  return json({ ok: true, user_id: appUserId, is_active: isActive }, 200);
});
