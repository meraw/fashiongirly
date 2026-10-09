# Project continuity

Before changing Fashiongirly, read `docs/PRODUCT_BRIEF.md` and `docs/HANDOFF.md`, then `README.md` for setup. These preserve the user's decisions across chats.

- Keep the initial app local and free of required runtime API calls. AI integration is optional future work, not an implicit dependency.
- Preserve the working doll identity: the user likes the face and preferred the revised compact body.
- Treat reference pictures as authoring inputs for reusable, distinctive garments. Garment creation can happen outside the app.
- Prioritise individual fit and construction detail over adding more generic recolours or rough outfits.
- Do not present the keyword parser or curated presets as AI understanding or an autonomous stylist.
- Distinguish existing features from plans, and technical checks from visual/device verification.
- Update the brief and handoff when user decisions or implementation status change. Current explicit user instructions take precedence over these recorded decisions.

# Product destination — applies to every chat

The user clarified on 8 October 2026 that **checking the weather and dressing herself each morning is a core goal**, to be built after their wardrobe import is finished. Do not treat this as an optional stretch feature or manual dress-up as the finished product. She should choose daring, inspiring combinations from the user's wardrobe, including hair.

During garment work, preserve stable IDs, separate reusable pieces, slot/layer compatibility and known fit constraints. Record styling-relevant details (silhouette, palette/pattern, coverage, material, relative warmth and weather limitations) when supported; distinguish uncertain inferences and unknowns. See the product brief's “Building towards daily self-dressing” section. Do not add live weather/API dependencies during import or independently redesign shared styling foundations.

# Parallel chats

Several chats may add garments at the same time. Categories are not assigned to chats (the user's decision, 8 October 2026): each chat adds whatever category the user tells it to, and can switch, for example from bottoms to tops, when the user asks. Each chat works on its own branch and pull request, never pushes to another's branch, and never force-pushes a branch that has been shared.

- Two chats may work on the same category at once. Adding a garment through an existing template (a new `build` spec for `makeJeans()`, `makeLugBoot()` or `makeZipWindbreaker()`) needs no coordination. Keep changes to a template's code additive: new spec options default to the old behaviour, so garments already on the template are unchanged. Check that in the tests and say so in the pull request.
- Shared foundations need one owner at a time, agreed with the user first: the doll body (`makeDoll`), shared top helpers (`makeReferenceTop`, `roundSleeveCap`), the outfit assembler (`makeOutfit`, beyond a dispatch line for a new garment), and any new slot with its layering rules (the dress slot exists since 9 October 2026; see the handoff).
- Small layering fixes that a new garment needs in another category (for example easing a top's hem over a new waistband) are allowed; record them in the garment record and the pull request.
- **One garment, its own files (the user's decision, 9 October 2026, after repeated merge conflicts).** A new garment must not edit any line another chat might edit. Put it in:
  - `src/wardrobe/garments/<id>.js`: its catalog entry as the file's default export (the same fields as a `catalog.js` entry, with the id as a string). It may also carry its study preset, `study: { name, note, recipe }`, where the recipe holds only what differs from the defaults (the garment fills its own slot, and other garments are named by their id strings), and, if the 3D view must load a texture module for it, `atlas: [path from src/doll/view.js, export name]`;
  - one line in `src/wardrobe/garments/index.js`, in alphabetical order;
  - its garment record in `docs/garments/`, its test in `tests/`, and any texture or template module of its own.

  Do not add it to `catalog.js`, `index.html`, `OUTFITS` in `recipe.js`, `view.js`, `README.md` or the handoff's lists and counts. The app adds its selector option, joins its study to the others of its slot and loads its atlas from the garment file; `tests/garment-files.test.js` checks this layout.
- **A new top template** registers in `src/doll/top-templates.js`, with one import line and one entry line, each in alphabetical order. It is not a new dispatch line in `makeOutfit()`. Other slots' templates still dispatch in `model.js` or `outerwear.js`; keep any such change to one new line.
- **Older garments** stay where they are, in `catalog.js` and the shared lists. When changing one (a revision or its approval), edit only its own lines.
- Before every push: fetch and merge `origin/main`, resolve conflicts by keeping both sides, then run `npm test` and `npm run build`.
- `docs/HANDOFF.md` no longer lists new garments or keeps counts: each garment's record in `docs/garments/` is its entry. Update the handoff only for decisions and shared changes (a new template or slot), editing only your own lines.
- A merged pull request means the user approves how the garment looks (the user's rule, 9 October 2026): they don't merge anything that looks wrong. Mark your merged garments as approved, in the garment's own file and record, rather than asking for a separate review.
- Do not open a separate pull request just to mark a merged garment approved (the user's rule, 9 October 2026). Since merging is the approval, a garment's own pull request marks it approved (`status: 'user-approved'` in its garment file, and its record), so it is recorded as approved the moment it merges.
- Show the user the garment in the chat (the user's rule, 9 October 2026): when replying inside Claude Code, attach the final render of the garment to the reply itself as an image file, not only in the pull request. Do this for a new garment and again after every revision, so the user can judge it without opening the pull request.
