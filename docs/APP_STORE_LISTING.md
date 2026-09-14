# App Store listing — draft copy (INTERNAL, not published)

> This file is **not** published to quizvibe.se (excluded in `docs/_config.yml`). It is a paste-ready draft for **App Store Connect**. Copy each field into the matching field in App Store Connect. Character limits from Apple are noted so you can trim if you edit the copy.
>
> Positioning: **Music and Film** (Sport dropped for phase 1). App Store Connect ID: `6772559846`.

---

## App name (max 30 chars)

**Recommendation: keep the name as just `QuizVibe`** (it's your brand and already the record name — the subtitle below carries the keywords). Only use the longer keyword form if you want "music/film/quiz" in the name for search.

```
QuizVibe
```
*(8 chars. Alternative keyword form: `QuizVibe: Music & Film Quiz` = 27 chars.)*

## Subtitle (max 30 chars)

```
Social music & film quizzes
```
*(27 chars.)*

## Promotional text (max 170 chars — editable anytime without review)

```
Guess the year on music and film clips, or the name behind the hints. Play on one phone, separate devices, or a 1v1 duel — every generation competes fairly.
```
*(156 chars. Promotional text is editable anytime without a review, so tweak it freely.)*

## Description (max 4000 chars)

```
QuizVibe is a social music and film quiz for friends and family. Guess the release year on music and film clips, or name the artist, band, or actor behind progressively revealed hints — and see who comes out on top.

WHAT MAKES IT FAIR
The content adapts to the ages of the people playing, so a teenager and a grandparent can play the same round and both have a real chance. Everyone competes on equal terms.

FOUR WAYS TO PLAY
• Single player — practise on your own
• Pass-the-Phone — share one device and take turns
• Individual devices — everyone answers on their own phone in the same room
• Remote 1v1 — challenge a friend to a head-to-head duel and answer whenever it suits you, within 48 hours

QUESTIONS
• Music and film clips play right inside the app
• Progressive hints reveal a country flag and clues one by one — answer as early as you dare
• Choose the era you want to play, from decades past to today

HOST YOUR OWN GAMES
Create a lobby, invite friends with a room code, and run the game your way — pick the number of rounds, the response time, the era, and the content mix. Every registered player gets free daily host games.

QUIZVIBE PREMIUM
Premium unlocks unlimited hosting, larger groups, more rounds, and all themed content packages. QuizVibe is free to download and play.

PRIVATE BY DESIGN
No ads. No cross-app tracking. We collect only what's needed to run a game, your data stays in the EU, and you can delete your account in full from inside the app at any time.

QuizVibe is developed and operated by LoMaCo AB, registered in Sweden.

Terms of Use: https://quizvibe.se/legal/terms/
Privacy Policy: https://quizvibe.se/legal/privacy/
```
*(≈1,500 chars — well under the 4,000 limit.)*

### Add this ONLY IF the paid monthly subscription (`pkg_sub_monthly`) is part of THIS submission

Apple requires an auto-renew disclosure in the description when you ship an auto-renewable subscription. If the paid subscription is live in this build, append this block above the Terms/Privacy lines. If v1.0 launches with the **free Premium promo only** (no purchasable subscription), **omit it** — see the note in chat.

```
QuizVibe Premium is an auto-renewing subscription billed monthly through your Apple ID. It renews automatically unless you cancel at least 24 hours before the end of the current period. Manage or cancel anytime in your Apple ID settings. The price is shown in the app in your local currency.
```

## Keywords (max 100 chars, comma-separated, NO spaces after commas for best use of the limit)

```
trivia,movie,party,game,friends,family,multiplayer,guess,song,duel,years,artist,band,actor,hints
```
*(96 chars. Deliberately does NOT repeat "music", "film", "quiz", or "social" — those are already in the subtitle, and Apple indexes name + subtitle + keywords together. No spaces after commas, to use the full 100.)*

## Support URL

```
https://quizvibe.se/support/
```

## Marketing URL (optional)

```
https://quizvibe.se/
```

## Privacy Policy URL

```
https://quizvibe.se/legal/privacy/
```

## Terms of Use (EULA) URL — for the description body

App Store Connect has no dedicated Terms field, but Apple requires a visible **Terms of Use (EULA)** link for auto-renewable subscriptions. Include this line near the bottom of the **description** (alongside the standard subscription disclosure):

```
Terms of Use: https://quizvibe.se/legal/terms/
Privacy Policy: https://quizvibe.se/legal/privacy/
```

---

## Apple Privacy Nutrition Labels — checklist (App Store Connect → App Privacy)

These are entered **separately** from the description and MUST match the Privacy Policy (`docs/legal/privacy.md §2`). Apple checks the two for consistency. Fill in App Store Connect as follows.

### Data the app collects — mapped to Apple's EXACT data types (from privacy.md §2)

For **every** row below: **Used to track you = No** (no ads, no IDFA, no cross-app tracking). Add each in App Store Connect → App Privacy → Add Data Type.

| QuizVibe data | Apple data type (exact path) | Linked to user's identity? | Purpose to select |
|---|---|---|---|
| Email address | **Contact Info → Email Address** | Yes | App Functionality |
| Player name (a chosen handle, not a real name) | **Identifiers → User ID** | Yes | App Functionality |
| Birth year + region preference + avatar choice | **Other Data → Other Data Types** (one entry, catch-all) | Yes | App Functionality |
| Game history / scores | **User Content → Gameplay Content** | Yes | App Functionality |
| Analytics event names (e.g. "game_completed") | **Usage Data → Product Interaction** | No | Analytics |
| In-app purchase records | **Purchases → Purchase History** | Yes | App Functionality |

**Do NOT declare:** Location (Precise or Coarse), Contacts, Photos/Videos, Health, Financial Info, Advertising Data, or any Device ID / advertising identifier. The app collects none of these. "Region preference" is a content-scope choice — it is NOT location.

### Two judgment calls to decide before publishing

1. **IP address** (used only for signup rate-limiting, purged after 1 hour). Apple lets you **omit** data collected *solely* for fraud prevention/security that isn't linked or stored — so you can leave it out. If you'd rather be fully transparent, add it as **Diagnostics → Other Diagnostic Data**, Not Linked, Not Tracking, App Functionality. *(Recommendation: omit — it qualifies for the exception.)*
2. **Embedded YouTube player.** When a clip plays, Google (not QuizVibe) collects device info / IP / which video was watched. Apple asks you to account for data collected by third-party code in your app. Two defensible positions: (a) treat it as Google's own collection, disclosed in privacy.md §4.2 (simpler, common for embedded players); or (b) conservatively declare **Usage Data → Product Interaction** as also collected by a third party. *(Recommendation: (a), but flag it if a reviewer questions it.)*

### Critical settings to confirm

- **"Data Used to Track You" → declare NONE.** The app has no IDFA, no advertising identifiers, and no third-party cross-app tracking SDK (privacy.md §2.4 and §10). Do NOT enable App Tracking Transparency for tracking purposes.
- **Guests** use an anonymous session ID with no email/password — this is not "linked to identity."
- **Location:** the app does NOT collect physical location. "Region preference" is a content-scope choice, not location — do not declare Location.
- **Third parties:** YouTube (Google) collects device/playback data directly when a clip plays — this is Google's collection, disclosed in privacy.md §4.2, and is governed by Google's own labels, not ours. Spotify: QuizVibe exchanges no data with Spotify (privacy.md §4.5).

### Related pre-launch item (not a label field)

- `PrivacyInfo.xcprivacy` (iOS Privacy Manifest) is not yet committed — AsyncStorage uses a required-reason API and Apple may issue an ITMS-91053 notice. Track this in the pre-launch checklist before submission.
