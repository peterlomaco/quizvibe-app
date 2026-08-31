# QuizVibe

Expo Router quiz app (React Native 0.81, React 19, Expo SDK 54). Dark-themed, mobile-first. Mock data on the client; en `backend/`-folder är påbörjad för content-katalog + bild-pipeline (ingen live-API ännu — se "Backend" nedan).

## Aktiv roadmap (uppdaterad 2026-06-03)

Status mot den 4-stegs-plan vi följer för content-bygge inför launch:

| Steg | Status | Anteckning |
|---|---|---|
| 1. Bild-format-fix | ✅ Klart | 16:9 container + `resizeMode='contain'` (commit `4ab2ac9`) |
| 2. Audience-filter på bild- + musik-frågor | ✅ Klart | Pool-nivå union-filter (`audienceFilter.ts`) på BÅDA pools — items matchar minst en spelares gen ELLER `'all'`. Fallback-chain om filter tomt. Se "Image questions (MVP)". |
| 3. Content build-out | 🟡 Pågående | **Uppdaterat 2026-06-03: 890 bildfrågor + 401 YT-frågor (musik/film/sport). YT-valideringspass 2026-06-03: manuell genomgång av alla 410 klipp — 34 klipp borttagna, 6 bytta till bättre källa, ~67 ESC-items taggade `genrePackages: ["Eurovision"]`, 11 svenska filmer tillagda i `movies-sweden.yaml` (7 kvar efter validering). RegionSchema utökat med `unknown-region`. Sport-sånger: We Are the Champions + We Will Rock You fick `genrePackages: ["sport"]`.** Tidigare: **Uppdaterat 2026-06-02: 890 bildfrågor + 409 musikfrågor. Melodifestivalen build-out: 33 YT-klipp (1980–2026) + 4 nya artistbilder (Malena Ernman, Robin Stjernberg, Tusse, Marcus & Martinus). ESC build-out: 49 YT-klipp (1970–2026) + 4 ESC-artistbilder (Lordi, Måneskin, Netta Barzilai, Conchita Wurst). Person-type crossover-modell implementerad (genrePackages: sport/film/music). RegionSchema utökat med `'global'` — 34 items taggade. "Main Profession Portfolio"-rename i Lobby+Profile. Tidigare: 895 aktiva bildfrågor + 330 YT/music (2026-06-01 commit `7dd39ef`). 21 artister + 46 skådespelare + 101 idrottare parkerade i `deferred/` för global-scope. 68 svenska fotbollsspelare + 14 svenska skådespelare tillagda med bilder. Ny fördelningslogik: proportionell YouTube:bild-ratio (N=round(imgPool/ytPool), [2,4]), YouTube-block samlade först. Host-frågehistorik: `src/utils/hostQuestionHistory.ts`. 2026-05-31: 1006 image (efter 94-purge) + 330 youtube/music.** Tidigare läge nedan: **1107 image + 221 youtube** efter FIFA World Cup Pass 9 mass-add (2026-05-27): 70 nya items (Italian 1982/2006-spelare, spanska, tyska 1954/1974, holländska modern, franska modern, argentinska, engelska, portugiska, kroatiska, japanska, afrikanska, mexikanska). **Pkg-fifa-wc-total: 329 items** (178 elder-gen-x + 151 modern) — image-volymen för paket-tröskel uppnådd. Pool growth Pass 1-9: 715 → 1107 (+392 items, ~55% catalog-expansion på en dag). **Source-strategi**: Wikipedia pageimage default + Bestanddeelnummer/tournament-queries för premium kit-shots. **Paketet är INTE säljbart ännu** — kräver: (a) **image-validation** av alla 329 items mot felmatchningar/civilian-default (Pass 8 mass-add accepterade pageimages utan probe av kontext, risk för fall som Sonnenblumen→Klose-felmatchen i tidigare probe-runda), (b) **+200 YT clips** för fotbolls-VM-content (planeras 2026-05-28 när YT API-kvota åter öppen). Säljbart-tröskel: 300+ image + 200+ YT med validerad kvalitet. | Pass 4 lämnas för ~60 civilian-only items från Peters topp 150 (Voller, Lineker, Shearer, Gerrard, Lampard, Shilton, Puyol, Busquets, Suárez, Raúl, Zanetti, Riquelme, Zico, Dunga, Lukaku, Hazard, Yaya Touré, Essien, Park, Son, Nakata, Honda, Cahill, Donovan, Dempsey, H.Sánchez, Šuker, Prosinečki, Thuram, Vieira, Desailly, Kahn, Lahm, Özil, Rummenigge, Maier, Shevchenko, Nedvěd, Hagi, Robben, Sneijder, Rijkaard, Davids, van Persie, m.fl. — Wikipedia pageimage är civilian/post-career, kräver manuell Commons-curation för kit-bild). Total **~1083 V1-playable**. Catalog: **1104 items**. **`pkg-fifa-wc`-tagg** är förberedd som **första separata Store-paket** i v1.1+ per Peters intent — items behåller `inBaseCatalog=true default` så de visas i base-pool tills paketet säljs separat. Mass-batches lade till svenska artister/band (vemod, dansband, house, hip hop, R&B, Eurovision, kvinnliga sångerskor), skådespelare (Bergman-era → Skarsgård-familjen + svensk modern), idrottare (hockey-legender + modern + sport-crossover-actors), cross-nordic (norsk/finsk/dansk), sport-events (svenska + OS-bredd), sport-tema-movies. **7 items kvar utan webp** (Hurula, John Dahlbäck, Freestyle (svensk popgrupp), Ratata, Lolita Pop, Tjuvjakt, Eva Remaeus — varken Wikipedia pageimage eller Commons text-search ger användbara träffar; kräver direkt Commons Category-page-research). Quizvibe positionering: strikt **musik/film/sport** (inga komiker/journalister/författare/kompositörer per Peter 2026-05-27). |
| 4. Pre-launch-items | ⏸️ Ej påbörjat | Captcha, YouTube ToS-audit, nightly cron, FAQ — se `project_pre_launch_checklist.md` |

**Performance-refactor 2026-05-27** (`quizImageQuestions.ts` slim-down): Tidigare pre-bakad Letter Grid + nameOptions per item × 3 varianter → 8.5 MB JS-fil som parsades vid app-start. Refactorad till minimal metadata per item + runtime-generation via [src/utils/imageQuestionBuilder.ts](src/utils/imageQuestionBuilder.ts) (port av `backend/content/distractors.ts`). Storlek: **8.5 MB → 208 KB** (97.5% reduktion). Cold-start-parse-tid: ~150-400 ms → ~5-10 ms. Algoritmiskt 1:1 — samma 10 prefix-knappar, samma nameOptions-distribution. `buildImageVariant(item, assistance, audienceSet, allItems, distractorNames)` anropas runtime i quiz.tsx, memoiserad på `[question.id, currentAssistance, audienceSetForVariants]` så shuffle bara körs vid frågebyte/spelar-rotation. `pickImageQuestionVariant` borttagen (ersatt av `buildImageVariant`). Backend `export-image-questions.ts` skriver nu också `DISTRACTOR_POOL_NAMES`-export (per category) som klienten använder som fallback-namn.

**Parkerade pre-launch-optimizations** (per Peter 2026-05-27 — fokus på item-validation + content istället tills nödvändigt):
- **B**) Server-side asset-hosting (Supabase Storage / CDN) — assets på 73 MB i bundle. Aktiveras post-launch eller när bundle-storlek närmar sig App Store cellular-limit (200 MB).
- **C**) webp q85 → q75 reprocess (~30% storleksbesparing utan synbar kvalitetsförlust) — opportunistic kvalitets-justering om tid finns.

**Pool-status (2026-08-11, commit `b7b4c7d`): 671 spelbara bildfrågor (836 exporterade) + 484 spelbara musikfrågor (487 exporterade), plus 32 paket-gatade items.** Content-pass: 16 nya spelbara låtar (Orup ×3, Bryan Adams ×2, Bonnie Tyler ×2, Marvin Gaye/Tammi Terrell, The Who, Lionel Richie, Guns N' Roses, Shakespears Sister, Kent, The Verve, Lady Gaga, R.I.O.) + 2 staged utan media (Bette Midler *The Rose*, Cyndi Lauper *True Colors* — saknar kurerad Spotify-/YT-länk, flaggade i `notes`). Befintliga items berikades i stället för att dubbleras (Paint It Black, Highway to Hell, Die With a Smile).

**År-policy (Peter 2026-08-11): `correctYear` = året för DEN HÄR ARTISTENS första release av spåret — album eller singel, det som kom först.** Ersätter den gamla "singel-release-år"-regeln. Chart-peak är aldrig svaret.

**En tidigare inspelning av en ANNAN artist räknas INTE.** Itemet är artistens inspelning, inte kompositionen. Sinatras *Fly Me to the Moon* är 1964 även om låten spelades in 1954; Ray Charles *Georgia on My Mind* är 1960 även om Hoagy Carmichael skrev och spelade in den 1930. Följande åtta är GRANSKADE och avvisade av exakt det skälet — flagga dem inte igen: `Fly Me to the Moon` (1954), `At Last` (1942), `Georgia on My Mind` (1930), `Nothing Compares 2 U` (The Family 1985), `Suspicious Minds` (Mark James 1968), `Killing Me Softly` (Lori Lieberman 1972), `En kväll i juni` (Tre Profiler 1971 — Berghagens egen kom 1975), `Save Your Kisses for Me` (singel mars 1976).

**Dokumenterat undantag: `van-halen-jump` = 1984.** Singeln kom 21 dec 1983, tolv dagar före albumet *1984* (9 jan 1984), så policyn ger strikt 1983 — men låten är allmänt förknippad med albumet och en spelare skulle uppfatta 1983 som fel. Peter beslutade 1984 (2026-08-13). Ändra inte till 1983.

**Dokumenterat undantag: `a-ha-take-on-me` = 1985.** a-ha släppte en egen originalversion okt 1984 (Tony Mansfield-produktionen, floppade); 1985 års Alan Tarney-inspelning är den som blev hit och den vi spelar. Peter beslutade 1985 (2026-08-11). Ändra inte till 1984.

**Retroaktiv audit genomförd 2026-08-11 (commits `3c486d7`, `d13fd5d`, `46bc023`): 20 år rättade av 401 sånger.** Två pass: MusicBrainz (`recording`-sök, tidigaste release) och därefter Wikipedia-infobox-skrapning som ÄVEN följer album-länken — det senare har klart bäst recall och är metoden att återanvända. MB ensamt missade t.ex. Sweet Child o' Mine. **50 sånger är fortfarande okontrollerade** (ingen matchande Wikipedia-artikel — mest dansband och nischade spår). Rapport: `backend/output/year-audit.md`.

**Region-modellen omarbetad + konsoliderad till EN källa** — se "Region-modellen" nedan. `unknown-region` används INTE längre som paket-grind (det är `inBaseCatalog: false` nu), och bild-items läser inte längre `HINTS_REGION_MAP`.

**Pool-status (2026-07-03): ~800 bildfrågor + 499 musikfrågor.** ⚠ Punkt (b) och (c) nedan beskriver `region: ["unknown-region"]` som paket-grind — det mönstret är ERSATT av `inBaseCatalog: false` (2026-08-11). Curation-pass 2026-07-03: (a) **Brandsta – All in för Sverige** correctYear rättat 2018 → 2026. (b) **Paket-exklusiva fotbollslåtar**: `brandsta-all-in-for-sverige` + `anis-don-demina-flaggan-i-topp` fick `region: ["unknown-region"]` — utesluts ur baspoolen, ingår enbart i kommande fotbollspaket via befintlig `genrePackages: ["sport", "football"]` (samma mönster som `knaan-wavin-flag`). (c) **Ny fil `songs-summer.yaml`** — 5 kurerade Spotify-only-items för kommande "Summer"-host-paket, HELA filen paket-exklusiv via `region: ["unknown-region"]` på fil-headern: Cornelis Vreeswijk – Sommarkort (1987, originalår — INTE Spotify-samlingens 2004), Ace of Base – Cruel Summer (1998), Mungo Jerry – In the Summertime (1970), DJ Jazzy Jeff & The Fresh Prince – Summertime (1991, även `"hiphop"`-tagg), Inner Circle – Sweat (1992). OBS: "Summer"-taggen finns även på 7 baspool-items (Markoolio, Gyllene Tider, Ted Gärdestad, Lasse Berghagen, Bellini, Kaoma, Ronny & Ragge) — de ligger i BÅDE baspool och paket; items kan vara i båda eller bara paket per schema-modellen. (d) **Spotify/Name distraktor-relevans** — se "Spotify/Name — distraktor-relevans" i Spotify DJ-sektionen.

**Pool-status (2026-06-25): ~800 bildfrågor + 473 musikfrågor.** Curation-pass 2026-06-25: 9 nya musikfrågor tillagda. Fotbollspaket (songs-sport.yaml, `genrePackages: ["sport","football"]`): Blur – Song 2 (1997), Zombie Nation – Kernkraft 400 (1999), Dario G – Carnaval de Paris (1998, Spotify+YT), Planet Funk – Chase the Sun (2001). songs-gen-x.yaml: Neil Diamond – Girl, You'll Be a Woman Soon (1967, Spotify+YT), Lasse Berghagen – En kväll i juni (1975, Spotify+YT). songs-gen-z.yaml: Southside Spinners – Luvstruck (2000, Spotify+YT), Antique – (I Would) Die for You (2001, YT, `genrePackages: ["Eurovision"]`). songs-millennials.yaml: Stevie Wonder – I Just Called to Say I Love You Spotify-ID uppdaterat till `2W8J9Gfw5q8tSvsuWSnMBl`. Curation-pass 2026-06-24: 5 YT-klipp borttagna ur `sport-events-classics.yaml` pga år synligt i videotiteln (spoilar svaret) — `sverige-vm-94-brons-bulgarien`, `sorenstam-kraft-nabisco-2002`, `johan-olsson-vm-50km-2013` kvarstår utan klipp tills ersättning hittas. 2 items korrigerade till rätt event (gamla klipp visade fel sporthändelse): `christian-olsson-tresteg-2004` → `christian-olsson-em-tresteg-2006` (EM Göteborg, correctYear 2006); `anja-parson-os-guld-slalom-2006` → `anja-parson-vm-slalom-are-2007` (VM Åre, correctYear 2007). Tidigare (2026-06-13): 473 musikfrågor — Stevie Wonder "I Just Called to Say I Love You" (1984, Spotify + YT Topic), Tomas Ledin "Vi är på gång" (correctYear 1983 ← rättat från 2006, nytt YT-klipp), Tomas Ledin "Hon gör allt för att göra mig lycklig" (1980, Spotify + YT Topic), spotifyTrackId tillagd på Tomas Ledin "Just nu!" (1980). Spotify-ID uppdaterade: Avicii Levels, Loreen Euphoria, Loreen Tattoo. endSec lagt till på 4 klipp (ed-sheeran-perfect, rihanna-diamonds, bob-marley-no-woman-no-cry, bryan-adams-summer-of-69).

**Pool-status (2026-06-03, efter logo-blur-curation: ~800 bildfrågor + 401 YT-frågor. ~990 webp-filer i assets.)** Logo-blur-curation-pass: ~85 athlete-bilder borttagna (logotyper ej hanterbara), ~150 bilder blurrade (face-protect/logo-only/manuellt). Pipeline: `backend/scripts/logo-blur/blur_logos.py` (OwL-ViT + EasyOCR + MediaPipe face-protect). Se `memory/project_logo_blur_pipeline.md`. Region-taggning: ~39 athletes `["sweden","global"]`, 5 athletes `["sweden","nordic"]`.**

**Pool-status (2026-06-03, innan logo-blur: 890 bildfrågor + 401 YT-frågor. ~1069 webp-filer i assets.)** YT-valideringspass 2026-06-03: totalt 420 → 401 frågor efter genomgång (−19 netto: +11 svenska filmer, −34 borttagna, +6 bytta klipp, +diverse startSec-justeringar). Ny fil: `movies-sweden.yaml` (7 validerade svenska filmklassiker med YT-trailers). ESC-taggning: ~67 items fick `genrePackages: ["Eurovision"]` för framtida Eurovision host-paket. `unknown-region` lagt till i RegionSchema. Valideringsverktyg: `backend/output/youtube-validation.html` (klickbar HTML med alla klipp per kategori + "Senaste ändringar"-flik).

**Pool-status 2026-06-02 (gammalt): 890 bildfrågor + 409 musikfrågor. ~1069 webp-filer i assets.** — Parkat 21 artister + 46 skådespelare + 101 idrottare i `deferred/parked-*-global.yaml` (webps bevarade för global-scope v1.x). Lagt till 68 svenska fotbollsspelare (ny catalog: `athletes-sweden-football-classic.yaml` + `athletes-sweden-football-modern.yaml`). Ny quiz-ordning: YouTube-block samlade först → bildblock, proportionell ratio YouTube:bild (N=round(imgPool/ytPool), [2,4]), varje sektion grupperad Musik→Film→Sport. Osedd-prioritering via `src/utils/hostQuestionHistory.ts` (AsyncStorage per playerName). Tidigare: **Pool-status 1038 live image-webps efter review-pass + nya-svenskar-utbyggnad 2026-06-01; 1088 efter svenska-utbyggnad, 1006 efter validerings-purge 2026-05-31)** — Replace-review-pass 2026-06-01 (Task-1, 108 items): 48 bytte till Wikidata-P18-kandidat, 17 fick 3:e-alternativ ur Commons-kategori (`_find-alt.ts` → `alt-images-v2.html` → `_apply-picks.ts`), 43 togs bort HELT ur poolen (oönskade). New-swedes-review-pass: 7 av de 82 nya togs bort (emilia-rydberg, sabaton, shanti-roney, ebba-gron, nordman, anders-limpar, hammerfall) → 75 nya kvar. — 2026-06-01: 91 nya kända-svenskar-items tillagda i 7 nya YAML-filer (`artists/actors/athletes-sweden-classic|modern.yaml` + `bands-sweden.yaml`), varav 82 fick verifierade CC/PD-bilder (65 via Wikidata-P18, resten sv-pageimage/rescue) och 9 är dormanta utan fri bild (peter-haber, valter-skarsgard, edvin-ryding, gizem-erdogan, ludmila-engquist, erik-johansson-actor, fronda, suzanne-reuter, jonas-inde — sv-skådespelare/rappare har ofta bara fair-use-foton på Wikipedia). **Bild-fetch-metod-lärdom:** Wikipedia pageimage via `generator=search` (default i `findWikipediaPageImage`) ger FEL-person för tvetydiga/vanliga namn (gav Cajun-cap-kille för "Erik Johansson skådespelare", piano för "Nordman", grav för "Fronda"). Robust metod: Wikidata `wbsearchentities` → välj entitet vars description matchar yrke + "svensk" → använd P18-bilden. Description-baserad disambiguering är textbillig och pålitlig. Scripts: `backend/scripts/_fetch-wikidata.ts` + `_fetch-t1-candidates.ts`. Task-1 (108 byt-bild-kandidater) staged i `backend/output/replace-candidates/` + review-HTML `replace-review.html` — INTE applicerade (väntar Peters godkännande via `_apply-t1.ts`; band-P18 har ibland namn på trummskinn/backdrop = svar-spoiler). V1-curering utifrån svensk igenkänning (`region: sweden` = recognition i Sverige, NOT nationality — Adele, Drake etc. är taggade `region: sweden` eftersom svenska spelare känner igen dem). Action-shot-policy-audit per bucket (`feedback_image_professional_context.md`) är paussad till mass-curation klar; porträtt-fallback godtagbar för items utan tillgänglig action-shot per 2026-05-27.

## ⚠ Bild-assets är RADERADE (2026-08-17) — bilder finns inte längre någonstans

`assets/quiz-images/` (1008 webp, 83 MB), `src/utils/quizImages.ts`, hela sketch-/doodle-pipelinen (`assets/quiz-sketches/`, `backend/sketch/`, `quizSketches.ts`, `SketchCanvas.tsx`, `NameRevealCard.tsx`, `GuessWhoSplitView.tsx`, `guessWhoDemo.ts`) och demo-routerna `/sketch-demo`, `/guess-who-demo`, `/clip-check` är **borta ur repot**. Person-bilderna parkerades juridiskt 2026-06-04 och `getQuizImage` var redan bortkopplad; filerna låg kvar och drog 83 MB utan att någon kod läste dem.

**Katalogen lever — det är bara BILDFILERNA som är borta.** `backend/content/catalog/**/*.yaml`, `export-image-questions.ts`, `quizImageQuestions.ts` och `imageQuestionBuilder.ts` är oförändrat LIVE: de är Hints-poolen. En "image"-fråga renderar flagga + ledtrådar via `HintsQuizCard` och rör aldrig en bildfil.

**Urvalsregeln bytte källa i samma pass.** `export-image-questions.ts` valde items på "har en webp i assets/quiz-images/". Nu väljer den på `HINTS_LIBRARY[id].hints.length >= 10` (= `MIN_HINTS_REQUIRED` i quiz.tsx). Exporten gick 844 → **284 items** men den SPELBARA mängden är bit-identisk (284 → 284, noll förlorade) — de 560 som föll bort var webp-items utan tillräckligt med hints som klienten ändå kastade. **Lägg inte tillbaka ett filsystem-beroende i den exporten.**

**Vill du återinföra bilder** (t.ex. om det juridiska läget ändras): hämta dem via `wikimedia-process` till `backend/output/`, återskapa `assets/quiz-images/` + en `quizImages.ts`, och koppla in `getQuizImage` i quiz.tsx igen. Gamla filerna finns i git-historiken fram t.o.m. commit `faa8dca`.

**All bild-tooling i `backend/scripts/` är RADERAD** (30 script + 39 staging-filer, 2026-08-17) — de läste eller skrev den katalog som nu är borta: `batch-wikimedia-process`, `batch-wikimedia-by-url`, `find-missing-webps`, `find-alt-images`, `license-audit-full`, `license-audit-verify`, `category-probe`, `generate-fifa-validation`, `validate-fifa-images`, `validate-fifa-smart` + 20 `_`-prefixade engångsscript från 2026-05/06-kurationspassen (`_fetch-wikidata`, `_apply-t1`, `_find-alt`, `_rescue-apply`, m.fl.) och deras `batch-input-*.json` / `_*-manifest.json`-indata.

Två script ÖVERLEVDE medvetet:
- **`batch-park-items.ts`** — redigerar katalog-YAML (remove/park), inte bilder. Dess webp-städlista är borttagen.
- **`_fix-mojibake.js`** — reparerar dubbelkodad text i katalogfiler. Inget med bilder att göra.

**Attribution-sidan är nedtagen** (2026-08-17): `docs/image-attribution.md` var den ENDA publicerade bild-sidan på quizvibe.se (de övriga license-audit-filerna står i `exclude` i `docs/_config.yml` och har aldrig varit publika). Den krediterade fotografer för CC-BY-bilder som appen inte längre distribuerar, så den togs bort tillsammans med sina länkar i `docs/index.md` och `docs/legal/index.md`. CC-BY kräver kredit vid distribution — vi distribuerar inte längre bilderna.

**Licens-revisionerna är KVAR med flit** — `full-license-audit-verified.md`, `full-license-audit.md`, `fifa-wc-*`, `commons-categories-candidates.md`, `new-swedes-attribution.md`. De är opublicerade (exkluderade i `_config.yml`) och är den enda samlade proveniens-dokumentationen för bilder som fanns i tidiga builds. Radera dem inte som "död kod" — de är juridiskt underlag, inte verktyg.

⚠ **`docs/legal/terms.md` §7.1 listar fortfarande "Images of public figures, landmarks, etc."** som en innehållstyp, och §7.2 nämner images. Det stämmer inte längre. Ändringen är en juridisk textändring och väntar på Peters beslut.

**Image-validering 2026-05-31** (Peter-genomgång, historik): 94 oönskade bild-items togs bort HELT — webp + katalog-poster + require-map + fråge-data (1100 → 1006). Verktyg som drev valideringen (`review-quiz-images.ts`, `review-non-swedish-images.ts`, `measure-images.ts` + deras npm-scripts) är **raderade 2026-08-17** tillsammans med bilderna de granskade. Kvarvarande verktyg i `backend/scripts/`:
- **`batch-park-items.ts`** (`npx tsx scripts/batch-park-items.ts`) — Bulk-redigerare för katalogfiler: `REMOVE_IDS` tar bort item + (separat) webp; `PARK_IDS` flyttar till `deferred/parked-*-global.yaml`. Rad-baserad parser bevarar exakt formatering. Append-logik om deferred-fil redan finns. Uppdatera `SOURCE_FILES` och `REMOVE_IDS`/`PARK_IDS` varje curations-pass.

**Audit-pass-status** (per bucket):
- ✅ **Athletes-elder-gen-x** (audited 2026-05-27): 18/22 webp uppgraderade till sport-action. 2 keep current (Stenmark, Wiberg — peak-era ej tillgängligt på Commons). 2 blocked (Muhammad Ali, Patrik Sjöberg — © Leifer/IAAF, se `memory/project_image_audit_blocked.md`). Useful sources upptäckta: Lipofsky NBA-bilder, Anefo "in aktie"-serie, AFP/Scanpix PD, Freiburg LABW archive.
- ⏸️ **Återstår**: actors (21), artists (31), bands (16), athletes-modern (10). Capitals (4) skippas (städer, inte personer).
- **Actors (21)** — utbyggt från 15 till 21 (2026-05-26):
  - Elder (6): ingrid-bergman, marilyn-monroe, tom-hanks, audrey-hepburn, cary-grant, katharine-hepburn.
  - Gen-x (6): arnold-schwarzenegger, lasse-aberg, julia-roberts, leonardo-dicaprio, tom-cruise, meryl-streep.
  - Millennials + Gen-z (6, audience-utökad): jennifer-aniston, margot-robbie, emma-stone, tom-holland, florence-pugh, brad-pitt. Files audience-tag = `[millennials, gen-z]` så modern-era stars (Friends-reruns, Spider-Man, Barbie) följs av båda gens.
  - Gen-z-only (3): millie-bobby-brown, jenna-ortega, zendaya — streaming-era stars (Stranger Things, Wednesday, Spider-Man/Euphoria/Dune).
- **Artists (31)** — utbyggt från 14 till 31 (2026-05-26):
  - Elder (6): elvis-presley, frank-sinatra, nat-king-cole, louis-armstrong, ray-charles, bob-dylan.
  - Gen-x (8): michael-jackson, madonna, carola-haggkvist, kurt-cobain, bruce-springsteen, whitney-houston, prince, david-bowie.
  - Millennials (8): avicii, rihanna, eminem (Hip-Hop-paket), beyonce, bruno-mars, adele, lady-gaga, justin-timberlake.
  - Gen-z (9): billie-eilish, taylor-swift, drake, ariana-grande, travis-scott, ed-sheeran, the-weeknd, olivia-rodrigo, bad-bunny.
- **Bands (16)** — utbyggt från 8 till 16 (2026-05-26):
  - Cross-gen (`audience: ['all']`): abba, beatles, queen, nirvana, pink-floyd, rolling-stones, led-zeppelin, acdc, u2, metallica, eagles, fleetwood-mac, the-who, black-sabbath, guns-n-roses, coldplay.
- **Athletes (23)** — utbyggt från 17 till 23 (2026-05-26):
  - Elder/Gen-x (13): bjorn-borg, muhammad-ali, mark-spitz, pele, diego-maradona, magic-johnson, michael-jordan, carl-lewis, steffi-graf, peter-forsberg, wayne-gretzky, martina-navratilova, larry-bird.
  - Millennials/Gen-z/Gen-alpha (10): zlatan-ibrahimovic, cristiano-ronaldo, lionel-messi, serena-williams, usain-bolt, roger-federer, armand-duplantis, tom-brady, lebron-james, simone-biles.
- **Capitals/cities (4)**: berlin, london, paris, stockholm.

**Föreslagna nästa steg (när session återupptas)** — Peter har bekräftat prioritet 2026-05-27:

1. **Image audit fortsättning** — Återstående buckets som kan ge mer svenska igenkänliga items:
   - **Actors svenska**: Greta Garbo, Lasse Åberg (audit).
   - **Bands svenska**: Roxette, Ace of Base (audit). ABBA redan auditerad.
   - **Non-svensk fortsättning**: actors-elder/gen-x/millennials/gen-z, athletes-modern non-svenskar, bands-classics non-svenska.
2. **YouTube clips fortsättning**:
   - **Movies + sport-events expansion** — schema-redo, 29 movies + 56 sport-events idag. Använd `npm run youtube-search` för clip-curation eller `topic-pick-clips` för Topic-channel-prio. YT Data API-kvoten resetar dagligen 09:00 svensk tid.
   - **Music-items audit** — `npm run youtube-validate` kör nightly cron men kan triggas manuellt.
3. **Crossover-taggning av befintliga items** — lägg till `genrePackages: ["sport"/"film"/"music"]` på items som gestaltar en person i annan profession än sin primär. Se "Person-type crossover filter" i memory.
4. **Pre-launch-items** — Captcha, YouTube ToS-audit, nightly cron, FAQ (se `project_pre_launch_checklist.md`).

**Curation-scripts** (alla i `backend/scripts/`):
   - `scripts/find-missing-clips.mjs` — listar items utan youtubeClips per audience-file.
   - `scripts/batch-pick-clips.ts` — YT-search per item, picka top-scored kandidat, output markdown-tabell + JSON. `--top N` eller explicit IDs. 10s throttle för YT API rate-limit (10/min).
   - `scripts/topic-pick-clips.ts` — refined search för items där default-search hittar fel content. Query-bias mot Topic-channels.
   - `scripts/apply-batch-picks.ts` — YAML-insertion från batch-picks.json. CRLF/LF-detection bevarar Windows line-endings.

Se `memory/project_roadmap_phases.md` för bredare fas-status (Fas 4 backlog → Pre-launch → Launch).

## Routing

`"main": "expo-router/entry"` — file-based routes in `app/`.

- `app/_layout.tsx` — root Stack registrerar alla skärmar individuellt. `screenOptions={{ headerShown: false }}` på Stack-nivå så ingen native-header visas.
- **Ingen bottom tab-bar** (D-0 2026-05-12). Tidigare hade vi `app/(tabs)/_layout.tsx` med 5 tabs (Home/Profile/Lobby/Leaderboards/Store) men det är borttaget — alla skärmar är plain Stack-routes. Navigation mellan dem sker explicit via TopUserBanner, in-screen-knappar (Profile settings/Store i login-modaler) och `router.push/replace` med `from`-param för Back-routing. Lobby + Quiz har sina egna exit-knappar (Quit Game / Leave Game) som enda utväg.
- `app/index.tsx` — Home screen + JoinModal + Logo (2k+ lines, needs splitting). Innehåller även en temporär "🧪 Try Name Quiz Demo"-knapp efter footer som navigerar till demo-routen.
- `app/{lobby,profile,leaderboards,store}.tsx` — thin re-exports of `src/screens/*Screen.tsx`.
- `app/quiz.tsx` — gameplay screen.
- **Leaderboards-entry**: efter D-0 saknas en explicit ingång till `/leaderboards` (tidigare via tab-bar). Avvaktas — Home-shortcut + ev. Profile-link designas senare.
  - ⚠ **`LeaderboardsScreen.tsx` ser ut som död kod men ÄR DET INTE — radera den inte.** Routen är registrerad, inget `router.push` pekar dit, och skärmen är orörd sedan initial commit, så varje dead-code-scan flaggar den. Den är en FÄRDIG skärm (Today / This Week / All Time + topp-3-podium på `MOCK_PLAYERS`) som bara förlorade sin ingång när tab-baren togs bort 2026-05-12. Den väntar på ett navigations-beslut, inte på radering. Bekräftat vid städpasset 2026-08-17 där `/name-quiz-demo` togs bort men denna medvetet lämnades.

## Source layout (`src/`)

- `screens/` — large screen files (Lobby, Profile, Leaderboards, Store, HCPSettings). HCPSettings har ingen route i `app/` än (planeras kopplas in framöver).
- `components/` — shared UI (Button, Card, PlayerRow, RoundLeaderboard, etc.).
- `theme/` — `Colors`, `Spacing`, `Radius`, `Typography`, `FontSize`, `FontWeight`. Import via `@/src/theme`.
- `utils/` — AsyncStorage helpers (`profileStorage`, `friendsStorage`, `pendingLobby`, `waitingInvites`, `gameResults`, `leftPlayers`), plus `avatars`, `hcp`, `roomCode`, `playerName`, `analytics`, `profanity`, `mockActiveRooms`, `revealCurve` (Namn-svarsmodellens reveal-kurva, används av `ProgressiveCover`).

Path alias: `@/*` → repo root (e.g. `@/src/theme`, `@/src/components/Button`).

## Cross-file types

- `LobbyPlayer` is exported from `src/screens/LobbyScreen.tsx` and imported by `app/quiz.tsx`. Don't move it without updating both.
- `LobbyPlayer.hasLeft?: boolean` markerar spelare som har lämnat lobbyn (egen Leave-action eller host:s trash). Sätts av (a) Lobby:s `useFocusEffect` baserat på `getLeftPlayers(roomCode)` från `src/utils/leftPlayers.ts` (AsyncStorage), (b) DB:s `has_left`-kolumn via host:s Realtime UPDATE-sub. **Render-pathen exkluderar hasLeft-spelare helt** — både `approvedPlayers` och `waitingForApproval` filtrerar bort dem så de inte syns för host eller non-host. Tidigare renderade `PlayerRow` ett grått "LEFT THIS GAME LOBBY"-kort men det skapade förvirring (usern tolkar listan som "spelare just nu i rummet"). PlayerRow:s gray-rendering finns kvar i komponenten men triggar aldrig från LobbyScreen idag — keep:as som död kod tills vi gör en städ-pass. Data-modell-wise lever raden kvar i `lobby_players` med `has_left=true` (audit + möjlig framtida "left-history"-vy). Host:en exkluderas alltid från hasLeft-checks (host kan ej lämna sin egen lobby).
- `RoundLeaderboard` re-exports several types (`LeaderboardPlayer`, `RoundScore`, `HcpChange`, mocks).

## Persistence

All client-side via AsyncStorage. No server. Screens reload data on focus (`useFocusEffect` + `loadX()`), so writing through `src/utils/*Storage.ts` is the canonical pattern. No reactive store yet.

**Synkron profil-spegel — login-state får ALDRIG seedas från `null`** (fix 2026-08-12): `getCachedProfile()` i [profileStorage.ts](src/utils/profileStorage.ts) returnerar senast kända profil **synkront** — `undefined` = ohydrerad (vi VET inte), `null` = utloggad, objekt = inloggad. Spegeln uppdateras av `loadProfile`/`saveProfile`/`clearProfile` och värms från AsyncStorage vid modul-load.

Varför: Home nås ALLTID via `router.replace('/')` (BottomBanner, Profile, Store, FAQ, Lobby) = **full re-mount**, och Lobby mountar sin TopUserBanner på nytt vid varje Start New Game. Med `useState(null)` renderades utloggat läge under hela `loadProfile`:s Supabase-roundtrip (`auth.getUser` + `profiles`-select) och hoppade sedan till inloggat — Peter såg "Register or Login" blinka förbi både på Home och i lobby-bannern. Konsumenter (Home, [BottomBanner](src/components/BottomBanner.tsx), [TopUserBanner](src/components/TopUserBanner.tsx)) seedar därför sitt state ur spegeln och sätter den igen synkront i focus-effekten INNAN den auktoritativa `loadProfile()` await:as. **`undefined` får aldrig tolkas som utloggad** — låt state stå orört då.

⚠ Varje ny väg som rensar profilen MÅSTE gå via `clearProfile()`. `deleteAccount` i [auth.ts](src/utils/auth.ts) `multiRemove`:ar `@quizvibe/*` direkt och anropar därför `clearProfile()` explicit efteråt — annars blir spegeln stale och en re-mountad Home seedar inloggat läge för ett raderat konto.

**Field rename migration (dual-read)**: when renaming a persisted field (e.g. `nickname → playerName`), use passive dual-read in the load function — read the new field first, fall back to the old. Next save writes only the new shape so storage converges passively. See `profileStorage.ts`, `friendsStorage.ts`, `waitingInvites.ts`. The fallback can be dropped 2-3 release cycles after rename when most users have migrated.

**Mock backend stores** (sessions/AsyncStorage stand-ins för kommande backend-API): konventionen är att exportera funktioner med samma signatur som API-anrop kommer att ha så att call-sites förblir oförändrade när impl byts ut. Två stores idag:
- `src/utils/mockActiveRooms.ts` — **in-memory `Map<string, RoomMeta>`** över aktiva rumkoder + per-room metadata. `RoomMeta = { maxPlayers: 2 | 4 | 12; hostIsPremium: boolean; currentPlayerCount: number; hostPlayerName: string; gameStarted: boolean; isRemote1v1?: boolean }`. **`isRemote1v1`** (migration 0031) sätts vid `registerActiveRoom` — atomiskt med rums-raden, innan koden är joinbar — så join-gates kan avgöra lobbytypen utan att vänta på den debounce:ade `lobby_settings`-skrivningen. Optional i typen: pre-0031-rum saknar kolumnen och resolvar false. API:
  - `registerActiveRoom(code, meta)` vid Create Game/Play Again — host:s `maxPlayers` + `hostPlayerName` läses från profil, `hostIsPremium` är hardcodad `false` med TODO tills subscription-state finns.
  - `isActiveRoom(code)` + `isLobbyFull(code)` + `isOwnLobby(code, playerName)` + `getRoomMeta(code)` — driver join-validation i `handleJoinWithCode`/`handleJoinAsGuest`. `isLobbyFull` + `isOwnLobby` är fail-open (false om koden saknar meta eller playerName är tomt). `isOwnLobby` jämför case-insensitive trim mot `hostPlayerName`.
  - `setRoomPlayerCount(code, n)` + `setRoomMaxPlayers(code, max)` — Lobby:s sync-effekter skriver tillbaka när `players` ändras eller host togglar Max 4/12 (maxPlayers-syncen är gated på `hostMode` så non-host:s default-state aldrig överskriver host:s val).
  - `deactivateRoom(code)` när host trycker Delete this Game Lobby. Idempotent.
  - Sessions-bunden (förstörs vid app-reload).
  - **Test-seeds**: `'AB23XY'` (Free, max 4, count 1, joinable) + `'QV45LV'` (Premium, max 12, count 1, joinable) + `'AB99FF'` (Free, max 4, FULL → triggar "or to upgrade"-popup) + `'QV99FF'` (Premium, max 12, FULL → triggar "remove players"-popup). Alla seeds har syntetiska `hostPlayerName` (`TestSeedHost1`–`TestSeedHost4`) som inte matchar real-user-namn så `isOwnLobby` aldrig fyrar mot dem.
  - **Capacity-popup-helper** `checkLobbyCapacity(code)` i [app/index.tsx](app/index.tsx) anropas från båda join-handlers efter `isActiveRoom`-checken. Returnerar `true` om popup visades (= caller abortar). Free host: "Lobby is full. Host either need to remove players from lobby or to upgrade". Premium host: "Lobby is full. Host need to remove players from lobby for others to join".
  - **Single-player-gate** `checkSinglePlayerLobby(code)` (2026-08-24) — samma kontrakt som capacity-helpern (`true` = popup visades = abortera), anropas i BÅDA join-handlers + `handleAcceptInvite`, EFTER own-lobby-checken och FÖRE capacity-checken. Popup: "Single player lobby / This Room Code belongs to a single player lobby. Ask the Host to switch to a Multiplayer mode, then try again." ⚠ Källan är `lobby_settings.single_player_default` via `getLobbySettings`, MEDVETET inte en kolumn på rooms-raden som `is_remote_1v1`: remote-läget är låst vid skapandet och kunde göras atomiskt, medan single vs multiplayer är en LEVANDE toggle som host kan slå om när som helst — ett värde fruset vid rums-skapandet hade blivit stale. Följden är att gaten **fail-open:ar** i host:s 300 ms-debounce-fönster innan settings-raden finns (samma konvention som `isLobbyFull`/`isOwnLobby`); onåbart i praktiken eftersom koden måste läsas av och delas manuellt först. Ingen lobby-side-backstop behövs — host:s egen växling till single ejectar redan alla non-hosts via `handleSelectSingle` (Peter 2026-08-24).
  - **Own-lobby-check** via `isOwnLobby(code, playerName)` körs i båda join-handlers FÖRE capacity-check (mer specifikt felmeddelande först). `JoinModal` får `currentPlayerName` som prop från HomeScreen (`profile?.playerName ?? null`). `handleJoinWithCode` jämför mot `currentPlayerName`; `handleJoinAsGuest` jämför mot BÅDA `currentPlayerName` OCH `guestName.trim()` så identitet både via inloggning och guest-form-input fångas. Popup: "User already exists in the lobby". Use case: samma user inloggad på två enheter försöker använda Join Game från device B med koden från device A.
- `src/utils/leftPlayers.ts` — **AsyncStorage** per rumkod. Lagrar `LeftPlayerSnapshot[]` (inte bara id) så nya joiners som inte har lämnande spelaren i sin SEED-baseline kan rendera kortet med `hasLeft`-styling via orphan-injection (se "Lobby — TopUserBanner actions" nedan). `addLeftPlayer(roomCode, snapshot)`, `getLeftPlayers(roomCode)`, `clearLeftPlayers(roomCode)` (anropas av `handleCreateGame`/Play Again för fresh slate på återanvänd kod).
- `src/utils/mockLobbyPlayers.ts` — **in-memory `Map<string, LobbyPlayer[]>`** för host:s authoritative player-lista per rumkod. Host:s `useEffect` på `players[]` skriver hela arrayen via `setLobbyPlayers(code, players)`; non-host:s polling läser via `getLobbyPlayers(code)` och rebuilds lokal state. `clearLobbyPlayers(code)` rensar tillsammans med `deactivateRoom`/`clearLeftPlayers` på alla lifecycle-sites. Importerar `LobbyPlayer` som `import type` för att undvika runtime-circulär dep (LobbyScreen → utils → LobbyScreen).
- `src/utils/mockLobbySettings.ts` — **in-memory `Map<string, LobbySettings>`** för host:s authoritative game-settings (gameMode, singlePlayerDefault, region, answerResponseSeconds, eraFrom/To, roundsCount, selectedExtraPackages, youtubeEnabled, imagesEnabled). Driver non-host:s vy av Game Mode-toggle, Region Scope, Game Era, Number of Rounds, Answer response time, Customized Host packages och Game Connections-pillar. `setLobbySettings`/`getLobbySettings`/`clearLobbySettings`. Skiljd från `mockLobbyPlayers` så ändringar i en sub-domän inte triggar onödig sync av den andra.
- `src/utils/ejectedPlayers.ts` — **in-memory `Map<string, Set<string>>`** över spelare host har radat (trash) eller indirekt utkastat (single-player-default-toggle ON för alla non-hosts). `markEjected(code, playerId)`, `isEjected(code, playerId)`, `clearEjected(code)`. Non-host:s polling-effekt körs PRE-flight (innan settings/players-läsning) — om self är markerad → "User have been removed from this lobby"-popup + Home navigation, och resten av sync hoppas över.
- `src/utils/mockStartedGames.ts` — **in-memory `Set<string>`** över rumkoder där host tryckt Start Game och navigerat till `/quiz`. `markGameStarted(code)` anropas i `handleStartGame` precis före `router.push('/quiz')`. Non-host:s polling-effekt kollar `isGameStarted(code)` PRE-flight efter eject-checken — träff + self är **inte** approved → "Game already started — Host started game without this user"-popup + Home navigation. Approved non-hosts navigeras vidare till `/quiz` (IndDev direkt, PtP efter en Yes/No-prompt — se "Pass-the-Phone — non-host som live-spectator"). `clearGameStarted(code)` ingår i cleanup-bunten.

**Per-user-namespacing** för friends + waitingInvites (för att undvika att User A:s data syns för User B vid logout/login på samma device):
- AsyncStorage-nyckeln innehåller inloggade user:s playerName lowercase: `@quizvibe/friends/v1/<playerName>`, `@quizvibe/waitingInvites/v1/<recipient-playerName>`. Identifieras via `loadProfile()` inuti varje load/save i `friendsStorage.ts` resp. `waitingInvites.ts`. När backend kommer in byts detta mot user-id från auth-token.
- `addInvite(toPlayerName, invite)` tar mottagarens playerName som **explicit första-arg** eftersom invites är cross-user — kan inte härledas från inloggad profil (= avsändaren). Lobby:s `handleInviteFriend` passar `friend.playerName`. `loadInvites`/`removeInvite` opererar däremot på inloggade user:s inbox.
- **Cross-device-leverans via Supabase** (migration `0010_waiting_invites.sql`): `waiting_invites`-tabellen + RLS speglar AsyncStorage-mockens form. `addInvite` dual-writes — Supabase INSERT är primär källa (cross-device via Realtime push på `to_user_id=eq.<auth.uid()>`), AsyncStorage-skrivningen i hostens device-namespace är offline-fallback + single-device-testfall (logout/login på samma telefon). `loadInvites` läser BÅDA och merge:ar via `(roomCode, fromPlayerName.lowercase())`-dedupe-tuple. `removeInvite` dual-deletes. `set_invite_to_user_id`-trigger:n backfillar `to_user_id` via `profiles.player_name` (citext-eq, case-insensitive) så recipient-SELECT-RLS hittar raden utan att klienten behöver göra explicit playerName→user_id-anrop. JoinModal i [app/index.tsx](app/index.tsx) prenumererar på `postgres_changes` (BÅDA `INSERT` OCH `DELETE`) filtrerat på `to_user_id=eq.<userId>` så nya invites pushas live OCH stale invites försvinner direkt vid host-cleanup — defensiv `supabase.getChannels().filter(...).forEach(removeChannel)` innan `.on()` rensar stale channels från remount.
- **Stale-invite-cleanup** (host-side): två cleanup-paths för att förhindra att mottagare ser invites till lobby:s som inte längre är joinbara:
  - **Lobby-deletion** (`deactivateRoom`) — `waiting_invites.room_code` har `ON DELETE CASCADE` mot `rooms(code)`, så DB:n raderar automatiskt alla invites för rummet när host trycker "Delete this Game Lobby". Realtime DELETE-events propageras till mottagarnas JoinModal-sub:ar utan extra client-kod.
  - **Game-start** (`markRoomGameStarted`) — denna sätter bara `rooms.game_started=true` (rooms-raden lever kvar tills 24h-expiry), så CASCADE fyrar inte. `handleStartGame` i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx) anropar därför explicit `clearWaitingInvitesForRoom(roomCode)` direkt efter `markRoomGameStarted` — DELETE-event:en triggar samma JoinModal-sub-reload som CASCADE-fallet.
- **One-shot reset** vid första load efter migrationen: `ensureFriendsReset` / `ensureInvitesReset` läser `getAllKeys()`, filtrerar `@quizvibe/friends/v1*` resp. `@quizvibe/waitingInvites/v1*`, `multiRemove`:ar alla, sätter en migrations-flagga (`@quizvibe/migration/friendsReset/v1` etc.) så reset:n bara körs en gång. Alla startar tomma — undviker att stale legacy-data ärvs av "första-bästa user efter fix" (bug i en tidigare migrationsversion).
- **Per-user-namespacad** sedan 2026-05-22: `gameResults.ts` använder nu `@quizvibe/gameHistory/v1/<playerName>`-mönstret. Tidigare global nyckel exponerade alla devices history för alla users som loggade in på samma device — Peter rapporterade buggen och `HISTORY_PER_USER_RESET_KEY` wipe:ar legacy global + alla per-user keys vid första load post-fix så stale cross-user-data inte ärvs. `LATEST_KEY` är fortsatt global (bara använd direkt efter att en user just spelat — scope-issue:n är begränsad till history-visning). **Shape-v2 (2026-05-22)**: `HistoryEntry` bytte från `totalPoints/avgPointsPerQuestion` → `correctAnswers/totalQuestions` (korrekthetsgrad "3/4 (75%)" är mer meningsfullt än råpoäng för spelaren). `HISTORY_V2_RESET_KEY` wipe:ar pre-shape-bytet entries i en separat one-shot reset så namespaced-användare med v1-shape-data inte triggar render-fel. **Shape-v3 (2026-05-22)**: lade till `age` (frozen vid game-time = currentYear − birthYear), `assistance` och `eraFrom/eraTo` så Player history visar de faktiska inställningarna vid speltillfället (inte aktuella profil-värden, som kan ha ändrats). `HISTORY_V3_RESET_KEY` är en distinkt one-shot reset; `ensureHistoryReset` kollar alla 3 flagor (per-user + v2 + v3) och wipe:ar + sätter samtliga om någon saknas.

## Backend (content catalog + image pipeline)

`backend/` är ett separat Node-projekt med egen `package.json` (sharp, zod, js-yaml, vitest, tsx). 138 tester (135 gröna + 3 skipped) per 2026-07-19. Live-call-CLIs mot Wikipedia/Commons + YouTube Data API + mock data exportör för klient-demo. Ingen live HTTP-API ännu — Supabase-setup parkerad. YouTube-curation-tooling beskrivs i sin egen sektion "YouTube playback & curation" nedan.

**Två-axel content-modell** (`contentForm × contentSubject`, från matrisen i `Mediekällor, kategorier och år.xlsx` flik 1) — schema-deklarerad i `backend/content/schema.ts` på fil-nivå parallellt med befintliga `category` (= distractor-pool-bucket, orörd). Den fasta paret-mappningen från matrisen kodas som en Zod-refine; brott mot paret avvisas vid load. Source of truth för matrisen är Excel-filen (levande dokument utanför repo) — schema-arrays + `FIXED_QUESTION_TEXT` speglar dess "Yes"-celler och "Fixed Question text"-kolumn.

| `contentForm` | Svarsläge | `contentSubject`-värden (13 totalt) |
|---|---|---|
| `youtube` | Year | `song`, `movie`, `sport-event` |
| `image` | Text/Name | `artist`, `band`, `actor`, `character`, `athlete`, `cultural-person`, `celebrity`, `city`, `country`, `place` |

**`artist` vs `band`** (sibling subjects på image-form, tillagda 2026-05-22): curator-val per item. Solo-musiker → `artist` (frågetext "What is the Name of this Artist?"). Grupp-musiker → `band` (frågetext "What is the Name of this band?"). Avgörande är vad vi VILL ATT SPELAREN SVARAR — "Nirvana" som band-namn = `band`; "Kurt Cobain" som artist-namn = `artist`. Solo-fronted bands (Queen, Nirvana, Pink Floyd) styrs av poolens fokus, inte av musikalisk klassificering. Båda subjects delar samma distractor-pool (`artists`-bucket) och visuella behandling — bara frågetexten skiljer.

**Curation-balance-rationalen** (varför `cultural-person` och `celebrity` är separata buckets trots identisk frågetext): vid kuration av base-catalog OCH Host packages måste fördelningen mellan subkategorier kunna verifieras. Slås de ihop förlorar vi möjligheten att se att t.ex. "Famous people"-poolen inte är 90% pop-celebs + 10% intellektuella. Separata buckets = mätbar balans.

**Frågetext härleds från subject** via `FIXED_QUESTION_TEXT: Record<ContentSubject, string>`-konstanten i schema.ts. Export-scripten (`export-music-questions.ts` + `export-image-questions.ts`) bakar in `questionText`-strängen i den genererade JSON så klienten slipper egen lookup-tabell. Klienten (`app/quiz.tsx`) renderar texten som ett enda `<Text>`-element med inline keyword-highlight: regex `/^(.*?)\b(Year|Name|City|Country)\b(.*)$/i` splittar i [before, keyword, after] och rendrar nyckelordet (Year/Name/City/Country) i en nested `<Text style={questionTextHeadline}>` (30px bold) medan resten är `questionText` (18px semibold). Bara nyckelordet är stort — det styr blicken till frågans semantiska anker utan att stjäla 2-3 rader. Items utan matching keyword renderas som enkel-rad. Tidigare hårdkodad `MUSIC_QUESTION_TEXT`-konstant + per-category-switch i `export-image-questions.ts` är borta.

**File-level scope för form/subject**: V1-katalogen är homogen per fil (alla items i `songs-*.yaml` är `form=youtube subject=song`, alla i `artists-*.yaml` är `form=image subject=artist` osv.). Om en framtida fil behöver mixa subjects (t.ex. cultural-person + celebrity i samma persons-fil) flyttas fälten till item-nivå. För deferred-katalogen är `persons-*.yaml` redan en mixad bucket — file-level subject är där en placeholder (`celebrity` eller `cultural-person` baserat på vad poolen lutar mot) som splittas vid V2-aktivering.

**⚠ ALLA items är taggade med ALLA generationer sedan 2026-08-16 — audience-filtret är en no-op i dag.** Varje item i hela katalogen bär `audience: ["elder", "gen-x", "millennials", "gen-z", "gen-alpha"]` (även fil-headrarna), satt av `backend/scripts/tag-all-audiences.ts`. Exkluderingar cherry-pickas per item i efterhand — **item-taggen är default, exkludering är undantaget** (tvärtom mot hur det var tidigare).

Varför: kaskaden nedan gick bara yngre→äldre, så en gen-z-spelare hade **ingen väg alls** till äldre innehåll. Med Game Era 1950–1980 föll 125 region-synliga musik-items till 25 efter audience-filtret, varav 3 var låtar och exakt EN var spelbar utan Spotify (`elvis-presley-heartbreak-hotel`) — Elvis serverades därför i varje spel, oavsett 20-spelars-historiken. Noll items i den eran var taggade `gen-z` (100 var `elder`-only, 80 `gen-x`). Hints-poolen kollapsade likadant: 51 items, 100 % `athlete`, så `mainCategory` blev enbart Sport.

Vid cherry-pick: `backend/output/audience-overrides-before-retag.md` listar de 21 items som hade handtrimmade item-overrides före retaggningen — börja där. Kör `npm run export-music-questions` + `npm run export-image-questions` efter varje ändring.

Konventionen nedan beskriver den ursprungliga modellen. Den är **historik** så länge alla items bär alla generationer, men mekaniken (`item.audience ?? file.audience` → `filterByAudience`) är oförändrad och återaktiveras så fort en exkludering skrivs.

**Filnamn = release-era, audience-tag = recognition** (konventionsklargörande 2026-05-26): YT/music-filer `songs-<gen>.yaml` grupperar items baserat på `correctYear` (= låtens release-år), INTE baserat på vilka generationer som känner igen items. Items i `songs-gen-x.yaml` har release-år inom gen-x:s **födelseår-fönster** (1965-1980), inte items som "är till för" gen-x. Cross-generational recognition hanterades via cascading `audience`-tag på fil-headern:
- `songs-elder.yaml` → `audience: ["elder"]` (saknar tidigare gen att cascade till)
- `songs-gen-x.yaml` → `audience: ["gen-x", "elder"]`
- `songs-millennials.yaml` → `audience: ["millennials", "gen-x"]`
- `songs-gen-z.yaml` → `audience: ["gen-z", "millennials"]`
- `songs-gen-alpha.yaml` → `audience: ["gen-alpha", "gen-z"]`

Mönstret avspeglar att föregående generation typiskt har stark recognition för en file:s release-era (var tonåring eller ung-vuxen när items släpptes). En 1975-född gen-x-spelare får därför music från BÅDE `songs-gen-x` (1965-1980 = sin egen födelseera) OCH `songs-millennials` (1981-1996 = musik hen växte upp med som tonåring i 90-talet), via union-baserat audience-filter (`audienceFilter.ts`).

**Image-filer (`actors-<gen>`, `artists-<gen>`, `athletes-<gen>`, `bands-classics`) följer däremot recognition-audience, INTE birth-year-era**. Exempel: `actors-elder.yaml` har items som Marilyn Monroe (1926), Cary Grant (1904), Audrey Hepburn (1929) — flera är födda före elder-födelseåren (1925-1964) men placeras där eftersom elder-publiken känner igen dem från Hollywood Golden Age. Asymmetrin existerar eftersom personers `correctYear` är birth-year (statiskt) medan recognition utvecklas över tid efter när personen blev kulturellt relevant. För image-curator: placera item där den primära recognition-audiencen finns (= var personen blev känd för en bredare publik), inte strikt efter birth-year. Audience-tag på fil-headern följer samma cascading-mönster (`actors-millennials.yaml` har `audience: ["millennials", "gen-z"]`) så cross-gen recognition driver leverans i game.

**Item-level audience-override** (2026-05-22): items kan bära ett eget `audience: ['elder' | 'gen-x' | ...]`-fält som overrider fil-headerns audience. Edge-case-fix när item-recognition inte sammanfaller med fil-buckets — t.ex. en ny dansband-låt från 2026 i `songs-gen-alpha.yaml` (file-audience `['gen-alpha', 'gen-z']`) som faktiskt är `['elder', 'gen-x', 'millennials']`-recognized. Saknas item-tag används file-tag (= 90%-fallet). Export-scripten (`export-music-questions.ts` + `export-image-questions.ts`) emittar `audiences: item.audience ?? file.audience` så klient-filtret (`audienceFilter.ts`) tar emot effective audience oavsett källa. Schema: `ContentItemSchema.audience: z.array(AudienceSchema).min(1).optional()`. Se `memory/project_audience_tagging.md` för curator-checklista (när override:a fil-tag?).

**Region-modellen — STRIKT HIERARKI (omarbetad 2026-08-11, commit `b7b4c7d`)**

```
global  ⊃  europe  ⊃  nordic  ⊃  <land>          (i dag bara 'sweden')
```

Ett items `region`-tagg säger hur **brett** det är igenkänt. En **spelare** har ett **land**. Itemet visas om spelarens land ligger inom itemets nivå — alltså **INTE** den gamla "intersects"-regeln.

| Tagg | Når |
|---|---|
| `["global"]` | alla länder, överallt |
| `["europe"]` | alla europeiska länder (i dag bara Sverige) |
| `["nordic"]` | alla nordiska länder (i dag bara Sverige) |
| `["sweden"]` | enbart spelare med region scope Sweden |
| `["unknown-region"]` | **ingen** — placeringen är inte beslutad, itemet hålls utanför allt innehåll |

⚠ **`global` betyder MOTSATSEN mot före 2026-08-11.** Gammal innebörd: "ej Sverige-fokuserad → visas EJ för svensk spelare". Ny innebörd: "igenkänt överallt → ingår i VARJE region scope". Det är nu den **bredaste** taggen, inte den smalaste. 97 items omtaggades i migrationen; hittar du en kommentar eller ett memory som påstår det gamla är den stale.

⚠ **Multi-tag är utdöende.** `["sweden","global"]` är REDUNDANT — `global` når redan Sverige. Skriv **EN nivå** per item. (Filtret tolererar arrays: itemet syns om NÅGON tagg är inom räckhåll.)

**Implementation** — hierarkin är en **land → kedja**-tabell, inte parvisa regler, så nytt land = en rad:

```ts
// backend/content/schema.ts  +  src/utils/regionScope.ts (klient-spegel — HÅLL I SYNK)
export const REGION_ANCESTRY: Record<RegionCountry, readonly Region[]> = {
  sweden: ['global', 'europe', 'nordic', 'sweden'],
  // norway:  ['global', 'europe', 'nordic', 'norway']
  // germany: ['global', 'europe', 'germany']   // europeiskt, ej nordiskt
  // japan:   ['global', 'japan']               // varken eller
};
isItemInRegionScope(itemRegions, country)  // true om någon tagg finns i kedjan
```
`'unknown-region'` står **medvetet inte i någon kedja** — därför når den ingen, utan special-case. 6 tester i `backend/content/test/schema.test.ts` låser beteendet.

**Curator-regel**: default fil-headerns `region: ["sweden"]`. Välj annars EN nivå efter faktisk igenkänningsbredd. Använd `unknown-region` när itemet inte är tillräckligt känt — det är rätt tagg för "duger inte till poolen än", INTE en smalare geografi.

**Paket-exklusivitet hör INTE hit.** Tidigare hackade vi `region: ["unknown-region"]` för att hålla paket-items utanför baspoolen. Använd **`inBaseCatalog: false`** i stället (+ `genrePackages`), så bär `region` ren geografi. Noll unknown-region används som paket-grind i dag.

⚠ **`genrePackages` ensamt döljer INGENTING.** `inBaseCatalog` defaultar till `true`, så enbart taggen betyder "ligger kvar i baspoolen OCH dyker upp när paketet släpps" (så är t.ex. `queen-we-will-rock-you` base + `sport`). Paket-exklusivt kräver BÅDA fälten.

**`hiphop`-taggen är medvetet i blandat läge (Peter 2026-08-13).** `mc-hammer-u-cant-touch-this` är paket-exklusiv (`inBaseCatalog: false`), medan de sex äldre hiphop-items:en (`sugarhill-gang-rappers-delight`, `nas-if-i-ruled-the-world`, `dr-dre-the-next-episode`, `50-cent-in-da-club`, `eminem-my-name-is`, `outkast-ms-jackson`) ligger kvar i baspoolen. Det är INTE en bugg att städa — de sex ska lyftas ur baspoolen först när hiphop-paketet faktiskt byggs. **Lös alltså INTE inkonsekvensen genom att ta bort MC Hammers `inBaseCatalog: false`.** `rock` är däremot helt paket-exklusivt redan i dag.

**`PLAYER_COUNTRY` är hårdkodat `'sweden'`** i [regionScope.ts](src/utils/regionScope.ts). **Spelarens land är ännu inte wire:at** — varken `ProfileData.region` (`'sweden'|'nordics'|'global'`) eller Lobby:ns "Region Scope" (Sweden/Nordics/Europe/Global) är ett LAND; båda beskriver hur brett innehållet ska vara. En av dem måste bli en riktig landväljare innan hierarkin gör skillnad i spelet. Följd i V1: global/europe/nordic/sweden är alla synliga, unknown-region är det inte.

Se `memory/project_v1_v2_region_strategy.md` (skriven under den gamla modellen — läs med ovanstående som facit).

**Film-items: Name som standard, Year bara som spoiler-undantag (Peter 2026-08-13).** Ett filmklipp har **exakt ETT** svarsläge, fast per klipp — aldrig båda:
- **`answerMethods: ["actor-select"]`** = default. Frågan blir "Select one of the main actors in this film?".
- **`answerMethods: ["timeline"]`** = undantag, används när klippets YouTube-titel röjer huvudrollsinnehavaren men INTE året. Frågan blir "Which Year was this Movie launched?".

⚠ **Sätt ALDRIG `["actor-select", "timeline"]` på ett film-item.** Ett kort pass 2026-08-13 taggade 23 filmer så inför en tänkt runtime-växling mellan Year/Name; den modellen är förkastad och taggningen återställd. Det ska inte finnas någon växling under spel, ingen lobby-toggle och ingen slump.

**Ingen kod behövs för att byta läge** — mekaniken finns redan: `export-music-questions.ts` emitterar `correctNames`/`isAnimated`/`distractorNames` bara när `answerMethods` innehåller `'actor-select'`, och låter annars `questionText` falla tillbaka på `FIXED_QUESTION_TEXT['movie']`. Klientens `SEED_QUESTIONS` grenar i sin tur på om `correctNames` kom med. Byt värdet i YAML + kör `npm run export-music-questions`, så följer frågetext, GetReadyIntro-badge och nedräkningsordet ("When"/"Who") med automatiskt. `correctNames` kan lämnas kvar i YAML — den exporteras helt enkelt inte i timeline-läget.

**Röjer titeln BÅDA (år + skådespelare) → byt klipp, inte läge.** Att flippa till Year hjälper inte då. OBS att YouTube-spelaren **kapar långa titlar**, så en träff i titeln inte automatiskt är ett problem: Peter verifierade 2026-08-13 i appen att `cool-runnings-1993` (titel 65 tecken, namnet vid 55) och `the-good-the-bad-and-the-ugly-1966` (84 tecken, namnet vid 54) INTE visar namnet för spelaren. Det avgörande är om hela titeln får plats — **korta titlar är de farliga**. Testa i spelaren innan ett klipp döms ut.

**Sportevent + YouTube** är aktiverad i matrisen ("Which Year did this happen?") — `sport-events-classics.yaml` har 50 items (ned från 56 efter valideringspass 2026-06-03). Movie-subject: `movies-classics.yaml` (29 items, globala filmklassiker) + **`movies-sweden.yaml`** (7 items, validerade svenska filmklassiker med YT-trailers: Sällskapsresan, Göta Kanal, Jönssonligan, Sunes Sommar, Så som i himmelen, Hundraåringen, En man som heter Ove).

**Eurovision host-paket (förberett 2026-06-03)**: ~67 YT-items har `genrePackages: ["Eurovision"]` — alla ESC-vinnare + svenska ESC-bidrag i katalogen är taggade. **Uppdaterat 2026-08-11**: de 8 icke-svenska ESC-items:en är numera `region: ["europe"]` + `inBaseCatalog: false` (paket-grinden ligger på `inBaseCatalog`, inte på region — se region-modellen ovan). De 68 svenska ESC-bidragen behåller `region: ["sweden"]` och ligger kvar i baspoolen, med Eurovision-taggen ovanpå. Paketet aktiveras via `PURCHASED_PACKAGES` i `mockPurchasedPackages.ts` när det ska säljas — inga klient-ändringar krävs. **ESC live-klipp startSec-konvention**: alla ~78 clips från `channelTitle: "Eurovision Song Contest"` har `startSec: 5` (hoppar förbi typisk publikjubel + landannonsering i introt). Undantag: manuellt kurerade clips med egna värden (t.ex. Eric Saade 35s, Ruslana 50s) behålls orörda.

**Struktur**:
- `backend/content/catalog/*.yaml` — innehållslistor per generation × kategori. 5 generations-grupper: `elder` (Silent + Boomers, 1925-1964), `gen-x`, `millennials`, `gen-z`, `gen-alpha` + `'all'` (baseline). Fil-headern är `audience + category + contentForm + contentSubject + items`. Items har: `id` (kebab-case), `displayName`, `correctYear?` (optional för image-frågor; required om answerMethods inkluderar `'timeline'`), `probability` (0-100), `wikimediaSearchHints[]`, `answerMethods: ('timeline'|'name-letters')[]`, `sensitivity: 'standard'|'sensitive'`. **Live-katalogen efter politiker-purge (2026-05-21): 18 filer / 182 items** (artists × 4 gen + actors × 3 gen + athletes × 2 + songs × 5 gen + songs-all + capitals × 3). Deferred-mappen (`catalog/deferred/`) är tom men bevaras för framtida items. **Innehållspolicy**: politiker (Hitler, Stalin, Churchill, Kennedy, FDR, Obama, Palme, Persson, JFK, etc.) + aktivister (Greta Thunberg) + bredare "cultural-person"/"celebrity"-buckets (Astrid Lindgren, Ingmar Bergman, MrBeast, PewDiePie, Kim Kardashian, Kylie Jenner, Mark Zuckerberg, Steve Jobs) togs bort vid politiker-purge:n 2026-05-21. Kvarvarande person-bilder är `artist` (musiker), `actor` (skådespelare), `athlete` (idrottare) + ev. `character` (fiktiva — parkerade pga ©). **Fiktiva karaktärer (Elsa, Spider-Man, Mario, Sonic, Peppa Pig, Bluey, Wednesday Addams) togs bort 2026-05-10** — officiella karaktärs-illustrationer är upphovsrättsskyddade och kan inte användas i kommersiell quiz-app utan licens. Återinför ev. via skaparen (Miyamoto → Mario, Idina Menzel → Elsa).
- `backend/content/schema.ts` — Zod-schema. Definierar `ContentFormSchema`, `ContentSubjectSchema`, `SUBJECTS_BY_FORM`, `FIXED_QUESTION_TEXT` + refines som låser matrix-parens. Validation: items med `'timeline'` i answerMethods MÅSTE ha `correctYear`. Cross-audience-figurer (Zlatan, Cristiano, Messi, ABBA, Madonna, etc.) listas en gång per fil — registry tolererar dubblett-IDs över filer men kräver unika inom en fil.
- `backend/content/registry.ts` — `loadCatalog`, `findItemsForAudience` (default `excludeSensitive: true` → Hitler/Stalin filtreras bort i spelutbud, admin sätter `excludeSensitive: false` för full vy), `findItemsById`.
- `backend/content/generation.ts` — `birthYearToGeneration`, `generationDistance`, `getLetterGridConfig` (assistance → mode: **full → full-names** (mest hjälp = se hela namnet, ingen prefix-pussel); **standard → prefix-2** (2-bokstavs prefix); **minimal → prefix-1** (1-bokstavs prefix). Forcing-override för småbarn: född 2016+ → full-names oavsett assistance. Distans-promote för Standard/Minimal: född 2013-2015 + distance > 1 → full-names; övriga + distance > 2 → full-names. Millennials har max-distance 2 till alla generationer, så på Standard/Minimal får de alltid prefix.).
- `backend/content/distractors.ts` — `getPrefixForItem` (extraherar prefix, behåller diakriter, skipparar non-letters), `buildLetterGrid`, `buildNameOptions`, `buildFullNamesList` (Full-mode-helper: returnerar N namn utan prefix-filter — 1 rätt + (N-1) distractors från katalog/pool, blandade). Pool-strategi: kategori+audience → kategori-fallback → `distractor-pool.yaml` med ~50 plausibla namn per kategori. `NameOption.source` = `'catalog'` eller `'pool'`.
- `backend/wikimedia/client.ts` — Wikipedia pageimage-lookup (primär källa, kuraterade huvudbilder) + Commons text-search (fallback) + license/artist från Commons imageinfo. CLI: `npm run wikimedia-search <item-id>`.
- `backend/wikimedia/processor.ts` + `process.ts` — `fetchImage` + sharp-pipeline (resize max 1920×1080 med aspect ratio bevarat + WebP @ q85). CLI: `npm run wikimedia-process <item-id>`. Output till `backend/output/` (gitignore:ad).
- `backend/scripts/export-image-questions.ts` — genererar `src/utils/quizImageQuestions.ts` med tre varianter per item: `prefix-1` (Minimal), `prefix-2` (Standard), `full-names` (Full = vertikal namn-lista utan prefix). Discriminerad union `ImageQuestionVariant = ImagePrefixVariant | ImageFullNamesVariant` på `mode`-fältet. Pre-bakas med Millennials som baseline-generation för distractor-pool. CLI: `npm run export-image-questions`. Regenerera efter att nya bilder lagts till.

**Sharp-gotcha**: `sharp(input).resize(...).resize(...)` — den första `resize()` ignoreras tyst när två chainas. Måste köra som två separata `sharp()`-instanser med mellan-buffer:
```ts
const downscaled = await sharp(input).resize(w, h, { kernel: sharp.kernel.nearest }).png().toBuffer();
const buffer = await sharp(downscaled).resize(upW, upH, { kernel: sharp.kernel.nearest }).jpeg().toBuffer();
```

**Wikimedia thumbnail URL-construction** (`buildWikimediaThumbnailUrl` i `client.ts`): använder ren strängmanipulation (inte `URL`-class) för att undvika att Node re-encodar `()` → `%28%29`. iOS expo-image kan ha problem med vissa percent-encoded thumbnail-URLer. För säker rendering: använd vanlig RN `Image` (inte `expo-image`) för data-URI/thumbnail-källor i demo-flow.

**Image rendering iOS gotchas**:
- `expo-image` har `transition`-prop som default fadar in nya source — kan blockera snabba source-byten via state-changes. Sätt `transition={0}` eller använd `<Image>` från `react-native`.
- `cachePolicy="memory-disk"` cachar per source-uri. Vid frågebyte kan förra bilden visas under ny load. Lägg `key={questionIndex}` på `<Image>` för att tvinga remount, eller `cachePolicy="none"` för demo.
- iOS native UIImageView interpolerar smooth vid upscale → "blurry → sharp" inte "blocky pixels". Äkta pixelation kräver pre-rendering serverside med `kernel: 'nearest'` + nedladdning som data-URI eller statisk fil.

**Generation-mappning** (i `generation.ts`):
| Värde | Födelseår |
|---|---|
| `elder` | 1925-1964 (Silent + Boomers) |
| `gen-x` | 1965-1980 |
| `millennials` | 1981-1996 |
| `gen-z` | 1997-2012 |
| `gen-alpha` | 2013-2028 |
| `all` | baseline (alltid distance 0) |

**Lägga till ett nytt contentSubject** (checklista — använd när du startar curation för t.ex. `movie`, `sport-event`, `actor`, `athlete`, `country`, `place` som idag har 0 items):

1. **Schema (om `Category`-enum behöver utvidgas)** — `CategorySchema` i [schema.ts](backend/content/schema.ts) har 6 värden (`persons(deprecated) | capitals | artists | songs | actors | sport`). **`sport` hette `athletes` t.o.m. 2026-07-19** — renamed per Peters beslut (bara category-värdet, filnamnen `athletes-*.yaml` behölls). Subjects som mappar semantiskt mot befintliga values (t.ex. `actor` → `actors`, `athlete` → `sport`; `country`, `building`, `place` → `capitals`) kan återanvända dem. Subjects som INTE passar (t.ex. `movie`, `sport-event` — de är `youtube`-form men inte musik) behöver antingen (a) lägga till nytt värde i `CategorySchema`, eller (b) återanvända `songs` som approximation (`category` är på utdöende — `contentForm × contentSubject` är ny source of truth).
2. **Distractor-pool-bucket** — `distractor-pool.yaml` har idag bara 4 buckets (`persons/capitals/artists/songs`). Om det nya subjectet använder en NY category (steg 1a), lägg till motsvarande bucket med ~50 plausibla distraktor-namn. Om det återanvänder en befintlig category är ingen åtgärd nödvändig (pool ärvs).
3. **YAML-fil** — skapa `backend/content/catalog/<subject>-<audience>.yaml` med header:
   ```yaml
   audience: ["<generation>"]   # eller flera: ["millennials", "gen-z"]
   category: <category>          # från steg 1
   contentForm: <youtube|image>  # från matrisen
   contentSubject: <subject>     # från matrisen
   items:
     - id: <kebab-case-id>
       displayName: "<Display Name>"
       correctYear: <year>       # optional för image-frågor som är era-agnostiska (t.ex. capitals)
       probability: <0-100>
       wikimediaSearchHints: ["<search term>"]
       answerMethods: ["name-letters"]  # eller ["timeline"] för YT-year-frågor
   ```
4. **Items** — använd `npm run wikimedia-search <id>` (bildkällor) eller `npm run youtube-search <id>` (YT-klipp) för curation-stöd.
5. **Image-items**: INGEN bildfil behövs — bild-assetsen är raderade (se "⚠ Bild-assets är RADERADE"). Ett image-item blir spelbart när det har **≥10 hints** i `HINTS_LIBRARY`; kör `npm run fetch-hints-data` och därefter `npm run export-image-questions`.
6. **Validera** — `npm run validate` (= `npx tsx content/registry.ts`) + `npm test` (ska fortfarande vara gröna).
7. **Regenerera klient-data** — `npm run export-image-questions` eller `npm run export-music-questions`. Verifiera diff på `src/utils/quizImageQuestions.ts` / `src/utils/musicQuestions.ts`.
8. **Klient-uppdateringar** — om nytt subject kräver special-rendering (t.ex. `movie` skulle behöva film-poster-aspect-ratio): justera `quiz.tsx` `imageMediaCard`-styles per behov. Default 16:9-container + contain-mode hanterar alla bildtyper.

## Conventions

- Comments are often in Swedish. Keep that style when editing existing files; new files can be English.
- Theme tokens, never raw hex. `Colors.background`, `Spacing.md`, etc. Brand-paletten har **två blå-nyanser**: `Colors.primary` (`#4DA3FF`, default brand) och `Colors.primaryDark` (`#114E91`, mörk variant — används för subtila accenter som single-player-checkboxens border).
- Screens currently mix layout, modals, and domain logic in one file — when extending, prefer extracting sub-components into `src/components/`.
- **Border-cutting badge pattern** for "tag" labels that overlap a card/button border (HOST/GUEST in `PlayerRow`, FREE on the Register button in `app/index.tsx`, FREE/PREMIUM on the Game Mode toggle in `LobbyScreen`). The badge is `position: 'absolute'` with `top: -8`, a matching `backgroundColor` to the parent border, and `paddingHorizontal: 8 / paddingVertical: 2`. The parent must be `position: 'relative'` and must NOT use `overflow: 'hidden'`, or the badge gets clipped.
- **Host-vs-non-host settings pattern** (Game Mode buttons, mfl.): default är att alltid rendera kontrollen för alla i lobbyn så icke-host ser hostens val i real-tid, men passera `disabled={!hostMode}` så bara host kan ändra. Read-only state använder fortfarande brand-colors så hostens val är läsligt. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.
  - **Undantag: Game Connections-blocket** (YouTube/Profiles & Places-rader + "Customized Host packages"-sub-blocket). Här gömmer vi alla switchar, "Select all"-raden och Buy CTA för icke-host. Guests ser bara Enabled/Disabled-pillar på source-raderna och en read-only lista över *aktiva* paket (filtrerad via `selectedExtraPackages`) i en active-stylad text-box. Sub-rubriken byter till "Packages for this lobby selected by the Host:" när `!hostMode`.

## Player Name (registration + validation)

**Format spec** (`src/utils/playerName.ts`): `[Letters]-[Digits]` där Letters = 1–10 A–Z (första versal, resten gemener) och Digits = 0–7 siffror. Dash är optional i lagrad form — om användaren inte typar några digits sparas namnet som `Anna` (inte `Anna-`). Exempel: `Anna`, `Anna-1234`, `GuestAbcde-1234567`.

Helpers exporteras: `appendPlayerNameLetter`, `appendPlayerNameDigit`, `backspacePlayerNameLetters`, `backspacePlayerNameDigits`, `normalizePlayerName`, `isPlayerNameFormatValid`, `hasBlockedLetterLead`, `getPlayerNameLetters`, `getPlayerNameDigits`. Konstanter: `PLAYER_NAME_MAX_LETTERS = 10`, `PLAYER_NAME_MAX_DIGITS = 7`.

**`generatePlayerName(taken, options)`** tar `{ prefix?, excludeLetters?, keepLetters?, targetLetterLength? }`:
- `prefix: 'Guest'` → `GuestA-1234567` (6 letters + 7 digits). Prefix normaliseras (G versal + rest gemener) och exakt EN versal random-bokstav appendas efter prefix så användaren visuellt ser var prefixet slutar. 26 × 10⁷ = 260M unika ID:n — mer än nog för uniqueness. Tidigare format ("GuestAbcde-1234567" med 5 random tecken) ersattes 2026-05-22 för kortare/läsligare guest-namn.
- `excludeLetters: Set<string>` (bara meningsfullt med `prefix`) — versal-bokstäver som ska UNDVIKAS i positionen direkt efter prefix. Driver lobby-uniqueness: när host använder + Add Player eller en ny guest joinar via Join Game härleds setet från lobbyns nuvarande spelar-lista (via `extractTakenGuestLetters`) så två guests aldrig får samma identifierar-bokstav (GuestA + GuestB istället för GuestA + GuestA). Edge case när alla 26 letters är excluded → fallback till helt random bokstav (statistiskt omöjlig i en lobby med max 12 guests).
- Inget `prefix` (Register-default) → `Abcdefghi-1234567` (9 random letters + 7 digits, första versal, resten gemener).
- `keepLetters: 'Anna'` → bevarar exakt typade letters, randomiserar bara digits. Används av "Try to keep PlayerName letters?"-promptens Yes-branch.

**`extractTakenGuestLetters(names)`** scannar en lista spelarnamn och returnerar Set:en av versal-bokstäver som redan används som Guest-suffix. Mönster `/^Guest([A-Z])/` fångar både kanoniska auto-genererade namn ("GuestA-1234567") och edge case där host typat "GuestA"-prefix manuellt. Renamed-guests (t.ex. "PlayerXYZ") bidrar inte. Anropare ansvarar för att filtrera bort `hasLeft`-spelare innan namnen passeras in (deras letter ska frigöras).

**Två call-sites driver excludeLetters**:
- **AddPlayerModal** ([src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): `takenGuestLetters` deriveras synkront i parent via `useMemo` på `players.filter(!hasLeft).map(p => p.name)` och passeras som prop. Auto-fill vid open + Auto-generate-knappens "Replace all"-branch använder det.
- **JoinModal Guest-form** ([app/index.tsx](app/index.tsx)): async lookup via `await getLobbyPlayers(code)` (mockLobbyPlayers Promise-API:t) precis innan auto-gen. Effect:n återställs via `cancelled`-flag om step/code ändras innan promisen resolvar.

**Format-regex** `PLAYER_NAME_FORMAT_RE = /^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$/` — tillåter internal uppercase efter första bokstaven (så `GuestAbcde` validerar) och dash + 1–7 digits är optional. Orphan trailing dash (`Anna-`) är invalid och strippas av `normalizePlayerName` innan validation/save. Manuell input via CodeKeyboard styrs av `appendPlayerNameLetter` som följer striktare regel (första versal/resten gemener); regex:n är därmed bara löst nog att inte underkänna giltiga auto-genererade kombinationer.

**Filter aktiva både i auto-gen OCH manuell input**:
- `BLOCKED_LETTER_LEAD_PAIRS` (`AS, CP, KK, SS, NS, AH, HH, NB`) — synkad med `BLOCKED_LETTER_PAIRS` i `roomCode.ts`. Filtrerar de första 2 bokstäverna. Auto-gen retry:ar; manuell input blockas via `hasBlockedLetterLead()` i `validatePlayerName`/`validateAddPlayerName`.
- `containsProfanity()` (l33t-normalisering + obfuscation-strip) körs på alla auto-gen kandidater + alla manuella Check-tryck.

**`normalizePlayerName(value)`** strippar trailing dash så `Anna-` → `Anna`. Anropas på två platser:
1. Check-handlers (innan validation) så statusen baseras på den slutgiltiga formen.
2. Save-/navigation-sites (`handleRegisterSubmit`, `handleJoinAsGuest`, `AddPlayerModal.handleAdd`) som defensiv belt-and-suspenders så trailing dash garanterat inte läcker till persisted state.

**Split-field UI** (i alla tre forms — JoinModal guest + Register + AddPlayerModal): två separata TextInputs `[Letters] – [Digits]` med fixed text-separator `–` mellan. State håller sammansatt sträng (`"Anna-1234"`) som single source of truth; fälten visar derived `getPlayerNameLetters(state)` / `getPlayerNameDigits(state)`. Letters-fältet är alltid editable; digits-fältet dimmas (`opacity 0.45`) + blir read-only tills letters har minst 1 tecken (digit-tap snäppar fokus tillbaka till letters om tomt). Backspace dispatchas per fokuserat fält:
- `backspacePlayerNameLetters` tar bort sista letter; om letters töms helt clearas digits + dash också (orphan-prevention).
- `backspacePlayerNameDigits` tar bort sista digit; om digits töms tas dashen bort så letter-fältet blir editable.

**Field-styling** (`playerNameLettersInput` flex 7, `playerNameDigitsInput` flex 6, båda `paddingHorizontal: Spacing.sm` + `textAlign: 'center'`): empiriskt tunad ratio så `GuestAbcde` (10 chars) ryms i letters och alla 7 digits ryms i digit-fältet. Reducerad padding (8px vs default 16px) sparar 16px content-yta per fält. `playerNameSeparator` är fontSize 22, `Colors.textSecondary`, `paddingHorizontal: 2`.

**Cursor-låsning på alla 6 inputs** — `selection={{ start: value.length, end: value.length }}` håller cursor efter sista tecknet vid varje render, `selectTextOnFocus={false}` förhindrar select-all vid focus, `contextMenuHidden={true}` döljer Cut/Copy/Select All-context-menyn. Resultat: enda sättet att redigera är via CodeKeyboard:s Backspace som alltid tar sista tecknet i fokuserat fält.

**Auto-generate prompt** "Try to keep PlayerName letters or not?" (Cancel / Replace all / Keep letters) visas när användaren tappar Auto-generate och letters-sektionen har innehåll. Tom field → genererar direkt utan prompt. Replace all = ny full random; Keep letters = behåller letters, randomiserar bara digits. Knappen är ALLTID enabled (förutom under `status === 'checking'`) — Remove är aktiv när field har innehåll.

**Register-formen auto-fyller INTE PlayerName** (efter sessionsbeslut): fältet startar tomt. Användaren måste typa själv eller trycka Auto-generate. Guest-formen och AddPlayerModal auto-fyller fortfarande vid open via `prefix: 'Guest'`-pathen.

**`validatePlayerName(name)` / `validateAddPlayerName(name, existingNames?)`** kontrollerar i ordning: (1) `isPlayerNameFormatValid`, (2) `hasBlockedLetterLead`, (3) `containsProfanity`, (4) uniqueness mot mock taken-lista, (5) `existingNames`-Set (AddPlayerModal: befintliga lobbyspelare inkl. host). Returnerar `'available' | 'taken' | 'invalid'`. UI status-type: `PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'`.

**Async Supabase uniqueness-check** (2026-06-22): både Register-formens `handleRegCheckPlayerName` och AddPlayerModal:s `handleCheckPlayerName` är async. Efter att lokal validering godkänt anropas `lookupEmailByPlayerName(normalized)` (Supabase RPC) — returnerar email om namnet är registrerat → `'taken'`. Vid nätverksfel faller det tillbaka till `'available'`. Detta förhindrar att man registrerar eller lägger till en guest med ett redan taget PlayerName.

**Field-labels** (Register + JoinModal guest): "Player Name - Letter-digit format". **Format-hint under fältet** (alla tre forms): "Format: 1-{PLAYER_NAME_MAX_LETTERS} letters, 0-{PLAYER_NAME_MAX_DIGITS} digits" — deriveras från konstanterna så framtida ändringar slår igenom automatiskt.

**Auto-fill-detektion-regex** i `handleJoinAsGuest` analytics: `/^Guest[A-Z]-\d{7}$/` matchar Guest-prefix + 1 versal random + 7 digits.

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Assistance='full', Region='sweden' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

**Registration host-defaults** (sätts i `handleRegisterSubmit` i [app/index.tsx](app/index.tsx) och speglas i ProfileScreen:s auto-augment för ofullständiga profiler):
- `gameMode: 'pass-the-phone'`, `singlePlayerDefault: false` — Pass-the-Phone är default-läge.
- `roundsDefault: 4` (ROUNDS_DEFAULT) — 4 rundor.
- `answerResponseSeconds: 30` — 30 sekunders svarstid.
- `youtubeEnabledCategories` + `imagesEnabledCategories`: alla 3 (Music/Film/Sport) — allt aktiverat.
- `spotifyDefaultEnabled: false` — Spotify av.
- **`gameEraFrom`**: spelarens födelseår.
- **`gameEraTo`**: slutet av spelarens generation + 2 steg framåt. Generationer (A–E): A=≤1964, B=1965–80, C=1981–96, D=1997–2012, E=2013–ERA_MAX. Exempel: född 1977 (gen B) → era_to = 2012 (D); född 1985 (gen C) → era_to = ERA_MAX (E). Implementerat via `_genEndYears=[1964,1980,1996,2012,currentYear]`, `min(genIdx+2, 4)`.

**Year of birth-caps**: Profile, Register-form och Guest-form har gemensamma cap:ar `MIN_BIRTH_YEAR = 1930`, `MAX_BIRTH_YEAR = CURRENT_YEAR - 15` (dynamisk — 15+ minimum ålder; höjt från 13+ 2026-06-01 pga 15+-gränsat film-/innehåll i appen, utöver App Store / GDPR). Endpoints renderas via `formatBirthYear`-helper som lägger till "or earlier" på 1930 och "or later" på MAX_BIRTH_YEAR — representerar öppna intervall (alla födda ≤1930 / ≥CURRENT_YEAR-15). `formatBirthYear` används både i picker-listan och i selector-trigger-texten så framing är konsistent. Profile + Register + Guest delar samma `BIRTH_YEARS`-array och format-helper (Profile har egen kopia eftersom den lever i en annan fil — håll dem synkade vid framtida ändringar). LobbyScreen har egen kopia med samma formel.

**Password** (Register-form): `REG_PASSWORD_MIN_LENGTH = 6`, `REG_PASSWORD_MAX_LENGTH = 32`. Placeholder + maxLength + format-hint ("Format: min 6-32 characters") under fältet deriveras från konstanterna. Min 6 = NIST-baseline så användare inte tvingas migrera vid backend-integration. Max 32 = under bcrypt:s 72-byte-cap med marginal + täcker alla realistiska lösenord/passphrases utan att blåsa upp testytan.

**Assistance level** (`'minimal' | 'standard' | 'full'`, persisted as `ProfileData.assistance`) styr mängden hjälp i spelet — `full` = mest hjälp (3-letter prefix i Letter Grid, snabb reveal-curve), `standard` = 2-letter prefix + linjär reveal, `minimal` = 1-letter prefix + slow reveal som aldrig fullt avslöjar bilden. Tidigare hette fältet `skill` med värdena `easy/intermediate/expert`; båda `loadProfile` (i `profileStorage.ts`) och `loadLatestResult` (i `gameResults.ts`) gör dual-read av gammalt fält + värde-mappning så befintliga profiler/resultat migreras passivt vid nästa save. Mappning: `easy → full`, `intermediate → standard`, `expert → minimal`.

**Stylesheet-keys medvetet kvar som `skillRow`/`skillBtn`/`skillBtnText`** i `app/index.tsx` och `LobbyScreen.tsx` även efter rename:n — det är privat CSS-vokabulär per fil (inte domän-koncept) och de exporteras inte. Att jaga dem skulle bara öka diff-ytan utan att förbättra läsbarhet. Skapa nya stylesheet-nycklar med `assistance*`-prefix om du behöver mer styling, men byt inte namn på de befintliga reflexmässigt.

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Assistance='full', Region='sweden' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

**Year of birth-caps**: Profile, Register-form och Guest-form har gemensamma cap:ar `MIN_BIRTH_YEAR = 1930`, `MAX_BIRTH_YEAR = CURRENT_YEAR - 15` (dynamisk — 15+ minimum ålder; höjt från 13+ 2026-06-01 pga 15+-gränsat film-/innehåll i appen, utöver App Store / GDPR). Endpoints renderas via `formatBirthYear`-helper som lägger till "or earlier" på 1930 och "or later" på MAX_BIRTH_YEAR — representerar öppna intervall (alla födda ≤1930 / ≥CURRENT_YEAR-15). `formatBirthYear` används både i picker-listan och i selector-trigger-texten så framing är konsistent. Profile + Register + Guest delar samma `BIRTH_YEARS`-array och format-helper (Profile har egen kopia eftersom den lever i en annan fil — håll dem synkade vid framtida ändringar). LobbyScreen har egen kopia med samma formel.

**Assistance level** (`'minimal' | 'standard' | 'full'`, persisted as `ProfileData.assistance`) styr mängden hjälp i spelet — `full` = mest hjälp (3-letter prefix i Letter Grid, snabb reveal-curve), `standard` = 2-letter prefix + linjär reveal, `minimal` = 1-letter prefix + slow reveal som aldrig fullt avslöjar bilden. Tidigare hette fältet `skill` med värdena `easy/intermediate/expert`; båda `loadProfile` (i `profileStorage.ts`) och `loadLatestResult` (i `gameResults.ts`) gör dual-read av gammalt fält + värde-mappning så befintliga profiler/resultat migreras passivt vid nästa save. Mappning: `easy → full`, `intermediate → standard`, `expert → minimal`.

**Stylesheet-keys medvetet kvar som `skillRow`/`skillBtn`/`skillBtnText`** i `app/index.tsx` och `LobbyScreen.tsx` även efter rename:n — det är privat CSS-vokabulär per fil (inte domän-koncept) och de exporteras inte. Att jaga dem skulle bara öka diff-ytan utan att förbättra läsbarhet. Skapa nya stylesheet-nycklar med `assistance*`-prefix om du behöver mer styling, men byt inte namn på de befintliga reflexmässigt.

## Register modal — keyboard handling

Register-formen har komplex keyboard-hantering eftersom Email/Password använder system-keyboard medan PlayerName använder custom CodeKeyboard. Hårt vunna lärdomar:

**Sheet bounding & ScrollView shrinkage**: `profileMenu.sheet` har `maxHeight: '90%'`; ScrollView:n inuti har `style={{ flexShrink: 1, maxHeight: 320 }}`. Utan dessa pushar KAV (`behavior="padding"`) hela sheet:en upp och toppen klipps — Email/PlayerName/Password försvinner ovanför skärmen. Med dem krymper ScrollView:n och allt stannar synligt.

**Kort-skärm-fix för custom CodeKeyboard (2026-06-27)** — på äldre iPhones (SE/8 = 667 px, SE1 = 568 px) gjorde PlayerName-fältets custom CodeKeyboard att fält-ScrollView:n kollapsade till ~0 px → användaren såg inte fältet de skrev i (gällde BÅDE Register-formen OCH JoinModal:s guest-form). Det finns INGET system-keyboard här (`showSoftInputOnFocus={false}`), så KAV:n gör inget — det custom CodeKeyboardet är ren flow-content under ScrollView:n. På en 667 px-skärm äter sheet-padding + gaps + Back + titel + subtitel + keyboard + 2 knappar ~548 px av sheet:ens ~600 px (90 %), vilket lämnar ScrollView:n ~52 px (0 vid full-size keyboard). Tre-delad fix:
- **Responsiv CodeKeyboard** ([src/components/CodeKeyboard.tsx](src/components/CodeKeyboard.tsx)): module-level `COMPACT = SCREEN_H < 700` / `VERY_COMPACT = SCREEN_H < 600` skalar `KEY_HEIGHT` (44→36→30), `KEY_GAP` (8→6), `VPADDING` (12→8), `MARGIN_TOP`. 26-bokstavs-grid:en går från ~340 px → ~270 px (667) / ~234 px (568). Gäller även AddPlayerModal som delar komponenten.
- **Tightare sheet padding/gap på korta skärmar**: BÅDA `modal.sheet` (JoinModal) och `profileMenu.sheet` (Register) använder nu `SCREEN_HEIGHT < 700` (var `< 600`) för padding `md` istället för `xl` + gap `sm` istället för `md`.
- **Dölj titel + subtitel medan custom-keyboardet är uppe** på korta skärmar (`SCREEN_HEIGHT < 700 && (playerNameFocused || focusedCodeIdx !== null)` för guest; `SCREEN_HEIGHT < 700 && regPlayerNameFocused` för Register). Frigör ~70 px. Resultat: ScrollView:n får ~162 px → PlayerName-fältet syns ovanför keyboardet.
- **Guest-form scroll-to-field** (saknades — Register hade det redan): `guestScrollRef` scrollar PlayerName (första fältet) till `y:0` vid focus, Room Code (sista fältet) till `scrollToEnd()`. Se `memory/project_codekeyboard_short_screens.md`. **OBS**: TestFlight-byggen har JS inbäddad från byggtid → kräver ny build för att se fixen (testa via Expo Go / dev build för live JS).
- **Verifierat fungerande** på äldre iOS-telefon av Peter 2026-06-27 — PlayerName-fältet syns nu ovanför keyboardet i både guest- och Register-flödet.

**KAV behavior är `"padding"`, INTE `"height"`**: `behavior="height"` har en känd iOS-bugg där KAV:n ibland fastnar i shrunk-läge efter att tangentbordet stängts → sheet:en blir liten även utan keyboard. Stick to padding.

**Password scroll-to-top via `Keyboard.addListener`** (inte `onFocus + setTimeout/RAF`): RAF kör mot stale layout (KAV-padding inte applicerad än), setTimeout är opålitlig mot variation i animations-tid. `keyboardDidShow` fyrar deterministiskt EFTER att KAV-padding och keyboard-animation är klara. Lyssnaren är monterad en gång (deps `[]`) och scrollar till `regPasswordYRef.current` (sparas via `onLayout` på Password-fieldGroup) när `regPasswordFocusedRef.current === true`.

**Scroll bara EN gång per focus-session** (`didScrollRef`-guard inne i listener-effekten, resetas på `keyboardDidHide`): iOS:s autofill/QuickType-bar kan ändra keyboard-frame under typning vilket re-fyrar `keyboardDidShow`. Utan guarden skulle ScrollView:n vara i konstant `animated: true`-scroll och Confirm-knappens hit-target hoppa under användarens tap.

**`keyboardShouldPersistTaps="always"`** på register-ScrollView:n (INTE `"handled"`): edge-case där `"handled"` lät keyboard-dismiss konsumera första tappet på Confirm/Check istället för att fyra `onPress`. `"always"` garanterar att tappet alltid når handler:n.

**`automaticallyAdjustKeyboardInsets` borttaget**: den auto-justerade `contentInset` parallellt med min manuella scrollTo → de fightade och Password klipptes bort. Antingen den ELLER manuell scroll, inte båda.

**PlayerName-scroll** (custom keyboard, ingen system-keyboard-animation): använder fortfarande `requestAnimationFrame` i `onFocus` eftersom CodeKeyboard renderas direkt vid `setRegPlayerNameFocused(true)` — ingen 250ms-animation att vänta på.

## Modal reset patterns

Defensive belt-and-suspenders för att garantera färska fält när användaren öppnar formulär igen:

- **Close-side reset** (`useEffect` på `[profileMenuVisible]` med `if (!profileMenuVisible)` + 300ms timeout): rensar fält efter close-animationen. Räcker normalt men `clearTimeout` i cleanup cancellar resetten om användaren öppnar modalen igen inom 300ms (fast Cancel + Register-tryckning).
- **Open-side reset** (samma effect-deps men `if (profileMenuVisible)`): rensar direkt vid open. Garanterar färsk state oavsett om close-side hann köra. Backup om close-side blev cancellad.
- **Step-side reset** (`useEffect` på `[profileMenuStep]` med `if (profileMenuStep === 'register')`): rensar varje gång användaren navigerar in i `'register'`-steget. Fångar Back→Register-igen-fallet där modalen ALDRIG stängs (`profileMenuVisible` förblir true) men step växlar `'register' → 'menu' → 'register'`. Open-side resetet täcker INTE detta fall eftersom dess dep inte ändras.

Alla tre kör samma reset-logic. Redundansen är medveten — om ett path missar tar ett annat över.

## Profile screen

Five top-level collapsible sections — all use the same tappable-header pattern with a `+/−`-toggle box (26×26, `borderColor: borderStrong`) next to the title (`Typography.title` + bold + `Colors.textPrimary`). When collapsed, a 1px `sectionDivider` line shows under the header for visual separation. Default expanded; state per section is local (not persisted across app restarts).

1. **Profile default settings** — avatar + Player Name (read-only `Text`, set at registration, NOT editable from this screen), competition setup (Year of birth, auto Competition Age, Assistance level), Save Profile button. Innehåller bara user-defaults nu — host-defaults har lyfts ut till egen top-level sektion (#2).
2. **Host default settings** — **Multiplayer Game Mode** (Pass-the-Phone vs Individual device), Region scope + Answer response time, Game era, Number of Rounds, "Save Host settings"-knapp. Tidigare en sub-rubrik inom Profile defaults; lyftes ut 2026-05-06 till egen kollapsbar sektion för att hålla sektionerna semantiskt separerade. Players-sektion (Max 4 / Max 12) återinförd 2026-06-01 — sätter `maxPlayers` explicit (Max 12 = premium-gated). Tidigare (2026-05-25 → 2026-06-01) deriverades `maxPlayers` automatiskt från `gameMode`; se "Game Mode + Players".

   ⚠ **Single player är BORTTAGET som host-default (2026-08-26).** Läget väljs per spel via "Start New Game" på Home, aldrig i profilen — därför renderas bara två Game Mode-rutor (i BÅDE sektionen och rounds-quick-selecten), `handleSelectSingle` är raderad och `singlePlayerDefault`-STATE:n finns inte längre i ProfileScreen. `ProfileData.singlePlayerDefault` är kvar som fält (DB-kolumn + Lobby:s carry-over) men Profile skriver **alltid `false`**: load-effekten coercar `augmented.singlePlayerDefault = false` och `wasIncomplete` triggar på `data.singlePlayerDefault !== false`, så gamla profiler konvergerar passivt via den defensiva auto-saven — samma mönster som `'remote-1v1'`-coercen och legacy-gen-paket-strippningen. `handleSave` skriver dessutom `false` explicit, annars ligger ett stale `true` kvar i `loadProfile`:s cache-merge.

   ⚠ **Number of Rounds gäller ENBART Multiplayer.** `roundsMax` är `hasPremium && gameMode === 'individual-devices' ? 20 : 4`. En Single player-lobby ignorerar `roundsDefault` helt och startar alltid på 4 (host kan välja 2 i lobbyn). Noten under `RoundsRuler` (`styles.roundsScopeNote`) säger just det.
3. **Customized Host packages** — "Activate Extra package"-knapp med PREMIUM-badge (2026-07-07 — ersatte "+ Add host packages"-Store-CTAn; paket ingår i Premium, säljs ej styckvis). Gold badge + info-Alert vid Premium; grå badge + Store-upsell (`focus=subscription`) annars. Paketlistan ("Available when you are the Host:" + per-paket-toggles + "Select all" + "Save settings") renderas BARA när `hasPremium`. Driver `enabledHostPackages` i ProfileData (se "Customized Host packages" nedan).
4. **Game connections** — QuizVibe friends card. YouTube-membership-kortet plockades ut 2026-05-06 — användaren kommer tills vidare inte blanda in YouTube-konton i appen (YouTube finns kvar som content-source-toggle i Lobby:s Game Connections, men det är källflagga, inte konto-koppling). Spotify-kortet togs bort 2026-05-18 — se memory/project_spotify_dashboard.md för varför (Spotify-integration parkerad).
5. **Player history** — `src/components/PlayerHistorySection.tsx` manages its own collapse state. **Månads-grupperade entries (2026-05-25):** spel grupperas per kalender-månad (YYYY-MM-key) via `groupByMonth()`-helper. Varje månad renderas som collapsible sub-block med header `{label} · {N games} · {avgPct}% avg`. Senaste månaden default-expanded vid första load (via `didInitMonthExpansionRef`-flagga som bara fyrar EN gång — subsequent re-focuses respekterar user:s explicita toggle). Inom månad används samma `GameHistoryRow`-komponent som tidigare flat-list. HCP shield togs bort ur Player history-raderna 2026-05-18 och har INTE återinförts DÄR (HCP-systemet i övrigt är LIVE sedan 2026-08-28 — se "Dynamic HCP System" — men history-radernas sköld är en separat, ännu ej återkopplad yta).

   **HistoryEntry-shape (v5, 2026-08-26)**: utöver `correctAnswers/totalQuestions/avgResponseSeconds/age/assistance/eraFrom/eraTo` lagras `selectedExtraPackages: string[]` (tom = Generic; framtida theme-package-IDs när v1.1+) och **`sources: PlayedMediaSource[]`** — källorna som FAKTISKT serverades, i kanonisk ordning Spotify → YouTube → Hints. GameHistoryRow renderar meta-raden `Package: Generic · Sources: Spotify + YouTube + Hints`. `HISTORY_V5_RESET_KEY` wipe:ar pre-shape entries vid första load post-fix. Theme-packages + de per-källa-kategoriarrayerna överförs som URL-params från LobbyScreen:s `handleStartGame` (BÅDA host-path + non-host realtime-path) till quiz.tsx.

   ⚠ **`sources` härleds ur vad som SPELADES, aldrig ur host:s toggles.** v4 lagrade `youtubeEnabled`/`imagesEnabled` — och `imagesEnabled` var dessutom **hårdkodad `true`** i quiz.tsx sedan per-kategori-refaktorn (`f1c1f4e`, 2026-06-02, som re-deriverade YouTube-flaggan korrekt men stubbade Images under det då-sanna antagandet "Film+Sport alltid mandatory"). Följden var att VARJE history-rad som någonsin skrivits påstod "Images". Toggle-läget duger inte ens rättat: **Hints-kvoten är `floor(N/4)`**, så ett 2-3-rundors spel med Hints påslaget serverar noll Hints-frågor. Underlaget är i stället `effectiveMediaSourceByQuestion` — samma sanningskälla som prisutdelningens källkort — joinad mot `effectiveRounds[].questionNumber - 1` (INTE en blind `slice(0, totalQuestions)`: PtP-spectatorns rundor är en DELMÄNGD av matchens frågor, och `gameQuestions.length` kan överstiga `totalQuestions` via emergency-fallbacks). Fallback-stegen (lokal sekvens → toggle-läge) finns bara så raden aldrig degraderar till "None".

   ⚠ **`effectiveMediaSourceByQuestion` läses ur render-closuren** i `saveFinalGame` — den är MEDVETET ingen `useCallback`. Seen-ids-effekten sätter `seenQuestionIds` i samma commit, vilket re-memoar `gameQuestions` med en NY shuffle; closure-värdet är sekvensen som faktiskt spelades. Gör inte om det till en ref-läsning.

   **Källvokabulären bor i [mediaSource.ts](src/utils/mediaSource.ts)** (`PlayedMediaSource`, `PLAYED_MEDIA_SOURCE_ORDER`, `PLAYED_MEDIA_SOURCE_LABEL`, `collectPlayedSources`) — en ren modul utan React/RN/AsyncStorage, så den är vitest-nåbar ([backend/content/test/playedSources.test.ts](backend/content/test/playedSources.test.ts), 12 tester). `QuestionMediaType` i GetReadyIntro är numera `PlayedMediaSource | 'none'`, så det finns EN union. Lägg inte källtypen i `gameResults.ts` och importera den inte från `GetReadyIntro` — en storage-modul ska inte bero på en skärmkomponent. **`'image'` etiketteras `Hints`**, aldrig "Images" (personbilderna är parkerade; det som spelas är flagga + ledtrådar) — samma etiketter som `SOURCE_CARDS` och `mediaSourceLabel`.

**Tre oberoende Save-knappar** (en per editable sektion: Profile defaults, Host defaults, Customized packages — `'defaults' | 'host' | 'packages'`). Driver av `savedSection`-state — när en knapp trycks visar bara den knappen "✓ Saved" i 2 s, övriga står kvar i sin label. Underliggande `handleSave(section)` persisterar hela profilen i ett svep oavsett knapp (en blob i AsyncStorage); det är bara den visuella bekräftelsen som är knapp-lokal.

**Game era slider** mirrors Lobby's `MultiSlider` pattern (`ERA_MIN=1930`, `ERA_MAX=current year`, `SLIDER_WIDTH=280`, default `[1980, 2010]`). No player-clamping on Profile — it's host-default setup with no players in context. Persisted as `gameEraFrom`/`gameEraTo` on `ProfileData`. Loadning clampar from/to till nuvarande range eftersom äldre profiler (när ERA_MIN var 1900) kan ha sparat värden < 1930 — utan clamp:n skulle rutan ovan visa t.ex. "1925" medan thumben sitter låst på 1930.

**Game era — shared spec mellan Profile och Lobby** (host-vyn):
- Titel: "Game Era (min 10 year interval)" (Lobby + Profile, identisk text — ikon-prefixet `🕐` togs bort 2026-05-20 tillsammans med `🎯 Number of Rounds` och `⏱️ Answer response time` så Quiz settings-blockets rubriker är clean typography).
- Year-range-ruta: gul-glödande `eraGuestBox` (border `#F5A623` = `Colors.warning`, bg `rgba(26,48,80,0.92)`) — visar `{from} – {to}` i samma stil som in-game year-selector i `app/quiz.tsx`. Profile har en privat copy av styles (`eraGuestBoxWrap` / `eraGuestBox` / `eraGuestBoxText`) som speglar Lobby-versionen 1:1.
- Slider-linje: tunn 6 px hög ruta (`trackStyle.height: 6`) som extends/shrinks i bredd. `selectedStyle` = guld-fylld glödande pill (`backgroundColor: Colors.warning`, `shadowColor: Colors.warning`, `shadowOpacity: 0.85`, `shadowRadius: 8`, `elevation: 4`, `borderRadius: 3`). Ingen border (gold-on-gold = onödig). `unselectedStyle.backgroundColor: Colors.border` ger subtil grå bakgrunds-track så slider-räckvidden syns.
- **Custom markers** ([src/components/EraSliderMarker.tsx](src/components/EraSliderMarker.tsx), delas av Lobby + Profile): `customMarkerLeft={EraMarkerMinus}` + `customMarkerRight={EraMarkerPlus}` (kräver `isMarkersSeparated`) renderar 24×24 solid-guld cirklar med "−" / "+"-glyph (Colors.background-färg, fontSize 18, weight 900) — växer till 28×28 vid drag. `markerOffsetY={3}` är **kritiskt** — utan det lägger MultiSlider thumben med center vid fullTrack-top istället för track-centerline (= track-höjd / 2 = 3 på en 6 px-track). Tidigare hidden-marker-mönster (`customMarker={() => null}`) testades men användarna hittade inte drag-zonerna och slidern kändes "fastnad" — synliga thumbs är nödvändiga för att förmedla extend/shrink-affordance.
- **SLIDER_INSET** (12 px på vardera sida): `SLIDER_WIDTH = 280` är viewport-bredden men `sliderLength = SLIDER_INNER_WIDTH = 256` skickas till MultiSlider. DecadeMarks räknar in samma offset i varje labels position (`position = SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH`). Detta håller thumb-cirklarna (radie 12) inom slider-trackens kanter vid extremerna istället för att sticka ut förbi. `ERA_MIN_INTERVAL_PX` räknas från `SLIDER_INNER_WIDTH`, inte `SLIDER_WIDTH`.
- 10-år-minimum: `ERA_MIN_INTERVAL = 10` (år), `ERA_MIN_INTERVAL_PX = Math.ceil((10 / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH)` skickas som `minMarkerOverlapDistance` till MultiSlider (lib:n håller markörerna isär i pixel). Defensiv guard i `onValuesChange`: `if (vals[1] - vals[0] < ERA_MIN_INTERVAL) return;` — släpper inte igenom state-updates som bryter regeln.
- **Haptik per år-tick**: `Haptics.selectionAsync()` (expo-haptics) anropas i `onValuesChange` efter interval-guarden. Ger Apple:s picker-tick-feel på iOS (UIPickerView-haptic) och `KEYBOARD_TAP`-feedback på Android (haptik + OS-klickljud). Step=1 ⇒ exakt en haptic per år-ändring; lib:n fyrar bara onValuesChange vid faktisk värde-ändring så ingen manuell throttling behövs. Audio-klick på iOS kräver `expo-audio` + sound-asset (parkerad — inte installerad). `expo-speech` är däremot installerad (v14.0.8) och används för röst-nedräkning i CountdownIntro. `react-native-webview` (redan installerad) används för ambient-ljudet i LobbyScreen + GetReady via Web Audio API — se `src/components/MorseAmbientSound.tsx`.
- **DecadeMarks-axeln**: labels positionerade på **faktiska års-värden**, INTE jämnt fördelade — `position = SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH` per label. Det gör att thumben landar exakt på sin label (eftersom slidern mappar ERA_MIN..ERA_MAX linjärt). Tidigare jämn-fördelning gav 1–5 års offset mellan thumb och label vilket Peter explicit avvisade. Aktuella labels: `['<1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020']` — 10 st total, leftmost är symboliskt (`<1930` på position 0 = år 1930), rightmost-tick är 2020. Slidern går fortsatt till `ERA_MAX` (current year, dynamisk) men ingen tick-label där — `eraGuestBox` ovan visar exakt valt år ändå. Tick-linjen är 14 px hög med `marginTop: -10` så den pokar 10 px upp i slider-zonen och visuellt skär track:en. Label-text i `60×20`-container roterad 90° (= 20 wide × 60 tall efter rotation) med fontSize 16.
- Lobby har dessutom `clampEraToPlayer`-warning ovanpå (gulvarning om youngest player är född efter `to`); Profile har inget motsvarande eftersom inga spelare finns i kontext. Lobby:s clamp använder redan `toYear - 10` som adjustedFrom så det aligned:ar mot 10-års-minimum.
- Profile:s `loadProfile`-effect clampar `gameEraFrom`/`gameEraTo` till nuvarande range (`Math.max(ERA_MIN, ...)` / `Math.min(ERA_MAX, ...)`) så äldre profiler från tiden då ERA_MIN var 1900 inte hamnar i ett tillstånd där rutan visar t.ex. "1925" medan thumben sitter låst på 1930.

**Answer response time** (`answerResponseSeconds: 30 | 45 | 60`, default 30) = how long players have to answer a question. Distinct from how long question media (song/video/image) plays. Minimum is 30s (15s option removed 2026-06-08); type `LobbyAnswerResponse` in `mockLobbySettings.ts`, `AnswerResponseSeconds` in `GetReadyIntro.tsx`, and `ResponseSecondsChangedPayload.seconds` in `syncChannel.ts` all reflect this.

**TopUserBanner pill on Profile** opens a logout sheet via `logoutModalVisible` state — mirrors Home's `profileMenu` for the logged-in case (header with avatar emoji + Player Name + green "Logged in" status + Create Game + Join Game + Store + Log out + **Delete Account** + Cancel). After logout: `clearProfile()` + analytics + `router.replace('/')` to Home.

**Delete Account-flöde** (Apple App Store Guideline 5.1.1(v) — kräver in-app account deletion för apps med kontoflow):
- **UI** ([ProfileScreen.tsx](src/screens/ProfileScreen.tsx) `logoutSheet`): röd outline-knapp under "Log out", separat från Log out så användaren inte triggar deletion av misstag. Tunnare/mindre visuell vikt (`deleteAccountBtn` height 44 + transparent bg + 1.5px `Colors.error` outline) än Log out (52 + soft red bg) för att signalera "rare, dangerous action".
- **Two-step confirmation**: `handleRequestDeleteAccount` visar Alert med tydlig copy om irreversibilitet. Apple-review tittar specifikt efter att flödet inte är "oavsiktligt destruktivt".
- **Loading state**: `deletingAccount`-state dimmer knappen och blockar dubbel-tap. Log out + Cancel + Delete Account får alla `disabled={deletingAccount}` så user inte kan kombinera actions under deletion-flowen.
- **Server-side cleanup via Edge Function** ([supabase/functions/delete-account/index.ts](supabase/functions/delete-account/index.ts)):
  1. Validerar JWT via `admin.auth.getUser(token)`.
  2. Blockar `is_anonymous: true`-users (guests har inget konto att radera).
  3. Anropar `admin.auth.admin.deleteUser(user_id)` med service-role-key.
  4. Postgres-CASCADE rensar resten automatiskt: `profiles` (FK `profiles.id → auth.users(id) ON DELETE CASCADE`), `rooms` där user var host (FK `rooms.host_user_id → CASCADE`), `waiting_invites` till/från user (FK `to_user_id → CASCADE`). `lobby_players.user_id → NULL` (SET NULL — raderna lever kvar anonymiserade tills rooms-CASCADE eller 24h-expiry tar dem).
  5. **Verify JWT with legacy secret-toggle i Dashboard MÅSTE vara AV** — samma config som anon-signup. Med moderna `sb_publishable_*`-keys (vad vi använder i `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) avvisar gateway:n requests med `UNAUTHORIZED_INVALID_JWT_FORMAT` när toggle:n är PÅ — publishable-keys är inte legacy-secret-signed. Vår function har egen JWT-validation via `admin.auth.getUser(token)` så gateway-level validation behövs inte. Supabase's egen rekommendation: "OFF with JWT and custom auth logic in your function code".
- **Client helper** `deleteAccount()` i [src/utils/auth.ts](src/utils/auth.ts):
  1. Anropar Edge Function.
  2. Vid success: nuke:ar ALL lokal AsyncStorage under `@quizvibe/*`-prefixet (profile-cache, friends, waiting-invites-cache, gameHistory, etc.).
  3. `supabase.auth.signOut()` rensar session-token.
  4. Returnerar `{ ok: true }` eller `{ ok: false, reason }`.
- **Order matters**: lokal storage rensas BARA om server-deletion lyckades — annars hamnar vi i inconsistent state där lokala data är borta men user:n fortfarande finns i Supabase. Felflödet visar Alert "Could not delete account ({reason})" och låter user försöka igen (deletion är idempotent server-side eftersom CASCADE bara körs om user faktiskt fanns).
- **Analytics**: `track('user_account_deleted')` + `resetIdentity()` efter success, före `router.replace('/')`.
- **Privacy Policy + ToS** (docs/legal/{privacy,terms}.md) uppdaterade 2026-05-23 för att hänvisa till in-app deletion istället för email-only — email-only räcker inte enligt Apple-review.

**"Profile settings" från Home:s TopUserBanner** (logged-in profil-meny): blå-konturad `secondaryBtn` ovanför röda "Log out"-knappen. Tap stänger menyn och `router.push({ pathname: '/profile', params: { scrollToTop: '1' } })`. Profile-skärmen läser `scrollToTop` via `useLocalSearchParams` och anropar `scrollRef.current?.scrollTo({ y: 0, animated: false })` i en `useFocusEffect` med deps `[localParams.scrollToTop]`, sedan `router.setParams({ scrollToTop: undefined })` för att rensa paramen — annars skulle framtida besök utan param också (felaktigt) snäppa till toppen.

**Store-knappar i user-login-modaler** (logged-in läget):
- **Home `profileMenu`** — `Profile settings` (med leading `<QuizVibeQAvatar size={26} />`) och `Store` (med leading `<ShoppingCartIcon size={22} />`). Båda i `secondaryBtn`-stil. Innehållet wrappas i `secondaryBtnInner` (`flexDirection: 'row'` + `gap: Spacing.sm`); knappens egen `alignItems/justifyContent: 'center'` centrerar wrapper:n så ikon + text grupperas centrerat.
- **Profile `logoutSheet`** — bara `Store` (med leading `<ShoppingCartIcon size={22} />`) ovanför Log out. Egen `logoutStoreBtn`/`logoutStoreBtnInner`-stilar speglar Home:s `secondaryBtn` (blå-konturad, höjd 52, `Colors.cardElevated` bg).
- **Båda** kör `router.push('/store?from=/<source>')` utan focus-param → default-ordning (Basic → Credits → Packages → Subscriptions). `from`-paramet säkrar att Store:s ← Back tar tillbaka till exakt rätt ursprungstab (Profile från Profile, Home från Home).

**Friends modal (Profile)** — KeyboardAvoidingView wrap:ar `friendsModal.overlay` med `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` så input-fältet "Add by Player Name" inte täcks av tangentbordet. Android sköter det via systemet automatiskt. Speglar samma KAV-mönster som Register modal — sheet:en pushas uppåt vid keyboard-show.

**`mergeProfileIntoHost`-fallbacks**: när host:s profil saknar `birthYear` eller `assistance` används fallbacks så host-spelarkortet i Lobby alltid har komplett HCP (annars blockas Start Game). `birthYear` saknas → `randomBirthYear()` ger random år 1970–2005 (vuxen 21–56); `assistance` saknas → `'standard'`. `hcpComplete`/`isReady` är alltid `true` på host:s kort eftersom host startar aldrig spelblockerad. En Profile-sida (`randomAdultBirthYear()`) gör motsvarande för Profile:s state-load — defensive auto-save kör om något fält saknas, så slumpvärden inte regenereras vid varje reload.

**Profile auto-augment** i `loadProfile`-effekten: alla saknade fält fylls i med generic-fallback-spec (Pass-the-Phone, Max 4, Global, 1981→`ERA_MAX` (= current year), `ROUNDS_DEFAULT`, 30 sek, Standard assistance, alla paket aktiverade, `randomAdultBirthYear`-värde). Augmented-profilen beräknas EN gång per load så samma random-värde används för både setState och eventuell write-back. Om något fält var saknat persisteras augmented direkt via `saveProfile` i bakgrunden — one-shot defensive write så fallbacks inte regenereras nästa load (särskilt random birthYear).

## Game Mode + Players (Profile + Lobby)

**⚠ UPPDATERAD 2026-08-26 (rev 5): lobbytypen LÅSES av Home-valet, och Game Mode-raden är därmed MULTIPLAYER-ONLY — två rutor (Pass-the-Phone / Individual device) under EN "MULTIPLAYER"-klammer (`flex:1`, spänner hela raden).** Single player-rutan och "SINGLE MODE"-klammern är BORTTAGNA från alla fyra call-sites (Lobbyns Game Mode-sektion + dess quick-select under RoundsRuler, samt motsvarande två i Profile:s host-defaults). Alla tre lobbytyper väljs numera på Home via `HostTypeOptions` ("Start New Game" → "Single Game" / "Multiplayer Game" / "Remote Play") och kan INTE bytas inne i lobbyn — se "Lobbytypen är LÅST av Home-valet" nedan. Remote Play kräver ett QuizVibe-konto — se sektionen "Remote 1v1" nedan.

⚠ **Flex-talen på bracket-raden MÅSTE spegla antalet rutor ovanför.** Det är just den kopplingen som gick sönder när Remote lades till (rev 3) och togs bort (rev 4). Efter rev 5 är det EN kolumn på `flex:1` över TVÅ rutor — lägg aldrig tillbaka en `flex:2` utan att räkna rutorna.

Historik: rev 4 (2026-08-12) hade tre rutor på en rad med "SINGLE MODE" (flex:1) + "MULTIPLAYER" (flex:2); rev 3 (2026-08-07) splittade i två rader när Remote låg som fjärde ruta. Beskrivningen nedan (2026-06-01) gäller i övrigt oförändrat för PtP/IndDev.

**OMARBETAD 2026-06-01.** Game Mode-sektionen är nu **tre fria val-rutor** (inte checkbox + 2 rutor) på en rad + en separat **Players**-sektion. Layouten är identisk i Lobby (per-spel, host editerar / non-host read-only via `disabled`) och Profile (host-default). Render-helper `renderModeBox(key, label)` i båda filerna; styles `gameModeGroupLabel` (grå grupprubrik), `modeRow` (transparent flex-row, ingen segment-container), `modeOption` (fristående bordered box, **fast höjd 38** = samma som Generic/`addPackageBtn`). Tidigare `modeToggle`-container + `singlePlayerRow`/`singlePlayerCheckbox`/`multiplayerBracket*`-styles lämnade som död kod.

Struktur (per skiss, rev 5):
- EN `modeRow` med två likbreda rutor: **Pass-the-Phone** · **Individual device**.
- Bracket-rad direkt under (`multiplayerBracket` + `multiplayerBracketLabel` + info-ikon): **"MULTIPLAYER"** i en `flex:1`-kolumn som spänner över båda rutorna.
- Grupprubrik **"Players"** → **Max 4 players** (FREE-badge) + **Max 12 players** (PREMIUM-badge). Renderas ENBART i multiplayer-lobbyn (single och 1v1 har inget spelartak att välja).

**Båda game-mode-lägena är GRATIS** (ingen premium-gate på lägesvalet — IndDev avkopplad från Premium 2026-06-01). Varje game-mode-ruta har en FREE-badge: grön när aktiv (`modeOptionPassActive` = grön kant + `primaryMuted` bg, `freeBadge` grön), grå när inaktiv (`modeOptionInactive` + `freeBadgeDimmed`).

**Lobbytypen är LÅST av Home-valet (rev 5, 2026-08-26 — ersätter "paramet är ett förval").** `HostTypeOptions`-utfällningen (Home + Final Leaderboard) skickar `lobbyType: 'single' | 'multiplayer' | '1v1'` som URL-param till `/lobby`, och ALLA TRE låser nu lobbyn för dess livstid. Tidigare låste bara `'1v1'`; `'single'`/`'multiplayer'` var förval som host kunde byta bort inne i lobbyn, vilket gjorde Home-valet meningslöst.

LobbyScreen:s `resolveSeedSinglePlayer(lobbyType, fallback)` ger prio **param > carry-over `lobby_settings` > false** och används i BÅDA seed-grenarna (guest-host + registrerad host). Den är MEDVETET module-level och ren, så den aldrig blir en dependency i seed-effekten — `lobbyType` ligger redan i dess dep-array och är allt funktionen läser.
- `'single'` → `singlePlayerDefault = true`. `'multiplayer'` → `false`. `'1v1'` → `false` (alla remote-guards kräver det). Ingen param (äldre navigation) → fallback:en oförändrat.
- ⚠ **Profilen ingår INTE i fallback-kedjan** sedan rev 5 — Single player är inte längre en host-default, så ett stale `profile.singlePlayerDefault === true` får inte låsa en Multiplayer-lobby. ProfileScreen coercar dessutom fältet till `false` vid load + save.
- **`gameMode` rörs inte av `'multiplayer'`** — vilket MULTIPLAYER-läge som förvaljs kommer fortsatt ur kedjan `stored > profile.spotifyDefaultEnabled → IndDev > profile.gameMode > 'pass-the-phone'` (Peters beslut 2026-08-24: Multiplayer-raden ska garantera multiplayer, inte överrida hostens sparade läge). En host med IndDev som host-default landar alltså i IndDev.
- ⚠ **`'single'` FORCERAR däremot `gameMode = 'pass-the-phone'`** under huven (rev 5). Solo behöver inget IndDev-maskineri — det skulle öppna en onödig `quiz_sync`-kanal och göra maxPlayers-effekten skev. `seedSinglePlayer` resolveras därför FÖRE `seedGameMode` i båda grenarna.
- ⚠ Registrerade grenens rounds-clamp MÅSTE läsa samma resolverade `seedSinglePlayer` — den räknade tidigare fram sitt eget värde ur `stored > profile`, vilket hade cappat en "Single Game"-lobby mot fel läge.
- **En fresh Single-lobby seedar ALLTID 4 rundor** (`stored?.roundsCount ?? ROUNDS_DEFAULT`, utan `profile.roundsDefault`) — Peter 2026-08-26. Profilens Number of Rounds gäller enbart Multiplayer. Carry-over vid Replay vinner fortfarande.

**UI-gatingen går genom `isSingleLobby` — `resolveSeedSinglePlayer(lobbyType, singlePlayerDefault)`**, dvs. SAMMA resolver som seed-effekten, fast med live state som fallback. Värdet är därför per konstruktion identiskt med det seeden räknar fram. Host har alltid paramet → synkront rätt redan första framen; non-host har det aldrig → faller på state:n som settings-syncen sätter (samma mönster som remote-1v1:s gating på `gameMode`-state). Deklareras direkt vid state:n så även effekter ovanför render (dep-arrayer evalueras under render) kan läsa den utan TDZ. `singlePlayerDefault` är hädanefter **immutabel per lobby** — det finns ingen setter kvar utom seeden, och state:n seedas dessutom synkront (`useState(() => lobbyType === 'single')`).

⚠ **Läs paramet, inte bara state:n — annars flimrar låset (Peter 2026-08-26).** Seed-effekten är async (`getLobbySettings`/`loadProfile`), så med enbart `singlePlayerDefault` som källa renderades multiplayer-vyn i ~1 s innan låset slog till: Players in Lobby visade 4 kapacitetsrutor som kollapsade till 1, och Game Mode hann visa PtP/IndDev-rutorna. Paramet täcker dessutom fallet där Stack-navigatorn ÅTERANVÄNDER component-instansen över en `router.replace` — då kör `useState`-initialiseraren inte om och state bär förra lobbyns värde tills seeden landar. Syntes tydligast vid Replay från Final Leaderboard efter ett solospel.

| lobbyType | Game Mode-sektionen | Players-sektionen | "+ Add Guest" | Kapacitetsmätaren | Number of Rounds | Spotify |
|---|---|---|---|---|---|---|
| `'single'` | statisk "Single player — 1 player" | döljs | döljs | **1 ruta**, ingen "max"-stack | 2/4-rutor (som guest host), not "Max 4 rounds in Single player mode" | göms helt |

**Allt turordnings-UI döljs också i single-lobbyn.** Både hinten ("Turn order — top plays first…") och `PlayerRow`:s turnummer-badge gatas på `gameMode === 'pass-the-phone'` — och eftersom single kör PtP under huven räcker den checken inte, `!isSingleLobby` krävs på båda. Att utelämna `turnNumber` tar bort HELA turkolumnen: badgen, ↑↓-pilarna och den vänstra inramningen renderas alla under `turnNumber !== undefined` i [PlayerRow.tsx](src/components/PlayerRow.tsx), så det blir inga kvarglömda utgråade pilar. Regeln: **varje `gameMode === 'pass-the-phone'`-gate i lobbyn är egentligen "PtP-MULTIPLAYER"** — lägg till `!isSingleLobby` om blocket handlar om flera spelare.
| `'multiplayer'` | PtP + IndDev | visas | PtP-only som förr | 4/12 rutor | stepper + RoundsRuler + quick-select | kort synligt, pill säger om DJ stöds |
| `'1v1'` | statisk "Remote play — 1vs1" | döljs | döljs | 2 rutor | 2/4 cap, ingen premium-bracket | göms helt |

⚠ **Single player och 1v1 döljer Spotify på BÅDA ställena** (Peter 2026-08-26): Spotify-kortet i SOURCE MIXERBOARD (inkl. attest-raden) **och** `PlayerRow`:s Spotify-badge (`showSpotifyBadge={gameMode !== 'remote-1v1' && !isSingleLobby}`). Skälet är att båda lobbytyperna är LÅSTA — läget kan aldrig bytas till ett där Spotify DJ blir tillämpligt (DJ kräver minst en motspelare, se `handleStartGame`:s DJ-guard). I en multiplayer-lobby visas kortet alltid, eftersom host fritt kan växla PtP ⇄ IndDev; availability-pillen bär då informationen (IndDev = grön "Enabled", PtP = grå "Disabled" + utgråad toggle). **`spotifyEnabled` forceras dessutom `false` på ALLA FYRA seed-sites** — annars kunde ett carry-over- eller profil-värde smyga in i en lobby där kontrollen är osynlig och sedan blockera Start Game med "Spotify DJ not applicable". Den fjärde (attest-callbacken i focus-effekten) har inte `seedSinglePlayer` i scope och läser i stället `lobbySt?.singlePlayerDefault ?? lobbyType === 'single'`.

Vill host byta läge: **radera lobbyn och välj på nytt via Start New Game** (Peters beslut 2026-08-26). Indikatorn är helt statisk — inget tap, ingen Alert, ingen genväg. `maxPlayers` sätts till 4 i single-lobbyn (DB-CHECK tillåter bara 2/4/12) och taket 1 är rent visuellt via `capacity`-härledningen i mätaren.

**State-mappning** (oförändrad datamodell — `gameMode: 'pass-the-phone' | 'individual-devices'` + `singlePlayerDefault: boolean`): Single player = `singlePlayerDefault=true` (alltid ovanpå PtP sedan rev 5); Pass-the-Phone = `!singlePlayerDefault && gameMode==='pass-the-phone'`; Individual device = `!singlePlayerDefault && gameMode==='individual-devices'`. ⚠ **`handleSelectSingle()` är BORTTAGEN i BÅDA filerna** (rev 5) — ingen väg kan längre anropa den, och `renderModeBox`:s key-union har tappat `'single'`. Kvar: `handleSelectMode(mode)` (Lobby, clearar singlePlayerDefault; vid IndDev körs `confirmAndRemoveGuests` först) och `handleSelectGameMode(mode)` (Profile).

**Djupförsvaret mot approve i single-läge är ORÖRT** och ska förbli det: `handleSetApproved` Check 0, `handleApproveAll` Check 0, friend-auto-approve-guarden, `handleStartGame`:s `turnOrder`-filter (`!singlePlayerDefault || p.isHost`) och `checkSinglePlayerLobby` i [app/index.tsx](app/index.tsx). Låsningen gör dem osannolika att trigga, men de bär fortfarande de fall där en spelare hann in innan låset.

**Individual device blockerar ENDAST host-tillagda guests** (policy-ändring 2026-08-06, ersätter 2026-06-01-regeln som blockade alla guests) — rationale: host-tillagda guests saknar egen enhet (ingen mobil kan visa frågor/skicka svar), medan självanslutna guests HAR egen enhet + anon-session och får spela IndDev + attesta Spotify. Distinktion via `LobbyPlayer.addedByHost` (survives DB-roundtrip: `rowToPlayer` rekonstruerar som `type === 'guest' && user_id === null`). Enforced på 3 ställen: (a) byte till IndDev → `confirmAndRemoveGuests` tar bort BARA `addedByHost`-spelare (markEjected + DB-DELETE); (b) "+ Add Player" blockeras i IndDev ("Own device required"-Alert); (c) `handleStartGame`-guard blockerar start om någon approved `addedByHost`-spelare finns i IndDev. Home `handleJoinAsGuest`:s IndDev-block är BORTTAGET — guests joinar IndDev-lobbies fritt. Spotify-attest-UI:t i Lobby-raden visas för alla inkl. självanslutna guests (attest persisteras bara till profil för registrerade — guests är lobby-lokala via `spotify_verified`).

⚠ **Taket härleds ur läge + premium — `resolveMaxPlayers(gameMode, singlePlayer, premium)` (2026-08-26).** Module-level och ren, delas av seed-effekten och auto-sync-effekten så de aldrig sätter olika värden en frame isär:

| Läge | Tak |
|---|---|
| Pass-the-Phone | **ALLTID 4, även med Premium** |
| Individual device | 12 med Premium, annars 4 |
| Remote 1v1 | 2 |
| Single player | 4 (lägsta giltiga; DB-CHECK tillåter bara 2/4/12 — mätaren visar ändå EN ruta) |

PtP-cappen stod i auto-sync-effektens kommentar men fanns **aldrig** i koden: den satte `hasPremium ? 12 : 4` utan lägeskoll, så en premium-host fick 12 kapacitetsrutor i en PtP-lobby (Peter 2026-08-26). Seeden läste dessutom `profile.maxPlayers`, vilket kunde släppa in ett stale 12 en frame innan effekten rättade det. Båda går nu genom resolvern.

Följd: **Players-toggeln är i praktiken bara meningsfull i IndDev** — i PtP/Single/1v1 är taket låst av läget, och i IndDev + Premium låser 12 (Max 4 utgråas). `handleSelectMaxPlayers(n)` behålls som spärr + förklaring och har **tre-grenad logik** (ordning är kritisk):
1. **Mode-check** (Max 12 i PtP/Single): Alert "Individual device required — Please activate Individual device to be able to select Max 12 players." Ingen state-ändring. Mode måste bytas till IndDev först.
2. **Premium-check** (Max 12 i IndDev utan premium): Alert "Premium feature" + Store-deeplink (`/store?focus=subscription`). Ingen state-ändring.
3. **Applicera** (Max 12 i IndDev med premium, eller Max 4 alltid): `setMaxPlayers(n)`.

**Mode-switch-konsekvenser för maxPlayers**:
- **IndDev → PtP**: `setMaxPlayers(4)` alltid. Om > 3 godkända non-hosts i lobbyn visas Alert "Change to Pass-the-Phone / Change from Individual Devices will remove all players from lobby. Do you want to continue?" — Continue ejectar ALLA non-hosts (`markEjected` + Supabase DELETE), sedan `setPlayers(prev => prev.filter(p => p.isHost))`.
- **PtP → IndDev** (premium host): `setMaxPlayers(12)` automatiskt inuti `confirmAndRemoveGuests`-callbacken. Återställer vad PtP-bytet satte till 4.
- Båda handler-anropen är numera redundanta mot auto-sync-effekten (resolvern ger samma svar), men behålls: de kör **synkront** och undviker en frame med det gamla taket.
- Max 4-rutans **aktiv-villkor**: `maxPlayers === 4` (oberoende av premium-status). **Disabled** enbart för premium host i IndDev: `!hostMode || (hasPremium && gameMode === 'individual-devices' && !singlePlayerDefault)`.

Max 4-rutan har FREE-badge (grön aktiv), Max 12-rutan PREMIUM-badge (`premiumBadge` guld med subscription / `premiumBadgeGrey` grå utan). `maxPlayers` styr lobby-cappen + hur många host kan godkänna i "Players in lobby".

Persisteras som `singlePlayerDefault?: boolean` + `maxPlayers` på `ProfileData`. Lobby seeds från profil/stored i host-mount-effekten.

## Remote 1v1 (`'remote-1v1'`) — asynkron duell (2026-08-07)

**Fjärde spelläget**: exakt 2 spelare (host + 1 motståndare) svarar på SAMMA frågesekvens oberoende av varandra, på egna enheter, inom **48h** från matchstart. Ingen realtime-sync under spel (all syncChannel-logik är IndDev-gated och triggar aldrig). Ljud spelas LOKALT på varje enhet (audio-gates i quiz.tsx grindas enbart på `isAudioMutedForSelf`) — se "Remote-audio" nedan. Inga Spotify-frågor. Max 4 rundor (PtP-cap). Credits dras som övriga host-lägen. **Spelas ENBART mellan två QuizVibe-users** — det finns ingen guest-variant av läget; se "Remote 1v1 är QuizVibe-users-only" nedan.

**Remote-audio — PÅ som default på BÅDA enheterna, ägs lokalt (2026-08-09)**: remote har ingen live-sync under spel, så IndDev:s host-styrda per-spelare-`playerAudioOverrides` gäller INTE här — varje enhet äger sitt eget ljud. `isAudioMutedForSelf` (quiz.tsx) returnerar i remote `!remoteAudioOn`, ett session-lokalt state som defaultar till `true` (inte persisterat).

**`isAudioMutedForSelf` är ENDA ljudgrinden — lägg aldrig till ett `isHost`-villkor ovanpå (2026-08-14).** Alla fyra ljudkällor (`MorseAmbientSound`, `HeartbeatSound`, `CountdownIntro`:s `silent`, `MediaPlayer`:s `isMuted`) grindas nu enbart på den memon, som redan kodar hela policyn per läge: PtP alltid på, remote `!remoteAudioOn`, IndDev override-mappen med `!isHost` som fallback. Tre av dem bar tidigare ett extra `(isHost || gameMode === 'remote-1v1')`-villkor, vilket gjorde att en IndDev-non-host med ljud PÅ ändå bara hörde YouTube-klippet — ingen ambient, inget hjärtslag, tyst nedräkning. Den asymmetrin är borta.
- ⚠ **`MediaPlayer` MÅSTE få `isMuted={isAudioMutedForSelf}`, aldrig `isMuted={!isHost}`.** Commit `305e5b3` bytte till `!isHost` och gjorde motståndarens YouTube-klipp TYSTA i remote (och dödade samtidigt IndDev:s D-iv-override — host kunde slå på ljud för en spelare utan att något hände). Återställt 2026-08-09. `!isHost` är fel signal: i remote spelar båda solo, i PtP delas enheten, och i IndDev är det overrides-mappen som bestämmer.
**"Audio this device" — EN direkt toggle per enhet, alla lägen (Peter 2026-08-14).** Raden bor i GetReadyIntro:s utfällbara **Game settings**-block och visar `On/Off` + 🔊/🔇. **Ingen modal någonstans** — det finns bara EN spelare per enhet att styra, så ett tap räcker. Etiketten säger uttryckligen *this device* eftersom ingen enhet kan styra någon annans ljud.
- **Renderas för**: IndDev host, IndDev non-host och BÅDA spelarna i remote 1v1. **PtP får ingen rad** (delad enhet, inget att styra). Gaten är `showAudioRow = !!hostAudioRowId || !!onSelfAudioChange`, dvs. **callbackens närvaro avgör — inte en `mode`-check i komponenten**.
- **Två skrivvägar, ömsesidigt uteslutande** så en enhet aldrig renderar två rader:
  - **IndDev host** (`hostAudioRowId = isIndDev && isHost && onPlayerAudioChange ? hostPlayerId : undefined`) → `onPlayerAudioChange(hostPlayerId, …)`. Behåller persist till `lobby_settings` + broadcast, så host:s val överlever Play Again-carry-over.
  - **Remote 1v1 + IndDev non-host** → `onSelfAudioChange` → `handleSelfAudioChange` i quiz.tsx. Remote skriver `remoteAudioOn`; IndDev non-host skriver sitt eget `selfPlayerId` i den LOKALA `playerAudioOverrides`-mappen. **Medvetet ingen persist** (`lobby_settings` är RLS-gated till host) och **ingen broadcast** — valet är device-local. quiz.tsx skickar callbacken när `gameMode === 'remote-1v1' || (gameMode === 'individual-devices' && !isHost && !!selfPlayerId)`; utan `selfPlayerId` döljs raden hellre än att bli ett dött tap-mål.
- **Värdet** är `selfAudioOn={!isAudioMutedForSelf}` (host-vägen läser `hostAudioOn` ur overrides-mappen), så raden alltid speglar det som faktiskt spelas.
- **Verifierat i IndDev-spel på två enheter av Peter 2026-08-14** — non-host tyst som default, slår på sitt eget ljud och hör då ALLA fyra källorna (ambient, hjärtslag, talad nedräkning, klipp); host:s direkt-toggle fungerar och enheterna påverkar inte varandra.
- **IndDev-defaults: host PÅ, non-host AV** — faller redan ur `isAudioMutedForSelf`:s `return !isHost`-fallback; ingen separat default-logik finns. ⚠ Mount-fetchen av overrides-mappen ersätter HELA mappen, så `selfAudioTouchedRef` skyddar ett val som hunnit göras innan fetchen resolvat.
- ⚠ **Per-spelare-styrning finns inte i UI:t.** Den gamla audio-modalen (host-only, lista med Switch per spelare) filtrerade i praktiken listan till hostens EGEN rad och togs bort 2026-08-14 tillsammans med `allPlayers`-propen. Broadcast- och persist-plumbingen (`player_audio_state_changed`, `lobby_settings.player_audio_overrides`, migration 0007) lever kvar och används av host-vägen ovan, men **ingen väg låter en enhet styra en annans ljud** — bygg inte en utan produktbeslut.
- ⚠ **Host kan INTE styra motståndarens ljud — medvetet parkerat (Peter 2026-08-09).** Hostens enhet spelar bara hostens egen session, så "per spelare"-kontroll skulle betyda att hosten når den ANDRA enheten — vilket remote saknar väg för (async, upp till 48h isär). Det kräver persistens i match-snapshotten: ny migration (`audio_on` på `remote_match_players` + param i `create_remote_match`), alternativt en ny SECURITY DEFINER-RPC + realtime-plumbing för live-ändring. Bygg det INTE utan nytt produktbeslut; IndDev:s per-spelare-modell går inte att kopiera rakt av hit.

**Renodlad 1vs1-lobby + Home-lobbytyp-val (2026-08-07 rev 3 — ERSÄTTER Game Mode-ruta-vägen)**: 1vs1 väljs numera PÅ HOME — båda "Start New Game"-knapparna (den gyllene för inloggad + den grå guest-varianten) fäller ut **`HostTypeOptions`** ([src/components/HostTypeOptions.tsx](src/components/HostTypeOptions.tsx) — flyttad ur app/index.tsx 2026-08-08 när Final Leaderboard fick samma utfällning; `HostLobbyType` + `HereNowIcon` bor där också) — en INLINE-panel under knappen, inte en modal — med raderna **"Single Game" / "Play solo on this device"**, **"Multiplayer Game" / "Pass-the-Phone or Individual devices"** och **"Remote Play" / "1vs1 — challenge friends remotely"** (två-radsversionen med en enda "Local Play"-rad ersattes 2026-08-24). 1v1-valet skickar `lobbyType: '1v1'`-param till `/lobby` (registrerad: `handleCreateGame(lobbyType)`; guest: `guestLobbyType`-state → `JoinModal.guestHostLobbyType`-prop → `handleStartGameAsGuestHost`). LobbyScreen: `is1v1Lobby = lobbyType === '1v1'` forcerar seeden (`gameMode='remote-1v1'`, `singlePlayerDefault=false`, `maxPlayers=2`, `spotifyEnabled=false` — även focus-effektens Spotify-seed är 1v1-gated). **Renodlad lobby-vy** (gating på `gameMode === 'remote-1v1'`-STATE så non-host via settings-syncen ser samma): Game Mode+Players-sektionen ersätts av statisk grön **"1vs1 Match — 2 players"**-indikator, Spotify-blocket i SOURCE MIXERBOARD göms helt (inkl. attest-raden), game-mode quick-select under RoundsRuler göms, rounds-stepperns Premium-upsell/badge/klammer göms (remote är hårt cappad på 4 — `handleIncrementRounds` visar ärliga "More rounds not available"). **Remote-rutan är BORTTAGEN** ur vanliga lobbyns Game Mode-val (rad 2 = PtP + IndDev; två-radslayouten kvar) och ur Profile:s host-defaults (båda ställena) — stale sparad `'remote-1v1'`-default **coercas till `'pass-the-phone'`** vid Profile-load (inkl. snapshot-spegeln) och i båda lobby-seed-grenarna. `handleSelectMode`:s remote-gren är dokumenterad DÖD KOD. Multiplayer-info-Alerts (Lobby + Profile) hänvisar till Home-valet för 1vs1.

**Äldre UI-layout-notis (rev 1–2, delvis stale)**: `renderModeBox`-key-union `'single' | 'ptp' | 'remote' | 'indiv'` finns kvar ('remote'-grenen är död). `maxPlayers` låses till **2** via blanket-effekten (`gameMode === 'remote-1v1' ? 2 : hasPremium ? 12 : 4`). DB-CHECKs breddade till `max_players in (2,4,12)` (rooms/lobby_settings/profiles) + `game_mode in (..., 'remote-1v1')` — **migration `0027_remote_1v1.sql`, appliceras manuellt via SQL Editor**.

**"Mutual assistance level" (Peter 2026-08-08, migrationer `0033_lobby_settings_remote_assistance.sql` + `0034_lobby_settings_mutual_assistance.sql`)** — i lokala lägen är assistance en PERSONLIG inställning per spelarkort, men i remote svarar båda på samma frågesekvens var för sig, så olika nivåer gör duellen ojämförbar. Host KAN därför låsa **båda till EN nivå** — men det är **opt-in**.
- **UI**: direkt under "Remote play — 1vs1"-indikatorn i Game Mode-sektionen. En **switch-rad** ("Mutual assistance level", `mutualAssistanceRow` — label + info-ikon + `Switch` i en ram vars färg speglar läget, grön på / grå av; samma "text + switch läses som EN kontroll"-mönster som Spotify-attestraden). **Switchen är AV när lobbyn skapas.** Först när den slås på renderas `REMOTE_ASSISTANCE_OPTIONS` som `modeOption`-rutor (**Full / Standard / Minimal**) + noten "Applies to both players" (host) / "Selected by the Host" (non-host); av → noten "Each player plays with their own assistance level." Allt följer render-för-alla-men-`disabled={!hostMode}`-mönstret. Etiketterna speglar MEDVETET resten av appen (Profile, Add Player, player-edit, leaderboard-metaraden) — samma nivå heter samma sak överallt; håll `REMOTE_ASSISTANCE_OPTIONS` i synk med `ADD_PLAYER_ASSISTANCE_OPTIONS`.
- **Defaults**: switchen `false`, nivån `'full'`. Nivån är MEDVETET inte hostens profil-assistance — den gäller båda spelarna och ska inte tyst påtvingas motståndaren. Carry-over (Play Again) vinner över båda defaults.
- **Härledd flagga**: `mutualAssistanceActive = isRemoteLobby && mutualAssistanceEnabled` gatar ALLA per-spelare-vägar. Är den false beter sig assistance exakt som i lokala lägen.
- **State + sync**: `LobbySettings.remoteAssistance` (`LobbyRemoteAssistance`, typguard `isRemoteAssistance`) + `LobbySettings.mutualAssistanceEnabled`. ⚠ Kolumnerna ingår MEDVETET INTE i `settingsToRow` — `setLobbySettings` gör en **separat targeted UPDATE** (båda i ETT anrop) som dessutom är gated på `gameMode === 'remote-1v1'`. Samma skäl som `sketch_enabled`/`spotify_answer_*`: en upsert som nämner en okörd kolumn failar HELA settings-skrivningen och bryter all lobby-sync, även i lokala lägen. Med separat UPDATE degraderar icke-applicerade 0033/0034 till en console.warn och `rowToSettings` defaultar `'full'` + switch av.
- **Under spel är MATCH-snapshotten sanningen**: `handleStartGame` skriver till **BÅDA** `remote_match_players.assistance`-raderna — den gemensamma nivån när switchen är på, annars varje spelares egen. Alla tre vägar in i quiz läser därifrån — `buildRemoteQuizParams` (`me.assistance`, 1vs1 Matches + kod-återinträde), lobbyns non-host game-started-gren (`matchAssistance` = egen rad → motpartens → `selfRow.assistance` som legacy-fallback) och hostens egen nav. ⚠ Hostens nav måste sätta nivån **i `players`-arrayn**, inte bara i `params.assistance` — quiz.tsx läser `turnOrder[currentPlayerIndex]?.assistance` primärt och paramet bara som fallback.
- **Per-spelare-vägar låses BARA när switchen är på**: player-edit-sheetens Assistance-rad visar då den gemensamma nivån statiskt + pekar på Game Mode-kontrollen (samma mönster som guest-hostens Full-lås), och `PlayerRow`-pillret visar `remoteAssistance` i stället för `player.assistance` så korten inte motsäger sektionen ovan. Med switchen av är båda fritt per spelare igen.
- ⚠ Med switchen AV kan de två spelarna alltså se olika svarsblock (full → namn-lista vs prefix-grid). Hint-urvalet och distraktor-poolen är identiska ändå — se determinism-punkten under "Quiz-session".

**Server-side persistens (migration 0027)** — första spelläget med riktig DB-spelpersistens:
- `remote_matches` — match-livscykel: `room_code` (text-SNAPSHOT utan FK — matchen överlever rummets 24h-expiry), `status ('active'|'finished'|'expired_walkover'|'void'|'cancelled'|'forfeited')` (`'cancelled'` tillagd i **migration `0028_remote_match_cancel.sql`**, `'forfeited'` i **`0032_remote_match_forfeit.sql`**), `question_ids jsonb` (null tills host persisterat), settings-snapshot (rounds/response/era/categories/packages), `deadline_at (+48h)`, `winner_user_id`, `result ('decided'|'draw'|'walkover'|'void')`.
- `remote_match_players` — pk (match_id, user_id), snapshot av namn/typ/assistance/ålder + `finished_at`/totals (sätts ENBART av finalize-RPC).
- `remote_match_answers` — per-fråga-svar, `unique (match_id, user_id, question_index)` = idempotent upsert → resume-säker.
- **Klienten kan ALDRIG skriva status/vinnare/sekvens direkt** — inga INSERT/UPDATE-policyer på match/players; allt går via SECURITY DEFINER-RPC:er: `create_remote_match`, `set_remote_match_questions` (guard `question_ids IS NULL` — host-resume kan inte re-shuffla), `finalize_remote_match_player` (radlås → atomisk vinnarberäkning: pts desc → avg asc → draw). RLS-rekursion på players-tabellen löst via definer-helpern `is_remote_match_participant`.
- pg_cron: `remote-1v1-deadline-sweep` (timvis; 1 klar → walkover, 0 → void) + `remote-1v1-guest-cleanup` (nattlig; matcher UTAN någon `player_type='registered'`-deltagare raderas 24h efter avslut). Cron-SQL:en är oförändrad sedan 0027 men blev först KORREKT med 0029 — dessförinnan satte klienten `player_type` från lobby-flaggan `isGuestHost`, så en registrerad user som hostade som Guest skrevs som `'guest'` och deras avgjorda match raderades trots att båda hade konton. Sedan 0029 kan matcher i praktiken aldrig bli guest-only (rena guests blockeras från remote) — cron:en är kvar som defensiv städning av legacy-rader. Realtime-publication på `remote_matches` driver My Matches + slutskärmens live-flip.
- `waiting_invites` fick sender-läs-policy (`from_user_id = auth.uid()`) så max-4-invites-räkningen fungerar.

**Remote 1v1 är QuizVibe-users-only (Peter 2026-08-08, rev 3)** — läget spelas ENBART mellan två QuizVibe-users som spelar under sin egen identitet. Det finns **ingen guest-variant** av Remote 1v1.

**"Guest" är ett INTRÄDESLÄGE, inte ett kontotillstånd.** Både en ren guest (anon-session, ingen `profiles`-rad) och en registrerad user som väljer att spela som Guest är "Guest" här — båda är lika utestängda från remote. Signalen är därför `isGuestHost` / `LobbyPlayer.type === 'guest'` / `asGuest`-paramet, INTE `isAnonymousSession()`.

Rationalen: en remote-match lever i 48h och ska ligga kvar i historiken. Guest-spel skriver per definition ingen historik, så ett guest-remote-spel vore självmotsägande.

> **Designhistorik** — två modeller utvärderades och förkastades innan denna landade. Rev 1: kontobaserad (registrerad-som-guest fick spela remote, matchen sparades på kontot). Rev 2: homogena lobbies ("user vs user" ELLER "guest vs guest" med `rooms.is_remote_1v1`/`host_is_guest` + `remote_matches.is_guest_match` + omskriven cron) — **byggdes aldrig**, migration 0031 finns inte. Återuppliva dem inte utan nytt produktbeslut.

**Home-panelen** (`HostTypeOptions.remoteMode: 'available' | 'locked' | 'hidden'`, default `'available'`):

| Vy | Remote Play-raden |
|---|---|
| Registrerad "Start New Game" (gyllene) | `'available'` — normal, valbar |
| Guest-panelen, **UTLOGGAD** | `'locked'` — dimmad + grön **"QuizVibe user"**-badge, tap → register-upsell. **Ska VISAS, inte gömmas** — Peter valde dimmad framför borttagen för upptäckbarhet. En hide-variant testades och rullades tillbaka; återinför den inte. |
| Guest-panelen, **INLOGGAD** | `'hidden'` — raden renderas INTE alls. De har redan konto (en "account required"-badge vore nonsens) och valet skulle skapa en guest-remote-match, som inte finns. |

`'locked'`-styling: `lockedDim` (opacity 0.45 på INNEHÅLLET — inte på raden, badgen ska förbli läsbar) + kantskärande badge i grön `Colors.success` + vit text + vit kant (samma registered-path-vokabulär som "QuizVibe USER" på de gyllene knapparna; grönt signalerar VAD som låser upp raden, inte "avstängd"). Subtiteln är SAMMA i alla lägen ("1vs1 — challenge friends remotely") — badgen bär kontokravet.

**Guest-knappens EGEN badge göms medan utfällningen är öppen** (`hostTypeExpanded !== 'guest'`) — raderna bär då sina egna badges. Guest-call-siten skickar därför ned knappens badge via `localBadge`: utloggad → grön **FREE**, inloggad → grå **"No Data Saved"** (`muted`, `#6B7280` = samma `homeUserBadge`-grå). Sätts på BÅDA lokala raderna (Single + Multiplayer) — Remote Play-raden är antingen låst (egen badge) eller dold. Badgarna går via `HostTypeOptionRow.badgeText` + `badgeMuted`, fristående från `locked` som bara styr dimningen; badgen dimmas ALDRIG.

**Fyra gates stänger guest→remote.** **INGEN Alert** (Peter 2026-08-08): ett tapp på en blockerad knapp går DIREKT till "Register or Login"-formuläret (profileMenu:ns **menu-steg** — "Welcome to QuizVibe" → Register / Log in). Två-stegs-flödet Alert→formulär togs bort; återinför det inte.

Förklaringen bärs i stället av formulärets **subtitel**, som byts ut mot `REMOTE_BLOCK_NOTICE[context]` i stället för default-texten "Sign in to create and join games". Det är ENDA stället spelaren får veta varför de hamnade där, så texten måste stå för sig själv:
- **`'join'`** (rumskoden visade sig vara en 1v1-match): "This Room Code belongs to a Remote 1vs1 match. Remote duels can only be played between QuizVibe users — register a free account or log in to join." Används av gate 2 OCH gate 3.
- **`'host'`** (de försökte VÄLJA Remote Play): "Remote 1vs1 matches can only be played between QuizVibe users. Register a free account or log in to host a 1vs1 match." Används av låsta radens tap + gate 1.

**Ref-hand-off krävs**: `pendingAuthNoticeRef` sätts precis före `setProfileMenuVisible(true)` och konsumeras av open-side-resetet till `authNotice`-state. Rakt `setAuthNotice(...)` funkar INTE — open-side-resetet körs efter att modalen blivit synlig och hade nollat värdet. Exakt samma mönster som `openRegisterPendingRef`. `profileMenu.subtitle` fick `lineHeight: 20` eftersom noticen är ~3 rader.

**Cancel återställer guest-formen**: trycker spelaren Cancel i auth-formuläret efter att ha blockats från guest-JOIN-formen återöppnas den formen med namn/födelseår/assistance ifyllda, så de kan skriva en ANNAN rumskod eller gå Back → Home — i stället för att dumpas på Home. Rumskoden återställs MEDVETET INTE (det var ju just den koden de inte fick joina). Mekanik: `handleJoinAsGuest` skickar en `GuestJoinDraft` som andra argument till `onRemoteAccountRequired`; HomeScreen stashar den i `pendingGuestJoinDraftRef` och `handleAuthFormCancel` konsumerar den → `setGuestJoinDraft` + `openJoin('guest')` efter `MODAL_SWAP_DELAY_MS`. JoinModal:s open-reset seedar fälten från `initialGuestDraft` och sätter då `prevGuestStepRef = true` så PlayerName-autofillen INTE skriver över det återställda namnet. Draften nollas i `onClose` (förbrukad) och när modalen stängs på annat sätt (lyckad register/login → guest-vägen är inte längre relevant). **Notera att guest-formen inte kan ligga kvar "bakom" auth-formuläret** — se modal-swap-fällan nedan — den återskapas i stället, vilket ser likadant ut för användaren.

⚠ **MODAL-SWAP-fällan** (bugg 2026-08-08: "tap på Join as Guest → ingenting händer"): båda gaterna kan fyra medan **JoinModal är öppen** — guest-formens "Join as Guest"-submit (gate 2) och guest-host-formens submit (gate 1) ligger BÅDA inuti JoinModal. Två RN `<Modal>` kan inte vara presenterade samtidigt; öppnar man profileMenu innan JoinModal fade:at ut sväljer iOS den TYST och användaren ser ingen reaktion alls. `handleRemoteAccountRequired` stänger därför JoinModal först (+ speglar dess `onClose` genom att nollställa `guestLobbyType`) och öppnar profileMenu efter `MODAL_SWAP_DELAY_MS` (350 ms > fade-animationens ~300). Delayen hoppas över när `joinVisible` är false (låsta Remote Play-radens tap sker direkt på Home) så det vanliga fallet är instant. **Gäller alla framtida modal→modal-övergångar i appen** — inte bara denna.

⚠ **Sätt INTE `openRegisterPendingRef` / använd INTE `?openRegister=1` här.** De hoppar direkt till register-steget och är rätt för guest-hostens "Activate Extra package"-flöde (där vi VET att kontot saknas), men fel här: en guest som blockas från 1vs1 kan mycket väl redan ha ett QuizVibe-konto och bara vara utloggad — de ska få välja Log in. Lobby-backstoppen navigerar därför `router.replace('/?openAuth=join')`; paramets VÄRDE är kontexten (`join|host`), så samma notice visas som när gaten träffas direkt på Home.

**Fälla**: `onRemoteLockedPress` anropas utan argument, så call-siten MÅSTE wrappa (`() => handleRemoteAccountRequired('host')`) — annars blir `context` undefined (samma Pressable-event-fälla som `handleStartGame`).

Gates:
1. **Hosting (Home)** — `handleStartGameAsGuestHost` returnerar för `guestHostLobbyType === '1v1'` **ovillkorligt** (inte längre gated på avsaknad av profil). `guestLobbyType` är sessions-state, nollställs i JoinModal:s `onClose` till `'multiplayer'`. Följd: guest-host-lobbies skickar ALDRIG `lobbyType: '1v1'` — bara `'single'` eller `'multiplayer'` (sedan 2026-08-24; dessförinnan skickades ingen param alls).
2. **Joining (Home)** — `handleJoinAsGuest` läser `getRoomMeta(code)` och blockar `isRemote1v1` **ovillkorligt** — guest-formen ÄR guest-läge oavsett om enheten har en inloggad profil. **Ingen race**: `rooms.is_remote_1v1` (migration `0031_rooms_is_remote_1v1.sql`) skrivs av `registerActiveRoom` ATOMISKT vid skapandet, innan koden ens är joinbar. Läs INTE `lobby_settings.game_mode` här — den skrivs genom en 300ms-debounce och gjorde gaten fail-open i ~1s efter lobby-skapandet (buggen som 0031 fixade). Samma migration sätter dessutom `max_players: 2` direkt för 1v1 så kapacitetskollen är korrekt från första sekunden i stället för att vänta på LobbyScreen:s `setRoomMaxPlayers`-effekt. Rum skapade FÖRE 0031 saknar kolumnen → resolvar `false` och fångas av gate 3; de expirerar inom 24h, ingen backfill behövs.
3. **Lobby-backstop** — sedan 0031 bara ett skyddsnät för pre-0031-rum + framtida regressioner (gate 2 är race-fri). Non-host settings-pollen ejectar när `gameMode === 'remote-1v1' && isGuestInRoom` (`markOwnPlayerLeft` först → ingen orphan-rad, sedan `cancelable:false`-Alert → Home). Idempotent via `remoteGuestEjectedRef`; pollen slutar spegla settings efter ejectet. `isGuestInRoom` ligger i effektens deps.
4. **`handleStartGame`** — sista linjen innan matchraden faktiskt persisteras: blockar om `isGuestHost`, och om motståndarens `type === 'guest'`.

`handleJoinWithCode` behöver ingen gate (inloggad-only-knapp) och dess remote-återinträdes-fallback kräver redan deltagarskap. `handleAcceptInvite` heller inte — invites nycklas på registrerat `playerName` och `loadInvites` läser inloggad users inbox, så anon-sessioner har inga.

**Guest alias** — när en registrerad user spelar under ett guest-namn kopplas namnet till kontot så motståndaren ser vem de mötte.

> ⚠ **Match-halvan (0029) är DORMANT sedan users-only-beslutet** — en remote-deltagare spelar alltid under sitt eget kontonamn, så `remote_match_players.account_player_name` blir alltid null och `formatPlayerLabel` returnerar bara namnet. Kolumnen + härledningen är KORREKTA och lämnas kvar; "fixa" dem inte. **Lobby-halvan (0030) är fortsatt LIVE** — en registrerad user som hostar ett LOKALT spel (Single/PtP/IndDev) som Guest visar `QuizVibe: Anna-42` på sitt spelarkort. Samma sak gäller `remote-1v1-guest-cleanup`-cron:en och det server-härledda `player_type`: alla remote-deltagare är numera registrerade, så cron:en matchar aldrig — den står kvar som defensiv städning av legacy-rader.
- **Match-sidan (0029)**: `remote_match_players.account_player_name`. `create_remote_match` (SECURITY DEFINER) härleder SJÄLV både `player_type` och aliaset genom att slå upp `profiles`-raden per `user_id` — anon-sessioner skriver aldrig `profiles`, så "profiles-rad finns" ÄR registrerad-testet. **Klientens `player_type` ignoreras** (var tidigare spoofbart OCH fel för registrerad-som-guest). `NewRemoteMatchPlayer.playerType` är därför optional och skickas bara som fallback för pre-0029-databaser.
- **Lobby-sidan (0030)**: `lobby_players.account_player_name`. `profiles` har own-row-only SELECT-RLS → ingen klient kan slå upp en ANNAN spelares kontonamn; varje spelare publicerar sitt eget via `publishOwnAccountName` (targeted UPDATE på `room_code + player_id + user_id`). ⚠ Kolumnen ingår MEDVETET INTE i `playerToRow`/`setLobbyPlayers`-payloaden — samma mönster som `seen_question_ids` (0026) och `has_left`, så host:s bulk-UPSERT inte clobbar den och en icke-applicerad migration bara ger console.warn. Wrappern `publishOwnAccountAlias` (module-level i LobbyScreen) kedjas på `upsertOwnLobbyPlayer`/`setLobbyPlayers`-promisen — raden MÅSTE finnas, annars träffar UPDATE:n 0 rader. Host publicerar en gång per lobby via `hostAliasPublishedRef`.
- **Rendering**: `formatPlayerLabel(player)` ([remoteMatches.ts](src/utils/remoteMatches.ts)) ger `GuestA-1234567 (Anna-42)` i My Matches-rader, historik-underrubriker och [RemoteMatchResultPanel](src/components/RemoteMatchResultPanel.tsx). `PlayerRow` visar i stället en dämpad andra rad `QuizVibe: Anna-42` under namnet. **Aliaset publiceras ALLTID när en profil finns** — renderingen avgör om det ÄR ett alias genom att jämföra mot visningsnamnet, så display-regeln bor på ett ställe och aliaset dyker upp rätt även om host döper om spelaren.
- **Konvergens-fälla**: aliaset skrivs strax EFTER spelarens upsert, så host:s `fetchNewJoiners` hinner ofta läsa raden innan kolumnen är satt — och plockar aldrig upp den igen (spelaren finns då i `localIds`). `syncNonHostFields` syncar därför `accountPlayerName` tillsammans med `hasLeft`/`approved`/`spotifyConnected`. Host:s EGET kort ägs lokalt (`mergeProfileIntoHost` körs aldrig för guest host) → aliaset sätts direkt från profilen i focus-effektens host-gren.
- Historik-grupperingen i [MyMatchesScreen](src/screens/MyMatchesScreen.tsx) nycklar numera på motståndarens `userId` (inte namnet) så samma konto inte splittas i två grupper när de växlar mellan kontonamn och alias.

**API-lager**: [src/utils/remoteMatches.ts](src/utils/remoteMatches.ts) — CRUD + RPC-wrappers + `subscribeToMatch`/`subscribeToMyMatches` (Realtime) + `splitMatchForUser` (me/opponent-split) + `buildRemoteQuizParams` (bygger /quiz-params från match-snapshotten för My Matches-tap + kod-återinträde — ALDRIG från lobby_settings som kan vara död).

**Lobby-flöde** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx)):
- `handleSelectMode('remote-1v1')`: >1 självansluten non-host → Alert + ejecta alla; annars `confirmAndRemoveGuests` (host-tillagda guests blockeras, samma regel som IndDev — även "+ Add Player"-gaten). Sätter maxPlayers 2 + spotifyEnabled false.
- **Start-knapp-swap**: 0 approved motståndare → sticky-barens Start Game ersätts av **"Copy room code and send to friend"** (`expo-clipboard`; text `I want to invite you to Quizvibe Game 1vs1 matches. Please login to Quizvibe and join this Room Code AB-23-XY` via formatRoomCode). Exakt 1 approved → normal Start Game.
- **Max 4 obesvarade invites per host** (remote-only, klient-guard i `handleInviteFriend` via sender-räkning; DB-rate-limiten 50/h ligger kvar som hård gräns).
- `handleStartGame`: remote-guard (exakt 1 approved motståndare + motståndarens `lobby_players.user_id` måste finnas) → efter `setLobbyPlayers` skapas matchen via `createRemoteMatch` (misslyckas → best-effort credit-refund + Alert). Navigation: `players=[hostSelfOnly]` + `remoteMatchId`-param.
- **Non-host game-started-detection**: ny gren FÖRE PtP-grenen — hämtar matchen via `getMatchByRoomCode` (retry via 2s-poll tills host:s create propagerat) → Alert "1vs1 match started" med **Play now** (→ solo-quiz med match-settings) / **Play later** (→ Home, matchen syns i 1vs1 Matches).

**Quiz-session** ([app/quiz.tsx](app/quiz.tsx)): `isRemote = gameMode === 'remote-1v1' && !!remoteMatchId`. Solo self-paced (turnOrder=[self] → questionsPerBlock 1; GetReadyIntro `canStartGame` true för remote oavsett isHost; responseSeconds ALLTID read-only — låst i match-snapshotten).
- **Sekvens-auktoritet**: init-effekt (efter gameQuestionsRef) hämtar matchen; `question_ids` null + host → persistera lokala sekvensen EN gång; annars poll tills satt. `gameQuestions`-useMemo:n har remote-override överst: `remoteQuestionIds.map(id => ALL_QUESTIONS_MAP.get(id))` — host-resume och motståndare renderar identiskt. Render-gate ("Preparing 1vs1 match") blockerar allt spel-UI tills sekvens + resume-seed är klara. `totalQuestions` clampas mot sekvens-längden (katalog-skew → ids filtreras, saknas ALLA → "Update required"-Alert).
  - ⚠ **`effectiveMediaSourceByQuestion` / `effectiveCategoryByQuestion` / `effectiveAnswerTypeByQuestion` måste passera igenom på `isHost || isRemote`** — INTE bara `isHost`. Deras non-host-gren bygger om kön ur `broadcastAllQuestionIds`, vilket är ett **IndDev**-begrepp: remote har ingen sync-channel, så fältet förblir null och grenens "sekvensen har inte ankommit"-fallback (`[]`) gjorde att motståndarens GetReady-kö fastnade på ❓/"Unknown"/"?" (bugg 2026-08-08). I remote ÄR lokala `gameQuestions` matchens auktoritativa sekvens för båda roller, så pass-through är korrekt — och render-gaten garanterar att den är laddad innan GetReadyIntro monteras. Samma fälla gäller varje framtida `effective*`-memo som gatas på `isHost`.
  - ⚠ **Allt slumpat frågeinnehåll MÅSTE vara deterministiskt i remote** (fix 2026-08-08). De två spelarna bygger sina ledtrådar och svarsalternativ LOKALT ur samma katalog utan sync-kanal — med `Math.random` fick de olika distraktorer, olika hints och olika ordning på exakt samma fråga (orättvis duell). Tre saker gör utfallet identiskt:
    1. **Seedad RNG** — [`createSeededRng(seed)`](src/utils/seededRandom.ts) (FNV-1a-hash → mulberry32). `seedForRemoteQuestion(questionId)` i [app/quiz.tsx](app/quiz.tsx) ger `` `${remoteMatchId}:${questionId}` `` i remote och `undefined` i lokala lägen (där variation per runda är önskvärd). Trådas till `selectHints(library, count, rng)`, `buildImageVariant(..., rng)` (som i sin tur skickar den till buildLetterGrid/buildNameOptions/buildFullNamesList) och `ActorSelectBlock`s `optionsSeed`. **Seeda ALDRIG på något enhets-/spelarspecifikt** (playerId, timestamp, lokalt index).
    2. **Match-brett audience-set** — `audienceSetForVariants` byggs i remote ur BÅDA deltagarnas åldrar (`remoteMatchAges`, satt ur `match.players` i init-effekten före `remoteSessionReady`) i stället för `turnOrder`, som i remote bara innehåller spelaren själv. Utan detta får en 1985-född och en 2001-född olika distraktor-pool → olika alternativ trots samma seed. `gameQuestions` egen `buildAudienceSet(turnOrder)` är MEDVETET orörd (sekvensen kommer ändå från `question_ids`).
    3. **"Mutual assistance level"** (se ovan) — assistance styr VILKET svarsläge som byggs (full → namn-lista, standard/minimal → prefix-grid). Slår host på switchen kör båda samma nivå och svarsblocket blir bit-identiskt; är den av är hints + distraktor-pool fortfarande identiska (1+2), men de två spelarna kan få olika svarsläge — det är hela poängen med en personlig hjälpnivå.
- **Per-fråga-skrivning**: `recordRoundScore` → fire-and-forget `upsertAnswer` (idempotent). **Resume**: mount-seed från `getMyAnswers` → `rounds`/`allRoundScoresHistory`/`questionIndex` = första obesvarade; allt besvarat → direkt leaderboard.
- **Två utvägar ur quiz-vyn — IDENTISKA för host och motståndare** (Peter 2026-08-08, migration 0032). Remote skickar `onQuit` + `quitLabel="Quit Game"` + `onSaveExit` till GetReadyIntro; lokala lägen skickar som förr bara en av `onQuit`/`onLeave`. **`onSaveExit` byter top-barens layout till LOBBY-mönstret**: ingen naken knapp i vänsterkanten, i stället en tappbar **spelar-pill i högerkanten** (spegel av TopUserBanner:s loginPill — avatar + namn, primaryMuted + primaryBorder, `Radius.full`) vars tap öppnar en **bottom-sheet** med `Save & Exit` (grön) / `Quit Game` (röd) / `Cancel` — geometri och färgspråk speglar lobbyns `guestLeave*`-sheet 1:1. Pill-slotten delas med IndDev:s `selfPlayerName`-text; de kan aldrig krocka eftersom remote per definition inte är IndDev. Sheeten stängs FÖRE handlern körs (handlern visar egen confirm-Alert, och en Alert över en fortfarande uppe RN-Modal kan sväljas på iOS — samma ordning som lobbyns `handleGuestLeaveRoom`).
  - **"Quit Game"** (röd) → `handleRemoteForfeit` → `forfeitRemoteMatch` → `forfeit_remote_match`-RPC:n sätter `status='forfeited'` + `result='walkover'` med **motståndaren som vinnare** och aggregerar callerns redan sparade svar till en ärlig delpoäng (`finished_at` lämnas null — de spelade aldrig klart). Bara host kör rums-cleanup-bunten (matchen är terminal → koden ska inte ligga kvar joinbar).
  - **"Save & Exit"** (blå) → `handleRemoteSaveExit` → bara seen-recording + Home. Inget rums-cleanup ens för host — båda ska kunna komma tillbaka. Svaren ligger redan server-side, så resume-seeden plockar upp vid första obesvarade frågan inom 48h via 1vs1 Matches.
  - **Walkover-popup åt den som är kvar**: quiz.tsx prenumererar på matchen via `subscribeToMatch` (postgres_changes på `remote_matches` — samma kanal som resultatpanelen). Blir status `'forfeited'` visas `Alert "Walk over" / "{opponent} has left this game — you win by walkover."` → OK → Home. Symmetriskt för båda roller. Två refs krävs: **`selfForfeitedRef`** sätts FÖRE RPC-anropet (Realtime pushar UPDATE:n tillbaka till avsändaren också, och `router.replace` hinner inte alltid före) och **`opponentQuitAlertedRef`** gör den idempotent mot Realtime-redelivery vid reconnect. Popupen kräver att motparten har appen öppen i quiz-vyn — annars upptäcks walkovern som vanligt i 1vs1 Matches (async-läge, ingen push-notis i V1).
  - Båda skriver visade frågor till seen-historiken via `recordRemoteQuestionsShown` (i remote ÄR `gameQuestions` matchens auktoritativa sekvens för båda roller → ingen broadcast-preferens som i IndDev:s `handleLeaveGame`).
  - `handleQuitGame`/`handleLeaveGame` är därmed **lokala lägen only** — deras remote-grenar är borttagna.
- **Avslut**: leaderboard-effekten anropar `finalizePlayer` (sista finishern triggar vinnarberäkningen server-side). `appendGameHistoryEntry` SKIPPAS för remote (server-tabellerna är historikkällan — annars dubbelräkning i Player History). Final-footern återanvänder guest-flödets "bara Home" (`guestHost=true + guestReplaysUsed=1` → Play Again dold) **plus en gold "Start New Game"-knapp** (2026-08-08) ovanför Home-raden: samma vokabulär som Home:s knapp (56 px, `Colors.warning` bg+kant, svart text) med SAMMA inline-`HostTypeOptions`-utfällning (Single Game / Multiplayer Game / Remote Play). Remote-slutskärmen har ingen Replay-knapp. Drivs av `RoundLeaderboard.onStartNewGame?: (lobbyType) => void` — utelämnas → knappen renderas inte alls, så lokala lägen är orörda; quiz.tsx skickar den bara när `isRemote && isLastQuestion && !isGuestHostGame`. **Knappen är LÅST tills duellen är avgjord** (2026-08-08): `startNewGameLocked = isRemote && !remoteOpponentSummary && !remoteMatchEnded` → grå knapp (`startNewGameBtnLocked`, `cardElevated` bg + `borderStrong` + `textDisabled` text), utfällningen öppnas inte, och tappet kallar `onStartNewGameLockedPress` som Alert:ar "Waiting for your opponent / You can start a new game as soon as both players have finished this match." Den som blir klar först ska inte kunna dra igång nästa match medan motståndaren fortfarande har sitt 48h-fönster kvar. `remoteMatchEnded` (`m.status !== 'active'`, satt i samma load som `remoteOpponentSummary`) låser upp knappen även när motståndaren ALDRIG spelar klart — walkover/void/forfeit gör att det inte finns något kvar att vänta på. Realtime-prenumerationen gör att knappen tänds live om motståndaren blir klar medan slutskärmen står uppe. Medan panelen är utfälld göms Home/Play Again-raden (speglar Home som döljer sina övriga knappar). Handlern `handleStartNewGameFromFinal` i [app/quiz.tsx](app/quiz.tsx) speglar Home:s `handleCreateGame` steg för steg (credit-gate → `registerActiveRoom` med `isRemote1v1` → per-rum-cleanup → `router.replace('/lobby')`) men rör ALDRIG den pågående matchens rum — motståndaren har 48h kvar (samma resonemang som `handleGoHome`:s remote-gren).
- **Slutskärm**: [RemoteMatchResultPanel](src/components/RemoteMatchResultPanel.tsx) ovanför RoundLeaderboard — "Waiting for {opponent} — Xh left" (live via `subscribeToMatch`) eller W/L/D-banner + poäng. Delas med My Matches-resultatmodalen.

**Home + My Matches-skärmen**: [MyMatchesSection](src/components/MyMatchesSection.tsx) på Home (mellan actions och footer) är **EN huvudknapp "1vs1 Matches"** (gameBtn-lik; gold-kant + "Your turn in N matches"-subtitel när någon match väntar, annars "N matches"; renderar null utan matcher) som navigerar till den dedikerade skärmen **[/my-matches](app/my-matches.tsx)** → [src/screens/MyMatchesScreen.tsx](src/screens/MyMatchesScreen.tsx) (thin re-export-mönstret; registrerad i [_layout.tsx](app/_layout.tsx)). Skärmen: TopUserBanner med `backLabel="Back"` → Home, match-rader med statusar Your turn (guld, tap → spela) / Waiting for opponent / Won/Lost/Draw (tap → resultat-modal med RemoteMatchResultPanel; walkover-suffix skiljer `(opponent quit)`/`(you quit)` från `(walkover)`) / Void / Lobby deleted by Host, empty-state, realtime + focus-reload. **Anon-sessioner ser INGEN 1vs1-ingång alls** (Peter 2026-08-08): `MyMatchesSection` sätter `visible = []` när `isAnonymousSession()` → knappen renderar null på Home. Tidigare filtrerades de till `active | cancelled`; det räckte inte, eftersom anon-sessioner från FÖRE konto-spärren kan bära legacy-matcher som fortfarande renderade knappen. De löper ut på sin 48h-deadline och sveps av cron:en. Efter users-only-beslutet (rev 3) kan anon-sessioner inte längre skapa remote-matcher alls, så filtret är i praktiken defensivt. **Kod-återinträde**: `handleJoinWithCode` — när `isActiveRoom` failar testas `getMatchByRoomCode` (deltagare + active) → direkt till quiz-resume istället för "Room not found"; redan färdigspelad → "Already played"-Alert.

**"Save 1vs1 — Play later" — sparad LOBBY (Peter 2026-08-08)**: knapp i BÅDA TopUserBanner-sheetsen i lobbyn (host-delete-sheet + non-host-leave-sheet), gated på `isRemoteLobby = gameMode === 'remote-1v1' && !singlePlayerDefault`, placerad ovanför den röda destruktiva knappen (blå `saveLobbyBtn` — bevarande, inte destruktiv). Sparar **lobbyn, inte matchen** — matchraden skapas fortfarande först vid Start Game, så ingen credit dras och inget `remote_matches`-anrop sker.
- **Store**: [src/utils/savedLobbies.ts](src/utils/savedLobbies.ts) — AsyncStorage, per-user-namespacad (`@quizvibe/savedLobbies/v1/<playerName.toLowerCase()>`, samma mönster som friends/gameHistory). `SavedLobby = { roomCode, isHost, opponentName, savedAt }`. **Ingen DB-tabell och ingen migration** — posten är en UI-genväg till ett rum som redan lever server-side; rooms-raden (24h TTL) äger livslängden.
- **`handleSaveRemoteLobby(fromHostSheet)`** i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx): stänger sheet:en → `saveLobby(...)` → Alert ("Find it under \"1vs1\" … status Not started") → `router.replace('/')`. Medvetet INTE Leave/Delete: non-host markeras **aldrig** `hasLeft` (behåller sin plats så host fortfarande kan trycka Start Game), host raderar **inte** rummet (koden är fortsatt joinbar).
- **Rendering**: [MyMatchesScreen](src/screens/MyMatchesScreen.tsx) lägger dem överst i **"Status: Not started"** (blå kant `rowSaved` vs de gyllene "din tur"-raderna) med texten `Saved lobby: AB-23-XY` + `With: {motpart} · Lobby open Nh`. Tap → `/lobby` (`code` + `isHost`; host får dessutom `lobbyType: '1v1'` som forcerar remote-seeden), **inte** `/quiz`.
- **Prune vid varje reload**: `getRoomMeta(code)` — saknas metan (raderat/utgånget) eller är `gameStarted` satt (host startade → riktig matchrad tar över raden) → `removeSavedLobby`. Motpartsnamnet läses om via `getLobbyPlayers` varje gång (host kan ha sparat en tom lobby och fått motståndare efteråt); det sparade namnet är bara fallback. `RoomMeta.expiresAt` (nytt optional-fält i [mockActiveRooms.ts](src/utils/mockActiveRooms.ts), mappat från `rooms.expires_at`) driver "Lobby open Nh".
- **MyMatchesSection** räknar sparade lobbies i sin synlighetsgate så Home-knappen dyker upp även innan någon match finns. De ingår INTE i "New update"-signaturen (spelaren skapade dem själv). Anon-sessioner ser dem aldrig (storen nycklas på playerName + explicit guard).

**Player History** ([PlayerHistorySection.tsx](src/components/PlayerHistorySection.tsx)): har INGET eget 1vs1-block — den embeddar `<MyMatchesSection full />` som navigerar vidare till `/my-matches`, där historiken bor (grupperad per motståndar-`userId`, se ovan). Beskrivningen av ett inbyggt "1vs1 Duels"-head-to-head-aggregat här var stale och är borttagen 2026-08-08.

**Terminala statusar + deras UI-copy.** Fyra sätt en aktiv match kan sluta utan att båda spelar klart — alla opererar bara på `status='active'`, så en avslutad match kan varken skrivas om eller "återuppstå" om motståndaren spelar klart efteråt (deras `finalizePlayer` no-op:ar och resultatpanelen visar det redan avgjorda utfallet):

| status | result | Sätts av | UI-copy |
|---|---|---|---|
| `forfeited` | `walkover` | `forfeit_remote_match` (**0032**) — vilken DELTAGARE som helst trycker "Quit match" | Panel: "You won — walkover! / {opp} quit the match before finishing." resp. "You quit the match". My Matches-suffix: `(opponent quit)` / `(you quit)` |
| `expired_walkover` | `walkover` | deadline-sweep, 1 spelare klar | "…won — walkover" + suffix `(walkover)` |
| `void` | `void` | deadline-sweep, 0 klara | "Match void — neither player finished in time" |
| `cancelled` | — | `cancel_remote_match` (**0028**, host-only) | "Lobby deleted by Host" |

⚠ **`cancelled` är DORMANT sedan 2026-08-08** — quiz-vyns host-Quit går numera via `forfeit_remote_match` (host och motståndare har identiska utvägar, se "Två utvägar ur quiz-vyn" ovan). RPC:n + `cancelRemoteMatch`-wrappern + all rendering finns kvar för äldre klienter/legacy-rader; "fixa" dem inte, men bygg inte heller nya vägar dit utan nytt produktbeslut.

quiz-init-effektens `bailIfEnded` fångar `cancelled` + `forfeited` (Alert → Home) om någon navigerar in i en avslutad match — övriga terminalstatusar faller igenom till resume-seeden som skickar dem till leaderboarden. Guest-retention-cron:en (0027) matchar `status <> 'active'` → `forfeited` städas som övriga avslut.

**Realtime-kanal-gotcha (fix 2026-08-07)**: kanalnamn i `subscribeToMatch`/`subscribeToMyMatches` MÅSTE vara unika per prenumerations-INSTANS (module-level räknare) — `supabase.channel(<samma namn>)` returnerar befintlig instans och `.on()` efter `subscribe()` KASTAR ("cannot add postgres_changes callbacks after subscribe"). Vid `router.replace` mountas nya skärmen INNAN gamla avmonteras → statiskt namn kraschade Home. Samma register-tysta-fel-klass: `registerActiveRoom` returnerar numera boolean och ALLA fyra create-sites (Home, guest-host, Profile, Play Again) Alert:ar + abort:ar vid false — tidigare tyst no-op gav fantom-lobby ("Room not found" för joiners).

**Kända begränsningar V1**: ingen push-notis när motståndaren spelat klart (Realtime kräver att appen är öppen); `selfPlayerId` är syntetiskt `'remote-self'` vid My Matches-/kod-återinträde (konsekvent inom sessionen — attribution håller).

## Customized Host packages (Premium-inkluderade; Profile-toggle → Lobby-filter)

**OMARBETAT 2026-07-07: paket säljs INTE styckvis — ALLA extra-paket INGÅR i Premium-abonnemanget.** `PURCHASED_PACKAGES` i [mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) är numera "katalogen av premium-inkluderade paket" (legacy-namn behållet). Synlighet: paketlistan visas för host ENDAST när inloggad + Premium + ej guest host; Profile-listan bara vid Premium. Se "Generic + Activate Extra package-rad" för Lobby-UI/seeding-detaljer. State + flow:

- **`enabledHostPackages?: string[]`** på `ProfileData` — lista över paket-id:n som är aktiverade (Premium-userns default-urval ur katalogen).
- **⚠ FUNKTIONELLA tema-paket sedan 2026-08-28 — `PURCHASED_PACKAGES` är INTE längre tom.** Två första paket: `{ id: 'pkg-melodifestivalen', name: 'Melodifestivalen', tags: ['Melodifestivalen'] }` + `{ id: 'pkg-hiphop', name: 'Hip Hop', tags: ['hiphop'] }`. `MusicPackage` har nu ett **`tags: string[]`**-fält (matchning mot katalogens `genrePackages` sker via `tags`, INTE via `id` — undviker case-problem `hiphop` vs "Hip Hop"). `pkg-`-prefixet plockas INTE av `LEGACY_GEN_PKG_IDS`-strippningen (matchar bara `pkg-gen-*`). All runtime-logik ligger i den delade **[hostPackages.ts](src/utils/hostPackages.ts)** (`resolveActivePackageTags`, `computePackageCoverage`, `computePackageEraRange`, `itemInActivePackages`, `hasActivePackage`) som BÅDE Lobby och quiz.tsx använder så pool-filter + graying + era-lås + preview aldrig glider isär. Rock / Film & Actors m.fl. fortsatt parkerade.
  - **Ett aktivt paket gör spelet TEMA-ONLY** (Peter 2026-08-28): [quiz.tsx](app/quiz.tsx):s `gameQuestions` restrikterar musikpoolen till items vars `genrePackages` matchar en aktiv paket-tagg (`packagedMusic`), och tömmer image/Hints-poolen (`packagedImages = []`) — image-exporten emitterar inga genrePackages så inga Hints-items kan bära en tagg. Flera valda paket = union av taggar. `effectiveYoutubeCategories` = host-toggles ∩ paketets täckning så kategori-filtret inte tömmer temapoolen.
  - **Mixerboard-graying** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): när paket aktivt gråas + disable:as varje (kategori × källa)-cell som paketet saknar material för (`pkgGray`/`pkgGrayColumn`/`pkgGraySpotify`/`pkgGrayAllSources`). Hip Hop → Film + Sport + Music-Hints grå; Music-YT + Music-Spotify tända. Muterar INTE host:s sparade toggle-state — quiz intersectar effektivt.
  - **Game Era-lås**: paket aktivt → era låses till `computePackageEraRange` (min/max `correctYear` över paketets items), renderas som guest-host-låst box + not "Game era locked by selected package" (ingen slider). `effectiveEraValues` går till lobby_settings-sync + alla quiz-params + preview → non-host ärver spannet, och Hip Hop kan aldrig kombineras med en era utan material.
  - **Exklusivitet via `inBaseCatalog`** (Peter 2026-08-28): `true` (default) = låten spelas i BÅDE generiska spel OCH paketet; `false` = paket-exklusiv. [export-music-questions.ts](backend/scripts/export-music-questions.ts) DROPPAR inte längre `inBaseCatalog:false`-items — de emitteras med flaggan (764 exporterade, 83 med `inBaseCatalog:false`) så klienten kan inkludera dem när paketet är aktivt; baspool-filtret exkluderar dem annars. `MusicQuestion`/`QuizQuestion` har `inBaseCatalog?: boolean`.
  - **Melodifestivalen-omtaggning** (Peter 2026-08-28): svenska Mello-låtar som bara hade `["Eurovision"]` fick Melodifestivalen tillagd (dual, om de var i ESC); svenska bidrag som ALDRIG nådde ESC (Dotter) fick `Eurovision` ERSATT med `Melodifestivalen`; redan dual-taggade + i ESC lämnades orörda; internationella (icke-svenska) ESC-items orörda. 27 items omtaggade (25 add + 2 replace). Dessutom fick 9 svenska Mello-vinnare som SAKNADE genrePackages helt en ny `["Melodifestivalen"]`-tagg (Carola, Robin Stjernberg, Sanna Nielsen, Lena Philipsson, Martin Stenmarck, The Ark, Lasse Berghagen m.fl.) — hittade via notes/wikimediaSearchHints. Melodifestivalen-paketet har nu **41 spelbara låtar** (från 9). (Utelämnad: `tomas-ledin-vi-ar-pa-gang` — redan `sport`-taggad, "Vi är på gång" var inte ett Mello-bidrag trots search-hint-omnämnande.)
- **Legacy generations-paket:** Generations-paketen ("Play as Gen X" etc.) togs bort 2026-05-27.
  - Legacy gen-paket-IDs (`pkg-gen-elder/-x/-millennials/-z/-alpha`) strippas automatiskt ur sparade profiler vid `loadProfile`-augmenten via en defensive filter (hardkodad lista i [ProfileScreen.tsx](src/screens/ProfileScreen.tsx)). `wasIncomplete`-checken triggar defensive auto-save om listan ändrats så storage konvergerar passivt mot tom array.
  - `GenerationKey` + `getGenerationKeyFromBirthYear` är kvar i [mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) som ren content-filter-utility — används av [audienceFilter.ts](src/utils/audienceFilter.ts) för att härleda spelares generation. Inte längre kopplat till några paket.
- **Profile-UI** ([ProfileScreen.tsx](src/screens/ProfileScreen.tsx)): "Activate Extra package"-knapp (gold/grå badge per `hasPremium`); listan + Select all + Save renderas bara vid Premium. `availablePackages = [...PURCHASED_PACKAGES]` via `useMemo` — numera Melodifestivalen + Hip Hop (tidigare tom → empty-state "No host packages available").
- **Lobby-render** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): `allPackagesCatalog = [...PURCHASED_PACKAGES]`. `availablePackages` skiljer host vs non-host:
  - **Host**: `allPackagesCatalog.filter(p => enabledHostPackages.includes(p.id))`.
  - **Non-host**: hela `allPackagesCatalog` returneras oförändrad. `selectedExtraPackages` från `mockLobbySettings` styr vad som faktiskt renderas via `visiblePackages`-filter när themed packages finns.
  - **FREE-badge-pattern bevarad**: `pkg.free` på `MusicPackage`-interfacet är optional och styr en kantskärande FREE-badge på paket-raden (`packageRowFreeBadge` styles). Inga free-paket existerar i V1 men styling finns kvar för framtida gratis-paket.
- **Seeding**: Lobby host-seed-effekten läser `profile.enabledHostPackages` (klampas mot katalogen) och sätter det som UTBUDET (`availablePackages`), men **auto-aktiverar INGET** — en fresh lobby öppnar på Generic (`selectedExtraPackages = []`), även för Premium-host. Profilens enabled paket styr alltså bara vad host kan VÄLJA i lobbyn, inte vad som är aktivt; host aktiverar själv via Activate/Select all/per-paket-toggle. Carry-over (Play Again + Keep settings) vinner (bär över föregående spels AKTIVA paket). Non-hosts ser endast paket som hosten aktiverat för denna lobby via `selectedExtraPackages`.

## SOURCE MIXERBOARD — per-source category matrix (uppdaterad 2026-07-01)

⚠ **PAKET-LÄGE KOLLAPSAR MIXERBOARDEN (2026-08-31).** När ett Host-paket är valt (`anyPackageActive`) renderar Lobby INTE längre den låsta 3×3-matrisen — den ersätts av **två aggregat-toggles: YouTube + Hints** (var och en styr HELA paketets material för den källan) plus **Spotify som komplement**. Nya boolean-fält `packageYoutubeEnabled` / `packageHintsEnabled` (default true, tolerant DB-fallback `?? true` som `spotify_answer_*`, quiz-params + [mockLobbySettings.ts](src/utils/mockLobbySettings.ts)) styr dem; en toggle är **disabled när paketet saknar material** för källan (`pkgHasYoutube`/`pkgHasHints` via `computePackageCoverage`; nuvarande paket = Music/YT/Spotify → Hints-toggeln disabled). quiz.tsx: `effectiveYoutubeCategories = packageActive ? (packageYoutubeEnabled ? coveredYtCats : []) : …`, `packagedImages` gatas på `packageHintsEnabled`. Era-låset (`packageEraLocked`) oförändrat. 3×3-matrisen visas fortsatt UTAN paket.
- **Spotify som ENDA källa** styrs per paket av `MusicPackage.allowSpotifyOnly` ([mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) — `true` på Melodifestivalen + Hip Hop). `packagesAllowSpotifyOnly(ids)` ([hostPackages.ts](src/utils/hostPackages.ts)) = true bara om ALLA aktiva paket har flaggan. `pkgSpotifyOnlyOk` (LobbyScreen) = paket aktivt + Spotify faktiskt aktiv + alla paket tillåter → host får då stänga av BÅDE YT och Hints (toggle-handlers + Start Game-validering släpper "at least one source"-kravet). Paket utan flaggan (t.ex. framtida Sport/Football) kräver fortfarande minst YT eller Hints. quiz-poolen bygger Spotify-only automatiskt (ingen quiz-ändring krävdes).

Ersätter gamla `enabledMainCategories` + `youtubeEnabled`/`imagesEnabled`-booleans med **per-source category-arrays**. UI-rubriken "SOURCE MIXERBOARD" i både Lobby och Profile.

**Datamodell**: `youtubeEnabledCategories: MainCategory[]` + `imagesEnabledCategories: MainCategory[]` + `spotifyEnabled: boolean`. Alla tre sparas i Profile (`spotifyDefaultEnabled` i `ProfileData`) och seeds till Lobby vid Create Game.

**UI-layout** (`smGrid` i LobbyScreen + ProfileScreen):
- **Spotify DJ-rad** — överst, direkt under "SOURCE MIXERBOARD"-rubriken. Box med `backgroundColor: rgba(255,255,255,0.06)` + `borderRadius: Radius.sm` (matchar All-radens styling). Spotify-ikon + label + info-icon + anslutningsstatus + toggle. Direkt under (när `spotifyEnabled`): **Year + Name-switchar på samma rad** (gröna vid på, röda vid av — matchar övriga Mixerboard-switchar). Validering: minst en av dem måste vara aktiv (Alert om försök att stänga av båda). **DB-gotcha**: `spotify_answer_year`/`spotify_answer_name` saknar DB-migration → skrivs INTE i `settingsToRow` (kommenterade ut precis som `sketch_enabled`) — `rowToSettings` läser via `?? true` som tolerant fallback.
- **Matrisen nedan**: Rad 1 (rubriker) | Rad 2 (All-rad) | Rad 3 (YouTube) | Rad 4 (Hints) — kolumner: **Music / Film / Sport** (displaynamn i UI; internt mappade mot `artists/actors/athletes`). `smAutoCell` (spacer mellan YouTube- och Hints-raderna) är `height: 8` — tunn spacer, ingen label-text (borttagen 2026-06-15).
- **Tema-paket-graying (2026-08-28)**: när ett Host-paket är valt gråas + disable:as varje (kategori × källa)-cell som paketet saknar material för (`pkgGray`/`pkgGrayColumn`/`pkgGraySpotify`/`pkgGrayAllSources` via [hostPackages.ts](src/utils/hostPackages.ts):`computePackageCoverage`). Hip Hop → bara Music-YT + Music-Spotify tända. Se "Customized Host packages".
- `onLayout` på `smGrid` mäter exakt kolumnbredd → pixel-perfekt centrering.

**Auto-sync-regler (kontextberoende, 2026-06-05)**:
- **Spotify PÅ** → YouTube och Images är HELT OBEROENDE per kolumn. Auto-sync-texten döljs. Kolumn-masters aktiverar BÅDA YT + Images (explicit "välj allt"-action).
- **Spotify AV**:
  - **Actors** auto-sync aktiv ENBART om `!artistsEnabled && !imagesEnabledCategories.includes('Sport')`. YT ON → Images ON; Images OFF → YT OFF (hel kolumn).
  - **Athletes** auto-sync aktiv ENBART om `!artistsEnabled && !imagesEnabledCategories.includes('Film')`. Samma bidirektionell sync.
  - **Artists** alltid oberoende (aldrig auto-sync).
  - "Auto-sync"-text visas i UI ENBART när auto-sync faktiskt är aktiv.
- **useEffect-trigger**: `[youtubeEnabledCategories, spotifyEnabled, artistsEnabled]` — triggar ON-sync även när `artistsEnabled` ändras (t.ex. Artists/Images stängs av → auto-sync kan aktiveras för Actors/Athletes).
- **Seed-fix**: Lobby-seed använder `!== undefined` (ej `length > 0`) — tom array `[]` respekteras som explicit "alla av" vs `undefined` som "ej konfigurerat → default".

**Source Validation-regler** — enforced vid Start Game + Spotify-av-toggle + individ-switch-toggle:
- **Spotify PÅ** → inga krav på YT/Images, alla kombinationer tillåtna
- **Artists (Music) aktiv** → fritt, kan spelas ensamt
- **Actors/Athletes utan Artists + Spotify** → minst 2 aktiva kombinationer krävs
- **Stänga av Actors/Athletes Images** → "Not applicable" popup om det är enda aktiva YT-kombinationen (Actors/Athletes utan Artists — Artists ensamt är undantag, giltigt)
- **Stänga av Spotify** → blockeras om `imagesEnabledCategories.length === 0 && enabledColumnsCount <= 1 && !youtubeEnabledCategories.includes('Music')` (Artist/YT ensamt är OK)

**quiz.tsx-filter (2026-06-06)**:
- YouTube-pool: filtreras mot `youtubeEnabledCategories` inkl. `genrePackages`-crossover.
- Hints-pool (imagePool): alla person-items (`artist/band/actor/athlete`) är **era-agnostiska** — `correctYear` = födelseår, inte eventår; födelseår används aldrig som era-filter. Explicit `peakFrom/peakTo` används om satt.
- Fallback: om YouTube av + imagePool tom → person-fallback utan era, INTE SEED_QUESTIONS.
- **Bug-fix (2026-06-06)**: `youtubeEnabledCategories`/`imagesEnabledCategories` parsades med `filtered.length > 0 ? filtered : ['Music','Film','Sport']` — tom array `[]` (= YouTube/Images av) tolkades felaktigt som "använd default = allt på". Fixat: tom array är ett giltigt explicit val och fallbackar inte till default. Fallback sker bara vid JSON-parse-fel eller icke-array.

**Person-type crossover (2026-06-02):** `itemMatchesEnabledCategories` i `mainCategory.ts` stöder symmetrisk crossover via `genrePackages`:
- `genrePackages: ["sport"]` → surfar ÄVEN under Athletes/Sport
- `genrePackages: ["film"]` → surfar ÄVEN under Actors/Film
- `genrePackages: ["music"]` → surfar ÄVEN under Artists/Music

- **Shared utility** ([src/utils/mainCategory.ts](src/utils/mainCategory.ts)): `MainCategory`, `IMAGES_MANDATORY_CATEGORIES` (legacy), `MAIN_CATEGORIES`, `defaultEnabledMainCategories()`, `isMainCategory()`, `MAIN_CATEGORY_LABELS`, `itemMatchesEnabledCategories()`, `subjectToMainCategory()`.
- **Profile-state** `youtubeEnabledCategories?: MainCategory[]` + `imagesEnabledCategories?: MainCategory[]` på `ProfileData`. Default = alla 3.
- **Lobby-state** `youtubeEnabledCategories: MainCategory[]` + `imagesEnabledCategories: MainCategory[]` på `LobbySettings`. DB-migration 0014 hanterar bakåtkompatibilitet.
- **URL-params**: `youtubeEnabledCategories: JSON.stringify(...)` + `imagesEnabledCategories: JSON.stringify(...)`. quiz.tsx parsar med `try/catch` + `isMainCategory`-filter, fallback alla 3.

## Profile — unsaved changes guard (2026-06-03)

Snapshot-baserad jämförelse (`savedSnapshotRef` = JSON vid load/save). `hasUnsavedChanges()` jämför aktuell state vid navigation. `guardedNavigate(navigateFn)` wrappar alla exit-punkter: TopUserBanner back, Create Game ("Start New Game"), Join Game ("Join with Room code"), Store. Alert: "Don't save" (navigerar direkt) / "Save" (sparar defaults + host, sedan navigerar) / "Stay" (avbryter). Expo Routers native stack stödjer inte `usePreventRemove`/`beforeRemove` — explicit callback-wrapping är enda tillförlitliga metoden.

## Generic + Activate Extra package-rad (Lobby host-vyn)

**OMARBETAT 2026-07-07 — Extra packages säljs INTE styckvis; ALLA paket INGÅR i Premium-abonnemanget.** Två-knapps-rad direkt under "Customized Host packages"-rubriken i Lobby — host-only:

- **Generic** (vänster, 50% bredd) — visuell indikator + tappbar. Lyser **grön** (`Colors.success` border + `Colors.primaryMuted` bg + grön FREE-badge med svart text) när `selectedExtraPackages.length === 0` (lobby:n kör utan extra-paket = bara basic). **Grå** (borderStrong + transparent bg + grå FREE-badge) så fort minst ett paket är valt — inklusive Select all-läget. Tap på dämpad Generic → Alert "Switch to Generic? This will deactivate all selected packages..." → Switch tömmer `selectedExtraPackages` (alla paket avaktiveras → Generic blir grön igen).
- **Activate Extra package** (höger, 50% bredd — ersatte "+ Add Host packages"-Store-CTAn 2026-07-07) — samma `addPackageBtn`-styling (38 px hög). PREMIUM-badge: **guld** när host har Premium, **grå** annars (även guest host — `hasPremium` forceras false). Aktiv-stil `activatePackageBtnActive` (guld kant + `primaryMuted` bg) när Premium-hostens paket är aktiva — Generic/Activate bildar ett grönt⟷guld-par som Max 4/Max 12. Tap-beteende per roll:
  - **Premium host + Generic aktivt**: re-aktiverar alla `availablePackages` (tom V1-katalog → Alert "No Extra packages available — New Extra Host packages are coming soon..."). Paket redan aktiva → no-op.
  - **Inloggad utan Premium**: Alert "Premium feature — Extra Host packages ... are included with QuizVibe Premium. Get it in the Store?" → `/store?focus=subscription`.
  - **Guest host**: Alert "Extra packages are only available for QuizVibe users with Premium. Do you want to register as a QuizVibe user? Please be aware this Game Lobby will be deleted." → Yes kör `performLobbyDelete` (delad helper extraherad ur handleDeleteLobby — deactivateRoom + clear-bunt + 1.6s overlay) → `router.replace('/?openRegister=1')`. Home:s `openRegister`-param + `openRegisterPendingRef` öppnar profileMenu direkt på register-steget (open-side reset-effekten konsumerar ref:en — annars hade den forcerat step='menu'). Inloggad guest host landar i inloggade menyn (register-steget är gated `!isLoggedIn`).
- **Paketlistan (`extraPackagesWrapper`) visas för host ENDAST när `!isGuestHost && hasPremium`** — ej-Premium host ser inget under knapp-raden (grå badge = lås-signal, samma mönster som Max 12); guest host ser noten "Extra packages only available for registered QuizVibe users with Premium". Non-host oförändrad (ser hostens aktiva paket).
- **Fresh lobby öppnar på Generic (INGEN auto-aktivering)**: host-seed-effekten sätter `selectedExtraPackages = []` för fresh lobby (även när `premium`) — profilens enabled paket erbjuds via `enabledHostPackages`/`availablePackages` men aktiveras inte. Carry-over (Play Again + Keep settings) VINNER — bär över föregående spels aktiva val (inkl. medvetet tomt Generic-val) — klampas mot premium (utgången → `[]`) + katalogen. Mid-session-övergångar via `prevPremiumRef` (null-init) i focus-effekten: lapse → töm selection (`[]`); köp (false→true) → INGEN auto-aktivering (paketen blir bara tillgängliga). Gated på `lobbySeededRef`.
- Layout `packageActionsRow`: `flexDirection: 'row'` + `gap: 4` (matchar `modeToggle`-gap) + `flex: 1` på båda → 50/50 bredd.

## Host Game Credits (pill + daily refresh + deduktion)

**OMARBETAT 2026-07-07 — Extras (engångsköpta credits) HELT BORTTAGNA.** V1-modellen: inloggad user har 4 gratis host-spel/dag (Free, daily refresh — `FREE_CREDITS_DAILY_CAP`, höjt 2 → 4 2026-08-07); Premium-abonnemang = unlimited (ingen gate, ingen deduktion); guest host = obegränsat gratis men inga sparade historikdata och **varken re-match eller replay** (se "Start Game as Guest"). Store säljer INTE credit-packs längre (`CREDIT_TIERS = []`, sektion dold — samma parkerings-mönster som PACKAGE_TIERS). `ProfileData.gameCredits` är legacy-fält (persistens-passthrough i ProfileScreen så gamla saldon inte nollas; läses aldrig av UI/gates). `CREDIT_PRODUCT_AMOUNTS` i iap.ts + `handleBuyCredits` i StoreScreen är död kod för ev. re-aktivering. **OBS: pausa/ta bort pkg_credits_5/10/20 i App Store Connect + RC Dashboard.**

**Pill i headern** på både Profile (övre höger, "Profile"-titel vänster) och Lobby (övre höger, "Game Lobby"-titel vänster). Identisk styling i båda:

- `creditsPill`: 1 px `Colors.primaryBorder`, `Colors.cardElevated` bg, `Radius.md`, `minWidth: 160` (140 på smala skärmar, se nedan).
- **Smal-skärms-fix (2026-08-12, TestFlight iPhone SE)**: Lobby-headern är en rad med `screenTitle` ("Game Lobby", 24 px bold ≈ 134 pt) + pillen. På **320 pt** — iPhone SE1, ELLER vilken iPhone som helst med **iOS Display Zoom** påslaget (SE2/8 rapporterar då 320 i stället för 375) — kräver raden ~306 pt av 288 tillgängliga, så pillens högerkant klipptes utanför skärmen och labeln kapades till "HOST GAME CRE…". `NARROW_SCREEN = Dimensions.get('window').width < 360` i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx) sänker titeln 24→20 px, pillens `paddingHorizontal` md→sm och `minWidth` 160→140; `screenTitle` fick `flexShrink: 1` så titeln ger efter före pillen. **Ventil**: `header` har `flexWrap: 'wrap'` + `rowGap` och pillen `marginLeft: 'auto'` — räcker raden ändå inte (stor Dynamic Type ovanpå Display Zoom) hoppar pillen ned på egen rad, fortsatt högerställd, i stället för att klippas. Labeln får dessutom `numberOfLines={2}` + `textAlign: 'center'` i BÅDA vyerna så den wrappar ("HOST GAME / CREDITS") i stället för att kapas. Profile-headern har `headerLeft: { flex: 1 }` och klipptes aldrig — bara label-wrappen speglades dit.
- ⚠ **Display Zoom är den dolda variabeln**: en "375 pt-enhet" kan rapportera 320 pt. Testa nya fixed-width-element mot 320, inte mot enhetens nominella bredd.
- **"Free: N"** — grön text (`Colors.success`), `fontVariant: 'tabular-nums'`. Enda värdet i pillen sedan Extras-boxen togs bort 2026-07-07 (`creditsExtras*`-styles kvar som död CSS).
- **Kant-skärande PREMIUM-badge** (`creditsMembershipBadge`) renderas **ALLTID** — guld vid aktiv prenumeration, **grå** (`creditsMembershipBadgeGrey` `#6B7280` + vit text) utan. Samma "grått = ej upplåst"-vokabulär som Max 12-rutan och Rounds-rulerns badge. Tidigare doldes badgen helt utan Premium, vilket gjorde att pillen inte antydde att något gick att låsa upp (Peter 2026-08-13).
- **Värde-raden** följer samma flagga: `Free: N` i grönt utan prenumeration, **`Unlimited`** i guld (`creditsValueUnlimited`, `#F5A623`) med. Premium-hosts drar aldrig credits, så saldot är irrelevant för dem. Pillens ram byter samtidigt till guld via `creditsPillMembership`.
- **Tap utan prenumeration → Alert "Go to Store?"** (Cancel / Go to Store) innan navigationen. Pillen sitter i headern och nås lätt av misstag; att slängas ur lobbyn mitt i en setup är en dyr felnavigering. **Med** prenumeration finns inget att sälja → tappet går direkt till Store utan mellansteg. Handlers: `handleCreditsPillPress` + `goToStoreFromCredits`. ⚠ I Lobby MÅSTE de ligga efter `hasPremium`-deklarationen — `useCallback`-deps evalueras vid render, så en placering ovanför ger TDZ-ReferenceError. Profile-varianten wrappar dessutom navigationen i `guardedNavigate` (osparade profil-ändringar).
- **Ingen flash vid mount**: BÅDA skärmarnas `hasPremium` seedas ur den synkrona spegeln `getCachedPremium()` ([subscriptionStorage.ts](src/utils/subscriptionStorage.ts)) och `freeGameCredits` ur `getCachedProfile()`. Med `useState(false)` / `useState(0)` renderade en Premium-host en hel frame av LÅST läge — grå PREMIUM-badge + "Free: 4" som hoppade till guld + "Unlimited" så fort den async läsningen resolvade (Peter 2026-08-13, syntes tydligast när man öppnade en lobby direkt efter köp). Se "Synkron premium-spegel" nedan.
- Pillen är **identisk i Lobby och Profile** — ändra alltid båda.
- **Tap på pillen** → `router.push('/store?focus=subscription&from=/lobby')` (eller `from=/profile` på Profile-skärmen) — Store renderar Subscriptions överst, Back returnerar till källan.

**Daily refresh** i `src/utils/profileStorage.ts`:

- `FREE_CREDITS_DAILY_CAP = 4` styr top-up-cap (höjt 2 → 4 av Peter 2026-08-07 — samma siffra som Store:s "Basic: 4 games per day"). Gäller BÅDE grant vid registrering och daglig top-up.
- `todayCETDate()` använder `Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' })` så CET/CEST-DST hanteras automatiskt.
- `refreshFreeCreditsIfNeeded` är **icke-destruktiv top-up**: jämför sparat `lastFreeCreditsRefreshDate` mot dagens CET-datum, och om dagen passerat sätts `freeGameCredits = Math.max(currentFree, FREE_CREDITS_DAILY_CAP)` + ny date. Saldo redan ≥ cap → lämnas orört. Saldo < cap → bumpas upp till cap.
- Triggar i `loadProfile` så fort Profile/Lobby får fokus efter midnatt CET. **Caveat**: om appen ligger öppen ÖVER midnatt utan att Profile/Lobby får fokus, sker refresh först nästa fokus. För strikt "exakt midnatt"-refresh skulle en AppState-listener eller intervall-timer krävas.

**Credit-deduktion på Start Game** (Lobby `handleStartGame`):

- 1 Free-credit konsumeras per påbörjat spel: `nextFree = free - 1`. Premium: ingen gate, ingen deduktion (Free lämnas orört). Guest host: hela blocket skippas.
- Om Free är 0 (och `!hasPremium`) → blockad start med Alert "Out of Host Game Credits — You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium..." + Cancel/Go to Store-knappar (→ `focus=subscription`).
- Persisteras via `saveProfile({ ...profile, freeGameCredits: nextFree })` (spread:ar in alla andra profil-fält så ingen annan sparad setting strippas). Lokal `setFreeGameCredits` så pill:en uppdateras direkt utan att vänta på nästa fokus-load.

`lastFreeCreditsRefreshDate?: string` på `ProfileData` MÅSTE passeras genom alla `saveProfile`-anrop — annars strippas datumet och refresh fyrar igen samma dag.

**handleStartGame-guards** (ordning, samtliga FÖRE credit-deduktion så host:s credits aldrig dras vid abort):
1. **No approved players** (`turnOrder.length === 0`): defensiv fallback — visar Alert "No approved players to start the game" + return.
2. **No approved non-hosts i multiplayer-läge** (PtP/IndDev utan singlePlayerDefault): visar Alert "No approved players — Either approve players or switch to single player mode" + två knappar: `Approve players` (Cancel-style, stänger popup) eller `Switch to single player` (kör `setSinglePlayerDefault(true)`; host kan sedan tap:a Start Game igen och guarden släpper igenom).
3. **PtP-bekräftelse** (gameMode='pass-the-phone' + multiplayer + approvedNonHosts.length > 0): visar Alert "Pass-the-Phone mode — Are all players in the same room so you can share this device?" + `No`/`Yes`-knappar. Yes-onPress kör `handleStartGame(true)` rekursivt med `ptpConfirmed=true`-flagga som hoppar guarden i andra rundan. Förhindrar att host startar PtP-spel när IndDev var tänkt (credit-spill på misstag).
4. **Unstable peer** (IndDev): blockerar om någon approved non-host har röd peer-health.
5. **Credit-gate**: blockerar om Free är 0 (om `!hasPremium`; Extras borttagna 2026-07-07; guest host skippar gaten helt).

**Pressable-event-fälla**: `onPress={handleStartGame}` på Start Game-knappen passar Pressable:s syntetiska event som första argument. För funktioner med default-värden (`handleStartGame = async (ptpConfirmed = false)`) blir då `ptpConfirmed = event` (truthy) → PtP-guarden hoppas över. Lösning: alltid wrappa i arrow `onPress={() => handleStartGame()}` när handler har default-argument. Samma mönster gäller övriga RN Pressable/TouchableOpacity-call-sites.

## Store screen

Four sections in `src/screens/StoreScreen.tsx` under header **"Add QuizVibe Premium"** (subtitle: "Extra Host Game credits, or unlimited Host games with QuizVibe membership plans"):

1. ~~**Basic plan**~~ — **DÖLJD sedan 2026-08-07 (Peter): Store ska bara sälja Premium, gratis-planen behöver ingen egen ruta.** `basicSection` renderas inte i något `focusMode`; JSX:n är parkerad i [StoreScreen.tsx](src/screens/StoreScreen.tsx) (samma mönster som `otherHeading`/`PACKAGE_TIERS`) ifall den ska tillbaka. Parkerad form: single card med FREE badge (border-cutting, grön) + grön ACTIVE-pill i card-right. Headline `"4 Host Games / day"` (= `FREE_CREDITS_DAILY_CAP`; den tidigare "2 (+2 bonus)"-formuleringen är borta — det är en flat 4 i koden) med `numberOfLines={1}` + `adjustsFontSizeToFit` + `minimumFontScale={0.75}` så texten inte wrap:as på smala skärmar. "+ Unlimited games as invited player" + "Refreshes every day at midnight CET" sublines.
2. ~~**Customized Host Packages**~~ — **SÄLJS EJ (2026-07-07): Extra packages ingår i Premium-abonnemanget** (se SUBSCRIPTION_FEATURES-raden "All Extra Host packages included"; tidigare "PARKERAD till v1.1+"-styckförsäljning utgår permanent). `PACKAGE_TIERS = []` → `packagesSection = null`; `packages`/`packages-only`-fokus legacy-mappas till `subscription`. `PackageTierCard` + `handleBuyPackage` kvar som parkerad död kod ifall styckförsäljning skulle återinföras. Themed packages i sig kommer i v1.1+ via `PURCHASED_PACKAGES`-katalogen (premium-inkluderade).
3. ~~**Credit packages**~~ — **BORTTAGNA 2026-07-07** (engångsköp av Host Credits utgår ur V1; enda köpet är Premium-abonnemanget). `CREDIT_TIERS = []` → `creditsSection = null` (samma parkerings-mönster som Packages). `CreditTierCard` + `handleBuyCredits` kvar som död kod; tidigare tiers 5/10/20 games à 19/29/49 kr (pkg_credits_5/10/20).
4. **QuizVibe membership plans** — 5-feature comparison list (Premium left / Basic right per row) inside a feature card, then **1 subscription tier (1mth at 79 kr, 2026-06-09)** — de tre längre planerna (3mth/6mth/12mth) togs bort. `SUBSCRIPTION_TIERS`-arrayn har nu bara ett objekt (`sub-1mth`). `SubscriptionTier.badge?` och `savePct?` är optional så inga kraschar. Auto-renewal-fotnoten finns kvar. **⚠ Under launch-kampanjen (2026-08-09) ersätts hela tier-kortet + auto-renewal-noten av `PromoTierCard` och 79 kr-kortet visas inte alls — se "Free Premium launch promo" nedan.**

Shared `CreditTierCard`, `PackageTierCard` and `SubscriptionTierCard` mirror the same layout (left: headline + per-game/per-month subline + optional save%; right: price + Buy/Subscribe button).

**Riktig IAP via RevenueCat (klar 2026-05-23):** `handleBuyCredits`/`handleBuySubscription` anropar `purchasePackage()` från [src/lib/iap.ts](src/lib/iap.ts) som triggar Apple:s native purchase-modal (StoreKit 2). RC-offering laddas via `useEffect`+`loadOfferings()` vid mount → `packageByProductId`-map kopplar varje tier (productId: `pkg_credits_5`/`pkg_sub_monthly` etc.) till sitt RC `PurchasesPackage`. Priser visas via `getDisplayPrice(productId, fallback)` som föredrar RC:s `localizedPriceString` (region-anpassad valuta från Apple) över hardcoded fallback. `purchasing`-state håller tier-id:t under aktivt köp så Buy-knappen visar `<ActivityIndicator>` + alla andra Buy-knappar disable:s. UserCancelled från Apple's modal → tyst no-op (ingen Alert). Error-flow → `Alert "Purchase failed"`. Success → bumpa `gameCredits` via `CREDIT_PRODUCT_AMOUNTS[productIdentifier]` för consumables; för subs sätter vi `setPremiumActive(true)` direkt + customer-info-listener i [_layout.tsx](app/_layout.tsx) speglar entitlement-state vid renew/expire/restore. **Restore Purchases-knapp** (Apple-krav) renderas i botten av subscriptionSection — anropar `restorePurchases()`, mappar entitlement → `setPremiumActive` + Alert om aktiv/ingenting att återställa. Themed packages är parkerade till v1.1+; `handleBuyPackage` finns kvar som no-op-stub som visar "Coming soon"-Alert (skulle aldrig triggas eftersom `PACKAGE_TIERS = []` → `packagesSection = null`).

## Free Premium launch promo (2026-08-09)

QuizVibe lanseras med en kampanjperiod där **Premium är gratis**. Store visar då ett kort med rubriken **"Single month"** och underraden **"no auto-renewal"** (två rader, Peter 2026-08-09) plus en **Free**-knapp, och **79 kr-kortet visas inte alls**. När Peter stänger kampanjen tar betal-kortet över.

**TVÅ OBEROENDE KLOCKOR** — att hålla isär dem ÄR designen ([src/utils/promoPremium.ts](src/utils/promoPremium.ts)):

| | Vad | Styrs av |
|---|---|---|
| **Offer window** | Om Free-kortet visas och en ny claim/förnyelse får göras | Peter, via `app_config.free_premium_promo` i Supabase + bakad `OFFER_BACKSTOP_UNTIL` |
| **Claim** | EN användares gratismånad — startar vid tryck på Free, slut en kalendermånad senare | Användaren, **per konto** |

- **Grant = 1 månad från trycket**, inte ett delat slutdatum. Vill man fortsätta går man tillbaka till Store och trycker Free igen. Ingen gräns på antal förnyelser medan erbjudandet är öppet.
- **Under pågående månad finns ingen knapp** — kortet visar grön `ACTIVE`-pill + "Free until {datum}". Knappen kommer tillbaka först när månaden lapsat (ingen omstart i förtid).
- **Att stänga erbjudandet återkallar INTE en pågående månad** (grandfathering). Store byter till 79 kr-kortet för alla, men den som har en månad kvar behåller Premium tills den tar slut och ser då raden "Your free month is active until {datum}". Därför läser `hasActiveFreePremium()` MEDVETET bara claim-klockan, aldrig offer window.
- **Stänga kampanjen**: `update app_config set value = '{"enabled": false, ...}' where key = 'free_premium_promo'` i dashboarden. Slår igenom vid varje enhets nästa app-start — **ingen App Store-release**. `OFFER_BACKSTOP_UNTIL` är bara skyddsnätet för enheter som aldrig når Supabase; sätt det generöst.
- **Kalendermånad med dag-klampning** (`addMonthsClamped`): 31 jan → 28 feb (29 skottår), inte 3 mars som naiv `setMonth` ger.
- **⚠ Claimen är ÄGARSTÄMPLAD** (`CLAIM_KEY = @quizvibe/promo/freePremiumClaim/**v2**`, poster är `{ claimedAt, owner }` där owner = playerName lowercased). AsyncStorage är per ENHET medan månaden hör till ett KONTO — utan stämpeln ärvde varje nytt konto som registrerades på samma telefon den förra användarens månad och visade "Unlimited" i credits-pillen i stället för "Free: 4" (Peter 2026-08-13). `getFreePremiumExpiry` returnerar null när `owner` inte matchar inloggat playerName, och v1-poster (råa ISO-strängar utan ägare) är MEDVETET inte migrerade — de dör med den gamla nyckeln. Ägaren slås upp via `getCachedProfile()` (synkron spegel); bara vid ohydrerad spegel betalas en `loadProfile()`.
- **Rensa ALDRIG claimen vid logout** — ägarstämpeln gör redan rätt, och en rensning skulle bränna månaden för någon som bara loggar ut och in igen. Delete Account nukar hela `@quizvibe/*` och täcker därmed nollställningen.
- **Registrering rensar den BETALDA spegeln**: `handleRegisterSubmit` ([app/index.tsx](app/index.tsx)) anropar `clearPremiumSubscription()` — ett nytt konto har per definition ingen prenumeration, och `@quizvibe/subscription/hasPremium/v1` är per enhet. Självläkande: har Apple-ID:t en giltig prenumeration sätter RC:s customer-info-listener tillbaka `true` direkt efter att SIGNED_IN kopplat RC till den nya user-id:n.

**⚠ Premium-läsningen har TVÅ LAGER — skriv ALDRIG promon in i den betalda nyckeln.** `hasPremiumSubscription()` i [subscriptionStorage.ts](src/utils/subscriptionStorage.ts) är appens ENDA läskälla (7 gates: Max 12 players, 20 rundor, obegränsade host-credits, PREMIUM/Unlimited-pillen, Extra Host packages) och kollar (1) betald RC-entitlement, sedan (2) `hasActiveFreePremium()`. Nyckeln `@quizvibe/subscription/hasPremium/v1` ÄGS av [_layout.tsx](app/_layout.tsx) som skriver `hasEntitlement(...)` vid varje app-start OCH varje customer-info-ändring — utan RC konfigurerad (Expo Go, ingen key) blir den skrivningen `false`, så en promo som persisterat `true` dit hade raderats vid nästa start. Promon utvärderas därför vid LÄSNING. Lägg aldrig en parallell premium-check i en skärm; utöka `hasPremiumSubscription()` i stället.

**Synkron premium-spegel** (`getCachedPremium()`, 2026-08-13): `hasPremiumSubscription()` uppdaterar en module-level spegel vid varje anrop, och modulen värmer den själv vid app-start (`void hasPremiumSubscription()`). Skärmar seedar sitt `hasPremium`-state ur den (`useState(() => getCachedPremium() ?? false)`) så första framen är rätt i stället för att blinka låst läge. Samma mönster och samma skäl som profileStorage:s `getCachedProfile` — och samma regel: **`undefined` = ej utvärderad, inte "ingen premium"**; call-sites faller tillbaka på `false` (fail-closed) och låter den async läsningen korrigera.
⚠ Varje väg som ÄNDRAR premium måste räkna om spegeln. `setPremiumActive` och `clearPremiumSubscription` gör det själva (och `setPremiumActive(false)` räknar om via BÅDA lagren — `false` på den betalda flaggan betyder inte att kampanjmånaden är slut). Kampanjens claim lever i promoPremiums egen nyckel och passerar aldrig `setPremiumActive`, så [StoreScreen](src/screens/StoreScreen.tsx):s Free-knapp anropar **`refreshPremiumMirror()`** explicit efter en lyckad claim. Lägger du en ny väg som påverkar premium — gör samma sak.

**Lapse hanteras redan gratis**: LobbyScreen:s `prevPremiumRef` (1774-1786) + seed-clamparna (1359-1388, 1414-1424) rensar paketval och klampar `maxPlayers`→4 / `roundsCount`→`ROUNDS_MAX_PASS` när premium försvinner. En claim som tar slut är exakt det. Guest host påverkas aldrig — `LobbyScreen:1763` forcerar `hasPremium=false` för dem.

**Store-UI** ([StoreScreen.tsx](src/screens/StoreScreen.tsx)): `subscriptionSection` splittas på `offerOpen`. Titel + `SUBSCRIPTION_FEATURES` är oförändrade i båda grenarna (jämförelsen stämmer fortfarande); bara tier-kortet + noten under byts. `PromoTierCard` speglar `SubscriptionTierCard`:s geometri men har **inget pris och ingen "/ month"-suffix**, återanvänder `tierCard`/`tierHeadline`/`tierSubline`/`activePill`/`buyBtn`-stilarna, och får grön `tierCardActive`-styling FÖRST när månaden är igång (grönt = aktiv i resten av appen). Kortet har **ingen FREE-badge** (Peter 2026-08-09) — knappen säger redan "Free" och kortet är ensamt i sektionen, så badgen blev bara upprepning. "no auto-renewal" ligger som `tierSubline` under rubriken; när månaden är igång tillkommer en andra subline `Free until {datum}`. Auto-renewal-noten är **faktiskt fel** under kampanjen och byts mot "Free for one month. No payment and no auto-renewal…". Restore Purchases står kvar i båda grenarna (Apple-krav). Claim-flödet rör **inte** StoreKit — inga pengar byter ägare, så det funkar även i Expo Go (vilket ger en dev-väg till Premium som inte fanns förut). Analytics: eget event `free_premium_claimed` med `renewal: boolean` — MEDVETET skilt från `purchase_completed` så 0 kr-claims inte förorenar revenue-mätningen.

**⚠ App Store**: `pkg_sub_monthly` ska **INTE** ingå i v1.0-submissionen — en reviewer måste kunna nå varje IAP man submittar, och kortet är dolt under kampanjen. Submitta prenumerationen tillsammans med uppdateringen som avslutar kampanjen.

**Känd begränsning**: användare hittar erbjudandet — och märker att månaden tagit slut — bara genom att besöka Store. Ingen nudge/banner finns. Vid månadsslut försvinner Premium tyst vid nästa skärm-fokus.

**Expo Go-skydd (2026-05-29, utökat 2026-08-08):** `configurePurchases` i [src/lib/iap.ts](src/lib/iap.ts) hoppar över `Purchases.configure` HELT i Expo Go — detekterat via `Constants.executionEnvironment === ExecutionEnvironment.StoreClient` (expo-constants). Rationale: utan native-modulen faller SDK:n tillbaka på sin browser-implementation (`node_modules/react-native-purchases/dist/browser/nativeModule.js`) som `console.error`:ar `"Invalid API key. The native store is not available when running inside Expo Go…"` INNAN den kastar — vår try/catch runt iOS-grenen hindrar kraschen (vit skärm) men hinner aldrig tysta loggen, så varje app-start visade en röd ERROR-banner. Try/catch:en är kvar som skydd mot andra init-fel. `configured` förblir false och alla övriga IAP-anrop no-op:ar via sina `!configured`-guards. En `warnedExpoGo`-flagga gör att info-raden loggas en gång per session (configure anropas igen vid login/logout). IAP funkar normalt i dev-/standalone-builds (där native-modulen finns). Detta gör Expo Go användbart igen för snabb JS-iteration. **OBS:** TestFlight-byggen har JS:en INBÄDDAD från byggtid → laddar INTE live kod från Metro; använd Expo Go (laddar live) eller ett riktigt development build för att se nya ändringar.

**Sticky TopUserBanner**: Store har samma sticky-banner som Home/Lobby/Profile, placerad direkt under `<SafeAreaView>` utanför `<ScrollView>`. Använder `TopUserBanner`:s nya `backLabel="Back"`-läge (plain `← Back`-text i textSecondary, speglar Join-as-guest-modalens backBtn-style) istället för default Q + "Home"-stilen. Login-pillen i högra hörnet renderas read-only (ingen `onPress`) — Store-användare ändrar inte profil härifrån.

**`?focus=…`-paramet styr render-ordning** — fyra lägen + default. Sektionerna deklareras som JSX-konstanter (`basicSection`, `packagesSection`, `creditsSection`, `subscriptionSection`) och placeras sedan i ordning beroende på `focusMode`:

| `?focus` | Ordning | Triggas av |
|---|---|---|
| `subscription` | Subscription → Basic → Packages → Credits | Max 12 players-rutans Premium-popup, Rounds-rulerns PREMIUM-badge (Lobby + Profile) |
| `packages` / `packages-only` | **LEGACY (2026-07-07)** — mappas till `subscription` (Extra packages säljs inte styckvis; de ingår i Premium. F.d. "+ Add host packages"-CTAn ersatt av "Activate Extra package") | Ev. stale deeplinks |
| `credits` | **LEGACY (2026-07-07)** — mappas till `subscription` (engångsköp borttagna; alla f.d. credits-callsiter pushar nu `focus=subscription`) | Ev. stale deeplinks |
| (ingen) | Basic → Credits → Packages → Subscriptions | User-login-modalens Store-knappar (Home + Profile) |

"Other"-rubriken (`otherHeadingWrap` + `otherHeading`) är en tunn 1px top-border + uppercase overline-stil (textSecondary, letterSpacing 1.2) som visuellt separerar primär-fokus-sektionerna från resten. Renderas bara i `packages`/`credits`-läget — `subscription`-läget och default-läget har ingen Other-rubrik (Subscription-läget är redan top-positionerat och default är "naturlig" ordning).

**`?from=<path>`-paramet styr Back-knappens destination** (kritiskt för korrekt UX):

- Alla push-callsiter skickar `&from=<source-path>`: `/lobby`, `/profile`, eller `/`.
- Store:s `handleBack` läser `from` och kör `router.replace(from)` — explicit destination istället för `router.back()`.
- **Varför**: explicit `from`-destination ger förutsägbar Back-routing när Store nås från flera källor (Lobby:s Host Game Credits-pill, Profile:s logoutSheet Store-knapp, Home:s profileMenu Store-knapp osv.). `router.back()` ensam hade poppat något godtyckligt på navigation-stacken; med `from` vet vi alltid var användaren ska tillbaka.
- Saknas `from` faller `handleBack` tillbaka till `router.canGoBack() → router.back()`, sedan `router.replace('/')` (Home) som sista utväg så användaren alltid har en utväg.

## Subscription-styling (host-vyn) — Rounds + Players

**OMARBETAD 2026-06-01:** subscription gatar inte längre lägesvalet. **Individual device är gratis** (premium-gating + Store-länk borttagen). Subscription = **Unlimited Host Games + Max 20 rounds + Up to 12 players** (`SUBSCRIPTION_FEATURES` i StoreScreen — "Individual Device Game mode"-raden borttagen). Caps gatas på `hasPremium` OBEROENDE av läge:
- `roundsMax = (gameMode === 'individual-devices' && !singlePlayerDefault) ? ROUNDS_MAX_INDIV(20) : ROUNDS_MAX_PASS(4)` — **mode-baserat, INTE premium-baserat**. Premium ger INTE fler rundor i PtP; premium-host i PtP guidas till IndDev via `onPremiumPress`-alertet. `useEffect([roundsMax])` auto-klampar `roundsCount` vid mode-byte. RoundsRuler visar grå låsta tickar > 4 + PREMIUM-badge + Store-länk (`onPremiumPress` → alltid `/store?focus=subscription`). `hasSubscription={hasPremium}`, `applicable` default true.
- `maxPlayers` via Players-toggeln — Max 12 gatad på `hasPremium` (se "Game Mode + Players").
- `hasPremium` (= f.d. `hasMultiplayerPackage`, borttagen) hardcoded `false` tills Store-state kopplas in.

Den nedan beskrivna **Individual Devices-rutans** guld/grå-premium-styling är STALE (IndDev är nu en vanlig grön/grå FREE-ruta) — behållen för historik; `modeOptionPremiumActive`/`premiumBadge`-stilarna återanvänds nu istället av **Max 12 players**-rutan.

**(STALE) Individual Devices-rutan** (Game Mode-toggle):

| Sub | Vald | Frame | Badge |
|---|---|---|---|
| off | nej | grey | grey |
| on | **ja** (IndDev aktivt) | gold | gold |
| on | nej (Pass-the-Phone eller Single Play vald) | grey | gold |

Frame är guld **endast** när IndDev faktiskt är vald — host kan ha Premium men ändå föredra Pass-the-Phone eller Single Play. Badgen signalerar däremot ren subscription-status oavsett vilket läge som är valt: guld = unlocked, grey = locked. `singlePlayerDefault`-checkboxen dämpar fortfarande hela rutan oförändrat (grey + grey badge). Implementation: `modeOptionPremiumActive`-stilen appliceras endast när `hasMultiplayerPackage && gameMode === 'individual-devices'`; annars `modeOptionInactive` (grey).

**Rounds of Game-rulern** (`RoundsRuler`-komponenten via `hasSubscription`-prop):

| Sub | Klammer | Tick-streck + Siffror | Badge |
|---|---|---|---|
| off | grey #6B7280 | grey (`borderStrong` / `textDisabled`) | grey #6B7280 + vit text |
| on | gold #F5A623 | **blue** (`Colors.primary`) | gold #F5A623 + svart text |

Två separata färggrupper — klammer + badge växlar grey↔gold (premium-status), tick-streck + siffror växlar grey↔blue (availability). `roundsMax = (gameMode === 'individual-devices' && !singlePlayerDefault) ? ROUNDS_MAX_INDIV : ROUNDS_MAX_PASS` i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx) (mode-baserat, se ovan). Klammer + PREMIUM-badge syns i PtP-läget för ALLA hosts (free och premium) — `onPremiumPress` skiljer: free-host → Store, premium-host → "Switch to IndDev"-alert. Lokala variabler i komponenten: `klammerColor`, `lockedTickColor`, `lockedFigureColor`, `badgeBg`, `badgeTextColor` — alla deriverade från `hasSubscription` så call-sites bara passerar bool:en.

Non-host-vyn använder fortfarande default `hasSubscription={false}` → grå styling oavsett host:s subscription-status (klammer + badge döljs ändå när `onPremiumPress` saknas, så bara siffer-färgningen är synlig).

**PREMIUM-tap-flöde är split baserat på subscription** (`onPremiumPress`-callback i LobbyScreen):
- **Premium-host i PtP**: visar Alert "Switch to Individual Devices mode?" / "Switch to Individual Devices mode to expand number of rounds up to 20." med Cancel + Switch. Switch routar via `confirmAndRemoveManualGuests` (för att cleana ev. manuellt tillagda guests) → `setGameMode('individual-devices')`. Hostar äger redan paketet, så Store-deeplinken är inte rätt destination — guida dem till mode-bytet istället.
- **Free host**: bevarar default Store-upsell-routing (`/store?focus=subscription&from=/lobby&fromCode={roomCode}`).
- **Premium-host i IndDev**: bracket + PREMIUM-badge döljs (`gameModeMax === ROUNDS_MAX_INDIV` → ingen locked-zone att rendera).

**`RoundsRuler.indivActive`-prop** (tillagd 2026-06-11): `indivActive?: boolean` (default false) — styr färgen på "Individual device +"-texten inuti klammern: `Colors.success` (grön) när IndDev aktivt, `Colors.error` (röd) annars. Passas från Lobby + Profile som `!singlePlayerDefault && gameMode === 'individual-devices'`.

**`renderModeBox` 4:e `redIndiv`-param** (Lobby + Profile, 2026-06-11): valfri boolesk 4:e parameter. Styr om IndDev-rutan (`key === 'indiv'`) ska få röd text i inaktivt läge. Passas bara `true` i **Number of Rounds quick-select**-raden; Game Mode/Game Settings-raderna skickar inget 4:e argument — IndDev-rutan behåller grå standardfärg i Game Mode-sektionen.

**PREMIUM-badge bredvid stepper "+"** (Lobby + Profile, 2026-06-11): visas inline till höger om "+"-knappen när `roundsCount >= stepperMax` (Lobby) / `roundsCount >= roundsMax` (Profile). Exakt samma badge-styling som klammerbadgen under RoundsRuler: `backgroundColor: hasPremium ? '#F5A623' : '#6B7280'`, text `color: hasPremium ? '#000' : '#FFF'`, `borderRadius: 4`, `paddingHorizontal: 8 / paddingVertical: 2`, `fontSize: 10 / fontWeight: '700' / letterSpacing: 0.6`. Tap på badge → Store/subscription. "+" vid cap utan premium: `onPress` navigerar till Store istället för att vara dead no-op. Badge försvinner naturligt i IndDev + premium (då `stepperMax = 20` och `roundsCount < 20` efter köp).

## Lobby — Game Settings card

Game Mode and SOURCE AND PROFESSIONS share a single bordered card (`gameSettingsBorder` in `LobbyScreen.tsx`) — they're treated as one "spelregler"-grupp. Order inside SOURCE AND PROFESSIONS: Source × Profession matrix (kolumn-baserad: Music/Film/Sport som kolumner (displaynamn), YouTube/Images som rader) → "Customized Host packages" sub-block (`usePackagesBlock`).

**Source × Profession matrix** (2026-06-03, ersätter separata YouTube/Images-rader + Main categories-block): kolumn-baserad layout (`sourceMatrixDataCol`) med professionstyperna (Artists/Actors/Athletes) som kolumner och källorna (YouTube/Hints) som rader. YouTube-raden har ⓘ-info-ikon, Images-raden har Q-ikon med "?" + ⓘ. Images Actors+Athletes har låsta switchar med 🔒 på tummen. Se "SOURCE AND PROFESSIONS" ovan för full spec. `sketchEnabled`-state + `mockLobbySettings`/DB-plumbing (`sketch_enabled`-kolumn, migration `0013`) lämnas som död plumbing (default AV).

**Lobby host-seed-effekten** (i URL-params-deps useEffect:n) läser host:s profil vid varje lobby-mount och seeds lokala lobby-settings: `gameMode`, `maxPlayers`, `singlePlayerDefault`, `region` (mappas via `mapProfileRegion`-helper: `'sweden' → 'Sweden'`, `'nordics' → 'Nordics'`, `'global' → 'Global'`; null → `'Global'`-fallback eftersom Lobby:s Region-set inkluderar `'Europe'` som Profile saknar), `answerResponseSeconds`, `eraValues` (clamp:as till `[ERA_MIN, ERA_MAX]`), `roundsCount` (clamp:as mot `roundsMax`), `enabledHostPackages`. Generic-fallbacks per fält om profil saknar värdet — speglar Profile:s motsvarande spec (Pass-the-Phone, Max 4, Global, 1981→`ERA_MAX` (current year), `ROUNDS_DEFAULT`, 30 sek, alla paket aktiverade). Effekten triggar både vid första lobby-mount OCH vid Play Again-återinträde (component re-mountar då URL-params byter).

**Answer response time-rad** (under Number of Rounds, inom samma `quizSettingsBorder`): 4-knapps-rad (15s/30s/45s/60s) med aktiv ruta i `primaryBorder` + `primaryMuted`-bg, label-text bold + textPrimary i aktivt läge. Renderas för alla i lobbyn men `disabled={!hostMode}` så bara host kan ändra (samma "render-for-all-but-disable-for-non-host"-mönster som Game Mode och Region scope). Default seedas från host:s profil via `setAnswerResponseSeconds(profile?.answerResponseSeconds ?? 30)` i host-seed-effekten ovan; non-host syncar via `mockLobbySettings`-polling.

**Images icon** (raden heter "Images" i Game Connections — tidigare "Profiles & Places") uses an inline SVG of the Q-figure (circle + tail in `Colors.primary`, no surrounding squares) with a **"?"-glyph overlay** centered in the Q ring (speglar `QuizVibeQuestionMarkLogo`:s symbolik — tidigare var det italicized "AI"-text, bytt 2026-05-20 eftersom AI inte längre är rätt mental modell för image-frågorna). Style-key `connectionIconAiText` behållen som privat CSS-vokabulär (icke-domän-semantisk, minimal-diff). Glyfen är fontSize 14 fontWeight 800 primary-blå, italic borttagen eftersom italic på ett ensamt "?" dubbel-lutar glyfen. `viewBox="24 22 32 32"` centers the Q at icon coords (14, 14). **Gotcha**: this inline SVG is **independent** from `QuizVibeLogo` och använder fortfarande de ursprungliga Q-coorderna (cx=40, cy=38, r=13). Shared `QuizVibeLogo`-komponenten shiftade sin Q till (37, 37) för box-centering — they're intentionally decoupled.

**Customized Host packages** (sub-block `usePackagesBlock` inside Game Connections): Basic-utbudet är alltid implicit aktivt (ingen synlig rad) — hosten kan välja till köpta extra-paket via `selectedExtraPackages[]` ovanpå. `PURCHASED_PACKAGES` (i `src/utils/mockPurchasedPackages.ts`) är hardcodad mock filtrerad genom Profile:s `enabledHostPackages` → `availablePackages` (se "Customized Host packages (Profile-toggle → Lobby-filter)" ovan).

Layouten under "Customized Host packages"-rubriken (i ordning):

1. **Generic + Activate Extra package-rad** (`packageActionsRow`, host-only) — två-knapps-rad direkt under rubriken. Generic vänster (50% bredd, grön/grå beroende på selection), "Activate Extra package" höger (50% bredd, guld/grå PREMIUM-badge beroende på `hasPremium`; ersatte "+ Add Host packages"-Store-CTAn 2026-07-07 — paket ingår i Premium). Se "Generic + Activate Extra package-rad" ovan för detaljerad logik.
2. **Yttre svart container** (`extraPackagesWrapper`, `Colors.background`-bg, padding 3 horisontellt + top, paddingBottom Spacing.xl, gap 4, Radius.md, 1px Colors.border — geometrin matchar `modeToggle` förutom asymmetrisk paddingBottom).
3. **Sub-rubrik-rad** (`extraPackagesHeadingRow`) inom wrappern: text vänster + "Select all"-grupp höger. Heading-texten är "Packages available for you:" för host och "Packages for this lobby selected by the Host:" för icke-host. "Select all"-gruppen renderas **endast för host**; switchen kör `handleToggleAll` som sätter `selectedExtraPackages` till tom eller alla `availablePackages`-id:n.
4. **Empty state** — host: om `availablePackages.length === 0` rendras `<Text>` "No Extra packages purchased". Icke-host: om hosten inte aktiverat något paket (filtrerade listan tom) rendras "No extra packages active in this lobby".
5. **Paket-rader** (`purchasedPackageRow`, sorterade alfabetiskt via `localeCompare` med `numeric: true`): host ser hela `availablePackages`-listan, icke-host ser endast paket vars id finns i `selectedExtraPackages` (filtrerade innan sort). Layout per rad: info-ikon → bordered text-box (`purchasedPackageBox`, `width: 204`) → Switch (host-only, `marginLeft: 'auto'`). Box off-state = grå `borderStrong` + transparent + `textSecondary` text. Box on-state = `Colors.primary` border + `Colors.cardElevated` bg + vit text. För icke-host används alltid on-state-stilen.

**Switch alignment math (empiriskt)**: `connectionRow` har `paddingRight: 18`; package row (`purchasedPackageRow`) har `paddingRight: 4`; `extraPackagesHeadingRow` har `paddingRight: 0`. Trots olika värden landar alla switchar på samma x-position visuellt — wrapper:s 4px border+padding-inset + box:ens egna paddings förskjuter saker så empirisk justering krävs (matematiken stämmer inte exakt).

**Status-pill width sync**: `statusPillDisabled` och `youtubeEnabledPill` delar `minWidth: 80` + `alignItems: 'center'` så Enabled/Disabled-pillar på YouTube- och Profiles & Places-raderna får samma bredd. `connectionLabel.minWidth` is sized to fit the **widest** label ("Profiles & Places") so both pills start at the same x-position regardless of which label is rendered. Profiles & Places använder samma `youtubeEnabledPill` + `freeBadgeSmall`-mönster som YouTube för Enabled-tillståndet (FREE-badge skär kantlinjen).

**FREE-badgen är alltid synlig** på YouTube- och Profiles & Places-pillarna (oavsett om de är Enabled eller Disabled) eftersom funktionerna ingår gratis. I Disabled-läget appliceras `freeBadgeSmallGrey` + `freeBadgeSmallTextGrey` på badgen så den dämpas till grått — `statusPillDisabled` har därför `position: 'relative'` så badgen kan sticka upp över kantlinjen även där.

**Minst en Game Connection-källa måste alltid vara aktiv** (YouTube eller Profiles & Places) — utan källa finns inget underlag att hämta frågor från. `handleToggleSource` i `LobbyScreen.tsx` blockerar avstängning när `enabledSourceCount === 1` och visar Alert "Minimum 1 Game connection source needs to be enabled." Switchen återställs visuellt eftersom setter:n aldrig anropas.

## Lobby — Room card

The room-code Card (`roomCard`) is laid out very differently for host vs guest. Both share the absolute-positioned QuizVibeLogo in the upper-left:

- Logo: `<QuizVibeLogo size={104} />` wrapped in `roomCodeLogoWrap` with `position: 'absolute'`, `top: -Spacing.sm`, `left: -Spacing.sm` — pinned to the Card's padding-edge top-left corner. Same size as Home's brand logo.
- Room code rendered as 6 cells (2 leading letters + 2 digits + 2 trailing letters, e.g. `AB23XY`) using the **same filled-cell styling** as JoinModal's `codeCellFilled` (`Colors.primary` border + `Colors.primaryMuted` bg). Hyphens at every letter/digit-transition (after cell 1 and after cell 3) are separate `<Text style={styles.roomCodeCellDash}>–</Text>`-element (display: `AB-23-XY`). Iterates raw `roomCode.split('')` — canonical form has no hyphens.

**Host layout**: hostBadge ("👑 You are the host") at top, then "Room Code" label (small overline) + cell row in the row stack, then Share-invite button. Standard stacked layout in flow.

**Non-host layout** (gäller både guest och registrerad icke-host som joinat via kod) — empiriskt pixel-tuned:

- **"You are invited"-badge** ovanför "Room Code" (`guestInvitedBadgeWrap` → `guestInvitedBadge` → `guestInvitedBadgeText`). Pill-styling speglar `hostBadge`/`hostBadgeText` exakt (primaryMuted bg + primaryBorder + xs-font + primary-färg) så host- och guest-vyn känns visuellt lika på sin identitets-rad. Wrap absolut-positionerad `top: 6`, `alignItems: 'center'` så pillen krymper till sitt textinnehåll.
- "ROOM CODE" label uses `roomLabelGuestAbsolute` — `FontSize.xxl` (24), letterSpacing 1.2, **absolute-positioned** at `top: 39`, `left: 0`, `right: 0`, `textAlign: 'center'`. (Var tidigare `top: 27` aligned mot logo-mitt vid y≈41; flyttad ned till 39 för att skapa luft mellan badge och label, badge+label är nu primär visuell stack ovanför cellerna istället för att labelen "går genom" loggan.)
- Label is **horizontally centered** in the card (textAlign center on full-width absolute Text) — NOT aligned with the logo's horizontal center. Earlier iteration tried that and Peter rejected it.
- `roomCodeRowGuestSpacing: { marginTop: 64 }` on the row so the cell row clears the logo's lower portion. (Höjt från 52 i takt med label-flytten ovan så label↔cells-relationen bevaras.)
- No "Share invite" button.

`formatRoomCode(code)` from `src/utils/roomCode.ts` inserts hyphens at each letter/digit-transition ("AB23XY" → "AB-23-XY"). **Display-only** — storage (AsyncStorage invites, navigation params) and comparison still use the canonical 6-char form. Used by the OS share message and the Home Waiting-Invites list. The cell-based room-code display in Lobby splits the raw code char-by-char, so it doesn't call `formatRoomCode`.

## Custom CodeKeyboard (`src/components/CodeKeyboard.tsx`)

Custom in-app keyboard som ersätter system-tangentbord på flera fält. iOS har ingen keyboardType som ger letter-only utan "123"-switch, ingen number-only med samma höjd som default-QWERTY → custom view är enda lösningen för strikt content + ingen layout-jump. Används idag av:

- **Room code-cellerna** i JoinModal — letter-mode på cell 0–1, 4–5; digit-mode på cell 2–3. Mode auto-styras av cell-index via `isLetterCellIndex`. Charset = `LETTER_CHARSET` (24 bokstäver, exkl. O/I) + `DIGIT_CHARSET` (0–9). Ingen `onModeToggle` — inget knapp-byte behövs.
- **PlayerName-fältet** i guest-formen OCH register-formen — fri-text-input med både letter och digit. Charset = fullt 26 A–Z + 0–9. `onModeToggle`-callback skickas in → renderar `'123'`/`'ABC'`-toggle-knapp bredvid Backspace i botten-raden.

**Props**:
- `mode: 'letter' | 'digit'` — styr aktuell vy.
- `onPress(char)` — tecken-tap.
- `onBackspace()` — backspace-tap.
- `letterCharset?: string` — override default `LETTER_CHARSET`. För PlayerName: `"ABCDEFGHIJKLMNOPQRSTUVWXYZ"`.
- `onModeToggle?: () => void` — om definierad, render mode-toggle-knapp i botten-raden bredvid Backspace. Utelämnad → bara Backspace.
- `modeToggleDisabled?: boolean` — när true dimmas toggle-knappen och tap blir no-op. Används av PlayerName-flöden där digit-mode är låst tills letters-sektionen har minst 1 tecken — knappen renderas fortsatt för stabil layout men signalerar visuellt att letters måste komma först. PlayerName-formerna sätter även toggle-handler:n att flytta fokus till motsvarande TextInput (split-field UI: letters → letters-input, digits → digits-input).

**Layout-detaljer**:
- Container-höjd är dynamisk från antal letter-rader (`Math.ceil(letterCharset.length / LETTER_COLS)`) — så mode-toggle behåller samma totalhöjd när rader byter (digit-grid stretchas via `flex: 1` på rader). 26 letters i 6 cols → 5 rader (sista har Y/Z + 4 osynliga `keySpacer`-celler för grid-justering).
- TextInputs sätter `showSoftInputOnFocus={false}` — system-tangentbord kommer aldrig fram.

**Code-cell-specifik logik** (gäller bara JoinModal:s code-cells, inte PlayerName):
- **Sekventiell focus**: `handleCellFocus(i)` snäpper fokus till "next-empty cell" (eller sista cellen om alla fyllda så backspace fungerar därifrån). Användaren kan inte tap:a en disallowed cell — markören snäpper tillbaka. Forward = type tecken (auto-advance via `handleCodeCellChange`), backward = backspace (auto-retreat).
- Backspace-knappen i CodeKeyboard:n: tom cell → flytta fokus + töm föregående; ifylld cell → töm sig själv.

`roomCode.ts` exporterar `isLetterCellIndex(index)` (cell 0–1, 4–5 = letter; cell 2–3 = digit) som driver per-cell-sanitize och keyboard-mode. `isBlockedLetterPair(pair)` används av `handleCodeCellChange` för att stoppa manual entry av samma par som `BLOCKED_LETTER_PAIRS`-genereringsfilter blockerar — visar Alert "Combination not compliant — Please re-enter" och avbryter ändringen (cell behåller tidigare värde, ingen auto-focus-shift). Två oberoende checks: leading-paret (cell 0–1) valideras när någon av dem ändras och båda är fyllda; trailing-paret (cell 4–5) valideras separat på samma sätt — så även edge-case:t där användaren går tillbaka och ändrar en redan ifylld cell fångas i båda paren.

**Room code blocklists** (gäller både generering OCH manual entry):
- `BLOCKED_LETTER_PAIRS` — appliceras på BÅDA bokstavsparen (leading cell 0–1 och trailing cell 4–5). Innehåller generella obscena/diskriminerande förkortningar (AS, CP, KK — delas med `playerName.ts`), hat-symbol-förkortningar (SS, NS, AH, HH) samt borderline-fall (NB). Listan är medvetet kort — <2% av 576 möjliga par blockas så false-positives på legitima koder förblir minimala.
- `BLOCKED_DIGIT_PAIRS` — 14, 18 (vit-supremacist-koder), 69, 88. 14/18 var tidigare omöjliga eftersom 1 saknades; nu inkluderat eftersom DIGIT_CHARSET utvidgats till fullt 0–9 (för CodeKeyboard).

## Lobby — TopUserBanner actions (leave & delete)

Bannern är roll-beroende i Lobby (`src/screens/LobbyScreen.tsx`):

- **Host** (hostMode=true): tap → `hostDeleteSheetVisible` Modal med röd "Delete this Game Lobby"-knapp + Cancel. Knappen → Alert "Delete this Game Lobby?" → Yes anropar `deactivateRoom(roomCode)` (tar bort från `mockActiveRooms`), visar **loading-overlay** med "Please Wait — Deleting this Lobby" + animerade våg-prickar (`<WaveDots />`-komponent inline i samma fil) i 1.6s, sedan `router.replace('/')`. **Viktigt**: `setDeletingLobby(false)` MÅSTE anropas explicit innan navigation — Stack-navigatorn kan bevara Modal-state över route-replace, så utan dismiss hänger overlay:n kvar över Home.
- **Non-host** (oavsett guest eller registrerad): tap → `guestLeaveSheetVisible` Modal med röd "Leave Game Lobby — Go to Home"-knapp + Cancel. Knappen → Alert "Leave this Game Lobby?" → Yes sparar **full snapshot** av spelaren via `addLeftPlayer(roomCode, snapshot)` (id, name, emoji, type, age, assistance, hcpComplete, approved) → `router.replace('/')`. Sheet-headern visar dynamiskt avatar+namn+status från `players.find(p => p.id === ownPlayerIdRef.current)` — guest får "Guest", registrerad får "Player".
- Efter D-0 (bottom tab-bar borttagen) finns ingen direkt-link till Profile från Lobby. Host:s väg till profil-hantering är via Home → TopUserBanner-login-pill → "Profile settings".

**Non-host detection of room deletion**: useEffect:en (gating på `!hostMode`) initial-check + 2s polling-interval anropar `isActiveRoom(roomCode)`. När den blir false sätts `roomDeletedDetected=true` → separat useEffect triggar Alert "Game Lobby deleted / This Game Lobby has been deleted by Host" med `cancelable: false` → OK → `router.replace('/')`. Polling istället för event-driven eftersom mockstoren saknar event-bus; ersätts med WS/SSE-prenumeration när backend kommer in.

**`hasLeft` orphan injection** (i `useFocusEffect`): efter att ha mappat över befintliga `players[]` och applicerat `hasLeft` på matchande id:n, läggs alla `LeftPlayerSnapshot` som INTE redan finns i listan till som nya `LobbyPlayer`-objekt med `hasLeft: true`. Detta krävs för att en NY user (t.ex. guest B) som joinar samma rum efter att en annan user (guest A) lämnat ska se A:s gråa "LEFT THIS GAME LOBBY"-kort — A finns inte i B:s SEED-baseline. Snapshot:en bär `approved`-flaggan så kortet hamnar i rätt sektion (Approved / To be Approved by Host).

## Lobby — Players in Lobby

Non-host gets a **read-only view** of the player list:

- Section hint changes by mode: "Turn order — top plays first. Use ↑↓ to reorder." (host) → "Playing order — selected by Host" (guest).
- `PlayerRow`'s up/down arrow buttons (`turnArrows` block) are gated on **handler presence** — if neither `onMoveUp` nor `onMoveDown` is passed, the entire turnArrows block is hidden. `LobbyScreen` passes `undefined` for both handlers when `!hostMode` (and även för spelare med `hasLeft: true`). The turn-number badge stays visible.

**Auto-add joining player** (`useEffect` i `LobbyScreen.tsx`): non-hosts inserts into players list immediately on lobby entry as `approved: false`, så de syns i "To be Approved by Host"-sektionen direkt — no separate waiting screen.

- `asGuest=true` + `guestName` (Guest-form path): inserts as `type: 'guest'` from form params, `id = guest-${Date.now()}`.
- `!hostMode` utan guest-form-params (code-only join): loads `loadProfile()` och inserts as `type: 'registered'` from profile (name, avatar, age, assistance), `id = joiner-${Date.now()}`. Falls back to "You" / 👤 / `type: 'guest'` om profil saknas.

**Deps på URL-params + state-reset (kritiskt)**: useEffect:en deps är `[code, guestMode, guestName, guestBirthYear, guestAssistance, hostMode]` — INTE `[]`. Stack-navigatorn kan återanvända samma component-instans över transitions (t.ex. `host → home → join som guest`). Med `[]`-deps re-fyrade aldrig auto-add när params bytte → nya identiteten lades aldrig in. Effekten reset:ar även `setPlayers(SEED_PLAYERS)` + `ownPlayerIdRef.current = null` i början av varje run så ingen state ärver över.

**`mergeProfileIntoHost` gating**: i `useFocusEffect` är merge:n gated på `hostMode && profile && p.isHost` — INTE bara `profile && p.isHost`. När non-host joinar ska seed-host:en Alex K. visas oförändrad, INTE få den nuvarande user:s profil-data tilldelad (annars ser det ut som att joinaren är host eftersom HOST-badge:n + ens egen avatar/namn syns på det kortet).

**`PlayerRow.hasLeft` rendering**: när `hasLeft: true` får kortet neutral grå border (override:ar approved/waiting-färgerna), avatar dämpas, namn/HCP-rad i `textDisabled`, status-raden ersätts med "LEFT THIS GAME LOBBY"-text, approve-toggle och move-arrows döljs. Host-spelaren får ALDRIG `hasLeft` (defensiv guard i useFocusEffect — host kan inte lämna sin egen lobby).

**Section header**: räknaren renderas på två rader, högerställd i headern intill "+ Add Player"-knappen. Övre rad "Approved:" (textSecondary, `FontSize.xs`); undre "{x} of max {y}" (primary, `FontSize.sm`). x = `approvedPlayers.filter(p => !p.hasLeft).length` (host räknas alltid som approved via `isPlayerApproved` + lämnade spelare frigör platsen). y = `maxPlayers` (host:s 4/12-cap, inte `players.length`). Stack:n centreras gentemot varandra via `alignItems: 'center'`.

**ApproveToggle använder standard React Native `Switch`** ([src/components/ApproveToggle.tsx](src/components/ApproveToggle.tsx)) med samma styling som Game Connections-raderna (röd/grön track, vit thumb, scale 0.8). Behåller `'no' | 'yes'`-API:t internt så call sites är oförändrade. Den tidigare custom Yes/No-svep-pillen är borttagen.

**PlayerRow card layout** (host-vyn, uppdaterad 2026-05-25):
- **Topp-rad**: turnColumn (Pass-the-Phone) + avatar + info (namn + ev. "Missing info"-status) + approve-toggle (BARA för waiting-cards = `!approved`). Toggle:n pinnas mot kortets översta kant via `toggleSlot { alignSelf: 'flex-start' }` så den hamnar i övre högra hörnet. För approved non-host är toppe-raden ren från toggle — frigör hela övre raden så PlayerName-texten har mer horisontellt utrymme innan ellipsering.
- **Botten-rad** (`hcpRow`): två flex-slottar — meta vänster (`hcpRowLeft, flex: 1`) med editability-pillar, trash/toggle höger (`hcpRowRight, flex: 1`).
- **Meta-pillar** (vänster slot): "Assistance Level" och "Age N" renderas som två separata blå-bordered pillar via `hcpPillRow` + `hcpPill`-styles (`Colors.primary` border + 8/2 padding + radius 4). Tappable via parent Pressable som öppnar samma player-edit-modal som tidigare. Signalerar editability-affordance jämfört med tidigare plain-text-version.
- **Höger slot** är mutually-exclusive mellan trash och toggle:
  - **Waiting non-host** (approved=false): delete-trash visas i höger slot. Toggle finns uppe.
  - **Approved non-host** (approved=true): approve-toggle visas i höger slot istället (delete renderas inte för approved). Ingen toggle uppe.
  - **Host:s eget kort**: tom höger slot — host kan varken radera sig själv eller approva sig själv.
- **HCP visas som SKÖLD** på spelarkortet (2026-08-28) — `hcp`/`hcpNotDefined`-props → `<HCPShield size={40}>` bredvid avataren (viewerns egen rad = intjänat HCP via `selfHcp`, andra spelare = deras synkade `player.hcp` via lobby_players.hcp/0042, fallback 99; gäst = "Not Defined"). Se "Dynamic HCP System" → "Lobby cross-player HCP-sync". Den tidigare TEXT-HCP-badgen (borttagen 2026-05-21) kom aldrig tillbaka.
- **"Ready"-status borttagen** för alla spelare. Endast `!player.isReady` (= "Missing info" warning) eller `hasLeft` (= "LEFT THIS GAME LOBBY") renderas — i alla andra fall är status-raden helt tom (en redo spelare är default-läget).

**Papperskorgs-knapp** (host-only, `onDelete`-prop på PlayerRow): grå (`Colors.textSecondary`) trash-SVG i botten-radens höger-slot, visas bara på rader i waiting-listan (mutually exclusive med approve-toggle i samma slot för approved-cards). För approved-spelare måste host först toggla tillbaka till No så kortet hamnar i waiting-listan igen och papperskorgen syns. Tap → `Alert "Remove player — Are you sure you want to delete this Player from this Lobby?"` → confirm filtrerar bort spelaren ur `players[]` OCH anropar `markEjected(roomCode, id)` så non-host:s polling triggar "User have been removed from this lobby"-popup → Home navigation. Pressed-feedback `Colors.borderStrong` (subtil grå highlight). Hide:s när `hasLeft: true` — left-spelaren är redan borta som aktiv part.

## Lobby — + Add Player

[src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx)'s `AddPlayerModal` speglar Home-skärmens Join-as-Guest-flöde 1:1 minus Room Code-steget. Innehåller:

- Player Name med custom `CodeKeyboard` (fullt A–Z + 0–9, mode-toggle), inline `Check`-knapp + `Remove`/`Auto-generate`-rad + status-meddelanden (✓ available / ✗ taken / ✗ inappropriate language). Auto-fill vid open via `generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, 'Guest')`.
- Year of Birth (drop-down picker med "or earlier"/"or later"-suffix på endpoints) — låst tills Player Name validerat.
- Assistance level (Full/Standard/Minimal-knapprad), default `'standard'` — låst tills Year valt. "Use default or select prefered setup"-hint ovanför.
- Submit "Add to Lobby" enable:as bara när formuläret är giltigt (Player Name available + Year valt).

**`TAKEN_PLAYER_NAMES_LOBBY`** är en lokal mock-Set (samma värden som hemskärmens `TAKEN_PLAYER_NAMES` i `app/index.tsx`). Används som snabb första lokal check. Den riktiga uniqueness-checken sker via `lookupEmailByPlayerName` (Supabase RPC) som körs async efter lokal validering godkänt — se "Async Supabase uniqueness-check" ovan. `validateAddPlayerName` tar dessutom `existingNames?: Set<string>` som skickas in från call-siten med alla aktiva lobbyspelares namn (case-insensitive) — förhindrar dublett mot host eller annan spelare i lobbyn.

**Single player → knappen renderas inte alls (rev 5, 2026-08-26).** "+ Add Guest" är gatad på `!isSingleLobby` — en Single-lobby är låst till EN spelare, så det finns inget att lägga till. `handleOpenAddPlayer` behåller en defensiv guard som Alert:ar **"Single player lobby"** ("This lobby is locked to one player. Start a Multiplayer Game from Home to play with others.") och returnerar; grenen ligger FÖRST efter rematch-guarden, före både "Own device required" och capacity-checken.

⚠ **Den tidigare "Change to Multiplayer mode?"-popupen (2026-08-24) är BORTTAGEN** — den var en bakväg förbi låsningen. Med den fanns tre knappar (Pass-the-Phone / Individual device / Cancel) som bytte `gameMode` mitt i lobbyn. Återinför den inte: lägesbyte sker numera bara genom att radera lobbyn och välja på nytt på Home. `ALERT_TO_MODAL_DELAY_MS` (350 ms) fanns bara för att den popupen presenterade en RN `<Modal>` från en Alert-callback och är därför också borttagen ur LobbyScreen — behöver du mönstret igen, se `MODAL_SWAP_DELAY_MS` i [app/index.tsx](app/index.tsx).

**Spegelbilden på join-sidan är också stängd** (2026-08-24): en spelare som försöker joina en single-player-lobby via rumskod blockeras av `checkSinglePlayerLobby` i alla tre join-vägarna — se "Single-player-gate" i mockActiveRooms-sektionen ovan.

**Capacity-check** sker i två lägen:
- **Vid + Add Player-knappens onPress** (`handleOpenAddPlayer`): `isLobbyAtCapacity()` (= `players.filter(p => !p.hasLeft).length >= maxPlayers`) → om full visas Alert direkt och modalen öppnas inte. Skyddar host från att slösa tid på att fylla i formuläret.
- **Vid Confirm i formuläret** (`handleAddPlayer`): samma check körs igen som race-condition-skydd om någon joinar via room code mellan knapp-tryck och confirm.

Båda Alert:ar visar samma text: `Alert.alert('Lobby is full', 'Lobby is already full with waiting and approved players. Remove players if to add others')`.

## Lobby — Player edit (host-only)

Host kan redigera **Assistance level**, **Competition Year of Birth** och **HCP** på valfri spelare i lobbyn (inkl. sig själv). Tap-targets: HCP-meta-raden ("Standard · Age 32") OCH HCP-badgen — båda öppnar samma `playerEditSheet`-modal i [src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx). För guests är HCP-badgen istället ett tap-mål för en separat "Guest HCP cannot be changed"-popup (`onGuestHcpTap` på `PlayerRow`).

**Lobby-lokal scope via `lobbyEdited`-flagga** (`LobbyPlayer.lobbyEdited?: boolean`): inga skrivningar går till `saveProfile()` från detta flöde — alla uppdateringar är `setPlayers(...)` mot lokal lobby-state. Skyddet mot att profil-merge clobbar lokala redigeringar:

- `mergeProfileIntoHost` bailar tidigt om `existing.lobbyEdited === true` och uppdaterar bara avatar/playerName (fält som inte exponeras i edit-modalen). Annars skulle host:s redigeringar av sitt eget kort återställas vid varje `useFocusEffect`-merge när host återvänder till lobby-tabben.
- För non-host registrerade spelare körs ingen merge alls (deras profil-data kommer från URL-params vid join), så `lobbyEdited` är där bara informativt.
- Flaggan persisteras inte över sessions — när lobbyn lämnas/raderas är hela lobby-state borta.

**Validation-regler** (alla med popup vid försök):

1. **HCP** kan endast sänkas, inte höjas. Originalet hämtas från `target.hcpOverride ?? calculateInitialHCP(target.age, target.assistance)` (pre-edit-värde via `playerEditTarget` som inte muterats förrän Save). Vid `parsed > originalHcp` → `Alert "Cannot raise HCP — HCP can only be lowered, pick a value of {N} or less."` Stå-still tillåtet.
2. **HCP-floor** = `MIN_HCP = 50` (export från [src/utils/hcp.ts](src/utils/hcp.ts)). Vid `parsed < MIN_HCP || parsed > 99` → `Alert "Invalid HCP — HCP must be a number between 50 and 99."`. Edge case: om en spelares `originalHcp < 50` (från progression) blir HCP de facto låst för host-edit — alla värden träffar antingen floor:n eller cannot-raise-regeln.
3. **Assistance** kan numera (2026-06-01) sättas FRITT av host till valfri nivå (Full/Standard/Minimal) — både lättare och svårare riktning från spelarens default. Den tidigare en-vägs-låsningen (`full→standard→minimal`, `Minimal låst`) med tap-/save-tid-Alerts + `skillBtnLocked`-dimning är borttagen; `handleSelectEditAssistance` sätter bara state. (`skillBtnLocked`/`skillBtnTextLocked`-stilarna kvar som död CSS.)
4. **Age** kan endast höjas (= tidigare birth year). Vid `nextAge < originalAge` → `Alert "Cannot lower age — Age can only be raised, pick an earlier Year of Birth."`. Stå-still tillåtet. Year-pickern dim:as inte (för långt list); validation enbart vid Save.

**Guest HCP** är aldrig direkt redigerbart (`hcpOverride` på guest:er sätts ALDRIG till ett konkret värde — sätts alltid till `undefined` i save-handlern). Assistance + Year är fritt redigerbara för guests via samma modal.

**Player-edit-modalens HCP-FÄLT parkerat (2026-05-25):** ⚠ gäller BARA host:s HCP-redigerings-input i denna modal — själva HCP-systemet + sköldarna är LIVE (se "Dynamic HCP System"). Både HCP TextInput-fältet (för icke-guests) OCH "Guest HCP is auto-calculated..."-noten har tagits bort från player-edit-modalen. Edit-modalen visar nu bara Year of Birth + Assistance Level. handleSavePlayerEdit:s HCP-validering (rad ~1885-1920), `editHcpValue`-state och `MIN_HCP`-import lämnas kvar som dead code för enkel v2-reaktivering utan ny implementation — när HCP-progression byggs ut kan UI:t återinföras genom att un-comment:a TextInput-blocket.

## HCP utility ([src/utils/hcp.ts](src/utils/hcp.ts))

⚠ Det här är BAS-helpers. Den LIVE spelar-progressionsmotorn (sliding-window ±1, decay, display) bor i [hcpEngine.ts](src/utils/hcpEngine.ts) + [hcpProgress.ts](src/utils/hcpProgress.ts) — se "Dynamic HCP System" nedan.

- **`MIN_HCP = 50`** — floor för guest-auto-derivering (`getGuestHcpFromClosestAge`) OCH host:s manuella `hcpOverride`-redigering. Gäller INTE Player-HCP-progressionen — den kan nå ända till 1 via sliding-window-motorn.
- **`roundHcp(value)`** — wrapper kring `Math.round` (närmaste heltal, 0,5 uppåt). OBS: Player-HCP:s DISPLAY avrundas i stället UPPÅT (`Math.ceil`) via `displayHcp` i hcpEngine.ts (§1.2.3).
- **`calculateNewHCP`** (poäng-baserad reduktion) är **SUPERSEDED 2026-08-28** av sliding-window-motorn och anropas inte längre. `getStartingHCP`/`getEraRange`/`applyAgePenalty`/`getHCPColor` är parkerade (nollställda call-sites). `calculateInitialHCP` används fortfarande — men ENBART inuti `getGuestHcpFromClosestAge` som referens (INTE för Player-HCP-seeding; alla startar på 99).
- **`getGuestHcpFromClosestAge(guestAge, registeredPlayers)`** — guest:s dolda HCP-värde:
  - **>1 registrerad** → HCP hos den vars `age` ligger närmast guest:ens (tie-break på array-ordning, typiskt host eftersom host är index 0).
  - **Endast en registrerad** (typiskt host ensam) → `roundHcp((refHcp + 100) / 2)`. Med en enda match-kandidat blir närmaste-age-algoritmen meningslös; midpoint mot 100 biasar guest:en mot nybörjar-änden istället.
  - Resultat clampas till `[MIN_HCP, 99]` — guests får aldrig "för bra" HCP oavsett referens.
  - Returnerar null om inga registrerade spelare alls.
  - Visuellt visar guest-kort ALLTID "Not Defined"-sköld (utan siffra, `HCPShield notDefined`) — det härledda värdet är dolt för spelarna och konsumeras bara av spel-logik som behöver det.

## Dynamic HCP System (LIVE sedan 2026-08-28)

⚠ **UPPDATERAD 2026-08-31 — HCP är nu 4 värden PER REGION SCOPE.** Delar av beskrivningen nedan (skriven för den enkelvärdes-modellen) är historik; mekaniken (sliding-window, decay, filter) är oförändrad men körs nu PER KATEGORI och nyckeln bär en region-segment. Det som ändrades:
- **Fyra HCP per spelare**: Total + Music + Film + Sport. **Total = SNITTET av de tre kategorierna** (härlett, aldrig lagrat). `HcpProgress` i [hcpEngine.ts](src/utils/hcpEngine.ts) är nu `{ categories: Record<MainCategory, CategoryProgress> }`; varje `CategoryProgress` har eget `hcp`+`windows`+`lastPlayedISO`. `applyGameResult(progress, category, level, answers, nowISO)`, `totalHcp`, `resolveDisplayTotalHcp`, `resolveDisplayCategoryHcp` (alias `resolveDisplayHcp` behållet). 31 tester.
- **Keyat per region scope**: persistens-nyckeln bumpad till `@quizvibe/hcpProgress/v2/<region>/<playerName>` ([hcpProgress.ts](src/utils/hcpProgress.ts)). En spelare som spelar en region scope hen ALDRIG spelat startar på **99** i alla kategorier. Region når spelet via ny `region`-quiz-param (LobbyScreen → quiz; DbRegion lowercase, V1 alltid `'sweden'`; v1-nycklarna orphanas). Guest = sessions-lokal `Map<region, HcpProgress>`.
- **Item-difficulty-filtret använder per-KATEGORI-HCP** (en Music-fråga filtreras mot spelarens Music-HCP). `filterPoolByCategoryHcp` i [quiz.tsx](app/quiz.tsx) partitionerar poolen på `mainCategory` och kör den oförändrade `filterByItemHcp` per delpool. Item-HCP mäts fortfarande INTE — `itemHcp` är katalogens `probability` (Peter: bygg ingen mät-motor än; bara region-scaffold + per-kategori-filter).
- **Profil-spegel**: `profile.hcp` = Total (för lobby-kolumnen + legacy-läsare), NYTT `profile.hcpByCategory = { region, total, music, film, sport }` (senast spelade region) så sköldarna läser alla 4 synkront via `getCachedProfile()`.
- **Cross-player**: `PlayerHcpChangedPayload` (syncChannel.ts) fick optional `categories` (per-kategori after+delta), så alla enheter ser varandras kategori-sköldar + förändring i leaderboarden. IndDev broadcastar self:s bundle; PtP-host relayar allas till spectator. Kategori-kolumner på `lobby_players` (`hcp_music/film/sport`) via **migration `0050_lobby_players_hcp_categories.sql`** (targeted UPDATE, tolerant vid ej-applicerad → publicerar bara Total, kategorier faller till 99). Applicera manuellt via SQL Editor.
- **Sköld-UI** ([HCPShield.tsx](src/components/HCPShield.tsx)): `HCPShieldCard` = sköld i ruta (kant = tier-färg), etikett-badge (Total/Music/Film/Sport, kategori-badgar guld+svart som GetReady-badgen) på boxens NEDRE kantlinje, `deltaBadge` (0/-x/+y, grön=bättre/röd=sämre) i övre HÖGRA hörnet. Ljus tier-tint-fyllning per sköld. **Flagg-badgen (`regionFlag`) är BORTKOPPLAD överallt** (prop + `regionFlagEmoji` finns kvar i HCPShield men skickas från INGEN call-site — ska ev. visas bara när spelaren bytt region scope från registrerings-defaulten). **Profil**: Total-sköld + "HCP per category"-rad (fält-label-font) med "+"/"−" som fäller ut Music/Film/Sport i full-bredds-rad. **Lobby PlayerRow**: Total-sköld bredvid avataren; kategori-sköldarna fälls ut med "Details"-toggeln i en EGEN full-bredds-rad under meta-raden. **Leaderboard** ([LeaderboardTable.tsx](src/components/LeaderboardTable.tsx)): "+" bredvid "HCP N (delta)"-raden öppnar en **popup** (guld kant) "{avatar} {namn} / HCP progression" med de 4 sköldarna — separat från tabellen så kolumnerna aldrig påverkas. Profil-avatar renderas nu som `<Avatar>` före namnet i tabellen + popupen; långa PlayerNames wrappar (2 rader; leaderboard-raderna högre via `ROW_H`). I PlayerRow/leaderboard-namn bryts formatet `[Letters]-[Digits]` vid bindestrecket (bokstäver+"-" rad 1, siffror rad 2, vänsterjusterade).

⚠ **HCP är INTE längre parkerat.** Den elastiska 1–99-skalan (1 = elit, 99 = nybörjare) är byggd och inkopplad. Äldre CLAUDE.md-/memory-noter som säger "HCP parkerat / ute ur launch-scope / introduceras i v2 / placeholder till Fas 6" är STALE för spelar-progressionen — de gäller bara de delar som listas som **Uppskjutet** sist.

**Peters designbeslut (2026-08-28):** alla nya spelare startar på **HCP 99** (assistance/ålder-baserat start avfärdat); sliding-window ±1 per assistance-nivå; **fullt 20-svars-fönster** innan första steget, sedan kontinuerligt glidande (max ±1/spel — jämvikten kommer från svårighetsfiltret + §2.2 när Item-HCP landar).

**Ren motor** — [src/utils/hcpEngine.ts](src/utils/hcpEngine.ts) (INGA React/AsyncStorage-beroenden; Date injiceras → deterministisk; enhetstestad i [backend/content/test/hcpEngine.test.ts](backend/content/test/hcpEngine.test.ts), 20 tester):
- `HcpProgress = { hcp: number; windows: Record<AssistanceLevel, boolean[]>; lastPlayedISO: string|null }`. `hcp` lagras som FLYTTAL (decay ger 0,25-steg); DISPLAY avrundas ALLTID UPPÅT (§1.2.3) via `displayHcp` (ceil + clamp [1,99]).
- `HCP_START = 99`, `HCP_WINDOW_SIZE = 20`. Trösklar (fönstersumma S): Full S≥18→−1 / ≤12→+1; Standard ≥16 / ≤10; Minimal ≥14 / ≤8.
- `evaluateWindow` kräver FULLT fönster (20) → ny spelares HCP stabilt ~5 spel. `applyGameResult` = lägg svar i nivåns fönster → utvärdera → max ±1 → klampa → stämpla lastPlayedISO. `applyInactivityDecay` (§2.4: +0.25 per hel 7-dagarsperiod; flyttar lastPlayed fram med HELA perioder, ej till now, så vecko-resten bevaras + ingen dubbelräkning).
- `resolveDisplayHcp(storedHcp)` → `storedHcp ?? 99`, ceil:at. Sköldarnas ENDA display-källa.

**Persistens** — [src/utils/hcpProgress.ts](src/utils/hcpProgress.ts) (epochLedger/hostQuestionHistory-mönstret): nyckel `@quizvibe/hcpProgress/v1/<playerName.toLowerCase()>`, gäst-fallback = sessions-lokal `sessionProgress`. `recordSelfGameResult` (inloggad: decay → game result → save → **speglar profile.hcp**), `recordGameResultForName` (PtP-medspelare per namn, INGEN profil-spegling), `refreshOwnHcpDecay` (decay vid app-open så skölden reflekterar inaktivitet — anropas i ProfileScreen mount), `clearOwnHcpProgress`.

**Player HCP lagras på `profile.hcp`** (AsyncStorage-ONLY, ingen DB-kolumn/migration — se profileStorage.ts-fältkommentaren). ⚠ MEDVETEN deviation från plan-migration `0042`: (a) en upsert som nämner en okörd kolumn failar HELA profil-syncen, (b) fönster-historiken (motorns INDATA) är device-lokal ändå, så att spegla enbart det härledda värdet cross-device vore inkonsekvent. Promotera till `profiles.hcp` först när cross-device-HCP verkligen behövs. Sköldarna läser synkront via `getCachedProfile()?.hcp`.

**Sköld** — [src/components/HCPShield.tsx](src/components/HCPShield.tsx), 4 tiers (Peter): **99–60 grå** (#6B7280), **59–40 blå** (`Colors.primary`), **39–20 brons** (#B08A5A), **19–1 guld** (`Colors.warning`). `notDefined`-prop → gäst-vattenstämpel "Not Defined" (rent kosmetiskt — gästen HAR ett internt HCP via `getGuestHcpFromClosestAge`). Renderas: **Profile** (under avatar+namn, size 64), **PlayerRow** (bredvid avataren, size 40). På spelarkortet ser VARJE viewer sitt EGET intjänade HCP på sin egen rad (`selfHcp = getCachedProfile()?.hcp`), och ANDRA spelares intjänade HCP via lobby_players.hcp-syncen (0042, se "Lobby cross-player HCP-sync" nedan) — fallback 99 för ännu ej progressade / icke-applicerad migration.

**Game-end-motorn** ([app/quiz.tsx](app/quiz.tsx) `phase==='leaderboard' && isLastQuestion`-effekten, deps `[phase, isLastQuestion]`): grundar HCP för DENNA enhets spelare.
- **Pass-the-Phone**: ALLA registrerade deltagare uppdateras på den delade enheten (host via profil-spegling, medspelare via `recordGameResultForName(name)`); alla §5-delta byggs + broadcastas till ev. PtP-spectator.
- **Individual Devices / Single**: bara self; i IndDev broadcastas self:s delta via nytt realtime-event **`player_hcp_changed`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts) — payload + validator + membership-guardat receive + broadcast, mönster som `player_score_recorded`, idempotent på `player_id`) så alla enheters leaderboard visar allas §5-rad.
- Grundar INGET HCP: guest-hostade spel (anonyma), remote (server-finalize), PtP-spectator (svarade inte på denna enhet).
- Attribution: `allRoundScoresHistory` flat, filtrerat på spelarens `playerId`, sorterat på `questionIndex` → `boolean[]`. Nivån = `turnOrder`-radens `assistance`.

**§5 leaderboard** — [LeaderboardTable.tsx](src/components/LeaderboardTable.tsx) renderar "HCP 42 (-1)" i Player-kolumnen (blå `lbNameHcp`), via `RoundLeaderboard`:s `hcpChanges`-prop (var DÖD, nu LIVE — vidarebefordras till de tre current-game-tabellerna, INTE Aggregate-vyn). `MOCK_OPPONENT_HCP_BEFORE` + placeholder-`delta/500`-blocket är BORTTAGET.

**§4.1 Item-HCP-frågefilter (LIVE sedan 2026-08-28):** varje fråga bär `itemHcp` = katalogens `probability` (0–100), exporterat på klienten (`ExportedMusicQuestion`/`ImageQuizQuestion` → `QuizQuestion`; regenerera med `npm run export-music-questions` + `export-image-questions`). ⚠ Peters filter-regel är **`itemHcp >= playerHcp`** ("items från spelarens HCP och uppåt"), INTE spec:ens ursprungliga `[X-9, X]`-fönster. Item-HCP-skalan är 1–**100** (probability), Player-HCP 1–99, så en HCP-99-spelare får items med itemHcp 99 OCH 100.
- **Ren helper** `filterByItemHcp(pool, playerHcp, minCount)` i [hcpEngine.ts](src/utils/hcpEngine.ts) (enhetstestad): behåller items ≥ playerHcp, men RELAXAR golvet nedåt i steg om `HCP_FILTER_STEP` (10) tills poolen har ≥ `minCount` items — annars hela poolen. Relaxeringen är NÖDVÄNDIG: probability toppar ~80–90, så en ny spelare (HCP 99) skulle annars svälta (nästan inga items ≥99). Nettoeffekt: de svåraste (lägst probability) items göms tills spelaren tjänat ner sitt HCP → gradvis upplåsning.
- **Tillämpas** i [quiz.tsx](app/quiz.tsx) `gameQuestions` via `applyItemHcp(pool)` på de tre pool-erna (spotify/pureYoutube/image). `HCP_FILTER_MIN_POOL = 30` (tuning-knopp). Gäller BARA **Single Player + Pass-the-Phone** (individanpassat per §4.1); **IndDev** (delad host-sekvens), **remote** (server-sekvens) och **guest-hostade** spel filtreras INTE. Läser DENNA enhets HCP ur `getCachedProfile()?.hcp`.
- ⚠ **Bootstrap-varning:** eftersom `probability` toppar runt 80–90 relaxar filtret nästan fullt för nybörjare (mest effekt i mellanskiktet HCP ~60–85). Riktig per-generation/per-item-difficulty (§1.2) ersätter probability-bootstrappen senare.

**Lobby cross-player HCP-sync (LIVE sedan 2026-08-28, migration `0042_lobby_players_hcp.sql`):** spelarkortet i lobbyn visar VARJE spelares intjänade HCP, inte bara den egna enhetens. Varje enhet publicerar sitt eget display-HCP (ceil, 1–99) till sin `lobby_players.hcp`-rad via targeted UPDATE (`publishOwnHcp` i [mockLobbyPlayers.ts](src/utils/mockLobbyPlayers.ts), module-wrapper `publishOwnHcpToLobby` i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx), kedjad efter join-upserten på ALLA 3 join-sites + host-effekten — EXAKT samma mönster som `publishOwnAccountAlias`/`account_player_name`). `syncNonHostFields` läser tillbaka `updated.hcp` (via `rowToPlayer`) och mergar in i `players`-state, och PlayerRow-korten använder `player.hcp ?? player.hcpOverride` för andra spelare (self-kortet fortsatt `selfHcp`). ⚠ Kolumnen ingår MEDVETET INTE i `playerToRow`/bulk-UPSERT → en icke-applicerad 0042 degraderar till `console.warn` + fallback till 99, bryter aldrig lobby-join. Gäster + ännu ej progressade spelare (ingen `profile.hcp`) publicerar inget → 99. **Migrationen appliceras MANUELLT via Supabase SQL Editor.**

**Uppskjutet:** §1.2 riktig Item-HCP (per Item×Generation/×Paket, mätt korrekthet), §2.2 viktad HCP-Impact (varje rätt svars fönster-bidrag skalas av frågans HCP; tills dess rått bidrag rätt=1/fel=0), §2.3 host-override-belöning.

**Player-edit-modalen** (host redigerar spelare) har fortfarande INGET HCP-fält — bara Year of Birth + Assistance (se noten ovan). `hcpOverride` är kvar som host-tweak-väg men saknar UI-input; den nya motorn använder den inte.

## Lobby — Share invite (friends-only)

Share invite-modalen i [src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx) skickar **endast** invites in-app till QuizVibe friends. OS-share-fallback (SMS/WhatsApp/Messenger) är borttagen — användaren kan inte längre dela rumkoder externt. Modalen renderar: (1) "Add by Player Name"-rad (TextInput + Add-knapp) som speglar Profile:s friends-modal — host kan lägga till en QuizVibe friend direkt från lobbyn utan att hoppa till Profile, (2) friends-listan (med one-tap "Invite"/"✓ Invited"-knappar) eller empty-state ("No friends saved yet — Add a Player Name above to invite them with one tap."), (3) "Done"-knapp. `QuizVibeFriendsLogo` (size 28) renderas bredvid "QuizVibe friends"-section-labeln för visuell anchor — speglar Profile-skärmens friends-kort-ikon. `handleAddFriendFromShare` anropar `addFriend(playerName)` från [src/utils/friendsStorage.ts](src/utils/friendsStorage.ts) (dedupar case-insensitive på playerName) och re-fetchar listan så nya friend:en dyker upp med en Invite-knapp redo att tappas. KeyboardAvoidingView (iOS-only `behavior="padding"`) wrap:ar modalen så input:en inte täcks av tangentbordet.

**`handleAcceptInvite` guards** (i Home:s `JoinModal`, [app/index.tsx](app/index.tsx)) — körs i ordning innan navigation:
1. **`isActiveRoom(invite.roomCode)`** — om host raderat lobby:n efter att invite skickades: ta bort invite ur listan (`removeInvite` + `setInvites`) + Alert "Lobby no longer available — This lobby has been deleted by the Host." Cleanup först eftersom inviten inte längre är actionable.
2. **`checkSinglePlayerLobby(invite.roomCode)`** (2026-08-24) — host kan ha skickat inbjudan och sedan bytt till single. BEHÅLL invite (host kan byta tillbaka), Alert "Single player lobby". Samma cleanup-semantik som capacity-fallet.
3. **`checkLobbyCapacity(invite.roomCode)`** — om lobby:n är full: BEHÅLL invite (transient — kan frigöras), Alert med Free vs Premium-host-copy. Skiljs medvetet från active-room-fallet i cleanup-semantik.
4. Annars: `removeInvite` + navigate.

## Lobby — Non-host visibility & host→non-host sync

Non-host:s vy ska spegla EXAKT vad host har valt för den specifika lobbyn. Architecture i avsaknad av backend: 3 mock-stores + polling-pattern.

**Polling-arkitektur (2s-interval)** — Lobby-state-mocks saknar event-bus, så non-host:s `useEffect`-baserade syncar kör `setInterval(..., 2000)` med initial sync direkt vid mount. Samma mönster delas av:
- Room-deletion-detection (`isActiveRoom`) → "Game Lobby deleted"-popup → Home.
- Player-eject-detection (`isEjected`) → "User have been removed from this lobby"-popup → Home.
- maxPlayers-sync från `RoomMeta`.
- Player-list-sync från `mockLobbyPlayers`.
- Settings-sync från `mockLobbySettings`.

Host:s sida skriver via `useEffect`-deps på relevant state (gated på `hostMode`). Ingen sync sker andra hållet.

**Cleanup-paritet** — alla 4 lifecycle-cleanup-sites anropar samma cleanup-bunt:
- Lobby:s "Delete this Game Lobby" (host)
- Quiz:s `handleQuitGame` (host mid-game)
- Quiz:s Play Again (`goToNewLobby` med ny kod)
- Home:s `handleCreateGame`

```ts
deactivateRoom(code);          // mockActiveRooms
clearLeftPlayers(code);        // leftPlayers
clearLobbyPlayers(code);       // mockLobbyPlayers
clearLobbySettings(code);      // mockLobbySettings
clearEjected(code);            // ejectedPlayers
clearGameStarted(code);        // mockStartedGames
```

Glöm inte lägga till nya stores här när de skapas — annars läcker stale data mellan sessions med återanvänd kod.

**Synkat per non-host UI-element** (alla deriverade från host-driven state):

| UI | Source-store | Non-host läser |
|---|---|---|
| Approved players list | `mockLobbyPlayers` | `getLobbyPlayers()` (filtrerad till approved/isHost) |
| Game Mode toggle (deriverar maxPlayers PtP=4/IndDev=12) | `mockLobbySettings.gameMode` + `mockActiveRooms.RoomMeta.maxPlayers` | `getLobbySettings()` + `getRoomMeta().maxPlayers` |
| Region Scope | `mockLobbySettings.region` | ↑ |
| Game Era | `mockLobbySettings.eraFrom/To` | ↑ |
| Number of Rounds | `mockLobbySettings.roundsCount` | ↑ |
| Answer response time | `mockLobbySettings.answerResponseSeconds` | ↑ |
| Customized Host packages | `mockLobbySettings.selectedExtraPackages` | ↑ |
| Source × Profession matrix | `mockLobbySettings.{youtubeEnabledCategories,imagesEnabledCategories}` | ↑ |

**Synthetic-host fallback** ([src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx) i non-host:s player-poll): om host saknas i `getLobbyPlayers`-resultatet (test-seed-kod eller fresh kod där host inte hunnit skriva ännu), syntheserar polling en placeholder-rad från `RoomMeta.hostPlayerName`:
- `id: 'synthetic-host'`, `emoji: '👑'`, `type: 'registered'`, `isHost: true`, `approved: true`.
- **`age: 35` (fixed) + `assistance: 'standard'` + `hcpComplete: true`** — fixed (inte random) så HCP-raden inte flickrar varannan poll. Real host-data ersätter raden vid nästa poll efter att host:s write körts.
- Säkerställer att `Assistance · Age · HCP`-raden alltid renderas på host:s kort i non-host:s vy oavsett tajming.

**Initial state för non-host** är `setPlayers([])` (inte `SEED_PLAYERS`). Polling fyller listan från host:s authoritative data + self-injection. Utan denna gating skulle non-host se hardcodade fake-spelare (Sam L., Jordan M., Casey P.) som host inte ens approverat.

**Non-host UI-strip** — host-only-element döljs explicit:
- Header credits-pill (Host Game Credits) — gated på `hostMode`.
- "Use single player mode as default"-checkbox — gated på `hostMode`.
- Bracket + "MULTIPLAYER MODE"-label under Game Mode-toggle:n — non-host får istället `"Game Mode - Multiplayer"` inline i sectionLabel (Typography.overline auto-uppercasar).
- Subtitlar under Region/Game Era/Number of Rounds/Game Connections — gated.
- modeDescription ("Players take turns…" / "Each player plays…") — gated.
- Approve-toggle, trash-knapp, edit-handlers — gated på `hostMode`.
- RoundsRuler:s klammer + PREMIUM-badge — gated på `onPremiumPress`-prop (saknas för non-host = read-only-läge), MEN locked-tickarnas grå-styling behålls så non-host ser host:s rätts-cap.
- **Spotify DJ-raden** — non-host ser en read-only **disabled Switch** (on/off beroende på `spotifyEnabled`) + **connect/disconnect-UI identiskt med Profile settings**: kopplad → tappbar `✓ displayName` (understruken) → disconnect; ej kopplad → "Not connected" + tappbar "Connect Spotify account"-länk. Vid lyckad connect/disconnect skrivs `spotifyConnected` tillbaka via `upsertOwnLobbyPlayer` + lokal `setPlayers`-update → PlayerRow Spotify-badge uppdateras direkt. Switch styling: `trackColor={{ false: '#3C3C3C', true: '#1DB954' }}`, `thumbColor={spotifyEnabled ? '#FFF' : '#888'}`.

**Tre non-host-sync-buggar fixade (2026-06-07)**:
1. **`stepperMax`-clamp effekt** — `useEffect` som clampar `roundsCount` till `stepperMax` är nu gated på `if (!hostMode) return` + `hostMode` i deps-arrayen. Tidigare körde klampningen på non-host:s enhet och satte `roundsCount` till `ROUNDS_MAX_PASS=4` (eftersom `hasPremium=false` + IndDev-check → `stepperMax=4`), vilket överskrev den synkade `roundsCount` från host. Non-host satte roundsCount till 4 trots att host valde 12.
2. **Non-host RoundsRuler `gameModeMax`-prop** — skickar nu `roundsMax` (= `ROUNDS_MAX_INDIV=20` i IndDev) istället för `stepperMax` (= `4` för non-host som har `hasPremium=false`). Tidigare visade non-host:s slider alltid max 4 tick-marks oavsett host:s val. Med `roundsMax` visas rätt tick-range + host:s val syns korrekt i slider:n.
3. **Max 12-rutan aktiv-villkor** — tar bort `&& hasPremium` från `modeOptionPremiumActive`-check. Villkoret är nu bara `maxPlayers === 12` (oavsett `hasPremium`). Tidigare visade non-host:s Max 12-ruta grå "inaktiv"-styling även när host aktivt valt Max 12 (eftersom `hasPremium=false` på non-host:s enhet). `hasPremium` styr fortfarande badge-färgen (guld vs grå) men inte radens aktiv-styling.

**Single-player-toggle ON ejectar non-hosts** — när host bockar i singlePlayerDefault iterar handler:n `players` och anropar `markEjected(roomCode, p.id)` för varje `!p.isHost && !p.hasLeft`, sedan `setPlayers((prev) => prev.filter((p) => p.isHost))` så host:s vy tömmer non-hosts direkt. Non-host:s polling fyrar ejectpopup → Home. Uncheck:n "återanställer" inte ejectade — det är en envägs-action; uncheck:n bara återställer Game Mode till Pass-the-Phone (maxPlayers auto-syncar till 4 via gameMode-deriverings-effekten).

**Eject-detection PRE-sync** — `syncFromStore` i non-host:s player-poll kollar `isEjected(roomCode, ownPlayerIdRef.current)` ALLRA FÖRST. Träff → setPlayerEjectedDetected(true) + early-return. Resten av sync hoppas över så user inte ser approval-listan uppdateras strax innan popup.

**Game-started-detection PRE-sync** — direkt efter eject-checken körs `isGameStarted(roomCode)` + check om self är approved (via `getLobbyPlayers`). Träff + self är **inte** approved → `setStartedWithoutMeDetected(true)` + early-return + popup "Game already started — Host started game without this user" → OK → Home.

Är self **approved** greenas det i stället på `effectiveGameMode` (från `lobby_settings`, inte lokal state):

| Läge | Vad som händer |
|---|---|
| `individual-devices` | `goToQuizAsNonHost()` direkt |
| `pass-the-phone` | Alert **"Host has started the Game / Play on the Host device. Keep the live leaderboard on this phone so you can join a re-match afterwards."** → **Follow leaderboard** = `goToQuizAsNonHost()`, **Not now** = Home. ⚠ Follow är FÖRVALT — se noten vid prompten. |
| `remote-1v1` | Now/Later-modal (48h-fönstret) |

`goToQuizAsNonHost()` är en lokal helper i `syncFromStore` som **delas av PtP-promptens Yes och IndDev-grenen** — båda behöver identiska `/quiz`-params (host:s settings ur `lobby_settings` + hela turnOrder ur `lobby_players` + `selfPlayerId`). Lägg nya params där, inte på ett av anropen.

⚠ `navigatedToQuizRef.current = true` sätts **innan** PtP-Alerten visas. 2 s-pollen plus realtime-tick:en skulle annars stapla en ny popup varannan sekund. Samma once-guard som remote-grenen.

**Scroll-to-top vid lobby-entry** — `mainScrollRef` på lobby:s primär-ScrollView. URL-params-effekten (samma som hanterar fresh entry från host/guest/registered-flow) anropar `mainScrollRef.current?.scrollTo({ y: 0, animated: false })` i en `requestAnimationFrame`-wrapper vid varje fresh entry. Krävs eftersom Stack-navigatorn kan återanvända samma route-instans och ärva tidigare scroll-position — utan denna landar guest-användare som joinar via Join Game mitt på sidan istället för vid headern.

**Gold-glowing CTA-position** (Start Game / Waiting for Host) — båda renderas på samma plats i `startSection` och delar visuell vokabulär (gold halo + scale-pulse). Implementation (uppdaterad 2026-06-11):
- En enda `Animated.Value`-pair (`startGlow`, `startPulse`) körs i `Animated.loop` utan `hostMode`-gating — bara en ruta renderas åt gången per role, så animationen är "billig dubbelproduktion" oavsett.
- Host: `<TouchableOpacity onPress={() => handleStartGame()}>` med `<QuizVibePlayLogo size={140} color={Colors.warning} />` — identisk knapp som GetReadyIntro:s Play-knapp. Label "Start Game" ovanför (`fontSize: 22, letterSpacing: 0.5` — matchar GetReadyIntro:s `tapHereText` exakt).
- Non-host: `<View pointerEvents="none">` med samma `QuizVibePlayLogo` + "Waiting for Host to Start Game" + `<SequentialDots color={Colors.warning} />`.
- Båda ärver styling från `startGameWrap` + `startGameHalo` + `startGameLogoTouch`. `startGameButton` och `waitingForHostBox` är borttagna.
- **Layout-wrapper**: `startSection` + `customizeSectionHeader` är wrappad i en enda `<View style={{ gap: 0 }}>` så ScrollView:ns `gap: Spacing.xl` (24px) bara appliceras EN gång mot Players-blocket ovanför — annars fick varje delElement 24px gap och totalen blev ~96px.
- **"Customize QuizVibe"-rutan**: `borderRadius: Radius.md` (rundade hörn), `fontSize: FontSize.lg` (matchar sektionsrubriker), `marginTop: Spacing.md` (12px luft ovanför).

**Lobby section-collapse default + non-host layout (2026-06-13)**:
- **`playersExpanded` defaultar till `false`** för BÅDA host och non-host (`useState(false)`) — var tidigare `useState(!hostMode)` så host startade med sektionen öppen. Nu startar alla med Players in Lobby kollapsad.
- **"New Player joined" BlinkingLabel** (2026-06-30): visas i Players-sektionens header när `!playersExpanded && newPlayerJoined && waitingForApproval.length === 0`. Färg: **grön** (`Colors.success`) — signalerar att alla nyligen joinade spelare redan är godkända och inga väntar. `newPlayerJoined` sätts `true` i en `useEffect` som jämför `approvedPlayers.filter(p => !p.isHost).length` mot föregående värde via `prevNonHostApprovedRef` — notifikationen syns bara när sektionen är ihopfälld och en ny spelare godkänts. Resetas i separat `useEffect` på `[playersExpanded]` när sektionen öppnas. **Ömsesidigt exklusiv med "Players Waiting"**: "Players Waiting" (röd, `Colors.error`) visas när `waitingForApproval.length > 0`; "New Player joined" visas BARA när `length === 0`. Aldrig båda synliga samtidigt.
⚠ **Approve-flimret ("Approved" ⟷ "To be Approved") och `pendingApprovalRef` (Peter 2026-08-24).** Host:s bulk-write (`setLobbyPlayers` på `[players]`) är fire-and-forget OCH ekar tillbaka som Realtime-**UPDATE på varje rad**, vilket triggar `syncNonHostFields`. Läser den DB:n innan approve-commiten är synlig får host tillbaka `approved=false`, lokal state downgraderas, `[players]` ändras → ny bulk-write → fler UPDATE-events → oscillation. Videobevis: kortet gick unapproved → approved → unapproved → approved på ~0,5 s.

`pendingApprovalRef: Map<id, boolean>` löser det: **host:s eget, ännu obekräftade approve-beslut vinner över DB:n.** Så länge id:t ligger i map:en ignorerar `syncNonHostFields` DB:s `approved` för den spelaren (övriga fält syncas som vanligt); när DB rapporterar samma värde är skrivningen bekräftad och posten tas bort → normal sync återupptas, så en RE-JOIN:s `approved=false` fortfarande propagerar (vilket är hela skälet till att `approved` överhuvudtaget syncas hit). Prunas tillsammans med `promptedIdsRef`/`hostUnapprovedIdsRef` när spelaren försvinner ur lobbyn.

⚠ **ALLA fyra host-vägar som ändrar `approved` MÅSTE sätta `pendingApprovalRef`** — `handleSetApproved`, `handleApproveAll`, friend-auto-approve-watchern och D-vii:s auto-un-approve. Missar en väg det flimrar just den vägen igen. (`handleApproveAll` sätter map:en från `players`-closuren, INTE inuti `setPlayers`-updatern — React kan köra updatern två gånger.)

- **Join-approval-popup + friend-auto-approve (2026-08-06)**: nya joiners landar UNAPPROVED (`approved: false` i båda join-paths — guest-form + code-only; tidigare self-approve `approved: true` från non-host-UX-overhaulen är återställd). Host-sidan har en **watcher-effekt på `players[]`** (efter `waitingForApproval`-derivationen) som för varje ny unapproved non-host antingen (a) **tyst auto-approvar** om spelaren är `type === 'registered'` OCH matchar hostens friends-lista (case-insensitive playerName) — gröna "New Player joined"-blinken signalerar; eller (b) lägger id:t i **`joinPopupQueue`** → en centrerad modal (samma vokabulär som noApproved-dialogen) med **Approve + Add to Friend list** (bara registrerade joiners, ej guest host), **Approve**, **Deny — remove from lobby** (röd outline; kör delade `ejectPlayer`-helpern utan extra confirm) och **Later** (spelaren ligger kvar i "To be Approved by Host" för ApproveToggle:n). En modal åt gången (FIFO-kö); `promptedIdsRef` förhindrar re-prompt-loopar och prunas när spelaren lämnar/försvinner så genuin rejoin promptar igen. Friends-listan laddas vid host-mount in i `hostFriendsRef` (`null` = ej laddad → watcher väntar; hålls i sync av Share-modalens add-friend + popup:ens add-friend). Auto-approve-vägen speglar `handleSetApproved`:s guards (single player + peer health + Spotify-attest) — blockeras tyst approve faller spelaren tillbaka till popupen. `handleSetApproved` returnerar numera `boolean` (false vid guard-Alert) så popup-Approve kan hålla modalen öppen vid block.
⚠ **En joiner som kommer auto-approvas får ALDRIG rendera den röda "Players Waiting"-blinken (Peter 2026-08-26).** Watchern är en effekt och kör därför FÖRST efter render-commit — en QuizVibe friend hann synas som väntande i minst en frame, i praktiken en knapp sekund när joinern kom in via 2s-pollen. Peter såg rött blinka till och sekunden senare bli grönt. Fixen håller tillbaka spelaren i stället för att dämpa signalen: `isJoinDecisionPending(p)` filtrerar bort hen ur `waitingForApproval`, så kortet dyker upp direkt i rätt sektion i stället för att hoppa mellan två.
- Tre fall hålls tillbaka: (a) friends-listan är inte laddad än (`hostFriendsLoaded === false`) — vi VET inte, så vi avvaktar; (b) `willAutoApproveOnJoin(p)` är sann; (c) spelaren är inne i sitt grace-fönster (se nedan).
- ⚠ **Auto-approve-villkoret bor på EXAKT ETT ställe**: `willAutoApproveOnJoin` (friend-match + `passesSilentApproveGuards` + `hostUnapprovedIdsRef`), delad av render och watchern. Render måste kunna förutsäga exakt vad watchern gör en tick senare — läggs en ny guard bara i watchern börjar den röda blinken igen för de fall guarden blockerar.
- ⚠ **`hostFriendsLoaded` är en STATE-spegel av `hostFriendsRef`** — ref:en kan inte gata render. Den sätts true **även när `loadFriends()` failar** (ref sätts då till `[]`); utan den catch-grenen blir varje joiner permanent osynlig om laddningen kastar.
- ⚠ **Predikatet ensamt räckte INTE — ett tidsfönster (`JOIN_GRACE_MS = 3000`) bär fixen (Peter 2026-08-26, andra passet).** Första försöket antog att glappet var en frame, men Peter såg 1–2 HELA blinkningar (BlinkingLabel-cykeln är 1200 ms) — auto-approven landade alltså 1–2 sekunder senare. Orsaken ligger i konvergensen: joiner-raden når host innan alla fält är satta (`type`/`spotifyConnected`/namn skrivs och syncas i flera steg via `fetchNewJoiners` → `syncNonHostFields`), så `willAutoApproveOnJoin` kan vara false vid de första renders och sann först ett par sekunder senare. **Ett tidsfönster är immunt mot vilket fält som konvergerar sist; ett predikat måste förutse dem alla.** Varje ny unapproved non-host hålls därför dold i upp till 3 s (`joinGraceIds`-state + `joinGraceSeenRef` så fönstret aldrig startas om, timers i `joinGraceTimersRef` eftersom effektens cleanup körs vid varje `players`-ändring och annars skulle avbryta fönstret).
- Priset, accepterat: en joiner som INTE auto-approvas syns som väntande först efter fönstret. Host får join-popupen omedelbart — den är den primära signalen; den röda blinken är en påminnelse, inte ett larm. Ett manuellt un-approve visas däremot direkt (spelaren är inte "fresh" — id:t ligger kvar i `joinGraceSeenRef` sedan joinet).
- ⚠ **Grace-fönstret gäller BÅDA roller — non-host hade samma blink (Peter 2026-08-26, tredje passet).** Non-host ser sin EGEN ännu icke-godkända rad och blinkade rött tills host:s auto-approve syncats hit. Kedjan är längre där (host approvar → bulk-write → non-host:s 2s-poll → render), så fönstret är `JOIN_GRACE_NON_HOST_MS = 5000`. Non-host kan ändå inte agera på signalen — godkännande är host:s jobb — så ett långt fönster kostar inget; Peter valde uttryckligen försenad grön blink framför röd-först.
- ⚠ **Fall (a) och (b) MÅSTE förbli `hostMode`-gatade.** Non-host har varken friends-lista eller watcher, och `hostFriendsLoaded` är där permanent `false` — utan gaten hade varje icke-godkänd spelare dolts för alltid på non-host-enheten. Bara (c) är rollneutral.
- ⚠ **Grace-fönstren räcker inte ensamma — den röda blinken är dessutom DEBOUNCAD (`WAITING_LABEL_DEBOUNCE_MS = 1200`, Peter 2026-08-26, fjärde passet).** Ett fönster flyttar bara problemet: landar approven strax EFTER fönstret får man en mycket kort röd flash. Etiketten renderas därför via `showWaitingLabel`, som blir true först när `waitingForApproval.length > 0` varit oavbrutet sant i 1200 ms (= en hel BlinkingLabel-cykel), och false **direkt** när ingen väntar — så den gröna "New Player joined" aldrig hålls tillbaka. Signalen är en påminnelse om att host behöver agera; en påminnelse som försvinner inom en sekund är bara brus.
- ⚠ **Debouncen gäller ENBART etiketten.** Själva "To be Approved by Host"-sektionen och den blinkande rutan i Approved-mätaren läser fortfarande `waitingForApproval` direkt — ett spelarkort ska aldrig fördröjas ytterligare efter grace-fönstret.
- Följdeffekt, avsedd: den blinkande rutan i Approved-kapacitetsmätaren (`waitingCount`) håller också tillbaka. Gäller båda roller (grace-delen); host-delen av predikatet är gatad på `hostMode`.

⚠ **Single player: ingen non-host får bli approved — fyra lager (Peter 2026-08-24).** Home:s `checkSinglePlayerLobby`-gate är INTE tillräcklig: den läser `lobby_settings` som skrivs genom host:s 300 ms-debounce, så växlar host Single → Pass-the-Phone → Single hinner en inbjuden spelare tacka ja i PtP-fönstret. De landar i lobbyn, och eftersom en inbjuden spelare nästan alltid ligger i hostens friends-lista **auto-approvades de tyst** — resultatet blev ett "single"-spel med två spelare. Lagren nu:
  1. **`handleSetApproved` — Check 0** (`approved && singlePlayerDefault` → Alert + `return false`). Detta är den AUKTORITATIVA spärren: den läser host:s egen live-state, inte en DB-rad som kan vara i otakt. Täcker ApproveToggle:n, popupens **Approve** OCH **Approve + Add to Friend list**.
  2. ⚠ **`handleApproveAll` — SAMMA Check 0.** "Approve All"-master-toggeln överst i "To be Approved by Host" skriver `setPlayers` DIREKT och går ALDRIG via `handleSetApproved` (den kollar inte heller peer health — pre-existing). Med exakt en väntande spelare är den dessutom det mest naturliga att tappa, vilket är varför en non-host fortfarande blev approved efter att lager 1 lagts till. **Varje ny approve-guard måste speglas till BÅDA funktionerna.**
  3. **`passesSilentGuards`** i friend-auto-approve-watchern fick `!singlePlayerDefault` (och `singlePlayerDefault` i effektens deps). Tyst — en watcher ska inte Alert:a; spelaren faller i stället till popupen, där Approve-tappen visar guard-Alerten.
  4. **`handleStartGame`:s `turnOrder`** filtrerar `!singlePlayerDefault || p.isHost`. Sista utvägen: en rad som hann bli approved INNAN host växlade till single kan aldrig dras in i ett solo-spel.

  Copyn är delad via module-level-konstanten `SINGLE_PLAYER_APPROVE_BLOCK` (`'Single player mode'` / `'Can not be approved due to Single player mode. Please change to Multiplayer before approval.'`) så alla vägar säger exakt samma sak.

  En spelare som ändå tagit sig in ejectas INTE — de ligger kvar i "To be Approved by Host" tills host antingen byter läge eller trashar dem. Host:s egen växling TILL single ejectar däremot alla non-hosts som redan är i lobbyn (`handleSelectSingle`), så det normala fallet städas direkt.
- **Re-join-policy (godkännande)**: rejoin efter Leave går genom samma watcher — `promptedIdsRef` prunas när `hasLeft` blir true, så återkommande spelare får popupen igen (eller auto-approvas om friend). Code-only-rejoin med ärvt id ärver dessutom ev. tidigare `approved` från DB-raden (`existingMatch?.approved ?? false`).
- **Non-host centrering av "Waiting for Host"**: två `<View style={{ flex: 1 }} />`-spacers placeras ovanför och nedanför `startSection`-wrap:en i ScrollView:n. `styles.content` har `flexGrow: 1` på `contentContainerStyle` (tidigare saknade) så content-containern fyller hela skärmhöjden — utan detta har `flex: 1`-children inget att expandera in i. Resultatet: "Waiting for Host to Start Game" + play-ikonet centreras vertikalt i utrymmet mellan Players och Customize.
- **"Customize QuizVibe" är kollapsbar** längst ner i lobbyn, synlig för BOTH host och non-host. Innehåller Game Settings- och Quiz Tuning-sektionerna inuti. Styrs av `customizeExpanded`-state. En `useEffect` på `[customizeExpanded]` anropar `mainScrollRef.current?.scrollToEnd({ animated: true })` med 150 ms fördröjning vid expand. Header-styling: `backgroundColor: Colors.card`, `+/−`-toggle.

## Quiz — frågetyper (discriminerad union)

`quiz.tsx` håller frågorna i en **discriminerad union** `QuizQuestion = TimelineQuestion | ImageQuestion` (diskriminator: `type: 'timeline' | 'image'`):

- **TimelineQuestion** — musik-fråga. `correctYear`, `youtubeClips?`. Svar via `TimelineSelector` (year-scroll), scoring via `isCorrect(year, correctYear, interval, eraFrom, eraTo)`. Mediakort = `MediaPlayer` (YouTube).
- **ImageQuestion** — bild-fråga. `displayName`, `letterGrid`, `optionsByPrefix`, `correctPrefix`, `prefixLength`. Svar via `ImageAnswerBlock` (Letter Grid → Final Selection), scoring via `pendingNameOption.isCorrect`. Mediakort = bild + `ProgressiveCover`.
- **ActorSelectQuestion** (`contentSubject: 'actor'`) — film-fråga med skådespelar-svarsval. `displayName` = filmens titel, `correctYear` = filmens utgivningsår, `correctNames` (rätta skådisar) + `distractorNames` (felaktiga). Svar via `<ActorSelectBlock>` ([src/components/ActorSelectBlock.tsx](src/components/ActorSelectBlock.tsx)) som delar Letter Grid/full-names-mönster med `ImageAnswerBlock`. **Reveal-vyn** (2026-06-08): det rätta skådespelar-namnet visas med grön ram + filmens titel och år som undertitel i `nameStack`-kolumn (`movieTitle` + `movieYear` props från quiz.tsx). `displayName` → `movieTitle`, `correctYear` → `movieYear` i call-siten. Scorer via `handleConfirmActor` med `questionKind='name'`.

**MainCategory-tagging** (2026-05-25): båda typer bär ett `mainCategory: MainCategory | null`-fält där `MainCategory = 'Music' | 'Film' | 'Sport'`. Härleds vid SEED-conversion via `subjectToMainCategory(contentSubject)`-helpern i quiz.tsx:
- `song / artist / band` → **Music**
- `movie / actor / character` → **Film**
- `sport-event / athlete` → **Sport**
- Andra subjects (capital, country, place, etc.) → `null`

Driver två konsumenter idag:
1. **GetReadyIntro:s kategori-badge** (se "Quiz — Get Ready to Vibe intro screen" nedan). Härleds som `categoryByQuestion: (MainCategory | null)[]` useMemo parallellt med `mediaSourceByQuestion`, passas som prop.
2. **Framtida theme-package-roadmap** — när någon kategori passerar 1000-frågor-tröskeln blir den säljbar som themed package i Store (se `memory/project_theme_package_roadmap.md`).

**Pool-blandning** (`gameQuestions`) — **3-pool fas-struktur** (uppdaterad 2026-06-08):

Tre separata pools: `spotifyPool` (YT-items med `spotifyTrackId` när `spotifyEnabled`), `pureYoutubePool` (övrig YT), `imagePool`. Fasordning: **Spotify → YouTube → Hints/Image** (sekventiell, inte cyklisk).

**Ratio per spelläge (omarbetad 2026-08-14 — Hints halverad):**
- **IndDev med Spotify**: 37,5% Spotify / 37,5% YouTube / 25% Hints
- **PtP / Single Player** (Spotify alltid av): 75% YouTube / 25% Hints
- Formel: `imageBlockCount = hasImage ? floor(N/4) : 0`, `rest = N - image`, `spotifyBlockCount = hasSpotify ? min(floor(rest/2), spotifyPool.length) : 0`, `ytBlockCount = hasPureYT ? rest - spotify : 0`. En otilldelad rest (otillgänglig källa) går till YT → Spotify → Hints i den ordningen.
- **Hints storleksbestäms FÖRST och golvas**, tvärtom mot tidigare där Hints tog halva spelet OCH absorberade all avrundningsrest (kunde ge 67%). Rationalen: **Hints finns för att spelet inte ska stå och falla med Spotify och YouTube — det är utfyllnad, inte en dragare** (Peter 2026-08-14). Se `memory/project_hints_is_filler.md`.
- Följd av golvningen, avsiktlig: vid 2–3 rundor får Hints **noll**, och andelen hamnar strax UNDER 25% (17–20% vid 5, 6, 10 rundor) i stället för över.

**Spotify-antalet MÅSTE vara ett helt antal DJ-varv (Peter 2026-08-14).** `djRotationPlan` ([quiz.tsx](app/quiz.tsx)) delar ut DJ round-robin (`spotifyQuestionIndices.length % djPlayers.length`), så ett antal som inte är jämnt delbart med spelarantalet gör att någon DJ:ar oftare än andra. Med 2 rundor + 2 spelare gav den råa 37,5%-kvoten 1 Spotify-fråga → bara spelare 1 fick DJ:a. Regeln fanns dokumenterad i `computeDJRotationPlan` ([spotifyDJ.ts](src/utils/spotifyDJ.ts)) — "en DJ-tur per spelare, exakt" — men den funktionen är **död kod**, quiz.tsx bygger sin egen plan.
- `spotifyBlockCount` golvas till helt antal varv, men **aldrig under ETT varv**: en påslagen Spotify-toggle ska synas i spelet. 4 rundor/2 spelare → 2 Spotify (inte 0), 2 rundor/2 spelare → båda frågorna Spotify.
- Ett påtvingat varv som är större än resten efter Hints tar från Hints-kvoten.
- **Färre rundor än spelare → Spotify utgår helt** (inget halvt varv). Undantag: är Spotify ENDA källan fylls rundorna ändå, för noll skulle lämna spelet utan frågor — där accepteras ojämna DJ-turer.
- Utfyllnad av otilldelade block går **YT → Hints → Spotify** (Spotify sist) så utfyllnaden inte lägger till lösa Spotify-frågor och bryter varvet.
- ⚠ Golvningen gör att Spotify **under**levererar mot 37,5% vid många spelare: 20 rundor/4 spelare ger 4 (20%) i stället för ~7, eftersom `floor(7/4) = 1` varv. Avsiktligt val (rättvisa före ratio); byt till avrundning till närmaste varv om ratio ska prioriteras.
- Spotify är hårt gated till IndDev där `questionsPerBlock = 1`, så block = frågor och varv-matematiken går rakt på blocken.

**Block-storlek**: `turnOrder.length` (PtP) eller 1 (IndDev/Single Player).

**Epok-viktad urval (YouTube-fas + Image-fas, 2026-06-08)**: ersätter `prioritiseUnseen()`-flat-shuffle för Fas 2 och Fas 3. Implementeras i [`src/utils/epochAllocation.ts`](src/utils/epochAllocation.ts).

5 epoker med **per-år-vikter** (källa: produktkalkylblad 2026-06-08):
| Epok | År | Per-år-vikt |
|---|---|---|
| E1 | ≤1964 | 0.115 |
| E2 | 1965–1980 | 0.225 |
| E3 | 1981–1996 | 0.25 |
| E4 | 1997–2012 | 0.22 |
| E5 | 2013+ | 0.19 |

**`getActiveEpochs(eraFrom, eraTo)`** — år-proportionell viktning: `effectiveWeight = overlappingYears × perYearWeight`, sedan normalisering. Epoker utan överlapp exkluderas. Exempel: eraFrom=1976, eraTo=1999 → E2 5år×0.225=1.125, E3 16år×0.25=4.0, E4 3år×0.22=0.66 → normWeights 0.194/0.691/0.114 → N=10 ger 2/7/1 frågor.

**`allocateByEpoch(N, activeEpochs)`** — Largest Remainder Method (Hamilton-metoden): garanterar `sum === N` exakt. Avrundningsproblem löses via decimal-rest-sortering. **Används numera bara som fallback** — se skuldboken nedan.

**Epok-skuldbok per Host — målandelen gäller ÖVER spel, inte inom ett spel (2026-08-14).** LRM nollställs vid varje anrop och kan därför aldrig leverera en andel under 1/N. Med 4 rundor är E1:s 11% = 0,44 frågor → alltid avrundat till 0. Värre: `buildCategoryAlignedPhase` splittar fasen per Music/Film/Sport FÖRE epok-allokeringen, så varje anrop fick `totalQuestions = 1`, och LRM med N=1 ger alltid epoken med störst normWeight. **Följd: ett 4-rundorsspel bestod av enbart E3 (1981–96), och E1 var oåtkomligt vid ALLA rundantal** (krävde N≥5 i ett anrop = 26+ rundor, cap är 20). Peter reproducerade det: född 1981, era 1950–2026, fyra spel i rad — bara svarsår 1981+.

Lösningen är en **löpande fördelning** i stället för per-anrops-avrundning:
- [`planEpochSequence(n, activeEpochs, debt)`](src/utils/epochAllocation.ts) — varje frågeslot ökar skulden för alla AKTIVA epoker med deras `normWeight`; epoken med störst skuld får platsen och betalar 1. Ren funktion, returnerar `{ sequence, nextDebt }`.
- [`src/utils/epochLedger.ts`](src/utils/epochLedger.ts) — persistens per Host, `@quizvibe/epochLedger/v1/<playerName.toLowerCase()>` (samma namespacing som `hostQuestionHistory`). Guests får en sessions-lokal skuldbok.
- **EN skuldbok räcker för alla eror.** Epoker utanför aktuell Game Era är inte aktiva → de varken ackumulerar eller väljs, utan **fryses** och återupptas när en era som täcker dem spelas igen. Ackumuleringen sker med den AKTUELLA erans normaliserade vikter, så varje era konvergerar mot sin egen målandel oberoende av de andra. Ingen era-nyckling behövs.
- Planen görs EN gång per spel i `gameQuestions` och skivas mellan YouTube- och Hints-faserna (Spotify-fasen är epok-lös); `buildEpochPhase` tar den via nya `quotas`-parametern i stället för att anropa `allocateByEpoch`. Det är just den delade planen som gör att kategori-splittens N=1 slutar spela roll.
- Skuldboken persisteras på samma ställen som seen-historiken (leaderboard / Quit / Leave) via `persistEpochLedger()` — ett avbrutet spel bokför alltså ingen skuld. **Allokerade** epoker bokförs, inte serverade: målandelen är definierad över vad som efterfrågades, och lån vid tom hink ska inte snedvrida den.
- Verifierat mot riktiga katalogen: E1 levereras 10,8% mot 11,1% mål över 200 spel à 4 rundor. Kvarvarande skevhet (E2 under, E3 över) är **innehållsluckan** Music-E2 = 0 items för millennials, inte allokeringen — varje Music-slot planerad för E2 måste låna, och lånet går till högsta normWeight med lager = E3.

**`shuffleBlocks(seq, questionsPerBlock)`** (i [app/quiz.tsx](app/quiz.tsx), bredvid `shuffleArray`): `buildEpochPhase` levererar frågor i kronologisk epok-ordning E1→E5, och skuldboken väljer dessutom deterministiskt "störst skuld först" — utan shuffle skulle varje spel öppna på samma epok. Shufflen körs **per fas** (ytSeq och imgSeq var för sig) så källordningen Spotify → YouTube → Hints bevaras. **Blockgranulariteten är kritisk i PtP**: där är `questionsPerBlock` = antalet spelare och `buildPtPSequence` gör varje block till exakt ett turvarv `[P1..Pn]`, så att blanda hela block behåller både turordning och kategori-alignering. I Single Player/IndDev är `questionsPerBlock` = 1 → vanlig frågeshuffle. Ett avslutande ofullständigt block pinnas sist (enkategori-grenen i `buildCategoryAlignedPhase` trimmar inte till blockmultipel).

Tester: [backend/content/test/epochAllocation.test.ts](backend/content/test/epochAllocation.test.ts) (15 st) låser summering, konvergens mot mål, frysning/återupptagning över era-byten, skuld-clamp samt shuffleBlocks turordning + partiellt block.

**Era-filtrering av poolerna** (HÅRD, görs FÖRE `buildEpochPhase`):
- YouTube-frågor: `correctYear ∈ [eraFrom, eraTo]` — strikt. Inga YouTube-frågor utanför spannet.
- Image/Hints — **person-items** (artist/band/actor/athlete/etc.): **era-agnostiska** — alltid inkluderade oavsett era. Motivering: `correctYear = födelseår`, inte eventår; Michael Jackson (f.1958) ska inte filtreras bort i ett 1980-nu-spel.
- Image/Hints — icke-person-items (sport-events, platser): strikt `correctYear ∈ [eraFrom, eraTo]`.
- Items med `peakFrom/peakTo`: interval-overlap `eraFrom <= peakTo && eraTo >= peakFrom`.

**`buildEpochPhase` bucketing** (rad 281 i [epochAllocation.ts](src/utils/epochAllocation.ts)): använder epokens fulla gränser (`e.start <= year && e.end >= year`), inte [eraFrom, eraTo]. Säkert eftersom YouTube-poolen är förifiltrad; person-images med epochYear utanför aktiva epoker hamnar i `agnosticPool` (overflow, fylls in sist).

**`imageEpochYear`** (i quiz.tsx): `peakFrom/peakTo` midpoint om satt, annars `correctYear + 25` (födelseår + 25 = karriärspeak-proxy). Returnerar `null` → `agnosticPool`.

**Pass-the-Phone — per-spelare affinitets-tilldelning** (körs inuti `buildEpochPhase`):
1. `playerQuotas(N, players)` — LRM: jämn fördelning, max |quota_i − quota_j| ≤ 1.
2. `assignQuestionsToPlayers` — greedy: `affinityScore = genMatch × 10000 + yearDist` (generationsmatch väger tyngst; födelseårs-närmhet bryter ties).
3. `buildPtPSequence` — omordnar tilldelningar till PtP-turordningslots.

**IndDev / Single Player**: `buildEpochPhase` returnerar frågor direkt i epokordning (E1→E5), ingen spelar-tilldelning.

**Fallback** (inuti `buildEpochPhase`): om en epok töms lånas från epoken med färst extra-lån (tie-break: högst normWeight). Era-agnostiska overflow-items (`agnosticPool`) fylls in sist.

**Randomness-fix (2026-08-04)** — tre determinism-läckor täppta så två fresh hosts aldrig får samma sekvens: (a) `agnosticPool` i [epochAllocation.ts](src/utils/epochAllocation.ts) konsumerades i katalog-ordning utan seen-hänsyn → nu samma 3-tier-split (fresh/older-seen/last-session) + shuffle per tier som epok-buckets (splice-in-place så shift()-konsumenterna är orörda); relevant vid smala era-fönster där många person/Hints-items hamnar utanför aktiva epoker. (b) `buildCategoryAlignedPhase`:s kategori-ordning (Map insertion = pool-ordning) gav alltid Music-block först + remainder-block till första kategorin → `cats` shufflas nu. (c) Spotify-fasens fallback vid för få osedda reshufflade HELA poolen (kunde välja enbart sedda trots osedda kvar) → nu alla osedda först + slumpade sedda som utfyllnad (senaste sessionens sist).

**`hostQuestionHistory.ts` — session-baserad 20-sessions rullande historik (v2, 2026-06-08)**:
- Lagrar `SessionHistory = { sessions: { id: string; qIds: string[] }[] }`, max 20 sessioner.
- `addSessionRecord(qIds)` lägger till ny session, trimmar till 20.
- `loadSeenQuestionIds()` returnerar `Set<string>` av alla IDs från de 20 senaste sessionerna.
- Migration från v1 (flat `Set<string>`) — importeras som en syntetisk session vid första v2-load.
- Per-spelare-nyckel: `@quizvibe/seenQuestionIds/v2/<playerName.toLowerCase()>`.
- **Gäster får en sessions-lokal historik** (module-level `sessionHistory`, 2026-08-16). `resolveKey` returnerar `null` utan sparat playerName, så tidigare no-op:ade BÅDE läsning och skrivning — ett gäst-hostat Play Again kunde servera exakt samma frågor igen. Samma mönster som `sessionDebt` i [epochLedger.ts](src/utils/epochLedger.ts); försvinner vid app-omstart, avsiktligt (gästdata persisteras inte).

**"Ingen repris inom 20 spel" — vad som faktiskt garanterar det (2026-08-16)**

Historiken ovan är bara halva löftet: den kan bara välja bort frågor om det finns något annat att välja. Fyra mekanismer bär garantin tillsammans, och ett Elvis-i-varje-spel-fall (era 1950–1980, gen-z) uppstod trots att historiken fungerade perfekt:

1. **Poolen måste vara djup nog.** Audience-filtret kollapsade poolen till EN spelbar Music-fråga — se ⚠-noten i audience-avsnittet. Detta var HUVUDorsaken; övriga tre är skärpningar i samma pass.
2. **`allocateCategoryBlocks`** ([epochAllocation.ts](src/utils/epochAllocation.ts)) — kategori-allokeringen är fortfarande lika vikt per kategori, men kapas nu mot hur många block kategorin kan fylla med OSEDDA frågor; överskottet vattenfylls till kategorier som har färskt kvar. Utan taket ägde en 1-frågas-kategori sin fulla tredjedel av spelet och MÅSTE då repriseras. Summan är fortfarande exakt `totalBlocks`.
3. **`fallbackQuestion` sorterar på färskhet först.** Kommentaren påstod det redan, men koden sorterade bara på `extraDraws`/`normWeight` — en epok vars enda kvarvarande items sågs i FÖRRA spelet kunde vinna lånet över en epok med osedda. Tier-nyckeln (0 = har osedda, 1 = äldre-sedda, 2 = bara senaste sessionen) dominerar nu.
4. **`pickTiered`** — guest-hostade spels viktade käll-dragning drog tidigare helt uniformt och ignorerade historiken totalt (`picked`-Set deduperade bara INOM samma spel). Nu samma färskhets-nivåer som resten. Gäller även guest-spelens Spotify-urval.

⚠ **`totalQuestions` clampas mot `gameQuestions.length`** och frågan hämtas UTAN modulo (`quiz.tsx`). Tidigare gav en tunn pool `gameQuestions[questionIndex % length]` = repris inom SAMMA spel. Ett något kortare spel är ärligare än en repris.

Låst av [backend/content/test/questionRepetition.test.ts](backend/content/test/questionRepetition.test.ts) (16 tester) — inklusive en 20-spelssimulering med noll dubbletter, en era-invariant, och en **invers-kontroll** som reproducerar Elvis-buggen med den gamla poolen så testet låser fixen och inte bara rördragningen.

**Cross-player seen-historik i IndDev (fix 2026-08-04)** — samma låt kunde återkomma direkt när en ANNAN deltagare hostade nästa spel. Två rotorsaker + fix:
1. **Non-host sparade fel historik**: leaderboard-effekten sparade `gameQuestions` (= enhetens LOKALA slumpordning), inte de faktiskt spelade frågorna (host:s sekvens). Fix: `effectivePlayedIds = !isHost && broadcastAllQuestionIds?.length ? broadcastAllQuestionIds : gameQuestions.map(id)`. Samma logik i non-host:s Leave Game (`slice(0, questionIndex)`, ny recording — fanns inte alls tidigare); host:s Quit Game var redan korrekt.
2. **Ingen cross-player-union**: host exkluderade bara sin EGEN historik. Fix: nytt broadcast-event **`player_seen_questions`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)) — non-host skickar `{ player_id, seen_q_ids (20-sessions-set, slice(-500)), last_q_ids (senaste sessionen) }` vid quiz-mount (3 sändningar: 300/1800/4500 ms, retry-mönster som game_sequence_init; host är redan subscribed eftersom host mountar quiz först). Host merge:ar in i `peerSeenIds`/`peerLastIds`-state — ENDAST medan `phaseRef==='intro' && questionIndexRef===0` (senare ankomst ignoreras så gameQuestions-useMemo:n aldrig bygger om poolen mitt i spelet). Pool-bygget använder `combinedSeenIds`/`combinedLastIds` (egen ∪ peers) i Spotify-fasens hårda exkludering + `buildCategoryAlignedPhase`:s `recentIds`/`lastSessionIds`. Payload-validator `vPlayerSeenQuestions` + membership-guard (player-id-bärande event). Resultat: en fråga som NÅGON deltagare sett i sina senaste 20 spel exkluderas (mjuk för YT/Hints via unseen-prioritering, hård för Spotify tills poolen tar slut).

**Cross-player-historik i Pass-the-Phone (samma pass)** — PtP saknade då quiz_sync-channel, så exkluderingen går via DB i stället. ⚠ Sedan 2026-08-25 HAR PtP en kanal (spectator-vyn), men `player_seen_questions` broadcastas MEDVETET fortfarande bara i IndDev — DB-vägen nedan är redan komplett för PtP, och en spectator som skickar sin historik skulle riskera att bygga om host:s pool mitt i flödet. DB-vägen:
- **Migration `0026_lobby_players_seen_questions.sql`**: `lobby_players.seen_question_ids jsonb` (`{ "seen": [...], "last": [...] }`). Kolumnen ingår MEDVETET INTE i `playerToRow`/upsert-payloads — skrivs enbart via targeted UPDATE (`updateOwnSeenQuestionIds` i [mockLobbyPlayers.ts](src/utils/mockLobbyPlayers.ts), eq room_code+player_id+user_id som markOwnPlayerLeft) så host:s bulk-UPSERT aldrig clobbar den OCH så en icke-applicerad migration bara ger console.warn utan att bryta lobby-join. **Migrationen appliceras manuellt via SQL Editor som vanligt.**
- **Join-sidan**: `publishOwnSeenHistory(roomCode, playerId)` (module-level i [LobbyScreen.tsx](src/screens/LobbyScreen.tsx)) anropas efter BÅDA join-upserts (guest-form + code-only/carry-over) — läser lokala 20-sessions-historiken och skriver till egen rad. Tom historik (guest utan profil) → no-op.
- **Host-sidan**: `handleStartGame` läser union:en via `getLobbySeenQuestionIds(roomCode)` (efter `await setLobbyPlayers`, före markGameStarted) och stash:ar i in-memory-storen [pendingSeenQuestions.ts](src/utils/pendingSeenQuestions.ts) (`setPendingPeerSeenIds`). quiz.tsx konsumerar vid mount (`consumePendingPeerSeenIds`) och merge:ar in i samma `peerSeenIds`/`peerLastIds`. Fungerar för BÅDA lägen — i IndDev belt-and-suspenders bredvid broadcasten.
- **PtP-recording under alla deltagare** (⚠ numera gatad på `isHost` — en spectator ska inte skriva andra spelares historik till sin egen enhet): vid leaderboard + host:s Quit Game skrivs sessionen även under varje registrerad deltagares playerName-nyckel via `addSessionRecordForNames(names, qIds)` ([hostQuestionHistory.ts](src/utils/hostQuestionHistory.ts) — skippar inloggade profilens eget namn internt så det inte dubbel-skrivs; guests filtreras bort). Så deltagarnas historik finns på PtP-enheten om de senare loggar in/hostar där.
- **Känd begränsning**: en registrerad spelare som deltog i ett PtP-spel på NÅGON ANNANS enhet får inte det spelet i sin egen enhets historik (AsyncStorage är per-device). Täcks indirekt: (a) värdens egen historik exkluderar spelet i alla spel värden är med i; (b) per-name-recordingen täcker återkommande spel på samma enhet; (c) **sedan 2026-08-25**: en PtP-deltagare som svarar Yes på spectator-prompten och stannar till slutskärmen kör seen-history-effekten på SIN enhet med host:s `broadcastAllQuestionIds` som källa — då landar spelet i deras egen seen-historik. Väljer de No, eller lämnar i förtid, gäller begränsningen fortfarande. Full täckning kräver server-side per-user-historik (ej i V1-scope).

Edge cases:
- `spotifyEnabled = false` (alltid i PtP/Single Player) → `spotifyPool = []`, `pureYoutubePool = youtubePool`.
- Spotify-only single player → blockeras i `handleStartGame` ("Spotify DJ requires at least one other player").
- Alla pools tomma → SEED_QUESTIONS fallback.
- **`spotifyEnabled` gatas hårt** på `gameMode === 'individual-devices'` i quiz.tsx — PtP/Single Player aktiverar aldrig Spotify DJ oavsett param.
- `gameSequencePreview` i LobbyScreen speglar exakt samma logik för korrekt preview-visning.

**State-paritet musik ↔ bild**:
| musik | bild | beskrivning |
|---|---|---|
| `pendingYear` | `pendingNameOption` | Preliminärt val pre-Confirm |
| `selectedYear` | `confirmedNameOption` | Låst val post-Confirm (driver reveal) |
| `handleConfirm(year)` | `handleConfirmName(opt)` | Phase → 'awaiting' + recordRoundScore |

`canConfirm`-derived: `isImageQuestion ? hintsReady : pendingYear !== null`. För image-frågor aktiveras Qonfirm-knappen **omedelbart** när hints börjar visas (hintsReady = true vid phase='question'), utan att kräva att spelaren väljer ett svar först. Klick utan `pendingNameOption` är en no-op (handleConfirmName-grenen checkar internt). För timeline-frågor krävs `pendingYear !== null` som tidigare. Driver Confirm-knappens gold-glow/pulse-loop.

**RoundResult-shapen är musik-formad** (`correctYear` + `selectedYear` som number). Image-frågor sätter båda = 0; reveal-renderingen läser `question.displayName` istället för selectedYear/correctYear för image. Player History som visar selectedYear (idag i `src/components/PlayerHistorySection.tsx`) kan behöva discriminator-anpassning innan den används för image-rundor.

**Per-spelare-variant** (implementerad): backend pre-bakar tre varianter per item (`prefix-1` / `prefix-2` / `full-names`) som en discriminated union på `mode`-fältet. Klienten väljer variant runtime via `pickImageQuestionVariant(question.variants, assistance)`: `full → full-names`, `standard → prefix-2`, `minimal → prefix-1`. `resetKey` på `ImageAnswerBlock` inkluderar `currentAssistance` så state reset:as när spelaren byts i Pass-the-Phone (annars fastnar förra spelarens prefix-state). **Ålder-baserad full-names-override** (born 2016+ → forced full-names oavsett assistance, från `getLetterGridConfig`) körs INTE klient-side ännu — kräver att helpern anropas vid variant-val. Kan landa när age-context wireup blir aktuell, t.ex. parallellt med audience-filter-implementeringen.

**Letter Grid-filter** (klient, `ImageAnswerBlock.sortedGrid` — i ordning):
1. **Längd-filter**: prefixens första ord måste ha ≥ variantens `prefixLength`. Skydd mot edge case där distractor-pool-namn med kort displayName ger kortare prefix än target.
2. **Word-count-filter**: alla prefix-knappar måste matcha rätta svarets ord-count. Om rätt svar är "Astrid Lindgren" (2 ord, "AS LI") visas bara 2-ord-distractors — 1-ord items som "Avicii" filtreras bort. Garanterar visuell konsistens i grid:n.
3. **Dedupering**: max EN prefix-knapp per begynnelsebokstav (vid "MA" och "MR" → båda börjar med 'M' behålls bara EN). Prio: prefix som matchar rätt svar; annars alfabetiskt först.

**KRITISKT — samma filter speglas i `buildLetterGrid`** ([src/utils/imageQuestionBuilder.ts](src/utils/imageQuestionBuilder.ts)): Filtren ovan appliceras av klienten EFTER att `buildImageVariant` genererat prefix-listan. Om `buildLetterGrid` ignorerar filtren slösar den slots på prefixer som ändå tas bort. Nuläge:
- `correctWordCount = correctPrefix.split(' ').length` — distraktorprefixer med fel ord-count hoppas över i `pickFromPool` + `pickFromDistractorPool`.
- `usedFirstLetters = new Set([correctPrefix.charAt(0)])` — prefixer vars FÖRSTA BOKSTAV redan är tagen hoppas över (speglar klientens dedup-regel). T.ex. "The Ark" = "TH AR" tar bokstaven 'T', så "TH WH" (The Who), "TH BE" (The Beatles) etc. genereras ALDRIG som distraktorslots — de hade tagits bort av klienten ändå.
- Dessa regler garanterar att `buildLetterGrid` alltid producerar exakt `totalOptions` prefixer som alla **överlever** klientfiltret → alltid 5 synliga svarsalternativ.

**Inline Final Selection** (klient, prefix-mode): Letter Grid + Final Selection är HOPSLAGNA i samma vy — varje prefix-rad har prefix-knapp till vänster (smal, 96 px) och, när vald, det fullständiga namn-kortet till höger (`flex: 1`). Tap på annan prefix-knapp flyttar namn-kortet till den nya raden. Inget separat "Step 2"-flöde, ingen Back-knapp. Pending-name sätts direkt vid prefix-tap så Confirm-knappen i quiz.tsx blir aktiv så snart en rad valts.

**Full-names-mode** (klient, Full assistance): ImageAnswerBlock dispatch:ar på `variant.mode` — när `'full-names'` renderas en vertikal lista med ~10 fullnamn-kort under varandra (`fullNameCard`-style). Spelaren tappar direkt på rätt namn — ingen prefix-pussel. Default-stilen (oselected) är `cardElevated`-bg + `primaryBorder` (samma vokabulär som prefix-knappens default). Selected-state delar exakt samma blå pending / gold confirmed / grön correct-vokabulär som prefix-mode:s `nameCard` (bara kantlinjen byter färg över faser; bg konstant `primaryMuted`). Correct/Wrong-badges, dimning av irrelevanta rader och separate-correct-rendering vid fel/time-out funkar identiskt som i prefix-mode. Två interna komponenter (`FullNamesView`, `PrefixView`) delar gemensamt styles-objekt — ImageAnswerBlock-toppen är bara en dispatcher.

**Reveal-fas-beteende** (redesign 2026-05-21):
- Alla prefix-knappar förblir synliga genom hela faskedjan (`question → awaiting → reveal`). Tidigare retur:ade ImageAnswerBlock `null` vid reveal; den early-returnen är borttagen.
- **Spelarens confirmed prefix**: gold border (`Colors.warning`) på både prefix-knapp och namn-kort. Samma blå (`Colors.primaryMuted`) bg som under question-fasen — bara kantlinjen byter färg. Texten konstant blå (`Colors.primary`) över alla state.
- **Rätta svaret (visad separat när spelaren svarade fel eller tiden tog slut)**: grön border (`Colors.success`) på både prefix-knapp och namn-kort, blå bg. `showSeparateCorrect = isRevealing && (!confirmedName || !wasPlayerCorrect) && correctPrefix !== playerExpandedPrefix`.
- **Correct/Wrong-badges** (border-cutting top-right på namn-kortet): grön `Correct` på spelarens rad vid rätt svar ELLER på den separat-visade correct-raden vid fel/time-out; röd `Wrong` (`QUIZ_ERROR_RED`) på spelarens rad vid fel svar. Lokal kopia av `QUIZ_ERROR_RED`-konstanten i [src/components/ImageAnswerBlock.tsx](src/components/ImageAnswerBlock.tsx) (medvetet duplicerad så komponenten inte kräner in quiz-screen-state).
- **Wrong-reveal-state vid time-out** (tillägg 2026-05-22): när spelaren inte svarat (`confirmedName === null` + reveal-fas) markeras ALLA icke-correct rader med **röd kantlinje** (`prefixButtonWrongReveal` / `nameCardWrong`, båda `QUIZ_ERROR_RED`) + **✗-badge** + **grå text** (`Colors.textDisabled`, samma färg som irrelevanta rader får vid rätt-svar-fallet via `prefixTextDimmed` / `fullNameTextDimmed`). Prefix-mode: kompakt cirkulär ✗-badge (`prefixBadgeWrong`, 20×20 minWidth, top:-8/right:-6) på prefix-knappen själv eftersom inget nameCard renderas för wrong-reveal-rader. Fullnames-mode: ✗-badge via befintlig `revealBadge`-styling på nameCard. Visuellt resultat vid time-out: "9 röda fel + 1 grön rätt" så hela landscape:n läses som facit. Text-färgen är grå (inte primary blå) så fokus ligger på correct-revealens gröna kort — röd border + ✗ behövs inte tävla med correct-revealen om "läs mig"-uppmärksamhet. När spelaren faktiskt svarade (även fel) påverkas inte andra rader — endast time-out triggar wrong-reveal-treatment:en.
- **Irrelevanta prefix-rader dimmas** under reveal: alla prefix-knappar som varken är spelarens val, correct-prefixet ELLER wrong-reveal-rader får text-färgen `Colors.textDisabled` (40% opacity grå). `isPrefixDimmed = isRevealing && !isPlayerRow && !isCorrectRevealRow && !isWrongRevealRow`. Wrong-reveal-text behålls läsbar (röd border + ✗ bär statusen).
- **Time-out-fall**: `playerExpandedPrefix = null` (= ingen player-row expanderad). Correct-prefixets namn-kort expanderas med grön Correct-badge; alla andra rader får röd border + ✗-badge.

**`correctPrefix`-prop**: ImageAnswerBlock kräver `question.correctPrefix` (finns redan på `ImageQuestionVariant` från backend-katalogen) för att driva reveal-fasens green-Correct-expansion. Parent passar hela `variant`-objektet så proppen är inkluderad automatiskt.

**Row-höjd**: `prefixRow` har ingen `minHeight` (tidigare 124px under en kort designperiod) — naturlig höjd ~46-50px från innehållets padding. `prefixButton.paddingVertical: Spacing.md` (12px), `nameCard.paddingVertical: Spacing.sm` (8px).

Namnet som visas (`pickNameForPrefix`): det rätta namnet om prefix matchar `correctPrefix`, annars alfabetiskt första distractor-namnet. Backend-datan (`optionsByPrefix`) lagrar fortfarande full pool så filtreringen är ren UI-tweak.

**Audience-filter** ([src/utils/audienceFilter.ts](src/utils/audienceFilter.ts)) — implementerad 2026-05-22 när image-pool nådde 31 items. Pool-nivå-filter (V1) på **BÅDA pools** (music + image):
- **Filter-hierarki** (i ordning, hård → mjuk):
  1. **Source-toggle** (youtubeEnabled / imagesEnabled) — HÅRD. Host:s val.
  2. **Era** (correctYear ∈ [eraFrom, eraTo], eller peakFrom/To-overlap för image-items med peak) — HÅRD. Host:s val.
  3. **Audience** (union av spelares generationer) — PREFERENS. Relaxas när era+audience yields 0; era stannar alltid.
- **Rationale**: era är en explicit host-väljning. En 80-talsspel ska ALDRIG visa 2020-låtar även om alla spelare är gen-z — det skulle bryta host:s intent. Däremot OK att visa 80-talslåt med `audiences=['elder']` till en gen-z-spelare när det är enda alternativet inom 80-talsfönstret.
- **Modell**: union av aktiva spelares generationer från `turnOrder`. Items vars `audiences` innehåller minst en spelares gen ELLER `'all'` är kvalificerade.
- **Music-side**: `MUSIC_QUESTIONS[i].audiences` kopieras från file-header `audience` via `backend/scripts/export-music-questions.ts`. En låt från 60-talet (i `songs-elder.yaml`) får `audiences: ['elder']`; `songs-all.yaml`-items får `audiences: ['all']`.
- **Image-side**: `ImageQuizQuestion.audiences` kopieras från file-header (`actors-elder.yaml`, `athletes-modern.yaml` etc.). `IMAGE_SEED_QUESTIONS` + `SEED_QUESTIONS`-mappingen i quiz.tsx droppar fältet, så vi filtrerar mot id-set:en från `MUSIC_QUESTIONS` / `IMAGE_QUIZ_QUESTIONS` istället.
- **Helper-signatur**: `filterByAudience<T extends { audiences: readonly string[] }>` — generic över båda typer.
- **Generation-mapping**: `ageToGeneration(age)` → `getGenerationKeyFromBirthYear(currentYear - age)` (samma 5-bands-definition som backend/`birthYearToGeneration`).
- **Fallback-chain** (per pool i quiz.tsx:s `gameQuestions`-useMemo):
  1. era + audience → preferred path
  2. era-only (audience relaxas, era HÅRD) → fallback om (1) tom
  3. tom (= source-toggle off eller era-fönster utan items)
- ⚠ **Relaxen i steg 2 fyrar bara på en EXAKT TOM pool** — och beslutet tas dessutom FÖRE kategori-filtret och FÖRE Spotify-splitten. Det var medgrundorsaken till Elvis-buggen 2026-08-16: 25 items > 0 så relaxen körde aldrig, trots att den pool som faktiskt spelades (Music ∩ YouTube-spelbar) var 1. Sedan alla items bär alla generationer är detta ofarligt, men **börjar du cherry-picka exkluderingar igen är det här stället att titta på först** — en djup-baserad relax (kräver `needed × 20` färska items i den effektiva poolen) designades men lades åt sidan eftersom audience just nu är en no-op.
- **Inget fallback strippar era** — host:s era-intent respekteras alltid. Tidigare implementation (innan 2026-05-22-fixet) hade fallback som tillät audience-only utan era, vilket var en bug. Låst av ett test i `backend/content/test/questionRepetition.test.ts`.
- **Edge cases**: tom audience-set (alla spelare saknar age-info) bypassar filtret helt. Spelare utan age bidrar inte men blockerar inte heller.
- **`audienceSet` byggs en gång** per useMemo-körning och delas mellan music + image — gemensam generations-union.
- **Emergency fallback** kvarstår på `if (!hasYoutube && !hasImage) return SEED_QUESTIONS` (rad 816 nedan) — fires endast när BÅDA pools är utterly tomma (typ source-toggle off på båda, men Lobby:s "min 1 source"-gate förhindrar normalt). Strippar era som sista utväg så spelet kan starta.
- **Per-spelare-filter (V2)** kan ersätta union-modellen om Peter vill — kräver per-tur-pick i round-block-loopen istället för pool-nivå-filter. Aktuellt pragmatiskt val: union-filter håller round-block-strukturen intakt och fungerar för både Pass-the-Phone och Individual Devices.
- **Main category-filter** (Music/Film/Sport) appliceras EFTER audience-filtret i pipeline:n (= sista filter-steget innan round-block-bygget). HÅRD — inga fallbacks som strippar kategorin. Se "Main categories (Profile-toggle → Lobby-filter → quiz pool-filter)" för detaljer.

## Hints questions (uppdaterad 2026-06-06)

Person-bildfrågor (juridiskt parkerade) ersätts av **Hints** — en split-view-fråga med landsflagga + upp till 15 progressiva ledtrådar. Svarsmekaniken (Letter Grid) är oförändrad.

**Pool-filter (2026-06-06)**: `MIN_HINTS_REQUIRED = 10` — items med färre än 10 hints i HINTS_LIBRARY filtreras bort ur `IMAGE_SEED_QUESTIONS` och når aldrig quiz-poolen. Säkrar att alla spelbara hints-frågor har tillräckliga ledtrådar.

**Layout HintsQuizCard v3** ([src/components/HintsQuizCard.tsx](src/components/HintsQuizCard.tsx)):
- **Vänster kolumn (flex:1)**: kategori-rubrik `{Genre} · {Profession}` (guld, uppercase, ej understruken) + `ScrollView` med punktlista (•) av hints + ↳-subrad för klubbhistorik.
- **Höger kolumn (110px)**: landsflagga (stor emoji, vit `flagInner`-ruta) + personnamn (fade-in vid `isRevealed`). Nationality-chip borttagen. Flaggan täcks av `ProgressiveCover` med `active={mosaicActive ?? hintsActive}` — mosaiken startar 2 s in (via `timerActive/mosaicActive`), 1 s senare än hints.
- **Höjd**: matchar YouTube-player via `flex:1` i `imageMediaCard`-container (`aspectRatio: 16/9`).
- **Timing**: alla hints synliga vid T×**2/3** (`HINTS_ALL_OUT_FRACTION = 2/3`). Auto-scroll till senaste hint.
- **Hint-format**: inga nummerbadges — enbart `•`-punkter, `numberOfLines={1}` (se "Radlängd" nedan). `club`-hints grupperas under "Career History" med `↳`-subrader i kronologisk ordning.
- **Slumpmässigt urval**: `selectHints(library, 15)` i `hintsGenerator.ts` — P5-hints alltid med, P4→P1 slumpas → variation per runda. **Deduplicering på `value.toLowerCase().trim()`** efter sortering — samma faktatext på flera prioritetsnivåer (t.ex. "BRIT Awards" på P3 och P4) visas bara en gång.

**Props** (`hintsActive`, `mosaicActive`, `isRevealed`):
- `hintsActive?: boolean` (default true) — hint-reveal-timers startar inte förrän true. Passar `hintsReady` från quiz.tsx (omedelbart true vid `phase='question'`). Under buffer-period visas `· · ·` placeholder.
- `mosaicActive?: boolean` — passas vidare till `ProgressiveCover` som `active={mosaicActive ?? hintsActive}`. Sätts till `timerActive` (2 s delay) i quiz.tsx för att ge flaggans mosaik längre delay än hints.
- `isRevealed` — när true: alla hints snap:as till fullt synliga oavsett `hintsActive`.

**Hints-synlighet robusthet** (monotonic maxRevealedRef):
- `maxRevealedRef = useRef(0)` — uppdateras varje render till `Math.max(current, revealedCount)`. Aldrig minskar inom en fråga-livscykel (nollställs automatiskt vid remount via `key={questionIndex}`).
- `displayRevealedCount = isRevealed ? hints.length : maxRevealedRef.current` — passas till BulletHint/ClubGroup istället för råa `revealedCount`. Garanterar att hints aldrig försvinner visuellt även om `revealedCount`-state av timing-skäl dippar (t.ex. när `timerActive` → false i awaiting-fas).
- Reveal-effekten splittas i **två separata useEffects**: (1) reset på `[resetKey]` — bara vid ny fråga; (2) staggerad reveal + isRevealed-snap på `[resetKey, totalSeconds, isRevealed, hints.length, hintsActive]` — cleanup stoppar timers men nollställer ALDRIG `revealedCount`.

**Kategori-rubrik** (`{Genre} · {Profession}`): `categoryToGenre` + `categoryToProfession` mappar `HintCategoryLabel` → display-text:
- `Musikartist` → `Music · Artist`, `Band` → `Music · Band`
- `Actor` → `Film · Actor`, `Character` → `Film · Character`
- `Athlete` → `Sport · Athlete`, `Coach` → `Sport · Coach`

**Ingen bullet visas två gånger (Peter 2026-08-12)**: `resolveHints(hints, answer)` i [src/utils/hintsText.ts](src/utils/hintsText.ts) kör HELA text-pipelinen en gång i `HintsQuizCard` och deduplicerar på den **färdiga texten**, inte på råvärdet. Tre olika källor till dubbletter fångas:
- **Identiska råvärden** — Wikidata listar en utmärkelse en gång per vinst, så Glenn Hysén hade två `'Kristallkulan'`-hints (42 bibliotek hade sådana par).
- **Radanpassningen kollapsar olika värden** — "Golden Globe Award for Best Actress – Drama" och "… – Comedy" blir båda `Golden Globe: Best…` (106 bibliotek berörda; en direkt konsekvens av 25-teckensregeln).
- **Censureringen kortar två hints till samma rest.**

⚠ Value-dedupen i `selectHints` räcker INTE: den jämför råvärden och körs dessutom bara i grenen för stora bibliotek (`hints.length > count`) — Hysén har 13 hints och tog early-returnen. Samma fälla som karriärhistoriken hade; **rör du `selectHints`, kolla BÅDA grenarna.**

Text-pipelinen är utbruten ur komponenten till `hintsText.ts` (filter-konstanterna `REDUNDANT_HINT_TERMS`/`NATIONALITY_TERMS`/`SENSITIVE_HINT_TERMS` + `censorSensitive`/`censorForAnswer`/`resolveHintText`/`resolveHints`) så regeln kan enhetstestas — den låg tidigare i `HintsQuizCard.tsx`. `BulletHint`/`ClubSubRow` tar numera färdig text som prop och gör ingen egen filtrering. **Sidoeffekt**: bortfiltrerade ledtrådar tar inte längre upp en reveal-slot — förr returnerade `BulletHint` null medan indexet ändå räknades, vilket gav tysta luckor i takten.

**Hint-filtreringspipeline** (i `resolveHintText`, [hintsText.ts](src/utils/hintsText.ts)):
1. `isRedundantHint(text)` — filtrerar bort hints vars text redan framgår av rubriken (`'music artist'`, `'musician'`, `'recording artist'`).
2. `censorSensitive(text)` — trunkerar vid känslig information (`died`, `death`, `accident`, `crash`, `diagnosed`, `cancer`, `tumor` m.fl.) och returnerar texten *före* matchningen. Returnerar `null` om inget återstår → hint hoppas över. **OBS**: trunkerar (inte kastar) så t.ex. `"Lead singer: Marie Fredriksson (died 2019)"` → `"Lead singer: Marie Fredriksson"`.
3. `censorForAnswer(text, answer)` — trunkerar vid svarets namn (inkl. namndelar >3 tecken) → förhindrar att svaret syns i ledtråden (t.ex. `"Sir Elton John"` → `"Sir"` när svaret är "Elton John").

**`isNationalityHint(hint)`** — ytterligare filter: hint-värden som innehåller ett nationalitetsord (adjektiv ELLER landnamn) vid ordgräns (`/\bterm\b/i`) droppas tyst. Drabbar `birth_place`-typer men även `characteristic`/`merit`/`song`/`movie`-hints om `value` råkar innehålla t.ex. "Swedish", "British", "French", "German", "American", "Norwegian", "Danish", "Japanese" etc. **Regel för `hintsData.ts`**: skriv ALDRIG nationalitetsord i `value`-strängar — använd stadnamn (inte "Stockholm, Sweden" utan "Stockholm"), neutrala adjektiv ("Nordic", "Scandinavian") eller beskrivande omskrivningar. Kör inga filter-ändringar i `hintsText.ts` — bara omfrasera `value`-strängar. Fullständiga termlistor i `NATIONALITY_TERMS` ([hintsText.ts](src/utils/hintsText.ts)). Speciella fall: "French Open" → "Roland Garros"; "English translation" → "international translation"; filmtitlar med känsliga ord → beskrivande omskrivning. **Status (2026-06-22): Fullständig sweep av alla ~145 entries i `HINTS_LIBRARY_MANUAL` klar (commit `06cf50c`) — noll kvarstående träffar på nationalitets- eller känslighetstermerna.**

**Hint-sortering** (`selectHints` uppdaterat): primär sortering på prioritet (P1 first → P5 last), sekundär på `TYPE_ORDER` (module-level konstant i `hintsGenerator.ts`) — hints av samma typ grupperas konsekutivt (alla `'song'`-hints samlade, alla `'album'`-hints samlade etc.).

**Svarsalternativ (5 st, underkategori + genus)**:
- `totalOptions: 5` skickas till `buildImageVariant` (ned till `buildLetterGrid`, `buildNameOptions`, `buildFullNamesList`).
- `allItems` filtreras på `contentSubject` (t.ex. bara `'band'` för band-frågor, bara `'athlete'` för idrottar-frågor) innan `buildImageVariant` anropas. Faller **ALDRIG** tillbaka till `IMAGE_QUIZ_QUESTIONS` (alla subjects) — subject-integritet alltid.
- **Genus-lås (Peter 2026-08-12)**: är rätt svar en kvinna ska ALLA alternativ vara kvinnor, är det en man ska alla vara män. Blandade alternativ gör frågan lättare än avsett — halva fältet kan sorteras bort på en blick utan att man känner igen personen.
  - **Källan är `getPersonGender(itemId)`** ([src/utils/personGender.ts](src/utils/personGender.ts)) = Wikidata **P21**, hämtad av [backend/scripts/fetch-person-gender.ts](backend/scripts/fetch-person-gender.ts) (`npm run fetch-person-gender`, ~15 min för 631 items) till den genererade `personGenderGenerated.ts`. **607 av 631 lösta**; av de 24 olösta ligger 21 utanför region scope och når aldrig en spelare. Manuella rättelser läggs i `PERSON_GENDER_MANUAL`, som åsidosätter den genererade filen så en ny körning aldrig skriver över dem — 3 items ligger där i dag (Michael Owen, N'Golo Kanté, Sergio Agüero, alla avvisade av födelseårs-kontrollen eftersom namnet delas med en annan person). Olösta items rapporteras i `backend/output/person-gender-report.md`. **Täckning inom region scope: 192 av 192 spelbara person-frågor.**
  - **Scriptets disambiguering** (samma princip som `_fetch-wikidata.ts`): `wbsearchentities` på displayName → poäng per träff (exakt namnmatch +15, yrkes-ord i beskrivningen +10, uppenbar icke-person utan yrkes-ord −100, träffordning som tie-break) → kräver positiv poäng. Därefter verifieras `P31 = Q5` (människa) och födelseåret mot befintlig hints-data. **Vid tvekan skrivs inget kön** — ett felaktigt kön är värre än inget, eftersom det låser hela alternativlistan till fel kön. Sök på `displayName` ensamt: katalogens `wikimediaSearchHints` inleds nästan alltid med namnet, så "namn + hint" blir en dublett-fras som Wikidata inte matchar alls.
  - ⚠ **`inferGender(library)` i hintsData.ts kan INTE bära regeln.** Den räknar he/his/him vs she/her/hers i hint-TEXTERNA, men hint-värden är fakta-fragment (`"Billie Jean" (1983)`, `Born: August 29, 1958`) utan pronomen — den gav kön för **16 av 836 items (~2 %)**, så genus-filtret var i praktiken en no-op fram till 2026-08-12. Den ligger kvar som sista fallback i `resolveItemGender` (quiz.tsx) för items P21 inte kunde lösa upp.
  - **Låset är ett GOLV, inte en preferens**: när könet är känt får pool-kedjan aldrig degradera till `sameSubject`. Alla fallback-grenar landar i `poolFloor` (= `sameGender` vid lås), och `distractorNames` skickas som `[]` — den generiska namn-poolen har inget känt kön och skulle annars läcka in fel kön som utfyllnad.
  - **`GENDERED_SUBJECTS`** (quiz.tsx) = `artist, actor, athlete, cultural-person, celebrity`. **`band` saknas MEDVETET** — en grupp har inget kön, så band-frågor är aldrig köns-låsta. Wikidata-scriptet hoppar över dem av samma skäl.
  - Icke-binära (P21 ≠ male/female, t.ex. Demi Lovato) får inget kön → ingen låsning, subject-poolen gäller. Medvetet.
- `buildLetterGrid` garanterar alltid `totalOptions` synliga knappar via dubbla client-filter-speglingar: (1) ord-count-filter; (2) första-bokstavs-dedup (se "Letter Grid-filter" ovan).

**Radlängd — en bullet = EN rad (Peter 2026-08-12)**: `HINT_MAX_CHARS = 25` i [hintsGenerator.ts](src/utils/hintsGenerator.ts). Bryter en ledtråd till två rader hoppar listan och de sena ledtrådarna trycks utanför kortet. 25 är konservativt vid fontSize 16 (~250 px användbar bredd ⇒ ~31 tecken) så det håller även på smala skärmar och med större Dynamic Type.
- `fitHintText(text)` kortar i den ordning informationen är minst värd för gissningen: (1) standardfraser via `HINT_ABBREVIATIONS` (`Academy Award for Best Actress` → `Oscar: Best Actress`), (2) förklarande efterled efter tankstreck (`"Thriller" (1982) — best-selling album…` → `"Thriller" (1982)`), (3) avslutande årtals-parentes (svaret är namnet, inte året), (4) ordvis ellips. `balanceQuotes` lagar hängande citattecken (`"Sällskapsresan 2 – Snowroller"` → `"Sällskapsresan 2"`) men rör inte tum-tecken i längduppgifter (`198 cm (6'6")`).
- `HINT_SUB_MAX_CHARS = 33` för klubb-raderna (↳, fontSize 12 ⇒ 25 × 16/12). `fitClubText` kortar klubbNAMNET men **behåller årtalen** — de bär den kronologiska ordningen.
- `formatHintText` bor numera i hintsGenerator.ts (flyttad från komponenten så selektor och rendering delar den). Prefixen hålls korta eftersom de äter av budgeten: `Singer:` i stället för `Lead singer:`.
- Utfall över hela katalogen: 37 % av ledtrådarna är för långa i råform, 24 % slutar med ellips efter förkortningen. Vill man ha luftigare text är `HINT_MAX_CHARS` enradsändringen.

**Karriärhistorik alltid kronologisk (Peter 2026-08-12)**: `orderCareerHistory` i `selectHints` samlar ALLA `club`-hints i **ett** block sorterat på startår (odaterade sist), placerat där den första klubben låg. Fixar två fel: (a) klubbar ligger på olika prioritetsnivåer (ikonisk klubb = P4, övriga = P3) och splittades av prioritetssorteringen i två separata "Career History"-grupper; (b) inom en grupp var ordningen slumpad av `shuffleArray`. Körs i BÅDA `selectHints`-grenarna — även early-returnen för små bibliotek (`hints.length <= count`), som är den vanliga vägen för idrottare och var den som saknade sorteringen först.

**Pool-urvalet är utbrutet** till [src/utils/hintsDistractorPool.ts](src/utils/hintsDistractorPool.ts) (`buildHintsDistractorPool(correctItem, allItems)` → `{ itemPool, genderLocked }`). Ren funktion utan React så regeln kan testas; quiz.tsx:s `imageVariant`-useMemo anropar den och skickar `genderLocked ? [] : DISTRACTOR_POOL_NAMES[...]` vidare till `buildImageVariant`.

**Mojibake i katalogen (fixad 2026-08-12)**: `artists-gen-x.yaml` var dubbelkodad (UTF-8-bytes lästa som CP1252 och sparade som UTF-8 igen) — 9 displayNames nådde spelaren som `Carola HÃ¤ggkvist`, `ThÃ¥strÃ¶m` osv., och Wikidata-uppslag på dem gav noll träffar. Reparerat med [backend/scripts/_fix-mojibake.js](backend/scripts/_fix-mojibake.js) (42 sekvenser + BOM) följt av `npm run export-image-questions`. ⚠ Reparationen kräver **CP1252**-tabellen, inte Latin-1 — bytes 0x80–0x9F (em-streck, typografiska citattecken) mappar olika. Kolla nya katalogfiler med `grep -c "Ã"`.

**Svenska proffsgolfare (Peter 2026-08-12)**: 9 golfare kurerade med 12–14 manuella hints var. 6 nya i [athletes-sweden-golf.yaml](backend/content/catalog/athletes-sweden-golf.yaml) (Neumann, Alfredsson, Nordqvist, Grant, R. Karlsson, Norén — fil-header `audience: ["gen-x","millennials"]` + item-level override per era eftersom de spänner gen-x → gen-z); Parnevik, Stenson och Åberg låg redan i katalogen men hade bara 4–5 auto-genererade hints och nådde alltså aldrig poolen.
- **Skriv `'Professional golfer'` som profession-värde** — `inferSport`:s `SPORT_KEYWORD_MAP` matchar exakt den frasen och ger golfarna varandra som svarsalternativ i stället för godtyckliga idrottare.
- **Nationalitetsfällan i turneringsnamn**: "British Open" / "Women's British Open" / "Scottish Open" innehåller termer i `NATIONALITY_TERMS` och hade tyst raderat hela raden. Använd "The Open", "Women's Open title", osv. ("U.S. Women's Open" och "European Tour" är däremot ok — varken `u.s.` eller `european` står i listan.)
- Ingen `club`-typ används — golf har ingen klubbkarriär att lista.

⚠ **`export-image-questions.ts` gatade på `.webp`** och höll därför tyst nytt hints-innehåll utanför poolen (de 6 golfarna + Håkan Mild och Jonas Thern). Sedan person-bilderna parkerades juridiskt renderar en image-fråga bara flagga + ledtrådar och rör aldrig bildfilen (`getQuizImage` är utkommenterad i quiz.tsx), så exporten unionar numera webp-listan med items som har ≥10 hints (`listHintOnlyIds`). 836 → **844 exporterade frågor**. Ett nytt hints-item behöver alltså INGEN bild.

**Tester**: [backend/content/test/hints.test.ts](backend/content/test/hints.test.ts) (16 st) låser alla fyra reglerna — genus (täckning + köns-homogen pool + 5 byggda alternativ), radlängd + citattecken, inga dubblerade bullets, kronologi + ett block. Ligger i backend-sviten eftersom det är repots enda vitest-harness, men importerar klient-modulerna under `src/utils`. Genus- och dubblett-testerna kör mot items **inom region scope** (samma två filter som quiz.tsx) — katalogen har ~470 items som aldrig visas och skulle annars förorena mätningen.

**Slott**: `SENSITIVE_HINT_TERMS` och `REDUNDANT_HINT_TERMS` i [hintsText.ts](src/utils/hintsText.ts) — lägg till termer vid behov utan kodingrepp på logik.

**Typ-system** ([src/utils/hintsData.ts](src/utils/hintsData.ts)):
```ts
type HintType = 'profession' | 'birth_date' | 'birth_place' | 'peak_year' | 'debut'
              | 'song' | 'album' | 'movie' | 'tv_show' | 'lead_singer' | 'band_member'
              | 'member_count' | 'creation_year' | 'producer' | 'characteristic'
              | 'height' | 'jersey_number' | 'club' | 'merit';

interface HintItem { id, type, label, value, priority: 1|2|3|4|5 }
// P1 = warm-up/profession (visas FIRST)  →  P5 = allra mest ikoniskt (visas LAST, alltid med)

type HintCategoryLabel = 'Musikartist' | 'Band' | 'Actor' | 'Athlete' | 'Coach' | 'Character';

interface HintLibrary { categoryLabel, nationality, hints: HintItem[] }
```

**Prioritets-system** (displayordning ASC, P1 först → P5 sist):
- P1: warm-up, profession, generell fakta
- P2: biografisk (födelsedag, födelseort, karriärspann)
- P3: verk/karriärfakta (låtar, filmer, klubbar) — **HÄR KAN SLUMPEN VARIERA**
- P4: starka identifierare (mest kända verk, ikonisk klubb)
- P5: allra mest ikoniskt (alltid inkluderat, signaturdrag, #1-hit)

**`HINTS_LIBRARY_MANUAL`** (~145 manuellt kuraterade items, 122 av 135 ej-unknown har ≥10 hints). Struktureras som `const HINTS_LIBRARY_MANUAL` + importerat `HINTS_LIBRARY_GENERATED` (auto-gen via script) → `export const HINTS_LIBRARY = { ...generated, ...manual }` (manuella åsidosätter). Kategorier inkluderar: Artists × 4 gen, Actors × 4 gen, Athletes (svenska + internationella), Band (svenska + internationella), Characters (animerade + fiktiva roller).

**`HINTS_REGION_MAP` är @deprecated sedan 2026-08-11 — RÖR DEN INTE FÖR ATT ÄNDRA REGION.**

Bild-items hade tidigare **TVÅ** region-sanningar: katalogens `region:` exporterades aldrig, så klienten läste `HINTS_REGION_MAP` i stället. 411 av 487 items motsade varandra (t.ex. Tom Hanks `["sweden"]` i katalogen men `global` i spelet; Audrey Hepburn `["sweden"]` i katalogen men helt utesluten). Fältet man naturligt redigerade var det som inte gjorde något.

**Migrationen** (commit `b7b4c7d`) gjorde katalogen till enda källan:
1. 488 items fick sin levande region skriven till katalog-YAML:en.
2. `export-image-questions.ts` emittar nu `region` (union över fil-träffar, samma princip som `audiences`).
3. [quiz.tsx](app/quiz.tsx) filtrerar bild-items med **exakt samma anrop** som musik-items:
   ```ts
   IMAGE_QUIZ_QUESTIONS.filter(q => isItemInRegionScope(q.region, PLAYER_COUNTRY) && …)
   ```
4. `fetch-hints-data.ts` läser katalogens `item.region`; dess `loadManualRegionMap`-regexskrapning är borttagen.

Verifierat: **836/836 bild-frågor hade identisk synlighet före/efter.**

**Ändra region → redigera `backend/content/catalog/*.yaml` + kör `npm run export-image-questions`.** Map:en ligger kvar som historiskt underlag; ingen kod läser den, och `getHintRegionScope` är en oanvänd accessor som kan raderas när migrationen suttit ett par releaser. `HintRegionScope`-typen har `'all'` som deprecated alias för `'global'`.

**`selectHints`** ([src/utils/hintsGenerator.ts](src/utils/hintsGenerator.ts)): tar `HintLibrary` + `count=15`. Alltid alla P5. Fyller upp med P4→P1 (shuffle per prioritetshink). Sorterar ASC för display (P1 first). Fisher-Yates shuffle → ny kombination varje runda.

**Auto-generering** ([backend/scripts/fetch-hints-data.ts](backend/scripts/fetch-hints-data.ts)):
- Läser alla YAML image-katalog-filer, filtrerar bort manuella items + allt som inte når en spelare (`isRegionIncluded` speglar hierarkin: `global/europe/nordic/sweden` inkluderas, `unknown-region` inte).
- Wikidata API: `wbsearchentities` + `wbgetentities` → P569 (bd), P19 (bp), P27 (nationality), P106 (occupation), P54 (clubs+dates), P1618 (jersey#), P2048 (height), P166 (awards), P800 (notable works).
- Throttle 3 req/sek (~4-10 min för full körning). `--resume` återupptar avbruten körning. `--dry` visar utan att skriva.
- Output: `src/utils/hintsDataGenerated.ts` — `HINTS_LIBRARY_GENERATED` tom placeholder tills script körts.
- Kör: `cd backend && npm run fetch-hints-data` (eller `fetch-hints-data-dry` / `fetch-hints-data-resume`).
- **Bugg fixad 2026-08-11**: `isRegionIncluded` exkluderade `'global'` enligt taggens GAMLA innebörd och hade hoppat över hints-generering för alla 312 globalt igenkända items. (Den tidigare noterade stavfels-fällan kring `loadManualRegionMap` är obsolet — funktionen är borttagen.)

**Demo** ([app/guess-who-demo.tsx](app/guess-who-demo.tsx), route `/guess-who-demo`): person-picker, assistance, svarstid, Replay + Reveal. Importerar `HINTS_LIBRARY` och passerar `library={HINTS_LIBRARY[id]}` till `HintsQuizCard`.

**quiz.tsx-integration:**
- `ImageQuestion.hints?: HintLibrary` (ersatte `hints?: PersonHints`).
- `IMAGE_SEED_QUESTIONS`: `hints: HINTS_LIBRARY[q.id]` (undefined för items utan manuell/auto-gen data → `HintsQuizCard` visar `· · ·` placeholder-rader).
- Rendering: `question.type === 'image'` → `<View style={styles.imageMediaCard}><HintsQuizCard library={question.hints} .../></View>`.
- Era-filter-fix bevarad: person-items utan `peakFrom/peakTo` är era-agnostiska.

**Svarsmetod** (oförändrad): `<ImageAnswerBlock>` — Letter Grid → Final Selection. `isRevealed` skickas till HintsQuizCard (visar namn + snappar ProgressiveCover).

## ~~Signature Doodle + Guess Who (split-view)~~ — RADERAD 2026-08-17

Hela sketch-/doodle-pipelinen är **borttagen ur repot**. Den var en prototyp (PIVOT 2026-05-29: fal.ai text-till-bild-doodle utan foto-input + progressiva ledtrådar) som aldrig wire:ades till live-quiz, och **Hints ersatte den funktionellt** — `HintsQuizCard` gör redan jobbet med flagga + upp till 15 ledtrådar.

Raderat: `backend/sketch/` (doodle.ts, doodle-briefs.ts, batch-doodle.ts, generate.ts, source.ts, vectorize.ts, blueprint.ts), `assets/quiz-sketches/` (31 filer), `src/utils/quizSketches.ts`, `src/utils/guessWhoDemo.ts`, `src/components/SketchCanvas.tsx`, `src/components/NameRevealCard.tsx`, `src/components/GuessWhoSplitView.tsx`, routerna `/sketch-demo` + `/guess-who-demo`, samt npm-scripten `sketch-generate`, `doodle-generate`, `doodle-batch`, `sketch-source`, `sketch-vectorize`, `sync-quiz-sketches`.

Kvar: `sketchEnabled`-flaggan + `lobby_settings.sketch_enabled` (migration 0013) är fortfarande död plumbing i LobbyScreen/mockLobbySettings, default AV — se "Lobby — Game Settings card".

Historik/rationale finns i git fram t.o.m. commit `faa8dca` och i [memory/project_sketch_pipeline_direction.md](../.claude/projects/C--Users-46725-quizvibe-app/memory/project_sketch_pipeline_direction.md). `@fal-ai/client` + `potrace` i `backend/package.json` användes bara här och kan avinstalleras.

## Spotify DJ-läge (uppdaterad 2026-07-22 — PLAN B: ren URL, ingen OAuth)

**PLAN B-BESLUT 2026-07-22 (juristens svar på LEGAL-INTEGRATIONS-BRIEF.md)**: Spotify API-användning (även enbart OAuth + Premium-verifiering) är inte preferred → V1 kör **"Plan B": ren URL-länk, noll Spotify-API**. Ingen OAuth, ingen tokenlagring, **inget Spotify Premium-krav** (Premium *rekommenderas* i copy — Spotify Free kan spela annonser/fel låt). DJ-behörighet = **self-attest**: user bekräftar manuellt "jag har Spotify-appen". Ingen QR-kod (Plan C förkastad); "Start track in Spotify"-knappen kvarstår. Konsekvenser: Spotify Developer Dashboard + Extended Quota-ansökan behövs INTE för V1; guests kan delta i Spotify-lobbies (attest i lobbyn).

**Arkitektur: "Ren URL Deep Link"** — appen öppnar Spotify-appen via `Linking.openURL('spotify:track:ID')` med fallback till `https://open.spotify.com/track/ID` (web player / App Store-prompt) om schemat failar. OS-länk, inte API-anrop. **Autoplay är inte garanterat** — Spotify styr; timer-aktiverar-flödet absorberar båda fallen (timern startar först när någon hör musik). DJ-guide-steg säger "press Play in Spotify" vid behov.

**Self-attest-modellen**:
- `ProfileData.spotifyAppConfirmed?: boolean` (default false, AsyncStorage-only — ingen DB-kolumn) — sätts av "Spotify user"-toggeln i Profile:s Mixerboard-rad (default AV). Gated: DJ-default-toggeln (`spotifyDefaultEnabled`) är disabled tills attest.
- Lobby: `spotifyConnected`-state/fält betyder nu "self-attestad", seedas från `profile.spotifyAppConfirmed` (host focus-effect + non-host code-only-join) — **install-verifierat vid seedningen**, se "Install-verifiering av attesten" nedan. Lobby-radens "I have the Spotify app"-länk (f.d. Connect) attesterar in-lobby: `handleConnectSpotify` (verifierar) → `applySpotifyAttest` / `handleDisconnectSpotify` är lokala attest-handlers som behåller sina side-effects (spelarkort-patch + `upsertOwnLobbyPlayer` → `spotify_verified`) och skriver tillbaka `spotifyAppConfirmed` till profilen.
- PlayerRow-badge: "Spotify ready" (grön) / "No Spotify" (grå) — info till host/lobbyn.
- Alla lobby-guards (toggle-on Check 1–2, approve Check 3–4, handleStartGame-guard) kvar med samma mekanik, omformulerade utan "Premium"/"account". Pre-join-gates i [app/index.tsx](app/index.tsx) BORTTAGNA (ingen OAuth-status att slå upp; approve-guards täcker).

**Install-verifiering av attesten (2026-08-09)** — attesten är inte längre ren tillit. `checkSpotifyInstalled()` i [spotifyDJ.ts](src/utils/spotifyDJ.ts) kollar om Spotify-appen finns på enheten. **Detta är INTE ett Spotify-API-anrop** — `Linking.canOpenURL('spotify:')` är en ren OS-fråga som aldrig kontaktar Spotifys servrar, samma juridiska kategori som deep linken (noll policy-exponering). Native-konfigurationen fanns redan oanvänd i [app.json](app.json): `ios.infoPlist.LSApplicationQueriesSchemes: ["spotify"]` + `android.queries: [{ package: "com.spotify.music" }]`.

- **Tre lägen, ALDRIG en boolean**: `SpotifyInstallCheck = 'installed' | 'not-found' | 'unknown'`. Med en boolean skulle `false` betyda både "saknas" och "vet ej" — och eftersom `canOpenURL` **alltid returnerar false i Expo Go** (Expo Go har egen Info.plist utan vårt scheme) hade varje legitim användare blockerats under utveckling. Expo Go detekteras via `IS_EXPO_GO` i [runtimeEnv.ts](src/utils/runtimeEnv.ts) (utbruten ur `iap.ts`, som nu importerar den) → `'unknown'`.
- **FAIL-OPEN överallt**: `'installed'` och `'unknown'` passerar tyst; bara `'not-found'` varnar, och användaren kan ALLTID köra vidare ("Turn on anyway" / "Start anyway"). Ett falskt nej som låser ute en riktig användare är värre än ett falskt ja.
- **ENDAST NEDGRADERING, aldrig auto-uppgradering**: attesterad + appen saknas → av. Appen finns men användaren har inte attesterat → fortsatt av. Toggeln bär **avsikt**, inte bara förmåga — någon kan ha Spotify installerat och ändå inte vilja ha DJ-rollen (barnets konto, mobildata, vill inte lämna appen mitt i spelet).
- **Verifieringen körs lokalt men når host**: en enhet kan bara kolla sig själv. Resultatet åker däremot via befintlig transport — `spotifyConnected` → `lobby_players.spotify_verified` → hostens `syncNonHostFields`-poll → PlayerRow-badgen. Host får alltså verifierad status om alla spelare utan att någonsin fråga någon annans enhet. Ingen UI-ändring behövdes; approve-guards (Check 3–4) läser samma fält och blir träffsäkrare gratis.
- **Fyra call-sites**: (1) Profile "Spotify user"-toggle på (`handleToggleSpotifyUser`); (2) Lobby-attest — `handleConnectSpotify` verifierar och delegerar till utbrutna `applySpotifyAttest()`, vilket täcker ALLA tre attest-ingångar (switchen + "I have Spotify"-knapparna i `handleToggleSpotifyEnabled` och `handleStartGame`); (3) join-tid, non-host code-only-join + host focus-effect (host-grenen behöver **egen `active`-guard efter awaiten**); (4) `handleStartGame`-pre-flight, som MÅSTE ligga före credit-blocket så en avbruten start aldrig kostar en credit — använder module-level `confirmAsync()` (await-bar Alert) i stället för en extra parameter, vilket undviker `ptpConfirmed`-rekursionen och Pressable-event-fällan.
- **Nedgraderingen skrivs ALDRIG tillbaka till profilen**, och Profile-skärmens load-effekt verifierar MEDVETET inte: lobby-raden speglar nuläget, Profile-toggeln speglar avsikten. Tyst rensning hade fått användaren att senare hitta sin Profile-toggle avslagen utan förklaring. I stället visas lobby-attestraden av med röd ram — slår användaren på den igen körs `handleConnectSpotify` och dess varning. Synlig, överstyrbar, självläkande loop.
- **`openSpotifyTrack`/`openSpotifyApp` gatar ALDRIG** på `canOpenURL` (kommentaren vid deras `openURL`-anrop förklarar varför) — deep linken måste fungera i Expo Go. Bara attesten gatar.
- **Testas i dev-build, inte Expo Go** (`npx expo run:ios`) — checken är inert där per design.

**Arkiverad OAuth-kod (FUTURE VERSION 2)**: hela `src/lib/spotify.ts` (PKCE, connectSpotify, token-refresh, /v1/me) + `getSpotifyConnectionStatus` i spotifyDJ.ts. Vid V2-reaktivering: Spotifys godkännande krävs, återskapa `spotify_connections` (migration 0015), lägg tillbaka playback-scopes, re-connect för users.

**Flöde per Spotify-fråga (Individual Devices)**:
1. Host broadcastar `spotify_question_ready` (trackId + djPlayerId) via `quiz_sync`-channel
2. DJ:n ser "You are the DJ"-kort + "Start track in Spotify"-knapp
3. DJ tappar → `openSpotifyTrack(trackId)` → Spotify-appen öppnar låten (autoplay ej garanterat — DJ trycker Play vid behov)
4. DJ broadcastar `spotify_dj_track_started` → gissarnas statustext uppdateras
5. Gissarna ser årsväljare/svarsalternativ + timer — inget Spotify-innehåll i appen
6. Timer → 0 → normal reveal (titel/artist/år från egen katalog). DJ tar sig manuellt tillbaka till QuizVibe

**Supabase** (migration `0015` + **`0025_drop_spotify_connections.sql`**):
- `spotify_connections` — **DROPPAD i 0025** (GDPR: OAuth-tokens ska inte ligga vilande). Återskapas via 0015 vid V2.
- `lobby_players.spotify_verified` — KVAR; betyder nu self-attest (inte OAuth-verifiering)
- `lobby_settings.spotify_enabled` — KVAR; host:s val för DJ-läget
- Appliceras manuellt via Supabase SQL editor (som övriga migrations)

**DJ-rotation** (`src/utils/spotifyDJ.ts`):
- **Track-baserad** (INTE positions-baserad): varje `TimelineQuestion` med `spotifyTrackId` satt ÄR per definition en Spotify-runda
- `computeDJRotationPlan(totalQuestions, players)` — deterministisk, beräknad en gång i quiz.tsx `useMemo`
- `getDJForQuestionIndex(plan, questionIndex)` — returnerar vilken spelare som är DJ
- `openSpotifyTrack(spotifyTrackId)` — deep link + fallback till web-URL
- `fetchSpotifyAlbumArt(trackId)` — Spotify Web API `/v1/tracks/{id}` → album art URL

**Rendering i quiz.tsx** (tre grenar i mediakortet):
1. `isSpotifyQuestion && isCurrentPlayerDJ` → **DJ-vy**: mörk grön bakgrund, "You are the DJ", "Start track in Spotify"-knapp, `canConfirm = false` (DJ svarar inte). ⚠ **DJ:n får INGEN RoundScore för sin egen Spotify-fråga (2026-08-28, Peter).** Tidigare registrerade DJ-enhetens timeout-effekt ett `0/false`-svar som broadcastades till alla → DJ:n dök upp som "Wrong Answer" i reveal-facitet OCH räknades i leaderboardens Q-kolumn. Nu returnerar timeout-effektens `phase === 'question'`-gren tidigt för DJ:n (`isSpotifyQuestion && isCurrentPlayerDJ` → bara `setPhase('reveal')`, ingen `setRounds`/`recordRoundScore`), med en belt-and-suspenders-guard överst i `recordRoundScore` som extra spärr. Utan post attribueras frågan aldrig till DJ:n på NÅGON enhet (den skulle annars broadcastats vidare), så DJ:ns DJ-fråga faller bort ur leaderboardens Q-räkning, ✓/✗-tallies, "Last 5" OCH DJ:ns egen Player-history — allt konsistent. **Följd (avsiktlig, ej bugg): DJ:n har genuint en fråga färre, så DJ-spelarens Q-kolumn visar t.ex. `3` medan övriga visar `4` i ett 4-rundorsspel.** DJ:ns EGEN reveal-vy visar fortfarande grönt via `wasCorrect = isCurrentPlayerDJ ? true`.
2. `isSpotifyQuestion && !isCurrentPlayerDJ` → **Gissare-vy**: albumomslag (async fetch) + statusrad "Waiting for DJ…" → "DJ is playing!"
3. Övriga frågor → befintlig YouTube/Image-rendering

**Reveal-facitet "All Players" (`revealAnswerSummary`, IndDev)** har en tredje sektion **DJ** (grön rubrik `#1DB954`) ovanför Correct/Wrong (2026-08-28). Den listar DJ-spelaren för Spotify-frågan — slås upp i `turnOrder` på `effectiveDJId` (så full `TurnOrderPlayer` med avatarUri fås). Eftersom DJ:n inte längre har någon RoundScore (se ovan) faller den ur Correct/Wrong av sig själv; `revealAnswerSummary` skippar dessutom DJ:n explicit ur båda listorna (belt-and-suspenders mot stale scores) och exponerar `dj: TurnOrderPlayer | null`. Kortet renderas nu även när `byPlayer.size === 0` så länge en DJ finns.

**`SpotifyNowPlayingOverlay`** ([src/components/SpotifyNowPlayingOverlay.tsx](src/components/SpotifyNowPlayingOverlay.tsx)) — slide-up bottom-sheet som visas ovanpå quiz-vyn när en Spotify-fråga är aktiv:
- Innehåller: albumomslag (56×56, fallback Spotify-ikon) + spårnamn + artistnamn + play/pause-knapp (SVG Rect-pause / Polygon-play) + dismiss-X (SVG Lines, `strokeWidth=5`) + "Activate Timer"-knapp (grön, bara för aktiva DJ:n via `canActivate`-prop).
- **`canDismiss` prop** (default `true`): skickas från quiz.tsx som `phase !== 'question'` — X-knappen kan inte aktiveras förrän svarstiden gått ut.
- **`showDismiss = canDismiss && !isPlaying`**: X-glyfen är osynlig (`dismissGlyphHidden: opacity 0`) tills DJ pausat låten. Om DJ startar om → glyfen försvinner igen.
- **Pulserande X** (native driver): `Animated.loop(sequence([1→1.2 800ms, 1.2→1 800ms]))` på `dismissPulse` Animated.Value — körs bara när `showDismiss=true`, stoppas annars med `dismissPulse.setValue(1)`.
- SVG imports: `import Svg, { Line, Polygon, Rect } from 'react-native-svg'`.

**DJ-handover — tvåflagge-mönster** i quiz.tsx:
- **`djDismissedOverlay`**: sätts `true` när DJ trycker "Track has been stopped in Spotify" (hette "Spotify song has been stopped" t.o.m. 2026-08-28) → döljer scroll-zonens knappar, aktiverar guide-steg 5.
- **`djHandedOver`**: sätts `true` → låser upp host:s Next-knapp. **Host-DJ: sätts direkt** i "Track has been stopped in Spotify"-handlern (ingen extra "End DJ"-knapp). **Non-host-DJ: kräver separat "End DJ — handover to Host"-knapp-tap** i `revealNextAbsolute`.
- Båda flaggor resetas i questionIndex-effekten.

**`djStep`-beräkning**:
```ts
const djStep = !spotifyDJOpenedApp ? 0
  : !spotifyDJStarted ? 1
  : djDismissedOverlay ? 4
  : phase === 'reveal' ? 3
  : 2;
```

**Guide-steg-arrayer** (`SPOTIFY_DJ_STEPS` / `SPOTIFY_GUESSER_STEPS`, 5 steg, `as const`). Steg 5 (index 4): `'Press End DJ - handover to Host / Next button below'`. Steg 4 innehåller `[r]"X"[/r]`-markup för inline röd text. `renderStepText(text)` (module-level helper i quiz.tsx) parsar `[r]...[/r]`-segment och returnerar `<Text style={{ color: '#FF3B30', fontWeight: '700' }}>` för de matchade delarna.

**Reveal-fas DJ handover-block** (`rv.revealNextAbsolute`):
- **Non-host DJ + `djDismissedOverlay`**: pulserande "End DJ — handover to Host"-knapp (via `nextTabPulse`). Tap → `broadcastSpotifyDJHandover()` → `djHandedOver=true` på alla enheter → host:s Next-knapp visas.
- **Host DJ**: "End DJ"-knappen visas aldrig — `djHandedOver` sätts direkt vid "Track has been stopped in Spotify". Host ser direkt den pulserande Next-knappen.
- **Non-host gissare**: "Waiting for DJ to handover to Host" + SequentialDots tills `djHandedOver`.

**Reveal-fas scroll-zon för DJ** (när `!djDismissedOverlay`): Correct year-ruta direkt under question-card (utanför scroll-zonen som separat element), sedan scroll-zonen med: pulserande "Open Spotify"-knapp + "OR"-separator + pulserande "Track has been stopped in Spotify"-knapp. Båda knappar wrappar `<Animated.View style={{ transform: [{ scale: nextTabPulse }] }}>`.

**Alla DJ-CTA:er pulsar (2026-08-28, Peter).** "Start track in Spotify" (djStep 0) via `djStartPulse`-loopen (scale 1↔1.05 + `djStartGlow`-halo); "Open Spotify" (BÅDE reveal-grenen OCH djStep 1/2 under frågan), "Track has been stopped in Spotify" och "End DJ — handover to Host" via `nextTabPulseStyle`. djStep 1/2:s "Open Spotify" saknade tidigare pulse — den är nu wrappad som de andra.

**Reveal-kort per Spotify-svarstyp** (2026-07-03, i quiz.tsx scroll-zone):
- **Spotify/Year (DJ + non-DJ)**: `"Correct year: [Year]"` + undertext `"Titel — Artist"` (från `question.hint`). DJ har ingen ✓/✗-badge (DJ svarar inte). Non-DJ har badge.
- **Spotify/Name (non-DJ)**: inget separat reveal-kort — inline Letter Grid-badges per prefix-rad kommunicerar rätt/fel.
- **Spotify/Name (DJ)**: dedikerat reveal-kort `"Correct Name: [Artist]"` + undertext `"[Year] · Titel — Artist"`. Artist extraheras via `question.hint?.split(' — ').pop()`.
- **`confirmedCorrect`-state** (sätts i `handleConfirm` + time-out): används i reveal-kortet istället för att räkna om från `selectedYear` — robust mot att `selectedYear` nollställs av `play_command`-reset efter confirm.

**Frågetext för Spotify-frågor** (2026-07-03): kompakt font (16px brödtext / 24px nyckelord, vs normala 18px/30px) med `adjustsFontSizeToFit` + `numberOfLines={1}` för att alltid rymmas på en rad. Ger mer vertikal yta åt prefix-rutorna vid Spotify/Name-frågor. Icke-Spotify-frågor påverkas inte.

**Spotify/Name — distraktor-relevans** (2026-07-03): svarsalternativen för Spotify/Name-frågor lager-filtreras så de matchar rätt svar i typ (band vs solo), land och kön — svensk kvinnlig soloartist får andra svenska kvinnliga soloartister, amerikanskt band andra amerikanska band.
- **[src/utils/spotifyArtistMeta.ts](src/utils/spotifyArtistMeta.ts)** — kuraterad tabell `SPOTIFY_ARTIST_META` med `{ type: 'artist'|'band', gender: 'male'|'female'|'mixed'|null, country }` för ALLA artister med `spotifyTrackId` i katalogen (92 st 2026-07-03). Nyckel = artist-delen av displayName efter " — ", lowercase. `getSpotifyArtistMeta(name)` provar exakt match, sedan delen före " ft./feat.". **Curator-regel: ny låt med spotifyTrackId → lägg till artisten i tabellen.** Saknad entry kraschar inget — frågan faller tillbaka till ofiltrerad artist+band-pool.
- **Varför manuell tabell**: bara ~40% av Spotify-artisterna finns i bildpoolen/HINTS_LIBRARY, och `inferGender` (pronomen-räkning) är opålitlig för artister (The Weeknd → 'female' pga låttext-pronomen). Kön tas därför ALDRIG från inferGender i denna flow — bara från meta-tabellen; nationalitet för bildpool-kandidater tas från `inferNationality(HINTS_LIBRARY[id])`.
- **Lager-kedja** (quiz.tsx `spotifyNameVariant`-effekten, striktast → lösast, minst 4 distraktorer per lager): typ+land+kön → typ+land → *(endast icke-svenska artister:)* typ+internationell+kön → typ+internationell → typ+kön → typ → allt. Internationell-lagren (country ≠ null/'sweden') förhindrar att t.ex. Eagles (USA-band) får svenska dansband som alternativ när USA-band-poolen är för tunn.
- **Kandidat-källor**: bildpoolens artist/band-items (`IMAGE_SEED_QUESTIONS[].source`) + `SPOTIFY_ARTIST_CANDIDATES` (module-level i quiz.tsx: alla Spotify-artister ur MUSIC_QUESTIONS med meta, som syntetiska ImageQuizQuestion-items). Featured-delen strippas i kandidat-NAMN ("Jay-Z ft. Alicia Keys" → distraktorn "Jay-Z") men meta-lookup sker på fulla strängen. Dedup på lowercase-namn, rätt svar exkluderas.
- **Bug-fix i samma pass**: tidigare version filtrerade `IMAGE_SEED_QUESTIONS` på `q.contentSubject` — fältet finns bara på `q.source`, inte på ImageQuestion-toppnivån → filtret gav ALLTID tom pool och alla distraktorer kom från generiska `DISTRACTOR_POOL_NAMES` (därav dålig relevans). Prefix-läget kan fortfarande dra in enstaka pool-namn när Letter Grid-reglerna (unika förstabokstäver + samma ordantal) uttömmer de relevanta kandidaterna.

**Stale heartbeat-guard + heal-ref-reset (fix 2026-07-18, del 2)**: aktiverarens 5s-heartbeat (`spotify_dj_track_started`-re-broadcast) kan överleva ett frågebyte — om aktiverarens enhet var backgroundad/låst vid `question_advance` missas broadcasten (Realtime replayar inte), heartbeat-effektens cleanup körs aldrig, och när enheten väcks fyrar det frusna intervallet FÖRE ping-heal:en synkat questionIndex → FÖRRA frågans `timer_start_at` (minuter gammal) broadcastas. Mottagaren (host) latchade stale `spotifyDJStarted=true` + stale `hostTimerStartAtRef` → timerActive-effekten auto-aktiverade timern vid question-entry → startTimer:s elapsed-kompensation gav `timeLeft=0` → omedelbar timeout + reveal INNAN någon tryckt Activate Timer (host såg "✗ Wrong Answer" + guide-steg 1–3 auto-checkade + Activate Timer-knappen visades aldrig eftersom dess gate kräver `phase==='question'`). Två fixar i [app/quiz.tsx](app/quiz.tsx): (a) **Receiver stale-guard** i `onSpotifyDJTrackStarted` — payload:ens `spotify_track_id` måste matcha `currentSpotifyTrackIdRef.current`, annars ignoreras broadcasten (track-ID:t identifierar frågan; refspegeln läses eftersom handlern registreras en gång med `[isHost]`-deps). (b) **Ping-heal ref-reset** — `hostActivePing`-handlerns questionIndex-sync nollställer `hostTimerStartAtRef` + `spotifyTimerStartAtRef` vid index-drift (questionIndex-effekten resetar bara state, inte refs; `handleAdvanceToNextRound` körs inte i heal-vägen) så en heal:ad enhet inte bär förra frågans stämplar in i nästa question-entry.

**DJ-away sticky-unstable-undantag (fix 2026-07-18)**: non-host-DJ:n som tappar "Start track in Spotify" backgroundar avsiktligt appen → connection-monitorn rapporterar `unstable` vid återkomsten (frusna heartbeats/Realtime-socket i bakgrunden) → `stickyUnstableForQuestion` latchade (`!isHost`-gated, så host-DJ i runda 1 drabbades aldrig) → "Reconnecting…"-overlay → OK-tap → `phase='intro'` → host:s `play_command`-rebroadcast (onPlayerRejoined) → NY 3-2-1-countdown mitt i frågan, osynkat med host som väntar i question-vyn på att aktivera timern. Fix i [app/quiz.tsx](app/quiz.tsx): `isDJAwayInSpotify = isSpotifyQuestion && isCurrentPlayerDJ && spotifyDJOpenedApp` — (a) sticky-latch-effekten latchar INTE när flaggan är satt, (b) `shouldLockForUnstable` AND:as med `!isDJAwayInSpotify` så även live-overlay-flashen (2s hysteresis) suppressas vid DJ:ns återkomst. Speglar D-vi-undantaget för host-disconnect-grace (`spotifyDJStarted`). Flaggan nollställs per fråga via questionIndex-effektens `setSpotifyDJOpenedApp(false)` — genuina nätverksfel latchar igen på nästa fråga. Latch-effekten + `shouldLockForUnstable`-deriveringen flyttades ned efter Spotify DJ-state-deklarationerna (state-deklarationen `stickyUnstableForQuestion` ligger kvar tidigt); alla konsumenter ligger senare i filen så ordningen är säker.

**`openSpotifyApp()` vs `openSpotifyTrack(id)`** (i `src/utils/spotifyDJ.ts`):
- `openSpotifyTrack(id)` → `spotify:track:<id>` → startar låten **från början**. Används BARA av "Start track in Spotify" (steg 0, första gången). OBS: deep-linken garanterar INTE autoplay — beroende på Spotify-appens tillstånd (kall vs varm start, autoplay-inställning) kan DJ:n behöva trycka Play manuellt i Spotify. Förväntat beteende (DJ-guide steg 1 "Open Spotify and start the track"); timern startas ändå först när timer-aktiveraren hör musiken. Kan inte forceras i V1 — playback-scopes är borttagna per LEGAL-INTEGRATIONS-BRIEF (Web API-resume arkiverad som FUTURE VERSION 2).
- `openSpotifyApp()` → `spotify:` → tar Spotify till förgrunden **utan att röra uppspelning**. Används av ALLA "Open Spotify"-knappar (steg 1/2 under frågan + reveal-fasens knapp) så låten inte startas om från början när DJ navigerar tillbaka. **Priset (accepterat av Peter 2026-08-28): DJ:n landar där Spotify senast var — ofta bara mini-playern, inte spårets/spellistans fullvy.** Detta är en HÅRD begränsning i Plan B: `spotify:` bevarar uppspelning men saknar kontext, `spotify:track:<id>` ger kontext men startar OM spåret (den dokumenterade 2026-08-19-buggen). Ingen ren-URL ger BÅDE fullvy OCH resume — Spotify exponerar ingen "resume"/"now-playing view"-URI. Peter valde resume framför fullvy; ändra INTE "Open Spotify" till `openSpotifyTrack` utan nytt produktbeslut.

⚠ **Välj ALDRIG mellan de två utifrån `spotifyDJStarted` (2026-08-19).** Steg 1 gjorde tidigare det: "timern har inte startat än → omstart är ofarlig". Men DJ:ns enhet ligger per definition i BAKGRUNDEN när timern aktiveras (DJ:n står i Spotify), iOS fryser JS och Realtime-socketen kan dö — `spotify_dj_track_started` kan därför missas HELT och healas först av aktiverarens 5 s-heartbeat. I det fönstret TROR DJ-enheten att timern inte startat, så den villkorade omstarten gjorde exakt fel sak i exakt det läge den skulle skydda: en DJ som tittade in i QuizVibe och gick tillbaka fick låten omstartad mitt i gissarnas nedräkning (Peters test). Reveal-fasen var opåverkad — den grenen använde redan `openSpotifyApp`.

**Nuvarande modell**: steg 1 och 2 delar EN render-gren med EN enda knapp — den gröna **"Open Spotify"** (`openSpotifyApp`, aldrig omstart). ⚠ **Restart-knappen ("Nothing playing? Restart track from the beginning", `djRestartTrackBtn`) är BORTTAGEN 2026-08-28 (Peter)** — den var enda kvarvarande deep-link till track:en i det här läget och riskerade en oavsiktlig omstart mitt i nedräkningen. Dess stilar (`djRestartTrackBtn`/`djRestartTrackBtnText`) är också raderade. Återinför INGEN omstart-väg här utan nytt produktbeslut. `djStep` är oförändrad — den styr fortfarande guide-stegens highlight.

**GetReadyIntro kö-indikator**: Spotify-frågor visas med grön kant, Spotify-ikon (vit monokrom) och "Spotify DJ"-text. Prop: `spotifyQuestionIndices?: number[]` (0-baserat) passas från quiz.tsx:s `djRotationPlan.spotifyQuestionIndices`.

**SpotifyBrandIcon** (`src/components/SpotifyBrandIcon.tsx`):
- Tre varianter: `'white'` (vit monokrom, vår default på mörk bakgrund), `'green'` (grön cirkel — KRÄVER svart/vit bakgrund), `'black'` (ljus bakgrund)
- Per Spotify Brand Guidelines: grön ikon får bara användas på svart (#000) eller vit (#FFF) bakgrund

**Katalog-konvention** — lägg till `spotifyTrackId` på songs-items i YAML:
```yaml
- id: dancing-queen
  spotifyTrackId: "0GjEhVFGZW8afUYGChu3Rr"   # Spotify track ID från share-URL
  youtubeClips: [...]                           # kan finnas eller vara tomt
```
Export-scriptet (`export-music-questions.ts`) inkluderar nu items med `spotifyTrackId` även om `youtubeClips` är tom (Spotify-only items). Kör `cd backend && npm run export-music-questions` efter ändringar.

**Curator-regel: föredra SINGLE-release-ID:n (2026-08-06, Peter-beslut)** — samma låt finns ofta på Spotify som album-spår, singel OCH på flera compilations, var och en med eget track-ID. `spotify:track:<id>`-deep-linken öppnar spåret i sitt ALBUM-kontext: ett singel-ID visar en 1–3-spårs-vy där låten ligger överst (en tap → play), medan ett album-/compilation-ID visar hela tracklistan med lålten mitt i — spelovänligt när autoplay uteblir (varm Spotify-session är vanligaste fallet, bekräftat även med Premium-konton) och DJ:n manuellt måste hitta rätt rad. **Regel: välj track-ID från singel-releasen (eller kortast möjliga album, idealt 1–3 spår inkl. remixer) när flera versioner finns.** Kontrollera album-kontexten i Spotify-appens share-vy vid kurering. Kan inte auditeras automatiskt utan Web API (oEmbed exponerar inte album-kontext) — manuell pass över befintliga ~108 ID:n görs opportunistiskt när dåliga fall upptäcks i test; nya items ska följa regeln direkt.

**Döda Spotify-track-ID:n → "Something went wrong" (fix 2026-07-18)**: Spotify tar bort/relinkar tracks över tid (samma rot som YouTube-takedowns) — deep-linken `spotify:track:<id>` mot en borttagen track får Spotify-appen att öppna med "Something went wrong" och inget spelas. oEmbed-audit av alla katalog-ID:n hittade 2 döda av 108: Queen — Another One Bites the Dust (`songs-gen-x.yaml`, bytt till `5HkFTCxSeJ3kGNyQJbT4rJ`) och The Hives — Hate to Say I Told You So (`songs-gen-z.yaml`, bytt till `6xxXrNJnnsQNLdgNk8S4y8`). **Preventivt**: nytt script [backend/scripts/validate-spotify-tracks.ts](backend/scripts/validate-spotify-tracks.ts) (`npm run spotify-validate`) validerar alla `spotifyTrackId` mot Spotifys publika oEmbed-endpoint (`https://open.spotify.com/oembed?url=...` — ingen API-nyckel/kvot; 404 = död track, transienta fel retry:as och räknas aldrig som döda). Körs även som steg i nightly-cron:en ([youtube-validate-nightly.yml](.github/workflows/youtube-validate-nightly.yml), `if: always()` efter YouTube-steget). Vid träff: byt ID i YAML (verifiera nya ID:t via oEmbed) + kör `npm run export-music-questions`. Notera lokalt på Peters maskin: curl mot Spotify kräver `--ssl-no-revoke` (Norton TLS-interception) men Node-fetch i scriptet fungerar utan workaround.

**⚠ Ett levande track-ID är inte samma sak som RÄTT track-ID (2026-08-19)**: `spotify-validate` frågar bara "svarar oEmbed 200?". Två items bar ett fullt levande ID för en HELT ANNAN låt — `abba-waterloo` pekade på **Eurythmics – Sweet Dreams** och `bee-gees-stayin-alive` på **Queen – Bohemian Rhapsody**. Nightly-cronen var grön hela tiden medan DJ-kortet sa "ABBA / Waterloo" och Spotify spelade något annat. Ett tredje item, `cajsa-stina-akerstrom-fragorna-om-nar`, var en **påhittad låt** ("Frågorna om när", 2001 — finns inte); dess ID pekade på hennes riktiga hit *Fråga stjärnorna* (1994), så itemet är omdöpt till `cajsa-stina-akerstrom-fraga-stjarnorna` med rätt år. Alla tre nya ID:n ligger dessutom på **plats 1** i sitt album (bästa DJ-fallet när autoplay uteblir). Ett fjärde item, `gunther-ding-ding-dong`, bar **rätt spår men fel titel** — låten heter "Ding Dong Song", inte "Ding Ding Dong"; omdöpt till `gunther-ding-dong-song`.

**Preventivt: [backend/scripts/audit-spotify-track-identity.ts](backend/scripts/audit-spotify-track-identity.ts) (`npm run spotify-identity-audit`)** jämför katalogens `displayName` ("Titel — Artist") mot track-sidans `og:title` + `music:musician_description` — **inget Spotify Web API** (Plan B), samma meta-tagg-skrapning som `spotify-album-audit`, minimal UA (full Chrome-UA ger JS-skalet utan metas). Normaliseringen skalar bort remaster-/version-suffix, parenteser, feat-led och diakriter så `Waterloo - 2007 Remaster` matchar `Waterloo`. Tre flagg-nivåer: **MISMATCH** (varken titel eller artist matchar = säkert fel låt), **TITLE** (rätt artist, fel låt) och **ARTIST** (rätt låt, fel/annan artistkreditering). Rapport: `backend/output/spotify-track-identity.md`.

⚠ **Exit-koden är 1 ENBART vid MISMATCH** — den kör i nightly-cronen (`if: always()`), och de 8 kvarvarande TITLE/ARTIST-flaggorna är godartade (Spotifys stavning "Lili & Susie" / "Elena Tsagrinou" / "Djingis Khan", ampersand i "Genom Eld & Vatten", feat-credits som "Robyn, Kleerup", GES utskrivet som "Glenmark Eriksson Strömstedt"). Skulle de fälla jobbet vore larmet rött varje natt och därmed värdelöst — exakt samma "trasigt vs inte perfekt"-uppdelning som YouTube-steget. **Rör inte den gränsen** utan att tänka igenom vad ett rött mejl ska betyda. **Curator-regel: efter varje ID-byte, kör `npm run export-music-questions` OCH `npm run spotify-album-audit`** — det senare regenererar `src/utils/spotifyAlbumContext.ts` som driver DJ-kortets "Track position in Spotify: X of Y"; utan det pekar positionen på det gamla albumet.

**41 låtar har `spotifyTrackId` (2026-06-04)**: ABBA (3st), Roxette (2), Ace of Base (2), Avicii (3), Loreen (2), Robyn (2), Swedish House Mafia, Eric Prydz, Dr. Alban, Rednex, The Cardigans, Kent, Veronica Maggio, Mando Diao, First Aid Kit, Icona Pop, Benjamin Ingrosso, Lili & Sussie + internationella klassiker (Eagles, Bob Marley, Bee Gees, Queen, Sia, Imagine Dragons, Ed Sheeran, Glass Animals, The Weeknd m.fl.).

**LobbyScreen-integration (uppdaterad 2026-06-05)**:
- `isSpotifyAvailable = gameMode === 'individual-devices' && !singlePlayerDefault` — Spotify DJ kräver IndDev. Spotify-raden alltid synlig men toggle utgråad i PtP/Single. **Non-host** ser en read-only `<Switch disabled value={spotifyEnabled}>` med grön/grå track + **"Connect Spotify account"-länk** (tappbar) direkt under connection-status-texten. Vid lyckad connect skrivs `spotifyConnected: true` tillbaka via `upsertOwnLobbyPlayer` + lokal `setPlayers`-update → PlayerRow Spotify-badge uppdateras utan reload. Disconnect-flödet speglar detta med `spotifyConnected: false`.
- `spotifyEnabled` seeds från `profile.spotifyDefaultEnabled` i Promise.all-blocket; om `profile.spotifyDefaultEnabled = true` auto-seedas också `gameMode = 'individual-devices'`.
- **handleStartGame-guards för Spotify**: (1) `spotifyEnabled && (singlePlayerDefault || approvedNonHosts.length === 0)` → "Spotify DJ not applicable — requires at least one other player". (2) Spotify-only single player (`youtubeEnabled=0, images=0, singlePlayer`) → separatguard. (3) Inga approved non-hosts med Spotify → alert. (4) Några utan Spotify → erbjud att flytta till waiting.
- `LobbyPlayer.spotifyConnected?: boolean` — populerad från `lobby_players.spotify_verified` via `rowToPlayer`; betyder self-attest (Plan B) **install-verifierad på spelarens egen enhet**. Host-kortets `spotifyConnected` sätts från Lobby `spotifyConnected`-state i `useFocusEffect` (seedas från `profile.spotifyAppConfirmed` ∧ `checkSpotifyInstalled() !== 'not-found'`). Non-host vid code-only-join: samma nedgraderings-regel i samma `loadProfile()`-läsning.
- **PlayerRow Spotify-badge**: border-cutting `position: absolute, top: -8, right: Spacing.lg` — Spotify-ikon + `Spotify ready` (grön, `#1DB954`) vid attest, `No Spotify` (grå) annars. Grön/grå kantlinje. Drivs av `spotifyConnected`-prop.
- **Profile-integration**: `spotifyDefaultEnabled?: boolean` + `spotifyAppConfirmed?: boolean` i `ProfileData` (båda AsyncStorage-only). Profile:s Mixerboard-rad: "Spotify user"-toggle (attest, default AV) gate:ar DJ-default-toggeln; `handleSave` persisterar `spotifyDefaultEnabled: spotifyEnabled` + `spotifyAppConfirmed: spotifyConnected`.

**`profileStorage.ts` fixes (2026-06-05)**:
- `loadProfile` mergar alltid från AsyncStorage-cache (inte bara när kategorifält saknas) — täcker `spotifyDefaultEnabled` + `youtubeEnabledCategories` + `imagesEnabledCategories`.
- Merge-villkor bytt från `length > 0` till `!== undefined` — tom array `[]` (explicit av) bevaras vs `undefined` (ej konfigurerat → fallback till default i Lobby-seed).
- `backfillProfileFromSession` inkluderar `spotifyDefaultEnabled: cache?.spotifyDefaultEnabled`.

**Env-var**: `EXPO_PUBLIC_SPOTIFY_CLIENT_ID=d9ce6568d6d64bfdbba3b92b604c6ee0` (i `.env` + `.env.example`) — **V2-only** sedan Plan B (läses bara av arkiverad kod).

**Spotify Developer Dashboard** (developer.spotify.com → QuizVibe) — **behövs EJ för V1** (Plan B: inga API-anrop → ingen Extended Quota-ansökan, ingen 25-user-cap). Bevaras för ev. V2:
- Redirect URI registrerad: `quizvibeapp://spotify-callback`
- App-status: Development mode (max 25 test-users i User Management)
- Peter (pbjorklund.swe@gmail.com) tillagd i User Management

## YouTube playback & curation

YouTube-klippen är NOTERAT INTE bara musik — kan vara filmscener, sporthändelser, historiska/kulturella klipp. Använd generiska termer ("klippet"/"videon") i nya kommentarer; rename-passet (MUSIC_QUESTIONS → generiskt, "song"-frågetext → per-content-type, songs-katalog → media-katalog, song-meta-rad → content-type-aware) är **bundlat med detta YouTube-färdigställande-passet** — plocka inte isär.

**MediaPlayer-uppspelning** ([src/components/MediaPlayer/YouTubeMediaPlayer.tsx](src/components/MediaPlayer/YouTubeMediaPlayer.tsx)):
- `PLAYER_HEIGHT = 220` (bumpat från 200 — YouTube-iframe:s bottenrow (share-knapp, YouTube-logo, related-video-thumbnail vid pause) klipptes vid 200).
- `end: clip.endSec` är INTE satt i `initialPlayerParams` — videon spelar i sin helhet, klipps inte vid svarstidens slut. Curerade `endSec` ignoreras runtime; behållen i datan för framtida flexibilitet.
- Ingen audio-overlay — iframe:n är fullt synlig under uppspelning så rörlig bild syns hela tiden. `showVideo`-propen finns kvar i API:t (no-op idag) för bakåtkompatibilitet.
- `hasEnded`-state sätts av YouTube:s `state === 'ended'`. Triggar end-of-clip overlay som heltäckande ersätter iframe:n: `<QuizVibeLogo size={140} />` + "QuizVibe"-text i `Nunito_700Bold` (fontSize 38, weight 700, letterSpacing -0.5, marginTop -Spacing.lg). Textens negativa marginTop kompenserar för QuizVibeLogo:s naturliga tom-yta i botten av viewBox:n (vid size 140 motsvarar ~28 px). Reset:as per `clip.videoId`-byte.
- **YouTube ToS-compliance**: branding (logo + bottom-bar) är synlig UNDER hela playback (krav från API Services TOS). EFTER playback-end får appen ta över UI:t — vilket är vad logo-overlay:n gör. Trigga ALDRIG `hasEnded` baserat på vår timer eller manuellt; bara YT:s native `'ended'`-state.
- iOS-autoplay funkar via `patches/react-native-youtube-iframe+2.4.1.patch` (auto-applied via npm postinstall) — bypass:ar lib:ns broken `postMessage`-path med `injectJavaScript`. Bumpas lib eller WebView, re-verifiera att patchen applies.
- **Spoiler-text-hantering — INGA overlays (2026-05-29):** vi lägger ALDRIG lager ovanpå YouTube-spelaren. YouTubes Developer Policies förbjuder att skymma/störa spelaren eller dess innehåll, så overlay-maskning av answer-avslöjande text (undertexter, loggor, score-grafik, intro-titlar) är ett ToS-brott. Ett overlay-system byggdes + revs samma dag (se [memory/project_spoiler_mask_overlays.md]). Hantera istället via **kurering**: `clip.startSec` (starta efter intro-titelkort — tillåtet, vi modifierar inte videon), välj klipp/segment utan inbränd text, välj videor vars YouTube-titel inte avslöjar svaret, annars bild-fråga.

**R1 content-policy för musik-klipp (2026-05-29):**
- **Endast studio-inspelat:** officiell MV / officiell studio-audio (`- Topic`) / lyric-video över den officiella inspelningen. INGA live-framträdanden, covers, demos eller tribute-versioner (Live Aid, Ed Sullivan, award shows, festival-set, "Demo", tribute-orkestrar osv. togs bort). Undantag: för äldre låtar (pre-MTV) godtas identifierbara film-/era-klipp där artisten framför sin EGEN låt (lägre kvalitet OK — Fred Astaire/Casablanca/Blues Brothers-typ).
- **FIFA/embed-block-fälla:** `getVideoDetails.embeddable=true` fångar INTE content-owner-embed-block. FIFA (+ sannolikt UEFA/IOC/NBA officiella kanaler) blockerar embedded playback trots embeddable=true → spelaren visar "Video ej tillgänglig". `youtube-validate` (API) missar detta; bara test i spelaren fångar det. Alla 3 FIFA-klipp borttagna 2026-05-29. Undvik dessa kanaler.
- **År i videotiteln = spoiler (gäller alla subjects, extra kritiskt för sport-event):** frågan är "Which Year?" — om svaret syns i titeln/kanalnamnet (t.ex. "Val di Fiemme **2013**", "Sweden 4-0 Bulgaria **1994**", "Kraft Nabisco **2002**") är klippet inte spelbart. Gäller även delvisa år ("199…" avslöjar decennium, "20…" avslöjar sekel). Ta bort klippet och sök ersättning. Kanalnamnet (t.ex. `VMValdifiemme2013`) räknas inte som spoiler (syns bara i iframe-info, inte i quizkortet) men undvik ändå om alternativ finns.
- Aktuell pool efter content-expansion + kvalitetsrensning: **237 spelbara youtube-frågor** (~164 song / 27 movie / 46 sport-event).

**Backend-tooling** ([backend/youtube/](backend/youtube/)):
- `client.ts` — YouTube Data API v3-klient. `searchVideos` (100 quota-enheter/call, server-side embeddable+syndicated-filter), `getVideoDetails` (1 quota-enhet för upp till 50 videoIds). `YoutubeVideoDetails.definition: 'hd' | 'sd' | 'unknown'` (defensiv parse, `'unknown'` om API utelämnar fältet).
- `getClipBlockReasons` returnerar reason-array. **HD-gate**: `definition === 'sd'` → `'SD resolution'` (`'unknown'` blockas INTE — defensiv mot framtida API-svar utan fältet).
- `scoring.ts` — heuristisk ranking av suggest-kandidater. Egen modul (NOT i suggest.ts) så scoringen kan unit-testas utan att CLI:ns top-level `main()` triggar vid import. Signal-vikter: HD +10 / SD -10 / blocked -100 (botten-prio) / VEVO-kanal +6 / Topic-kanal -8 (auto-uploaded statisk album-art) / titel "official video" +8 / "music video" +5 / "lyric/audio/static" -10. Sista beslut alltid hos curatorn — heuristiken får ner antalet kandidater att titta på från 10 till 1-3.
- `suggest.ts` — CLI `npm run youtube-search -- <item-id>` eller `--query "..."`. Sorterar rader desc på score. Output: `[+score]  STATUS  duration  HD/SD  videoId  "title"` + score-notes per kandidat.
- `validate.ts` — CLI `npm run youtube-validate` (default `--all`). Validerar varje `youtubeClips`-entry mot Data API, men **klassificerar per ITEM, inte per klipp** (`classifyItems`, exporterad + enhetstestad i `youtube/test/validate.test.ts`). Ett item kan bära flera klipp och spelas så länge minst ett fungerar — se `pickMediaSource`. **`dead`** = inget spelbart klipp kvar → **exit 1**, driver nightly cron-failure-signaling. **`degraded`** = ett klipp borta men minst ett kvar → rapporteras i egen sektion, exit 0. ⚠ Rör inte den gränsen: fällde jobbet varje natt så fort NÅGOT klipp var brutet skulle cronen bli röd för items som fortfarande fungerar, och ett larm som alltid är rött slutar man läsa. Samma resonemang som när mjuka anmärkningar (SD, block i icke-levererade regioner) togs bort ur exit-villkoret. ⚠ `main()` körs bakom en entry-point-guard (`import.meta.url === pathToFileURL(process.argv[1]).href`) — utan den startar en `import` från testerna hela valideringen och kallar `process.exit`.
- `autofix.ts` — CLI `npm run youtube-autofix`. Validerar + söker ersättningskandidater för brutna/saknade klipp via suggest-motorn. `--apply`-flaggan patchas YAML-filer direkt (text-baserad, bevarar CRLF/indentation). `--threshold N` (default 5) sätter lägsta poäng-krav för auto-patch. Rapport sparas till `backend/output/youtube-autofix-report.json`. Rate-limitad: 7 s throttle per sökning (10 sök/min-gräns). Quota worst-case: ~9 (validering) + N×100 (sök) enheter per körning. Kör aldrig parallellt med annat sök-script. Se "Nightly cron" nedan.
- Tester: `backend/youtube/test/{client,scoring}.test.ts` (37 youtube-tests). Vitest-suite totalt **138 tester (135 gröna + 3 skipped)** per 2026-07-19.

**Nightly cron** ([.github/workflows/youtube-validate-nightly.yml](.github/workflows/youtube-validate-nightly.yml)): kör `autofix.ts --all` kl 06:00 UTC (ersatte validate.ts 2026-06-03), fångar klipp som tagits ner via copyright-claim eller nedgraderats till SD/blocked. Laddar alltid upp `youtube-autofix-report.json` som CI-artefakt (30 dagars retention) — klickbar länk i Actions-UI visar brutna klipp + föreslagna ersättningar. Manuell dispatch (workflow_dispatch) stöder `apply_fixes=true` som kör `--apply` + committar patchade YAML-filer direkt. Kritiskt eftersom re-uploads (MASTER RJ, prod. ovr, SLAYERO MUSIC, thelanoz video Comeback i [songs-all.yaml](backend/content/catalog/songs-all.yaml)) inte är original-rättsinnehavarens uppladdningar och kan tas ner utan förvarning. Pre-launch krav: lägg `YOUTUBE_API_KEY` som repo secret + verifiera första körningen.

**Klient-side YouTube-felhantering** (implementerad 2026-06-03): `YouTubeMediaPlayer` sätter `hasError=true` och visar `⚠ Video unavailable`-overlay när YouTube:s embed-fel (felkod 100/101/150 = borttagen/embed-blockerad) fyrar via `onError`-callbacken. `MediaPlayer/index.tsx` passerar `onReady`/`onEnded`/`onError` vidare (var tyst-swallowade tidigare). I `quiz.tsx` sätter `handleYoutubeError`-callbacken `youtubeError=true`, registrerar 0 pts för aktiv spelare (= missad fråga, samma path som time-out), visar ett `⚠ Video unavailable — Skipping to result…`-kort i media-arean och övergår till reveal-fas efter 2.5 s så rätt svar visas ändå. Resetas per fråga via `useEffect` på `questionIndex`. Gated på `phase === 'question'` för att undvika dubbel-scoring om felet fyrar under awaiting/reveal.

**Katalog-schema-diskrepans (löst 2026-05-22)**: tidigare använde [songs-gen-z.yaml](backend/content/catalog/songs-gen-z.yaml) + [songs-gen-alpha.yaml](backend/content/catalog/songs-gen-alpha.yaml) `media: {kind: youtube, ...}`-format medan resten av songs-files använder `youtubeClips: [...]`-array. Schema validerade båda men [export-music-questions.ts](backend/scripts/export-music-questions.ts) läser BARA `youtubeClips:` → 51 items var "död data". **Bulk-conversion-script** [backend/scripts/convert-media-to-youtubeclips.ts](backend/scripts/convert-media-to-youtubeclips.ts) konverterade allt 2026-05-22 (29 items i gen-z + 22 i gen-alpha) via text-baserad rad-walk som bevarar kommentarer och indentation. Music v1-curation samma dag lade dessutom till `youtubeClips:` på 10 nya items i songs-elder/gen-x/millennials (sedan flyttade alla 10 till songs-all.yaml som cross-gen-iconic). Slutresultat: 66 music-questions playable. Den `media:`-discriminerade unionen finns kvar i schema för framtida non-youtube-typer (`ai-image` är schema-definierad men inte i bruk).

## Pass-the-Phone — non-host som live-spectator (2026-08-25)

En godkänd non-host i en PtP-lobby var tidigare en återvändsgränd: host tryckte Start Game, non-host fick popupen *"Host has started the game — Please use the Host device"* och kastades Home. Deras enhet var svart resten av spelet trots att de satt i samma rum och spelade på host:ens telefon.

Nu får de i stället frågan **"Host has started the Game / Play on the Host device. Keep the live leaderboard on this phone so you can join a re-match afterwards."** → **Not now** = Home som förr, **Follow leaderboard** = `/quiz` i en **spectator-vy** som visar leaderboarden uppdaterad i realtid, och efter sista frågan Final Leaderboard med prisutdelnings-sekvensen.

⚠ **"Follow leaderboard" är FÖRVALT** (Peter 2026-08-26) och bär `style: 'cancel'`. Det är enda sättet att få knappen fetstilt/förvald på iOS — RN:s Alert exponerar inget `preferredAction`, och UIAlertController renderar just `.cancel` i halvfet. **Flytta den inte "tillbaka" till Not now** för att den ser felplacerad ut; då blir avböj-knappen standardvalet igen. Att följa med är inte längre bara en trevlighet: bara den som har en enhet i spelet kan acceptera en PtP-re-match, så svarar alla "Not now" erbjuds ingen re-match alls.

**⚠ Re-match FINNS i PtP sedan 2026-08-26 — men bara i ett rent QuizVibe-user-spel.** Den tidigare regeln ("re-match finns inte i PtP; bygg inte approvals — host kan lägga till gäster utan egen enhet, som aldrig kan godkänna") är UPPHÄVD, och invändningen löstes genom att göra sådana spel obehöriga i stället för att bygga runt dem: finns EN gäst i uppställningen — värd-tillagd eller självansluten anon — visas ingen re-match-fråga alls. Se "Final Leaderboard: Re-match…" nedan för behörighetsgaten och approver-modellen.
- **Host:s slutskärm hoppar över hela Yes/No-frågan** — `rematchQuestionEnabled = localRematchFlow && (isLocalSoloGame || gameMode !== 'pass-the-phone')` gatar `onReplayYes`, och `localStartNewGameReady = localRematchFlow && (!rematchQuestionEnabled || replayChoice === 'no')` gör att **"Start New Game" + Home visas direkt**. Individual Devices behåller frågan + approval-flödet oförändrat.
- **Spectatorns slutskärm** visar samma footer som en IndDev-non-host: dimmad "Accept / Re-match" med badgen "Activated by Host", som tänds guld när host bjuder in. `homeOnlyFooter`-propen är BORTTAGEN (den var dess enda call-site).

### Kanalen: fem event, inget mer

`quiz_sync`-kanalen öppnas nu även i PtP via `syncActive` ([quiz.tsx](app/quiz.tsx)). Utöver de fem eventen används `player_rejoined` som anslutnings-handskakning — se "Åskådaren måste HÄLSA" nedan.

```ts
const isPtPSpectator = gameMode === 'pass-the-phone' && !isHost;
const ptpMultiDevice = gameMode === 'pass-the-phone' && turnOrder.length > 1;
const syncActive = gameMode === 'individual-devices' || ptpMultiDevice;
```

⚠ **`syncActive` får ALDRIG blint ersätta de ~60 `gameMode === 'individual-devices'`-checkarna i filen.** Exakt dessa sju sändningssiter är widenade: `recordRoundScore`, `handleHostSkipSpotifyQuestion`, `handleHostAdvanceFromReveal`, `handleHostShowLeaderboard`, `signalHostActivity`, `handleGoHome`→`lobby_deleted` och `goToNewLobby`→`play_again_lobby_ready` (+ ett NYTT `lobby_deleted` i `handleQuitGame`). Allt annat — timers, `isConnectionUnstable`/unstable-overlay, Spotify/DJ, inactivity-shutdown, host-disconnect-grace, `play_command`, `player_seen_questions` — är fortsatt strikt IndDev.

**`play_command` widenas MEDVETET INTE.** Handlern sätter `phase → 'countdown'` och bär tung heal-logik; spectatorns fasmaskin ska förbli trivialt inert (den står i `'intro'` hela spelet). `question_advance` + `host_active_ping` räcker.

### ⚠ Åskådaren måste HÄLSA — annars dröjer badgarna en hel fråga

Kategori-ikonerna i Rounds-baren och badgarna på "Next to answer"-rutan bygger alla på `broadcastAllQuestionIds`. Den kommer via `game_sequence_init`, som host skickar vid **+800/2500/5000 ms efter HOST:s egen subscribe** — ett fönster som i PtP nästan alltid är passerat när åskådaren mountar, eftersom deras enhet väntar på att spelaren svarar "Yes" i lobbyns prompt. Utan hälsning blev nästa bärare `question_advance`, alltså upp till en hel fråga senare (~30 s i Peters test 2026-08-25).

Handskakningen använder BEFINTLIGA event — inga nya typer:
1. Åskådaren broadcastar **`player_rejoined`** vid +300/1500/3500 ms efter sin subscribe (tre försök av samma skäl som `player_seen_questions`: egna kanalen kan behöva ett ögonblick på sig att joina).
2. Host:s `onPlayerRejoined` svarar **omedelbart med `game_sequence_init`**. Idempotent för alla mottagare, så IndDev påverkas inte.
3. Host:s befintliga re-broadcast av `play_command` i samma handler (när host står i countdown/question) är en andra, lika snabb bärare — därför har `playCommandHandlerRef` numera en spectator-gren HÖGST UPP som plockar `all_question_ids` + `question_index` och `return`:ar. Resten av handlern (fas → `'countdown'`, timer-stämplar, wipe av svars-state) hör till IndDev-spelare och vore skadlig här.

`player_rejoined` ÄR "jag är här"-signalen i protokollet — återuppfinn den inte, och lägg inte till fler `sendSequence`-timers hos host i stället: handskakningen är deterministisk, extra timers är bara brus.

Övriga handlers behöver ingen gate — deras AVSÄNDARE är redan IndDev-gatade, så eventen anländer aldrig i PtP. **Undantaget är `onPlayerConnectionChange`**, som MÅSTE ha `if (gameMode !== 'individual-devices') return;` i kroppen: heartbeat + 15 s-watchdog startar inuti `subscribeSyncChannel` oavsett läge, så utan gaten fylls `playerConnectionStatus` i PtP och GetReadyIntro:s `handlePlayPress` blockerar host med *"Some players seem to have unstable network"* så fort en spectator bakgrundar sin telefon.

`ptpMultiDevice` är en över-approximation — host-tillagda gäster utan enhet räknas in, så en PtP-host kan prenumerera på en kanal ingen lyssnar på. Kostnaden är en Realtime-kanal + 10 s heartbeat; att detektera vilka spelare som faktiskt har en enhet är inte värt komplexiteten.

### Poängen hålls tillbaka tills host går vidare

⚠ **Spectatorns tabell får INTE uppdateras när svaret registreras.** Host broadcastar `player_score_recorded` direkt vid Confirm/timeout — alltså mitt i reveal-fasen på host:ens telefon. Skulle spectatorn applicera den då avslöjade den utfallet innan spelarna i rummet hunnit se det på host-enheten (Peter 2026-08-25).

Posterna buffras därför i `pendingSpectatorScoresRef` och töms av `flushSpectatorScores()` när host trycker **Next** (`question_advance`) — och på sista frågan när host trycker **Final Leaderboard** (`question_advance` med `next_question_index: null`), precis innan slutskärmen renderas.

**Buffringen sitter på MOTTAGAR-sidan, inte som fördröjd sändning hos host** — med flit: host:s pending-/retry-maskineri för tappade broadcasts förblir orört, och inget kan gå förlorat om kanalen hickar mellan svar och Next. `host_active_ping`-grenen tömmer också bufferten när den upptäcker att host redan gått vidare (tappat `question_advance`), annars hade posterna fastnat för alltid.

### Tre fällor i spectator-datan

1. ⚠ **Självfiltret i `playerScoreRecordedHandlerRef` måste stängas av.** `if (payload.player_id === selfPlayerId) return;` är rätt i IndDev (man har sin egen poäng lokalt) men i PtP svarade spelaren på HOST:ens telefon, så host broadcastar posten under **spectatorns** player_id. Filtret hade kastat bort spelarens egen rad och lämnat dem på 0 poäng i sin egen tabell. Villkoret är därför `!isPtPSpectator && payload.player_id === selfPlayerId`.
2. ⚠ **`totalQuestions` får inte clampas mot lokala `gameQuestions`.** Spectatorns pool är en helt annan slumpad lista (den spelar aldrig ur den), så clampen gav ett godtyckligt kortare spel. Spectatorn läser i stället `broadcastAllQuestionIds?.length` (från `game_sequence_init` / `question_advance`). Därför är `broadcastAllQuestionIds`-state:n **flyttad upp** till strax efter `turnOrder`-memon — `totalQuestions` deklareras före dess gamla plats.
3. ⚠ **`isLastQuestion` behöver `spectatorGameOver`.** Spectatorns egen `questionIndex` kan inte avgöra att spelet tog slut. Flaggan sätts av avslutande `question_advance` (`next_question_index === null`) och av `host_active_ping` med `phase === 'leaderboard'`. Utan den renderas Final Leaderboard som en INTERIM-vy: död "Next Round →"-knapp och ingen prisutdelning.

`recordRoundScore` har dessutom ett `if (isPtPSpectator) return;` överst — belt-and-suspenders, eftersom enhetens phase aldrig når `'question'`.

**`host_active_ping` har en egen spectator-gren HÖGST UPP** i handlern som bara syncar frågesekvens + questionIndex + "spelet slut" och sedan `return`:ar. IndDev:s heal-logik (fas-catch-up till `'countdown'`, timer-/scoring-ref-nollställningar) får INTE köras — den skulle kasta spectatorn ur sin vy. Grenen är skyddsnätet mot ett tappat avslutande `question_advance`; utan den fastnar spectatorn på en frusen tabell för alltid.

### Vyn — återanvänder host:ens GetReady-block

Early-return i render **efter** remote-prep-gaten och **före** `if (phase === 'intro')`, villkorad `isPtPSpectator && phase !== 'leaderboard'` — så `'leaderboard'` faller igenom till den befintliga grenen och Final Leaderboard + `FinalCelebration` renderas som för alla andra.

Innehåll uppifrån: en tunn rad (rubrik + **Leave**-knapp som kör befintliga `handleLeaveGame`), sedan **`<GetReadyIntro spectator />`**, sedan `<RoundLeaderboard isLastRound={false} />`.

**`GetReadyIntro` fick ett `spectator`-läge** ([GetReadyIntro.tsx](src/components/GetReadyIntro.tsx)): PtP-blocket — dot-bars för Rounds + Question, rubrikraden, "nästa spelare"-rutan med kategori- och svarstyps-badges, samt den hopfällbara spelarkön — är utbrutet till konstanten **`ptpProgressBlock`**, och `if (spectator) return <View>{ptpProgressBlock}</View>;` renderar ENBART det: ingen top-bar, ingen Q-logga, inget Game settings-block, ingen play-knapp, ingen hopfällbar leaderboard (parent har den alltid synliga tabellen i stället). Ingen `flex: 1` på wrappern, så tabellen under får resten av skärmen.

⚠ **Kopiera aldrig blocket till quiz.tsx.** Poängen med utbrytningen är att host och åskådare inte kan glida isär. Det enda som skiljer är rubriken: `spectator ? 'Next to answer:' : 'Pass-the-Phone to:'` — spelarkön är default **hopfälld** i båda lägena (Peter 2026-08-25: en kort stund var den utfälld för åskådaren, men då tryckte den ned leaderboard-tabellen som är hela poängen med skärmen).

Kö-datan (`introQueueData`: players + roundNumbers + questionNumbers) är **hoistad ur intro-grenen till en `useMemo`** så båda vyerna skickar identisk kö.

`currentPlayerIndex` **heal:as** i `host_active_ping`-grenen: `hostQuestionIndex % turnOrder.length`. Turordningen är deterministisk i PtP (fråga N besvaras av spelare N % antal), så healen räknar fram den i stället för att lita på att varje `question_advance` kom fram och roterade indexet — annars pekar både "Next to answer" och kön fel efter ett tappat event.

### Två nya props på `RoundLeaderboard`

- ~~**`homeOnlyFooter?: boolean`**~~ — **BORTTAGEN 2026-08-26** när PtP fick re-match. Den kortslöt spectatorns footer till bara Home eftersom `play_again_initiated` aldrig broadcastades i PtP; nu gör den det, så spectatorn ska ha den dimmade knappen som tänds. Ett guest-hostat spel faller ändå till Home-only via `guestHost`-klausulen.
- **`interimFooter?: React.ReactNode`** — ersätter "Next Round →"-knappen på INTERIM-vyn. ⚠ Den knappen renderas annars **identiskt tänd även utan `onNextRound`** (`onPress` blir bara `undefined`, ingen disabled-styling), så en läsare utan rätt att gå vidare hade sett en fullt levande CTA som inte gör något.

### Host lämnar → spectators Home

- **Start New Game / re-match**: `goToNewLobby` broadcastar `play_again_lobby_ready` men tvingar **`auto_join: undefined` i PtP**. Mottagaren visar då sin befintliga *"Host has already started a new Game"* → Home i stället för att navigera in i nya lobbyn. Noll nya event, noll ny copy.
- **Home från slutskärmen**: `handleGoHome`:s `lobby_deleted` är widenad till `syncActive`.
- **Quit mid-game**: `handleQuitGame` broadcastade tidigare INGENTING — en host som avbröt lämnade non-hosts hängande i `/quiz` (rums-pollingen finns bara i Lobby). Den skickar nu `lobby_deleted`, vilket fixar samma hål i IndDev på köpet.

### Player history för spectatorn

`saveFinalGame` har en spectator-gren: `rounds` är tom där (fylls bara av `handleConfirm*`) och `totalPoints` läser `gameTotals[hostId]` = **host:ens** summa. Båda ersätts av `effectiveRounds` / `effectiveTotalPoints` byggda ur `allRoundScoresHistory` filtrerad på `selfPlayerId`; assistance tas från `turnOrder.find(p => p.id === selfPlayerId)` eftersom LobbyScreens non-host-nav hårdkodar `assistance:'standard'` / `age:'32'`. Årtalen är 0/0 (samma konvention som bildfrågor) — `HistoryEntry` läser bara `correct`, `timeUsed` och antalet.

Det stänger **Player history**-luckan för PtP-deltagare som följer med i spectator-vyn — tidigare fick de aldrig spelet på sin egen enhet. Samma sak gäller seen-historiken (se "Känd begränsning" under Cross-player-historik). Väljer de **No** på prompten skrivs som förut ingenting. `!isGuestHostGame`-gaten står kvar: guest-hostade spel skriver fortsatt ingen historik.

I samma veva: seen-history-effektens `addSessionRecordForNames(registeredNames, …)` är nu gatad på **`isHost`** — rationalen ("alla spelade på DENNA enhet") gäller bara host:ens telefon, inte spectatorns. Och `gamePlayers.isYou` följer numera `selfPlayerId` i stället för `i === 0`, som markerade HOST som "du" på varje icke-host-enhet (gällde även IndDev).

## Quiz — phase machinery

`quiz.tsx`-skärmen kör en linjär state-maskin per fråga:

```
'intro' → 'countdown' → 'question' → 'awaiting' → 'reveal' → ('leaderboard' | nästa fråga)
```

| Phase | Visas | Vad händer |
|---|---|---|
| `intro` | GetReadyIntro | Pass-the-phone: telefon-överlämning till nästa spelare. Visas också vid spelstart i båda lägena. Tap på Q-play-logo → `countdown` (omedelbart, ingen delay). |
| `countdown` | CountdownIntro | 3-2-1-nedräkning i Q-logga, sedan "?" pop:as in i samma Q-ring efter 1:an försvinner. När hela sekvensen är klar (~4 s) → `question`. |
| `question` | Question UI (timer-bar + media + fråge-kort + TimelineSelector + Confirm-knapp) | Timer tickar, spelaren svipar tidslinje + tappar Confirm. |
| `awaiting` | Samma UI som `question`, TimelineSelector låst | Reveal döljs tills timer:n går till 0. Säkerställer att alla spelare får samma tidsbudget oavsett när de bekräftade — kritiskt för kommande Individual-Devices-flöde där flera spelare svarar parallellt. |
| `reveal` | Question UI + feedback-kort (✓/✗ + Correct year + ev. Answer time + Next-tab) | Visas när timeLeft hits 0. Tap på Next-tab inom kortet → nästa fråga (eller `leaderboard` på sista). |
| `leaderboard` | RoundLeaderboard | Final scores + Home/Play Again-knappar. |

**Turordning skickas från Lobby via expo-router params**: `LobbyScreen.handleStartGame` bygger `turnOrder = approvedPlayers.filter(!hasLeft).map(p => ({id, name, emoji, avatarUri, assistance, age}))` och pushar som `players: JSON.stringify(turnOrder)` + `gameMode` + `roundsCount` + `roomCode` + `eraFrom`/`eraTo` + `answerResponseSeconds`. `quiz.tsx` parsar `players` med `try/catch` i `useMemo` så korrupt payload faller tillbaka till tom array. Den minimala `TurnOrderPlayer`-shape:n inkluderar `assistance` och `age` per spelare så quiz-skärmen kan applicera per-spelare-svarsruta-intervall i Pass-the-Phone.

**Per-spelare-state derivation från turnOrder**:
- `currentAssistance: AssistanceLevel = turnOrder[currentPlayerIndex]?.assistance ?? fallbackAssistance` — driver TimelineSelector:s svarsruta-intervall (full=5 år, standard=3 år, minimal=exakt) per rond. URL-paramets `assistance` används bara som fallback.
- `gamePlayers = turnOrder.length > 0 ? turnOrder.map(...) : [youPlayer, ...MOCK_OPPONENTS]` — den faktiska spelarlistan i spelet, replacerar tidigare hardcoded `[you + mocks]`. Pass-the-Phone visar de riktiga spelarna i leaderboarden istället för mocks.
- `gameTotals: Record<string, number>` — per-spelare-totals aggregerade direkt från `allRoundScoresHistory`. Replacerar tidigare `{ you: totalPoints, ...opponentTotals }`-uppdelning. `totalPoints` är derived = `gameTotals[hostId] ?? 0` (host:s id = `turnOrder[0]?.id`).
- `youPlayer` läser `name`/`emoji`/`age` från `turnOrder[0]` så leaderboarden visar host:s riktiga avatar/namn istället för hardcoded `'You'` / `'🎮'`.

**Play Again carry-over** (`goToNewLobby` i [app/quiz.tsx](app/quiz.tsx)): laddar `loadProfile()` FÖRST, sedan bygger `lobbyPlayers`-arrayn till `savePendingLobbyPlayers`. Host:s rad får `name: profile?.playerName ?? 'You'` och `emoji: getAvatarEmojiById(profile.selectedAvatarId)` — INTE hardcoded `'You'` / `'🎮'` som tidigare. Annars hade host:s namn synts som "You" i nästa lobby + nästa spel:s leaderboard tills `mergeProfileIntoHost` hann fyra (vilket är efter mount). Gäller både "keep players" och "fresh"-grenarna i goToNewLobby.

**Score per fråga går till EN spelare** — `recordRoundScore(pts, correct, timeUsed)` (tidigare `simulateOpponentRound`):
- **Pass-the-Phone** (turnOrder satt): skapas en post per fråga med `playerId = turnOrder[currentPlayerIndex].id`. Aktiv spelare roterar mellan ronder. Mock-opponents auto-genererar **inte** poäng eftersom alla riktiga spelare delar enheten.
- **Individual Devices** (turnOrder satt): `playerId = selfPlayerId` på varje enhet. `currentPlayerIndex` stannar på 0 i IndDev (ingen rotation), så om vi använde `turnOrder[currentPlayerIndex].id` skulle ALLA scores på non-host:s enhet attribueras till host (turnOrder[0]) — non-host:s egen rad visade då 0 i played rounds/correct/avg/pts genom hela spelet. selfPlayerId säkerställer att varje enhet attribuerar till sin lokala spelare.
- **Direkt-nav** (tom turnOrder): bibehållit mock-opponent-flöde för gameplay-testning med MOCK_OPPONENTS.
- `currentRoundScores` + `allRoundScoresHistory` uppdateras med exakt en post per fråga — så leaderboarden bara räknar upp Q-kolumnen för spelaren som faktiskt svarat.
- **Cross-device score-aggregering ÄR implementerad** för IndDev (denna punkt påstod motsatsen fram till 2026-08-14 — den var stale). Varje klient broadcastar `player_score_recorded` direkt efter `recordRoundScore`, och mottagarna mergar in posten i sin lokala `allRoundScoresHistory` så leaderboarden är komplett på alla enheter. `broadcast.self: false` + dedup på `${player_id}_${question_index}` gör det idempotent mot reconnect-replay; pending-kön drainas vid `player_rejoined`/`host_rejoined`. `broadcastPlayerAnswerConfirmed` är något annat — den syncar bara avatar-markörer på timer-baren (`playerConfirms`).
  - ⚠ **Mottagna peer-scores appendas som NYA yttre poster i ankomstordning**, inte i frågeindex-position. `allRoundScoresHistory[i]` är alltså **inte** fråga `i` så fort fler än en enhet spelar. Behöver du veta vilken fråga ett svar gällde: läs `RoundScore.questionIndex` (se prisutdelnings-sektionen).

## Quiz — Get Ready to Vibe intro screen

Hand-off-skärmen mellan Lobby:s Start Game-tap och första quiz-frågan. [src/components/GetReadyIntro.tsx](src/components/GetReadyIntro.tsx) renderas av [app/quiz.tsx](app/quiz.tsx) som `'intro'`-fas — initial fas vid spelstart i båda lägena, OCH mellan rundor i båda lägena. Tap på Q-play-logo i intro:n → `'countdown'`-fas **omedelbart** (ingen delay) → `'question'`-fas.

**Unstable network-popup (2026-06-09)**: i IndDev, när host tappar Play-knappen, kontrolleras `playerConnectionStatus` (Record\<string, 'connected'|'disconnected'\>) mot antalet `'disconnected'`-peers. Om ≥1 disconnected → Alert "Some players seem to have unstable network. These will not participate in next question. Play anyway?" med Cancel + "Play anyway". `handlePlayPress`-wrappern runt `onReady` i [GetReadyIntro.tsx](src/components/GetReadyIntro.tsx) hanterar detta — PtP/host saknar `playerConnectionStatus`-prop och kör alltid `onReady()` direkt.

**Mode-dependent fas-flöde i `handleAdvanceToNextRound`**:
- **Pass-the-Phone**: rotera `currentPlayerIndex` (mod `turnOrder.length`) → sätt fas till `'intro'` så "Pass-the-Phone to: <namn>" visas innan nästa fråga.
- **Individual Devices**: ingen player-rotation (alla på egna devices) → sätt fas till `'intro'` så host får ny Play-tap som kontrollerar speltempot för nästa fråga. Non-host ser passiv "Waiting for Host to start quiz"-ruta i intro:n via `GetReadyIntro`:s `isHost`-prop; host:s Play-tap broadcastar `play_command` via `quiz_sync:<roomCode>`-channel ([src/lib/realtime/syncChannel.ts](src/lib/realtime/syncChannel.ts)) så non-host:s phase också går till countdown. Host:s Next-tap i reveal broadcastar motsvarande `question_advance` så alla devices återgår till intro samtidigt.

**IndDev question-sync — alla enheter visar exakt samma fråga (2026-06-07):**

Root cause för fråge-desync i IndDev: `gameQuestions` byggs via `prioritiseUnseen(pool)` som anropar `shuffleArray(Math.random())` — icke-deterministisk, ger olika ordning per enhet. Dessutom är `seenQuestionIds` per-enhet (AsyncStorage), så seen/unseen-uppdelningen skiljer sig.

Lösning: host broadcastar `question_id` i `play_command`-payloaden. Non-host pinnerar exakt den frågan via en module-level lookup-map:

```ts
// Module-level lookup-map (app/quiz.tsx)
const ALL_QUESTIONS_MAP = new Map<string, QuizQuestion>(
  ([...SEED_QUESTIONS, ...IMAGE_SEED_QUESTIONS] as QuizQuestion[]).map((q) => [q.id, q]),
);
```

- **`PlayCommandPayload.question_id: string`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)) — host skickar `currentQ.id` i broadcasten.
- **`broadcastQuestionId: string | null`** state — non-host sparar mottaget `question_id`; null på host.
- **`_broadcastOverride: QuizQuestion | null`** — deriverad: `!isHost && broadcastQuestionId ? ALL_QUESTIONS_MAP.get(broadcastQuestionId) ?? null : null`. Ersätter `gameQuestions[questionIndex]` om satt.
- **`currentQ`** och **`question`** constants läser `_broadcastOverride ?? gameQuestions[questionIndex]` — non-host visar alltid exakt host:s fråga oavsett lokal shuffle-ordning.
- **Heal-on-reconnect** (`hostActivePing`-effekten): clearar `broadcastQuestionId` via `setBroadcastQuestionId(null)` när force-synkad `questionIndex` ändras — undviker stale override efter reconnect.
- Non-host:s lokala `gameQuestions`-pool och `seenQuestionIds`-tracking är opåverkade — de används fortfarande för att bestämma lokal spelordning om `_broadcastOverride` är null (t.ex. PtP).

**GetReadyIntro-kön: kategori + svarstyp per fråga (2026-06-15):**

Non-host:s GetReady-kö visade ibland fel kategori-badge (t.ex. SPORT istället för FILM) och fel svarstyp-badge (YEAR istället för NAME). Root cause: `categoryByQuestion` och `answerTypeByQuestion` deriverades från non-host:s lokala `gameQuestions`-array (annorlunda shuffle-ordning). Fix:

- **`broadcastAllQuestionIds: string[] | null`** state (quiz.tsx) — host:s auktoritativa frågesekvens som hela frågeordningen för non-host. Sätts av `game_sequence_init` + `play_command` + nu även `question_advance`.
- **`QuestionAdvancePayload.all_question_ids?: string[]`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)) — adderat 2026-06-15. Alla tre `broadcastQuestionAdvance`-call-sites (`handleHostSkipSpotifyQuestion`, `handleHostAdvanceFromReveal`, `handleHostShowLeaderboard`) skickar `gameQuestionsRef.current.map(q => q.id)`. Non-host:s handler uppdaterar `broadcastAllQuestionIds` vid varje advance → kön håller sig synkad även vid reconnect.
- **`effectiveMediaSourceByQuestion`**, **`effectiveCategoryByQuestion`**, **`effectiveAnswerTypeByQuestion`** — tre useMemos i quiz.tsx: om `isHost || !broadcastAllQuestionIds` → pass-through från lokala arrayer; annars map:as från `broadcastAllQuestionIds` via `ALL_QUESTIONS_MAP`. Passas som props till GetReadyIntro istället för de lokala arrayerna. Fallback till lokal array används under race-fönstret innan första `broadcastAllQuestionIds` ankommer (var "nästan alltid rätt" enligt Peter).

**IndDev non-host följde inte med till fråga 1 — presence-handskakning + readiness-gate (fix 2026-08-26)**

Non-host blev ofta kvar på GetReady medan host spelade vidare, **främst på fråga 1**. Fyra samverkande orsaker:

1. **IndDev non-host annonserade sig ALDRIG.** Mount-hälsningen (`broadcastPlayerRejoined` vid 300/1500/3500 ms) var gatad på `isPtPSpectator` — bara PtP-åskådaren hälsade.
2. **Host visste därför ingenting.** `playerConnectionStatus` är **negativ-only**: heartbeat-mottagning flippar medvetet INTE till `'connected'` ([syncChannel.ts](src/lib/realtime/syncChannel.ts)), och watchdogens `'connected'`-gren kräver ett föregående `'disconnected'`. Mapen var alltså `{}` vid spelstart och förblev tom. **`player_rejoined` är ENDA vägen in i `'connected'`.**
3. **`play_command` skickades exakt en gång**, fire-and-forget. Realtime replayar aldrig till en sen subscriber → missad broadcast = förlorad för gott.
4. **Tidsfönstret är reellt.** Host navigerar till `/quiz` utan att invänta `markRoomGameStarted`; non-host upptäcker start via `rooms`-postgres_changes eller 2000 ms-pollen och gör sedan flera awaitade round-trips före `router.replace('/quiz')` — typiskt **1–3 s efter host**, medan host:s Play-knapp var guld och tappbar **direkt vid mount**.

**Fixen (fyra delar i [app/quiz.tsx](app/quiz.tsx) + [GetReadyIntro.tsx](src/components/GetReadyIntro.tsx)):**

- **Presence-handskakning (kärnan)** — hälsnings-gaten är nu `shouldAnnouncePresence = !!selfPlayerId && (isPtPSpectator || (gameMode === 'individual-devices' && !isHost))`. Ingen ny event-typ: host:s befintliga `onPlayerRejoined` gör redan allt — markerar `'connected'`, svarar med `game_sequence_init`, och **re-broadcastar `play_command` efter 500 ms om host redan är i countdown/question**. Det sista är återhämtningsvägen: en enhet som mountar EFTER host:s Play-tap dras in ändå.
- **Readiness-gate på Play-knappen** — `startLocked`-prop till GetReadyIntro. Host:s knapp är grå + otryckbar tills varje förväntad peer rapporterat **`player_ready`** (se nästa block — grinden läste ursprungligen `playerConnectionStatus === 'connected'`, vilket visade sig vara för tidigt); `START_GATE_MIN_GREY_MS = 1000` (UX-golv) och `START_GATE_TIMEOUT_MS = 8000` (escape). **Bara fråga 0** (`startGateApplies` kräver `phase === 'intro' && questionIndex === 0`) — Peter 2026-08-26. Från fråga 1 är mapen redan fylld, och drop-outs mitt i spelet täcks av den befintliga disconnect-Alerten; att gate:a varje fråga skulle låta en spelare som stängt appen blockera gruppen bakom 8 s per fråga. Efter escapen tänds knappen i guld och tap ger `startGateUnconfirmedCount`-varningen ("N player(s) have not joined the quiz yet… Start anyway?") — nödvändig egen Alert eftersom en peer som aldrig hälsat är **frånvarande** ur mapen, inte `'disconnected'`.
- **`play_command` skickas 3×** (direkt / +600 / +1800 ms) med **IDENTISK** payload. ⚠ `timer_start_at` får ALDRIG räknas om per sändning — den är en absolut wall-clock-stämpel som non-host läser in i `hostTimerStartAtRef`; ett omräknat värde skjuter en sen mottagares timer framåt. Dubbletter är idempotenta: `isNewQuestion` blir false för samma index → det destruktiva blocket hoppas, svars-state-resetten är gatad på `phase === 'intro'` (2026-07-03-skyddet), och `setPhase` returnerar `current` utanför intro så `CountdownIntro` inte remountas. Timer-id:n i `playCommandRetryTimersRef`, rensad vid ny Play-tap + unmount.
- **Två hygienfixar som hälsningen gör nödvändiga** (3 hälsningar × N peers inom ~4 s): `setPlayerConnectionStatus` bail:ar när värdet är oförändrat (annars upp till 33 host-renders i ett 11-spelarspel), och `game_sequence_init`-svaret throttlas 400 ms via `lastSequenceInitSentRef` (annars N×3 identiska sändningar av upp till 500 fråge-id:n → Realtime rate-limit).

⚠ **Räkna ALDRIG `Object.keys(playerConnectionStatus).length` som readiness-mått.** `player_rejoined` registreras via rå `channel.on` i syncChannel och går därmed förbi `isKnownSender`-valideringen (enda player-id-bärande eventet som gör det) — ett påhittat id kan injicera en nyckel i mapen. Uppslag per förväntat id (`expectedPeerIds.every(...)`) läser aldrig främmande nycklar och är därför säkert.

⚠ **`expectedPeerIds` filtrerar INTE på `type`.** I IndDev har varje rad i `turnOrder` en egen enhet — host kan inte lägga till gäster manuellt i läget, och `type: 'guest'` betyder anonymt konto, inte "delar host:s telefon". Tom lista (Single Player, remote-1v1, PtP) → ingen grind, ingen beteendeändring i de lägena.

⚠ **`hostActivePing` kan INTE ersätta detta**, trots att mottagarens handler har en `intro → countdown`-catch-up. `signalHostActivity` triggas av `onTouchStart` — dvs. på **touch-down**, medan `phase` (läst ur render-closuren) fortfarande är `'intro'` → pingen bär `phase: 'intro'` och healar ingenting. Samma tap konsumerar dessutom 5000 ms-throttlen, så ingen ping går ut under countdown heller. Den fastnade spelaren healades först när host råkade peka på skärmen under `'question'`. Föreslå inte "skicka bara en ping" som enradsfix.

⚠ **`playLogoWrap` bär en HÅRDKODAD gold shadow** (`shadowColor: Colors.warning`, `shadowOpacity: 0.85`, `elevation: 12`) som ligger UTANFÖR halo-View:n. Att bara unmounta halo:n räcker inte — `playLogoWrapLocked` nollar `shadowOpacity`/`elevation`, annars glöder den grå loggan fortfarande guldgult. Låst läge använder `PLAY_LOCKED_COLOR = '#6B7280'` (appens låst-grå), medvetet **inte** `Colors.textDisabled` som är för svag som SVG-stroke mot `Colors.background`. Pulsen pausas (en pulserande knapp läses som "tryck här"), och etiketten "Connecting players" renderas ALLTID men döljs med `opacity: 0` — unmountas den krymper `playOuterWrap` i samma sekund som knappen blir guld och hela GetReady-layouten hoppar.

**`question_advance` trippelsänds också (2026-08-26)** — samma 0/600/1800 ms-mönster, via helpern `broadcastQuestionAdvanceWithRetries` som alla tre call-sites (`handleHostSkipSpotifyQuestion`, `handleHostAdvanceFromReveal`, `handleHostShowLeaderboard`) går genom.

⚠ **Det är säkert ENBART tack vare en dedupe-guard överst i `questionAdvanceHandlerRef`** — till skillnad från `play_command` är den handlern **inte** idempotent av sig själv. `handleAdvanceToNextRound` (a) roterar `currentPlayerIndex` med en **updater-funktion** i Pass-the-Phone, så varje dubblett hoppar över en spelare i spectatorns "Next to answer"; (b) avslutar med **`setPhase('intro')`**, så en retry som landar efter att host tryckt Play kastar ut en non-host ur countdown tillbaka till GetReady — exakt buggen presence-handskakningen just löste; (c) nollställer `hasRecordedScoreForCurrentQuestionRef` och wipe:ar svars-state.

Guarden nycklar på `next_question_index` (`null` → `'end'`) i `lastHandledAdvanceRef` och sätts **synkront i handlern** — INTE via `questionIndexRef`, som är en render-spegel och kan vara stale om två sändningar hinner ankomma före nästa render. Ref:en nollställs aldrig manuellt: ett spel per quiz.tsx-mount, och Play Again går via ny lobby → ny mount. **Tar du bort guarden måste du ta bort retriesen i samma veva.**

Retry-timers ligger i en EGEN ref (`questionAdvanceRetryTimersRef`), skild från `playCommandRetryTimersRef`, så en Play-tap aldrig avbryter en pågående advance-omsändning eller tvärtom — de två överlappar legitimt när host trycker Next och sedan Play snabbt. Båda rensas i samma unmount-effekt.

**Uppföljning samma dag: `player_ready` + driftfri countdown (2026-08-26)**

Handskakningen ovan löste "non-host kom aldrig med", men skapade ett nytt symptom: non-host följde med varje gång, men fick **ibland längre eftersläpning på uppspelat material än vanligt** när host tryckte Play snabbt. Orsaken var att jag grindade på fel signal.

**`player_rejoined` betyder "jag är på kanalen", inte "jag är redo att spela".** Hälsningen går 300 ms efter subscribe — enhetens absolut tyngsta ögonblick. Grinden släppte alltså knappen i det tidigaste möjliga läget i stället för det rätta, och allt mount-arbete hamnade **mitt i nedräkningen**:
- `loadEpochLedger`, `Promise.all([loadSeenQuestionIds, loadLastSessionIds])` och `getPlayerAudioOverrides` resolvar oförutsägbart, och **varje resolve triggar en omräkning av `gameQuestions`-memon** (~970 items, ~15 kedjade filter/shuffle-pass) plus en re-render av hela quiz-trädet.
- **CountdownIntro ackumulerade den lateness.** Den var en kedja av **11 sekventiella `setTimeout`** där varje steg re-ankrades till när föregående callback FAKTISKT kördes → lateness blev strikt additiv och återhämtades aldrig. Uppmätt risk: **200–800 ms drift** på en kall non-host, utan övre gräns.
- Sen fas-entry ⇒ sen WebView-boot. **YouTube-spelaren mountas först vid `phase === 'question'`** och måste då hämta wrapper-sidan, `iframe_api` och själva embed:en — tre nätverksrundor, `buffering → playing` typiskt 300 ms–2,5 s. Förseningen läggs alltså ovanpå en redan dyr kallstart.

**Fixen, två delar:**
1. **Nytt event `player_ready`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)) — non-host broadcastar (0/1200/3000 ms) när ALLA fyra är klara: seen-ids, epoch-ledger, audio-overrides **och** host:s frågesekvens mottagen. Host:s `startLocked` räknar på `playerReadyIds`, inte längre på `playerConnectionStatus`. Hälsningen är kvar — den driver fortfarande connection-status och `play_command`-återhämtningen.
2. **CountdownIntro schemaläggs mot ett absolut ankare** (`t0` + offset-tabell) i stället för relativa delays. Det **nominella schemat är bit-identiskt** (700 / 1880 / 2000 / … / 7200 / 8200 för `startFrom=5`, verifierat) — bara driften försvinner, i alla lägen.

⚠ **`.finally()`, inte `.then()`, sätter "loaded"-flaggorna.** De betyder "vi väntar inte längre på den här läsningen", inte "den lyckades" — annars låser ett AsyncStorage- eller nätverksfel host bakom escape-timeouten i onödan. Effekten som hämtar audio-overrides sätter dessutom flaggan direkt i sin early-return för icke-IndDev, annars hänger den kvar `false`.

⚠ **Nedräkningen är klar vid 8200 ms, inte 7200.** 7200 är när "?" VISAS; `onComplete` ligger 1000 ms senare. Den gamla kommentaren vid `timerStartAt` räknade `7200 + 2000 = 10200` och landade rätt av fel skäl. Ändra inte `10500` utan att räkna om mot offset-tabellen.

⚠ **`player_media_ready` går INTE att bygga som D-ii-spec:en skisserar.** WebView:n existerar inte förrän `phase === 'question'`, dvs. efter Play-tappet — ett media-ready-event kan aldrig hinna grinda tappet. En äkta media-gate kräver att spelaren för-mountas dold under intro/countdown, vilket ingen kod gör i dag och som har en **YouTube-ToS-dimension** (repot har redan rivit ett helt overlay-system av det skälet — se "Spoiler-text-hantering"). Ta inte det beslutet utan Peter.

⚠ **Kvarstående asymmetri, ej åtgärdad**: host mountar `MorseAmbientSound` (en WebView) under intro, men den är gatad på `!isAudioMutedForSelf` — och en IndDev non-host defaultar till mutad. Host går alltså in i frågan med en **varm** WebView-process och non-host med en kall, värt tiotals till hundratals ms på första frågan. Att mounta en dold WebView enbart för att värma processen är en hack som inte lagts in.

**IndDev fas-heal vid missad question_advance (fix 2026-07-27)**: en enhet som missar `question_advance` (frozen JS vid låst skärm / droppad Realtime-broadcast — replayas aldrig) står kvar i FÖRRA frågans fas (`awaiting`/`reveal`) medan efterföljande `play_command`/`hostActivePing` healade `questionIndex` + `broadcastQuestionId` + `dj_player_id` men INTE fasen → nya frågans data renderades i gammal fas. Symptom (Peters devicetest): non-host-DJ såg "You are the DJ"-kortet utan "Start track in Spotify"-knapp (scroll-zonens DJ-CTA kräver `phase='question'`; sticky-baren är null för DJ). Tre-delad fix i [app/quiz.tsx](app/quiz.tsx): (a) **play_command new-question-heal** — `isNewQuestion = questionIndexRef.current !== qIdx`; vid ny fråga körs samma per-frågas-reset som `handleAdvanceToNextRound` (timer-interval, scoring-latch, timerstämpel-refs, playerConfirms) + answer-state-reset + fas-transitionen utökad `(intro || isNewQuestion) → countdown`. 2026-07-03-skyddet (samma-frågas sena re-broadcast wipe:ar inte bekräftat svar) bevaras — `isNewQuestion` är då false. (b) **hostActivePing drift-heal** — `didDrift` beräknas före setState; drift-grenen nollställer nu även `hasRecordedScoreForCurrentQuestionRef` + `questionStartMsRef`, och fas-catch-upen räddar vid drift även `awaiting`/`reveal`/`question` → `countdown` (tidigare bara `intro`). (c) **Render-försvar** — DJ-scroll-zonens fas-gate inkluderar `'awaiting'` (DJ når aldrig awaiting legitimt; garanterar att DJ-CTA:n inte kan försvinna vid framtida stuck-fas). (d) **Stale-DJ i rejoin-re-broadcast** (upptäckt i Peters re-test samma dag): host:s `onPlayerRejoined`-callback registreras EN gång på mount — dess inline play_command-re-broadcast läste `currentDJPlayer` ur closuren = MOUNT-tidens DJ (fråga 0 = host). När en senare frågas non-host-DJ återvände från Spotify (flap → `host_rejoined`/`player_rejoined`-handskakning → 500ms-re-broadcast) fick DJ-enheten `dj_player_id = host` → demoterades till gissare mitt i sin DJ-runda (svars-UI dök upp ~1s efter återkomst). Fix: ny synkron ref-spegel `currentDJPlayerRef` (samma mönster som `phaseRef`/`questionIndexRef`) — re-broadcasten läser `currentDJPlayerRef.current?.id`.

**IndDev non-host fastnar i GetReady efter nätverksglitch (fix 2026-06-28)**: "Sticky latch"-bugg på äldre/marginalfull iOS i IndDev. Flöde: WiFi-glitch → `isConnectionUnstable=true` → `stickyUnstableForQuestion=true` (latch, rensar INTE automatiskt) → `ConnectionUnstableOverlay` visas → host trycker Play → `play_command`-broadcastet ignoreras av non-hostens `playCommandHandlerRef` pga latch → non-host fastnar i 'intro'. Retry (`handleRetryFromUnstable`) rensade latch men host re-broadcastade INTE för samma fråga. **Två-delad fix:**
- **Del 1 (primär)** — `onPlayerRejoined`-handler i quiz.tsx: om host är i `countdown`/`question` re-broadcastas `play_command` med **500 ms fördröjning** (React behöver committa `setStickyUnstableForQuestion(false)` innan ny broadcast ankommer till non-host:s closure). `questionIndexRef` (ny mutable ref parallellt med befintlig `phaseRef`) ger closure-säker access.
- **Del 2 (belt-and-suspenders)** — `HostActivePingPayload.phase?: string` (syncChannel.ts): varje `hostActivePing` bär host:s fas. Non-hostens ping-handler catch-up:ar `'intro' → 'countdown'` när host är past intro + sticky är rensat + connection är stabil.

**IndDev timer-sync vid iOS-bakgrunds-återkomst (fix 2026-06-15)**: iOS fryser JS-tråden (`setTimeout`/`setInterval`) när appen backgroundas. Non-host som lämnar appen under countdown:en och kommer tillbaka fick full `responseSeconds` kvar istället för det faktiska återstående. Fix: host broadcastar `timer_start_at` (wall-clock `Date.now()` ms) i `play_command`-payloaden — non-host kan beräkna korrekt tid kvar oavsett när JS-körningen återupptas.

- **`PlayCommandPayload.timer_start_at?: number`** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)) — wall-clock ms för när host:s timer förväntas starta. Beräknas i `handleHostStartFromGetReady` som `Date.now() + 10500`: 700ms initial paus + 5×1300ms tick (startFrom=5) + 1000ms ?-display + 2000ms timerActive-delay = 10200ms + 300ms marginal.
- **`hostTimerStartAtRef`** (useRef\<number\>, quiz.tsx) — non-host lagrar mottaget `timer_start_at` här. Resetas till 0 i `handleAdvanceToNextRound` så stale värde aldrig läcker till nästa fråga.
- **Tre platser där elapsed-kompensation appliceras** (täcker alla resume-scenarion):
  1. **AppState-listener** (`'active'`-branch): om `phase === 'countdown'` och `Date.now() >= hostTimerStartAtRef.current` → beräkna `adjustedLeft`, sätt phase till `'question'` direkt (hoppar countdown-resten).
  2. **Phase-effekten** (on `phase === 'question'`): visar korrekt `adjustedLeft` som initial `timeLeft` + sätter `timerProgressAnim` till rätt fraktion.
  3. **`startTimer()`**: beräknar `effectiveSeconds = Math.max(0, responseSeconds - elapsed)` och sätter `questionStartMsRef` med bakåtkompensation (`Date.now() - (responseSeconds - effectiveSeconds) * 1000`) så svarstidsmätningen är korrekt i leaderboardens AVG/LAST.
- **TypeScript-gotcha**: `let effectiveSeconds: number = responseSeconds` — explicit `: number`-annotation krävs eftersom `responseSeconds: 30 | 45 | 60` annars infereras som literal union-typ och `Math.max()` returnerar `number` vilket inte är assignable.

**Timer-gate**: `useEffect` som anropar `startTimer()` är gated på `phase === 'question'` (entry från countdown). Cleanup i den effekten klippper INTE intervallet vid `question → awaiting`-transition — kritiskt så timer:n fortsätter ticka oberoende av phase-byte. Self-clearing sker i `setInterval`-handler:n när `timeLeft = 0`. Separat unmount-only useEffect cleanup:ar timer:n vid Quit Game.

**Layout** ([GetReadyIntro.tsx](src/components/GetReadyIntro.tsx)) — i SafeAreaView från topp till botten. **Allt utom top-banner:n ligger sedan 2026-08-11 i en ScrollView** (`scrollArea` + `scrollAreaContent` med `flexGrow: 1`; `container` bytte `flex: 1` → `flexGrow: 1` så den växer i stället för att klämmas ihop i scroll-kontext). Skärmen hade tidigare INGEN scroll alls — på iPhone SE/8 kapades kö-tabellen, spelarnamnet och "+ more questions" rakt av utan väg att nå dem. `flexGrow: 1` gör layouten oförändrad på höga skärmar (innehållet fyller höjden som förut) och börjar scrolla först när det inte får plats. Dessutom kompakteras `LOGO_SIZE` (96→76), `PLAY_BUTTON_SIZE` (140→122/108) och `container`:s `paddingTop`/`gap` när `SCREEN_HEIGHT < 700` / `< 600`, så play-knappen ligger ovanför vecket även på SE.

1. **Top banner med Quit Game** (banner-styling: full-bredd-band med `Colors.card` bg + `borderBottom`, `paddingHorizontal: lg / paddingVertical: sm + 2` — samma vokabulär som `TopUserBanner`). Quit Game-pillen vänsterställd via `flexDirection: 'row'` + `justifyContent: 'flex-start'`. Tap → Alert → `deactivateRoom(roomCode)` + `clearLeftPlayers(roomCode)` + `router.replace('/')`.
2. **Game settings-block** (centrerad row med Q-logo + settings-text till höger, `gap: Spacing.sm`). Innehåller:
   - `<QuizVibeLogo size={96} />` (utan tidigare "GET READY TO VIBE"-overlay).
   - **"Game settings"**-rubrik (FontSize.lg, bold).
   - **Game era**: `{eraFrom} – {eraTo}` (host:s val från Lobby, fixt under hela spelet).
   - **Answer response time**: dropdown-trigger på samma rad som rubriken — visar `{N}s ▼` (`{N}s 🔒` när låst). Tap → Modal med 3 options (30s/45s/60s) — 15s-alternativet borttaget 2026-06-08. Quiz.tsx håller `responseSeconds` som state och passar `onAnswerResponseSecondsChange` så användaren kan justera mellan ronder.
   - **Locked-state i Pass-the-Phone**: `responseSecondsLocked = gameMode === 'pass-the-phone' && currentPlayerIndex !== 0`. När låst → tap visar info-Alert ("response time can only be changed at the start of a new round — when all players have answered the same number of questions"). Trigger:s border + text dimmas + ▼ byts till 🔒.
3. **Current Leaderboard (utfällbar)** mellan settings och play. Default **collapsed** vid varje GetReadyIntro-mount. Tap på header → expand. Body är `position: 'absolute'` med `top: '100%'` + `zIndex: 100` + `elevation: 10` → **OVERLAY:ar** play + turordningstabellen istället för att skjuta dem nedåt. Innehållet bakom stannar på sin plats men göms tills body collapses igen. Layout: 3-kolumns sport-tabell (se "Leaderboard table" nedan). **Scoring guide** borttagen (2026-06-15) — "Year 1 pt / Letter 1 pt"-tabellen och `scoringPlayerDivider`-separatorn är raderade från overlay:n.
4. **Play-knapp** (centrerad): `<QuizVibePlayLogo size={140} color={Colors.warning} />` — Q-logo med play-triangel inuti Q-ringen (ersätter den gamla blå rektangulära knappen). **Gold glow** runt logon: `playLogoHalo` (absolut-positionerad bakom, `Colors.warning` bg + animated opacity 0.35 → 0.8) + iOS-only shadow med `shadowColor: Colors.warning`. Scale-pulse 1 → 1.06 över 800ms.

**Kategori-badge på current-box** (2026-05-25): kant-skärande badge ovanpå `currentMediaBox` (IndDev) och `currentPlayerBox` (PtP/Single) — visar V1-huvudkategori (Music/Film/Sport) för frågan som spelas härnäst. Drivs av ny prop `categoryByQuestion: (MainCategory | null)[]` som passas från quiz.tsx. Visar `categoryByQuestion[currentQuestion - 1]` (frågan som currentQuestion pekar på = "först på tur"). Alla kategorier delar **enhetlig gold-styling** (`Colors.warning` bg + svart text, samma vokabulär som PREMIUM-badge) — per-kategori-färgning testades men gav splittrad känsla. ViewBox-position: `top: -9, right: Spacing.md` så badgen sticker ut över top-kanten på boxen utan att krocka med innehållet. null-värde i arrayn → ingen badge renderas (t.ex. capital-fråga, framtida edge case).

⚠ **Badgen visar den kategori itemet SURFADES UNDER givet host:s filter — INTE alltid bas-kategorin** (Peter 2026-08-31, reverserar den tidigare "visa alltid bas-kategorin"-regeln). En sport-taggad musiklåt (`genrePackages: ["sport"]`, `mainCategory: 'Music'`) som bara ingår i ett Sport-only-spel via crossover-regeln visade förut "Music" — spelaren valde Sport och fick en "Music"-badge, vilket lästes som en bugg. Nu: `categoryByQuestion`/`effectiveCategoryByQuestion` mappar via `displayCategoryForItem(mainCategory, enabled, genrePackages)` ([mainCategory.ts](src/utils/mainCategory.ts)) — bas-kategorin vinner NÄR den är påslagen (så ett all-kategorier-spel är oförändrat), annars visas den crossover-tagg som matchar en aktiverad kategori. `enabled` = source-relevanta kategorier: YouTube/timeline → `youtubeEnabledCategories`, Hints/image → `imagesEnabledCategories`. Spotify-låtar (kringgår kategori-filtret) och null-mainCategory faller tillbaka på basen. `q.mainCategory` i sig är ORÖRT (används av theme-package-roadmap m.m.) — bara badge-DISPLAYEN relabelas.

⚠ **Badge-flicker-gate** (Peter 2026-08-31): `gameQuestions` byggs om när seen-historik / epok-skuldbok / per-kategori-HCP landar async vid mount, så `gameQuestions[0]` — och därmed källa-/svarstyp-badgen — kan hoppa efter första framen. quiz.tsx skickar därför `sequencePending={isHost && !isRemote && !(seenDataLoaded && epochLedgerLoaded && regionHcpLoaded)}` till GetReadyIntro; den OR:as in i `questionDataPending` så host visar "Waiting for question data…" tills lokal sekvens settlat, i stället för fel badge. Non-host (broadcast-driven) + remote (stabil sekvens) gatas som förr. `regionHcpLoaded` sätts i `.finally` så en avvisad HCP-läsning inte låser gaten.

**Svarstyp-badge på current-box** (2026-06-07): kant-skärande badge på **vänster sida** av `currentMediaBox` (IndDev/Single) och `currentPlayerBox` (PtP) — visar `"Year"` eller `"Name"` för frågan som spelas härnäst. Blå styling (`Colors.primary` bg + vit text). Position: `top: -9, left: Spacing.md`. Deriveras som `currentAnswerType: 'Year' | 'Name' | null` via `answerTypeByQuestion`-prop (parallel array med `categoryByQuestion`). **Härleds ur `question.type`, ALDRIG ur `mainCategory`** (fix 2026-08-08): `actor-select` + `image` → `'Name'`, Spotify → alternerande `resolveSpotifyAnswerType`, allt annat → `'Year'`. Den tidigare regeln `mainCategory === 'Film' → 'Name'` var fel — bara katalog-items med `correctNames` blir `actor-select`; Film-items UTAN dem (t.ex. `angry-birds`, "Which Year was this Movie launched?") blir vanliga timeline-frågor med årsväljare och fick då badge "Name" medan nedräkningen sa "When" och svaret var ett år. Samma regel gäller i `effectiveAnswerTypeByQuestion` (non-host-grenen). null → ingen badge. `currentMediaNumber` på IndDev-boxen har `left`-positionen bumpad till `Spacing.xxl` (32px) för att ge plats åt badgen.

5. **Turordningstabell** under play-knappen — fixed-höjd 3-kolumns-grid:
   - **Header**: `R: | Q: | Pass-the-Phone to:` (textSecondary, semibold, uppercase via Typography.overline-mönster).
   - **Current player-rad**: R/Q-värden i vanliga celler; Player-cellen wrap:ar avatar + namn i en primary-bordered box (`primaryMuted` bg).
   - **Kö-rader**: avatar (32×32) + namn i textSecondary-tonad text. Tabellen scrollar internt vid lång kö (maxHeight 180).
   - **`Round X`-separator** infogas mellan två kö-rader när rondnumret förändras (jämfört med föregående rad eller current player). `paddingVertical: 4`, `Colors.primaryMuted` bg, `primaryBorder` top+bottom, FontSize.xs bold uppercase primary text. Hjälper till att markera round-bytena visuellt utöver den befintliga R-kolumnens siffra.
   - **Slutmarkör** under tabellen: `🏁 End of Game` om sista kö-frågan = totalQuestions, annars `🔁 + more questions` (kompakt en-rad).
   - **Footer**: `Round X of Y · Question N of M · K players` — diskret total-räknare under markören.

**Single Player-läge** (`isSinglePlayer = !isIndDev && playerCount === 1`) routas till samma media-source-baserade rendering-gren som IndDev (inte PtP-grenen). Skillnader vs IndDev:
- **Header-text**: `"Player name: {playerName}"` (vs IndDev:s `"Next:"`) — playerName från `currentPlayer.name` (= host).
- I övrigt identisk struktur: question-dot-bar i toppen, current question-ruta med media-ikon, queue-chips för upp till 9 kommande frågor + end-of-game-markör.
- Anledning: i PtP-grenen var queue tom när `turnOrder.length <= 1` (queue-useMemo i quiz.tsx returnerar `[]`) — full lista visades aldrig. IndDev-grenen bygger sin queue från `totalQuestions - currentQuestion` direkt, så single-player får korrekt lista oberoende av tom queue-prop.

**Audio-gating (Individual Devices, 2026-06-07)**: allt ljud är host-only i IndDev — non-host:s enhet är tyst:
- `HeartbeatSound` (WebView procedural heartbeat, bpm 80) renderas i `GetReadyIntro` och `quiz.tsx` gated på `isHost`. `isHost` parsas i quiz.tsx: `const isHost = (params.isHost ?? 'true') === 'true'`.
- `CountdownIntro` tar `silent?: boolean`-prop → `silent={!isHost}`. Pre-warm-anropet + alla `Speech.speak`-anrop hoppas över när `silent=true`.
- MorseAmbientSound i LobbyScreen var redan gated på `hostMode` — ingen ändring.

**CountdownIntro röst-nedräkning** (`expo-speech`, installerad v14.0.8): Djup mansröst med `pitch: 0.01` (absolut lägsta) + `rate: 0.42` (långsamt/dramatiskt) + `language: 'en-US'`. Räknar "3", "2", "1", sedan ett sista ord synkat med "?"-glyfen. `finalWord?: 'Who' | 'When'`-prop (default `'Who'`): **Bildgissar-frågor (image/hints)** → `'Who'`; **Årtals-frågor (timeline) + Spotify-frågor** → `'When'` (quiz.tsx härled `currentQ.type === 'timeline' || isSpotifyQ` → `finalWord='When'`). Implementeringsdetaljer:

- **`count` startar som `null`** (ingen siffra visas i Q-ringen). Efter 700 ms initial paus sätts `count = startFrom` (visuell "3" + röst "3" startar exakt synkat). Intervallet tickar sedan var 1300 ms (lugnare, mer dramatisk paus).
- **Pre-warm** vid mount: `Speech.speak(' ', { rate: 2.0 })` (U+00A0 non-breaking space) initierar TTS-motorn ~700 ms innan nedräkningen börjar. Gated på `!silent`.
- **Stop i useEffect-cleanup** (returnvärdet), ALDRIG direkt innan speak — `Speech.stop()` precis före `Speech.speak()` på iOS avbryter det nya anropet.
- **Try/catch** runt speak + stop skyddar mot saknad native-modul i dev-build.
- Om rösten inte hörs: kör `npx expo run:ios` (expo-speech kräver native build — fungerar ej i standard Expo Go).
- JSX-glyf: `count !== null && count > 0` → siffra, `count === 0` → "?", `count === null` → ingenting (700 ms tom Q-ring).

**CountdownIntro:s IndDev/Single Player headline** (= text ovan Q-loggan under 3-2-1-nedräkningen) splittas i två rader:
- Rad 1: `"Get Ready to"` (FontSize.xxl bold, default systemfont).
- Rad 2: `"QuizVibe"` i `Nunito_700Bold` (matchar startskärmens `appName`-format — fontSize 38, weight 700, letterSpacing -0.5, color Colors.textPrimary). Fonten laddas via `useFonts`-hook från `@expo-google-fonts/nunito`; faller tillbaka till systemfont under load (kort flicker första gången).
Pass-the-Phone-läget visar fortfarande "Pass-the-Phone to: <playerName>" + avatar-box.

## Quiz — Leaderboard table (delas av GetReady + final RoundLeaderboard)

Sport-tabell-layout som driver både GetReadyIntro:s utfällbara leaderboard OCH final-leaderboarden i [src/components/RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx). Identisk struktur så användaren ser samma data-vy under hela spelet och vid game-end.

**3-kolumn**: fixed Player (Pos + Namn + meta-rad) | scrollable middle (`Q | ✓ | ✗ | AVG | LAST | Last 5`) | fixed PTS:
- **Vänster fixed**: position (1-based) + namn-stack (emoji+namn ovanpå "Standard · Age 32"-meta-rad i textSecondary). Namn + meta trim:as via `numberOfLines={1}`. Min-width 170 / max 220 px (bumpat från 130/180 så meta-raden får plats utan trunkering — tar utrymme från mid-scroll-kolumnen som scrollar horisontellt vid behov). `lbNameStack` är column-flex med gap 2; `lbName` (FontSize.sm semibold textPrimary) ovanpå `lbNameMeta` (FontSize.xs medium textSecondary, letterSpacing 0).
- **Mitten scrollbar horisontellt**: ScrollView som spänner över ALLA rader (header + spelare) så de scrollar synkat. Cell-höjd 52-56 px konstant så namn+meta-stacken får plats och kolumnerna alignar.
  - **Q** = antal frågor spelaren faktiskt svarat på (= playedRounds; "Q" är användaren-vänligare än "R" i sport-tabell-formatet).
  - **✓** (grön) / **✗** (röd) — räknare för rätt/fel.
  - **AVG** / **LAST** — svarstid med **2 decimaler** (t.ex. `7.48s`). `LAST` = senaste avslutade fråga. Decimal-precisionen kommer från `handleConfirm` som skickar `exactElapsedSec` (Date.now-diff) till `recordRoundScore`, INTE heltals-derived `responseSeconds - timeLeft` — det senare gav alltid `x.00` i dessa kolumner. Mock-opponent `generateOpponentTimeUsed` har på samma sätt `Math.round((5 + Math.random()*20) * 100) / 100` så även auto-genererade svarstider visar variation.
  - **Last 5** — 5 färgade dotts (grön ✓ / röd ✗ / grå tom plats för ej-spelade-ronder), höger-justerade så de senaste 5 alltid pekar mot listans slut.
- **Höger fixed**: PTS — total points i primary blå bold, höger-justerad. Min-width 56 px, alltid synlig.

**Sortering** (3-stegs-prioritet, identisk i quiz.tsx:s `liveLeaderboard` och RoundLeaderboard:s `tableEntries`):
1. **Pts desc** — flest poäng vinner.
2. **0-rounds-skydd** — spelare med `playedRounds === 0` sorteras alltid sist. Förhindrar leapfrog via default `avgResponseSeconds=0` (0 < alla riktiga avg-värden) när data saknas; relevant i IndDev där cross-device-score-aggregering inte är implementerad och andra spelares rader visar 0/0/0 lokalt.
3. **Avg response time asc** — snabbare snitt vinner vid pts-tie. Spelare som timeoutat alla frågor har avg=max-tiden; en spelare som hann svara (även fel) har lägre avg och ska därför ranka högre.

**Aggregering**: `tableEntries` deriveras direkt från `allRoundScoresHistory` per spelare-id. `playedRounds` = antal scores för spelaren, `correctAnswers` = filter på `correct=true`, `avgResponseSeconds` = mean av `timeUsed`, `lastResponseSeconds` = sista entry:s `timeUsed`, `lastFiveResults: boolean[]` = `playerScores.slice(-5).map(s => s.correct)`. När färre än 5 ronder spelats padd:as resten med grå tomma platser. `age` + `assistance` per spelare bärs in från `LeaderboardPlayer`-shape:n och driver meta-raden i Player-kolumnen via `ASSISTANCE_LABEL`-mapping.

## Final Leaderboard-vyn — layout

[src/components/RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx) renderar Final Leaderboard som en **flex column med intern ScrollView + sticky footer**:
- Outer View `flex: 1` fyller hela SafeAreaView:n.
- ScrollView (header + tabell) tar resterande höjd via `flex: 1`. Scrollar internt när tabellen är längre än skärmen.
- `stickyFooter` (Home + Play Again) pinnas naturligt vid skärmens nederkant via flex-layouten — ingen `position: 'absolute'` behövs. `borderTop` + `Colors.background`-bg ger visuell separation från den scrollande tabellen ovanför.

**Renderas UTANFÖR quiz.tsx:s parent ScrollView** via en early-return i renderingen (`if (phase === 'leaderboard') return <SafeAreaView><RoundLeaderboard.../></SafeAreaView>`). Annars hade RoundLeaderboard:s sticky footer följt med uppåt vid scroll i parent och inte längre alltid varit synlig.

**Header**: `headerTitle` = `fontSize: 24, fontWeight: '700'` (matchar Lobby:s screenTitle exakt). `headerSubtitle` ("Round X of Y") renderas BARA när `!isLastRound` — Final-vyn visar enbart huvudrubriken. Tidigare "Final result"-undertitel borttagen för minimalistisk layout.

**Final leaderboard-knappar** (när `isLastRound`, i sticky footer):

> ⚠ **Host:s Play Again är BORTA sedan 2026-08-08** — i ALLA slutskärmar (lokalt spel, guest-hostat och remote) ersätts den av slutskärmens gula flöde (re-match-frågan → Start New Game; se sektionen nedan). `PlayAgainButton` lever kvar ENBART för non-hosts ("Accept / Re-match"); host-varianten (blå single-line "Play again") är därmed **dormant kod** — liksom `handlePlayAgain` och `playAgainModalVisible`-modalen i [app/quiz.tsx](app/quiz.tsx). Beskrivningen av host-varianten nedan är historik.

- **Home** (vänster, `flex: 1`): `<QuizVibeQAvatar size={32} />` + "Home"-text i `flexDirection: 'row'` + `gap: Spacing.sm`. Bg `Colors.card`, border `Colors.border` (1.5 px), `Colors.primary`-text. Speglar TopUserBanner:s "Home"-backlink men på en row-layout istället för column.
- **Play Again** (höger, `flex: 1`): renderas av `PlayAgainButton` (intern komponent i [RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx)). Pressable:n är transparent — den synliga formen är 100% SVG (`PlayAgainLoopBorder`):
  - **Bakgrundsfyllning** (`bgPath`): stängd rounded rectangle, fill `Colors.card` (matchar Home:s interiör). Renderas FÖRST så outline + chevron ligger ovanpå.
  - **Outline** (`rectPath`): samma rounded rectangle MEN med en gap i bottenkantens mitten (`gapRightX`/`leftEdgeResumeX`). Höger del slutar EXAKT vid triangelns top-hörn (CONNECTED på höger sida); vänster del återupptas väl till vänster om spetsen → synligt mellanrum mellan spets och vänster bottenkant. Ingen `Z` — path:en avslutas öppen där den startade (strokeLinecap-round täcker sömlöst utan att rita oönskad diagonal-closure).
  - **Chevron** (`chevronPath`): stängd ◁-triangel som hänger ner från bottenkanten — top-hörnet på bottenkant-nivå, vertikal höger-sida, diagonal upper-left arm till spetsen (16 px till vänster, på halv höjd), diagonal upper-right arm tillbaka till top via `Z`. Filled + strokad i samma `color` så formen läses som solid vänster-pekande pil. Spetsen sitter på `triangleTipY = bottom` (= mitten av triangelns vertikala span); triangelns BOTTOM-corner landar på `y = height` (= button-bottom).
- **Tre färg-/state-varianter** för Play Again-knappen via `color`-prop:
  1. **Host** (eller Pass-the-Phone): `Colors.primary` (blå) — alltid aktiv, lines = `['Play again']` (single-line). **DORMANT sedan 2026-08-08** (se varningen ovan).
  2. **Non-host efter host:s tap** (`hostInitiatedPlayAgain === true`): `Colors.warning` (guld) — aktiv "Accept / Re-match", lyser upp för att signalera "actionable" och skilja från host:s blå.
  3. **Non-host innan host tappat**: `Colors.textSecondary` (dämpat grå) — disabled, ingen `onPress`, plus kant-skärande **"ACTIVATED BY HOST"-badge** i top-position (`playAgainBadge`, guld bg + svart text).
- **Two-line text för non-host** (`finalPlayAgainTextSmall`): FontSize.sm + lineHeight 16, letterSpacing 0.2, textAlign center. Stackar "Approve" / "Re-match" vertikalt så de ryms inom button-bredden utan trunkering (hette "Approve / Play again" t.o.m. 2026-08-08 och "Approve / re-match" t.o.m. 2026-08-14). Host:s single-line "Play again" använder större `finalPlayAgainText` (FontSize.md). Text är title-case — INGEN `textTransform: 'uppercase'`.
- **Dynamiska höjder** (alignering med Home):
  - HOST: `PLAY_AGAIN_BUTTON_HEIGHT_COMPACT = 56`. Båda knapparna 56 px. Rektangelns bottenkant + chevron-spets på `y = 56` (= button-bottom = Home-bottom). Chevron extends 7 px UNDER Pressable:n; SVG-höjden bumpas till `max(buttonHeight, bottomY + TRIANGLE_HALF_H + 1)` = 64 så strokeLinejoin-round ryms. SVG positioneras med `{ position: 'absolute', top: 0, left: 0 }` (INTE absoluteFillObject) så den kan extends utanför Pressable-bounds (parent har `overflow: 'visible'`).
  - NON-HOST: `PLAY_AGAIN_BUTTON_HEIGHT_EXPANDED = 64`. Play Again Pressable 64 px (rymmer two-line text + chevron), Home 57 px (= `bottomY` = `playAgainHeight - TRIANGLE_HALF_H`). Båda top-aligned via `alignItems: 'flex-start'` på `finalActions` — Home:s underkant linjerar med rektangel-outlinens bottenkant + chevron-spetsen, INTE med chevron:s bottom-corner.

Båda knappar `flex: 1` så footer-raden fylls 50/50 med Spacing.sm gap mellan; `gap` + `flexDirection: 'row'` + `alignItems: 'flex-start'` på `finalActions`-container. Sticky footer-padding är slimmad (`paddingTop: Spacing.sm`, `paddingBottom: Spacing.md`) för kompakt höjd.

**Bakgrunds-vattenstämpel: Q + pokal** ([RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx)) — synlig endast på Final-vyn (`isLastRound`):
- `BG_Q_SIZE = Math.round(Dimensions.get('window').width * 0.9)` — täcker ~90% av skärm-bredden. `BG_TROPHY_SIZE = Math.round(BG_Q_SIZE * 0.4)` — pokal-emoji fyller Q-ringen tydligt utan att svämma över kantlinjen.
- SVG-Q använder samma koordinater som [QuizVibeLogo](src/components/QuizVibeLogo.tsx) (cx=37, cy=37, r=13, svans M46→L52, strokeWidth 3). viewBox `"19 19 36 36"` centrerar Q-ringen exakt på SVG-render-boxens visuella mitt — pokal-emoji (centrerad i wrap:erns flex-layout) hamnar därför mitt i Q-ringen.
- **Färg**: `Colors.warning` (gold) — signalerar "vinnar-skärm".
- **Enhetlig ton vid svans-tangent**: Q-ringen och svansen är wrappade i en `<G opacity={0.22}>` istället för per-element `opacity`. Per-element-opacity ackumuleras visuellt där stroke:ar tangerar varandra (svans möter ring) och området blir tydligt mörkare. G-nivå-opacity komponerar gruppen som en enhet efter att stroke-pixlarna ritats → enhetlig nyans överallt.
- **Z-order: ÖVER tabellen, UNDER sticky footer**: wrap:n är renderad EFTER ScrollView i JSX men FÖRE `stickyFooter` — så Q+pokal fungerar som transparent vattenstämpel ovanpå spelar-rader (`opacity={0.22}` håller text/siffror läsbara genom) men Home/Play Again-knapparna ligger ovanpå vattenstämpeln. `pointerEvents="none"` på wrap:n så taps på underliggande rader/Pressables inte blockas.
- Renderas för **alla** spel-lägen (single-player, PtP, IndDev) — gating är på `isLastRound`-prop, inte gameMode.

## Prisutdelnings-sekvens före Final Leaderboard (2026-08-14)

Mellan sista frågans reveal och slutskärmen spelas en kort prisutdelning: guld-Q:t **ritas fram med sprakande gnistor**, sedan landar pokal + ordmärke med konfetti, följt av automatiskt bläddrande **match highlights**-kort, som sedan tonar bort och avslöjar den befintliga slutskärmen. [FinalCelebration.tsx](src/components/FinalCelebration.tsx) + [SparkleDrawQ.tsx](src/components/SparkleDrawQ.tsx) + [Confetti.tsx](src/components/Confetti.tsx) + [matchHighlights.ts](src/utils/matchHighlights.ts).

**Entrén: Q:t ritas som ett tomtebloss (Peter 2026-08-25).** [SparkleDrawQ](src/components/SparkleDrawQ.tsx) ritar ring + svans med stroke-dash medan en **brinnande spets** svepar runt ringen. Under ligger en bredare kopia av samma streck vars `strokeOpacity` **flimrar** — den ger sprak-känslan; huvudstrecket blinkar MEDVETET aldrig, det är märket som ska stå kvar. Ordningen är ritning (`DRAW_MS = 1150`) → pokal + "QuizVibe" fjädrar in → konfetti → håll → settle.
- **Gnistorna kommer i SKURAR, inte som enstaka prickar.** 26 emissionspunkter (20 på ringen + 6 på svansen) × 4 gnistor = ~104 st (48 på korta skärmar). Varje skur spretar ±90° kring normalen, ~17 % är "långskyttar" som far dubbelt så långt, och varje gnista knastrar via en delad opacitets-ramp (`FLICKER_AT`/`FLICKER_TO`). Enstaka gnistor per punkt läste som glitter — det är sprayen som gör blosset.
- ⚠ **Transform-ordningen bär hela banan**: `[{translateY: fall}, {rotate: dir}, {translateX: travel}, {scale}]`. `fall` ligger FÖRE rotationen och verkar därför i världens koordinater (rakt ned); `travel` ligger EFTER och verkar i det roterade systemet (rakt utåt). Flyttas `fall` efter `rotate` faller gnistorna åt varsitt håll i stället för mot marken.
- **Paletten är vit-dominerad** (`SPARK_COLORS`) — rent guld läser som konfetti, inte som gnistor. Spetsen är en vit kärna i en **egen glödgårds-vy**: Android renderar ingen färgad `shadow`-glöd, så utan vyn blir spetsen bara en vit prick där.
- ⚠ **Skala får aldrig ligga på ringspetsens roterande box** — den är `absoluteFill` och skalas kring ringens mitt, dvs. den skulle ändra radien. Pulsen sitter på den inre vyn.
- ⚠ **INGA animerade SVG-props — det låser skärmen.** Första versionen ritade med `strokeDashoffset` bunden till en `Animated.Value` (JS-drivaren; dash finns inte i native-drivarens vitlista) som ett steg i FinalCelebrations `Animated.sequence`. Den rapporterade **aldrig klart**, så sekvensen stannade i `'celebration'`: pokalen kom aldrig, summary-korten kom aldrig, och "Go to Final leaderboard" — enda vägen ut — renderades aldrig. Spelaren blev inlåst bakom den touch-blockerande slöjan med bara ett pulserande Q. Nu ritas bågen om från vanlig React-state i en rAF-loop (`arcPath(deg)` växer medurs från klockan 3), och gnistorna går på native-drivaren som konfettin. **Gå inte tillbaka till dash-animation.**
- ⚠ **Sekvensen väntar bara på klockan, aldrig på ritningen.** Steget är `Animated.delay(DRAW_MS)` och `SparkleDrawQ` rapporterar ingenting tillbaka. Ovanpå det ligger en **watchdog** som forcerar `stage → 'highlights'` (och sätter märkets slutvärden) om sekvensen mot förmodan inte gjort det. Att bli kvar i `'celebration'` gör appen oanvändbar, så den kostnaden är värd en timer.
- **Sista graderna renderas som hel `<Circle>`.** En SVG-båge vars ändpunkter sammanfaller ritas inte alls enligt specen, så `deg >= 359.5` byter till cirkel — samma element som det statiska sluttillståndet, vilket gör bytet osynligt. **Glödlagrets flimmer (`glowAt`) måste landa på exakt 0 vid progress 1** av samma skäl.
- **Gnistlagret är `React.memo`.** Bågen ritas om varje frame från state; utan memo hade ~104 gnistvyer byggts om lika ofta. Alla dess props är stabila referenser, så det renderas exakt en gång.

**Sprakljudet: [SparklerSound](src/components/SparklerSound.tsx) (Peter 2026-08-25).** Tomtebloss-fräs medan Q:t ritas + en fyrverkerismäll när svansen är klar. Samma väg som [MorseAmbientSound](src/components/MorseAmbientSound.tsx) — **osynlig WebView + Web Audio API**, allt syntetiserat. Repot har ingen audio-modul (`expo-audio` är parkerad) och inga ljud-assets; lägg inte till ett beroende för det här.
- **Tre lager**: ett bandpass-filtrerat brusfräs som ligger under hela ritningen och stegras mot slutet, ~40 korta brusknäppar vars täthet ökar med tiden, och en finale följd av ~0,9 s efterknaster.
- ⚠ **Smällens mörker kommer ur att rulla av TOPPEN, inte ur att lägga till botten (Peter 2026-08-25).** En mobilhögtalare återger ingen riktig bas, så explosionen filtreras genom ett **lowpass som sveper 2400 → 380 Hz** (ersatte ett highpass vid 900) med längre utklingning. Tryckvågen sveper 110 → 30 Hz, men **hörs inte av sig själv** på telefon — därför ligger en `triangle` en oktav över (220 → 60 Hz) genom ett lowpass vid 520: dess övertoner är det man faktiskt hör, och örat tolkar dem som den låga grundtonen. Tas triangeln bort blir sveppet tyst i stället för mörkt.
- **Hela schemat läggs på absolut tid vid start.** Sekvensen är bara ~2 s, så ingen look-ahead-loop behövs (till skillnad från MorseAmbientSounds oändliga slinga) och ingenting kan drifta.
- ⚠ **`window.__t0` kompenserar för WebView-laddningen.** HTML + AudioContext tar 100–300 ms på enhet medan ritningen börjar direkt vid mount; sidan får mount-tidsstämpeln via `injectedJavaScriptBeforeContentLoaded` och **hoppar över** den del av schemat som redan passerat. Tas den bort hamnar smällen efter pokalen i stället för på den. Är hela sekvensen redan slut när ljudet startar spelas ingenting alls.
- ⚠ **`DRAW_MS` räknas från MOUNT, inte från sekvensens start.** `SparkleDrawQ` startar sin ritning i sin egen mount-effekt, parallellt med `markIn`. Därför är sekvens-steget `Animated.delay(DRAW_MS - t.markIn)` och konfettin `DRAW_MS - 60` — allt keyat mot mount, så pokal, konfetti och smäll landar i samma ögonblick som Q:t blir färdigt.
- **Grindas ENBART på `isAudioMutedForSelf`** (skickas som `muted` från quiz.tsx), som appens fyra övriga ljudkällor. Spelas heller inte vid Reduce Motion — då ritas ingenting, så det finns inget att ljudsätta.
- **Halon bakom märket tänds i takt med ritningen** (startvärde 0, rampas upp över `DRAW_MS`, börjar pulsera först när ringen slutits). En glöd som ligger färdig från första framen avslöjar märket innan pennan hunnit dit.

**Overlay, inte ersättande vy.** `<FinalCelebration>` renderas som syskon EFTER `<RoundLeaderboard>` i `phase === 'leaderboard'`-returen och tonar bort för att avslöja den. Skälet: slutskärmens effekter (`saveFinalGame`, `finalizePlayer` mot servern, `track('game_completed')`) körs redan när fasen blir `'leaderboard'` och får **inte** fördröjas av en animation. Bygg aldrig om detta till en vy som ersätter leaderboarden.

**Märket blir vattenstämpeln.** Celebration-märket använder EXAKT samma geometri, storlek och position som `bgFinalWrap`/`bgFinalTrophy`/`bgFinalBrand` ovan, och tonas vid "settle" ned till samma `opacity 0.22`. När slöjan försvinner ligger den riktiga vattenstämpeln redan där, identisk — bytet är osynligt och läses som ETT märke som dimmas. ⚠ **Ändras `BG_Q_SIZE` eller `bgFinalBrand` i RoundLeaderboard måste `Q_SIZE`/`brand` i FinalCelebration ändras med.**

**Gating**: `isLastQuestion && !summaryDone`. `phase` kan bli `'leaderboard'` även MELLAN ronder via footerns `Next Round →`-gren — där ska ingen prisutdelning fyra.

**Däcket (omarbetat 2026-08-25, Peter)** — fem kort i FAST ordning. Ordningen är explicit begärd; ändra den inte utan nytt beslut (notera att **Spotify ligger före YouTube** trots att YouTube är den vanligaste källan):

| # | Kort | Innehåll | Villkor |
|---|---|---|---|
| 1 | Correct answers | **PLACERINGSLISTA över alla spelare** efter antal rätt | ≥2 spelare |
| 2 | Best on Spotify | **enbart förstaplatsen** (flest rätt i källan), samma radlayout | källan spelad + någon fick ≥1 rätt |
| 3 | Best on YouTube | ↑ | ↑ |
| 4 | Best on Hints | ↑ | ↑ |
| 5 | Fastest fingers | **PLACERINGSLISTA över alla spelare** efter snittsvarstid | ≥2 spelare med tidsunderlag |

**ALLA kort som namnger spelare använder SAMMA radlayout** (Peter 2026-08-25): `1. 🦊 Anna` till vänster, talet högerställt. Skillnaden är bara hur många rader som visas — listkorten (1 och 5) tar med alla spelare, källkorten (2-4) bara förstaplatsen. Det finns alltså inget "stort namn + stort tal"-kort kvar; `HighlightCard.rows` är enda vägen till ett spelarnamn, och `value` används bara när det inte finns någon att placera sig mot.

**Talet i högerkolumnen** är `antal rätt/antal frågor` på kort 1-4 och snittiden på kort 5. ⚠ På källkorten är **nämnaren hinkens storlek**, inte spelarens antal svar — alla delade vinnare har samma `correct`, men `answered` kan skilja om någon tappade uppkopplingen. Kort 1 använder däremot spelarens eget `answered`.

**Delad placering är hela poängen med listkorten.** Standard competition ranking (**1, 1, 3** — inte 1, 1, 2): spelare med samma antal rätt delar plats. Det skiljer sig MEDVETET från Final Leaderboard, som bryter poänglika på snittsvarstid och därför alltid ger en unik ordning — korten firar prestationen, tabellen kör tävlingen. Källkorten (2-4) visar bara förstaplatsen, men **flera spelare kan dela den och listas då båda på plats 1** (`detail`: "N players share first place").
- Kort 1 delar plats på **antal rätt**, inte på träffprocent — "3/4" och "3/3" hamnar på samma plats.
- Kort 5 delar plats på det **VISADE** talet (2 decimaler). Annars kan två rader som båda står på "8.42s" hamna på plats 1 och 2, vilket läses som en bugg.
- Spelare som aldrig svarade är MED i kort 1 (sist, "0/0") men UTE ur kort 5 — de har inget tidsunderlag att placera.

**Kort 5 mäter snittiden att låsa ett svar oavsett rätt/fel** — samma tal som tabellens `AVG`-kolumn och samma som redan avgör vid poänglika i sorteringen. Sekvensen förstärker alltså poängmodellen spelarna redan spelar efter. **Timeouts räknas MED** (registreras med full svarstid — man låste aldrig ett svar), **`connectionError` räknas BORT** (nätverkets fel; tabellen särredovisar dem redan). Ändra inte det utan att också ändra `AVG`, annars motsäger kortet tabellen under.

⚠ **`MIN_QUESTIONS_PER_BUCKET = 1`** (sänkt från 2 den 2026-08-25). Regeln är "visa inte kort för källor som inte spelats" — en källa som spelats EN gång HAR spelats. Tröskeln 2 var dessutom oförenlig med däcket: standardspelet är 4 rundor och Hints-kvoten är `floor(N/4) = 1` fråga, så Hints-kortet hade aldrig kunnat visas. Källor utan data hoppas fortfarande över automatiskt, liksom källor där **ingen** fick något rätt (sekvensen ska vara firande — "Best on Spotify — 0 of 3" är den inte).

**`mode`**: `competitive` ger källkorten sina rader; `personal` utelämnar dem och låter talet bära kortet ("Spotify — 3 of 4"). Personal används vid **enspelarläge och remote 1v1**.
- ⚠ **Listkorten gatas på ANTALET SPELARE, inte på `mode`.** Remote 1v1 kör personal-läge (källjämförelser saknar underlag) men har två spelare med fullgott underlag för båda listkorten — de ska placeras mot varandra. Ett SOLOSPEL får value-layouten i stället, eftersom en lista med en enda rad inte är en placering.

⚠ **Dormant sedan 2026-08-25: kategorikorten (Musik/Film/Sport) och "snabbaste enskilda rätta svar".** De föll bort när däcket ovan spikades. `HighlightCard.category`, kind:arna `'category'`/`'fastest-single'`, `CATEGORY_CARDS` och badge-renderingen i FinalCelebration lämnas kvar så de kan återinföras med en loop — men **inget emitterar dem i dag**, och `BuildMatchHighlightsInput.categoryByQuestion` är därför optional och oanvänd (quiz.tsx skickar den fortfarande). Radera dem inte som "död kod".

⚠ **"Bild"-frågor och "Hints" är SAMMA hink.** Personbilderna är juridiskt parkerade — det som spelas är flagga + ledtrådar. Kortet heter `Hints` (appens eget namn i Source Mixerboard). Lägg inte till ett separat bildkort.

**`RoundScore.questionIndex`** (nytt, optional) är det som gör källkorten möjliga. ⚠ **Man kan INTE använda `allRoundScoresHistory`:s yttre index** — i IndDev appendas mottagna peer-scores som nya yttre poster i ankomstordning (`playerScoreRecordedHandlerRef`), så yttre index ≠ frågeindex så fort fler än en enhet spelar. Fältet sätts från `questionIndexRef.current` lokalt och från `payload.question_index` för peers (som tidigare bara användes till dedup-nyckeln). Joinas mot `effectiveCategoryByQuestion` / `effectiveMediaSourceByQuestion` — båda indexerade mot host:s auktoritativa sekvens och korrekta på alla enheter.

**Kort-slidern** — korten ligger i en horisontell `ScrollView` med `pagingEnabled` (en sida = full skärmbredd, krav för paging). **Placeringslistorna har en egen VERTIKAL `ScrollView`** med tak `RANK_LIST_MAX_H` (34 % av skärmhöjden): ett 12-spelarspel ryms inte på en kort skärm, och att korta listan hade motsagt "alla spelare listas". Motsatt scroll-riktning gör att paging fortfarande fungerar. Listkort får dessutom längre auto-hålltid (`cardHold + rader × RANK_ROW_HOLD_MS`) — en lista med tio namn hinner inte läsas på samma tid som ett kort med ett enda tal. Spelaren sveper själv; prick-indikatorn under visar vilket kort av hur många (döljs vid ett enda kort). **Auto-bläddringen stannar PERMANENT vid första egna svepet** (`userTookOver`) — annars slåss auto-framåt mot den som just svepte bakåt. **"Go to Final leaderboard"** sitter under prickarna, utanför kortet, och renderas ÄVEN när det inte finns några kort — den är enda vägen ut. Den är **gold med svart text och pulserar** (scale 1 ↔ 1.04 / 700 ms, samma cadens som `useCtaPulse` i RoundLeaderboard och Home:s `gameBtn`) — appens vokabulär för en aktiv, upplåst CTA. Hette "Leave summary" i grått t.o.m. 2026-08-25; grå-med-vitt är appens LÅSTA-signal och var fel för enda vägen vidare. Pulsen är en lokal kopia av loopen, inte en import — overlayen ska inte dra in hela RoundLeaderboard-modulen för fyra rader.

**Kortens kant är 3 px** (Peter 2026-08-25, upp från 1,5) så kortet läses som ett eget lager ovanpå slöjan. ⚠ Kortet får fortfarande INTE sättas till `overflow: hidden` — då klipps den kant-skärande kategoribadgen (dormant, men stilen finns kvar).

**Varje enhet äger sin EGEN sekvens (Peter 2026-08-14).** Ingen host-styrning, ingen broadcast — `skip_summary`-eventet som fanns i ett tidigt utkast är borttaget ur syncChannel; återinför det inte. Alla spelare, i alla lägen, lämnar när de själva vill.
- ⚠ **Sekvensen avslutas ALDRIG av sig själv.** Når auto-bläddringen sista kortet stannar den där och väntar på tappet. Ett tidigare utkast tonade ut automatiskt efter sista kortet — men eftersom alla enheter har samma antal kort och samma timing gick de i mål nästan samtidigt, vilket såg ut som att hostens tapp kastade ut de andra. `setSummaryDone` nås numera bara via det lokala tappet; det finns ingen kod-väg mellan enheterna.
- ⚠ **En host som går till Home avbryter INTE en non-host som fortfarande bläddrar.** `lobby_deleted`-handlern köar i stället popupen: träffar eventet medan `celebrationVisibleRef.current` är true sätts `pendingLobbyDeletedRef` och `showLobbyDeletedAlert()` körs först i `handleSummaryDone`. `lobbyDeletedAlertedRef` sätts direkt (som förut) så eventet aldrig dubbelfyrar.

**Sekvensen har sin EGEN rubrik: "Game Summary"** (Peter 2026-08-14), placerad ovanför korten inuti overlayen — den försvinner alltså tillsammans med korten när spelaren trycker "Go to Final leaderboard", varpå slutskärmens egen "Final Leaderboard"-rubrik tar över. Samma vikt och storlek (24 / 700 vit) så de två läser som samma nivå i hierarkin.
- ⚠ **Försök INTE låta RoundLeaderboards rubrik lysa igenom slöjan.** Två utkast provade det: först en pixel-identisk kopia ritad i overlayen (gav en dubblett på fel plats), sedan en mätt `headerInset` via `onHeaderLayout` som slöjan började under (rubriken blev ändå aldrig tydligt vit). Båda är borttagna — `onHeaderLayout` finns inte längre på RoundLeaderboard. En egen rubrik som ägs av sekvensen är både enklare och tydligare.

⚠ **Uttoningen animerar BARA `veil` (overlayens rot) — lägg aldrig till fler värden i den.** Ett tidigare utkast animerade även `blockOpacity` i en `Animated.parallel`, men kort-slidern avmonterades i samma ögonblick som `stage` blev `'fading'`; en native-driven animation mot den avmonterade noden gjorde att parallellen (`stopTogether: true`) aldrig rapporterade `finished`, så `onDone` aldrig fyrade och den touch-blockerande slöjan låg kvar — skärmen frös. Slidern hålls numera monterad under `'fading'`, och en watchdog-timeout (`veilOut + 400 ms`) anropar `fireDone` oavsett, eftersom en kvarliggande slöja blockerar all input.

⚠ **Slöjan startar OPAK (`veil` initieras till 1), aldrig med en fade-in.** Fade-in lät leaderboard-tabellen synas först — och värre: `AccessibilityInfo.isReduceMotionEnabled()` await:as innan animationen ens startar, så glappet blev längre än de 400 ms man kodade. Det lästes som en blixt vid inträdet. Bara uttoningen i slutet animerar värdet.

**Remote 1v1**: inget särfall längre för att lämna sekvensen (alla äger sin egen). Celebration visas alltid, men **highlights bara när matchen är avgjord** (`remoteSummaryReady`) — motståndarens rad kommer som färdigaggregerad `summaryStats` utan per-frågedata. Kort 1 och 2 fungerar ändå som riktiga dueller (`summaryStats` bär `correctAnswers` + `avgResponseSeconds`); kategori-/källkorten faller tillbaka på personlig form.

**Konfettin är handrullad** — repot har varken konfetti- eller Lottie-modul, och resten av appens animationer använder RN:s `Animated` (Reanimated finns installerat men används ingenstans). **EN** `Animated.Value` driver alla bitar via per-bit-interpolation → en animation i stället för N. 40 bitar, 28 på skärmar under 700 px.

**Reduce Motion** (`AccessibilityInfo.isReduceMotionEnabled()`) hoppar över konfetti, gnist-ritningen (Q:t står färdigt från första framen) och fjädring, och kortar håll-tiderna — men kör sekvensen fullständigt.

⚠ **Slöjan är en `Pressable` med no-op `onPress`, inte en `View`.** Overlayen är `box-none` och en View utan touch-handler blir aldrig responder — taps skulle falla igenom till Home/Play Again i sticky-footern under, som spelaren inte kan se. Skip-pillret renderas efter slöjan och ligger därför ovanpå den.

**Känd begränsning**: i IndDev räknar varje enhet fram korten ur sin egen sammanslagna kopia. Tappas en `player_score_recorded`-broadcast kan två enheter visa olika vinnare på ett kort — samma egenskap som tabellen redan har, och retry/drain vid reconnect gör det ovanligt.

**Delning till sociala medier är INTE byggd** (steg 2). Kräver `react-native-view-shot` + `expo-sharing` + `expo-file-system` som direkt dep → nytt dev-/TestFlight-bygge. Se planen för delningskortets spec.

Tester: [backend/content/test/matchHighlights.test.ts](backend/content/test/matchHighlights.test.ts) (28 st) låser kortordningen (inkl. Spotify före YouTube), radlayouten på källkorten (plats 1 + rätt/frågor, nämnare = hinkens storlek), delad placering i båda listkorten (1, 1, 3 + delning på visat tal), delad förstaplats på källkorten, 1-frågas-källor, autoskippade källor, solo/personal-fallbacken, remote-gaten på spelarantal och snittidens timeout-/connectionError-semantik.

## Final Leaderboard: "Re-match with Aggregate Leaderboard?" → "Start New Game" — 2026-08-08, omarbetad 2026-08-24 (rev 3)

Host:s **Play Again** är borttagen ur slutskärmen. I stället ställs **EN fråga i taget**; Home-raden ligger kvar längst ned hela tiden.

**Steg 1 — `replayChoice === 'ask'` (default):** bara rubriken **"Re-match with Aggregate Leaderboard?"** + inline **Yes / No** syns. **"Start New Game" renderas INTE** — call-siten skickar helt enkelt inte in `onStartNewGame`, och dess frånvaro är det som döljer knappen.
- **Yes** → carry-over-flödet i `previousLocalMode` (en re-match byter ALDRIG läge, därför inget lägesval här).
  - **Med förväntade approvers** (IndDev-non-hosts, eller PtP-åskådare — se `rematchExpectedApproverIds`): `rematchInvite=true` + `play_again_initiated` broadcastas så deras **"Accept / Re-match"** tänds (guld, pulsande). Yes gråas ut (`replayLocked`), **No göms** (`replayAnswered`) och `replayNote` visar "Waiting for N of M players to accept" + `SequentialDots` → "✓ All players have approved". Host tappar Yes igen när den tänds → **NU** körs aggregat-frågan (`ensureAggregateLeaderboardAttached`: "Add to existing?"/namn-prompt, se Aggregat-sektionen) och därefter `proceedWithRematch`. ⚠ **Aggregat-frågan kör MEDVETET på detta andra tapp, EFTER approvals — inte på det första** (Peter 2026-08-29): tidigare kom den direkt när inbjudan gick ut, innan någon accepterat. Cancel i namn-prompten här → host stannar kvar med den upplysta Yes:en och kan tappa igen (inbjudan är redan utskickad; ingen annan ångra-väg).
  - **Utan förväntade approvers** (single player; IndDev utan kvarvarande non-hosts; PtP där ingen följer leaderboarden på egen enhet): inget att vänta in → direkt till ny lobby. ⚠ Dessa vägar sätter MEDVETET **inte** `rematchInvite`, så **No fortfarande går att välja** om host backar ur längre fram.
- **No** → `replayChoice = 'no'`, re-match-blocket försvinner och "Start New Game" tar dess plats.

**Steg 2 — `replayChoice === 'no'`:** "Start New Game" beter sig EXAKT som Home:s knapp: credit-gate → lägesvalet (Single Game / Multiplayer Game / Remote Play) → `goToNewLobby(false, **false**, undefined, lobbyType)`. `keepSettings=false` speglar Home:s `clearLobbySettings(code)` — LobbyScreen seedar från host-profilen. Inga carry-over-frågor, inga spelare. Medan panelen är utfälld göms Home-raden (samma mönster som Home döljer sina övriga knappar).

**⚠ Ordningen har vänts TRE gånger — läs inte äldre beskrivningar som aktuella.** Rev 1 (2026-08-08): invite-Alert MELLAN tappet och lägesvalet. Rev 2 (2026-08-24): carry-over bröts ut till en egen knapp bredvid Start New Game. Rev 3 (2026-08-24, denna): frågan kommer FÖRST och Start New Game finns inte förrän host svarat No. Beskrivningar av `lockedLocalTypes`, `startNewGameNote`, `onReplay`/`handleReplayPress` eller en Alert med "Yes, same players again / No, start fresh / Cancel" är stale — den Alerten finns inte längre.

**`previousLocalMode`** (`app/quiz.tsx`) = `isLocalSoloGame ? 'single' : 'multiplayer'`.

**Gäller/gäller inte:**
- **Pass-the-Phone**: ⚠ **HAR re-match sedan 2026-08-26** (Peter) — undantaget 2026-08-25 är upphävt. Två regler bär det:

  **(a) Behörighet.** `ptpRematchBlocked` kräver att ALLA deltagare är registrerade QuizVibe-users: `!isLocalSoloGame && gameMode === 'pass-the-phone' && turnOrder.some(p => p.type === 'guest')`. En enda gäst — värd-tillagd via "+ Add Player" ELLER självansluten anon — och frågan visas inte alls (slutskärmen ser ut som före 2026-08-26). Det är detta som upphäver den gamla invändningen: spel med gäster är helt enkelt inte behöriga, i stället för att approvals byggs runt dem. Bonus: alla deltagare har då `user_id`, så Competition-serien blir **server-sparad** i stället för lokal-bara.
  ⚠ Fail-open på `type === undefined` (`=== 'guest'`, inte `!== 'registered'`) — fältet är optional, och en tyst borttappad `type` ska hellre släppa igenom en gäst än tyst döda re-match för ett legitimt spel.
  ⚠ `isLocalSoloGame` MÅSTE stå först — solo bär oftast `gameMode: 'pass-the-phone'` (profil-defaulten). Samma fälla som buggen 2026-08-26.

  **(b) Approvers = ENHETSNÄRVARO, inte roster.** Se `ptpSpectatorIds` nedan. `auto_join` förblir MEDVETET `undefined` i PtP: den accepterande åskådaren sätter `awaitingNewLobbyRef` lokalt före sin broadcast, så bara accepterare navigerar; övriga får "Host has already started a new Game" → Home.

  **(c) ALLA spelare från förra spelet måste bekräfta** (Peter 2026-08-26) — inte bara de som råkar vara uppkopplade. `rematchExpectedApproverIds` är därför **hela rostern i båda lägen** (`turnOrder.slice(1)`); läges-splitten som fanns här en kort stund är borta.
  ⚠ **Saknar någon en levande enhet är en re-match OMÖJLIG**, inte bara fördröjd — de kan aldrig godkänna. `ptpAllPreviousPlayersActive` (varje roster-id finns i `ptpSpectatorIds`) stänger då frågan helt och host får den grå raden *"No re-match possible — / Not all players from the previous game are active any longer"* (två rader, `
` i strängen) ovanför Start New Game. Att i stället låta hostens Yes stå grå för alltid vore ohederligt. **Följd:** kopplar någon ner mitt i väntan retras frågan.
  ⚠ **Har inbjudan redan gått ut räknas ett Home-tapp som ett aktivt NEJ**, och host får en Alert: *"Re-match not possible / At least one player has denied the re-match."* Utan den skulle blocket bara försvinna under host:s fingrar. Villkoret är `rematchInviteRef.current` — en synkron spegel, eftersom `player_left`-handlern registreras med deps `[phase, isLastQuestion]` och annars läser `rematchInvite` som det såg ut när fasen blev `'leaderboard'` (= alltid false). `rematchDeniedAlertedRef` gör den till en engångshändelse när flera lämnar. Ingen extra state krävs för själva bytet: när host tryckt OK har render:n redan svängt om till grå rad + Start New Game.
  ⚠ **IndDev följer SAMMA regel** (Peter 2026-08-26) — tidigare låste en non-host som lämnade efter inbjudan host:s Yes för alltid. Lägena mäter dock samma sak från olika håll, av nödvändighet:

| Läge | Aktiv-test | Varför |
|---|---|---|
| Pass-the-Phone | **positivt bevis** — id:t finns i `ptpSpectatorIds` | De flesta spelar på host:s telefon utan egen app uppe; bara den som valde "Follow leaderboard" har en enhet i kanalen |
| Individual Devices | **negativt bevis** — id:t finns INTE i `leftPlayerIds` | Alla non-hosts spelar per definition på egen enhet, så utgångsläget är "aktiv"; bara ett explicit `player_left` diskvalificerar |

  ⚠ **Watchdogen används INTE i någotdera läget.** Den kan inte skilja "gick därifrån" från "låste skärmen", och iOS fryser JS-tråden vid varje skärmlås — en watchdog-baserad diskvalificering hade tyst dödat re-matchen för någon som satt kvar med telefonen i fickan.
  ⚠ **"X has left"-Alerten undertrycks när inbjudan är ute** (`deniedRematch`) — två staplade Alerts på iOS kan svälja den ena, och på slutskärmen är avhoppets KONSEKVENS (ingen re-match) det som faktiskt är händelsen. Under själva spelet visas den som förr.
  ⚠ **Regeln hänger på att follow-prompten har "Follow leaderboard" som FÖRVALT svar** (samma beslut, samma dag) — varje "Not now" gör en PtP-re-match omöjlig. Görs prompten om till att avråda igen slutar funktionen i praktiken att gå att nå. En variant som bara uteslöt bevisade avhopp (`ptpDepartedIds`) byggdes och förkastades; den vilade på en mätning gjord före beslutet.
  ⚠ **`rematchRoster` i `goToNewLobby` är numera TAUTOLOGISKT** (host kan bara nå dit när alla är aktiva OCH har accepterat) men behålls som backstop: `contribution` mappar över hela `turnOrder`, så en regression i gaten degraderar då till "färre spelare i re-matchen" i stället för "främmande poäng i någons Competition-historik".
- **Single player** (`isLocalSoloGame`, dvs. `turnOrder.length <= 1`): ⚠ **HAR ÅTER EN FRÅGA sedan 2026-08-25 (senare samma dag) — men med ANNAN text: "Replay & Aggregate score?"** Frågan togs bort tidigare med motiveringen "ingen motpart att aggregera mot"; motparten är spelarens EGNA tidigare spel. **No** → Start New Game som förr. **Yes** → ny Single player-lobby med låst uppsättning (en spelare) som fyller på en **Aggregate Score**. Ingen approval-väntan (inga non-hosts) och ingen Keep/Reset-prompt — den finns inte längre för någon, se "Keep/Reset borttagen" nedan. Vänd inte tillbaka utan nytt beslut.
  - ⚠ **Gaten måste testa `isLocalSoloGame` FÖRST.** Single player är `singlePlayerDefault: true` ovanpå ett vanligt `gameMode`, inte ett eget läge — ett solospel bär alltså oftast `gameMode: 'pass-the-phone'` (profil-defaulten). En naken `gameMode !== 'pass-the-phone'` slår därför ut solo tillsammans med PtP-multiplayer, och frågan syns aldrig (bugg 2026-08-26). PtP-undantaget gäller PtP-MULTIPLAYER.
- **Guest-hostade spel**: ⚠ **INGEN re-match och INGEN replay — i något läge** (Peter 2026-08-26). Det ersätter det tidigare 1-replay-taket helt; noten "Replay only possible 1 time for Guest Hosts" är borttagen och `guestReplaysUsed` är vestigial för lokala spel (remote använder den fortfarande som literal för att tvinga Home-only). `localRematchFlow` utesluter `isGuestHostGame`, och slutskärmen blir:

| Guest host | Slutskärmen visar |
|---|---|
| **inloggad** QuizVibe-user (`hostIsRegisteredUser`) | enbart **Start New Game** |
| **ej inloggad** | enbart **Home** |

  Båda får dessutom den grå raden *"No re-match possible for Guest Host"* överst i footern.

**De tre grå raderna ovanför "Start New Game"** (`rematchUnavailableNote` i [app/quiz.tsx](app/quiz.tsx)) förklarar varför re-match uteblev — utan dem ser det bara ut som att funktionen saknas:

| Villkor | Text |
|---|---|
| `isGuestHostGame` | *No re-match possible for Guest Host* |
| PtP med minst en `type: 'guest'` | *No re-match possible —* / *Game includes a Guest player* |
| Någon i rostern saknar levande enhet | *No re-match possible —* / *Not all players from the previous game are active any longer* |

⚠ **Åskådaren behöver också veta att ingen inbjudan kommer.** `rematchImpossibleForGame` (guest host ELLER PtP med minst en gäst) beräknas ur data ALLA enheter har (`turnOrder` + params) och skickas som `rematchImpossible` till `RoundLeaderboard`, som då ger non-host bara Home. Utan den fick åskådaren den dimmade *"Accept / Re-match"* med badgen "Activated by Host" — en knapp som aldrig kan tändas, eftersom host:s gäst-gate aldrig släpper fram frågan. Den gamla `homeOnlyFooter` gjorde samma jobb men var för trubbig (gällde ALLA PtP-åskådare).
⚠ Flaggan inkluderar MEDVETET inte `allPreviousPlayersActive` — den bygger på `ptpSpectatorIds`, som bara host har. En åskådare kan inte veta att någon ANNAN saknar enhet och ska då fortsätta visa den dimmade knappen; host kan mycket väl skicka inbjudan.

⚠ **Ordningen är betydelsebärande.** Gäst-fallet testas FÖRE aktiv-fallet: ett PtP-spel med gäster faller på BÅDA (en gäst kopplar aldrig upp sig och kan därför aldrig bli "aktiv"), och då är gäst-skälet det sanna — "not all players are active" hade fått det att låta som att någon gick därifrån. Alla texter har explicit `
` så rubrikraden står för sig; `guestReplayNote` är centrerad.

  ⚠ **Start New Game LÄMNAR guest-läget** för en inloggad guest host (`startNewGameLeavesGuestMode`): nya lobbyn blir en VANLIG user-lobby — credit dras, profilens namn/avatar används, Player history skrivs, Remote Play syns i lägesvalet. `goToNewLobby` tar en femte parameter `leaveGuestMode` som nollar `asGuestHost`; allt annat följer med automatiskt eftersom det redan hänger på den flaggan. Vill de spela som gäst igen gör de det från Home.
- **Remote 1v1**: har ENBART "Start New Game" (ingen re-match — en asynkron duell har ingen replay-koppling) med sin egen `startNewGameLocked`-logik, se remote-sektionen.

### Approvers = ENHETSNÄRVARO, inte roster (`ptpSpectatorIds`, 2026-08-26)

`rematchExpectedApproverIds` (komponent-scope i [app/quiz.tsx](app/quiz.tsx), hoistad så `handleReplayYes` når den) splittar på läge — och splitten är avsiktlig:

| Läge | Förväntade approvers |
|---|---|
| Individual Devices | **rostern** (`turnOrder.slice(1)`) — alla non-hosts har egen enhet per definition, och en som aldrig hälsat får inte tappas ur grinden |
| Pass-the-Phone | **`ptpSpectatorIds`** — rostern säger ingenting om vem som har en egen enhet; bara den som svarade "Yes" på lobbyns "följ leaderboarden?"-prompt kan trycka |

`rematchAllApproved` använder `every(id => playAgainApprovals.has(id))`, inte `size >= n`: grinden släpper då av sig själv om en åskådare trycker Home efter att räkningen börjat, utan att `playAgainApprovals` behöver nollställas.

⚠ **`ptpSpectatorIds` är en HIGH-WATER-MARK, inte live-närvaro.** In: `onPlayerRejoined` (åskådare hälsar 3× vid mount). Ut: **ENBART ett explicit `player_left`** = medvetet Home-/Leave-tapp. Kravet är att var och en som är kvar trycker Accept SJÄLV; tystnad får aldrig räknas som ja (Peter 2026-08-26).

- ⚠ **Watchdogen får ALDRIG röra setet.** `onPlayerConnectionChange` är orörd och förblir IndDev-only. 15 s-watchdogen kan inte skilja "gick därifrån" från "låste skärmen", och iOS fryser JS-tråden vid varje skärmlås — en watchdog-borttagning hade tyst släppt host vidare medan spelaren satt kvar vid bordet. En grace-timer-variant byggdes och förkastades av samma skäl.
- ⚠ **Filtrera hälsningen mot `turnOrderIdSetRef`.** `player_rejoined` registreras via rå `channel.on` i syncChannel och går **förbi** `isKnownSender` — ett påhittat id hade injicerat en approver som aldrig kan godkänna och låst host:s Yes för alltid. Filtret utesluter dessutom värd-tillagda gäster gratis.
- **Host skickar om inbjudan var ~5 s** medan den väntar (`rematchInvite && !rematchAllApproved`). Realtime spelar aldrig upp missade broadcasts, och eftersom en åskådare nu ligger kvar i setet oavsett vad skulle EN tappad `play_again_initiated` betyda evig väntan. Omsändningen gör leveransen självläkande — knappen dyker upp inom ~5 s efter att enheten är tillbaka.
- **Åskådaren håller upprop**: `playAgainInitiatedHandlerRef` re-broadcastar `player_rejoined` när inbjudan kommer, vilket stänger hålet "alla tre mount-hälsningarna tappades".
- ⚠ **`player_left` måste ha en PtP-gren i `playerLeftHandlerRef`** som tar bort ur setet och `return`:ar FÖRE `setLeftPlayerIds` och host-Alerten. I PtP spelar personen vidare på host:s telefon — `leftPlayerIds` driver `gamePlayers[].hasLeft`, `liveLeaderboard` och turnOrder-filtret för timer-barens avatarer, så utan grenen blir ett åskådar-Home en levande gameplay-regression mitt i spelet.
- ⚠ **Non-hostens Home-tapp AWAIT:ar broadcasten** (`handleGoHome`, kort timeout) till skillnad från övriga `player_left`-sändningar. `router.replace` river syncChannel:en vid unmount, och utan watchdog-backstop finns ingen andra chans att komma ur host:s väntan.

**Priset, medvetet accepterat:** en åskådare som force-quit:ar appen eller vars telefon dör skickar aldrig `player_left` och blockerar host **permanent**. Hostens enda utväg är Home (som broadcastar `lobby_deleted`, släpper allas överlägg och raderar lobbyn). Det följer direkt av garantin — ingen automatisk frigivning kan finnas utan att bryta den. Det finns därför heller **ingen "Start anyway"** i `onReplayLockedPress`.

**Residual risk:** tappas alla tre mount-hälsningarna OCH host trycker Yes innan första omsändningen är setet tomt och host går rakt igenom. Fönstret är litet (host ansluter före åskådaren, hälsningarna sprids över 3,5 s, Yes-tappet är människo-långsamt) men det är enda vägen förbi garantin.

### Keep/Reset-prompten är BORTTAGEN (2026-08-26)

En re-match och en replay behåller **ALLTID** settings, i alla lägen. `proceedWithRematch` går direkt till `goToNewLobby(true, true, …)`; `askKeepSettingsThenGo` är kvar men **dormant** (dess enda kvarvarande anropare ligger i den likaså dormanta `handlePlayAgain`/`playAgainModalVisible`-modalen).

Skälet är inte bara ett steg mindre: "Reset" gav `keepSettings=false`, vilket lämnade nya rummet **utan settings-rad**, varpå LobbyScreen seedade `gameMode` från host-PROFILEN (inkl. `spotifyDefaultEnabled → individual-devices`). En PtP-re-match kunde alltså tyst återuppstå som Individual device — i en lobby där Game Mode-väljaren är låst och inte kan rättas. I PtP-riktningen försvann dessutom hela åskådar-flödet, eftersom `LobbyScreen`:s "följ leaderboarden?"-prompt bara fyrar när läget faktiskt är Pass-the-Phone.

⚠ `goToNewLobby` bär därför invarianten **`if ((keepSettings || reusePlayers) && params.roomCode)`** runt settings-kopieringen: en carry-over bär alltid över settings, även om någon framtida väg skickar `keepSettings=false`.

**Följd:** per-spelares age/assistance nollställs inte längre vid re-match (`age: keepSettings || p.isYou ? …` är effektivt död för levande vägar), och rundor/era/paket/Spotify bärs alltid över.

**Implementation:**
- `RoundLeaderboard`-props: **`onReplayYes` / `onReplayNo` / `replayAnswered` / `replayLocked` / `onReplayLockedPress` / `replayNote`** (rev 3 — ersatte rev 2:s `onReplay`, som i sin tur ersatte rev 1:s `lockedLocalTypes` / `startNewGameNote`). `onReplayYes` utelämnas → hela re-match-blocket renderas inte. `onStartNewGamePress` + `startNewGameExpanded` (**kontrollerat** öppet-läge; utelämnas → internt state, remote-fallet) och `hideRemotePlay` skickas bara när `replayChoice === 'no'`.
- ⚠ **Att dölja "Start New Game" görs genom att INTE skicka `onStartNewGame`** — komponenten har ingen egen flagga för det. Skickas den in dyker knappen upp igen.
- ⚠ **`hostUsesStartNewGame` måste testa BÅDA callbacksen**: `isHost && (!!onStartNewGame || !!onReplayYes)`. Den flaggan är det som gör footer-raden Home-only för host. I rev 3 skickas `onStartNewGame` först när host svarat No, så enbart `!!onStartNewGame` lät den DORMANTA blå "Play again" dyka upp under Yes-knappen i steg 1 (Peter 2026-08-24).
- `HostTypeOptions` har ingen lås-mekanism (togs bort i rev 2 när väntan flyttade till re-match-blocket). `LocalLobbyType` finns kvar (används av `goToNewLobby`).
- `goToNewLobby` och `askKeepSettingsThenGo` tar båda ett `lobbyType: LocalLobbyType = 'multiplayer'` som forwardas som `/lobby`-param. `goToNewLobby` har dessutom en femte parameter **`leaveGuestMode`** — se guest-host-bullet:en ovan.
- **Pulsering**: `useCtaPulse` (scale 1 ↔ 1.04 / 700 ms, samma cadens som `PlayAgainButton` och Home:s `gameBtn`) driver Yes-knappen och Start New Game. Pausas när knappen är låst/grå eller när lägesvalet är utfällt. ⚠ Hook-anropen MÅSTE ligga efter `startNewGameExpanded`-derivationen och utanför alla villkorsgrenar. **No** pulsar aldrig — att tacka nej ska inte konkurrera visuellt med Yes.
- Non-host:s **"Accept / Re-match"** pulsar via `PlayAgainButton`:s egen `disabled`-styrda loop — dämpad "Activated by Host"-variant står still, den gyllene aktiva pulsar.

**Credit-gaten körs på TVÅ ställen** (fix 2026-08-08 — Peter landade i en ny lobby som var "out of Host Game Credits", dvs. host kunde inte starta något spel i den):
1. **Fail-fast vid tappet** — `handleLocalStartNewGamePress` (innan panelen öppnas) och `handleReplayYes` (innan inbjudan broadcastas) så vi aldrig visar ett val eller skickar en re-match-inbjudan som host inte kan fullfölja.
2. **AUKTORITATIVT i `goToNewLobby`**, direkt efter `asGuestHost` beräknats och FÖRE `registerActiveRoom` — alla lokala lobby-skapanden från Final Leaderboard passerar där. Blockeras den skapas inget rum och ingen navigation sker. Gaten hänger på **`asGuestHost`**, INTE `isGuestHostGame`: det är den NYA lobbyns värdskap som avgör om credits behövs.

Lägg alla framtida host-lobby-skapanden från quiz-skärmen bakom samma funnel — punkt 1 ensam räcker inte, eftersom det kan gå lång tid (approval-väntan, Alert-steg) mellan tappet och det faktiska skapandet. `handleStartNewGameFromFinal` (remote + Remote Play-raden) har sin EGEN gate.

**`ensureHostCreditsForNewGame(options?)` (omarbetad 2026-08-26)** — popupen är numera **ordagrant Home:s** (`checkHostCredits` i [app/index.tsx](app/index.tsx)): titeln *"Out of Host Game Credits"*, texten om daglig refresh vid midnatt CET + Premium, och knapparna `Cancel` / `Go to Store`. Den gamla *"Purchase subscription / Restart as Guest / Exit"* är borta, så spelaren möter en enda formulering överallt i appen.
- ⚠ **ENDA avvikelsen från Home är destinationen**: härifrån pushas `/store?focus=subscription` **UTAN `from=`**. Utan paramet faller Store:s Back tillbaka via `router.back()` och `/quiz` ligger kvar på stacken med Final Leaderboard-state intakt, så host kan trycka Yes igen direkt efter köpet. Med `from=/` hade Store:s Back `replace`:at bort Quiz-komponenten.
- **`allowGuestRestart`** (default true) styr om "Restart as Guest" erbjuds. `handleReplayYes` skickar `false`: en guest-hostad re-match-lobby får inte existera, och en knapp som mitt i en re-match tyst kastar bort både uppställningen och Competition-kedjan vore vilseledande. `goToNewLobby` skickar `!reusePlayers` av samma skäl.
- **`newLobbyIsGuestHosted`** ersätter den gamla `if (isGuestHostGame) return true;`-bypassen. Det är den NYA lobbyns värdskap som avgör om saldot ska belastas — en inloggad guest host som trycker Start New Game skapar numera en vanlig user-lobby och ska betala för den.
- ⚠ **`restartAsGuestHost` skapar en FRÄSCH lobby** (`goToNewLobby(false, false, …)`, tidigare `true, true`). Den hårdkodade carry-overn gjorde att utvägen alltid producerade en guest-hostad lobby med föregående spels uppställning — dvs. exakt den guest-hostade re-match-lobby som inte får finnas — och det gällde även från "Start New Game", vars semantik annars är *fräsch lobby, inga spelare*. Knappen är nu semantiskt identisk med Home:s "Start Game as Guest".

## Aggregate Leaderboard — andra sidan på slutskärmen (2026-08-25)

⚠ **UI-copyn heter "Marathon table" / "Marathon Score"** (Peter 2026-08-26; omdöpt från "Competition Leaderboard" / "Competition Score" 2026-08-29). Koden, filnamnen och HELA databasen (`aggregate_leaderboards`, `create_aggregate_leaderboard`, `aggregateLabel`, `SavedAggregatesCard`, `Competition*`-lagret …) heter fortsatt `aggregate*`/`Competition*` — migration 0037 är körd, och ett namnbyte där hade krävt en ny migration utan att ge användaren något. Sektionerna nedan använder kod-namnet. **Byt inte kod-identifierare för att "matcha" copyn**, och lägg inte till nya användarsynliga strängar med orden "Aggregate" eller "Competition" — etiketten byggs av `aggregateLabel()`.

Har host kört **"Re-match with Aggregate Leaderboard?" → Yes** blir Final Leaderboard en **två-sidig pager**: sida 1 är ALLTID spelet som just spelats, sida 2 är **hela serien sammanslagen** — samma kolumner, samma sortering, alla spel adderade. Rubriken byter till "Aggregate Leaderboard" på sida 2.

**Samma kriterier är hela poängen.** Båda vyerna går genom **`finalizeRows()`** i [RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx) (wifi-härledning + pts desc → 0-ronder sist → avg asc) och renderas av **samma `<LeaderboardTable>`**. Bygg aldrig en parallell tabell eller en egen sortering för aggregatet — då kan vyerna glida isär.

**Kedjan hålls ihop av RUMKODEN, inte av ett synkat series-id** ([src/utils/aggregateLeaderboard.ts](src/utils/aggregateLeaderboard.ts), AsyncStorage `@quizvibe/aggregateSeries/v1`). Varje enhet håller sin EGEN kopia och visar bara sin egen vy; siffrorna blir ändå identiska eftersom alla enheter har hela `allRoundScoresHistory` via `player_score_recorded`. Därför behövs **ingen DB-migration, inget nytt broadcast-event** och ingen överenskommelse mellan enheterna:
- När en re-match startas stämplas den KOMMANDE rumkoden i `nextRoomCode` — host i `goToNewLobby` (`reusePlayers === true`), non-host när `play_again_lobby_ready` faktiskt tar dem vidare.
- Nästa spel som slutar i just det rummet fortsätter serien. Allt annat (inkl. "Start New Game", som aldrig bär över spelare) startar en ny serie med bara det spelet.

**Spel lagras som per-spel-snapshots nycklade på rumkod och ERSÄTTS vid omskrivning**; summeringen sker vid LÄSNING i `buildAggregateStandings`. Slutskärmens effekt står därför på `allRoundScoresHistory` och skriver om sig när sena peer-scores droppar in — utan att dubbelräkna spelet.
- ⚠ **En omskrivning får INTE nolla `nextRoomCode`.** Host hinner starta re-matchen och en efterslängande score skulle annars radera stämpeln, varpå nästa spel tappar serien. `recordGameInSeries` bevarar därför stämpeln när samma rumkod skrivs om, och förbrukar den bara när ett NYTT spel går in i serien.

**Aggregatet räknas per `playerId`**, som carry-over bevarar genom hela serien (host via `id: '1'`, non-host via `carryOverPlayerId`). Namn/avatar/meta tas från det SENASTE spelet spelaren deltog i — host kan ha döpt om dem mellan omgångarna. Snittiden viktas mot antal SVAR (inte antal spel) och "Last 5" löper över spelgränsen. En spelare som bara var med i första spelet ligger kvar med sina siffror.

**Sida 2 renderas bara vid `gamesPlayed >= 2`** — ett fristående spel är ingen serie, och då är slutskärmen bit-identisk med förut (`aggregate`-propen utelämnas → ingen pager, inga flikar). Remote 1v1 har ingen re-match och skickar aldrig in propen.

⚠ **`aggregate`-propen hör hemma på slutskärmens `<RoundLeaderboard>` — den med `isLastRound={isLastQuestion}`.** [quiz.tsx](app/quiz.tsx) renderar TVÅ `<RoundLeaderboard>`, och propen hamnade först på PtP-spectatorns *interim*-vy, som har `isLastRound={false}` hårdkodat och därför aldrig kan visa aggregatet — resultatet blev att fliken inte syntes för någon (bugg 2026-08-25). **Ankra framtida edits på `isLastRound`, inte på `allRoundScoresHistory`** — den propen finns på BÅDA anropen.

**Vald flik har guld RAM + vit text på BLÅ bakgrund** (`Colors.warning` som `borderColor`, `Colors.primaryMuted` som bakgrund). Guld-fyllningen provades och togs bort — den gav hela fliken en gul ton; ramen bär "vald"-signalen. Svep-hinten sitter DIREKT under flikarna, inte under tabellen (Peter 2026-08-26).

⚠ **Flikarna ("This game" / "All N games") är inte dekoration — de är den enda garanterade vägen mellan sidorna.** Tabellens mittkolumn är en egen horisontell ScrollView som äter svepet där; svep fungerar över Player- och PTS-kolumnerna (som inte scrollar) men kan inte vara enda kontrollen. Ta inte bort flikarna "eftersom man kan svepa".

⚠ **TIDPUNKTEN för avhoppet avgör markören** (Peter 2026-08-26). Därför finns TVÅ set i quiz.tsx:

| Set | Innehåller | Driver |
|---|---|---|
| `leftPlayerIds` | vem som helst som lämnat, **när som helst** | re-match-gaten (`allPreviousPlayersActive`) — den som gått kan inte godkänna oavsett när |
| `leftDuringGameIds` | bara de som lämnade **medan spelet pågick** | `hasLeft` → raden *"Left the game"* i stället för statistik, och `—` i stället för poäng |

Lämnar man MITT i spelet är delresultatet ingen giltig slutställning — man svarade aldrig på resten — så markören följer med ända till **slutskärmen**. Lämnar man EFTER slutsignalen (`phase === 'leaderboard' && isLastQuestion`) är siffrorna redan färdiga och raden står kvar orörd; utan den skillnaden raderades en IndDev-spelares hela resultat i samma sekund som de tryckte Home efter matchen. `RoundLeaderboard` läser bara `p.hasLeft` — tidpunkten avgörs i quiz.tsx, inte där. `aggregateEntries` sätter alltid `hasLeft: false` (den som lämnade ETT spel behåller sina riktiga siffror från de andra).

⚠ **Avhoppare rankas INTE** (Peter 2026-08-26). `finalizeRows` sorterar `hasLeft` sist före alla andra kriterier, och `LeaderboardTable` renderar ingen placeringssiffra för dem (tom `lbPos`-text — elementet behålls så den fasta bredden håller kolumnen i linje). Utan det kunde någon som gick efter två rätta svar sluta **först** över en som spelade hela matchen och svarade fel på allt. Eftersom de sorteras sist förblir `index + 1` korrekt för dem som FÅR en siffra.

⚠ **Prisutdelnings-sekvensen följer samma regel men VISAR dem ändå** (Peter 2026-08-26). `buildMatchHighlights` delar `input.players` i `players` (aktiva) och `departed`:
- **Listkorten** (*Correct answers*, *Fastest fingers*) namnger ALLA spelare, så avhopparna hängs på sist via `appendDepartedRows` — `place: null` (ingen siffra) och `value: 'Left'` i grått (`rankValueLeft`). `HighlightRankRow.place` är därför `number | null`.
- **Källkorten** (*Best on Spotify* osv.) visar bara förstaplatsen — där ska en avhoppare inte kunna vinna, så de är borta ur `aggs` helt.
- **`ranked`-gaten räknar bara aktiva.** Är bara EN kvar finns ingen lista att stå i, och korten faller tillbaka på value-layouten precis som i ett solospel — då syns avhopparen inte alls.

Låst av fyra tester i [backend/content/test/matchHighlights.test.ts](backend/content/test/matchHighlights.test.ts).

⚠ **Avhopp mitt i spelet diskvalificerar HELA spelet ur Competition-serien** (Peter 2026-08-26) — varken lokalt eller server-side. `recordGameInSeries`-effekten early-returnar om någon i `gamePlayers` har `hasLeft`; då förblir `aggregate` `null`, och eftersom BARA den effekten sätter `aggregate` finns därmed ingen "Marathon table"-slide att välja på slutskärmen. Samma villkor styr båda, så de kan inte glida isär: står "Left the game" på någon rad — slidern finns inte.
- **Popupen förklarar det direkt.** `${playerName} has left`-Alerten får en andra rad, *"Marathon table will not be updated with this game result."*, när avhoppet sker MITT i spelet OCH spelet faktiskt är en fortsättning på en serie (`partOfCompetitionSeriesRef` — träff när seriens `nextRoomCode === params.roomCode`, satt vid mount ur `loadAggregateSeries()`). Ett fristende spel (ingen serie än) får bara den vanliga raden — texten vore obegriplig annars. Avhopp EFTER slutsignalen påverkar inte serien och får ingen extra rad.
- **Serien i sig lever vidare.** `nextRoomCode` konsumeras inte av det diskvalificerade spelet — nästa re-match skriver över den som vanligt via `markSeriesContinues`. Det är bara DET HÄR spelets bidrag som uteblir.
- **Gäller PtP-spectatorn INTE** — `hasLeft` sätts aldrig i PtP (spelaren spelar vidare på host:s telefon, se playerLeftHandlerRef:s PtP-gren). Regeln är alltså i praktiken IndDev-only, trots att den är skriven lägesagnostiskt.

**Tabellen bor i [src/components/LeaderboardTable.tsx](src/components/LeaderboardTable.tsx)** sedan 2026-08-25 — utbruten ur RoundLeaderboard så att slutskärmen, aggregat-sidan OCH Profile-modalen delar exakt samma rendering + `finalizeRows`-sortering.

### Namngivning: Score vs Leaderboard

`aggregateLabel(participantCount)` i [aggregateLeaderboard.ts](src/utils/aggregateLeaderboard.ts): **en** deltagare → `"Marathon Score"` (single player), flera → `"Marathon table"`. Uppsättningen är låst genom hela serien, så etiketten kan aldrig hoppa mitt i.
⚠ Slutskärmens FRÅGA kan inte använda den — serien finns inte än — och växlar därför på `isLocalSoloGame` via `RoundLeaderboard`s `replayTitle`-prop.

### Sparade serier på kontot (migration 0037)

Består spelet av **100 % QuizVibe-users** sparas serien dessutom NAMNGIVEN server-side, så den överlever telefonbyte, syns under Player history hos **alla** deltagare, och kan återupptas en annan kväll.

- **Tabeller**: `aggregate_leaderboards` (namn + `participants_key`) / `aggregate_leaderboard_players` (uppsättningen, immutabel, med `player_name` som SNAPSHOT — `profiles` är own-row-only) / `aggregate_leaderboard_games` (`primary key (leaderboard_id, room_code)` → **idempotent**, samma princip som den lokala storen). Summeringen görs vid LÄSNING av **samma** `buildAggregateStandings`.
- **Writes är RPC-only**, deny-by-default; SELECT går via definer-helpern `is_aggregate_leaderboard_participant` (utan den blir participants-policyn RLS-rekursiv, exakt som `is_remote_match_participant`).
- ⚠ **`participants_key` beräknas i RPC:n**, aldrig av klienten. Och **servern avgör vem som är registrerad** genom att kräva en `profiles`-rad per uid — klientens `type` är spoofbar och ignoreras (samma resonemang som `create_remote_match`).
- ⚠ **user_id finns INTE i quiz-vyn.** `rowToPlayer` läser `lobby_players.user_id` men exponerar det aldrig på `LobbyPlayer`, så det når varken `turnOrder` eller quiz. Vid Re-match är gamla rummet ännu inte rivet, så host läser raderna direkt via **`getLobbyPlayerUserIds`** ([mockLobbyPlayers.ts](src/utils/mockLobbyPlayers.ts)). **`playerName` duger inte** som nyckel — lobby-namn är host-redigerbara och gäst-alias genereras lokalt.
- **Flödet** ligger i `ensureAggregateLeaderboardAttached` ([quiz.tsx](app/quiz.tsx)): hämta uid-set → finns sparade serier med exakt den uppsättningen? → i så fall **"Add to existing Aggregate Leaderboard/Score?"** (Yes → lista, No → namnge ny). Inga träffar → direkt till namn-prompten. **Inget skapas längre tyst** — varje fresh-create namnges (se namn-prompt-bulleten nedan).
  - ⚠ **TIMING: hela aggregat-frågan kör EFTER approvals, inte före inbjudan (Peter 2026-08-29).** `handleReplayYes` anropar `ensureAggregateLeaderboardAttached` omedelbart före BÅDA `proceedWithRematch`-kallen: (a) **andra Yes-tappet** (`rematchInvite` redan satt, alla godkänt) i multiplayer, och (b) det **enda tappet** i solo/no-approver-fallet. Tidigare låg anropet FÖRE `broadcastPlayAgainInitiated` på första tappet → host fick frågan direkt när inbjudan gick ut, innan någon hunnit acceptera (Peter-bugg). Flytten är säker: aggregat-id:t behövs först i `play_again_lobby_ready` (från `goToNewLobby`), INTE i `broadcastPlayAgainInitiated` som bara tänder Accept-knappen. `aggregateLeaderboardIdRef` sätts synkront i attach/createWithName, så id:t är redo när `goToNewLobby` läser det.
  - ⚠ **Namn-prompt på VARJE fresh-create** (Peter 2026-08-29): en bottom-sheet **"Please name this new {Marathon table|Marathon Score}"** (via `aggregateLabel`) förfylls med nästa **"Marathon N"** — `nextMarathonName` ([aggregateLeaderboard.ts](src/utils/aggregateLeaderboard.ts), ren + vitest-testad) över host:s EGNA sparade serier (`listMyAggregateLeaderboards().filter(createdBy === hostUserId)`), **EN gemensam sekvens oavsett spelform** (custom-döpta serier räknas inte; ingen träff → "Marathon 1"). Speglar RoundLeaderboards rename-sheet (KeyboardAvoidingView + TextInput, `maxLength 40`); Save validerar `trim` + tomt + `containsProfanity`. Prompt gäller ALLA tre fresh-vägar (silent/no-existing, "No, start fresh"-Alerten, pick-listans "Start a fresh one") — Peter valde konsekvent "Marathon N"-schema framför tyst player-namn-default.
  - ⚠ **Namn-Cancel återvänder till stadiet strax FÖRE "start fresh" trycktes** (Peter 2026-08-29), inte en blanket-abort: silent-pathen → slutskärmen (`return false`); "No, start fresh"-Alerten → Alerten igen; pick-listans "Start a fresh one" → pick-listan igen. Implementeras med re-entranta `while`-loopar. ⚠ Pick-list ⇄ namn-modal-swappen väntar ut `MODAL_SWAP_DELAY_MS` (350 ms) — två RN `<Modal>` kan inte vara presenterade samtidigt (modal-swap-fällan). Alert→namn och silent→namn behöver ingen delay (ingen RN-modal uppe).
  - ⚠ **Listan visas ALLTID när det finns minst en träff** — även vid exakt en. Tidigare auto-kopplades den enda träffen tyst, och host fick då aldrig se vilken serie spelet hamnade i (Peter 2026-08-26).
  - Listan är ett **tvåstegsval** (Peter 2026-08-26): ett tapp på en rad MARKERAR den (blå kant + `primaryMuted`), och först då tänds **Confirm** (gold; grå/otappbar utan markering). Att koppla direkt på rad-tappet gjorde ett feltryck omedelbart bindande.
  - Listan har tre utfall (`AggregatePickChoice`): Confirm på en markerad rad / **Start a fresh one** (→ namn-prompt) / **Cancel**. ⚠ Cancel är MEDVETET skilt från fresh: den skapar ingenting och tar host tillbaka till slutskärmen. Funktionen returnerar då `false` och `handleReplayYes` avbryter — och eftersom hela flödet numera kör på ANDRA Yes-tappet (efter approvals) stannar host kvar med den upplysta Yes:en och kan välja om.
  - ⚠ **Bara Aggregate-serier sparas server-side.** Enstaka spel lagras ALDRIG som egna poster (Peter 2026-08-26). Skälet är inte lagringsstorlek (~1-2 KB/spel) utan UX-skräp i Profile-listan, kostnaden för `list_aggregate_leaderboards_for_participants` (`group by` + `having` efter aggregering) och att en 1-spelspost inte är en leaderboard. Vill vi ha "alla spel" cross-device är rätt vehikel den skrivna men aldrig applicerade `0016_game_sessions.sql`.
  - ⚠ **Spelet som just avslutades måste skjutas upp vid attach** (`pushLocalGames`) — det bokfördes lokalt INNAN serien fanns på servern, så utan det saknar den sparade serien sin första omgång för alltid.
  - ⚠ `aggregateLeaderboardIdRef` är en **synkron spegel**: i solo kör `goToNewLobby` i samma tick som attach, och React-state hade då fortfarande varit null i closuren.
- **Bara HOST skriver spel** (`recordAggregateGame`). En non-host som lämnat mitt i spelet har ofullständig `allRoundScoresHistory` och skulle skriva trunkerad statistik över hostens korrekta rad. RPC:n guardar bara på "deltagare" — host-only-regeln bor i klienten.
- **Non-hosts får id:t** via `play_again_lobby_ready.aggregate_leaderboard_id` (befintlig transport — **inget nytt event**) och seedar sin lokala serie från servern.
- **Omdöpning**: penna bredvid rubriken på aggregat-sidan, **bara för host** (`isHost && !!leaderboardId`). Öppnar en bottom-sheet — appen har ingen inline-edit-precedens. Namnet syns för alla deltagare, så det går genom `containsProfanity` (friends-modalen hoppar över den kollen; upprepa inte det). ⚠ Lägg **inte** rename på fliketiketten: tappet där byter redan sida.
- **Profile**: [SavedAggregatesCard](src/components/SavedAggregatesCard.tsx) renderas inuti Player history, ovanför månadsgrupperna. Självgatande — inget sparat eller anon-session → `null`.
- Är någon deltagare gäst (eller servern otillgänglig) sparas **ingenting** — den lokala serien och lobby-låsningen fungerar ändå. Fail-open hela vägen.

**Settings-reuse vid Competition-rematch (migration 0043, 2026-08-28):** en re-match/replay via Home → Competitions återanvänder nu senaste spelets inställningar i stället för host:ens profil-defaults. `aggregate_leaderboard_games` fick en nullable `settings jsonb`-kolumn + RPC:n `set_aggregate_leaderboard_game_settings` (host skriver snapshoten via `saveAggregateGameSettings` KEDJAT efter `recordAggregateGame` — RPC:n gör bara en UPDATE, så spelraden måste finnas först). `AggregateGameSettings` = era/rundor/svarstid/käll-kategorier/Host-paket/parentControl/spotify (från quiz-params, AUKTORITATIVT). `rowToSaved` exponerar `SavedAggregate.latestSettings` (max `played_at`). [competitionRematch.ts](src/utils/competitionRematch.ts):`buildRematchSettings` föredrar `opts.settings` över profil-defaults; **strukturella fält (gameMode/maxPlayers/singlePlayerDefault) härleds ändå av lobbytypen** (multi = IndDev, solo forceras single av lobbyType-paramet). ⚠ **Parent Control går ALDRIG via lobby_settings** (ingen DB-kolumn, `settingsToRow` skriver det inte) — [CompetitionRematchActions.tsx](src/components/CompetitionRematchActions.tsx) bär det som `parentControl`-URL-param (samma mekanism som Final Leaderboards Play Again, se nedan). **Additivt & regressionsfritt**: `record_aggregate_leaderboard_game` är orört (bokföring kan aldrig brytas av en okörd 0043), settings-skrivningen är fire-and-forget, och `latestSettings === null` (äldre spel / gäst-blandat / migration ej körd) faller tillbaka på profil-defaults precis som förr. Solo skriver dessutom BARA en settings-rad när en snapshot finns — annars lämnas lobbyn utan rad så den single-seedar från profilen som tidigare.

**Play Again carry-over av Parent Control + paket (Final Leaderboard, 2026-08-28):** `parentControlEnabled` persisteras aldrig i `lobby_settings`, så den gamla DB-baserade settings-carry-overn (`getLobbySettings` → `setLobbySettings`) tappade den ALLTID vid Replay/Re-match — och seeden läste den bara ur host:ens profil-default. [quiz.tsx](app/quiz.tsx):`goToNewLobby` skickar därför `parentControl` (+ `carryPackages` som auktoritativ paket-källa) som URL-params vid carry-over (villkoret `keepSettings || reusePlayers`), och LobbyScreen:s seed föredrar dem: parentControl-param > profil-default; carry-över-paket klampas mot **katalogen** (inte profilens `enabledHostPackages`) så ett aktivt paket aldrig tappas, och unionas in i utbudet. Gäller registrerad host + guest host (guest host har inga paket men kan toggla Parent Control).

## Låst spelaruppsättning i re-match-lobbyn (2026-08-25)

Väljer host Re-match/Replay innehåller den nya lobbyn **exakt spelarna från förra spelet** — varken fler eller färre. Annars vore aggregatet inte längre en rättvis serie. Detta **ersätter** en tidigare tänkt efterhandskontroll: uppsättningen kan inte längre ändras, så den kan inte spräcka serien.

**Signalen är atomisk** — `registerActiveRoom` skriver `rooms.rematch_locked` + `rooms.rematch_player_ids` (0037) samtidigt med rums-raden, innan koden ens är joinbar. ⚠ Samma val som `is_remote_1v1` (0031) tvingades göra: `lobby_settings` går genom hostens 300 ms-debounce och hade gjort join-gaten fail-open i ~1 s. Flaggan skickas DESSUTOM som `rematchLocked`-param till `/lobby` så låst läge renderas på första framen utan DB-läsning.
- ⚠ `registerActiveRoom` har en **missing-column-fallback**: en upsert som nämner en okörd kolumn failar HELA skrivningen, så utan den hade en oapplicerad 0037 gjort det omöjligt att skapa rum alls. Vid det felet skrivs raden om utan 0037-fälten och låsningen degraderar tyst.

**I lobbyn** (`isRematchLobby`): "+ Add Player" döljs, papperskorg + Approve-toggle + "Approve All" döljs, **game-mode quick-selecten under Number of Rounds göms** (annars vore den en bakväg förbi låsningen), och Game Mode + Players blir en **statisk indikator** ("Re-match — N players (line-up locked)" / "Replay — Single player (locked)"). Hela sektionen låses för att **varje** lägesbyte ejectar spelare — Single player kastar ut alla non-hosts, IndDev tar bort host-tillagda gäster, PtP nollar `maxPlayers` till 4. Allt annat (rundor, era, Source Mixerboard, paket, svarstid) är kvar redigerbart. Host har fortfarande "Delete this Game Lobby" som utväg.

**Start Game blockeras** tills varje id i `rematch_player_ids` finns i `lobby_players` utan `hasLeft` — `findMissingRematchPlayers` i [rematchLineup.ts](src/utils/rematchLineup.ts) (ren funktion, enhetstestad). Guarden ligger **före** credit-blocket så en avbruten start aldrig kostar en credit. Tom lista (0037 inte körd) blockerar aldrig.

**Join-gate**: `checkRematchLockedLobby` i [app/index.tsx](app/index.tsx), i alla tre join-vägarna. En spelare som VAR med släpps in (matchas case-insensitivt mot pre-seedade `lobby_players`-rader och ärver sitt gamla `player_id`); alla andra får "Re-match lobby"-popupen.
## Play Again approval flow (Individual Devices)

> ⚠ Sedan 2026-08-24 (rev 3) nås detta flöde från slutskärmens **"Re-match with Aggregate Leaderboard?" → Yes** (gäller BÅDE registrerade och guest-hostade spel). **Host-side-modalen nedan är därmed dormant** — approval-statusen visas i stället som grå Yes-knapp (`replayLocked`) + `replayNote` under den. Sync-events, `playAgainApprovals`-räkningen och non-host-halvan (`handleApprovePlayAgain`, "Accept / Re-match") är oförändrade och LIVE. `handleApprovePlayAgain` broadcastar sedan 2026-08-26 på `syncActive` (inte bara IndDev) så PtP-åskådaren accepterar över samma kanal, och sätter `awaitingNewLobbyRef.current` synkront vid tappet.

**(Historik — så här såg host-sidan ut före 2026-08-08.)** **Pass-the-Phone** använde direkt `Alert.alert("Re-use all players?", …)`-flödet med Cancel/Start fresh/Yes, keep them (alla på samma enhet — inget att vänta in). **Individual Devices** körde en custom modal istället så host:s "Yes, keep them"-knapp kunde vara visuellt utgråad tills alla non-hosts broadcastat sin Approve-signal.

**Sync-events** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)):
- `play_again_initiated` (host → alla): broadcastas när host svarar **Yes** på re-match-frågan, och därefter **var ~5:e sekund** medan host väntar (se omsändningen i approver-avsnittet). Non-host:s "Accept / Re-match"-knapp flippar från dämpad till aktiv guld-styling (`hostInitiatedPlayAgain=true`). En PtP-åskådare svarar dessutom med en `player_rejoined`-hälsning (upprop).
- `player_approved_play_again` (non-host → host): broadcastas när non-host tappar sin Approve-knapp. Host adder `player_id` till `playAgainApprovals: Set<string>` (idempotent).
- `play_again_lobby_ready` (host → alla): broadcastas DIREKT efter `registerActiveRoom` + `setLobbyPlayers` + `setLobbySettings` men INNAN `router.replace`. Bär nya rumkoden.
- `lobby_deleted` (host → alla): broadcastas när host tappar Home från Final Leaderboard via `handleGoHome` ([app/quiz.tsx](app/quiz.tsx)). Skickas FÖRE `deactivateRoom`+cleanup-bunten så non-host:s syncChannel hinner ta emot innan host:s channel rivs vid component-unmount. Non-host:s handler visar Alert "Host has deleted this lobby" + auto-nav till Home, oavsett om de står på Final Leaderboard direkt eller är fast på "Please Wait..."-overlay efter Approve. Guard via `lobbyDeletedAlertedRef` mot dubbelfyrning. Releaserar även `awaitingNewLobby=false` för att stänga lock-overlay.

**Play Again-modal-cancel preserverar approvals**: `setPlayAgainApprovals(new Set())`-reset:n vid host:s re-tap av Play Again togs bort. Non-host:s "Please Wait..."-overlay stannar kvar med `awaitingNewLobby=true` vid host:s Cancel — de re-broadcastar inte sin Approve vid host:s andra Play Again-tap (deras overlay blockar tap, och `awaitingNewLobby` är redan true). Skulle vi reset:at approvals hade "Yes, keep them" varit utgråad i andra modalen trots att non-host redan godkänt. Genom att behålla Set:en blir andra Play Again-tap:en omedelbart användbar med tidigare approvals.

**Host-side modal** ([app/quiz.tsx](app/quiz.tsx)):
- Visas via `setPlayAgainModalVisible(true)` efter credit-gate-check (samma pre-conditions som handleStartGame).
- Tre knappar:
  - **Cancel** — stäng modal, ingen action.
  - **Start fresh** — alltid aktiv. `setPlayAgainModalVisible(false); goToNewLobby(false)`.
  - **Yes, keep them** — utgråad (`Colors.borderStrong` border + `Colors.textDisabled` text + ingen `onPress`) tills `allApproved`. När alla godkänt: blå primary-styling + `askKeepSettingsThenGo`-prompt.
- Status-rad ovanför knapparna:
  - `playAgainApprovals.size < totalNonHosts` → `"Waiting for X of Y players to approve"` + `<SequentialDots />`.
  - Alla godkänt → `"✓ All players have approved"` (Colors.success).
- `totalNonHosts = Math.max(0, turnOrder.length - 1)`; 0 non-hosts → `allApproved` är trivially true (Pass-the-Phone-fall som inte borde hit på modalen ändå).

**Non-host approve-tap** broadcastar `broadcastPlayerApprovedPlayAgain({ player_id: selfPlayerId })` + sätter `awaitingNewLobby=true` → lock-overlay "Please Wait — Host is creating new game" visas tills `nextLobbyCode` ankommer.

**Race-safe lobby-ready-handler**: `awaitingNewLobbyRef` är en synkron mirror av state (uppdateras vid varje render utan useEffect) så handler:n kan läsa AKTUELLA värdet vid event-ankomst utan att vara beroende av useEffect-closure-uppdatering. Skyddar mot millisekund-race där non-host:s Approve-tap och host:s broadcast ankommer i samma React-batch.

**"Host has already started a new Game"-popup**: när non-host tar emot `play_again_lobby_ready` utan att ha tappat Approve (= `awaitingNewLobbyRef.current === false`), visas info-popup med `cancelable: false` → OK → `router.replace('/')`. Triggas av "Yes, keep them"-vägen är gated på alla approvals, så detta händer ENDAST via Start fresh där host kan bypassa väntan. `hostStartedWithoutMeAlertedRef` guarder mot dubblettpopups om broadcast skulle skickas flera gånger.

## Lobby — settings + players carry-over på Play Again

**`goToNewLobby(reusePlayers, keepSettings)`** ([app/quiz.tsx](app/quiz.tsx)) skriver carry-over till BÅDA AsyncStorage (per-device för host:s LobbyScreen-mount) OCH Supabase-tabellerna `lobby_players`/`lobby_settings` (cross-device för non-host:s rejoin). Den senare är KRITISK för att non-host ska se rätt pre-seeded lista när de navigerar in via `play_again_lobby_ready`-broadcasten.

**Player carry-over** (när `reusePlayers=true`):
- `carryOverPlayers = allPlayers.map(...)` byggs och sparas via `savePendingLobbyPlayers` (AsyncStorage) + `setLobbyPlayers(newCode, carryOverPlayers)` (Supabase). Båda anropas INNAN broadcast så non-host:s `getLobbyPlayers` alltid hittar pre-seeded raden vid ankomst.
- **`approved: true` på ALLA carry-over-rader** (2026-08-06, ersatte `approved: !!p.isHost`) — alla spelare från förra spelet (friends eller ej) auto-approvas i nya lobbyn; de var redan godkända i spelet som just avslutades så ingen re-approval behövs. Join-approval-popupen fyrar inte för carry-overs (de anländer approved). LobbyScreen:s code-only-join sätter approved=true på carry-over-branchen (`carryOverPlayerId` satt) så joiner:s egen `upsertOwnLobbyPlayer` inte clobbar pre-approvalen.
- Variabeln måste lyftas ur `if (reusePlayers)`-blocket så den är åtkomlig efter clear-bunten (`clearLobbyPlayers(newCode)` osv.) — annars scope-fel.

**Settings carry-over** (när `keepSettings=true`):
- Läser `getLobbySettings(params.roomCode)` (= OLD room) och `setLobbySettings(newCode, { ...oldSettings, answerResponseSeconds: responseSeconds })`. responseSeconds override:as eftersom host kan ha justerat mid-game via GetReadyIntro:s dropdown.
- Alla fält bärs över via `...oldSettings` inkl. **`spotifyEnabled`** — se "Spotify carry-over"-fix nedan.
- Vid `keepSettings=false` (Start fresh): ingen `setLobbySettings`-skrivning → LobbyScreen:s host-seed-effekt fyller med profil-defaults vid mount.

**Spotify carry-over-bugg (fix 2026-06-09)** — två felkällor fixade i LobbyScreen:s host-seed + useFocusEffect:
1. **Seed-effekten** (URL-params useEffect, `if (stored)` -blocket): satte INTE `setSpotifyEnabled` från `stored.spotifyEnabled` när carry-over-inställningar fanns — bara `selectedExtraPackages` + `sketchEnabled` togs. Fix: `if (stored) { ...; setSpotifyEnabled(stored.spotifyEnabled); }`.
2. **useFocusEffect Spotify-callback**: ringde alltid `setSpotifyEnabled(profile?.spotifyDefaultEnabled ?? false)` (= false) efter att `getSpotifyConnectionStatus` bekräftat connection + premium — överskrev carry-over-värdet. Fix: callback laddar nu `getLobbySettings(roomCode)` parallellt med `loadProfile()` och använder `lobbySt?.spotifyEnabled ?? profile?.spotifyDefaultEnabled ?? false` (prefer stored, fallback profil).

**`spotifyConnected` i `TurnOrderPlayer` (fix 2026-06-09)**: fältet `spotifyConnected?: boolean` lagt till i `TurnOrderPlayer`-typen i quiz.tsx. Host:s `handleStartGame` och non-host:s game-started-detection inkluderar nu `spotifyConnected: p.spotifyConnected ?? false` i turnOrder-mappningen. `goToNewLobby`'s `carryOverPlayers` slår upp `spotifyConnected` via `turnOrder.find(t => t.id === p.id)?.spotifyConnected` så Spotify-badge på spelarkortet i nästa lobby visar korrekt "Spotify connected" (grönt) efter Play Again + Keep players.

**`playerToRow` NOT NULL-fälla (fix 2026-06-08)**: `playerToRow` i `mockLobbyPlayers.ts` mappade `spotifyConnected` via `player.spotifyConnected ?? null`. Carry-over-spelarna som byggs i `goToNewLobby` har inget `spotifyConnected`-fält → `undefined ?? null = null` skickas som `spotify_verified` i UPSERT:en → `lobby_players.spotify_verified NOT NULL`-constrainten avvisar raden → HELA carry-over-skrivningen failar tyst (`.catch(() => {})` svalde felet). Resultat: noll carry-over-rader i DB → non-host:s `syncFromStore` fick `undefined` från `getLobbyPlayers` → `selfApproved = false` → "started without me"-popup. **Fix**: `playerToRow` ändrad till `player.spotifyConnected ?? false` — `undefined`/`null` ger nu alltid `false` (validt boolean-värde). Relaterade skyddsändringar: (1) `goToNewLobby`:s `.catch(() => {})` → `console.warn` så DB-fel syns i loggar; (2) `syncFromStore`-game-started-checken fick `null`/`undefined`-guard på `getLobbyPlayers`-resultatet — popup:en fyrar bara när en definitiv rad med `approved=false` finns, aldrig på tvetydigt underlag.

**Start Fresh-fix: host-id MÅSTE vara `'1'`** — carry-over-objektet i `reusePlayers=false`-grenen sätter `id: '1'` (matchar `SEED_PLAYERS[0].id` i LobbyScreen). Buggen tidigare: id var hardcoded `'you'`, vilket inte matchade seed-host:en. LobbyScreen:s mount-sekvens sätter först `players = [SEED_PLAYERS[0]]` (Alex K., id='1') och `useEffect`-skrivningen till `lobby_players` exekverar INNAN `consumePendingLobbyPlayers()` ersatte state med carry-over:n (id='you'). Resultat: TVÅ host-rader i DB:n (`id='1'` Alex K. + `id='you'` HostName) eftersom `setLobbyPlayers` UPSERT:ar utan att DELETE:a stale rader. Host:s lokala state hade bara 'you' så host:s vy visade 2 spelare (host + non-host), men non-host läste DB via polling och fick BÅDA host-raderna + sig själv = 3 spelare inklusive en fantom "Alex K." på leaderboard + timeline-banner. Genom att matcha id='1' träffar carry-over-skrivningen SAMMA DB-rad som seedet → bara name/emoji uppdateras, ingen extra host-rad.

**Play Again-flöde per gameMode** ([handlePlayAgain](app/quiz.tsx)):
- **Single-player** (PtP med exakt 1 spelare i turnOrder): skippar "Re-use all players?"-alerten helt. Anropar direkt `askKeepSettingsThenGo(true)` som visar titel `"Keep same setting for lobby"` (singularis-formulering — "per player" är missvisande med bara host) + 3 knappar: `Cancel` (stannar på Final Leaderboard), `Reset`, `Keep settings`.
- **Multi-player PtP** (≥2 spelare): "Re-use all players?"-alert oförändrad. "Yes, keep them"-onPress anropar `askKeepSettingsThenGo()` utan flagga → titel `"Keep same settings per player?"` + 2 knappar (Reset, Keep settings). Cancel-rollen är redan uppfylld av "Re-use all players?"-Cancel-knappen.
- **IndDev**: custom modal-flöde med approvals-tracking — oförändrat.
- `askKeepSettingsThenGo(withCancel = false)`-signaturen: `withCancel` styr både titel-växling och inkludering av Cancel-knapp.

**LobbyScreen host-seed-effekten** prefererar nu `getLobbySettings(roomCode)` över profil-defaults: laddar BÅDA via `Promise.all([loadProfile(), getLobbySettings(roomCode)])` och använder per-fält fallback-chain `stored ?? profile ?? hardcoded`. Detta gör att host som ankommer till nya rummet efter "Play again + Keep settings" ser de carry-over:ade värdena istället för profil-defaults. Den debounced `setLobbySettings`-effekten skriver sedan tillbaka samma värden (no-op) så non-host:s `syncFromStore`-pollen också ser dem.

## Non-host code-only-join — dup-detection på rejoin

När non-host loggar in via Room Code (= ej guest-form-path) sker en check mot `lobby_players` för att undvika duplicate-rader om non-host:s playerName redan finns pre-seedad i lobbyn (typiskt scenario: host körde "Play again + Keep players" och carry-over:ade non-host:en in i nya lobbyn, sedan blev non-host skickad Home utan att approva → de loggar nu in igen via koden från Home).

**Match-logik** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx) code-only-join-grenen):
- Efter `loadProfile()`: `myPlayerName = profile?.playerName?.trim() || 'You'`.
- `existingPlayers = await getLobbyPlayers(roomCode)` läser authoritativa listan.
- `existingMatch = existingPlayers?.find(p => !p.isHost && p.name.trim().toLowerCase() === myPlayerName.toLowerCase())`.
- `joinerId = existingMatch?.id ?? `joiner-${Date.now()}`` — ÄRV id:t om match, annars nytt timestamp-id.
- `approved: existingMatch?.approved ?? false` — bevara host:s tidigare approval-state vid ärvt id; nya joiners är alltid false (måste approvas).
- `upsertOwnLobbyPlayer(roomCode, joiner)` blir då en UPDATE (samma room_code + player_id → unique-constraint hits) istället för INSERT.

**Dedupe i `setPlayers`-callback:n**: race mellan `syncFromStore`-pollen (som kan pull:a in carry-over-raden parallellt) och code-only-join:s lokala `splice` kan annars ge två lokala objekt med samma id i prev. Fix: `filtered = prev.filter(p => p.id !== joinerId)` innan splice — säkrar exakt en rad oavsett vilken effect som kör först.

## Quiz — Question screen (question + awaiting + reveal phases)

Fråge-vyn i [app/quiz.tsx](app/quiz.tsx) är samma layout för `'question'`-, `'awaiting'`- och `'reveal'`-faserna — reveal-feedbacken renderas inline istället för i en separat skärm. Mediakortet, timer-baren, stopwatch:n, fråge-kortet och TimelineSelector:n stannar synliga genom hela cykeln; bara feedback-kortet läggs till vid `'reveal'`.

**Quit Game**: bor bara i GetReadyIntro:s top-banner. Question/awaiting/reveal har ingen Quit-knapp — användaren får vänta ut timern, sedan tappar Next-tab inom feedback-kortet → nästa intro där Quit är tillgänglig.

### Quiz timing-system för image-frågor (buffer + hints + mosaic)

Tre separata delay-states styr vad som händer när quiz-vyn öppnas för image-frågor:

| State | Delay | Styr |
|---|---|---|
| `hintsReady` | **0 s** (deriverad boolean: `phase==='question'\|\|'awaiting'\|\|'reveal'`) | Hints börjar visas + Qonfirm-knapp pulsar |
| `timerActive` | **2 s** (setTimeout) | Timer bar börjar räkna ner + stopwatch startar + flaggans mosaik börjar tas bort |
| `mosaicActive` | via `timerActive` (2 s) | Passas separat till ProgressiveCover så flagg-delay kan justeras oberoende av hints |

**`timerActive`-effekten** resetting-resetter också `timeLeft = responseSeconds` och `timerProgressAnim = 1` OMEDELBART vid `phase='question'` — annars visas stale 0 eller default 30 s under buffer-perioden. `startTimer()` körs sedan 2 s senare via `setTimeout`.

**`hintsReady`** är en derived boolean (inte state) — ingen re-render-overhead. `hintsActive={hintsReady}` till HintsQuizCard styr hint-reveal-timers. `mosaicActive={timerActive}` till ProgressiveCover (via HintsQuizCard `mosaicActive`-prop) styr flaggmosaiken separat.

**Tidslinje per image-fråga:**
```
[Quiz-vy visas] → Hints dyker upp + Qonfirm pulserar guld
      ↓ 2 sekunder
[Timer startar] → Timer-bar räknar ner + mosaik-brickor tas bort från flaggan
      ↓ response_seconds
[Reveal]        → Alla hints visas + flagga helt avslöjad
```

### Timer-arkitektur (smooth + drift-fri)

Tre parallella mekanismer driver tidsvisningen oberoende av varandra:

1. **`timerProgressAnim`** (Animated.Value, RAF-driven) — bar:ens BREDD interpoleras från `0 → 1` mappat till `'0%' → '100%'`. Animated.timing kör `1 → 0` med `Easing.linear` över `responseSeconds * 1000` ms. **useNativeDriver: false** (procent-width kräver JS-driver), men RAF-schemaläggningen gör att bar:en uppdateras varje frame oberoende av setInterval, setStates eller Confirm-handlerns batch. Kritiskt så bar:en aldrig "fryser" eller stepar — ger upplevelsen att tiden flyter på även medan flera spelare confirmar parallellt (kommande Individual-Devices-flöde).
2. **`timerRef.current`** (setInterval 1 Hz) — driver heltals-`timeLeft`-state för "23s"-räknaren och scoring/time-out-logiken (jobbar i hela sekunder). Self-clearas i sin handler vid `timeLeft = 0`.
3. **`decimalElapsedMs`** (setInterval 20 Hz, beräknar mot `Date.now()`-diff) — driver stopwatch:ns 2-decimals-display under timer-bar:en. Räknar UPPÅT från `00.00` mot `responseSeconds`. Gateas på `phase === 'question'` så tick:en stoppar vid Confirm; senaste värdet fryses tills nästa fråga.

**Native/JS-driver-konflikt**: opacity (native) och width (JS) får INTE applicieras på samma `Animated.View`-nod (kraschar med "Attempting to run JS driven animation on animated node that has been moved to native"). Lösning: `timerFillPulseWrap` (yttre, opacity = pulseAnim, native) wrap:ar `timerFill` (inre, width-interpolation, JS). Två separata noder.

**Color-trösklar för `timerColor`** (drives bar:ens fill-färg + ring-border + integer-color):
- `timeLeft > 10` → `Colors.primary` (blå)
- `timeLeft > 5` → `Colors.warning` (gul)
- `timeLeft <= 5` → `Colors.error` (röd)

**`stopwatchColor`** (decimal-rutans border + integer-color) följer EJ timerColor i awaiting/reveal — då skiftar den till en lugn ljusblå (`#8CC1FF`) för att signalera "du har confirmat — vänta på reveal" istället för att fortsätta varna i gult/rött:
```ts
const stopwatchColor = phase === 'question' ? timerColor : '#8CC1FF';
```

### Layout (sekvens uppifrån)

**Tre-zons-arkitektur** (`SafeAreaView` → fixed-top + scroll + sticky-bottom):
- **Fixed-top zone** (`styles.fixedTopZone`, syskon till ScrollView): media + timer + stopwatch + question-card. Alltid synliga genom hela frågan; scrollar inte.
- **Scroll zone** (`ScrollView` med `flex: 1`): bara svar-block (TimelineSelector / ImageAnswerBlock) + ev. reveal-feedback-card. Det enda som scrollar när prefix-/fullnamn-listan är lång.
- **Sticky-bottom zone** (`styles.stickyConfirmBar`, syskon efter ScrollView): Confirm/Awaiting-knappen. Alltid synlig i question/awaiting; gömd i reveal (Next-tab tar över via absolute-position).

Detta ersatte tidigare enda-ScrollView-strukturen där spelaren kunde scrolla bort media+timer när de letade bland prefix-knappar. Nu fokuserar scroll-gestures enbart på svarsalternativen.

**Kort-skärms-kompaktering (2026-08-11, TestFlight-rapport från iPhone SE)** — fixed-top-zonen har naturlig höjd och **krymper inte** (RN:s `flexShrink` defaultar till 0) medan scroll-zonen har `flex: 1` (= `flexBasis: 0` + shrink). Överstiger summan skärmhöjden är det därför ALLTID scroll-zonen som kollapsar — på en SE1 (568 pt) till ~45 px, dvs. en halv svarsrad utan någon yta att svepa på. Spelaren tolkade det som "skärmen går inte att scrolla". Fixen skalar: hints-/bildkortet, `fixedTopZone.gap`, timer-ringen, stopwatch-boxen, frågekortets `paddingVertical` + textstorlekar, sticky-barens padding + knapphöjd, Spotify-kortens `minHeight`. **Sista-utvägs-ventil**: `fixedTopZone` har `flexShrink: 1` och `imageMediaCard` `flexShrink: 1` + `minHeight: 110`, så om zonen ändå blir för hög (ovanligt högt frågekort) ger mediakortet efter i stället för att scroll-zonen nollas. **Regel: lägg aldrig till ett nytt element med fast höjd i fixed-top-zonen utan att räkna om budgeten för 568 pt.** De diskreta hinkarna (`QUIZ_COMPACT` / `QUIZ_VERY_COMPACT` / `SCREEN_H < 700`) är ERSATTA 2026-08-14 — se nedan.

### Måttdriven quiz-layout — [src/utils/quizLayout.ts](src/utils/quizLayout.ts) (2026-08-14)

TestFlight-rapport från **iPhone 11**: "yt-spelaren kapar botten på vissa enheter". Två oberoende problem, båda lösta i en egen måttmodul som quiz.tsx OCH MediaPlayer-providern importerar. **Lägg aldrig en lokal kopia av dessa formler i en komponent** — hade YouTube-kortet och iframen olika tal klipps spelaren.

⚠ **1. YouTube-spelaren är ALLTID 16:9 av sin BREDD — `height`-propen styr den inte.** `react-native-youtube-iframe` renderar wrapper-HTML med `.container { width: 100%; height: 0; padding-bottom: 56.25% }` + `iframe { height: 100% }`. `height`-propen sizear bara RN-View:n runt omkring. Ett fast **220 pt**-kort med `overflow: hidden` kapade därför spelarens nederkant på varje enhet från **393 pt bredd** och uppåt:

| Bredd | 16:9-höjd | Klipptes | Enheter |
|---|---|---|---|
| 320–390 | 180–219 | nej | SE1, SE2/SE3/8, X/XS/11 Pro, 12–13 mini, 12/13/14 |
| 393 | 221 | 1 pt | 14 Pro / 15 / 16 |
| **414** | **233** | **13 pt** | **XR, 11, 11 Pro Max, 8/7/6s Plus** |
| 430 | 242 | 22 pt | 12–16 Pro Max |

Att smala enheter råkade klara sig är hela förklaringen till "bara vissa enheter" — buggen är **bredd**-driven, inte höjd-driven, så leta inte i höjdbudgeten. `QUIZ_MEDIA_H`/`QUIZ_MEDIA_W` härleds nu ur bredden och skickas som BÅDE `height` och `width` till lib:n. Räcker inte höjdbudgeten krymps **bredden** också så 16:9 hålls → spelaren letterboxas horisontellt i kortets bakgrundsfärg i stället för att kapas.

⚠ **2. Kompakteringen grindar på ANVÄNDBAR höjd och är kontinuerlig.** Ursprungsfixens `SCREEN_H < 700` sa inget om hur mycket notch + home indicator äter, och delade in enheter i tre grova hinkar. Nu: `QUIZ_USABLE_H = fönsterhöjd − riktiga insets`, där insets läses ur **`initialWindowMetrics`** (native-konstant från `react-native-safe-area-context`, läsbar synkront redan vid import — `useSafeAreaInsets` går inte, StyleSheet är inte en komponent; era-estimat som fallback). Därifrån två skalor mot referenshöjden 760 pt:

- **`qh(v)`** — höjder, padding, gaps. Golv 0.66.
- **`qf(v)`** — typsnitt. Golv 0.82, medvetet högre; läsbarhet väger tyngre än yta.

**Skriv `qh(56)`, inte `SCREEN_H < 700 ? 46 : 56`.** Varje enhet får sin egen interpolerade storlek i stället för att tvingas välja mellan "SE-liten" och "för stor" — en 716 pt-enhet landar på 0.94, en 734 pt på 0.97.

**`QUIZ_IMAGE_CARD_H` (hints-/bild-kortet + Spotify-kortens `minHeight`) är MEDVETET lägre än `QUIZ_MEDIA_H`** (`qh(QUIZ_MEDIA_H)`): det är vår egen komponent utan iframe, 16:9 är ingen tvingande regel där, och hint-listan har egen intern scroll — så den höjden får hellre gå till svarsalternativen. Utfall: svarsytan blir 141–282 pt beroende på enhet, mediarutan exakt 16:9 överallt.

⚠ Måtten läses **en gång vid import**. Appen är portrait-låst (`app.json`); låses den upp måste modulen bli en hook.

1. **Mediakort** — för `question.type === 'timeline'` (musik/film/sport/etc) renderas `MediaPlayer` (YouTube/none) — höjd `PLAYER_HEIGHT = 220`, video synlig hela tiden, QuizVibe-logo-overlay efter `state === 'ended'`. Detaljer i "YouTube playback & curation"-sektionen ovan. För `question.type === 'image'` renderas `imageMediaCard` (16:9 wrap, `aspectRatio: 16/9`, `overflow: 'hidden'`) med `<Image source={getQuizImage(question.id)!} resizeMode="cover">` + `<ProgressiveCover>` overlay (se "Image questions (MVP)" nedan).
2. **Timer-section** (row): timer-bar (flex 1) + **pulserande ring runt sekund-räknaren**. Ringen är 56×56 cirkel med dynamisk `borderColor: timerColor`, halo-View bakom (samma färg, `opacity` pulserar 0.3 → 0.7 över 700 ms native), och scale-pulse 1 → 1.08. Sekund-siffran (24 px bold tabular-nums) sitter inuti ringen.
   - **Avatar-markör på timer-bar:en** vid bekräftad svarstid: 28×28 gold-bordered avatar (URI-bild eller emoji-fallback) absolut-positionerad inom timerTrack med `left: ${((responseSeconds − confirmedTimeUsed) / responseSeconds) * 100}%` — sitter exakt på fillens högra kant vid Confirm-momentet. När timer:n fortsätter krymper fillen FÖRBI avataren så användaren ser "tiden har passerat ditt svarsmoment".
3. **Stopwatch-rutan** (centrerad under bar:en) — räknar UPPÅT med 2 decimaler:
   - `<StopwatchIcon size={32} color={stopwatchColor} />` ([src/components/StopwatchIcon.tsx](src/components/StopwatchIcon.tsx)) — modern SVG-ikon (rund kropp, top crown-knapp, sido-knapp, visare som pekar mot 1-2-positionen). Wrap-View med height 40 (= integer-textens lineHeight) centrerar SVG:n vertikalt med stora siffran.
   - Integer "07" (38 px bold, `stopwatchColor`) + decimal ".48" (22 px semibold, `Colors.textSecondary`).
   - Hela rutan har `borderWidth: 2 / borderColor: stopwatchColor` + halo bakom (`backgroundColor: stopwatchColor` + animated `opacity: timerRingGlow` — synkat med ringens pulse).
   - Display **fryses** vid Confirm via `setDecimalElapsedMs(elapsedAtConfirm)` i handleConfirm, sedan stopp på 20 Hz-tick:en när phase blir `'awaiting'`.
4. **Fråge-kort** (kompakt, ~70-90 px naturlig höjd):
   - Top-rad: `Question N of M` (vänster) + `Answering`-stack (höger, bara Pass-the-Phone). Stack:en är `flexDirection: 'column'` + `alignItems: 'flex-end'` + `gap: 1` så "Answering:"-label sitter ovanpå PlayerName i två högerställda rader istället för en lång rad. `questionTopRow` har `alignItems: 'flex-start'` så stack:en kan vara två rader utan att skuffa question-räknaren neråt.
   - Frågetext renderas som **enskilt `<Text>`-element med inline keyword-highlight**: regex `/^(.*?)\b(Year|Name|City|Country)\b(.*)$/i` splittar i [before, keyword, after] och rendrar nyckelordet i en nested `<Text style={questionTextHeadline}>` (30 px bold) medan resten är `questionText` (18 px semibold). Exempel: "Which **Year** was this song released?" / "What is the **Name** of this Artist?" / "Which **city** is this?". Items utan matching keyword renderas som enkel-rad. Detta gör frågekortet ~80 px högt istället för tidigare ~140 px (med 2-3-rad-split) — frigör vertikal yta till svarsalternativen.
5. **TimelineSelector** med pulserande gold-pilar utanför svarsruta-edges:
   - `‹` / `›`-glyfer (38 px bold, `BOX_COLOR` + textShadow för glow), absolut-positionerade vid `right: '50%' + marginRight: selectorWidth/2 + 6` (vänster) respektive `left: '50%' + marginLeft: selectorWidth/2 + 6` (höger). Loop:ar opacity 0.35 ↔ 1 + scale 1 ↔ 1.18 över 700 ms (native driver). Stoppas när `disabled`.
   - **Era-låst tidslinje**: `min = eraFrom`, `max = eraTo` (via props från quiz.tsx). Spelaren kan inte scrolla utanför Game Era. **`getAnswerRange(selectedYear, interval, min, max)`** shiftar fönstret in i intervallet vid kanterna istället för att klippa det — så full=5 kollapsar inte till 3 år vid edge. `isCorrect` använder samma helper så scoring synkar med visuella fönstret.
6. **Sticky Confirm-bar** (fas-medveten) — wrappad i `stickyConfirmBar`-style (paddingHorizontal lg + paddingVertical md, `Colors.background`-bg, 1px top-border) och placerad som **sibling AFTER ScrollView** inom SafeAreaView. Det betyder Confirm alltid är synlig oavsett hur långt spelaren scrollat bland prefix/fullnamn-alternativen — tidigare satt blocket inuti ScrollView vilket tvingade spelaren scrolla till slutet av answer-listan för att nå Confirm. Renderas bara i `question`/`awaiting`; reveal har sin egen Next-tab (absolute-positionerad).
   - `'question'`: **Qonfirm**-knapp — SVG-Q (ring + tail + 3 ljudvågs-bågar från QuizVibe-loggan) följt av lowercase "onfirm". Hela glyfen i gold (`Colors.warning` = `#F5A623`) — Q-ringens stroke 6.5, ljudvågs-bågarnas stroke 1.6 (smala för "ljudvågs"-känsla). Bågarna är arc-koordinater från [QuizVibeLogo.tsx](src/components/QuizVibeLogo.tsx) translerade +3x/+1y eftersom Q-center sitter på (40,38) här istället för loggans (37,37); roterade 25° kring Q-center (`<G transform="rotate(25 40 38)">`). Topp-bågens R = 16 (vs logo:s 12) för flatare läs som mer parallell med Q-ringens kantlinje. SVG-attribut `width={24} height={24} viewBox="23 18 34 37"` — viewBox medvetet expanderad så Q-ringens 6.5-stroke och rotation-bbox för bredd-20-bågen ryms utan klippning. **Knapp-bakgrund matchar Next-tab:s outline-blå** (`backgroundColor: Colors.cardElevated` + `borderColor: Colors.primary` borderWidth 1) — INTE solid `Colors.primary` som tidigare. Den separata `confirmHalo`-View:n bakom knappen bär fortfarande pulsande blå glow (opacity 0.4 ↔ 0.85 + scale 1 ↔ 1.03 över 1100ms) för CTA-fokus. Loops stoppas när `canConfirm === false`.
   - `'awaiting'`: passiv pillar `✓ Confirmed — waiting for time` (primaryMuted bg + primaryBorder, textSecondary text, ingen tap). Visas för BÅDA timeline- och image-frågor.
   - `'reveal'`: sticky-bar gömd. Next-tab ligger absolute-positionerad i nedre högra hörnet av SafeAreaView:n för BÅDA fråge-typerna — se "Reveal Next-tab" nedan.
7. **Feedback-kort** (visas BARA i `'reveal'` + `question.type === 'timeline'` — image-frågor skippar kortet helt eftersom ImageAnswerBlock:s inline-badges redan kommunicerar reveal-state):
   - `borderWidth: 2`, kompakt padding, `marginTop: Spacing.sm` så border-cutting-badgen (top: -8) inte krockar med fråge-kortet ovanför.
   - **Båda statusarna delar bg-färg `Colors.card`** (samma som question-kortet) så reveal-vyn känns som en seamless förlängning av frågan. Status-färgen bärs på badge + border: grön (`Colors.success`) vid rätt, röd (`QUIZ_ERROR_RED` = `#FF3B30` — se "Quiz error red" nedan) vid fel.
   - **Border-cutting badge** (top-right corner via `position: 'absolute', top: -8, right: Spacing.lg`): `✓ Correct Answer` (success-grön bg + vit text) eller `✗ Wrong Answer` (`QUIZ_ERROR_RED` bg + vit text). Solid bg matchar kortets borderColor så taggen visuellt "är en del av" ramen. Speglar HOST/GUEST-taggen på PlayerRow + FREE/PREMIUM-badgen på Game Mode-toggle:n.
   - **Correct-rad**: "Correct year: {N}" (timeline). Tidigare fanns en "Answer time: X.YYs"-rad under vid rätt svar — borttagen 2026-05-21 eftersom svarstiden redan syns på den frusna stopwatch:n ovanför, så två renderingar var redundant.
   - **Song meta-rad** (under "Correct year"): låt-titel + artist från `question.hint` (= `MUSIC_QUESTIONS.displayName`-format "Title — Artist", t.ex. `"Dancing Queen — ABBA"`). Styling: `FontSize.xs` (11px) + `lineHeight: 13` + `Colors.textSecondary` så raden bara adderar ~2-3px till kortets höjd. `numberOfLines={1}` + `ellipsizeMode="tail"` skyddar mot långa titlar.

### Reveal Next-tab (bottom-right corner)

Next-tab / Final Leaderboard-CTA är absolute-positionerad i nedre högra hörnet av SafeAreaView:n via `rv.revealNextAbsolute` (`position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, zIndex: 60, elevation: 60, alignItems: 'flex-end'`). Sibling till ScrollView så CTA:n alltid syns oavsett scroll-position. `pointerEvents="box-none"` på wrappern så taps utanför själva knappen når underliggande ScrollView. Visas för BÅDA timeline- och image-frågor i reveal-fasen.

**Visuell vokabulär matchar startskärmens `gameBtn`** (pulserande Join/Create-CTA:er i [app/index.tsx](app/index.tsx)) — inte Final Leaderboard:s `finalHomeBtn` som tidigare:
- `height: 56`, `borderRadius: Radius.md`
- `backgroundColor: Colors.cardElevated` + `borderWidth: 1` `borderColor: Colors.primary`
- Text: `fontSize: 17`, `fontWeight: '600'`, `color: Colors.textPrimary`, `letterSpacing: 0.3`

Knappens fyll-färger (cardElevated + primary border) matchar Confirm-knappens, så reveal-knappen ser ut som "samma typ av CTA" som Confirm-knappen i question-fasen — bara utan halo-glow.

**Pulse**: scale 1 ↔ 1.03 over 900ms (samma cadens som startskärmens `pulse` Animated.Value). Loop:en körs kontinuerligt på mount — tab:en är ändå bara monterad i reveal-fasen så ingen phase-gating behövs.

**Non-host i IndDev** ser istället en passiv `waitingForHostPill` med "Waiting for host" + SequentialDots (textSecondary + borderStrong-bg) — ingen pulse, ingen tap. Host:s tap på Next broadcastar `question_advance` så non-host:s phase också advance:as via listener.

**`nextTabCorrect`/`nextTabWrong` style-keys borttagna** — color-tema är samma oavsett rätt/fel (kortets border + badge bär status-färgen, tab:en är neutral "fortsätt"-CTA). Förhindrar att framtida edits återinförsätter status-baserad tab-styling.

### Confirm + awaiting + reveal-flödet

**`handleConfirm(year)`**:
1. Räknar exakt elapsed via `Date.now() - questionStartMsRef` → `exactElapsedSec` (cap:as till `responseSeconds`).
2. `recordRoundScore(pts, correct, exactElapsedSec)` registrerar score:n under **active player's id** (`turnOrder[currentPlayerIndex]?.id ?? 'you'`). **Skickar `exactElapsedSec` (2-decimaler) — INTE heltals-derived `responseSeconds - timeLeft`** — annars hade leaderboardens AVG/LAST-kolumner alltid visat `x.00`. Samma värde sparas i `setRounds`-historiken som `timeUsed`. I Pass-the-Phone genereras inga mock-opponent-poäng — endast aktiva spelaren får en post. `allRoundScoresHistory` uppdateras.
3. Sätter `confirmedTimeUsed`, `decimalElapsedMs` (frys), `selectedYear`.
4. Stoppar **inte** timer:n. Sätter `phase = 'awaiting'`.

**Awaiting-fasen**:
- TimelineSelector låst (`disabled`), feedback-kortet INTE renderat ännu.
- Stopwatch:n fryser på exakt confirm-värdet.
- Timer-bar:en + sekund-räknaren tickar VIDARE oberoende → ringen pulserar fortsatt i timerColor (gul/röd när tiden tar slut), stopwatch:n står still i ljusblå.
- När `timeLeft === 0` (eller `timeLeft <= 0` clamp:as) → `setPhase('reveal')` triggas av useEffect på `[timeLeft]`. Round redan registrerad i handleConfirm så ingen dubbelregistrering.

**Time-out utan Confirm** (`phase === 'question' && timeLeft === 0`):
- Default-guess = `currentYear - 20`, 0 poäng. `recordRoundScore(0, false, responseSeconds)` registrerar miss. `setPhase('reveal')`.

**Spring-in-animation** för feedback-kortet (`revealScale: 0.6 → 1` + `revealOpacity: 0 → 1`) triggas i useEffect på `phase`-deps varje gång phase blir 'reveal'.

### Quiz error red (lokal scope)

`Colors.error = '#FF6B6B'` är medvetet mjuk coral i hela appen (Lobby toggle-off-state, papperskorgs-pressed, Leave/Logout-knappar, ApproveToggle disabled-track, etc.). Quiz-vyn vill däremot ha en distinkt urgency-röd för timer-countdown + Wrong Answer-feedback. Lösning: module-level konstant `QUIZ_ERROR_RED = '#FF3B30'` (Apple iOS system red) i [app/quiz.tsx](app/quiz.tsx), använd på tre platser:
- `timerColor`-grenen vid `timeLeft ≤ 5` (driver timer-bar, ring, sekund-räknaren, stopwatch border via timerColor-derivat)
- `feedbackWrong.borderColor` (Wrong Answer-kortets röda kantlinje)
- `feedbackBadgeWrong.backgroundColor` (badge:n)

Princip: när framtida quiz-specifik röd-användning dyker upp, använd `QUIZ_ERROR_RED`. För all annan röd i appen → `Colors.error`. Inga ytterligare callsites för `QUIZ_ERROR_RED` utanför quiz.tsx.

### Image questions — scroll-hint pil

Image-frågor har 10 prefix-knappar i ImageAnswerBlock — på små skärmar ryms inte alla + Confirm-knappen i en vy. Pilen i [app/quiz.tsx](app/quiz.tsx) (`scrollHintStyles`) signalerar till spelaren att fortsätta scrolla:
- **Position**: `position: 'absolute'` i SafeAreaView (utanför ScrollView), `bottom: Spacing.lg`, centered. `zIndex: 50 + elevation: 50` så pillen ligger ovanpå allt annat.
- **Visual**: rounded pill (minWidth 64 × height 36) med solid `Colors.primary` bg + drop-shadow, innehållandes Text-glyph `⌄` (fontSize 32 vit fet, marginTop -10 för vertikal centrering). Använder Text-glyph istället för SVG för max plattformskompatibilitet.
- **Blink-pulse**: opacity 1 ↔ 0.3 över 600ms (snabbare cadens än övriga pulses för att grab attention). `scrollHintOpacity` Animated.Value körs i Animated.loop på mount; `useNativeDriver: true`.
- **Auto-hide nära botten**: ScrollView:s `onScroll` (throttle 32ms) räknar `contentSize.height - (contentOffset.y + layoutMeasurement.height)`. När < 24px till botten → `setScrolledToBottom(true)` → pilen göms via JSX-gate.
- **Reset per fråga**: useEffect på `[questionIndex]` återställer `scrolledToBottom = false` så pilen återkommer på nästa image-fråga oavsett tidigare scroll-position.
- **Gating**: `question.type === 'image' && (phase === 'question' || phase === 'awaiting') && !scrolledToBottom`. Renderas INTE på timeline-frågor (year selector + Confirm ryms typiskt utan scroll). Under reveal-fasen behövs den inte heller eftersom Next-tab sitter absolute-positionerad i bottom-right corner (alltid synlig oavsett scroll). Inte heller intro/countdown/leaderboard.
- **`pointerEvents: 'none'`** på Animated.View-wrappern så pilen inte blockar taps på Confirm/grid under den.

### Music question + answer mock data

**`MUSIC_QUESTION_TEXT = 'Which year was this song released?'`** — alla mock-frågor delar denna text (själva låten är frågan via YouTube). `correctYear` + `hint` (era) per fråga är fortfarande unika så reveal-vyn varierar i hint-texten även om frågetexten är generisk.

**`calculatePoints(correct, assistance?, questionKind?)`** — binär scoring: `correct ? 1 : 0` oavsett assistance och frågetyp. Assistance styr bara träffsäkerhet (via `generateOpponentRoundScore`-accuracy-tabellen), INTE poängvärdet per rätt svar. **Tie-break**: lägst `avgResponseSeconds` asc vid pts-lika. Mock-opponent-funktionen `generateOpponentRoundScore(assistance, questionKind)` i [src/components/RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx) returnerar `{ points: correct ? 1 : 0, correct }` — accuracy-tabell: `full=0.45, standard=0.65, minimal=0.78`.

**HCP-progression (SUPERSEDED 2026-08-28)**: `calculateNewHCP` (poäng/2-reduktion) är ERSATT av sliding-window-motorn i [hcpEngine.ts](src/utils/hcpEngine.ts) och anropas inte längre. HCP är INTE längre ute ur launch-scope — se "Dynamic HCP System". Den gamla funktionen ligger kvar oanvänd i hcp.ts.

**Answer response time** (`responseSeconds: 30 | 45 | 60`) är dynamisk state i quiz.tsx, justerbar via GetReadyIntro:s dropdown. Används överallt där 30 tidigare var hardcoded:
- `startTimer`: `setTimeLeft(responseSeconds)` + `Animated.timing.duration: responseSeconds * 1000`.
- `decimalElapsedMs`-tick + cap: `responseSeconds * 1000`.
- `handleConfirm`: `responseSeconds - timeLeft` för timeUsed (loggas i RoundResult för leaderboard-AVG/LAST-kolumner; påverkar INTE pts-räkningen längre).
- Avatar-marker: `((responseSeconds − confirmedTimeUsed) / responseSeconds) * 100%`.
- Color-trösklar (warning ≤10s, error ≤5s, pulse ≤5s) bevarade som **absoluta sekunder** — universell "lite tid kvar"-perception.

**Game era → fråge-filter + tidslinje-cap**: Lobby:s `handleStartGame` skickar `eraFrom`/`eraTo` som router-params (post-clamp via `clampEraToPlayer`). Quiz använder dem för:
- `eraFilteredQuestions = SEED_QUESTIONS.filter(q => q.correctYear ∈ [eraFrom, eraTo])`. Fallback till hela `SEED_QUESTIONS` om filtret tomt.
- `<TimelineSelector eraFrom={eraFrom} eraTo={eraTo} />` — tidslinjens `min`/`max` är exakt era-spannet. Spelaren kan inte scrolla utanför.

**Mock-frågor cyklas via modulo** (`eraFilteredQuestions[questionIndex % length]`) tills riktig fråge-bank kommer in.

## Shared visual components

- `src/components/MorseAmbientSound.tsx` — osynlig WebView som spelar en **ljus "appen är igång"-slinga** via Web Audio API. Namnet är ett legacy-misvisande arv (inget morse sedan länge). **Omgjord 2026-08-24** (Peter: den gamla låga moll-padden Am→F→C→G i 98–220 Hz kändes tung/dyster): nu music-box-plingar i C-dur över pop-kadensen **C → G → Am → F**. Varje pling = triangelvåg + en oktav ovanpå (sinus) genom ett lowpass, attack 8 ms + exponentiell decay = klockkaraktär; delay 275 ms / feedback 0,22 ger glitter. Master-gain 0,30. Det är ANSLAGET, inte registret, som gör att den läser som liv i appen — slingan har sedan mörknats i tre pass (se nedan) utan att tappa den karaktären. ⚠ **Slingan är MEDVETET gles och har INGET bakgrundslager** — en fras på 4 toner följt av **2 s tystnad** innan nästa ackord. **Två klangvarv** (`VOICES`): fraserna växlar mellan en DÄMPAD och en MÖRK röst — samma toner och samma FASTA takt (`STEP` 550 ms), den mörka en oktav under den dämpade. Kontrasten ligger i REGISTER + KLANG, aldrig i tempo. Aktuellt: dämpad `octave 0.50 / lpf 900 / shine 0.14 / decay 1.70 / gain 1.30`, mörk `octave 0.25 / lpf 750 / shine 0.20 / decay 1.90 / gain 1.60` — grundtoner 175–523 resp. 87–262 Hz. **Mörknades i tre pass av Peter 2026-08-24**, verifierat på telefon: först varv 1:s filter (lpf 2600 → 1700 → 1450, shine 0,22 → 0,11), sedan — när filtren låg så nära varandra att oktaven bar hela kontrasten — BÅDA varven ett helt oktavsteg ned (1.0/0.5 → 0.5/0.25). ⚠ **Filter-cutoff MÅSTE skalas med registret** — halveras tonhöjden utan att cutoff följer med hamnar dämpningen ovanför det som faktiskt låter och försvinner. ⚠ **Varv 2:s grundton (87–262 Hz) ligger UNDER vad en mobilhögtalare återger** och hörs via oktaven ovanför; därför är `shine` uppskruvad där (0,20 mot 0,09 tidigare) och gain lyft till 1,60. Låter varv 2 tunt/frånvarande snarare än mörkt är felet registret, inte volymen — ta då tillbaka det till `octave 0.5` och låt filtret bära skillnaden. ⚠ **`octave` är BARA 1.0 / 0.5 / 0.25 — aldrig något däremellan.** Enbart oktavtransponering bevarar harmoniken; en kvint eller kvart ned transponerar frasen och låter som att progressionen modulerar mitt i slingan. Mellanlägen i ljusstyrka görs med lpf/shine/decay. ⚠ **Återinför inte en takt-ramp** — en tidigare version stegrade takten över tre fraser och dämpades i tre omgångar (42 % → 24 % → 15 %) innan den ströks helt av Peter 2026-08-24: varje hörbar stegring läser som att något håller på att hända i spelet, och det hör hemma i CountdownIntro. Klangvarven (2 långa) och ackordföljden (4 lång) löper **oberoende**, så varje ackord får konsekvent samma röst — C ljus, G mörk, Am ljus, F mörk → repris var fjärde fras. Fyra toner per fras ligger fast (Peter 2026-08-24); `STEP` (takt), `REST` (paus) och `VOICES` (register + klang) är rattarna. `delayTime` är fast 275 ms och får INTE moduleras per fras — ett abrupt byte av delay-tid ger pitch-warble i delay-linjen. Ett viskande sinus-pad-lager under plingarna byggdes och revs samma dag: det gjorde slingan till en oavbruten bakgrundston, alltså precis det drone-padden dömdes ut för. Samma sak gäller om man nollar `REST` — utan pausen blir det bakgrundsmusik igen. Det ska vara en närvaro-signal som pickar till då och då, inte musik man lyssnar aktivt på. **Look-ahead-schemaläggare** (setInterval 25 ms, 0,4 s framförhållning, `nextChordTime`-kursor mot `ctx.currentTime`) i stället för setTimeout-per-ackord — den gamla drev och gav hörbara glapp mellan varven. Monteras i `LobbyScreen`'s `<SafeAreaView>` (position absolute left:-2, top:-2, utanför synlig yta) **gated på `hostMode`**, och i [app/quiz.tsx](app/quiz.tsx) under GetReady-fasen (`phase === 'intro'`) gated ENBART på `isAudioMutedForSelf` — se ljudgrind-regeln under Remote-audio. `allowsInlineMediaPlayback + mediaPlaybackRequiresUserAction={false}` krävs för autoplay på iOS utan user-gesture. Ingen audio-fil behövs — toner genereras procedurellt. ⚠ **Uppspelningen styrs av `active`-proppen — AVMONTERA ALDRIG komponenten medan den låter** (Peter 2026-08-26: "det klickar eller piper till ibland när man trycker start game"). Att riva WebView:n river AudioContext:en synkront, och ligger en pluck och ringer kapas vågformen mitt i → hörbart klick i högtalaren. Eftersom en fras låter ~3,4 s av sin 4,2 s-cykel träffade det ~80 % av tryckningarna — därav "ibland". `active={false}` rampar i stället master-gain till noll på 300 ms och suspendar contexten först efter `TAIL_MS` (2600 ms), när även den längsta decayen klingat ut. Följden för call-sites: **Lobby** renderar den ovillkorligt på `hostMode && showAmbient` och skickar `active={screenFocused}` (elementet ligger kvar monterat medan quizet spelas), och **quiz.tsx** renderar den i BÅDA intro- och countdown-grenarna på **samma barn-position** (index 2 under `touchWrap`-View:n) så React återanvänder instansen över fasbytet i stället för att riva den — flyttas den, eller utelämnas i countdown-grenen, är klicket tillbaka vid varje Play-tap. En enhet som monterar med `active={false}` skapar ingen AudioContext alls (`window.__qvActive` injiceras före sid-laddning).

- `src/components/QuizVibeLogo.tsx` — brand SVG used on Home and Lobby room-card (both at `size={104}`). The Q-figure (ring + tail + wifi-fan in the center) is shifted **−3 in x, −1 in y** from the original (40, 38) center so the Q+tail bounding box (24-52, 24-52) is centered in the front rounded square (16-60, 16-60, center 38, 38). Wifi-fan replaces the old single dot — three concentric 90°-arcs (radii 3 / 5 / 7, `sweep-flag=1` so they bulge upward) + a 1.5px dot, all centered at (37, 37) (= Q ring center). 90° was chosen over 120° to match the iOS status-bar wifi icon's compactness — sweep-flag=0 produced inverted (frown) arcs, easy to flip back accidentally.
- `src/components/QuizVibeFriendsLogo.tsx` — brand-mark variant for the QuizVibe friends card on Profile. Q-form + tail + rotated squares are identical to `QuizVibeLogo`, but the wifi-pattern inside the Q ring is replaced with two profile silhouettes (head circle + body rounded-rect side-by-side). ViewBox tightened to `"13 13 54 54"` (vs `"0 0 80 80"` in `QuizVibeLogo`) to crop the empty padding around the rotated squares so visible content fills the render area at small sizes (44-52px). Q is centered at **(38, 38)** to match the squares' pre-rotation visual center, NOT (40, 40) which is the viewBox geometric mid. Default `size=44` to match other header icon-wraps on the same screen; rendered inside a `friendsIconWrap` (44×44 View) for layout-dimension safety.
- `src/components/TopUserBanner.tsx` — full-width banner with a login pill (avatar + Player Name, or "Register or Login" when no profile) in the top-right corner. **Optional `onPress`**: when omitted the pill renders as a plain `<View>` istället för `<TouchableOpacity>` (used on Profile screen — user is already there, no destination); Home passes `setProfileMenuVisible(true)`; Lobby passes role-baserad handler (host → delete-sheet, non-host → leave-sheet — se "Lobby — TopUserBanner actions"). **Optional `profile` prop (controlled mode)**: skärmar med in-place-login (Home — login-modalen lever på samma skärm som bannern) MÅSTE passera sin egen profile-state så bannern uppdateras direkt vid login/logout — useFocusEffect-self-load triggar inte eftersom skärmen aldrig tappar focus. Lobby/Profile utelämnar proppen och låter bannern self-loada via useFocusEffect (de re-renderas naturligt när skärmen åter får focus). **Optional `guestName` prop**: när profile saknas men guestName finns visar pillen 👤 + guestName i muted styling (samma look som "Register or Login"-fallback) — driver display för gäster som joinat lobby:n via guest-form. Registrerade users (profile != null) har företräde om båda råkar vara satta. **Optional `onBackPress` + `backLabel?: 'Home' | 'Back'`**: när `onBackPress` är satt renderas en tillbaka-länk i bannerns vänstra kant och `topBoard` byter till `justifyContent: 'space-between'`. `backLabel='Home'` (default) visar Q-avatar + "Home"-text i column-stack (Colors.primary). `backLabel='Back'` visar plain `← Back`-text (Colors.textSecondary, fontWeight 500) som speglar Join-as-guest-modalens backBtn-style — används i Store. **Sticky-on-scroll pattern**: place as a direct child of `<SafeAreaView>`, **outside** the `<ScrollView>`, so it remains pinned at the top while content scrolls. Used on Home, Lobby, Profile, and Store screens.
- [src/components/ShoppingCartIcon.tsx](src/components/ShoppingCartIcon.tsx) — minimal SVG-ikon (basket-kontur + två hjul i Path/Circle) som leading-ikon på Store-knappar i user-login-modalerna (Home `profileMenu` + Profile `logoutSheet`). Default `size=22`, `color=Colors.textPrimary` så den smälter in i knapptexten istället för att dra fokus.
- [src/components/YouTubeBrandIcon.tsx](src/components/YouTubeBrandIcon.tsx) — YouTube:s officiella play-button-ikon (röd rounded-rect `#FF0000` + vit play-triangel) som inline SVG. ViewBox 28.57×20 (aspect ratio ≈ 1.43, wider-than-tall). Path:en från YouTube Brand Resources får INTE modifieras — ingen omfärgning, ingen form-modifikation. `size`-propen styr bredd; höjden härleds från aspect ratio så proportionerna bevaras. Används i Lobby:s Game Connections-rad (YouTube-källans toggle) + GetReadyIntro:s media-source-kö (IndDev/Single Player). Bytt 2026-05-22 från tidigare generisk blå-cirkel + vit-play-triangel (`connectionIconYoutube` / `MediaSourceIcon` youtube-grenen) — den nya är mer compliant med YouTube API Services Branding Guidelines som rekommenderar att integrationer visar deras officiella märke nära YouTube-content.
- `src/components/CodeKeyboard.tsx` — custom in-app keyboard som används av Room Code-cellerna i JoinModal OCH PlayerName-fältet i båda flödena (guest + register). Se "Custom CodeKeyboard" för props (`letterCharset`, `onModeToggle`), layout-detaljer och rationale.
- [src/components/RoundsRuler.tsx](src/components/RoundsRuler.tsx) — linjemätare för Number of Rounds + alla `ROUNDS_*`-konstanter (`ROUNDS_MIN=2`, `ROUNDS_MAX_PASS=4`, `ROUNDS_MAX_INDIV=20`, `ROUNDS_STEP=2`, `ROUNDS_DEFAULT=4`). Delas mellan Lobby (host-vy + non-host read-only) och Profile (host-default-block). PREMIUM-pillen över locked-tickarna är rektangulär (`borderRadius: 4`, `paddingHorizontal: 8 / paddingVertical: 2`, `fontSize: 10`) — speglar Individual Devices PREMIUM-badgens form, INTE pill-formen som ursprunglig Buy CTA hade. Centreras under bracket-bredden via en absolutpositionerad wrapper med `alignItems: 'center'` så bredden auto-anpassar till "PREMIUM"-textens bredd (ingen fixed `width: 100` längre).
- [src/utils/mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) — delad mock över köpta extra-paket (`MusicPackage[]`). **V1-scope (2026-05-27): `PURCHASED_PACKAGES = []` + inga gen-paket** (themed packages parkerade till v1.1+, gen-paket-konceptet ("Play as Gen X" etc.) borttaget). Profile + Lobby Customized Host packages-listan är tom genom hela V1 — Select all-toggle göms (kräver ≥ 2 paket), empty-state-text visas. `GenerationKey` + `getGenerationKeyFromBirthYear` är kvar som ren content-filter-utility (används av [audienceFilter.ts](src/utils/audienceFilter.ts)).

## Analytics

Lättviktig wrapper i [src/utils/analytics.ts](src/utils/analytics.ts) — `track(name, props?)`, `identify(userId, traits?)`, `resetIdentity()`. Implementationen loggar bara till console just nu; byt till vendor-SDK (PostHog / Firebase Analytics / Amplitude) när leverantör är vald — call-sites runt om i appen stannar oförändrade.

Event-taxonomi (snake_case verb i preteritum):
- **Lifecycle**: `user_registered`, `user_logged_in`, `user_logged_out`
- **Game flow**: `guest_name_created`, `room_code_created`, `game_started`, `game_completed`
- **Monetization**: `purchase_completed` (props: `type` = `'extra_package'` | `'subscription'` | `'credits'`, `product_id`, `price_amount`, `price_currency`)

Region/land skickas INTE i events — alla större vendors auto-fyller `country_code` via IP/locale så slicing per region funkar i dashboarden out-of-the-box. App Store Connect ger nedladdningar per region som separat datakälla. Skicka inte heller PII (email, fullt namn) i props.

Call-sites finns redan i: `handleRegisterSubmit`, `handleLogin`, `handleLogout`, `handleCreateGame`, `handleJoinAsGuest` ([app/index.tsx](app/index.tsx)) och `QuizScreen` (mount + final leaderboard) ([app/quiz.tsx](app/quiz.tsx)). `purchase_completed` saknar fortfarande call-site — instrumentera när Store-integrationen kopplas in.

## Name-answer model

Två-stegs-svaret (Letter Grid → Final Selection) lever i [ImageAnswerBlock.tsx](src/components/ImageAnswerBlock.tsx) och används av live-quizet — se "Quiz — frågetyper" och "Image questions".

~~`app/name-quiz-demo.tsx`~~ var en fristående prototyp av samma modell. **Raderad 2026-08-17** tillsammans med `src/utils/nameQuizDemo.ts` och `backend/scripts/export-demo.ts` (npm-scriptet `export-demo`): den hade ingen ingång i appen, och modellen den skissade är sedan länge integrerad i ImageAnswerBlock. `npm run demo` i backend är något ANNAT och finns kvar — den skriver ut Letter Grid-output i konsolen från katalogen.

**ProgressiveCover** ([src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx)) — mosaik-overlay som avslöjar bilden/flaggan under sig:
- 32×18 = 576 svarta block, 4 block tas bort per tick. Total reveal-tid styrs av `assistance`-propen: `full=0.25 × totalSeconds`, `standard=0.5 × totalSeconds`, `minimal=0.75 × totalSeconds`.
- **`active?: boolean` (default true)** — mosaiktimern och logo-faden startar INTE förrän `active=true`. I HintsQuizCard passas `active={mosaicActive ?? hintsActive}` (flaggans mosaik startar 2 s in via `timerActive`). Effekterna är uppdelade i tre separata useEffects: (1) reset på `[resetKey]`; (2) mosaikintervall på `[resetKey, assistance, totalSeconds, active, isRevealed]`; (3) logo-fade på `[resetKey, active, isRevealed]`. Ingen effect nollställer `revealedCount` pga `active`-byte — mosaiken stannar kvar synlig i awaiting/reveal.
- Random reveal-order (Fisher-Yates shuffle) regenererad per `resetKey`-byte.
- `<QuizVibeQuestionMarkLogo>` centrerad ovanpå mosaiken, fadar 1 → 0 över exakt 3 sekunder via separat tick-loop.
- React.memo på `<Block>`-komponenten — bara de 4 block som ändras per tick re-renderas, inte alla 576.
- `isRevealed=true` → snap till alla block borta + logga osynlig (hanteras av separat effect på `[isRevealed]`).
- Original-bilden under är ALDRIG pixlad — skarp hela tiden, skymd av svarta block som plockas bort.

**logoSize-tweaking** för QuizVibeQuestionMarkLogo i mediaCard: 320 är empiriskt lagom för 16:9 på iPhone (~390px wide × 220px tall). 360+ klipps av top/bottom. <280 ser för litet ut.

## Shared visual components (sessions-tillägg)

- [src/components/QuizVibeQuestionMarkLogo.tsx](src/components/QuizVibeQuestionMarkLogo.tsx) — variant av `QuizVibeLogo` med `?`-glyph (SVG `<Text>`) i Q-ringen istället för wifi-fan. Squares + Q-ring + Q-svans identiska. ViewBox 0-80 × 0-80, Q-ring center (37, 37). `?` placeras på y=43 så glyph-mitten hamnar runt y=37 (SvgText:s y refererar till baseline).
- [src/components/QuizVibePlayLogo.tsx](src/components/QuizVibePlayLogo.tsx) — variant med play-triangel inuti Q-ringen istället för wifi-fan/?. Tar `color`-prop (default `Colors.primary`) som styr alla brand-färgade element (Q-ring, svans, play-triangel, squares-kanter). Bakre kvadratens muted-fyllning härleds som `color + '30'` (~19% opacity hex-alpha) så hela loggan toner mot color-värdet — i GetReady passas `Colors.warning` så loggan blir gold för att matcha gold-glow-halo:n runt den.
- [src/components/CountdownIntro.tsx](src/components/CountdownIntro.tsx) — 3-2-1-nedräkning mellan tap på play-knappen i intro:n och fråge-vyn. Stor `CountdownQLogo` centrerad (size 360 px på fullbreds-skärmar). Siffran (3, 2, 1) och `?`-glyfen pop:as in i Q-ringen via overlay-Animated.Text med spring-scale 1.4 → 1 + opacity 0 → 1, **följt av en kontinuerlig zoom-puls 1 ↔ 1.18 (350 ms varje håll, ~1.4 puls/sek)** tills siffran byts. Loop:n stoppas i useEffect cleanup vid count-byte så nästa siffrans pop-in inte krockar med den gamla loopen. Total tid ~4 s. **Q-loggan shift:as `LOGO_SIZE * 0.0375` åt höger** via en absolute-positionerad wrap-View så Q-ringens center (SVG-koord (37, 37) = 46.25 % av LOGO_SIZE) hamnar exakt på 50 % horisontellt under glyph-overlay:ns centrerade siffra/?. **PlayerName-block ovan loggan**: `Pass-the-Phone to:`-label + framed box (`primaryMuted` bg + `Colors.primary` border + Radius.md, padding sm/lg) som matchar GetReadyIntro:s `currentPlayerBox` 1:1 — avatar (40×40 cirkel) + namn (FontSize.xxl bold) i row-layout. `playerEmoji?: string`-prop skickas in från quiz.tsx via `turnOrder[currentPlayerIndex]?.emoji`. `playerBlock.gap = Spacing.xl` ger luftig separation mellan label-rad och box.
- [src/components/StopwatchIcon.tsx](src/components/StopwatchIcon.tsx) — modern sport-stopwatch SVG (rund kropp, top crown-knapp, sido-knapp diagonal, tick-mark vid 12-position, visare mot 1-2-positionen, center-pivot). `color`-prop styr alla element. ViewBox 24×24, default size 24. Används i quiz-skärmens decimal-stopwatch under timer-bar:en — ersätter den tidigare ⏱-emojin som rendereades inkonsekvent över plattformar.
- [src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx) — mosaik-reveal-cover (se "Name-answer model — demo route"). Tar `assistance`-prop som styr reveal-fraktion: `full=0.25`, `standard=0.5`, `minimal=0.75` av `totalSeconds` (mer assistance = snabbare reveal). Q-loggan fadar oberoende av mosaiken — alltid helt borta efter 3 s via separat tick-loop.
- [src/components/QuizVibeQAvatar.tsx](src/components/QuizVibeQAvatar.tsx) — Q-only brand-mark (utan rounded-square-bakgrunder) med valbart innehåll. `variant: 'smile' | 'wifi'` (default `'smile'`): smile = ögon + glad mun (default i TopUserBanner, Profile, Home, Avatar-fallback); wifi = Spotify-stilade sound-wave-arcs (3 koncentriska arcs roterade 25°, samma som QuizVibeLogo). ViewBox expanderas för wifi (`"21 21 36 36"`) så top-arc inte klipps. Används i Final Leaderboard:s Home-knapp där wifi-varianten valdes för brand-konsistens med start-skärmens logga. **`color?: string`-prop** (tillagd 2026-06-30): styr SVG-färg på alla element, default `Colors.primary`. Används av BottomBanner för aktiv (guld) vs inaktiv (grå) tab-färg.

## BottomBanner — global tab-navigation (2026-06-30)

[src/components/BottomBanner.tsx](src/components/BottomBanner.tsx) — sticky bottom tab-bar synlig på `/`, `/profile` och `/store`. Renderas i `app/_layout.tsx` utanför Stack-navigatorn så den alltid ligger ovanpå innehållet.

**Layout**: `position: 'absolute', bottom: 0` + `backgroundColor: '#000'`. Innehåller en 1px `Colors.border`-avdelarline + en rad med tre tabs. Höjd `BOTTOM_BANNER_HEIGHT = 52` (exporteras för scroll-padding i screens). `paddingBottom: insets.bottom` via `useSafeAreaInsets` täcker home-indicator-zonen.

**Tab-design**: ikon + text på **samma rad** (`flexDirection: 'row'`, `gap: 6`). Inga border-ramar eller bakgrundsfärger på tabbar — aktiv tab markeras **enbart** med guld (`Colors.warning`) på ikon och text. Inaktiv = `Colors.textSecondary`.

**Ikonval per tab**:
- Home → `<QuizVibeQAvatar size={26} variant="wifi" />`
- Profile → `<QuizVibeQAvatar size={26} variant="smile" />`
- Store → `<ShoppingCartIcon size={22} />`

**`SHOW_ON = ['/', '/profile', '/store', '/my-matches']`** (`/my-matches` tillagd 2026-08-07) — returnerar `null` för alla andra routes (lobby, quiz, getready etc.). På `/my-matches` är ingen av de tre tabbarna aktiv-markerad (grå ikoner — vyn är en egen destination).

**Scroll-padding**: alla tre screens lägger till `+ 52` (BOTTOM_BANNER_HEIGHT) i sin `paddingBottom` så scroll-innehållet inte döljs bakom bannern:
- `app/index.tsx`: `Spacing.lg + 52`
- `src/screens/ProfileScreen.tsx`: `Spacing.xxl + 52`
- `src/screens/StoreScreen.tsx`: `Spacing.xxl + 52`
- `src/screens/MyMatchesScreen.tsx`: `Spacing.lg + BOTTOM_BANNER_HEIGHT` (importerar konstanten)

**Navigation**: `router.replace()` (ingen history-stack) via expo-router. Aktiv route detekteras via `usePathname()`.

**Login-gated (2026-07-03)**: bannern visas ENBART när en profil finns (samma definition som Home:s `isLoggedIn = !!profile`). BottomBanner håller eget `loggedIn`-state — den lever i `_layout` utanför screen-trädet så `useFocusEffect` fungerar inte; istället lyssnar den på tre signaler och reload:ar profilen vid var och en: (1) **`subscribeProfileChanges`** från [profileStorage.ts](src/utils/profileStorage.ts) — lättviktig in-memory event-bus (`Set<listener>`) som `saveProfile` (register) och `clearProfile` (logout/delete account) notifierar; kritisk eftersom `clearProfile` körs EFTER `supabase.auth.signOut` så en SIGNED_OUT-triggad reload kan hinna läsa stale AsyncStorage-cache. (2) **Supabase `onAuthStateChange`** — SIGNED_IN fyrar vid login (profilen läses då från Supabase innan lokala cachen skrivits). (3) **pathname-byten** — belt-and-suspenders vid navigation. Konsekvens: utloggade users når inte Store via bannern — medvetet (köp kräver konto ändå; RevenueCat kopplas till Supabase-user).

## Home — login-state layout (2026-07-03)

Startskärmens actions-sektion i [app/index.tsx](app/index.tsx) renderas olika per login-läge. Färgtema: **grönt = registered-path, grått = guest-path, gold = inloggade user-actions**.

**Utloggad** (uppifrån):
- **Ingen TopUserBanner** (gated på `isLoggedIn` — "Register or Login"-pillen var redundant mot knappen nedan) och **ingen BottomBanner** (se BottomBanner-sektionen).
- Grön **"QUIZVIBE USER"**-rubrik (`userSectionHeader`, `Colors.success`, overline-stil utan ruta/bakgrund) med **info-ikon** intill (rubrik + ikon i `userSectionHeaderRow`; ikonen är samma `infoIconBtn`/`infoIconText`-vokabulär som Lobby-skärmens info-knappar). Tap öppnar en bottom-sheet-modal med jämförelsen **user vs guest** — raderna bor i module-level-konstanten `USER_VS_GUEST_ROWS` i [app/index.tsx](app/index.tsx) (`user`/`guest` är `true` → grön ✓, `false` → grå ✗, eller en kort värde-sträng: "2 free" vs "Trial"). Rendering via den lokala `CompareCell`-komponenten. **Tabellen gäller MEDVETET bara det GRATIS kontot mot Guest** (Peter 2026-08-09) — allt betalt ligger i en separat gold-rubricerad punktlista under tabellen (`PREMIUM_FEATURES`) och nås via tabellraden "Premium option". Inga asterisker/fotnoter i värde-kolumnerna; spegla StoreScreen:s `SUBSCRIPTION_FEATURES` när Premium-listan ändras. **Curator-regel: håll raderna synkade med faktiska gates** — Remote 1vs1 är users-only, guest-hostade spel skriver ingen Player history, guest host är låst till fast Game era / inga Extra packages / varken re-match eller replay. + **Register or Login** — helgrön knapp (`gameBtnRegister`: bg + border `Colors.success`), pulserande, kant-skärande FREE-badge med **vit kantlinje** (`homeFreeBadgeRegister`) så badgen syns mot knappens gröna bakgrund.
- Grå **"GUEST / NON-REGISTERED USER"**-rubrik (`guestSectionHeader`, `#6B7280`, `marginTop: Spacing.xl` för sektions-separation) + **Join with Room Code — guest** + **Start Game as Guest** — båda helgrå (`gameBtnGuest`: bg + border `#6B7280` = PREMIUM-grey), pulserande. Join-guest-knappen har FREE-badge, Start Game as Guest har **"TRIAL version"-badge** (båda via `homeFreeBadge`-stilen: grön bg + **vit kant** + vit text, kant-skärande `top: -8, right: Spacing.lg`). Sedan 2026-07-03 har ALLA Home-badges vit kantlinje (satt i `homeFreeBadge`-basen; `homeFreeBadgeRegister`-overriden är redundant men kvar). **Guest-knappens `HostTypeOptions`-utfällning**: Remote Play är LÅST i utloggat läge (dimmad rad + grön "QuizVibe user"-badge + register-upsell; raden göms INTE) och HELT DOLD i inloggat läge — `remoteMode={isLoggedIn ? 'hidden' : 'locked'}`. Se "Remote 1v1 är QuizVibe-users-only".
- **Start New Game + Join with Room Code — user är HELT dolda** — de tidigare 🔒-låsta varianterna och "Register and Log in to unlock..."-hinten är borttagna (`createGameHint`-stylen kvar som död CSS).

**Inloggad**:
- TopUserBanner + BottomBanner synliga.
- **Start New Game** + **Join with Room Code — user** i **gold** (`gameBtnUser`: bg + border `Colors.warning` + svart text via `gameBtnUserText`, per appens gold-badge-konvention), pulserande. Båda har kant-skärande **"QuizVibe USER"-badge** (grön `Colors.success` med vit kant via `homeFreeBadge` + `homeUserBadge`-override så den syns mot guld-bakgrunden — grönt knyter an till registered-path-färgen; blå nyanser testades och förkastades 2026-07-03).
- Guest-rubriken + "Join with Room Code — guest" är borta; **endast "Start Game as Guest" kvar** (grå, pulserande, med **"TRIAL version"-badge** — badgen visas i BÅDA login-lägena sedan 2026-07-03, ersatte tidigare utloggat-gated FREE-badge). Knappen får extra `marginTop: Spacing.xl` i inloggat läge så avståndet till "Join with Room Code — user" ökar (trial-vägen är sekundär mot de gyllene user-knapparna). Inloggade spelare ska kunna hosta som guest; knappen fäller ut `HostTypeOptions` (Remote Play-raden är HELT DOLD här — remote är QuizVibe-users-only, så guest-hosting når det aldrig) och valet öppnar guest-HOST-formen (`openJoin('guest-host')`, se "Start Game as Guest (Guest Host)" nedan). Spelet körs under Guest-identiteten, inte profilen — ingen Player History skrivs.

"Join with Room Code — guest" öppnar `openJoin('guest')` (guest-JOIN-formen med assistance-väljare + rumkods-celler, oförändrad); "Start Game as Guest" öppnar `openJoin('guest-host')`. Guest-knapparna döljs visuellt när Join-modalen är öppen (`opacity: 0` + `pointerEvents: 'none'`, layout-utrymmet bevaras) så modal-sheetens ovankant inte avslöjar dem bakom.

## Start Game as Guest (Guest Host) — 2026-07-03

Vem som helst — utloggad ELLER inloggad — kan hosta ett spel under en anonym Guest-identitet via Home-knappen **"Start Game as Guest"**. En inloggad user som väljer denna väg spelar som Guest: profilen används INTE som spelidentitet, inga credits dras, ingen Player history skrivs.

**Undantag sedan 2026-08-08 — Remote 1v1 kan ALDRIG hostas som Guest.** Läget är QuizVibe-users-only (se "Remote 1v1 är QuizVibe-users-only"), så guest-panelens Remote Play-rad är låst för utloggade och helt dold för inloggade — plus en ovillkorlig guard i `handleStartGameAsGuestHost`. Alla LOKALA guest-host-spel (Single/PtP/IndDev) fungerar oförändrat enligt beskrivningen nedan; en inloggad user som hostar ett sådant visar sitt Guest alias (`QuizVibe: Anna-42`) på spelarkortet.

**Formulär** (JoinModal-steg `'guest-host'` i [app/index.tsx](app/index.tsx)): delar form-stomme med guest-JOIN-steget (samma state/handlers — PlayerName-split-field med auto-fill `GuestX-1234567` + Check/Auto-generate/Remove, samma Year of birth-picker). Skiljer sig: titel "Start Game as Guest", INGA rumkods-celler (koden genereras vid submit). **Assistance-väljaren delas sedan 2026-08-08** (Peter) — guest host väljer Full/Standard/Minimal precis som en guest-joiner; nivån går vidare som `guestAssistance`-param och seedar host-kortet i LobbyScreen. Den tidigare read-only-rutan "Fixed Guest settings" med "Answer response time: 60s" + "Assistance level: Full" är BORTTAGEN (`modal.guestFixedRow/-Label/-Value` kvar som död CSS) — svarstiden väljs numera i lobbyn, och det enda som fortfarande är fast för guest host är Game era. Submit "Start Game as Guest" (`handleStartGameAsGuestHost`): kör `ensureAuthSession()` FÖRST (anon-signup; abort med Alert vid null — annars no-op:ar `registerActiveRoom` tyst och joiners får "Room not found") → `generateRoomCode` → `registerActiveRoom` (maxPlayers 4, hostIsPremium false, hostPlayerName = guest-namnet så own-lobby-detektering fungerar) → cleanup-bunten → `router.push('/lobby', { code, isHost:'true', guestHost:'true', guestName, guestBirthYear, guestAssistance })`.

**Lobby** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): `isGuestHost = hostMode && guestHost === 'true' && !!guestName?.trim()` driver allt:
- **Host-kortet** seedas från guest-params istället för `SEED_PLAYERS[0]` — behåller `id: '1'` (host-kort-maskineriet antar det), `type: 'guest'` (= signalen non-host-enheter använder för guest-host-detektering), emoji 👤, assistance `'full'`, ålder från guestBirthYear. `mergeProfileIntoHost` är gated på `!isGuestHost` och `setHasPremium` forceras false (dödar premium-auto-beteenden för inloggad premium-user).
- **Seed-effekten** har en `if (isGuestHost)`-gren FÖRE profil-läsningen. Sedan v2 (2026-07-04) läser den `getLobbySettings(roomCode)` async för de guest-VARIABLA fälten (`gameMode`, `singlePlayerDefault`, `roundsCount` clampad till {2,4}, `spotifyEnabled`, samt sedan 2026-08-08 `answerResponseSeconds` clampad till {30,45,60} med **30 som fresh-default**) så "Play Again + keep players" bevarar guest-hostens val (goToNewLobby skriver carry-over-settings till nya koden). Host-kortets `assistance` seedas från `guestAssistance`-paramet (fallback `'full'`). Låsta fält hårdkodas alltid: maxPlayers 4, Sweden, era `[ERA_MIN, ERA_MAX]` (fulla spannet), inga paket, alla source-kategorier ON. `lobbySeededRef` sätts inne i `.then` (debounce-race). Debounce-skrivningen persisterar till `lobby_settings` som vanligt så non-hosts syncar.
- **Dolt/låst UI** (allt på `isGuestHost`, delad not-stil `styles.guestHostNote`): credits-pill + Share invite dolda; era-slidern dold (display-boxen visar spannet + not "change Game era not available for Guest user") — **era är det enda kvarvarande låsta spelinställningen**; Number of Rounds = två val-rutor **2 / 4** i `modeOption`-stil (stepper + RoundsRuler + game-mode quick-select-raden renderas inte) + not "Upto 20 rounds option for registered Quizvibe users with Premium"; Players visar bara Max 4-rutan (+ spacer, Max 12 dold) + not "Upto 12 players option for registered Quizvibe users with Premium"; Host packages visar Generic + "Activate Extra package"-knappen med grå PREMIUM-badge (2026-07-07 — extraPackagesWrapper dold, not "Extra packages only available for registered QuizVibe users with Premium"; tap på Activate → register-popup vars Yes raderar lobbyn via `performLobbyDelete` + öppnar Register-formuläret på Home via `?openRegister=1`).
- **Fria settings sedan 2026-08-08** (Peter): **Answer response time** (30/45/60 — raden renderas som för registrerade hosts; noten "Option to select 30s or 45s not available for Guest user" borttagen) och **Assistance level** (Full/Standard/Minimal — player-edit-sheeten har inte längre ett statiskt "Full"-chip för guest host:s EGET kort; alla kort editeras lika). Nivån följer med hela vägen: Home-formen → `guestAssistance`-param → host-kortets seed → `handleStartGame`:s quiz-param (`turnOrder.find(id === '1')?.assistance`) → `goToNewLobby`:s carry-over (som tidigare forcerade `'full'` på guest-hostens rad).
- **Source Mixerboard LÅST (v2, 2026-07-04)**: alla 10 matris-switchar (All-master, 3 kolumn-masters, YT-rad, Hints-rad) + Spotify Year/Name-togglarna är utgråade (`opacity 0.45`) och pinnade ON för guest host. Switcharna förblir ENABLED (disabled-Switch sväljer tap) men handlers börjar med `if (isGuestHost) { guestLockAlert(); return; }` → Alert "Activation/deactivation only applicable by QuizVibe users Host" + värdet snappar tillbaka (samma mönster som Year/Name-togglarnas min-1-guard). ENDAST Spotify på/av-mastern är guest-valbar (registrerings-trigger). Guest host kan koppla eget Spotify Premium — anon-sessioner har user_id så `spotify_connections`-upserten fungerar.
- **Oförändrat**: Game Mode (alla tre lägen valbara — IndDev-guarden kollar bara non-hosts, så guest HOST i IndDev är tillåtet). Guest-JOIN-guardsen (IndDev-block + Spotify-block för joiners) gäller oförändrat.
- **Game Sequence-preview**: guest host ser `roundsCount` st "?"-slots (`gsRandomMark`-glyf) + not "Sources randomized for Guest games" — previewn kan inte veta den viktade slumpens utfall (sker på host-enheten vid spelstart).
- **`handleStartGame`**: hela credit-blocket (loadProfile + "Sign in required" + gate + deduktion) wrappat i `if (!isGuestHost)`. Quiz-params får `guestHost: String(isGuestHost)` + assistance `'full'`/ålder från guestBirthYear istället för hardcoded `'standard'`/`'32'`.
- **Non-host-detektering** (game-started-navigeringen): `storedHostIsGuest = playersStored.some(p => p.isHost && p.type === 'guest')` → skickas som `guestHost`-param i `router.replace('/quiz')`. Migrations-fritt — registrerade hosts har alltid `type: 'registered'` på host-raden, gamla lobbies resolvar false.

**Quiz/Final Leaderboard** ([app/quiz.tsx](app/quiz.tsx) + [RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx)): `isGuestHostGame = params.guestHost === 'true'` (på non-host-enheter = "spelets host är guest"). `saveFinalGame` skippar `appendGameHistoryEntry` (behåller `saveLatestResult`); `game_completed`-track får `guest_host`.

**Play Again för Guest Host — max 1 replay (v2, 2026-07-04)**:
- **Räknare**: `guestReplays`-param ('0' default) kedjas Home-form → lobby → quiz (`guestReplaysUsed`) → vid Play Again skriver `goToNewLobby` `guestReplays: String(guestReplaysUsed + 1)` till nya lobbyn. BARA host-enheten känner räknaren.
- **Final-footer (omarbetad 2026-08-26 — guest host har VARKEN re-match eller replay)**: host får aldrig re-match-frågan och aldrig en Play Again-knapp. Är enheten inloggad (`hostIsRegisteredUser`) visas enbart **Start New Game**, som dessutom LÄMNAR guest-läget och skapar en vanlig user-lobby; annars enbart **Home**. Noten "Replay only possible 1 time for Guest Hosts" är borttagen och 1-replay-taket finns inte längre. **Non-host i guest-spel**: bara Home — `hostInitiatedPlayAgain` sätts aldrig eftersom hosten inte kan bjuda in, så varken den gyllene eller den dimmade knappen renderas.
- **handlePlayAgain**: dormant sedan 2026-08-08 (se "Play Again approval flow"). Den bar tidigare guest-hostens 1-replay-guard.
- **goToNewLobby guest-gren**: skippar `loadProfile` — hostName från `params.guestName` (fallback turnOrder[0].name), emoji 👤; `registerActiveRoom` med maxPlayers 4/hostIsPremium false/hostPlayerName=guest-namnet; navigation med `guestHost:'true'` + guestName/guestBirthYear (fallback `CURRENT_YEAR − turnOrder[0].age`) + räknaren. **KRITISKT**: carry-over-raderna bär `type` från turnOrder (nytt fält i `TurnOrderPlayer` + båda LobbyScreen-turnOrder-byggena) och host-raden FORCERAS `type:'guest'` — annars bryts non-host-enheternas `storedHostIsGuest`-detektering i omgång 2 (goToNewLobby tvingade tidigare 'registered' på alla rader).

**Slumpade källor i guest-spel (v2, 2026-07-04)** — guest-gren i `gameQuestions`-useMemo (quiz.tsx, före epok-allokeringen):
1. **Spotify 50/50-slant** (IndDev-krav implicit — spotifyEnabled är hårt gated på IndDev): två eligible-fall — **helt** spel när `totalRounds === turnOrder.length` (2-2/4-4, alla frågor ur spotifyPool) eller **partiellt** när 2 spelare + 4 rundor (exakt 2 Spotify-frågor insprängda på slumpade positioner bland viktade dragningar). I båda fallen ger DJ-round-robin varje spelare exakt en DJ-tur. Slanten (50 %) avgör per spel om Spotify alls spelas. Ingen mismatch-popup vid Start Game (borttagen 2026-07-04) — vid icke-eligible kombination (t.ex. 3 spelare/4 rundor) blir spelet tyst Spotify-fritt.
2. **Övriga frågor: viktad OBEROENDE dragning per fråga** över 6 celler: YT-Music 15 %, YT-Film 5 %, YT-Sport 5 %, Hints-Music 25 %, Hints-Film 20 %, Hints-Sport 30 %. Dedupe mot picked-Set + viktrenormalisering över icke-tomma celler; fallback till samlad pool utan dedupe om allt uttömt. IndDev-korrekthet krävs bara på host-enheten (non-host renderar broadcast question_ids via ALL_QUESTIONS_MAP).

## Home — pulserande tagline

Tre taglines som cross-fadar under brand-loggan på Home-skärmen ([app/index.tsx](app/index.tsx)): `"Challenge yourself. Play together."` → `"Invite Friends. Socialize."` → `"Music. Film. Sport."`. Module-level `TAGLINES`-array driver array av per-text Animated.Value (initierad så index 0 startar på opacity 1). Cycle var 6000ms: parallell `Animated.parallel`-fade där nuvarande text fadar till 0 och nästa till 1, duration 2600ms med `Easing.bezier(0.4, 0, 0.2, 1)` (Material Design standard ease — mjuk accel/decel). useNativeDriver: true så opacity körs på native-tråden. Render: alla TAGLINES alltid renderade i samma wrap (`alignSelf: 'stretch'` + `position: 'relative'`), index 0 i flow definierar wrap-höjden, index 1+ är absolut-positionerade ovanpå via `taglineOverlay` så de delar exakt samma position. Cycle-loop använder `taglineIdxRef` för att spåra current index över React-renders utan att triggera re-renders.

## FAQ — Profile + Home-länk

[src/screens/FAQScreen.tsx](src/screens/FAQScreen.tsx) renderar en dubbel-nestad accordion (8 kategorier × 3-5 Q&As totalt ~33 entries) på engelska: Getting started, Game modes, Connection & Individual Devices, Generations & content, Host Game Credits, Premium subscription, Account & privacy, Region. Båda toggle-nivåer default-kollapsade — user tappar kategori → ser Q-lista → tappar Q → ser A. State: `expandedCategories: Set<string>` + `expandedQuestions: Set<string>`. Back-routing via `?from=`-param speglar Store-screens mönster (router.canGoBack() först, sedan explicit replace mot from-path, sista utväg Home).

[app/faq.tsx](app/faq.tsx) är thin re-export. Två entry-points till FAQ:n:
- **Profile → Legal-sektionen** ([ProfileScreen.tsx:1716](src/screens/ProfileScreen.tsx#L1716)): tredje länk-rad efter Privacy Policy + Terms of Service, navigerar via `router.push('/faq?from=/profile')`.
- **Home footer** ([app/index.tsx:1985](app/index.tsx#L1985)): plain "Help" → bytt till tappbar "FAQ"-länk (underlined, textPrimary), navigerar via `router.push('/faq?from=/')`. Säkerställer att logged-out users också når FAQ:n innan de registrerar sig.

## Host Game Credits — gate på Create Game + Play Again

[`refreshFreeCreditsIfNeeded` i src/utils/profileStorage.ts](src/utils/profileStorage.ts) top-up:ar `freeGameCredits` upp till `FREE_CREDITS_DAILY_CAP = 4` vid första `loadProfile()` efter midnatt CET (icke-destruktiv: saldo ≥ cap lämnas orört). Det innebär att flödet `loadProfile() → kontrollera saldo` alltid jämför mot färska värden inkl. dagens refresh.

**Fyra gates som blockerar host:s spelstart vid Free = 0** (Extras borttagna 2026-07-07; alla gates skippas för Premium via `hasPremiumSubscription()` och för guest host; samma copy + Store-deeplink `focus=subscription` för konsistent UX):
1. **Home — `handleCreateGame`** ([app/index.tsx](app/index.tsx)): async, läser fresh `loadProfile()`, blockerar med `Out of Host Game Credits`-Alert (Cancel + Go to Store → `/store?focus=subscription&from=/`) om `freeGameCredits === 0`. Fångar tom-saldo INNAN lobby skapas.
2. **Profile — `handleCreateGame`** ([src/screens/ProfileScreen.tsx](src/screens/ProfileScreen.tsx)): Create Game-genvägen i logout-sheet:n, inlinad kopia av Home-gaten (→ `from=/profile`).
3. **Lobby — `handleStartGame`** ([src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): samma gate vid Start Game-tap. Detta är där credit-deduktionen FAKTISKT sker (1 Free-credit konsumeras). Backup-gate om host kommit förbi Home-gaten via Play Again eller direkt-nav.
4. **Quiz — `handlePlayAgain`** ([app/quiz.tsx](app/quiz.tsx)): async, läser fresh `loadProfile()` FÖRE re-use-players-prompten så user inte fyller i alerts först och sedan blockas i Lobby:n. **Verifierar** bara saldot — drar INGA credits här. Deduktionen sker först när host trycker Start Game i Lobby (samma flöde som Home → Create Game → Lobby → Start Game).

Alla använder identisk Alert-copy ("You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium...") + samma Store-deeplink. `handlePlayAgain` pushar Store **utan** `from=...`-paramet så Store:s Back-knapp faller till `router.back()` istället för `router.replace(from)` — det bevarar /quiz på root Stack:en med Final Leaderboard-state intakt även efter köp + auto-back via `handleBack`-callback i success-Alert:en.

## Security hardening (review 2026-07-04)

Säkerhetsgranskning (RLS, Edge Functions, klient-trust, input-validering) → åtgärdade Nivå 1–2. Kvarstår: Realtime broadcast-authorization (server, Nivå 1) + server-side scoring/credits/premium-authority (Nivå 3) — se punktlistan sist i denna sektion.

**Email-enumereringsfix** (migration `0022_player_name_lookup_hardening.sql`): den gamla RPC:n `lookup_email_by_player_name(text)` var grantad till `anon`+`authenticated` och gav en users email givet deras (öppet synliga) PlayerName. Fix:
- **Del 1**: ny boolean-RPC `player_name_exists(text)` för uniqueness-check (Register + Add Player behöver bara "finns namnet?", ingen email). Klient: `playerNameExists()` i [profileStorage.ts](src/utils/profileStorage.ts) ersatte `lookupEmailByPlayerName`.
- **Del 2**: `REVOKE EXECUTE` på email-RPC:n från klient-roller. Login-via-PlayerName går nu server-side via ny Edge Function **`login-by-name`** ([supabase/functions/login-by-name/index.ts](supabase/functions/login-by-name/index.ts)) — slår upp email med service-role, kör `signInWithPassword`, returnerar BARA session-tokens (email:en når aldrig klienten). Generiskt `invalid_credentials` för både "namnet finns inte" och "fel lösenord" (anti-enum). Klient: `signInWithPlayerName()` i [auth.ts](src/utils/auth.ts), anropas från `handleLogin` i [app/index.tsx](app/index.tsx).
- **KRITISK appliceringsordning**: kör 0022 DEL 1 → deploya login-by-name + shippa klient-build → kör 0022 DEL 2 (REVOKE). REVOKE före Edge Function/klient bryter login.

**PlayerName-format CHECK på DB-nivå** (migration `0023_player_name_check_constraints.sql`): `profiles.player_name` + `lobby_players.name` saknade CHECK — en moddad klient kunde skriva emoji/10k-tecken/RTL/HTML rakt in. Speglar `PLAYER_NAME_FORMAT_RE` (`^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$`) som DB-CHECK. `NOT VALID` så migrationen aldrig failar på gammal data (nya INSERT/UPDATE enforced; kör `validate constraint` senare om retroaktiv koll önskas).

**Invite-spam rate-limit** (migration `0024_waiting_invites_rate_limit.sql`): `waiting_invites` INSERT var `with check (true)` utan tak. Fix: (1) ny kolumn `from_user_id` = trusted avsändar-identitet satt server-side från `auth.uid()` i `set_invite_to_user_id`-triggern (klient-satt `from_player_name` är spoofbart); `ON DELETE CASCADE`. (2) `BEFORE INSERT`-trigger `enforce_invite_rate_limit()` (security definer — SELECT-RLS blockerar annars avsändaren från att räkna sina egna rader) nekar när avsändaren har ≥50 invites inom rullande 1h. Accepterade invites raderas → faller ur räkningen, så legitima hosts ackumulerar knappt något. Klient oförändrad: `addInvite` loggar bara icke-23505-fel som warning (AsyncStorage-fallback kvarstår).

**Broadcast-payload-validering** ([syncChannel.ts](src/lib/realtime/syncChannel.ts)): alla ~20 event-typer castades tidigare rått (`payload as XPayload`) utan runtime-koll över den oautentiserade `quiz_sync`-channeln. Nu går varje event genom en hand-rullad validator (ingen zod → bundle-lean): strukturell typkoll + range-check; ogiltiga payloads droppas + loggas. Nyckelchecks: `question_index` heltal ≥0 under sanity-cap; `timer_start_at` förkastas om >±60s från `Date.now()` (legit är ~+10.5s framåt — audit-förslagets ±5s hade brutit flödet); enums (`response_seconds ∈ {30,45,60}`, `answer_type`); `points`/`time_used`/`correct_year` i rimliga intervall. Valfritt `isKnownSender`-predikat (wire:at från [quiz.tsx](app/quiz.tsx) via `turnOrderIdSetRef`, fail-open tills roster populerats) droppar player-id-bärande events (`player_left`/`player_score_recorded`/`player_answer_confirmed`/`player_approved_play_again`) med okänt id. **Avgränsning**: stoppar forged/okända ids + malformed payloads, men INTE en angripare som använder ett riktigt player_id — full sender-auth kräver Supabase broadcast-authorization (kvar).

**Migrations appliceras manuellt** via Supabase SQL Editor (samma flöde som övriga). Edge Function login-by-name: kom ihåg dashboard-fällan (klistra kod i Code-fliken + re-deploy efter create).

**Kvarstående säkerhetsbacklog** (ej åtgärdat): Realtime broadcast-authorization (server-side sender-auth); `game_sessions` SELECT `using(true)` → strama till deltagare; `lobby_players` INSERT `with check(true)` → blockera cross-user-injection; CAPTCHA på join/signup (rumkod-brute-force ~25-bit); per-(avsändare,mottagare) invite-tak + rum-skapande-rate-limit; server-side scoring/credits/premium-authority (idag klient-auktoritativt — svar ligger i bundlen, credits i AsyncStorage, premium togglingsbart).

## EAS Update (OTA) — content-fixar utan App Store (2026-08-27)

`expo-updates` installerat (`~29.0.20`) så innehålls-rättningar (YouTube-klipp som tagits ner, `startSec`/`correctYear`-fixar, paket-taggar — allt som redan går genom `npm run export-music-questions`/`export-image-questions` till ren JS i `src/utils/*Questions.ts`) kan pushas **utan** ny App Store-build. Fram till nu var varje sådan fix låst till nästa native-release eftersom katalogen bakas in i bundlen vid byggtid.

**Config** ([app.json](app.json)): `updates.url` pekar på `https://u.expo.dev/<projectId>`. `runtimeVersion.policy = "fingerprint"`.

**Policy-valet är `fingerprint`, INTE `appVersion` — motiverat val, ändra inte utan att läsa detta.** `appVersion` hade knutit runtimeVersion till det manuella `version`-fältet i `app.json` (`1.0.0`, oförändrat av `autoIncrement` — den bumpar bara iOS build number). Risken: någon lägger till/uppdaterar ett native-paket (RevenueCat, WebView, YouTube-iframe-lib, SVG, Haptics, Speech, AsyncStorage — se listan i `package.json`) utan att komma ihåg att manuellt höja `version`, och en OTA-update med den nya JS:en skickas ut till gamla native-builds som saknar den nya native-koden → krasch. `fingerprint` eliminerar den mänskliga glömska-risken helt: EAS Build hashar det faktiska native-projektet (dependencies med native kod + config plugins) automatiskt vid varje build, så ett native-paket-byte ger AUTOMATISKT en ny runtimeVersion utan att någon behöver komma ihåg något. Verifierat 2026-08-27: `npx expo-updates fingerprint:generate --platform ios` gav lokalt hash `885fa42f7f6e502aa6a67d8e3ee5a9da20db4136`, och en riktig EAS-build (`18c16984-bf54-492a-be90-dcfecc275943`, preview-profil) rapporterade **exakt samma** Runtime Version — bekräftar att policyn round-trippar korrekt.

**Channels** ([eas.json](eas.json)): `build.preview.channel = "preview"`, `build.production.channel = "production"`. `development`-profilen har medvetet ingen channel — dev-client-builds läser JS live från Metro, inte från ett EAS Update-branch. En `eas update`-publicering måste peka på samma channel/branch som builden konsumerar (`--branch preview` eller `--branch production`).

**Publiceringsflödet för en innehållsrättning** (t.ex. ett YouTube-klipp som `youtube-validate`-cronen flaggat som borttaget):
```bash
# 1. Redigera YAML-katalogen
#    backend/content/catalog/*.yaml

# 2. Regenerera klient-JS
npm run export-music-questions     # eller export-image-questions

# 3. Sanity-testa lokalt (Metro, ingen EAS behövs)
npm start

# 4. Publicera OTA till den channel byggena lyssnar på
npx eas update --branch production --message "Fix: ersatt dött YouTube-klipp for <item-id>"
```
Ingen `eas build`, ingen App Store-granskning. Träffar installerade appar inom minuter (appen pollar för updates vid start).

**⚠ Vad som KRÄVER ny native build i stället för OTA** — allt som ändrar det native-projektets fingerprint eller Apple-granskade beteende:
- Nytt/uppdaterat native-paket (`react-native-purchases`, `react-native-webview`, `react-native-youtube-iframe`, `react-native-svg`, `expo-haptics`, `expo-speech`, `@react-native-async-storage/async-storage`, eller något annat paket med native kod).
- Ändringar i `app.json`s native-relevanta fält (`ios.*`, `android.*`, `plugins`, bundle identifier, permissions/Info.plist-nycklar).
- Native config-filer, Xcode-projektinställningar, om `ios`/`android`-mapparna någonsin genereras via `expo prebuild` (managed workflow idag — prebuild sker bara i CI).
- Ändringar av appens FUNKTION/SYFTE i Apples mening (nya betalflöden, nya huvudfunktioner) — Apple tillåter OTA för buggfixar och innehåll, INTE för att kringgå App Store-granskning av ny funktionalitet. Ren katalog-/textinnehåll (frågor, klipp-ID:n, taggar) är alltid säkert; UI-logikändringar som förändrar spelmekanik bör gå via ny build tills vidare (gråzon, inte testad mot Apples policy).
- Med `fingerprint`-policyn behöver du INTE manuellt hålla reda på detta — ett native-paketbyte genererar automatiskt en ny runtimeVersion vid nästa `eas build`, och den builden slutar automatiskt ta emot OTA-updates avsedda för den gamla fingerprinten. Risken som återstår är att glömma köra en ny build alls (appen fastnar på gammal native-kod) — inte att en felaktig OTA skickas till fel build.

**⚠ TestFlight-builds har historiskt haft JS inbäddad från byggtid** (se `CLAUDE.md`s äldre noter om Spotify/RevenueCat-Expo Go-flöden) — med `expo-updates` installerat och `updates.url` konfigurerat ändras det: en TestFlight/App Store-build hämtar numera OTA-updates från sin channel vid appstart (och periodiskt), precis som en produktions-app. **Verifiera detta explicit efter nästa TestFlight-upload**: installera builden, publicera en trivial OTA-update (t.ex. en kommentar-ändring som triggar en export), döda och starta om appen, och bekräfta i `eas update:view` att builden faktiskt hämtat den nya updaten (`runtimeVersion`-match + update-ID i klientens loggar). Är det inte verifierat är hela uppsättningen overifierad i praktiken.

**Första native-bygget måste ändå gå via App Store.** OTA fungerar bara för builds som redan har `expo-updates` inbyggt och pekar på rätt channel — det finns inget att uppdatera förrän en build med den här konfigurationen finns i TestFlight/App Store. Planera in den här releasen som en vanlig native-build, INTE som något som kan skippas.

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

`backend/`-projektet har egna scripts: `npm test` (vitest, 224 gröna + 3 skipped), `npm run validate` (parsea katalog), `npm run export-music-questions` (regenererar [src/utils/musicQuestions.ts](src/utils/musicQuestions.ts) från `songs-*.yaml`), `npm run export-image-questions`, `npm run wikimedia-search <id>`, `npm run wikimedia-process <id>`, `npm run youtube-search <id>` / `-- --query "..."` (curator-suggest med scoring), `npm run youtube-validate` (validerar alla `youtubeClips` mot Data API — kör även nightly via GitHub Actions), `npm run demo` (skriver ut Letter Grid-output i konsolen).

Image-validerings-scripten är **raderade 2026-08-17** tillsammans med bild-assetsen — se "⚠ Bild-assets är RADERADE" ovan. Kvar av katalog-tooling: `npx tsx scripts/batch-park-items.ts` (remove/park items i YAML) och `node scripts/_fix-mojibake.js` (reparera dubbelkodad text).
