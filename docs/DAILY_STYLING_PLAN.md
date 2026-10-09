# Plan: from wardrobe studio to daily self-dressing

Written 9 October 2026. This is a plan, not a record of features that exist. It follows the sequence in the [product brief](PRODUCT_BRIEF.md#building-towards-daily-self-dressing): finish the import, build local outfit selection, then connect weather and the daily experience.

**Constraints for this plan (the user's decision, 9 October 2026):** no AI API calls for now. Weather may come from a free source: a keyless public forecast fetched by the browser. Nothing else at runtime needs a network service, an account or a key. Outfit selection is local, rule-based code; it must not be described as AI.

## Where things stand

From the catalog on `main` at the time of writing:

| Slot | Pieces | With `styling` | Numeric `warmth` |
| --- | --- | --- | --- |
| Tops | 39 | 39 | 39 |
| Bottoms | 16 | 6 | 6 |
| Shoes | 10 | 7 | 5 (2 hold prose) |
| Outerwear | 12 | 12 | 0 (prose under `inferred`) |
| Dresses | 2 | 2 | 2 |
| Hair | 9 styles | — | — |

- The import is close to the user's inventory of 8 October: bottoms (about 15), shoes (about 10) and outerwear (about 7) are covered or exceeded. Dresses are 2 of "three or four", and the blue sleeveless top meant to go under cardigans has not arrived.
- Recipes already hold the whole look by stable IDs: `topId`, `underTopId`, `bottomId`, `shoesId`, `outerwearId`, `outerwearOpen`, `outerwearInsert`, `dressId`, `hairId`. `cleanRecipe()` enforces slots and the layering flags (`overTop`, `underTop`, `canOpen`, `detachable`). The layering tests build every top over every bottom, every bottom with every shoe and every jacket over everything, so any combination `cleanRecipe()` accepts is known to fit. **This is the most important asset for the stylist: it can combine pieces freely without new fit work.**
- Styling facts come in three shapes: flat fields on tops, bottoms and dresses (`warmth` 1 to 4, `weather`, `palette`, `coverage`, ...), nested `observed` / `user` / `inferred` on outerwear, and prose `warmth` on two pairs of shoes. 13 pieces have none: 10 bottoms (the earliest jeans and trousers) and 3 shoes (Buffalo boots, cow slides, UGG sneakers). The warmth scale is not written down anywhere.
- Housekeeping: `levis-lilac-gingham-shirt-v1` and `polo-ralph-lauren-usrl-racing-hoodie-v1` were merged (pull requests 92 and 93) but still carry review statuses. Under the merge-means-approved rule they should read `user-approved`.
- The studio has presets, a 24-look lookbook in local storage, Quick edits (keyword parser) and the hair selector. There is no weather, no outfit generator and no daily state.

## Phase 0: close the import (small, user-led)

1. Mark the two merged garments approved in their own files and records.
2. Add what is still missing from the inventory: the remaining dress or two and the blue sleeveless under-top, plus anything else the user names. The user decides when the import is finished.
3. Phases 1 to 3 can start before that: they add new files and touch garment entries only to fill in facts, so new garments keep arriving without conflicts.

## Phase 1: one readable set of styling facts

Goal: the stylist reads every garment the same way, without rewriting 80 entries in a shared PR.

1. **Write down the warmth scale** in this file and the handoff, matching the values already used:
   `0` open or bare (slides, sandals) · `1` light (mesh, tees, linen) · `2` mid (shirts, light knits, sweatshirts, most jeans) · `3` warm (heavy knits, fleece, padded or wool jackets) · `4` very warm (sherpa or fur-lined, knee length).
2. **Add `src/style/facts.js`** with `stylingFacts(garment)`, which reads all three existing shapes and returns one normalised object:
   `{ warmth: 0–4 | null, rain: 'ok' | 'avoid' | null, wind: 'ok' | 'avoid' | null, palette: [names], hues: [hex], pattern: 'plain' | 'print' | 'stripe' | 'check' | ..., boldness: 0–2, length/volume tags (cropped, oversized, wide, slim, long), coverage, mood: [tags], provenance: 'observed' | 'user' | 'inferred' | 'unknown' }`.
   Unknowns stay `null`; nothing is invented. A small colour-name lexicon maps palette words (`'raspberry pink'`, `'slate blue'`) to hues for colour scoring.
3. **Backfill the 13 pieces without facts and give outerwear a numeric warmth**, each change on that garment's own lines (one PR is fine; it touches no shared line). Derive values from each garment record; mark them inferred.
4. **Tests** (`tests/styling-facts.test.js`): every garment returns a valid object; warmth is in range or `null`; every outerwear piece and every pair of shoes has a warmth. New garments are covered automatically, so later chats are reminded to record facts.

This is a shared foundation, so one chat owns it, agreed with the user first (AGENTS.md).

## Phase 2: the local stylist (no UI, no network)

Pure functions in new files under `src/style/`, testable in Node.

**Input:** weather `conditions` (Phase 3 shape), plus options `{ seed, keep: { slot: id }, avoid: [ids], recent: [recipes], daring: 0–1 }`.
**Output:** a recipe that `cleanRecipe()` returns unchanged, plus plain-language `reasons`.

1. **Conditions to needs** (`src/style/comfort.js`): map the day's feels-like temperature, rain chance and wind to a target total warmth band and rules: above about 24 °C no outerwear and light tops; below about 12 °C outerwear required; rain likely, so closed shoes and no pieces whose facts say `rain: 'avoid'` (pale suede, open shoes); strong wind, so no open jacket and hair tied up. Thresholds are constants, tuned with the user.
2. **Candidates** (`src/style/stylist.js`): enumerate valid structures: top + bottoms + shoes (+ outerwear); a cardigan-type top with an under-top; a dress + shoes (+ outerwear). Validate with `cleanRecipe()` and catalog `exclusions`. Kept pieces are fixed; avoided pieces are dropped.
3. **Hard filter by weather**, then **score for daring** rather than safe matching:
   - colour: complementary or clashing hues on purpose, one accent colour picked up between two pieces;
   - pattern: one statement print with a stripe or check, never two competing photo prints;
   - proportion: cropped over wide, oversized over slim, a long coat over cropped trousers;
   - layering: an under-top or an open jacket when the weather allows it;
   - novelty: penalise pieces and pairs worn in the recent looks;
   - `daring` moves the weights between "inspiring" and "easy to wear"; the weather filter never relaxes.
   Pick by weighted random choice from the best candidates with the given `seed`, so "Another idea" varies and tests are deterministic.
4. **Hair with the outfit** (`src/style/hair.js`): hoods and high collars favour buns or ponytails; wind favours ponytail, bun or braid; otherwise choose by mood and contrast with the outfit's volume. Uses the existing `HAIRSTYLES` ids.
5. **Honest reasons:** each choice reports the rule that made it ("rain likely, so closed boots"; "cropped jumper over wide jeans for contrast"). The UI says "She picked" and never "AI".
6. **Tests:** many seeds across the weather presets always give a recipe that survives `cleanRecipe()` unchanged, respects kept pieces, fits the warmth band and never picks a piece flagged for that weather; a sample of results builds with `makeOutfit()` without errors; build time stays within the current budget.

## Phase 3: weather input

Keep weather separate from styling (the brief's requirement), so everything works and is tested with supplied conditions first.

1. **Conditions shape** (`src/weather/conditions.js`): `{ date, place, tempMin, tempMax, feelsMin, feelsMax, rainChance, rainMm, windKmh, code, source: 'manual' | 'forecast' }`, with validation.
2. **Manual weather first** (`src/weather/manual.js`): presets (hot, warm, mild, chilly, cold, rainy, windy, snowy) and a temperature slider. This ships before any live fetch and stays as the offline fallback.
3. **Free forecast: [Open-Meteo](https://open-meteo.com/)** (`src/weather/open-meteo.js`). It needs no key or account and allows browser requests:
   - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`, reduced to her day (about 8:00 to 20:00 local time).
   - Place: the user types a town, resolved by Open-Meteo's free geocoding API (`geocoding-api.open-meteo.com/v1/search`), or taps "Use my location" (browser geolocation, asked only when tapped). Location is never requested silently. The chosen place is stored in local storage only.
   - Cache one forecast per place per day in local storage; on a timeout, an error or offline, use the last forecast or ask for manual weather, and say which is shown.
   - Show the required attribution ("Weather data by Open-Meteo.com", CC BY 4.0). The free tier is for non-commercial use; if the app is ever sold or commercial, revisit this (a paid Open-Meteo plan or another source).
   - The fetch lives in that one module; tests use a recorded JSON fixture and a stubbed `fetch`, so `npm test` needs no network.
4. Document the decision in the brief and handoff: AI calls stay out; one keyless weather fetch is allowed, behind explicit place choice.

## Phase 4: the daily experience

1. **"Today" panel** at the top of the page: the weather in one line, the doll dressed in her pick, the reasons, and the controls. The manual studio stays below for direct edits.
2. **Morning behaviour:** on the first open of a new local day she checks the weather and dresses herself; reopening the same day shows the same look. Store `{ date, conditions, recipe, seed }` in local storage. No background work or notifications are promised (the brief forbids promising them).
3. **Refining:**
   - a lock on each piece ("Keep the jeans") passed as `keep`;
   - "Another idea" (new seed, same locks); "Bolder" / "Easier" moves `daring`;
   - "Not this piece today" adds to `avoid`;
   - "Save look" uses the existing lookbook, now titled with the date and weather;
   - Undo of the last change (the brief lists undo as future work).
4. **Quick edits** learn a few honest phrases mapped to the same operations ("keep the jeans", "something bolder", "warmer", "change the shoes"), reporting what was understood, as now.
5. **History** of recent daily looks feeds novelty and lets the user see the week.

## Phase 5: live on the phone

1. Installable web app: manifest, icons, and a service worker caching the app so it opens offline with the last forecast. Pages deployment as described in the README.
2. Device QA on the user's phone: start-up time, one outfit build per choice, touch controls.
3. User review of generated looks across weather presets; tune weights and thresholds from their feedback and record it in the brief. Acceptance is the brief's question: does she dress herself in a weather-appropriate, recognisably adventurous outfit that inspires the user, and can the user refine it?

## Pull requests, in order

| # | Pull request | Touches shared code? |
| --- | --- | --- |
| 1 | Approve the two merged garments | No (their own files) |
| 2 | Styling facts reader, warmth scale, tests | New files only |
| 3 | Backfill facts for the 13 pieces and outerwear warmth | Each garment's own lines |
| 4 | Stylist engine and hair choice, with tests | New files only |
| 5 | Manual weather and the Today panel | `app.js`, `index.html`, `studio.css`: one owner |
| 6 | Open-Meteo forecast and place choice | New module plus the panel |
| 7 | Locks, variations, daring, undo, history, Quick edits phrases | `app.js`, `recipe.js`: one owner |
| 8 | Installable offline app and device QA | Build script, new files |

Garment chats can continue throughout; from PR 2 on, a new garment only needs its facts filled in to join daily styling.

## Decisions for the user

1. Is the import finished, or which pieces are still to come?
2. Place: typed town, device location, or both?
3. When does "today" start (for example the first open after 5:00), and which hours count as her day?
4. How daring should she be by default?
5. Will the app ever be commercial? (It affects the free weather source.)
6. Who owns the shared foundations in PRs 2, 4, 5 and 7: one chat, or this one?
