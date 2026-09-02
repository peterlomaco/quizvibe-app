-- ─────────────────────────────────────────────────────────────────────
-- 0049_welcome_email_on_confirm — skicka välkomstmail när email bekräftas
-- Applied via Supabase SQL Editor (manuell körning, ej CLI).
--
-- Supabase Auth skickar SJÄLVT aktiveringsmailet (Confirm signup-templaten).
-- Det finns dock ingen inbyggd "välkommen efter bekräftelse"-mail. Denna
-- trigger fyrar exakt när auth.users.email_confirmed_at går NULL → satt och
-- anropar Edge Function send-welcome-email via pg_net (fire-and-forget).
--
-- MANUELLA STEG (Peter, EN gång) innan detta fungerar:
--   1. Deploya Edge Function send-welcome-email (klistra in vår kod i Code-
--      fliken + re-deploy — Dashboard "Deploy new function" seedar template).
--   2. Sätt dess secrets: WELCOME_HOOK_SECRET (valfri lång slumpsträng),
--      RESEND_API_KEY, ev. WELCOME_EMAIL_FROM.
--   3. Skapa TVÅ Vault-secrets (Dashboard → Project Settings → Vault):
--        welcome_email_url    = https://<PROJECT-REF>.functions.supabase.co/send-welcome-email
--        welcome_email_secret = <SAMMA värde som WELCOME_HOOK_SECRET ovan>
--      Hemligheterna ligger i Vault, INTE i denna fil/git.
--   4. (Krävs även för själva aktiveringsmailet:) konfigurera custom SMTP i
--      Auth → SMTP settings (Supabases inbyggda mail är rate-limitat och
--      "for testing only"). Samma provider (t.ex. Resend) för båda mailen.
--
-- Om Vault-secrets saknas hoppar trigger:n TYST över mailet — den får ALDRIG
-- blockera email-bekräftelsen (hela try/catch:en + null-guarden nedan).
-- ─────────────────────────────────────────────────────────────────────

-- pg_net krävs för att kunna POST:a till Edge Function från Postgres.
create extension if not exists pg_net;

create or replace function public.on_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_url    text;
  v_secret text;
begin
  -- Fyra ENDAST på övergången obekräftat → bekräftat, och bara för riktiga
  -- registreringar (guest/anon saknar email + playerName-metadata).
  if not (
    old.email_confirmed_at is null
    and new.email_confirmed_at is not null
    and new.email is not null
    and (new.raw_user_meta_data->>'playerName') is not null
  ) then
    return new;
  end if;

  -- Hook-URL + delad hemlighet ur Vault (ligger inte i git).
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'welcome_email_url' limit 1;
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'welcome_email_secret' limit 1;

  -- Ej konfigurerat än → hoppa tyst över (bryt aldrig bekräftelsen).
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      'email', new.email,
      'playerName', new.raw_user_meta_data->>'playerName'
    )
  );

  return new;
exception
  when others then
    -- Ett mail-fel får ALDRIG blockera email-bekräftelsen.
    raise warning '[on_email_confirmed] welcome hook failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.on_email_confirmed();
