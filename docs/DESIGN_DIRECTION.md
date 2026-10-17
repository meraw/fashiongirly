# Design direction: a collectible doll in a painted miniature world

Last updated: 10 October 2026. The user asked for substantial design improvements on 10 October 2026: the app looked
amateurish, her window was too big and did not merge with the painted background, there was only one background, and
the doll was cute but not impressive. This records the diagnosis, the agreed direction and the order of work, so that
every chat pulls in the same direction. Each step is its own pull request, judged on renders of the same outfit before
and after. The [product brief](PRODUCT_BRIEF.md) still holds; this refines its "Character and visual direction".

## Why the current design feels assembled from separate pieces

Seen in the code and in renders of the app (phone and desktop, three outfits, front, side and back):

- **The world was drawn twice.** The page painted the sunset sky and the mountain range behind everything, and the
  doll's window painted its own sky gradient, its own CSS sun, the same mountain image again at another scale and a
  flat orange polka-dot hill. Two horizons, two suns and two copies of one ridge were the strongest "pasted on" signal
  and the reason the window could never merge with the page.
- **She was lit from the wrong side.** The painting's sun is on the right and its slopes are lit from the right; the
  3D key light sat up and to the left, so her shading disagreed with the landscape's.
- **Nothing reflected the world.** The renderer had no environment map, only a hemisphere light and three directional
  lights. Physical materials need one to show sheen, clearcoat or metal, which is why skin, hair and the leather
  jacket read as the same smooth finish while the painted shoes looked richer.
- **She floated, and she was cramped.** The contact shadow was almost invisible; the camera was close with a wide
  lens, her head touched the top of the frame and the drag hint sat on her feet.
- **Three frames, then boxes.** Cream panel, dashed stitch line, rounded scene, then three bordered look cards, then
  a title repeating the Today card's title under a second woven label.
- **The newer hairstyles are the weakest 3D element.** Alternative styles are a scalp surface with evenly spaced tube
  strands, which read as grooves; the ponytail is a single tapered tube on a four-point curve, a hook from the side
  and a fin from behind. The original bob's chunky sculpted locks look better than the newer styles.
- **The side view gives the proportions away.** The head is a near-sphere about two and a half times deeper than the
  body, which is a flat lozenge: cute from the front, a stand for the head from the side.
- **Decoration density.** Every surface carried linen texture, a dashed stitch, a corner flower, rickrack, woven
  label pills, dotted dividers, dashed outlines inside every swatch, a grain overlay, stars and a glow. Each is nice
  alone; together nothing is the signature.
- **Hierarchy was inverted.** The huge temperature and the narration headline outranked the outfit; the outfit's name
  was small and the three looks were beige boxes.

## The direction

A collectible fashion doll living in an art-directed, painted miniature world. Richness comes from light, materials
and scenery, with few borders and containers. Keep the cute doll, the rich sunset palette and the three daily looks.

### One world, no window

- The scene is the page: one sky, one weather layer, one mountain range, one painted ground, with the transparent 3D
  canvas floating over it on every page. Rain and snow fall over the whole screen.
- On a phone she stands in the top part of the screen on the painted meadow; the three looks sit along the top of a
  sheet that holds pieces, reasons and controls and scrolls up over her. On desktop she stands left of centre with air
  around her, and one panel sits on the right.
- The ground is painted by the same script as the sky and mountains; her real 3D shadow lands on it. A few flowers
  near her feet, drawn larger than life, make her read as tiny.

### Shared light

- Key light warm and from the right, where the painted sun is; a lilac fill from the left; a rim from the sky; the
  orange ground bouncing warmth up under her.
- A small procedural environment map in the sky's colours, purple above and apricot below, so leather, chains, hair and
  skin reflect the same world.
- A larger, softer contact shadow. A lower camera at her chest with a longer lens and headroom, so she is a little
  smaller without being shrunk.
- The lights follow the weather the way the mountains do: cooler and dimmer in rain, flat and pale in snow.

### The doll, in an order that does not break the wardrobe

1. **Hair first.** Rebuild each style from sculpted chunks: a cap with a parting and six to ten overlapping locks
   instead of combed strands. Ponytails are drawn from her head into the tie, with a tail that drops with gravity in a
   soft S and splits into a few tips. One matte plush hair material, with no highlight band (since 11 October 2026: she
   is a plush doll; the first molded material read as a shiny curve, and a ball above the tie read as a bun).
2. **Head second.** Keep the face untouched. Soften the ball with a touch of cheek and a small chin, and shape the back
   of the hair. The eyes, blush, smile and flower are her identity.
3. **Pose third, as a post-process.** Every garment is fitted to the fixed body, so moving limbs breaks the wardrobe.
   Apply one smooth deformation to the assembled doll and outfit together after fitting: a slight weight shift, one
   foot turned out, hands a little forward, a small head tilt. The clothes come along and no garment builder changes.
4. **Body last, if ever.** The torso's depth is the one expensive fix, because every top is fitted to it. It is a
   shared foundation under [AGENTS.md](../AGENTS.md): one owner, agreed with the user first.
5. **A material bible.** Flocked matte skin, plush hair, an embroidered face, knits and cottons with sheen and a normal map, leather with
   clearcoat, metal fully reflective. The shoes set the detail level; the rest rises to meet them.

### The interface: hierarchy and a decoration diet

- Order of importance: the outfit in her world, then the three looks, then pieces and reasons, then a small weather
  chip, then controls and explanations.
- The outfit's name appears once, large, in Fraunces. Each of the three looks gets a short generated name so the tabs
  read as looks, not labels. The narration headline goes.
- One signature: the embroidered flower as brand mark and on the chosen look, rickrack once as the divider between
  scene and sheet, linen only on the sheet. Stitched borders, woven label pills, corner flowers, dashed swatch outlines
  and dotted dividers go. Three type sizes in total.
- Look portraits (17 October 2026, implemented; user approved screenshots and requested a PR): Her pick is visible immediately; Bolder and
  Easier stay under neutral covers until first tried. After her change finishes, the portrait appears and remains
  for the styling day, including reopening. The next day resets alternatives. Render only already revealed looks
  from the fixed trio, using the same doll and clothes. For Dress her, either make each slot a tappable chip that
  opens the wardrobe filtered to that slot, or fold it into Wardrobe.

### A small collection of worlds

- The painting script (`scripts/art/paint-scenery.py`) is parametric: new worlds are mostly new palettes and ridge
  lines plus a few new shapes (soft hills, foliage, a garden wall). Lilac dawn, rainy garden, the current apricot
  evening and a winter morning, each with a calm area behind her, chosen per day with the day's seed and tinted by the
  weather on top.
- Optional: time of day. It is a morning app showing a permanent sunset; one world shifting from dawn through day to
  evening and night would make it feel alive and tie it to the ritual.
- Optional: parallax. Sky, far range, near range and ground are separate layers; a few pixels of parallax as she turns
  makes the diorama feel deep.
- Optional: an idle breath or sway, only while visible and when motion is allowed. The renderer draws on demand today,
  so continuous animation costs battery.

## Sequence

By effect per effort, each its own pull request:

1. Shared light, camera and shadow (the smallest change, improves the doll as she is).
2. One world, no window, with the painted ground and the sheet layout.
3. The decoration diet and the hierarchy, including the look names.
4. Hair.
5. Head.
6. The pose deformation.
7. Worlds and time of day.
8. Look portraits.

## Rules for every step

- No photographs or generated images in the app; painted art comes from the scenery script.
- Keep every element id and the jsdom tests passing; the doll body (`makeDoll`) and the garment builders do not change
  without the user's agreement.
- Show renders in the chat: the same outfit before and after, on phone and desktop, and the doll from the front, side
  and back when she changes.
- Keep each pull request to one layer so it can be judged on its own.

## Briefs to paste into a chat

Shared light and camera:

> Match the 3D lighting to the painted world: a warm key light from the right where the painted sun is, a cool lilac
> fill from the left, a rim from the sky, and a small procedural environment map in the sky's colours so leather,
> knit, hair and skin reflect the same world. Ground her with a larger, softer contact shadow. Lower the camera to her
> chest, use a longer lens and leave headroom so she is a little smaller with air around her silhouette. Let the lights
> follow the weather. Keep all element ids and tests; no photographs. Show before and after renders of the same outfit.

One world:

> Make the doll and her painted world one scene. Remove her window: the 3D canvas becomes a full-bleed transparent
> layer over a single scene (sky, weather, mountains, painted ground) on every page. On a phone she stands in the top
> part of the screen and a sheet with the three looks, pieces, reasons and controls scrolls up over her; on desktop she
> stands left of centre with one panel on the right. Paint the ground with the scenery script and let her shadow land
> on it. Keep ids and tests; show phone and desktop screenshots of Today, Dress her and Wardrobe.

The doll:

> Refine the doll without changing her face or the body the garments are fitted to. Hair: replace the evenly spaced
> scalp strands with a sculpted cap of a few chunky overlapping locks; rebuild the ponytails with a gathered bunch
> above the tie and a tail that falls with gravity in a soft S and splits into several tips; one matte plush hair material
> with a soft highlight band. Head: soften the ball with a little cheek and chin shaping and a shaped back of the hair,
> keeping eyes, blush, smile and flower exactly where they are. Pose: add a resting pose as one smooth deformation
> applied to the assembled doll and outfit together after fitting, so garment builders stay untouched. Render front,
> side and back in three outfits, before and after.

The interface:

> Redesign the interface around one hierarchy: her outfit in the world first, the three looks second, then pieces and
> reasons, with the weather as a small chip. Show the outfit's name once, large, in Fraunces; remove the duplicate
> title and the narration headline. Give each look a short generated name. Keep the embroidered flower as the brand
> mark and on the chosen look, one rickrack divider between scene and sheet, and remove dashed stitch borders, woven
> label pills, corner flowers and dashed swatch outlines everywhere else. Keep ids and tests; show phone and desktop
> screenshots of Today, Dress her and Wardrobe.

## Status

- 10 October 2026: steps 1 and 2 implemented together in one pull request (the light cannot be judged apart from the
  world it is meant to match): shared light, environment, shadow and camera in `src/doll/view.js`; the scene moved to
  the page in `index.html`, `src/doll/studio.css` and `src/today/sky.js`; the painted meadow added to the scenery
  script.
- 10 October 2026, second pull request (the user asked for the interface and the doll together, faster): steps 3 to 6.
  The decoration diet and hierarchy in `src/doll/studio.css` (the generated look names are not done: they need a short
  name per garment, which the catalog does not hold yet). Hair: one molded material (`hairMaterial()` in
  `src/hair/model.js`, shared by the bob), sections sculpted into the hair surface as soft swells instead of strands
  or pieces on top, ponytails with a gathered bunch, a soft fall and rounded tips. Head: a small chin and jaw in `makeHead`, the face untouched. Pose: `src/doll/pose.js`,
  one deformation applied to the doll once, to each hairstyle and to every fitted outfit. Steps 7 and 8 (worlds and
  time of day; look portraits) are open.
- 11 October 2026, third pull request (the user chose nine further improvements and asked for a third to a half of
  them now): a collection of worlds, the time of day, a foreground, and her face following the weather. Four worlds
  (apricot mountains, the original; lilac hills; rain garden; winter wood), each painted by
  `scripts/art/paint-scenery.py` into `src/art/worlds/<id>/` as three skies (golden, day, night), the land, the ground
  and a foreground, with `src/art/worlds/palettes.js` for the light on her. One world a day (`src/today/world.js`): the
  winter wood when it is cold, otherwise one of the others by the day's seed. The skies cross-fade with the sun, from
  the forecast's sunrise and sunset; her 3D light, its reflections and the land's tint follow the world and the hour
  (`src/doll/light.js`). Her expression (`src/doll/face.js`, `setExpression` in `src/doll/model.js`): a wide smile in
  warm sun, rosy cheeks in the cold, a soft smile with lifted brows in the rain, a small dreamy smile in fog. Still to
  do from the user's choice: a twirl when she changes clothes, an attitude for each of the three looks, hair moving in
  the wind, Dress her as a visual picker, and wardrobe filters. Look portraits and look names remain open from step 8.
- 11 October 2026, fourth pull request (the user asked for the rest of the list, split further if too many; split in
  two, her movement first): she twirls when she changes clothes or hair (`src/doll/twirl.js`), one eased turn of just
  under a second with the new clothes put on halfway, while her back is to us. A tuck, an open jacket or a slider
  changes at once, and with reduced motion she does not twirl. An attitude for each look (`ATTITUDES` in
  `src/doll/pose.js`): her pick keeps the resting pose; the bolder look pops her hip, sets her feet apart, lifts her
  left shoulder and raises her chin; the easier look rests her weight the other way, her feet together, her hands
  softly forward and her head tilted gently. The page names the attitude of the look she wears (`:root[data-attitude]`
  and an `attitude-change` event from `src/doll/app.js`), and dressing her by hand puts her back at rest. Every
  geometry is posed again from its unposed shape, so attitudes never add up, and her head turns as a whole, so her
  face is never bent. Hair in the wind (`src/hair/wind.js`): on a windy day (30 km/h or more) her loose hair, the
  ponytails, long lengths, the locks framing her face and the plait, leans and flutters with the wind across the page,
  the ends most, and is never pushed in towards her; buns and the bob stay still, and so does all of it with reduced
  motion. Still to do: Dress her as a visual picker and wardrobe filters, the second half.
- 11 October 2026, the second half: Dress her as a visual picker and wardrobe filters. On Dress her each slot (her
  hair, top, what goes under it, bottoms, shoes, outerwear, a dress) is a chip with the cloth and name of what she
  wears there (`src/doll/picker.js`). A tap opens the slot's pieces as cloth swatches, as on the Wardrobe page: nothing
  first, the user's own pieces by name, the built-in study piece last; her hair is chosen from little drawings of each
  style. A tap on one puts it on, with her twirl; on a phone the picker rises from the bottom of the screen. The
  dropdowns are put away but stay in the page, hidden: they hold the choice, and the page's own handlers do the
  dressing, so choosing a swatch is exactly choosing from the dropdown. The Wardrobe page filters
  (`src/doll/wardrobe-page.js`) by what suits today's weather (`suitedToday()` in `src/style/stylist.js`: every piece
  she would consider for the weather that is in at least one outfit close to the warmth the day asks), by warmth
  (light, mid or warm, on the catalog's scale) and by colour family (the families of a piece's two main colours; navy
  counts as blue, cream as white). Filters combine, a kind with nothing to show is put away, and what she wears stays
  marked. With these, the user's nine choices are done; look portraits and look names remain open from step 8.
- 11 October 2026, her visual direction (the user said the doll still looked like a mess: the ponytail was a round bun
  with a tail coming out of it, the hair was a shiny curve rather than a texture, her features did not belong to one
  kind of doll, and the daisy floated in front of her face). The user chose a **plush doll**: a soft fabric toy, which
  she already resembles. A crocheted doll was considered and set aside, as crochet all over could look creepy; only
  the flower is crocheted. A first try with hair of individual yarn strands was rejected ("horrible"), so the hair keeps
  its sculpted shapes. Now: every style is matte plush fabric (`hairMaterial()` in `src/hair/model.js`: no clearcoat
  or highlight band, a soft sheen at the edges and a fine filtered nap), with sunken sewn seams between the panels of
  the cap; ponytails are drawn from her head into the tie (`gathered()`, a short pleated cone) instead of a ball; the
  plait is three stuffed lobes, without the strand lines, and the bob without its stray thread lines. Her face is
  embroidered: satin-stitch eyes and twisted-floss lids, lashes, brows and smile (`satin()` and `floss()` in
  `src/doll/model.js`); the speckled fibres on her face are gone. The daisy is crocheted (`makeDaisy()`: stitched
  petal edges and a knotted golden centre) and is pinned onto whichever hair she wears (`seatFlower()`), so it no
  longer floats. A pose fix came with it: posing kept each shape's rest in its geometry's `userData`, which cloned
  geometries share, so the plait's twelve lobes were posed into one; `src/doll/pose.js` now keeps rests by geometry.
- 11 October 2026, definition and physical believability (the user: she looked like a fuzzy digital approximation, and
  some garments' sharper construction made her look less finished; a controlled proof of concept on one outfit, keeping
  her identity, expression, proportions, hair colour, fitted body and the app as they are; "soft materials, precise
  construction, not soft focus"). Judged on renders of the Rose sweatshirt study (the Replay sweatshirt's satin-stitched
  roses are the quality reference), before and after, at phone size and close up. What made her soft, and the fix:
  - Real image blur: the renderer capped the pixel ratio at two, so on a phone of three she was drawn at two thirds of
    the screen's resolution and stretched. She is now drawn at the screen's own ratio, up to three, within the pixels
    the view was always allowed on a large screen (`view.js`). Sharper pixels alone only sharpened the noise below.
  - Noise passing for detail: her skin's bump was an unfiltered noise texture (three.js data textures default to
    nearest filtering and no mipmaps), which sparkles into grain when it shrinks; her hair's nap bump was strong; the eye
    satin a small striped tile. Now one fine combed nap, a filtered and mipmapped normal map, for her skin, body and
    (longer, combed down each piece) her hair (`src/doll/plush.js`); her socks a filtered rib knit.
  - Features floating on her face: five-sided tubes and flat discs a hair above the fabric, brows poking out between
    the fringe's locks. Now her face is embroidered into a panel of her head (`src/doll/embroidery.js`), drawn in code
    at the garments' embroidery density: padded satin stitch whose rows run differently in each layer (the whites up and
    down, the irises outward, the pupils across, the stars along their points), twisted floss for the lids, lashes,
    brows and smile, the fabric drawn down round every stitch, and an airbrushed blush with a soft but defined edge.
    Every feature keeps its place, size and colour; the expressions restitch the panel.
  - Hair that was intersecting ellipsoids, with the crown cap's open edge showing as a ledge over the fringe. Now a
    sewn bob in the old silhouette (`src/doll/bob.js`): one quilted shell from a whorl on her crown, sunken seams down
    the back, the swept fringe as seven stuffed locks ending in a rolled, scalloped hem (the locks still cover the outer
    ends of her brows), a stuffed sweep over the top of her forehead as before, and two quilted side pillows sewn round
    the rim, which press the shell beneath them. Every edge is a rolled hem with thickness, not a cut sheet.
  - No contact: a large shadow bias removed the small shadows where parts meet. Shadows are finer and closer to what
    casts them, and a little open as under a soft key light (`light.js`; her shadow on the ground is unchanged); where
    pieces meet or seams go in, and on her face under the fringe, the plush is shaded. The daisy is cupped to the hair,
    seated on the hair's own surface (sampled round the seat, not the head's ellipsoid), pressed slightly into the pile,
    with a soft contact shadow; it sits so on every style. The ground's bounce under her face is softened like a bounce
    card, so her lower face is warm rather than muddy.
  - Her nose, ears and mittens are sewn pieces in their old size and place: the nose a slightly less proud stuffed bump,
    the ears with a hollow, a rim seam and a crease (they show with the other styles), the mittens with a seam where palm
    and back meet and a crease at the thumb. The body's dimensions, every garment and the app's mechanics are unchanged;
    the doll is 58.6k triangles (was 54.6k), within the tests' budget for the heaviest outfit.
  - Not changed: ACES tone mapping (a neutral tone mapper was tried; it shifted every approved garment's colour). Open:
    the other hairstyles share the cleaner plush and the seated daisy but not yet the sewn construction; garments that
    still use the unfiltered noise bump could take the filtered nap in their own pull requests.
- 12 October 2026, her head as stuffed fabric (the user, on the proof of concept above: keep the improved clothing;
  work only on the head, close up, with her original eye colour and expression; a softly shaped, smoothly contoured
  head, subtle fabric tension, surface texture at the right scale and embroidery integrated into the fabric; hair whose
  shapes and surfaces belong to a sewn plush toy; shown first under neutral light, then in the app's coloured light;
  and no more grain, stronger outlines or extra decorative seams to make up for it). Judged on studio renders of her
  head alone in neutral light (`scripts/render-doll.mjs` studio views: the app's renderer and lights in white and
  greys), then in the app. What was wrong, and the change:
  - Her eyes had gone lighter and greyer (iris #907162 against the original #715147 in the same neutral light, pupil
    #7f665d against #503d3c, lids #7b635a against #453837): the face panel laid the pile's peach sheen over the thread
    too. The thread now has its own sheen and roughness, those of the old floss, through a sheen map
    (`embroidery.js`), and measures as the original: iris #715147, pupil #503d3c, whites #eae8e1, lids #534342.
  - The satin read as embossed plastic: each fill rose from the fabric rather than from the stitching under it, which
    cut a groove round every iris and pupil, and its edges and seat drew a light rim and a dark line. Fills now lie on
    what they are stitched over, a thread's thickness or less, with a soft rolled edge, the faintest ripple across the
    threads and the pile pressed down softly beside them; the floss is mostly sunk into the pile.
  - Her face's nap was projected straight along z, so where her cheeks turn away it stretched into diagonal streaks,
    and it was drawn as fibres. Her head's fabric is now the pile seen as a whole, a soft unevenness about a millimetre
    across at her size and about a degree deep (`pileHeight()`, `SKIN_PILE` in `plush.js`), sampled on the head's surface
    in the face panel and laid on by position everywhere else (`triplanarPile()`), so it is one size on every piece.
  - Her head: the chin and jaw swell in smoothly instead of from creases; the fabric is drawn in a little round her
    sewn-on nose.
  - Her hair read as sculpted: grooves from a whorl over the whole crown, five seams down the back, strand-like streaks.
    Now the shell is one padded piece, smooth over the crown and back; the fringe ends in seven puffed scallops, each
    lock's padding held by a short line of stitching at the edge, and above them falls in a few broad soft folds the way
    it sweeps; the side pillows have no quilting, are a little fuller at the bottom where the stuffing settles, and
    their fabric is eased into the rim seam in small irregular puckers. The pile is the same, a little coarser, on every
    style, with a little more sheen at the turning edges; the colour is unchanged (its average tone at phone size is as
    in the proof of concept, about a tenth darker than main's).
  - Not changed: the clothing, the body, the app, her proportions, features and colours. Open: her hands and body
    still use the nap; under the side pillows' top edge the shell meets the pillow along a jagged line seen only from
    above, which the app never shows.
- 12 October 2026 (the user's request): on Dress her, today's three looks (Her pick, Bolder, Easier) are put away; she
  is dressed there piece by piece, and the look she wears carries over. The Today card starts with what she dressed
  for ("Dressed for 25° · this afternoon, in the sun"), in the card's quiet type with the temperature in Fraunces; the
  "too warm" / "too cool" buttons are outlined pills like Undo. See [DAILY_STYLING_PLAN.md](DAILY_STYLING_PLAN.md),
  "Decisions, 12 October 2026".
- 12 October 2026: her hands and body are sewn from her head's pile too (`plush(…, { pile: SKIN_PILE })` in
  `makeDoll`), which closes the open point about the nap above. The nap had drawn faint streaks along each piece's uv,
  crowding at the tip of a mitten; the difference shows only very close up, so nothing changes at phone size.
