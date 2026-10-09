# Working handoff

Last updated: 8 October 2026.

## Read first

Read [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) for the product's intent and agreed constraints, then the [README](../README.md) for running the code. The brief deliberately distinguishes goals from implementation. Later explicit user decisions can supersede it; update the documentation when that happens.

## Core destination and current phase — user clarification, 8 October 2026

Weather-aware daily self-dressing is a core goal: she checks the weather and creates her own playful, daring outfit from the user's imported wardrobe, with hair chosen as part of the look. Finish wardrobe import first, then build that experience. Manual selectors and preset studies are the current construction/review tools, not the final goal.

Every chat should retain independently selectable garments and record known styling, coverage/warmth and layer-compatibility information needed by later outfit selection. Mark unknowns rather than inventing weather performance. The current no-API phase remains in force; the weather source and daily/background behaviour are not yet chosen. The product brief now records the sequence and boundaries.

## Current implementation

- Static JavaScript app with Three.js 0.180.0; no runtime AI or service API calls.
- Procedural doll and a separate replaceable wardrobe group. The cute face and revised compact body are the current visual baseline. The shoulders were softened on user request: arms start slightly lower (`makeDoll`), and `roundSleeveCap()` curves the outer top of every reference-top sleeve.
- Knit sweater, striped shirt, barrel jeans, and optional pleated skirt over jeans with a ribbon.
- Outerwear slot with two zip windbreakers and a leather jacket, worn over any top, bottoms, skirt or dress (`src/doll/outerwear.js`).
- Three authored outfits: Tomato mischief, Butter club, Garden party crasher, plus one study preset per reference top. These are presets, not a generative stylist.
- Sweater and denim colours, sweater sleeve volume and hem, trouser volume, and layer toggles.
- Bounded text parser, turn controls, draft persistence and a 24-look browser lookbook.
- Earlier vector implementation retained at `illustration.html`.
- Sixty-eight tests were passing and the static build succeeded at this handoff. Geometry and UI checks do not establish visual quality; full device/WebGL appearance and performance still require review.

## Code landmarks

| File | Responsibility |
| --- | --- |
| `src/doll/model.js` | Procedural character and outfit geometry, materials, resource cleanup |
| `src/doll/recipe.js` | Current flat recipe, validation, bounded parser, curated outfits |
| `src/doll/app.js` | Controls, preset application, persistence and lookbook |
| `src/doll/view.js` | Three.js rendering, camera, turn interaction and lifecycle |
| `src/doll/boot.js` | Entry point and page lifecycle |
| `src/doll/studio.css`, `index.html` | Studio interface |
| `tests/doll.test.js` | Geometry bounds, layer edits, UI persistence and error handling, sleeves and cuffs of every top over her arms and hands |
| `tests/tops.test.js` | Each reference top, and tops over the skirt, the trousers and each other |
| `tests/bottoms.test.js` | Bottom slot, each pair of jeans or trousers, and every waist-covering top over every bottom |
| `src/doll/outerwear.js` | Outerwear builders (zip windbreaker template) and their colour layouts |
| `src/doll/shirts.js` | Button-down shirt template: point collar, buttoned or open placket, long sleeves; one style per shirt (print, fabric, stitching, buttons) |
| `src/doll/polo.js` | Knit polo builder (stripe knit, polo collar, open placket, short sleeves) |
| `tests/outerwear.test.js` | Outerwear slot, each jacket's construction, coverage of every top, arms inside its sleeves, selector |
| `tests/outerwear-bottoms.test.js` | Outerwear coverage of every bottom and the skirt (the coverage check is shared in `tests/outerwear-coverage.js`) |
| `tests/shoes.test.js` | Shoe slot, boot construction, how every bottom layers with every shoe, shoe selector |
| `src/doll/level-caster.js` | `levelCaster()`: the same hit as a three.js Raycaster for level rays, much faster, optionally around a vertical axis the rays start from; used by `makeJeans()`, `surfaceProbe()` and the layering tests (`tests/level-caster.test.js`) |
| `scripts/build.mjs` | Static build including local Three.js dependencies |
| `.github/workflows/pages.yml` | Manually dispatched Pages deployment |

The current flat recipe is not a garment database. It holds colours, bounded numeric controls and layer booleans for the procedural study. Thirty-two catalog entries now exist. Each declares a `slot`. Tops are selected by `topId`: `desigual-bronze-mesh-v1` and `lilac-portrait-mockneck-v1` use fitted geometry and bundled generated textures; `desigual-crochet-flowers-v1` and `mango-plaid-jumper-v1` use their own geometry and textures drawn procedurally in `model.js`. A catalog `layering.coversWaistband` flag hides the skirt's ribbon bow under tops whose hem covers the waist. Bottoms are selected by `bottomId`: `topshop-barrel-jeans-v1`, `desigual-davinia-jeans-v1`, `levis-94-wide-leg-v1`, `tommy-ultra-high-mom-v1`, `stradivarius-relaxed-v1`, `mango-washed-black-v1`, `bershka-grey-wide-leg-v1`, `tommy-remastered-carpenter-v1`, `zara-cargo-joggers-v1` (cargo trousers, not jeans), `crystal-straight-jeans-v1` and `nike-piped-track-pants-v1` (track pants) replace the built-in jeans. All catalog jeans are built by `makeJeans()` from a `build` spec in their catalog entry, each with a denim swatch processed from its own product photo. Shoes are selected by `shoesId`: the built-in loafers (`'classic'`) are worn from the outfit by `makeShoes()`, no longer part of `makeDoll()`; `buffalo-aspha-mid-olive-v1` and `ugg-lowmel-cream-v1` are built by `makeLugBoot()` (templates `lug-boot` and `sneaker`) and `dr-martens-cow-slide-v1` by `makePlatformSlide()`, each from its catalog `build` spec. Low shoes bring her own ankle socks (`ownSocks`). Shoes with a sole thicker than her foot raise her (`lift`, `fitDoll()`). Each pair of shoes reports `rest(side, x, z)`, the height at which a long hem rests on it, and boots also report the space long trousers must drape around (`rest.inside`); `makeJeans()` reads both. `cleanRecipe()` only accepts IDs from the matching slot. Outerwear is selected by `outerwearId` (`'none'` by default): `marikoo-two-tone-windbreaker-v1` and `red-bull-racing-stone-windbreaker-v1` are built by `makeZipWindbreaker()` (the Red Bull jacket uses its optional one-colour layout, drawn seams and prints, covered zip and toggles) and `desigual-black-faux-leather-jacket-v1` by `makeLeatherJacket()`, both in `src/doll/outerwear.js` from their catalog `build` specs and sharing `jacketBody()` and `centreZip()`; outerwear is added last by `makeOutfit()`. A jacket hides the sleeves of the top under it (`layering.coversTopSleeves`); zipped closed it also closes over the classic shirt's collar points (`layering.closed`); it covers the skirt's bow (`layering.coversWaistband`). Outerwear designed to be worn open (`layering.canOpen`) has a “Wear it open” setting (`outerwearOpen`), on by default when `layering.openByDefault`. The leather jacket fits to the layers under it (`build.fit`): built at its own slim fit on her, it eases out only where those layers need room. The skirt is still a built-in procedural piece. Dresses are selected by `dressId` (see the dress slot below). There is no general import pipeline, fitting rig or automatic reference reconstruction yet.

## Latest decisions

- The app must start without API calls; AI can be considered later if necessary.
- References can be processed outside the app. The durable result belongs in the wardrobe catalog as a reusable asset and data.
- Garments need recognisable construction details, not just recolours.
- Improve one garment's fit before adding many more rough options.
- The bounded input is now labelled “Quick edits”. Unsupported sweater edits do not alter the reference top.

## Where to resume

The user supplied front and back pictures of a detailed Desigual bronze mesh top. Its first implementation is available via the top selector and “Bronze mesh study” preset. Review [the garment record](garments/bronze-mesh.md), then get feedback on recognition and fit on the doll. Do not ask for the first reference again unless the actual pictures are needed and unavailable in the new chat.

Latest feedback: the user says the top looks very good apart from two elbow holes. Arm/sleeve intersections were confirmed and corrected by re-centring the sleeves and adding local elbow clearance, with a regression test. The user subsequently said “This is really nice” and requested a second reference garment. The back currently reuses the front-facing motif, and sleeve glyphs are approximate. Preserve these limitations in future handoffs. The second garment is now the lilac portrait mock neck, inferred from two pictures without a written feature list. Its separate front/back materials, raised collar, longer hem and patterned sleeves are implemented; review [its record](garments/lilac-portrait.md) and gather visual feedback next.

The third garment is the Desigual blue crochet flower sweater, authored from a product page link rather than attached pictures. See [its record](garments/crochet-flowers.md); it also awaits the user's visual feedback. Its renders were only checked by the authoring chat in headless Chromium. The user liked it and reported the garments render okay with occasional issues.

Latest feedback: the doll's shoulders looked far too square. The cause was mostly the fitted tops: a flat shoulder shelf and open sleeve tops rising above it. The arms were also attached as high as the top of the body, which prevented rounding the sleeves without exposing the arm. Fix: arm tops lowered slightly (hands and elbows unchanged), softer shoulder rows on the bronze, lilac and crochet bodies, and rounded sleeve caps. The sleeve test now checks clearance over the whole upper arm and that each sleeve's outer top sits below its inner top. Awaiting the user's visual review. The trousers showing through the lilac hem were fixed separately; see the lilac hem correction below.

## Garment intake from links

The user sends pictures or product links found online, not photos of their own clothes, and does not edit code. Tested on 8 October 2026 from this cloud environment:

- ASOS (`www.asos.com`): failed. First blocked by the environment's network policy. After the user allowed it, the site closed the connection, which looks like bot protection. Do not try to evade it.
- Desigual (`www.desigual.com`): worked with a plain download, giving the description, composition and four distinct product views. The web-reading tool still reported the domain blocked, so use a direct download.
- Zalando (`www.zalando.ie`): failed with an Akamai bot-protection block page. The user sent phone screenshots instead, which worked well.
- Ceneo (`www.ceneo.pl`): failed with a captcha.

So far, large multi-brand shops and price-comparison sites block automated fetching; a brand's own site worked once. Screenshots of the product gallery are a reliable fallback.

Fetching a page depends on both the environment's network settings and the shop. When a link fails, say so and ask for the pictures; do not guess the garment from its name. Do not commit downloaded product photos. Exception, at the user's request: the barrel jeans bundle a small processed fabric swatch from the product flat lay, because invented denim never looked like the real jeans. Prefer textures taken from the garment's own pictures (processed swatches or generated atlases) over invented ones, and note any bundled photo-derived material in the garment record.

## The user's wardrobe and how to add it

Any chat adds whatever category the user tells it to; categories are no longer assigned to particular chats (the user's decision, 8 October 2026, because bottoms will run out sooner than tops). See [AGENTS.md](../AGENTS.md) for how parallel chats avoid conflicts.

The user wants to add their whole wardrobe, **one item at a time**, reviewing each piece before the next. Their rough inventory (8 October 2026):

- about a dozen sweaters/jumpers, some heavier than others
- a few mesh shirts, some with buttons
- a few button-downs
- about ten pairs of jeans and about five non-denim trousers
- three or four dresses
- a few short-sleeved tops
- a few hoodies
- about seven coats and other outerwear (layering matters)
- about ten pairs of shoes (the user expects these to be harder)

Sort garments by how the user wears them, not by the shop's name for them (8 October 2026). Some pieces are both: the user wears cardigans on their own over bare skin, or over a blue sleeveless top. The user asked for the best solution to that ambiguity, and it is this rule:
- **Outerwear** is for pieces only ever worn over a top (coats, jackets). It goes closed over whatever top is chosen.
- **A top that can also go over another top** (cardigans; zip hoodies worn either way) stays a top, with `layering.overTop: true`. It can take one slim top under it, chosen by `underTopId` (default `'none'`, so saved looks are unchanged) from the tops marked `layering.underTop: true` (the bronze and lilac tops so far; the user's blue sleeveless top when it arrives). `cleanRecipe()` enforces both flags.
- `makeOutfit` builds the under top with the same builders (`makeTop()`, named `under-top`). It hides the under top's sleeves inside the outer sleeves, hides the outer top's skin piece, and eases the under top's body in a little below its collar. The collar still shows above the outer neckline, as a crew or mock neck does. A test checks that every under top stays inside the cardigan except in its V. The studio has an “Under it” selector, enabled only for such tops.

Each new kind of garment needs its slot the first time it appears. Top, bottom, shoe, outerwear and dress slots exist.

The dress slot (added 9 October 2026 with the first dress, by the chat the user sent it to):
- `dressId` (`'none'` by default, so saved looks are unchanged) holds a catalog entry with `slot: 'dress'`.
- A dress is worn instead of the top, any under top, the classic knit and shirt, the bottoms and the skirt. Those stay in the recipe, so taking the dress off restores them; `makeOutfit` simply does not build them.
- Shoes, hair and outerwear go with a dress. Outerwear is measured or closed over it like over a top, and hides the dress sleeves.
- A dress brings skin for her legs below its hem (her body under clothes is cream felt), down into her socks.
- In the studio, “Choose a dress” follows “Choose outerwear”. Choosing a top or bottoms takes the dress off, and the top's and bottoms' layer controls rest while a dress is on. Button-downs need collar, placket and button details; hoodies need a hood that clears her large head and hair.

The outerwear slot and its layering rules were built with the first jacket (see its record):

- `outerwearId` (`'none'` by default, so existing looks and saved looks are unchanged; renders without outerwear are pixel-identical to before). Outerwear is worn over whichever top, bottoms and skirt are selected, and sits out over the skirt when one is worn.
- How the user wears outerwear (8 October 2026): zipped or buttoned closed, or not at all. Build a piece open only when it looks good open or is designed to be worn open. The leather jacket is one the user often wears open: it has a “Wear it open” setting and starts open.
- A closed jacket hides the top's sleeves (its gathered cuffs are tighter than any top's sleeve), closes over the classic shirt's collar points and covers the skirt's bow. `tests/outerwear.test.js` and `tests/outerwear-bottoms.test.js` check every outer layer against every top, every bottom and the skirt, and that her arms and hands stay inside its sleeves, so new tops, bottoms and jackets are covered automatically.
- Her large head and hair hide the collar and the top of a lowered hood; judge hoods from the back with the bun or a ponytail as well as the bob.
- Adding more zip jackets: copy the Marikoo entry's `build` spec and adjust the rows, yoke layout and details. Coats with other closures (buttons, belts, longer lengths over the skirt) will need their own template in `outerwear.js`.

The shoe slot was built with the first pair (see its record):

- The classic loafers moved out of `makeDoll` into the outfit (`shoesId: 'classic'`). Her face, body and socks are unchanged, and outfits with loafers render pixel-identical to before.
- Long jeans (`hem: 'rests-on-shoe'`) rest on whatever shoe she wears through `rest()`, and drape around boots through `rest.inside`. Shorter jeans whose hem would end inside a boot sit on its padded collar (`rest.collar`), and the classic jeans tuck into the shaft. `tests/shoes.test.js` checks every bottom with every shoe, so new pairs of jeans and new shoes are covered automatically.
- Height in shoes (decided with the user on 8 October 2026): she stays anchored to the floor and is never shrunk, and her head is not pinned. A shoe whose sole is thicker than her built-in foot raises the whole doll and everything she wears by the difference. The Buffalo platform fits inside her foot height, so it raises nothing. Built with the Dr. Martens slides: each pair of shoes reports `userData.lift`, `makeOutfit()` raises everything else she wears by it, and `fitDoll(doll, outfit)` raises her body and hides her socks under open shoes (`bareFeet`). Open shoes bring her bare feet with them.
- Judge every pair from the side as well as the front and back, because shoes are mostly seen below a hem. Build boots to the product photo's side proportions (length about twice the height, a low toe, the lacing diagonal, a shaft that hugs the ankle); the first Buffalo version used her short toy foot and read as shapeless.
- Adding more boots: copy the Buffalo entry's `build` spec and adjust the upper slices, sole and details; measure the upper and sole colours in the photos and in a render, as for denim.

Items added so far:

1. [Mango windowpane jumper](garments/mango-windowpane-jumper.md). First version: the user found it awkward (balloon-like rather than boxy) and the check a different pattern. Revised; the user then sent the next item without further comment on the revision.
2. [Topshop acid-wash barrel jeans](garments/topshop-barrel-jeans.md). Added the bottom slot; its layering test also found and fixed the bronze top clipping over trousers. Approved by the user (“Ok, that works”) after five revisions: straight floor-length fit, bolder details, drape and stacking geometry, and denim taken from the product photo as a processed swatch. The user still considers the jeans below the tops' quality overall and does not expect the shape to improve much further.
3. [Desigual Davinia heart jeans](garments/desigual-davinia-jeans.md). First pair on the shared jeans template (`makeJeans()` with a `build` spec in the catalog). The user found the crotch strange; it was rebuilt as sewn (hips morphing into the legs), applied to both pairs, and the user said it “looks better”. The user asked for “a few more jeans” next.
4. [Levi's '94 baggy wide leg](garments/levis-94-wide-leg.md). Washed black wide legs with arc stitching, red tab and frayed pocket edges. Full length resting on the shoes, confirmed by the user (a brief shortening came from mixing it up with another pair); awaiting visual review.
5. [Tommy ultra high rise mom jeans](garments/tommy-mom-jeans.md). Mid-wash, tapered to the ankle, with rivets, stitched pocket bars, badges and a flag patch. Its high waistband led to easing the bronze and lilac tops at the waist, a large speed-up of building jeans and of the tests, and a denim layout fix at the crotch for all pairs. Awaiting visual review.
6. [Stradivarius relaxed jeans](garments/stradivarius-relaxed-jeans.md). Light bleached relaxed wide jeans pooling over the shoes; no new template options. The user said they look great and asked for a greyer colour, closer to their real pair; adjusted.
7. [Bershka asymmetric stripe jumper](garments/bershka-stripe-jumper.md), added by the tops chat. Ecru slub knit with dark green stripes, worn off her left shoulder, with a deep ribbed hem band and cuffs. The first off-the-shoulder top: it brings a skin piece for the bare shoulder (her body under clothes is cream felt) and a catalog `layering.bareShoulder` flag that the shared sleeve test respects. The user found the first bare shoulder fragmented (separate body and sleeve edges). It now has one neckline cut from the body, which wraps over her left arm, with the sleeve starting below. Awaiting their second look.
8. [Mango washed black jeans](garments/mango-washed-black-jeans.md). High-rise relaxed straight washed black, ankle length, from eBay listing photos; adds `backDarts`. At the user's request, its light grey double topstitching was added (`stitchScale`, `doubleSeams`, `roping`, `hemStitch`); the user then sent the next pair.
9. [Cream pointelle flower jumper](garments/cream-pointelle-flower-jumper.md), added by the tops chat from the user's own photos. Boxy openwork knit with raglan sleeves, a wide boat neck, scalloped edges and eight raised raspberry flowers on the front. Skin is drawn inside it to show through the eyelets. Awaiting visual review.
10. [Bershka grey wide-leg jeans](garments/bershka-grey-wide-leg.md). Neutral grey wash, full length over the shoes, with bleached thigh panels and bold whiskers front and back; adds `whiskerLines` and `centreFade`. The user sent the next pair without commenting on it.
11. [Desigual silver foil cable jumper](garments/desigual-silver-cable-jumper.md), added by the tops chat. Cropped black knit coated in silver: a diamond lattice panel, rib and rope-cable columns, wavy sleeve cables and long black-grooved ribbing, drawn as a height field that drives both the colour and the bump. Awaiting visual review.
12. [Buffalo Aspha olive platform boots](garments/buffalo-aspha-boots.md). First pair of shoes, which added the shoe slot. Chunky lug platform, quilted padded collar, logo-tape heel and tongue tabs, webbing loops and side-window straps; colours measured from the photos. Long jeans drape over them; cropped and ankle-length jeans sit on the collar. The user found the first version “completely shapeless”; it was rebuilt to the side photo's proportions (long low toe, diagonal lacing, tapered shaft, shaped collar, stepped sole). Awaiting their second look.
13. [Desigual × Lacroix giant flower sweater](garments/desigual-lacroix-flower-sweater.md), added by the tops chat. Fuzzy olive knit painted procedurally with giant violet flowers front and back, a white peony and forearm flowers, with olive cuffs and a lilac crew neck. The user found the sleeve ends jagged: snug cuffs cut through her thumb. `easeOverHand()` now eases every snug cuff on the tops over her hand (tested), and ribbed bands have eight segments per rib. With the user's agreement this extends to the bronze and lilac tops, through the shared `makeReferenceTop()`. Awaiting visual review.
14. [Tommy Jeans Remastered carpenter jeans](garments/tommy-carpenter-jeans.md). Black wash with white double stitching, carpenter panels over the front hips, utility pockets on both thighs (flag badge on the left, hammer loop on the right) and a striped tape across the right back pocket; adds `frontPanel`, `sidePocket`, `backPocket.tape` and `rivetColour`. The user found the legs a little too wide and said the jeans stop at their ankle: narrowed and shortened to the ankle. The user then sent the next item without commenting on the revision.
15. [Marikoo two-tone hooded windbreaker](garments/marikoo-windbreaker.md), added by the outerwear chat. First piece of outerwear, which added the outerwear slot. Slate blue with an ecru yoke ending in a V at the front, zipped closed with the hood down, drawcords, snap welt pockets, elastic hem and cuffs, embroidered script and a sleeve badge; colours measured from the photos. Approved by the user on the first version (“Yes, it's good”).
16. [Tommy Hilfiger green cable sweater](garments/tommy-green-cable-sweater.md), added by the tops chat. Forest green rope cables all over (drawn as relief; revised after the user found too much dark space between them, so the cables now sit close with thin, shallow grooves), raglan sleeves, deep ribbing and a small flag on her left chest. Its raglan seams and flag use `surfaceProbe()` and `raglanSeams()`, now shared with the pointelle jumper. Awaiting visual review. For daily self-dressing, every catalog top now has a `styling` record: silhouette, palette, pattern, coverage (neck, sleeves, midriff), material, weather notes, and relative warmth from 1 (light) to 4 (very warm). Each warmth value records its basis, the user's word or an inference; a test requires these fields on every top.
17. [Dr. Martens cow print platform slides](garments/dr-martens-cow-slides.md). First open shoe and the first pair that raises her: chunky sculpted platform, grooved welt with yellow stitching, crossed cow-print pony-hair straps with cords, a buckled instep strap, and her bare felt feet (made fuller, then reshaped as one smooth foot after the user's feedback). Long jeans rest on the straps; cropped ones show her ankles. Awaiting visual review.
18. [Zara elastic-waist cargo trousers](garments/zara-cargo-joggers.md). The first bottom that is not jeans: black crinkled woven with a gathered elastic waist and drawstring, flap cargo pockets on both thighs and elastic ankle cuffs. The jeans template's hardware is now optional; adds `surface`, `waistband.gathers`, `drawstring`, `cuff`, `sidePocket.flap` and `centreFront`. The user said they “look fine”.
19. [Desigual black faux-leather jacket](garments/desigual-leather-jacket.md), added by the outerwear chat. Cropped glossy crinkled faux leather, usually worn open, with a point collar, yoke and panel seams, zip pockets over pleated flap pockets with silver snaps, a rib-knit hem band and ruched sleeves with tabbed leather cuffs. Adds the `leather-zip-jacket` template; the windbreaker's body and zip code became shared helpers, with the windbreaker unchanged. The user found the first version bloated and said they often wear it open. It now fits to the layers under it and has slimmer sleeves. It has the first “Wear it open” setting and starts open. The user preferred it zipped and found the open version warped at the middle: the fronts now slide out sideways and hang forward instead of turning round her. Awaiting their third look.
20. [Petit Bateau striped cardigan](garments/petit-bateau-striped-cardigan.md). Cream fisherman rib with navy stripes on the lower body and forearms, a deep V, a button band with five buttons and a sleeve badge, worn buttoned over bare skin or over a slim top. Refitted as the user wears it: oversized, to mid-thigh well below the crotch, with sleeves over most of the hands. Awaiting visual review.
21. [Tommy Hilfiger navy stripe knit polo](garments/tommy-stripe-polo.md). The first short-sleeved top. Fitted fine knit in navy and off-white stripes (60% navy, measured), a navy polo collar worn open over a narrow V, a navy placket with three visible buttons, a white script monogram, short sleeves with rib bands and a sleeve flag; built by `makeKnitPolo()` in `src/doll/polo.js`. Short sleeves add a catalog `layering.bareArmBelow` that the shared sleeve test respects, and a closed jacket now hides the polo's collar. Awaiting visual review.
22. [UGG cream platform sneakers](garments/ugg-cream-sneakers.md). Low chunky cream sneakers, suede over mesh, with big puffy patterned laces in a floppy bow, a heel pull loop and a rounded platform sole. The first low shoe: it brings her own slim ankle socks (her round doll socks would bulge over the collar). Built on the Buffalo boots' laced-shoe template. The user liked the soles but found the ankle too loose, so the collar now hugs the ankle and the sock is fuller. Awaiting their second look.
23. [Crystal-embellished straight jeans](garments/crystal-straight-jeans.md). Light vintage wash, high rise, straight and full length, with a grid of crystals over the whole front (one instanced mesh); adds `crystals`. The shared layering test now checks instanced pieces too. The user found it very realistic but could not see the crystals at screen size: they are now fewer, larger and near-white, in dark settings, and read clearly at phone size. The user said the revision “looks great”.
24. [Motel tie-dye mesh button-down shirt](garments/motel-tie-dye-mesh-shirt.md). The first button-down. Fitted, cropped stretch mesh in a grey-mauve tie-dye (drawn procedurally; its spread from dark to pale is measured from the photos), a point collar with black topstitching on a black-faced stand, a black-stitched placket with seven black buttons, long fitted sleeves and a black-stitched hem; built by `makeButtonShirt()` in `src/doll/shirts.js`. A zipped jacket now hides any `shirt-collar*` piece. Awaiting visual review.
25. [Desigual spray-paint floral mesh shirt](garments/desigual-spray-floral-shirt.md). The second button-down: vivid pink, coral and red spray-paint clouds with cream stencilled flowers (drawn procedurally; shares measured on the flat lay), worn with the top button open, seven peach buttons showing, tonal stitching. The tie-dye shirt's builder became a shirt template (`makeButtonShirt()` with a style per shirt); the tie-dye shirt is unchanged (fingerprinted). Awaiting visual review.
26. [Navy half-zip track mini dress](garments/navy-half-zip-track-dress.md), the first dress, which added the dress slot. Navy textured rib jersey with cream raglan sleeve panels, a tall zip collar and a short A-line skirt, worn with bare legs. Awaiting visual review.
27. [Van Gogh patchwork print tee](garments/van-gogh-patchwork-tee.md). Fitted short-sleeved raglan tee pieced from Van Gogh prints (a swirling sky with clouds, white roses on green), with green overlocked seams and lettuce edges. Its print atlas is projected from the user's photos onto the doll's body (`src/doll/printed-tee.js`, template `printed-raglan-tee`). Awaiting visual review.
28. [Nike woven track pants with piping](garments/nike-piped-track-pants.md). Raspberry woven nylon with a gathered drawstring waist, wide full-length legs and white piping curving down each leg, plus a small white tick on the left thigh; adds `piping`, `tick`, `drawstring.knot`/`metal` and `weltColour`, and records styling facts in the tops' format. Awaiting visual review.
29. [Red Bull Racing stone windbreaker](garments/red-bull-racing-windbreaker.md). A one-colour stone windbreaker zipped under a storm placket, with a tall collar (hood stowed), snaps and toggles, raglan and curved front seams, a back flap seam and reflective prints (suggested by generic glyphs, not lettered). On the zip-windbreaker template, which gained optional settings for it (one-colour body, drawn seams, prints, covered zip, toggles, rectangular patch); the Marikoo windbreaker is unchanged (fingerprinted). Awaiting visual review.

Fit follows the user, not the product photos: when the user says a garment fits them differently (length, rise, looseness), build it that way and note it in the garment record.

Adding more jeans: write a catalog entry with a `build` spec (copy the closest pair), take a denim swatch from the flat lay or the plainest leg area (`scripts`-free: crop inside the seams, divide by a heavy blur, calibrate, make seamless), measure plain-denim colour in the photos and in a render and adjust the swatch until they match, then add the swatch to `view.js`, the selector and a preset. For very dark denim, whose photos show JPEG colour blotches when the contrast is raised, keep only the swatch's brightness variation and take the colour from the measured average. The layering test picks up new bottoms automatically.

Lessons from these reviews: calibrate colour by measurement, not by eye. Sample plain areas of the photos and the same areas of a render, and adjust until the averages match; studio lighting, tone mapping and sheen shift colours. Match the average only: the photos' light-dark spread comes from their lighting and folds, so don't paint it into the texture (drawn streaks on the jeans read as ruffles). Keep textures as plain as the fabric looks. When a swatch comes from a zoomed close-up, divide out its lighting with a narrow blur (folds otherwise repeat as streaks) and repeat it more often. Check new texture layouts with a temporary checkerboard texture. Keep outfit builds fast (the app rebuilds on every change): measure build time when adding detailed garments. Build trousers as they are sewn: hips that morph into the legs' outline at the crotch (`build.crotch`), never separate tubes pushed into a hip shell, which shows a pouch or ledge. Fabric character (drape, stacking, wear on raised areas, paler seam edges) belongs in the geometry and in shading derived from it, not in painted texture; a perfectly smooth shell reads as plastic. Stitching should be tonal unless the photo shows contrast. Read cut names like “oversized” or “barrel” from the garment's actual silhouette in the photos, not from the word. Judge length against the photos (floor-length means resting on the shoes). Make each piece's distinguishing details large and contrasting enough to identify it from every angle, especially the back. Read “oversized” as the garment's actual cut (boxy, dropped shoulders, straight sleeves), not as extra volume. Before rendering, compare the drawn pattern side by side with the clearest reference crop, and check the count and proportion of motifs on her wide, short torso.

## Operational notes

- Run `npm ci`, `npm test`, and `npm run build`; use `npm run dev` for local development with Node 22+.
- Keep the tests quick, since every chat runs them before every push: the checks that try every bottom with every shoe or top grow with each new garment. When many level rays test the same meshes, use `levelCaster()` instead of a new `Raycaster` per ray (8 October 2026: the jeans-over-shoes test went from about 160s to 17s, and an outfit with catalog jeans builds in about 0.2s instead of 0.9s, with the same geometry, which also makes the app quicker to respond). For rays from her centre line or a leg's centre, pass that line as `axis`, so each ray tests only the triangles at its height and angle; `faces: 'both'` and the farthest hit match the coverage tests' own surface measurements. Generated textures that are the same every time (the knit and denim weave, the cow print) are drawn once and shared (`cachedPixels()`). Node runs a few test files at once, so the slowest file sets the total: put a long new test in the file of its kind (tops, bottoms, shoes, outerwear), and split a file when it grows past the others. With these, `npm test` went from about 2m45s to under a minute on the same day.
- The built application bundles rendering dependencies. An in-chat preview may load Three.js from a CDN; that is a preview convenience, not an AI API or the deployed app's dependency strategy.
- Saving in the full app uses browser local storage. Inline chat previews have used in-memory storage and are not evidence of durable lookbook persistence.
- Deployment is separate from committing. Pages requires the repository setting and a manual workflow run; no live deployment is established by this handoff.
- Reference concept images are not in the repo. Do not assume access to prior chat attachments or scratch paths. Request the image again when exact comparison is necessary.
- Update this handoff when capabilities or the next milestone change. Record actual checks and distinguish visual approval from passing tests.


## Latest lilac hem correction

The user reported trousers showing through both lower sides of the lilac shirt. The lower torso and hem now ease over the trouser hips and seams; a regression check covers narrow, medium and wide jeans. Visual confirmation is next. The crochet sweater added in another chat is preserved.


## Hairstyle lane — separate branch

The user requested a fourth, isolated hair task while three agents add clothes. See [HAIRSTYLES.md](HAIRSTYLES.md). `codex/outfit-hairstyles` adds eight long/up styles plus the original bob, in the existing hair colour; `hairId` saves with looks. Hair modules own their selector and attach to `doll-head` through a view adapter, leaving body, garment builders, catalog and clothing selectors untouched. Clothing presets retain the selected hair. Awaiting visual review; keep this work on its own PR until integrated.

Hair visual feedback: the bob bangs looked awkward on the other styles. The hair adapter now hides both swept-fringe and fringe-thread with the rest of the bob; switching back restores them. Other styles use their own hairline.
