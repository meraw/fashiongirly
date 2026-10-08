# Working handoff

Last updated: 8 October 2026.

## Read first

Read [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) for the product's intent and agreed constraints, then the [README](../README.md) for running the code. The brief deliberately distinguishes goals from implementation. Later explicit user decisions can supersede it; update the documentation when that happens.

## Current implementation

- Static JavaScript app with Three.js 0.180.0; no runtime AI or service API calls.
- Procedural doll and a separate replaceable wardrobe group. The cute face and revised compact body are the current visual baseline.
- Knit sweater, striped shirt, barrel jeans, and optional pleated skirt over jeans with a ribbon.
- Three authored outfits: Tomato mischief, Butter club, Garden party crasher. These are presets, not a generative stylist.
- Sweater and denim colours, sweater sleeve volume and hem, trouser volume, and layer toggles.
- Bounded text parser, turn controls, draft persistence and a 24-look browser lookbook.
- Earlier vector implementation retained at `illustration.html`.
- Fourteen tests were passing and the static build succeeded at this handoff. Geometry and UI checks do not establish visual quality; full device/WebGL appearance and performance still require review.

## Code landmarks

| File | Responsibility |
| --- | --- |
| `src/doll/model.js` | Procedural character and outfit geometry, materials, resource cleanup |
| `src/doll/recipe.js` | Current flat recipe, validation, bounded parser, curated outfits |
| `src/doll/app.js` | Controls, preset application, persistence and lookbook |
| `src/doll/view.js` | Three.js rendering, camera, turn interaction and lifecycle |
| `src/doll/boot.js` | Entry point and page lifecycle |
| `src/doll/studio.css`, `index.html` | Studio interface |
| `tests/doll.test.js` | Geometry bounds, layer edits, UI persistence and error handling |
| `scripts/build.mjs` | Static build including local Three.js dependencies |
| `.github/workflows/pages.yml` | Manually dispatched Pages deployment |

The current flat recipe is not a garment database. It holds colours, bounded numeric controls and layer booleans for the procedural study. A first catalog entry now exists for `desigual-bronze-mesh-v1`, selected by `topId`. It uses fitted geometry and a bundled generated texture. The other pieces still use the flat recipe. There is no general import pipeline, fitting rig or automatic reference reconstruction yet.

## Latest decisions

- The app must start without API calls; AI can be considered later if necessary.
- References can be processed outside the app. The durable result belongs in the wardrobe catalog as a reusable asset and data.
- Garments need recognisable construction details, not just recolours.
- Improve one garment's fit before adding many more rough options.
- The bounded input is now labelled “Quick edits”. Unsupported sweater edits do not alter the reference top.

## Where to resume

The user supplied front and back pictures of a detailed Desigual bronze mesh top. Its first implementation is available via the top selector and “Bronze mesh study” preset. Review [the garment record](garments/bronze-mesh.md), then get feedback on recognition and fit on the doll. Do not ask for the first reference again unless the actual pictures are needed and unavailable in the new chat.

Latest feedback: the user says the top looks very good apart from two elbow holes. Arm/sleeve intersections were confirmed and corrected by re-centring the sleeves and adding local elbow clearance, with a regression test. Next: visually confirm this correction while preserving the approved overall appearance. The back currently reuses the front-facing motif, and sleeve glyphs are approximate. Preserve these limitations in future handoffs. Do not expand the wardrobe before reviewing this test.

## Operational notes

- Run `npm ci`, `npm test`, and `npm run build`; use `npm run dev` for local development with Node 22+.
- The built application bundles rendering dependencies. An in-chat preview may load Three.js from a CDN; that is a preview convenience, not an AI API or the deployed app's dependency strategy.
- Saving in the full app uses browser local storage. Inline chat previews have used in-memory storage and are not evidence of durable lookbook persistence.
- Deployment is separate from committing. Pages requires the repository setting and a manual workflow run; no live deployment is established by this handoff.
- Reference concept images are not in the repo. Do not assume access to prior chat attachments or scratch paths. Request the image again when exact comparison is necessary.
- Update this handoff when capabilities or the next milestone change. Record actual checks and distinguish visual approval from passing tests.
