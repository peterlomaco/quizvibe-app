# QuizVibe Backend

Backend-koden för QuizVibe — börjar som en **content-katalog** för fas 1 (innehållslistor per generation × kategori). Image-genererings-pipelinen, admin-flow och spelar-API kommer in steg för steg.

## Vad finns här just nu?

```
backend/
├── content/
│   ├── catalog/                # YAML-filer med innehållslistor
│   │   ├── persons-*.yaml
│   │   ├── capitals-*.yaml
│   │   └── artists-*.yaml
│   ├── schema.ts               # Zod-schema för katalog-filerna
│   ├── registry.ts             # Läser och validerar alla YAML-filer
│   └── test/
│       └── schema.test.ts      # Tester
├── package.json
└── tsconfig.json
```

## Kom igång

```bash
cd backend
npm install
```

### Validera att alla YAML-filer parsar korrekt

```bash
npm run validate
```

Skriver ut alla filer som lästs in. Felmeddelanden pekar ut exakt rad/fält när något är fel.

### Köra tester

```bash
npm test
```

### Demo: visa namn-svarsmodellen i aktion

```bash
npm run demo
```

Kör en exempel-fråga (Avicii som rätt svar för Millennials, intermediate skill) och skriver ut Letter Grid + Final Selection i konsolen.

## Hur lägger jag till en ny item?

1. Hitta rätt fil i `content/catalog/`. Filerna är namngivna efter målgrupp.
2. Lägg till ett nytt block i `items:`-listan:

   ```yaml
   - id: nya-personen                              # kebab-case, unik inom filen
     displayName: "Nya Personen"                   # som det visas i appen
     correctYear: 1985                             # rätt svar i timeline-frågan; krävs om "timeline" är med i answerMethods
     probability: 90                               # 0-100, sannolikhet att målgrupp svarar rätt
     wikimediaSearchHints: ["Nya Personen"]       # söktermer för Wikimedia
     answerMethods: ["timeline", "name-letters"]  # vilka svarsmetoder som är giltiga
     notes: "Valfri kommentar"                     # frivilligt
   ```

3. Kör `npm run validate` för att kontrollera att allt parsar.
4. Kör `npm test` för att köra tester.

## Hur hanteras dubbletter?

Vissa motiv är kända för flera generationer (t.ex. Zlatan för både Millennials och Gen Z). De listas i båda filerna med samma `id`. Registry:n tolererar detta över filer; bara inom en fil måste id vara unikt.

## Kategori- och audience-tagging

`category` (kategori): `persons` | `capitals` | `artists`

`audience` (målgrupp): array av en eller flera generationer (eller `'all'`).

Fem generations-grupper enligt QuizVibes namn-svarsmodell:

| Värde         | Betyder                                              | Födelseår   |
| ------------- | ---------------------------------------------------- | ----------- |
| `elder`       | Silent Generation + Baby Boomers (ihopslagna)        | 1925-1964   |
| `gen-x`       | Generation X                                         | 1965-1980   |
| `millennials` | Millennials                                          | 1981-1996   |
| `gen-z`       | Generation Z                                         | 1997-2012   |
| `gen-alpha`   | Generation Alpha                                     | 2013-2028   |
| `all`         | Baseline — relevant för alla generationer            | —           |

**Varför "elder" istället för "silent" + "baby-boomers"?**
I namn-svarsmodellen mäts "generations-avstånd" mellan spelare och motiv för
att avgöra om Letter Grid ska visa prefix eller hela namn. Silent + Boomers
fungerar som en enskild kunskaps-grupp i den mätningen.

## answerMethods — svarsmetoder per item

`answerMethods` är en array som anger vilka svarsmetoder ett item stödjer.

| Värde            | Betyder                                                       | Krav                  |
| ---------------- | ------------------------------------------------------------- | --------------------- |
| `timeline`       | Timeline-frågan ("Vilket år föddes/bildades X?")              | `correctYear` krävs   |
| `name-letters`   | Namn-svarsmodellen (Letter Grid + Final Selection)            | `displayName` krävs   |

Items kan stödja en eller båda. Spel-logiken väljer per fråga vilken metod
som används baserat på fråge-design och spelares preferenser.

**Konvention idag**:
- Personer + artister: `["timeline", "name-letters"]`
- Capitals: `["name-letters"]` (timeline fungerar dåligt för städer)

## Sensitivity-fältet

`sensitivity: sensitive` markerar motiv som kräver extra omtanke vid bildval (t.ex. historiska figurer som väcker starka reaktioner). `findItemsForAudience` exkluderar dessa items by default — admin-verktyg som behöver se full katalog passerar `{ excludeSensitive: false }`.

## Helpers för Namn-svarsmodellen

`content/generation.ts` exporterar tre rena funktioner som encodar reglerna i namn-svarsmodellen:

- **`birthYearToGeneration(year)`** — mappar födelseår → generation.
- **`generationDistance(player, audience)`** — minsta antal generationer mellan spelare och motiv. `'all'` i audience returnerar alltid 0.
- **`getLetterGridConfig({ playerBirthYear, playerSkill, itemAudience })`** — avgör om Steg 1 visar hela namn eller prefix-bokstäver. Returnerar `{ mode: 'full-names' }` eller `{ mode: 'prefix', length: N }`.

**Reglerna som funktionen encodar**:

1. Spelare född **2016+** → alltid hela namn (yngsta Gen Alpha kan inte hantera prefix).
2. Spelare född **2013-2015** → prefix om generations-avstånd ≤ 1, annars hela namn.
3. **Övriga** → prefix om generations-avstånd ≤ 2, annars hela namn. Millennials har max-avstånd 2 till alla generationer, så får alltid prefix.
4. När prefix används styrs längden av skill level: easy = 3 bokstäver, intermediate = 2, expert (Advanced) = 1.

Helpers är pure functions utan beroenden — kan importeras direkt av spel-API:t eller kopieras till klienten.

## Wikimedia bildförslag

CLI: `npm run wikimedia-search <item-id> [--limit N]`

Söker efter relevanta bilder från Wikipedia + Commons för ett item. Tre källor per sökterm (i visad ordning):

1. **`wikipedia-en`** — engelska Wikipedia-artikelns huvudbild (`pageimage`). Typiskt det bästa porträttet/landmärket eftersom Wikipedia-artiklar har manuellt kuraterade huvudbilder.
2. **`wikipedia-sv`** — svenska Wikipedia-artikelns huvudbild. Bra för svenska motiv (Carola, Lasse Åberg, Stockholm).
3. **`commons-search`** — text-search på Commons. Sista fallback; ofta brus men kan komplettera när Wikipedia-pageimagen är otillräcklig.

License + artist hämtas via Commons imageinfo för Wikipedia-träffarna.

```bash
npm run wikimedia-search astrid-lindgren            # ett item
npm run wikimedia-search abba moscow billie-eilish  # flera items
npm run wikimedia-search -- --file persons-millennials.yaml  # hela en fil
npm run wikimedia-search -- --all                   # hela katalogen
```

Output är console-baserad; ingen download eller upload sker här. Admin granskar förslagen, väljer URL, och kör sedan `wikimedia-process` (se nedan).

## Bildhämtning + WebP-konvertering

CLI: `npm run wikimedia-process <item-id> [<url>]`

Hämtar en bild från en URL, resize:ar till max 1280×720 (behåller aspect ratio, ingen uppskalning av små bilder), konverterar till WebP @ q85, och sparar till `backend/output/<item-id>.webp`.

```bash
# Auto-pick: tar första Wikipedia-pageimage automatiskt
npm run wikimedia-process astrid-lindgren

# Explicit URL: använd en specifik bild från wikimedia-search-output
npm run wikimedia-process astrid-lindgren https://upload.wikimedia.org/.../portrait.jpg
```

**Output-folder är gitignore:ad** så processade bilder inte committas. Detta är en lokal cache tills Supabase Storage är på plats — då laddas bilderna upp till CDN istället för att sparas på disk.

**Storleksminskning** typiskt 60-98% beroende på källa: en 7.5 MB Stockholm-panorama → 160 KB WebP. En 108 KB JPG → 37 KB WebP.

## Vad kommer härnäst?

Enligt planen i `.claude/plans/`:

1. ✅ **Wikimedia bildförslag** (klar) — CLI hittar relevanta bilder per item.
2. ✅ **Bildhämtning + WebP-konvertering** (klar) — `wikimedia-process` laddar ner och optimerar.
3. **Supabase-projekt setup** — Storage som CDN, Postgres för question-metadata.
4. **Admin-validation-UI** — preview, godkänn/avvisa, status `draft → review → live`.
5. **Spelar-API** — `GET /questions` returnerar bara `live`-frågor.
6. **FLUX prompt-template-bibliotek** — när atmosfäriska bilder behövs i fas 2.
