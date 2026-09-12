// ─────────────────────────────────────────────────────────────────────
// send-welcome-email — skickar "ditt konto är aktiverat"-mailet EFTER att
// användaren klickat på aktiveringslänken och bekräftat sin email.
//
// Supabase Auth skickar SJÄLVT aktiveringsmailet (Confirm signup-templaten),
// men det finns ingen inbyggd "välkommen efter bekräftelse"-mail. Den här
// funktionen anropas av DB-trigger:n on_auth_user_confirmed (migration 0049)
// via pg_net, exakt när email_confirmed_at går från NULL → satt.
//
// Mailet skickas via en transaktionell email-provider (Resend som default).
// Samma provider bör konfigureras som custom SMTP i Supabase Auth för själva
// aktiveringsmailet — se plan/migration 0049-headern.
//
// Required Edge Function secrets (Dashboard → Edge Functions → send-welcome-
// email → Settings → Add new secret):
//   - WELCOME_HOOK_SECRET   — delad hemlighet; trigger:n skickar den i
//                             x-webhook-secret så bara vår DB kan anropa.
//   - RESEND_API_KEY        — API-nyckel till email-providern.
//   - WELCOME_EMAIL_FROM    — (valfri) avsändare, t.ex.
//                             "QuizVibe <noreply@quizvibe.se>". Domänen måste
//                             vara verifierad hos providern. Default nedan.
// ─────────────────────────────────────────────────────────────────────

const WELCOME_HOOK_SECRET = Deno.env.get('WELCOME_HOOK_SECRET') ?? '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const WELCOME_EMAIL_FROM =
  Deno.env.get('WELCOME_EMAIL_FROM') ?? 'QuizVibe <noreply@quizvibe.se>';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  // Endast vår DB-trigger får anropa den här funktionen.
  const provided = req.headers.get('x-webhook-secret') ?? '';
  if (!WELCOME_HOOK_SECRET || provided !== WELCOME_HOOK_SECRET) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let body: { email?: unknown; playerName?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'bad_request' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const playerName =
    typeof body.playerName === 'string' ? body.playerName.trim() : '';

  if (!email) {
    return jsonResponse({ error: 'bad_request' }, 400);
  }

  if (!RESEND_API_KEY) {
    console.error('[send-welcome-email] RESEND_API_KEY not configured');
    return jsonResponse({ error: 'email_provider_not_configured' }, 500);
  }

  const greeting = playerName ? `Hi ${playerName},` : 'Hi,';
  const subject = 'Your QuizVibe account is activated';
  const text =
    `${greeting}\n\n` +
    `Your QuizVibe account is activated. Jump in and put your ` +
    `Music & Film knowledge to the test.\n\n` +
    `QuizVibe is operated by LoMaCo AB, Sweden.`;
  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:#F4F7FB;margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:480px;background:#FFFFFF;border:1px solid #E6ECF3;
                    border-radius:16px;overflow:hidden;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                    Roboto,Helvetica,Arial,sans-serif;">
        <tr>
          <td align="center" style="padding:36px 32px 8px;">
            <img src="https://quizvibe.se/quizvibe-logo.png" width="72" height="72"
                 alt="QuizVibe" style="display:block;margin:0 auto;border:0;" />
            <div style="font-size:12px;font-weight:700;letter-spacing:2px;
                        text-transform:uppercase;color:#8A97AB;
                        margin-top:12px;">Music. Film.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0;">
            <div style="height:1px;background:#EDF1F6;margin:20px 0 4px;"></div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:20px 32px 0;">
            <h1 style="font-size:22px;font-weight:700;color:#1A2233;
                       margin:0 0 12px;">Your account is activated 🎉</h1>
            <p style="font-size:15px;line-height:1.55;color:#4A5568;margin:0 0 10px;">
              ${greeting}
            </p>
            <p style="font-size:15px;line-height:1.55;color:#4A5568;margin:0 0 8px;">
              Your QuizVibe account is ready. Jump in and put your
              Music &amp; Film knowledge to the test.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 32px;">
            <div style="height:1px;background:#EDF1F6;margin:16px 0 16px;"></div>
            <p style="font-size:12px;line-height:1.5;color:#9AA6B8;margin:0;">
              QuizVibe is operated by LoMaCo AB, Sweden.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: WELCOME_EMAIL_FROM,
        to: [email],
        subject,
        text,
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.error('[send-welcome-email] provider error:', resp.status, detail);
      return jsonResponse({ error: 'send_failed' }, 502);
    }
  } catch (err) {
    console.error('[send-welcome-email] fetch threw:', err);
    return jsonResponse({ error: 'send_failed' }, 502);
  }

  return jsonResponse({ ok: true }, 200);
});
