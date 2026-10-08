# Working handoff

Last updated: 8 October 2026.

## Read first

Read [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) for the product's intent and agreed constraints, then the [README](../README.md) for running the code. The brief deliberately distinguishes goals from implementation. Later explicit user decisions can supersede it; update the documentation when that happens.

## Current implementation

- Static JavaScript app with Three.js 0.180.0; no runtime AI or service API calls.
- Procedural doll and a separate replaceable wardrobe group. The cute face and revised compact body are the current visual baseline. The shoulders were softened on user request: arms start slightly lower (`makeDoll`), and `roundSleeveCap()` curves the outer top of every reference-top sleeve.
- Knit sweater, striped shirt, barrel jeans, and optional pleated skirt over jeans with a ribbon.
- Three authored outfits: Tomato mischief, Butter club, Garden party crasher, plus one study preset per reference top. These are presets, not a generative stylist.
- Sweater and denim colours, sweater sleeve volume and hem, trouser volume, and layer toggles.
- Bounded text parser, turn controls, draft persistence and a 24-look browser lookbook.
- Earlier vector implementation retained at `illustration.html`.
- Twenty-nine tests were passing and the static build succeeded at this handoff. Geometry and UI checks do not establish visual quality; full device/WebGL appearance and performance still require review.

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
| `tests/shoes.test.js` | Shoe slot, boot construction, how every bottom layers with every shoe, shoe selector |
| `scripts/build.mjs` | Static build including local Three.js dependencies |
| `.github/workflows/pages.yml` | Manually dispatched Pages deployment |

The current flat recipe is not a garment database. It holds colours, bounded numeric controls and layer booleans for the procedural study. Ten catalog entries now exist. Each declares a `slot`. Tops are selected by `topId`: `desigual-bronze-mesh-v1` and `lilac-portrait-mockneck-v1` use fitted geometry and bundled generated textures; `desigual-crochet-flowers-v1` and `mango-plaid-jumper-v1` use their own geometry and textures drawn procedurally in `model.js`. A catalog `layering.coversWaistband` flag hides the skirt's ribbon bow under tops whose hem covers the waist. Bottoms are selected by `bottomId`: `topshop-barrel-jeans-v1`, `desigual-davinia-jeans-v1`, `levis-94-wide-leg-v1`, `tommy-ultra-high-mom-v1` and `stradivarius-relaxed-v1` replace the built-in jeans. All catalog jeans are built by `makeJeans()` from a `build` spec in their catalog entry, each with a denim swatch processed from its own product photo. Shoes are selected by `shoesId`: the built-in loafers (`'classic'`) are worn from the outfit by `makeShoes()`, no longer part of `makeDoll()`, and `buffalo-aspha-mid-olive-v1` is built by `makeLugBoot()` from its catalog `build` spec. Each pair of shoes reports `rest(side, x, z)`, the height at which a long hem rests on it, and boots also report the space long trousers must drape around (`rest.inside`); `makeJeans()` reads both. `cleanRecipe()` only accepts IDs from the matching slot. The skirt is still a built-in procedural piece; dresses and outerwear have no slot yet. There is no general import pipeline, fitting rig or automatic reference reconstruction yet.

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

Each new kind of garment needs its slot the first time it appears. Top, bottom and shoe slots exist. Dresses and outerwear each still need a slot with layering rules. Button-downs need collar, placket and button details; hoodies need a hood that clears her large head and hair.

Shoes are a third parallel lane (see [AGENTS.md](../AGENTS.md)), agreed with the user on 8 October 2026. The shoe slot was built with the first pair (see its record):

- The classic loafers moved out of `makeDoll` into the outfit (`shoesId: 'classic'`). Her face, body and socks are unchanged, and outfits with loafers render pixel-identical to before.
- Long jeans (`hem: 'rests-on-shoe'`) rest on whatever shoe she wears through `rest()`, and drape around boots through `rest.inside`. Shorter jeans whose hem would end inside a boot sit on its padded collar (`rest.collar`), and the classic jeans tuck into the shaft. `tests/shoes.test.js` checks every bottom with every shoe, so new pairs of jeans and new shoes are covered automatically.
- Open decision: platforms are built inside her existing foot height, so she is not raised. The user was asked whether a heel or platform should make her taller and has not answered yet.
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
8. [Buffalo Aspha olive platform boots](garments/buffalo-aspha-boots.md). First pair of shoes, which added the shoe slot. Chunky lug platform, quilted padded collar, logo-tape heel and tongue tabs, webbing loops and side-window straps; colours measured from the photos. Long jeans drape over them; cropped and ankle-length jeans sit on the collar. The user found the first version “completely shapeless”; it was rebuilt to the side photo's proportions (long low toe, diagonal lacing, tapered shaft, shaped collar, stepped sole). Awaiting their second look.

Fit follows the user, not the product photos: when the user says a garment fits them differently (length, rise, looseness), build it that way and note it in the garment record.

Adding more jeans: write a catalog entry with a `build` spec (copy the closest pair), take a denim swatch from the flat lay or the plainest leg area (`scripts`-free: crop inside the seams, divide by a heavy blur, calibrate, make seamless), measure plain-denim colour in the photos and in a render and adjust the swatch until they match, then add the swatch to `view.js`, the selector and a preset. The layering test picks up new bottoms automatically.

Lessons from these reviews: calibrate colour by measurement, not by eye. Sample plain areas of the photos and the same areas of a render, and adjust until the averages match; studio lighting, tone mapping and sheen shift colours. Match the average only: the photos' light-dark spread comes from their lighting and folds, so don't paint it into the texture (drawn streaks on the jeans read as ruffles). Keep textures as plain as the fabric looks. When a swatch comes from a zoomed close-up, divide out its lighting with a narrow blur (folds otherwise repeat as streaks) and repeat it more often. Check new texture layouts with a temporary checkerboard texture. Keep outfit builds fast (the app rebuilds on every change): measure build time when adding detailed garments. Build trousers as they are sewn: hips that morph into the legs' outline at the crotch (`build.crotch`), never separate tubes pushed into a hip shell, which shows a pouch or ledge. Fabric character (drape, stacking, wear on raised areas, paler seam edges) belongs in the geometry and in shading derived from it, not in painted texture; a perfectly smooth shell reads as plastic. Stitching should be tonal unless the photo shows contrast. Read cut names like “oversized” or “barrel” from the garment's actual silhouette in the photos, not from the word. Judge length against the photos (floor-length means resting on the shoes). Make each piece's distinguishing details large and contrasting enough to identify it from every angle, especially the back. Read “oversized” as the garment's actual cut (boxy, dropped shoulders, straight sleeves), not as extra volume. Before rendering, compare the drawn pattern side by side with the clearest reference crop, and check the count and proportion of motifs on her wide, short torso.

## Operational notes

- Run `npm ci`, `npm test`, and `npm run build`; use `npm run dev` for local development with Node 22+.
- The built application bundles rendering dependencies. An in-chat preview may load Three.js from a CDN; that is a preview convenience, not an AI API or the deployed app's dependency strategy.
- Saving in the full app uses browser local storage. Inline chat previews have used in-memory storage and are not evidence of durable lookbook persistence.
- Deployment is separate from committing. Pages requires the repository setting and a manual workflow run; no live deployment is established by this handoff.
- Reference concept images are not in the repo. Do not assume access to prior chat attachments or scratch paths. Request the image again when exact comparison is necessary.
- Update this handoff when capabilities or the next milestone change. Record actual checks and distinguish visual approval from passing tests.


## Latest lilac hem correction

The user reported trousers showing through both lower sides of the lilac shirt. The lower torso and hem now ease over the trouser hips and seams; a regression check covers narrow, medium and wide jeans. Visual confirmation is next. The crochet sweater added in another chat is preserved.
