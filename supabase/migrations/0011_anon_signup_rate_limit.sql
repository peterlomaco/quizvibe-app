-- ─────────────────────────────────────────────────────────────────────
-- 0011_anon_signup_rate_limit — pre-launch bot-skydd för anon-signups
--
-- Edge Function 'anon-signup' (supabase/functions/anon-signup/index.ts)
-- wrap:ar supabase.auth.signInAnonymously() med per-IP-rate-limiting:
-- max 5 anon-signups per IP per 1h-fönster. Skyddar mot bots som annars
-- skulle kunna spamma anon-signups → MAU-bloat (Supabase free 50k MAU,
-- sedan ~$0.00325/extra MAU).
--
-- Tabellen håller en ring-buffer av attempts per IP. Edge Function:n
-- delete:ar äldre rader för aktuell IP före count-check (inline cleanup),
-- så tabellen växer bara linjärt med antalet UNIKA aktiva IPs senaste
-- 1h. Vid normalt användande (~10-100k DAU) håller den sig under
-- 100k rader. Ingen separat cron-cleanup behövs för MVP-scope.
--
-- Applied via Supabase SQL Editor (manuell körning, vi använder inte
-- Supabase CLI migrations idag).
-- ─────────────────────────────────────────────────────────────────────

create table public.anon_signup_attempts (
  id bigserial primary key,
  -- Klientens IP från Edge Function:n (x-forwarded-for, första entry:n).
  -- Plain text — vi normaliserar inte IPv6 (Cloudflare/Fly canonicalizar
  -- innan vi ser det). text räcker för både IPv4 och IPv6.
  ip text not null,
  created_at timestamptz not null default now()
);

-- Driver Edge Function:s "räkna attempts för denna IP senaste 1h"-query.
-- DESC eftersom function:n typiskt LIMIT:ar för att snabbt hitta count.
create index anon_signup_attempts_ip_time_idx
  on public.anon_signup_attempts (ip, created_at desc);

-- RLS enable:as för att blockera direkt klient-access. Edge Function:n
-- använder service_role-key som bypassar RLS, så inga policies behövs.
-- Utan policies = ingen åtkomst för anon/authenticated-roller.
alter table public.anon_signup_attempts enable row level security;
