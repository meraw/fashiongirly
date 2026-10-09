# Plan: from wardrobe studio to daily self-dressing

Written 9 October 2026. It follows the sequence in the [product brief](PRODUCT_BRIEF.md#building-towards-daily-self-dressing): finish the import, build local outfit selection, then connect weather and the daily experience.

**Status, 9 October 2026, later the same day:** the user asked for a working app now, with garments still to be added later. A first version of phases 0 to 4 is built: styling facts for every garment, the stylist, the forecast, and the Today panel. Phase 5 (installable app, device QA, tuning from the user's reactions) is next. The sections below say what was built and what is still open; the [decisions](#decisions-9-october-2026) record the user's answers.

## How she knows what to wear

Three things decide her outfit, in this order:

1. **The weather** sets what is comfortable, and her taste never overrides it. Warmth adds up across the pieces on the shared scale (a tee and jeans make 3, right for about 21 °C). A jacket goes on below about 13 °C, or in rain below 20 °C, and comes off from 21 °C. In rain she skips suede, canvas and open shoes, and jackets that do not suit it. Open shoes need 19 °C and a dry day; bare legs (a mini dress) need 15 °C. Wind or rain ties her hair back. Thresholds are in `needsFor()` in `src/style/stylist.js`, to tune with the user.
2. **Her taste** chooses among the comfortable outfits. It is written down in [src/style/taste.js](../src/style/taste.js) as principles, each scoring an outfit and giving a reason:
   - one statement print carries the look, set against stripes or checks; two prints only when she is daring;
   - a colour carried from one piece to another (shoes picking up the top's pink), or opposite colours on purpose, never a muddle of many;
   - proportion: cropped over high or wide, big over slim, a long coat over shorter lengths;
   - shoes that finish the shape: boots under cropped legs, chunky soles with a mini;
   - sporty with soft: a track piece with lace or flowers;
   - layers that show: a top peeking out from under a cardigan.
   She judges what shows: a closed jacket hides the top under it. A **daring** setting (0 to 1, default 0.5, "not extreme, not boring") shifts the weights, and "Bolder" and "Easier" move it. She does not wear the single top-scoring look every time: she picks among the best few, avoids tops and dresses worn in the past week, and "Another idea" moves on from what she has already shown.
3. **The user's reactions**, remembered in this browser: the heart (save) makes a look's pieces and pairings more likely; × (not today) sets a piece aside for the day and counts a little against it.

So her style is told to her in words, in `taste.js`. To change it, tell Claude in words ("she should love colour clashes more", "never two prints", "more dresses"), and the principles or weights change. The styling facts come from each garment's own record.

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

## Phase 0: close the import (small, user-led) — housekeeping done

1. Mark the two merged garments approved in their own files and records.
2. Add what is still missing from the inventory: the remaining dress or two and the blue sleeveless under-top, plus anything else the user names. The user decides when the import is finished.
3. Phases 1 to 3 can start before that: they add new files and touch garment entries only to fill in facts, so new garments keep arriving without conflicts.

## Phase 1: one readable set of styling facts — built

Goal: the stylist reads every garment the same way, without rewriting 80 entries in a shared PR.

1. **Write down the warmth scale** in this file and the handoff, matching the values already used:
   `0` open or bare (slides, sandals) · `1` light (mesh, tees, linen) · `2` mid (shirts, light knits, sweatshirts, most jeans) · `3` warm (heavy knits, fleece, padded or wool jackets) · `4` very warm (sherpa or fur-lined, knee length).
2. **Add `src/style/facts.js`** with `stylingFacts(garment)`, which reads all three existing shapes and returns one normalised object:
   `{ warmth: 0–4 | null, rain: 'ok' | 'avoid' | null, wind: 'ok' | 'avoid' | null, palette: [names], hues: [hex], pattern: 'plain' | 'print' | 'stripe' | 'check' | ..., boldness: 0–2, length/volume tags (cropped, oversized, wide, slim, long), coverage, mood: [tags], provenance: 'observed' | 'user' | 'inferred' | 'unknown' }`.
   Unknowns stay `null`; nothing is invented. A small colour-name lexicon maps palette words (`'raspberry pink'`, `'slate blue'`) to hues for colour scoring.
3. **Backfill the 13 pieces without facts and give outerwear a numeric warmth**, each change on that garment's own lines (one PR is fine; it touches no shared line). Derive values from each garment record; mark them inferred.
4. **Tests** (`tests/styling-facts.test.js`): every garment returns a valid object; warmth is in range or `null`; every outerwear piece and every pair of shoes has a warmth. New garments are covered automatically, so later chats are reminded to record facts.

This is a shared foundation, so one chat owns it, agreed with the user first (AGENTS.md).

## Phase 2: the local stylist (no UI, no network) — built

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

## Phase 3: weather input — built

Keep weather separate from styling (the brief's requirement), so everything works and is tested with supplied conditions first.

1. **Conditions shape** (`src/weather/conditions.js`): `{ date, place, tempMin, tempMax, feelsMin, feelsMax, rainChance, rainMm, windKmh, code, source: 'manual' | 'forecast' }`, with validation.
2. **Manual weather first** (`src/weather/manual.js`): presets (hot, warm, mild, chilly, cold, rainy, windy, snowy) and a temperature slider. This ships before any live fetch and stays as the offline fallback.
3. **Free forecast: [Open-Meteo](https://open-meteo.com/)** (`src/weather/open-meteo.js`). It needs no key or account and allows browser requests:
   - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`, reduced to her day (about 8:00 to 20:00 local time).
   - Place (as built, the user's choice): the phone's location by default, asked automatically (the browser asks the user's permission once); a typed town, resolved by Open-Meteo's free geocoding API (`geocoding-api.open-meteo.com/v1/search`), replaces it until "Use my phone's location" is tapped. Coordinates are rounded to two decimals in the request; the place is stored in local storage only.
   - Cache one forecast per place per day in local storage; on a timeout, an error or offline, use the last forecast or ask for manual weather, and say which is shown.
   - Show the required attribution ("Weather data by Open-Meteo.com", CC BY 4.0). The free tier is for non-commercial use; if the app is ever sold or commercial, revisit this (a paid Open-Meteo plan or another source).
   - The fetch lives in that one module; tests use a recorded JSON fixture and a stubbed `fetch`, so `npm test` needs no network.
4. Document the decision in the brief and handoff: AI calls stay out; one keyless weather fetch is allowed, behind explicit place choice.

## Phase 4: the daily experience — built, except history view and Quick edits phrases

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

## Phase 5: live on the phone — next

1. Installable web app: manifest, icons, and a service worker caching the app so it opens offline with the last forecast. Pages deployment as described in the README.
2. Device QA on the user's phone: start-up time, one outfit build per choice, touch controls.
3. User review of generated looks across weather presets; tune weights and thresholds from their feedback and record it in the brief. Acceptance is the brief's question: does she dress herself in a weather-appropriate, recognisably adventurous outfit that inspires the user, and can the user refine it?

## Pull requests, in order

As built, PRs 1 to 6 and most of 7 went into one pull request at the user's request ("get the app working"). Left from 7: a view of the week's looks, and Quick edits phrases ("keep the jeans", "something bolder"). The table is the original order.


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

## Decisions, 9 October 2026

The user's answers:

1. The import is not finished, but the app should work now; pieces will be added later. New garments join daily styling automatically once their styling facts are recorded (see AGENTS.md).
2. Both: the phone's location by default and automatically, which a typed town can replace. (The browser asks once for permission; "Use my phone's location" switches back.)
3. A new outfit on the first open after 5:00. Her day for the forecast is 8:00 to 20:00.
4. "Not extremely so, but not boring either": daring 0.5. The user asked how she is told her style; see [How she knows what to wear](#how-she-knows-what-to-wear).
5. Non-commercial: it holds the user's personal wardrobe. Open-Meteo's free tier fits.
6. This chat (Claude Code) owns the shared daily-styling code for now.

Still open: background behaviour (nothing runs while the app is closed), notifications, and the thresholds and weights, which need the user's reactions to real mornings.
