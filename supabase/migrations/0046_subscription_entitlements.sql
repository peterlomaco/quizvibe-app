-- ─────────────────────────────────────────────────────────────────────
-- 0046_subscription_entitlements — E1 (Critical) SERVER-side premium-authority
--
-- ⚠ FOUNDATION — INERT tills RevenueCat-webhooken är konfigurerad OCH klienten
-- är cutover:ad. Att applicera denna migration ensam ändrar INGET beteende:
-- tabellen är tom och ingen klientkod läser den ännu. Följ aktiverings-
-- ordningen sist i filen. Applicera i staging först.
--
-- Problem (E1): premium/credits/host-limits är i dag 100% klient-auktoritativa
-- (hasPremiumSubscription() läser en AsyncStorage-boolean; rooms.host_is_premium
-- skrivs av klienten). En moddad klient låser upp allt betalt gratis.
--
-- Lösning: en serverägd entitlement-tabell som ENBART en RevenueCat-webhook
-- (service_role) skriver. Klienten får läsa sin EGEN rad men aldrig skriva.
-- När cutover är klar blir denna rad sanningen för premium, inte klient-flaggan.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.subscription_entitlements (
  -- 1:1 mot auth.users. RevenueCat app_user_id MÅSTE sättas till Supabase
  -- auth.uid() i klienten (Purchases.logIn(uid)) för att webhooken ska kunna
  -- nyckla hit — se aktiverings-ordningen nedan.
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default false,
  product_id text,
  entitlement_id text,
  -- Millisekund-precision från RC:s expiration_at_ms; null för icke-utgående.
  expires_at timestamptz,
  -- Senaste RC-event-typ som satte raden (INITIAL_PURCHASE, RENEWAL,
  -- CANCELLATION, EXPIRATION, BILLING_ISSUE, PRODUCT_CHANGE, …). Diagnostik.
  last_event_type text,
  updated_at timestamptz not null default now()
);

create trigger subscription_entitlements_updated_at
before update on public.subscription_entitlements
for each row execute function public.touch_updated_at();

-- ── RLS: user läser BARA sin egen rad, ingen klient skriver ──────────
-- Webhooken använder service_role → kringgår RLS → kan upserta valfri rad.
alter table public.subscription_entitlements enable row level security;

create policy "user reads own entitlement"
on public.subscription_entitlements for select
to authenticated
using (user_id = auth.uid());

-- (Inga INSERT/UPDATE/DELETE-policyer → deny-all för klienter. Endast
--  service_role via webhooken skriver.)

-- ── Serverside sanningskälla (för framtida RPC-gates) ────────────────
-- SECURITY DEFINER så en RPC kan avgöra premium utan att exponera hela raden,
-- och så framtida host-lobby-/credit-RPC:er kan gata på detta i stället för
-- att lita på klientens rooms.host_is_premium.
create or replace function public.has_active_premium(p_uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscription_entitlements e
    where e.user_id = p_uid
      and e.is_active
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

grant execute on function public.has_active_premium(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- AKTIVERINGS-ORDNING (gör INTE detta som en del av v1.0-launchen om RC-
-- webhooken inte är verifierad — se Phase 4 i pre-launch-planen):
--
-- 1. I klienten: sätt RevenueCat app_user_id = Supabase auth.uid()
--    (Purchases.logIn(uid) vid SIGNED_IN, Purchases.logOut() vid logout) i
--    src/lib/iap.ts / app/_layout.tsx. Utan detta kan webhooken inte nyckla
--    entitlementet till rätt user.
-- 2. Deploya Edge Function `revenuecat-webhook` (supabase/functions/) och sätt
--    dess REVENUECAT_WEBHOOK_SECRET-secret.
-- 3. I RevenueCat Dashboard → Project → Integrations → Webhooks: peka på
--    funktionens URL + sätt Authorization-headern till samma secret.
-- 4. Verifiera i staging att köp/förnyelse/utgång skriver rätt rad här.
-- 5. FÖRST DÅ: cutover hasPremiumSubscription() till att läsa server-
--    entitlementet (dual-read: server OR lokal flagga under en release, sedan
--    server-only). Ta INTE bort klientens lokala premium-läsning förrän
--    tabellen bevisligen populeras — annars blir alla icke-premium.
-- ─────────────────────────────────────────────────────────────────────
