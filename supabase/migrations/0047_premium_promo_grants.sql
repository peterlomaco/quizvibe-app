-- ─────────────────────────────────────────────────────────────────────
-- 0047_premium_promo_grants — server-side gratismånad (1/konto) + vouchers
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Bakgrund: gratismånaden var tidigare BARA en device-lokal AsyncStorage-
-- post (promoPremium.CLAIM_KEY v2, ägarstämplad). Det gick att förnya hur
-- många gånger som helst, och en ominstallation / ny enhet gav en ny månad.
-- Peter vill att gratismånaden ska gälla EN gång per registrerad profil —
-- vilket kräver en server-post (AsyncStorage överlever inte ominstallation).
--
-- Denna migration lägger:
--   1. premium_grants — en rad per beviljad månad (gratis eller voucher).
--      Unikt partiellt index gör 'free_month' till exakt en per konto, evigt.
--   2. vouchers — individuella engångskoder Peter delar ut för hand. En kod
--      kan lösas in exakt en gång, sedan är den förbrukad.
--   3. RPC:er (SECURITY DEFINER) som klienten anropar: get_promo_premium_status
--      (läs), claim_free_month (bevilja gratismånad), redeem_voucher (lös in).
--   4. app_config-raden `paid_subscription` (default av) — feature-flagga för
--      det betalda 79 kr-abonnemanget, förberett men avstängt i v1.
--
-- REGEL (Peter): en månad kan bara aktiveras när INGEN premium är aktiv. Både
-- claim och redeem avvisas med 'already_active' om kontot redan har en
-- pågående grant. Ingen stapling — varje grant är alltid now() + 1 månad.
--
-- SÄKERHET: klienten kan ALDRIG skriva dessa tabeller direkt (inga
-- write-policyer). All skrivning går via SECURITY DEFINER-RPC:er som gatar på
-- att anroparen har en profiles-rad (= registrerad user; anon/gäst skriver
-- aldrig profiles — samma doktrin som create_aggregate_leaderboard i 0037).
--
-- KÄND BEGRÄNSNING: servern ser bara grant-tabellens premium, INTE RevenueCat-
-- entitlementet (det lever i 0046/klienten). Klienten gatar paid-active innan
-- den anropar, så en betald user blockeras i appen; ett handgjort anrop skulle
-- kunna skapa en ofarlig vilande grant. Ingen pengar-/abuse-risk — 1/konto och
-- engångs-voucher enforce:as ändå server-side.
-- ─────────────────────────────────────────────────────────────────────

-- ── premium_grants ───────────────────────────────────────────────────
create table if not exists public.premium_grants (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  source        text        not null check (source in ('free_month', 'voucher')),
  -- Satt enbart för source='voucher' (vilken kod som beviljade månaden).
  voucher_code  text,
  granted_at    timestamptz not null default now(),
  premium_until timestamptz not null,
  created_at    timestamptz not null default now()
);

comment on table public.premium_grants is
  'En rad per beviljad promo-/voucher-månad. Skrivs enbart via SECURITY '
  'DEFINER-RPC:er (claim_free_month / redeem_voucher). Klienten läser sin '
  'egen rad; den betalda prenumerationen bor separat (0046 + RevenueCat).';

-- Exakt EN gratismånad per konto, för alltid. Skyddar även mot race mellan
-- två samtidiga claim-anrop (unikhetsbrottet blir 23505, inte en andra grant).
create unique index if not exists premium_grants_one_free_month
  on public.premium_grants (user_id)
  where source = 'free_month';

create index if not exists premium_grants_user_idx
  on public.premium_grants (user_id);

alter table public.premium_grants enable row level security;

-- User läser BARA sina egna grants. Ingen write-policy → deny-all för klienter;
-- enbart SECURITY DEFINER-RPC:erna nedan (+ service_role) skriver.
drop policy if exists "user reads own premium grants" on public.premium_grants;
create policy "user reads own premium grants"
  on public.premium_grants
  for select
  to authenticated
  using (user_id = auth.uid());

-- ── vouchers ─────────────────────────────────────────────────────────
create table if not exists public.vouchers (
  code            text        primary key,             -- lagras VERSALT
  duration_months int         not null default 1 check (duration_months between 1 and 24),
  redeemed_by     uuid        references auth.users(id) on delete set null,
  redeemed_at     timestamptz,
  -- null = koden går aldrig ut. Sätt för tidsbegränsade koder.
  expires_at      timestamptz,
  -- Fritext för Peters bokföring (mottagarens namn e.d.).
  note            text,
  created_at      timestamptz not null default now()
);

comment on table public.vouchers is
  'Individuella engångskoder Peter delar ut. En kod löses in exakt en gång '
  '(redeem_voucher låser raden FOR UPDATE). RLS på UTAN läspolicy → klienter '
  'kan inte enumerera koder; validering sker i SECURITY DEFINER-RPC:n.';

-- RLS på men MEDVETET inga policyer alls → varken anon eller authenticated kan
-- läsa/gissa koder. Bara redeem_voucher (definer, kringgår RLS) + dashboard.
alter table public.vouchers enable row level security;

-- ── RPC: läs status ──────────────────────────────────────────────────
-- Returnerar { premium_until, free_month_used } för den INLOGGADE användaren.
-- Använder auth.uid() internt (tar ingen uid-param) så ingen kan läsa ett
-- annat kontos status. Namnet undviker kollision med has_active_premium (0046,
-- det separata framtida RevenueCat-webhook-lagret).
create or replace function public.get_promo_premium_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'premium_until', (
      select max(premium_until)
      from public.premium_grants
      where user_id = auth.uid()
        and premium_until > now()
    ),
    'free_month_used', exists (
      select 1 from public.premium_grants
      where user_id = auth.uid()
        and source = 'free_month'
    )
  );
$$;

revoke all on function public.get_promo_premium_status() from public;
grant execute on function public.get_promo_premium_status() to authenticated;

-- ── RPC: bevilja gratismånad ─────────────────────────────────────────
-- Fel surfas som raise exception (P0001); meddelandet ÄR reason-token som
-- klienten matchar (not_authenticated / not_registered / already_active /
-- already_used). Returnerar den nya premium_until vid framgång.
create or replace function public.claim_free_month()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  caller    uuid := auth.uid();
  new_until timestamptz;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  -- Registrerad-user-testet: anon/gäst skriver aldrig profiles.
  if not exists (select 1 from public.profiles p where p.id = caller) then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;

  -- Ingen stapling: kan bara aktiveras när ingen grant är aktiv.
  if exists (
    select 1 from public.premium_grants g
    where g.user_id = caller and g.premium_until > now()
  ) then
    raise exception 'already_active' using errcode = 'P0001';
  end if;

  -- En gratismånad per konto, för alltid.
  if exists (
    select 1 from public.premium_grants g
    where g.user_id = caller and g.source = 'free_month'
  ) then
    raise exception 'already_used' using errcode = 'P0001';
  end if;

  new_until := now() + interval '1 month';   -- Postgres klampar månadens längd
  insert into public.premium_grants (user_id, source, premium_until)
  values (caller, 'free_month', new_until);
  return new_until;
end;
$$;

revoke all on function public.claim_free_month() from public;
grant execute on function public.claim_free_month() to authenticated;

-- ── RPC: lös in voucher ──────────────────────────────────────────────
-- reason-token vid fel: not_authenticated / not_registered / already_active /
-- invalid_code / already_redeemed / expired. Row-lock (FOR UPDATE) gör
-- inlösen atomisk så samma kod inte kan förbrukas två gånger samtidigt.
create or replace function public.redeem_voucher(p_code text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  caller    uuid := auth.uid();
  norm_code text := upper(trim(p_code));
  v         public.vouchers%rowtype;
  new_until timestamptz;
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.profiles p where p.id = caller) then
    raise exception 'not_registered' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.premium_grants g
    where g.user_id = caller and g.premium_until > now()
  ) then
    raise exception 'already_active' using errcode = 'P0001';
  end if;

  select * into v from public.vouchers where code = norm_code for update;
  if not found then
    raise exception 'invalid_code' using errcode = 'P0001';
  end if;
  if v.redeemed_by is not null then
    raise exception 'already_redeemed' using errcode = 'P0001';
  end if;
  if v.expires_at is not null and v.expires_at < now() then
    raise exception 'expired' using errcode = 'P0001';
  end if;

  update public.vouchers
    set redeemed_by = caller, redeemed_at = now()
    where code = norm_code;

  new_until := now() + (v.duration_months || ' months')::interval;
  insert into public.premium_grants (user_id, source, voucher_code, premium_until)
  values (caller, 'voucher', norm_code, new_until);
  return new_until;
end;
$$;

revoke all on function public.redeem_voucher(text) from public;
grant execute on function public.redeem_voucher(text) to authenticated;

-- ── Feature-flagga: betalt månadsabonnemang ──────────────────────────
-- Förberett men AV i v1. Att flippa on: sätt {"enabled": true} i dashboarden —
-- men submitta först pkg_sub_monthly-IAP:n i App Store Connect, annars kan
-- kortet visas utan att köpet fungerar (Apple reviewer-reachability).
--
--   update public.app_config
--      set value = '{"enabled": true}'::jsonb, updated_at = now()
--    where key = 'paid_subscription';
--
-- `on conflict do nothing` så en om-körning inte nollställer ett läge Peter
-- redan ändrat i dashboarden. (Kräver att 0035 körts — app_config finns.)
insert into public.app_config (key, value)
values ('paid_subscription', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- MINTA VOUCHER-KODER (Peter, i SQL Editor — en rad per mottagare):
--   insert into public.vouchers (code, note)
--   values ('QVGIFT-A1B2', 'For <namn>');
-- Med annan längd/utgång:
--   insert into public.vouchers (code, duration_months, expires_at, note)
--   values ('QVGIFT-C3D4', 3, '2026-12-31T23:59:59Z', 'For <namn>');
-- Koden lagras/matchas VERSALT (redeem_voucher gör upper(trim(...))).
-- ─────────────────────────────────────────────────────────────────────
