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
- Shared foundations need one owner at a time, agreed with the user first: the doll body (`makeDoll`), shared top helpers (`makeReferenceTop`, `roundSleeveCap`), the outfit assembler (`makeOutfit`, beyond a dispatch line for a new garment), and any new slot (for example dresses) with its layering rules.
- Small layering fixes that a new garment needs in another category (for example easing a top's hem over a new waistband) are allowed; record them in the garment record and the pull request.
- Add, don't rewrite: new garments go in new files where possible (garment record, texture/swatch module). In shared lists, tops go after the last top and bottoms after the last bottom (catalog IDs and entries, the selectors in `index.html`); in `OUTFITS`, bottom studies go first, top studies directly above “Windowpane jumper study” and shoe studies directly above “Tomato mischief”. Shoes have their own catalog section after the bottoms and their own selector after “Choose bottoms”. Outerwear has its own catalog section after the shoes, its own selector after “Choose shoes”, and its studies go directly above the shoe studies. Chats on different categories then edit different lines; two chats on the same category may meet on the same line, so keep both sides.
- Before every push: fetch and merge `origin/main`, resolve conflicts by keeping both sides, then run `npm test` and `npm run build`.
- In `docs/HANDOFF.md`, append to “Items added so far” and renumber on merge; edit only the lines about your own garments.
