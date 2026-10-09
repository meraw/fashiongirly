# Wardrobe item: Desigual split floral shirt

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Added by the chat that has been doing shoes and outerwear (any chat can add any category).

## Source and reference reading

The user sent seven phone screenshots of an Amazon listing, attached directly; no link was fetched:
- three fronts on a model;
- a close front;
- a close-up with an arm raised;
- a front flat lay;
- the back on a model.

The neck label reads Desigual.

Features read from the images:

- A black cotton button-down shirt with a split print.
- Her right front, her right sleeve and the back below the yoke: a dense scatter of small flowers. There are red daisies, cream and yellow blossoms, blue buds and green sprigs, with plenty of black between them.
- Her left front, her left sleeve and the back yoke: plain black with large painted flowers. There are a red lily, a big red daisy with cream inner petals, cream blooms, blue and yellow flowers and green leaves.
- Every motif is edged in a light-blue outline.
- A point collar in the print, split the same way.
- Black buttons and tonal stitching. It is worn with the top button open on the model.
- Long sleeves with cuffs, and a curved shirttail hem.
- Colours measured on the flat lay: black about 23, 22, 26; red 198, 36, 45; blue 67, 129, 174; green 75, 153, 118; yellow 218, 167, 62; outlines 161, 192, 191.

## Implementation

Catalog ID `desigual-split-floral-shirt-v1` (slot `top`), on the button-down shirt template (`makeButtonShirt()` in `src/doll/shirts.js`). It uses the template's fitted body, open collar and buttons, like the spray floral shirt.

- **Per-piece prints (new, optional template settings):** a shirt's style can give its collar (`collarPrint`) and each sleeve (`sleevePrints`, left and right) their own print. Without them a shirt keeps one print everywhere, so the tie-dye and spray floral shirts render pixel-identical to `main`.
- **The print** is drawn in code in a new file, `src/doll/split-floral-print.js`, laid out by where each piece falls on her rather than tiled:
  - **body:** once round her, by height. Her right front and the back below the yoke carry the small flowers. Her left front and the back yoke are black, with large flowers placed as on the photos: leaves under the collar, the lily, the big red daisy low down, a blue flower at the hem, a cream bloom and a yellow flower at her left side, and leaves on the yoke near her left shoulder;
  - **sleeves:** her left sleeve is black with large flowers down its outer side; her right sleeve is small flowers all round;
  - **collar:** her left half is black with part of a large flower; her right half is small flowers.
- **Painting:**
  - Petals are drawn as soft-edged shapes, each first in the light-blue outline colour and then in its own colour.
  - The large flowers have slightly uneven petals and darker veins, so they read as painted rather than stamped.
  - Every canvas is drawn at twice its layout resolution so the edges stay smooth close up.
  - The small flowers are painted once on a seamless tile and copied wherever a piece carries them, so the whole print draws in under a second, once per session.
- **Fabric:** matte cotton poplin (a faint rib bump, low sheen), tonal black stitching, black buttons.
- **Study preset:** “Split floral shirt study”, with the light Tommy mom jeans and the cream 550s.
- **Styling notes** (catalog `styling`): warmth 2, inferred from an opaque woven shirt with long sleeves. It suits mild days, or a layer under a jacket. Black with red, cream, yellow, blue and green; bold and eclectic.

## Checks

- `npm test`: 85 passing. A new `tests/split-floral-shirt.test.js` checks, on the actual textures:
  - small flowers fill her right front and the back;
  - her left front stays mostly black, with large flowers;
  - the back yoke is plain black;
  - the sleeves have different prints: her left mostly black, her right all small flowers;
  - the collar is split;
  - the tie-dye shirt still shares one print over its body, sleeves and collar.
- `npm run build` succeeds.
- The tie-dye and spray floral shirts (also under the open leather jacket), and the default outfit, render pixel-identical to `main`.
- Rendered in headless Chromium (software WebGL):
  - front, back and both sides next to the photos;
  - a chest close-up next to the close front photo;
  - in the real app with its study preset.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The flowers are drawn in code to match the photos' colours, motif sizes and layout; they are not copied, and are simpler than the painted originals.
- Like the other button-downs, it is cropped at the waist with a straight hem; the curved shirttail and the cuffs are not modelled.
- Worn with the top button open, as on the model; the flat lay is fully buttoned.
