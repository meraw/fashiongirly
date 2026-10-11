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
   instead of combed strands. Ponytails get a gathered bunch above the tie and a tail that drops with gravity in a soft
   S and splits into a few tips. One molded hair material with a soft highlight band, not felt and not threads.
2. **Head second.** Keep the face untouched. Soften the ball with a touch of cheek and a small chin, and shape the back
   of the hair. The eyes, blush, smile and flower are her identity.
3. **Pose third, as a post-process.** Every garment is fitted to the fixed body, so moving limbs breaks the wardrobe.
   Apply one smooth deformation to the assembled doll and outfit together after fitting: a slight weight shift, one
   foot turned out, hands a little forward, a small head tilt. The clothes come along and no garment builder changes.
4. **Body last, if ever.** The torso's depth is the one expensive fix, because every top is fitted to it. It is a
   shared foundation under [AGENTS.md](../AGENTS.md): one owner, agreed with the user first.
5. **A material bible.** Flocked matte skin, molded hair, knits and cottons with sheen and a normal map, leather with
   clearcoat, metal fully reflective. The shoes set the detail level; the rest rises to meet them.

### The interface: hierarchy and a decoration diet

- Order of importance: the outfit in her world, then the three looks, then pieces and reasons, then a small weather
  chip, then controls and explanations.
- The outfit's name appears once, large, in Fraunces. Each of the three looks gets a short generated name so the tabs
  read as looks, not labels. The narration headline goes.
- One signature: the embroidered flower as brand mark and on the chosen look, rickrack once as the divider between
  scene and sheet, linen only on the sheet. Stitched borders, woven label pills, corner flowers, dashed swatch outlines
  and dotted dividers go. Three type sizes in total.
- Worth the effort later: render the day's three looks as small portraits of her, offscreen, once a day, instead of
  swatch strips. For Dress her, either make each slot a tappable chip that opens the wardrobe filtered to that slot,
  or fold it into Wardrobe.

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
> above the tie and a tail that falls with gravity in a soft S and splits into several tips; one molded hair material
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
