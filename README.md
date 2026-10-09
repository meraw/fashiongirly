# Fashiongirly

A tiny living fashion doll with a playful wardrobe. The current homepage is a **reusable 3D doll study** with separate, editable clothing geometry.

The intended product is a girl who **checks the weather and dresses herself each morning**, choosing playful, daring combinations from the user's wardrobe. Finish wardrobe import first, then build daily styling; the current manual studio is the foundation. Weather integration and autonomous outfit selection are not implemented yet.

## Start here in a new chat

Read the [product brief](docs/PRODUCT_BRIEF.md) for the intended experience, approved visual direction, reference-based garment creation, individual fit requirements, and no-API-first constraint. Read the [working handoff](docs/HANDOFF.md) for what exists, what is still planned, and where to resume. [AGENTS.md](AGENTS.md) points coding assistants to these documents.

The first reference garment is now a [Desigual bronze mesh top](docs/garments/bronze-mesh.md). Select “Bronze mesh study” to review its fitted geometry and generated print. The user liked the corrected result. A second [lilac portrait mock neck](docs/garments/lilac-portrait.md) now has a separate front and back, raised collar, and navy patterned sleeves; choose “Lilac portrait study” to review it. A third, the [Desigual blue crochet flower sweater](docs/garments/crochet-flowers.md), has open crochet motifs, a filet neckband and scalloped hem and cuffs; choose “Crochet flower study”. The first piece from the user's own wardrobe list, a [Mango brushed windowpane jumper](docs/garments/mango-windowpane-jumper.md), is under “Windowpane jumper study”. The second, [Topshop acid-wash barrel jeans](docs/garments/topshop-barrel-jeans.md), added a “Choose bottoms” selector; see “Barrel jeans study”. The third, [Desigual Davinia heart jeans](docs/garments/desigual-davinia-jeans.md), is the first pair on the shared jeans template; see “Davinia jeans study”. The fourth, [Levi's '94 baggy wide leg](docs/garments/levis-94-wide-leg.md), is under “Levi's '94 study”. The fifth, [Tommy ultra high rise mom jeans](docs/garments/tommy-mom-jeans.md), is under “Tommy mom jeans study”. The sixth, [Stradivarius relaxed jeans](docs/garments/stradivarius-relaxed-jeans.md), is under “Stradivarius relaxed study”. The seventh, [Mango washed black jeans](docs/garments/mango-washed-black-jeans.md), is under “Mango black jeans study”. The [Bershka grey wide-leg jeans](docs/garments/bershka-grey-wide-leg.md), is under “Bershka grey jeans study”. The [Tommy Jeans Remastered carpenter jeans](docs/garments/tommy-carpenter-jeans.md) are under “Tommy carpenter jeans study”. The [Topshop washed black wide crop jeans](docs/garments/topshop-black-wide-crop-jeans.md) are under “Black wide crop study”. The [Zara elastic-waist cargo trousers](docs/garments/zara-cargo-joggers.md), the first bottoms that are not jeans, are under “Zara cargo trousers study”. The [crystal-embellished straight jeans](docs/garments/crystal-straight-jeans.md) are under “Crystal jeans study”. The [Nike woven track pants with piping](docs/garments/nike-piped-track-pants.md) are under “Nike track pants study”. The first shoes, [Buffalo Aspha olive platform boots](docs/garments/buffalo-aspha-boots.md), added a “Choose shoes” selector; see “Buffalo boots study”. The second pair, [Dr. Martens cow print platform slides](docs/garments/dr-martens-cow-slides.md), is the first that raises her; see “Cow slides study”. The third, [UGG cream platform sneakers](docs/garments/ugg-cream-sneakers.md), is under “Cream sneakers study”. The fourth, [Dr. Martens Blaire Quad chain sandals](docs/garments/dr-martens-blaire-chain-sandals.md), is under “Chain sandals study”. The first short-sleeved top, a [Tommy Hilfiger navy stripe knit polo](docs/garments/tommy-stripe-polo.md), is under “Stripe polo study”. The first button-down, a [Motel tie-dye mesh shirt](docs/garments/motel-tie-dye-mesh-shirt.md), is under “Tie-dye mesh shirt study”. The [Desigual spray-paint floral mesh shirt](docs/garments/desigual-spray-floral-shirt.md) is under “Spray floral shirt study”. The first outerwear, a [Marikoo two-tone hooded windbreaker](docs/garments/marikoo-windbreaker.md) worn zipped closed, added a “Choose outerwear” selector; see “Marikoo windbreaker study”. The [Desigual black faux-leather jacket](docs/garments/desigual-leather-jacket.md) is under “Leather jacket study”. The [Van Gogh patchwork print tee](docs/garments/van-gogh-patchwork-tee.md) is under “Van Gogh tee study”.

## Current milestone

- One permanent doll: large soft head, embroidered-style eyes and smile, rosy cheeks, sculpted dark bob, flower clip, little hands, socks, and loafers.
- A reference mesh top with a stable catalog ID and local texture, plus three editable outfit presets using knit, striped shirt, barrel jeans, and an optional pleated skirt with a ribbon.
- Independently adjustable sleeve volume, sweater hem, jean volume, and garment colours.
- Toggle the sweater, shirt, or skirt independently; rotate the doll with drag or Front / Turn / Back.
- Procedural fabric bump maps and material sheen. No garment photographs, generated outfit pictures, or downloaded character models.
- Validated local garment recipes, browser draft persistence, and a 24-look local lookbook.
- A deliberately limited text interpreter. Try **“butter sweater, enormous sleeves, cropped, wider jeans”**. It reports the changes it understood; this is not AI generation.

This is an initial procedural interpretation of the approved plush-doll concept. It is not a pixel-identical recreation of the concept image, a fully rigged animated character, or a cloth simulation. Full WebGL appearance and touch performance still need device review. Geometry and UI tests do not establish visual fidelity.

## Run

Node.js 22 or later:

```sh
npm ci
npm run dev
```

Open http://localhost:5173. To use a phone on the same network, open your computer's local IP with port 5173.

```sh
npm test
npm run build
```

Deploy `dist/` to a static host. All runtime dependencies are copied into the build: no CDN requests, credentials, or API calls are needed. App paths work at a repository subpath such as `/fashiongirly/`.

For GitHub Pages: select **Settings → Pages → Source → GitHub Actions**, then run **Deploy Pages** from Actions. Committing code alone does not publish it.

## Source map

- `src/doll/model.js`: doll identity and separately constructed outfit, procedural fabric textures, and resource disposal.
- `src/doll/recipe.js`: clothing recipe validation and bounded description editing.
- `src/doll/view.js`: Three.js camera, lighting, touch rotation, and rendering lifecycle.
- `src/doll/app.js`: controls, draft storage, and lookbook.
- `illustration.html`: the earlier vector study, retained for comparison.

The renderer rebuilds only the outfit on a wardrobe edit. The doll's identity remains in the scene. Sleeve, body, cuff, collar, and trouser surfaces are authored approximations with explicit controls, not sewing-pattern reconstruction.

## Checks and limits

`npm test` covers finite geometry and supported parameter extremes, layer toggles, silhouette changes, safe recipe handling, description editing, UI save/restore, and failed WebGL startup. It also preserves the earlier vector recipe tests. An offline geometry projection was inspected; it does not reproduce WebGL fabric shading. Browser/device QA remains outstanding.

Data lives in this browser. Clearing browser storage removes drafts and saved looks. Weather, autonomous daily styling, arbitrary garment generation, automatic reference-photo intake, real cloth physics, animation, and cloud sync are future work.

### Playful outfit studies

Three editable outfit ideas combine knit, denim, striped shirt and a new pleated skirt over jeans. The skirt is a separate procedural garment with a ribbon, saved with the rest of the recipe. These are authored styling presets, not an AI stylist or cloth simulation. The compact body and face remain unchanged.
