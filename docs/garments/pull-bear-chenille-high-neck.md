# Wardrobe item: Pull & Bear grey chenille high-neck jumper

Authored 9 October 2026. Status: first version; approved: the user merged it, and merging means approved (their rule).

## Source and reference reading

The user sent one phone photo of the jumper laid flat on the floor, front up. They said it is Pull & Bear, in grey chenille, that they could not find it online, and to pay attention to the high collar. The photo is not stored in the repository.

Features read from the photo:

- Soft, cool grey chenille knit in rows of plump, velvety loops that catch the light unevenly.
- A ribbed stand-up (mock) collar with vertical ribs. Laid flat it flops over, showing its inside, so it stands up when worn.
- A boxy, cropped body, about as long as it is wide, with dropped shoulders.
- A deep ribbed hem band, about a sixth of the length, gathered a little so the body blouses over it.
- Long, relaxed sleeves gathered into long ribbed cuffs.
- All one colour; no print, label or visible seams.

Plain chenille measures about RGB 162, 163, 169 in the photo; the rib trims are much the same grey.

## Implementation

Catalog ID `pull-bear-grey-chenille-high-neck-v1` (slot `top`), built by `makeChenilleJumper()` in the new module `src/doll/chenille-jumper.js` from its catalog `build` spec (template `chenille-high-neck`). `makeOutfit` has one new dispatch line for it.

**Body:** boxy, cropped at her waist. The hem and the rib band follow the silver cable jumper, the other cropped jumper, which clears every bottom and the skirt. The band is gathered a little narrower than the body, which blouses over it.

**Sleeves:** relaxed set-in sleeves with long ribbed cuffs that gather at her wrist and ease over her hands, like the Tommy sweater's.

**Chenille:** drawn in code, not copied from the photo:

- a tile of knitted rows, each made of soft loops of uneven length, raised a little higher or lower, each catching the light differently;
- the same loops as a height map, so the rows stand up as pile;
- a velvety sheen over a matte base.

The rib trims use vertical columns of loops. Colour: the first renders came out far too pale, then a little warm. A yarn of `#787c88` renders at 163, 161, 166 on the front of the body, against the photo's 162, 163, 169.

**The high collar.** Her head sits low over her shoulders and hides a collar the width of her neck: the other high necks (the lilac top's mock neck, the half-zip dress's stand collar) are almost invisible under it. This collar is a ribbed tube that rises from her shoulders (1.845) to a rolled edge at 1.94. It flares outward as it rises, so it stands clear of her head all the way round and, at its top, stands in front of her chin. It reads like a turtleneck pulled up under her chin, and shows from the front and the sides; at the back her hair covers most of it.

**Under a jacket.** Every jacket's collar is about 0.12 to 0.13 from her centre line, and the high collar (0.21 to 0.26) would push through it. The jumper therefore also carries a narrow ribbed collar, as narrow as the other tops' high necks, which stays put away until she wears a jacket. Then the jacket wears the narrow one, as a real mock neck sits inside a jacket's collar.

This is the one change outside the new garment, a small layering fix in the outerwear code: `makeOuterwear()` shows the parts of the outfit marked `userData.underJacket: true` and hides those marked `false`. No other garment carries these marks, so nothing else changes: every outfit that `main` can build (410) was built on `main` and on this branch and compared, with no difference in geometry, materials or textures.

**Preset:** "Chenille high-neck study", with the Davinia jeans and the Gazelle Bold sneakers.

## Styling facts

Boxy and cropped at the waist; plain grey; a high stand-up collar and long sleeves. Warmth 3 of 4, inferred from the thick chenille, high collar and long sleeves, though it is cropped. Cool, dry days; chenille holds water and flattens when wet (inferred).

## Checks

- `npm test` passes, including a new `tests/chenille-jumper.test.js`, which checks:
  - the parts: body, hem band, sleeves, cuffs, the high collar and the narrow collar;
  - worn on its own, the high collar shows and the narrow one is put away;
  - the high collar rises above 1.935 and stands clear of her head all the way round. It fails for a collar the width of the other tops' necks, which would sit inside her head.
  - at its top, its front stands in front of her chin;
  - the chenille is cool grey with a pile (height) map and sheen;
  - the hem band ends at the cropped hem;
  - under every jacket, open or closed, the narrow collar is worn and stays as narrow as the other high necks;
  - no other top carries a collar to swap.

  The shared tests cover it too:
  - every top over every bottom and the skirt;
  - the outerwear coverage tests, which first failed on the high collar and led to the narrow collar;
  - the triangle budget for every study. The rib bands use fewer segments to stay within it.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, the side and the back in the study, and under the Marikoo windbreaker (closed) and the Desigual leather jacket (open). Compared with the photo. The user merged it.

## Known differences

- How the user wears it (length on the body, collar up or folded) is not known; it is built from a single flat lay.
- The collar stands wider than a real one would round a neck, so that it shows under her big head.
- The chenille is a drawn texture; the real pile's directional shading and fuzz at the edges are not modelled.
- The dropped shoulder seam is not drawn; the sleeves are set in like the other jumpers'.
