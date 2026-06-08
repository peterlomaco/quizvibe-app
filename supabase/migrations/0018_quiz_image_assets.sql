-- ─────────────────────────────────────────────────────────────────────
-- 0018_quiz_image_assets — Bild-metadata för molnlagring (CDN-migration)
--
-- Förbereder övergången från bundlade assets (73 MB i app-bundeln) till
-- server-side hosting i Supabase Storage + CDN-leverans. Per CLAUDE.md
-- är detta en post-launch-optimering ("Aktiveras post-launch eller när
-- bundle-storlek närmar sig App Store cellular-limit (200 MB)").
--
-- Tabellen lagrar metadata för varje bild i quiz-katalogen:
--   • storage_path: sökväg i Supabase Storage-bucketen 'quiz-images'
--   • CDN-URL härleds runtime via Supabase JS SDK:s getPublicUrl()
--     (ingen lagring av full URL — bucket-domän kan ändras vid CDN-byte)
--   • Attribution-data för CC-BY/SA-compliance (bildkrediter krävs
--     per licens — se docs/image-attribution.md)
--
-- Relation till katalogen:
--   • id matchar backend/content/catalog/**/*.yaml item.id (kebab-case)
--   • Klienten gör: SELECT * FROM quiz_image_assets WHERE id = ANY($ids)
--     för att hämta CDN-URL:er i batch vid session-start
--   • Fallback under migration: om storage_path är null använder klienten
--     det bundlade assets/quiz-images/<id>.webp
--
-- Skalning:
--   • Tabellen är read-heavy (~1000 rader, aldrig fler än ~10 000 i V2).
--     Inga concurrent-write-problem. Full table-scan (<100ms) räcker för V1.
--   • CDN (Supabase Storage global edge) absorberar bild-trafiken —
--     denna tabell träffas bara vid session-start, inte per fråga.
--   • is_active-index gör att klienten aldrig behöver filtrera på app-sidan.
--
-- Appliceras manuellt via Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────


-- ── quiz_image_assets ─────────────────────────────────────────────────

create table public.quiz_image_assets (
  -- Matchar item.id i YAML-katalogen (kebab-case, t.ex. 'abba', 'messi')
  id                    text primary key,

  -- Supabase Storage-sökväg (relativ, utan bucket-prefix)
  -- Null = bilden finns bara i app-bundeln ännu (pre-CDN-migration)
  -- Exempel: 'quiz-images/abba.webp'
  storage_path          text unique,

  -- Visningsnamn (snapshot från katalogen — denormaliserat för att
  -- klienten ska kunna visa namn utan att ladda hela katalogen)
  display_name          text not null,

  -- Innehållstyp — matchar contentSubject i schema.ts
  content_subject       text,               -- 'artist','actor','athlete' etc.

  -- Bildmått (pixlar) — sparas vid pipeline-process för
  -- client-side layout-reservering (undviker layout-shift vid load)
  width                 int,
  height                int,
  file_size_bytes       int,

  -- Licens + attribution (CC-BY/SA KRÄVER fotograf-kredit)
  -- Licensvärden speglar `docs/image-attribution.md`:s kategorier
  license               text
                          check (license in (
                            'CC0',
                            'CC-BY',
                            'CC-BY-SA',
                            'PD',         -- Public Domain (pre-1928 eller explicit PD)
                            'unknown'     -- tillfälligt under audit
                          )),
  attribution           text,             -- "Photo: Koen Suyk / Nationaal Archief"
  commons_url           text,             -- Wikimedia Commons-länk för compliance-audit

  -- Region-taggning (speglar catalog-items RegionSchema)
  -- text[] för att ett item kan ha ['sweden','global']
  regions               text[] not null default array['sweden']::text[],

  -- Content-kategorier (speglar mainCategory-logiken)
  main_category         text
                          check (main_category in ('Music','Film','Sport')),

  -- Logo-blur-status (speglar logo_blur_pipeline.md)
  -- 'none'     = ingen blur applicerad (ren bild)
  -- 'blurred'  = blur applicerad på logotyp/märke (face-protect bevarat)
  -- 'removed'  = item taget ur poolen pga ej hanterbar logotyp
  logo_blur_status      text not null default 'none'
                          check (logo_blur_status in ('none','blurred','removed')),

  -- Aktiv i spel-poolen? false = parkerad i deferred/ eller borttagen
  is_active             boolean not null default true,

  -- Tidpunkter
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger quiz_image_assets_updated_at
  before update on public.quiz_image_assets
  for each row execute function public.touch_updated_at();

-- Index: primär klient-query "hämta alla aktiva bilder"
create index quiz_image_assets_active_idx
  on public.quiz_image_assets (is_active)
  where is_active = true;

-- Index: per-kategori-filter (Match category filter in quiz.tsx)
create index quiz_image_assets_category_idx
  on public.quiz_image_assets (main_category)
  where is_active = true;

-- Index: region-GIN för array-contains-queries (@> operator)
create index quiz_image_assets_regions_idx
  on public.quiz_image_assets using gin (regions);

-- Index: license-audit (admin verifierar compliance)
create index quiz_image_assets_license_idx
  on public.quiz_image_assets (license);


-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.quiz_image_assets enable row level security;

-- Bild-metadata är publik content — alla (inkl. anon/guests) kan läsa.
-- Nödvändigt för att appen ska kunna hämta CDN-URL:er utan inloggning
-- (gäster som joinat en lobby måste kunna ladda bilder).
create policy "anyone can read active image assets"
  on public.quiz_image_assets for select
  to anon, authenticated
  using (is_active = true);

-- Ingen klient-side INSERT/UPDATE/DELETE — allt skrivs via backend-
-- scripts (backend/scripts/sync-quiz-images.ts + pipeline-output).
-- Service-role (används av backend-scripts) hoppar förbi RLS automatiskt.


-- ── Supabase Storage bucket (DDL) ────────────────────────────────────
-- Bucket skapas via Supabase Dashboard eller Storage API — kan inte
-- skapas via vanlig SQL migration. Instruktioner:
--
--   1. Gå till Supabase Dashboard → Storage → New bucket
--   2. Bucket name: quiz-images
--   3. Public: JA (CDN leverans utan signed URLs — bilder är ej känsliga)
--   4. File size limit: 2 MB (webp q85 är aldrig >500 KB i praktiken,
--      2 MB ger marginal för högupplöst material i V2)
--   5. Allowed MIME types: image/webp, image/jpeg, image/png
--
-- Storage RLS-policy (klistras in i Dashboard → Storage → Policies):
--
--   -- Alla kan läsa (public bucket):
--   CREATE POLICY "Public read access for quiz images"
--   ON storage.objects FOR SELECT
--   TO public
--   USING (bucket_id = 'quiz-images');
--
--   -- Bara service_role kan ladda upp (backend-pipeline):
--   -- (service_role hoppar förbi RLS — ingen explicit policy behövs)
--
-- CDN-URL per bild (i TypeScript-klient):
--   const { data } = supabase.storage.from('quiz-images').getPublicUrl(storagePath)
--   // → https://<project>.supabase.co/storage/v1/object/public/quiz-images/abba.webp


-- ── Sync-script-integration ───────────────────────────────────────────
-- backend/scripts/sync-quiz-images.ts bör utökas med ett steg som
-- efter upload till Storage även UPSERT:ar en rad i quiz_image_assets:
--
--   await supabase.from('quiz_image_assets').upsert({
--     id: item.id,
--     storage_path: `quiz-images/${item.id}.webp`,
--     display_name: item.displayName,
--     content_subject: item.contentSubject,
--     width: sharpMeta.width,
--     height: sharpMeta.height,
--     file_size_bytes: sharpMeta.size,
--     license: item.license ?? 'unknown',
--     attribution: item.attribution,
--     commons_url: item.commonsUrl,
--     regions: item.region,
--     main_category: subjectToMainCategory(item.contentSubject),
--     logo_blur_status: item.logoBlurStatus ?? 'none',
--     is_active: true,
--   }, { onConflict: 'id' })
