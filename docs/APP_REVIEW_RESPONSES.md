# App Store Review Responses

Pre-skrivna svar på vanliga frågor från Apple App Store review-granskare. Kopiera relevant svar direkt in i review-response-fältet om/när frågan kommer.

**Scope:** iOS-only för first launch (beslut 2026-05-22). Android/Google Play kommer senare när vi har Android-testenhet. Lägg till Google Play-specifika svar då.

Senast verifierad: 2026-05-22 mot YouTube API Services ToS + Required Minimum Functionality docs.

---

## YouTube IFrame Player embedding

### Q: "Do you have rights to embed YouTube content in your app?"

**Response:**

> QuizVibe uses the official YouTube IFrame Player API as documented at https://developers.google.com/youtube/iframe_api_reference. We comply with the YouTube API Services Terms of Service (https://developers.google.com/youtube/terms/api-services-terms-of-service) and the Required Minimum Functionality requirements (https://developers.google.com/youtube/terms/required-minimum-functionality).
>
> Specifically:
> - We embed videos via standard IFrame Player API with documented parameters (`controls`, `rel`, `start`, `autoplay`).
> - We do NOT download, modify, mirror, or store YouTube video content.
> - We do NOT extract audio tracks separately or repurpose YouTube content outside of normal embedded playback.
> - YouTube branding and watermark remain visible during playback as the API automatically handles branding treatment (the deprecated `modestbranding` parameter is not used).
> - Our embedded player viewport is 220×~390 px, well above the 200×200 minimum requirement.
> - Only one YouTube player is active at any time per the autoplay-multiplicity restriction.
> - Post-playback (when YT fires `state==='ended'`), our app UI replaces the iframe as permitted by the API ToS.

### Q: "How do users discover YouTube content in your app? Is it search?"

**Response:**

> No. QuizVibe uses a curated static catalog of approximately 110 YouTube video IDs (songs, movie scenes, sport events, cultural clips) selected by our editorial team. We do NOT expose YouTube Search or any browse interface within the app. Users cannot input arbitrary YouTube URLs or search for content. Each video is a deliberate quiz question selected for cultural recognition within our target audience demographics.

### Q: "Do you monetize the YouTube content?"

**Response:**

> Our app uses an in-app purchase model (subscriptions, credit packs, themed content packages) processed exclusively through Apple In-App Purchase / Google Play Billing. We do not monetize YouTube content directly — users cannot pay to "unlock" specific YouTube videos. The IAP model funds the app's editorial curation, infrastructure, and feature development. Per YouTube API ToS Section 4, we do not insert advertisements over YouTube content, do not pre/post-roll our own ads, and do not modify YouTube's native ad delivery.

### Q: "Can users download or save YouTube videos through your app?"

**Response:**

> No. The app uses only the YouTube IFrame Player for ephemeral playback. There is no download function, no offline caching of video content, and no save/share-to-storage feature. Users cannot extract YouTube content from the app.

### Q: "What user data do you collect when users play YouTube content?"

**Response:**

> The app collects analytics about gameplay events (questions answered, scores, game completion) but does NOT collect or transmit any YouTube-specific user data. YouTube's IFrame Player operates within a WebView and follows YouTube's own data collection per the Google Privacy Policy (which users are notified of in our Privacy Policy). We do not log video watch history, do not track viewing time per video, and do not associate YouTube view data with user accounts.

---

## Anonymous Authentication / Guest Mode

### Q: "Why does your app create user accounts without explicit sign-up?"

**Response:**

> QuizVibe supports a "guest mode" for users who want to join a multiplayer game without registering. We use Supabase Anonymous Authentication, which assigns each guest device a temporary anonymous user ID for the sole purpose of state persistence (lobby membership, game scores). Guest accounts:
> - Contain no personally identifiable information.
> - Are protected by per-IP rate-limiting (5 anonymous sign-ups per IP per hour) to prevent abuse.
> - Can be upgraded to a registered account at any time by the user creating credentials.
>
> Apple Sign-In is implemented for users who want a registered account. Anonymous mode is a UX convenience, not an attempt to bypass auth requirements.

---

## In-App Purchases (StoreKit)

### Q: "What does the user receive for each in-app purchase?"

**Response:**

> Three IAP categories, all via Apple StoreKit:
> 1. **Credit packs (consumable)** — additional "host game credits" beyond the daily free allocation (2/day). Each credit allows the user to host one game session.
> 2. **Themed content packages (non-consumable)** — unlock additional curated question pools (e.g., "Hip Hop", "Rock", "Film & Actors"). Permanently unlocked on the user's account.
> 3. **QuizVibe Membership subscriptions (auto-renewing)** — unlimited host games + Individual Devices multiplayer mode + 20-round games + all themed packages. Auto-renews via App Store. Cancellable anytime from App Store account.
>
> Currency localization is handled automatically by StoreKit; we display the localized price returned by `Product.displayPrice`.

### Q: "Does the app use Sign in with Apple?"

**Response (current state — anonymous + email/password only):**

> Per App Store Review Guideline 4.8, Sign in with Apple is required when an app uses third-party social login (Facebook, Google, etc.) as the sole or primary authentication method. QuizVibe currently offers two authentication paths:
> 1. **Anonymous guest mode** (no PII collected, no third-party identity provider).
> 2. **Email/password registration** via Supabase Auth (first-party credentials, no third-party identity provider).
>
> Neither method falls under Guideline 4.8's third-party-login requirement. Sign in with Apple is on our roadmap as a UX enhancement but is not required for current submission.

---

## Data Privacy

### Q: "Where is user data stored?"

**Response:**

> User data is stored in Supabase (https://supabase.com), a hosted PostgreSQL backend. Our Supabase project is hosted in `eu-west-1` (Ireland), so EU user data remains within the EU per GDPR requirements. We store:
> - Account credentials (email + hashed password via Supabase Auth)
> - Player profile (player name, avatar selection, birth year, region preference)
> - Game history (scores, dates, settings used)
> - Lobby state (active rooms, player memberships) — auto-deleted after 24h via scheduled cleanup.
>
> Privacy Policy: https://peterlomaco.github.io/quizvibe-app/legal/privacy/

---

## Notes for future maintenance

When adding new app features that touch user data, third-party services, or content licensing, add a new Q/A section here so the next reviewer-response is ready.

Always verify the cited YouTube docs links still resolve before submission — Google occasionally reorganizes their developer docs.
