-- ─────────────────────────────────────────────────────────────────────
-- 0048_handle_new_user — skapa profiles-raden server-side vid signup
-- Applied via Supabase SQL Editor (manuell körning, ej CLI).
--
-- Bakgrund (email-verifiering): när "Confirm email" slås PÅ i Supabase Auth
-- returnerar signUp() en user men INGEN session förrän användaren klickat
-- på aktiveringslänken. Klienten skapade tidigare profiles-raden via
-- saveProfile()/backfill — men de kräver en aktiv (icke-anon) session, så
-- med confirm-email PÅ skulle raden inte finnas förrän EFTER första
-- inloggningen. Det bryter PlayerName-login: login-by-name-funktionen slår
-- upp email via profiles.player_name och skulle inte hitta raden vid första
-- inloggningen. Därför skapas profilen nu server-side av denna trigger,
-- direkt när auth-usern skapas — innan mailet ens är bekräftat.
--
-- Metadata-nycklarna är camelCase (så klienten skickar dem i
-- options.data): playerName, birthYear, assistance, region,
-- gameEraFrom, gameEraTo. assistance/region-värdena matchar redan
-- CHECK-constrainten i 0001. Övriga kolumner tar sina table-defaults
-- (game_mode, single_player_default, max_players, free_game_credits=2 som
-- self-healar till 4 vid första loadProfile, osv.).
--
-- GUEST/ANON-SKYDD (kritiskt): anon-signup skapar auth.users UTAN email och
-- UTAN playerName-metadata. Trigger:n MÅSTE hoppa över dem — annars failar
-- NOT NULL-constrainten och HELA guest-inloggningen går sönder.
--
-- player_name UNIQUE-krock: `on conflict (id)` täcker BARA id, inte
-- player_name. En dublett-name (race förbi klientens playerNameExists-
-- förkoll) får trigger:n att RAISE:a, vilket abortar hela signUp:en —
-- acceptabelt (klient-förkollen är primärt skydd, constrainten backstop).
-- Svälj INTE den (t.ex. med EXCEPTION WHEN unique_violation) — det skulle
-- skapa en auth-user helt UTAN profiles-rad, vilket bryter PlayerName-login.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Hoppa över anon/guest-users (ingen email, ingen registrerings-metadata).
  if new.email is null
     or (new.raw_user_meta_data->>'playerName') is null then
    return null;
  end if;

  insert into public.profiles (
    id, email, player_name, birth_year, assistance, region,
    game_era_from, game_era_to
  ) values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'playerName',
    nullif(new.raw_user_meta_data->>'birthYear', '')::int,
    new.raw_user_meta_data->>'assistance',
    new.raw_user_meta_data->>'region',
    nullif(new.raw_user_meta_data->>'gameEraFrom', '')::int,
    nullif(new.raw_user_meta_data->>'gameEraTo', '')::int
  )
  on conflict (id) do nothing;  -- id-backstop; player_name-krock får RAISE:a

  return null;  -- AFTER-trigger: returvärdet ignoreras
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
