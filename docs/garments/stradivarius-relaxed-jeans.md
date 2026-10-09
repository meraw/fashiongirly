# Wardrobe item: Stradivarius relaxed jeans

Authored 8 October 2026. Status: the user said they look great; colour adjusted to a greyer shade on their request; approved: the user merged it, and merging means approved (their rule). Sixth piece from the user's wardrobe list, built on the shared jeans template with no new template options.

## Source and reference reading

The user sent four phone screenshots of a Zalando listing (Stradivarius, “Relaxed”, Petite line): a front close-up, front and back on a model, and a side close-up. Zalando blocks automated access, so the screenshots were the source. Photos are not stored in the repository.

Features read from the screenshots:

- Low to mid rise; relaxed, wide straight legs; full length, pooling on the floor.
- Very light bleached blue wash with soft whiskers at the hips; the fabric reads as almost uniform.
- Classic five-pocket front: scoop pockets, a coin pocket, copper rivets and a copper button; pale tonal stitching.
- Plain back patch pockets without decoration; a small beige patch on the back waistband.

The denim vest is styling.

## Implementation

Catalog ID `stradivarius-relaxed-v1` (slot `bottom`), built by `makeJeans()` from its `build` spec with the sewn crotch construction. Waistband 1.185 to 1.235 (like the Levi's); legs widen gently from 0.155 to 0.184 and rest on the shoes with a little stacking.

- Denim: a swatch from the front close-up (the left lower leg, inside its seams), processed with a narrow blur. Its variation is very small, as in the photos.
- Colour: photos measured RGB 199, 211, 220 (close-up), 205, 216, 225 (front) and 197, 214, 228 (back); target about 200, 212, 222. The first render was 206, 211, 215 (grey and warm under the studio light); with a bluer swatch the front render measures 200, 210, 219.
- Colour, user correction: the user said the pair looks great but their real jeans are closer to a greyer colour, and sent another photo of the same jeans (“D91 low wide-leg”), whose plain denim measures 208, 216, 224. The swatch was made lighter and greyer; the front render now measures 209, 214, 220, slightly greyer than that photo, as the user described.
- Stitching: first pale cream, which read as white piping on such light denim; now a tonal blue-grey (`#9eaab6`).

## Checks

- `npm test`: 24 passing. A new test checks the rivets, plain back pockets (no flap, arc stitching, tab or bars), the patch, full length down over the shoes and that the legs stay apart. The layering test covers this pair under every waist-covering top automatically.
- `npm run build` succeeds.
- Rendered in headless Chromium from four angles, without a top, and under every top and the skirt; compared side by side with the front and back photos. The user has not yet seen it.

## Known differences

- The back pockets are subtle, as on the real pair; their tonal stitching is the main thing that shows them.
- Fixed 9 October 2026 for every pair: the line where the hips met the legs is gone (see [the pleated linen trousers](pleated-linen-wide-trousers.md#the-line-where-the-hips-meet-the-legs)).
- The patch carries no lettering.
