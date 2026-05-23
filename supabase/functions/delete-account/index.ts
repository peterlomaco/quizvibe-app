// ─────────────────────────────────────────────────────────────────────
// delete-account — Edge Function som permanent raderar inloggad user.
//
// Apple App Store Guideline 5.1.1(v) kräver att apps med kontoflow
// erbjuder in-app account deletion (email-only räcker inte). Den här
// function:n körs när användaren tappar "Delete Account" i Profile-
// skärmens logout-sheet.
//
// Flöde:
//   1. Klient skickar POST med Authorization: Bearer <access_token>.
//   2. Vi verifierar JWT:n via admin.auth.getUser(token) — failure → 401.
//   3. Anropar admin.auth.admin.deleteUser(user_id) med service-role-key.
//   4. Postgres-CASCADE rensar resten automatiskt:
//        - profiles (FK profiles.id → auth.users(id) ON DELETE CASCADE)
//        - rooms där user var host (FK rooms.host_user_id → CASCADE)
//        - waiting_invites till/från user (FK to_user_id → CASCADE)
//      lobby_players.user_id sätts till NULL (SET NULL — raderna lever
//      kvar anonymiserade tills rooms-CASCADE eller 24h-expiry tar dem).
//
// Required Edge Function secrets (auto-injicerade av Supabase runtime):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
// Inga manuella secrets behövs.
//
// Verify JWT with legacy secret-toggle i Dashboard MÅSTE vara AV — samma
// config som anon-signup. Med moderna sb_publishable_*-keys avvisar
// gateway:n requests med UNAUTHORIZED_INVALID_JWT_FORMAT när toggle:n
// är PÅ (publishable-keys är inte legacy-secret-signed). Vi har egen
// JWT-validation via admin.auth.getUser(token) nedan.
// ─────────────────────────────────────────────────────────────────────

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  // Authorization-headern sätts automatiskt av supabase-js när klienten
  // anropar functions.invoke() med en aktiv session.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return json({ error: 'missing_token' }, 401);
  }

  // Verifiera token:en och hämta user-id. admin.auth.getUser tar token
  // som argument och validerar mot Supabase auth-service.
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return json({ error: 'invalid_token', message: userError?.message }, 401);
  }
  const userId = userData.user.id;

  // Blockera anon-accounts från att triggra deletion — de har inget att
  // radera (ingen profil, inget email), så anropet är meningslöst och
  // potentiellt vilseledande för UI:t. Klienten ska bara visa Delete
  // Account-knappen för riktiga konton i alla fall, men dubbel-check
  // här som server-side guard.
  if (userData.user.is_anonymous) {
    return json({ error: 'anonymous_account_cannot_delete' }, 400);
  }

  // Radera auth-user. Postgres CASCADE rensar profiles, rooms,
  // waiting_invites automatiskt via befintliga FK-constraints.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[delete-account] admin.deleteUser failed:', deleteError);
    return json({ error: 'delete_failed', message: deleteError.message }, 500);
  }

  return json({ ok: true }, 200);
});

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
