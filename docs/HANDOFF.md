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
- Twelve tests were passing and the static build succeeded at this handoff. Geometry and UI checks do not establish visual quality; full device/WebGL appearance and performance still require review.

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

The current flat recipe is not a garment database. It holds colours, bounded numeric controls and layer booleans for the procedural study. There are no independent garment IDs, imported reference garments, fitting rigs or custom garment asset pipeline yet.

## Latest decisions

- The app must start without API calls; AI can be considered later if necessary.
- References can be processed outside the app. The durable result belongs in the wardrobe catalog as a reusable asset and data.
- Garments need recognisable construction details, not just recolours.
- Improve one garment's fit before adding many more rough options.
- Relabel the bounded text input “Quick edits” and retain supported examples. This is agreed but still outstanding.

## Where to resume

The next proposed visual milestone is one garment from a reference chosen by the user. The user has not supplied that reference yet; they paused first to have these intentions documented. Ask for the picture or product link when resuming that milestone. Avoid substituting a random garment or proposing another full character redesign.

After inspecting the reference, identify the distinguishing details, choose a template or custom geometry, and make a reviewable first garment on the existing doll. Be candid about unseen details and fit limitations. Use the exercise to establish the catalog structure; do not lock in a broad asset pipeline before testing the approach.

## Operational notes

- Run `npm ci`, `npm test`, and `npm run build`; use `npm run dev` for local development with Node 22+.
- The built application bundles rendering dependencies. An in-chat preview may load Three.js from a CDN; that is a preview convenience, not an AI API or the deployed app's dependency strategy.
- Saving in the full app uses browser local storage. Inline chat previews have used in-memory storage and are not evidence of durable lookbook persistence.
- Deployment is separate from committing. Pages requires the repository setting and a manual workflow run; no live deployment is established by this handoff.
- Reference concept images are not in the repo. Do not assume access to prior chat attachments or scratch paths. Request the image again when exact comparison is necessary.
- Update this handoff when capabilities or the next milestone change. Record actual checks and distinguish visual approval from passing tests.
