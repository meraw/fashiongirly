# Project continuity

Before changing Fashiongirly, read `docs/PRODUCT_BRIEF.md` and `docs/HANDOFF.md`, then `README.md` for setup. These preserve the user's decisions across chats.

- Keep the initial app local and free of required runtime API calls. AI integration is optional future work, not an implicit dependency.
- Preserve the working doll identity: the user likes the face and preferred the revised compact body.
- Treat reference pictures as authoring inputs for reusable, distinctive garments. Garment creation can happen outside the app.
- Prioritise individual fit and construction detail over adding more generic recolours or rough outfits.
- Do not present the keyword parser or curated presets as AI understanding or an autonomous stylist.
- Distinguish existing features from plans, and technical checks from visual/device verification.
- Update the brief and handoff when user decisions or implementation status change. Current explicit user instructions take precedence over these recorded decisions.

# Parallel chats

Up to three chats may add garments at the same time. Each works on its own branch and pull request, never pushes to another's branch, and never force-pushes a branch that has been shared.

- Lanes: one chat owns bottoms (jeans, trousers, `makeJeans()` and its template); another owns tops (sweaters, mesh and button-down shirts, short-sleeved tops, hoodies); a third owns shoes (agreed with the user on 8 October 2026): the new shoe slot, the built-in loafers and socks in `makeDoll`, and how hems rest on shoes. If the user sends a garment from another lane, do it, but say so and keep shared code changes minimal.
- Shared foundations need one owner at a time, agreed with the user first: the doll body (`makeDoll`), shared top helpers (`makeReferenceTop`, `roundSleeveCap`), the outfit assembler (`makeOutfit`), and any new slot (dresses, outerwear, shoes) with its layering rules.
- Small layering fixes that a new garment needs in the other lane (for example easing a top's hem over a new waistband) are allowed; record them in the garment record and the pull request.
- Add, don't rewrite: new garments go in new files where possible (garment record, texture/swatch module). In shared lists, tops go after the last top and bottoms after the last bottom (catalog IDs and entries, the selectors in `index.html`); in `OUTFITS`, bottom studies go first, top studies directly above “Windowpane jumper study” and shoe studies directly above “Tomato mischief”. Shoes get their own catalog section after the bottoms and their own selector after “Choose bottoms”. The lanes then edit different lines.
- Before every push: fetch and merge `origin/main`, resolve conflicts by keeping both sides, then run `npm test` and `npm run build`.
- In `docs/HANDOFF.md`, append to “Items added so far” and renumber on merge; edit only the lines about your own garments.
