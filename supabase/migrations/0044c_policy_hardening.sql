-- ─────────────────────────────────────────────────────────────────────
-- 0044c_policy_hardening — pre-launch hardening, TIER 3: RLS-POLICY RECREATE
--
-- Applied via Supabase SQL Editor (manuell körning). Två DROP+CREATE av
-- befintliga policyer. Bör vara transparent (klienten skriver redan bara sin
-- egen data), men eftersom det rör RLS: kör i staging först om du kan, och
-- verifiera att profil-spara + question-answer-skrivning fortsatt funkar.
--
-- Lägre risk än 0045 (dessa rör INTE lobby-join-hotpathen), men högre än
-- 0044a/b eftersom en felskriven policy kan blockera legitima writes.
-- ─────────────────────────────────────────────────────────────────────

-- profiles UPDATE-policyn saknade with check → NYA värden var obegränsade
-- (using-klausulen begränsar bara VILKA rader). Recreate med with check så id
-- aldrig kan flyttas till en annan uid. En user som uppdaterar sin egen rad
-- behåller id = auth.uid(), så inga legitima writes berörs.
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- E9: question_answers INSERT var with check(true) → en klient kunde skriva
-- rader med godtyckligt user_id (poisoning av question_difficulty-aggregatet).
-- Klienten skriver redan bara `user?.id ?? null` (src/utils/questionStats.ts),
-- så inga legitima writes berörs; forging av annan users uid blockeras.
drop policy if exists "Anyone can insert question answers" on public.question_answers;
create policy "Anyone can insert question answers"
on public.question_answers for insert
with check (user_id = auth.uid() or user_id is null);
