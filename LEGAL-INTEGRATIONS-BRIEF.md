# QuizVibe — Underlag till affärsjurist: tredjepartsintegrationer i Version 1 (YouTube, Spotify)

**Datum:** 2026-07-05
**Status:** Appen är i pre-launch (iOS-only, App Store). Detta dokument beskriver **endast Version 1-scope** — det som faktiskt ingår i lanseringen.
**Syfte:** Ge juristen en teknisk och affärsmässig helhetsbild av hur QuizVibe V1 använder tredjepartsinnehåll och tredjeparts-API:er, vilka efterlevnadsåtgärder som är byggda, samt vilka frågor vi vill ha juridisk bedömning av — framför allt gentemot YouTube och Spotify.

**Uttryckligen UTANFÖR V1-scope** (finns delvis som kod/tillgångar i projektet men aktiveras inte i lanseringen; separat juridisk genomgång görs om/när de blir aktuella):
- Fotobaserade frågor med bilder från Wikimedia Commons eller liknande källor.
- Spotify-albumomslag och Spotify Connect-styrning (play/pause via Web API).
- Köpbara engångs-credits — V1 säljer endast Premium-abonnemang.

---

## 1. Sammanfattning

QuizVibe är en mobil quiz-app (React Native/Expo) där spelare gissar årtal eller namn utifrån media och ledtrådar. **Inget tredjepartsinnehåll lagras, laddas ner eller distribueras av oss** — allt spelas upp via respektive plattforms officiella, publika kanaler:

| Källa i V1 | Vad | Hur det når spelaren |
|---|---|---|
| YouTube | Musikvideor, filmtrailers, sportklipp (~400–500 kuraterade klipp) | Officiell inbäddad spelare (IFrame Player API) i appen |
| Spotify | Låtar (~90 kuraterade spår-ID:n) | Uppspelning sker i **användarens egen Spotify-app** på användarens eget Premium-konto — aldrig i QuizVibe |
| Wikidata + egen kuratering | Faktauppgifter (födelseår, klubbhistorik, utmärkelser m.m.) som driver textbaserade "Hints"-frågor | Renderas som egna ledtrådstexter i appen; bildelementet är en landsflagga (standard-emoji), inga fotografier |
| Egen produktion | Frågetexter, ledtrådstexter, UI, all grafik | — |

**Affärsmodellen tar inte betalt för tredjepartsinnehåll.** Alla frågetyper (YouTube, Spotify DJ, Hints) är tillgängliga i gratisversionen. Det enda köpet i V1 är ett **Premium-abonnemang** som avser värdskapskapacitet: obegränsat antal spel som värd, fler rundor (upp till 20), fler spelare (upp till 12). Gratisanvändare kan hosta ett begränsat antal spel per dag och delta obegränsat i andras spel. Spotify-funktionen kräver att användaren har ett eget Spotify Premium-konto — det är Spotifys krav på deras sida, inte en QuizVibe-betalvägg.

---

## 2. YouTube-integrationen

### 2.1 API:er som används

1. **YouTube IFrame Player API** (klient, i appen) — via biblioteket `react-native-youtube-iframe` v2.4.1. Detta är YouTubes officiella inbäddningsspelare i en WebView. Videon streamas direkt från YouTube till användarens enhet; QuizVibe proxar, cachar eller lagrar aldrig video/ljud.
2. **YouTube Data API v3** (endast backend/kuratering, aldrig i användarappen) — `search.list` och `videos.list` används av interna kurateringsverktyg för att hitta klipp, verifiera att de är inbäddningsbara (`embeddable`, `syndicated`) och köra nattlig validering. API-nyckeln finns bara server-side/CI, aldrig i app-bundlen.

### 2.2 Spelflöde (YouTube-fråga)

1. Frågan startar → den inbäddade YouTube-spelaren visas i full storlek (hela bredden, 220 px hög) och spelar klippet.
2. Spelaren är **synlig under hela uppspelningen** — vi lägger aldrig något lager ovanpå den (se 2.3).
3. Spelaren svarar (årtal via tidslinje-väljare) medan klippet spelar; svarstimer 30–60 s.
4. Klippet spelar **klart i sin helhet** — vi klipper inte av videon när svarstiden går ut. En kuraterad starttid (`startSec`) används ibland för att hoppa förbi intro-titelkort som annars skulle avslöja svaret; detta ändrar inte videon, det väljer bara var uppspelningen börjar (en officiell parameter i IFrame-API:t).
5. Först när YouTube-spelaren själv rapporterar `ended` (videon spelat klart) ersätts spelaren av en QuizVibe-logotyp. Vi triggar aldrig detta själva.

### 2.3 Efterlevnadsåtgärder som är implementerade

- **Inga overlays på spelaren.** Ett internt "spoiler-mask"-system (för att dölja svarsavslöjande text i videor) byggdes och **revs samma dag** (2026-05-29) efter att vi konstaterade att YouTubes Developer Policies förbjuder att skymma eller störa spelaren. Svarsavslöjande innehåll hanteras i stället genom kuratering: välj annat klipp, annan starttid, eller gör frågan till en annan frågetyp.
- **YouTube-branding synlig under hela uppspelningen** (logotyp, bottenrad). Spelarhöjden höjdes t.o.m. från 200 till 220 px specifikt för att bottenraden inte skulle klippas.
- **Officiell YouTube-varumärkesikon** (röd play-knapp) enligt YouTube Branding Guidelines används där YouTube omnämns som källa i UI:t; SVG-pathen från YouTube Brand Resources är oförändrad (ingen omfärgning eller formändring).
- **Endast inbäddningsbart innehåll**: server-side-filter på `embeddable` + `syndicated` vid kuratering. Klipp från kanaler som blockerar inbäddning på innehållsägarnivå (t.ex. FIFA) har tagits bort efter manuell test.
- **Kurateringspolicy för musik**: endast officiella källor — officiell musikvideo, officiell studio-audio via auto-genererade "- Topic"-kanaler, eller lyric-video över den officiella inspelningen. Inga covers, tributes, demos. Re-uploads (icke-rättsinnehavares uppladdningar) undviks och bevakas.
- **Nattlig automatisk validering** (GitHub Actions-cron): varje natt valideras samtliga klipp mot Data API:t — klipp som tagits ner (t.ex. via copyright-claim) eller blockerats flaggas och ersätts. Detta är vår mekanism för att aldrig peka på nedtaget/omtvistat innehåll.
- **Felhantering i klienten**: om YouTube returnerar embed-fel (felkod 100/101/150 = borttagen/embed-blockerad video) visas "Video unavailable" och frågan hoppas över — vi försöker aldrig kringgå blockeringar.
- **Ingen nedladdning/cachning** av något YouTube-innehåll, ingen bakgrundsuppspelning, ingen ljud-extraktion.
- **Inga annonser** visas i appen över huvud taget, alltså heller inte i närheten av spelaren.
- **Kvot- och nyckelhantering**: Data API-nyckeln används endast i backend-verktyg och CI (repo secret), aldrig i distribuerad app.

### 2.4 Punkter vi vill ha juristens bedömning av (YouTube)

1. **Monetariseringsregeln.** YouTube API Services ToS förbjuder att sälja åtkomst till YouTube-innehåll eller placera det bakom betalvägg. I V1 är modellen: allt YouTube-innehåll tillgängligt i gratisversionen; det enda köpet är ett Premium-abonnemang som avser värdskapskapacitet (obegränsat värdskap, fler rundor, fler spelare) — inga engångs-credits säljs. Vår tolkning är att detta är compliant eftersom abonnemanget inte ger tillgång till något innehåll som gratisanvändare saknar, endast spelmekanisk kapacitet. Vi vill ha den tolkningen bekräftad.
2. **`controls: false`.** Vi använder den dokumenterade IFrame-parametern `controls=0` (spelarens kontrollrad döljs — spelaren ska inte kunna scrubba/pausa mitt i en tävlingsfråga). Parametern är officiellt dokumenterad i IFrame-API:t, men vi vill ha bekräftat att detta inte krockar med kravlistan "Required Minimum Functionality" i API-villkoren för vår användningstyp.
3. **Autoplay.** Uppspelning startar automatiskt när frågan börjar (initialt mutad där iOS kräver det, därefter ljud på). Bedömning önskas om autoplay-upplägget är förenligt med policies.
4. **En planerad "YouTube ToS-audit" ligger i vår pre-launch-checklista** — juristens genomgång kan med fördel utgöra den.

---

## 3. Spotify-integrationen (V1-scope)

### 3.1 Arkitekturens kärnprincip

**QuizVibe spelar aldrig upp Spotify-ljud.** All uppspelning sker i användarens egen Spotify-app, på användarens eget Premium-konto. QuizVibe har ingen Spotify-SDK för uppspelning, streamar inget ljud och tar inte betalt för Spotify-funktionen.

I V1 är Spotify-beröringen medvetet minimal — två saker och inget mer:

1. **Kontoverifiering via OAuth** — bekräfta att DJ-spelaren har ett eget Spotify Premium-konto.
2. **Deep link** — öppna låten i användarens egen Spotify-app.

**Ingår INTE i V1** (finns som kod i projektet men aktiveras inte): hämtning av albumomslag/spårmetadata via Web API, samt Spotify Connect-styrning (pausa/återuppta via `PUT /me/player/...`). Låttitel och artist som visas vid facit kommer från **vår egen kuraterade fråge-katalog**, inte från Spotifys API. Innan lansering trimmas OAuth-scopes i koden till att endast omfatta det V1 använder (kontoverifiering); playback-relaterade scopes tas bort.

### 3.2 API:er och tekniska komponenter i V1

1. **OAuth 2.0 Authorization Code + PKCE** (utan client secret i appen) via systemwebbläsare. Registrerad redirect-URI: `quizvibeapp://spotify-callback`.
   V1-scopes: `user-read-private` (läsa Premium-status via `/v1/me`) samt `user-read-email` (visa användarens e-post i connect-bekräftelsen). Scope `app-remote-control` används medvetet **inte** — den kräver Spotifys explicita produktionsgodkännande och behövs inte i vår arkitektur.
2. **Spotify Web API — ett enda anrop**: `GET /v1/me` för att verifiera `product === 'premium'`. Utan Premium tillåts inte DJ-rollen.
3. **Deep link** `spotify:track:<id>` (via operativsystemets `Linking`, inte något Spotify-API) — öppnar Spotify-appen och startar låten där. Fallback till webb-URL om appen saknas.
4. **Tokenlagring**: OAuth-tokens sparas i vår databas (Supabase, tabell `spotify_connections`) med Row Level Security — varje användare kan bara läsa sina egna tokens.

### 3.3 Spelflöde (Spotify-fråga, endast läget "Individual Devices")

1. En spelare per runda utses till **DJ** (roterande, deterministiskt). DJ:n måste ha kopplat sitt eget Spotify Premium-konto.
2. DJ:n trycker "Start track in Spotify" → deep link öppnar Spotify-appen som spelar låten där. DJ:n svarar inte på frågan (0 poäng den rundan).
3. Övriga spelare ("gissarna") ser i QuizVibe: årtalsväljare/svarsalternativ, timer och en statusrad — **inget innehåll hämtat från Spotify**.
4. Efter frågan pausar DJ:n låten i Spotify-appen och går manuellt tillbaka till QuizVibe.
5. Vid facit visas rätt år + låttitel/artist som text ur vår egen katalog.

### 3.4 Varumärkes-efterlevnad

- Egen `SpotifyBrandIcon`-komponent med tre varianter enligt Spotify Design & Branding Guidelines: den gröna ikonen används endast mot svart/vit bakgrund; på appens mörka tema används vit monokrom variant.
- Spotify-namn och -ikon används endast för att identifiera funktionen ("Spotify DJ"), inte i marknadsföring som antyder partnerskap.

### 3.5 Status i Spotify Developer Dashboard

- Appen är registrerad (Client ID finns), redirect-URI registrerad.
- **Development mode**: max 25 whitelistade testanvändare. Innan lansering krävs ansökan om utökad kvot ("Extended Quota Mode"), vilket innebär att Spotify själva granskar appen mot sina policies.

### 3.6 Punkter vi vill ha juristens bedömning av (Spotify) — **HÖGSTA PRIORITET**

1. **Spotifys Developer Policy innehåller en uttrycklig restriktion mot spel/trivia/quiz-funktionalitet** byggd på Spotify-plattformen. Detta är den enskilt viktigaste frågan i hela dokumentet. V1-arkitekturen är medvetet byggd för att minimera beröringen: uppspelningen sker i Spotifys egen app på användarens eget konto (deep link är inte ett API-anrop), och den enda API-användningen är kontoverifiering (`GET /v1/me`) — inget Spotify-innehåll (ljud, omslag, metadata) hämtas eller visas i QuizVibe. Frågan till juristen: faller redan OAuth-kopplingen + Premium-verifieringen i quiz-kontext under restriktionen, eller är V1-upplägget hållbart? Behöver vi Spotifys explicita godkännande, omdesign (t.ex. deep link helt utan kontokoppling) eller ska funktionen utgå?
2. **Extended Quota-ansökan**: bedömning av hur funktionen bör beskrivas i ansökan, och risken att den avslås — samt vad en avslagsplan innebär för lanseringen (funktionen är frivillig och kan stängas av utan att resten av appen påverkas; den är gated bakom en host-toggle).
3. **Tokenhantering/GDPR**: OAuth-tokens och Premium-status lagras hos oss (EU-region, RLS-skyddat). Ska nämnas i Privacy Policy — verifiera att nuvarande skrivning täcker det.

---

## 4. Hints-frågor (egen produktion + Wikidata)

Personfrågorna i V1 är **textbaserade ledtrådsfrågor**, inte bildfrågor: en landsflagga (standard-emoji, successivt avtäckt) + upp till 15 progressiva text-ledtrådar per person (yrke, födelseort, karriärfakta, kända verk osv.). Ledtrådarna är egenformulerade; faktaunderlaget kommer dels från egen kuratering, dels från **Wikidata** (CC0-licensierad öppen data). Rena fakta saknar upphovsrättsskydd; ev. EU-databasrättsaspekt (sui generis) kan noteras men bedöms som låg risk givet CC0-licensieringen.

Fotobaserade personfrågor (bilder från Wikimedia Commons) ingår **inte** i V1 — de är parkerade i väntan på separat juridisk genomgång och tas upp i eget underlag om de blir aktuella i en senare version.

---

## 5. Affärsmodell i V1 i förhållande till tredjepartsinnehåll

Central designprincip: **vi säljer aldrig åtkomst till tredjepartsinnehåll.**

- **Gratisnivån** innehåller alla frågetyper och allt innehåll: YouTube-frågor, Spotify DJ (med eget Spotify Premium-konto), Hints-frågor. Gratisanvändare kan hosta ett begränsat antal spel per dag och **delta** obegränsat i andras spel.
- **Enda köpet i V1: Premium-abonnemang** (månadsvis, via Apple In-App Purchase / RevenueCat). Ger obegränsat värdskap, upp till 20 rundor och upp till 12 spelare. Allt avser spelmekanisk kapacitet — inget innehåll är exklusivt för Premium.
- **Inga köpbara engångs-credits i V1.** (Fanns i en tidigare design; borttaget ur lanseringsscope.)
- **Inga köpbara innehållspaket i V1.** (Kuraterade temapaket är en möjlig framtida funktion och bedöms juridiskt separat innan de införs.)
- Inga annonser i appen.

---

## 6. Prioriterad frågelista till juristen

1. **[Spotify — kritisk]** Faller V1-upplägget (uppspelning via deep link i Spotifys egen app; API-användning begränsad till Premium-verifiering via `GET /v1/me`; inget Spotify-innehåll visas i appen) under Developer Policy-förbudet mot spel/trivia/quiz? Behövs Spotifys godkännande, omdesign eller avveckling av funktionen?
2. **[YouTube — hög]** Bekräfta att V1-monetariseringen (allt innehåll gratis; enda köpet är ett Premium-abonnemang för värdskapskapacitet) är förenlig med API Services ToS monetariseringsregler.
3. **[YouTube — medel]** `controls=0` + autoplay: förenligt med Required Minimum Functionality/policies för vår användning?
4. **[Generellt]** Behöver ToS/Privacy Policy uppdateras för att uttryckligen beskriva YouTube-inbäddning och Spotify-kontokoppling (tokens, Premium-status)?

---

## Bilaga: tekniska referenspunkter i kodbasen

| Område | Fil |
|---|---|
| YouTube-spelare (inbäddning, autoplay, start-param, ended-overlay) | `src/components/MediaPlayer/YouTubeMediaPlayer.tsx` |
| YouTube-kuratering/validering (Data API, embeddable-filter, scoring) | `backend/youtube/{client,scoring,suggest,validate,autofix}.ts` |
| Nattlig klippvalidering | `.github/workflows/youtube-validate-nightly.yml` |
| YouTube-varumärkesikon | `src/components/YouTubeBrandIcon.tsx` |
| Spotify OAuth/PKCE + Premium-verifiering | `src/lib/spotify.ts` (scopes trimmas till V1-scope före lansering) |
| Spotify deep link + DJ-rotation | `src/utils/spotifyDJ.ts` |
| Spotify-varumärkesikon | `src/components/SpotifyBrandIcon.tsx` |
| Tokenlagring (RLS) | `supabase/migrations/0015_spotify_connections.sql` |
| Hints-data (egen kuratering + Wikidata) | `src/utils/hintsData.ts`, `backend/scripts/fetch-hints-data.ts` |
| Privacy Policy / ToS | `docs/legal/{privacy,terms}.md` (publicerade via GitHub Pages) |
